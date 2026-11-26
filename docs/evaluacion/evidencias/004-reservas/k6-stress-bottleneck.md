# Diagnóstico de los dos intentos Stress

Diagnóstico documental, 26/11/2026. Campaña conservada:
`af768017-0ecc-48b5-b6fe-af5aa287cd5d`. No se ejecutó carga ni se modificó
infraestructura, producto, migraciones, datos, Cloud o thresholds.

## Resultado y alcance

Hay dos problemas distintos. Los registros demuestran agotamiento de conexiones
del worker de Nginx/Kong al acercarse a 500 VU. El segundo intento continuó
registrando EOF como errores técnicos y terminó por la protección de memoria
sostenida del host, no por el primer EOF ni por agotamiento de conexiones SQL.

Este diagnóstico corrige la atribución inconclusa del informe anterior
`k6-stress-eof-analysis.md`: su búsqueda omitió las advertencias
`512 worker_connections are not enough, reusing connections`, ya presentes
en los logs originales del primer intento. El informe y las evidencias anteriores
se conservan; no se reinterpretan sus resultados como aprobados.

## Comparación

| Medición | Primero: 28edec30 | Segundo: a8d488dd |
| --- | --- | --- |
| Finalización | exit 108, aborto por resultado inesperado bajo política estricta anterior | exit null, RESOURCE_SAFETY_LIMIT |
| Tiempo del proceso según supervisor | 278,170 s | 308,393 s |
| HTTP total / satisfactorios | 70.033 / 70.032 | Sin resumen final disponible |
| EOF | 1, también contado como fallo funcional | 16 eventos registrados: 8 catálogo y 8 disponibilidad |
| Advertencias worker_connections en ventana capturada | 2 | 32 |
| CPU host máxima muestreada | 21,34 % | 35,97 % |
| RAM host máxima / mínima libre | 85,51 % / 2,237 GiB | 92,03 % / 1,231 GiB |
| Working set máximo observado k6 | 588,13 MiB | 625,75 MiB |
| Sesiones PostgreSQL máximas / límite | 21 / 100 | 21 / 100 |
| Esperas de locks muestreadas | 0 | 0 |
| Recuperación e integridad final guardadas | true / sin violaciones | true / sin violaciones |

Primer intento: p95 HTTP 9,1749 ms, p99 15,337 ms y 253,387 RPS globales.
El error técnico fue 0,0014279 %, pero la política estricta anterior también
falló checks y resultados funcionales. No se altera esa evidencia.

Las 84.159 iteraciones y los 500 VU del segundo intento fueron comunicados por
el responsable desde la terminal. No hay `summary.json` ni `native-summary.json`
para comprobar sus agregados, p95/p99, RPS o porcentaje final de errores. Los
contadores de acceso de Kong son solo de la ventana capturada y no sustituyen
el resumen k6. Tampoco se calcula una tasa técnica dividiendo EOF entre iteraciones.

## Causa de la detención del segundo intento

La reproducción sin tráfico de `pressureDecision` sobre 152 muestras encuentra
el primer stop en `2026-11-26T04:51:44.207Z` (25/11, 23:51:44 en Lima).
La secuencia de RAM >=90 % comenzó a las 04:51:28.114Z y duró 16,093 s
entre muestras. En la muestra de stop: RAM 91,866 %, libre 1,256 GiB,
CPU 26,974 %, sesiones SQL 21/100 y cero esperas de lock.
El supervisor evalúa después de capturar cada muestra; el instante exacto de
su llamada puede diferir unos milisegundos de esa reproducción.

La condición vigente es RAM >=90 % o libre <768 MiB durante al menos 15 s;
también existen abortos inmediatos por <512 MiB o >=97 %, CPU >85 % durante
30 s y conexiones >=80 % durante 15 s. En este intento se activa la primera
por porcentaje sostenido, no por una estimación preventiva ni una lectura aislada.

El supervisor llama `child.kill('SIGTERM')`. En Windows esta terminación no
garantiza el cierre ordenado de k6 y su exportación final. La ausencia de ambos
resúmenes, el exit null y la causa guardada concuerdan con esa interrupción.
El segundo intento no demuestra violación del umbral técnico <1 %: carece del
denominador final verificable.

## Origen de los EOF y límites efectivos

Kong tiene un worker (`worker_processes 1`). El `events` del Nginx generado
solo contiene `multi_accept on`, sin `worker_connections`. Aunque `.kong_env`
anuncia `nginx_events_worker_connections = auto`, esa directiva no llega a la
plantilla efectiva. El warning confirma el límite real de 512.

En el segundo intento la primera advertencia aparece a las
04:51:13.821894118Z; el primer EOF cliente a las 04:51:14.341Z, unos 0,519 s
después y durante la transición 400→500 VU. Las advertencias continúan hasta
04:51:44.053Z. En el primero aparecen a las 04:29:01.660804030Z y
04:29:02.049574530Z, alrededor del aborto al subir hacia 500.

[Nginx documenta](https://nginx.org/en/docs/ngx_core_module.html#worker_connections)
que el valor predeterminado es 512 y que incluye conexiones de clientes y de
upstream. Por ello VU no equivale a una única conexión del worker. Las conexiones
persistentes y las de proxy compiten por ese límite; no implica que 512 VU sean
una capacidad garantizada. Hay evidencia directa de saturación del gateway y
correlación temporal fuerte con EOF, aunque no captura de paquetes para atribuir
cada socket individual.

Otros límites inspeccionados, sin cambiarlos:

- Kong: nofile 1.048.576; backlog 16.384; proxy HTTP/1.1;
  upstream keep-alive pool 60, idle timeout 60 s, máximo 100 solicitudes.
  `lua_socket_pool_size 30` es otro pool, no el pool SQL.
- PostgREST v16.5: pool 10, adquisición 10 s, idle 30 s, lifetime 1.800 s,
  recuperación automática habilitada. Configuración obtenida con `--dump-config`
  filtrado, sin exponer URI ni JWT; el proceso activo no recibe otro archivo de config.
- PostgreSQL: max_connections 100, 3 reservadas a superusuario, shared_buffers
  128 MiB, work_mem 4 MiB, max_worker_processes/max_parallel_workers 8.
  Las 21 sesiones del monitor incluyen inactivas; no son 21 consultas concurrentes.
  Sin error SQL en stdout en las ventanas capturadas; logging_collector off.
- Docker: 24 CPU disponibles, memoria VM 7,474 GiB; sin cuota CPU/límite RAM
  individual en los contenedores inspeccionados, sin OOMKilled ni reinicios.
  CPU Docker 100 % significa un núcleo, no todo el host.
- En la muestra del stop: seis servicios suman aproximadamente 786 MiB y k6
  626 MiB. Eso no explica por sí solo la RAM total ocupada: Windows, WSL,
  procesos externos y cachés también cuentan. No se demuestra una fuga del producto.
- Windows: rango TCP dinámico 49.152–65.535 (16.384 puertos). No se capturaron
  sockets/TIME_WAIT durante el pico; no hay evidencia para culpar a ese rango
  o al NAT Docker. Tampoco se midió una serie CPU exclusiva de k6 en porcentaje:
  se guardaron tiempo CPU acumulado y memoria del proceso.

No se demuestra saturación de CPU, pool SQL o lógica BARBEXA. La limitación de
conexiones del gateway sí está demostrada; la presión de RAM explica el stop
del segundo intento como problema adicional del entorno compartido.

## Capacidad acreditada y recuperación

La reevaluación de los segmentos del primer intento acredita 100, 200, 300 y
400 VU durante 60 s cada uno. A 400 VU: 23.932 solicitudes, 398,867 RPS,
p95 HTTP 9,212 ms, errores cero y p95 extremo a extremo catálogo/slots 4/11 ms.
El tramo de 500 requiere segundos 280–340 del escenario; el segundo intento
se detuvo antes de completarlo y no tiene exportación final. Máximo acreditado
en Stress de lectura: **400 VU/60 s**, no 500, 1.000 ni concurrencia de escrituras.
Esto no equivale a acreditar EQ-04/EQ-06 para 400 VU durante diez minutos.

Ambos resultados guardan recuperación true después de 120 s y cero reservas,
solapamientos, incoherencias tenant, duplicados o reservas parciales. La nueva
consulta de integridad de solo lectura vuelve a obtener cero en todos esos
campos. Los seis servicios siguen en ejecución; PostgreSQL registra 21 sesiones,
una activa de diagnóstico y cero esperas de lock. La verificación de datos vacíos
en estas pruebas de lectura no sustituye las pruebas independientes de escrituras.

## Soluciones propuestas; ninguna aplicada

1. Corregir la plantilla efectiva de Kong **solo en el laboratorio**, con
   `worker_connections 4096`. Para 1.000 clientes, conexiones upstream y margen,
   es un punto de partida razonable sujeto a medición; no acredita capacidad.
   Validar configuración renderizada y `nginx -t` antes de activarla, conservar
   configuración/identidad/datos y plan de reversión. No basta añadir una variable
   que la plantilla actual ignora. Mantener inicialmente un worker para aislar
   el efecto; evaluar dos workers solo en un experimento posterior si la CPU lo exige.
2. Recuperar margen real del host antes de la repetición manual, sin rebajar
   protecciones. Cerrar aplicaciones innecesarias por decisión del responsable
   o separar generador/backend en equipos disponibles permitiría distinguir
   capacidad backend y presión del equipo compartido. Aumentar RAM de Docker
   indiscriminadamente en este host de 15,43 GiB puede empeorar la presión.
3. Mejorar posteriormente la terminación del supervisor en Windows: interrupción
   ordenada compatible con k6 y plazo acotado antes de terminación forzada;
   persistencia incremental de métricas y causa específica. Mantener el aborto
   de seguridad aunque el proceso no pueda exportar. Reducir el coste de lanzar
   Docker/PowerShell síncronos en cada muestra es otra optimización medible,
   no la causa demostrada del EOF.
4. No aumentar pool PostgreSQL/max_connections, alterar SQL o reducir keep-alive
   sin evidencia adicional. En la próxima corrida autorizada capturar conexiones
   activas del gateway, errores, TIME_WAIT, latencias del pool y recursos por proceso.
   Conservar tiempos, niveles, thresholds y política stress-eof-v1; el responsable
   repetirá Stress manualmente solo después de aprobar los ajustes del laboratorio.

## Preservación y trazabilidad

43 archivos existentes de campaña coinciden por SHA256 con el inventario previo;
el puntero activo permanece idéntico. No se regeneró el consolidado de campaña.
Evidencias nuevas de solo diagnóstico en `.artifacts/k6/investigations/stress-second/`:
logs de Kong/PostgREST/DB, configuración filtrada, integridad actual,
`analysis.json` y `analyze.mjs`. Este último reproduce la comparación y la
decisión del supervisor sin ejecutar k6 ni enviar solicitudes HTTP.

No se aplicaron las optimizaciones propuestas. No hubo commits ni push.
