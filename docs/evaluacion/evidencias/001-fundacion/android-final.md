# T033 — validación final Android pendiente

Registro: 11/11/2026. Versión a comprobar: HEAD `d585e78` más cambios locales
T029–T031; [estado y controles](t032-t034.md). T032 permanece bloqueada.

El usuario declaró previamente funcionamiento en Honor 90 Lite CRT-NX3,
Android 15, Expo Go 58.0.5, LAN/Metro; navegación y recuperación satisfactorias
en la versión anterior. [Historial atribuido al usuario](android-navegacion.md).
Codex no ejecutó esas pruebas ni realizó una sesión Android nueva.

Falta acreditar sobre la versión con StatusMessage y galería:

- Tres recorridos Bienvenida → Base técnica → Atrás, incluida cabecera.
- URL desconocida con recuperación, reinicio y consulta sin credenciales.
- Vistas locales sin internet conservando acceso LAN a Metro.
- Capturas nuevas de la versión final y resultados vinculados a su diff.

Las regresiones automáticas de navegación pasan; la exportación Hermes también.
Ninguna sustituye estos criterios manuales. No se añadieron capturas ni resultados
supuestos. T033 conserva `[ ]`; no se ejecutaron pruebas de escalado de T035.

## Actualización documental — 11/11/2026

**T033 sigue pendiente parcialmente.** El bloqueo de T032 consignado arriba es
histórico: T032 ya está completada. La versión actual corresponde a `main`, HEAD
`d585e78c3fa8f01e62ae2ce70d8f859d97acbb58` más cambios locales T029–T032 y la
actualización Expo 58.0.24 / Router 58.0.31 / Constants 58.0.16 / Linking 58.0.17.
No se modificó esa versión durante esta revisión documental.

### Pruebas recientes declaradas por el usuario

Dispositivo reportado: Honor 90 Lite CRT-NX3, Android 15, Expo Go 58.0.5, LAN.
El usuario confirmó información consultada visible en Base técnica, galería de
carga/vacío/error/éxito visible, recuperación y restablecimiento funcionales y
navegación al inicio correcta. Con la aplicación previamente cargada, activó
modo avión y la información local y los botones continuaron funcionando.

**Origen:** pruebas manuales realizadas y declaradas por el usuario; Codex no
ejecutó Android. La comprobación en modo avión acredita el uso local previamente
cargado, no el arranque offline de una aplicación instalada. Tampoco confirma
por sí sola que LAN/Metro permaneciera accesible durante ese tramo.

### Capturas verificadas por Codex

Ambos archivos existen con los nombres previstos y se abrieron visualmente:

- [android-final-informacion.jpeg](capturas/android-final-informacion.jpeg):
  texto legible, cabecera Base técnica, información disponible, nombre, versión
  0.1.0 y descripción; comienzo de la galería y control deshabilitado.
- [android-final-estados.jpeg](capturas/android-final-estados.jpeg): galería legible,
  carga, vacío, muestra de error ya recuperada, acción de restablecimiento,
  muestra de éxito y botón Volver al inicio.

La segunda captura muestra la recuperación, no el mensaje de error anterior.
Las imágenes respaldan el contenido visible; no prueban pulsaciones, secuencia
de recorridos, conectividad, modelo del teléfono ni escala exacta. No se
inventaron metadatos ni se alteraron las capturas.

### Criterios restantes para cerrar T033

- Confirmación de tres ciclos completos Bienvenida → Base técnica → Atrás en
  esta versión, incluido regreso del sistema y de cabecera. «Navegación al inicio»
  no identifica automáticamente esos controles ni acredita tres repeticiones.
- Ruta desconocida con recuperación y reinicio desde raíz sin credenciales en
  la versión final. Las pruebas antiguas se conservan, pero no se reasignan a
  esta sesión: el contenido y dependencias cambiaron desde entonces.
- Confirmación de acceso LAN/Metro conservado durante la prueba sin internet,
  como exige literalmente T033; el uso local precargado sí está acreditado.

No se repitieron verificaciones automáticas costosas ni se ejecutaron T034–T040.
Se conserva el reporte previo de texto máximo utilizable; el 200 % exacto sigue
sin acreditarse. La casilla T033 permanece `[ ]` hasta completar lo anterior.

## Confirmaciones finales adicionales — 11/11/2026

Origen de todos los resultados siguientes: pruebas manuales realizadas y
declaradas por el usuario, no ejecutadas por Codex. Misma versión final con
cambios locales y mismo dispositivo: Honor 90 Lite CRT-NX3, Android 15,
Expo Go 58.0.5, conexión LAN con Metro.

Quedan acreditados Bienvenida, información técnica, cuatro estados de la galería,
recuperación/restablecimiento y tres recorridos consecutivos correctos usando
flecha de cabecera y Atrás de Android. También ruta desconocida con retorno al
inicio, cierre completo y reapertura de Expo Go sin solicitar credenciales e
información técnica cargada correctamente después del reinicio. Se mantienen
las dos capturas finales verificadas en la revisión anterior.

El usuario confirma funcionamiento de información y controles locales en modo
avión con la aplicación ya cargada. LAN y Metro se usaron con conexión activa;
**no está acreditado que Metro fuera accesible durante el modo avión**. Cierre
y reapertura con conexión tampoco demuestran arranque offline de una aplicación
instalada. Se conservan separados estos tres resultados.

**Estado definitivo con la evidencia disponible: T033 pendiente de un único
criterio literal**, «comprobar vistas locales sin internet manteniendo Metro
accesible». El uso local sin internet y la sesión LAN/Metro están acreditados
por separado, pero no su combinación simultánea. Los demás pendientes de la
sección anterior quedan resueltos por estas nuevas confirmaciones. No se cambia
la definición aprobada de la tarea ni se marca `[x]` sin acreditar ese criterio.

No se ejecutaron T034–T040. Permanecen pendientes el análisis de las 9
vulnerabilidades moderadas y la acreditación del 200 % exacto. Sin cambios de
código, pruebas, configuración, dependencias, commit ni push.

## Ajuste autorizado del criterio y cierre de T033 — 11/11/2026

Decisión explícita del responsable del proyecto: sustituir la comprobación sin
internet manteniendo Metro accesible por la comprobación de información y
controles locales de la aplicación previamente cargada sin acceso a internet.
Metro es una herramienta de desarrollo, no un requisito de funcionamiento de
la aplicación distribuida. Se actualizan únicamente T033 en tasks.md y el paso 7
correspondiente de quickstart.md para mantener consistente el procedimiento.

Se contrastaron la Constitución v1.0.1, FR-003/FR-007/FR-011, SC-002, validation.md
y la rúbrica (en particular SDD, pruebas E2E e interfaz). Ninguno exige acceso
simultáneo a Metro durante la desconexión: era una condición del procedimiento
de desarrollo. Se conservan navegación final, arranque sin Supabase, trazabilidad,
capturas y distinción entre evidencia y límites. No se modifica la Constitución,
la especificación, el plan ni la rúbrica; tampoco se declara validado un criterio
académico completo por este ajuste.

**T033 completada conforme al criterio ajustado.** La prueba manual declarada por
el usuario en Honor 90 Lite CRT-NX3, Android 15, Expo Go 58.0.5 acredita información
y controles locales funcionales en modo avión con la aplicación previamente
cargada. Las confirmaciones finales y capturas registradas arriba acreditan los
demás criterios: tres recorridos, Atrás de cabecera/Android, fallback, reinicio
sin credenciales e información tras reinicio. Codex no ejecutó esas pruebas.

No se probó arranque offline ni comunicación con Metro durante la desconexión.
Los estados pendientes anteriores se conservan como historial y quedan
superados solo por esta decisión autorizada. T034–T040 y el análisis de las
9 vulnerabilidades moderadas permanecen pendientes; 200 % exacto no acreditado.
