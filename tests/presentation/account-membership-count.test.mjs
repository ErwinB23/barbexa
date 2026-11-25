import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import React from 'react';
import { createRequire } from 'node:module';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url);
function fixture(read) {
  let index = 0;
  const states = [],
    effects = [];
  const mod = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync(
      'src/features/authentication/presentation/account-membership-count.tsx',
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const hooks = {
    ...React,
    useContext: () => read,
    useState: (initial) => {
      const n = index++;
      if (!(n in states)) states[n] = initial;
      return [
        states[n],
        (v) => {
          states[n] = typeof v === 'function' ? v(states[n]) : v;
        },
      ];
    },
    useEffect: (fn) => effects.push(fn),
  };
  vm.runInNewContext(`(function(require,module,exports){${code}})`, {})(
    (n) => (n === 'react' ? hooks : require(n)),
    mod,
    mod.exports,
  );
  return {
    effects,
    render: (props = { userId: 'own', generation: 1, scope: 'shop' }) => {
      index = 0;
      return renderToStaticMarkup(
        React.createElement(mod.exports.AccountMembershipCount, props),
      );
    },
  };
}
const tick = () => new Promise((r) => setImmediate(r));
test('exact membership count deduplicates own active shops and hides stale user data', async () => {
  const member = { userId: 'own', status: 'active', barbershopId: 'a' };
  const f = fixture(async () => [
    member,
    member,
    { ...member, barbershopId: 'b' },
    { ...member, userId: 'other', barbershopId: 'c' },
    { ...member, status: 'inactive', barbershopId: 'd' },
  ]);
  assert.match(f.render(), /Consultando/);
  f.effects[0]();
  await tick();
  assert.match(f.render(), />2</);
  assert.match(
    f.render({ userId: 'different', generation: 2, scope: 'shop' }),
    /Consultando/,
  );
});
test('empty list is exactly zero; failures never imply zero and cancelled reads cannot publish', async () => {
  const empty = fixture(async () => []);
  empty.render();
  empty.effects[0]();
  await tick();
  assert.match(empty.render(), />0</);
  const failed = fixture(async () => {
    throw Error('offline');
  });
  failed.render();
  failed.effects[0]();
  await tick();
  assert.match(failed.render(), /Reintentar/);
  assert.doesNotMatch(failed.render(), />0</);
  let resolve;
  const late = fixture(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  late.render();
  const cleanup = late.effects[0]();
  await tick();
  cleanup();
  resolve([]);
  await tick();
  assert.match(late.render(), /Consultando/);
});
