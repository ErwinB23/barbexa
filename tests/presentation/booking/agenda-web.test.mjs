import { detail } from '../../integration/booking/booking-payload-fixture.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function find(node, id) {
  if (!React.isValidElement(node)) return null;
  if (node.props.id === id) return node;
  return React.Children.toArray(node.props.children)
    .map((child) => find(child, id))
    .find(Boolean);
}
test('dropdowns preserve state, professional, attendance and payment contracts without issuing business commands', () => {
  const { AgendaWeb, CareFilterSelects } = load(
    path.resolve('src/features/reservations/presentation/agenda-web.tsx'),
  );
  const changes = [];
  const node = AgendaWeb({
    state: {
      phase: 'ready',
      rows: [],
      filters: { state: null, barberId: null },
    },
    administrator: true,
    date: '2026-11-23',
    professionals: [['professional-id', 'Profesional']],
    onDate: (value) => changes.push(value),
    onFilter: (value) => changes.push(value),
  });
  find(node, 'agenda-date').props.onChange({ target: { value: '2026-11-24' } });
  find(node, 'agenda-state').props.onChange({ target: { value: 'confirmed' } });
  find(node, 'agenda-professional').props.onChange({
    target: { value: 'professional-id' },
  });
  find(node, 'agenda-state').props.onChange({ target: { value: 'all' } });
  assert.deepEqual(changes, [
    '2026-11-24',
    { state: 'confirmed' },
    { barberId: 'professional-id' },
    { state: null },
  ]);
  const care = CareFilterSelects({
    attendance: 'all',
    payment: 'all',
    busy: true,
    error: '',
    onAttendance: (value) => changes.push(value),
    onPayment: (value) => changes.push(value),
  });
  assert.equal(find(care, 'agenda-attendance').props.disabled, true);
  find(care, 'agenda-attendance').props.onChange({
    target: { value: 'in-service' },
  });
  find(care, 'agenda-payment').props.onChange({ target: { value: 'pending' } });
  assert.deepEqual(changes.slice(-2), ['in-service', 'pending']);
});
function load(file) {
  if (!fs.existsSync(file))
    file = ['.tsx', '.ts'].map((ext) => file + ext).find(fs.existsSync) ?? file;
  const module = { exports: {} };
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
          AppButton: (p) =>
            React.createElement(
              'button',
              { disabled: p.disabled, onClick: p.onPress },
              p.label,
            ),
        };
      return name.startsWith('.')
        ? load(path.resolve(path.dirname(file), name))
        : require(name);
    },
    module,
    module.exports,
  );
  return module.exports;
}
test('agenda prioritizes the date and appointments, with advanced configuration collapsed after the list', () => {
  const { AgendaWeb } = load(
    path.resolve('src/features/reservations/presentation/agenda-web.tsx'),
  );
  const props = {
    administrator: true,
    date: '2026-11-23',
    state: {
      phase: 'ready',
      rows: [],
      filters: { state: null, barberId: null },
    },
    professionals: [],
    settings: 'Yape settings',
    extraFilters: 'Payment filters',
    children: 'Appointment list',
  };
  const html = renderToStaticMarkup(React.createElement(AgendaWeb, props));
  assert.match(html, /type="date"/);
  assert.ok(
    html.includes('.bx-aa-layout{'),
    'administrative styles must reach the rendered page',
  );
  assert.match(html, /No hay citas/);
  assert.ok(html.indexOf('Appointment list') < html.indexOf('Yape settings'));
  assert.doesNotMatch(html, /<details[^>]* open/);
  assert.match(html, /Consultar atención y pago/);
  assert.match(html, /<select/);
  const loading = renderToStaticMarkup(
    React.createElement(AgendaWeb, {
      ...props,
      state: { ...props.state, phase: 'loading' },
    }),
  );
  assert.match(loading, /Consultando/);
  assert.doesNotMatch(loading, /No hay citas/);
});

test('administrative agenda shows a sidebar, scoped counts and unknown care metrics without fabricating payment data', () => {
  const { AgendaWeb } = load(
    path.resolve('src/features/reservations/presentation/agenda-web.tsx'),
  );
  const props = {
    administrator: true,
    date: '2026-11-24',
    shopName: 'Local seleccionado',
    professionals: [],
    state: {
      phase: 'ready',
      filters: { localDate: '2026-11-24', state: null, barberId: null },
      rows: [],
    },
    onDate() {},
    onFilter() {},
    onContext() {},
    onRefresh() {},
  };
  const html = renderToStaticMarkup(React.createElement(AgendaWeb, props));
  for (const title of [
    'Leyenda de estados',
    'Resumen rápido del día',
    'Actividad del día',
    'Gestión de la agenda',
    'Resultados de la consulta',
  ])
    assert.ok(html.includes(title), title);
  const waiting = renderToStaticMarkup(
    React.createElement(AgendaWeb, {
      ...props,
      state: { ...props.state, phase: 'loading' },
    }),
  );
  assert.doesNotMatch(waiting, /No hay citas/);
  assert.match(waiting, /data-metric="in-service"[^>]*>—/);
});

test('care metrics remain unknown until actual consultation and non-ready rows do not leak through activity or cards', () => {
  const { AgendaWeb } = load(
    path.resolve('src/features/reservations/presentation/agenda-web.tsx'),
  );
  const props = {
    administrator: true,
    date: '2026-11-24',
    professionals: [],
    state: {
      phase: 'ready',
      filters: { localDate: '2026-11-24', state: null, barberId: null },
      rows: [detail],
    },
    children: 'OLD_CARD',
  };
  const html = renderToStaticMarkup(React.createElement(AgendaWeb, props));
  assert.match(html, /data-metric="in-service">—/);
  assert.match(html, /data-metric="pending">—/);
  const loaded = renderToStaticMarkup(
    React.createElement(AgendaWeb, {
      ...props,
      careViews: {
        [detail.id]: {
          attendance: 'in-service',
          payment: { status: 'pending' },
        },
      },
    }),
  );
  assert.match(loaded, /data-metric="in-service">1/);
  assert.match(loaded, /data-metric="pending">1/);
  const loading = renderToStaticMarkup(
    React.createElement(AgendaWeb, {
      ...props,
      state: { ...props.state, phase: 'loading' },
    }),
  );
  assert.doesNotMatch(loading, /OLD_CARD/);
  assert.doesNotMatch(loading, new RegExp(detail.clientDisplayNameSnapshot));
});

test('administrator agenda omits the redundant change-shop action', () => {
  const { AgendaWeb } = load(
    path.resolve('src/features/reservations/presentation/agenda-web.tsx'),
  );
  const html = renderToStaticMarkup(
    React.createElement(AgendaWeb, {
      administrator: true,
      state: {
        phase: 'ready',
        rows: [],
        filters: { state: null, barberId: null },
      },
      date: '2026-11-24',
      professionals: [],
      onContext() {},
      onDate() {},
      onFilter() {},
      onRefresh() {},
    }),
  );
  const header = html.slice(
    html.indexOf('<header class="bx-agenda-heading"'),
    html.indexOf('</header>'),
  );
  assert.doesNotMatch(header, /Cambiar barbería/);
  const query = html.slice(
    html.indexOf('aria-labelledby="agenda-query-title"'),
    html.indexOf('class="bx-aa-filter-fields"'),
  );
  assert.doesNotMatch(query, /Cambiar barbería/);
});
