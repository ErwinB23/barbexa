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
      file =
        [...(platform === 'web' ? ['.web.tsx'] : []), '.tsx', '.ts']
          .map((e) => file + e)
          .find(fs.existsSync) ?? file;
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
          ? rn
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
    load,
    observed,
    render(Component, props) {
      observed.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
  };
}
for (const platform of ['android']) {
  test(`${platform}: recovery forms are non-enumerative, accessible, busy-safe and restricted`, () => {
    const f = fixture(platform);
    const { ForgotPasswordForm } = f.load(
      path.resolve(
        'src/features/authentication/presentation/forgot-password-screen.tsx',
      ),
    );
    const html = f.render(ForgotPasswordForm, {
      email: '',
      busy: false,
      sent: true,
      error: null,
      onEmail() {},
      onSubmit() {},
      onCancel() {},
    });
    assert.match(html, /Si existe una cuenta/);
    assert.equal(
      f.observed.filter((x) => x.kind === 'TextInput')[0].props.autoComplete,
      'email',
    );
    f.render(ForgotPasswordForm, {
      email: '',
      busy: true,
      sent: false,
      error: 'Error seguro',
      onEmail() {},
      onSubmit() {},
      onCancel() {},
    });
    assert.equal(
      f.observed.find(
        (x) =>
          x.kind === 'Pressable' &&
          x.props.accessibilityLabel === 'Enviar enlace',
      ).props.disabled,
      true,
    );
    const { ResetPasswordForm } = f.load(
      path.resolve(
        'src/features/authentication/presentation/reset-password-screen.tsx',
      ),
    );
    const props = {
      allowed: true,
      busy: false,
      completed: false,
      password: '',
      confirmation: '',
      error: null,
      onPassword() {},
      onConfirmation() {},
      onSubmit() {},
      onCancel() {},
      onRequest() {},
    };
    f.render(ResetPasswordForm, props);
    const inputs = f.observed.filter((x) => x.kind === 'TextInput');
    assert.equal(inputs.length, 2);
    assert.ok(
      inputs.every(
        (x) => x.props.secureTextEntry && x.props.accessibilityLabel,
      ),
    );
    f.render(ResetPasswordForm, { ...props, allowed: false });
    assert.equal(f.observed.filter((x) => x.kind === 'TextInput').length, 0);
    const completed = f.render(ResetPasswordForm, {
      ...props,
      completed: true,
    });
    assert.match(completed, /Contraseña actualizada/);
    assert.equal(f.observed.filter((x) => x.kind === 'TextInput').length, 0);
  });
}

test('Web recovery uses the shared shell, confirms generically and offers a guarded resend', () => {
  const f = fixture('web');
  const { ForgotPasswordForm } = f.load(
    path.resolve(
      'src/features/authentication/presentation/forgot-password-screen.tsx',
    ),
  );
  const props = {
    email: 'test@example.invalid',
    busy: false,
    sent: false,
    error: null,
    onEmail() {},
    onSubmit() {},
    onCancel() {},
  };
  const request = f.render(ForgotPasswordForm, props);
  assert.match(request, /class="ab-login ab-recovery"/);
  assert.match(request, /<h1[^>]*>Recupera tu acceso/);
  assert.match(request, /<input[^>]*type="email"[^>]*placeholder=" "/);
  assert.match(request, /<label for="recovery-email">Correo electrónico/);
  assert.match(request, /type="submit"[^>]*>Enviar enlace/);
  const sent = f.render(ForgotPasswordForm, { ...props, sent: true });
  assert.match(sent, /<h1[^>]*>Revisa tu correo/);
  assert.match(sent, /Si existe una cuenta/);
  assert.match(sent, /este mismo navegador/);
  assert.match(sent, /Reenviar enlace/);
  assert.doesNotMatch(sent, /test@example\.invalid|<input/);
  const busy = f.render(ForgotPasswordForm, {
    ...props,
    sent: true,
    busy: true,
    error: 'Error seguro',
  });
  assert.match(busy, /disabled="">Reenviar enlace/);
  assert.match(busy, /role="status"/);
  assert.match(busy, /role="alert"[^>]*>Error seguro/);
});

test('Web reset only renders secure fields for a verified recovery and keeps success and invalid states distinct', () => {
  const f = fixture('web');
  const { ResetPasswordForm } = f.load(
    path.resolve(
      'src/features/authentication/presentation/reset-password-screen.tsx',
    ),
  );
  const props = {
    allowed: true,
    busy: false,
    completed: false,
    password: '',
    confirmation: '',
    error: null,
    onPassword() {},
    onConfirmation() {},
    onSubmit() {},
    onCancel() {},
    onRequest() {},
  };
  const allowed = f.render(ResetPasswordForm, props);
  assert.match(allowed, /<h1[^>]*>Establece una nueva contraseña/);
  assert.equal((allowed.match(/<input[^>]+type="password"/g) ?? []).length, 2);
  assert.match(allowed, /aria-controls="reset-password"/);
  assert.match(allowed, /aria-controls="reset-confirmation"/);
  assert.match(allowed, /Guardar nueva contraseña/);
  assert.match(allowed, /aria-describedby="reset-password-requirements"/);
  assert.equal((allowed.match(/Pendiente/g) ?? []).length, 5);
  const invalid = f.render(ResetPasswordForm, { ...props, allowed: false });
  assert.match(invalid, /Solicitar nuevo enlace/);
  assert.doesNotMatch(invalid, /<input|Guardar nueva contraseña/);
  const loading = f.render(ResetPasswordForm, {
    ...props,
    allowed: false,
    busy: true,
  });
  assert.match(loading, /role="status"/);
  assert.doesNotMatch(loading, /<input|Solicitar nuevo enlace/);
  const completed = f.render(ResetPasswordForm, {
    ...props,
    allowed: false,
    completed: true,
  });
  assert.match(completed, /<h1[^>]*>Contraseña actualizada/);
  assert.doesNotMatch(completed, /<input|Guardar nueva contraseña/);
});
