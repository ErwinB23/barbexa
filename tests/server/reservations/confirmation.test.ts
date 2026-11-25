import { createConfirmReservation } from '../../../supabase/functions/_shared/reservations/application/confirm-reservation.ts';
import {
  reservationInput,
  reservationActor,
  slotQuery,
} from '../../../supabase/functions/_shared/reservations/domain/reservation-input.ts';
import {
  BusinessError,
  utcInstant,
} from '../../../supabase/functions/_shared/reservations/domain/values.ts';
import { createPostgresReservationAdapter } from '../../../supabase/functions/_shared/reservations/infrastructure/postgres-reservation-adapter.ts';
import {
  bookingDetail,
  providerError,
} from '../../../supabase/functions/_shared/reservations/infrastructure/booking-payload.ts';
import { createReservationHandler } from '../../../supabase/functions/_shared/reservations/presentation/reservation-handler.ts';
const id = (n: number) =>
  '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
const actor = { userId: id(4) },
  input = {
    requestId: id(10),
    barbershopId: id(1),
    serviceIds: [id(2)],
    barberId: null,
    startsAt: utcInstant('2026-11-18T15:00:00.000Z'),
  };
const raw = {
  id: id(5),
  barbershopId: id(1),
  barberId: id(3),
  state: 'confirmed',
  startsAt: input.startsAt,
  endsAt: '2026-11-18T15:30:00.000Z',
  durationMin: 30,
  shopNameSnapshot: 'Local',
  barberNameSnapshot: 'Professional',
  clientDisplayNameSnapshot: 'Client',
  items: [
    {
      serviceId: id(2),
      nameSnapshot: 'Service',
      descriptionSnapshot: '',
      durationMin: 30,
      priceSnapshot: { amountMinor: 2500, currency: 'PEN' },
    },
  ],
  total: { amountMinor: 2500, currency: 'PEN' },
  policySnapshot: {
    minimumNoticeMin: 0,
    bookingHorizonDays: 30,
    maxFuturePerClient: 12,
    slotStepMin: 15,
    bufferMin: 0,
    cancellationAdvanceMin: 120,
  },
};
const result = { detail: bookingDetail(raw), replayed: false };
Deno.test(
  'paid confirmation routes cash and Yape through verified actor to the paid RPC only',
  async () => {
    for (const paymentMethod of ['cash', 'yape'] as const) {
      let calls = 0;
      const adapter = createPostgresReservationAdapter({
        baseUrl: 'https://cloud-fixture.invalid',
        serviceKey: 'sb_secret_fixture',
        fetcher: async (url, init) => {
          calls++;
          eq(
            String(url),
            'https://cloud-fixture.invalid/rest/v1/rpc/confirm_booking_paid',
          );
          eq(JSON.parse(String(init?.body)), {
            p_actor_id: actor.userId,
            p_data: { paymentMethod, ...input },
          });
          return Response.json(result);
        },
      });
      const handler = createReservationHandler({
        allowedOrigins: ['http://localhost:8081'],
        verifyActor: async () => actor,
        confirm: createConfirmReservation(adapter),
      });
      const request = (extra: Record<string, unknown> = {}) =>
        new Request('https://edge-fixture.invalid', {
          method: 'POST',
          headers: {
            Authorization: 'Bearer fixture',
            Origin: 'http://localhost:8081',
          },
          body: JSON.stringify({
            action: 'confirm',
            paymentMethod,
            ...input,
            ...extra,
          }),
        });
      eq((await handler(request())).status, 201);
      eq((await handler(request({ userId: id(99) }))).status, 400);
      eq(calls, 1);
    }
  },
);
Deno.test(
  'revoked legacy confirmer fails closed without retrying another RPC or exposing SQL detail',
  async () => {
    let calls = 0;
    const adapter = createPostgresReservationAdapter({
      baseUrl: 'https://cloud-fixture.invalid',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url) => {
        calls++;
        eq(
          String(url),
          'https://cloud-fixture.invalid/rest/v1/rpc/confirm_booking',
        );
        return Response.json(
          {
            code: '42501',
            message: 'permission denied for function confirm_booking',
          },
          { status: 403 },
        );
      },
    });
    const handler = createReservationHandler({
      allowedOrigins: [],
      verifyActor: async () => actor,
      confirm: createConfirmReservation(adapter),
    });
    const response = await handler(
      new Request('https://edge-fixture.invalid', {
        method: 'POST',
        headers: { Authorization: 'Bearer fixture' },
        body: JSON.stringify({ action: 'confirm', ...input }),
      }),
    );
    eq(response.status, 403);
    eq((await response.json()).error.message, 'FORBIDDEN');
    eq(calls, 1);
  },
);
function eq(a: unknown, b: unknown) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw Error('Assertion');
}
function ok(v: unknown) {
  if (!v) throw Error('Assertion');
}
function throws(fn: () => unknown, code: string) {
  try {
    fn();
  } catch (e) {
    eq((e as BusinessError).code, code);
    return;
  }
  throw Error('Expected rejection');
}
async function rejects(fn: () => Promise<unknown>, code: string) {
  try {
    await fn();
  } catch (e) {
    eq((e as BusinessError).code, code);
    return;
  }
  throw Error('Expected rejection');
}
Deno.test(
  'reservation application actor closed values and dependency failure are safe',
  async () => {
    eq(reservationInput(input).requestId, input.requestId);
    eq(reservationInput({ ...input, barberId: id(3) }).barberId, id(3));
    for (const bad of [
      null,
      [],
      {},
      { ...input, role: 'administrator' },
      { ...input, serviceIds: [] },
      { ...input, serviceIds: [id(2), id(2)] },
      { ...input, serviceIds: ['bad'] },
      { ...input, startsAt: 'bad' },
    ])
      throws(() => reservationInput(bad), 'INVALID_INPUT');
    for (const bad of [null, {}, { userId: 'bad' }])
      throws(() => reservationActor(bad), 'UNAUTHENTICATED');
    eq(reservationActor(actor), actor);
    eq(
      slotQuery({
        barbershopId: id(1),
        localDate: '2026-11-18',
        serviceIds: [id(2)],
        barberId: null,
      }).localDate,
      '2026-11-18',
    );
    eq(
      slotQuery({
        barbershopId: id(1),
        localDate: '2026-11-18',
        serviceIds: [id(2)],
        barberId: id(3),
      }).barberId,
      id(3),
    );
    for (const date of [null, 'bad', '2026-02-30'])
      throws(
        () =>
          slotQuery({
            barbershopId: id(1),
            localDate: date,
            serviceIds: [id(2)],
            barberId: null,
          }),
        'INVALID_INPUT',
      );
    const app = createConfirmReservation({
      confirm: async (a, d) => {
        eq(a, actor);
        eq(d, input);
        return result;
      },
    });
    eq(await app(actor, input), result);
    await rejects(() => app(null, input), 'UNAUTHENTICATED');
    await rejects(
      () =>
        createConfirmReservation({
          confirm: async () => {
            throw new BusinessError('CONFLICT');
          },
        })(actor, input),
      'CONFLICT',
    );
    await rejects(
      () =>
        createConfirmReservation({
          confirm: async () => {
            throw Error('private detail');
          },
        })(actor, input),
      'DEPENDENCY_UNAVAILABLE',
    );
  },
);
Deno.test(
  'Postgres adapter uses service RPC actor boundary maps P0002 and strips conflict detail',
  async () => {
    let seen: unknown;
    const adapter = createPostgresReservationAdapter({
      baseUrl: 'http://local',
      serviceKey: 'fixture-service',
      fetcher: ((_url: unknown, init: RequestInit) => {
        seen = JSON.parse(String(init.body));
        return Promise.resolve(Response.json(result));
      }) as typeof fetch,
    });
    eq(await adapter.confirm(actor, input), result);
    eq(seen, { p_actor_id: actor.userId, p_data: input });
    for (const [body, status, code] of [
      [{ code: 'P0002', message: 'NOT_AVAILABLE' }, 500, 'NOT_AVAILABLE'],
      [
        {
          code: '23505',
          message: 'Profesional no disponible en ese horario',
          details: 'foreign shop',
        },
        409,
        'CONFLICT',
      ],
      [{ code: '28000', message: 'UNAUTHENTICATED' }, 403, 'UNAUTHENTICATED'],
      [{ code: '23514' }, 400, 'INVALID_INPUT'],
      [
        { code: 'XX000', message: 'foreign shop' },
        500,
        'DEPENDENCY_UNAVAILABLE',
      ],
    ] as const) {
      const a = createPostgresReservationAdapter({
        baseUrl: 'http://local',
        serviceKey: 'sb_secret_fixture',
        fetcher: (() =>
          Promise.resolve(Response.json(body, { status }))) as typeof fetch,
      });
      await rejects(() => a.confirm(actor, input), code);
    }
    eq(
      providerError(
        {
          error: {
            code: 'CONFLICT',
            message: 'Profesional no disponible en ese horario',
          },
        },
        409,
      ).reason,
      'professional-unavailable',
    );
    const malformed = createPostgresReservationAdapter({
      baseUrl: 'http://local',
      serviceKey: 'fixture-service',
      fetcher: (() =>
        Promise.resolve(
          Response.json({ detail: {}, replayed: true }),
        )) as typeof fetch,
    });
    await rejects(
      () => malformed.confirm(actor, input),
      'DEPENDENCY_UNAVAILABLE',
    );
  },
);
Deno.test(
  'reservation HTTP handler authenticates bounds input and returns 201 then idempotent 200',
  async () => {
    const observed: unknown[] = [];
    let replayed = false;
    const handler = createReservationHandler({
      allowedOrigins: ['http://localhost:8081'],
      verifyActor: async (token) => {
        eq(token, 'fixture');
        return actor;
      },
      confirm: async (a, d) => {
        observed.push({ a, d });
        return { ...result, replayed };
      },
      log: (e) => {
        ok(Object.keys(e).every((k) => ['requestId', 'status'].includes(k)));
      },
    });
    const request = (body: unknown) =>
      new Request('http://local', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer fixture',
          Origin: 'http://localhost:8081',
        },
        body: JSON.stringify(body),
      });
    const fresh = await handler(request({ action: 'confirm', ...input }));
    eq(fresh.status, 201);
    eq(await fresh.json(), result.detail);
    eq(observed[0], { a: actor, d: input });
    replayed = true;
    eq((await handler(request({ action: 'confirm', ...input }))).status, 200);
    eq(
      (
        await handler(
          new Request('http://local', {
            method: 'OPTIONS',
            headers: { Origin: 'http://localhost:8081' },
          }),
        )
      ).status,
      204,
    );
    eq(
      (
        await handler(
          new Request('http://local', {
            method: 'POST',
            headers: { Origin: 'https://bad.invalid' },
          }),
        )
      ).status,
      403,
    );
    eq((await handler(new Request('http://local'))).status, 405);
    eq(
      (await handler(new Request('http://local', { method: 'POST' }))).status,
      401,
    );
    for (const body of [null, [], { action: 'cancel' }, { requestId: id(1) }])
      eq((await handler(request(body))).status, 400);
    eq(
      (
        await handler(
          new Request('http://local', {
            method: 'POST',
            headers: { Authorization: 'Bearer fixture' },
            body: 'invalid json',
          }),
        )
      ).status,
      400,
    );
    eq(
      (
        await handler(
          new Request('http://local', {
            method: 'POST',
            headers: { Authorization: 'Bearer fixture' },
            body: 'x'.repeat(8193),
          }),
        )
      ).status,
      413,
    );
  },
);
Deno.test(
  'handler returns uniform conflict and safe unavailable rather than SQL error',
  async () => {
    for (const [failure, status, message] of [
      [
        new BusinessError('CONFLICT', 'professional-unavailable'),
        409,
        'Profesional no disponible en ese horario',
      ],
      [new BusinessError('NOT_AVAILABLE'), 404, 'NOT_AVAILABLE'],
      [Error('private customer data'), 503, 'DEPENDENCY_UNAVAILABLE'],
    ] as const) {
      const handler = createReservationHandler({
        allowedOrigins: [],
        verifyActor: async () => actor,
        confirm: async () => {
          throw failure;
        },
      });
      const r = await handler(
        new Request('http://local', {
          method: 'POST',
          headers: { Authorization: 'Bearer fixture' },
          body: JSON.stringify({ action: 'confirm', ...input }),
        }),
      );
      eq(r.status, status);
      eq((await r.json()).error.message, message);
    }
  },
);
