// Pure plan, shared by the preparer, static tests and k6 (no I/O).
export const levels = [25, 50, 100];
export const writeCapacity = 160;
export function assertComplementaryProgress(series, level) {
  if (!levels.includes(level) || !series.levels)
    throw Error('INVALID_COMPLEMENTARY_LEVEL');
  const previous = levels[levels.indexOf(level) - 1];
  if (
    previous &&
    (!series.levels[previous]?.passed || !series.levels[previous]?.recovered)
  )
    throw Error('PREVIOUS_COMPLEMENTARY_LEVEL_NOT_APPROVED');
  if (series.levels[level]) {
    const r = series.retry;
    if (
      level !== 25 ||
      series.levels[level].passed ||
      !series.levels[level].recovered ||
      r?.level !== level ||
      !['ready', 'running'].includes(r.state) ||
      r.sourceOutput !== series.levels[level].output
    )
      throw Error('EXISTING_WRITE_ATTEMPT_REQUIRES_REVIEW');
  }
}
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
export function buildWrites(
  level,
  actors,
  tenants,
  newId = () => globalThis.crypto.randomUUID(),
  replacementSlots = {},
) {
  if (
    !levels.includes(level) ||
    actors.length < level ||
    tenants.length !== 2 ||
    tenants.some(
      (t) =>
        t.barberIds?.length !== 10 || t.barberIds.some((id) => !uuid.test(id)),
    ) ||
    new Set(tenants.flatMap((t) => t.barberIds)).size !== 20
  )
    throw Error('INVALID_COMPLEMENTARY_PLAN');
  if (Object.keys(replacementSlots).length && level !== 25)
    throw Error('RETRY_ONLY_FOR_REVIEWED_25');
  const replacementKeys = Object.keys(replacementSlots);
  if (
    replacementKeys.some(
      (k) =>
        !/^\d+$/.test(k) ||
        String(Number(k)) !== k ||
        Number(k) >= level * writeCapacity ||
        !Number.isSafeInteger(replacementSlots[k]),
    )
  )
    throw Error('INVALID_REPLACEMENT_SLOT');
  const usedTailSlots = new Set();
  const result = [];
  for (let vu = 0; vu < level; vu++) {
    const actor = actors[vu],
      tenant = tenants[actor.tenant];
    const previous =
      levels.filter((l) => l < level && vu < l).length * writeCapacity;
    for (let n = 0; n < writeCapacity; n++) {
      // Five clients per professional, interleaved appointments. The same client
      // never books simultaneous slots; levels continue its previous allocation.
      const index = vu * writeCapacity + n;
      const tail = levels.filter((l) => vu < l).length * writeCapacity;
      const position = replacementSlots[index] ?? previous + n;
      if (Object.hasOwn(replacementSlots, index)) {
        const key = vu + ':' + position;
        if (
          position < tail ||
          position >= tail + writeCapacity ||
          usedTailSlots.has(key)
        )
          throw Error('REPLACEMENT_OVERLAPS_RESERVED_RANGE');
        usedTailSlots.add(key);
      }
      const slot = position * 5 + Math.floor(vu / 20);
      const day = Math.floor(slot / 36) + 2;
      const minute = 540 + (slot % 36) * 15;
      const startsAt = new Date(
        Date.parse(tenant.localDate + 'T05:00:00.000Z') +
          day * 86400000 +
          minute * 60000,
      ).toISOString();
      result.push({
        actorIndex: vu,
        body: {
          requestId: newId(),
          barbershopId: tenant.id,
          barberId: tenant.barberIds[Math.floor(vu / 2) % 10],
          serviceIds: [tenant.serviceId],
          startsAt,
        },
      });
    }
  }
  return result;
}
export function validateComplementary(f, level) {
  const c = f.complementary;
  if (
    !c ||
    c.level !== level ||
    c.capacity !== writeCapacity ||
    c.writes?.length !== level * writeCapacity
  )
    throw Error('INVALID_COMPLEMENTARY_FIXTURES');
  const expected = buildWrites(
    level,
    f.actors,
    f.tenants,
    () => 'placeholder',
    c.replacementSlots,
  );
  const ids = new Set();
  for (let i = 0; i < expected.length; i++) {
    const w = c.writes[i],
      { requestId, ...body } = w.body;
    const { requestId: _, ...planned } = expected[i].body;
    if (
      !uuid.test(requestId) ||
      ids.has(requestId) ||
      w.actorIndex !== expected[i].actorIndex ||
      JSON.stringify(body) !== JSON.stringify(planned)
    )
      throw Error('INVALID_COMPLEMENTARY_WRITE');
    ids.add(requestId);
  }
  return f;
}
export function retryWrites(
  actors,
  tenants,
  original,
  consumed,
  newId = () => globalThis.crypto.randomUUID(),
  tailStarts = {},
) {
  validateComplementary(
    {
      actors,
      tenants,
      complementary: { level: 25, capacity: writeCapacity, writes: original },
    },
    25,
  );
  if (
    !Array.isArray(consumed) ||
    !consumed.length ||
    new Set(consumed).size !== consumed.length ||
    consumed.some(
      (i) => !Number.isSafeInteger(i) || i < 0 || i >= original.length,
    )
  )
    throw Error('INVALID_CONSUMED_WRITES');
  const replacementSlots = {},
    cursors = {};
  for (const index of [...consumed].sort((a, b) => a - b)) {
    const actor = original[index].actorIndex;
    const defaultTail = levels.filter((l) => actor < l).length * writeCapacity;
    const start = tailStarts[actor] ?? defaultTail;
    if (!Number.isSafeInteger(start) || start < defaultTail)
      throw Error('INVALID_OCCUPIED_TAIL');
    cursors[actor] ??= start;
    replacementSlots[index] = cursors[actor]++;
  }
  const planned = buildWrites(25, actors, tenants, newId, replacementSlots);
  const writes = original.map((w, i) =>
    Object.hasOwn(replacementSlots, i) ? planned[i] : structuredClone(w),
  );
  const oldIds = new Set(original.map((w) => w.body.requestId));
  if (consumed.some((i) => oldIds.has(writes[i].body.requestId)))
    throw Error('RETRY_REUSES_REQUEST_ID');
  validateComplementary(
    {
      actors,
      tenants,
      complementary: {
        level: 25,
        capacity: writeCapacity,
        writes,
        replacementSlots,
      },
    },
    25,
  );
  return { writes, replacementSlots };
}
export function ownReservationsPath(actor, tenant) {
  if (!uuid.test(actor.id) || !uuid.test(tenant.id))
    throw Error('INVALID_OWN_ID');
  return (
    '/rest/v1/reservations?select=id,barbershop_id,client_user_id,barber_id,state,starts_at,ends_at,duration_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot,reservation_items(service_id,name_snapshot,description_snapshot,price_snapshot,duration_min)&client_user_id=eq.' +
    actor.id +
    '&barbershop_id=eq.' +
    tenant.id +
    '&order=starts_at.desc,id.desc&limit=50'
  );
}
