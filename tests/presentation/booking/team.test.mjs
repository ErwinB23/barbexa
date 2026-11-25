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
function fixture(platform, file, component, overrides = {}) {
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
      Intl,
      Date,
    })(
      (n) =>
        overrides[n] ??
        (n === 'react/jsx-runtime'
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
              : require(n)),
      m,
      m.exports,
    );
    return m.exports;
  }
  const exports = load(path.resolve(file));
  return {
    controls,
    render(props) {
      controls.length = 0;
      return renderToStaticMarkup(
        React.createElement(exports[component], props),
      );
    },
  };
}
const id = '11111111-1111-4111-8111-111111111111';
const invitation = {
  id,
  barbershopId: id,
  barbershopName: 'Local',
  recipientName: 'Ficticio',
  role: 'administrator',
  status: 'pending',
  createdAt: '2026-11-15T12:00:00.000Z',
  expiresAt: '2026-11-22T12:00:00.000Z',
  deliveryStatus: 'unknown',
};
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' admin invitations require explicit acceptance and never offer expired or unauthorized actions',
    () => {
      const f = fixture(
        platform,
        'src/features/barbershop-operation/presentation/admin-invitations.tsx',
        'AdminInvitationContent',
      );
      const internalHtml = f.render({
        inApp: true,
        admin: true,
        mode: 'outgoing',
        email: '',
        rows: [{ ...invitation, deliveryStatus: 'failed' }],
        busy: false,
        uncertain: false,
      });
      assert.match(internalHtml, /Disponible en BARBEXA/);
      assert.doesNotMatch(
        internalHtml,
        /Reintentar aviso por correo|Aviso por correo/,
      );
      let accepts = 0;
      const props = {
        admin: false,
        email: '',
        mode: 'incoming',
        rows: null,
        busy: false,
        uncertain: false,
        error: null,
        message: null,
        onEmail() {},
        onMode() {},
        onLoad() {},
        onInvite() {},
        onRespond() {
          accepts++;
        },
        onCancel() {},
        onRetry() {},
      };
      assert.ok(!f.render(props).includes('No hay invitaciones'));
      f.render({ ...props, rows: [invitation] });
      assert.equal(f.controls.filter((c) => c.kind === 'TextInput').length, 0);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Aceptar administración')
        .props.onPress();
      assert.equal(accepts, 1);
      f.render({ ...props, rows: [{ ...invitation, status: 'expired' }] });
      assert.ok(
        !f.controls.some(
          (c) => c.props.accessibilityLabel === 'Aceptar administración',
        ),
      );
      f.render({ ...props, admin: true, rows: [invitation], busy: true });
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
      f.render({ ...props, admin: true, mode: 'outgoing', rows: [invitation] });
      assert.ok(
        !f.controls.some(
          (c) => c.props.accessibilityLabel === 'Reintentar aviso por correo',
        ),
      );
    },
  );
  test(
    platform +
      ' own summary separates initial/empty state, real legacy counters and errors without financial guesses',
    () => {
      const f = fixture(
        platform,
        'src/features/barbershop-operation/presentation/own-summary.tsx',
        'OwnSummaryContent',
      );
      const props = {
        date: '2026-11-16',
        view: null,
        busy: false,
        error: null,
        onDate() {},
        onRead() {},
      };
      assert.ok(!f.render(props).includes('Sin actividad'));
      const view = {
        professional: { professionalName: 'Own' },
        localDate: '2026-11-16',
        total: 2,
        scheduled: 1,
        inService: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        unrecorded: 1,
        upcoming: 1,
        nextStartsAt: '2026-11-16T15:00:00.000Z',
      };
      const text = f.render({ ...props, view });
      assert.ok(text.includes('Sin estado de atención registrado: 1'));
      assert.ok(!text.includes('Ingresos'));
      assert.ok(
        f
          .render({
            ...props,
            view: {
              ...view,
              total: 0,
              scheduled: 0,
              unrecorded: 0,
              upcoming: 0,
              nextStartsAt: null,
            },
          })
          .includes('Sin actividad'),
      );
      f.render({ ...props, busy: true });
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
    },
  );
}

test('received invitations distinguish load/error/empty, sort real dates and only allow responses for pending records', () => {
  const f = fixture(
    'web',
    'src/features/barbershop-operation/presentation/received-invitations.web.tsx',
    'ReceivedInvitationsWeb',
  );
  const responses = [];
  const props = {
    kind: 'administrator',
    rows: null,
    busy: true,
    onLoad() {},
    onRespond: (...args) => responses.push(args),
  };
  let html = f.render(props);
  assert.match(html, /Consultando tus invitaciones/);
  assert.doesNotMatch(html, /No tienes invitaciones/);
  html = f.render({ ...props, busy: false, error: 'Sin conexión' });
  assert.match(html, /volver a consultar/);
  assert.doesNotMatch(html, /No tienes invitaciones/);
  const rows = [
    {
      ...invitation,
      id: 'pending-real',
      barbershopName: 'Nueva <barbería>',
      createdAt: '2026-11-24T01:00:00Z',
    },
    {
      ...invitation,
      id: 'expired-real',
      status: 'expired',
      barbershopName: 'Anterior',
      createdAt: '2026-11-22T12:00:00Z',
    },
  ];
  html = f.render({ ...props, busy: false, rows });
  assert.ok(html.indexOf('Nueva &lt;barbería&gt;') < html.indexOf('Anterior'));
  assert.equal((html.match(/>Aceptar invitación</g) ?? []).length, 1);
  f.controls
    .find(
      (c) => c.kind === 'button' && c.props.children === 'Aceptar invitación',
    )
    .props.onClick();
  assert.deepEqual(responses, [['pending-real', 'accept']]);
  f.controls
    .find((c) => c.kind === 'button' && c.props.children === 'Rechazar')
    .props.onClick();
  assert.deepEqual(responses.at(-1), ['pending-real', 'reject']);
  assert.doesNotMatch(
    html,
    /Invitar como|administradores secundarios; el límite/,
  );
  f.render({ ...props, busy: true, rows });
  assert.ok(
    f.controls
      .filter((c) => c.kind === 'button')
      .every((c) => c.props.disabled),
  );
  html = f.render({ ...props, kind: 'barber', busy: false, rows: [] });
  assert.match(html, /No tienes invitaciones de barbero/);
  assert.doesNotMatch(html, /caducan a los 7 días/);
});

test('incoming admin panel automatically reads only own invitations once and skips a cancelled mount', async () => {
  for (const cancel of [false, true]) {
    const effects = [];
    let reads = 0;
    const f = fixture(
      'web',
      'src/features/barbershop-operation/presentation/admin-invitations.tsx',
      'AdminInvitationsPanel',
      {
        react: {
          ...React,
          useState: (v) => [v, () => {}],
          useRef: (v) => ({ current: v }),
          useCallback: (f) => f,
          useEffect: (f) => effects.push(f),
        },
      },
    );
    f.render({
      audience: 'incoming',
      application: {
        scopeKey: () => 'same-user',
        getScope: () => ({ role: 'administrator', barbershopId: id }),
        delivery: 'in-app',
        loadOwn: async () => {
          reads++;
          return [];
        },
        loadOutgoing: async () => {
          assert.fail('must not query outgoing invitations');
        },
        invite: async () => {
          assert.fail('must not send invitations');
        },
      },
    });
    const cleanup = effects[0]();
    if (cancel) cleanup();
    else effects[0]();
    await new Promise((r) => setImmediate(r));
    assert.equal(reads, cancel ? 0 : 1);
  }
});

test('unified inbox filters real roles and statuses, keeps expired read-only and opens the actual response handler', () => {
  let filter = 'all',
    refreshes = 0;
  const responses = [];
  const f = fixture(
    'web',
    'src/features/barbershop-operation/presentation/invitations-inbox.web.tsx',
    'InvitationsInboxWeb',
    {
      react: {
        ...React,
        useState: () => [
          filter,
          (value) => {
            filter = value;
          },
        ],
      },
    },
  );
  const props = {
    state: {
      administrator: [
        {
          ...invitation,
          kind: 'administrator',
          id: 'admin',
          barbershopName: 'Admin real',
          status: 'expired',
        },
      ],
      barber: [
        {
          id: 'barber',
          kind: 'barber',
          barbershopName: 'Barbero real',
          status: 'pending',
        },
      ],
      busy: false,
      errors: [],
      message: '',
    },
    onRefresh() {
      refreshes++;
    },
    onRespond: (...args) => responses.push(args),
  };
  let html = f.render(props);
  assert.match(html, /Tienes 2 invitaciones/);
  assert.match(html, /Admin real/);
  assert.match(html, /Barbero real/);
  assert.match(html, /No disponible/);
  f.controls
    .find(
      (c) =>
        c.kind === 'button' &&
        Array.isArray(c.props.children) &&
        c.props.children.includes('Actualizar invitaciones'),
    )
    .props.onClick();
  assert.equal(refreshes, 1);
  assert.equal((html.match(/Aceptar invitación<\/button>/g) ?? []).length, 1);
  f.controls
    .find(
      (c) =>
        c.kind === 'button' &&
        Array.isArray(c.props.children) &&
        c.props.children.includes('Aceptar invitación'),
    )
    .props.onClick();
  assert.equal(responses[0][0].id, 'barber');
  assert.equal(responses[0][1], 'accept');
  f.controls
    .find(
      (c) =>
        c.kind === 'button' &&
        Array.isArray(c.props.children) &&
        c.props.children.includes('Aceptadas'),
    )
    .props.onClick();
  html = f.render(props);
  assert.match(html, /No hay invitaciones para este filtro/);
  assert.doesNotMatch(html, /Barbero real/);
  f.controls
    .find(
      (c) =>
        c.kind === 'button' &&
        Array.isArray(c.props.children) &&
        c.props.children.some(
          (child) =>
            typeof child === 'string' &&
            child.trim() === 'Ver historial completo',
        ),
    )
    .props.onClick();
  assert.equal(filter, 'all');
  html = f.render(props);
  assert.match(html, /Admin real/);
  assert.match(html, /Barbero real/);
  assert.doesNotMatch(html, /Historial · Ver todas/);
  f.render({ ...props, state: { ...props.state, responseUnverified: true } });
  assert.ok(
    f.controls
      .filter(
        (c) =>
          c.kind === 'button' &&
          (c.props.className === 'bx-ii-primary' ||
            c.props.children === 'Rechazar'),
      )
      .every((c) => c.props.disabled),
  );
  html = f.render({
    ...props,
    state: { ...props.state, administrator: null, barber: null, busy: true },
  });
  assert.match(html, /Cargando invitaciones/);
  assert.doesNotMatch(html, /Todavía no tienes invitaciones/);
});

test('unified inbox controller reads both own sources, guards double responses and drops data after unmount', async () => {
  let state,
    refIndex = 0,
    responses = 0,
    adminReads = 0,
    barberReads = 0;
  const refs = [],
    effects = [];
  const react = {
    ...React,
    useState: (initial) =>
      typeof initial === 'string'
        ? ['all', () => {}]
        : [
            (state ??= initial),
            (value) => {
              state = typeof value === 'function' ? value(state) : value;
            },
          ],
    useRef: (initial) => (refs[refIndex++] ??= { current: initial }),
    useCallback: (fn) => fn,
    useEffect: (fn) => effects.push(fn),
  };
  let current = { ...invitation };
  const app = {
    scopeKey: () => 'actor:context',
    listOwnInvitations: async () => {
      barberReads++;
      return [];
    },
    respondInvitation: async () => assert.fail('wrong role handler'),
    adminInvitations: {
      loadOwn: async () => {
        adminReads++;
        return [current];
      },
      respond: async (id, decision) => {
        responses++;
        assert.equal(id, invitation.id);
        assert.equal(decision, 'accept');
        await new Promise((r) => setImmediate(r));
        current = { ...current, status: 'accepted' };
        return current;
      },
    },
  };
  const f = fixture(
    'web',
    'src/composition/received-invitations-page.web.tsx',
    'ReceivedInvitationsPage',
    { react },
  );
  f.render({ application: app });
  const cleanup = effects[0]();
  await new Promise((r) => setImmediate(r));
  assert.equal(adminReads, 1);
  assert.equal(barberReads, 1);
  assert.equal(state.busy, false);
  refIndex = 0;
  f.render({ application: app });
  const button = f.controls.find(
    (c) =>
      c.kind === 'button' &&
      Array.isArray(c.props.children) &&
      c.props.children.includes('Aceptar invitación'),
  );
  button.props.onClick();
  button.props.onClick();
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.equal(responses, 1);
  assert.equal(state.administrator[0].status, 'accepted');
  assert.match(state.message, /aceptada/);
  cleanup();
  const snapshot = state;
  refIndex = 0;
  f.render({ application: app });
  f.controls
    .find(
      (c) =>
        c.kind === 'button' &&
        Array.isArray(c.props.children) &&
        c.props.children.includes('Actualizar invitaciones'),
    )
    .props.onClick();
  await new Promise((r) => setImmediate(r));
  assert.equal(state, snapshot);
  assert.equal(adminReads, 2);
});
