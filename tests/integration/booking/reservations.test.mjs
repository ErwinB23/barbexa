import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { localBookingEnvironment } from './client-environment.mjs';
import { createCoreLoader } from './load-core.mjs';
const ev = 'docs/evaluacion/evidencias/004-reservas/t017-t019/';
test('local real JWT booking command client adapter and persisted own detail', async (t) => {
  const env = localBookingEnvironment(),
    m = env.read();
  if (!m.prepared) throw Error('FIXTURE_NOT_READY');
  const [a, b, c] = m.accounts,
    [A, B] = m.shops,
    token = await env.login(c),
    tokenA = await env.login(a),
    tokenB = await env.login(b),
    q = env.quote;
  const load = createCoreLoader(),
    { createReservationHttpAdapter } = load(
      'src/features/reservations/infrastructure/reservation-http-adapter.ts',
    );
  const source = {
    baseUrl: env.url,
    publicKey: null,
    getAccessToken: async () => token,
    expectedUser: () => c.id,
  };
  // Obtain the existing public key only in memory; never persist it or any JWT.
  const [edge] = JSON.parse(
    env.command(['inspect', 'supabase_edge_runtime_' + env.projectId]),
  );
  const vars = Object.fromEntries(
    edge.Config.Env.map((s) => {
      const i = s.indexOf('=');
      return [s.slice(0, i), s.slice(i + 1)];
    }),
  );
  source.publicKey = vars.SUPABASE_ANON_KEY;
  const adapter = createReservationHttpAdapter(source),
    observed = [];
  m.requests ??= {};
  const input = (label, minute) => {
    m.requests[label] ??= {
      requestId: randomUUID(),
      barbershopId: A.id,
      serviceIds: A.services.map((s) => s.id),
      barberId: A.professionals[0].id,
      startsAt: new Date(
        Date.parse(m.testDate + 'T14:00:00.000Z') + minute * 60000,
      ).toISOString(),
    };
    env.save(m);
    return m.requests[label];
  };
  const countRequest = (d) =>
    Number(
      env.sql(
        `select count(*) from public.reservations where client_user_id=${q(c.id)} and barbershop_id=${q(A.id)} and request_id=${q(d.requestId)}`,
      ),
    );
  let first;
  await t.test(
    'published offer and real slots are available to a client without memberships',
    async () => {
      assert.equal(
        Number(
          env.sql(
            `select count(*) from public.barbershop_memberships where user_id=${q(c.id)}`,
          ),
        ),
        0,
      );
      const catalogue = await env.post(
        token,
        '/rest/v1/rpc/get_booking_catalog',
        { p_barbershop_id: A.id },
      );
      assert.equal(catalogue.status, 200);
      assert.equal(catalogue.body.services.length, 2);
      const slots = await adapter.listSlots({
        barbershopId: A.id,
        localDate: m.testDate,
        serviceIds: A.services.map((s) => s.id),
        barberId: null,
      });
      assert.ok(slots.length > 0);
      observed.push({ case: 'slots', available: true });
    },
  );
  await t.test(
    'real HTTP returns 201 on creation 200 on replay and confirmed server snapshots',
    async () => {
      const d = input('positive', 0),
        existing = countRequest(d);
      const r = await env.post(
        token,
        '/functions/v1/reservation-command',
        { action: 'confirm', ...d },
        'http://localhost:8081',
      );
      assert.equal(r.status, existing ? 200 : 201);
      assert.equal(r.body.barbershopId, A.id);
      assert.equal(r.body.total.amountMinor, 3500);
      assert.equal(r.body.durationMin, 45);
      assert.equal(r.body.clientDisplayNameSnapshot, 'MVP local cliente');
      assert.equal(r.body.items.length, 2);
      first = r.body;
      const replay = await adapter.confirm(d);
      assert.equal(replay.replayed, true);
      assert.equal(replay.detail.id, first.id);
      assert.equal(countRequest(d), 1);
      observed.push({
        case: 'confirm',
        initialHTTP: r.status,
        replayedHTTP: 200,
        oneReservation: true,
      });
    },
  );
  await t.test(
    'double send with one request id never creates two reservations',
    async () => {
      const d = input('duplicate', 45),
        existing = countRequest(d);
      const results = await Promise.all([
        env.post(token, '/functions/v1/reservation-command', {
          action: 'confirm',
          ...d,
        }),
        env.post(token, '/functions/v1/reservation-command', {
          action: 'confirm',
          ...d,
        }),
      ]);
      assert.deepEqual(
        results.map((r) => r.status).sort(),
        existing ? [200, 200] : [200, 201],
      );
      assert.equal(results[0].body.id, results[1].body.id);
      assert.equal(countRequest(d), 1);
      observed.push({
        case: 'duplicate',
        statuses: results.map((r) => r.status).sort(),
        oneReservation: true,
      });
    },
  );
  await t.test(
    'lost real response reconciles through the same request id with the client adapter',
    async () => {
      const d = input('lostResponse', 90);
      const dropping = createReservationHttpAdapter({
        ...source,
        fetcher: async (url, init) => {
          const r = await fetch(url, init);
          if (url.includes('/functions/v1/reservation-command')) {
            await r.arrayBuffer();
            throw Error('CONTROLLED_LOST_RESPONSE');
          }
          return r;
        },
      });
      await assert.rejects(
        dropping.confirm(d),
        (e) => e.code === 'DEPENDENCY_UNAVAILABLE',
      );
      assert.equal(countRequest(d), 1);
      const replay = await adapter.confirm(d);
      assert.equal(replay.replayed, true);
      assert.equal(countRequest(d), 1);
      observed.push({
        case: 'lost-response',
        actualRequestCommitted: true,
        replayed: true,
        oneReservation: true,
      });
    },
  );
  await t.test(
    'confirmed own reservations hydrate items with RLS and never list another customer',
    async () => {
      const own = await adapter.listOwnReservations();
      assert.ok(own.some((r) => r.id === first.id && r.items.length === 2));
      const asAdmin = createReservationHttpAdapter({
        ...source,
        getAccessToken: async () => tokenA,
        expectedUser: () => a.id,
      });
      assert.equal((await asAdmin.listOwnReservations()).length, 0);
      const denied = await env.request(
        '/rest/v1/reservations?select=id&id=eq.' + first.id,
        { token: tokenB },
      );
      assert.equal(denied.status, 200);
      assert.equal(denied.body.length, 0);
      observed.push({
        case: 'own-detail',
        persisted: true,
        foreignRows: 0,
        adminOwnProjectionDoesNotBecomeAgenda: true,
      });
    },
  );
  await t.test(
    'price actor role service mismatch and direct privileged calls are explicitly denied',
    async () => {
      const base = { ...input('positive', 0), requestId: randomUUID() };
      for (const key of [
        'actorId',
        'clientId',
        'role',
        'price',
        'total',
        'duration',
        'policySnapshot',
      ]) {
        const r = await env.post(token, '/functions/v1/reservation-command', {
          action: 'confirm',
          ...base,
          [key]: 'forged',
        });
        assert.equal(r.status, 400);
        assert.equal(r.body.error.code, 'INVALID_INPUT');
      }
      const foreign = await env.post(
        token,
        '/functions/v1/reservation-command',
        { action: 'confirm', ...base, serviceIds: [B.services[0].id] },
      );
      assert.equal(foreign.status, 400);
      const direct = await env.post(token, '/rest/v1/rpc/confirm_booking', {
        p_actor_id: a.id,
        p_data: base,
      });
      assert.equal(direct.status, 403);
      observed.push({
        case: 'forged-and-direct',
        fieldsDenied: 7,
        foreignServiceHTTP: 400,
        directRPC: 403,
      });
    },
  );
  await t.test(
    'invalid or anonymous identity origin and unsupported action cannot confirm',
    async () => {
      const d = { ...input('positive', 0), requestId: randomUUID() };
      for (const identity of [vars.SUPABASE_ANON_KEY, 'invalid'])
        assert.equal(
          (
            await env.post(identity, '/functions/v1/reservation-command', {
              action: 'confirm',
              ...d,
            })
          ).status,
          401,
        );
      assert.equal(
        (
          await env.post(
            token,
            '/functions/v1/reservation-command',
            { action: 'confirm', ...d },
            'https://not-approved.invalid',
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await env.post(token, '/functions/v1/reservation-command', {
            action: 'cancel',
            ...d,
          })
        ).status,
        400,
      );
      observed.push({
        case: 'identity-origin',
        anonymousHTTP: 401,
        invalidHTTP: 401,
        originHTTP: 403,
        cancelNotImplementedHTTP: 400,
      });
    },
  );
  await t.test(
    'occupation conflict is uniform and fingerprint changes never overwrite a booking',
    async () => {
      const conflict = await env.post(
        tokenB,
        '/functions/v1/reservation-command',
        { action: 'confirm', ...input('positive', 0), requestId: randomUUID() },
      );
      assert.equal(conflict.status, 409);
      assert.equal(
        conflict.body.error.message,
        'Profesional no disponible en ese horario',
      );
      assert.ok(!JSON.stringify(conflict.body).includes(first.id));
      const changed = await env.post(
        token,
        '/functions/v1/reservation-command',
        {
          action: 'confirm',
          ...input('positive', 0),
          startsAt: new Date(
            Date.parse(m.testDate + 'T17:00:00Z'),
          ).toISOString(),
        },
      );
      assert.equal(changed.status, 409);
      assert.equal(changed.body.error.code, 'CONFLICT');
      assert.equal(countRequest(input('positive', 0)), 1);
      observed.push({
        case: 'conflict',
        occupationHTTP: 409,
        uniformMessage: true,
        noPrivateReservationId: true,
        fingerprintHTTP: 409,
      });
    },
  );
  fs.writeFileSync(
    ev + 'http-results.json',
    JSON.stringify(
      {
        project: env.projectId,
        observed,
        manualWebAndroid: false,
        dataHeldForManual: true,
      },
      null,
      2,
    ) + '\n',
  );
});
