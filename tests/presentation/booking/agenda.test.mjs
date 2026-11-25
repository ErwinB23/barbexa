import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import path from 'node:path';
function load(file) {
  if (!path.extname(file)) file += '.ts';
  const m = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) => load(path.resolve(path.dirname(file), n)),
    m,
    m.exports,
  );
  return m.exports;
}
const id = '11111111-1111-4111-8111-111111111111',
  other = '22222222-2222-4222-8222-222222222222';
test('agenda uses contextual shop and discards a late result after tenant/logout change', async () => {
  const { createAgendaApplication } = load(
    path.resolve('src/features/reservations/application/agenda-application.ts'),
  );
  let scope = {
      userId: id,
      generation: 1,
      barbershopId: id,
      role: 'administrator',
    },
    finish;
  const app = createAgendaApplication({
    scope: () => scope,
    today: () => '2026-11-15',
    gateway: {
      listAgenda: (query) =>
        new Promise((r) => {
          assert.equal(query.barbershopId, id);
          finish = r;
        }),
    },
  });
  const pending = app.load();
  scope = { ...scope, barbershopId: other, role: 'barber' };
  app.invalidateScope();
  finish([{ id: 'private-A' }]);
  await pending;
  assert.equal(app.getSnapshot().rows.length, 0);
  scope = null;
  app.invalidateScope();
  assert.equal(app.getSnapshot().rows.length, 0);
});
test('agenda keeps filters bounded, denies missing context and clears old rows on errors', async () => {
  const { createAgendaApplication } = load(
    path.resolve('src/features/reservations/application/agenda-application.ts'),
  );
  let scope = null,
    calls = 0;
  const app = createAgendaApplication({
    scope: () => scope,
    today: () => '2026-11-15',
    gateway: {
      async listAgenda() {
        calls++;
        throw Error('provider secret');
      },
    },
  });
  await app.load();
  assert.equal(calls, 0);
  scope = { userId: id, generation: 1, barbershopId: id, role: 'barber' };
  app.invalidateScope();
  await app.load();
  assert.equal(app.getSnapshot().phase, 'error');
  assert.equal(app.getSnapshot().rows.length, 0);
  assert.doesNotThrow(() => JSON.stringify(app.getSnapshot()));
  assert.throws(() =>
    app.setFilters({ localDate: 'not-date', barberId: null, state: null }),
  );
});
