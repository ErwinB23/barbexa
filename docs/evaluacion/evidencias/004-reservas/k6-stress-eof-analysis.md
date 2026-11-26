# Análisis del EOF — Stress 28edec30

Campaña af768017-0ecc-48b5-b6fe-af5aa287cd5d. Análisis sin ejecutar carga.
Los resultados originales se conservan; este informe no los recalifica.

El generador terminó con exit108 por `UNEXPECTED_BUSINESS_OR_TECHNICAL_RESULT`.
No hubo interrupción del monitor (`interrupted:null`); recuperación aprobada y todas
las comprobaciones SQL antes/después en cero, sin reservas añadidas.

## Cronología y recursos

Inicio de escenario:26/11/2026 04:24:25,847UTC (25nov23:24:25,847 en Lima).
La ráfaga de cancelaciones Kong se registra04:29:02,181–02,200UTC, durante la rampa
400→500VU, que ocupa los segundos270–280. El tramo estable500 aún no había empezado.
No se conservó el timestamp/error_code del EOF del cliente ni un identificador común
de petición: no es posible fijar su instante exacto ni correlacionarlo inequívocamente.

137 muestras de recursos: CPU host máxima21,34%; RAM máxima85,51%; libre mínimo
2,237GiB; pico de memoria del generador588,13MiB. Indicador de conexiones máximo21
frente a100; ese indicador cuenta pg_stat_activity sin filtrar solo sesiones activas.
Cero esperas de locks muestreadas. No se observó saturación sostenida ni agotamiento
de conexiones. El muestreo cada~2s no descarta un pico más breve entre muestras.

## Logs y atribución

Ventana04:28:45–04:29:20UTC: Kong registra7063 respuestas200 y20 respuestas499;
no hay5xx registrados en esa ventana. La ráfaga499 coincide con el aborto y es
compatible con solicitudes canceladas por el cliente. No demuestra que Kong causara
el EOF inicial; tampoco deben sumarse esos20 registros a los errores contabilizados
por k6. PostgreSQL, PostgREST y Auth no tienen líneas en los logs consultados durante
la ventana. PostgreSQL tiene logging_collector=off. La ausencia de líneas no acredita
que todos sus caminos internos se registraran.

Los contenedores inspeccionados seguían activos desde antes del ensayo, con cero
reinicios y OOMKilled=false. Docker no conservaba eventos de esa ventana. No hay
evidencia positiva de reinicio, OOM o fallo PostgreSQL/PostgREST. No se puede atribuir
con certeza el EOF a Kong, PostgREST, PostgreSQL, Docker o al transporte del host.
Hipótesis: cierre transitorio en el trayecto cliente/gateway; requiere nueva evidencia,
no se presenta como causa comprobada. No se modificó configuración de red/keepalive.

Logs crudos privados: `.artifacts/k6/investigations/eof-28edec30/`.
Agregados sanitizados y métricas por nivel: `k6-stress-eof-analysis.json`.

## Acreditación del intento original

| VU | Estable | HTTP | RPS del tramo | p95 HTTP ms | p95 completo catálogo/slots ms |
| --- | --- | --- | --- | --- | --- |
|100 |60s |6000 |100,00 |6,88 |3 /8 |
|200 |60s |11979 |199,65 |8,25 |4 /9 |
|300 |60s |17945 |299,08 |9,56 |5 /11 |
|400 |60s |23932 |398,87 |9,21 |4 /11 |

Esos cuatro tramos están completos, con errores técnicos/inesperados0, muestras
positivas y latencias bajo el límite3s; SQL y recuperación global válidos.
Máximo acreditado bajo este protocolo Stress de60s:400VU de lectura. No es un límite
demostrado del backend ni sustituye100VU/10min, EQ06 o concurrencia de escrituras.
458 es el máximo activo durante una rampa incompleta; no acredita458 ni500VU.
500..1000 no fueron medidos como tramos estables. Los ceros de submétricas vacías
del export no son latencias medidas. El Stress completo sigue sin aprobar.

Global:70033 solicitudes,70032 aceptadas,1error técnico (0,0014279%), p95HTTP9,17ms.
El umbral técnico<1% aprobó. La antigua condición también marcaba el EOF como
resultado inesperado y check fallido, haciendo abortar antes de aprovechar esa
tolerancia técnica. Los checks y resultados inesperados globales de ese intento
siguen fallidos; no se modifican sus métricas ni su exit108.

## Cambio futuro autorizado: stress-eof-v1

Autorización expresa del responsable: separar solo EOF de transporte durante Stress
de lectura. Status0 con error que termina en EOF/unexpected EOF se registra como
error técnico y respuesta no validada. No se reintenta ni se suma a accepted_responses.
No se inventa un check correcto cuando no hubo respuesta. El denominador de errores
técnicos sigue siendo todas las peticiones; el de checks funcionales excluye esos EOF.
Se mantienen <1% técnico,100% de checks funcionales recibidos,0 resultados funcionales
inesperados y todos los límites de latencia/recursos/integridad.

Smoke, Load, Load académico, Spike, escrituras y los demás errores conservan el
comportamiento estricto. Respuestas401/403 inesperadas, datos inválidos, tenant
incorrecto, fallos de integridad y pérdida de estabilidad siguen deteniendo la corrida.
No se autoriza tolerar5xx,429, DNS, TLS, timeout o connection-refused mediante este cambio.

Los próximos Stress guardan `methodology:stress-eof-v1`, contadores
`transport_eof_errors` y `responses_without_validation`, cobertura de checks y un
evento por EOF con fecha UTC, tramo, operación y error_code en javascript-console.log.
Sin cuerpos, JWT, apikey ni cabeceras. El JSON/CSV identifica la metodología para
no comparar silenciosamente resultados de criterios distintos. Una iteración
finalizada no significa que su petición fuera exitosa.

Puede repetirse manualmente `npm run test:carga -- stress`. Este análisis no lo ejecutó.
