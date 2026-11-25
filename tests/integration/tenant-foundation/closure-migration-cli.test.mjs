import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';
const name = '20261121040559_administrative_closure_withdrawal.sql';
const source = fs.readFileSync('supabase/migrations/' + name);
const history = fs
  .readdirSync('supabase/migrations')
  .filter((n) => n !== name && n.endsWith('.sql'))
  .map((n) => ({ version: n.slice(0, 14), name: n.slice(15, -4) }));
const base = {
  url: 'postgresql://postgres:fixture-only@127.0.0.1:54422/postgres',
  root: path.resolve('.'),
  files: fs
    .readdirSync('supabase/migrations')
    .filter((n) => n.endsWith('.sql')),
  history,
  source,
};
const load = () => import('../../../scripts/local-closure-migration.mjs');
test(
  'legacy verifier cannot interpolate migration-history SQL or execute psql apply',
  {
    // This retired local operator is intentionally ignored by Git.
    skip: !fs.existsSync('.artifacts/b523-activate.mjs'),
  },
  () => {
    const old = fs.readFileSync('.artifacts/b523-activate.mjs', 'utf8');
    const branch = old
      .split("else if(phase==='apply'){")[1]
      .split("}else if(phase==='postcheck')")[0];
    assert.doesNotMatch(branch, /schema_migrations|source\.replace|psql/);
  },
);
test('regression: dollar-apostrophe, dollar ampersand, dollar backtick and dollar dollars never enter SQL replacement', async () => {
  const { prepareClosureMigration } = await load();
  const sample = "regex $' $& $` $$";
  assert.notEqual('COMMIT'.replace('COMMIT', sample), sample);
  const p = prepareClosureMigration(base);
  assert.ok(p.source.equals(source));
  assert.equal(p.migration, name);
  assert.equal(p.pending.length, 1);
  assert.ok(source.includes(Buffer.from("$'")));
  assert.equal(p.readArgs[0], 'db');
  assert.deepEqual(p.readArgs.slice(0, 2), ['db', 'push']);
  assert.ok(p.readArgs.includes('--dry-run'));
  assert.ok(p.readArgs.includes('--skip-vault'));
  assert.ok(p.writeArgs.includes('--skip-vault'));
  assert.ok(!p.writeArgs.includes('--dry-run'));
  assert.ok(p.writeArgs.includes('--yes'));
  assert.ok(
    !p.writeArgs.some((a) =>
      /repair|include-all|include-seed|include-roles|psql/.test(a),
    ),
  );
});
test('only the explicit LOCAL pair and exact approved bytes/history/files can pass preflight', async () => {
  const { prepareClosureMigration } = await load();
  for (const url of [
    'postgresql://postgres:x@cloud.invalid:54422/postgres',
    'postgresql://postgres:x@127.0.0.1:54322/postgres',
    'postgresql://postgres:x@127.0.0.1:54422/other',
    'postgresql://postgres:x@localhost:54422/postgres',
  ])
    assert.throws(() => prepareClosureMigration({ ...base, url }));
  for (const change of [
    { source: Buffer.concat([source, Buffer.from(' ')]) },
    { files: [...base.files, '20261122000000_extra.sql'] },
    { history: history.slice(1) },
    { history: [...history, { version: name.slice(0, 14) }] },
  ])
    assert.throws(() => prepareClosureMigration({ ...base, ...change }));
});
test('single-attempt state never reports success from CLI exit alone and blocks uncertain replay', async () => {
  const { claimAttempt, confirmCommitted } = await load();
  const m = { phase: 'ready', attempts: 0 };
  claimAttempt(m);
  assert.equal(m.attempts, 1);
  assert.equal(m.phase, 'issued-needs-readback');
  assert.throws(() => claimAttempt(m));
  assert.throws(() =>
    confirmCommitted(m, {
      cliExit: 1,
      historyVersions: [...history.map((h) => h.version), name.slice(0, 14)],
      newRpc: 2,
      protectedRowsIntact: true,
    }),
  );
  assert.throws(() =>
    confirmCommitted(m, {
      cliExit: 0,
      historyVersions: history.map((h) => h.version),
      newRpc: 0,
      protectedRowsIntact: true,
    }),
  );
  assert.equal(m.phase, 'issued-needs-readback');
  confirmCommitted(m, {
    cliExit: 0,
    historyVersions: [...history.map((h) => h.version), name.slice(0, 14)],
    newRpc: 2,
    protectedRowsIntact: true,
  });
  assert.equal(m.phase, 'committed-verified');
});
test('migration operator environment strips implicit Cloud and PostgreSQL targets', async () => {
  const { migrationEnvironment } = await load();
  const env = migrationEnvironment({
    PATH: 'retained',
    SUPABASE_ACCESS_TOKEN: 'secret',
    SUPABASE_DB_URL: 'cloud',
    PGHOST: 'cloud',
    DATABASE_URL: 'cloud',
    DB_URL: 'cloud',
  });
  assert.equal(env.PATH, 'retained');
  for (const k of [
    'SUPABASE_ACCESS_TOKEN',
    'SUPABASE_DB_URL',
    'PGHOST',
    'DATABASE_URL',
    'DB_URL',
  ])
    assert.equal(env[k], undefined);
});
