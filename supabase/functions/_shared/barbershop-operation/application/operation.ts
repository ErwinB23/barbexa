import { BusinessError, moneyPEN, utcInstant } from '../domain/values.ts';
import {
  profileCommand,
  type ProfileCommand,
} from '../domain/professional-profile.ts';
import {
  parseShopClosure,
  type ShopClosureCommand,
} from '../domain/shop-closure.ts';
import type {
  VerifiedActor,
  ShopSetup,
  Service,
  Professional,
  PublicationState,
  Hours,
  ScheduleException,
} from '../domain/types.ts';
import type { BarbershopPersistenceGateway } from './operation-gateway.ts';
import {
  parseAdminInvitation,
  type AdminInvitationCommand,
} from '../domain/admin-invitations.ts';
import {
  ownSummaryQuery,
  type OwnSummaryQuery,
} from '../domain/own-summary.ts';
import {
  parseSelfSchedule,
  executeSelfSchedule,
  type SelfScheduleCommand,
  type SelfScheduleGateway,
} from './self-schedule.ts';
import {
  parseAuthorityCommand,
  type AuthorityCommand,
} from '../domain/team-authority.ts';
type Command<A extends string, T> = Readonly<{ action: A } & T>;
export type OperationCommand =
  | ProfileCommand
  | ShopClosureCommand
  | AuthorityCommand
  | AdminInvitationCommand
  | OwnSummaryQuery
  | SelfScheduleCommand
  | Command<'get-own-professional', { barbershopId: string }>
  | Command<
      'update-own-professional',
      { barbershopId: string; professionalName: string }
    >
  | Command<'configure-shop', ShopSetup>
  | Command<
      'set-publication',
      { barbershopId: string; state: PublicationState }
    >
  | Command<'upsert-service', Omit<Service, 'id'> & { id?: string }>
  | Command<'set-professional', Omit<Professional, 'id'> & { id?: string }>
  | Command<
      'set-capabilities',
      { barbershopId: string; barberId: string; serviceIds: readonly string[] }
    >
  | Command<'set-shop-hours', { barbershopId: string; hours: readonly Hours[] }>
  | Command<
      'set-barber-hours',
      { barbershopId: string; barberId: string; hours: readonly Hours[] }
    >
  | Command<'set-exception', ScheduleException>
  | Command<'invite-existing-user', { barbershopId: string; email: string }>
  | Command<
      'accept-invitation' | 'reject-invitation' | 'cancel-invitation',
      { invitationId: string }
    >;
export type OperationGateway = Omit<BarbershopPersistenceGateway, 'getCatalog'>;
function invalid(): never {
  throw new BusinessError('INVALID_INPUT');
}
function object(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return invalid();
  return input as Record<string, unknown>;
}
function keys(
  v: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
) {
  if (
    required.some((k) => !(k in v)) ||
    Object.keys(v).some((k) => !required.includes(k) && !optional.includes(k))
  )
    invalid();
}
function id(input: unknown): string {
  if (
    typeof input !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      input,
    )
  )
    return invalid();
  return input;
}
function text(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) return invalid();
  return input.trim();
}
function integer(input: unknown, min: number, max = 2147483647): number {
  if (
    typeof input !== 'number' ||
    !Number.isSafeInteger(input) ||
    input < min ||
    input > max
  )
    return invalid();
  return input;
}
function flag(input: unknown): boolean {
  if (typeof input !== 'boolean') return invalid();
  return input;
}
function hours(input: unknown): readonly Hours[] {
  if (!Array.isArray(input)) return invalid();
  return Object.freeze(
    input.map((v) => {
      const h = object(v);
      keys(h, ['weekday', 'opensMin', 'closesMin']);
      const open = integer(h.opensMin, 0, 1439),
        close = integer(h.closesMin, 1, 1440);
      if (open >= close) invalid();
      return Object.freeze({
        weekday: integer(h.weekday, 0, 6),
        opensMin: open,
        closesMin: close,
      });
    }),
  );
}
export function parseOperation(input: unknown): OperationCommand {
  const v = object(input),
    action = text(v.action);
  let d: Record<string, unknown>;
  const shop = () => id(v.barbershopId),
    optionalId = () => (v.id === undefined ? {} : { id: id(v.id) });
  switch (action) {
    case 'list-shop-closures':
    case 'withdraw-shop-closure':
      return parseShopClosure(input);
    case 'read-team-authority':
    case 'remove-secondary':
    case 'initiate-ownership-transfer':
    case 'cancel-ownership-transfer':
    case 'reject-ownership-transfer':
    case 'accept-ownership-transfer':
      return parseAuthorityCommand(input);
    case 'invite-administrator':
    case 'list-admin-invitations':
    case 'respond-admin-invitation':
    case 'cancel-admin-invitation':
    case 'retry-admin-invitation-email':
      return parseAdminInvitation(input);
    case 'own-professional-summary':
      return ownSummaryQuery(input);
    case 'get-own-schedule':
    case 'set-own-schedule':
    case 'upsert-own-block':
    case 'remove-own-block':
      return parseSelfSchedule(input);
    case 'get-own-professional-profile':
    case 'update-own-professional-profile':
      return profileCommand(input);
    case 'get-own-professional':
      keys(v, ['action', 'barbershopId']);
      d = { barbershopId: shop() };
      break;
    case 'update-own-professional':
      keys(v, ['action', 'barbershopId', 'professionalName']);
      d = { barbershopId: shop(), professionalName: text(v.professionalName) };
      break;
    case 'configure-shop': {
      keys(v, [
        'action',
        'barbershopId',
        'publicContact',
        'address',
        'policies',
      ]);
      const p = object(v.policies);
      keys(p, [
        'minimumNoticeMin',
        'bookingHorizonDays',
        'maxFuturePerClient',
        'slotStepMin',
        'bufferMin',
        'cancellationAdvanceMin',
      ]);
      d = {
        barbershopId: shop(),
        publicContact: text(v.publicContact),
        address: text(v.address),
        policies: Object.freeze({
          minimumNoticeMin: integer(p.minimumNoticeMin, 0),
          bookingHorizonDays: integer(p.bookingHorizonDays, 1),
          maxFuturePerClient: integer(p.maxFuturePerClient, 1),
          slotStepMin: integer(p.slotStepMin, 1, 1440),
          bufferMin: integer(p.bufferMin, 0),
          cancellationAdvanceMin: integer(p.cancellationAdvanceMin, 0),
        }),
      };
      break;
    }
    case 'set-publication':
      keys(v, ['action', 'barbershopId', 'state']);
      if (
        !['draft', 'published', 'paused', 'withdrawn'].includes(String(v.state))
      )
        invalid();
      d = { barbershopId: shop(), state: v.state };
      break;
    case 'upsert-service': {
      keys(
        v,
        [
          'action',
          'barbershopId',
          'name',
          'description',
          'price',
          'durationMin',
          'active',
        ],
        ['id', 'category', 'archived'],
      );
      const p = object(v.price);
      keys(p, ['amountMinor', 'currency']);
      if (p.currency !== 'PEN' || typeof v.description !== 'string') invalid();
      if (
        v.category !== undefined &&
        !['Corte de cabello', 'Barba', 'Tratamientos', 'Otros'].includes(
          String(v.category),
        )
      )
        invalid();
      if (
        v.archived !== undefined &&
        (v.archived !== true || !v.id || v.active !== false)
      )
        invalid();
      d = {
        ...optionalId(),
        ...(v.category !== undefined ? { category: v.category } : {}),
        ...(v.archived === true ? { archived: true } : {}),
        barbershopId: shop(),
        name: text(v.name),
        description: v.description,
        price: moneyPEN(p.amountMinor),
        durationMin: integer(v.durationMin, 1),
        active: flag(v.active),
      };
      break;
    }
    case 'set-professional':
      keys(
        v,
        ['action', 'barbershopId', 'userId', 'professionalName', 'active'],
        ['id'],
      );
      d = {
        ...optionalId(),
        barbershopId: shop(),
        userId: id(v.userId),
        professionalName: text(v.professionalName),
        active: flag(v.active),
      };
      break;
    case 'set-capabilities': {
      keys(v, ['action', 'barbershopId', 'barberId', 'serviceIds']);
      if (!Array.isArray(v.serviceIds)) invalid();
      const ids = v.serviceIds.map(id);
      if (new Set(ids).size !== ids.length) invalid();
      d = {
        barbershopId: shop(),
        barberId: id(v.barberId),
        serviceIds: Object.freeze(ids),
      };
      break;
    }
    case 'set-shop-hours':
      keys(v, ['action', 'barbershopId', 'hours']);
      d = { barbershopId: shop(), hours: hours(v.hours) };
      break;
    case 'set-barber-hours':
      keys(v, ['action', 'barbershopId', 'barberId', 'hours']);
      d = {
        barbershopId: shop(),
        barberId: id(v.barberId),
        hours: hours(v.hours),
      };
      break;
    case 'set-exception':
      keys(v, [
        'action',
        'barbershopId',
        'barberId',
        'startsAt',
        'endsAt',
        'reason',
      ]);
      if (v.reason !== null && typeof v.reason !== 'string') invalid();
      {
        const start = utcInstant(v.startsAt),
          end = utcInstant(v.endsAt);
        if (end <= start) invalid();
        d = {
          barbershopId: shop(),
          barberId: v.barberId === null ? null : id(v.barberId),
          startsAt: start,
          endsAt: end,
          reason: v.reason === null ? null : text(v.reason),
        };
      }
      break;
    case 'invite-existing-user': {
      keys(v, ['action', 'barbershopId', 'email']);
      const email = text(v.email).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid();
      d = { barbershopId: shop(), email };
      break;
    }
    case 'accept-invitation':
    case 'reject-invitation':
    case 'cancel-invitation':
      keys(v, ['action', 'invitationId']);
      d = { invitationId: id(v.invitationId) };
      break;
    default:
      return invalid();
  }
  return Object.freeze({ action, ...d }) as OperationCommand;
}
export async function executeOperation(
  gateway: OperationGateway,
  actor: VerifiedActor,
  input: unknown,
  selfSchedule?: SelfScheduleGateway,
  extensions?: {
    professionalProfile?: (
      actor: VerifiedActor,
      command: ProfileCommand,
    ) => Promise<unknown>;
    shopClosures?: (
      actor: VerifiedActor,
      command: ShopClosureCommand,
    ) => Promise<unknown>;
    teamAuthority?: (
      actor: VerifiedActor,
      command: AuthorityCommand,
    ) => Promise<unknown>;
    adminInvitations?: (
      actor: VerifiedActor,
      command: AdminInvitationCommand,
    ) => Promise<unknown>;
    ownSummary?: (
      actor: VerifiedActor,
      command: OwnSummaryQuery,
    ) => Promise<unknown>;
  },
): Promise<unknown> {
  id(actor.userId);
  const c = parseOperation(input);
  switch (c.action) {
    case 'get-own-professional-profile':
    case 'update-own-professional-profile':
      if (!extensions?.professionalProfile)
        throw new BusinessError('NOT_AVAILABLE');
      return extensions.professionalProfile(actor, c);
    case 'list-shop-closures':
    case 'withdraw-shop-closure':
      if (!extensions?.shopClosures) throw new BusinessError('NOT_AVAILABLE');
      return extensions.shopClosures(actor, c);
    case 'read-team-authority':
    case 'remove-secondary':
    case 'initiate-ownership-transfer':
    case 'cancel-ownership-transfer':
    case 'reject-ownership-transfer':
    case 'accept-ownership-transfer':
      if (!extensions?.teamAuthority) throw new BusinessError('FORBIDDEN');
      return extensions.teamAuthority(actor, c);
    case 'invite-administrator':
    case 'list-admin-invitations':
    case 'respond-admin-invitation':
    case 'cancel-admin-invitation':
    case 'retry-admin-invitation-email':
      if (!extensions?.adminInvitations) throw new BusinessError('FORBIDDEN');
      return extensions.adminInvitations(actor, c);
    case 'own-professional-summary':
      if (!extensions?.ownSummary) throw new BusinessError('FORBIDDEN');
      return extensions.ownSummary(actor, c);
    case 'get-own-schedule':
    case 'set-own-schedule':
    case 'upsert-own-block':
    case 'remove-own-block':
      if (!selfSchedule) throw new BusinessError('FORBIDDEN');
      return executeSelfSchedule(selfSchedule, actor, c);
    case 'get-own-professional':
      return gateway.getOwnProfessional(actor, c.barbershopId);
    case 'update-own-professional':
      return gateway.updateOwnProfessional(
        actor,
        c.barbershopId,
        c.professionalName,
      );
    case 'configure-shop':
      return gateway.configureShop(actor, c);
    case 'set-publication':
      return gateway.setPublication(actor, c.barbershopId, c.state);
    case 'upsert-service':
      return gateway.upsertService(actor, c);
    case 'set-professional':
      return gateway.setProfessional(actor, c);
    case 'set-capabilities':
      return gateway.setCapabilities(
        actor,
        c.barbershopId,
        c.barberId,
        c.serviceIds,
      );
    case 'set-shop-hours':
      return gateway.setShopHours(actor, c.barbershopId, c.hours);
    case 'set-barber-hours':
      return gateway.setBarberHours(actor, c.barbershopId, c.barberId, c.hours);
    case 'set-exception':
      return gateway.setException(actor, c);
    case 'invite-existing-user':
      return gateway.inviteExistingUser(actor, c.barbershopId, c.email);
    case 'accept-invitation':
    case 'reject-invitation':
      return gateway.respondInvitation(
        actor,
        c.invitationId,
        c.action === 'accept-invitation' ? 'accept' : 'reject',
      );
    case 'cancel-invitation':
      return gateway.cancelInvitation(actor, c.invitationId);
  }
}
