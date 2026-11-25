import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { detail } from '../integration/booking/booking-payload-fixture.mjs';
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  if (!fs.existsSync(file))
    file = ['.tsx', '.ts'].map((ext) => file + ext).find(fs.existsSync) ?? file;
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
      n.startsWith('.')
        ? load(path.resolve(path.dirname(file), n))
        : require(n),
    module,
    module.exports,
  );
  return module.exports;
}
const { professionalDay, professionalWeek } = load(
  path.resolve(
    'src/features/barbershop-operation/presentation/professional-dashboard-dates.ts',
  ),
);
test('professional calendar uses Lima midnight and Monday-first weeks across month/year boundaries', () => {
  assert.equal(professionalDay(new Date('2026-11-23T02:00:00Z')), '2026-11-22');
  assert.equal(professionalDay(new Date('2026-11-23T05:00:00Z')), '2026-11-23');
  assert.equal(
    professionalWeek('2027-01-03').join(','),
    '2026-12-28,2026-12-29,2026-12-30,2026-12-31,2027-01-01,2027-01-02,2027-01-03',
  );
});
const read = () =>
  load(path.resolve('src/composition/professional-dashboard-data.ts'))
    .readProfessionalDashboard;
function fixture(role = 'barber') {
  let current = true,
    filters;
  const queries = [],
    calls = [];
  const professional = {
    id: 'self',
    barbershopId: 'shop',
    professionalName: 'Profesional real',
    active: true,
  };
  const rows = [
    {
      id: 'late',
      barberId: 'self',
      barbershopId: 'shop',
      startsAt: '2026-11-23T16:00:00Z',
    },
    {
      id: 'foreign-barber',
      barberId: 'other',
      barbershopId: 'shop',
      startsAt: '2026-11-23T13:00:00Z',
    },
    {
      id: 'early',
      barberId: 'self',
      barbershopId: 'shop',
      startsAt: '2026-11-23T14:00:00Z',
    },
    {
      id: 'foreign-shop',
      barberId: 'self',
      barbershopId: 'other',
      startsAt: '2026-11-23T12:00:00Z',
    },
  ];
  const app = {
    ownSummary: {
      read: async (day) => ({
        professional,
        localDate: day,
        total: 2,
        completed: 1,
        scheduled: 1,
        inService: 0,
      }),
    },
    selfSchedule: {
      read: async () => ({
        professional,
        hours: [
          { weekday: 1, opensMin: 510, closesMin: 780 },
          { weekday: 1, opensMin: 855, closesMin: 1320 },
        ],
      }),
    },
    getScope: () => ({ role, barbershopId: 'shop' }),
    load: () => {
      throw Error('Administrative read is forbidden');
    },
  };
  const booking = {
    discovery: {
      openShop: async (id) => calls.push(id),
      getSnapshot: () => ({
        offerPhase: 'ready',
        offer: { barbershopId: 'shop', services: [], capabilities: [] },
      }),
    },
    agenda: {
      setFilters: (v) => {
        filters = v;
        queries.push(v);
      },
      load: async () => {},
      getSnapshot: () => ({ phase: 'ready', filters, rows }),
    },
    care: async (v) => {
      calls.push(v);
      throw Error('attendance unavailable');
    },
  };
  return {
    app,
    booking,
    day: '2026-11-23',
    weekly: false,
    shopId: 'shop',
    isCurrent: () => current,
    expire: () => {
      current = false;
    },
    queries,
    calls,
  };
}
test('dashboard loads real counts, filters own professional and tenant, sorts appointments and only reads care', async () => {
  const f = fixture();
  const data = await read()(f);
  assert.equal(data.summary.total, 2);
  assert.equal(data.rows.map((r) => r.id).join(','), 'early,late');
  assert.equal(f.queries[0].barberId, null);
  assert.equal(data.schedule.hours.length, 2);
  assert.equal(data.agendaReady, true);
  assert.equal(data.error, false);
  assert.equal(Object.keys(data.care).length, 0);
  assert.equal(
    f.calls.filter((c) => c.command).every((c) => c.command === 'read'),
    true,
  );
});
test('administrator professional view requests only own assignments for each day in weekly view', async () => {
  const f = fixture('administrator');
  f.weekly = true;
  await read()(f);
  assert.equal(f.queries.length, 7);
  assert.equal(
    f.queries.every((q) => q.barberId === 'self'),
    true,
  );
  assert.equal(
    f.queries.map((q) => q.localDate).join(','),
    professionalWeek(f.day).join(','),
  );
});
test('agenda-only mode reuses summary and own appointments without querying overview schedules or public catalog', async () => {
  const f = fixture();
  f.app.selfSchedule.read = async () => {
    throw Error('Unexpected schedule request');
  };
  f.booking.discovery.openShop = async () => {
    throw Error('Unexpected catalog request');
  };
  const data = await read()({ ...f, includeOverview: false });
  assert.equal(data.error, false);
  assert.equal(data.agendaReady, true);
  assert.equal(data.rows.length, 2);
  assert.equal(data.schedule, null);
  assert.equal(data.catalog, null);
});
test('late responses after context departure are ignored and do not continue querying agenda', async () => {
  const f = fixture();
  f.app.ownSummary.read = async () => {
    f.expire();
    return { professional: { id: 'old' } };
  };
  assert.equal(await read()(f), null);
  assert.equal(f.queries.length, 0);
});
test('attendance reads have bounded concurrency and preserve validated attendance without writes', async () => {
  const f = fixture();
  let active = 0,
    peak = 0;
  const rows = Array.from({ length: 9 }, (_, i) => ({
    id: `care-${i}`,
    barberId: 'self',
    barbershopId: 'shop',
    startsAt: `2026-11-23T${String(10 + i).padStart(2, '0')}:00:00Z`,
  }));
  f.booking.agenda.getSnapshot = () => ({
    phase: 'ready',
    filters: f.queries.at(-1),
    rows,
  });
  f.booking.care = async ({ command, reservationId }) => {
    assert.equal(command, 'read');
    peak = Math.max(peak, ++active);
    await new Promise((resolve) => setImmediate(resolve));
    active--;
    return {
      reservationId,
      attendance: 'completed',
      payment: null,
      noShowToleranceMin: null,
      yapeInstructions: null,
      events: [],
      permissions: { attend: false, receive: false, refund: false },
    };
  };
  const data = await read()(f);
  assert.equal(peak, 4);
  assert.equal(Object.keys(data.care).length, 9);
  assert.equal(data.care['care-0'].attendance, 'completed');
});
test('failed agenda and hidden public catalog stay unavailable instead of implying an empty valid schedule', async () => {
  const f = fixture();
  f.booking.agenda.getSnapshot = () => ({ phase: 'error', rows: [] });
  f.booking.discovery.getSnapshot = () => ({
    offerPhase: 'error',
    offer: null,
  });
  const data = await read()(f);
  assert.equal(data.agendaReady, false);
  assert.equal(data.error, true);
  assert.equal(data.catalog, null);
  assert.equal(data.summary.total, 2);
});

function ui(data, role = 'barber') {
  const states = [
    '2026-11-23',
    false,
    0,
    data && { key: 'scope:2026-11-23:false:0', data },
  ];
  let hook = 0;
  const setters = [],
    careProps = [];
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/composition/professional-dashboard.web.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  function TestCare(props) {
    careProps.push(props);
    return React.createElement('span', null, 'existing care actions');
  }
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) => {
      if (n === 'react')
        return {
          useEffect() {},
          useRef: (value) => ({ current: value }),
          useState: () => {
            const i = hook++;
            return [states[i], (value) => setters.push({ i, value })];
          },
        };
      if (n === 'expo-router')
        return { Link: (props) => React.createElement('a', props) };
      if (n.endsWith('/care-control')) return { CareControl: TestCare };
      if (n.endsWith('/cancellation-control'))
        return { CancellationControl: () => null };
      if (n.endsWith('/reschedule-control'))
        return { RescheduleControl: () => null };
      if (n.endsWith('/workspace-icon.web'))
        return { WorkspaceIcon: () => React.createElement('svg') };
      if (n.endsWith('/site-icon.web'))
        return { SiteIcon: () => React.createElement('svg') };
      if (n.endsWith('/professional-dashboard-data'))
        return { readProfessionalDashboard: async () => data };
      if (n.startsWith('.')) return load(path.resolve('src/composition', n));
      return require(n);
    },
    module,
    module.exports,
  );
  const tree = module.exports.ProfessionalDashboard({
    application: { scopeKey: () => 'scope', getScope: () => ({ role }) },
    booking: null,
    shopId: 'shop',
    shopName: 'Barbería real',
  });
  const html = renderToStaticMarkup(tree);
  const nodes = [];
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value?.props) {
      nodes.push(value);
      visit(value.props.children);
    }
  };
  visit(tree);
  return { html, nodes, setters, careProps };
}
test('dashboard renders real profile, split intervals, assigned services and destinations without fabricated activity', async () => {
  const data = await read()(fixture());
  data.catalog = {
    publicContact: 'Contacto real',
    services: [
      {
        id: 'assigned',
        name: 'Servicio real',
        durationMin: 40,
        active: true,
        price: { amountMinor: 1500 },
      },
      { id: 'other', name: 'Servicio ajeno', price: { amountMinor: 3000 } },
    ],
    capabilities: [{ barberId: 'self', serviceId: 'assigned' }],
  };
  data.rows = [];
  const { html, nodes, setters } = ui(data);
  for (const text of [
    'Profesional real',
    'Servicio real',
    'S/ 15.00',
    '08:30–13:00 / 14:15–22:00',
    'hora de Lima',
    'No hay citas disponibles',
  ])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /Servicio ajeno|Luis Mendoza|Carlos Rojas/);
  assert.match(html, /section=profile/);
  assert.match(html, /section=schedules/);
  assert.match(html, /view=shop&amp;shop=shop/);
  assert.doesNotMatch(html, /href="\/services"/);
  assert.match(ui(data, 'administrator').html, /href="\/services"/);
  nodes
    .find((n) => n.type === 'button' && n.props.children === 'Vista semanal')
    .props.onClick();
  assert.equal(setters.at(-1).i, 1);
  assert.equal(setters.at(-1).value, true);
  nodes
    .find(
      (n) => n.type === 'button' && n.props.children === 'Actualizar agenda',
    )
    .props.onClick();
  assert.equal(setters.at(-1).value(0), 1);
  nodes
    .find(
      (n) =>
        n.type === 'button' && n.props['aria-label'] === 'Semana siguiente',
    )
    .props.onClick();
  assert.equal(setters.at(-1).value, '2026-11-30');
});
test('loading, failed reads and verified empty appointments remain distinguishable in the UI', async () => {
  assert.match(ui(null).html, /Consultando tu actividad/);
  const data = await read()(fixture());
  data.rows = [];
  data.agendaReady = false;
  const html = ui(data).html;
  assert.match(html, /No se pudo consultar tu agenda/);
  assert.doesNotMatch(html, /No hay citas disponibles/);
});
test('appointment rows display customer, service, time and attendance while retaining existing care controls', async () => {
  const data = await read()(fixture());
  data.rows = [
    {
      id: 'real',
      startsAt: '2026-11-23T14:30:00Z',
      clientDisplayNameSnapshot: 'Cliente real',
      durationMin: 40,
      state: 'confirmed',
      items: [{ nameSnapshot: 'Corte real' }],
    },
  ];
  data.care.real = { reservationId: 'real', attendance: 'completed' };
  const { html, careProps, setters } = ui(data);
  for (const text of [
    'Cliente real',
    'Corte real',
    '09:30',
    'Completada',
    'bx-pro-badge--green',
    'existing care actions',
  ])
    assert.ok(html.includes(text), text);
  assert.equal(careProps[0].initialView, data.care.real);
  assert.equal(typeof careProps[0].renderActions, 'function');
  const next = { reservationId: 'real', attendance: 'in-service' };
  careProps[0].onUpdated(next, false);
  const update = setters.at(-1).value;
  const current = { key: 'scope:2026-11-23:false:0', data };
  assert.equal(update(current).data.care.real, next);
  const other = { key: 'another-scope', data };
  assert.equal(
    update(other),
    other,
    'late care update must not affect another context',
  );
  data.care.real.attendance = 'in-service';
  assert.match(ui(data).html, /bx-pro-badge--yellow/);
  data.rows[0].state = 'cancelled';
  assert.match(ui(data).html, /Cancelada/);
});

test('expanded reservation distinguishes pending cash from received payment, uses Lima and never invents unqueried states', () => {
  const { ProfessionalReservationDetail } = load(
    path.resolve('src/composition/professional-reservation-detail.web.tsx'),
  );
  const render = (view, operations = []) =>
    renderToStaticMarkup(
      React.createElement(ProfessionalReservationDetail, {
        detail: {
          ...detail,
          clientDisplayNameSnapshot: 'Cliente <real>',
          items: [
            ...detail.items,
            { ...detail.items[0], nameSnapshot: 'Segundo servicio' },
          ],
        },
        parts: {
          view,
          operations,
          busy: false,
          trigger: React.createElement(
            'button',
            null,
            'Consultar atención y pago',
          ),
        },
      }),
    );
  let html = render(null);
  const withoutCss = (value) => value.replace(/<style>[\s\S]*?<\/style>/g, '');
  assert.match(html, /Sin consultar/);
  assert.doesNotMatch(
    withoutCss(html),
    /Recibido|Estado de atención<\/span><strong[^>]*>Pendiente/,
  );
  const view = {
    attendance: 'confirmed',
    payment: { method: 'cash', status: 'pending', amountMinor: 2500 },
    events: [{ kind: 'created', occurredAt: '2026-11-18T02:15:42Z' }],
  };
  html = render(view);
  assert.match(html, /Cliente &lt;real&gt;/);
  assert.match(html, /Service \+ Segundo servicio/);
  assert.match(html, /10:00/);
  assert.match(html, /17\/11\/2026/);
  assert.match(html, /Efectivo/);
  assert.match(html, /Pendiente/);
  assert.doesNotMatch(withoutCss(html), /Recibido|created/);
  html = render({
    ...view,
    attendance: 'completed',
    payment: { ...view.payment, status: 'paid' },
  });
  assert.match(html, /Completada/);
  assert.match(html, /Recibido/);
});
