# Corrección de pérdida de ruta al reanudar — 14/11/2026

El usuario confirmó reservas reales exitosas en Web y Android con el conjunto T019.
Es evidencia manual del usuario, no ejecución de Codex. Confirmó también retorno inesperado
al inicio al cambiar pestaña/app, manteniendo la sesión. No se repitieron reservas ni se
limpiaron datos; T013/T019 siguen abiertas.004 permanece17/34.

## Causa comprobada y cambio

connectSessionLifecycle invalida la sesión al ocultarse y la verifica al reanudar. Eso
publica resolving y limpia identidad/contexto provisionalmente. La guarda raíz aceptaba
solo ready: Stack.Protected retiraba (account) y su historial; el layout privado también
redirigía a sign-in durante esa fase. Tras verificar, ya no existía la ruta anterior.
Ocurre en visibilitychange/pageshow Web y AppState Android, sin necesitar perder tokens.

Se distingue retención de ruta de permiso de contenido. Se conserva el árbol Stack y sus
rutas mientras se verifica o hay error transitorio de red/proveedor; NavigationFrame
de presentación los oculta con display:none, bloquea interacción y accesibilidad.
SessionFeedback permite reintentar sin mostrar datos privados. canEnterAccount sigue
exigiendo ready. signed-out/recovery/perfil incompleto/callback inválido retiran las rutas;
los errores definitivos no quedan ocultos detrás de una pantalla de carga permanente.
La sesión inicial del coordinador ahora es resolving para no expulsar prematuramente
una URL privada durante hidratación. No se cambió JWT ni autorización del servidor.

La misma instancia del navegador permanece montada: no se llama a router.replace/push
en la reanudación. Se conservan ruta/historial, no se promete conservar borradores de
reserva: al verificar sesión/contexto se descartan datos operativos antiguos por seguridad.
La preferencia de barbería se vuelve a validar con membresías/permisos existentes.

Recarga Web: la URL solicitada se conserva mientras se verifica; no se almacena una ruta
como autorización. Android con proceso vivo: misma solución JS, compatible con APK actual.
Recreación con URI preservada puede hidratar esa URI; un proceso destruido por Android
sin URI/estado de navegación restituido no tiene garantía de recuperar la última pantalla.
No se añadió persistencia de rutas ni configuración nativa. No atribuir esa situación al
regreso normal ni afirmar una prueba de recreación todavía inexistente.

Texto de inicio actualizado: las reservas ya se ofrecen desde la cuenta, no una próxima etapa.

## Verificación automática

- Regresión nueva:4 casos RED antes del cambio, GREEN después; ampliada a5 incluyendo
  los conectores reales de ciclo Web/Android con superficies controladas.
- node --test tests/presentation/navigation-resume.test.mjs
  tests/presentation/protected-navigation.test.mjs tests/presentation/session-resolution.test.mjs
  tests/integration/authentication/composition.test.mjs
  tests/integration/authentication/session-lifecycle.test.mjs:31/31, salida0.
- Compilación tsconfig.tests.json y únicamente los tests unitarios session-lifecycle,
  tenant-context y sign-in-out:21/21, salida0; validación/invalidación/logout y respuestas tardías.
- npm run typecheck:0. ESLint de archivos afectados:0. Arquitectura:0,103 módulos/29 núcleo/263 aristas.
- Incidencias conservadas: el cargador de integración sin fileName interpretaba un genérico
  .ts como TSX:15 fallos de parseo, corregidos pasando la ruta real a transpileModule.
  Primera ubicación del View en ruta incumplió ROUTE_EXTERNAL; se extrajo a presentación.
  ESLint detectó2 componentes anónimos de prueba, corregidos con nombres. No se bajaron reglas.
- Son pruebas con dobles/componentes y lógica real; no sustituyen Expo Router en teléfono/navegador.

## Único recorrido manual pendiente (sin nuevas reservas)

1. Web: recargar una vez para recibir el cambio, usar la cuenta local ya confirmada.
   Abrir Mis reservas y anotar mentalmente ruta y una cita existente; cambiar a YouTube
   y volver. Esperado: misma ruta, breve verificación si procede, mismas citas propias.
   Repetir en Reservar una cita sin confirmar nada. Recargar directamente esa URL:
   debe conservarla después de verificar, sin datos privados durante la carga.
2. Inmediatamente Android: recargar el APK actual conectado a192.168.0.16:8081.
   Abrir Mis reservas, cambiar a otra app y volver; repetir en Reservar una cita.
   Esperado: misma pantalla al reanudar, sin retorno al inicio. Si hay barbería elegida,
   conservar la autorizada y su rol tras verificar; Atrás respeta el historial previo.
3. En ambas plataformas cerrar sesión y usar Atrás: no reaparecen datos privados.
   En Web se puede comprobar también recarga de /my-reservations sin sesión: acceso denegado.
   No provocar revocaciones de usuarios ni enviar correos; esos casos están automatizados.

Confirmar por plataforma resultado y cualquier diferencia. No enviar contraseñas/tokens.
No nuevos APK, cuentas, dependencias, operaciones SQL/Cloud/servicios/Metro ni commits.
La URL pública Auth antigua sigue pendiente por decisión del responsable; este recorrido
usa cuentas confirmadas y no necesita enlaces nuevos. Mantener el conjunto T019 intacto.
