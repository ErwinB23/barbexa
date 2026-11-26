# Estado de desarrollo — App Barbería

26 nov — Entrega Sprint2 preparada para revisión, no publicada. README raíz e
índice central en `docs/entrega/sprint2/INDICE.md`: cinco entregables, arquitectura,
18SDD, Swagger, pruebas/cobertura, informes y gráficas. Guía de sustentación y
`PUBLICACION.md` con tres commits propuestos (instrumentación→harness→evidencias/docs).
Git sigue main,23commits,a758dfa,índice sin staging. Inventario232 pendientes:
229 propuestos y3QA locales;47/26/156 por grupo. Copias sanitizadas con SHA de fuente,
originales preservados. Revisión de exposición sin secretos reales detectados en
checkout/candidatos;5PDF revisados y rutas privadas ignoradas comprobadas.300logs
históricos ya versionados y metadatos de autor/rutas locales siguen advertidos,
sin reescribir historial. Esta revisión no es nueva auditoría de CVE o de todos
los blobs históricos. SeisEQ cumplidos en alcance y cuatro parciales02/05/08/09;
EQ05 una hora no acredita mes publicado, adaptación requiere aceptación docente;
2.000VU son meta adicional pospuesta. Se reutilizó evidencia, sin repetir pruebas
de carga/E2E/monitor/cobertura ni instalar/operar servicios. Sin staging,commits,push,
producto,Cloud,migraciones ni cambios de Actions. Publicación espera autorización.

26 nov — EQ-05 local una hora consolidado offline: run 8dd877ab, ejecutado
manualmente de 15:27:14 a 16:27:14 Lima. 3.600,003 s, 360 éxitos, cero fallos/sin
datos, disponibilidad/cobertura 100 % y 2.880 HTTP. Flujo: media271,93/p50 267,84/
p95 312,39/p99 346,69 ms. SQL guardado conciliado: 360 medidas +1 preflight, todas
canceladas, cero activas; 19.471 globales, 19.110 anteriores preservadas y cero
violaciones. 18 tablas, 814 archivos y763 hashes históricos verificados. Intento
parcial anterior (128 éxitos/232sin datos) conservado y excluido, sin sumar ventanas.
Informe MD/HTML/PDF, tablas, seis CSV, JSON y3 gráficas PNG/SVG/PDF en
`docs/evaluacion/evidencias/eq05/INFORME.md`; 34 archivos originales con SHA256.
Monitor mejorado solo en presentación dinámica: barra/tiempo/disponibilidad/conteos/
historial;12 tests aprobados y demo simulada <1s, sin nueva observación. AST del
monitor idéntico al medido al excluir solo display; política byte a byte intacta.
EQ-05 parcial integral: hora local acreditada, mes publicado no evaluado y adaptación
pendiente de aceptación docente. Seis EQ cumplidos en alcance definido, cuatro
parciales (02/05/08/09). Cinco entregables y pendientes mínimos:
`docs/evaluacion/evidencias/eq05/SITUACION-SPRINT2.md`. No repetir hora/k6 ni desarrollar
módulos para aparentar cierre integral;2.000 VU pospuestos como meta adicional.
Sin nueva SQL/HTTP/producto/Cloud/migraciones/Actions/commits/push. Los bloques
siguientes son antecedentes; las referencias a tareas pendientes corresponden a su fecha.

26 nov — EQ-09 Web ejecutado con Playwright 1.62.1/Chromium 151, pantalla 390×844,
dos clientes sintéticos: A confirma 201; B recibe conflicto real 409, conserva servicio,
consulta/elige otro horario con teclado y confirma 201; sin reenvío observado tras
conflicto/recarga. 1 E2E aprobado, 0 fallos finales, 0 retries. SQL concilia dos
reservas y ninguna para UUID rechazado; global 18.981, cero violaciones; filas
previas de 18 tablas preservadas, 814 archivos y 763 hashes históricos sin cambios.
Informe/JSON/HTML y tres capturas en `docs/evaluacion/evidencias/eq09/INFORME.md`;
reporte Playwright nativo/trace con sesiones siguen privados. Metro/proxy temporales
cerrados; Edge original oneshot restaurado tras CORS local temporal, sin reiniciar
otros cinco servicios. EQ-09 integral parcial: Android/ubicación/participantes y
accesibilidad completa pendientes. Error 6,73:1/aria-live polite; foco BODY y aviso
fuera del encuadre inicial, etiqueta Efectivo visualmente tenue, documentados sin UI.
Solo propuesta EQ-05 de una hora preparada (60 sondeos, límites propuestos 10s/30s,
datos dedicados/cancelación lógica), monitor no implementado ni iniciado; ≥99,5 %
mensual sigue sin evaluar. Sin k6/Cloud/migraciones/Actions/commits/push.

26 nov — EQ-08 consolidado exclusivamente en alcance construido: checkers cliente
298 módulos/55 núcleo/975 aristas y servidor 56/33/158 aprobados. 88 archivos de
núcleo y 199 dependencias listadas, cero prohibidas. SolicitarReserva y ConfirmarReserva
ejecutados con dobles existentes: un caso aprobado por lado, Node con cero intentos
de red y Deno sin permisos de red/lectura/escritura/entorno. Cobertura completa del
25/11 reutilizada: cliente 100/100/93,1425 %, servidor 100/100/100 %; los 88 archivos
coinciden con el commit probado 9192d1a. 814 archivos preservados por SHA-256.
Informe, criterio original, CSV/JSON y logs separados en
`docs/evaluacion/evidencias/eq08/INFORME.md`. EQ-08 sigue parcial integralmente por
la sustitución de proveedor de mapas/imágenes no completos; no desarrollados.
Siguiente mínimo EQ-09: Playwright Web móvil, conflicto local real, mensaje/servicios
conservados, nuevo horario sin reenvío ni duplicados y evidencia sanitizada.
No se inició ese recorrido; Android, ubicación y participantes siguen pendientes.
Sin funcionalidades/Cloud/migraciones/Actions/k6/commits/push ni suite completa repetida.

26 nov — Serie mixta 71e00e3c concluida y auditada offline: 25/50/100 VU,
600 s estables por nivel; 88.472 HTTP y 17.630 confirmaciones aceptadas = reservas
persistidas, cero errores/violaciones y recuperación registrada. 36 thresholds de
aprobados recalculados; dos intentos fallidos y sus 1.245 reservas conservados.
EQ-04/EQ-06 cumplidos en laboratorio según criterios originales de consultas:
a 100 VU, p95 completos 4/8/7 ms. P95 HTTP global 3.660,71 ms documentado como
limitación de la mezcla; percentiles exclusivos de confirmación no exportados,
sin inventarlos. 763 archivos protegidos conservan SHA-256; sin k6/SQL/red nuevos.
Tablas, CSV, JSON, cuatro gráficas PNG/SVG/PDF e informe en
`docs/evaluacion/evidencias/004-reservas/k6-mixta-final/INFORME.md`.
Lectura hasta 1.000 VU independiente; 2.000 pospuestos como meta adicional.
Siguiente mínimo: consolidar evidencia cliente/servidor e importaciones de EQ-08
en el núcleo construido; integral parcial por mapas/imágenes pendientes, sin
desarrollarlos. No repetir carga. Sin producto/Cloud/migraciones/Actions/commits/push.
Los bloques inferiores documentan antecedentes y no ordenan reejecutar 25/50/100.

26 nov — Mixta de 25 VU acreditada, dfbeb172: 16.227 HTTP, 3.236 confirmaciones,
cero errores y 600 s estables. Preparación de 50 interrumpida en configure-shop
por ECONNABORTED antes de Kong; corregido solo el aprovisionador con reintentos
acotados e idempotentes y Connection: close. Prepare-only de 50 completado sin k6:
4.585 reservas, cero violaciones, sin nuevas reservas ni cambios en detalles/pagos.
25 sigue aprobado. `npm run test:carga:mixta` continúa con 50 y 100. Ver
`docs/evaluacion/evidencias/004-reservas/sprint2-closure/APROVISIONAMIENTO-50.md`.
Oneshot, thresholds, 600 s y guardas intactos; sin cambios de producto, Cloud,
migraciones, Actions, commits ni push. EQ-04/EQ-06 aún requieren 50/100 mixtos.

26nov — Mixto dd8f7bd1 diagnosticado:500confirm porWorkerAlreadyRetired local.
SQL1.241nuevasvs1.235aceptadas:6duranteaborto,conservadas sin inflaréxitos;1.349
totales/SQL0,replay200 sin duplicado. Conautorización, soloEdge lab pasa aoneshot,
anteriorconservadodetenido;otros5intactos. Reintento b238ad29 listo con turnos
consumidos omitidos,50/100/600s yprotecciones intactos. Fixturecap600preparada
soloen2shops;mediciónincluyearranqueworkers. npm run test:carga:mixta manual.
Ver004/sprint2-closure/MIXTA-DD8F7BD1.md. Sin k6/producto/Cloud/migraciones/
Actions/commits/push. Aúnnohaynivelmixto acreditado; no relajar fallosdeconfirmación.

26nov — Reintento mixto25 preparado con autorización: se conservan intento
912980a8 y4 reservas; nuevos IDs/turnos solo en4casos, otros3.996 y50/100 intactos.
Baseline108/SQL0;716 hashes protegidos sin cambios. Comando manual único:
npm run test:carga:mixta.600s estables por nivel; guardas/thresholds intactos.
7 pruebas específicas pasan; suite ampliada33/34: test auxiliar de consulta de
puertoWindows excede timeout(2638/2000ms), sin cambios al supervisor ni al test.
Ver004/sprint2-closure/REANUDACION-MIXTA.md. No se ejecutó k6 ni se tocaron
producto/Cloud/migraciones/Actions; sin commits/push. Serie aún sin nivel acreditado.

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

26nov — Cierre documental k6: cinco corridas aprobadas y dos Stress fallidos
auditados sin nueva carga. Smoke, Load, Load académico, Stress 1.000 VU/60 s
y Spike 1.000 VU/30 s acreditados en lectura. 476.964 HTTP, cero errores,
186 thresholds, recuperación e integridad satisfactorias. Stress a 1.000 VU:
643,57 RPS, p95/p99 HTTP 789,45/903,27 ms; RPS máximo 757,28 a 800 VU.
131 archivos crudos/puntero con SHA intactos; seis gráficas PNG/SVG/PDF,
tablas/CSV/JSON e informe en 004/k6-final/INFORME.md. MVP carga 10 VU cumplido;
EQ-04/06 parciales por consulta de reservas y confirmaciones no medidas.
EQ-03: falta carrera entre barbero y admin distintos; no otra batería de reservas.
EQ-05: mes no evaluado. Matriz EQ-01–10 y pendientes mínimos en REQUISITOS-CALIDAD.md.
No repetir lecturas aprobadas ni declarar 1.000 escrituras, 2.000 VU, Android
integral o CD. Sin cambios funcionales, Cloud, migraciones, commits o push.

26nov — Laboratorio optimizado con autorización: Kong512→4096/unworker, sintaxis
y persistencia tras reinicio soloKong verificadas; descriptores1048576 sin cambios.
SupervisorWindows usa stopAPIloopback/PID y esperaexportación10s (crítico2,5s),
fallbackforzado y evidenciaexplícita si faltasummary; noaprueba interrupciones.
27tests sin k6 aprobados; cierre probado con Node real.6servicios/salud200/SQL0,
43archivoscampaña y puntero/26migraciones conservados. Guía y reporte004/
k6-lab-optimization.md actualizados. No cargaejecutada: exportaciónk6real y nueva
capacidad pendientes del Stressmanual del responsable. Sin producto/Cloud/Actions/
migraciones/commits/push; protecciones críticas conservadas.

26nov — Diagnóstico segundo Stress: gateway Kong agota512conexiones/worker
al acercarse a500VU (warnings en ambos intentos). Segundo registra16EOF y termina
por RAMhost>=90% sostenida16,093s, no por primerEOF. Sin resúmenes finales del
segundo: no acreditar500 ni inventar métricas. Máximo formallectura400VU/60s,
SQLactual0violaciones,6servicios vivos,sinOOM/reinicio.43archivos campaña y puntero
SHA intactos. Corrección del diagnóstico anterior que había omitidowarnings:
004/k6-stress-bottleneck.md. Propuestas de plantillaKong4096/margenhost/supervisor
ordenado documentadas, ninguna aplicada. Sin carga, cambios de infraestructura,
producto, umbrales, Cloud, migraciones, commits ni push.

25nov — EOF Stress investigado: origen de transporte no atribuible con certeza;
sin saturación sostenida/errores DB/OOM/reinicio observados. Tramos100–400VU60s
aprobados;458solo rampa. Intento original108 preservado. Tras autorización expresa,
solo Stressread tolera EOF como técnico (<1% total), sin reintento/éxito/check ficticio;
checks100% sobre respuestas recibidas y guardas restantes intactos. Eventos porEOF
y metodología stress-eof-v1 registradas en próximas corridas.16 tests y5 inspecciones
estáticas sin carga aprobados;36 archivos de campaña/puntero preservados. Ver reporte
004/k6-stress-eof-analysis.md. No se ejecutó Stress ni ninguna otra carga en esta etapa.

25nov — Rendimiento reorganizado en Smoke/Load/Stress/Spike: campaña nueva sin
aprobaciones heredadas y archivo SHA256 de32 evidencias preliminares, conservando
originales. Laboratorio íntegro y sin procesos residuales; bloqueo Ctrl+C archivado.
Métricas por tramo, capacidad Stress solo por tramos completos y Spike condicionado.
Suplemento formal25/50x10min disponible: Load25/50x1min no acredita EQ06 por sí solo.
14 tests/5 inspecciones estáticas aprobados sin generar carga. Guía k6 vigente;
nueva campaña aún no ejecutada. Sin Cloud, producto, migraciones, Actions ni commits.

25nov — k6 simplificado: comandos npm test:carga con nivel/completo; preparación
automática y reutilización verificada de1/10/25VU sin repetir. Salida nativa de k6
heredada y exportación JSON conservada. Estimaciones RAM pasan a advertencias;
guardas críticas/sostenidas documentadas en MANUAL-POWERSHELL.md, thresholds intactos.
11 pruebas unitarias y verificaciones estáticas aprobadas. Ninguna carga ni humo ni
comando k6 ejecutado en esta etapa. Progreso visual se verificará manualmente.
Sin producto, Cloud, migraciones, Actions, commits/push; resultados históricos intactos.

25nov — k6 manual: backend existente reutilizado sin reinicios,6 servicios y26
migraciones verificadas. Aprovisionador reanudable probado ampliando2→10 clientes:
12 usuarios Auth incluyendo2 propietarios,2 barberías/servicios/profesionales,
sesiones reales y marcador privado. Catálogo/slots/validación Edge/aislamiento
lectura aprobados; SQL0 reservas/violaciones. Política adaptativa separa preparación
serial de carga y conserva abortos; calibración real del generador pendiente del
humo manual. Objetivo inmediato1000VU,2000 académico pendiente.8 tests/18 inspecciones
sin carga aprobados. Guía y funciones PowerShell5 verificadas; el supervisor rechaza
el humo por RAM actual~1,78GiB frente a~3GiB requeridos. Cerrar Codex/liberar memoria,
cargar k6/manual.ps1 y seguir MANUAL-POWERSHELL.md. Sin intensidad, Cloud, producto,
migraciones originales, staging/commit/push/costos. Ver004/k6-manual-readiness.json.

25nov — Laboratorio k6 optimizado sin carga:18 contenedores adicionales detenidos
con autorización y ausencia de transacciones abiertas; total25 conservados con
montajes/IDs verificables. Docker activo. RAM3,30GiB inicial,3,40 inmediata y
2,90–3,62GiB posteriores: mínimo4GiB aún bloquea backend/humo. VmmemWSL bajó
2211→1163MiB, sin alterar WSL/globales. Cuatro tests y28 inspecciones sin HTTP
aprobadas. Niveles200..2000 de100 en100; datos SharedArray compactos y guardas
de progresión/recuperación. Restauración modo plan valida25 contenedores originales.
k6/MANUAL-POWERSHELL.md reúne comandos reales condicionados a preparar fixtures
y marcador todavía pendientes por no disponer de backend. No es ejecución manual
integral acreditada. Evidencia004/k6-optimization.json. Sin producto, Cloud, cambios
de migraciones originales, commits/push ni costos. Lo siguiente conserva antecedentes.

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

25nov — Documentación REST OpenAPI3.0.3 incorporada en docs/api/openapi.json:
4 Edge Functions,11 RPC,10 tablas PostgREST y consulta Auth administrada;26 rutas.
33 variantes de operación y17 de reserva/atención documentadas sin cambiar API.
Swagger local: npm run docs:api → http://127.0.0.1:8082, carga verificada en Brave.
Ejecución API deshabilitada; seguridad JWT+apikey, permisos SQL y ejemplos sintéticos.
Validación: npm run docs:api:check;3 pruebas y contraste de11 solicitudes/7 respuestas
con validadores existentes. Generador: npm run docs:api:build. Detalle y límites en
docs/evaluacion/evidencias/004-reservas/calidad.md. Sin nuevas operaciones Cloud,
cambios de producto/SDD/Constitución, Jest, CI remoto, despliegue, commit/push o k6.
Control global exit0 fuera del sandbox:652 presentación/integración y96 servidor;
cliente100% líneas/funciones y93,1425% ramas. Log .artifacts/openapi-check-host.log.

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

## Actualización vigente — 24/11/2026: Web aceptada; preparar cierre técnico

El usuario confirma completadas las interfaces y todo el recorrido funcional manual
Web implementado: cliente, trabajador barbero, trabajador con administración
secundaria y propietario administrador que también atiende. Incluye contexto por
barbería; no son roles globales. Aceptación declarada por el usuario en el chat.
No repetir recorridos ni continuar rediseño sin nueva incidencia/instrucción.

Web local8081 consume backend Supabase Cloud vuoncrtkkkquvddunrxx. Autoridad e
invitaciones administrativas activas; barbershop-operation v7, categorías de servicios
persistentes y reporte manual Yape activos. El detalle vigente y pruebas están en
docs/CODEX-HANDOFF.md, sección1. Los bloques siguientes son antecedentes históricos;
sus contadores/versiones y pendientes Web no sustituyen esta actualización.

SDD actualizado para Sprint2 del27/11: revisadas18 especificaciones y sus planes/tareas;
corregidos estados de activación y funcionalidades vigentes, aceptación Web atribuida al
usuario y pendientes Android/técnicos separados. Sin nuevos informes ni especificaciones.
Requisito de k6 progresivo hasta2.000VU registrado como pendiente; EQ originales intactos.

Pendiente de entrega: consolidar matriz16criterios, calidad global/cobertura
(último control191pruebas aprobadas; umbral global falló: líneas63,39%, funciones84,82%),
consolidar E2E/seguridad/rendimiento, hosting Web público/HTTPS/DNS/CDN, CI remoto/CD,
k6, informe/diagramas y sustentación. Caché existente requiere evidencia final del
destino. Contrastar alcance de propuesta aún no acreditado (Storage/imágenes/QR,
favoritos/reseñas/mapas). QR Yape persistente está pospuesto; sin pago automático,
abonos ni pagos mixtos. Android requiere su aceptación final según Constitución2.0.0;
el cierre manual Web no la reemplaza ni acredita pruebas de carga o pagos reales.

No hay autorización nueva para Cloud, migraciones, hosting/costos, APK, datos,
limpieza ni staging/commit/push. Conservar fixtures y logs protegidos.

## Fase D — Web8081 con backend Cloud, perfil LOCAL preservado

21/11/2026,23:25Lima. Metro activo con cloud-integration, backend
https://vuoncrtkkkquvddunrxx.supabase.co, sa-east-1. Perfil real y credencial pública
existente comprobados en Expo58 virtual/env del navegador, sin mostrar claves.
.env.local y perfiles/configuraciones anteriores intactos por SHA-256; solo se
reinició Metro. Una instancia, supervisor27228/Metro33768,8081/status200.
Google/callback y recuperación8081 configurados; SiteURL3000 sin modificar porque
el cliente usa retornos explícitos. Sin nuevas operaciones de Auth/OAuth/correos.
Inicio/login/registro/recuperación/F5 visibles; /account sin sesión vuelve al Inicio
público sin contenido privado. Sonda CloudAuth/settings200,0intentos API LOCAL.
87regresiones, tipos general/núcleo y arquitectura aprobados. Vacíos probados con
dobles; catálogo autenticado pendiente del ingreso manual con cuenta Cloud existente.
Cloud18migraciones,2usuarios/2perfiles;0barberías/membresías/servicios/reservas.
No se activó autoridad, no se copiaron datos ni se modificaron backend, interfaces,
estilos, Android o implementaciones Auth. Solo operadores ignorados y documentación.
Evidencia: docs/evaluacion/evidencias/004-reservas/cloud-phase-d.md y .json.
Detenerse; no ejecutar automáticamente el siguiente recorrido de negocio.

## Cloud — Fase C aplicada, sin activar autoridad ni cambiar frontend

21/11/2026, 22:56 Lima. CLI enlazado a vuoncrtkkkquvddunrxx, sa-east-1.
Migraciones17/18 aplicadas una vez cada una con migration up oficial y verificación
intermedia; historial18. Solo barbershop-operation v3 ACTIVE, verify_jwt=true;
otras tres Edge permanecen v2. SQL originales y respaldo A conservados.
58tablas previas con huellas intactas salvo historial autorizado. Cloud conserva
2usuarios/3identidades/2perfiles;0barberías, membresías, reservas y atenciones.
Sin fixtures, sesiones nuevas, correos, escrituras de negocio ni copias LOCAL.

72pruebas servidor y71regresiones aprobadas; tipos servidor/Edge aprobados.
HTTP real:401sin credenciales/JWT inválido;204CORS permitido;403origen prohibido;
RPCanónima401/42501;Authhealth200.30archivos runtime descargados coincidentes.
Autoridad e invitaciones administrativas siguen desactivadas; no se modificaron
variables. Pruebas positivas de roles Cloud diferidas hasta actores reales.
Frontend/.env.local/Auth/OAuth/Google/contraseñas/Android sin modificaciones.
Se ajustaron solo verificadores; no se repitieron migraciones ni despliegue.
No acredita B1–B5 en Cloud ni despliegue público. Detenerse después del informe.
Evidencia: docs/evaluacion/evidencias/004-reservas/cloud-phase-c.md y .json.

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

## B5.2 — implementación y ensayo aislado (antecedente previo a activación)

**B5.2 — retirada de cierres implementada y ensayada en aislamiento (20/11/2026, Lima).**
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

## B5.2/B5.3 — preparación con dos brechas de integración

**B5.2/B5.3 preparados, sin escrituras de negocio (20/11/2026, Lima).** Ver nueva sección del plan y004/b52-b53-preparacion.json. PostgreSQL LOCAL read-only y Chrome/U3 inspeccionaron creación, configuración, servicios, horarios y CareSettings;41/44/28care/67careEvents/54reservationEvents intactos, mismas huellasB5.1, esquema/env sin cambios. Una sesión de lectura cerrada204,0nuevasrestantes;0servicios operados.

Dos brechas demostradas: renombrado002 tiene caso/PATCH/RLS pero falta control/composición Web; /schedules crea cierres administrativos pero no los lista/retira y no hay RPC administrativa de retirada (remove_own_booking_block009 no sustituye esa operación). No corregir todavía producto/SQL. Yape configura en /agenda, no /barbershop-admin: ruta documental corregida.

Propuesta pendiente de permiso:1tenant nuevo B5 Cierre Web LOCAL, U3owner+perfil profesional nuevo explícito,1servicio25/15→30/30+capacidad,7horarios local07–24 y7profesional08–23:45; clienteaecfc300 existente.22comandos:20actuales+renameWeb a integrar+retiradaadmin a implementar. Incluye setup/publicación/edición/restauración/2configureYape0050/1confirm cash/1no-show nuevos;no repetir B1–B4/Yape. Solo Yape0050 toca temporalmente dato previo y restaura exacto, tolerancia10 intacta. No usar ninguna de41citas, incluidaB5.1. Finalcondicional42/45/29care/71careEvents/55reservationEvents,9shops/15membresías/9owners; conservar originales/historia.

No-show exige espera real de inicio+tolerancia snapshot, deja confirmed/no-show/pending/cash y no libera rango anticipadamente. Cierres requieren primero aprobar contrato/migración LOCAL aditiva+Edge/Web;rename solo integración Web. Sin esas correcciones no prometer cierre de6ramas solo con pruebas. Matriz34verificadas/4sinvalidación/4noaplica/3bloqueadas/3parciales, sin nuevas acreditaciones, SMTP administrativo y transferencia separados pendientes. Solo documentación/verificadores de lectura cambiados;sin Cloud/Android/Git/despliegue. Detenerse al informe.

## B5.1 — Yape Web acreditado; B5 global abierto

**B5.1 acreditado funcionalmente en Web (20/11/2026, Lima).** Se ejecutaron exactamente dos comandos desde Chrome con sesiones auténticas de GoTrue LOCAL: confirmación de reserva Yape HTTP 201 por el cliente y recepción ficticia HTTP 200 por el profesional asignado. Cita 11ccc730-9194-4f8e-9007-1b2bd419718e, en «005 aislada 0», el 21/11/2026 de 11:00 a 11:15 Lima; servicio S/25 y 15 minutos.

Estado final: reserva confirmed, atención confirmed (sin iniciar), pago paid, método yape, importe 2500 céntimos PEN. Mis reservas mostró Pendiente y después Recibido; el cliente no obtuvo permiso de recepción. Agenda mostró el mismo importe y la confirmación explícita del profesional; después desapareció el control de segunda recepción. Auditoría: un evento confirmed, uno created y un único receive del trabajador, con capacidad barber, método yape e importe 2500. Efectos: seis INSERT, un UPDATE del ledger nuevo y cero DELETE.

Verificación final: 41 reservas, 44 detalles, 28 registros care, 67 eventos care y 54 eventos de reserva; 14 usuarios, 13 perfiles, 14 membresías y ocho invitaciones. Las 40 reservas y 43 detalles anteriores, pagos, atenciones, B2, A/B de B3, propietarios, membresías, profesionales, servicios, horarios, ajustes v17, otros tenants, esquema, migraciones y .env.local permanecen intactos por huellas. Las dos sesiones propias cerraron con HTTP 204; cero sesiones nuevas restantes, Auth HTTP 200 y PostgreSQL saludable. No hubo cuentas, correos, dinero real, cambios de configuración ni comandos de atención.

El usuario abrió Docker y autorizó operar servicios; Codex inició únicamente el Edge Runtime LOCAL existente y una instancia Metro LOCAL en 8081. No se iniciaron respaldos ni se operaron otros contenedores. La huella completa de auth.users ya difería del histórico antes del ensayo, sin causa atribuida; sus credenciales y campos estables actuales se conservaron durante las sesiones autorizadas. Se corrigió solo la entrada del verificador para evitar activar el guard de CLI de un lector histórico. Dos pruebas con dobles de la guarda y sintaxis del verificador aprobadas; ningún cambio de producto, Cloud, Android, SQL, RLS o Edge.

Evidencia:004/b51-ejecucion.json. Conservar la cita y su auditoría; no repetir los dos comandos ni .artifacts/b51-run/run.mjs. Matriz de 48: **34 VERIFICADA, 6 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL, 4 NO APLICA, 3 BLOQUEADA y 1 PARCIAL**. B5 global sigue abierto por seis ramas: crear/configurar barbería, retirar oferta, servicios CRUD/activo, horarios/cierres administrados, guardar/restaurar instrucciones Yape e inasistencia Web. Requieren preparación y permisos separados. 005 T012 conjunta sigue abierta; SMTP unknown, transferencia, aprobación visual, Android, Cloud público, rendimiento F5 y sesión U3 histórica conservan sus límites separados. Detenerse después del informe.

## B5.1 — bloqueado antes de operaciones por entorno LOCAL detenido

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

## B5 — preparación Yape y cierre global, sin escrituras

20/11:LOCALread-onlyconserva40reservas/43detalles/27care/65careEvents/53reservationEvents,
B2/B3/B4/14membresías/8invitaciones/settingsv17 intactos. InstruccionesYapesintéticas
disponibles,profesionaloriginal/servicioS25/15minactivos.0nuevassesiones/0negociowrites.
PropuestoNOautorizado1nuevareservaYape+1recepciónmanualficticia,6INSERT+1UPDATE;final41/44,
atenciónconfirmedypagopaid,sin dinero real. No usar9Yapehistóricosdentro40protegidos.
Matriz48reconciliada:33verificadas/7sinvalidaciónintegral/4noaplica/3bloqueadas/1parcial;
B1–B4JSONfinales/regresionesexistentes coherentes,sinrepetición. YapeWebaúnpendiente.
B5globalexigeresidualesWeb:create/configshop,withdrawn,servicesCRUD/active,adminhours/
closures,saveYape,no-showWeb,odiferido explícito. No defectonuevo demostrado.
SMTPunknown/transferenciabloqueadanocortanoperacióninterna,perolimitancierre011completo;
visuales/Android/público/F5/sesiónU3vieja separados. Próximopermisomínimo2comandosYape;
noejecutartodavía. Evidencia004/b5-preparacion.json yplan/handoffactualizados.

## B4 — cerrado funcionalmente en Web dentro del alcance acordado

20/11:15/15comandosrealesChrome/GoTrueLOCALHTTP200+SQL. Perfilpersonal/nombreprofesional/
7intervalospropiosrestaurados;bloqueoficticiocreado/editado/retirado ydisponibilidadcorrecta.
UnainvitaciónbarberoU3→U4aceptada,unamembresíabarber/active,unperfilprofesionalnuevo
activo yservicioasignado trasdesactivar/reactivar. Sinascensoadmin;U4mantieneotra propiedad.
Final40reservas/43detalles/27care/65careEvents/53reservationEvents,14users/13profiles,
14membresías/8invitaciones. Citas/pagos/atención/propietarios/membresíasanteriores/otros
tenants/perfiles/serviciosintactos porhuella;solo originaleseditadossegúnautorización y
restaurados. Settings0050v5→17legítimo;sinresetearversiones/timestamps/IDsdeintervalos.
4sesionespropiascerradas204,0nuevasrestantes. Auth200/DBhealthy,esquema17migraciones/env
intactos.0defectos/0cambiosdeproducto;3pruebasdirectasgateB4ysintaxisaprobadas.
Evidencia004/b4-ejecucion.json. Conservar4registrosnuevossintéticos yno repetir15comandos.
SMTPadminunknown,transferenciabloqueada,YapeWebparaB5,aceptacionesvisualesyAndroid/gates
conjuntosseparados. NoCloud/SQL/RLS/Edge/infra/servicios/commit/push. No iniciarB5.

## B4 — inspección completada, pruebas con escrituras preparadas

20/11:8 verificaciones nuevas Chrome readonly aprobadas sobre formularios006/008/009,
invitaciones recibidas, guarda cliente sincargaindefinida yresumenprofesional/fecha vacía.
Resumen20nov2citas/1completed/1cancelled conformeSQL, sinmétricasfinancieras. No guardados,
invitaciones ni cambios de negocio.2sesionesficticias propias cerradas204. Huellasfinales
40reservas/43detalles/27care/65careEvents/53reservationEvents ytodosdatos de negocio/
propietarios/perfiles/membresías/profesionales/catálogo/historial/envsin cambios.
No defectonuevo demostrado. Se reutilizan2E.3/U6/rosterU3 ybackend, sinrecuperarclavesU5.
Plan maestro detalla15comandos futuros NO autorizados (9autogestión restaurable y6equipo),
cliente/worker/U3/U4 ficticios existentes,0cuentas nuevas/0correo/0reservas. Efectopermanente
propuesto1invaccepted+1membresíabarber+1perfilprofesional+1capacidad nuevos en0050; otros
roles intactos. Edicionespropias restauranvalores, no timestamps/versiones niIDsdeintervalos.
B4 sigueabierto porguardados/aceptaciónbarbero/gestiónprofesional Web. No código producto,
datos/servicios/Cloud/Android modificados. SMTPadminunknown/transferencia/visuales/Android
yresiduosdeoferta004 separados. YapeWeb pendiente deB5; no iniciarB5. Evidencia004/b4-preparacion.json.

## B3 — cerrado funcionalmente en Web, sin iniciar B4

20/11: cancelación administrativa pendiente B ejecutada una sola vez desdeChrome/U3
LOCAL auténtico,HTTP200. TypeError delverificador reproducido por querySelectorAll sobre
tarjeta null durante refresco deAgenda; corregidos soloespera/selector/clic delverificador,
regresiónRED→GREEN y8pruebasdirigidas aprobadas. Sin cambio adicional enApp/servidor.
HistorialB Webconsultado conmotivo administrativo, sinreprogramar otra vez.
B c47c8ee2-d7df-4ffe-8b6d-055355a3459e finalcancelled/cancelled/pending cashS25;
unevento cancelled U3/administrator y motivo explícito,0refund. EstadosWeb/filtros y
disponibilidad liberada acreditados. NuevasesiónU3 cerrada204,0sesiones nuevas restantes.
40reservas/43detalles,27care/65careEvents/53reservationEvents.1INSERT/2UPDATE finales;
B3acumulado8comandos/16INSERT/8UPDATE/0DELETE. Resto39citas/43detalles/Arefunded/38previas
incluidaB2completed-paid/perfiles/membresías/otros tenants/schema/historial/envintactos.
Auth200/DBhealthy. SesiónU3inicial delprimerfallosigue registrada1,sin token para revocación
selectiva; no cierre global,pendiente externo. YapeWebrecepciónmanual pendiente separado;
Android/004T027/010T008/005T012 mantienen aceptación propia. No repetir B1/B2/B3/2E.3,
no B4automático. Evidencia004/b3-ejecucion.json yplan maestro actualizados.
Secciones inferiores históricas: cancelación B ya no pendiente.

## B3 — siete comandos reales aprobados; cancelación administrativa B pendiente

20/11: tras petición de continuar, capturador distingue POSTAuth deOPTIONSvacío;
1regresiónRED→GREEN+3de límites aprobadas. No nuevo cambio enApp. Chromecomprobó
B2completed sinbotones cancelar/reprogramar, historialconservado, sinmutaciones.
A12d4287b-7478-4d10-9708-4280bd7fc837 completóconfirm201/receive200/reschedule201/
cancel200/refund200. Finalcancelled/cancelled/refunded cashS25. HistorialWeb/liberación
dehorarios comprobados; refundsoloU3segúnpermisos reales/controlcliente-profesionalausente.
Bc47c8ee2-d7df-4ffe-8b6d-055355a3459e:confirm201,cliente cancelbloqueado/slots403,
rescheduleadministrativo201 conmotivo. Sigueconfirmed/confirmed/pending18:15Lima20/11.
ParadaTypeError delverificador alconsultar historialB después deHTTP201+SQL verificados;
causaexactapendiente. NO cancelación Bemitida ni reparación/reintento posterior.
Final40reservas/43detalles/27care/65careEvents/52reservationEvents,+2reschedule.
7comandos/15INSERT/6UPDATElógicos.38reservas previas/41detalles/pagos/atención/perfiles/
membresías/otros tenants/esquema/historial/envintactos porhash. Auth200/DBhealthy.
3sesionescontinuacióncerradas204;1sesión inicialU3delprimerfallo continúa registrada.
Nuevo permiso:verificadorhistorial ysolo cancelarBconmotivo+lecturasfinales, mismasA/B;
no crear/reprogramar/refund/receive otra vez. B3abierto, noB4. YapeWebpendienteseparado.
Evidencia `docs/evaluacion/evidencias/004-reservas/b3-ejecucion.json`.

## B3 — corrección técnica aprobada por regresiones; ejecución real detenida

20/11: autorización de corrección puntual Web y máximo2 citas/8 comandos LOCAL recibida.
Elegibilidad Web ahora procede de la consulta verificada de atención/pago; oculta las
mutaciones incompatibles con atención completed/in-service/no-show/cancelled, mantiene
historial y legado verificado sin ledger. Sin rediseño ni cambios de permisos/SQL/Auth;
presentación Android conservada.8 nuevas regresiones GREEN tras4 RED del defecto,
38 pruebas de componentes afectados aprobadas; tipos/lint/formato/arquitectura0.
3 pruebas adicionales del verificador limitan escrituras a los actores/IDs nuevos.
Chrome detenido durante acceso inicial de U3 por HTTP_CAPTURE_UNAVAILABLE, antes de
comprobar controles B2 o preparar A/B.0 comandos de negocio y0 nuevas reservas; ningún
escenario B3 se acredita por Chrome. Sin reparación/reintento automático tras el fallo.
Verificación final:38 reservas/41 detalles/25care/61careEvents/49reservationEvents;
filas de negocio previas, esquema, migraciones y.env.local intactos, incluida B2completed/paid.
Una sesión LOCAL de U3 fue creada; su token no llegó al capturador y no se cerró remotamente.
Auth identidades intactas, solo registro legítimo de inicio en auth.users; navegador cerrado.
Pendiente: diagnóstico/corrección del capturador con metadata segura y autorización de
nuevo intento; no atribuir a la App el fallo de captura. Tratar sesión propia solo con
autorización adecuada. B3 abierto, sin B4. Recepción manual Yape Web pendiente separado.
Evidencia `docs/evaluacion/evidencias/004-reservas/b3-ejecucion.json`.

## B3 — preparado sin escrituras; pendiente de autorización

20/11: inspección dirigida LOCAL y código, sin repetir B1/B2.38 reservas/41 detalles,
17 migraciones y huellas/catálogo conservados frente al cierre B2. Cita B2 intacta
confirmed/completed/paid, cashS25.27 pruebas existentes de presentación/contratos locales
aprobadas; sin nuevas sesiones, correo, cambios de negocio ni Chrome B3 real.
Backend de cancelación/reprogramación/reembolso acreditado previamente y reutilizado.
Defecto Web de elegibilidad comprobado con componentes/dobles: acciones todavía ofrecidas
para reserva confirmed aunque atención completed; guardas SQL presentes, sin mutación
real para probarlas ni parche aplicado. Plan mínimo y archivos en el plan maestro.
Escenario propuesto:2 citas nuevas0050 con cliente/U3/profesional existentes,8 comandos
de negocio (2 confirm,1 receive cash,2 reschedule,2 cancel,1 refund ficticio),16 INSERT/
8 UPDATE exclusivamente nuevas; final40/43. No está autorizado ni ejecutado todavía.
Conservar actuales38/41 y pagos/atención, incluida B2. Solo propietario registra reembolso
total externo de cita cancelada/paid; cancelar no reembolsa. No movimiento real de dinero.
**Recepción manual Yape Web pendiente**, separada del cashB2/B3; no cerrar pagos Web sin
ella.004T027/010T008/005T012 mantienen gates de aceptación/Android. B3 abierto; no B4.
Evidencia `docs/evaluacion/evidencias/004-reservas/b3-preparacion.json`.

## B2 Web — continuación completada sobre la misma reserva

Reserva c4e9b153-9275-4a9d-9f32-f009bdb087d9 conservada; no otra ni confirmación repetida.
Causa runtime demostrada: SyntaxError delverificador, salto literal ensplit delaexpresión
decontexto. Escape/espera seleccionada corregidos solo enoperador,2regresionesRED→GREEN
y4existentes decontexto aprobadas; noApp/servidor cambios. Agenda profesional/permisos correctos.
Receive/start/complete Web200 cadauno. Inicio tras20:30UTCservidor, sin relojmodificado;
finalizar después deiniciar esválido sin duraciónmínima exigida. Finalconfirmed/completed/
paid,cash,S25. U3filtrosCompletada+Recibido incluye/Pendientedepago excluye/Todos restaura.
Cliente relee mismareserva conestadosfinales. CuatrocareEvents únicos yuneventoconfirmed.
38reservas/41detalles/25care/61careEvents/49reservationEvents;37originales/40detalles ytodos
sus pagos/atención/perfiles/membresías/otros tenants intactos porhash.8filas nuevas totales y
3updates delnuevoledger, comoautorizado. Auth200/DBhealthy;3sesionespropiascerradas204.
B2 cash yfiltros acordados técnicamente completos;005/Android mantienen gates propios.
No declarar nuevoYapeWeb. Evidencia004/b2-continuacion.json yplan actualizado. SinCloud/
SQL/RLS/Edge/servicios/Auth/B1 modificados. No repetirB2 ni iniciarB3 sin permiso nuevo.
Apartados inferiores describen estados previos.

## B2 — reserva creada; ejecución detenida antes del pago/atención

BotónConfirmar corregido solo disabled sinmétodo;6regresiones nuevas,28dirigidas/tipos/
lint/formato/grafo aprobados. Chromecliente real confirmaHTTP201 reserva
c4e9b153-9275-4a9d-9f32-f009bdb087d9 (0050,S/25,15min,cash,20/11 15:30–15:45Lima),
visible enMisreservas/CareControl. ErrorWEB_EVALUATION_FAILED al prepararWeb delprofesional;
causa no demostrada ni atribuida aAuth/servidor. Parada sin reparar ni repetir escrituras.
Receive/start/complete/agenda profesional/filtros NO ejecutados. Sesionespropias cerradas204.
EstadoSQL:confirmed/confirmed/pending; solo5filas nuevas yeventosconfirmed/created.
Totales38reservas/41detalles/25care/58careEvents/49reservationEvents.37reservas originales
y40detalles/pagos/atención/perfiles/membresías/otros tenants intactos porhuellas. Auth200/DBhealthy.
NoCloud/SQL/RLS/Edge/servicios/B1/Auth modificados. No crearotra reserva, repetirconfirmación,
cancelar ni limpiar. Requiere autorización para diagnosticar accesoWeb ycontinuar3comandos
sobre esa misma cita. Evidencia004/b2-ejecucion.json; detalleprivado .artifacts/b2-run/run/.
B2abierto/B3noiniciado; preparación inferior es anterior aesta ejecución.

## B2 — preparado, no ejecutado

Preparación dirigida en docs/PLAN-FINALIZACION-WEB.md y evidencia004/b2-preparacion.json.
Lecturas LOCAL conservan37reservas/40detalles/24care/57careEvents/48reservationEvents.
Cliente ficticioaecfc300-c0ca-4005-bbda-d59c7ac2df69 confirmado/sinmembresías; barbero8ff39bfd
activo yperfil4c1860a5 autorizado para servicio0805ab4a de0050(S/25/15min),ofertapublishedv5.
Propuesta:1reserva nueva cash→receive→start alahoraservidor→complete.4comandosHTTP,8filas
nuevas y3updates solo delnuevoledger; finalconfirmed/completed/paid.37originales intocables.
Horario candidato leído20/11 15:15Lima, NO reservado; requiere revalidación/selección dinámica
autorizada al ejecutar. Nada desesiones,datos,código oinfraestructura modificado.
DobleWeb demuestra botónConfirmar habilitado sinmétodoperonohacenada: corrección mínima
pendiente depermiso enbooking-screen.tsx ysusregresiones. No otrodefecto demostrado.
Reutilizar91comprobaciones005/T019/T023/B1; no repetir auditorías generales ni B3.
Falta autorización concreta delplan paraescrituras nuevas/sesiones/corrección; B2 NO cerrado.

## B1 Web — alcance acordado completado

Exploración ypreparación dereserva ya acreditadas eninspecciónLOCAL (6publicadas/2borradores).
Ensayo posterior autorizado: U3/005aislada0, descripción delservicio0805ab4a-c879-4054-a2d9-1de5af150407
editada yrestaurada exactamente desdeChrome; pausa yrepublicación desdeWeb.4solicitudes200,
confirmadasSQL; detallecomercial actualiza descripción, pausa conservaexploración/bloqueareserva/
slots0, republicación habilita inicio yslots. Sin crearreservas nipagos. Versión1→5 conservada.
37reservas/40detalles/atención/pagos/perfiles/membresías/horarios/otrasbarberías intactos porhuellas;
servicio completo original restaurado; settings solo difiere enversión. Auditorías existentes
intactas, sin nuevos eventos dedicados deoferta porcontrato. Sesiónpropia cerrada204.
No corrección App requerida;11regresiones decaptura yno-undef deloperador aprobados.
Evidencia `docs/evaluacion/evidencias/004-reservas/b1-oferta-web.json`; matriz/plan actualizados
solo enB1. No ampliar a toda004/T013 niAndroid. SinCloud/SQL/RLS/Edge/servicios/2E.3 operados.
B1 pactado terminado; B2 requiere autorización nueva. No iniciar automáticamente.

## Fase 0 — referencia maestra de finalización Web

Inventario y plan guardados en `docs/PLAN-FINALIZACION-WEB.md` (20/11/2026).
Prioridad: funcionalidad Web antes de perfeccionamiento visual, Android después.
Autenticación Web y diseños aprobados fuera de alcance; no repetir2E.3 ni T019/T023.
T023 sí está acreditada por demo-android-web.md, aunque agenda.md conserve un pendiente antiguo.
El núcleo004/005/008–011 tiene evidencia SQL/HTTP; falta el recorrido Web integrado actual
y deltas expresamente identificados, no reimplementar módulos completos por sus gates físicos.
Orden propuesto: B1 oferta/exploración→B2 reserva/pago/atención→B3 gestión de citas→B4
autogestión/deltas equipo→B5 consolidación. Primer paso pendiente de autorización: B1 lectura
de oferta/contextos y preparación, con permiso separado para escrituras concretas.
Fase0 solo documental: sin nuevas sesiones/pruebas de negocio/SQL/Cloud ni servicios operados.
SMTPunknown, transferenciafinal yentrega pública/académica separados; no cerrar011/Android.
La matriz es la referencia única para actualizar deltas, evitando repetir auditorías generales.

## Cierre técnico de la prueba administrativa 2E.3

Retirada pendiente completada con autorización nueva yúnica: Chrome/U3/GoTrueLOCAL,
`/staff?view=team`, «Conservar como barbero», motivo explícito, HTTP200. Misma membresía
administrator/active→barber/active; propietarioU3 intacto,0de2cupos ocupados. PreflightREADONLY
confirmó0retiradas previas/1aceptación/huellas iguales a parada anterior. No se repitieron
invitación, aceptación ni replay; no se envió correo. waitCapture corregido solo enverificador,
11regresiones aprobadas másno-undef/lint/formato/tipos/grafo; aplicación yservidor sin cambios.

HTTP real yChrome confirman capacidadbarber, equipo denegado, perfil profesional yhorarios
legibles200; nueve permisos administrativosfalse porPostgreSQLREADONLY. Auditoría9→10 con
unremove-secondary deU3; invitaciónaccepted/entregaunknown yeventos anteriores intactos.
37reservas/40detalles/atención/pagos/todosperfiles/servicios/otrasmembresías/barberías conservados
porhuellas. Tabla completa demembresías coincide incluso con baseline anterior apromoción.
Auth200/DBhealthy/.env.local intacto, ambas sesiones propias cerradas204. SinCloud/Android/
SQL/RLS/Edge/servicios operados. Evidencia011/contracts/team-authority-2e3-removal-result.json.

2E.3 queda completada técnicamente;2E/011 siguen con aceptación integral yotros gates existentes,
incluidos rosterU5/guardaCliente pendientes, sin repetir aprobacionesU6 ni elciclo deescrituras.
SMTP sigue sin acreditar, no reenviarunknown. Transferenciafinal/Cloud excluidos. No continuar
otros módulos ni volver aejecutar removal-only.mjs. Apartados inferiores son históricos.

## Continuación 2E.3 — error Web corregido y replay aprobado; retirada pendiente

Diagnóstico Chrome sin escrituras: Auth/membresías/capacidades200, decoder acepta secondary.
Depurador/bundle demuestran respuesta de contexto anterior descartada por run; su catch
invalidaba también la autoridad vigente. Corrección puntual en operation-application.ts:
invalidar solo si el contexto de la operación sigue vigente; respuestas antiguas se rechazan
y denegaciones actuales siguen cerrando acceso. Sin rediseño/servidor/Android modificado.
10regresiones fallaron antes y pasan después;52dirigidas/tipos/lint/formato/grafo aprobados.
Chrome confirma panel secundario sin controles exclusivos y equipo denegado; U3 owner200,
panel de equipo con1/2cupos y retirada explícita. UN replay200 de invitación yaaccepted:
sin nuevas filas/eventos/concesiones ni cupo. No repetir aceptación inicial ni este replay.
Retirada NO emitida: verificador adaptado omitió declarar waitCapture y falló tras accionar
confirmación, antes de solicitud remove-secondary. Error del ejecutor, no denegación servidor.
Parada sin reparar/repetir. Trabajador sigueadministrator/active,1secundario, perfilactivo;
U3/propiedad intactos, invitaciónaccepted/unknown,9eventos. Todas las huellas de negocio,
membresías,37reservas/40detalles/pagos/perfiles iguales al inicio de esta continuación.
Auth200/DBhealthy; ambas sesiones propias cerradas204; sinCloud/correos/servicios operados.
Evidencia011/contracts/team-authority-2e3-web-replay-result.json. Falta autorización para
corregir SOLO verificador y UNA retirada «Conservar como barbero», sin nuevo replay.
2E/011 abiertas; SMTP pendiente aparte. Apartados inferiores son resultados anteriores.

## Continuación 2E.3 — aceptación realizada; parada por error Web de permisos

Se aceptó únicamente la invitación existente42acf7f0-15f6-4cff-940d-2fc144e715cc desde
Chrome con sesión auténtica del trabajador LOCAL, HTTP200. Misma membresía ahora
administrator/active, capacidadsecondary verificada HTTP200,1/2cupos; sin permisos para
administradores/equipo/transferencia. Al abrir /barbershop-admin, Web mostró «No se pudieron
consultar los permisos»; verificador se detuvo. Causa raíz no demostrada. Replay, loginU3 y
retirada NO ejecutados. El trabajador sigue secundario activo; no restaurar automáticamente.
Invitaciónaccepted/entregaunknown, sin otra invitación ni reenvío/SMTP. Auditoría8→9 con
accepted-administration. VerificaciónREADONLY:37reservas/40detalles/pagos/perfiles
profesionales/personales/propietarios intactos porhuellas; solo cambia membresía objetivo,
invitación autorizada yevento, además metadatosAuth del login. Auth200/DBhealthy; sesiónpropia
cerrada204. SinCloud/Android/infraestructura. Evidencia011/contracts/team-authority-2e3-existing-result.json.
Nuevo permiso para diagnosticar errorWeb ycontinuar replayúnico/retirada explícitabarber.
2E/011 abiertas; SMTP pendiente aparte. Apartados inferiores conservan resultados históricos.

## Etapa 2E.4 — código LOCAL de correo corregido; invitación sin tocar

AdaptadorMailpit acepta exactamenteexample.test/example.invalid, conserva sender,
development ydestinoLOCAL; Cloud/Resend/configSMTP/autorización sin cambios.18 pruebas
Deno dirigidas+tipos/grafo/lint/formato aprobados. Noenvío real, restart odeploy.
Invitación42acf7f0-15f6-4cff-940d-2fc144e715cc sigue pending/unknown,vigente/selloU3v1
correcto. Huellasnegocio/identidades/catálogo/historial intactas;37reservas/13membresías.
unknown impide reenvío porcontrato. Candidato puedeaceptar desdebandeja sincorreo,
pero necesita autorización nueva para aceptación/replay/retirada. Alternativa deaviso:
reconciliación puntual aprobada yenvío único sobremismafila, nunca crearotra. Ninguna
escritura administrativa/sesión/aviso en2E.4. 2E/011 abiertas; detallecontrato011.

## Reintento 2E.3 — una invitación pendiente; detenido por correo

Verificador corregido soloenartifacts,4regresiones aprobadas; U3/candidato autenticados y
contextos/capacidades LOCAL reales verificados200. Una invitaciónUI creada200:42acf7f0-15f6-4cff-940d-2fc144e715cc,
estado pending/entregaunknown,0avisos correspondientes enMailpit. AdaptadorLOCAL exige
@example.invalid ydirecciónficticia candidata no cumple; guardaantesdeSMTP, notify→unknown.
No reparación nireenvío: aceptación/replay/retirada NO ejecutados. Candidato barber/active,
0secundarios, perfiles/propietario/otrasbarberías/37reservas/40detalles/24care intactos porhuellas.
Solo nuevasfilas:invitación/metadata/sello; auditoríaautoridad sigue8. Sesiones propias cerradas204.
NoCloud/Android/servicios modificados. Evidencia011/contracts/team-authority-2e3-retry-result.json.
Próximo permiso: compatibilidad correoLOCAL ytratamiento acotado deinvitaciónexistenteunknown;
no repetirinvite ni otros comandos automáticamente. 2E/011 abiertas; aprobacionesU6 vigentes.

## Etapa 2E.3 — prueba de escrituras detenida antes de enviar

Primer intento autorizado conU3/candidato en005aislada0: baseline/guardas aprobados ysesión
realU3 obtenida. Verificador falló preparando contextoWeb antes delprimer comando; invitación/
aceptación/replay/retirada NO ejecutados (0escrituras). Sesiónpropia cerrada204. Diagnóstico
genérico sinDOMfinal; revisión detecta supuesto deElecciónmanual incorrecto con membresíaúnica
autoseleccionada. No atribuir aAuth/Edge niparchear aplicación. Sin reintentos/reparaciones.
Huellas finales negocio/identidades/catálogo/historial/.env.local iguales;37reservas/40detalles/
24care ymiembrobarber/active conservados. Evidencia011/contracts/team-authority-2e3-result.json.
Siguiente permiso: corregir soloverificador ydiagnósticos +nuevo intento delmismo ciclo.
No servicios reiniciados niCloud/Android/U5/U6 modificados. 2E/011 siguen abiertos.

## Etapa 2E — servicios LOCAL activos yvalidación real parcial

Inicio único autorizado del Edge existente yMetro8081 local-team-authority; JWT conservado,
Auth/PostgreSQL saludables, ningún otro servicio reiniciado. Chrome real +GoTrueLOCAL:
principalMVP-A,profesional005 ycliente sin membresía;16HTTP principales+2diagnósticas y
6asercionesWeb+1seguridad aprobadas porCodex en2E. No Cloud/Google. Posteriormente elusuario
aprobó manualmente U6 secundario011, principalPrueba1 yel cambio entre ambos contextos.
PrincipalMVP-A aprobado visualmente porusuario. No repetir estosrecorridos ni recuperaciónU6.
VistaU5 delequipo011 yescrituras administrativas siguen pendientes; no aceptación integral.
Defecto2E-WEB-01 corregido en2E.1 autorizada: guardaWeb distingue membresía ausente/denegada,
carga real yerror; salida aInicio/Miperfil. Ocho regresiones nuevas y56 pruebas dirigidas,
tipos/lint/formato/arquitectura aprobados. BundleWeb actualizado enMetro sinreinicio.
Confirmación autenticada de la corrección pendiente: Chromeaislado cerrado, sin runtime
reutilizable; no nuevoslogins ni llamadasSupabase. No aceptación integral niHA-A03cerrada.
Huellas de negocio/catálogo/historial/.env.local iguales;17migraciones/8owners/13membresías/
37reservas/40detalles/24care intactos. Efectos Auth permitidos:5logins/4logoutlocales,
sesiones48→49/refresh51→52/audit507→516. Una sesión del primer intento no revocada porque
token no se retuvo; no se cerraron sesiones ajenas. Detalle011/contracts/team-authority-2e-result.json.
2E no cambiócódigo;2E.1 solo guardaWeb/pruebas. Sin cambiosSQL/Cloud/Android ni negocio. Servicios
quedan activos; revisión enhttp://localhost:8081/sign-in concredencialesLOCAL existentes.

## Etapa 2D — integración administrativa preparada; runtime/aceptación pendientes

Código Web y composición Edge conectados al contrato17 para LOCAL verificado. Perfil
Web exclusivo `local-team-authority`, namespace propio, transporte fijado54421 y sin
Google; preparador `scripts/team-authority-local-profile.mjs --check` sin arranque ni
escrituras. `.env.local` intacto. Panel principal/secundario, cupo2 y retirada explícita
reutilizan componentes existentes; diseños aprobados y variantes nativas conservados.
Corregidas recarga que desmontaba consumidor, reintento que cambiaba versión y posible
intercepción del perfil por selección diagnóstica Google antigua.384 Node+66 Deno con
dobles aprobadas; tipos/lint/formato/grafos correctos. No equivalen a HTTP/JWT reales.
Lectura LOCAL:17 migraciones/8propietarios/14usuarios/13perfiles/8shops/13membresías/
37reservas. Edge detenido (cuatro JWT=true); puerto8081 libre. No se inició servicio,
desplegó función ni crearon sesiones/datos. Cloud intacto. HA-A02/HA-A03 siguen abiertos.
Siguiente permiso: inicio exclusivo Edge existente + Metroperfil LOCAL aislado; después
HTTP/sesiones LOCAL identificadas y aceptación manual. Escrituras de invitación/retirada
requieren permiso separado. Detalle y lista de archivos en011/contracts/team-authority.md.

## Etapa 2C.9 — jerarquía SQL activada y verificada SOLO en LOCAL

Autorización oficial de ocho parejas ejecutada una vez en `app-barberia-002-local:54422`,
base postgres/OID5, identidad TCP y Docker coincidente. Baseline igual a2C.8. Respaldo custom
privado local558680B, SHA256404a53ad..., TOC y lectura completa verificados sin restaurar;
ACL usuario/SYSTEM, ignorado por Git. Un COMMIT después de todas las guardas: migración
20261120010538,8 ownership/8 eventos reviewed-legacy,1 settings draft para sjjss y1 historial.
Historial17,24 tablas/92 funciones/16 políticas/7 triggers. U5 principal011, U6 secundario011
y principalPrueba1. Nuevas conexiones READ ONLY verifican cuerpos/ACL/RLS, ocho parejas,
capacidades y4 lecturas RLS.14usuarios/13perfiles/8shops/13membresías/37reservas/40detalles/
24care/eventos/invitaciones intactos por huellas; siete settings anteriores conservados.
Sin sesiones de activación ni bloqueos pendientes. Evidencia011/contracts/team-authority-2c9-result.json.
No repetir migración/regularizaciones. Source y preparado2C.7 intactos; sin errores SQL ni
reparaciones. Solo protección de carpeta backup requirió salir del sandbox antes de iniciar.
HA-A01 yC7-A01/A03 acreditadas; HTTP deHA-A02 yEdge/cliente/manualHA-A03 siguen abiertos,
igual que transferenciafinal bloqueada yCloud independiente. No se activaron flags Edge/Web,
no se modificaron servicios/Android/UI/log. Próximo bloque requiere nueva autorización.

## Etapa 2C.8 — ensayo aislado aprobado y eliminado, principal sin activar

BD temporal `barbexa_2c8_20261120_f4423fa3`, OID118495, creada desde template0 en LOCAL54422.
Auth solo estructura sin filas copiadas;16 migraciones históricas reconstruidas allí.
Fixtures sintéticos:9 usuarios/perfiles,8 shops,13 membresías,6 profesionales/servicios,
37 reservas/care,1 invitación pendiente y7 settings. Mismo mapa U1–U6; datos Auth ficticios,
sin contraseñas/sesiones/correos. ROLLBACK completo aprobado, aborto inducido después de
historial17 aprobado y COMMIT aprobado solo en esa BD:8 propietarios/8 eventos/8 settings,
U6 secundario011 y principal en su otra barbería.13 casos SQL de seguridad aprobados,
revertidos sin residuos; transferenciafinal sigue bloqueada.18 regresiones offline0 fallos.
Sin correcciones a migración ni generador: solo fixture de cliente independiente ajustado
antes de seed. Original SQL6F581... y copia2C.7 intactos. BD temporal eliminada por nombre/OID,
sin FORCE; principal catálogo/huellas22 tablas/historial16 iguales,37 reservas intactas.
Evidencia011/contracts/team-authority-2c8-result.json. Se puede solicitar permiso de
activación real LOCAL con mapa definitivo y revalidación inmediata; NO se aplicó migración,
regularización, flags, Edge ni UI en principal. Cloud/servicios/Android/log sin cambios.

## Etapa 2C.7 — activación conjunta preparada, sin ejecutar

Mapa propuesto de8 barberías ficticias revalidado solo READ ONLY con UUID/snapshots:
MVP A/U1, MVP B/U2,005 0/U3,005 1/U4,Prueba0/U5,Prueba1/U6,011/U5+U6 secundario,sjjss/U1.
Pendiente aprobación definitiva. Único settings faltante: sjjss. Invitación pendiente de
MVP A intacta y emisor U1 coincide. Historial16,14usuarios/13perfiles/13membresías/37reservas
y huellas de22 tablas conservadas. Generador puro nuevo y copia privada terminal ROLLBACK:
prechecks, DDL revisado,8 regularizaciones, restricciones/permisos/datos e historial en una
transacción; nunca CLI repair separado. No ejecutada ni en principal ni en nueva BD temporal.
18 pruebas offline, tipos/lint/formato/grafos aprobados.2C.4 se reutiliza, sin afirmar ensayo
del bloque exacto nuevo: necesita PostgreSQL aislado y permiso posterior. Ver contrato011
y contracts/team-authority-2c7-result.json. Jerarquía/Edge/Web apagados; transferenciafinal
bloqueada. Sin cambios Cloud/servicios/interfaces/migraciones fuente ni datos de BD.

## Etapa 2C.5 — historial LOCAL reconciliado, jerarquía no activada

Auditoría previa LOCAL `app-barberia-002-local:54422` aprobada: efectos de las tres
migraciones concordantes, baseline y copia recuperable del historial conservados.
Primer intento oficial de `migration repair` para20261115030159 terminó con código1:
`MigrationInvalidVersionError`, fragmento de ruta con espacios interpretado como versión;
CLI anunció54322 en lugar del54422 autorizado. Ese intento se detuvo sin cambios.
Reintento posterior autorizado: CLI3.1.0 directa sin shell, argumentos separados y destino
explícito de loopback54422; identidad PostgreSQL por TCP y Docker coincidente, consulta de
migraciones previa y5 regresiones de argumentos aprobadas. Reparaciones oficiales una por
una20261115030159/20261115033925/20261115151745: historial13→14→15→16, sin reejecutar SQL.
Verificaciones intermedias/finales READ ONLY: catálogo/ACL y huellas de datos iguales,
14 usuarios/13 perfiles/8 barberías/13 membresías/37 reservas/24care; cero sesiones/locks
de reparación o esperas. Filas anteriores del historial intactas, respaldos conservados.
Evidencia011/contracts/team-authority-2c5-result.json. Migración administrativa aún ausente,
sin cambios Cloud/servicios/interfaces.008 READ ONLY conserva su incidencia independiente;
mapa humano de propietarios y futura activación requieren autorización separada.

## Etapa 2C.4 — SQL aislado real, principal conservada

Ensayo estructural2C.3 aprobado conROLLBACK.2C.4 ejecutó guion secuencial y75 casos/
controles SQL aprobados en base desechable independiente, más2 carreras reales con espera
observada: último cupo23505 y revocación42501, sin efectos parciales. De76 casos, uno
adicional008 READ ONLY falla25006 por FOR SHARE existente; detenido, sin corregir producción.
Lectura008 normal funciona sin mutar perfil. No declarar todos aprobados ni cerrar2C.
Solo estructuraAuth sin filas y17migraciones fuente en BD aislada; no JWT/GoTrue/HTTP.
BD de prueba eliminada por nombre+OID sinFORCE. Principal catálogo/datos/huellas/historial
iguales:37reservas;13entradas de historial sin reparar,8propietarios sin asignar.
Sin activar Web/Edge ni tocar Android. Evidencia011/contracts/team-authority-2c4-result.json;
permisos posteriores separados para historial/mapa/activación, transferenciafinal bloqueada.

## Etapa 2C.2 — correcciones preparadas, no activadas

Consultas SQL de atención/invitaciones separadas de locks/DML; replay histórico de
aceptadas no otorga ni reactiva permisos, con identidad y membresía actual comprobadas.
Nueva aceptación pendiente sigue exigiendo stamp/propietario/cupo y transacción.
Auditoría LOCAL solo de catálogos READ ONLY ampliada:13 contratos/cuerpos y DDL/ACL de
agenda/cancelación/care concordantes; historial LOCAL13, sin reparar las3 entradas faltantes.
37 reservas y dependencias conservadas por conteos. Plan de reconciliación y mapa de8
propietarios preparado; no regularización, ensayoDDL, activación ni cambios de servicios.
Evidencias/procedimiento en specs/011-equipo-resumen-profesional/contracts/team-authority.md.

## Etapa 2B preparada — 19/11/2026

OpciónA de permisos fijos aprobada por el usuario. Implementación de jerarquía preparada
en fuente y migración nueva20261120010538, **sin aplicar en ningún entorno**. Propietario
explícito, máximo2 secundarios, invitaciones/cupos/retirada auditados y guardas de negocio.
Capacidades Web detrás de opción desactivada; no se rehízo la Etapa1 ni el diseño aprobado.
Transferencia final bloqueada hasta aprobar el destino del propietario anterior. Legado
requiere mapa individual, no inferencia ni degradación automática. Integración PostgreSQL
y carreras solamente preparadas; aceptación de006/Android y flags actuales sin cambios.
Detalle, pruebas y despliegue LOCAL futuro en
[contrato011](specs/011-equipo-resumen-profesional/contracts/team-authority.md).
Verificación de preparación:60 Node (4 estáticasSQL incluidas)+64 Deno aprobadas;
tipos/lint/formato/Deno/grafos/diff0. SQL real, carreras, HTTP y activación pendientes.

## Inicio y Autenticación Web aprobados — 18/11/2026

**Inicio y Autenticación Web de Barbexa: diseño y recorridos funcionales principales
aprobados manualmente por el usuario. No requieren repetición rutinaria.**
Barbexa es la marca comercial; App Barbería conserva el nombre académico/técnico.
Incluye bienvenida, navegación pública, tarjetas de Cómo funciona/Beneficios y las
interfaces de acceso, registro, confirmación/revisión de correo y recuperación/nueva clave.
Mantener estos diseños aprobados hasta solicitud posterior del usuario.

Revisión documental de todas las casillas abiertas: **003 27/36; 007 5/6**, sin cierres
adicionales. Se conservan criterios específicos Android, repeticiones no acreditadas,
negativos/sesión, seguridad pública, accesibilidad, calidad/cierre y Google integrado.
No bloquean el siguiente módulo Web: **006 — Mi cuenta / Perfil personal** (5/6;
aceptación real de edición pendiente). Medición real de carga inicial/F5 pendiente,
sin nuevos cambios al sistema de autenticación.

[Evidencias y motivos por tarea](docs/evaluacion/evidencias/003-autenticacion/informe.md#cierre-de-inicio-y-autenticación-web--18112026).
Esta consolidación solo actualizó documentación; no ejecutó pruebas funcionales ni
operaciones de cuentas, correo, OAuth, servicios o datos. Android nativo y despliegue
público quedan para sus fases posteriores. Los apartados inferiores son antecedentes.

## Aceptación Web Cloud de autenticación — 17/11/2026

El usuario acreditó registro, correo Resend, confirmación, perfil, login/logout y
recuperación de contraseña en Web de escritorio. La consulta agregada Cloud confirmó
un perfil para la única cuenta con contraseña. **003 27/36 y 007 5/6**. Ver la
[matriz y pendientes](docs/evaluacion/evidencias/003-autenticacion/informe.md#aceptación-web-cloud--17112026).

## Recuperación real local acreditada por HTTP — 15/11/2026

Una cuenta ficticia dedicada nueva, un único correo efectivo Mailpit y19 comprobaciones
reales con adaptador/SDK app: enlaceLAN.16 correcto, redirect nativo, parser/canjePKCE,
recovery restringida, clave nueva porAuth, logout y nuevo login200; clave anterior rechazada.
29 reservas intactas, sin nuevo perfil/membresía/datos negocio. Credenciales únicamente
.artifacts/recovery-local/account.json ignorado, actualizadas tras login verificado.
Fallo inicial queueMicrotask del ejecutor antes del correo, corregido sin otra cuenta/envío.
No prueba física Android/WebUI;00327/36,00428/34 y005T012 conservan pendientes finales.
Sin servicios operados, Cloud, APK, paquetes, limpieza ni Git writes. Ver evidencia003/
recovery-local-real.json. Historial anterior preservado.


## Auth local desbloqueado técnicamente — 15/11/2026

GoTruev2.197.0 sustituido una sola vez con autorización reversible. URL pública LAN.16,
URLPATHS_CONFIRMATION/RECOVERY=/auth/v1/verify; salud HTTP200 loopback/LAN. Imagen,IP.2,
aliasauth,JWT/issuer/SMTP/DB/redirects y resto de configuración preservados. Original
_recovery_backup detenido conservado; _t013_backup intacto. No otros servicios operados,
correos enviados ni contraseñas/datos modificados.3 pruebas del operador aprobadas y
lint/formato0.00327/36,00428/34 y005T012 siguen pendientes del recorrido real conjunto.
No volver a sustituir ni limpiar backups sin autorización. Ver evidencia003/us5-implementacion.md.


## 005 — pruebas reales acreditadas — 15/11/2026

T011 cerrada:91 comprobaciones reales SQL/HTTP/JWT y10 pares concurrentes (2 conexiones
observadas,1 éxito/1 conflicto por par) aprobados. Cash/Yape, atención/pago independientes,
inasistencia10min, reembolso total auditado, rollback, idempotencia y aislamiento/roles/
revocación con mismo JWT.13 reservas anteriores y dependencias intactas;16 citas nuevas
autorizadas conservadas,2 manuales sin operar. No limpieza ni dinero movido.
Docker responde; único Edge nuevo detenido255 recuperado con un inicio autorizado;
resto de servicios no operados. Auth/REST200,Edge204. Deduplicación005 corregida por scope:6
tests dirigidos y tipos/lint/grafo0. T012 física/filtros finales pendiente,00327/36 y
00428/34 sin cambios. Sin APK/paquetes/Cloud/Git writes ni rediseño. Ver
specs/005-atencion-pagos-manuales/real-tests.json y quickstart.md.

Los apartados inferiores conservan verificaciones históricas.

## 005 — implementación local, validación de negocio pendiente — 15/11/2026

00327/36 y00428/34 sin cierres nuevos.005 cuenta con plan/contratos y código de atención,
pago manual, configuración, historial y reembolso externo total; UI compartida sin rediseño.
Migración20261115151745_care_payments.sql creada por CLI, validada con rollback y aplicada
solo LOCAL54422 con autorización: tres tablas privadas/RLS, RPC service_role, guarda de
cancelación y cierre de confirmación antigua sin pago.13 reservas misma huella,0 filas
financieras/0 eventos; sin fixtures nuevos. Edge nuevo inició una sola vez con permiso,
OPTIONS204/POST sin sesión401; sin otros servicios operados. Desarrollo local habilitado.
Check general0:161 unitarias,177cliente,39Deno,38/45checkers,18guardas; posterior cliente179.
Filtros de atención/pago añadidos con lecturas autorizadas y14 pruebas afectadas/tipos/lint0.
Pendiente: cobros/reembolsos/transiciones/JWT positivos y carreras con datos autorizados,
E2E Web/Android. SQL estructural11/11 y lectura heredada no sustituyen esas pruebas.
No se declara005 completa. GoTrue/Cloud/nueve avisos npm siguen pendientes; sin APK,paquetes,
limpieza ni Git writes. Ver specs/005-atencion-pagos-manuales/quickstart.md.


## Prioridad funcional y atención/pagos — 15/11/2026

**003: 27/36; 004: 28/34**, comprobadas contra las casillas actuales. Rediseño detenido
por decisión del usuario; se conservan los cambios previos sin declarar validación física
de su presentación. No se cierran gates manuales ni las discrepancias T013/T027 de004.

Verificación actual: check completo0;157 unitarias,172 cliente,38/45 checkers,18 guardas
y36 Deno. Bundles completos Web/Android200, sin APK. Revisión acotada125 archivos sin
patrones sensibles detectados. [Resultados y límites](docs/evaluacion/evidencias/004-reservas/calidad.md).

Correcciones funcionales: saneamiento de retornos Auth coordinado con Expo Router, sin
segundo canje PKCE; fallo al generar el identificador de cancelación antes del envío ya
libera el control y permite reintentar. No se atribuye a este último la discrepancia de
cancelaciones previa, cuya causa no está acreditada. Datos T019 y siete sintéticas intactos.

Se inició únicamente Metro Development/LAN/8081 con autorización expresa; no se operó
Supabase. Auth local respondió200 por loopback y LAN `.16`. Su configuración de correo
todavía usa `.33` para confirmación y `127.0.0.1` para recuperación: requiere corrección
persistente autorizada antes de validar nuevos enlaces Android. No correos/cambios de clave.

[005 — atención y pagos manuales](specs/005-atencion-pagos-manuales/spec.md): borrador
de4 historias,18FR y6SC, contrastado con la propuesta aprobada; tres decisiones funcionales
confirmadas por el usuario (tolerancia10min, atención/pago independientes y reembolso total
externo con auditoría). No implementado; no tablas, migraciones ni dinero movido. Siguiente
bloque: revisión del alcance y planificación de compatibilidad/contratos/SQL aditivo,
antes de solicitar autorización concreta para aplicarlo. El producto completo aún incluye
Google y otros módulos posteriores; una reserva confirmada no equivale a atención o pago.

Sin instalaciones, APK, Cloud, cambios de datos, staging/commit/push ni edición del log activo.
Nueve avisos npm moderados continúan sin remediación. Los apartados inferiores son históricos.

## Recuperación003 y consolidación004 — 15/11/2026

**003: 27/36**, T028–T030 implementadas: solicitud no enumerativa, PKCE con propósito
verificado, binding de sesión restringida, cambio de clave y cierre local; pantallas
Web/Android compartidas. T031/T032 requieren correo/retorno real; no se enviaron correos
ni se modificaron claves/cuentas. [Implementación y límites](docs/evaluacion/evidencias/003-autenticacion/us5-implementacion.md).

**004: 28/34**, T028 caché comercial acotada/medida, T029 calidad y T031 preparación de
pipeline/guía acreditadas. Check general0:157 unitarias,160 integración/presentación,
38/45 regresiones arquitectónicas,18 guardas y36 Deno. Núcleo cliente100% líneas/funciones,
94,89% ramas; servidor100% en las tres métricas. Bundles completos Metro Web/Android200,
sin APK nuevo ni ejecución física atribuida. Tipografía/paleta compartidas ajustadas;
revisión visual y accesibilidad finales siguen pendientes. [Calidad](docs/evaluacion/evidencias/004-reservas/calidad.md).

T013/T027 no se cierran: el usuario declaró publicación/invitaciones/cancelaciones correctas,
pero la consulta local posterior mostró invitación pendiente y ambas citas manuales aún
confirmadas/cero eventos. Se conserva la discrepancia sin alterar datos. T019 y las siete
sintéticas permanecen; no se repiten operaciones. El usuario difirió la revisión al
[único recorrido integral](docs/evaluacion/recorrido-integral-final.md).

Pendientes: URL pública GoTrue local `.33→.16` persistente requiere autorización específica;
correo/clave ficticia de recuperación también. Cloud/origen Web/DNS/CDN/CSP/k6 no operados;
workflow local sin CI remoto/CD. [Matriz real de16 criterios](docs/evaluacion/matriz-cumplimiento.md).
Nueve avisos npm moderados,3 sin dev, siguen sin remediación/aceptación. No staging/commit/
push, instalaciones, migraciones, servicios reiniciados, limpieza ni edición del log activo.
Los siguientes apartados conservan estados históricos, no afirmaciones del estado actual.

## 004 — cancelación local preparada — 14/11/2026

**25/34**: T023 acreditada por el usuario en Web/Android; T024–T026 verificadas técnicamente.
T013 oferta/invitación y T027 cancelación manual pendientes. Backend autoriza por actor,
propiedad/membresía actual, snapshot temporal y motivo staff; estado/evento/liberación atómicos.
Nueva migración exclusivamente LOCAL de funciones, sin RLS/ACL históricas ni cambios Cloud.
SQL12, integración13+histórica1+Barbero8,48 tests dirigidos+8 adaptador,3 unitarias y9 Deno.
Tipos/lint/formato/arquitectura aprobados.7 reservas sintéticas conservadas,2 manuales sin
cancelar; ninguna T019 alterada. Membresía A restaurada exactamente tras prueba autorizada.
[Evidencias y límites](docs/evaluacion/evidencias/004-reservas/cancellation.md).
003 sigue24/36, recuperación pendiente;9 avisos npm sin remediación y URL Auth antigua
diferida. Sin T028+, nuevos APK/paquetes, servicios reiniciados, log activo editado ni
git add/commit/push. Los apartados siguientes conservan los estados anteriores.

## 004 — agendas locales preparadas — 14/11/2026

**21/34**. T019 cerrada con confirmación manual del usuario sobre reservas, F5/entrada
directa, retorno de pestaña/app y logout seguro en Web/Android. T020–T022 verificadas:
agenda contextual, nueva RPC local autorizada, filtros y UI /agenda. SQL4, HTTP12, roles9
con JWT real,44 tests dirigidos, tipos/lint/formato/arquitectura0; grafos Metro ambos200.
Prueba temporal autorizada restauró exactamente membresía A y quitó solo1 membresía/1
perfil B, residuos0; cuentas/servicios/reservas T019 conservados. No nuevas reservas.
T013: falta oferta/publicación/invitaciones reales en ambas plataformas. T023: falta
demo UI de agendas usando las citas ya existentes. No se ejecutó T024+.
[Evidencia](docs/evaluacion/evidencias/004-reservas/agenda.md).
003 sigue24/36, recuperación pendiente;9 avisos npm sin remediación. URL pública Auth
antigua diferida por decisión del usuario. Sin Cloud, APK/paquetes, servicios reiniciados,
log activo editado, commit o push. Los apartados siguientes conservan el historial.

## 004 — confirmación y pantallas cliente preparadas — 14/11/2026

**17/34**: T017/T018 cerradas; T013/T019 pendientes de UI real Web/Android. Edge
reservation-command→RPC atómica, actor Auth002, sin migraciones nuevas.8 RED→GREEN,
147 unitarias,53 dirigidas,7 servidor,9 TAP HTTP, tipos/lint/formato/grafos aprobados.
Bundles Metro Web/Android200 no equivalen a prueba de teléfono. No agenda todavía.
[Evidencia vigente](docs/evaluacion/evidencias/004-reservas/t017-t019/resultado.md).

Conjunto nuevo autorizado conservado para manual:3 cuentas,2 barberías,3 citas automáticas;
credenciales solo en .artifacts ignorado. No cleanup hasta confirmación del usuario.
**Entorno recuperado:** el usuario restableció Docker; Auth200. Se inició únicamente el
mismo Edge Runtime nuevo tras verificar nombre, red y montaje; API204/401/403 esperados.
Datos conservados y listos para recorrido, sin recrear fixtures ni operar otros contenedores.
No Cloud/paquetes/APK/commit/push ni edición del log activo.
003 sigue24/36, recuperación pendiente y nueve avisos npm sin remediar. Ruta siguiente:
T020→T021→T022, con T023 esperando evidencia T019 para demo Android→agenda admin Web.
Los apartados inferiores conservan el historial.

## 004 — motor atómico local y cliente de oferta — 14/11/2026

**15/34**: T001–T012,T014–T016 cerradas. T013 pendiente de recorrido Web/Android;
T017+ no ejecutadas. Nueva migración local20261114224344_booking_atomic.sql: tres tablas,
RLS/ACL/slots/confirmación, snapshots, idempotencia y exclusión de persona entre barberías.
Diez pares concurrentes reales: una confirmación por par, sin dobles ni parciales.
137 unitarias,23 integración/UI afectadas y18 SQL estructurales; calidad aprobada.
Operador integral inicial exit1 por expectativa HTTP de Edge usada sobre PostgREST;
comprobación mínima adicional exit0 (P0002/500), sin repetir toda la suite ni crear cuentas.
Ocho RED de aplicación están preparadas para T017, no se ocultan como GREEN.
[Evidencias y límites](docs/evaluacion/evidencias/004-reservas/t012-t016/resultado.md).

Conjunto autorizado5 cuentas/2 barberías/17 reservas limpiado selectivamente,0 residuos;
cuentas/perfiles anteriores conservados. Contenedores anteriores/reproducción intactos
en identidad/montajes; vector antiguo sigue su reinicio autónomo, no se operó. No Cloud,
paquetes, APK, correos, commits/push ni edición del log activo. Nueve avisos npm pendientes.
Ruta crítica: T017 (Edge/cliente)→T018 (pantalla reserva), después T020–T023 (agendas/demo).
003 sigue24/36; recuperación de contraseña obligatoria antes de evaluación.
Los apartados inferiores conservan los estados históricos.

## 004 — operaciones e invitaciones verificadas — 14/11/2026

004: **11/34**, T001–T011 cerradas. RPC/casos de uso/adaptador/handler local para oferta,
publicación, profesionales, horarios e invitaciones. Auth002 reutilizado mediante composición
pública; sin rol global, sin acceso por invitación pendiente. SQL23/23, HTTP9/9 TAP,
tres carreras de dos conexiones,27 servidor, gate de núcleo100% y calidad0.
[Detalle](docs/evaluacion/evidencias/004-reservas/t008-t011/resultado.md).
Conjunto temporal autorizado4 cuentas/2 barberías eliminado selectivamente y sin residuos
de negocio; datos anteriores conservados. Migraciones locales20261114202045 y20261114220827
aditivas, sin editar versiones aplicadas. No hay pantallas/motor de reservas nuevos.
Siguiente ruta corta backendT014–T016 tras T009; T012–T013 de oferta UI pueden avanzar sin
bloquear ese SQL. Luego Edge/cliente y agenda para la demo Android→Web. Recuperación003
sigue requerida antes de evaluación;003 continúa24/36. Nueve avisos npm sin remediar.
Sin Cloud, RLS/JWT/Kong/GoTrue cambiados, paquetes/APK, commit/push ni edición del log activo.
Los estados inferiores conservan el historial.

## 004 — catálogo/ACL y contratos preparados — 14/11/2026

004: **7/34**. T001–T007 cerradas tras revisión coherente y autorización del bloque.
[Informe](docs/evaluacion/evidencias/004-reservas/informe.md). Migración local
20261114195018_booking_catalog.sql aplicada únicamente a app-barberia-002-local:54422:
ocho tablas de oferta/personal, RLS/ACL, índices/FKs y contención/exclusiones de horarios.
108/108 SQL nuevas y336/336 regresiones002;134 unitarias,5 servidor,23 runner; tipos,
lint/formato y grafos cliente/servidor0. Núcleos/puertos propios, sin frameworks ni imports
cruzados prohibidos. Datos anteriores conservados, cero filas nuevas persistentes.

No hay aún RPC de oferta/invitación, pantallas de negocio, tablas/confirmación atómica ni
concurrencia de reservas acreditada: T008+ sin ejecutar. Siguiente bloque T008–T011;
luego UI de oferta y backend atómico para demo Android→administrador Web. Recuperación003
sigue obligatoria antes de evaluación;003 se conserva en24/36 con sus pendientes exactos.
Nueve avisos npm moderados sin remediar. Sin Cloud, datos/usuarios persistentes, paquetes,
APK, cambios del log activo, commit/push. Estado anterior de003 conservado abajo.

## Sesión/contexto y preparación de reservas — 14/11/2026

003: **24/36**. Cerradas T018,T020–T022,T024–T027. El usuario acreditó Web y Android
(cero/una/varias membresías, admin-A/barbero-B, reapertura, red, revocación y multipestaña
Web). Limpieza T027 selectiva:3 cuentas/perfiles,2 barberías,4 membresías retiradas;0
residuos y datos anteriores conservados.129 unitarias,73 integración/UI,11 verificaciones
SQL/HTTP locales; tipos/lint/formato/grafo0.
[Resultados y límites](docs/evaluacion/evidencias/003-autenticacion/t018-t027/resultado.md).
T014,T019,T023 siguen pendientes de sus escenarios concretos; T028–T036 sin ejecutar.
Recuperación de contraseña es obligatoria antes de evaluación.

004: [borrador de reservas](specs/004-mvp-reservas/spec.md),4 historias,28FR,6SC,34 tareas
pendientes de aprobación,0 ejecutadas. Primer bloque propuesto T001–T007; no migraciones
ni backend004 implementados. Cancelación120min configurable, invitación interna aceptada,
admin profesional explícito y exclusión física entre tenants documentados. Sin pagos ni
Google en este MVP; siguen obligaciones posteriores del producto. Nueve avisos npm y
riesgo XSS residual continúan. Sin Cloud, nuevas dependencias/APK, commit/push o cambios
al log activo. Historial inferior conservado.

## Estado vigente T014–T017 — 14/11/2026

003: **16/36**. T015–T017 cerradas: login/logout y cuenta protegida implementados;
usuario confirmó éxito en Web y Android, clave inválida controlada y Atrás sin acceso
tras salir.116 unitarias y76 integración/presentación, calidad0; no nueva build.
[Evidencia y ruta crítica](docs/evaluacion/evidencias/003-autenticacion/t014-t017/resultado.md).
T014 sigue parcial por tres recorridos/casos ampliados reales y duplicados/limpieza;
no se repitieron registro/correos. Siguiente implementación disponible T018–T023
(sesión/invalidación), luego contexto por membresía T024–T027; negocio requiere catálogo/
horarios y reserva atómica previa spec/plan. No se inició ese trabajo. Datos/log activo
conservados; riesgos npm/XSS vigentes. Sin Cloud, cambios de políticas, dependencias,
servicios, commit ni push. Historial inferior conservado.

## Cierre vigente T011/T013 — 14/11/2026

003: **13/36**. T011 y T013 cerradas: el usuario acreditó registro, Mailpit,
confirmación y perfil propio en Web y Android Development; no pruebas ejecutadas por
Codex. [Cotejo y evidencia manual](docs/evaluacion/evidencias/003-autenticacion/t013/cierre-manual.md).
Pruebas técnicas anteriores reutilizadas, sin nuevas ejecuciones. T014 pendiente y
siguiente bloque recomendado; no se declaran SC completos. Cuentas locales conservadas,
tipografía manuscrita Android/espaciado irregular como mejora UI futura. Sin código,
configuración, datos, servicios, APK, dependencias, commit/push ni log activo modificados.
Riesgos npm/XSS vigentes. Los estados inferiores conservan el historial anterior.

## Estado vigente T013 — 14/11/2026

003: **11/36**, T011/T013 pendientes de validación funcional Web y Android.
Registro/confirmación/perfil y provider raíz integrados;108 unitarias,65 integración/UI,
tipos/lint/formato/arquitectura0. Bundles Development Web/Android comprobados; no prueba
de registro real. Auth local:2 URLs públicas LAN autorizadas, demás controles conservados;
Metro reiniciado con autorización explícita,8081/Development/LAN. Sin cuentas creadas,
Cloud, nuevo APK ni T014. [Evidencia y recorrido único](docs/evaluacion/evidencias/003-autenticacion/t013/resultado.md).
Cambios previos y log activo conservados, sin commit/push. Riesgos npm/XSS no resueltos.

## Estado vigente T012/T011 — 14/11/2026

003: **11/36**, T012 cerrada mediante evidencia manual Web/Android/TalkBack del usuario;
muestra retirada. T011 implementada,17 pruebas originales GREEN,106 unitarias/43 integración,
calidad0; pendiente de recorrido real por instrucción del usuario, sin T013/T014 ni cuentas
creadas. [Detalle y dependencia de vistas](docs/evaluacion/evidencias/003-autenticacion/t011/resultado.md).
No cambios Cloud, Kong, seguridad, APK o dependencias. Riesgos npm/XSS conservados.

## Avance vigente T010/T012 — 14/11/2026

003: **10/36**; T010 RED acreditado (11 unitarias+6 integración pendientes de T011).
T012 campo accesible implementado y8/8 presentación, calidad0, aún pendiente de recorrido
real Web y Android. Muestra temporal Development sin backend; retirar al recibir evidencia.
[Detalle](docs/evaluacion/evidencias/003-autenticacion/t010-t012/resultado.md).
T011/T013/T014 no ejecutadas. Los estados inferiores se conservan como antecedentes.

## Actualización vigente de003 — 14/11/2026

T001–T009 verificadas, **9/36**. Build development único, instalación/API y schemes Android
acreditados por usuario; sondas retiradas. CORS local de Functions corregido en handler y
Kong,22/22 API pública y2/2 operador. Auth/REST/JWT y otros servicios preservados. La
recreación de Kong requiere reaplicar el operador documentado, no es persistencia automática.
[Cierre T009](docs/evaluacion/evidencias/003-autenticacion/t009/kong-cierre.md).
T010+ no ejecutadas; siguiente bloque propuesto T010+T012 → T011 → T013 → T014,
Web primero e inmediatamente Android. Riesgos npm/XSS previos siguen sin remediación.
Sin nuevo commit/push. La sección inferior conserva el estado histórico anterior.

## Preparación vigente de 003 — 13/11/2026

Especificación [003](specs/003-autenticacion-navegacion/spec.md) aprobada para planificación;
[plan técnico](specs/003-autenticacion-navegacion/plan.md) y 36 tareas aprobados. Preparación:
T001–T008 verificadas (8/36); T005/T007 con evidencia Android manual del usuario y sondas
retiradas. T008 composición mínima verificada, sin flujos Auth ni pantallas. EAS elegido y URLs/local/Mailpit/Cloud posterior
y límites de datos aprobados como decisiones, sin permisos de instalación/build/mutación;
[evidencia](docs/evaluacion/evidencias/003-autenticacion/informe.md). Núcleo y almacenamiento
implementados; adaptador/composición Auth mínimos, sin integración de historias o pantallas.
Constitución 2.0.0: Web/Android simultáneos, ligera prioridad Web y
aceptación funcional obligatoria de ambas desde 003; no modifica resultados históricos.
Registro/login/logout local, sesión/perfil/contexto y recuperación; Google posterior,
obligatorio en producto. Reutilizar 002, sin nuevas migraciones/Edge. Pendientes operativos:
configuración efectiva de origen/redirects/correo/CORS, build Android para enlaces y
riesgo XSS de persistencia SPA. T005 autorizada posteriormente: SDK2.119.0 y
SecureStore58.0.3 instalados. Parche Expo58.0.25 autorizado aplicado sin cambio transitivo,
Check0/Doctor20 de20 y capacidades Chrome localhost comprobadas; Hermes/crypto confirmado
manualmente por usuario. T007 SecureStore real confirmado; T008 SDK/puente cripto y
composición con almacenamiento por plataforma, sin autenticación funcional entregada.
Audit posterior ocho moderados/tres sin dev frente a nueve/tres, sin remediación acreditada.
No configuración Cloud cambiada; T009+ no iniciadas. Evidencia en informe 003/T005–T008.
Riesgo npm sin remediación acreditada; log activo intacto. Checkpoint documental previo 0ccd33c;
esta continuación no hace commit/push ni inicia T009+.

## Cierre previo de 001/002 (histórico conservado)

13/11/2026, America/Lima. Fundación 001 cerrada; fundación 002 cerrada técnicamente conforme a sus 40 tareas y límites de evidencia. No es el SaaS terminado ni el inicio de 003. Rama main; checkpoint anterior 42a695c. El hash de cierre se consulta en Git, no se predice en este archivo.

[Constitución](.specify/memory/constitution.md), [rúbrica](docs/evaluacion/RUBRICA.md), [spec 002](specs/002-fundacion-supabase-multitenant/spec.md), [tareas](specs/002-fundacion-supabase-multitenant/tasks.md), [informe y trazabilidad](docs/evaluacion/evidencias/002-fundacion/informe.md), [guía](specs/002-fundacion-supabase-multitenant/quickstart.md), [cierre/integridad](docs/evaluacion/evidencias/002-fundacion/cierre.md).

Modelo profiles/barbershops/barbershop_memberships, membresías activas/contextuales y RLS; Clean Architecture y composición cliente/Edge. Cinco migraciones en Cloud nuevo vuoncrtkkkquvddunrxx/sa-east-1; ensure-profile/create-barbershop ACTIVE v1, verify_jwt=true. PostgreSQL 17.11, Auth v2.197.0; runtime Edge numérico no observado. GraphQL opcional, extensión no instalada; sin cambio de configuración exigido.

Local: SQL 336/336, HTTP 440/440, calidad y reproducción con evidencia; Cloud: estructura 83/83, negativas 10/10, aislamiento/roles/revocación y edición propia 7/7. Resultados y atribuciones separadas en informe. Primeros fallos de expectativas/callback y sus correcciones conservados. Fixtures limpiadas; no invalidez inmediata garantizada de JWT. Sin nuevas pruebas Android/Google/UI 002.

Riesgos: nueve avisos npm moderados sin remediación/aceptación formal. No auditoría global aprobada. Caché, DNS/CDN, CI/CD, k6 y escalabilidad completa siguen pendientes; también negocio, Google/pantallas Auth, invitaciones, Storage/imágenes, mapas/reseñas y notificaciones. No administrador global, API Node propia o microservicios.

No operar el Supabase antiguo ni sus contenedores. Log activo t017-serve.log preservado y excluido del commit. Cierre local autorizado; sin push. Para la próxima funcionalidad: primero especificación/decisiones y autorización de su alcance; no se inicia 003 aquí.

## Registro histórico heredado de 001 (no estado actual)

# Estado de desarrollo — App Barbería

Actualizado: 11/11/2026, America/Lima. Feature activa:
`001-fundacion-expo-clean`. Rama `main`, HEAD
`66c2f39448274e0ccb8ed47c09bf48d78e9177d4`.
**T001–T040 completadas: fundación 001 cerrada técnicamente**, conforme al alcance
revisado y límites documentados; no es el cierre del producto SaaS. Hay documentación T036–T040 sin
commit; no se ha hecho commit/push por el agente.

Contexto obligatorio: [AGENTS.md](AGENTS.md),
[Constitución v1.0.1](.specify/memory/constitution.md),
[especificación vigente](specs/001-fundacion-expo-clean/spec.md),
[tareas](specs/001-fundacion-expo-clean/tasks.md).
El [informe consolidado](docs/evaluacion/evidencias/001-fundacion/informe.md)
vincula los 11 FR y 6 SC, resultados, atribuciones y límites; la
[rúbrica](docs/evaluacion/RUBRICA.md) conserva los 16 criterios académicos.

## Avances demostrados

- Expo integrado al Git existente con inventarios y copia controlada. Expo
  58.0.24, Router 58.0.31, Constants 58.0.16, Linking 58.0.17; React 19.3.0,
  React Native 0.88.1, TypeScript 6.0.3. Versiones efectivas y comandos en la
  [guía de reproducción](docs/evaluacion/evidencias/001-fundacion/reproduccion.md).
- Cliente modular por funcionalidad con dominio/aplicación independientes,
  puerto propio, caso de uso, adaptador local sustituible y composición explícita.
  El contexto de presentación expone el caso de uso; las vistas no importan
  infraestructura. Sin Supabase ni entidades de negocio ficticias.
- Expo Router: Bienvenida, Base técnica y ruta desconocida, con retorno y
  recuperación. Consulta real de metadatos locales, carga/error/reintento y
  galería de cuatro estados diferenciada de la consulta.
- UI compartida con tokens, texto escalable, controles con mínimos configurados
  48×48, roles/etiquetas/disabled, scroll y zonas seguras; contraste calculado.
- [Reproducción limpia T037](docs/evaluacion/evidencias/001-fundacion/t037.md):
  npm ci en copia externa, sin tocar node_modules principal. Check en 0:
  67 unitarias, 38 regresiones arquitectónicas y 11 de presentación. Checker:
  21 módulos, 4 del núcleo y 37 aristas. Tipos, lint, formato y compatibilidad
  aprobados, Doctor 20/20 y bundle Android/Hermes de producción generado.
  Los 799 hashes previos coincidieron en ambas carpetas. Primer EACCES y
  reintento autorizado conservados en
  [reproduccion.log](docs/evaluacion/evidencias/001-fundacion/reproduccion.log).
  Cobertura 100 % solo del núcleo ejecutable, no de UI o de toda la aplicación.

Estos resultados se reutilizan de las evidencias; no se repitieron en T039.

## Android y decisiones autorizadas

Las pruebas físicas son **declaradas por el usuario**, no ejecutadas por Codex:
Honor 90 Lite CRT-NX3, Android 15, Expo Go 58.0.5, LAN. Recorridos, cabecera/Atrás,
fallback, reinicio sin credenciales, información y galería/recuperación acreditados.
[Registro Android](docs/evaluacion/evidencias/001-fundacion/android-final.md).

- T033: se acepta funcionamiento local de la aplicación previamente cargada sin
  internet; no se exige Metro simultáneo. No se probó arranque offline instalado.
- T034: cierre con uso TalkBack y ausencia de obstrucciones reportados, comprobación
  técnica y pruebas automatizadas; sin nuevas mediciones instrumentales nativas.
  [Decisión y límites](docs/evaluacion/evidencias/001-fundacion/android-talkback.md).
- T035/US3/SC-005: enmienda explícita acepta máximo de texto disponible en el
  Android identificado, legible y funcional sin recortes/superposiciones, junto
  con componentes/contraste. **No se midió 200 % exacto ni dimensiones nativas de
  ese escalado**; esa validación es futura, no condición vigente de esta fundación.
  [Enmienda y evidencia](docs/evaluacion/evidencias/001-fundacion/android-texto-contraste.md).

## Arquitectura y composiciones posteriores

Mantener cliente-servidor y tres capas lógicas; sin API Node propia ni
microservicios de negocio. El cliente conectará casos de uso con adaptadores
SDK/HTTP mediante sus contratos y raíz de composición. Auth, Edge Functions,
PostgREST, PostgreSQL y Storage aún no están integrados.

El servidor tendrá entrada/composición independiente en Edge Functions, con
dominio/aplicación propios y adaptadores de persistencia. La entrada verificará
sesión; PostgreSQL resolverá permisos contextuales, membresías activas, RLS,
barbería, precios y disponibilidad con transacciones y restricciones concurrentes.
El flujo aprobado conserva ReservaRemotaGateway y ReservaAtomicaGateway. Storage
requiere políticas y recuperación ante fallos parciales al asociar referencias;
no comparte transacción con PostgreSQL. Diseño, no funcionalidad ya implementada:
[límites de backend](docs/evaluacion/evidencias/001-fundacion/limites-backend.md).

## Pendientes reales y siguiente paso

- **T040 completada**: cotejo final de los 585 originales: 581 idénticos y cuatro
  documentos con diferencias autorizadas; sin eliminaciones ni cambios inesperados.
  [Cierre técnico y registro de integridad](docs/evaluacion/evidencias/001-fundacion/cierre.md).
- **9 vulnerabilidades moderadas npm** reportadas en T037: análisis pendiente,
  sin aceptación formal ni auditoría de seguridad aprobada. Falta clasificar
  producción/desarrollo, directas/transitivas, exposición y acciones. No se usó
  audit fix, force ni actualización automática.
- Backend multitenant, permisos, reservas atómicas y concurrencia, imágenes,
  identidad, pagos manuales y demás negocio: futuras funcionalidades especificadas
  antes de implementar. La operación local no acredita garantías de servidor.
- Caché: implementar según la rúbrica y medir invalidación, aislamiento y
  rendimiento; caché de disponibilidad nunca autoriza confirmar una reserva.
- DNS/CDN, dominio/subdominio, CI/CD y k6: obligaciones futuras sin implementación
  ni pruebas acreditadas. Faltan también escalabilidad frontend/backend/BD,
  entrega/sustentación y validaciones web/iOS. No confundir check local con CI/CD
  ni bundle con prueba Android. Contribución parcial a rúbrica 1–7; 8–16 pendientes.
- Validación futura exacta al 200 %, mediciones nativas y arranque offline: no
  acreditados; no se reabren silenciosamente los criterios revisados.

T039 creó este contexto y marcó su casilla; T040 actualizó solo su estado de cierre.
Se actualizaron el informe y el estado para reflejar el cierre. AGENTS.md,
Constitución, especificación, plan, código, dependencias y registros históricos
se conservaron. Sin instalaciones o verificaciones costosas nuevas, commit o push.
