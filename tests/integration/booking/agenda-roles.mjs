import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { localBookingEnvironment } from './client-environment.mjs';
if (process.env.BARBERIA_004_AGENDA_ROLES !== 'authorized-temporary-local')
  throw Error('EXPLICIT_LOCAL_ROLE_TEST_REQUIRED');
const env = localBookingEnvironment(),
  m = env.read(),
  a = m.accounts[0],
  shopA = m.shops[0].id,
  shopB = m.shops[1].id,
  q = env.quote;
const original = JSON.parse(
  env.sql(
    `select row_to_json(m) from public.barbershop_memberships m where user_id=${q(a.id)} and barbershop_id=${q(shopA)};`,
  ),
);
assert.equal(original.role, 'administrator');
assert.equal(original.status, 'active');
assert.equal(
  env.sql(
    `select count(*) from public.barbershop_memberships where user_id=${q(a.id)} and barbershop_id=${q(shopB)};`,
  ),
  '0',
);
assert.equal(
  env.sql(
    `select count(*) from public.barber_profiles where user_id=${q(a.id)} and barbershop_id=${q(shopB)};`,
  ),
  '0',
);
const member = randomUUID(),
  professional = randomUUID();
const snapshot = {
  project: env.projectId,
  original,
  tempMember: member,
  tempProfessional: professional,
  shopB,
};
fs.writeFileSync(
  '.artifacts/agenda-role-original.json',
  JSON.stringify(snapshot),
);
const baseline = env.baseline();
const protectedTables = [
  'reservations',
  'reservation_items',
  'reservation_events',
  'services',
  'barber_services',
  'barbershop_hours',
  'barber_schedules',
  'booking_exceptions',
  'staff_invitations',
];
// Discover exact existing table names first; never assume a missing table is empty.
const tables = JSON.parse(
  env.sql(
    "select json_agg(tablename) from pg_tables where schemaname='public';",
  ),
);
const selected = protectedTables.filter((t) => tables.includes(t));
const digest = () =>
  env.sql(
    'select jsonb_build_array(' +
      selected
        .map(
          (t) =>
            `(select md5(coalesce(string_agg(row_to_json(v)::text,',' order by row_to_json(v)::text),'')) from public.${t} v)`,
        )
        .join(',') +
      ')',
  );
const before = digest(),
  report = {
    project: env.projectId,
    checks: [],
    restored: false,
    residue: undefined,
  },
  ev = 'docs/evaluacion/evidencias/004-reservas/t020-t023/roles.json';
const check = (name, value) => {
  assert.ok(value, name);
  report.checks.push(name);
};
let token;
try {
  const triggers = env.sql(
    "select count(*) from pg_trigger where tgrelid='public.barbershop_memberships'::regclass and not tgisinternal;",
  );
  assert.equal(triggers, '0');
  token = await env.login(a);
  const day = env.sql(
    `select (starts_at at time zone 'America/Lima')::date from public.reservations where barbershop_id=${q(shopA)} order by starts_at desc limit 1;`,
  );
  assert.match(day, /^\d{4}-\d{2}-\d{2}$/);
  env.sql(
    `begin;insert into public.barbershop_memberships(id,user_id,barbershop_id,role,status) values(${q(member)},${q(a.id)},${q(shopB)},'barber','active');insert into public.barber_profiles(id,user_id,barbershop_id,professional_name,active) values(${q(professional)},${q(a.id)},${q(shopB)},'Temporary agenda professional',true);commit;`,
  );
  const query = (shop, prof = null) =>
    env.post(token, '/rest/v1/rpc/list_booking_agenda', {
      p_barbershop_id: shop,
      p_local_date: day,
      p_barber_id: prof,
      p_state: null,
    });
  const adminA = await query(shopA);
  check(
    'admin-A-retains-own-agenda',
    adminA.status === 200 && adminA.body.length > 0,
  );
  const barberB = await query(shopB);
  check(
    'same-JWT-barber-B-only-assigned',
    barberB.status === 200 &&
      barberB.body.every((r) => r.barberId === professional),
  );
  const otherB = env.sql(
    `select id from public.barber_profiles where barbershop_id=${q(shopB)} and id<>${q(professional)} limit 1;`,
  );
  const forgedB = await query(shopB, otherB);
  check('admin-A-does-not-become-admin-B', forgedB.status === 403);
  env.sql(
    `update public.barbershop_memberships set role='barber' where id=${q(original.id)} and user_id=${q(a.id)} and barbershop_id=${q(shopA)} and role='administrator' and status='active';`,
  );
  const ownProfessional = env.sql(
    `select id from public.barber_profiles where user_id=${q(a.id)} and barbershop_id=${q(shopA)};`,
  );
  const assigned = await query(shopA);
  check(
    'same-JWT-role-downgrade-sees-assigned',
    assigned.status === 200 &&
      assigned.body.length > 0 &&
      assigned.body.every((r) => r.barberId === ownProfessional),
  );
  const cross = await query(shopA, professional);
  check('barber-foreign-professional-denied', cross.status === 403);
  env.sql(
    `update public.barbershop_memberships set status='inactive' where id=${q(original.id)} and user_id=${q(a.id)} and barbershop_id=${q(shopA)} and role='barber' and status='active';`,
  );
  const revoked = await query(shopA);
  check('same-JWT-inactive-denied-immediately', revoked.status === 403);
  const dependencyCount = env.sql(
    `select (select count(*) from public.reservations where barber_id=${q(professional)})+(select count(*) from public.barber_services where barber_id=${q(professional)})+(select count(*) from public.barber_schedules where barber_id=${q(professional)});`,
  );
  assert.equal(dependencyCount, '0');
  env.sql(
    `begin;update public.barbershop_memberships set role='administrator',status='active' where id=${q(original.id)} and user_id=${q(a.id)} and barbershop_id=${q(shopA)} and role='barber' and status='inactive';delete from public.barber_profiles where id=${q(professional)} and user_id=${q(a.id)} and barbershop_id=${q(shopB)};delete from public.barbershop_memberships where id=${q(member)} and user_id=${q(a.id)} and barbershop_id=${q(shopB)};commit;`,
  );
  assert.deepEqual(
    JSON.parse(
      env.sql(
        `select row_to_json(m) from public.barbershop_memberships m where id=${q(original.id)};`,
      ),
    ),
    original,
  );
  check('baseline-counts-and-profiles-unchanged', env.baseline() === baseline);
  check('protected-records-unchanged', digest() === before);
  check('original-administrator-restored', (await query(shopA)).status === 200);
  report.restored = true;
  report.residue = Number(
    env.sql(
      `select (select count(*) from public.barbershop_memberships where id=${q(member)})+(select count(*) from public.barber_profiles where id=${q(professional)});`,
    ),
  );
  assert.equal(report.residue, 0);
  await env.post(token, '/auth/v1/logout?scope=local', {});
  fs.writeFileSync(ev, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} catch {
  report.failed = true;
  report.stoppedWithoutFurtherWrites = true;
  fs.writeFileSync(ev, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  process.exitCode = 1;
}
