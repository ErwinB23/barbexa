// Reviewed local-only transactional SQL runner; never emits provider diagnostics/data.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  assertBookingEnvironment,
  assertBookingSql,
} from './run-backend-integration.mjs';
const run = (args, input) =>
  spawnSync('docker', args, { input, encoding: 'utf8', timeout: 25000 });
const inspected = run(['inspect', 'supabase_db_app-barberia-002-local']);
if (inspected.status !== 0) throw Error('LOCAL_INSPECTION_FAILED');
const [db] = JSON.parse(inspected.stdout);
assertBookingEnvironment(
  { projectId: 'app-barberia-002-local', url: 'http://127.0.0.1:54421' },
  db,
);
const source = fs.readFileSync(
  'supabase/tests/booking-atomic.test.sql',
  'utf8',
);
assertBookingSql(source);
const r = run(
  [
    'exec',
    '-i',
    db.Id,
    'psql',
    '-X',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-Atq',
    '-v',
    'ON_ERROR_STOP=1',
  ],
  source,
);
for (const line of (r.stdout ?? '').split(/\r?\n/))
  if (/^(ok |not ok |1\.\.|#)/.test(line)) console.log(line);
const failed = r.status !== 0 || /^not ok/m.test(r.stdout ?? '');
console.log(
  JSON.stringify({
    project: 'app-barberia-002-local',
    exitCode: r.status,
    failed,
  }),
);
process.exitCode = failed ? 1 : 0;
