import { ConsultarInformacionAplicacion } from '../features/foundation/application/get-app-information';
import type { InformacionAplicacion } from '../features/foundation/domain/app-information.js';
import { CrearAdaptadorInformacionLocal } from '../features/foundation/infrastructure/local-app-information-adapter';

export function CrearComposicionAplicacion(informacion: InformacionAplicacion) {
  const gateway = CrearAdaptadorInformacionLocal(informacion);
  return ConsultarInformacionAplicacion(gateway);
}
