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
function fixture(platform) {
  const observed = [],
    cache = new Map();
  const primitive = (kind) =>
    function Component(props) {
      observed.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive('View'),
    Text: primitive('Text'),
    TextInput: primitive('TextInput'),
    Pressable: primitive('Pressable'),
    ScrollView: primitive('ScrollView'),
    StyleSheet: { create: (s) => s },
    Platform: { OS: platform },
  };
  function load(file) {
    if (!path.extname(file))
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
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
          ? rn
          : n === 'react-native-safe-area-context'
            ? { SafeAreaView: primitive('SafeAreaView') }
            : n.startsWith('.')
              ? load(path.resolve(path.dirname(file), n))
              : require(n),
      m,
      m.exports,
    );
    return m.exports;
  }
  return {
    load,
    observed,
    render(component, props) {
      observed.length = 0;
      return renderToStaticMarkup(React.createElement(component, props));
    },
  };
}
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' Google CTA is accessible, prevents repeat/disabled use and offers cancellation',
    () => {
      const f = fixture(platform),
        { GoogleAccessContent } = f.load(
          path.resolve(
            'src/features/authentication/presentation/google-access.tsx',
          ),
        );
      let starts = 0,
        cancels = 0;
      const props = {
        enabled: true,
        pending: false,
        busy: false,
        error: null,
        onBegin() {
          starts++;
        },
        onCancel() {
          cancels++;
        },
      };
      f.render(GoogleAccessContent, props);
      f.observed
        .find((c) => c.props.accessibilityLabel === 'Continuar con Google')
        .props.onPress();
      assert.equal(starts, 1);
      const html = f.render(GoogleAccessContent, { ...props, enabled: false });
      assert.ok(html.includes('pendiente de configuración'));
      f.observed
        .find((c) => c.props.accessibilityLabel === 'Continuar con Google')
        .props.onPress?.();
      assert.equal(starts, 1);
      f.render(GoogleAccessContent, { ...props, pending: true });
      assert.ok(
        !f.observed.some(
          (c) => c.props.accessibilityLabel === 'Continuar con Google',
        ),
      );
      f.observed
        .find(
          (c) => c.props.accessibilityLabel === 'Cancelar acceso con Google',
        )
        .props.onPress();
      assert.equal(cancels, 1);
      f.render(GoogleAccessContent, { ...props, pending: true, busy: true });
      f.observed
        .find(
          (c) => c.props.accessibilityLabel === 'Cancelar acceso con Google',
        )
        .props.onPress?.();
      assert.equal(cancels, 1);
    },
  );
  test(
    platform +
      ' login and signup retain email controls alongside injected Google action',
    () => {
      const f = fixture(platform);
      const { SignInForm } = f.load(
        path.resolve(
          'src/features/authentication/presentation/sign-in-screen.tsx',
        ),
      );
      const { SignUpForm } = f.load(
        path.resolve(
          'src/features/authentication/presentation/sign-up-screen.tsx',
        ),
      );
      const shared = {
        busy: false,
        error: null,
        onSubmit() {},
        onHome() {},
        googleAccess: React.createElement('div', null, 'Google-control'),
      };
      const login = f.render(SignInForm, {
        ...shared,
        email: '',
        password: '',
        notice: null,
        onEmail() {},
        onPassword() {},
        onRegister() {},
        onRetryCleanup: null,
      });
      assert.ok(login.includes('Google-control'));
      assert.equal(f.observed.filter((c) => c.kind === 'TextInput').length, 2);
      const signup = f.render(SignUpForm, {
        ...shared,
        values: { displayName: '', email: '', password: '', phone: '' },
        confirmation: '',
        onChange() {},
        onConfirmation() {},
      });
      assert.ok(signup.includes('Google-control'));
      assert.equal(f.observed.filter((c) => c.kind === 'TextInput').length, 5);
    },
  );
}
