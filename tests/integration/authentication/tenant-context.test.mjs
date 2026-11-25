import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture } from './fixtures/composition.mjs';
import { validateFixtureState } from '../../../scripts/local-auth-context-fixtures.mjs';

test('Web and Android compose real 002 membership/shop ports, without new endpoints or global roles', async () => {
  for (const platform of ['web', 'android']) {
    const f = fixture(platform),
      actor = '11111111-1111-4111-8111-111111111111';
    const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    let revoked = false;
    f.auth.signInWithPassword = async () => ({
      data: { session: {} },
      error: null,
    });
    f.auth.getUser = async () => ({
      data: {
        user: {
          id: actor,
          email: 'fixture@example.invalid',
          email_confirmed_at: '2026-11-14',
          is_anonymous: false,
        },
      },
      error: null,
    });
    // Inject transport only; application, parsers, identity checks and composition are production modules.
    const { createAuthFoundation } = f.load(
      process.cwd() + '/src/composition/auth-composition.ts',
    );
    const requests = [];
    const foundation = createAuthFoundation({
      baseUrl: 'https://technical.supabase.co',
      publicKey: 'sb_publishable_fixture',
      environment: 'test',
      project: 'context',
      storage: f.storage,
      clientFactory: () => ({ auth: f.auth }),
      fetcher: async (url) => {
        requests.push(url);
        let body;
        if (url.endsWith('/auth/v1/user'))
          body = { id: actor, is_anonymous: false };
        else if (url.includes('/profiles?'))
          body = [{ id: actor, display_name: 'Fixture', phone: null }];
        else if (url.includes('/barbershop_memberships?'))
          body = [
            {
              id: '11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              user_id: actor,
              barbershop_id: a,
              role: 'administrator',
              status: 'active',
            },
            {
              id: '22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              user_id: actor,
              barbershop_id: b,
              role: 'barber',
              status: revoked ? 'inactive' : 'active',
            },
          ];
        else if (url.includes('/barbershops?'))
          body = [
            { id: url.includes(a) ? a : b, name: url.includes(a) ? 'A' : 'B' },
          ];
        else assert.fail('Unexpected endpoint');
        return { ok: true, status: 200, json: async () => body };
      },
    });
    const app = foundation.createRegistrationApplication();
    await app.signIn({
      email: 'fixture@example.invalid',
      password: 'fictitious-only',
    });
    assert.equal(app.getSnapshot().context.kind, 'choosing');
    await app.selectContext(a);
    assert.equal(app.getSnapshot().context.context.role, 'administrator');
    await app.selectContext(b);
    assert.equal(app.getSnapshot().context.context.role, 'barber');
    assert.equal(app.getSnapshot().context.barbershop.name, 'B');
    revoked = true;
    await app.refreshContext();
    assert.equal(app.getSnapshot().kind, 'ready');
    assert.equal(app.getSnapshot().context.context.barbershopId, a);
    assert.ok(
      requests.every(
        (u) => u.includes('/auth/v1/user') || u.includes('/rest/v1/'),
      ),
    );
    foundation.dispose();
    f.foundation.dispose();
  }
});

test('fixture operator rejects other destinations, oversized sets and unowned identifiers before any operation', () => {
  const state = {
    owner: 'T027-context-local',
    project: 'app-barberia-002-local',
    run: 'abcdef123456',
    users: [],
    shops: [],
    memberships: [],
  };
  assert.equal(validateFixtureState(state), state);
  for (const change of [
    { project: 'barberia-app' },
    { users: Array(4).fill({}) },
    { shops: [{ id: 'not-uuid' }] },
    {
      memberships: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          userId: 'unknown',
          shopId: 'unknown',
        },
      ],
    },
  ])
    assert.throws(() => validateFixtureState({ ...state, ...change }));
});
