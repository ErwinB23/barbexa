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
test('new password rules count Unicode code points and require Supabase character classes', () => {
  const { passwordChecks, newPasswordProblem } = load(
    path.resolve('src/features/authentication/domain/password-policy.ts'),
  );
  for (const [password, rule] of [
    ['Aa1!xyz', 'length'],
    ['aa1!xyzz', 'uppercase'],
    ['AA1!XYZZ', 'lowercase'],
    ['AaB!xyzz', 'number'],
    ['Aa1 xyz🙂', 'symbol'],
  ])
    assert.deepEqual(
      Object.keys(passwordChecks(password)).filter(
        (key) => !passwordChecks(password)[key],
      ),
      [rule],
    );
  for (const value of ['Aa1!xyzz', 'Aa1:xyñ🙂', 'Aa1\\xyñ🙂'])
    assert.equal(newPasswordProblem(value, value), null);
  assert.equal(newPasswordProblem('Aa1!é🙂x', 'Aa1!é🙂x'), 'weak-password');
  assert.equal(
    newPasswordProblem('Aa1!xyéz', 'Aa1!xye\u0301z'),
    'password-mismatch',
  );
});
function load(file, react = React) {
  if (!['.tsx', '.ts'].includes(path.extname(file)))
    file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
  const m = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext('(function(require,module,exports){' + code + '})', {})(
    (n) =>
      n === 'react'
        ? react
        : n.startsWith('.')
          ? load(path.resolve(path.dirname(file), n))
          : require(n),
    m,
    m.exports,
  );
  return m.exports;
}
test('Web registration renders all fields and updates accessible indicators when a password is pasted', () => {
  const file = path.resolve(
    'src/features/authentication/presentation/sign-up-form.web.tsx',
  );
  const signupProps = {
    values: {
      displayName: 'Prueba',
      email: 'test@example.invalid',
      phone: '',
      password: '',
    },
    busy: false,
    error: null,
    onHome() {},
    onChange() {},
    confirmation: '',
    onConfirmation() {},
    onSubmit() {},
  };
  const { SignUpForm } = load(file);
  const form = renderToStaticMarkup(
    React.createElement(SignUpForm, signupProps),
  );
  assert.equal((form.match(/Pendiente/g) ?? []).length, 5);
  assert.doesNotMatch(form, / · Pendiente|○|✓/);
  assert.match(form, /aria-describedby="signup-password-requirements"/);
  const { AuthWebField } = load(
    path.resolve('src/features/authentication/presentation/auth-web-field.tsx'),
    { ...React, useState: (initial) => [initial, () => {}] },
  );
  const value = 'Paste#12';
  const field = AuthWebField({
    id: 'paste-test',
    label: 'Contraseña',
    icon: 'lock',
    value: '',
    busy: false,
    type: 'password',
    autoComplete: 'new-password',
    change: (password) => {
      signupProps.values.password = password;
    },
  });
  const input = React.Children.toArray(
    field.props.children.props.children,
  ).find((child) => child.type === 'input');
  input.props.onChange({ target: { value } });
  assert.equal(signupProps.values.password, value);
  const html = renderToStaticMarkup(
    React.createElement(SignUpForm, signupProps),
  );
  assert.equal((html.match(/Cumplido/g) ?? []).length, 5);
  assert.equal((html.match(/✓/g) ?? []).length, 5);
  assert.doesNotMatch(html, / · Cumplido/);
  assert.match(html, /Recomendamos 12 caracteres o más/);
  assert.equal((html.match(/<input /g) ?? []).length, 5);
  for (const [field, label] of [
    ['name', 'Nombre visible'],
    ['email', 'Correo electrónico'],
    ['phone', 'Teléfono (opcional)'],
    ['password', 'Contraseña'],
    ['confirmation', 'Confirmar contraseña'],
  ]) {
    const id = `sign-up-${field}`;
    const shell = [
      ...html.matchAll(
        /<div class="ab-login__input-shell ab-login__floating-field">(.*?)<\/div>/gs,
      ),
    ]
      .map((match) => match[1])
      .find((content) => content.includes(`id="${id}"`));
    assert.ok(shell, `floating label shell for ${id}`);
    assert.ok(shell.includes(`<label for="${id}">${label}</label>`));
    assert.match(shell, /<input[^>]+placeholder=" "[^>]*>\s*<label/);
    assert.match(shell, /<svg/);
  }
  assert.match(html, /aria-controls="sign-up-password"/);
  assert.match(html, /aria-controls="sign-up-confirmation"/);
  assert.match(html, /href="\/sign-in"/);
});
const props = {
  email: '',
  password: '',
  busy: false,
  error: null,
  notice: null,
  onEmail() {},
  onPassword() {},
  onSubmit() {},
  onRegister() {},
  onHome() {},
  onForgotPassword() {},
  onRetryCleanup: null,
  googleAccess: React.createElement('button', null, 'Google injected'),
};
test('Outfit is locally hosted and scoped to the form card, preserving the brand and left typography', () => {
  const { loginWebStyles: css } = load(
    path.resolve(
      'src/features/authentication/presentation/sign-in-web.styles.ts',
    ),
  );
  const rule = (selector) =>
    css.slice(css.indexOf(selector + ' {')).split('}')[0];
  assert.match(rule('.ab-login__card'), /font-family: "Outfit"/);
  assert.match(rule('.ab-login'), /font-family: Arial/);
  assert.match(rule('.ab-login__brand span'), /Georgia/);
  assert.match(rule('.ab-login__card h1'), /font-weight: 800/);
  assert.match(rule('.ab-login__field label'), /font-weight: 600/);
  assert.match(css, /url\("\/fonts\/outfit\/Outfit-Variable.ttf"\)/);
  assert.equal(
    fs
      .readFileSync('public/fonts/outfit/Outfit-Variable.ttf')
      .subarray(0, 4)
      .toString('hex'),
    '00010000',
  );
});
function web() {
  return load(
    path.resolve(
      'src/features/authentication/presentation/sign-in-form.web.tsx',
    ),
  );
}
test('email has one accessible floating label inside the input shell and retains its mail icon', () => {
  const { SignInForm } = web();
  const html = renderToStaticMarkup(React.createElement(SignInForm, props));
  assert.equal((html.match(/for="login-email"/g) ?? []).length, 1);
  assert.ok(!html.includes('tu@correo.com'));
  const field = html.match(
    /<div class="ab-login__input-shell ab-login__floating-field">(.*?)<\/div>/s,
  )?.[1];
  assert.ok(field, 'floating email shell exists');
  assert.match(field, /<svg/);
  assert.match(field, /<input[^>]+placeholder=" "/);
  assert.match(
    field,
    /<label[^>]+for="login-email"[^>]*>Correo electrónico<\/label>/,
  );
});
test('password has a floating label, lock and visibility toggle with accessible animated labels', () => {
  const { SignInForm } = web();
  const html = renderToStaticMarkup(React.createElement(SignInForm, props));
  const field = [
    ...html.matchAll(
      /<div class="ab-login__input-shell ab-login__floating-field">(.*?)<\/div>/gs,
    ),
  ]
    .map((match) => match[1])
    .find((content) => content.includes('id="login-password"'));
  assert.ok(field, 'password floating field exists');
  assert.equal((html.match(/for="login-password"/g) ?? []).length, 1);
  assert.match(field, /placeholder=" "/);
  assert.match(field, /<svg/);
  assert.match(field, /aria-label="Mostrar contraseña"/);
  const { loginWebStyles: css } = load(
    path.resolve(
      'src/features/authentication/presentation/sign-in-web.styles.ts',
    ),
  );
  assert.match(css, /top 220ms/);
  assert.match(css, /left 220ms/);
  assert.match(css, /padding-top: 28px/);
  const raised = css
    .slice(css.indexOf('.ab-login__floating-field:focus-within label,'))
    .split('}')[0];
  assert.match(raised, /top: -18px/);
  assert.match(raised, /left: -2px/);
  assert.match(raised, /background: transparent/);
  assert.match(css, /font-size: 14px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /transition: none/);
});
test('Web login uses the approved copy, semantic real fields and existing navigation destinations', () => {
  const { SignInForm, signInHeaderOptions } = web();
  const html = renderToStaticMarkup(React.createElement(SignInForm, props));
  assert.equal(signInHeaderOptions.headerShown, false);
  for (const text of [
    'Bienvenido de nuevo',
    'Tu barbería, siempre contigo.',
    'Google injected',
    'Crear cuenta',
    '¿Olvidaste tu contraseña?',
  ])
    assert.ok(html.includes(text));
  assert.match(html, /<form/);
  assert.match(html, /type="email"/);
  assert.match(html, /type="password"/);
  assert.match(html, /autoComplete="current-password"/);
  assert.match(html, /autoComplete="email"/);
  assert.match(html, /for="login-email"/);
  assert.match(html, /for="login-password"/);
  assert.match(html, /href="\/forgot-password"/);
  assert.match(html, /href="\/sign-up"/);
  assert.ok(!html.includes('fonts.googleapis'));
});
test('Web login uses an independent local decorative photograph alongside the real form', () => {
  const { SignInForm } = web();
  const html = renderToStaticMarkup(React.createElement(SignInForm, props));
  assert.match(
    html,
    /<img[^>]+src="\/images\/login-barbershop-1920x1080.generated.jpg"/,
  );
  assert.match(html, /class="ab-login__photograph"[^>]+alt=""/);
  assert.match(html, /<form/);
  assert.match(html, /<input/);
  assert.match(html, /width="1920" height="1080"/);
  const photo = fs.readFileSync(
    'public/images/login-barbershop-1920x1080.generated.jpg',
  );
  assert.equal(photo.subarray(0, 3).toString('hex'), 'ffd8ff');
});
test('busy, cleanup failure and safe feedback stay visible and block duplicate actions', () => {
  const { SignInForm } = web();
  const html = renderToStaticMarkup(
    React.createElement(SignInForm, {
      ...props,
      busy: true,
      error: 'Error controlado',
      notice: 'Sesión cerrada',
      onRetryCleanup() {},
    }),
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /role="status"/);
  assert.ok(html.includes('Error controlado'));
  assert.ok(html.includes('Reintentar cierre local'));
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /disabled=""/);
});
test('Web Google presentation delegates existing begin/cancel handlers and respects disabled state', () => {
  const { GoogleLoginContent } = web();
  let begins = 0,
    cancels = 0;
  const input = {
    enabled: true,
    pending: false,
    busy: false,
    error: null,
    onBegin() {
      begins++;
    },
    onCancel() {
      cancels++;
    },
  };
  const buttons = (element) => {
    if (!element || typeof element !== 'object') return [];
    return [
      ...(element.type === 'button' ? [element] : []),
      ...React.Children.toArray(element.props?.children).flatMap(buttons),
    ];
  };
  buttons(GoogleLoginContent(input))[0].props.onClick();
  assert.equal(begins, 1);
  buttons(GoogleLoginContent({ ...input, enabled: false }))[0].props.onClick();
  assert.equal(begins, 1);
  buttons(GoogleLoginContent({ ...input, pending: true }))[0].props.onClick();
  assert.equal(cancels, 1);
});
