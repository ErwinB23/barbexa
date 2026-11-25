import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { detail } from '../../integration/booking/booking-payload-fixture.mjs';
const require = createRequire(import.meta.url);
function fixture({
  attendance,
  refund = false,
  staff = false,
  platform = 'web',
  busy = false,
}) {
  const controls = [],
    cache = new Map();
  let index = 0;
  const view =
    attendance === undefined
      ? null
      : {
          reservationId: detail.id,
          attendance,
          payment:
            attendance === null
              ? null
              : {
                  method: 'cash',
                  status: attendance === 'cancelled' ? 'paid' : 'pending',
                  amountMinor: 2500,
                  currency: 'PEN',
                },
          events: [],
          permissions: { attend: staff, receive: staff, refund },
        };
  const states = [view, busy, false, '', '', ''];
  const primitive = (kind) =>
    function Component(props) {
      controls.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  function load(file) {
    file = path.resolve(file);
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
    if (file.endsWith(path.sep + 'app-button.tsx'))
      return {
        AppButton: (props) =>
          React.createElement(primitive('Pressable'), {
            ...props,
            accessibilityLabel: props.label,
          }),
      };
    if (file.endsWith(path.sep + 'app-text-field.tsx'))
      return { AppTextField: primitive('TextInput') };
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      Date,
      Intl,
    })(
      (name) =>
        name === 'react'
          ? {
              ...React,
              useState: (initial) => {
                const actual = React.useState(initial);
                // Seed only CareControl's verified response, independent of layout hooks.
                if (!file.endsWith(path.sep + 'care-control.tsx'))
                  return actual;
                const slot = index++;
                return [
                  slot < states.length
                    ? states[slot]
                    : typeof initial === 'function'
                      ? initial()
                      : initial,
                  () => {},
                ];
              },
            }
          : name === 'react-native'
            ? {
                View: primitive('View'),
                Text: primitive('Text'),
                TextInput: primitive('TextInput'),
                Pressable: primitive('Pressable'),
                ScrollView: primitive('ScrollView'),
                Platform: { OS: platform },
                StyleSheet: { create: (x) => x },
              }
            : name === 'react-native-safe-area-context'
              ? { SafeAreaView: primitive('SafeAreaView') }
              : name.startsWith('.')
                ? load(path.resolve(path.dirname(file), name))
                : require(name),
      m,
      m.exports,
    );
    return m.exports;
  }
  const base = path.resolve('src/features/reservations/presentation');
  const { BookingContext } = load(base + '/booking-context.tsx');
  const { MyReservationsContent } = load(base + '/my-reservations-screen.tsx');
  const { AgendaContent } = load(base + '/agenda-screen.tsx');
  const app = {
    care() {
      throw Error('NO_NETWORK_OR_MUTATION');
    },
    reschedule: {},
    cancelReservation() {
      throw Error('NO_MUTATION');
    },
    cancellationRequestId() {
      throw Error('NO_MUTATION');
    },
  };
  const booking = {
    ...detail,
    startsAt: '2099-01-01T15:00:00.000Z',
    state: attendance === 'cancelled' ? 'cancelled' : 'confirmed',
  };
  const html = renderToStaticMarkup(
    React.createElement(
      BookingContext.Provider,
      { value: app },
      staff
        ? React.createElement(AgendaContent, {
            state: {
              rows: [booking],
              phase: 'ready',
              filters: { state: null, barberId: null },
            },
            administrator: false,
            date: '2099-01-01',
            onDate() {},
            onFilter() {},
            onRefresh() {},
            onContext() {},
          })
        : React.createElement(MyReservationsContent, {
            state: { own: [booking], ownPhase: 'ready' },
            application: app,
            onBook() {},
          }),
    ),
  );
  return {
    html,
    labels: controls
      .filter((c) => c.kind === 'Pressable')
      .map((c) => c.props.accessibilityLabel),
  };
}
for (const attendance of ['completed', 'in-service', 'no-show', 'cancelled']) {
  test(`Web ${attendance} suppresses mutations but preserves rescheduling history`, () => {
    const { labels } = fixture({ attendance, staff: true });
    assert.ok(!labels.includes('Cancelar cita'));
    assert.ok(!labels.includes('Reprogramar cita'));
    assert.ok(labels.includes('Consultar historial de reprogramación'));
  });
}
test('Web unknown or pending verification does not offer management mutations', () => {
  for (const options of [{}, { attendance: 'confirmed', busy: true }]) {
    const { labels } = fixture(options);
    assert.ok(!labels.includes('Cancelar cita'));
    assert.ok(!labels.includes('Reprogramar cita'));
    assert.ok(labels.includes('Consultar atención y pago'));
  }
});
test('Web eligible confirmed and verified legacy bookings retain client management actions', () => {
  for (const attendance of ['confirmed', null]) {
    const { labels } = fixture({ attendance });
    assert.ok(labels.includes('Cancelar cita'));
    assert.ok(labels.includes('Reprogramar cita'));
    assert.ok(!labels.includes('Registrar reembolso total externo'));
  }
});
test('Web refund visibility follows verified owner permission, not staff presentation', () => {
  assert.ok(
    fixture({
      attendance: 'cancelled',
      refund: true,
      staff: true,
    }).labels.includes('Registrar reembolso total externo'),
  );
  assert.ok(
    !fixture({
      attendance: 'cancelled',
      refund: false,
      staff: true,
    }).labels.includes('Registrar reembolso total externo'),
  );
});
test('Android keeps the existing unqueried management presentation', () => {
  const { labels } = fixture({ platform: 'android' });
  assert.ok(labels.includes('Cancelar cita'));
  assert.ok(labels.includes('Reprogramar cita'));
});
