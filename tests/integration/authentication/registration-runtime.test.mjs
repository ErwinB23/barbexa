import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';
import { loadCore } from '../booking/load-core.mjs';
const require = createRequire(import.meta.url);
function fixture(
  platform,
  href,
  returnFence,
  environment = {},
  hooks = {},
  development = true,
) {
  const calls = {
    clients: 0,
    disposed: 0,
    removed: 0,
    callbacks: [],
    replaced: [],
    google: 0,
  };
  let urlListener;
  const source = {
    getSnapshot: () => ({ kind: 'signed-out' }),
    subscribe: () => () => {},
    register: async () => {},
    retryProfile: async () => {},
    canRetryProfile: () => false,
    signInWithGoogle: async () => {
      calls.google++;
    },
    completeCallback: async (input) => {
      calls.callbacks.push(input);
    },
  };
  const cache = new Map();
  const { createInbox } = loadCore(
    'src/features/notifications/application/inbox.ts',
  );
  let noticeRows = [
    { id: 'one', readAt: null },
    { id: 'two', readAt: null },
  ];
  let removedNotices = [];
  const foundationFactory =
    (legacy = false) =>
    (config) => {
      calls.clients++;
      calls.config = config;
      const notifications = createInbox({
        scope: () => 'fixture-account',
        gateway: {
          list: async () => ({
            items: noticeRows,
            unread: noticeRows.length,
            canRemove: true,
          }),
          read: async () => {},
          remove: async (id) => {
            removedNotices.push(id);
            noticeRows = noticeRows.filter((row) => row.id !== id);
          },
        },
      });
      if (legacy) delete notifications.removeNotice;
      return {
        notifications,
        createRegistrationApplication: () => source,
        tenant: { listOwnMemberships: async () => [] },
        dispose: () => {
          calls.disposed++;
          notifications.invalidate();
        },
      };
    };
  const composition = { createAuthFoundation: foundationFactory(true) };
  function load(file) {
    if (!['.ts', '.tsx'].includes(path.extname(file)))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync) ?? file;
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const resolve = (n) => {
      if (n === 'react') return { ...require(n), ...hooks };
      if (n === 'react-native')
        return {
          Platform: { OS: platform },
          Linking: {
            addEventListener: (_type, callback) => {
              urlListener = callback;
              return {
                remove: () => {
                  calls.removed++;
                },
              };
            },
            getInitialURL: async () => href,
          },
        };
      if (n === 'expo-constants')
        return {
          __esModule: true,
          default: { expoConfig: { hostUri: '192.168.0.33:8081' } },
        };
      if (n === './auth-composition') return composition;
      if (n === './auth-provider') return {};
      return n.startsWith('.')
        ? load(path.resolve(path.dirname(file), n))
        : require(n);
    };
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      URL,
      __DEV__: development,
      process: {
        env: {
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture',
          ...environment,
        },
      },
      window: {
        location: { origin: 'http://localhost:8081', href },
        history: { replaceState: (_a, _b, url) => calls.replaced.push(url) },
      },
    })(resolve, module, module.exports);
    return module.exports;
  }
  const { createRegistrationRuntime, RegistrationRuntimeProvider } = load(
    path.resolve('src/composition/registration-runtime-provider.tsx'),
  );
  return {
    calls,
    runtime: createRegistrationRuntime(returnFence),
    Provider: RegistrationRuntimeProvider,
    updateComposition() {
      composition.createAuthFoundation = foundationFactory();
    },
    removedNotices,
    emit: (url) => urlListener?.({ url }),
  };
}

test('a composition update replaces the retained runtime and supplies the current delete action without a page reload', async () => {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const same = (a, b) =>
    a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots))
        slots[index] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[index],
        (value) => {
          slots[index] = value;
        },
      ];
    },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!slots[index] || !same(slots[index].deps, deps))
        slots[index] = { deps, value: factory() };
      return slots[index].value;
    },
    useSyncExternalStore(_subscribe, snapshot) {
      return snapshot();
    },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || !same(previous.deps, deps))
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { deps, cleanup: effect() };
        });
    },
  };
  const f = fixture(
    'web',
    'http://localhost:8081/account?view=notices',
    undefined,
    {},
    hooks,
  );
  const render = () => {
    cursor = 0;
    return f.Provider({ children: null });
  };
  const flush = () => effects.splice(0).forEach((effect) => effect());
  const inbox = (node) => {
    if (!node) return null;
    if (node.props?.value?.getSnapshot?.().items) return node.props.value;
    return inbox(node.props?.children);
  };
  render();
  assert.equal(f.calls.clients, 0, 'render must not acquire SDK resources');
  flush();
  const legacy = inbox(render());
  assert.equal(typeof legacy.removeNotice, 'undefined');
  render();
  flush();
  assert.equal(f.calls.clients, 1, 'ordinary renders retain their runtime');
  f.updateComposition();
  render();
  flush();
  const current = inbox(render());
  assert.equal(f.calls.disposed, 1, 'the previous client must be released');
  assert.equal(f.calls.clients, 2);
  assert.notEqual(current, legacy);
  await current.load();
  await current.removeNotice('one');
  assert.deepEqual(f.removedNotices, ['one']);
  assert.equal(current.getSnapshot().items[0].id, 'two');
  assert.equal(current.getSnapshot().unread, 1);
});

test('2D isolated LOCAL runtime connects authority only on Web and cannot reuse the Cloud key or Google flag', () => {
  const env = {
    EXPO_PUBLIC_APP_ENVIRONMENT: 'local-team-authority',
    EXPO_PUBLIC_TEAM_LOCAL_URL: 'http://127.0.0.1:54421',
    EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY: 'sb_publishable_isolated_fixture',
    EXPO_PUBLIC_ENABLE_GOOGLE: 'true',
    EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_cloud_fixture',
  };
  const f = fixture('web', 'http://localhost:8081/sign-in', undefined, env);
  const stop = f.runtime.start();
  assert.equal(f.runtime.getSnapshot().configured, true);
  assert.equal(
    f.calls.config.publicKey,
    env.EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY,
  );
  assert.equal(f.calls.config.teamAuthorityEnabled, true);
  assert.equal(f.calls.config.googleEnabled, false);
  assert.equal(f.calls.config.adminInvitationsEnabled, true);
  stop();
  for (const platform of ['android', 'ios']) {
    const blocked = fixture(platform, 'appbarberia://sign-in', undefined, env);
    blocked.runtime.start()();
    assert.equal(blocked.calls.clients, 0);
  }
  const missing = fixture('web', 'http://localhost:8081/sign-in', undefined, {
    ...env,
    EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY: undefined,
  });
  missing.runtime.start()();
  assert.equal(missing.calls.clients, 0);
});
test('normal integrated Cloud selects one backend for all adapters and never falls back to the LOCAL public key', () => {
  const cloud = {
    EXPO_PUBLIC_APP_ENVIRONMENT: 'cloud-integration',
    EXPO_PUBLIC_CLOUD_SUPABASE_URL: 'https://vuoncrtkkkquvddunrxx.supabase.co',
    EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY:
      'sb_publishable_integrated_cloud_fixture',
    EXPO_PUBLIC_CLOUD_BACKEND_REVISION: '20261115230134',
  };
  for (const platform of ['web', 'android']) {
    const f = fixture(
      platform,
      platform === 'web'
        ? 'http://localhost:8081/sign-in'
        : 'appbarberia://sign-in',
      undefined,
      cloud,
    );
    const stop = f.runtime.start();
    assert.equal(f.runtime.getSnapshot().configured, true);
    assert.equal(f.calls.config.baseUrl, cloud.EXPO_PUBLIC_CLOUD_SUPABASE_URL);
    assert.equal(f.calls.config.googleEnabled, true);
    assert.equal(f.calls.config.teamAuthorityEnabled, true);
    assert.equal(f.calls.config.environment, 'cloud-integration');
    assert.equal(
      f.calls.config.publicKey,
      cloud.EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY,
    );
    assert.equal(f.calls.config.adminInvitationsEnabled, true);
    stop();
    for (const missing of [
      'EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY',
      'EXPO_PUBLIC_CLOUD_BACKEND_REVISION',
    ]) {
      const blocked = fixture(
        platform,
        'http://localhost:8081/sign-in',
        undefined,
        { ...cloud, [missing]: undefined },
      );
      blocked.runtime.start()();
      assert.equal(blocked.calls.clients, 0);
      assert.equal(blocked.runtime.getSnapshot().configured, false);
    }
  }
});

test('normal Google explicitly retires the diagnostic return fence before opening OAuth', async () => {
  let retired = 0;
  const f = fixture('web', 'http://localhost:8081/sign-in', {
    allow: async () => false,
    localFlowStarted: async () => {
      retired++;
    },
  });
  const stop = f.runtime.start();
  await f.runtime.getSnapshot().application.signInWithGoogle();
  assert.equal(retired, 1);
  assert.equal(f.calls.google, 1);
  stop();
  const denied = fixture('android', 'appbarberia://sign-in', {
    allow: async () => false,
    localFlowStarted: async () => {
      throw Error('active profile');
    },
  });
  const end = denied.runtime.start();
  await assert.rejects(() =>
    denied.runtime.getSnapshot().application.signInWithGoogle(),
  );
  assert.equal(denied.calls.google, 0);
  end();
});

test('Cloud-owned returns never reach the LOCAL callback consumer on either platform, including storage failure', async () => {
  for (const [platform, base] of [
    ['web', 'http://localhost:8081/auth/callback'],
    ['android', 'appbarberia://auth/callback'],
  ]) {
    for (const failed of [false, true]) {
      const f = fixture(platform, base + '?code=cloud-fixture', {
        allow: async () => {
          if (failed) throw Error('private-storage-detail');
          return false;
        },
        localFlowStarted: async () => {},
      });
      const stop = f.runtime.start();
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(f.calls.callbacks.length, 0);
      assert.equal(f.calls.replaced.length, 0);
      assert.equal(
        f.runtime.getSnapshot().callbackError,
        failed ? 'persistence-failed' : null,
      );
      stop();
    }
  }
});

test('the single runtime consumes recovery on both platforms, cleans Web query and leaves clean reload to session verification', async () => {
  for (const [platform, base] of [
    ['web', 'http://localhost:8081/auth/reset-password'],
    ['android', 'appbarberia://auth/reset-password'],
  ]) {
    const f = fixture(platform, `${base}?code=synthetic&sb_flow_id=flow_123`);
    const stop = f.runtime.start();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(f.calls.callbacks.length, 1);
    assert.equal(f.calls.callbacks[0].purpose, 'recovery');
    assert.equal(f.calls.callbacks[0].flowId, 'flow_123');
    assert.ok(f.calls.config.recoveryRedirectUrl.endsWith('/reset-password'));
    if (platform === 'web')
      assert.deepEqual(f.calls.replaced, ['/auth/reset-password']);
    stop();
    const clean = fixture(platform, base);
    clean.runtime.start()();
    await Promise.resolve();
    assert.equal(clean.calls.callbacks.length, 0);
  }
});
test('Web runtime creates the client only on mount, removes sensitive callback parameters and disposes it', async () => {
  const f = fixture(
    'web',
    'http://localhost:8081/auth/callback?code=fictitious-code',
  );
  assert.equal(f.calls.clients, 0);
  const stop = f.runtime.start();
  await Promise.resolve();
  assert.equal(f.calls.clients, 1);
  assert.equal(f.runtime.getSnapshot().configured, true);
  assert.equal(f.calls.callbacks.length, 1);
  assert.equal(f.calls.callbacks[0].purpose, 'confirmation');
  assert.equal(f.runtime.getSnapshot().capturedReturn, '/auth/callback');
  assert.deepEqual(f.calls.replaced, ['/auth/callback']);
  assert.equal(
    f.calls.config.confirmationRedirectUrl,
    'http://localhost:8081/auth/callback',
  );
  stop();
  assert.equal(f.calls.disposed, 1);
});
test('Android runtime uses the local API and native callback, removes listeners and ignores late links', async () => {
  const f = fixture(
    'android',
    'appbarberia://auth/callback?code=fictitious-native-code',
  );
  const stop = f.runtime.start();
  await Promise.resolve();
  assert.equal(f.calls.config.baseUrl, 'http://192.168.0.33:54421');
  assert.equal(
    f.calls.config.confirmationRedirectUrl,
    'appbarberia://auth/callback',
  );
  assert.equal(f.calls.callbacks.length, 1);
  f.emit(
    'appbarberia://auth/callback#access_token=fictitious-rejected-fragment',
  );
  await Promise.resolve();
  assert.equal(f.runtime.getSnapshot().callbackError, 'link-invalid');
  assert.equal(f.calls.callbacks.length, 1);
  stop();
  f.emit('appbarberia://auth/callback?code=late-fictitious');
  await Promise.resolve();
  assert.equal(f.calls.callbacks.length, 1);
  assert.equal(f.calls.disposed, 1);
  assert.equal(f.calls.removed, 1);
});

test('Released Cloud authority defaults on; explicit disable still prevents invitations on Web or Android', () => {
  const cloud = {
    EXPO_PUBLIC_APP_ENVIRONMENT: 'cloud-integration',
    EXPO_PUBLIC_CLOUD_SUPABASE_URL: 'https://vuoncrtkkkquvddunrxx.supabase.co',
    EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY:
      'sb_publishable_integrated_cloud_fixture',
    EXPO_PUBLIC_CLOUD_BACKEND_REVISION: '20261115230134',
    EXPO_PUBLIC_CLOUD_ENABLE_ADMIN_INVITATIONS: 'true',
  };
  for (const platform of ['web', 'android']) {
    for (const enabled of [undefined, 'false', 'true']) {
      const f = fixture(platform, 'http://localhost:8081/sign-in', undefined, {
        ...cloud,
        EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY: enabled,
      });
      const stop = f.runtime.start();
      assert.equal(f.calls.config.teamAuthorityEnabled, enabled !== 'false');
      assert.equal(f.calls.config.adminInvitationsEnabled, enabled !== 'false');
      stop();
    }
  }
});

for (const platform of ['web', 'android'])
  test(
    platform +
      ': released Cloud administration survives fresh runtimes without launch flags',
    () => {
      const environment = {
        EXPO_PUBLIC_APP_ENVIRONMENT: 'cloud-integration',
        EXPO_PUBLIC_CLOUD_SUPABASE_URL:
          'https://vuoncrtkkkquvddunrxx.supabase.co',
        EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY:
          'sb_publishable_integrated_cloud_fixture',
        EXPO_PUBLIC_CLOUD_BACKEND_REVISION: '20261115230134',
      };
      for (let login = 0; login < 2; login++) {
        const f = fixture(
          platform,
          'http://localhost:8081/sign-in',
          undefined,
          environment,
        );
        const stop = f.runtime.start();
        assert.equal(f.calls.config.teamAuthorityEnabled, true);
        assert.equal(f.calls.config.adminInvitationsEnabled, true);
        assert.equal(f.calls.config.adminInvitationDelivery, 'in-app');
        stop();
      }
      const invalid = fixture(
        platform,
        'http://localhost:8081/sign-in',
        undefined,
        { ...environment, EXPO_PUBLIC_CLOUD_BACKEND_REVISION: 'unverified' },
      );
      invalid.runtime.start()();
      assert.equal(invalid.calls.clients, 0);
    },
  );

test('production uses already released administrative features only after backend configuration validation', () => {
  const environment = {
    EXPO_PUBLIC_SUPABASE_URL: 'https://vuoncrtkkkquvddunrxx.supabase.co',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_production_fixture',
    EXPO_PUBLIC_WEB_ORIGIN: 'https://barbexa.example',
    EXPO_PUBLIC_CLOUD_BACKEND_REVISION: '20261115230134',
  };
  const f = fixture(
    'web',
    'https://barbexa.example/sign-in',
    undefined,
    environment,
    {},
    false,
  );
  f.runtime.start()();
  assert.equal(f.calls.config.environment, 'production');
  assert.equal(f.calls.config.teamAuthorityEnabled, true);
  assert.equal(f.calls.config.adminInvitationsEnabled, true);
  assert.equal(f.calls.config.adminInvitationDelivery, 'in-app');
  const blocked = fixture(
    'web',
    'https://barbexa.example/sign-in',
    undefined,
    { ...environment, EXPO_PUBLIC_CLOUD_BACKEND_REVISION: undefined },
    {},
    false,
  );
  blocked.runtime.start()();
  assert.equal(blocked.calls.clients, 0);
});
