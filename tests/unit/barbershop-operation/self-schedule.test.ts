import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  scheduleHours,
  ownBlock,
  limaScheduleInstant,
  scheduleClockMinutes,
  ownSchedule,
} from '../../../src/features/barbershop-operation/domain/self-schedule.js';
import { createSelfScheduleApplication } from '../../../src/features/barbershop-operation/application/self-schedule.js';
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222',
  id = '33333333-3333-4333-8333-333333333333';
const row = {
  professional: {
    id,
    userId: user,
    barbershopId: shop,
    professionalName: 'Own',
    active: true,
  },
  version: 1,
  shopHours: [{ weekday: 1, opensMin: 540, closesMin: 1080 }],
  hours: [],
  blocks: [],
};
const block = {
  id,
  startsAt: '2026-11-20T15:00:00.000Z',
  endsAt: '2026-11-20T16:00:00.000Z',
  reason: null,
};
test('weekly hours normalize order and permit adjacent [) intervals and empty schedule', () => {
  const h = scheduleHours([
    { weekday: 1, opensMin: 600, closesMin: 660 },
    { weekday: 1, opensMin: 540, closesMin: 600 },
  ]);
  assert.equal(h[0].opensMin, 540);
  assert.ok(Object.isFrozen(h));
  assert.deepEqual(scheduleHours([]), []);
});
test('hours reject overlaps, extra keys, overnight, decimal and malformed boundaries', () => {
  for (const input of [
    null,
    {},
    [{ weekday: 7, opensMin: 1, closesMin: 3 }],
    [{ weekday: 1, opensMin: 3, closesMin: 3 }],
    [{ weekday: 1, opensMin: 0, closesMin: 1441 }],
    [{ weekday: 1, opensMin: 1.5, closesMin: 3 }],
    [{ weekday: 1, opensMin: 1, closesMin: 3, barberId: id }],
    [
      { weekday: 1, opensMin: 1, closesMin: 3 },
      { weekday: 1, opensMin: 2, closesMin: 4 },
    ],
  ])
    assert.throws(() => scheduleHours(input));
});
test('Lima dates and clocks are exact, calendar invalidity and offsets cannot sneak in', () => {
  assert.equal(
    limaScheduleInstant('2026-11-20 10:00'),
    '2026-11-20T15:00:00.000Z',
  );
  assert.equal(scheduleClockMinutes('24:00', true), 1440);
  for (const input of [
    '2026-02-30 10:00',
    '2026-11-20 24:00',
    '2026-11-20T10:00:00Z',
    'x',
  ])
    assert.throws(() => limaScheduleInstant(input));
  for (const input of ['24:00', '25:00', '12:60', '1:30'])
    assert.throws(() => scheduleClockMinutes(input));
});
test('blocks require own typed payload, finite interval and no arbitrary owner', () => {
  assert.equal(ownBlock({ ...block, reason: ' Break ' }).reason, 'Break');
  for (const input of [
    { ...block, userId: user },
    { ...block, barberId: id },
    { ...block, id: 'x' },
    { ...block, endsAt: block.startsAt },
    { ...block, reason: 3 },
  ])
    assert.throws(() => ownBlock(input));
});
test('projection verifies owner tenant, hours containment union, dates and block uniqueness', () => {
  assert.equal(ownSchedule(row, user, shop).version, 1);
  const adjacent = {
    ...row,
    shopHours: [
      { weekday: 1, opensMin: 540, closesMin: 600 },
      { weekday: 1, opensMin: 600, closesMin: 660 },
    ],
    hours: [{ weekday: 1, opensMin: 550, closesMin: 650 }],
  };
  assert.equal(ownSchedule(adjacent, user, shop).hours.length, 1);
  for (const input of [
    { ...row, professional: { ...row.professional, userId: shop } },
    { ...row, professional: { ...row.professional, active: false } },
    { ...row, version: 0 },
    { ...row, hours: [{ weekday: 1, opensMin: 500, closesMin: 550 }] },
    { ...row, blocks: [block, block] },
  ])
    assert.throws(() => ownSchedule(input, user, shop));
});
function fixture(enabled = true) {
  let scope: {
    userId: string;
    generation: number;
    barbershopId?: string;
    role?: 'barber' | 'administrator';
  } | null = {
    userId: user,
    generation: 1,
    barbershopId: shop,
    role: 'barber',
  };
  const calls: unknown[][] = [];
  const control = { read: async () => row };
  const gateway = {
    getOwnSchedule: async (...a: unknown[]) => {
      calls.push(a);
      return control.read();
    },
    setOwnSchedule: async (...a: unknown[]) => {
      calls.push(a);
      return row;
    },
    upsertOwnBlock: async (...a: unknown[]) => {
      calls.push(a);
      return row;
    },
    removeOwnBlock: async (...a: unknown[]) => {
      calls.push(a);
      return row;
    },
  };
  const app = createSelfScheduleApplication({
    gateway,
    scope: () => scope,
    enabled,
    newId: () => id,
  });
  return {
    app,
    calls,
    control,
    change: (v: typeof scope) => {
      scope = v;
    },
  };
}
test('self schedule uses selected tenant and immutable fields, never an arbitrary professional', async () => {
  const f = fixture();
  await f.app.read();
  await f.app.setHours(1, []);
  await f.app.saveBlock(1, block);
  await f.app.removeBlock(1, id);
  assert.deepEqual(
    f.calls.map((c) => c[0]),
    [shop, shop, shop, shop],
  );
  assert.equal(f.app.newBlockId(), id);
  assert.deepEqual(f.calls[2], [shop, 1, block]);
});
test('scope changes and double reads/writes cannot publish old authorized data', async () => {
  const f = fixture();
  let release!: (v: typeof row) => void;
  f.control.read = () =>
    new Promise((r) => {
      release = r;
    });
  const pending = f.app.read();
  await assert.rejects(() => f.app.read());
  f.change(null);
  release(row);
  await assert.rejects(() => pending);
});
test('disabled, no-membership and invalid versions never call a port', async () => {
  const f = fixture(false);
  await assert.rejects(() => f.app.read());
  assert.equal(f.calls.length, 0);
  const g = fixture();
  g.change({ userId: user, generation: 1 });
  await assert.rejects(() => g.app.read());
  assert.equal(g.calls.length, 0);
  const h = fixture();
  await assert.rejects(() => h.app.setHours(0, []));
  await assert.rejects(() => h.app.removeBlock(1, 'x'));
  assert.equal(h.calls.length, 0);
});
