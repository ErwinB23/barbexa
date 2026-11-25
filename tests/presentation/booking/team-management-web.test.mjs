import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture() {
  const actions = [],
    cache = new Map();
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((x) => file + x).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
      (name) => {
        if (name.endsWith('/app-text-field'))
          return {
            AppTextField: ({ label, value, disabled }) =>
              React.createElement(
                'label',
                null,
                label,
                React.createElement('input', {
                  value,
                  disabled,
                  readOnly: true,
                }),
              ),
          };
        if (name.endsWith('/app-button'))
          return {
            AppButton: ({ label, onPress, disabled }) => {
              actions.push({ label, onPress, disabled });
              return React.createElement('button', null, label);
            },
          };
        if (name.startsWith('.'))
          return load(path.resolve(path.dirname(file), name));
        return require(name);
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  return {
    actions,
    Component: load(
      path.resolve(
        'src/features/barbershop-operation/presentation/team-management-web.tsx',
      ),
    ).TeamManagementWeb,
  };
}
const data = {
  members: [
    { userId: 'a', role: 'administrator', status: 'active' },
    { userId: 'b', role: 'barber', status: 'inactive' },
  ],
  professionals: [
    { id: 'pa', userId: 'a', professionalName: 'Ana <A>', active: true },
    { id: 'pb', userId: 'b', professionalName: 'Luis', active: false },
  ],
  services: [{ id: 'cut', name: 'Corte clásico', active: true }],
  capabilities: [{ barberId: 'pa', serviceId: 'cut' }],
  invitations: [
    { id: 'invite', role: 'barber', status: 'pending' },
    { id: 'old', role: 'barber', status: 'accepted' },
  ],
};
const base = {
  title: 'Local real',
  data,
  loading: false,
  disabled: false,
  email: '',
  member: '',
  professionalName: '',
  barber: null,
  capabilities: [],
  navigation: null,
  feedback: null,
  onEmail() {},
  onInvite() {},
  onCancelInvitation() {},
  onMember() {},
  onProfessionalName() {},
  onActivateMember() {},
  onSelectProfessional() {},
  onToggleProfessional() {},
  onToggleCapability() {},
  onSaveCapabilities() {},
};
test('team displays real names, roles and services without inventing emails, dates, resend or extra permissions', () => {
  const f = fixture(),
    called = [];
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      onSelectProfessional: (id) => called.push(id),
      onCancelInvitation: (id) => called.push(id),
    }),
  );
  assert.match(html, /Ana &lt;A&gt;/);
  assert.match(html, /Corte clásico/);
  assert.match(html, /Administrador/);
  assert.match(html, /Inactivo/);
  assert.doesNotMatch(html, /@barbexa.com|10 ene 2026|Más opciones/);
  f.actions.find((a) => a.label === 'Servicios de Ana <A>').onPress();
  f.actions.find((a) => a.label === 'Cancelar invitación pendiente').onPress();
  assert.deepEqual(called, ['pa', 'invite']);
});
test('team preserves empty, unknown/loading and disabled states instead of showing fake counts', () => {
  const f = fixture();
  const empty = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      data: { ...data, members: [], professionals: [], invitations: [] },
    }),
  );
  assert.match(empty, /Aún no tienes profesionales/);
  assert.match(empty, /No hay invitaciones pendientes/);
  const loading = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      data: null,
      loading: true,
      disabled: true,
    }),
  );
  assert.match(loading, /Consultando/);
  assert.doesNotMatch(loading, /Ana|No hay invitaciones pendientes/);
});
test('existing invitation, professional activation and capabilities actions remain wired and respect busy state', () => {
  const f = fixture(),
    called = [];
  renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      member: 'a',
      barber: 'pa',
      capabilities: ['cut'],
      onInvite: () => called.push('invite'),
      onActivateMember: () => called.push('activate-member'),
      onToggleProfessional: (p) => called.push(p.id),
      onSaveCapabilities: () => called.push('save-capabilities'),
      onToggleCapability: (id) => called.push(id),
    }),
  );
  for (const label of [
    'Invitar como barbero',
    'Activar perfil profesional del miembro elegido',
    'Desactivar Ana <A>',
    'Seleccionado: Corte clásico',
    'Guardar capacidades seleccionadas',
  ])
    f.actions.find((a) => a.label === label).onPress();
  assert.deepEqual(called, [
    'invite',
    'activate-member',
    'pa',
    'cut',
    'save-capabilities',
  ]);
  const busy = fixture();
  renderToStaticMarkup(
    React.createElement(busy.Component, { ...base, disabled: true }),
  );
  assert.ok(busy.actions.every((action) => action.disabled));
});

test('invitation history shows account name, dates and current activity newest first, excluding another shop', () => {
  const f = fixture();
  const invitations = [
    {
      id: 'older',
      barbershopId: 'shop',
      role: 'barber',
      status: 'accepted',
      createdAt: '2026-11-20T15:00:00.000Z',
      respondedAt: '2026-11-21T15:00:00.000Z',
      recipientName: 'Cuenta anterior',
      professionalActive: false,
      barbershopName: 'Local real',
    },
    {
      id: 'foreign',
      barbershopId: 'other',
      role: 'barber',
      status: 'accepted',
      createdAt: '2026-11-23T15:00:00.000Z',
      recipientName: 'Cuenta ajena',
    },
    {
      id: 'newer',
      barbershopId: 'shop',
      role: 'barber',
      status: 'accepted',
      createdAt: '2026-11-22T15:00:00.000Z',
      respondedAt: '2026-11-23T15:00:00.000Z',
      recipientName: 'Cuenta reciente',
      professionalActive: true,
      barbershopName: 'Local real',
    },
    { id: 'legacy', barbershopId: 'shop', role: 'barber', status: 'rejected' },
  ];
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      barbershopId: 'shop',
      data: { ...data, invitations },
    }),
  );
  assert.ok(html.indexOf('Cuenta reciente') < html.indexOf('Cuenta anterior'));
  assert.match(html, /Fecha de envío/);
  assert.match(html, /Aceptada el/);
  assert.match(html, /Activo/);
  assert.match(html, /Inactivo/);
  assert.match(html, /Nombre no disponible/);
  assert.match(html, /Fecha no disponible/);
  assert.doesNotMatch(html, /Cuenta ajena/);
  assert.equal(invitations[0].id, 'older');
});

test('pending is a separate disclosure with recipient email date and cancel/remind actions', () => {
  const f = fixture(),
    calls = [];
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      barbershopId: 'shop',
      onResendInvitation: (id) => calls.push(id),
      data: {
        ...data,
        invitations: [
          {
            id: 'p',
            barbershopId: 'shop',
            role: 'barber',
            status: 'pending',
            recipientName: 'Cuenta pendiente',
            recipientEmail: 'persona@example.invalid',
            createdAt: '2026-11-23T15:00:00.000Z',
          },
          {
            id: 'x',
            barbershopId: 'other',
            role: 'barber',
            status: 'pending',
            recipientName: 'Ajena',
          },
        ],
      },
    }),
  );
  assert.match(html, /<summary[^>]*>Pendientes/);
  assert.match(html, /Cuenta pendiente/);
  assert.match(html, /persona@example.invalid/);
  assert.match(html, /Fecha de envío/);
  assert.doesNotMatch(html, /Ajena/);
  f.actions.find((a) => a.label === 'Reenviar invitación').onPress();
  assert.deepEqual(calls, ['p']);
});

test('administration section remains discoverable while Cloud release is pending', () => {
  const f = fixture();
  const html = renderToStaticMarkup(
    React.createElement(f.Component, { ...base, administration: undefined }),
  );
  assert.match(html, /Administración, permisos e invitaciones administrativas/);
  assert.match(html, /gestión de administradores todavía no está habilitada/);
  assert.doesNotMatch(html, /Invitar como administrador/);
});
