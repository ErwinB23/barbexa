# Detalle desplegable en Resumen profesional — 23/11/2026

## Extensión autorizada a Mi agenda — 24/11/2026

Nueva solicitud explícita: aplicar este mismo detalle a las citas de Mi agenda.
professional-agenda.web.tsx conserva el calendario/filtros/vistas/resumen y reemplaza
la composición de ProfessionalAppointment por details/summary con chevron circular.
Reutiliza ProfessionalReservationDetail, ProfessionalRescheduleForm (incluye Cerrar),
CareControl y los controles de reprogramación/cancelación existentes. Retira el menú
de tres puntos y el segundo panel de atención. Sin consultas adicionales al expandir.

Estados desde la vista verificada de CareControl; onUpdated solicita refresh de agenda
solo tras mutación confirmada. Conserva revisión/contexto del controlador de agenda,
incluido remontaje de los controles al finalizar la actualización para descartar vistas
anteriores. Mientras actualiza: edición inert y canChange=false. Sin care habilitado:
información no consultada y acción de consulta deshabilitada; no concede operaciones.
Puente CSS display:block únicamente en bx-pa-unified-card para reutilizar los estilos
de la tarjeta dentro de la pestaña. El resumen profesional no cambia de composición.

Pruebas de agenda amplían datos de fixtures: render de bloques, retiro del menú,
cancelación no expuesta en completadas, refresh solo tras mutación, pausa y falta de
capacidad. Capturas aisladas a1260/800/390px con estilos de agenda, sin desbordamiento.
Los controles RN de la vista aislada son primitivas de prueba; no acredita E2E real.
Sin SQL, Cloud, instalaciones, recarga de pestaña real o modificación de reservas.
Log de prueba roja: agenda-unified-red.log. Revisión integrada/Android físico pendientes.
Verificación final: cliente543/543, agenda6/6, tipos cliente/núcleo, lint, Prettier,
grafo de arquitectura y diff --check aprobados. Código modificado: agenda Web, CSS
puente del detalle y prueba de agenda; sin cambios de dominio/aplicación/servidor.

## Formulario de reprogramación — 24/11/2026

Adición posterior solicitada: botón Cerrar con icono X en el encabezado, accesible por
teclado y con etiqueta explícita. Callback opcional cierra solo el formulario; bloqueado
por busy/inFlight/uncertain. Tras éxito puede cerrarse. Reapertura utiliza reinicio de
selección existente, sin mutaciones adicionales. Pruebas dirigidas y tipos aprobados;
log pro-reschedule-close-tests.log. Sin navegación, recarga o operaciones reales.

Solicitud posterior: ordenar el formulario abierto de la captura, con identidad
BARBEXA y controles proporcionados. Se crean professional-reschedule-form.web.tsx y
.styles.ts en composición, conectado desde professional-dashboard.web.tsx mediante
renderContent opcional de RescheduleControl. RescheduleContentProps exportado permite
reutilizar datos/handlers sin copiar reglas. Demás interfaces y Android conservan
RescheduleContent predeterminado.

Fecha nativa Web con calendario; motivo de personal con explicación del plazo;
slots auténticos en cuadrícula con selección accesible, lectura del horario elegido
en Lima y confirmación explícita. Carga/vacío/error/éxito/resultado incierto conservados.
Mantiene bloqueo y misma operación de reintento; no inventa disponibilidad ni altera
servicios, importes, profesionales o pago. CSS acotado a bx-rd-reschedule, responsive
según ancho de la cita. Vista con fixtures aislados a1260/800/390 sin scroll horizontal.
Capturas/scripts/logs ignorados pro-reschedule-*; sin operar datos Cloud o pestaña real.

Prueba nueva cubre calendario, cambio de fecha, slots, confirmación deshabilitada sin
selección, estados vacío/éxito, motivo solo staff y reintento con fecha bloqueada.
En batería global apareció prueba existente dependiente del día23nov: se fija esa fecha
en SU doble de professionalDay, conservando el escenario de cambio al24nov. No se cambia
reloj global ni aplicación. Revisión visual integrada y Android físico pendientes.
Verificación final: cliente542/542, TypeScript cliente/núcleo, ESLint, Prettier,
grafo de arquitectura y diff --check aprobados. Prueba nueva falló antes del componente
y pasó tras implementarlo. Sin instalaciones, SQL o modificaciones de servicios.

**Control de despliegue:** chevron SVG existente en círculo36px, orientación según
details[open], hover/foco y colores adecuados al encabezado claro/marrón. No incorpora
botón anidado ni nuevos manejadores; conserva semántica, teclado y expansión nativos.
Solo professional-dashboard.web.tsx y CSS del detalle; columna móvil adaptada36px.
Verificación dirigida: pro-detail-toggle-tests.log, tipos y lint. Revisión real pendiente.

**Ajuste de espacios posterior:** solo professional-reservation-detail.styles.ts:
ancho interior máximo1040px centrado, separación14px, columnas1.1/1 en datos/estados,
alineación superior sin alturas estiradas, etiquetas82px y filas8px. Acciones64px mínimo
y separación10px; encabezado más compacto. No cambia tipografía, funciones o estados.
Vista estática aislada comprobada a1260/800/390px, sin scroll horizontal. Capturas
pro-detail-{1260,800,390}.png y métricas pro-detail-visual.json ignoradas. Lint aprobado;
validación dirigida en pro-detail-spacing-tests.log. No se tocó pestaña o datos reales.

**Ajuste posterior vigente:** por petición explícita del usuario, se retiran Resumen
rápido, Siguiente paso recomendado y Ayuda. El contenido superior ocupa todo el ancho;
datos y acciones originales permanecen. Solo componente y CSS; tipos, lint, formato,
diff y pruebas dirigidas21/21 aprobados. Log pro-detail-remove-summary.log. No recarga
manual ni operaciones Cloud. La distribución 70/30 descrita abajo corresponde al
diseño inicial, sustituida por este ajuste.

Solicitud y referencia del usuario: adaptar exclusivamente la cita desplegada de
Mi espacio profesional → Resumen profesional → Mi agenda. Conservar navegación,
entorno cloud-integration, controles, permisos, confirmaciones y negocio existentes.

## Implementación y decisiones

- `src/composition/professional-reservation-detail.web.tsx` y `.styles.ts`: detalle
  Web con encabezado marrón, hora destacada, franja de estados, datos, atención/pago,
  gestión, resumen rápido, siguiente acción y ayuda. Iconos locales; sin fotos nuevas.
- `professional-dashboard.web.tsx` conserva details/summary y conecta la composición
  al CareControl de cada ID. Estado del encabezado actualizado con lectura verificada;
  tras mutación, reconsulta ownSummary existente y descarta actualizaciones de otra
  clave/contexto. Si falla el resumen, muestra estado desconocido, sin inventar cifras.
- `care-control.tsx` ofrece operaciones autorizadas, feedback y vista en renderLayout.
  Conserva confirmación, guardia in-flight, requestId/reintento y validación careView.
  Siguiente paso y cuadrícula comparten onSelect y estado; nunca envían directamente
  una mutación. Android y demás consumidores conservan la composición predeterminada.
- Reutiliza RescheduleControl y CancellationControl sin cambiar sus casos de uso,
  motivos, consultas, historial o validaciones. CSS acotado ordena sus controles.
- Método y estado de pago se muestran separados. Sin lectura: «Sin consultar».
  Creación viene del evento created, no de la fecha programada; si falta, se indica.
  Fechas America/Lima; eventos con etiquetas comprensibles, sin exponer etiquetas técnicas.
- Columnas 70/30 cuando caben; bajo850px el contenido lateral pasa debajo. Tarjetas
  interiores y acciones se reorganizan según el ancho del propio desplegable mediante
  container queries, sin zoom global ni cambiar el tablero que lo contiene.
- La referencia se compacta: no se duplica el encabezado del cliente; el summary
  existente se transforma al abrir. Se conservan actividades en un desplegable aparte.

## Verificación

- Cierre: cliente541/541 y dirigidas21/21 aprobadas; TypeScript (cliente/núcleo),
  ESLint sin advertencias, Prettier, grafo de arquitectura y diff --check aprobados.
  Pruebas modificadas: tests/presentation/booking/care-control.test.mjs y
  tests/presentation/professional-dashboard.test.mjs. Sin instalar dependencias.
- Nueva prueba de operaciones falló antes de exponerlas (log pro-detail-red.log).
- Pruebas dirigidas cubren permisos, estados, selección sin envío, confirmación doble
  con una sola petición, estado confirmado por servidor, contexto, Lima, múltiples
  servicios, escape de nombres y distinción de efectivo pendiente/recibido.
- Vista estática aislada con fixtures SOLO en .artifacts; Chrome nuevo sin sesión,
  sin tocar pestaña del usuario ni red de Supabase. Capturas y medición a1260/800/390px
  sin desbordamiento horizontal. Incluye componentes de datos reales, pero los controles
  RN se representan con primitivas en esa vista: no acredita el E2E integrado real.
- Logs, capturas y scripts ignorados: .artifacts/pro-detail-*.
- Sin SQL, migraciones, RPC nuevas, RLS, Edge, instalación, operaciones reales, staging,
  commit o push. Pendiente aprobación visual integrada y recorrido con estados/formularios
  reales y Android físico; no iniciar, cobrar, cancelar o reprogramar citas para probar.
