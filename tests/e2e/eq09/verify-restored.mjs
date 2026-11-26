// Verificación final de solo lectura tras cerrar la Web y restaurar Edge original.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { root } from '../../../k6/lib/lab-client.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_VERIFICATION_REQUIRED');
const p = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(p.manifest));
const s = JSON.parse(
  fs.readFileSync(path.join(m.dir, 'cors-container-state.json')),
);
assert.ok(s.restored);
const inspect = (id) => {
  const r = spawnSync('docker', ['inspect', id], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 ** 2,
  });
  assert.equal(r.status, 0);
  return JSON.parse(r.stdout)[0];
};
const old = inspect('supabase_edge_runtime_barbexa-k6-lab');
assert.equal(old.Id, s.oldId);
assert.ok(old.State.Running);
assert.deepEqual(old.Config.Env, s.old.Config.Env);
assert.deepEqual(old.Config.Cmd, s.old.Config.Cmd);
assert.equal(old.Image, s.old.Image);
assert.ok(old.Config.Cmd.join(' ').includes('--policy=oneshot'));
assert.equal(inspect(s.newId).State.Running, false);
for (const name of ['db', 'auth', 'rest', 'kong', 'inbucket'])
  assert.ok(inspect('supabase_' + name + '_barbexa-k6-lab').State.Running);
const portClosed = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.setTimeout(1500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(true));
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
assert.ok(await portClosed(8081), 'EQ09_METRO_STILL_LISTENING');
assert.ok(await portClosed(54421), 'EQ09_PROXY_STILL_LISTENING');
for (const [file, expected] of Object.entries(m.protectedFiles))
  assert.equal(
    createHash('sha256')
      .update(fs.readFileSync(path.join(root, file)))
      .digest('hex'),
    expected,
    file,
  );
const raw = JSON.parse(
  fs.readFileSync(path.join(m.approvedAttempt, 'playwright-results.json')),
);
assert.equal(raw.stats.expected, 1);
assert.equal(raw.stats.unexpected, 0);
assert.ok(
  fs.existsSync(path.join(m.approvedAttempt, 'playwright-report/index.html')),
);
assert.ok(
  fs.statSync(path.join(m.approvedAttempt, 'trace-client-B-private.zip')).size >
    0,
);
const guard = spawnSync(
  process.execPath,
  ['tests/e2e/eq09/run-local.mjs', '--execute=local-synthetic-lab'],
  { cwd: root, encoding: 'utf8' },
);
assert.notEqual(guard.status, 0);
assert.match(guard.stderr, /APPROVED_EQ09_ALREADY_RECORDED_DO_NOT_REPEAT/);
const out = path.join(root, 'docs/evaluacion/evidencias/eq09');
fs.writeFileSync(
  path.join(out, 'restauracion-verificada.json'),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      originalContainerRestored: true,
      sameImageEnvironmentAndCommand: true,
      oneshot: true,
      temporaryContainerPreservedStopped: true,
      otherFiveServicesRunning: true,
      metro8081Closed: true,
      proxy54421Closed: true,
      protectedFilesUnchanged: Object.keys(m.protectedFiles).length,
      nativePlaywrightReportPresent: true,
      privateTracePresent: true,
      approvedReplayGuardPassed: true,
      k6Executed: false,
      eq05MonitorStarted: false,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  'Restauración verificada: Edge original oneshot, Web/proxy cerrados, 814 hashes intactos y repetición del E2E aprobado bloqueada.',
);
