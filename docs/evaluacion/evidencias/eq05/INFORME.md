# EQ-05 — evaluación local de disponibilidad durante una hora

26/11/2026, America/Lima. **Objetivo local de la ventana alcanzado.** El escenario original mensual no queda acreditado. Adaptación académica de una hora autorizada por el responsable y **pendiente de aceptación docente**. No se modificaron funcionalidades, Cloud, migraciones ni Actions; sin k6, commits o push.

## Ventana y resultado observado

| Dato | Resultado |
| --- | --- |
| Serie local | 8dd877ab-4d18-4213-928d-e9217e39f7da |
| Inicio Lima | 26/11/26, 3:27:14 p. m. |
| Fin Lima | 26/11/26, 4:27:14 p. m. |
| Duración programada | 3.600 s |
| Duración real del proceso de ventana | 3.600,003 s |
| Intervalo / sondeos programados | 10 s / 360 |
| Disponibles | 360 |
| No disponibles | 0 |
| Sin datos | 0 |
| Tiempo estimado disponible | 3.600 s |
| Tiempo observado clasificado | 3.600 s |
| Disponibilidad sobre observado | 100,0000 % |
| Cobertura del periodo programado | 100,0000 % |
| Límite inferior sobre todo el periodo | 100,0000 % |
| Objetivo local ≥99,5 % | Sí |
| Cobertura completa | Sí |
| Interrupciones detectadas | 0 |
| Periodos sin datos | 0 |
| Mantenimientos declarados | Ninguno comunicado; no equivale a ausencia demostrada de mantenimiento |
| Motivo de detención anticipada | Ninguno |

Cada sondeo se asigna a un intervalo nominal de 10 segundos. Es una **estimación por muestreo**, no una observación continua ni una promesa estadística de disponibilidad futura. El reloj monotónico rige duración y programación; los timestamps UTC/Lima son de presentación. Intervalos programados t=0…3.590 s; se espera hasta completar 3.600 s, no se termina al responder el último sondeo.

Disponibilidad = disponibles /(disponibles+no disponibles) ×100. Cobertura = intervalos clasificados /360 ×100. Límite inferior del periodo = disponibles /360 ×100. Sin datos no se cuenta como éxito ni se mezcla con una caída confirmada. Los tres porcentajes se informan juntos; ausencia de observación total daría disponibilidad=null, nunca 100 %.

## Protocolo fijado antes de iniciar

[Protocolo previo](PROTOCOLO.md), [configuración con timestamp](protocolo-previo.json) y [escenario original](criterio-original-eq05.md). Se conserva 99,5 %, sin reajustarlo según resultados.

Un solo sondeo secuencial con autenticación password real de una cuenta sintética dedicada, catálogo, disponibilidad, reservas propias, confirmación, lectura de persistencia, cancelación propia y lectura de cancelación. Solo HTTP al laboratorio `127.0.0.1:54721`, sin redirecciones ni mocks. El servicio está publicado en el catálogo **local**, no desplegado públicamente.

Límites previos: **10 s por petición y 30 s por flujo**, incluidas comprobaciones y limpieza. Cualquier HTTP o contrato inesperado, error de transporte o timeout clasifica el intervalo como no disponible. No hay reintentos dentro de la medición. Si un flujo ocupa el siguiente intervalo o el inicio llega más de 1 s tarde, se registra **sin datos**, sin ráfagas de recuperación. No se sustituyen intervalos fallidos por otros posteriores.

Las protecciones críticas/sostenidas de RAM, CPU y conexiones siguen activas. Las estimaciones preventivas no bloquean por exigir una cifra fija de RAM. El monitor de recursos consulta PostgreSQL fuera del tiempo del flujo: si falla, los intervalos restantes se registran sin datos, sin imputar disponibilidad al backend. No se inyectaron fallos ni reiniciaron servicios durante la ventana.

## Tiempos reales del flujo

| Tiempo de flujo completo | ms |
| --- | --- |
| Media | 271,93 |
| p50 | 267,84 |
| p95 | 312,39 |
| p99 | 346,69 |
| Máximo | 371,91 |

Percentiles calculados offline con orden estadístico inferior `floor((N−1)·p)`; no son la agregación ni el resultado de k6. Se incluyen intentos fallidos que hayan comenzado, si existen; los intervalos sin datos no reciben latencias cero.

| Paso | Muestras | Fallos | Media ms | p50 ms | p95 ms | p99 ms | Máximo ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| auth | 360 | 0 | 51,32 | 50,19 | 58,44 | 59,88 | 88,98 |
| catalog | 360 | 0 | 13,09 | 12,52 | 16,13 | 23,61 | 62,76 |
| slots | 360 | 0 | 6,15 | 5,98 | 7,44 | 8,60 | 13,53 |
| reservations | 360 | 0 | 10,57 | 10,37 | 17,07 | 18,10 | 18,54 |
| confirm | 360 | 0 | 92,11 | 90,78 | 114,12 | 125,33 | 136,08 |
| verify-persistence | 360 | 0 | 3,87 | 3,82 | 5,09 | 5,66 | 6,04 |
| cleanup-cancel | 360 | 0 | 90,50 | 89,33 | 114,20 | 123,77 | 162,28 |
| verify-cleanup | 360 | 0 | 3,78 | 3,66 | 4,96 | 5,90 | 7,52 |

## Recursos y alcance de la supervisión

| Medición real | Resultado |
| --- | --- |
| CPU host media / máxima | 3,51 / 12,97 % |
| RAM host media / máxima | 83,42 / 89,89 % |
| RAM libre mínima | 1,561 GiB |
| Sesiones PostgreSQL mín. / máx. / límite | 18 / 18 / 100 |
| Muestras RAM/conexiones; CPU con intervalo | 361; 360 |

La primera lectura de CPU establece la línea base antes del inicio: su cero crudo se conserva, pero no se usa como muestra de CPU observada ni se presenta como dato medido dentro de la hora. CSV separa `raw_cpu_percent` y `cpu_percent` (vacío en esa línea). Las medidas son del **host compartido**, no consumo exclusivo de BARBEXA, Docker o cada contenedor. No se dispone de CPU/RAM individual por servicio en esta campaña; no se inventan. Las conexiones son instantáneas muestreadas, no máximos continuos.

Se verificaron offline **2880 peticiones HTTP** (ocho pasos ×360) y se recalculó cada resultado desde el registro original, contrastándolo con el resumen, ledger, historial y auditoría SQL guardada. No se ejecutó una nueva consulta SQL ni se repitió el monitor durante la consolidación. [Auditoría offline](auditoria-offline.json) y [huellas de ambos intentos](preservacion-sha256.json).


## Interrupciones, errores y recuperaciones

No se detectaron intervalos no disponibles ni periodos sin datos en esta ventana. Esto no excluye interrupciones más cortas que el muestreo.

Recuperaciones observadas tras fallo: **0**. Se conserva por sondeo el paso, estado HTTP, duración, error sanitizado y retraso de inicio en [sondeos.csv](sondeos.csv) y [peticiones.csv](peticiones.csv). El registro de eventos original y las declaraciones de mantenimiento están diferenciados. No se declara una recuperación si no hubo fallo observado.

## Integridad y limpieza exclusiva

| Comprobación | Resultado |
| --- | --- |
| Reservas anteriores preservadas | 19.110 |
| Reservas de preflight fuera de medición | 1 |
| Confirmaciones planificadas en medición | 360 |
| Reservas medidas efectivamente persistidas | 360 |
| Reservas propias conservadas en historial | 361 |
| Reservas propias activas al cierre | 0 |
| Limpiezas adicionales fuera de ventana | 0 |
| Filas anteriores verificadas | 18 tablas |
| Archivos protegidos intactos | 814 |
| Hashes históricos de evidencias intactos | 763 |

La limpieza es **lógica mediante cancelación**, no borrado físico: libera solo los turnos creados por el monitor y conserva su historial. Cada confirmación tiene un UUID anotado antes de enviarla; la conciliación SQL se limita a su barbería, cliente y ledger. Las respuestas perdidas se buscan por UUID antes de actuar; ninguna nueva reserva se crea para sustituirlas. Las limpiezas finales, si las hubo, quedan fuera de medición y no convierten sus sondeos en éxitos.

Cada reserva de esta evaluación conserva un item, un evento confirmed, un evento cancelled y una fila care. Todas quedaron canceladas. El fixture dedicado permanece identificado para reproducibilidad; no se eliminan cuentas/barbería o historiales con cascadas. Ninguna fila previa de las 18 tablas se modificó o eliminó. SQL final: 19.471 reservas globales; cero solapamientos, tenants incongruentes, duplicados de request/recibo y reservas parciales. [Auditoría](integridad.json).

## Alcance académico y estado de EQ-05

El escenario original exige **≥99,5 % mensual del flujo en servicio publicado**. Se conserva íntegro. La hora local reduce el tiempo por el plazo de presentación del Sprint 2 y permite probar de forma reproducible el monitor, los contratos construidos, el registro de interrupciones y la limpieza segura. Es una **adaptación de evaluación**, no equivalencia técnica a un mes; requiere aceptación docente.

No existe despliegue público ni observador externo en esta prueba. Generador/monitor y Docker comparten host. No se mide DNS/CDN/Internet, renderizado Web, Android, mapas externos ni disponibilidad de Google/Resend. Diez segundos de muestreo dan mejor resolución que el minuto propuesto inicialmente, pero no detectan todas las caídas breves ni justifican extrapolar el porcentaje a un mes. Un fallo nominal de 10 s equivale a 0,2778 % de esta hora.

**Estado final:** objetivo de la adaptación local alcanzado; **EQ-05 original no acreditado mensualmente**. El siguiente mínimo es presentar esta evidencia al docente y registrar su aceptación de la adaptación o mantener explícito el mes pendiente, sin cambiar el requisito para declararlo cumplido.

## Medición parcial anterior, excluida

El intento `0bcde763-0e44-41dd-ba75-798c943d0dd3` terminó por solicitud del responsable al pasar de Codex a PowerShell independiente: **128 éxitos, cero fallos y 232 intervalos sin datos**, cobertura 35,56 % y 1.273,566 s reales. Sus 129 reservas propias quedaron canceladas. Se conserva separado, sin sumar sus sondeos, peticiones o tiempo a la hora aprobada. Los 19.110 registros previos de la nueva hora incluyen ese historial. [Resumen parcial](parcial-anterior.json) y [tabla de ventanas](ventanas.csv).

## Evidencias y reproducción

[Resumen JSON](resumen.json), [datos completos](resultados.json), [sondeos CSV](sondeos.csv), [pasos HTTP CSV](peticiones.csv), [métricas por operación](operaciones.csv), [recursos](recursos.csv), [periodos](interrupciones.csv), [gráficas PDF](graficas/eq05-disponibilidad.pdf), [reporte HTML](reporte.html). Tokens/contraseñas y manifiesto privado permanecen en `.artifacts/eq05/`, ignorados.

El responsable ejecutó `node tests/availability/eq05-manual.mjs`, que encadena preparación, preflight, monitor y auditoría. Para reproducir **solo el análisis offline**, desde la raíz:

```powershell
node docs/evaluacion/evidencias/eq05/auditar-offline.mjs
node docs/evaluacion/evidencias/eq05/consolidar.mjs
node docs/evaluacion/evidencias/eq05/generar-informe.mjs
```

No repetir la ventana aprobada por rutina. Una futura observación independiente exige autorización; el comando manual detecta la hora ya terminada y no la repite. Los scripts del análisis y las gráficas usan dependencias ya disponibles, sin cambiar package.json.

La presentación del monitor se mejoró **después** de esta medición: [demostración simulada](terminal-demo.txt), [vista simulada de terminal](terminal-demo.svg), [verificación del cambio exclusivamente visual](verificacion-final.json). Esa demostración no es evidencia de disponibilidad. El código efectivamente medido permanece archivado en `monitor-source/` del intento original y sus hashes se verificaron.

La herramienta propuesta originalmente era Grafana Synthetic Monitoring. Esta adaptación utiliza un monitor local Node.js, sin contratar Grafana Cloud: conserva comprobaciones HTTP reales, cálculo por intervalos y evidencias, pero no se presenta como ejecución de esa herramienta ni como observador externo. Esta diferencia también forma parte de la aceptación académica de la adaptación.

[Informe académico PDF con tablas y gráficas](INFORME.pdf). [Situación de los cinco entregables del Sprint 2](SITUACION-SPRINT2.md).
