import { spawn } from 'node:child_process';
// Two independent PostgREST requests must be observed waiting on PostgreSQL locks.
export async function careRace(env, personId, send) {
  const child = spawn(
    'docker',
    [
      'exec',
      '-i',
      env.db.Id,
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
    { stdio: ['pipe', 'pipe', 'pipe'] },
  );
  let output = '',
    failed = false;
  child.stdout.on('data', (v) => {
    output += v;
  });
  child.stderr.on('data', () => {
    failed = true;
  });
  const pause = () => new Promise((r) => setTimeout(r, 40));
  const lock = `hashtextextended('booking-person:'||${env.quote(personId)}::text,0)`;
  try {
    child.stdin.write(`select pg_advisory_lock(${lock});select 'READY';\n`);
    for (let i = 0; !output.includes('READY'); i++) {
      if (i > 100 || failed) throw Error('RACE_LOCKER_UNAVAILABLE');
      await pause();
    }
    const tasks = [send(0), send(1)];
    let observed = 0;
    for (let i = 0; i < 100; i++) {
      observed = Number(
        env.sql(
          "select count(*) from pg_stat_activity where wait_event='advisory' and query like '%care_booking%' and pid<>pg_backend_pid();",
        ),
      );
      if (observed >= 2) break;
      await pause();
    }
    child.stdin.end(`select pg_advisory_unlock(${lock});\n`);
    const results = await Promise.all(tasks);
    if (observed < 2) throw Error('TWO_SQL_CONNECTIONS_NOT_OBSERVED');
    return { results, observedSqlWaiters: observed };
  } finally {
    if (!child.stdin.writableEnded)
      child.stdin.end(`select pg_advisory_unlock(${lock});\n`);
  }
}
