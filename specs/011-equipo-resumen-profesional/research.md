# Decisiones — 011
RF34/RF35 y HU22/HU23 exigen administradores e invitaciones;004 solo implementó barberos.
Usuario aprueba cuentas existentes confirmadas y caducidad7 días de las nuevas de admin.
La aceptación exige JWT/destinatario exacto, no posesión del enlace. Se revalida emisor.
SMTP no ofrece idempotencia transaccional: tras resultado incierto no reenviar a ciegas;
Resend admite clave idempotente. El estado de correo no cambia la membresía por sí solo.
RF20/HU13 exige resumen de actividad, sin definir ingresos/comisiones. Entregar resumen
diario de estados registrados y próximas citas propias del día, sin agregar otros tenants.
