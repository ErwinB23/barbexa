# Tasks: Fundación Supabase y aislamiento multitenant

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contratos](contracts/backend-foundation.md),
[quickstart.md](quickstart.md) y [validation.md](validation.md).

**Contexto**: Constitución 1.0.1; rama `main`, HEAD observado `e0141cb`.
**Estado**: lista generada el 2026-11-11; **ninguna tarea ejecutada**. Las cuatro historias
son P1. Sus dependencias técnicas no permiten implementarlas todas simultáneamente.

## Formato, evidencia y límites

- Formato Spec Kit: `- [ ] Tnnn [P?] [USn?] descripción con ruta`.
- `[P]` permite trabajo paralelo únicamente después de cumplir las dependencias indicadas,
  en archivos distintos. No autoriza ejecutar migraciones, fixtures o resets concurrentemente.
  Consolidar el informe compartido secuencialmente al reunir los resultados paralelos.
- **AUTO**: implementación/verificación automatizada. **MANUAL**: comprobación del responsable
  o revisor. **EXTERNA**: operación del nuevo entorno alojado. **APROBACIÓN**: decisión explícita
  del responsable, nunca inferida de silencio. Una tarea puede combinar comprobaciones de
  su mismo entregable; debe registrar su origen por separado.
- Antes de marcar `[x]`, registrar archivos, fecha, entorno/versiones, comando, exit code,
  casos/resultados y límites en `docs/evaluacion/evidencias/002-fundacion/informe.md` y los
  registros específicos indicados. Registrar RED antes de implementar comportamiento faltante
  y GREEN después; una suite que ya cubre comportamiento existente puede pasar sin RED nuevo.
  No romper código correcto para fabricar un fallo. Un error de entorno no acredita el RED.
- Los `<timestamp>` de rutas SQL son el prefijo real generado por `supabase migration new`;
  registrar el nombre completo efectivo antes de aplicar. No inventar timestamps ni editar
  migraciones ya aplicadas. Cada tabla nace con RLS y grants revocados en su primera transacción;
  habilitar permisos de cada incremento antes de exponer su operación, sin ventanas de acceso.
- Secretos fuera del repositorio/logs/Expo. Preparación privilegiada de fixtures separada de
  solicitudes ordinarias; los tests como owner/service_role no prueban RLS. Sin acceso al backend
  anterior. Sin API Node, SDK npm nuevo, pantallas completas, reservas ni gestión real de personal.
- Cada incremento debe pasar tipos, lint, formato y pruebas aplicables. Hasta que exista el
  núcleo servidor real son esperables EMPTY_CORE/ausencia de inputs; documentarlos sin crear
  módulos ficticios ni desactivar controles. La auditoría completa de ambos árboles es T033.
- Crear esta lista no autoriza instalaciones, conexiones ni despliegues ahora. Su ejecución
  será objeto de solicitudes posteriores; T036 es además una barrera explícita para el remoto.

## Fase 1 — Setup: conservación, riesgo y herramientas (3 tareas)

**Objetivo**: preparar ejecución local verificable sin perder 001 ni documentos 002.

- [x] T001 AUTO: registrar rama/HEAD/status y SHA-256 de archivos existentes, incluidos los ocho documentos 002 sin seguimiento, en `docs/evaluacion/evidencias/002-fundacion/inventario-inicial.json`; iniciar `docs/evaluacion/evidencias/002-fundacion/informe.md` con la lista de cambios autorizados. **Dep.: ninguna.** Cierre: inventario excluye `.git`, node_modules y artefactos regenerables, conserva archivos fuente/documentales y distingue cambios previos de incorporaciones futuras; ninguna limpieza, commit o sobrescritura.
- [x] T002 [P] AUTO: analizar riesgo antes de incorporar dependencias en `docs/evaluacion/evidencias/002-fundacion/riesgo-npm.md`, contrastando `package.json`, `package-lock.json` y research; consultar `npm.cmd audit --json`, `npm.cmd audit --omit=dev --json` y cadenas afectadas cuando se autorice ejecutar esta tarea. **Dep.: T001.** Cierre: distinguir directo/transitivo, tooling/producción y alcanzabilidad; conservar 9 moderadas históricas frente a 8 totales/3 sin dev del último reporte, comandos/exit codes y acciones pendientes. Sin fix, downgrade, nuevas dependencias o auditoría aprobada; un fallo del registry queda como bloqueo del análisis, no como resultado limpio.
- [x] T003 [P] AUTO/MANUAL: comprobar herramientas y, durante implementación autorizada, preparar solo las necesarias según plan en `docs/evaluacion/evidencias/002-fundacion/herramientas.md`: Node/npm existentes, CLI 3.1.0 con checksum oficial, Deno 2.9.8 y Docker Desktop/WSL2 Linux. **Dep.: T001.** Cierre: versiones, ayuda real CLI, motor Docker operativo, puertos y disponibilidad de PostgreSQL 17 registrados; no añadir herramientas al package de Expo, cambiar política PowerShell ni actualizar versiones silenciosamente. Si una instalación necesita intervención/elevación, registrar y esperar la autorización correspondiente.

**Checkpoint**: baseline y herramientas acreditados; el análisis npm informa los siguientes
pasos sin afirmar remediación. T002 y T003 solo comparten lectura del proyecto, no archivos de salida.

## Fase 2 — Foundational: controles y runner seguro (4 tareas)

**Objetivo**: disponer de controles de arquitectura y un consumidor de prueba que no pueda
confundir preparación privilegiada con acceso de usuario. Bloquea los incrementos funcionales.

- [x] T004 AUTO: escribir primero `tests/architecture/check-server-architecture.test.mjs` y `tests/architecture/server-fixtures/cases.mjs`, registrando RED del checker servidor aún ausente. **Dep.: T002, T003.** Cierre: casos válidos/invalidos para dominio, aplicación, infraestructura, handler, index/composición; imports externos, alias, type imports, reexports, tránsito, ciclos, cruces a src, referencias irresolubles, análisis incompleto y núcleo vacío. No modificar ni debilitar las 38 regresiones cliente existentes.
- [x] T005 AUTO: implementar `scripts/check-server-architecture.mjs` con TypeScript Compiler API y resolver configuración/rutas reales del servidor. **Dep.: T004.** Cierre: fixtures T004 GREEN, infracciones con archivo/dependencia/regla y exit distinto de cero; index solo entrada/composición, presentación → aplicación/dominio, infraestructura → puertos/núcleo, aplicación → dominio, composición → concreciones. Reutilizar lógica existente cuando sea viable sin alterar sus garantías; registrar límites del núcleo todavía ausente.
- [x] T006 AUTO: configurar `tsconfig.server-core.json` y `supabase/functions/deno.json`; ampliar selectivamente `package.json`, `eslint.config.js`, `.prettierignore`, `.gitignore` y, si hace falta para incluir nuevos tests, `scripts/run-unit-tests.mjs`/`tsconfig.tests.json`. **Dep.: T005.** Cierre: núcleo servidor strict/noEmit/lib ES2022/types vacíos/resolución Bundler/allowImportingTsExtensions, comprobación Deno del resto, lint/formato TS/JSON/MJS y cobertura separada Node/Deno; conservar controles 001 y detener cadenas ante errores. No instalar plugins para SQL, excluir evidencia, reformatear docs/skills ni tratar EMPTY_CORE/TS18003 como aprobación.
- [x] T007 AUTO: preparar con pruebas primero `tests/integration/tenant-foundation/environment.test.mjs`, `tests/integration/tenant-foundation/fixtures.mjs` y la base de `scripts/run-backend-integration.mjs`. **Dep.: T006.** Cierre: guard de destino permite solo loopback en operaciones destructivas, rechaza remoto/entorno no identificado; claves/passwords de prueba en memoria o archivo privado externo, logs redactados, timeouts/exit codes y cleanup de recursos propios. La preparación administrativa local queda separada del cliente público; el runner consumirá su composición cuando exista, sin inventar módulos ahora.

**Checkpoint**: controles verificables; los fallos esperados por falta de núcleo están
documentados. Ninguna prueba de fixtures ni mock se presenta como integración PostgreSQL.

Precisiones de ejecución: T006 debe extender las allowlists solo a código/configuración nuevos,
ignorar temporales de Supabase y cobertura sin ocultar migraciones/tests/evidencias, y medir
las ramas nuevas separadamente sin rebajar umbrales de 001. `tsconfig.core.json` ya incluye
dominio/aplicación de todas las features. El runner unitario existente elimina `.test-build`
al terminar: T007 debe preparar compilación cliente con TypeScript existente en salida temporal
propia, y T018 demostrar su consumo real por Node. No depender de esa carpeta ya eliminada
ni quitar extensiones indiscriminadamente; conservar compatibilidad Metro/Node y cleanup seguro.

## Fase 3 — US1: backend independiente y reproducible (P1; 4 tareas)

**Objetivo**: iniciar el stack nuevo local, modelo mínimo cerrado por defecto y una guía
ejecutable. La creación remota y reproducción integral se validan transversalmente al final.

**Prueba independiente**: aplicar el modelo desde cero en el stack exclusivo, inspeccionar
catálogo/ACL y comprobar que no hay exposición accidental antes de entregar operaciones.

- [x] T008 [US1] AUTO: generar configuración en una carpeta temporal, comprobar colisiones e incorporar únicamente `supabase/config.toml` nuevo. **Dep.: T007.** Cierre: project_id `app-barberia-002-local`, major 17, API solo public/private excluido, seed y sign-in anónimo desactivados, verify_jwt=true previsto para ambas entradas; stack local iniciado y versiones/parches/imágenes/digests registrados en `docs/evaluacion/evidencias/002-fundacion/local.md`. Detenerse ante colisiones no autorizadas; no enlazar un remoto.
- [x] T009 [US1] AUTO: crear `supabase/tests/schema.test.sql` y probar primero las expectativas faltantes sobre el stack vacío. **Dep.: T008.** Cierre: RED significativo de tablas/PK/FK/CHECK/UNIQUE/índices/grants/RLS ausentes, assertions y roles explícitos, sin errores de conexión confundidos con fallos esperados; fixtures transaccionales sintéticos sin datos reales.
- [x] T010 [US1] AUTO: crear por CLI `supabase/migrations/<timestamp>_foundation_model.sql` con las tres tablas de data-model. **Dep.: T009.** Cierre: `public.profiles`: `id uuid` PK/FK a auth.users, `display_name text` NOT NULL, `phone text` nullable y «nombre no vacío tras trim»; `public.barbershops`: `id uuid` generado y `name text` NOT NULL, «ID inmutable; nombre no es UNIQUE»; `public.barbershop_memberships`: UUID PK, user_id FK a profiles y barbershop_id FK a barbershops, role/status text NOT NULL, «UNIQUE(user_id, barbershop_id); CHECK role en barber/administrator y status en active/inactive». Borrado restrictivo, índice `(barbershop_id, user_id)`, sin owner_id/roles globales/timestamps extra. RLS habilitada y grants implícitos de tablas revocados antes del primer commit SQL; no modificar el esquema administrado Auth.
- [x] T011 [US1] AUTO: aplicar el modelo en el stack descartable con `supabase db reset --no-seed`, ejecutar schema.test.sql, migration list, db lint y advisors; registrar resultados en `docs/evaluacion/evidencias/002-fundacion/local.md` y ajustar solo instrucciones necesarias de `specs/002-fundacion-supabase-multitenant/quickstart.md` al comportamiento comprobado. **Dep.: T010.** Cierre: catálogo coincide, tablas denegadas por defecto y restricciones/índices acreditados, cero exposición temporal; revisar hallazgos de advisors sin equiparar exit 0 a seguridad aprobada. No reset remoto ni reescritura de migraciones aplicadas.

**Checkpoint**: infraestructura local validada para continuar. No cerrar todavía SC-001 ni
FR-001 por tener un stack local: US1 completa requiere reproducción T035 y remoto T036–T038.

## Fase 4 — US2: perfil propio e identidad verificada (P1; 8 tareas)

**Objetivo**: aprovisionamiento idempotente y lectura/edición propias, con identidad de Auth
y sin acceso a perfiles de compañeros. No necesita barberías para su aceptación independiente.

**Prueba independiente**: dos identidades Auth reales; perfil único, edición propia, acceso
ajeno denegado, payload de suplantación rechazado y carrera C1 con una sola fila.

- [x] T012 [P] [US2] AUTO: escribir pruebas anticipadas en `tests/unit/tenant-foundation/profiles.test.ts` y `tests/server/tenant-foundation/profiles.test.ts`. **Dep.: T011.** Cierre: casos propios de EnsureOwnProfile/GetOwnProfile/UpdateOwnProfile y puerto servidor; éxito, ausencia, inválidos, fallo del adaptador, identidad verificada, idempotencia y errores HTTP. Registrar RED de comportamiento aún no implementado; los dobles no acreditan seguridad de Auth/RLS.
- [x] T013 [P] [US2] AUTO: escribir `supabase/tests/profiles.test.sql` y `tests/integration/tenant-foundation/profiles.test.mjs` antes de habilitar acceso. **Dep.: T011.** Cierre: pruebas de propiedad/columnas, PK/FK, anonimato, perfiles ajenos, prohibición INSERT/DELETE directo, EXECUTE de RPC de aprovisionamiento y casos JWT/body/metadata de validation. Preparar expectations y RED por capacidades faltantes; las solicitudes ordinarias nunca usan el secreto del montaje.
- [x] T014 [US2] AUTO: implementar tipos/validación/errores propios en `src/features/tenant-foundation/domain/types.ts`, `src/features/tenant-foundation/domain/validation.ts` y equivalentes independientes en `supabase/functions/_shared/tenant-foundation/domain/`; crear `application/tenant-foundation-gateway.ts` y `application/profiles.ts` del cliente, y `application/foundation-provisioning-gateway.ts`/`application/ensure-own-profile.ts` del servidor. **Dep.: T012.** Cierre: nombres no vacíos tras trim; «Teléfono omitido/null es opcional; texto vacío se normaliza a null. PATCH omitido conserva el valor; null lo retira»; PATCH con al menos un campo. No SDK/HTTP/SQL/React/globals Node-Deno en núcleo, imports cruzados cliente/servidor ni stubs para operaciones futuras.
- [x] T015 [US2] AUTO: crear por CLI `supabase/migrations/<timestamp>_profile_access_and_provisioning.sql`. **Dep.: T013, T014.** Cierre: SELECT de perfil propio, UPDATE solo display_name/phone con USING/WITH CHECK; RPC public.ensure_own_profile SECURITY INVOKER → private.ensure_own_profile privilegiada, actor existente y PK idempotente sin sobrescribir perfil existente. EXECUTE solo service_role para wrapper/implementación, search_path vacío, nombres calificados y revocación PUBLIC en la misma transacción; sin INSERT/DELETE ordinario ni acceso directo service_role a tablas propias.
- [x] T016 [US2] AUTO: implementar y probar `supabase/functions/_shared/tenant-foundation/infrastructure/auth-verification-adapter.ts` y `postgres-foundation-adapter.ts`. **Dep.: T014, T015.** Cierre: Auth verifica Bearer mediante `/auth/v1/user`, rechaza identidad anónima/inválida y convierte a VerifiedActor; transporte de servicio separado para ensure RPC, sin mezclar JWT de usuario y credencial privilegiada. Traducción de DTO/errores, timeout y compatibilidad local de claves verificados con dobles antes de integración.
- [x] T017 [US2] AUTO: implementar `supabase/functions/_shared/tenant-foundation/presentation/ensure-profile-handler.ts`, `composition.ts` del módulo y `supabase/functions/ensure-profile/index.ts`. **Dep.: T016.** Cierre: caso de uso por composición, actor desde Auth y nunca body/metadata, JSON/campos extra/tipos inválidos rechazados, límite 8 KiB/413, métodos/405 y CORS/OPTIONS explícitos; verify_jwt=true sin bypass. Respuestas/errores del contrato, correlación y logs sin tokens/body/teléfono; tests de handler con entrada inválida, proveedor fallido y éxito.
- [x] T018 [US2] AUTO: implementar perfil en `src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts` y `src/composition/tenant-foundation-composition.ts`; conectar esos casos al runner y `tests/integration/tenant-foundation/profiles.test.mjs`. **Dep.: T014, T017.** Cierre: ensure por Edge; lectura/PATCH por PostgREST con token público inyectado y proyección mínima; normalización de datos/errores y cero filas como ausencia, no falso éxito. Composición consumida realmente, sin secreto/SDK/sesión global ni pantallas nuevas.
- [x] T019 [US2] AUTO: ejecutar pruebas perfil SQL, unitarias, handler/contratos e integración Auth/Edge/PostgREST, incluida C1, y registrar `docs/evaluacion/evidencias/002-fundacion/perfiles.md`. **Dep.: T012, T013, T015, T017, T018.** Cierre: JWT emitidos por Auth; token ausente/alterado/expirado/de otro entorno, body/metadata adversarios, actor arbitrario y perfiles ajenos rechazados, incluida identidad que será admin compañera; dos ensure simultáneos dejan una sola fila sin sobrescribir datos. Tipos/lint/formato/controles aplicables pasan; registrar cobertura real separada y límites.

## Fase 5 — US3: barbería y primer administrador atómicos (P1; 8 tareas)

**Objetivo**: cualquier autenticado con perfil crea su establecimiento y primera membresía;
permite consultar/renombrar solo según permisos contextuales. Depende de identidad/perfil US2.

**Prueba independiente**: alta propia, admin activo correcto, lecturas/edición propias y
denegación a terceros; fallo de membresía revierte toda creación, sin huérfanos.

- [x] T020 [P] [US3] AUTO: escribir pruebas anticipadas en `tests/unit/tenant-foundation/barbershops.test.ts` y `tests/server/tenant-foundation/barbershops.test.ts`. **Dep.: T019.** Cierre: CreateOwnBarbershop/GetBarbershop/RenameBarbershop y CreateOwnBarbershop servidor; nombre inválido, PROFILE_REQUIRED, actor alternativo rechazado, fallo de persistencia, cero filas y timeout sin reintento automático; RED del comportamiento faltante.
- [x] T021 [P] [US3] AUTO: crear `supabase/tests/provisioning.test.sql`, iniciar `supabase/tests/tenants.test.sql` y `tests/integration/tenant-foundation/barbershops.test.mjs`, con expectativas antes de implementar. **Dep.: T019.** Cierre: primer admin propio, RPC directa denegada a anon/authenticated, consultas/renombre A/B según rol y rollback/C2/C3/C4 definidos; fallos inducidos solo en fixtures de stack descartable, nunca en migraciones de aplicación.
- [x] T022 [US3] AUTO: completar tipos propios de barbería/membresía y operaciones en `src/features/tenant-foundation/domain/types.ts`, `application/barbershops.ts`/`tenant-foundation-gateway.ts` y `supabase/functions/_shared/tenant-foundation/domain/types.ts`, `application/create-own-barbershop.ts`/`foundation-provisioning-gateway.ts`. **Dep.: T020.** Cierre: nombre no vacío tras trim, IDs/rol/estado validados; el cliente no determina actor ni primer rol; tipos públicos del contrato, puertos estrechos y GREEN de reglas/casos de uso con dobles.
- [x] T023 [US3] AUTO: crear por CLI `supabase/migrations/<timestamp>_tenant_context_access.sql` con helpers privados is_active_member/is_active_admin, SELECT de barbería por miembro activo, UPDATE solo name por admin activo y SELECT inicial de membresía propia. **Dep.: T021, T022.** Cierre: auth.uid y tablas vigentes, sin metadata; helpers SECURITY DEFINER booleanos sin actor alternativo, search_path vacío/objetos calificados, USAGE/EXECUTE mínimos y sin recursión/FORCE RLS que la reintroduzca; USING/WITH CHECK e IDs/FK inmutables. INSERT/UPDATE/DELETE ordinarios de membresías siguen revocados.
- [x] T024 [US3] AUTO: crear por CLI `supabase/migrations/<timestamp>_create_own_barbershop.sql` para wrapper invoker y función privada transaccional. **Dep.: T023.** Cierre: actor Auth/perfil existente y nombre revalidados; IDs generados, barbería + única primera membresía administrator/active confirmadas o revertidas juntas; EXECUTE solo servicio, PUBLIC/anon/authenticated revocados en misma transacción. Error intermedio no se convierte en éxito; múltiples negocios/nombres repetidos por usuario siguen permitidos.
- [x] T025 [US3] AUTO: ampliar `supabase/functions/_shared/tenant-foundation/infrastructure/postgres-foundation-adapter.ts` y `composition.ts`; implementar `presentation/create-barbershop-handler.ts` y `supabase/functions/create-barbershop/index.ts`. **Dep.: T022, T024.** Cierre: mismo límite de autenticación/errores/logs T017, body exclusivamente name; request verificado → caso de uso → puerto → RPC restringida, sin identidad alternativa, SDK en núcleo ni escritura dividida en requests.
- [x] T026 [US3] AUTO: conectar alta, consulta y renombre en `src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts`, `src/composition/tenant-foundation-composition.ts` y `tests/integration/tenant-foundation/barbershops.test.mjs`. **Dep.: T022, T025.** Cierre: alta por Edge, lecturas/PATCH por PostgREST con JWT usuario, campos permitidos, ausencia/denegación sin revelar existencia ajena; tras timeout reconciliar con relaciones propias sin retry automático. Conservar tests/navegación/solución Metro de 001.
- [x] T027 [US3] AUTO: ejecutar suites SQL/HTTP/unitarias de US3 y carreras con `tests/integration/tenant-foundation/concurrency.mjs`, registrando `docs/evaluacion/evidencias/002-fundacion/atomicidad.md`. **Dep.: T021, T024, T025, T026.** Cierre: C2 usa dos sesiones psql reales con barrera y UNIQUE rechaza duplicación; C3 induce fallo al insertar membresía y deja cero resultados parciales, también por HTTP cuando corresponda; C4 admite dos altas independientes correctas. Acreditar permisos de consulta/renombre de US3, ejecutar controles aplicables y retirar triggers/fixtures de fallo mediante finally; no declarar concurrencia de reservas.

## Fase 6 — US4: permisos separados entre barberías (P1; 6 tareas)

**Objetivo**: completar listados y probar aislamiento contextual, revocación y rechazo de
escalamiento. Cliente sigue siendo capacidad global de identidad, nunca rol profesional global.

**Prueba independiente**: fixture admin A/barbero B lee ambos, modifica/lista integrantes
solo en A y no accede a perfiles ajenos. Inactivar A revoca su siguiente operación allí sin
afectar B ni renovar JWT; nadie ordinario gestiona otras membresías.

- [x] T028 [P] [US4] AUTO: ampliar `supabase/tests/tenants.test.sql` con toda la matriz de validation antes de habilitar listados administrativos. **Dep.: T027.** Cierre: propios incluidas inactive, admin contextual, barbero, admin ajeno, compartido A/B, no miembro/anon, columnas mínimas, cero perfiles ajenos; escrituras directas de rol/status/user_id/barbershop_id y DELETE siempre denegadas a usuarios, también admins. Registrar RED de listado faltante y conservar pruebas ya verdes.
- [x] T029 [P] [US4] AUTO: escribir `tests/integration/tenant-foundation/authorization.test.mjs`, `tests/integration/tenant-foundation/cases.mjs` y `tests/unit/tenant-foundation/memberships.test.ts`. **Dep.: T027.** Cierre: IDs y expected results para cada combinación obligatoria, denominador explícito; pruebas de ListOwnMemberships/ListBarbershopMemberships, acceso directo que evade el cliente, metadata/body con privilegios falsos y transición inactive tras commit sin nuevo JWT. Casos denegados verifican también ausencia de mutaciones/datos ajenos.
- [x] T030 [US4] AUTO: crear por CLI `supabase/migrations/<timestamp>_membership_listing_access.sql`. **Dep.: T028.** Cierre: SELECT propio incluso inactive o admin activo del tenant; RPC list_barbershop_memberships SECURITY INVOKER concedida a authenticated exige admin activo actual antes de listar. Solo id/user_id/barbershop_id/role/status; no joins a perfiles. Sin membresías de cliente, rol global ni RPC genérica de personal; leer la relación propia del barbero no equivale a listar compañeros.
- [x] T031 [US4] AUTO: implementar `src/features/tenant-foundation/application/memberships.ts` y completar gateway, `infrastructure/tenant-foundation-http-adapter.ts` y `src/composition/tenant-foundation-composition.ts`. **Dep.: T029, T030.** Cierre: las ocho operaciones públicas del contrato están implementadas y consumidas por runner, sin stubs; propias por PostgREST y listado admin por RPC invoker con JWT usuario, proyecciones/errores propios, sin cachear roles/membresías ni acceder directamente a infraestructura desde presentación.
- [x] T032 [US4] AUTO: ejecutar matriz completa PostgreSQL/RLS y HTTP con JWT reales mediante `scripts/run-backend-integration.mjs`; registrar `docs/evaluacion/evidencias/002-fundacion/aislamiento.md`. **Dep.: T028, T029, T030, T031.** Cierre: admin/barbero A no obtiene datos privados B por IDs/filtros manipulados; compartido admin A/barbero B conserva permisos diferentes; inactivo no accede al tenant pero lee su relación; desactivación confirmada se refleja en siguiente request sin refresh. Rechazar RPC privilegiadas, altas/promoción/retiro ordinarios, perfiles de compañeros, body/metadata manipulados y sesiones inválidas; 100% de casos definidos ejecutados, sin skipped ni resultados indebidos.
- [x] T033 [US4] AUTO: auditar ambos árboles reales con `scripts/check-architecture.mjs`, `scripts/check-server-architecture.mjs`, `tsconfig.server-core.json` y comandos de calidad de quickstart; registrar `docs/evaluacion/evidencias/002-fundacion/calidad.md`. **Dep.: T019, T027, T032.** Cierre: npm run check, tsc core servidor, deno check/test y regresiones de arquitectura pasan con exit codes; núcleos independientes de Expo/React/Supabase/HTTP/SQL y sin importaciones transitivas externas ni cruces entre despliegues. Cobertura de ramas nuevas de validación/casos de uso al 100% según validation, separada Node/Deno y sin atribuirla a SQL/UI; conservar regresiones 001, medir conteos reales y no reciclar como nuevos 67/38/11.

## Fase 7 — Validación transversal, remoto y cierre (7 tareas)

**Objetivo**: acreditar el incremento completo y terminar US1 sin adelantar negocio futuro.
No repetir Android/TalkBack/texto ampliado si su interfaz no cambió; reutilizar evidencia 001
con atribución y límites. No prometer soporte web por ejecutar un runner Node.

- [ ] T034 AUTO: medir consultas/helpers con `tests/integration/tenant-foundation/query-plans.sql` y dataset sintético local; registrar `docs/evaluacion/evidencias/002-fundacion/consultas.md`. **Dep.: T033.** Cierre: volumen, EXPLAIN, tiempos, índices PK/FK/pareja/contexto y decisiones justificadas; no crear índices redundantes por intuición ni inventar SLO, equivalencia con k6 o escalabilidad de producción. Si hace falta corregir un índice aplicado, nueva migración revisada y regresiones afectadas.
- [ ] T035 AUTO/MANUAL: repetir `specs/002-fundacion-supabase-multitenant/quickstart.md` en segundo directorio temporal externo vacío, registrando `docs/evaluacion/evidencias/002-fundacion/reproduccion.md`. **Dep.: T034.** Cierre: snapshot incluye trabajo autorizado sin commit, hashes/CLI/runtime fijados, project_id/puertos/volumen distintos y ninguna base antigua; npm ci solo en copia si necesita dependencias del runner, sin tocar node_modules principal ni alterar lock. Repetir SQL/HTTP/carreras/calidad y comparar capacidades, no UUID/passwords aleatorios. Registrar ejecutor y reproducción de la guía por responsable/revisor para SC-006; no atribuir revisión humana a ejecución de Codex. Sin evidencia de guía repetida, dejar el criterio pendiente.
- [ ] T036 APROBACIÓN/MANUAL: preparar propuesta revisable en `docs/evaluacion/evidencias/002-fundacion/destino.md` con organización, nombre, región, responsable/costo, disponibilidad de PostgreSQL 17 y artefactos/configuración ya verificados; obtener aprobación explícita del usuario para crear y usar ese destino nuevo. **Dep.: T035.** Cierre: decisión y alcance registrados sin secretos. No solicitar aprobar un destino abstracto ni repetir autorización ya registrada; sin respuesta no crear ni conectar remoto. La decisión no bloquea trabajo local anterior.
- [ ] T037 EXTERNA: crear únicamente el nuevo proyecto Supabase aprobado y registrar su referencia no secreta y configuración base en `docs/evaluacion/evidencias/002-fundacion/destino.md`. **Dep.: T036.** Cierre: destino efectivo coincide con aprobación, está separado del anterior, major/parche y accesos operativos identificados; secretos bajo custodia privada y nunca EXPO_PUBLIC. Si PostgreSQL/versiones/costo difieren de lo aprobado, detener la parte afectada antes de cambiar decisiones; no importar datos/dumps del proyecto anterior.
- [ ] T038 EXTERNA/AUTO: desplegar solo configuración/migraciones revisadas y las dos funciones de `supabase/` en el destino T037; registrar paridad en `docs/evaluacion/evidencias/002-fundacion/remoto.md`. **Dep.: T037.** Cierre: CLI help/config diff/destino inspeccionados, remoto explícito y confirmación final antes de mutar, sin reset remoto/pull antiguo/prune. Comparar catálogo, ACL/RLS y flujos permitidos/denegados con identidades sintéticas autorizadas, documentando su preparación operativa separada; no habilitar runner destructivo local para remoto ni desplegar triggers de fallo/fixtures como migraciones. Registrar Auth/Edge/PostgreSQL efectivos y diferencias; local no sustituye esta evidencia.
- [ ] T039 AUTO/MANUAL: consolidar trazabilidad FR/SC/resultados y guía final en `docs/evaluacion/evidencias/002-fundacion/informe.md`, `specs/002-fundacion-supabase-multitenant/quickstart.md` y `ESTADO-DESARROLLO.md`. **Dep.: T035, T038.** Cierre: requisitos con evidencia/limitación, decisiones y cobertura de rúbrica sin aprobaciones ficticias; mantener riesgos npm históricos/actuales y acciones separadas, no seguridad auditada. Distinguir mocks/SQL/HTTP/manual/remoto y evidencia 001 reutilizada; caché, DNS/CDN, CI/CD, k6, Google y negocio excluido conservan pendientes. No cambiar Constitución/rúbrica/spec/plan ni AGENTS salvo autorización posterior para una regla estable nueva.
- [ ] T040 AUTO: cotejar `docs/evaluacion/evidencias/002-fundacion/inventario-inicial.json` con el estado final y registrar `docs/evaluacion/evidencias/002-fundacion/cierre.md`; revisar tasks/evidencias/enlaces y `git diff --check`. **Dep.: T039.** Cierre: diferencias exclusivamente autorizadas, historial y repositorios de referencia preservados, cada casilla concuerda con sus resultados; 40/40 solo si todas las tareas realmente se verificaron, incluidas reproducción/aprobación/remoto. Mantener riesgos y límites sin afirmar seguridad absoluta; no commit ni push.

## Dependencias y orden de ejecución

```text
T001 → (T002 || T003) → T004 → T005 → T006 → T007
     → T008 → T009 → T010 → T011                       # US1 local
     → (T012 || T013) → T014/T015 → T016 → T017 → T018 → T019
     → (T020 || T021) → T022 → T023 → T024 → T025 → T026 → T027
     → (T028 || T029) → T030 → T031 → T032 → T033
     → T034 → T035 → T036 [aprobación] → T037 → T038 → T039 → T040
```

La notación resume; las dependencias exactas constan en cada tarea. T014 depende de T012;
T015 espera además T013. T022 espera T020 y T023 espera también T021. T030 puede avanzar
después de T028 mientras se termina T029; T031 requiere ambos. No hay dependencias hacia
una tarea posterior ni ciclos. Se puede escribir en paralelo lo señalado, no migrar un mismo
stack desde dos procesos fuera del test de carrera explícito.

### Dependencias entre historias y aceptación independiente

| Historia | Habilitación | Verificación propia | Cierre que comparte |
| --- | --- | --- | --- |
| US1, P1 | Setup y Foundational | T008–T011: modelo cerrado desde cero | T035–T040: reproducción completa, remoto, guía e integridad |
| US2, P1 | Stack US1 local | T019: perfiles, Auth y C1 sin necesitar barberías | Calidad/reproducción/paridad final |
| US3, P1 | Perfiles US2 verificados | T027: alta, permisos básicos, rollback y C2–C4 | Matriz US4 y paridad final |
| US4, P1 | Tenants/membresías US3 | T032–T033: matriz A/B, revocación y arquitectura | Reproducción/paridad/cierre |

US1 se implementa primero como infraestructura; no se declara completa por anticipado.
Las pruebas independientes son por capacidad, no implican que las cuatro historias carezcan
de prerrequisitos compartidos. Las operaciones externas se posponen hasta tener resultado
local revisable, tal como dispone el plan.

### Ejemplos de paralelización segura

| Incremento | Trabajo simultáneo permitido | Límite |
| --- | --- | --- |
| Setup | T002 riesgo npm y T003 herramientas después de T001 | Archivos de evidencia separados; ninguna nueva dependencia npm |
| US1 | Preparar en paralelo las expectativas de FK/índices y ACL dentro de T009, consolidándolas antes de ejecutar | No marcar T010/T011 [P]; usan el mismo stack y migraciones |
| US2 | T012 unitarias/contratos y T013 SQL/HTTP | Sin escribir ambos en los mismos módulos; implementación posterior |
| US3 | T020 unitarias y T021 SQL/HTTP/rollback | Serializar migraciones y las mutaciones del montaje |
| US4 | T028 SQL y T029 HTTP/casos/unitarias | T031 espera a T030 y T029; no compartir sesiones ni credenciales de servicio |

## Estrategia de entrega

Primer incremento verificable: T001–T011, infraestructura local con modelo cerrado. No es
todavía la fundación 002 entregada ni un backend alojado acreditado. Continuar por perfiles,
alta atómica y permisos contextuales, validando cada capacidad antes de ampliar acceso.
Solo después reproducir íntegramente, aprobar destino, crear/desplegar remoto y cerrar.
No generar interfaces de negocio ficticias para demostrar estas operaciones.

## Cobertura documental de los 20 FR y seis SC

Esta tabla comprueba **planificación de cobertura**, no requisitos ya satisfechos.

| FR | Tareas de construcción/preparación | Tareas de verificación/cierre |
| --- | --- | --- |
| FR-001 | T008, T036, T037 | T035, T038, T040 |
| FR-002 | T003, T008, T010, T011 | T035, T039 |
| FR-003 | T001, T008 | T035, T040 |
| FR-004 | T014, T016, T017, T025 | T019, T027, T032 |
| FR-005 | T014, T015, T017, T018 | T013, T019 (C1) |
| FR-006 | T014, T015, T018 | T012, T013, T019 |
| FR-007 | T015, T017, T018 | T013, T019, T032 |
| FR-008 | T022, T024, T025, T026 | T020, T021, T027 |
| FR-009 | T010, T024 | T021, T027 (C2–C4) |
| FR-010 | T022, T023, T026 | T021, T027, T032 |
| FR-011 | T010, T022, T023 | T009, T027, T028, T032 |
| FR-012 | T030, T031 | T028, T029, T032 |
| FR-013 | T010, T023, T030 | T028, T029, T032 |
| FR-014 | T016, T023, T030 | T019, T027, T029, T032 |
| FR-015 | T008, T010, T015, T023, T030 | T011, T019, T027, T032, T038 |
| FR-016 | T007, T015, T016, T017, T024, T025, T036 | T019, T027, T032, T038, T039 |
| FR-017 | T005, T006, T014, T016–T018, T022, T025, T026, T031 | T004, T012, T020, T029, T033 |
| FR-018 | T007, T009, T013, T021, T028, T029 | T011, T019, T027, T032, T035, T038 |
| FR-019 | T007, T018, T026, T031 | T019, T027, T032, T033, T035 |
| FR-020 | T001, T002, T039 | T035, T038, T040 |

| SC | Tareas que deben aportar evidencia de su resultado |
| --- | --- |
| SC-001 | T001, T008–T011, T035–T038, T040: dos preparaciones vacías, proyecto nuevo y conservación |
| SC-002 | T012–T019, T032: todos los casos propios/ajenos de perfil y C1 |
| SC-003 | T020–T027: alta correcta, cero parciales y C2–C4 |
| SC-004 | T028–T032, T035, T038: matriz completa, resultados esperados y paridad |
| SC-005 | T007, T013, T016, T017, T019, T021, T024, T025, T027, T029, T032, T038: actor, ACL y secretos |
| SC-006 | T035, T039, T040: guía repetida, ejecutor, trazabilidad y límites |

## Riesgos y barreras vigentes

Las herramientas y versiones efectivas aún requieren validación de ejecución. El runtime
administrado no se deduce del Deno instalado en host. Nueve moderadas npm históricas frente
a ocho totales/tres sin dev siguen sin remediación acreditada; T002 analiza y T039 conserva
el pendiente. Una secret key omite RLS: wrappers, identidad Edge, ACL y autorización SQL se
prueban conjuntamente, no se sustituyen entre sí. El modelo inicial debe permanecer cerrado
entre migraciones. No aceptar excepciones de JWT, grants o checker para obtener verde.

No se identificó contradicción arquitectónica que requiera editar spec/plan para generar
esta lista. Se respeta el alcance parcial por incrementos: US1 no se cierra solo con local;
el barbero puede leer su membresía propia sin poder listar compañeros; validación como owner
no equivale a RLS. Si versiones/destino reales contradicen el diseño, detener la parte afectada
y solicitar decisión antes de modificar documentos aprobados.

## Registro de generación

Se utilizó la skill speckit-tasks y la plantilla core resuelta con `specify preset resolve
tasks-template`. `setup-tasks.ps1 -Json` terminó con código 1 por política PowerShell;
se inspeccionó su procedimiento y se resolvieron directorio/documentos mediante metadata
local, sin eludir ni cambiar la política. No existe extensions.yml: sin hooks before/after_tasks.
Único artefacto previsto de esta fase: este archivo. Las comprobaciones de generación son
formato, referencias, dependencias, cobertura documental, integridad y diff; no ejecución de
las tareas ni pruebas de implementación. No se modifica ninguna casilla hasta contar con
sus evidencias futuras. Sin commit ni push.

Validación documental de generación: 40 tareas sin marcar, IDs consecutivos, siete fases,
ocho tareas [P], cobertura de 20 FR/seis SC y dependencias sin ciclos ni referencias futuras.
Los 813 archivos previos conservan SHA-256; solo se añade tasks.md. Enlaces locales y whitespace
revisados; `git diff --check` con código 0. Estas comprobaciones no son pruebas del backend.
