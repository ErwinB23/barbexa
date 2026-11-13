# Aprovisionamiento de barberías — T024–T027

13/11/2026, main/2f37266. Se conservaron cambios T020–T023 y el log activo t017-serve.log.
Sin commit/push, remoto, nuevas dependencias, reset ni comandos de ciclo de vida de contenedores.
Skills aplicadas: Spec Kit, TDD, Supabase/Postgres y depuración sistemática.

## Implementación y estado

T024, T025, T026 y T027 completadas en orden de dependencias.

- T024: migración generada por CLI `20261113050232_create_own_barbershop.sql`, aplicada solo
  en app-barberia-002-local:54422. Wrapper public SECURITY INVOKER y función privada
  SECURITY DEFINER con search_path vacío y nombres calificados; PUBLIC/anon/authenticated
  sin EXECUTE, servicio con ejecución restringida. Revalida identidad Auth no anónima,
  perfil existente y nombre. Genera IDs y ejecuta ambos INSERT en una sola RPC/transacción;
  no captura el error para convertirlo en éxito ni deduplica negocios por nombre.
- T025: adaptación RPC/DTO/error de PostgreSQL, create-barbershop-handler, composición y
  entrypoint. Reutiliza los límites explícitos del handler de perfiles: JWT/Auth, body solo
  name, máximo 8 KiB, JSON estricto, métodos/CORS, correlación y logs sin body/tokens.
  PROFILE_REQUIRED se traduce a 409; errores internos SQL no se entregan al consumidor.
  create-barbershop.enabled=true y verify_jwt=true; el proceso functions serve activo
  recargó las fuentes/configuración, sin reiniciarlo por orden del agente.
- T026: transporte cliente y composición con alta por Edge y GET/PATCH por PostgREST,
  proyección id/name y JWT propio. Cero filas implica ausencia/no disponible. Tras fallo de
  dependencia/timeout no repite POST: consulta relaciones propias y, si logra validarlas,
  las adjunta como `FoundationError.reconciliation`. Sigue siendo error, no alta confirmada;
  el consumidor debe reconciliar explícitamente y no inferir cuál alta ganó desde una lista
  ambigua. No añade casos públicos de listado administrativo pertenecientes a tareas futuras.
- T027: integración Auth/Edge/PostgREST con cliente compilado real y carreras en
  tests/integration/tenant-foundation/concurrency.mjs. Preparación privilegiada separada;
  solo usuarios/tenants sintéticos creados en esta ejecución se retiran en finally.

## Evidencia ejecutada

| Grupo | Resultado final | Registro |
| --- | --- | --- |
| RED SQL previo | 10/10 fallos por RPC ausente, exit 1 | t024-t027-provisioning-red.log |
| migration new / up | exit 0, destino local 54422 | t024-t027-new.log / t024-t027-apply.log |
| SQL tras implementar | 187/187 originales, exit 0 | t024-sql-inicial.log |
| SQL ampliado ACL/actor/perfil | 193/193, exit 0 | t024-t027-all.log |
| lint / advisors SQL | exit 0, sin hallazgos | t024-t027-lint.log / t024-t027-advisors.log |
| unitarias cliente | 80/80, exit 0 | t027-unit.log |
| servidor Deno | 17/17, exit 0 | t027-server.log |
| US3 HTTP/C2/C3/C4 | 7 resultados TAP (6 subcasos y padre), exit 0 | t027-http-verificacion.log |
| perfiles HTTP regresión | 8 resultados TAP, exit 0 | t027-perfiles-regresion.log |
| tipos, Deno check, AST ambos árboles | exit 0 | t027-types/core/server-core/server-check/arch-client/arch-server.log |
| check general | npm run check exit 0 | t027-check.log |

El check general es resultado nuevo, no heredado: ahora existen los dos entrypoints y se
ejecutaron también las 38 regresiones AST cliente, 45 servidor, 11 presentación y 18 del
runner seguro. Deno 2.9.8 se añadió solo al PATH del proceso de verificación; no se modificó
el PATH del usuario ni la política PowerShell. Cobertura de núcleo cliente/servidor: 100 %
líneas/funciones/ramas por runtime, sin atribuirla a SQL, HTTP ni interfaz.

T025 y T026 tuvieron RED antes de implementar (t025-red.log y t026-red.log). Primera
compilación cliente detectó el payload HTTP desconocido; se añadió tipado local del DTO
de error, sin tipos externos en núcleo. Lint detectó imports duplicados; se consolidaron,
manteniendo max-warnings=0. t025-t026-client.log y t027-lint.log conservan esos fallos.

## Atomicidad y concurrencia acreditadas

- **C2:** dos procesos psql reales, misma pareja user/shop. Una tercera conexión mantiene
  el lock de barrera; se comprueba que ambos procesos esperan antes de liberarla. Resultado:
  uno confirma (exit 0), otro falla (exit 3, SQLSTATE 23505) y persiste una sola relación.
  Cada grupo tiene application_name único; finally termina solo sus sesiones de test.
- **C3 SQL:** trigger de prueba dentro de rollback provoca fallo de la primera membresía y
  verifica que los conteos no aumentan. Los diez RED originales quedaron resueltos.
- **C3 HTTP:** trigger temporal limitado al user_id sintético C, nunca en migraciones, induce
  fallo real de RPC. HTTP devuelve 500; cero incremento de barberías/membresías. Se retiran
  trigger/función en finally. El servicio no expone el mensaje SQL de fallo al cliente.
- **C4:** dos altas HTTP concurrentes e independientes del mismo actor/nombre producen dos
  IDs distintos. Se comprueba en PostgreSQL exactamente una membresía administrator/active
  propia por cada barbería, no solo el contenido de las respuestas.

Resumen sin secretos: t027-carreras.json. No son pruebas de concurrencia de reservas.
Otros casos: falta de perfil, primer admin propio, ningún acceso automático a otro negocio,
renombre por admin propio, usuario compartido admin A/barbero B sin poder renombrar B,
suplantación por body y RPC directa ordinaria denegadas. No se declara aislamiento integral:
la matriz de membresías/revocación/listado de T028 y posteriores sigue pendiente.

## Fallos de arnés conservados

La primera integración devolvió SUBPROCESS_FAILED: el runner no publica stdout privado al
fallar. Diagnóstico redactado en t027-diagnostico.log: SQL del conteo truncado por comillas
de JavaScript y etiqueta C2 situada después de la consulta que esperaba. Se corrigieron
las cadenas y la posición de la etiqueta; se añadió limpieza identificada de backends.
Después, t027-diagnostico-2.log mostró un único fallo: se esperaba exit 1 cuando psql
ON_ERROR_STOP devuelve exit 3 por error SQL. Se corrigió el código esperado, manteniendo
dos sesiones esperando, un solo commit y SQLSTATE 23505. No se debilitó la restricción ni
se presentaron esos intentos como aprobados. Un error inicial de sintaxis del archivo de
carrera se corrigió antes de ejecutarlo; no se alteraron reglas SQL para satisfacer pruebas.

## Conservación, operación y límites

Guards previos verificaron contenedor, DB 54422, red/volumen propios y metadatos de los 12
contenedores antiguos. t027-conservacion.json confirma esos metadatos y siete servicios
nuevos ajenos a Edge preservados; Edge running con verifyJWT=true efectivo en ambas rutas.
Sin lectura SQL ni operaciones sobre bases antiguas. No es checksum lógico de datos antiguos.
Conteos finales: cero perfiles/usuarios/barberías/membresías, triggers/funciones de fallo y
backends de carrera. El log activo se conserva sin editarlo ni agregarlo a staging.

Reproducción, desde raíz y con stack/Edge nuevos ya operativos:

```powershell
$env:BARBERIA_002_URL = 'http://127.0.0.1:54421'
$env:BARBERIA_002_PROJECT_ID = 'app-barberia-002-local'
node scripts/run-backend-integration.mjs --barbershops
```

El runner sin selector conserva el gate de authorization.test.mjs futuro. La sesión Edge
activa no necesita arrancarse dos veces. Sin UI nueva, pruebas Android atribuidas a Codex,
T028–T040, Supabase Cloud ni cambios en Constitución/rúbrica/001. Nueve avisos npm moderados
persisten sin remediación; advisors/check green no equivalen a auditoría de seguridad aprobada.
Pruebas negativas de JWT externo siguen usando fixtures, no otro proyecto real, como en T019.

Fuentes consultadas: [funciones PostgreSQL 17](https://www.postgresql.org/docs/17/sql-createfunction.html),
[changelog Supabase](https://supabase.com/changelog.md). No se actualizaron versiones.

Cierre Git: diff global exit 2 exclusivamente por espacios finales generados en t017-serve.log;
el diff de implementaci?n excluyendo solo ese log activo da exit 0. Registro t027-diff-check.log.
No se edit? ni agreg? a staging el log, ni se detuvo su proceso. Revisi?n de 98 archivos
candidatos acumulados sin hallazgos de secretos. main/2f37266 conservados; cambios sin commit.
