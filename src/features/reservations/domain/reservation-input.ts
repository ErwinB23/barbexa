import { BusinessError, utcInstant } from './values';
import type { ReservationInput, SlotQuery, VerifiedActor } from './types';
const invalid = (): never => {
  throw new BusinessError('INVALID_INPUT');
};
export function reservationId(v: unknown): string {
  if (
    typeof v !== 'string' ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v)
  )
    return invalid();
  return v.toLowerCase();
}
function record(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalid();
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(v, k))
  )
    return invalid();
  return v;
}
function services(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100)
    return invalid();
  const ids = value.map(reservationId);
  if (new Set(ids).size !== ids.length) return invalid();
  return Object.freeze(ids);
}
export function reservationInput(value: unknown): ReservationInput {
  const withMethod =
    !!value &&
    typeof value === 'object' &&
    Object.hasOwn(value, 'paymentMethod');
  const v = record(value, [
    ...(withMethod ? ['paymentMethod'] : []),
    'requestId',
    'barbershopId',
    'serviceIds',
    'barberId',
    'startsAt',
  ]);
  return Object.freeze({
    ...(withMethod
      ? {
          paymentMethod:
            v.paymentMethod === 'cash' || v.paymentMethod === 'yape'
              ? v.paymentMethod
              : invalid(),
        }
      : {}),
    requestId: reservationId(v.requestId),
    barbershopId: reservationId(v.barbershopId),
    serviceIds: services(v.serviceIds),
    barberId: v.barberId === null ? null : reservationId(v.barberId),
    startsAt: utcInstant(v.startsAt),
  });
}
export function slotQuery(value: unknown): SlotQuery {
  const v = record(value, [
    'barbershopId',
    'localDate',
    'serviceIds',
    'barberId',
  ]);
  if (
    typeof v.localDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v.localDate) ||
    !Number.isFinite(Date.parse(v.localDate + 'T00:00:00.000Z')) ||
    new Date(v.localDate + 'T00:00:00.000Z').toISOString().slice(0, 10) !==
      v.localDate
  )
    return invalid();
  return Object.freeze({
    barbershopId: reservationId(v.barbershopId),
    localDate: v.localDate,
    serviceIds: services(v.serviceIds),
    barberId: v.barberId === null ? null : reservationId(v.barberId),
  });
}
export function reservationActor(value: unknown): VerifiedActor {
  if (!value || typeof value !== 'object' || !('userId' in value))
    throw new BusinessError('UNAUTHENTICATED');
  try {
    return Object.freeze({ userId: reservationId(value.userId) });
  } catch {
    throw new BusinessError('UNAUTHENTICATED');
  }
}
