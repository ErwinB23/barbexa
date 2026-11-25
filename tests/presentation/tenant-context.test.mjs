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
function fixture() {
  const nodes = [];
  const primitive = (kind) =>
    function Primitive(props) {
      nodes.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive('View'),
    Text: primitive('Text'),
    ScrollView: primitive('ScrollView'),
    Pressable: primitive('Pressable'),
    StyleSheet: { create: (s) => s },
    Platform: { OS: 'android' },
  };
  function load(file) {
    if (!['.ts', '.tsx'].includes(path.extname(file)))
      file = ['.tsx', '.ts'].map((x) => file + x).find(fs.existsSync) ?? file;
    const module = { exports: {} };
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
  return {
    load,
    nodes,
    render(Component, props) {
      nodes.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
  };
}
test('context UI exposes none loading error and recovery without inventing a global role', () => {
  const f = fixture();
  const { ContextContent } = f.load(
    path.resolve('src/features/authentication/presentation/context-screen.tsx'),
  );
  const base = { onSelect() {}, onRefresh() {}, onChoose() {}, onAccount() {} };
  for (const context of [
    { kind: 'none' },
    { kind: 'resolving' },
    { kind: 'error', error: 'network-unavailable' },
  ]) {
    const html = f.render(ContextContent, { ...base, context });
    assert.ok(!html.includes('Administrador'));
    assert.ok(!html.includes('Barbería B'));
  }
  f.render(ContextContent, { ...base, context: { kind: 'none' } });
  assert.ok(
    f.nodes.some(
      (n) =>
        n.kind === 'Pressable' &&
        n.props.accessibilityLabel === 'Actualizar barberías',
    ),
  );
});
test('selection sends only the tenant ID and changing to barber B never displays admin A privileges', () => {
  const f = fixture();
  const { ContextContent } = f.load(
    path.resolve('src/features/authentication/presentation/context-screen.tsx'),
  );
  const selected = [];
  const base = {
    onSelect: (id) => selected.push(id),
    onRefresh() {},
    onChoose() {},
    onAccount() {},
  };
  f.render(ContextContent, {
    ...base,
    context: {
      kind: 'choosing',
      memberships: [
        { id: 'one', barbershopId: 'A', role: 'administrator' },
        { id: 'two', barbershopId: 'B', role: 'barber' },
      ],
      barbershops: [
        { id: 'A', name: 'Barbería A' },
        { id: 'B', name: 'Barbería B' },
      ],
    },
  });
  f.nodes
    .find(
      (n) =>
        n.kind === 'Pressable' &&
        n.props.accessibilityLabel === 'Elegir Barbería B (Barbero)',
    )
    .props.onPress();
  assert.deepEqual(selected, ['B']);
  const html = f.render(ContextContent, {
    ...base,
    context: {
      kind: 'selected',
      barbershop: { id: 'B', name: 'Barbería B' },
      context: { barbershopId: 'B', role: 'barber' },
    },
  });
  assert.ok(html.includes('Barbero'));
  assert.ok(!html.includes('Administrador'));
  assert.ok(!html.includes('Barbería A'));
});
