# Único recorrido pendiente — oferta T013 y cancelación T027

Solo APK Development y Web local actuales; recargar interfaces sin reiniciar Metro.
Usar las tres cuentas ficticias confirmadas de .artifacts/004-client/credenciales-locales.json.
No compartir contraseñas/tokens. AdministradorA ya está restaurado a Administrador activo.
No crear cuentas, barberías, servicios, profesionales ni nuevas reservas. No limpieza.

## Oferta/invitación existente (T013)

1. Web administradorA, A: Oferta→guardar configuración/servicio existente sin cambiar sus
   valores; pausar nuevas reservas y volver a publicar. En Personal, comprobar profesional
   activo y la invitación pendiente a administradorB. Intentar desactivar el profesional
   con citas comprometidas: debe rechazarlo; Reintentar consulta recupera la vista.
   Mis invitaciones propias de A puede estar vacío: estado válido, no fallo.
2. Inmediatamente Android administradorB: antes de aceptar, solo B autorizada. Personal→
   aceptar la invitación A ya existente. Actualizar barberías: A=Barbero, B=Administrador;
   A sin formularios administrativos habilitados, B conserva los suyos. Comprobar lo mismo
   al actualizar Web con administradorB. No emitir/repetir invitaciones ni activar otro perfil.
3. Android administradorA, A: guardar el servicio con sus mismos valores, pausar/publicar;
   comprobar recuperación del rechazo de desactivación y controles legibles. Si alguna
   pantalla falla, describir el paso; no cambiar permisos desde SQL.

## Cancelar únicamente dos citas sintéticas (T027)

4. Web cliente→Mis reservas: cancelar **solo**
   `24364b77-64f8-4b48-8a7d-c5a49a679512` (18/11/2026,10:15 Lima,S/25).
   Pulsar Cancelar cita y luego Confirmar cancelación. Esperado: estado cancelado e historial
   conservado; actualizar la agenda administradorA en otra ventana muestra el mismo estado.
5. Inmediatamente Android administradorA→Agenda A, fecha18/11/2026: cancelar **solo**
   `d22e270a-c562-4bb7-a03c-d6c0b8980a05` (11:30 Lima,S/25), indicando motivo ficticio
   «Prueba local Android». Sin motivo el botón confirmar debe estar desactivado. Confirmar:
   estado cancelado, actualizar Web refleja ese mismo código. No confirmar nuevas reservas
   para comprobar liberación: la carrera y ocupación ya están verificadas automáticamente.

Si no coincide exactamente el código, no cancelar. Las demás citas, incluidas las T019,
se conservan. Los datos manuales siguen en [manual-fixtures.json](manual-fixtures.json).
No repetir mediciones de200%, registros, correos ni baterías de login.
Confirmar oferta Web/Android y cancelación Web/Android: correcto o incidencia concreta,
sin credenciales. Conservar todos los datos después: la retirada requiere nueva confirmación.
