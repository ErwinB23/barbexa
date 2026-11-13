import { createEnsureProfileHandler } from '../../../supabase/functions/_shared/tenant-foundation/presentation/ensure-profile-handler.ts';
import { FoundationError } from '../../../supabase/functions/_shared/tenant-foundation/domain/types.ts';
const id = '11111111-1111-4111-8111-111111111111';
function ok(v: unknown) {
  if (!v) throw Error('Assertion failed');
}
const profile = { userId: id, displayName: 'Name', phone: null };
const deps = {
  verifyActor: async () => ({ userId: id }),
  ensureOwnProfile: async () => profile,
};
function req(
  body: string,
  method = 'POST',
  headers: Record<string, string> = {},
) {
  return new Request('http://localhost/ensure-profile', {
    method,
    headers: { Authorization: 'Bearer session-test-only', ...headers },
    body: ['GET', 'OPTIONS'].includes(method) ? undefined : body,
  });
}
Deno.test(
  'handler success correlates and actor comes only from verifier',
  async () => {
    const handler = createEnsureProfileHandler({
      ...deps,
      ensureOwnProfile: async (actor, input) => {
        ok(actor.userId === id);
        ok((input as { displayName: string }).displayName === 'Name');
        return profile;
      },
    });
    const r = await handler(req(JSON.stringify({ displayName: ' Name ' })));
    ok(r.status === 200);
    ok((await r.json()).userId === id);
    ok(!!r.headers.get('X-Request-Id'));
  },
);
Deno.test(
  'handler rejects malformed extras types oversized and methods',
  async () => {
    const handler = createEnsureProfileHandler(deps);
    for (const body of [
      '{',
      'null',
      '[]',
      '{}',
      JSON.stringify({ displayName: 'Name', actorId: id }),
      JSON.stringify({ displayName: 'Name', phone: 9 }),
    ])
      ok((await handler(req(body))).status === 400);
    ok((await handler(req('x'.repeat(8193)))).status === 413);
    ok((await handler(req('', 'GET'))).status === 405);
    const r = await handler(
      new Request('http://localhost', { method: 'POST', body: '{}' }),
    );
    ok(r.status === 401);
  },
);
Deno.test('handler provider errors CORS and redacted logs', async () => {
  const events: unknown[] = [];
  const handler = createEnsureProfileHandler({
    ...deps,
    verifyActor: async () => {
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    },
    allowedOrigins: ['https://allowed.example'],
    log: (event) => events.push(event),
  });
  const r = await handler(req('{}'));
  ok(r.status === 503);
  const body = await r.text();
  ok(!body.includes('session-test-only'));
  ok(!JSON.stringify(events).includes('session-test-only'));
  ok(
    (await handler(req('', 'OPTIONS', { Origin: 'https://allowed.example' })))
      .status === 204,
  );
  ok(
    (await handler(req('{}', 'POST', { Origin: 'https://evil.example' })))
      .status === 403,
  );
});
