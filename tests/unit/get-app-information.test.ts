import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ConsultarInformacionAplicacion } from '../../src/features/foundation/application/get-app-information.js';
import { CrearAdaptadorInformacionLocal } from '../../src/features/foundation/infrastructure/local-app-information-adapter.js';
import { InformacionGatewayEnMemoria } from './doubles/app-information-gateway.js';

const informacion = Object.freeze({
  nombre: 'App Barbería',
  version: '0.1.0',
  descripcion: 'Información pública local',
});

test('consulta con doble devuelve información y llama una sola vez', async () => {
  const gateway = new InformacionGatewayEnMemoria(async () => informacion);
  const resultado = await ConsultarInformacionAplicacion(gateway)({
    idioma: 'es-PE',
  });
  assert.deepEqual(resultado, { estado: 'ok', informacion });
  assert.equal(gateway.llamadas, 1);
});

test('consulta con adaptador local devuelve información y llama una sola vez', async () => {
  const local = CrearAdaptadorInformacionLocal(informacion);
  let llamadas = 0;
  const gateway = {
    obtener: () => {
      llamadas += 1;
      return local.obtener();
    },
  };
  assert.deepEqual(
    await ConsultarInformacionAplicacion(gateway)({ idioma: 'es-PE' }),
    { estado: 'ok', informacion },
  );
  assert.equal(llamadas, 1);
});

for (const solicitud of [
  undefined,
  null,
  '',
  {},
  [],
  { idioma: '' },
  { idioma: 'en-US' },
  { idioma: 1 },
]) {
  test(`entrada inválida ${JSON.stringify(solicitud)} no invoca gateway`, async () => {
    const gateway = new InformacionGatewayEnMemoria(async () => informacion);
    // La entrada externa puede estar malformada en runtime, aunque TS no la permita.
    const resultado = await ConsultarInformacionAplicacion(gateway)(
      solicitud as { idioma: string },
    );
    assert.deepEqual(resultado, { estado: 'entrada-invalida' });
    assert.equal(gateway.llamadas, 0);
  });
}

test('rechazo se convierte en no-disponible sin filtrar detalles; reintento funciona', async () => {
  let fallar = true;
  const gateway = new InformacionGatewayEnMemoria(async () => {
    if (fallar) throw new Error('detalle interno que no debe salir');
    return informacion;
  });
  const consultar = ConsultarInformacionAplicacion(gateway);
  assert.deepEqual(await consultar({ idioma: 'es-PE' }), {
    estado: 'no-disponible',
  });
  assert.equal(gateway.llamadas, 1);
  fallar = false;
  assert.deepEqual(await consultar({ idioma: 'es-PE' }), {
    estado: 'ok',
    informacion,
  });
  assert.equal(gateway.llamadas, 2);
});

test('configuración local malformada termina en no-disponible', async () => {
  const gateway = CrearAdaptadorInformacionLocal({
    ...informacion,
    nombre: '',
  });
  assert.deepEqual(
    await ConsultarInformacionAplicacion(gateway)({ idioma: 'es-PE' }),
    { estado: 'no-disponible' },
  );
});
