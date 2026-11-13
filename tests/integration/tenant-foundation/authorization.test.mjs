import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  authorizationCases,
  expectedCaseCount,
  clientCases,
  expectedClientCaseCount,
  relationships,
} from './cases.mjs';
import { withProfileEnvironment } from './profile-environment.mjs';
import { withCompiledClient } from '../../../scripts/run-backend-integration.mjs';
test('US4 application and direct HTTP authorization matrix with committed revocation', async (t) => {
  const results = [];
  const clientResults = [];
  let revocationPassed = false;
  await withProfileEnvironment(
    async (env) =>
      await withCompiledClient(async ({ createTenantFoundation }) => {
        const clients = env.users.map((u) =>
          createTenantFoundation({
            baseUrl: env.url,
            publicKey: env.publicKey,
            getAccessToken: async () => u.token,
          }),
        );
        for (const client of clients)
          await client.ensureOwnProfile({ displayName: 'Matrix fixture' });
        const shops = [
          (await clients[0].createOwnBarbershop({ name: 'A' })).barbershop,
          (await clients[1].createOwnBarbershop({ name: 'B' })).barbershop,
        ];
        for (const [a, b, role, status] of relationships.filter(
          (r) => !(r[0] === 0 && r[1] === 0) && !(r[0] === 1 && r[1] === 1),
        ))
          env.operator.sql(
            "insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('" +
              env.users[a].id +
              "','" +
              shops[b].id +
              "','" +
              role +
              "','" +
              status +
              "');",
          );
        const snapshot = () =>
          env.operator.sql(
            "select md5(coalesce((select string_agg(row_to_json(p)::text,'' order by id) from public.profiles p),''))||md5(coalesce((select string_agg(row_to_json(s)::text,'' order by id) from public.barbershops s),''))||md5(coalesce((select string_agg(row_to_json(m)::text,'' order by id) from public.barbershop_memberships m),''));",
          );
        try {
          for (const c of clientCases)
            await t.test(c.id, async () => {
              const client =
                  clients[c.actor] ??
                  createTenantFoundation({
                    baseUrl: env.url,
                    publicKey: env.publicKey,
                    getAccessToken: async () =>
                      c.actor === 7 ? null : 'invalid-fixture-only',
                  }),
                shop = shops[c.tenant].id;
              const before = c.denied ? snapshot() : null;
              if (c.actor >= 7) {
                await assert.rejects(
                  c.operation === 'member-own'
                    ? client.listOwnMemberships()
                    : client.listBarbershopMemberships(shop),
                  { code: 'UNAUTHENTICATED' },
                );
              } else if (c.operation === 'profile-read') {
                assert.equal(
                  (await client.getOwnProfile()).userId,
                  env.users[c.actor].id,
                );
              } else if (c.operation === 'profile-edit') {
                assert.equal(
                  (
                    await client.updateOwnProfile({
                      displayName: 'Matrix edited',
                    })
                  ).userId,
                  env.users[c.actor].id,
                );
              } else if (c.operation === 'shop-create') {
                const created = await client.createOwnBarbershop({
                  name: 'Additional own fixture',
                });
                assert.equal(created.membership.userId, env.users[c.actor].id);
                assert.equal(
                  created.membership.barbershopId,
                  created.barbershop.id,
                );
                assert.equal(created.membership.role, 'administrator');
                assert.equal(created.membership.status, 'active');
              } else if (c.operation === 'shop-read') {
                const value = await client.getBarbershop(shop);
                if (c.rows) assert.equal(value.id, shop);
                else assert.equal(value, null);
              } else if (c.operation === 'shop-rename') {
                if (c.rows)
                  assert.equal(
                    (await client.renameBarbershop(shop, 'Client rename')).id,
                    shop,
                  );
                else
                  await assert.rejects(
                    client.renameBarbershop(shop, 'Denied client rename'),
                    { code: 'NOT_AVAILABLE' },
                  );
              } else if (c.operation === 'member-own') {
                const own = await client.listOwnMemberships();
                assert.ok(own.every((m) => m.userId === env.users[c.actor].id));
                assert.equal(
                  own.filter((m) => m.barbershopId === shop).length,
                  c.rows,
                );
                if (c.actor === 6) assert.equal(own[0].status, 'inactive');
              } else if (c.status === 403) {
                await assert.rejects(client.listBarbershopMemberships(shop), {
                  code: 'FORBIDDEN',
                });
              } else {
                const rows = await client.listBarbershopMemberships(shop);
                assert.equal(rows.length, c.rows);
                for (const row of rows) {
                  assert.equal(row.barbershopId, shop);
                  assert.deepEqual(
                    Object.keys(row).sort(),
                    ['id', 'userId', 'barbershopId', 'role', 'status'].sort(),
                  );
                }
              }
              if (c.denied) assert.equal(snapshot(), before);
              clientResults.push({ id: c.id, passed: true });
            });
          for (const c of authorizationCases)
            await t.test(c.id, async () => {
              const own = env.users[c.actor] ?? env.users[4],
                other = env.users[(c.actor + 1) % 7],
                shop = shops[c.tenant].id;
              let path,
                method = 'GET',
                body;
              switch (c.operation) {
                case 'shop-read':
                  path = '/rest/v1/barbershops?select=id,name&id=eq.' + shop;
                  break;
                case 'shop-rename':
                  path = '/rest/v1/barbershops?select=id,name&id=eq.' + shop;
                  method = 'PATCH';
                  body = { name: 'Matrix rename' };
                  break;
                case 'member-own':
                  path =
                    '/rest/v1/barbershop_memberships?select=id,user_id,barbershop_id,role,status&user_id=eq.' +
                    own.id +
                    '&barbershop_id=eq.' +
                    shop;
                  break;
                case 'member-table':
                  path =
                    '/rest/v1/barbershop_memberships?select=id,user_id,barbershop_id,role,status&barbershop_id=eq.' +
                    shop;
                  break;
                case 'member-RPC':
                  path = '/rest/v1/rpc/list_barbershop_memberships';
                  method = 'POST';
                  body = { p_barbershop_id: shop };
                  break;
                case 'profile-other':
                  path =
                    '/rest/v1/profiles?select=id,display_name,phone&id=eq.' +
                    other.id;
                  break;
                case 'profile-join':
                  path =
                    '/rest/v1/barbershop_memberships?select=user_id,profiles(id,display_name,phone)&barbershop_id=eq.' +
                    shop;
                  break;
                case 'profile-RPC':
                  path = '/rest/v1/rpc/ensure_own_profile';
                  method = 'POST';
                  body = {
                    p_actor_id: other.id,
                    p_display_name: 'Denied',
                    p_phone: null,
                  };
                  break;
                case 'shop-RPC':
                  path = '/rest/v1/rpc/create_own_barbershop';
                  method = 'POST';
                  body = { p_actor_id: other.id, p_name: 'Denied' };
                  break;
                case 'forged-shop-body':
                  path = '/functions/v1/create-barbershop';
                  method = 'POST';
                  body = {
                    name: 'Denied',
                    userId: other.id,
                    role: 'administrator',
                  };
                  break;
                case 'forged-profile-body':
                  path = '/functions/v1/ensure-profile';
                  method = 'POST';
                  body = {
                    displayName: 'Denied',
                    userId: other.id,
                    role: 'administrator',
                  };
                  break;
                case 'profile-id':
                  path = '/rest/v1/profiles?id=eq.' + own.id;
                  method = 'PATCH';
                  body = { id: other.id };
                  break;
                case 'shop-id':
                  path = '/rest/v1/barbershops?id=eq.' + shop;
                  method = 'PATCH';
                  body = { id: other.id };
                  break;
                default:
                  path =
                    '/rest/v1/barbershop_memberships?barbershop_id=eq.' + shop;
                  method =
                    c.operation === 'delete'
                      ? 'DELETE'
                      : c.operation === 'insert'
                        ? 'POST'
                        : 'PATCH';
                  body =
                    c.operation === 'delete'
                      ? undefined
                      : c.operation === 'insert'
                        ? {
                            user_id: own.id,
                            barbershop_id: shop,
                            role: 'barber',
                            status: 'active',
                          }
                        : {
                            [c.operation]:
                              c.operation === 'role'
                                ? 'administrator'
                                : c.operation === 'status'
                                  ? 'active'
                                  : other.id,
                          };
              }
              const before = c.denied ? snapshot() : null;
              const headers = {
                apikey: env.publicKey,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
              };
              if (c.actor < 7) headers.Authorization = 'Bearer ' + own.token;
              else if (c.actor === 8)
                headers.Authorization = 'Bearer invalid-fixture-only';
              const r = await fetch(env.url + path, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: AbortSignal.timeout(10000),
              });
              assert.equal(r.status, c.status);
              if (r.ok) {
                const data = await r.json();
                if (c.rows !== undefined) assert.equal(data.length, c.rows);
                if (
                  ['member-own', 'member-table', 'member-RPC'].includes(
                    c.operation,
                  )
                )
                  for (const row of data) {
                    assert.equal(row.barbershop_id, shop);
                    if (c.operation === 'member-own')
                      assert.equal(row.user_id, own.id);
                  }
                if (c.operation === 'profile-join')
                  for (const row of data)
                    if (row.profiles !== null)
                      assert.equal(row.profiles.id, own.id);
                if (c.operation === 'member-RPC')
                  for (const row of data)
                    assert.deepEqual(
                      Object.keys(row).sort(),
                      [
                        'id',
                        'user_id',
                        'barbershop_id',
                        'role',
                        'status',
                      ].sort(),
                    );
              } else {
                const errorBody = await r.text();
                assert.ok(
                  !/"(?:display_name|phone|user_id|barbershop_id)"\s*:/.test(
                    errorBody,
                  ),
                );
                assert.ok(!errorBody.includes(env.publicKey));
                assert.ok(!env.users.some((u) => errorBody.includes(u.token)));
              }
              if (c.denied) assert.equal(snapshot(), before);
              results.push({ id: c.id, passed: true });
            });
          await t.test(
            'revocation after commit uses same JWT; inactive own relation remains',
            async () => {
              const token = env.users[5].token;
              const client = clients[5];
              assert.equal(
                (await client.listBarbershopMemberships(shops[0].id)).length,
                4,
              );
              const r = await env.ordinary(
                token,
                '/rest/v1/barbershops?select=id&id=eq.' + shops[0].id,
              );
              assert.equal((await r.json()).length, 1);
              env.operator.sql(
                "begin;update public.barbershop_memberships set status='inactive' where user_id='" +
                  env.users[5].id +
                  "' and barbershop_id='" +
                  shops[0].id +
                  "';commit;",
              );
              const after = await env.ordinary(
                token,
                '/rest/v1/barbershops?select=id&id=eq.' + shops[0].id,
              );
              assert.equal((await after.json()).length, 0);
              const own = await env.ordinary(
                token,
                '/rest/v1/barbershop_memberships?select=id,status&user_id=eq.' +
                  env.users[5].id +
                  '&barbershop_id=eq.' +
                  shops[0].id,
              );
              assert.equal((await own.json())[0].status, 'inactive');
              const list = await env.ordinary(
                token,
                '/rest/v1/rpc/list_barbershop_memberships',
                {
                  method: 'POST',
                  body: JSON.stringify({ p_barbershop_id: shops[0].id }),
                },
              );
              assert.equal(list.status, 403);
              const otherTenant = await env.ordinary(
                token,
                '/rest/v1/barbershops?select=id&id=eq.' + shops[1].id,
              );
              assert.equal((await otherTenant.json()).length, 1);
              const otherList = await env.ordinary(
                token,
                '/rest/v1/rpc/list_barbershop_memberships',
                {
                  method: 'POST',
                  body: JSON.stringify({ p_barbershop_id: shops[1].id }),
                },
              );
              assert.equal(otherList.status, 403);
              assert.equal(await client.getBarbershop(shops[0].id), null);
              await assert.rejects(
                client.listBarbershopMemberships(shops[0].id),
                { code: 'FORBIDDEN' },
              );
              const ownRelations = await client.listOwnMemberships();
              assert.equal(
                ownRelations.find((m) => m.barbershopId === shops[0].id).status,
                'inactive',
              );
              assert.equal(
                (await client.getBarbershop(shops[1].id)).id,
                shops[1].id,
              );
              await assert.rejects(
                client.renameBarbershop(shops[1].id, 'Denied after revocation'),
                { code: 'NOT_AVAILABLE' },
              );
              assert.equal(env.users[5].token, token);
              revocationPassed = true;
            },
          );
        } finally {
          fs.writeFileSync(
            'docs/evaluacion/evidencias/002-fundacion/t032-case-results.json',
            JSON.stringify(
              {
                defined: expectedCaseCount,
                passed: results.length,
                cases: results,
                clientDefined: expectedClientCaseCount,
                clientPassed: clientResults.length,
                clientCases: clientResults,
                revocationPassed,
              },
              null,
              2,
            ) + '\n',
          );
          // Restore only fixture administrator role for owned-shop cleanup after revocation.
          env.operator.sql(
            "update public.barbershop_memberships set status='active' where user_id='" +
              env.users[5].id +
              "' and barbershop_id='" +
              shops[0].id +
              "';",
          );
        }
      }),
    { userCount: 7 },
  );
});
