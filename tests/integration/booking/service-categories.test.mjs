import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCoreLoader } from './load-core.mjs';
const load = createCoreLoader();
const { parseOperation } = load(
  'supabase/functions/_shared/barbershop-operation/application/operation.ts',
);
const base = {
  action: 'upsert-service',
  barbershopId: '11111111-1111-4111-8111-111111111111',
  name: 'Corte',
  description: '',
  price: { amountMinor: 1500, currency: 'PEN' },
  durationMin: 30,
  active: true,
};
test('service categories and archival are closed commands retaining legacy compatibility', () => {
  assert.equal(parseOperation(base).action, 'upsert-service');
  for (const category of ['Corte de cabello', 'Barba', 'Tratamientos', 'Otros'])
    assert.equal(parseOperation({ ...base, category }).category, category);
  for (const patch of [
    { category: 'Injected' },
    { category: null },
    { archived: true },
    { id: base.barbershopId, archived: true },
    { archived: false },
  ])
    assert.throws(() => parseOperation({ ...base, ...patch }));
  assert.equal(
    parseOperation({
      ...base,
      id: base.barbershopId,
      active: false,
      archived: true,
    }).archived,
    true,
  );
});
test('service adapter retains metadata and refuses malformed categories', async () => {
  const { createOperationHttpAdapter } = load(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  let payload = {
    id: base.barbershopId,
    barbershopId: base.barbershopId,
    name: 'Corte',
    description: '',
    price: base.price,
    durationMin: 30,
    active: true,
    category: 'Barba',
    archived: false,
  };
  const adapter = createOperationHttpAdapter({
    baseUrl: 'https://fixture.invalid',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => base.barbershopId,
    getAccessToken: async () => 'fixture',
    fetcher: async (url) =>
      Response.json(
        url.endsWith('/auth/v1/user')
          ? {
              id: base.barbershopId,
              is_anonymous: false,
              email_confirmed_at: 'verified',
            }
          : payload,
      ),
  });
  assert.equal((await adapter.upsertService(base)).category, 'Barba');
  payload = { ...payload, category: 'Bad' };
  await assert.rejects(() => adapter.upsertService(base));
});
