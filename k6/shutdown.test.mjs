import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fork } from 'node:child_process';
import { createShutdown, reserveControlAddress } from './lib/shutdown.mjs';

function child() {
  const c = new EventEmitter();
  c.pid = 123;
  c.exitCode = null;
  c.signalCode = null;
  c.kills = 0;
  c.kill = () => {
    c.kills++;
    c.signalCode = 'SIGKILL';
    c.emit('exit', null, 'SIGKILL');
  };
  return c;
}
async function server(t, handler) {
  const s = http.createServer(handler);
  await new Promise((resolve) => s.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => s.close(resolve)));
  return `127.0.0.1:${s.address().port}`;
}
test('supervisor asks for stop over loopback, waits for export and never kills the orderly child', async (t) => {
  const c = child();
  let exported = false;
  let calls = 0;
  const address = await server(t, (req, res) => {
    calls++;
    assert.equal(req.method, 'PATCH');
    assert.equal(req.url, '/v1/status');
    let body = '';
    req.on('data', (b) => (body += b));
    req.on('end', () => {
      assert.deepEqual(JSON.parse(body), {
        data: { type: 'status', id: 'default', attributes: { stopped: true } },
      });
      res.end('{}');
      setTimeout(() => {
        exported = true;
        c.exitCode = 0;
        c.emit('exit', 0, null);
      }, 20);
    });
  });
  const control = createShutdown(c, address, {
    graceMs: 500,
    ownsPort: async () => true,
  });
  await Promise.all([
    control.stop('RESOURCE_SAFETY_LIMIT'),
    control.stop('MONITORING_UNAVAILABLE'),
  ]);
  assert.equal(exported, true);
  assert.equal(c.kills, 0);
  assert.equal(calls, 1);
  assert.equal(control.snapshot().reason, 'RESOURCE_SAFETY_LIMIT');
  assert.equal(control.snapshot().apiAcknowledged, true);
});
test('unresponsive API retains a bounded forced stop and records missing graceful closure', async (t) => {
  const c = child();
  const address = await server(t, (_req, res) => {
    res.statusCode = 503;
    res.end();
  });
  const control = createShutdown(c, address, {
    graceMs: 80,
    requestTimeoutMs: 20,
    ownsPort: async () => true,
  });
  await control.stop('RESOURCE_SAFETY_LIMIT');
  assert.equal(c.kills, 1);
  assert.equal(control.snapshot().forced, true);
  assert.equal(control.snapshot().apiAcknowledged, false);
});
test('critical pressure shortens the shutdown deadline, even after an earlier sustained warning', async (t) => {
  const c = child();
  const address = await server(t, (_req, res) => {
    res.statusCode = 503;
    res.end();
  });
  const control = createShutdown(c, address, {
    graceMs: 1000,
    criticalGraceMs: 30,
    ownsPort: async () => true,
  });
  const at = Date.now();
  const p = control.stop('RESOURCE_SAFETY_LIMIT');
  await control.stop('RESOURCE_SAFETY_LIMIT', { critical: true });
  await p;
  assert.ok(Date.now() - at < 800);
  assert.equal(c.kills, 1);
});
test('foreign address or port owner never receives the stop request', async (t) => {
  assert.throws(() => createShutdown(child(), 'example.com:6565'), /LOOPBACK/);
  const c = child();
  let calls = 0;
  const address = await server(t, (_req, res) => {
    calls++;
    res.end();
  });
  const control = createShutdown(c, address, {
    graceMs: 40,
    ownsPort: async () => false,
  });
  await control.stop('RESOURCE_SAFETY_LIMIT');
  assert.equal(calls, 0);
  assert.equal(c.kills, 1);
});
test('control address allocation stays on IPv4 loopback', async () => {
  assert.match(await reserveControlAddress(), /^127\.0\.0\.1:\d+$/);
});
test('failure writing diagnostic evidence cannot suppress the safety stop', async (t) => {
  const c = child();
  const address = await server(t, (_req, res) => {
    res.statusCode = 503;
    res.end();
  });
  const control = createShutdown(c, address, {
    graceMs: 40,
    ownsPort: async () => true,
    onChange: () => {
      throw Error('disk full');
    },
  });
  await control.stop('RESOURCE_SAFETY_LIMIT');
  assert.equal(c.kills, 1);
  assert.equal(control.snapshot().evidenceWriteFailed, true);
});
test(
  'real Node child exports a file before exiting, with actual Windows port ownership verification',
  { timeout: 15000 },
  async (t) => {
    const dir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'barbexa-shutdown-test-'),
    );
    const output = path.join(dir, 'supervisor-test-export.json');
    const c = fork(
      new URL('./test-fixtures/control-child.mjs', import.meta.url),
      [output],
      { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] },
    );
    t.after(() => {
      if (c.exitCode === null && c.signalCode === null) c.kill('SIGKILL');
      if (
        path.dirname(dir) !== os.tmpdir() ||
        !path.basename(dir).startsWith('barbexa-shutdown-test-')
      )
        throw Error('UNSAFE_TEST_CLEANUP');
      fs.rmSync(dir, { recursive: true });
    });
    const address = await new Promise((resolve, reject) => {
      c.once('message', resolve);
      c.once('error', reject);
    });
    const control = createShutdown(c, address);
    await control.stop('RESOURCE_SAFETY_LIMIT');
    assert.equal(control.snapshot().apiAcknowledged, true);
    assert.equal(control.snapshot().forced, false);
    assert.deepEqual(JSON.parse(fs.readFileSync(output)), {
      supervisorFixture: true,
      performanceEvidence: false,
      exportedBeforeExit: true,
    });
  },
);
