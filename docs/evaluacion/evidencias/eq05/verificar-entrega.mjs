// Offline preservation and presentation-boundary check. Does not import the monitor.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';
const out = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(out, '../../../..');
const read = p => JSON.parse(fs.readFileSync(p));
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const preserved = read(path.join(out, 'preservacion-sha256.json'));
for (const [relative, hash] of Object.entries(preserved)) assert.equal(sha(path.join(root, relative)), hash, relative);
const measured = path.join(root, '.artifacts/eq05/8dd877ab-4d18-4213-928d-e9217e39f7da/monitor-source');
for (const name of ['eq05-policy.mjs', 'eq05-manual-policy.mjs']) assert.equal(sha(path.join(measured, name)), sha(path.join(root, 'tests/availability', name)), name);
// Remove only explicitly enumerated console presentation nodes, then compare the
// remaining complete AST. Any changed scheduling, transport, resources or criteria fails.
function withoutDisplay(file) {
  const src = ts.createSourceFile('monitor.mjs', fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const result = ts.transform(src, [context => {
    const visit = node => {
      if (ts.isImportDeclaration(node) && ['./eq05-terminal.mjs', './eq05-manual-policy.mjs'].includes(node.moduleSpecifier.text)) return undefined;
      if (ts.isVariableStatement(node) && node.declarationList.declarations.every(d => ts.isIdentifier(d.name) && ['screen', 'paint', 'displayTimer'].includes(d.name.text))) return undefined;
      if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
        const call = node.expression, text = call.expression.getText(src);
        if (['paint', 'screen.finish', 'displayTimer.unref'].includes(text)) return undefined;
        if (text === 'clearInterval' && call.arguments[0]?.getText(src) === 'displayTimer') return undefined;
        if (text === 'console.log' && call.arguments.length === 1 && ts.isCallExpression(call.arguments[0]) && call.arguments[0].expression.getText(src) === 'progressLine') return undefined;
      }
      return ts.visitEachChild(node, visit, context);
    };
    return tree => ts.visitNode(tree, visit);
  }]);
  const printed = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]);
  result.dispose(); return printed;
}
const original = withoutDisplay(path.join(measured, 'eq05-monitor.mjs'));
const current = withoutDisplay(path.join(root, 'tests/availability/eq05-monitor.mjs'));
assert.equal(current, original, 'Non-presentation monitor logic changed');
const presentation = fs.readFileSync(path.join(root, 'tests/availability/eq05-terminal.mjs'), 'utf8');
assert.equal(/from ['"](?:node:fs|node:http|node:https|.*lab-client|.*eq05-monitor)/.test(presentation), false);
const r = read(path.join(out, 'resultados.json'));
assert.equal(r.records.length, 360); assert.equal(r.httpRequests, 2880);
assert.equal(r.integrity.integrity.reservations, 19471);
for (const name of ['sondeos.csv','operaciones.csv','peticiones.csv','recursos.csv','interrupciones.csv','ventanas.csv']) assert.ok(fs.statSync(path.join(out, name)).size > 0);
assert.equal(fs.readFileSync(path.join(out, 'sondeos.csv'), 'utf8').trim().split('\n').length, 361);
assert.equal(fs.readFileSync(path.join(out, 'peticiones.csv'), 'utf8').trim().split('\n').length, 2881);
for (const name of ['01-estado','02-latencias','03-recursos']) for (const ext of ['png','svg']) assert.ok(fs.statSync(path.join(out, 'graficas', name + '.' + ext)).size > 1000);
assert.ok(fs.statSync(path.join(out, 'graficas/eq05-disponibilidad.pdf')).size > 1000);
const missingLinks = [];
for (const name of ['INFORME.md', 'SITUACION-SPRINT2.md']) {
  const text = fs.readFileSync(path.join(out, name), 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(match[1])) continue;
    if (path.resolve(out, match[1]) === path.join(out, 'verificacion-final.json')) continue; // Generated below after all checks pass.
    if (!fs.existsSync(path.resolve(out, match[1].split('#')[0]))) missingLinks.push({ name, target: match[1] });
  }
}
assert.deepEqual(missingLinks, []);
for (const name of ['INFORME.md','reporte.html','resultados.json','resumen.json','terminal-demo.txt','terminal-demo.svg']) {
  const text = fs.readFileSync(path.join(out, name), 'utf8');
  assert.equal(/eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]+\.|"(?:access_token|refresh_token|password)"\s*:/.test(text), false, 'Sensitive data in ' + name);
}
const normalizedLogicSha256 = createHash('sha256').update(original).digest('hex');
const report = { verifiedAt: new Date().toISOString(), originalFilesPreserved: Object.keys(preserved).length,
  criteriaPolicyAndManualPolicyByteIdentical: true, monitorEvaluationAstIdenticalExcludingDisplay: true,
  normalizedLogicSha256, rows: 360, httpSamples: 2880, originalSqlAuditReused: true,
  csvAndGraphsPresent: true, localReportLinksValid: true, sensitiveContentCheckPassed: true,
  newRealObservationExecuted: false, k6Executed: false, cloudModified: false, commitsOrPush: false };
fs.writeFileSync(path.join(out, 'verificacion-final.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
