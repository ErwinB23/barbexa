import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCore } from '../../integration/booking/load-core.mjs';
test('service draft accepts Spanish decimal input without losing cents', () => {
  const { parseServiceDraft } = loadCore(
    'src/features/barbershop-operation/presentation/service-draft.ts',
  );
  for (const price of ['15.50', '15,50', ' 15,50 ']) {
    const draft = parseServiceDraft({ name: ' Corte ', price, duration: '30' });
    assert.equal(draft.name, 'Corte');
    assert.equal(draft.price.amountMinor, 1550);
    assert.equal(draft.durationMin, 30);
  }
});
test('invalid service fields produce specific safe messages before sending a command', () => {
  const { parseServiceDraft, ServiceDraftError } = loadCore(
    'src/features/barbershop-operation/presentation/service-draft.ts',
  );
  for (const [draft, field, message] of [
    [{ name: ' ', price: '15', duration: '30' }, 'name', /nombre/],
    [{ name: 'Corte', price: '15.333', duration: '30' }, 'price', /precio/],
    [{ name: 'Corte', price: '-1', duration: '30' }, 'price', /precio/],
    [
      { name: 'Corte', price: '10000000000', duration: '30' },
      'price',
      /precio/,
    ],
    [{ name: 'Corte', price: '15', duration: '0' }, 'duration', /duración/],
    [{ name: 'Corte', price: '15', duration: '1.5' }, 'duration', /duración/],
  ])
    assert.throws(
      () => parseServiceDraft(draft),
      (error) =>
        error instanceof ServiceDraftError &&
        error.field === field &&
        message.test(error.message),
    );
});
