import type { ReservaRemotaGateway } from './reservation-remote-gateway';
import type {
  BookingOfferGateway,
  BookingOffer,
  VisibleBookingShop,
} from './booking-offer-gateway';
import type {
  AvailableSlot,
  BookingDetail,
  BookingResult,
  ReservationInput,
} from '../domain/types';
import { BusinessError, type BusinessErrorCode } from '../domain/values';
import {
  reservationId,
  reservationInput,
  slotQuery,
} from '../domain/reservation-input';
import { createRequestReservation } from './request-reservation';
export interface BookingScope {
  readonly userId: string;
  readonly generation: number;
  readonly contextKey: string;
}
export interface BookingView {
  readonly phase:
    | 'idle'
    | 'loading-shops'
    | 'loading-offer'
    | 'loading-slots'
    | 'confirming'
    | 'confirmed'
    | 'error';
  readonly shops: readonly VisibleBookingShop[];
  readonly shopsQueried: boolean;
  readonly hasMore: boolean;
  readonly offer: BookingOffer | null;
  readonly serviceIds: readonly string[];
  readonly barberId: string | null;
  readonly date: string;
  readonly startsAt: string | null;
  readonly slots: readonly AvailableSlot[];
  readonly slotsQueried: boolean;
  readonly result: BookingResult | null;
  readonly uncertain: boolean;
  readonly error: {
    readonly code: BusinessErrorCode;
    readonly professionalUnavailable: boolean;
  } | null;
  readonly paymentMethod?: 'cash' | 'yape';
  readonly own: readonly BookingDetail[];
  readonly ownPhase: 'idle' | 'loading' | 'ready' | 'error';
  readonly ownError: BusinessErrorCode | null;
}
export function createBookingApplication(deps: {
  gateway: Pick<
    ReservaRemotaGateway,
    'confirm' | 'listSlots' | 'listOwnReservations'
  >;
  offers: BookingOfferGateway;
  scope: () => BookingScope | null;
  requestId: () => string;
  today: () => string;
}) {
  const initial = (): BookingView =>
    Object.freeze({
      phase: 'idle',
      shops: [],
      shopsQueried: false,
      hasMore: false,
      offer: null,
      serviceIds: [],
      barberId: null,
      date: deps.today(),
      startsAt: null,
      slots: [],
      slotsQueried: false,
      result: null,
      uncertain: false,
      error: null,
      own: [],
      ownPhase: 'idle',
      ownError: null,
    });
  let snapshot = initial(),
    owner = '',
    epoch = 0,
    offerTicket = 0,
    slotsTicket = 0,
    shopsTicket = 0,
    ownTicket = 0,
    restoreTicket = 0;
  let pending: ReservationInput | null = null,
    confirmation: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const scopeKey = () => {
    const s = deps.scope();
    return s ? `${s.userId}:${s.generation}:${s.contextKey}` : '';
  };
  const publish = (next: Partial<BookingView>) => {
    snapshot = Object.freeze({ ...snapshot, ...next });
    for (const f of listeners) f();
  };
  function invalidateScope() {
    const key = scopeKey();
    if (key !== owner) {
      owner = key;
      epoch++;
      pending = null;
      confirmation = null;
      snapshot = initial();
      for (const f of listeners) f();
    }
  }
  const capture = () => {
    invalidateScope();
    if (!owner) throw new BusinessError('UNAUTHENTICATED');
    return { epoch, key: owner };
  };
  const current = (token: { epoch: number; key: string }) =>
    token.epoch === epoch && token.key === scopeKey();
  const error = (e: unknown) =>
    e instanceof BusinessError
      ? e
      : new BusinessError('DEPENDENCY_UNAVAILABLE');
  const fail = (e: unknown) => {
    const f = error(e);
    publish({
      phase: 'error',
      error: {
        code: f.code,
        professionalUnavailable: f.reason === 'professional-unavailable',
      },
    });
  };
  const locked = () =>
    confirmation !== null ||
    snapshot.phase === 'confirming' ||
    snapshot.uncertain ||
    !!snapshot.result;
  function criteria(update: Partial<BookingView>) {
    try {
      capture();
      if (locked()) return;
      slotsTicket++;
      pending = null;
      publish({
        ...update,
        slots: [],
        slotsQueried: false,
        startsAt: null,
        error: null,
        phase: 'idle',
      });
    } catch (e) {
      fail(e);
    }
  }
  const solicit = createRequestReservation(deps.gateway);
  const api = {
    choosePayment(method: 'cash' | 'yape') {
      capture();
      if (locked()) return;
      if (!['cash', 'yape'].includes(method))
        throw new BusinessError('INVALID_INPUT');
      pending = null;
      publish({ paymentMethod: method });
    },
    getScope: deps.scope,
    async restoreConfirmation(id: string) {
      const token = capture();
      const ticket = ++restoreTicket;
      id = reservationId(id);
      if (snapshot.result) {
        if (snapshot.result.detail.id !== id)
          throw new BusinessError('CONFLICT');
        return;
      }
      const own = await deps.gateway.listOwnReservations(id);
      if (
        !current(token) ||
        ticket !== restoreTicket ||
        confirmation ||
        snapshot.result
      )
        throw new BusinessError('FORBIDDEN');
      const detail = own.find(
        (row) => row.id === id && row.state === 'confirmed',
      );
      if (!detail) throw new BusinessError('NOT_AVAILABLE');
      publish({
        result: { detail, replayed: true },
        uncertain: false,
        phase: 'confirmed',
        error: null,
      });
    },
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    invalidateScope,
    async loadShops(cursor: string | null = null, name = '') {
      if (confirmation !== null) return;
      let token: ReturnType<typeof capture> | undefined;
      try {
        token = capture();
        const ticket = ++shopsTicket;
        if (cursor) reservationId(cursor);
        if (name.length > 200) throw new BusinessError('INVALID_INPUT');
        publish({ phase: 'loading-shops', error: null });
        const shops = await deps.offers.listVisibleShops(cursor, name);
        if (!current(token) || ticket !== shopsTicket) return;
        publish({
          shops: cursor
            ? [
                ...snapshot.shops,
                ...shops.filter(
                  (s) =>
                    !snapshot.shops.some(
                      (old) => old.barbershopId === s.barbershopId,
                    ),
                ),
              ]
            : shops,
          shopsQueried: true,
          hasMore: shops.length === 50,
          phase: 'idle',
        });
      } catch (e) {
        if (!token || current(token)) fail(e);
      }
    },
    async chooseShop(id: string, professionalId: string | null = null) {
      let token: ReturnType<typeof capture> | undefined;
      try {
        token = capture();
        if (locked()) return;
        const shop = reservationId(id),
          ticket = ++offerTicket;
        slotsTicket++;
        pending = null;
        publish({
          offer: null,
          paymentMethod: undefined,
          serviceIds: [],
          barberId: null,
          slots: [],
          slotsQueried: false,
          startsAt: null,
          error: null,
          result: null,
          phase: 'loading-offer',
        });
        const offer = await deps.offers.getCatalog(shop);
        if (!current(token) || ticket !== offerTicket) return;
        if (offer.barbershopId !== shop)
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        if (
          professionalId !== null &&
          !offer.professionals.some(
            (p) =>
              p.id === professionalId && p.active && p.barbershopId === shop,
          )
        )
          throw new BusinessError('NOT_AVAILABLE', 'professional-unavailable');
        publish({ offer, barberId: professionalId, phase: 'idle' });
      } catch (e) {
        if (!token || current(token)) fail(e);
      }
    },
    setServices(ids: readonly string[]) {
      try {
        if (
          !snapshot.offer ||
          ids.some(
            (id) =>
              !snapshot.offer?.services.some((s) => s.id === id && s.active),
          ) ||
          new Set(ids).size !== ids.length
        )
          throw new BusinessError('INVALID_INPUT');
        const compatible =
          snapshot.barberId !== null &&
          ids.every((id) =>
            snapshot.offer?.capabilities.some(
              (c) => c.barberId === snapshot.barberId && c.serviceId === id,
            ),
          );
        criteria({
          serviceIds: Object.freeze([...ids]),
          barberId: compatible ? snapshot.barberId : null,
        });
      } catch (e) {
        fail(e);
      }
    },
    setProfessional(id: string | null) {
      try {
        if (
          id !== null &&
          !snapshot.offer?.professionals.some((p) => p.id === id && p.active)
        )
          throw new BusinessError('INVALID_INPUT');
        criteria({ barberId: id });
      } catch (e) {
        fail(e);
      }
    },
    setDate(date: string) {
      criteria({ date });
    },
    chooseSlot(startsAt: string) {
      try {
        capture();
        if (locked()) return;
        if (!snapshot.slots.some((s) => s.startsAt === startsAt))
          throw new BusinessError('INVALID_INPUT');
        publish({ startsAt, error: null });
      } catch (e) {
        fail(e);
      }
    },
    async querySlots() {
      let token: ReturnType<typeof capture> | undefined;
      try {
        token = capture();
        if (locked()) return;
        if (!snapshot.offer) throw new BusinessError('INVALID_INPUT');
        const query = slotQuery({
            barbershopId: snapshot.offer.barbershopId,
            localDate: snapshot.date,
            serviceIds: snapshot.serviceIds,
            barberId: snapshot.barberId,
          }),
          ticket = ++slotsTicket;
        publish({
          phase: 'loading-slots',
          slots: [],
          startsAt: null,
          error: null,
        });
        const slots = await deps.gateway.listSlots(query);
        if (!current(token) || ticket !== slotsTicket) return;
        publish({ slots, slotsQueried: true, phase: 'idle' });
      } catch (e) {
        if (!token || current(token)) fail(e);
      }
    },
    confirm(): Promise<void> {
      if (confirmation) return confirmation;
      let token: ReturnType<typeof capture>;
      try {
        token = capture();
        if (snapshot.result) return Promise.resolve();
        if (!pending) {
          if (
            !snapshot.offer ||
            !snapshot.startsAt ||
            !snapshot.slots.some((s) => s.startsAt === snapshot.startsAt)
          )
            throw new BusinessError('INVALID_INPUT');
          pending = reservationInput({
            ...(snapshot.paymentMethod
              ? { paymentMethod: snapshot.paymentMethod }
              : {}),
            requestId: deps.requestId(),
            barbershopId: snapshot.offer.barbershopId,
            serviceIds: snapshot.serviceIds,
            barberId: snapshot.barberId,
            startsAt: snapshot.startsAt,
          });
        }
      } catch (e) {
        fail(e);
        return Promise.resolve();
      }
      const input = pending;
      publish({ phase: 'confirming', error: null });
      const task = (async () => {
        try {
          const result = await solicit(input);
          if (!current(token)) return;
          pending = null;
          publish({ result, uncertain: false, phase: 'confirmed' });
        } catch (e) {
          if (!current(token)) return;
          const f = error(e),
            uncertain = f.code === 'DEPENDENCY_UNAVAILABLE';
          if (!uncertain) pending = null;
          publish({
            uncertain,
            ...(f.code === 'CONFLICT' ? { slots: [], startsAt: null } : {}),
            phase: 'error',
            error: {
              code: f.code,
              professionalUnavailable: f.reason === 'professional-unavailable',
            },
          });
        } finally {
          if (current(token)) confirmation = null;
        }
      })();
      confirmation = task;
      return task;
    },
    startAnother() {
      restoreTicket++;
      try {
        capture();
        if (snapshot.uncertain || snapshot.phase === 'confirming') return;
        pending = null;
        publish({
          result: null,
          slots: [],
          startsAt: null,
          error: null,
          phase: 'idle',
        });
      } catch (e) {
        fail(e);
      }
    },
    async loadOwn() {
      let token: ReturnType<typeof capture> | undefined;
      try {
        token = capture();
        const ticket = ++ownTicket;
        publish({ ownPhase: 'loading', ownError: null });
        const own = await deps.gateway.listOwnReservations();
        if (!current(token) || ticket !== ownTicket) return;
        publish({ own, ownPhase: 'ready' });
      } catch (e) {
        if (!token || current(token))
          publish({ own: [], ownPhase: 'error', ownError: error(e).code });
      }
    },
    dispose() {
      epoch++;
      owner = '';
      pending = null;
      confirmation = null;
      snapshot = initial();
      listeners.clear();
    },
  };
  invalidateScope();
  return api;
}
export type BookingApplication = ReturnType<typeof createBookingApplication>;
