import { BusinessError, type BusinessErrorCode } from '../domain/values.ts';
import type {
  VerifiedActor,
  StaffInvitation,
  Service,
  Professional,
} from '../domain/types.ts';
import type { OperationGateway } from '../application/operation.ts';
import type { SelfScheduleGateway } from '../application/self-schedule.ts';
import type { ProfessionalProfileGateway } from '../application/professional-profile.ts';
import type { ShopClosurePersistence } from '../application/shop-closures.ts';
interface Options {
  baseUrl: string;
  serviceKey: string;
  fetcher?: typeof fetch;
}
const uuid = (v: unknown) =>
  typeof v === 'string' && /^[a-f0-9-]{36}$/i.test(v);
export function createPostgresOperationAdapter({
  baseUrl,
  serviceKey,
  fetcher = fetch,
}: Options): OperationGateway &
  SelfScheduleGateway &
  ShopClosurePersistence &
  ProfessionalProfileGateway {
  async function rpc(
    name: string,
    actor: VerifiedActor,
    data: unknown,
  ): Promise<unknown> {
    const input = Object.fromEntries(
      Object.entries(data as Record<string, unknown>).filter(
        ([k]) => k !== 'action',
      ),
    );
    const headers: Record<string, string> = {
      apikey: serviceKey,
      'Content-Type': 'application/json',
    };
    if (!serviceKey.startsWith('sb_secret_'))
      headers.Authorization = 'Bearer ' + serviceKey;
    try {
      const r = await fetcher(baseUrl + '/rest/v1/rpc/' + name, {
        method: 'POST',
        headers,
        body: JSON.stringify({ p_actor_id: actor.userId, p_data: input }),
        signal: AbortSignal.timeout(8000),
      });
      const value = await r.json();
      if (!r.ok) {
        const known = [
          'INVALID_INPUT',
          'UNAUTHENTICATED',
          'FORBIDDEN',
          'NOT_AVAILABLE',
          'PROFILE_REQUIRED',
          'CONFLICT',
          'DEPENDENCY_UNAVAILABLE',
        ];
        const code = known.includes(value?.message)
          ? value.message
          : value?.code === '23505'
            ? 'CONFLICT'
            : r.status === 401
              ? 'UNAUTHENTICATED'
              : r.status === 403
                ? 'FORBIDDEN'
                : r.status === 404
                  ? 'NOT_AVAILABLE'
                  : String(value?.code).startsWith('22') ||
                      ['23514', '23502', '23503'].includes(value?.code)
                    ? 'INVALID_INPUT'
                    : 'DEPENDENCY_UNAVAILABLE';
        throw new BusinessError(code as BusinessErrorCode);
      }
      return value;
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  }
  async function invitation(
    name: string,
    actor: VerifiedActor,
    data: unknown,
  ): Promise<StaffInvitation> {
    const r = (await rpc(name, actor, data)) as StaffInvitation;
    if (
      !r ||
      !uuid(r.id) ||
      !uuid(r.barbershopId) ||
      !['barber', 'administrator'].includes(r.role) ||
      !['pending', 'accepted', 'rejected', 'cancelled'].includes(r.status)
    )
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    return {
      id: r.id,
      barbershopId: r.barbershopId,
      role: r.role,
      status: r.status,
    };
  }
  async function ownProfessional(
    name: string,
    actor: VerifiedActor,
    barbershopId: string,
    professionalName?: string,
  ): Promise<Professional> {
    const r = (await rpc(name, actor, {
      barbershopId,
      ...(professionalName === undefined ? {} : { professionalName }),
    })) as Professional;
    if (
      !r ||
      !uuid(r.id) ||
      r.userId !== actor.userId ||
      r.barbershopId !== barbershopId ||
      r.active !== true ||
      typeof r.professionalName !== 'string' ||
      !r.professionalName.trim()
    )
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    return r;
  }
  return {
    executeProfessionalProfile: (
      actor: VerifiedActor,
      command: import('../domain/professional-profile.ts').ProfileCommand,
    ) =>
      rpc(
        command.action === 'get-own-professional-profile'
          ? 'get_own_professional_profile_details'
          : 'update_own_professional_profile_details',
        actor,
        {
          barbershopId: command.barbershopId,
          ...(command.action === 'update-own-professional-profile'
            ? { profile: command.profile }
            : {}),
        },
      ),
    listShopClosures: (actor, barbershopId, cursor) =>
      rpc('list_admin_booking_closures', actor, { barbershopId, cursor }),
    withdrawShopClosure: (actor, input) =>
      rpc('withdraw_admin_booking_closure', actor, input),
    getOwnSchedule: (a, barbershopId) =>
      rpc('get_own_booking_schedule', a, { barbershopId }),
    setOwnSchedule: (a, barbershopId, version, hours) =>
      rpc('set_own_booking_schedule', a, { barbershopId, version, hours }),
    upsertOwnBlock: (a, barbershopId, version, block) =>
      rpc('upsert_own_booking_block', a, { barbershopId, version, block }),
    removeOwnBlock: (a, barbershopId, version, blockId) =>
      rpc('remove_own_booking_block', a, { barbershopId, version, blockId }),
    getOwnProfessional: (actor, shop) =>
      ownProfessional('get_own_booking_professional', actor, shop),
    updateOwnProfessional: (actor, shop, name) =>
      ownProfessional('update_own_booking_professional', actor, shop, name),
    configureShop: async (a, d) => {
      await rpc('configure_booking_shop', a, d);
    },
    setPublication: async (a, barbershopId, state) => {
      await rpc('set_booking_publication', a, { barbershopId, state });
    },
    upsertService: async (a, d) => {
      const r = (await rpc('upsert_booking_service', a, d)) as Service;
      if (
        (d.category !== undefined && r.category !== d.category) ||
        (d.archived === true && r.archived !== true)
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      if (
        !r ||
        !uuid(r.id) ||
        r.barbershopId !== d.barbershopId ||
        !Number.isSafeInteger(r.price?.amountMinor) ||
        r.price.currency !== 'PEN' ||
        r.price.amountMinor < 0 ||
        typeof r.active !== 'boolean' ||
        typeof r.name !== 'string' ||
        typeof r.description !== 'string' ||
        !Number.isInteger(r.durationMin) ||
        r.durationMin <= 0
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return r;
    },
    setProfessional: async (a, d) => {
      const r = (await rpc('set_booking_professional', a, d)) as Professional;
      if (
        !r ||
        !uuid(r.id) ||
        r.barbershopId !== d.barbershopId ||
        r.userId !== d.userId ||
        typeof r.active !== 'boolean' ||
        typeof r.professionalName !== 'string'
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return r;
    },
    setCapabilities: async (a, barbershopId, barberId, serviceIds) => {
      await rpc('set_booking_capabilities', a, {
        barbershopId,
        barberId,
        serviceIds,
      });
    },
    setShopHours: async (a, barbershopId, hours) => {
      await rpc('set_booking_hours', a, { barbershopId, hours });
    },
    setBarberHours: async (a, barbershopId, barberId, hours) => {
      await rpc('set_booking_hours', a, { barbershopId, barberId, hours });
    },
    setException: async (a, d) => {
      await rpc('set_booking_exception', a, d);
    },
    inviteExistingUser: (a, barbershopId, email) =>
      invitation('invite_booking_staff', a, { barbershopId, email }),
    respondInvitation: (a, invitationId, decision) =>
      invitation('respond_booking_invitation', a, { invitationId, decision }),
    cancelInvitation: (a, invitationId) =>
      invitation('cancel_booking_invitation', a, { invitationId }),
  };
}
