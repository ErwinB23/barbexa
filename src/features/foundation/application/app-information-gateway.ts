import type { InformacionAplicacion } from '../domain/app-information.js';

export interface InformacionAplicacionGateway {
  obtener(): Promise<InformacionAplicacion>;
}
