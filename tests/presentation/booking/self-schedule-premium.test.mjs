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
function loader(overrides = {}) {
  const cache = new Map();
  return function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        overrides[n] ??
        (n.startsWith('.')
          ? load(path.resolve(path.dirname(file), n))
          : require(n)),
      module,
      module.exports,
    );
    return module.exports;
  };
}
const id = '11111111-1111-4111-8111-111111111111';
const view = {
  professional: {
    id,
    userId: id,
    barbershopId: id,
    professionalName: 'Profesional real',
    active: true,
  },
  version: 2,
  shopHours: [
    { weekday: 1, opensMin: 517, closesMin: 780 },
    { weekday: 1, opensMin: 855, closesMin: 1320 },
  ],
  hours: [{ weekday: 1, opensMin: 540, closesMin: 720 }],
  blocks: [],
};
test('personal picker follows actual shop windows and exact minute boundaries without opening the lunch break', () => {
  const load = loader();
  const { personalTimeOptions, preparePersonalInterval } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/self-schedule-options.ts',
    ),
  );
  const starts = personalTimeOptions(view.shopHours, 1, null, false);
  assert.ok(starts.includes(517));
  assert.ok(starts.includes(855));
  assert.ok(!starts.includes(780));
  assert.ok(!starts.includes(810));
  const ends = personalTimeOptions(view.shopHours, 1, null, true, 540);
  assert.ok(ends.includes(780));
  assert.ok(!ends.includes(855));
  assert.throws(() => preparePersonalInterval(view, [], '1', '09:00', '14:30'));
  assert.throws(() =>
    preparePersonalInterval(view, view.hours, '1', '09:00', '10:00'),
  );
  const next = preparePersonalInterval(view, view.hours, '1', '14:15', '18:00');
  assert.equal(next.length, 2);
  assert.equal(next[1].opensMin, 855);
});
test('adjacent local intervals allow coverage through their shared boundary; midnight and closed days remain correct', () => {
  const { personalTimeOptions, preparePersonalInterval } = loader()(
    path.resolve(
      'src/features/barbershop-operation/presentation/self-schedule-options.ts',
    ),
  );
  const local = {
    ...view,
    shopHours: [
      { weekday: 1, opensMin: 540, closesMin: 600 },
      { weekday: 1, opensMin: 600, closesMin: 1440 },
    ],
  };
  assert.ok(
    personalTimeOptions(local.shopHours, 1, null, true, 540).includes(1440),
  );
  assert.equal(
    preparePersonalInterval(local, [], '1', '09:00', '24:00')[0].closesMin,
    1440,
  );
  assert.equal(personalTimeOptions(local.shopHours, 0, null, false).length, 0);
});
function ui(props = {}, confirmation = false) {
  const captures = [],
    changes = [];
  function Button(p) {
    captures.push(p);
    return React.createElement(
      'button',
      { disabled: p.disabled, 'aria-label': p.label },
      p.label,
    );
  }
  const load = loader({
    react: { ...React, useState: () => [confirmation, (v) => changes.push(v)] },
    '../../../shared/ui/app-button': { AppButton: Button },
    '../../../shared/ui/success-toast': {
      SuccessToast: (props) =>
        React.createElement(
          'div',
          { className: 'bx-success-toast' },
          props.message,
        ),
    },
  });
  const { SelfScheduleWeb } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/self-schedule-web.tsx',
    ),
  );
  const p = {
    view,
    hours: view.hours,
    weekday: '1',
    opens: '14:15',
    closes: '18:00',
    starts: '',
    ends: '',
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
    onSaveHours() {},
    onStarts() {},
    onEnds() {},
    onReason() {},
    onSaveBlock() {},
    onSelectBlock() {},
    onNewBlock() {},
    onRemoveBlock() {},
    ...props,
  };
  const tree = SelfScheduleWeb(p);
  const html = renderToStaticMarkup(tree);
  const nodes = [],
    visit = (n) => {
      if (Array.isArray(n)) n.forEach(visit);
      else if (n?.props) {
        nodes.push(n);
        visit(n.props.children);
      }
    };
  visit(tree);
  return { html, captures, changes, nodes };
}
test('premium schedule renders real local hours, native local date/time controls and forwards legacy payload format', () => {
  const changed = [];
  const { html, nodes } = ui({ onStarts: (v) => changed.push(v) });
  for (const text of [
    'Mis horarios y bloqueos',
    'Horario general del local',
    'Referencia del local',
    '08:37',
    '14:15',
    'Mis bloqueos',
  ])
    assert.ok(html.includes(text), text);
  assert.equal((html.match(/type="datetime-local"/g) ?? []).length, 2);
  nodes
    .find((n) => n.type === 'input' && n.props.id === 'self-block-start')
    .props.onChange({ target: { value: '2026-11-24T13:45' } });
  assert.equal(changed[0], '2026-11-24 13:45');
});
test('empty-list removal requires explicit confirmation before save, and preparing another block only clears the form', () => {
  let saves = 0,
    clears = 0;
  const props = {
    hours: [],
    onSaveHours: () => saves++,
    onNewBlock: () => clears++,
  };
  const first = ui(props);
  first.captures.find((p) => p.label === 'Guardar mis horarios').onPress();
  assert.equal(saves, 0);
  assert.equal(first.changes.at(-1), true);
  const confirmed = ui(props, true);
  confirmed.captures
    .find((p) => p.label === 'Confirmar retirada de horarios')
    .onPress();
  assert.equal(saves, 1);
  first.captures.find((p) => p.label === 'Preparar otro bloqueo').onPress();
  assert.equal(clears, 1);
});
function controller(application, domainValues) {
  const slots = [];
  let index = 0;
  const load = loader({
    '../domain/values': domainValues,
    react: {
      useState(init) {
        const i = index++;
        if (!(i in slots))
          slots[i] = typeof init === 'function' ? init() : init;
        return [
          slots[i],
          (v) => {
            slots[i] = typeof v === 'function' ? v(slots[i]) : v;
          },
        ];
      },
      useRef(init) {
        const i = index++;
        slots[i] ??= { current: init };
        return slots[i];
      },
      useEffect() {},
    },
    'react-native': { Platform: { OS: 'web' } },
    './self-schedule-web': { SelfScheduleWeb: () => null },
    '../../../shared/ui/app-button': {},
    '../../../shared/ui/app-text': {},
    '../../../shared/ui/app-text-field': {},
    '../../../shared/ui/page-header': {},
    '../../../shared/ui/status-message': {},
  });
  const { SelfSchedulePanel } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/self-schedule.tsx',
    ),
  );
  return () => {
    index = 0;
    return SelfSchedulePanel({ application }).props;
  };
}
test('existing controller/application persist hours through a read round-trip and send Lima blocks with the current version', async () => {
  const load = loader();
  const { createSelfScheduleApplication } = load(
    path.resolve(
      'src/features/barbershop-operation/application/self-schedule.ts',
    ),
  );
  let stored = { ...view },
    mutations = [];
  const gateway = {
    getOwnSchedule: async () => stored,
    setOwnSchedule: async (shop, version, hours) => {
      assert.equal(shop, id);
      assert.equal(version, stored.version);
      mutations.push(['hours', hours]);
      return (stored = { ...stored, version: version + 1, hours });
    },
    upsertOwnBlock: async (shop, version, block) => {
      assert.equal(shop, id);
      assert.equal(version, stored.version);
      mutations.push(['block', block]);
      return (stored = { ...stored, version: version + 1, blocks: [block] });
    },
  };
  const application = createSelfScheduleApplication({
    gateway,
    enabled: true,
    newId: () => id,
    scope: () => ({
      userId: id,
      barbershopId: id,
      generation: 1,
      role: 'barber',
    }),
  });
  const render = controller(application),
    tick = () => new Promise((resolve) => setImmediate(resolve));
  render().onRead();
  await tick();
  let props = render();
  props.onOpens('14:15');
  props.onCloses('18:00');
  props = render();
  props.onAdd();
  props = render();
  assert.equal(props.hours.length, 2);
  assert.equal(mutations.length, 0);
  props.onSaveHours();
  await tick();
  props = render();
  assert.equal(props.saved, true);
  const reload = controller(application);
  reload().onRead();
  await tick();
  assert.equal(reload().hours.length, 2);
  props.onRemoveHour(1);
  props = render();
  props.onSaveHours();
  await tick();
  assert.equal(stored.hours.length, 1);
  props = render();
  props.onStarts('2026-11-24 13:00');
  props.onEnds('2026-11-24 14:00');
  props.onReason(' Descanso ');
  props = render();
  props.onSaveBlock();
  await tick();
  props = render();
  assert.equal(props.saved, true);
  assert.match(ui(props).html, /bx-success-toast/);
  assert.equal(props.starts, '');
  assert.equal(props.ends, '');
  assert.equal(stored.blocks[0].startsAt, '2026-11-24T18:00:00.000Z');
  assert.equal(stored.blocks[0].endsAt, '2026-11-24T19:00:00.000Z');
  assert.equal(stored.blocks[0].reason, 'Descanso');
  props.onSelectBlock(stored.blocks[0]);
  props = render();
  assert.equal(props.starts, '2026-11-24 13:00');
  const count = mutations.length;
  props.onNewBlock();
  props = render();
  assert.equal(props.starts, '');
  assert.equal(mutations.length, count);
});
test('conflicting save retains the block draft and reports failure without declaring it saved', async () => {
  const domainValues = loader()(
    path.resolve('src/features/barbershop-operation/domain/values.ts'),
  );
  const { BusinessError } = domainValues;
  const app = {
    scopeKey: () => 'same',
    read: async () => view,
    newBlockId: () => id,
    saveBlock: async () => {
      throw new BusinessError('CONFLICT');
    },
  };
  const render = controller(app, domainValues),
    tick = () => new Promise((resolve) => setImmediate(resolve));
  render().onRead();
  await tick();
  let props = render();
  props.onStarts('2026-11-24 13:00');
  props.onEnds('2026-11-24 14:00');
  props = render();
  props.onSaveBlock();
  await tick();
  props = render();
  assert.equal(props.saved, false);
  assert.equal(props.starts, '2026-11-24 13:00');
  assert.ok(props.error);
  assert.match(props.error, /cita comprometida/);
});
test('block editing/removal stay available and invalid block dates cannot submit', () => {
  let selected, removed;
  const block = {
    id: 'block',
    startsAt: '2026-11-24T15:00:00.000Z',
    endsAt: '2026-11-24T16:00:00.000Z',
    reason: 'Motivo real',
  };
  const rendered = ui({
    view: { ...view, blocks: [block] },
    starts: '2026-11-24 11:00',
    ends: '2026-11-24 10:00',
    onSelectBlock: (v) => (selected = v),
    onRemoveBlock: (v) => (removed = v),
  });
  assert.match(rendered.html, /Motivo real/);
  rendered.captures.find((p) => p.label === 'Editar bloqueo 1').onPress();
  rendered.captures.find((p) => p.label === 'Retirar bloqueo 1').onPress();
  assert.equal(selected, block);
  assert.equal(removed, 'block');
  assert.equal(
    rendered.captures.find((p) => p.label === 'Guardar mi bloqueo').disabled,
    true,
  );
});

test('administrative blocks view hides duplicate weekly editor while professional view retains it', () => {
  const admin = ui({ hideWeeklyEditor: true });
  assert.doesNotMatch(
    admin.html,
    /Mis intervalos semanales|Guardar mis horarios/,
  );
  assert.match(admin.html, /Mis bloqueos/);
  const personal = ui();
  assert.match(personal.html, /Mis intervalos semanales/);
});

test('verified personal schedule save uses the shared toast rather than inline success feedback', () => {
  const result = ui({ saved: true });
  assert.match(result.html, /bx-success-toast/);
  assert.doesNotMatch(
    result.html.replace(/<style>[\s\S]*?<\/style>/g, ''),
    /bx-self-schedule-feedback--success/,
  );
});
