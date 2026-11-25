import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProfessionalFixturePlan,
  assertFixturePlan,
  assertAutomaticBooking,
  assertFixtureBudget,
  assertConservedRows,
} from './professional-fixture-guard.mjs';

test('isolated plan uses real calendar dates and refuses collisions with protected IDs', () => {
  const plan = createProfessionalFixturePlan('2026-11-15');
  assertFixturePlan(plan, new Set());
  assert.equal(plan.bookings[0].startsAt, '2026-11-17T15:00:00.000Z');
  assert.equal(plan.bookings[7].startsAt, '2026-11-22T20:00:00.000Z');
  assert.equal(plan.bookings[4].shop, 1);
  assert.throws(() => createProfessionalFixturePlan('2026-02-30'));
  assert.throws(() =>
    assertFixturePlan(plan, new Set([plan.professionals[0]])),
  );
  assert.throws(() =>
    assertFixturePlan({ ...plan, project: 'barberia-app' }, new Set()),
  );
});

test('only six owned automatic bookings can be mutated, never either manual booking or a foreign ID', () => {
  const plan = createProfessionalFixturePlan('2026-11-15');
  for (const booking of plan.bookings.slice(0, 6))
    assertAutomaticBooking(plan, booking.id);
  for (const id of [plan.bookings[6].id, plan.bookings[7].id, plan.shops[0]])
    assert.throws(() => assertAutomaticBooking(plan, id));
});

test('fixture plan refuses duplicated IDs, oversized entities and changed immutable manual allocation', () => {
  const plan = createProfessionalFixturePlan('2026-11-15');
  assert.throws(() =>
    assertFixturePlan(
      { ...plan, shops: [plan.shops[0], plan.shops[0]] },
      new Set(),
    ),
  );
  assert.throws(() =>
    assertFixturePlan(
      { ...plan, services: [...plan.services, plan.run] },
      new Set(),
    ),
  );
  assert.throws(() =>
    assertFixturePlan(
      {
        ...plan,
        bookings: plan.bookings.map((b, i) =>
          i === 7 ? { ...b, automatic: true } : b,
        ),
      },
      new Set(),
    ),
  );
});

test('budget guard refuses excess rows or events before the next write', () => {
  const plan = createProfessionalFixturePlan('2026-11-15');
  const counts = {
    accounts: 4,
    profiles: 4,
    shops: 2,
    memberships: 4,
    professionals: 2,
    services: 2,
    links: 2,
    bookingSettings: 2,
    careSettings: 2,
    rescheduleSettings: 2,
    shopHours: 14,
    professionalHours: 15,
    blocks: 2,
    bookings: 8,
    items: 8,
    care: 8,
    rescheduleEvents: 16,
    reservationEvents: 9,
    careEvents: 15,
  };
  assertFixtureBudget(plan, counts);
  for (const field of Object.keys(counts))
    assert.throws(() =>
      assertFixtureBudget(plan, { ...counts, [field]: counts[field] + 1 }),
    );
  assert.throws(() => assertFixtureBudget(plan, { ...counts, bookings: -1 }));
  assert.throws(() => assertFixtureBudget(plan, { ...counts, unknown: 1 }));
});

test('conservation compares existing row identities and full fingerprints, accepting only new rows', () => {
  const before = {
    reservations: { protected1: 'digest-original' },
    memberships: { member1: 'digest-member' },
  };
  const after = {
    reservations: { protected1: 'digest-original', ownNew: 'digest-new' },
    memberships: { member1: 'digest-member' },
  };
  assertConservedRows(before, after);
  for (const damaged of [
    { ...after, reservations: {} },
    { ...after, reservations: { protected1: 'changed' } },
    { reservations: after.reservations },
  ])
    assert.throws(() => assertConservedRows(before, damaged));
});
