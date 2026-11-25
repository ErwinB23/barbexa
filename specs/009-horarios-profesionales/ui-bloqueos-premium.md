# Bloqueos y cierres por fecha — UI premium

Fecha: 23/11/2026, America/Lima. Extensión visual de la especificación 009.

## Alcance solicitado y ejecución

Referencia y texto adjunto del usuario: encabezado dorado con curvas discretas,
tres tarjetas explicativas, banda crema y cuadrícula de aproximadamente 60/40.
Formulario a la izquierda; bloqueos de cuenta propia y cierres del local a la derecha.
Se sustituye el desplegable general anterior por la sección visible. En pantallas
estrechas se apilan tarjetas y columnas; las horas se apilan bajo 600px.

El formulario conserva el selector sincronizado con el horario superior, la fecha
nativa, motivo, selectores de hora y el mismo callback de guardado. El CTA y aviso
cambian entre toda la barbería y el profesional elegido. Los bloqueos personales
siguen perteneciendo a la cuenta conectada; consultar, crear, editar y retirar no
cambian. La consulta de cierres conserva paginación, retirada, errores y reconciliación.
El estado vacío premium requiere una consulta terminada sin filas: no se inventa
que no existen cierres antes de consultar. La propiedad premium es opcional y se
activa solo en esta composición Web. No cambia otras pantallas, sidebar, rutas,
dominio, servidor, permisos, SQL ni datos Cloud. Sin nuevas dependencias.

## Archivos implementados

Bajo src/features/barbershop-operation/presentation/:

- availability-tools.web.tsx y availability-tools-web.styles.ts: encabezados,
  guía, banda y composición responsive con estilos locales.
- operation-screen.tsx: integra las ranuras y conserva controles y guardado.
- weekly-schedule-web.tsx: muestra esta sección bajo el editor semanal.
- self-schedule-web.tsx: resumen de alcance/tipo en la tarjeta personal administrativa.
- shop-closures-panel.web.tsx: estado vacío premium opcional; controlador intacto.

Pruebas: tests/presentation/booking/weekly-schedule-ui.test.mjs añade composición
con ranuras reales y ausencia de vacío ficticio. Se observó fallo antes de crear
el componente y paso posterior. shop-closures.test.mjs resuelve módulos locales
con sufijo .styles usando existencia de archivo en lugar de path.extname, para
admitir el import del icono existente; conserva sus verificaciones de comportamiento.

## Validación ejecutada

- Suite cliente completa: 527/527 aprobadas, 0 fallos.
- Pruebas finales dirigidas: 16/16 aprobadas tras ajustes de iconos y botones.
- Tipos, lint completo y grafo de arquitectura aprobados.
- Expo export Web aprobado en .artifacts/date-tools-premium-web-build.
- Formato de archivos intervenidos y comprobación de espacios aprobados.
- Revisión visual real en Brave, localhost:8081/schedules, con sesión existente:
  encabezado y tres tarjetas, formulario en columna izquierda, panel personal y
  cierres en columna derecha; campos legibles y separados, vacío de cierres visible.
  Solo lectura y scroll, sin guardar, retirar ni enviar datos. El panel personal
  ya estaba consultado y mostró también el editor existente de bloqueos propios;
  este contenido aumenta su altura y conserva todas sus acciones.
- Último ajuste posterior a la captura: icono informativo, icono de calendario en
  CTA y flechas de consulta; verificación técnica repetida, sin segunda captura.
- Pendientes: revisión visual de viewport estrecho y Android físico. No se realizó
  guardado real como parte de este rediseño. Las pruebas dirigidas cubren callbacks,
  borradores, conflictos y consulta/retirada sin mutaciones reales.

Artefactos ignorados: .artifacts/date-tools-premium-{client,targeted,architecture,
export}.log. Sin staging, commit, push, instalaciones, servicios nuevos ni APK.

## Ajuste de escala posterior solicitado

Solo availability-tools-web.styles.ts: títulos22px y21px bajo650px, misma escala
que Disponibilidad semanal; subtítulos12px, controles13px. Iconos principales24px
en contenedores48px, auxiliares21px; calendario vacío32px. Compensados sangrías y
alturas del título de cierres. Se conserva distribución, espacios y acciones.
Tipos, lint dirigido, formato y 4 pruebas de weekly-schedule-ui aprobados.
Sin nueva captura visual ni ejecución Android para este ajuste de CSS.
