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
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
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
  const components = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/operation-screen.tsx',
    ),
  );
  return {
    observed,
    load,
    ...components,
    render: (Component, props) => {
      observed.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
  };
}
test('Web confirmed success floats while loading/errors suppress stale success and Android keeps its inline feedback', () => {
  const f = fixture('web');
  const props = { loading: false, error: null, success: true, onRetry() {} };
  assert.match(
    f.render(f.OperationFeedback, props),
    /class="bx-success-toast"/,
  );
  assert.doesNotMatch(
    f.render(f.OperationFeedback, { ...props, loading: true }),
    /class="bx-success-toast"/,
  );
  assert.doesNotMatch(
    f.render(f.OperationFeedback, { ...props, error: 'FORBIDDEN' }),
    /class="bx-success-toast"/,
  );
  const native = fixture('android');
  const html = native.render(native.OperationFeedback, props);
  assert.match(html, /Cambios guardados/);
  assert.doesNotMatch(html, /bx-success-toast/);
});
test('Web existing-shop mode never shows the create form and renders its separate name editor', () => {
  const f = fixture('web');
  const app = {
    getScope: () => ({
      userId: 'fixture',
      generation: 1,
      barbershopId: 'shop',
      role: 'administrator',
    }),
    scopeKey: () => 'own',
  };
  const html = f.render(f.OperationScreen, {
    application: app,
    page: 'barbershop-admin',
    title: 'Shop',
    onNavigate() {},
    onContext() {},
    shopNameEditor: React.createElement('p', null, 'Editar nombre actual'),
  });
  assert.ok(!html.includes('Crear mi barbería'));
  assert.ok(html.includes('Editar nombre actual'));
  const create = f.render(f.OperationScreen, {
    application: app,
    page: 'barbershop-admin',
    title: 'Crear',
    createOnly: true,
    onNavigate() {},
    onContext() {},
    shopNameEditor: React.createElement('p', null, 'Editar nombre actual'),
  });
  assert.ok(create.includes('Crear mi barbería'));
  assert.ok(!create.includes('Editar nombre actual'));
});

test('service feedback displays the precise field error instead of unrelated intervals', () => {
  const f = fixture('web');
  const html = f.render(f.OperationFeedback, {
    loading: false,
    error: 'INVALID_INPUT',
    errorMessage: 'Ingresa una duración válida en minutos.',
    success: false,
    onRetry() {},
  });
  assert.match(html, /Ingresa una duración válida/);
  assert.doesNotMatch(html, /intervalos ingresados/);
});
test('Web name editor uses current name, accessible loading/error states and a rename-only action', () => {
  const file = path.resolve(
    'src/features/barbershop-operation/presentation/shop-name-editor.web.tsx',
  );
  assert.ok(fs.existsSync(file), 'Missing selected shop editor');
  const f = fixture('web'),
    { ShopNameContent } = f.load(file);
  let rename = 0;
  const props = {
    name: 'Nombre actual',
    loaded: true,
    busy: false,
    uncertain: false,
    saved: false,
    error: null,
    onName() {},
    onRead() {},
    onSave() {
      rename++;
    },
  };
  const html = f.render(ShopNameContent, props);
  assert.ok(!html.includes('Crear barbería'));
  const input = f.observed.find((x) => x.kind === 'TextInput');
  assert.equal(input.props.value, 'Nombre actual');
  assert.equal(
    input.props.accessibilityLabel,
    'Nombre de la barbería seleccionada',
  );
  f.observed
    .find(
      (x) => x.props.accessibilityLabel === 'Guardar nombre de esta barbería',
    )
    .props.onPress();
  assert.equal(rename, 1);
  f.render(ShopNameContent, { ...props, busy: true });
  assert.ok(
    f.observed
      .filter((x) => x.kind === 'Pressable')
      .every((x) => x.props.disabled),
  );
  f.render(ShopNameContent, {
    ...props,
    uncertain: true,
    error: 'Consulta el nombre actual antes de guardar otra vez.',
  });
  assert.equal(
    f.observed.find(
      (x) => x.props.accessibilityLabel === 'Guardar nombre de esta barbería',
    ).props.disabled,
    true,
  );
  assert.equal(
    f.observed.find(
      (x) => x.props.accessibilityLabel === 'Consultar nombre actual',
    ).props.disabled,
    false,
  );
});
test('Android administrator keeps its original create surface without the Web-only editor', () => {
  const f = fixture('android');
  const html = f.render(f.OperationScreen, {
    application: {
      getScope: () => ({
        userId: 'fixture',
        generation: 1,
        barbershopId: 'shop',
        role: 'administrator',
      }),
      scopeKey: () => 'own',
    },
    page: 'barbershop-admin',
    title: 'Shop',
    onNavigate() {},
    onContext() {},
    shopNameEditor: React.createElement(
      'p',
      null,
      'Web-only selected shop editor',
    ),
  });
  assert.ok(html.includes('Crear mi barbería'));
  assert.ok(!html.includes('Web-only selected shop editor'));
});
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' authenticated zero-membership offering remains valid without admin forms',
    () => {
      const f = fixture(platform);
      const app = {
        getScope: () => ({ userId: 'fixture', generation: 1 }),
        scopeKey: () => 'own',
        load: async () => {},
        listOwnInvitations: async () => [],
      };
      const html = f.render(f.OperationScreen, {
        application: app,
        page: 'barbershop-admin',
        title: 'Oferta',
        onNavigate() {},
        onContext() {},
      });
      assert.ok(html.includes('Crear mi barbería'));
      assert.ok(html.includes('membresía activa'));
      assert.ok(!html.includes('Guardar configuración'));
      assert.equal(f.observed.filter((o) => o.kind === 'TextInput').length, 1);
    },
  );
  test(
    platform +
      ' admin offering exposes labelled fields and disables duplicate save during loading',
    () => {
      const f = fixture(platform);
      const app = {
        getScope: () => ({
          userId: 'fixture',
          generation: 1,
          barbershopId: 'shop',
          role: 'administrator',
        }),
        scopeKey: () => 'own',
        load: async () => {},
        listOwnInvitations: async () => [],
      };
      f.render(f.OperationScreen, {
        application: app,
        page: 'services',
        title: 'Servicios',
        onNavigate() {},
        onContext() {},
      });
      const fields = f.observed.filter((o) => o.kind === 'TextInput');
      // Web opens the form explicitly from the catalog; native keeps its form.
      assert.equal(fields.length, platform === 'web' ? 0 : 4);
      assert.ok(
        fields.every(
          (o) =>
            typeof o.props.accessibilityLabel === 'string' &&
            o.props.editable === false,
        ),
      );
      const save = f.observed.find(
        (o) =>
          o.kind === 'Pressable' &&
          o.props.accessibilityLabel ===
            (platform === 'web' ? 'Añadir servicio' : 'Crear servicio'),
      );
      assert.equal(save.props.disabled, true);
      assert.equal(save.props.accessibilityRole, 'button');
    },
  );
  test(
    platform + ' safe errors show retry and never render technical error text',
    () => {
      const f = fixture(platform);
      const html = f.render(f.OperationFeedback, {
        loading: false,
        error: 'secret-shaped-technical-error',
        success: false,
        onRetry() {},
      });
      assert.ok(!html.includes('secret-shaped'));
      const retry = f.observed.find((o) => o.kind === 'Pressable');
      assert.equal(retry.props.accessibilityRole, 'button');
      assert.equal(typeof retry.props.onPress, 'function');
    },
  );
}

test('Payments and rules is an administrative tab immediately after schedules on Web and Android', () => {
  for (const platform of ['web', 'android']) {
    const f = fixture(platform);
    const props = {
      application: {
        getScope: () => ({ barbershopId: 'shop', role: 'administrator' }),
        scopeKey: () => 'own',
      },
      page: 'payments-rules',
      title: 'Shop',
      onNavigate() {},
      onContext() {},
      paymentsAndRules: React.createElement(
        'p',
        null,
        'Ajustes de pagos y reglas',
      ),
    };
    const html = f.render(f.OperationScreen, props);
    assert.ok(html.includes('Ajustes de pagos y reglas'));
    const labels = f.observed
      .filter((x) => x.kind === 'Pressable')
      .map((x) => x.props.accessibilityLabel);
    assert.equal(labels[labels.indexOf('Horarios') + 1], 'Pagos y reglas');
    const denied = f.render(f.OperationScreen, {
      ...props,
      application: {
        getScope: () => ({ barbershopId: 'shop', role: 'barber' }),
        scopeKey: () => 'other',
      },
    });
    assert.ok(!denied.includes('Ajustes de pagos y reglas'));
  }
});

test('Payments and rules groups existing care and reprogramming controls without implying automatic Yape payment', () => {
  const f = fixture('web');
  const { PaymentsAndRulesPanel } = f.load(
    path.resolve('src/composition/payments-and-rules-panel.tsx'),
  );
  const { BookingContext } = f.load(
    path.resolve('src/features/reservations/presentation/booking-context.tsx'),
  );
  const html = f.render(BookingContext.Provider, {
    value: {
      care: async () => {},
      reschedule: { readPolicy: async () => {}, setPolicy: async () => {} },
    },
    children: React.createElement(PaymentsAndRulesPanel, {
      barbershopId: 'shop',
    }),
  });
  for (const text of [
    'Pagos',
    'Reglas de atención',
    'Reglas de reservas',
    'confirman manualmente',
    'Consultar configuración de atención y Yape',
    'Consultar antelación de reprogramación',
  ])
    assert.ok(html.includes(text), text);
});
