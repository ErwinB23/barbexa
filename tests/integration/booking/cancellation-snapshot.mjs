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
assert.ok(manifest.records.length < 8);
assert.ok(
  !manifest.records.some(
    (x) => x.purpose === 'historical-policy-differs-from-current',
  ),
);
const row = manifest.records.find((x) => x.purpose === 'snapshot120'),
  id = randomUUID(),
  request = randomUUID(),
  client = m.accounts[2],
  shop = m.shops[0].id;
const current = Number(
  env.sql(
    `select cancellation_advance_min from public.barbershop_booking_settings where barbershop_id=${q(shop)};`,
  ),
);
const advance = current >= 60 ? 0 : 120,
  expected = current >= 60 ? 200 : 403;
manifest.attempts.push({
  id,
  requestId: request,
  purpose: 'historical-policy-differs-from-current',
});
fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
env.sql(`begin;insert into public.reservations(id,barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot)
select ${q(id)},barbershop_id,client_user_id,barber_id,barber_user_id,${q(request)},encode(sha256(convert_to(${q(request)}::text,'UTF8')),'hex'),date_trunc('minute',now())+interval '60 minutes',date_trunc('minute',now())+interval '60 minutes'+make_interval(mins=>duration_min),date_trunc('minute',now())+interval '60 minutes'+make_interval(mins=>duration_min+buffer_min),duration_min,buffer_min,total_amount,shop_name_snapshot||' [PRUEBA HISTÓRICA]',barber_name_snapshot,client_display_name_snapshot,jsonb_set(policy_snapshot,'{cancellationAdvanceMin}',to_jsonb(${advance}::integer)) from public.reservations where id=${q(row.id)};
insert into public.reservation_items select ${q(id)},barbershop_id,service_id,name_snapshot,description_snapshot,price_snapshot,duration_min from public.reservation_items where reservation_id=${q(row.id)};
insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values(${q(id)},${q(shop)},${q(client.id)},'client','confirmed');commit;`);
manifest.records.push({
  id,
  purpose: 'historical-policy-differs-from-current',
  manual: false,
});
fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
const token = await env.login(client);
const r = await env.post(
  token,
  '/functions/v1/reservation-command',
  { action: 'cancel', requestId: randomUUID(), reservationId: id },
  'http://localhost:8081',
);
assert.equal(r.status, expected);
await env.post(token, '/auth/v1/logout?scope=local', {});
const result = {
  project: env.projectId,
  currentAdvanceMin: current,
  historicalSnapshotAdvanceMin: advance,
  clientHTTP: r.status,
  configurationNotModified: true,
  id,
  purpose: 'historical-policy-differs-from-current',
  state: env.sql(`select state from public.reservations where id=${q(id)};`),
  fixturesTotal: manifest.records.length,
  manualFixturesStillConfirmed: manifest.records
    .filter((x) => x.manual)
    .every(
      (x) =>
        env.sql(
          `select state from public.reservations where id=${q(x.id)};`,
        ) === 'confirmed',
    ),
};
fs.writeFileSync(
  'docs/evaluacion/evidencias/004-reservas/t024-t027/historical-policy.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify(result));
