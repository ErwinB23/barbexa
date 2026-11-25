import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file, dev, marker = true, platform = 'android') {
  const cache = new Map();
  function read(filename) {
    if (!path.extname(filename)) filename += '.ts';
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const localRequire = (name) => {
      if (name === '@supabase/supabase-js') return {};
      if (name === 'expo-constants')
        return {
          __esModule: true,
          default: { expoConfig: { extra: { localHttpDevelopment: marker } } },
        };
      if (name === 'react-native') return { Platform: { OS: platform } };
      return read(path.resolve(path.dirname(filename), name));
    };
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      URL,
      atob,
      fetch,
      __DEV__: dev,
    })(localRequire, module, module.exports);
    return module.exports;
  }
  return read(path.resolve(file));
}
const origin = 'http://192.168.10.20:54421';
const authFile =
  'src/features/authentication/infrastructure/supabase-auth-adapter.ts';
const tenantFile =
  'src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts';
const policyFile = 'src/composition/development-transport.ts';

test('both adapters accept only the configured LAN origin in DEV, never production', () => {
  for (const dev of [true, false]) {
    const auth = load(authFile, dev);
    const tenant = load(tenantFile, dev);
    const validators = [
      (url, configured) =>
        auth.validateAuthTarget(url, 'sb_publishable_fixture', configured),
      (url, configured) =>
        tenant.createTenantFoundationHttpAdapter({
          baseUrl: url,
          publicKey: 'sb_publishable_fixture',
          getAccessToken: async () => null,
          developmentHttpOrigin: configured,
        }),
    ];
    for (const validate of validators) {
      if (dev) assert.doesNotThrow(() => validate(origin, origin));
      else assert.throws(() => validate(origin, origin));
      assert.throws(() => validate('http://192.168.10.21:54421', origin));
      for (const url of [
        'http://192.168.10.20:80',
        'http://example.com:54421',
        'http://8.8.8.8:54421',
        origin + '/other',
        origin + '?key=test',
      ]) {
        assert.throws(() => validate(url, url));
      }
      assert.doesNotThrow(() => validate('https://fixture.supabase.co'));
    }
  }
});

test('composition policy requires Android, DEV and the development build marker', () => {
  for (const [dev, marker, platform, accepted] of [
    [true, true, 'android', true],
    [false, true, 'android', false],
    [true, false, 'android', false],
    [true, true, 'web', false],
  ]) {
    const policy = load(policyFile, dev, marker, platform);
    assert.equal(
      policy.developmentTransportOrigin(origin),
      accepted ? origin : undefined,
    );
  }
});

test('dynamic config preserves Expo identity and forces cleartext off outside development', async () => {
  const original = process.env.APP_VARIANT;
  const originalProfile = process.env.EAS_BUILD_PROFILE;
  try {
    const configure = require('../../../app.config.js');
    const base = require('../../../app.json').expo;
    for (const variant of ['development', 'preview', 'production', '']) {
      process.env.APP_VARIANT = variant;
      process.env.EAS_BUILD_PROFILE = variant;
      const config = configure({ config: base });
      assert.equal(config.scheme, 'appbarberia');
      assert.equal(config.extra.eas.projectId, base.extra.eas.projectId);
      assert.equal(
        config.extra.localHttpDevelopment,
        variant === 'development',
      );
      const [pluginPath, options] = config.plugins.at(-1);
      const plugin = require(path.resolve(pluginPath));
      const modified = plugin({}, options);
      const result = await modified.mods.android.manifest({
        modResults: { manifest: { application: [{ $: {} }] } },
        modRequest: { nextMod: async (v) => v },
      });
      assert.equal(
        result.modResults.manifest.application[0].$[
          'android:usesCleartextTraffic'
        ],
        variant === 'development' ? 'true' : 'false',
      );
    }
    process.env.APP_VARIANT = 'development';
    process.env.EAS_BUILD_PROFILE = 'production';
    assert.equal(configure({ config: base }).extra.localHttpDevelopment, false);
  } finally {
    if (original === undefined) delete process.env.APP_VARIANT;
    else process.env.APP_VARIANT = original;
    if (originalProfile === undefined) delete process.env.EAS_BUILD_PROFILE;
    else process.env.EAS_BUILD_PROFILE = originalProfile;
  }
});
