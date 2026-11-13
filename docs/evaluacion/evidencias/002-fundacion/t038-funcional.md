# T038 — validación funcional remota controlada

Fecha: 13/11/2026. Destino único vuoncrtkkkquvddunrxx, app-barberia-arquitectura,
sa-east-1; prohibido klebvayvsvibwjpkzrff. Ejecución de Codex, no prueba manual del usuario.

## Autorización, preparación y límites

El usuario autorizó como máximo tres usuarios Auth, dos barberías y los perfiles/membresías
necesarios, seguidos de eliminación selectiva. No se autorizan cambios de esquema,
migraciones, RLS/ACL, despliegues, Data API/graphql_public o contenedores.
No se modifica el runner local ni se habilita su guard para Cloud. Operador temporal
con destino fijo y manifiesto de UUID exactos, ignorados por Git en .artifacts/.
Solo identificadores/etiquetas de fixtures en el manifiesto privado; claves, JWT y
contraseñas exclusivamente en memoria, sin volcados de respuestas ni cabeceras.

[Acceso/preflight nuevo](t038-functional-access.json): CLI autenticada, Auth Admin GET 200,
clave de servidor disponible mediante CLI sin --reveal, usada solo por un proceso local
confiable. Consulta SQL read-only: cero usuarios Auth y filas de negocio, sin triggers
de aplicación, y tres FK de negocio ON DELETE RESTRICT. Dependencias internas Auth
CASCADE/SET NULL identificadas para eliminación mediante su Admin API. Auth health 200,
versión efectiva v2.197.0, PostgreSQL 17.11. Ningún dato creado durante este preflight.

## Procedimiento previsto antes de escribir

1. Reconocer otra vez ref/nombre/región mediante CLI. Crear un identificador aleatorio
   de ejecución y tres correos únicos bajo example.invalid, dominio reservado; crear
   las cuentas mediante Auth Admin con email_confirm=true, sin invitaciones/correos.
2. Obtener tres sesiones de contraseña independientes. Cada llamada Edge/PostgREST/RPC
   de negocio utiliza su JWT y clave pública, nunca la clave privilegiada. Comprobar
   primero PROFILE_REQUIRED con el tercer usuario sin perfil y ausencia de parciales.
3. Aprovisionar perfiles e idempotencia, suplantación de body y acceso/edición ajenos;
   crear dos barberías por Edge, verificando actor y primer administrador activo.
4. Verificar A/B aisladas en ambas direcciones y rechazo de RPC privilegiada directa.
   Preparación DML restringida por UUID para dos membresías de fixture: usuario A barbero
   en B y usuario C barbero inactivo en A. No hay nuevo endpoint de gestión de personal.
   Ese DML y la posterior revocación son datos de prueba autorizados, no cambios SQL
   de esquema, políticas, grants o funciones. Probar roles distintos, inactividad,
   promoción denegada y revocación con el mismo JWT.
5. Revisar la superficie GraphQL mediante consulta de lectura si los campos existentes
   lo permiten, sin activar introspección ni cambiar exposición. Registrar una limitación
   si el contrato no está disponible; no inventar un endpoint o un resultado favorable.
6. En finally: reconciliar el manifiesto con las filas exactas del run; si hay una relación
   ajena inesperada, detener antes de ampliar el borrado. Cerrar sesiones con scope global;
   borrar solo membresías por UUID, las dos barberías por UUID y perfiles por UUID, en
   ese orden. Retirar las cuentas mediante Auth Admin, no DELETE directo de auth.users.
   Verificar ausencia de los UUID y de identidades/sesiones/refresh tokens asociados.
   No borrar logs de auditoría de la plataforma ni afirmar invalidez inmediata de JWT.
7. Sin reintentos automáticos de altas. Ante respuesta incierta, reconciliar por UUID
   o correo/nombre exacto del identificador único, sin crear más recursos. Recuperación
   únicamente de limpieza desde el manifiesto privado; no repetir el run sin revisión.

Fuentes oficiales consultadas:
[creación administrativa](https://supabase.com/docs/reference/javascript/auth-admin-createuser),
[eliminación administrativa](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser),
[sesiones y expiración JWT](https://supabase.com/docs/reference/javascript/auth-signout),
[contrato REST Auth](https://github.com/supabase/auth/blob/master/openapi.yaml).

La aceptación se registrará con los resultados reales y su limpieza; este procedimiento
por sí solo no acredita pruebas aprobadas ni permite cerrar T038.

## Ejecución real y resultados

[Registro por escenario, preparación y limpieza](t038-functional-results.json).
Un único run identificable, **tres usuarios**, **tres perfiles**, **dos barberías** y
**cuatro membresías**: dos administradores iniciales creados por Edge y dos relaciones
preparadas como fixtures por UUID. Correos ficticios example.invalid y confirmación
administrativa; sin envío de mensajes. Tres sesiones reales Auth independientes.
Las llamadas de negocio utilizaron exclusivamente clave pública + JWT del usuario.

| Grupo | Resultado obtenido |
| --- | --- |
| Auth | Tres altas confirmadas HTTP 200; tres sesiones propias HTTP 200 |
| A Perfiles | Tres ensure-profile 200 con actor propio; repetición idempotente sin sobrescribir; body con otro userId rechazado 400; GET/PATCH ajenos 200 con cero filas, perfil B intacto |
| B Barberías | Dos altas 201, cada una con primer administrador propio activo y FK coherentes; PROFILE_REQUIRED 409 antes de aprovisionar C, con delta cero en barberías/membresías |
| C Aislamiento | Ambos administradores leen su barbería; lectura y PATCH cruzados 200 con cero filas; listado de membresías ajeno 403; listado propio A con proyección mínima 200 |
| D Roles | A administrador en A/barbero en B: lee B, no lo renombra ni lista su personal; renombra A y ve sus dos roles por contexto; autopromoción 403 |
| D Vigencia | C inactivo en A y ajeno a B no lee ninguno; conserva su relación inactiva propia. Al inactivar solo la membresía A-en-B, el mismo JWT pierde B y conserva A |
| E Privilegios | RPC create_own_barbershop directa con JWT ordinario rechazada 403; no se usó la credencial de servicio para eludir RLS en negocio |

Los datos de membresía se prepararon mediante el operador administrativo existente,
sin inventar gestión de personal. La revocación fue UPDATE del UUID de fixture, no un
cambio de políticas. Lecturas y PATCH posteriores comprobaron la autorización real.
El error PROFILE_REQUIRED demuestra ausencia de parciales para ese error previsto;
no se inyectó un fallo entre inserts ni se ejecutaron carreras en Cloud. Los ensayos
locales anteriores de rollback/concurrencia conservan ese alcance, no se atribuyen aquí.

### Incidencia del operador, conservada

La ejecución inicial terminó **exit 1, 41/42 comprobaciones aprobadas**. La restante
exigía incorrectamente 403 para un acceso anónimo a PostgREST y obtuvo 401. El producto
denegó el acceso; no fue una autorización indebida. Se ejecutó finally y la limpieza
completa antes de investigar o repetir nada. No se reescribe ese resultado histórico.

[Diagnóstico y repetición de lectura](t038-functional-diagnostico.json), exit 0:
401 con código PostgreSQL 42501, cero filas de negocio devueltas. La documentación
[PostgREST 14](https://docs.postgrest.org/en/v14/references/errors.html) especifica 401
sin autenticación y 403 con autenticación para privilegios insuficientes. Se corrigió
solo la expectativa del operador temporal y se bloqueó su repetición automática; no se
modificó código de aplicación ni controles de permisos. **No se afirma un rerun 42/42**.
No se crearon usuarios/barberías adicionales para corregir esa expectativa.

El control GraphQL con sesiones A/B estaba después de esa aserción y no se ejecutó.
La consulta posterior sin usuario retornó HTTP 200 con errores y sin colección; ocurrió
tras limpiar, por lo que no acredita aislamiento de tenants en GraphQL. Config diff
read-only confirma public/graphql_public remoto frente a public local. No se cambió
esa opción ni se habilitó introspección. No se declara una vulnerabilidad por esa sola
diferencia, pero falta resolver la superficie prevista y validar la vía conservada.

## Limpieza selectiva acreditada

Reconciliación del manifiesto privado con correos únicos y UUID exactos; sin relaciones
ajenas inesperadas. Tres logout scope=global HTTP 204. Retiradas por UUID: cuatro
membresías, dos barberías y tres perfiles; luego tres DELETE Auth Admin HTTP 200,
respetando FK RESTRICT y cascadas internas gestionadas por Auth.

Consulta final de los identificadores de este run: **cero usuarios, perfiles, barberías,
membresías, identidades, sesiones y refresh tokens**. Conteos globales de usuarios y
negocio restaurados a la línea base cero. No se eliminan registros de auditoría Auth
de la plataforma ni se promete que sus logs expiren ahora. No se afirma invalidación
inmediata de los JWT ya emitidos: pueden conservar validez criptográfica hasta expirar.

Manifiesto privado y SQL temporal con identificadores eliminados tras la comprobación;
SHA-256 del manifiesto conservado como huella, sin publicar los UUID/correos. Sin claves,
contraseñas, tokens o cadenas de conexión guardados en evidencias. Cero fixtures activas
restantes, sin TRUNCATE, reset o borrados por patrones generales.

## Evaluación de T038

Los escenarios mínimos principales de negocio, roles y limpieza quedan acreditados;
no se oculta el error de expectativa inicial. **T038 permanece [ ]**: la diferencia
de exposición public/graphql_public aún exige decisión coherente con la configuración
prevista y, si se conserva, su validación con contextos A/B. Tampoco se acredita aquí
paridad exhaustiva de todos los contratos: edición propia de perfil, GraphQL con JWT
y rollback/concurrencia remotos no fueron ejecutados en este run. No se crean más datos
bajo esta autorización de hasta tres usuarios/dos barberías.

Auth efectivo v2.197.0 y PostgreSQL 17.11 leídos ahora; funciones versión 1 son evidencia
del despliegue anterior. La versión del runtime Edge no se leyó. Nueve avisos moderados
npm continúan abiertos. Sin cambios de esquema/RLS/ACL/migraciones/dependencias, proyecto
anterior, contenedores, T039–T040, commit o push.
[Revisión de conservación, secretos, enlaces y Git](t038-functional-revision.json).

## Aclaración posterior del alcance — 13/11/2026

La evaluación anterior queda como antecedente: no prueba un requisito GraphQL. Al revisar
las fuentes aprobadas y el catálogo remoto, GraphQL resultó ajeno al contrato y pg_graphql
no instalado; graphql_public solo contiene el wrapper invoker de extensión deshabilitada.
Por tanto, **no se exige repetir A/B por GraphQL ni modificar esa configuración para cerrar
002**. Tampoco se convierten las carreras remotas no ejecutadas en una obligación adicional.
Se conservan todos los resultados/limitaciones del run anterior sin reescribirlos.

La prueba realmente pendiente es edición propia de perfil mediante la composición/REST
existentes: éxito, conservación por omisión y retiro con null. [Revisión y plan mínimo
de un usuario/un perfil con limpieza](t038-paridad-minima.md), aún sin autorización nueva
ni ejecución. Las aserciones 401/403 ya están corregidas donde correspondía; no se repite
la batería de aislamiento. T038 sigue [ ] hasta verificar su aceptación real.

### Aceptación posterior de la edición propia

La prueba mínima fue autorizada y ejecutada: un primer intento del operador falló y
limpió su usuario; un segundo intento autorizado pasó 7/7 checks, incluidos los dos
PATCH propios y GET de persistencia, y retiró usuario/perfil. [Cotejo literal y cierre](t038-cierre-paridad.md).
**T038 [x]**; los estados pendientes anteriores son históricos. No se repitió aislamiento
ni se crearon barberías/membresías nuevas. T039–T040 siguen pendientes.
