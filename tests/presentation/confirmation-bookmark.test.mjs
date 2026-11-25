import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function fixture({
  stored = null,
  platform = 'web',
  failed = false,
  storageBlocked = false,
} = {}) {
  const key = 'barbexa:confirmation:viewer:shop';
  const data = new Map(stored ? [[key, stored]] : []),
    slots = [],
    effects = [],
    deps = [];
  let cursor = 0,
    result = null;
  const reads = [];
  const app = {
    getScope: () => ({ userId: 'viewer', contextKey: 'shop' }),
    getSnapshot: () => ({ result }),
    restoreConfirmation: async (id) => {
      reads.push(id);
      if (failed) throw Error('read denied');
      result = { detail: { id }, replayed: true };
    },
  };
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[i],
        (value) =>
          (slots[i] = typeof value === 'function' ? value(slots[i]) : value),
      ];
    },
    useEffect(fn, values) {
      const i = cursor++;
      if (!deps[i] || values.some((v, j) => v !== deps[i][j])) {
        deps[i] = values;
        effects.push(fn);
      }
    },
  };
  const m = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync(
      'src/features/reservations/presentation/use-confirmation-bookmark.ts',
      'utf8',
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    sessionStorage: {
      getItem: (k) => {
        if (storageBlocked) throw Error('blocked');
        return data.get(k) ?? null;
      },
      setItem: (k, v) => {
        if (storageBlocked) throw Error('blocked');
        data.set(k, v);
      },
      removeItem: (k) => data.delete(k),
    },
  })(
    (n) => (n === 'react' ? react : { Platform: { OS: platform } }),
    m,
    m.exports,
  );
  return {
    data,
    reads,
    app,
    setResult: (v) => (result = v),
    render() {
      cursor = 0;
      const view = m.exports.useConfirmationBookmark(app);
      effects.splice(0).forEach((f) => f());
      return view;
    },
  };
}
const flush = async () => {
  for (let n = 0; n < 8; n++) await Promise.resolve();
};
test('reload bookmark starts an authenticated read and stores only the reservation ID', async () => {
  const f = fixture({ stored: 'reservation-id' });
  assert.equal(f.render().loading, true);
  await flush();
  assert.equal(f.render().loading, false);
  assert.deepEqual(f.reads, ['reservation-id']);
  assert.deepEqual([...f.data.values()], ['reservation-id']);
  f.render().forget();
  assert.equal(f.data.size, 0);
});
test('read error offers retry without confirming or replacing data with an invented reservation', async () => {
  const f = fixture({ stored: 'reservation-id', failed: true });
  f.render();
  await flush();
  assert.equal(f.render().error, true);
  assert.equal(f.app.getSnapshot().result, null);
  f.render().retry();
  assert.equal(f.render().loading, true);
  await flush();
  assert.equal(f.render().error, true);
  assert.equal(f.reads.length, 2);
});
test('no bookmark and disabled storage do not prevent normal booking', async () => {
  for (const options of [{}, { storageBlocked: true }]) {
    const f = fixture(options);
    assert.equal(f.render().loading, false);
    await flush();
    assert.deepEqual(f.reads, []);
    assert.equal(f.render().error, false);
  }
});
test('Android confirmation does not use Web storage', async () => {
  const f = fixture({ stored: 'reservation-id', platform: 'android' });
  assert.equal(f.render().loading, false);
  await flush();
  assert.deepEqual(f.reads, []);
});
