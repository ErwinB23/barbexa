# Cierre de la serie mixta k6 — BARBEXA

**26/11/2026, America/Lima.** Serie `71e00e3c-28eb-4262-80ce-7abe043c49ed`.
Auditoría offline: no se ejecutaron k6, SQL, Docker ni HTTP. Se revisan las
comprobaciones de recuperación e integridad **guardadas al terminar cada intento**;
no se afirma una nueva inspección del estado vivo de la base.

## Resultado ejecutivo

**EQ-04 y EQ-06 cumplidos en el laboratorio, para el volumen y operaciones definidos
en sus escenarios originales.** Los niveles mixtos de 25, 50 y 100 VU aprobaron
600 segundos estables cada uno, con cero errores técnicos, cero resultados
inesperados, checks al 100 %, integridad y recuperación satisfactorias.
Los 36 thresholds de las corridas aprobadas coinciden con su recálculo independiente.
La suma es **88.472 solicitudes HTTP** y **17.630 confirmaciones aceptadas**, conciliadas
con **17.630 reservas nuevas persistidas**. No se suman los resultados fallidos a los aprobados.

El p95 HTTP global de **3.660,71 ms** a 100 VU documenta una limitación de la mezcla
con escrituras. Los p95 completos de las consultas en el mismo tramo son
**4 ms catálogo, 8 ms disponibilidad y 7 ms reservas propias**. El criterio original
de tres segundos es de **consultas**, no del conjunto global ni de confirmaciones.
No se cambió ese criterio para aprobar. No se afirma que las confirmaciones tengan
p95 menor de tres segundos: sus percentiles específicos no quedaron exportados.

[Tablas completas](RESULTADOS.md), [auditoría](auditoria.json),
[verificación y alcance](verificacion.json), [gráficas para presentar](graficas/graficas-mixtas.pdf).

## Criterios originales y trazabilidad

Fuente académica: [escenarios EQ-01–EQ-10](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md).
Se leyó la copia local del entregable académico y se conserva su SHA-256 en
`auditoria.json`. No se editó el repositorio académico ni las especificaciones SDD.

| Escenario original | Condición original | Evidencia de cierre |
| --- | --- | --- |
| EQ-04. Rendimiento: consulta de disponibilidad | Catálogo, horarios y reservas concurrentes; 100 VU, 10 min tras calentamiento; p95 completo de cada consulta ≤3 s y técnicos <1 %. Excluye interacción humana y mapas externos | `100/a85ed393`: 600 s, p95 4/8/7 ms, técnicos 0/39.886; contratos y muestras positivos |
| EQ-06. Escalabilidad: aumento de demanda | Misma mezcla y ritmo por usuario; 25/50/100 VU, 10 min por nivel; a 100, p95 consultas ≤3 s, técnicos <1 %, sin pérdidas de integridad; conflictos esperados separados | Tres niveles completos; misma secuencia, pausa de 1 s por operación; SQL concilia 3.236/6.453/7.941 nuevas reservas; todas las invariantes en cero |

Los cuatro criterios de latencia, error, duración e integridad permanecen intactos.
No se exige latencia constante de escritura ni escalado lineal porque no forman
parte de la medida original; su degradación sí se presenta como limitación.

## Entorno, volumen y medición

Laboratorio aislado `barbexa-k6-lab`, API loopback `127.0.0.1:54721`, seis servicios
Docker: PostgreSQL, Auth, PostgREST, Kong, Edge Runtime e Inbucket. Datos sintéticos
y sesiones Auth reales. No datos del entorno habitual ni solicitudes a Cloud.
Kong mantiene 4.096 conexiones por worker; Edge Runtime utiliza **oneshot**.
El coste de arranque de workers está incluido en las llamadas medidas.

Dos barberías, 20 profesionales, 100 clientes/sesiones, un servicio por barbería
de 15 min y S/15, 100 reservas iniciales. Fixtures con 4.000/8.000/16.000 asignaciones
para los tres niveles: son capacidad preparada, no reservas ni éxitos adicionales.
Configuración sintética: horizonte de 90 días y capacidad de 600 futuras reservas
por cliente para preservar intentos previos. No es un umbral de aceptación.

Ciclo por VU: catálogo, disponibilidad, reservas propias, catálogo, confirmación.
Mezcla nominal 80 % consultas / 20 % confirmaciones; el CSV registra las proporciones
reales, levemente distintas por ciclos incompletos en las transiciones. Una pausa
de un segundo sigue a cada operación. Es un modelo cerrado: VU esperando una
respuesta lenta reduce el ritmo efectivo; no es un generador de RPS fijo.
Las consultas propias usan RLS y el contrato del cliente, con límite de 50 filas.

Por nivel: 60 s a 1 VU, rampa de 60 s, **600 s estables**, descenso de 60 s y
120 s previstos para recuperación. Duración observada del generador:
781,584 / 783,294 / 783,306 s; los segundos implícitos en el resumen superan 780 s.
El máximo activo registrado coincide con cada objetivo. La acreditación se basa
en plan, salida normal, duración, contadores del tramo y verificación del supervisor;
no existe una traza de VU por segundo que permita certificar independientemente
cada instante del plateau. Los contadores generales incluyen las transiciones.

## Latencias de lectura frente a confirmación

| Medida a 100 VU | Resultado | Interpretación |
| --- | --- | --- |
| HTTP global: media / p50 / p95 / p99 | 658,24 / 5,33 / 3.660,71 / 3.776,24 ms | Distribución mezclada de lecturas y escrituras, todas las fases |
| Tiempo completo global: p95 / p99 | 3.661 / 3.776 ms | Incluye establecimiento y recepción observados por el cliente de prueba |
| Consultas estables: p95 catálogo / disponibilidad / reservas | 4 / 8 / 7 ms | Las tres cumplen el límite original de 3.000 ms |
| Consultas estables: p99 catálogo / disponibilidad / reservas | 5 / 9 / 8 ms | Cola de lectura baja dentro del volumen ensayado |
| Confirmaciones aceptadas: total / estables | 7.941 / 6.966 | Tasas de 10,17/s global y 11,61/s estables |
| Media, p50, p95 y p99 exclusivos de confirmación | **No disponibles como medición directa** | Ni resumen nativo ni exportación custom guardan el Trend etiquetado confirm; no hay muestras HTTP crudas |

El generador etiqueta la latencia por operación, pero k6 solo exportó las
submétricas de latencia con thresholds de consultas. La etiqueta por sí sola no
dejó un histograma recuperable de confirmaciones. No se pueden restar o promediar
percentiles para reconstruir el p95 de una operación, ni presentar el p95 global
como p95 de confirmación. JSON conserva `null` y CSV celdas vacías para esos tiempos.

Desagregación adicional posible **sin inventar mediciones**: de las 39.886 llamadas,
7.941 fueron confirmaciones; 27.853 fueron consultas estables con medias conocidas;
4.092 fueron consultas de transición sin distribución separada. Acotando la suma
de estas últimas entre cero y su cantidad por el máximo global de 3.859 ms,
la **media** de confirmación de todas las fases queda matemáticamente entre
**1.302,41 y 3.290,95 ms**. Son límites algebraicos, no una media observada, intervalo
de confianza ni percentiles; el cálculo queda en `auditoria.json`.

El salto global de p95 entre 50 y 100 VU es real: 102,44 → 3.660,71 ms.
El throughput estable crece 48,86 → 58,03 RPS (**18,78 %**, con doble VU);
confirmaciones estables: 9,77 → 11,61/s. No hay escalado lineal. La ruta de escritura
oneshot incorpora arranque, autorización y transacción; es compatible con costes
o esperas de esa ruta, pero los datos agregados **no permiten localizar una causa
única** entre inicialización, colas, conexiones o ejecución SQL por petición.
No hay trazas distribuidas ni tiempos individuales para atribuir ese aumento.
No se cambia el producto ni se repite carga para completar métricas ausentes.

## CPU, memoria y conexiones

A 100 VU se muestrearon picos de CPU host 22,28 %, RAM host 85,92 %, memoria
agregada del backend 857,88 MiB y pico histórico del proceso generador 196,84 MiB.
Mínimo libre del host: 2,17 GiB. PostgreSQL: máximo 22 sesiones de 100 y cero
esperas de locks en las muestras. CPU pico de Edge: 72,16 % de un núcleo;
PostgreSQL: 31,81 % de un núcleo. La CPU del host tiene otro denominador.

Estas muestras no muestran agotamiento de RAM, conexiones o CPU total del host,
pero no excluyen esperas breves ni saturación de un recurso no instrumentado.
El campo `connections.active` cuenta sesiones de `pg_stat_activity`, no solo
consultas ejecutándose. Picos muestreados cada ~2 s, no máximos continuos.
Los 1.166 registros de las tres corridas están en `recursos-serie.csv`.

## Integridad, conflictos y recuperación

La secuencia global SQL es **104 → 108 → 1.349 → 4.585 → 11.038 → 18.979**,
incluyendo ambos intentos no aprobados antes de los tres aprobados.
Los incrementos de cada nivel aprobado coinciden simultáneamente con su contador
de confirmaciones aceptadas y con el incremento del conjunto de reservas propio
de las dos barberías. Antes/después: cero solapamientos, tenants incongruentes,
recibos o requests duplicados y reservas parciales.

Los tres resultados guardan `exit:0`, `interrupted:null`, `recovered:true`,
`verified:true`, resumen exportado y cierre no forzado. El supervisor esperó
120 s y comprobó salud del backend, recursos e integridad; aquí se verifica ese
registro, sin repetir la consulta. No equivale a disponibilidad mensual EQ-05.

La mezcla no fuerza conflictos: toda confirmación aceptada exige HTTP **201**.
Con checks al 100 %, un 409 no podría haberse contado como éxito. Se concluyen
cero conflictos en los aprobados; el contador ausente sigue `null` en la fuente.
Las carreras, replay e idempotencia con conflictos esperados se acreditan por
pruebas independientes ya realizadas y no se vuelven a ejecutar ni sumar a RPS.

## Intentos no aprobados y correcciones conservadas

| Evidencia | Hecho y tratamiento |
| --- | --- |
| `25/912980a8` | Parada del supervisor por presión de memoria sostenida durante calentamiento; 24 HTTP, 4 aceptadas y 4 persistidas. Máximo 1 VU; no acredita 25. Recuperación e integridad correctas. No se eliminaron las reservas |
| `25/dd8f7bd1` | HTTP 500 de confirmación por WorkerAlreadyRetired con per_worker. 6.239 HTTP, 1 técnico, 1.235 aceptadas y 1.241 persistidas; seis transacciones terminaron durante el aborto. No se convierten en éxitos. La aserción abortó; el código posterior de conciliación no es la causa inicial |
| Edge Runtime | Cambio autorizado solo en laboratorio de per_worker a oneshot; contenedor anterior detenido y conservado. Sin reintentos de escrituras medidas ni cambios funcionales. Se mantiene el coste de arranque y las guardas; las tres corridas aprobadas usan el runtime corregido |
| Reasignación del preparador | Se preservan los turnos consumidos y se preparan nuevas asignaciones para los índices revisados de 25. Los rangos necesarios de 50/100 se mantienen; no se reutilizan respuestas ni replays como confirmaciones nuevas |
| Preparación de 50: ECONNABORTED | Primer configure-shop antes del gateway, fuera de medición; sin reserva parcial. Hasta tres intentos para operaciones idempotentes, pausas de 500/1000 ms y cierre de conexiones solo en aprovisionamiento. Journal privado y renovación Auth antes de medir. No es otro intento k6 ni se le asigna un resultado de carga |

Diagnósticos anteriores conservados:
[primer aborto y reanudación](../sprint2-closure/REANUDACION-MIXTA.md),
[fallo de Edge y oneshot](../sprint2-closure/MIXTA-DD8F7BD1.md),
[preparación de 50](../sprint2-closure/APROVISIONAMIENTO-50.md).
Los resultados previos no se sobreescribieron para reflejar estas correcciones.

## Lectura, metas adicionales y límites

La campaña de **lectura** `af768017` conserva Smoke, Load, Load académico,
Stress hasta 1.000 VU y Spike, incluidos sus dos Stress fallidos y el cambio de
Kong de 512 a 4.096 worker_connections. Sus 476.964 HTTP aprobados son otra campaña:
no se mezclan sus percentiles ni RPS con esta serie.
[Informe independiente](../k6-final/INFORME.md).
**1.000 VU corresponde a lectura**, no a 1.000 confirmaciones concurrentes.

**2.000 VU continúa pospuesto como objetivo académico adicional**, independiente
de la aceptación original de EQ-04 y EQ-06. No es trabajo necesario para cerrarlos.
El alcance acreditado es una API local, dos tenants, un servicio por tenant y
volumen creciente de reservas sintéticas, con generador y Docker en el mismo host.
No acredita renderizado Web, Android, red pública, escalado ilimitado, producción,
disponibilidad mensual ni todas las combinaciones de tamaños de catálogo.

## Siguiente trabajo mínimo: EQ-08

No requiere más k6 ni nuevas funcionalidades. Preparar un paquete **separado** de
evidencia de mantenibilidad con los resultados ya aprobados de cliente y servidor:

1. Vincular los casos reales `createRequestReservation` (SolicitarReserva) y
   `createConfirmReservation` (ConfirmarReserva), sus contratos propios y dobles
   de gateway con los reportes históricos de regresión. Fuentes:
   `tests/unit/reservations/confirmation.test.ts`, `booking-application.test.ts`
   y `tests/server/reservations/confirmation.test.ts`.
2. Adjuntar los listados de importaciones de los checkers cliente/servidor,
   identificando cero dependencias prohibidas en dominio y aplicación. Reutilizar
   CI y [calidad reproducible](../calidad.md); solo si falta el listado o la versión
   no coincide, ejecutar esos checkers offline y las regresiones puntuales, sin
   backend ni preparación de datos. No repetir toda la validación aprobada.
3. Dejar **parcial el cumplimiento integral de EQ-08**: su procedimiento original
   también exige sustituir un adaptador de mapas o imágenes y comprobar sus reglas.
   Esos módulos no están completos; documentar la condición pendiente sin crear
   un adaptador ficticio ni cambiar el requisito. El núcleo construido tiene
   evidencia independiente; no permite declarar cumplido lo ausente.

Este cierre no declara íntegros EQ-02/05/08/09 ni los diez atributos. La matriz
[REQUISITOS-CALIDAD.md](../k6-final/REQUISITOS-CALIDAD.md) conserva esas limitaciones.

## Reproducción de la auditoría, sin pruebas de carga

Desde la raíz:

```powershell
node docs/evaluacion/evidencias/004-reservas/k6-mixta-final/auditar-mixta.mjs
node docs/evaluacion/evidencias/004-reservas/k6-mixta-final/generar-tablas.mjs
```

El primer comando solo lee evidencia y compara SHA-256; no renueva sesiones ni
ejecuta k6, SQL, Docker o red. La generación gráfica usa ReportLab y PDFium ya
disponibles en el runtime de herramientas, no dependencias nuevas del producto.
No ejecutar `test:carga:mixta` de nuevo por rutina: la serie está terminada.
Se conservaron 763 archivos de fuentes y evidencia original mediante hashes,
incluidos todos los intentos. También se contrastaron los 131 hashes históricos
de la campaña de lectura con su inventario anterior. Los manifiestos con JWT y
fixtures privados siguen ignorados; solo se exportan agregados sanitizados.
Sin cambios en funcionalidades, migraciones, Cloud, Actions, commits o push.
