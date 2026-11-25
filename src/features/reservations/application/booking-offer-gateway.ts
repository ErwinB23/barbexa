import type { BookingPolicies } from '../domain/types';
import type { MoneyPEN } from '../domain/values';
export interface VisibleBookingShop {
  readonly barbershopId: string;
  readonly name: string;
  readonly publicationState: 'published' | 'paused';
  readonly publicContact: string;
  readonly address: string;
}
export interface BookingOffer extends VisibleBookingShop {
  readonly shopHours?: readonly {
    readonly weekday: number;
    readonly opensMin: number;
    readonly closesMin: number;
  }[];
  readonly shopClosures?: readonly {
    readonly startsAt: string;
    readonly endsAt: string;
  }[];
  readonly policies: BookingPolicies;
  readonly services: readonly {
    readonly id: string;
    readonly barbershopId: string;
    readonly name: string;
    readonly description: string;
    readonly price: MoneyPEN;
    readonly durationMin: number;
    readonly active: boolean;
  }[];
  readonly professionals: readonly {
    readonly id: string;
    readonly barbershopId: string;
    readonly professionalName: string;
    readonly description?: string;
    readonly active: boolean;
  }[];
  readonly capabilities: readonly {
    readonly barberId: string;
    readonly serviceId: string;
  }[];
}
export interface BookingOfferGateway {
  listVisibleShops(
    cursor: string | null,
    name: string,
  ): Promise<readonly VisibleBookingShop[]>;
  getCatalog(shop: string): Promise<BookingOffer>;
}
