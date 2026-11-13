import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTenantFoundation } from '../../../src/composition/tenant-foundation-composition.js';
const id = '11111111-1111-4111-8111-111111111111';
const row = { id, display_name: 'Name', phone: null };
const options = {
  baseUrl: 'http://127.0.0.1:54421',
  publicKey: 'sb_publishable_test',
  getAccessToken: async () => 'session-test-only',
};
test('composition consumes real adapter and maps own read PATCH and Edge', async () => {
  const calls: string[] = [];
  const client = createTenantFoundation({
    ...options,
    fetcher: async (url, init) => {
      calls.push(String(url));
      assert.equal(
        new Headers(init?.headers).get('Authorization'),
        'Bearer session-test-only',
      );
      if (String(url).endsWith('/auth/v1/user'))
        return Response.json({ id, is_anonymous: false });
      if (String(url).includes('/functions/'))
        return Response.json({ userId: id, displayName: 'Name', phone: null });
      return Response.json([row]);
    },
  });
  assert.equal((await client.getOwnProfile())?.userId, id);
  assert.equal(
    (await client.updateOwnProfile({ phone: null })).displayName,
    'Name',
  );
  assert.equal(
    (await client.ensureOwnProfile({ displayName: ' Name ' })).userId,
    id,
  );
  assert.ok(
    calls.some(
      (s) =>
        s.includes('id=eq.' + id) && s.includes('select=id,display_name,phone'),
    ),
  );
});
test('zero rows and transport errors never invent success', async () => {
  const client = createTenantFoundation({
    ...options,
    fetcher: async (url) =>
      String(url).includes('/auth/')
        ? Response.json({ id, is_anonymous: false })
        : Response.json([]),
  });
  assert.equal(await client.getOwnProfile(), null);
  await assert.rejects(client.updateOwnProfile({ phone: null }), {
    code: 'NOT_AVAILABLE',
  });
  const failed = createTenantFoundation({
    ...options,
    fetcher: async () => new Response('', { status: 401 }),
  });
  await assert.rejects(failed.getOwnProfile(), { code: 'UNAUTHENTICATED' });
  const malformed = createTenantFoundation({
    ...options,
    fetcher: async (url) =>
      String(url).includes('/auth/')
        ? Response.json({ id, is_anonymous: false })
        : Response.json([{ ...row, id: 'invalid' }]),
  });
  await assert.rejects(malformed.getOwnProfile(), {
    code: 'DEPENDENCY_UNAVAILABLE',
  });
});
