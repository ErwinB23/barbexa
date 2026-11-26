import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { root } from '../../../k6/lib/lab-client.mjs';
const pointer = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(pointer.manifest));
assert.ok(m.prepared);
if (m.webDirectory && fs.existsSync(path.join(m.webDirectory, 'index.html'))) {
  console.log('Exportación local existente conservada.');
  process.exit(0);
}
const output = path.join(m.dir, 'web-' + Date.now());
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
  EXPO_NO_DOTENV: '1',
  EXPO_NO_TELEMETRY: '1',
  EXPO_PUBLIC_APP_ENVIRONMENT: 'local-team-authority',
  EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY: m.publicKey,
  EXPO_PUBLIC_TEAM_LOCAL_URL: m.apiOrigin,
});
const r = spawnSync(
  process.execPath,
  [
    'node_modules/expo/bin/cli',
    'export',
    '--platform',
    'web',
    '--dev',
    '--output-dir',
    output,
    '--max-workers',
    '1',
  ],
  { cwd: root, env, encoding: 'utf8', maxBuffer: 16 * 1024 ** 2 },
);
fs.writeFileSync(
  path.join(m.dir, 'export-' + Date.now() + '.log'),
  (r.stdout || '') + (r.stderr || ''),
);
assert.equal(r.status, 0, 'LOCAL_WEB_EXPORT_FAILED');
assert.ok(fs.existsSync(path.join(output, 'index.html')));
m.webDirectory = output;
fs.writeFileSync(pointer.manifest, JSON.stringify(m, null, 2) + '\n');
console.log(
  'Web de desarrollo exportada, dotenv/telemetría desactivados; backend exclusivo del laboratorio.',
);
