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
function render(view, code = '') {
  const elements = [],
    reports = [];
  let cursor = 0;
  function load(file) {
    const module = { exports: {} };
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`)(
      (name) => {
        if (name === 'react')
          return {
            ...React,
            useState: (initial) => [cursor++ === 1 ? code : initial, () => {}],
          };
        if (name === 'react/jsx-runtime')
          return Object.fromEntries(
            Object.entries(require(name)).map(([key, value]) => [
              key,
              ['jsx', 'jsxs'].includes(key)
                ? (type, props, ...rest) => {
                    elements.push({ type, props });
                    return value(type, props, ...rest);
                  }
                : value,
            ]),
          );
        if (name.startsWith('.'))
          return load(path.resolve(path.dirname(file), name + '.ts'));
        return require(name);
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  const { ClientYapePayment } = load(
    path.resolve(
      'src/features/reservations/presentation/client-yape-payment.web.tsx',
    ),
  );
  const html = renderToStaticMarkup(
    React.createElement(ClientYapePayment, {
      view,
      cancelled: false,
      report: { busy: false, onSubmit: (code) => reports.push(code) },
    }),
  );
  return { html, elements, reports };
}
const view = {
  payment: { method: 'yape', status: 'pending', amountMinor: 1500 },
  attendance: 'confirmed',
  canReportYape: true,
  yapeInstructions: 'Titular de Yape: Cuenta real\nNúmero de Yape: 912345678',
};
test('customer Yape card uses reservation snapshots, real amount and a clearly unavailable QR', () => {
  const { html } = render(view);
  for (const text of [
    'Cuenta real',
    '912 345 678',
    '15.00',
    'Código QR todavía no disponible',
    'Confirmar pago',
  ])
    assert.ok(html.includes(text));
  assert.equal(
    render({ ...view, payment: { ...view.payment, method: 'cash' } }).html,
    '',
  );
  const legacy = render({
    ...view,
    yapeInstructions: 'Datos originales de pago',
  });
  assert.ok(legacy.html.includes('Datos originales de pago'));
  assert.ok(!legacy.html.includes('912 345 678'));
});
test('only valid codes submit, while existing reports and paid bookings never offer another payment confirmation', () => {
  for (const code of ['007', '12', 'abc']) {
    const fixture = render(view, code);
    fixture.elements
      .find((e) => e.type === 'form')
      .props.onSubmit({ preventDefault() {} });
    assert.deepEqual(fixture.reports, code === '007' ? ['007'] : []);
  }
  for (const next of [
    { ...view, yapeReport: { securityCode: '007' } },
    { ...view, payment: { ...view.payment, status: 'paid' } },
  ])
    assert.ok(!render(next).elements.some((e) => e.type === 'form'));
  const legacy = render({ ...view, canReportYape: undefined }, '007');
  assert.ok(legacy.html.includes('pendiente de activación'));
  legacy.elements
    .find((e) => e.type === 'form')
    .props.onSubmit({ preventDefault() {} });
  assert.deepEqual(legacy.reports, []);
});
