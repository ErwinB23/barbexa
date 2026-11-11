import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CrearAdaptadorInformacionLocal } from '../../src/features/foundation/infrastructure/local-app-information-adapter.js';

const informacion = {
  nombre: 'App Barbería',
  version: '0.1.0',
  descripcion: 'Base local',
};

test('adaptador local devuelve los tres campos públicos inyectados', async () => {
  assert.deepEqual(
    await CrearAdaptadorInformacionLocal(informacion).obtener(),
    informacion,
  );
});

for (const campo of ['nombre', 'version', 'descripcion'] as const) {
  for (const valor of ['', '   ', 42, null, undefined]) {
    test(`adaptador rechaza ${campo} malformado: ${JSON.stringify(valor)}`, async () => {
      await assert.rejects(() =>
        CrearAdaptadorInformacionLocal({
          ...informacion,
          [campo]: valor,
        }).obtener(),
      );
    });
  }
}

for (const configuracion of [
  undefined,
  null,
  'configuracion-invalida',
  [],
  {},
  { version: '0.1.0', descripcion: 'Base local' },
  { nombre: 'App Barbería', descripcion: 'Base local' },
  { nombre: 'App Barbería', version: '0.1.0' },
]) {
  test(`adaptador rechaza configuración ausente o incompleta: ${JSON.stringify(configuracion)}`, async () => {
    await assert.rejects(() =>
      CrearAdaptadorInformacionLocal(configuracion).obtener(),
    );
  });
}
