// Isolated lab operation explicitly authorized by the responsible user. No k6.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { ownedLab, lab, root } from './lib/lab-client.mjs';
if (
  process.argv.length !== 3 ||
  process.argv[2] !== '--apply-authorized-local-only'
)
  throw Error('EXPLICIT_LAB_SERVICE_AUTHORIZATION_REQUIRED');
const env = ownedLab({ recordBaseline: false });
const docker = (args) => {
  const r = spawnSync('docker', args, {
    encoding: 'utf8',
    timeout: 45000,
    maxBuffer: 8 * 1024 ** 2,
  });
  if (r.status !== 0) throw Error('LAB_DOCKER_OPERATION_FAILED');
  return r.stdout.trim();
};
const name = 'supabase_edge_runtime_barbexa-k6-lab';
const old = JSON.parse(docker(['inspect', name]))[0];
assert.equal(old.Name, '/' + name);
assert.ok(old.State.Running);
assert.equal(old.HostConfig.AutoRemove, false);
assert.ok(
  old.Config.Cmd.join(' ').includes('--policy=per_worker'),
  'ONLY_REVIEWED_SOURCE_POLICY',
);
assert.equal(old.HostConfig.NetworkMode, 'supabase_network_barbexa-k6-lab');
const context = JSON.parse(docker(['context', 'inspect']))[0].Endpoints.docker
  .Host;
const pipe = /^npipe:\/{4}\.\/pipe\/([A-Za-z0-9_-]+)$/.exec(context);
assert.ok(pipe, 'ONLY_LOCAL_DOCKER_PIPE');
const socketPath = '\\\\.\\pipe\\' + pipe[1];
async function api(method, url, data) {
  return await new Promise((resolve, reject) => {
    const body = data === undefined ? undefined : JSON.stringify(data);
    const req = http.request(
      {
        socketPath,
        path: url,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      (res) => {
        let text = '';
        res.on('data', (b) => (text += b));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300)
            return reject(Error('DOCKER_API_HTTP_' + res.statusCode));
          resolve(text ? JSON.parse(text) : null);
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(45000, () => req.destroy(Error('LOCAL_DOCKER_API_TIMEOUT')));
    req.end(body);
  });
}
const version = (await api('GET', '/version')).ApiVersion;
const prefix = '/v' + version;
const stamp = new Date().toISOString().replaceAll(':', '-'),
  backupName = name + '_before_oneshot_' + stamp.replaceAll('.', '-');
const backup = path.join(lab, 'edge-policy-backups', stamp);
fs.mkdirSync(backup, { recursive: true });
assert.equal(
  spawnSync('git', [
    'check-ignore',
    '--quiet',
    '--',
    path.join(backup, 'container-before.json'),
  ]).status,
  0,
);
fs.writeFileSync(
  path.join(backup, 'container-before.json'),
  JSON.stringify(old, null, 2),
  { flag: 'wx' },
);
const configFile = path.join(lab, 'supabase/config.toml'),
  configBefore = fs.readFileSync(configFile, 'utf8');
fs.writeFileSync(path.join(backup, 'config-before.toml'), configBefore, {
  flag: 'wx',
});
docker(['cp', old.Id + ':/root/index.ts', path.join(backup, 'index.ts')]);
const hash = (f) =>
  createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const bootstrapHash = hash(path.join(backup, 'index.ts'));
const others = JSON.parse(
  docker([
    'inspect',
    ...['db', 'auth', 'rest', 'kong', 'inbucket'].map(
      (n) => 'supabase_' + n + '_barbexa-k6-lab',
    ),
  ]),
);
const integrity = () =>
  JSON.parse(
    env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
  );
const before = integrity();
assert.equal(before.reservations, 1349);
let renamed = false,
  newId = null,
  configChanged = false;
try {
  console.log(
    'Deteniendo solo Edge Runtime del laboratorio; contenedor y volúmenes conservados.',
  );
  docker(['stop', '--time', '30', old.Id]);
  docker(['rename', old.Id, backupName]);
  renamed = true;
  const networks = Object.fromEntries(
    Object.entries(old.NetworkSettings.Networks).map(([n, v]) => [
      n,
      { Aliases: v.Aliases, DriverOpts: v.DriverOpts },
    ]),
  );
  const create = {
    ...old.Config,
    Image: old.Image,
    Cmd: old.Config.Cmd.map((s) =>
      s.replace('--policy=per_worker', '--policy=oneshot'),
    ),
    HostConfig: old.HostConfig,
    NetworkingConfig: { EndpointsConfig: networks },
  };
  const made = await api(
    'POST',
    prefix + '/containers/create?name=' + encodeURIComponent(name),
    create,
  );
  newId = made.Id;
  docker(['cp', path.join(backup, 'index.ts'), newId + ':/root/index.ts']);
  await api('POST', prefix + '/containers/' + newId + '/start');
  console.log(
    'Edge Runtime oneshot iniciado; comprobando salud y configuración.',
  );
  let healthy = false;
  for (let i = 0; i < 25; i++) {
    try {
      if (
        (await env.request('/functions/v1/_internal/health', { method: 'GET' }))
          .status === 200
      ) {
        healthy = true;
        break;
      }
    } catch {}
    await wait(2000);
  }
  assert.ok(healthy, 'NEW_RUNTIME_NOT_HEALTHY');
  const fresh = ownedLab({ recordBaseline: false });
  const current = JSON.parse(docker(['inspect', name]))[0];
  assert.equal(current.Image, old.Image);
  assert.deepEqual(current.Config.Env, old.Config.Env);
  assert.equal(current.HostConfig.Memory, old.HostConfig.Memory);
  assert.equal(current.HostConfig.NanoCpus, old.HostConfig.NanoCpus);
  const mounts = (c) =>
    c.Mounts.map((m) => [m.Type, m.Name ?? m.Source, m.Destination, m.RW]).sort(
      (a, b) => a[2].localeCompare(b[2]),
    );
  assert.deepEqual(mounts(current), mounts(old));
  docker([
    'cp',
    newId + ':/root/index.ts',
    path.join(backup, 'index-after.ts'),
  ]);
  assert.equal(hash(path.join(backup, 'index-after.ts')), bootstrapHash);
  const m = JSON.parse(
    fs.readFileSync(
      path.join(
        lab,
        'complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed/manifest.json',
      ),
    ),
  );
  const f = JSON.parse(
    fs.readFileSync(
      path.join(
        lab,
        'complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed',
        'fixtures-25-retry-' + m.retry.id + '.json',
      ),
    ),
  );
  const invalid = await fresh.request('/functions/v1/reservation-command', {
    token: f.actors[0].token,
    body: {},
  });
  assert.equal(invalid.status, 400, 'REAL_HANDLER_INVALID_INPUT_PROBE');
  assert.deepEqual(integrity(), before);
  const unchanged = JSON.parse(docker(['inspect', ...others.map((c) => c.Id)]));
  for (let i = 0; i < others.length; i++) {
    assert.equal(unchanged[i].State.StartedAt, others[i].State.StartedAt);
    assert.equal(unchanged[i].RestartCount, others[i].RestartCount);
    assert.ok(unchanged[i].State.Running);
  }
  assert.equal(fs.readFileSync(configFile, 'utf8'), configBefore);
  const section = /\[edge_runtime\][\s\S]*?(?=\r?\n\[|$)/.exec(configBefore)[0];
  assert.ok(section.includes('policy = "per_worker"'));
  fs.writeFileSync(
    configFile,
    configBefore.replace(
      section,
      section.replace('policy = "per_worker"', 'policy = "oneshot"'),
    ),
  );
  configChanged = true;
  const report = {
    at: new Date().toISOString(),
    applied: true,
    oldPolicy: 'per_worker',
    newPolicy: 'oneshot',
    oldContainer: old.Id,
    oldContainerBackupName: backupName,
    oldContainerStopped: !JSON.parse(docker(['inspect', old.Id]))[0].State
      .Running,
    newContainer: newId,
    image: old.Config.Image,
    sameImageDigest: true,
    sameVolumesAndBinds: true,
    sameEnvironment: true,
    sameBootstrap: true,
    workerCpuMemoryWallClockLimitsUnchanged: true,
    otherFiveServicesUnchanged: true,
    health: 200,
    invalidInputProbe: invalid.status,
    businessRowsUnchanged: true,
    integrity: before,
    k6Executed: false,
    coldWorkerStartupIncludedInFutureMeasurements: true,
  };
  fs.writeFileSync(
    path.join(backup, 'result.json'),
    JSON.stringify(report, null, 2),
  );
  fs.writeFileSync(
    path.join(
      root,
      'docs/evaluacion/evidencias/004-reservas/sprint2-closure/edge-oneshot.json',
    ),
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(
    'No se validó el nuevo runtime; restaurando el anterior sin eliminar contenedores.',
  );
  if (newId) {
    try {
      docker(['stop', '--time', '15', newId]);
      docker([
        'rename',
        newId,
        name + '_failed_oneshot_' + stamp.replaceAll('.', '-'),
      ]);
    } catch {}
  }
  if (renamed) {
    docker(['rename', old.Id, name]);
    docker(['start', old.Id]);
  }
  if (configChanged) fs.writeFileSync(configFile, configBefore);
  fs.writeFileSync(
    path.join(backup, 'rollback.json'),
    JSON.stringify({
      at: new Date().toISOString(),
      error: error.message,
      oldContainerRestored: renamed,
      newContainerPreserved: newId,
    }),
  );
  throw error;
}
