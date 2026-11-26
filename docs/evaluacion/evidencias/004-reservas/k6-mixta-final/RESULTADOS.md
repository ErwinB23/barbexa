# Tablas auditadas de la serie mixta

26/11/2026. Serie `71e00e3c-28eb-4262-80ce-7abe043c49ed`. Fuentes: resúmenes nativos, resultados, recursos y SQL guardados; sin nueva carga.

## Niveles aprobados

Los HTTP, percentiles globales y RPS globales abarcan calentamiento, rampas y carga estable. Los RPS estables se recalculan como solicitudes etiquetadas `steady` / 600 s.

| VU | HTTP | RPS global | RPS estable | HTTP media ms | p50 ms | p95 ms | p99 ms | Checks | Confirmaciones aceptadas | Persistidas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | 16.227 | 20,80 | 24,44 | 22,57 | 6,22 | 95,26 | 113,80 | 100 % | 3.236 | 3.236 |
| 50 | 32.359 | 41,44 | 48,86 | 22,89 | 5,39 | 102,44 | 134,51 | 100 % | 6.453 | 6.453 |
| 100 | 39.886 | 51,10 | 58,03 | 658,24 | 5,33 | 3.660,71 | 3.776,24 | 100 % | 7.941 | 7.941 |

## Consultas durante los 600 segundos estables

Tiempo completo desde antes de HTTP hasta la respuesta, incluye conexión y recepción; excluye pausa humana y renderizado.

| VU | Operación | Muestras | RPS estable | Media ms | p50 ms | p95 ms | p99 ms | Máximo ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | catalog | 5.868 | 9,78 | 3,54 | 3,00 | 5,00 | 6,00 | 14,00 |
| 25 | slots | 2.930 | 4,88 | 6,69 | 6,00 | 9,00 | 10,00 | 14,00 |
| 25 | reservations | 2.934 | 4,89 | 8,71 | 9,00 | 12,00 | 13,00 | 19,00 |
| 25 | confirm | 2.929 | 4,88 | No disponible | No disponible | No disponible | No disponible | No disponible |
| 50 | catalog | 11.725 | 19,54 | 3,14 | 3,00 | 5,00 | 6,00 | 14,00 |
| 50 | slots | 5.863 | 9,77 | 6,41 | 6,00 | 9,00 | 10,00 | 14,00 |
| 50 | reservations | 5.865 | 9,78 | 5,66 | 6,00 | 8,00 | 9,00 | 28,00 |
| 50 | confirm | 5.861 | 9,77 | No disponible | No disponible | No disponible | No disponible | No disponible |
| 100 | catalog | 13.927 | 23,21 | 2,97 | 3,00 | 4,00 | 5,00 | 13,00 |
| 100 | slots | 6.962 | 11,60 | 6,26 | 6,00 | 8,00 | 9,00 | 14,00 |
| 100 | reservations | 6.964 | 11,61 | 5,40 | 5,00 | 7,00 | 8,00 | 11,00 |
| 100 | confirm | 6.966 | 11,61 | No disponible | No disponible | No disponible | No disponible | No disponible |

Los tiempos de `confirm` son **no disponibles**, no cero: el contador sí existe, pero su distribución etiquetada no se exportó. No se calcula un p95 de confirmación restando percentiles.

## Duración y recuperación

| VU | Calentamiento s | Rampa s | Estable s | Descenso s | Generador real s | Segundos implícitos del resumen | Recuperación prevista s | Recuperación registrada |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | 60 | 60 | 600 | 60 | 781,584 | 780,133 | 120 | Sí |
| 50 | 60 | 60 | 600 | 60 | 783,294 | 780,896 | 120 | Sí |
| 100 | 60 | 60 | 600 | 60 | 783,306 | 780,478 | 120 | Sí |

Duración acreditada por plan, terminación normal, duración medida superior a 780 s, muestras positivas y VU máximos. No existe una serie temporal de VU por segundo para reconstruir independientemente cada instante del plateau.

## Recursos muestreados

| VU | CPU host pico % | RAM host pico % | Libre mínimo GiB | Backend pico MiB | Generador pico MiB | CPU Edge pico % de 1 núcleo | Sesiones PG / límite | Locks máximos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | 21,17 | 83,67 | 2,52 | 726,60 | 78,64 | 52,03 | 21 / 100 | 0 |
| 50 | 18,08 | 85,98 | 2,16 | 777,19 | 117,43 | 70,12 | 22 / 100 | 0 |
| 100 | 22,28 | 85,92 | 2,17 | 857,88 | 196,84 | 72,16 | 22 / 100 | 0 |

CPU de contenedores y generador usa un núcleo como denominador; CPU del host usa todos sus procesadores. La RAM host incluye otros procesos. Son picos de muestras (~2 s), no máximos continuos; los picos de distintos componentes no necesariamente coinciden.

## Libro de reservas: todos los intentos

| Intento | VU objetivo / máximo | Aprobado | HTTP | Errores técnicos | Aceptadas por k6 | Persistidas SQL | Persistidas sin acuse k6 | BD antes -> después | Recuperación / integridad |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [912980a8](../../../../../.artifacts/k6/complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed/25/912980a8-0a3f-40b0-8775-80368ca8bd04/result.json) | 25 / 1 | No | 24 | 0 | 4 | 4 | 0 | 104 -> 108 | Sí / Sí |
| [dd8f7bd1](../../../../../.artifacts/k6/complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed/25/dd8f7bd1-42b8-4b6a-8693-106667fc4eef/result.json) | 25 / 25 | No | 6.239 | 1 | 1.235 | 1.241 | 6 | 108 -> 1349 | Sí / Sí |
| [dfbeb172](../../../../../.artifacts/k6/complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed/25/dfbeb172-8aa4-4575-844b-bff79e40f673/result.json) | 25 / 25 | Sí | 16.227 | 0 | 3.236 | 3.236 | 0 | 1349 -> 4585 | Sí / Sí |
| [9d4fabb9](../../../../../.artifacts/k6/complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed/50/9d4fabb9-59a7-4bd3-83b3-467d436e151d/result.json) | 50 / 50 | Sí | 32.359 | 0 | 6.453 | 6.453 | 0 | 4585 -> 11038 | Sí / Sí |
| [a85ed393](../../../../../.artifacts/k6/complementary/71e00e3c-28eb-4262-80ce-7abe043c49ed/100/a85ed393-3969-44ce-a6d1-de7310918569/result.json) | 100 / 100 | Sí | 39.886 | 0 | 7.941 | 7.941 | 0 | 11038 -> 18979 | Sí / Sí |

Las 6 transacciones sin acuse del segundo intento se conservan en SQL y **no** se agregan a sus éxitos ni se inventan latencias. Los intentos fallidos no acreditan 25 VU. Los aprobados tienen cero conflictos: cada confirmación exigía HTTP 201 y los checks aprobaron al 100 %. El contador crudo de conflictos ausente se mantiene null en JSON; el cero es una conclusión contractual, no una métrica inventada. Las carreras con 409 esperado pertenecen a pruebas independientes.

## Totales separados

- Aprobados: **88.472 HTTP**, **17.630 confirmaciones aceptadas = 17.630 reservas persistidas**.
- No aprobados: 6.263 HTTP, 1.239 confirmaciones aceptadas y 1.245 reservas persistidas; diferencia de seis durante aborto.
- Inventario final guardado: **18.979 reservas** = 4 del cierre acotado + 100 semillas + 1.245 de intentos fallidos + 17.630 de niveles aprobados.
- Cero solapamientos, reservas parciales, tenants incongruentes, requests duplicados y recibos duplicados en los controles SQL antes/después.

[Informe](INFORME.md) · [Auditoría JSON](auditoria.json) · [CSV por operación](operaciones.csv) · [Gráficas PDF](graficas/graficas-mixtas.pdf).
