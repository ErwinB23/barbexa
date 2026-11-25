import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperationApplication,
  type OperationManagementGateway,
  type OperationScope,
} from '../../../src/features/barbershop-operation/application/operation-application.js';
import {
  moneyPEN,
  utcInstant,
  BusinessError,
} from '../../../src/features/barbershop-operation/domain/values.js';
const user = '00000000-0000-4000-8000-000000000001',
  shopId = '00000000-0000-4000-8000-000000000002',
  entity = '00000000-0000-4000-8000-000000000003';
function fixture() {
  let scope: OperationScope | null = {
    userId: user,
    generation: 1,
    barbershopId: shopId,
    role: 'administrator',
  };
  const calls: unknown[][] = [];
  const record = (...args: unknown[]) => {
    calls.push(args);
  };
  const invitation = {
    id: entity,
    barbershopId: shopId,
    role: 'barber' as const,
    status: 'pending' as const,
  };
  const gateway: OperationManagementGateway = {
    async getOwnProfessional() {
      throw Error('own profile outside this scenario');
    },
    async updateOwnProfessional() {
      throw Error('own profile outside this scenario');
    },
    async configureShop(d) {
      record('configure', d);
    },
    async setPublication(...a) {
      record('publication', ...a);
    },
    async upsertService(d) {
      record('service', d);
      return { ...d, id: d.id ?? entity };
    },
    async setProfessional(d) {
      record('professional', d);
      return { ...d, id: d.id ?? entity };
    },
    async setCapabilities(...a) {
      record('capabilities', ...a);
    },
    async setShopHours(...a) {
      record('shop-hours', ...a);
    },
    async setBarberHours(...a) {
      record('barber-hours', ...a);
    },
    async setException(d) {
      record('exception', d);
    },
    async inviteExistingUser(...a) {
      record('invite', ...a);
      return invitation;
    },
    async respondInvitation(...a) {
      record('respond', ...a);
      return invitation;
    },
    async cancelInvitation(...a) {
      record('cancel', ...a);
      return invitation;
    },
    async getCatalog() {
      throw Error('not used by application');
    },
    async getManagement(...a) {
      record('load', ...a);
      return {
        services: [],
        professionals: [],
        hours: [],
        capabilities: [],
        members: [],
        invitations: [],
        settings: null,
      };
    },
    async listOwnInvitations() {
      record('own-invitations');
      return [invitation];
    },
  };
  const app = createOperationApplication({
    gateway,
    scope: () => scope,
    createShop: async (name) => {
      record('create', name);
      return { id: shopId, name };
    },
  });
  return {
    app,
    gateway,
    calls,
    setScope: (s: OperationScope | null) => {
      scope = s;
    },
  };
}
test('operation application routes each concrete action through its existing port and selected tenant', async () => {
  const f = fixture(),
    a = f.app;
  assert.equal(a.getScope()?.userId, user);
  assert.ok(a.scopeKey().includes(shopId));
  assert.equal((await a.createShop('  Local  ')).name, 'Local');
  await a.load();
  await a.listOwnInvitations();
  await a.configure({
    publicContact: 'Local',
    address: 'Test',
    policies: {
      minimumNoticeMin: 0,
      bookingHorizonDays: 10,
      maxFuturePerClient: 3,
      slotStepMin: 15,
      bufferMin: 0,
      cancellationAdvanceMin: 120,
    },
  });
  await a.setPublication('published');
  await a.upsertService({
    name: 'Service',
    description: 'Description',
    price: moneyPEN(2500),
    durationMin: 30,
    active: true,
  });
  await a.setProfessional({
    userId: user,
    professionalName: 'Professional',
    active: true,
  });
  await a.setCapabilities(entity, [entity]);
  await a.setHours(null, []);
  await a.setHours(entity, []);
  await a.setException({
    barberId: null,
    startsAt: utcInstant('2026-12-01T15:00:00.000Z'),
    endsAt: utcInstant('2026-12-01T16:00:00.000Z'),
    reason: null,
  });
  await a.invite('fixture@example.invalid');
  await a.respondInvitation(entity, 'accept');
  await a.cancelInvitation(entity);
  assert.equal(f.calls.length, 14);
  assert.deepEqual(
    f.calls.find((c) => c[0] === 'barber-hours'),
    ['barber-hours', shopId, entity, []],
  );
  assert.deepEqual(
    f.calls.find((c) => c[0] === 'publication'),
    ['publication', shopId, 'published'],
  );
});
test('ordinary identities cannot acquire admin scope but zero memberships allow own creation and recipient operations', async () => {
  const f = fixture();
  f.setScope(null);
  assert.equal(f.app.scopeKey(), '');
  await assert.rejects(
    f.app.createShop('New'),
    (e) => (e as BusinessError).code === 'UNAUTHENTICATED',
  );
  f.setScope({ userId: user, generation: 1 });
  await assert.rejects(
    f.app.load(),
    (e) => (e as BusinessError).code === 'FORBIDDEN',
  );
  await assert.rejects(
    f.app.createShop('   '),
    (e) => (e as BusinessError).code === 'INVALID_INPUT',
  );
  await f.app.createShop('Zero');
  await f.app.respondInvitation(entity, 'reject');
  f.setScope({
    userId: user,
    generation: 2,
    barbershopId: shopId,
    role: 'barber',
  });
  await assert.rejects(
    f.app.setPublication('paused'),
    (e) => (e as BusinessError).code === 'FORBIDDEN',
  );
});
test('busy mutation fails closed and late result is rejected after identity generation changes', async () => {
  const f = fixture();
  let release: () => void = () => {};
  f.gateway.setPublication = () =>
    new Promise<void>((resolve) => {
      release = resolve;
    });
  const pending = f.app.setPublication('paused');
  await assert.rejects(
    f.app.setPublication('paused'),
    (e) => (e as BusinessError).code === 'CONFLICT',
  );
  f.setScope({
    userId: user,
    generation: 3,
    barbershopId: shopId,
    role: 'administrator',
  });
  release();
  await assert.rejects(
    pending,
    (e) => (e as BusinessError).code === 'FORBIDDEN',
  );
});
