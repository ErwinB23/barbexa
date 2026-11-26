// Read-only final verification; no k6 process or product mutation.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ownedLab, root, lab } from './lib/lab-client.mjs';
import { validateComplementary, levels } from './lib/complementary.mjs';
const read = (f) => JSON.parse(fs.readFileSync(f));
const hash = (f) =>
  createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const dir = path.join(
  root,
  'docs/evaluacion/evidencias/004-reservas/sprint2-closure',
);
const m = read(path.join(lab, 'quality-closure/manifest.json'));
const result = read(path.join(dir, 'results.json'));
const previous = read(
  path.join(
    root,
    'docs/evaluacion/evidencias/004-reservas/k6-final/preservacion-sha256.json',
  ),
);
const env = ownedLab();
const existingRowsPreserved = Object.entries(m.baseline).every(
  ([table, rows]) => {
    if (!/^(public|private)\.[a-z_]+$/.test(table))
      throw Error('INVALID_BASELINE_TABLE');
    const after = JSON.parse(
      env.sql(
        `select coalesce(json_agg(md5(to_jsonb(r)::text)),'[]') from ${table} r;`,
      ),
    );
    return rows.every(
      (h) =>
        after.filter((x) => x === h).length >=
        rows.filter((x) => x === h).length,
    );
  },
);
const protectedFilesUnchanged = Object.entries(m.files).every(
  ([f, h]) => hash(path.join(root, f)) === h,
);
const rawEvidenceUnchanged = Object.entries(previous.sha256).every(
  ([f, h]) => hash(path.join(root, f)) === h,
);
const active = read(path.join(lab, 'complementary-active.json'));
const series = read(
  path.join(lab, 'complementary', active.id, 'manifest.json'),
);
validateComplementary(
  read(path.join(lab, 'complementary', active.id, 'fixtures-25.json')),
  25,
);
const profiles = levels.map((level) => {
  const p = read(
    path.join(root, `.artifacts/k6/inspect-complementary-${level}.json`),
  );
  const options = p.options ?? p;
  const stages = options.scenarios.workload.stages;
  if (stages[2].duration !== '10m0s' || stages[2].target !== level)
    throw Error('STEADY_PROFILE_CHANGED');
  return {
    level,
    inspectedWithoutExecution: true,
    stages,
    thresholds: options.thresholds,
  };
});
const files = [
  'k6/quality-closure.mjs',
  'k6/complementary-cli.mjs',
  'k6/lib/complementary.mjs',
  'k6/complementary.test.mjs',
  'k6/run-lab.mjs',
  'k6/scripts/booking-api.js',
  'tests/integration/booking/care-race.mjs',
];
const docFiles = [
  path.join(dir, 'CIERRE-SPRINT2.md'),
  path.join(root, 'k6/MANUAL-POWERSHELL.md'),
  path.join(
    root,
    'docs/evaluacion/evidencias/004-reservas/k6-final/REQUISITOS-CALIDAD.md',
  ),
];
const linkErrors = [];
for (const f of docFiles)
  for (const match of fs.readFileSync(f, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1];
    if (/^(https?:|#)/.test(link)) continue;
    const target = path.resolve(path.dirname(f), link.split('#')[0]);
    if (!fs.existsSync(target) && path.basename(target) !== 'verification.json')
      linkErrors.push({ document: path.relative(root, f), link });
  }
const log = fs.readFileSync(path.join(dir, 'static-tests.log'), 'utf8');
const tests = Number(/tests (\d+)/.exec(log)?.[1]);
const integrity = JSON.parse(
  env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
);
const v = {
  at: new Date().toISOString(),
  existingRowsPreserved,
  protectedFilesUnchanged,
  protectedFiles: Object.keys(m.files).length,
  rawEvidenceUnchanged,
  rawEvidenceFiles: Object.keys(previous.sha256).length,
  localCases: result.checks.length,
  localCasesPassed: result.complete && result.checks.every((c) => c.passed),
  harnessTests: tests,
  harnessTestsPassed: /fail 0/.test(log),
  profiles,
  series: active.id,
  measuredComplementaryLevels: Object.keys(series.levels),
  operatorLockPresent: fs.existsSync(
    path.join(lab, 'complementary', active.id, 'operator.lock'),
  ),
  integrity,
  health: (await env.request('/auth/v1/health', { method: 'GET' })).status,
  localLinkErrors: linkErrors,
  sourceSha256: Object.fromEntries(
    files.map((f) => [f, hash(path.join(root, f))]),
  ),
};
v.passed =
  v.existingRowsPreserved &&
  v.protectedFilesUnchanged &&
  v.rawEvidenceUnchanged &&
  v.localCasesPassed &&
  v.harnessTestsPassed &&
  tests === 31 &&
  !v.measuredComplementaryLevels.length &&
  !v.operatorLockPresent &&
  v.health === 200 &&
  !linkErrors.length &&
  Object.entries(integrity).every(([k, n]) => k === 'reservations' || n === 0);
fs.writeFileSync(
  path.join(dir, 'verification.json'),
  JSON.stringify(v, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    {
      ...v,
      profiles: profiles.map(({ level, inspectedWithoutExecution }) => ({
        level,
        inspectedWithoutExecution,
      })),
      sourceSha256: 'recorded',
    },
    null,
    2,
  ),
);
if (!v.passed) process.exitCode = 1;
