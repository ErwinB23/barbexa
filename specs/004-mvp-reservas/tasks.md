# Tasks: MVP de operación y reservas multitenant

## Reconciliación Sprint 2 — 24/11/2026

W004 cierra la aceptación funcional Web de preparación, exploración, reservas,
agendas y cancelación. T013/T027/T030 mantienen Android y los casos técnicos
específicos no acreditados; T032 separa Cloud activo de publicación/Android.
T033 conserva rendimiento/infraestructura pendientes, incluida la progresión2.000VU.
No interpretar notas de fechas anteriores como nueva tarea de aceptación Web.

- [ ] S2-PRODUCTO Completar el alcance de producto todavía no implementado/acreditado:
  imágenes persistentes, ubicación exacta/mapas, favoritos y reseñas. Mantener los
  requisitos originales de la propuesta; implementación posterior fuera de esta actividad.
  El QR Yape/Storage queda centralizado en017, sin duplicar su tarea.

**Antecedente B5.2 — 20/11/2026, Web (superado por cierre B5 final abajo).** Renombrado conectado al caso002 existente mediante
puerto contextual/composición y editor Web separado de creación. Mismo ID, nombre precargado,
validación, bloqueo de doble envío, descarte de respuesta tardía, errores seguros y reconciliación
por lectura ante resultado incierto. Caché comercial invalidada y contexto visible refrescado.
46 comprobaciones dirigidas con dobles aprobadas; Chrome LOCAL solo acreditó carga del nombre
y separación crear/editar, SIN guardar. T013 sigue abierta por recorrido real pendiente y gates
conjuntos; no marcar creación/renombrado real aprobado por estas pruebas.

**Antecedente previo a activación: implementación y ensayo aislado B5.2.**
Contrato aprobado: anulación lógica, motivo obligatorio, un evento append-only en
team_authority_events y replay200 sin nuevas escrituras, incluso bajo concurrencia.
Owner/secundario con editHours; sin poderes nuevos para cliente/profesional. Original
conservado; no altera reservas y mantiene las demás restricciones de disponibilidad.

**B5 final 21/11, 18:06 Lima:** retirada previa conservada; verificador corregido para denegación exacta 500/P0002/NOT_AVAILABLE. UNA republicación Chrome HTTP200, mismo UUID published/v19; ausencia y reaparición en catálogo/reserva acreditadas, horarios disponibles sin crear cita. 42 reservas/45 detalles y huellas intactas. 22/22 comandos acreditados; B5.2/B5 funcionalmente terminados Web LOCAL. Ver E004/b5-cierre-web-local.md. T013/T027 y gates académicos/conjuntos no se cierran automáticamente. Los párrafos de implementación/ensayo que siguen son antecedentes previos a la activación y al recorrido real.

Casos/puertos, adaptadores cliente/servidor, Edge y panel Web /schedules conectados,
con listado paginado, historial, confirmación y reconciliación por lectura ante fallo.
Migración nueva 20261121040559_administrative_closure_withdrawal.sql: NO aplicada a
LOCAL principal ni Cloud. El panel necesita esa activación antes del recorrido real;
una RPC ausente se muestra como error recuperable, nunca como éxito/listado vacío.
Renombrado Web previo conservado, no reimplementado. Sin cambios Auth ni UI Android.

SQL real PostgreSQL17.11 en base desechable separada (OID distinto, cero datos Auth
copiados, fixtures sintéticos):16 grupos aprobados, incluidos permisos/ACL,404, motivo,
historial, idempotencia, disponibilidad, paginación y dos conexiones concurrentes con
espera de bloqueo observada: una transición/un evento. Base desechable eliminada.
Edge Request/Response + SQL real:401/403/403/404/200/200, Auth y transporte PostgREST
con dobles; NO Edge desplegada/GoTrue/Chrome. Cliente y servidor automatizados aprobados;
comandos/resultados exactos e inventario en004/b52-retirada-cierres.json y .md.

LOCAL principal conserva41 reservas/44detalles/28care/67care_events/54reservation_events,
usuarios/perfiles/membresías/configuración, huellas de negocio, catálogo e historial17 y
env intactos. Cero comandos del ensayo22 ejecutados; sin crear «B5 Cierre Web LOCAL»,
cuentas, sesiones, correos o reservas en la principal. Sin Cloud/servicios/Git writes.

Los22 comandos están preparados a nivel de código/contrato, NO habilitados ni ejecutados
en principal: primero autorización/activación de la migración y comprobación Edge LOCAL,
después permiso específico de negocio y Chrome. Retirada futura=withdraw-shop-closure,
conservar cierre withdrawn +un evento team_authority, no borrar fila ni añadir care_event.
Conteos finales previstos42reservas/45detalles permanecen condicionales al ensayo futuro.
Matriz48:34VERIFICADA/6SIN VALIDACIÓN INTEGRAL/4NO APLICA/3BLOQUEADA/1PARCIAL;
ninguna nueva aceptación Web de escritura. B5/004 y gates conjuntos siguen abiertos.
SMTP administrativo/transferencia/Android/aceptación visual separados. Detenerse al informe.

T013/T027 y gates conjuntos permanecen abiertos; no marcar aceptación integral por ensayo aislado.

**Estado vigente — 15/11/2026: 28/34.** T028 caché y T029 calidad verificadas; T031
pipeline/guía preparados como trabajo independiente de la evidencia física T030.
T013/T027 siguen abiertas: declaración manual registrada, con discrepancia posterior
de invitación pendiente y dos citas aún confirmadas; se revisarán solo en el recorrido final.
T030/T032/T033/T034 pendientes. No nuevos datos/migraciones/Cloud/servicios ni publicación.
Evidencias: `E004/cache.md`, `calidad.md`, `reproduccion.md`. Historial inferior conservado.
Actualización funcional: corregido fallo de generación del ID de cancelación antes de
enviar, sin mutar citas. Check actual0,157 unitarias/172 cliente, bundles Web/Android200.
No cierra discrepancias T013/T027 ni gates físicos. Rediseño detenido por el usuario.

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/booking.md](contracts/booking.md),
[quickstart.md](quickstart.md), [validation.md](validation.md). Constitución2.0.0.

**Estado anterior — 14/11/2026**: **25/34 completadas**, T001–T012 y T014–T026 verificadas.
T019 cerrada con evidencia manual del usuario Web/Android, incluidas F5 y reanudación.
T023 cerrada por confirmación del usuario sobre agendas Web/Android. T013 espera oferta/invitación y T027 cancelación manual de las dos citas sintéticas identificadas. Edge/cliente de reserva y pantallas
conectados a SQL existente:8 RED→GREEN,147 unitarias,53 dirigidas,7 servidor,9 TAP HTTP,
tipos/lint/formato/grafos aprobados. Nuevo conjunto local autorizado conservado para manual,
  sin limpieza anticipada. Tras la interrupción de Docker, el usuario restableció el motor;
Auth200 y Edge operativo tras iniciar únicamente su contenedor nuevo existente, sin recrear datos.
Ver `docs/evaluacion/evidencias/004-reservas/t017-t019/resultado.md`.
T024–T026 verificadas técnicamente con SQL/HTTP y UI dirigida; T027 espera interfaz real. T028–T034 no ejecutadas. Sin Cloud, nuevos paquetes/APK, commit/push ni edición del log activo.
Google/pagos diferidos expresamente, no eliminados
del producto. Recuperación003 debe funcionar antes de evaluación.

## Format y aceptación

`- [ ] Tnnn [P opcional] [USn en historias] tarea y rutas`.
Evidencias E004=`docs/evaluacion/evidencias/004-reservas/`. Cada casilla exige comandos/
salidas reales o recorrido manual atribuido, fecha/entorno/versión y límites. Automatizado
no sustituye DB/JWT/dispositivo. No se relajan checkers, RLS o expectativas para GREEN.
Comodines de migración significan archivos creados **por CLI al implementar**, no timestamps
inventados ni modificación de migraciones aplicadas. Las migraciones aplicadas y sus límites constan en las evidencias vigentes; los comodines posteriores siguen siendo planificación.

## Phase 1 — Setup y autorizaciones

Objetivo: ejecutar en destino correcto conservando trabajo y datos anteriores.

- [x] T001 Registrar aprobación de spec/plan/tasks, Git/HEAD/diff e inventario del alcance en `E004/integridad.json` y `E004/informe.md`; preservar fuentes001–003/log activo. Identificar cuentas/local y cantidad mínima, migraciones y limpieza a autorizar; ninguna autorización de planificación equivale a datos o escrituras Cloud.
- [x] T002 Revisar herramientas/dependencias y esquema002 en `E004/preparacion.md`: PostgreSQL17/btree_gist, CLI/Deno existentes, grants/objetos y puertos54421/54422 del stack nuevo; inspección de solo lectura antes de aplicar. Reutilizar avisos npm sin suponer remediación ni instalar paquetes.
- [x] T003 Extender primero tests del runner seguro en `tests/integration/booking/environment.test.mjs` e integrar modos explícitos en `scripts/run-backend-integration.mjs`; guardas de proyecto/puertos/JWT, datos sintéticos autorizados, barreras de concurrencia y limpieza selectiva. Mantener modos002 y secretos fuera de logs; registrar comandos efectivos en `E004/preparacion.md`.

## Phase 2 — Foundational: modelo/ACL y puertos

Bloquea las historias; un RED intencional no equivale a esquema aprobado.

- [x] T004 Escribir/ejecutar RED de catálogo/esquema/ACL en `supabase/tests/booking-schema.test.sql` y `booking-access.test.sql`:8 tablas de oferta/personal, FK cruzadas, RLS/grants/EXECUTE, perfiles privados y permisos A/B. SQL solo al destino local verificado/autorizado; guardar `E004/schema-red.log`.
- [x] T005 Crear con CLI y aplicar al local autorizado `supabase/migrations/*_booking_catalog.sql`: settings,services,barber_profiles,barber_services,barbershop_hours,barber_schedules,schedule_exceptions,staff_invitations; constraints/FKs/índices/RLS/ACL en misma transacción. No tablas ni RPC de pagos ni ampliar lectura privada002; revisar historial/rollback y no db reset.
- [x] T006 [P] Definir tipos/puertos consumidos en `src/features/barbershop-operation/{domain,application}/`, `src/features/reservations/{domain,application}/` y núcleos equivalentes `supabase/functions/_shared/`; pruebas `tests/unit/{barbershop-operation,reservations}/` y `tests/server/`. Dinero PEN/instantes/snapshots/errores propios, sin SDK/SQL/HTTP/RN/tipos generados en núcleo.
- [x] T007 Verificar GREEN del esquema/ACL aplicado con T004 y regresiones002 afectadas; `E004/schema-green.log` y `E004/acl.md` con owners/EXECUTE/search_path, extensión e identidad. Distinguir8 tablas actuales de las3 futuras de reserva; pasar checkers/tipos del núcleo sin módulos ficticios.

## Phase 3 — US1: oferta operativa (P1)

Prueba independiente: preparar/publicar A y aceptar invitación; B no administra A.

- [x] T008 [US1] Preparar RED de operaciones/invitación/publicación y admin-profesional en `tests/server/barbershop-operation/` y `supabase/tests/booking-operation.test.sql`; aceptar/rechazar/cancelar/duplicar simultáneamente, pendiente sin acceso, nuevo envío tras rechazo, membresía activa de rol distinto sin cambio silencioso, reserva comprometida protegida.
- [x] T009 [US1] Crear/aplicar `supabase/migrations/*_booking_operations.sql` con RPC cerradas de oferta/horarios/excepciones/invitación y lecturas comerciales; actor/tenant/current-role en SQL, publicación/políticas válidas, aceptación atómica. Nuevo usuario no obtiene permisos por input; proyección catálogo no abre profiles/memberships; registrar SQL GREEN/ACL.
- [x] T010 [US1] Implementar casos de uso, adaptador PostgreSQL y handler en `supabase/functions/_shared/barbershop-operation/` y entrada `supabase/functions/barbershop-operation/index.ts`; composición explícita reutiliza Auth002, verify_jwt=true, unión de acciones/campos cerrados, CORS existente y errores seguros. Añadir entrypoints/tests a `supabase/functions/deno.json` sin dependencias nuevas.
- [x] T011 [US1] Ejecutar SQL/HTTP con JWT reales en `tests/integration/booking/operation.test.mjs`: admins A/B, barbero, inactivo, destinatario/ajeno, RPC privilegiada directa denegada, duplicidad/concurrencia de invitación y admin-profesional. Registrar `E004/operation.md`, quitar solo fixtures autorizadas al terminar uso, sin afirmar seguridad por service_role.
- [x] T012 [US1] Implementar casos/adapter/composición cliente y pantallas en `src/features/barbershop-operation/`, `src/composition/barbershop-operation-composition.ts`, rutas `src/app/(account)/barbershop-admin.tsx`, `staff.tsx`, `services.tsx`, `schedules.tsx`; reutilizar crear barbería002/Auth/contexto003 y controles accesibles. Pruebas `tests/presentation/booking/operation.test.mjs`, sin SDK en vistas ni administración global.
- [ ] T013 [US1] Validar preparación/publicación/invitación reales Web e inmediatamente Android, incluyendo admin-profesional, tenant ajeno y estados vacíos/error en `E004/operation-web.md`/`operation-android.md`; calidad afectada y screenshot sanitizado cuando aporte evidencia. No cerrar si falta plataforma; backend posterior puede continuar con datos controlados si sus dependencias técnicas pasan.

## Phase 4 — US2: reserva y consulta propia (P1)

Prueba independiente: oferta válida controlada, cliente sin membresías y cita con profesional concreto.

- [x] T014 [US2] Preparar RED en `supabase/tests/booking-atomic.test.sql`, `tests/unit/reservations/` y `tests/server/reservations/`: varios servicios, capacidades, precio/actor falso, snapshots, idempotencia/huella distinta, rollback, disponibilidad/cambios concurrentes y selección cualquiera. Global persona A/B, cancelada no ocupa y mensaje uniforme obligatorio.
- [x] T015 [US2] Crear/aplicar `supabase/migrations/*_booking_atomic.sql`: reservations/items/events con FKs, instantáneas, request_id/huella, rango/exclusión física global y RPC confirmar/lecturas propias/slots; locks ordenados/revalidación actual, todo o nada. Catalogar permisos y planes, sin pagos ni reprogramación.
- [x] T016 [US2] Ejecutar integración SQL/RLS y10 pares concurrentes mediante `tests/integration/booking/concurrency.mjs` y runner autorizado: mismo tenant y perfiles A/B de la misma persona, rollback, retry/cambio de catálogo/horarios/membresía, privacidad del conflicto. Guardar `E004/atomic.md`, resultados/códigos y ausencia de parciales/duplicados; no mocks como evidencia concurrente.
- [x] T017 [US2] Implementar `SolicitarReserva`, `ReservaRemotaGateway`, `ConfirmarReserva`, `ReservaAtomicaGateway`, `ReservaHttpAdapter`, `PostgresReservaAdapter` y composiciones en módulos `reservations` cliente/servidor; entrada `supabase/functions/reservation-command/index.ts` con verify_jwt/Auth real. GREEN de T014 y HTTP del comando, actor obtenido de Auth, snapshots/precios solo servidor.
- [x] T018 [US2] Integrar `src/features/reservations/presentation/booking-screen.tsx`, `my-reservations-screen.tsx`, rutas `src/app/(account)/booking.tsx`, `my-reservations.tsx` y composición; catálogo/slots reales, multiselección, cualquiera/concreto, resumen PEN/Lima, requestId seguro, timeout reconciliable y conflicto/reconsulta. Pruebas `tests/presentation/booking/booking.test.mjs`; accesibilidad y no datos de otro contexto.
- [x] T019 [US2] Validar HTTP/JWT y UI cliente Web→Android de disponibilidad/confirmación/detalle, doble envío/timeout con misma clave, servicio ajeno y perfil propio; `tests/integration/booking/reservations.test.mjs`, `E004/booking-web.md`/`booking-android.md`. No declarar aún demostración de agenda admin si US3 no está lista ni repetir registro003.

## Phase 5 — US3: agendas por responsabilidad (P1)

Prueba independiente: reserva existente, profesional asignado y administrador de su tenant.

- [x] T020 [US3] Escribir RED de consulta/agenda/privacidad en `supabase/tests/booking-agenda.test.sql`, `tests/presentation/booking/agenda.test.mjs` y `tests/integration/booking/agenda.test.mjs`: cliente propio/ajeno, asignado/no asignado, admin A/B, admin-A/barbero-B, inactivo y respuestas tardías tras cambio de contexto.
- [x] T021 [US3] Completar consultas/proyecciones autorizadas y adaptadores en `src/features/reservations/application/`, `infrastructure/` y funciones privadas de la migración nueva `supabase/migrations/*_booking_agenda.sql`; RLS/columnas/datos operativos mínimos sin abrir perfiles002. Ejecutar GREEN SQL/HTTP con JWT y calidad afectada en `E004/agenda.md`.
- [x] T022 [US3] Integrar `src/features/reservations/presentation/agenda-screen.tsx` y `src/app/(account)/agenda.tsx` con contexto003; filtros de fecha/profesional/estado según responsabilidad, estados vacíos/error/reintento y descarte de resultados anteriores. Guardia visual no sustituye RLS; sin consultas de otros tenants para componer agenda local.
- [x] T023 [US3] Ejecutar demostración real **cliente Android→administrador Web** y dirección inversa, mismo ID/hora/profesional/total, más barbero asignado/no asignado y admin-A/barbero-B; registrar `E004/demo-android-web.md` y `E004/agenda-android.md`. Verificar revocación controlada, accesibilidad y no datos cruzados con fixtures específicamente autorizadas.

## Phase 6 — US4: cancelación segura (P1)

Prueba independiente: citas existentes confirmadas y política histórica, sin un nuevo registro.

- [x] T024 [US4] Preparar RED de límite inclusive120min/configurado, fuera del límite, política editada después, cliente ajeno, staff con/sin motivo, repetición y cancelación→alta concurrentes en `supabase/tests/booking-cancellation.test.sql`, `tests/unit/reservations/cancellation.test.ts` y `tests/server/reservations/`.
- [x] T025 [US4] Crear/aplicar `supabase/migrations/*_booking_cancellation.sql`, RPC/ACL de cancelación: actor actual, propietario y límite snapshot o asignado/admin activo con motivo, estado/evento/liberación atómicos y repetición sin sobrescribir auditoría. GREEN SQL real y locks del mismo protocolo; sin penalizaciones, pagos o reembolsos.
- [x] T026 [US4] Implementar CancelarReserva y transporte/handler de `reservation-command` y controles de cancelación en `src/features/reservations/presentation/{my-reservations,agenda}-screen.tsx`; confirmación accesible, motivo staff, límites visibles, errores seguros y actualización de listas. Pruebas `tests/presentation/booking/cancellation.test.mjs`, sin duplicar Auth ni SQL en UI.
- [ ] T027 [US4] Ejecutar SQL/HTTP de cancelación, límites y carreras, y recorrido real Web e inmediatamente Android en `E004/cancellation-web.md`/`cancellation-android.md`; actor/fecha/motivo/evento único y horario liberado, sin exponer otra reserva. Conservar y limpiar solo datos identificados/autorizados tras comprobar su uso pendiente.

## Phase 7 — Polish y cierre conjunto

- [x] T028 Implementar/medir caché mínima **solo catálogo comercial** en `src/features/barbershop-operation/infrastructure/catalog-cache.ts`, con tests `tests/integration/booking/catalog-cache.test.mjs`: clave tenant/versión,TTL30s, invalidación tras mutar/cambiar cuenta, cero permisos privados/slots como autoridad. Registrar resultado de invalidación/aislamiento y latencia en `E004/cache.md`.
- [x] T029 Ejecutar tipos/checkers reales cliente/servidor, lint/formato/unitarias/integración/presentación afectadas y check general; ajustar únicamente inclusión de módulos/tests/entrypoints en runners/config existentes, sin debilitar reglas. Evidencia `E004/calidad.md`, cobertura por archivo/núcleo, límites y RED originales conservados.
- [ ] T030 Verificar estados/accesibilidad finales y sesión/contexto de negocio en Web y Android; comprobar evidencia real de recuperación003T028–T032 antes de evaluación, sin reimplementar ni fingirla en004. Registrar `E004/accessibility-web.md`, `accessibility-android.md` y dependencias no satisfechas; un pendiente no es cierre.
- [x] T031 Preparar pipeline en `.github/workflows/quality.yml` y guía `E004/reproduccion.md`: comandos probados, herramientas fijadas, migraciones versionadas, revisión de secretos/cachés y permisos mínimos; despliegue separado de PR no confiables. No publicar ni instalar herramientas sin autorización; usar skill de hardening al escribir workflow.
- [x] T032-C Integración Cloud SQL/Edge activa bajo autorizaciones específicas posteriores; versión y evidencias en docs/CODEX-HANDOFF.md. Recorrido manual Web aceptado el24/11.
- [ ] T032 Completar origen Web publicado y cotejo postdespliegue FR/SC, incluido Android; requiere autorización concreta. No recrear proyecto Cloud, reset ni reparar historial para simular cierre.
- [ ] T033 Con destino y carga autorizados, comprobar HTTPS/DNS/CDN/CSP y ejecutar k6: smoke MVP10VU/1min (p95<=2s, errores funcionales0), escenario original25/50/100VU y progresión académica hasta2.000VU según plan.md. Definir entorno/datos/etapas/umbrales antes de cargar; comparar caché en destino. Sin resultados acreditados de carga ni capacidad2.000VU; no confundir con concurrencia SQL.
- [ ] T034 Cotejar FR/SC, casillas, migraciones/secretos/enlaces e inventario, comprobar limpieza selectiva y conservar log activo; actualizar `E004/informe.md`, `E004/cierre.md` y `ESTADO-DESARROLLO.md`. Diferenciar MVP operativo de SaaS completo/Google/pagos/reseñas/mapas/imágenes, riesgos npm y límites; diff global/excluyendo solo log. Sin commit/push sin nueva autorización.

## Dependencies & Execution Order

T001→T002→T003→T004→T005→T007; T006 puede trabajar archivos distintos después de T002 y se
une antes de T007. US1:T008→T009→T010→T011→T012→T013. US2:T014→T015→T016→T017→T018→T019;
su backend puede comenzar tras T007 con oferta controlada válida, sin esperar aceptación
manual US1, pero sus lecturas/capacidades requieren RPC T009. US3:T020→T021→T022→T023,
tras T017; T023 espera también UI T018/T019. US4:T024→T025→T026→T027 tras reserva existente;
T026 espera UI de US2/US3. Cierre T028→T029→T030→T031→T032→T033→T034.

El orden es seguro por archivos compartidos, no una obligación de repetir flujos previos.
Si falta solo evidencia física, dejar esa casilla abierta y continuar tareas de archivos/
dependencias técnicas ya satisfechas, manteniendo gates reales. Nunca marcar SQL/RLS/E2E
completas con solo unitarias. Cloud/fixtures/limpieza son puntos externos de autorización.

## Parallel opportunities y estrategia de entrega

- T006 tipos/puertos cliente/servidor puede hacerse mientras se prepara esquema T004/T005;
  no concurrir sobre tipos compartidos ni checkers. T008 y T014 RED son independientes tras base.
- Backend SQL de US2 y pantallas US1 pueden avanzar en archivos distintos tras T009; unir
  antes del recorrido reserva. No editar handlers/entrypoints raíz simultáneamente.
- Por cada flujo: lógica compartida→Web real→Android inmediato; no acumular Android al final.
- Prioridad: primer bloque T001–T007; después oferta/backend atómico; unir reserva Android
  y agenda admin Web en T023. Cancelación y gates restantes antes de aceptar004.
- 003 sesión/contexto habilita UI; recuperación003 es obligatoria antes de evaluación. No
  esperar el SaaS completo para preparar negocio, ni presentar un esqueleto como MVP completo.

## Coverage

La matriz completa28FR y6SC está en [validation.md](validation.md). Distribución: setup3,
fundación4, US1 seis, US2 seis, US3 cuatro, US4 cuatro, cierre siete = **34 tareas**.
Generar los documentos no ejecutó tareas. Estado vigente: T001–T012,T014–T026,T028,T029,T031 verificadas; T013/T027 esperan reconciliar evidencia real y T030,T032–T034 continúan pendientes. La preparación del pipeline no acredita su ejecución remota.

## Evidencia Web posterior B4 — sin cerrar T013 conjunta

20/11: Chrome real U3 invita a U4 como barbero y U4 acepta desde invitaciones recibidas,
2HTTP200 con PostgreSQL; principal crea/desactiva/reactiva perfil nuevo y asigna servicio,
4HTTP200. Una invitación accepted/membresía barber/active/perfil activo/capacidad nuevos
conservados. Roles de otras barberías y40reservas/43detalles/pagos intactos. Sin SMTP,
cuentas nuevas ni cambios de servidor. Evidencia004/b4-ejecucion.json. No repetir ni
atribuirlo a prueba manual del usuario. T013 conserva criterios Android/otros alcances;
los residuos de oferta mantienen estado explícito en el plan maestro.

## Ampliación visual Web — Inicio privado Barbexa (sin cerrar gates previos)

- [x] W001 Revisar contratos existentes, permisos y maqueta; delimitar alcance en `plan.md`.
- [x] W002 Añadir lectura independiente del borrador, Inicio/Explorar/detalle y menú personal
  Web, reutilizando catálogo, reservas propias, perfil y logout; sin APIs ni escrituras nuevas.
- [x] W003 Completar verificaciones dirigidas de integración, presentación, responsive,
  teclado, tipos, lint, formato y arquitectura; registrar límites de ejecución.
- [x] W004 Aprobación visual y recorrido autenticado Web del usuario, confirmado el24/11/2026 para los cuatro perfiles; no repetir OAuth ni inferir cierre Android.
  Esta reconciliación no crea datos, no acredita Android ni cierra T030/T032–T034.

Ejecución18/11: RED inicial6 de lectura y6 de presentación; ampliados después a8 de
lectura,6 de presentación y4 de rutas. GREEN51/51 pruebas dirigidas de lectura/composición/UI,
guardas, aislamiento Cloud/LOCAL y conservación del borrador. TypeScript cliente/núcleo,
ESLint/Prettier de archivos afectados y grafo arquitectónico: código0. Exportación Web
local aprobada, sin desplegar ni arrancar el servidor Development.
Chrome aislado con propiedades sintéticas solo en memoria:6 tamaños (1672/1366/1024/
768/390/320), imágenes/fuente cargadas, sin desbordamiento horizontal del contenido;
6 comprobaciones de menú/Escape/foco/callback logout/búsqueda/selección, sin excepcionesJS.
Vista y resultados en `.artifacts/private-home-browser/`; ninguna llamada a Supabase,
sesión nueva, correo o escritura de datos. Esto no acredita E2E autenticado ni aceptación
visual del usuario.003/007 y gates previos de004 permanecen sin cambios.
Metro existente reutilizado sin arranque/reinicio: PID48608; `/status` loopback/LAN200,
chunks Web/runtime200 y nuevo Inicio presente. Perfil `cloud-integration`, URL/clave
pública y revisión comparados en memoria con la configuración preparada; Expo58 usa
`expo/virtual/env` y preludio de descriptores en Development, no literales en el componente.
Ver `.artifacts/private-home-runtime-read.json`; sin sesiones ni consultas de negocio.

Ajuste visual posterior18/11: contenedor Web de altura completa y fondo del Stack
transparente; catálogo vacío compacto, imágenes proporcionales y subtarjetas de movimientos.
20/20 regresiones dirigidas; tipos/lint/formato/arquitectura0. Chrome aislado:14 escenarios
(vacío/con3 tarjetas,7 anchos320–2202), fondo marfil hasta abajo, sin overflow horizontal y
contenido inferior alcanzable;6 interacciones conservadas. Evidencia local en
`.artifacts/private-home-space-check/`. Sin datos/servicios operados; W004 sigue abierta.

19/11: el usuario aprueba oficialmente el Inicio privado y diseño premium conservados,
junto con la navegación reorganizada de Etapa1, en su recorrido Web de cliente. Evidencia
manual reportada por el usuario, no ejecutada por Codex. No acredita catálogo/reserva,
contextos administrativos ni E2E integral; W004 y T030/T032–T034 mantienen esos pendientes.
No reabrir interfaces aprobadas ni repetir este recorrido rutinariamente.
