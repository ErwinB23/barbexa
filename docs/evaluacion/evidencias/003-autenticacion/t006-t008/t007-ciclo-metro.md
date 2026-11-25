# Diagnóstico y corrección autorizada de resolución T007

**Actualización**: [T007 confirmada manualmente](t007-android-manual.md); sonda retirada.
Se conserva el siguiente diagnóstico y su estado histórico de espera.

13/11/2026. Usuario reportó advertencia Require cycles y salida probeLoaded:false,
sin resultados de SecureStore. Es evidencia manual declarada; no ejecución Android de Codex.

Codex reprodujo resolución con metro-resolver instalado: desde session-storage.native.ts
el import ./session-storage con platform=android/preferNativePlatform=true resuelve al
mismo session-storage.native.ts; Web resuelve al propio session-storage.web.ts. La
exportación esperada createSessionStorage pertenece al archivo común, no al adaptador.
El ciclo deja esa exportación sin inicializar; los tests anteriores sin resolución por
plataforma no lo detectaban. Esto demuestra un defecto concreto y compatible con ambos
síntomas reportados, sin atribuir otras posibles advertencias del runtime a esta causa.

Además, la sonda construía storage fuera del try: un fallo allí llegaba al catch genérico
que imprimía probeLoaded:false, aun si el módulo había cargado. No era evidencia de fallo
de almacenamiento/payload. Se informó antes de modificar y el usuario autorizó expresamente
renombrado/imports y regresión, sin cambiar la lógica de almacenamiento.

Corrección: común session-storage.ts → session-storage-core.ts, imports de ambos adaptadores
actualizados. Ninguna regla de escritura/lectura/corrupción/cifrado se cambia. Dos regresiones
Metro RED (2 fallos, otras 10 pasan) → GREEN12/12; logs t007-metro-red/green.log.
Tipos cliente y lint de archivos afectados: 0. Arquitectura: 0 (38 módulos, 15 core,
69 aristas), checker intacto. No se repitieron baterías ajenas ni builds.

Instrumentación: construcción dentro de try, phase/errorType con valores seguros, distinción
module-load-failed/probe-export-missing/probe-run-failed y adapter-init. Sin stack/mensaje
original ni secretos. Corto, 4096 caracteres, finally de dos claves y __DEV__/Android
con una ejecución por carga conservados. No hay fallback ni fragmentación que oculte fallo.

Usuario debe recargar completamente App Barbería en Expo Go, no solo Fast Refresh,
y consultar [T007 SecureStore] en consola DevTools; reportar objeto completo. T007 sigue
pendiente de resultado real de teléfono y posterior retirada de instrumentación.
T008+ no ejecutadas, sin instalaciones/Cloud/usuarios/contenedores/commit/push.
