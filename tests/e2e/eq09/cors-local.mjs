// Configuración temporal de CORS solo en Edge Runtime del laboratorio; restaurable sin borrar contenedores.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { ownedLab, root } from '../../../k6/lib/lab-client.mjs';
const action = process.argv[2];
if (!['--apply-local-only', '--restore-local-only'].includes(action))
  throw Error('EXPLICIT_LOCAL_CORS_OPERATION_REQUIRED');
const pointer = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(pointer.manifest));
const env = ownedLab({ recordBaseline: false });
assert.equal(env.sql('select run_id from private.k6_lab_marker;'), m.marker);
const name = 'supabase_edge_runtime_barbexa-k6-lab';
const stateFile = path.join(m.dir, 'cors-container-state.json');
const docker = (args) => {
  const r = spawnSync('docker', args, {
    encoding: 'utf8',
    timeout: 45000,
    maxBuffer: 8 * 1024 ** 2,
  });
  if (r.status !== 0) throw Error('EQ09_DOCKER_OPERATION_FAILED');
  return r.stdout.trim();
};
const inspect = (id) => JSON.parse(docker(['inspect', id]))[0];
const integrity = () =>
  JSON.parse(
    env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
  );
const health = async () => {
  for (let i = 0; i < 20; i++) {
    try {
      if (
        (await env.request('/functions/v1/_internal/health', { method: 'GET' }))
          .status === 200
      )
        return;
    } catch {}
    await wait(1000);
  }
  throw Error('EQ09_EDGE_HEALTH_FAILED');
};
if (action === '--restore-local-only') {
  const s = JSON.parse(fs.readFileSync(stateFile));
  if (s.restored) {
    assert.equal(inspect(name).Id, s.oldId);
    console.log('Original Edge Runtime already restored.');
    process.exit(0);
  }
  assert.equal(inspect(name).Id, s.newId);
  docker(['stop', '--time', '30', s.newId]);
  const kept = name + '_eq09_completed_' + m.id.slice(0, 8);
  docker(['rename', s.newId, kept]);
  docker(['rename', s.oldId, name]);
  docker(['start', s.oldId]);
  await health();
  assert.deepEqual(inspect(name).Config.Env, s.old.Config.Env);
  assert.deepEqual(inspect(name).Config.Cmd, s.old.Config.Cmd);
  s.restored = true;
  s.completedContainerName = kept;
  s.restoredAt = new Date().toISOString();
  fs.writeFileSync(stateFile, JSON.stringify(s, null, 2) + '\n');
  console.log(
    JSON.stringify({
      restored: true,
      originalContainer: s.oldId,
      oneshot: true,
      temporaryContainerPreservedStopped: true,
      health: 200,
    }),
  );
  process.exit(0);
}
if (fs.existsSync(stateFile)) {
  const s = JSON.parse(fs.readFileSync(stateFile));
  assert.ok(!s.restored, 'ALREADY_COMPLETED_REVIEW_BEFORE_REAPPLY');
  assert.equal(inspect(name).Id, s.newId);
  const probe = async (origin) => {
    const r = await fetch(
      m.backendOrigin + '/functions/v1/reservation-command',
      {
        method: 'POST',
        headers: {
          apikey: m.publicKey,
          Authorization: 'Bearer ' + m.accounts[2].session.access_token,
          'Content-Type': 'application/json',
          Origin: origin,
        },
        body: JSON.stringify({
          action: 'care',
          command: 'payment-options',
          barbershopId: m.shop,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    return {
      status: r.status,
      cors: r.headers.get('access-control-allow-origin'),
    };
  };
  const allowed = await probe('http://localhost:8081'),
    denied = await probe('http://unapproved.invalid');
  assert.equal(allowed.status, 200);
  assert.ok(['*', 'http://localhost:8081'].includes(allowed.cors));
  assert.equal(denied.status, 403);
  assert.deepEqual(integrity(), s.before);
  s.applied = true;
  s.probes = { allowed, denied };
  fs.writeFileSync(stateFile, JSON.stringify(s, null, 2) + '\n');
  console.log(
    JSON.stringify({
      applied: true,
      allowedStatus: 200,
      deniedStatus: 403,
      gatewayCors: allowed.cors,
      oneshot: true,
      integrityUnchanged: true,
    }),
  );
  process.exit(0);
}
const old = inspect(name);
assert.ok(old.State.Running);
assert.equal(old.HostConfig.AutoRemove, false);
assert.ok(old.Config.Cmd.join(' ').includes('--policy=oneshot'));
assert.equal(old.HostConfig.NetworkMode, 'supabase_network_barbexa-k6-lab');
assert.equal(
  old.Config.Env.filter((v) => v.startsWith('BARBERIA_ALLOWED_ORIGINS='))
    .length,
  0,
);
const others = JSON.parse(
  docker([
    'inspect',
    ...['db', 'auth', 'rest', 'kong', 'inbucket'].map(
      (n) => 'supabase_' + n + '_barbexa-k6-lab',
    ),
  ]),
);
const before = integrity();
const bootstrap = path.join(m.dir, 'edge-bootstrap-before.ts');
docker(['cp', old.Id + ':/root/index.ts', bootstrap]);
const context = JSON.parse(docker(['context', 'inspect']))[0].Endpoints.docker
  .Host;
const pipe = /^npipe:\/{4}\.\/pipe\/([A-Za-z0-9_-]+)$/.exec(context);
assert.ok(pipe, 'ONLY_LOCAL_DOCKER_PIPE');
const socketPath = '\\\\.\\pipe\\' + pipe[1];
const api = (method, url, data) =>
  new Promise((resolve, reject) => {
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
        res.on('end', () =>
          res.statusCode >= 200 && res.statusCode < 300
            ? resolve(text ? JSON.parse(text) : null)
            : reject(Error('DOCKER_API_HTTP_' + res.statusCode)),
        );
      },
    );
    req.on('error', reject);
    req.setTimeout(45000, () => req.destroy(Error('DOCKER_LOCAL_TIMEOUT')));
    req.end(body);
  });
const prefix = '/v' + (await api('GET', '/version')).ApiVersion;
const backupName = name + '_before_eq09_cors_' + m.id.slice(0, 8);
const s = {
  oldId: old.Id,
  old,
  backupName,
  before,
  applied: false,
  restored: false,
};
fs.writeFileSync(stateFile, JSON.stringify(s, null, 2) + '\n');
docker(['stop', '--time', '30', old.Id]);
docker(['rename', old.Id, backupName]);
const made = await api('POST', prefix + '/containers/create?name=' + name, {
  ...old.Config,
  Image: old.Image,
  Env: [...old.Config.Env, 'BARBERIA_ALLOWED_ORIGINS=http://localhost:8081'],
  HostConfig: old.HostConfig,
  NetworkingConfig: {
    EndpointsConfig: Object.fromEntries(
      Object.entries(old.NetworkSettings.Networks).map(([n, v]) => [
        n,
        { Aliases: v.Aliases, DriverOpts: v.DriverOpts },
      ]),
    ),
  },
});
s.newId = made.Id;
fs.writeFileSync(stateFile, JSON.stringify(s, null, 2) + '\n');
docker(['cp', bootstrap, made.Id + ':/root/index.ts']);
await api('POST', prefix + '/containers/' + made.Id + '/start');
await health();
const current = inspect(name);
assert.equal(current.Image, old.Image);
assert.deepEqual(current.HostConfig, old.HostConfig);
assert.deepEqual(current.Config.Cmd, old.Config.Cmd);
assert.deepEqual(
  current.Config.Env.filter((v) => !v.startsWith('BARBERIA_ALLOWED_ORIGINS=')),
  old.Config.Env,
);
const mounts = (c) =>
  c.Mounts.map((x) => [x.Type, x.Name ?? x.Source, x.Destination, x.RW]).sort(
    (a, b) => a[2].localeCompare(b[2]),
  );
assert.deepEqual(mounts(current), mounts(old));
for (const previous of others) {
  const c = inspect(previous.Id);
  assert.ok(c.State.Running);
  assert.equal(c.State.StartedAt, previous.State.StartedAt);
}
assert.deepEqual(integrity(), before);
const token = m.accounts[2].session.access_token;
const probe = async (origin) => {
  const r = await fetch(m.backendOrigin + '/functions/v1/reservation-command', {
    method: 'POST',
    headers: {
      apikey: m.publicKey,
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Origin: origin,
    },
    body: JSON.stringify({
      action: 'care',
      command: 'payment-options',
      barbershopId: m.shop,
    }),
    signal: AbortSignal.timeout(10000),
  });
  return {
    status: r.status,
    cors: r.headers.get('access-control-allow-origin'),
  };
};
const allowed = await probe('http://localhost:8081'),
  denied = await probe('http://unapproved.invalid');
assert.equal(allowed.status, 200);
assert.ok(['*', 'http://localhost:8081'].includes(allowed.cors));
assert.equal(denied.status, 403);
s.applied = true;
s.appliedAt = new Date().toISOString();
s.probes = { allowed, denied };
s.bootstrapSha256 = createHash('sha256')
  .update(fs.readFileSync(bootstrap))
  .digest('hex');
fs.writeFileSync(stateFile, JSON.stringify(s, null, 2) + '\n');
console.log(
  JSON.stringify({
    applied: true,
    allowedOrigin: 'http://localhost:8081',
    allowedStatus: 200,
    unapprovedOriginStatus: 403,
    oneshot: true,
    otherFiveServicesUnchanged: true,
    integrityUnchanged: true,
    originalContainerKept: true,
  }),
);
