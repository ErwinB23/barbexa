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
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
function fixture() {
  const slots = [],
    effects = [],
    cache = new Map();
  let index = 0,
    controls = [],
    writes = 0,
    refreshes = 0;
  const same = (a, b) =>
    a?.length === b.length && a.every((x, i) => x === b[i]);
  const hooks = {
    ...React,
    useState(initial) {
      const n = index++;
      if (!(n in slots))
        slots[n] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[n],
        (value) => {
          writes++;
          slots[n] = typeof value === 'function' ? value(slots[n]) : value;
        },
      ];
    },
    useRef(initial) {
      const n = index++;
      return slots[n] ?? (slots[n] = { current: initial });
    },
    useCallback(fn, deps) {
      const n = index++;
      if (!slots[n] || !same(slots[n].deps, deps)) slots[n] = { deps, fn };
      return slots[n].fn;
    },
    useEffect(fn, deps) {
      const n = index++;
      if (!slots[n] || !same(slots[n].deps, deps)) {
        slots[n]?.cleanup?.();
        slots[n] = { deps };
        effects.push(() => {
          slots[n].cleanup = fn();
        });
      }
    },
  };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.ts', '.tsx'].map((e) => file + e).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) => {
        if (n === 'react') return hooks;
        if (n.endsWith('/page-header'))
          return {
            Section: (p) => React.createElement('section', null, p.children),
          };
        if (n.endsWith('/app-text'))
          return {
            AppText: (p) => React.createElement('span', null, p.children),
          };
        if (n.endsWith('/app-text-field'))
          return {
            AppTextField: (p) => {
              controls.push({ kind: 'input', ...p });
              return React.createElement('input', {
                value: p.value,
                readOnly: true,
              });
            },
          };
        if (n.endsWith('/app-button'))
          return {
            AppButton: (p) => {
              controls.push({ kind: 'button', ...p });
              return React.createElement('button', null, p.label);
            },
          };
        if (n.endsWith('/status-message'))
          return {
            StatusMessage: (p) => React.createElement('p', null, p.message),
          };
        return n.startsWith('.')
          ? load(path.resolve(path.dirname(file), n))
          : require(n);
      },
      m,
      m.exports,
    );
    return m.exports;
  }
  const { ShopClosuresPanel } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/shop-closures-panel.web.tsx',
    ),
  );
  const { BusinessError } = load(
    path.resolve('src/features/barbershop-operation/domain/values.ts'),
  );
  const closure = {
    id: 'closure',
    barbershopId: 'shop',
    startsAt: '2026-11-21T16:00:00Z',
    endsAt: '2026-11-21T17:00:00Z',
    reason: 'Motivo original',
    status: 'active',
    withdrawal: null,
  };
  const calls = [];
  let stamp = 'selected';
  const app = {
    scopeKey: () => stamp,
    list: async () => ({ closures: [closure], nextCursor: null }),
    withdraw: async (input) => {
      calls.push(input);
      return {
        closure: {
          ...closure,
          status: 'withdrawn',
          withdrawal: { reason: input.reason, occurredAt: closure.startsAt },
        },
        replayed: false,
      };
    },
  };
  const renamed = async () => {
    refreshes++;
  };
  return {
    app,
    calls,
    BusinessError,
    get refreshes() {
      return refreshes;
    },
    get writes() {
      return writes;
    },
    setStamp: (value) => {
      stamp = value;
    },
    render(onRenamed = renamed) {
      index = 0;
      controls = [];
      const html = renderToStaticMarkup(
        React.createElement(ShopClosuresPanel, {
          application: app,
          newRequestId: () => 'request',
        }),
      );
      for (const effect of effects.splice(0)) effect();
      return html;
    },
    field: () => controls.find((x) => x.kind === 'input'),
    button: (label) => controls.find((x) => x.label === label),
    unmount() {
      for (const slot of slots) slot?.cleanup?.();
    },
  };
}
test('closure confirmation requires reason, sends once, preserves original history', async () => {
  const f = fixture();
  f.render();
  await flush();
  f.render();
  f.button('Retirar cierre closure').onPress();
  f.render();
  assert.equal(f.button('Confirmar retirada del cierre').disabled, true);
  f.field().onChangeText('Prueba');
  f.render();
  const button = f.button('Confirmar retirada del cierre');
  button.onPress();
  button.onPress();
  await flush();
  const html = f.render();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].reason, 'Prueba');
  assert.ok(html.includes('Cierre retirado'));
  assert.ok(html.includes('Motivo original'));
  assert.equal(f.button('Retirar cierre closure'), undefined);
  f.unmount();
});
test('uncertain withdrawal does not retry and needs reconciliation read', async () => {
  const f = fixture();
  f.app.withdraw = async () => {
    f.calls.push('attempt');
    throw Error('private detail');
  };
  f.render();
  await flush();
  f.render();
  f.button('Retirar cierre closure').onPress();
  f.render();
  f.field().onChangeText('Motivo');
  f.render();
  f.button('Confirmar retirada del cierre').onPress();
  await flush();
  const html = f.render();
  assert.ok(html.includes('Resultado incierto'));
  assert.ok(!html.includes('private detail'));
  assert.equal(f.button('Confirmar retirada del cierre').disabled, true);
  assert.equal(f.calls.length, 1);
  f.button('Consultar cierres del establecimiento').onPress();
  await flush();
  f.render();
  assert.equal(f.button('Retirar cierre closure').disabled, false);
  assert.equal(f.calls.length, 1);
  f.unmount();
});
test('denied read removes controls; late result after unmount cannot update UI', async () => {
  const f = fixture();
  f.app.list = async () => {
    throw new f.BusinessError('FORBIDDEN');
  };
  f.render();
  await flush();
  assert.ok(f.render().includes('permisos actuales'));
  assert.equal(f.button('Retirar cierre closure'), undefined);
  f.unmount();
  const g = fixture();
  let release;
  g.app.list = () => new Promise((r) => (release = r));
  g.render();
  await flush();
  g.unmount();
  const before = g.writes;
  release({ closures: [], nextCursor: null });
  await flush();
  assert.equal(g.writes, before);
});
test('paginated read uses cursor without mutation and changed scope discards late reply', async () => {
  const f = fixture();
  const cursors = [];
  f.app.list = async (cursor) => {
    cursors.push(cursor);
    return { closures: [], nextCursor: cursor ? null : 'cursor' };
  };
  f.render();
  await flush();
  f.render();
  f.button('Cargar más cierres').onPress();
  await flush();
  f.render();
  assert.deepEqual(cursors, [null, 'cursor']);
  assert.equal(f.calls.length, 0);
  f.unmount();
  const g = fixture();
  let release;
  g.app.list = () => new Promise((r) => (release = r));
  g.render();
  await flush();
  g.setStamp('other');
  const before = g.writes;
  release({ closures: [], nextCursor: null });
  await flush();
  assert.equal(g.writes, before);
  g.unmount();
});
