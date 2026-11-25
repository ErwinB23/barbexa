import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';

const container = 'supabase_db_app-barberia-002-local';
const pointer = '.artifacts/service-catalog-local.json';
const mode = process.argv[2];
function run(args, input) {
  const result = spawnSync(
    'docker',
    ['exec', ...(input ? ['-i'] : []), container, ...args],
    {
      input,
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 60 * 1024 * 1024,
      windowsHide: true,
    },
  );
  if (result.status !== 0)
    throw Error('LOCAL_CATALOG_FAILED: ' + result.stderr.slice(-1800));
  return result.stdout;
}
if (mode === 'prepare') {
  assert.ok(!fs.existsSync(pointer), 'ISOLATED_DATABASE_ALREADY_PREPARED');
  const source = JSON.parse(
    fs.readFileSync('.artifacts/yape-report-local-db.json'),
  );
  assert.equal(source.container, container);
  assert.match(source.db, /^yape_report_017_\d+$/);
  const dump = run([
    'pg_dump',
    '-U',
    'supabase_admin',
    '-d',
    source.db,
    '--no-owner',
    '--no-privileges',
  ]);
  const db = 'service_catalog_018_' + Date.now();
  run(['createdb', '-U', 'supabase_admin', db]);
  fs.writeFileSync(pointer, JSON.stringify({ container, db }));
  run(
    [
      'psql',
      '-X',
      '-q',
      '-U',
      'supabase_admin',
      '-d',
      db,
      '-v',
      'ON_ERROR_STOP=1',
    ],
    dump,
  );
  console.log(JSON.stringify({ isolatedDatabase: db, sourceUnchanged: true }));
} else {
  const state = JSON.parse(fs.readFileSync(pointer));
  assert.equal(state.container, container);
  assert.match(state.db, /^service_catalog_018_\d+$/);
  const sql = (input) =>
    run(
      [
        'psql',
        '-X',
        '-Atq',
        '-U',
        'supabase_admin',
        '-d',
        state.db,
        '-v',
        'ON_ERROR_STOP=1',
      ],
      input,
    );
  if (mode === 'test') {
    sql(
      fs.readFileSync(
        'tests/integration/booking/service-categories.local.sql',
        'utf8',
      ),
    );
    console.log(
      JSON.stringify({ localSqlAssertions: true, fixturesRolledBack: true }),
    );
  } else if (mode === 'race') {
    const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
    const fixture = JSON.parse(
      sql(
        `select row_to_json(t) from(select u.id actor,(public.create_own_barbershop(u.id,'Catalog race test')->'barbershop'->>'id') shop from auth.users u join public.profiles p on p.id=u.id where u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false) limit 1)t;`,
      ).trim(),
    );
    const draft = {
      barbershopId: fixture.shop,
      name: 'Race service',
      description: '',
      price: { currency: 'PEN', amountMinor: 1500 },
      durationMin: 30,
      active: true,
      category: 'Barba',
    };
    const command = (input) =>
      `select public.upsert_booking_service(${quote(fixture.actor)},${quote(JSON.stringify(input))}::jsonb);`;
    const created = JSON.parse(sql(command(draft)).trim());
    const archive = { ...draft, id: created.id, active: false, archived: true };
    const parallel = (input) =>
      new Promise((resolve) => {
        const child = spawn(
          'docker',
          [
            'exec',
            '-i',
            container,
            'psql',
            '-X',
            '-Atq',
            '-U',
            'supabase_admin',
            '-d',
            state.db,
            '-v',
            'ON_ERROR_STOP=1',
          ],
          { windowsHide: true },
        );
        let stderr = '';
        child.stdout.on('data', () => {});
        child.stderr.on('data', (value) => {
          stderr += value;
        });
        child.on('close', (code) => resolve({ code, stderr }));
        child.stdin.end(input);
      });
    const concurrent = await Promise.all([
      parallel(
        `begin;select private.authority_lock(${quote(fixture.shop)});select pg_sleep(0.15);${command(archive)}commit;`,
      ),
      parallel(command(archive)),
      parallel(command({ ...draft, id: created.id, category: 'Tratamientos' })),
    ]);
    assert.equal(concurrent[0].code, 0);
    assert.equal(concurrent[1].code, 0);
    assert.ok(
      concurrent[2].code === 0 || /CONFLICT/.test(concurrent[2].stderr),
    );
    assert.equal(
      sql(
        `select archived and not active from public.services where id=${quote(created.id)};`,
      ).trim(),
      't',
    );
    console.log(
      JSON.stringify({
        concurrentArchiveIdempotent: true,
        racingEditCannotReactivate: true,
        isolatedFixturesPreserved: true,
      }),
    );
  } else if (mode === 'apply') {
    sql(
      fs.readFileSync(
        'supabase/migrations/20261125010000_service_catalog_categories.sql',
        'utf8',
      ),
    );
    console.log(JSON.stringify({ isolatedMigrationApplied: true }));
  } else if (mode === 'replace-function') {
    const migration = fs.readFileSync(
      'supabase/migrations/20261125010000_service_catalog_categories.sql',
      'utf8',
    );
    sql(
      'begin;\n' +
        migration.slice(migration.indexOf('create or replace function')),
    );
    console.log(JSON.stringify({ isolatedFunctionReplaced: true }));
  } else throw Error('EXPLICIT_PREPARE_TEST_OR_APPLY_REQUIRED');
}
