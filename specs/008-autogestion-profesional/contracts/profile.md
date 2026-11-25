# Contrato — 008

Edge existente barbershop-operation, JWT obligatorio:
- get-own-professional: { action, barbershopId } → Professional.
- update-own-professional: { action, barbershopId, professionalName } → Professional.

No se aceptan parámetros de identidad, permisos o propietario. SQL obtiene actor desde
el puerto verificado Edge (getUser existente); servicio no es autorización de negocio.
RPC públicas get_own_booking_professional/update_own_booking_professional, argumentos
p_actor_id/p_data, solo service_role. Privada self_professional_command sin EXECUTE directo
para anon/authenticated/service_role. Ausencia/denegación no revela otro profesional.

SQL preparado en profile.sql, no aplicado. Reversión futura: revocar/dropear solo las
dos funciones públicas y luego la privada, sin CASCADE ni eliminación de datos.
