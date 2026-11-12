# Research — 002 Fundación Supabase y aislamiento multitenant

Fecha: 2026-11-11. Investigación de diseño; no se inició Supabase ni se ejecutó SQL.

## Fuentes y contexto inspeccionados

Se leyeron AGENTS, Constitución 1.0.1, rúbrica, spec/checklist 002, estructura/plan 001,
package/lock y checker existente. Se consultó el análisis anterior (9 migraciones y 9 suites
SQL leídas, no ejecutadas allí). La propuesta local sigue en
`1eb8852388480388f39035641eb87d299def9258`; se contrastaron enfoque arquitectónico y RF01–05,
RF26 y RF41–42. El backend anterior no se conectó ni se volvió a copiar.

Las decisiones siguientes son diseño propuesto, salvo las de alcance ya confirmadas:
alta propia de barbería, datos privados para miembros activos y gestión de personal posterior.

## D1 — Versiones y desarrollo local

**Decisión:** CLI 3.1.0, publicación estable oficial del 09/11/2026; binario Windows con
checksum, sin dependencia npm de la aplicación. PostgreSQL 17 como major objetivo y Deno
2.9.8 para herramientas del host. Congelar versiones efectivas/imágenes al implementar.
Node 24.21.0 y npm 11.19.0 fueron comprobados; conservar el cliente instalado.

**Motivo:** CLI v3 cambia selección de destinos y confirmaciones remotas. La guía usará sus
comandos actuales con destino local por defecto y remoto explícito. Docker es la opción de
Windows; el runtime nativo experimental no es necesario. No se encontró CLI/Deno/Docker/psql
en PATH, por lo que aún no hay evidencia de entorno ejecutable para 002.

**Alternativas:** CLI sin fijar descartada por reproducibilidad; v2 no se adopta por inercia;
Supabase alojado como único entorno descartado porque dificulta pruebas destructivas aisladas.
Dos preparaciones locales independientes y posterior comprobación del proyecto nuevo cubren
reproducción y despliegue sin tocar el backend anterior.

Fuentes: [release CLI 3.1.0](https://github.com/supabase/cli/releases/tag/v3.1.0),
[cambio v3](https://supabase.com/changelog/supabase-cli-v3),
[migración v3](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3),
[CLI local](https://supabase.com/docs/guides/local-development/cli/getting-started),
[Deno 2.9.8](https://github.com/denoland/deno/releases/tag/v2.9.8),
[Docker en Windows](https://docs.docker.com/desktop/setup/install/windows-install/).
Se revisó primero el [changelog](https://supabase.com/changelog.md): CLI v3 es el cambio
relevante; Flutter v3 no afecta este cliente. El retiro anunciado de cifrados TLS antiguos
requiere clientes actuales; esta lectura no prueba la conectividad del futuro entorno.

## D2 — Acceso ordinario y operaciones críticas

**Decisión:** lecturas/edición básica por PostgREST bajo JWT y RLS; aprovisionamiento de
perfil e inicialización barbería/admin mediante casos de uso Edge y RPC reservadas a servidor.
El adaptador Auth verifica Bearer consultando `GET /auth/v1/user` del proyecto configurado.
No basta decodificar JWT ni confiar en `getSession` local. Mantener además `verify_jwt=true`.

**Motivo:** permite verificar privacidad directamente en PostgreSQL sin convertir todo
en endpoints propios. Para el alta crítica, impedir ejecución RPC por `authenticated`
garantiza que una llamada directa no eluda el caso de uso Edge.

**Frontera de confianza:** la entrada descarta cuerpos con actor/rol/estado inesperados;
construye `VerifiedActor` desde Auth y el adaptador servidor pasa ese ID a SQL. Una secret key
solo en infraestructura servidor autoriza PostgREST como `service_role`. No adjuntar el JWT
del usuario a esa llamada privilegiada: es un transporte separado. SQL comprueba identidad
existente, perfil y restricciones; asigna administrador activo, nunca un rol elegido por caller.
Esto confía en la entrada Edge y la custodia del secreto; no es identidad inferida por RLS
en una llamada de servicio. Probar ambas fronteras por separado y juntas.

**Alternativas:** RPC crítica concedida a `authenticated` permite saltarse Edge; crear
barbería y membresía en dos requests deja huérfanos; pasar actor recibido del cliente permite
suplantación. Se descartan. No crear un sistema de JWT propio ni nuevas credenciales de roles
PostgreSQL sin necesidad. El operador del entorno no es un administrador global del negocio.

Fuentes: [Auth de Edge](https://supabase.com/docs/guides/functions/auth),
[verificación con Auth](https://supabase.com/docs/reference/javascript/auth-getuser),
[transporte oficial de getUser](https://github.com/supabase/auth-js/blob/master/src/GoTrueClient.ts),
[claves y service role](https://supabase.com/docs/guides/getting-started/api-keys).
La semántica de la verificación también se probará con tokens válidos, alterados, expirados
y de otro proyecto. No se adopta el middleware/SDK de la referencia como requisito.
No se promete revocación inmediata de todo access token tras logout: el ciclo de sesiones
completo queda para Auth posterior. La revocación de membresía sí se evalúa en la siguiente
solicitud tras commit, mediante la tabla vigente, sin esperar caducidad o refresh de JWT.

## D3 — Modelo, privacidad y RLS

**Decisión:** perfiles de identidad global privada; barberías; membresías únicas por pareja.
Sin tabla de roles globales ni membresía de cliente. RLS habilitada en las tres tablas;
revocación de grants implícitos y permisos por operación/columna. Helpers de pertenencia
privados, dependientes de `auth.uid()` y tablas vigentes, sin roles en metadata/JWT.

**Motivo:** un administrador de A puede ser barbero en B y no tiene acceso a perfiles ajenos.
Un helper privado que consulta membresías evita políticas recursivas al listar integrantes.
Fijar `search_path=''`, nombres calificados y EXECUTE mínimo; sin FORCE RLS sobre la tabla
que debe consultar ese helper con su owner, para no reintroducir recursión. Las pruebas
ordinarias sí cambian a `authenticated`/`anon`; ejecutar como owner no prueba aislamiento.

**Alternativas:** autoridad por filtro de UI, metadata editable, roles globales y esquema
por tenant contradicen la arquitectura o permisos. Views privilegiadas y tabla auxiliar de
ACL no tienen consumidor necesario y se omiten.

Fuentes: [RLS y helpers](https://supabase.com/docs/guides/database/postgres/row-level-security),
[RLS PostgreSQL 17](https://www.postgresql.org/docs/17/ddl-rowsecurity.html),
[seguridad de funciones](https://www.postgresql.org/docs/17/sql-createfunction.html).
Se consultaron las skills Supabase/Postgres y sus reglas RLS básica/rendimiento; se conserva
el contexto Auth real, no un `app.current_user_id` configurable por el cliente.

## D4 — Perfil idempotente y atomicidad

**Decisión:** `ensure-profile` aprovisiona para el actor verificado con nombre válido;
repetir devuelve el perfil existente sin sobrescribirlo. No se necesita trigger sobre
`auth.users` ni se asume que toda identidad ya tenga perfil. El alta de barbería exige perfil.
La RPC inserta barbería y primera membresía dentro de una transacción; restricciones UNIQUE/FK
protegen asociaciones. Los errores no se capturan como éxito y revierten la llamada completa.

**Motivo:** recuperable para identidades sin perfil y sin introducir metadata obligatoria
en Auth. La misma persona puede crear varios negocios, incluso con el mismo nombre.
Cada alta válida nueva genera un tenant distinto; no se promete idempotencia de esa operación.

**Alternativas:** trigger obligatorio podría bloquear el registro si falla; autocrear perfiles
ajenos desde el cliente rompe FR-005; deduplicación por nombre o límite de un negocio añaden
políticas no aprobadas. Idempotency keys y tabla de comandos no son necesarias para FR-009;
no habrá reintentos automáticos de creación tras respuesta incierta.

Fuentes: [funciones/transacciones](https://supabase.com/docs/guides/database/functions),
[migraciones locales](https://supabase.com/docs/guides/local-development/database-migrations).

## D5 — Sin nuevas dependencias npm de aplicación

**Decisión:** `fetch` disponible en Expo/Node/Deno, envuelto en adaptadores pequeños para
las operaciones limitadas de 002. Tokens inyectados, sin implementar login/OAuth, refresh ni
almacenamiento de sesiones. Los fixtures obtienen sesiones reales de Auth para el runner.

**Motivo:** no hay todavía UI de autenticación ni necesidad de replicar un SDK. Los puertos
permitirán sustituir el transporte posteriormente. No construir un cliente Supabase genérico.
Tipos de persistencia/SDK nunca cruzan al núcleo; tipos cliente y servidor no se importan
entre despliegues. Tests de contrato cubren su frontera.

**Alternativas:** incorporar ahora SDK cliente/servidor o middleware adicional amplía el árbol
sin consumidor de sesión real. Su adopción posterior requiere versión fija, revisión de peers,
compatibilidad Expo y auditoría de dependencias. CLI y Deno son herramientas de desarrollo,
no paquetes incluidos en el bundle móvil.

## Riesgo npm: consulta real

Ejecutado el 11/11/2026 sin instalar, actualizar ni ejecutar fix:

| Comando | Resultado observado | Código |
| --- | --- | --- |
| `npm.cmd audit --json` en sandbox | Falló consulta al registry y escritura de log de caché; no produjo auditoría válida | 1 |
| `npm.cmd audit --omit=dev --json` en sandbox | Mismo fallo de entorno; no resultado de seguridad | 1 |
| Ambos comandos repetidos con permiso de red | Consulta válida; **8 moderadas totales**, **3 sin dev**; cero high/critical reportadas | 1 cada uno, por hallazgos |
| `npm.cmd explain minimatch --depth=4` | Inspección del árbol; salida extensa, cadenas relevantes confirmadas con lockfile | 0 |

El antecedente de **9 moderadas** de 001 se conserva; la consulta actual no demuestra arreglo
ni aceptación del riesgo. No se alteraron package/lock. Un cambio del conteo del registry no
equivale a resolver avisos históricos; falta conciliarlo y definir remediación compatible.

Raíz actual reportada: `minimatch` 10.2.6 afectado por
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), agotamiento de recursos
por patrones glob manipulados. Árbol comprobado:

- Dependencia directa `expo@58.0.24` → `@expo/fingerprint@0.21.10` → `minimatch@10.2.6`:
  tres nodos reportados en el árbol sin dev. La clasificación npm como producción no prueba
  que el módulo forme parte del bundle Android ni que acepte patrones de usuarios.
- Rama de desarrollo `eslint-config-expo`/plugins → `@typescript-eslint` (parser, plugin,
  type-utils, typescript-estree y utils) → minimatch: cinco nodos reportados adicionales.
  No son cinco causas independientes; varios avisos propagan la misma dependencia.

Impacto inferido: riesgo de CPU/memoria en tooling que procese patrones no confiables.
No se demostró explotación móvil, ejecución remota ni afectación de PostgreSQL. Falta trazar
alcanzabilidad y validar una actualización compatible en trabajo separado. npm propone para
la rama Expo `52.0.49` como cambio mayor: **no aceptarlo automáticamente** frente a SDK 58.
Mantener patrones/configuraciones controlados reduce exposición operativa, sin dar el riesgo
por resuelto. Ninguna auditoría de seguridad queda aprobada con estos comandos.

## D6 — Pruebas reales y evidencia

**Decisión:** pgTAP para catálogo, grants/RLS y restricciones; solicitudes HTTP con sesiones
reales para Auth/Edge/PostgREST; dos conexiones reales para carreras. Fixtures sintéticos
administrativos fuera de migraciones y APIs de negocio. Comparar dos preparaciones vacías.

**Motivo:** mocks no prueban RLS, y claims controlados en una sesión SQL de test no prueban
verificación JWT. Una consulta denegada que devuelve cero filas debe comprobar también que
no mutó registros, no exigir un HTTP 403 donde PostgREST oculta filas.

**Alternativas:** revisión estática o pruebas como `postgres` solamente son insuficientes.
No introducir framework E2E móvil o carga k6 en ausencia de un flujo UI/backend de negocio;
E2E HTTP de esta fundación sí es obligatorio.

Fuentes: [pruebas locales](https://supabase.com/docs/guides/local-development/testing/overview),
[pgTAP y RLS](https://supabase.com/docs/guides/database/postgres/testing-row-level-security),
[referencia CLI](https://supabase.com/docs/reference/cli/introduction).

## Resolución y pendientes operativos

No quedan dudas de permisos/alcance que obliguen a cambiar spec. Antes de preparar el remoto
se necesita organización, región, nombre, responsable y autorización de creación/costo.
Disponibilidad de herramientas, major remoto, parches/digests efectivos y conectividad se
verifican en implementación; no son resultados de esta investigación. El plan debe aprobarse
antes de generar tareas. Los riesgos npm siguen abiertos.
