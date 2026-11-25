import { loadCore } from '../integration/booking/load-core.mjs';
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
  fs.readFileSync(
    'src/features/notifications/presentation/inbox-preview.web.tsx',
    'utf8',
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
).outputText;
let current;
vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
  (name) =>
    name === 'expo-router'
      ? { Link: (props) => React.createElement('a', props) }
      : name === './inbox-context'
        ? { useInbox: () => ({ state: current }) }
        : name === './notice-message'
          ? loadCore(
              'src/features/notifications/presentation/notice-message.ts',
            )
          : require(name),
  module,
  module.exports,
);
const render = (state) => {
  current = state;
  return renderToStaticMarkup(React.createElement(module.exports.InboxPreview));
};
test('home notices show only the most recent real notice regardless of input order and keep the center link', () => {
  const items = Array.from({ length: 4 }, (_, i) => ({
    id: String(i),
    title: i ? `Aviso ${i}` : '<script>real</script>',
    message: `Mensaje ${i} · hora de Lima`,
    createdAt: i === 0 ? '2026-11-24T01:00:00Z' : '2026-11-23T01:00:00Z',
    readAt: i ? 'read' : null,
  }));
  const html = render({ phase: 'ready', items: items.reverse() });
  assert.match(html, /&lt;script&gt;real&lt;\/script&gt;/);
  assert.match(html, /Mensaje 0/);
  assert.doesNotMatch(
    html,
    /Mensaje [123]|<script>|todavía no está disponible/,
  );
  assert.match(html, /Ver todas las notificaciones/);
  assert.match(html, /href="\/account\?view=notices"/);
  assert.match(html, /bx-preview-unread/);
  assert.doesNotMatch(html, /Lima/);
});
test('home notice loading, empty, failure and retained content are distinct and never claim success', () => {
  assert.match(
    render({ phase: 'loading', items: [] }),
    /Consultando tus avisos/,
  );
  assert.match(
    render({ phase: 'ready', items: [] }),
    /No tienes notificaciones por ahora/,
  );
  for (const phase of ['error', 'unavailable']) {
    const html = render({ phase, items: [] });
    assert.match(html, /No se pudieron consultar/);
    assert.doesNotMatch(html, /No tienes notificaciones/);
  }
  const html = render({
    phase: 'error',
    items: [
      {
        id: '1',
        title: 'Aviso conservado',
        message: 'Mensaje',
        createdAt: '2026-11-22T12:00:00Z',
        readAt: null,
      },
    ],
  });
  assert.match(html, /Aviso conservado/);
  assert.match(html, /No se pudieron actualizar/);
});
