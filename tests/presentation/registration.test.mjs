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
function fixture({ react = React, registration, platform = 'android' } = {}) {
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
    Platform: { OS: platform },
    StyleSheet: { create: (s) => s },
  };
  function load(file) {
    if (!path.extname(file))
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
      n === 'react-native'
        ? rn
        : n === 'expo-router'
          ? { Redirect: primitive('Redirect') }
          : n === 'react'
            ? react
            : n === './use-registration' && registration
              ? { useRegistration: () => registration }
              : n.startsWith('@/')
                ? load(path.resolve('src', n.slice(2)))
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
    load,
    render(Component, props) {
      observed.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
  };
}
test('registration form uses accessible fields, safe password semantics and blocks repeat sends while busy', () => {
  const f = fixture();
  const { SignUpForm } = f.load(
    path.resolve('src/features/authentication/presentation/sign-up-screen.tsx'),
  );
  let sends = 0;
  const values = { displayName: '', email: '', phone: '', password: '' };
  f.render(SignUpForm, {
    values,
    confirmation: '',
    onConfirmation() {},
    busy: false,
    error: null,
    onChange() {},
    onSubmit() {
      sends++;
    },
    onHome() {},
  });
  const inputs = f.observed.filter((x) => x.kind === 'TextInput');
  assert.equal(inputs.length, 5);
  assert.ok(inputs.every((x) => x.props.accessibilityLabel));
  assert.equal(
    inputs.find((x) => x.props.nativeID === 'sign-up-password').props
      .secureTextEntry,
    true,
  );
  assert.equal(
    inputs.find((x) => x.props.nativeID === 'sign-up-confirmation').props
      .secureTextEntry,
    true,
  );
  assert.equal(
    f.observed.filter((x) =>
      x.props.accessibilityLabel?.endsWith('. Pendiente'),
    ).length,
    5,
  );
  const button = f.observed.find(
    (x) =>
      x.kind === 'Pressable' && x.props.accessibilityLabel === 'Crear cuenta',
  );
  button.props.onPress();
  assert.equal(sends, 1);
  f.render(SignUpForm, {
    values,
    confirmation: '',
    onConfirmation() {},
    busy: true,
    error: null,
    onChange() {},
    onSubmit() {},
    onHome() {},
  });
  assert.ok(
    f.observed
      .filter((x) => x.kind === 'TextInput')
      .every((x) => x.props.editable === false),
  );
  assert.equal(
    f.observed.find(
      (x) =>
        x.kind === 'Pressable' && x.props.accessibilityLabel === 'Crear cuenta',
    ).props.disabled,
    true,
  );
});

test('Web confirmation skips the success screen only for a ready profile without errors', () => {
  const f = fixture({ platform: 'web' });
  const { ConfirmationContent } = f.load(
    path.resolve(
      'src/features/authentication/presentation/confirm-email-screen.tsx',
    ),
  );
  const base = {
    details: { displayName: '', phone: '' },
    onDetails() {},
    onRetry() {},
    onRegister() {},
    onHome() {},
    error: null,
    canRetryProfile: false,
  };
  const ready = {
    kind: 'ready',
    identity: { userId: 'private-id' },
    profile: { displayName: 'Nombre propio', phone: null },
  };
  const html = f.render(ConfirmationContent, { ...base, state: ready });
  assert.equal(
    f.observed.find((x) => x.kind === 'Redirect')?.props.href,
    '/account',
  );
  assert.ok(!html.includes('Perfil confirmado'));
  for (const state of [
    { kind: 'resolving' },
    { kind: 'confirmation-required' },
    { kind: 'signed-out' },
    { kind: 'profile-required' },
    { kind: 'recovery' },
    { kind: 'oauth-pending' },
    { kind: 'retryable-error', error: 'network-unavailable' },
  ]) {
    f.render(ConfirmationContent, { ...base, state });
    assert.ok(!f.observed.some((x) => x.kind === 'Redirect'), state.kind);
  }
  const errorHtml = f.render(ConfirmationContent, {
    ...base,
    state: ready,
    error: 'No se pudo completar el enlace.',
  });
  assert.ok(!f.observed.some((x) => x.kind === 'Redirect'));
  assert.ok(errorHtml.includes('No se pudo completar el enlace.'));
});

test('shared registration and reset screens reject weak or mismatched input before dispatch', async () => {
  for (const [kind, pathname, exportName] of [
    ['signup', 'sign-up-screen', 'SignUpScreen'],
    ['reset', 'reset-password-screen', 'ResetPasswordScreen'],
  ]) {
    for (const [password, confirmation, expected] of [
      ['Weak1!', 'Weak1!', 'weak'],
      ['Valid#12', 'different', 'mismatch'],
      ['Valid#12', 'Valid#12', 'sent'],
    ]) {
      const calls = [],
        errors = [];
      const values = {
        displayName: 'Prueba',
        email: 'test@example.invalid',
        phone: '',
        password,
      };
      const states =
        kind === 'signup' ? [values, confirmation] : [password, confirmation];
      const f = fixture({
        react: {
          ...React,
          useState(initial) {
            return [
              states.length ? states.shift() : initial,
              (v) => errors.push(v),
            ];
          },
          useRef: (current) => ({ current }),
          useEffect() {},
        },
        registration: {
          configured: true,
          state: { kind: kind === 'reset' ? 'recovery' : 'signed-out' },
          application: {
            register: async (input) => calls.push(input),
            setRecoveredPassword: async (input) => calls.push(input),
            getSnapshot: () => ({ kind: 'confirmation-required' }),
            canRetryProfile: () => false,
          },
        },
      });
      const Screen = f.load(
        path.resolve('src/features/authentication/presentation', pathname),
      )[exportName];
      Screen({ onConfirm() {}, onLogin() {} }).props.onSubmit();
      await Promise.resolve();
      if (expected === 'sent') {
        assert.equal(calls.length, 1);
        if (kind === 'signup') {
          assert.equal(calls[0].password, password);
          assert.equal(Object.hasOwn(calls[0], 'confirmation'), false);
        } else assert.equal(calls[0], password);
      } else {
        assert.equal(calls.length, 0);
        assert.match(
          String(errors[0]),
          expected === 'weak'
            ? /weak-password|no cumple/
            : /password-mismatch|no coinciden/,
        );
      }
    }
  }
});
test('confirmation views distinguish pending, loading, profile completion, error and actual verified result', () => {
  const f = fixture();
  const { ConfirmationContent } = f.load(
    path.resolve(
      'src/features/authentication/presentation/confirm-email-screen.tsx',
    ),
  );
  const base = {
    details: { displayName: '', phone: '' },
    onDetails() {},
    onRetry() {},
    onRegister() {},
    onHome() {},
    error: null,
    canRetryProfile: false,
  };
  for (const state of [
    { kind: 'resolving' },
    { kind: 'confirmation-required' },
    { kind: 'signed-out' },
  ]) {
    const html = f.render(ConfirmationContent, { ...base, state });
    assert.ok(!html.includes('Perfil confirmado'));
  }
  f.render(ConfirmationContent, {
    ...base,
    state: { kind: 'profile-required', identity: { userId: 'not-rendered' } },
  });
  assert.equal(f.observed.filter((x) => x.kind === 'TextInput').length, 2);
  let retries = 0;
  f.render(ConfirmationContent, {
    ...base,
    state: { kind: 'retryable-error', error: 'network-unavailable' },
    canRetryProfile: true,
    onRetry() {
      retries++;
    },
  });
  f.observed
    .find(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Reintentar perfil',
    )
    .props.onPress();
  assert.equal(retries, 1);
  const html = f.render(ConfirmationContent, {
    ...base,
    state: {
      kind: 'ready',
      identity: { userId: 'never-print-this-id' },
      profile: { displayName: 'Nombre propio', phone: null },
    },
  });
  assert.ok(html.includes('Perfil confirmado'));
  assert.ok(html.includes('Nombre propio'));
  assert.ok(!html.includes('never-print-this-id'));
});
test('a profile validation error keeps the editable form and its recovery action visible', () => {
  const f = fixture();
  const { ConfirmationContent } = f.load(
    path.resolve(
      'src/features/authentication/presentation/confirm-email-screen.tsx',
    ),
  );
  f.render(ConfirmationContent, {
    state: { kind: 'profile-required', identity: { userId: 'not-rendered' } },
    error: 'Revisa el nombre.',
    canRetryProfile: true,
    details: { displayName: '', phone: '' },
    onDetails() {},
    onRetry() {},
    onRegister() {},
    onHome() {},
  });
  assert.equal(f.observed.filter((x) => x.kind === 'TextInput').length, 2);
  assert.ok(
    f.observed.some(
      (x) =>
        x.kind === 'Pressable' &&
        x.props.accessibilityLabel === 'Completar perfil',
    ),
  );
});
