# T038 — alcance real y prueba mínima pendiente

Revisión de Codex, 13/11/2026. Destino autenticado confirmado:
app-barberia-arquitectura/vuoncrtkkkquvddunrxx, sa-east-1. Solo lecturas en este bloque.

## GraphQL: diferencia de plataforma, no contrato nuevo

La Constitución define Supabase Auth/Edge/PostgREST/PostgreSQL. spec.md FR-006 exige
edición del perfil propio; contracts/backend-foundation.md enumera Edge y REST/RPC,
sin operaciones GraphQL. validation.md prueba esos contratos; T038 exige compararlos
en remoto, no incorporar otra API. supabase/config.toml usa public como schema local.
No existe consumidor GraphQL en el módulo tenant-foundation o en sus pruebas aprobadas.

Por tanto, exigir paridad GraphQL A/B como condición adicional de T038 fue una
interpretación excesiva en las evaluaciones anteriores. Se corrige aquí esa interpretación,
sin cambiar especificación, plan, Constitución ni registros de ejecución históricos.
No se deben crear usuarios/barberías para probar una funcionalidad GraphQL no contratada.

### Estado remoto comprobado en esta revisión

[Consulta y HTTP de solo lectura](t038-paridad-inspeccion.json), CLI query/config diff exit 0:

- pg_extension no contiene pg_graphql. pg_available_extensions ofrece 1.6.3, con
  installed_version=null. **Disponible no significa instalada/habilitada**.
- Existen graphql y graphql_public como schemas de plataforma; sin relaciones de datos
  en ellos ni función graphql.resolve encontrada. Existe graphql_public.graphql.
- Su definición es un wrapper SECURITY INVOKER de supabase_admin, no SECURITY DEFINER.
  Para PostgreSQL >=14 retorna únicamente el error de extensión deshabilitada; no consulta
  tablas de negocio ni evalúa una operación GraphQL. Anon/authenticated/service_role
  pueden usarlo; ninguno tiene CREATE en esos schemas. Su search_path no está fijado,
  pero no es una función privilegiada de aplicación y no se justifica alterarla por ello.
- Dos POST GraphQL, uno de __typename y otro de colección de barberías, retornaron 200
  con el mismo mensaje **pg_graphql extension is not enabled.**, sin data. HTTP 200 aquí
  no acredita un motor GraphQL activo ni una consulta de negocio aprobada.
- config diff mantiene public/graphql_public en Cloud frente a public local.

La presencia del schema en la lista de exposición hace accesible el wrapper, no instala
la extensión ni concede acceso a tablas por sí sola. En el estado observado no hay una
vía GraphQL funcional de lectura/escritura del negocio. No se acredita ni se denuncia
una filtración por esa diferencia. [GraphQL oficial](https://supabase.com/docs/guides/graphql)
y [permisos/RLS](https://supabase.com/docs/guides/graphql/security).

### Decisión recomendada y alternativas

**Mantener el estado actual documentado es suficiente para el contrato 002**. No se
requiere cambiar configuración para cerrar su paridad funcional. La diferencia es de
plataforma y no afecta los contratos previstos; no implica aprobar un futuro uso GraphQL.
Si posteriormente se instala pg_graphql o se sustituye este wrapper, habrá que evaluar
la nueva capacidad y sus permisos, en vez de reutilizar esta conclusión sobre el stub.

Retirar solo graphql_public de Exposed schemas, dejando public y los demás ajustes sin
cambios, sería una reducción opcional de superficie/armonización del entorno. Afectaría
la ruta GraphQL de plataforma; no es condición obligatoria de T038 ni está ejecutado.
Si se eligiera, requeriría autorización específica y comprobación de config diff,
comportamiento de esa ruta y continuidad de REST/Edge; no config push global.
No procede deshabilitar o eliminar una extensión que no está instalada, ni borrar
schemas o funciones administrados por Supabase. Ninguna de esas operaciones se propone
como requisito para cerrar esta funcionalidad.

## Edición propia: contrato realmente pendiente

Fuentes inspeccionadas:

- spec.md FR-006 y SC-002; tasks.md T014/T015/T018 y T038.
- contracts/backend-foundation.md, UpdateOwnProfile y tabla HTTP.
- validation.md, matriz titular y prueba leer/PATCH propio con null/validación.
- src/features/tenant-foundation/application/profiles.ts, updateOwnProfile.
- src/features/tenant-foundation/domain/validation.ts, profilePatch.
- src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts,
  updateOwnProfile; tests/integration/tenant-foundation/profiles.test.mjs, primer caso.

La composición existente ofrece updateOwnProfile({displayName?, phone?}), al menos un
campo, sin ID elegible por el llamador. El adaptador resuelve el actor por Auth y envía:

~~~text
PATCH /rest/v1/profiles?select=id,display_name,phone&id=eq.<id-autenticado>
Prefer: return=representation
Body: solo display_name y/o phone, según los campos presentes
~~~

Nombre no vacío tras trim. Teléfono omitido conserva el actual; null lo retira; texto
vacío se normaliza a null en aplicación. Resultado correcto: HTTP 200 con una fila propia,
traducida a Profile. Cero filas no es éxito: aplicación lo expresa como NOT_AVAILABLE.

Lectura remota actual de políticas/grants confirma SELECT propio y UPDATE propio con
USING/WITH CHECK id=auth.uid(); authenticated puede editar display_name/phone, no id.
Esto es evidencia estructural, no reemplaza el PATCH real con sesión. El run anterior
probó PATCH ajeno denegado, pero no PATCH propio exitoso ni omitido/null.

## Prueba adicional preparada, todavía no autorizada ni ejecutada

**Cupo mínimo solicitado: un nuevo usuario Auth sintético y un perfil; cero barberías,
cero membresías.** La autorización anterior de tres usuarios ya se consumió y limpió;
no se reutiliza implícitamente para este nuevo run. No repetir aislamiento A/B, roles,
altas de barbería, carreras ni pruebas GraphQL.

Usar la composición createTenantFoundation existente, compilada mediante el helper
withCompiledClient (solo compila y retira su salida temporal; no invocar main ni el
montaje local withProfileEnvironment). Token del único usuario inyectado por memoria.
El guard del runner local permanece intacto, sin habilitarlo para Cloud.

| Paso | Operación concreta | Resultado exigido |
| --- | --- | --- |
| Preparación | Confirmar destino y conteos; Auth Admin crea una cuenta única example.invalid con email_confirm=true; iniciar sesión propia | Un usuario confirmado; JWT/contraseña/clave administrativa solo en memoria |
| Base | client.ensureOwnProfile({displayName: 'Inicial', phone: '000000000'}) | Un Profile de ese usuario; dato telefónico ficticio, sin SMS |
| P1 | client.updateOwnProfile({displayName: ' Editado '}) | Nombre Editado, mismo userId y phone 000000000 conservado por omisión; GET propio confirma persistencia |
| P2 | client.updateOwnProfile({phone: null}) | Nombre Editado conservado y phone null; GET propio confirma persistencia |
| Limpieza finally | Logout global; DELETE del perfil exclusivamente por el UUID de fixture; Auth Admin elimina solo ese usuario | Cero UUID del run en profiles/Auth/identidades/sesiones/refresh tokens; conteos globales restaurados |

Dos PATCH propios son suficientes para el hueco identificado; no se añade una nueva
funcionalidad. RLS usa el JWT real. El privilegio administrativo queda limitado a Auth
y limpieza por UUID; no se usa para los PATCH. Manifiesto privado ignorado por Git,
sin secretos, retirado tras verificación. Sin altas repetidas automáticamente; si falla
una operación, conservar diagnóstico e intentar limpieza selectiva segura. Los JWT
emitidos pueden seguir válidos criptográficamente hasta expirar; no purgar auditoría.

Esta tabla y su secuencia de llamadas constituyen la prueba preparada. **No se crearon
sus fixtures ni se ejecutaron sus PATCH.** Se necesita una nueva autorización concreta
para esas operaciones de datos y su retirada; no se pide cambiar configuración remota.

## 403 frente a 401: revisión acotada

tests/integration/tenant-foundation/cases.mjs ya espera 401 para anon/invalid-JWT; 403
se usa en denegaciones de usuarios autenticados. La expectativa equivocada estaba solo
en el operador temporal de T038 y ya se corrigió a 401/42501. Se comprobó su corrección
en .artifacts/t038-functional-operator.cjs, sin ejecutarlo ni recrear fixtures.

No hay corrección que aplicar al runner aprobado ni a expectativas válidas de 403
para sesiones autenticadas. Se conserva el resultado inicial 41/42, exit 1, y la
repetición de lectura posterior 401/42501, exit 0. No se presenta un rerun 42/42.
[PostgREST 14](https://docs.postgrest.org/en/v14/references/errors.html) respalda esa distinción.

## Cierre que procede

T038 sigue pendiente de la prueba mínima propia indicada y de revisar su resultado
contra los criterios literales, no de una nueva batería GraphQL A/B. El error previsto
PROFILE_REQUIRED y la atomicidad/aislamiento ya acreditados se reutilizan con su alcance;
no se convierten ahora en obligación de repetir carreras o instalar triggers de fallo
en Cloud. La versión del runtime Edge no observada se conserva como limitación, sin
confundirla con las versiones de funciones publicadas.

Sin datos nuevos, cambios de configuración/extensión/políticas/esquema, dependencias,
proyecto anterior, contenedores, T039–T040, commit o push. Nueve avisos moderados npm abiertos.
[Revisión final de conservación y diff](t038-paridad-revision.json).

## Actualización posterior a la autorización y ejecución

El usuario aprobó un usuario/un perfil. Un error de callback del operador detuvo ese
primer intento después del alta Auth y antes del perfil; la limpieza quedó acreditada.
Tras corrección local, el usuario autorizó expresamente un segundo intento con idéntico
cupo. Este segundo pasó **7/7 checks**, incluidos los dos PATCH y GET de persistencia,
y limpió el usuario/perfil. [Cierre y registros separados](t038-cierre-paridad.md).
La preparación anterior queda como antecedente, no como estado actual de autorización.
T038 está completada; no se repitió aislamiento ni se crearon barberías/membresías.
