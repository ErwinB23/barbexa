// Compile-only Web validation. Never load a workstation .env or release profile.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(
  root,
  process.env.BARBEXA_CI_WEB_OUTPUT ?? '.artifacts/ci-web',
);
if (
  !output.startsWith(path.join(root, '.artifacts') + path.sep) ||
  fs.existsSync(output)
)
  throw Error('CI_WEB_OUTPUT_MUST_BE_NEW_AND_INSIDE_ARTIFACTS');
const env = { ...process.env };
for (const name of Object.keys(env))
  if (
    /^(EXPO_PUBLIC_|SUPABASE_|PG|GOOGLE_|SMTP_|RESEND_|EAS_|EXPO_TOKEN)/.test(
      name,
    )
  )
    delete env[name];
Object.assign(env, {
  CI: '1',
  EXPO_NO_DOTENV: '1',
  EXPO_NO_TELEMETRY: '1',
  APP_VARIANT: 'ci',
});
const result = spawnSync(
  process.execPath,
  [
    path.join(root, 'node_modules/expo/bin/cli'),
    'export',
    '--platform',
    'web',
    '--output-dir',
    output,
    '--max-workers',
    '2',
  ],
  { cwd: root, env, stdio: 'inherit' },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
