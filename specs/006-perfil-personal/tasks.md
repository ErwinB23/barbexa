# Tasks: 006 — Perfil personal

**Reconciliación24/11:** W004 y W004b aceptadas por el usuario en Web. Las limitaciones
Web del19/11 que aparecen más abajo son históricas; T006 conserva Android pendiente.

Input: spec.md, plan.md y contrato de perfiles002. Rama actual conservada; sin Git writes.

## Setup / Fundamentos

- [x] T001 Contrastar RF05/HU04, RLS002 y dependencias en `research.md`, `contracts/profile.md` y `plan.md`.

## US1 — Editar mis datos (P1)

- [x] T002 [US1] Añadir y ejecutar RED de validación, respuesta ajena, sesión tardía y deduplicación en `tests/unit/authentication/profile-edit.test.ts`; verificar composición en `tests/integration/authentication/profile-edit.test.mjs`.
- [x] T003 [US1] Implementar acción en `src/features/authentication/application/session-coordinator.ts`, puerto en `auth-gateway.ts` y conexión002 en `src/composition/auth-composition.ts`.
- [x] T004 [US1] Integrar formulario accesible en `src/features/authentication/presentation/personal-profile-editor.tsx` y `account-screen.tsx`; probar Web/Android con dobles en `tests/presentation/profile-edit.test.mjs`.

## Validación transversal

- [x] T005 Validar pruebas dirigidas, tipos, lint, formato, arquitectura y diff; registrar resultados aquí.
- [ ] T006 Acreditar SC-003 en Web y Android reales durante el recorrido integral de `quickstart.md`, con autorización de edición de cuenta ficticia.

Componente Web de T006 acreditado20/11 en B4 por Codex, Chrome real y sesionesGoTrue
LOCAL:2PATCH200 a perfil ficticio propio, nombre/teléfono temporal persistidos y valores
originales exactos restaurados (phone null), visibles tras nueva navegación. Cancelar
sin guardar se acreditó en preparación B4. Reservas40/43detalles/pagos/perfilesajenos
conservados. Ver `docs/evaluacion/evidencias/004-reservas/b4-ejecucion.json`.
T006 permanece abierta por aceptación conjunta/Android; no ejecución manual delusuario.

Dependencias: T001 → T002 → T003 → T004 → T005 → T006. Preparación de UI y pruebas
de composición pueden diseñarse conjuntamente tras contrato; no requiere agentes paralelos.
Estrategia: núcleo compartido y composición Web primero/Android enseguida; validación
física queda abierta hasta ejecución. Sin modificar progreso de003–005.

Ejecución15/11: RED9/9 unitarias por acción inexistente (código1), RED4/4 formulario
ausente (código1); GREEN9 nuevas +23 regresiones unitarias (32/32, código0).
Composición/UI/ciclo de sesión/rutas:43/43, código0; incluye2 nuevas de composición y8
de presentación con dobles Web/Android. El primer ejecutor de composición quedó signed-out
porque su doble no había establecido propósito normal; corregido haciendo login simulado
por el adaptador existente, sin debilitar restauración. No fue una operación real de Auth.
No se ejecutó PATCH real ni se modificaron cuentas, reservas o servicios.
Tipos, ESLint y Prettier de los archivos afectados y grafo arquitectónico: código0.
`git diff --check`: global2 por log activo conservado; excluyendo únicamente ese log,0.
Las fuentes nuevas de003/006 todavía no están versionadas; su formato se comprobó
directamente con Prettier, no se infiere de `git diff`. T006 permanece pendiente.

## Etapa 1 Web — organización según permisos existentes

- [x] W001 Delimitar presentación/rutas y documentar la jerarquía futura sin implementarla.
- [x] W002 RED→GREEN de navegación, perfil y visibilidad; reutilizar casos existentes y
  separar recepción de invitaciones, espacio profesional y gestión de equipo.
- [x] W003 Verificar regresiones, tipos, lint, formato, arquitectura y navegador con dobles.
- [x] W004 Aceptación manual Web según membresías reales, confirmada por el usuario el24/11/2026; no cierra el componente Android de T006.
  - [x] W004a Recorrido de cliente sin membresías, reportado y aprobado por el usuario19/11:
    lateral reorganizado, avatar, perfil sin bloque de trabajo e invitaciones personales
    en navegación. Inicio/diseño premium conservados y aprobados. No ejecución de Codex.
  - [x] W004b Recorridos profesional/administrador y múltiples membresías aceptados por
    declaración del usuario el24/11/2026. No repetir el recorrido aprobado sin causa nueva.

Aprobación oficial de Etapa1 limitada al recorrido cliente anterior. Interfaces congeladas
hasta solicitud específica. La navegación a invitaciones no acredita aceptar/rechazar una
invitación real. T006 continúa abierta: guardar/cancelar/restaurar perfil y aceptación
Web/Android conservan sus criterios adicionales; esta aprobación no cierra006.

19/11: RED5 casos nuevos por accesos mezclados/ausentes; GREEN ampliado10 nuevos,
76/76 comprobaciones dirigidas de presentación/composición/contexto/aislamiento/perfil e
invitaciones, solo dobles. Tipos cliente/núcleo, ESLint, Prettier y arquitectura0; exportación
Web local aprobada sin despliegue. Chrome aislado6 anchos320–1672 y6 interacciones más
10 aserciones de visibilidad para barbero/administrador. Sin sesiones, HTTP de negocio ni
escrituras/envíos reales. `.artifacts/private-home-browser/` conserva capturas/resultados;
las pruebas automatizadas no acreditan aceptación física ni política futura de propietarios.
