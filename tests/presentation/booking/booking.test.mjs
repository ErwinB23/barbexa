import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import {
  id,
  detail,
} from '../../integration/booking/booking-payload-fixture.mjs';
const require = createRequire(import.meta.url);
function fixture(platform) {
  const observed = [],
    cache = new Map();
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
    Platform: { OS: platform },
    StyleSheet: { create: (s) => s },
  };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync) ?? file;
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      Date: class extends Date {
        static now() {
          return Date.parse('2026-11-23T12:00:00Z');
        }
      },
    })(
      (n) =>
        n === 'react/jsx-runtime'
          ? Object.fromEntries(
              Object.entries(require(n)).map(([key, value]) => [
                key,
                ['jsx', 'jsxs'].includes(key)
                  ? (type, props, ...rest) => {
                      if (type === 'button')
                        observed.push({ kind: 'button', props });
                      if (type === 'article')
                        observed.push({ kind: 'article', props });
                      if (type?.name === 'BookingCalendar')
                        observed.push({ kind: 'calendar', props });
                      return value(type, props, ...rest);
                    }
                  : value,
              ]),
            )
          : n === 'react-native'
            ? rn
            : n === 'react-native-safe-area-context'
              ? { SafeAreaView: primitive('SafeAreaView') }
              : n.startsWith('.')
                ? load(path.resolve(path.dirname(file), n))
                : require(n),
      module,
      module.exports,
    );
    return module.exports;
  }
  const { BookingContent, BookingCard } = load(
    path.resolve('src/features/reservations/presentation/booking-screen.tsx'),
  );
  const { MyReservationsContent } = load(
    path.resolve(
      'src/features/reservations/presentation/my-reservations-screen.tsx',
    ),
  );
  const offer = {
    barbershopId: id(1),
    name: 'Local',
    publicationState: 'published',
    address: 'Local',
    publicContact: 'Fixture',
    policies: { bookingHorizonDays: 30 },
    services: [
      {
        id: id(2),
        name: 'Service',
        price: detail.total,
        durationMin: 30,
        active: true,
      },
    ],
    professionals: [
      { id: id(3), professionalName: 'Professional', active: true },
    ],
    capabilities: [{ serviceId: id(2), barberId: id(3) }],
  };
  const state = {
    phase: 'idle',
    shops: [offer],
    shopsQueried: true,
    hasMore: false,
    offer,
    serviceIds: [id(2)],
    barberId: null,
    date: '2026-11-18',
    startsAt: detail.startsAt,
    slots: [
      {
        startsAt: detail.startsAt,
        endsAt: detail.endsAt,
        estimatedTotal: detail.total,
      },
    ],
    slotsQueried: true,
    result: null,
    uncertain: false,
    error: null,
    own: [],
    ownPhase: 'ready',
    ownError: null,
  };
  const app = {
    confirm: async () => {},
    loadShops: async () => {},
    querySlots: async () => {},
    loadOwn: async () => {},
    chooseShop: async () => {},
    setServices() {},
    setProfessional() {},
    setDate() {},
    chooseSlot() {},
    startAnother() {},
  };
  const render = (Component, props) => {
    observed.length = 0;
    return renderToStaticMarkup(React.createElement(Component, props));
  };
  return {
    load,
    BookingContent,
    BookingCard,
    MyReservationsContent,
    state,
    app,
    observed,
    render,
  };
}
for (const [name, patch, expected] of [
  ['missing payment', {}, true],
  ['cash selected', { paymentMethod: 'cash' }, false],
  ['yape selected', { paymentMethod: 'yape' }, false],
  ['submission pending', { paymentMethod: 'cash', phase: 'confirming' }, true],
  ['uncertain response retry', { uncertain: true }, false],
  [
    'recoverable error with payment',
    { paymentMethod: 'cash', error: { code: 'DEPENDENCY_UNAVAILABLE' } },
    false,
  ],
])
  test(`Web confirmation availability: ${name}`, () => {
    const f = fixture('web');
    f.render(f.BookingContent, {
      state: { ...f.state, ...patch },
      application: f.app,
      careEnabled: true,
      onOwn() {},
    });
    const button = f.observed.find(
      (x) =>
        x.kind === 'Pressable' &&
        ['Confirmar reserva', 'Reintentar la misma confirmación'].includes(
          x.props.accessibilityLabel,
        ),
    );
    assert.equal(button.props.disabled, expected);
  });

test('Web service cards preserve multiple selection, real totals and existing professional/slot handlers', () => {
  const f = fixture('web');
  const service = {
    ...f.state.offer.services[0],
    id: id(20),
    name: 'Segundo servicio',
    durationMin: 15,
    price: { amountMinor: 1000, currency: 'PEN' },
  };
  const state = {
    ...f.state,
    offer: { ...f.state.offer, services: [...f.state.offer.services, service] },
    serviceIds: [id(2), id(20)],
    startsAt: null,
  };
  let ids, professional, slot;
  f.app.setServices = (value) => {
    ids = value;
  };
  f.app.setProfessional = (value) => {
    professional = value;
  };
  f.app.chooseSlot = (value) => {
    slot = value;
  };
  const html = f.render(f.BookingContent, {
    state,
    application: f.app,
    onOwn() {},
  });
  assert.ok(html.includes('Service + Segundo servicio'));
  assert.ok(html.includes('45 min'));
  assert.ok(
    html.includes(
      new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      }).format((f.state.offer.services[0].price.amountMinor + 1000) / 100),
    ),
  );
  const cards = f.observed.filter(
    (o) => o.kind === 'button' && o.props.className === 'bx-book-service',
  );
  cards[1].props.onClick();
  assert.equal(JSON.stringify(ids), JSON.stringify([id(2)]));
  assert.equal(
    professional,
    undefined,
    'service handler delegates compatibility to the application instead of clearing the professional',
  );
  const addState = { ...state, serviceIds: [id(2)] };
  f.render(f.BookingContent, {
    state: addState,
    application: f.app,
    onOwn() {},
  });
  f.observed
    .filter(
      (o) => o.kind === 'button' && o.props.className === 'bx-book-service',
    )[1]
    .props.onClick();
  assert.equal(JSON.stringify(ids), JSON.stringify([id(2), id(20)]));
  f.observed
    .find(
      (o) =>
        o.kind === 'button' && o.props['aria-label']?.includes('hora Lima'),
    )
    .props.onClick();
  assert.equal(slot, f.state.slots[0].startsAt);
  // Hidden/inactive services are never offered.
  const hidden = f.render(f.BookingContent, {
    state: {
      ...state,
      offer: { ...state.offer, services: [{ ...service, active: false }] },
    },
    application: f.app,
    onOwn() {},
  });
  assert.ok(hidden.includes('No hay servicios activos'));
});

test('Web date selection queries real slots after updating criteria and offers a local query button', () => {
  const f = fixture('web'),
    calls = [];
  f.app.setDate = (value) => calls.push(['date', value]);
  f.app.querySlots = () => calls.push(['query']);
  const render = (patch) =>
    f.render(f.BookingContent, {
      state: {
        ...f.state,
        startsAt: null,
        slots: [],
        slotsQueried: false,
        ...patch,
      },
      application: f.app,
      onOwn() {},
    });
  render({});
  assert.equal(
    f.observed.filter(
      (o) =>
        o.kind === 'Pressable' &&
        o.props.accessibilityLabel === 'Consultar horarios',
    ).length,
    1,
  );
  f.observed.find((o) => o.kind === 'calendar').props.onChange('2026-11-25');
  assert.equal(
    JSON.stringify(calls),
    JSON.stringify([['date', '2026-11-25'], ['query']]),
  );
  calls.length = 0;
  render({ serviceIds: [] });
  f.observed.find((o) => o.kind === 'calendar').props.onChange('2026-11-25');
  assert.equal(calls.length, 1);
  assert.ok(
    f.observed
      .filter(
        (o) =>
          o.kind === 'Pressable' &&
          o.props.accessibilityLabel === 'Consultar horarios',
      )
      .every((o) => o.props.disabled),
  );
});

test('Web slots are separated into morning and afternoon by Lima time, with one query action', () => {
  const f = fixture('web');
  const html = f.render(f.BookingContent, {
    state: {
      ...f.state,
      startsAt: null,
      slots: [
        { startsAt: '2026-11-23T17:00:00Z', endsAt: '2026-11-23T17:40:00Z' },
        { startsAt: '2026-11-23T16:45:00Z', endsAt: '2026-11-23T17:25:00Z' },
        { startsAt: '2026-11-24T02:00:00Z', endsAt: '2026-11-24T02:40:00Z' },
      ],
    },
    application: f.app,
    onOwn() {},
  });
  assert.match(html, /Mañana/);
  assert.match(html, /Tarde/);
  const morning = html.slice(
    html.indexOf('aria-label="Mañana"'),
    html.indexOf('aria-label="Tarde"'),
  );
  assert.match(morning, /11:45/);
  assert.ok(!morning.includes('aria-label="12:00'));
  const afternoon = html.slice(html.indexOf('aria-label="Tarde"'));
  assert.match(afternoon, /12:00/);
  assert.match(afternoon, /21:00/);
  assert.ok(afternoon.indexOf('12:00') < afternoon.indexOf('21:00'));
  assert.equal(
    f.observed.filter(
      (o) =>
        o.kind === 'Pressable' &&
        o.props.accessibilityLabel === 'Consultar horarios',
    ).length,
    1,
  );
});

test('Web own reservations sort newest appointment first across states without mutating the snapshot', () => {
  const f = fixture('web');
  const own = Object.freeze([
    {
      ...detail,
      id: id(41),
      shopNameSnapshot: 'CANCELADA',
      state: 'cancelled',
      startsAt: '2026-11-23T21:00:00Z',
    },
    {
      ...detail,
      id: id(42),
      shopNameSnapshot: 'CONFIRMADA TARDE',
      startsAt: '2026-11-24T15:00:00Z',
    },
    {
      ...detail,
      id: id(43),
      shopNameSnapshot: 'CONFIRMADA TEMPRANO',
      startsAt: '2026-11-23T14:30:00-05:00',
    },
    {
      ...detail,
      id: id(44),
      shopNameSnapshot: 'CONFIRMADA MEDIA',
      startsAt: '2026-11-23T20:00:00Z',
    },
  ]);
  const html = f.render(f.MyReservationsContent, {
    state: { ...f.state, own },
    application: f.app,
    onBook() {},
  });
  const names = [
    'CONFIRMADA TARDE',
    'CANCELADA',
    'CONFIRMADA MEDIA',
    'CONFIRMADA TEMPRANO',
  ];
  assert.ok(
    names.every(
      (name, i) => i === 0 || html.indexOf(names[i - 1]) < html.indexOf(name),
    ),
  );
  assert.equal(own[0].shopNameSnapshot, 'CANCELADA');
});

test('Web redesigned history selection updates real detail without commands and distinguishes completed attendance', () => {
  const f = fixture('web');
  const { MyReservationsWebContent } = f.load(
    path.resolve(
      'src/features/reservations/presentation/my-reservations.web.tsx',
    ),
  );
  const later = {
    ...detail,
    id: id(90),
    shopNameSnapshot: 'CITA SIGUIENTE',
    startsAt: '2026-11-25T14:00:00Z',
  };
  const completed = {
    ...detail,
    id: id(91),
    shopNameSnapshot: 'CITA ATENDIDA',
    startsAt: '2026-11-18T14:00:00Z',
  };
  let selected;
  const props = {
    state: { ...f.state, own: [completed, later] },
    application: f.app,
    onBook() {},
    care: {
      [completed.id]: { attendance: 'completed' },
      [later.id]: { attendance: 'confirmed' },
    },
    careReady: true,
    now: Date.parse('2026-11-22T00:00:00Z'),
    selectedId: null,
    onSelect: (id) => {
      selected = id;
    },
  };
  const html = f.render(MyReservationsWebContent, props);
  assert.match(html, /Cita atendida/);
  assert.match(html, /Copiar código de reserva/);
  const card = f.observed.find(
    (o) => o.kind === 'button' && o.props.className === 'bx-own-history-card',
  );
  card.props.onClick();
  assert.equal(selected, completed.id);
  const updated = f.render(MyReservationsWebContent, {
    ...props,
    selectedId: selected,
  });
  const detailPanel = updated.slice(updated.indexOf('Detalle de la cita'));
  assert.match(detailPanel, /CITA ATENDIDA/);
  assert.match(detailPanel, new RegExp(completed.id));
  assert.doesNotMatch(detailPanel, /CITA SIGUIENTE/);
});

test('selecting history never replaces upcoming actions with a detail button; clicking the upcoming card only selects it', () => {
  const f = fixture('web');
  const { MyReservationsWebContent } = f.load(
    path.resolve(
      'src/features/reservations/presentation/my-reservations.web.tsx',
    ),
  );
  const { BookingContext } = f.load(
    path.resolve('src/features/reservations/presentation/booking-context.tsx'),
  );
  const next = { ...detail, startsAt: '2099-01-01T15:00:00.000Z' };
  const past = { ...detail, id: id(99), state: 'cancelled' };
  const view = {
    reservationId: next.id,
    attendance: 'confirmed',
    payment: null,
    events: [],
    permissions: { attend: false, receive: false, refund: false },
  };
  let selected,
    mutations = 0;
  const app = {
    ...f.app,
    care: async () => {
      mutations++;
    },
    reschedule: {},
    cancellationRequestId() {
      mutations++;
    },
    cancelReservation() {
      mutations++;
    },
  };
  const props = {
    state: { ...f.state, own: [next, past] },
    application: app,
    care: { [next.id]: view },
    careReady: true,
    now: 0,
    selectedId: past.id,
    onSelect: (id) => {
      selected = id;
    },
    onBook() {},
  };
  const html = f.render(
    ({ children }) =>
      React.createElement(BookingContext.Provider, { value: app }, children),
    { children: React.createElement(MyReservationsWebContent, props) },
  );
  assert.doesNotMatch(html, /Ver detalle y acciones/);
  for (const label of [
    'Consultar atención y pago',
    'Reprogramar cita',
    'Cancelar cita',
  ])
    assert.ok(
      f.observed.some(
        (o) => o.kind === 'Pressable' && o.props.accessibilityLabel === label,
      ),
    );
  // Exercise the card's selection handler without executing any command.
  f.observed
    .find(
      (o) => o.kind === 'article' && o.props.className === 'bx-own-featured',
    )
    .props.onClick();
  assert.equal(selected, next.id);
  assert.equal(mutations, 0);
});

for (const platform of ['web', 'android']) {
  test(
    platform +
      ' booking has accessible choices date and one disabled confirmation during submit',
    () => {
      const f = fixture(platform);
      const html = f.render(f.BookingContent, {
        state: { ...f.state, phase: 'confirming' },
        application: f.app,
        onOwn() {},
      });
      const submit = f.observed.find(
        (o) =>
          o.kind === 'Pressable' &&
          o.props.accessibilityLabel === 'Confirmar reserva',
      );
      assert.equal(submit.props.accessibilityRole, 'button');
      assert.equal(submit.props.disabled, true);
      if (platform === 'web') {
        assert.match(html, /Fecha de la cita/);
        assert.ok(
          f.observed
            .filter((o) => o.kind === 'button')
            .every((o) => o.props.disabled),
        );
      } else {
        const date = f.observed.find((o) => o.kind === 'TextInput');
        assert.equal(date.props.accessibilityLabel, 'Fecha (AAAA-MM-DD)');
        assert.equal(date.props.editable, false);
      }
    },
  );
  test(
    platform +
      ' unavailable slots show empty only after a completed query and conflict exposes no SQL',
    () => {
      const f = fixture(platform);
      let html = f.render(f.BookingContent, {
        state: {
          ...f.state,
          slots: [],
          slotsQueried: false,
          phase: 'loading-slots',
        },
        application: f.app,
        onOwn() {},
      });
      assert.ok(!html.includes('No hay horarios disponibles'));
      html = f.render(f.BookingContent, {
        state: {
          ...f.state,
          slots: [],
          startsAt: null,
          error: { code: 'CONFLICT', professionalUnavailable: true },
        },
        application: f.app,
        onOwn() {},
      });
      assert.ok(html.includes('No hay horarios disponibles'));
      assert.ok(html.includes('Profesional no disponible en ese horario'));
      assert.ok(!html.includes('23505'));
    },
  );
  test(
    platform +
      ' timeout freezes draft and retry uses the application rather than a new request',
    () => {
      const f = fixture(platform);
      let retries = 0;
      f.app.confirm = async () => {
        retries++;
      };
      f.render(f.BookingContent, {
        state: {
          ...f.state,
          uncertain: true,
          error: {
            code: 'DEPENDENCY_UNAVAILABLE',
            professionalUnavailable: false,
          },
        },
        application: f.app,
        onOwn() {},
      });
      const retry = f.observed.find(
        (o) =>
          o.kind === 'Pressable' &&
          o.props.accessibilityLabel === 'Reintentar la misma confirmación',
      );
      assert.equal(retry.props.disabled, false);
      retry.props.onPress();
      assert.equal(retries, 1);
      if (platform === 'web')
        assert.ok(
          f.observed
            .filter((o) => o.kind === 'button')
            .every((o) => o.props.disabled),
        );
      else
        assert.equal(
          f.observed.find((o) => o.kind === 'TextInput').props.editable,
          false,
        );
    },
  );
  test(
    platform +
      ' own detail shows server snapshots and safely renders text without HTML execution',
    () => {
      const f = fixture(platform);
      const html = f.render(f.MyReservationsContent, {
        state: {
          ...f.state,
          own: [{ ...detail, shopNameSnapshot: '<script>fixture</script>' }],
        },
        application: f.app,
        onBook() {},
      });
      assert.ok(html.includes('Cita confirmada'));
      assert.equal(html.includes('hora de Lima'), platform !== 'web');
      assert.ok(html.includes('120 minutos'));
      assert.ok(!html.includes('<script>'));
      assert.ok(html.includes('&lt;script&gt;'));
    },
  );
  test(
    platform +
      ' zero own bookings and published pause are explicit valid states',
    () => {
      const f = fixture(platform);
      const own = f.render(f.MyReservationsContent, {
        state: f.state,
        application: f.app,
        onBook() {},
      });
      assert.ok(own.includes('Todavía no tienes reservas'));
      const html = f.render(f.BookingContent, {
        state: {
          ...f.state,
          offer: { ...f.state.offer, publicationState: 'paused' },
          startsAt: null,
        },
        application: f.app,
        onOwn() {},
      });
      assert.ok(html.includes('no acepta citas nuevas'));
      const query = f.observed.find(
        (o) =>
          o.kind === 'Pressable' &&
          o.props.accessibilityLabel === 'Consultar horarios',
      );
      assert.equal(query.props.disabled, true);
    },
  );
}

for (const platform of ['web', 'android'])
  test(
    platform +
      ' care consult uses existing authenticated application; initial render makes no financial claim or mutation',
    async () => {
      const f = fixture(platform),
        { CareControl } = f.load(
          path.resolve(
            'src/features/reservations/presentation/care-control.tsx',
          ),
        ),
        { BookingContext } = f.load(
          path.resolve(
            'src/features/reservations/presentation/booking-context.tsx',
          ),
        );
      const calls = [];
      const app = {
        care: async (input) => {
          calls.push(input);
          return {
            reservationId: id(1),
            attendance: null,
            payment: null,
            noShowToleranceMin: null,
            yapeInstructions: null,
            events: [],
            permissions: { attend: false, receive: false, refund: false },
          };
        },
      };
      const html = f.render(BookingContext.Provider, {
        value: app,
        children: React.createElement(CareControl, { reservationId: id(1) }),
      });
      assert.ok(html.includes('Consultar atención y pago'));
      assert.ok(!html.includes('Pago recibido'));
      assert.equal(calls.length, 0);
      const read = f.observed.find(
        (x) =>
          x.kind === 'Pressable' &&
          x.props.accessibilityLabel === 'Consultar atención y pago',
      );
      read.props.onPress();
      await new Promise((r) => setImmediate(r));
      assert.equal(calls.length, 1);
      assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), {
        command: 'read',
        reservationId: id(1),
      });
    },
  );

test('premium confirmation uses actual snapshots, all services and policy; actions keep the created reservation ID', () => {
  const f = fixture('web');
  let own = 0,
    another = 0;
  const html = f.render(f.BookingContent, {
    state: {
      ...f.state,
      result: {
        detail: {
          ...detail,
          shopNameSnapshot: 'Mi local real',
          policySnapshot: {
            ...detail.policySnapshot,
            cancellationAdvanceMin: 75,
          },
          items: [
            ...detail.items,
            {
              ...detail.items[0],
              serviceId: id(29),
              nameSnapshot: 'Barba adicional',
              descriptionSnapshot: 'Detalle real',
            },
          ],
        },
        replayed: false,
      },
    },
    application: f.app,
    onOwn: () => own++,
    onAnother: () => another++,
  });
  assert.match(html, /¡Reserva confirmada!/);
  assert.match(html, /Mi local real/);
  assert.match(html, /Barba adicional/);
  assert.match(html, /Detalle real/);
  assert.match(html, /75 minutos/);
  assert.match(html, new RegExp(detail.id));
  assert.doesNotMatch(
    html,
    /Confirmación enviada|Te notificamos|Reservar una cita<|120 minutos/,
  );
  f.observed
    .find(
      (x) =>
        x.kind === 'Pressable' && x.props.accessibilityLabel === 'Mis reservas',
    )
    .props.onPress();
  f.observed
    .find(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Ir a mis reservas',
    )
    .props.onPress();
  f.observed
    .find(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Reservar otra cita',
    )
    .props.onPress();
  assert.equal(own, 2);
  assert.equal(another, 1);
});

test('customer badges distinguish confirmed, completed, no-show, in-service and cancelled states', () => {
  for (const [attendance, state, tone, label] of [
    ['confirmed', 'confirmed', 'confirmed', 'Cita confirmada'],
    ['completed', 'confirmed', 'completed', 'Cita atendida'],
    ['no-show', 'confirmed', 'no-show', 'No asistió'],
    ['in-service', 'confirmed', 'in-service', 'En atención'],
    ['completed', 'cancelled', 'cancelled', 'Cita cancelada'],
  ]) {
    const f = fixture('web');
    const { MyReservationsWebContent } = f.load(
      path.resolve(
        'src/features/reservations/presentation/my-reservations.web.tsx',
      ),
    );
    const html = f.render(MyReservationsWebContent, {
      state: { ...f.state, own: [{ ...detail, state }] },
      application: f.app,
      onBook() {},
      care: { [detail.id]: { attendance } },
      careReady: true,
      now: Date.parse('2030-01-01T00:00:00Z'),
      selectedId: detail.id,
      onSelect() {},
    });
    assert.ok(
      html.includes(
        `class="bx-own-badge bx-own-badge--${tone}">${label}</span>`,
      ),
    );
  }
});
