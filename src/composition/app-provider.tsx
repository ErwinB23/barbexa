import type { ReactNode } from 'react';

import { InformacionAplicacionContext } from '../features/foundation/presentation/information-context';
import { CrearComposicionAplicacion } from './app-composition';

// Metadatos públicos de esta entrega. La prueba de integración detecta desajustes con app.json.
const consultar = CrearComposicionAplicacion({
  nombre: 'App Barbería',
  version: '0.1.0',
  descripcion: 'Fundación técnica de App Barbería',
});

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <InformacionAplicacionContext.Provider value={consultar}>
      {children}
    </InformacionAplicacionContext.Provider>
  );
}
