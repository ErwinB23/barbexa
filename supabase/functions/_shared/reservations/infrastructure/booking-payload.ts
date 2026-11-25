import type {
  BookingDetail,
  BookingResult,
  BookingPolicies,
  AvailableSlot,
} from '../domain/types.ts';
import {
  BusinessError,
  type BusinessErrorCode,
  moneyPEN,
  utcInstant,
} from '../domain/values.ts';
export const unavailable = (): never => {
  throw new BusinessError('DEPENDENCY_UNAVAILABLE');
};
export function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return unavailable();
  return v as Record<string, unknown>;
}
const text = (v: unknown) => {
  if (typeof v !== 'string') return unavailable();
  return v;
};
const id = (v: unknown) => {
  const s = text(v);
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(s))
    return unavailable();
  return s;
};
const integer = (v: unknown, min = 0) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < min)
    return unavailable();
  return v;
};
const money = (v: unknown) => {
  const r = record(v);
  if (r.currency !== 'PEN') return unavailable();
  return moneyPEN(integer(r.amountMinor));
};
export function instant(v: unknown) {
  if (
    typeof v !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(v) ||
    !Number.isFinite(Date.parse(v))
  )
    return unavailable();
  return utcInstant(new Date(v).toISOString());
}
function policies(v: unknown): BookingPolicies {
  const p = record(v);
  return {
    minimumNoticeMin: integer(p.minimumNoticeMin),
    bookingHorizonDays: integer(p.bookingHorizonDays, 1),
    maxFuturePerClient: integer(p.maxFuturePerClient, 1),
    slotStepMin: integer(p.slotStepMin, 1),
    bufferMin: integer(p.bufferMin),
    cancellationAdvanceMin: integer(p.cancellationAdvanceMin),
  };
}
export function bookingDetail(v: unknown): BookingDetail {
  const r = record(v);
  if (
    !['confirmed', 'cancelled'].includes(String(r.state)) ||
    !Array.isArray(r.items) ||
    r.items.length < 1 ||
    r.items.length > 100
  )
    return unavailable();
  const items = r.items.map((value) => {
    const i = record(value);
    return {
      serviceId: id(i.serviceId),
      nameSnapshot: text(i.nameSnapshot),
      descriptionSnapshot: text(i.descriptionSnapshot),
      priceSnapshot: money(i.priceSnapshot),
      durationMin: integer(i.durationMin, 1),
    };
  });
  const total = money(r.total),
    durationMin = integer(r.durationMin, 1),
    startsAt = instant(r.startsAt),
    endsAt = instant(r.endsAt);
  if (
    new Set(items.map((i) => i.serviceId)).size !== items.length ||
    items.reduce((a, i) => a + i.priceSnapshot.amountMinor, 0) !==
      total.amountMinor ||
    items.reduce((a, i) => a + i.durationMin, 0) !== durationMin ||
    Date.parse(endsAt) - Date.parse(startsAt) !== durationMin * 60000
  )
    return unavailable();
  return {
    id: id(r.id),
    barbershopId: id(r.barbershopId),
    barberId: id(r.barberId),
    state: r.state as BookingDetail['state'],
    startsAt,
    endsAt,
    shopNameSnapshot: text(r.shopNameSnapshot),
    barberNameSnapshot: text(r.barberNameSnapshot),
    clientDisplayNameSnapshot: text(r.clientDisplayNameSnapshot),
    items,
    total,
    durationMin,
    policySnapshot: policies(r.policySnapshot),
  };
}
export function bookingResult(v: unknown): BookingResult {
  const r = record(v);
  if (typeof r.replayed !== 'boolean') return unavailable();
  return { detail: bookingDetail(r.detail), replayed: r.replayed };
}
export function availableSlots(v: unknown): readonly AvailableSlot[] {
  if (!Array.isArray(v) || v.length > 1440) return unavailable();
  return v.map((value) => {
    const r = record(value),
      startsAt = instant(r.startsAt),
      endsAt = instant(r.endsAt);
    if (endsAt <= startsAt) return unavailable();
    return { startsAt, endsAt, estimatedTotal: money(r.estimatedTotal) };
  });
}
export function providerError(value: unknown, status: number): BusinessError {
  const r =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const envelope =
    r.error && typeof r.error === 'object'
      ? (r.error as Record<string, unknown>)
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
    known.find((c) => envelope.code === c || r.message === c) ??
    (['23505', '23P01'].includes(String(r.code))
      ? 'CONFLICT'
      : status === 413 ||
          String(r.code).startsWith('22') ||
          ['23502', '23503', '23514'].includes(String(r.code))
        ? 'INVALID_INPUT'
        : String(r.code).startsWith('28') || status === 401
          ? 'UNAUTHENTICATED'
          : status === 403
            ? 'FORBIDDEN'
            : status === 404
              ? 'NOT_AVAILABLE'
              : 'DEPENDENCY_UNAVAILABLE');
  const occupation =
    code === 'CONFLICT' &&
    (r.message === 'Profesional no disponible en ese horario' ||
      envelope.message === 'Profesional no disponible en ese horario');
  return new BusinessError(
    code,
    occupation ? 'professional-unavailable' : undefined,
  );
}
