import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { fixture } from './fixtures/composition.mjs';
const require = createRequire(import.meta.url);
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'f@example.invalid',
  email_confirmed_at: '2026-11-15',
  is_anonymous: false,
};
function setup(platform = 'web') {
  const f = fixture(platform),
    opened = [];
  const { createSupabaseAuthAdapter } = f.load(
    path.resolve(
      'src/features/authentication/infrastructure/supabase-auth-adapter.ts',
    ),
  );
  const target =
    platform === 'web'
      ? 'http://localhost:8081/auth/callback'
      : 'appbarberia://auth/callback';
  const url = new URL('https://technical.supabase.co/auth/v1/authorize');
  url.search = new URLSearchParams({
    provider: 'google',
    redirect_to: target,
    code_challenge: 'a'.repeat(43),
    code_challenge_method: 's256',
  }).toString();
  const calls = { start: 0, exchange: 0, logout: 0 };
  const controls = { url: url.href, error: null };
  f.auth.signInWithOAuth = async (input) => {
    calls.start++;
    assert.equal(input.provider, 'google');
    assert.equal(input.options.redirectTo, target);
    assert.equal(input.options.skipBrowserRedirect, true);
    assert.equal(input.options.queryParams.prompt, 'select_account');
    assert.equal(input.options.scopes, undefined);
    await f.storage.setItem(
      'google-fixture-code-verifier',
      'synthetic-verifier',
    );
    return {
      data: { url: controls.url, provider: 'google' },
      error: controls.error,
    };
  };
  f.auth.getUser = async () => ({ data: { user }, error: null });
  f.auth.exchangeCodeForSession = async () => {
    calls.exchange++;
    return { data: { session: {}, redirectType: null }, error: null };
  };
  f.auth.signOut = async () => {
    calls.logout++;
    return { error: null };
  };
  const options = {
    baseUrl: 'https://technical.supabase.co',
    publicKey: 'sb_publishable_fixture',
    storage: f.storage,
    storageKey: 'google-fixture',
    confirmationRedirectUrl: target,
    googleEnabled: true,
    openOAuthUrl: async (value) => {
      opened.push(value);
    },
  };
  const adapter = createSupabaseAuthAdapter(options);
  return {
    ...f,
    adapter,
    options,
    opened,
    calls,
    controls,
    target,
    createSupabaseAuthAdapter,
  };
}
test('verified provider supplies only Google profile name suggestions, never phone or authorization metadata', async () => {
  const f = setup();
  const googleUser = {
    ...user,
    identities: [
      {
        provider: 'google',
        identity_data: {
          full_name: ' Nombre Google ',
          phone: 'do-not-copy',
          role: 'owner',
        },
      },
    ],
  };
  f.auth.getUser = async () => ({ data: { user: googleUser }, error: null });
  await f.adapter.signInWithGoogle();
  const result = await f.adapter.completeCallback({
    code: 'name-fixture',
    purpose: 'confirmation',
  });
  assert.equal(result.identity.suggestedDisplayName, 'Nombre Google');
  assert.equal(result.identity.phone, undefined);
  assert.equal(result.identity.role, undefined);
});

test('Google name hint is absent for email identities or missing names; unconfirmed users remain rejected', async () => {
  for (const identities of [
    undefined,
    [{ provider: 'email', identity_data: { full_name: 'Ignore' } }],
    [{ provider: 'google', identity_data: { full_name: ' ', name: {} } }],
  ]) {
    const f = setup();
    f.auth.getUser = async () => ({
      data: {
        user: {
          ...user,
          identities,
          user_metadata: { full_name: 'Do not copy' },
        },
      },
      error: null,
    });
    await f.adapter.signInWithGoogle();
    const result = await f.adapter.completeCallback({
      code: 'missing-name',
      purpose: 'confirmation',
    });
    assert.equal(result.identity.suggestedDisplayName, undefined);
  }
  const f = setup();
  f.auth.getUser = async () => ({
    data: {
      user: {
        ...user,
        email_confirmed_at: null,
        identities: [
          { provider: 'google', identity_data: { name: 'Ignore unverified' } },
        ],
      },
    },
    error: null,
  });
  await f.adapter.signInWithGoogle();
  await assert.rejects(
    f.adapter.completeCallback({ code: 'unverified', purpose: 'confirmation' }),
  );
});

for (const platform of ['web', 'android']) {
  test(
    platform +
      ' full composition keeps Google attempt across browser return, resolves existing own profile and tenant',
    async () => {
      const opened = [];
      const f = fixture(platform, false, 'https://technical.supabase.co', {
        googleEnabled: true,
        openOAuthUrl: async (url) => opened.push(url),
      });
      f.auth.getUser = async () => ({ data: { user }, error: null });
      f.auth.signInWithOAuth = async (input) => {
        const url = new URL('https://technical.supabase.co/auth/v1/authorize');
        url.search = new URLSearchParams({
          provider: 'google',
          redirect_to: input.options.redirectTo,
          code_challenge: 'a'.repeat(43),
          code_challenge_method: 's256',
        }).toString();
        return { data: { url: url.href, provider: 'google' }, error: null };
      };
      f.auth.exchangeCodeForSession = async () => ({
        data: { session: {} },
        error: null,
      });
      const app = f.foundation.createRegistrationApplication();
      await app.restoreAndVerify();
      assert.equal(app.canUseGoogle(), true);
      await app.signInWithGoogle();
      app.invalidateSession('lifecycle');
      await app.restoreAndVerify();
      assert.equal(app.getSnapshot().kind, 'oauth-pending');
      assert.equal(f.calls.length, 0);
      assert.equal(opened.length, 1);
      await app.completeCallback({
        code: 'synthetic',
        purpose: 'confirmation',
      });
      const state = app.getSnapshot();
      assert.equal(state.kind, 'ready');
      assert.equal(state.profile.userId, user.id);
      assert.equal(state.context.kind, 'none');
      assert.equal(f.counts().factories, 1);
      f.foundation.dispose();
    },
  );
  test(
    platform +
      ' Google uses exact provider/PKCE/target and verified unique callback',
    async () => {
      const f = setup(platform);
      await f.adapter.signInWithGoogle();
      assert.equal(f.opened.length, 1);
      assert.equal(await f.adapter.getAccessToken(), null);
      const input = { code: 'synthetic-code', purpose: 'confirmation' };
      const result = await f.adapter.completeCallback(input);
      await f.adapter.completeCallback(input);
      assert.equal(result.kind, 'authenticated');
      assert.equal(result.identity.userId, user.id);
      assert.equal(f.calls.exchange, 1);
      assert.equal(await f.adapter.getAccessToken(), 'opaque-unit-token');
      await f.adapter.signOutCurrent();
      assert.equal(f.calls.logout, 1);
      assert.equal(
        await f.storage.getItem('google-fixture-code-verifier'),
        null,
      );
      f.adapter.dispose();
      f.foundation.dispose();
    },
  );
  test(
    platform +
      ' rejects unsafe authorize URLs, implicit tokens, weak PKCE and disabled provider',
    async () => {
      const f = setup(platform);
      for (const change of [
        (u) => {
          u.hostname = 'attacker.invalid';
        },
        (u) => {
          u.pathname = '/other';
        },
        (u) => {
          u.searchParams.set('redirect_to', 'https://attacker.invalid');
        },
        (u) => {
          u.searchParams.set('provider', 'other');
        },
        (u) => {
          u.searchParams.set('code_challenge_method', 'plain');
        },
        (u) => {
          u.hash = 'access_token=synthetic';
        },
      ]) {
        const url = new URL(f.controls.url);
        change(url);
        const initial = f.controls.url;
        f.controls.url = url.href;
        await assert.rejects(() => f.adapter.signInWithGoogle());
        f.controls.url = initial;
      }
      assert.equal(f.opened.length, 0);
      const disabled = f.createSupabaseAuthAdapter({
        ...f.options,
        googleEnabled: false,
      });
      const before = f.calls.start;
      await assert.rejects(() => disabled.signInWithGoogle());
      assert.equal(f.calls.start, before);
      disabled.dispose();
      f.adapter.dispose();
      f.foundation.dispose();
    },
  );
}
test('installed Supabase SDK generates S256 locally without HTTP or manual identity linking', async () => {
  const f = setup();
  const { createClient } = require('@supabase/supabase-js');
  const opened = [];
  let requests = 0;
  const adapter = f.createSupabaseAuthAdapter({
    ...f.options,
    storageKey: 'real-google-pkce',
    openOAuthUrl: async (url) => {
      opened.push(new URL(url));
    },
    clientFactory: (url, key, config) =>
      createClient(url, key, {
        ...config,
        auth: { ...config.auth, autoRefreshToken: false },
        global: {
          fetch: async () => {
            requests++;
            throw Error('network forbidden');
          },
        },
      }),
  });
  await adapter.signInWithGoogle();
  assert.equal(opened[0].searchParams.get('code_challenge_method'), 's256');
  assert.equal(opened[0].searchParams.get('redirect_to'), f.target);
  assert.ok(await f.storage.getItem('real-google-pkce-code-verifier'));
  assert.equal(requests, 0);
  adapter.dispose();
  f.adapter.dispose();
  f.foundation.dispose();
});
test('denied Google callback is sanitized and cleaned; foreign/implicit returns remain rejected', () => {
  const f = setup();
  const { captureAuthLink } = f.load(
    path.resolve(
      'src/features/authentication/infrastructure/auth-links.web.ts',
    ),
  );
  const paths = [],
    config = {
      callbackUrl: f.target,
      recoveryUrl: f.target.replace('/callback', '/reset-password'),
    };
  assert.throws(
    () =>
      captureAuthLink(
        f.target + '?error=access_denied&error_description=private',
        config,
        (p) => paths.push(p),
      ),
    (e) => e.code === 'oauth-cancelled',
  );
  assert.deepEqual(paths, ['/auth/callback']);
  assert.throws(() =>
    captureAuthLink(
      'https://attacker.invalid/auth/callback?code=synthetic',
      config,
      () => {},
    ),
  );
  assert.throws(() =>
    captureAuthLink(f.target + '#access_token=synthetic', config, () => {}),
  );
  f.adapter.dispose();
  f.foundation.dispose();
});
test('platform launcher uses same-tab Web navigation and Android system browser without handling tokens', async () => {
  for (const platform of ['web', 'android']) {
    const calls = [],
      module = { exports: {} };
    const code = ts.transpileModule(
      fs.readFileSync('src/composition/oauth-browser.ts', 'utf8'),
      { compilerOptions: { module: ts.ModuleKind.CommonJS } },
    ).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      window: { location: { assign: (url) => calls.push(['web', url]) } },
    })(
      () => ({
        Platform: { OS: platform },
        Linking: { openURL: async (url) => calls.push(['android', url]) },
      }),
      module,
      module.exports,
    );
    await module.exports.openOAuthUrl(
      'https://technical.supabase.co/auth/v1/authorize',
    );
    assert.deepEqual(calls, [
      [platform, 'https://technical.supabase.co/auth/v1/authorize'],
    ]);
  }
});
