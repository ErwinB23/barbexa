// Scoped activation for service categories. Never prints rows, tokens or backup contents.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const mode = process.argv[2];
const ref = 'vuoncrtkkkquvddunrxx';
const version = '20261125010000';
const migration = version + '_service_catalog_categories.sql';
const source = 'supabase/migrations/' + migration;
const pointer = '.artifacts/service-catalog-cloud.json';
const root = path.join(process.env.LOCALAPPDATA, 'Barbexa', 'backups');
const dir =
  mode === 'prepare'
    ? path.join(root, 'service-catalog-' + Date.now())
    : JSON.parse(fs.readFileSync(pointer)).dir;
assert.ok(path.resolve(dir).startsWith(root + path.sep));
const bin = path.resolve(
  'node_modules/@supabase/cli-windows-x64/bin/supabase.exe',
);
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex');
const save = (file, data) =>
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2), {
    flag: 'wx',
  });
function cli(args) {
  const result = spawnSync(bin, args, {
    env: { ...process.env, NODE_USE_SYSTEM_CA: '1' },
    encoding: 'utf8',
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 60 * 1024 * 1024,
  });
  if (result.status !== 0) {
    fs.writeFileSync(
      path.join(dir, 'error-' + Date.now() + '.json'),
      JSON.stringify({
        command: args.slice(0, 2),
        stdout: result.stdout,
        stderr: result.stderr,
      }),
    );
    throw Error('CLI_FAILED_' + args.slice(0, 2).join('_'));
  }
  return result.stdout;
}
const json = (args) => JSON.parse(cli([...args, '--output-format', 'json']));
const rows = (value) =>
  Array.isArray(value)
    ? value
    : (value.rows ?? value.data?.rows ?? value.result?.rows);
const read = (query) =>
  rows(json(['db', 'query', '--read-only', '--remote=' + ref, query]));
const functions = () => {
  const value = json(['functions', 'list', '--remote=' + ref]);
  return value.functions ?? value;
};
const history = () =>
  read(
    'select version,name from supabase_migrations.schema_migrations order by version',
  );
const policies = () =>
  read(
    "select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in('public','private') order by 1,2,3",
  );
function protectedRows() {
  const tables = read(
    "select n.nspname schema,c.relname name from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and (n.nspname in('public','private') or(n.nspname='auth' and c.relname in('users','identities'))) order by 1,2",
  );
  const quote = (v) => '"' + v.replaceAll('"', '""') + '"';
  return read(
    tables
      .map((t) => {
        const data =
          t.schema === 'public' && t.name === 'services'
            ? "to_jsonb(r)-array['category','archived']"
            : 'to_jsonb(r)';
        return `select '${t.schema}.${t.name}' name,count(*)::int count,md5(coalesce(string_agg(md5((${data})::text),'' order by md5((${data})::text)),'')) hash from ${quote(t.schema)}.${quote(t.name)} r`;
      })
      .join(' union all '),
  );
}
const changed = [
  '_shared/barbershop-operation/application/operation.ts',
  '_shared/barbershop-operation/domain/types.ts',
  '_shared/barbershop-operation/infrastructure/postgres-operation-adapter.ts',
];
assert.equal(fs.readFileSync('supabase/.temp/project-ref', 'utf8').trim(), ref);
if (mode === 'prepare') {
  assert.ok(!fs.existsSync(pointer), 'PREPARATION_ALREADY_EXISTS');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(pointer, JSON.stringify({ dir, ref }));
  const baseline = history();
  assert.ok(!baseline.some((r) => r.version === version));
  const local = fs
    .readdirSync('supabase/migrations')
    .filter((f) => f.endsWith('.sql') && f !== migration)
    .map((f) => f.slice(0, 14))
    .sort();
  assert.deepEqual(
    baseline.map((r) => r.version),
    local,
    'UNEXPECTED_PENDING_MIGRATIONS',
  );
  save('history-before.json', baseline);
  save('protected-before.json', protectedRows());
  save('policies-before.json', policies());
  save('functions-before.json', functions());
  // Capture restricted function definitions in an explicitly read-only owner transaction.
  const definition = rows(
    json([
      'db',
      'query',
      '--remote=' + ref,
      '--yes',
      "begin read only; select pg_get_functiondef('public.upsert_booking_service(uuid,jsonb)'::regprocedure) definition; commit;",
    ]),
  );
  save('rpc-before.json', definition);
  const envPath = path.join(
    process.env.LOCALAPPDATA,
    'Programs/DockerDesktop/resources/bin',
  );
  process.env.PATH = envPath + path.delimiter + process.env.PATH;
  for (const [name, flags] of [
    ['schema.sql', []],
    ['data.sql', ['--data-only', '--use-copy']],
    ['roles.sql', ['--role-only']],
    [
      'migration-history.sql',
      ['--schema', 'supabase_migrations', '--data-only', '--use-copy'],
    ],
  ]) {
    cli([
      'db',
      'dump',
      '--remote=' + ref,
      ...flags,
      '--file',
      path.join(dir, name),
    ]);
    assert.ok(fs.statSync(path.join(dir, name)).size > 0);
  }
  const beforeWork = path.join(dir, 'edge-before');
  fs.mkdirSync(path.join(beforeWork, 'supabase'), { recursive: true });
  fs.writeFileSync(
    path.join(beforeWork, 'supabase/config.toml'),
    'project_id = "service-catalog-backup"\n',
  );
  cli([
    'functions',
    'download',
    'barbershop-operation',
    '--remote=' + ref,
    '--workdir',
    beforeWork,
    '--use-api',
    '--yes',
  ]);
  stage();
} else if (mode === 'stage') {
  stage();
} else {
  activate();
}
function stage() {
  assert.ok(!fs.existsSync(path.join(dir, 'prepared.json')), 'ALREADY_STAGED');
  assert.deepEqual(
    functions(),
    JSON.parse(fs.readFileSync(path.join(dir, 'functions-before.json'))),
    'EDGE_DRIFT',
  );
  const beforeWork = path.join(dir, 'edge-before');
  const work = path.join(dir, 'edge-staged');
  fs.cpSync(beforeWork, work, { recursive: true });
  fs.writeFileSync(
    path.join(work, 'supabase/config.toml'),
    'project_id = "service-catalog-staged"\n[functions.barbershop-operation]\nverify_jwt = true\n',
  );
  const files = changed.map((file) => {
    const previous = path.join(beforeWork, 'supabase/functions', file);
    assert.ok(
      fs.existsSync(previous) ||
        file === '_shared/barbershop-operation/domain/types.ts',
      'REMOTE_FILE_MISSING',
    );
    const current = 'supabase/functions/' + file;
    fs.copyFileSync(current, path.join(work, 'supabase/functions', file));
    return {
      file,
      before: fs.existsSync(previous) ? hash(fs.readFileSync(previous)) : null,
      staged: hash(fs.readFileSync(current)),
    };
  });
  const backups = [
    'schema.sql',
    'data.sql',
    'roles.sql',
    'migration-history.sql',
  ].map((file) => ({
    file,
    hash: hash(fs.readFileSync(path.join(dir, file))),
  }));
  assert.deepEqual(
    protectedRows(),
    JSON.parse(fs.readFileSync(path.join(dir, 'protected-before.json'))),
    'DATA_CHANGED_DURING_BACKUP',
  );
  save('prepared.json', {
    ref,
    work,
    files,
    backups,
    migrationHash: hash(fs.readFileSync(source)),
    at: new Date().toISOString(),
  });
  console.log(
    JSON.stringify({
      prepared: true,
      backupDirectory: dir,
      edgeFiles: changed,
      existingDataPreserved: true,
    }),
  );
}
function activate() {
  const prepared = JSON.parse(fs.readFileSync(path.join(dir, 'prepared.json')));
  assert.equal(prepared.ref, ref);
  assert.equal(hash(fs.readFileSync(source)), prepared.migrationHash);
  for (const backup of prepared.backups)
    assert.equal(
      hash(fs.readFileSync(path.join(dir, backup.file))),
      backup.hash,
    );
  if (mode === 'apply') {
    assert.ok(
      !fs.existsSync(path.join(dir, 'apply-attempt.json')),
      'INSPECT_BEFORE_RETRY',
    );
    assert.ok(Date.now() - Date.parse(prepared.at) < 3600000, 'BACKUP_EXPIRED');
    assert.deepEqual(
      protectedRows(),
      JSON.parse(fs.readFileSync(path.join(dir, 'protected-before.json'))),
      'DATA_CHANGED',
    );
    assert.deepEqual(
      history(),
      JSON.parse(fs.readFileSync(path.join(dir, 'history-before.json'))),
    );
    const sql = fs
      .readFileSync(source, 'utf8')
      .replace(
        'commit;',
        `insert into supabase_migrations.schema_migrations(version,name,statements) values('${version}','service_catalog_categories',array['Reviewed service catalog migration; source and backup preserved']);\ncommit;`,
      );
    fs.writeFileSync(path.join(dir, 'activation.sql'), sql, { flag: 'wx' });
    save('apply-attempt.json', { at: new Date().toISOString() });
    cli([
      'db',
      'query',
      '--remote=' + ref,
      '--file',
      path.join(dir, 'activation.sql'),
      '--yes',
    ]);
    assert.deepEqual(
      protectedRows(),
      JSON.parse(fs.readFileSync(path.join(dir, 'protected-before.json'))),
      'EXISTING_VALUES_CHANGED',
    );
    assert.deepEqual(
      policies(),
      JSON.parse(fs.readFileSync(path.join(dir, 'policies-before.json'))),
    );
    save('sql-applied.json', {
      at: new Date().toISOString(),
      existingDataPreserved: true,
    });
    console.log(
      JSON.stringify({ sqlApplied: true, existingDataPreserved: true }),
    );
  } else if (mode === 'deploy') {
    assert.ok(fs.existsSync(path.join(dir, 'sql-applied.json')));
    const before = JSON.parse(
      fs.readFileSync(path.join(dir, 'functions-before.json')),
    );
    assert.deepEqual(functions(), before, 'EDGE_DRIFT');
    for (const file of prepared.files)
      assert.equal(
        hash(
          fs.readFileSync(
            path.join(prepared.work, 'supabase/functions', file.file),
          ),
        ),
        file.staged,
      );
    assert.ok(
      !fs.existsSync(path.join(dir, 'deploy-attempt.json')),
      'INSPECT_BEFORE_RETRY',
    );
    save('deploy-attempt.json', { at: new Date().toISOString() });
    cli([
      'functions',
      'deploy',
      'barbershop-operation',
      '--remote=' + ref,
      '--workdir',
      prepared.work,
      '--use-api',
      '--yes',
    ]);
    const after = functions();
    for (const f of before.filter((f) => f.slug !== 'barbershop-operation'))
      assert.deepEqual(
        after.find((v) => v.slug === f.slug),
        f,
      );
    const selected = after.find((f) => f.slug === 'barbershop-operation');
    assert.equal(selected.status, 'ACTIVE');
    assert.equal(selected.verify_jwt, true);
    save('deployed.json', {
      at: new Date().toISOString(),
      version: selected.version,
      verifyJwt: true,
    });
    console.log(
      JSON.stringify({
        deployed: true,
        function: selected.slug,
        version: selected.version,
        verifyJwt: true,
      }),
    );
  } else if (mode === 'smoke') {
    assert.ok(fs.existsSync(path.join(dir, 'deployed.json')));
    cli([
      'db',
      'query',
      '--remote=' + ref,
      '--file',
      'tests/integration/booking/service-categories.smoke.sql',
      '--yes',
    ]);
    assert.deepEqual(
      protectedRows(),
      JSON.parse(fs.readFileSync(path.join(dir, 'protected-before.json'))),
    );
    save('smoke.json', {
      rpcCreateEditArchive: true,
      rolledBack: true,
      at: new Date().toISOString(),
    });
    console.log(
      JSON.stringify({
        rpcCreateEditArchive: true,
        realServerRole: true,
        existingDataPreserved: true,
      }),
    );
  } else if (mode === 'advisors') {
    const report = json([
      'db',
      'advisors',
      '--remote=' + ref,
      '--type',
      'security',
      '--fail-on',
      'none',
    ]);
    save('advisors.json', report);
    console.log(
      JSON.stringify({
        advisorsCaptured: true,
        reportKeys: Object.keys(report),
      }),
    );
  } else if (mode === 'verify') {
    const checks = read(
      "select not has_table_privilege('service_role','public.services','update') no_direct_writes,not has_function_privilege('authenticated','public.upsert_booking_service(uuid,jsonb)','execute') no_direct_rpc,has_function_privilege('service_role','public.upsert_booking_service(uuid,jsonb)','execute') edge_rpc,(select count(*)::int from public.services where archived or category not in('Corte de cabello','Barba','Tratamientos','Otros')) invalid_rows,(select count(*)::int from supabase_migrations.schema_migrations where version='20261125010000') migration",
    );
    assert.deepEqual(checks, [
      {
        no_direct_writes: true,
        no_direct_rpc: true,
        edge_rpc: true,
        invalid_rows: 0,
        migration: 1,
      },
    ]);
    assert.deepEqual(
      protectedRows(),
      JSON.parse(fs.readFileSync(path.join(dir, 'protected-before.json'))),
    );
    assert.deepEqual(
      policies(),
      JSON.parse(fs.readFileSync(path.join(dir, 'policies-before.json'))),
    );
    assert.deepEqual(
      history().filter((r) => r.version !== version),
      JSON.parse(fs.readFileSync(path.join(dir, 'history-before.json'))),
    );
    save('verified.json', {
      checks,
      at: new Date().toISOString(),
      existingDataPreserved: true,
    });
    console.log(
      JSON.stringify({ verified: true, checks, existingDataPreserved: true }),
    );
  } else throw Error('EXPLICIT_MODE_REQUIRED');
}
