import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture() {
  const actions = [],
    cache = new Map();
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((x) => file + x).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
      (name) => {
        if (name.endsWith('/app-button'))
          return {
            AppButton: ({ label, onPress, disabled }) => {
              actions.push({ label, onPress, disabled });
              return React.createElement('button', null, label);
            },
          };
        if (name.startsWith('.'))
          return load(path.resolve(path.dirname(file), name));
        return require(name);
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  return {
    actions,
    Component: load(
      path.resolve(
        'src/features/authentication/presentation/context-content-web.tsx',
      ),
    ).ContextContentWeb,
  };
}
test('selected context uses real shop/role and keeps existing change, refresh and return callbacks', () => {
  const f = fixture(),
    called = [];
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      context: {
        kind: 'selected',
        barbershop: { name: 'Barbería <B>' },
        context: { role: 'barber' },
      },
      onChoose: () => called.push('choose'),
      onRefresh: () => called.push('refresh'),
      onAccount: () => called.push('account'),
    }),
  );
  assert.match(html, /Barbería &lt;B&gt;/);
  assert.match(html, /Rol: Barbero/);
  assert.doesNotMatch(html, /Administrador|Barber Style/);
  for (const label of [
    'Cambiar de barbería',
    'Actualizar barberías',
    'Volver a mi cuenta',
  ])
    f.actions.find((a) => a.label === label).onPress();
  assert.deepEqual(called, ['choose', 'refresh', 'account']);
});
test('no membership, loading and errors do not display active permissions or invented roles', () => {
  for (const context of [
    { kind: 'none' },
    { kind: 'resolving' },
    { kind: 'error', error: 'network-unavailable' },
  ]) {
    const f = fixture();
    const html = renderToStaticMarkup(
      React.createElement(f.Component, { context }),
    );
    assert.doesNotMatch(
      html,
      /Permisos activos|Administrador|Cambiar de barbería/,
    );
    if (context.kind === 'resolving')
      assert.equal(
        f.actions.find((a) => a.label === 'Actualizar barberías').disabled,
        true,
      );
  }
});
test('multiple barbershops keep isolated role labels and only dispatch the selected shop ID', () => {
  const f = fixture(),
    selected = [];
  renderToStaticMarkup(
    React.createElement(f.Component, {
      context: {
        kind: 'choosing',
        memberships: [
          { id: 'a', barbershopId: 'one', role: 'administrator' },
          { id: 'b', barbershopId: 'two', role: 'barber' },
        ],
        barbershops: [
          { id: 'one', name: 'Local Uno' },
          { id: 'two', name: 'Local Dos' },
        ],
      },
      onSelect: (id) => selected.push(id),
    }),
  );
  f.actions.find((a) => a.label === 'Elegir Local Dos (Barbero)').onPress();
  assert.deepEqual(selected, ['two']);
});

test('only a selected administrator can open the named shop agenda', () => {
  for (const role of ['administrator', 'barber']) {
    const f = fixture();
    let opened = 0;
    const html = renderToStaticMarkup(
      React.createElement(f.Component, {
        context: {
          kind: 'selected',
          barbershop: { name: 'Local Uno' },
          context: { role },
        },
        onAgenda: () => opened++,
      }),
    );
    const action = f.actions.find((a) => a.label === 'Ver agenda de Local Uno');
    assert.equal(!!action, role === 'administrator');
    if (action) {
      action.onPress();
      assert.equal(opened, 1);
      assert.match(html, /Agenda de esta barbería/);
    }
  }
});
