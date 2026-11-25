// Authorized 016 rehearsal. Disposable, no network, ports or host data mounts.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
const docker = path.join(
  process.env.LOCALAPPDATA,
  'Programs/DockerDesktop/resources/bin/docker.exe',
);
const name = `barbexa-pending-invitations-${Date.now()}`;
const output = path.resolve('.artifacts', name);
fs.mkdirSync(output, { recursive: true });
const report = {
  name,
  network: 'none',
  cloudAccess: false,
  steps: [],
  status: 'running',
};
const save = () =>
  fs.writeFileSync(
    path.join(output, 'report.json'),
    JSON.stringify(report, null, 2),
  );
function run(args, input) {
  const r = spawnSync(docker, args, {
    input,
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.status !== 0)
    throw Error(
      (r.stderr || r.error?.message || 'DOCKER_FAILED').slice(0, 2500),
    );
  return r.stdout;
}
let id;
function sql(label, input) {
  const result = run(
    [
      'exec',
      '-i',
      id,
      'psql',
      '-X',
      '-h',
      '/tmp',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-At',
    ],
    input,
  );
  fs.writeFileSync(path.join(output, `${label}.log`), result);
  assert.ok(!/^not ok\b/m.test(result), `FAILED_SQL_ASSERTION_${label}`);
  report.steps.push(label);
  save();
  return result;
}
try {
  id = run([
    'run',
    '-d',
    '--pull=never',
    '--name',
    name,
    '--label',
    'barbexa.phase=pending-invitations-rehearsal',
    '--network',
    'none',
    '--user',
    'postgres',
    '--read-only',
    '--memory',
    '768m',
    '--cpus',
    '1',
    '--tmpfs',
    '/tmp:rw,mode=1777,exec',
    '--entrypoint',
    'sh',
    'public.ecr.aws/supabase/postgres:17.11.0.018',
    '-c',
    'initdb -D /tmp/barbexa-pg --no-locale --encoding=UTF8 --auth=trust > /tmp/init.log 2>&1 && exec postgres -D /tmp/barbexa-pg -c listen_addresses= -c unix_socket_directories=/tmp',
  ]).trim();
  const info = JSON.parse(run(['inspect', id]))[0];
  assert.equal(info.Name, '/' + name);
  assert.equal(info.HostConfig.NetworkMode, 'none');
  assert.equal(Object.keys(info.HostConfig.PortBindings ?? {}).length, 0);
  assert.ok(info.Mounts.every((m) => m.Type === 'tmpfs'));
  report.id = id;
  save();
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (
      spawnSync(
        docker,
        ['exec', id, 'pg_isready', '-h', '/tmp', '-U', 'postgres'],
        { encoding: 'utf8' },
      ).status === 0
    ) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(ready, 'POSTGRES_NOT_READY');
  sql(
    'bootstrap',
    fs.readFileSync(
      'specs/012-notificaciones-web/contracts/rehearsal-bootstrap.sql',
      'utf8',
    ),
  );
  const migrations = fs
    .readdirSync('supabase/migrations')
    .filter((f) => f.endsWith('.sql'))
    .sort();
  assert.equal(migrations.length, 23);
  report.migrations = migrations.map((file) => ({
    file,
    sha256: crypto
      .createHash('sha256')
      .update(fs.readFileSync('supabase/migrations/' + file))
      .digest('hex'),
  }));
  for (const file of migrations)
    sql(
      file.slice(0, 14),
      fs.readFileSync('supabase/migrations/' + file, 'utf8'),
    );
  const tests = sql(
    'pending-invitations-tests',
    fs.readFileSync(
      'supabase/tests/pending-professional-invitations.test.sql',
      'utf8',
    ),
  );
  report.assertions = (tests.match(/^ok \d+/gm) ?? []).length;
  assert.ok(report.assertions >= 13);
  sql(
    'concurrency-setup',
    `
    begin;
    create table public.pi_concurrent_fixture as select gen_random_uuid() admin,gen_random_uuid() person,gen_random_uuid() shop,gen_random_uuid() invitation;
    insert into auth.users(id,email,is_anonymous,email_confirmed_at) select admin,'concurrent-admin@example.invalid',false,now() from public.pi_concurrent_fixture union all select person,'concurrent-person@example.invalid',false,now() from public.pi_concurrent_fixture;
    insert into public.profiles(id,display_name) select admin,'Admin' from public.pi_concurrent_fixture union all select person,'Person' from public.pi_concurrent_fixture;
    insert into public.barbershops(id,name) select shop,'Concurrent shop' from public.pi_concurrent_fixture;
    insert into public.barbershop_memberships(user_id,barbershop_id,role,status) select admin,shop,'administrator','active' from public.pi_concurrent_fixture;
    insert into private.barbershop_ownership(barbershop_id,owner_user_id,created_by,source) select shop,admin,admin,'new-shop' from public.pi_concurrent_fixture;
    insert into public.staff_invitations(id,barbershop_id,recipient_user_id,inviter_user_id) select invitation,shop,person,admin from public.pi_concurrent_fixture;
    commit;
  `,
  );
  const concurrentQuery = `begin; select set_config('request.jwt.claim.sub',(select admin::text from public.pi_concurrent_fixture),true); select set_config('request.jwt.claims',jsonb_build_object('sub',(select admin from public.pi_concurrent_fixture),'role','authenticated')::text,true); select public.remind_professional_invitation(shop,invitation)->>'created' from public.pi_concurrent_fixture; select pg_sleep(0.4); commit;`;
  const concurrentRun = () =>
    new Promise((resolve, reject) => {
      const child = spawn(
        docker,
        [
          'exec',
          '-i',
          id,
          'psql',
          '-X',
          '-h',
          '/tmp',
          '-U',
          'postgres',
          '-d',
          'postgres',
          '-v',
          'ON_ERROR_STOP=1',
          '-At',
        ],
        { stdio: ['pipe', 'pipe', 'pipe'] },
      );
      let stdout = '',
        stderr = '';
      const timer = setTimeout(() => {
        child.kill();
        reject(Error('CONCURRENCY_TIMEOUT'));
      }, 15000);
      child.stdout.on('data', (d) => (stdout += d));
      child.stderr.on('data', (d) => (stderr += d));
      child.on('error', reject);
      child.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) resolve(stdout);
        else reject(Error(stderr.slice(0, 2000)));
      });
      child.stdin.end(concurrentQuery);
    });
  const concurrentResults = await Promise.all([
    concurrentRun(),
    concurrentRun(),
  ]);
  fs.writeFileSync(
    path.join(output, 'concurrency.log'),
    concurrentResults.join('\n---\n'),
  );
  const created = concurrentResults.filter((v) => /^true$/m.test(v)).length;
  const suppressed = concurrentResults.filter((v) => /^false$/m.test(v)).length;
  assert.equal(created, 1);
  assert.equal(suppressed, 1);
  const count = Number(
    sql(
      'concurrency-count',
      "select count(*) from private.web_notifications n join public.pi_concurrent_fixture f on f.invitation=n.resource_id where n.source_key like 'invitation-reminder:%';",
    ).trim(),
  );
  assert.equal(count, 1);
  report.concurrency = { created, suppressed, notices: count };
  report.status = 'passed';
  save();
  console.log(
    JSON.stringify({
      status: report.status,
      assertions: report.assertions,
      report: path.join(output, 'report.json'),
    }),
  );
} catch (e) {
  report.status = 'failed';
  report.error = e.message;
  save();
  console.error(report.error);
  process.exitCode = 1;
} finally {
  if (id) {
    const info = JSON.parse(run(['inspect', id]))[0];
    assert.equal(info.Name, '/' + name);
    assert.equal(
      info.Config.Labels['barbexa.phase'],
      'pending-invitations-rehearsal',
    );
    run(['rm', '-f', id]);
    report.removed = true;
    save();
  }
}
