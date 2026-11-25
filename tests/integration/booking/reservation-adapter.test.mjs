import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCoreLoader } from './load-core.mjs';
import { id, input, detail } from './booking-payload-fixture.mjs';
test('a reason exceeding the technical body limit is editable input failure, never unknown commit', () => {
  const load = createCoreLoader(),
    { providerError } = load(
      'src/features/reservations/infrastructure/booking-payload.ts',
    );
  assert.equal(
    providerError({ error: { code: 'PAYLOAD_TOO_LARGE' } }, 413).code,
    'INVALID_INPUT',
  );
});
function fixture(fetcher, extra = {}) {
  const load = createCoreLoader(),
    { createReservationHttpAdapter } = load(
      'src/features/reservations/infrastructure/reservation-http-adapter.ts',
    );
  return {
    app: createReservationHttpAdapter({
      baseUrl: 'http://127.0.0.1:54421',
      publicKey: 'sb_publishable_fixture',
      getAccessToken: async () => 'fixture-access',
      expectedUser: () => id(4),
      fetcher,
      ...extra,
    }),
    load,
  };
}
const auth = {
  id: id(4),
  is_anonymous: false,
  email_confirmed_at: 'confirmed',
};
test('client confirm projection is closed Auth verified and 201/200 preserve replay semantics', async () => {
  for (const status of [201, 200]) {
    const sent = [];
    const { app } = fixture(async (url, init) => {
      sent.push({ url, init });
      return Response.json(url.endsWith('/auth/v1/user') ? auth : detail, {
        status: url.endsWith('/auth/v1/user') ? 200 : status,
      });
    });
    const result = await app.confirm({ ...input, actorId: id(99), price: 1 });
    assert.equal(result.replayed, status === 200);
    assert.deepEqual(JSON.parse(sent[1].init.body), {
      action: 'confirm',
      ...input,
    });
    assert.equal(result.detail.items[0].priceSnapshot.amountMinor, 2500);
  }
});
test('identity missing mismatched anonymous or changed in flight blocks private result', async () => {
  let calls = 0;
  const { app } = fixture(async () => {
    calls++;
    return Response.json({ ...auth, id: id(99) });
  });
  await assert.rejects(app.confirm(input), (e) => e.code === 'UNAUTHENTICATED');
  assert.equal(calls, 1);
  await assert.rejects(
    fixture(() => {}, { getAccessToken: async () => null }).app.confirm(input),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  await assert.rejects(
    fixture(async () =>
      Response.json({ ...auth, is_anonymous: true }),
    ).app.confirm(input),
    (e) => e.code === 'UNAUTHENTICATED',
  );
  let current = id(4);
  const changed = fixture(
    async (url) => {
      if (url.endsWith('/auth/v1/user')) return Response.json(auth);
      current = id(99);
      return Response.json(detail);
    },
    { expectedUser: () => current },
  ).app;
  await assert.rejects(
    changed.confirm(input),
    (e) => e.code === 'UNAUTHENTICATED',
  );
});
test('HTTP LAN exception is not available in production and privileged keys never initialize client', () => {
  for (const extra of [
    {
      baseUrl: 'http://192.168.0.33:54421',
      developmentHttpOrigin: 'http://192.168.0.33:54421',
    },
    { publicKey: 'sb_secret_fixture' },
    { baseUrl: 'https://user:password@example.invalid' },
    { baseUrl: 'https://example.invalid/?key=fixture' },
  ])
    assert.throws(
      () => fixture(() => {}, extra),
      (e) => e.code === 'INVALID_INPUT',
    );
});
test('slots normalize absolute instants while malformed provider data fails closed', async () => {
  const slot = {
    startsAt: '2026-11-18T10:00:00-05:00',
    endsAt: '2026-11-18T10:30:00-05:00',
    estimatedTotal: detail.total,
  };
  const { app } = fixture(async (url) =>
    Response.json(url.endsWith('/auth/v1/user') ? auth : [slot]),
  );
  const result = await app.listSlots({
    barbershopId: id(1),
    serviceIds: [id(2)],
    barberId: null,
    localDate: '2026-11-18',
  });
  assert.equal(result[0].startsAt, input.startsAt);
  for (const value of [
    {},
    [{ ...slot, endsAt: slot.startsAt }],
    [{ ...slot, estimatedTotal: { currency: 'USD', amountMinor: 1 } }],
  ]) {
    const broken = fixture(async (url) =>
      Response.json(url.endsWith('/auth/v1/user') ? auth : value),
    ).app;
    await assert.rejects(
      broken.listSlots({
        barbershopId: id(1),
        serviceIds: [id(2)],
        barberId: null,
        localDate: '2026-11-18',
      }),
      (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
    );
  }
});
test('own REST projection filters verified client even when RLS also permits administrative reads', async () => {
  let path;
  const row = {
    id: detail.id,
    barbershop_id: id(1),
    barber_id: id(3),
    client_user_id: id(4),
    state: detail.state,
    starts_at: detail.startsAt,
    ends_at: detail.endsAt,
    duration_min: 30,
    total_amount: '25.50',
    shop_name_snapshot: 'Local',
    barber_name_snapshot: 'Professional',
    client_display_name_snapshot: 'Client',
    policy_snapshot: detail.policySnapshot,
    reservation_items: [
      {
        service_id: id(2),
        name_snapshot: 'Service',
        description_snapshot: '',
        price_snapshot: '25.50',
        duration_min: 30,
      },
    ],
  };
  const { app } = fixture(async (url) => {
    path = url;
    return Response.json(url.endsWith('/auth/v1/user') ? auth : [row]);
  });
  const own = await app.listOwnReservations();
  assert.ok(path.includes('client_user_id=eq.' + id(4)));
  assert.equal(own[0].id, detail.id);
  await app.listOwnReservations(detail.id);
  assert.ok(path.includes('id=eq.' + detail.id));
  assert.ok(path.includes('limit=1'));
  await assert.rejects(
    app.listOwnReservations(id(987)),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
  await assert.rejects(
    app.listOwnReservations('invalid'),
    (e) => e.code === 'INVALID_INPUT',
  );
  const foreign = fixture(async (url) =>
    Response.json(
      url.endsWith('/auth/v1/user')
        ? auth
        : [{ ...row, client_user_id: id(99) }],
    ),
  ).app;
  await assert.rejects(
    foreign.listOwnReservations(),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
});
test('safe error mapping never forwards SQL details and network loss remains reconcilable', async () => {
  for (const [body, status, code] of [
    [
      {
        error: {
          code: 'CONFLICT',
          message: 'Profesional no disponible en ese horario',
        },
      },
      409,
      'CONFLICT',
    ],
    [
      { message: 'NOT_AVAILABLE', code: 'P0002', details: 'private customer' },
      500,
      'NOT_AVAILABLE',
    ],
    [
      { code: 'XX000', message: 'private customer' },
      500,
      'DEPENDENCY_UNAVAILABLE',
    ],
  ]) {
    const { app } = fixture(async (url) =>
      Response.json(url.endsWith('/auth/v1/user') ? auth : body, {
        status: url.endsWith('/auth/v1/user') ? 200 : status,
      }),
    );
    await assert.rejects(
      app.confirm(input),
      (e) => e.code === code && !e.message.includes('private customer'),
    );
  }
  await assert.rejects(
    fixture(async () => {
      throw Error('private provider');
    }).app.confirm(input),
    (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
  );
});
test('inconsistent monetary snapshots duration or shop are rejected', async () => {
  for (const bad of [
    { ...detail, total: { currency: 'PEN', amountMinor: 1 } },
    { ...detail, durationMin: 31 },
    { ...detail, items: [] },
    { ...detail, state: 'pending' },
    { ...detail, id: 'bad' },
    { ...detail, barbershopId: id(99) },
  ]) {
    const { app } = fixture(async (url) =>
      Response.json(url.endsWith('/auth/v1/user') ? auth : bad, {
        status: url.endsWith('/auth/v1/user') ? 200 : 201,
      }),
    );
    await assert.rejects(
      app.confirm(input),
      (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
    );
  }
});
