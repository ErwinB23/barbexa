import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
test('composition generates RFC4122 version4 identity using only existing Expo Crypto', () => {
  let randomCalls = 0;
  const code = ts.transpileModule(
    fs.readFileSync('src/composition/booking-request-id.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    Intl,
    Date,
  })(
    (name) => {
      assert.equal(name, 'expo-crypto');
      return {
        getRandomValues(bytes) {
          randomCalls++;
          bytes.fill(255);
          return bytes;
        },
      };
    },
    module,
    module.exports,
  );
  assert.match(
    module.exports.bookingRequestId(),
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
  );
  assert.equal(randomCalls, 1);
  assert.match(module.exports.bookingToday(), /^\d{4}-\d{2}-\d{2}$/);
});
