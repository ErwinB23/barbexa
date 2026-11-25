import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';
const root = process.cwd();
const nativeRequire = createRequire(path.join(root, 'package.json'));
const actor = '11111111-1111-4111-8111-111111111111';
export function fixture(
  platform = 'web',
  development = false,
  baseUrl = 'https://technical.supabase.co',
  extraOptions = {},
) {
  let callback;
  let factories = 0,
    subscriptions = 0,
    unsubscribes = 0;
  let sessionReads = 0,
    stopped = 0;
  let options;
  const cache = new Map();
  const values = new Map();
  const storage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
  };
  const auth = {
    getSession: async () => {
      sessionReads++;
      return {
        data: { session: { access_token: 'opaque-unit-token' } },
        error: null,
      };
    },
    onAuthStateChange: (listener) => {
      subscriptions++;
      callback = listener;
      return {
        data: {
          subscription: {
            unsubscribe() {
              unsubscribes++;
            },
          },
        },
      };
    },
    stopAutoRefresh: () => {
      stopped++;
    },
  };
  const factory = (_url, _key, config) => {
    factories++;
    options = config;
    return { auth };
  };
  const globals = {
    __DEV__: development,
    queueMicrotask,
    setTimeout,
    clearTimeout,
    console,
    Uint8Array,
    Uint32Array,
    ArrayBuffer,
    TextEncoder,
    crypto: platform === 'web' ? webcrypto : undefined,
    URL,
    URLSearchParams,
    AbortSignal,
    fetch,
  };
  function load(file) {
    if (!/\.(?:ts|tsx|js|mjs)$/.test(file))
      file =
        platform === 'android' && fs.existsSync(file + '.android.ts')
          ? file + '.android.ts'
          : (['.ts', '.tsx'].map((e) => file + e).find(fs.existsSync) ?? file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const require = (name) => {
      if (name === 'expo-constants')
        return {
          __esModule: true,
          default: {
            expoConfig: { extra: { localHttpDevelopment: development } },
          },
        };
      if (name === 'react-native') return { Platform: { OS: platform } };
      if (name === '@supabase/supabase-js') return { createClient: factory };
      if (name === 'expo-secure-store') return {};
      if (name === 'expo-crypto')
        return {
          getRandomValues: (array) => webcrypto.getRandomValues(array),
          digest: (_alg, data) => webcrypto.subtle.digest('SHA-256', data),
          CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
        };
      if (name.startsWith('.'))
        return load(path.resolve(path.dirname(file), name));
      return nativeRequire(name);
    };
    vm.runInNewContext(
      `(function(require,module,exports){${code}\n})`,
      globals,
      { filename: file },
    )(require, module, module.exports);
    return module.exports;
  }
  const { createAuthFoundation } = load(
    path.join(root, 'src/composition/auth-composition.ts'),
  );
  const calls = [];
  let ownProfile = { id: actor, display_name: 'Technical', phone: null };
  const foundation = createAuthFoundation({
    ...extraOptions,
    baseUrl,
    confirmationRedirectUrl: 'http://localhost:8081/auth/callback',
    developmentHttpOrigin: baseUrl,
    publicKey: 'sb_publishable_unit_test',
    environment: 'test',
    project: 'technical',
    storage,
    fetcher: async (url, init) => {
      calls.push({
        url,
        authorization: init.headers.Authorization,
        method: init.method,
        body: init.body,
      });
      if (url.includes('/rest/v1/profiles') && init.method === 'PATCH')
        ownProfile = { ...ownProfile, ...JSON.parse(init.body) };
      return {
        ok: true,
        json: async () =>
          url.includes('/rest/v1/barbershop_memberships')
            ? []
            : url.endsWith('/auth/v1/user')
              ? { id: actor, is_anonymous: false }
              : [ownProfile],
      };
    },
  });
  return {
    load,
    foundation,
    auth,
    storage,
    calls,
    globals,
    emit: (e) => callback(e, { access_token: 'must-not-leak' }),
    get options() {
      return options;
    },
    counts: () => ({
      factories,
      subscriptions,
      unsubscribes,
      sessionReads,
      stopped,
    }),
  };
}
