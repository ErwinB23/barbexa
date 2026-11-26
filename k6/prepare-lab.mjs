import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, '.artifacts/k6/supabase-lab');
if (fs.existsSync(output))
  throw Error('LAB_DIRECTORY_ALREADY_EXISTS_NO_OVERWRITE');
const config = fs
  .readFileSync(path.join(root, 'supabase/config.toml'), 'utf8')
  .replace(
    'project_id = "app-barberia-002-local"',
    'project_id = "barbexa-k6-lab"',
  )
  .replaceAll('5442', '5472')
  .replaceAll('54430', '54730')
  .replace('inspector_port = 8183', 'inspector_port = 54728')
  .replace('[studio]\nenabled = true', '[studio]\nenabled = false')
  .replace('[analytics]\nenabled = true', '[analytics]\nenabled = false');
// Normalize only the private configuration copy; original migrations stay byte-identical.
const normalized = config
  .replaceAll('\r\n', '\n')
  .replace('[studio]\nenabled = true', '[studio]\nenabled = false');
if (
  !normalized.includes('project_id = "barbexa-k6-lab"') ||
  normalized.includes('port = 544')
)
  throw Error('UNSAFE_LAB_CONFIG');
fs.mkdirSync(path.join(output, 'supabase'), { recursive: true });
fs.writeFileSync(path.join(output, 'supabase/config.toml'), normalized);
fs.cpSync(
  path.join(root, 'supabase/migrations'),
  path.join(output, 'supabase/migrations'),
  { recursive: true },
);
fs.cpSync(
  path.join(root, 'supabase/functions'),
  path.join(output, 'supabase/functions'),
  {
    recursive: true,
    filter: (file) => !path.basename(file).startsWith('.env'),
  },
);
const migrations = Object.fromEntries(
  fs.readdirSync(path.join(root, 'supabase/migrations')).map((name) => {
    const original = fs.readFileSync(
      path.join(root, 'supabase/migrations', name),
    );
    const copy = fs.readFileSync(
      path.join(output, 'supabase/migrations', name),
    );
    if (!original.equals(copy)) throw Error('MIGRATION_COPY_MISMATCH');
    return [name, createHash('sha256').update(original).digest('hex')];
  }),
);
fs.writeFileSync(
  path.join(output, 'ownership.json'),
  JSON.stringify(
    {
      projectId: 'barbexa-k6-lab',
      origin: 'http://127.0.0.1:54721',
      migrations,
      started: false,
    },
    null,
    2,
  ),
);
console.log(
  'Independent lab configuration prepared; no services started, no migrations applied.',
);
