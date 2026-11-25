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
test('router cleanup waits for PKCE capture and initialized navigation, then clears router params without canje or redirect authority', () => {
  const effects = [],
    replacements = [];
  let capturedReturn = null,
    navigationReady = false,
    params = { code: 'synthetic' };
  const module = { exports: {} };
  const file =
    'src/features/authentication/presentation/use-clean-auth-return.ts';
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (name) =>
      name === 'react'
        ? { useEffect: (effect) => effects.push(effect) }
        : name === 'expo-router'
          ? {
              useRouter: () => ({ replace: (path) => replacements.push(path) }),
              useLocalSearchParams: () => params,
              useRootNavigationState: () =>
                navigationReady ? { key: 'mounted' } : undefined,
            }
          : { useRegistration: () => ({ capturedReturn, configured: true }) },
    module,
    module.exports,
  );
  const run = () => {
    module.exports.useCleanAuthReturn('/auth/reset-password');
    effects.splice(0).forEach((f) => f());
  };
  run();
  assert.deepEqual(replacements, []);
  capturedReturn = '/auth/reset-password';
  run();
  assert.deepEqual(replacements, []);
  navigationReady = true;
  run();
  assert.deepEqual(replacements, ['/auth/reset-password']);
  params = {};
  run();
  assert.equal(replacements.length, 1);
});
function fixture(platform) {
  const seen = [],
    cache = new Map();
  let authState = { kind: 'signed-out' },
    callbackError = null;
  const Stack = () => null;
  Stack.Screen = function Screen() {
    return null;
  };
  const router = { push() {} };
  const primitive = (kind) =>
    function Primitive(props) {
      seen.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive('View'),
    Text: primitive('Text'),
    Pressable: primitive('Pressable'),
    TextInput: primitive('TextInput'),
    ScrollView: primitive('ScrollView'),
    Platform: { OS: platform },
    StyleSheet: { create: (s) => s },
    useWindowDimensions: () => ({
      width: platform === 'web' ? 1280 : 390,
      height: 844,
    }),
  };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.ts', '.tsx'].map((e) => file + e).find(fs.existsSync) ?? file;
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
          ? rn
          : n === 'expo-router'
            ? {
                Stack,
                Redirect: () => null,
                useRouter: () => router,
                usePathname: () => '/my-reservations',
              }
            : n.endsWith('/use-registration')
              ? { useRegistration: () => ({ state: authState, callbackError }) }
              : n === 'react-native-safe-area-context'
                ? { SafeAreaView: primitive('SafeAreaView') }
                : n.startsWith('@/')
                  ? load(path.resolve('src', n.slice(2)))
                  : n.startsWith('.')
                    ? load(path.resolve(path.dirname(file), n))
                    : require(n),
      module,
      module.exports,
    );
    return module.exports;
  }
  return {
    load: (f) => load(path.resolve(f)),
    seen,
    setAuth(value, error = null) {
      authState = value;
      callbackError = error;
    },
    render(Component, props) {
      seen.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
  };
}
for (const platform of ['web', 'android']) {
  test(`${platform}: shared controls distinguish secondary/destructive/selected actions without shrinking touch targets`, () => {
    const f = fixture(platform),
      { AppButton } = f.load('src/shared/ui/app-button.tsx');
    for (const variant of ['primary', 'secondary', 'ghost', 'danger']) {
      f.render(AppButton, {
        label: 'Acción',
        variant,
        selected: true,
        compact: true,
        onPress() {},
      });
      const button = f.seen.find((x) => x.kind === 'Pressable').props;
      assert.equal(
        platform === 'web'
          ? button['aria-pressed']
          : button.accessibilityState.selected,
        true,
      );
      assert.equal(button.accessibilityRole, 'button');
      const styles = button.style({ pressed: false }).filter(Boolean);
      assert.ok(styles[0].minHeight >= 48);
      assert.ok(styles.every((s) => s.height === undefined));
      const text = f.seen.find((x) => x.kind === 'Text').props;
      assert.equal(text.allowFontScaling, true);
      assert.equal(text.numberOfLines, undefined);
    }
  });
  test(`${platform}: form and business layouts have bounded readable widths; page headings remain semantic`, () => {
    const f = fixture(platform),
      { Screen } = f.load('src/shared/ui/screen.tsx');
    f.render(Screen, { width: 'form', children: 'Formulario' });
    const styles = f.seen.find((x) => x.kind === 'ScrollView').props
      .contentContainerStyle;
    assert.ok(Array.isArray(styles));
    assert.ok(styles.some((s) => s?.maxWidth === 520));
    const { PageHeader } = f.load('src/shared/ui/page-header.tsx');
    const html = f.render(PageHeader, {
      title: 'Reserva tu cita',
      subtitle: 'Elige tu horario',
    });
    assert.match(html, /Reserva tu cita/);
    assert.ok(
      f.seen.some(
        (x) => x.kind === 'Text' && x.props.accessibilityRole === 'header',
      ),
    );
  });
  test(`${platform}: account navigation preserves contextual permissions and never renders identity during verification`, () => {
    const f = fixture(platform),
      { AccountNavigation } = f.load(
        'src/features/authentication/presentation/account-navigation.tsx',
      );
    const state = {
      kind: 'ready',
      profile: { displayName: '<script>unsafe</script>' },
      context: {
        kind: 'selected',
        barbershop: { name: 'A' },
        context: { role: 'barber' },
      },
    };
    const nav = [];
    const props = {
      state,
      path: '/agenda',
      wide: platform === 'web',
      onNavigate: (value) => nav.push(value),
    };
    const html = f.render(AccountNavigation, props);
    assert.match(html, /Agenda/);
    assert.ok(!html.includes('Administrar barbería'));
    const button = f.seen.find(
      (x) => x.kind === 'Pressable' && x.props.accessibilityLabel === 'Agenda',
    );
    assert.equal(
      platform === 'web'
        ? button.props['aria-pressed']
        : button.props.accessibilityState.selected,
      true,
    );
    button.props.onPress();
    assert.deepEqual(nav, []); // Current destination never grows the back stack.
    f.seen
      .find(
        (x) =>
          x.kind === 'Pressable' && x.props.accessibilityLabel === 'Reservar',
      )
      .props.onPress();
    assert.deepEqual(nav, ['/booking']);
    assert.equal(
      f.render(AccountNavigation, { ...props, state: { kind: 'resolving' } }),
      '',
    );
    assert.equal(
      f.render(AccountNavigation, { ...props, state: { kind: 'signed-out' } }),
      '',
    );
    const noMembership = f.render(AccountNavigation, {
      ...props,
      state: { ...state, context: { kind: 'none' } },
    });
    assert.ok(!noMembership.includes('Agenda'));
    const { AccountContent } = f.load(
      'src/features/authentication/presentation/account-screen.tsx',
    );
    const account = f.render(AccountContent, {
      state,
      onSignOut() {},
      onHome() {},
    });
    assert.ok(account.includes('&lt;script&gt;unsafe&lt;/script&gt;'));
    assert.ok(!account.includes('<script>'));
  });
  test(`${platform}: home prioritizes real access and booking over technical information`, () => {
    const f = fixture(platform),
      { WelcomeScreen } = f.load(
        'src/features/foundation/presentation/welcome-screen.tsx',
      );
    const html = f.render(WelcomeScreen, {
      onOpenSession() {},
      onRegister() {},
      onOpenTechnical() {},
    });
    assert.ok(!html.includes('Estamos preparando'));
    const buttons = f.seen
      .filter((x) => x.kind === 'Pressable')
      .map((x) => x.props.accessibilityLabel);
    assert.equal(buttons[0], 'Iniciar sesión');
    assert.equal(buttons.at(-1), 'Ver base técnica');
  });
  test(`${platform}: responsive account shell retains the same stack during verification and redirects only when access is rejected`, () => {
    const f = fixture(platform),
      { default: AccountLayout } = f.load('src/app/(account)/_layout.tsx');
    const ready = {
      kind: 'ready',
      profile: { displayName: 'Test' },
      context: { kind: 'none' },
    };
    f.setAuth(ready);
    const active = AccountLayout();
    f.setAuth({ kind: 'resolving' });
    const verifying = AccountLayout();
    assert.equal(active.type, verifying.type);
    assert.equal(active.props.children.type, verifying.props.children.type);
    const content = (element) => element.type(element.props).props.children[1];
    assert.equal(content(active).type, content(verifying).type);
    assert.equal(
      content(active).props.children.type,
      content(verifying).props.children.type,
    );
    assert.equal(
      content(active).props.children.key,
      content(verifying).props.children.key,
    );
    f.setAuth({ kind: 'signed-out' });
    assert.equal(AccountLayout().props.href, '/sign-in');
    f.setAuth(ready, 'link-invalid');
    assert.equal(AccountLayout().props.href, '/sign-in');
  });
}
