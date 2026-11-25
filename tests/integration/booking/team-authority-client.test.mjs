import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCore } from './load-core.mjs';
import { id } from './booking-payload-fixture.mjs';
const payload = (capacity = 'secondary') => ({
  revision: '20261120010538',
  userId: id(1),
  barbershopId: id(2),
  version: 1,
  capacity,
  secondaryCount: null,
  permissions: {
    manageAdministrators: false,
    transferOwnership: false,
    manageTeam: false,
    publish: false,
    refund: false,
    editServices: true,
    editHours: true,
    manageReservations: true,
    confirmPayment: true,
  },
});
test('client checks revision, actor, tenant and the entire fixed permission set', () => {
  const { decodeTeamAuthority } = loadCore(
    'src/features/barbershop-operation/domain/team-authority.ts',
  );
  assert.equal(
    decodeTeamAuthority(payload(), id(1), id(2)).capacity,
    'secondary',
  );
  for (const value of [
    { ...payload(), userId: id(9) },
    { ...payload(), revision: 'old' },
    { ...payload(), permissions: { ...payload().permissions, refund: true } },
    { ...payload(), capacity: 'owner' },
  ])
    assert.throws(() => decodeTeamAuthority(value, id(1), id(2)));
});
test('late capabilities from a different context never restore administrative controls', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  let resolve;
  let scope = {
    userId: id(1),
    barbershopId: id(2),
    generation: 1,
    role: 'administrator',
  };
  const app = createTeamAuthority({
    scope: () => scope,
    gateway: { getAuthority: () => new Promise((r) => (resolve = r)) },
  });
  const request = app.read();
  await Promise.resolve();
  scope = { ...scope, barbershopId: id(3) };
  resolve(payload());
  await request;
  assert.notEqual(app.getSnapshot().phase, 'ready');
});
test('old backend errors stay fail closed and duplicate capability loads share one flight', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  let calls = 0;
  const app = createTeamAuthority({
    scope: () => ({
      userId: id(1),
      barbershopId: id(2),
      generation: 1,
      role: 'administrator',
    }),
    gateway: {
      getAuthority: async () => {
        calls++;
        throw Error('not deployed');
      },
    },
  });
  await Promise.all([app.read(), app.read()]);
  assert.equal(calls, 1);
  assert.equal(app.getSnapshot().phase, 'error');
  assert.equal(app.getSnapshot().value, null);
});
test('secondary cannot dispatch retirement, while owner dispatch uses verified context and version', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  let capacity = 'secondary',
    calls = 0,
    seen;
  const gateway = {
    getAuthority: async () =>
      capacity === 'secondary'
        ? payload()
        : {
            ...payload(),
            capacity: 'owner',
            secondaryCount: 1,
            permissions: Object.fromEntries(
              Object.keys(payload().permissions).map((k) => [k, true]),
            ),
          },
    commandAuthority: async (input) => {
      calls++;
      seen = input;
      return { ok: true };
    },
  };
  const app = createTeamAuthority({
    scope: () => ({
      userId: id(1),
      barbershopId: id(2),
      generation: 1,
      role: 'administrator',
    }),
    gateway,
  });
  const command = {
    action: 'remove-secondary',
    requestId: id(7),
    memberUserId: id(3),
    disposition: 'barber',
    reason: 'Conservar trabajo',
  };
  await assert.rejects(app.execute(command), (e) => e.code === 'FORBIDDEN');
  assert.equal(calls, 0);
  capacity = 'owner';
  await app.execute(command);
  assert.equal(calls, 1);
  assert.equal(seen.barbershopId, id(2));
  assert.equal(seen.expectedVersion, 1);
  assert.equal(seen.requestId, id(7));
});
test('optional authority stays absent in the legacy application: no capability request is introduced', () => {
  const { createOperationApplication } = loadCore(
    'src/features/barbershop-operation/application/operation-application.ts',
  );
  const app = createOperationApplication({
    gateway: {},
    scope: () => null,
    createShop: async () => {
      throw Error('not used');
    },
  });
  assert.equal(app.authority, undefined);
});
test('A to B to A context changes cannot resurrect an earlier owner response', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  let scope = {
    userId: id(1),
    barbershopId: id(2),
    generation: 1,
    role: 'administrator',
  };
  const resolvers = [];
  const app = createTeamAuthority({
    scope: () => scope,
    gateway: {
      getAuthority: () => new Promise((resolve) => resolvers.push(resolve)),
    },
  });
  const first = app.read();
  await Promise.resolve();
  scope = { ...scope, barbershopId: id(3) };
  const second = app.read();
  await Promise.resolve();
  scope = { ...scope, barbershopId: id(2) };
  const last = app.read();
  await Promise.resolve();
  resolvers[2](payload());
  await last;
  resolvers[0]({
    ...payload(),
    capacity: 'owner',
    secondaryCount: 1,
    permissions: Object.fromEntries(
      Object.keys(payload().permissions).map((k) => [k, true]),
    ),
  });
  await first;
  assert.equal(app.getSnapshot().value.capacity, 'secondary');
  resolvers[1]({ ...payload(), barbershopId: id(3) });
  await second;
});
