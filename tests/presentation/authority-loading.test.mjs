import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { test } from 'node:test';
import { loadCore } from '../integration/booking/load-core.mjs';
import { id } from '../integration/booking/booking-payload-fixture.mjs';

test('stalled permission read expires, retry starts a new read and late authority cannot restore access', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  let resolveOld;
  let calls = 0;
  const scope = {
    userId: id(1),
    barbershopId: id(2),
    generation: 1,
    role: 'administrator',
  };
  const app = createTeamAuthority({
    scope: () => scope,
    gateway: {
      getAuthority: () => {
        calls++;
        return calls === 1
          ? new Promise((r) => {
              resolveOld = r;
            })
          : Promise.reject(Error('controlled failure'));
      },
    },
  });
  const effects = [],
    timers = [];
  const m = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/composition/use-team-authority.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    setTimeout: (fn) => {
      timers.push(fn);
      return timers.length;
    },
    clearTimeout() {},
  })(
    (name) => {
      if (name === 'react')
        return {
          useContext: () => ({ authority: app }),
          useEffect: (fn) => effects.push(fn),
          useSyncExternalStore: () => app.getSnapshot(),
        };
      if (name.includes('use-registration'))
        return {
          useRegistration: () => ({
            state: {
              kind: 'ready',
              identity: { userId: scope.userId },
              context: { kind: 'selected', context: scope },
            },
          }),
        };
      return { OperationContext: {} };
    },
    m,
    m.exports,
  );
  m.exports.useTeamAuthority();
  const cleanups = effects.map((fn) => fn());
  await Promise.resolve();
  assert.equal(calls, 1);
  assert.ok(timers.length > 0, 'loading needs a deadline');
  timers.at(-1)();
  assert.equal(app.getSnapshot().phase, 'error');
  assert.equal(app.getSnapshot().value, null);
  await app.read(true);
  assert.equal(calls, 2);
  resolveOld({
    revision: '20261120010538',
    userId: scope.userId,
    barbershopId: scope.barbershopId,
    version: 1,
    capacity: 'owner',
    secondaryCount: 0,
    permissions: {
      manageAdministrators: true,
      transferOwnership: true,
      manageTeam: true,
      publish: true,
      refund: true,
      editServices: true,
      editHours: true,
      manageReservations: true,
      confirmPayment: true,
    },
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(app.getSnapshot().phase, 'error');
  cleanups.forEach((fn) => fn?.());
});
