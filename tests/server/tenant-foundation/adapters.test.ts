import { createAuthVerificationAdapter } from '../../../supabase/functions/_shared/tenant-foundation/infrastructure/auth-verification-adapter.ts';
import { createPostgresFoundationAdapter } from '../../../supabase/functions/_shared/tenant-foundation/infrastructure/postgres-foundation-adapter.ts';
const id = '11111111-1111-4111-8111-111111111111';
function ok(value: unknown) {
  if (!value) throw Error('Assertion failed');
}
async function rejects(call: () => Promise<unknown>, code: string) {
  try {
    await call();
  } catch (e) {
    ok((e as { code: string }).code === code);
    return;
  }
  throw Error('Expected rejection');
}
const baseUrl = 'http://127.0.0.1:54421',
  publicKey = 'public-test-only';
Deno.test(
  'Auth verifies on configured user endpoint and ignores metadata identity',
  async () => {
    const verify = createAuthVerificationAdapter({
      baseUrl,
      publicKey,
      fetcher: async (url, init) => {
        ok(String(url) === baseUrl + '/auth/v1/user');
        ok(
          new Headers(init?.headers).get('Authorization') ===
            'Bearer session-test-only',
        );
        return Response.json({
          id,
          is_anonymous: false,
          user_metadata: { userId: 'forged' },
        });
      },
    });
    ok((await verify('session-test-only')).userId === id);
  },
);
Deno.test('Auth invalid anonymous malformed and provider errors', async () => {
  for (const [body, status, code] of [
    [{ id, is_anonymous: true }, 200, 'UNAUTHENTICATED'],
    [{ id: 'invalid' }, 200, 'UNAUTHENTICATED'],
    [{}, 401, 'UNAUTHENTICATED'],
    [{}, 500, 'DEPENDENCY_UNAVAILABLE'],
  ] as const) {
    await rejects(
      () =>
        createAuthVerificationAdapter({
          baseUrl,
          publicKey,
          fetcher: async () => Response.json(body, { status }),
        })('session-test-only'),
      code,
    );
  }
  await rejects(
    () => createAuthVerificationAdapter({ baseUrl, publicKey })(''),
    'UNAUTHENTICATED',
  );
  await rejects(
    () =>
      createAuthVerificationAdapter({
        baseUrl,
        publicKey,
        fetcher: async () => new Response('invalid-json'),
      })('session-test-only'),
    'DEPENDENCY_UNAVAILABLE',
  );
});
Deno.test(
  'RPC service transport separate and DTO mapped for both key modes',
  async () => {
    for (const serviceKey of ['sb_secret_testonly', 'legacy-service-test']) {
      const gateway = createPostgresFoundationAdapter({
        baseUrl,
        serviceKey,
        fetcher: async (url, init) => {
          ok(String(url).endsWith('/rest/v1/rpc/ensure_own_profile'));
          const h = new Headers(init?.headers);
          ok(h.get('apikey') === serviceKey);
          ok(
            h.get('Authorization') ===
              (serviceKey.startsWith('sb_secret_')
                ? null
                : 'Bearer ' + serviceKey),
          );
          const body = JSON.parse(String(init?.body));
          ok(body.p_actor_id === id);
          return Response.json([{ id, display_name: 'Name', phone: null }]);
        },
      });
      const result = await gateway.ensureOwnProfile(
        { userId: id },
        { displayName: 'Name', phone: null },
      );
      ok(
        result.userId === id &&
          result.displayName === 'Name' &&
          result.phone === null,
      );
    }
  },
);
Deno.test(
  'RPC errors cardinality malformed payload and timeout fail safely',
  async () => {
    for (const [body, status, code] of [
      [[], 200, 'DEPENDENCY_UNAVAILABLE'],
      [{ id: 'bad' }, 200, 'DEPENDENCY_UNAVAILABLE'],
      [{}, 403, 'FORBIDDEN'],
      [{}, 409, 'CONFLICT'],
      [{}, 503, 'DEPENDENCY_UNAVAILABLE'],
    ] as const) {
      await rejects(
        () =>
          createPostgresFoundationAdapter({
            baseUrl,
            serviceKey: 'service-test-only',
            fetcher: async () => Response.json(body, { status }),
          }).ensureOwnProfile(
            { userId: id },
            { displayName: 'Name', phone: null },
          ),
        code,
      );
    }
    const fetcher: typeof fetch = async (_url, init) =>
      await new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => reject(Error('private timeout detail')),
          { once: true },
        );
      });
    await rejects(
      () =>
        createPostgresFoundationAdapter({
          baseUrl,
          serviceKey: 'service-test-only',
          fetcher,
          timeoutMs: 5,
        }).ensureOwnProfile(
          { userId: id },
          { displayName: 'Name', phone: null },
        ),
      'DEPENDENCY_UNAVAILABLE',
    );
  },
);
