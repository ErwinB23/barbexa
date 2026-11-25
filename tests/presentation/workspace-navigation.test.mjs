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
function fixture(overrides = {}) {
  const cache = new Map(),
    seen = [];
  const primitive = (name) =>
    function Primitive(props) {
      seen.push({ name, props });
      return React.createElement('div', null, props.children);
    };
  function load(source) {
    const file = ['.web.tsx', '.tsx', '.ts', '']
      .map((s) => source + s)
      .find(fs.existsSync);
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
        if (overrides[name]) return overrides[name];
        if (name === 'expo-crypto')
          return { getRandomValues: (bytes) => bytes.fill(1) };
        if (name === 'expo-router')
          return {
            Link: ({ onPress, ...props }) => {
              seen.push({ name: 'Link', props: { ...props, onPress } });
              return React.createElement('a', props);
            },
          };
        if (name === 'react-native')
          return {
            Platform: { OS: 'web' },
            View: primitive('View'),
            Text: primitive('Text'),
            TextInput: primitive('Input'),
            Pressable: primitive('Button'),
            ScrollView: primitive('Scroll'),
            StyleSheet: { create: (s) => s },
          };
        if (name === 'react-native-safe-area-context')
          return { SafeAreaView: primitive('Safe') };
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
    load: (name) => load(path.resolve(name)),
    seen,
    render: (Component, props) =>
      renderToStaticMarkup(React.createElement(Component, props)),
  };
}
const ready = (context) => ({
  kind: 'ready',
  identity: { userId: 'u' },
  profile: { displayName: 'Ana' },
  generation: 1,
  context,
});
const selected = (role) => ({
  kind: 'selected',
  context: { userId: 'u', membershipId: 'm', barbershopId: 'a', role },
  barbershop: { id: 'a', name: 'Local A' },
});
test('capabilities distinguish no memberships, choosing and selected roles without trusting URL roles', () => {
  const { workspaceAccess } = fixture().load(
    'src/features/authentication/presentation/workspace-access',
  );
  assert.equal(workspaceAccess(ready({ kind: 'none' })).hasWorkspaces, false);
  assert.equal(workspaceAccess(ready(selected('barber'))).administrator, false);
  assert.equal(
    workspaceAccess(ready(selected('administrator'))).administrator,
    true,
  );
  const choosing = workspaceAccess(
    ready({
      kind: 'choosing',
      memberships: [
        {
          id: 'm',
          userId: 'u',
          barbershopId: 'a',
          role: 'administrator',
          status: 'active',
        },
      ],
    }),
  );
  assert.equal(choosing.hasWorkspaces, true);
  assert.equal(choosing.administrator, false);
  assert.equal(workspaceAccess({ kind: 'signed-out' }).administrator, false);
});
test('sidebar is personal and Inicio remains navigable from profile/explore queries', () => {
  const f = fixture();
  const { AccountShell } = f.load(
    'src/features/authentication/presentation/account-shell',
  );
  const html = f.render(AccountShell, {
    state: ready(selected('administrator')),
    path: '/account',
    view: 'profile',
    children: 'Stack',
  });
  const nav = html.match(
    /<nav aria-label="Mi cuenta y reservas">([\s\S]*?)<\/nav>/,
  )[1];
  assert.doesNotMatch(
    nav,
    /Personal e invitaciones|Administrar barbería|Agenda/,
  );
  const home = f.seen.find(
    (x) =>
      x.name === 'Link' && x.props.href === '/account' && !x.props.className,
  );
  assert.equal(home.props.onPress, undefined);
});
test('profile access hides workspace for clients but preserves creation and incoming invitations', () => {
  const f = fixture();
  const { WebProfileAccess } = f.load(
    'src/features/authentication/presentation/web-profile-access',
  );
  const client = f.render(WebProfileAccess, { state: ready({ kind: 'none' }) });
  assert.doesNotMatch(
    client,
    /Tu espacio de trabajo|Administrar barbería|Gestión de equipo/,
  );
  assert.match(client, /Crear mi barbería/);
  assert.match(client, /Mis invitaciones recibidas/);
  const barber = f.render(WebProfileAccess, {
    state: ready(selected('barber')),
  });
  assert.doesNotMatch(
    barber,
    /Tu espacio de trabajo|Mi espacio profesional|Consultar agenda/,
  );
  assert.doesNotMatch(barber, /Gestión de equipo/);
  const admin = f.render(WebProfileAccess, {
    state: ready(selected('administrator')),
  });
  assert.doesNotMatch(
    admin,
    /Tu espacio de trabajo|Administrar barbería|Gestión de equipo|Consultar agenda/,
  );
  assert.doesNotMatch(admin, /Propietario|Administrador principal/);
});
test('incoming staff view never renders administrative forms even for an administrator', () => {
  const f = fixture();
  const { OperationScreen } = f.load(
    'src/features/barbershop-operation/presentation/operation-screen',
  );
  const app = {
    getScope: () => ({ userId: 'u', barbershopId: 'a', role: 'administrator' }),
    scopeKey: () => 'a',
    listOwnInvitations: async () => [],
    load: async () => null,
  };
  const html = f.render(OperationScreen, {
    application: app,
    page: 'staff',
    staffView: 'incoming',
    title: 'Invitaciones',
    onNavigate() {},
    onContext() {},
  });
  assert.match(html, /Para trabajar como barbero/);
  assert.doesNotMatch(
    html,
    /Invitar a un profesional|Profesionales y capacidades|Guardar capacidades/,
  );
});
test('team route rejects clients and barbers before mounting administrative consumers', () => {
  for (const context of [{ kind: 'none' }, selected('barber')]) {
    const f = fixture({
      'expo-router': {
        Link: ({ children }) => React.createElement('a', null, children),
        useRouter: () => ({ push() {} }),
        useLocalSearchParams: () => ({ view: 'team', role: 'administrator' }),
      },
      '../features/authentication/presentation/use-registration': {
        useRegistration: () => ({
          state: ready(context),
          configured: true,
          callbackError: null,
        }),
      },
      react: { ...React, useContext: () => ({}) },
    });
    const { OperationRoute } = f.load('src/composition/operation-route.web');
    assert.match(
      f.render(OperationRoute, { page: 'staff' }),
      /No tienes permisos/,
    );
  }
});

test('avatar keeps personal actions for all and exposes work destinations only for the selected membership', () => {
  for (const context of [
    { kind: 'none' },
    selected('barber'),
    selected('administrator'),
    {
      kind: 'choosing',
      memberships: [{ userId: 'u', status: 'active', role: 'administrator' }],
    },
  ]) {
    let index = 0;
    const f = fixture({
      react: { ...React, useState: () => [index++ === 0, () => {}] },
    });
    const { UserMenu } = f.load(
      'src/features/authentication/presentation/user-menu',
    );
    const { workspaceAccess } = f.load(
      'src/features/authentication/presentation/workspace-access',
    );
    const html = f.render(UserMenu, {
      name: 'Ana',
      access: workspaceAccess(ready(context)),
    });
    assert.match(html, /Mis invitaciones recibidas/);
    assert.match(html, /Crear mi barbería/);
    assert.equal(
      html.includes('Administrar barbería'),
      context.kind === 'selected' && context.context.role === 'administrator',
    );
    assert.equal(
      html.includes('Mi espacio profesional'),
      context.kind === 'selected' &&
        ['barber', 'administrator'].includes(context.context.role),
    );
    assert.doesNotMatch(
      html,
      /Gestión de equipo y personal|href="\/staff\?view=team"/,
    );
    if (context.kind === 'selected')
      assert.match(html, /href="\/staff\?view=professional"/);
    assert.doesNotMatch(html, /Propietario|Administrador principal/);
  }
});

test('incoming administrator invitations do not expose sending controls, including for admins', () => {
  const f = fixture();
  const { OperationScreen } = f.load(
    'src/features/barbershop-operation/presentation/operation-screen',
  );
  const scope = () => ({
    userId: 'u',
    barbershopId: 'a',
    role: 'administrator',
  });
  const app = {
    getScope: scope,
    scopeKey: () => 'a',
    listOwnInvitations: async () => [],
    load: async () => null,
    adminInvitations: {
      getScope: scope,
      scopeKey: () => 'a',
      hasPendingInvitation: () => false,
    },
  };
  const html = f.render(OperationScreen, {
    application: app,
    page: 'staff',
    staffView: 'incoming',
    title: 'Invitaciones',
    onNavigate() {},
    onContext() {},
  });
  assert.match(html, /Para administrar una barbería/);
  assert.doesNotMatch(
    html,
    /Mis invitaciones de administrador|Solo el propietario puede invitar|el límite es de dos/,
  );
  assert.doesNotMatch(
    html,
    /Invitar como administrador|Invitaciones enviadas|Invitar a un profesional/,
  );
});

test('create-only view remains available to admins without mounting shop management', () => {
  const f = fixture();
  const { OperationScreen } = f.load(
    'src/features/barbershop-operation/presentation/operation-screen',
  );
  const app = {
    getScope: () => ({ userId: 'u', barbershopId: 'a', role: 'administrator' }),
    scopeKey: () => 'a',
    listOwnInvitations: async () => [],
    load: async () => null,
  };
  const html = f.render(OperationScreen, {
    application: app,
    page: 'barbershop-admin',
    createOnly: true,
    title: 'Crear',
    onNavigate() {},
    onContext() {},
  });
  assert.match(html, /Crear barbería y ser su administrador/);
  assert.doesNotMatch(
    html,
    /Guardar configuración|Contacto público|Publicar barbería/,
  );
});

test('account personal access omits duplicate workspace links for active and inactive memberships', () => {
  const f = fixture();
  const { WebProfileAccess } = f.load(
    'src/features/authentication/presentation/web-profile-access',
  );
  const member = {
    id: 'm',
    userId: 'u',
    barbershopId: 'a',
    role: 'administrator',
    status: 'active',
  };
  const html = f.render(WebProfileAccess, {
    state: ready({
      kind: 'choosing',
      memberships: [
        member,
        { ...member, id: 'n', barbershopId: 'b', role: 'barber' },
      ],
    }),
  });
  assert.doesNotMatch(
    html,
    /Tu espacio de trabajo|Ver mis barberías|Consultar agenda/,
  );
  assert.match(html, /Mis invitaciones recibidas/);
  assert.match(html, /Crear mi barbería/);
  assert.doesNotMatch(
    html,
    /Administrar barbería|Gestión de equipo|Mi espacio profesional/,
  );
  const inactive = f.render(WebProfileAccess, {
    state: ready({
      kind: 'choosing',
      memberships: [{ ...member, status: 'inactive' }],
    }),
  });
  assert.doesNotMatch(inactive, /Tu espacio de trabajo/);
});

test('return to Inicio only suppresses navigation when the actual home view is selected', () => {
  for (const view of ['home', 'profile', 'explore', 'shop', 'notices']) {
    const f = fixture();
    const { AccountShell } = f.load(
      'src/features/authentication/presentation/account-shell',
    );
    f.render(AccountShell, {
      state: ready({ kind: 'none' }),
      path: '/account',
      view,
      children: 'Stack',
    });
    const home = f.seen.find(
      (x) =>
        x.name === 'Link' && x.props.href === '/account' && !x.props.className,
    );
    assert.equal(
      typeof home.props.onPress,
      view === 'home' ? 'function' : 'undefined',
    );
  }
});

test('verified fixed capabilities distinguish owners and secondaries without changing legacy navigation', () => {
  const f = fixture();
  const { workspaceAccess } = f.load(
    'src/features/authentication/presentation/workspace-access',
  );
  const state = ready(selected('administrator'));
  const secondary = {
    userId: 'u',
    barbershopId: 'a',
    capacity: 'secondary',
    permissions: { editServices: true, manageTeam: false },
  };
  assert.equal(workspaceAccess(state).manageTeam, true);
  assert.equal(workspaceAccess(state, secondary).administrator, true);
  assert.equal(workspaceAccess(state, secondary).manageTeam, false);
  assert.equal(
    workspaceAccess(state, { ...secondary, barbershopId: 'b' }).administrator,
    false,
  );
  const { WebProfileAccess } = f.load(
    'src/features/authentication/presentation/web-profile-access',
  );
  const html = f.render(WebProfileAccess, { state, authority: secondary });
  assert.doesNotMatch(html, /Administrar barbería|Tu espacio de trabajo/);
  assert.doesNotMatch(html, /Gestión de equipo y personal/);
});

test('unregularized properties never render administrative profile links in the prepared mode', () => {
  const f = fixture();
  const { WebProfileAccess } = f.load(
    'src/features/authentication/presentation/web-profile-access',
  );
  const html = f.render(WebProfileAccess, {
    state: ready(selected('administrator')),
    authority: {
      userId: 'u',
      barbershopId: 'a',
      capacity: 'unregularized',
      permissions: { editServices: false, manageTeam: false },
    },
  });
  assert.doesNotMatch(html, /Administrar barbería|Gestión de equipo/);
  assert.match(html, /Mis invitaciones recibidas|Crear mi barbería/);
});
test('prepared route blocks administrative controls on old backends or unregularized shops', () => {
  for (const page of ['services', 'schedules', 'staff', 'barbershop-admin']) {
    const unavailable = {
      userId: 'u',
      barbershopId: 'a',
      capacity: 'unavailable',
      permissions: { editServices: false, manageTeam: false },
    };
    const f = fixture({
      'expo-router': {
        Link: ({ children }) => React.createElement('a', null, children),
        useRouter: () => ({ push() {} }),
        useLocalSearchParams: () => ({ view: 'team' }),
      },
      '../features/authentication/presentation/use-registration': {
        useRegistration: () => ({
          state: ready(selected('administrator')),
          configured: true,
          callbackError: null,
        }),
      },
      './use-team-authority': {
        useTeamAuthority: () => ({
          enabled: true,
          value: null,
          authority: unavailable,
          retry() {},
        }),
      },
      react: { ...React, useContext: () => ({}) },
    });
    const { OperationRoute } = f.load('src/composition/operation-route.web');
    const html = f.render(OperationRoute, { page });
    assert.match(html, /Administración no disponible|Volver a verificar/);
    assert.doesNotMatch(
      html,
      /Publicar barbería|Invitar como administrador|Guardar configuración/,
    );
  }
});

// 2E.1: the isolated profile is enabled here, unlike the legacy route fixtures.
function teamRouteFixture(context, { phase = 'idle', value = null } = {}) {
  const mounted = [];
  let currentContext = context;
  let currentAuthority = { phase, value };
  const f = fixture({
    'expo-router': {
      Link: ({ href, children }) =>
        React.createElement('a', { href }, children),
      useRouter: () => ({ push() {} }),
      useLocalSearchParams: () => ({ view: 'team', role: 'administrator' }),
    },
    '../features/authentication/presentation/use-registration': {
      useRegistration: () => ({
        state: ready(currentContext),
        configured: true,
        callbackError: null,
        application: { refreshContext: async () => {} },
      }),
    },
    './use-team-authority': {
      useTeamAuthority: () => ({
        enabled: true,
        ...currentAuthority,
        authority: currentAuthority.value ?? {
          userId: 'u',
          barbershopId: currentContext.context?.barbershopId ?? '',
          capacity: 'unavailable',
          permissions: { editServices: false, manageTeam: false },
        },
        retry() {},
      }),
    },
    '../features/barbershop-operation/presentation/operation-screen': {
      OperationScreen: (props) => {
        mounted.push(props);
        return React.createElement(
          'div',
          null,
          'Authorized operation consumer',
        );
      },
    },
    react: { ...React, useContext: () => ({ authority: {} }) },
  });
  const { OperationRoute } = f.load('src/composition/operation-route.web');
  return {
    mounted,
    render: (page = 'staff') => f.render(OperationRoute, { page }),
    update(nextContext, nextAuthority) {
      currentContext = nextContext;
      currentAuthority = nextAuthority;
    },
  };
}
const ownerAuthority = (shop = 'a') => ({
  userId: 'u',
  barbershopId: shop,
  capacity: 'owner',
  secondaryCount: 0,
  permissions: { manageTeam: true, editServices: true },
});

test('shop administration never mounts the create form while context is resolving or failed', () => {
  for (const context of [
    { kind: 'resolving' },
    { kind: 'error', error: 'provider-unavailable' },
  ]) {
    const f = teamRouteFixture(context);
    const html = f.render('barbershop-admin');
    assert.equal(f.mounted.length, 0);
    assert.doesNotMatch(
      html,
      /Crear mi barbería|Authorized operation consumer/,
    );
    assert.match(html, /Actualizando|No se pudo actualizar/);
  }
});

test('2E.1 client without memberships terminates idle/loading/error with denial and safe exits', () => {
  for (const phase of ['idle', 'loading', 'error', 'ready']) {
    const f = teamRouteFixture({ kind: 'none' }, { phase });
    const html = f.render();
    assert.match(html, /No tienes permisos para esta sección/);
    assert.doesNotMatch(
      html,
      /Cargando permisos|Authorized operation consumer|Invitar como administrador/,
    );
    assert.match(html, /href="\/account"/);
    assert.match(html, /href="\/account\?view=profile"/);
    assert.equal(f.mounted.length, 0);
  }
});
test('2E.1 barber cannot wait for or inherit administrative team authority', () => {
  for (const value of [null, ownerAuthority()]) {
    const f = teamRouteFixture(selected('barber'), {
      phase: value ? 'ready' : 'idle',
      value,
    });
    assert.match(f.render(), /No tienes permisos/);
    assert.equal(f.mounted.length, 0);
  }
});
test('2E.1 principal waits for verified permissions, then mounts the administrative consumer', () => {
  const f = teamRouteFixture(selected('administrator'));
  for (const phase of ['idle', 'loading']) {
    f.update(selected('administrator'), { phase, value: null });
    const html = f.render();
    assert.match(html, /Cargando permisos/);
    assert.match(html, /aria-busy="true"/);
    assert.equal(f.mounted.length, 0);
  }
  f.update(selected('administrator'), {
    phase: 'ready',
    value: ownerAuthority(),
  });
  assert.match(f.render(), /Authorized operation consumer/);
  assert.equal(f.mounted.length, 1);
});
test('2E.1 secondary with limited verified capabilities is denied team management', () => {
  const f = teamRouteFixture(selected('administrator'), {
    phase: 'ready',
    value: {
      ...ownerAuthority(),
      capacity: 'secondary',
      permissions: { editServices: true, manageTeam: false },
    },
  });
  assert.match(f.render(), /No tienes permisos/);
  assert.equal(f.mounted.length, 0);
});
test('2E.1 multiple memberships require selection without combining permissions', () => {
  const choosing = {
    kind: 'choosing',
    memberships: [
      {
        userId: 'u',
        barbershopId: 'a',
        status: 'active',
        role: 'administrator',
      },
      { userId: 'u', barbershopId: 'b', status: 'active', role: 'barber' },
    ],
  };
  const f = teamRouteFixture(choosing, { phase: 'idle', value: null });
  assert.match(f.render(), /No tienes permisos/);
  assert.match(f.render(), /href="\/context"/);
  assert.equal(f.mounted.length, 0);
});
test('2E.1 context change and late responses cannot mount controls for a different tenant or actor', () => {
  const contextB = {
    ...selected('administrator'),
    context: {
      ...selected('administrator').context,
      barbershopId: 'b',
      membershipId: 'mb',
    },
  };
  const f = teamRouteFixture(contextB, { phase: 'loading', value: null });
  assert.match(f.render(), /Cargando permisos/);
  for (const value of [
    ownerAuthority('a'),
    { ...ownerAuthority('b'), userId: 'another-user' },
  ]) {
    f.update(contextB, { phase: 'ready', value });
    assert.match(f.render(), /No tienes permisos/);
    assert.equal(f.mounted.length, 0);
  }
  f.update(contextB, { phase: 'ready', value: ownerAuthority('b') });
  assert.match(f.render(), /Authorized operation consumer/);
  f.update({ kind: 'none' }, { phase: 'ready', value: ownerAuthority('b') });
  assert.match(f.render(), /No tienes permisos/);
  assert.equal(f.mounted.length, 1);
});
test('2E.1 query failure is an explicit recoverable error, not denial or indefinite loading', () => {
  for (const [context, phase] of [
    [selected('administrator'), 'error'],
    [{ kind: 'error', error: 'network-unavailable' }, 'idle'],
    [{ kind: 'error', error: 'network-unavailable' }, 'error'],
  ]) {
    const f = teamRouteFixture(context, { phase, value: null });
    const html = f.render();
    assert.match(html, /No se pudieron consultar los permisos/);
    assert.match(html, /role="alert"/);
    assert.match(html, /Volver a verificar/);
    assert.match(html, /href="\/context"/);
    assert.doesNotMatch(
      html,
      /Cargando permisos|Authorized operation consumer/,
    );
    assert.equal(f.mounted.length, 0);
  }
});
test('2E.1 resolving context stays loading until membership is known, then denies missing membership', () => {
  const f = teamRouteFixture({ kind: 'resolving' });
  assert.match(f.render(), /Cargando permisos/);
  f.update({ kind: 'none' }, { phase: 'idle', value: null });
  assert.match(f.render(), /No tienes permisos/);
  assert.equal(f.mounted.length, 0);
});

test('permission loading keeps administrative navigation and safe recovery without mounting private consumers', () => {
  const f = teamRouteFixture(selected('administrator'), { phase: 'loading' });
  const html = f.render();
  for (const label of [
    'Administrar barbería',
    'Pagos y reglas',
    'Revisar mis barberías',
  ])
    assert.ok(html.includes(label));
  assert.match(html, /aria-busy="true"/);
  assert.equal(f.mounted.length, 0);
  f.update(selected('administrator'), { phase: 'error', value: null });
  const error = f.render();
  assert.match(error, /Volver a verificar/);
  assert.doesNotMatch(error, /disabled=""/);
  assert.equal(f.mounted.length, 0);
});
