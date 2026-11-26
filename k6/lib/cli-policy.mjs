export const levels = [
  1, 10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
];
export function requestedLevels(value) {
  if (value === 'completo') return levels;
  if (!/^\d+$/.test(value) || !levels.includes(Number(value)))
    throw Error('Usa un nivel de 1 a 1000 compatible, o completo.');
  return [Number(value)];
}
export function acceptedEvidence(
  summary,
  integrity,
  permit,
  runId,
  level,
  result = null,
) {
  if (
    permit?.runId !== runId ||
    summary?.mode !== 'read' ||
    summary.level !== level ||
    integrity?.interrupted !== null ||
    !integrity.before ||
    !integrity.after ||
    (result && (result.exit !== 0 || result.interrupted !== null))
  )
    return false;
  if (
    Object.entries(integrity.after).some(
      ([k, v]) => k !== 'reservations' && v !== 0,
    ) ||
    integrity.before.reservations !== integrity.after.reservations
  )
    return false;
  const checks = summary.metrics?.checks?.values || summary.metrics?.checks;
  if ((checks?.rate ?? checks?.value) !== 1 || !(checks.passes > 0))
    return false;
  return Object.values(summary.metrics).every((m) =>
    Object.values(m.thresholds || {}).every((t) =>
      typeof t === 'object' ? t.ok === true : result?.exit === 0 || t === false,
    ),
  );
}
export function pressureDecision(sample, state = {}, now = Date.now()) {
  const critical = sample.freeMiB < 512 || sample.ramPercent >= 97;
  const memory = sample.freeMiB < 768 || sample.ramPercent >= 90;
  const next = {
    memorySince: memory ? (state.memorySince ?? now) : null,
    cpuSince: sample.cpu > 85 ? (state.cpuSince ?? now) : null,
    connectionsSince:
      sample.connectionRatio >= 0.8 ? (state.connectionsSince ?? now) : null,
  };
  return {
    state: next,
    warning: sample.freeMiB < 2048 || sample.ramPercent >= 85,
    stop:
      critical ||
      (next.memorySince !== null && now - next.memorySince >= 15000) ||
      (next.cpuSince !== null && now - next.cpuSince >= 30000) ||
      (next.connectionsSince !== null && now - next.connectionsSince >= 15000),
  };
}
