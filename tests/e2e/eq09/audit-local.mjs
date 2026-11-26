// Solo lectura: concilia el E2E aprobado con PostgreSQL y preservación histórica.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ownedLab, root } from '../../../k6/lib/lab-client.mjs';
import { sqlId as q } from '../../../k6/lib/fixture-values.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const pointer = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(pointer.manifest));
assert.ok(m.approvedAttempt, 'NO_APPROVED_E2E');
const env = ownedLab({ recordBaseline: false });
assert.equal(env.sql('select run_id from private.k6_lab_marker;'), m.marker);
const observed = JSON.parse(
  fs.readFileSync(path.join(m.approvedAttempt, 'e2e-observed.json')),
);
const report = JSON.parse(
  fs.readFileSync(path.join(m.approvedAttempt, 'playwright-results.json')),
);
assert.equal(report.stats.expected, 1);
assert.equal(report.stats.unexpected, 0);
assert.equal(report.stats.skipped, 0);
assert.equal(report.stats.flaky, 0);
const requests = observed.confirmations;
assert.deepEqual(
  requests.map((x) => [x.actor, x.status]),
  [
    ['A', 201],
    ['B', 409],
    ['B', 201],
  ],
);
assert.equal(new Set(requests.map((x) => x.requestId)).size, 3);
const rows = JSON.parse(
  env.sql(
    `select coalesce(json_agg(json_build_object('requestId',r.request_id,'clientId',r.client_user_id,'startsAt',to_char(r.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'serviceIds',(select json_agg(i.service_id) from public.reservation_items i where i.reservation_id=r.id),'state',r.state,'itemCount',(select count(*) from public.reservation_items i where i.reservation_id=r.id),'confirmedEvents',(select count(*) from public.reservation_events e where e.reservation_id=r.id and e.kind='confirmed'),'careCount',(select count(*) from private.booking_care c where c.reservation_id=r.id)) order by r.starts_at),'[]') from public.reservations r where r.barbershop_id=${q(m.shop)};`,
  ),
);
assert.equal(rows.length, 2, 'Unexpected synthetic shop reservation count');
for (const request of requests) {
  const r = rows.filter((r) => r.requestId === request.requestId);
  if (request.status === 409) {
    assert.equal(r.length, 0);
    continue;
  }
  assert.equal(r.length, 1);
  assert.equal(r[0].clientId, m.accounts[request.actor === 'A' ? 2 : 3].id);
  assert.equal(r[0].startsAt, request.startsAt);
  assert.deepEqual(r[0].serviceIds, [m.service]);
  assert.equal(r[0].state, 'confirmed');
  assert.equal(r[0].itemCount, 1);
  assert.equal(r[0].confirmedEvents, 1);
  assert.equal(r[0].careCount, 1);
}
const priorTables = [];
for (const [t, before] of Object.entries(m.baseline)) {
  const after = JSON.parse(
    env.sql(
      `select coalesce(json_agg(md5(to_jsonb(r)::text) order by md5(to_jsonb(r)::text)),'[]') from ${t} r;`,
    ),
  );
  const counts = new Map();
  for (const h of after) counts.set(h, (counts.get(h) || 0) + 1);
  for (const h of before) {
    assert.ok(counts.get(h) > 0, 'Prior row changed or removed: ' + t);
    counts.set(h, counts.get(h) - 1);
  }
  priorTables.push({
    table: t,
    priorRows: before.length,
    priorRowsPreserved: true,
    addedRows: after.length - before.length,
  });
}
const hash = (p) =>
  createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for (const [p, h] of Object.entries(m.protectedFiles))
  assert.equal(hash(path.join(root, p)), h, 'Protected product file changed');
const prior = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      'docs/evaluacion/evidencias/004-reservas/k6-mixta-final/preservacion-sha256.json',
    ),
  ),
);
for (const [p, h] of Object.entries(prior))
  assert.equal(hash(path.join(root, p)), h, 'Prior evidence changed');
const integrity = JSON.parse(
  env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
);
for (const k of [
  'overlaps',
  'duplicateRequests',
  'partialReservations',
  'tenantMismatch',
  'duplicateReceipts',
])
  assert.equal(integrity[k], 0, k);
assert.equal(
  integrity.reservations,
  m.baseline['public.reservations'].length + 2,
);
const rgb = (s) =>
  s
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number);
const luminance = (rgb) =>
  rgb
    .map((x) => x / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
    .reduce((s, x, i) => s + x * [0.2126, 0.7152, 0.0722][i], 0);
const fg = luminance(rgb(observed.checks.errorAccessibility.color)),
  bg = luminance(rgb(observed.checks.errorAccessibility.background));
const contrast = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
assert.ok(contrast >= 4.5);
const out = path.join(root, 'docs/evaluacion/evidencias/eq09');
fs.mkdirSync(out, { recursive: true });
const rawPath = path.join(m.approvedAttempt, 'sql-audit-private.json');
fs.writeFileSync(
  rawPath,
  JSON.stringify({ rows, priorTables, integrity }, null, 2) + '\n',
);
for (const name of observed.screenshots) {
  assert.ok(/^0[1-3]-[a-z-]+\.png$/.test(name));
  fs.copyFileSync(path.join(m.approvedAttempt, name), path.join(out, name));
}
const safe = {
  at: new Date().toISOString(),
  fixtureRun: m.id,
  approvedAttempt: path.basename(m.approvedAttempt),
  status:
    'Recorrido funcional Web aprobado; EQ-09 integral parcialmente cumplido',
  playwright: {
    version: observed.playwright,
    browser: observed.browser,
    stats: report.stats,
    workers: 1,
    retries: 0,
    viewport: observed.viewport,
  },
  confirmations: requests.map((x) => ({
    actor: x.actor,
    status: x.status,
    startsAt: x.startsAt,
  })),
  integrity: {
    ...integrity,
    fixtureReservations: 2,
    conflictRequestPersisted: false,
    eachAcceptedRequestPersistedOnce: true,
    eachReservationOneItemEventAndCare: true,
  },
  preservation: {
    priorTables,
    productFiles: Object.keys(m.protectedFiles).length,
    priorEvidenceFiles: Object.keys(prior).length,
    hashesUnchanged: true,
  },
  checks: observed.checks,
  accessibility: {
    errorTextContrast: contrast,
    contrastRequired: 4.5,
    politeLiveRegion:
      observed.checks.errorAccessibility.liveRegion === 'polite',
    inspectedTargetsAtLeast44: observed.checks.controls.every(
      (x) => x.box.width >= 44 && x.box.height >= 44,
    ),
    horizontalOverflow390: false,
    focusAfterConflict: observed.checks.errorAccessibility.focusTag,
    completeWcagAudit: false,
    realScreenReaderTested: false,
    participantsTested: false,
    androidNativeTested: false,
    locationDeniedTested: false,
  },
  network: {
    blockedExternalRequests: observed.blocked.length,
    pageErrors: observed.pageErrors.length,
    realBackendResponses: true,
    mockedBusinessResponses: false,
  },
  screenshots: observed.screenshots,
  nativeReportPrivate: path
    .relative(
      root,
      path.join(m.approvedAttempt, 'playwright-report/index.html'),
    )
    .replaceAll('\\', '/'),
  tracePrivate: path
    .relative(root, path.join(m.approvedAttempt, 'trace-client-B-private.zip'))
    .replaceAll('\\', '/'),
  k6Executed: false,
  cloudModified: false,
  migrationsModified: false,
  productModified: false,
  eq05MeasurementStarted: false,
};
fs.writeFileSync(
  path.join(out, 'resultados.json'),
  JSON.stringify(safe, null, 2) + '\n',
);
fs.writeFileSync(
  path.join(out, 'playwright-resumen.json'),
  JSON.stringify(
    {
      runner: 'Playwright Test',
      version: observed.playwright,
      stats: report.stats,
      test: 'EQ-09: conflicto real, servicios conservados y recuperación sin duplicados',
      steps: [
        'Sesiones independientes',
        'Mismo horario libre',
        'A confirma 201',
        'B recibe 409 y conserva servicios',
        'B elige otro horario con teclado',
        'B confirma 201, recarga y no reenvía',
      ],
      screenshots: observed.screenshots,
      privateNativeReport: safe.nativeReportPrivate,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    {
      passed: 1,
      failed: 0,
      reservations: 2,
      conflictRows: 0,
      priorRowsPreserved: true,
      globalReservations: integrity.reservations,
      violations: 0,
      errorContrast: contrast,
      protectedFiles: safe.preservation.productFiles,
      priorEvidenceFiles: safe.preservation.priorEvidenceFiles,
    },
    null,
    2,
  ),
);
