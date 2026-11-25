import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { Linking, Platform, View } from 'react-native';
import Constants from 'expo-constants';
import type { SessionApplicationSource } from '../features/authentication/application/auth-gateway';
import {
  AuthError,
  type AuthFailure,
} from '../features/authentication/domain/auth-error';
import { AccountMembershipsContext } from '../features/authentication/presentation/account-membership-count';
import { RegistrationContext } from '../features/authentication/presentation/auth-context';
import { parseAuthLink as parseNative } from '../features/authentication/infrastructure/auth-links.native';
import { captureAuthLink as captureWeb } from '../features/authentication/infrastructure/auth-links.web';
import { createAuthFoundation } from './auth-composition';
import { registrationEnvironment } from './registration-environment';
import { AuthProvider } from './auth-provider';
import { OperationContext } from '../features/barbershop-operation/presentation/operation-context';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { InboxContext } from '../features/notifications/presentation/inbox-context';
import { openOAuthUrl } from './oauth-browser';
import type { AuthReturnFence } from '../features/authentication/application/auth-return-fence';

const unavailable = async () => {
  throw new AuthError('provider-unavailable');
};
const initialSnapshot = Object.freeze({ kind: 'resolving' } as const);
const failureSnapshot = Object.freeze({
  kind: 'retryable-error',
  error: 'provider-unavailable',
} as const);
const initial: SessionApplicationSource = {
  signInWithGoogle: unavailable,
  cancelGoogle: unavailable,
  canUseGoogle: () => false,
  getSnapshot: () => initialSnapshot,
  subscribe: () => () => {},
  register: unavailable,
  completeCallback: unavailable,
  retryProfile: unavailable,
  updateOwnProfile: unavailable,
  canRetryProfile: () => false,
  signIn: unavailable,
  requestRecovery: unavailable,
  setRecoveredPassword: unavailable,
  signOutCurrent: unavailable,
  restoreAndVerify: unavailable,
  invalidateSession: () => {},
  setRefreshActive: () => {},
  selectContext: unavailable,
  refreshContext: unavailable,
  chooseContext: unavailable,
};
const failure: SessionApplicationSource = {
  ...initial,
  getSnapshot: () => failureSnapshot,
};

interface RuntimeSnapshot {
  readonly accountMemberships?: ReturnType<
    typeof createAuthFoundation
  >['tenant']['listOwnMemberships'];
  readonly notifications?: ReturnType<
    typeof createAuthFoundation
  >['notifications'];
  readonly capturedReturn?: '/auth/callback' | '/auth/reset-password' | null;
  readonly booking?: ReturnType<typeof createAuthFoundation>['booking'];
  readonly operation?: ReturnType<typeof createAuthFoundation>['operation'];
  readonly application: SessionApplicationSource;
  readonly configured: boolean;
  readonly callbackError: AuthFailure | null;
}
const initialRuntime: RuntimeSnapshot = Object.freeze({
  application: initial,
  configured: false,
  callbackError: null,
});

// The SDK is an external resource. Creating this store during render has no effects;
// only start() mounts it, and every mount owns/disposes its client and link listener.
export function createRegistrationRuntime(
  returnFence?: AuthReturnFence,
  compose = createAuthFoundation,
) {
  let snapshot = initialRuntime;
  const listeners = new Set<() => void>();
  function publish(next: typeof initialRuntime) {
    snapshot = Object.freeze(next);
    for (const listener of listeners) listener();
  }
  function setCallbackError(error: AuthFailure | null) {
    publish({ ...snapshot, callbackError: error });
  }
  function start() {
    let active = true;
    let foundation: ReturnType<typeof createAuthFoundation> | undefined;
    let subscription: ReturnType<typeof Linking.addEventListener> | undefined;
    try {
      const local = __DEV__;
      const environment = local
        ? (process.env.EXPO_PUBLIC_APP_ENVIRONMENT ?? 'local')
        : 'production';
      const cloud = environment === 'cloud-integration';
      const localTeam = environment === 'local-team-authority';
      // Administration is already released for the validated Cloud backend.
      // Missing per-process launch flags must not hide it on the next login.
      // Explicit false remains an operational disable, never a permission grant.
      const releasedCloud = cloud || environment === 'production';
      const cloudAuthority =
        releasedCloud &&
        process.env.EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY !== 'false';
      const config = registrationEnvironment({
        development: local,
        environment,
        platform: Platform.OS,
        publicKey: cloud
          ? process.env.EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY
          : localTeam
            ? process.env.EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY
            : process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        metroHostUri: Constants.expoConfig?.hostUri,
        webOrigin: Platform.OS === 'web' ? window.location.origin : undefined,
        apiUrl: cloud
          ? process.env.EXPO_PUBLIC_CLOUD_SUPABASE_URL
          : localTeam
            ? process.env.EXPO_PUBLIC_TEAM_LOCAL_URL
            : process.env.EXPO_PUBLIC_SUPABASE_URL,
        cloudBackendRevision: process.env.EXPO_PUBLIC_CLOUD_BACKEND_REVISION,
        publicWebOrigin: process.env.EXPO_PUBLIC_WEB_ORIGIN,
      });
      foundation = compose({
        ...config,
        googleEnabled:
          !localTeam &&
          (cloud || process.env.EXPO_PUBLIC_ENABLE_GOOGLE === 'true'),
        teamAuthorityEnabled: localTeam || cloudAuthority,
        adminInvitationDelivery: cloudAuthority ? 'in-app' : 'email',
        adminInvitationsEnabled:
          localTeam ||
          (releasedCloud
            ? cloudAuthority &&
              process.env.EXPO_PUBLIC_CLOUD_ENABLE_ADMIN_INVITATIONS !== 'false'
            : process.env.EXPO_PUBLIC_ENABLE_ADMIN_INVITATIONS === 'true'),
        professionalSummaryEnabled:
          localTeam ||
          cloud ||
          process.env.EXPO_PUBLIC_ENABLE_PROFESSIONAL_SUMMARY === 'true',
        selfProfessionalEnabled:
          localTeam ||
          cloud ||
          process.env.EXPO_PUBLIC_ENABLE_SELF_PROFESSIONAL === 'true',
        selfScheduleEnabled:
          localTeam ||
          cloud ||
          process.env.EXPO_PUBLIC_ENABLE_SELF_SCHEDULE === 'true',
        openOAuthUrl,
        careEnabled:
          config.environment === 'local' ||
          localTeam ||
          cloud ||
          process.env.EXPO_PUBLIC_ENABLE_CARE === 'true',
        rescheduleEnabled:
          localTeam ||
          cloud ||
          process.env.EXPO_PUBLIC_ENABLE_RESCHEDULE === 'true',
        confirmationRedirectUrl: config.callbackUrl,
        recoveryRedirectUrl: config.recoveryUrl,
      });
      const ownMemberships = foundation.tenant.listOwnMemberships;
      const source = foundation.createRegistrationApplication();
      foundation.watchSessionChanges?.((change) => {
        if (change !== 'renewed') source.invalidateSession();
        void source.restoreAndVerify().catch(() => {});
      });
      publish({
        capturedReturn: null,
        notifications: foundation.notifications,
        accountMemberships: async () => {
          const before = source.getSnapshot();
          if (before.kind !== 'ready')
            throw new AuthError('credentials-rejected');
          const rows = await ownMemberships();
          const after = source.getSnapshot();
          if (
            after.kind !== 'ready' ||
            before.identity.userId !== after.identity.userId ||
            before.generation !== after.generation
          )
            throw new AuthError('credentials-rejected');
          return rows;
        },
        operation: foundation.operation,
        booking: foundation.booking,
        application: {
          ...source,
          register: async (input) => {
            setCallbackError(null);
            await returnFence?.localFlowStarted();
            await source.register(input);
          },
          signIn: async (input) => {
            setCallbackError(null);
            await returnFence?.localFlowStarted();
            await source.signIn(input);
          },
          signInWithGoogle: async () => {
            setCallbackError(null);
            await returnFence?.localFlowStarted();
            await source.signInWithGoogle();
          },
          cancelGoogle: async () => {
            setCallbackError(null);
            await source.cancelGoogle();
          },
          requestRecovery: async (input) => {
            setCallbackError(null);
            await returnFence?.localFlowStarted();
            await source.requestRecovery(input);
          },
          signOutCurrent: async () => {
            setCallbackError(null);
            return source.signOutCurrent();
          },
        },
        configured: true,
        callbackError: null,
      });
      const targets = {
        callbackUrl: config.callbackUrl,
        recoveryUrl: config.recoveryUrl,
      };
      async function accept(raw: string) {
        if (!active) return;
        // One consumer for both configured PKCE returns; never log/retain the URL.
        let url: URL;
        try {
          url = new URL(raw);
        } catch {
          return;
        }
        if (
          ![config.callbackUrl, config.recoveryUrl].some((target) => {
            const callback = new URL(target);
            return (
              url.protocol === callback.protocol &&
              url.host === callback.host &&
              url.pathname === callback.pathname
            );
          })
        )
          return;
        try {
          if (returnFence && !(await returnFence.allow())) return;
        } catch {
          if (active) setCallbackError('persistence-failed');
          return;
        }
        if (!active) return;
        // A clean recovery URL after F5 restores the persisted restricted state;
        // there is no code to exchange again.
        if (
          !url.search &&
          !url.hash &&
          url.pathname.endsWith('/reset-password')
        )
          return;
        setCallbackError(null);
        try {
          const input = (() => {
            try {
              return Platform.OS === 'web'
                ? captureWeb(raw, targets, (path) =>
                    window.history.replaceState(window.history.state, '', path),
                  )
                : parseNative(raw, targets);
            } finally {
              // Only the canonical path is public. Codes/URL stay out of React.
              if (active)
                publish({
                  ...snapshot,
                  capturedReturn: url.pathname.endsWith('/reset-password')
                    ? '/auth/reset-password'
                    : '/auth/callback',
                });
            }
          })();
          await source.completeCallback(input);
        } catch (e) {
          if (
            e instanceof AuthError &&
            e.code === 'oauth-cancelled' &&
            source.getSnapshot().kind === 'oauth-pending'
          ) {
            try {
              await source.cancelGoogle();
            } catch {
              if (active) setCallbackError('persistence-failed');
              return;
            }
          }
          if (active)
            setCallbackError(e instanceof AuthError ? e.code : 'link-invalid');
        }
      }
      if (Platform.OS === 'web') {
        void accept(window.location.href);
      } else {
        subscription = Linking.addEventListener('url', (event) => {
          void accept(event.url);
        });
        void Linking.getInitialURL()
          .then((url) => {
            if (url) void accept(url);
          })
          .catch(() => {
            if (active) setCallbackError('link-invalid');
          });
      }
    } catch {
      foundation?.dispose();
      publish({ application: failure, configured: false, callbackError: null });
    }
    return () => {
      active = false;
      subscription?.remove();
      foundation?.dispose();
    };
  }
  return {
    start,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function RegistrationRuntimeProvider({
  children,
  returnFence,
}: {
  children: ReactNode;
  returnFence?: AuthReturnFence;
}) {
  // Fast Refresh retains useState values, including controllers from older code.
  // A changed composition must dispose/rebuild the runtime and all its adapters.
  const compose = createAuthFoundation;
  const runtime = useMemo(
    () => createRegistrationRuntime(returnFence, compose),
    [returnFence, compose],
  );
  const {
    application,
    configured,
    callbackError,
    operation,
    booking,
    notifications,
    capturedReturn,
    accountMemberships,
  } = useSyncExternalStore(
    runtime.subscribe,
    runtime.getSnapshot,
    () => initialRuntime,
  );
  useEffect(() => runtime.start(), [runtime]);
  return (
    <AuthProvider application={application} active={configured}>
      <RegistrationContext.Provider
        value={{ application, configured, callbackError, capturedReturn }}
      >
        <OperationContext.Provider value={operation ?? null}>
          <BookingContext.Provider value={booking ?? null}>
            <InboxContext.Provider value={notifications ?? null}>
              <AccountMembershipsContext.Provider
                value={accountMemberships ?? null}
              >
                <View style={{ flex: 1 }}>{children}</View>
              </AccountMembershipsContext.Provider>
            </InboxContext.Provider>
          </BookingContext.Provider>
        </OperationContext.Provider>
      </RegistrationContext.Provider>
    </AuthProvider>
  );
}
