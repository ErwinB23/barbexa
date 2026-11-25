import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture(platform = 'web') {
  let state = { kind: 'ready' };
  const Stack = () => null;
  Stack.Screen = function Screen() {
    return null;
  };
  Stack.Protected = function Protected() {
    return null;
  };
  const View = () => null;
  const cache = new Map();
  function load(file) {
    if (!path.extname(file))
      file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    const module = { exports: {} };
    if (cache.has(file)) return cache.get(file).exports;
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'expo-router'
          ? { Stack }
          : n === 'react-native'
            ? { View, Platform: { OS: platform } }
            : n.includes('use-registration')
              ? { useRegistration: () => ({ state, callbackError: null }) }
              : n.includes('navigation-policy') ||
                  n.includes('navigation-frame')
                ? load(
                    path.resolve(
                      n.includes('navigation-frame')
                        ? 'src/features/authentication/presentation/navigation-frame.tsx'
                        : 'src/features/authentication/presentation/navigation-policy.ts',
                    ),
                  )
                : n.startsWith('@/')
                  ? {}
                  : n.startsWith('.')
                    ? load(path.resolve(path.dirname(file), n))
                    : require(n),
      module,
      module.exports,
    );
    return module.exports;
  }
  const { SessionNavigator } = load(path.resolve('src/app/_layout.tsx'));
  const inspect = () => {
    const element = SessionNavigator();
    const tree =
      typeof element.type === 'function'
        ? element.type(element.props)
        : element;
    const stack =
      tree.type === Stack
        ? tree
        : React.Children.toArray(tree.props.children).find(
            (c) => c.type === Stack,
          );
    return {
      retained: React.Children.toArray(stack.props.children).find(
        (c) => c.type === Stack.Protected,
      ).props.guard,
      hidden:
        tree.type === View &&
        (tree.props.style.display === 'none' || tree.props.style.opacity === 0),
    };
  };
  return {
    set: (kind) => {
      state = { kind, error: 'network-unavailable' };
    },
    inspect,
    frame: (blocked) =>
      load(
        path.resolve(
          'src/features/authentication/presentation/navigation-frame.tsx',
        ),
      ).NavigationFrame({ blocked, children: 'mounted-stack' }),
    connect: load(
      path.resolve('src/features/authentication/presentation/use-auth.ts'),
    ).connectSessionLifecycle,
  };
}
test('Android cold start and resume keep the native navigator measured while hiding private contents', () => {
  const f = fixture('android');
  for (const blocked of [true, false, true, false]) {
    const frame = f.frame(blocked);
    assert.equal(frame.props.style.flex, 1);
    assert.notEqual(frame.props.style.display, 'none');
    assert.equal(frame.props.style.opacity, blocked ? 0 : 1);
    assert.equal(frame.props.pointerEvents, blocked ? 'none' : 'auto');
    assert.equal(frame.props.accessibilityElementsHidden, blocked);
    assert.equal(frame.props.children, 'mounted-stack');
  }
});
test('root gives navigator and visible session feedback a shared full-height surface', () => {
  const source = fs.readFileSync(
    'src/composition/registration-runtime-provider.tsx',
    'utf8',
  );
  assert.match(source, /<View style=\{\{ flex: 1 \}\}>\{children\}<\/View>/);
  const feedback = fs.readFileSync(
    'src/features/authentication/presentation/account-screen.tsx',
    'utf8',
  );
  assert.match(feedback, /cover:\s*\{\s*position: 'absolute'/);
  assert.match(feedback, /<Screen>\s*<SessionResolutionContent/);
});
test('cold hydration/reload retains the requested URL without exposing private content', () => {
  const f = fixture();
  f.set('resolving');
  assert.deepEqual(f.inspect(), { retained: true, hidden: true });
});
test('network failure retains route but blocks content; definitive invalid/logout removes private history', () => {
  const f = fixture();
  f.set('retryable-error');
  assert.deepEqual(f.inspect(), { retained: true, hidden: true });
  for (const kind of [
    'signed-out',
    'recovery',
    'profile-required',
    'confirmation-required',
  ]) {
    f.set(kind);
    assert.equal(f.inspect().retained, false);
  }
});
test('Web tab/app switches and Android background keep the private stack visible and verify once per burst', async () => {
  for (const platform of ['web', 'android']) {
    const f = fixture();
    const web = new EventTarget(),
      document = new EventTarget();
    document.visibilityState = 'visible';
    let change,
      verifies = 0;
    const off = f.connect(
      {
        setRefreshActive() {},
        invalidateSession() {
          f.set('resolving');
        },
        async restoreAndVerify() {
          verifies++;
          f.set('ready');
        },
      },
      platform,
      {
        web,
        document,
        native: {
          currentState: 'active',
          addEventListener(_type, fn) {
            change = fn;
            return { remove() {} };
          },
        },
      },
    );
    await Promise.resolve();
    if (platform === 'web') {
      document.visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
    } else change('background');
    assert.deepEqual(f.inspect(), { retained: true, hidden: false });
    if (platform === 'web') {
      web.dispatchEvent(new Event('focus'));
      assert.equal(verifies, 1);
      document.visibilityState = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
      web.dispatchEvent(new Event('focus'));
      web.dispatchEvent(new Event('focus'));
    } else {
      change('active');
      change('active');
    }
    assert.deepEqual(f.inspect(), { retained: true, hidden: false });
    await Promise.resolve();
    assert.equal(verifies, 2);
    assert.deepEqual(f.inspect(), { retained: true, hidden: false });
    if (platform === 'web') {
      web.dispatchEvent(new Event('focus'));
      await Promise.resolve();
      assert.equal(verifies, 3);
      web.dispatchEvent(new Event('pagehide'));
      assert.deepEqual(f.inspect(), { retained: true, hidden: true });
      web.dispatchEvent(new Event('pageshow'));
      await Promise.resolve();
      assert.deepEqual(f.inspect(), { retained: true, hidden: false });
    }
    off();
  }
});
