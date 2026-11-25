import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file) {
  if (!fs.existsSync(file))
    file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) =>
      n === 'expo-router'
        ? { Link: (props) => React.createElement('a', props) }
        : n.startsWith('.')
          ? load(path.resolve(path.dirname(file), n))
          : require(n),
    module,
    module.exports,
  );
  return module.exports;
}
const helper = () =>
  load(
    path.resolve('src/features/reservations/presentation/shop-detail-view.ts'),
  );
const hours = [
  { weekday: 1, opensMin: 510, closesMin: 780 },
  { weekday: 1, opensMin: 855, closesMin: 1320 },
];
test('shop opening uses Lima boundaries, split shifts, closures, seven days and never guesses missing hours', () => {
  const { openingState, weeklyHours } = helper();
  assert.equal(
    openingState(undefined, [], Date.parse('2026-11-23T15:00:00Z')),
    'unknown',
  );
  assert.equal(
    openingState(hours, [], Date.parse('2026-11-23T13:30:00Z')),
    'open',
  );
  assert.equal(
    openingState(hours, [], Date.parse('2026-11-23T18:00:00Z')),
    'closed',
  );
  assert.equal(
    openingState(hours, [], Date.parse('2026-11-23T19:15:00Z')),
    'open',
  );
  assert.equal(
    openingState(hours, [], Date.parse('2026-11-24T03:00:00Z')),
    'closed',
  );
  assert.equal(
    openingState(
      hours,
      [
        {
          startsAt: '2026-11-23T13:00:00.000Z',
          endsAt: '2026-11-23T16:00:00.000Z',
        },
      ],
      Date.parse('2026-11-23T15:00:00Z'),
    ),
    'closed',
  );
  const week = weeklyHours(hours);
  assert.equal(week.length, 7);
  assert.equal(week[0].label, 'Lunes');
  assert.equal(week[0].intervals.join(' y '), '08:30–13:00 y 14:15–22:00');
  assert.equal(week[6].label, 'Domingo');
});
test('contact links normalize the real Peru number and never turn arbitrary contact text into a phone or exact map pin', () => {
  const { contactLinks, mapSearch } = helper();
  assert.equal(contactLinks('984 702 275').call, 'tel:+51984702275');
  assert.equal(
    contactLinks('+51 984702275').whatsapp,
    'https://wa.me/51984702275',
  );
  assert.equal(contactLinks('javascript:alert(1)'), null);
  assert.equal(contactLinks('Pedidos por correo'), null);
  assert.equal(mapSearch(''), null);
  assert.equal(
    mapSearch('Calle A & B'),
    'https://www.google.com/maps/search/?api=1&query=Calle%20A%20%26%20B',
  );
});
test('detail uses the selected real catalog, honest absent data, safe contact links and no fabricated reviews', () => {
  const { ShopDetailWeb } = load(
    path.resolve('src/features/reservations/presentation/shop-detail.web.tsx'),
  );
  const html = renderToStaticMarkup(
    React.createElement(ShopDetailWeb, {
      offer: {
        barbershopId: 'A',
        name: 'Local real',
        address: 'Dirección real',
        publicContact: '984702275',
        publicationState: 'published',
        shopHours: hours,
        shopClosures: [],
        services: [
          {
            id: 's',
            barbershopId: 'A',
            name: 'Corte real',
            description: 'Detalle real',
            durationMin: 40,
            price: { amountMinor: 1500, currency: 'PEN' },
            active: true,
          },
          { id: 'bad', barbershopId: 'B', name: 'Ajeno', active: true },
        ],
        professionals: [
          {
            id: 'p',
            barbershopId: 'A',
            professionalName: 'Persona real',
            active: true,
          },
          {
            id: 'q',
            barbershopId: 'B',
            professionalName: 'Ajeno',
            active: true,
          },
        ],
        capabilities: [{ barberId: 'p', serviceId: 's' }],
      },
      now: Date.parse('2026-11-23T15:00:00Z'),
      phase: 'ready',
      query: 'real',
      onReserve() {},
      onRetry() {},
    }),
  );
  assert.match(html, /Local real/);
  assert.match(html, /Corte real/);
  assert.match(html, /Persona real/);
  assert.match(html, /Horarios de atención/);
  assert.match(html, /Abierto ahora/);
  assert.match(html, /Todavía no hay reseñas/);
  assert.match(html, /Descripción no registrada/);
  assert.match(html, /Redes sociales no registradas/);
  assert.match(html, /tel:\+51984702275/);
  assert.match(html, /Imagen ilustrativa/);
  assert.doesNotMatch(html, /Ajeno|4\.8|126 reseñas|iframe|userId|<script/);
});
