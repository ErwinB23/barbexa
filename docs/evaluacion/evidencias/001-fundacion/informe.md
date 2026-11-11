# Informe consolidado — 001-fundacion-expo-clean — cierre T040

**Corte documental: 11/11/2026, America/Lima.** Rama `main`, HEAD
`66c2f39448274e0ccb8ed47c09bf48d78e9177d4`. Al iniciar T038: modificados
este informe y `specs/001-fundacion-expo-clean/tasks.md`; no versionados aún
`reproduccion.md`, `reproduccion.log` y `t037.md` (trabajo autorizado T036–T037).
El código del corte es el del commit indicado; esos cambios son documentales.

**T001–T040 completadas: fundación cerrada técnicamente**, con los criterios
vigentes revisados y riesgos pendientes explícitos. [Cierre e integridad](cierre.md).
T039 creó [el contexto compartido](../../../../ESTADO-DESARROLLO.md). Esta sección
es el estado vigente; el historial inferior conserva fallos y estados anteriores
que quedaron superados por las comprobaciones y decisiones posteriores.

## Base de evidencia, entorno y atribución

| ID | Evidencia / fecha y entorno | Comando, resultado y límite |
| --- | --- | --- |
| G | [Reproducción T037](t037.md), [salidas](reproduccion.log), [guía T036](reproduccion.md); 11/11/2026, Windows, Node 24.21.0, npm 11.19.0, PowerShell 5.1; HEAD del corte más documentación T036 | Codex: npm ci pasó tras EACCES inicial/reintento autorizado; npm ls, npm run check, expo install --check, Doctor 1.21.6 y exportación Android: salida 0. Doctor 20/20; 67 unitarias, 38 regresiones arquitectónicas, 11 de presentación. 1141 módulos y Hermes 2.4 MB. Instalación aislada, no prueba física Android. |
| I | [Preservación T037](t037.md) y reproduccion.log; mismo entorno/fecha/versión que G. Inventarios originales T001–T006 en el historial inferior (10/11/2026, HEAD 86ccdd4) | 799/799 SHA-256 iguales en principal y copia antes del cierre documental; lockfile intacto. Preservación inicial de 585 archivos documentada en el historial. Revisión actual no sustituye el cotejo final T040. |
| A | [Android final](android-final.md), [información](capturas/android-final-informacion.jpeg), [estados](capturas/android-final-estados.jpeg); registros 11/11/2026, Honor 90 Lite CRT-NX3, Android 15, Expo Go 58.0.5 | Pruebas manuales declaradas por el usuario sobre la interfaz final, posteriormente incorporada a HEAD 66c2f39: tres ciclos con Atrás sistema/cabecera, fallback, reapertura sin credenciales y consulta. Uso local precargado en modo avión; no arranque offline ni Metro durante desconexión. Sin código nuevo en T036–T038; no se atribuyen estas pruebas a Codex ni a una sesión móvil de la copia T037. |
| U | [TalkBack y decisión T034](android-talkback.md), [texto/contraste y enmienda T035](android-texto-contraste.md), [pruebas específicas](t035-comprobaciones.log); registros 11/11/2026, mismo Android que A | Usuario: lectura/navegación y controles finales, texto máximo legible/funcional sin recortes ni superposiciones. Codex: controles configurados >=48×48, roles/disabled, scroll/zonas seguras y contraste; pruebas Node aprobadas. Sin medición instrumental nativa ni 200 % exacto. Método y umbral revisados con autorización expresa. |
| B | [Límites de backend](limites-backend.md), [inspección](t028-limites.log); 11/11/2026, revisión fuente y manifiestos | Inspección acotada de imports/paquetes/rutas y firmas de secretos: salida 0; no SDK backend activo, API Node ni rutas +api. No auditoría integral de secretos ni seguridad. Integraciones y garantías de servidor aún no implementadas. |

G reutiliza ejecuciones reales de T037, no una ejecución nueva de T038.
La cobertura 100 % líneas/funciones/ramas de G corresponde solo al núcleo ejecutable
(caso de uso y validador); no a UI, estilos o adaptador. El checker auditó 21 módulos,
4 de núcleo y 37 aristas. Sus 38 fixtures incluyen casos inválidos que deben fallar:
sus códigos 1 esperados no son un fallo de la suite.

## Matriz FR-001–FR-011

Los ID de evidencia remiten a la tabla anterior con fecha, entorno, versión,
comando/código, atribución y límites. «Acreditado» se limita a esta fundación.

| Requisito | Estado y evidencia | Resultado / límite |
| --- | --- | --- |
| FR-001 | Acreditado por etapas, I y cierre T040 | Expo incorporado sin reinicializar Git; inventarios e integridad de copia/reinstalación conservados. Cambios documentales/Expo posteriores autorizados, no sobrescrituras de plantilla. Cotejo final T040 completado en cierre.md. |
| FR-002 | Acreditado, G+A | Expo 58.0.24, RN 0.88.1, Router 58.0.31, React 19.3.0, TS 6.0.3; lockfile y guía reproducidos. Android identificado; web/iOS no acreditados. |
| FR-003 | Acreditado, A+G y [rutas](t031-rutas.log) | Bienvenida, técnica, Atrás y fallback; rutas delgadas. Pruebas móviles del usuario y callbacks automatizados, no E2E móvil automatizado. |
| FR-004 | Acreditado, G y [auditoría](t026.md) | Módulo foundation con presentación, aplicación, dominio, infraestructura y composición; tres capas lógicas sin imponer tres despliegues. Backend futuro no implementado. |
| FR-005 | Acreditado, G | Núcleo con tipos propios, sin SDK/HTTP/React/SQL ni dependencias transitivas prohibidas; tipos, aliases, reexports y ciclos cubiertos por checker/fixtures. No demuestra autorización de backend. |
| FR-006 | Acreditado, G y [contrato](../../../../specs/001-fundacion-expo-clean/contracts/foundation.md) | Mismo puerto con adaptador local real y doble; éxito, entrada inválida y rechazo probados; composición explícita. No entidades de negocio ficticias. |
| FR-007 | Acreditado en alcance local, B+A | Arranque sin credenciales Supabase, sin API Node; composiciones futuras documentadas. No Auth, RLS, RPC, transacciones, Storage ni aislamiento multitenant reales acreditados. |
| FR-008 | Acreditado, U y [componentes/galería](t029-t031.md) | Tokens y componentes compartidos, cuatro muestras etiquetadas, consulta real y recuperación diferenciadas. No pantallas de negocio. |
| FR-009 | Acreditado con método revisado, U | Lectura asistida y máximo de fuente disponible; mínimos táctiles configurados, uso sin obstrucciones y contraste calculado. Sin medición nativa ni equivalencia máximo=200 %. |
| FR-010 | Acreditado, G | Scripts repetibles, tipos estrictos, lint, formato, regresiones y pruebas del contrato en 0. Advertencias y vulnerabilidades no ocultadas. |
| FR-011 | Evidencia consolidada y guía disponibles, G+A+U+este informe | FR/SC, comandos, límites y capturas vinculados; contexto T039 y cierre T040 documentados. |

## Matriz SC-001–SC-006

| Criterio vigente | Estado de evidencia al corte | Evidencia / límite |
| --- | --- | --- |
| SC-001 | Acreditado con diferencias autorizadas | I y [cotejo final T040](cierre.md): 585 originales, 581 idénticos, 4 documentos autorizados; sin eliminaciones. |
| SC-002 | Acreditado en Android identificado | A y guía G; tres recorridos, fallback y reinicio declarados por usuario. No prueba nueva del teléfono en T038. |
| SC-003 | Acreditado para núcleo local | G; auditoría de todos los módulos y dos adaptadores del mismo contrato, sin alterar núcleo. |
| SC-004 | Acreditado | G; todos los controles definidos pasan, incluyendo los tres resultados del contrato; seguridad npm no se considera aprobada por esto. |
| SC-005 revisado | Acreditado conforme al método/umbral autorizados | U; conservar enmienda de US3/SC-005 y ajuste T034. No acreditar dimensiones nativas ni 200 % exacto. |
| SC-006 | Acreditado como trazabilidad con límites explícitos | Matrices, fuentes y estados de este informe; contexto T039 y cierre T040 completados. Las contribuciones académicas siguen siendo parciales; no se valida toda la rúbrica. |

No se modifica el alcance aprobado para llenar estas matrices. Los antecedentes
que mencionan 200 % obligatorio o T033/T034/T035 pendientes son históricos:
sus decisiones posteriores están enlazadas en A y U. La validación exacta al
200 % queda como trabajo futuro, no condición vigente de cierre de esta fundación.

## Contribución a la rúbrica académica

Fuente: [RUBRICA.md](../../RUBRICA.md). **Ningún criterio académico se declara
validado en su totalidad** por existir esta documentación o por una base local.

| Criterio | Contribución / estado |
| --- | --- |
| 1. Problema y requisitos | Parcial: especificación FR/SC y trazabilidad; falta desarrollo y validación del negocio completo. |
| 2. Análisis y diseño | Parcial: plan, contratos y diseño técnico de esta fundación. |
| 3. Arquitectura | Parcial: cliente modular auditado; servidor y sistema multitenant aún no implementados. |
| 4. SDD | Parcial: spec/plan/tasks y enmiendas explícitas con evidencia; no finalización de todo el producto. |
| 5. Unitarias e integración | Parcial: G, composición/adaptador local y presentación; sin integración Supabase/persistencia real. |
| 6. E2E | Parcial: recorridos Android manuales A/U; sin suite E2E móvil automatizada ni flujos de negocio. |
| 7. Interfaz/UX | Parcial: galería, navegación, TalkBack y texto máximo; límites de U preservados. |
| 8. Escalabilidad frontend/backend | Pendiente: no pruebas de escala o backend desplegado. |
| 9. Escalabilidad BD | Pendiente: no base/integración/carga real. |
| 10. Dominio, DNS/CDN | Pendiente: no configuración ni evidencia de despliegue. |
| 11. Caché | Pendiente: adaptador local no constituye implementación/evaluación de caché. |
| 12. CI/CD | Pendiente: npm run check local no equivale a pipeline CI/CD. |
| 13. k6 | Pendiente: no ejecución de carga. |
| 14. Código y BD en GitHub | Pendiente de entrega evaluable; Git local no acredita publicación ni BD. No se hizo push. |
| 15. Informe final | Pendiente: este informe de fundación contribuye, no sustituye la entrega académica final. |
| 16. Presentación y dominio | Pendiente de sustentación; no deducible de archivos. |

## Riesgos y trabajo posterior

- **9 vulnerabilidades moderadas** confirmadas por npm ci de T037, sin análisis
  concluido ni aceptación formal. No se declara auditoría de seguridad aprobada.
  T038 exige consolidación, no un análisis de seguridad nuevo: no se ejecutaron
  npm audit ni npm audit --omit=dev. Falta clasificar producción/desarrollo,
  directas/transitivas, exposición y acciones antes de resolver o aceptar el riesgo.
- Sin Supabase real, permisos/RLS/atomicidad, caché, DNS/CDN, CI/CD o k6; no atribuir
  garantías remotas a los metadatos locales. [Composiciones futuras](limites-backend.md).
- Sin validación web/iOS, arranque offline instalado o medición nativa de escala.
- T039 y T040 completadas: contexto compartido y auditoría final enlazados arriba.

## Verificaciones nuevas de T038

Lectura de Git (`status --short`, rama, HEAD), contraste de requisitos/evidencias
y comprobación de enlaces locales de esta consolidación. No se repitieron
instalaciones, pruebas, exportación ni verificaciones manuales. `git diff --check`
y cotejo SHA-256 al cierre verifican que solo se actualizan este informe y la
casilla T038. Fecha/entorno del corte indicados arriba; resultados de G son reutilizados.

---

## Historial de evidencias

Se conserva el contenido previo íntegro. Sus estados son los de cada registro,
no sustituyen la consolidación vigente anterior.

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

## Componentes y galer?a T029?T031 ? 11/11/2026

T029, T030 y T031 completadas. [Contraste, componentes, pruebas y l?mites](t029-t031.md). Tokens existentes aprobados sin cambios; StatusMessage compartido y galer?a etiquetada con recuperaci?n local independiente de la consulta real. Controles finales: 67 unitarias, 38 regresiones arquitect?nicas y 11 pruebas de presentaci?n aprobadas; tipos, lint, formato y auditor?a de 21 m?dulos pasan. Navegaci?n automatizada conservada. No se repitieron pruebas manuales Android; el 200 % exacto sigue sin acreditarse. Sin ejecuci?n de T032?T040, instalaciones, commit ni push.

## Verificaci?n T032?T034 ? 11/11/2026

[Resultados y bloqueo](t032-t034.md). T032 pendiente: check y navegaci?n pasan (67 unitarias, 38 arquitect?nicas, 11 de presentaci?n), exportaci?n Android/Hermes aprobada; expo install --check falla y Doctor obtiene 19/20 por cuatro parches esperados distintos de los instalados. Sin actualizaci?n de paquetes. T033 y T034 pendientes de recorridos finales/offline/capturas y TalkBack con medidas nativas; [Android final](android-final.md), [TalkBack](android-talkback.md). Evidencias manuales anteriores conservadas y atribuidas al usuario. No se ejecut? T035?T040; 200 % exacto y an?lisis de vulnerabilidades siguen pendientes. Sin cambios de c?digo, commit ni push.

## Cierre de T032

T032 completada tras la actualizacion de Expo realizada por el usuario. Versiones instaladas y manifiestos consistentes comprobados por Codex sin reinstalar. El usuario reporta npm ls correcto, expo install --check actualizado, Doctor 20/20, check en 0 (67/38/11 pruebas) y exportacion Android correcta (1141 modulos, Hermes 2.4 MB); no se atribuyen esos comandos a Codex. Detalle y atribucion: [cierre T032](t032-t034.md#cierre-de-t032--11112026). Riesgo vigente: 9 vulnerabilidades moderadas pendientes de analisis, sin auditoria de seguridad aprobada. T033 y T034 siguen pendientes y no se ejecutaron T033-T040. Sin cambios de codigo, pruebas o versiones, commit ni push por Codex.

## Evidencia manual parcial de T033 — 11/11/2026

El usuario confirmó información consultada, galería, recuperación/restablecimiento,
regreso al inicio y uso local precargado en modo avión, en Honor 90 Lite CRT-NX3,
Android 15, Expo Go 58.0.5. Codex verificó visualmente las dos capturas nuevas
`android-final-informacion.jpeg` y `android-final-estados.jpeg`, legibles; no
ejecutó las pruebas Android. [Resultados y límites](android-final.md).
T033 permanece pendiente de los tres ciclos finales con Atrás sistema/cabecera,
fallback, reinicio desde raíz sin credenciales y confirmación de acceso LAN/Metro
durante el tramo sin internet. No se acredita arranque offline ni 200 % exacto.
Solo documentación actualizada; cambios locales anteriores preservados. Sin
T034–T040, instalaciones, commit ni push.

## Confirmaciones finales adicionales de T033 — 11/11/2026

El usuario confirmó en la versión final tres recorridos consecutivos con Atrás
de cabecera/Android, fallback con retorno, cierre/reapertura sin credenciales y
consulta correcta tras reinicio, además de galería y recuperación. Se conservan
las dos capturas finales ya verificadas. [Registro actualizado](android-final.md).
Son pruebas manuales declaradas por el usuario, no ejecutadas por Codex.
T033 queda pendiente únicamente de acreditar vistas sin internet manteniendo
Metro accesible simultáneamente: el usuario confirmó uso local precargado en
modo avión y LAN/Metro con conexión activa, sin confirmar Metro en modo avión.
No se afirma arranque offline. No se modificó la casilla ni se ejecutaron
T034–T040. Siguen pendientes 9 vulnerabilidades moderadas y 200 % exacto.

## Cierre de T033 con ajuste autorizado — 11/11/2026

T033 completada tras sustituir, por decisión explícita del responsable, el requisito
de Metro accesible durante la desconexión por uso local de la aplicación previamente
cargada sin internet. [Justificación, conformidad y evidencia](android-final.md).
Se actualizan T033 y el paso 7 de quickstart; no hay conflicto con Constitución,
FR/SC o rúbrica. Pruebas y capturas existentes declaradas por el usuario cubren
los criterios ajustados; no se afirma arranque offline ni Metro durante modo avión.
Sin ejecución de T034–T040 ni cambios de código, dependencias o pruebas.

## Verificación parcial de T034 — 11/11/2026

Se registraron las pruebas de TalkBack de estados finales, recuperación, regreso,
comodidad táctil y ausencia de contenido oculto declaradas por el usuario.
[Comprobaciones y límites](android-talkback.md): 11/11 pruebas de presentación
aprobadas por Codex; mínimos configurados 48×48 y SafeAreaView/scroll revisados.
T034 sigue pendiente de medidas nativas y detalle manual de nombre/rol, disabled,
orden/foco de todos los controles. No se equipara configuración con medición.
No se ejecutó T035–T040; 200 % exacto y análisis de 9 vulnerabilidades pendientes.

## Cierre autorizado de T034 — 11/11/2026

T034 completada con método de evidencia ajustado explícitamente por el responsable:
comprobación técnica (mínimos 48×48, roles, disabled, foco y zonas seguras), 11
pruebas aprobadas y recorrido TalkBack/uso sin obstrucciones declarado por el usuario.
[Decisión y límites](android-talkback.md). No hay medición instrumental nativa ni
200 % exacto confirmado. Se conserva el requisito de tamaño; SC-005 completo y
T035–T040 siguen pendientes. Sin cambios de código o dependencias, commit ni push.

## Verificación parcial de T035 — 11/11/2026

T035 permanece pendiente: no se acredita escala efectiva 200 %, recorrido y
restauración con escalas antes/durante/después ni medidas/capturas de ese ensayo.
[Texto y contraste](android-texto-contraste.md): Codex ejecutó 67 unitarias
(14 de contraste) y 4 pruebas de componentes, todas aprobadas; escalado habilitado,
scroll y ratios verificados técnicamente, sin medición nativa. Se conserva la
prueba de texto máximo declarada por el usuario sin equipararla a 200 %.
T034 sigue cerrada; SC-005 no se declara completo. Sin T036–T040; 9 vulnerabilidades
moderadas pendientes de análisis. No se modificaron código ni dependencias.

## Revisión condicionada del cierre de T035 — 11/11/2026

T035 permanece pendiente: SC-005 y el escenario 2 de US3 exigen expresamente
texto al 200 %, porcentaje no acreditado por el máximo disponible declarado.
La propuesta condicionada del responsable no puede aplicarse solo a la tarea
sin contradecir la especificación vigente. [Revisión y límites](android-texto-contraste.md).
Se conservan las evidencias parciales y la validación exacta como obligación
futura pendiente, sin afirmar mediciones nativas ni cierre de SC-005. No se
solicitaron pruebas nuevas ni se ejecutaron T036–T040.

## Cierre de T035 tras enmienda autorizada de SC-005 — 11/11/2026

T035 completada. El responsable autorizó expresamente cambiar escenario 2 de US3
y SC-005 a máximo de texto disponible en Android identificado; se armonizaron
tasks.md, validation.md y quickstart.md. El usuario repitió y confirmó textos
legibles/comprensibles, botones funcionales y visibles, sin recortes,
superposiciones o errores. Se combina esa evidencia manual con las comprobaciones
automatizadas existentes, sin atribuir pruebas de celular a Codex.
[Decisión y límites](android-texto-contraste.md). No se midió 200 % ni dimensiones
nativas de ese escalado; queda como validación futura, sin resultados inventados.
Sin ejecución de T036–T040, cambios de código/dependencias, commit ni push.

## Guía de reproducción T036

T036 completada: [reproduccion.md](reproduccion.md), con prerrequisitos, 16 versiones
efectivas del lockfile, comandos Windows, diagnóstico de errores, pasos Android,
contraste y límites vigentes. Git inicial limpio en main; commit comprobado
66c2f39448274e0ccb8ed47c09bf48d78e9177d4. Codex consultó Node/npm/PowerShell y
comprobó consistencia de dependencias entre manifiesto y raíz del lockfile.
No se ejecutó npm ci ni reproducción general: corresponde a T037. Siguen pendientes
9 vulnerabilidades moderadas y validaciones futuras documentadas. Sin código,
dependencias, requisitos aprobados, instalaciones, commit o push modificados.

## Reproducción aislada T037

T037 completada: [procedimiento, resultados y límites](t037.md) y
[salidas reales](reproduccion.log). Copia externa del estado actual, sin reemplazar
node_modules principal. npm ci pasó tras reintento autorizado por EACCES inicial;
check, npm ls, compatibilidad Expo, Doctor 20/20 y empaquetado Hermes pasan.
67 unitarias, 38 regresiones arquitectónicas y 11 de presentación aprobadas.
799/799 hashes iniciales intactos en ambas carpetas antes del cierre documental.
Persisten 9 vulnerabilidades moderadas pendientes de análisis; sin auditoría
de seguridad aprobada ni pruebas manuales Android nuevas. Sin T038–T040 ni commit/push.
