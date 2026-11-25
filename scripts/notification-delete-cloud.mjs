// User-authorized notification deletion only. Never prints credentials, backup contents or row data.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const [mode, supplied] = process.argv.slice(2);
const ref = 'vuoncrtkkkquvddunrxx';
const file = '20261124154602_delete_own_notification.sql';
const source = 'supabase/migrations/' + file;
const root = path.join(process.env.LOCALAPPDATA, 'Barbexa', 'backups');
const dir = supplied
  ? path.resolve(supplied)
  : path.join(root, `notification-delete-${Date.now()}`);
assert.ok(dir.startsWith(root + path.sep));
const bin = path.resolve(
  'node_modules/@supabase/cli-windows-x64/bin/supabase.exe',
);
const env = {
  ...process.env,
  NODE_USE_SYSTEM_CA: '1',
  PATH:
    path.join(
      process.env.LOCALAPPDATA,
      'Programs/DockerDesktop/resources/bin',
    ) +
    path.delimiter +
    process.env.PATH,
};
delete env.NODE_TLS_REJECT_UNAUTHORIZED;
const hash = (v) => crypto.createHash('sha256').update(v).digest('hex');
function cli(args) {
  const r = spawnSync(bin, args, {
    env,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 40 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    if (fs.existsSync(dir))
      fs.writeFileSync(
        path.join(dir, 'cli-error-' + Date.now() + '.json'),
        JSON.stringify({
          command: args.slice(0, 2),
          stdout: r.stdout,
          stderr: r.stderr,
        }),
        { flag: 'wx' },
      );
    throw Error(
      'CLI_FAILED ' +
        JSON.stringify({
          command: args.slice(0, 2),
          exit: r.status,
          timeout: r.error?.code === 'ETIMEDOUT',
          network: /connect|network|Transport|resolve|certificate/i.test(
            r.stderr + r.stdout,
          ),
        }),
    );
  }
  return r.stdout;
}
const json = (args) => JSON.parse(cli([...args, '--output-format', 'json']));
const rows = (x) =>
  Array.isArray(x) ? x : (x.rows ?? x.data?.rows ?? x.result?.rows);
const query = (sql) =>
  rows(json(['db', 'query', '--read-only', '--remote=' + ref, sql]));
// Management API's read-only role has no EXECUTE on this deliberately restricted
// RPC. Use the owner connection solely inside an explicit READ ONLY transaction.
const catalogQuery = (sql) =>
  rows(
    json([
      'db',
      'query',
      '--remote=' + ref,
      '--yes',
      'begin read only; ' + sql + '; commit;',
    ]),
  );
const save = (name, v) =>
  fs.writeFileSync(path.join(dir, name), JSON.stringify(v, null, 2), {
    flag: 'wx',
  });
function target() {
  assert.equal(
    fs.readFileSync('supabase/.temp/project-ref', 'utf8').trim(),
    ref,
  );
  const data = json(['projects', 'list']);
  const p = (Array.isArray(data) ? data : (data.projects ?? data.data)).find(
    (p) => (p.id ?? p.ref) === ref,
  );
  assert.equal(p?.region, 'sa-east-1');
  return { ref, region: p.region };
}
function snapshot() {
  const tables = query(
    "select n.nspname schema,c.relname name from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and (n.nspname in('public','private') or(n.nspname='auth' and c.relname in('users','identities'))) order by 1,2",
  );
  const quote = (s) => '"' + s.replaceAll('"', '""') + '"';
  const fingerprints = query(
    tables
      .map((t) => {
        const subtract =
          t.schema === 'private' && t.name === 'web_notifications'
            ? "-'deleted_at'"
            : '';
        return `select '${t.schema}.${t.name}' name,count(*)::int count,md5(coalesce(string_agg(md5((to_jsonb(r)${subtract})::text),'' order by md5((to_jsonb(r)${subtract})::text)),'')) hash from ${quote(t.schema)}.${quote(t.name)} r`;
      })
      .join(' union all '),
  );
  return {
    fingerprints,
    functions: query(
      "select n.nspname schema,p.proname name,pg_get_function_identity_arguments(p.oid) args,p.prosecdef security_definer,p.proconfig config,p.proacl::text acl,md5(pg_get_functiondef(p.oid)) hash from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('public','private') and p.prokind='f' order by 1,2,3",
    ),
    structure: query(
      "select c.table_schema,c.table_name,c.column_name,c.data_type,c.is_nullable,c.column_default from information_schema.columns c where c.table_schema in('public','private') order by 1,2,c.ordinal_position",
    ),
    history: query(
      'select version,name from supabase_migrations.schema_migrations order by version',
    ),
    policies: query(
      "select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in('public','private') order by 1,2,3",
    ),
    active: query(
      "select count(*)::int count from pg_stat_activity where pid<>pg_backend_pid() and datname=current_database() and state='active' and backend_type='client backend' and usename in('authenticator','service_role')",
    )[0].count,
  };
}
function same(a, b) {
  assert.deepEqual(b.fingerprints, a.fingerprints, 'PROTECTED_ROWS_CHANGED');
  assert.deepEqual(b.policies, a.policies, 'POLICIES_CHANGED');
  assert.deepEqual(
    b.structure.filter(
      (c) =>
        !(
          c.table_schema === 'private' &&
          c.table_name === 'web_notifications' &&
          c.column_name === 'deleted_at'
        ),
    ),
    a.structure,
    'UNAPPROVED_STRUCTURE_CHANGE',
  );
  const normalized = (xs) =>
    xs
      .filter(
        (f) => !(f.schema === 'public' && f.name === 'delete_my_notification'),
      )
      .map((f) =>
        f.schema === 'public' &&
        ['list_my_notifications', 'read_my_notification'].includes(f.name)
          ? { ...f, hash: 'approved-change' }
          : f,
      );
  assert.deepEqual(
    normalized(b.functions),
    normalized(a.functions),
    'UNAPPROVED_FUNCTION_OR_ACL_CHANGED',
  );
}
try {
  if (mode === 'prepare') {
    fs.mkdirSync(dir);
    save('target.json', target());
    const rehearsalPath = path.resolve(
      '.artifacts/barbexa-notification-delete-1795535191676/report.json',
    );
    const rehearsal = JSON.parse(fs.readFileSync(rehearsalPath));
    assert.equal(rehearsal.status, 'passed');
    assert.equal(rehearsal.removed, true);
    assert.ok(rehearsal.assertions.includes('foreign denial'));
    assert.equal(rehearsal.draftHash, hash(fs.readFileSync(source)));
    save('rehearsal.json', rehearsal);
    const before = snapshot();
    const originals = fs
      .readdirSync('supabase/migrations')
      .filter((f) => f.endsWith('.sql') && f !== file)
      .sort();
    assert.equal(originals.length, 23);
    assert.equal(before.history.length, 23);
    assert.deepEqual(
      before.history.map((h) => h.version),
      originals.map((f) => f.slice(0, 14)),
    );
    assert.equal(before.active, 0);
    save('before.json', before);
    for (const [name, flags] of [
      ['schema.sql', []],
      ['data.sql', ['--data-only', '--use-copy']],
      ['roles.sql', ['--role-only']],
      [
        'migration-history.sql',
        ['--schema', 'supabase_migrations', '--data-only', '--use-copy'],
      ],
    ]) {
      const dest = path.join(dir, name);
      assert.ok(!fs.existsSync(dest));
      cli(['db', 'dump', '--remote=' + ref, ...flags, '--file', dest]);
      assert.ok(fs.statSync(dest).size > 0);
      console.log(
        JSON.stringify({ backup: name, bytes: fs.statSync(dest).size }),
      );
    }
    const work = path.join(dir, 'migration-work');
    fs.mkdirSync(path.join(work, 'supabase', 'migrations'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(work, 'supabase', 'config.toml'),
      'project_id = "barbexa-notification-delete-cloud"\n',
    );
    for (const name of [...originals, file])
      fs.copyFileSync(
        'supabase/migrations/' + name,
        path.join(work, 'supabase', 'migrations', name),
        fs.constants.COPYFILE_EXCL,
      );
    const manifest = [
      'schema.sql',
      'data.sql',
      'roles.sql',
      'migration-history.sql',
    ].map((file) => ({
      file,
      bytes: fs.statSync(path.join(dir, file)).size,
      sha256: hash(fs.readFileSync(path.join(dir, file))),
    }));
    save('manifest.json', manifest);
    const fresh = snapshot();
    same(before, fresh);
    assert.deepEqual(fresh.history, before.history);
    assert.equal(fresh.active, 0);
    save('prepared.json', {
      ref,
      file,
      work,
      hash: hash(fs.readFileSync(source)),
      originals: originals.map((file) => ({
        file,
        hash: hash(fs.readFileSync('supabase/migrations/' + file)),
      })),
      at: new Date().toISOString(),
      backupLimitations: [
        'Logical DB backup; managed Auth/OAuth settings, secrets and Storage binaries are not included.',
        'Fresh backup restore not rehearsed; migration tested separately on disposable PostgreSQL.',
      ],
    });
    console.log(
      JSON.stringify({
        prepared: true,
        privateDirectory: dir,
        migrations: 23,
        protectedTables: before.fingerprints.length,
      }),
    );
  } else if (mode === 'apply') {
    const p = JSON.parse(fs.readFileSync(path.join(dir, 'prepared.json')));
    assert.equal(p.ref, ref);
    target();
    assert.ok(
      !fs.existsSync(path.join(dir, 'apply-attempt.json')),
      'NO_AUTOMATIC_RETRY',
    );
    assert.ok(Date.now() - Date.parse(p.at) < 3600000, 'BACKUP_TOO_OLD');
    for (const x of JSON.parse(
      fs.readFileSync(path.join(dir, 'manifest.json')),
    ))
      assert.equal(hash(fs.readFileSync(path.join(dir, x.file))), x.sha256);
    for (const x of p.originals)
      assert.equal(
        hash(fs.readFileSync('supabase/migrations/' + x.file)),
        x.hash,
      );
    assert.equal(hash(fs.readFileSync(source)), p.hash);
    assert.equal(
      hash(fs.readFileSync(path.join(p.work, 'supabase', 'migrations', file))),
      p.hash,
    );
    const rehearsal = JSON.parse(
      fs.readFileSync(path.join(dir, 'rehearsal.json')),
    );
    assert.equal(rehearsal.status, 'passed');
    assert.equal(rehearsal.draftHash, p.hash);
    const before = JSON.parse(fs.readFileSync(path.join(dir, 'before.json'))),
      fresh = snapshot();
    same(before, fresh);
    assert.deepEqual(fresh.history, before.history);
    assert.equal(fresh.active, 0);
    save('apply-attempt.json', {
      at: new Date().toISOString(),
      hash: p.hash,
      ref,
      file,
    });
    let failure;
    // The isolated work directory contains exactly the reviewed migration history.
    // migration up changes no Vault, roles, seeds or Edge deployment.

    try {
      cli(['migration', 'up', '--remote=' + ref, '--workdir', p.work, '--yes']);
    } catch (e) {
      failure = e.message;
    }
    const after = snapshot();
    save('after.json', after);
    same(before, after);
    if (failure) throw Error('APPLY_FAILED_INSPECT_STATE ' + failure);
    assert.equal(after.history.length, 24);
    assert.deepEqual(
      after.history.filter((h) => h.version !== file.slice(0, 14)),
      before.history,
    );
    const objects = query(
      "select exists(select 1 from information_schema.columns where table_schema='private' and table_name='web_notifications' and column_name='deleted_at') deleted_column,has_function_privilege('anon','public.delete_my_notification(uuid)','execute') anon_delete,has_function_privilege('authenticated','public.delete_my_notification(uuid)','execute') authenticated_delete,position('canRemove' in pg_get_functiondef('public.list_my_notifications()'::regprocedure))>0 capability,position('deleted_at is null' in lower(pg_get_functiondef('public.list_my_notifications()'::regprocedure)))>0 filters_deleted",
    )[0];
    assert.equal(objects.deleted_column, true);
    assert.equal(objects.anon_delete, false);
    assert.equal(objects.authenticated_delete, true);
    assert.equal(objects.capability, true);
    assert.equal(objects.filters_deleted, true);
    save('verified.json', {
      at: new Date().toISOString(),
      objects,
      history: 24,
      protectedTables: before.fingerprints.length,
    });
    console.log(
      JSON.stringify({
        applied: true,
        ref,
        file,
        objects,
        history: 24,
        protectedTables: before.fingerprints.length,
      }),
    );
  } else if (mode === 'verify') {
    target();
    const verified = catalogQuery(
      `with actor as materialized(select recipient_id from private.web_notifications order by created_at desc limit 1), claims as materialized(select set_config('request.jwt.claim.sub',recipient_id::text,true),set_config('request.jwt.claims',jsonb_build_object('sub',recipient_id::text,'role','authenticated','is_anonymous',false)::text,true) from actor), inbox as materialized(select public.list_my_notifications() data from claims) select (data->>'canRemove')::boolean enabled,jsonb_array_length(data->'items') visible,(data->>'unread')::int unread from inbox`,
    )[0];
    assert.equal(verified.enabled, true);
    save('read-verified-' + Date.now() + '.json', verified);
    console.log(JSON.stringify({ readVerified: true, ...verified }));
  } else throw Error('EXPLICIT_PREPARE_APPLY_OR_VERIFY_REQUIRED');
} catch (e) {
  console.error(
    JSON.stringify({
      status: 'stopped',
      reason: e.message,
      privateDirectory: dir,
    }),
  );
  process.exitCode = 1;
}
