# T036 — destino remoto autorizado, aceptación documental

Fecha: 13/11/2026. Ejecutor documental: Codex. Estado: **completada** con evidencia manual del usuario añadida el 13/11/2026.
Rama `main`, HEAD `477b360`. T035 está marcada y habilita T036. Esta tarea prepara y
registra la aprobación; no exige `supabase link` ni autoriza despliegues. T037–T040 no ejecutadas.

## Identidad y decisión recibidas del responsable

| Dato | Valor | Origen / límite |
| --- | --- | --- |
| Referencia pública autorizada | `vuoncrtkkkquvddunrxx` | Proporcionada explícitamente por el usuario y presente en la URL oficial aportada; no inferida del nombre |
| Dashboard | https://supabase.com/dashboard/project/vuoncrtkkkquvddunrxx | URL aportada por el usuario; sin acceso autenticado comprobado por Codex |
| Nombre | `app-barberia-arquitectura` | Declaración del usuario, sin contraste autenticado |
| Organización | `barberia-app` | Declaración del usuario; el nombre de organización no identifica por sí solo al proyecto anterior |
| Región seleccionada | South America (São Paulo) | Declaración del usuario |
| Código de región correspondiente | `sa-east-1` | Correspondencia confirmada en documentación oficial; no acredita la región efectiva del proyecto |
| Estado mostrado | `Healthy` | Observación del dashboard declarada por el usuario; no medición actual de Codex |
| Creación | Proyecto nuevo ya creado manualmente | Declaración del usuario; no se crea otro ni se ejecuta T037 |
| Aprobación | Usar exclusivamente este destino nuevo para App Barbería | Autorización explícita recibida; no se solicita otra vez |

La referencia anterior es el único destino remoto autorizado de esta funcionalidad. El
proyecto antiguo llamado `barberia-app` sigue siendo solo lectura; no se le dirige ninguna
operación. El usuario confirmó manualmente en el dashboard la correspondencia entre
referencia, nombre, organización, región y estado. Codex no realizó esa inspección autenticada.

## Comprobaciones y fuentes

- Git: `main/477b360`, cambios locales autorizados T034–T035 conservados. Log activo
  `docs/evaluacion/evidencias/002-fundacion/t017-serve.log` preservado, sin editar ni detener.
- Revisión literal de T036: exige organización/nombre/región, responsable/costo,
  disponibilidad de PostgreSQL 17, artefactos/configuración comprobados y aprobación.
  La aprobación y los campos obligatorios quedan registrados con las nuevas evidencias
  manuales del usuario; Healthy no sustituye una prueba RLS o de paridad remota.
- Consulta web de la URL exacta: el proveedor de búsqueda no pudo acceder a la página.
  No se obtuvo respuesta autenticada ni un código HTTP verificable del proyecto.
- Antecedente del intento previo T036: `supabase projects list --output-format json`
  terminó en exit 1, `AccessTokenRequiredError`; no había sesión/token disponible en CLI.
  Es evidencia reutilizada, no una consulta repetida en este turno. El navegador también
  quedó bloqueado por la herramienta de uso del equipo en ese intento; no se vuelve a
  intentar eludir el bloqueo ni se presupone acceso por la URL ahora recibida.
- [Regiones oficiales](https://supabase.com/docs/guides/platform/regions): São Paulo =
  `sa-east-1`. Solo acredita el significado del código de región.
- [Seguridad Data API](https://supabase.com/docs/guides/api/securing-your-api): los grants
  controlan acceso a objetos y RLS controla filas. La exposición automática/default grants
  varía según proyecto; no se infiere a partir de su fecha, nombre o disponibilidad.

## Evidencia manual adicional del usuario — 13/11/2026

Todas las observaciones de esta sección fueron realizadas por el usuario en el dashboard
oficial del proyecto nuevo; no por Codex ni mediante una sesión CLI autenticada.

| Punto | Evidencia proporcionada | Evaluación para T036 |
| --- | --- | --- |
| Identidad | app-barberia-arquitectura / vuoncrtkkkquvddunrxx / organización barberia-app | Destino concreto y aprobado |
| Región y estado | South America (São Paulo), sa-east-1; Healthy | Confirmación manual declarada, no monitorización continua |
| PostgreSQL | 17.11.0.019, indicador LATEST en Service Versions | Major 17 compatible con el plan; LATEST es lo mostrado al observar, no una promesa futura |
| Otros servicios | Auth 2.197.0; PostgREST 14.18 | Versiones declaradas, integración remota aún sin probar |
| Enable Data API | Activada | Compatible con las lecturas/RPC previstas |
| Automatically expose new tables | Desactivada | No presumir grants implícitos; migraciones deben dar permisos mínimos explícitos |
| Schemas expuestos | public y graphql_public | private no figura entre los expuestos; graphql_public es una diferencia respecto a public solo del entorno local |
| Tablas/funciones expuestas | Ninguna disponible todavía | No acredita permisos futuros ni existencia de tablas de negocio |
| Extra search path / Max rows | public, extensions / 1000 | Registrar para comparación posterior; no demuestra paridad funcional |
| Automatic RLS | Desactivado durante creación | No bloquea preparación: las migraciones habilitan RLS explícita en cada tabla propia |
| Responsable/aprobador | Usuario responsable del proyecto que aprobó y creó manualmente este destino | Responsable de la decisión y coordinación identificado por su rol en esta conversación; no se infiere un rol IAM Owner ni se exige un nombre personal |
| Organización de facturación | barberia-app | Declarada por el usuario, sin inspección de Codex |
| Plan y condiciones observadas | Free; spend cap enabled; dos facturas de $0.00, sin métodos de pago; créditos $0.00 | Evidencia manual del costo/condiciones actuales; no garantiza gasto futuro cero ni aceptación de ampliaciones pagadas |

No se solicita repetir autorización ni aportar credenciales. Se aceptan estas comprobaciones
manuales como evidencia para la tarea APROBACIÓN/MANUAL, distinguiéndolas de controles
locales y sin afirmar acceso remoto directo de Codex.

### Pendientes de despliegue y validación, no de aprobación del destino

RLS/ACL de las tablas de negocio remotas **no están aprobadas**. Cuando corresponda aplicar
migraciones, deberán comprobarse RLS por tabla, grants mínimos por columna, propietarios,
search_path y EXECUTE de las RPC/helpers con pruebas reales. No existe un indicador global
que sustituya esas comprobaciones. La exposición automática desactivada tampoco las sustituye.

La exposición de graphql_public se registra como diferencia de configuración para revisar
antes del despliegue autorizado, sin eliminarla ni cambiarla en T036. No se afirma que
el proyecto tenga solo public expuesto, que GraphQL esté probado ni que los defaults remotos
coincidan con el catálogo local. No se cambia la arquitectura ni se extiende el alcance.

## Artefactos ya verificados, evidencia local reutilizada

- Cinco migraciones versionadas en `supabase/migrations/`, modelos propios y operaciones
  atómicas; [aislamiento](aislamiento.md) y [catálogo local](t033-catalogo.json).
- [Calidad T033](calidad.md): SQL 336/336, HTTP 440/440 y control general exit 0, con límites
  de cobertura y seguridad explícitos. No se repiten estas pruebas documentales en T036.
- [T035](reproduccion.md): reproducción local ya ejecutada y enmienda autorizada SC-006;
  [catálogo de la copia](t035-catalogo.json) y hashes de package/lock conservados.
- Configuración local: Auth, verificación JWT y exposición de public; no es una lectura
  del proyecto Cloud. La paridad remota no se declara antes de su comprobación autorizada.

## Cierre y límites

T036 queda `[x]`: organización/nombre/región, responsable/costo, disponibilidad efectiva
de PostgreSQL 17 declarada desde Service Versions, artefactos/configuración locales y
aprobación expresa documentados. No queda evidencia obligatoria pendiente para esta tarea
manual. Las comprobaciones técnicas remotas de integración y RLS/ACL siguen futuras.
T037 queda habilitada, pero no ejecutada ni marcada: deberá reconocer la creación manual
y evitar duplicar el proyecto. T036 no ejecuta link, SQL remoto, migraciones, db push/reset,
cambios de Data API/RLS, autenticación nueva ni operaciones sobre contenedores.

Sin credenciales solicitadas o almacenadas, cambios de código/dependencias, commit o push.
Persisten nueve avisos moderados npm, pendientes de remediación o aceptación formal.
El cotejo final de diff y conservación se registra en [t036-revision.json](t036-revision.json).

## T037 — registro inicial de acceso pendiente, superado el 13/11/2026

**Estado inicial histórico: pendiente; superado por el cierre documentado abajo.** T036 está completada. T037 exige crear
solo el proyecto aprobado y registrar referencia/configuración, major/parche y accesos
operativos. La creación ya fue realizada manualmente por el usuario: no se duplica.
La aprobación de ese destino no autoriza desplegar ni modificar su base.

Destino exclusivo: **vuoncrtkkkquvddunrxx**, app-barberia-arquitectura, organización
barberia-app, sa-east-1. Identidad/Healthy/versiones y plan Free se reutilizan de la
comprobación manual del usuario registrada arriba. No se presentan como observaciones
remotas nuevas de Codex.

### Autenticación y punto de parada

Ayuda oficial de CLI 3.1.0: login --help y projects list --help, ambas exit 0, consultas
sin autenticación nueva ni escritura remota. La ayuda identifica projects_read como permiso
de lectura del listado. Consulta real **projects list --output-format json**: exit 1,
AccessTokenRequiredError. [Resultado saneado](t037-autenticacion.json). No se guardó salida
cruda con credenciales ni metadatos de otros proyectos.

La CLI actual no acredita acceso operativo al destino. Por la instrucción del usuario,
se detiene la secuencia en este punto. No se intenta navegador, Management API con tokens
extraídos, SQL ni vínculo como sustituto de la autenticación.

Intervención manual desde PowerShell en App-Barberia:

~~~powershell
npx.cmd --no-install supabase login
~~~

Completar el flujo oficial personalmente y mantener códigos/credenciales en el equipo,
fuera del chat, Git y logs. No usar --token con un valor literal en un comando que quede
en el historial. La ayuda consultada ofrece login automático/navegador; no se ejecutó.
El flujo interactivo puede custodiar una sesión de usuario de alcance amplio: no se crea
ni amplía acceso por Codex. Si se opta por una credencial acotada, revisar previamente sus
permisos y configuración local privada; no solicitarla ni pegarla en esta documentación.
Después bastará confirmar que se completó el login; el siguiente control será solo lectura,
filtrando por la referencia exacta y cotejando nombre/organización/región aprobados. No
usar el nombre de organización para seleccionar el antiguo proyecto homónimo.

### Revisión local de migraciones, sin aplicarlas

| Orden | Archivo | Controles/efectos revisados |
| --- | --- | --- |
| 1 | 20261112031854_foundation_model.sql | Tres tablas, PK/FK/CHECK/UNIQUE e índice contextual; RLS habilitada y grants revocados en transacción; CREATE public revocado a roles ordinarios/servicio |
| 2 | 20261113035717_profile_access_and_provisioning.sql | Perfil propio, grants por columna, wrapper invoker y función privada definer; EXECUTE solo servicio, search_path vacío, actor existente/no anónimo |
| 3 | 20261113045240_tenant_context_access.sql | Helpers definer privados con auth.uid() y membresía vigente, consulta por miembro/renombre por admin contextual, sin escrituras de membresías |
| 4 | 20261113050232_create_own_barbershop.sql | Alta transaccional barbería+primer admin, actor/perfil comprobados, rol/estado fijos, wrapper invoker restringido a servicio |
| 5 | 20261113053907_membership_listing_access.sql | Lectura propia o admin activo contextual; listado invoker autenticado con comprobación actual y cinco columnas, sin perfiles ajenos |

Cinco archivos **preparados para cotejo**, no cinco migraciones confirmadas pendientes en
remoto: todavía no se leyó el historial remoto. Se conservan nombres/orden y SHA-256 en
[t037-revision.json](t037-revision.json). Ningún archivo se modifica. BEGIN/COMMIT delimita
cada migración; no existe una transacción única que cubra todos los archivos y despliegues.
No hay fixtures, seeds de usuarios, datos antiguos o triggers de fallo que deban desplegarse.
Se reutiliza la evidencia local de SQL 336/336, HTTP 440/440, calidad exit 0 y revisión
T033; no equivale a paridad Cloud ni a una nueva ejecución de pruebas.

### Plan concreto para la etapa autorizable posterior, no ejecutado

1. Completar acceso operativo T037. Confirmar con lectura oficial referencia exacta,
   nombre, organización, región, versiones/plan y cualquier divergencia. Si difieren de lo
   aprobado, detener la parte afectada. No crear otro proyecto ni alterar el anterior.
2. **Solo bajo alcance T038:** descubrir --help de configuración, destino, historial y
   previsualización de la CLI fijada. No suponer que un comando diff/list/dry-run es inocuo
   por su nombre. Elegir el mecanismo documentado de destino remoto explícito y verificar
   qué información obtiene/escribe y qué credenciales requiere antes de ejecutarlo. No se
   ejecutaron link, config diff, db push ni dry-run en T037.
3. Preparar un resultado revisable: historial efectivo, lista exacta de archivos realmente
   faltantes, hashes y diferencia de configuración. Confirmar ausencia de objetos/datos
   inesperados y posibilidad real de recuperación/copia previa si existen datos que conservar.
   No asumir que Free proporciona backups disponibles ni restauración automática.
4. Presentar al usuario las operaciones concretas de configuración, aplicación SQL y los dos
   despliegues Edge (ensure-profile/create-barbershop). Obtener autorización expresa para
   esas escrituras antes de realizarlas. No confundirla con la aprobación de creación.
5. Tras autorización, aplicar solo artefactos revisados y validar después de cada etapa.
   Las lecturas ordinarias usan JWT de usuario; credencial privilegiada solo en servidor,
   jamás EXPO_PUBLIC. No desactivar RLS/JWT, usar force/reset/prune o importar datos antiguos.
6. Comprobar posteriormente catálogo efectivo: RLS por tabla, políticas USING/WITH CHECK,
   grants por columna, owners/search_path/EXECUTE de las siete funciones, private no expuesto
   y rechazo de accesos anon/ajenos/privilegiados. Preparar aparte identidades sintéticas
   remotas autorizadas; no reutilizar el runner local de montaje/destrucción contra Cloud.
7. Revisar public **y graphql_public**, exposición automática desactivada y superficie REST/
   GraphQL efectiva. Comparar datos retornados y privilegios con JWT por rol/tenant; ni
   Healthy ni una interfaz sin tablas visibles prueba aislamiento. No retirar graphql_public
   silenciosamente: registrar la decisión/configuración autorizada antes de cambiarla.

### Recuperación prevista ante fallo, sin operaciones ejecutadas

Detener escrituras al primer fallo, identificar destino/archivo/revisión y conservar
mensajes saneados. El rollback de una migración fallida no revierte archivos anteriores
ya confirmados ni un despliegue Edge. Leer el historial/catálogo antes de decidir reintento;
no asumir estado vacío ni ejecutar reset/drop como reparación. Si hubo cambios confirmados,
proponer corrección versionada o restauración viable y obtener autorización específica.
Conservar artefactos previos de funciones y su configuración para una eventual reversión
aprobada. No improvisar rollback de datos ni afirmar recuperación probada en Cloud.

### Límites registrados antes de autenticar — antecedente

T037 no exige aplicar SQL, desplegar Edge ni otra escritura remota ahora: esas operaciones
son T038 y están prohibidas en este turno. No corresponde solicitar su autorización para
avanzarlas desde T037. El bloqueo actual es **autenticación/acceso operativo CLI pendiente**.
T038–T040 no se ejecutan. No se opera ningún contenedor, proyecto anterior o entorno local.
No se repiten pruebas generales, no se cambian dependencias y no hay commit/push.
Persisten nueve avisos moderados npm sin remediación o aceptación formal.

## Cierre de T037 — 13/11/2026

**Completada.** El usuario confirmó login y listado correcto; además Codex ejecutó una
consulta nueva de solo lectura con la CLI oficial 3.1.0:

~~~powershell
npx.cmd --no-install supabase projects list --output-format json
~~~

Ejecución por Codex mediante el binario local fijado equivalente, exit **0**.
[Resultado filtrado sin credenciales](t037-acceso-verificado.json). No se almacenó el
listado bruto, tokens ni datos de proyectos ajenos al contraste solicitado.

| Comprobación | Resultado y origen |
| --- | --- |
| Proyecto autorizado | app-barberia-arquitectura, vuoncrtkkkquvddunrxx; coincidencia exacta CLI |
| Región / estado | sa-east-1 / ACTIVE_HEALTHY; CLI |
| Organización | zxqsrgokncxawohnfidv; CLI. El nombre barberia-app procede del dashboard declarado por el usuario |
| Proyecto anterior | barberia-app, klebvayvsvibwjpkzrff; referencia distinta comprobada en el listado, sin operaciones dirigidas a ese proyecto |
| Autenticación | Listado autenticado aprobado; el error AccessTokenRequiredError anterior queda como evidencia histórica, no situación actual |
| Vínculo local | No existe supabase/.temp/project-ref. El aviso Cannot find project ref / Have you run supabase link acompaña exit 0 y no implica fallo de autenticación |
| PostgreSQL, Auth, PostgREST y plan | Se reutiliza la evidencia manual T036: PostgreSQL 17.11.0.019, Auth 2.197.0, PostgREST 14.18 y Free/spend cap. No son lecturas nuevas de versiones realizadas por Codex |

La creación manual ya acreditada satisface esa acción de T037; no se crea otro proyecto.
Referencia/configuración base, major/parche, condiciones aprobadas y acceso operativo de
lectura quedan identificados. No hay diferencias detectadas respecto al destino aprobado.
La autenticación no demuestra permisos de despliegue, conexión SQL ni seguridad RLS/ACL:
esas comprobaciones siguen en la etapa posterior autorizada. No se extrajeron credenciales;
la sesión creada por el usuario queda bajo la custodia local de la CLI, fuera del código.

T037 pasa a [x]; T038–T040 permanecen sin ejecutar. El plan de migraciones/validación y
recuperación anterior sigue siendo exclusivamente documental. Antes de T038 se revisarán:

1. Destino explícito vuoncrtkkkquvddunrxx, permisos operativos necesarios y comportamiento
   real de los comandos de la versión fijada; un eventual vínculo local se revisará primero.
2. Historial remoto y previsualización documentada, para determinar cuáles de los cinco
   archivos preparados están realmente pendientes. No se leyó aún ese historial.
3. Diferencias de configuración, incluyendo public/graphql_public, exposición automática,
   grants, RLS explícita y verificación JWT de ambas entradas. No cambiar opciones en silencio.
4. Autorización expresa del usuario para las escrituras concretas de configuración/SQL y
   despliegue de ensure-profile/create-barbershop, con validación posterior y recuperación.
   T036/T037 no conceden autorización automática para esas operaciones.

No se ejecutaron link, db push, SQL remoto, despliegues ni operaciones sobre contenedores.
Sin cambios de migraciones/código/dependencias, commit o push. Nueve avisos moderados npm
siguen pendientes de remediación o aceptación formal.
