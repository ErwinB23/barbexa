import type { CancellationInput } from './types.ts';
import { BusinessError } from './values.ts';
import { reservationId } from './reservation-input.ts';
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
