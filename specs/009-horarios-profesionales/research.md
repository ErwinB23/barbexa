# Decisiones — 009

RF22/HU14 exige gestionar disponibilidad propia sin permisos globales. Reusar intervalos
004 y zona America/Lima; rango [) permite citas e intervalos consecutivos. No duplicar
motor de reservas. Restricciones y protección transaccional pertenecen a PostgreSQL.
Los cierres generales RF33 siguen siendo administrativos. Identificador de bloqueo
generado con expo-crypto existente; nunca representa identidad o permiso.
Versión del settings sirve de control optimista; tras conflicto se recarga, sin reintento
automático que sobrescriba otro dispositivo. Una respuesta perdida no autoriza duplicar datos.
