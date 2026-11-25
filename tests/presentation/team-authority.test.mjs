import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture() {
  const seen = [];
  const module = { exports: {} };
  const text = ({ children }) => React.createElement('p', null, children);
  const button = (p) => {
    seen.push(p);
    return React.createElement(
      'button',
      { disabled: p.disabled, onClick: p.onPress },
      p.label,
    );
  };
  const field = (p) => {
    seen.push(p);
    return React.createElement(
      'label',
      null,
      p.label,
      React.createElement('input', {
        'aria-label': p.label,
        disabled: p.disabled,
      }),
    );
  };
  const code = ts.transpileModule(
    fs.readFileSync(
      'src/features/barbershop-operation/presentation/team-authority-panel.tsx',
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
    (n) => {
      if (n.endsWith('/page-header'))
        return {
          Section: ({ title, children }) =>
            React.createElement(
              'section',
              null,
              React.createElement('h2', null, title),
              children,
            ),
          ActionRow: text,
        };
      if (n.endsWith('/app-text')) return { AppText: text };
      if (n.endsWith('/app-button')) return { AppButton: button };
      if (n.endsWith('/app-text-field')) return { AppTextField: field };
      if (n.endsWith('/values'))
        return { BusinessError: class extends Error {} };
      return require(n);
    },
    module,
    module.exports,
  );
  return {
    seen,
    render: (props) =>
      renderToStaticMarkup(
        React.createElement(module.exports.TeamAuthorityContent, props),
      ),
  };
}
const props = (capacity = 'owner', count = 1) => ({
  authority: {
    userId: 'owner',
    capacity,
    secondaryCount: capacity === 'owner' ? count : null,
  },
  members: Array.from({ length: count }, (_, i) => ({
    userId: `secondary${i}`,
    status: 'active',
    role: 'administrator',
  })),
  professionals: [],
  busy: false,
  selected: '',
  disposition: null,
  reason: '',
  uncertain: false,
  error: null,
  message: null,
  onSelect() {},
  onDisposition() {},
  onReason() {},
  onRemove() {},
  onReload() {},
});
test('2D owner sees actual secondary roster, quota, explicit disposition and guarded confirmation', () => {
  const f = fixture(),
    html = f.render(props());
  assert.match(html, /Administrador principal/);
  assert.match(html, /1 de 2/);
  assert.match(html, /Administrador secundario 1/);
  assert.ok(
    f.seen.find((p) => p.label === 'Confirmar retirada de administración')
      .disabled,
  );
  assert.ok(!html.includes('Transferir propiedad'));
});
test('2D empty and full capacity states are explicit without inventing administrators', () => {
  assert.match(
    fixture().render(props('owner', 0)),
    /No hay administradores secundarios/,
  );
  assert.match(
    fixture().render(props('owner', 2)),
    /Límite de dos secundarios alcanzado/,
  );
});
for (const capacity of ['secondary', 'barber', 'unregularized'])
  test(`2D ${capacity} never renders appointment, roster or removal controls`, () => {
    const f = fixture(),
      html = f.render(props(capacity));
    assert.ok(!html.includes('Confirmar retirada'));
    assert.ok(!html.includes('Administrador secundario 1'));
    assert.equal(f.seen.length, 0);
  });
test('2D removal requires selected secondary, explicit disposition, reason and no pending operation', () => {
  const f = fixture();
  f.render({
    ...props(),
    selected: 'secondary0',
    disposition: 'barber',
    reason: 'Conservar trabajo',
  });
  assert.equal(
    f.seen.find((p) => p.label === 'Confirmar retirada de administración')
      .disabled,
    false,
  );
  const blocked = fixture();
  blocked.render({
    ...props(),
    selected: 'owner',
    disposition: 'inactive',
    reason: 'Motivo',
  });
  assert.equal(
    blocked.seen.find((p) => p.label === 'Confirmar retirada de administración')
      .disabled,
    true,
  );
});
test('2D uncertain removal offers the same request retry and readable server errors', () => {
  const f = fixture(),
    html = f.render({
      ...props(),
      uncertain: true,
      error: 'No tienes permiso en esta barbería.',
    });
  assert.match(html, /mismo intento/);
  assert.match(html, /No tienes permiso/);
  assert.ok(f.seen.find((p) => p.label === 'Reintentar la misma retirada'));
});
