import { createContext } from 'react';

import type { ConsultarInformacionAplicacion } from '../application/get-app-information';

export const InformacionAplicacionContext = createContext<ReturnType<
  typeof ConsultarInformacionAplicacion
> | null>(null);
