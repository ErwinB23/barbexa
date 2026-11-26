// Provisioning only. Never imported by the measured k6 script or its supervisor.
import { levels, assertComplementaryProgress } from './complementary.mjs';
const transient = new Set([
  'ECONNABORTED',
  'ECONNRESET',
  'EPIPE',
  'UND_ERR_SOCKET',
  'ETIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
]);
function transportCode(error) {
  const pending = [error],
    seen = new Set();
  while (pending.length && seen.size < 64) {
    const e = pending.shift();
    if (!e || typeof e !== 'object' || seen.has(e)) continue;
    seen.add(e);
    if (transient.has(e.code)) return e.code;
    if (e.name === 'TimeoutError') return 'TIMEOUT';
    pending.push(e.cause, ...(Array.isArray(e.errors) ? e.errors : []));
  }
  return null;
}
function idempotent(resource, o) {
  if (o.method === 'GET') return true;
  if (resource === '/functions/v1/barbershop-operation')
    return [
      'configure-shop',
      'set-shop-hours',
      'set-barber-hours',
      'set-capabilities',
      'set-publication',
    ].includes(o.body?.action);
  return (
    resource === '/functions/v1/reservation-command' &&
    o.body?.action === 'confirm' &&
    /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(o.body.requestId)
  );
}
export async function provisionRequest(
  send,
  resource,
  options = {},
  {
    sleep = (ms) => new Promise((r) => setTimeout(r, ms)),
    emit = () => {},
  } = {},
) {
  const stable = structuredClone(options),
    safe = idempotent(resource, stable);
  const label = {
    endpoint: resource.split('?')[0],
    action: stable.body?.action ?? null,
    retrySafe: safe,
  };
  let attempt = 0,
    transportFailures = 0,
    rateFailures = 0;
  for (;;) {
    attempt++;
    emit({ ...label, phase: 'starting', attempt });
    try {
      const r = await send(resource, {
        ...structuredClone(stable),
        connectionClose: true,
      });
      emit({ ...label, phase: 'completed', attempt, status: r.status });
      return r;
    } catch (error) {
      const rate = String(error.message).includes(
        'AUTH_OR_API_RATE_LIMIT_WAIT_AND_RESUME_NO_LIMIT_BYPASS',
      );
      const code = transportCode(error);
      if (rate && ++rateFailures < 20) {
        emit({
          ...label,
          phase: 'retry',
          attempt,
          code: 'RATE_LIMIT',
          waitMs: 30000,
        });
        await sleep(30000);
        continue;
      }
      if (code && safe && ++transportFailures < 3) {
        const waitMs = 500 * transportFailures;
        emit({ ...label, phase: 'retry', attempt, code, waitMs });
        await sleep(waitMs);
        continue;
      }
      emit({
        ...label,
        phase: 'failed',
        attempt,
        code: code ?? (rate ? 'RATE_LIMIT' : 'NON_RETRYABLE'),
      });
      throw new Error(
        `PROVISIONING_FAILED ${label.endpoint} ${label.action ?? 'request'} (${code ?? (rate ? 'RATE_LIMIT' : 'NON_RETRYABLE')}, ${attempt} attempt(s))`,
        { cause: error },
      );
    }
  }
}
export function nextPreparationLevel(series) {
  const level = levels.find((l) => !series.levels[l]?.passed);
  if (level === undefined) return null;
  assertComplementaryProgress(series, level);
  return level;
}
