import { BusinessError, utcInstant } from '../domain/values.ts';
import type { VerifiedActor, Hours } from '../domain/types.ts';
export type SelfScheduleCommand =
  | { readonly action: 'get-own-schedule'; readonly barbershopId: string }
  | {
      readonly action: 'set-own-schedule';
      readonly barbershopId: string;
      readonly version: number;
      readonly hours: readonly Hours[];
    }
  | {
      readonly action: 'upsert-own-block';
      readonly barbershopId: string;
      readonly version: number;
      readonly block: {
        readonly id: string;
        readonly startsAt: string;
        readonly endsAt: string;
        readonly reason: string | null;
      };
    }
  | {
      readonly action: 'remove-own-block';
      readonly barbershopId: string;
      readonly version: number;
      readonly blockId: string;
    };
export interface SelfScheduleGateway {
  getOwnSchedule(actor: VerifiedActor, shop: string): Promise<unknown>;
  setOwnSchedule(
    actor: VerifiedActor,
    shop: string,
    version: number,
    hours: readonly Hours[],
  ): Promise<unknown>;
  upsertOwnBlock(
    actor: VerifiedActor,
    shop: string,
    version: number,
    block: Extract<
      SelfScheduleCommand,
      { action: 'upsert-own-block' }
    >['block'],
  ): Promise<unknown>;
  removeOwnBlock(
    actor: VerifiedActor,
    shop: string,
    version: number,
    id: string,
  ): Promise<unknown>;
}
const invalid = (): never => {
  throw new BusinessError('INVALID_INPUT');
};
function object(
  v: unknown,
  required: readonly string[],
): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return invalid();
  const r = v as Record<string, unknown>;
  if (
    Object.keys(r).some((k) => !required.includes(k)) ||
    required.some((k) => !(k in r))
  )
    return invalid();
  return r;
}
function id(v: unknown): string {
  if (
    typeof v !== 'string' ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v)
  )
    return invalid();
  return v;
}
export function parseSelfSchedule(input: unknown): SelfScheduleCommand {
  if (!input || typeof input !== 'object') return invalid();
  const v = input as Record<string, unknown>;
  const action = v.action;
  if (action === 'get-own-schedule') {
    object(v, ['action', 'barbershopId']);
    return { action, barbershopId: id(v.barbershopId) };
  }
  if (
    !['set-own-schedule', 'upsert-own-block', 'remove-own-block'].includes(
      String(action),
    )
  )
    return invalid();
  object(v, [
    'action',
    'barbershopId',
    'version',
    action === 'set-own-schedule'
      ? 'hours'
      : action === 'upsert-own-block'
        ? 'block'
        : 'blockId',
  ]);
  if (
    typeof v.version !== 'number' ||
    !Number.isSafeInteger(v.version) ||
    v.version < 1
  )
    return invalid();
  const base = { barbershopId: id(v.barbershopId), version: v.version };
  if (action === 'remove-own-block')
    return { ...base, action, blockId: id(v.blockId) };
  if (action === 'upsert-own-block') {
    const b = object(v.block, ['id', 'startsAt', 'endsAt', 'reason']),
      startsAt = utcInstant(b.startsAt),
      endsAt = utcInstant(b.endsAt);
    if (
      startsAt >= endsAt ||
      !(b.reason === null || typeof b.reason === 'string')
    )
      return invalid();
    return {
      ...base,
      action,
      block: {
        id: id(b.id),
        startsAt,
        endsAt,
        reason: typeof b.reason === 'string' ? b.reason.trim() || null : null,
      },
    };
  }
  if (!Array.isArray(v.hours)) return invalid();
  const hours = v.hours
    .map((x) => {
      const h = object(x, ['weekday', 'opensMin', 'closesMin']);
      if (
        !Object.values(h).every(
          (n) => typeof n === 'number' && Number.isSafeInteger(n),
        )
      )
        return invalid();
      const weekday = h.weekday as number,
        opensMin = h.opensMin as number,
        closesMin = h.closesMin as number;
      if (
        weekday < 0 ||
        weekday > 6 ||
        opensMin < 0 ||
        opensMin >= closesMin ||
        closesMin > 1440
      )
        return invalid();
      return { weekday, opensMin, closesMin };
    })
    .sort((a, b) => a.weekday - b.weekday || a.opensMin - b.opensMin);
  if (
    hours.some(
      (h, i) =>
        i > 0 &&
        h.weekday === hours[i - 1].weekday &&
        h.opensMin < hours[i - 1].closesMin,
    )
  )
    return invalid();
  return { ...base, action: 'set-own-schedule', hours };
}
export function executeSelfSchedule(
  gateway: SelfScheduleGateway,
  actor: VerifiedActor,
  input: unknown,
): Promise<unknown> {
  id(actor.userId);
  const c = parseSelfSchedule(input);
  switch (c.action) {
    case 'get-own-schedule':
      return gateway.getOwnSchedule(actor, c.barbershopId);
    case 'set-own-schedule':
      return gateway.setOwnSchedule(actor, c.barbershopId, c.version, c.hours);
    case 'upsert-own-block':
      return gateway.upsertOwnBlock(actor, c.barbershopId, c.version, c.block);
    case 'remove-own-block':
      return gateway.removeOwnBlock(
        actor,
        c.barbershopId,
        c.version,
        c.blockId,
      );
  }
}
