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
        if (name.endsWith('/app-button'))
          return {
            AppButton: ({ label, onPress }) => {
              actions.push({ label, onPress });
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
        'src/features/authentication/presentation/account-profile-web.tsx',
      ),
    ).AccountProfileWeb,
  };
}
test('Web account keeps actual profile data, edit and navigation actions without local logout/home actions', () => {
  const f = fixture(),
    called = [];
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      state: {
        kind: 'ready',
        profile: { displayName: '<Ana>', phone: null },
        identity: { userId: 'own', emailConfirmed: true },
        context: { kind: 'none' },
      },
      profileEditor: React.createElement('button', null, 'Editar perfil'),
      workspaceContent: React.createElement(
        'section',
        null,
        'Accesos personales',
      ),
      onBooking: () => called.push('booking'),
      onOwn: () => called.push('own'),
    }),
  );
  assert.match(html, /Mi cuenta/);
  assert.match(html, /&lt;Ana&gt;/);
  assert.match(html, /Sin teléfono registrado/);
  assert.match(html, /Sin barberías vinculadas/);
  assert.match(html, /Editar perfil/);
  assert.match(html, /Correo confirmado/);
  assert.match(html, /Resumen de tu cuenta/);
  assert.doesNotMatch(html, /Tu espacio de trabajo|Organiza tus citas/);
  assert.match(html, /Accesos personales/);
  assert.doesNotMatch(html, /Cerrar sesión|Volver al inicio|<img/);
  f.actions.find((x) => x.label === 'Reservar una cita').onPress();
  f.actions.find((x) => x.label === 'Mis reservas').onPress();
  assert.deepEqual(called, ['booking', 'own']);
});
test('Web account shows selected real context without granting permissions or inventing account status', () => {
  const f = fixture();
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      state: {
        kind: 'ready',
        profile: { displayName: 'Ana', phone: '000000000' },
        context: {
          kind: 'selected',
          barbershop: { name: 'Taller ficticio' },
          context: { role: 'barber' },
        },
      },
    }),
  );
  assert.match(html, /Taller ficticio/);
  assert.match(html, /Barbero/);
  assert.doesNotMatch(html, /Administrador|Cuenta verificada/);
});

test('account summary counts distinct active memberships without assuming account suspension or an exact selected-context total', () => {
  const f = fixture();
  const base = {
    kind: 'ready',
    identity: { userId: 'own', emailConfirmed: true },
    profile: { displayName: 'Personal', phone: null },
  };
  const render = (context) =>
    renderToStaticMarkup(
      React.createElement(f.Component, { state: { ...base, context } }),
    );
  const membership = {
    id: 'm',
    userId: 'own',
    barbershopId: 'shop',
    status: 'active',
    role: 'barber',
  };
  let html = render({
    kind: 'choosing',
    memberships: [
      membership,
      { ...membership, id: 'duplicate' },
      { ...membership, id: 'other', barbershopId: 'second' },
      { ...membership, userId: 'other', barbershopId: 'not-own' },
      { ...membership, status: 'inactive', barbershopId: 'inactive' },
    ],
  });
  assert.match(html, /<strong>2<\/strong>/);
  assert.match(html, /Correo confirmado/);
  html = render({ kind: 'none' });
  assert.match(html, /<strong>0<\/strong>/);
  assert.doesNotMatch(html, /Inactiva|Suspendida/);
  html = render({
    kind: 'selected',
    context: { role: 'barber' },
    barbershop: { name: 'Real' },
  });
  assert.match(html, /Consultando…/);
  assert.doesNotMatch(html, /1 o más|total de vínculos no está disponible/);
});
