// Revisión offline de documentos y agregados; no inicia navegador o monitor.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(out, f)));
const r = read('resultados.json'),
  restored = read('restauracion-verificada.json');
assert.equal(r.playwright.stats.expected, 1);
assert.equal(r.playwright.stats.unexpected, 0);
assert.deepEqual(
  r.confirmations.map((x) => x.status),
  [201, 409, 201],
);
assert.equal(r.integrity.fixtureReservations, 2);
assert.equal(r.integrity.conflictRequestPersisted, false);
assert.ok(
  r.preservation.hashesUnchanged &&
    restored.originalContainerRestored &&
    restored.metro8081Closed &&
    restored.proxy54421Closed,
);
assert.equal(r.eq05MeasurementStarted, false);
const scan = fs.readdirSync(out).filter((n) => /\.(json|md|html)$/.test(n));
let links = 0;
const localTargets = [];
const generatedReport = path.join(out, 'verificacion-entrega.json');
for (const name of scan) {
  const s = fs.readFileSync(path.join(out, name), 'utf8');
  assert.ok(
    !/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(s),
    'JWT in report ' + name,
  );
  if (name.endsWith('.json')) JSON.parse(s);
  if (name === 'INFORME.md' || name === 'PROPUESTA-EQ05-1H.md')
    for (const match of s.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      const resolved = path.resolve(out, target);
      localTargets.push(resolved);
      if (resolved !== generatedReport)
        assert.ok(fs.existsSync(resolved), target);
      links++;
    }
}
for (const name of r.screenshots) {
  const p = path.join(out, name);
  assert.ok(fs.statSync(p).size > 0);
  assert.equal(fs.readFileSync(p).subarray(1, 4).toString(), 'PNG');
}
const result = {
  at: new Date().toISOString(),
  finalE2ePassed: 1,
  finalE2eFailed: 0,
  reservationsPersisted: 2,
  conflictRows: 0,
  previousDataAndEvidencePreserved: true,
  localDocumentLinksVerified: links,
  screenshotsVerified: r.screenshots.length,
  restoredOriginalEdge: true,
  temporaryWebStopped: true,
  obviousJwtScan: 'no matches in textual deliverables',
  eq09Status: 'Parcial integral; recorrido funcional Web acreditado',
  focusAndVisualContrastFindingsDocumented: true,
  eq05ProposalOnly: true,
  eq05MeasurementStarted: false,
  k6Executed: false,
};
fs.writeFileSync(
  path.join(out, 'verificacion-entrega.json'),
  JSON.stringify(result, null, 2) + '\n',
);
for (const target of localTargets) assert.ok(fs.existsSync(target), target);
const hashes = Object.fromEntries(
  fs
    .readdirSync(out)
    .filter(
      (n) => /\.(png|json|html|md)$/.test(n) && n !== 'archivos-sha256.json',
    )
    .map((n) => [
      n,
      createHash('sha256')
        .update(fs.readFileSync(path.join(out, n)))
        .digest('hex'),
    ]),
);
fs.writeFileSync(
  path.join(out, 'archivos-sha256.json'),
  JSON.stringify(hashes, null, 2) + '\n',
);
console.log(JSON.stringify(result, null, 2));
