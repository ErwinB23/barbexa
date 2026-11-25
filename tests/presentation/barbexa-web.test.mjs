import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import vm from 'node:vm';

const read = (path) => readFileSync(path, 'utf8');
const requireNode = createRequire(import.meta.url);
const modules = new Map();
function load(source) {
  const file = ['.web.tsx', '.tsx', '.web.ts', '.ts', '']
    .map((suffix) => source + suffix)
    .find(existsSync);
  if (modules.has(file)) return modules.get(file).exports;
  const loaded = { exports: {} };
  modules.set(file, loaded);
  const code = ts.transpileModule(read(file), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
    (name) => {
      if (name === 'expo-router')
        return {
          Link: ({ onPress, ...props }) =>
            React.createElement('a', { ...props, onClick: onPress }),
        };
      if (name === 'react-native') return requireNode('react-native-web');
      if (name === 'react-native-safe-area-context')
        return { SafeAreaView: requireNode('react-native-web').View };
      if (name.startsWith('@/'))
        return load(path.resolve('src', name.slice(2)));
      if (name.startsWith('.'))
        return load(path.resolve(path.dirname(file), name));
      return requireNode(name);
    },
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

test('premium styles require an explicit Web surface and an opt-in UI part', () => {
  const scope = read('src/shared/ui/web-surface.web.tsx');
  const css = read('src/shared/ui/web-surface.styles.ts');
  assert.match(scope, /className=.*bx-web/);
  assert.match(css, /\.bx-web \[data-bx-part='field'\]/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 52rem\)/);
  assert.doesNotMatch(css, /\bab-login\b/);
});

test('Barbexa welcome has real section anchors and only one pair of authentication links', () => {
  const { WelcomeScreen } = load(
    path.resolve('src/features/foundation/presentation/welcome-screen'),
  );
  const html = renderToStaticMarkup(
    React.createElement(WelcomeScreen, {
      onOpenSession() {},
      onRegister() {},
      onOpenTechnical() {},
    }),
  );
  assert.match(html, /Barbexa/);
  for (const section of ['inicio', 'como-funciona', 'beneficios']) {
    assert.match(html, new RegExp(`href="#${section}"`));
    assert.match(html, new RegExp(`id="${section}"`));
  }
  assert.equal((html.match(/href="\/sign-in"/g) ?? []).length, 1);
  assert.equal((html.match(/href="\/sign-up"/g) ?? []).length, 1);
  assert.match(html, /barbexa-logo\.png/);
  assert.doesNotMatch(html, /Barberos verificados|App Barbería/);
});

test('workspace renders semantic links and contextual destinations only while authorized', () => {
  const { AccountShell } = load(
    path.resolve('src/features/authentication/presentation/account-shell'),
  );
  const render = (state, current = '/account') =>
    renderToStaticMarkup(
      React.createElement(AccountShell, { state, path: current }, 'Stack'),
    );
  const ready = (context) => ({ kind: 'ready', context });
  const selected = (role) => ({
    kind: 'selected',
    context: { role },
    barbershop: { name: 'Barbería de prueba' },
  });
  const client = render(ready({ kind: 'none' }));
  assert.match(client, /<nav aria-label="Mi cuenta y reservas">/);
  assert.match(client, /href="\/account" aria-current="page"/);
  assert.match(client, /<main class="bx-main">Stack<\/main>/);
  assert.doesNotMatch(client, /href="\/staff"/);
  assert.doesNotMatch(client, /href="\/(agenda|barbershop-admin)"/);
  const barber = render(ready(selected('barber')), '/agenda');
  assert.doesNotMatch(barber, /href="\/agenda"/);
  assert.doesNotMatch(barber, /href="\/barbershop-admin"/);
  assert.doesNotMatch(
    render(ready(selected('administrator')), '/services'),
    /href="\/barbershop-admin"/,
  );
  assert.doesNotMatch(render({ kind: 'resolving' }), /<nav|Barbería de prueba/);
});

test('marked shared Web controls retain labels, heading levels and interactive states', () => {
  const { PageHeader, Section } = load(
    path.resolve('src/shared/ui/page-header'),
  );
  const { AppTextField } = load(path.resolve('src/shared/ui/app-text-field'));
  const { AppButton } = load(path.resolve('src/shared/ui/app-button'));
  const markup = renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      {},
      React.createElement(PageHeader, { title: 'Mi cuenta' }),
      React.createElement(
        Section,
        { title: 'Editar perfil' },
        React.createElement(AppTextField, {
          id: 'profile-name',
          label: 'Nombre visible',
          value: '',
          error: 'Escribe un nombre',
          onChangeText() {},
        }),
        React.createElement(AppButton, {
          label: 'Guardar perfil',
          disabled: true,
        }),
        React.createElement(AppButton, {
          label: 'Todas las citas',
          selected: true,
        }),
      ),
    ),
  );
  assert.match(markup, /<h1[^>]*>Mi cuenta<\/h1>/);
  assert.match(markup, /<h2[^>]*>Editar perfil<\/h2>/);
  assert.match(markup, /aria-label="Nombre visible"/);
  assert.match(markup, /aria-describedby="profile-name-error"/);
  assert.match(markup, /aria-invalid="true"/);
  assert.match(markup, /data-bx-part="field"/);
  assert.match(markup, /aria-label="Guardar perfil"/);
  assert.match(markup, /aria-disabled="true"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.doesNotMatch(markup, /aria-selected=/);
});

test('text, action, selected navigation and input borders meet the intended contrast ratios', () => {
  const css = read('src/shared/ui/web-surface.styles.ts');
  const rgb = (name) => {
    const value = name.startsWith('#')
      ? name
      : css.match(new RegExp(`--bx-${name}: (#[a-f0-9]{6});`))[1];
    return value.match(/[a-f0-9]{2}/g).map((hex) => parseInt(hex, 16) / 255);
  };
  const luminance = (name) =>
    rgb(name)
      .map(
        (v, i) =>
          (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][i],
      )
      .reduce((a, b) => a + b, 0);
  for (const [fg, bg, minimum] of [
    ['ink', 'canvas', 4.5],
    ['muted', 'panel', 4.5],
    ['muted', 'tint', 4.5],
    ['#ffffff', 'action', 4.5],
    ['#ffffff', 'action-dark', 4.5],
    ['rail-text', 'rail', 4.5],
    ['gold', '#3a2c21', 4.5],
    ['control', 'panel', 3],
    ['focus', 'canvas', 3],
    ['error', '#fff1ed', 4.5],
    ['success', '#edf4ec', 4.5],
  ]) {
    const [lo, hi] = [luminance(fg), luminance(bg)].sort((a, b) => a - b);
    assert.ok((hi + 0.05) / (lo + 0.05) >= minimum, `${fg} / ${bg}`);
  }
});
