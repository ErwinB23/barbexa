import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { cases } from './fixtures/cases.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const fixtures = mkdtempSync(path.join(tmpdir(), 'barberia-architecture-'));
console.log(`Fixtures temporales conservados: ${fixtures}`);
for (const scenario of cases) {
  test(scenario.name, () => {
    const dir = path.join(fixtures, scenario.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'Preserve',
          moduleResolution: 'Bundler',
          strict: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src/**/*'],
        exclude: scenario.exclude ?? [],
      }),
    );
    for (const [name, source] of Object.entries(scenario.files)) {
      const file = path.join(dir, name);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, source);
    }
    const result = spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/check-architecture.mjs'),
        '--project',
        path.join(dir, 'tsconfig.json'),
      ],
      { encoding: 'utf8', cwd: root },
    );
    console.log(
      `${scenario.name}: exit=${result.status}\n${result.stdout}${result.stderr}`,
    );
    assert.equal(result.error, undefined);
    assert.equal(result.status, scenario.rule ? 1 : 0);
    if (scenario.rule)
      assert.ok(result.stderr.includes(`[${scenario.rule}]`), result.stderr);
    else assert.match(result.stdout, /core=[1-9]/);
  });
}
