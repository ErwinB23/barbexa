// Minimal follow-up against the SAME still-owned T016 dataset. Creates no Auth users.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { assertBookingEnvironment } from '../../../scripts/run-backend-integration.mjs';
const projectId = 'app-barberia-002-local',
  url = 'http://127.0.0.1:54421';
const docker = (args, input) => {
  const r = spawnSync('docker', args, {
    input,
    encoding: 'utf8',
    timeout: 20000,
  });
  if (r.status !== 0) throw Error('LOCAL_QUERY_FAILED');
  return r.stdout.trim();
};
const [db, edge] = JSON.parse(
  docker([
    'inspect',
    'supabase_db_' + projectId,
    'supabase_edge_runtime_' + projectId,
  ]),
);
assertBookingEnvironment({ url, projectId }, db);
const sql = (q) =>
  docker(
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
    q,
  );
const quote = (id) => {
  assert.match(id, /^[a-f0-9-]{36}$/);
  return "'" + id + "'";
};
const owned = JSON.parse(
  sql(
    "select jsonb_agg(jsonb_build_object('id',b.id,'name',b.name,'state',s.publication_state)) from public.barbershops b join public.barbershop_booking_settings s on s.barbershop_id=b.id where b.name like '004-atomic-%'",
  ),
);
assert.equal(owned.length, 2);
const A = owned.find((s) => s.name.endsWith('-0'));
assert.equal(A.state, 'paused');
const run = A.name.slice('004-atomic-'.length, -2);
const client = sql(
  `select id from public.profiles where display_name='004-atomic-${run}-2'`,
);
quote(client);
const services = JSON.parse(
  sql(
    `select jsonb_agg(id order by id) from public.services where barbershop_id=${quote(A.id)}`,
  ),
);
assert.equal(services.length, 2);
const vars = Object.fromEntries(
  edge.Config.Env.map((v) => {
    const i = v.indexOf('=');
    return [v.slice(0, i), v.slice(i + 1)];
  }),
);
const body = {
  p_actor_id: client,
  p_data: {
    requestId: randomUUID(),
    barbershopId: A.id,
    serviceIds: services,
    barberId: null,
    startsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
  },
};
const response = await fetch(url + '/rest/v1/rpc/confirm_booking', {
  method: 'POST',
  headers: {
    apikey: vars.SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + vars.SUPABASE_SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});
const error = await response.json();
assert.equal(response.status, 500);
assert.equal(error.code, 'P0002');
assert.equal(error.message, 'NOT_AVAILABLE');
const counts = JSON.parse(
  sql(
    `select jsonb_build_object('headers',count(*),'badItems',count(*) filter(where(select count(*) from public.reservation_items i where i.reservation_id=r.id)<>2),'badEvents',count(*) filter(where(select count(*) from public.reservation_events e where e.reservation_id=r.id and kind='confirmed')<>1)) from public.reservations r where r.barbershop_id in(${owned.map((s) => quote(s.id)).join(',')})`,
  ),
);
assert.ok(counts.headers <= 60);
assert.equal(counts.badItems, 0);
assert.equal(counts.badEvents, 0);
const plans = sql(
  `explain(costs off) select id from public.reservations where client_user_id=${quote(client)} and starts_at>=now();`,
).replace(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/gi, '[OWNED_ID]');
const dir = 'docs/evaluacion/evidencias/004-reservas/t012-t016/';
fs.writeFileSync(dir + 'plans.txt', plans + '\n');
fs.writeFileSync(
  dir + 'followup.json',
  JSON.stringify(
    {
      project: projectId,
      additionalAccountsCreated: 0,
      sameAuthorizedDataset: true,
      pausedRPC: {
        http: response.status,
        sqlstate: error.code,
        message: error.message,
      },
      edgeHTTPMappingNotImplemented: true,
      ...counts,
      passed: true,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  'Follow-up same owned dataset: 4/4 passed; PostgREST P0002=500; no partial records',
);
