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
  let state = { kind: 'resolving' },
    configured = false;
  const cache = new Map();
  function load(file) {
    if (!fs.existsSync(file))
      file =
        ['.ts', '.tsx'].map((ext) => file + ext).find(fs.existsSync) ?? file;
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    function screen() {
      const { application } = load(
        path.resolve(
          'src/features/reservations/presentation/booking-context.tsx',
        ),
      ).useBooking();
      return React.createElement('span', null, application.getSnapshot().label);
    }
    function operation() {
      load(
        path.resolve(
          'src/features/barbershop-operation/presentation/operation-context.tsx',
        ),
      ).useOperation();
      return React.createElement('span', null, 'private operation');
    }
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
          ? {
              View: ({ children }) =>
                React.createElement('div', null, children),
              Text: ({ children }) =>
                React.createElement('span', null, children),
              Pressable: ({ children }) =>
                React.createElement('button', null, children),
              Platform: { OS: 'android' },
              StyleSheet: { create: (s) => s },
            }
          : n.endsWith('/booking-request-id')
            ? { bookingRequestId: () => 'fixture-request' }
            : n === 'expo-router'
              ? { useRouter: () => ({ push() {} }) }
              : n.includes('use-registration')
                ? {
                    useRegistration: () => ({
                      state,
                      configured,
                      callbackError: null,
                    }),
                  }
                : n.endsWith('/booking-screen')
                  ? { BookingScreen: screen }
                  : n.endsWith('/my-reservations-screen')
                    ? { MyReservationsScreen: screen }
                    : n.endsWith('/operation-screen')
                      ? { OperationScreen: operation }
                      : n.startsWith('.')
                        ? load(path.resolve(path.dirname(file), n))
                        : require(n),
      module,
      module.exports,
    );
    return module.exports;
  }
  const { BookingContext } = load(
    path.resolve('src/features/reservations/presentation/booking-context.tsx'),
  );
  const { OperationContext } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/operation-context.tsx',
    ),
  );
  const { BookingRoute } = load(
    path.resolve('src/composition/booking-route.tsx'),
  );
  const { OperationRoute } = load(
    path.resolve('src/composition/operation-route.tsx'),
  );
  const application = {
    subscribe: () => () => {},
    getSnapshot: () => ({ label: 'own verified reservations' }),
  };
  return {
    set(kind, ready = true) {
      configured = ready;
      state =
        kind === 'ready'
          ? {
              kind,
              identity: { userId: 'fixture' },
              generation: 1,
              context: { kind: 'none' },
            }
          : { kind };
    },
    setContext(context) {
      configured = true;
      state = {
        kind: 'ready',
        identity: { userId: 'fixture' },
        generation: 1,
        context,
      };
    },
    render(page, provided = false) {
      return renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: provided ? application : null },
          React.createElement(
            OperationContext.Provider,
            { value: provided ? {} : null },
            page === 'services' || page === 'barbershop-admin'
              ? React.createElement(OperationRoute, { page })
              : React.createElement(BookingRoute, { page }),
          ),
        ),
      );
    },
  };
}
test('Android shop management does not mount creation while context is pending or failed', () => {
  const f = fixture();
  for (const context of [
    { kind: 'resolving' },
    { kind: 'error', error: 'provider-unavailable' },
  ]) {
    f.setContext(context);
    const html = f.render('barbershop-admin', true);
    assert.doesNotMatch(html, /private operation|Crear mi barbería/);
    assert.match(html, /Actualizando|No se pudo actualizar/);
  }
});
for (const page of ['booking', 'my-reservations', 'services']) {
  test(`${page}: direct/F5/query entry waits for runtime and verified session`, () => {
    const f = fixture();
    // Query strings do not affect provider lifetime or the page selected by Expo Router.
    for (const entry of ['direct', 'F5', '?utm_source=fixture']) {
      f.set('resolving', false);
      assert.doesNotThrow(() => f.render(page));
      assert.equal(f.render(page), '', entry);
      f.set('resolving');
      assert.equal(f.render(page, true), '');
      f.set('ready');
      assert.equal(f.render(page, false), '');
      assert.match(
        f.render(page, true),
        /private operation|own verified reservations/,
      );
    }
  });
  test(`${page}: normal navigation/resume works; logout and revocation never mount consumers`, () => {
    const f = fixture();
    f.set('ready');
    assert.ok(f.render(page, true));
    for (const kind of [
      'resolving',
      'retryable-error',
      'signed-out',
      'recovery',
    ]) {
      f.set(kind);
      assert.equal(f.render(page, true), '');
    }
    f.set('ready');
    assert.ok(f.render(page, true));
  });
}
