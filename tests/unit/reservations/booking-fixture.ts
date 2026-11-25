import {
  utcInstant,
  moneyPEN,
} from '../../../src/features/reservations/domain/values.js';
import type {
  BookingDetail,
  ReservationInput,
} from '../../../src/features/reservations/domain/types.js';
export const id = (n: number) =>
  '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
export const detail: BookingDetail = {
  id: id(5),
  barbershopId: id(1),
  barberId: id(3),
  state: 'confirmed',
  startsAt: utcInstant('2026-11-18T15:00:00.000Z'),
  endsAt: utcInstant('2026-11-18T15:30:00.000Z'),
  durationMin: 30,
  shopNameSnapshot: 'Local',
  barberNameSnapshot: 'Professional',
  clientDisplayNameSnapshot: 'Client',
  total: moneyPEN(2500),
  items: [
    {
      serviceId: id(2),
      nameSnapshot: 'Service',
      descriptionSnapshot: 'Description',
      priceSnapshot: moneyPEN(2500),
      durationMin: 30,
    },
  ],
  policySnapshot: {
    minimumNoticeMin: 0,
    bookingHorizonDays: 30,
    maxFuturePerClient: 12,
    slotStepMin: 15,
    bufferMin: 0,
    cancellationAdvanceMin: 120,
  },
};
export const input: ReservationInput = {
  requestId: id(10),
  barbershopId: id(1),
  serviceIds: [id(2)],
  barberId: null,
  startsAt: detail.startsAt,
};
