import { randomUUID } from 'node:crypto';

const project = 'app-barberia-002-local';
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const limits = Object.freeze({
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
});
function requireCondition(ok) {
  if (!ok) throw Error('SYNTHETIC_SCOPE_VIOLATION');
}
export function createProfessionalFixturePlan(todayLima) {
  requireCondition(
    typeof todayLima === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(todayLima),
  );
  const day = new Date(todayLima + 'T00:00:00.000Z');
  requireCondition(
    Number.isFinite(day.getTime()) &&
      day.toISOString().slice(0, 10) === todayLima,
  );
  const starts = [
    [0, 10],
    [0, 11],
    [1, 12],
    [2, 10],
    [2, 11],
    [3, 10],
    [4, 15],
    [5, 15],
  ];
  const plan = {
    project,
    run: randomUUID(),
    todayLima,
    accounts: Array.from({ length: 4 }, () => randomUUID()),
    shops: Array.from({ length: 2 }, () => randomUUID()),
    memberships: Array.from({ length: 4 }, () => randomUUID()),
    professionals: Array.from({ length: 2 }, () => randomUUID()),
    services: Array.from({ length: 2 }, () => randomUUID()),
    blocks: Array.from({ length: 2 }, () => randomUUID()),
    bookings: starts.map(([offset, hour], index) => ({
      id: randomUUID(),
      shop: [0, 1, 0, 0, 1, 0, 0, 1][index],
      automatic: index < 6,
      startsAt: new Date(
        day.getTime() + (2 + offset) * 86400000 + (hour + 5) * 3600000,
      ).toISOString(),
    })),
  };
  assertFixturePlan(plan, new Set());
  return plan;
}
export function assertFixturePlan(plan, protectedIds) {
  requireCondition(plan?.project === project && uuid.test(plan.run));
  const ids = [plan.run];
  for (const [field, count] of Object.entries({
    accounts: 4,
    shops: 2,
    memberships: 4,
    professionals: 2,
    services: 2,
    blocks: 2,
    bookings: 8,
  })) {
    requireCondition(
      Array.isArray(plan[field]) && plan[field].length === count,
    );
    ids.push(...plan[field].map((v) => (field === 'bookings' ? v.id : v)));
  }
  requireCondition(
    ids.every(
      (id) => typeof id === 'string' && uuid.test(id) && !protectedIds.has(id),
    ) && new Set(ids).size === ids.length,
  );
  plan.bookings.forEach((b, index) =>
    requireCondition(
      b.automatic === index < 6 &&
        [0, 1].includes(b.shop) &&
        Number.isFinite(Date.parse(b.startsAt)),
    ),
  );
}
export function assertAutomaticBooking(plan, id) {
  assertFixturePlan(plan, new Set());
  requireCondition(plan.bookings.slice(0, 6).some((b) => b.id === id));
}
export function assertFixtureBudget(plan, counts) {
  assertFixturePlan(plan, new Set());
  requireCondition(Object.keys(counts).length === Object.keys(limits).length);
  for (const [key, max] of Object.entries(limits))
    requireCondition(
      Number.isSafeInteger(counts[key]) &&
        counts[key] >= 0 &&
        counts[key] <= max,
    );
}
export function assertConservedRows(before, after) {
  for (const [table, rows] of Object.entries(before))
    for (const [id, digest] of Object.entries(rows))
      requireCondition(after[table]?.[id] === digest);
}
