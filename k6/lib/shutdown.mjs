import http from 'node:http';
import net from 'node:net';
import { execFile } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

function portOf(address) {
  const m = /^127\.0\.0\.1:(\d+)$/.exec(address);
  if (!m || +m[1] < 1024 || +m[1] > 65535)
    throw Error('ONLY_LOOPBACK_CONTROL_ALLOWED');
  return +m[1];
}
export async function reserveControlAddress() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = `127.0.0.1:${server.address().port}`;
  await new Promise((resolve, reject) =>
    server.close((e) => (e ? reject(e) : resolve())),
  );
  return address;
}
export function ownsControlPort(child, address) {
  const port = portOf(address);
  if (process.platform !== 'win32') return Promise.resolve(true);
  if (!Number.isSafeInteger(child.pid) || child.pid <= 0)
    return Promise.resolve(false);
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) -join ','`,
      ],
      { timeout: 2000, windowsHide: true },
      (error, stdout) => {
        const owners = stdout.trim().split(',').filter(Boolean);
        resolve(
          !error && owners.length > 0 && owners.every((v) => +v === child.pid),
        );
      },
    );
  });
}
function requestStop(address, timeout) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: portOf(address),
        path: '/v1/status',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Connection: 'close' },
      },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      },
    );
    req.on('error', () => resolve(false));
    req.setTimeout(timeout, () => req.destroy());
    req.end(
      JSON.stringify({
        data: { type: 'status', id: 'default', attributes: { stopped: true } },
      }),
    );
  });
}
export function createShutdown(
  child,
  address,
  {
    graceMs = 10000,
    criticalGraceMs = 2500,
    requestTimeoutMs = 750,
    ownsPort = ownsControlPort,
    onChange = () => {},
  } = {},
) {
  portOf(address);
  let exited = child.exitCode !== null || child.signalCode !== null;
  let resolveExit;
  const finished = new Promise((resolve) => {
    resolveExit = resolve;
  });
  let timer,
    deadline = Infinity,
    pending;
  const state = {
    requestedAt: null,
    reason: null,
    method: 'loopback-rest-api',
    apiAcknowledged: false,
    forced: false,
    exitedAt: null,
  };
  const publish = () => {
    try {
      onChange({ ...state });
    } catch {
      state.evidenceWriteFailed = true;
    }
  };
  const exit = () => {
    if (exited && state.exitedAt) return;
    exited = true;
    clearTimeout(timer);
    state.exitedAt = new Date().toISOString();
    publish();
    resolveExit();
  };
  child.once('exit', exit);
  child.once('error', exit);
  if (exited) exit();
  function arm(ms) {
    if (exited || Date.now() + ms >= deadline) return;
    deadline = Date.now() + ms;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!exited) {
        state.forced = true;
        publish();
        child.kill('SIGKILL');
      }
    }, ms);
  }
  return {
    snapshot: () => ({ ...state }),
    stop(reason, { critical = false } = {}) {
      if (exited) return finished;
      if (!state.requestedAt) {
        state.requestedAt = new Date().toISOString();
        state.reason = reason;
        publish();
      }
      arm(critical ? criticalGraceMs : graceMs);
      pending ||= (async () => {
        while (!exited && Date.now() < deadline && !state.apiAcknowledged) {
          let owned = false;
          try {
            owned = await ownsPort(child, address);
          } catch {
            /* Deadline still enforces the safety stop. */
          }
          if (owned && !exited && Date.now() < deadline) {
            state.apiAcknowledged = await requestStop(
              address,
              requestTimeoutMs,
            );
            publish();
          }
          if (!exited && !state.apiAcknowledged)
            await Promise.race([wait(100), finished]);
        }
        await finished;
      })();
      return pending;
    },
  };
}
