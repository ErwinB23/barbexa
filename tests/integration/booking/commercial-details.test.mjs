import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCoreLoader } from './load-core.mjs';
import { detail, id } from './booking-payload-fixture.mjs';
function fixture(patch = {}) {
  const load = createCoreLoader(),
    { createOperationHttpAdapter } = load(
      'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
    );
  return createOperationHttpAdapter({
    baseUrl: 'https://fixture.invalid',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => id(90),
    getAccessToken: async () => 'synthetic',
    fetcher: async (url) =>
      new Response(
        JSON.stringify(
          url.endsWith('/auth/v1/user')
            ? {
                id: id(90),
                is_anonymous: false,
                email_confirmed_at: '2026-11-23',
              }
            : {
                barbershopId: id(1),
                name: 'Local',
                address: 'Dirección',
                publicContact: '984702275',
                publicationState: 'published',
                policies: detail.policySnapshot,
                services: [],
                professionals: [],
                capabilities: [],
                ...patch,
              },
        ),
      ),
  });
}
test('existing catalog carries real optional hours closures and professional description without exposing private actor', async () => {
  const hours = [
    { weekday: 1, opensMin: 510, closesMin: 780 },
    { weekday: 1, opensMin: 855, closesMin: 1320 },
  ];
  const offer = await fixture({
    shopHours: hours,
    shopClosures: [
      {
        startsAt: '2026-11-23T12:00:00.000Z',
        endsAt: '2026-11-23T13:00:00.000Z',
        reason: 'PRIVATE',
        userId: id(99),
      },
    ],
    professionals: [
      {
        id: id(4),
        barbershopId: id(1),
        professionalName: 'Real',
        active: true,
        description: 'Experiencia real',
        userId: id(98),
      },
    ],
  }).getCatalog(id(1));
  assert.equal(offer.shopHours.length, 2);
  assert.equal(offer.professionals[0].description, 'Experiencia real');
  assert.ok(!JSON.stringify(offer).includes('PRIVATE'));
  assert.ok(!JSON.stringify(offer).includes('userId'));
  assert.equal((await fixture().getCatalog(id(1))).shopHours, undefined);
});
test('malformed hours, inverted closure and foreign tenant cannot become commercial details', async () => {
  for (const patch of [
    { shopHours: [{ weekday: 7, opensMin: 0, closesMin: 100 }] },
    { shopHours: [{ weekday: 1, opensMin: 900, closesMin: 500 }] },
    { shopHours: [{ weekday: 1, opensMin: 0, closesMin: 1441 }] },
    {
      shopClosures: [
        {
          startsAt: '2026-11-23T12:00:00.000Z',
          endsAt: '2026-11-23T11:00:00.000Z',
        },
      ],
    },
    {
      professionals: [
        {
          id: id(4),
          barbershopId: id(2),
          professionalName: 'Foreign',
          active: true,
        },
      ],
    },
  ])
    await assert.rejects(() => fixture(patch).getCatalog(id(1)));
});
