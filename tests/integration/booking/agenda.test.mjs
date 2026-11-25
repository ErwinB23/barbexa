import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { localBookingEnvironment } from './client-environment.mjs';
test('local agenda: real JWTs, current bookings, contextual rejection; no new fixture writes', async () => {
  const env = localBookingEnvironment(),
    m = env.read(),
    tokens = [];
  const a = m.accounts[0],
    b = m.accounts[1],
    client = m.accounts[2],
    shop = m.shops[0].id;
  const original = env.sql(
    `select count(*) from public.reservations where barbershop_id in(${m.shops.map((s) => env.quote(s.id)).join(',')});`,
  );
  const date = env.sql(
    `select (starts_at at time zone 'America/Lima')::date from public.reservations where barbershop_id=${env.quote(shop)} order by starts_at desc limit 1;`,
  );
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw Error('EXISTING_BOOKING_REQUIRED');
  const result = {
    project: env.projectId,
    checks: [],
    scopeLimits: [
      'barber-only assigned/unassigned',
      'inactive membership',
      'admin-A/barber-B',
      'controlled revocation require separately approved fixtures',
    ],
  };
  const check = (name, condition) => {
    assert.ok(condition, name);
    result.checks.push(name);
  };
  try {
    for (const account of [a, b, client]) tokens.push(await env.login(account));
    const query = {
      p_barbershop_id: shop,
      p_local_date: date,
      p_barber_id: null,
      p_state: null,
    };
    const call = (token, body = query) =>
      env.post(token, '/rest/v1/rpc/list_booking_agenda', body);
    const own = await call(tokens[0]);
    check(
      'administrator-own-tenant',
      own.status === 200 && Array.isArray(own.body) && own.body.length > 0,
    );
    check(
      'projection-no-other-tenant-or-auth-data',
      own.body.every(
        (r) =>
          r.barbershopId === shop &&
          !('client_user_id' in r) &&
          !('barber_user_id' in r) &&
          !('email' in r),
      ),
    );
    const foreign = await call(tokens[1]);
    check(
      'foreign-administrator-denied',
      foreign.status === 403 && foreign.body.code === '42501',
    );
    const customer = await call(tokens[2]);
    check(
      'client-cannot-enter-staff-agenda',
      customer.status === 403 && customer.body.code === '42501',
    );
    const filtered = await call(tokens[0], {
      ...query,
      p_barber_id: own.body[0].barberId,
      p_state: 'confirmed',
    });
    check(
      'professional-state-date-filter',
      filtered.status === 200 &&
        filtered.body.every(
          (r) => r.barberId === own.body[0].barberId && r.state === 'confirmed',
        ),
    );
    const empty = await call(tokens[0], {
      ...query,
      p_local_date: '2000-01-01',
    });
    check(
      'authorized-empty-agenda',
      empty.status === 200 && empty.body.length === 0,
    );
    const anon = await env.post(
      undefined,
      '/rest/v1/rpc/list_booking_agenda',
      query,
    );
    check('anon-execute-denied', [401, 403].includes(anon.status));
    const invalid = await call(tokens[0], { ...query, p_state: 'admin' });
    check('invalid-filter-rejected', invalid.status === 400);
    const forged = await call(tokens[2], { ...query, p_role: 'administrator' });
    check('forged-role-cannot-authorize', forged.status !== 200);
    const ownRaw = await env.request(
      '/rest/v1/reservations?select=id&id=eq.' + own.body[0].id,
      { token: tokens[2] },
    );
    check(
      'client-own-reservation-still-readable',
      ownRaw.status === 200 && ownRaw.body.length === 1,
    );
    const foreignRaw = await env.request(
      '/rest/v1/reservations?select=id&id=eq.' + own.body[0].id,
      { token: tokens[1] },
    );
    check(
      'existing-RLS-foreign-row-hidden',
      foreignRaw.status === 200 && foreignRaw.body.length === 0,
    );
    check(
      'booking-count-unchanged',
      env.sql(
        `select count(*) from public.reservations where barbershop_id in(${m.shops.map((s) => env.quote(s.id)).join(',')});`,
      ) === original,
    );
  } finally {
    for (const token of tokens)
      await env.post(token, '/auth/v1/logout?scope=local', {});
    fs.mkdirSync('docs/evaluacion/evidencias/004-reservas/t020-t023', {
      recursive: true,
    });
    fs.writeFileSync(
      'docs/evaluacion/evidencias/004-reservas/t020-t023/http.json',
      JSON.stringify(result, null, 2) + '\n',
    );
  }
});
