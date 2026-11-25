import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import crypto from 'node:crypto';
const docker = path.join(
  process.env.LOCALAPPDATA,
  'Programs/DockerDesktop/resources/bin/docker.exe',
);
const name = `barbexa-notifications-${Date.now()}`;
const output = path.resolve('.artifacts', name);
fs.mkdirSync(output, { recursive: true });
const report = {
  name,
  network: 'none',
  cloudAccess: false,
  localPrincipalAccess: false,
  steps: [],
  status: 'running',
};
const save = () =>
  fs.writeFileSync(
    path.join(output, 'report.json'),
    JSON.stringify(report, null, 2),
  );
function command(args, input) {
  const r = spawnSync(docker, args, {
    input,
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.status !== 0)
    throw Error(
      (r.stderr || r.stdout || r.error?.message || 'DOCKER_FAILED').slice(
        0,
        4000,
      ),
    );
  return r.stdout;
}
let id;
function sql(label, input) {
  const r = spawnSync(
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
    { input, encoding: 'utf8', timeout: 60000, maxBuffer: 2 * 1024 * 1024 },
  );
  report.steps.push({ label, exit: r.status });
  save();
  if (r.status !== 0) {
    fs.writeFileSync(path.join(output, 'sql-error.log'), r.stderr);
    throw Error(`${label}: ${r.stderr.slice(0, 2000)}`);
  }
  fs.writeFileSync(path.join(output, `${label}.log`), r.stdout);
  console.log(JSON.stringify({ step: label, passed: true }));
  return r.stdout;
}
try {
  id = command([
    'run',
    '-d',
    '--pull=never',
    '--name',
    name,
    '--label',
    'barbexa.phase=notifications-rehearsal',
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
  const inspection = JSON.parse(command(['inspect', id]))[0];
  assert.equal(inspection.Name, '/' + name);
  assert.equal(inspection.HostConfig.NetworkMode, 'none');
  assert.equal(Object.keys(inspection.HostConfig.PortBindings ?? {}).length, 0);
  assert.ok(inspection.Mounts.every((m) => m.Type === 'tmpfs'));
  report.id = id;
  save();
  for (let i = 0; i < 40; i++) {
    const r = spawnSync(
      docker,
      ['exec', id, 'pg_isready', '-h', '/tmp', '-U', 'postgres'],
      { encoding: 'utf8' },
    );
    if (r.status === 0) break;
    await new Promise((r) => setTimeout(r, 250));
  }
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
  assert.equal(migrations.length, 18);
  report.originals = migrations.map((file) => ({
    file,
    sha256: crypto
      .createHash('sha256')
      .update(fs.readFileSync('supabase/migrations/' + file))
      .digest('hex'),
  }));
  save();
  for (const file of migrations)
    sql(
      file.slice(0, 14),
      fs.readFileSync('supabase/migrations/' + file, 'utf8'),
    );
  sql(
    'notifications',
    fs.readFileSync(
      'specs/012-notificaciones-web/contracts/notifications.sql',
      'utf8',
    ),
  );
  sql(
    'functional',
    fs.readFileSync(
      'specs/012-notificaciones-web/contracts/rehearsal-tests.sql',
      'utf8',
    ),
  );
  sql(
    'business-rpc',
    fs.readFileSync(
      'specs/012-notificaciones-web/contracts/rehearsal-business.sql',
      'utf8',
    ),
  );
  const concurrent = Array.from(
    { length: 8 },
    (_, i) =>
      new Promise((resolve, reject) => {
        const child = spawn(
          docker,
          [
            'exec',
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
            '-c',
            "select private.web_notice_reservation('00000000-0000-4000-8000-000000000021','concurrent-same-event','Prueba concurrente');",
          ],
          { stdio: 'ignore' },
        );
        child.on('error', reject);
        child.on('exit', (code) =>
          code === 0 ? resolve() : reject(Error(`CONCURRENT_${i}_FAILED`)),
        );
      }),
  );
  await Promise.all(concurrent);
  sql(
    'final',
    "do $$ begin if (select count(*) from private.web_notifications where source_key='concurrent-same-event')<>3 then raise exception 'DUPLICATE_CONCESSIONS';end if;end $$;select version();",
  );
  for (const f of report.originals)
    assert.equal(
      crypto
        .createHash('sha256')
        .update(fs.readFileSync('supabase/migrations/' + f.file))
        .digest('hex'),
      f.sha256,
    );
  report.status = 'passed';
  save();
  const cleanup = JSON.parse(command(['inspect', id]))[0];
  assert.equal(
    cleanup.Config.Labels['barbexa.phase'],
    'notifications-rehearsal',
  );
  assert.equal(cleanup.Name, '/' + name);
  command(['rm', '-f', id]);
  report.removed = true;
  save();
  console.log(
    JSON.stringify({
      status: report.status,
      report: path.join(output, 'report.json'),
      removed: true,
    }),
  );
} catch (e) {
  report.status = 'failed';
  report.error = String(e.message);
  save();
  console.error(report.error);
  process.exitCode = 1;
}
