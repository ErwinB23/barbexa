# Plan técnico — notificaciones activas

Código cliente: módulo notifications con puerto InboxGateway, almacén independiente
de React, adaptador HTTP con JWT actual y composición con la sesión existente.
InboxContext conecta el contador del layout Web y la ruta de notificaciones.
No cambios en login, OAuth, roles ni operaciones de reserva/pago/invitación.

Contrato inicial: contracts/notifications.sql; activado mediante migración oficial
20261122184214 y ampliado para eliminación por 20261124154602. Una tabla privada con RLS y sin grants de
acceso directo; dos RPC security definer con search_path vacío y auth.uid();
cuatro triggers sobre auditorías de reservas, atención, reprogramación y estado
de invitaciones. Clave única destinatario/origen; emisión transaccional.
No Edge ni secrets nuevos. RPCs de negocio y tablas previas no se reemplazan.

Riesgo: los triggers se ejecutan en la transacción de negocio; un error suyo
abortaría la operación. No activar sin verificar SQL real y regresiones de los
contratos existentes. Revisar rendimiento del contador y volumen de avisos.

## Secuencia histórica de activación (ejecutada; no repetir)

Los ensayos y activaciones constan en evidencias012; nuevas operaciones exigen
su propia autorización. El siguiente procedimiento conserva su trazabilidad:
1. Autorizar base desechable independiente, preparada con el esquema vigente.
2. Crear la migración oficial mediante CLI y trasladar el SQL revisado, manteniendo
   originales 1–18 intactos. No manipular historial para aparentar aplicación.
3. Probar anónimo denegado, cuentas A/B aisladas, lectura de destinatario,
   revocación de membresía y acceso profesional limitado a sus reservas.
4. Emitir eventos sintéticos, probar rollback, reintentos y unicidad; probar
   las operaciones previas con/sin los triggers y concurrencia.
5. Respaldo e inventario Cloud de solo lectura, autorización independiente
   para migración exacta y para cualquier prueba que escriba datos de negocio.
6. Confirmar historial, RPC/grants, cuatro triggers, conservación de datos y
   dos sesiones Web. Sin backfill ni correos. Probar contador y lectura persistida.

Recuperación: antes del COMMIT, rollback transaccional. Después, detenerse y
diagnosticar; no borrar historial ni notificaciones ni restaurar indiscriminadamente.
La desactivación de triggers requiere plan y autorización explícitos; no se propone
una migración inversa automática.

Estado 22/11/2026: código preparado; SQL compilado y probado en PostgreSQL17.11
independiente con18migraciones y datos sintéticos. Roles authenticated/anon reales
del ensayo, con funciones Auth mínimas y claims SQL de prueba; no GoTrue ni JWT
real. Fanout26avisos de eventos sintéticos, lectura/revocación/rollback y8sesiones
concurrentes aprobados. No equivale al flujo real de operaciones de negocio/Web.
Segundo ensayo ampliado: RPC públicos reales de creación/configuración/oferta,
invitación/aceptación, confirmación de reserva, replay, reprogramación, pago,
cancelación y reembolso aprobados con triggers. Dos barberías aisladas, incluso
ante intento de marcar un UUID real del otro tenant. Un fallo Yape tras insertar
la reserva revierte también el aviso. No HTTP/GoTrue ni Web real en este ensayo.
Cloud/LOCAL no modificados; falta autorización de activación y validación Web.
Ver evidencia docs/evaluacion/evidencias/012-notificaciones/ensayo-sql.md.


## Plan de eliminación individual
1. Extender InboxGateway con remove y resultado de capacidad, sin afectar gateways viejos.
2. Encolar por scope/id tras refrescos/lecturas, deduplicar clics y releer lista real.
3. Botón de papelera accesible solo dentro de tarjeta desplegada, confirmación modal local,
   busy/error y deshabilitado hasta canRemove; no simular eliminación local.
4. Contrato SQL aditivo separado: deleted_at, RPC propia e índices/lista/conteos.
5. Pruebas aisladas cliente/adapter/UI; ensayoSQL rollback en DB desechable tras autorización.
6. Tras ensayo aprobado, preparar migración y activar en Cloud con permiso específico;
   la aplicación recibe capacidad por refresco5s, sin reload del navegador.

Ejecutado24/11/2026 con autorización explícita: ensayo aislado aprobado y retirado,
respaldo privado completo, migración20261124154602 aplicada (historial24),27 tablas
protegidas conservadas y lectura Cloud posterior aprobada. CUA verificó capacidad
habilitada al actualizar lista, apertura/cancelación de confirmación;9 avisos conservados.
No se hizo borrado real Web. Evidencia: eliminacion-individual.md en evidencias012.

Corrección posterior24nov: Fast Refresh conservaba runtime en useState con métodos
antiguos. Memorizar por fábrica de composición y returnFence, pasando fábrica explícita
al runtime; cleanup del efecto libera cliente anterior antes del nuevo montaje.
Cubrir actualización de composición y handler montado de confirmación con dobles,
incluido fallo/reintento; no modificar servidor ni borrar avisos reales para reproducir.

## Navegación y cierre vigentes

La confirmación de eliminar usa un diálogo local centrado en la tarjeta, conserva
el contexto y ofrece cierre/cancelación. El runtime expone removeNotice desde la
composición vigente; se descartan respuestas de una cuenta anterior. Los destinos
de avisos profesionales llevan a /staff?view=professional&section=agenda.

La aceptación Web del24/11 supera el pendiente visual histórico. Los ensayos de dos
cuentas/HTTP no acreditados siguen separados en tasks.md; Android de producto no se
considera cubierto por esta pantalla Web.
