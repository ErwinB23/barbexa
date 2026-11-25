import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);

test('mounted inbox acknowledges only successfully loaded notices in a visible tab and removes its listener', () => {
  for (const phase of ['ready', 'loading', 'error', 'unavailable']) {
    let effect,
      calls = 0;
    const document = new EventTarget();
    document.visibilityState = 'hidden';
    const module = { exports: {} };
    const source = ts.transpileModule(
      fs.readFileSync(
        'src/features/notifications/presentation/inbox-screen.web.tsx',
        'utf8',
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      },
    ).outputText;
    vm.runInNewContext(`(function(require,module,exports){${source}\n})`, {
      document,
    })(
      (name) =>
        name === 'react'
          ? {
              useState: (value) => [value, () => {}],
              useEffect: (callback) => {
                effect = callback;
              },
            }
          : name === './inbox-context'
            ? {
                useInbox: () => ({
                  app: { acknowledge: () => calls++ },
                  state: { phase },
                }),
              }
            : name === 'react/jsx-runtime'
              ? require(name)
              : {},
      module,
      module.exports,
    );
    module.exports.InboxScreen();
    const cleanup = effect();
    assert.equal(calls, 0);
    document.visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(calls, phase === 'ready' ? 1 : 0);
    cleanup();
    document.dispatchEvent(new Event('visibilitychange'));
    assert.equal(calls, phase === 'ready' ? 1 : 0);
  }
});
