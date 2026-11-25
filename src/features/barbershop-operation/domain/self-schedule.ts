import { BusinessError, utcInstant, type UtcInstant } from './values';
import type { Hours, Professional } from './types';
export interface OwnScheduleBlock {
  readonly id: string;
  readonly startsAt: UtcInstant;
  readonly endsAt: UtcInstant;
  readonly reason: string | null;
}
export interface OwnSchedule {
  readonly professional: Professional;
  readonly version: number;
  readonly shopHours: readonly Hours[];
  readonly hours: readonly Hours[];
  readonly blocks: readonly OwnScheduleBlock[];
}
function invalid(): never {
  throw new BusinessError('INVALID_INPUT');
}
function object(
  input: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return invalid();
  const r = input as Record<string, unknown>;
  if (Object.keys(r).some((k) => !keys.includes(k))) return invalid();
  return r;
}
export function scheduleId(input: unknown): string {
  if (
    typeof input !== 'string' ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(input)
  )
    return invalid();
  return input;
}
export function scheduleVersion(input: unknown): number {
  if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 1)
    return invalid();
  return input;
}
export function scheduleHours(input: unknown): readonly Hours[] {
  if (!Array.isArray(input)) return invalid();
  const result = input
    .map((v) => {
      const h = object(v, ['weekday', 'opensMin', 'closesMin']);
      if (
        ![h.weekday, h.opensMin, h.closesMin].every(
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
      return Object.freeze({ weekday, opensMin, closesMin });
    })
    .sort((a, b) => a.weekday - b.weekday || a.opensMin - b.opensMin);
  if (
    result.some(
      (h, i) =>
        i > 0 &&
        h.weekday === result[i - 1].weekday &&
        h.opensMin < result[i - 1].closesMin,
    )
  )
    return invalid();
  return Object.freeze(result);
}
export function ownBlock(input: unknown): OwnScheduleBlock {
  const r = object(input, ['id', 'startsAt', 'endsAt', 'reason']);
  const startsAt = utcInstant(r.startsAt),
    endsAt = utcInstant(r.endsAt);
  if (
    startsAt >= endsAt ||
    !(r.reason === null || typeof r.reason === 'string')
  )
    return invalid();
  return Object.freeze({
    id: scheduleId(r.id),
    startsAt,
    endsAt,
    reason: typeof r.reason === 'string' ? r.reason.trim() || null : null,
  });
}
export function scheduleClockMinutes(input: string, end = false): number {
  if (!/^\d{2}:\d{2}$/.test(input)) return invalid();
  const [h, m] = input.split(':').map(Number);
  if (m > 59 || (h > 23 && !(end && h === 24 && m === 0))) return invalid();
  return h * 60 + m;
}
export function limaScheduleInstant(input: string): UtcInstant {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(input)) return invalid();
  scheduleClockMinutes(input.slice(11));
  const stamp = Date.parse(input.replace(' ', 'T') + ':00-05:00');
  if (
    !Number.isFinite(stamp) ||
    new Date(stamp - 5 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16)
      .replace('T', ' ') !== input
  )
    return invalid();
  return utcInstant(new Date(stamp).toISOString());
}
export function ownSchedule(
  value: unknown,
  user: string,
  shop: string,
): OwnSchedule {
  try {
    const r = object(value, [
      'professional',
      'version',
      'shopHours',
      'hours',
      'blocks',
    ]);
    const p = object(r.professional, [
      'id',
      'userId',
      'barbershopId',
      'professionalName',
      'active',
    ]);
    if (
      p.userId !== user ||
      p.barbershopId !== shop ||
      p.active !== true ||
      typeof p.professionalName !== 'string' ||
      !p.professionalName.trim()
    )
      return invalid();
    const shopHours = scheduleHours(r.shopHours),
      hours = scheduleHours(r.hours);
    for (const h of hours) {
      let covered = h.opensMin;
      for (const general of shopHours.filter((g) => g.weekday === h.weekday)) {
        if (general.opensMin <= covered && general.closesMin > covered)
          covered = general.closesMin;
      }
      if (covered < h.closesMin) return invalid();
    }
    if (!Array.isArray(r.blocks)) return invalid();
    const blocks = r.blocks.map(ownBlock);
    if (new Set(blocks.map((b) => b.id)).size !== blocks.length)
      return invalid();
    return Object.freeze({
      professional: Object.freeze({
        id: scheduleId(p.id),
        userId: scheduleId(user),
        barbershopId: scheduleId(shop),
        professionalName: p.professionalName,
        active: true,
      }),
      version: scheduleVersion(r.version),
      shopHours,
      hours,
      blocks: Object.freeze(blocks),
    });
  } catch {
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  }
}
