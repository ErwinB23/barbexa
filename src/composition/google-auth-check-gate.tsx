import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { AppState, Linking, Platform, View } from 'react-native';
import { usePathname, useRouter, useRootNavigationState } from 'expo-router';
import { Screen } from '../shared/ui/screen';
import { AppText } from '../shared/ui/app-text';
import { AppButton } from '../shared/ui/app-button';
import { NavigationFrame } from '../features/authentication/presentation/navigation-frame';
import {
  GoogleAuthCheckContent,
  GoogleAuthCheckSetupContent,
} from '../features/authentication/presentation/google-auth-check-screen';
import type { AuthReturnFence } from '../features/authentication/application/auth-return-fence';
import type { GoogleAuthCheckView } from '../features/authentication/application/google-auth-check';
import type { GoogleCheckActivation } from '../features/authentication/infrastructure/cloud-auth-check';
import { AuthError } from '../features/authentication/domain/auth-error';
import {
  createGoogleCheckActivationStore,
  createCloudGoogleCheck,
  verifyCloudGoogleConfiguration,
  resolveGoogleCheckProfile,
  type GoogleCheckProfile,
  type GoogleCheckActivationStore,
} from './google-auth-check-composition';

type LocalRenderer = (fence?: AuthReturnFence) => ReactNode;
export function GoogleAuthCheckGate({ children }: { children: LocalRenderer }) {
  // The released integration runtime owns its SDK, storage and callback. A saved
  // Auth-only diagnostic selection must never intercept that normal login.
  return __DEV__ &&
    process.env.EXPO_PUBLIC_APP_ENVIRONMENT !== 'cloud-integration' &&
    process.env.EXPO_PUBLIC_APP_ENVIRONMENT !== 'local-team-authority' ? (
    <DevelopmentGoogleGate>{children}</DevelopmentGoogleGate>
  ) : (
    children()
  );
}
function ReturnToLocal() {
  const router = useRouter(),
    navigation = useRootNavigationState();
  useEffect(() => {
    if (navigation?.key) router.replace('/');
  }, [router, navigation?.key]);
  return null;
}
function DevelopmentGoogleGate({ children }: { children: LocalRenderer }) {
  const path = usePathname();
  const [store] = useState(createGoogleCheckActivationStore);
  const [profile, setProfile] = useState<GoogleCheckProfile>({
    kind: 'loading',
  });
  const [leaving, setLeaving] = useState(false),
    [key, setKey] = useState(''),
    [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void store
      .read()
      .then((value) => {
        if (!active) return;
        setProfile((previous) =>
          resolveGoogleCheckProfile(previous, value, path),
        );
      })
      .catch(() => {
        if (active) setProfile({ kind: 'failed' });
      });
    return () => {
      active = false;
    };
  }, [path, store]);
  async function leave(activation?: GoogleCheckActivation) {
    if (activation) await store.write({ ...activation, phase: 'retired' });
    setLeaving(true);
    setProfile({ kind: 'local' });
    if (Platform.OS === 'web') window.location.assign('/');
  }
  async function configure() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await verifyCloudGoogleConfiguration(key.trim());
      const activation = {
        version: 1,
        publicKey: key.trim(),
        phase: 'active',
      } as const;
      await store.write(activation);
      setKey('');
      setProfile({ kind: 'active', activation });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }
  // Keep the same navigator mounted while entering the public-key form. Native
  // Expo Router reseeds its state when the root navigator unregisters, which
  // would change the pathname and immediately dismiss setup. Cloud has not been
  // selected yet; after selection, the LOCAL runtime is still fully unmounted.
  if (profile.kind === 'local' || profile.kind === 'setup')
    return (
      <View style={{ flex: 1 }}>
        <NavigationFrame blocked={profile.kind === 'setup'}>
          {children(store.fence)}
        </NavigationFrame>
        {profile.kind === 'setup' && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <GoogleAuthCheckSetupContent
              publicKey={key}
              onKey={setKey}
              busy={busy}
              error={failed}
              onVerify={() => void configure()}
              onLeave={() => void leave()}
            />
          </View>
        )}
        {leaving && <ReturnToLocal />}
      </View>
    );
  if (profile.kind === 'active' && profile.activation)
    return (
      <CloudCheckHost
        key={profile.activation.publicKey}
        activation={profile.activation}
        store={store}
        onLeave={() => leave(profile.activation)}
      />
    );
  return (
    <Screen>
      <AppText>
        {profile.kind === 'failed'
          ? 'No se pudo resolver el perfil de Auth de forma segura. No se conectó el runtime LOCAL.'
          : 'Resolviendo el perfil de Auth…'}
      </AppText>
      {profile.kind === 'failed' && (
        <AppButton
          label="Reintentar lectura del perfil"
          onPress={() => {
            void store
              .read()
              .then((value) =>
                setProfile((previous) =>
                  resolveGoogleCheckProfile(previous, value, path),
                ),
              )
              .catch(() => {});
          }}
        />
      )}
    </Screen>
  );
}
const empty: GoogleAuthCheckView = Object.freeze({
  kind: 'resolving',
  identityVerified: false,
  sessionVerified: false,
  callbackVerified: false,
  logoutConfirmed: null,
});
const noSubscription = () => () => {};
const emptySnapshot = () => empty;
function CloudCheckHost({
  activation,
  store,
  onLeave,
}: {
  activation: GoogleCheckActivation;
  store: GoogleCheckActivationStore;
  onLeave: () => Promise<void>;
}) {
  const [runtime, setRuntime] =
    useState<ReturnType<typeof createCloudGoogleCheck>>();
  const [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false),
    running = useRef(false);
  const state = useSyncExternalStore(
    runtime?.application.subscribe ?? noSubscription,
    runtime?.application.getSnapshot ?? emptySnapshot,
    emptySnapshot,
  );
  useEffect(() => {
    let alive = true;
    let current: ReturnType<typeof createCloudGoogleCheck> | undefined;
    let links: ReturnType<typeof Linking.addEventListener> | undefined,
      appState: ReturnType<typeof AppState.addEventListener> | undefined;
    void store
      .read()
      .then((selected) => {
        if (!alive) return;
        if (!selected || selected.publicKey !== activation.publicKey)
          throw new AuthError('persistence-failed');
        current = createCloudGoogleCheck(activation);
        setRuntime(current);
        const app = current.application;
        const accept = async (raw: string) => {
          if (!alive || !current) return;
          const consumed = await current.acceptRaw(raw);
          if (consumed) {
            await store.write({ ...activation, phase: 'active' });
            return;
          }
          if (activation.phase !== 'pending') await app.restore();
        };
        if (Platform.OS === 'web')
          void accept(window.location.href).catch(() =>
            app.reportFailure('link-invalid'),
          );
        else {
          links = Linking.addEventListener('url', (event) => {
            void accept(event.url).catch(() =>
              app.reportFailure('link-invalid'),
            );
          });
          void Linking.getInitialURL()
            .then((raw) => {
              if (raw) return accept(raw);
              if (activation.phase !== 'pending') return app.restore();
            })
            .catch(() => app.reportFailure('link-invalid'));
        }
        appState = AppState.addEventListener('change', (value) => {
          current?.setRefreshActive(value === 'active');
          if (value === 'active' && app.getSnapshot().kind !== 'oauth-pending')
            void app.restore();
        });
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
      links?.remove();
      appState?.remove();
      current?.dispose();
    };
  }, [activation, store]);
  async function run(action: 'google' | 'verify' | 'logout' | 'leave') {
    if (running.current || !runtime) return;
    running.current = true;
    setBusy(true);
    try {
      if (action === 'google') {
        await store.write({ ...activation, phase: 'pending' });
        await runtime.application.startGoogle();
      } else if (action === 'verify') await runtime.application.restore();
      else if (action === 'logout') {
        await runtime.application.logout();
        await store.write({ ...activation, phase: 'active' });
      } else if (runtime.application.getSnapshot().kind === 'signed-out')
        await onLeave();
    } catch (e) {
      runtime.application.reportFailure(
        e instanceof AuthError ? e.code : 'provider-unavailable',
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  if (failed)
    return (
      <Screen>
        <AppText>
          No se pudo preparar el SDK Cloud aislado. No se inició Google ni el
          runtime LOCAL.
        </AppText>
      </Screen>
    );
  return (
    <GoogleAuthCheckContent
      state={state}
      busy={busy || !runtime}
      onGoogle={() => void run('google')}
      onVerify={() => void run('verify')}
      onLogout={() => void run('logout')}
      onLeave={() => void run('leave')}
    />
  );
}
