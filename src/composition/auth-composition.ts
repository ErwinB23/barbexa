import type { AuthApplicationSource } from '../features/authentication/application/auth-gateway';
import type { SessionView } from '../features/authentication/domain/session-state';
import {
  createSupabaseAuthAdapter,
  validateAuthTarget,
  type AuthAdapterOptions,
} from '../features/authentication/infrastructure/supabase-auth-adapter';
import type { SessionStorage } from '../features/authentication/infrastructure/session-storage-core';
import {
  createPlatformStorage,
  prepareSdkRuntime,
  watchPlatformSession,
} from './auth-platform';
import { createTenantFoundation } from './tenant-foundation-composition';
import { developmentTransportOrigin } from './development-transport';
import { createSessionCoordinator } from '../features/authentication/application/session-coordinator';
import { AuthError } from '../features/authentication/domain/auth-error';
import { FoundationError } from '../features/tenant-foundation/domain/types';
import { createTenantContext } from '../features/authentication/application/tenant-context';
import { createBarbershopOperation } from './barbershop-operation-composition';
import { createReservations } from './reservations-composition';
import { createCatalogCache } from '../features/barbershop-operation/infrastructure/catalog-cache';
import { assertCloudBusinessBackend } from './registration-environment';
import { createPinnedProjectFetch } from '../features/authentication/infrastructure/project-transport';
import { createShopNameGateway } from './shop-name-gateway';
import { createInbox } from '../features/notifications/application/inbox';
import { createInboxHttp } from '../features/notifications/infrastructure/inbox-http';
import { createInboxSeenStorage } from '../features/notifications/infrastructure/inbox-seen-storage';

export interface AuthFoundationOptions {
  readonly teamAuthorityEnabled?: boolean;
  readonly cloudBackendRevision?: string;
  readonly adminInvitationsEnabled?: boolean;
  readonly adminInvitationDelivery?: 'email' | 'in-app';
  readonly professionalSummaryEnabled?: boolean;
  readonly selfScheduleEnabled?: boolean;
  readonly selfProfessionalEnabled?: boolean;
  readonly googleEnabled?: boolean;
  readonly openOAuthUrl?: (url: string) => Promise<void>;
  readonly careEnabled?: boolean;
  readonly rescheduleEnabled?: boolean;
  readonly baseUrl: string;
  readonly publicKey: string;
  readonly environment: string;
  readonly project: string;
  readonly storage?: SessionStorage;
  readonly clientFactory?: AuthAdapterOptions['clientFactory'];
  readonly fetcher?: typeof fetch;
  readonly developmentHttpOrigin?: string;
  readonly confirmationRedirectUrl?: string;
  readonly recoveryRedirectUrl?: string;
}

export function createAuthFoundation(options: AuthFoundationOptions) {
  const integrated =
    options.environment === 'cloud-integration' ||
    options.baseUrl === 'https://vuoncrtkkkquvddunrxx.supabase.co';
  if (integrated) assertCloudBusinessBackend(options);
  const localTeam = options.environment === 'local-team-authority';
  if (
    localTeam &&
    (options.project !== 'app-barberia-002-local' ||
      options.baseUrl !== 'http://127.0.0.1:54421')
  )
    throw Error('LOCAL_TEAM_CONFIGURATION_MISSING');
  const fetcher =
    integrated || localTeam
      ? createPinnedProjectFetch(options.baseUrl, options.fetcher, localTeam)
      : options.fetcher;
  const developmentHttpOrigin = developmentTransportOrigin(
    options.developmentHttpOrigin,
  );
  validateAuthTarget(options.baseUrl, options.publicKey, developmentHttpOrigin);
  // Valida namespace incluso si el storage es inyectado; no realiza lectura/escritura aquí.
  const platformStorage = createPlatformStorage(options);
  const storage = options.storage ?? platformStorage;
  prepareSdkRuntime();
  const auth = createSupabaseAuthAdapter({
    ...options,
    authFetch: integrated || localTeam ? fetcher : undefined,
    developmentHttpOrigin,
    storage,
    // Aísla también BroadcastChannel del SDK, no solo el almacenamiento físico.
    storageKey: `auth-${options.environment.length}-${options.environment}-${options.project.length}-${options.project}`,
  });
  let snapshot: SessionView = Object.freeze({ kind: 'resolving' });
  const listeners = new Set<() => void>();
  const off = auth.subscribe((event) => {
    // T008 no autentica ni promueve ready: los casos de uso futuros resolverán identidad/perfil.
    snapshot = Object.freeze({
      kind:
        event.kind === 'signed-out'
          ? 'signed-out'
          : event.kind === 'recovery'
            ? 'recovery'
            : 'resolving',
    });
    for (const listener of listeners) listener();
  });
  const application: AuthApplicationSource = Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  });
  const tenant = createTenantFoundation({
    baseUrl: options.baseUrl,
    publicKey: options.publicKey,
    getAccessToken: auth.getAccessToken,
    fetcher,
    developmentHttpOrigin,
  });
  let registration: ReturnType<typeof createSessionCoordinator> | undefined;
  const notifications = createInbox({
    viewer: () => {
      const state = registration?.getSnapshot();
      return state?.kind === 'ready' ? state.identity.userId : '';
    },
    seen: createInboxSeenStorage(() =>
      typeof window === 'undefined' ? null : window.sessionStorage,
    ),
    scope: () => {
      const s = registration?.getSnapshot();
      return s?.kind === 'ready'
        ? `${s.identity.userId}:${s.generation}:${s.context.kind === 'selected' ? s.context.context.membershipId : s.context.kind}`
        : '';
    },
    gateway: createInboxHttp({
      baseUrl: options.baseUrl,
      publicKey: options.publicKey,
      getAccessToken: auth.getAccessToken,
      fetcher,
    }),
  });
  let stopWatching: (() => void) | undefined;
  let stopBookingScope: (() => void) | undefined;
  const catalogCache = createCatalogCache();
  const booking = createReservations({
    ...options,
    fetcher,
    catalogCache,
    careEnabled: options.careEnabled,
    rescheduleEnabled: options.rescheduleEnabled,
    developmentHttpOrigin,
    getAccessToken: auth.getAccessToken,
    expectedUser: () => {
      const s = registration?.getSnapshot();
      return s?.kind === 'ready' ? s.identity.userId : null;
    },
    agendaScope: () => {
      const s = registration?.getSnapshot();
      if (s?.kind !== 'ready' || s.context.kind !== 'selected') return null;
      return {
        userId: s.identity.userId,
        generation: s.generation,
        barbershopId: s.context.context.barbershopId,
        role: s.context.context.role,
      };
    },
    scope: () => {
      const s = registration?.getSnapshot();
      if (s?.kind !== 'ready') return null;
      return {
        userId: s.identity.userId,
        generation: s.generation,
        contextKey:
          s.context.kind === 'selected'
            ? `${s.context.context.barbershopId}:${s.context.context.role}`
            : s.context.kind,
      };
    },
  });
  const operation = createBarbershopOperation({
    shopNames: createShopNameGateway(tenant, catalogCache.invalidate),
    onAcceptedInvitation: async () => {
      await registration?.refreshContext();
    },
    ...options,
    fetcher,
    catalogCache,
    developmentHttpOrigin,
    getAccessToken: auth.getAccessToken,
    expectedUser: () => {
      const state = registration?.getSnapshot();
      return state?.kind === 'ready' ? state.identity.userId : null;
    },
    scope: () => {
      const state = registration?.getSnapshot();
      if (state?.kind !== 'ready') return null;
      const selected =
        state.context.kind === 'selected' ? state.context.context : null;
      return {
        userId: state.identity.userId,
        generation: state.generation,
        ...(selected
          ? { barbershopId: selected.barbershopId, role: selected.role }
          : {}),
      };
    },
    createShop: async (name) => {
      const created = await tenant.createOwnBarbershop({ name });
      return created.barbershop;
    },
  });
  async function ownProfileOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const code = error instanceof FoundationError ? error.code : undefined;
      throw new AuthError(
        code === 'DEPENDENCY_UNAVAILABLE'
          ? 'network-unavailable'
          : code === 'INVALID_INPUT'
            ? 'invalid-input'
            : code === 'UNAUTHENTICATED'
              ? 'credentials-rejected'
              : 'provider-unavailable',
      );
    }
  }
  return {
    booking,
    notifications,
    operation,
    application,
    // T013 will mount this source/actions in the provider; no route or screen is added here.
    createRegistrationApplication() {
      registration ??= createSessionCoordinator({
        startRestoreDeadline: (expire) => {
          const timer = setTimeout(expire, 15000);
          return () => clearTimeout(timer);
        },
        googleEnabled: options.googleEnabled === true,
        recoveryReturnTarget: options.recoveryRedirectUrl,
        auth,
        context: createTenantContext({
          listOwnMemberships: () =>
            ownProfileOperation(tenant.listOwnMemberships),
          getBarbershop: (id) =>
            ownProfileOperation(() => tenant.getBarbershop(id)),
          preference: {
            get: (userId) => storage.getItem(`context-${userId}`),
            set: (userId, id) => storage.setItem(`context-${userId}`, id),
            remove: (userId) => storage.removeItem(`context-${userId}`),
          },
        }),
        profiles: {
          getOwnProfile: () => ownProfileOperation(tenant.getOwnProfile),
          ensureOwnProfile: (input) =>
            ownProfileOperation(() => tenant.ensureOwnProfile(input)),
          updateOwnProfile: (input) =>
            ownProfileOperation(() => tenant.updateOwnProfile(input)),
        },
      });
      stopBookingScope ??= registration.subscribe(() => {
        notifications.invalidateScope();
        const s = registration!.getSnapshot();
        catalogCache.setScope(
          s.kind === 'ready'
            ? `${s.identity.userId}:${s.generation}:${s.context.kind === 'selected' ? `${s.context.context.barbershopId}:${s.context.context.role}` : s.context.kind}`
            : s.kind,
        );
        booking.invalidateScope();
      });
      booking.invalidateScope();
      return registration;
    },
    watchSessionChanges(listener: (change: 'renewed' | 'invalidated') => void) {
      stopWatching?.();
      stopWatching = watchPlatformSession(options, listener);
      return () => {
        stopWatching?.();
        stopWatching = undefined;
      };
    },
    tenant: Object.freeze({
      getOwnProfile: tenant.getOwnProfile,
      ensureOwnProfile: tenant.ensureOwnProfile,
      listOwnMemberships: tenant.listOwnMemberships,
      getBarbershop: tenant.getBarbershop,
    }),
    dispose() {
      notifications.invalidate();
      catalogCache.dispose();
      stopBookingScope?.();
      booking.dispose();
      stopWatching?.();
      registration?.dispose();
      off();
      listeners.clear();
      auth.dispose();
    },
  };
}
