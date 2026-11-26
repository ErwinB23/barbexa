// Verificación offline de los artefactos documentales; no ejecuta pruebas de carga.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../../../..');
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const data = load('auditoria.json'),
  v = load('verificacion.json');
assert.equal(v.approved, 3);
assert.equal(v.notApproved, 2);
assert.equal(v.approvedThresholdsPassed, 36);
assert.equal(v.historicalReadingFilesVerified, 131);
assert.equal(v.protectedHashesUnchanged, true);
assert.equal(data.totals.approvedHttp, 88472);
assert.equal(data.totals.approvedAccepted, 17630);
assert.equal(data.totals.approvedPersisted, 17630);
assert.equal(data.confirmationLatency.measuredPercentiles, null);
assert.equal(v.k6Executed, false);
let localLinks = 0;
for (const name of ['INFORME.md', 'RESULTADOS.md']) {
  const file = path.join(dir, name),
    s = fs.readFileSync(file, 'utf8');
  for (const match of s.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    assert.ok(
      fs.existsSync(
        path.resolve(path.dirname(file), decodeURIComponent(target)),
      ),
      name + ': ' + target,
    );
    localLinks++;
  }
}
for (const name of [
  'niveles.csv',
  'operaciones.csv',
  'intentos.csv',
  'umbrales.csv',
  'recursos-serie.csv',
  'recursos-resumen.csv',
]) {
  assert.ok(fs.statSync(path.join(dir, name)).size > 0);
}
const files = fs
  .readdirSync(dir, { recursive: true })
  .filter((n) => fs.statSync(path.join(dir, n)).isFile());
for (const file of files.filter((n) => /\.(?:json|csv|md|svg)$/.test(n))) {
  const s = fs.readFileSync(path.join(dir, file), 'utf8');
  assert.ok(
    !/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(s),
    'JWT in report',
  );
  if (file.endsWith('.json')) JSON.parse(s);
}
for (const file of [
  'ESTADO-DESARROLLO.md',
  'docs/CODEX-HANDOFF.md',
  'docs/evaluacion/evidencias/004-reservas/k6-final/REQUISITOS-CALIDAD.md',
]) {
  assert.ok(fs.readFileSync(path.join(root, file), 'utf8').includes('17.630'));
}
const result = {
  at: new Date().toISOString(),
  offline: true,
  localDocumentLinksVerified: localLinks,
  generatedJsonParsed: true,
  csvFilesVerified: 6,
  pdfPagesExpected: 4,
  chartsExpected: 4,
  originalReadingFilesUnchanged: 131,
  protectedFilesUnchanged: v.protectedFiles,
  mixedApprovedHttp: 88472,
  approvedAcceptedAndPersisted: 17630,
  missingConfirmationPercentilesKeptNull: true,
  obviousJwtScan: 'no matches in generated textual evidence',
  k6Executed: false,
};
fs.writeFileSync(
  path.join(dir, 'verificacion-entrega.json'),
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify(result, null, 2));
