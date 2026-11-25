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
        if (name.endsWith('/app-text-field'))
          return {
            AppTextField: ({ label, value, disabled }) =>
              React.createElement(
                'label',
                null,
                label,
                React.createElement('input', {
                  value,
                  disabled,
                  readOnly: true,
                }),
              ),
          };
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
    load,
    Component: load(
      path.resolve(
        'src/features/barbershop-operation/presentation/weekly-schedule-web.tsx',
      ),
    ).WeeklyScheduleWeb,
  };
}
const base = {
  title: 'Local real',
  data: {
    hours: [
      { weekday: 1, opensMin: 547, closesMin: 780, barberId: null },
      { weekday: 1, opensMin: 840, closesMin: 1140, barberId: null },
    ],
    professionals: [],
  },
  barber: null,
  disabled: false,
  loading: false,
  canEdit: true,
  navigation: null,
  feedback: null,
  onScope() {},
  onContext() {},
  onSave() {},
};
test('weekly view shows actual split intervals, native select options, draft summary and existing save callback', () => {
  const f = fixture();
  let written;
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      onSave: (rows) => {
        written = rows;
      },
    }),
  );
  assert.match(html, /09:07/);
  assert.match(html, /Descanso: 13:00/);
  assert.match(html, /14:00/);
  assert.match(html, /<select/);
  assert.doesNotMatch(html, /<input|HH:MM|Horarios actualizados/);
  f.actions.find((a) => a.label === 'Guardar cambios').onPress();
  assert.deepEqual(
    written.map(({ weekday, opensMin, closesMin }) => ({
      weekday,
      opensMin,
      closesMin,
    })),
    base.data.hours.map(({ weekday, opensMin, closesMin }) => ({
      weekday,
      opensMin,
      closesMin,
    })),
  );
});
test('unverified schedules and read-only permissions cannot save a guessed empty schedule', () => {
  for (const props of [
    { data: null, loading: true },
    { data: null, loading: false },
    { canEdit: false },
  ]) {
    const f = fixture();
    renderToStaticMarkup(
      React.createElement(f.Component, { ...base, ...props }),
    );
    assert.equal(
      f.actions.find((a) => a.label === 'Guardar cambios').disabled,
      true,
    );
  }
});

test('availability scope identifies whole shop or selected professional before creating an exception', () => {
  const { load } = fixture();
  const { AvailabilityScopeWeb } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/availability-scope.web.tsx',
    ),
  );
  const props = {
    barber: null,
    professionals: [{ id: 'p', professionalName: 'Erwin' }],
    disabled: false,
    onScope() {},
  };
  const shop = renderToStaticMarkup(
    React.createElement(AvailabilityScopeWeb, props),
  );
  assert.match(shop, /Toda la barbería/);
  assert.match(shop, /todos los profesionales/);
  const person = renderToStaticMarkup(
    React.createElement(AvailabilityScopeWeb, { ...props, barber: 'p' }),
  );
  assert.match(person, /Solo Erwin/);
  assert.match(person, /Los demás profesionales/);
});

test('premium availability tools separates form and consultation slots without inventing an empty result', () => {
  const { load } = fixture();
  const { AvailabilityToolsWeb } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/availability-tools.web.tsx',
    ),
  );
  const html = renderToStaticMarkup(
    React.createElement(AvailabilityToolsWeb, {
      form: React.createElement('button', null, 'Guardar cierre real'),
      personal: React.createElement('button', null, 'Consultar perfil real'),
      closures: React.createElement('button', null, 'Consultar cierres reales'),
    }),
  );
  assert.match(html, /Bloqueos y cierres por fecha/);
  assert.match(html, /bx-date-main/);
  assert.match(html, /bx-date-sidebar/);
  assert.match(html, /Guardar cierre real/);
  assert.match(html, /Consultar perfil real/);
  assert.match(html, /Consultar cierres reales/);
  assert.doesNotMatch(html, /No hay cierres administrativos registrados/);
});
