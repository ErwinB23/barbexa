import type { InformacionAplicacionGateway } from '../application/app-information-gateway.js';

export function CrearAdaptadorInformacionLocal(
  configuracion: unknown,
): InformacionAplicacionGateway {
  return {
    async obtener() {
      if (
        typeof configuracion !== 'object' ||
        configuracion === null ||
        !('nombre' in configuracion) ||
        !('version' in configuracion) ||
        !('descripcion' in configuracion)
      ) {
        throw new Error('Información local no disponible');
      }
      const { nombre, version, descripcion } = configuracion;
      if (
        typeof nombre !== 'string' ||
        nombre.trim().length === 0 ||
        typeof version !== 'string' ||
        version.trim().length === 0 ||
        typeof descripcion !== 'string' ||
        descripcion.trim().length === 0
      ) {
        throw new Error('Información local no disponible');
      }
      return Object.freeze({ nombre, version, descripcion });
    },
  };
}
