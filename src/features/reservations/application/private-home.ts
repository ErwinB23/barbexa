import type {
  BookingOffer,
  BookingOfferGateway,
  VisibleBookingShop,
} from './booking-offer-gateway';
import type { BookingScope } from './booking-application';
import type { BookingDetail } from '../domain/types';
import { reservationId } from '../domain/reservation-input';

type Phase = 'idle' | 'loading' | 'ready' | 'error';
export interface PrivateHomeView {
  readonly shops: readonly VisibleBookingShop[];
  readonly shopsPhase: Phase;
  readonly query: string;
  readonly hasMore: boolean;
  readonly offer: BookingOffer | null;
  readonly offerPhase: Phase;
  readonly own: readonly BookingDetail[];
  readonly ownPhase: Phase;
}
export function nextAppointment(own: readonly BookingDetail[], now: number) {
  return (
    own
      .filter((r) => r.state === 'confirmed' && Date.parse(r.startsAt) > now)
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0] ??
    null
  );
}

// Read-only state, deliberately independent of the mutable reservation draft.
export function createPrivateHome(deps: {
  offers: BookingOfferGateway;
  listOwn: () => Promise<readonly BookingDetail[]>;
  scope: () => BookingScope | null;
}) {
  const initial = (): PrivateHomeView => ({
    shops: [],
    shopsPhase: 'idle',
    query: '',
    hasMore: false,
    offer: null,
    offerPhase: 'idle',
    own: [],
    ownPhase: 'idle',
  });
  let snapshot = initial(),
    owner = '',
    epoch = 0,
    shopsTicket = 0,
    offerTicket = 0,
    ownTicket = 0;
  const listeners = new Set<() => void>();
  const key = () => {
    const s = deps.scope();
    return s ? `${s.userId}:${s.generation}:${s.contextKey}` : '';
  };
  const publish = (patch: Partial<PrivateHomeView>) => {
    snapshot = Object.freeze({ ...snapshot, ...patch });
    for (const f of listeners) f();
  };
  function invalidateScope() {
    if (owner === key()) return;
    owner = key();
    epoch++;
    snapshot = initial();
    for (const f of listeners) f();
  }
  const capture = () => {
    invalidateScope();
    return owner ? { epoch, key: owner } : null;
  };
  const current = (token: { epoch: number; key: string }) =>
    token.epoch === epoch && token.key === key();
  async function search(query = '', append = false) {
    const token = capture();
    if (!token) return;
    if (append && (snapshot.shopsPhase === 'loading' || !snapshot.hasMore))
      return;
    const ticket = ++shopsTicket;
    const cursor = append
      ? (snapshot.shops.at(-1)?.barbershopId ?? null)
      : null;
    publish({
      query,
      shopsPhase: 'loading',
      ...(!append ? { shops: [], hasMore: false } : {}),
    });
    try {
      if (query.length > 200) throw Error('INVALID_INPUT');
      const shops = await deps.offers.listVisibleShops(cursor, query);
      if (!current(token) || ticket !== shopsTicket) return;
      publish({
        shops: append
          ? [
              ...snapshot.shops,
              ...shops.filter(
                (s) =>
                  !snapshot.shops.some(
                    (p) => p.barbershopId === s.barbershopId,
                  ),
              ),
            ]
          : shops,
        hasMore: shops.length === 50,
        shopsPhase: 'ready',
      });
    } catch {
      if (current(token) && ticket === shopsTicket)
        publish({ shopsPhase: 'error' });
    }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    invalidateScope,
    search,
    more: () => search(snapshot.query, true),
    async loadOwn() {
      const token = capture();
      if (!token) return;
      const ticket = ++ownTicket;
      publish({ ownPhase: 'loading' });
      try {
        const own = await deps.listOwn();
        if (current(token) && ticket === ownTicket)
          publish({ own, ownPhase: 'ready' });
      } catch {
        if (current(token) && ticket === ownTicket)
          publish({ ownPhase: 'error' });
      }
    },
    async openShop(shop: string) {
      const token = capture();
      if (!token) return;
      const ticket = ++offerTicket;
      publish({ offer: null, offerPhase: 'loading' });
      try {
        const offer = await deps.offers.getCatalog(reservationId(shop));
        if (!current(token) || ticket !== offerTicket) return;
        if (offer.barbershopId !== shop) throw Error('WRONG_SHOP');
        publish({ offer, offerPhase: 'ready' });
      } catch {
        if (current(token) && ticket === offerTicket)
          publish({ offerPhase: 'error' });
      }
    },
    closeShop() {
      offerTicket++;
      publish({ offer: null, offerPhase: 'idle' });
    },
    dispose() {
      epoch++;
      owner = '';
      snapshot = initial();
      listeners.clear();
    },
  };
}
export type PrivateHomeApplication = ReturnType<typeof createPrivateHome>;
