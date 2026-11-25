import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { loadCore } from './load-core.mjs';
const root = 'src/features/barbershop-operation/';
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const closure = (withdrawn = false) => ({
  id: id(3),
  barbershopId: id(2),
  startsAt: '2099-01-01T15:00:00.000Z',
  endsAt: '2099-01-01T16:00:00.000Z',
  reason: 'Original closure',
  status: withdrawn ? 'withdrawn' : 'active',
  withdrawal: withdrawn
    ? {
        eventId: id(5),
        actorUserId: id(1),
        occurredAt: '2098-01-01T12:00:00.000Z',
        reason: 'Prueba',
      }
    : null,
});
function domain() {
  assert.ok(
    fs.existsSync(root + 'domain/shop-closure.ts'),
    'MISSING_CLOSURE_CONTRACT',
  );
  return loadCore(root + 'domain/shop-closure.ts');
}
test('closure commands are closed, contextual and require a trimmed nonempty reason', () => {
  const { parseShopClosure } = domain();
  const valid = {
    action: 'withdraw-shop-closure',
    barbershopId: id(2),
    closureId: id(3),
    requestId: id(4),
    reason: '  Prueba  ',
  };
  assert.equal(parseShopClosure(valid).reason, 'Prueba');
  for (const value of [
    { ...valid, reason: '\t\n\u00a0' },
    { ...valid, reason: 'x'.repeat(2001) },
    { ...valid, actorId: id(1) },
    { ...valid, barberId: id(9) },
    { ...valid, closureId: 'bad' },
  ])
    assert.throws(
      () => parseShopClosure(value),
      (e) => e.code === 'INVALID_INPUT',
    );
});
test('closure projections reject tenant bleed and incomplete withdrawal audit', () => {
  const { decodeShopClosure } = domain();
  assert.equal(decodeShopClosure(closure(), id(2)).status, 'active');
  assert.equal(
    decodeShopClosure(closure(true), id(2)).withdrawal.reason,
    'Prueba',
  );
  for (const value of [
    { ...closure(), barbershopId: id(9) },
    { ...closure(), status: 'withdrawn' },
    { ...closure(true), withdrawal: { reason: ' ' } },
  ])
    assert.throws(
      () => decodeShopClosure(value, id(2)),
      (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
    );
});
function appFixture() {
  assert.ok(
    fs.existsSync(root + 'application/shop-closures.ts'),
    'MISSING_CLOSURE_APPLICATION',
  );
  const { createShopClosures } = loadCore(
    root + 'application/shop-closures.ts',
  );
  let scope = {
    userId: id(1),
    barbershopId: id(2),
    role: 'administrator',
    generation: 1,
  };
  const calls = [];
  const gateway = {
    executeShopClosure: async (input) => {
      calls.push(input);
      return input.action === 'list-shop-closures'
        ? { barbershopId: id(2), closures: [closure()], nextCursor: null }
        : { closure: closure(true), replayed: false };
    },
  };
  return {
    app: createShopClosures({ scope: () => scope, gateway }),
    calls,
    gateway,
    setScope: (s) => {
      scope = s;
    },
  };
}
test('closure application injects selected tenant and never trusts an actor from the form', async () => {
  const f = appFixture();
  assert.equal((await f.app.list()).closures.length, 1);
  const v = await f.app.withdraw({
    closureId: id(3),
    requestId: id(4),
    reason: 'Prueba',
  });
  assert.equal(v.closure.status, 'withdrawn');
  assert.equal(f.calls[1].barbershopId, id(2));
  assert.equal('actorId' in f.calls[1], false);
  f.setScope({
    userId: id(1),
    barbershopId: id(2),
    role: 'barber',
    generation: 2,
  });
  await assert.rejects(
    f.app.withdraw({ closureId: id(3), requestId: id(4), reason: 'X' }),
    (e) => e.code === 'FORBIDDEN',
  );
  assert.equal(f.calls.length, 2);
});
test('closure duplicate mutation and late cross-context responses stay blocked', async () => {
  const f = appFixture();
  let release;
  f.gateway.executeShopClosure = () =>
    new Promise((r) => {
      release = r;
    });
  const input = { closureId: id(3), requestId: id(4), reason: 'Prueba' };
  const pending = f.app.withdraw(input);
  await assert.rejects(f.app.withdraw(input), (e) => e.code === 'CONFLICT');
  f.setScope({
    userId: id(1),
    barbershopId: id(9),
    role: 'administrator',
    generation: 2,
  });
  release({ closure: closure(true), replayed: false });
  await assert.rejects(pending, (e) => e.code === 'FORBIDDEN');
});

test('closure HTTP verifies user, sends closed command, invalidates cache around write and on failure', async () => {
  const { createOperationHttpAdapter } = loadCore(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  const calls = [];
  let invalidations = 0,
    fail = false,
    verified = true;
  const gateway = createOperationHttpAdapter({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => id(1),
    getAccessToken: async () => 'fixture',
    catalogCache: {
      invalidate() {
        invalidations++;
      },
    },
    fetcher: async (url, init) => {
      calls.push({ url, body: init.body });
      if (url.endsWith('/auth/v1/user'))
        return new Response(
          JSON.stringify({
            id: id(1),
            is_anonymous: !verified,
            email_confirmed_at: '2026-11-20',
          }),
        );
      return new Response(
        JSON.stringify(
          fail
            ? { error: { code: 'FORBIDDEN', message: 'private detail' } }
            : { closure: closure(true), replayed: false },
        ),
        { status: fail ? 403 : 200 },
      );
    },
  });
  const input = {
    action: 'withdraw-shop-closure',
    barbershopId: id(2),
    closureId: id(3),
    requestId: id(4),
    reason: '  Prueba  ',
  };
  await gateway.executeShopClosure(input);
  assert.equal(invalidations, 2);
  assert.ok(calls[0].url.endsWith('/auth/v1/user'));
  assert.equal(JSON.parse(calls[1].body).reason, 'Prueba');
  assert.equal('actorUserId' in JSON.parse(calls[1].body), false);
  fail = true;
  await assert.rejects(
    gateway.executeShopClosure(input),
    (e) => e.code === 'FORBIDDEN' && !e.message.includes('private'),
  );
  assert.equal(invalidations, 4);
  verified = false;
  const n = calls.length;
  await assert.rejects(
    gateway.executeShopClosure(input),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  assert.equal(calls.length, n + 1);
  assert.equal(invalidations, 6);
  await assert.rejects(
    gateway.executeShopClosure({ ...input, actorUserId: id(1) }),
    (e) => e.code === 'INVALID_INPUT',
  );
  assert.equal(invalidations, 6);
});
