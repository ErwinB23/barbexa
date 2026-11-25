import { useContext, useEffect, useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';
import type {
  AuthApplicationSource,
  SessionApplicationSource,
} from '../application/auth-gateway';

import { AuthError } from '../domain/auth-error';
import { AuthContext } from './auth-context';

const publicServerSnapshot = Object.freeze({ kind: 'resolving' } as const);

export function useAuth() {
  const application = useContext(AuthContext);
  if (!application) throw new AuthError('provider-unavailable');
  return useSyncExternalStore(
    application.subscribe,
    application.getSnapshot,
    () => publicServerSnapshot,
  );
}

type LifecycleSource = Pick<
  SessionApplicationSource,
  'restoreAndVerify' | 'invalidateSession' | 'setRefreshActive'
>;
interface LifecycleSurfaces {
  web?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  document?: Pick<
    Document,
    'addEventListener' | 'removeEventListener' | 'visibilityState'
  >;
  native?: {
    currentState: string | null | undefined;
    addEventListener(
      type: 'change',
      listener: (state: string) => void,
    ): { remove(): void };
  };
}
export function connectSessionLifecycle(
  source: LifecycleSource,
  platform: string,
  surfaces: LifecycleSurfaces,
): () => void {
  let active = true;
  let scheduled = false;
  let refreshing: boolean | undefined;
  const setRefresh = (enabled: boolean) => {
    if (refreshing === enabled) return;
    refreshing = enabled;
    source.setRefreshActive(enabled);
  };
  const verify = () => {
    if (!active || scheduled) return;
    scheduled = true;
    void Promise.resolve().then(() => {
      const shouldVerify = scheduled;
      scheduled = false;
      if (active && shouldVerify)
        void source.restoreAndVerify().catch(() => {});
    });
  };
  const pause = () => {
    scheduled = false;
    setRefresh(false);
  };
  const resume = () => {
    if (!active) return;
    setRefresh(true);
    verify();
  };
  if (platform === 'android' && surfaces.native) {
    let foreground = false;
    const update = (isActive: boolean) => {
      if (isActive && !foreground) resume();
      if (!isActive) pause();
      foreground = isActive;
    };
    const sub = surfaces.native.addEventListener('change', (state) => {
      update(state === 'active');
    });
    update(
      !['background', 'inactive'].includes(surfaces.native.currentState ?? ''),
    );
    return () => {
      active = false;
      sub.remove();
      source.setRefreshActive(false);
    };
  }
  const web = surfaces.web,
    doc = surfaces.document;
  if (web && doc) {
    const visible = () => {
      if (doc.visibilityState === 'visible') resume();
    };
    const visibility = () => {
      if (doc.visibilityState === 'visible') visible();
      else pause();
    };
    const pageHide = () => {
      pause();
      source.invalidateSession('lifecycle');
    };
    web.addEventListener('focus', visible);
    web.addEventListener('pageshow', visible);
    web.addEventListener('pagehide', pageHide);
    doc.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      active = false;
      web.removeEventListener('focus', visible);
      web.removeEventListener('pageshow', visible);
      web.removeEventListener('pagehide', pageHide);
      doc.removeEventListener('visibilitychange', visibility);
      source.setRefreshActive(false);
    };
  }
  verify();
  return () => {
    active = false;
    source.setRefreshActive(false);
  };
}
export function useSessionLifecycle(
  application: AuthApplicationSource,
  enabled: boolean,
) {
  useEffect(() => {
    if (
      !enabled ||
      !('restoreAndVerify' in application) ||
      !('invalidateSession' in application) ||
      !('setRefreshActive' in application)
    )
      return;
    const source = application as SessionApplicationSource;
    return connectSessionLifecycle(
      source,
      Platform.OS,
      Platform.OS === 'web' ? { web: window, document } : { native: AppState },
    );
  }, [application, enabled]);
}
