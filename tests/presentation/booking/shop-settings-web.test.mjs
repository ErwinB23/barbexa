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
        'src/features/barbershop-operation/presentation/shop-settings-web.tsx',
      ),
    ).ShopSettingsWeb,
  };
}
const base = {
  title: 'Mi local',
  contact: '111',
  address: 'Dirección real de fixture',
  policies: {
    minimumNoticeMin: '30',
    bookingHorizonDays: '14',
    maxFuturePerClient: '3',
    slotStepMin: '15',
    bufferMin: '0',
    cancellationAdvanceMin: '120',
  },
  disabled: false,
  loading: false,
  canPublish: true,
  navigation: null,
  feedback: null,
  onContact() {},
  onAddress() {},
  onPolicy() {},
  onSave() {},
  onPublication() {},
};
test('settings view preserves values and delegates config/publication callbacks without writes', () => {
  const f = fixture(),
    called = [];
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      onSave: () => called.push('save'),
      onPublication: (s) => called.push(s),
    }),
  );
  assert.match(html, /Identidad y contacto/);
  assert.match(html, /Reglas de reserva/);
  assert.match(html, /value="111"/);
  assert.match(html, /value="120"/);
  assert.doesNotMatch(html, /Requisitos completos/);
  for (const label of [
    'Guardar configuración',
    'Publicar barbería',
    'Pausar nuevas reservas',
    'Retirar oferta pública',
  ])
    f.actions.find((a) => a.label === label).onPress();
  assert.deepEqual(called, ['save', 'published', 'paused', 'withdrawn']);
});
test('publication controls respect read-only permission and loading; unknown readiness is never complete', () => {
  const f = fixture();
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      canPublish: false,
      disabled: true,
      loading: true,
    }),
  );
  assert.ok(!f.actions.some((a) => a.label === 'Publicar barbería'));
  assert.equal(
    f.actions.find((a) => a.label === 'Guardar configuración').disabled,
    true,
  );
  assert.match(html, /Por comprobar/);
});
