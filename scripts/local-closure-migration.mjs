// Pure preparation only. The official Supabase CLI owns migration execution/history.
import assert from 'node:assert/strict';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const closureMigration = Object.freeze({
  file: '20261121040559_administrative_closure_withdrawal.sql',
  version: '20261121040559',
  sha256: '4f4eb23290595ccef8e13a9b65a9a756ee8e21f63bd83f25c0e26edf8c044335',
});

export function prepareClosureMigration({ url, root, files, history, source }) {
  const target = new URL(url);
  assert.ok(
    target.protocol === 'postgresql:' &&
      target.hostname === '127.0.0.1' &&
      target.port === '54422' &&
      target.pathname === '/postgres' &&
      target.username === 'postgres' &&
      target.password &&
      !target.search &&
      !target.hash,
    'EXPLICIT_LOCAL_TARGET_REQUIRED',
  );
  assert.ok(path.isAbsolute(root), 'ABSOLUTE_WORKSPACE_REQUIRED');
  assert.equal(
    createHash('sha256').update(source).digest('hex'),
    closureMigration.sha256,
    'APPROVED_MIGRATION_CHANGED',
  );
  assert.equal(history.length, 17, 'HISTORY_CHANGED');
  const versions = history.map((h) => h.version);
  assert.equal(new Set(versions).size, 17, 'DUPLICATE_HISTORY');
  assert.ok(
    versions.every((v) => /^\d{14}$/.test(v)),
    'INVALID_HISTORY',
  );
  assert.equal(files.length, 18, 'UNEXPECTED_MIGRATION_FILES');
  assert.equal(new Set(files).size, 18, 'DUPLICATE_MIGRATION_FILES');
  assert.ok(
    files.every((f) => /^\d{14}_[a-z0-9_]+\.sql$/.test(f)),
    'INVALID_MIGRATION_FILE',
  );
  for (const v of versions)
    assert.equal(files.filter((f) => f.startsWith(v + '_')).length, 1);
  const pending = files.filter((f) => !versions.includes(f.slice(0, 14)));
  assert.deepEqual(
    pending,
    [closureMigration.file],
    'ONLY_ONE_APPROVED_PENDING',
  );
  assert.ok(
    versions.every((v) => v < closureMigration.version),
    'HISTORY_ORDER_CHANGED',
  );
  // In CLI v3 --remote=<URL> is also the explicit-URL form. The assertion above
  // restricts it to the audited loopback pair; no linked project is selected.
  const args = [
    'db',
    'push',
    '--remote=' + url,
    '--workdir',
    root,
    '--skip-vault',
    '--output-format',
    'json',
  ];
  return {
    migration: closureMigration.file,
    pending,
    source: Buffer.from(source),
    readArgs: [...args, '--dry-run'],
    writeArgs: [...args, '--yes'],
  };
}

export function migrationEnvironment(input = process.env) {
  const env = { ...input };
  for (const name of Object.keys(env))
    if (/^(SUPABASE_|PG|DATABASE_URL$|DB_URL$)/i.test(name)) delete env[name];
  env.PGAPPNAME = 'barbexa_b5_closure_migration_cli';
  return env;
}

export function claimAttempt(manifest) {
  assert.equal(manifest.phase, 'ready', 'ATTEMPT_NOT_READY');
  assert.equal(manifest.attempts, 0, 'NO_AUTOMATIC_REPLAY');
  manifest.attempts = 1;
  manifest.phase = 'issued-needs-readback';
}

export function confirmCommitted(manifest, proof) {
  assert.equal(manifest.phase, 'issued-needs-readback');
  assert.equal(manifest.attempts, 1);
  assert.equal(proof.cliExit, 0, 'CLI_FAILED_STOP');
  assert.equal(proof.historyVersions.length, 18, 'HISTORY_NOT_CONFIRMED');
  assert.equal(new Set(proof.historyVersions).size, 18);
  assert.ok(proof.historyVersions.includes(closureMigration.version));
  assert.equal(proof.newRpc, 2, 'RPC_NOT_CONFIRMED');
  assert.equal(proof.protectedRowsIntact, true, 'INTEGRITY_NOT_CONFIRMED');
  manifest.phase = 'committed-verified';
}
