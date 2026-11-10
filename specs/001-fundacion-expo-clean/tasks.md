---
description: "Tareas ejecutables para la fundación técnica de App Barbería"
---

# Tasks: Fundación técnica de Expo, React Native y Clean Architecture

**Input**: Documentos aprobados de `specs/001-fundacion-expo-clean/`.
**Prerequisites**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contrato](contracts/foundation.md),
[quickstart.md](quickstart.md) y [validation.md](validation.md); AGENTS.md y Constitución v1.0.1.
**Tests**: Requeridos por FR-010; escribir casos antes de implementar su comportamiento y
registrar fallo esperado y aprobación posterior. No exigir fallo de toda la aplicación por cada tarea.
**Organization**: Preparación y base común, luego US1 (P1), US2 (P1), US3 (P2), cierre transversal.

## Format: `[ID] [P?] [Story] Description`

Todas las casillas empiezan pendientes. `[P]` permite trabajo simultáneo solo tras cumplir
las dependencias indicadas, en archivos distintos. No implica autorización para iniciar agentes.
Cada tarea se cierra con ejecución/evidencia, no con una afirmación de intención.

## Path Conventions

Rutas relativas a la raíz Git; convertirlas a absolutas y usar LiteralPath en PowerShell.
`E` significa `docs/evaluacion/evidencias/001-fundacion/` (archivos nuevos durante implementación).
`M` significa carpeta temporal externa exclusiva para manifiestos, cuya ruta absoluta se registra
en `E/informe.md`. No contiene secretos. Crear solo directorios con consumidores reales.
Este comando solo genera este tasks.md; las acciones siguientes pertenecen a implementación futura.

## Phase 1: Setup — preservación y Expo (6 tareas)

**Purpose**: Incorporar Expo sin perder contenido previo ni historial. Puerta bloqueante: cualquier
colisión diferente o ruta fuera de raíz detiene toda la copia, antes de escribir destinos.

- [ ] T001 Registrar raíz, HEAD, rama, estado Git y versiones Node/npm/PowerShell en `M/entorno-antes.json`; inventariar todos los archivos previos fuera de `.git` con ruta, longitud y SHA-256 en `M/archivos-antes.json`, incluyendo `.agents`, `.specify`, `docs`, `AGENTS.md`, `skills-lock.json`, `specs` y archivos versionados; detener ante reparse points sin resolver (FR-001, SC-001; sin dependencia).
- [ ] T002 Comprobar versiones/engines de research.md y registrar fuentes vigentes en `M/versiones.json`; preparar staging temporal nuevo y ejecutar allí create-expo-app con `default@sdk-58 --no-install`, nunca en la raíz; inspeccionar manifiesto generado y registrar versión efectiva del generador/plantilla; detener ante contradicción sin forzar peers (FR-002; depende T001).
- [ ] T003 Elaborar `M/incorporaciones.json` como allowlist de archivos necesarios hacia `package.json`, `app.json`, configuraciones y assets nuevos; normalizar rutas, comparar sin distinción de mayúsculas, detectar ancestros archivo/directorio y destinos existentes; conservar idénticos y detener ante toda colisión no autorizada diferente, sin `-Force` (FR-001, SC-001; depende T002).
- [ ] T004 Copiar solo entradas nuevas de `M/incorporaciones.json` a la raíz, excluyendo `.git`, dependencias y ejemplos innecesarios; comparar cada archivo original y HEAD/rama con T001 en `M/archivos-despues-copia.json`; aceptar únicamente cero cambios/eliminaciones previos y cero pérdida de historial (FR-001, SC-001; depende T003).
- [ ] T005 Fijar en `package.json` Expo 58.0.23, RN 0.88.1, React 19.3.0, Router 58.0.30 y TS 6.0.3; resolver herramientas/rangos de research.md, instalar con npm y producir `package-lock.json`; ejecutar `npm ls --depth=0`, `npx expo install --check` y `npx expo-doctor`, guardando salidas en `M/dependencias.log`; detener ante incompatibilidades sin ignorarlas (FR-002, FR-010; depende T004).
- [ ] T006 Recomparar contenidos protegidos tras instalación y guardar `M/archivos-despues-instalacion.json`; crear `E/informe.md` con enlaces a manifiestos y registros sanitizados de T001–T005, incluyendo archivos nuevos y discrepancias; no avanzar con hashes distintos sin resolver (FR-001, FR-011, SC-001, SC-006; depende T005).

## Phase 2: Foundational — herramientas y UI común (7 tareas)

**Purpose**: Configurar controles antes de implementar historias; no declarar checker aprobado sobre
un núcleo vacío. En esta fase se valida su comportamiento contra fixtures; la auditoría real es T026.

- [ ] T007 Configurar `tsconfig.json` extendiendo Expo con strict y alias `@/*`; añadir `tsconfig.core.json` con lib ES2022, types vacío y dominio/aplicación únicamente, sin DOM/Node; no desactivar comprobaciones strict (FR-004, FR-005, FR-010; depende T006).
- [ ] T008 [P] Configurar `eslint.config.js`, `.prettierrc.json` y `.prettierignore` para ESLint flat Expo y Prettier separados; limitar formato a archivos nuevos enumerados y excluir todos los contenidos protegidos de T001 (FR-010; depende T006).
- [ ] T009 Configurar `tsconfig.tests.json` y `scripts/run-unit-tests.mjs`: compilar a `.test-build`, NodeNext/ES2022/strict/noEmit false, imports relativos `.js`, sin TSX; ejecutar Node test con argumentos explícitos, incluir todos los ejecutables del núcleo en cobertura, exigir líneas/funciones 100 % y ramas 90 %, excluir dobles/tests; limpiar solo salida propia con ruta verificada (FR-010, SC-004; depende T007).
- [ ] T010 Crear fixtures válidas/negativas y pruebas en `tests/architecture/check-architecture.test.mjs` y `tests/architecture/fixtures/`: imports externos, tipos, reexports, aliases, transitividad, ciclos, globals remotos/Node, import dinámico no resoluble, referencias sin resolver y núcleo vacío; comprobar que cada caso inválido exige exit distinto de cero (FR-005, FR-010; depende T007).
- [ ] T011 Implementar `scripts/check-architecture.mjs` con TS Compiler API, resolución tsconfig, AST y grafo conforme validation.md; bloquear inversiones de capas y rutas hacia infraestructura, contar módulos y rechazar análisis vacío; ejecutar fixtures de T010 y guardar reporte `E/arquitectura-fixtures.log` (FR-004, FR-005, SC-003; depende T010).
- [ ] T012 Integrar scripts `typecheck`, `lint`, `format:check`, `architecture:check`, `test`, `check` y `start` en `package.json`; typecheck debe comprobar app y núcleo, check parar al primer fallo y test ejecutar también regresiones arquitectónicas; crear `.gitignore` nuevo para `.test-build`, `.expo`, node_modules y salidas generadas sin ignorar evidencias revisables (FR-010; depende T008, T009, T011).
- [ ] T013 Crear tokens provisionales y componentes mínimos en `src/shared/ui/tokens.ts`, `app-text.tsx`, `app-button.tsx`, `screen.tsx` conforme contrato: tipografía del sistema, escala permitida, scroll/safe areas, nombre/rol y controles >=48×48 dp; sin librería UI adicional ni estilos de negocio (FR-008, FR-009; depende T012).

**Checkpoint**: Preparación preservada y herramientas configuradas; pruebas de arquitectura contra
fixtures ejecutadas. El núcleo y los recorridos reales siguen pendientes.

## Phase 3: User Story 1 — iniciar sin perder trabajo (Priority: P1) — 6 tareas

**Goal**: Base Android navegable sin backend. **Independent Test**: hashes originales intactos,
arranque sin credenciales y tres recorridos, retorno y fallback en Android documentados.

### Implementation for User Story 1

- [ ] T014 [US1] Configurar `app.json` y `src/app/_layout.tsx` con Router, entrada `expo-router/entry` en `package.json` y Stack estable; no agregar tabs, API routes ni inicialización de backend (FR-002, FR-003; depende T013).
- [ ] T015 [P] [US1] Crear `src/features/foundation/presentation/welcome-screen.tsx` y `not-found-screen.tsx` con App Barbería, «Ver base técnica» y «Volver al inicio», usando UI común y callbacks de navegación sin infraestructura (FR-003, FR-008; depende T014).
- [ ] T016 [P] [US1] Crear cascarón de `src/features/foundation/presentation/technical-screen.tsx` con título y contenido técnico estático, sin falsas funcionalidades ni promesas de aislamiento; preparar consumo posterior de consulta en US2 (FR-003, FR-007; depende T014).
- [ ] T017 [US1] Crear `src/app/index.tsx`, `technical.tsx` y `+not-found.tsx` como rutas delgadas que montan vistas; configurar navegación a `/technical`, Atrás nativo/cabecera y replace a `/` desde ruta desconocida (FR-003; depende T015, T016).

### Manual Android — no sustituir por exportación

- [ ] T018 [US1] Identificar dispositivo físico y Expo Go compatible SDK58 o AVD, red/Metro y prerrequisitos según quickstart.md; registrar modelo, Android, cliente y disponibilidad de ADB en `E/android-entorno.md`; si falta entorno dejar tarea pendiente y explicar bloqueo sin afirmar pruebas (FR-002, FR-011; depende T017).
- [ ] T019 [US1] Ejecutar arranque sin backend, tres recorridos `/` → `/technical` → Atrás, cabecera, reinicio desde raíz y URL desconocida con recuperación; guardar resultados/capturas en `E/android-navegacion.md` y `E/capturas/`; comprobar hashes de T001 antes de aceptar historia (FR-001, FR-003, SC-001, SC-002; depende T018).

**Checkpoint**: MVP navegable de US1 solo se acepta tras T019 ejecutada. Su cascarón no acredita
US2/US3. Si falta Android, continuar trabajo local admisible conservando US1 pendiente.

## Phase 4: User Story 2 — núcleo y adaptadores sustituibles (Priority: P1) — 9 tareas

**Goal**: Operación técnica independiente de UI/SDK. **Independent Test**: unitarias con adaptador
local y doble, y auditoría de todos los módulos reales sin interfaz, red ni base de datos.

### Tests for User Story 2

- [ ] T020 [US2] Escribir `tests/unit/get-app-information.test.ts` y `tests/unit/local-app-information-adapter.test.ts` con doble en memoria en `tests/unit/doubles/app-information-gateway.ts`: éxito con ambos adaptadores, una llamada; idioma inválido/vacío/solicitud malformada, cero llamadas; rechazo y configuración malformada, no-disponible sin datos internos; reintento posterior exitoso; registrar fallo inicial (FR-006, FR-010, SC-004; depende T012).

### Implementation for User Story 2

- [ ] T021 [US2] Definir en `src/features/foundation/domain/app-information.ts` los tipos propios: «`idioma`: cadena; solo `es-PE` aceptado», «`nombre`, `version`, `descripcion`: cadenas no vacías», resultado «`ok` con información, `entrada-invalida`, `no-disponible`»; información inmutable sin usuario/tenant (FR-005, FR-006; depende T020).
- [ ] T022 [US2] Implementar `src/features/foundation/domain/validate-information-request.ts` con validación runtime de solicitud existente e idioma es-PE; cero imports externos, Node/DOM o aplicación (FR-005, FR-006; depende T021).
- [ ] T023 [US2] Implementar contrato `InformacionAplicacionGateway.obtener(): Promise<InformacionAplicacion>` en `src/features/foundation/application/app-information-gateway.ts` y función `ConsultarInformacionAplicacion` en `get-app-information.ts`; validar antes de llamar, devolver unión propia y convertir rechazo a no-disponible sin filtrar excepciones (FR-005, FR-006; depende T022).
- [ ] T024 [US2] Implementar `src/features/foundation/infrastructure/local-app-information-adapter.ts` con datos públicos inyectados, validación de cadenas no vacías y rechazo controlado de configuración malformada; completar doble de T020 sin introducir SDK/red (FR-006, FR-007; depende T023).
- [ ] T025 [US2] Construir `src/composition/app-composition.ts`, `app-provider.tsx` y `src/features/foundation/presentation/information-context.ts`; inyectar adaptador al caso de uso y exponer solo su función a presentación; `_layout.tsx` monta proveedor sin instanciar adaptadores; núcleo no lee app.json (FR-004, FR-006; depende T024, T017).
- [ ] T026 [US2] Ejecutar unitarias/cobertura, regresiones arquitectónicas y auditoría sobre todos los archivos reales del núcleo; guardar `E/nucleo-pruebas.log`, `E/nucleo-cobertura.log` y `E/arquitectura-real.log` con conteos, rutas, exit codes y casos negativos detectados; corregir fallos antes de cerrar (FR-004, FR-005, FR-006, FR-010, SC-003, SC-004; depende T025).
- [ ] T027 [US2] Integrar consulta y reintento en `src/features/foundation/presentation/use-app-information.ts` y `technical-screen.tsx`: cargar al entrar, ignorar respuestas tras desmontar y bloquear solicitudes duplicadas; mostrar datos públicos/resultados propios sin imports de infraestructura en vistas/rutas (FR-006, FR-007; depende T026, T016).
- [ ] T028 [US2] Registrar en `E/limites-backend.md` revisión de composiciones cliente/servidor futuras según contracts/foundation.md y grafo actual; comprobar ausencia de SDK activo, secretos, API Node, rutas +api y carpetas Supabase sin consumidor, sin atribuir RLS/transacciones reales al adaptador local (FR-007, SC-006; depende T027).

**Checkpoint**: US2 se demuestra por pruebas del núcleo, independientemente de contar con teléfono.
Integrar T027 no modifica los contratos de navegación de US1.

## Phase 5: User Story 3 — accesibilidad y calidad (Priority: P2) — 7 tareas

**Goal**: Muestra reusable y accesible. **Independent Test**: controles automáticos aprobados y
recorrido TalkBack/texto 200 % con medidas y capturas; no basta una revisión visual de código.

### Tests for User Story 3

- [ ] T029 [US3] Escribir y ejecutar `tests/unit/contrast.test.ts` con cálculo de luminancia/contraste y pares conocidos, más todos los pares semánticos usados de `src/shared/ui/tokens.ts`; exigir texto normal >=4.5:1, grande >=3:1 y controles/foco >=3:1, registrando cualquier fallo antes de ajustar tokens (FR-009, SC-005; depende T013).

### Implementation for User Story 3

- [ ] T030 [US3] Completar `src/shared/ui/status-message.tsx` para carga, vacío, error con recuperación y éxito; revisar tokens de T013 y componentes para roles, nombres, foco, disabled, avisos sin repetición, texto escalable y 48×48 dp; resolver ratios fallidos sin cambiar el contrato (FR-008, FR-009; depende T029).
- [ ] T031 [US3] Completar galería visual etiquetada de cuatro estados y consulta real en `src/features/foundation/presentation/technical-screen.tsx`; reutilizar StatusMessage sin forzar fallos en dominio ni inventar negocio y comprobar bienvenida/recuperación con los componentes definitivos (FR-008, FR-009; depende T030, T027).

### Automated Verification

- [ ] T032 [US3] Ejecutar `npm run check`, `npx expo install --check`, `npx expo-doctor` y exportación Android de quickstart.md; guardar `E/calidad-final.log`, cobertura y `E/empaquetado-android.log`, corregir fallos y verificar hashes protegidos; exportar no acredita ejecución Android (FR-002, FR-005, FR-010, SC-003, SC-004; depende T031, T028).

### Manual Android

- [ ] T033 [US3] Repetir en Android los tres recorridos, fallback, reinicio y consulta sin credenciales sobre la versión final; comprobar vistas locales sin internet manteniendo Metro accesible; registrar versión/diff y resultados en `E/android-final.md` con nuevas capturas (FR-003, FR-007, FR-011, SC-002; depende T032, T018).
- [ ] T034 [US3] Activar TalkBack y recorrer todos los controles/estados finales: orden, nombre/rol, foco, disabled, carga/error/éxito, recuperación; medir áreas >=48 dp y zonas seguras; registrar observaciones y correcciones en `E/android-talkback.md` (FR-008, FR-009, SC-005; depende T033).
- [ ] T035 [US3] Configurar y comprobar fuente efectiva al 200 %, recorrer todo el contenido sin recortes impeditivos, revisar scroll y restaurar ajuste original; registrar escala antes/durante/después, medidas, ratios y capturas en `E/android-texto-contraste.md`; dejar pendiente si no puede acreditarse el 200 % (FR-009, SC-005; depende T034).

**Checkpoint**: Si T033–T035 detectan cambios necesarios, corregir dentro de alcance y repetir los
controles afectados de T032 y recorridos impactados; registrar la versión realmente comprobada.

## Phase 6: Polish & Cross-Cutting Concerns — 5 tareas

- [ ] T036 Redactar `E/reproduccion.md` con prerrequisitos, versiones efectivas del lockfile, comandos, solución de errores y pasos Android derivados de quickstart.md; documentar contraste y límites sin modificar documentos aprobados (FR-002, FR-011; depende T032).
- [ ] T037 Reproducir instalación con `npm ci` usando `package-lock.json` y ejecutar `npm run check` desde la guía nueva, registrando `E/reproduccion.log`; comparar archivos originales protegidos tras la reproducción y detener cierre ante diferencias (FR-001, FR-010, SC-001, SC-004; depende T036).
- [ ] T038 Consolidar `E/informe.md` con matriz FR-001–FR-011/SC-001–SC-006 y evidencias vinculadas: fecha America/Lima, HEAD+diff, entorno, comando/exit code, resultado y límite; distinguir contribución parcial a rúbrica 1–7 y pendientes 8–16, sin declarar criterios académicos validados por documentación (FR-011, SC-006; depende T028, T035, T037).
- [ ] T039 Crear `ESTADO-DESARROLLO.md` con avances demostrados, decisiones y pendientes; referenciar `E/informe.md`, composiciones futuras y obligaciones posteriores de caché/DNS-CDN/CI-CD/k6; conservar AGENTS.md, Constitución, especificación, plan y demás archivos previos intactos (FR-007, FR-011, SC-006; depende T038).
- [ ] T040 Auditar diff y estado final, comparar hashes de todos los originales contra `M/archivos-antes.json`, HEAD y rama; registrar incorporaciones y resultado en `E/cierre.md`; aceptar la feature solo con los seis SC acreditados, sin commit ni push; bloqueos Android mantienen cierre pendiente (FR-001, FR-011, SC-001, SC-006; depende T039).

## Dependencies & Execution Order

Setup T001→T006 bloquea todas las instalaciones y copias posteriores. Base común T007→T013
bloquea historias; dentro de ella T008 puede acompañar T007 sin tocar los mismos archivos.

```text
Setup → Base común → US1 navegación mínima → US2 integración → US3 final → Cierre
                  └→ US2 pruebas/núcleo (T020–T024) ───────┘
                  └→ US3 contraste (T029) ────────────────┘
```

Dependencias exactas figuran en cada tarea. T020–T024 pueden avanzar tras T013 aunque falte
Android en T018; T025 espera las rutas T017, no la aceptación manual T019. T026 requiere núcleo
real: no aceptar el checker por aprobar solo fixtures. T033 necesita entorno Android acreditado.
T038–T040 no se marcan completos si T035 o cualquier SC sigue pendiente.

### Parallel Opportunities and Examples

- Base: T007 y T008 tras T006; luego continuar con runner y fixtures en orden explícito.
- US1: T015 y T016 tras T014 escriben vistas diferentes; T017 las integra después.
- US2: T020–T024 pueden acompañar T015–T019; T025 debe esperar T017 y T024.
- US3: T029 puede acompañar trabajo de US2 tras T013; T030 espera sus resultados y T031
  espera la consulta integrada T027. T034/T035 se ejecutan en serie porque cambian el mismo equipo.
- No paralelizar instalaciones, cambios a package.json, capturas del mismo dispositivo ni tareas
  que escriban un mismo informe. `[P]` no elimina ninguna dependencia listada.

## Implementation Strategy

MVP inicial: fases 1–3, con navegación y preservación verificadas en Android. Es una base parcial,
no el cierre de la feature. Incremento siguiente: US2 prueba independencia con adaptadores reales
y de prueba. US3 completa estados, controles y aceptación accesible. El cierre exige toda la matriz.

No instalar herramientas, crear backend, persistencia, módulos vacíos ni pantallas de negocio fuera
del plan. Si dependencias publicadas contradicen research.md, registrar evidencia y detener la parte
afectada antes de proponer ajuste; no modificar decisiones aprobadas silenciosamente.

## Traceability

| Requisito | Tareas principales | Criterios |
| --- | --- | --- |
| FR-001 | T001–T006, T019, T037, T040 | SC-001 |
| FR-002 | T002, T005, T014, T018, T032, T036 | SC-002 |
| FR-003 | T014–T019, T033 | SC-002 |
| FR-004 | T007, T011, T025, T026 | SC-003 |
| FR-005 | T007, T010–T011, T021–T023, T026 | SC-003 |
| FR-006 | T020–T027 | SC-003, SC-004 |
| FR-007 | T014, T024, T027–T028, T033 | SC-002, SC-006 |
| FR-008 | T013, T015, T030–T031, T034 | SC-005 |
| FR-009 | T013, T029–T031, T034–T035 | SC-005 |
| FR-010 | T005, T007–T012, T020, T026, T032, T037 | SC-004 |
| FR-011 | T006, T018–T019, T033, T036–T040 | SC-006 |

## Notes

40 tareas: Setup 6, base común 7, US1 6, US2 9, US3 7, cierre 5. Ninguna ejecutada por este
comando. Los archivos de evidencias aún no existen; se crearán al realizar cada comprobación.
Los tests y conteos aquí describen aceptación futura, no resultados obtenidos.
