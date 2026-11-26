// Auditoría offline: lee resultados existentes; nunca invoca k6, Docker o una API.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  profile,
  segmentResults,
  metricValues,
} from '../../../../../k6/lib/profiles.mjs';

const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, '../../../../..');
const campaign = 'af768017-0ecc-48b5-b6fe-af5aa287cd5d';
const base = path.join(root, '.artifacts/k6/campaigns', campaign);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const sha = (p) =>
  createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function inventory() {
  const result = {};
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw Error('SYMLINK_IN_EVIDENCE');
      if (entry.isDirectory()) walk(p);
      else result[path.relative(root, p).replaceAll('\\', '/')] = sha(p);
    }
  }
  walk(path.join(root, '.artifacts/k6/campaigns'));
  walk(path.join(root, '.artifacts/k6/runs'));
  const p = '.artifacts/k6/active-campaign.json';
  result[p] = sha(path.join(root, p));
  return result;
}
const initial = inventory();
const finite = (n) => (Number.isFinite(n) ? n : null);
const rate = (m) => finite(m?.rate ?? m?.value);
const peak = (values) => (values.length ? Math.max(...values) : null);
const average = (values) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const mib = (text) => {
  const m = /^([\d.]+)(B|KiB|MiB|GiB)/.exec(text || '');
  return m
    ? +m[1] * { B: 1 / 1048576, KiB: 1 / 1024, MiB: 1, GiB: 1024 }[m[2]]
    : null;
};
function resourceSeries(samples, epoch) {
  return samples.map((s, i) => {
    const prev = samples[i - 1];
    const backend = Object.fromEntries(
      (s.backend || []).map((c) => [
        c.Name.replace('supabase_', '').replace('_barbexa-k6-lab', ''),
        {
          cpuOneCorePercent: finite(parseFloat(c.CPUPerc)),
          memoryMiB: mib(c.MemUsage),
          pids: finite(Number(c.PIDs)),
        },
      ]),
    );
    return {
      at: new Date(s.at).toISOString(),
      elapsedSeconds: epoch === null ? null : (s.at - epoch) / 1000,
      cpuHostPercent: finite(s.cpu),
      ramHostPercent: finite(s.ramPercent),
      freeHostGiB: finite(s.freeGiB),
      generatorWorkingMiB: finite(s.generator?.WorkingSet64 / 1048576),
      generatorPeakMiB: finite(s.generator?.PeakWorkingSet64 / 1048576),
      generatorCpuOneCorePercent:
        prev &&
        s.at > prev.at &&
        Number.isFinite(s.generator?.CPU) &&
        Number.isFinite(prev.generator?.CPU)
          ? ((s.generator.CPU - prev.generator.CPU) /
              ((s.at - prev.at) / 1000)) *
            100
          : null,
      backendMemoryMiB: Object.keys(backend).length
        ? Object.values(backend).reduce((a, b) => a + b.memoryMiB, 0)
        : null,
      pgSessions: finite(s.connections?.active),
      pgMaxConnections: finite(s.connections?.max),
      pgLockWaits: finite(s.connections?.lockWaits),
      backend,
    };
  });
}
function resources(samples) {
  const values = (k) => samples.map((s) => s[k]).filter(Number.isFinite);
  const all = new Set(samples.flatMap((s) => Object.keys(s.backend)));
  return {
    samples: samples.length,
    cpuHostPeakPercent: peak(values('cpuHostPercent')),
    cpuHostMeanPercent: average(values('cpuHostPercent')),
    ramHostPeakPercent: peak(values('ramHostPercent')),
    minimumFreeHostGiB: values('freeHostGiB').length
      ? Math.min(...values('freeHostGiB'))
      : null,
    generatorPeakMiB: peak(values('generatorPeakMiB')),
    generatorCpuPeakOneCorePercent: peak(values('generatorCpuOneCorePercent')),
    backendMemoryPeakMiB: peak(values('backendMemoryMiB')),
    pgSessionsPeak: peak(values('pgSessions')),
    pgMaxConnections: peak(values('pgMaxConnections')),
    pgLockWaitsPeak: peak(values('pgLockWaits')),
    backend: Object.fromEntries(
      [...all].map((k) => [
        k,
        {
          cpuPeakOneCorePercent: peak(
            samples
              .map((s) => s.backend[k]?.cpuOneCorePercent)
              .filter(Number.isFinite),
          ),
          memoryPeakMiB: peak(
            samples.map((s) => s.backend[k]?.memoryMiB).filter(Number.isFinite),
          ),
        },
      ]),
    ),
  };
}
function thresholdAudit(metrics) {
  const rows = [];
  for (const [metric, m] of Object.entries(metrics))
    for (const [expression, flag] of Object.entries(m.thresholds || {})) {
      const match =
        /^(p\(\d+\)|rate|count|value|avg|med|max|min)(<=|>=|==|<|>)(-?[\d.]+)$/.exec(
          expression,
        );
      if (!match) throw Error('UNKNOWN_THRESHOLD:' + expression);
      const [, stat, op, limitText] = match,
        limit = +limitText;
      const observed = finite(stat === 'rate' ? (m.rate ?? m.value) : m[stat]);
      const passed =
        observed === null
          ? null
          : {
              '<': observed < limit,
              '<=': observed <= limit,
              '>': observed > limit,
              '>=': observed >= limit,
              '==': observed === limit,
            }[op];
      // k6 2.4 legacy summary export encodes !threshold.ok, not an approval boolean.
      const exportedPassed = typeof flag === 'boolean' ? !flag : flag.ok;
      rows.push({
        metric,
        expression,
        observed,
        exportedPassed,
        recalculatedPassed: passed,
        consistent: passed === null || passed === exportedPassed,
      });
    }
  return rows;
}
const attempts = [];
for (const type of ['smoke', 'load', 'load-academico', 'stress', 'spike']) {
  const dir = path.join(base, type);
  if (!fs.existsSync(dir)) continue;
  for (const id of fs.readdirSync(dir)) {
    const d = path.join(dir, id),
      result = read(path.join(d, 'result.json'));
    const integrity = read(path.join(d, 'integrity.json'));
    const native = fs.existsSync(path.join(d, 'native-summary.json'))
      ? read(path.join(d, 'native-summary.json'))
      : null;
    const summary = fs.existsSync(path.join(d, 'summary.json'))
      ? read(path.join(d, 'summary.json'))
      : null;
    const metrics = native?.metrics || {};
    if (summary && JSON.stringify(summary.metrics) !== JSON.stringify(metrics))
      throw Error('SUMMARY_METRICS_MISMATCH');
    const thresholds = thresholdAudit(metrics);
    const epoch = finite(metrics.scenario_start_epoch?.value);
    const samples = resourceSeries(read(path.join(d, 'resources.json')), epoch);
    const p = profile(type, result.peak || 0);
    const complete = result.exit === 0 && result.interrupted === null;
    const integrityValid =
      integrity.before &&
      integrity.after &&
      [
        'overlaps',
        'tenantMismatch',
        'duplicateReceipts',
        'duplicateRequests',
        'partialReservations',
      ].every((k) => integrity.before[k] === 0 && integrity.after[k] === 0) &&
      integrity.before.reservations === integrity.after.reservations;
    const observedMetricSeconds =
      metrics.http_reqs?.rate > 0
        ? metrics.http_reqs.count / metrics.http_reqs.rate
        : null;
    const durationVerified =
      type === 'smoke'
        ? metrics.iterations?.count === 5 &&
          observedMetricSeconds <= 30 &&
          result.generatorWallSeconds <= 30
        : observedMetricSeconds !== null &&
          observedMetricSeconds >= p.durationSeconds &&
          result.generatorWallSeconds >= p.durationSeconds;
    const passed = Boolean(
      native &&
      complete &&
      durationVerified &&
      result.recovered &&
      integrityValid &&
      thresholds.length &&
      thresholds.every(
        (t) =>
          t.exportedPassed && t.recalculatedPassed === true && t.consistent,
      ) &&
      rate(metrics.checks) === 1 &&
      metrics.checks?.fails === 0,
    );
    const segments = summary
      ? segmentResults(p, metrics, complete).map((s) => {
          const valid = s.requests > 0;
          const windowSamples = samples.filter(
            (x) =>
              x.elapsedSeconds !== null &&
              x.elapsedSeconds >= s.start &&
              x.elapsedSeconds < s.end,
          );
          const wall = Object.fromEntries(
            ['catalog', 'slots'].map((op) => [
              op,
              metricValues(metrics, 'operation_wall_ms', s.name, op),
            ]),
          );
          return {
            ...s,
            avgMs: valid ? s.avgMs : null,
            p50Ms: valid ? s.p50Ms : null,
            p95Ms: valid ? s.p95Ms : null,
            p99Ms: valid ? s.p99Ms : null,
            completedCounter: finite(
              metricValues(metrics, 'segment_completed', s.name)?.count,
            ),
            durationBasis: s.completed
              ? 'scheduled plateau; completion counter and full successful exit or later requests'
              : 'incomplete; no accredited duration',
            measuredRequestSpanSeconds: null,
            operations: wall,
            resources: resources(windowSamples),
            errorsTechnicalCount: finite(
              metricValues(metrics, 'technical_errors', s.name)?.passes,
            ),
            errorsFunctionalCount: finite(
              metricValues(metrics, 'unexpected_results', s.name)?.passes,
            ),
          };
        })
      : [];
    const eofFile = path.join(d, 'javascript-console.log');
    const eofEvents = fs.existsSync(eofFile)
      ? fs
          .readFileSync(eofFile, 'utf8')
          .split(/\r?\n/)
          .filter((s) => s.includes('"event":"transport_eof"'))
          .map((l) => JSON.parse(l.slice(l.indexOf('{'))))
      : [];
    const laboratory = fs.existsSync(path.join(d, 'lab-configuration.json'))
      ? read(path.join(d, 'lab-configuration.json'))
      : null;
    attempts.push({
      type,
      id,
      source: path.relative(root, d).replaceAll('\\', '/'),
      finishedAt: result.finishedAt,
      methodology: result.methodology || 'strict-every-request',
      laboratory,
      status: passed
        ? 'Aprobado'
        : native
          ? 'Fallido'
          : 'Interrumpido sin resumen',
      passed,
      exit: result.exit,
      interrupted: result.interrupted,
      recovered: result.recovered,
      integrityValid,
      configuredSeconds: p.durationSeconds,
      generatorWallSeconds: result.generatorWallSeconds,
      recoveryConfiguredSeconds: p.recoverySeconds,
      durationVerified,
      recoveryObservedEndAt: result.finishedAt,
      shutdown: result.shutdown || null,
      total: {
        requests: finite(metrics.http_reqs?.count),
        rps: finite(metrics.http_reqs?.rate),
        iterations: finite(metrics.iterations?.count),
        inferredMetricDurationSeconds:
          metrics.http_reqs?.rate > 0
            ? metrics.http_reqs.count / metrics.http_reqs.rate
            : null,
        avgMs: finite(metrics.http_req_duration?.avg),
        p50Ms: finite(metrics.http_req_duration?.med),
        p95Ms: finite(metrics.http_req_duration?.['p(95)']),
        p99Ms: finite(metrics.http_req_duration?.['p(99)']),
        maxObservedVU: finite(metrics.vus?.max),
        maxAccreditedVU:
          type === 'smoke' && passed
            ? 1
            : Math.max(
                0,
                ...segments
                  .filter((s) => s.completed && s.passed)
                  .map((s) => s.level),
              ) || null,
        technicalErrorRate: rate(metrics.technical_errors),
        functionalErrorRate: rate(metrics.unexpected_results),
        technicalErrors: finite(metrics.technical_errors?.passes),
        functionalErrors: finite(metrics.unexpected_results?.passes),
        checksPassed: finite(metrics.checks?.passes),
        checksFailed: finite(metrics.checks?.fails),
        eofCount:
          finite(metrics.transport_eof_errors?.count) ??
          (native && type === 'stress'
            ? metrics.technical_errors?.passes === 0
              ? 0
              : null
            : null),
        eofLoggedCount: fs.existsSync(eofFile) ? eofEvents.length : null,
      },
      thresholds,
      segments,
      resources: resources(samples),
      samples,
      eofEvents,
      integrity,
    });
  }
}
const selected = Object.fromEntries(
  ['smoke', 'load', 'load-academico', 'stress', 'spike'].map((type) => [
    type,
    attempts
      .filter((a) => a.type === type && a.passed)
      .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
      .at(-1)?.id || null,
  ]),
);
const consistent = attempts.every((a) =>
  a.thresholds.every((t) => t.consistent),
);
if (!consistent) throw Error('THRESHOLD_RECALCULATION_DISAGREEMENT');
const report = {
  campaign,
  generatedAt: new Date().toISOString(),
  newLoadExecuted: false,
  sourceHashes: Object.fromEntries(
    [
      'k6/scripts/booking-api.js',
      'k6/lib/profiles.mjs',
      'k6/lib/transport-policy.mjs',
      'k6/lib/cli-policy.mjs',
      'k6/lib/resources.mjs',
      'k6/run-lab.mjs',
      'k6/integrity.sql',
      'k6/kong-tuning.mjs',
    ].map((p) => [p, sha(path.join(root, p))]),
  ),
  metricNotes: {
    latency:
      'HTTP duration in ms; end-to-end wall metrics provided per operation',
    rps: 'global k6 rate; segment RPS = observed request count / scheduled completed plateau seconds',
    cpu: 'Host % across 24 logical CPUs; Docker and generator % relative to one CPU; interval averages, not instantaneous peaks',
    missing: 'null or empty CSV cells mean unavailable; never zero-filled',
    duration:
      'No request-level time series; plateau schedule and crossing counters prove completion, not exact per-VU occupancy at every instant',
    thresholds:
      'Legacy export boolean false = satisfied (!threshold.ok); independently recomputed from metric values',
  },
  selected,
  attempts,
};
const final = inventory();
if (JSON.stringify(initial) !== JSON.stringify(final))
  throw Error('RAW_EVIDENCE_MODIFIED');
fs.writeFileSync(
  path.join(output, 'auditoria.json'),
  JSON.stringify(report, null, 2) + '\n',
);
fs.writeFileSync(
  path.join(output, 'preservacion-sha256.json'),
  JSON.stringify(
    {
      campaign,
      files: Object.keys(initial).length,
      unchanged: true,
      sha256: initial,
    },
    null,
    2,
  ) + '\n',
);
function csv(name, rows) {
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const cell = (v) =>
    v === null || v === undefined ? '' : `"${String(v).replaceAll('"', '""')}"`;
  fs.writeFileSync(
    path.join(output, name),
    columns.join(',') +
      '\n' +
      rows.map((r) => columns.map((c) => cell(r[c])).join(',')).join('\n') +
      '\n',
  );
}
csv(
  'intentos.csv',
  attempts.map((a) => ({
    type: a.type,
    id: a.id,
    status: a.status,
    exit: a.exit,
    interrupted: a.interrupted,
    configuredSeconds: a.configuredSeconds,
    generatorWallSeconds: a.generatorWallSeconds,
    ...a.total,
    cpuHostPeakPercent: a.resources.cpuHostPeakPercent,
    ramHostPeakPercent: a.resources.ramHostPeakPercent,
    generatorPeakMiB: a.resources.generatorPeakMiB,
    backendMemoryPeakMiB: a.resources.backendMemoryPeakMiB,
    pgSessionsPeak: a.resources.pgSessionsPeak,
    recovered: a.recovered,
    integrityValid: a.integrityValid,
    thresholdsPassed: a.thresholds.filter((t) => t.exportedPassed).length,
    thresholdsFailed: a.thresholds.filter((t) => !t.exportedPassed).length,
  })),
);
csv(
  'tramos.csv',
  attempts.flatMap((a) =>
    a.segments.map((s) => ({
      type: a.type,
      id: a.id,
      attemptStatus: a.status,
      selected: selected[a.type] === a.id,
      segment: s.name,
      VU: s.level,
      configuredSeconds: s.seconds,
      completed: s.completed,
      passed: s.passed,
      requests: s.requests,
      rps: s.requests > 0 && s.completed ? s.rps : null,
      avgMs: s.avgMs,
      p50Ms: s.p50Ms,
      p95Ms: s.p95Ms,
      p99Ms: s.p99Ms,
      catalogWallP95Ms: s.operations.catalog?.['p(95)'],
      slotsWallP95Ms: s.operations.slots?.['p(95)'],
      catalogWallP99Ms: s.operations.catalog?.['p(99)'],
      slotsWallP99Ms: s.operations.slots?.['p(99)'],
      technicalErrorRate: s.technicalErrorRate,
      functionalErrorRate: s.unexpectedRate,
      technicalErrors: s.errorsTechnicalCount,
      functionalErrors: s.errorsFunctionalCount,
      ...Object.fromEntries(
        Object.entries(s.resources).filter(([k]) => k !== 'backend'),
      ),
    })),
  ),
);
csv(
  'umbrales.csv',
  attempts.flatMap((a) =>
    a.thresholds.map((t) => ({ type: a.type, id: a.id, ...t })),
  ),
);
csv(
  'recursos-serie.csv',
  attempts.flatMap((a) =>
    a.samples.map((s) => ({
      type: a.type,
      id: a.id,
      ...Object.fromEntries(Object.entries(s).filter(([k]) => k !== 'backend')),
    })),
  ),
);
console.log(
  JSON.stringify(
    {
      rawFilesPreserved: Object.keys(initial).length,
      attempts: attempts.length,
      selected,
      totals: attempts.map((a) => ({
        type: a.type,
        id: a.id,
        status: a.status,
        total: a.total,
        resourcePeaks: a.resources,
        passedSegments: a.segments.filter((s) => s.passed).map((s) => s.level),
      })),
    },
    null,
    2,
  ),
);
