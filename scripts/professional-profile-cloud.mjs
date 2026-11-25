// User-authorized 013 only. Never prints credentials, backup contents or row data.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const [mode, supplied] = process.argv.slice(2);
const ref = 'vuoncrtkkkquvddunrxx';
const file = '20261123174640_professional_profile_details.sql';
const source = 'supabase/migrations/' + file;
const root = path.join(process.env.LOCALAPPDATA, 'Barbexa', 'backups');
const dir = supplied
  ? path.resolve(supplied)
  : path.join(root, `professional-profile-${Date.now()}`);
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
  if (r.status !== 0)
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
  return r.stdout;
}
const json = (args) => JSON.parse(cli([...args, '--output-format', 'json']));
const rows = (x) =>
  Array.isArray(x) ? x : (x.rows ?? x.data?.rows ?? x.result?.rows);
const query = (sql) =>
  rows(json(['db', 'query', '--read-only', '--remote=' + ref, sql]));
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
          t.name === 'barber_profiles'
            ? "-array['professional_description','instagram','tiktok','facebook']"
            : t.name === 'barbershop_memberships'
              ? "-'joined_at'"
              : '';
        return `select '${t.schema}.${t.name}' name,count(*)::int count,md5(coalesce(string_agg(md5((to_jsonb(r)${subtract})::text),'' order by md5((to_jsonb(r)${subtract})::text)),'')) hash from ${quote(t.schema)}.${quote(t.name)} r`;
      })
      .join(' union all '),
  );
  return {
    fingerprints,
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
}
try {
  if (mode === 'prepare') {
    fs.mkdirSync(dir);
    save('target.json', target());
    const before = snapshot();
    const originals = fs
      .readdirSync('supabase/migrations')
      .filter((f) => f.endsWith('.sql') && f !== file)
      .sort();
    assert.equal(originals.length, 19);
    assert.equal(before.history.length, 19);
    assert.deepEqual(
      before.history.map((h) => h.version),
      originals.map((f) => f.slice(0, 14)),
    );
    assert.equal(before.active, 0);
    assert.equal(
      query(
        "select count(*)::int count from information_schema.columns where table_schema='public' and ((table_name='barber_profiles' and column_name in('professional_description','instagram','tiktok','facebook')) or(table_name='barbershop_memberships' and column_name='joined_at'))",
      )[0].count,
      0,
    );
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
    const backupWork = path.join(dir, 'edge-before');
    fs.mkdirSync(path.join(backupWork, 'supabase'), { recursive: true });
    fs.writeFileSync(
      path.join(backupWork, 'supabase', 'config.toml'),
      'project_id = "barbexa-profile-backup"\n',
    );
    save(
      'functions-before.json',
      json(['functions', 'list', '--remote=' + ref]),
    );
    cli([
      'functions',
      'download',
      'barbershop-operation',
      '--remote=' + ref,
      '--workdir',
      backupWork,
      '--use-api',
    ]);
    const work = path.join(dir, 'migration-work');
    fs.mkdirSync(path.join(work, 'supabase', 'migrations'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(work, 'supabase', 'config.toml'),
      'project_id = "barbexa-profile-cloud"\n',
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
        migrations: 19,
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
    try {
      cli(['migration', 'up', '--remote=' + ref, '--workdir', p.work, '--yes']);
    } catch (e) {
      failure = e.message;
    }
    const after = snapshot();
    save('after.json', after);
    same(before, after);
    if (failure) throw Error('APPLY_FAILED_INSPECT_STATE ' + failure);
    assert.equal(after.history.length, 20);
    assert.deepEqual(
      after.history.filter((h) => h.version !== file.slice(0, 14)),
      before.history,
    );
    const objects = query(
      "select (select count(*)::int from public.barber_profiles where professional_description<>'' or instagram is not null or tiktok is not null or facebook is not null) nondefault_profiles,(select count(*)::int from public.barbershop_memberships where joined_at is not null) backfilled_dates,has_function_privilege('anon','public.get_own_professional_profile_details(uuid,jsonb)','execute') anon_read,has_function_privilege('authenticated','public.update_own_professional_profile_details(uuid,jsonb)','execute') direct_write,has_function_privilege('service_role','public.update_own_professional_profile_details(uuid,jsonb)','execute') edge_write",
    )[0];
    assert.equal(objects.nondefault_profiles, 0);
    assert.equal(objects.backfilled_dates, 0);
    assert.equal(objects.anon_read, false);
    assert.equal(objects.direct_write, false);
    assert.equal(objects.edge_write, true);
    save('verified.json', {
      at: new Date().toISOString(),
      objects,
      history: 20,
      protectedTables: before.fingerprints.length,
    });
    console.log(
      JSON.stringify({
        applied: true,
        ref,
        file,
        objects,
        history: 20,
        protectedTables: before.fingerprints.length,
      }),
    );
  } else throw Error('EXPLICIT_PREPARE_OR_APPLY_REQUIRED');
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
