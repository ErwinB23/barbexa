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
    if (!path.extname(file))
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
  const { ShopNameEditor } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/shop-name-editor.web.tsx',
    ),
  );
  const { BusinessError } = load(
    path.resolve('src/features/barbershop-operation/domain/values.ts'),
  );
  const calls = [];
  let stamp = 'selected';
  const app = {
    scopeKey: () => stamp,
    getSelectedShop: async () => ({ id: 'shop', name: 'Original' }),
    renameSelectedShop: async (name) => {
      calls.push(name);
      return { id: 'shop', name };
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
        React.createElement(ShopNameEditor, { application: app, onRenamed }),
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
test('editor prefills current name then sends one rename and refreshes visible context', async () => {
  const f = fixture();
  f.render();
  await flush();
  f.render();
  assert.equal(f.field().value, 'Original');
  f.field().onChangeText('Nuevo');
  f.render();
  const save = f.button('Guardar nombre de esta barbería');
  save.onPress();
  save.onPress();
  await flush();
  const html = f.render();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0], 'Nuevo');
  assert.equal(f.refreshes, 1);
  assert.ok(html.includes('Nombre guardado'));
  assert.equal(f.field().value, 'Nuevo');
  f.unmount();
});
test('uncertain rename requires a read before another save and never retries automatically', async () => {
  const f = fixture();
  f.app.renameSelectedShop = async () => {
    f.calls.push('attempt');
    throw new f.BusinessError('DEPENDENCY_UNAVAILABLE');
  };
  f.render();
  await flush();
  f.render();
  f.field().onChangeText('Nuevo');
  f.render();
  f.button('Guardar nombre de esta barbería').onPress();
  await flush();
  assert.ok(f.render().includes('Resultado incierto'));
  assert.equal(f.button('Guardar nombre de esta barbería').disabled, true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.refreshes, 0);
  f.button('Consultar nombre actual').onPress();
  await flush();
  f.render();
  assert.equal(f.field().value, 'Original');
  assert.equal(f.button('Guardar nombre de esta barbería').disabled, false);
  assert.equal(f.calls.length, 1);
  f.unmount();
});
test('known saved name is not reported as failed when only navigation refresh fails', async () => {
  const f = fixture(),
    refresh = async () => {
      throw Error('private transport detail');
    };
  f.render(refresh);
  await flush();
  f.render(refresh);
  f.field().onChangeText('Nuevo');
  f.render(refresh);
  f.button('Guardar nombre de esta barbería').onPress();
  await flush();
  const html = f.render(refresh);
  assert.ok(html.includes('El nombre se guardó'));
  assert.ok(!html.includes('private transport'));
  assert.ok(!html.includes('Resultado incierto'));
  assert.equal(f.calls.length, 1);
  f.unmount();
});
test('late result after unmount is discarded and denied reads expose no editable field', async () => {
  const f = fixture();
  let release;
  f.app.getSelectedShop = () =>
    new Promise((r) => {
      release = r;
    });
  f.render();
  await flush();
  f.unmount();
  const before = f.writes;
  release({ id: 'shop', name: 'Late' });
  await flush();
  assert.equal(f.writes, before);
  const g = fixture();
  g.app.getSelectedShop = async () => {
    throw new g.BusinessError('FORBIDDEN');
  };
  g.render();
  await flush();
  const html = g.render();
  assert.ok(html.includes('ya no permite editar'));
  assert.equal(g.field(), undefined);
  g.unmount();
});
