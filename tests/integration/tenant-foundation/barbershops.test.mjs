import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withProfileEnvironment } from './profile-environment.mjs';
import { withCompiledClient } from '../../../scripts/run-backend-integration.mjs';
import { duplicateMembershipRace } from './concurrency.mjs';
test('US3 real provisioning permissions rollback and races', async (t) => {
  await withProfileEnvironment(
    async (env) =>
      await withCompiledClient(async ({ createTenantFoundation }) => {
        const [a, b, c] = env.users;
        const make = (u) =>
          createTenantFoundation({
            baseUrl: env.url,
            publicKey: env.publicKey,
            getAccessToken: async () => u.token,
          });
        const A = make(a),
          B = make(b),
          C = make(c);
        const evidence = {};
        await assert.rejects(
          C.createOwnBarbershop({ name: 'Requires profile' }),
          { code: 'PROFILE_REQUIRED' },
        );
        await A.ensureOwnProfile({ displayName: 'Fixture A' });
        await B.ensureOwnProfile({ displayName: 'Fixture B' });
        await C.ensureOwnProfile({ displayName: 'Fixture C' });
        const shopA = await A.createOwnBarbershop({ name: 'Same' }),
          shopB = await B.createOwnBarbershop({ name: 'Same' });
        await t.test(
          'own first admin and tenant creation grants no other shop access',
          async () => {
            assert.equal(shopA.membership.userId, a.id);
            assert.equal(shopA.membership.role, 'administrator');
            assert.equal(shopA.membership.status, 'active');
            assert.equal(await A.getBarbershop(shopB.barbershop.id), null);
            assert.equal(await B.getBarbershop(shopA.barbershop.id), null);
            await assert.rejects(
              B.renameBarbershop(shopA.barbershop.id, 'Denied'),
              { code: 'NOT_AVAILABLE' },
            );
            assert.equal(
              (await A.renameBarbershop(shopA.barbershop.id, 'Renamed')).name,
              'Renamed',
            );
          },
        );
        env.operator.sql(
          "insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values ('" +
            a.id +
            "','" +
            shopB.barbershop.id +
            "','barber','active'),('" +
            c.id +
            "','" +
            shopA.barbershop.id +
            "','barber','active');",
        );
        await t.test(
          'shared admin A barber B has contextual read and denied rename',
          async () => {
            assert.equal(
              (await A.getBarbershop(shopB.barbershop.id)).id,
              shopB.barbershop.id,
            );
            await assert.rejects(
              A.renameBarbershop(shopB.barbershop.id, 'Denied'),
              { code: 'NOT_AVAILABLE' },
            );
            assert.equal(
              (await B.getBarbershop(shopB.barbershop.id)).name,
              'Same',
            );
            await assert.rejects(
              C.renameBarbershop(shopA.barbershop.id, 'Denied'),
              { code: 'NOT_AVAILABLE' },
            );
          },
        );
        await t.test(
          'body actor role extra IDs and direct user RPC denied',
          async () => {
            for (const field of [
              'actorId',
              'userId',
              'role',
              'status',
              'barbershopId',
            ]) {
              const r = await env.ordinary(
                a.token,
                '/functions/v1/create-barbershop',
                {
                  method: 'POST',
                  body: JSON.stringify({ name: 'Denied', [field]: b.id }),
                },
              );
              assert.equal(r.status, 400);
            }
            const direct = await env.ordinary(
              a.token,
              '/rest/v1/rpc/create_own_barbershop',
              {
                method: 'POST',
                body: JSON.stringify({ p_actor_id: a.id, p_name: 'Denied' }),
              },
            );
            assert.equal(direct.status, 403);
          },
        );
        await t.test(
          'C3 real HTTP failure rolls back shop and membership',
          async () => {
            const before = env.operator.sql(
              'select json_build_array((select count(*) from public.barbershops),(select count(*) from public.barbershop_memberships))::text;',
            );
            let installed = false;
            try {
              env.operator.sql(
                "create function private.test_t027_failure() returns trigger language plpgsql as $$begin raise exception 'TEST_C3';end;$$;revoke all on function private.test_t027_failure() from public,anon,authenticated,service_role;create trigger test_t027_failure before insert on public.barbershop_memberships for each row when(new.user_id='" +
                  c.id +
                  "'::uuid) execute function private.test_t027_failure();",
              );
              installed = true;
              const r = await env.ordinary(
                c.token,
                '/functions/v1/create-barbershop',
                { method: 'POST', body: JSON.stringify({ name: 'Rollback' }) },
              );
              assert.equal(r.status, 500);
              assert.equal(
                env.operator.sql(
                  'select json_build_array((select count(*) from public.barbershops),(select count(*) from public.barbershop_memberships))::text;',
                ),
                before,
              );
              evidence.C3 = { status: 500, partialRows: 0 };
            } finally {
              if (installed)
                env.operator.sql(
                  'drop trigger test_t027_failure on public.barbershop_memberships;drop function private.test_t027_failure();',
                );
            }
          },
        );
        await t.test(
          'C2 two psql sessions blocked at barrier then one UNIQUE rejection',
          async () => {
            evidence.C2 = await duplicateMembershipRace(
              env.operator,
              c.id,
              shopB.barbershop.id,
            );
            assert.equal(
              Number(
                env.operator.sql(
                  "select count(*) from public.barbershop_memberships where user_id='" +
                    c.id +
                    "' and barbershop_id='" +
                    shopB.barbershop.id +
                    "'",
                ),
              ),
              1,
            );
          },
        );
        await t.test(
          'C4 two simultaneous independent creations each own one admin',
          async () => {
            const results = await Promise.all([
              A.createOwnBarbershop({ name: 'Same' }),
              A.createOwnBarbershop({ name: 'Same' }),
            ]);
            assert.notEqual(results[0].barbershop.id, results[1].barbershop.id);
            for (const result of results) {
              assert.equal(result.membership.userId, a.id);
              assert.equal(result.membership.role, 'administrator');
              assert.equal(
                Number(
                  env.operator.sql(
                    "select count(*) from public.barbershop_memberships where barbershop_id='" +
                      result.barbershop.id +
                      "' and user_id='" +
                      a.id +
                      "' and role='administrator' and status='active'",
                  ),
                ),
                1,
              );
              assert.equal(
                Number(
                  env.operator.sql(
                    "select count(*) from public.barbershop_memberships where barbershop_id='" +
                      result.barbershop.id +
                      "'",
                  ),
                ),
                1,
              );
            }
            evidence.C4 = { shops: 2, ownAdmins: 2 };
          },
        );
        fs.writeFileSync(
          'docs/evaluacion/evidencias/002-fundacion/t027-carreras.json',
          JSON.stringify(evidence, null, 2) + '\n',
        );
      }),
  );
});
