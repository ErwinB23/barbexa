import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { fixture as compositionFixture } from '../integration/authentication/fixtures/composition.mjs';
const require = createRequire(import.meta.url);
function fixture(platform = 'web', development = true, environment = 'local') {
  const controls = [],
    cache = new Map(),
    slots = [],
    effects = [],
    deps = [];
  let cursor = 0,
    effectCursor = 0,
    pathName = '/auth/google-test',
    selection = null;
  let settle,
    reads = 0,
    localMounts = 0;
  const pending = new Promise((resolve) => {
    settle = resolve;
  });
  const store = {
    read: async () => {
      reads++;
      await pending;
      return selection;
    },
    write: async (v) => {
      selection = v;
    },
    fence: { allow: async () => !selection, localFlowStarted: async () => {} },
  };
  const primitive = (name) =>
    function Component(props) {
      controls.push({ name, ...props });
      return React.createElement('span', null, props.children ?? props.label);
    };
  const ui = {
    Screen: primitive('screen'),
    AppText: primitive('text'),
    AppButton: primitive('button'),
    AppTextField: primitive('field'),
  };
  const hooks = {
    ...React,
    useState(initial) {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[i],
        (v) => {
          slots[i] = typeof v === 'function' ? v(slots[i]) : v;
        },
      ];
    },
    useEffect(effect, next) {
      const i = effectCursor++;
      if (!deps[i] || next.some((v, j) => v !== deps[i][j])) {
        deps[i] = next;
        effects.push(effect);
      }
    },
  };
  const { resolveGoogleCheckProfile: resolveProfile } = compositionFixture(
    platform,
    true,
  ).load(path.resolve('src/composition/google-auth-check-composition.ts'));
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
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      __DEV__: development,
      process: { env: { EXPO_PUBLIC_APP_ENVIRONMENT: environment } },
    })(
      (name) => {
        if (name === 'react') return hooks;
        if (name === 'react-native')
          return { Platform: { OS: platform }, View: primitive('View') };
        if (name === 'expo-router') return { usePathname: () => pathName };
        if (name.includes('shared/ui/')) return ui;
        if (name === './google-auth-check-composition')
          return {
            createGoogleCheckActivationStore: () => store,
            resolveGoogleCheckProfile: resolveProfile,
          };
        return name.startsWith('.')
          ? load(path.resolve(path.dirname(file), name))
          : require(name);
      },
      m,
      m.exports,
    );
    return m.exports;
  }
  return {
    load,
    controls,
    store,
    activate(v) {
      selection = v;
    },
    settle,
    reads: () => reads,
    localMounts: () => localMounts,
    render(Component, props) {
      controls.length = 0;
      return renderToStaticMarkup(React.createElement(Component, props));
    },
    gate() {
      const { GoogleAuthCheckGate } = load(
        path.resolve('src/composition/google-auth-check-gate.tsx'),
      );
      const element = GoogleAuthCheckGate({
        children: () => {
          localMounts++;
          return 'LOCAL';
        },
      });
      if (typeof element === 'string') return element;
      cursor = 0;
      effectCursor = 0;
      return element.type(element.props);
    },
    async flush() {
      for (const effect of effects.splice(0)) effect();
      await new Promise((resolve) => setImmediate(resolve));
    },
    path(value) {
      pathName = value;
    },
  };
}
test('2D LOCAL profile cannot be intercepted by a saved Cloud Auth diagnostic selection', async () => {
  const f = fixture('web', true, 'local-team-authority');
  f.activate({
    version: 1,
    publicKey: 'sb_publishable_old_diagnostic_fixture',
    phase: 'active',
  });
  for (const route of ['/sign-in', '/account', '/staff']) {
    f.path(route);
    assert.equal(f.gate(), 'LOCAL');
    await f.flush();
  }
  assert.equal(f.reads(), 0);
  assert.equal(f.localMounts(), 3);
});
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' integrated runtime owns normal login and callbacks without mounting the old Auth-only diagnostic',
    async () => {
      const f = fixture(platform, true, 'cloud-integration');
      f.activate({
        version: 1,
        publicKey: 'sb_publishable_old_diagnostic_fixture',
        phase: 'active',
      });
      for (const route of ['/sign-in', '/auth/callback', '/account']) {
        f.path(route);
        assert.equal(f.gate(), 'LOCAL'); // Fixture label for the configured runtime renderer.
        await f.flush();
      }
      assert.equal(f.reads(), 0);
      assert.equal(f.localMounts(), 3);
    },
  );
  test(
    platform +
      ' setup keeps its navigator mounted and remains editable until an explicit action',
    async () => {
      const f = fixture(platform);
      f.path('/technical');
      f.gate();
      await f.flush();
      f.settle();
      await f.flush();
      const local = f.gate();
      f.path('/auth/google-test');
      f.gate();
      await f.flush();
      const setup = f.gate();
      // The same root/navigation branch must survive the transition into setup.
      // Expo Router resets a navigator's state when its registration unmounts.
      assert.equal(setup.type, local.type);
      const [navigation, content] = setup.props.children;
      const [originalNavigation] = local.props.children;
      assert.equal(navigation.type, originalNavigation.type);
      assert.equal(navigation.props.children, 'LOCAL');
      assert.equal(navigation.props.blocked, true);
      assert.equal(originalNavigation.props.blocked, false);
      assert.equal(content.props.style.position, 'absolute');
      assert.equal(content.props.children.props.publicKey, '');
      const form = content.props.children;
      form.props.onKey('sb_publishable_unsubmitted_fixture');
      for (let i = 0; i < 3; i++) {
        await f.flush();
        const next = f.gate();
        assert.equal(
          next.props.children[1].props.children.props.publicKey,
          'sb_publishable_unsubmitted_fixture',
        );
        assert.equal(next.props.children[0].props.children, 'LOCAL');
      }
      // Back is an intentional route change, unlike the previous unmount feedback.
      f.path('/technical');
      f.gate();
      await f.flush();
      const back = f.gate();
      assert.equal(back.props.children[0].type, navigation.type);
      assert.equal(back.props.children[0].props.blocked, false);
    },
  );
  test(
    platform +
      ' root waits for activation ownership and never mounts LOCAL for Cloud callbacks',
    async () => {
      const f = fixture(platform);
      f.path('/auth/callback');
      f.activate({
        version: 1,
        publicKey: 'sb_publishable_fixture',
        phase: 'pending',
      });
      f.gate();
      await f.flush();
      assert.equal(f.localMounts(), 0);
      assert.equal(f.reads(), 1);
      f.settle();
      await f.flush();
      const host = f.gate();
      assert.equal(host.props.activation.phase, 'pending');
      assert.equal(f.localMounts(), 0);
      f.path('/');
      f.gate();
      await f.flush();
      f.gate();
      assert.equal(f.localMounts(), 0);
    },
  );
  test(
    platform +
      ' root preserves default LOCAL startup and disables the diagnostic in production',
    async () => {
      const f = fixture(platform);
      f.path('/my-reservations');
      f.gate();
      await f.flush();
      assert.equal(f.localMounts(), 0);
      f.settle();
      await f.flush();
      f.gate();
      assert.equal(f.localMounts(), 1);
      const production = fixture(platform, false);
      assert.equal(production.gate(), 'LOCAL');
      assert.equal(production.reads(), 0);
    },
  );
  test(
    platform +
      ' diagnostic presents boolean results only and requires logout before leaving',
    () => {
      const f = fixture(platform),
        { GoogleAuthCheckContent, GoogleAuthCheckSetupContent } = f.load(
          path.resolve(
            'src/features/authentication/presentation/google-auth-check-screen.tsx',
          ),
        );
      const handlers = {
        onGoogle() {},
        onVerify() {},
        onLogout() {},
        onLeave() {},
      };
      const state = {
        kind: 'verified',
        identityVerified: true,
        sessionVerified: true,
        callbackVerified: true,
        logoutConfirmed: null,
      };
      const html = f.render(GoogleAuthCheckContent, {
        ...handlers,
        state,
        busy: false,
      });
      assert.match(html, /Identidad autenticada/);
      assert.ok(!html.includes('access_token'));
      assert.ok(!html.includes('fixture@example'));
      assert.equal(
        f.controls.find((x) => x.label === 'Volver a Development LOCAL')
          .disabled,
        true,
      );
      assert.ok(
        !f.controls.some((x) => x.label === 'Continuar con Google en Cloud'),
      );
      f.render(GoogleAuthCheckContent, {
        ...handlers,
        state: {
          ...state,
          kind: 'signed-out',
          identityVerified: false,
          sessionVerified: false,
          callbackVerified: false,
          logoutConfirmed: true,
        },
        busy: false,
      });
      assert.equal(
        f.controls.find((x) => x.label === 'Volver a Development LOCAL')
          .disabled,
        false,
      );
      f.render(GoogleAuthCheckSetupContent, {
        publicKey: '',
        busy: false,
        error: false,
        onKey() {},
        onVerify() {},
        onLeave() {},
      });
      assert.equal(
        f.controls.find((x) => x.label === 'Verificar configuración pública')
          .disabled,
        true,
      );
    },
  );
}
