# EQ-05 — ejecución manual autónoma

**Resultado vigente:** la hora `8dd877ab-4d18-4213-928d-e9217e39f7da` ya terminó:
360 éxitos, cero fallos/sin datos, cobertura y disponibilidad observada del 100 %.
[Informe consolidado](INFORME.md). No repetirla; el comando detecta la ventana
completa y no inicia otra. Los pasos siguientes describen el procedimiento usado.

## Nueva presentación, sin medir otra vez

El monitor tiene panel dinámico en terminal interactiva: barra de sondeos, tiempo
actualizado cada segundo, disponibilidad observada, cobertura, conteos e historial
con símbolos (`+` éxito, `x` fallo, `?` sin datos, `.` pendiente). Los mensajes
siguen siendo legibles sin ANSI al redirigir la salida. La evaluación, tiempos,
umbral, red y guardas no cambiaron; solo la presentación, verificada frente al
AST del script archivado de la hora real.

Para ver únicamente una demostración de menos de un segundo, sin Auth/HTTP/SQL:

```powershell
node tests/availability/eq05-terminal-demo.mjs
```

Los datos se identifican como **SIMULADOS** y muestran fallos/sin datos ficticios
solo para comprobar el panel. No se escriben en los registros de evaluación.

## Procedimiento de la evaluación real ya realizada

Desde PowerShell de Visual Studio Code, situado en la raíz de App-Barberia:

```powershell
node tests/availability/eq05-manual.mjs
```

No se ha iniciado otra ventana desde Codex. El comando conserva el intento parcial
`0bcde763-0e44-41dd-ba75-798c943d0dd3` y prepara una **nueva ventana independiente**
de 60 minutos; no suma periodos separados para aparentar una hora continua.

El proceso pertenece a esa terminal. Puedes cerrar Codex; mantén abierta la terminal
de VS Code, Docker Engine y los seis servicios existentes del laboratorio. Mantén
el equipo encendido, conectado y sin suspensión. No se reinician contenedores.

## Preparación y progreso

El comando verifica el cierre y la auditoría del intento anterior, crea un directorio
y fixture sintético independiente y ejecuta el preflight real fuera de la medición.
Después inicia 360 sondeos, uno cada 10 segundos, y muestra tras cada sondeo:

```text
EQ-05 | sondeos=12/360 | exitosos=12 | fallidos=0 | sin datos=0 | tiempo=01:50/60:00
```

La ventana espera hasta los 60 minutos completos. Los límites siguen siendo 10 s
por petición, 30 s por flujo y 1 s de tolerancia de inicio, sin reintentos. Incluye
Auth real, catálogo, disponibilidad, reservas propias, confirmación, persistencia,
cancelación exclusiva y comprobación de cancelación. Los umbrales originales y
las guardas críticas/sostenidas de CPU, RAM y conexiones PostgreSQL se conservan.
No se exige un mínimo preventivo fijo de RAM para iniciar.

No ejecutes varias instancias. El lock impide duplicar monitores; una ventana
incompleta sin cierre requiere revisión, nunca se reanuda silenciosamente. Ctrl+C
solicita cierre controlado, registra los intervalos restantes sin datos y permite
reconciliar únicamente reservas propias; no lo uses salvo que quieras interrumpir.
Si cierras la terminal o apagas el equipo, no se garantiza ese cierre controlado.
Ante un lock residual, conserva todo y pide revisión; no borres el lock a ciegas.

## Resultados automáticos

Cada ejecución guarda sus archivos privados en `.artifacts/eq05/<run-id>/`.
El puntero `.artifacts/eq05/current.json` identifica el intento vigente. Se conservan
las carpetas anteriores, sus reservas canceladas e historiales; no se borran datos.

- `intervals.jsonl`: peticiones, tiempos, resultados y errores reales.
- `resources.jsonl` y `events.jsonl`: recursos, interrupciones y recuperación.
- `write-ledger.jsonl`: identificadores para reconciliación sin duplicación.
- `progress.json` y `window-summary.json`: progreso y contabilidad final.
- `post-window-audit.json`: conciliación SQL e integridad, después de la ventana.
- `manual-result.json`: resultado compacto y ubicación de evidencias.
- `integridad-sanitizada.json`: copia por intento de la comprobación de integridad.
- `monitor-source/` y `active-source-hashes.json`: scripts y hashes medidos.

El manifiesto contiene credenciales sintéticas y sesiones: **no compartirlo**.
Para la consolidación, proporciona el `run-id` o `manual-result.json`.
Los informes, CSV y gráficas académicas se consolidarán posteriormente en Codex,
sin repetir la medición. La cancelación es lógica; se preservan historiales.

El código de salida es 0 si la hora completa cumple ≥99,5 %, cobertura total y
auditoría; 2 si la ventana termina sin aprobar esas condiciones; 1 ante un bloqueo
de preparación/ejecución/auditoría. Una ventana completa ya terminada no se repite
al invocar de nuevo el comando. No hay repetición automática tras fallos.

La disponibilidad estimada se calcula sobre intervalos observados; se informa por
separado la cobertura y el límite inferior sobre el periodo programado. Los
intervalos sin datos no son éxitos. Una hora local no acredita el escenario mensual
original ni el servicio publicado; la adaptación requiere aceptación docente.

## Intento parcial conservado

Cierre solicitado por el responsable para pasar a ejecución manual:
19:55:51–20:17:04 UTC del 26/11/2026 (14:55:51–15:17:04 Lima),
1.273,566 s reales, 128 éxitos, 0 fallos y 232 intervalos sin datos.
Cobertura programada: 35,56 %. **No acredita una hora completa.**
Auditoría: 129 reservas propias canceladas (128 medidas + 1 preflight),
18.981 reservas previas preservadas, 19.110 globales y cero violaciones.
No hubo reinicio de servicios ni nueva medición durante esta preparación.
