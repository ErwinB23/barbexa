# Navegación Android — T019 pendiente

Todos los resultados manuales siguientes fueron realizados y declarados por el usuario.
Codex no ejecutó Android, Expo Go ni TalkBack. En la actualización de cierre se
inspeccionaron dos capturas suministradas por el usuario (véase detalle abajo).
Este documento conserva el reporte como evidencia declarada, sin convertirlo en medición automática.

| Comprobación | Resultado declarado / límite |
| --- | --- |
| Bienvenida visible | Satisfactorio, declarado por el usuario |
| Navegación a pantalla técnica | Satisfactorio, declarado por el usuario |
| Regreso por botón de la aplicación | Satisfactorio, declarado por el usuario |
| Atrás de Android por botón o gesto | Satisfactorio, declarado por el usuario |
| Ruta desconocida y recuperación | Satisfactorio, declarado por el usuario; URL concreta no documentada |
| TalkBack: lectura y navegación | Satisfactorio, declarado por el usuario; sin auditoría de todos los roles/estados |
| Texto ampliado | Utilizable, declarado por el usuario; escala efectiva desconocida |
| Tres recorridos consecutivos | Tres recorridos sin errores, confirmados por el usuario |
| Atrás de cabecera | No confirmado por separado del botón dentro de la vista |
| Reinicio desde raíz | Cierre/reapertura de Expo Go con inicio correcto en Bienvenida, declarado por el usuario |
| Arranque sin backend/credenciales | Sin backend Supabase, confirmado por el usuario |
| Capturas o grabación | Dos JPEG existentes, inspeccionados visualmente por Codex |

**Estado T019: pendiente únicamente de confirmar el funcionamiento de Atrás de cabecera**,
distinto de «Volver al inicio» dentro de la vista y del botón/gesto Atrás de Android.
T018 ya está documentada; los tres recorridos, reapertura en Bienvenida y arranque sin
Supabase quedan acreditados como declaraciones del usuario y las capturas se verificaron.
Fecha/hora exacta y snapshot de código de la sesión manual no fueron proporcionados;
se conserva esa limitación de procedencia sin inventar metadatos.
Se conserva como aprobado declarado el subconjunto ya reportado: no se invalida esa experiencia.

El escalado exacto al **200 % permanece pendiente** para FR-009/SC-005 y su futura tarea
T035. No es un requisito expreso de cierre de T018/T019 y no constituye su único bloqueo.
Registrar TalkBack aquí no ejecuta ni completa T034. No se ejecutaron T020–T040.

## Comprobaciones automáticas de Codex

Resultados reproducibles en t018-comprobaciones.json y t018-*.log:

- TypeScript de aplicación: exit 0.
- Verificador de callbacks de rutas existente: exit 0. Usa sustituciones en la frontera;
  no monta Expo ni comprueba navegación física.
- npm run lint: exit 0.
- npm run format:check: exit 1 por tsconfig.json. Ese archivo ya tenía cambios locales
  antes de esta revisión (formato expandido y eliminación de includes de tipos Expo).
  Se preservó sin corregirlo, dado el alcance limitado a evidencias T018/T019.

Inventario T001: 585 originales cotejados; cero diferencias no autorizadas, considerando
solo las casillas T001–T017 de tasks.md. t018-integridad.json incluye hashes y resultado.
Los archivos creados después de T001, como tsconfig.json, no pertenecen a ese inventario;
su cambio local se registra aparte y no se presenta como verificado contra T001.
HEAD actual se conserva en main, 16b2a7cc1513ef301b3f8caa4bd162dbabc88766; difiere del
HEAD de T001 por commits posteriores del usuario. Codex no hizo commit ni push.

## Actualización de cierre

T018 se marcó completada; T019 permanece sin marcar. No se declara aceptada toda US1 ni SC-002.

Codex abrió y examinó ambos archivos reales:

- [Bienvenida](capturas/android-bienvenida.jpeg): se observa App Barbería y la acción «Ver base técnica».
- [Base técnica](capturas/android-base-tecnica.jpeg): se observa «Una base para crecer»,
  el botón «Volver al inicio» y una flecha Atrás de cabecera.

Los nombres reales terminan en .jpeg; los .png mencionados por el usuario no existen.
No se renombraron ni editaron las imágenes. La correspondencia visual con las vistas
está comprobada; la imagen no prueba que se pulsara la flecha, ni acredita modelo,
versión del sistema, porcentaje de escala o fecha de sesión. No se extrajeron metadatos EXIF.

En esta revisión se corrigió exclusivamente el formato de tsconfig.json y se comprobó
equivalencia de su JSON antes/después. No se restauraron ni cambiaron sus includes.
La incidencia de formato del registro anterior queda resuelta; los logs históricos
t018-format.log y demás se conservan intactos. Nuevas comprobaciones de Codex:
tipos de aplicación, callbacks de rutas, lint y format:check, todas exit 0.
Registros: t018-cierre-comprobaciones.json, t018-cierre-*.log y t018-cierre-integridad.json.
El 200 % exacto continúa sin acreditarse; no se ejecutaron T020–T040 ni se instaló nada.

**Verificación adicional — 10/11/2026**

El usuario confirmó que, en su Honor 90 Lite (CRT-NX3), Android 15, la flecha de retroceso de la cabecera de la pantalla «Base técnica» permite regresar correctamente a «Bienvenida», sin errores.

**Origen de la evidencia:** prueba manual declarada por el usuario; no ejecutada por Codex.

**Estado actualizado: T019 completada.** Esta confirmación satisface el último criterio pendiente, junto con las evidencias anteriores. Los estados pendientes consignados arriba se conservan como historial. El escalado exacto al 200 % continúa sin acreditarse para la validación posterior de accesibilidad.
