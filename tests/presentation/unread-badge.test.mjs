import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const module = { exports: {} };
const code = ts.transpileModule(
  fs.readFileSync('src/shared/ui/unread-badge.web.tsx', 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
).outputText;
vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
  require,
  module,
  module.exports,
);
const render = (count) =>
  renderToStaticMarkup(
    React.createElement(module.exports.UnreadBadge, { count }),
  );
test('unread badge is a red circle with white accessible count and disappears at zero', () => {
  for (const count of [0, -1, NaN]) assert.equal(render(count), '');
  assert.match(render(1), /background-color:#c92b36/);
  assert.match(render(1), /color:#fff/);
  assert.match(render(1), /border-radius:999px/);
  assert.match(render(1), /1 notificaciones sin leer/);
  assert.match(render(120), />99\+<\/span>/);
  assert.match(render(2), />2<\/span>/);
});
