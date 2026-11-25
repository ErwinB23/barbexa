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
function fixture(values, application) {
  const observed = [],
    cache = new Map();
  const updates = [];
  let index = 0;
  const primitive = (kind) =>
    function Primitive(props) {
      observed.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive('View'),
    Text: primitive('Text'),
    TextInput: primitive('TextInput'),
    Pressable: primitive('Pressable'),
    ScrollView: primitive('ScrollView'),
    Platform: { OS: 'web' },
    StyleSheet: { create: (x) => x },
  };
  function load(file) {
    if (!path.extname(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react'
          ? {
              ...React,
              useState: (initial) => {
                const slot = index;
                return [
                  index < values.length
                    ? values[index++]
                    : typeof initial === 'function'
                      ? initial()
                      : initial,
                  (value) => updates.push({ slot, value }),
                ];
              },
            }
          : n === 'react-native'
            ? rn
            : n.startsWith('.')
              ? load(path.resolve(path.dirname(file), n))
              : require(n),
      m,
      m.exports,
    );
    return m.exports;
  }
  const { BookingContext } = load(
    path.resolve('src/features/reservations/presentation/booking-context.tsx'),
  );
  const { CancellationControl } = load(
    path.resolve(
      'src/features/reservations/presentation/cancellation-control.tsx',
    ),
  );
  return {
    observed,
    updates,
    render(staff = false, state = 'confirmed') {
      return renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: application },
          React.createElement(CancellationControl, {
            detail: { ...detail, state, startsAt: '2099-01-01T15:00:00.000Z' },
            staff,
          }),
        ),
      );
    },
  };
}
test('cancel confirmation requires a staff reason and never offers cancelled-row mutation', () => {
  const app = {
    cancelReservation: async () => {},
    cancellationRequestId: () => detail.id,
  };
  const f = fixture([true, '', false, ''], app);
  const html = f.render(true);
  assert.match(html, /Motivo de cancelación/);
  assert.match(html, /Confirmar cancelación/);
  const button = f.observed.find(
    (x) =>
      x.kind === 'Pressable' &&
      x.props.accessibilityLabel === 'Confirmar cancelación',
  );
  assert.equal(button.props.disabled, true);
  const g = fixture([], app);
  assert.equal(g.render(false, 'cancelled'), '');
});

test('a secure request-id failure restores the cancellation form without sending a mutation', async () => {
  let calls = 0;
  const f = fixture([true, '', false, ''], {
    cancellationRequestId: () => {
      throw Object.assign(Error('secure entropy unavailable'), {
        code: 'DEPENDENCY_UNAVAILABLE',
      });
    },
    cancelReservation: async () => {
      calls++;
    },
  });
  f.render(false);
  f.observed
    .find(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Confirmar cancelación',
    )
    .props.onPress();
  await new Promise((r) => setImmediate(r));
  assert.equal(calls, 0);
  assert.ok(f.updates.some((u) => u.slot === 2 && u.value === false));
  assert.ok(
    f.updates.some(
      (u) => u.slot === 3 && typeof u.value === 'string' && u.value.length,
    ),
  );
  assert.ok(f.updates.some((u) => u.slot === 4 && u.value === false));
});
test('two presses use one in-flight cancellation and one secure request identity', async () => {
  let calls = 0,
    keys = 0,
    finish;
  const f = fixture([true, '', false, ''], {
    cancellationRequestId: () => {
      keys++;
      return detail.id;
    },
    cancelReservation: () => {
      calls++;
      return new Promise((r) => {
        finish = r;
      });
    },
  });
  f.render(false);
  const press = f.observed.find(
    (x) =>
      x.kind === 'Pressable' &&
      x.props.accessibilityLabel === 'Confirmar cancelación',
  ).props.onPress;
  press();
  press();
  assert.equal(calls, 1);
  assert.equal(keys, 1);
  finish({ state: 'cancelled' });
  await new Promise((r) => setImmediate(r));
});
