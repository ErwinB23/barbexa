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
    Platform: { OS: 'web' },
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
test('session resolution is public and retryable without showing a profile or treating network loss as logout', () => {
  const f = fixture();
  const { SessionResolutionContent } = f.load(
    path.resolve('src/features/authentication/presentation/account-screen.tsx'),
  );
  for (const kind of [
    'resolving',
    'signed-out',
    'profile-required',
    'recovery',
  ]) {
    const html = f.render(SessionResolutionContent, {
      state: { kind },
      onRetry() {},
    });
    assert.ok(!html.includes('Own private profile'));
    if (kind === 'resolving') {
      assert.match(html, /Preparando tu espacio/);
      assert.match(html, /role="status"/);
      assert.match(html, /prefers-reduced-motion/);
      assert.ok(!html.includes('Verificando sesión…'));
    } else assert.ok(!html.includes('Preparando tu espacio'));
  }
  let calls = 0;
  const html = f.render(SessionResolutionContent, {
    state: { kind: 'retryable-error', error: 'network-unavailable' },
    onRetry() {
      calls++;
    },
  });
  assert.ok(html.includes('conexión'));
  f.nodes
    .find(
      (n) =>
        n.kind === 'Pressable' &&
        n.props.accessibilityLabel === 'Reintentar sesión',
    )
    .props.onPress();
  assert.equal(calls, 1);
});
test('Web pageshow/focus and Android AppState revalidate outside SDK callbacks and dispose every listener', async () => {
  const f = fixture();
  const { connectSessionLifecycle } = f.load(
    path.resolve('src/features/authentication/presentation/use-auth.ts'),
  );
  const actions = [];
  const source = {
    restoreAndVerify: async () => {
      actions.push('verify');
    },
    invalidateSession: () => actions.push('invalidate'),
    setRefreshActive: (active) => actions.push(active ? 'start' : 'stop'),
  };
  const web = new EventTarget(),
    doc = new EventTarget();
  doc.visibilityState = 'visible';
  const off = connectSessionLifecycle(source, 'web', { web, document: doc });
  await Promise.resolve();
  web.dispatchEvent(new Event('pagehide'));
  assert.deepEqual(actions.slice(-2), ['stop', 'invalidate']);
  web.dispatchEvent(new Event('pageshow'));
  await Promise.resolve();
  assert.ok(actions.includes('verify'));
  off();
  const length = actions.length;
  web.dispatchEvent(new Event('focus'));
  assert.equal(actions.length, length);
  let handler,
    removed = 0;
  const detach = connectSessionLifecycle(source, 'android', {
    native: {
      currentState: 'active',
      addEventListener: (_type, callback) => {
        handler = callback;
        return {
          remove() {
            removed++;
          },
        };
      },
    },
  });
  handler('background');
  assert.equal(actions.at(-1), 'stop');
  handler('active');
  await Promise.resolve();
  assert.deepEqual(actions.slice(-2), ['start', 'verify']);
  detach();
  assert.equal(removed, 1);
});
