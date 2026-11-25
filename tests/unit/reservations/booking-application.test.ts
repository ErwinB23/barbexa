import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createBookingApplication,
  type BookingScope,
} from '../../../src/features/reservations/application/booking-application.js';
import type { ReservaRemotaGateway } from '../../../src/features/reservations/application/reservation-remote-gateway.js';
import type {
  BookingOfferGateway,
  BookingOffer,
} from '../../../src/features/reservations/application/booking-offer-gateway.js';
import type {
  BookingResult,
  BookingDetail,
} from '../../../src/features/reservations/domain/types.js';
import { BusinessError } from '../../../src/features/reservations/domain/values.js';
import { detail, id } from './booking-fixture.js';
function fixture() {
  let scope: BookingScope | null = {
      userId: id(4),
      generation: 1,
      contextKey: 'none',
    },
    requests = 0;
  const offer: BookingOffer = {
    barbershopId: id(1),
    name: 'Local',
    publicationState: 'published',
    publicContact: 'Local',
    address: 'Fixture',
    policies: detail.policySnapshot,
    services: [
      {
        id: id(2),
        barbershopId: id(1),
        name: 'Service',
        description: '',
        price: detail.total,
        durationMin: 30,
        active: true,
      },
    ],
    professionals: [
      {
        id: id(3),
        barbershopId: id(1),
        professionalName: 'Professional',
        active: true,
      },
    ],
    capabilities: [{ barberId: id(3), serviceId: id(2) }],
  };
  const gateway: Pick<
    ReservaRemotaGateway,
    'confirm' | 'listSlots' | 'listOwnReservations'
  > = {
    confirm: async () => {
      requests++;
      return { detail, replayed: false };
    },
    listSlots: async () => [
      {
        startsAt: detail.startsAt,
        endsAt: detail.endsAt,
        estimatedTotal: detail.total,
      },
    ],
    listOwnReservations: async () => [detail],
  };
  const offers: BookingOfferGateway = {
    listVisibleShops: async () => [offer],
    getCatalog: async () => offer,
  };
  const app = createBookingApplication({
    gateway,
    offers,
    scope: () => scope,
    requestId: () => id(10),
    today: () => detail.startsAt.slice(0, 10),
  });
  const prepare = async () => {
    await app.loadShops();
    await app.chooseShop(id(1));
    app.setServices([id(2)]);
    app.setProfessional(id(3));
    app.setDate('2026-11-18');
    await app.querySlots();
    app.chooseSlot(detail.startsAt);
  };
  return {
    app,
    gateway,
    offers,
    offer,
    prepare,
    requests: () => requests,
    setScope: (s: BookingScope | null) => {
      scope = s;
    },
  };
}
test('booking state dispatches browsing selection slots confirmation own list and explicit new booking', async () => {
  const f = fixture();
  let updates = 0;
  const off = f.app.subscribe(() => updates++);
  await f.prepare();
  assert.equal(f.app.getSnapshot().slotsQueried, true);
  await f.app.confirm();
  await f.app.confirm();
  assert.equal(f.requests(), 1);
  assert.equal(f.app.getSnapshot().result?.detail.id, detail.id);
  await f.app.loadOwn();
  assert.equal(f.app.getSnapshot().own.length, 1);
  f.app.setDate('2026-11-19');
  assert.equal(f.app.getSnapshot().date, '2026-11-18');
  f.app.startAnother();
  f.app.setProfessional(null);
  assert.equal(f.app.getSnapshot().result, null);
  assert.ok(updates > 5);
  off();
  f.app.dispose();
  assert.equal(f.app.getSnapshot().own.length, 0);
});
test('all invalid or unauthenticated actions fail safely before business transport', async () => {
  const f = fixture();
  f.app.setServices([id(2)]);
  f.app.setProfessional(id(99));
  f.app.chooseSlot(detail.startsAt);
  await f.app.querySlots();
  await f.app.confirm();
  assert.equal(f.requests(), 0);
  await f.app.loadShops(null, 'x'.repeat(201));
  assert.equal(f.app.getSnapshot().error?.code, 'INVALID_INPUT');
  await f.app.loadShops('bad');
  await f.app.chooseShop('bad');
  await f.app.chooseShop(id(1));
  f.app.setServices([id(2), id(2)]);
  f.app.setServices([id(99)]);
  assert.equal(f.app.getSnapshot().serviceIds.length, 0);
  f.setScope(null);
  f.app.invalidateScope();
  await f.app.loadShops();
  await f.app.chooseShop(id(1));
  f.app.setDate('bad');
  f.app.chooseSlot(detail.startsAt);
  await f.app.querySlots();
  await f.app.confirm();
  f.app.startAnother();
  await f.app.loadOwn();
  assert.equal(f.app.getSnapshot().error?.code, 'UNAUTHENTICATED');
  assert.equal(f.app.getSnapshot().ownError, 'UNAUTHENTICATED');
});
test('timeout retains exact request and blocks edits until replay resolves it', async () => {
  const f = fixture(),
    seen: string[] = [];
  f.gateway.confirm = async (value) => {
    seen.push(value.requestId);
    if (seen.length === 1) throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    return { detail, replayed: true };
  };
  await f.prepare();
  await f.app.confirm();
  assert.equal(f.app.getSnapshot().uncertain, true);
  f.app.setDate('2026-11-19');
  f.app.setServices([]);
  f.app.setProfessional(null);
  f.app.chooseSlot(detail.endsAt);
  f.app.startAnother();
  await f.app.chooseShop(id(1));
  await f.app.querySlots();
  assert.equal(f.app.getSnapshot().startsAt, detail.startsAt);
  await f.app.confirm();
  assert.equal(f.app.getSnapshot().result?.replayed, true);
  assert.equal(seen[0], seen[1]);
});
test('definite conflict empties stale slots and dependency errors are not leaked', async () => {
  const f = fixture();
  await f.prepare();
  f.gateway.confirm = async () => {
    throw new BusinessError('CONFLICT', 'professional-unavailable');
  };
  await f.app.confirm();
  assert.equal(f.app.getSnapshot().error?.professionalUnavailable, true);
  assert.equal(f.app.getSnapshot().uncertain, false);
  assert.equal(f.app.getSnapshot().slots.length, 0);
  await f.app.querySlots();
  assert.equal(f.app.getSnapshot().slots.length, 1);
  f.gateway.listSlots = async () => {
    throw Error('provider internal fixture');
  };
  await f.app.querySlots();
  assert.equal(f.app.getSnapshot().error?.code, 'DEPENDENCY_UNAVAILABLE');
  f.gateway.listOwnReservations = async () => {
    throw new BusinessError('FORBIDDEN');
  };
  await f.app.loadOwn();
  assert.equal(f.app.getSnapshot().ownError, 'FORBIDDEN');
  f.offers.listVisibleShops = async () => {
    throw new BusinessError('NOT_AVAILABLE');
  };
  await f.app.loadShops();
  assert.equal(f.app.getSnapshot().error?.code, 'NOT_AVAILABLE');
  f.offers.getCatalog = async () => {
    throw Error('private provider');
  };
  await f.app.chooseShop(id(1));
  assert.equal(f.app.getSnapshot().error?.code, 'DEPENDENCY_UNAVAILABLE');
});
test('pagination appends only distinct shops and mismatched catalogue is rejected', async () => {
  const f = fixture();
  f.offers.listVisibleShops = async () =>
    Array.from({ length: 50 }, (_, n) => ({
      ...f.offer,
      barbershopId: id(n + 100),
    }));
  await f.app.loadShops();
  assert.equal(f.app.getSnapshot().hasMore, true);
  f.offers.listVisibleShops = async () => [
    { ...f.offer, barbershopId: id(100) },
    { ...f.offer, barbershopId: id(999) },
  ];
  await f.app.loadShops(id(149), 'Local');
  assert.equal(f.app.getSnapshot().shops.length, 51);
  assert.equal(f.app.getSnapshot().hasMore, false);
  f.offers.getCatalog = async () => ({ ...f.offer, barbershopId: id(99) });
  await f.app.chooseShop(id(1));
  assert.equal(f.app.getSnapshot().offer, null);
});
test('in flight confirmation is shared and account change discards late confirmation', async () => {
  const f = fixture();
  await f.prepare();
  let release: (r: BookingResult) => void = () => {};
  f.gateway.confirm = () =>
    new Promise((r) => {
      release = r;
    });
  const a = f.app.confirm(),
    b = f.app.confirm();
  assert.equal(a, b);
  await f.app.loadShops();
  assert.equal(f.app.getSnapshot().phase, 'confirming');
  f.app.setDate('2026-11-19');
  f.app.startAnother();
  f.setScope({ userId: id(99), generation: 2, contextKey: 'other' });
  f.app.invalidateScope();
  release({ detail, replayed: false });
  await a;
  assert.equal(f.app.getSnapshot().result, null);
});
test('late browsing slots and own results are discarded including stale rejection', async () => {
  const f = fixture();
  let ownRelease: (d: readonly BookingDetail[]) => void = () => {};
  f.gateway.listOwnReservations = () =>
    new Promise((r) => {
      ownRelease = r;
    });
  const p = f.app.loadOwn();
  f.setScope({ userId: id(99), generation: 2, contextKey: 'B' });
  f.app.invalidateScope();
  ownRelease([detail]);
  await p;
  assert.equal(f.app.getSnapshot().own.length, 0);
  let resolveShop: (v: readonly BookingOffer[]) => void = () => {};
  f.offers.listVisibleShops = () =>
    new Promise((r) => {
      resolveShop = r;
    });
  const pending = f.app.loadShops();
  f.setScope(null);
  f.app.invalidateScope();
  resolveShop([f.offer]);
  await pending;
  assert.equal(f.app.getSnapshot().shops.length, 0);
});
test('payment method persists in the frozen booking request and cannot change during dispatch', async () => {
  const f = fixture();
  await f.prepare();
  f.app.choosePayment('cash');
  assert.equal(f.app.getSnapshot().paymentMethod, 'cash');
  assert.throws(() => f.app.choosePayment('invalid' as 'cash'));
  let finish!: (r: BookingResult) => void;
  f.gateway.confirm = (input) => {
    assert.equal(input.paymentMethod, 'cash');
    return new Promise((r) => {
      finish = r;
    });
  };
  const work = f.app.confirm();
  f.app.choosePayment('yape');
  finish({ detail, replayed: false });
  await work;
  f.app.startAnother();
  await f.app.chooseShop(id(1));
  assert.equal(f.app.getSnapshot().paymentMethod, undefined);
  f.setScope(null);
  assert.throws(() => f.app.choosePayment('cash'));
});
