# Evidencia parcial — T001–T006

> Estado vigente: T005 y T006 completadas; véase «Cierre verificado de T005–T006» al final. Las secciones anteriores conservan el intento inicial.

Fecha: 2026-11-10, America/Lima. Feature: 001-fundacion-expo-clean.
HEAD antes/después: `86ccdd407e55d870a0c31d26ab8bdf1aaf8a651d`; rama `main`.
Estado inicial limpio. Sin commits, push ni ejecución de T007–T040.

## Resultado

| Tarea | Estado | Evidencia |
| --- | --- | --- |
| T001 | Completada | Entorno e inventario SHA-256 de 585 archivos, excluyendo .git; sin reparse points |
| T002 | Completada | Metadatos npm, plantilla SDK58 generada externamente sin instalación, manifiesto inspeccionado |
| T003 | Completada | Allowlist de cuatro destinos nuevos, sin colisiones ni ancestros incompatibles |
| T004 | Completada | Copia exclusiva de nuevos archivos; 585 originales y referencias/historial Git intactos |
| T005 | Bloqueada | npm install interrumpido al observar ERESOLVE; sin lockfile ni instalación completa |
| T006 | Pendiente | Informe e integridad parcial disponibles; requiere completar T005 y repetir verificaciones |

## Entorno, versiones y generación

Node v24.21.0, npm 11.19.0, PowerShell 7.6.9. Las consultas al registro oficial
confirmaron Expo 58.0.23, React Native 0.88.1, React 19.3.0, Expo Router 58.0.30
y TypeScript 6.0.3, así como engines compatibles con Node local.
Estas son versiones **declaradas y publicadas**, no instalaciones verificadas.
Los cinco manifiestos correspondientes faltan en node_modules tras la interrupción.

Generador: create-expo-app 5.0.0 delegando en create-expo 5.1.7; plantilla
expo-template-default 58.0.32, etiqueta default@sdk-58.
Comando: `npx --yes create-expo-app@5.0.0 <staging externo> --template default@sdk-58 --no-install --no-agents-md --yes`.
Salida 0 en la ejecución persistente. Se retiró Git del PATH exclusivamente para ese
proceso, después de inspeccionar su inicialización automática; el PATH se restauró.
No se generó .git en staging. [Opciones oficiales](https://docs.expo.dev/more/create-expo/).

La primera consulta npm en sandbox falló ENOTFOUND; se repitió fuera de él con autorización.
Tras la reanudación cambió el temporal del sandbox y sus primeros manifiestos quedaron
inaccesibles. Se repitieron inventario, consultas y generación en una carpeta externa
persistente, con Git aún limpio, antes de incorporar archivos. No se usan hashes perdidos
como evidencia. No se eliminaron temporales ni archivos originales.

## Archivos incorporados y límites

- package.json: cinco versiones principales fijas; constants/linking, safe-area y screens
  compatibles; herramientas aprobadas TypeScript, tipos React/Node24, ESLint/config Expo y Prettier.
- app.json: identidad provisional y referencia al icono; sin plugin de splash, servidor web ni backend.
- tsconfig.json: configuración procedente de plantilla; T007 y sus controles adicionales siguen pendientes.
- assets/images/icon.png: icono provisional de plantilla, sin identidad visual final.
- Este informe es nuevo. tasks.md cambia únicamente las casillas T001–T004.
- node_modules contiene residuos parciales de npm; no se limpió, conforme a las restricciones.
  package-lock.json no fue creado. No hay código de pantallas, navegación o casos de uso.

La selección excluye ejemplos, .vscode, scripts de reset, README, AGENTS generado,
UI opcional y configuración de servidor web. El punto de entrada de Router procede del
manifiesto; no existe todavía implementación navegable. No se agregaron scripts de calidad
ni .gitignore de T012. Los archivos nuevos y node_modules permanecerán visibles como no
versionados hasta una tarea autorizada; no ejecutar git add masivo.

## Bloqueo de dependencias

`npm install --registry=https://registry.npmjs.org` emitió
`ERESOLVE overriding peer dependency`. Se interrumpió inmediatamente al observarlo
(salida de la sesión: 1), sin --force, --legacy-peer-deps ni cambios para ignorarlo.
El registro identifica la cadena expo-router 58.0.30 → @radix-ui/react-tabs 1.2.1 →
react-dom 19.3.1. Este último exige React ^19.3.1 y el proyecto fija React 19.3.0.
La resolución también arrastra peers de drawer-layout; deben revisarse contra la matriz
Expo antes del siguiente intento. No se atribuye compatibilidad al árbol parcial.

Siguiente decisión: revisar si se autoriza fijar explícitamente react-dom 19.3.0 (como la
plantilla), conservando React aprobado, y los peers transitivos necesarios compatibles.
Es una propuesta, todavía no aplicada ni verificada. No modificar el plan silenciosamente.

| Comando | Resultado real |
| --- | --- |
| npm ls --depth=0 | Ejecutado tras interrupción: exit 1; dependencias incompletas/extraneous/invalid |
| npx expo install --check | No ejecutado: Expo no está instalado de forma completa |
| npx expo-doctor | No ejecutado: instalación bloqueada; no se descargó para simular validación |

No se ejecutaron tipos, lint, tests, exportación ni Android: no corresponden todavía a
una base funcional en este alcance. No se acredita ningún SC completo de la feature ni
criterio académico por el solo hecho de generar estos archivos.

## Integridad y trazabilidad

FR-001/SC-001: 585 originales comparados tras la copia y la instalación interrumpida,
cero diferencias y cero eliminaciones; HEAD, rama, referencias e historial iguales.
Después se autorizaron únicamente cuatro cambios de casilla en tasks.md; la comprobación
final normaliza exclusivamente esas casillas y exige coincidencia SHA-256 con el original.
FR-002/FR-010: compatibilidad publicada comprobada; instalación/diagnósticos pendientes.
FR-011/SC-006: evidencia parcial y límites documentados. Los demás FR/SC siguen pendientes.

Carpeta externa de manifiestos (conservar para continuar):
`C:\Users\PREDATOR\Desktop\SEMETRE 2026 II\Arquitectura de Software\App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155`

- [Entorno inicial](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/entorno-antes.json>)
- [Inventario SHA-256 original](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/archivos-antes.json>)
- [Versiones y metadatos npm](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/versiones.json>)
- [Generación](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/generacion.json>) y [salida](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/generacion.log>)
- [Allowlist](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/incorporaciones.json>)
- [Integridad tras copia](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/archivos-despues-copia.json>)
- [Instalación interrumpida](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/instalacion.log>) y [conflicto de peers](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/conflicto-peer.log>)
- [npm ls](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/dependencias.log>) y [estados de comandos](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/comprobaciones.json>)
- [Integridad tras intento de instalación](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/archivos-despues-instalacion.json>)
- [Integridad final con casillas autorizadas](<C:/Users/PREDATOR/Desktop/SEMETRE 2026 II/Arquitectura de Software/App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155/integridad-final.json>)

Los scripts externos verificar-versiones.ps1 y verificar-integridad.ps1 conservan el
procedimiento. Este último compara estrictamente con el original: tras actualizar casillas,
reportará tasks.md como cambiado; el informe final distingue esa modificación autorizada.
## Reanudación de T005–T006

El usuario autorizó declarar react-dom 19.3.0 y considerar web compatible. npm view
confirmó peer react ^19.3.0 para react-dom 19.3.0; react-native-web 0.21.4 admite
React/React DOM ^18.0.0 || ^19.0.0. Esta versión coincide con la plantilla SDK58
inspeccionada en T002. Se añadieron exclusivamente esas dos dependencias directas.

npm install normal terminó con código 0, sin nuevos ERESOLVE. Informó 10 vulnerabilidades
moderadas y deprecación de ESLint 9.39.5. No se ejecutó audit fix ni se cambiaron versiones.

Versiones directas reportadas por npm ls --depth=0:
Expo 58.0.23; React Native 0.88.1; React/React DOM 19.3.0; Router 58.0.30;
React Native Web 0.21.4; TypeScript 6.0.3; constants 58.0.15; linking 58.0.16;
safe-area-context 5.11.1; screens 4.30.1; @types/node 24.19.2; @types/react 19.3.0;
ESLint 9.39.5; eslint-config-expo 58.0.4; Prettier 3.9.10.

| Comprobación | Resultado actual |
| --- | --- |
| npm ls --depth=0 | Exit 0; dependencias directas satisfechas |
| npx expo install --check | Exit 0: Dependencies are up to date |
| npx --yes expo-doctor | Exit 1; falla comprobación Metro de las 20 ejecutadas |

Bloqueo actual: Metro → @expo/metro-config → @babel/core → @babel/template →
@babel/code-frame 7.29.7 → @babel/helper-validator-identifier ^7.29.7.
El directorio de este último existe pero carece de package.json; su entrada raíz en
package-lock.json es {}. npm ls de esa cadena devuelve exit 1 y marca el paquete invalid.
Esto apunta a residuos de la instalación parcial anterior; no acredita un conflicto nuevo
de versiones. No se añadió Babel como dependencia directa ni se probaron versiones alternativas.

package-lock.json fue generado (lockfileVersion 3), pero no se acepta como válido hasta
recuperar la instalación y pasar doctor. El próximo paso propuesto es una reinstalación limpia
controlada conservando versiones; no se ejecutó limpieza ni npm ci en esta reanudación.

**T005 y T006 permanecen pendientes.** Sus casillas no se modificaron. No se ejecutó T007–T040,
pruebas de aplicación ni Android. Cambios de esta reanudación: package.json, nuevo
package-lock.json, node_modules local e informe; registros nuevos en la carpeta externa M.

Se contrastaron los 585 archivos del inventario original: cero cambios inesperados;
se mantienen únicamente las casillas autorizadas T001–T004. HEAD 86ccdd407e55d870a0c31d26ab8bdf1aaf8a651d,
rama main, referencias e historial iguales. No se añadió node_modules al índice ni se hizo commit/push.

Evidencias en la carpeta externa M ya enlazada: metadatos-web.json,
instalacion-reanudada.log, dependencias-reanudadas.log, expo-check.log, expo-doctor.log,
arbol-babel.log, comprobaciones-reanudadas.json (incluye SHA-256 del lockfile) e
integridad-reanudada.json. dependencias.log incorpora las tres salidas de esta reanudación.

Observación final: apareció .gitignore durante los comandos Expo de esta reanudación (no existía al inicio). Se conserva para revisión; no se ejecutó la configuración manual de T012. Su contenido se inspeccionó y no incorpora node_modules al índice.

## Cierre verificado de T005–T006

Este apartado sustituye los estados pendientes de los intentos anteriores, conservados como historial.

**Resultados proporcionados por el usuario:** ejecución manual en PowerShell de npm ci
exitosa con 1050 paquetes; npm ls correcto; Expo check actualizado; doctor 20/20.
El usuario informó 11 vulnerabilidades moderadas. Codex no volvió a instalar dependencias.

**Resultados ejecutados por Codex en este cierre**, con registros reproducibles:

| Comando efectivo | Salida | Código |
| --- | --- | --- |
| npm ls --depth=0 | Dependencias directas satisfechas | 0 |
| npx --no-install expo install --check | Dependencies are up to date | 0 |
| node <copia previamente almacenada en caché de expo-doctor>/bin/expo-doctor.js | 20/20 checks passed. No issues detected! | 0 |

Doctor se ejecutó directamente desde su copia existente en
C:/Users/PREDATOR/AppData/Local/npm-cache/_npx/c15e4b19a90d9797/node_modules/expo-doctor/bin/expo-doctor.js,
para garantizar que este cierre no instalara herramientas. No se repitió npm ci ni npm install.

Versiones efectivas: Expo 58.0.23, React Native 0.88.1, React/React DOM 19.3.0,
Expo Router 58.0.30, TypeScript 6.0.3 y React Native Web 0.21.4. Las demás versiones
se conservan en cierre-npm-ls.log. package-lock.json existe y su SHA-256 queda registrado.
El helper Babel ahora está resuelto en ubicaciones anidadas del lockfile con versión 7.29.7;
no se requiere una entrada en la raíz de node_modules. El fallo Metro anterior ya no se reproduce.

**Integridad:** inventario T001 de 585 archivos contrastado; cero cambios inesperados ni
eliminaciones. Única diferencia permitida: casillas T001–T006 de tasks.md. HEAD continúa en
86ccdd407e55d870a0c31d26ab8bdf1aaf8a651d; rama main; referencias e historial iguales.

**Estado final:** T005 y T006 completadas y marcadas [X]. T007–T040 permanecen pendientes.
En este cierre solo se modificaron informe.md y las casillas T005/T006 de tasks.md dentro
del proyecto; se añadieron registros externos. No se cambiaron versiones, código, configuración,
Constitución, rúbrica, plan ni repositorios de referencia. No se hizo commit, push ni git add.

**Riesgo pendiente:** 11 vulnerabilidades moderadas reportadas por npm según el usuario,
pendientes de identificar y evaluar en una tarea posterior. No se ejecutó npm audit fix ni
se declara aprobada una auditoría de seguridad. Continúa registrado el aviso de soporte de
ESLint 9.39.5. La preparación de dependencias no acredita Android, navegación, pruebas de
aplicación ni los demás criterios de éxito de la feature.

Registros en la carpeta externa M enlazada arriba: cierre-npm-ls.log, cierre-expo-check.log,
cierre-expo-doctor.log y sus archivos exit; cierre-t005-t006.json registra fecha, hashes,
Git y atribución de resultados. archivos-despues-instalacion.json contiene el control actualizado;
dependencias.log consolida las tres comprobaciones de cierre. Los archivos de intentos anteriores
se conservan para trazabilidad. Fecha y entorno exactos constan en cierre-t005-t006.json.

## Preparación T007–T009

T007, T008 y T009 completadas como configuración y preparación verificadas. Véase [evidencia y límites](herramientas.md). El núcleo real, sus pruebas y su cobertura siguen pendientes; no se ejecutaron T010–T040.

## Verificador arquitectónico T010–T011

T010 y T011 completadas: 38 escenarios comprobados (5 válidos, 33 inválidos). [Evidencia, reglas y límites](arquitectura.md), [salidas y códigos](arquitectura-fixtures.log). El núcleo real sigue pendiente de T026; el checker rechaza EMPTY_CORE en el proyecto actual. Cambios locales de T007–T009 preservados; sin ejecución de T012–T040.

## Integración de controles y UI T012–T013

T012 y T013 completadas. [Cambios, comandos y límites](t012-t013.md). Lint, formato y tipos UI pasan; check sigue detenido por núcleo vacío. Los 38 fixtures arquitectónicos pasan; faltan unitarias reales. Android y accesibilidad en dispositivo siguen pendientes. Sin ejecución de T014–T040.

## Navegación T014–T017

T014–T017 completadas: bienvenida, información técnica, retorno y ruta desconocida. [Detalles y verificaciones](t014-t017.md). Tipos app, lint, formato y cableado de callbacks pasan. EMPTY_CORE/TS18003 core permanecen; Android y accesibilidad real pendientes. No se ejecutaron T018–T040.

## Registro manual parcial T018–T019

Se registró la ejecución Android/Expo Go y los resultados satisfactorios declarados por el usuario, sin atribuirlos a Codex. [Entorno](android-entorno.md) y [navegación, límites y comprobaciones](android-navegacion.md). T018 y T019 siguen pendientes por datos del entorno, tres ciclos consecutivos, cabecera, reinicio y capturas no acreditados. El 200 % exacto sigue pendiente de validación posterior. Tipos app, callbacks y lint pasan; formato falla por tsconfig.json previamente modificado, conservado sin cambios.

## Actualización de cierre T018–T019

T018 completada: Honor 90 Lite CRT-NX3, Android 15, Expo Go 58.0.5, LAN/Metro, datos declarados por el usuario. Se verificaron visualmente las capturas reales .jpeg de Bienvenida y Base técnica (no existen los .png indicados). T019 sigue pendiente solo de confirmar Atrás de cabecera; ver la flecha no acredita su uso. Tres recorridos, reapertura y arranque sin Supabase confirmados por el usuario. [Entorno](android-entorno.md), [navegación y límites](android-navegacion.md). Formato de tsconfig.json corregido sin cambiar JSON; tipos app, callbacks, lint y formato pasan. El 200 % exacto sigue pendiente. Sin ejecución de T020–T040.

## Cierre documental de T019 — 10/11/2026

T019 completada: el usuario confirmó el funcionamiento de la flecha Atrás de cabecera en Honor 90 Lite (CRT-NX3), Android 15. [Registro adicional y evidencias anteriores](android-navegacion.md). La prueba fue manual y declarada por el usuario, no ejecutada por Codex. Esta actualización resuelve el único criterio que quedaba pendiente; se conservan los reportes anteriores como historial. El escalado exacto al 200 % continúa pendiente. No se ejecutaron T020–T040 ni se modificó código, dependencias o configuración.

## Pruebas y dominio T020–T022 — 11/11/2026

T020–T022 completadas dentro de alcance: pruebas futuras con rojo registrado, tipos propios y validación runtime. [Resultados y límites](t020-t022.md). El guard pasa 14/14 pruebas con cobertura 100 %; tipos app/core y arquitectura pasan, pero la suite completa y lint de tests/unit permanecen en rojo por módulos de T023/T024 aún no implementados. No se ejecutaron T023–T040 ni se declara cierre de US2/T026.

## Caso de uso y adaptador T023–T024 — 11/11/2026

T023 y T024 completadas. [Evidencias y límites](t023-t024.md): 50/50 unitarias, 38/38 regresiones arquitectónicas, cobertura del núcleo 100 % en líneas/funciones/ramas. Tipos, lint, formato y checker pasan. Los rojos anteriores quedan resueltos sin alterar sus registros. No se ejecutaron T025–T040 ni se conectó la UI con el caso de uso.

## Composición y proveedor T025 — 11/11/2026

T025 completada. [Evidencias y límites](t025.md): composición real, contexto de presentación y proveedor montado en el layout. 53/53 unitarias y 38/38 regresiones arquitectónicas; tipos, lint, formato, checker e integración React pasan. Cobertura del núcleo 100 %; no se atribuye ese porcentaje a UI/composición. La consulta visual y el reintento siguen en T027; no se ejecutaron T026–T040. Android no se volvió a probar.

## Auditoría real T026 — 11/11/2026

T026 completada: 19 módulos auditados, incluidos 4 de núcleo; cero infracciones y cero dependencias externas alcanzables desde el núcleo. 53/53 unitarias y 38/38 regresiones arquitectónicas aprobadas; tipos, lint y formato pasan. Cobertura del núcleo 100 % en líneas/funciones/ramas. [Auditoría y límites](t026.md), [pruebas](nucleo-pruebas.log), [cobertura](nucleo-cobertura.log), [checker real](arquitectura-real.log). No se modificaron fuentes ni checker. La pantalla técnica continúa estática; T027–T040 pendientes.

## Consulta real en pantalla T027 — 11/11/2026

T027 completada: la pantalla técnica consume el caso de uso desde el contexto, con carga, datos reales, error y reintento. Se ignoran respuestas obsoletas/tras desmontar y se bloquean duplicados. [Pruebas, resultados y límites](t027.md). El chequeo final pasa: 53 unitarias, 38 regresiones arquitectónicas y 6 pruebas de presentación. Cobertura 100 % solo del núcleo. Navegación automatizada conservada; Android no se volvió a probar. Sin ejecución de T028–T040.

## Corrección de empaquetado posterior a T027 — 11/11/2026

Se reprodujo el error de Metro y se corrigieron tres imports ejecutables en dos archivos, conservando los `.js` de tests y tipos. [Causa, corrección y resultados](t027-metro.md). Exportación Android real con Hermes: salida 0, 1161 módulos; el primer intento corregido tuvo un bloqueo de permisos, conservado en su registro. TypeScript, lint, formato y checker pasan; 53 unitarias, 38 regresiones arquitectónicas y 6 pruebas de presentación aprobadas. Navegación/proveedor automatizados pasan. Artefactos fuera del repositorio. Pendiente volver a probar esta versión en Android; el 200 % exacto sigue sin acreditarse. Sin ejecución de T028–T040, instalaciones, commit ni push.

## Límites de backend T028 — 11/11/2026

T028 completada: [composición actual/futura, inspección y límites](limites-backend.md). Sin SDK de backend activo, API Node, rutas +api ni carpetas Supabase; sin firmas conocidas de secretos en la inspección acotada, que no equivale a auditoría integral. No se atribuyen RLS/transacciones al adaptador local. `npm run check` pasa: 53 unitarias, 38 regresiones arquitectónicas y 6 pruebas de presentación, tipos, lint, formato y checker; compatibilidad Node de la corrección Metro conservada. El usuario confirmó funcionamiento Android posterior a la corrección; [registro manual atribuido al usuario](android-navegacion.md), no ejecutado por Codex. Siguen pendientes 200 % exacto y análisis de 11 vulnerabilidades moderadas. Sin ejecución de T029–T040, instalaciones, commit ni push.
