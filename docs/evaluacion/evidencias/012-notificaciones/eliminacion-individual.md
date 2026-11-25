# Eliminación individual de notificaciones — 24/11/2026

Autorización explícita del usuario para ensayo desechable y activación Cloud revisada.
No autoriza nuevas operaciones por continuidad ni eliminación de avisos reales como prueba.

## Implementación

- Papelera accesible dentro de cada tarjeta desplegada, confirmación por ID y opción Conservar.
- Puerto/cola por cuenta, adaptador RPC y recibo positivo; lista/conteo se releen del servidor.
- SQL aditivo `deleted_at`: exclusión en lista, conteo y lectura; deduplicación conservada.
- Solo destinatario autenticado con visibilidad vigente; retry idempotente. No cambia reservas, invitaciones ni eventos.
- Archivos: `src/features/notifications/{application/inbox.ts,infrastructure/inbox-http.ts,presentation/inbox-context.tsx,presentation/inbox-screen.web.tsx,presentation/inbox-screen.web.styles.ts}`; contratos012 y migración20261124154602.

## Evidencia ejecutada

1. Cliente17/17: presentación, preview, lectura, adaptador, eliminación, errores, doble envío y cambio de cuenta. Tipos, lint, formato y arquitectura aprobados.
2. `scripts/notification-delete-rehearsal.mjs`: PostgreSQL17.11 desechable sin red, puertos ni volúmenes;23 migraciones previas y contrato. Delete propio, ajeno denegado, retry, lista/conteo, lectura eliminada denegada, otro destinatario intacto, fila/dedup retenida y anon sin grant. SQL rollback; contenedor retirado.
3. Informe: `.artifacts/barbexa-notification-delete-1795535191676/report.json`, status passed, removed true.
4. SHA256 contrato/migración: `c723b5772b638c5a14d002a18e74b801d90485fe00338c09de1ead6ecca8dd5a`.
5. `scripts/notification-delete-cloud.mjs prepare/apply/verify`: respaldo schema/data/roles/historial privado fuera del repositorio; migración `20261124154602_delete_own_notification.sql` aplicada, historial24. Comparación de27 tablas protegidas conserva datos existentes; solo cambios previstos de columna/índice/RPC/grants. `authenticated_delete=true`, `anon_delete=false`, `canRemove=true`, filtros activos.
6. Lectura Cloud posterior en transacción READ ONLY con identidad de destinatario: capacidad habilitada y respuesta lista/conteo válida. No confirma JWT/HTTP de eliminación real.
7. CUA en sesión auténtica existente: botón Actualizar notificaciones habilita papelera sin recargar página; clic papelera muestra confirmación y Conservar la cierra. Bandeja mantiene9 avisos y0 sin leer. No se ejecutó la confirmación destructiva.

## Límites

No se borraron notificaciones reales, ni se generaron eventos de negocio. Pendiente recorrido
Web de eliminación con aviso desechable autorizado y aislamiento entre dos sesiones auténticas.
El ensayo SQL usa claims controlados y roles PostgreSQL; no sustituye ese recorrido HTTP/Web.
Backups privados y datos de usuario no se copian a esta evidencia. Sin staging, commit ni push.

## Corrección de runtime tras actualización en desarrollo

El usuario detectó `app?.removeNotice is not a function` al confirmar. El controller
conservado en `RegistrationRuntimeProvider` mediante useState era anterior a la extensión;
Fast Refresh actualizaba la pantalla, pero mantenía la instancia sin ese método.

Cambio limitado: `src/composition/registration-runtime-provider.tsx` memoriza runtime
por fábrica de composición y returnFence, y pasa esa fábrica explícitamente al runtime.
El efecto libera el SDK y listeners anteriores antes de montar los nuevos. Renderizar
sin cambios conserva runtime y no crea clientes. No añade fallback de falso éxito.

Pruebas en `tests/integration/authentication/registration-runtime.test.mjs` y
`tests/presentation/inbox-screen.test.mjs`: reproducción legacy sin removeNotice,
actualización de composición, dispose y eliminación por controller real con gateway
doble; handler InboxScreen→Inbox→adapter con503 y reintento, solo ID confirmado y
otros avisos conservados. La regresión falló antes del cambio (dispose0 en vez de1).

- Dirigidas27/27: `.artifacts/notification-runtime-directed.log`.
- Cliente completo568/568: `.artifacts/notification-runtime-client.log`, ejecutado
  aparte porque el gate de cobertura detuvo `npm test` antes de ese bloque.
- Tipos, lint de archivos afectados, formato y arquitectura aprobados.
- `npm test`: assertions unitarias sin fallos, pero gate global de cobertura falla:
  líneas63.10% y funciones84.72% frente a100%; ramas93.52%. La cadena se detiene antes
  del bloque cliente. Log `.artifacts/notification-runtime-regression.log`.
- CUA posterior: página recuperada en sesión real,9 avisos conservados; sin reload
  manual, SQL nuevo ni confirmación de borrado real.

Esta corrección no acredita todavía eliminación real HTTP/Web con dos sesiones.
