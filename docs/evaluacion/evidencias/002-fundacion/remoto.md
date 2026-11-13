# T038 — preparación remota, 13/11/2026

**Estado: T038 completada.** Las cinco migraciones SQL y las dos Edge Functions quedaron
publicadas con autorización expresa. Las secciones finales acreditan estructura,
versiones/JWT remotos, rechazos HTTP y los principales flujos funcionales con usuarios
y tenants sintéticos, posteriormente retirados. La edición propia pendiente también
quedó probada y sus fixtures retiradas. GraphQL no pertenece al contrato y su extensión
está deshabilitada. La diferencia de plataforma queda documentada, sin exigir otra API
para cerrar. Se conservan las fases anteriores como antecedentes. T039–T040 no ejecutadas.
Destino único: `app-barberia-arquitectura`, `vuoncrtkkkquvddunrxx`, organización
`zxqsrgokncxawohnfidv`, `sa-east-1`. El anterior `klebvayvsvibwjpkzrff` está excluido.

## Preparación inicial y límite de conexión — antecedente anterior a la autorización

Codex ejecutó el binario local fijado, equivalente a `npx.cmd --no-install supabase`:

| Comando | Resultado real |
| --- | --- |
| `--version` | Exit 0: 3.1.0 |
| `projects list --output-format json` | Exit 0; destino/nombre/organización/región exactos y ACTIVE_HEALTHY; [salida filtrada](t038-destino-verificado.json) |
| `config diff --help`, `migration list --help`, `db push --help`, `functions deploy --help` | Exit 0 cada uno; opciones contrastadas con la CLI instalada |
| `config diff --remote=vuoncrtkkkquvddunrxx --output-format json` | Exit 0; 12 diferencias, no significa paridad; [resultado filtrado](t038-config-diff.json) |
| `migration list --remote=vuoncrtkkkquvddunrxx` | **No ejecutado**, por el efecto de autenticación descrito abajo; sin código de salida |
| `db push --remote=vuoncrtkkkquvddunrxx --dry-run --skip-vault` | **No ejecutado**, por el mismo bloqueo; sin código de salida |

La ayuda de `config diff` declara comparación sin modificar configuración local/remota.
No se conservaron valores de campos sensibles: solo rutas de diferencias y valores de
schemas públicos. La salida bruta temporal se retiró. `target.kind=linked` es el nombre
interno del tipo de destino remoto, no prueba de `supabase link`: sigue sin existir
`supabase/.temp/project-ref`. Puede existir caché local ignorada de identidad.

**Bloqueo concreto:** el [código oficial v3.1.0 de migration list](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/commands/migration/list/SIDE_EFFECTS.md)
documenta que, sin contraseña de base de datos, la conexión solicita
`POST /v1/projects/{ref}/cli/login-role` con `read_only: false`. Se crea un rol temporal;
la ayuda también declara `database_write` para ese mecanismo. El
[handler db push v3.1.0](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/commands/db/push/push.handler.ts)
resuelve la conexión antes de procesar el dry-run. Sus
[efectos documentados](https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/commands/db/push/SIDE_EFFECTS.md)
confirman que dry-run no aplica migraciones, pero no elimina ese paso de conexión.
No se confunde este efecto con ejecutar SQL de negocio.

No hay contraseña proporcionada en el entorno del proceso; no se leyeron valores privados
ni se intentó obtenerlos. Para continuar se necesita una revisión/autorización específica
de la creación del rol temporal **solo en el destino nuevo**, o un mecanismo local de
credencial existente cuya conexión se verifique sin ese efecto. No pasar contraseñas
mediante argumentos, chat, logs o archivos versionados. La ayuda `--password string`
no acredita un prompt secreto automático: no se ofrece como procedimiento ya verificado.
No se ejecutaron ambos comandos para evitar infringir la restricción de cero escrituras.

## Migraciones locales revisadas

Orden exacto, hashes en [t038-preparacion.json](t038-preparacion.json):

| Orden | Archivo en `supabase/migrations/` | Efecto previsto |
| --- | --- | --- |
| 1 | `20261112031854_foundation_model.sql` | profiles, barbershops, barbershop_memberships; FK/CHECK/UNIQUE, índice, RLS y revocaciones iniciales |
| 2 | `20261113035717_profile_access_and_provisioning.sql` | Lectura/edición propia por columna; RPC de perfil reservada a service_role |
| 3 | `20261113045240_tenant_context_access.sql` | Helpers de membresía activa; lectura de negocio y renombrado por administrador contextual |
| 4 | `20261113050232_create_own_barbershop.sql` | RPC transaccional de barbería y primer administrador, reservada al servidor |
| 5 | `20261113053907_membership_listing_access.sql` | Listado contextual de membresías por administrador; sin gestión de personal |

**Pendientes remotas exactas: todavía desconocidas.** Estos son cinco archivos locales
preparados, no cinco migraciones demostradas como pendientes. No se ha leído el ledger
remoto ni detectado/descartado discrepancias. No asumir base vacía por el dashboard.
Si aparecen versiones remotas ausentes localmente, objetos preexistentes o un orden
incompatible, detenerse; no usar repair, pull, include-all ni repetir CREATE a ciegas.
Cada archivo tiene BEGIN/COMMIT; los cinco no forman una transacción conjunta.

## Revisión estática de permisos y exposición

- Las tres tablas habilitan RLS explícitamente y revocan acceso inicial incluso a
  service_role. Grants posteriores se limitan a columnas necesarias; perfiles propios,
  barberías para miembros activos, renombrado solo por administrador activo y listado
  contextual. No se conceden escrituras ordinarias sobre membresías ni rol global.
- Los helpers SECURITY DEFINER viven en `private`, usan `auth.uid()` y membresía persistida;
  tienen search_path vacío y referencias calificadas. `private` no debe exponerse por API.
- Aprovisionamiento: funciones privadas SECURITY DEFINER y wrappers públicos SECURITY
  INVOKER, search_path vacío, EXECUTE revocado a PUBLIC/anon/authenticated y concedido
  a service_role. El parámetro actor solo es confiable tras Auth en Edge, no por venir
  en el body; la comprobación de existencia SQL no sustituye esa autenticación.
- Ambos handlers verifican Bearer mediante `/auth/v1/user`; el adaptador pasa el actor
  verificado a RPC. El cliente no debe recibir la clave privilegiada. Revisar catálogo
  remoto efectivo, propietarios, herencia de roles, grants por columna, ACL de funciones
  y default privileges: una lectura del SQL no demuestra el estado real del servidor.
- Exposición automática OFF no reemplaza ACL/RLS. Las migraciones conceden el acceso
  necesario de forma explícita. No se despliegan fixtures, triggers de fallo ni seeds.

### Diferencias de configuración y graphql_public

Consulta autenticada: remoto `api.schemas=[public, graphql_public]`; local `[public]`.
Para reproducir la superficie pública prevista, **se propone retirar únicamente
graphql_public de Exposed schemas**, conservando public, Data API activa, exposición
automática OFF, search path public/extensions y Max rows 1000. Requiere aprobación;
no se modifica ahora ni se elimina el esquema/extensión GraphQL. Mantenerlo exigiría
una decisión explícita y pruebas adicionales de esa superficie.

La presencia de graphql_public no prueba una filtración: GraphQL usa permisos de roles,
columnas y RLS. Tras el ajuste habría que verificar tanto el endpoint GraphQL como
PostgREST; no asumir que cambiar una lista equivale a desinstalar o desactivar toda
la plataforma GraphQL. [Seguridad GraphQL oficial](https://supabase.com/docs/guides/graphql/security).

Las otras diferencias son Auth (redirects, site_url, email, MFA, SMS y requisitos de
contraseña), pooler y protocolo S3. Están enumeradas sin valores sensibles en el JSON.
**No ejecutar config push global**: trasladaría valores locales ajenos al cambio mínimo,
incluidos ajustes de Auth y capacidad. Exit 0 de diff indica consulta correcta, no
aceptación de esas diferencias. La activación API/exposición automática y versiones
de servicios mantienen también la atribución manual de [destino.md](destino.md).

## Secuencia propuesta, todavía sin ejecutar

1. Reconfirmar referencia exacta y acceso; resolver el efecto de conexión descrito.
   Sin link implícito, sin auto-confirmación `--yes` ni SUPABASE_YES.
2. **Lectura/previsualización condicionadas a lo anterior:** ejecutar migration list
   y db push dry-run con los comandos de la primera tabla; registrar ledger, plan y
   códigos sin secretos. Usar `--skip-vault`; no include-seed/include-roles/include-all.
3. Revisar ese resultado y obtener autorización concreta para: (a) cambiar solo la
   lista de schemas expuestos de public/graphql_public a public; (b) aplicar únicamente
   las migraciones realmente pendientes y sus hashes revisados; (c) desplegar solo
   las dos funciones siguientes. No constituye aprobación recibida.
4. **Migraciones SQL, propuesta condicionada:**

   ~~~powershell
   npx.cmd --no-install supabase db push --remote=vuoncrtkkkquvddunrxx --skip-vault
   ~~~

   Crea/aplica el ledger y los objetos SQL pendientes; confirmar la referencia mostrada
   antes de consentir. Detener ante diferencias con dry-run. No ejecutar aún.
5. **Despliegues Edge, comandos preparados, no ejecutados:**

   ~~~powershell
   npx.cmd --no-install supabase functions deploy ensure-profile --remote=vuoncrtkkkquvddunrxx --use-api
   npx.cmd --no-install supabase functions deploy create-barbershop --remote=vuoncrtkkkquvddunrxx --use-api
   ~~~

   Ambas entradas existen y su config tiene enabled=true/verify_jwt=true. No usar
   no-verify-jwt, prune ni desplegar todas las funciones por omisión de nombre. use-api
   evita requerir operaciones Docker. La ayuda instalada admite estas opciones.
   Verificar después verify_jwt efectivo y rechazo de JWT inválidos.
6. Comprobar disponibilidad segura en Edge de SUPABASE_URL, SUPABASE_ANON_KEY y credencial
   de servidor esperada por composición: BARBERIA_SERVICE_SECRET_KEY o fallback
   SUPABASE_SERVICE_ROLE_KEY. No se ha consultado su valor ni afirmado disponibilidad.
   Configurar un secreto adicional, si hiciera falta, requiere autorización separada,
   custodia local y comprobación de compatibilidad; nunca añadirlo a Expo/evidencias.
   BARBERIA_ALLOWED_ORIGINS vacío rechaza solicitudes con Origin: no inventar dominios
   ni habilitar comodines. Cualquier origen web futuro requiere decisión concreta.

## Validación posterior y recuperación

- Tras migraciones: leer ledger y comparar catálogo normalizado con las evidencias locales
  [reproducción](reproduccion.md) y [aislamiento](aislamiento.md): tres tablas, restricciones,
  índices, RLS, políticas, grants por columna, EXECUTE/propietarios/search_path, schemas
  expuestos y ausencia de privilegios de escritura ordinarios. Revisar funciones también
  con anon/authenticated/service_role según el diseño, no solo como owner.
- Tras Edge: versiones efectivas Auth/Edge/PostgreSQL, arranque y configuración; HTTP
  sin token/alterado denegado, perfil propio/ajeno, alta del primer administrador, acceso
  A/B con roles distintos, inactivo, rechazo de escalamiento y RPC directa privilegiada.
  Preparar **por separado** identidades sintéticas autorizadas y su retirada; es otra
  escritura que necesita aprobación. No dirigir el runner destructivo local a Cloud.
  Atomicidad/carreras locales son evidencia previa, no pruebas remotas nuevas; no instalar
  triggers de fallo ni fixtures como migraciones remotas para reproducirlas.
- Ante fallo: detener la secuencia, conservar diagnóstico saneado y volver a leer ledger
  y catálogo. Una migración fallida revierte su transacción; las anteriores pueden quedar
  aplicadas. No asegurar rollback total ni reintentar sin inspección. Corregir mediante
  migración nueva revisada/autorizada; sin reset, reparación de historial o DROP automático.
- Configuración: registrar la lista anterior de schemas para poder proponer su restitución
  si fuera necesaria, sin restaurar valores locales en bloque. Edge: registrar versión/ID
  previo si existe; ante un primer despliegue no prometer una versión anterior recuperable.
  Cualquier deshabilitación, sustitución o recuperación remota exige aprobación concreta.
- No se acreditó un backup remoto restaurable; no asumir PITR en Free. Si se detectan datos
  reales/objetos inesperados, revisar respaldo y permisos antes de autorizar migraciones.

## Costos, evidencias y límites

Plan Free/spend cap son evidencia manual T036, no garantía de costo futuro cero. Despliegue,
invocaciones, conexiones y tráfico consumen cuotas; no se autoriza cambio de plan, capacidad
ni opciones de pago. Nueve avisos moderados npm continúan sin remediación/aceptación formal.

Se reutilizan SQL 336/336, HTTP 440/440 y calidad local previas, sin repetirlas ni atribuirlas
a Cloud. Sin escrituras remotas ejecutadas, sin pruebas Android nuevas, sin cambios de
código, dependencias, Constitución, 001 o contenedores. Historial remoto/dry-run y paridad
siguen sin acreditar. T038 permanece [ ]. Revisión de conservación y diff:
[t038-preparacion.json](t038-preparacion.json). No hay commit ni push.

## Actualización — consultas con rol temporal expresamente autorizado, 13/11/2026

El usuario autorizó únicamente crear/utilizar el rol temporal requerido por CLI 3.1.0
para migration list y db push dry-run, **solo en vuoncrtkkkquvddunrxx**. Esto supera el
bloqueo de conexión anterior, no autoriza aplicar SQL, cambiar configuración, desplegar
Edge ni preparar datos remotos. Las secciones anteriores y t038-preparacion.json
conservan el estado histórico previo a esta autorización; rige esta actualización
para el resultado actual del historial y de la previsualización.

### Ejecuciones reales de Codex

El primer intento de version/help dentro del sandbox terminó con exit 1; se repitió
fuera del sandbox con autorización del ejecutor y terminó con exit 0. CLI **3.1.0**,
opciones remote/dry-run/skip-vault comprobadas en la ayuda instalada. No hubo instalación.
Nueva consulta autenticada projects list, exit 0, reconfirmó nombre, referencia, región
y ACTIVE_HEALTHY antes de conectar: [destino](t038-consultas-destino.json).

~~~powershell
npx.cmd --no-install supabase migration list --remote=vuoncrtkkkquvddunrxx --output-format json
npx.cmd --no-install supabase db push --dry-run --remote=vuoncrtkkkquvddunrxx --skip-vault --output-format json
~~~

Ambos ejecutados mediante el binario local equivalente, **exit 0**. Se retiraron
SUPABASE_YES y variables de contraseña del entorno hijo, sin mostrar sus valores;
sin --yes, sin argumentos de contraseña y con entrada estándar cerrada. No apareció
confirmación adicional. No se ejecutaron link, repair, reset, include-all, seeds,
config push, despliegues ni operaciones de contenedores.

### Historial y pendientes confirmados

[Migration list filtrado](t038-migration-list.json): cinco versiones locales, campo
remoto vacío para cada una, sin versiones registradas solo en remoto. Esto acredita
**historial vacío**, no ausencia de objetos o datos creados fuera de migraciones.

[Dry-run filtrado](t038-dry-run.json): dryRun=true, upToDate=false y referencia devuelta
igual al destino autorizado. Enumera exactamente los siguientes cinco archivos:

| Orden | Migración local | Registrada en remoto | Pendiente según dry-run |
| --- | --- | --- | --- |
| 1 | 20261112031854_foundation_model.sql | No | Sí |
| 2 | 20261113035717_profile_access_and_provisioning.sql | No | Sí |
| 3 | 20261113045240_tenant_context_access.sql | No | Sí |
| 4 | 20261113050232_create_own_barbershop.sql | No | Sí |
| 5 | 20261113053907_membership_listing_access.sql | No | Sí |

Cero seeds y cero roles personalizados en el plan; skip-vault evita sincronizar
secretos Vault. No se observó mensaje de aplicación de migraciones. No hay discrepancia
entre las versiones locales, el listado y el plan; hashes sin cambios respecto a la
revisión anterior. Dry-run no ejecuta los cuerpos SQL ni prueba ausencia de colisiones,
ACL/RLS, atomicidad o flujos HTTP en Cloud. Esas verificaciones siguen pendientes.

### Rol temporal y límites

Ambas consultas mostraron un mensaje de preparación del rol temporal. La documentación
oficial de la versión describe POST cli/login-role como mecanismo; esta ejecución no
capturó tráfico HTTP ni guardó nombres de roles, credenciales o cadenas de conexión.
No se prueba si se crearon dos roles distintos o si hubo reutilización. La conexión
del proceso terminó, pero **no se acreditó eliminación, caducidad ni estado posterior
del rol**. No se ejecutó limpieza o inspección SQL adicional por quedar fuera del permiso.
Los cero roles del dry-run se refieren a roles personalizados de roles.sql, no al rol
temporal de conexión autorizado. No se interpreta esa cifra como ausencia de dicho rol.

La única mutación remota permitida fue el mecanismo de rol temporal para estas dos
consultas. No se aplicó SQL de negocio ni se modificaron schemas expuestos; graphql_public
permanece sin cambios. Despliegues de ensure-profile y create-barbershop no ejecutados.
Persisten la propuesta de configuración mínima, la validación de catálogo/ACL/RLS y
la preparación separada de identidades sintéticas, todas sujetas a autorización concreta.
No se vuelven a solicitar credenciales ni se presume concedida autorización de despliegue.

T038 permanece [ ]. Nueve avisos moderados npm sin remediación o aceptación formal.
Cambios previos y log activo preservados. [Revisión actual de conservación, secretos y Git](t038-consultas-revision.json).

## Aplicación SQL autorizada y verificación estructural — 13/11/2026

El usuario autorizó aplicar exactamente los cinco archivos enumerados, en ese orden,
solo en vuoncrtkkkquvddunrxx. No se amplió el permiso a configuración, Edge, identidades
sintéticas o pruebas funcionales con escritura. Esta actualización sustituye únicamente
el estado anterior de migraciones pendientes; T038 continúa sin completarse.

### Checkpoint y revisión previa

Checkpoint local **42a695cc257f87711fec6a31a31d9c55ad69e1f3**:
`chore: guardar checkpoint T034-T038 antes de migraciones remotas`, 32 archivos.
Se revisaron los archivos candidatos, incluidos los nuevos, por contenido, pertenencia
al bloque y patrones de secretos. El contenido real del staging coincidió con lo revisado;
cached diff check exit 0. Sin hallazgos de credenciales/tokens/URLs firmadas; revisión
acotada, no auditoría absoluta de seguridad. Se excluyó t017-serve.log. Sin push.

CLI instalada/help comprobados: 3.1.0, exit 0. Consulta autenticada nueva confirmó
referencia/nombre/región/Healthy: [t038-sql-destino.json](t038-sql-destino.json).
Se revisaron de nuevo los cinco SQL y sus SHA-256; sin cambios desde la preparación.
Contienen creación del modelo, permisos, políticas y funciones del alcance; sin DROP,
TRUNCATE, borrados de datos, fixtures, reservas ni cambios de configuración de servicios.
Los INSERT de aprovisionamiento pertenecen a cuerpos de funciones, no se invocan al migrar.

Preflight remoto **read-only**, exit 0: PostgreSQL 17.11, transaction_read_only=on,
auth.users y roles requeridos presentes; sin tablas públicas, esquema/objetos private,
funciones en conflicto ni ledger existente. No se consultaron datos personales.
[Resultado](t038-sql-preflight.json) y [SQL de inspección reproducible](t038-preflight-catalogo.sql).

### Ejecución única

Todas las operaciones se dirigieron mediante --remote=vuoncrtkkkquvddunrxx, sin link.

| Operación | Resultado |
| --- | --- |
| migration list previo | Exit 0; cinco locales y ninguna versión remota registrada; [resultado](t038-sql-list-before.json) |
| db push --dry-run --skip-vault | Exit 0; exactamente los cinco archivos autorizados, cero seeds/roles personalizados; [resultado](t038-sql-dry-run.json) |
| db push real --skip-vault | **Una única invocación, exit 0**; exactamente esos cinco archivos; [resultado](t038-sql-application.json) |
| migration list posterior | Exit 0; las cinco versiones remotas coinciden con las locales, sin pendientes; [resultado](t038-sql-list-after.json) |
| db query --read-only posterior | Exit 0; catálogo y permisos efectivos; [resultado](t038-sql-catalogo.json) |

Comando real equivalente al binario local ejecutado:

~~~powershell
npx.cmd --no-install supabase db push --remote=vuoncrtkkkquvddunrxx --skip-vault --output-format json --yes
~~~

La confirmación --yes se limitó a esta invocación, después de verificar catálogo,
hashes, historial y plan exacto contra la autorización expresa; no se exportó
SUPABASE_YES. Sin include-all/roles/seed, repair, reset, config push o despliegues.
Se registró un guard local antes de la única aplicación para impedir reintentos
automáticos. No falló ninguna migración; no hubo recuperación ni segundo push real.
Cada archivo mantiene su propia transacción; no se atribuye una transacción global al lote.

### Alcance de la verificación posterior

[Consulta reproducible](t038-verificar-catalogo.sql), ejecutada originalmente desde su
copia idéntica en .artifacts. **83/83 comprobaciones estructurales** sobre el resultado
de catálogo: [detalle](t038-sql-estructura.json). No son pruebas funcionales con JWT.

- Tres tablas, RLS habilitada en todas, columnas/tipos/nulabilidad previstos, once
  restricciones y cinco índices. Propietario postgres; FORCE RLS no habilitado, conforme
  al SQL revisado y su frontera privilegiada, no se afirma que owner quede sujeto a RLS.
- Cinco políticas, exclusivamente authenticated, con propiedad del perfil, membresía
  activa para lectura del negocio y administración contextual para renombrar/listar.
  USING/WITH CHECK e identidades de los helpers coinciden con las expresiones previstas.
- Grants por columna: SELECT mínimo para authenticated; UPDATE solo display_name/phone
  del perfil y name del negocio. Sin INSERT/DELETE/UPDATE de membresías para usuarios
  ordinarios, ni grants generales de tabla a anon/authenticated/service_role.
- Siete funciones, cuerpos coincidentes con las migraciones locales. Las cuatro de
  private son SECURITY DEFINER y las tres públicas SECURITY INVOKER; propietario postgres,
  search_path vacío y sin EXECUTE para PUBLIC/anon. Aprovisionamiento solo service_role;
  helpers y listado solo authenticated. Sin CREATE de esquema para los tres roles API;
  private no tiene USAGE para anon. El actor de aprovisionamiento sigue exigiendo la
  entrada Auth verificada de Edge, cuyo despliegue no se hizo aquí.
- Cero filas en profiles/barbershops/barbershop_memberships. No se prepararon usuarios,
  perfiles o datos de negocio de prueba remotos.

No se verificaron HTTP/JWT, GraphQL/Data API efectivas, revocación contextual con sesiones,
rollback/concurrencia remotos ni versiones efectivas Edge/Auth. Se conserva la evidencia
local anterior con su alcance; no se traslada a Cloud. graphql_public permanece sin
modificar y ambos despliegues Edge siguen pendientes. No se operó ningún contenedor
ni el proyecto anterior. Tampoco se verificó la eliminación/caducidad de roles temporales.
Nueve avisos moderados npm continúan abiertos. T038 [ ]; T039–T040 sin ejecutar.

[Revisión de integridad, secretos y Git posterior](t038-sql-revision.json). El checkpoint
guarda el estado previo; las evidencias de esta aplicación quedan sin commit ni push.

## Dos Edge Functions publicadas — 13/11/2026

Autorización expresa limitada a ensure-profile y create-barbershop en
vuoncrtkkkquvddunrxx. Sin autorización para nuevos datos, SQL, RLS/ACL o configuración
Data API. Esta sección actualiza el estado anterior de Edge pendiente de despliegue.
Checkpoint existente 42a695c conservado; no se crea commit ni push adicional.

### Revisión de fuentes y controles previos

[Manifiesto y SHA-256](t038-edge-fuentes.json): 14 archivos revisados, entrypoints
existentes, imports relativos TypeScript y APIs nativas Deno/fetch, sin paquetes nuevos,
secretos ni URLs locales incrustadas detectados. Config local de ambas entradas:
enabled=true/verify_jwt=true. No se modificó código ni configuración para publicar.
El archivo Deno real es supabase/functions/deno.json; la consulta inicial a
supabase/deno.json no encontró archivo, sin crearlo ni cambiar esa ubicación.

[Verificación local nueva](t038-edge-local.log): check:server exit 0 (núcleo TypeScript,
checker servidor, Deno check de ambos entrypoints y lint); test:server exit 0, 17/17.
Son pruebas locales con dobles; no sesiones reales Cloud ni prueba de RLS remota.

Flujo inspeccionado: cada handler exige Bearer y consulta /auth/v1/user antes del caso
de uso/RPC. El adaptador exige UUID válido y is_anonymous=false; no usa user_metadata
ni un ID/rol enviado en body como identidad. Los parsers rechazan campos adicionales.
El perfil se aprovisiona para el actor verificado; crear una barbería propia no exige
membresía previa, conforme al requisito aprobado. La RPC crea el primer administrador;
no se introducen permisos para otros tenants. Consultas/ediciones contextuales existentes
siguen bajo PostgreSQL/RLS; estas dos funciones no implementan gestión de personal.

La credencial privilegiada solo se lee en composición de servidor:
BARBERIA_SERVICE_SECRET_KEY o fallback SUPABASE_SERVICE_ROLE_KEY; SUPABASE_URL y
SUPABASE_ANON_KEY configuran adaptadores. No se copiaron valores a Expo ni evidencias,
ni se ejecutó secrets set. Logs del handler limitados a requestId/status. Allowlist CORS
vacía por defecto rechaza Origin no autorizado; no se inventaron dominios o comodines.
Variables estándar y distinción Auth/gateway contrastadas con documentación oficial:
[entorno Edge](https://supabase.com/docs/guides/functions/secrets) y
[autenticación Edge](https://supabase.com/docs/guides/functions/auth).

### Ejecución individual y estado remoto

CLI/help 3.1.0 comprobados, exit 0. [Destino autenticado nuevo](t038-edge-destino.json):
app-barberia-arquitectura/vuoncrtkkkquvddunrxx, sa-east-1, ACTIVE_HEALTHY.
[Listado previo](t038-edge-list-before.json): ninguna función publicada.

~~~powershell
npx.cmd --no-install supabase functions deploy ensure-profile --remote=vuoncrtkkkquvddunrxx --use-api --output-format json --yes
npx.cmd --no-install supabase functions deploy create-barbershop --remote=vuoncrtkkkquvddunrxx --use-api --output-format json --yes
~~~

Una invocación por función, con confirmación limitada a ese comando autorizado;
SUPABASE_YES retirado del entorno hijo. Sin no-verify-jwt, prune o despliegue masivo.
use-api realizó el bundling sin operar Docker. Se verificó la primera función remota
antes de desplegar la segunda. Ninguna falló; no hubo reintentos ni cambios de seguridad.

| Función | Despliegue | Versión remota | Estado | verify_jwt remoto |
| --- | --- | --- | --- | --- |
| ensure-profile | [Exit 0](t038-edge-deploy-ensure-profile.json) | 1 | ACTIVE | true |
| create-barbershop | [Exit 0](t038-edge-deploy-create-barbershop.json) | 1 | ACTIVE | true |

[Listado intermedio](t038-edge-list-between.json) y [listado final CLI](t038-edge-list-after.json),
exit 0. IDs y versiones registradas; no se confunde versión de función con versión del
runtime Edge. Esta última no fue leída. Auth 2.197.0 sigue siendo evidencia manual T036;
PostgreSQL 17.11 fue leído en el bloque SQL anterior, sin nuevas consultas SQL este turno.

### Disponibilidad y rechazo de credenciales

[HTTP real](t038-edge-http.json): **10/10 respuestas 401**, cinco por función:
sin autenticación, Bearer inválido, apikey inválida sin usuario, clave pública sola y
JWT legacy anon como Bearer sin sesión de usuario. Se consultaron claves mediante CLI
sin --reveal y se seleccionó únicamente material público/anon en memoria. No se guardaron
valores, cabeceras ni cuerpos brutos de respuesta. Credenciales de servicio no utilizadas
en estas pruebas HTTP.

Sin credenciales y con credenciales inválidas, rechazo en gateway sin X-Request-Id del
handler. Con material público/anon, respuesta UNAUTHENTICATED y X-Request-Id presente:
la función arrancó y el control del handler rechazó la ausencia de usuario. Esto demuestra
que una clave pública no obtuvo permisos de usuario, aunque el gateway admitiera el
contexto anon. El éxito de publicación o verify_jwt=true por sí solos no lo demostraban.
No se observó error de configuración/arranque; no se ha probado con ello una RPC de negocio
autenticada ni la capacidad efectiva de la credencial de servicio contra PostgreSQL.

Todos los POST usaron {} como protección adicional: entrada inválida para ambos casos
de uso si fallara el control de identidad. No se enviaron datos de usuarios/barberías,
no se prepararon fixtures, y ninguna respuesta devolvió payload de negocio. No se repitió
un conteo SQL de filas porque este bloque prohíbe SQL remoto; el cero anterior conserva
su fecha y alcance, no es una medición nueva.

### Plan de pruebas funcionales, pendiente de autorización específica

Antes de crear datos: acordar un manifiesto privado de identidades sintéticas A/B/C,
UUID de recursos creados y prefijo único por ejecución; custodia local de credenciales,
sin usuarios reales. Revalidar destino exacto y un procedimiento de limpieza aprobado.
Operaciones futuras propuestas, **no ejecutadas ahora**:

1. Crear identidades Auth sintéticas controladas y sesiones; asegurar sus perfiles mediante
   ensure-profile y comprobar propiedad, idempotencia, inválidos y perfil requerido.
   La preparación Auth privilegiada y entrega local de credenciales requieren autorización.
2. Crear barberías A/B mediante create-barbershop y comprobar pareja atómica, actor y
   administrador inicial. Registrar cada UUID devuelto inmediatamente para limpieza.
3. Preparar solo membresías de prueba necesarias: usuario administrador en A/barbero en B,
   otro miembro, ajeno e inactivo. Esa escritura privilegiada controlada necesita permiso
   separado; no habilitar gestión de personal ni cambiar RLS/ACL o migraciones.
4. Con JWT reales, probar lectura/edición propia/ajena, renombrado y listados según rol,
   acceso cruzado A/B, revocación y RPC privilegiada directa denegada. Comparar con la
   matriz local, distinguiendo fixtures de sesiones externas reales. No redirigir el
   runner destructivo local a Cloud ni desplegar triggers de fallo de test.
5. Limpieza finalmente y también ante interrupción: retirar únicamente membresías de
   prueba por UUID, barberías creadas por la ejecución, perfiles y usuarios Auth sintéticos,
   en orden compatible con FK RESTRICT. Esa limpieza privilegiada necesita aprobación
   explícita de su mecanismo. Sin deletes por patrón amplio, reset o recursos ajenos;
   reconciliar manifiesto y conteos y registrar cualquier residuo.

Solo después se evaluará paridad funcional de T038. La diferencia public/graphql_public
sigue sin cambio; su decisión y validación de exposición permanecen pendientes. Sin SQL,
modificación RLS/ACL/Data API, secretos remotos, contenedores, proyecto anterior, T039–T040,
commit o push en este bloque. Nueve avisos npm moderados continúan abiertos. T038 [ ].
[Conservación, revisión de secretos y diff actuales](t038-edge-revision.json).

## Validación funcional remota y limpieza — 13/11/2026

Autorización adicional del usuario: hasta tres usuarios Auth/dos barberías y sus datos
necesarios, con retirada selectiva. [Procedimiento previo, escenarios y límites](t038-funcional.md).
Acceso Auth Admin acreditado desde proceso local confiable, credencial solo en memoria,
sin --reveal ni secretos persistidos. Línea base remota actual: cero usuarios/filas de
negocio, FK/triggers inspeccionados. Auth health v2.197.0; PostgreSQL 17.11.

Se crearon exactamente tres usuarios confirmados administrativamente con correos
example.invalid, tres perfiles, dos barberías y cuatro membresías de prueba. Sesiones
JWT reales separadas para negocio; solo preparación y limpieza usan privilegios de
operador. Sin nuevos endpoints, DDL, RLS/ACL o configuración.

Perfiles propios/idempotencia/suplantación, dos altas con primer administrador, error
PROFILE_REQUIRED sin parciales, aislamiento A/B en ambas direcciones, membresías
contextuales, roles distintos, autopromoción rechazada, inactivo/ajeno y revocación
con el mismo JWT obtuvieron los resultados esperados. [Registro inicial](t038-functional-results.json).
Ese proceso terminó exit 1 con 41/42 checks: una expectativa del operador exigía 403
para anon y recibió 401. La limpieza finally terminó correctamente. Se preserva el
registro; una repetición exclusivamente de lectura confirmó 401/42501, conforme al
contrato PostgREST para anon. [Diagnóstico separado](t038-functional-diagnostico.json).
No se afirma que la batería original se repitió o pasó 42/42; ningún cambio de producto
fue necesario. No se reutilizó el permiso para crear nuevos usuarios después de limpiar.

Limpieza: tres logout 204, eliminación exacta de cuatro membresías/dos barberías/tres
perfiles y tres usuarios Auth (HTTP 200). Cero registros de esos UUID en negocio/Auth,
identidades, sesiones y refresh tokens; conteos globales restaurados a cero. Manifiesto
privado/SQL temporal de IDs retirados tras comprobarlo. Logs de auditoría de plataforma
no purgados y validez inmediata de access JWT no garantizada por esa eliminación.

T038 sigue pendiente: GraphQL con contextos A/B no se ejecutó por la interrupción del
operador; la lectura anónima posterior devolvió errores, sin probar aislamiento.
public/graphql_public sigue distinto de public local y requiere decisión/validación
sin cambios de configuración en este turno. Edición propia de perfil y casos remotos
de rollback/concurrencia tampoco se acreditan por estos resultados. Sin T039–T040,
proyecto anterior, contenedores, cambios de esquema/dependencias, commit ni push.
Nueve avisos moderados npm abiertos. [Conservación final](t038-functional-revision.json).

## Revisión del alcance de paridad — 13/11/2026

[Conclusión y prueba mínima preparada](t038-paridad-minima.md). Se contrastaron T038,
spec/plan/contratos/validation y las pruebas existentes. GraphQL no es contrato ni
consumidor de 002. Su prueba A/B se había convertido indebidamente en una condición
adicional: se corrige esa interpretación, sin alterar requisitos ni resultados históricos.

[Inspección autenticada read-only](t038-paridad-inspeccion.json), query/config diff exit 0:
**pg_graphql no instalado**, versión disponible 1.6.3 con installed_version null.
graphql_public.graphql es un wrapper de plataforma SECURITY INVOKER que solo devuelve
el error de extensión deshabilitada. No hay relaciones GraphQL ni resolver activo
en los objetos inspeccionados. Dos consultas HTTP retornaron 200 con pg_graphql extension
is not enabled., sin data. La lista public/graphql_public difiere de public local, pero
no representa actualmente una API GraphQL de negocio. Mantenerla documentada no impide
validar 002; retirarla es opcional y no se necesita deshabilitar una extensión ausente.
No se cambió ninguna opción. Una futura activación exige otra revisión de capacidad.

Pendiente real: FR-006/SC-002 y el contrato UpdateOwnProfile, PATCH PostgREST con JWT
propio, proyección mínima y return=representation. Hay permisos de UPDATE solo en
display_name/phone y USING/WITH CHECK de propiedad, inspeccionados ahora. Falta probar
el éxito remoto: nombre nuevo conservando teléfono omitido y phone=null conservando
nombre, con lecturas de persistencia. No se repite el aislamiento ya aprobado.

La matriz aprobada ya distingue 401 anónimo/403 autenticado; el operador temporal también
está corregido. Se conserva el 41/42 inicial y el diagnóstico 401/42501; no se altera
código o pruebas aprobadas para hacerlos pasar. La preparación mínima requiere una nueva
autorización: **un usuario Auth y un perfil, cero barberías/membresías**, dos PATCH y
limpieza finally exacta. Solicitada por separado, sin usar el cupo anterior ni ejecutarla.

T038 sigue [ ] hasta ejecutar y evaluar esa prueba. No se añaden como nuevos bloqueos
carreras remotas, GraphQL A/B ni una medición de runtime no disponible; las limitaciones
conocidas se informan con su alcance. Sin fixtures nuevas/configuración/SQL de escritura,
despliegues, políticas, contenedores, T039–T040, commit o push. Nueve avisos npm abiertos.
[Conservación y diff actuales](t038-paridad-revision.json).

## Cierre de T038 — edición propia y paridad contractual, 13/11/2026

[Cotejo literal, resultados y límites](t038-cierre-paridad.md). El usuario autorizó un
usuario/un perfil para el hueco de FR-006. El primer intento creó un usuario y falló
por un callback mal cableado del operador antes de crear el perfil; se limpió todo y
se reprodujo/corrigió localmente el problema sin tocar la aplicación. No se oculta
[ese registro](t038-profile-minimal-results.json). Hubo una autorización expresa nueva
para un segundo intento, sin reutilizar el cupo anterior.

[Segundo intento](t038-profile-minimal-retry-results.json): **exit 0, 7/7 checks**, mediante
createTenantFoundation/UpdateOwnProfile reales. Dos PATCH HTTP 200: nombre normalizado
con teléfono omitido conservado, después phone=null conservando nombre/identidad;
ambos GET posteriores confirman persistencia. Sin repetir aislamiento o crear tenants.
Limpiezas de ambos intentos acreditadas, cero fixtures activas; en total dos usuarios
por autorizaciones separadas, un perfil, cero barberías/membresías nuevas.

Todos los criterios literales de T038 quedan cotejados con evidencia: SQL/historial,
dos Edge JWT activado, catálogo/ACL/RLS, flujos autorizados/denegados, versiones/diferencias,
preparación separada y limpieza. **T038 [x]**; T039–T040 siguen [ ] sin ejecutar. No se
exige GraphQL A/B porque no es contrato y pg_graphql está ausente; no se cambia configuración.
Se conservan el 41/42 histórico por expectativa 401/403, el primer intento fallido, la
versión de runtime Edge no observada y las pruebas de concurrencia locales con su alcance.
Nueve avisos npm moderados siguen abiertos, sin auditoría de dependencias aprobada.
Sin commit/push, cambios de código o esquema, contenedores o proyecto anterior.
[Verificación final](t038-profile-paridad-revision.json).
