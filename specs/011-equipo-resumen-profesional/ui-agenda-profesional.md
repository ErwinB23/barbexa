# Mi agenda profesional Web — ajuste de presentación

Solicitud del usuario del 23/11/2026, referencia premium adjunta. Complementa
las funcionalidades existentes 004/005/009/010/011; no cambia sus contratos,
permisos ni reglas de negocio.

## Alcance y criterios

- Conservar encabezado, contexto y cuatro pestañas del espacio profesional.
- Mostrar solo las citas del profesional de la barbería seleccionada, por fecha
  de Lima, con consulta diaria/semanal cronológica y filtro local de atención.
- Mostrar los totales del día seleccionado obtenidos del resumen propio del
  servidor; aplicar un filtro al listado no debe alterar esos totales.
- Mantener distinta la atención no verificada; nunca suponer que una cita está
  completada o pendiente si su lectura falló.
- Reutilizar atención/pagos, reprogramación, cancelación e historial existentes.
  Las mutaciones siguen requiriendo confirmaciones y autorización del servidor.
- Respetar permisos de servicios: el barbero consulta el catálogo existente;
  el administrador accede a la gestión existente. No hay editor de servicios
  propio del barbero disponible dentro de estas cuatro pestañas.
- Diseñar carga, actualización, vacío y recuperación; paneles a dos columnas
  en escritorio y apilados en tamaños estrechos, sin afectar las otras secciones.

## Implementación y archivos

1. `src/composition/professional-agenda.web.tsx`: nueva vista, filas, leyenda,
   resumen lateral, accesos y composición de acciones existentes.
2. `src/features/barbershop-operation/presentation/professional-agenda.web.styles.ts`:
   estilos específicos de esta pestaña y adaptaciones responsive.
3. `src/composition/professional-agenda-view.ts`: filtros y agrupación por día
   de Lima, separados del estado de reserva y sin mutar el listado original.
4. `src/composition/use-professional-agenda.ts`: carga contextual, cola de lecturas,
   descarte de respuestas antiguas y conservación durante refresco de la misma consulta.
5. `src/composition/professional-dashboard-data.ts`: opción local includeOverview
   para reutilizar la lectura existente sin consultar horarios/catálogo adicionales.
6. `src/composition/professional-workspace.web.tsx`: monta la nueva agenda únicamente
   en su pestaña; conserva las otras tres y sus enlaces.
7. `src/features/reservations/presentation/care-control.tsx`: extensión opcional
   de composición visual (view/busy/onReadStart); mismo flujo de comandos y UI por defecto.
8. `tests/presentation/professional-agenda.test.mjs`: nueva cobertura de filtros,
   grupos, estados, navegación, permisos y descarte/cola contextual del hook.
9. `tests/presentation/professional-dashboard.test.mjs`: cubre lectura mínima
   de agenda sin consultas de horarios o catálogo.
10. `tests/presentation/professional-workspace.test.mjs`: integración de pestaña
    y conservación del contexto y herramientas de las otras secciones.
11. `docs/CODEX-HANDOFF.md`: continuidad y límites de validación.
12. Este documento: alcance, criterios y evidencia técnica del ajuste.

## Tareas y validación ejecutada

- [x] Identificar consultas, permisos y componentes existentes.
- [x] Implementar proyección, controlador de carga y composición de interfaz.
- [x] Mantener filtros de atención en el cliente sobre estados verificados,
  sin cambiar consultas por cada selección de estado.
- [x] Reutilizar confirmaciones existentes y bloquear acciones incompatibles.
- [x] `node --test tests/presentation/professional-agenda.test.mjs tests/presentation/professional-dashboard.test.mjs tests/presentation/professional-workspace.test.mjs`:
  16 pruebas dirigidas aprobadas.
- [x] `npm run test:client`: 499 pruebas aprobadas, sin fallos.
- [x] `npm run typecheck`, `npm run lint`, `npm run architecture:check`:
  aprobados; Prettier sobre los archivos afectados también aprobado.
- [x] `npx --no-install expo export --platform web --output-dir .artifacts/professional-agenda-web-build`:
  exportación Web correcta, sin despliegue ni instalación. Solo advertencias
  del entorno NO_COLOR/FORCE_COLOR.
- [x] Observación de Brave en la sesión existente: pestaña agenda, fecha
  23/11/2026, estado sin citas asignadas y cuatro contadores en cero sin error.
  Captura en ventana estrecha aproximada995px, sin modificar datos.
- [ ] Validación real de filtros, semana, acciones y confirmaciones con citas
  no vacías. Las pruebas automatizadas usan dobles; no acreditan estas operaciones reales.
- [ ] Comparación visual en escritorio amplio, móvil y teclado completo.
  Se detectó entrada concurrente del usuario en la ventana y no se forzaron interacciones.

No se hicieron cambios en backend, Auth, permisos, sidebar, rutas generales,
datos Cloud ni Android. La adaptación Android de este rediseño visual no se
declara probada; las regresiones compartidas mantienen la UI por defecto.
