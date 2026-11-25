import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url),
  id = '00000000-0000-4000-8000-000000000001';
function fixture(platform, code, settings = false, options = {}) {
  const effects = [];
  const controls = [],
    updates = [],
    cache = new Map();
  let index = 0;
  const view = {
    reservationId: id,
    attendance: 'confirmed',
    payment: {
      method: 'cash',
      status: 'pending',
      amountMinor: 2500,
      currency: 'PEN',
    },
    noShowToleranceMin: 10,
    yapeInstructions: null,
    events: [],
    permissions: { attend: true, receive: true, refund: false },
  };
  Object.assign(view, options.view ?? {});
  const values = settings
    ? ['10', 'Instrucciones previas', true, '', false, false]
    : [view, options.busy ?? false, false, '', options.choice ?? '', ''];
  const primitive = (kind) =>
    function Component(props) {
      controls.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive('View'),
    Text: primitive('Text'),
    TextInput: primitive('TextInput'),
    Pressable: primitive('Pressable'),
    Platform: { OS: platform },
    StyleSheet: { create: (x) => x },
  };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${source}\n})`, {})(
      (n) =>
        n === 'react'
          ? {
              ...React,
              useEffect: (effect) => {
                effects.push(effect);
              },
              useState: (initial) => {
                const slot = index++;
                return [
                  slot < values.length
                    ? values[slot]
                    : typeof initial === 'function'
                      ? initial()
                      : initial,
                  (value) => updates.push({ slot, value }),
                ];
              },
            }
          : n === 'react-native'
            ? rn
            : n.startsWith('.')
              ? load(path.resolve(path.dirname(file), n))
              : require(n),
      m,
      m.exports,
    );
    return m.exports;
  }
  const { BookingContext } = load(
      path.resolve(
        'src/features/reservations/presentation/booking-context.tsx',
      ),
    ),
    { CareControl, CareSettings } = load(
      path.resolve('src/features/reservations/presentation/care-control.tsx'),
    );
  const requests = [],
    notifications = [];
  const app = {
    cancellationRequestId: () => '00000000-0000-4000-8000-000000000002',
    care: async (input) => {
      requests.push(input);
      if (options.result) {
        await new Promise((r) => setImmediate(r));
        return options.result;
      }
      throw Object.assign(Error('controlled'), { code });
    },
  };
  return {
    updates,
    requests,
    notifications,
    async openSettingsAutomatically() {
      renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          React.createElement(CareSettings, {
            barbershopId: id,
            autoLoad: true,
          }),
        ),
      );
      const cleanups = effects.map((effect) => effect());
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));
      cleanups.forEach((cleanup) => cleanup?.());
    },
    async saveSettingsTwice() {
      let parts;
      renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          React.createElement(CareSettings, {
            barbershopId: id,
            renderLayout: (p) => {
              parts = p;
              return null;
            },
          }),
        ),
      );
      parts.editor.onSave();
      parts.editor.onSave();
      await new Promise((r) => setImmediate(r));
    },
    async confirmTwice() {
      renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          React.createElement(CareControl, {
            reservationId: id,
            onUpdated: (...args) => notifications.push(args),
          }),
        ),
      );
      const button = controls.find(
        (c) => c.props.accessibilityLabel === 'Confirmar operación',
      );
      button.props.onPress();
      button.props.onPress();
      await new Promise((r) => setImmediate(r));
    },
    async reportYapeTwice(securityCode) {
      let report;
      renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          React.createElement(CareControl, {
            reservationId: id,
            renderPaymentInfo: (_view, controls) => {
              report = controls;
              return null;
            },
          }),
        ),
      );
      report.onSubmit(securityCode);
      report.onSubmit(securityCode);
      await new Promise((resolve) => setImmediate(resolve));
    },
    layout() {
      let parts;
      renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          React.createElement(CareControl, {
            reservationId: id,
            startsAt: options.startsAt,
            confirmOperationsInCard: options.confirmOperationsInCard,
            renderLayout: (p) => {
              parts = p;
              return null;
            },
          }),
        ),
      );
      return parts;
    },
    separated() {
      return renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          React.createElement(CareControl, {
            reservationId: id,
            renderLayout: ({ trigger, content, actions }) =>
              React.createElement(
                'div',
                null,
                React.createElement(
                  'section',
                  { id: 'card-actions' },
                  trigger,
                  actions,
                ),
                React.createElement(
                  'aside',
                  { id: 'selected-detail' },
                  content,
                ),
              ),
          }),
        ),
      );
    },
    async read() {
      renderToStaticMarkup(
        React.createElement(
          BookingContext.Provider,
          { value: app },
          settings
            ? React.createElement(CareSettings, { barbershopId: id })
            : React.createElement(CareControl, { reservationId: id }),
        ),
      );
      controls
        .find(
          (c) =>
            c.props.accessibilityLabel ===
            (settings
              ? 'Consultar configuración de atención y Yape'
              : 'Consultar atención y pago'),
        )
        .props.onPress();
      await new Promise((r) => setImmediate(r));
    },
  };
}
test('custom care layout shares permission-gated operation handlers without sending a mutation on selection', () => {
  const f = fixture('web', 'FORBIDDEN');
  const parts = f.layout();
  assert.deepEqual(
    Array.from(parts.operations, (o) => o.command),
    ['start', 'no-show', 'receive'],
  );
  parts.operations[0].onSelect();
  assert.ok(f.updates.some((u) => u.slot === 4 && u.value === 'start'));
  assert.equal(parts.view.payment.status, 'pending');
});
test('optional care layout keeps trigger in the card and puts actual attendance and payment in the selected detail', () => {
  const html = fixture('web', 'FORBIDDEN').separated();
  const card = html.slice(html.indexOf('<section'), html.indexOf('</section>'));
  const detail = html.slice(html.indexOf('<aside'));
  assert.doesNotMatch(card, /Atención:|Pago:/);
  assert.match(detail, /Atención:/);
  assert.match(detail, /Pendiente/);
  assert.match(detail, /Efectivo/);
  assert.match(detail, /S\/ 25.00/);
});

for (const platform of ['web', 'android']) {
  test(
    platform +
      ' definitive authorization denial clears old private care projection and permission actions',
    async () => {
      for (const code of ['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE']) {
        const f = fixture(platform, code);
        await f.read();
        assert.ok(
          f.updates.some((u) => u.slot === 0 && u.value === null),
          'old authorized projection must be removed',
        );
      }
    },
  );
  test(
    platform +
      ' transient network read failure preserves the last verified projection without inventing success',
    async () => {
      const f = fixture(platform, 'DEPENDENCY_UNAVAILABLE');
      await f.read();
      assert.ok(!f.updates.some((u) => u.slot === 0 && u.value === null));
      assert.ok(
        f.updates.some(
          (u) => u.slot === 3 && u.value.includes('no se declara éxito'),
        ),
      );
    },
  );
}

for (const platform of ['web', 'android'])
  test(
    platform +
      ' settings clears loaded private instructions after definitive denial',
    async () => {
      const f = fixture(platform, 'FORBIDDEN', true);
      await f.read();
      assert.ok(f.updates.some((u) => u.slot === 2 && u.value === false));
      assert.ok(f.updates.some((u) => u.slot === 1 && u.value === ''));
    },
  );

test('custom care operations respect actual permissions and attendance; busy selection is inert', () => {
  let f = fixture('web', 'FORBIDDEN', false, {
    view: { permissions: { attend: false, receive: false, refund: false } },
  });
  assert.equal(f.layout().operations.length, 0);
  f = fixture('web', 'FORBIDDEN', false, { busy: true });
  f.layout().operations[0].onSelect();
  assert.equal(f.updates.length, 0);
  f = fixture('web', 'FORBIDDEN', false, {
    view: { attendance: 'in-service' },
  });
  assert.deepEqual(
    Array.from(f.layout().operations, (o) => o.command),
    ['complete', 'receive'],
  );
});
test('two confirmations share one in-flight command and publish only the verified server result', async () => {
  const result = {
    reservationId: id,
    attendance: 'in-service',
    payment: null,
    noShowToleranceMin: 10,
    yapeInstructions: null,
    events: [],
    permissions: { attend: true, receive: false, refund: false },
  };
  const f = fixture('web', '', false, { choice: 'start', result });
  await f.confirmTwice();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].command, 'start');
  assert.equal(f.requests[0].reservationId, id);
  assert.equal(f.notifications.length, 1);
  assert.equal(f.notifications[0][0].attendance, 'in-service');
  assert.equal(f.notifications[0][1], true);
});

test('custom settings editor preserves one configure command for Yape and tolerance and prevents duplicate writes', async () => {
  const f = fixture('web', '', true, {
    result: {
      barbershopId: id,
      noShowToleranceMin: 10,
      yapeInstructions: 'Instrucciones previas',
    },
  });
  await f.saveSettingsTwice();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].command, 'configure');
  assert.equal(f.requests[0].barbershopId, id);
  assert.equal(f.requests[0].noShowToleranceMin, 10);
  assert.equal(f.requests[0].yapeInstructions, 'Instrucciones previas');
  assert.ok(
    f.updates.some(
      (u) => u.slot === 3 && u.value === 'Configuración consultada o guardada.',
    ),
  );
});

test('opening Web payment settings automatically reads existing configuration without writing defaults', async () => {
  const f = fixture('web', '', true, {
    result: {
      barbershopId: id,
      noShowToleranceMin: 10,
      yapeInstructions: 'Instrucciones previas',
    },
  });
  await f.openSettingsAutomatically();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].command, 'settings');
  assert.equal(f.requests[0].barbershopId, id);
  assert.ok(f.updates.some((u) => u.slot === 2 && u.value === true));
});

for (const platform of ['web', 'android']) {
  test(`${platform}: reporting Yape uses a single request and keeps the payment pending`, async () => {
    const result = {
      reservationId: id,
      attendance: 'confirmed',
      noShowToleranceMin: 10,
      payment: {
        method: 'yape',
        status: 'pending',
        amountMinor: 2500,
        currency: 'PEN',
      },
      yapeInstructions:
        'Titular de Yape: Cuenta real\nNúmero de Yape: 912345678',
      yapeReport: { securityCode: '007', submittedAt: '2026-11-24T18:00:00Z' },
      canReportYape: false,
      events: [],
      permissions: { attend: false, receive: false, refund: false },
    };
    const f = fixture(platform, '', false, {
      view: { ...result, yapeReport: null, canReportYape: true },
      result,
    });
    await f.reportYapeTwice('007');
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].command, 'report-yape');
    assert.equal(f.requests[0].securityCode, '007');
    assert.equal(
      f.requests[0].requestId,
      '00000000-0000-4000-8000-000000000002',
    );
    assert.equal(
      f.updates.find((u) => u.slot === 0).value.payment.status,
      'pending',
    );
    assert.equal(
      f.updates.find((u) => u.slot === 0).value.yapeReport.securityCode,
      '007',
    );
  });
}

test('Yape report timeout retains the exact code and request for retry without claiming success', async () => {
  const f = fixture('web', 'DEPENDENCY_UNAVAILABLE', false, {
    view: { canReportYape: true },
  });
  await f.reportYapeTwice('007');
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].securityCode, '007');
  assert.ok(f.updates.some((u) => u.slot === 2 && u.value === true));
  assert.ok(
    f.updates.some((u) => u.slot === 3 && String(u.value).includes('incierto')),
  );
  assert.ok(!f.updates.some((u) => u.slot === 0));
});
test('unsupported server or invalid code cannot submit a Yape report', async () => {
  for (const [view, code] of [
    [{}, '007'],
    [{ canReportYape: true }, '12'],
  ]) {
    const f = fixture('web', '', false, { view });
    await f.reportYapeTwice(code);
    assert.equal(f.requests.length, 0);
  }
});

test('clicking start before appointment time raises a notice without selecting or submitting attendance', () => {
  const f = fixture('web', '', false, { startsAt: '2099-01-01T23:00:00Z' });
  f.layout()
    .operations.find((operation) => operation.command === 'start')
    .onSelect();
  assert.ok(f.updates.some((update) => update.slot === 7));
  assert.ok(!f.updates.some((update) => update.slot === 4));
  assert.equal(f.requests.length, 0);
  const past = fixture('web', '', false, { startsAt: '2000-01-01T23:00:00Z' });
  past
    .layout()
    .operations.find((operation) => operation.command === 'start')
    .onSelect();
  assert.ok(
    past.updates.some(
      (update) => update.slot === 4 && update.value === 'start',
    ),
  );
});

test('card start confirmation separates decision from feedback and cancellation never mutates', () => {
  const f = fixture('web', 'FORBIDDEN', false, {
    choice: 'start',
    confirmOperationsInCard: true,
  });
  const parts = f.layout();
  assert.ok(parts.operationConfirmation);
  assert.doesNotMatch(
    renderToStaticMarkup(parts.feedback),
    /Confirmar operación|Volver sin confirmar/,
  );
  parts.operationConfirmation.onCancel();
  assert.ok(f.updates.some((u) => u.slot === 4 && u.value === ''));
  assert.equal(f.requests.length, 0);
});

for (const command of ['receive', 'no-show', 'complete']) {
  test(`${command} uses the card dialog and submits only after confirmation`, async () => {
    const f = fixture('web', 'FORBIDDEN', false, {
      choice: command,
      confirmOperationsInCard: true,
    });
    const parts = f.layout();
    assert.equal(parts.operationConfirmation?.command, command);
    assert.doesNotMatch(
      renderToStaticMarkup(parts.feedback),
      /Confirmar operación|Volver sin confirmar/,
    );
    parts.operationConfirmation.onCancel();
    assert.equal(f.requests.length, 0);
    parts.operationConfirmation.onConfirm();
    parts.operationConfirmation.onConfirm();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].command, command);
    if (command === 'receive') assert.equal(f.requests[0].attested, true);
  });
}
