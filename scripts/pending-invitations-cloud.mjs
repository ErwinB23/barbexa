// User-authorized 016 only. Never prints credentials, backup contents or row data.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const [mode, supplied] = process.argv.slice(2);
const ref = 'vuoncrtkkkquvddunrxx';
const file = '20261123221939_pending_professional_invitations.sql';
const source = 'supabase/migrations/' + file;
const root = path.join(process.env.LOCALAPPDATA, 'Barbexa', 'backups');
const dir = supplied
  ? path.resolve(supplied)
  : path.join(root, `pending-invitations-${Date.now()}`);
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
        const subtract = '';
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
  assert.deepEqual(b.structure, a.structure, 'TABLE_STRUCTURE_CHANGED');
  const normalized = (xs) =>
    xs
      .filter(
        (f) =>
          !(
            f.schema === 'public' && f.name === 'remind_professional_invitation'
          ),
      )
      .map((f) =>
        f.schema === 'private' && f.name === 'booking_invitations'
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
      '.artifacts/barbexa-pending-invitations-1795472849420/report.json',
    );
    const rehearsal = JSON.parse(fs.readFileSync(rehearsalPath));
    assert.equal(rehearsal.status, 'passed');
    assert.equal(rehearsal.removed, true);
    assert.equal(rehearsal.assertions, 13);
    assert.equal(
      rehearsal.migrations.find((m) => m.file === file).sha256,
      hash(fs.readFileSync(source)),
    );
    assert.deepEqual(rehearsal.concurrency, {
      created: 1,
      suppressed: 1,
      notices: 1,
    });
    save('rehearsal.json', rehearsal);
    const before = snapshot();
    const originals = fs
      .readdirSync('supabase/migrations')
      .filter((f) => f.endsWith('.sql') && f !== file)
      .sort();
    assert.equal(originals.length, 22);
    assert.equal(before.history.length, 22);
    assert.deepEqual(
      before.history.map((h) => h.version),
      originals.map((f) => f.slice(0, 14)),
    );
    assert.equal(before.active, 0);
    assert.equal(
      before.functions.filter(
        (f) => f.name === 'remind_professional_invitation',
      ).length,
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
    const work = path.join(dir, 'migration-work');
    fs.mkdirSync(path.join(work, 'supabase', 'migrations'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(work, 'supabase', 'config.toml'),
      'project_id = "barbexa-pending-invitations-cloud"\n',
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
        migrations: 22,
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
    assert.equal(
      rehearsal.migrations.find((m) => m.file === file).sha256,
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
    assert.equal(
      after.functions.filter(
        (f) => f.schema === 'private' && f.name === 'booking_invitations',
      )[0].hash !==
        before.functions.filter(
          (f) => f.schema === 'private' && f.name === 'booking_invitations',
        )[0].hash,
      true,
    );
    if (failure) throw Error('APPLY_FAILED_INSPECT_STATE ' + failure);
    assert.equal(after.history.length, 23);
    assert.deepEqual(
      after.history.filter((h) => h.version !== file.slice(0, 14)),
      before.history,
    );
    const objects = query(
      "select position('recipientEmail' in pg_get_functiondef('private.booking_invitations(uuid,uuid)'::regprocedure))>0 email,has_function_privilege('anon','public.remind_professional_invitation(uuid,uuid)','execute') anon_remind,has_function_privilege('authenticated','public.remind_professional_invitation(uuid,uuid)','execute') authenticated_remind,has_function_privilege('service_role','public.remind_professional_invitation(uuid,uuid)','execute') service_remind,position('authority_assert' in pg_get_functiondef('public.remind_professional_invitation(uuid,uuid)'::regprocedure))>0 team_guard",
    )[0];
    assert.equal(objects.email, true);
    assert.equal(objects.anon_remind, false);
    assert.equal(objects.authenticated_remind, true);
    assert.equal(objects.service_remind, false);
    assert.equal(objects.team_guard, true);
    assert.equal(after.functions.length, before.functions.length + 1);
    save('verified.json', {
      at: new Date().toISOString(),
      objects,
      history: 23,
      protectedTables: before.fingerprints.length,
    });
    console.log(
      JSON.stringify({
        applied: true,
        ref,
        file,
        objects,
        history: 23,
        protectedTables: before.fingerprints.length,
      }),
    );
  } else if (mode === 'verify') {
    target();
    const catalog = catalogQuery(`
      with actor as materialized (
        select u.id,m.barbershop_id from auth.users u
        join public.barbershop_memberships m on m.user_id=u.id and m.status='active' and m.role='administrator'
        where not coalesce(u.is_anonymous,false) and u.email_confirmed_at is not null
          and (u.banned_until is null or u.banned_until<now())
          and exists(select 1 from public.staff_invitations i where i.barbershop_id=m.barbershop_id and i.role='barber')
        order by u.id,m.barbershop_id limit 1
      ), claims as materialized (
        select set_config('request.jwt.claim.sub',id::text,true),
          set_config('request.jwt.claims',jsonb_build_object('sub',id::text,'role','authenticated')::text,true)
        from actor
      ), history as materialized (
        select a.barbershop_id shop,public.list_shop_staff_invitations(a.barbershop_id) data
        from actor a cross join claims
      )
      select jsonb_array_length(data)::int invitations,
        (select count(*)::int from jsonb_array_elements(data) e where e->>'status'='pending' and e->>'role'='barber') pending,
        (select coalesce(jsonb_agg(e->>'id' order by ordinal),'[]'::jsonb) from jsonb_array_elements(data) with ordinality x(e,ordinal))=
        (select coalesce(jsonb_agg(i.id::text order by i.created_at desc,i.id desc),'[]'::jsonb) from public.staff_invitations i where i.barbershop_id=h.shop) newest_first,
        not exists(select 1 from jsonb_array_elements(data) e where e->>'barbershopId'<>h.shop::text) tenant_match,
        not exists(select 1 from jsonb_array_elements(data) e join public.staff_invitations i on i.id=(e->>'id')::uuid join public.profiles p on p.id=i.recipient_user_id
          where e->>'recipientEmail' is distinct from case when i.role='barber' and i.status='pending' then (select email from auth.users u where u.id=i.recipient_user_id) else null end
          or e->>'recipientName' is distinct from p.display_name
          or e->>'createdAt' is distinct from to_char(i.created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
          or e->>'respondedAt' is distinct from case when i.responded_at is null then null else to_char(i.responded_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') end) metadata_match,
        not exists(select 1 from jsonb_array_elements(data) e join public.staff_invitations i on i.id=(e->>'id')::uuid
          left join public.barber_profiles bp on bp.barbershop_id=i.barbershop_id and bp.user_id=i.recipient_user_id
          left join public.barbershop_memberships m on m.barbershop_id=i.barbershop_id and m.user_id=i.recipient_user_id
          where e->>'professionalActive' is distinct from (case when i.status<>'accepted' or bp.id is null then null else bp.active and coalesce(m.status='active',false) end)::text) activity_match
      from history h
    `)[0];
    assert.ok(catalog?.invitations > 0, 'NO_LIVE_INVITATIONS_TO_VERIFY');
    assert.equal(catalog.newest_first, true);
    assert.equal(catalog.tenant_match, true);
    assert.equal(catalog.metadata_match, true);
    assert.equal(catalog.activity_match, true);
    save('history-verified-' + Date.now() + '.json', {
      at: new Date().toISOString(),
      catalog,
      limitation:
        'Read-only SQL with a real confirmed actor context; browser verifies the actual session separately.',
    });
    console.log(JSON.stringify({ verifiedHistory: true, ...catalog }));
  } else if (mode === 'advisors') {
    target();
    const result = json([
      'db',
      'advisors',
      '--remote=' + ref,
      '--type',
      'security',
      '--level',
      'info',
      '--fail-on',
      'none',
    ]);
    save('security-advisors-' + Date.now() + '.json', result);
    console.log(
      JSON.stringify({
        securityAdvisorsSaved: true,
        shape: Array.isArray(result) ? 'array' : Object.keys(result),
      }),
    );
  } else throw Error('EXPLICIT_PREPARE_APPLY_VERIFY_OR_ADVISORS_REQUIRED');
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
