# Contrato reutilizado — RF05

Acción de aplicación `updateOwnProfile({ displayName, phone })`. Solo campos conocidos;
nombre recortado no vacío, teléfono recortado o null. Retorna void y publica el perfil
persistido en la sesión verificada. Sin identidad, rol o barbería en el payload.

Composición → caso de uso002 → adaptador HTTP002 → PATCH `/rest/v1/profiles` filtrado por
identidad verificada mediante Auth. Grants limitados a display_name/phone, RLS propia
USING/WITH CHECK de002. No se modifica SQL. Respuestas ajenas/tardías nunca se publican.

Error de red conserva formulario y sesión para reintento; denegación de identidad
definitiva invalida la sesión. Doble envío concurrente de la misma generación se agrupa.
