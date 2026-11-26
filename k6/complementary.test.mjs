import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  levels,
  writeCapacity,
  buildWrites,
  ownReservationsPath,
  validateComplementary,
  assertComplementaryProgress,
  retryWrites,
} from './lib/complementary.mjs';

const actors = Array.from({ length: 100 }, (_, i) => ({
  id: randomUUID(),
  tenant: i % 2,
}));
const tenants = [0, 1].map(() => ({
  id: randomUUID(),
  serviceId: randomUUID(),
  barberId: randomUUID(),
  barberIds: Array.from({ length: 10 }, randomUUID),
  localDate: '2026-12-01',
}));
test('25/50/100: disjoint writes, no client/professional overlap, enough for paced profile', () => {
  assert.deepEqual(levels, [25, 50, 100]);
  const requests = new Set(),
    people = new Set(),
    professionals = new Set();
  for (const level of levels) {
    const f = {
      actors,
      tenants,
      complementary: {
        level,
        capacity: writeCapacity,
        writes: buildWrites(level, actors, tenants),
      },
    };
    assert.equal(validateComplementary(f, level), f);
    assert.equal(f.complementary.writes.length, level * 160);
    for (const w of f.complementary.writes) {
      const a = actors[w.actorIndex],
        b = w.body;
      for (const [set, key] of [
        [requests, b.requestId],
        [people, a.id + b.startsAt],
        [professionals, b.barberId + b.startsAt],
      ]) {
        assert.ok(!set.has(key));
        set.add(key);
      }
      assert.ok(Date.parse(b.startsAt) < Date.parse('2027-03-01T00:00:00Z'));
    }
  }
});

test('retry preserves consumed reservations and future plans; only four slots/request IDs change', () => {
  const original = buildWrites(25, actors, tenants);
  const used = [320, 321, 322, 323];
  const retry = retryWrites(actors, tenants, original, used);
  assert.deepEqual(Object.values(retry.replacementSlots), [480, 481, 482, 483]);
  const fixture = {
    actors,
    tenants,
    complementary: { level: 25, capacity: 160, ...retry },
  };
  validateComplementary(fixture, 25);
  for (let i = 0; i < original.length; i++) {
    if (used.includes(i)) {
      assert.notEqual(
        original[i].body.requestId,
        retry.writes[i].body.requestId,
      );
      assert.notEqual(original[i].body.startsAt, retry.writes[i].body.startsAt);
    } else assert.deepEqual(original[i], retry.writes[i]);
  }
  const all = [
    ...used.map((i) => original[i]),
    ...retry.writes,
    ...buildWrites(50, actors, tenants),
    ...buildWrites(100, actors, tenants),
  ];
  const clients = new Set(),
    professionals = new Set(),
    requests = new Set();
  for (const w of all) {
    for (const [set, key] of [
      [clients, actors[w.actorIndex].id + w.body.startsAt],
      [professionals, w.body.barberId + w.body.startsAt],
      [requests, w.body.requestId],
    ]) {
      assert.ok(!set.has(key));
      set.add(key);
    }
  }
  assert.equal(all.filter((w) => w.actorIndex === 2).length, 484);
  assert.equal(
    buildWrites(50, actors, tenants)[320].body.startsAt,
    '2026-12-25T16:00:00.000Z',
  );
  assert.equal(
    buildWrites(100, actors, tenants)[320].body.startsAt,
    '2027-01-16T18:00:00.000Z',
  );
});

test('retry rejects duplicate, unreviewed or invalid consumed indices and cannot alter 50/100 allocation', () => {
  const original = buildWrites(25, actors, tenants);
  for (const indices of [[], [320, 320], [-1], [4000], [1.5]])
    assert.throws(() => retryWrites(actors, tenants, original, indices));
  const r = retryWrites(actors, tenants, original, [320]);
  const f = {
    actors,
    tenants,
    complementary: {
      level: 50,
      capacity: 160,
      writes: buildWrites(50, actors, tenants),
      replacementSlots: r.replacementSlots,
    },
  };
  assert.throws(() => validateComplementary(f, 50));
  const malformed = {
    actors,
    tenants,
    complementary: {
      level: 25,
      capacity: 160,
      writes: original,
      replacementSlots: { '0320': 480 },
    },
  };
  assert.throws(() => validateComplementary(malformed, 25));
  assert.throws(() =>
    retryWrites(
      actors,
      tenants,
      original,
      [320, 321],
      () => original[320].body.requestId,
    ),
  );
});

test('only the explicitly reviewed failed 25-VU attempt may be retried once', () => {
  const series = {
    levels: {
      25: { passed: false, recovered: true, output: 'failed-attempt' },
    },
    retry: { level: 25, state: 'ready', sourceOutput: 'failed-attempt' },
  };
  assert.doesNotThrow(() => assertComplementaryProgress(series, 25));
  assert.throws(() => assertComplementaryProgress(series, 50));
  for (const state of ['consumed', 'failed', undefined])
    assert.throws(() =>
      assertComplementaryProgress(
        { ...series, retry: { ...series.retry, state } },
        25,
      ),
    );
  assert.throws(() =>
    assertComplementaryProgress(
      { ...series, retry: { ...series.retry, sourceOutput: 'other' } },
      25,
    ),
  );
  assert.throws(() =>
    assertComplementaryProgress(
      {
        ...series,
        levels: {
          25: { passed: true, recovered: true, output: 'failed-attempt' },
        },
      },
      25,
    ),
  );
});

test('a further reviewed retry accounts for already consumed tail slots without shifting 50/100', () => {
  const original = buildWrites(25, actors, tenants);
  const first = retryWrites(actors, tenants, original, [320, 321, 322, 323]);
  const consumed = Array.from({ length: 25 }, (_, vu) =>
    Array.from({ length: 50 }, (_, n) => vu * 160 + n),
  ).flat();
  const next = retryWrites(
    actors,
    tenants,
    original,
    consumed,
    () => randomUUID(),
    { 2: 484 },
  );
  assert.equal(next.replacementSlots[320], 484);
  const occupied = [
    ...consumed.map((i) => original[i]),
    ...first.writes.slice(320, 324),
  ];
  const future = [
    ...next.writes,
    ...buildWrites(50, actors, tenants),
    ...buildWrites(100, actors, tenants),
  ];
  const seen = new Set();
  for (const w of [...occupied, ...future]) {
    const k = w.body.barberId + w.body.startsAt;
    assert.ok(!seen.has(k));
    seen.add(k);
  }
  assert.equal(next.writes.length, 4000);
});
test('allocation is deterministic except idempotency keys; no prices/identity trusted in writes', () => {
  const writes = buildWrites(25, actors, tenants);
  assert.deepEqual(Object.keys(writes[0].body).sort(), [
    'barberId',
    'barbershopId',
    'requestId',
    'serviceIds',
    'startsAt',
  ]);
  assert.throws(() => buildWrites(10, actors, tenants));
  const f = {
    actors,
    tenants,
    complementary: { level: 25, capacity: 160, writes },
  };
  f.complementary.writes[1].body.startsAt =
    f.complementary.writes[0].body.startsAt;
  assert.throws(() => validateComplementary(f, 25));
});
test('own-reservations read matches public client adapter and restricts identity/shop', () => {
  const p = ownReservationsPath(actors[0], tenants[0]);
  assert.ok(p.includes('client_user_id=eq.' + actors[0].id));
  assert.ok(p.includes('barbershop_id=eq.' + tenants[0].id));
  assert.ok(p.includes('reservation_items('));
  assert.ok(!p.includes('select=*'));
});

test('mixed progression cannot borrow read approvals or rerun failed/passed writes', () => {
  assert.doesNotThrow(() => assertComplementaryProgress({ levels: {} }, 25));
  assert.throws(() => assertComplementaryProgress({ levels: {} }, 50));
  assert.doesNotThrow(() =>
    assertComplementaryProgress(
      { levels: { 25: { passed: true, recovered: true } } },
      50,
    ),
  );
  assert.throws(() =>
    assertComplementaryProgress(
      { levels: { 25: { passed: true, recovered: false } } },
      50,
    ),
  );
  assert.throws(() =>
    assertComplementaryProgress({ levels: { 25: { passed: false } } }, 25),
  );
  assert.throws(() =>
    assertComplementaryProgress({ levels: { 25: { passed: true } } }, 25),
  );
});
