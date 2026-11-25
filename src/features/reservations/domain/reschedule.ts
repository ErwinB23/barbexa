import { reservationId } from './reservation-input';
import { BusinessError, utcInstant, type UtcInstant } from './values';
export interface RescheduleInput {
  readonly requestId: string;
  readonly reservationId: string;
  readonly expectedStartsAt: UtcInstant;
  readonly startsAt: UtcInstant;
  readonly reason?: string;
}
export interface RescheduleQuery {
  readonly reservationId: string;
  readonly localDate: string;
}
function closed(value: unknown, keys: readonly string[]) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(value, k))
  )
    throw new BusinessError('INVALID_INPUT');
  return value as Record<string, unknown>;
}
export function rescheduleInput(value: unknown): RescheduleInput {
  const withReason =
    !!value && typeof value === 'object' && Object.hasOwn(value, 'reason');
  const v = closed(value, [
    'requestId',
    'reservationId',
    'expectedStartsAt',
    'startsAt',
    ...(withReason ? ['reason'] : []),
  ]);
  const expectedStartsAt = utcInstant(v.expectedStartsAt),
    startsAt = utcInstant(v.startsAt);
  if (expectedStartsAt === startsAt) throw new BusinessError('INVALID_INPUT');
  if (withReason && (typeof v.reason !== 'string' || v.reason.length > 2000))
    throw new BusinessError('INVALID_INPUT');
  const reason = typeof v.reason === 'string' ? v.reason.trim() : '';
  return Object.freeze({
    ...(reason ? { reason } : {}),
    requestId: reservationId(v.requestId),
    reservationId: reservationId(v.reservationId),
    expectedStartsAt,
    startsAt,
  });
}
export function rescheduleQuery(value: unknown): RescheduleQuery {
  const v = closed(value, ['reservationId', 'localDate']);
  if (
    typeof v.localDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v.localDate) ||
    !Number.isFinite(Date.parse(v.localDate + 'T00:00:00.000Z')) ||
    new Date(v.localDate + 'T00:00:00.000Z').toISOString().slice(0, 10) !==
      v.localDate
  )
    throw new BusinessError('INVALID_INPUT');
  return Object.freeze({
    reservationId: reservationId(v.reservationId),
    localDate: v.localDate,
  });
}
// Presentation hint only. PostgreSQL must use its own clock and stored policy.
export function clientRescheduleAllowed(
  currentStart: unknown,
  advanceMin: number,
  now: number,
): boolean {
  const start = utcInstant(currentStart);
  if (
    !Number.isSafeInteger(advanceMin) ||
    advanceMin < 0 ||
    !Number.isFinite(now)
  )
    throw new BusinessError('INVALID_INPUT');
  return Date.parse(start) - now >= advanceMin * 60000;
}
export interface ReschedulePolicy {
  readonly barbershopId: string;
  readonly advanceMin: number;
}
export interface RescheduleEvent {
  readonly oldStartsAt: UtcInstant;
  readonly newStartsAt: UtcInstant;
  readonly occurredAt: UtcInstant;
  readonly capacity: 'client' | 'barber' | 'administrator';
  readonly reason: string | null;
}
export function reschedulePolicyCommand(
  value: unknown,
): Readonly<{ barbershopId: string; advanceMin?: number }> {
  const editing =
    !!value && typeof value === 'object' && Object.hasOwn(value, 'advanceMin');
  const v = closed(value, ['barbershopId', ...(editing ? ['advanceMin'] : [])]);
  if (
    editing &&
    (!Number.isSafeInteger(v.advanceMin) || Number(v.advanceMin) < 0)
  )
    throw new BusinessError('INVALID_INPUT');
  return Object.freeze({
    barbershopId: reservationId(v.barbershopId),
    ...(editing ? { advanceMin: Number(v.advanceMin) } : {}),
  });
}
export function rescheduleHistoryQuery(value: unknown): string {
  return reservationId(closed(value, ['reservationId']).reservationId);
}
