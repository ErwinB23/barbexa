export const id = (n) =>
  '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
export const input = {
  requestId: id(10),
  barbershopId: id(1),
  serviceIds: [id(2)],
  barberId: null,
  startsAt: '2026-11-18T15:00:00.000Z',
};
export const detail = {
  id: id(5),
  barbershopId: id(1),
  barberId: id(3),
  state: 'confirmed',
  startsAt: input.startsAt,
  endsAt: '2026-11-18T15:30:00.000Z',
  durationMin: 30,
  shopNameSnapshot: 'Local',
  barberNameSnapshot: 'Professional',
  clientDisplayNameSnapshot: 'Client',
  items: [
    {
      serviceId: id(2),
      nameSnapshot: 'Service',
      descriptionSnapshot: '',
      durationMin: 30,
      priceSnapshot: { amountMinor: 2500, currency: 'PEN' },
    },
  ],
  total: { amountMinor: 2500, currency: 'PEN' },
  policySnapshot: {
    minimumNoticeMin: 0,
    bookingHorizonDays: 30,
    maxFuturePerClient: 12,
    slotStepMin: 15,
    bufferMin: 0,
    cancellationAdvanceMin: 120,
  },
};
