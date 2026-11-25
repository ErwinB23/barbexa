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
test('root mounts the real Expo Protected boundary for account and preserves public routes', () => {
  let state = { kind: 'signed-out' },
    callbackError = null;
  const Protected = () => null,
    Stack = () => null;
  Stack.Protected = Protected;
  Stack.Screen = function Screen() {
    return null;
  };
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/app/_layout.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const policy = fixture().load(
    path.resolve(
      'src/features/authentication/presentation/navigation-policy.ts',
    ),
  );
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) =>
      n === 'expo-router'
        ? { Stack }
        : n === 'react-native'
          ? { View: () => null }
          : n.includes('use-registration')
            ? { useRegistration: () => ({ state, callbackError }) }
            : n.includes('navigation-policy')
              ? policy
              : n.startsWith('@/')
                ? {}
                : require(n),
    module,
    module.exports,
  );
  for (const kind of [
    'signed-out',
    'resolving',
    'profile-required',
    'recovery',
    'retryable-error',
    'ready',
  ]) {
    state = { kind, error: 'network-unavailable' };
    const tree = module.exports.SessionNavigator();
    const stack = React.Children.toArray(tree.props.children)[0];
    const children = React.Children.toArray(stack.props.children);
    assert.equal(
      children.find((c) => c.type === Protected).props.guard,
      ['ready', 'resolving', 'retryable-error'].includes(kind),
    );
    for (const name of ['index', 'technical', '+not-found'])
      assert.ok(children.some((c) => c.props.name === name));
  }
  callbackError = 'link-invalid';
  assert.equal(
    React.Children.toArray(
      React.Children.toArray(
        module.exports.SessionNavigator().props.children,
      )[0].props.children,
    ).find((c) => c.type === Protected).props.guard,
    false,
  );
});
function fixture(sessionState) {
  let retries = 0;
  const observed = [];
  const cache = new Map();
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
    Platform: { OS: 'android' },
    StyleSheet: { create: (s) => s },
  };
  function load(file) {
    if (!['.ts', '.tsx'].includes(path.extname(file)))
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
    const resolve = (n) =>
      n === './use-registration' && sessionState
        ? {
            useRegistration: () => ({
              state: sessionState,
              application: {
                restoreAndVerify: async () => {
                  retries++;
                },
              },
            }),
          }
        : n === 'react-native'
          ? rn
          : n === 'react-native-safe-area-context'
            ? { SafeAreaView: primitive('SafeAreaView') }
            : n.startsWith('.')
              ? load(path.resolve(path.dirname(file), n))
              : require(n);
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      resolve,
      module,
      module.exports,
    );
    return module.exports;
  }
  return {
    observed,
    retries: () => retries,
    load,
    render(Component, props) {
      observed.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
  };
}
test('startup feedback visibly covers the measured navigator and provides a working safe retry', async () => {
  for (const state of [
    { kind: 'resolving' },
    { kind: 'retryable-error', error: 'network-unavailable' },
    { kind: 'retryable-error', error: 'provider-unavailable' },
  ]) {
    const f = fixture(state);
    const { SessionFeedback } = f.load(
      path.resolve(
        'src/features/authentication/presentation/account-screen.tsx',
      ),
    );
    const html = f.render(SessionFeedback, {});
    assert.ok(
      html.includes(
        state.kind === 'resolving'
          ? 'Verificando sesión'
          : 'No se pudo verificar',
      ),
    );
    assert.ok(
      f.observed.some(
        (x) =>
          x.kind === 'View' &&
          x.props.style?.position === 'absolute' &&
          x.props.style.top === 0 &&
          x.props.style.bottom === 0,
      ),
    );
    assert.ok(f.observed.some((x) => x.kind === 'SafeAreaView'));
    if (state.kind !== 'resolving') {
      const retry = f.observed.find(
        (x) =>
          x.kind === 'Pressable' &&
          x.props.accessibilityLabel === 'Reintentar sesión',
      );
      assert.ok(retry);
      retry.props.onPress();
      await Promise.resolve();
      assert.equal(f.retries(), 1);
    }
  }
});
test('direct routes return intents roles and account IDs cannot bypass the session guard', () => {
  const f = fixture();
  const { canEnterAccount, safeReturnIntent } = f.load(
    path.resolve(
      'src/features/authentication/presentation/navigation-policy.ts',
    ),
  );
  for (const state of [
    { kind: 'signed-out' },
    { kind: 'resolving' },
    { kind: 'recovery' },
    { kind: 'profile-required' },
    { kind: 'retryable-error' },
  ])
    assert.equal(canEnterAccount(state), false);
  assert.equal(canEnterAccount({ kind: 'ready' }), true);
  for (const input of [
    'https://external.invalid',
    '//external.invalid',
    '/account?role=administrator',
    '/account?userId=other',
    undefined,
    ['/account'],
  ])
    assert.equal(safeReturnIntent(input), '/account');
  assert.equal(safeReturnIntent('/account'), '/account');
});
test('login form has real accessible password inputs and disables duplicate submissions while busy', () => {
  const f = fixture();
  const { SignInForm } = f.load(
    path.resolve('src/features/authentication/presentation/sign-in-screen.tsx'),
  );
  f.render(SignInForm, {
    email: '',
    password: '',
    busy: true,
    error: null,
    notice: null,
    onEmail() {},
    onPassword() {},
    onSubmit() {},
    onRegister() {},
    onHome() {},
    onRetryCleanup: null,
  });
  assert.equal(f.observed.filter((x) => x.kind === 'TextInput').length, 2);
  assert.ok(
    f.observed
      .filter((x) => x.kind === 'TextInput')
      .every((x) => x.props.editable === false),
  );
  assert.ok(
    f.observed.some((x) => x.kind === 'TextInput' && x.props.secureTextEntry),
  );
  assert.equal(
    f.observed.find(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Iniciar sesión',
    ).props.disabled,
    true,
  );
});
test('account content never renders an unverified or incomplete state and exposes accessible logout only when ready', () => {
  const f = fixture();
  const { AccountContent } = f.load(
    path.resolve('src/features/authentication/presentation/account-screen.tsx'),
  );
  const profile = { displayName: 'Private own profile', phone: null };
  for (const kind of [
    'signed-out',
    'resolving',
    'recovery',
    'profile-required',
    'retryable-error',
  ]) {
    const html = f.render(AccountContent, {
      state: { kind, error: 'network-unavailable' },
      onSignOut() {},
      onHome() {},
    });
    assert.ok(!html.includes(profile.displayName));
    assert.ok(
      !f.observed.some(
        (x) =>
          x.kind === 'Pressable' &&
          x.props.accessibilityLabel === 'Cerrar sesión en este dispositivo',
      ),
    );
  }
  let exits = 0;
  const html = f.render(AccountContent, {
    state: { kind: 'ready', profile },
    onSignOut() {
      exits++;
    },
    onHome() {},
  });
  assert.ok(html.includes(profile.displayName));
  f.observed
    .find(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Cerrar sesión en este dispositivo',
    )
    .props.onPress();
  assert.equal(exits, 1);
});
