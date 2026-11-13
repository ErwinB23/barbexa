# T038 — preparación remota, 13/11/2026

**Estado: pendiente.** Este documento prepara la ejecución; no acredita despliegue,
paridad ni seguridad remota. La sección final registra el historial y dry-run obtenidos
tras la autorización limitada del rol temporal. T039–T040 no ejecutadas.
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
