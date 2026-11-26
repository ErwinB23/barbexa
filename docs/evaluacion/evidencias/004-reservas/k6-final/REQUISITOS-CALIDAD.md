# Requisitos de calidad: evaluación final del alcance acreditado

26/11/2026. Fuentes originales, sin modificarlas:

- [Escenarios académicos EQ-01–EQ-10](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md), contrastados con su copia local vigente.
- [Plan 004, Calidad pendiente](../../../../../specs/004-mvp-reservas/plan.md).
- [Rúbrica](../../../RUBRICA.md). Un atributo no equivale a todos los criterios de rúbrica.

**Cumplido** significa evidencia suficiente para el alcance indicado; **parcialmente
cumplido**, solo parte del protocolo o producto; **pendiente**, trabajo identificado
sin cierre; **no evaluado**, ausencia de medición pertinente. La ausencia de evidencia
no se trata como fallo funcional. No se ejecutó nueva carga. Se completaron solo los casos acotados autorizados en el laboratorio aislado; véase el cierre del Sprint 2.

## MVP, EQ-04 y EQ-06

| Requisito original                                                                                                                                          | Evidencia real                                                                                                                   | Clasificación                                   | Brecha estricta                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP T033, componente de carga: 10 VU/1 min, p95 <=2 s, errores funcionales 0                                                                                | Load `ef67de10`, tramo de 60 s completo: 597 solicitudes, p95 completos catálogo/slots 5/10 ms, técnicos/funcionales 0           | **Cumplido**, para las API de lectura ensayadas | No repetir este nivel por rutina. El resto de T033 (HTTPS/DNS/CDN y destino real) es independiente y no queda cerrado                                                                                                                                                                  |
| EQ-04: catálogo, horarios y reservas; 100 VU/600 s, p95 por consulta ≤3 s, técnicos <1 % | Mixta `100/a85ed393`: p95 completos 4/8/7 ms, cero técnicos y consultas con muestras positivas | **Cumplido en laboratorio y alcance definido** | Ninguna prueba adicional necesaria para el escenario; no acredita red pública o renderizado |
| EQ-06: misma mezcla consultas/confirmaciones, 25/50/100 VU ×600 s; a 100, p95 consultas ≤3 s, técnicos <1 %, integridad sin pérdidas | Tres niveles mixtos aprobados: 88.472 HTTP, 17.630 aceptadas = persistidas, recuperación y 36 thresholds aprobados | **Cumplido en laboratorio y mezcla definida** | No repetir. La escritura presenta degradación a 100; no implica escalado ilimitado ni 2.000 VU |

No confundir Smoke1VU/5 iteraciones con el criterio MVP10VU/60s. Los25/50 del Load
corto no acreditan diez minutos; el suplemento académico sí lo hace. El calentamiento
del Load100 incluye las etapas anteriores; en el suplemento se registra la rampa
previa de10s, sin una etapa de calentamiento independiente. Una nueva serie mixta
debe identificar expresamente calentamiento y medición, conservando los umbrales.

La serie mixta independiente `71e00e3c` está concluida: mezcla nominal 80 % consultas /
20 % confirmaciones, misma secuencia y pausa por VU, 600 s estables por nivel.
[Informe mixto](../k6-mixta-final/INFORME.md), [tablas](../k6-mixta-final/RESULTADOS.md)
y [auditoría de los cinco intentos](../k6-mixta-final/auditoria.json).
El p95 HTTP global a 100 VU es 3.660,71 ms; no se oculta ni se confunde con los
p95 de consulta de 4/8/7 ms. Los percentiles propios de confirmación no quedaron
exportados y permanecen no disponibles. El límite original de tres segundos se
aplica a consultas. Dos intentos mixtos no aprobados se conservan por separado.
Los 2.000 VU siguen pospuestos como meta académica adicional independiente de
EQ-04/EQ-06, sin necesidad de repetir carga para cerrar esos escenarios.

## EQ-01 a EQ-10

| EQ                             | Clasificación                                | Evidencias existentes y límites                                                                                                                                                                                                                                                                                           | Cierre estrictamente necesario                                                                                                                                                                                                                                                                                            |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EQ-01 Seguridad | **Cumplido, conjunto definido** | 91 checks históricos + negativos sin sesión/otro cliente/barbero no asignado/admin ajeno, positivos efectivo/Yape y digest sin mutaciones indebidas | Cierre actual ejecutado; ver [15 checks locales](../sprint2-closure/results.json) y matriz por actor del [reporte](../sprint2-closure/CIERRE-SPRINT2.md). No es garantía universal |
| EQ-02 Aislamiento | **Parcial** | ACL/RLS y lectura pública de recursos construidos acreditados; comparación original A/B | Faltan imágenes/reseñas ajenas del protocolo original; módulos fuera del alcance actual. No implementarlos ni declarar cierre integral |
| EQ-03 Integridad concurrente | **Cumplido, casos acordados** | Diez pares reservas, rollback/idempotencia y carreras care anteriores reutilizados; nuevo pago con barbero/admin distintos, dos waiters, 409/200 y un receive | Brecha puntual cerrada con un nuevo par observado. No equivale a múltiples repeticiones nuevas ni a carga de escrituras; [resultado](../sprint2-closure/results.json) |
| EQ-04 Rendimiento: consulta de disponibilidad | **Cumplido en laboratorio, alcance definido** | Mixta 100 VU/600 s: catálogo, disponibilidad y reservas propias con p95 completo 4/8/7 ms; técnicos 0 %, checks 100 % | Ninguna nueva carga; límite: API local, volumen definido, sin mapas externos ni renderizado. [Cierre](../k6-mixta-final/INFORME.md) |
| EQ-05 Disponibilidad mensual | **Parcial integral; hora local acreditada, mes no evaluado** | Run 8dd877ab: 360 éxitos, cero fallos/sin datos, 100 % disponibilidad y cobertura; 3.600,003 s, 2.880 HTTP, 361 reservas propias canceladas, 19.471 globales auditadas. [Informe y gráficas](../../eq05/INFORME.md). Parcial anterior de 128 conservado y excluido | Registrar aceptación docente de la adaptación local por plazo del Sprint 2. No equivale al mes original del servicio publicado ni se extrapola; no repetir la hora aprobada |
| EQ-06 Escalabilidad: aumento de demanda | **Cumplido en laboratorio, mezcla definida** | Mixta 25/50/100 ×600 s, 17.630 aceptadas y persistidas, recuperación e integridad correctas. Lectura hasta 1.000 conservada por separado | Ninguna prueba adicional del criterio original. Documentada degradación de escritura y ausencia de percentiles propios; no se atribuyen 1.000 VU a escrituras. 2.000 pospuestos |
| EQ-07 Confiabilidad del correo | **Cumplido, fallo controlado** | Servicio y persistencia PostgreSQL reales: failed tras commit, reintento sent controlado, mismo UUID/clave y una invitación; [resultado](../sprint2-closure/results.json) | Entrega efectiva externa no probada aquí; composición in-app vigente intacta. El escenario original diferencia esta prueba de entrega real |
| EQ-08 Mantenibilidad: reglas y adaptadores independientes | **Parcial integral; núcleo construido acreditado** | Paquete consolidado: checkers 298/55 y 56/33, 88 archivos de núcleo, 199 dependencias listadas y cero prohibidas; un caso existente por lado aprobado sin red. Cobertura/regresión completa reutilizada, núcleo coincide con commit probado. [Informe y evidencia](../../eq08/INFORME.md) | Subsiste la condición original de sustituir proveedor de mapas/imágenes no completos; no se implementó ni se acredita con reservas. Siguiente mínimo: recorrido Web de conflicto con Playwright para EQ-09, sin repetir k6 |
| EQ-09 Usabilidad: horario ocupado y consulta de ubicación | **Parcial integral; recorrido funcional Web acreditado** | Playwright móvil 390×844, dos clientes sintéticos: A 201, B 409→201; servicio conservado, teclado, sin reenvíos observados. SQL: dos reservas y cero para el UUID rechazado. [Informe y capturas](../../eq09/INFORME.md) | Ubicación denegada, Android nativo, participantes y accesibilidad completa pendientes. Foco BODY/aviso fuera del encuadre inicial y etiqueta Efectivo tenue documentados sin modificar UI. Emulación Web no sustituye Android |
| EQ-10 Historial | **Cumplido, campos/casos definidos** | Nombre/precio y conservación en cancelación/reprogramación reutilizados; política vigente120→60 real, histórico120, cabecera/items intactos y lectura JWT200 | Brecha puntual cerrada; [comparación ejecutada](../sprint2-closure/results.json), sin repetir155 comprobaciones de008–010 |

## Referencias de evidencia revisadas

- [Atomicidad004](../atomic.md), [carreras y observaciones SQL](../t012-t016/concurrency-observed.json).
- [Pagos005, resultados reales](../../../../../specs/005-atencion-pagos-manuales/real-tests.json)
  y [quickstart](../../../../../specs/005-atencion-pagos-manuales/quickstart.md).
- [Operador histórico de pagos](../../../../../tests/integration/booking/care-real.mjs), líneas del bloque race-receive: ambas peticiones usan `pro`. Solo se leyó; no ejecutarlo por rutina.
- [Reprogramación008–010 real](../../../../../specs/010-reprogramacion-reservas/quickstart.md), resultado A;
  [cancelación y política histórica](../cancellation.md).
- [Calidad y reproducción](../calidad.md), [caché](../cache.md) y CI remoto previamente aprobado:
  [45696792837](https://github.com/ErwinB23/barbexa/actions/runs/45696792837).
- [Pruebas de correo](../../../../../tests/server/barbershop-operation/team.test.ts),
  `mail failure preserves committed invitation...`: doble de persistencia/proveedor, no prueba SQL nueva.
- [Auditoría de esta campaña](auditoria.json), [resultados](RESULTADOS.md) y [reporte](INFORME.md).

## Próximas actividades estrictamente necesarias

1. No ejecutar nuevas pruebas k6: EQ-04/EQ-06 ya tienen cierre con evidencia mixta.
   Lecturas y escrituras mantienen informes, intentos y métricas independientes.
2. EQ-08 del núcleo implementado y recorrido funcional Web de EQ-09 consolidados:
   [EQ-08](../../eq08/INFORME.md), [EQ-09](../../eq09/INFORME.md). No repetirlos.
   Mapas/imágenes, Android, participantes y hallazgos de accesibilidad conservan
   condiciones pendientes. EQ-05 ya tiene [una hora local auditada](../../eq05/INFORME.md),
   100 % de disponibilidad/cobertura; no repetirla. Presentar aceptación docente
   de la adaptación y mantener sin acreditar el mes publicado original.
3. Presentar al docente EQ02/08/09 parciales por sus condiciones originales y
   EQ05 sin mes. No desarrollar imágenes/reseñas/mapas en esta actividad ni declarar
   completos los diez requisitos.2.000VU permanecen como meta adicional no acreditada.

[Cierre prioritario: actores, casos, comandos, volumen y cinco entregables](../sprint2-closure/CIERRE-SPRINT2.md).
[Estado de los cinco entregables y pendientes tras EQ-05](../../eq05/SITUACION-SPRINT2.md).
15 comprobaciones acotadas y31 pruebas del harness aprobadas; ninguna carga nueva.
La campaña af768017 conserva sus resultados y hashes. Sin producto, Cloud,
migraciones originales, Actions, staging, commits o push.
