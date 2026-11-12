# Validation — 002

Todo lo siguiente es aceptación **prevista**. Ninguna prueba SQL, Auth, Edge, RLS,
concurrencia o despliegue fue ejecutada durante plan. Las comprobaciones nuevas de esta
fase son lectura/investigación, consultas npm y conservación documental.

## Niveles y condiciones de aprobación

| Grupo | Prueba prevista | Aprobación requerida |
| --- | --- | --- |
| V1 Reproducción | Dos stacks vacíos aislados, configuración/migraciones idénticas, nuevo remoto identificado y paridad | Cero diferencias no autorizadas; ninguna conexión anterior; resultados equivalentes |
| V2 Núcleos | Unitarias cliente/node:test y servidor/Deno.test con dobles | Éxito, inválidos, dependencia fallida, contexto propio; 100% ramas de validación/casos de uso nuevos, sin atribuir esa cobertura a SQL/HTTP |
| V3 PostgreSQL | pgTAP: tablas, FK/CHECK/UNIQUE, grants por columna, ACL funciones, RLS y helpers | Todos los asserts previstos ejecutados y aprobados; cero skipped/TODO; owner solo prepara fixtures |
| V4 Entradas reales | JWT reales Auth y llamadas HTTP a Edge/PostgREST, incluidos intentos directos | Todas las combinaciones obligatorias esperadas; cero filas/datos/mutaciones ajenas |
| V5 Atomicidad/carreras | Dos sesiones reales y fallos inducidos en stack descartable | Un perfil por identidad, pareja única, cero resultados parciales |
| V6 Arquitectura/calidad | Tipos cliente/core/servidor, lint/formato, checker ambos árboles y regresiones 001 | Exit 0; sin imports externos en núcleo ni rutas/consumidores que importen adaptadores |
| V7 Evidencia/secretos | Logs redactados, hashes, inventario y guía repetida | Sin secretos ni datos reales; cada FR/SC con resultado o pendiente; riesgos preservados |

Cobertura de núcleo nuevo medida por separado del núcleo foundation de 001. Deno coverage
y el runner Node deben delimitar archivos de dominio/aplicación; exclusiones justificadas,
no sumar porcentajes entre runtimes. No exigir cobertura artificial de tipos/interfaces.
Las 67/38/11 pruebas de 001 son antecedente, no conteos de pruebas ejecutadas en esta fase.

## Matriz real de acceso

Identidades sintéticas: admin A, admin B, barbero A, barbero B, cliente sin membresías,
persona compartida admin A/barbero B e inactivo A; además anónimo y sesión inválida.
Cada fila aplica a ambos tenants donde corresponda y prueba éxito y denegación:

| Operación | Casos permitidos | Casos negativos obligatorios |
| --- | --- | --- |
| Ensure perfil | Cada identidad verificada, creación y repetición | Anónimo/JWT inválido, actor alternativo y metadata de permisos |
| Leer/editar perfil | Titular, incluido sin membresía o inactivo | Otro usuario y admin compañero; cambiar id, INSERT/DELETE directo, editar campos no concedidos |
| Crear barbería | Cada autenticado con perfil; primer admin propio | Falta de perfil, nombre vacío, suplantación, actor inexistente, fallo de membresía y RPC directa ordinaria |
| Consultar A/B | Miembros activos de ese tenant | Cliente, inactivo, miembro solo del otro tenant, anónimo/JWT inválido |
| Renombrar A/B | Admin activo propio; compartido solo en A | Barbero propio, compartido en B, admin ajeno, inactivo, cambio de ID |
| Consultar membresías propias | Todas las propias incluidas inactive | Sustituir user_id no revela ajenas; no hay join a perfiles |
| Listar membresías del tenant | Admin activo de ese tenant | Barbero/no miembro/inactivo/admin ajeno mediante RPC de listado; tabla directa solo permite propias o listado autorizado |
| Escribir otras membresías | Solo montaje controlado de fixtures | Todo usuario ordinario, incluido admin: alta, rol, estado, DELETE y cambio de FK |

Generar listado de casos con IDs estables (por ejemplo `RLS-profile-other-admin`,
`RLS-shop-B-shared-barber`, `AUTH-forged-actor`, `RPC-user-denied`) y resultado esperado antes
de ejecutarlos; contar denominador y resultados reales. No declarar «100%» sobre una muestra
que omita combinaciones obligatorias. Toda denegación verifica también ausencia de cambios.
Una tabla RLS puede ocultar filas sin lanzar error: comparar filas/devueltos y estado persistido.

## PostgreSQL, RLS y privilegios

Suites previstas en `supabase/tests/`:

- `schema.test.sql`: tres tablas propias, campos mínimos, FKs, pareja única, CHECK, índices,
  RLS habilitada y schema private no expuesto. Inspección de owners/grants/EXECUTE/search_path.
- `profiles.test.sql`: propiedad, edición por columnas, no suplantación, cero acceso de admin
  compañero, aprovisionamiento idempotente y ausencia de identidad arbitraria.
- `tenants.test.sql`: A/B, roles cruzados, inactivo, mínimo listado y ausencia de mutaciones
  de membresías ordinarias. Cambiar fixture a inactive, commit y siguiente request con mismo JWT.
- `provisioning.test.sql`: wrappers privilegiados denegados a anon/authenticated, constraints,
  error intermedio y rollback; no conceder al cliente acceso al schema privado.

SET LOCAL ROLE y claims sintéticos son instrumentos del runner SQL dentro de transacción;
no se permite a solicitudes de usuarios establecer contexto arbitrario. Las pruebas como
postgres/service_role solo acreditan restricciones y montaje, **no RLS**. Acompañar los casos
SQL de V4 con JWT realmente emitidos/verificados por Auth.

## Entradas, errores y concurrencia

- Validar token ausente, alterado, expirado, de otro proyecto y válido; metadata con rol
  inventado no concede autoridad. Repetir intentos con body userId/actorId/role/status.
- Separar cliente público y transporte privilegiado: usuarios no ejecutan RPC de alta aunque
  conozcan su nombre; servicio no recibe actor del JSON original ni JWT de usuario mezclado.
- Probar respuestas sin datos, fallo de Auth, timeout/error PostgREST y error interno:
  sin éxito inventado, sin stack/secretos/perfiles filtrados; error estable del contrato.
- **C1:** dos peticiones ensure-profile del mismo actor, sincronizadas: una fila al terminar,
  identidad inmutable y resultados coherentes; no sobrescribir datos del ganador.
- **C2:** dos sesiones PostgreSQL intentan la misma pareja membership con barrera de inicio:
  como máximo una confirmada y la otra rechazada por UNIQUE. Preparación privilegiada de
  fixture; no crear una API ordinaria de personal para poder probarlo.
- **C3:** inducir excepción después de insertar barbería, al insertar primera membresía:
  cero barberías/membresías parciales. Usar trigger de fallo **solo de test**, rollback en
  pgTAP; para prueba HTTP entre conexiones, instalarlo temporalmente en stack descartable y
  retirarlo con finally. Nunca agregar el trigger a migraciones de aplicación.
- **C4:** dos altas válidas independientes por el mismo usuario pueden crear dos negocios;
  cada uno con un único admin inicial correcto. No exigir deduplicación no especificada.
- Cada sesión/proceso tiene timeout, resultado/exit code y cleanup propio. Dos llamadas
  secuenciales o mocks no acreditan una carrera. No declarar validada concurrencia de reservas.

## Controles y comandos previstos

[quickstart.md](quickstart.md) contiene comandos PowerShell. Se conservará `npm run check`
y sus controles, incorporando pruebas cliente nuevas sin omitir 001. Añadir explícitamente
check/test/core estricto de servidor y auditoría AST del árbol `supabase/functions/` con
alias, reexportaciones, imports de tipos, tránsito, ciclos y análisis incompleto. El checker
actual de src no cubre servidor. Mantener regresiones existentes, no debilitar reglas.

`supabase db lint --fail-on warning`, advisors y catálogo efectivo complementan pgTAP; no
sustituyen la matriz. Medir consultas indexadas/helper con EXPLAIN y dataset sintético,
registrando volumen y tiempos; no presentar esa observación como prueba k6 o escalabilidad
de producción. Reservas, k6, caché, CI/CD y DNS/CDN conservan pendientes de producto/rúbrica.

## Trazabilidad de requisitos

| FR | Decisión/contrato | Evidencia de implementación prevista |
| --- | --- | --- |
| FR-001 | Destino nuevo e inequívoco | V1: referencia nueva y guard de destino |
| FR-002 | Config/migraciones versionadas | V1: dos preparaciones vacías y paridad |
| FR-003 | Copia controlada y hashes | V7: inventario/diff e historial conservados |
| FR-004 | VerifiedActor desde Auth | V4: JWT y body/metadata adversarios |
| FR-005 | EnsureOwnProfile + PK/FK | V2–V5: idempotencia, actor y carrera C1 |
| FR-006 | Perfil propio editable | V3–V4: leer/PATCH propio, null y validación |
| FR-007 | Propiedad y grants columna | V3–V4: perfiles ajenos, cambios id/permisos |
| FR-008 | CreateOwnBarbershop | V2–V4: alta propia de cada autenticado |
| FR-009 | RPC atómica + UNIQUE | V3–V5: rollback C3, C2/C4 |
| FR-010 | RLS miembro/admin activo | V3–V4: consultar/renombrar A/B y campos inmutables |
| FR-011 | Membership contextual | V3–V5: estados/roles/FK/pareja y compartido |
| FR-012 | Listados propios/contextuales | V3–V4: proyección mínima y sin perfil ajeno |
| FR-013 | Sin gestión de personal | V3–V4: toda escritura ordinaria denegada |
| FR-014 | Membresía vigente por solicitud | V3–V4: revocación tras commit sin renovar JWT |
| FR-015 | ACL/RLS + integridad | V3–V5: anon, relación manipulada y consultas directas |
| FR-016 | Secretos/EXECUTE/search_path | V3/V4/V7: catálogo, límites de servicio y logs |
| FR-017 | Puertos y dos composiciones | V2/V6: aislamiento de núcleos y AST ambos árboles |
| FR-018 | PostgreSQL/HTTP reales | V3–V5: comandos, casos y códigos de salida |
| FR-019 | Runner consumidor y 001 preservada | V4/V6: flujos mínimos y regresiones |
| FR-020 | Estado, riesgos, trazabilidad | V7: informe, FR/SC y riesgo npm sin cierre falso |

| SC | Verificación de resultado prevista |
| --- | --- |
| SC-001 | V1 + hashes V7; dos entornos vacíos y proyecto nuevo separado |
| SC-002 | Todos los casos de perfiles V2–V5, cero accesos ajenos |
| SC-003 | Altas correctas, C1–C4 y fallos sin resultados parciales |
| SC-004 | Matriz V3–V5 completa, denominador explícito, cero resultados indebidos |
| SC-005 | V4 + privilegios/secretos V3/V7, actor real preservado |
| SC-006 | Otra persona sigue quickstart; FR con resultado o pendiente e informe |

## Registro de evidencia futura y límites

Un informe compacto en `docs/evaluacion/evidencias/002-fundacion/` enlazará logs necesarios
de reproducción, SQL y HTTP/concurrencia. Cada ejecución incluye fecha, commit/estado Git,
versiones efectivas, destino no secreto, comando, exit code, casos y limitaciones. No guardar
respuestas de Auth, claves, dump de environment ni teléfonos. Una evidencia reutilizada de
001 se etiqueta como tal; no afirmar Android, Google, arranque offline o backend probado
por documentación. Sin cambios UI no corresponde repetir TalkBack/texto ampliado de 001.

Riesgo npm: nueve moderadas históricas; consulta de planificación ocho totales/tres sin dev,
sin remediación ni aceptación acreditadas. No bloquear silenciosamente ni declarar superada
una auditoría; análisis detallado en [research.md](research.md#riesgo-npm-consulta-real).
