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
function fixture(platform, component = 'RescheduleContent') {
  const controls = [],
    cache = new Map();
  const primitive = (kind) =>
    function Control(props) {
      controls.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
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
      (n) =>
        n === 'react/jsx-runtime'
          ? Object.fromEntries(
              Object.entries(require(n)).map(([key, value]) => [
                key,
                ['jsx', 'jsxs'].includes(key)
                  ? (type, props, ...rest) => {
                      if (typeof type === 'string')
                        controls.push({ kind: type, props });
                      return value(type, props, ...rest);
                    }
                  : value,
              ]),
            )
          : n === 'react-native'
            ? {
                View: primitive('View'),
                Text: primitive('Text'),
                TextInput: primitive('TextInput'),
                Pressable: primitive('Pressable'),
                Platform: { OS: platform },
                StyleSheet: { create: (s) => s },
              }
            : n.startsWith('.')
              ? load(path.resolve(path.dirname(file), n))
              : require(n),
      m,
      m.exports,
    );
    return m.exports;
  }
  const module = load(
    path.resolve(
      component === 'ProfessionalRescheduleForm'
        ? 'src/composition/professional-reschedule-form.web.tsx'
        : 'src/features/reservations/presentation/reschedule-control.tsx',
    ),
  );
  return {
    controls,
    render(props) {
      controls.length = 0;
      return renderToStaticMarkup(
        React.createElement(module[component], props),
      );
    },
  };
}
for (const platform of ['web', 'android'])
  test(
    platform +
      ' reschedule policy editor waits for a verified read and exposes minutes only',
    () => {
      const f = fixture(platform, 'ReschedulePolicyContent');
      let saves = 0;
      const props = {
        value: '120',
        checked: false,
        busy: false,
        error: null,
        saved: false,
        onChange() {},
        onRead() {},
        onSave() {
          saves++;
        },
      };
      f.render(props);
      assert.ok(
        f.controls.find(
          (c) =>
            c.props.accessibilityLabel ===
            'Guardar antelación de reprogramación',
        ).props.disabled,
      );
      f.render({ ...props, checked: true });
      f.controls
        .find(
          (c) =>
            c.props.accessibilityLabel ===
            'Guardar antelación de reprogramación',
        )
        .props.onPress();
      assert.equal(saves, 1);
      assert.equal(f.controls.filter((c) => c.kind === 'TextInput').length, 1);
      f.render({ ...props, checked: true, busy: true });
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
    },
  );
for (const platform of ['web', 'android'])
  test(
    platform +
      ' reschedule shows accessible date, options, uncertainty and confirmed result without financial editing',
    () => {
      const f = fixture(platform);
      let saves = 0;
      const props = {
        date: '2026-12-02',
        slots: [],
        selected: null,
        busy: false,
        queried: false,
        uncertain: false,
        error: null,
        done: false,
        onDate() {},
        onSearch() {},
        onSelect() {},
        onConfirm() {
          saves++;
        },
      };
      const html = f.render(props);
      assert.ok(!html.includes('No hay horarios'));
      assert.equal(f.controls.filter((c) => c.kind === 'TextInput').length, 1);
      assert.equal(
        f.controls.find((c) => c.kind === 'TextInput').props.accessibilityLabel,
        'Nueva fecha (AAAA-MM-DD)',
      );
      assert.ok(
        f.render({ ...props, queried: true }).includes('No hay horarios'),
      );
      const selected = '2026-12-02T15:00:00.000Z';
      f.render({
        ...props,
        selected,
        slots: [
          {
            startsAt: selected,
            endsAt: '2026-12-02T15:30:00.000Z',
            estimatedTotal: { amountMinor: 2500, currency: 'PEN' },
          },
        ],
      });
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Confirmar nuevo horario')
        .props.onPress();
      assert.equal(saves, 1);
      f.render({ ...props, busy: true });
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
      const uncertain = f.render({ ...props, uncertain: true, selected });
      assert.ok(uncertain.includes('mismo cambio'));
      assert.ok(
        f.render({ ...props, done: true }).includes('Reserva reprogramada'),
      );
      f.render({ ...props, staff: true, reason: '', onReason() {} });
      assert.ok(
        f.controls.some(
          (c) =>
            c.kind === 'TextInput' &&
            c.props.accessibilityLabel === 'Motivo (personal fuera del plazo)',
        ),
      );
    },
  );

test('professional reschedule uses calendar, explicit slot selection and existing handlers; uncertain results only retry', () => {
  const f = fixture('web', 'ProfessionalRescheduleForm');
  let date,
    selected,
    confirmations = 0,
    closes = 0;
  const props = {
    fieldId: 'reservation-real',
    staff: true,
    date: '2026-11-25',
    reason: '',
    slots: [{ startsAt: '2026-11-25T15:00:00.000Z' }],
    selected: null,
    busy: false,
    queried: true,
    uncertain: false,
    error: null,
    done: false,
    onDate(v) {
      date = v;
    },
    onSelect(v) {
      selected = v;
    },
    onReason() {},
    onSearch() {},
    onClose() {
      closes++;
    },
    onConfirm() {
      confirmations++;
    },
  };
  const html = f.render(props);
  const close = () =>
    f.controls.find(
      (c) =>
        c.kind === 'button' &&
        c.props['aria-label'] === 'Cerrar formulario de reprogramación',
    );
  close().props.onClick();
  assert.equal(closes, 1);
  assert.equal(confirmations, 0);
  assert.match(html, /type="date"/);
  f.controls
    .find((c) => c.kind === 'input')
    .props.onChange({ target: { value: '2026-11-26' } });
  assert.equal(date, '2026-11-26');
  assert.ok(
    f.controls.find(
      (c) =>
        c.kind === 'button' && c.props.children === 'Confirmar nuevo horario',
    ).props.disabled,
  );
  f.controls
    .find((c) => c.kind === 'button' && c.props['aria-pressed'] === false)
    .props.onClick();
  assert.equal(selected, props.slots[0].startsAt);
  assert.equal(confirmations, 0);
  f.render({ ...props, selected, uncertain: true });
  assert.ok(close().props.disabled);
  assert.ok(f.controls.find((c) => c.kind === 'input').props.disabled);
  f.controls
    .find(
      (c) =>
        c.kind === 'button' &&
        c.props.children === 'Reintentar el mismo cambio',
    )
    .props.onClick();
  assert.equal(confirmations, 1);
  assert.match(
    f.render({ ...props, queried: true, slots: [] }),
    /No hay horarios disponibles/,
  );
  assert.doesNotMatch(
    f.render({ ...props, staff: false }),
    /Motivo del cambio/,
  );
  assert.match(f.render({ ...props, done: true }), /Reserva reprogramada/);
  assert.equal(close().props.disabled, false);
  f.render({ ...props, busy: true });
  assert.equal(close().props.disabled, true);
});
