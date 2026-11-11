// Fixtures de herramientas, no pruebas del dominio ni del checker de T010.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const runner = path.join(root, 'scripts/run-unit-tests.mjs');
assert.ok(fs.existsSync(runner), 'Falta runner T009');
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'barberia-tools-'));
console.log(`Fixtures aislados: ${sandbox}`);
function fixture(name, core, test) {
  const dir = path.join(sandbox, name);
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  fs.copyFileSync(runner, path.join(dir, 'scripts/run-unit-tests.mjs'));
  for (const config of ['tsconfig.tests.json', 'tsconfig.core.json']) {
    fs.copyFileSync(path.join(root, config), path.join(dir, config));
  }
  fs.writeFileSync(path.join(dir, 'package.json'), '{"private":true}');
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(dir, 'node_modules'), 'junction');
  for (const [relative, source] of Object.entries({
    ...(core === null ? {} : { 'src/features/probe/domain/value.ts': core }),
    ...(test === null ? {} : { 'tests/unit/value.test.ts': test }),
  })) {
    const target = path.join(dir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, source);
  }
  return dir;
}
const core = 'export function value(n: number) { return n + 1; }';
const test = `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { value } from '../../src/features/probe/domain/value.js';
test('valor', () => assert.equal(value(1), 2));`;
for (const [name, source, suite, expected] of [
  ['sin-pruebas', core, null, 1],
  ['exito', core, test, 0],
  ['asercion-fallida', core, test.replace('value(1), 2', 'value(1), 9'), 1],
  ['error-typescript', core, test + '\nconst invalid: number = "x";', 1],
  ['sin-cobertura', core + '\nexport function unused() { return 99; }', test, 1],
  ['rama-sin-cubrir', 'export function value(n: number) { if (n > 0) return n + 1; return 0; }', test, 1],
  ['archivo-no-importado', core, test, 1],
  ['sin-nucleo', null, "import { test } from 'node:test'; test('vacio', () => {});", 1],
]) {
  const dir = fixture(name, source, suite);
  if (name === 'archivo-no-importado') {
    fs.writeFileSync(path.join(dir, 'src/features/probe/domain/unimported.ts'),
      'export function neverCalled() { return 42; }');
  }
  const result = spawnSync(process.execPath, [path.join(dir, 'scripts/run-unit-tests.mjs')], {
    encoding: 'utf8', cwd: dir,
  });
  console.log(`CASO ${name}: exit ${result.status}\n${result.stdout}${result.stderr}`);
  assert.equal(result.status, expected, name);
  assert.ok(!fs.existsSync(path.join(dir, '.test-build')), 'Salida temporal no retirada');
}
// Prueba de límites globales de T007. No sustituye el checker de T010-T011.
const dir = fixture('globals-core', core + '\nfetch("url"); process.cwd(); document.title;', null);
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'),
  '-p', path.join(dir, 'tsconfig.core.json'), '--pretty', 'false'], { encoding: 'utf8' });
console.log(`CORE negativo: exit ${result.status}\n${result.stdout}${result.stderr}`);
assert.notEqual(result.status, 0);
for (const name of ['fetch', 'process', 'document']) assert.ok(result.stdout.includes(name));
console.log('Herramientas: 9 escenarios comprobados. Sin pruebas de negocio ejecutadas.');
