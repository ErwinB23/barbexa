import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { playwrightRuntime } from './runtime.mjs';
import { root } from '../../../k6/lib/lab-client.mjs';
import { ownedLab } from '../../../k6/lib/lab-client.mjs';
import { sqlId as q } from '../../../k6/lib/fixture-values.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const pointer = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(pointer.manifest));
if (m.approvedAttempt || fs.existsSync(path.join(m.dir, 'e2e-observed.json')))
  throw Error('APPROVED_EQ09_ALREADY_RECORDED_DO_NOT_REPEAT');
const envLab = ownedLab({ recordBaseline: false });
if (
  Number(
    envLab.sql(
      `select count(*) from public.reservations where barbershop_id=${q(m.shop)};`,
    ),
  ) !== 0
)
  throw Error('EQ09_EXISTING_WRITES_REQUIRE_REVIEW_BEFORE_RETRY');
const attempt = path.join(m.dir, 'attempts', randomUUID());
fs.mkdirSync(attempt, { recursive: true });
m.lastAttempt = attempt;
fs.writeFileSync(pointer.manifest, JSON.stringify(m, null, 2) + '\n');
const { cli } = playwrightRuntime();
const env = { ...process.env, BARBEXA_EQ09_ATTEMPT: attempt };
delete env.SSLKEYLOGFILE;
const r = spawnSync(
  process.execPath,
  [cli, 'test', '--config', 'tests/e2e/eq09/playwright.config.mjs'],
  { cwd: root, env, encoding: 'utf8', maxBuffer: 8 * 1024 ** 2 },
);
fs.writeFileSync(
  path.join(attempt, 'playwright-console.log'),
  (r.stdout || '') + (r.stderr || ''),
);
console.log((r.stdout || '') + (r.stderr || ''));
if (r.status === 0 && fs.existsSync(path.join(attempt, 'e2e-observed.json'))) {
  m.approvedAttempt = attempt;
  fs.writeFileSync(pointer.manifest, JSON.stringify(m, null, 2) + '\n');
}
process.exitCode = r.status ?? 1;
