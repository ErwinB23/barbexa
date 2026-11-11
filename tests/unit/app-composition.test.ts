import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CrearComposicionAplicacion } from '../../src/composition/app-composition.js';

const informacion = {
  nombre: 'App Barbería',
  version: '0.1.0',
  descripcion: 'Fundación técnica de App Barbería',
};

test('composición real expone una función que obtiene los datos inyectados', async () => {
  const consultar = CrearComposicionAplicacion(informacion);
  assert.equal(typeof consultar, 'function');
  assert.deepEqual(await consultar({ idioma: 'es-PE' }), {
    estado: 'ok',
    informacion,
  });
});

test('composición conserva validación de entrada sin exponer el adaptador', async () => {
  const consultar = CrearComposicionAplicacion(informacion);
  assert.deepEqual(await consultar({ idioma: 'en-US' }), {
    estado: 'entrada-invalida',
  });
});

test('composición convierte la configuración inválida en resultado controlado', async () => {
  const consultar = CrearComposicionAplicacion({ ...informacion, nombre: '' });
  assert.deepEqual(await consultar({ idioma: 'es-PE' }), {
    estado: 'no-disponible',
  });
});
