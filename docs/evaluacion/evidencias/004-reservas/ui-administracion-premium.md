# Administración, permisos e invitaciones — rediseño Web

24/11/2026, America/Lima. Alcance: adjunto f5673624 y referencia visual.
Exclusivamente contenido del desplegable administrativo de Gestión de equipo.

## Archivos y reutilización

- Nuevos `src/features/barbershop-operation/presentation/admin-management.web.tsx`,
  `admin-management.web.styles.ts` y `admin-management-panel.web.tsx`.
- `team-authority-panel.tsx` y `admin-invitations.tsx`: render opcional que expone
  los estados y callbacks existentes; salida universal previa por defecto conservada.
  Puente de render estable conserva estado del formulario sin remount por cada edición.
- `src/composition/operation-route.web.tsx` y `operation-screen.tsx`: slot Web para
  composición única; no duplicar invitaciones ni autoridad en esta sección.
- Pruebas `tests/presentation/admin-management-web.test.mjs` y
  `admin-management-controllers.test.mjs`.

## Comportamiento

Resumen por capacidad real y barbería seleccionada. Propietario excluido del cupo2;
secundario sin acceso a conteos protegidos muestra desconocido, nunca0inventado.
Invitaciones salientes consultadas una vez por contexto solo para propietario;
conteo de pendientes vigentes, filtrado por barbería y recuperación manual.

Tabla con nombre disponible, rol y estado reales, búsqueda por nombre/filtros locales,
detalle y retirada solo de secundarios activos. Destino/motivo/reintento conservados.
Invitación en panel plegable con validación y cola actuales, foco al correo, cerrar,
Escape/cancelar y bloqueo durante incertidumbre. Cancelación de invitación por ID con
confirmación. Matriz de capacidades informativa; no editor de permisos.

Sin columnas de correo/última actividad: contratos actuales no las incluyen. Invitaciones
identifican destinatario por nombre y fechas reales. No reportes/promociones/transferencia
presentados como operativos. No APIs, dominio, SQL, Cloud, banderas, Android, sidebar,
navegación ni profesionales modificados. Sin dependencias ni fotos nuevas.

## Evidencia ejecutada

- Regresión roja observada antes de implementar el componente: log
  `.artifacts/admin-management-premium-red.log`.
- Pruebas nuevas8/8: contenido, estados, filtros, cuotas, callbacks de retirada,
  confirmación de cancelación, secundario sin privilegios, invitaciones ajenas
  excluidas; controladores reales con doble de transporte, doble envío bloqueado
  y respuesta tardía de otro scope ignorada.
- Dirigidas29/29 con regresiones de equipo y autoridad existentes:
  `.artifacts/admin-management-premium-targeted.log`.
- Tipos/lint/formato/grafo aprobados; cliente completo576/576. Registrados en logs
  `.artifacts/admin-management-premium-{types,lint,architecture,client}.log`.
- Render aislado con fixtures etiquetados, Outfit local, Chrome sin sesión y escala1:
 1600/1260/800/390; ningún desbordamiento de documento ni elementos visibles.
  `.artifacts/admin-management-premium-visual.json` y PNG por tamaño.
- CUA integrada a100% con sesión existente: propietario0/2, pendientes0,2cupos,
  tablaERWINIP; formulario abre/cierra sin escribir ni enviar; selector secundario
  muestra4capacidades permitidas y4restringidas. Desplegable original conservado.
  No se ejecuta invitación, cancelación o retirada real. Las escrituras se prueban
  exclusivamente con dobles aislados.

Pendiente: revisión visual del usuario. Correos y actividad necesitarían extensión
backend autorizada aparte si se solicitan. Sin commit, staging ni push.
