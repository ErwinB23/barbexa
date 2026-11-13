import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { cases } from './server-fixtures/cases.mjs';

const root = process.cwd();
const fixtures = mkdtempSync(
  path.join(tmpdir(), 'barberia-server-architecture-'),
);
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
          allowImportingTsExtensions: true,
          noEmit: true,
          paths: { '@/*': ['./supabase/functions/*'] },
        },
        include: ['supabase/functions/**/*'],
        exclude: scenario.exclude ?? [],
      }),
    );
    for (const [name, source] of Object.entries(scenario.files)) {
      const f = path.join(dir, name);
      mkdirSync(path.dirname(f), { recursive: true });
      writeFileSync(f, source);
    }
    const r = spawnSync(
      process.execPath,
      [
        path.join(root, 'scripts/check-server-architecture.mjs'),
        '--project',
        path.join(dir, 'tsconfig.json'),
      ],
      { encoding: 'utf8', timeout: 20000 },
    );
    console.log(`${scenario.name}: exit=${r.status}\n${r.stdout}${r.stderr}`);
    assert.ifError(r.error);
    assert.equal(r.status, scenario.rule ? 1 : 0);
    if (scenario.rule)
      assert.ok(r.stderr.includes(`[${scenario.rule}]`), r.stderr);
    else assert.match(r.stdout, /core=[1-9]/);
  });
}
