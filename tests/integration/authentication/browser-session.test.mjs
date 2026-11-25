import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
function load(file) {
  if (!file.endsWith('.ts')) file += '.ts';
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { atob })(
    (n) => load(path.resolve(path.dirname(file), n)),
    module,
    module.exports,
  );
  return module.exports;
}
test('Web storage observer forwards only the change type and isolates platform and environment namespaces', () => {
  const { watchWebSession } = load(
    path.resolve(
      'src/features/authentication/infrastructure/session-storage.web.ts',
    ),
  );
  const events = new EventTarget();
  const signals = [];
  const off = watchWebSession(
    { environment: 'local', project: 'new', events },
    (signal) => signals.push(signal),
  );
  const session = 'barberia.local.new.auth-5-local-3-new';
  function emit(key, values) {
    const e = new Event('storage');
    Object.defineProperties(e, {
      key: { value: key },
      oldValue: {
        get() {
          if (values) return values[0];
          throw Error('must-not-read-values');
        },
      },
      newValue: {
        get() {
          if (values) return values[1];
          throw Error('must-not-read-values');
        },
      },
    });
    events.dispatchEvent(e);
  }
  emit('barberia.local.old.auth-5-local-3-old');
  emit('barberia.cloud.new.auth-5-cloud-3-new');
  emit(session + '-code-verifier');
  assert.equal(signals.length, 0);
  const makeSession = (user, id, expires) => {
    const payload = Buffer.from(
      JSON.stringify({ sub: user, session_id: id, exp: expires }),
    ).toString('base64url');
    return JSON.stringify({
      version: 1,
      value: JSON.stringify({ access_token: `a.${payload}.b` }),
    });
  };
  const first = '11111111-1111-4111-8111-111111111111';
  const second = '22222222-2222-4222-8222-222222222222';
  const existing = makeSession(first, first, 1);
  emit(session, [existing, makeSession(first, first, 2)]);
  emit(session, [existing, makeSession(first, second, 2)]);
  emit(session, [existing, makeSession(second, first, 2)]);
  emit(session, [existing, 'corrupt']);
  emit(session, [existing, null]);
  emit(session + '-purpose');
  emit(null);
  assert.deepEqual(signals, ['renewed', ...Array(6).fill('invalidated')]);
  off();
  emit(session);
  assert.equal(signals.length, 7);
});
