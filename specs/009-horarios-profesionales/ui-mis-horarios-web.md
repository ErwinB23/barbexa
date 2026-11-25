# Mis horarios — ajuste premium Web

Referencia aprobada por el usuario el 23/11/2026. Ajuste de presentación de 009:
no añade rutas, endpoints ni permisos y no cambia contratos de persistencia.

## Alcance y criterios

- Conservar las cuatro pestañas del espacio profesional y el controlador existente.
- Separar presentación/horario real del local, editor semanal y bloqueos personales.
- Consultar mediante `SelfScheduleApplication.read`; mostrar el horario general
  recibido, con múltiples intervalos por día, sin editarlo ni inventar horarios.
- Preparar intervalos temporalmente con desplegables. Conservar opciones de15min
  y límites/minutos exactos existentes. Respetar las ventanas del local y los
  solapamientos mediante validadores existentes, sin introducir reglas paralelas.
- Guardar con el mecanismo/versionado actual. Confirmar explícitamente cuando
  guardar una lista vacía retiraría horarios personales ya existentes.
- Usar selectores de fecha/hora para bloqueos y conservar la conversión de Lima,
  su edición/retirada, motivo opcional y preparación de otro formulario sin guardar.
- Mantener estados de consulta, vacío, error, conflicto, actualización y éxito.
- Adaptar las columnas en móvil sin alterar Mi agenda, Resumen ni Perfil profesional.

## Archivos y componentes

1. `src/features/barbershop-operation/presentation/self-schedule.tsx`:
   conserva el controlador y handlers de lectura/guardado; compone la vista Web
   y valida el intervalo Web con el dominio antes de añadirlo al borrador.
2. `src/features/barbershop-operation/presentation/self-schedule-web.tsx`:
   nueva composición de las tres tarjetas, horario del local informativo y bloqueos
   con controles datetime-local que entregan el formato anterior con espacio.
3. `src/features/barbershop-operation/presentation/self-schedule-web.styles.ts`:
   estilos específicos crema/marrón/dorado y distribución responsive.
4. `src/features/barbershop-operation/presentation/self-schedule-props.ts`:
   contrato de presentación compartido sin ciclos entre controlador y vista.
5. `src/features/barbershop-operation/presentation/self-schedule-options.ts`:
   proyección de opciones personales y uso de scheduleHours/ownSchedule existentes.
6. `src/features/barbershop-operation/presentation/self-schedule-weekly-web.tsx`:
   editor reutilizado, confirmación de retirada total, selectores contextualizados,
   lista ordenada y retirada por índice original.
7. `src/features/barbershop-operation/presentation/weekly-schedule-web.tsx`:
   ScheduleTimeSelect admite opciones/estado de opción opcionales. Su comportamiento
   por defecto para horarios administrativos permanece igual.
8. `tests/presentation/booking/self-schedule-premium.test.mjs`:
   nueva cobertura de selectores, validación, confirmación, bloques, controlador
   con aplicación real/gateway en memoria, round-trip de horarios y conflicto.
9. `docs/CODEX-HANDOFF.md`: continuidad y límites de verificación.
10. Este documento: alcance, criterios y trazabilidad del ajuste de presentación.

Se reutilizan SelfSchedulePanel, SelfScheduleWeeklyWeb, ScheduleTimeSelect,
AppButton, ShopSettingsIcon, validadores del dominio y SelfScheduleApplication.
Las mutaciones siguen usando versionado, identidad contextual y autorización
definitiva del servidor; no se añadieron servicios de guardado alternativos.

## Tareas y verificaciones

- [x] Inspeccionar rutas, componentes, casos de uso, contratos y validadores actuales.
- [x] Implementar las tres secciones y adaptar su distribución sin crear otra página.
- [x] Conservar consulta, lista temporal, guardado de intervalos y gestión de bloqueos.
- [x] Añadir confirmación de retirada total y mantener los campos ante un fallo.
- [x] `npm run test:client`: 506 pruebas aprobadas, sin fallos.
- [x] Pruebas dirigidas de self-schedule/premium/professional-workspace y contrato
  de integración self-schedule: 15 aprobadas, incluidos comportamientos Web/Android
  existentes. Dobles de persistencia y HTTP; no escrituras reales.
- [x] `npm run typecheck`, `npm run lint`, `npm run architecture:check` aprobados;
  Prettier sobre los archivos afectados aprobado.
- [x] `npx --no-install expo export --platform web --output-dir .artifacts/self-schedule-premium-web-build`:
  build Web correcto, sin despliegue, instalaciones ni APK.
- [x] Navegador Brave existente en `/staff?view=professional&section=schedules`:
  consulta de disponibilidad real y revisión de las tres tarjetas en escritorio
  aproximadamente1707px. Horarios generales con descansos correctos; el profesional
  seleccionado no tiene intervalos ni bloqueos registrados.
- [ ] Guardar, recargar y retirar horarios/bloqueos reales y verificar conflictos
  con citas comprometidas en backend. No se introdujeron datos de prueba Cloud;
  se requiere una prueba con horarios reales que el usuario quiera conservar.
- [ ] Verificar móvil/teclado completo y adaptación visual Android. La presentación
  Android existente se conserva y pasa sus regresiones; no se declara rediseñada.

No se modificaron backend, Auth, base de datos, permisos, horarios generales,
otras pestañas ni navegación. Las pruebas con gateway en memoria acreditan el
flujo del cliente y los payloads; no sustituyen una prueba real de persistencia DB.


## Ajuste 23/11/2026 — Evitar edición duplicada en administración

Petición explícita: quitar «Mis intervalos semanales» de Gestión de la barbería,
conservando el selector administrativo y los bloqueos personales/cierres/excepciones.
Prop opcional hideWeeklyEditor en self-schedule-props/Panel/Content/Web, activada
solo al montar la página schedules con rol administrador en operation-screen.
En Mi espacio profesional el editor semanal sigue disponible por defecto.
No borra intervalos ni modifica contratos/casos de uso/persistencia. Mis bloqueos
sigue perteneciendo a la cuenta iniciada, con aviso contextual explícito en Web.

Prueba nueva observada fallar y después pasar;13 dirigidas de self-schedule y
self-schedule-premium aprobadas, tipos y lint dirigido aprobados, formato y
git diff --check aprobados. No modificaciones Cloud ni migración/instalación/APK.
Pendiente revisión visual y aceptación en Android físico.
