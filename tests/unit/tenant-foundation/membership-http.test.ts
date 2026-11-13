import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTenantFoundation } from '../../../src/composition/tenant-foundation-composition.js';
const id = '11111111-1111-4111-8111-111111111111';
const foreign = '22222222-2222-4222-8222-222222222222';
const sqlRow = {
  id,
  user_id: id,
  barbershop_id: id,
  role: 'barber',
  status: 'inactive',
};
const own = {
  id,
  userId: id,
  barbershopId: id,
  role: 'barber',
  status: 'inactive',
};
const options = {
  baseUrl: 'http://127.0.0.1:54421',
  publicKey: 'sb_publishable_test',
};

test('Auth 403 bad JWT is unauthenticated while authorized-session RPC 403 stays forbidden', async () => {
  const client = createTenantFoundation({
    ...options,
    getAccessToken: async () => 'invalid-fixture-only',
    fetcher: async () => Response.json({ code: 'bad_jwt' }, { status: 403 }),
  });
  await assert.rejects(client.listOwnMemberships(), {
    code: 'UNAUTHENTICATED',
  });
  await assert.rejects(client.listBarbershopMemberships(id), {
    code: 'UNAUTHENTICATED',
  });
});

test('membership transport uses verified current identity, minimal projection and fresh JWT', async () => {
  let token = 'fixture-one';
  const paths: string[] = [];
  const client = createTenantFoundation({
    ...options,
    getAccessToken: async () => token,
    fetcher: async (url, init) => {
      assert.equal(
        new Headers(init?.headers).get('Authorization'),
        'Bearer ' + token,
      );
      const path = String(url);
      paths.push(path);
      if (path.includes('/auth/'))
        return Response.json({ id, is_anonymous: false });
      if (path.includes('/rpc/')) {
        assert.equal(init?.method, 'POST');
        assert.deepEqual(JSON.parse(String(init?.body)), {
          p_barbershop_id: id,
        });
      } else
        assert.ok(
          path.endsWith(
            '?select=id,user_id,barbershop_id,role,status&user_id=eq.' + id,
          ),
        );
      return Response.json([
        { ...sqlRow, profiles: { display_name: 'must not propagate' } },
      ]);
    },
  });
  assert.deepEqual(await client.listOwnMemberships(), [own]);
  token = 'fixture-two';
  assert.deepEqual(await client.listBarbershopMemberships(id), [own]);
  assert.equal(paths.filter((p) => p.includes('/auth/')).length, 2);
});

test('membership transport rejects malformed and mismatched rows, maps denial and never caches permissions', async () => {
  let value: unknown = [];
  let denied = false;
  let calls = 0;
  const client = createTenantFoundation({
    ...options,
    getAccessToken: async () => 'fixture-only',
    fetcher: async (url) => {
      if (String(url).includes('/auth/'))
        return Response.json({ id, is_anonymous: false });
      calls++;
      return denied
        ? Response.json({ message: 'private detail' }, { status: 403 })
        : Response.json(value);
    },
  });
  assert.deepEqual(await client.listOwnMemberships(), []);
  assert.deepEqual(await client.listBarbershopMemberships(id), []);
  for (value of [
    null,
    {},
    [null],
    [{ ...sqlRow, role: 'client' }],
    [{ ...sqlRow, user_id: foreign }],
  ])
    await assert.rejects(client.listOwnMemberships(), {
      code: 'DEPENDENCY_UNAVAILABLE',
    });
  value = [{ ...sqlRow, barbershop_id: foreign }];
  await assert.rejects(client.listBarbershopMemberships(id), {
    code: 'DEPENDENCY_UNAVAILABLE',
  });
  value = [sqlRow];
  assert.deepEqual(await client.listBarbershopMemberships(id), [own]);
  denied = true;
  const before = calls;
  await assert.rejects(client.listBarbershopMemberships(id), {
    code: 'FORBIDDEN',
  });
  await assert.rejects(client.listBarbershopMemberships(id), {
    code: 'FORBIDDEN',
  });
  assert.equal(calls - before, 2);
});
