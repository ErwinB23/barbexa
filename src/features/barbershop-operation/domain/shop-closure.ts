import { BusinessError } from './values';
export interface ShopClosure {
  readonly id: string;
  readonly barbershopId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly reason: string | null;
  readonly status: 'active' | 'withdrawn';
  readonly withdrawal: null | {
    readonly eventId: string;
    readonly actorUserId: string;
    readonly occurredAt: string;
    readonly reason: string;
  };
}
export type ShopClosureCommand =
  | {
      readonly action: 'list-shop-closures';
      readonly barbershopId: string;
      readonly cursor: string | null;
    }
  | {
      readonly action: 'withdraw-shop-closure';
      readonly barbershopId: string;
      readonly closureId: string;
      readonly requestId: string;
      readonly reason: string;
    };
const uuid = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(v);
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const instant = (v: unknown): v is string =>
  typeof v === 'string' && Number.isFinite(Date.parse(v));
export function parseShopClosure(input: unknown): ShopClosureCommand {
  const invalid = (): never => {
    throw new BusinessError('INVALID_INPUT');
  };
  if (!record(input) || !uuid(input.barbershopId)) return invalid();
  const keys =
    input.action === 'list-shop-closures'
      ? ['action', 'barbershopId', 'cursor']
      : ['action', 'barbershopId', 'closureId', 'requestId', 'reason'];
  if (
    Object.keys(input).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(input, k))
  )
    return invalid();
  if (
    input.action === 'list-shop-closures' &&
    (input.cursor === null || uuid(input.cursor))
  )
    return {
      action: input.action,
      barbershopId: input.barbershopId,
      cursor: input.cursor,
    };
  if (
    input.action !== 'withdraw-shop-closure' ||
    !uuid(input.closureId) ||
    !uuid(input.requestId) ||
    typeof input.reason !== 'string' ||
    !input.reason.trim() ||
    input.reason.length > 2000
  )
    return invalid();
  return {
    action: input.action,
    barbershopId: input.barbershopId,
    closureId: input.closureId,
    requestId: input.requestId,
    reason: input.reason.trim(),
  };
}
export function decodeShopClosure(input: unknown, shop: string): ShopClosure {
  const invalid = (): never => {
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  };
  if (
    !record(input) ||
    !uuid(input.id) ||
    input.barbershopId !== shop ||
    !instant(input.startsAt) ||
    !instant(input.endsAt) ||
    Date.parse(input.endsAt) <= Date.parse(input.startsAt) ||
    !(input.reason === null || typeof input.reason === 'string')
  )
    return invalid();
  if (input.status === 'active' && input.withdrawal === null)
    return input as unknown as ShopClosure;
  const w = input.withdrawal;
  if (
    input.status !== 'withdrawn' ||
    !record(w) ||
    !uuid(w.eventId) ||
    !uuid(w.actorUserId) ||
    !instant(w.occurredAt) ||
    typeof w.reason !== 'string' ||
    !w.reason.trim() ||
    w.reason.length > 2000
  )
    return invalid();
  return input as unknown as ShopClosure;
}
export function decodeClosurePage(raw: unknown, shop: string) {
  if (
    !record(raw) ||
    raw.barbershopId !== shop ||
    !Array.isArray(raw.closures) ||
    raw.closures.length > 100 ||
    !(raw.nextCursor === null || uuid(raw.nextCursor))
  )
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  const closures = raw.closures.map((v) => decodeShopClosure(v, shop));
  if (
    new Set(closures.map((v) => v.id)).size !== closures.length ||
    (raw.nextCursor !== null &&
      (closures.length !== 100 || raw.nextCursor !== closures.at(-1)?.id))
  )
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return { barbershopId: shop, closures, nextCursor: raw.nextCursor };
}
export function decodeClosureWithdrawal(
  raw: unknown,
  shop: string,
  closureId: string,
) {
  if (!record(raw) || typeof raw.replayed !== 'boolean')
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  const closure = decodeShopClosure(raw.closure, shop);
  if (closure.id !== closureId || closure.status !== 'withdrawn')
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return { closure, replayed: raw.replayed };
}
