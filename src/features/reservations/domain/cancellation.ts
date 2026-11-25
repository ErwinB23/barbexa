import type { CancellationInput } from './types';
import { BusinessError, utcInstant } from './values';
import { reservationId } from './reservation-input';
export function cancellationInput(input: unknown): CancellationInput {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BusinessError('INVALID_INPUT');
  const v = input as Record<string, unknown>;
  if (
    Object.keys(v).some(
      (k) => !['requestId', 'reservationId', 'reason'].includes(k),
    ) ||
    !Object.hasOwn(v, 'requestId') ||
    !Object.hasOwn(v, 'reservationId') ||
    (Object.hasOwn(v, 'reason') && typeof v.reason !== 'string')
  )
    throw new BusinessError('INVALID_INPUT');
  const reason = typeof v.reason === 'string' ? v.reason.trim() : '';
  return Object.freeze({
    requestId: reservationId(v.requestId),
    reservationId: reservationId(v.reservationId),
    ...(reason ? { reason } : {}),
  });
}
// Display aid only. PostgreSQL rechecks the historical policy at the decision time.
export function clientCancellationAllowed(
  startsAt: string,
  advanceMin: number,
  now: number,
): boolean {
  const start = Date.parse(utcInstant(startsAt));
  if (
    !Number.isSafeInteger(advanceMin) ||
    advanceMin < 0 ||
    !Number.isFinite(now)
  )
    throw new BusinessError('INVALID_INPUT');
  return now <= start - advanceMin * 60000;
}
