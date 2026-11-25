# Modelo — 011
Reutilizar staff_invitations y barbershop_memberships; ampliar solo el CHECK de role para
permitir administrator en la migración futura. Metadata privada por invitation_id:
requestId/fingerprint, destinatario confirmado, expires_at, expiración y entrega/claim.
Mantener estados almacenados existentes; expired es proyección de las nuevas de admin.
Invitación pendiente no concede acceso. Aceptación actualiza membresía en misma transacción.
Resumen no crea tablas ni estados: consulta reservations+booking_care con perfil/membresía
activos derivados de008. Legado sin care se cuenta como sin estado de atención registrado.
