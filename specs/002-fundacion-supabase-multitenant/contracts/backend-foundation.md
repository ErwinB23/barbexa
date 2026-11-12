# Contratos — Fundación Supabase 002

Diseño previo a implementación. Tipos propios expresados como contratos, sin código completo.
Los formatos HTTP/SQL se traducen en adaptadores; no pasan al núcleo.

## Núcleo cliente

`Profile`: userId, displayName, phone nullable. `Barbershop`: id, name.
`Membership`: id, userId, barbershopId, role barber/administrator, status active/inactive.
IDs son valores propios validados; no tipos generados de PostgreSQL ni User/Session del SDK.

`TenantFoundationGateway` y las funciones públicas de aplicación ofrecen:

| Operación | Entrada propia | Resultado propio |
| --- | --- | --- |
| EnsureOwnProfile | displayName, phone opcional | Profile existente o creado |
| GetOwnProfile | Ninguna identidad elegida | Profile o ausencia controlada |
| UpdateOwnProfile | displayName/phone opcionales; al menos un campo | Profile actualizado |
| CreateOwnBarbershop | name | Barbershop + primera Membership |
| GetBarbershop | barbershopId | Barbershop permitido o no disponible |
| RenameBarbershop | barbershopId, name | Barbershop actualizado o no disponible |
| ListOwnMemberships | Sin userId alternativo | Membership[] propias, incluidas inactive |
| ListBarbershopMemberships | barbershopId | Membership[] si admin activo; error de permisos en otro caso |

Aplicación valida entradas y coordina el puerto; el adaptador obtiene token vigente mediante
una dependencia inyectada por composición, no por importar estado global. Los núcleos no
reciben Request/Response, headers, fetch, SDK ni secretos. Las consultas vacías son resultados
explícitos; no se inventa información del tenant. No hay caché de permisos ni refresh/login
implementados aquí. Consumidor inicial: runner reproducible, no pantallas de negocio.

## Núcleo servidor y autenticación

La entrada verifica el Bearer contra Auth del destino configurado. Construye `VerifiedActor`
con userId verificado; no desde body o metadata. Un JWT de otro proyecto falla en Auth.
`AuthVerificationAdapter` queda fuera del núcleo. No aceptar anónimos Auth; su modalidad se
desactiva en configuración y el verificador rechaza identidades anónimas si aparecen.

`FoundationProvisioningGateway`:

- `ensureOwnProfile(actor, datosBásicos)` → Profile, idempotente sin sobrescribir existentes.
- `createOwnBarbershop(actor, name)` → Barbershop + Membership, todo o nada.

`EnsureOwnProfile` y `CreateOwnBarbershop` reciben ese contexto propio, validan datos y llaman
al puerto. Adaptador PostgreSQL traduce a RPC y errores seguros. Composición servidor privada
construye adaptadores; handler solo recibe dependencias ya ensambladas. Verificar actor es
precondición de entrada, no una afirmación demostrable solo por el tipo TypeScript.

## HTTP expuesto

Base: proyecto nuevo configurado. HTTPS en remoto; HTTP loopback solo para stack local.
Cliente envía `apikey` publicable y `Authorization: Bearer <sesión>`; ejemplos sin tokens reales.

| Método/ruta | Body/selección permitida | Resultado esperado |
| --- | --- | --- |
| POST `/functions/v1/ensure-profile` | displayName; phone opcional | 200 Profile; sin editar uno ya existente |
| POST `/functions/v1/create-barbershop` | Solo name | 201 Barbershop y Membership administrator/active |
| GET `/rest/v1/profiles` | Proyección explícita y filtro del propio ID | 200 fila propia o arreglo vacío |
| PATCH `/rest/v1/profiles?id=eq.<propio>` | display_name/phone | representation propia o cero filas; IDs/permisos denegados |
| GET `/rest/v1/barbershops?id=eq.<id>` | id/name | Solo filas permitidas por RLS |
| PATCH `/rest/v1/barbershops?id=eq.<id>` | Solo name | Solo admin activo; pedir representation y comprobar cardinalidad |
| GET `/rest/v1/barbershop_memberships` | Proyección mínima y user_id propio | Relaciones propias |
| POST `/rest/v1/rpc/list_barbershop_memberships` | p_barbershop_id | Lista mínima si admin activo; denegación si no lo es |

No hay campos libres aceptados por las entradas Edge: actorId, userId, role, status o ID de
barbería en el alta son inválidos. Rechazar tipos incorrectos/JSON inválido y campos extra;
no usar spread del body para SQL. Manejar OPTIONS/CORS explícitamente para futura web,
orígenes permitidos por entorno; CORS nunca sustituye autorización. Otras operaciones
devuelven 405. Límite técnico de body Edge previsto: 8 KiB, con 413 antes de procesar cuerpos
mayores; no introducir validaciones comerciales de teléfono ajenas a spec.

Errores Edge: `{ error: { code, message }, requestId }`, sin stack, SQL, JWT ni detalles de
perfil. Códigos propios: INVALID_INPUT (400), UNAUTHENTICATED (401), FORBIDDEN (403),
PROFILE_REQUIRED (409), CONFLICT (409), DEPENDENCY_UNAVAILABLE (503), INTERNAL_ERROR (500).
La plataforma puede rechazar JWT antes del handler con otro envelope; el adaptador traduce
también ese 401. PostgREST mantiene su formato nativo solo dentro del adaptador.

RLS puede responder 200 con cero filas a GET/PATCH filtrados. El gateway los convierte en
ausencia/no disponible y nunca en actualización exitosa. No distinguir por respuesta la
existencia de una barbería ajena. Tras timeout de alta no repetir automáticamente: reconciliar
consultando membresías propias. Un segundo alta intencional puede crear otro establecimiento.

## RPC y frontera privilegiada

Interfaces internas previstas, no SQL ejecutable ni endpoints habilitados:

| Wrapper `public`, SECURITY INVOKER | Ejecutor | Implementación |
| --- | --- | --- |
| `ensure_own_profile(p_actor_id uuid, p_display_name text, p_phone text)` | service_role | `private.ensure_own_profile`, privilegiada y estrecha |
| `create_own_barbershop(p_actor_id uuid, p_name text)` | service_role | `private.create_own_barbershop`, privilegiada y transaccional |
| `list_barbershop_memberships(p_barbershop_id uuid)` | authenticated | Comprueba admin actual mediante helper y consulta con RLS; sin privilegio de servicio |

PUBLIC/anon/authenticated no ejecutan los dos primeros wrappers ni sus implementaciones.
Tampoco acceden a `private` por API. No confiar en p_actor_id porque sea un parámetro:
únicamente la entrada verificada, con el secreto servidor y ACL de ejecución cerrada, puede
originarlo. SQL valida actor existente, perfil, datos e invariantes. El rol/estado inicial
son constantes del servidor. No hay RPC genérica que acepte cambios de membresías.

Secret key usa solo `apikey` en la llamada privilegiada, sin Bearer de usuario ni secret key
como JWT. Para stack local, una clave service_role heredada puede usarse como compatibilidad
servidor (apikey y Bearer de servicio), verificada en integración. Esta diferencia no altera
el contrato de aplicación. Separar conexiones/headers para evitar convertir lecturas ordinarias
en bypass o llamadas privilegiadas en sesión de usuario por mezcla accidental.

## Pruebas de contrato exigidas

- Puertos con dobles: éxito, datos inválidos, fallo de proveedor y cero filas.
- Adaptadores con respuestas HTTP controladas: traducción camelCase/snake_case, null,
  errores Auth/plataforma/PostgREST, timeout y rechazo de payload inesperado.
- Integración real: JWT propio/ajeno/inválido, RPC privilegiada directa denegada para usuarios,
  actor suplantado rechazado antes de persistir, primer admin correcto y rollback completo.
- Verificar que solo el transporte de servidor recibe secreto; el runner tiene preparación
  privilegiada separada de los casos ordinarios y no la inyecta en composición cliente.
- Perfil ajeno inaccesible incluso al administrador del mismo negocio; listar membresías
  nunca incorpora nombre/teléfono de compañeros mediante joins o respuestas ampliadas.

Detalles de matriz, carreras y evidencia en [validation.md](../validation.md).
