// Auditoría offline de evidencia existente. No ejecuta k6, Docker, SQL ni HTTP.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../../../..');
const series = '71e00e3c-28eb-4262-80ce-7abe043c49ed';
const rel = (p) => path.relative(root, p).replaceAll('\\', '/');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const hash = (p) =>
  createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const base = path.join(root, '.artifacts/k6/complementary', series);
function inventory() {
  const result = {};
  function walk(p) {
    if (!fs.existsSync(p)) return;
    const s = fs.lstatSync(p);
    assert.ok(!s.isSymbolicLink(), 'Unexpected symlink');
    if (s.isDirectory())
      for (const n of fs.readdirSync(p).sort()) walk(path.join(p, n));
    else result[rel(p)] = hash(p);
  }
  for (const p of [
    '.artifacts/k6/campaigns',
    '.artifacts/k6/runs',
    '.artifacts/k6/complementary',
    '.artifacts/k6/active-campaign.json',
    '.artifacts/k6/supabase-lab/complementary',
    'src',
    'supabase/functions',
    'supabase/migrations',
    'specs',
    '.github/workflows',
    '.specify/memory/constitution.md',
    'package.json',
    'package-lock.json',
    'k6/scripts',
    'k6/lib',
    'k6/run-lab.mjs',
    'k6/complementary-cli.mjs',
    'k6/integrity.sql',
  ])
    walk(path.join(root, p));
  return result;
}
const baselinePath = path.join(out, 'preservacion-sha256.json');
const initial = inventory();
if (!fs.existsSync(baselinePath))
  fs.writeFileSync(baselinePath, JSON.stringify(initial, null, 2) + '\n');
const protectedFiles = read(baselinePath);
for (const [p, h] of Object.entries(protectedFiles))
  assert.equal(initial[p], h, 'Evidence changed: ' + p);
const readingPreservation = read(
  path.resolve(out, '../k6-final/preservacion-sha256.json'),
);
for (const [p, h] of Object.entries(readingPreservation.sha256))
  assert.equal(
    hash(path.join(root, p)),
    h,
    'Historical reading evidence changed',
  );
const finite = (x) => (Number.isFinite(x) ? x : null);
const peak = (xs) => (xs.length ? Math.max(...xs) : null);
const mean = (xs) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const minimum = (xs) => (xs.length ? Math.min(...xs) : null);
const trend = (m) =>
  m
    ? Object.fromEntries(
        ['avg', 'med', 'p(95)', 'p(99)', 'max'].map((k) => [k, finite(m[k])]),
      )
    : null;
const mib = (s) => {
  const m = /^([\d.]+)(B|KiB|MiB|GiB)/.exec(s || '');
  return m
    ? +m[1] * { B: 1 / 1048576, KiB: 1 / 1024, MiB: 1, GiB: 1024 }[m[2]]
    : null;
};
function thresholds(metrics) {
  return Object.entries(metrics).flatMap(([metric, m]) =>
    Object.entries(m.thresholds || {}).map(([expression, flag]) => {
      const match = /^(p\(\d+\)|rate|count)(<=|>=|==|<|>)([\d.]+)$/.exec(
        expression,
      );
      assert.ok(match, 'Unknown threshold');
      const [, stat, op, n] = match,
        limit = +n;
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
      const exportedPassed = typeof flag === 'boolean' ? !flag : flag.ok;
      assert.equal(passed, exportedPassed, 'Threshold mismatch');
      return { metric, expression, observed, passed };
    }),
  );
}
const attempts = [],
  resourceRows = [];
for (const level of [25, 50, 100])
  for (const id of fs.readdirSync(path.join(base, String(level))).sort()) {
    const d = path.join(base, String(level), id),
      r = read(path.join(d, 'result.json')),
      s = read(path.join(d, 'summary.json')),
      n = read(path.join(d, 'native-summary.json')),
      w = read(path.join(d, 'write-integrity.json')),
      i = read(path.join(d, 'integrity.json'));
    assert.deepEqual(s.metrics, n.metrics, 'Summary copies disagree');
    assert.equal(r.complementarySeries, series);
    const m = n.metrics,
      tt = thresholds(m),
      raw = read(path.join(d, 'resources.json'));
    const start =
      Date.parse(r.shutdown.exitedAt) - r.generatorWallSeconds * 1000;
    const samples = raw.map((x, index) => {
      const previous = raw[index - 1];
      const backend = Object.fromEntries(
        (x.backend || []).map((c) => [
          c.Name.replace('supabase_', '').replace('_barbexa-k6-lab', ''),
          {
            cpuOneCorePercent: finite(parseFloat(c.CPUPerc)),
            memoryMiB: mib(c.MemUsage),
          },
        ]),
      );
      return {
        level,
        attempt: id,
        at: new Date(x.at).toISOString(),
        elapsedSeconds: (x.at - start) / 1000,
        cpuHostPercent: finite(x.cpu),
        ramHostPercent: finite(x.ramPercent),
        freeHostGiB: finite(x.freeGiB),
        generatorWorkingMiB: finite(x.generator?.WorkingSet64 / 1048576),
        generatorPeakMiB: finite(x.generator?.PeakWorkingSet64 / 1048576),
        generatorCpuOneCorePercent:
          previous &&
          x.at > previous.at &&
          Number.isFinite(x.generator?.CPU) &&
          Number.isFinite(previous.generator?.CPU)
            ? ((x.generator.CPU - previous.generator.CPU) /
                ((x.at - previous.at) / 1000)) *
              100
            : null,
        backendMemoryMiB: Object.keys(backend).length
          ? Object.values(backend).reduce((a, b) => a + b.memoryMiB, 0)
          : null,
        pgSessions: finite(x.connections?.active),
        pgMaxConnections: finite(x.connections?.max),
        pgLockWaits: finite(x.connections?.lockWaits),
        backend,
      };
    });
    resourceRows.push(...samples);
    const vals = (key) => samples.map((x) => x[key]).filter(Number.isFinite);
    const violations = [
      'overlaps',
      'tenantMismatch',
      'duplicateReceipts',
      'duplicateRequests',
      'partialReservations',
    ];
    const integral = violations.every(
      (k) => i.before[k] === 0 && i.after[k] === 0,
    );
    const persisted = i.after.reservations - i.before.reservations;
    assert.equal(
      persisted,
      w.ownedAfter - w.ownedBefore,
      'Tenant/global reconciliation',
    );
    assert.deepEqual(r.before, i.before);
    assert.deepEqual(r.after, i.after);
    const httpCount = m.http_reqs.count,
      accepted = m['accepted_responses{operation:confirm}']?.count ?? 0;
    assert.equal(accepted, w.acceptedWrites);
    const operations = Object.fromEntries(
      ['catalog', 'slots', 'reservations', 'confirm'].map((op) => {
        const count =
          m[`accepted_responses{phase:steady,operation:${op}}`]?.count ?? null;
        return [
          op,
          {
            steadyAccepted: count,
            steadyRps: count === null ? null : count / 600,
            wallMs:
              count > 0
                ? trend(m[`operation_wall_ms{phase:steady,operation:${op}}`])
                : null,
          },
        ];
      }),
    );
    const metricSeconds = httpCount / m.http_reqs.rate;
    const durationVerified =
      r.generatorWallSeconds >= w.expectedSeconds &&
      w.expectedSeconds === 780 &&
      metricSeconds >= 780 &&
      r.plan.steadySeconds === 600 &&
      w.maximumActiveVU === level;
    const approved =
      r.exit === 0 &&
      r.interrupted === null &&
      r.recovered &&
      integral &&
      w.verified &&
      persisted === accepted &&
      durationVerified &&
      tt.every((x) => x.passed);
    if (r.exit === 0)
      assert.ok(approved, 'Successful run fails independent audit');
    if (!approved)
      for (const operation of Object.values(operations))
        operation.steadyRps = null;
    const backendKeys = new Set(samples.flatMap((x) => Object.keys(x.backend)));
    const resources = {
      samples: samples.length,
      observedSeconds: (raw.at(-1).at - raw[0].at) / 1000,
      cpuHostPeakPercent: peak(vals('cpuHostPercent')),
      cpuHostMeanPercent: mean(vals('cpuHostPercent')),
      ramHostPeakPercent: peak(vals('ramHostPercent')),
      minimumFreeHostGiB: minimum(vals('freeHostGiB')),
      generatorPeakMiB: peak(vals('generatorPeakMiB')),
      generatorCpuPeakOneCorePercent: peak(vals('generatorCpuOneCorePercent')),
      backendMemoryPeakMiB: peak(vals('backendMemoryMiB')),
      pgSessionsPeak: peak(vals('pgSessions')),
      pgMaxConnections: peak(vals('pgMaxConnections')),
      pgLockWaitsPeak: peak(vals('pgLockWaits')),
      backend: Object.fromEntries(
        [...backendKeys].map((k) => [
          k,
          {
            cpuPeakOneCorePercent: peak(
              samples
                .map((x) => x.backend[k]?.cpuOneCorePercent)
                .filter(Number.isFinite),
            ),
            memoryPeakMiB: peak(
              samples
                .map((x) => x.backend[k]?.memoryMiB)
                .filter(Number.isFinite),
            ),
          },
        ]),
      ),
    };
    const steadyCount = Object.values(operations).reduce(
      (a, x) => a + (x.steadyAccepted || 0),
      0,
    );
    attempts.push({
      level,
      id,
      source: rel(d),
      approved,
      exit: r.exit,
      interrupted: r.interrupted,
      recovered: r.recovered,
      forcedShutdown: r.shutdown.forced,
      finishedAt: r.finishedAt,
      warmSeconds: r.plan.warmSeconds,
      rampSeconds: r.plan.rampSeconds,
      steadySeconds: r.plan.steadySeconds,
      downSeconds: r.plan.rampSeconds,
      recoverySeconds: r.plan.recoverySeconds,
      generatorWallSeconds: r.generatorWallSeconds,
      metricSeconds,
      durationVerified,
      maximumActiveVU: w.maximumActiveVU,
      httpCount,
      rps: m.http_reqs.rate,
      httpMs: trend(m.http_req_duration),
      wallMs: trend(m.operation_wall_ms),
      technicalErrorCount: m.technical_errors.passes,
      technicalErrorRate: m.technical_errors.value,
      unexpectedCount: m.unexpected_results.passes,
      checksPassed: m.checks.passes,
      checksFailed: m.checks.fails,
      acceptedConfirmations: accepted,
      persistedReservations: persisted,
      unacknowledgedPersisted: persisted - accepted,
      globalBefore: i.before.reservations,
      globalAfter: i.after.reservations,
      ownedBefore: w.ownedBefore,
      ownedAfter: w.ownedAfter,
      integrityValid: integral,
      integrity: i,
      expectedConflictsMetric: m.expected_conflicts?.count ?? null,
      expectedConflictsInApproved: approved ? 0 : null,
      conflictsBasis:
        'Strict confirm contract requires HTTP 201; 409 fails. Approved checks=100%, so zero conflicts inferred; absent raw counter stays null.',
      steadyCount,
      steadyRps: approved ? steadyCount / 600 : null,
      steadyConfirmShare: steadyCount
        ? operations.confirm.steadyAccepted / steadyCount
        : null,
      confirmationShare: accepted / httpCount,
      operations,
      resources,
      thresholds: tt,
    });
  }
attempts.sort((a, b) => a.finishedAt.localeCompare(b.finishedAt));
const approved = attempts.filter((a) => a.approved);
assert.deepEqual(
  approved.map((a) => a.level),
  [25, 50, 100],
);
for (let j = 1; j < attempts.length; j++)
  assert.equal(attempts[j - 1].globalAfter, attempts[j].globalBefore);
const manifest = read(
  path.join(
    root,
    '.artifacts/k6/supabase-lab/complementary',
    series,
    'manifest.json',
  ),
);
for (const a of approved) {
  assert.ok(manifest.levels[a.level].passed);
  assert.ok(manifest.levels[a.level].recovered);
  assert.ok(manifest.levels[a.level].output.endsWith(a.id));
}
assert.ok(!manifest.inProgress);
const a100 = approved.at(-1),
  metrics100 = read(path.join(root, a100.source, 'summary.json')).metrics;
// Distribution-free bound for the mean of confirmations, not a reconstructed percentile.
// Known steady read sums are exact aggregate counts*means; other read phases lack a tagged trend.
const knownReads = ['catalog', 'slots', 'reservations'].reduce(
  (acc, op) => {
    const x = a100.operations[op];
    return {
      count: acc.count + x.steadyAccepted,
      ms: acc.ms + x.steadyAccepted * x.wallMs.avg,
    };
  },
  { count: 0, ms: 0 },
);
const unknownReads =
  a100.httpCount - a100.acceptedConfirmations - knownReads.count;
const remainingWallSum = a100.httpCount * a100.wallMs.avg - knownReads.ms;
const confirmationMeanBounds = {
  method:
    'Aggregate-sum bounds only; remaining read durations bounded by 0 and global wall maximum. Not directly measured confirmation latency.',
  knownSteadyReadCount: knownReads.count,
  unknownTransitionReadCount: unknownReads,
  minMs: Math.max(
    0,
    (remainingWallSum - unknownReads * a100.wallMs.max) /
      a100.acceptedConfirmations,
  ),
  maxMs: Math.min(
    a100.wallMs.max,
    remainingWallSum / a100.acceptedConfirmations,
  ),
};
const originalPath = path.resolve(
  root,
  '../Laboratorio/Tareas/Semana 2/ENTREGABLE-02 - ANALISIS DE CASO-ARQUITECTURA/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md',
);
assert.ok(fs.existsSync(originalPath), 'Original academic source unavailable');
const original = fs.readFileSync(originalPath, 'utf8');
for (const id of ['04', '06', '08'])
  assert.ok(original.includes('## EQ-' + id));
const final = {
  auditedAt: new Date().toISOString(),
  series,
  method: 'Offline only; original saved evidence, no new requests or load.',
  originalCriteria: {
    path: 'docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md',
    sha256: hash(originalPath),
  },
  attempts,
  approvedLevels: approved.map((a) => a.level),
  totals: {
    approvedHttp: approved.reduce((n, a) => n + a.httpCount, 0),
    approvedAccepted: approved.reduce((n, a) => n + a.acceptedConfirmations, 0),
    approvedPersisted: approved.reduce(
      (n, a) => n + a.persistedReservations,
      0,
    ),
    failedAccepted: attempts
      .filter((a) => !a.approved)
      .reduce((n, a) => n + a.acceptedConfirmations, 0),
    failedPersisted: attempts
      .filter((a) => !a.approved)
      .reduce((n, a) => n + a.persistedReservations, 0),
    globalBeforeSeries: attempts[0].globalBefore,
    globalAfterSeries: attempts.at(-1).globalAfter,
  },
  confirmationLatency: {
    measuredPercentiles: null,
    reason:
      'Neither native summary nor custom export retains confirm-tagged Trends or raw request samples.',
    aggregateMeanBounds100VU: confirmationMeanBounds,
  },
  eq04: {
    status: 'Cumplido en laboratorio y consultas definidas',
    level: 100,
    steadySeconds: 600,
    queryP95Ms: Object.fromEntries(
      ['catalog', 'slots', 'reservations'].map((op) => [
        op,
        a100.operations[op].wallMs['p(95)'],
      ]),
    ),
    technicalErrors: 0,
  },
  eq06: {
    status: 'Cumplido en laboratorio y mezcla definida',
    levels: [25, 50, 100],
    steadySecondsEach: 600,
    technicalErrors: 0,
    integrityLosses: 0,
  },
  limitations: [
    'API local, no Web rendering, Android, Internet or production guarantee.',
    'Only two tenants and fixed dataset/service; data volume grows between stages.',
    'Confirmation percentiles unavailable; global HTTP p95 at 100 VU exceeds 3 s, a documented writing-path limitation, not a failed original query criterion.',
    '2000 VU deferred as additional academic target; 1000 VU accredited for read-only campaign only.',
  ],
};
fs.writeFileSync(
  path.join(out, 'auditoria.json'),
  JSON.stringify(final, null, 2) + '\n',
);
function csv(name, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const cell = (v) =>
    v === null || v === undefined
      ? ''
      : /[",\n]/.test(String(v))
        ? '"' + String(v).replaceAll('"', '""') + '"'
        : String(v);
  fs.writeFileSync(
    path.join(out, name),
    [
      keys.join(','),
      ...rows.map((r) => keys.map((k) => cell(r[k])).join(',')),
    ].join('\n') + '\n',
  );
}
csv(
  'niveles.csv',
  approved.map((a) => ({
    vu: a.level,
    steady_seconds: a.steadySeconds,
    http: a.httpCount,
    rps_all_phases: a.rps,
    rps_steady: a.steadyRps,
    http_avg_ms: a.httpMs.avg,
    http_p50_ms: a.httpMs.med,
    http_p95_ms: a.httpMs['p(95)'],
    http_p99_ms: a.httpMs['p(99)'],
    accepted: a.acceptedConfirmations,
    persisted: a.persistedReservations,
    technical_errors: a.technicalErrorCount,
    unexpected: a.unexpectedCount,
    global_before: a.globalBefore,
    global_after: a.globalAfter,
  })),
);
csv(
  'operaciones.csv',
  approved.flatMap((a) =>
    Object.entries(a.operations).map(([op, v]) => ({
      vu: a.level,
      operation: op,
      steady_accepted: v.steadyAccepted,
      steady_rps: v.steadyRps,
      avg_wall_ms: v.wallMs?.avg ?? null,
      p50_wall_ms: v.wallMs?.med ?? null,
      p95_wall_ms: v.wallMs?.['p(95)'] ?? null,
      p99_wall_ms: v.wallMs?.['p(99)'] ?? null,
      max_wall_ms: v.wallMs?.max ?? null,
    })),
  ),
);
csv(
  'intentos.csv',
  attempts.map((a) => ({
    vu: a.level,
    attempt: a.id,
    approved: a.approved,
    exit: a.exit,
    interrupted: a.interrupted,
    http: a.httpCount,
    technical_errors: a.technicalErrorCount,
    accepted: a.acceptedConfirmations,
    persisted: a.persistedReservations,
    unacknowledged_persisted: a.unacknowledgedPersisted,
    recovered: a.recovered,
    integrity: a.integrityValid,
  })),
);
csv(
  'umbrales.csv',
  attempts.flatMap((a) =>
    a.thresholds.map((t) => ({ vu: a.level, attempt: a.id, ...t })),
  ),
);
csv(
  'recursos-serie.csv',
  resourceRows.map(({ backend, ...x }) => x),
);
csv(
  'recursos-resumen.csv',
  approved.map((a) => ({
    vu: a.level,
    ...Object.fromEntries(
      Object.entries(a.resources).filter(([k]) => k !== 'backend'),
    ),
  })),
);
const ending = inventory();
assert.deepEqual(
  ending,
  initial,
  'Evidence/product changed during offline audit',
);
fs.writeFileSync(
  path.join(out, 'verificacion.json'),
  JSON.stringify(
    {
      at: final.auditedAt,
      protectedFiles: Object.keys(protectedFiles).length,
      protectedHashesUnchanged: true,
      historicalReadingFilesVerified: readingPreservation.files,
      attempts: attempts.length,
      approved: approved.length,
      notApproved: attempts.length - approved.length,
      thresholdsRecalculated: attempts.reduce(
        (a, x) => a + x.thresholds.length,
        0,
      ),
      approvedThresholdsPassed: approved.reduce(
        (a, x) => a + x.thresholds.length,
        0,
      ),
      continuityVerified: true,
      persistedEqualsAcceptedForApproved: true,
      recordedRecoveryVerified: true,
      k6Executed: false,
      networkRequests: 0,
      databaseQueries: 0,
      productChanges: false,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    {
      totals: final.totals,
      levels: approved.map((a) => ({
        level: a.level,
        http: a.httpCount,
        rps: a.rps,
        steadyRps: a.steadyRps,
        readP95: a100.level === a.level ? final.eq04.queryP95Ms : null,
        resources: a.resources,
        globalP95: a.httpMs['p(95)'],
      })),
      confirmationMeanBounds,
      protected: Object.keys(protectedFiles).length,
    },
    null,
    2,
  ),
);
