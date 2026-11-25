import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from '../../integration/booking/load-core.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
test('calendar uses Lima today, Monday-first weeks, leap days and the inclusive server horizon', () => {
  const { calendarDays, limaDate, lastBookingDate } = loadCore(
    'src/features/reservations/presentation/booking-calendar-dates.ts',
  );
  assert.equal(limaDate(new Date('2026-11-23T03:00:00Z')), '2026-11-22');
  assert.equal(lastBookingDate('2026-12-31', 2), '2027-01-02');
  const days = calendarDays('2024-02');
  assert.equal(
    days.slice(0, 3).every((v) => v === null),
    true,
  );
  assert.equal(days.filter(Boolean).at(-1), '2024-02-29');
  assert.equal(days.length % 7, 0);
});

test('calendar disables dates outside policy, selects ISO dates and navigates months without querying or confirming', () => {
  const dates = loadCore(
    'src/features/reservations/presentation/booking-calendar-dates.ts',
  );
  const module = { exports: {} };
  let month, chosen;
  const code = ts.transpileModule(
    fs.readFileSync(
      'src/features/reservations/presentation/booking-calendar.web.tsx',
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (name) =>
      name === 'react'
        ? {
            useState: (value) => [
              month ?? value,
              (value) => {
                month = value;
              },
            ],
          }
        : name === './booking-calendar-dates'
          ? { ...dates, limaDate: () => '2026-11-22' }
          : require(name),
    module,
    module.exports,
  );
  const render = (disabled = false) => {
    const element = module.exports.BookingCalendar({
      value: '2026-11-23',
      horizon: 12,
      disabled,
      onChange: (value) => {
        chosen = value;
      },
    });
    const nodes = [];
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) return node.forEach(walk);
      if (node.type === 'button') nodes.push(node.props);
      walk(node.props?.children);
    };
    walk(element);
    return nodes;
  };
  let buttons = render();
  assert.equal(
    buttons.find((v) => v['aria-label'] === '2026-11-21').disabled,
    true,
  );
  const selected = buttons.find((v) => v['aria-label'] === '2026-11-23');
  assert.equal(selected['aria-pressed'], true);
  selected.onClick();
  assert.equal(chosen, '2026-11-23');
  buttons.find((v) => v['aria-label'] === 'Mes siguiente').onClick();
  buttons = render();
  assert.equal(month, '2026-12');
  assert.equal(
    buttons.find((v) => v['aria-label'] === '2026-12-04').disabled,
    false,
  );
  assert.equal(
    buttons.find((v) => v['aria-label'] === '2026-12-05').disabled,
    true,
  );
  assert.equal(
    buttons.find((v) => v['aria-label'] === 'Mes siguiente').disabled,
    true,
  );
  assert.ok(render(true).every((v) => v.disabled));
});
