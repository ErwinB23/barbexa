# 012 — Notificaciones internas Web

Solicitud del usuario, 22/11/2026. Nuevo alcance posterior a B1–B5.

Cada cuenta consulta sus propios avisos persistentes, pendientes o leídos, incluso
si estaba desconectada al ocurrir el evento. El contador se consulta con sesión
auténtica. No se incluye correo, push, SMTP, recordatorios programados ni Android.

Eventos iniciales: invitación recibida/cancelada al destinatario; aceptación y
rechazo al emisor. Reserva confirmada/cancelada/reprogramada, inicio/final de
atención, inasistencia, pago recibido y reembolso registrado al cliente,
profesional asignado y administradores activos del establecimiento. Un usuario
que ocupa varios papeles recibe un solo aviso por evento. No incluye cambios
de configuración, servicios, publicación o membresías que no tengan contrato de
aviso definido. No anunciar «cualquier evento» como cobertura ilimitada.

Los avisos no conceden permisos. El servidor vuelve a comprobar la membresía
vigente para mostrar avisos de personal. Los avisos personales de reservas e
invitaciones permanecen en la cuenta correspondiente. Destinos de navegación
predefinidos; no HTML, secretos ni URLs arbitrarias recibidos del servidor.

Aceptación: generar solo tras una operación válida; rollback elimina también
el aviso, reintentos idempotentes no duplican; solo el destinatario puede leer
y marcar. No cambiar la lectura local hasta confirmación del servidor. Limpiar
la proyección al cerrar sesión/cambiar contexto e ignorar respuestas tardías.

La vista presenta los 50 últimos avisos y el contador total de no leídos.
Actualización cada 5 segundos con pestaña visible, al recuperar foco/visibilidad
y manual. El indicador de no leídos desaparece con cero y muestra99+ para
cantidades superiores. No suspender refresco por una activación previamente ausente.
No es entrega instantánea ni garantía de notificación del sistema operativo.
No hay backfill: las reservas/invitaciones anteriores a activar no generan
avisos nuevos. Su historial funcional original se conserva.

La activación SQL contó con ensayo independiente y autorización Cloud específica;
las comprobaciones de aislamiento/HTTP que faltan permanecen en tasks.md. No atribuir
al cierre manual Web pruebas técnicas no ejecutadas.


## Extensión — eliminar un aviso propio (24/11/2026)
El usuario solicita papelera dentro de cada tarjeta desplegada para eliminar solo
esa notificación. Confirmación en diálogo local; nunca borra la reserva/invitación o sus eventos.
La eliminación de bandeja persiste por cuenta en servidor mediante deleted_at, para
conservar la clave de deduplicación y no regenerar el mismo aviso. No borrado masivo.
Servidor vincula auth.uid y visibilidad vigente; destinatarios ajenos y sesión anónima
no pueden eliminar. Reintento idempotente. Lectura/lista/conteo excluyen eliminadas.
UI conserva el aviso hasta respuesta y lista confirmadas; fallo mantiene recuperación.
Capacidad canRemove debe venir de list_my_notifications; servidor previo no habilita
papelera. Ensayo SQL y activación Cloud autorizados explícitamente el24/11/2026:
migración20261124154602 aplicada con respaldo y verificación de conservación.
Papelera habilitada en sesión Web real sin reload; confirmación cancelada conservando
los avisos. Borrado real Web no ejecutado; SQL de eliminación validado con fixtures aislados.

## Interacción y aceptación vigentes — 24/11/2026

Bandeja, filtros, contador, lectura y eliminación individual forman parte del recorrido
manual Web aceptado por el usuario. No se infiere una nueva prueba automatizada ni
aislamiento HTTP entre dos cuentas por esa declaración. La eliminación solo afecta
el aviso propio: conserva la reserva o invitación. Su confirmación se presenta sobre
la misma tarjeta, con cancelar/cerrar y recuperación ante fallo, sin borrar localmente
un aviso cuya eliminación no confirmó el servidor.

«Abrir agenda» de un barbero o administrador que atiende dirige a Mi espacio
profesional → Mi agenda, no a la agenda general de la barbería. El texto no muestra
«hora de Lima»; el formato conserva la zona America/Lima. Esta entrega Web no acredita
la aceptación Android obligatoria de la Constitución.
