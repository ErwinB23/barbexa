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
function fixture(platform) {
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
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
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
  const { SelfScheduleContent } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/self-schedule.tsx',
    ),
  );
  return {
    controls,
    render(props) {
      controls.length = 0;
      return renderToStaticMarkup(
        React.createElement(SelfScheduleContent, props),
      );
    },
  };
}
const id = '11111111-1111-4111-8111-111111111111';
const view = {
  professional: {
    id,
    userId: id,
    barbershopId: id,
    professionalName: 'Own',
    active: true,
  },
  version: 1,
  shopHours: [],
  hours: [],
  blocks: [
    {
      id,
      startsAt: '2026-11-20T15:00:00.000Z',
      endsAt: '2026-11-20T16:00:00.000Z',
      reason: null,
    },
  ],
};
test('web personal intervals use named days and time selectors, preserve exact minutes and explain the two save steps', () => {
  const f = fixture('web');
  const props = {
    view,
    hours: [{ weekday: 1, opensMin: 510, closesMin: 780 }],
    weekday: '1',
    opens: '08:37',
    closes: '24:00',
    starts: '',
    ends: '',
    reason: '',
    busy: false,
    error: null,
    saved: false,
  };
  const html = f.render(props);
  assert.match(html, /<select[^>]*id="self-day"/);
  assert.match(html, /value="1" selected="">Lunes/);
  assert.match(html, /<select[^>]*id="self-opens"/);
  assert.match(html, /08:37/);
  assert.match(html, /24:00/);
  assert.doesNotMatch(html, /Día \(0 domingo a 6 sábado\)/);
  assert.match(html, /08:30–13:00/);
  assert.match(html, /Añadir intervalo/);
  assert.match(html, /Guardar mis horarios/);
  assert.match(html, /descanso/);
  const busy = f.render({ ...props, busy: true });
  assert.equal((busy.match(/<select[^>]*disabled=""/g) ?? []).length, 3);
});
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' own schedule exposes labelled local-time fields and protected busy actions',
    () => {
      const f = fixture(platform);
      let saves = 0,
        removes = 0;
      const props = {
        view,
        hours: [{ weekday: 1, opensMin: 540, closesMin: 600 }],
        weekday: '1',
        opens: '09:00',
        closes: '10:00',
        starts: '2026-11-20 10:00',
        ends: '2026-11-20 11:00',
        reason: '',
        busy: false,
        error: null,
        saved: false,
        onRead() {},
        onWeekday() {},
        onOpens() {},
        onCloses() {},
        onAdd() {},
        onRemoveHour() {},
        onSaveHours() {
          saves++;
        },
        onStarts() {},
        onEnds() {},
        onReason() {},
        onSaveBlock() {
          saves++;
        },
        onSelectBlock() {},
        onNewBlock() {},
        onRemoveBlock() {
          removes++;
        },
      };
      const html = f.render(props);
      assert.ok(html.includes('Lima'));
      assert.ok(!html.includes(id));
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => c.props.accessibilityLabel && c.props.allowFontScaling),
      );
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Guardar mis horarios')
        .props.onPress();
      assert.equal(saves, 1);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Retirar bloqueo 1')
        .props.onPress();
      assert.equal(removes, 1);
      f.render({ ...props, busy: true });
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'Pressable')
          .every((c) => c.props.disabled),
      );
    },
  );
  test(
    platform +
      ' unknown availability never appears as empty confirmed schedule',
    () => {
      const f = fixture(platform);
      const html = f.render({
        view: null,
        hours: [],
        busy: false,
        error: null,
        saved: false,
        onRead() {},
      });
      assert.ok(html.includes('Consulta tu disponibilidad'));
      assert.equal(f.controls.filter((c) => c.kind === 'TextInput').length, 0);
    },
  );
}
