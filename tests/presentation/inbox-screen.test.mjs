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
const actions = [];
const disclosures = [];
const nativeButtons = [];
function load(file, overrides = {}) {
  if (!fs.existsSync(file))
    file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
  const m = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
    (name) => {
      if (name in overrides) return overrides[name];
      if (name === 'react/jsx-runtime')
        return Object.fromEntries(
          Object.entries(require(name)).map(([key, value]) => [
            key,
            ['jsx', 'jsxs'].includes(key)
              ? (type, props, ...rest) => {
                  if (type === 'details') disclosures.push(props);
                  if (type === 'button') nativeButtons.push(props);
                  return value(type, props, ...rest);
                }
              : value,
          ]),
        );
      if (name === 'expo-router')
        return {
          Link: ({ href, children, ...p }) =>
            React.createElement('a', { href, ...p }, children),
        };
      if (name.endsWith('inbox-context')) return {};
      if (name.endsWith('app-button'))
        return {
          AppButton: (p) => {
            actions.push(p);
            return React.createElement(
              'button',
              { disabled: p.disabled },
              p.label,
            );
          },
        };
      return name.startsWith('.')
        ? load(path.resolve(path.dirname(file), name), overrides)
        : require(name);
    },
    m,
    m.exports,
  );
  return m.exports;
}
const rows = [
  {
    id: '1',
    title: 'Reserva confirmada',
    message: 'Nombre real · 23/11/2026 14:30 · hora de Lima',
    target: '/my-reservations',
    createdAt: '2026-11-22T12:00:00Z',
    readAt: null,
  },
  {
    id: '2',
    title: 'Invitación aceptada',
    message: 'Otra barbería · Tu invitación fue aceptada.',
    target: '/agenda',
    createdAt: '2026-11-21T12:00:00Z',
    readAt: '2026-11-22T12:00:00Z',
  },
];
test('notification presentation filters real items and keeps valid actions without fictional metadata', () => {
  const { InboxContent } = load(
    path.resolve(
      'src/features/notifications/presentation/inbox-screen.web.tsx',
    ),
  );
  const marked = [];
  const props = {
    state: { phase: 'ready', items: rows, unread: 1, busy: false },
    filter: 'all',
    onFilter() {},
    onRefresh() {},
    onRead: (id) => marked.push(id),
  };
  const render = (p) => {
    actions.length = 0;
    disclosures.length = 0;
    return renderToStaticMarkup(React.createElement(InboxContent, p));
  };
  const all = render(props);
  assert.equal(
    (all.match(/<details class="bx-inbox-disclosure"/g) || []).length,
    2,
  );
  assert.equal((all.match(/<summary/g) || []).length, 2);
  assert.doesNotMatch(all, /<details[^>]* open/);
  assert.match(all, /Detalle de la notificación/);
  assert.match(all, /Fecha de la cita/);
  assert.doesNotMatch(all, /[Hh]ora de Lima/);
  assert.match(all, /14:30/);
  assert.match(all, /23\/11\/2026/);
  assert.doesNotMatch(all, /Descartar|Duración estimada|Dirección:/);
  assert.match(all, /Tus notificaciones \(2\)/);
  assert.match(all, /Sobre tus notificaciones/);
  assert.match(all, /Nombre real/);
  assert.doesNotMatch(all, /Corte clásico|Barber Style/);
  assert.doesNotMatch(all, /Marcar como leída/);
  disclosures[0].onToggle({ currentTarget: { open: false } });
  assert.deepEqual(marked, []);
  disclosures[0].onToggle({ currentTarget: { open: true } });
  disclosures[1].onToggle({ currentTarget: { open: true } });
  assert.deepEqual(marked, ['1']);
  const read = render({
    ...props,
    state: {
      ...props.state,
      items: [{ ...rows[0], readAt: '2026-11-22T12:00:00Z' }],
      unread: 0,
    },
  });
  assert.match(read, /class="bx-inbox-card bx-inbox-card--read"/);
  assert.doesNotMatch(read, /class="bx-inbox-unread"/);
  disclosures[0].onToggle({ currentTarget: { open: true } });
  assert.deepEqual(marked, ['1']);
  const invites = render({ ...props, filter: 'invitations' });
  assert.match(invites, /Invitación aceptada/);
  assert.doesNotMatch(invites, /Reserva confirmada/);
  assert.match(invites, /href="\/staff\?view=team"/);
  assert.match(invites, /Ver equipo/);
  assert.doesNotMatch(invites, /Abrir agenda/);
  assert.doesNotMatch(invites, /barbería que tienes seleccionada/);
  const agenda = render({
    ...props,
    state: { ...props.state, items: [{ ...rows[0], target: '/agenda' }] },
  });
  assert.match(agenda, /href="\/staff\?view=professional&amp;section=agenda"/);
  assert.doesNotMatch(agenda, /href="\/agenda"/);
  assert.match(agenda, /Abrir agenda/);
  assert.doesNotMatch(agenda, /Ver equipo/);
  const unread = render({ ...props, filter: 'unread' });
  assert.match(unread, /Reserva confirmada/);
  assert.doesNotMatch(unread, /Invitación aceptada/);
  const reservations = render({ ...props, filter: 'reservations' });
  assert.doesNotMatch(reservations, /Invitación aceptada/);
  const empty = render({
    ...props,
    filter: 'invitations',
    state: { ...props.state, items: [rows[0]] },
  });
  assert.match(empty, /No hay resultados/);
  assert.match(
    render({
      ...props,
      state: { ...props.state, items: [], phase: 'loading', busy: true },
    }),
    /Consultando/,
  );
  assert.match(
    render({
      ...props,
      errorAction: 'read',
      state: { ...props.state, phase: 'error' },
    }),
    /No pudimos marcar/,
  );
});

test('the mounted screen confirms deletion through its supplied inbox and retains the confirmation on server failure', async () => {
  const { createInbox } = load(
    path.resolve('src/features/notifications/application/inbox.ts'),
  );
  const { createInboxHttp } = load(
    path.resolve('src/features/notifications/infrastructure/inbox-http.ts'),
  );
  let items = rows.map((row, index) => ({
    ...row,
    id: `00000000-0000-4000-8000-00000000000${index + 1}`,
  }));
  const calls = [];
  let fail = true;
  const app = createInbox({
    scope: () => 'current-account',
    gateway: createInboxHttp({
      baseUrl: 'https://fixture.supabase.co',
      publicKey: 'fixture-public-key',
      getAccessToken: async () => 'fixture-current-token',
      fetcher: async (url, input) => {
        if (url.endsWith('/delete_my_notification')) {
          const { p_id } = JSON.parse(input.body);
          calls.push(p_id);
          if (fail) return { ok: false, status: 503, json: async () => ({}) };
          items = items.filter((row) => row.id !== p_id);
          return { ok: true, json: async () => ({ deleted: true }) };
        }
        return {
          ok: true,
          json: async () => ({
            items,
            unread: items.filter((row) => !row.readAt).length,
            canRemove: true,
          }),
        };
      },
    }),
  });
  await app.load();
  const values = [];
  let cursor = 0;
  const { InboxScreen } = load(
    path.resolve(
      'src/features/notifications/presentation/inbox-screen.web.tsx',
    ),
    {
      react: {
        ...React,
        useEffect() {},
        useState(initial) {
          const index = cursor++;
          if (!(index in values)) values[index] = initial;
          return [
            values[index],
            (value) => {
              values[index] = value;
            },
          ];
        },
      },
      './inbox-context': {
        useInbox: () => ({ app, state: app.getSnapshot() }),
      },
    },
  );
  const render = () => {
    cursor = 0;
    return InboxScreen().props;
  };
  const id = items[0].id;
  render().onDeleteRequest(id);
  render().onDeleteConfirm(id);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(render().deleteId, id);
  assert.equal(render().state.items.length, 2);
  assert.equal(render().errorAction, 'delete');
  fail = false;
  render().onDeleteConfirm(id);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls, [id, id]);
  assert.equal(render().deleteId, null);
  assert.equal(render().state.items.length, 1);
  assert.equal(
    render().state.items[0].id,
    '00000000-0000-4000-8000-000000000002',
  );
});

test('trash is inside the expanded notification, targets only its ID and requires confirmation', () => {
  const { InboxContent } = load(
    path.resolve(
      'src/features/notifications/presentation/inbox-screen.web.tsx',
    ),
  );
  const requested = [],
    confirmed = [];
  const props = {
    state: {
      phase: 'ready',
      items: rows,
      unread: 1,
      busy: false,
      canRemove: true,
    },
    filter: 'all',
    onRead() {},
    onDeleteRequest: (id) => requested.push(id),
    onDeleteConfirm: (id) => confirmed.push(id),
  };
  nativeButtons.length = 0;
  const html = renderToStaticMarkup(React.createElement(InboxContent, props));
  assert.ok(
    html.indexOf('class="bx-inbox-delete"') >
      html.indexOf('class="bx-inbox-expanded"'),
  );
  nativeButtons
    .find(
      (b) => b['aria-label'] === 'Eliminar notificación: Reserva confirmada',
    )
    .onClick();
  assert.deepEqual(requested, ['1']);
  assert.deepEqual(confirmed, []);
  nativeButtons.length = 0;
  const confirmation = renderToStaticMarkup(
    React.createElement(InboxContent, { ...props, deleteId: '1' }),
  );
  assert.match(confirmation, /role="dialog"/);
  assert.match(confirmation, /Cerrar confirmación/);
  nativeButtons.find((b) => b.children === 'Eliminar notificación').onClick();
  assert.deepEqual(confirmed, ['1']);
  nativeButtons.length = 0;
  renderToStaticMarkup(
    React.createElement(InboxContent, {
      ...props,
      state: { ...props.state, canRemove: false },
    }),
  );
  assert.ok(
    nativeButtons
      .filter((b) => b['aria-label']?.startsWith('Eliminar notificación:'))
      .every((b) => b.disabled),
  );
});
