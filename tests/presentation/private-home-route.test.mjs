import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import React from 'react';
import ts from 'typescript';

function fixture({
  state = { kind: 'resolving' },
  callbackError = null,
  configured = true,
  params = {},
  locked = false,
} = {}) {
  const pushes = [],
    selections = [],
    reads = [];
  const snapshot = { query: '', shops: [], own: [] };
  const discovery = {
    subscribe() {},
    getSnapshot: () => snapshot,
    search: (q) => reads.push(q),
    loadOwn() {},
    openShop() {},
    closeShop() {},
  };
  const app = {
    discovery,
    getSnapshot: () => ({
      phase: locked ? 'confirming' : 'idle',
      uncertain: false,
      result: null,
    }),
    chooseShop: (id, professionalId) =>
      selections.push(professionalId ? { shop: id, professionalId } : id),
  };
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/composition/private-home-route.web.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (name) => {
      if (name === 'react')
        return {
          useContext: () => app,
          useEffect() {},
          useState: (value) => [
            typeof value === 'function' ? value() : value,
            () => {},
          ],
          useSyncExternalStore: (_, get) => get(),
        };
      if (name === 'react/jsx-runtime')
        return { jsx: React.createElement, jsxs: React.createElement };
      if (name === 'expo-router')
        return {
          useLocalSearchParams: () => params,
          useRouter: () => ({
            push: (value) => pushes.push(value),
            replace: (value) => pushes.push(value),
          }),
        };
      if (name.endsWith('/use-registration'))
        return {
          useRegistration: () => ({ state, callbackError, configured }),
        };
      if (name === './use-team-authority')
        return { useTeamAuthority: () => ({ authority: undefined }) };
      if (name.endsWith('/account-screen'))
        return { AccountScreen: 'original-profile' };
      if (name.endsWith('/private-home-screen.web'))
        return { PrivateHomeContent: 'private-home' };
      return {};
    },
    module,
    module.exports,
  );
  return { render: module.exports.PrivateHomeRoute, pushes, selections, reads };
}
const ready = {
  kind: 'ready',
  identity: { userId: 'fixture' },
  profile: { displayName: 'Persona de prueba' },
  generation: 1,
  context: { kind: 'none' },
};
test('private Web route never mounts consumers without verified readiness and configured runtime', () => {
  for (const state of [
    { kind: 'resolving' },
    { kind: 'signed-out' },
    { kind: 'profile-required' },
  ])
    assert.equal(fixture({ state }).render(), null);
  assert.equal(
    fixture({ state: ready, callbackError: 'invalid-link' }).render(),
    null,
  );
  assert.equal(fixture({ state: ready, configured: false }).render(), null);
});
test('Web account is the new home, while the profile view reuses the existing editor', () => {
  const route = fixture({ state: ready });
  const connected = route.render();
  const content = connected.type(connected.props);
  assert.equal(content.type, 'private-home');
  assert.equal(content.props.name, ready.profile.displayName);
  assert.equal(content.props.view, 'home');
  assert.deepEqual(route.reads, []);
  const profile = fixture({
    state: ready,
    params: { view: 'profile' },
  }).render();
  assert.equal(profile.type, 'original-profile');
});
test('query parameters cannot grant roles or select a foreign identity', () => {
  const connected = fixture({
    state: ready,
    params: { view: 'administrator', userId: 'foreign', role: 'administrator' },
  }).render();
  assert.equal(connected.props.name, ready.profile.displayName);
  assert.equal(connected.props.view, 'home');
});
test('explicit booking selection preserves confirmation locks and delegates to existing motor', () => {
  const busy = fixture({ state: ready, locked: true });
  busy.render().props.onReserve('shop');
  assert.deepEqual(busy.selections, []);
  assert.deepEqual(busy.pushes, ['/booking']);
  const available = fixture({ state: ready });
  available.render().props.onReserve('shop');
  assert.deepEqual(available.selections, ['shop']);
  assert.deepEqual(available.pushes, ['/booking']);
});

test('professional booking from detail delegates selection to the same existing reservation motor', () => {
  const available = fixture({ state: ready });
  available.render().props.onReserve('selected-shop', 'selected-professional');
  assert.deepEqual(available.selections, [
    { shop: 'selected-shop', professionalId: 'selected-professional' },
  ]);
  assert.deepEqual(available.pushes, ['/booking']);
  const busy = fixture({ state: ready, locked: true });
  busy.render().props.onReserve('selected-shop', 'selected-professional');
  assert.deepEqual(busy.selections, []);
});
