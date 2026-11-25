import type { MoneyPEN, UtcInstant } from './values';
export interface BookingPolicies {
  readonly minimumNoticeMin: number;
  readonly bookingHorizonDays: number;
  readonly maxFuturePerClient: number;
  readonly slotStepMin: number;
  readonly bufferMin: number;
  readonly cancellationAdvanceMin: number;
}
export interface ShopSetup {
  readonly barbershopId: string;
  readonly publicContact: string;
  readonly address: string;
  readonly policies: BookingPolicies;
}
export type PublicationState = 'draft' | 'published' | 'paused' | 'withdrawn';
export type ServiceCategory =
  'Corte de cabello' | 'Barba' | 'Tratamientos' | 'Otros';
export interface Service {
  readonly category?: ServiceCategory;
  readonly archived?: boolean;
  readonly id: string;
  readonly barbershopId: string;
  readonly name: string;
  readonly description: string;
  readonly price: MoneyPEN;
  readonly durationMin: number;
  readonly active: boolean;
}
export interface Professional {
  readonly id: string;
  readonly barbershopId: string;
  readonly userId: string;
  readonly professionalName: string;
  readonly active: boolean;
}
export interface Hours {
  readonly weekday: number;
  readonly opensMin: number;
  readonly closesMin: number;
}
export interface ScheduleException {
  readonly barbershopId: string;
  readonly barberId: string | null;
  readonly startsAt: UtcInstant;
  readonly endsAt: UtcInstant;
  readonly reason: string | null;
}
export interface StaffInvitation {
  readonly recipientEmail?: string | null;
  readonly createdAt?: string;
  readonly respondedAt?: string | null;
  readonly recipientName?: string | null;
  readonly professionalActive?: boolean | null;
  readonly barbershopName?: string;
  readonly id: string;
  readonly barbershopId: string;
  readonly role: 'barber' | 'administrator';
  readonly status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}
export interface BookingCatalog {
  readonly shopHours?: readonly Hours[];
  readonly shopClosures?: readonly {
    readonly startsAt: string;
    readonly endsAt: string;
  }[];
  readonly barbershopId: string;
  readonly name: string;
  readonly publicationState: 'published' | 'paused';
  readonly publicContact: string;
  readonly address: string;
  readonly policies: BookingPolicies;
  readonly services: readonly Service[];
  readonly professionals: readonly (Omit<Professional, 'userId'> & {
    readonly description?: string;
  })[];
  readonly capabilities: readonly {
    readonly barberId: string;
    readonly serviceId: string;
  }[];
}

export interface VerifiedActor {
  readonly userId: string;
}
