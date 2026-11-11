import type {
  ResultadoInformacion,
  SolicitudInformacion,
} from '../domain/app-information.js';
import { EsSolicitudInformacionValida } from '../domain/validate-information-request';
import type { InformacionAplicacionGateway } from './app-information-gateway.js';

export function ConsultarInformacionAplicacion(
  gateway: InformacionAplicacionGateway,
): (solicitud: SolicitudInformacion) => Promise<ResultadoInformacion> {
  return async (solicitud) => {
    if (!EsSolicitudInformacionValida(solicitud)) {
      return { estado: 'entrada-invalida' };
    }
    try {
      const informacion = await gateway.obtener();
      return { estado: 'ok', informacion };
    } catch {
      return { estado: 'no-disponible' };
    }
  };
}
