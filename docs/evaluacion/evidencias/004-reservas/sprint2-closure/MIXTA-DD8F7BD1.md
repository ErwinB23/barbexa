# Carga mixta dd8f7bd1 — diagnóstico y reanudación puntual

26/11/2026, America/Lima. No se ejecutó k6 en esta intervención.

## Solicitud y causa identificadas

El26nov a las **11:45:53.781** Lima, Kong registró
`POST /functions/v1/reservation-command` → **HTTP500**,91bytes. A las11:45:53.779,
Edge Runtime emitió `WorkerAlreadyRetired: request cannot be handled because the
worker has already retired`, precedido por cinco avisos de duración de isolates.
Se trató de una **confirmación**, no de catálogo, disponibilidad ni reservas propias.
El error pertenece al despacho del runtime local, antes del handler de negocio.
No se identificó un defecto funcional del código de BARBEXA.

**Límite de trazabilidad:** el UUID de petición/VU exacto no quedó registrado para
ese500. El generador no guardaba eventos de fallo individuales en carga mixta;
Kong no guardó cuerpo ni UUID cliente y el handler no llegó a registrar esa petición.
No se inventa esa correlación. En futuras corridas se guardará un evento sanitizado
con operación, endpoint sin query, status, error_code, UUID sintético de confirmación,
VU e iteración, sin JWT, cabeceras ni cuerpo privado, en javascript-console.log.

Fuentes primarias de la familia de fallo:
[CLI#6675](https://github.com/supabase/cli/issues/6675),
[corrección oficial solo para peticiones sin cuerpo](https://github.com/supabase/cli/pull/6759).
El bootstrap real del laboratorio ya contiene la condición de reintento solo
para body=null; las confirmaciones llevan JSON. No se extendió ese reintento a
escrituras ni se clonaron/reintentaron sus cuerpos de manera insegura.

## Registros y recursos cotejados

Ventana16:45:45–16:46:00UTC: Kong254x200,37x201,10x499 y1x500. No hubo aviso
de worker_connections ni error de PostgREST/PostgreSQL en esa ventana. Los499
corresponden a conexiones cerradas durante el aborto, no se convierten en éxitos.
Runtime registra el retiro y seis respuestas201 posteriores al500. Logs crudos,
bootstrap y ledger privados conservados bajo `.artifacts/k6/diagnostics/dd8f7bd1/`.
No publicar ese directorio sin sanitizar.

97 muestras: CPUhost máximo23,93%, RAM máximo85,02%, libre mínimo2367,72MiB,
conexiones PostgreSQL máximo27/100 y cero esperas de locks. El supervisor **no pidió
parada REST**: requestedAt=null. El generador se abortó por su aserción estricta,
exit108. `COMPLEMENTARY_WRITES_OR_DURATION_NOT_VERIFIED` en result.json es el cotejo
posterior fallido de duración/conteo, no la causa original delHTTP500.

6.239 solicitudes, un error técnico (**0,016028%**),6.238 resultados aceptados,
1.235 confirmaciones aceptadas por el cliente; p95HTTP50,027ms. En el tramo estable,
p95 completos catálogo17ms, slots34ms y reservas29,65ms. Los checks6238/6239
fallaron el100% estricto porque el métrico histórico también incluye el error técnico.
No se reescriben métricas ni se acredita25VU: faltaron los600s estables completos.

## Reconciliación e idempotencia

- BD global1.349:4 reservas del cierre técnico,100 iniciales de la serie,4 del
  primer intento y **1.241 nuevas** del intento dd8f7bd1. Las1.245 creadas durante
  ambos intentos se conservan.
- Todas las1.241 coinciden con su actor, barbería, profesional, fecha/hora,15min y
  S/15 previstos, un item, un evento confirmed y una fila care con efectivo pendiente.
  No hay IDs ajenos al plan, solapamientos, requests duplicados, pagos duplicados,
  reservas parciales ni inconsistencias de tenant.
- **Seis** eventos se confirmaron entre11:45:53.811 y11:45:54.179, después del fallo
  del runtime y durante el aborto del generador. Explican1241−1235. Son transacciones
  reales que deben conservarse y excluirse del nuevo plan; **no se añaden** como
  éxitos al resumen anterior de k6 ni se inventan sus latencias.
- Se hizo un único replay acotado con su UUID original para una reserva de ese
  grupo: HTTP200, mismo ID y snapshot de cabecera/items/eventos/care idéntico.
  No creó otra reserva. Fue verificación funcional fuera de medición, no carga.

## Corrección aplicada con autorización expresa

Solo Edge Runtime aislado cambió de `per_worker` a **`oneshot`**. El contenedor
anterior permanece detenido con su filesystem, logs y configuración. El nuevo usa
el mismo digest de imagen v1.78.1, bootstrap idéntico, variables, binds y volúmenes;
los límites numéricos de CPU, memoria y wall clock no cambiaron. Los otros cinco
contenedores no se reiniciaron. Config.toml del laboratorio conserva la nueva policy
para arranques posteriores. [Comparación real](edge-oneshot.json).

`oneshot` usa un worker por petición y evita reutilizar un worker retirado.
[Configuración oficial](https://supabase.com/docs/guides/local-development/cli/config).
La documentación recomienda per_worker para carga y oneshot para desarrollo:
esta excepción local responde al fallo observado de retiro con cuerpo. Se declara
explícitamente ese entorno; el **coste real de crear workers se incluye** en la
latencia/recursos medidos. No es una prueba de rendimiento del pool productivo.
No se aumentaron tiempos, se desactivaron guardas ni se aceptaron respuestas falsas.

Verificación real: salud200; un envío de entrada inválida a la función devuelve400;
misma integridad y1.349 reservas antes/después. No se modificó producto, Cloud,
migraciones o GitHub Actions.

## Reanudación preparada

```powershell
npm run test:carga:mixta
```

Reintento `b238ad29-0f82-400f-985f-230e5c45d82c`. Baseline1.349. El plan cambia
los1.241 índices consumidos, contempla los cuatro turnos tail ya usados por el
primer reintento y conserva2.759 asignaciones no consumidas. No reutiliza turnos ni
UUID consumidos;50/100 conservan sus asignaciones. Un cotejo SQL del plan25 completo
con todas las reservas existentes produjo **cero conflictos**. Manifiesto/fixture y
autorización anteriores archivados, historia de ambos intentos conservada.
[Preparación ejecutada](retry2-preparation.json).

La capacidad de fixtures pasará de500 a **600 futuras por cliente únicamente en
esas dos barberías sintéticas**, al preparar manualmente el próximo nivel. Tras
acumular hasta68 por cliente, el máximo planeado de480 adicionales podría rebasar500;
600 permite conservarlas sin confundir agotamiento de cupos con rendimiento.
Es volumen/configuración de fixtures, no un umbral de aprobación ni un cambio de
funcionalidad o de política productiva. Los snapshots antiguos permanecen intactos.

Se repite25 completo y luego50/100:600s estables por nivel, calentamiento60s,
rampa60s, descenso60s, recuperación120s. Misma mezcla80/20 y pausa1s. Mantiene
p95 consultas≤3s, técnicos<1%, checks100%, integridad y guardas de recursos.
La excepción de EOF en lectura Stress **no se aplica**: este fallo fue una
confirmaciónHTTP500. El generador sigue abortando ante una confirmación inesperada;
el evento nuevo solo diferencia técnico/funcional/autorización, sin relajar métricas.

No ejecutar más campañas de lectura por rutina. Ningún tramo de esta serie mixta
se declara acreditado hasta completar su medición y cotejo. Los resultados anteriores
de lectura hasta1.000VU siguen intactos;2.000VU permanecen sin acreditar.

## Evidencia de cierre de esta corrección

[Pruebas acotadas sin k6](mixed-dd8f7bd1-tests.log),
[verificación final](mixed-dd8f7bd1-verification.json).
No se repitieron auditorías del producto ni el test auxiliar Windows ya documentado.
Sin commits/push; no se ejecutó k6. La validación de rendimiento posterior corresponde
a la ejecución manual del responsable, no a estas verificaciones de preparación.
