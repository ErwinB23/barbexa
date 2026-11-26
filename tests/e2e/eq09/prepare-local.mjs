// Fixtures EQ-09 exclusivamente en el laboratorio aislado ya existente.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { ownedLab, root, lab } from '../../../k6/lib/lab-client.mjs';
import {
  sqlId as q,
  syntheticPassword,
} from '../../../k6/lib/fixture-values.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const env = ownedLab({ recordBaseline: false });
const marker = JSON.parse(
  fs.readFileSync(path.join(lab, 'fixture-manifest.json')),
).runId;
assert.equal(env.sql('select run_id from private.k6_lab_marker;'), marker);
const folder = path.join(root, '.artifacts/eq09');
fs.mkdirSync(folder, { recursive: true });
const pointer = path.join(folder, 'current.json');
let manifest;
if (fs.existsSync(pointer))
  manifest = JSON.parse(
    fs.readFileSync(JSON.parse(fs.readFileSync(pointer)).manifest),
  );
else {
  const id = randomUUID(),
    dir = path.join(folder, id);
  fs.mkdirSync(dir);
  manifest = { id, dir, marker, accounts: [], prepared: false };
  fs.writeFileSync(
    pointer,
    JSON.stringify({ manifest: path.join(dir, 'manifest.json') }, null, 2),
  );
}
assert.equal(manifest.marker, marker);
const file = path.join(manifest.dir, 'manifest.json');
const save = () =>
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
save();
const tables = [
  'public.profiles',
  'public.barbershops',
  'public.barbershop_memberships',
  'public.barbershop_booking_settings',
  'public.services',
  'public.barber_profiles',
  'public.barber_services',
  'public.barbershop_hours',
  'public.barber_schedules',
  'public.reservations',
  'public.reservation_items',
  'public.reservation_events',
  'public.staff_invitations',
  'private.booking_care',
  'private.care_events',
  'private.care_settings',
  'private.barbershop_ownership',
  'private.admin_invitation_mail',
];
if (!manifest.baseline) {
  manifest.baseline = Object.fromEntries(
    tables.map((t) => [
      t,
      JSON.parse(
        env.sql(
          `select coalesce(json_agg(md5(to_jsonb(r)::text) order by md5(to_jsonb(r)::text)),'[]') from ${t} r;`,
        ),
      ),
    ]),
  );
  const names = JSON.parse(
    fs.readFileSync(
      path.join(
        root,
        'docs/evaluacion/evidencias/eq08/preservacion-sha256.json',
      ),
    ),
  ).sha256;
  for (const [p, h] of Object.entries(names))
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync(path.join(root, p)))
        .digest('hex'),
      h,
    );
  manifest.protectedFiles = names;
  save();
}
const expect = (r, status, label) => {
  assert.equal(r.status, status, label);
  return r.body;
};
for (let i = 0; i < 4; i++) {
  let a = manifest.accounts[i];
  if (!a) {
    a = {
      role: ['owner', 'professional', 'clientA', 'clientB'][i],
      email: `eq09-${manifest.id}-${i}@example.invalid`,
      password: syntheticPassword(),
    };
    manifest.accounts.push(a);
    save();
  }
  if (!a.id) {
    a.id = expect(
      await env.request('/auth/v1/admin/users', {
        admin: true,
        body: { email: a.email, password: a.password, email_confirm: true },
      }),
      200,
      'create-synthetic-auth',
    ).id;
    save();
  }
  if (!a.session || a.session.expires_at < Date.now() / 1000 + 600) {
    a.session = expect(
      await env.request('/auth/v1/token?grant_type=password', {
        body: { email: a.email, password: a.password },
      }),
      200,
      'synthetic-login',
    );
    assert.equal(a.id, a.session.user.id);
    save();
  }
  if (!a.profile) {
    expect(
      await env.request('/functions/v1/ensure-profile', {
        token: a.session.access_token,
        body: { displayName: `EQ09 ${a.role}`, phone: null },
      }),
      200,
      'synthetic-profile',
    );
    a.profile = true;
    save();
  }
}
const owner = manifest.accounts[0],
  professional = manifest.accounts[1];
const op = async (body) =>
  expect(
    await env.request('/functions/v1/barbershop-operation', {
      token: owner.session.access_token,
      body: { barbershopId: manifest.shop, ...body },
    }),
    200,
    'offering-' + body.action,
  );
if (!manifest.shop) {
  manifest.shopName = 'EQ09 Barbería sintética ' + manifest.id.slice(0, 8);
  manifest.shop = expect(
    await env.request('/functions/v1/create-barbershop', {
      token: owner.session.access_token,
      body: { name: manifest.shopName },
    }),
    201,
    'synthetic-shop',
  ).barbershop.id;
  save();
}
if (!manifest.prepared) {
  await op({
    action: 'configure-shop',
    publicContact: 'Contacto sintético EQ09',
    address: 'Laboratorio local EQ09',
    policies: {
      minimumNoticeMin: 0,
      bookingHorizonDays: 7,
      maxFuturePerClient: 12,
      slotStepMin: 15,
      bufferMin: 0,
      cancellationAdvanceMin: 120,
    },
  });
  if (!manifest.service) {
    manifest.service = (
      await op({
        action: 'upsert-service',
        name: 'Corte sintético EQ09',
        category: 'Corte de cabello',
        description: 'Servicio exclusivo de prueba E2E',
        price: { amountMinor: 1500, currency: 'PEN' },
        durationMin: 30,
        active: true,
      })
    ).id;
    save();
  }
  env.sql(
    `insert into public.barbershop_memberships(id,user_id,barbershop_id,role,status) values(${q(randomUUID())},${q(professional.id)},${q(manifest.shop)},'barber','active') on conflict(user_id,barbershop_id) do nothing;`,
  );
  manifest.barber = (
    await op({
      action: 'set-professional',
      userId: professional.id,
      professionalName: 'Profesional EQ09',
      active: true,
    })
  ).id;
  save();
  const hours = Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    opensMin: 540,
    closesMin: 1080,
  }));
  for (const body of [
    { action: 'set-shop-hours', hours },
    { action: 'set-barber-hours', barberId: manifest.barber, hours },
    {
      action: 'set-capabilities',
      barberId: manifest.barber,
      serviceIds: [manifest.service],
    },
    { action: 'set-publication', state: 'published' },
  ])
    await op(body);
  manifest.localDate = env.sql(
    "select to_char((now() at time zone 'America/Lima')::date+3,'YYYY-MM-DD');",
  );
  manifest.apiOrigin = 'http://127.0.0.1:54421';
  manifest.backendOrigin = 'http://127.0.0.1:54721';
  manifest.webOrigin = 'http://localhost:8081';
  manifest.publicKey = env.publicKey;
  const slots = expect(
    await env.request('/rest/v1/rpc/list_booking_slots', {
      token: manifest.accounts[2].session.access_token,
      body: {
        p_barbershop_id: manifest.shop,
        p_service_ids: [manifest.service],
        p_barber_id: manifest.barber,
        p_local_date: manifest.localDate,
      },
    }),
    200,
    'initial-slots',
  );
  assert.ok(slots.length >= 3);
  manifest.first = slots[0];
  manifest.alternative = slots.find(
    (s) =>
      Date.parse(s.startsAt ?? s.starts_at) >=
      Date.parse(slots[0].endsAt ?? slots[0].ends_at),
  );
  assert.ok(manifest.alternative, 'non-overlapping-alternative');
  manifest.prepared = true;
  save();
}
console.log(
  JSON.stringify({
    prepared: manifest.prepared,
    syntheticAccounts: 4,
    shop: manifest.shopName,
    date: manifest.localDate,
    dir: path.relative(root, manifest.dir).replaceAll('\\', '/'),
    backend: manifest.backendOrigin,
    existingLabReused: true,
  }),
);
