# Contratos — 011
Todos los comandos usan barbershop-operation, JWT verificado y Origin existente.
- invite-administrator: requestId, barbershopId, email confirmado existente.
- list-admin-invitations: barbershopId=null para propias; UUID para salientes de admin.
- respond-admin-invitation: invitationId, decision=accept/reject.
- cancel-admin-invitation y retry-admin-invitation-email: invitationId.
- own-professional-summary: barbershopId, localDate AAAA-MM-DD.
No aceptar userId, rol, destinatario UUID, URL de correo o estado calculado por cliente.
SMTP/Resend solo servidor. Enlaces /staff con UUID sin poder de autorización; no bearer
de invitación, JWT ni claves en URL/correo. Recepción Mailpit requiere permiso posterior.
Capacidades cliente/servidor desactivadas hasta activar el backend con autorización.

## Activación pendiente: alcance concreto, no ejecutado
- admin-invitations.sql: ampliar el CHECK de rol de staff_invitations sin reescribir
  barberos; añadir una tabla privada de metadatos RLS cerrada, cuatro auxiliares
  privadas, siete RPC solo service_role y un trigger de aceptación. Sustituir únicamente
  la envoltura respond_booking_invitation existente por despacho según rol; conserva
  private.booking_command para barberos e impide degradar un administrador al aceptar.
- professional-summary.sql: una auxiliar privada y una RPC solo service_role. Lectura
  propia por fecha Lima, sin DML ni métricas financieras. search_path vacío en ambas.
- Revisar y activar únicamente barbershop-operation LOCAL y los flags nuevos. Correo
  LOCAL requiere Mailpit, remitente/destinatarios ficticios example.invalid y origen Web
  aprobado. No cambiar el proveedor real ni configurar Resend sin permiso adicional.
- Alcance de permiso solicitado: migración nueva creada con la CLI a partir de ambos
  borradores y aplicada solo en app-barberia-002-local:54422; registrar únicamente esa
  versión, sin db push general ni repair. Comprobar ACL/search_path/RLS y lecturas/rechazos
  HTTP, con huellas idénticas de filas previas. No crear invitaciones ni enviar correo.
- Conexión prevista del código montado de barbershop-operation: habilitación explícita
  solo LOCAL, proveedor mailpit, from=no-reply@example.invalid y origen
  http://localhost:8081. Conservar flags de producto inactivos y comandos anteriores.
  No modificar variables del contenedor ni reiniciar servicios bajo ese permiso; si la
  activación no es viable mediante fuentes del worker existente, detenerse y pedir el
  permiso adicional preciso. La lectura de código no acredita que el worker esté activo.
- Antes de aplicar, volver a contrastar firmas/ACL/constraint y preparar reversión con
  la definición exacta de la envoltura original. Reversión posterior a datos nuevos
  exige revisión: no borrar metadatos ni retirar el rol si hay invitaciones de admin.
- La activación no autoriza crear invitaciones, enviar correo, editar membresías o
  crear el conjunto008–010. Esas escrituras necesitan un alcance autorizado separado.

Activación B ejecutada15/11: migración20261115230134,88 checks estructurales y16 HTTP/JWT
de lectura/rechazo correctos, todas las filas previas iguales. Composición LOCAL conecta
Mailpit sin cambios de variables/reinicio. En esa activación no se ejecutaron SMTP ni
escrituras de invitación; el escenario posterior se acredita abajo. Aceptación física pendiente.
Mailpit no acredita entrega externa: Gmail requiere proveedor real/remitente autorizado,
destinatario controlado, permiso de envío y comprobación de recepción independiente.

## Escenario mínimo — alcance histórico autorizado y ejecutado
Autorizado y ejecutado15/11:118 comprobaciones aprobadas,4 avisos reales Mailpit y2
carreras idempotentes observadas en PostgreSQL. Se conserva abajo el alcance histórico;
NO volver a preparar ni enviar avisos por rutina. Resultado en tasks.md. T008 física
sigue abierta y Gmail no está acreditado. No se conceden permisos nuevos por este registro.
Lectura15/11 confirma que adminA/adminB del conjunto nuevo008–010 están confirmados,
sin perfil profesional ni reservas directas; cada uno conserva su membresía original.
Cliente/profesional de las2 citas manuales son otras cuentas. Reutilizar solo esos2
administradores, sin tocar los administradores protegidos anteriores deT019/005.

Datos nuevos máximos:0 cuentas/perfiles,1 barberíaC privada de prueba,1 booking_settings
en draft,2 membresíasC (emisor y destinatario),5 invitaciones (4 administrator/1 barber)
y4 filas admin_invitation_mail.0 servicios/profesionales/horarios/bloqueos/reservas.
Las membresías originales y las37 citas con dependencias quedan idénticas. SoloC cambia.
Para autenticar las2 cuentas nuevas, autorizar una regeneración de contraseña por cuenta
mediante Auth oficial: credenciales/JWT exclusivamente en memoria, sin archivo ni correo
Auth. No cambiar contraseñas de otras cuentas ni las del cliente/profesional manual.

Secuencia con IDs nuevos registrados antes de operar:
1. AdminI1 pendiente sin permisos enC; verificar duración exacta604800 segundos. Capturar
   en Mailpit el único aviso. Simular7 días transcurridos desplazando exclusivamente
   created_at deI1 y expires_at de su metadata8 días atrás, manteniendo el intervalo7.
   No cambiar reloj ni funciones. Comprobar caducada/rechazo y ausencia de membresíaC.
2. AdminI2 renueva para el mismo destinatario; cancelar y repetir cancelación sin efectos
   adicionales. La renovación solo marca expirada/canceladaI1, nunca invitaciones antiguas.
3. AdminI3: dos creaciones concurrentes con el mismo requestId, una invitación y un aviso;
   requestId reutilizado con otro contenido debe rechazarse. Destinatario rechazaI3;
   repetir no concede membresía ni duplica avisos.
4. Nueva invitación de barbero enC por el flujo004; aceptar crea la segunda membresíaC
   como barber, sin perfil profesional automático. Conservar reglas/registros anteriores.
5. AdminI4: antes de aceptar, ser barber enC no concede administración. Probar emisorC
   temporalmente inactivo, rechazo con JWT vigente y restauración exacta de su filaC.
   Dos aceptaciones concurrentes del destinatario producen una sola membresíaC, elevada
   a administrator; wrapper antiguo y reintento conservan rol, sin degradarlo a barber.
   Actores ajenos/no administradores no emiten ni aceptan por otro usuario/tenant.

Máximo4 mensajes nuevos, únicamente SMTP/Mailpit LOCAL, destinatario example.invalid.
Verificar MIME, destinatario, enlaces sin tokens, vencimiento y conteo por invitationId;
reintentos no deben enviar otro mensaje. Sin Gmail ni proveedor externo. Conservar el
conjunto y mensajes, sin limpieza. Baselines antes/después de todas las filas protegidas.
Si falta un servicio, permiso o capacidad para mantener estos topes, detenerse; no iniciar
servicios ni modificar SQL/Edge/configuración adicional bajo este permiso de datos.
