import type { SolicitudInformacion } from './app-information.js';

export function EsSolicitudInformacionValida(
  solicitud: unknown,
): solicitud is SolicitudInformacion {
  return (
    typeof solicitud === 'object' &&
    solicitud !== null &&
    !Array.isArray(solicitud) &&
    'idioma' in solicitud &&
    solicitud.idioma === 'es-PE'
  );
}
