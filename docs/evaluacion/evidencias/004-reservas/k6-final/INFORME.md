# BARBEXA — Informe final de rendimiento k6

26/11/2026 · Campaña `af768017-0ecc-48b5-b6fe-af5aa287cd5d`.
Auditoría de resultados producidos manualmente por el responsable. Esta etapa
no ejecutó carga, SQL, Docker, servicios ni escrituras de producto.

## Resumen ejecutivo

Las cuatro pruebas están respaldadas por cinco corridas satisfactorias:
Smoke, Load, suplemento Load académico, Stress y Spike. Se conservaron además
dos intentos Stress fallidos. Las corridas aprobadas suman **476.964 solicitudes**,
sin errores técnicos ni resultados funcionales inesperados; los checks alcanzan
100 % y los 186 thresholds exportados aprobaron también el recálculo independiente.

Se acreditaron **1.000 VU en Stress de lectura durante 60 s**, después de aumentar
`worker_connections` de Kong de 512 a 4096. El tramo registró 38.614 solicitudes,
643,57 RPS, p95 HTTP 789,45 ms y p99 HTTP 903,27 ms. Los p95 completos, que también
incluyen conexión y recepción, fueron 786 ms en catálogo y 793 ms en disponibilidad.

El Spike de 1.000 VU durante 30 s aprobó; al regresar a 10 VU, el p95 HTTP de la
fase de recuperación fue 8,97 ms y el p99 9,77 ms. La recuperación e integridad
posteriores figuran satisfactorias en todas las corridas, incluidas las fallidas.

La conclusión está limitada a **catálogo y disponibilidad en un laboratorio local**.
No prueba 1.000 confirmaciones de reservas simultáneas, una capacidad productiva,
disponibilidad mensual ni escalabilidad ilimitada. El RPS cae entre 800 y 1.000 VU
mientras aumenta la latencia: aprobar los límites no significa ausencia de degradación.

## Fuentes, versión y método de auditoría

- Fuente primaria: archivos inalterados de la campaña bajo `.artifacts/k6/campaigns/`.
  Se leyeron `result`, `native-summary`, `summary`, `resources`, `integrity`, logs EOF
  y configuración del laboratorio cuando estaban disponibles.
- Se contrastaron los perfiles y etiquetas de `k6/lib/profiles.mjs` y
  `k6/scripts/booking-api.js`, sin modificarlos. Git base: `a758dfa`; el harness y
  los documentos de cierre son cambios locales posteriores sin commit.
- Se inventariaron por SHA256 **131 archivos crudos**, incluidos originales y
  preliminares. La campaña, su puntero y sus consolidados existentes no se reescribieron.
  [Inventario](preservacion-sha256.json).
- El consolidado original no incluye el segundo intento Stress porque carece de
  resumen. La auditoría nueva incluye los siete intentos, sin inventar sus métricas
  ausentes. N/D en tablas, celdas CSV vacías y `null` en JSON significan no disponible.
- En el formato legacy de `--summary-export`, `false` en un threshold significa
  que no fue incumplido. Se comprobó contra el
  [código oficial de k6 2.4.0](https://github.com/grafana/k6/blob/v2.4.0/internal/js/summary-wrapper.js)
  y se recalculó cada expresión original sobre sus valores: no hubo discrepancias.
- Se requiere exit 0, ausencia de interrupción, duración suficiente, métricas y
  muestras positivas, checks aprobados, integridad y recuperación. Un exit 0
  aislado o alcanzar momentáneamente el objetivo VU no acredita una prueba.

La tabla completa y descargable está en [RESULTADOS.md](RESULTADOS.md).
Los CSV separan intentos, tramos, umbrales y recursos; [auditoria.json](auditoria.json)
conserva los valores sin redondear y las series muestreadas por componente.

## Entorno y alcance medido

Laboratorio Supabase independiente `barbexa-k6-lab`, API en loopback:54721 y DB54722;
Windows y Docker Desktop comparten un host de 24 CPU lógicas y unos 15,43 GiB RAM.
La VM Docker reportaba 7,474 GiB. Seis servicios: PostgreSQL, Auth, PostgREST,
Kong, Edge Runtime y correo local. PostgreSQL: max_connections 100; pool REST 10.
k6 2.4.0 y datos sintéticos con dos barberías; sesiones Auth reales preparadas
antes de medir. No se mide la capacidad de login masivo ni de correo externo.

Las peticiones son HTTP reales a `get_booking_catalog` y `list_booking_slots`.
La mezcla alterna lecturas y añade una pausa por iteración: el modelo es cerrado,
con un número de VU, no una llegada constante garantizada de solicitudes.
El ritmo baja cuando sube la latencia. VU no equivale a RPS ni a sockets.

Las sesiones, permisos de destino y marcador protegieron el entorno aislado.
Que los dos tenants estén presentes en las lecturas no sustituye una batería
de accesos cruzados y escrituras denegadas. La credencial privilegiada se utiliza
fuera del generador para preparación e integridad, no como identidad de cliente.

## Resultado de las cuatro pruebas

### Smoke Test

`ff240096`: 1 VU, cinco iteraciones y cinco solicitudes. Tiempo del denominador
HTTP 5,057 s; proceso 6,496 s, dentro del máximo de 30 s. p95 9,22 ms y p99 9,33 ms;
3/3 thresholds. Es el humo de preparación, **distinto** del criterio MVP de 10 VU.
Solo hay dos muestras de recursos: no interpretar su máximo como un perfil completo.

### Load Test y suplemento académico

`ef67de10`: 10, 25 y 50 VU durante 60 s cada uno; 100 VU durante 600 s, con rampas
de 10 s y descenso final. El escenario de 830 s terminó; proceso 831,313 s.
66.655 solicitudes, 80,26 RPS globales; 39/39 thresholds.

En 100 VU estables: 59.717 solicitudes, 99,53 RPS, p95 HTTP 9,30 ms y p99 11,25 ms;
p95 completo catálogo/slots 4/10 ms. El tramo MVP de 10 VU terminó 60 s con cero
errores y p95 completo 5/10 ms, inferior a 2.000 ms en ambas operaciones.

`83af480c`, suplemento Load académico: 25 y 50 VU durante 600 s por tramo,
sin sustituirlos por sus etapas exploratorias de un minuto. Escenario 1230 s,
proceso 1232,086 s; 45.540 solicitudes y 21/21 thresholds. Junto al tramo de
100 VU del Load, hay evidencia de **25/50/100 VU durante diez minutos cada uno**
con la misma mezcla de lecturas y ritmo. Los tres casos mantienen p95 completos
de catálogo/slots de 4/9, 4/10 y 4/10 ms, respectivamente.

Estos resultados satisfacen los límites numéricos de lectura. El escenario original
EQ-06 también incluye confirmaciones y EQ-04 consultas de reservas; esos alcances
faltan en esta campaña. [Evaluación sin rebajar requisitos](REQUISITOS-CALIDAD.md).

### Stress Test

- `28edec30`: fallido, exit 108, 458 VU observados; tramos 100–400 VU completos.
  70.033 solicitudes y un EOF, que la política inicial también contó como fallo
  funcional. Su tasa técnica fue 0,0014279 %, pero los checks y los tramos no
  ejecutados impidieron aprobar la corrida. No se reinterpreta como exit 0.
- `a8d488dd`: interrumpido por `RESOURCE_SAFETY_LIMIT`. Registra 16 eventos EOF
  (8 catálogo, 8 slots) y recursos, pero no exportó resumen. No se reconstruyen
  solicitudes, tasas, percentiles o capacidad acreditada a partir del relato de
  terminal. La RAM >=90 % sostenida unos 16 s explica el stop, no el primer EOF.
- `e5e44a3e`: aprobado después del ajuste, todos los tramos 100–1.000 VU completos
  durante 60 s, transiciones de 10 s. Escenario 700 s; proceso 703,314 s.
  338.131 solicitudes, 482,40 RPS globales, cero errores y 93/93 thresholds.

El máximo RPS por tramo fue **757,28 a 800 VU**. Después pasó a 644,57 a 900 y
643,57 a 1.000 VU; el p95 HTTP pasó de 201,56 a 605,55 y 789,45 ms. Hay degradación
observable desde la zona 700–900 VU aunque todos los límites aprobados se mantienen.
No se encontró el límite de fallo del backend: se alcanzó el techo autorizado de
1.000 VU, no una prueba hasta ruptura. Los 2.000 VU académicos siguen sin evaluarse.

CPU host máxima 80,53 %, RAM 86,24 %, working set k6 788,18 MiB y backend
865,38 MiB como suma simultánea máxima. PostgREST llegó a 1280,26 % de un núcleo
(aproximadamente 12,8 núcleos) y PostgreSQL a 432,08 %. Es correlación con el aumento
de demanda, no prueba de un nuevo cuello de botella específico ni razón para
aumentar pools sin diagnóstico. PostgreSQL mantuvo hasta 21/100 sesiones y cero
esperas por locks en las muestras; eso no mide ocupación interna del pool REST.

### Spike Test

`7295137f`: 10 VU durante 30 s, subida a 1.000 en 5 s, pico 30 s, bajada en 5 s
y recuperación a 10 VU durante 60 s. El techo estaba respaldado por Stress.
Escenario 130 s; proceso 131,645 s, 26.633 solicitudes, 30/30 thresholds.

| Fase                       | HTTP   | RPS    | p95 HTTP ms | p99 HTTP ms |
| -------------------------- | ------ | ------ | ----------- | ----------- |
| Base, 10 VU / 30 s         | 300    | 10,00  | 9,02        | 13,57       |
| Pico, 1.000 VU / 30 s      | 20.642 | 688,07 | 768,02      | 1.015,98    |
| Recuperación, 10 VU / 60 s | 597    | 9,95   | 8,97        | 9,77        |

El resto de solicitudes corresponde a las rampas. En el pico, p95 completo
catálogo/slots 768/769 ms; en recuperación 4/9,15 ms. Cero errores técnicos o
funcionales en las fases y el total. CPU host máxima 80,69 %, RAM máxima 89,52 %,
k6 624,13 MiB y backend 892,74 MiB. La memoria del host no vuelve necesariamente
a su base en 60 s: no se exige ni se afirma liberación total de cachés/working sets.

## Comparación de la optimización de Kong

El registro `512 worker_connections are not enough, reusing connections` aparece
dos veces en el primer intento y 32 veces en el segundo, alrededor de 450–500 VU.
En el segundo antecede al primer EOF cliente por unos 0,519 s. La plantilla efectiva
no emitía worker_connections y un solo worker usaba el valor implícito 512.

Se explicitó 4096 en la plantilla efectiva y se adaptó el entrypoint para que
sobreviviera a su regeneración. `nginx -t`, límites nofile 1.048.576 y persistencia
tras reiniciar únicamente el mismo Kong fueron verificados en la etapa autorizada.
La configuración de 4096 consta en los propios intentos Stress y Spike aprobados.
[Cambio y respaldos](../k6-lab-optimization.md) · [Diagnóstico previo](../k6-stress-bottleneck.md).

Después, 1.000 VU/60 s finalizaron sin EOF. Los límites numéricos y los escenarios
se conservaron. Entre el primer y segundo intento hubo además un cambio explícito
de metodología, `stress-eof-v1`: EOF aislado solo técnico, sin reintento ni éxito
ficticio; checks al 100 % sobre respuestas recibidas. El cambio está documentado,
no se oculta. La corrida optimizada no registró EOF, por lo que esa excepción no
intervino en su aprobación. También cambió el margen de memoria del host y el
cierre del supervisor: **no es un experimento A/B con todas las variables controladas**.

La mejora acreditada es eliminar el límite temprano de conexiones y completar
mayor concurrencia. No se afirma reducción universal de latencia: en el tramo
comparable de 400 VU, p95 HTTP fue 9,21 ms antes y 13,29 ms después. No se comparan
como equivalentes los percentiles globales de una corrida truncada a 458 VU y
otra que sí incluye niveles altos hasta 1.000.

## Integridad, recuperación y límites de inferencia

Cada `integrity.json` y `result.json` conserva cero reservas y cero solapamientos,
items de tenant incorrecto, duplicados o escrituras parciales antes y después.
`recovered:true` figura en los siete intentos después del periodo configurado
(60 s en Smoke, 120 s en los demás), con salud y comprobaciones de integridad
según el supervisor vigente en cada ejecución. No se repitieron esas consultas
durante esta auditoría; se informa el estado guardado de cada corrida.

**Cero reservas es esperable porque las corridas son de lectura.** La consulta de
integridad demuestra que ese ensayo no alteró esos invariantes; no somete a carga
las transacciones de reserva, cobro, conflictos, idempotencia o aislamiento de escritura.
Las carreras SQL/HTTP históricas aportan evidencia independiente acotada, no se
convierten en un resultado de k6 a 1.000 VU.

No hay traza de inicio/fin de cada petición ni serie VU instantánea exportada.
Las etapas y sus duraciones se verifican con perfil, métricas de tramo, contadores
de cruce y tiempo total. Los gráficos no presentan percentiles instantáneos:
en Spike se representan agregados por fase, con huecos en las rampas.
Los máximos CPU/RAM son muestreados y pueden omitir picos entre muestras.

Otros límites: equipo local compartido con generador/WSL/backend, recursos y red
distintos de un despliegue real; volumen sintético acotado; sin mapas, renderizado
Web/Android, Storage, login masivo o latencia de Internet. La prueba de lectura
no atravesó la Edge de confirmación. No acredita autoscaling horizontal, HA,
disponibilidad mensual o CD. Alcanzar VU describe este perfil y ritmo, no personas
simultáneamente activas en toda la aplicación.

## Gráficas y archivos para la presentación

Se generaron seis figuras en SVG y PNG, además de un PDF vectorial de seis páginas,
usando ReportLab sin instalar dependencias en el proyecto. El PDF fue renderizado
con PDFium y revisado visualmente; el ajuste de espaciado del Spike se corrigió.

1. [VU frente a p95/p99](graficas/01-latencias.png).
2. [VU frente a RPS](graficas/02-rps.png).
3. [Errores por nivel](graficas/03-errores.png).
4. [CPU y RAM](graficas/04-recursos.png).
5. [Antes y después de Kong](graficas/05-optimizacion.png).
6. [Spike y recuperación](graficas/06-spike.png).

[PDF para presentar o imprimir](graficas/graficas-k6.pdf).
Las imágenes conservan ejes, unidades y notas de alcance; no rellenan valores
ausentes con cero ni dibujan una tasa para el segundo Stress incompleto.

Reproducción offline: `node auditar-campana.mjs` y `node generar-tablas.mjs` desde
esta carpeta, o sus rutas completas desde la raíz. `generar-graficas.py` requiere
ReportLab y pypdfium2, disponibles en el runtime de herramientas usado; no se
añadieron al package.json ni son dependencias del producto. Los generadores
solo escriben documentos derivados en esta carpeta, nunca los resultados crudos.

La clasificación de MVP y EQ-01–EQ-10, con las actividades estrictamente necesarias,
está en [REQUISITOS-CALIDAD.md](REQUISITOS-CALIDAD.md). No se realizaron commits ni push.
