// Revisión offline de los entregables EQ-08; no repite checkers ni pruebas.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../../..');
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const sha = (p) =>
  createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const r = read(path.join(out, 'resultados.json'));
const inventory = read(path.join(out, 'importaciones.json'));
assert.equal(r.architecture.listedCoreFiles, 88);
assert.equal(inventory.coreFiles.length, 88);
assert.equal(inventory.dependencies.length, 199);
assert.ok(inventory.dependencies.every((x) => x.allowed));
assert.equal(r.targetedTests.client.passed, 1);
assert.equal(r.targetedTests.server.passed, 1);
assert.equal(r.targetedTests.client.networkAttempts, 0);
assert.equal(r.fullRegressionReuse.newCoverageRun, false);
assert.equal(r.fullRegressionReuse.coreFilesMatchHistoricalCommit, true);
for (const command of r.commands) assert.equal(command.exit, 0);
const protectedFiles = read(path.join(out, 'preservacion-sha256.json'));
for (const [p, h] of Object.entries(protectedFiles.sha256))
  assert.equal(sha(path.join(root, p)), h, 'Preserved file changed: ' + p);
const previous = read(
  path.resolve(out, '../004-reservas/k6-mixta-final/preservacion-sha256.json'),
);
for (const [p, h] of Object.entries(previous))
  assert.equal(sha(path.join(root, p)), h, 'Previous evidence changed: ' + p);
const cases = [
  {
    side: 'client',
    entry: 'src/features/reservations/application/request-reservation.ts',
    port: 'ReservaRemotaGateway',
    test: 'tests/unit/reservations/confirmation.test.ts',
  },
  {
    side: 'server',
    entry:
      'supabase/functions/_shared/reservations/application/confirm-reservation.ts',
    port: 'ReservaAtomicaGateway',
    test: 'tests/server/reservations/confirmation.test.ts',
  },
].map((c) => {
  const done = new Set();
  const walk = (p) => {
    if (done.has(p)) return;
    done.add(p);
    for (const i of inventory.dependencies.filter((i) => i.file === p))
      walk(i.resolved);
  };
  walk(c.entry);
  assert.equal(done.size, 5);
  assert.ok([...done].every((p) => /\/(domain|application)\//.test(p)));
  return { ...c, coreDependencyClosure: [...done], externalModules: 0 };
});
fs.writeFileSync(
  path.join(out, 'trazabilidad.json'),
  JSON.stringify({ cases }, null, 2) + '\n',
);
const git = spawnSync(
  'git',
  [
    'diff',
    r.fullRegressionReuse.testedCommit,
    '--name-only',
    '--',
    'tests/unit',
    'tests/server',
    'tests/presentation',
    'tests/architecture',
    'scripts/check-architecture.mjs',
    'scripts/check-server-architecture.mjs',
  ],
  { cwd: root, encoding: 'utf8' },
);
assert.equal(git.status, 0);
assert.equal(git.stdout.trim(), '');
fs.writeFileSync(
  path.join(out, 'regresion-version.log'),
  'git diff <testedCommit> --name-only -- tests/unit tests/server tests/presentation tests/architecture scripts/check-architecture.mjs scripts/check-server-architecture.mjs\nExit 0; no differences.\n',
);
let links = 0;
const generatedReport = path.join(out, 'verificacion-entrega.json');
const localTargets = [];
for (const file of ['INFORME.md']) {
  const text = fs.readFileSync(path.join(out, file), 'utf8');
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const p = m[1].split('#')[0];
    if (!p || /^[a-z]+:/i.test(p)) continue;
    const target = path.resolve(out, decodeURIComponent(p));
    localTargets.push(target);
    if (target !== generatedReport) assert.ok(fs.existsSync(target), p);
    links++;
  }
}
for (const file of fs
  .readdirSync(out)
  .filter((n) => /\.(json|csv|md|log)$/.test(n))) {
  const s = fs.readFileSync(path.join(out, file), 'utf8');
  assert.ok(
    !/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(s),
    'JWT in evidence',
  );
  if (file.endsWith('.json')) JSON.parse(s);
}
const result = {
  at: new Date().toISOString(),
  coreFiles: 88,
  listedImports: 199,
  forbiddenImports: 0,
  clientAndServerSubstitutionCasesPassed: 2,
  coreClosureFilesEach: 5,
  preservedProductAndTestFiles: protectedFiles.files,
  priorMixedReadingAndProductHashesUnchanged: Object.keys(previous).length,
  historicalRegressionSourcesUnchanged: true,
  coverageReusedWithoutRerun: true,
  localLinksVerified: links,
  eq08Status: 'Parcial integral; núcleo construido acreditado',
  mapsImagesSubstitution: 'Pending; not implemented',
  playwrightExecuted: false,
  k6Executed: false,
  cloudAccessed: false,
  commitsOrPush: false,
};
fs.writeFileSync(
  path.join(out, 'verificacion-entrega.json'),
  JSON.stringify(result, null, 2) + '\n',
);
for (const target of localTargets) assert.ok(fs.existsSync(target), target);
console.log(JSON.stringify(result, null, 2));
