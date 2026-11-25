import { BusinessError } from '../domain/values';
import type { SelfScheduleApplication } from './self-schedule';
import type { AdminInvitationsApplication } from './admin-invitations';
import type { OwnSummaryApplication } from './own-summary';
import type { ProfessionalProfileApplication } from './professional-profile';
import type { TeamAuthorityApplication } from './team-authority';
import type { BarbershopOperationGateway } from './operation-gateway';
import type {
  Service,
  Professional,
  Hours,
  ShopSetup,
  ScheduleException,
  StaffInvitation,
  BookingPolicies,
  PublicationState,
} from '../domain/types';
import type { OperationScope } from './operation-scope';
import type { ShopClosuresApplication } from './shop-closures';
export type { OperationScope } from './operation-scope';
export interface ManagementData {
  readonly capabilities: readonly {
    readonly barberId: string;
    readonly serviceId: string;
  }[];
  readonly services: readonly Service[];
  readonly professionals: readonly Professional[];
  readonly hours: readonly (Hours & { readonly barberId: string | null })[];
  readonly invitations: readonly StaffInvitation[];
  readonly settings:
    (ShopSetup & { readonly publicationState: PublicationState }) | null;
  readonly members: readonly {
    readonly userId: string;
    readonly role: 'administrator' | 'barber';
    readonly status: 'active' | 'inactive';
  }[];
}
export interface OperationManagementGateway extends BarbershopOperationGateway {
  getManagement(shop: string, includeTeam?: boolean): Promise<ManagementData>;
  listOwnInvitations(): Promise<readonly StaffInvitation[]>;
}
export interface ShopNameGateway {
  get(
    id: string,
  ): Promise<{ readonly id: string; readonly name: string } | null>;
  rename(
    id: string,
    name: string,
  ): Promise<{ readonly id: string; readonly name: string }>;
}
export function createOperationApplication(deps: {
  shopClosures?: ShopClosuresApplication;
  shopNames?: ShopNameGateway;
  authority?: TeamAuthorityApplication;
  selfSchedule?: SelfScheduleApplication;
  adminInvitations?: AdminInvitationsApplication;
  ownSummary?: OwnSummaryApplication;
  professionalProfile?: ProfessionalProfileApplication;
  selfProfessionalEnabled?: boolean;
  gateway: OperationManagementGateway;
  scope: () => OperationScope | null;
  createShop: (
    name: string,
  ) => Promise<{ readonly id: string; readonly name: string }>;
}) {
  const pending = new Set<string>();
  const reads = new Map<string, Promise<unknown>>();
  let revision = 0;
  const key = (s: OperationScope | null) =>
    s
      ? `${s.userId}:${s.generation}:${s.barbershopId ?? ''}:${s.role ?? ''}`
      : '';
  async function run<T>(
    operation: string,
    admin: boolean,
    work: (scope: OperationScope) => Promise<T>,
    mode: 'write' | 'read' = 'write',
  ): Promise<T> {
    const scope = deps.scope();
    if (!scope) throw new BusinessError('UNAUTHENTICATED');
    if (admin && (!scope.barbershopId || scope.role !== 'administrator'))
      throw new BusinessError('FORBIDDEN');
    const stamp = key(scope),
      lock = stamp + ':' + operation;
    const readKey = `${lock}:${revision}`;
    if (mode === 'read') {
      const existing = reads.get(readKey);
      if (existing) return existing as Promise<T>;
    } else {
      if (pending.has(lock)) throw new BusinessError('CONFLICT');
      pending.add(lock);
      // A reload must not reuse a query started before or during a mutation.
      revision++;
    }
    const request = (async () => {
      try {
        const result = await work(scope);
        if (key(deps.scope()) !== stamp) throw new BusinessError('FORBIDDEN');
        return result;
      } catch (error) {
        if (
          // A rejected response from an old context must not clear current authority.
          key(deps.scope()) === stamp &&
          error instanceof BusinessError &&
          ['FORBIDDEN', 'UNAUTHENTICATED'].includes(error.code)
        )
          deps.authority?.invalidate();
        throw error;
      } finally {
        if (mode === 'write') {
          pending.delete(lock);
          revision++;
        }
      }
    })();
    if (mode === 'read') {
      reads.set(readKey, request);
      const clear = () => {
        reads.delete(readKey);
      };
      // Share only in-flight queries, never cached results or rejected promises.
      void request.then(clear, clear);
    }
    return request;
  }
  const shop = (scope: OperationScope) => {
    if (!scope.barbershopId) throw new BusinessError('FORBIDDEN');
    return scope.barbershopId;
  };
  const ownProfessional = async (
    scope: OperationScope,
    operation: () => Promise<Professional>,
  ) => {
    if (
      !deps.selfProfessionalEnabled ||
      !scope.barbershopId ||
      !['administrator', 'barber'].includes(scope.role ?? '')
    )
      throw new BusinessError('FORBIDDEN');
    const profile = await operation();
    if (
      profile.userId !== scope.userId ||
      profile.barbershopId !== scope.barbershopId ||
      !profile.active
    )
      throw new BusinessError('FORBIDDEN');
    return profile;
  };
  const selectedShop = async (scope: OperationScope, name?: string) => {
    if (!deps.shopNames) throw new BusinessError('NOT_AVAILABLE');
    const id = shop(scope);
    const result =
      name === undefined
        ? await deps.shopNames.get(id)
        : await deps.shopNames.rename(id, name);
    if (!result) throw new BusinessError('NOT_AVAILABLE');
    if (
      result.id !== id ||
      typeof result.name !== 'string' ||
      !result.name.trim()
    )
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    return result;
  };
  return {
    shopClosures: deps.shopClosures,
    getSelectedShop: () =>
      run('shop-name-read', true, (s) => selectedShop(s), 'read'),
    renameSelectedShop: (name: string) =>
      run('write', true, (s) => {
        if (typeof name !== 'string' || !name.trim())
          throw new BusinessError('INVALID_INPUT');
        return selectedShop(s, name.trim());
      }),
    authority: deps.authority,
    adminInvitations: deps.adminInvitations,
    ownSummary: deps.ownSummary,
    professionalProfile: deps.professionalProfile,
    selfSchedule: deps.selfSchedule,
    canEditOwnProfessional: () =>
      deps.selfProfessionalEnabled === true && !!deps.scope()?.barbershopId,
    getOwnProfessional: () =>
      run(
        'own-profile-read',
        false,
        (s) =>
          ownProfessional(s, () => deps.gateway.getOwnProfessional(shop(s))),
        'read',
      ),
    updateOwnProfessional: (professionalName: string) =>
      run('write', false, (s) => {
        if (typeof professionalName !== 'string' || !professionalName.trim())
          throw new BusinessError('INVALID_INPUT');
        return ownProfessional(s, () =>
          deps.gateway.updateOwnProfessional(shop(s), professionalName.trim()),
        );
      }),
    scopeKey: () => key(deps.scope()),
    getScope: deps.scope,
    createShop: (name: string) =>
      run('create', false, () => {
        if (!name.trim()) throw new BusinessError('INVALID_INPUT');
        return deps.createShop(name.trim());
      }),
    load: () =>
      run(
        'load',
        true,
        async (s) => {
          if (!deps.authority) return deps.gateway.getManagement(shop(s));
          await deps.authority.read();
          const a = deps.authority.getSnapshot();
          if (
            a.phase !== 'ready' ||
            a.scopeKey !== deps.authority.scopeKey() ||
            !a.value?.permissions.editServices
          )
            throw new BusinessError('FORBIDDEN');
          return deps.gateway.getManagement(
            shop(s),
            a.value.permissions.manageTeam,
          );
        },
        'read',
      ),
    listOwnInvitations: () =>
      run(
        'invitations',
        false,
        () => deps.gateway.listOwnInvitations(),
        'read',
      ),
    configure: (input: Omit<ShopSetup, 'barbershopId'>) =>
      run('write', true, (s) =>
        deps.gateway.configureShop({ ...input, barbershopId: shop(s) }),
      ),
    setPublication: (state: PublicationState) =>
      run('write', true, (s) => deps.gateway.setPublication(shop(s), state)),
    upsertService: (
      input: Omit<Service, 'barbershopId' | 'id'> & { id?: string },
    ) =>
      run('write', true, (s) =>
        deps.gateway.upsertService({ ...input, barbershopId: shop(s) }),
      ),
    setProfessional: (
      input: Omit<Professional, 'barbershopId' | 'id'> & { id?: string },
    ) =>
      run('write', true, (s) =>
        deps.gateway.setProfessional({ ...input, barbershopId: shop(s) }),
      ),
    setCapabilities: (barberId: string, serviceIds: readonly string[]) =>
      run('write', true, (s) =>
        deps.gateway.setCapabilities(shop(s), barberId, serviceIds),
      ),
    setHours: (barberId: string | null, hours: readonly Hours[]) =>
      run('write', true, (s) =>
        barberId
          ? deps.gateway.setBarberHours(shop(s), barberId, hours)
          : deps.gateway.setShopHours(shop(s), hours),
      ),
    setException: (input: Omit<ScheduleException, 'barbershopId'>) =>
      run('write', true, (s) =>
        deps.gateway.setException({ ...input, barbershopId: shop(s) }),
      ),
    invite: (email: string) =>
      run('write', true, (s) =>
        deps.gateway.inviteExistingUser(shop(s), email),
      ),
    respondInvitation: (id: string, decision: 'accept' | 'reject') =>
      run('write', false, () => deps.gateway.respondInvitation(id, decision)),
    remindInvitation: (id: string) =>
      run('write', true, (s) => {
        if (!deps.gateway.remindInvitation)
          throw new BusinessError('NOT_AVAILABLE');
        return deps.gateway.remindInvitation(shop(s), id);
      }),
    cancelInvitation: (id: string) =>
      run('write', true, () => deps.gateway.cancelInvitation(id)),
  };
}
export type OperationApplication = ReturnType<
  typeof createOperationApplication
>;
export type { BookingPolicies };
