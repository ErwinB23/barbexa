# T029 — calidad consolidada

## Cierre reproducible desde Git — 25/11/2026

Estado ejecutado:9192d1a en un checkout independiente, sin configuración privada,
dependencias ni reportes previos. npm ci exit0(1027 paquetes); npm run check exit0.
493/493 núcleo/integración,652/652 presentación/integración (solapados),38+45
arquitectura,18 entorno y96 Deno: cero fallos/omitidas en las suites ejecutadas.
Tipos, lint, formato, grafos y umbrales originales aprobados.
Cliente45 archivos:3808/3808 líneas,447/447 funciones,1725/1852 ramas(93,1425%).
Servidor29 archivos con perfiles nuevos:1640/1640 líneas,99/99 funciones,1007/1007 ramas.
OpenAPI:26 rutas,33 comandos,11 solicitudes/7 respuestas contrastados;3 pruebas dentro
de check. report-server-coverage,validate-openapi,export-web-ci y prepare-ci-artifacts:
exit0. Exportación compile-only sin .env/credenciales;4 JSON agregados, no despliegue.

La prueba de reportes usaba mkdtempSync bajo .artifacts inexistente: ENOENT. Ahora
crea un temporal único del sistema y registra limpieza en t.after con límites de
propiedad comprobados. RED original y GREEN independiente/concurrente acreditados
desde cwd vacío; no crea .artifacts allí ni deja temporales propios. El otro ajuste
retira la ruta personal de Docker del helper manual, usando PATH como los runners.
Pruebas dirigidas19/19 fuera del sandbox; dentro, la prueba de junction sufrió EPERM
del entorno restringido, sin cambiarla ni deshabilitarla.

Los runners de compilación/coverage/export preparan sus recursos. Las utilidades
históricas con fixtures/credenciales/infraestructura reales son gates explícitos
separados, no dependencias del check seguro. No se ejecutaron ni modificaron sus
contratos históricos. No dependencia de .agents en la validación automatizada.

El commit documental final solo incorpora documentación/evidencias ya aprobadas;
su árbol ejecutable se contrasta con el commit probado antes del cierre. Resumen
sanitizado: [reproducibilidad.json](reproducibilidad.json). Logs crudos ignorados en
.artifacts/local-commits/final-*.log. Node24.21.0,Deno2.9.8; umbrales sin cambios.
GitHub remoto/upload y actionlint no ejecutados; no acredita Cloud, Android físico,
SQL/HTTP reales, k6, E2E desplegado o CD. Los resultados inferiores son antecedentes.

## Verificación posterior a correcciones funcionales — 15/11/2026

`npm.cmd run check`: **exit0** en la versión actual. Tipos, lint, formato, grafos reales,
38 regresiones de arquitectura cliente,157 unitarias,172 integración/presentación,
45 regresiones del checker servidor,18 guardas de entorno y36 pruebas Deno aprobadas.
Núcleo cliente:100% líneas/funciones,94,89% ramas. El comando no crea datos de Supabase.
Bundles completos servidos por Metro: Web200/Android200; no APK ni prueba física nueva.

Fallos y correcciones de este bloque: importación de UI directa desde rutas detectada
por el checker, corregida mediante presentación/composición sin debilitar reglas; errores
de lint corregidos. La primera ejecución final pasó17/18 guardas porque el sandbox negó
una junction temporal (EPERM). El mismo check completo fuera de esa restricción pasó0;
no se cambió el test ni se declaró esa limitación una denegación de seguridad válida.

Regresiones dirigidas: si falla la generación segura del ID de cancelación antes de enviar,
se libera el control y no se anuncia un resultado incierto inexistente. Captura PKCE y
limpieza posterior del estado de Expo Router, espera del montaje, conservación de la ruta
durante verificación y rechazo tras salida. No se repitieron reservas/cancelaciones/SQL
ni carreras con datos; sus evidencias anteriores mantienen su alcance histórico.

Navegador real de Codex: enlace de recuperación inválido retiró sus parámetros y mostró
error seguro sin nueva contraseña. Android solo bundle y pruebas con dobles en este
bloque. Ningún nuevo resultado físico se atribuye al usuario. El rediseño se detuvo.

Escaneo acotado:125 archivos,0 patrones sensibles detectados; no auditoría integral ni
remediación npm. Diff global2 por log activo,0 excluyendo solo ese log, staging vacío.
Main/0ccd33c; sin add/commit/push. Solo se inició Metro tras autorización; sin cambios de
servicios Supabase, datos, migraciones, Cloud, paquetes o APK. T013/T027 siguen abiertas.

Los resultados inferiores conservan la verificación anterior y su historial.

15/11/2026. `npm run check` **código 0**, versión actual de cliente004 y recovery003.
[Salida completa](t028-t029/check-final.log), [comando/código](t028-t029/check-final.json).
Tipos completos/servidor, lint sin warnings, Prettier y ambos grafos reales aprobados.
Cliente115 módulos/32 core/324 aristas; servidor33/17/74.

| Suite ejecutada | Resultado |
| --- | --- |
| Regresiones checker cliente | 38/38 |
| Unitarias cliente | 157/157; núcleo100% líneas/funciones,94,89% ramas |
| Integración segura y presentación | 160/160 |
| Regresiones checker servidor | 45/45 |
| Guardas entorno/runner002 | 18/18 |
| Casos Deno servidor | 36/36 |
| Cobertura núcleo servidor por archivo | 100% líneas/funciones/ramas en los13 archivos ejecutables incluidos |

[Informe por archivo servidor](t028-t029/server-core-coverage.log). El check incluye
explícitamente los tests no mutantes de003/004 mediante `run-client-checks.mjs`, incluyendo
recovery, caché, ruta/hidratación, agenda y cancelación. No arranca DB, no crea fixtures ni
repite carreras/HTTP reales ya acreditados. Las pruebas dobles no sustituyen esas evidencias
reales ni los recorridos físicos. El log contiene diagnósticos negativos esperados de los
checkers con fixtures prohibidas; no son fallos del grafo productivo.

## Fallos conservados y correcciones

1. `.test-build` había sido creado por tsc directo y carecía del marcador de propiedad.
   El runner rechazó borrarlo. No se debilitó: se comprobó que sus62 archivos coincidían
   exactamente con el emit del compilador actual, sin enlaces, se conservó copia ignorada
   y solo entonces se restauró el marcador correcto. [Prueba](t028-t029/output-provenance.json).
2. Las150 unitarias iniciales pasaron, pero el gate100% líneas falló por agenda cubierta
   solo en .mjs. Se añadieron cuatro unitarias significativas de validación, scope,
   fallos/respuestas tardías/disposal; el gate pasó. Ningún umbral se redujo.
3. El sandbox Windows no permite crear las junctions del test de entorno. El mismo
   comando, ejecutado fuera del sandbox autorizado, pasó18/18; luego check completo0.
4. Coverage Deno sin el mismo DENO_DIR no encontraba transpilation. Recolección e informe
   con `.artifacts/deno-cache` dieron100% por núcleo; sin exclusiones de archivos ejecutables.
5. Recovery añadió dos errores de lint de las pruebas (import Buffer y nombre de doble
   React). Se corrigieron y el check completo se repitió hasta0.

## Evidencia manual declarada y discrepancias pendientes

El usuario reportó publicación/invitaciones y ambas cancelaciones sin incidencias. Se
registra como declaración **del usuario**, no ejecución de Codex. La lectura posterior
en LOCAL mostró publicación válida, pero invitación A→administradorB `pending` y ninguna
membresía A del destinatario; las citas finales9a679512 yb8980a05 seguían `confirmed`,
con cero eventos de cancelación. [Oferta](t028-t029/t013-after-manual.json),
[citas](t028-t029/cancellations-after-manual.json).

No se aceptó invitación, canceló cita ni cambió membresía para hacer concordar resultados.
**T013/T027 permanecen pendientes** hasta reconciliar evidencia durante el único recorrido
final autorizado por el usuario. Se conservan citas T019 y las siete sintéticas.
Los resultados previos de SQL/HTTP/concurrencia y restauración exacta de roles permanecen
válidos en sus alcances; no se repitieron ni se inventan resultados UI por ellos.

T030 espera recuperación real/accesibilidad conjunta; T032/T033 requieren permisos de
Cloud/origen/herramientas/carga. Nueve avisos npm no remediados; no auditoría npm aprobada.
T034 no se cierra: datos conservados, casillas físicas y publicación aún pendientes.

[Revisión Git](t028-t029/git-review.json): main/0ccd33c, staging vacío; diff global2
por el log activo y0 excluyendo únicamente ese archivo. Cambios previos conservados;
no se ejecutó git add/commit/push. El escaneo acotado no encontró patrones sensibles
en los archivos nuevos revisados; no constituye certificación del repositorio completo.

## Sprint 2 — pruebas y cobertura, 24/11/2026

Estrategia conservada: Node24.21/node:test + assert, Deno2.9.8 y SQL/pgTAP existente.
No se instaló Jest ni se retiraron dependencias: las referencias @jest/jest-worker
del lock son transitivas de herramientas existentes, sin framework/configuración Jest propio.

Medición cliente: mismo inventario de núcleo ejecutable y umbrales100/100/90.
Inicial:191/191 unitarias; líneas63,39%, funciones84,82%, ramas92,78%.
Final combinado:472/472 (196 unitarias +276 integraciones seguras), líneas98,2931%
(3743/3808), funciones96,3387%(421/437), ramas91,5836%(1654/1806).
El aumento combina casos nuevos con ejecución real de módulos antes cargados en VM
anónima: load-core usa salida tsc durante cobertura; conserva VM fuera de ese modo.
No se contabilizan como cobertura del núcleo cliente las ejecuciones de servidor.
Se conservan precarga de todos los módulos, exclusiones originales y umbrales.
Faltan65 líneas y16 funciones, principalmente reprogramación, autoridad, invitaciones,
notificaciones e inicio privado; detalle por archivo/línea en summary.json/HTML.

Servidor:76/76 iniciales,84/84 finales. Universo29 archivos de núcleo ejecutable
contrastado con LCOV, sin archivos ejecutables omitidos.
Líneas78,59→85,12195%(1396/1640), funciones93,87→97,9798%(97/99),
ramas87,34→88,9602%(693/779). Gate Deno100% en las tres métricas, todavía fallido.
Faltan244 líneas y2 funciones; principal brecha care.ts (111 líneas y2 funciones),
más validaciones de cierres, operaciones y reprogramación. No promediar cliente/servidor.

Casos añadidos:5 unitarios (contraseñas Unicode/requisitos/confirmación, diagnóstico
Google y ciclo de sesión, perfil profesional/links/inyección y respuestas tardías);
1 regresión de presentación LCOV (conteos exactos, líneas ausentes y escape HTML).
Deno:7 contratos existentes de autoridad/Yape reutilizados con importación real,
más1 caso nuevo de actor no verificado. No se sustituyeron pruebas anteriores.
test:client:631/631 (355 presentación +276 integración; solapa276 con el combinado).
Arquitectura/entorno:101/101; primer intento bloqueado por EPERM de junction del
sandbox, repetición autorizada fuera del sandbox aprobada. No pruebas Cloud.
Tipos cliente/servidor, lint y checkers arquitectónicos aprobados.
Formato de los14 archivos técnicos modificados aprobado.
npm run check:exit1 en formato por4 fuentes de interfaz preexistentes:
self-schedule-web.tsx, agenda-web.tsx, my-reservations-screen.tsx y payments-rules-web.tsx.
No se modifican por la restricción de interfaces. El global se detuvo antes de tests;
las suites y cobertura se ejecutaron por separado. No declarar calidad global aprobada.

Reproducción: npm run coverage:client; npm run test:client; npm run coverage:server;
npm run check:server; npm run architecture:check; npm run check.
Reportes separados: coverage/client y coverage/server, cada uno con lcov.info,
summary.json e index.html. Node informa JS emitido por tsc; Deno informa TypeScript.
Sentencias: no suministradas por los runners; no se inventa esta métrica.
Logs iniciales/finales y controles: .artifacts/sprint2-quality/*.log.

EQ-01/02: denegaciones, identidad/contexto y respuesta ajena; EQ-03: deduplicación,
conflicto y delegación transaccional; EQ-07: contrato de entrega fallida sin revertir
negocio; EQ-08: núcleos/puertos y101 controles de arquitectura/entorno; EQ-10:
conservación de condiciones en reservas/reprogramación. Respaldo parcial por dobles
y contratos: no acredita por sí solo RLS/SQL, concurrencia real, correo externo ni E2E.
Se conservan evidencias SQL/pgTAP históricas, sin nueva ejecución de BD en este bloque.
Pendientes: umbrales completos, formato global, SQL/E2E/Android y criterios externos.
Sin cambios de producción, migraciones, Constitución, Cloud, dependencias, Git o k6.

## Cierre de calidad y auditoría de código — 25/11/2026

Estado final: **npm run check exit0**, sin modificar umbrales ni comportamiento
productivo. Primer intento aislado aprobó las suites previas y falló17/18 de entorno
por junction EPERM; repetición completa autorizada fuera del sandbox pasó18/18 y
continuó hasta Deno96/96. No se omitió el test para conseguir el resultado.
Logs: .artifacts/quality-closure/global-check-authorized.log (global final),
global-check.log (intento aislado), server.log y server-fresh.log (ambos gate100%).

| Métrica del núcleo | Inicio de este bloque | Resultado final | Umbral |
| --- | --- | --- | --- |
| Cliente líneas | 98,2931% | 100% (3808/3808) | 100% |
| Cliente funciones | 96,3387% | 100% (447/447) | 100% |
| Cliente ramas | 91,5836% | 93,0923% (1725/1853) | 90% |
| Servidor líneas | 85,1220% | 100% (1640/1640) | 100% |
| Servidor funciones | 97,9798% | 100% (99/99) | 100% |
| Servidor ramas | 88,9602% | 100% (1007/1007) | 100% |

Universos conservados:45 archivos ejecutables cliente y29 servidor. No se promedian
métricas ni se interpreta cobertura del núcleo como cobertura total de React/SDK/SQL.
Servidor contrastado también con recolección nueva en server-fresh, sin perfiles previos.
La variación de ramas V8 entre ejecuciones se conserva tal como la reporta el runner.
La última línea cliente era el cierre exitoso del callback onAccepted, no el guard
redundante; se contrastó con JS emitido y se añadió el caso real de refresco exitoso.

Suites finales (no sumar porque hay solapamiento):
- Cliente combinado487/487:196 unitarias y291 integraciones seguras.
- Presentación/integración646/646:355 presentación y las mismas291 integraciones.
- Checkers/entorno101/101:38 cliente +45 servidor +18 entorno.
- Deno96/96; cobertura servidor exit0 y fresh exit0.
- TypeScript cliente/núcleo/servidor, Deno check, lint, formato y grafos: aprobados.
Nuevos casos:15 Node (3 contratos care +12 de cierre) y12 Deno (3 care,4 validación,
5 aplicación). Cubren identidad/contexto, estados terminales/horarios, configuración,
eventos/Yape, duplicados, pagination/cursor, fallos inciertos de correo y callbacks.

Archivos del bloque: tests/contracts/care-contract.mjs; integraciones booking
care-contract/quality-closure; Deno reservations/care-contract y barbershop-operation
validation-closure/application-closure; scripts/client-test-files.mjs; cuatro fuentes
de formato y los documentos de calidad/contexto/seguridad existentes. Tests previos
conservados; no nueva dependencia, framework, exclusión o cambio de runner en este bloque.
Formato permitido: self-schedule-web, agenda-web, my-reservations-screen, payments-rules-web.
Cada archivo final coincide exactamente con Prettier aplicado a su fuente del respaldo.
Hashes verificaron intacto todo el resto de src, backend, migraciones, SDD y Constitución;
ver preservation.json y format-verification.json en .artifacts/quality-closure.
El formato/código de los tests nuevos también pasó controles dirigidos.

LCOV/HTML/JSON: coverage/client y coverage/server. Resúmenes por archivo y líneas
pendientes conservados; sentencias no suministradas por runners. Comandos existentes:
npm run coverage:client; npm run coverage:server; npm run test:client; npm run check.
Auditoría de contratos/código y hallazgos clasificados en evidencias003/seguridad-web.md.
No hubo SQL/Cloud/browser autenticado nuevo, Android físico, despliegue ni k6.
EQ-01/02/03/07/08/10 mantienen respaldo parcial de contratos y evidencias SQL históricas;
el paso de calidad no acredita por sí solo esos escenarios completos en producción.

## OpenAPI y Swagger — 25/11/2026

Especificación principal: `docs/api/openapi.json`, OpenAPI3.0.3, API0.1.0.
Inventario:26 rutas,32 operaciones HTTP incluyendo4 preflight OPTIONS. Las cuatro
Edge conservan POST `/functions/v1/{ensure-profile,create-barbershop,barbershop-operation,reservation-command}`.
Las dos últimas contienen33 variantes operativas y17 de reserva/atención (incluye10 care),
con `oneOf` y discriminadores cuando corresponde; no se crean rutas por comando.
También:11 RPC del cliente,10 recursos PostgREST (GET y2 PATCH) y GET `/auth/v1/user`.
SQL privado y puertos internos quedan fuera; login/PKCE/refresh/recovery son servicios
administrados del SDK, referenciados a Supabase Auth, no una nueva API propia.

Comandos reproducibles desde la raíz, con dependencias del lockfile instaladas:

```text
npm run docs:api:build
npm run docs:api:check
npm run docs:api
```

Abrir `http://127.0.0.1:8082`. Cerrar el visor con Ctrl+C en su terminal. Puerto ocupado:
el script falla sin reemplazar servicios. Solo sirve5 recursos estáticos en loopback,
acepta GET/HEAD y no actúa como proxy. En el entorno Codex el acceso del navegador
requirió lanzar este comando fuera del sandbox; no se modificaron firewall ni permisos.

Swagger UI5.36.0 y swagger-parser13.1.0 son dependencias dev exactas. Sin CDN,
validador externo, credenciales precargadas o autorización persistente. Try it out
deshabilitado; interceptor probado bloquea incluso consultas a otros orígenes y POST
al propio visor. CSP restringe conexiones al origen documental. JWT Bearer+apikey
documentados conjuntamente, sujetos a permisos contextuales/RLS del servidor.

Verificación: parser OpenAPI/referencias internas y operationId únicos; inventario
de comandos contrastado con dispatch real y RPC con adaptadores;11 solicitudes y7
respuestas sintéticas contrastadas con validadores reales;3 pruebas aprobadas.
Carga observada en Brave: título,4 Edge, tags PostgREST/Auth y modelos presentes,
sin error de carga. Log reproducible: `.artifacts/openapi-validation.log`.
El test OpenAPI está incluido en la lista segura del control general; inventario y
ejemplos se verifican además con `docs:api:check`, utilizable en un CI futuro.

Mantenimiento: regenerar tras cambios de tipos/contratos, revisar metadatos explícitos
del generador y ejecutar validación. El generador aprovecha el checker TypeScript,
pero no sustituye revisar restricciones SQL ni estados específicos de cada comando.
PostgREST usa proyecciones SQL snake_case, diferenciadas de DTO camelCase; sus
proyecciones variables se señalan abiertas donde corresponde. Aceptación definitiva
de transferencia de propiedad sigue bloqueada; no se anuncia como operación disponible.
Los ejemplos no acreditan ejecución Cloud ni pagos reales. Sin cambios del producto,
contratos, migraciones, SDD, Constitución, Android, datos o Cloud; sin Jest, k6 o despliegue.

Control global `npm run check`: exit0 fuera del sandbox;652 presentación/integración
y96 servidor, además de pruebas del núcleo/checkers/entorno; tipos, lint, formato y
grafos aprobados. Cliente3808/3808 líneas,447/447 funciones y1725/1852 ramas
(93,1425%); mismos45 archivos y umbrales. La variación V8 frente a1853 ramas del
registro previo no es una exclusión nueva. Log `.artifacts/openapi-check-host.log`.
Primer intento en sandbox falló `spawn UNKNOWN` al crear un proceso de prueba;
se repitió el control completo con autorización fuera del sandbox. Validación final
de los scripts/tests documentales y formato aprobada también tras los últimos ajustes.
Archivos de este bloque: docs/api/{openapi.json,index.html,swagger-init.js}, scripts
build-openapi/validate-openapi/serve-api-docs, test booking/openapi, lista segura
client-test-files, package.json/lockfile y estos documentos de calidad/contexto.

## Integración continua preparada — 25/11/2026

.github/workflows/quality.yml usa Windows, Node24.21.0 y Deno2.9.8; npm ci y un solo
npm run check. DENO_COVERAGE_DIR recoge perfiles nuevos durante las96 pruebas Deno
de check. report-server-coverage.mjs ahora acepta ese directorio (mantiene fallback)
y genera/gatea cobertura sin repetir los tests. El solapamiento previo de integración
en los dos runners Node permanece; no se añadió otro check completo al workflow.
La prueba OpenAPI ya entra en check; validate-openapi.mjs añade inventario/ejemplos
sin lanzar de nuevo esa suite. No se cambiaron umbrales ni universos.

Después: export-web-ci.mjs compila Web con .env deshabilitado, sin EXPO_PUBLIC ni
credenciales/perfiles de Supabase/Google/SMTP/EAS heredados; no inicia servicios ni
contacta backend. Exige una salida nueva dentro de .artifacts, sin borrar resultados
previos; salida alternativa controlada por BARBEXA_CI_WEB_OUTPUT. Es una validación
de compilación, no un paquete con configuración funcional de producción o despliegue.
prepare-ci-artifacts.mjs produce solo4 JSON de métricas cliente/servidor y huellas
de validación API/build. Sin rutas absolutas, usuarios, logs o código ejecutable.

Validación local equivalente al workflow, con dependencias existentes:

```text
# Definir DENO_COVERAGE_DIR como ruta absoluta nueva para esta ejecución.
npm run check
node scripts/report-server-coverage.mjs
node scripts/validate-openapi.mjs
node scripts/export-web-ci.mjs
node scripts/prepare-ci-artifacts.mjs
```

Resultados: check exit0;493 casos combinados de núcleo/integración,652 presentación/
integración,38+45 arquitectura,18 entorno y96 Deno (hay solapamiento, no sumar).
Cliente45 archivos:3808/3808 líneas,447/447 funciones,1725/1852 ramas(93,1425%).
Servidor29 archivos, perfiles nuevos:1640/1640 líneas,99/99 funciones,1007/1007 ramas.
OpenAPI válido y3 pruebas aprobadas;11 solicitudes/7 respuestas con validadores reales.
Export Web exit0,55 archivos inspeccionados; la credencial pública de .env.local no
aparece en ellos.4 artefactos JSON verificados sin campos privados ni rutas locales.
YAML parseado con js-yaml existente; verificaciones de eventos, permisos, SHAs,
comandos y allowlist aprobadas. Versiones Node/Deno coinciden con las instaladas;
ninguna dependencia nueva. Formato/lint dirigidos y control global aprobados.

Logs privados: .artifacts/repository-preparation/{check,server-coverage,web-build}.log;
perfiles nuevos en server-profiles; artefactos sanitizados en ci-artifacts/*.json.
No se reinstaló node_modules mediante npm ci en esta estación; queda configurado para
checkout limpio remoto. No hay actionlint instalado ni se simuló el runner GitHub;
la ejecución remota, descargas de setup, npm ci remoto y upload se comprobarán solo
al autorizar publicación/CI. El workflow no acredita SQL/HTTP reales, E2E desplegado,
Android físico, k6 o CD. Esos gates permanecen separados; no se ejecutó ninguno.
Referencia de exportación: https://docs.expo.dev/more/expo-cli/#exporting.
