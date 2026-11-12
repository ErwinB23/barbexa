# Data model — 002

Diseño propuesto, no esquema aplicado. [Especificación](spec.md) y
[contratos](contracts/backend-foundation.md) gobiernan las operaciones.

## Entidades y relaciones mínimas

| Entidad | Campos propuestos PostgreSQL | Invariantes |
| --- | --- | --- |
| `auth.users` | Identidad administrada por Supabase Auth | Se referencia su PK; no crear otra tabla de contraseñas ni editar el esquema administrado |
| `public.profiles` | `id uuid` PK/FK → auth.users; `display_name text` NOT NULL; `phone text` nullable | Un perfil por identidad existente; nombre no vacío tras trim; no roles ni metadata de autorización |
| `public.barbershops` | `id uuid` PK generado por servidor; `name text` NOT NULL | Nombre no vacío tras trim; ID inmutable; nombre no es UNIQUE |
| `public.barbershop_memberships` | `id uuid` PK generado; `user_id uuid` FK → profiles; `barbershop_id uuid` FK → barbershops; `role text`; `status text`, ambos NOT NULL | UNIQUE(user_id, barbershop_id); CHECK role en barber/administrator y status en active/inactive |

La identidad de asociación expuesta es `id`, además de usuario, barbería, rol y estado.
No se agregan timestamps ni datos de contacto al listado de membresías para esta fundación.
FK con borrado restrictivo: no se ofrece eliminación de cuentas, tenants o perfiles en 002.
Su política de ciclo de vida se definirá antes de implementar esas operaciones futuras.

```text
auth.users 1 ─── 0..1 profiles 1 ─── 0..N barbershop_memberships N ─── 1 barbershops
```

Un usuario puede ser administrador activo de A, barbero activo de B e inactivo de C, con
un solo perfil. Cliente es capacidad del usuario autenticado, no columna global ni relación
profesional obligatoria. No se agrega `owner_id` que compita con la membresía como autoridad.

## Validación y autoridad

- Dominio valida forma de IDs, nombre no vacío tras trim y valores de rol/estado recibidos.
  SQL repite los CHECK definitivos. No inventar obligatoriedad/formato comercial del teléfono.
- Teléfono omitido/null es opcional; texto vacío se normaliza a null. PATCH omitido conserva
  el valor; null lo retira. Nombre visible y de barbería se normalizan con trim en adaptadores
  y se almacenan normalizados; SQL rechaza nombres vacíos.
- El cliente no elige IDs en altas, el usuario asociado, rol ni estado inicial. Tampoco puede
  modificar IDs/FK en PATCH; usar grants por columna además de RLS.
- Perfiles se aprovisionan solo por `ensure-profile` con actor de Auth. Si ya existe,
  retorna sus datos sin cambiar nombre/teléfono ni identidad. La edición usa otra operación.
- El alta de barbería requiere perfil existente; devuelve `PROFILE_REQUIRED` si falta.
  PostgreSQL crea barbería y asociación administrator/active en una llamada transaccional.

## Índices y consistencia

PK para cada entidad; UNIQUE(user_id, barbershop_id) protege la pareja y las consultas propias.
Índice adicional `(barbershop_id, user_id)` soporta listado contextual y la FK en sentido tenant.
El helper de pertenencia busca pareja con estado/rol; medir EXPLAIN antes de añadir índices
parciales redundantes. No agregar índices geográficos, búsqueda pública ni particiones.

No existen hijos con dos IDs de tenant redundantes en este modelo; FKs y pareja única bastan
para las relaciones actuales. Cambiar `barbershop_id`/`user_id` está denegado. Futuras entidades
con pertenencia redundante deberán usar FK compuestas que impidan mezclar tenants.

## Estados y concurrencia

- Perfil ausente → existente por aprovisionamiento idempotente; dos solicitudes simultáneas
  dejan una fila. La RPC resuelve el conflicto de PK y recupera el perfil vigente sin editarlo.
- Barbería inexistente → barbería + primer administrador activo, o rollback de ambas.
  Dos altas independientes pueden producir dos barberías; no se deduplican por nombre.
- La misma pareja usuario/barbería no puede insertarse dos veces, incluso desde dos conexiones.
  Esa prueba de restricción usa preparación privilegiada controlada, no API de personal.
- `active ↔ inactive` y cambios de rol solo mediante fixtures de prueba. Una solicitud que
  empieza después del commit de desactivación consulta el nuevo estado; no prometer cancelar
  una solicitud anterior que ya tomó snapshot. No cachear permisos en cliente, Edge o JWT.

## ACL y RLS previstas

`public` contiene tablas/RPC expuestas; `private` solo helpers e implementaciones internas,
sin exposición por API ni tablas adicionales. RLS habilitada en las tres tablas.
Revocar grants heredados antes de conceder los siguientes; no conceder CREATE/TRUNCATE a clientes.

| Objeto/operación | Permiso `authenticated` | RLS/validación definitiva |
| --- | --- | --- |
| profiles SELECT | Solo columnas id/display_name/phone | id = auth.uid() |
| profiles UPDATE | Solo display_name/phone | USING y WITH CHECK de propiedad; CHECK de nombre |
| profiles INSERT/DELETE | Ninguno | Aprovisionamiento reservado a servidor |
| barbershops SELECT | id/name | Helper privado comprueba membresía propia active |
| barbershops UPDATE | Solo name | Helper exige administrator/active de la fila; USING y WITH CHECK |
| barbershops INSERT/DELETE | Ninguno | Alta solo por operación transaccional servidor |
| memberships SELECT | id/user_id/barbershop_id/role/status | Propia, incluso inactive, o admin activo de esa barbería |
| memberships INSERT/UPDATE/DELETE | Ninguno | También denegado para administradores ordinarios |

`anon` no obtiene grants de tablas ni funciones de negocio. El rol `service_role` no necesita
acceso directo a estas tablas para los dos adaptadores de aprovisionamiento: revocarlo y
conceder únicamente ejecución de sus wrappers/implementaciones. Su capacidad BYPASSRLS no
se usa como prueba de aislamiento y sigue siendo una credencial privilegiada a custodiar.

Helpers `private.is_active_member(shop_id)` y `private.is_active_admin(shop_id)` usan solo
el actor de `auth.uid()` y la tabla vigente. Son SECURITY DEFINER de alcance estrecho,
sin parámetro de usuario alternativo, `search_path=''`, referencias calificadas y retorno
booleano. Otorgar USAGE/EXECUTE necesarios a authenticated para evaluación de políticas,
revocar PUBLIC/anon; el schema permanece fuera de PostgREST. No crear ciclo de políticas
ni aplicar FORCE RLS que vuelva recursiva su lectura como owner.

Funciones privadas de aprovisionamiento: EXECUTE solo service_role; wrappers públicos
SECURITY INVOKER con la misma restricción. Un tercer RPC de lectura, `list_barbershop_memberships`,
invoker y concedido a authenticated, comprueba admin activo antes de listar. Así la operación
administrativa devuelve denegación al barbero, aunque siga pudiendo leer **su propia** relación
en la tabla. Ese acceso propio no equivale a permiso de listar compañeros.

Crear/revocar funciones en una misma transacción y probar catálogo efectivo, incluidos owners,
search_path y privilegios PUBLIC implícitos. No revocar indiscriminadamente funciones de Auth
ni alterar permisos de esquemas administrados. Tablas/funciones futuras deben tener pruebas
de ACL; ninguna declaración documental acredita su configuración real.

## Fixtures

Auth sintético y perfiles: admin A, admin B, barbero A, barbero B, cliente sin membresías,
persona compartida admin A/barbero B e inactivo de A. A/B tienen nombres de prueba.
El runner prepara usuarios por API administrativa **local**, obtiene JWT reales por Auth y
carga membresías controladas. pgTAP puede usar claims de test con SET LOCAL ROLE; esa técnica
queda dentro de su transacción y nunca se expone a solicitudes ordinarias.
Sin passwords/tokens fijos publicados, datos anteriores ni seed operativo de producción.
