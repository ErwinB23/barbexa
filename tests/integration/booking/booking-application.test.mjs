import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCoreLoader } from './load-core.mjs';
const id = (n) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
const shop = id(1),
  service = id(2),
  barber = id(3),
  start = '2026-11-18T15:00:00.000Z';
function fixture() {
  let scope = { userId: id(4), generation: 1, contextKey: 'none' },
    calls = 0;
  const detail = {
    id: id(5),
    barbershopId: shop,
    barberId: barber,
    startsAt: start,
    endsAt: '2026-11-18T15:30:00.000Z',
  };
  const gateway = {
    confirm: async (input) => {
      calls++;
      return { detail, replayed: false };
    },
    listSlots: async () => [
      {
        startsAt: start,
        endsAt: detail.endsAt,
        estimatedTotal: { amountMinor: 2500, currency: 'PEN' },
      },
    ],
    listOwnReservations: async () => [detail],
  };
  const offer = {
    barbershopId: shop,
    name: 'Local',
    publicationState: 'published',
    services: [
      {
        id: service,
        barbershopId: shop,
        name: 'Service',
        description: '',
        price: { amountMinor: 2500, currency: 'PEN' },
        durationMin: 30,
        active: true,
      },
    ],
    professionals: [
      {
        id: barber,
        barbershopId: shop,
        professionalName: 'Professional',
        active: true,
      },
    ],
    capabilities: [{ barberId: barber, serviceId: service }],
  };
  const load = createCoreLoader();
  const entry = 'src/features/reservations/application/booking-application.ts';
  const module = fs.existsSync(entry) ? load(entry) : {};
  assert.equal(
    typeof module.createBookingApplication,
    'function',
    'T018 booking application not implemented',
  );
  let count = 10;
  const app = module.createBookingApplication({
    gateway,
    offers: {
      listVisibleShops: async () => [offer],
      getCatalog: async () => offer,
    },
    scope: () => scope,
    requestId: () => id(count++),
    today: () => start.slice(0, 10),
  });
  const prepare = async () => {
    await app.loadShops();
    await app.chooseShop(shop);
    app.setServices([service]);
    app.setDate(start.slice(0, 10));
    app.setProfessional(null);
    await app.querySlots();
    app.chooseSlot(start);
  };
  return {
    app,
    gateway,
    offer,
    prepare,
    detail,
    BusinessError: load('src/features/reservations/domain/values.ts')
      .BusinessError,
    calls: () => calls,
    setScope: (s) => (scope = s),
  };
}
test('detail preselects only a real professional and keeps it for compatible services', async () => {
  const f = fixture();
  await f.app.chooseShop(shop, barber);
  assert.equal(f.app.getSnapshot().barberId, barber);
  f.app.setServices([service]);
  assert.equal(f.app.getSnapshot().barberId, barber);
  await f.app.chooseShop(shop, id(999));
  assert.equal(f.app.getSnapshot().offer, null);
  assert.equal(f.app.getSnapshot().error.professionalUnavailable, true);
});

test('a service incompatible with the preselected professional resets only that choice', async () => {
  const f = fixture();
  f.offer.services.push({ ...f.offer.services[0], id: id(6) });
  await f.app.chooseShop(shop, barber);
  f.app.setServices([id(6)]);
  assert.equal(f.app.getSnapshot().barberId, null);
  assert.equal(f.app.getSnapshot().serviceIds[0], id(6));
});

test('booking selects real offer slots and confirmation while duplicate activation never duplicates request', async () => {
  const f = fixture();
  await f.prepare();
  await f.app.confirm();
  await f.app.confirm();
  assert.equal(f.calls(), 1);
  assert.equal(f.app.getSnapshot().result.detail.id, f.detail.id);
  await f.app.loadOwn();
  assert.equal(f.app.getSnapshot().own.length, 1);
});
test('lost response locks draft and retry preserves exact request id', async () => {
  const f = fixture();
  const seen = [];
  f.gateway.confirm = async (value) => {
    seen.push(value);
    if (seen.length === 1) throw new f.BusinessError('DEPENDENCY_UNAVAILABLE');
    return { detail: f.detail, replayed: true };
  };
  await f.prepare();
  await f.app.confirm();
  assert.equal(f.app.getSnapshot().uncertain, true);
  f.app.setDate('2026-11-19');
  assert.equal(f.app.getSnapshot().date, '2026-11-18');
  await f.app.confirm();
  assert.equal(seen[0].requestId, seen[1].requestId);
  assert.equal(f.app.getSnapshot().result.replayed, true);
});
test('conflict clears stale availability but permits a fresh server query', async () => {
  const f = fixture();
  f.gateway.confirm = async () => {
    throw new f.BusinessError('CONFLICT', 'professional-unavailable');
  };
  await f.prepare();
  await f.app.confirm();
  assert.equal(f.app.getSnapshot().slots.length, 0);
  assert.equal(f.app.getSnapshot().uncertain, false);
  await f.app.querySlots();
  assert.equal(f.app.getSnapshot().slots.length, 1);
});
test('old owner response is discarded when session or context changes', async () => {
  const f = fixture();
  let release;
  f.gateway.listOwnReservations = () => new Promise((r) => (release = r));
  const pending = f.app.loadOwn();
  f.setScope({ userId: id(9), generation: 2, contextKey: 'other' });
  f.app.invalidateScope();
  release([f.detail]);
  await pending;
  assert.equal(f.app.getSnapshot().own.length, 0);
});

test('confirmation reload reads the current user reservations without confirming again', async () => {
  const f = fixture();
  f.detail.state = 'confirmed';
  await f.app.restoreConfirmation(f.detail.id);
  assert.equal(f.app.getSnapshot().result.detail.id, f.detail.id);
  assert.equal(f.calls(), 0);
  await f.app.confirm();
  assert.equal(f.calls(), 0);
});
test('confirmation reload rejects missing, cancelled and malformed reservations', async () => {
  const f = fixture();
  f.detail.state = 'cancelled';
  await assert.rejects(f.app.restoreConfirmation(f.detail.id));
  await assert.rejects(f.app.restoreConfirmation(id(999)));
  await assert.rejects(f.app.restoreConfirmation('invalid'));
  assert.equal(f.app.getSnapshot().result, null);
  assert.equal(f.calls(), 0);
});
test('confirmation reload discards a late result after account or context changes', async () => {
  const f = fixture();
  f.detail.state = 'confirmed';
  let release;
  f.gateway.listOwnReservations = () => new Promise((r) => (release = r));
  const task = f.app.restoreConfirmation(f.detail.id);
  f.setScope(null);
  f.app.invalidateScope();
  release([f.detail]);
  await assert.rejects(task);
  assert.equal(f.app.getSnapshot().result, null);
  assert.equal(f.calls(), 0);
});
