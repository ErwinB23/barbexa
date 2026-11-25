// Explicitly authorized Cloud migration; no business commands, fixtures or email.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const [mode, suppliedDirectory] = process.argv.slice(2);
const ref = 'vuoncrtkkkquvddunrxx';
const approvedHash =
  'adfe5bede6f48554ebef1b52cbe7666379f1343295fa95db375b9dfb2572a30b';
const source = 'specs/012-notificaciones-web/contracts/notifications.sql';
const root = path.join(process.env.LOCALAPPDATA, 'Barbexa', 'backups');
const dir = suppliedDirectory
  ? path.resolve(suppliedDirectory)
  : path.join(root, `notifications-${Date.now()}`);
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
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
function cli(args) {
  const r = spawnSync(bin, args, {
    env,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 40 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    const safe = {
      exit: r.status,
      timeout: r.error?.code === 'ETIMEDOUT',
      network: /connect|network|Transport|resolve|certificate/i.test(
        r.stderr + r.stdout,
      ),
    };
    throw Error('CLI_FAILED ' + JSON.stringify(safe));
  }
  return r.stdout;
}
const json = (args) => JSON.parse(cli([...args, '--output-format', 'json']));
function rows(data) {
  return Array.isArray(data)
    ? data
    : (data.rows ?? data.data?.rows ?? data.result?.rows);
}
function query(sql) {
  return rows(json(['db', 'query', '--read-only', '--remote=' + ref, sql]));
}
const save = (name, value) =>
  fs.writeFileSync(path.join(dir, name), JSON.stringify(value, null, 2), {
    flag: 'wx',
  });
function target() {
  assert.equal(
    fs.readFileSync('supabase/.temp/project-ref', 'utf8').trim(),
    ref,
  );
  const projects = json(['projects', 'list']);
  const p = (
    Array.isArray(projects) ? projects : (projects.projects ?? projects.data)
  ).find((p) => (p.id ?? p.ref) === ref);
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
      .map(
        (t) =>
          `select '${t.schema}.${t.name}' name,count(*)::int count,md5(coalesce(string_agg(md5(to_jsonb(r)::text),'' order by md5(to_jsonb(r)::text)),'')) hash from ${quote(t.schema)}.${quote(t.name)} r`,
      )
      .join(' union all '),
  );
  const history = query(
    'select version,name from supabase_migrations.schema_migrations order by version',
  );
  const activity = query(
    "select count(*)::int count from pg_stat_activity where pid<>pg_backend_pid() and datname=current_database() and state='active' and backend_type='client backend' and usename in('authenticator','service_role')",
  );
  return { fingerprints, history, active: activity[0].count };
}
function same(before, after) {
  for (const original of before.fingerprints)
    assert.deepEqual(
      after.fingerprints.find((x) => x.name === original.name),
      original,
      'PROTECTED_ROWS_CHANGED',
    );
}
try {
  assert.equal(hash(fs.readFileSync(source)), approvedHash);
  if (mode === 'prepare') {
    fs.mkdirSync(dir, { recursive: false });
    save('target.json', target());
    const before = snapshot();
    assert.equal(before.history.length, 18);
    assert.equal(before.active, 0);
    const originals = fs
      .readdirSync('supabase/migrations')
      .filter((f) => f.endsWith('.sql'))
      .sort();
    assert.equal(originals.length, 18);
    assert.deepEqual(
      before.history.map((h) => h.version),
      originals.map((f) => f.slice(0, 14)),
    );
    assert.equal(
      query("select to_regclass('private.web_notifications') is null absent")[0]
        .absent,
      true,
    );
    save('before.json', before);
    for (const [file, flags] of [
      ['schema.sql', []],
      ['data.sql', ['--data-only', '--use-copy']],
      ['roles.sql', ['--role-only']],
      [
        'migration-history.sql',
        ['--schema', 'supabase_migrations', '--data-only', '--use-copy'],
      ],
    ]) {
      const dest = path.join(dir, file);
      assert.ok(!fs.existsSync(dest));
      cli(['db', 'dump', '--remote=' + ref, ...flags, '--file', dest]);
      assert.ok(fs.statSync(dest).size > 0);
      console.log(
        JSON.stringify({ backup: file, bytes: fs.statSync(dest).size }),
      );
    }
    const work = path.join(dir, 'migration-work');
    fs.mkdirSync(path.join(work, 'supabase', 'migrations'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(work, 'supabase', 'config.toml'),
      'project_id = "barbexa-notifications-cloud"\n',
      { flag: 'wx' },
    );
    for (const file of originals)
      fs.copyFileSync(
        'supabase/migrations/' + file,
        path.join(work, 'supabase', 'migrations', file),
        fs.constants.COPYFILE_EXCL,
      );
    cli(['migration', 'new', 'web_notifications', '--workdir', work]);
    const file = fs
      .readdirSync(path.join(work, 'supabase', 'migrations'))
      .find((f) => !originals.includes(f));
    assert.ok(/^\d{14}_web_notifications\.sql$/.test(file));
    fs.writeFileSync(
      path.join(work, 'supabase', 'migrations', file),
      fs.readFileSync(source),
    );
    const check = snapshot();
    same(before, check);
    assert.deepEqual(check.history, before.history);
    assert.equal(check.active, 0);
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
    save('prepared.json', {
      ref,
      work,
      file,
      hash: approvedHash,
      originals: originals.map((file) => ({
        file,
        hash: hash(fs.readFileSync('supabase/migrations/' + file)),
      })),
      backupLimitations: [
        'Auth managed config, OAuth, secrets and Storage binaries not covered',
        'No restore rehearsal of this fresh backup; previous logical recovery evidence remains separate',
      ],
    });
    console.log(
      JSON.stringify({
        prepared: true,
        privateDirectory: dir,
        migration: file,
        protectedCounts: before.fingerprints
          .filter((x) =>
            [
              'public.reservations',
              'public.reservation_items',
              'public.profiles',
              'public.barbershops',
            ].includes(x.name),
          )
          .map((x) => ({ table: x.name, count: x.count })),
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
    for (const item of JSON.parse(
      fs.readFileSync(path.join(dir, 'manifest.json')),
    ))
      assert.equal(
        hash(fs.readFileSync(path.join(dir, item.file))),
        item.sha256,
      );
    for (const item of p.originals)
      assert.equal(
        hash(fs.readFileSync('supabase/migrations/' + item.file)),
        item.hash,
      );
    const before = JSON.parse(fs.readFileSync(path.join(dir, 'before.json')));
    const fresh = snapshot();
    same(before, fresh);
    assert.deepEqual(fresh.history, before.history);
    assert.equal(fresh.active, 0);
    assert.equal(
      hash(
        fs.readFileSync(path.join(p.work, 'supabase', 'migrations', p.file)),
      ),
      approvedHash,
    );
    save('apply-attempt.json', {
      at: new Date().toISOString(),
      ref,
      file: p.file,
      hash: p.hash,
    });
    let failure = null;
    try {
      cli(['migration', 'up', '--remote=' + ref, '--workdir', p.work, '--yes']);
    } catch (e) {
      failure = e.message;
    }
    const after = snapshot();
    save('after.json', after);
    same(before, after);
    if (failure)
      throw Error('MIGRATION_ATTEMPT_FAILED_STATE_PRESERVED ' + failure);
    assert.equal(after.history.length, 19);
    assert.deepEqual(
      after.history.filter((h) => h.version !== p.file.slice(0, 14)),
      before.history,
    );
    assert.ok(
      after.history.some(
        (h) =>
          h.version === p.file.slice(0, 14) && h.name === 'web_notifications',
      ),
    );
    const objects = query(
      "select (select count(*)::int from pg_trigger where tgname in('web_notice_reservation','web_notice_care','web_notice_reschedule','web_notice_invitation') and not tgisinternal) triggers,(select count(*)::int from private.web_notifications) notifications,(select relrowsecurity from pg_class where oid='private.web_notifications'::regclass) rls,has_function_privilege('anon','public.list_my_notifications()','execute') anon,has_function_privilege('authenticated','public.list_my_notifications()','execute') authenticated,has_table_privilege('authenticated','private.web_notifications','select') direct_access,(select count(*)::int from pg_stat_activity where application_name like '%migration%' and state='idle in transaction') open_transactions",
    )[0];
    assert.equal(objects.triggers, 4);
    assert.equal(objects.notifications, 0);
    assert.equal(objects.rls, true);
    assert.equal(objects.anon, false);
    assert.equal(objects.authenticated, true);
    assert.equal(objects.direct_access, false);
    assert.equal(objects.open_transactions, 0);
    save('verified.json', {
      at: new Date().toISOString(),
      objects,
      protectedTables: before.fingerprints.length,
      history: 19,
    });
    fs.copyFileSync(
      path.join(p.work, 'supabase', 'migrations', p.file),
      'supabase/migrations/' + p.file,
      fs.constants.COPYFILE_EXCL,
    );
    console.log(
      JSON.stringify({
        applied: true,
        ref,
        migration: p.file,
        history: 19,
        objects,
        protectedTables: before.fingerprints.length,
      }),
    );
  } else throw Error('EXPLICIT_MODE_REQUIRED');
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
