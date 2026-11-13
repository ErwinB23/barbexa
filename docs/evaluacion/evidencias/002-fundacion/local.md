# Entorno local 002 — T008–T011

## T008 completada: proyecto independiente

Fecha 2026-11-11. Git main/9938bb8; cambios anteriores conservados. Configuración generada
por Supabase CLI 3.1.0 en carpeta temporal nueva y solo config.toml incorporado tras comprobar
que no existía en App-Barberia. No se copiaron archivos ni datos del proyecto anterior.

Proyecto: **app-barberia-002-local**. Red supabase_network_app-barberia-002-local y volúmenes
supabase_db_app-barberia-002-local / supabase_edge_runtime_app-barberia-002-local propios.
La línea base [docker-anterior.json](docker-anterior.json) registra metadatos de 12 contenedores
antiguos, sus IDs, imágenes, mounts, redes y puertos, sin environment/secretos ni acceso a datos.
[docker-local.json](docker-local.json) comprueba igualdad de esos metadatos y ausencia de
volúmenes/redes compartidos; contiene imágenes, tags y digests reales del nuevo stack.

| Servicio/configuración | Puerto host |
| --- | --- |
| API/PostgREST/Auth vía Kong | 54421 |
| PostgreSQL | 54422 |
| Studio | 54423 |
| Mailpit local | 54424 |
| Shadow DB (reservado, no iniciado) | 54420 |
| Pooler (desactivado) | 54429 |
| Analytics (desactivado) | 54427 |
| Inspector Edge (configurado, no se probó sesión debug) | 8183 |

Puertos consultados antes de arrancar: 54420–54429/8183 sin listeners; los 54321–54324/54327
antiguos se conservaron. Ocho contenedores nuevos: db, kong, auth, rest, inbucket, pg_meta,
studio y edge_runtime. Servicios con healthcheck saludables, restantes running.
Realtime, Storage y analytics desactivados por no requerirse en esta etapa; no representan
integraciones de negocio completadas. La configuración no habilita exploración pública.

API expone solo public, auto_expose_new_tables=false; private excluido. Seed automático e
inicio anónimo desactivados; confirmación email habilitada. Las dos funciones futuras conservan
verify_jwt=true y **enabled=false** hasta que existan sus handlers en T017/T025. El primer
start (exit 1) rechazó archivos inexistentes; se corrigió mediante enabled=false documentado
oficialmente, sin crear handlers ficticios ni desactivar JWT. [Log inicial](t008-start-inicial.log).

Segundo start --workdir absoluto: exit 0; [log redactado](t008-start.log). El raw con posible
información privilegiada quedó en un temporal privado fuera del repositorio, no versionado.
CLI descargó imágenes necesarias del stack nuevo: PostgreSQL 17.11.0.018, Edge v1.78.1 y
Studio 2026.11.09-sha-1567384; no actualizó contenedores/imágenes referenciadas por los antiguos
ni dependencias npm. Registrar el parche real evita confundirlo con la imagen .011 preexistente.

Consulta exclusiva al nuevo contenedor: PostgreSQL **17.11**, cero tablas public y cero
auth.users antes de los tests; PostgREST efectivo PGRST_DB_SCHEMAS=public.
[t008-check.log](t008-check.log), exit 0. No hubo SQL ni conexiones en la base antigua.
Los metadatos no prueban un checksum lógico de sus datos: estos no se leyeron.

## T009 completada: RED del esquema

`supabase test db supabase/tests/schema.test.sql --workdir <raíz absoluta>` produjo
exit 1 en el stack vacío: 118 assertions, tres roles existentes aprobados y 115 expectativas
del modelo ausente fallidas. [schema-red.log](schema-red.log) conserva ese resultado;
no fue un error de conexión. Las fixtures son sintéticas y transaccionales, con rollback.

## T010 completada: migración mínima cerrada

CLI generó `20261112031854_foundation_model.sql` (timestamp UTC; fecha local 11/11).
Contiene solo profiles, barbershops y barbershop_memberships: PK/FK UUID, borrado restrictivo,
validación de nombres no vacíos, roles barber/administrator, estados active/inactive,
UNIQUE(user_id, barbershop_id) e índice (barbershop_id, user_id). No hay roles globales,
owner_id ni tablas de negocio adicionales. Nombres de barberías repetidos permitidos.

Una transacción habilita RLS y revoca permisos de tablas a PUBLIC, anon, authenticated y
service_role antes del commit; además revoca CREATE del esquema public para esos roles.
No crea políticas permisivas, RPC ni modifica el esquema administrado Auth.
La inmutabilidad de IDs frente a consumidores queda protegida por ausencia de escrituras;
su control al habilitar operaciones futuras deberá conservarse en esas tareas.

## T011 completada: aplicación y comprobación real

Comandos ejecutados por Codex contra el stack nuevo, con `--workdir` absoluto y sin
variables heredadas SUPABASE_* que puedan seleccionar otro destino:

| Comando CLI | Exit | Evidencia |
| --- | --- | --- |
| db reset --no-seed | 0 | [t011-reset.log](t011-reset.log) |
| migration list | 0 | [t011-migrations.log](t011-migrations.log) |
| db lint --fail-on warning | 0 | [t011-lint.log](t011-lint.log) |
| db advisors | 0 | [t011-advisors.log](t011-advisors.log) |
| test db supabase/tests/schema.test.sql | 0 | [schema-green.log](schema-green.log): 118/118 |

Antes de reset se verificaron ID del contenedor propio, volumen propio, configuración,
cero usuarios Auth y cero tablas public: era el entorno descartable creado en esta ejecución,
no una base preexistente. El reset recreó el contenedor DB. El guard de pruebas detectó
correctamente el cambio de ID y se detuvo antes de enviar SQL (NEW_DB_IDENTITY_MISMATCH).
Se cotejaron de nuevo imagen, volumen, red propios, tres tablas y ausencia de usuarios;
[docker-post-reset.json](docker-post-reset.json) conserva el ID inicial y el nuevo.
Solo entonces se ejecutó GREEN, sin eliminar el control de identidad ni reescribir la migración.

pgTAP acredita catálogo, tipos, PK/FK/CHECK/UNIQUE/índices, RLS habilitada, cero políticas,
ACL denegadas y restricciones con fixtures. Otros **36/36** intentos SQL reales
(tres roles × tres tablas × SELECT/INSERT/UPDATE/DELETE) retornaron exit 1 / SQLSTATE 42501
esperados; harness exit 0. [t011-denegacion.log](t011-denegacion.log) incluye cada sentencia.
Consulta final como propietario: cero filas en las tres tablas y cero auth.users, exit 0.
No se otorgaron permisos temporales para hacer estas comprobaciones.

Lint y advisors no reportaron hallazgos; esto **no equivale a auditoría de seguridad aprobada**.
La lista de migraciones apunta al stack local 127.0.0.1:54422: el campo CLI denominado
remote muestra allí la migración aplicada, no una conexión a Supabase remoto.
La igualdad de metadatos de los 12 contenedores anteriores se confirmó otra vez después
del reset; ningún volumen o red antiguos se reutilizó. No se consultaron sus datos.

## Límites y operación posterior

Para volver a levantar el stack, seguir el quickstart con project_id y workdir explícitos;
usar start, no reset. Las entradas Edge están deshabilitadas hasta implementar sus handlers.
No existen todavía casos de uso del servidor, API de perfiles/membresías/barberías,
matriz JWT/RLS de acceso permitido ni integración remota. No se ejecutaron T012–T040.
`npm run check` completo sigue pendiente del núcleo servidor real; no se repitieron las
179 pruebas anteriores ni el empaquetado Expo porque este bloque no cambió su código.
Riesgo npm previo: nueve moderadas, tres sin dev, sin remediar; sin auditoría npm nueva.

Fuentes oficiales consultadas para configuración y pruebas:
[CLI config](https://supabase.com/docs/guides/local-development/cli/config) y
[Database testing](https://supabase.com/docs/guides/local-development/testing/overview).
