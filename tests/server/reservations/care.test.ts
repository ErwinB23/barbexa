import { createCareOperation } from '../../../supabase/functions/_shared/reservations/application/care.ts';
import { createCareAdapter } from '../../../supabase/functions/_shared/reservations/infrastructure/care-adapter.ts';
import { createReservationHandler } from '../../../supabase/functions/_shared/reservations/presentation/reservation-handler.ts';
const id = '00000000-0000-4000-8000-000000000001';
Deno.test(
  'care uses verified actor and rejects injected identity before gateway',
  async () => {
    let calls = 0;
    const run = createCareOperation({
      execute: async (actor, input) => {
        calls++;
        if (actor !== id || input.command !== 'read') throw Error();
        return {};
      },
    });
    await run({ userId: id }, { command: 'read', reservationId: id });
    for (const raw of [
      { command: 'read', reservationId: id, userId: id },
      { command: 'receive', reservationId: id, requestId: id, attested: false },
    ]) {
      try {
        await run({ userId: id }, raw);
        throw Error('accepted');
      } catch (e) {
        if (e instanceof Error && e.message === 'accepted') throw e;
      }
    }
    if (calls !== 1) throw Error('unsafe call');
  },
);
Deno.test(
  'care handler validates JWT before dispatch and preserves Origin rejection',
  async () => {
    let calls = 0;
    const handler = createReservationHandler({
      verifyActor: async () => ({ userId: id }),
      confirm: async () => {
        throw Error();
      },
      care: async (actor, raw) => {
        if (actor.userId !== id) throw Error();
        calls++;
        return raw;
      },
      allowedOrigins: ['http://localhost:8081'],
    });
    for (const [headers, status] of [
      [{}, 401],
      [{ Origin: 'https://evil.invalid', Authorization: 'Bearer fake' }, 403],
      [{ Origin: 'http://localhost:8081', Authorization: 'Bearer fake' }, 200],
    ] as const) {
      const response = await handler(
        new Request('http://local', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'care',
            command: 'read',
            reservationId: id,
          }),
        }),
      );
      if (response.status !== status) throw Error(String(response.status));
    }
    if (calls !== 1) throw Error('dispatch');
  },
);
Deno.test(
  'care postgres adapter forwards actor only internally, safe errors and no privileged headers to public clients',
  async () => {
    const adapter = createCareAdapter(
      'http://local',
      'sb_secret_fixture',
      async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        if (
          body.p_actor_id !== id ||
          new Headers(init?.headers).has('Authorization')
        )
          throw Error();
        return Response.json({ okay: true });
      },
    );
    await adapter.execute(id, { command: 'read', reservationId: id });
    for (const fetcher of [
      async () => Response.json({ code: '42501' }, { status: 403 }),
      async () => {
        throw Error('network');
      },
    ]) {
      let rejected = false;
      try {
        await createCareAdapter('http://local', 'fake', fetcher).execute(
          id,
          {},
        );
      } catch {
        rejected = true;
      }
      if (!rejected) throw Error('unsafe success');
    }
  },
);

Deno.test(
  'Yape reporting uses verified identity and preserves the three-digit security code',
  async () => {
    let called = false;
    const run = createCareOperation({
      execute: async (actor, input) => {
        if (
          actor !== id ||
          input.command !== 'report-yape' ||
          input.securityCode !== '007' ||
          'amountMinor' in input
        )
          throw Error('INVALID_REPORT');
        called = true;
        return { accepted: true };
      },
    });
    await run(
      { userId: id },
      {
        command: 'report-yape',
        reservationId: id,
        requestId: id,
        securityCode: '007',
      },
    );
    if (!called) throw Error('REPORT_NOT_DISPATCHED');
  },
);
