# T038 — aceptación de paridad remota

Fecha: 13/11/2026. Alcance exclusivo T038. Destino nuevo
app-barberia-arquitectura/vuoncrtkkkquvddunrxx, sa-east-1.

## Pendiente contractual resuelto

[Revisión previa del alcance](t038-paridad-minima.md): GraphQL no pertenece al contrato;
pg_graphql no instalado, wrapper invoker limitado al error de extensión deshabilitada,
según [inspección read-only](t038-paridad-inspeccion.json). No se exige A/B GraphQL ni
cambiar Exposed schemas para demostrar los flujos Edge/PostgREST de 002. No se cambia
la especificación ni se habilita una API adicional.

La nueva autorización del usuario permitió un usuario Auth y un perfil para dos PATCH
propios, su persistencia y limpieza. No autorizó ni generó barberías/membresías nuevas.
Se usó la composición pública createTenantFoundation y su UpdateOwnProfile real, compilada
con el helper existente withCompiledClient, sin ejecutar su main/runner local o modificar
su guard. Credencial administrativa solo para Auth y limpieza exacta; negocio con JWT.

### Primer intento autorizado: fallo del operador y limpieza

[Registro original](t038-profile-minimal-results.json): exit 1, dos comprobaciones de
preparación Auth aprobadas; un usuario creado y cero perfiles. El operador pasó un
módulo compilado a una función que esperaba la fábrica createTenantFoundation. Falló
antes de llamar al cliente de negocio: calls=[] y error REMOTE_PROFILE_TEST_FAILED.
El campo declarativo publicCompositionUsed del registro original refleja la intención,
no una ejecución efectiva en ese intento; no se usa como prueba de ese flujo.

[Reproducción local y corrección](t038-profile-callback-check.json), exit 0: el callback
recibe objeto, la exportación es función; se reprodujo TypeError y se comprobó la
desestructuración correcta. Sin red o fixtures durante esa comprobación. No fue un
fallo de Supabase ni del código de aplicación. Se conserva el registro fallido.

Finalmente: logout 204, Auth Admin DELETE 200, cero usuarios/perfiles/identidades/
sesiones/refresh tokens asociados y conteos globales restaurados. No se reutilizó
implícitamente ese cupo; el usuario autorizó expresamente un segundo intento después
de conocer el error y su limpieza.

### Segundo intento expresamente autorizado: aprobado

[Registro del segundo intento](t038-profile-minimal-retry-results.json): **exit 0,
7/7 comprobaciones**, incluidas preparación, base y verificaciones de negocio:

| Comprobación | Resultado real |
| --- | --- |
| Auth | Un usuario ficticio confirmado y sesión propia, HTTP 200; sin mensajes de correo |
| Perfil base | EnsureOwnProfile crea el único perfil propio con nombre Inicial y teléfono ficticio 000000000 |
| P1 UpdateOwnProfile | displayName con espacios se normaliza a Editado; mismo userId y teléfono conservado al omitirse |
| P1 GetOwnProfile | Confirma identidad, nombre y teléfono persistidos |
| P2 UpdateOwnProfile | phone=null retira el teléfono; conserva nombre Editado e identidad |
| P2 GetOwnProfile | Confirma persistencia de null y conservación del nombre |

Dos PATCH efectivos HTTP 200, solicitando return=representation y proyección mínima;
las demás llamadas ordinarias Auth/Edge/GET también quedaron registradas solo por
método, ruta sin query y status. No se guardaron valores de claves, JWT, contraseñas,
cabeceras ni cuerpos brutos. Las comprobaciones comparan la representación y el GET
posterior, sin atribuir un cero filas a un éxito.

Limpieza finally del segundo intento: logout 204; un perfil retirado por UUID exacto;
Auth Admin DELETE 200; cero usuarios/perfiles/membresías/identidades/sesiones/refresh
tokens asociados y conteos globales de usuarios/perfiles/barberías/membresías en cero.
Manifiestos privados y SQL temporal de IDs de ambos intentos eliminados después de
verificarlo. No se purgan auditorías de plataforma ni se afirma revocación inmediata
de access JWT: pueden seguir válidos criptográficamente hasta expirar.

Total de esta ampliación: **dos usuarios en dos intentos autorizados por separado,
un perfil, cero barberías y cero membresías nuevas**. Todos los registros activos de
fixture retirados. No se repitió la batería de aislamiento A/B ya aprobada.

## Cotejo literal de T038

| Criterio de T038 | Evidencia y resultado |
| --- | --- |
| Depende de T037; destino nuevo inequívoco | T037 [x], CLI autenticada y ref explícita en cada operación; [destino](t038-edge-destino.json) |
| CLI help/config diff y confirmación antes de mutar | Ayudas 3.1.0 revisadas, comparación filtrada, autorizaciones expresas y controles previos; [preparación](remoto.md) |
| Configuración/migraciones y dos entradas revisadas | Cinco migraciones aplicadas una vez; [historial](t038-sql-list-after.json). Dos funciones ACTIVE v1, verify_jwt=true; [listado](t038-edge-list-after.json). Diferencia de plataforma explicada, sin uso GraphQL contratado |
| Catálogo y ACL/RLS comparados | [83/83 verificaciones estructurales](t038-sql-estructura.json), sin confundirlas con integración funcional |
| Flujos permitidos/denegados con identidades autorizadas | [Run funcional anterior](t038-functional-results.json): perfiles/alta/A-B/roles/revocación/privilegios; [revisión 401](t038-functional-diagnostico.json); [edición propia nueva](t038-profile-minimal-retry-results.json) |
| Preparación operativa separada y retirada selectiva | Límites de tres usuarios/dos tenants del primer run y nuevos cupos individuales respetados; manifiestos privados, Auth Admin y DML por UUID; todas las limpiezas verificadas |
| Sin runner destructivo local contra Cloud ni fixtures desplegadas | No se cambió su guard, no reset/pull antiguo/prune, no triggers de fallo desplegados; operador temporal acotado |
| Versiones efectivas/diferencias registradas | Auth v2.197.0 y PostgreSQL 17.11 leídos; funciones Edge v1/ACTIVE/JWT true. La versión numérica del runtime Edge no observada se declara como limitación, no se inventa |

**T038 satisfecha y casilla [x].** La conclusión usa las capacidades exigidas por su
contrato; no añade GraphQL, nuevas carreras o repetir todas las baterías locales como
condiciones de cierre. T039 y T040 permanecen pendientes y no se ejecutan.

## Límites conservados

El run anterior 41/42, exit 1, no se reescribe como 42/42: la expectativa del operador
era 403 para anon y se documentó/revalidó 401/42501 conforme a PostgREST 14. El primer
intento de edición propia fallido tampoco se oculta; el segundo tiene evidencia propia.
No se declaran pruebas GraphQL A/B, carreras remotas o rollback inducido entre inserts;
las evidencias locales existentes conservan su alcance. La inspección no aprueba seguridad
absoluta ni remedia/acepta los nueve avisos moderados npm pendientes.

No hay configuración/SQL de esquema/políticas/extensiones nuevos, despliegues adicionales,
operaciones de contenedores o del proyecto antiguo, commit o push. El checkpoint continúa
en 42a695c y se conserva el log activo sin editarlo ni detenerlo.
[Revisión final de integridad, secretos y Git](t038-profile-paridad-revision.json).
