import type { ReschedulePolicy, RescheduleEvent } from '../domain/reschedule';
import { record, unavailable, instant } from './booking-payload';
export function reschedulePolicyPayload(
  value: unknown,
  shop: string,
): ReschedulePolicy {
  const v = record(value);
  if (
    v.barbershopId !== shop ||
    !Number.isSafeInteger(v.advanceMin) ||
    Number(v.advanceMin) < 0
  )
    return unavailable();
  return { barbershopId: shop, advanceMin: Number(v.advanceMin) };
}
export function rescheduleHistoryPayload(
  value: unknown,
): readonly RescheduleEvent[] {
  if (!Array.isArray(value) || value.length > 200) return unavailable();
  return value.map((item) => {
    const v = record(item),
      oldStartsAt = instant(v.oldStartsAt),
      newStartsAt = instant(v.newStartsAt),
      occurredAt = instant(v.occurredAt);
    if (
      oldStartsAt === newStartsAt ||
      !['client', 'barber', 'administrator'].includes(String(v.capacity)) ||
      (v.reason !== null &&
        (typeof v.reason !== 'string' || v.reason.length > 2000))
    )
      return unavailable();
    return {
      oldStartsAt,
      newStartsAt,
      occurredAt,
      capacity: v.capacity as RescheduleEvent['capacity'],
      reason: v.reason as string | null,
    };
  });
}
