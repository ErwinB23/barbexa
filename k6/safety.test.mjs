import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePermit,
  labOrigin,
  levelPlan,
  validateFixtures,
  assertProgression,
} from './lib/safety.mjs';

const id = '11111111-1111-4111-8111-111111111111';
test('manual progression requires the preceding successful recovered run in the same lab', () => {
  assertProgression(1, null, id, 'read');
  assertProgression(
    100,
    { runId: id, mode: 'read', level: 10, passed: true, recovered: true },
    id,
    'read',
  );
  const receipt = {
    runId: id,
    mode: 'read',
    level: 100,
    passed: true,
    recovered: true,
  };
  assertProgression(200, receipt, id, 'read');
  assertProgression(100, receipt, id, 'read');
  for (const patch of [
    { passed: false },
    { recovered: false },
    { runId: 'other' },
    { mode: 'mixed' },
    { level: 50 },
  ])
    assert.throws(() =>
      assertProgression(200, { ...receipt, ...patch }, id, 'read'),
    );
  assert.throws(() => assertProgression(200, null, id, 'read'));
});
const now = 1_800_000_000_000;
const good = () => ({
  origin: labOrigin,
  projectId: 'barbexa-k6-lab',
  runId: id,
  issuedAt: now - 1000,
  expiresAt: now + 60000,
  containerId: 'a'.repeat(64),
  marker: id,
});
test('permit rejects cloud, habitual, redirects, forged lab identities and expiry', () => {
  assert.equal(validatePermit(good(), id, now).origin, labOrigin);
  for (const origin of [
    'https://example.supabase.co',
    'http://127.0.0.1:54421',
    'http://localhost:54721',
    labOrigin + '/',
    labOrigin + '@example.com',
  ])
    assert.throws(() => validatePermit({ ...good(), origin }, id, now));
  for (const patch of [
    { projectId: 'app-barberia-002-local' },
    { expiresAt: now },
    { issuedAt: now + 1 },
    { expiresAt: now + 3600001 },
    { marker: 'different' },
    { containerId: 'x' },
  ])
    assert.throws(() => validatePermit({ ...good(), ...patch }, id, now));
  assert.throws(() => validatePermit(good(), 'different', now));
});
test('stage plans preserve original plateaus and reject unsupported levels', () => {
  for (let n = 200; n <= 2000; n += 100) assert.equal(levelPlan(n).level, n);
  assert.equal(levelPlan(100).steadySeconds, 600);
  assert.equal(levelPlan(25).steadySeconds, 600);
  assert.equal(levelPlan(10).steadySeconds, 60);
  assert.equal(levelPlan(2000).steadySeconds, 120);
  for (const n of [0, -1, 3, 250, 550, 10000, NaN])
    assert.throws(() => levelPlan(n));
});

test('fixture writes cannot override commands, tenant, actor or request identity', () => {
  const tenant = { id, serviceId: id, barberId: id, localDate: '2026-11-28' };
  const other = '22222222-2222-4222-8222-222222222222';
  const data = {
    runId: id,
    tenants: [tenant, { ...tenant, id: other }],
    actors: [
      { id, tenant: 0, token: 'eyJfixture.payload.signature' },
      { id: other, tenant: 1, token: 'eyJfixture.payload.signature' },
    ],
    writes: [
      {
        actorIndex: 0,
        body: {
          requestId: id,
          barbershopId: id,
          serviceIds: [id],
          barberId: id,
          startsAt: '2026-11-28T15:00:00.000Z',
        },
      },
    ],
  };
  assert.ok(validateFixtures(data, good()));
  assert.throws(() =>
    validateFixtures(
      { ...data, actors: [data.actors[0], data.actors[0]] },
      good(),
    ),
  );
  for (const patch of [
    { action: 'care' },
    { actorId: id },
    { barbershopId: other },
    { requestId: 'not-uuid' },
    { startsAt: '2026-02-30T15:00:00.000Z' },
  ])
    assert.throws(() =>
      validateFixtures(
        {
          ...data,
          writes: [
            { actorIndex: 0, body: { ...data.writes[0].body, ...patch } },
          ],
        },
        good(),
      ),
    );
  assert.throws(() =>
    validateFixtures(
      { ...data, writes: [data.writes[0], data.writes[0]] },
      good(),
    ),
  );
});
