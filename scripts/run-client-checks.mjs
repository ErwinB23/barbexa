import { integration } from './client-test-files.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isSymbolicLink()) throw Error('TEST_SYMLINK_NOT_ALLOWED');
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.test.mjs') ? [p] : [];
  });
// Explicit non-mutating integration allowlist. Real SQL/HTTP fixture operators require
// a separately authorized environment and are never launched by the general check.

const result = spawnSync(
  process.execPath,
  ['--test', ...walk('tests/presentation'), ...integration],
  { stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
