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
function load(file, overrides = {}) {
  if (!fs.existsSync(file))
    file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
  const module = { exports: {} };
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
        ? load(path.resolve(path.dirname(file), n), overrides)
        : require(n)),
    module,
    module.exports,
  );
  return module.exports;
}
const view = () =>
  load(path.resolve('src/composition/professional-agenda-view.ts'));
test('professional agenda distinguishes attendance from reservation state and never assumes a failed read was completed', () => {
  const { appointmentStatus, agendaRows } = view();
  const rows = [
    { id: 'cancel', state: 'cancelled', startsAt: '2026-11-23T16:00:00Z' },
    { id: 'done', state: 'confirmed', startsAt: '2026-11-23T14:00:00Z' },
    { id: 'pending', state: 'confirmed', startsAt: '2026-11-23T15:00:00Z' },
    { id: 'unknown', state: 'confirmed', startsAt: '2026-11-23T13:00:00Z' },
  ];
  const care = {
    done: { attendance: 'completed' },
    pending: { attendance: 'confirmed' },
  };
  assert.equal(
    appointmentStatus(rows[0], { attendance: 'completed' }).id,
    'cancelled',
  );
  assert.equal(appointmentStatus(rows[3]).id, 'unknown');
  assert.equal(
    agendaRows(rows, care, 'completed')
      .map((r) => r.id)
      .join(','),
    'done',
  );
  assert.equal(
    agendaRows(rows, care, 'confirmed')
      .map((r) => r.id)
      .join(','),
    'pending',
  );
  assert.equal(
    agendaRows(rows, care, 'all')
      .map((r) => r.id)
      .join(','),
    'cancel,pending,done,unknown',
  );
  assert.equal(rows[0].id, 'cancel');
});
test('weekly groups use Lima day boundaries and stable chronological order', () => {
  const { agendaGroups } = view();
  const groups = agendaGroups(
    [
      { id: 'monday', startsAt: '2026-11-23T05:10:00Z' },
      { id: 'sunday', startsAt: '2026-11-23T02:00:00Z' },
    ],
    '2026-11-22',
    true,
  );
  assert.equal(groups.length, 7);
  assert.equal(groups.at(-1).day, '2026-11-22');
  assert.equal(groups.at(-1).rows[0].id, 'sunday');
  assert.equal(groups.flatMap((g) => g.rows).length, 1);
});
function renderAgenda({
  data = null,
  busy = false,
  filter = 'all',
  weekly = false,
  careEnabled = true,
} = {}) {
  const changes = [],
    captures = [];
  const app = { getScope: () => ({ role: 'barber' }) };
  const activity = {
    day: '2026-11-23',
    weekly,
    data,
    busy,
    error: false,
    setDay: (v) => changes.push(['day', v]),
    setWeekly: (v) => changes.push(['weekly', v]),
    refresh: () => changes.push(['refresh']),
  };
  function TestCare(p) {
    captures.push(p);
    return p.renderLayout({
      operations: [],
      feedback: null,
      trigger: React.createElement(
        'button',
        { onClick: p.onReadStart },
        'Consultar atención y pago',
      ),
      content: React.createElement('span', null, 'Atención y pago reales'),
      actions: p.renderActions?.(p.initialView),
      busy: false,
      view: p.initialView
        ? { events: [], payment: null, ...p.initialView }
        : null,
    });
  }
  const overrides = {
    react: {
      ...React,
      useState: (init) => [
        typeof init === 'function'
          ? init()
          : typeof init === 'string'
            ? filter
            : init,
        (v) => changes.push(['state', v]),
      ],
    },
    'expo-router': { Link: (p) => React.createElement('a', p) },
    './use-professional-agenda': { useProfessionalAgenda: () => activity },
    '../features/reservations/presentation/care-control': {
      CareControl: TestCare,
    },
    '../features/reservations/presentation/cancellation-control': {
      CancellationControl: () =>
        React.createElement('span', null, 'Cancelación existente'),
    },
    '../features/reservations/presentation/reschedule-control': {
      RescheduleControl: (p) =>
        React.createElement(
          'span',
          null,
          p.canChange ? 'Reprogramación existente' : 'Historial existente',
        ),
    },
  };
  const { ProfessionalAgenda } = load(
    path.resolve('src/composition/professional-agenda.web.tsx'),
    overrides,
  );
  const tree = ProfessionalAgenda({
    application: app,
    booking: careEnabled ? { care() {} } : null,
    shopId: 'shop',
  });
  const html = renderToStaticMarkup(tree),
    nodes = [];
  const visit = (v) => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v?.props) {
      nodes.push(v);
      visit(v.props.children);
    }
  };
  visit(tree);
  return { html, nodes, changes, captures };
}
test('agenda has real date/state/day/week controls, precise empty/loading states and contextual links', () => {
  assert.match(
    renderAgenda({ busy: true }).html,
    /Cargando tu agenda|Consultando tu agenda/,
  );
  const data = {
    rows: [],
    care: {},
    agendaReady: true,
    summary: { total: 0, completed: 0, inService: 0, scheduled: 0 },
  };
  const { html, nodes, changes } = renderAgenda({ data });
  assert.match(html, /No hay citas para este día/);
  assert.match(html, /23\/11\/2026/);
  assert.match(html, /section=schedules/);
  assert.doesNotMatch(html, /href="\/services"/);
  nodes.find((n) => n.props['aria-label'] === 'Día siguiente').props.onClick();
  assert.deepEqual(changes.at(-1), ['day', '2026-11-24']);
  nodes
    .find((n) => n.type === 'button' && n.props['aria-pressed'] === false)
    .props.onClick();
  assert.deepEqual(changes.at(-1), ['weekly', true]);
  nodes
    .find((n) => n.type === 'select')
    .props.onChange({ target: { value: 'completed' } });
  assert.deepEqual(changes.at(-1), ['state', 'completed']);
  assert.doesNotMatch(
    renderAgenda({ data: { ...data, agendaReady: false }, busy: false }).html,
    /No hay citas para este día/,
  );
});
test('completed appointment cannot expose cancellation and summary keeps unfiltered server totals', () => {
  const row = {
    total: { amountMinor: 1500, currency: 'PEN' },
    id: 'r',
    state: 'confirmed',
    startsAt: '2026-11-23T14:00:00Z',
    clientDisplayNameSnapshot: 'Cliente real',
    durationMin: 40,
    items: [{ nameSnapshot: 'Servicio real' }],
  };
  const data = {
    rows: [row],
    care: { r: { attendance: 'completed' } },
    agendaReady: true,
    summary: { total: 8, completed: 3, inService: 2, scheduled: 3 },
  };
  const { html } = renderAgenda({ data });
  assert.match(html, /Cliente real/);
  assert.match(html, /09:00/);
  assert.match(html, /Completada/);
  assert.match(html, /El cliente no asistió a su cita/);
  assert.match(html, /bx-pa-status--neutral/);
  assert.match(html, /bx-pro-appointment-toggle/);
  assert.match(html, /Datos de la reserva/);
  assert.match(html, /Gestión de la cita/);
  assert.doesNotMatch(
    html.replace(/<style>[\s\S]*?<\/style>/g, ''),
    /bx-pa-action-menu|Opciones de la cita|Más acciones de la cita/,
  );
  assert.doesNotMatch(html, /Cancelación existente/);
  assert.match(html, />8</);
});

test('unified agenda keeps staff controls and refreshes after verified mutations; refresh pauses editing and unavailable care grants no actions', () => {
  const row = {
    id: 'r',
    state: 'confirmed',
    startsAt: '2026-11-23T15:00:00Z',
    clientDisplayNameSnapshot: 'Cliente',
    durationMin: 40,
    items: [{ nameSnapshot: 'Corte' }],
    total: { amountMinor: 1500, currency: 'PEN' },
  };
  const data = {
    rows: [row],
    care: { r: { attendance: 'confirmed' } },
    agendaReady: true,
    summary: { total: 1 },
  };
  let result = renderAgenda({ data });
  assert.match(result.html, /Reprogramación existente/);
  assert.match(result.html, /Cancelación existente/);
  assert.equal(result.captures[0].reservationId, 'r');
  result.captures[0].onUpdated({}, false);
  assert.equal(result.changes.length, 0);
  result.captures[0].onUpdated({}, true);
  assert.deepEqual(result.changes, [['refresh']]);
  result = renderAgenda({ data, busy: true });
  assert.match(result.html, /inert=""/);
  assert.doesNotMatch(
    result.html,
    /Reprogramación existente|Cancelación existente/,
  );
  result = renderAgenda({ data, careEnabled: false });
  assert.equal(result.captures.length, 0);
  assert.match(result.html, /Atención no disponible/);
  assert.doesNotMatch(
    result.html,
    /Reprogramación existente|Cancelación existente/,
  );
});

test('agenda controller serializes reads, drops obsolete dates and tenants, and retains same-query content during refresh', async () => {
  const slots = [],
    requests = [];
  let index = 0,
    pendingEffect,
    previousDeps,
    cleanup,
    scope = 'tenant-one';
  const react = {
    useState(init) {
      const i = index++;
      if (!(i in slots)) slots[i] = typeof init === 'function' ? init() : init;
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
    useEffect(fn, deps) {
      if (!previousDeps || deps.some((v, i) => v !== previousDeps[i])) {
        previousDeps = deps;
        pendingEffect = fn;
      }
    },
  };
  const { useProfessionalAgenda: runHook } = load(
    path.resolve('src/composition/use-professional-agenda.ts'),
    {
      react,
      '../features/barbershop-operation/presentation/professional-dashboard-dates':
        {
          // This scenario changes from the 23rd to the 24th; do not use today's date.
          professionalDay: () => '2026-11-23',
        },
      './professional-dashboard-data': {
        readProfessionalDashboard: (args) =>
          new Promise((resolve) => requests.push({ args, resolve })),
      },
    },
  );
  const app = { scopeKey: () => scope },
    booking = {};
  const render = () => {
    index = 0;
    const view = runHook(app, booking, 'shop');
    if (pendingEffect) {
      cleanup?.();
      cleanup = pendingEffect();
      pendingEffect = null;
    }
    return view;
  };
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  let current = render();
  await tick();
  assert.equal(requests.length, 1);
  current.setDay('2026-11-24');
  current = render();
  await tick();
  assert.equal(
    requests.length,
    1,
    'new request waits for obsolete in-flight read',
  );
  requests[0].resolve({ rows: [{ id: 'old' }], error: false });
  await tick();
  assert.equal(requests.length, 2);
  assert.equal(render().data, null);
  assert.equal(requests[1].args.day, '2026-11-24');
  assert.equal(requests[1].args.includeOverview, false);
  const verified = { rows: [{ id: 'own' }], error: false };
  requests[1].resolve(verified);
  await tick();
  current = render();
  assert.equal(current.data, verified);
  assert.equal(current.busy, false);
  current.refresh();
  current = render();
  await tick();
  assert.equal(current.busy, true);
  assert.equal(current.data, verified);
  scope = 'tenant-two';
  current = render();
  assert.equal(
    current.data,
    null,
    'old tenant is hidden before the new effect resolves',
  );
  requests[2].resolve(verified);
  await tick();
  assert.equal(render().data, null);
  cleanup?.();
});

test('start dialog exposes a clear decision and close/cancel never call confirm', () => {
  const { CareOperationConfirmation } = load(
    path.resolve('src/composition/care-operation-confirmation.web.tsx'),
    {
      react: {
        ...React,
        useRef: (current) => ({ current }),
        useEffect() {},
        useId: () => 'decision',
      },
    },
  );
  let confirmed = 0,
    cancelled = 0;
  const props = {
    busy: false,
    onConfirm: () => confirmed++,
    onCancel: () => cancelled++,
  };
  for (const [command, title] of [
    ['receive', '¿Registrar pago recibido?'],
    ['no-show', '¿Registrar inasistencia?'],
    ['complete', '¿Completar atención?'],
  ]) {
    const markup = renderToStaticMarkup(
      CareOperationConfirmation({ ...props, command }),
    );
    assert.ok(markup.includes(title));
    assert.doesNotMatch(markup, /¿Iniciar atención/);
  }
  const tree = CareOperationConfirmation(props);
  const html = renderToStaticMarkup(tree);
  assert.match(html, /role="dialog"/);
  assert.match(html, /¿Iniciar atención/);
  assert.doesNotMatch(html, /Confirmar operación|Volver sin confirmar/);
  const buttons = [];
  const visit = (v) => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v?.props) {
      if (v.type === 'button') buttons.push(v);
      visit(v.props.children);
    }
  };
  visit(tree);
  buttons[0].props.onClick();
  buttons[1].props.onClick();
  assert.equal(cancelled, 2);
  assert.equal(confirmed, 0);
  buttons[2].props.onClick();
  assert.equal(confirmed, 1);
  assert.match(
    renderToStaticMarkup(CareOperationConfirmation({ ...props, busy: true })),
    /Iniciando/,
  );
});
