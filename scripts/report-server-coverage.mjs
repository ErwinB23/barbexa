import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { reportCoverage } from './report-coverage.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'coverage/server');
fs.mkdirSync(output, { recursive: true });
const env = {
  ...process.env,
  DENO_DIR: path.join(root, '.artifacts/deno-cache'),
};
const profiles = process.env.DENO_COVERAGE_DIR
  ? path.resolve(root, process.env.DENO_COVERAGE_DIR)
  : path.join(root, '.artifacts/server-coverage');
const args = ['coverage', '--include=.*(domain|application).*', profiles];
const lcov = spawnSync('deno', [...args, '--lcov'], {
  cwd: root,
  env,
  encoding: 'utf8',
});
if (lcov.status !== 0) {
  console.error(lcov.stderr);
  process.exitCode = lcov.status ?? 1;
} else {
  fs.writeFileSync(path.join(output, 'lcov.info'), lcov.stdout);
  reportCoverage(path.join(output, 'lcov.info'), output);
  const gate = spawnSync('deno', [...args, '--threshold=100'], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  process.exitCode = gate.status ?? 1;
}
