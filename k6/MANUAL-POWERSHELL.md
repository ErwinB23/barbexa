# Campaña formal de rendimiento BARBEXA

## Campaña finalizada — 26/11/2026

**No ejecutar más carga por rutina.** La serie mixta `71e00e3c` terminó en
25/50/100 VU ×600 s. EQ-04/EQ-06 cumplidos para laboratorio/mezcla definidos;
88.472 HTTP, 17.630 aceptadas = persistidas y cero errores. Lecturas hasta
1.000 VU conservadas por separado; 2.000 pospuestos como meta adicional.
[Informe final mixto, tablas y gráficas](../docs/evaluacion/evidencias/004-reservas/k6-mixta-final/INFORME.md).
Los comandos siguientes son antecedentes de preparación y ejecución manual;
no representan trabajo pendiente ni una orden de repetir niveles aprobados.

## Antecedente: última preparación para continuar desde 50 VU

**Vigente:** 25 VU mixtos aprobados en dfbeb172. La preparación de 50 interrumpida
por ECONNABORTED quedó corregida y verificada sin k6. `npm run test:carga:mixta`
omite 25 y continúa solo con 50/100, con 600 s estables por nivel, oneshot y guardas
intactos. Hasta tres intentos con pausas de 500/1000 ms, exclusivamente para
aprovisionamiento idempotente; nunca para la medición.
[Diagnóstico y verificación de 50](../docs/evaluacion/evidencias/004-reservas/sprint2-closure/APROVISIONAMIENTO-50.md).
Los bloques siguientes conservan el historial; no repetir 25 aunque se refieran a él.

**Actualización tras dd8f7bd1:** se corrigió con autorización el runtime local
`WorkerAlreadyRetired` usando oneshot; el contenedor anterior se conserva detenido.
El comando continúa siendo `npm run test:carga:mixta`. Reintento b238ad29 preparado
con baseline1.349, omitiendo todas las1.245 reservas consumidas de ambos intentos.
Mantiene50/100 y600s por nivel. El coste de arranque de workers queda dentro de las
mediciones; la capacidad de fixtures de estas dos barberías será600 futuras/cliente
para no agotar cupos por las reservas preservadas, sin cambiar los criterios EQ.
[Diagnóstico, límites y comprobaciones](../docs/evaluacion/evidencias/004-reservas/sprint2-closure/MIXTA-DD8F7BD1.md).
Los bloques de reanudación anteriores que siguen documentan la evolución; el reintento
vigente es b238ad29. No reejecutar el primer plan ni cambiar de campaña.

**Reanudación revisada:** el intento `912980a8` se detuvo en calentamiento por
RAM sostenida y dejó cuatro reservas válidas. Se conservan ese intento y sus
reservas. El comando de abajo ya tiene preparado un único reintento de25VU:
sustituye solo cuatro turnos consumidos por otros posteriores al rango reservado
para toda la serie; mantiene intactas3.996 asignaciones de25VU y las de50/100VU.
Reinicia el calentamiento y los600s estables completos; el tramo abortado no se
acredita. Después continúa automáticamente50/100 si cada nivel aprueba.
[Detalle y comprobaciones](../docs/evaluacion/evidencias/004-reservas/sprint2-closure/REANUDACION-MIXTA.md).

Smoke, Load, Load académico, Stress hasta 1.000 VU y Spike de **lectura** ya
aprobaron. No repetirlos. Los comandos históricos que aparecen más abajo se
conservan como referencia, no como siguiente paso.

Desde la raíz del proyecto, después de cerrar Codex:

```powershell
npm run test:carga:mixta
```

Serie complementaria independiente `71e00e3c-28eb-4262-80ce-7abe043c49ed`:
25, 50 y 100 VU, **600 s estables por nivel**. Por nivel: calentamiento60s,
rampa60s, medición600s, descenso60s y recuperación120s. Total configurado45min,
más preparación/Auth y cierre. Conserva la terminal nativa y exportaciones JSON.
80% consultas (catálogo, disponibilidad y reservas propias) /20% confirmaciones;
un segundo de pausa por operación. No relaja3s/<1%/checks100%/integridad.

Ya se verificaron preparación, tres endpoints e integridad sin ejecutar k6.
El comando renueva las sesiones cuando corresponde y omite únicamente niveles
aprobados de esta serie. No reutiliza aprobaciones de lectura para la mezcla.
Evidencias nuevas: `.artifacts/k6/complementary/<serie>/<nivel>/<intento>/`.
Sesiones/manifiestos privados: `.artifacts/k6/supabase-lab/complementary/<serie>/`.
La campaña af768017, sus archivos y su puntero no se modifican.

Las estimaciones de RAM advierten; las guardas críticas/sostenidas siguen activas.
No ejecutar simultáneamente otros generadores ni aprovisionadores. Ante un intento
fallido que haya confirmado reservas, conservarlo y diagnosticar antes de repetir:
no borrar datos ni reiniciar la campaña para forzar aprobación. Solo el intento
anterior revisado tiene este permiso de reanudación; otro fallo volverá a exigir
revisión y no se reintentará automáticamente. El bloqueo
`operator.lock` protege contra dos operadores; si la terminal se cerró abruptamente,
verificar primero que no siga vivo ningún proceso antes de retirar ese archivo
con autorización. El programa no elimina evidencias ni reservas.

Preparar/verificar sin iniciar k6, solo si fuese necesario:

```powershell
node k6/complementary-cli.mjs --execute=local-synthetic-lab --prepare-only
```

[Volumen, fixtures, aceptación y estado EQ](../docs/evaluacion/evidencias/004-reservas/sprint2-closure/CIERRE-SPRINT2.md).
2.000VU siguen sin acreditar; no son el objetivo de esta serie mixta.

## Ajuste del laboratorio y cierre controlado — 26/11/2026

Kong pasó de 512 conexiones efectivas por worker a **4096**, conservando un
worker, imagen, puertos, rutas, autenticación y pools. El cambio sobrevivió a un
reinicio únicamente de Kong, conservando su contenedor y todos los volúmenes.
El arranque original regenera la plantilla: el adaptador del entrypoint la corrige
antes de `kong prepare`. `lab-control start` reaplica el ajuste de forma idempotente
si se recrea el contenedor. `run-lab` verifica la configuración antes de ejecutar.

Comprobaciones sin carga, desde la raíz del proyecto:

```powershell
node k6/kong-tuning.mjs verify
node k6/lab-control.mjs status
node k6/lab-control.mjs integrity
```

Comando histórico de la etapa anterior, **ya ejecutado y aprobado**:

```powershell
npm run test:carga -- stress
```

No crear otra campaña ni borrar resultados anteriores. Las sesiones y fixtures se
renuevan automáticamente antes de medir. Si Kong se recreó fuera del procedimiento
del laboratorio y falla la verificación, ejecutar `node k6/kong-tuning.mjs apply`
sin ninguna prueba activa; el comando solo admite el laboratorio aislado autorizado.

El supervisor usa un puerto dinámico **127.0.0.1**, comprueba en Windows que su
propietario sea el proceso k6 y solicita `PATCH /v1/status` con `stopped:true`.
Mantiene hasta 10 s para cierre/exportación; ante presión crítica inmediata,
el plazo se reduce a 2,5 s. Si k6 no termina, se fuerza su cierre. Estos plazos
son de terminación de seguridad, no cambios de etapas, latencias o thresholds.
No puede garantizarse un resumen si el proceso no responde, se agota la memoria
o falla el disco. Nunca se inventa ni se sustituye con métricas parciales.

Las nuevas corridas guardan `lab-configuration.json`, `shutdown.json` y
`result.summaryExported`, además del resumen nativo y `summary.json` cuando k6
los exporta. Una interrupción continúa siendo **no aprobada**, incluso si k6
devuelve exit 0 al recibir la orden de detenerse. Los recursos se guardan al
solicitar la interrupción; las verificaciones de recuperación/integridad permanecen.

Las estimaciones de RAM, incluido el arranque frío, advierten; no se exige un
mínimo preventivo fijo de 4 GiB. Se conservan el rechazo por agotamiento crítico
y todos los abortos vigentes por presión sostenida, CPU, conexiones y salud.

Comparación anterior/posterior, respaldos y verificaciones:
`docs/evaluacion/evidencias/004-reservas/k6-lab-optimization.md`.

## Comandos

Desde PowerShell de Visual Studio Code, en la raíz del proyecto:

```powershell
npm run test:carga -- smoke
npm run test:carga -- load
npm run test:carga -- stress
npm run test:carga -- spike
npm run test:carga -- completo
```

`completo` ejecuta smoke → load → stress → spike; se detiene ante fallos. Los comandos
individuales usan la misma campaña. Load requiere Smoke aprobado; Stress requiere
Load aprobado. Spike requiere capacidad acreditada por Stress y recuperación válida.
No iniciar otro comando mientras uno esté activo. No ejecutar k6 directamente.

El laboratorio existente se reutiliza; no se reinicia. Se preparan/renuevan sesiones
Auth reales y fixtures antes de cada medición, respetando429. Se verifican proyecto,
volúmenes,26 migraciones, marcador, identidad, endpoints, aislamiento e integridad.
La preparación puede tardar por los límites de Auth; su detalle va a archivos privados.

## Perfiles configurados

| Tipo   | Perfil                                       | Tiempo de escenario | Recuperación posterior sin carga |
| ------ | -------------------------------------------- | ------------------- | -------------------------------- |
| Smoke  | 1VU,5 iteraciones, máximo30s                 | ≤30s                | 60s                              |
| Load   | 10/25/50VU60s cada uno;100VU600s             | 830s:13min50s       | 120s                             |
| Stress | 100→1.000VU, incrementos100;60s por nivel    | 700s:11min40s       | 120s                             |
| Spike  | 10VU30s; subida5s; pico30s; bajada5s;10VU60s | 130s:2min10s        | 120s                             |

Load tiene rampas de10s por nivel y descenso final de10s. Stress comienza en100VU,
sin reiniciar k6 entre niveles; transiciones10s y descenso final10s. Load/Stress/Spike
permiten hasta5s de gracia de finalización; Smoke tiene gracia0 para respetar30s.
Los tiempos no incluyen preparación de Auth, arranque del generador ni comprobaciones.

El pico solicitado es1.000VU **solo si Stress lo acredita**. Si Stress se interrumpe,
`completo` se detiene. Después de una recuperación verificada puede ejecutarse Spike
por separado: su techo se reduce al prefijo de niveles Stress completados y aprobados.
Se usa el intento Stress más reciente, no una capacidad histórica mayor. Sin al menos
100VU acreditados, Spike se bloquea. Alcanzar1.000 no equivale a aprobar1.000.

## Aprobación y alcance

- Todas las pruebas: Auth real, respuestas reales, checks100%, resultados inesperados0,
  errores técnicos<1%, integridad sin violaciones y recuperación válida.
- Smoke: completar las5 iteraciones sin errores dentro del máximo; valida catálogo
  y disponibilidad con identidades autenticadas. Se verifican endpoints antes de medir.
- Load: p95 de tiempo completo por catálogo y disponibilidad ≤2s en10VU y ≤3s en
  los demás niveles, muestras positivas por operación y thresholds aprobados.
- Stress: mismos límites ≤3s y errores<1% **por nivel**, con muestras positivas y
  tramo terminado. Se registra degradación por nivel; el máximo acreditado se detiene
  en el primer nivel fallido/incompleto. Integridad/recuperación inválidas anulan capacidad.
- Spike: p95≤2s en base y recuperación10VU; pico≤3s. Se evalúan por separado base,
  pico y recuperación; no se inventan datos si un tramo no se alcanza.

Se conservan consultas de lectura de catálogo/slots, ritmo1s por iteración y mezcla
alternada. VU no equivale a RPS ni a clientes activos diarios. Las tendencias HTTP y
las de tiempo completo se distinguen: las cifras HTTP por sí solas no acreditan EQ-04.
Los escenarios anteriores de confirmación, conflictos, idempotencia y aislamiento
siguen disponibles en `run-lab.mjs` para evaluación independiente; no se mezclan con
la medición de capacidad de lectura. No se declara concurrencia de escritura probada.

## EQ-04 y EQ-06: pruebas cortas frente a formales

Fuentes originales: `specs/004-mvp-reservas/plan.md` y
`docs/evaluacion/evidencias/004-reservas/entrega-tecnica.md`. EQ-04 exige100VU/10min;
EQ-06 exige25/50/100VU con10min estables por nivel y mezcla equivalente.

Los tramos nuevos de25/50 de un minuto son diagnósticos; **no sustituyen esos10min**.
Las pruebas preliminares largas se conservan completas. Para acreditar25/50 dentro
de la nueva campaña, después de Load ejecutar el suplemento del tipo Load:

```powershell
npm run test:carga -- load-academico
```

Este suplemento hace25VU600s y50VU600s, con rampas10s:20min30s más120s de recuperación.
No duplica100VU/10min, que ya está en Load. `completo` ejecuta los cuatro tipos pedidos;
no incluye este suplemento ni declara automáticamente EQ-06 completo.

## Campaña, archivo y progreso

Se creó una campaña nueva, independiente. Sus comandos no reutilizan aprobaciones
preliminares. Dentro de esta campaña sí se conserva un tipo aprobado al reanudar.
Los intentos fallidos/incompletos permanecen y no se presentan como aprobados.

```text
.artifacts/k6/campaigns/
  preliminary/                     copia íntegra de las corridas anteriores
  preliminary-index.json           inventario y SHA-256; originales conservados
  <UUID>/campaign.json              campaña y fixtureRunId
  <UUID>/<tipo>/<intento-UUID>/     resultados originales de cada intento
  <UUID>/consolidated.json          aprobación, máximo Stress y métricas por nivel
  <UUID>/comparison.csv             comparativa por tramo/nivel
  <UUID>/comparison-total.csv       totales por intento, incluido Smoke
```

Cada intento conserva summary.json, native-summary.json, result.json, resources.json,
integrity.json, resource-policy.json y permiso local. JSON/CSV incluyen solicitudes,
RPS, promedio/p50/p95/p99, errores y resultados inesperados. Recursos crudos incluyen
CPU/RAM de los seis servicios y generador, CPU/RAM del host, conexiones y locks.
La alineación por tramo usa el inicio real del escenario, excluyendo inicialización.
CPU de Docker y del proceso se expresa con100%=un núcleo; puede superar100%.
La duración configurada y el tiempo de pared del generador son campos diferentes.
Los campos sin medición quedan vacíos/null. Antes de ejecutar, las tablas tienen solo
cabeceras: no representan resultados. No publicar manifiestos, tokens ni logs privados.

Para reconstruir el consolidado, sin ejecutar carga:

```powershell
node k6/campaign.mjs report
node k6/lab-control.mjs integrity
```

Un Ctrl+C abrupto puede dejar evidencia parcial. No se acredita un tramo sin datos
completos; revisar integridad antes de continuar. El bloqueo residual de la interrupción
anterior fue archivado tras comprobar ausencia de procesos. La preparación ahora libera
su bloqueo ante SIGINT/SIGTERM normales; un cierre forzado puede requerir revisión.

## Consola y protecciones

### Excepción autorizada solo para EOF en Stress: stress-eof-v1

En futuros Stress de lectura, un error de transporte status0 terminado en EOF se
cuenta como técnico, sin reintento ni éxito. No se fabrica un check de contenido:
100% de checks aplica a respuestas recibidas; el umbral técnico<1% sigue sobre todas
las solicitudes. Se registran respuestas no validadas, cobertura y cada EOF con UTC,
tramo/operación/error_code en javascript-console.log. Resultados JSON/CSV indican
metodología. El intento original28edec30 continúa fallido, sin reinterpretarlo.
La excepción no incluye otros errores ni otras pruebas. Fallos funcionales, de
autenticación/aislamiento, integridad y presión crítica siguen abortando.

### Salida y vigilancia

k6 conserva logo, barra/VU/tiempo en vivo, THRESHOLDS y TOTAL RESULTS nativos, una sola
vez por tipo. No redirigir/Tee-Object si se quiere la barra interactiva. El supervisor
solo añade estado y ruta de evidencias; los JSON extensos quedan en archivos.

Estimaciones RAM: avisos. Riesgo crítico<512MiB libres o RAM>=97%: rechazo/aborto
inmediato. RAM>=90% o libres<768MiB durante15s, CPU>85%30s o conexiones>=80%15s:
interrupción. Pérdida de salud/monitorización e incumplimiento funcional: detener.
Los timers de presión son independientes. No hay opción de forzar, ni cambios en WSL,
swap, Cloud o políticas de Auth. Se mantienen los umbrales originales de rendimiento.

La ausencia de calibración aplicable también es solo una advertencia; se utiliza la
estimación conservadora. Por ejemplo, una calibración anterior de100VU no bloquea
load-academico50VU. Esto se aplica a los cinco perfiles, sin mínimos preventivos de
RAM para iniciar una prueba. Los mensajes de bloqueo incluyen ahora la causa crítica.

No se ejecutó ninguna carga en esta reorganización. Las validaciones realizadas
fueron unitarias, sintaxis e inspección estática con k6 inspect (sin VU ni HTTP).
