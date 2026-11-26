# Resultados consolidados de la campaña k6

Campaña: `af768017-0ecc-48b5-b6fe-af5aa287cd5d`. Auditoría offline; ninguna carga nueva.

N/D significa ausencia de evidencia. No se sustituyen datos faltantes con cero.

## Totales de las corridas aprobadas

Latencias HTTP en ms; RPS global de k6 incluye rampas. No equivale al RPS de cada tramo estable.

| Prueba         | Intento  | VU máximo | HTTP    | RPS global | Media ms | p50 ms | p95 ms | p99 ms |
| -------------- | -------- | --------- | ------- | ---------- | -------- | ------ | ------ | ------ |
| smoke          | ff240096 | 1         | 5       | 0,99       | 8,14     | 8,03   | 9,22   | 9,33   |
| load           | ef67de10 | 100       | 66.655  | 80,26      | 4,57     | 4,35   | 9,27   | 11,33  |
| load-academico | 83af480c | 50        | 45.540  | 37,00      | 4,56     | 4,44   | 8,83   | 10,32  |
| stress         | e5e44a3e | 1.000     | 338.131 | 482,40     | 138,04   | 15,89  | 604,78 | 764,36 |
| spike          | 7295137f | 1.000     | 26.633  | 203,36     | 369,77   | 388,41 | 781,30 | 993,71 |

Las cinco corridas registran cero errores técnicos, cero resultados funcionales inesperados, checks al 100 %, integridad válida y recuperación true. Total de solicitudes de estas corridas: 476.964.

| Prueba         | Escenario programado s | Tiempo medido HTTP s¹ | Proceso completo s | Recuperación programada s | Thresholds aprobados |
| -------------- | ---------------------- | --------------------- | ------------------ | ------------------------- | -------------------- |
| smoke          | Máximo 30              | 5,057                 | 6,496              | 60                        | 3/3                  |
| load           | 830                    | 830,522               | 831,313            | 120                       | 39/39                |
| load-academico | 1.230                  | 1.230,670             | 1.232,086          | 120                       | 21/21                |
| stress         | 700                    | 700,941               | 703,314            | 120                       | 93/93                |
| spike          | 130                    | 130,967               | 131,645            | 120                       | 30/30                |

¹ Duración del denominador que k6 usa para `http_reqs.rate`, obtenida de count/rate. No es la suma de latencias ni una traza de VU. Las duraciones estables proceden del perfil y su completitud acreditada; no existen muestras de inicio/fin de cada petición. Smoke completa cinco iteraciones, no treinta segundos obligatorios.

## Intentos fallidos conservados

| Intento Stress | Estado                   | VU observado / acreditado | HTTP   | EOF                                                  | Causa                                     | Recuperación |
| -------------- | ------------------------ | ------------------------- | ------ | ---------------------------------------------------- | ----------------------------------------- | ------------ |
| 28edec30       | Fallido                  | 458 / 400                 | 70.033 | 1; error técnico y funcional según política original | exit 108; aborto por resultado inesperado | true         |
| a8d488dd       | Interrumpido sin resumen | N/D / N/D                 | N/D    | 16 eventos; tasa N/D                                 | RESOURCE_SAFETY_LIMIT                     | true         |

El segundo intento llegó a 500 VU según la observación del responsable, pero carece de resumen final: no se convierte ese dato en una métrica auditada ni se acreditan sus tramos. El consolidado original omite ese intento al no encontrar summary.json; esta auditoría sí lo incluye como **interrumpido sin resumen**, conservando sus recursos, logs e integridad.

## Tramos estables aprobados

### load — ef67de10

| Tramo    | VU  | Duración s | HTTP   | RPS tramo | Media ms | p50 ms | p95 ms | p99 ms |
| -------- | --- | ---------- | ------ | --------- | -------- | ------ | ------ | ------ |
| load-10  | 10  | 60         | 597    | 9,95      | 5,35     | 5,73   | 9,40   | 11,09  |
| load-25  | 25  | 60         | 1.498  | 24,97     | 4,39     | 4,39   | 8,27   | 9,88   |
| load-50  | 50  | 60         | 2.986  | 49,77     | 4,59     | 4,44   | 8,68   | 9,90   |
| load-100 | 100 | 600        | 59.717 | 99,53     | 4,56     | 4,31   | 9,30   | 11,25  |

p95 de tiempo completo observado por operación, incluido establecimiento de conexión y recepción; todos los tramos tienen respuestas aceptadas de ambas operaciones.

| VU / tramo     | p95 catálogo ms | p99 catálogo ms | p95 slots ms | p99 slots ms | Errores técnicos | Errores funcionales | Completado |
| -------------- | --------------- | --------------- | ------------ | ------------ | ---------------- | ------------------- | ---------- |
| 10 / load-10   | 5,00            | 7,00            | 10,00        | 12,00        | 0                | 0                   | true       |
| 25 / load-25   | 4,00            | 6,00            | 9,00         | 10,00        | 0                | 0                   | true       |
| 50 / load-50   | 4,00            | 5,00            | 9,00         | 10,00        | 0                | 0                   | true       |
| 100 / load-100 | 4,00            | 5,00            | 10,00        | 12,00        | 0                | 0                   | true       |

### load-academico — 83af480c

| Tramo             | VU  | Duración s | HTTP   | RPS tramo | Media ms | p50 ms | p95 ms | p99 ms |
| ----------------- | --- | ---------- | ------ | --------- | -------- | ------ | ------ | ------ |
| load-academico-25 | 25  | 600        | 14.927 | 24,88     | 4,51     | 4,56   | 8,27   | 9,60   |
| load-academico-50 | 50  | 600        | 29.850 | 49,75     | 4,58     | 4,32   | 9,12   | 10,54  |

p95 de tiempo completo observado por operación, incluido establecimiento de conexión y recepción; todos los tramos tienen respuestas aceptadas de ambas operaciones.

| VU / tramo             | p95 catálogo ms | p99 catálogo ms | p95 slots ms | p99 slots ms | Errores técnicos | Errores funcionales | Completado |
| ---------------------- | --------------- | --------------- | ------------ | ------------ | ---------------- | ------------------- | ---------- |
| 25 / load-academico-25 | 4,00            | 5,00            | 9,00         | 10,00        | 0                | 0                   | true       |
| 50 / load-academico-50 | 4,00            | 5,00            | 10,00        | 11,00        | 0                | 0                   | true       |

### stress — e5e44a3e

| Tramo       | VU    | Duración s | HTTP   | RPS tramo | Media ms | p50 ms | p95 ms | p99 ms |
| ----------- | ----- | ---------- | ------ | --------- | -------- | ------ | ------ | ------ |
| stress-100  | 100   | 60         | 6.000  | 100,00    | 6,65     | 4,04   | 6,83   | 176,48 |
| stress-200  | 200   | 60         | 11.969 | 199,48    | 3,99     | 4,10   | 8,15   | 10,89  |
| stress-300  | 300   | 60         | 17.842 | 297,37    | 4,49     | 4,23   | 9,53   | 12,99  |
| stress-400  | 400   | 60         | 23.880 | 398,00    | 5,30     | 4,66   | 13,29  | 16,77  |
| stress-500  | 500   | 60         | 29.822 | 497,03    | 6,58     | 5,17   | 14,57  | 18,30  |
| stress-600  | 600   | 60         | 35.512 | 591,87    | 10,88    | 8,88   | 24,48  | 34,45  |
| stress-700  | 700   | 60         | 40.929 | 682,15    | 26,35    | 20,84  | 69,48  | 184,15 |
| stress-800  | 800   | 60         | 45.437 | 757,28    | 55,97    | 27,50  | 201,56 | 326,91 |
| stress-900  | 900   | 60         | 38.674 | 644,57    | 396,72   | 384,85 | 605,55 | 681,16 |
| stress-1000 | 1.000 | 60         | 38.614 | 643,57    | 543,05   | 534,24 | 789,45 | 903,27 |

p95 de tiempo completo observado por operación, incluido establecimiento de conexión y recepción; todos los tramos tienen respuestas aceptadas de ambas operaciones.

| VU / tramo          | p95 catálogo ms | p99 catálogo ms | p95 slots ms | p99 slots ms | Errores técnicos | Errores funcionales | Completado |
| ------------------- | --------------- | --------------- | ------------ | ------------ | ---------------- | ------------------- | ---------- |
| 100 / stress-100    | 4,00            | 180,02          | 8,00         | 166,01       | 0                | 0                   | true       |
| 200 / stress-200    | 4,00            | 7,00            | 9,00         | 12,00        | 0                | 0                   | true       |
| 300 / stress-300    | 5,00            | 9,00            | 11,00        | 14,00        | 0                | 0                   | true       |
| 400 / stress-400    | 11,00           | 14,00           | 14,00        | 18,00        | 0                | 0                   | true       |
| 500 / stress-500    | 12,00           | 16,00           | 16,00        | 20,00        | 0                | 0                   | true       |
| 600 / stress-600    | 21,00           | 31,00           | 27,00        | 37,00        | 0                | 0                   | true       |
| 700 / stress-700    | 67,00           | 189,00          | 71,85        | 179,00       | 0                | 0                   | true       |
| 800 / stress-800    | 198,00          | 321,83          | 205,00       | 331,00       | 0                | 0                   | true       |
| 900 / stress-900    | 600,00          | 676,00          | 611,00       | 687,00       | 0                | 0                   | true       |
| 1.000 / stress-1000 | 786,00          | 903,00          | 793,00       | 903,00       | 0                | 0                   | true       |

### spike — 7295137f

| Tramo          | VU    | Duración s | HTTP   | RPS tramo | Media ms | p50 ms | p95 ms | p99 ms   |
| -------------- | ----- | ---------- | ------ | --------- | -------- | ------ | ------ | -------- |
| spike-baseline | 10    | 30         | 300    | 10,00     | 4,87     | 5,02   | 9,02   | 13,57    |
| spike-peak     | 1.000 | 30         | 20.642 | 688,07    | 443,11   | 449,60 | 768,02 | 1.015,98 |
| spike-recovery | 10    | 60         | 597    | 9,95      | 4,95     | 4,88   | 8,97   | 9,77     |

p95 de tiempo completo observado por operación, incluido establecimiento de conexión y recepción; todos los tramos tienen respuestas aceptadas de ambas operaciones.

| VU / tramo          | p95 catálogo ms | p99 catálogo ms | p95 slots ms | p99 slots ms | Errores técnicos | Errores funcionales | Completado |
| ------------------- | --------------- | --------------- | ------------ | ------------ | ---------------- | ------------------- | ---------- |
| 10 / spike-baseline | 7,00            | 15,00           | 10,00        | 14,00        | 0                | 0                   | true       |
| 1.000 / spike-peak  | 768,00          | 1.017,40        | 769,00       | 1.014,00     | 0                | 0                   | true       |
| 10 / spike-recovery | 4,00            | 5,00            | 9,15         | 10,00        | 0                | 0                   | true       |

## Recursos de todas las corridas

Máximos muestreados: CPU/RAM del host compartido, no consumo exclusivo de BARBEXA. Memoria k6 = pico acumulado del working set observado; backend = mayor suma simultánea de los seis contenedores.

| Tipo / intento            | CPU host % | RAM host % | Libre mínima GiB | k6 MiB | Backend MiB | Sesiones PG máx. | Locks máx. |
| ------------------------- | ---------- | ---------- | ---------------- | ------ | ----------- | ---------------- | ---------- |
| smoke / ff240096          | 8,02       | 84,63      | 2,372            | 31,20  | 708,11      | 18               | 0          |
| load / ef67de10           | 13,46      | 84,88      | 2,334            | 126,25 | 723,86      | 21               | 0          |
| load-academico / 83af480c | 13,30      | 82,81      | 2,653            | 90,63  | 749,67      | 21               | 0          |
| stress / 28edec30         | 21,34      | 85,51      | 2,237            | 588,13 | 800,42      | 21               | 0          |
| stress / a8d488dd         | 35,97      | 92,03      | 1,231            | 625,75 | 818,39      | 21               | 0          |
| stress / e5e44a3e         | 80,53      | 86,24      | 2,124            | 788,18 | 865,38      | 21               | 0          |
| spike / 7295137f          | 80,69      | 89,52      | 1,617            | 624,13 | 892,74      | 21               | 0          |

El límite PostgreSQL era 100. El contador incluye sesiones inactivas y conexiones del monitor, no solo consultas activas. En Smoke solo hay dos muestras: sus picos de recursos son especialmente limitados.

### CPU y memoria por componente — stress

| Componente   | CPU máxima, % de un núcleo | RAM máxima MiB |
| ------------ | -------------------------- | -------------- |
| db           | 432,08                     | 179,40         |
| auth         | 3,79                       | 25,23          |
| rest         | 1.280,26                   | 228,50         |
| kong         | 53,51                      | 212,00         |
| edge_runtime | 4,35                       | 242,90         |
| inbucket     | 4,57                       | 29,60          |
| k6           | 130,04                     | 788,18         |

Un 1.280 % de CPU Docker equivale aproximadamente a 12,8 núcleos, no al 1.280 % del host. CPU de k6 se deriva de diferencias de tiempo acumulado entre muestras: no mide un pico instantáneo.

### CPU y memoria por componente — spike

| Componente   | CPU máxima, % de un núcleo | RAM máxima MiB |
| ------------ | -------------------------- | -------------- |
| db           | 322,16                     | 186,70         |
| auth         | 2,07                       | 22,59          |
| rest         | 1.303,10                   | 220,80         |
| kong         | 42,64                      | 208,20         |
| edge_runtime | 0,15                       | 243,10         |
| inbucket     | 7,67                       | 26,07          |
| k6           | 104,88                     | 624,13         |

Un 1.280 % de CPU Docker equivale aproximadamente a 12,8 núcleos, no al 1.280 % del host. CPU de k6 se deriva de diferencias de tiempo acumulado entre muestras: no mide un pico instantáneo.

## Archivos de datos y trazabilidad

- [auditoria.json](auditoria.json): todas las métricas, segmentos, recursos y verificaciones.
- [intentos.csv](intentos.csv): aprobados, fallidos e incompletos.
- [tramos.csv](tramos.csv): percentiles y métricas por nivel.
- [umbrales.csv](umbrales.csv): expresiones originales, valores, resultado exportado y recálculo independiente.
- [recursos-serie.csv](recursos-serie.csv): serie temporal muestreada.
- [preservacion-sha256.json](preservacion-sha256.json): inventario de 131 archivos crudos preservados, incluidos preliminares.

[Informe técnico](INFORME.md) · [Requisitos de calidad](REQUISITOS-CALIDAD.md) · [Gráficas PDF](graficas/graficas-k6.pdf).
