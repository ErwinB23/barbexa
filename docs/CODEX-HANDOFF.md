# App Barbería — transferencia de contexto

**Actualizado: 26/11/2026, America/Lima.** Rutas relativas a la raíz.
Documento único para continuidad entre sesiones; no sustituye especificaciones/evidencias.
Actualizar solo las secciones afectadas. No interpretar antecedentes como autorización
para repetir operaciones sensibles. El bloque vigente distingue cambios de código preparados de operaciones reales autorizadas.

## 1. Proyecto y prioridades

26 nov — Preparación de entrega Sprint2, SOLO revisión/documentación, sin staging/
commits/push/fetch. README raíz creado (no existía); índice de cinco entregables:
docs/entrega/sprint2/INDICE.md; guía de sustentación y PUBLICACION.md con tres
commits propuestos y procedimiento de CI posterior. main/23commits/a758dfa;
origin/main almacenado coincide, sin reconsulta de remoto/visibilidad/cuota.
Selección explícita archivos-publicacion.csv:229 propuestos (47 instrumentación,
26 harness,156 documentación),3 vistas QA regenerables locales. La lista incluye
estos docs nuevos. Revisar de nuevo al autorizar publicación; no git add global.
Se conservan221 originales pendientes iniciales, salvo continuidad de estos dos
documentos;219 hashes de fuentes/evidencias inalterados. Copias sanitizadas de5logs
EQ08 y1monitor, más proyección cobertura histórica con SHA de fuente en entrega/
sprint2/evidencias. No se rerun tests/cobertura/k6/Playwright/EQ05 ni se opera lab.
Revisión checkout/candidatos sin JWT/tokensGitHub/private keys/provider keys;
2 coincidencias nuevas son valores ficticios de tests.5PDF texto/metadatos revisados.
Advertencias:300logs antiguos YA versionados pese al ignore; autor/rutas históricas
conservados; crudos/artifacts/traces/manifiestos/credenciales solo local. No reescribir
historial ni retirar índice ahora. Los reportes originales conservan referencias
privadas como custodia; índice usa agregados y copias seguras. Herramienta de revisión
requiere fuentes locales y no se agrega a CI. Enlaces relativos comprobados contra
selección propuesta, no contra una publicación aún inexistente. Workflow intacto;
tras push futuro comprobar run del SHA nuevo, npmci/check/coverage/OpenAPI/Web y
quality-evidence, sin dispatch duplicado. Node20 de Actions, mantenimiento pendiente.
Estado de EQ conservado:6cumplidos en alcance/4parciales02/05/08/09, adaptaciónEQ05
pendiente docente y2.000VU adicionales pospuestos. Esperar autorización expresa para
commits/push; no funcionalidad/Cloud/migraciones/Actions nuevos.

26 nov — EQ-05 hora local 8dd877ab-4d18-4213-928d-e9217e39f7da consolidada sin
otra medición ni SQL/HTTP nuevos: responsable ejecutó 15:27:14–16:27:14 Lima,
3.600,003 s monotónicos,360 éxitos/0 fallos/0sin datos,100 % disponibilidad/cobertura.
2.880 HTTP reales; flujo media271,93/p50 267,84/p95 312,39/p99 346,69 ms.
Auditoría SQL guardada conciliada offline:360 persistidas+1preflight, todas
canceladas/0activas;19.471 globales,19.110 anteriores preservadas, invariantes0.
18 tablas y814 archivos/763 hashes históricos intactos;5 fuentes medidas archivadas.
34 archivos originales de ambos intentos con SHA256, sin modificación. Parcial
0bcde763 conserva128 éxitos/232sin datos/35,56 % cobertura y129 canceladas; NO se
suma a la hora completa. Tokens/manifiestos privados siguen en .artifacts/eq05/.
Paquete sanitario en evidencias/eq05: INFORME.md/HTML/PDF, resumen/resultados JSON,
6CSV,3gráficas PNG/SVG yPDF3páginas, auditoria-offline/verificacion-final JSON.
Informe PDF académico con tablas y gráficas. SITUACION-SPRINT2.md reúne cinco
entregables, diezEQ y pendientes mínimos. SeisEQ cumplidos en alcance definido;
02/05/08/09 parciales. EQ05 original mensual/publicado no acreditado; adaptación
1h≥99,5 % requiere aceptación docente. No declarar cierre integral ni repetir k6/hora.
Monitor actualizado SOLO presentación: panel dinámico/barra/tiempo/disponibilidad/
conteos/historial, salida simple si redirigido. Demo explícitamente simulada <1s:
node tests/availability/eq05-terminal-demo.mjs.12 tests aprobados. Verificador
compara AST completo con fuente medida excluyendo nodos de display enumerados;
igual, y políticas byte-idénticas. Nuevo módulo terminal sin red/SQL/escritura.
No iniciar otra medición; comando manual detecta la completada. Siguiente mínimo:
presentar adaptación y limitaciones originales al docente, preparar sustentación;
publicación de nuevos cambios solo tras autorización.2.000VU meta adicional pospuesta.
Sin producto/Cloud/migraciones/Actions/commits/push. Párrafos inferiores históricos,
sus tareas o comandos antiguos NO autorizan repeticiones ni limpieza de datos.

26 nov — EQ-09 recorrido Web de conflicto acreditado: Playwright 1.62.1 y Chromium
oficial 151, 390×844 táctil, dos clientes/contexts sintéticos. HTTP A:[201], B:[409,201],
servicios conservados, teclado y cero reenvíos observados tras conflicto/recarga.
1 E2E aprobado (11,05s runner), cero fallos finales/retries; SQL dos reservas, cero
filas del UUID rechazado, global18.981/invariantes0. 18 tablas previas preservadas,
814 archivos y763 hashes históricos intactos. Preparación fallida conservada aparte:
sandbox, export-dev módulos, efectivo omitido en script y CORS local vacío; sin reservas.
Metro loopback y proxy54421→54721 cerrados; contenedor Edge oneshot original restaurado,
temporal CORS localhost y originales conservados detenidos; otros5 no reiniciados.
No modificar allowlist productiva para E2E. Nuevos helpers en tests/e2e/eq09, resultado
y capturas en docs/evaluacion/evidencias/eq09/INFORME.md. Native HTML/trace contienen
sesiones y siguen privados .artifacts; no publicarlos ni repetir aprobado. Paquete
Playwright del runtime reutilizado, Chromium compatible descargado sin TLS inseguro;
sin cambios package/lock. Error contraste6,73:1/live polite; controles≥44px y sin
overflow390. Limitaciones: foco BODY, aviso fuera del encuadre al aparecer y texto
Efectivo tenue visual; no se corrigió UI ni se certificó WCAG/lector/participantes.
EQ09 integral parcial: ubicación no implementada y Android nativo pendientes.
Siguiente: revisar PROPUESTA-EQ05-1H.md (60sondeos/60s,10s por petición/30s flujo,
cuenta/turnos dedicados y hasta60confirmaciones+cancelación lógica) antes de
implementar/iniciar monitor. No se ejecutó la hora; EQ05mensual≥99,5% no evaluado.
EQ04/06/08 conservados. Sin k6/Cloud/migraciones/Actions/commits/push.

26 nov — EQ-08 verificado y consolidado, sin producto ni backend: ambos checkers
aprobados (cliente 298/55/975; servidor 56/33/158), 88 archivos de núcleo y 199
dependencias directas listadas, cero prohibidas. Dos casos existentes seleccionados,
uno cliente/uno servidor, aprobados con dobles de los puertos reales; cero intentos
de red Node y Deno con red/lectura/escritura/entorno denegados. Cierre transitivo de
cada caso: cinco archivos internos. Regresión/cobertura del 25/11 reutilizadas,
los 88 archivos coinciden con commit probado 9192d1a; cliente 100/100/93,1425 %,
servidor 100/100/100 %. 814 hashes preservados. Evidencia separada en
`docs/evaluacion/evidencias/eq08/INFORME.md`; comando reproducible allí, no repetirlo
por rutina. Incidencia del selector inicial Deno (cero seleccionados) rechazada;
selector corregido en el verificador, sin tocar pruebas/producto.
Estado EQ-08: parcial integral, acreditado para núcleo construido; falta condición
original de sustitución mapas/imágenes no completos, sin implementarlos ahora.
Próximo mínimo EQ-09: Playwright Web móvil sobre local sintético, conflicto real,
recuperación conservando servicios y cero reenvíos/duplicados, trace/captura sanitizados.
No navegador iniciado aquí; Android nativo/ubicación/participantes siguen pendientes.
EQ-04/EQ-06 conservan cierre. Sin k6/Cloud/migraciones/Actions/commits/push.

26 nov — Cierre definitivo de carga mixta 71e00e3c: aprobados 25/50/100 VU ×600 s,
88.472 HTTP y 17.630 aceptadas = persistidas; técnicos/inesperados/integridad cero,
recuperación guardada y 36 thresholds recalculados. Dos intentos fallidos y sus
1.245 reservas preservados, incluidas seis sin acuse durante aborto; no son éxitos
añadidos. EQ-04/EQ-06 cumplidos para laboratorio/mezcla definidos: p95 completo de
consultas a 100 VU = 4/8/7 ms. Global HTTP p95 3.660,71 ms: limitación documentada,
sin cambiar criterios; percentiles específicos de confirmación no exportados.
Auditoría offline, 763 hashes sin cambios, cero carga/SQL/red. Tablas/CSV/JSON y
cuatro gráficas PNG/SVG/PDF en `004-reservas/k6-mixta-final/INFORME.md`.
Lecturas af768017 separadas (1.000 VU); 2.000 VU pospuestos y ajenos al cierre EQ04/06.
Próximo mínimo EQ-08: reunir resultados cliente/servidor y listados de importaciones
existentes, sin repetir pruebas aprobadas ni desarrollar módulos. Integral parcial
por sustitución de mapas/imágenes no completados. No ejecutar k6 de nuevo; historial
inferior conserva comandos antiguos. Producto/Cloud/migraciones/Actions intactos,
sin commits ni push. EQ-02/05/08/09 mantienen sus límites; no cerrar los diez EQ.

26 nov — Mixta de 25 VU aprobada, dfbeb172: 16.227 HTTP, 3.236 confirmaciones,
cero errores y 600 s estables; SQL global: 4.585 reservas, cero violaciones.
La preparación de 50 falló en el primer configure-shop con ECONNABORTED antes
de Kong, sin preparación parcial. Corregido solo el aprovisionador: conexiones
close y hasta tres intentos con pausas de 500/1000 ms para operaciones idempotentes;
journal privado, sin reintentos en medición. Prepare-only elige el nivel pendiente.
Preparación real de 50 completada: 100 sesiones, tres contratos HTTP 200 y fixture
de 8.000 casos; ninguna reserva nueva y mismos valores de oferta, salvo su versión
técnica. La aprobación de 25 se conserva. `npm run test:carga:mixta` continúa
con 50 y 100. Ver `004/sprint2-closure/APROVISIONAMIENTO-50.md`.
Oneshot, tiempos, thresholds y guardas intactos; sin k6, cambios de producto,
Cloud, migraciones, Actions, commits ni push. Mediciones de 50/100 pendientes.

26nov — Segundo mixto dd8f7bd1:500 POSTconfirmación a11:45:53Lima por
WorkerAlreadyRetired del bootstrap per_worker; no lectura/EOF ni RAM.6.239HTTP,
1 técnico,1.235aceptadas. SQLreconcilia1.241 nuevas,6 confirmadas durante aborto
no contadas como éxito;1.349 globales,0violaciones, replay200 mismoID sin cambios.
UUID del500 no registrado; agregado logging sanitizado sin cambiar checks/abortos.
Usuario autorizó oneshot soloEdge lab: aplicado con mismaimagen/bootstrap/env/vols,
contenedoranterior detenido para restauración;otros5sin reinicio, salud200/caso400.
Reintento b238ad29 preparado:1.241 índicesreasignados,tail2desde484;50/100intactos,
600s/nivel,baseline1.349,0conflictosSQL. Fixturecap500→600soloestas2shops al próximo
prepare para conservarpasadas+capacidadfutura; no es umbralEQ. Comando manual:
npm run test:carga:mixta. Warm25 completo, luego50/100; no k6 ejecutado aquí.
Ver004/sprint2-closure/MIXTA-DD8F7BD1.md, edge-oneshot.json yverificaciónfinal.
Producto/Cloud/migraciones/Actions intactos,sin commits/push. Mediciónincluyecoldstart.

26nov — Reanudación mixta autorizada preparada, sin k6: intento912980a8 falló
por RAMhost96% sostenida16,198s;4 reservas válidas conservadas,108 totales/SQL0.
Reintento648620bd de25VU usa nuevos IDs/turnos solo para índices320–323;
3.996 casos restantes y asignaciones50/100 intactos. Baseline108; manifiesto/fixture
original archivados,716 hashes protegidos intactos. Único comando manual:
npm run test:carga:mixta. Repite perfil25 completo600s estables y luego50/100,
sin acreditar calentamiento fallido ni relajar thresholds/guardas. Autorización
de reintento ligada al origen y consumida al ejecutar; otro fallo requiere revisión.
7 tests específicos aprobados; suite ampliada33/34 por test auxiliar Windows
de dueño de puerto(consulta2638ms frente timeout2000ms), supervisor/test intactos.
Ver004/sprint2-closure/REANUDACION-MIXTA.md y retry-verification.json.
Sin cambios de negocio/Cloud/migraciones/Actions, sin commits/push. Responsable
ejecuta manualmente después de cerrarCodex; mantener guardas de presión sostenida.

26nov — Cierre prioritario Sprint2:15 comprobaciones acotadas aprobadas en lab
aislado. EQ01 negativos/positivo efectivo; EQ03 pago barbero/admin distintos,
dos waiters409/200 y un evento; EQ07 fallo de correo controlado con persistencia
real, reintento/mismo UUID sin duplicado; EQ10 cambio real120→60/histórico120
con cabecera/items intactos. Datos anteriores y producto preservados; sin defectos
productivos modificados. Serie mixta independiente71e00e3c preparada:100 sesiones,
20 profesionales,100 reservas iniciales, tres contratos200 y SQL0violaciones.
Comando manual npm run test:carga:mixta:25/50/100VU600s estables,80%consultas
incluyendo reservas propias/20%confirmaciones. NO ejecutada; no repetir lecturas.
31 tests del harness aprobados; perfiles inspeccionados sin VU/HTTP. EQ01/03/07/10
cerrados en conjunto definido; EQ02/04/06/08/09parciales, EQ05mes no evaluado.
EQ08solo núcleo construido acreditado: protocolo original incluye mapas/imágenes.
Cinco entregables disponibles, evidencia de atributos aún incompleta integralmente;
sin afirmar cierre formal de diezEQ. Ver004/sprint2-closure/CIERRE-SPRINT2.md.
1.000VUlectura conservados;2.000sinacreditar. Sin Cloud/producto/migraciones/Actions/
commits/push. Siguiente paso: responsable ejecuta serie mixta y se audita evidencia.


26nov — Consolidación final k6 terminada sin nueva carga. Campaña af768017:
7 intentos auditados, 5 aprobados (Smoke, Load, Load académico, Stress y Spike)
y 2 Stress fallidos conservados. Las aprobadas suman 476.964 solicitudes, cero
errores, checks 100 % y 186 thresholds recalculados. Lecturas de 25/50/100 VU
por 600 s, Stress de 100–1.000 VU por 60 s y Spike de 1.000 VU por 30 s acreditados.
En Stress a 1.000 VU: 643,57 RPS; p95/p99 HTTP 789,45/903,27 ms; p95 completos
catálogo/slots 786/793 ms. RPS máximo 757,28 a 800 VU; cae después con más latencia.
Los siete resultados guardan recuperación e integridad satisfactorias; no se
ejecutaron SQL ni servicios aquí. 131 archivos crudos, preliminares y puntero
conservan SHA256. Se incluyó el segundo Stress sin resumen, omitido por el
consolidado original; sus datos ausentes siguen null. Seis gráficas PNG/SVG/PDF
revisadas, tablas, CSV, JSON y matriz EQ en 004/k6-final/INFORME.md y
REQUISITOS-CALIDAD.md. MVP de carga 10 VU/60 s cumplido para lecturas. EQ-04/06
parciales: falta consulta de reservas y mezcla con confirmaciones del protocolo
original. EQ-03 parcial: care-real usa pro en ambas peticiones receive; falta
carrera barbero/admin distintos. No repetir 10 pares de reservas ni 91 checks.
EQ-01/02/07/09/10 parciales, EQ-05 no evaluado (mes), EQ-08 cumplido en lo construido.
2.000 VU sigue como objetivo adicional sin medir. Próximo paso: revisar matriz
y autorizar selectivamente protocolos faltantes; no repetir lecturas aprobadas.
Sin producto, migraciones, thresholds, Cloud, Actions, commits o push.

26nov — Optimización k6 autorizada aplicada sin carga: Kong4096 efectivo/unworker,
nginx -t aprobado; mismo contenedor reiniciado soloKong y persistencia comprobada.
nofile1048576 master/worker. EntryPoint adapta plantilla regenerada; lab-control
start reaplica tras recreación, run-lab exige verify. Backups privados y SHA en
.artifacts/k6/supabase-lab/kong-tuning/. Supervisor usa APIk6 loopback/PIDWindows,
stop10s/critico2,5s y killforzado si noresponde, shutdown.json/summaryExported;
interrupted siempre noaprobado. 27tests sin k6 aprobados, procesoNode real exporta
antesdesalir; exportación k6real pendiente de corridamanual.6servicios/salud200,
SQL0violaciones,43archivoscampaña/puntero y26migraciones intactos. SinmínimoRAM
preventivo residual de startup; guardascriticas/sostenidas intactas. Ver004/
k6-lab-optimization.md. Sinproducto/Cloud/Actions/migraciones/commits/push.
Próximo paso responsable tras cerrarCodex: npm run test:carga -- stress.

26nov — Diagnóstico segundo Stress a8d488dd sin carga: stop RESOURCE_SAFETY_LIMIT
por RAM host >=90% durante16,093s (muestra04:51:44.207Z), no por primerEOF.
Kong evidencia512 worker_connections insuficientes:2 warnings intento28edec30,
32 segundo, primerwarning0,519s antes del EOF cliente. Unworker y plantillaevents
omite worker_connections aunque .kong_env digaauto. Corrige atribución inconclusa
anterior, cuyo filtro omitiówarnings. Segundo16EOF(8catálogo/8slots),sin resúmenes
por terminación del procesoWindows: no inventar RPS/p95/thresholds ni acreditar500.
Máximo Stresslectura formal400VU/60s primerintento;SQL/integridad actual0violaciones,
6servicios vivos,sinOOM/reinicios,21/100sesiones,poolREST10.43archivosSHA y puntero
campaña intactos. Reporte004/k6-stress-bottleneck.md. Solo propuestas, no aplicadas:
plantillaKong4096conexiones, margenhost, cierreordenado/evidenciaincremental supervisor.
No cambios de infraestructura/producto/umbrales, Cloud, migraciones, commits/push.

25nov — Análisis EOF Stress28edec30 sin carga:70033 peticiones/1EOF técnico
0,0014279%, aborto108 por clasificarlo también como check/resultado funcional fallido.
100/200/300/400VU completaron60s y aprobaron;458solo rampa,500no empezó estable.
SQL limpio y recuperacióntrue. CPUhost pico21,34%, RAM85,51%, libre2,237GiB,
conexiones21/100 y0locks muestreados. Kong7063x200/20x499 alrededor04:29:02UTC,
compatibles con cancelación al abortar; sin5xx/OOM/reinicio observado. Origen exacto
EOF no demostrable sin evento cliente/correlación original; no atribuirlo a un componente.
Autorización expresa usuario: solo futuro Stressread status0 EOF se cuenta técnico,
sin reintentar/aceptar ni inventar check. <1% sobre todas peticiones,100%checks sobre
respuestas recibidas; otras pruebas/errores siguen estrictos. Policy stress-eof-v1
en result/CSV, contadoresEOF/no validadas y eventos UTC/error_code en javascript-console.log.
16 tests/5 inspecciones estáticas aprobados sin carga.36 archivos campaña y puntero
SHA intactos. Reporte004/k6-stress-eof-analysis.md/json; logs crudos ignorados.
Sin tiempos/latencias alterados, producto, Cloud, migraciones, commits ni push.

25nov — Corrección puntual preflight load-academico: calibración guardada100VU se
descartaba para50VU y SUCCESSFUL_GENERATOR_CALIBRATION_REQUIRED bloqueaba>10VU,
aunque la estimación RAM ya advertía. Ausencia de calibración ahora solo advierte
GENERATOR_CALIBRATION_UNAVAILABLE; riesgos críticos siguen bloqueando con diagnóstico.
Regresión cubre los cinco perfiles con1/2/3GiB y conserva rechazo crítico. Sin carga,
reinicio de campaña ni cambios de tiempos/thresholds. Campaña af768017 intacta.

25nov — Nueva campaña k6 af768017-0ecc-48b5-b6fe-af5aa287cd5d preparada sin carga.
No procesos k6/aprovisionador residuales; SQL0 reservas/violaciones tras Ctrl+C.
Bloqueo residual archivado y limpieza SIGINT/SIGTERM añadida.32 archivos de corridas
preliminares copiados con SHA256; originales intactos, sin promover sus aprobaciones.
Comandos npm smoke/load/stress/spike/completo usan campaña/progreso independiente.
Smoke1VU5iter<=30s; Load10/25/50x60s+100x600s (830s); Stress100..1000x60s,
transiciones10s (700s); Spike10/30s→pico/5s→30s→10/5s→recuperación60s (130s),
pico limitado por niveles Stress terminados y aprobados en misma campaña.
Suplemento load-academico25/50x600s disponible para EQ06; Load corto no lo sustituye.
Resultados por tipo/intento, segmentos, consolidated.json y dos CSV; campos ausentes
null.14 tests y5 inspecciones estáticas k6 sin VU/HTTP aprobados; ninguna carga
ejecutada. Guía actualizada. Código producto/migraciones/Cloud/Actions intactos,
sin staging/commit/push. Primer paso manual: npm run test:carga -- smoke.

25nov — Simplificación k6: evidencias manuales1/10/25VU revisadas en disco,
checks/thresholds/integridad aprobados y reutilizables; no se repitieron. Nuevo
npm run test:carga -- 50|100|completo prepara sesiones automáticamente, conserva
resultados y omite aprobados. Completo sigue50,100,200..1000; formal25/50/100600s,
exploratorios200+120s. Supervisor hereda terminal k6, resumen nativo full y export
native-summary.json, summary.json y result.json; eliminado handleSummary que ocultaba
TOTAL RESULTS. Preparación detallada a logs privados; preflight breve. Estimaciones
RAM advierten: crítico<512MiB/97% inmediato; >=90% o<768MiB15s sostenidos abortan,
CPU85%30s y conexiones80%15s/salud/integridad conservados. Criterios rendimiento
intactos.11 tests y sintaxis/formato aprobados, tres evidencias reales reutilizables.
NO se ejecutó k6 ni humo/inspect durante esta etapa. Aspecto nativo pendiente de
ejecución manual en terminal VSCode. Guía k6/MANUAL-POWERSHELL.md actualizada.
Sin producto/migraciones/Cloud/Actions/staging/commit/push. Cambio package.json solo script.

25nov — Finalización manual k6: laboratorio iniciado por responsable y reutilizado
sin reiniciar6 servicios/26 migraciones verificadas. Aprovisionador reanudable
k6/fixtures.mjs probado con2 y luego10 clientes:12 usuarios Auth incluyendo2 dueños,
2 barberías/servicios/profesionales. Sesiones reales, catálogo, slots, rechazo Edge
400, denegación de agenda403 y RLS ajeno vacío aprobados; SQL inicial0 violaciones
y0 reservas. Marcador privado y credenciales solo en.artifacts ignorado. Corregida
contraseña sintética para cumplir complejidad Auth, sin alterar servidor.
Política adaptativa distingue preparación serial (Node RSS<=128MiB+reserva1GiB+
crecimiento backend) y carga (reserva max2GiB/15%RAM+backend+generador). Consumo
backend observado348–439MiB. k6 inspect pico26,09MiB es solo arranque, no calibración
de carga. Supervisor obtiene pico real en humo; exige calibración para>10VU,
mantiene abortos RAM85%/2GiB15s, CPU85%30s/conexiones80%15s y salud/SQL.
Meta manual revisada: humo,10,100/10min,200..1000;25/50 opcionales conservados;
2000 queda pendiente y ejecución>1000 bloqueada. No k6 real/intensivo ejecutado:
última comprobación~1,78GiB libres frente a~3GiB del humo.8 tests y18 inspecciones
aprobados, funciones PowerShell5 cargan; rechazo seguro del supervisor observado.
Guía k6/MANUAL-POWERSHELL.md y funciones k6/manual.ps1 listas para ejecución manual
condicionada al preflight tras cerrar Codex. Preparación masiva Auth puede esperar
429 respetando límites. No afirmar carga/calibración/EQ completos. Evidencia nueva
004/k6-manual-readiness.json. Sin producto/migraciones originales/Cloud/Actions/commits.

25nov — Optimización k6 autorizada: detenidos18 contenedores adicionales de
app-barberia-002-repro-20261113 y barberia-app, sin transacciones activas antes.
IDs/montajes conservados; Docker29.9.3 activo. Total25 habituales detenidos, sin
eliminación/restauración. RAM3,30GiB inicial;3,40 inmediata; fluctuó2,90–3,62GiB.
VmmemWSL2211→1163MiB observado; no cambios globales ni shutdown de WSL.
Preflight y arranque protegido rechazaron por4GiB mínimos; backend/humo no iniciados.
Selector alineado1,10,25,50,100,200..2000; SharedArray por actor/caso;4 pruebas y28
inspecciones aprobadas, sin HTTP. Supervisor requiere nivel anterior aprobado y
recuperado. Nuevos lab-control.mjs y restore-environments.ps1; restauración modo
plan comprobó25 IDs/montajes en Windows PowerShell5. Guía k6/MANUAL-POWERSHELL.md
con comandos condicionados: faltan backend vivo, fixtures/sesiones/marcador y humo.
No afirmar ejecución manual integral lista. Cerrar apps voluntariamente puede liberar
margen, volver a preflight antes y después del backend; no rebajar límites.
Sin producto/UI, migraciones originales, Cloud, Actions, staging/commit/push/costos.
Resultados en004/k6-optimization.json. Bloques siguientes son antecedentes.

25nov17:39 Lima — Nueva revisión de RAM solicitada: dos preflights exit2,
0,90GiB/94,14% y1,16GiB/92,50% ocupada. k6 y Docker disponibles; solo bloqueo RAM.
CPU puntual46%, disco libre185,38GiB. Base habitual sigue exited; no contenedores
barbexa-k6-lab. No se inició/operó ningún servicio ni carga en esta reanudación.
Protecciones4GiB libres/<80% conservadas. Nueva progresión solicitada para cuando
existan recursos: humo,10,25,50,100 y luego200,300,...,2.000VU; aún no ejecutada.
Los scripts aún deben alinear sus niveles posteriores a100 con esta progresión
antes de ejecutarla. Evidencias actuales004/k6-preflight.json y004/k6-validation.json.

25nov — Reanudación k6: k6 2.4.0 oficial instalado/verificado; Docker29.9.3 operativo.
Detención explícitamente autorizada Metro8081 y7 contenedores habituales realizada,
con inventario/montajes conservados y comandos de restauración en k6/README.md.
Las otras dos pilas intactas, Engine activo. No eliminación de datos/volúmenes.
RAM final1,65GiB libre/89,31%ocupada: preflight sigue bloqueado solo por memoria.
Preparado laboratorio de archivos barbexa-k6-lab54721/54722,26 migraciones idénticas;
no arrancado, sin fixtures/sesiones/marcador/medición SQL. Scripts HTTP/supervisor/
integridad implementados en k6/,3 tests de guardas y13 inspecciones k6 aprobados;
rechazo seguro107 sin tráfico y supervisor1 por recursos. Ninguna carga real ni VU
comprobado; EQ-04/06 pendientes, EQ-03 conserva solo antecedentes. Ver004/k6-validation.json
y004/entrega-tecnica.md. Fixtures y validación HTTP/SQL requieren backend aislado vivo.
Sin Cloud, producto, migraciones, Actions, commits o push. Estado habitual queda detenido
para restauración posterior registrada; no detener otras pilas sin autorización nueva.

25nov — k6: revisión y preflight reales, ejecución de carga BLOQUEADA antes de humo.
Equipo24hilos/15,43GiB RAM,2,84GiB libres/81,58%ocupada; k6 no disponible, Docker Engine
sin responder. scripts/k6-preflight.ps1 exit2 (solo lectura) y evidencia004/k6-preflight.json.
Plan/matriz A–G y límites en004/entrega-tecnica.md; objetivos EQ100VU/10min,p95<=3s,
errores<1%, y MVP10VU/1min,p95<=2s/errorfuncional0 conservados y separados.
No hubo target aislado, datos sintéticos, carga, nuevas consultas SQL ni medición de
integridad. No se alcanzó2.000VU; ningún máximo ni capacidad del backend acreditados.
No iniciar carga hasta margen RAM/preflight y laboratorio independiente verificados.
Sin servicios iniciados, instalaciones, Cloud, migraciones, datos, commits/push/costos.
Cambios documentales de consolidación anteriores conservados; no declararlos publicados.

25nov — Consolidación documental de arquitectura/SOLID/patrones, PostgreSQL y caché
terminada sobre a758dfa. Ver evidencias004/calidad.md,004/cache.md y002/consultas.md:
símbolos reales de reserva hasta RPC/SQL, diferencias C2–C4, tablas con límites y medidas
históricas (20.000 membresías; lookup literal0,043ms frente a exploratorio139,660ms;
caché mediana15,713→1,8845ms,5 muestras/condición). Pooler local enabled=false:
configuración no acredita pooling/capacidad Cloud. Checkers actuales exit0 cliente298/55/975
y servidor56/33/158. No nuevas mediciones, SQL, datos, Cloud, migraciones o tests completos.
Publicación previa confirmada:main/origin/main,a758dfa,23 commits privados; CI45696792837
success con quality-evidence. README académico vinculado por e74590b, historial independiente.
Warning runtime Node20 de acciones sigue mantenimiento pendiente. Solo documentos locales
modificados en esta etapa, sin staging/commit/push. Detenerse; siguiente etapa será
preparar k6 progresivo con alcance/entorno controlados; no ejecutarlo todavía.

Los bloques siguientes conservan antecedentes de cada verificación.

25nov — Cierre de reproducibilidad aprobado desde checkout Git independiente de
9192d1a, sin node_modules, .artifacts, reportes ni .env privados previos. npm ci exit0:
1027 paquetes del lockfile. npm run check exit0: tipos, lint, formato, checkers reales,
38+45 regresiones arquitectónicas,493 núcleo/integración,652 presentación/integración
(solapados),18 guardas de entorno y96 Deno; cero fallos/omitidas en estas suites.
Cobertura cliente45 archivos:3808/3808 líneas,447/447 funciones,1725/1852 ramas
(100/100/93,1425%); servidor29 archivos:1640/1640 líneas,99/99 funciones,1007/1007 ramas
(100/100/100%). Umbrales íntegros. OpenAPI válido:26 rutas,33 comandos,11 solicitudes
y7 respuestas contrastadas;3 pruebas OpenAPI incluidas en check. Export Web exit0 sin
credenciales, .env deshabilitado;4 JSON agregados de CI preparados e inspeccionados.

ENOENT resuelto en coverage-report.test.mjs: carpeta única en os.tmpdir, limpieza
mediante t.after y comprobación de propiedad; prueba independiente y dos ejecuciones
simultáneas aprobadas desde cwd vacío. No se versionó .artifacts ni se prepararon
carpetas faltantes manualmente. profile-environment.mjs usa Docker desde PATH en vez
de una ruta personal fija; no se ejecutó Docker ni su preparación de datos.
Los helpers históricos SQL/HTTP/Cloud requieren infraestructura/fixtures explícitos:
no forman parte del check seguro ni se ejecutaron. Sin otros defectos confirmados
en la preparación de runners, cobertura y exportación revisados.

Se conservan los21 commits anteriores, incluido03c5c67 LF;9192d1a registra solo las
dos correcciones de pruebas. El commit documental final incorpora los documentos y
evidencias pendientes previamente aprobados: total23 commits locales, sin remotos.
La comprobación final compara el árbol ejecutable del commit documental con el
commit probado; fuentes/configuraciones/lockfile idénticos. Ningún cambio funcional,
de interfaz, arquitectura, Constitución, migración o SDD consolidado en este cierre.
688 de690 huellas funcionales/config/tests aprobadas intactas; solo difieren los dos
helpers indicados.310 recursos/logs y552 herramientas locales conservan sus bytes.
553 retiradas anteriores solo del índice:552 .agents y log activo, sin borrar físicos.
Se conservaron300 logs académicos y skills-lock.json.104 logs actuales y el historial
conservan rutas locales; autores/correos también quedarían expuestos al publicar.
Cero secretos privados reales confirmados en los patrones/contextos revisados; no
garantiza ausencia absoluta. Aceptar esos metadatos o acordar saneamiento separado;
no se reescribió historia ni se publicó. Avisos npm: ESLint deprecado y postinstall
de Scarf no autorizado, sin bloquear npm ci; sin nuevas aprobaciones de scripts.

Evidencia consolidada: docs/evaluacion/evidencias/004-reservas/reproducibilidad.json.
Logs crudos locales ignorados: .artifacts/local-commits/final-*.log. GitHub Actions
remoto/upload, Android físico, SQL/HTTP real, E2E desplegado,k6 y CD no se ejecutaron
en este bloque. Sin Cloud, datos reales, instalaciones fuera del lockfile o costos.
Etapa terminada: detenerse; publicación requiere autorización independiente.

25nov — OpenAPI/Swagger Sprint2: especificación principal docs/api/openapi.json
(OpenAPI3.0.3), generada por npm run docs:api:build desde los tipos/contratos reales.
26 rutas:4 Edge,11 RPC,10 tablas PostgREST y Auth/user administrado.33 variantes de
barbershop-operation y17 de reserva/atención, sin nuevas rutas de negocio; aceptación
definitiva de transferencia de propiedad sigue bloqueada y no se anuncia disponible.
npm run docs:api abre Swagger estático en http://127.0.0.1:8082; carga verificada en
Brave. Try it out deshabilitado, interceptor solo permite leer la especificación,
sin tokens ni validadores externos. JWT+apikey y permisos contextuales documentados.
npm run docs:api:check valida estructura/referencias, inventario y11 solicitudes/7
respuestas con validadores reales;3 pruebas pasan. Ejemplos sintéticos, no Cloud.
Control global npm run check exit0 fuera del sandbox:652 presentación/integración,
96 Deno; cliente100% líneas/funciones y93,1425% ramas. Primer intento en sandbox
falló spawn UNKNOWN en un proceso de pruebas. Log .artifacts/openapi-check-host.log.
Dependencias dev exactas swagger-ui-dist5.36.0 y swagger-parser13.1.0; sin Jest.
Uso, límites y evidencia en evidencias004/calidad.md. Sin cambios de producto,
backend, migraciones, SDD o Constitución; sin Cloud, despliegue, commit/push o k6.

25nov — Corregida reaparición del aviso de administración deshabilitada.
Causa: el runtime exigía flags de lanzamiento true pese a que Cloud ya estaba activo.
Autoridad e invitaciones in-app ahora se componen por defecto en Cloud integrado y
producción, después de validar backend/origen/revisión existentes; false explícito
conserva la desactivación operativa. LOCAL conserva opt-in y permisos siguen en SQL.
Regresión RED→GREEN de arranques nuevos, backend inválido y producción:27/27 dirigidas;
cliente/presentación649/649, TypeScript, lint dirigido y grafo aprobados.
No cambios Cloud, roles, datos ni reinicio de servicios. Evidencia .artifacts/admin-activation-fix.
La pantalla del navegador debe recargarse para tomar la composición actualizada.

25nov — Cierre de calidad y auditoría de código Sprint2 completados.
npm run check exit0 fuera del sandbox; dentro falló únicamente junction EPERM,
sin eludir el control. Node combinado487/487, presentación/integración646/646
(solapan291), arquitectura/entorno101/101 y Deno96/96. Núcleo cliente45 archivos:
100% líneas/funciones y93,0923% ramas; núcleo servidor29 archivos:100% en las tres.
Gate Deno confirmado también con perfiles nuevos server-fresh. Umbrales intactos.
Formato de4 interfaces verificado exactamente frente al respaldo; otros src/backend,
migraciones, SDD y Constitución sin cambios. Tests nuevos y lista segura ampliada.
Auditoría: seis módulos,354 fuentes inventariadas,84 referencias/19 rutas; sin
hallazgos críticos/altos confirmados.8 avisos npm moderados; riesgos bajos de
compatibilidad readonly008 y publicación; detalle/clasificación en seguridad-web.md
de evidencias003. No hay correcciones funcionales autorizadas/aplicadas.
Reportes coverage/{client,server} y .artifacts/quality-closure; evidencia actualizada
en evidencias004/calidad.md. OpenAPI incorporado en el bloque superior. Revisar los
hallazgos con el usuario antes de correcciones; Cloud, Android físico, SQL/E2E publicado y carga
conservan sus gates independientes. Sin Cloud, migraciones, instalación, commit/push o k6.

### Estado vigente: cierre de interfaces y recorrido manual Web — 24/11/2026

El responsable confirma en este chat haber recorrido TODAS las funcionalidades Web
implementadas y que funcionan. Se aceptan y cierran las interfaces actuales y el
recorrido funcional manual Web para: cliente sin membresía; trabajador barbero;
trabajador invitado como administrador secundario; propietario administrador que
también trabaja como barbero. Son combinaciones de roles/capacidades por barbería,
no cuatro roles globales. Incluye selección entre barberías y los ajustes finales
de servicios/categorías, configuración, agendas, avisos y marca inicial.
Fuente: declaración explícita del usuario; no es una nueva ejecución automatizada
de Codex ni acredita transferencias monetarias reales o casos no especificados.

Web es la prioridad declarada para preparar la entrega. No seguir rediseñando ni
repetir recorridos Web aceptados sin cambio o incidencia nueva. Esta aceptación
no cierra por sí sola criterios técnicos, tareas con gates específicos ni Android;
la obligación conjunta Web/Android de Constitución2.0.0 permanece sin enmienda.
Las notas históricas posteriores que dicen recorrido Web pendiente quedan superadas
por esta aceptación para la funcionalidad actual; los pendientes Android/técnicos
deben reconciliarse individualmente en Spec Kit, sin marcar tareas mixtas completas.

SDD consolidado para Sprint2 (27/11/2026): revisados spec/plan/tasks de001–018;
corregidos estados y contratos vigentes, separadas Web aceptada/Android pendiente y
casillas históricas resueltas por evidencia posterior. Sin nueva spec ni informe.
Planes004/tasks registran k6 progresivo hasta2.000VU como requisito pendiente, sin
modificar EQ-01–EQ-10 ni Constitución.012 mantiene bandeja solo Web: su brecha Android
queda explícita en tasks, sin aceptar excepción constitucional. No se ejecutaron suites
ni operaciones externas.

Siguiente etapa: cierre técnico y preparación de entrega. Consolidar la matriz de
16 criterios con evidencias actuales; ejecutar calidad final y resolver el umbral
de cobertura (última suite191/191, pero líneas63,39% y funciones84,82% frente100%);
consolidar E2E automatizado y seguridad/aislamiento/concurrencia existentes; revisar
hallazgos de advisors/dependencias; confirmar alcance pendiente de propuesta
(Storage/imágenes/QR, favoritos/reseñas/mapas no acreditados por este recorrido).
Caché ya implementada y medida localmente; falta consolidar mediciones del destino.
Frontend actual localhost8081 con backend Supabase Cloud real; publicación Web,
dominio/HTTPS/DNS/CDN, CI remoto/CD y k6 siguen sin acreditación final.
Terminar informe, diagramas alineados al código, evidencias y sustentación.
QR Yape persistente en Storage sigue expresamente pospuesto; pagos manuales y reporte
de código3dígitos sí activos, sin pasarela ni verificación automática, abonos o mixtos.
No ejecutar nuevas operaciones sensibles por esta declaración: Cloud, migraciones,
hosting/costos, carga, cuentas/correos, APK, limpieza, staging/commit/push conservan
sus requisitos de autorización específica. Preservar datos y logs protegidos.

24nov — Marca inicial Web unificada. Usuario observaba App Barbería en callback
y Barbexa tras entrar. app.json carecía de web.name/favicon; landing cambiaba
document.title e icono al montar y restauraba los anteriores al desmontar.
Configurado web.name Barbexa · Tu próximo corte empieza aquí, shortName Barbexa,
favicon ./public/images/barbexa-logo.png; retirados efectos de marca del landing.
Nombre/slug/identidad Android y scheme OAuth conservados.9 pruebas presentación/
hidratación, tipos y lint aprobados. HTML real al principio seguía con configuración
de arranque vieja: reinicio específico aprobado de Metro25196 (verificado ruta/8081)
a46876 con perfil Cloud vigente, flags true/true, log propio .artifacts/branding-metro-*.log.
Primer arranque se negó por puerto aún liberándose; siguiente comprobación confirmó
puerto libre y lanzó una instancia. HTML /auth/callback verificado con título Barbexa
antes de JS. No cambia validación PKCE/sesión ni afirma eliminar espera OAuth.
No se inició/cambió cuenta real, sin Cloud ni modificaciones del log protegido.

24nov — Catálogo018 ACTIVADO al solicitar el usuario corregir el rechazo al crear.
Confirmación Cloud previa: columna category/migración ausentes. Reproducción local:
comando antiguo rechaza category como INVALID_INPUT. Autorizaciones específicas
de herramientas para copia local, pruebas, respaldo y aplicación/despliegue.
Migración20261125010000_service_catalog_categories aplicada en vuoncrtkkkquvddunrxx;
barbershop-operation v7 ACTIVE verify_jwt=true. Edge descargado antes y sustituido
solo application/operation.ts, domain/types.ts e infrastructure/postgres-operation-adapter.ts.
Backup privado: LOCALAPPDATA/Barbexa/backups/service-catalog-1795571089442; pointer
.artifacts/service-catalog-cloud.json. Esquema/datos/roles/historial/Edge respaldados;
hashes de filas anteriores (services sin columnas nuevas), RLS y otras funciones
conservados. Smoke Cloud crear/editar/archivar con rol service_role pasó y ROLLBACK
no dejó servicios. Revisión advisors sin avisos de las funciones nuevas; cinco avisos
en funciones de notificaciones/recordatorio y protección de contraseñas ajenos al cambio.
Prueba aislada detectó y corrigió wrapper invoker sin permisos de tablas: lógica en
private.upsert_service_catalog SECURITY DEFINER con actor/autoridad/tenant, entrada
pública invoker, search_path vacío, solo EXECUTE service_role, ningún grant de tabla.
DB aislada service_catalog_018_1795570858811 en contenedor002-local; pruebas de
rol real, tenant cruzado, categorías, legacy, archivo repetido, reserva futura/snapshot,
fallo entre escritura/metadatos y carrera archivo/edición aprobadas. Fixtures conservados.
Formulario Web/Android usa parseServiceDraft: precio decimal con coma/punto, valida
nombre/precio/duración con mensaje concreto; error genérico de intervalos sustituido
para este flujo.22 pruebas cliente,8 servidor, tipos cliente/servidor y Deno check
aprobados. CUA /services JUANITO: formulario vacío muestra Escribe el nombre del
servicio; Reintentar recupera catálogo. No se creó servicio real desde la UI.
Recorrido Web aceptado posteriormente por el usuario en el bloque vigente anterior;
aceptación Android física pendiente.
Sin staging, commit, push ni cambios a otros servicios Cloud.

24nov — Seguimiento nombre: usuario muestra Crear mi barbería durante guardado.
La corrección previa de lecturas no resolvía esta transición. Causa reproducida:
refreshContext usaba resolve, publicaba resolving; ruta Web confundía acceso aún
desconocido con ausencia de barbería y activaba createOnly. Ahora el coordinador
usa revalidate en contexto seleccionado (verifica membresías sin desmontar la vista)
y resolve para estados sin selección. Rutas Web/Android barbershop-admin bloquean
formulario si contexto resolving/error, con espera o recuperación explícita.
Regresión con dos membresías comprueba selección/nombre durante toda la recarga;
pruebas de presentación impiden montar creación en estados pendientes/fallidos.
46 pruebas dirigidas, tipos y lint aprobados. Suite unitaria191/191 aprobada, pero
su comando global sale1 por umbral cobertura100%: líneas63,39%, funciones84,82%.
No se ejecutó guardado real ni operaciones Cloud en este seguimiento.

24nov — Corregido conflicto recurrente tras guardar nombre de segunda barbería.
CUA inicial: BARBERIA JUANITO en encabezado pero error de consulta del nombre y
CONFLICT genérico en configuración. Reproducción en pruebas: run trataba lecturas
superpuestas de un remount como envíos duplicados. Ahora comparte solo consultas
en curso por identidad/generación/barbería/rol/operación; revisión antes/después de
mutaciones impide reutilizar una consulta anterior al guardado. Errores no quedan
cacheados; doble escritura sigue bloqueada y respuestas de contexto anterior se
rechazan. Núcleo compartido Web/Android. CUA posterior: nombre JUANITO cargado,
sin ambos avisos; no se ejecutó otro guardado ni se alteraron datos reales.
35 pruebas de integración/presentación aprobadas, tipos y lint dirigidos sin errores.
La activación del catálogo018 se completó después, según el bloque vigente anterior.

24nov — Agenda general Web: retirado botón Cambiar barbería de la tarjeta de
consulta por instrucción posterior del usuario. Accesos globales conservados. Este ajuste
no autorizaba catálogo018; se activó posteriormente mediante la corrección registrada arriba.

24nov — Preparación del catálogo: usuario pide categorías reales, formulario compacto
Web e iconos editar/eliminar. Selector Categoría junto a Nombre, descripción2filas,
precio/duración paralelos, checkbox visibilidad; menú lápiz/papelera con aria-label/title.
Verificación CUA en /services: catálogo real2servicios cargado tras Reintentar por
conflicto de hot reload; formulario y menú comprobados, sin guardar ni eliminar.
Service admite category/archived opcionales; lector admin select=* conserva legado,
filtros/conteos priorizan categoría persistida y excluyen archived. Comando cerrado
upsert-service extendido en cliente/servidor; archivo requiere id, active=false,
archived=true; adaptadores no declaran éxito si respuesta ignora metadatos.
Categoría y retiro confirmado también preparados en presentación Android.
Migración supabase/migrations/20261125010000_service_catalog_categories.sql aplicada
en el seguimiento vigente anterior: categoría enum por CHECK, archived impide active, backfill categorías,
wrapper upsert toma autoridad services/tenant y delega comando vigente/invariantes,
metadatos en misma transacción, archivo repetido sin nueva escritura, sin borrado físico.
No modifica otras RPC, RLS ni concede acceso a clientes. Ensayo SQL y activación Cloud
completados; recorrido Web aceptado posteriormente, Android físico pendiente.
Spec/plan/tasks en specs/018-catalogo-categorias/. Sin staging/commit ni push.

24nov — Perfil profesional Web: confirmación tras guardar usa SuccessToast
verde temporal superior derecho, en vez del bloque en formulario. Texto distingue
perfil completo y nombre en entorno legado; errores y Android conservados.

24nov — Mis horarios profesional Web: guardado verificado usa SuccessToast verde
superior derecho temporal, en lugar del bloque Disponibilidad propia actualizada.
Error/carga y Android conservados; reinicio del aviso por saved durante operación.
Guardar mi bloqueo comparte el mismo aviso; regresión verifica onSaveBlock hasta toast.

24nov — Agenda/resumen profesional Web: Confirmada verde, En atención ámbar,
Completada azul, inasistencia roja y cancelación gris. Leyenda de agenda incluye
No asistió y distingue sus colores también en detalle/resumen.

24nov — Mi perfil PERSONAL Web: guardado confirmado usa SuccessToast verde
superior derecho temporal en vez de bloque largo. Solo tras onSave resuelto;
reabrir edición reinicia el aviso. Android conserva StatusMessage. Sin cambios
al perfil profesional ni al guardado. Regresión de presentación actualizada.

24nov — Notificaciones Web: retirada etiqueta hora de Lima de resumen/detalle y
preview del inicio; metadato usa Hora. Formato America/Lima y textos almacenados
conservados, sin migración ni cambio en permisos/enlaces de los dos roles.

### Cierre del recorrido de cliente Web — 24/11/2026

El usuario confirma haber recorrido todas las funcionalidades de una cuenta cliente
sin membresía administrativa ni profesional y solicita cerrar esta etapa.
Validación manual declarada por el usuario: explorar barberías, reservar, consultar
Mis reservas y su historial, gestionar citas dentro de los plazos, atención/pago
como cliente, notificaciones, perfil personal e invitaciones recibidas.
Se registra la etapa de revisión funcional de cliente Web como aceptada y cerrada.
No repetir este recorrido salvo cambio posterior o incidencia nueva.
La aceptación corresponde al recorrido declarado, no acredita operaciones que no
se hayan documentado ni sustituye pruebas técnicas de seguridad/concurrencia.
Pendientes separados: persistencia del QR Yape en Storage (pospuesta por el usuario),
validación en dispositivo Android y cierre técnico integral de los requisitos vigentes.
No ampliar ahora funcionalidad ni rediseñar pantallas de cliente por iniciativa propia.


24nov — Notificaciones Web: basurero abre NoticeDeleteConfirmation centrada en
su tarjeta, con fondo atenuado/desenfoque, transición, X y Conservar/Eliminar.
Ajuste posterior: margen visual24px al abrir, scroll nearest y más aire inferior.
Retirado bloque en línea; diálogo directo del li bloquea el details subyacente,
foco inicial en conservar, ciclo de teclado y restauración al cerrar.
CUA: apertura y Conservar verificados; no se borró ninguna notificación.
Tipos/lint y3 pruebas aprobados, incluido ID correcto y retención tras error servidor.

24nov — Reprogramación cliente: si la hora original ya pasó, pulsar Reprogramar
muestra «El plazo para reprogramar esta cita terminó. Contacta con la barbería.»
sin abrir formulario ni consultar horarios. FORBIDDEN al cruzar esa hora usa el
mismo mensaje. Otros errores de sesión conservados; personal mantiene flujo con
motivo, servidor conserva comprobación de antelación configurada.

24nov — Invitaciones: Ver historial completo activa Todas directamente. Retirado
filtro history y botón duplicado Historial · Ver todas. Prueba de interacción actualizada.

24nov — Corregido error de invitaciones recibidas para cliente sin membresía.
Diagnóstico real: no salía POST de administración; bundle servido tenía flag
ADMIN_INVITATIONS=false. Launcher Cloud antiguo borraba flags y forzaba false.
Perfil aprobado centralizado en scripts/cloud-integration-environment.mjs con
TEAM_AUTHORITY/ADMIN_INVITATIONS=true; helper legado de .artifacts lo importa.
Se conservan validación de proyecto, eliminación de secretos y permisos servidor.
Tras aprobación específica de herramienta, verificado proceso25324/ruta workspace
puerto8081 y reiniciado solo ese Metro; nuevo pid25196, estado en
.artifacts/invitation-runtime-repair.json. .env.local y logt017 intactos. Sin cambios
Cloud, migraciones, roles ni invitaciones. Bundle verificado true/true y CUA cliente
sin barbería: cero invitaciones, sin error, actualizar vuelve a consultar correctamente.
19 pruebas dirigidas y lint aprobados; pruebas nuevas del launcher incluidas.

24nov — Etiquetas de Mis reservas Web: confirmada verde, atendida azul,
inasistencia roja, en atención ámbar y cancelada gris. Texto de estado explícito.
No se inventa estado Reprogramada: el detalle actual no expone esa señal;
la reprogramación mantiene el estado de reserva y tiene historial separado.

24nov — Mis reservas cliente: historial ordenado por fecha/hora de cita descendente,
sin anteponer confirmadas a canceladas. Próxima cita toma la más reciente entre
las futuras elegibles, según solicitud; conserva exclusión de atendidas/inasistencias.
Listado Android comparte orden descendente. No modifica snapshots ni datos guardados.

24nov — Detalle profesional Web: frase de reserva confirmada sustituida por
etiqueta compacta «Pendiente», con punto ámbar y borde discreto en la cabecera.
Ajuste posterior: franja centrada verticalmente con padding simétrico; hora
abierta de18px y recuadro58px; separación12px entre reservas en agenda/resumen.

24nov — Iniciar/Completar atención, Registrar pago recibido y Registrar inasistencia
en Mi agenda/Resumen profesional Web abren confirmación
compacta centrada dentro de Gestión de la cita, con fondo atenuado/desenfoque y
transición reducida según preferencias. X/Cancelar/Escape no mutan; foco inicial
en Cancelar, ciclo de teclado y restauración de foco, acciones subyacentes inert.
Conserva confirmación real, bloqueo de envío duplicado, recuperación de resultado
incierto y aviso ámbar antes de hora. Android conserva el flujo compartido previo.
Ventana compartida CareOperationConfirmation con texto/icono por operación;
pruebas cubren cancelar sin mutación y confirmación única con atestación de pago.
Revisión visual inicial Web sin confirmar ni alterar reservas. Pendiente prueba Android
física; este ajuste de presentación está limitado a Web.

24nov — Gestión de la cita profesional Web compactada: aviso de código Yape
antes de las acciones, cuatro acciones alineadas con icono y texto horizontales,
historial a la izquierda y cancelación compacta a la derecha. Adaptación móvil
conservada. Verificación visual en navegador, tipos, lint y6 pruebas profesionales
aprobadas. Sin mutaciones de reservas ni pagos durante la revisión.

24nov — Aviso horario al PULSAR Iniciar atención, según aclaración del usuario:
CareControl recibe startsAt y antes de abrir confirmación comprueba hora actual.
Si es temprano, dispara SuccessToast tone=warning en esquina superior derecha,
con hora habilitada, cierre X y desaparición5seg. Botón sigue pulsable; no banner
permanente ni consulta/mutación en ese intento. Después de hora conserva flujo.
Props conectadas en resumen, Mi agenda, agenda general y BookingCard universal.
SuccessToast por defecto conserva mensajes verdes. Tipos y pruebas dirigidas pasan.

24nov — Mi agenda profesional: citas por hora de inicio descendente, con
desempate por id, tanto presentación profesional Web como listado universal.
En vista semanal se conserva agrupación diaria. Regresión de orden y11 pruebas pasan.

24nov — Agenda general: citas de cada grupo profesional ordenadas por instante
de inicio descendente (hora más reciente primero), con desempate por id. Orden
de grupos y agenda personal conservados. Regresión de orden actualizada.

24nov — Notificaciones Web: «Abrir agenda» resuelve destinos /agenda existentes
a /staff?view=professional&section=agenda, según solicitud del usuario. Invitación
aceptada conserva Ver equipo. Prueba de enlace actualizada y5 pruebas aprobadas.
Sin migración ni modificación de notificaciones guardadas.

24nov — Retirada la etiqueta visible «hora de Lima» de Mis reservas Web
(próxima cita, historial y detalle). Se conserva el formato temporal vigente.

24nov — Corregida percepción de botón inerte en Mis reservas. AppointmentControls
abre explícitamente panel Atención y pago en onReadStart, selecciona la cita si
se consulta desde Próxima cita y desplaza hacia el detalle. Cierre X y carga visible.
Aviso efectivo presencial. CUA apertura/cierre reales comprobados, cita seleccionada
era efectivo. Sin escrituras de negocio ni recarga manual. Tipos/lint/25 pruebas pasan.

24nov — Usuario autorizó TERMINAR Y ACTIVAR spec017, difiriendo QRStorage.
Pruebas SQL reales en copia aislada yape_report_017_1795549702928 del contenedor
supabase_db_app-barberia-002-local: migración ejecutada, validación3dígitos,
autorización dueño/ajeno, replay/conflicto, carreras report/report, report/receive,
report/cancel, rechazo efectivo/cancelada y RLS sin acceso directo. Fallo forzado
de notificación revierte reporte/evento. Resultado .artifacts/yape-report-local-result.json.
Original local conservado. Primer clone falló al copiar vault con postgres;
segundo usó supabase_admin. Cambios/fixtures solo en copia aislada.
CLOUD ACTIVADO en proyecto vinculado: migración20261124193549 y reservation-command
v4 ACTIVE/verify_jwt=true; demás funciones conservadas. Backup privado
LocalAppData/Barbexa/backups/yape-report-1795549850760, pointer y operador
.artifacts/yape-report-cloud*. Todas25tablas anteriores hash/conteo idénticos,
nueva yape_payment_reports vacía, RLStrue y acceso directo denied. CORS204/origen
localhost8081 y POSTsinJWT401 verificados usando confianza CA del sistema.
Sin pagos reales ni fixturesCloud. QRStorage, abonos y mixtos quedan fuera.
Recorrido con transferencia real/Android físico sigue sin acreditarse.
La autorización cubrió esta activación puntual. No repetir operacionesCloud sin
necesidad. Staging/commit/push y logt017 intactos.

24nov — Preparación LOCAL aprobada del aviso de pago Yape del cliente (spec017).
Tarjeta ClientYapePayment en Mis reservas con snapshots e importe, copiar celular,
QR explícitamente pendiente, código3 y Confirmar pago. renderPaymentInfo opcional
con bridge React en CareControl conserva fallback universal. Android comparte
formulario/comando. Reporte no marca paid. Código visible en atención compartida,
detalle profesional y agenda administrativa. canReportYape ausente deshabilita
el envío en Cloud antiguo y explica activación pendiente. Pending conserva código
 y requestId en reintento, doble envío protegido. Dominio cliente/servidor acepta
report-yape, valida3dígitos y proyección opcional compatible.
Migración CLI 20261124193549_client_yape_payment_report.sql PREPARADA SIN APLICAR:
tabla privada/RLS sin acceso directo, dueño de reserva, locks autoridad/persona/fila,
Yape pendiente/confirmada sin inasistencia, un reporte por cita, evento idempotente
y notificación atómica. Staff confirma recepción por receive existente. No QRStorage,
abonos ni pagos mixtos. SQLreal y carreras pendientes, prueba preparada
 tests/integration/booking/yape-report.local.sql requiere fixtures locales autorizados.
Sin Cloud/migraciones aplicadas/despliegue/servicios/fixtures alterados.
Tipos cliente/core servidor, lint/formato y arquitectura cliente/servidor pasan.
Cliente584/584 antes del ajuste bridge, dirigidas finales20/20 y servidor4/4.
Logs .artifacts/yape-report-*. CUA solo lectura Mis reservas:2 citas efectivopendiente,
sin nueva reserva/pago. Recorrido real Yape Web/Android y SQL sigue pendiente.

24nov — Mis reservas Web usa ClientRescheduleForm mediante renderContent de
RescheduleControl. Selector date con botón de calendario, fecha mínima Lima,
horarios seleccionables en cuadrícula, cierre/cancelar y estados de consulta,
vacío, error e incertidumbre. Controlador y permisos existentes. Tipos, lint,
30 pruebas dirigidas y arquitectura aprobados. Revisión visual pendiente.

24nov — Ajuste Web del pie de detalle en Mis reservas: acciones en dos columnas,
aviso de cancelación en fila completa, historial en fila independiente y bloque
de atención/pago con fondo suave y espaciado. En móvil se apilan los botones.
Lint y25 pruebas de booking aprobadas. Solo estilos de my-reservations.web.

24nov — Editor Web de Yape en una tarjeta única de ancho máximo800px,
formulario y vista previa con divisor interno y separación12px, campos/área de carga máximo360px y botones
compactos. Columnas apilables según el ancho disponible. Titular y celular se guardan dentro
de las instrucciones existentes, conservando el texto anterior. Campo de
indicaciones adicionales retirado de la interfaz a petición del usuario. QR local
con selección, reemplazo y retirada. Propuesta de persistencia estructurada
y Storage en specs/011-equipo-resumen-profesional/ui-yape-web.md.
Sin escrituras Cloud de prueba. Verificado en el navegador en escritorio.

24nov — Rediseño Web de Administración/permisos/invitaciones según adjuntof5673624.
Ajuste visual solicitado: iconos de tarjetas unificados a22px en fondos40px,
acciones20px e insignias15px; áreas de pulsación44px conservadas.
Invitaciones administrativas enviadas usa details/summary cerrado inicialmente,
flecha circular y contenido conservado al plegar. Encabezado sin fondo hover,
padding vertical16px; tres títulos20px (móvil18), iconos20px/fondos36px. Tipos y6 pruebas de presentación pasan.
Nuevos admin-management.web.tsx/styles y admin-management-panel.web.tsx. Resumen4,
tabla/filtros locales, detalle/menú, invitación plegable y cierre/Escape/foco, enviados
con confirmación porID y matriz informativa de roles. Render opcional en controladores
TeamAuthorityPanel/AdminInvitationsPanel conserva lógica/colas/estados/idempotencia;
slot administrationPanel de OperationScreen compuesto solo por operation-route.web
evita duplicados. Salida universal anterior por defecto intacta, sin cambiosAndroid.
Propietario excluido de cupo2; no inventar correos/actividad ausentes decontratos;
nombres reales disponibles, invitaciones filtradas shop/vigencia y estadosdesconocidos—.
Secundario sin consultas/control deequipo ni conteosprotegidos; transferencias/reportes
no operativos no expuestos. Pruebas nuevas8/8, dirigidas29/29 ycliente576/576. Tipos/
lint/formato/grafo aprobados; evidencia004 ui-administracion-premium.md. Render1600/1260/800/390
sin overflow. CUA100% real: owner0/2, pendientes0,2cupos, formulario abre/cierra y
previewrolsecundario4permitidas/4restringidas. Sin envíos/cancelaciones/retiradas reales,
Cloud/SQL/flags/servicios/configuración o navegación modificados. Detener para revisión
visual delusuario. Spec011 ui-administracion-premium.md lista archivos y límites.

24nov — Gestión de administradores Cloud HABILITADA en cliente por aprobación específica.
Revisión remota encontró barbershop-operation yaACTIVE v6, verify_jwt=true, tres flags
correctos por digest y fuentes descargadas idénticas a locales. No hizo falta desplegar
ni cambiar secretos/migraciones. Respaldo privado admin-authority-1795536617068 y
comparación final conservan4funciones, secretos y25tablas public/private.
Metro anterior36388 delworkspace estaba sin flags cliente; detenido solo ese proceso.
Primer intento de inicio se detuvo por puerto aún ocupado; después inició pid24448
con ambos EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY/ADMIN_INVITATIONS=true, perfil
cloud-integration. .env.local ylogt017 intactos. Estado/logs .artifacts/admin-authority-*.
Pestaña original conservada; nueva pestaña /staff?view=team con sesión existente:
Administrador principal · Propietario,0/2secundarios,2cupos, formulario porcorreo
habilitado y consulta real de invitaciones vacía. No envío/aceptación/retirada ni
cambio de rol/propietario. Pruebas cliente22/22, servidor9/9. Ver spec011
cloud-admin-in-app.md y evidencia admin-in-app-activation.md. Android real y recorrido
de secundario siguen pendientes. Al reiniciar Metro usar perfilCloud con ambos flags;
el launcher normal anterior los omitía. No repetir activación Cloud por antecedente.

24nov — Corregido error Web app?.removeNotice is not a function. Runtime conservado
en useState sobrevivía Fast Refresh con Inbox/gateway anteriores, mientras pantalla nueva
y capability Cloud habilitaban acción nueva. RegistrationRuntimeProvider usa useMemo
por returnFence/composición y pasa fábrica explícita a createRegistrationRuntime:
libera recursos anteriores y monta composición vigente; no cambia permisos/SQL.
Regresión reprodujo instancia legacy sin removeNotice (roja antes); prueba actualización,
dispose y eliminación por controller real/adapter con dobles. Prueba InboxScreen ahora
cubre handler de confirmación, fallo503 conserva aviso/confirmación y retry positivo.
Dirigidas27/27 y cliente568/568; tipos/lint/formato/arquitectura pasan. CUA página recuperada y9 avisos,
sin reload manual ni eliminación real. npm test falla en cobertura global (líneas63.10%,
funciones84.72%, umbral100%), no en assertions unitarias; detalle en evidencia012.

24nov — Eliminación individual de notificaciones ACTIVADA tras aprobación explícita
del usuario para ensayo y Cloud. Papelera en tarjeta desplegada con confirmación inline;
Inbox serializa reads/refresh/remove, deduplica por scope/id y relee lista confirmada.
SQL deleted_at conserva claves dedup y reserva/invitación/eventos; valida destinatario,
auth y visibilidad vigente; retry idempotente. Ensayo PostgreSQL17.11 sin red,23 migraciones
previas + contrato aprobado, denegaciones/aislamiento/conteo/lectura/dedup pasan, rollback
y contenedor retirado. Scripts notification-delete-rehearsal.mjs y notification-delete-cloud.mjs.
Respaldo privado schema/data/roles/historial en LocalAppData/Barbexa/backups/
notification-delete-1795535265282. Migración20261124154602 aplicada, historial24,
27 tablas protegidas conservadas; grant authenticated y anon denegado; canRemove=true.
Lectura Cloud posterior en transacción READ ONLY aprobada. CUA sesión real: Actualizar
notificaciones habilita papelera sin reload; abrir confirmación y Conservar mantienen9
avisos. No se confirmó ninguna eliminación real. Cliente17/17, tipos/lint/arquitectura
y formato aprobados. Evidencia012 eliminacion-individual.md. Validación de borrado real
Web y dos cuentas sigue pendiente; no repetir operaciones Cloud por este antecedente.


24nov — Cada reserva de Agenda general Web es ahora details nativo cerrado al inicio,
independiente del grupo profesional. Summary muestra tienda/estado/fecha/hora y chevron
SVG circular; cuerpo con datos, atención y pago/historial permanece plegado. No auto
consultas al expandir ni comandos nuevos. Accesible teclado, responsive y reduced-motion.
Dirigidas9/9, tipos/lint; capturas1600/1260/800/390 sin overflow. Sin recarga/Cloud writes.


24nov — Agenda general Web: usuario retira acción Reprogramar cita. AdminBookingCardWeb
pasa canChange=false al RescheduleControl, conserva Consultar historial de reprogramación
por ID real incluso después de consultar atención. Otras agendas/cliente y permisos
backend intactos. Test rojo→verde con atención confirmada e historial real del controlador;
dirigidas9/9, tipos/lint. No recarga ni operaciones de reservas reales.


24nov — Pulido agenda administrativa Web: quitado texto hora de Lima del encabezado
y fecha de tarjetas, manteniendo conversión America/Lima. Chevron SVG18px en círculo34px
en summary de grupos, rotación abierto/cerrado y hover/reduced-motion. Conserva details
nativo/teclado; no cambia Android ni agenda personal. Tipos y dirigidas7/7 aprobados.


24nov — Agenda general Web rediseñada según adjunto67da982a. AgendaWeb variante
administrativa bx-aa ancho disponible y grid74/26, filtros horizontales, métricas de
consulta, leyenda/resumen/timeline/consejos. Nuevos admin-agenda-icons.web.tsx,
admin-agenda.styles.ts y admin-booking-card.web.tsx. AgendaContent usa tarjeta nueva
solo Web+administrator; Android y agendas profesionales conservan consumidores previos.
Agrupación porbarberId/orden horario/details intacta. CareControl/RescheduleControl/
CancellationControl reutilizados; panel compacto de atención/pago/operaciones con
confirmaciones existentes. Care views obtenidas al consultar actualizan métricas de
filas actuales; si faltan datos atención/pago muestran—, no0. Cache acotada a referencia
rows; respuestas de tarjeta desmontada se ignoran. Filas no-ready no se renderizan.
Sin consultas extra, SQL/Cloud writes/roles/entorno/otras pantallas modificados. Notas
no existen: reemplazadas por Gestión de la agenda. Vista aislada1600/1260/800/390 sin
overflow. Hallado style con múltiples hijos omitido en SSR: corregido a string único
y añadido assert de CSS integrado. Cliente dirigidas32/32 (agenda/filtros/care/
reprogramación/agenda profesional), tipos/lint/formato/arquitectura/diff pasan. Sin
batería ajena por petición expresa. No se recargó navegador o tocó reservas reales.
Spec ui-agenda-barberia.md ampliada; artefactos .artifacts/admin-agenda-premium-*.
Detener para revisión visual integrada del usuario; Android físico no acreditado.


24nov — Recuperación de permisos: use-team-authority añade watchdog12s para lectura
administrativa inicial idle/loading. Al expirar llama invalidate existente: retira
valor, libera flight lógico e invalida ticket; reintento inicia lectura nueva. Callback
comprueba actor/scope/snapshot idéntico para no invalidar consulta posterior; timer se
limpia al resolver/cambiar scope/desmontar. No expira permisos ready durante revalidación.
OperationRoute Web conserva cabecera/pestañas, skeleton discreto y salidas seguras;
error habilita Volver a verificar sin ir a Inicio. Nunca monta controles privados sin
facultad verificada. Backend/roles/RLS/Auth intactos, sin recargas o servicios operados.
Pruebas: consulta colgada, retry y respuesta antigua válida descartada; navegación/
seguridad de gate. Cliente561/561, tipos, lint/formato, arquitectura/diff aprobados.
Espera colgada simulada aislada, no se interrumpió la red del usuario. Spec:
specs/004-mvp-reservas/ui-recuperacion-permisos.md. Logs .artifacts/permissions-loading-*.


24nov — Ajuste posterior de referencia Pagos y reglas: filas compactas, franja inferior
confirmación/registro/consulta y tarjetas de reglas de pago como filas enmarcadas.
Grid12 con top7/5 y bottom6/6; ejemplo tolerancia desplegable, acciones reprogramación
compactas conservan nombres accesibles. Efectivo indicador fijo (no desactivable).
Switch Yape deriva del borrador de instrucciones: vaciar requiere confirmación inline,
solo afecta al guardar; reactivar restaura texto consultado o abre edición si no existe.
No comando de habilitación nuevo. Test rojo→verde confirma no borrado ni guardado en
primer clic. CUA real muestra nueva distribución/switch y datos10/120; no interactuó
con switch ni guardó Cloud. Capturas1260/800/390 sin overflow. Cliente559/559, tipos,
lint/formato/arquitectura. Solo Web; funciones económicas ficticias siguen omitidas.


24nov — Corregida fricción de edición Pagos y reglas: controles permanecían desactivados
hasta consulta manual. Verificado con CUA: clic consultar habilitó Editar/Guardar, no
fallaba la lectura de servidor. Nuevo use-initial-read.ts (ref actualizado en efecto,
consulta una vez por scope y sin recargar por ediciones). autoLoad opt-in de CareSettings
y ReschedulePolicyControl, activado SOLO composición Web premium. Native/default sin
cambios. Carga/reintento explícitos; no guardar valores no consultados. Regresión roja→verde
consulta automática command=settings, ninguna escritura; pruebas previas dobles envíos.
CUA real tras HMR: valores10/120 cargados, ambos guardados habilitados; botón Editar
abre textarea editable. Se dejó abierto para el usuario, sin escribir ni guardar datos.
No refresh del navegador, SQL o Cloud writes. Verificación final en ui-pagos-reglas.md.


24nov — Corrección conexión premium: usuario seguía viendo panel antiguo. Cambiado
import de operation-route.web.tsx a payments-and-rules-panel.web explícito; mantiene
fallback Android. Regresión de cableado roja→verde; cliente557/557, tipos/lint/diff pasan.
Verificado directamente por lectura CUA de ventana Brave331542 en /payments-rules:
Barber Style, banner Configuración de pagos y políticas, cuatro tarjetas y textos nuevos
visibles tras actualización en caliente. No pulsar recargar, consultar, editar o guardar;
ningún dato cambiado. La lectura confirma interfaz integrada, no escrituras. Consulta
HTTP de bundle solo diagnóstico (artefacto ignorado); finalizada. No era suficiente
la captura aislada anterior para acreditar que la página activa usaba el componente.


24nov — Rediseño premium SOLO Web de Pagos y reglas conforme adjunto11c4eaf0.
Nuevo composition/payments-and-rules-panel.web.tsx y reservations/presentation/
payments-rules-web.tsx/.styles.ts: ancho completo con márgenes prudentes, banner SVG/CSS,
cuatro tarjetas en2 columnas, editor desplegable Yape (campo único), estados consultados
vs borrador, controles numéricos y ejemplos. Sin interruptores económicos ficticios.
CareSettings renderLayout expone editor/callbacks; baseline React state para no leer
refs en render. ReschedulePolicyControl renderContent opcional mantiene controlador.
Interfaz Android anterior conserva fallback. Un guardado Yape+tolerancia, otro propio
reprogramación; límites existentes0–1440/2000chars y entero no negativo. Reembolsos
permanecen en atención; anticipos/facturación/comprobantes omitidos por falta de soporte.
Verificación cliente556/556, tipos/lint/formato/arquitectura/diff pasan. Capturas aisladas
1260/800/390 sin overflow; fuentes de prueba solo .artifacts/payments-premium-*.
No Cloud, datos, SQL, cambios Auth o recarga de pestaña. Detener esta sección para revisión
visual del usuario. Spec ui-pagos-reglas.md actualizada. Aceptación integrada pendiente.


24nov — Tus barberías añade tarjeta Agenda de esta barbería con botón nombrado según
el establecimiento seleccionado, solo para rol administrador. ContextScreen recibe
onAgenda desde ruta /context y navega a /agenda sin cambiar contexto. En Web, la agenda
general agrupa por barberId en details nativos, nombre/conteo y orden horario dentro;
Android agrupa con Section. Conserva BookingCard/acciones/filtros/cap de200 y agenda
personal intacta. AgendaRoute pasa nombre actual visible; solo filas ready se muestran.
ContextContentWeb corrige ancho de caja y recorta decoración horizontal desbordada.
Verificación: cliente554/554, tipos, lint, arquitectura; vista aislada del contexto
1260/800/390 sin overflow. Sin recarga de pestaña, datos operados o cambios servidor.
Aceptación integrada de agrupación/acciones y Android físico pendiente. Spec:
specs/004-mvp-reservas/ui-agenda-barberia.md. Artefactos .artifacts/shop-agenda-*.


24nov — Nueva pestaña administrativa «Pagos y reglas» después de Horarios, ruta
/payments-rules Web/Android. Composición payments-and-rules-panel reutiliza CareSettings
(renderLayout opcional, mismo payload/guardas) y ReschedulePolicyControl. Apartados:
Pagos (Yape manual), Reglas de atención (tolerancia), Reglas de reservas (reprogramación).
Retirados esos controles de AgendaScreen en ambas plataformas; agenda general intacta.
No se movieron las otras políticas generales existentes de ShopSettingsWeb. Autoridad
administrativa/contexto vigentes, remonte por actor/generación/barbería. Sin operaciones
Cloud, cambios de datos, recarga de pestaña ni migraciones. Aceptación visual integrada
Web/Android pendiente. Spec: specs/004-mvp-reservas/ui-pagos-reglas.md.
Verificación: cliente552/552, tipos, lint dirigido, formato, arquitectura y diff
aprobados. Logs ignorados .artifacts/payments-rules-*. El primer cliente detectó
6 fallos del cargador route-hydration por .styles.ts; corregido y repetido completo.


24nov — Usuario exige total exacto de barberías: retirado «1 o más». Nuevo componente
account-membership-count.tsx consulta listOwnMemberships existente mediante contexto
de lectura conectado en registration-runtime-provider. Conteo propio/activo deduplicado;
carga, fallo/reintento y descarte actor/generación/scope/desmontaje. No reglas Auth,
SQL, Cloud writes o endpoints nuevos. choosing/none usan datos ya disponibles.
Pruebas nuevas de conteo; fixture runtime añade el puerto tenant existente al doble.

24nov — Mi cuenta personal Web rediseñada según nueva referencia: banner, columnas
editor/resumen-citas-accesos, nuevo personal-profile-form.web.tsx y estilos de cuenta.
Editor conserva consulta/edición/guardado/cancelación y Android anterior. Datos personales
no alteran perfil profesional. Confirmación real del correo; conteo exacto deduplicado
en choosing y0 en none. selected carece de lista completa: «1 o más» con nota, sin
consultas nuevas o modificación de Auth. Límite pendiente si se requiere total exacto.
Vista aislada1260/800/390 sin overflow; no guardar datos personales reales ni recargar
pestaña del usuario. Ver specs/004-mvp-reservas/ui-cuenta-personal.md; aprobación visual
integrada pendiente. Artefactos ignorados .artifacts/account-premium-*.
Verificación: dirigidas32/32, tipos, lint, formato, arquitectura y diff aprobados.

24nov — Mi cuenta Web: usuario solicita quitar bloque Tu espacio de trabajo completo
y subtítulo Organiza tus citas y accede a tus barberías. Retirados solo de
web-profile-access.web.tsx y account-profile-web.tsx. Conserva identidad/editor,
próximas citas y accesos personales (invitaciones/crear barbería). No altera menú avatar,
rutas, permisos ni interfaz Android. Pruebas de navegación actualizadas a esta decisión.

24nov — Posición final solicitada de Actualizar invitaciones: en la fila de filtros
justo después de Aceptadas, separación adicional16px (más gap10px). En móvil pasa a
fila propia con espacio superior; conserva handler/disabled. Encabezado reserva
espacio para avatar fijo, ya sin acción debajo de este. Solo JSX/CSS de inbox.

24nov — Mis invitaciones recibidas: nueva referencia del usuario sustituye propuesta
preliminar pausada. composition/received-invitations-page.web.tsx + presentation/
invitations-inbox.web.tsx/.styles.ts; ruta staff/incoming ahora muestra bandeja unificada,
filtros/historial/detalles/resúmenes reales. Solo lecturas propias y servicios existentes
de respuesta por rol; guardia doble clic/scope/desmontaje. Fallo incierto bloquea respuestas
hasta relectura completa. Fuentes parciales muestran errores y conteos no verificados.
Invitador/fechas ausentes se indican sin inventar datos; caducidad7d solo administración.
Vista aislada con mocks solo en artefactos a1260/800/390 sin overflow. Sin pestaña real,
operaciones Cloud, SQL o Git writes. Detalle: specs/004-mvp-reservas/ui-invitaciones-recibidas.md.
Pendiente aprobación visual integrada. Propuesta de dos secciones permanece solo como
compatibilidad en composiciones heredadas; la ruta Web activa usa el diseño nuevo.
Verificación final: cliente547/547, tipos, lint, formato, arquitectura y diff pasan.
Una ejecución intermedia falló por apertura transitoria UNKNOWN de archivo al cargar
prueba OAuth; reejecución aislada6/6 y batería completa547/547 pasan sin tocar Auth.

24nov — Perfil profesional: retirada fila Zona horaria a petición del usuario.
«Miembro desde» ya formatea memberSince real en Lima; membresías anteriores a013
quedaron joined_at=NULL de forma deliberada, sin fechas históricas inventadas. Confirmado
en migración013 y evidencia de sección7; esquema inicial no tenía fecha de membresía.
Fecha de incorporación real de ERWIN IP a Barber Style pendiente; el usuario pospuso
expresamente este trabajo. No insistir ni completarla hasta que lo retome.
No escribir fecha de hoy/registro Auth como sustituto ni alterar Cloud sin alcance
concreto. UI/tests modificados; dirigidas6/6, tipos y lint pasan. Log ignorado
.artifacts/profile-membership-ui-tests.log. Fecha histórica aún NO completada.

24nov — Etiquetas de estado en tarjetas de Mi agenda conservan iconos de la leyenda:
check completada, reloj en atención, información confirmada/desconocida y X cancelada/
inasistencia. Reutiliza AgendaIcon,14px con separación6px y color de etiqueta; no reglas
nuevas. Solo agenda/CSS; tipos, lint y pruebas agenda6/6 aprobados.

24nov — Mi agenda profesional adopta la tarjeta desplegable del resumen por solicitud
expresa. professional-agenda.web.tsx reutiliza ProfessionalReservationDetail y
ProfessionalRescheduleForm; cabecera con summary/flecha circular, sin menú tres puntos
ni panel de atención separado. Conserva filtros/día/semana y resúmenes de servidor.
CareControl refresca tras mutación verificada, pausa edición al recargar y no expone
acciones sin capacidad. CSS puente acotado bx-pa-unified-card. Vista aislada con estilos
de agenda a1260/800/390 sin overflow; no toca pestaña/datos Cloud. Pendiente revisión
integrada real. Evidencias ignoradas .artifacts/agenda-unified-*.
Verificación: cliente543/543, dirigidas agenda6/6, tipos, lint, formato, arquitectura
y diff --check aprobados.

24nov — Botón Cerrar en encabezado del formulario de reprogramación profesional.
onClose opcional conectado a setExpanded(false), sin enviar cambios; bloqueado durante
petición o resultado incierto (incluye guardia inFlight). Puede reabrirse con el botón
existente. Solo formulario/props/control/tests; sin tocar Cloud o pestaña del usuario.

24nov — Formulario Reprogramar cita del resumen profesional: nuevos composition/
professional-reschedule-form.web.tsx y .styles.ts; fecha con calendario, motivo,
cuadrícula de slots y selección visible antes de confirmar. RescheduleControl admite
renderContent opcional; este diseño se conecta SOLO al dashboard profesional. Android
y demás consumidores mantienen presentación anterior. Sin reglas nuevas/Cloud; misma
consulta, confirmación, guardia y reintento. Vista aislada a1260/800/390 sin overflow.
Prueba existente de agenda fijada al23nov en su doble de fecha: asumía ese día y fallaba
el24nov; no modifica el reloj ni código de aplicación. Logs .artifacts/pro-reschedule-*.
Revisión visual integrada/Android real pendiente, no reprogramar citas para probar.
Cliente542/542, tipos, lint, formato, arquitectura y diff aprobados.

23nov — Control de despliegue de citas del resumen: sustituida «⌄» por chevron SVG
en círculo36px, flecha abajo/cerrado y arriba/abierto, colores crema/dorado y contraste
en encabezado marrón. Conserva summary nativo, teclado y clic en toda la cabecera.
Columna móvil ajustada36px; solo dashboard Web/CSS. Sin recarga ni operaciones reales.

23nov — Espaciado prudente del detalle profesional: solo CSS. Interior máximo1040px,
separaciones14px, etiquetas próximas a valores, paneles sin estirar altura y acciones
de64px mínimo en escritorio. Conserva tipografía/datos/controles. Vista aislada revisada
a1260/800/390 sin desbordamiento; sin tocar sesión o datos reales. Ver detalle en spec UI.

23nov — Ajuste visual posterior solicitado: retirados del detalle desplegable los
bloques Resumen rápido, Siguiente paso recomendado y Ayuda. Contenido principal ocupa
todo el ancho; datos, estados y acciones superiores conservados. Solo componente/CSS
professional-reservation-detail; tipos, lint, formato y dirigidas21/21 pasan.

23nov — Detalle desplegable de cita en Resumen profesional rediseñado por indicación
del usuario. Nuevos composition/professional-reservation-detail.web.tsx y .styles.ts;
dashboard reutiliza CareControl/RescheduleControl/CancellationControl. RenderLayout
ofrece operaciones/feedback; selección y recomendación comparten confirmación/guardia.
Estados reales sin asumir pago recibido; creación desde evento; fechas Lima. Encabezado
y resumen se actualizan con respuesta/consulta verificada y guardia de clave/contexto.
Columnas adaptadas al ancho de tarjeta, sin tocar las otras pestañas o reglas servidor.
Vista aislada a1260/800/390 sin desbordamiento; no se tocó sesión/pestaña del usuario ni
datos Cloud. Pendiente aprobación visual integrada. Ver specs/004-mvp-reservas/
ui-detalle-resumen-profesional.md y logs ignorados .artifacts/pro-detail-*.
Cliente541/541, dirigidas21/21, tipos, lint, formato, arquitectura y diff pasan.

Pendiente UX pospuesto expresamente por el usuario: transición de `/auth/callback`
tras Google muestra brevemente blanco y luego indicador, pero completa rápido.
Mejorar posteriormente con estado «Completando tu acceso…» para evitar blanco inicial.
No hay bloqueo persistente reportado; no implementar ni modificar Auth ahora por esto.

23nov — Ajuste posterior SOLO del progreso inferior de confirmación Web autorizado:
franja de ancho completo, separación superior40px, relleno28/34px, margen inferior64px
y pasos verticales bajo600px. Conserva textos y estados; no altera reservas ni pagos.
Usuario aportó captura de la confirmación real. Sin recarga manual, navegación ni
reinicio de aplicación; resultado visual posterior pendiente. Pruebas dirigidas25/25,
tipos, lint, formato y diff del archivo pasan. Detalle en ui-confirmacion-premium.md.

23nov — Confirmación premium Web implementada según referencia en booking-confirmation
(component/CSS), integración booking-screen/content. Datos reales, servicios múltiples,
política snapshot y CareControl exacto; progreso NO afirma notificación enviada.
Recuperación Web: sessionStorage SOLO ID por usuario/contexto y consulta REST propia
por ID autenticado (sin límite50), estado/epoch/ticket validados, sin nuevo confirm;
salida explícita hacia Mis reservas o preparar formulario nuevo. No datos Cloud nuevos.
Cliente537/537, dirigidas42+4, tipos/lint/grafo/exportWeb+Android pasan. UnitariasTS191
pasan pero comando1 por cobertura global63.59%líneas/84.72%funciones (<100); no se baja
umbral ni se acredita gate. UI real no validada: pestañas ya sin confirmación tras
actualización; usuario lo confirmó. No reservar para probar. Pendientes próxima
confirmación visual real/F5/viewport estrecho/Android físico. Detalle de archivos y
límites: specs/004-mvp-reservas/ui-confirmacion-premium.md. Sin Cloud/SQL/gitwrites.

23nov — Escala compacta de equipo solicitada: SOLO team-management-web.styles.ts.
Título Gestión de equipo22px (anteshasta30), Miembros20px (antes22), números24px
(antes30;22bajo1200), iconos22px en cuadros40px (38bajo1200;antes52/44).
Reglas de etiquetas Profesionales activos/Invitaciones profesionales pendientes/
Roles en el equipo (13px) y Administrador·Profesional (11px) conservadas y comprobadas.
6 pruebas de equipo, tipos/lint/formato pasan. Sin lógica, permisos, datos ni Cloud.
Sin nueva comprobación visual manual de este ajuste.

23nov — Acceso profesional reubicado por petición: avatar muestra «Mi espacio
profesional» para membresía profesional o administrador verificado, misma ruta
/staff?view=professional. Retirado botón «Consultar mi actividad profesional»
de gestión de equipo (vista Web y fallback), props/callback obsoletos eliminados.
Interfaz ProfessionalWorkspace, resumen, agenda, horarios, perfil y guardas sin
cambios. Archivos user-menu.web, operation-screen, team-management-web y
operation-route.web; workspace-navigation valida enlace administrador/profesional.
28 pruebas dirigidas pasan (navegación, espacio profesional y equipo). Sin cambios
Cloud, datos, roles o servicios. Comprobación visual manual de este ajuste pendiente.

23nov — Menú del avatar: retirado únicamente el acceso duplicado «Gestión de equipo
y personal» de user-menu.web.tsx por petición del usuario. Se conserva «Administrar
barbería», su pestaña interna de equipo, rutas, permisos y otros accesos del perfil.
Prueba workspace-navigation actualizada para exigir el enlace administrativo y la
ausencia del duplicado en el avatar:21/21 pasan. Sin operaciones Cloud ni servicios.

23nov — Administración secundaria Cloud preparada por solicitud del usuario; elige
invitación/aceptación DENTRO de BARBEXA. Runtime nuevo flag público de autoridad,
invitaciones condicionadas a él, default cerrado; no .env.local ni Metro modificados.
Apartado administrativo siempre localizable, gestión solo con facultades verificadas;
panel RN compartido Web/Android y ruta nativa conectada. Servidor acepta canal in-app
por configuración: no reclama/envía correo, retry mail denegado; email LOCAL conserva
comportamiento. Reutiliza SQL/cupo2/aceptación/idempotencia/notificaciones existentes.
Solo lectura Cloud autorizada por herramienta:1shop/1ownership/0sinpropietario;
flags autoridad/invitaciones y mail ausentes. Sin roles/SQL/despliegues modificados.
Cliente529/529, servidoroperación39/39, finales25/25, tipos/lints/grafo/checkEdge/
export Web+Android/formato pasan. SIN aceptación visual real ni invitaciones reales.
Pendiente permiso específico: desplegar SOLO barbershop-operation, activar
BARBERIA_ENABLE_TEAM_AUTHORITY, BARBERIA_ENABLE_ADMIN_INVITATIONS y canal in-app;
activar flags cliente en proceso Cloud con recarga/Metro solo si necesario, logt017
intacto. Sin migración, asignación de propietario, promociones ni correos de prueba.
Plan/revisión: specs/011-equipo-resumen-profesional/cloud-admin-in-app.md.

23nov — Ajuste de escala solicitado SOLO para última UI de bloqueos/cierres:
availability-tools-web.styles.ts iguala títulos a Disponibilidad semanal (22px,
21px bajo650), descripciones12px y controles13px. Recuadros dorados58→48px,
iconos29→24px (auxiliares21px), vacío45→32px; alineaciones de cierre recalculadas.
Sin lógica ni otras pantallas. Tipos/lint, formato y 4 pruebas dirigidas aprobadas;
sin nueva revisión visual de este ajuste. Ver ui-bloqueos-premium.md en spec009.

23nov — Rediseño premium de «Bloqueos y cierres por fecha» según nueva referencia:
encabezado, tres tarjetas, banda crema y columnas formulario/consultas ~60/40;
responsive y estilos locales. Formulario, destino sincronizado, cuenta propia,
callbacks y permisos conservados. Vacío premium de cierres solo tras consulta vacía;
prop premium opcional solo en esta composición Web. Cliente527/527, dirigidas16/16,
tipos/lint/grafo/export Web pasan. Revisión visual real Brave localhost8081/schedules
con sesión existente, solo scroll/lectura: tarjetas, formulario, paneles y vacío
visibles; último ajuste de iconos posterior. Viewport estrecho/Android físico y
guardado real pendientes. Sin servidor/Cloud/SQL/dependencias/gitwrites. Detalle:
specs/009-horarios-profesionales/ui-bloqueos-premium.md.

23nov — Disponibilidad administrativa aclarada por solicitud del usuario: guía en
«Bloqueos y cierres por fecha», bloqueos de cuenta propia identificados, formulario
«Registrar un cierre o una ausencia» con selector sincronizado y alcance dinámico
Toda la barbería/Solo profesional; fecha nativa Web y botón contextual. Cierres del
local registrados explica consulta/retirada y dónde crear uno. Bloqueos propios no
cambian con selector; editor semanal personal duplicado sigue oculto en admin.
Textos de alcance también Android. Sin dominio/servidor/Cloudwrites ni migración.
Cliente526/526, dirigidasfinales20/20, tipos/lint/formato/grafo/export Web pasan.
Pendiente revisión visual real Web/Android; ver specs/009-horarios-profesionales/
ui-disponibilidad-clara.md para archivos y límites.

23nov — Horarios de administración: se retira solo el editor duplicado «Mis
intervalos semanales» del panel personal montado en la página schedules para admin.
Selector superior conserva edición del local/cualquier profesional. Mis bloqueos,
cierres y excepciones conservados. hideWeeklyEditor opcional en SelfSchedulePanel/
Content/Web; default mantiene intervalos en Mi espacio profesional Web/Android.
Título contextual «Mis bloqueos personales» y aviso explícito de cuenta propia.
Sin borrar horarios ni escribir Cloud. 13 pruebas dirigidas, tipos, lint dirigido,
formato y diffcheck pasan; revisión visual y Android físico pendientes.

23nov — Pendientes016 implementados: desplegable separado de Historial de invitaciones,
nombre/correo/fecha, cancelar y reenviar. Usuario eligió explícitamente aviso dentro
de BARBEXA, no email. Puerto/caso de uso/adaptador y UI Web/Android preparados;
mensaje específico de creado/reciente, sin duplicar ni cambiar invitación.
Migración20261123221939_pending_professional_invitations.sql aplicada SOLO en
vuoncrtkkkquvddunrxx, historial22→23, con autorización «si porfavor autorizo»:
correo de Auth solo para admin del local y pendientes profesionales; RPC nuevo
remind_professional_invitation inserta en bandeja existente con bloqueo de fila y
cooldown60s y authority_assert(team), sin ampliar capacidades de secundarios,
sin nuevo Edge. Ensayo PostgreSQL17 aislado sin red/puertos/montajes,13/13 pasan;
concurrencia2conexiones=1creado/1suprimido/1aviso. Contenedor propio eliminado.
Evidencia .artifacts/barbexa-pending-invitations-1795472849420/report.json.
Respaldo privado nuevo %LOCALAPPDATA%/Barbexa/backups/pending-invitations-1795472919072,
sin ensayo de restauración. Comparación27tablas completas, estructura/políticas y
funciones/ACL conservadas salvo cuerpo aprobado y nuevo RPC. Lectura real READ ONLY:
1histórica/0pendientes, metadatos/contexto/orden/reglaemail coinciden. NO reenvío
contra usuarios reales ni prueba de correo de pendiente real. Advisors comparados:
única advertencia nueva por SECURITY DEFINER authenticated del RPC intencional,
actor/teamguard/shop/status/ACL/search_path comprobados. Permiso016 agotado tras
activación; no repetir ni reutilizar para nuevas operaciones Cloud. Tipos/lint/grafo/export Web pasan,
pruebas dirigidas y cliente524/524 pasan; suite final y límites en specs/016-invitaciones-pendientes/
validacion.md. Sin avisos/envíos/cancelaciones reales, instalaciones, APK o gitwrites.
Recorrido visual Web/Android físico pendiente.

23nov — Historial de invitaciones profesionales015 implementado por solicitud del
usuario, de más reciente a más antigua por fecha de envío. Tarjetas en el desplegable
Web existente con nombre actual de cuenta, barbería, fechas de envío/aceptación,
estado de invitación y actividad actual del profesional separados. Helper compartido
con Android, contrato opcional y guardia de barbería en adaptador. Sin datos ficticios.
Migración20261123215834_professional_invitation_history.sql reemplaza solo
la proyección administrativa de private.booking_invitations; mantiene proyección
propia, actor, admin activo y ACL. Usuario autorizó «si la autorizo vamos» para015:
ensayo PostgreSQL17 desechable sin red/puertos/montajes,13/13 pgTAP pasan;
contenedor propio eliminado. Evidencia ignorada
.artifacts/barbexa-invitation-history-1795471540632/report.json. Respaldo lógico
nuevo privado en %LOCALAPPDATA%/Barbexa/backups/invitation-history-1795471665691,
esquema/datos/roles/historial y SHA256; restauración no ensayada. Aplicada SOLO en
vuoncrtkkkquvddunrxx, historial21→22. Comparación27tablas completas, columnas,
políticas y funciones/ACL conservadas salvo cuerpo de private.booking_invitations.
Sin despliegue Edge. Verificación READ ONLY con contexto de admin activo confirmado:
1invitación real, nombre/fechas/barbería/actividad/orden coinciden con base. No
escrituras de usuarios, invitaciones, reservas o fixtures. Permiso015 agotado con
esta activación; no repetirla ni reutilizarlo para nuevas operaciones Cloud.
Pruebas dirigidas6/6, cliente521/521, tipos/lint/formato/grafo y exportación Web
aprobados; consultar
specs/015-historial-invitaciones/validacion.md para resultados finales y archivos.
Pendientes recorrido visual Web con sesión real y Android físico; backend real
verificado, no afirmar que se hayan observado tarjetas nuevas en el navegador.

23nov — Detalle de barbería Web rediseñado por nueva referencia del usuario,
especificación014. ShopDetailWeb sustituye solo el detalle de Explorar barberías;
banner ilustrativo, servicios y profesionales reales habilitados, contacto saneado,
búsqueda de mapa por dirección y estados vacíos sin datos ficticios. Sidebar/rutas/
Auth conservados. Reservar por profesional usa chooseShop existente, valida la
selección y la conserva al elegir servicios compatibles. Catálogo y adaptador
aceptan horarios/cierres/descripción profesional opcionales; helpers calculan
apertura de Lima por minuto y al volver a la pestaña. Catálogo antiguo compatible:
horarios «Por confirmar» cuando faltan metadatos. El usuario autorizó «si lo
autorizo vamos»: migración20261123194353_commercial_shop_details.sql aplicada
SOLO en vuoncrtkkkquvddunrxx, historial20→21. Misma función de catálogo, sin
tablas/roles/RLS/datos nuevos ni despliegue Edge. Ensayo PostgreSQL17 aislado sin
red/puertos/montajes:12/12 pasan; contenedor propio eliminado. Evidencia ignorada
.artifacts/barbexa-commercial-1795464340509/report.json. Respaldo lógico nuevo
privado en %LOCALAPPDATA%/Barbexa/backups/commercial-shop-1795464410158,
esquema/datos/roles/historial y SHA256, sin ensayo de restauración. Comparación
antes/después de27tablas completas, estructura, políticas y funciones/ACL:
conservadas salvo cuerpo de private.booking_catalog. Catálogo real comprobado
en transacción READ ONLY:1barbería,14intervalos, horarios/cierres/descripciones
coinciden con tablas. Cuenta API readonly no tiene EXECUTE: se usó conexión
propietaria dentro de BEGIN READ ONLY, sin ampliar permisos. 518 pruebas cliente,
tipos, lint, grafos y export Web aprobados en implementación previa;
revisión Brave a1707/995/~503px y preselección ERWIN IP→Corte Fade observada,
sin confirmar una cita. Revisión visual posterior a migración interrumpida por
Computer Use: no pudo determinar URL con confianza para política; no más entradas.
Último estado aún mostraba catálogo viejo: no afirmar horarios visibles postreload.
Aceptación Android físico pendiente. Ver specs/014-detalle-barberia/validacion.md
para archivos, límites y evidencias. Permiso014 agotado al completar esta activación;
no repetir migración ni usarlo para nuevas operaciones Cloud.

23nov — Perfil profesional ampliado implementado y activado en Cloud con autorización
específica del usuario («si la autorizo»; continuó «continua donde te quedaste»).
Nueva especificación013; UI Web de dos columnas (tarjeta real + editor), descripción
máximo250 caracteres y redes opcionales, vista previa guardada y borrador conservado.
Controlador/formularioAndroid usa el mismo puerto. Extensión modular de operación
cliente/Edge con comandos cerrados y actor/contexto verificado; preserva008 y solo
el montaje de esta pestaña pasa shopName. No cambia agenda/horarios/resumen/reservas.
Migración20261123174640_professional_profile_details.sql aplicada SOLO en
vuoncrtkkkquvddunrxx, historial19→20; añade descripción/redes y joined_at nullable,
sin fechas históricas inventadas, dosRPC service_role y bloqueos existentes.
EnsayoSQL PostgreSQL17 desechable sin red/puertos/montajes:21/21 pasan; contenedor
propio eliminado, stackprincipal no alterado. Evidencia ignorada
.artifacts/barbexa-profile-1795461584088/report.json. Respaldo lógico nuevo privado
en %LOCALAPPDATA%/Barbexa/backups/professional-profile-1795461588540 con esquema,
datos,roles,historial y fuenteEdgeprevia. No ensayo de restauración de este respaldo.
27tablas comparadas con hash de columnas previas: datos/políticas conservados,
descripción/redes vacías/null y fechasjoined_at null al aplicar. Edgeúnica
barbershop-operation v3→v4 ACTIVE, verify_jwt=true, otras3funciones idénticas.
Paquete desde fuenteCloudprevia,3archivos modificados+2nuevosdelperfil;3módulos
solo de tipos restaurados para Deno check. Error transitorio del listadoposterior
recuperado con lectura de metadatos, SIN repetir despliegue. Scriptsprofile-*
registran fases/guardas. BrowserBrave secciónprofile con BRAYAM/BarberStyle carga
el perfilampliado: descripción/Instagram/TikTok/Facebook habilitados y avisolegacy
ausente. No se guardó contenidoinventado ni se modificó un perfil de negocio.
En revisión visual previa, A995px se apila;
a1707px dos columnas. 512cliente/74servidor,9dirigidas, tipos/lint/grafos/formato
dirigido y exportWeb pasan. Bundle ignorado .artifacts/professional-profile-web-build.
Pendiente guardar/recargar enCloud con contenido que el usuario quiera conservar,
además de móvil/teclado y Androidfísico. La autorización de esta activación se agotó
al completar migración/despliegue: no reinterpretarla como permiso de nuevas operaciones.
Consultar specs/013-perfil-profesional-ampliado/validacion.md para archivos/límites.
No se afirma que nuevos campos ya aparezcan en catálogo/pantallascliente externas.

23nov — Mis horarios Web rediseñado por referencia del usuario. SelfScheduleContent
deriva a SelfScheduleWeb solo en Web; mantiene el controlador SelfSchedulePanel,
casos de uso, adaptadores, versionado, pertenencia y formatos de persistencia.
Tarjeta marrón de consulta junto a horario general real (solo lectura); editor
semanal de dos columnas y bloqueos separados. Se reutiliza SelfScheduleWeeklyWeb,
AppButton, ShopSettingsIcon y ScheduleTimeSelect. Selector compartido añade opciones
opcionales sin alterar sus defaults administrativos. Opciones personales de15min,
límites exactos reales y valores actuales conservados (no válidos deshabilitados),
incluida unión de intervalos contiguos y fin24:00. PreparePersonalInterval reutiliza
scheduleHours/ownSchedule para validar solapamiento y cobertura del local antes
de añadir a lista temporal. Retirada de todos los horarios existentes requiere
confirmación explícita Web. Bloqueos usan datetime-local y traducen T↔espacio al
contrato previo AAAA-MM-DD HH:mm; inicio<fin, edición/retirada y preparar otro
conservados, errores/éxito reales y estado busy. Tipos de props separados para
evitar dependencia circular entre controlador y vista. Rutas y otras pestañas
no modificadas; presentación Android conserva formulario anterior.
506cliente,15dirigidas de presentación/contrato/tabs, tipos/lint/formato/grafo y
export Web aprobados. Build ignorado .artifacts/self-schedule-premium-web-build.
Brave escritorio1707px: consulta real de disponibilidad ejecutada; horarios del
local completos, profesional seleccionado sin intervalos ni bloqueos, tres
tarjetas y formulario observados. No guardar/retirar/editar datos Cloud. Round-trip
de guardar/recargar/retirar intervalos, bloquesUTC y conflicto usa gateway en
memoria, NO prueba persistencia real DB ni conflictos con citas reales.
Pendiente prueba de escrituras con horarios reales que el usuario quiera conservar,
validación móvil/teclado completo y adaptación visual Android. Alcance/archivos/
verificaciones en specs/009-horarios-profesionales/ui-mis-horarios-web.md.

23nov — Pestaña Mi agenda profesional Web implementada por nueva referencia del
usuario. ProfessionalAgenda sustituye únicamente el montaje de AgendaScreen
en section=agenda de ProfessionalWorkspace; rutas y otras tres pestañas intactas.
Panel principal con fecha DD/MM/AAAA, filtro combinado de reserva/atención,
anterior/siguiente día o semana, diario/semanal agrupado por día de Lima,
filas cronológicas y detalle de atención/pago; acciones existentes dentro de
Más acciones (incluye historial), solo cancela/reprograma si estado compatible.
CareControl amplía renderLayout con view/busy y onReadStart opcional para abrir
el detalle al usar su propio trigger; default compartido/Android conserva su UI.
Resumen lateral propio del día seleccionado, leyenda y accesos contextuales;
barbero consulta catálogo, administrador enlaza gestión de servicios.
Reader existente agrega includeOverview=false para omitir horarios/catálogo en
esta pestaña; filtros locales no reconsultan. Hook serializa lecturas, conserva
resultado durante refresco de la misma consulta con controles inert y oculta datos
inmediatamente al cambiar fecha/scope. Atención no verificada no se supone pendiente
ni completada, y no entra en esos filtros. Skeleton, vacío, error y reintento.
499 cliente,16 dirigidas, tipos/lint/formato/grafo y export Web pasan; salida
ignorada .artifacts/professional-agenda-web-build. Brave existente observado en
localhost:8081/staff?view=professional&section=agenda: perfil barbero en barbería
seleccionada, fecha23nov,0citas y cuatro contadores0, sin error; captura de ventana
aprox995px muestra composición estrecha legible. Entradas detectadas del usuario
impidieron automatizar botones; no se insistió ni se alteraron sus datos.
Pendientes: comparación visual amplia/móvil y flujos reales con citas no vacías,
filtros/semana/menú/confirmaciones. Pruebas dobles no acreditan esos E2E.
Ver specs/011-equipo-resumen-profesional/ui-agenda-profesional.md para alcance,
archivos y validación. Sin backend/Auth/sidebar/otras rutas/Cloudwrites/instalaciones.

23nov — Resumen de Mi espacio profesional Web por referencia premium del usuario:
ProfessionalDashboard y professional-dashboard-data componen los casos existentes
de resumen propio, agenda, perfil, horarios y catálogo público. Dos columnas
63/37 sin ancho máximo, marfil/marrón/dorado, responsive1150/780/420; indicadores
reales del día de Lima, fecha seleccionable, navegación semanal y vista diaria/
semanal. Agenda cronológica solo del profesional propio y barbería actual;
administrador filtra por su propio perfil, barber usa filtro permitido null.
Lecturas de días secuenciales y atención con concurrencia máxima4; respuesta
obsoleta descartada por scope/desmontaje. Cola local evita conflictos de lectura
de horarios al cambiar rápidamente de fecha. CareControl/CancellationControl/
RescheduleControl conservan acciones y restricciones al desplegar una cita.
Perfil, servicios asignados y disponibilidad semanal separados a derecha;
intervalos múltiples conservados, sin confundir horario semanal con bloqueos.
Servicios proceden únicamente del catálogo público accesible: si el local no
lo ofrece, indicar no disponible; sin habilitar lectura administrativa a barberos.
Acceso gestionar servicios solo para administrador; barbero enlaza catálogo.
Sin toggles ficticios ni precios editables. Las cuatro pestañas/rutas/herramientas
existentes siguen presentes, sin botón Cambiar barbería en el encabezado.
493 pruebas cliente y10 dirigidas pasan, tipos/lint/formato/arquitectura aprobados.
Computer Use se detuvo antes de obtener la página: URL no verificable en Windows;
NO acredita visual real, responsive en navegador ni ejecución Cloud de estas
consultas. Revisión visual pendiente. Sin cambios backend/Auth/sidebar/Android,
sin guardar perfiles/horarios, crear reservas, pagos ni escrituras Cloud.

22nov — Mi espacio profesional unificado en /staff?view=professional con section
summary/agenda/schedules/profile. Nuevo ProfessionalWorkspace Web reutiliza
OwnSummaryPanel, AgendaScreen(administrator=false), SelfSchedulePanel y
SelfProfessional. Encabezado/contexto y cuatro pestañas siempre presentes; solo
contenido cambia. Cambiar barbería usa /context. Section inválida cae a summary.
OperationRoute conserva guardas; key por actor/generación/membresía/rol y panel
por section evita estado obsoleto entre contextos. No controles de administración
en esta agenda. Rutas existentes /agenda y /schedules conservadas, sin cambios
de backend/contratos ni sidebar/Android. Estados de disponibilidad explícitos
si un módulo no está habilitado. Responsive780/420; sin librerías nuevas.
484cliente, tipos/lint y arquitectura pasan; pruebas propias verifican una sola
pestaña/panel activo, contexto y agenda no administrativa. Revisión visual real
pendiente del usuario. Sin escrituras Cloud ni pruebas de guardar horarios/perfil.

22nov — Mis reservas, ajuste de separación por captura: feedback separado28px
del layout; Próxima cita e Historial como secciones con gap18px interno/30px entre
secciones. Vacío del historial dentro de su contenedor, sin salto por grid vacío.
Paneles con margen de18px tras encabezado y16px antes del estado vacío. Encabezado
reserva84px a derecha en escritorio para evitar choque con avatar; menú intacto.
Botones superiores con fuente13px explícita, texto/icono flex.32 pruebas de reserva/
elegibilidad, TypeScript y lint aprobados. Revisión visual del ajuste pendiente.

22nov — Mis reservas ocupa ancho disponible: eliminado max-width1380px/margen
centrado del contenido y contentStyle marfil explícito solo en Stack.Screen
my-reservations Web, para cubrir también el fondo de la escena de navegación.
Sidebar/avatar no cambian.45 pruebas dirigidas, tipos y lint pasan. Sin Cloudwrites.
Revisión visual de franjas laterales pendiente del usuario.

22nov — Ajuste Mis reservas por nueva captura: tarjeta próxima compacta con
fecha/servicios izquierda y duración/precio derecha, fila de acciones consultar,
reprogramar/cancelar; formularios expandidos conservados y responsive una columna.
CareControl añade renderLayout opcional (default conserva otras pantallas).
Estado Atención/Pago, eventos/errores y acciones financieras existentes se montan
mediante portal en Detalle de la cita seleccionada, no bajo la tarjeta próxima.
Sin duplicar estado ni consultas/mutaciones. Historial de reprogramación conserva
acceso.482cliente y38dirigidas, tipos/lint pasan. Verificación visual real del
ajuste pendiente; no se crearon/cancelaron/reprogramaron reservas ni se pagó.

22nov — Rediseño /my-reservations Web por captura: my-reservations.web.tsx/styles,
proyección own-reservations-view.ts. Próxima futura confirmada, historial compacto
seleccionable, resumen, detalle/copia código y ayuda; responsive1050/780/520.
Estados de atención separados de reservation.state; consultas care read existentes
verificadas con careView, concurrencia máxima4, respuesta tardía ignorada y sin
mutaciones. Atendidas/Próximas muestran Por consultar si no se conoce atención.
Resumen sobre máximo50 registros disponibles, sin inventar completados. Formularios
CancellationControl/RescheduleControl/CareControl reutilizados con restricciones.
CareControl agrega initialView opcional (defaultnull conserva otras pantallas),
solo recibe estado parseado del mismo actor/reserva; busy/locked impiden acciones.
Legacy/sin registro sigue diferenciándose de verificación desconocida.
481 pruebas cliente y38 dirigidas pasan; tipos/lint/formato/arquitectura correctos.
Fixture de elegibilidad ahora inyecta hooks solo en CareControl, sin depender del
orden de hooks del layout. Lectura AX de Brave localhost muestra próxima23nov14:30,
historialcancelada16:00 y resumen1/0/1. Captura devolvió otra ventana; no acredita
comparación visual ni tablet/móvil/zoom100. Sin crear/cancelar/reprogramar/pagar,
sin Cloudwrites ni cambios SQL/Edge/Auth/env/sidebar/avatar/Android. Revisión
visual del usuario pendiente; no avanzar a otra pantalla sin aprobación.

22nov — Mis reservas Web: proyección ordena copia del listado con confirmed
primero, cada grupo por startsAt ascendente (instante UTC, no fecha de creación),
y UUID para empates estables. No muta snapshot ni cambia estados/consultas;
Android conserva orden previo. Se limita al listado devuelto (máximo50 actual).
22 pruebas de presentación, TypeScript y lint pasan; sin escrituras Cloud.

22nov — Usuario solicita retirar aclaración «Se abrirá el equipo...»; texto
eliminado de tarjeta y regresión actualizada. Esto NO acredita navegación al
origen: Ver equipo todavía utiliza contexto seleccionado; RPC no entrega UUID
barbería. Resolver ese vínculo multibarbería es pendiente funcional, sin inferir
por nombres. No cambios Cloud ni reglas de acceso en esta corrección textual.

22nov — Invitación aceptada: frontend sustituye destino heredado /agenda por
/staff?view=team y etiqueta Ver equipo solo para título exacto+target esperado.
Reserva/atención mantienen agenda; invitación recibida mantiene /staff. Servidor
envía aceptación al emisor. Limitación explícita junto al botón: abre barbería
seleccionada, no se puede resolver origen automáticamente porque RPC no expone
barbershopId. No inferir UUID por nombre ni cambiar contexto automáticamente.
Guardas existentes de equipo intactas.8 pruebas dirigidas, tipos y lint pasan.
Sin cambios Cloud/SQL/Edge ni datos. Verificación real de navegación pendiente.

22nov — Lectura al desplegar aviso: eliminado botón Marcar como leída. Toggle
open de details solicita RPC de lectura existente solo si readAt es null; cerrar
o reabrir uno leído no escribe. Crema/dorado sin leer; clase read marfil grisáceo
solo tras respuesta/listado confirmado. Fallos conservan estado real/error, sin
reintentos automáticos. Cola en Inbox serializa lecturas tras refresco/otras
lecturas y agrupa duplicados, valida scope al ejecutar. Historial y mecanismo
unseen del numerito no cambian.10 pruebas dirigidas y478cliente, tipos/lint/
arquitectura aprobados. Sin cambios SQL/Cloud/Edge ni escrituras reales de prueba.
Comprobación visual y persistencia real desde navegador pendientes.

22nov — Perfil inicial Google: adaptador toma full_name/name únicamente de
identities(provider=google) del getUser verificado, expone suggestedDisplayName
opcional como dato de presentación, nunca permisos. verifiedIdentity conserva
sugerencia válida. Bootstrap consulta perfil existente primero; si falta y hay
nombre, utiliza ensureOwnProfile existente con phone=null, sin sobrescribir perfil.
Sin nombre mantiene profile-required. Fallo de creación mantiene error/reintento
y nombre para retryProfile; ready Web continúa a /account como antes. No cambios
en SQL/RLS/Edge/OAuth/configuración ni escrituras reales Cloud en esta ejecución.
Regresiones de nombre/ausencia/proveedor/email no confirmado/perfil existente/
fallo-reintento; unitarias y478cliente pasan, tipos/lint/arquitectura correctos.
Autenticación real Google y creación real del perfil con este cambio pendientes.

22nov — Inicio, tarjeta Avisos del sistema: composición inyecta InboxPreview
desde el mismo useInbox/refresh existente. Muestra últimos3 avisos reales con
título/mensaje/fecha Lima y enlace al centro, sin marcar lectura ni acknowledge.
Estados carga/vacío/error diferenciados, conserva contenido ante error, textos
escapados. Retirados mensajes obsoletos de centro no disponible. Sin cambios en
otras tarjetas/sidebar ni escrituras Cloud.12 pruebas dirigidas, tipos y lint
aprobados. Revisión visual en navegador pendiente.

22nov — Compactación visual /booking solicitada: sin leyenda BARBERÍA PREMIUM;
título32px máximo/subtítulo14px, encabezados de pasos19px, menos padding en las
tres tarjetas, identidad/servicios/selección profesional algo menores. Calendario,
horarios y resumen conservan dimensiones. CSS local :has(.bx-book) reduce solo
en escritorio el padding-top76px de bx-main a12px, ocupando hueco superior con
marca y tijeras sin editar shell/menú/sidebar.23 pruebas de reserva/calendario,
TypeScript, lint y formato pasan. Revisión visual del ajuste pendiente.

22nov — Refinamiento /booking: horarios reales ordenados por inicio y agrupados
en Mañana (<12:00) y Tarde (>=12:00, incluye noche), siempre hora de Lima.
Se omiten grupos vacíos. Solo un botón Consultar horarios junto a los grupos;
retirado duplicado del resumen. Autoconsulta al elegir fecha y confirmación/pago
se conservan. Regresiones de corte12:00/UTC, orden y botón único añadidas.
Sin escrituras Cloud ni cambios en contratos o disponibilidad.

22nov — Corrección de descubribilidad de horarios Web: el rediseño dejaba
querySlots solo en resumen, por lo que elegir fecha no consultaba disponibilidad.
Ahora fecha llama setDate y después querySlots con servicio y oferta publicada;
botón Consultar horarios también junto a la cuadrícula, con carga local y mensajes
según requisito faltante. Sin consultas automáticas en render, sin confirmaciones
ni escrituras Cloud.26 pruebas dirigidas (presentación/calendario/aplicación),
tipos y lint pasan. Comprobación HTTP/navegador posterior pendiente.

22/11/2026 — /booking Web rediseñada según captura del usuario. BookingContent
delega presentación Web a booking-content.web.tsx/styles; Android conserva vista.
Tres pasos (barbería, servicios múltiples, profesional/fecha/horarios) y resumen
dinámico/ayuda. Calendario sin dependencias usa fecha Lima, horizonte inclusivo
del contrato SQL y deshabilita días anteriores/futuros fuera de política; servidor
conserva autoridad sobre antelación/horarios. Celdas pasan ISO a setDate existente.
PaymentChoice, BookingCard, StatusMessage y AppButton reutilizados. Sin cambios
de aplicación/dominio/HTTP, Auth, Cloud, sidebar ni avatar. Confirmación mantiene
pago obligatorio cuando careEnabled, bloqueo y replay incierto. Botón del resumen
consulta horarios antes de selección; después muestra pago y confirmación real.
472 pruebas cliente, tipos, lint dirigido, formato y arquitectura pasan. Pruebas
de calendario, multiselección/totales/handlers, cash/Yape/timeout con dobles.
Navegador Brave localhost:8081/booking recargado: vista nueva, datos reales y
calendario observados en escritorio. Sin confirmar ni crear reservas, sin escrituras
Cloud. Responsive CSS850/600; comprobación visual tablet/móvil y zoom100 pendiente.
Solo continuar esta pantalla tras aprobación visual; no avanzar a otros módulos.

22/11/2026 — Carga de sesión Web: tarjeta centrada «Preparando tu espacio» en
session-loading.web.tsx, aro dorado, responsive y prefers-reduced-motion.
SessionFeedback la usa a pantalla completa solo en resolving Web. No cambios
en Auth, tiempos de verificación, errores/reintento, guardas ni vista Android.
12 regresiones de sesión/navegación y TypeScript aprobados. Visual navegador pendiente.

22/11/2026 — Confirmación Web: por solicitud del usuario, ConfirmationContent
redirige a /account solo con perfil ready y sin error, omitiendo la pantalla
intermedia de éxito. Se conservan /confirm-email y /auth/callback, limpieza del
retorno, verificación, perfil incompleto, recuperación y errores. Android no cambia.
15 regresiones dirigidas, TypeScript, lint dirigido y arquitectura aprobados.
Sin escrituras Cloud ni cambios de Auth. Recorrido real en navegador pendiente.

### 012 — Notificaciones Web activadas en Cloud; contador automático

22nov — Badge ahora representa avisos nuevos desde la última visita, separado
de unread/readAt del servidor. InboxScreen reconoce la lista solo en ready y
pestaña visible; listener visibilitychange con limpieza. Inbox.acknowledge()
guarda cursor de fecha+IDs (incluye empates), sin RPC de escritura. SessionStorage
por cuenta conserva el cursor al recargar esta pestaña; fallback en memoria si
almacenamiento bloqueado. Sin contenido de mensajes ni credenciales almacenados.
Layout Web usa unseen; filtro «Sin leer» y lectura individual permanecen reales.
Antes de la primera visita usa contador global; después cuenta los nuevos entre
los últimos50 avisos disponibles por contrato, no historial paginado completo.
11 pruebas dirigidas y 469 cliente aprobadas; tipos, lint y arquitectura pasan.
Sin cambios Cloud/Auth/SQL/Edge. Revisión real en navegador pendiente.

Rediseño22nov por referencia del usuario: InboxScreen/InboxContent y CSS local
reproducen encabezado con tijeras, contador, filtros Todas/Sin leer/Reservas/
Invitaciones, tarjetas leídas/sin leer y panel con posteSVG. Responsive a850/600px.
Filtros solo sobre últimos50avisos existentes; categoría inferida de títulos
soportados/destinos porque no hay campo tipo. Respuestas de invitación con destino
/agenda se clasifican como invitaciones por título. Sin nombres/servicios/horarios
inventados; mensaje real conservado. No se anuncian recordatorios programados
inexistentes. Leer solo aparece sinleer; navegación mantiene destinos originales.
No cambios de store/refresco, sidebar/avatar (SHA256intactos), otras pantallas,
Cloud ni contratos.8pruebas dirigidas ycliente467/467,tipos,lint dirigido,
formato y arquitectura aprobados. Revisión visual desktop/móvil pendiente.

Refinamiento posterior solicitado22nov: tarjetas como details/summary nativos,
flecha abrir/cerrar, panel interior y poste decorativoSVG. Solo se extrae del
mensaje el formato exacto de fecha/hora/barbería emitido por SQL; fallback conserva
el texto íntegro. No datos de servicio/duración/dirección en contrato actual;
no inventarlos. Acciones mantienen destinos y lectura explícita; abrir no escribe
ni marca automáticamente. Sin Descartar por falta de contrato. Responsive600px,
teclado nativo yfocusvisible.8regresiones/467cliente,tipos,lint/arquitectura pasan.
No modificaciones Cloud/sidebar/avatar/store. Verificación visual real pendiente.

22/11/2026. Autorización específica del usuario: migración única Cloud proyecto
vuoncrtkkkquvddunrxx aplicada por CLI3.1.0 migration up. Archivo oficial
20261122184214_web_notifications.sql; historial19,4triggers,RLS y2RPC correctos,
anon sinEXECUTE yauthenticated sin acceso directo a tabla.26tablas protegidas
con huellas intactas. Respaldo privado actualizado con manifiestoSHA256 en
C:/Users/PREDATOR/AppData/Local/Barbexa/backups/notifications-1795372784385.
Incluye schema/data/roles/history; no configuración Auth/OAuth, secretos ni
binarios Storage. verified.json acredita activación; no cambios Auth/Edge/datos
de negocio ni backfill. La comprobación CUA terminó por bloqueo de URL; luego el
usuario confirmó recepción real de un aviso, inicialmente al actualizar manual.

Corrección posterior solicitada: badge rojo/blanco accesible, oculto a0,99+;
refresco automático global5s visible, foco yvisibilitychange, ya no se detiene
por faseunavailable previa. Tests5dirigidos pasan; cliente466/466,tipos,lint dirigido,
arquitectura y formato aprobados. Sin nuevas escrituras Cloud. Polling, no Realtime;
no garantía instantánea ni popup. Revisión visual del círculo por usuario pendiente.

Corrección22nov posterior: al volver a la pestaña, refresh() conserva la proyección
ready sin publicar loading/busy ni cambiar el snapshot si el servidor devuelve lo
mismo. Fallo transitorio del refresco conserva la vista; carga inicial y acciones
manuales mantienen feedback. La suscripción de sesión llama invalidateScope(),
que solo limpia si cambió identidad/generación/contexto, no en cada emisión.
Logout/dispose y respuestas tardías mantienen protección.7regresiones dirigidas,
cliente466/466,tipos,lint dirigido,formato yarquitectura aprobados. Sin Cloudwrites.
Validación visual real del retorno de pestaña no ejecutada en esta corrección.

22/11/2026. Usuario solicita avisos por cuenta. Existía solo placeholder.
Preparado módulo notifications con puerto/almacén, adaptador RPC con JWT actual,
historial de últimos50, contador global y lectura explícita. Refresco5s con
pestaña visible, foco y botón. No realtime, correo/push ni popup de recepción.
Composición reutiliza Auth, limpia por contexto/sesión e ignora respuestas tardías.
Ante404/PGRST202 muestra falta de activación, no un vacío ficticio.

SQL aditivo en specs/012-notificaciones-web/contracts/notifications.sql, fuera de
migrations: tabla privada/RLS,2RPC,4triggers sobre auditorías e invitaciones,
unicidad destinatario/origen y acceso de personal según membresía vigente.
No backfill ni escrituras Cloud/LOCAL. Ensayo autorizado22nov en PostgreSQL17.11
sin red/puertos:18migraciones+SQL nuevo compilados;26avisos sintéticos, permisos,
lectura idempotente, revocación, rollback y8sesiones concurrentes aprobados.
Auth mínimo con claims SQL, no GoTrue/JWT. Primer fixture corrigió timestamp;
SQL preparado intacto. Dos contenedores propios eliminados; informes conservados.
Evidencia012-notificaciones/ensayo-sql.md. Ampliación1795372575711 aprobada: RPC
reales de invitación/aceptación/confirmación/replay/reprogramación/pago/cancelación/
reembolso, falloYape revierte reserva+avisos y2barberías aisladas; UUID real ajeno
no puede marcarse. RPC negocio como postgres aislado; bandeja con SET ROLE yclaims,
no JWTGoTrue ni HTTP. Inicio/final/no-show siguen cubiertos por trigger sintético.
Contenedor propio eliminado. Activación Cloud acreditada arriba; recepción real
confirmada por usuario. No declarar cierre integral de todos los eventos Web;
lectura persistida y aislamiento de dos sesiones Web siguen pendientes.

Tipos/arquitectura/lint dirigido y3pruebas nuevas con dobles pasan. Suite cliente
465/465 tras ajustar solo resolución de archivos en cargadores booking,
management-eligibility y ui-refresh: existencia frente a path.extname para
sufijos.web/.styles; aserciones conservadas.

### Agenda Web — organización visual

22/11/2026. Solicitud del usuario: AgendaWeb muestra primero fecha con selector
nativo, filtros desplegables de estado/profesional y tarjetas de citas existentes.
Atención/pago quedan como desplegables dentro de «Más filtros»; CareAgendaFilter
conserva apply/consultas originales. CareSettings y ReschedulePolicyControl pasan
a «Configuración de la barbería», plegado al final, sin eliminar funcionalidades.
BookingCard/CareControl mantienen sus acciones y permisos; no cambios de backend,
datos, sidebar ni rutas. Android conserva presentación previa. 12 pruebas dirigidas,
tipos, lint dirigido y arquitectura aprobados. Vista real Brave /agenda observada
con fecha22nov y estado vacío; no se ejecutaron pagos, reservas ni atenciones.
CSS responsive preparado; revisión visual móvil y cita con acciones reales pendiente.

### Horarios personales Web — selectores semanales

22/11/2026. Por solicitud visual del usuario, solo «Mis intervalos semanales»
usa ahora SelfScheduleWeeklyWeb: días por nombre, selectores Desde/Hasta cada
15 minutos (conservan minutos exactos existentes y fin 24:00), lista por día,
retirada del borrador y explicación de añadir frente a guardar. CSS local con
tokens Barbexa y adaptación a una columna en móvil. Controlador, validaciones,
versionado y handlers originales conservados; bloqueos y Android sin rediseño.
11 pruebas dirigidas aprobadas, tipos, lint dirigido y arquitectura correctos.
Vista real observada en Brave /schedules; navegador del usuario estaba al 50 %,
no se cambió su zoom. No se guardaron horarios ni se modificaron datos Cloud.
Revisión visual móvil real pendiente; responsive preparado mediante CSS.

## Cloud — Fase D: Metro Web con cloud-integration

21/11/2026,23:25Lima. Metro8081 cambia de local-team-authority a cloud-integration
solo en el proceso, reutilizando credencial pública existente. Backend efectivo
https://vuoncrtkkkquvddunrxx.supabase.co, regiónsa-east-1. Verificado en módulo real
expo/virtual/env del navegador: perfil/URL/clave pública coincidente, sin URL LOCAL.
.env.local, scripts/perfiles LOCAL y Cloud anteriores, app.config.js/app.json,
package.json/config.toml intactos por SHA-256. No modificar ni eliminar esos respaldos.

Solo Metro/supervisor anteriores detenidos; una instancia Cloud nueva con recarga,
supervisor27228/Metro33768,8081/status200. Se deja activa. Runtime/diagnósticos nuevos
ignorados en .artifacts/cloud-phase-d. No repetir inicio a ciegas; comprobar PID/puerto.
Un npm start genérico no hereda este cambio de proceso ni selecciona Cloud por sí solo.

Chrome nuevo sin sesión: Inicio/login/registro/recuperación/F5 correctos, /account
vuelve a Inicio público sin contenido privado. Verificador ajustado al retorno público
real y al módulo virtual de Expo58; ninguna guarda o implementación cambiada.
Sonda GETAuth/settings Cloud200 y OPTIONS observados,0solicitudes54421/0escrituras.
No fue una consulta autenticada de servicios.87regresiones y tipos/arquitectura aprobados.

Google habilitado, signup permitido con confirmación; callbacks/reset-password8081
permitidos. SiteURL3000 conservado porque cliente envía retornos explícitos8081.
No login/OAuth real, correos ni cuentas nuevas. Cloud18migraciones,2usuarios/2perfiles;
0barberías/membresías/servicios/profesionales/reservas. Vacíos probados con dobles;
catálogo autenticado pendiente de ingreso del usuario con su cuenta Cloud existente.
Autoridad administrativa sigue desactivada. No datos LOCAL→Cloud, Android, backend,
interfaces, estilos, secretos, despliegues ni Git writes. Detenerse tras informe.
Evidencia: docs/evaluacion/evidencias/004-reservas/cloud-phase-d.md y .json.

## Cloud — Fase C: antecedente de actualización del servidor

21/11/2026, 22:56 Lima. Autorización de Fase C y continuación: CLI3.1.0 enlazado
exclusivamente a vuoncrtkkkquvddunrxx, sa-east-1. Migraciones17/18 aplicadas una vez
cada una mediante migration up oficial, con directorios privados separados y
verificación intermedia. Historial final18;24tablas/98funciones/16RLS/8triggers.
SQL originales y respaldo A intactos. Huellas de58tablas previas conservadas salvo
historial autorizado. Cloud2usuarios/3identidades/2perfiles;0barberías/membresías,
reservas, detalles, atenciones y eventos de autoridad. No copiar datos LOCAL.

Solo barbershop-operation desplegada: v2→v3 ACTIVE, verify_jwt=true. Otras tres v2.
30archivos runtime descargados coinciden con fuentes probadas.72pruebas servidor,
71regresiones y tipos servidor/Edge aprobados. HTTP real:401sin credenciales/JWT
inválido;204CORS permitido;403origen prohibido;RPCanónima401/42501;Authhealth200.
BARBERIA_ENABLE_TEAM_AUTHORITY espera exactamente true y sigue AUSENTE/desactivada;
no impide migrar ni desplegar. Invitaciones administrativas también sin activar.
Pruebas positivas de roles Cloud diferidas hasta actores reales; no se crearon
fixtures ni sesiones. No declarar B1–B5 aceptado en Cloud por estas comprobaciones.

Se corrigieron solo verificaciones transitorias: DO rechazado por CLI read-only,
RPC service-only denegada al lector, undefined omitido en JSON y fechas reservadas
SUPABASE_* sin valor probatorio de cambios personalizados. Sin reparaciones SQL,
permisos, secretos, Auth, OAuth, identidades, producto o nuevos intentos sensibles.
Frontend y .env.local conservados; no operar LOCAL ni continuar automáticamente.
Evidencia: docs/evaluacion/evidencias/004-reservas/cloud-phase-c.md y .json.

## Cloud — Fase A: antecedente de respaldo y recuperación

21/11/2026. Solo Fase A autorizada y ejecutada. CLI3.1.0, respaldos privados fuera
del repositorio y copias Edge anteriores, sin sobrescribir originales. Ensayo en
contenedor PostgreSQL17.11 independiente sin red/puertos/volúmenes LOCAL; eliminado
al terminar.58tablas con huellas coincidentes,80funciones,16RLS,4triggers,16migraciones;
datos Auth/identidades incluidos, sin ejecutar Auth/OAuth. ACL efectivas y membresías
de roles comprobadas. Vault0.3.2 no disponible en la imagen; Cloud Vault0secretos.
Sin recuperación de credenciales/configuración externa/objetos físicos Storage;
recuperación integral de plataforma no acreditada. LOCAL42reservas/45detalles intactos.
Al finalizar A, Cloud tenía16migraciones y17/18 no estaban aplicadas. Después se
autorizó y aprobó B en una base desechable; estado actual en Fase C arriba.
Evidencia: docs/evaluacion/evidencias/004-reservas/cloud-phase-a.md; procedimiento,
manifiestos y dumps exclusivamente en el directorio privado indicado allí.

## B5 — cierre funcional acreditado en Web LOCAL

21/11/2026, 18:06 Lima. B5.2 cerrado y B5.3 se mantiene cerrado funcionalmente Web LOCAL.
B1–B5 terminados en este alcance; se reutilizan sus evidencias anteriores sin repetirlos.
Los 22 comandos de B5.2/B5.3 quedan ejecutados y acreditados íntegramente. La evidencia
pendiente B2 de retirada de oferta queda cerrada (no confundir con repetir el Bloque B2).

Barbería B5 Cierre Web LOCAL validado, UUID f3c7f90f-cb85-4a88-86ce-ec27ec3ba8a6, propietario U3.
Se conservó la retirada anterior HTTP 200, published/v17 → withdrawn/v18, sin repetirla.
Esta continuación ejecutó UNA republicación desde Chrome con sesión GoTrue LOCAL auténtica
de U3: HTTP 200, requestId 9702e255-90f2-4598-a228-ac5c073fbb9c, PostgreSQL published/v19.
Mismo UUID y propietario. Dos transiciones adicionales autorizadas completadas en total.

Solo se corrigió el verificador: el SQL vigente deniega catálogo/slots con P0002/NOT_AVAILABLE,
que PostgREST transporta como HTTP 500. Se exige exactamente esa respuesta, RPC de lectura,
tenant correcto y estado withdrawn; otros 500/códigos/mensajes/payloads se rechazan.
Cuatro regresiones dirigidas aprobadas; sin cambios de producto, SQL, RLS ni Edge.

Chrome cliente en contextos nuevos, sin caché HTTP: retirada ausente en Explorar y Reservar;
catálogo/slots denegados con 500/P0002/NOT_AVAILABLE. Tras republicar reaparece, catálogo y
slots HTTP 200; selección de servicio/profesional y consulta Web de horarios disponibles.
No se eligió ni confirmó una reserva. No se repitió N2 ni ninguna operación anterior.

Lectura independiente final: 42 reservas y 45 detalles, todas sus huellas intactas;
29 atenciones, 71 eventos de atención, 55 eventos de reserva, 14 usuarios, 13 perfiles,
15 membresías y 9 barberías. Pagos, servicios/precios, horarios, cierres, propietarios,
membresías y otras barberías intactos. Cero INSERT/DELETE de negocio. Solo cambió la fila
de settings del tenant objetivo: estado restaurado published y versión 17 → 18 → 19.
Esquema/historial de 18 migraciones/.env.local intactos. Tres sesiones propias cerradas
HTTP 204; cero sesiones nuevas restantes. Sin Cloud, Android, correos, dinero real,
reinicios, instalaciones, migraciones, commit, push ni despliegue.

Trazabilidad de publicación: actor, requestId HTTP y snapshots PostgreSQL/versiones;
el contrato vigente no añade eventos dedicados de publicación. No afirmar dos eventos
SQL nuevos ni crear auditoría paralela. Auditorías existentes, incluida N2, conservadas.

Matriz de 48: **40 VERIFICADA, 0 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL, 4 NO APLICA,
3 BLOQUEADA y 1 PARCIAL**. El cierre funcional Web LOCAL no cierra automáticamente las
tareas académicas conjuntas, Android, aprobación visual pendiente, SMTP administrativo
unknown, transferencia de propiedad, entrega pública/HTTPS/Cloud ni medición inicial/F5.
Evidencia vigente: docs/evaluacion/evidencias/004-reservas/b5-cierre-web-local.md y .json.
El informe b5-retiro-republicacion conserva el intento detenido como antecedente histórico.
Detenerse después del informe; no iniciar otras etapas.

**Antecedente previo a activación: implementación y ensayo aislado de B5.2.**
Contrato aprobado: anulación lógica, motivo obligatorio, un evento append-only en
team_authority_events y replay200 sin nuevas escrituras, incluso bajo concurrencia.
Owner/secundario con editHours; sin poderes nuevos para cliente/profesional. Original
conservado; no altera reservas y mantiene las demás restricciones de disponibilidad.

Casos/puertos, adaptadores cliente/servidor, Edge y panel Web /schedules conectados,
con listado paginado, historial, confirmación y reconciliación por lectura ante fallo.
Migración nueva 20261121040559_administrative_closure_withdrawal.sql: NO aplicada a
LOCAL principal ni Cloud. El panel necesita esa activación antes del recorrido real;
una RPC ausente se muestra como error recuperable, nunca como éxito/listado vacío.
Renombrado Web previo conservado, no reimplementado. Sin cambios Auth ni UI Android.

SQL real PostgreSQL17.11 en base desechable separada (OID distinto, cero datos Auth
copiados, fixtures sintéticos):16 grupos aprobados, incluidos permisos/ACL,404, motivo,
historial, idempotencia, disponibilidad, paginación y dos conexiones concurrentes con
espera de bloqueo observada: una transición/un evento. Base desechable eliminada.
Edge Request/Response + SQL real:401/403/403/404/200/200, Auth y transporte PostgREST
con dobles; NO Edge desplegada/GoTrue/Chrome. Cliente y servidor automatizados aprobados;
comandos/resultados exactos e inventario en004/b52-retirada-cierres.json y .md.

LOCAL principal conserva41 reservas/44detalles/28care/67care_events/54reservation_events,
usuarios/perfiles/membresías/configuración, huellas de negocio, catálogo e historial17 y
env intactos. Cero comandos del ensayo22 ejecutados; sin crear «B5 Cierre Web LOCAL»,
cuentas, sesiones, correos o reservas en la principal. Sin Cloud/servicios/Git writes.

Los22 comandos están preparados a nivel de código/contrato, NO habilitados ni ejecutados
en principal: primero autorización/activación de la migración y comprobación Edge LOCAL,
después permiso específico de negocio y Chrome. Retirada futura=withdraw-shop-closure,
conservar cierre withdrawn +un evento team_authority, no borrar fila ni añadir care_event.
Conteos finales previstos42reservas/45detalles permanecen condicionales al ensayo futuro.
Matriz48:34VERIFICADA/6SIN VALIDACIÓN INTEGRAL/4NO APLICA/3BLOQUEADA/1PARCIAL;
ninguna nueva aceptación Web de escritura. B5/004 y gates conjuntos siguen abiertos.
SMTP administrativo/transferencia/Android/aceptación visual separados. Detenerse al informe.

**B5.2/B5.3 preparados, sin escrituras de negocio (20/11/2026, Lima).** Ver nueva sección del plan y004/b52-b53-preparacion.json. PostgreSQL LOCAL read-only y Chrome/U3 inspeccionaron creación, configuración, servicios, horarios y CareSettings;41/44/28care/67careEvents/54reservationEvents intactos, mismas huellasB5.1, esquema/env sin cambios. Una sesión de lectura cerrada204,0nuevasrestantes;0servicios operados.

Dos brechas demostradas: renombrado002 tiene caso/PATCH/RLS pero falta control/composición Web; /schedules crea cierres administrativos pero no los lista/retira y no hay RPC administrativa de retirada (remove_own_booking_block009 no sustituye esa operación). No corregir todavía producto/SQL. Yape configura en /agenda, no /barbershop-admin: ruta documental corregida.

Propuesta pendiente de permiso:1tenant nuevo B5 Cierre Web LOCAL, U3owner+perfil profesional nuevo explícito,1servicio25/15→30/30+capacidad,7horarios local07–24 y7profesional08–23:45; clienteaecfc300 existente.22comandos:20actuales+renameWeb a integrar+retiradaadmin a implementar. Incluye setup/publicación/edición/restauración/2configureYape0050/1confirm cash/1no-show nuevos;no repetir B1–B4/Yape. Solo Yape0050 toca temporalmente dato previo y restaura exacto, tolerancia10 intacta. No usar ninguna de41citas, incluidaB5.1. Finalcondicional42/45/29care/71careEvents/55reservationEvents,9shops/15membresías/9owners; conservar originales/historia.

No-show exige espera real de inicio+tolerancia snapshot, deja confirmed/no-show/pending/cash y no libera rango anticipadamente. Cierres requieren primero aprobar contrato/migración LOCAL aditiva+Edge/Web;rename solo integración Web. Sin esas correcciones no prometer cierre de6ramas solo con pruebas. Matriz34verificadas/4sinvalidación/4noaplica/3bloqueadas/3parciales, sin nuevas acreditaciones, SMTP administrativo y transferencia separados pendientes. Solo documentación/verificadores de lectura cambiados;sin Cloud/Android/Git/despliegue. Detenerse al informe.

**B5.1 acreditado funcionalmente en Web (20/11/2026, Lima).** Se ejecutaron exactamente dos comandos desde Chrome con sesiones auténticas de GoTrue LOCAL: confirmación de reserva Yape HTTP 201 por el cliente y recepción ficticia HTTP 200 por el profesional asignado. Cita 11ccc730-9194-4f8e-9007-1b2bd419718e, en «005 aislada 0», el 21/11/2026 de 11:00 a 11:15 Lima; servicio S/25 y 15 minutos.

Estado final: reserva confirmed, atención confirmed (sin iniciar), pago paid, método yape, importe 2500 céntimos PEN. Mis reservas mostró Pendiente y después Recibido; el cliente no obtuvo permiso de recepción. Agenda mostró el mismo importe y la confirmación explícita del profesional; después desapareció el control de segunda recepción. Auditoría: un evento confirmed, uno created y un único receive del trabajador, con capacidad barber, método yape e importe 2500. Efectos: seis INSERT, un UPDATE del ledger nuevo y cero DELETE.

Verificación final: 41 reservas, 44 detalles, 28 registros care, 67 eventos care y 54 eventos de reserva; 14 usuarios, 13 perfiles, 14 membresías y ocho invitaciones. Las 40 reservas y 43 detalles anteriores, pagos, atenciones, B2, A/B de B3, propietarios, membresías, profesionales, servicios, horarios, ajustes v17, otros tenants, esquema, migraciones y .env.local permanecen intactos por huellas. Las dos sesiones propias cerraron con HTTP 204; cero sesiones nuevas restantes, Auth HTTP 200 y PostgreSQL saludable. No hubo cuentas, correos, dinero real, cambios de configuración ni comandos de atención.

El usuario abrió Docker y autorizó operar servicios; Codex inició únicamente el Edge Runtime LOCAL existente y una instancia Metro LOCAL en 8081. No se iniciaron respaldos ni se operaron otros contenedores. La huella completa de auth.users ya difería del histórico antes del ensayo, sin causa atribuida; sus credenciales y campos estables actuales se conservaron durante las sesiones autorizadas. Se corrigió solo la entrada del verificador para evitar activar el guard de CLI de un lector histórico. Dos pruebas con dobles de la guarda y sintaxis del verificador aprobadas; ningún cambio de producto, Cloud, Android, SQL, RLS o Edge.

Evidencia:004/b51-ejecucion.json. Conservar la cita y su auditoría; no repetir los dos comandos ni .artifacts/b51-run/run.mjs. Matriz de 48: **34 VERIFICADA, 6 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL, 4 NO APLICA, 3 BLOQUEADA y 1 PARCIAL**. B5 global sigue abierto por seis ramas: crear/configurar barbería, retirar oferta, servicios CRUD/activo, horarios/cierres administrados, guardar/restaurar instrucciones Yape e inasistencia Web. Requieren preparación y permisos separados. 005 T012 conjunta sigue abierta; SMTP unknown, transferencia, aprobación visual, Android, Cloud público, rendimiento F5 y sesión U3 histórica conservan sus límites separados. Detenerse después del informe.

**Antecedente B5.1: bloqueo inicial resuelto posteriormente (20/11).** Solo1reservaYape+1recepción
ficticia autorizadas. Prevalidación falla antes de SQL/sesiones: Docker context desktop-linux,
pipe dockerDesktopLinuxEngine ausente; API54421/PG54422/Metro8081 sin listeners,0procesos
DockerDesktop/backend y servicio Docker no encontrado. No iniciar/reiniciar servicios:
requiere autorización específica si lo hace Codex.0sesiones/0comandos/0correos/0producto/
0Cloud.40reservas/43detalles siguen como último baseline HISTÓRICO, no revalidado ahora;
integridad actual/HTTP201/HTTP200/Chrome/estados finales no comprobados.2tests del gate y
sintaxis4módulos del verificador aprobados con dobles, no acreditan Yape. Evidencia
004/b51-ejecucion.json; matriz48 mantiene33/7/4/3/1 y B5 abierto. No se repitieron B1–B4.
Continuar solo cuando estén disponibles los servicios habituales: revalidar entorno,
huellas/reloj/slots/40/43 y ejecutar una sola vez los2comandos YA autorizados. No pedir
otra vez permiso de negocio si se conserva alcance; no ejecutar otras6ramasB5. Ninguna
reserva nueva creada, no hay ID ni recepción pendientes de consultar por este intento.
Preparación anterior bajo este bloque es histórica; su falta de permiso Yape fue superada.

**B5 preparado, NO ejecutarYape (20/11).** VerplansecciónB5/evidencia004/b5-preparacion.json.
LecturasLOCALread-only22:57:42UTC:40/43/27care/65careEvents/53reservationEvents,memb14,
invitaciones8,ajustes0050v17/ownerU3 intactos;huellasigualesB4antes/después. Instrucciones
Yapeconfiguradassintéticas,sinnúmeroslargos/URL;servicio25/15min,workeroriginalactivo.
NuevasAuthsesiones0,negociowrites0,productochanges0.9Yapehistóricosprotegidos,no usarlos.
EscenariopropuestoNOautorizado:clienteaecfc300/proworker8ff39bfd/perfil4c1860a5/servicio
0805ab4a/0050existentes;slotcandidato21nov11Lima,reconsultarreal.1confirmYape201+1receive
ficticio200porprofesional,6INSERT+1UPDATEsololedgernuevo;final41/44/28care/67careEvents/
54reservationEvents,confirmed/confirmed/paid/S25.0atención/cancel/refund/configuración/
cuentas/correo/replay. Clienteelige,no recibe;manualsincomprobante/credenciales bancarias.
Estadospending/paid/refunded,NO rejected,nocobroautomático;si noverificapago quedapending.
Matriz48:33VERIFICADA/7sinvalidaciónintegral/4NOAPLICA/3BLOQUEADA/1PARCIAL.4JSONfinales
B1–B4yarchivosregresióncoherentes,sinrepetirsuites/ciclos. YapesoloNOcierraTODOB5:
residualesWebdecrear/configurarbarbería,retiraroferta,serviciosCRUD/activo,horarios/cierres
administrados,guardarYape(2configureseparados)ycomandono-showWeb(backendyaacreditado).
Implementados,sinbugnuevo,noreconstruir.Resolverevidenciaopermisodediferidoexpreso antes
declaimglobal. SMTPunknownno impideaceptacióninterna,pero011porcorreono100%sinresolver;
transferenciafinalHA007bloqueadaporcontrato,noprerrequisitocaminooperativoacotado.
Visuales/Android/Cloud/entregapública/performanceF5/sesiónU3vieja separados. Noafirmar
005/011conjuntascompletas. Próximopermisorecomendado2comandosYape,despuésresidualconcreto;
porahorasolo diagnóstico/documentación,detenerseinforme.

**B4 cerrado funcionalmente Web en alcanceP1–P4/E1–E2 (20/11).** Nueva autorización15
comandos respetada:15HTTP200 realesChrome/GoTrueLOCAL+SQL poracción. Perfilcliente
nombre/teléfono restaurados2PATCH; nombreprofesionalpropio2cambiosrestaurado;7intervalos
propios2reemplazosrestauradosporvalores;bloqueonuevocrear/editar/retirar3 yslotscorrectos.
U3invitaU4barbero1,U4acepta1,seleccionacontexto;U3creaperfil/desactiva/reactiva/asigna1
servicio4.0cuentas/citas/correos/pagos nuevos. No defectonuevo ni cambios deproducto.
Final22:43:46UTC40reservas/43detalles/27care/65careEvents/53reservationEvents,8shops,
14users/13personalprofiles,14membresías/8invitaciones. Originales40citas/pagos/atención,
B2/A/B3,otros tenants/propietarios/membresías/perfiles/servicios intactos porhash.
Conservarinvaccepted906dac8e-f13f-4904-b764-a3ff21fe0fe8,membbarberU4
4c898fa4-4b1a-4270-ad8d-12a5ad87ad1e,perfilactivo4c3f0c8e-e449-4a10-9da1-418091aa99ae,
1capacidad0805ab4a. U4siguedueñoenotra barbería,barber/active solo0050;perfilesinhorarios
nuevos,nocrearreservasparaprobarlo. Settings0050v5→17legítimo,norestaurarcontador.
IntervalospuedenIDs nuevos;valores originalesrestaurados.4sesionespropiascerradas204,
0nuevasrestantes. Auth200/DBhealthy/schema17migraciones/env intactos.3testsdelgateB4y
sintaxisNode aprobados, sinrepetersuitesAuth/concurrencia/lecturasprevias.
Evidencia004/b4-ejecucion.json. Operador `.artifacts/b4-run/run.mjs` yausado; NOrepetir.
SMTPunknown/transferenciabloqueada/YapeWeb/visuales/Android/gatesconjuntos siguen separados;
residuosoferta004 noacreditados porB4. NoCloud/SQL/RLS/Edge/infra/códigoApp cambios.
NoB5automático. Notasinferioreshistóricas, las15operaciones yaNO estánpendientes.

**B4 preparado por solicitud posterior, solo lectura (20/11).** Ver plan maestro sección
B4 y004/b4-preparacion.json.0 cambios producto/negocio/correo/servicios.8 comprobaciones
reales Chrome con cliente yprofesional: editor personal2campos abre/cierra sin guardar;
cliente routeTeam denegada sinloaderperpetuo; invitaciones entrantes sineditores salientes;
perfilprofesional formulario conectado; resumen20nov2citas/1completed/1cancelled conforme
SQL,sin financiero yfecha vacía; horario propio7intervalos/0bloqueos/v5.2sesionespropias
cerradas204. Final22:27:08UTC40/43/27care/65careEvents/53reservationEvents; todasfilas de
negocio, propietarios, perfiles/membresías/profesionales/catálogo/historial/env iguales.
No defectonuevo demostrado. Guardar006/008/009 ygestiónprofesional/invitarbarberoWeb faltan
como recorrido, no como módulos ausentes. ResumenWeb yguarda cliente ahora acreditados;
rosterconmiembros se reutiliza deU3Chrome2E.3, sinrepetir ciclo/U6 niatribuir visualU5.
Propuesta NO autorizada todavía: P1–P4 9comandos (perfilcliente2PATCHrestaurando nombre/
teléfono null; profesional0050 nombre2cambiosrestaurado; horariospropios2reemplazos7filas;
bloqueofuturo nuevo crear/editar/retirar3). E1–E2 6comandos: U3invita barbero interno aU4
1727ac35-2672-42dc-b5b1-6b0482fdc72f (confirmado,credencial existente,0membresías0050);
U4acepta; U3creaperfilnuevo/desactiva/reactiva/asigna1servicio existente. Total15,cuatro
actores.0cuentas nuevas/0correos. Permanecen1invaccepted+1membresíabarber+1perfil+1capacidad;
U4conservaadministraciónenotra barbería. Slots/citas/pagos/atenciónnunca se escriben.
Leer versión actual en cadaacción, conservarincrementos/timestamps/auditorías, noresetearv5;
horarios propios restauranvalores peroIDs pueden cambiar. No modificarotroperfil delworker.
Solo plan, NO ejecutar sin nuevaautorización. SMTPunknown2E.3/transferencia bloqueada/
aceptaciones visuales/Android separados. Residuosoferta004 siguen enmatriz, no declararlos
cerrados porB4. YapeWeb se mantiene expresamente paraB5, sinprobarlo ahora. No iniciarB5.

**B3 cerrado funcionalmente en Web (20/11), no iniciar B4 sin solicitud.** Último permiso
solo cancelar B. TypeError del verificador reproducido en selector real cuando card(B)
es null durante recarga de Agenda; RED→GREEN con espera nula segura/clic atómico.8 pruebas
dirigidas del verificador aprobadas. No nueva modificación de App ni servidor.
Preflight confirmó40/43, B única de este ensayo, reprogramaciónU3 y confirmed/confirmed/
pending sin cancelación. HistorialB ahora visible Web con motivo yHTTP200, sin repetir
reprogramación. Una cancelación desde Chrome/U3 auténticoHTTP200, motivo explícito;
B c47c8ee2-d7df-4ffe-8b6d-055355a3459e finalcancelled/cancelled/pending cashS25.
Evento cancelled único U3/administrator; refundB0. Web estados/historial/filtros correctos:
Cancelada+Pendiente incluye, Reembolsado excluye, Todos restaura. Slot18:15 vuelve a
disponibilidad y18:00 libre. No otras escrituras de negocio.
Final22:17:01UTC40reservas/43detalles/27care/65careEvents/53reservationEvents;1 INSERT+
2 UPDATE lógicos finales, acumulado8comandos/16INSERT/8UPDATE/0DELETE. Lasotras39citas,
todos43detalles, A refunded,38previas incluidaB2completed/paid,perfiles/membresías/otros
tenants/catálogo/historial/env intactos porhash. Auth200/DBhealthy. Nueva sesiónU3 cerrada
204 y0nuevas restantes. Sesión inicialU3 delprimerfallosigue1; tokenno disponible para
revocaciónselectiva, no cerrar global/otras. Pendiente externo, no operaciónB3 faltante.
Evidencia004/b3-ejecucion.json actualizada. YapeWeb recepciónmanual pendiente separado;
Android/gates004T027/010T008/005T012 no cerrados porWeb. No repetir operadores, A/B,
ninguno de8comandos ni recorridosB1/B2/2E.3. NoCloud/SQL/RLS/Edge/infra cambios.
Notas inferiores históricas: ya NO falta cancelarB.

**B3 continuación posterior PARCIAL, no repetir7 comandos:** usuario pidió continuar.
Capturador corregido solo para POST Auth, excluyendo OPTIONS sin JSON;1RED→GREEN y3
pruebas de límites aprobadas. Primer intento0comandos conservado. Continuación separada
`.artifacts/b3-run/resume-1/result.json`; NO volver a ejecutar operador completo.
Chrome verificó B2sin cancelar/reprogramar tras consultar completed (solo lectura).
A12d4287b-7478-4d10-9708-4280bd7fc837:confirm201,receiveU3 200,reschedulecliente201,
cancelcliente200,refundU3 200; finalcancelled/cancelled/refunded cashS25. HistorialAWeb y
horariosliberados reales. Cliente/profesionalsinrefund porlecturas/controlausente.
Bc47c8ee2-d7df-4ffe-8b6d-055355a3459e:confirm201,clientecancelbloqueado/consulta slots403,
rescheduleU3 201 conmotivo; finalconfirmed/confirmed/pending,20/11 18:15Lima.
ParadaTypeError deRuntime delverificador alconsultar historialB tras reprogramación ySQL
yaacreditados. CausaexactaTypeError no demostrada; noatribuir aApp ni corregir/reintentar.
Cancel-B NOemitida, evento cancelB0. Falta solo esa operación ylecturasWeb finales
(historial/liberaciónB/filtros). Nuevo permiso antes de retomarla, mismasA/B; ninguna nueva.
Final22:06:49UTC:40reservas/43detalles/27care/65careEvents/52reservationEvents,+2reschedule.
15INSERT/6UPDATElógicos,7comandos.38citasprevias/41detalles ydependencias, perfiles,
membresías/otros tenants/catálogo/historial/envintactos. Auth200/DBhealthy.3sesionesnuevas
cerradas204; sesióninicialU3delprimerintentosigueregistrada1, sin revocación adicional.
Evidencia004/b3-ejecucion.json. B3abierto/YapeWebpendienteseparado/noB4. Notasinferiores
históricas. NoSQL/RLS/Edge/Auth/Cloud/Android/servicios cambios encontinuación.

**B3 intento posterior detenido antes de A/B:** autorización específica recibida.
Corrección Web de elegibilidad implementada en5 archivos de presentación; consulta
explícita CareControl verificada habilita solo atención confirmed/legado sin ledger;
completed/in-service/no-show/cancelled no ofrecen cancelar/reprogramar. Historial
conservado; Android conserva presentación anterior, sin cambios de servidor/Auth/diseño.
8 regresiones nuevas GREEN tras4 RED del defecto;38 pruebas de componentes afectados,
tipos/lint/formato/grafo aprobados;3 pruebas del límite del verificador. Preflight LOCAL
38/41 y huellas coincidentes. Chrome se detuvo durante acceso inicial U3 por
HTTP_CAPTURE_UNAVAILABLE; no llegó a comprobar controles B2.0 comandos de negocio,
0 citas nuevas, ninguna respuesta de negocio acreditada. No reparar/reintentar este
operador: `.artifacts/b3-run/run.mjs` tiene guardia de intento existente.
Final21:23:36UTC:38/41/25care/61careEvents/49reservationEvents, todas las filas de negocio
previas, catálogo, historial y.env.local iguales; B2 intacta. Auth identities intactas;
auth.users registra inicio U3 yhay1 sesión LOCAL nueva desde el intento. Capturador no
obtuvo token; cierre remoto no realizado. Chrome de prueba cerrado; no nueva autenticación
ni revocación automática. Pendiente capturador: metadata segura y distinguir respuestas
vacías/preflight, sin atribuir una causa HTTP concreta todavía; eventual sesión propia
requiere tratamiento autorizado. Luego permiso de nuevo intento de los8 comandos A/B,
todavía ninguno ejecutado. B3 abierto; Yape Web pendiente separado. No B4/Cloud/SQL/Edge/
servicios. Evidencia004/b3-ejecucion.json. Preparación inferior es histórica.

**B3 preparado, NO ejecutado (20/11):** ver sección B3 de `docs/PLAN-FINALIZACION-WEB.md`
y `docs/evaluacion/evidencias/004-reservas/b3-preparacion.json`. Lecturas LOCAL explícitas
read-only confirman38 reservas/41 detalles,17 migraciones y huellas/catálogo iguales al
cierre B2; su cita sigue confirmed/completed/paid/cashS25. Ninguna de las38 es fixture
mutable. Reutilizar cancelación004,91 pruebas005 y155 conjuntas008–010/10 pares;27 pruebas
locales dirigidas aprobadas ahora, sin nuevas sesiones ni operaciones de negocio.
Defecto de presentación demostrado solo con componentes/dobles: ofrecen reprogramación
y cancelación staff mirando confirmed sin cruzar atención completed; SQL conserva guardas.
No corregido ni probado contra Chrome/servidor ahora. Código futuro puntual, sin rediseño.
Propuesta pendiente de autorización:0050, mismos cliente/U3/profesional/servicio ficticios;
DOS citas nuevas A/B,2 confirm+1 receive cash+2 reschedule+2 cancel+1 refund ficticio;
16 INSERT/8 UPDATE solo nuevos registros, final40 reservas/43 detalles. A cancelada/refunded,
B cancelada/pending; comparar38 citas previas/dependencias, preservar toda historia.
Cliente120min; personal motivo/excepción sin omitir estados; refund solo propietario principal.
No aplicar aún: permisos de escritura/corrección deben revisarse y autorizarse por separado.
Recepción manual **Yape Web NO acreditada**, sigue pendiente antes del cierre de pagos;
no sustituida por cashB2 ni futuro cashB3. Android/gates004T027/010T008/005T012 abiertos.
No B4, Cloud, servicios ni datos operados; detenerse tras preparación.

**B2 continuación finalizada después:** misma c4e9b153-9275-4a9d-9f32-f009bdb087d9,
no nueva reserva/confirmación repetida. DiagnósticoChrome capturóSyntaxError deexpresión
decontexto delverificador(salto literal ensplit), página cargada/bodypresente. Corregir solo
escape/espera seleccionada, noApp/Auth/Edge.2regresiones reales deexpresiónRED→GREEN+4
contexto aprobadas. Profesional veagenda/permisos;receive/start/complete200, inicio>=20:30UTC
servidor,complete válido inmediatamente después deiniciar segúncontrato, sin relojalterado.
SQLfinalconfirmed/completed/paid/cash/S25. FiltrosU3Completada+Recibido incluye/Pendiente
depagoexcluye/Todosrestaura; clienteMisreservas estadosfinales.4careEvents únicos;1reservaevent.
38reservas/41detalles/25care/61careEvents/49reservationEvents,37originales/40detalles/pagos/
atención/perfiles/membresías/otros tenants conservados porhash.8filas nuevas y3updatesdel
nuevoledger acumulados, sin limpieza. Auth200/DBhealthy,3sesionespropias204.
Evidencia004/b2-continuacion.json, detalle.artifacts/b2-run/continuation/. NO ejecutar operadores
denuevo. B2Web cash yfiltros acordados completos; no toda005/Android nirecepciónYapeWeb.
NoSQL/RLS/Edge/Cloud/Android/infraestructura/B1/Auth cambios. B3 requiere permiso separado;
detenerse al informe. Notas inferiores históricas, no pendiente deestas3operaciones.

**B2 ejecución posterior, PARCIAL:** nueva autorización de1confirm/receive/start/complete.
DisabledConfirmar sinmétodo corregido,6regresiones nuevas/28dirigidas/tipos/lint/formato/grafo0.
Chromecliente confirmaHTTP201 c4e9b153-9275-4a9d-9f32-f009bdb087d9;0050/cash/S25/15min,
20/11/2026 15:30–15:45Lima,visibleMisreservas/CareControl. ParadaWEB_EVALUATION_FAILED
enfaseworker-sign-in; excepción deRuntimealpreparar Web delprofesional, causa no demostrada
(GoTrue emitió sesióncapturada,logout204). NO reparar/reintentar automáticamente ni atribuir
aAuth/Edge. Dos sesionespropias cerradas204. Solo comando confirm emitido; receive/start/
complete,agenda profesional y filtros no acreditados. SQLconfirmed/confirmed/pending,
5filas nuevas,carecreated/reservationconfirmed únicos. Totales38/41detalles/25care/58careEvents/
49reservationEvents.37originales/40detalles/pagos/atención/perfiles/membresías/otros tenants
intactos porhash porfila; Auth200/DBhealthy. SinCloud/SQL/RLS/Edge/servicios/B1/Auth/B3 cambios.
Evidencia004/b2-ejecucion.json; .artifacts/b2-run/run/privado. No ejecutarrun.mjs denuevo.
Próximo permiso: diagnósticoWeb delprofesional ySOLO3comandos restantes sobreMISMOID,
conagenda/filtros/lecturas. NO nueva reserva/reconfirmación/cancelación/limpieza ni relojalterado.
B2abierto; preparación inferior es histórica. Respetar parada al entregar informe.

**B2 preparado solamente:** plan maestro contiene escenarioexacto ypermisos; evidencia
`docs/evaluacion/evidencias/004-reservas/b2-preparacion.json`. Sin nuevassesiones/escrituras/
corrección. Clienteaecfc300-c0ca-4005-bbda-d59c7ac2df69 sinmembresías confirmado, barbero
8ff39bfd/perfil4c1860a5 de0050 activo, servicio0805ab4a S/25/15min, ofertapublishedv5.
Uncaso propuesto:cash ficticio, confirm→receive→start cuando relojservidorpermita→complete;
reserva finalconfirmed/atencióncompleted/pagopaid.1reserva/1detalle/1care/1reservationevent/
4careEvents nuevos y3updates delnuevoledger. Mantener37reservas originales; final38/41detalles.
Horario20/11 15:15Lima solo candidato, no reservado; revalidar próximo slot15min>=now+5min
tras autorizar, no fecha pasada. DobleWeb demuestra Confirmar enabled sinmétodo yclickno-op;
corregir solo con permiso futuro ysusregresiones. No App/Cloud/SQL/RLS/servicios operados.
Reutilizar evidencia previa; no iniciar prueba/B3 automáticamente. Usuario revisa alcance
yautoriza1reserva/transiciones/sesiones/corrección. ActualizaciónB1 inferior sigue vigente.

**Actualización B1 posterior:** alcanceWeb acordado completado, ver
`docs/evaluacion/evidencias/004-reservas/b1-oferta-web.json` y actualización delplan maestro.
Exploración/preparación real LOCAL yaacreditada; ahora U3/005aislada0: descripción editada y
restaurada exactamente porChrome, pausa/republicaciónWeb,4HTTP200/SQL. Cambios visibles en
catálogo ydetalle; paused sigueexplorable pero botónreservar deshabilitado/slots0; published
restaurado con botónhabilitado/slots disponibles. Versión1→5 legítima, no borrar contadores.
37reservas/40detalles/atención/pagos/perfiles/membresías/servicios/horarios/otrasbarberías
intactos porhuellas; settings solo versión distinta. Auditorías existentes sin cambios,
contrato no crea evento dedicado deoferta. Sesiónpropia204; sinApp/Cloud/SQL/RLS/Edge/Android/
infraestructura modificados ni reservas/correos nuevos. No repetir B1/2E.3/Auth.11regresiones
deverificador yno-undef aprobados. Matriz conserva pendientes de funcionalidades amplias no
incluidas enensayo; no declarar toda004/T013/Android cerrada. Siguiente B2 necesita autorización;
detenerse al informe, no iniciar por iniciativa. ApartadoFase0 inferior es contexto previo.

**Fase0 de finalización Web (20/11):** matriz/plan únicos en
`docs/PLAN-FINALIZACION-WEB.md`. Solo documentación autorizada y ejecutada; sin datos,
sesiones, servicios o Cloud. Usuario prioriza funcionalidadWeb→diseño restante→Android.
AuthWeb fuera de alcance, interfaces aprobadas congeladas; no repetir2E.3/T019/T023.
Agenda base T023 acreditada en demo-android-web.md, sobre pendiente antiguo de agenda.md.
Orden B1 oferta/exploración, B2 ciclo reserva/pago/atención, B3 gestión posterior, B4
autogestión/deltas equipo, B5 consolidación. B1 siguiente requiere autorización; primero
lectura de oferta/contextos, después propuesta de escrituras exactas si necesarias.
No iniciar implementación masiva ni confundir backend acreditado con recorrido Web completo.
Actualizar solo filas afectadas de la matriz; SMTP/transferencia/hosting quedan separados.

Proyecto final de Arquitectura de Software: SaaS multitenant de barberías. Actores:
cliente, profesional asignado y administrador contextual. Meta inmediata: cliente reserva
desde Android, administrador consulta en Web, profesional atiende y personal autorizado
registra efectivo/Yape; atención y cobro son estados distintos.

Fuentes: `.specify/memory/constitution.md` **2.0.0**, `docs/evaluacion/RUBRICA.md`
(16 criterios), especificaciones/ADR y propuesta aprobada
`https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin` (solo lectura).
La propuesta es más amplia que el MVP: no declarar el SaaS terminado al cerrar reservas.

**Orden vigente del usuario:** Inicio y Autenticación Web de **Barbexa** aprobados
visualmente y en sus recorridos funcionales principales; mantenerlos hasta nueva solicitud.
No requieren repetición rutinaria. App Barbería es solo el nombre académico/técnico.
Implementado **Inicio privado Web de Barbexa** (18/11): `/account` es Inicio;
`?view=profile` conserva Mi cuenta; `explore/shop/notices` reutilizan catálogo o muestran
el estado de función pendiente. Banner/decoración del usuario, menú/avatar y sidebar Web;
lecturas independientes del borrador.51 pruebas dirigidas y Chrome aislado6 tamaños/6
interacciones aprobados; exportación Web/tipos/lint/formato/arquitectura correctos. Diseño y
recorrido cliente aprobados por el usuario19/11; negocio integral004W004 pendiente. Sin reseñas/favoritos/avisos
inventados.006 conserva su aceptación propia pendiente; Auth y variantes nativas intactas.
Etapa1 de navegación Web implementada19/11 sin rediseño: sidebar personal; avatar/perfil
derivan accesos del contexto verificado. `/staff` es recepción personal, `?view=team` exige
admin seleccionado, `?view=professional` usa funciones propias existentes; creación separada
en `/barbershop-admin?view=create`. Corregido Inicio desde query.76 pruebas dirigidas y
Chrome aislado aprobados. El usuario aprobó manualmente19/11 Etapa1 en su recorrido
Web de cliente: lateral/avatar/perfil sin trabajo e invitaciones personales en navegación;
Inicio y diseño premium conservados/aprobados. No atribuir a Codex, no extender a roles
administrativos/profesionales ni edición006T006;006W004a acreditada yW004b pendiente.
No modificar interfaces aprobadas sin solicitud específica. Etapa2B: usuario aprobó opciónA,
facultades fijas, máximo2 secundarios y retirada explícita. Fuente/contratos/pruebas y nueva
migración20261120010538 preparados; activación SQL **posterior2C.9 solo LOCAL** acreditada
más abajo; Cloud/Edge/cliente todavía no activados.4 tablas privadas
RLS, creación con propietario/auditoría, invariantes/cupo/guardas antiguas y regularización
solo operador, sin asignar legado. Nuevos comandos detrás de flag Edge privado apagado y
opción de composición cliente ausente. Web usa capacidades verificadas solo tras futura
activación; diseños actuales conservados. Transferencia inicia/cancela/rechaza, aceptación
definitiva bloqueada hasta decidir destino del principal anterior. Ver011/contracts/
team-authority.md y extensiónHA de spec/tasks. SQL secuencial/carreras preparados NO
ejecutados; falta permiso LOCAL, mapa de legado/fixtures, HTTP y aceptación de roles.
No inferir propiedad histórica; sin conexiones ni operaciones de datos/servicios en2B.
Calidad2B:60 Node (4 inspecciones SQL incluidas)+64 Deno aprobadas; tipos/lint/formato/
checkDeno/grafos/diff0. No acreditar compilación/ejecución PostgreSQL ni carreras reales.
HA-P01–P06 preparadas; HA-A01–A05 abiertas.006 y aceptación física no se cerraron.
Etapa2C.2 corrige solo SQL no aplicado/pruebas: consultas sin DML/locks mutadores y replay
accepted histórico sin nueva concesión (destinatario confirmado y admin activo actual).
Pending sigue exigiendo propietario/stamp/cupo; retiro no se reactiva por replay. Auxiliar
nuevo authority_assert ahora4 parámetros con writing DEFAULT true, sin cambiar RPC públicas.
Auditoría ampliada LOCAL solo READ ONLY:13 firmas/cabeceras/ACL/cuerpos,3 tablas care con22
restricciones/8 índices, trigger, políticas/dependencias concordantes. Historial LOCAL13
(no16): faltan agenda20261115030159/cancelación20261115033925/care20261115151745 aunque
existen sus efectos. No reejecutarlos; procedimiento repair LOCAL por versión preparado,
NO ejecutado.37 reservas/40 detalles/24care intactos por conteos; no DDL/DML/funciones negocio.
Fuente/resultado en011/contracts/team-authority-history-audit.sql y .result.json.
Propietarios8 sin regularizar; mapa humano/autorización antes de activar. Flags apagados
no impiden los efectos de guardasSQL al COMMIT. Edge estaba detenido en2C.1, no se inició.
No ensayoDDL ni scripts de negocio ejecutados, ni jerarquía activada. Ver contrato011.
Calidad2C.2:65 Node (9 estáticasSQL)+66 Deno aprobadas; tipos/lint/formato/Deno/grafos/diff0.
Hash del SQL corregido6F581F7C0EA2B6E6DC9C518A6CDF7252AE9816DC7CA7A21F4A0E3CE44B1D1B42.
No confundir con huella56FA de2B. EnsayoDDL manual con ROLLBACK puede autorizarse sin
reparar previamente historial, preservando13 entradas y sin migrador de pendientes.
Reparación de las3 entradas, fixtures y mapas de8 propietarios son permisos independientes.
Actualización2C.3: ensayo DDL real conROLLBACK aprobado, sin cambios persistentes ni ramas
de negocio; `.artifacts/team-authority-2c3-result.json`.2C.4: pruebas reales en BD separada
`barbexa_2c4_20261120_625cac8c` creada template0, estructuraAuth sin filas y negocio desde17
migraciones. Base principal no migrada. Guion secuencial+75 casos/controles aprobados y2
carreras conlock observado (último cupo23505, revocación42501, sin parciales/locks). Una
prueba adicional READ ONLY de008 falla25006 por FOR SHARE preexistente; detenida sin parche,
lector en modo normal aprobado sin cambios. No decir76/76. SQLroles/claims sintéticos,
sin probar JWT/SDK/GoTrue/Edge. Defaults de privilegios futurosAuth no replicados por42501;
estructura/ACL necesarias verificadas, sin alterar rolesglobales. BD aisladaOID116452 ya
eliminada sinFORCE, con sus datos sintéticos. Catálogo/huellas/conteos/historial de principal
idénticos;37 reservas,14usuarios/13perfiles,8shops/13membresías, historial13. Evidencia
versionada011/contracts/team-authority-2c4-result.json y detalle tasks. Jerarquía NO activada,
propietarios reales no asignados, historial no reparado, transferenciafinal bloqueada.
Pendiente decidir alcance008 READ ONLY y autorizaciones de historial/mapa/activación;
no cerrar2C/006/011 ni aceptación física. Sin servicios operados ni interfaces cambiadas.
2C.5 completada solo para historial: primer intento falló por ruta con espacios y destino
implícito54322; se detuvo sin cambios. Reintento autorizado posterior con CLI3.1.0 directa,
shell:false/argv separados y `--remote=<URL loopback54422>`: identidad PostgreSQL de TCP y
Docker coincidente, `migration list` previo exacto y5 regresiones locales aprobadas.
Reparadas oficialmente20261115030159/20261115033925/20261115151745, secuencia13→14→15→16.
No reejecutar estas versiones. Auditorías intermedias/finales: catálogo/ACL/huellas de datos
idénticos;14usuarios/13perfiles/8shops/13membresías/37reservas/24care; filas previas del
historial conservadas y cero sesiones/locks de reparación o esperas. Copias recuperables
en `.artifacts/authority-2c5/` y `authority-2c5-retry/`; evidencia final saneada
011/contracts/team-authority-2c5-result.json. Jerarquía administrativa aún ausente, sin
regularizar propietarios ni activar flags ni modificar servicios/Cloud/interfaces.
Mapa humano y activación requieren permisos separados.008 READ ONLY se resuelve independientemente:
por sí sola no bloquea activar jerarquía; siguen pendientes mapa humano de8 propietarios,
despliegue autorizado y demás criterios de aceptación. No reejecutar SQL histórico.
2C.7 preparación sin escrituras de BD: usuario confirma8shops ficticias; mapa propuesto
MVP A/U1,B/U2,005 0/U3,1/U4,Prueba0/U5,1/U6,011/U5 conU6 secundario,sjjss/U1, revalidado
con UUID y snapshots privados en `.artifacts/team-authority-2c7/proposal.json`. No aprobado
para ejecutar. Solo sjjss sin settings; pendiente de MVP A a barbero emitida por U1 intacta.
Generador puro `scripts/prepare-team-authority-transition.mjs` produce una copia privada
terminal ROLLBACK: DDL exacto,8 propiedades/8 eventos/1 settings, asserts e INSERT de una
fila de historial en la MISMA transacción. No usar CLI repair separado.18 pruebas offline,
tipos/lint/formato/grafos aprobados; fuente SQL6F581... intacta. No ejecutar el archivo,
ni siquiera en rollback sobre principal, sin permiso. Ensayo exacto nuevo PostgreSQL
aislado pendiente;2C.4 se reutiliza sin equipararlo al bloque nuevo. Sin nueva BD temporal,
datos/servicios/Cloud/interfaces modificados. Detalle y permisos en contrato011 y resultado
team-authority-2c7-result.json. Jerarquía/flags no activados; transferenciafinal bloqueada.
2C.8 resuelve el ensayo pendiente SOLO en una BD independiente: `barbexa_2c8_20261120_f4423fa3`
OID118495, template0,16 fuentes históricas y Auth estructura sin datos. Variante temporal
del procedimiento2C.7 con nombre/OID antes de locks, datos/huellas sintéticos y misma huella
del cuerpo DDL.9 usuarios/perfiles/8 shops/13 membresías/6 profesionales/6 servicios/
37 reservas+care/1 invitación/7settings. ROLLBACK aprobado; fallo inducido tras historial
revierte DDL/8 owners/8 eventos/settings/historial; COMMIT solo temporal aprobado.
13 casos SQL de seguridad/roles/RLS/cupos/profesional aprobados y revertidos; transferencia
final23505. Fuente y archivo original2C.7 intactos. Ajuste de fixture antes de seed: invitado
ya era administrador, se añadió cliente ficticio independiente dentro del total9.
18 regresiones offline aprobadas; sin cambios de código productivo. Base temporal eliminada
por nombre/OID sinFORCE; main catálogo/huellas/historial16/37reservas conservados.
Resultado versionado011/contracts/team-authority-2c8-result.json; operadores/detalle ignorados
en `.artifacts/team-authority-2c8/`. No repetir creación/cleanup. Main todavía sin jerarquía.
Listo para solicitar aprobación definitiva del mapa y nueva autorización de transición
real LOCAL, con revalidación de hashes/snapshots/ventana. No se generó COMMIT para principal.
Pruebas SQL con claims manuales, no JWT/GoTrue/HTTP;008 READ ONLY sigue independiente.
2C.9 activada y persistida SOLO SQL LOCAL tras permiso oficial: endpoint127.0.0.1:54422,
contenedor app-barberia-002-local y base postgres/OID5 confirmados por TCP/Docker.
Una única ejecución/COMMIT del cuerpo revisado con todas las guardas y revalidación final:
8 propietarios/8 eventos, U5 owner011 yU6 secondary011/ownerPrueba1,1 settings sjjss,
1 historial. Ahora17 migraciones,24 tablas/92 funciones/16 políticas/7 triggers.
Nuevas conexiones READ ONLY comprueban todo;4 lecturas RLS owner/sec/otro tenant aprobadas.
14usuarios/13perfiles/8shops/13membresías/37reservas/40detalles/24care y demás datos/eventos/
invitaciones conservados por huellas; solo se añadió settings draft previsto. Cero sesiones
de activación o esperas. No repetir operadores/migración ni regularizar de nuevo.
Respaldo custom558680B verificado por TOC+decodificación completa; sin restauración ejecutada.
Está en `.artifacts/team-authority-2c9/backup.local.dump` con ACL exclusiva usuario/SYSTEM,
carpeta privada ignorada: no subir, mostrar contenido, limpiar ni ampliar permisos. Lectura
de manifiestos/recovery plan exige permiso adecuado fuera del sandbox; no cambiar ACL para
acceder. Recuperación únicamente con nueva autorización y operador privilegiado existente.
Sin error SQL; preparación ACL necesitó ejecución fuera de sandbox antes del backup.
Fuente6F581... y preparado2C.7 sin cambios; variante autorizada solo reemplazó terminal y
repitió postcheck puro. Evidencia saneada011/contracts/team-authority-2c9-result.json.
HA-A01/C7-A01/C7-A03 cumplidas; HA-A02 conserva HTTP, HA-A03 Edge/cliente/manual pendientes.
SQL local activo NO acredita Web/Android/JWT/HTTP. Flags Edge/Web siguen apagados, Cloud
intacto. Para continuar, autorizar revisión/carga Edge LOCAL+flag privado y composición
Web LOCAL aislada, después HTTP/sesiones y recorrido de roles. No cambiar Metro ni servicios
sin permiso nuevo. Transferenciafinal y008 READ ONLY conservan sus pendientes separados.
Pendientes académicos de003/007 documentados sin bloquear los otros módulos Web.
Etapa2D posterior: integración **de código** Edge/Web preparada, sin activar servicios.
LOCAL confirmado17 migraciones/8owners/14usuarios/13perfiles/8shops/13membresías/37reservas;
Edge1.78.1 detenido, cuatro JWT=true, guarda interna/CORS LOCAL comprobados;8081 libre.
Perfil `local-team-authority` solo Web Development localhost8081, destino127.0.0.1:54421,
namespace separado, transportes fijados y Google desactivado; no sobrescribe `.env.local`.
Preparador `node scripts/team-authority-local-profile.mjs --check` no inicia nada. Panel
principal/secundario/cupo/retirada explícita en estilos existentes. Revalidación ya no
desmonta el formulario, denegación retira autoridad y reintento conserva versión/requestId.
Gate diagnósticoGoogle no intercepta el perfil nuevo.384 pruebas cliente/66 Deno aprobadas
con dobles; tipos/lint/formato/grafos0errores. No JWT/HTTP auténticos ni aceptación Web.
HA-A02/HA-A03 siguen pendientes. Usuario debe autorizar inicio del Edge LOCAL existente,
Metro8081 con ese perfil y sesiones LOCAL identificadas; escrituras de invitación/promoción/
retirada con fixtures requieren permiso separado. No servicios/datos/Cloud/Android cambiados.
Procedimiento exacto/archivos en011/contracts/team-authority.md sección2D; no repetir2C.9.
Etapa2E posterior: EdgeLOCAL yMetro8081 **activos**, inicio único de cada uno autorizado,
perfil local-team-authority separado. ValidaciónrealChrome/JWTGoTrue de principalMVP-A,
profesional005 ycliente:16HTTP+2diagnósticos aprobados,6asercionesWeb+1seguridad. SinCloud/
Google ni escrituras de negocio en2E. Posterior2E.2: usuario aprobó manualmente U6 secundario011
sin controles exclusivos, principalPrueba1 conherramientas ycambio entre ambos correcto.
No atribuirlo aCodex ni repetir; accesoU6 disponible, no nueva recuperación. PrincipalMVP-A
aprobado visualmente. Evidenciaresultado2E.userReportedAcceptance2E2. VistaU5 delroster011 y
escrituras administrativas siguen pendientes. Plan mínimo encontrato011: propietario+barbero
ficticios existentes (propuesta005aislada0, porrevalidar), invitación/aceptación/replay/retirada
destinobarber, conservando membresía/perfil/reservas/auditoría. NO autorizado ni ejecutado;
fijar UUID ypedir permiso específico antes deescribir. No modificar U6/propiedad/Cloud/Android.
Posterior2E.3 autorizada: primerintento detenido antes deescribir. Baseline correcto/U3 login
GoTrue real; verificador falló preparando contextoWeb,0invitaciones/aceptaciones/retiradas y
0correos. SesiónpropiaU3 cerrada204. Resultado genérico sinDOMfinal; revisiónestática muestra
expectativa errónea deElecciónmanual aunque membresíaúnica seautoselecciona. No afirmar
falloAuth/Edge nipuntoexacto sinobservación. No corregido nireintentado traslaparada.
Huellas negocio/identidades/catálogo/historial/.env.local finales idénticas, candidato misma
membresía barber/active/perfilintacto,propietarioU3/0secundarios/37reservas conservados.
Evidencia011/contracts/team-authority-2e3-result.json; operadoresignorados .artifacts/team-authority-2e3/.
Necesita nueva autorización para corregir soloverificador+diagnósticos yreintentar idéntico
ciclo. No ejecutar run.mjs denuevo (guarda deintento). No escrituras/servicios/Cloud/Android
adicionales; E-A03/HA-A02/HA-A03 siguen abiertos. AprobaciónmanualU6 conservada.
Reintento2E.3 posteriormente autorizado: verificador reconoce autoelección (4regresiones),
U3/candidato conJWTreales ycontexto/Edgeowner-barber200. UNA invitaciónUI200 crea pendiente
42acf7f0-15f6-4cff-940d-2fc144e715cc, entregaunknown;0avisos correspondientesMailpit.
GuardaSMTPLOCAL exige@example.invalid yemailficticio candidato no cumple; antesdeconectar
arroja ynotify→unknown. Fallóvalidaciónsent; se detuvo sinaceptar/replay/retirar ni reenviar.
Negocio/identidades/catálogo/historial protegidos iguales; candidato mismafila barber/active,
perfilintacto/0secundarios/propietarioU3/otrasbarberías/37reservas conservados. Nuevasfilas
solo invitación+metadata+sello; eventosautoridad8. Ambas sesiones propias cerradas204.
No cambio decuenta/SMTP/App/SQL/Cloud/Android/servicios. Evidencia011/contracts/team-authority-2e3-retry-result.json,
detalleignorados .artifacts/team-authority-2e3/retry/. No ejecutar denuevo. Hace falta nuevo
permiso paracompatibilidad de correoLOCAL ydestino explícito deesta invitaciónunknown;
no crearotra ni aceptar/reconciliar/reintentar notificación poriniciativa. U6aprobado intacto.
Posterior2E.4 autorizada: guardSMTPLOCAL amplía solo destinatarios exactosexample.test/
example.invalid; Resend/Cloud/configuración/autorización intactos.18 pruebas Deno dirigidas,
tipos/grafo/lint/formato aprobados. NoSMTP real nirestart/deploy; no acreditar workeractivo.
Lectura deúnicainvitación:pending/unknown,vigente hasta27/11/2026,selloU3v1 correcto,
candidato barber/active;huellas protegidas intactas. No cambios defilas/avisos/sesiones.
Guardanterior rechazó antesdeconectarSMTP; notify→unknown. unknown bloquea claim/retry:
no editarstatus ni reenviar sinpermiso. Aceptación desdebandejarecibida no depende de
entregaSMTP ypuedeautorizarse conreplay/retirada sobremismafila; aviso real quedaría
pendiente. Otra vía requiere revisión/reconciliación selectiva aprobada +unavisomismoID.
Nunca crearotra, cancelar, aceptar, reconciliar oretirar ahora. 2E/011 siguenabiertas.
Continuación2E.3 después autorizada: SOLO invitaciónexistente42acf7f0-15f6-4cff-940d-2fc144e715cc,
sinotra ni reenvío. TrabajadorloginChrome/GoTrue real; aceptaciónUI200 ymisma membresía
administrator/active, capacidadsecondaryEdge200/1de2cupos/sin facultadesexclusivas.
Después /barbershop-admin mostró «No se pudieron consultar los permisos»; timeout del
verificador esperando panel. Causa no demostrada; NO reparar nireintentar automáticamente.
Replay/loginU3/retirada NO ejecutados. Trabajador sigue secundario activo, propietarioU3
intacto; invitaciónaccepted/entregaunknown. Auditoría8→9 conaccepted-administration.
VerificaciónREADONLY:37reservas/40detalles/pagos/todosperfiles/propietarios/otrasmembresías/
otrasinvitaciones intactos porhuellas; metadataMail/sello/catálogo/17migraciones iguales.
Auth200/DBhealthy/.env.local igual, sesiónpropia cerrada204. SinCloud/Android/servicios.
Evidencia011/contracts/team-authority-2e3-existing-result.json, detalle.artifacts/team-authority-2e3/continue-existing/.
No volver aejecutar continue-existing.mjs. Nueva autorización para diagnósticoWeb ycontinuar
unreplay/retirada explícitabarber. SMTPpendiente separado;2E/011 abiertas. Notas inferiores históricas.
Nueva continuación2E.3 autorizada: errorWeb reproducido yresuelto encliente. Debugger/bundle
prueban run rechazando resultado decontextoantiguo ycatch invalidando autoridadactual;
Auth/membresías/capacidades200 ydecoder correcto. Guarda scopeKey===stamp antesdeinvalidar,
sin aceptar respuestaantigua ni debilitar denegaciones actuales.10regresionesRED→GREEN,
52dirigidas/tipos/lint/formato/grafo aprobados. Chrome confirma panel sec ysin controles
exclusivos; /staff?view=team denegado. UN replayaccept de invitaciónacceptedHTTP200,
sin nueva membresía/cupo/evento ni huellacambiada. NO repetir aceptación nireplay.
U3 login/owner200 ypanel equipo1/2 correcto. RetiradaNOemitida: verificador adaptado dejó
llamada awaitwaitCapture sin declarar auxiliar; errorUNEXPECTED_ERROR tras confirmarUI,
antes de solicitudremove-secondary (contador0). Error del ejecutor, no servidor. Parada sin
reparar/reintentar; sesiones propias204. READONLY confirma negocio/membresías/auditoría igual,
37reservas/40detalles/pagos/todosperfiles/propietarios intactos. Trabajador sigueadminactive/
1secundario, invitaciónaccepted/unknown,9eventos; Auth200/DBhealthy/.env.local igual.
SinCloud/Android/infraestructura/correos. Evidencia011/contracts/team-authority-2e3-web-replay-result.json.
No ejecutarcomplete-existing.mjs denuevo. Necesita permiso para corregir SOLO verificador
y UNA retirada destinobarber, luego revocación/perfil/auditoría; sin nuevo replay. 2E/011
abiertas ySMTP separado. Aprobaciones manualesU5/U6 no ampliadas nirepetidas.
Cierreposterior2E.3: nueva autorización para SOLO retirada. Verificador inicializawaitCapture
antes deacciones, exigeHTTP200/cuerpo, no declara éxito antes deSQL;11regresiones yno-undef
aprobados, lint/formato/tipos/grafo correctos. Sin cambios deApp/servidor. PreflightREADONLY
0retiradas previas/1aceptación, candidatoadminactive/1secundario/U3propietario/perfilactivo y
huellas intactas. UNA retiradaChrome/U3GoTrue en /staff?view=team destinobarber conmotivo,
HTTP200. Misma membresía quedabarber/active,0cupos/U3intacto. NO aceptación nireplay repetidos.
PostHTTPbarber200, nuevecapacidadesadminfalse porSQLREADONLY, equipoWebdenegado, perfilpropio/
horarios200 yperfilprofesional leído porUI. Auditoría9→10 con unremove-secondary;accepted/
unknown intactos.37reservas/40detalles/atención/pagos/perfiles/servicios/otrasbarberías y
membresías conservados porhuellas; tabla demembresías vuelve abaselineprepromoción.
Auth200/DBhealthy/.env.local igual, ambas sesionespropias204. SinCloud/Android/SQL/RLS/Edge/
infraestructura/correos modificados. Evidencia011/contracts/team-authority-2e3-removal-result.json,
detalle .artifacts/team-authority-2e3/removal-only/. NO ejecutaroperador denuevo.
Ciclo2E.3 técnicamente completo;2E/011 no cerradas globalmente: aceptaciónintegral/rosterU5/
guardaCliente/gates físicos existentes, SMTPunknown separado, transferenciafinal yCloud fuera.
No repetir U6/ciclo deescrituras; usuario quiere terminar funcionalidadWeb después, peroesta
autorización ordena detenerseal entregar informe. No avanzar otros módulos automáticamente.
Defecto2E-WEB-01 reproducido: cliente sinmembresía en /staff?view=team queda cargando
permisos; idle se trata antes dedenied en OperationRoute. Sin fuga:controlesausentes y
Edge403 en2E. **Corregido en2E.1** autorizada, solooperation-route.web.tsx+regresiones:
denegación anticipada sinmembresíaadmin, carga real/error separados ysalidasInicio/Miperfil.
Ocho regresiones nuevas y56pruebasdirigidas aprobadas; tipos/lint/formato/grafo0errores.
Metro sirvióbundleactualizado sinreinicio. No runtimeChromeLOCAL autenticado reutilizable;
no nuevoAuth/SQL/negocio en2E.1. Confirmación manual pendienteyHA-A03no cerrada. No tocar
servidor niAndroid; followUp2E1 enevidencia2E yE-A01acreditada soloencódigo/pruebas.
Huellas/catálogo/historial/.env.local intactos;17migraciones/8owners/13membresías/37reservas/
40detalles/24care. Authusuarios14/identidades conservados;5logins/4logoutslocales,sesiones
48→49/refresh51→52/audit507→516. Primer intento dejó sesiónsin token retenido: no revocar
globalmente ni borrarAuth. Evidencia011/contracts/team-authority-2e-result.json. No cerrar
HA-A02/HA-A03/006/011 ni aceptación manual; escrituras requieren permiso independiente.
No APK Android ni despliegue público en esta fase. Carga inicial/F5 pendiente de
medición real, sin nuevos cambios Auth autorizados en esta consolidación.

## 2. Arquitectura y versiones

Expo **58.0.25**, React Native **0.88.1**, React **19.3.0**, Expo Router **58.0.31**,
TypeScript **6.0.3**, supabase-js **2.119.0**; versiones efectivas en `package.json`/lock.
Web y Android obligatorios; Web ligeramente primero, Android inmediatamente después.
APK Development ya instalado en teléfono HONOR, Hermes; no hace falta otro por cambios JS.

Flujo: rutas Expo Router → presentación → casos de uso/puertos → adaptadores Supabase.
Composición explícita en `src/composition/`. Dominio/aplicación no importan RN/SDK/HTTP/SQL
ni tipos generados. Servidor conserva igual separación en `supabase/functions/_shared/`.
Edge valida JWT mediante Auth, transmite identidad verificada y usa RPC cerradas;
PostgreSQL revalida propiedad/membresía vigente y garantiza transacciones/RLS/locks.
Una clave de servicio permite conexión privilegiada, no concede autorización de negocio.
No añadir API Node propia ni microservicios.

Sesión: SDK único, PKCE, consumidor único de enlaces; SecureStore Android y almacenamiento
Web por namespace. Web es accesible a JS: XSS residual aceptado, no garantía HttpOnly.
`expo-crypto` genera aleatoriedad segura; no Math.random ni polyfills supuestos.
Una membresía activa selecciona contexto; varias permiten elegir/cambiar; cero es válido.
Logout del navegador/instalación actual, sin exigir cierre global.

## 3. Mapa del repositorio

| Ruta | Uso |
| --- | --- |
| `src/app/` | Rutas; grupos `(auth)` y `(account)`, retornos `auth/callback` y `auth/reset-password`. |
| `src/features/authentication/` | Sesión, registro/login/logout, recuperación, contexto y presentación. |
| `src/features/tenant-foundation/` | Perfiles, barberías y membresías reutilizados de002. |
| `src/features/barbershop-operation/` | Oferta, publicación, profesionales, servicios, horarios e invitaciones. |
| `src/features/reservations/` | Disponibilidad, confirmación, propias, agendas y cancelación. |
| `src/shared/ui/`, `src/features/foundation/` | Controles accesibles, tokens, bienvenida/base. No rediseñar ahora. |
| `src/composition/` | `auth-composition.ts`, `registration-runtime-provider.tsx`, composiciones de operaciones/reservas y proveedores de rutas. |
| `supabase/functions/` | `ensure-profile`, `create-barbershop`, `barbershop-operation`, `reservation-command`; núcleos/adaptadores en `_shared/`. |
| `supabase/migrations/`, `supabase/tests/` | SQL versionado y pruebas de esquema/ACL/RLS/negocio. No editar migraciones aplicadas. |
| `tests/unit/`, `tests/integration/`, `tests/presentation/`, `tests/server/`, `tests/architecture/` | Suites dirigidas y checkers reales. |
| `scripts/` | Checkers, runners seguros y compilación aislada de pruebas. |
| `specs/001-*` … `005-*` | Fuente por funcionalidad: spec, plan, contratos, validación, tareas cuando existen. |
| `docs/evaluacion/evidencias/` | Historia de ejecuciones002/003/004; consultar solo el bloque relevante. |
| `docs/arquitectura/`, `ESTADO-DESARROLLO.md` | Análisis histórico y cronología; encabezados antiguos no describen el estado actual. |
| `docs/evaluacion/matriz-cumplimiento.md`, `recorrido-integral-final.md` | Límites académicos y único recorrido final preparado. |

`.artifacts/` y `.env*` privados están ignorados: son locales, no asumir que estarán en
otra máquina/cuenta. No copiar credenciales al handoff ni versionarlas.

## 4. Entornos y servicios protegidos

**LOCAL de trabajo:** `app-barberia-002-local`, API54421, PostgreSQL54422,
Studio54423, Mailpit54424, shadow54420, inspector8183; resto en `supabase/config.toml`.
LAN observada **192.168.0.16**, variable: comprobar antes de usar. Web aprobado
`http://localhost:8081`; Android `appbarberia://auth/callback` y
`appbarberia://auth/reset-password`. `localhost` del teléfono no es la PC.
HTTP LAN solo Development: `app.config.js`, plugin local y adaptadores con DEV/origen
exacto; Preview/Production mantienen transporte seguro. No fijar LAN como producción.

Metro existente verificado18/11 en Development/LAN/8081, perfil cloud-integration solo
en el proceso (PID48608); `/status` y chunks del Inicio privado200. Reutilizado sin nuevo
inicio/reinicio; valores públicos contrastados en memoria, sin sesiones nuevas. En la
operación anterior se habilitó CI=false y vigilancia de archivos. Se realizaron los
dos reinicios específicos autorizados para el login Web; el operador anterior CI=1
impedía descubrir archivos nuevos y actualizar cambios. No repetir reinicios.
Comando de referencia, **no ejecutar sin comprobar autorización/puerto**:
`$env:APP_VARIANT='development'; npx.cmd --no-install expo start --dev-client --lan --port 8081`.
No asumir que `npm start` equivale: actualmente usa Expo Go, no el dev-client instalado.
Proyecto EAS `@erwin23/app-barberia`, ID `d428c9e5-0852-43c3-974c-fae3bf286f3e`,
package `com.erwin23.appbarberia`. Cuenta Free/cuota fueron reportadas manualmente;
revalidar costos/cuota y autorización antes de cualquier nuevo build.

**Cloud nuevo:** `app-barberia-arquitectura`, ref **vuoncrtkkkquvddunrxx**,
organización `barberia-app`, región `sa-east-1`. Historial actual16: cinco migraciones002,
tres de catálogo,cuatro de motor/agendas/cancelación/pagos y tres de perfil/horarios/
reprogramación y011 equipo/resumen;20 tablas RLS,80 funciones,
16 políticas y4 triggers. Cuatro Edge ACTIVEv2/JWT tras configurar2 variables:
`ensure-profile`, `create-barbershop`, `barbershop-operation` y `reservation-command`;
código de las4 idéntico al previo. CORS/resumen configurados y38 pruebas HTTP aprobadas;
perfil cloud-integration activado con autorización solo en el proceso Metro de prueba;
aceptación Google/perfil desde login normal pendiente. No equiparar este despliegue
con aceptación E2E de negocio Cloud. Bloques posteriores necesitan permiso independiente.
Data API habilitada, autoexposición desactivada; `public` y `graphql_public` declarados;
última inspección: pg_graphql ausente, GraphQL opcional/fuera del contrato002.
Plan Free/spend cap informados por usuario; no nueva consulta de facturación en este handoff.

**Prohibidos:** proyecto Cloud anterior **klebvayvsvibwjpkzrff**, contenedores/volúmenes
antiguos `barberia-app`, repositorios de referencia y entorno temporal de reproducción.
No detenerlos, reutilizarlos o limpiarlos. Los 12 contenedores antiguos fueron preservados
en las verificaciones previas; no se reinspeccionó Docker para redactar este documento.

## 5. Reglas de negocio aprobadas

- Roles por barbería/membresía activa; administradorA/barberoB nunca implica admin global.
- Servicios con precio PEN/duración; profesional activo y horarios válidos. Administrador
  puede atender solo si tiene perfil profesional activo/asignación, no automáticamente.
- Invitación interna a cuenta existente: pendiente no concede acceso; aceptar/rechazar,
  duplicados y aceptación concurrente controlados. Sin correo de invitación en MVP004.
- Reserva atómica: servidor calcula precio/duración/disponibilidad/snapshots. Idempotencia,
  rollback y exclusión de solapamiento por **persona**, incluso entre perfiles de dos shops.
  Intervalos consecutivos no solapan; cancelada libera capacidad. Conflicto responde solo
  profesional no disponible, sin detalles del otro tenant. Instantes UTC, UI Lima.
- Cancelación configurable por shop, predeterminado **120min**, política histórica;
  cliente puede cancelar desde el límite inclusivo, fuera de él solo personal autorizado
  con motivo. Estado/evento/liberación atómicos; repetir no sobrescribe auditoría.
- **005 aprobado en reglas, no implementado:** iniciar desde hora programada; completar
  solo atención iniciada; no-show desde tolerancia configurable, **10min** iniciales.
  Atención y pago independientes, pendiente visible. Efectivo/Yape se confirman manualmente
  por asignado activo o admin contextual; no cobro/verificación bancaria automática.
  Reembolso mínimo: registro total externo de pago confirmado y cita cancelada, solo admin
  activo con motivo/auditoría; sin mover dinero ni penalizaciones.

## 6. Estado real por especificación

Casillas recontadas el15/11/2026; no se modificaron durante este handoff.

| Spec | Estado y pendientes |
| --- | --- |
| 001 | **40/40** cerradas. Fundación Expo/Clean Architecture. |
| 002 | **40/40** cerradas. Perfiles/barberías/membresías, RPC/Edge, RLS y pruebas local/Cloud. |
| 003 | **27/36**. Pendientes **T014,T019,T023,T031–T036**. Código recovery T028–T030 implementado y19 comprobaciones reales HTTP/Mailpit aprobadas; UI Web/Android y negativos finales pendientes. T014/T019 requieren casos específicos SC-001; T023 matriz sesión; T033–T036 seguridad/accesibilidad/calidad/cierre conjuntos. |
| 004 | **28/34**. Pendientes **T013,T027,T030,T032,T033,T034**. Código catálogo/reservas/agendas/cancelación/caché operativo local. T013/T027: discrepancias de evidencia; T030 recorrido/accesibilidad y recovery003; T032 Cloud; T033 origen/HTTPS/DNS/CDN/CSP/k6; T034 cierre. T031 prepara pipeline, no prueba CI remoto. |
| 005 | Plan/contratos/12 tareas; T001–T011 código/pruebas reales acreditadas; T012 abierta. Migración local20261115151745 aplicada con permiso; tres tablas privadas, RPC y guarda. Código cliente/Edge integrado. 91 comprobaciones reales/10 pares concurrentes aprobados; pendientes validación física de filtros administrativos atención/pago y E2E. Ver specs/005-atencion-pagos-manuales/quickstart.md. |

No confundir APIs con aceptación física completa:006 conecta edición personal al
backend002, pendiente de recorrido físico.005 añade atención/pagos al esquema004.
Google007 tiene Auth Cloud aislado aceptado manualmente en Web/Android; falta acreditar
perfil propio y cuenta existente sin duplicación para T006/SC002 y la integración de
negocio en un entorno común.008/009/010/011 tienen código y backend LOCAL acreditado;
sus recorridos físicos finales siguen pendientes. Favoritos, estilos/imágenes,
notificaciones, reseñas/mapas pertenecen a la propuesta más amplia y no están implementados.

### Evidencia manual y discrepancias

Usuario acreditó registro/confirmación/perfil, login/logout, persistencia/contextos,
reservas reales Web/Android, F5/entrada directa con query, retorno desde otra pestaña/app,
salida/Atrás sin acceso y agendas. Es ejecución **del usuario**, no de Codex. Reutilizar.

Declaró además T013/T027 correctas, pero lectura local posterior mostró invitación A→adminB
pending/sin membresíaA y citas finales **9a679512** y **b8980a05** aún confirmed,0 eventos.
Fuentes: `docs/evaluacion/evidencias/004-reservas/t028-t029/t013-after-manual.json` y
`cancellations-after-manual.json`. Conservar ambas evidencias y gates abiertos, sin
repetir aceptación/cancelación para forzar coherencia. Resolver en recorrido final.

## 7. Último trabajo y punto de reanudación

**18/11/2026 — cierre principal Web aprobado por el usuario.**
Inicio y Autenticación Web de Barbexa: diseño y recorridos funcionales principales
aprobados manualmente por el usuario. No requieren repetición rutinaria.
Incluye logo/bienvenida, navegación pública, tarjetas Cómo funciona/Beneficios y
las interfaces de autenticación. Registro, correo Resend, confirmación/perfil,
login/logout, recuperación y ciclo de vida Web reutilizan las evidencias existentes.
Contraseñas fuertes cliente/servidor acreditadas; rechazos reales solo LOCAL.

Casillas revisadas: **003 27/36; 007 5/6**, sin cierres adicionales. Pendientes por
criterio en la [matriz vigente](evaluacion/evidencias/003-autenticacion/informe.md#cierre-de-inicio-y-autenticación-web--18112026).
Google aislado Web/Android se conserva acreditado;007T006 espera cotejo atribuible
de cuenta existente/perfil reutilizado y consolidar logout integrado Android. Linking
pendiente sin causa demostrada, sin nuevas sesiones o investigación salvo evidencia nueva.
006 sigue5/6 y pendiente de aceptación de edición. Próximo trabajo: Mi cuenta Web;
acceder tras login no acredita guardar/cancelar/retirar teléfono. Esta revisión solo
cambió documentación. Las notas inferiores conservan el historial y quedan subordinadas
a esta decisión, incluidas las antiguas que pedían repetir autenticación ya acreditada.

**17/11/2026 — aceptación Web Cloud.** El usuario verificó registro y recuperación con
correo Resend, confirmación, perfil, F5, logout y protección de `/account` en escritorio.
003 mantiene 27/36 y 007 mantiene 5/6. Continuar con los casos aún pendientes sin
reenviar correos. Ver [matriz y lectura agregada Cloud](evaluacion/evidencias/003-autenticacion/informe.md#aceptación-web-cloud--17112026).

**Último bloque — diseño login Web aprobado; auditoría funcional Web iniciada:**
Usuario aprueba definitivamente el diseño actual, incluidos los ajustes de etiquetas.
Mantenerlo sin cambios; registro/recuperación no tienen aprobación de rediseño.
Auditoría de código/seguimiento:61 pruebas dirigidas de presentación/adaptadores/sesión/
PKCE/registro/recovery/aislamiento aprobadas con dobles; sin cuentas, sesiones, correos
ni operaciones reales nuevas. No se acreditó E2E Cloud por estas pruebas. Pendientes:
SMTP/redirect recovery Cloud por revalidar (última inspección sin destino reset-password,
Site URL localhost3000), origen HTTPS para navegador móvil y autorización de pruebas
Cloud por contraseña/registro/recovery. Reutilizar Google ya aceptado y19 pruebas LOCAL;
no investigar linking Android ni repetir sesiones sin nueva evidencia/permiso.
00327/36 y0075/6 conservadas; aceptación funcional final desktop/móvil pendiente.
`sign-in-screen` conserva su controlador; formulario separado por plataforma en
`sign-in-form.tsx` (Android previo) y `.web.tsx` (DOM semántico responsive). Estilos
acotados en `sign-in-web.styles.ts`, iconos/emblema SVG locales en `login-icons.web.tsx`;
Google permite inyectar presentación manteniendo su lógica. Solo el login Web oculta
su encabezado de Stack. No se rediseñaron registro/recuperación ni Android nativo.
Fotografía activa en `public/images/login-barbershop-1920x1080.generated.jpg`
(1920×1080,299752 bytes), ampliada lateralmente con image_gen y exportada a 16:9 por
petición del usuario. La anterior1448×1086 se conserva sin sobrescribir. Dimensiones
comprobadas en archivo/navegador; el fondo encaja completo en un área1920×1080, pero
otras proporciones siguen sujetas al recorte de cover. Generada desde la referencia:
reconstruir solo el interior de barbería, sin textos, iconos ni panel/formulario;
los controles y textos siguen siendo DOM real. No se descargaron fotos externas.
Se afinaron proporciones, campos, tipografía y SVG. Por autorización posterior, el
formulario Web usa Outfit variable local en `public/fonts/outfit/`, con OFL oficial de
Google Fonts: título800, etiquetas600, enlaces500/600, botones700 y resto400. Logotipo
y lado izquierdo conservan sus fuentes anteriores. Solo se cambió familia/pesos;
comprobados escritorio y móvil320–1448px sin desbordes,5 pruebas de presentación y
tipos/lint/formato/arquitectura aprobados. El emblema sigue siendo una aproximación;
El diseño está aprobado; la aceptación funcional final sigue pendiente. Correo Web: etiqueta
flotante única dentro del campo, sube con foco/valor y baja al vaciar/salir. Contraseña
usa el mismo patrón, conservando candado/ojo; ambas etiquetas suben fuera del campo,
alineadas a la izquierda, a14px y sin fondo, con28px reservados y transición
220ms (sin animación con reduced-motion). Verificados foco, valor, vaciado, mostrar/
ocultar y móvil320px;7 pruebas dirigidas. Sin cambios Auth/Android/servicios/datos.
Revisión en navegador: nueve tamaños320–1920px sin desborde horizontal; teclado, campos
obligatorios, mostrar/ocultar contraseña y enlaces reales de registro/recuperación.
37 pruebas dirigidas, tipos/lint/formato/arquitectura aprobados; el bundle Android JS200
sin estilos Web corresponde al bloque anterior (Android no se rediseñó). No se repitió
login real ni sesiones Google. Cloud admite Web solo localhost8081: el navegador móvil
por LAN requiere autorización/configuración separada; emulación responsive no acredita
aceptación física. Revisar http://localhost:8081/sign-in sin cambiar el diseño aprobado.
No cierres de tareas; linking007 continúa pendiente sin nuevos parches.

**Último bloque — linking tras logout Google Android; recuperado pero causa abierta:**
Usuario acredita login Google NORMAL,acceso a perfil y persistencia al salir/volver.
Al cerrar sesión vio configured linking in multiple places,useLinking.native.js61.
Adjunto leído11ac5e09-af56-487d-a709-cfd0d6bd119b/Texto pegado.txt. Después reportó que Reload
eliminó aviso y mostró bienvenida/Iniciar sesión/Crear cuenta;APK funcional,no repetido.
Evidencia manual del usuario;NO incidencia corregida definitivamente ni cierre007.
Fuente instalada Router58:aviso DEV al montar hook propietario mientras queda registro
previo en linkingHandlers;no cuenta listeners nativos de PKCE.3 verificaciones locales del
hook instalado aprueban:listener adicional no avisa,propietarios solapados sí,limpieza y
remontaje secuencial no. No reproducen el logout físico. src no declara NavigationContainer
o ExpoRoot adicionales;layouts/protected y finally logout tienen varias vías de navegación,
pero no se demostró que creen otro propietario. No modificar por esa hipótesis ni LogBox.
Inspector consultado2veces sin runtime Android:no se capturó duplicación/remontaje real.
Operador de lectura inspect-logout-navigation.mjs preparado ignorado;sin sesiones/acciones
Auth,lee solo recuentos componentes/handler si dispositivo disponible. Código funcional
sin cambios. No repetir Google ni logout ahora;si reaparece,conservar APK abierto/stack y
observar raíces en vivo.0075/6 hasta aclarar logout y cotejar perfil integrado. Sin datos,
Cloud/LOCAL/config/servicios/Metro/log/APK/instalaciones/Git writes/rediseño.

Reactivación posterior autorizada16/11:Metro detenido/8081 libre,LAN192.168.0.16 vigente.
Un único inicio Development/dev-client/LAN/cloud-integration;MetroPID17572,supervisor4700.
localhost yLAN/status HTTP200 packager-status:running;.env.local intacto por hash,0 errores.
Conservar instancia;sin operaciones Cloud/LOCAL/datos. Diagnóstico filtrado ignorado
metro-google-android-diagnostics.json;pendiente usuario Google normal Android y cotejo perfil.

**Arranque Android resuelto físicamente por el usuario; retomar Google normal:**
Usuario encontró recientes192.168.0.16:8082(carga sin terminar) y8081(actual funcional).
Desactivó Auto-launch most recent app,conectó8081 y reactivó automático;ahora abre rápido
y normal. Evidencia MANUAL del usuario, no ejecución de Codex. Compatible con reconexión
a dirección anterior,posiblemente8082;causa exacta no demostrada. No seguir cambiando
Auth/Router/splash/nativo por esta demora;conservar carga/timeout15s. Sin nuevoAPK/reinicio.
Lectura Cloud posterior:1 usuario,1 identidad Google,1 perfil vinculado y0 membresías/
barberías/reservas. Sin duplicados actuales. Huella ID/versión de fila del perfil guardada
solo en .artifacts/007-cloud-auth/cloud-integration-existing-profile-baseline.json para
cotejo tras Android,sin identidad cruda/tokens. MetroLAN8081 HTTP200. No nuevas sesiones
ejecutadas por Codex. Pendiente Android:login NORMAL con el mismo Google→perfil existente
sin formulario→persistencia/retorno→logout/Atrás y cotejo read-only de huella/conteos.
007 sigue5/6;no acreditar roles Cloud sin membresías. No cambios código/servicios/config/
Cloud o LOCAL37reservas/log/Git;sin rediseño. Conservar autorizaciones de hasta2 sesiones.

**ACLARACIÓN posterior — demora del launcher nativo, antes de App Barbería:**usuario
confirma logoExpo→blanco >3min→launcherDevelopmentClient;introducir192.168.0.16:8081 carga
correctamente bienvenida/Iniciar sesión/Crear cuenta/Base técnica. No atribuir esta demora
a Auth/Router/Supabase ni al timeout15s. Lectura:MetroLAN200;tras conexión manual aparece
runtime com.erwin23.appbarberia(HONOR CRT-NX3). expo-dev-client/dev-launcher58.0.20,perfil
developmentClient=true,sin launchMode/defaultLaunchURL explícitos. Fuente nativa intenta
getMostRecentApp con tryToLaunchLastBundle(defaulttrue);ante fallo vuelve al launcher.
Settings incluye Auto-launch most recent app,preferencia local modificable sin build.
Hipótesis principal:URL reciente inaccesible/antigua;no se leyó historial privado del
teléfono ni hay logs nativos que prueben URL o duración exacta. También cabe fallo del
launcher/red. Recomendar prueba reversible desde Settings apagando autolanzamiento y
comparar apertura directa del launcher;solo sugerido,no aplicado. Cambiar el default nativo
launchMode=launcher en config requeriría nuevo APK autorizado. No cambios funcionales,
config/infra/DB/Git,instalaciones o reinicios. Priorizar diagnóstico launcher sin ADB.

**Diagnóstico físico posterior — defecto Android sigue abierto:**usuario informa video
con logo Expo unos6s y luego blanco,sin carga/login/error;termina antes de15s desde apertura.
Las104 pruebas automáticas NO acreditan el arreglo físico ni descartan Auth. Inspección
de lectura:Metro/LAN192.168.0.16:8081 activos;manifiesto paquete com.erwin23.appbarberia,
bundle corregido/perfil Cloud presentes;inspector0 runtimes y sin conexión del teléfono
durante la consulta. No prueba descarga/ejecución ni montaje React en ese APK. Diagnóstico
filtrado sin categorías de error no equivale a consola JS del dispositivo. Caso probado
en código:Development /auth/google-test devuelve null;el gate integrado lo omite,por lo
que recuperar esa ruta podría explicar blanco tras resolver Auth. Es HIPÓTESIS del video,
no ruta física comprobada. No nuevos cambios de código/configuración/reinicios/Git.
Necesario:APK abierto en blanco40s,mismo Wi-Fi,menú Developer/URL servidor y Open DevTools
Console/Components para confirmar bundle ejecutado,ruta/montaje y errores sin tokens.

**Último bloque — pantalla blanca Android: corrección JS verificada; Metro recuperado:**
Usuario reportó logo→blanco/intermitencia antes del login integrado. Inspección inicial:
Metro200/PID22848 vivo,inspector sin dispositivos;ADB no disponible. Logs metro.* antiguos
no pertenecen al proceso vigente y no contienen error que explique el arranque actual.
Router58 oculta splash al montar Slot;NavigationFrame ponía display:none al navegador
nativo mientras Auth resolvía,sin plazo máximo. Corregidos defectos reproducidos en tests:
viewport Android conservado con opacity/pointer/accessibility;contenedor flex en composición
y feedback absoluto SafeArea visible;cota15s inyectada para restauración/lectura de perfil,
error recuperable/reintento y epoch que descarta respuestas tardías. No limita consentimiento
Google ni modifica login/PKCE. Formulario diagnóstico mantiene cobertura completa.
7 regresiones nuevas;80 integración/presentación y24 unitarias dirigidas aprobadas,
TypeScript/core,lint,formato,arquitectura0. Runner incluye startup.test.mjs.
Durante cotejo final Metro dejó de escuchar:PID22848 ausente,ECONNREFUSED8081,sin evento
Windows de fallo Node;no se conoce la causa de su terminación. Posteriormente el usuario
autorizó1 inicio:puerto libre/0 Metro/LAN192.168.0.16 comprobados;iniciado1vez con el mismo
perfil Cloud/Development/dev-client/LAN8081,env LOCAL intacto por hash. Loopback/LAN,
manifiesto y bundle Android200,código corregido presente,0 errores de diagnóstico. Operador
con marcador nuevo de único intento;supervisor registra solo categorías técnicas/salida,
sin consola cruda ni secretos. No otros servicios operados. Conservar esta instancia.
Resultado ignorado metro-startup-ready.json y metro-startup-diagnostics.json. APK en frío
y retorno físicos NO verificados. No afirmar fallo nativo ni aceptación por tests. Ahora:
Reload JS del APK existente→cerrar desde recientes/abrir3veces→segundo plano/retorno;
esperar carga visible y luego login o error con Reintentar (15s),sin blanco ni ruta perdida.
Sin Cloud/LOCAL/datos/37reservas/log/instalaciones/APK/Git writes/rediseño;007 sigue5/6.

**Último bloque — perfil cloud-integration preparado y Metro activo; espera acceso del usuario:**
Autorizado solo el Google existente,hasta2 sesiones Web/Android y un perfil propio si falta;
sin barberías,membresías ni otros datos. Lectura previa Cloud:1 usuario/identidad Google,
0 perfiles/shops/membresías/reservas;Auth settings200/google=true. Ningún login ejecutado
por Codex. Puerto8081 libre/sin otros Metro comprobado;se inició1vez Development/LAN con
env Cloud exclusivo del proceso,EXPO_NO_DOTENV=1 y sin claves públicas LOCAL heredadas.
.env.local intacto por hash;operador/perfil públicos ignorados cloud-integration-runtime.mjs
y cloud-integration-profile.json. Metro200,/sign-in200,manifiesto Android200;bundles Web/
Android200,clave Cloud presente/LOCAL ausente/variables inlined. No APK/reinicio adicional.
Corrección mínima google-auth-check-gate.tsx:en modo integrado no monta el diagnóstico
Auth-only ni lee su selección previa,evitando secuestrar callback/login normal. RED2→GREEN2
Web/Android;51 pruebas dirigidas incluyendo entorno/transporte/perfil nuevo/reutilizado,
Google y correo/login/logout con dobles;TypeScript/core,lint,formato,arquitectura0.
Pendiente usuario:Web /sign-in→Google→completar perfil una vez si falta→F5→logout;
Android APK Metro192.168.0.16:8081→login normal Google→mismo perfil sin formulario→segundo
plano/retorno→logout. No solicitar tokens ni repetir Auth-only. Después consultar conteos
Cloud con solo lectura para acreditar1 identidad/1 perfil y0 membresías;no afirmar roles.
007 sigue5/6;no cierres003/004/005. No Cloud config/Edge/SQL,LOCAL37reservas,log,instalaciones,
APK,limpieza,staging/commit/push ni rediseño. No segundo Metro ni reinicio sin nuevo permiso.

**Antecedente — transición Edge1→2 validada; CORS/resumen verificados:**
Autorización limitada al verificador local y lecturas. configure-cloud-cors.mjs permite
solo el modo verify y la transición exacta de las4 funciones v1→v2; exige identidad,
entrypoint,ACTIVE/JWT=true/import_map=false,metadatos estables y fuentes íntegras.
7 regresiones nuevas RED→GREEN y7 de huellas aprobadas (14 total). Nueva descarga API
comparó11/11/25/27 TS con la revisión observada y el código auditado:0 diferencias.
107 comprobaciones incluidas38 peticiones HTTP aprobadas:localhost8081 OPTIONS204 con
ACAO exacto/Vary Origin;4 orígenes ajenos OPTIONS403 y POST ajeno403 sin ACAO;sin sesión
y JWT inválido401. El gateway devuelve ACAO '*' en su error401 por JWT inválido,como en
las pruebas previas;no concede acceso ni sustituye la política exacta de los handlers.
Las2 variables ya aplicadas coinciden con sus valores autorizados y las7 huellas previas
permanecen iguales. Esquema/permisos/Google/Auth/config/datos preservados;sin sesiones.
Resumen habilitado por configuración y cerrado sin identidad;consulta autenticada y
aceptación física de negocio Cloud siguen pendientes. Mail administrativo externo off.
Resultado ignorado cors-config-verified.json;prueba de fuentes cors-config-v2-integrity.json.
Parada previa archivada cors-config-version-stop.json;primer baseline/parada inválidos
conservados. No se repitió secrets set ni hubo deploy/reinicio/cambios remotos.
Siguiente permiso:activar perfil separado cloud-integration y autorizar sesiones Google
Web/Android y creación/consulta del perfil propio de aplicación,sin datos de negocio
adicionales ni traslado LOCAL. Metro solo si se autoriza operación concreta necesaria.
No LOCAL37reservas/Metro/log,instalaciones,APK,limpieza,staging/commit/push ni rediseño.

**Último bloque — CORS/resumen autorizado, detenido ANTES del cambio:** preflight9checks
y7 pruebas servidor aprobaron;2 variables ausentes registradas. Guarda previa a secrets
set falló OTHER_SECRET_VALUES_CHANGED;no attempt/applied/env ni cambio Cloud. Diagnóstico
CLI3.1 devuelve name/value/updated_at(no digest);value tiene forma hex64. Comparador leyó
digest:undefined y JSON omitió la propiedad;falso positivo al comparar baseline leído.
No corregido/repetido según condición de parada. Variables siguen ausentes,resumen off.
También audit.mjs histórico usó digest inexistente:su hash acreditaba nombres,no valores
de secretos. Conservar esa limitación,sin atribuir comparación de valores retroactiva.
Pedir permiso para corregir solo lectura/normalización de huellas en audit.mjs y
configure-cloud-cors.mjs,añadir regresiones,tomar baseline válido y ejecutar por primera
vez las2 variables si pasa todo. No nuevos cambios Auth/Edge/SQL/cliente/datos autorizados.
Diagnósticos ignorados cors-config-diagnosis-*.json,parada cors-config-stopped.json y
quickstart007. LOCAL37reservas/Metro/log intactos,sin sesiones/redeploy/instalaciones/APK/
staging/commit/push;no rediseño. Integración normal Google sigue pendiente.

**Última ejecución — 2 Edge Cloud desplegadas autorizado16/11:** preflight103 checks,
destino16 migraciones/catálogo/datos intactos y31 dependencias RPC presentes. Paquetes
aislados con28/30 módulos importados y JWT=true;CLI deploy por API (sin Docker/prune),
solo barbershop-operation y luego reservation-command,ACTIVEv1/verify_jwt=true.30 pruebas
dirigidas servidor/tipos/lint/arquitectura aprobados;14 peticiones HTTP seguras:OPTIONS
sin Origin204,POST sin sesión401,JWT malformado401;OPTIONS/POST con localhost8081 y
origen ajeno403 por allowlist vacía,sin ACAO de handler. El error público401 del gateway
JWT trae '*',sin negocio;no se modificó JWT/gateway. Las2 Edge002 intactas,v1/JWT. Huellas
Auth/Google/config/digests y esquema/datos idénticos;sin sesiones/JWT reales o escrituras.
No LOCAL37reservas/Metro/log operados. Resultado ignorado edge-deploy-complete.json;
quickstart007 actualizado. Siguiente permiso preciso:solo BARBERIA_ALLOWED_ORIGINS=
http://localhost:8081 y BARBERIA_ENABLE_PROFESSIONAL_SUMMARY=true en Cloud nuevo,con
pruebasHTTP sin datos. No admin-mail/Resend,Auth,cliente o Metro autorizados todavía.
Después activar perfil cloud-integration y sesiones/perfil propio con permisos separados.
Sin instalaciones,APK,reinicios,limpieza,staging/commit/push ni rediseño.0075/6 y demás
progresos sin cierres ficticios;integración Google→negocio física todavía pendiente.

**Última ejecución — 011/Cloud bloque4 COMPLETO autorizado:** SQL definitivo coincide
con ambos contratos011,solo CHECK ampliado/tabla privada/13 funciones nuevas/1 envoltura
reemplazada/1 trigger. Preflight819 checks,historial15 sin deriva;17 pruebas locales
aprobadas. CLI aplicó1vez20261115230134 con dry-run exacto0seeds/roles/skip-vault.
Final981 checks read-only:historial16,20 tablas RLS(14public/6private),80 funciones,
16políticas/4triggers;tabla nueva vacía,0 datos/avisos. CHECK válido,trigger contextual,
firma/ACL del wrapper compartido y private.booking_command para barberos preservados;
wrapper DEFINER según contrato,8 RPC nuevas+wrapper solo service_role,5 auxiliares cerradas.
Confirmador antiguo bloqueado;Google/Auth/identidad/JWT/config/digests/Edge ACTIVEv1 intactos.
Sin fallos nuevos. SQL002–011 completo;E2E Cloud sigue pendiente. Resultado ignorado
stage04-complete.json y quickstart007. No Edge/CORS/Auth/cliente/LOCAL37reservas/Metro/log
operados. Siguiente permiso:crear solo barbershop-operation y reservation-command Cloud,
configurar origen exacto localhost8081 y flag de resumen;sin Mailpit/admin-mail Cloud.
Después perfil cloud-integration/Metro si hace falta y sesiones/perfil propio con permisos
separados. Ninguna de esas acciones autorizada aún. Sin cierres ficticios:0075/6,
00327/36,00428/34,00511/12;sin instalaciones,APK,reinicios,staging o commits.

**Última ejecución — bloque3 COMPLETO autorizado:** preflight Cloud379 checks,historial12
y hashes/catálogo sin deriva;verificador16 pruebas locales aprobadas. CLI aplicó1vez por
archivo20261115171232 (749 checks),20261115203629 (795),20261115210802 (966 finales),
con dry-run exacto0seeds/roles/skip-vault y verificación completa entre pasos. Historial15,
19tablas RLS(14public/5private),67funciones/16políticas/3triggers;2 tablas nuevas vacías,
18funciones nuevas (11RPC service_role/7 auxiliares cerrados). Sin backfill/datos escritos.
Objetos/ACL/datos anteriores preservados,confirmador antiguo cerrado. Reprogramación
solo cambia campos temporales del mismo registro;preserva pago/atención/precio/servicios,
con historial/locks/idempotencia según cuerpo SQL desplegado verificado. No prueba de
escritura Cloud con datos:requiere permiso posterior y Edge. Google/Auth/config/digests/
Edge ACTIVEv1/JWT intactos;no Edge/CORS/cliente activados. Sin fallos nuevos,LOCAL37
reservas/Metro/log protegidos. Resultado ignorado stage03-complete.json y quickstart007.
Siguiente permiso independiente:011/20261115230134_team_professional_summary.sql;después
Edge/config/cliente/datos con permisos separados. No bloques posteriores autorizados ni
cierres ficticios:0075/6,00327/36,00428/34,00511/12. Registros inferiores históricos.

**Preparación vigente — bloque3 NO autorizado para aplicar:** lectura Cloud confirmó
destino nuevo,historial12 y catálogo idéntico al cierre2;Google/Auth/config/digests/Edge
sin deriva. Revisados20261115171232→20261115203629→20261115210802:18 funciones nuevas
(11RPC service_role/7 auxiliares privados cerrados),2 tablas privadas vacías con RLS,
sin políticas/triggers nuevos ni cambios de filas al aplicar. Compatibles con reservas,
atención/pagos;confirmador antiguo sigue cerrado. Preparación offline120 checks y hashes
en stage-03/manifest.json executionAuthorized=false. Proponer permiso solo esos3 SQL,
aplicar uno por uno con verificaciones y parada ante fallos. No repetir734 ni activar
011/Edge/CORS/Auth/cliente/datos por esta preparación. Ver quickstart007. LOCAL37reservas,
Metro/log protegidos;sin instalaciones,APK,staging,commits o cambios de servicios.

**Última ejecución — bloque2 COMPLETO tras reanudación autorizada:** extracción local
corregida solo para preservar comentarios del cuerpo SQL original;3 regresiones nuevas
RED→GREEN y12 pruebas locales aprobadas, sin quitar guardas. Primera20261114224344 ya
registrada, NO reaplicada;validación completa498 checks. Después20261115030159 (515),
20261115033925 (540),20261115151745 (734): cada una aplicada1vez con dry-run exacto y
verificación completa antes de continuar. Historial12,17 tablas RLS(14public/3private),
49 funciones/16políticas/3triggers;6 nuevas tablas vacías y0 datos escritos. Confirmador
antiguo público/privado sin EXECUTE PUBLIC/anon/authenticated/service_role;vía pagada y
cancel/care solo service_role según contrato. Auth Google/identidad/config/digests/Edge
ACTIVEv1/JWT intactos. No fallos nuevos;primera parada preservada stage02-first-stop.json.
No Edge,CORS,cliente,LOCAL37reservas,Metro/log operados. Resultado ignorado stage02-complete.json.
Siguiente permiso independiente:20261115171232/20261115203629/20261115210802;después011
y Edge/config/cliente con autorizaciones separadas. No otros bloques autorizados,0075/6;
00327/36,00428/34,00511/12 sin cierres ficticios. Ver quickstart007;registros inferiores históricos.

**Última ejecución — bloque2 autorizado, detenido tras1/4:** preflight Cloud219 checks,
historial8 sin deriva, Auth/huellas intactas. CLI aplicó1vez20261114224344, dry-run exacto,
0seeds/roles/skip-vault. Historial9,14tablas/38funciones/16políticas/2triggers,3 nuevas
tablas vacías. Verificación detenida FUNCTION_BODY_private.reservation_confirm: modelo
local quitó1 comentario interno del SQL; diagnóstico del snapshot demuestra cuerpo remoto
idéntico al original aprobado. Falso positivo del verificador,validación completa pendiente.
No corregido ni continuado; pasos20261115030159/20261115033925/20261115151745 NO aplicados.
Pedir permiso para corregir solo extracción exacta del cuerpo, revalidar todo paso1 y luego
continuar2–4 si aprueba. NO reaplicar primera ni reparar/borrar automáticamente. Auth Google,
config/digests/Edge intactos. Revocación confirmador antiguo pendiente de005; Edge/cliente
sin activar. LOCAL37reservas/Metro/log protegidos, sin operaciones. Diagnóstico ignorado
.artifacts/007-cloud-auth/stage02-diagnosis.json y quickstart007; registros inferiores históricos.

**Preparación siguiente — bloque2 pendiente de autorización:** relectura Cloud confirmó
historial8 y catálogo idéntico al cierre1; Auth Google/config/digests/Edge preservados.
Revisión exacta20261114224344→20261115030159→20261115033925→20261115151745:
6 tablas RLS,3 políticas,18 funciones y1 trigger; revoca confirmación sin método de
service_role al final. Manifest ignorado stage-02/manifest.json executionAuthorized=false;
130 checks de preparación y11 pruebas de servidor con dobles aprobados, incluidas2 nuevas
regresiones de RPC pagada y rechazo seguro legacy. Tipos/lint/arquitectura aprobados.
No migraciones/Edge/cliente activados; preservar órdenes de despliegue y permisos separados.
Al autorizar, revalidar baseline/hashes, aplicar una por una y comprobar ACL/historial/huellas;
no usar las pruebas estáticas como evidencia de operación Cloud. Detalles en quickstart007.

**Última ejecución — Cloud bloque1 COMPLETO, reanudación autorizada:** verificador local
corregido solo para identificar tipo public abreviado mediante OID/esquema/nombre/posición;
6 tests locales positivos/negativos,ninguna guarda de seguridad retirada. Segunda migración
validada por completo513 checks;historial confirmó las dos primeras,no se reaplicaron.
20261114220827 revisada/hash auditado,aplicada1vez con dry-run exacto0seeds/roles/skip-vault.
Final515 checks read-only:historial8,btree_gist,8tablas nuevas vacías RLS/8políticas/2triggers,
24funciones nuevas(31 total). Tercera solo cambió cuerpo booking_catalog,firma/ACL intactas.
IdentidadGoogle/Auth,3tablas originales/objetos,Edge ACTIVEv1/JWT,config/digests preservados.
Sin nuevascuentas/datos,LOCAL/37reservas/Metro/log/cliente/CORS operados. Ningún bloque
posterior autorizado. Siguiente permiso separado:20261114224344/20261115030159/
20261115033925/20261115151745 (reservas/agendas/cancelación/pagos),6tablas nuevas/RLS,
3políticas/18funciones/1trigger y revocación del confirmador sin método de service_role.
Mantener Edge/cliente desactivados hasta futuras autorizaciones/verificaciones.0075/6,
00327/36,00428/34,00511/12 sin cierres ficticios. Ver quickstart007 y manifest ignorado
.artifacts/007-cloud-auth/stage01-complete.json. Detención inferior es histórica.

**Última ejecución — Cloud bloque1 autorizado, detenido tras2/3:** destino/hashes/cinco
versiones002 revalidados. CLI aplicó una vez20261114195018 (304 checks de lectura aprobados)
y una vez20261114202045. Historial7 versiones,btree_gist,8 tablas vacías RLS/8 políticas,
2 triggers y24 funciones nuevas(31 total). Segunda verificación detenida por comparación
textual de firma:PG muestra `i staff_invitations`,fuente `i public.staff_invitations`.
Diagnóstico read-only confirmó mismo OID/esquema public/1 argumento;falso positivo del
verificador,no error SQL demostrado. No se corrigió ni reanudó,según condición del usuario.
20261114220827 NO intentada. Se necesita permiso para corregir verificador local por
identidad de tipos,terminar checks2 y aplicar solo3 si pasan. NO reaplicar1/2,repair ni
revertir tablas. Auth Google/huellas y3 tablas originales/objetos intactos;Edge ACTIVEv1/JWT,
config/digests idénticos. Sin datos,LOCAL/37reservas/Metro/log/cliente/Edge/CORS operados.
Detalles en quickstart007;diagnóstico ignorado .artifacts/007-cloud-auth/stage01-diagnosis.json.
Otros bloques siguen sin autorización;0075/6 y demás estados sin cambios. Sección inferior
describe la auditoría anterior a estas dos aplicaciones.

**Último bloque — auditoría Cloud de lectura:** CLI confirmóvuoncrtkkkquvddunrxx/sa-east-1
ACTIVE_HEALTHY,PG17.11. Exactamente5 migraciones002/sentencias coincidentes y7 funciones
coincidentes/search_path vacío;3 tablas RLS/5 políticas,0 perfiles/barberías/membresías,
1 usuario Auth/1 identidadGoogle.11 SQL nuevos sin colisiones:17 tablas,73 funciones,
2 reemplazos,11 políticas,4 triggers;btree_gist1.7 disponible,no instalado. Compatibilidad
estática,no SQL aplicado. ensure-profile/create-barbershop ACTIVEv1/JWT:fuentes coinciden
salvo auxiliar local usado por nuevas Edge;no necesitan redespliegue. Faltan solo2 Edge
nuevas. Bloqueo Web actual403:BARBERIA_ALLOWED_ORIGINS ausente,OPTIONS/POSTlocalhost8081
rechazados;sin Origin401. No corregido. Google/redirects conservados;faltan redirects
reset-password para recoveryCloud (permiso aparte). Cotejo final huellas/esquema/Auth/
Edge/secret digests/config idéntico. Snapshot ignorado .artifacts/007-cloud-auth/.
quickstart007 contiene etapas/recuperación;stage-01 preparado(solo5base+3catálogo),NO
ejecutado. Solicitar permiso específico para3SQL/extension8tablas/RLS/2triggers/24funciones;
sin Edge/config/datos/cliente en ese primer bloque. Código independiente cerró bypass del
gate en producción:RED→GREEN,51 pruebas dirigidas/tipos/lint/formato/grafo0. No Cloud
escrito,LOCAL/37reservas/Metro intactos.007 sigue5/6 y demás estados sin cambio.

**Último bloque007 — integración normal preparada, NO activada:** modo Development
cloud-integration en registration-environment/runtime, revisión operativa20261115230134,
URL y clave CLOUD propias sin fallback LOCAL. Mismo SDK y transporte de origen fijo
Auth/REST/RPC/Edge; perfil requerido antes de ready y contexto por membresía. Google normal
limpia el fence retirado del diagnóstico. Solo .env.example cambiado, no .env real/Metro.
7 RED nuevas→GREEN,2 regresiones runtime;68 pruebas dirigidas aprobadas, tipos/lint/grafo0.
Inventario/alcances de despliegue en quickstart007:11 SQL posteriores002,17 tablas/RLS,
2 Edge nuevas y revisión/sincronización de2 existentes, CORS/JWT; no se ejecutó nada de ello.
Invitaciones Cloud siguen desactivadas sin proveedor externo autorizado; Mailpit no sirve
en Cloud. Faltan permisos de esquema/Edge/config/activación y datos del recorrido normal
(hasta2 perfiles,0 membresías/barberías/reservas; segunda cuenta controlada por identificar).
No repetir Google aislado, no copiar37 reservas ni sesiones, no crear cuentas por rutina.
0075/6 y demás estados sin cambios. Gate de revisión es liberación operativa, NO salud o
autorización de negocio: verificar servidor/ACL Cloud antes de activarlo. Sin rediseño.

**Última evidencia007 — Auth Cloud aislado aceptado en Web/Android:** pruebas manuales
del usuario, no de Codex. Web Google real: PKCE/identidad/sesión true, persistencia tras
3 F5 y cierre remoto true. Android APK existente: formulario corregido permanece abierto,
login Google correcto, PKCE/identidad/sesión true, persistencia al salir a otra app y
volver, cierre remoto true. No repetir ni crear sesiones adicionales por esta evidencia.
007 permanece5/6: T006/SC002 incluyen perfil propio y cuenta existente sin duplicación;
el diagnóstico Auth-only no los consulta ni valida negocio/membresías LOCAL. Siguiente
decisión: entorno común para Auth y negocio, con permisos separados para cualquier
activación/despliegue o datos necesarios. No mezclar tokens Cloud/LOCAL.00327/36,00428/34,
00511/12,008/0096/7,0107/8,0117/8 sin cierres nuevos. Solo documentación actualizada;
37 reservas y servicios protegidos sin operaciones. No rediseñar. Bloques inferiores históricos.

**Corrección posterior007 — formulario Android:** usuario acreditó Web Google real:
login/PKCE, persistencia F5 y cierre remoto confirmado. Metro iniciado una sola vez con
autorización, Development/LAN8081; no volver a iniciarlo. Android salía de setup antes
de OAuth: gate desmontaba navegador, Expo Router58 NAVIGATOR_UNMOUNTED reinicializaba
ruta y setup volvía a LOCAL. Corregido manteniendo rama de navegación montada/oculta
durante entrada de clave; al activar Cloud se retira LOCAL completamente. Regresiones
RED2→GREEN2, Android bundle200; sin errores JS registrados en logs Metro, sin adb para
diagnóstico nativo directo. Falta validar el arreglo en el teléfono y OAuth Android.
Autorización vigente de1 identidad Google/hasta2 sesiones: Web ya realizada por usuario,
Android aún no iniciada. No repetir Web ni crear sesiones adicionales. Conserva datos,
Cloud/LOCAL aislados y0075/6. El bloque inferior describe la preparación previa.

**Preparación Google Auth Cloud aislado:** usuario configuró Google
Cloud nuevo/proveedor/redirects y Gmail de prueba manualmente. Lectura CLI verificó
app-barberia-arquitectura/vuoncrtkkkquvddunrxx/sa-east-1 y publishable; Auth settings200,
google=true. No se inició OAuth ni se creó identidad. Nuevo perfil DEV /auth/google-test
(Android: Base técnica → Preparar prueba Google Cloud aislada), namespace propio y gate
anterior al runtime LOCAL. Solo Auth del Cloud nuevo; REST/RPC/Edge/LOCAL bloqueados por
transporte, sin perfiles ni membresías. Callbacks tardíos Cloud bloqueados para LOCAL;
producción no puede activar la prueba. Config pública ignorada en
.artifacts/007-cloud-auth/public-config.json, no secretos OAuth ni cambios .env.
Faltan autorización concreta de Gmail/alta Auth (máximo1 identidad y2 sesiones Web/Android)
y pruebas reales. Metro no respondió en8081; no se operó. No iniciar sin autorización.
007 sigue5/6;00327/36,00428/34,00511/12 y datos conservados. Ver quickstart007.

**Último bloque15/11 —011 real acreditado,7/8:** usuario autorizó escenarioC; completado
con118 comprobaciones HTTP/JWT/SQL/Mailpit y2 carreras observadas en2 conexionesPG.
Solo2 administradores ficticios nuevos de A, verificados sin dependencias de credenciales
anteriores ni participación directa en2 reservas manuales. Cada contraseña se regeneró
una vez mediante Auth y se mantuvo solo en memoria; no hay archivo para futuros logins.
Conjunto conservadoC:1 shopdraft/booking_settings,2 membresías,5 invitaciones(4admin/1barber),
4 metadatos y exactamente4 avisos reales Mailpit,0 externos.0 cuentas/servicios/profesionales/
reservas nuevos. Los37 registros y dependencias previos, membresías/invitaciones originales
y filas public/private idénticos. Nueva membresía emisorC restaurada exactamente tras
revocación temporal; destinatarioC pasó barber→administrator por aceptación validada.
Caducidad7d comprobada con desplazamiento autorizado solo de created_at/expires_atI1
8d atrás; no reloj/SQL alterados. Creación/aceptación concurrentes idempotentes200/200,
una membresía/invitación/aviso; rechazo/cancelación/renovación y compatibilidad004 correctos.
IDs/checklist/messageIds ignorados .artifacts/011-invitations/manifest.json; no repetir
ejecutor, preparar otro conjunto, enviar correos o limpiar sin permiso. T007 cerrada;
Los baselines exactos de B eran previos aC: no usar igualdad de totales para confundir
sus altas autorizadas con daño. El manifest011 coteja preservación de cada fila anterior.
T008 física pendiente. Mailpit NO acredita Gmail. Google007 conserva5/6: guía revisada
con docs oficiales y14 pruebas dirigidas OAuth/config/UI aprobadas con dobles/SDK sin
Google externo. Aún requiere proveedor/cuentas Cloud autorizados y perfilJS Cloud-Auth
aislado(Development sigueLOCAL). Ningún servicio/Cloud/Metro/Git write operado en este bloque.
00327/36,00428/34,00511/12,008/0096/7 y0107/8 conservados. No rediseñar.

**Histórico inmediatamente anterior — A y B:**

**Bloque vigente15/11 — A y después B ejecutadas con autorización:** motor Docker recuperado
manualmente por usuario. GoTrue/Edge detenidos255; diagnóstico confirmó GoTrue quería
172.19.0.2, ahora de Kong. Con permiso adicional se desconectó/reconectó SOLO GoTrue a
172.19.0.8/aliasauth y se inició una sola vez. Auth200 y resolución DNS desde Kong; luego
un único inicio Edge,204. Imagen/variables/JWT/SMTP/volúmenes/puertos iguales. Backups y
otros contenedores intactos. Estado/operaciones ignorados .artifacts/008-011-network.json.
No repetir reparaciones/inicios sin permiso. Actualizar esta IP si vuelve a cambiar.

A: conjunto008–010 nuevo autorizado4 cuentas/perfiles,2 shops,4 membresías,2 perfiles
profesionales,2 servicios/vínculos,2 settings de cada tipo y8 reservas/detalles/care.
155 comprobaciones conjuntas reales;10 pares concurrentes observados en2 conexiones PG
cada uno,201/409 con replay200/rollback del perdedor/pagos cash-Yape conservados. Nombre
nuevoA restaurado/B intacto; membresía nueva revocada con JWT vigente y restaurada exacta;
horarios/bloqueos/versiones/conflictos, políticas/motivos/estados/historial acreditados.
Final14+14 intervalos,0 bloqueos remanentes;13 eventos reprogramación,9 reserva y15 care.
Se conservan los8 registros nuevos,2 manuales intactos y29 anteriores/dependencias iguales
(37 total). El primer ejecutor falló por timestamps sintéticos de microsegundos; corregido
solo el ejecutor a milisegundos y retomado sin repetir prepare/carreras. Para continuar se
regeneraron credenciales SOLO de sus4 cuentas nuevas, por Auth y en memoria. Ninguna clave
guardada; manifest sin secretos .artifacts/008-010/manifest.json. No recrear ni limpiar.
0086/7,0096/7,0107/8: físicos pendientes, flags cliente siguen opt-in inactivos.

B posterior: migración CLI20261115230134_team_professional_summary aplicada SOLO LOCAL54422:
1 tabla privada vacía RLS,5 auxiliares,8 RPC service_role,1 trigger y envoltura antigua
actualizada. Compilación con rollback,88 checks estructurales y16 HTTP reales/JWT correctos;
todas las filas/columnas/políticas previas a B iguales. Resumen propio activo por Edge;
lista propia/saliente y denegaciones probadas. Conexión SOLO barbershop-operation montado,
guardia de proyecto/API/DB y ausencia de deploymentCloud, Mailpit preparado. Sin variables
del contenedor cambiadas/reinicios en B; NO se crearon invitaciones ni enviaron mensajes.
Reversión revisable ignorada .artifacts/011-reversal-reviewed.sql NO ejecutada; no revertir
si se crean datos sin revisar dependencias.0116/8: T007 sigue por escrituras/caducidad/
carreras/SMTP reales no autorizados, T008 físico. Gmail NO acreditado. Google externo sigue
sin configurar.00327/36,00428/34,00511/12 conservados. Sin rediseño/Git writes/Cloud.
Calidad final:19 cliente/UI/guardas+28 servidor aprobadas; tipos cliente/servidor,
Deno check de ambos Edge, lint/formato y ambos grafos0. Sin secretos detectados en los
archivos del bloque; diff global2 exclusivamente log activo,0 al excluir solo ese log.

**Histórico anterior — preparación011, antes de autorizar A/B:**

**Bloque vigente011,15/11 — código preparado sin activar:** usuario aprobó invitaciones
de administrador solo a cuentas existentes/confirmadas, aceptación/rechazo autenticados
y caducidad7 días por reloj servidor. Correo notifica, nunca concede acceso. Implementados
dominio/aplicación, adaptadores RPC y SMTP Mailpit/Resend, UI compartida en Personal y
composición opt-in. Reutiliza staff_invitations/membresías; barberos conservan flujo.
Entrega posterior al commit con claim único; sent significa aceptación del proveedor,
no lectura. Resultado incierto no autoriza reenvío automático. Resumen RF20 propio diario
por barbería/fecha Lima con estados de atención reales y legado sin inventar; sin ingresos.
Los dos borradores SQL están en specs/011-equipo-resumen-profesional/contracts/ y NO se
aplicaron: admin amplía CHECK, metadata RLS privada, RPC/guardia y despacho de aceptación;
resumen agrega solo funciones. Flags nuevos cliente/servidor false/ausentes. No variables
privadas cambiadas, Edge actualizado en ejecución, correos enviados ni fixtures creados.
23 pruebas nuevas y59 regresiones dirigidas aprobadas(58 cliente/UI+24 servidor), tipos,
lint/formato y ambos grafos0. SMTP/Resend usan dobles y SQL estático; no atribuirlos a pruebas
reales.0116/8: T007 activación SQL/HTTP/SMTP y T008 físico pendientes. Spec Kit apunta011.
Lectura de metadatos confirmó29 reservas y CHECK original de rol; ninguna fila modificada.
Continuación: dos regresiones RED→GREEN del adaptador Resend(rechazar redirects y no
marcar sent con ID vacío),26/26 servidor y gates técnicos aprobados. Sin envío externo;
Gmail sigue sin acreditar. Autorizaciones A(conjunto008–010) y B(activar011 sin datos/
correo) presentadas por separado; NO concedidas por esta preparación.

Preparado en specs/010-reprogramacion-reservas/quickstart.md el conjunto aislado solicitado
008–010:4 cuentas/perfiles,2 shops,4 membresías,2 profesionales de una persona,2 servicios/
vínculos,2 settings de cada tipo,14 intervalos generales y14 profesionales iniciales(finales
iguales, máximo15 simultáneos),2 bloqueos y8 reservas/detalles/care. Dos reservas intactas
para físico. Sin invitaciones;011 se autoriza aparte. NO crear aún ni tocar los4 perfiles
protegidos/29 reservas: falta permiso específico para este conjunto y sus operaciones.
00327/36,00428/34,00511/12,008/0095/7 y0105/8 conservados. Google/proveedor y aceptación
física continúan pendientes. Sin staging/commit/push, servicios, instalaciones o rediseño.

**Histórico inmediatamente anterior —008/009/010:**

**Bloque vigente008/009/010,15/11:**008 permanece5/7: inspeccionados4 profesionales, todos
ligados a conjuntos conservados/29 reservas. Usuario decidió NO editar sus nombres ni
incrementar versiones; no se escribió ningún perfil.009 permanece5/7, pero backend ya
aplicado: migración CLI20261115203629_own_professional_schedule,5 funciones;25 checks ACL/
search_path y11 HTTP reales con JWT existentes aprobados. Todas las filas public/private,
columnas y RLS iguales;29 reservas intactas. Faltan escrituras/carreras/revocación y físico009.
Inicialmente Docker CLI no conectaba; luego Auth200/PG activo confirmados, Edge detenido255.
Tras diagnóstico, único docker start autorizado de Edge existente correcto, sin recreación
ni otros servicios operados. Conexión009 en composición directa, sin variables ni segundo
inicio; HTTP propio200/ajeno403/forjado400/sin JWT401/preflight204/RPC directa403. Primer
intento de migración revertido por escape del operador JS, corregido; ver tasks009. No reparar
historial previo ni usar db push general. Operador ignorado .artifacts/009-activate.mjs;
no repetir inspect/apply/start por rutina. Cliente009 sigue flag opt-in, Metro intacto.

010 RF18: cliente/Mis reservas, personal/agendas, editor administrativo de antelación,
historial, puertos/adaptadores/handler y SQL implementados. Solo fecha/hora; conservar
id/profesional/servicios/precio/pago. Antelación configurable120min sobre inicio actual,
sin límite de cantidad. Excepción aprobada: administrador activo o barbero asignado
activo con motivo obligatorio fuera del plazo; dentro opcional. Bloquear canceladas/
atención iniciada/completada/no-show. Migración CLI20261115210802_booking_reschedule
autorizada/aplicada LOCAL54422:2 tablas privadas vacías,5 auxiliares cerradas y5 RPC
service_role/search_path vacío.68 checks estructurales y13 HTTP reales de lectura/rechazo
aprobados, incluida compatibilidad care. Todas las filas/columnas/RLS previas iguales;
29 reservas intactas. No se invocó reprogramar ni set-policy ni se crearon fixtures.
Conexión reservation-command sin variables/reinicio adicional; UI sigue opt-in false.
Escrituras/límites/motivos/estados/carreras/rollback/idempotencia reales y físico pendientes:
no cerrar T005/T006/T008 de010 por lecturas. Usuario no autorizó probar sobre29 existentes.
Operador ignorado .artifacts/010-activate.mjs y baseline010-before.json; no repetir apply/
inspect por rutina. Baseline009 global es anterior a las2 tablas010; usar010 para cotejar
filas previas, no interpretar la adición autorizada de tablas vacías como daño de datos.
73 pruebas dirigidas actuales(56 cliente/UI+17 servidor), tipos/lint/formato y grafos0;
SQL estático/dobles no demuestran nuevas escrituras PostgreSQL. Spec Kit setup-plan/tasks/
check-prerequisites ejecutados, puntero010. Google: guía concreta quickstart007, sin cambios
externos.00327/36,00428/34,00511/12 conservados;008/0095/7 y0105/8, sin cierres físicos ficticios.

**Histórico anterior al bloque vigente:**

**Activación008 autorizada y horarios009 preparados15/11:** migración CLI
20261115171232_own_professional_profile aplicada SOLO LOCAL54422 en transacción, registrando
su versión.2 RPC públicas service_role y1 privada cerrada; ACL/search_path verificados,
lecturaRPC200 (actor de servidor, no JWT de usuario), HTTP401 sin/inválido y204 preflight.
Edge activo con bind mount de fuentes/per_worker, sin reinicios/recreación. Huellas de29
reservas, detalles, perfiles, profesionales, membresías, settings y care/eventos iguales.
Ningún dato de negocio modificado. T006008 permanece abierta por pruebas de escritura y
JWT/A-B/revocación, T007 por E2E. Flag cliente008 real no modificado. Operador ignorado
.artifacts/008-activate.mjs y baseline008-before.json; nunca repetir apply/inspect por rutina.
Historial local omite versiones previas20261115030159/033925/15151745 ya aplicadas en
esquema: NO db push general ni repair sin permiso. Solo versión008 nueva registrada.

009 `specs/009-horarios-profesionales/`: RF22/HU14, intervalos semanales, consulta general/
propia, crear/editar/retirar bloqueos propios, fechasLima/UTC, validación de contención y
concurrencia optimista. Cliente/servidor/UI compartida implementados; SQL schedule.sql
es borrador NO aplicado,5 funciones nuevas y ninguna tabla. SQL deriva profesional con008,
locks settings→membresía→perfil y protege rangos ocupados de citas incluso buffer; prueba
SQL/rollback/carreras real pendiente. EXPO_PUBLIC_ENABLE_SELF_SCHEDULE y
BARBERIA_ENABLE_SELF_SCHEDULE ausentes/false:009 NO habilitado en entorno real, RPC ausentes
confirmadas en lectura. No se creó/aplicó migración009 ni cambió configuración de Edge.
Extraído OperationScope a puerto propio para eliminar ciclo de tipos detectado por checker.
`.specify/feature.json` apunta009. Ver resultados finales tasks009;003/004/005 sin cambios.
Verificación del bloque009 con regresiones:11 unitarias,41 integración/presentación,
13 servidor (65 total), todas0. Tipos/lint/formato y ambos grafos0.0095/7 con código/listo
y permisos/backend real/E2E pendientes;0085/7 con backend aplicado pero escritura/JWT/E2E
pendientes. No confundir lectura service_role con prueba HTTP de identidad de usuario.

Google007: procedimiento concreto en quickstart.md recomienda Auth aislado en Cloud NUEVO
HTTPS, NO túnel público de toda la base local. No se configuró Cloud/proveedor. Falta permiso
para clienteGoogle/proveedor/redirects, perfil de ejecución JS aislado y cuentas controladas;
no mezclar tokens Cloud con negocioLOCAL. No están acreditadas las pruebas físicas.

**Último bloque15/11 — Google007 y perfil profesional008:** código funcional compartido
Web/Android preparado, sin modificar servicios, proveedor o datos.007 reutiliza un SDK
Supabase, PKCE S256, apertura navegador Web/Linking Android, callback003, perfil explícito
si falta y membresías servidor. Intento oauth-pending sobrevive lifecycle normal sin acceso
privado; logout/cancelación descartan intento y limpian verificadores. Sin linkIdentity,
creación paralela de Auth ni fusión por email desde cliente. Botones en registro/login;
EXPO_PUBLIC_ENABLE_GOOGLE false/ausente hasta proveedor autorizado. Google exige callback
Auth válido: HTTP LAN privado no aceptado; aprobar HTTPS estable LOCAL o Cloud nuevo con
configuración separada, sin actuar aún. No APK/dependencias nuevos para el flujo navegador.

Histórico anterior a activación008: consulta y edición exclusivamente de professionalName propio en tenant activo,
sin userId/active/rol/capacidades en payload. Núcleo, adaptadores cliente/servidor y panel
Personal implementados; EXPO_PUBLIC_ENABLE_SELF_PROFESSIONAL false hasta backend validado.
`specs/008-autogestion-profesional/contracts/profile.sql` es SOLO BORRADOR:2 RPC públicas
DEFINER solo service_role y1 privada INVOKER sin EXECUTE directo; locks settings→membresía→
perfil. Requiere permiso para migración LOCAL54422 y actualizar Edge barbershop-operation;
no se ejecutaron. No tablas/RLS nuevas, no se alteran29 reservas/snapshots. Pruebas nuevas
con dobles, no SQL/HTTP real. Autogestión de horarios RF22 sigue pendiente, luego reprogramación.
`.specify/feature.json` apunta a008;00327/36,00428/34,00511/12 conservados. Ver resultados
y gates reales en tasks007/008. Sin recorridos físicos nuevos ni cierres manuales.
Verificación final del bloque:53 unitarias,78 integración/presentación,10 servidor
dirigidas aprobadas; tipos cliente/servidor, Deno check, ESLint/Prettier y ambos grafos0.
0075/6 (proveedor/E2E pendiente),0085/7 (aplicar backend y E2E pendientes).

**Bloque posterior15/11 — propuesta completa:** contrastada copia local limpia de la
propuesta (remote exacto aprobado, HEAD1eb8852388480388f39035641eb87d299def9258).
Google RF02, perfil profesional RF21, reprogramación RF18, favoritos RF08, estilos/imágenes
RF07/09/26/30/31, notificaciones RF39/40, reseñas RF43 y mapas RF44 son obligatorios.
Push no es obligatorio inicialmente; seleccionar estilo es opcional, no su gestión.
Faltan además invitaciones de administradores RF34 y alcance ampliado de RF20/22
(resumen/consultas profesionales y autogestión de horarios; hoy administración).
No declarar finalizado el producto al cerrar003–005. Proveedores y reglas detalladas de
reprogramación/calificaciones/recordatorios/campos profesionales requieren delimitación.

**Implementación independiente006:** `specs/006-perfil-personal/`, RF05/HU04; edición de
nombre/teléfono en Mi cuenta compartida Web/Android conectada a PATCH002 existente.
No sustituye el editor profesional. Validación, deduplicación y descarte de respuesta
tardía/ajena; contexto intacto, logout/denegación retiran acceso. Pruebas dirigidas32
unitarias y43 composición/presentación/rutas aprobadas; solo dobles, ningún dato operado.
Aceptación física006 pendiente para recorrido final; sin migraciones, paquetes o servicios.
`.specify/feature.json` apunta a006; Git conserva main.003/004/005 sin cierres nuevos.

**Última validación recovery:** una cuenta ficticia nueva dedicada, sin perfil ni negocio,
creada por Auth local con autorización; un único correo efectivo Mailpit. Adaptador y SDK
reales: enlaceLAN.16/auth/v1/verify→redirectappbarberia→parser/canjePKCE restringido→
updateUser/clave nueva→logout→login200; clave antigua rechazada.19 comprobaciones reales,
29 reservas intactas. Credenciales nuevas verificadas solo .artifacts/recovery-local/account.json,
no reutilizar cuenta deT019/005. Fallo inicial del ejecutor queueMicrotask ocurrió antes
correo, comprobado; se reutilizó la misma cuenta. Evidencia003/recovery-local-real.json.
Android físico, WebUI y negativos finales aún pendientes;003/004/005 no se cierran por
prueba Node. No repetir correo ni cambiar otra contraseña sin permiso.


**Última operación:** reemplazo reversible únicamente GoTrue autorizado y verificado,
Auth200 loopback/LAN; URLs locales correctas. Ver sección10 y us5-implementacion.md.
Sin correos, claves cambiadas ni datos de negocio operados;003/004/005 conservan sus
gates manuales. No repetir el reemplazo. Las notas inferiores son cronológicas.


**Actualización real005:** T011 cerrada con91 comprobaciones y10 pares concurrentes
HTTP/JWT/SQL,2 conexiones PostgreSQL observadas por par; sin duplicados. Cash/Yape,
atención independiente del pago, no-show10min, reembolso auditado/rollback/idempotencia/
roles A/B/revocación acreditados. Se conserva el conjunto autorizado005:4 cuentas,2
barberías,4 membresías,2 perfiles/servicios y16 reservas; dos manuales intactas.13 citas
anteriores/dependencias preservadas. No limpiar ni recrear. Credenciales y manifest:
.artifacts/005-care/ ignorado; evidencia sin secretos en specs/005-atencion-pagos-manuales/real-tests.json.
Docker responde; Edge nuevo se inició una sola vez con permiso y queda activo;
Auth/REST200,Edge204. Sin otros servicios operados. Corregida deduplicación005 por scope
con6 tests dirigidos/tipos/lint/grafo0. T012 y003/004 manuales siguen abiertas; no pedir
recorridos intermedios. Las notas inferiores son históricas.


**Actualización005 posterior:** código en reservations/domain/care.ts, application/care.ts,
infrastructure/reservation-http-adapter.ts y presentation/care-control.tsx/payment-choice.tsx;
servidor equivalente en _shared/reservations. Migración20261115151745 validada/aplicada
exclusivamente LOCAL54422 con autorización; Edge existente inició una sola vez,204/401.
Huella de13 reservas idéntica;0 ledger/0 eventos nuevos, sin fixtures. Atención y pagos
solo para reservas nuevas con método; legacy permanece sin registro. Código005 habilitado
en Development, producción no activada. Plan/contratos/tasks creados; siguiente: validar filtros
FR014 y pruebas transaccionales/JWT con datos expresamente autorizados, después E2E final.
Check general0:161 unitarias/177cliente/39Deno; cliente adicional179/179, bundles200.
Después del cotejo SQL exitoso, Docker dejó de responder en una nueva inspección; no se
reinició nada. Reconfirmar disponibilidad antes de continuar con DB/HTTP.
No dinero, Cloud, APK, instalaciones o Git writes. El párrafo inferior es histórico.


No había una migración en curso. Último bloque: recovery/cancelación, consolidación
funcional y definición mínima005; rediseño previo conservado, ahora detenido.

- `src/composition/registration-runtime-provider.tsx`, `authentication/presentation/auth-context.tsx`,
  `use-clean-auth-return.ts` y rutas de callback/reset: `replaceState` aislado podía ser
  deshecho por estado inicial de Expo Router. Ahora se preserva history.state y solo se
  sincroniza la ruta canónica después de capturar PKCE/montar navegador, sin segundo canje.
- `src/features/reservations/presentation/cancellation-control.tsx`: generación del ID
  movida dentro de try/finally; si falla antes de enviar, libera busy y permite reintentar.
  Resultado incierto solo tras preparar una solicitud; **no se probó que este fallo causara
  la discrepancia T027**.
- Regresiones en `tests/integration/authentication/registration-runtime.test.mjs`,
  `tests/presentation/ui-refresh.test.mjs`, `tests/presentation/booking/cancellation.test.mjs`.
- Cambios visuales previos en `src/shared/ui/`, pantallas, `account-navigation.tsx` y
  `account-shell.tsx`. Shell conserva montaje durante verificación; no seguir rediseñando.

Siguiente acción segura: revisar el borrador005 con las tres decisiones aprobadas;
seguir plan/contratos/modelo/tasks de Spec Kit y preparar SQL aditivo revisable.
**Solicitar autorización concreta antes de aplicarlo o crear datos.** No inventar tareas
terminadas de005. Independientemente, resolver autorización de URLs Auth para recovery.

## 8. Pruebas y límites

Último check ejecutado antes de esta tarea de contexto: `npm.cmd run check` **exit0**.
157 unitarias,172 integración/presentación,38 checker cliente,45 checker servidor,
18 guardas y36 Deno. Núcleo cliente100% líneas/funciones y94,89% ramas.
Fuente: `docs/evaluacion/evidencias/004-reservas/calidad.md`; salida local ignorada
`.artifacts/functional-check-outside.log` si aún existe. No se repitió aquí.

Comandos reales: `npm.cmd run typecheck`, `lint`, `format:check`, `architecture:check`,
`test:client`, `check:server`, `test:server`; `npm.cmd run check` integra calidad completa.
Preferir pruebas afectadas. El runner seguro `scripts/run-backend-integration.mjs` opera
datos reales en ciertos modos: leer guardas/alcance y obtener permiso antes de invocarlo.
No lanzar prepare/cleanup por rutina.

Limitación Windows: un check en sandbox falló17/18 por EPERM al crear junction temporal;
mismo check fuera de esa restricción pasó completo. No desactivar prueba ni umbral.
Bundles completos Metro Web/Android HTTP200 (`003-autenticacion/us5-bundles.json` bajo
evidencias), no equivalen a build APK ni ejecución física. Codex comprobó navegador con
retorno recovery inválido: URL saneada y rechazo seguro, sin contraseña nueva. No validó
correo real por ello. SQL/JWT/carreras previos están en `004-reservas/atomic.md`,
`agenda.md`, `cancellation.md` y sus carpetas; no repetirlos sin cambio justificado.
Nueve avisos npm moderados,3 sin dev, siguen pendientes; no npm audit fix/force.

## 9. Datos y operaciones protegidas

Conservar conjunto **T019** (3 cuentas ficticias, barberías, servicios, profesionales,
invitaciones y reservas existentes, incluidas las confirmadas manualmente) y **7 reservas
sintéticas de cancelación** con sus estados/eventos. No crear sustitutos ni limpiar.
Otros conjuntos temporales previos T016/T027 de003 fueron limpiados; distinguirlos de
estos datos conservados. Pruebas temporales de roles de agenda/cancelación restauraron
exactamente la membresía; no volver a cambiar roles sin permiso.

Credenciales solo en archivos locales ignorados cuando existen, nunca en documentos,
logs, comandos visibles o chat. No incluir aquí valores ni cadenas de conexión.
Antes de cualquier futura retirada autorizada, cotejar IDs/dependencias; detenerse si
puede afectar datos ajenos. No db reset, eliminación de volúmenes ni limpieza general.

## 10. Bloqueos y autorizaciones

- GoTrue corregido con un único reemplazo reversible expresamente autorizado15/11:
  API_EXTERNAL_URL=http://192.168.0.16:54421/auth/v1 y URLPATHS_CONFIRMATION/RECOVERY=
  /auth/v1/verify. Misma imagenv2.197.0; IP vigente172.19.0.8/aliasauth tras reparar
  colisión con Kong(antes172.19.0.2, ver bloque A/B sección7); issuer/JWT/SMTP/DB/
  site_url/redirects intactos. Salud200 loopback/LAN. Original detenido conservado como
  supabase_auth_app-barberia-002-local_recovery_backup; _t013_backup intacto. No operar
  backups ni recrear stack por rutina. Corrección vigente en el contenedor; IP cambiante.
  Correo/retorno/cambio de clave comprobado por HTTP en cuenta dedicada; falta UI Web/Android
  y negativos finales. Salud o Node no prueban E2E físico.
- Kong tiene ajuste CORS local aislado a `/functions/v1`, reversible/documentado en
  `docs/evaluacion/evidencias/003-autenticacion/t009/`. Reaplicar solo si recreación autorizada
  lo pierde; no tocar Auth/REST ni JWT para resolver CORS. No reiniciar servicios ahora.
- Recovery final requiere autorización para correo/cambio de clave ficticia existente;
  no crear usuarios/repetir registros por iniciativa. Ver `recorrido-integral-final.md`.
- Cloud004, hosting/origen real, HTTPS/CSP/DNS/CDN y carga k6 requieren aprobación/destino/
  herramientas. No atribuir CI/CD publicado a `.github/workflows/quality.yml` local.
- Aplicar esquema005, fixtures, instalaciones, nuevos APK, operaciones EAS/costos o cambios
  de servicios son puntos de autorización específicos, no consecuencia de aprobar reglas.

## 11. Git y preservación entre cuentas

Inspección de esta tarea: **main / 0ccd33c**,121 entradas de status antes de crear estos
archivos, cambios legítimos versionados y nuevos; staging vacío. Número no es inventario
estable: verificar al retomar. Incluye código003/004, SQL004, scripts/pruebas, configuración
Expo/EAS/dependencias y evidencias; no asumir checkout limpio ni revertir trabajo ajeno.
` A` en status puede ser intención de añadir, no confirma contenido staged; mirar cached.

Prohibidos actualmente `git add`, commit y push. Excluir secretos, `.env` privados,
`.artifacts/`, caches, datos PostgreSQL y log activo. `git diff --check` previo: global2
por log activo,0 excluyendo **solo** `docs/evaluacion/evidencias/002-fundacion/t017-serve.log`.
No editarlo para conseguir verde. No convertir este handoff en aprobación de Git.

Otra sesión en **el mismo checkout** verá archivos sin commit. Otra cuenta/máquina NO
recibirá automáticamente este trabajo ni archivos ignorados: coordinar transferencia
segura autorizada antes de ejecutar; Git remoto no refleja cambios locales por sí solo.
No subir credenciales para facilitar continuidad.

## REANUDAR TRABAJO

1. Leer `AGENTS.md` y este documento; Constitución2.0.0 y tareas del bloque pertinente.
2. Verificar rama/HEAD/status y existencia de cambios locales, sin staging; confirmar los
   permisos de la nueva sesión, no reutilizar autorizaciones de servicio/datos automáticamente.
3. Prioridad: completar propuesta posterior sin rediseño; ver bloque006 y requisitos en
   sección7. Conservar conjuntos y gates manuales003/004/005/006. No repetir91 comprobaciones
   de005 ni19 de recovery sin regresión justificada; no crear otro conjunto ni reaplicar SQL.
4. Terminar activación007/008 con permisos concretos: proveedor Google/callback autorizado;
   migración y código Edge LOCAL del perfil propio (solo nombre existente), nunca relajar
   upsert administrativo. Mientras tanto siguiente código: autogestión de horarios RF22;
   reprogramación exige reglas pendientes. No operar GoTrue: URLs ya corregidas/HTTP probado.
5. Pruebas dirigidas por cambio, Web→Android; reservar evidencia física para recorrido
   final. No repetir altas, reservas, correos, invitaciones o cancelaciones acreditadas.
6. Mantener este documento al día solo en secciones cambiadas; sin rediseño, limpieza,
   Cloud, APK, instalaciones, servicios o Git writes no autorizados.
