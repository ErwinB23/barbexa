import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load() {
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync(
      'src/features/barbershop-operation/presentation/weekly-schedule-draft.ts',
      'utf8',
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}})`)(
    (name) =>
      name.endsWith('/values')
        ? { BusinessError: class extends Error {} }
        : require(name),
    module,
    module.exports,
  );
  return module.exports;
}
test('weekly draft keeps exact saved minutes, midnight/end-of-day and never invents opening hours', () => {
  const { timeOptions, validateWeeklyDraft } = load();
  assert.ok(timeOptions(547, false).includes(547));
  assert.ok(timeOptions(null, true).includes(1440));
  assert.ok(!timeOptions(null, false).includes(1440));
  assert.deepEqual(validateWeeklyDraft([]), []);
  assert.deepEqual(
    validateWeeklyDraft([{ weekday: 1, opensMin: 547, closesMin: 1440 }]),
    [{ weekday: 1, opensMin: 547, closesMin: 1440 }],
  );
  for (const rows of [
    [{ weekday: 1, opensMin: null, closesMin: null }],
    [{ weekday: 1, opensMin: 600, closesMin: 600 }],
    [
      { weekday: 1, opensMin: 500, closesMin: 700 },
      { weekday: 1, opensMin: 600, closesMin: 800 },
    ],
  ])
    assert.throws(() => validateWeeklyDraft(rows));
});
test('break splitting/editing/removal and copy only transform the supplied draft', () => {
  const { splitForBreak, joinBreak, copyWeekday } = load();
  const initial = [{ weekday: 1, opensMin: 540, closesMin: 1140 }];
  const split = splitForBreak(initial, 1, 780, 840);
  assert.deepEqual(split, [
    { weekday: 1, opensMin: 540, closesMin: 780 },
    { weekday: 1, opensMin: 840, closesMin: 1140 },
  ]);
  assert.deepEqual(joinBreak(split, 1, 780, 840), initial);
  assert.equal(copyWeekday(split, 1).length, 14);
  assert.equal(initial.length, 1);
  assert.throws(() => splitForBreak(initial, 1, 480, 600));
  assert.throws(() => splitForBreak(initial, 1, 840, 780));
});
