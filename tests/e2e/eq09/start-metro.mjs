import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { root } from '../../../k6/lib/lab-client.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const p = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(p.manifest));
const env = { ...process.env };
for (const n of Object.keys(env))
  if (
    /^(EXPO_PUBLIC_|SUPABASE_|PG|GOOGLE_|SMTP_|RESEND_|EAS_|EXPO_TOKEN|SSLKEYLOGFILE)/.test(
      n,
    )
  )
    delete env[n];
Object.assign(env, {
  CI: '1',
  EXPO_OFFLINE: '1',
  EXPO_NO_DOTENV: '1',
  EXPO_NO_TELEMETRY: '1',
  EXPO_PUBLIC_APP_ENVIRONMENT: 'local-team-authority',
  EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY: m.publicKey,
  EXPO_PUBLIC_TEAM_LOCAL_URL: m.apiOrigin,
});
const log = fs.openSync(path.join(m.dir, 'metro-' + Date.now() + '.log'), 'a');
const child = spawn(
  process.execPath,
  [
    'node_modules/expo/bin/cli',
    'start',
    '--host',
    'localhost',
    '--port',
    '8081',
    '--max-workers',
    '1',
  ],
  { cwd: root, env, stdio: ['ignore', log, log], windowsHide: true },
);
const stopFile = path.join(m.dir, 'stop-metro-' + process.pid + '.request');
fs.writeFileSync(
  path.join(m.dir, 'metro-process.json'),
  JSON.stringify({ controllerPid: process.pid, metroPid: child.pid, stopFile }),
);
const timer = setInterval(() => {
  if (fs.existsSync(stopFile)) {
    clearInterval(timer);
    child.kill('SIGTERM');
  }
}, 500);
child.on('exit', (code) => {
  clearInterval(timer);
  fs.closeSync(log);
  process.exitCode = code ?? 1;
});
console.log(
  'Metro local aislado iniciado; dotenv/telemetría desactivados y una tarea de compilación.',
);
