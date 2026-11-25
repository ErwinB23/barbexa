# Validación — 008

Ahora: pruebas de código sin tocar servicios/datos. Activación false por defecto.
Después de autorización: crear migración CLI desde contracts/profile.sql, aplicar SOLO
LOCAL54422 y actualizar barbershop-operation LOCAL. Verificar ACL y pruebas reales de
propiedad, revocación y A/B con conjunto mínimo autorizado por separado. No reutilizar
permisos anteriores de otros bloques ni alterar las29 reservas.

Recorrido final Web/Android: contexto profesional propio → Personal → consultar perfil →
editar nombre autorizado → persistencia → cambiar tenant → sin permisos cruzados.
No solicitar recorrido físico hasta backend real aprobado.

## Activación autorizada15/11

Aplicada20261115171232_own_professional_profile.sql únicamente LOCAL54422. Tres funciones
nuevas; sin tablas/RLS/cambios de filas. CLI3.1.0 creó el archivo; aplicación psql en una
transacción y registro SOLO de esta versión en supabase_migrations. El historial local
omite tres migraciones previas ya aplicadas (agenda/cancelación/care); no db push ni repair,
para evitar repetirlas. Discrepancia conservada para tratamiento separado autorizado.

Verificación real de solo lectura: funciones presentes; anon/authenticated sin EXECUTE,
service_role solo wrappers y privada cerrada, search_path vacío. Lectura RPC200 de perfil
propio con actor de servidor; NO equivale a login JWT real del usuario. Edge activo con
bind mount de funciones y policy per_worker; código008 disponible sin reinicios, JWT y
compatibilidad de comandos anteriores comprobados con pruebas Deno. API pública:401 sin
sesión/inválida,204 OPTIONS con Origin localhost8081 exacto. Pruebas de escritura y HTTP
autenticado end-to-end aún pendientes, no se cierran T006/T007.

Huellas antes/después iguales para29 reservas, detalles, profiles, barber_profiles,
membresías, settings, ledger/eventos de atención. Ningún nombre profesional se cambió.
EXPO_PUBLIC_ENABLE_SELF_PROFESSIONAL no se cambió en el entorno real ni se reinició Metro.
La activación autorizada del backend no autoriza las pruebas de escritura por sí sola.
