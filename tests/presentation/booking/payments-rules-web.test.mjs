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
function fixture(states = []) {
  const elements = [];
  let index = 0;
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
        if (name === 'react')
          return {
            ...React,
            useState: (initial) => [states[index++] ?? initial, () => {}],
          };
        if (name === 'react/jsx-runtime')
          return Object.fromEntries(
            Object.entries(require(name)).map(([key, value]) => [
              key,
              ['jsx', 'jsxs'].includes(key)
                ? (type, props, ...rest) => {
                    if (typeof type === 'string')
                      elements.push({ type, props });
                    return value(type, props, ...rest);
                  }
                : value,
            ]),
          );
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
    elements,
    Component: load(
      path.resolve(
        'src/features/reservations/presentation/payments-rules-web.tsx',
      ),
    ).PaymentsRulesWeb,
  };
}
test('unread settings never claim Yape enabled and dirty edits preserve the independent save controls', () => {
  const f = fixture();
  let saves = 0;
  const editor = {
    loaded: false,
    busy: false,
    locked: false,
    tolerance: '10',
    instructions: '',
    configuredInstructions: null,
    dirty: false,
    onTolerance() {},
    onInstructions() {},
  };
  const parts = {
    editor,
    read: React.createElement(
      'button',
      null,
      'Consultar configuración de atención y Yape',
    ),
    save: React.createElement(
      'button',
      { onClick: () => saves++ },
      'Guardar configuración de mi barbería',
    ),
    feedback: null,
  };
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      parts,
      reservations: React.createElement(
        'button',
        null,
        'Guardar antelación de reprogramación',
      ),
    }),
  );
  assert.match(html, /Sin consultar/);
  assert.doesNotMatch(html, /Yape habilitado/);
  assert.match(html, /Reglas de pago/);
  assert.match(html, /Guardar antelación de reprogramación/);
  const loaded = renderToStaticMarkup(
    React.createElement(f.Component, {
      parts: {
        ...parts,
        editor: {
          ...editor,
          loaded: true,
          instructions: 'datos editados',
          configuredInstructions: 'datos consultados',
          dirty: true,
        },
      },
      reservations: null,
    }),
  );
  assert.match(loaded, /Cambios sin guardar/);
  assert.match(loaded, /Editar datos/);
});

test('administrative Web route explicitly connects the premium Web composition', () => {
  const route = fs.readFileSync(
    'src/composition/operation-route.web.tsx',
    'utf8',
  );
  assert.match(route, /from '\.\/payments-and-rules-panel\.web'/);
  const panel = fs.readFileSync(
    'src/composition/payments-and-rules-panel.web.tsx',
    'utf8',
  );
  assert.match(panel, /<PaymentsRulesWeb/);
});

test('Yape switch only clears draft instructions after explicit confirmation and never sends a save', () => {
  const editor = {
    loaded: true,
    busy: false,
    locked: false,
    tolerance: '10',
    instructions: 'Datos guardados',
    configuredInstructions: 'Datos guardados',
    dirty: false,
    onTolerance() {},
    onSave() {
      throw Error('No save expected');
    },
  };
  const changes = [];
  editor.onInstructions = (value) => changes.push(value);
  const f = fixture();
  renderToStaticMarkup(
    React.createElement(f.Component, { parts: { editor }, reservations: null }),
  );
  const toggle = f.elements.find(
    (e) =>
      e.props.role === 'switch' && e.props['aria-label'] === 'Habilitar Yape',
  );
  assert.ok(toggle);
  toggle.props.onClick();
  assert.deepEqual(changes, []);
  const confirm = fixture([false, true]);
  renderToStaticMarkup(
    React.createElement(confirm.Component, {
      parts: { editor },
      reservations: null,
    }),
  );
  const action = confirm.elements.find(
    (e) =>
      e.type === 'button' && e.props.children === 'Deshabilitar al guardar',
  );
  assert.ok(action);
  action.props.onClick();
  assert.deepEqual(changes, ['']);
});
test('the open Yape editor shows a live preview and preserves earlier instructions when saving', () => {
  const saves = [];
  const f = fixture([true, false, 'Titular real', '912 345 678']);
  const editor = {
    loaded: true,
    busy: false,
    locked: false,
    tolerance: '10',
    instructions: 'Indicaciones anteriores',
    configuredInstructions: 'Indicaciones anteriores',
    onSave: (instructions) => saves.push(instructions),
  };
  const html = renderToStaticMarkup(
    React.createElement(f.Component, { parts: { editor }, reservations: null }),
  );
  assert.match(html, /Vista previa para tus clientes/);
  assert.match(html, /Código QR no registrado/);
  assert.doesNotMatch(html, /Indicaciones adicionales/);
  const form = f.elements.find((element) => element.props.id === 'yape-editor');
  assert.ok(form);
  form.props.onSubmit({ preventDefault() {} });
  assert.deepEqual(saves, [
    'Titular de Yape: Titular real\nNúmero de Yape: 912345678\n\nIndicaciones anteriores',
  ]);
});

test('Yape rejects invalid or incomplete details and reads back a saved holder and number', () => {
  const saved =
    'Titular de Yape: Titular real\nNúmero de Yape: 912345678\n\nIndicaciones anteriores';
  for (const [states, locked] of [
    [[true, false, 'Titular real', '812345678'], false],
    [[true, false, '', '912345678'], false],
    [[true, false], true],
  ]) {
    const f = fixture(states);
    const html = renderToStaticMarkup(
      React.createElement(f.Component, {
        parts: {
          editor: {
            loaded: true,
            busy: false,
            locked,
            tolerance: '10',
            instructions: saved,
            configuredInstructions: saved,
            onSave() {
              assert.fail('Invalid or locked form must not save');
            },
          },
        },
        reservations: null,
      }),
    );
    f.elements
      .find((element) => element.props.id === 'yape-editor')
      .props.onSubmit({ preventDefault() {} });
    assert.doesNotMatch(html, /Indicaciones adicionales/);
    if (locked) assert.match(html, /912 345 678/);
  }
});
