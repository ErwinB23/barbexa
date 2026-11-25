import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fixture } from './fixtures/composition.mjs';
const origin = 'https://vuoncrtkkkquvddunrxx.supabase.co';
const project = 'vuoncrtkkkquvddunrxx';
const revision = '20261115230134';
const publicKey = 'sb_publishable_cloud_integration_fixture';
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'fixture@example.invalid',
  email_confirmed_at: '2026-11-15',
  is_anonymous: false,
};
test('normal Cloud runtime is opt-in, requires a verified release revision and keeps LOCAL as the default', () => {
  const f = fixture('web', true),
    { registrationEnvironment } = f.load(
      path.resolve('src/composition/registration-environment.ts'),
    );
  const input = {
    development: true,
    environment: 'cloud-integration',
    platform: 'web',
    webOrigin: 'http://localhost:8081',
    apiUrl: origin,
    publicKey,
    cloudBackendRevision: revision,
  };
  for (const platform of ['web', 'android']) {
    const config = registrationEnvironment({ ...input, platform });
    assert.equal(config.baseUrl, origin);
    assert.equal(config.project, project);
    assert.equal(config.environment, 'cloud-integration');
    assert.equal(config.cloudBackendRevision, revision);
    assert.equal(config.developmentHttpOrigin, undefined);
  }
  for (const change of [
    { cloudBackendRevision: undefined },
    { cloudBackendRevision: 'not-verified' },
    { apiUrl: 'http://127.0.0.1:54421' },
    { apiUrl: 'https://klebvayvsvibwjpkzrff.supabase.co' },
    { publicKey: 'sb_secret_forbidden' },
    { development: false },
    { webOrigin: 'http://localhost:8082' },
  ])
    assert.throws(() => registrationEnvironment({ ...input, ...change }));
  const local = registrationEnvironment({
    ...input,
    environment: 'local',
    metroHostUri: '192.168.0.16:8081',
  });
  assert.equal(local.baseUrl, 'http://127.0.0.1:54421');
  assert.equal(local.project, 'app-barberia-002-local');
});
test('Cloud business construction rejects an unverified backend before creating an SDK', () => {
  const f = fixture('web', true),
    { createAuthFoundation } = f.load(
      path.resolve('src/composition/auth-composition.ts'),
    );
  const before = f.counts().factories;
  assert.throws(() =>
    createAuthFoundation({
      baseUrl: origin,
      publicKey,
      project,
      environment: 'cloud-integration',
      storage: f.storage,
    }),
  );
  assert.equal(f.counts().factories, before);
});

test('production cannot bypass the unverified Cloud release gate by using a different environment name', () => {
  const f = fixture('web', false),
    { createAuthFoundation } = f.load(
      path.resolve('src/composition/auth-composition.ts'),
    );
  const { registrationEnvironment } = f.load(
    path.resolve('src/composition/registration-environment.ts'),
  );
  const config = {
    development: false,
    environment: 'production',
    platform: 'web',
    apiUrl: origin,
    publicKey,
    publicWebOrigin: 'https://delivery.example.invalid',
  };
  assert.throws(() => registrationEnvironment(config));
  const before = f.counts().factories;
  assert.throws(() =>
    createAuthFoundation({
      baseUrl: origin,
      publicKey,
      project,
      environment: 'production',
      storage: f.storage,
    }),
  );
  assert.equal(f.counts().factories, before);
  const released = registrationEnvironment({
    ...config,
    cloudBackendRevision: revision,
  });
  assert.equal(released.cloudBackendRevision, revision);
});
test('one pinned transport protects Auth and business from LOCAL, another project and HTTP redirects', async () => {
  const f = fixture('web', true),
    { createPinnedProjectFetch } = f.load(
      path.resolve(
        'src/features/authentication/infrastructure/project-transport.ts',
      ),
    );
  const sent = [];
  const transport = createPinnedProjectFetch(origin, async (url, init) => {
    sent.push({ url: String(url), redirect: init.redirect });
    return Response.json({});
  });
  for (const endpoint of [
    '/auth/v1/token',
    '/auth/v1/user',
    '/rest/v1/profiles',
    '/functions/v1/ensure-profile',
  ])
    await transport(origin + endpoint, {
      headers: { Authorization: 'Bearer fixture' },
    });
  assert.equal(sent.length, 4);
  assert.ok(sent.every((x) => x.redirect === 'error'));
  for (const url of [
    'http://127.0.0.1:54421/auth/v1/user',
    'http://192.168.0.16:54421/rest/v1/profiles',
    'https://other.supabase.co/functions/v1/reservation-command',
    origin + '/storage/v1/object',
    origin + '/auth/v10/user',
  ])
    await assert.rejects(() =>
      transport(url, { headers: { Authorization: 'Bearer fixture' } }),
    );
  assert.equal(sent.length, 4);
});
for (const platform of ['web', 'android'])
  for (const existing of [false, true])
    test(
      platform +
        ': normal Google ' +
        (existing
          ? 'reuses verified existing identity/profile/membership without creates'
          : 'requires explicit profile before any business access'),
      async () => {
        const f = fixture(platform, true),
          { createAuthFoundation } = f.load(
            path.resolve('src/composition/auth-composition.ts'),
          );
        const requests = [];
        let profile = existing
            ? { id: user.id, display_name: 'Existing', phone: null }
            : null,
          creates = 0,
          exchanges = 0;
        const { cloudBusinessRevision } = f.load(
          path.resolve('src/composition/registration-environment.ts'),
        );
        assert.equal(cloudBusinessRevision, revision);
        f.auth.getUser = async () => ({ data: { user }, error: null });
        f.auth.signInWithOAuth = async (input) => {
          const url = new URL(origin + '/auth/v1/authorize');
          url.search = new URLSearchParams({
            provider: 'google',
            redirect_to: input.options.redirectTo,
            code_challenge: 'a'.repeat(43),
            code_challenge_method: 's256',
          });
          return { data: { url: url.href, provider: 'google' }, error: null };
        };
        f.auth.exchangeCodeForSession = async () => {
          exchanges++;
          return { data: { session: {} }, error: null };
        };
        const membership = {
          id: '22222222-2222-4222-8222-222222222222',
          user_id: user.id,
          barbershop_id: '33333333-3333-4333-8333-333333333333',
          role: 'barber',
          status: 'active',
        };
        const fetcher = async (raw, init) => {
          const url = new URL(raw);
          assert.equal(url.origin, origin);
          assert.equal(init.redirect, 'error');
          requests.push({
            pathname: url.pathname,
            method: init.method ?? 'GET',
          });
          if (url.pathname === '/auth/v1/user')
            return Response.json({ id: user.id, is_anonymous: false });
          if (url.pathname === '/functions/v1/ensure-profile') {
            creates++;
            const input = JSON.parse(init.body);
            profile = {
              id: user.id,
              display_name: input.displayName,
              phone: input.phone,
            };
            return Response.json({
              userId: user.id,
              displayName: profile.display_name,
              phone: null,
            });
          }
          if (url.pathname === '/rest/v1/profiles')
            return Response.json(profile ? [profile] : []);
          if (url.pathname === '/rest/v1/barbershop_memberships')
            return Response.json(existing ? [membership] : []);
          if (url.pathname === '/rest/v1/barbershops')
            return Response.json([
              { id: membership.barbershop_id, name: 'Fixture' },
            ]);
          throw Error('unexpected request');
        };
        const foundation = createAuthFoundation({
          baseUrl: origin,
          publicKey,
          project,
          environment: 'cloud-integration',
          cloudBackendRevision: revision,
          storage: f.storage,
          googleEnabled: true,
          confirmationRedirectUrl:
            platform === 'web'
              ? 'http://localhost:8081/auth/callback'
              : 'appbarberia://auth/callback',
          openOAuthUrl: async () => {},
          fetcher,
        });
        const authKey = f.options.auth.storageKey;
        assert.ok(authKey.includes('cloud-integration'));
        await assert.rejects(() =>
          f.options.global.fetch('http://127.0.0.1:54421/auth/v1/user'),
        );
        const app = foundation.createRegistrationApplication();
        await app.restoreAndVerify();
        await app.signInWithGoogle();
        const callback = {
          code: 'synthetic-cloud-code',
          purpose: 'confirmation',
        };
        await Promise.all([
          app.completeCallback(callback),
          app.completeCallback(callback),
        ]);
        assert.equal(exchanges, 1);
        if (!existing) {
          assert.equal(app.getSnapshot().kind, 'profile-required');
          assert.equal(creates, 0);
          assert.ok(
            !requests.some((x) =>
              x.pathname.includes('barbershop_memberships'),
            ),
          );
          await app.retryProfile({ displayName: 'Explicit name', phone: null });
          assert.equal(creates, 1);
        }
        const state = app.getSnapshot();
        assert.equal(state.kind, 'ready');
        assert.equal(state.identity.userId, user.id);
        assert.equal(state.profile.userId, user.id);
        if (existing) {
          assert.equal(creates, 0);
          assert.equal(state.profile.displayName, 'Existing');
          assert.equal(state.context.kind, 'selected');
          assert.equal(state.context.context.role, 'barber');
        } else assert.equal(state.context.kind, 'none');
        assert.ok(
          !requests.some(
            (x) => x.method === 'POST' && x.pathname.includes('memberships'),
          ),
        );
        foundation.dispose();
        f.foundation.dispose();
      },
    );
