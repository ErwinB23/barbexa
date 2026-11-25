import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { localBookingEnvironment } from './client-environment.mjs';
if (process.env.BARBERIA_004_CANCEL_FIXTURES !== 'authorized-up-to-eight')
  throw Error('EXPLICIT_FIXTURE_AUTHORIZATION_REQUIRED');
const env = localBookingEnvironment(),
  m = env.read(),
  file = '.artifacts/004-cancellation-fixtures.json',
  manifest = JSON.parse(fs.readFileSync(file)),
  q = env.quote;
assert.equal(manifest.project, env.projectId);
assert.equal(manifest.records.length, 6);
assert.ok(!manifest.records.some((x) => x.purpose === 'assigned-barber'));
const [a, , client] = m.accounts,
  shop = m.shops[0].id,
  original = JSON.parse(
    env.sql(
      `select row_to_json(m) from public.barbershop_memberships m where user_id=${q(a.id)} and barbershop_id=${q(shop)};`,
    ),
  );
assert.equal(original.role, 'administrator');
assert.equal(original.status, 'active');
fs.writeFileSync(
  '.artifacts/cancellation-barber-original.json',
  JSON.stringify({ project: env.projectId, original }, null, 2),
);
const protectedDigest = () =>
    env.sql(
      `select md5(coalesce(string_agg(row_to_json(r)::text,',' order by id),'')) from public.reservations r where id in(${manifest.originalIds.map(q).join(',')});`,
    ),
  before = protectedDigest();
const id = randomUUID(),
  request = randomUUID(),
  template = manifest.records.find((x) => x.purpose === 'manual-Web').id;
manifest.attempts.push({ id, requestId: request, purpose: 'assigned-barber' });
fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
const report = {
  project: env.projectId,
  id,
  checks: [],
  restored: false,
  preserved: true,
};
const check = (name, value) => {
  assert.ok(value, name);
  report.checks.push(name);
};
try {
  assert.equal(
    env.sql(
      "select count(*) from pg_trigger where tgrelid='public.barbershop_memberships'::regclass and not tgisinternal;",
    ),
    '0',
  );
  env.sql(`begin;insert into public.reservations(id,barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot)
 select ${q(id)},barbershop_id,client_user_id,barber_id,barber_user_id,${q(request)},encode(sha256(convert_to(${q(request)}::text,'UTF8')),'hex'),'2002-01-01T15:00:00Z'::timestamptz,'2002-01-01T15:00:00Z'::timestamptz+make_interval(mins=>duration_min),'2002-01-01T15:00:00Z'::timestamptz+make_interval(mins=>duration_min+buffer_min),duration_min,buffer_min,total_amount,shop_name_snapshot||' [PRUEBA BARBERO]',barber_name_snapshot,client_display_name_snapshot,policy_snapshot from public.reservations where id=${q(template)};
 insert into public.reservation_items select ${q(id)},barbershop_id,service_id,name_snapshot,description_snapshot,price_snapshot,duration_min from public.reservation_items where reservation_id=${q(template)};
 insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values(${q(id)},${q(shop)},${q(client.id)},'client','confirmed');commit;`);
  manifest.records.push({ id, purpose: 'assigned-barber', manual: false });
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
  const token = await env.login(a);
  const cancel = (reason) =>
    env.post(
      token,
      '/functions/v1/reservation-command',
      {
        action: 'cancel',
        requestId: randomUUID(),
        reservationId: id,
        ...(reason ? { reason } : {}),
      },
      'http://localhost:8081',
    );
  env.sql(
    `update public.barbershop_memberships set role='barber' where id=${q(original.id)} and role='administrator' and status='active';`,
  );
  check('barber-still-requires-reason', (await cancel()).status === 400);
  env.sql(
    `update public.barbershop_memberships set status='inactive' where id=${q(original.id)} and role='barber' and status='active';`,
  );
  check(
    'same-JWT-inactive-cannot-cancel',
    (await cancel('Prueba local')).status === 404,
  );
  check(
    'inactive-did-not-change-booking',
    env.sql(`select state from public.reservations where id=${q(id)};`) ===
      'confirmed',
  );
  env.sql(
    `update public.barbershop_memberships set status='active' where id=${q(original.id)} and role='barber' and status='inactive';`,
  );
  const response = await cancel(
    'Cancelación sintética por profesional asignado',
  );
  check(
    'same-JWT-assigned-active-barber-cancels',
    response.status === 200 && response.body.state === 'cancelled',
  );
  check(
    'event-records-barber-capacity',
    env.sql(
      `select capacity from public.reservation_events where reservation_id=${q(id)} and kind='cancelled';`,
    ) === 'barber',
  );
  env.sql(
    `update public.barbershop_memberships set role='administrator',status='active' where id=${q(original.id)} and role='barber' and status='active';`,
  );
  assert.deepEqual(
    JSON.parse(
      env.sql(
        `select row_to_json(m) from public.barbershop_memberships m where id=${q(original.id)};`,
      ),
    ),
    original,
  );
  report.restored = true;
  const day = env.sql(
    `select (starts_at at time zone 'America/Lima')::date from public.reservations where id=${q(template)};`,
  );
  check(
    'administrator-agenda-permission-restored',
    (
      await env.post(token, '/rest/v1/rpc/list_booking_agenda', {
        p_barbershop_id: shop,
        p_local_date: day,
        p_barber_id: null,
        p_state: null,
      })
    ).status === 200,
  );
  check('T019-records-identical', before === protectedDigest());
  check(
    'manual-fixtures-remain-confirmed',
    manifest.records
      .filter((x) => x.manual)
      .every(
        (x) =>
          env.sql(
            `select state from public.reservations where id=${q(x.id)};`,
          ) === 'confirmed',
      ),
  );
  await env.post(token, '/auth/v1/logout?scope=local', {});
  report.fixturesTotal = manifest.records.length;
  report.finalState = env.sql(
    `select state from public.reservations where id=${q(id)};`,
  );
  fs.writeFileSync(
    'docs/evaluacion/evidencias/004-reservas/t024-t027/barber-role.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report));
} catch {
  report.failed = true;
  report.stoppedWithoutFurtherWrites = true;
  fs.writeFileSync(
    'docs/evaluacion/evidencias/004-reservas/t024-t027/barber-role.json',
    JSON.stringify(report, null, 2) + '\n',
  );
  console.log(JSON.stringify(report));
  process.exitCode = 1;
}
