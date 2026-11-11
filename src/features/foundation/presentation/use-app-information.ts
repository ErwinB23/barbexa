import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import type { InformacionAplicacion } from '../domain/app-information';
import { InformacionAplicacionContext } from './information-context';

type EstadoInformacion =
  | { estado: 'cargando' }
  | { estado: 'exito'; informacion: InformacionAplicacion }
  | { estado: 'error' };

export function useAppInformation() {
  const consultar = useContext(InformacionAplicacionContext);
  const [estado, setEstado] = useState<EstadoInformacion>({
    estado: 'cargando',
  });
  const activo = useRef(false);
  const enCurso = useRef(false);
  const solicitudActual = useRef(0);

  const reintentar = useCallback(async () => {
    if (!activo.current || enCurso.current) return;
    const solicitud = ++solicitudActual.current;
    enCurso.current = true;
    setEstado({ estado: 'cargando' });
    try {
      const resultado = await consultar?.({ idioma: 'es-PE' });
      if (!activo.current || solicitud !== solicitudActual.current) return;
      setEstado(
        resultado?.estado === 'ok'
          ? { estado: 'exito', informacion: resultado.informacion }
          : { estado: 'error' },
      );
    } catch {
      if (activo.current && solicitud === solicitudActual.current) {
        setEstado({ estado: 'error' });
      }
    } finally {
      if (solicitud === solicitudActual.current) enCurso.current = false;
    }
  }, [consultar]);

  useEffect(() => {
    activo.current = true;
    const generacion = solicitudActual.current;
    void Promise.resolve().then(() => {
      if (activo.current && generacion === solicitudActual.current) {
        return reintentar();
      }
    });
    return () => {
      activo.current = false;
      solicitudActual.current += 1;
      enCurso.current = false;
    };
  }, [reintentar]);

  return { estado, reintentar };
}
