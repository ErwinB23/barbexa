import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';
import { spawnSync } from 'node:child_process';
import {
  assertLocalTarget,
  createOwnedDirectory,
  removeOwnedDirectory,
  runChecked,
  publicSettings,
} from '../tests/integration/tenant-foundation/fixtures.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function bookingMode(args) {
  if (!args.some((a) => a.startsWith('--booking'))) return null;
  if (args.length !== 1) throw Error('UNSAFE_BOOKING_MODE');
  if (args[0] === '--booking-schema') return 'schema';
  if (args[0] === '--booking-concurrency') return 'concurrency';
  throw Error('UNSAFE_BOOKING_MODE');
}
export function assertBookingEnvironment(settings, db) {
  assertLocalTarget(settings);
  if (
    settings.projectId !== 'app-barberia-002-local' ||
    db?.Name !== '/supabase_db_app-barberia-002-local' ||
    !db.State?.Running ||
    db.HostConfig?.PortBindings?.['5432/tcp']?.[0]?.HostPort !== '54422' ||
    !db.Mounts?.some((m) => m.Name === 'supabase_db_app-barberia-002-local') ||
    !db.NetworkSettings?.Networks?.['supabase_network_app-barberia-002-local']
  )
    throw Error('UNSAFE_BOOKING_TARGET');
}
export const bookingUserSettings = (input) => {
  if (input.projectId !== 'app-barberia-002-local')
    throw Error('UNSAFE_BOOKING_TARGET');
  return publicSettings(input);
};
export function assertBookingSql(sql) {
  // Fixed, reviewed SQL files only. Lexical guard excludes quoted bodies/comments.
  const visible = sql
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1\$/g, ' ')
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, ' ');
  if (
    !/^\s*begin\s*;/i.test(visible) ||
    !/\brollback\s*;\s*$/i.test(visible) ||
    (visible.match(/\bbegin\b/gi) ?? []).length !== 1 ||
    (visible.match(/\brollback\b/gi) ?? []).length !== 1 ||
    /\b(commit|abort)\b|\bend\s*(?:;|work\b|transaction\b)|\\(?!gset\b|if\b|else\b|endif\b)|\b(drop\s+database|truncate|alter\s+role)\b/i.test(
      visible,
    )
  )
    throw Error('UNSAFE_BOOKING_SQL');
}
function runBooking(mode) {
  const settings = {
    url: process.env.BARBERIA_002_URL,
    projectId: process.env.BARBERIA_002_PROJECT_ID,
  };
  assertLocalTarget(settings);
  const [db] = JSON.parse(
    runChecked('docker', ['inspect', 'supabase_db_app-barberia-002-local']),
  );
  assertBookingEnvironment(settings, db);
  if (mode === 'concurrency') {
    const entry = path.join(root, 'tests/integration/booking/concurrency.mjs');
    if (!fs.existsSync(entry)) throw Error('NOT_READY_BOOKING_CONCURRENCY');
    runChecked(process.execPath, [entry], { cwd: root, timeout: 180000 });
    console.log('Booking concurrency completed');
    return;
  }
  for (const name of ['booking-schema.test.sql', 'booking-access.test.sql']) {
    const sql = fs.readFileSync(
      path.join(root, 'supabase/tests', name),
      'utf8',
    );
    assertBookingSql(sql);
    const r = spawnSync(
      'docker',
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
      {
        input: sql,
        encoding: 'utf8',
        timeout: 30000,
        maxBuffer: 4 * 1024 * 1024,
        shell: false,
      },
    );
    // TAP diagnostics here contain only reviewed test labels; never dump database stderr.
    for (const line of (r.stdout ?? '').split(/\r?\n/))
      if (/^(?:not ok|ok|1\.\.|#)/.test(line)) console.log(line);
    if (
      r.error ||
      r.status !== 0 ||
      /^not ok\b/m.test(r.stdout ?? '') ||
      !/^1\.\.\d+/m.test(r.stdout ?? '')
    )
      throw Error('BOOKING_SQL_FAILED');
  }
}

export async function withCompiledClient(consume, projectRoot = root) {
  const entry = path.join(
    projectRoot,
    'src/composition/tenant-foundation-composition.ts',
  );
  if (!fs.existsSync(entry)) throw Error('NOT_READY_CLIENT_COMPOSITION');
  const output = createOwnedDirectory();
  try {
    const configPath = path.join(projectRoot, 'tsconfig.tests.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    if (config.error) throw Error('BUILD_CONFIG_FAILED');
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      projectRoot,
    );
    if (parsed.errors.some((d) => d.code !== 18003))
      throw Error('BUILD_CONFIG_FAILED');
    const program = ts.createProgram([entry], {
      ...parsed.options,
      rootDir: projectRoot,
      outDir: output,
      noEmit: false,
      noEmitOnError: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error))
      throw Error('CLIENT_TYPECHECK_FAILED');
    if (program.emit().emitSkipped) throw Error('CLIENT_EMIT_FAILED');
    const module = await import(
      pathToFileURL(
        path.join(output, 'src/composition/tenant-foundation-composition.js'),
      ).href
    );
    return await consume(module);
  } finally {
    removeOwnedDirectory(output);
  }
}

function main() {
  const booking = bookingMode(process.argv.slice(2));
  if (booking) return runBooking(booking);
  // No request, fixture mutation or database connection is made by this preparation.
  assertLocalTarget({
    url: process.env.BARBERIA_002_URL,
    projectId: process.env.BARBERIA_002_PROJECT_ID,
  });
  const selected = process.argv.slice(2);
  if (
    selected.length > 1 ||
    selected.some((arg) => !['--profiles', '--barbershops'].includes(arg))
  )
    throw Error('NOT_READY_BACKEND_SCENARIOS');
  const scenarios = (
    selected.includes('--profiles')
      ? ['profiles.test.mjs']
      : selected.includes('--barbershops')
        ? ['barbershops.test.mjs']
        : [
            'profiles.test.mjs',
            'barbershops.test.mjs',
            'authorization.test.mjs',
          ]
  ).map((f) => path.join(root, 'tests/integration/tenant-foundation', f));
  if (scenarios.some((f) => !fs.existsSync(f)))
    throw Error('NOT_READY_BACKEND_SCENARIOS');
  // These future suites must verify the actual stack identity before administrative setup.
  const report = runChecked(
    process.execPath,
    ['--test', '--test-concurrency=1', '--test-reporter=tap', ...scenarios],
    {
      cwd: root,
      timeout: 180000,
    },
  );
  // Re-emit only successful fixed test labels/counters, never provider output or credentials.
  for (const line of report.split('\n')) {
    if (
      /^\s*(ok \d+ - [A-Za-z0-9 /:,.()_-]+|# (tests|pass|fail|skipped) \d+)\s*$/.test(
        line,
      )
    )
      console.log(line.trim());
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (e) {
    const safeCodes = new Set([
      'UNIDENTIFIED_PROJECT',
      'UNSAFE_PORT',
      'UNSAFE_LOCAL_TARGET',
      'NOT_READY_BACKEND_SCENARIOS',
      'SUBPROCESS_FAILED',
      'SUBPROCESS_TIMEOUT',
      'UNSAFE_BOOKING_MODE',
      'UNSAFE_BOOKING_TARGET',
      'UNSAFE_BOOKING_SQL',
      'NOT_READY_BOOKING_CONCURRENCY',
      'BOOKING_SQL_FAILED',
    ]);
    console.error(
      safeCodes.has(e.message) ? e.message : 'INTEGRATION_NOT_READY',
    );
    process.exitCode = 1;
  }
}
