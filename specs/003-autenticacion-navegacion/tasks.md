# Tasks: Autenticación y navegación por contexto

## Reconciliación Sprint 2 — 24/11/2026

- [x] S2-WEB Interfaces y recorrido funcional manual Web aceptados por declaración
  del usuario para cliente, barbero, administrador secundario y propietario que atiende.

Esta aceptación no prueba tres recorridos consecutivos, casos negativos, matrices
de restauración/recuperación, auditoría de seguridad ni accesibilidad instrumental.
T014/T019/T023/T031/T032/T034 conservan sus casos específicos y Android; T033/T035/T036
conservan cierre técnico/documental. Reutilizar evidencia válida sin repetir Web aceptada.

**Consolidación vigente — 18/11/2026: 27/36.** Inicio y Autenticación Web de Barbexa:
diseño y recorridos funcionales principales aprobados manualmente por el usuario.
No requieren repetición rutinaria. Ninguna casilla adicional satisface todos sus
criterios Web/Android; se mantienen abiertas T014,T019,T023,T031–T036.
El desglose por criterio y la atribución de evidencias están en
[cierre Web](../../docs/evaluacion/evidencias/003-autenticacion/informe.md#cierre-de-inicio-y-autenticación-web--18112026).
Avanzar con006; pendientes académicos y medición de carga inicial/F5 se conservan
sin bloquear ese módulo. Los estados inferiores son antecedentes.

**Estado vigente — 15/11/2026: 27/36.** T028–T030 implementadas y verificadas con
unitarias/integración/presentación; recuperación real T031/T032 continúa pendiente del
recorrido final. T014/T019/T023 y T033–T036 también abiertas. Código compartido Web/Android;
bundles Metro200 no sustituyen dispositivos. Check general0,157 unitarias y172 cliente
tras corregir el saneamiento del estado de Expo Router, sin otro canje PKCE.
Ver `docs/evaluacion/evidencias/003-autenticacion/us5-implementacion.md`.
Los estados inferiores conservan la cronología; no representan el estado actual.

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contrato](contracts/authentication.md),
[quickstart.md](quickstart.md), [validation.md](validation.md). Constitución 2.0.0.

**Estado anterior T018–T027 14/11**: **24/36**. T018,T020–T022,T024–T027 [x].
Sesión/contexto compartidos y evidencias manuales Web/Android del usuario acreditados;
conjunto local autorizado limpiado selectivamente (0 residuos, datos anteriores conservados).
129 unitarias,73 integración/presentación,11 comprobaciones SQL/HTTP locales, tipos/lint/
formato/arquitectura0. T014,T019,T023 siguen pendientes de sus criterios específicos;
no se ejecutó T028+. Ver `docs/evaluacion/evidencias/003-autenticacion/t018-t027/resultado.md`.
004 solo borrador spec/plan/34 tareas,0 ejecutadas. Sin commit/push. Historial anterior:

**Estado anterior T014–T017 14/11**: **16/36**, T015–T017 [x]. Login/logout/Mi cuenta
y Atrás protegidos acreditados por el usuario en Web y Android Development.116 unitarias,
76 integración/presentación, tipos/lint/formato/arquitectura0. T014 permanece [ ]:
tres recorridos/casos ampliados, duplicados y limpieza todavía no acreditados. No se
repitieron registros/correos ni se ejecutó T018+. Ver evidencias/t014-t017/resultado.md.
Datos y log activo conservados. Historial anterior:

**Estado anterior cierre T011/T013 14/11**: **13/36**. Registro, correo Mailpit,
confirmación y perfil propio acreditados por el usuario en Web y Android Development.
T011/T013 [x], reutilizando las pruebas técnicas previas sin repetirlas. T014 sigue [ ].
Ver `docs/evaluacion/evidencias/003-autenticacion/t013/cierre-manual.md`. Cuentas locales
conservadas y observaciones visuales registradas para mejora futura, sin rediseño.
No se ejecutaron T014 ni tareas posteriores. Historial anterior:

**Estado anterior T013 14/11**: 11/36. T013 integrada técnicamente; T011/T013 siguen
pendientes de registro, correo, confirmación y perfil reales en Web/Android. Calidad:
108 unitarias,65 integración/presentación, tipos/lint/formato/arquitectura0. Ajuste de URL
Auth local y reinicio exclusivo Metro autorizados; ver evidencias/t013/resultado.md.
No T014 ni cierre artificial de dependencias. Historial anterior:

**Estado anterior 14/11**: T001–T010 y T012 verificadas (11/36). T012 manual Web/Android
acreditada y muestra retirada. T011 implementada,17 pruebas originales GREEN y calidad
aprobada; pendiente de validación funcional real por instrucción del usuario, sin ejecutar
T013/T014. Ver t011/resultado.md en evidencias. Historial previo:

T001–T010 verificadas (10/36). T010 RED anticipado acreditado;
T012 implementada, pruebas técnicas aprobadas y pendiente de recorrido Web/Android.
Ver t010-t012/resultado.md en evidencias. T011/T013/T014 no ejecutadas. Historial previo:

T001–T009 verificadas (9/36). CORS público22/22 y operador2/2;
ver t009/kong-cierre.md en evidencias. T010+ no ejecutadas. Historial previo:

T001–T008 verificadas (8/36), incluida evidencia manual Android del usuario
para SecureStore, sonda retirada y composición mínima probada. T009 en preparación local
autorizada (transporte DEV/SMTP); sigue pendiente de build/verificaciones reales. T010+ no ejecutadas.

Actualización T009: build, instalación/API y schemes Android acreditados; sonda retirada.
Sigue abierta por Origin Web del handler local (403), distinto al preflight genérico200
del gateway; ver t009/android-verificacion.md en las evidencias. No iniciar T010+.

14/11: handler local corregido,10/10; gateway todavía sobrescribe CORS con wildcard,
0/4 bajo cabecera exacta. T009 permanece pendiente de revisión/autorización del gateway;
ver t009/cors-local.md. No iniciar T010+.
No constituye autorización para instalar, configurar Cloud, crear fixtures o compilar con
servicios externos. Conservar todos los cambios anteriores y el log activo de 002.

## Format y convenciones

`- [ ] Tnnn [P opcional] [USn en historias] descripción con rutas`.
Rutas relativas a raíz. `[P]` permite concurrencia solo tras cumplir dependencias indicadas,
en archivos distintos. No implica delegación ni ejecución automática. Comas enumeran archivos.

Evidencias futuras bajo `docs/evaluacion/evidencias/003-autenticacion/` (abreviado E003 en
explicaciones, rutas completas en tareas). Cada tarea exige comandos/códigos o pasos,
esperado/obtenido, versión/fecha/entorno y origen manual/automático; sin secretos.
Tests primero donde se indique, registrar RED real antes de implementación y GREEN después.
No contabilizar un fallo de infraestructura como denegación de seguridad aprobada.

## Phase 1: Setup — conservación y autorizaciones

Objetivo: establecer línea base y decisiones operativas, sin reabrir fundaciones anteriores.

- [x] T001 Registrar rama/HEAD, diff e inventario SHA-256 de archivos versionados y documentación 003 en `docs/evaluacion/evidencias/003-autenticacion/integridad.json` y `informe.md`; excluir .git, dependencias y artefactos; identificar y excluir únicamente `docs/evaluacion/evidencias/002-fundacion/t017-serve.log` del cotejo estable, sin editarlo. Preservar cambios autorizados y comprobar destinos permitidos/prohibidos de 002.
- [x] T002 Revisar `package.json` y `package-lock.json`, consultar metadatos/engines y analizar `npm audit --json` y `npm audit --omit=dev --json` en `docs/evaluacion/evidencias/003-autenticacion/dependencias.md`; separar directas/transitivas/dev/producción y cambios de conteo respecto de nueve moderados, sin asumir remediación. Justificar SDK Auth 2.119.0 y SecureStore SDK58 ~58.0.3, compatibilidad y aprobaciones previas a instalar; sin fix/force.
- [x] T003 [P] Inventariar navegador/lector Web, Android físico/emulador, JDK/SDK/adb y opciones de build en `docs/evaluacion/evidencias/003-autenticacion/entornos.md`; acreditar disponibilidad/versiones sin instalar ni operar contenedores. Definir cómo producir build propio con scheme appbarberia; Expo Go no basta para enlaces. Registrar requisitos ausentes y obtener aprobación de herramientas/costos externos si fueran necesarios.
- [x] T004 Tras T002–T003, preparar y obtener decisiones concretas en `docs/evaluacion/evidencias/003-autenticacion/configuracion.md`: entorno de pruebas, origen/puerto Web exactos, URLs callback/reset Web y Android, correo/SMTP de prueba, CORS y eventual hosting. Documentar riesgo XSS de SPA frente a HttpOnly y mitigaciones; aprobar datos ficticios mínimos y limpieza por recorrido. No inventar URL final ni usar credenciales en documentos; separar autorización de configuración Cloud, paquetes, build y fixtures. Sin esas aprobaciones dejar operaciones afectadas pendientes.

## Phase 2: Foundational — infraestructura compartida

Bloquea implementación de historias. T009 prepara entorno; no pretende probar flujos de
003 que aún no existen. No nuevas migraciones, tablas, RPC o handlers.

- [x] T005 Tras T001–T004 y aprobación de dependencias, incorporar únicamente SDK Auth y SecureStore aprobados a `package.json`/`package-lock.json`, resolver SecureStore con convenciones Expo58 y comprobar npm ls, expo install --check y Expo Doctor; registrar resultados/diff/audit en `docs/evaluacion/evidencias/003-autenticacion/dependencias.md`. Verificar URL/URLSearchParams/crypto seguro Hermes; añadir polyfill solo ante bloqueo demostrado y autorización, nunca versiones al azar ni aleatoriedad insegura.
- [x] T006 Definir tipos/puertos y pruebas de invariantes en `src/features/authentication/domain/identity.ts`, `session-state.ts`, `auth-error.ts`, `application/auth-gateway.ts` y `tests/unit/authentication/session-state.test.ts`; respetar estados de data-model.md, "No role global", Profile con "phone nullable" y errores propios. Ampliar entradas de `tsconfig.tests.json`/runner existente solo si corresponde, sin imports SDK/RN/DOM en núcleo ni datos ficticios de negocio.
- [x] T007 Crear pruebas primero e implementar `src/features/authentication/infrastructure/session-storage.web.ts`, `session-storage.native.ts` y `tests/integration/authentication/session-storage.test.mjs`; namespace proyecto/entorno, get/set/remove, cuota/bloqueo, corrupción y limpieza solo de claves propias. Android: sesión/verifier en SecureStore, roundtrip real y payload extenso; fragmentación solo si necesaria, probar interrupción/manifiesto/lectura incompleta. Sin fallback plano. Web: persistencia JS no garantiza resistencia a XSS; registrar límites.
- [x] T008 Preparar adaptador/composición mínima en `src/features/authentication/infrastructure/supabase-auth-adapter.ts`, `src/composition/auth-composition.ts`, `auth-provider.tsx` y `src/features/authentication/presentation/auth-context.tsx`, `use-auth.ts`; SDK único, PKCE persistido/detectSessionInUrl false, eventos propios sin llamadas reentrantes. Inyectar getAccessToken al `src/composition/tenant-foundation-composition.ts` existente; pruebas en `tests/integration/authentication/composition.test.mjs` demuestran reuso y ausencia de secretos/tipos SDK en snapshot. No implementar anticipadamente todas las acciones de historias.
- [x] T009 Solo con T004 autorizada y T005–T008 verificadas, aplicar exclusivamente configuración de entorno aprobada: redirects/correo/orígenes CORS y build Android; guardar valores públicos/documentación y resultado en `docs/evaluacion/evidencias/003-autenticacion/configuracion.md` y `entornos.md`, configuración local secreta ignorada. Comprobar destino nuevo exacto antes de cualquier escritura, preflight/Origin real del Edge existente sin debilitar JWT, recepción de correo de prueba autorizada y build que reconoce scheme. No redesplegar ni cambiar RLS/ACL; si exige cambio no aprobado, detener operación afectada.

## Phase 3: US1 — Registro, confirmación y perfil (P1)

Objetivo: alta autónoma y perfil propio reutilizando 002. Prueba independiente: identidad
sintética autorizada por plataforma, correo real/retorno, perfil propio o error reintentable.
Login por contraseña se añade en US2; SC-001 completo se consolida allí, sin adjudicarlo antes.

- [x] T010 [P] [US1] Escribir RED de registro/confirmación y bootstrap en `tests/unit/authentication/registration.test.ts` y `tests/integration/authentication/registration.test.mjs`: datos inválidos, doble envío, pendiente sin sesión, canje duplicado, perfil existente/ausente y fallo de red; reintentar perfil no llama signUp ni sobrescribe existente. Datos de entrada con "phone nullable" y displayName validado por 002, sin nuevos límites comerciales.
- [x] T011 [US1] Tras T010, implementar registro/confirmación en `src/features/authentication/application/auth-actions.ts`, `session-coordinator.ts`, `infrastructure/supabase-auth-adapter.ts`, `auth-links.web.ts`, `auth-links.native.ts`; validar origen/scheme/host/path configurados y canje PKCE una vez. Conservar verifier al cerrar vista, limpiar parámetros sensibles Web; sin verifier ofrecer reinicio seguro, no implicit. Usar getOwnProfile/ensureOwnProfile existentes; completar nombre propio si falta, metadata nunca autoriza roles.
- [x] T012 [P] [US1] Crear campo compartido accesible consumido por formularios en `src/shared/ui/app-text-field.tsx` y pruebas en `tests/presentation/auth-fields.test.mjs`; reutilizar tokens/textos/botones/Screen, labels/roles, errores comprensibles, teclado/foco Web y controles >=48×48 dp Android/equivalente Web, texto escalable. Sin librería UI/rediseño definitivo ni infraestructura en componente.
- [x] T013 [US1] Integrar `src/features/authentication/presentation/sign-up-screen.tsx`, `confirm-email-screen.tsx`, rutas `src/app/(auth)/sign-up.tsx`, `confirm-email.tsx`, `_layout.tsx` y proveedor raíz `src/app/_layout.tsx`; carga/error/éxito, perfil pendiente y reintento sin repetir alta. Pruebas de presentación en `tests/presentation/registration.test.mjs`; T011 y T012 deben pasar, rutas públicas 001 conservadas.
- [ ] T014 [US1] Ejecutar calidad afectada y recorridos reales de registro→correo→confirmación→perfil primero Web y enseguida Android, tres consecutivos por plataforma según SC-001 en su tramo de US1; cerrar vista original, enlace inválido/consumido y perfil reintentado. Registrar `docs/evaluacion/evidencias/003-autenticacion/us1-web.md` y `us1-android.md`, verificar duplicados y limpieza autorizada. No sustituir correo/SDK/storage reales por fixtures ni declarar login por contraseña ya verificado.

## Phase 4: US2 — Login, logout y navegación protegida (P1)

Prueba independiente: cuenta confirmada autorizada, sin requerir membresías o nuevo registro.
Depende de base común y bootstrap de perfil T011–T013, no de volver a registrar usuarios.

- [x] T015 [P] [US2] Preparar RED en `tests/unit/authentication/sign-in-out.test.ts` y `tests/presentation/protected-navigation.test.mjs`: login inválido/no confirmado, ruta directa/retorno externo, logout online/offline, fallo de borrado y respuesta tardía. Verificar scope local y que parámetro de rol/ID/clave pública no concede acceso.
- [x] T016 [US2] Implementar login/cierre local en `src/features/authentication/application/auth-actions.ts`, `session-coordinator.ts` y `infrastructure/supabase-auth-adapter.ts`; generation antes de esperar red, borrar solo claves propias, no persistir contraseña, descartar respuestas viejas. Mapear inválido vs red; si falla limpieza persistente informar cierre incompleto, no éxito. Pruebas T015 GREEN con revocación remota no confirmada explícita.
- [x] T017 [US2] Integrar `src/features/authentication/presentation/sign-in-screen.tsx`, `account-screen.tsx`, rutas `src/app/(auth)/sign-in.tsx`, `src/app/(account)/account.tsx`, `_layout.tsx` y `src/app/_layout.tsx`; Stack.Protected, estados públicos de resolución/perfil pendiente, retorno interno allowlist y replace al salir. Conservar bienvenida/technical/+not-found, sin dashboards ficticios ni imports de adaptadores en vistas.
- [x] T018 [US2] Integrar invalidación de pestañas Web compartidas y recuperación segura del historial en `src/features/authentication/infrastructure/session-storage.web.ts`, `presentation/use-auth.ts` y `tests/integration/authentication/browser-session.test.mjs`; sin tokens en mensajes, recarga/Atrás/Adelante no muestran datos salidos, cuenta B no recibe respuestas de A. Probar logout offline y error de storage, sin prometer revocación inmediata JWT ni cierre de otros dispositivos.
- [ ] T019 [US2] Verificar login/logout/perfil/navegación con navegador real y después Android (Atrás/reapertura) en `docs/evaluacion/evidencias/003-autenticacion/us2-web.md` y `us2-android.md`; consolidar SC-001 con tres recorridos completos por plataforma y SC-002 de rutas/cambio/carreras. Ejecutar calidad afectada, atribuir manual/automático, limpiar solo fixtures autorizadas y mantener pendientes los casos no probados.

## Phase 5: US3 — Restauración y renovación (P1)

Prueba independiente: sesión existente, matriz vigente/renovable/inválida/red; no nuevo alta.

- [x] T020 [P] [US3] Preparar RED en `tests/unit/authentication/session-lifecycle.test.ts` y `tests/integration/authentication/session-lifecycle.test.mjs`; restore/getUser, refresh concurrente, foco, storage fallido, logout/cambio mientras petición está pendiente; red no equivale a revocación ni a ready.
- [x] T021 [US3] Tras T020, implementar restore/verify y renovación coordinada en `src/features/authentication/application/session-coordinator.ts`, `infrastructure/supabase-auth-adapter.ts` y `presentation/use-auth.ts`; AppState Android inicia/detiene refresh/listeners, Web revalida al foco y coordina con SDK, suscripción única fuera de callback reentrante. No tokens en React ni importar AppState al núcleo; GREEN con generación y perfil requerido.
- [x] T022 [US3] Adaptar resolución/reintento en `src/composition/auth-provider.tsx`, `src/features/authentication/presentation/account-screen.tsx` y `tests/presentation/session-resolution.test.mjs`; sin destellos privados, restauración de perfil coherente, error transitorio recuperable, expiración definitiva vuelve a login. Comprobar limpieza de listeners al desmontar y reintentos sin consultas duplicadas por render.
- [ ] T023 [US3] Ejecutar matriz SC-003 real Web (recarga/cierre-reapertura/foco) inmediatamente seguida de Android (reinicio/segundo plano/reapertura), vigente/renovable/inválida/red, en `docs/evaluacion/evidencias/003-autenticacion/us3-web.md` y `us3-android.md`; medir solicitudes/tiempos sin tokens, verificar persistencia real y compatibilidad Node/Metro con calidad afectada. Acreditar ambos entornos, no solo mocks de reloj o bundle.

## Phase 6: US4 — Contexto por membresía (P1)

Prueba independiente: cuenta con cero/una/varias/inactiva y admin-A/barber-B autorizadas.
No requiere UI de administración ni volver a ejecutar suite completa RLS 002.

- [x] T024 [P] [US4] Preparar RED en `tests/unit/authentication/tenant-context.test.ts` y `tests/integration/authentication/tenant-context.test.mjs` usando puertos 002: cero/una/varias, inactivas, preferencia obsoleta, barbería no accesible, revocación y respuesta tardía. Respetar role "barber/administrator", status "active/inactive"; ninguna selección crea membresía/rol global.
- [x] T025 [US4] Implementar `src/features/authentication/application/tenant-context.ts` con listOwnMemberships/getBarbershop de 002 y composición `src/composition/auth-composition.ts`; una activa/autorizada automática, varias elegir/cambiar, cero válido; preferencia por cuenta/proyecto revalidada. Retirar contexto anterior antes de cambiar, denegación tenant conserva Auth válido y red no autoriza por caché. Tests T024 GREEN sin duplicar endpoints.
- [x] T026 [US4] Integrar `src/features/authentication/presentation/context-screen.tsx`, `account-screen.tsx` y `src/app/(account)/context.tsx` con `tests/presentation/tenant-context.test.mjs`; mostrar barbería/rol individual, carga/vacío/error/reintento y cambio accesible, sin acciones de personal/negocio ni privilegios admin arrastrados a barber-B.
- [x] T027 [US4] Ejecutar SC-004 en navegador real y enseguida Android con fixtures específicamente autorizadas, incluyendo revocación controlada y navegación contextual; registrar `docs/evaluacion/evidencias/003-autenticacion/us4-web.md` y `us4-android.md`. Confirmar identidad real/RLS sin clave privilegiada en cliente, cero acceso cruzado y limpieza selectiva; calidad afectada y sin repetir integralmente la suite 002.

## Phase 7: US5 — Recuperación de contraseña (P2, incluida en 003)

Prueba independiente: cuenta confirmada existente y correo real, sin membresías requeridas.

- [x] T028 [P] [US5] Preparar RED en `tests/unit/authentication/password-recovery.test.ts` y `tests/integration/authentication/recovery-links.test.mjs`: no enumeración, rate limit, canje válido/inválido/vencido/repetido/sin verifier, cancelación y reinicio antes/después del canje. Query type=recovery o SIGNED_IN aislado nunca producen ready.
- [x] T029 [US5] Implementar requestRecovery/completeCallback/setRecoveredPassword en `src/features/authentication/application/auth-actions.ts`, `session-coordinator.ts`, `infrastructure/supabase-auth-adapter.ts`, `auth-links.web.ts`, `auth-links.native.ts`; propósito ligado al flujo PKCE y estado recovery persistido de la sesión, sin autoridad de params/metadata. Reusar parser de confirmación, no segundo consumidor; limpiar URL, actualizar clave y cerrar localmente, sin exponer token a operaciones ordinarias.
- [x] T030 [US5] Crear `src/features/authentication/presentation/forgot-password-screen.tsx`, `reset-password-screen.tsx`, rutas `src/app/(auth)/forgot-password.tsx`, `src/app/auth/callback.tsx`, `reset-password.tsx` y pruebas `tests/presentation/password-recovery.test.mjs`; mensajes no enumerativos, carga/éxito/error/reenvío/cancelación, guardas restringidas y retorno a login. Reutilizar componentes y preservar rutas públicas.
- [ ] T031 [US5] Ejecutar correo/retorno real Web con vista original cerrada, recarga, clave nueva y nuevo login; repetir enseguida Android con build propio y aplicación cerrada/activa, no solo Expo Go. Registrar `docs/evaluacion/evidencias/003-autenticacion/us5-web.md` y `us5-android.md`, SC-005 válido/expirado/reutilizado/inválido/sin verifier/cancelado; no guardar enlaces ni contraseñas y limpiar datos autorizados.
- [ ] T032 [US5] Ejecutar regresiones afectadas de confirmación/login/logout/restauración tras integrar recovery, pruebas Node/Metro y controles de calidad, en `docs/evaluacion/evidencias/003-autenticacion/us5-regresiones.md`; verificar en Web y Android que recuperación no entra a negocio, reinicio conserva restricción o falla seguro, cancelar/salir no rehidrata sesión vieja. No repetir pruebas costosas ajenas al cambio.

## Phase 8: Polish & Cross-Cutting Concerns — cierre conjunto

- [ ] T033 Auditar seguridad del cliente real en `docs/evaluacion/evidencias/003-autenticacion/seguridad-web.md`: renderizado no ejecuta contenido malicioso, sin HTML inseguro/scripts innecesarios, datos privados fuera del HTML/export, URL callbacks saneada, claves solo públicas, storage namespaces/limpieza. Verificar HTTPS y CSP efectiva en origen de aceptación publicado si existe; si requiere hosting/configuración no aprobados, registrar bloqueo antes de operar. Documentar riesgo XSS residual de almacenamiento JS sin afirmar garantía HttpOnly ni auditoría npm superada.
- [ ] T034 Comprobar accesibilidad final en Web (teclado/foco/lector) y enseguida Android (TalkBack/texto máximo/Atrás/zonas seguras/48dp), con pruebas de presentación afectadas y evidencia real en `docs/evaluacion/evidencias/003-autenticacion/accesibilidad-web.md` y `accesibilidad-android.md`; no heredar aprobación 001 ni inventar medición exacta de escalado. Corregir solo defectos demostrados de flujos 003 y revalidar ambas plataformas afectadas.
- [ ] T035 Ejecutar auditoría arquitectónica real y regresiones checkers, tipos/lint/formato/unitarias/integración/presentación y check general en `docs/evaluacion/evidencias/003-autenticacion/calidad-final.md`; comprobar core sin SDK/RN/DOM/HTTP, composición explícita y Metro/Node compatibles. Reconciliar evidencia funcional por FR/SC e historias en `informe.md`, reutilizando recorridos válidos de la misma versión y repitiendo solo afectados; ningún fallo/pending obligatorio permite cierre conjunto.
- [ ] T036 Verificar conservación por inventario T001, diferencias autorizadas, enlaces y ausencia de secretos/fixtures residuales en `docs/evaluacion/evidencias/003-autenticacion/cierre.md`; actualizar `ESTADO-DESARROLLO.md` y `informe.md` con 003 frente al SaaS futuro/Google y riesgos npm. Comprobar git diff --check global y excluyendo únicamente log activo, sin editarlo; revisar casillas con evidencia individual. No commit/push sin autorización nueva.

## Dependencies & Execution Order

Setup: T001 primero; T002 y T003 pueden solaparse sin escribir los mismos archivos;
T004 espera ambos. Fundación: T005 → T006 → T007 → T008 → T009. Las historias no se
inician antes de esta base: si falta aprobación/configuración/build, no fingir su aceptación.

Cada tarea de historia espera la anterior de su fase salvo `[P]`: T010 y T012 pueden
trabajar archivos distintos al completar base; T013 espera ambas y T011; T014 espera T013.
T015 espera base y bootstrap T011–T013; T016→T017→T018→T019. T020→T021→T022→T023
después de US2; T024→T025→T026→T027 después de US3; T028→T029→T030→T031→T032
después de US4 en la ejecución recomendada. T033→T034→T035→T036 tras todas las historias.

Grafo recomendado: Setup → Fundación → US1 → US2 → US3 → US4 → US5 → Cierre.
Es orden de integración seguro por archivos compartidos, no dependencia comercial artificial:
US2/US3/US5 se prueban con cuenta existente; US4 con fixtures, sin UI de gestión ni registro.
No modificar concurrentemente session-coordinator, adapter, provider o rutas raíz.

### Parallel examples por historia

- US1: T010 pruebas y T012 campo compartido, tras base; unir antes de T013.
- US2: durante T015 pueden prepararse pasos de evidencia Web/Android de T019; no
  ejecutar ni marcar T019 hasta integración completa. Código compartido secuencial.
- US3: T020 permite preparar matriz de dispositivo T023 sin ejecutar casos aún ausentes.
- US4: T024 permite preparar documentación de fixtures T027, sin crear datos ni mutaciones.
- US5: T028 permite preparar recorridos de enlaces T031; canje/SDK se modifican secuencialmente.
Solo `[P]` marca trabajo de código/pruebas independiente de otros archivos; no transforma
preparación de evidencias en resultado ejecutado.

## Implementation Strategy

Primer lote sugerido para autorización posterior: T001–T004, conservación/análisis/decisiones,
sin instalar ni Cloud. T005–T009 solo tras las autorizaciones concretas registradas.
Primer incremento demostrable: US1 en ambas plataformas, sin declarar 003 ni login completo;
luego US2 completa acceso/salida. No MVP Web aislado: cada incremento verifica Web e
inmediatamente Android y corrige defectos antes de considerarse aceptado. No dejar todo
Android para la fase final; T034/T035 son consolidación, no primera prueba de Android.

Tareas de implementación pueden concluir con sus pruebas específicas aunque aceptación
funcional siguiente siga abierta; no cerrar historia/SC hasta su evidencia real conjunta.
RED previsto de tarea de pruebas se registra como tal, no como producto funcionando.
Las casillas solo se actualizan tras ejecución y verificación individual autorizada;
el informe registra T001–T008; T009 requiere autorización específica antes de ejecutarse.

## Trazabilidad

| Requisito | Tareas principales |
| --- | --- |
| FR-001 | T010–T014 |
| FR-002 | T004, T009–T014 |
| FR-003 | T010–T014 |
| FR-004 | T008, T010–T014, T019 |
| FR-005 | T015–T019 |
| FR-006 | T006–T008, T020–T023 |
| FR-007 | T020–T023 |
| FR-008 | T015–T019, T023 |
| FR-009 | T016, T018–T025 |
| FR-010 | T013, T015–T019, T030, T032 |
| FR-011 | T024–T027 |
| FR-012 | T024–T027 |
| FR-013 | T024–T027 |
| FR-014 | T024–T027 |
| FR-015 | T028–T031 |
| FR-016 | T028–T032 |
| FR-017 | T012–T014, T017, T022, T026, T030, T034 |
| FR-018 | T006–T008, T025, T035 |
| FR-019 | T014, T019, T023, T027, T031–T032, T035 |
| FR-020 | T001–T004, T014, T019, T023, T027, T031–T036 |

| Criterio | Acreditación |
| --- | --- |
| SC-001 | T014 tramo registro/perfil; T019 consolida acceso completo en ambas plataformas. |
| SC-002 | T019, T023, T032 y consolidación T035. |
| SC-003 | T023; regresión afectada T032. |
| SC-004 | T027 y consolidación T035. |
| SC-005 | T031–T032. |
| SC-006 | Recorridos T014/T019/T023/T027/T031–T032 más T033–T036. |

Distribución: Setup 4; Fundación 5; US1 5; US2 5; US3 4; US4 4; US5 5; cierre 4 = 36.
Constitución: cliente/servidor y backend 002 conservados (I–VII); Spec Kit y pruebas
trazables Web/Android (VIII–X); evidencia académica y estado compartido (XI–XII).
No se declaran caché, DNS/CDN, CI/CD o k6 del producto satisfechos por sesión o por plan.
Nueve moderados npm siguen riesgo separado; configuración externa exige aprobación,
no usar excepciones silenciosas para evitar gates. Google obligatorio posteriormente;
reservas/pagos/personal y demás negocio fuera de 003.
