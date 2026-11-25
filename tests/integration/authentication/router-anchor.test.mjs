import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { getLayoutAnchor } = require('expo-router/build/layoutAnchor');

test('root deep links retain index as the anchor without deprecated settings warnings', (t) => {
  const warnings = t.mock.method(console, 'warn', () => {});
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/app/_layout.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    () => ({}),
    module,
    module.exports,
  );
  const node = {
    type: 'layout',
    contextKey: './_layout.tsx',
    children: ['index', 'technical', '+not-found'].map((route) => ({ route })),
    loadRoute: () => module.exports,
  };
  assert.equal(getLayoutAnchor(node), 'index');
  assert.ok(fs.existsSync('src/app/index.tsx'));
  assert.equal(warnings.mock.callCount(), 0);
});
