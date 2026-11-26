# T033 — Rendimiento local acreditado e infraestructura pendiente

## Estado vigente — Consolidación k6, 26/11/2026

**Cierre actualizado:** serie mixta `71e00e3c` aprobada en 25/50/100 VU ×600 s,
88.472 HTTP, 17.630 confirmaciones aceptadas = persistidas, cero errores, integridad
y recuperación registradas. EQ-04/EQ-06 cumplidos para laboratorio y mezcla
original: p95 completo de consultas a 100 VU de 4/8/7 ms. Global HTTP p95 3.660,71 ms
documentado como limitación de la mezcla; percentiles de confirmación no disponibles.
[Informe mixto, tablas y gráficas](k6-mixta-final/INFORME.md).

La campaña manual `af768017-0ecc-48b5-b6fe-af5aa287cd5d` está auditada:
Smoke, Load, Load académico, Stress hasta1.000VU y Spike aprobados, con dos
intentos Stress fallidos preservados.186 thresholds recalculados, cero errores
en las cinco corridas satisfactorias, recuperación e integridad registradas.

[Informe técnico final](k6-final/INFORME.md), [tablas y métricas](k6-final/RESULTADOS.md),
[clasificación MVP/EQ-01–EQ-10](k6-final/REQUISITOS-CALIDAD.md) y
[seis gráficas para presentar](k6-final/graficas/graficas-k6.pdf).

MVP10VU/60s cumplido para catálogo/slots. La campaña af768017 acredita **lecturas**;
la serie mixta 71e00e3c acredita consultas y confirmaciones concurrentes hasta 100 VU.
Sus métricas y resultados se mantienen separados. 1.000 VU no significa capacidad
de 1.000 escrituras ni 2.000 VU probados. La meta de 2.000 sigue pospuesta como adicional,
independiente de EQ-04/EQ-06. No se requiere más carga para cerrar esos escenarios.
DNS/CDN/HTTPS/CSP del destino publicado conservan su evaluación independiente.

Los bloques siguientes son antecedentes fechados de preparación y no sustituyen
esta conclusión. En esta consolidación no se ejecutó carga, SQL, servicios, Cloud,
commits ni push;131 archivos crudos, incluidos preliminares, permanecieron intactos.

## Revisión adicional de memoria — 25/11/2026,17:39 Lima

Dos lecturas reales de preflight:0,90GiB libres/94,14% RAM ocupada y, tras esperar,
1,16GiB/92,50%. La última lectura equivale aproximadamente a1,24GB decimales en el
instante del preflight; una consulta inmediatamente posterior obtuvo1,21GB por variación
normal del consumo. No se atribuye la diferencia con los3,6GB vistos por el usuario
solo a unidades: las lecturas corresponden a momentos distintos. CPU46% puntual,
disco libre185,38GiB, Docker29.9.3 y k6 2.4.0 disponibles. Contenedores activos con
arranque reciente; no se investigó ni se atribuyó el origen de ese reinicio.

Ambos preflights exit2: solo INSUFFICIENT_MEMORY_HEADROOM. No se alteró el mínimo
4GiB libres/<80%ocupada. La base habitual sigue detenida y el laboratorio no tiene
contenedores. No se inició ningún servicio ni se ejecutó carga. Incluso3,6GB
libres estarían por debajo de4GiB; al disponer del margen debe comprobarse otra vez
tras levantar backend mínimo antes de autorizar el humo.

La progresión nueva solicitada sustituye para futuras ejecuciones los saltos mayores:
humo→10→25→50→100→200→300→…→2.000VU, con revisión de cada etapa. No se ejecutó ni
se adaptó todavía el selector de niveles de los scripts: hacerlo antes de avanzar
más allá de100VU. No hay nuevos resultados p50/p95/p99/RPS/integridad ni capacidad.
Se actualizaron los JSON sanitizados existentes, preservando los antecedentes.

## Reanudación k6 — 25/11/2026, estado vigente

k6 **2.4.0** instalado con Winget, paquete oficial GrafanaLabs.k6, MSI de GitHub/grafana/k6
con hash verificado. Docker Engine29.9.3 operativo. El responsable autorizó detener
Metro8081 y la pila habitual: se detuvieron7 contenedores, inventario/montajes conservados,
sin eliminar nada. Las otras dos pilas no se operaron; Docker Engine permanece activo.
Restauración posterior documentada en [k6/README.md](../../../../k6/README.md).

Tras detenerlos hubo2,01GiB libres; última lectura1,65GiB/15,43GiB y89,31%ocupada.
El preflight ahora detecta k6 y Docker; **solo persiste el bloqueo de memoria**.
No se relajó el mínimo4GiB/<80%. CPU de inspección0% puntual y disco libre187,97GiB,
no promedios bajo carga. No se inició otra pila ni se reclamó memoria de terceros.

Se preparó copia independiente project_id barbexa-k6-lab/API54721/DB54722/shadow54720,
26 migraciones idénticas y funciones sin .env privados, bajo .artifacts/k6/supabase-lab.
**No está levantada**, no se aplicaron migraciones ni se crearon sesiones/fixtures/marcador.
La provisión sintética y los ensayos HTTP/SQL reales siguen pendientes por recursos.

Implementados [escenarios HTTP](../../../../k6/scripts/booking-api.js) para catálogo,
servicios/profesionales, slots, confirmación, conflicto, replay y aislamiento con RLS;
[supervisor](../../../../k6/run-lab.mjs) con guardas de target, recursos, sesiones, salud,
conexiones y recuperación; [consultas de integridad](../../../../k6/integrity.sql).
SQL de integridad redactado contra el esquema actual, pero no ejecutado ni validado
por PostgreSQL todavía. Las respuestas esperadas de HTTP requieren validación viva;
inspect solo verifica que k6 puede cargar sus módulos/opciones.

Validación segura ejecutada:3 tests de guardas pasan (RED→GREEN),13 configuraciones
k6 inspect pasan; run en modo inspección rechazado exit107 antes de tráfico. Supervisor
rechaza por RAM exit1 antes de conectar al laboratorio. Node comprueba sintaxis de los
scripts de preparación/supervisión; Prettier dirigido aprobado. Ninguno de estos
comandos prueba backend ni acredita un nivel VU. Se mantienen los umbrales y duraciones
originales del bloque inferior, con política de fallo conservadora y periodo de
recuperación en el supervisor. Ninguna etapa de carga fue ejecutada:1,10,25,50,100,250,
500,1.000 y2.000VU pendientes; p50/p95/p99/RPS/errores e integridad nuevos no medidos.

[Preflight actualizado](k6-preflight.json), [resumen sanitizado](k6-validation.json) y
[reproducción, limitaciones y restauración](../../../../k6/README.md). Registro crudo
local ignorado en .artifacts/k6: inventarios, restauración, stats e inspecciones.
No secretos versionados ni código productivo/Constitución/SDD/SQL migratorio/Actions
modificados; sin Cloud, datos habituales alterados, commits/push, despliegue o costos.
Los bloques siguientes conservan el preflight inicial y el plan original como antecedentes.

## k6: preparación y preflight — 25/11/2026

**Estado vigente: bloqueado antes del humo; ninguna ejecución k6.** Base de producto
`a758dfa`,23 commits; consolidación documental previa conservada. El usuario autorizó
infraestructura aislada y datos sintéticos, sin Cloud ni escrituras en LOCAL habitual.
No se usaron los datos existentes ni mocks como backend de carga.

### A. Entorno comprobado

Preflight ejecutado fuera del sandbox con
`powershell -File scripts/k6-preflight.ps1` (o `pwsh -File`); salida2 significa bloqueo,
no fallo de producto. [Resultado sanitizado](k6-preflight.json), observado a21:51:35UTC:
24 procesadores lógicos,15,43GiB RAM total,2,84GiB libre,81,58% ocupada. CPU identificado
durante inspección: Intel Core Ultra9 275HX. CPU instantánea/backend/conexiones: no medidos.
k6 no disponible en PATH ni en las ubicaciones estándar inspeccionadas; cliente Docker
presente, Engine no responde (pipe dockerDesktopLinuxEngine inexistente). No se inició
Docker ni se instaló k6: con este margen no se levantó otra pila local para medir carga.

Política conservadora del laboratorio, independiente de los SLO: antes de preparar la
pila exigir >=4GiB libres y RAM ocupada<80%. El preflight **no concede permiso para cargar**
por sí solo: también hay que validar identidad/propiedad del target y recursos después
de iniciar la pila. No se afirma que esta RAM demuestre una capacidad máxima del producto.
La falta de herramientas e infraestructura está comprobada; no se agotaron intentos
de instalación ni se atribuye a BARBEXA un defecto funcional.

La configuración habitual `supabase/config.toml` usa project_id app-barberia-002-local,
API54421/DB54422/shadow54420, PostgreSQL17, pooler deshabilitado. Es inventario, **no target**.
El futuro laboratorio debe usar otro directorio/project_id, volúmenes/red propios,
puertos distintos verificados libres y manifiesto sin enlace Cloud; nunca reset sobre
esta configuración. Copiar las migraciones sin editarlas al laboratorio y aplicar solo
allí, con correo externo bloqueado. Antes: verificar esquema, cero datos no sintéticos,
propiedad de volúmenes/montajes y salud; conservar huellas antes/después. Nada de ello
se declara preparado o ejecutado todavía.

### B. Escenarios y criterios preservados

Fuente: [EQ-01 a EQ-10 académicos](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md)
y `specs/004-mvp-reservas/plan.md`, sección Calidad pendiente. Ambos se contrastaron;
no se modificaron especificaciones ni objetivos para conseguir resultados favorables.

| Escenario a implementar contra backend real aislado | Operación y resultado que debe comprobarse |
| --- | --- |
| A. Catálogo/servicios/profesionales | RPC get_booking_catalog con sesión sintética; contenido/tenant correctos, no basta HTTP200 |
| B. Disponibilidad/horarios | RPC list_booking_slots con parámetros reales; intervalos y tenant esperados |
| C. Confirmación y consultas propias | POST /functions/v1/reservation-command action confirm; requestId único para nueva operación, mismo para replay; reserva y pago pendiente verificados por SQL |
| D. Mismo horario | Sesiones distintas contra un intervalo libre común; exactamente un ganador y competidores rechazados conforme al error de negocio; verificar solapamientos después |
| E. Usuarios/tenants distintos | Dos barberías sintéticas, actores y asignaciones controlados, casos legítimos y denegaciones sin filtración; rechazos esperados deben ser del caso autorizado |

Plan propuesto de mezcla para carga estable comparable:80% iteraciones de lectura
(40% catálogo,40% slots),20% confirmación en intervalos planificados únicos. D se
ejecutará aparte para evitar que conflictos masivos oculten la capacidad de escritura.
Registrar cuota efectiva de mezcla y ritmo (una iteración por VU con pausa objetivo1s);
VU no equivale a RPS ni a solicitudes simultáneas. Sesiones obtenidas antes de medir,
sin login masivo; renovación/expiración debe controlarse fuera de la muestra estable.
Los fixtures deben tener suficientes personas/slots para no convertir C en conflictos
por agotamiento de oferta. No se ha fabricado un dataset ni inferido su suficiencia.

Métricas requeridas: VU máximos/activos, iteraciones, solicitudes y RPS por operación,
latencia media/p50/p95/p99 y tiempo completo de pared por operación (incluye conexión,
envío y recepción; http_req_duration solo no basta para EQ-04), errores técnicos,
conflictos y denegaciones esperados, CPU/RAM de generador y contenedores, conexiones,
esperas/locks y estado de integridad. Sin tokens, cabeceras ni cuerpos privados en logs.
Un409 solo se clasifica como conflicto esperado si código/caso/estado SQL coinciden;
un409 genérico o una reserva fallida donde debía funcionar no aprueba el escenario.

| Criterio | Evaluación separada, sin rebajas |
| --- | --- |
| Humo mínimo de preparación |1VU/5 iteraciones, comprobar contratos y SQL antes de escalar |
| Smoke MVP T033 |10VU/1min estable,p95<=2s, errores funcionales inesperados0 |
| EQ-04 |100VU/10min estables,p95<=3s por consulta principal, errores técnicos<1% |
| EQ-06 |25/50/100VU,10min estables por nivel, mezcla equivalente;100VU con p95<=3s, errores técnicos<1%, integridad sin pérdidas |
| Laboratorio250–2.000VU |Caracterización progresiva; conservar gates anteriores como referencia, sin afirmar aprobación EQ por un ensayo más corto |

Por nivel: calentamiento1min a1VU, rampa1min hasta objetivo, carga estable10min en
25/50/100VU; para250/500/1.000/2.000VU, exploración estable2min, descenso1min y recuperación
2min sin carga. Smoke MVP: rampa10s,estable60s,descenso10s y recuperación60s, con percentiles
de su tramo estable. El humo mínimo va primero. Evaluar resumen y SQL antes de cada
incremento; nunca encadenar todos los niveles sin esa decisión. Son duraciones
planificadas, no ejecutadas; las muestras de rampa no deben ocultar fallos del plateau.

Condiciones de interrupción propuestas: CPU de host/generador/backend>85% sostenida30s;
RAM>=85% o libre<2GiB por15s; conexiones>=80% de max_connections por15s; errores
técnicos>=1% en ventana30s (con muestras suficientes); salud ausente3 sondas consecutivas
separadas5s; cualquier inconsistencia SQL o agotamiento del generador. Detener el nivel,
no aumentar carga, observar recuperación y conservar evidencia. Ajustar recursos solo
en el laboratorio y repetir condiciones equivalentes; no modificar umbrales de aceptación.

Guardas futuras obligatorias de los scripts k6/runner: origen EXACTO loopback y puerto
del manifiesto, project_id de laboratorio distinto al habitual, coincidencia de
contenedor/volumen/esquema y runId; fallo cerrado sin manifiesto/fixture vigente.
La credencial de servicio no debe entrar al generador, solo sesiones de usuarios
sintéticos y clave pública. El operador SQL privilegiado separado comprobará integridad.
No se escribió un script HTTP k6 sin target/herramienta para presentarlo como validado.
El único script entregado en esta fase es el preflight real de solo lectura.

### C. Resultados por nivel

| Nivel | Tiempo de carga ejecutado | Solicitudes/latencia/errores | Resultado |
| --- | --- | --- | --- |
| Humo1VU |0s |No medidos |No ejecutado: preflight bloqueado |
| MVP10VU/1min |0s |No medidos |No ejecutado |
|25VU |0s |No medidos |No ejecutado |
|50VU |0s |No medidos |No ejecutado |
|100VU |0s |No medidos |No ejecutado |
|250VU |0s |No medidos |No ejecutado |
|500VU |0s |No medidos |No ejecutado |
|1.000VU |0s |No medidos |No ejecutado |
|2.000VU |0s |No medidos |No ejecutado |

No hay nivel máximo de carga comprobado.0s no significa capacidad cero ni rechazo
del producto; significa ausencia de ejecución. **No se alcanzaron2.000VU.**

### D–F. Integridad, cuellos de botella y evaluación

No se tomó snapshot SQL del laboratorio ni se ejercitaron nuevas carreras: backend
aislado inexistente. Las diez carreras históricas de [atomic.md](atomic.md) y su
comprobación complementaria siguen siendo evidencia parcial, no resultados k6 nuevos.
EQ-03 también exige carrera del mismo pago entre barbero/admin y fallo controlado
con rollback, no solo reservas; deberán registrarse ambos sin duplicar recepción.
Comprobar después de cada nivel: cero rangos activos solapados, UNIQUE/idempotencia,
items/eventos/pago completos y aislados por tenant, sin escrituras de denegados.

| Escenario | Estado en esta etapa |
| --- | --- |
| EQ-03 |Pendiente bajo carga nueva; antecedentes SQL acotados conservados |
| EQ-04 |No evaluado: falta100VU/10min y latencias reales por operación |
| EQ-06 |No evaluado: no hubo progresión ni controles de integridad del laboratorio |

El bloqueo observado es de preparación/recursos del equipo, no un cuello de botella
medido del backend o PostgreSQL. Generador y backend compartirían host: aun con carga
real deberá distinguirse su consumo antes de atribuir saturación al producto.

### G. Evidencias y siguiente paso

Creado `scripts/k6-preflight.ps1`, ejecutado exit2 con tres bloqueos verificables;
JSON sin secretos enlazado arriba. Configuración habitual, migraciones y datos intactos.
Se conservaron los cambios documentales anteriores. No k6 Cloud, contratos, nuevas
tecnologías instaladas, commit/push, cambios de Actions, despliegue ni costos.
Para continuar: liberar margen RAM, disponer de k6 local y Docker Engine, repetir
preflight y preparar/verificar la pila independiente antes de validar scripts HTTP
con `k6 inspect` y ejecutar el humo real. Preparación y carga permanecen incompletas.

## Antecedente T033 conservado

No se cuenta con origen Web de aceptación aprobado ni ejecución k6 acreditada en este
bloque. No se instaló k6 ni se enviaron cargas a localhost, Cloud o proyecto anterior.
No se crea un script presentado como validado cuando falta la herramienta/target.

Para ejecutar: aprobar destino/costos/cuentas/datos de prueba y limpieza, comprobar
HTTPS, resolución DNS, CDN y cabeceras CSP efectivas. Después usar la skill k6 y validar
el script mínimo de catálogo/disponibilidad con10VU/1min, p95<=2s y cero errores funcionales
inesperados. No generar reservas masivas implícitamente ni usar credenciales personales.
Separar confirmación concurrente real de las métricas de carga y de los rechazos esperados.

La medición Node de caché [T028](cache.md) es evidencia local útil, pero **no reemplaza k6**
ni demuestra CDN/escalabilidad bajo carga. T033 permanece abierta.
