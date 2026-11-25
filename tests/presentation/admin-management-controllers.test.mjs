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
function harness(file, name) {
  const slots = [];
  let cursor = 0,
    view;
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const state = (initial) => {
    const index = cursor++;
    if (!(index in slots)) slots[index] = initial;
    return [
      slots[index],
      (value) => {
        slots[index] = value;
      },
    ];
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
    (dependency) => {
      if (dependency === 'react')
        return {
          ...React,
          useState: state,
          useRef: (initial) => state({ current: initial })[0],
          useEffect() {},
          useCallback: (callback) => callback,
        };
      if (dependency === 'react-native') return { Platform: { OS: 'web' } };
      if (dependency.endsWith('/page-header')) return {};
      if (
        dependency.endsWith('/app-text') ||
        dependency.endsWith('/app-button') ||
        dependency.endsWith('/app-text-field') ||
        dependency.endsWith('/tokens') ||
        dependency.endsWith('received-invitations.web')
      )
        return {};
      if (dependency.endsWith('/values'))
        return { BusinessError: class BusinessError extends Error {} };
      return require(dependency);
    },
    module,
    module.exports,
  );
  return {
    render(props) {
      cursor = 0;
      renderToStaticMarkup(
        React.createElement(module.exports[name], {
          ...props,
          render: (value) => {
            view = value;
            return React.createElement('div');
          },
        }),
      );
      return view;
    },
  };
}
test('the premium invitation renderer keeps controller validation, single-flight submission and confirmed list refresh', async () => {
  const f = harness(
    path.resolve(
      'src/features/barbershop-operation/presentation/admin-invitations.tsx',
    ),
    'AdminInvitationsPanel',
  );
  const calls = [];
  let resolve;
  const row = { id: 'one', status: 'pending' };
  const app = {
    delivery: 'in-app',
    scopeKey: () => 'actor:shop-a',
    getScope: () => ({ role: 'administrator', barbershopId: 'shop-a' }),
    hasPendingInvitation: () => false,
    invite: (email) => {
      calls.push(email);
      return new Promise((done) => {
        resolve = done;
      });
    },
    loadOutgoing: async () => [row],
  };
  const props = { application: app, audience: 'outgoing', canManage: true };
  let view = f.render(props);
  assert.deepEqual(calls, []);
  view.onEmail('persona@ejemplo.test');
  view = f.render(props);
  assert.equal(view.email, 'persona@ejemplo.test');
  view.onInvite();
  view.onInvite();
  assert.deepEqual(calls, ['persona@ejemplo.test']);
  resolve(row);
  await new Promise((done) => setImmediate(done));
  view = f.render(props);
  assert.equal(view.email, '');
  assert.equal(view.rows[0].id, 'one');
  assert.match(view.message, /dentro de BARBEXA/);
  assert.equal(view.busy, false);
});
test('the premium removal renderer preserves destination and reason, deduplicates confirmation and ignores late results from another scope', async () => {
  const f = harness(
    path.resolve(
      'src/features/barbershop-operation/presentation/team-authority-panel.tsx',
    ),
    'TeamAuthorityPanel',
  );
  const calls = [];
  let resolve,
    scope = 'actor:shop-a',
    reloads = 0;
  const app = {
    scopeKey: () => scope,
    execute: (command) => {
      calls.push(command);
      return new Promise((done) => {
        resolve = done;
      });
    },
    read: async () => {},
  };
  const props = {
    application: app,
    authority: { capacity: 'owner', userId: 'owner', secondaryCount: 1 },
    data: {
      members: [
        { userId: 'owner', role: 'administrator', status: 'active' },
        { userId: 'second', role: 'administrator', status: 'active' },
      ],
      professionals: [],
    },
    loading: false,
    newRequestId: () => 'same-request',
    onReload: async () => {
      reloads++;
    },
  };
  let view = f.render(props);
  assert.deepEqual(calls, []);
  view.onSelect('second');
  view.onDisposition('barber');
  view.onReason('Motivo de prueba');
  view = f.render(props);
  view.onRemove();
  view.onRemove();
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    action: 'remove-secondary',
    requestId: 'same-request',
    memberUserId: 'second',
    disposition: 'barber',
    reason: 'Motivo de prueba',
  });
  scope = 'actor:shop-b';
  resolve({});
  await new Promise((done) => setImmediate(done));
  assert.equal(reloads, 0);
});
