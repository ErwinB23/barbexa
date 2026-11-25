import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
export function fixture() {
  const controls = [];
  const values = [];
  let cursor = 0;
  const effects = [];
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync) ?? file;
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
      (name) => {
        if (name === 'react')
          return {
            ...React,
            useEffect: (f) => effects.push(f),
            useRef: (v) => ({ current: v }),
            useState: (initial) => {
              const index = cursor++;
              if (!(index in values)) values[index] = initial;
              return [
                values[index],
                (value) => {
                  values[index] = value;
                },
              ];
            },
          };
        if (name === 'react/jsx-runtime')
          return Object.fromEntries(
            Object.entries(require(name)).map(([key, value]) => [
              key,
              ['jsx', 'jsxs'].includes(key)
                ? (type, props, ...rest) => {
                    if (['button', 'input', 'select', 'form'].includes(type))
                      controls.push({ type, ...props });
                    return value(type, props, ...rest);
                  }
                : value,
            ]),
          );
        return name.startsWith('.')
          ? load(path.resolve(path.dirname(file), name))
          : require(name);
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  const { AdminManagementWeb } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/admin-management.web.tsx',
    ),
  );
  return {
    controls,
    effects,
    render(p) {
      cursor = 0;
      controls.length = 0;
      return renderToStaticMarkup(React.createElement(AdminManagementWeb, p));
    },
  };
}
export function props() {
  const calls = [];
  const authority = {
    authority: {
      userId: 'owner',
      barbershopId: 'shop-a',
      capacity: 'owner',
      secondaryCount: 1,
      permissions: {
        manageAdministrators: true,
        manageTeam: true,
        publish: true,
        refund: true,
        editServices: true,
        editHours: true,
        manageReservations: true,
        confirmPayment: true,
        transferOwnership: true,
      },
    },
    members: [
      { userId: 'owner', role: 'administrator', status: 'active' },
      { userId: 'second', role: 'administrator', status: 'active' },
      { userId: 'barber', role: 'barber', status: 'active' },
    ],
    professionals: [
      {
        userId: 'owner',
        barbershopId: 'shop-a',
        professionalName: 'Nombre propietario',
      },
      {
        userId: 'second',
        barbershopId: 'shop-a',
        professionalName: 'Nombre secundario',
      },
      {
        userId: 'barber',
        barbershopId: 'shop-a',
        professionalName: 'Profesional aparte',
      },
    ],
    busy: false,
    selected: '',
    disposition: null,
    reason: '',
    uncertain: false,
    error: null,
    message: null,
    onSelect: (id) => {
      authority.selected = id;
      calls.push(['select', id]);
    },
    onDisposition: (value) => {
      authority.disposition = value;
    },
    onReason: (value) => {
      authority.reason = value;
    },
    onRemove: () => calls.push(['remove']),
    onReload: () => calls.push(['reload']),
  };
  const invitations = {
    admin: true,
    inApp: true,
    audience: 'outgoing',
    email: '',
    mode: 'outgoing',
    rows: null,
    busy: false,
    uncertain: false,
    error: null,
    message: null,
    onLoad: () => calls.push(['list']),
    onEmail: (value) => {
      invitations.email = value;
    },
    onInvite: () => calls.push(['invite']),
    onCancel: (id) => calls.push(['cancel', id]),
  };
  return { authority, invitations, scopeKey: 'account:shop-a', calls };
}
test('administration uses real secondary quota, unknown invitation count, real roster and no fabricated activity/email', () => {
  const f = fixture(),
    p = props();
  const html = f.render(p);
  assert.match(html, /1\s*\/\s*2/);
  assert.match(html, /Cupos utilizados/);
  assert.match(html, /Invitaciones pendientes/);
  assert.match(html, /Nombre propietario/);
  assert.match(html, /Nombre secundario/);
  assert.doesNotMatch(html, /Profesional aparte|Última actividad|@barbexa/);
  assert.match(html, /Propietario/);
  assert.match(html, /Invitar administrador/);
  assert.match(html, /Roles y permisos/);
  const rows = [
    {
      id: 'pending',
      barbershopId: 'shop-a',
      recipientName: 'Persona invitada',
      status: 'pending',
      createdAt: '2026-11-20T12:00:00Z',
      expiresAt: '2099-01-01T12:00:00Z',
    },
    {
      id: 'expired',
      barbershopId: 'shop-a',
      recipientName: 'Vencida',
      status: 'pending',
      createdAt: '2020-01-01T12:00:00Z',
      expiresAt: '2020-01-08T12:00:00Z',
    },
    {
      id: 'foreign',
      barbershopId: 'shop-b',
      recipientName: 'No mostrar otro local',
      status: 'pending',
      createdAt: '2026-11-20T12:00:00Z',
      expiresAt: '2099-01-01T12:00:00Z',
    },
  ];
  p.invitations.rows = rows;
  const consulted = f.render(p);
  assert.match(consulted, /Persona invitada/);
  assert.doesNotMatch(consulted, /No mostrar otro local/);
  assert.equal(
    f.controls.filter((c) =>
      c['aria-label']?.startsWith('Cancelar invitación de'),
    ).length,
    1,
  );
});
test('name, role and status filters affect the real roster and expose a recoverable empty result', () => {
  const f = fixture(),
    p = props();
  f.render(p);
  f.controls
    .find((c) => c['aria-label'] === 'Buscar administradores por nombre')
    .onChange({ target: { value: 'secundario' } });
  let html = f.render(p);
  assert.doesNotMatch(html, /Nombre propietario/);
  assert.match(html, /Nombre secundario/);
  f.controls
    .find((c) => c['aria-label'] === 'Filtrar administradores por rol')
    .onChange({ target: { value: 'owner' } });
  html = f.render(p);
  assert.match(html, /No hay administradores con estos filtros/);
});
test('inviting, viewing and removing use existing callbacks; owner cannot be removed and uncertain attempts stay guarded', () => {
  const f = fixture(),
    p = props();
  f.render(p);
  assert.equal(
    f.controls.filter((c) =>
      c['aria-label']?.startsWith('Retirar administración de'),
    ).length,
    1,
  );
  f.controls
    .find(
      (c) =>
        c.children?.includes?.('Invitar administrador') ||
        c['aria-label'] === 'Invitar administrador',
    )
    .onClick();
  let html = f.render(p);
  assert.match(html, /Invitar administrador secundario/);
  assert.match(html, /siete días/);
  f.controls
    .find((c) => c.id === 'bx-admin-invite-email')
    .onChange({ target: { value: 'cuenta@ejemplo.test' } });
  f.render(p);
  f.controls.find((c) => c.type === 'form').onSubmit({ preventDefault() {} });
  assert.deepEqual(p.calls, [['invite']]);
  p.authority.onSelect('second');
  f.render(p);
  assert.ok(
    f.controls.find(
      (c) => c['aria-label'] === 'Confirmar retirada de administración',
    ).disabled,
  );
  p.authority.disposition = 'barber';
  p.authority.reason = 'Motivo';
  f.render(p);
  f.controls
    .find((c) => c['aria-label'] === 'Confirmar retirada de administración')
    .onClick();
  assert.deepEqual(p.calls.at(-1), ['remove']);
  p.authority.uncertain = true;
  f.render(p);
  assert.ok(
    f.controls.find((c) => c.id === 'bx-admin-removal-reason').disabled,
  );
});
test('secondary and full quota cannot invite; capacity overview is informational and does not invent unknown quotas', () => {
  const f = fixture(),
    p = props();
  p.authority.authority.secondaryCount = 2;
  f.render(p);
  assert.ok(
    f.controls.find((c) => c['aria-label'] === 'Invitar administrador')
      .disabled,
  );
  p.authority.authority = {
    ...p.authority.authority,
    capacity: 'secondary',
    userId: 'second',
    secondaryCount: null,
    permissions: {
      ...p.authority.authority.permissions,
      manageAdministrators: false,
      manageTeam: false,
      publish: false,
      refund: false,
    },
  };
  p.invitations.admin = false;
  const html = f.render(p);
  assert.match(html, /Administrador secundario/);
  assert.doesNotMatch(
    html,
    /Invitar administrador secundario|Cupos disponibles: 2/,
  );
  assert.equal(
    f.controls.filter((c) =>
      c['aria-label']?.startsWith('Retirar administración de'),
    ).length,
    0,
  );
  assert.doesNotMatch(html, /<input[^>]*type="checkbox"|<[^>]*role="switch"/);
});

test('membership status filters, consultation failures and empty invitation results stay distinct', () => {
  const f = fixture(),
    p = props();
  p.authority.members[1].status = 'inactive';
  f.render(p);
  f.controls
    .find((c) => c['aria-label'] === 'Filtrar administradores por estado')
    .onChange({ target: { value: 'inactive' } });
  let html = f.render(p);
  assert.match(html, /Nombre secundario/);
  assert.doesNotMatch(html, /Nombre propietario/);
  p.invitations.error = 'No se pudo consultar';
  html = f.render(p);
  assert.match(html, /No se pudo consultar/);
  assert.match(html, /todavía no se han consultado/);
  assert.doesNotMatch(
    html,
    /Todavía no hay invitaciones administrativas enviadas/,
  );
  p.invitations.error = null;
  p.invitations.rows = [];
  html = f.render(p);
  assert.match(html, /Todavía no hay invitaciones administrativas enviadas/);
  p.authority.members = null;
  p.authority.busy = true;
  html = f.render(p);
  assert.match(html, /Consultando administradores/);
});

test('sent invitation cancellation requires an explicit per-invitation confirmation and never cancels other rows', () => {
  const f = fixture(),
    p = props();
  p.invitations.rows = [
    {
      id: 'pending-one',
      barbershopId: 'shop-a',
      recipientName: 'Primera persona',
      status: 'pending',
      createdAt: '2026-11-20T12:00:00Z',
      expiresAt: '2099-01-01T12:00:00Z',
    },
    {
      id: 'pending-two',
      barbershopId: 'shop-a',
      recipientName: 'Segunda persona',
      status: 'pending',
      createdAt: '2026-11-20T12:00:00Z',
      expiresAt: '2099-01-01T12:00:00Z',
    },
  ];
  f.render(p);
  f.controls
    .find((c) => c['aria-label'] === 'Cancelar invitación de Primera persona')
    .onClick();
  assert.deepEqual(p.calls, []);
  f.render(p);
  f.controls.find((c) => c.children === 'Confirmar cancelación').onClick();
  assert.deepEqual(p.calls, [['cancel', 'pending-one']]);
});
