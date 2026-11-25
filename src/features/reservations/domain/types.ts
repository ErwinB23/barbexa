import {
  BusinessError,
  utcInstant,
  type UtcInstant,
  type MoneyPEN,
} from './values';
export interface ReservationPeriod {
  readonly startsAt: UtcInstant;
  readonly endsAt: UtcInstant;
}
export function reservationPeriod(
  startsAt: UtcInstant,
  endsAt: UtcInstant,
): ReservationPeriod {
  const start = utcInstant(startsAt),
    end = utcInstant(endsAt);
  if (Date.parse(end) <= Date.parse(start))
    throw new BusinessError('INVALID_INPUT');
  return Object.freeze({ startsAt: start, endsAt: end });
}
export interface ReservationInput {
  readonly requestId: string;
  readonly barbershopId: string;
  readonly serviceIds: readonly string[];
  readonly barberId: string | null;
  readonly startsAt: UtcInstant;
  readonly paymentMethod?: 'cash' | 'yape';
}
export interface ReservationItem {
  readonly serviceId: string;
  readonly nameSnapshot: string;
  readonly descriptionSnapshot: string;
  readonly priceSnapshot: MoneyPEN;
  readonly durationMin: number;
}
export interface BookingDetail extends ReservationPeriod {
  readonly id: string;
  readonly barbershopId: string;
  readonly barberId: string;
  readonly state: 'confirmed' | 'cancelled';
  readonly shopNameSnapshot: string;
  readonly barberNameSnapshot: string;
  readonly clientDisplayNameSnapshot: string;
  readonly items: readonly ReservationItem[];
  readonly total: MoneyPEN;
  readonly durationMin: number;
  readonly policySnapshot: BookingPolicies;
}
export interface BookingResult {
  readonly detail: BookingDetail;
  readonly replayed: boolean;
}
export interface CancellationInput {
  readonly requestId: string;
  readonly reservationId: string;
  readonly reason?: string;
}
export interface SlotQuery {
  readonly barbershopId: string;
  readonly localDate: string;
  readonly serviceIds: readonly string[];
  readonly barberId: string | null;
}
export interface AvailableSlot extends ReservationPeriod {
  readonly estimatedTotal: MoneyPEN;
}

export interface BookingPolicies {
  readonly minimumNoticeMin: number;
  readonly bookingHorizonDays: number;
  readonly maxFuturePerClient: number;
  readonly slotStepMin: number;
  readonly bufferMin: number;
  readonly cancellationAdvanceMin: number;
}
export interface VerifiedActor {
  readonly userId: string;
}
