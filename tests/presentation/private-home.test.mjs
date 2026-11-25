import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { detail, id } from '../integration/booking/booking-payload-fixture.mjs';
const require = createRequire(import.meta.url);
function load(source) {
  const file = ['.web.tsx', '.tsx', '.ts', '']
    .map((s) => source + s)
    .find(fs.existsSync);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
    (n) =>
      n === 'expo-router'
        ? {
            Link: ({ onPress, ...props }) =>
              React.createElement('a', { ...props, onClick: onPress }),
          }
        : n.startsWith('.')
          ? load(path.resolve(path.dirname(file), n))
          : require(n),
    module,
    module.exports,
  );
  return module.exports;
}
const state = {
  shops: [],
  shopsPhase: 'ready',
  query: '',
  hasMore: false,
  own: [],
  ownPhase: 'ready',
  offer: null,
  offerPhase: 'idle',
};
function render(patch = {}, props = {}) {
  const { PrivateHomeContent } = load(
    path.resolve('src/features/reservations/presentation/private-home-screen'),
  );
  return renderToStaticMarkup(
    React.createElement(PrivateHomeContent, {
      name: 'Ana',
      state: { ...state, ...patch },
      view: 'home',
      now: Date.parse('2026-11-18T14:00:00Z'),
      query: '',
      onQuery() {},
      onSearch() {},
      onMore() {},
      onRetryOwn() {},
      onOpenShop() {},
      onReserve() {},
      ...props,
    }),
  );
}
test('private home greets the real profile and exposes honest empty states', () => {
  const html = render();
  assert.match(html, /Hola, Ana/);
  assert.match(html, /No hay barberías/);
  assert.match(html, /Todavía no tienes una próxima reserva/);
  assert.match(html, /aria-label="Buscar barberías por nombre"/);
  assert.match(html, /href="\/booking"/);
  assert.doesNotMatch(
    html,
    /4\.9|126 reseñas|Barbería Central|servicios o ubicaciones|Recordatorio de cita/,
  );
});
test('read failures offer retries, and loading is distinct from empty', () => {
  const loading = render({ shopsPhase: 'loading', ownPhase: 'loading' });
  assert.match(loading, /Consultando barberías/);
  assert.doesNotMatch(loading, /No hay barberías/);
  const failure = render({ shopsPhase: 'error', ownPhase: 'error' });
  assert.match(failure, /Reintentar barberías/);
  assert.match(failure, /Reintentar reservas/);
  assert.doesNotMatch(failure, /Todavía no tienes/);
});
test('shop cards escape names, disclose generic illustration, and never invent ratings or favourites', () => {
  const html = render({
    shops: [
      {
        barbershopId: id(1),
        name: '<script>bad</script>',
        address: 'Dirección real',
        publicContact: '',
        publicationState: 'paused',
      },
    ],
  });
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Dirección real/);
  assert.match(html, /Reservas pausadas/);
  assert.match(html, /Imagen ilustrativa/);
  assert.doesNotMatch(html, /aria-label="Favorito|reseñas|<script>/);
});
test('next appointment preserves the snapshot and renders the connected notices slot', () => {
  const html = render(
    { own: [detail] },
    { systemNotices: React.createElement('p', null, 'Aviso real de prueba') },
  );
  assert.match(html, /Service/);
  assert.match(html, /Confirmada/);
  assert.match(html, /Avisos del sistema/);
  assert.match(html, /Aviso real de prueba/);
  assert.doesNotMatch(html, /notificaciones todavía no está disponible/);
});
test('catalog details display service prices and disable booking for a paused shop', () => {
  const html = render(
    {
      offerPhase: 'ready',
      offer: {
        barbershopId: id(1),
        name: 'Local',
        address: 'Centro',
        publicationState: 'paused',
        publicContact: '',
        services: [
          {
            id: id(2),
            barbershopId: id(1),
            name: 'Corte',
            description: 'Detalle',
            price: { amountMinor: 2500, currency: 'PEN' },
            durationMin: 30,
            active: true,
          },
        ],
        professionals: [],
        capabilities: [],
      },
    },
    { view: 'shop' },
  );
  assert.match(html, /Corte/);
  assert.match(html, /25[,.]00/);
  assert.match(
    html,
    /<button[^>]*disabled=""[^>]*>[\s\S]*?Reservar en esta barbería/,
  );
});
test('avatar disclosure has accessible identity, real destinations and no implicit admin grant', () => {
  const { UserMenu } = load(
    path.resolve('src/features/authentication/presentation/user-menu'),
  );
  const html = renderToStaticMarkup(
    React.createElement(UserMenu, { name: 'Ana', onSignOut: async () => {} }),
  );
  assert.match(html, /aria-label="Abrir menú de Ana"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />A<\/span>/);
});
