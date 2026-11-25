# T001–T003 y revisión de impacto T005 — 14/11/2026

Solicitud actual autoriza revisar004 e iniciar exclusivamente T001–T007, con esquema
local aditivo/reversible. Checklist16/16, cuatro decisiones de negocio y privacidad global
coherentes; no contradicción bloqueante. No se considera autorizada otra funcionalidad,
datos persistentes, Cloud, instalación, build, commit/push o modificación de seguridad002.

Destino inspeccionado: app-barberia-002-local, API54421/PostgreSQL54422, volumen y red
propios comprobados por Docker. PostgreSQL17.11; btree_gist disponible, no instalada al
inicio. Supabase CLI3.1.0 y Deno2.9.8. Node/npm/dependencias existentes se reutilizan;
nueve avisos npm moderados siguen pendientes, sin auditoría/fix ni instalación nueva.
Dos cuentas/perfiles anteriores, cero barberías/membresías al inicio; no se eliminan.
Los12 contenedores del proyecto anterior se inventariaron en modo lectura.

Spec Kit check-prerequisites detectó004 mediante override de directorio solo de proceso,
sin cambiar el puntero003 persistido. La CLI no pudo escribir telemetría bajo sandbox;
se repitió consulta con permiso del sistema. Una regresión del runner también necesitó
permiso para su junction temporal; ambas causas son de herramientas, no fallos funcionales.

## Runner seguro T003

- `node --test tests/integration/booking/environment.test.mjs tests/integration/tenant-foundation/environment.test.mjs`:
  RED inicial por guardas ausentes; GREEN23/23. Se mantienen modos/permisos002.
- Modo `--booking-schema`, con BARBERIA_002_URL=http://127.0.0.1:54421 y
  BARBERIA_002_PROJECT_ID=app-barberia-002-local: inspección de contenedor/puerto/red/volumen,
  archivos SQL fijos, BEGIN/ROLLBACK obligatorios y sin COMMIT/conexiones externas.
- Modo `--booking-concurrency` queda preparado pero falla cerrado hasta existir su ejecutor
  T016. Barrera exige observar dos workers bloqueados; no se presenta un test de barrera
  con dobles como concurrencia PostgreSQL real. JWT de usuario no admite service_role;
  la comprobación criptográfica/HTTP posterior corresponde al servidor002 y T011/T016.
- Fixtures SQL nuevas y aleatorias solo dentro de transacción: máximo4 identidades,
  2 barberías y4 membresías. Sin correo/contraseña/API Auth, y ROLLBACK para toda la sesión;
  no DELETE de usuarios existentes. No cuentas persistentes autorizadas en este bloque.

## Impacto revisado antes de aplicar

Migración creada por CLI: `20261114195018_booking_catalog.sql`. Solo ocho tablas nuevas
de oferta/personal, sus constraints/índices/RLS/ACL y trigger privado de contención de
horarios. No ALTER de tablas/políticas históricas, backfill, reserva, RPC pública o pagos.
btree_gist se incorpora como extensión PostgreSQL disponible, sin paquetes externos.

La revisión detecta cero DROP/TRUNCATE/DELETE/DML sobre datos existentes. Lectura interna
solo de miembros activos, invitaciones propias/admin contextual; sin escrituras directas
anon/authenticated/service_role. Función de trigger privada con search_path vacío y
EXECUTE revocado; reutiliza helpers de autorización002 sin cambiarlos. Publicación
completa/aceptación de invitaciones y reservas requieren RPC/validaciones posteriores.

La exclusión definitiva **de reservas de la misma persona entre tenants** sigue diseñada
en004 y se implementará en T014–T016; no se confunde con las exclusiones de horarios
del catálogo que sí corresponden ahora. Políticas comerciales no aprobadas quedan sin
defaults en borrador; cancelación sí tiene120min como default aprobado.

Validación previa: toda la DDL ejecutada en una transacción terminada en ROLLBACK, código0.
CLI `db push --dry-run --skip-vault` confirmó destino local127.0.0.1:54422 y una sola
migración pendiente, sin seed/roles/Vault. Aplicación prevista con `db push --skip-vault`.
No --remote, --include-all, --include-seed, db reset, reparación ni actualización de secretos.

## Recuperación

Si DDL falla, su BEGIN/COMMIT revierte el incremento; no reintentar ignorando errores.
Después de commit, conservar historial y preferir corrección aditiva versionada. Una
retirada completa requeriría autorización, comprobar tablas nuevas vacías/dependencias
y generar migración inversa únicamente de objetos004; nunca reset/downgrade de002.
No se ejecuta esa retirada. Durante este bloque no hay nuevas escrituras de negocio.

Fuentes de diseño comprobadas: [RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security),
[rangos PostgreSQL17](https://www.postgresql.org/docs/17/rangetypes.html) y
[CLI3 local por defecto](https://supabase.com/changelog/supabase-cli-v3).
