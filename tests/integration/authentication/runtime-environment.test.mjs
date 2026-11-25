import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
test('local Web and Android configuration keeps approved redirects and never falls back to LAN in production', () => {
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/composition/registration-environment.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(`(function(module,exports){${code}\n})`, { URL })(
    module,
    module.exports,
  );
  const resolve = module.exports.registrationEnvironment;
  const base = {
    development: true,
    environment: 'local',
    publicKey: 'sb_publishable_test',
    platform: 'web',
    webOrigin: 'http://localhost:8081',
    metroHostUri: '192.168.10.30:8081',
  };
  assert.equal(
    resolve(base).callbackUrl,
    'http://localhost:8081/auth/callback',
  );
  const native = resolve({ ...base, platform: 'android' });
  assert.equal(native.baseUrl, 'http://192.168.10.30:54421');
  assert.equal(native.callbackUrl, 'appbarberia://auth/callback');
  assert.throws(() => resolve({ ...base, webOrigin: 'http://localhost:8082' }));
  assert.throws(() => resolve({ ...base, development: false }));
  assert.throws(() =>
    resolve({
      ...base,
      platform: 'android',
      metroHostUri: 'other.invalid:8081',
    }),
  );
});
