import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
function fixture() {
  const states = [],
    refs = [],
    effects = [],
    nodes = [],
    timers = new Map();
  let index = 0,
    ri = 0,
    id = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const i = index++;
      if (!(i in states)) states[i] = initial;
      return [
        states[i],
        (v) => {
          states[i] = v;
        },
      ];
    },
    useRef(initial) {
      return refs[ri++] ?? (refs[ri - 1] = { current: initial });
    },
    useEffect(effect) {
      effects.push(effect);
    },
  };
  const m = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/shared/ui/success-toast.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}})`, {
    setTimeout: (fn, ms) => {
      timers.set(++id, { fn, ms });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  })(
    (name) =>
      name === 'react'
        ? hooks
        : name === 'react-dom'
          ? { createPortal: (node) => node }
          : name === 'react/jsx-runtime'
            ? {
                ...jsx,
                jsx: (type, props, key) => {
                  nodes.push({ type, props });
                  return jsx.jsx(type, props, key);
                },
                jsxs: (type, props, key) => {
                  nodes.push({ type, props });
                  return jsx.jsxs(type, props, key);
                },
              }
            : null,
    m,
    m.exports,
  );
  return {
    timers,
    nodes,
    render(props = {}) {
      index = 0;
      ri = 0;
      nodes.length = 0;
      return renderToStaticMarkup(
        React.createElement(m.exports.SuccessToast, {
          message: 'Cambios guardados.',
          ...props,
        }),
      );
    },
    mount() {
      return effects[0]();
    },
  };
}
test('success toast announces confirmation, dismisses after five seconds and cleans up its timer', () => {
  const f = fixture();
  assert.match(f.render(), /role="status"/);
  assert.match(f.render(), /Cambios guardados/);
  const cleanup = f.mount();
  assert.equal([...f.timers.values()][0].ms, 5000);
  [...f.timers.values()][0].fn();
  assert.equal(f.render(), '');
  cleanup();
  assert.equal(f.timers.size, 0);
});
test('manual dismissal works and pointer/focus interaction pauses automatic dismissal', () => {
  const f = fixture();
  f.render();
  const cleanup = f.mount();
  const root = f.nodes.find((n) => n.props.className === 'bx-success-toast');
  root.props.onMouseEnter();
  assert.equal(f.timers.size, 0);
  root.props.onMouseLeave();
  assert.equal(f.timers.size, 1);
  root.props.onFocusCapture();
  assert.equal(f.timers.size, 0);
  f.nodes.find((n) => n.type === 'button').props.onClick();
  assert.equal(f.render(), '');
  cleanup();
});

test('warning toast uses amber styling, the supplied explanation and no success claim', () => {
  const f = fixture();
  const html = f.render({
    tone: 'warning',
    message: 'Aún no puedes iniciar esta atención',
    description: 'Podrás iniciarla desde las 18:00.',
  });
  assert.match(html, /class="bx-success-toast bx-success-toast--warning"/);
  assert.match(html, /Podrás iniciarla desde las 18:00/);
  assert.doesNotMatch(html, /La operación se completó correctamente/);
  assert.match(html, /role="status"/);
});
