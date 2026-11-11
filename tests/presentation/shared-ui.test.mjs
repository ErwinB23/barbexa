import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const nativeRequire = createRequire(import.meta.url);
const observed = [];
function primitive(kind) {
  return function NativePrimitive(props) {
    observed.push({ kind, props });
    return React.createElement('div', null, props.children);
  };
}
const rn = {
  View: primitive('View'),
  Text: primitive('Text'),
  Pressable: primitive('Pressable'),
  ScrollView: primitive('ScrollView'),
  StyleSheet: { create: (styles) => styles },
};
const cache = new Map();
function load(file) {
  if (!path.extname(file)) {
    const resolved = ['.ts', '.tsx']
      .map((ext) => file + ext)
      .find(fs.existsSync);
    assert.ok(resolved, `Módulo requerido ausente: ${file}`);
    file = resolved;
  }
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const require = (name) => {
    if (name === 'react-native') return rn;
    if (name === 'react-native-safe-area-context')
      return { SafeAreaView: primitive('SafeAreaView') };
    if (name.startsWith('@/'))
      return load(path.join(root, 'src', name.slice(2)));
    if (name.startsWith('.'))
      return load(path.resolve(path.dirname(file), name));
    return nativeRequire(name);
  };
  vm.runInNewContext(
    `(function(require,module,exports){${code}\n})`,
    {},
    { filename: file },
  )(require, module, module.exports);
  return module.exports;
}
const ui = (name) => load(path.join(root, 'src/shared/ui', name));
function render(Component, props) {
  observed.length = 0;
  return renderToStaticMarkup(React.createElement(Component, props));
}

test('StatusMessage: cuatro estados legibles, avisos controlados y recuperación accesible', () => {
  const { StatusMessage } = ui('status-message');
  let retries = 0;
  for (const state of ['loading', 'empty', 'error', 'success']) {
    const html = render(StatusMessage, {
      state,
      message: `Mensaje ${state}`,
      onRetry: () => {
        retries++;
      },
    });
    assert.ok(html.includes(`Mensaje ${state}`));
    const text = observed.find((o) => o.kind === 'Text');
    assert.equal(text.props.accessibilityLiveRegion, 'polite');
    assert.equal(text.props.accessibilityState.busy, state === 'loading');
    const button = observed.find((o) => o.kind === 'Pressable');
    assert.equal(Boolean(button), state === 'error');
    if (button) {
      assert.equal(button.props.accessibilityRole, 'button');
      assert.equal(button.props.accessibilityLabel, 'Reintentar');
      button.props.onPress();
    }
    render(StatusMessage, {
      state,
      message: 'Muestra',
      announce: false,
      onRetry: () => {},
    });
    assert.equal(
      observed.find((o) => o.kind === 'Text').props.accessibilityLiveRegion,
      'none',
    );
  }
  assert.equal(retries, 1);
});

test('AppButton: área mínima 48, disabled anunciado y contraste de foco interior', () => {
  const { AppButton } = ui('app-button');
  render(AppButton, { label: 'Continuar', disabled: true, onPress: () => {} });
  const button = observed.find((o) => o.kind === 'Pressable').props;
  assert.equal(button.accessibilityLabel, 'Continuar');
  assert.equal(button.accessibilityRole, 'button');
  assert.equal(button.accessibilityState.disabled, true);
  assert.equal(button.disabled, true);
  const styles = button.style({ pressed: false }).filter(Boolean);
  assert.ok(styles[0].minHeight >= 48 && styles[0].minWidth >= 48);
  assert.equal(styles[0].height, undefined);
  assert.equal(button.style({ pressed: true }).filter(Boolean).length, 2); // disabled no cambia al pulsar
});

test('AppText y Screen: escala sin límite, sin truncado, scroll y zonas seguras', () => {
  const { AppText } = ui('app-text');
  render(AppText, { variant: 'title', children: 'Título' });
  const text = observed.find((o) => o.kind === 'Text').props;
  assert.equal(text.allowFontScaling, true);
  assert.equal(text.maxFontSizeMultiplier, 0);
  assert.equal(text.numberOfLines, undefined);
  assert.equal(text.accessibilityRole, 'header');
  render(ui('screen').Screen, { children: 'Contenido' });
  assert.ok(observed.some((o) => o.kind === 'SafeAreaView'));
  assert.ok(observed.some((o) => o.kind === 'ScrollView'));
});

test('Bienvenida y recuperación conservan sus acciones con componentes definitivos', () => {
  for (const [name, callback, label] of [
    ['welcome-screen', 'onOpenTechnical', 'Ver base técnica'],
    ['not-found-screen', 'onGoHome', 'Volver al inicio'],
  ]) {
    const exports = load(
      path.join(root, 'src/features/foundation/presentation', name),
    );
    const Component = Object.values(exports)[0];
    let calls = 0;
    render(Component, {
      [callback]: () => {
        calls++;
      },
    });
    const button = observed.find((o) => o.kind === 'Pressable').props;
    assert.equal(button.accessibilityLabel, label);
    button.onPress();
    assert.equal(calls, 1);
  }
});
