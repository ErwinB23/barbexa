export const labOrigin = 'http://127.0.0.1:54721';
export const projectId = 'barbexa-k6-lab';
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validatePermit(value, expectedRun, now = Date.now()) {
  if (
    !value ||
    value.origin !== labOrigin ||
    value.projectId !== projectId ||
    !uuid.test(value.runId) ||
    value.runId !== expectedRun ||
    value.marker !== value.runId ||
    !/^[0-9a-f]{64}$/.test(value.containerId) ||
    !Number.isSafeInteger(value.issuedAt) ||
    value.issuedAt > now ||
    !Number.isSafeInteger(value.expiresAt) ||
    value.expiresAt <= now ||
    value.expiresAt > now + 3600000
  )
    throw Error('UNAUTHORIZED_LAB_PERMIT');
  return value;
}
export function levelPlan(level) {
  if (
    ![1, 10, 25, 50, 100].includes(level) &&
    !(
      Number.isInteger(level) &&
      level >= 200 &&
      level <= 2000 &&
      level % 100 === 0
    )
  )
    throw Error('INVALID_LOAD_LEVEL');
  return {
    level,
    warmSeconds: level < 25 ? 0 : 60,
    rampSeconds: level < 25 ? 10 : 60,
    steadySeconds:
      level === 1 ? 0 : level === 10 ? 60 : level <= 100 ? 600 : 120,
    recoverySeconds: level < 25 ? 60 : 120,
  };
}
export function assertProgression(level, receipt, runId, mode) {
  levelPlan(level);
  if (level === 1) return;
  const previous =
    level === 10
      ? 1
      : level === 25
        ? 10
        : level === 50
          ? 25
          : level === 100
            ? 50
            : level - 100;
  if (
    !receipt ||
    receipt.runId !== runId ||
    receipt.mode !== mode ||
    receipt.passed !== true ||
    receipt.recovered !== true ||
    !(level === 100 ? [10, 25, 50, 100] : [previous, level]).includes(
      receipt.level,
    )
  )
    throw Error('PREVIOUS_LEVEL_NOT_PASSED_AND_RECOVERED');
}
export function validateFixtures(value, permit, minimumActors = 2) {
  if (
    !value ||
    value.runId !== permit.runId ||
    !Array.isArray(value.actors) ||
    value.actors.length < minimumActors ||
    new Set(value.actors.map((a) => a.id)).size !== value.actors.length ||
    !Array.isArray(value.tenants) ||
    value.tenants.length !== 2 ||
    value.tenants.some(
      (t) =>
        !uuid.test(t.id) ||
        !uuid.test(t.serviceId) ||
        !uuid.test(t.barberId) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(t.localDate),
    ) ||
    value.tenants[0].id === value.tenants[1].id ||
    value.actors.some(
      (a) =>
        !uuid.test(a.id) ||
        ![0, 1].includes(a.tenant) ||
        typeof a.token !== 'string' ||
        !/^eyJ[^\s]+\.[^\s]+\.[^\s]+$/.test(a.token),
    )
  )
    throw Error('INVALID_SYNTHETIC_FIXTURES');
  const requests = new Set();
  for (const work of value.writes || []) {
    const actor = value.actors[work.actorIndex];
    const tenant = actor && value.tenants[actor.tenant];
    const body = work.body;
    if (
      !Number.isSafeInteger(work.actorIndex) ||
      !tenant ||
      !body ||
      Object.keys(body).sort().join(',') !==
        'barberId,barbershopId,requestId,serviceIds,startsAt' ||
      !uuid.test(body.requestId) ||
      requests.has(body.requestId) ||
      body.barbershopId !== tenant.id ||
      body.barberId !== tenant.barberId ||
      !Array.isArray(body.serviceIds) ||
      body.serviceIds.length !== 1 ||
      body.serviceIds[0] !== tenant.serviceId ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(body.startsAt) ||
      !Number.isFinite(Date.parse(body.startsAt)) ||
      new Date(body.startsAt).toISOString() !== body.startsAt
    )
      throw Error('INVALID_SYNTHETIC_WRITE_CASE');
    requests.add(body.requestId);
  }
  if (value.conflict) {
    if (
      !Array.isArray(value.conflict.requestIds) ||
      value.conflict.requestIds.length !== 2 ||
      value.conflict.requestIds[0] === value.conflict.requestIds[1]
    )
      throw Error('INVALID_CONFLICT_FIXTURE');
    validateFixtures(
      {
        ...value,
        conflict: null,
        writes: value.conflict.requestIds.map((requestId, actorIndex) => ({
          actorIndex,
          body: { ...value.conflict.body, requestId },
        })),
      },
      permit,
      2,
    );
  }
  return value;
}
