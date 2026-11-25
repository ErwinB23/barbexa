import {
  createCatalogCache,
  CATALOG_VERSION,
  type CatalogCache,
} from './catalog-cache';
import { ownSchedule } from '../domain/self-schedule';
import type { SelfScheduleGateway } from '../application/self-schedule';
import type { ProfileCommand } from '../domain/professional-profile';
import type { ProfessionalProfileGateway } from '../application/professional-profile';
import type { AdminInvitationGateway } from '../application/admin-invitations';
import type { OwnSummaryGateway } from '../application/own-summary';
import type { TeamAuthorityGateway } from '../application/team-authority';
import type { ShopClosureGateway } from '../application/shop-closures';
import { parseShopClosure } from '../domain/shop-closure';
import {
  parseAdminInvitation,
  type AdminInvitationCommand,
} from '../domain/admin-invitations';
import { ownSummaryQuery } from '../domain/own-summary';
import { teamId } from '../domain/team-input';
import { adminInvitationPayload, ownSummaryPayload } from './team-payload';
import {
  BusinessError,
  moneyPEN,
  utcInstant,
  type BusinessErrorCode,
} from '../domain/values';
import type {
  OperationManagementGateway,
  ManagementData,
} from '../application/operation-application';
import type {
  Service,
  Professional,
  StaffInvitation,
  BookingCatalog,
  PublicationState,
} from '../domain/types';
export interface OperationHttpOptions {
  readonly catalogCache?: CatalogCache;
  readonly baseUrl: string;
  readonly publicKey: string;
  readonly getAccessToken: () => Promise<string | null>;
  readonly expectedUser: () => string | null;
  readonly fetcher?: typeof fetch;
  readonly developmentHttpOrigin?: string;
}
const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v))
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return v as Record<string, unknown>;
};
const text = (v: unknown) => {
  if (typeof v !== 'string') throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return v;
};
const id = (v: unknown) => {
  const s = text(v);
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(s))
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return s;
};
const integer = (v: unknown) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0)
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return v;
};
const flag = (v: unknown) => {
  if (typeof v !== 'boolean') throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return v;
};
const rows = (v: unknown) => {
  if (!Array.isArray(v)) throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return v.map(object);
};
const invitation = (v: unknown): StaffInvitation => {
  const r = object(v);
  if (
    !['barber', 'administrator'].includes(String(r.role)) ||
    !['pending', 'accepted', 'rejected', 'cancelled'].includes(String(r.status))
  )
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return {
    ...(r.createdAt !== undefined
      ? { createdAt: utcInstant(text(r.createdAt)) }
      : {}),
    ...(r.respondedAt !== undefined
      ? {
          respondedAt:
            r.respondedAt === null ? null : utcInstant(text(r.respondedAt)),
        }
      : {}),
    ...(r.recipientName !== undefined
      ? {
          recipientName:
            r.recipientName === null ? null : text(r.recipientName),
        }
      : {}),
    ...(r.professionalActive !== undefined
      ? {
          professionalActive:
            r.professionalActive === null ? null : flag(r.professionalActive),
        }
      : {}),
    ...(r.recipientEmail !== undefined
      ? {
          recipientEmail:
            r.recipientEmail === null ? null : text(r.recipientEmail),
        }
      : {}),
    id: id(r.id),
    barbershopId: id(r.barbershopId),
    role: r.role as StaffInvitation['role'],
    status: r.status as StaffInvitation['status'],
    ...(typeof r.barbershopName === 'string'
      ? { barbershopName: r.barbershopName }
      : {}),
  };
};
const service = (v: unknown): Service => {
  const r = object(v),
    p = object(r.price);
  if (
    r.category !== undefined &&
    !['Corte de cabello', 'Barba', 'Tratamientos', 'Otros'].includes(
      String(r.category),
    )
  )
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  if (r.archived !== undefined && typeof r.archived !== 'boolean')
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  if (p.currency !== 'PEN') throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return {
    id: id(r.id),
    barbershopId: id(r.barbershopId),
    name: text(r.name),
    description: text(r.description),
    ...(r.category !== undefined
      ? { category: r.category as Service['category'] }
      : {}),
    ...(r.archived !== undefined ? { archived: r.archived as boolean } : {}),
    price: moneyPEN(integer(p.amountMinor)),
    durationMin: integer(r.durationMin),
    active: flag(r.active),
  };
};
const professional = (v: unknown): Professional => {
  const r = object(v);
  return {
    id: id(r.id),
    barbershopId: id(r.barbershopId),
    userId: id(r.userId),
    professionalName: text(r.professionalName),
    active: flag(r.active),
  };
};
function decodeCatalog(barbershopId: string, value: unknown): BookingCatalog {
  const r = object(value);
  if (
    r.barbershopId !== barbershopId ||
    !Array.isArray(r.services) ||
    !Array.isArray(r.professionals) ||
    !Array.isArray(r.capabilities)
  )
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  const policies = object(r.policies);
  if (!['published', 'paused'].includes(String(r.publicationState)))
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  const result: BookingCatalog = {
    barbershopId: id(r.barbershopId),
    name: text(r.name),
    publicationState: r.publicationState as 'published' | 'paused',
    publicContact: text(r.publicContact),
    address: text(r.address),
    ...(r.shopHours !== undefined
      ? {
          shopHours: rows(r.shopHours).map((h) => {
            const weekday = integer(h.weekday),
              opensMin = integer(h.opensMin),
              closesMin = integer(h.closesMin);
            if (weekday > 6 || opensMin >= closesMin || closesMin > 1440)
              throw new BusinessError('DEPENDENCY_UNAVAILABLE');
            return { weekday, opensMin, closesMin };
          }),
        }
      : {}),
    ...(r.shopClosures !== undefined
      ? {
          shopClosures: rows(r.shopClosures).map((h) => {
            const startsAt = utcInstant(h.startsAt),
              endsAt = utcInstant(h.endsAt);
            if (startsAt >= endsAt)
              throw new BusinessError('DEPENDENCY_UNAVAILABLE');
            return { startsAt, endsAt };
          }),
        }
      : {}),
    policies: {
      minimumNoticeMin: integer(policies.minimumNoticeMin),
      bookingHorizonDays: integer(policies.bookingHorizonDays),
      maxFuturePerClient: integer(policies.maxFuturePerClient),
      slotStepMin: integer(policies.slotStepMin),
      bufferMin: integer(policies.bufferMin),
      cancellationAdvanceMin: integer(policies.cancellationAdvanceMin),
    },
    services: r.services.map(service),
    professionals: r.professionals.map((v) => {
      const p = object(v);
      return {
        id: id(p.id),
        barbershopId: id(p.barbershopId),
        professionalName: text(p.professionalName),
        ...(p.description !== undefined
          ? { description: text(p.description) }
          : {}),
        active: flag(p.active),
      };
    }),
    capabilities: r.capabilities.map((v) => {
      const c = object(v);
      return { barberId: id(c.barberId), serviceId: id(c.serviceId) };
    }),
  };
  if (
    result.services.some((s) => s.barbershopId !== barbershopId) ||
    result.professionals.some((p) => p.barbershopId !== barbershopId)
  )
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return result;
}
export function createOperationHttpAdapter(
  options: OperationHttpOptions,
): OperationManagementGateway &
  SelfScheduleGateway &
  AdminInvitationGateway &
  TeamAuthorityGateway &
  OwnSummaryGateway &
  ShopClosureGateway & {
    executeProfessionalProfile: ProfessionalProfileGateway['executeProfessionalProfile'];
    listVisibleShops: (
      cursor: string | null,
      name: string,
    ) => Promise<
      readonly {
        barbershopId: string;
        name: string;
        publicationState: 'published' | 'paused';
        publicContact: string;
        address: string;
      }[]
    >;
  } {
  const base = new URL(options.baseUrl);
  const octets = base.hostname.split('.').map(Number);
  const lan =
    octets.length === 4 &&
    octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) &&
    (octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168));
  let publicKey = false;
  try {
    publicKey =
      options.publicKey.startsWith('sb_publishable_') ||
      JSON.parse(
        atob(
          options.publicKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
        ),
      ).role === 'anon';
  } catch {}
  const dev =
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    lan &&
    base.port === '54421' &&
    base.origin === options.developmentHttpOrigin;
  if (
    !publicKey ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== '/' ||
    !(
      base.protocol === 'https:' ||
      (base.protocol === 'http:' &&
        (['127.0.0.1', '[::1]'].includes(base.hostname) || dev))
    )
  )
    throw new BusinessError('INVALID_INPUT');
  const fetcher = options.fetcher ?? fetch;
  const cache = options.catalogCache ?? createCatalogCache();
  async function request(
    path: string,
    init: RequestInit = {},
    commercial?: {
      shopId: string;
      project: (value: unknown) => BookingCatalog;
    },
  ): Promise<unknown> {
    const expected = options.expectedUser(),
      token = await options.getAccessToken();
    if (!expected || !token) throw new BusinessError('UNAUTHENTICATED');
    const send = async (resource: string, input: RequestInit) => {
      const r = await fetcher(options.baseUrl + resource, {
        ...input,
        headers: {
          apikey: options.publicKey,
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
      const body: unknown = await r.json().catch(() => null);
      if (!r.ok) {
        const v =
          body && typeof body === 'object'
            ? (body as Record<string, unknown>)
            : {};
        const error =
          v.error && typeof v.error === 'object'
            ? (v.error as Record<string, unknown>)
            : {};
        const known: BusinessErrorCode[] = [
          'INVALID_INPUT',
          'UNAUTHENTICATED',
          'FORBIDDEN',
          'NOT_AVAILABLE',
          'PROFILE_REQUIRED',
          'CONFLICT',
          'DEPENDENCY_UNAVAILABLE',
        ];
        const code =
          known.find((c) => c === error.code || c === v.message) ??
          (r.status === 401
            ? 'UNAUTHENTICATED'
            : r.status === 403
              ? 'FORBIDDEN'
              : 'DEPENDENCY_UNAVAILABLE');
        throw new BusinessError(code);
      }
      return body;
    };
    try {
      const who = object(await send('/auth/v1/user', {}));
      if (
        who.id !== expected ||
        who.is_anonymous !== false ||
        !who.email_confirmed_at
      )
        throw new BusinessError('UNAUTHENTICATED');
      if (options.expectedUser() !== expected)
        throw new BusinessError('UNAUTHENTICATED');
      const value = commercial
        ? await cache.read(
            expected,
            commercial.shopId,
            `${CATALOG_VERSION}:${base.origin}`,
            async () => commercial.project(await send(path, init)),
          )
        : await send(path, init);
      if (options.expectedUser() !== expected)
        throw new BusinessError('UNAUTHENTICATED');
      return value;
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  }
  const command = async (action: string, data: object) => {
    cache.invalidate();
    try {
      return await request('/functions/v1/barbershop-operation', {
        method: 'POST',
        body: JSON.stringify({ action, ...data }),
      });
    } finally {
      cache.invalidate();
    }
  };
  const rpc = (name: string, data: object) =>
    request('/rest/v1/rpc/' + name, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  const ownProfessional = (shop: string, value: unknown): Professional => {
    const result = professional(value);
    if (
      result.userId !== options.expectedUser() ||
      result.barbershopId !== shop ||
      !result.active ||
      !result.professionalName.trim()
    )
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    return result;
  };
  const teamCommand = (value: AdminInvitationCommand, write = false) => {
    const { action, ...data } = value;
    return write
      ? command(action, data)
      : request('/functions/v1/barbershop-operation', {
          method: 'POST',
          body: JSON.stringify(value),
        });
  };
  return {
    executeShopClosure: async (input) => {
      const { action, ...data } = parseShopClosure(input);
      return action === 'list-shop-closures'
        ? request('/functions/v1/barbershop-operation', {
            method: 'POST',
            body: JSON.stringify({ action, ...data }),
          })
        : command(action, data);
    },
    executeProfessionalProfile: (input: ProfileCommand) => {
      const { action, ...data } = input;
      return action === 'update-own-professional-profile'
        ? command(action, data)
        : request('/functions/v1/barbershop-operation', {
            method: 'POST',
            body: JSON.stringify(input),
          });
    },
    getAuthority: (barbershopId: string) => {
      id(barbershopId);
      return request('/functions/v1/barbershop-operation', {
        method: 'POST',
        body: JSON.stringify({ action: 'read-team-authority', barbershopId }),
      });
    },
    commandAuthority: (input) =>
      request('/functions/v1/barbershop-operation', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    async createAdmin(input) {
      const c = parseAdminInvitation({
        action: 'invite-administrator',
        ...input,
      });
      return adminInvitationPayload(
        await teamCommand(c, true),
        teamId(input.barbershopId),
      );
    },
    async listAdmin(shop) {
      const c = parseAdminInvitation({
        action: 'list-admin-invitations',
        barbershopId: shop,
      });
      const value = await teamCommand(c);
      if (!Array.isArray(value) || value.length > 200)
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return value.map((row) => adminInvitationPayload(row, shop ?? undefined));
    },
    async respondAdmin(id, decision) {
      const c = parseAdminInvitation({
          action: 'respond-admin-invitation',
          invitationId: id,
          decision,
        }),
        value = adminInvitationPayload(await teamCommand(c, true));
      if (
        value.id !== teamId(id) ||
        value.status !== (decision === 'accept' ? 'accepted' : 'rejected')
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return value;
    },
    async cancelAdmin(id) {
      const c = parseAdminInvitation({
          action: 'cancel-admin-invitation',
          invitationId: id,
        }),
        value = adminInvitationPayload(await teamCommand(c, true));
      if (value.id !== teamId(id) || value.status !== 'cancelled')
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return value;
    },
    async retryAdminMail(id) {
      const c = parseAdminInvitation({
          action: 'retry-admin-invitation-email',
          invitationId: id,
        }),
        value = adminInvitationPayload(await teamCommand(c, true));
      if (value.id !== teamId(id))
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return value;
    },
    async getOwnSummary(shop, day) {
      const c = ownSummaryQuery({
          action: 'own-professional-summary',
          barbershopId: shop,
          localDate: day,
        }),
        actor = options.expectedUser();
      const value = await request('/functions/v1/barbershop-operation', {
        method: 'POST',
        body: JSON.stringify(c),
      });
      if (!actor || options.expectedUser() !== actor)
        throw new BusinessError('UNAUTHENTICATED');
      return ownSummaryPayload(value, actor, c.barbershopId, c.localDate);
    },
    getOwnSchedule: async (barbershopId) =>
      ownSchedule(
        await command('get-own-schedule', { barbershopId }),
        options.expectedUser() ?? '',
        barbershopId,
      ),
    setOwnSchedule: async (barbershopId, version, hours) =>
      ownSchedule(
        await command('set-own-schedule', { barbershopId, version, hours }),
        options.expectedUser() ?? '',
        barbershopId,
      ),
    upsertOwnBlock: async (barbershopId, version, block) =>
      ownSchedule(
        await command('upsert-own-block', { barbershopId, version, block }),
        options.expectedUser() ?? '',
        barbershopId,
      ),
    removeOwnBlock: async (barbershopId, version, blockId) =>
      ownSchedule(
        await command('remove-own-block', { barbershopId, version, blockId }),
        options.expectedUser() ?? '',
        barbershopId,
      ),
    getOwnProfessional: async (barbershopId) =>
      ownProfessional(
        barbershopId,
        await command('get-own-professional', { barbershopId }),
      ),
    updateOwnProfessional: async (barbershopId, professionalName) =>
      ownProfessional(
        barbershopId,
        await command('update-own-professional', {
          barbershopId,
          professionalName,
        }),
      ),
    listVisibleShops: async (cursor, name) => {
      if (cursor !== null) id(cursor);
      if (name.length > 200) throw new BusinessError('INVALID_INPUT');
      const value = await rpc('list_booking_barbershops', {
        p_cursor: cursor,
        p_name: name,
      });
      return rows(value).map((r) => {
        if (!['published', 'paused'].includes(String(r.publicationState)))
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        return {
          barbershopId: id(r.barbershopId),
          name: text(r.name),
          publicationState: r.publicationState as 'published' | 'paused',
          publicContact: text(r.publicContact),
          address: text(r.address),
        };
      });
    },
    configureShop: async (input) => {
      await command('configure-shop', input);
    },
    setPublication: async (barbershopId, state) => {
      await command('set-publication', { barbershopId, state });
    },
    upsertService: async (input) => {
      const result = service(await command('upsert-service', input));
      if (
        result.barbershopId !== input.barbershopId ||
        (input.id && result.id !== input.id) ||
        (input.category !== undefined && result.category !== input.category) ||
        (input.archived === true && (result.archived !== true || result.active))
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return result;
    },
    setProfessional: async (input) =>
      professional(await command('set-professional', input)),
    setCapabilities: async (barbershopId, barberId, serviceIds) => {
      await command('set-capabilities', { barbershopId, barberId, serviceIds });
    },
    setShopHours: async (barbershopId, hours) => {
      await command('set-shop-hours', { barbershopId, hours });
    },
    setBarberHours: async (barbershopId, barberId, hours) => {
      await command('set-barber-hours', { barbershopId, barberId, hours });
    },
    setException: async (input) => {
      await command('set-exception', input);
    },
    inviteExistingUser: async (barbershopId, email) =>
      invitation(
        await command('invite-existing-user', { barbershopId, email }),
      ),
    respondInvitation: async (invitationId, decision) =>
      invitation(
        await command(
          decision === 'accept' ? 'accept-invitation' : 'reject-invitation',
          { invitationId },
        ),
      ),
    remindInvitation: async (shop, invitationId) => {
      const value = object(
        await rpc('remind_professional_invitation', {
          p_shop_id: id(shop),
          p_invitation_id: id(invitationId),
        }),
      );
      return { created: flag(value.created) };
    },
    cancelInvitation: async (invitationId) =>
      invitation(await command('cancel-invitation', { invitationId })),
    listOwnInvitations: async () => {
      const value = await rpc('list_own_staff_invitations', {});
      if (!Array.isArray(value))
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return value.map(invitation);
    },
    getCatalog: async (barbershopId) => {
      id(barbershopId);
      return (await request(
        '/rest/v1/rpc/get_booking_catalog',
        {
          method: 'POST',
          body: JSON.stringify({ p_barbershop_id: barbershopId }),
        },
        {
          shopId: barbershopId,
          project: (value) => decodeCatalog(barbershopId, value),
        },
      )) as BookingCatalog;
    },
    getManagement: async (shop, includeTeam = true) => {
      id(shop);
      const query = (table: string, columns: string) =>
        request(
          `/rest/v1/${table}?select=${columns}&barbershop_id=eq.${shop}&limit=100`,
        );
      const [s, p, h, bh, config, invites, members, capabilities] =
        await Promise.all([
          query('services', '*'),
          query(
            'barber_profiles',
            'id,barbershop_id,user_id,professional_name,active',
          ),
          query('barbershop_hours', 'weekday,opens_min,closes_min'),
          query('barber_schedules', 'barber_id,weekday,opens_min,closes_min'),
          query(
            'barbershop_booking_settings',
            'barbershop_id,publication_state,public_contact,address,minimum_notice_min,booking_horizon_days,max_future_per_client,slot_step_min,buffer_min,cancellation_advance_min',
          ),
          includeTeam
            ? rpc('list_shop_staff_invitations', { p_barbershop_id: shop })
            : Promise.resolve([]),
          includeTeam
            ? rpc('list_barbershop_memberships', { p_barbershop_id: shop })
            : Promise.resolve([]),
          query('barber_services', 'barber_id,service_id,active'),
        ]);
      const cfg = rows(config)[0];
      let settings: ManagementData['settings'] = null;
      if (
        cfg &&
        [
          'minimum_notice_min',
          'booking_horizon_days',
          'max_future_per_client',
          'slot_step_min',
          'buffer_min',
        ].every((k) => cfg[k] !== null)
      ) {
        const state = text(cfg.publication_state);
        if (!['draft', 'published', 'paused', 'withdrawn'].includes(state))
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        settings = {
          barbershopId: shop,
          publicationState: state as PublicationState,
          publicContact:
            cfg.public_contact === null ? '' : text(cfg.public_contact),
          address: cfg.address === null ? '' : text(cfg.address),
          policies: {
            minimumNoticeMin: integer(cfg.minimum_notice_min ?? 0),
            bookingHorizonDays: integer(cfg.booking_horizon_days ?? 0),
            maxFuturePerClient: integer(cfg.max_future_per_client ?? 0),
            slotStepMin: integer(cfg.slot_step_min ?? 0),
            bufferMin: integer(cfg.buffer_min ?? 0),
            cancellationAdvanceMin: integer(cfg.cancellation_advance_min),
          },
        };
      }
      if (!Array.isArray(invites))
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return {
        capabilities: rows(capabilities)
          .filter((r) => r.active === true)
          .map((r) => ({
            barberId: id(r.barber_id),
            serviceId: id(r.service_id),
          })),
        settings,
        services: rows(s)
          .filter((r) => r.archived !== true)
          .map((r) =>
            service({
              id: r.id,
              barbershopId: r.barbershop_id,
              name: r.name,
              description: r.description,
              ...(r.category !== undefined ? { category: r.category } : {}),
              ...(r.archived !== undefined ? { archived: r.archived } : {}),
              price: {
                amountMinor: Math.round(Number(r.price_amount) * 100),
                currency: 'PEN',
              },
              durationMin: r.duration_min,
              active: r.active,
            }),
          ),
        professionals: rows(p).map((r) =>
          professional({
            id: r.id,
            barbershopId: r.barbershop_id,
            userId: r.user_id,
            professionalName: r.professional_name,
            active: r.active,
          }),
        ),
        hours: [
          ...rows(h).map((r): Record<string, unknown> => ({
            ...r,
            barber_id: null,
          })),
          ...rows(bh),
        ].map((r) => ({
          barberId: r.barber_id === null ? null : id(r.barber_id),
          weekday: integer(r.weekday),
          opensMin: integer(r.opens_min),
          closesMin: integer(r.closes_min),
        })),
        invitations: invites.map((value) => {
          const result = invitation(value);
          if (result.barbershopId !== shop)
            throw new BusinessError('DEPENDENCY_UNAVAILABLE');
          return result;
        }),
        members: rows(members).map((r) => {
          if (
            !['administrator', 'barber'].includes(String(r.role)) ||
            !['active', 'inactive'].includes(String(r.status))
          )
            throw new BusinessError('DEPENDENCY_UNAVAILABLE');
          return {
            userId: id(r.user_id),
            role: r.role as 'administrator' | 'barber',
            status: r.status as 'active' | 'inactive',
          };
        }),
      };
    },
  };
}
