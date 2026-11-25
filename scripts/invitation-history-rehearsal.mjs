// Authorized 015 rehearsal. Disposable, no network, ports or host data mounts.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const docker = path.join(
  process.env.LOCALAPPDATA,
  'Programs/DockerDesktop/resources/bin/docker.exe',
);
const name = `barbexa-invitation-history-${Date.now()}`;
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
    'barbexa.phase=invitation-history-rehearsal',
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
  assert.equal(migrations.length, 22);
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
    'invitation-history-tests',
    fs.readFileSync(
      'supabase/tests/professional-invitation-history.test.sql',
      'utf8',
    ),
  );
  report.assertions = (tests.match(/^ok \d+/gm) ?? []).length;
  assert.ok(report.assertions >= 13);
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
      'invitation-history-rehearsal',
    );
    run(['rm', '-f', id]);
    report.removed = true;
    save();
  }
}
