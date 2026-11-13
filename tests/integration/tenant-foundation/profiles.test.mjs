import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withProfileEnvironment } from './profile-environment.mjs';
import { withCompiledClient } from '../../../scripts/run-backend-integration.mjs';
test('real Auth Edge PostgREST profiles and C1', async (t) => {
  await withProfileEnvironment(
    async (env) =>
      await withCompiledClient(async ({ createTenantFoundation }) => {
        const make = (user) =>
          createTenantFoundation({
            baseUrl: env.url,
            publicKey: env.publicKey,
            getAccessToken: async () => user.token,
          });
        const [a, b, c] = env.users,
          clientA = make(a),
          clientB = make(b),
          clientC = make(c);
        await t.test(
          'own absence ensure idempotence read and PATCH null/omitted',
          async () => {
            assert.equal(await clientA.getOwnProfile(), null);
            const initial = await clientA.ensureOwnProfile({
              displayName: ' First ',
              phone: '1',
            });
            assert.equal(initial.userId, a.id);
            const again = await clientA.ensureOwnProfile({
              displayName: 'Replacement',
              phone: null,
            });
            assert.deepEqual(again, initial);
            await clientA.updateOwnProfile({ displayName: 'Edited' });
            assert.ok((await clientA.getOwnProfile()).phone !== null);
            await clientA.updateOwnProfile({ phone: null });
            assert.ok((await clientA.getOwnProfile()).phone === null);
            await clientB.ensureOwnProfile({ displayName: 'Other' });
          },
        );
        await t.test(
          'other profile hidden and unchanged despite forged admin metadata',
          async () => {
            const r = await env.ordinary(
              a.token,
              '/rest/v1/profiles?select=id,display_name,phone&id=eq.' + b.id,
            );
            assert.equal(r.status, 200);
            assert.deepEqual(await r.json(), []);
            const patch = await env.ordinary(
              a.token,
              '/rest/v1/profiles?id=eq.' + b.id,
              {
                method: 'PATCH',
                headers: { Prefer: 'return=representation' },
                body: JSON.stringify({ display_name: 'Forbidden' }),
              },
            );
            assert.equal(patch.status, 200);
            assert.deepEqual(await patch.json(), []);
            assert.equal((await clientB.getOwnProfile()).displayName, 'Other');
          },
        );
        await t.test(
          'body impersonation extra fields invalid JSON and types rejected',
          async () => {
            for (const body of [
              { displayName: 'Name', userId: b.id },
              { displayName: 'Name', actorId: b.id },
              { displayName: 'Name', role: 'administrator' },
              { displayName: 'Name', status: 'active' },
              { displayName: ' ' },
              { displayName: 'Name', phone: 9 },
            ]) {
              const r = await env.ordinary(
                a.token,
                '/functions/v1/ensure-profile',
                { method: 'POST', body: JSON.stringify(body) },
              );
              assert.equal(r.status, 400);
            }
            const invalid = await env.ordinary(
              a.token,
              '/functions/v1/ensure-profile',
              { method: 'POST', body: '{' },
            );
            assert.equal(invalid.status, 400);
            assert.equal((await clientA.getOwnProfile()).displayName, 'Edited');
            assert.equal((await clientB.getOwnProfile()).displayName, 'Other');
          },
        );
        await t.test(
          'privileged RPC direct INSERT DELETE and id mutation denied',
          async () => {
            for (const [path, method, body] of [
              [
                '/rest/v1/rpc/ensure_own_profile',
                'POST',
                { p_actor_id: b.id, p_display_name: 'Spoof', p_phone: null },
              ],
              [
                '/rest/v1/profiles',
                'POST',
                { id: c.id, display_name: 'Spoof' },
              ],
              ['/rest/v1/profiles?id=eq.' + a.id, 'DELETE', undefined],
              ['/rest/v1/profiles?id=eq.' + a.id, 'PATCH', { id: b.id }],
            ]) {
              const r = await env.ordinary(a.token, path, {
                method,
                body: body ? JSON.stringify(body) : undefined,
              });
              assert.equal(r.status, 403);
            }
            assert.equal(env.profileCount(c.id), 0);
          },
        );
        await t.test(
          'missing altered expired and independent-key JWT denied',
          async () => {
            const missing = await fetch(
              env.url + '/functions/v1/ensure-profile',
              {
                method: 'POST',
                headers: {
                  apikey: env.publicKey,
                  'Content-Type': 'application/json',
                },
                body: '{}',
              },
            );
            assert.equal(missing.status, 401);
            const signingControl = await env.ordinary(
              env.signedFixture('fresh'),
              '/auth/v1/user',
            );
            assert.equal(signingControl.status, 200);
            const altered = a.token.slice(0, -8) + 'XXXXXXXX';
            for (const token of [
              altered,
              env.signedFixture('expired'),
              env.signedFixture('foreign'),
            ]) {
              const r = await env.ordinary(
                token,
                '/functions/v1/ensure-profile',
                {
                  method: 'POST',
                  body: JSON.stringify({ displayName: 'Denied' }),
                },
              );
              assert.equal(r.status, 401);
            }
          },
        );
        await t.test(
          'C1 simultaneous ensure creates one profile and never overwrites winner',
          async () => {
            let start;
            const gate = new Promise((resolve) => {
              start = resolve;
            });
            const pending = ['Winner A', 'Winner B'].map(
              async (displayName) => {
                await gate;
                return clientC.ensureOwnProfile({ displayName });
              },
            );
            start();
            const results = await Promise.all(pending);
            assert.equal(results[0].userId, c.id);
            assert.deepEqual(results[0], results[1]);
            assert.equal(env.profileCount(c.id), 1);
          },
        );
        await t.test(
          '8 KiB and unsupported method rejected on real handler',
          async () => {
            const large = await env.ordinary(
              a.token,
              '/functions/v1/ensure-profile',
              {
                method: 'POST',
                body: JSON.stringify({ displayName: 'x'.repeat(8193) }),
              },
            );
            assert.equal(large.status, 413);
            const method = await env.ordinary(
              a.token,
              '/functions/v1/ensure-profile',
              { method: 'GET' },
            );
            assert.equal(method.status, 405);
          },
        );
      }),
  );
});
