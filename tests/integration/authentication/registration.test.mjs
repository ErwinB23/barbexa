import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';

function load(file, sdk) {
  if (!path.extname(file)) file += '.ts';
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const require = (name) =>
    name === '@supabase/supabase-js'
      ? { createClient: () => sdk }
      : load(path.resolve(path.dirname(file), name), sdk);
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    URL,
    atob,
    queueMicrotask,
    __DEV__: false,
  })(require, module, module.exports);
  return module.exports;
}
const input = {
  email: 'test@example.invalid',
  password: 'test-only-not-real',
  displayName: 'Prueba técnica',
  phone: null,
};
function fixture() {
  const calls = { signUp: 0, exchange: 0, getUser: 0 };
  const controls = {
    signUp: async () => ({
      data: {
        user: { id: '11111111-1111-4111-8111-111111111111' },
        session: null,
      },
      error: null,
    }),
    exchange: async () => ({ data: { session: {} }, error: null }),
    user: async () => ({
      data: {
        user: {
          id: '11111111-1111-4111-8111-111111111111',
          email: input.email,
          email_confirmed_at: '2026-11-14T00:00:00Z',
          is_anonymous: false,
        },
      },
      error: null,
    }),
  };
  const sdk = {
    auth: {
      signUp: async () => {
        calls.signUp++;
        return controls.signUp();
      },
      exchangeCodeForSession: async () => {
        calls.exchange++;
        return controls.exchange();
      },
      getUser: async () => {
        calls.getUser++;
        return controls.user();
      },
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      stopAutoRefresh() {},
      getSession: async () => ({
        data: { session: { access_token: 'test-only-old-session' } },
        error: null,
      }),
    },
  };
  const { createSupabaseAuthAdapter } = load(
    path.resolve(
      'src/features/authentication/infrastructure/supabase-auth-adapter.ts',
    ),
    sdk,
  );
  const adapter = createSupabaseAuthAdapter({
    baseUrl: 'https://technical.supabase.co',
    publicKey: 'sb_publishable_test',
    confirmationRedirectUrl: 'http://localhost:8081/auth/callback',
    storageKey: 'test-registration',
    storage: {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    },
  });
  return { adapter, calls, controls };
}
test('SDK signUp user without session remains confirmation-required, not authenticated', async () => {
  const f = fixture();
  assert.equal(
    typeof f.adapter.register,
    'function',
    'T011: register adapter missing',
  );
  try {
    assert.equal(
      (await f.adapter.register(input)).kind,
      'confirmation-required',
    );
    assert.equal(f.calls.getUser, 0);
  } finally {
    f.adapter.dispose();
  }
});
test('SDK signup transport exception is translated without raw provider details or automatic retry', async () => {
  const f = fixture();
  assert.equal(
    typeof f.adapter.register,
    'function',
    'T011: register adapter missing',
  );
  f.controls.signUp = async () => {
    throw new TypeError('Fetch failed; internal test-only detail');
  };
  try {
    await assert.rejects(
      () => f.adapter.register(input),
      (e) =>
        e.code === 'network-unavailable' && !e.message.includes('internal'),
    );
    assert.equal(f.calls.signUp, 1);
  } finally {
    f.adapter.dispose();
  }
});
test('SDK weak_password at signup is mapped to a safe policy error', async () => {
  const f = fixture();
  f.controls.signUp = async () => ({
    error: {
      code: 'weak_password',
      status: 422,
      message: 'provider-only detail',
    },
  });
  try {
    await assert.rejects(
      () => f.adapter.register(input),
      (error) =>
        error.code === 'weak-password' && error.message === 'weak-password',
    );
    assert.equal(f.calls.signUp, 1);
  } finally {
    f.adapter.dispose();
  }
});
test('successful exchange must verify getUser and never trusts session user metadata', async () => {
  const f = fixture();
  assert.equal(
    typeof f.adapter.completeCallback,
    'function',
    'T011: callback adapter missing',
  );
  f.controls.exchange = async () => ({
    data: {
      session: {
        user: { id: 'untrusted', user_metadata: { role: 'administrator' } },
      },
    },
    error: null,
  });
  try {
    const result = await f.adapter.completeCallback({
      code: 'test-code',
      purpose: 'confirmation',
    });
    assert.equal(result.kind, 'authenticated');
    assert.equal(
      result.identity.userId,
      '11111111-1111-4111-8111-111111111111',
    );
    assert.equal(result.identity.role, undefined);
    assert.equal(f.calls.getUser, 1);
  } finally {
    f.adapter.dispose();
  }
});
test('missing PKCE verifier rejects the callback without falling back to implicit flow', async () => {
  const f = fixture();
  assert.equal(
    typeof f.adapter.completeCallback,
    'function',
    'T011: callback adapter missing',
  );
  f.controls.exchange = async () => ({
    data: { session: null },
    error: {
      code: 'flow_state_not_found',
      message: 'test-only provider detail',
    },
  });
  try {
    await assert.rejects(
      () =>
        f.adapter.completeCallback({
          code: 'test-code',
          purpose: 'confirmation',
        }),
      (e) => e.code === 'link-invalid',
    );
    assert.equal(f.calls.getUser, 0);
  } finally {
    f.adapter.dispose();
  }
});
for (const platform of ['web', 'native']) {
  test(`${platform} link parser accepts only configured confirmation/recovery targets and rejects token fragments`, () => {
    const parser = load(
      path.resolve(
        `src/features/authentication/infrastructure/auth-links.${platform}.ts`,
      ),
    );
    assert.equal(
      typeof parser.parseAuthLink,
      'function',
      'T011: configured link parser missing',
    );
    const config =
      platform === 'web'
        ? {
            callbackUrl: 'http://localhost:8081/auth/callback',
            recoveryUrl: 'http://localhost:8081/auth/reset-password',
          }
        : {
            callbackUrl: 'appbarberia://auth/callback',
            recoveryUrl: 'appbarberia://auth/reset-password',
          };
    assert.equal(
      parser.parseAuthLink(config.callbackUrl + '?code=test-code', config).code,
      'test-code',
    );
    for (const url of [
      'https://attacker.invalid/auth/callback?code=test',
      config.callbackUrl.replace('/callback', '/other') + '?code=test',
      config.callbackUrl + '#access_token=test',
      config.callbackUrl + '?code=',
    ]) {
      assert.throws(
        () => parser.parseAuthLink(url, config),
        (e) => e.code === 'link-invalid',
      );
    }
  });
}
test('failed PKCE resolution never releases an older session to tenant adapters', async () => {
  const f = fixture();
  f.controls.exchange = async () => ({
    data: { session: null },
    error: { code: 'flow_state_not_found' },
  });
  await assert.rejects(() =>
    f.adapter.completeCallback({
      code: 'missing-state',
      purpose: 'confirmation',
    }),
  );
  assert.equal(await f.adapter.getAccessToken(), null);
  f.adapter.dispose();
});
test('recovery path alone cannot establish recovery; SDK purpose is definitive', async () => {
  const f = fixture();
  await assert.rejects(
    () =>
      f.adapter.completeCallback({
        code: 'ordinary-code',
        purpose: 'recovery',
      }),
    (e) => e.code === 'link-invalid',
  );
  assert.equal(await f.adapter.getAccessToken(), null);
  f.adapter.dispose();
  const g = fixture();
  g.controls.exchange = async () => ({
    data: { session: {}, redirectType: 'recovery' },
    error: null,
  });
  // A mismatched callback path must now fail closed, not authorize recovery.
  await assert.rejects(
    () =>
      g.adapter.completeCallback({
        code: 'recovery-code',
        purpose: 'confirmation',
      }),
    (e) => e.code === 'link-invalid',
  );
  assert.equal(await g.adapter.getAccessToken(), null);
  g.adapter.dispose();
});
test('Web captures and removes code/hash parameters before exposing state, even for invalid callbacks', () => {
  const links = load(
    path.resolve(
      'src/features/authentication/infrastructure/auth-links.web.ts',
    ),
  );
  const config = {
    callbackUrl: 'http://localhost:8081/auth/callback',
    recoveryUrl: 'http://localhost:8081/auth/reset-password',
  };
  const replacements = [];
  assert.equal(
    links.captureAuthLink(config.callbackUrl + '?code=one-use', config, (p) =>
      replacements.push(p),
    ).code,
    'one-use',
  );
  assert.throws(() =>
    links.captureAuthLink(
      config.recoveryUrl + '#access_token=forbidden',
      config,
      (p) => replacements.push(p),
    ),
  );
  assert.deepEqual(replacements, ['/auth/callback', '/auth/reset-password']);
  for (const platform of ['web', 'native']) {
    const parser = load(
      path.resolve(
        `src/features/authentication/infrastructure/auth-links.${platform}.ts`,
      ),
    );
    const cfg =
      platform === 'web'
        ? config
        : {
            callbackUrl: 'appbarberia://auth/callback',
            recoveryUrl: 'appbarberia://auth/reset-password',
          };
    assert.throws(() =>
      parser.parseAuthLink(cfg.callbackUrl + '?code=a&code=b', cfg),
    );
    assert.throws(() =>
      parser.parseAuthLink(
        cfg.callbackUrl + '?code=a&next=https://other.invalid',
        cfg,
      ),
    );
  }
});
