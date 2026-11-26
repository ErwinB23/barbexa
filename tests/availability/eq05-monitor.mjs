// Local synthetic availability observer. No k6, SDK retries or production changes.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { ownedLab, root } from '../../k6/lib/lab-client.mjs';
import { pressureDecision } from '../../k6/lib/cli-policy.mjs';
import { protocol, intervalAt, summarizeIntervals } from './eq05-policy.mjs';
import { terminalPresenter } from './eq05-terminal.mjs';
const mode = process.argv[2];
if (!['--preflight-local', '--observe-local-1h'].includes(mode))
  throw Error('EXPLICIT_LOCAL_OBSERVATION_REQUIRED');
const pointer = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq05/current.json')),
);
const m = JSON.parse(fs.readFileSync(pointer.manifest));
assert.ok(m.prepared);
assert.deepEqual(m.protocol, protocol);
const env = ownedLab({ recordBaseline: false });
assert.equal(env.sql('select run_id from private.k6_lab_marker;'), m.marker);
assert.equal(m.origin, 'http://127.0.0.1:54721');
const account = m.accounts[2];
assert.equal(account.role, 'client');
const append = (name, value) =>
  fs.appendFileSync(path.join(m.dir, name), JSON.stringify(value) + '\n');
const save = () =>
  fs.writeFileSync(pointer.manifest, JSON.stringify(m, null, 2) + '\n');
function failure(code, step) {
  const e = Error(code);
  e.safeCode = code;
  e.step = step;
  return e;
}
async function probe(index, lateMs = 0) {
  const began = performance.now(),
    deadline = began + protocol.flowTimeoutMs;
  const record = {
    index,
    lateMs,
    at: new Date().toISOString(),
    status: 'available',
    steps: [],
    created: false,
    cleanupConfirmed: false,
  };
  let token = null;
  const call = async (
    step,
    resource,
    { method = 'POST', body } = {},
    expected = 200,
  ) => {
    const remaining = deadline - performance.now();
    if (remaining <= 0) throw failure('FLOW_DEADLINE', step);
    assert.ok(resource.startsWith('/') && !resource.includes('://'));
    const started = performance.now(),
      sample = {
        step,
        endpoint: resource.split('?')[0],
        startedAt: new Date().toISOString(),
      };
    try {
      const r = await fetch(m.origin + resource, {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(
          Math.max(
            1,
            Math.ceil(Math.min(protocol.requestTimeoutMs, remaining)),
          ),
        ),
        headers: {
          apikey: m.publicKey,
          Authorization: 'Bearer ' + (token ?? m.publicKey),
          'Content-Type': 'application/json',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      sample.status = r.status;
      sample.ms = performance.now() - started;
      let data = null;
      if (r.status !== 204) {
        try {
          data = await r.json();
        } catch {
          throw failure('NON_JSON_RESPONSE', step);
        }
      }
      sample.ms = performance.now() - started;
      if (r.status !== expected) throw failure('HTTP_' + r.status, step);
      return data;
    } catch (e) {
      sample.error =
        e.safeCode ??
        (e.name === 'TimeoutError'
          ? 'REQUEST_TIMEOUT'
          : (e.cause?.code ?? 'TRANSPORT_FAILURE'));
      throw e.safeCode ? e : failure(sample.error, step);
    } finally {
      sample.ms = performance.now() - started;
      record.steps.push(sample);
    }
  };
  try {
    const session = await call('auth', '/auth/v1/token?grant_type=password', {
      body: { email: account.email, password: account.password },
    });
    if (
      session?.user?.id !== account.id ||
      typeof session.access_token !== 'string'
    )
      throw failure('AUTH_CONTRACT', 'auth');
    token = session.access_token;
    const catalog = await call('catalog', '/rest/v1/rpc/get_booking_catalog', {
      body: { p_barbershop_id: m.shop },
    });
    if (
      catalog?.barbershopId !== m.shop ||
      !catalog.services?.some((s) => s.id === m.service) ||
      !catalog.professionals?.some((b) => b.id === m.barber)
    )
      throw failure('CATALOG_CONTRACT', 'catalog');
    const slots = await call('slots', '/rest/v1/rpc/list_booking_slots', {
      body: {
        p_barbershop_id: m.shop,
        p_local_date: m.localDate,
        p_service_ids: [m.service],
        p_barber_id: m.barber,
      },
    });
    if (
      !Array.isArray(slots) ||
      !slots.length ||
      typeof slots[0].startsAt !== 'string'
    )
      throw failure('SLOTS_CONTRACT', 'slots');
    const ownPath =
      '/rest/v1/reservations?select=id,state,request_id,starts_at,client_user_id,barbershop_id,reservation_items(service_id)&client_user_id=eq.' +
      account.id +
      '&barbershop_id=eq.' +
      m.shop;
    const own = await call(
      'reservations',
      ownPath + '&order=created_at.desc&limit=5',
      { method: 'GET' },
    );
    if (
      !Array.isArray(own) ||
      own.some(
        (b) => b.client_user_id !== account.id || b.barbershop_id !== m.shop,
      )
    )
      throw failure('OWN_RESERVATIONS_CONTRACT', 'reservations');
    record.requestId = randomUUID();
    record.cancelRequestId = randomUUID();
    record.startsAt = slots[0].startsAt;
    append('write-ledger.jsonl', {
      index,
      requestId: record.requestId,
      cancelRequestId: record.cancelRequestId,
      startsAt: record.startsAt,
      plannedAt: new Date().toISOString(),
    });
    const booking = await call(
      'confirm',
      '/functions/v1/reservation-command',
      {
        body: {
          action: 'confirm',
          requestId: record.requestId,
          barbershopId: m.shop,
          barberId: m.barber,
          serviceIds: [m.service],
          startsAt: record.startsAt,
          paymentMethod: 'cash',
        },
      },
      201,
    );
    if (
      booking?.state !== 'confirmed' ||
      booking.barbershopId !== m.shop ||
      booking.startsAt !== record.startsAt ||
      !booking.id
    )
      throw failure('CONFIRM_CONTRACT', 'confirm');
    record.reservationId = booking.id;
    record.created = true;
    const persisted = await call(
      'verify-persistence',
      ownPath + '&request_id=eq.' + record.requestId,
      { method: 'GET' },
    );
    if (
      persisted?.length !== 1 ||
      persisted[0].id !== booking.id ||
      persisted[0].state !== 'confirmed' ||
      persisted[0].reservation_items?.[0]?.service_id !== m.service
    )
      throw failure('PERSISTENCE_MISMATCH', 'verify-persistence');
    const cancelled = await call(
      'cleanup-cancel',
      '/functions/v1/reservation-command',
      {
        body: {
          action: 'cancel',
          requestId: record.cancelRequestId,
          reservationId: booking.id,
          reason: 'EQ05 limpieza sintética exclusiva',
        },
      },
      200,
    );
    if (cancelled?.id !== booking.id || cancelled.state !== 'cancelled')
      throw failure('CANCEL_CONTRACT', 'cleanup-cancel');
    const cleaned = await call(
      'verify-cleanup',
      ownPath + '&request_id=eq.' + record.requestId,
      { method: 'GET' },
    );
    if (
      cleaned?.length !== 1 ||
      cleaned[0].id !== booking.id ||
      cleaned[0].state !== 'cancelled'
    )
      throw failure('CLEANUP_NOT_CONFIRMED', 'verify-cleanup');
    record.cleanupConfirmed = true;
    if (performance.now() > deadline) throw failure('FLOW_DEADLINE', 'flow');
  } catch (e) {
    record.status = 'unavailable';
    record.failure = {
      code: e.safeCode ?? 'MONITOR_EXCEPTION',
      step: e.step ?? 'validation',
    };
  }
  record.durationMs = performance.now() - began;
  append(
    mode === '--preflight-local'
      ? 'preflight-records.jsonl'
      : 'intervals.jsonl',
    record,
  );
  return record;
}
if (mode === '--preflight-local') {
  assert.ok(!m.windowStartedAt, 'WINDOW_ALREADY_STARTED');
  const r = await probe(-1);
  fs.writeFileSync(
    path.join(m.dir, 'preflight.json'),
    JSON.stringify(r, null, 2) + '\n',
  );
  assert.equal(r.status, 'available', 'PREFLIGHT_FLOW_FAILED');
  m.preflightPassed = true;
  save();
  console.log(
    JSON.stringify({
      preflight: 'passed',
      steps: r.steps.map((s) => ({
        step: s.step,
        status: s.status,
        ms: Math.round(s.ms),
      })),
      durationMs: r.durationMs,
      ownReservationCancelled: r.cleanupConfirmed,
      windowStarted: false,
    }),
  );
  process.exit(0);
}
assert.ok(m.preflightPassed, 'PREFLIGHT_REQUIRED');
assert.ok(!m.windowStartedAt, 'WINDOW_ALREADY_STARTED_NO_AUTOMATIC_RESTART');
const lock = path.join(m.dir, 'monitor.lock');
fs.writeFileSync(
  lock,
  JSON.stringify({ pid: process.pid, at: new Date().toISOString() }),
  { flag: 'wx' },
);
const resources = [],
  rows = [];
let cpuPrevious = os.cpus(),
  pressureState = {},
  stopReason = null;
const resourcesSample = () => {
  const cpus = os.cpus();
  let idle = 0,
    total = 0;
  cpus.forEach((c, i) => {
    const previous = cpuPrevious[i]?.times;
    if (!previous) return;
    idle += c.times.idle - previous.idle;
    for (const k of Object.keys(c.times)) total += c.times[k] - previous[k];
  });
  cpuPrevious = cpus;
  const connections = JSON.parse(
    env.sql(
      "select json_build_object('sessions',(select count(*) from pg_stat_activity),'max',current_setting('max_connections')::int);",
    ),
  );
  const sample = {
    at: new Date().toISOString(),
    freeMiB: os.freemem() / 1024 ** 2,
    ramPercent: (1 - os.freemem() / os.totalmem()) * 100,
    cpu: total ? 100 * (1 - idle / total) : 0,
    connectionRatio: connections.sessions / connections.max,
    connections,
  };
  const decision = pressureDecision(sample, pressureState);
  pressureState = decision.state;
  if (decision.stop) stopReason = 'CRITICAL_OR_SUSTAINED_RESOURCE_PRESSURE';
  resources.push(sample);
  append('resources.jsonl', sample);
  return sample;
};
try {
  resourcesSample();
  assert.ok(!stopReason, 'CRITICAL_PREFLIGHT_RESOURCE_PRESSURE');
} catch (error) {
  fs.unlinkSync(lock);
  throw error;
}
m.windowStartedAt = new Date().toISOString();
m.monitorPid = process.pid;
save();
const epoch = performance.now(),
  wallEpoch = Date.now();
const event = (name, extra = {}) =>
  append('events.jsonl', {
    at: new Date().toISOString(),
    elapsedMs: performance.now() - epoch,
    event: name,
    ...extra,
  });
event('window_started', { protocol, automaticRetries: 0 });
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    stopReason = 'OPERATOR_' + signal;
    event('operator_interruption', { signal });
  });
const progress = () =>
  fs.writeFileSync(
    path.join(m.dir, 'progress.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        start: m.windowStartedAt,
        scheduledEnd: new Date(wallEpoch + protocol.durationMs).toISOString(),
        elapsedSeconds: (performance.now() - epoch) / 1000,
        processed: rows.length,
        available: rows.filter((r) => r.status === 'available').length,
        unavailable: rows.filter((r) => r.status === 'unavailable').length,
        noData: rows.filter((r) => r.status === 'no-data').length,
        last: rows.at(-1),
        stopReason,
        complete:
          rows.length === protocol.count &&
          performance.now() - epoch >= protocol.durationMs,
      },
      null,
      2,
    ) + '\n',
  );
const screen = terminalPresenter();
const paint = () =>
  screen.update({ rows, elapsedSeconds: (performance.now() - epoch) / 1000 });
paint();
const displayTimer = setInterval(paint, 1000);
displayTimer.unref();
try {
  for (let index = 0; index < protocol.count; index++) {
    const interval = intervalAt(index),
      due = epoch + interval.startMs;
    if (!stopReason)
      while (performance.now() < due) {
        await wait(Math.min(500, due - performance.now()));
        if (fs.existsSync(path.join(m.dir, 'stop-monitor.request')))
          stopReason = 'OPERATOR_STOP_FILE';
        if (stopReason) break;
      }
    const lateMs = performance.now() - due;
    let record;
    if (stopReason || lateMs > protocol.lateToleranceMs) {
      record = {
        index,
        status: 'no-data',
        at: new Date().toISOString(),
        failure: { code: stopReason ?? 'MONITOR_LATE_OR_PREVIOUS_PROBE_BUSY' },
        lateMs,
      };
      append('intervals.jsonl', record);
    } else {
      record = await probe(index, lateMs);
    }
    rows.push(record);
    progress();
    if (record.status === 'unavailable')
      event('probe_unavailable', { index, ...record.failure });
    if (record.status === 'available' && rows.at(-2)?.status === 'unavailable')
      event('recovery_observed', { index });
    if (!stopReason)
      try {
        resourcesSample();
      } catch {
        stopReason = 'RESOURCE_MONITOR_UNAVAILABLE';
        event('monitor_failure', { code: stopReason });
      }
    paint();
  }
  while (!stopReason && performance.now() - epoch < protocol.durationMs)
    await wait(
      Math.min(500, protocol.durationMs - (performance.now() - epoch)),
    );
  m.windowFinishedAt = new Date().toISOString();
  m.windowElapsedMs = performance.now() - epoch;
  m.windowStopReason = stopReason;
  save();
  const summary = summarizeIntervals(rows);
  progress();
  event('window_finished', { summary, stopReason });
  fs.writeFileSync(
    path.join(m.dir, 'window-summary.json'),
    JSON.stringify(
      {
        start: m.windowStartedAt,
        finish: m.windowFinishedAt,
        elapsedMs: m.windowElapsedMs,
        stopReason,
        ...summary,
      },
      null,
      2,
    ) + '\n',
  );
  clearInterval(displayTimer);
  paint();
  screen.finish();
  console.log(JSON.stringify({ windowFinished: true, ...summary }));
} finally {
  clearInterval(displayTimer);
  screen.finish();
  fs.unlinkSync(lock);
}
