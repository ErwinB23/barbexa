import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTenantFoundation } from '../../../src/composition/tenant-foundation-composition.js';
const id = '11111111-1111-4111-8111-111111111111';
const member = {
  id,
  userId: id,
  barbershopId: id,
  role: 'administrator',
  status: 'active',
};
test('barbershop transport uses Edge and own JWT; timeout reconciles without retry', async () => {
  let posts = 0,
    reconciles = 0;
  const client = createTenantFoundation({
    baseUrl: 'http://127.0.0.1:54421',
    publicKey: 'sb_publishable_test',
    getAccessToken: async () => 'fixture-only',
    fetcher: async (url, init) => {
      const path = String(url);
      if (path.includes('/auth/'))
        return Response.json({ id, is_anonymous: false });
      if (path.includes('/functions/')) {
        posts++;
        throw Error('timeout');
      }
      if (path.includes('memberships')) {
        reconciles++;
        return Response.json([
          {
            id,
            user_id: id,
            barbershop_id: id,
            role: 'administrator',
            status: 'active',
          },
        ]);
      }
      return Response.json([{ id, name: 'Name' }]);
    },
  });
  await assert.rejects(client.createOwnBarbershop({ name: 'Name' }), (e) => {
    assert.deepEqual((e as { reconciliation: unknown }).reconciliation, [
      member,
    ]);
    return true;
  });
  assert.equal(posts, 1);
  assert.equal(reconciles, 1);
  assert.equal((await client.getBarbershop(id))?.id, id);
  assert.equal((await client.renameBarbershop(id, 'Renamed')).id, id);
});
