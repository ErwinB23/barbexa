import assert from 'node:assert/strict';
import { test } from 'node:test';

import { EsSolicitudInformacionValida } from '../../src/features/foundation/domain/validate-information-request.js';

test('acepta solicitud existente con idioma es-PE', () => {
  assert.equal(EsSolicitudInformacionValida({ idioma: 'es-PE' }), true);
});

for (const valor of [
  undefined,
  null,
  '',
  'es-PE',
  1,
  true,
  [],
  {},
  { idioma: '' },
  { idioma: 'es-ES' },
  { idioma: ' es-PE ' },
  { idioma: null },
  { idioma: 1 },
]) {
  test(`rechaza solicitud malformada ${JSON.stringify(valor)}`, () => {
    assert.equal(EsSolicitudInformacionValida(valor), false);
  });
}
