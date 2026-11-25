import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { detail } from '../../integration/booking/booking-payload-fixture.mjs';
const require = createRequire(import.meta.url);
function load(file, platform = 'web', overrides = {}) {
  if (!fs.existsSync(file))
    file = ['.ts', '.tsx'].map((x) => file + x).find(fs.existsSync);
  const primitive = () =>
    function Native(props) {
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive(),
    Text: primitive(),
    TextInput: primitive(),
    Pressable: primitive(),
    ScrollView: primitive(),
    Platform: { OS: platform },
    StyleSheet: { create: (x) => x },
  };
  const m = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) =>
      overrides[n]
        ? overrides[n]
        : n === 'react-native'
          ? rn
          : n === 'react-native-safe-area-context'
            ? { SafeAreaView: primitive() }
            : n.startsWith('.')
              ? load(path.resolve(path.dirname(file), n), platform, overrides)
              : require(n),
    m,
    m.exports,
  );
  return m.exports;
}
for (const platform of ['web', 'android'])
  test(`${platform}: agenda content shows assigned-only role, empty/loading/error and authorized details`, () => {
    const { AgendaContent } = load(
      path.resolve('src/features/reservations/presentation/agenda-screen.tsx'),
      platform,
    );
    const props = {
      state: {
        phase: 'ready',
        rows: [detail],
        filters: { localDate: '2026-11-15', barberId: null, state: null },
        error: null,
      },
      date: '2026-11-15',
      administrator: false,
      onDate() {},
      onFilter() {},
      onRefresh() {},
      onContext() {},
    };
    const render = (p) =>
      renderToStaticMarkup(React.createElement(AgendaContent, p));
    const html = render(props);
    assert.match(html, /Solo tus citas asignadas/);
    assert.ok(!html.includes('Todos los profesionales'));
    assert.match(html, /Código de cita/);
    assert.match(
      render({ ...props, administrator: true }),
      /Todos los profesionales/,
    );
    assert.match(
      render({ ...props, state: { ...props.state, phase: 'ready', rows: [] } }),
      /No hay citas/,
    );
    assert.match(
      render({
        ...props,
        state: { ...props.state, phase: 'loading', rows: [] },
      }),
      /Consultando agenda/,
    );
    assert.match(
      render({
        ...props,
        state: { ...props.state, phase: 'error', rows: [], error: 'FORBIDDEN' },
      }),
      /No tienes permiso/,
    );
  });

test('administrative agenda groups distinct professionals and sorts their reservations from latest to earliest', () => {
  const { AgendaContent } = load(
    path.resolve('src/features/reservations/presentation/agenda-screen.tsx'),
  );
  const rows = [
    {
      ...detail,
      id: 'late',
      barberId: 'a',
      barberNameSnapshot: 'Ana',
      startsAt: '2026-11-15T16:00:00Z',
      endsAt: '2026-11-15T16:40:00Z',
      clientDisplayNameSnapshot: 'Cliente tarde',
    },
    {
      ...detail,
      id: 'other',
      barberId: 'b',
      barberNameSnapshot: 'Beto',
      clientDisplayNameSnapshot: 'Cliente Beto',
    },
    {
      ...detail,
      id: 'early',
      barberId: 'a',
      barberNameSnapshot: 'Ana',
      startsAt: '2026-11-15T14:00:00Z',
      endsAt: '2026-11-15T14:40:00Z',
      clientDisplayNameSnapshot: 'Cliente temprano',
    },
  ];
  const html = renderToStaticMarkup(
    React.createElement(AgendaContent, {
      state: {
        phase: 'ready',
        rows,
        filters: { localDate: '2026-11-15', barberId: null, state: null },
      },
      administrator: true,
      shopName: 'Local Uno',
      date: '2026-11-15',
      onDate() {},
      onFilter() {},
      onRefresh() {},
      onContext() {},
    }),
  );
  assert.equal((html.match(/class="bx-agenda-professional"/g) ?? []).length, 2);
  assert.match(html, /Local Uno/);
  assert.ok(html.indexOf('Cliente tarde') < html.indexOf('Cliente temprano'));
});

test('administrative card retains rescheduling history but offers no reschedule action after care consultation', () => {
  const { AdminBookingCardWeb } = load(
    path.resolve(
      'src/features/reservations/presentation/admin-booking-card.web.tsx',
    ),
    'web',
    {
      './care-control': {
        CareControl: (props) =>
          props.renderActions({ attendance: 'confirmed' }),
      },
      './booking-context': {
        BookingContext: React.createContext({
          reschedule: { history: async () => [] },
        }),
      },
    },
  );
  const html = renderToStaticMarkup(
    React.createElement(AdminBookingCardWeb, { detail, onCare() {} }),
  );
  assert.match(html, /Consultar historial de reprogramación/);
  assert.doesNotMatch(html, /Reprogramar cita|Confirmar nuevo horario/);
});

test('each administrative reservation is initially folded with its own accessible summary and preserved detail', () => {
  const { AdminBookingCardWeb } = load(
    path.resolve(
      'src/features/reservations/presentation/admin-booking-card.web.tsx',
    ),
  );
  const html = renderToStaticMarkup(
    React.createElement(AdminBookingCardWeb, { detail, onCare() {} }),
  );
  assert.match(html, /<details class="bx-aa-booking">/);
  assert.doesNotMatch(html, /<details class="bx-aa-booking" open/);
  const header = html.slice(
    html.indexOf('<summary'),
    html.indexOf('</summary>'),
  );
  assert.match(header, /Cita confirmada/);
  assert.match(header, /bx-aa-card-chevron/);
  assert.doesNotMatch(header, /Código de cita|Total confirmado/);
  assert.match(html, /Código de cita/);
});
