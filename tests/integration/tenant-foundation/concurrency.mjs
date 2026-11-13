import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { randomInt } from 'node:crypto';
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function duplicateMembershipRace(operator, userId, shopId) {
  for (const id of [userId, shopId])
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw Error('INVALID_FIXTURE_ID');
  const key = randomInt(100000, 2000000000),
    tag = 'T027_C2_' + key;
  const args = [
    'exec',
    '-i',
    '-e',
    'PGAPPNAME=' + tag,
    operator.dbId,
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-At',
    '-v',
    'ON_ERROR_STOP=1',
    '-v',
    'VERBOSITY=verbose',
  ];
  const processes = [];
  const launch = () => {
    const child = spawn(operator.docker, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    processes.push(child);
    let out = '',
      err = '';
    child.stdout.on('data', (b) => (out += b));
    child.stderr.on('data', (b) => (err += b));
    const done = new Promise((resolve) =>
      child.on('close', (code) => resolve({ code, out, err })),
    );
    return { child, done, getOutput: () => out };
  };
  const locker = launch();
  locker.child.stdin.write(
    'select pg_advisory_lock(' + key + ");select 'BARRIER_READY';\n",
  );
  try {
    for (let i = 0; !locker.getOutput().includes('BARRIER_READY'); i++) {
      if (i > 50) throw Error('BARRIER_TIMEOUT');
      await pause(100);
    }
    const workers = [launch(), launch()];
    const statement =
      'begin;/*' +
      tag +
      '*/select pg_advisory_xact_lock_shared(' +
      key +
      ');/*' +
      tag +
      "*/insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('" +
      userId +
      "','" +
      shopId +
      "','barber','active');commit;";
    for (const worker of workers) worker.child.stdin.end(statement);
    for (let i = 0; ; i++) {
      const waiting = Number(
        operator.sql(
          "select count(*) from pg_stat_activity where wait_event='advisory' and query like '%" +
            tag +
            "%';",
        ),
      );
      if (waiting === 2) break;
      if (i > 50) throw Error('TWO_SESSIONS_NOT_WAITING');
      await pause(100);
    }
    locker.child.stdin.end('select pg_advisory_unlock(' + key + ');');
    const results = await Promise.race([
      Promise.all(workers.map((w) => w.done)),
      pause(10000).then(() => {
        throw Error('RACE_TIMEOUT');
      }),
    ]);
    assert.deepEqual(results.map((r) => r.code).sort(), [0, 3]);
    assert.ok(results.find((r) => r.code === 3).err.includes('23505'));
    return {
      connections: 2,
      barrierWaiters: 2,
      committed: 1,
      rejected: 1,
      sqlstate: '23505',
      exitCodes: results.map((r) => r.code).sort(),
    };
  } finally {
    operator.sql(
      "select pg_terminate_backend(pid) from pg_stat_activity where application_name='" +
        tag +
        "' and pid<>pg_backend_pid();",
    );
    for (const child of processes) if (child.exitCode === null) child.kill();
  }
}
