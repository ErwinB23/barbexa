# Feature Specification: MVP de operación y reservas multitenant

**Feature**: `004-mvp-reservas` · **Branch actual**: `main` (sin rama nueva)

**Created**: 2026-11-14 · **Status**: MVP implementado e integrado con Supabase Cloud; recorrido funcional manual Web aceptado por el usuario el 24/11/2026. Android y cierre técnico mantienen sus gates.

**Input**: Preparar la demostración «cliente reserva desde Android → administrador ve la
cita en Web», con barberías, catálogo, personal, horarios, cancelación y concurrencia segura.
Web y Android son obligatorios; ligera prioridad de ejecución Web. Reutilizar 001/002 y
la autenticación/contexto de003 sin esperar su cierre para preparar este diseño.

## Clarifications — decisiones del responsable, 2026-11-14

- Cancelación configurable por barbería, anticipación inicial **120 minutos**. El cliente
  puede cancelar hasta el límite inclusive; después no. Personal autorizado puede cancelar
  con motivo obligatorio. Política válida es requisito de publicación; sin penalizaciones
  económicas ni pagos en este MVP. La política de la reserva se conserva al confirmarla.
- Incorporación mediante **invitación interna a cuenta existente**: pendiente no da acceso;
  destinatario acepta/rechaza; solo administrador activo del tenant emite/cancela. Sin correo,
  sin duplicados pendientes, nueva invitación permitida después de rechazo/cancelación.
- Un administrador puede atender solo si tiene perfil profesional activo y horario de esa
  barbería; no automáticamente. Conserva su rol administrativo y no duplica su identidad.
- Uno o varios servicios activos por reserva. Efectivo/Yape, Google y demás alcance del
  producto permanecen obligaciones posteriores; no se consideran implementados ni eliminados.
- Exclusión global aprobada por identidad física del profesional, aunque tenga perfiles en
  A/B: reservas activas no se solapan, canceladas no bloquean. Mensaje uniforme «Profesional
  no disponible en ese horario», sin revelar otra cita, cliente, tenant ni identificadores privados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Preparar una barbería operativa (Priority: P1)

Como administrador de mi barbería quiero configurar sus datos, profesionales, servicios
y horarios para ofrecer citas reales sin dar permisos sobre otros establecimientos.

**Why this priority**: Sin oferta operativa no existe una reserva demostrable.

**Independent Test**: Administrador de A prepara/publica A; administrador de B no puede
modificarla. Un profesional invitado no accede antes de aceptar y luego opera solo en A.

**Acceptance Scenarios**:

1. **Given** una identidad confirmada con perfil, **When** crea su barbería por el mecanismo
   existente, **Then** obtiene la primera membresía administrativa únicamente de ese tenant.
2. **Given** un administrador activo de A, **When** configura contacto/dirección, servicios
   con precio/duración y horarios, **Then** puede publicar solo si existe además un profesional
   activo con horario y capacidad para al menos un servicio, y políticas de reserva válidas.
3. **Given** una invitación interna pendiente, **When** el destinatario acepta, **Then** se
   actualiza la membresía autorizada atómicamente; rechazarla o cancelarla no da acceso.
4. **Given** un administrador que también atiende, **When** activa su perfil profesional y
   horario, **Then** puede recibir citas sin perder su rol ni adquirir permisos en otro tenant.
5. **Given** reservas comprometidas, **When** se intenta quitar capacidad, horario o personal
   necesario para atenderlas, **Then** se rechaza el cambio incompatible; no se borran citas.

### User Story 2 — Reservar y consultar mis citas (Priority: P1)

Como cliente autenticado quiero elegir una barbería visible, servicios y un horario para
confirmar mi cita y consultar después sus condiciones, sin pertenecer al personal.

**Why this priority**: Entrega el recorrido central Android→Web solicitado.

**Independent Test**: Cliente sin membresías reserva en A; la confirmación tiene profesional
concreto y condiciones vigentes. Dos solicitudes al mismo intervalo no dejan dos asignaciones.

**Acceptance Scenarios**:

1. **Given** un cliente sin membresía, **When** consulta oferta publicada, **Then** ve solo
   información comercial expresamente visible, no perfiles privados ni membresías del personal.
2. **Given** varios servicios activos, **When** elige profesional o «cualquiera disponible»,
   **Then** la disponibilidad considera su duración total y capacidades; la reserva final
   identifica un profesional concreto que puede atenderlos todos.
3. **Given** un horario mostrado, **When** confirma, **Then** se recalculan permisos,
   políticas, precios y disponibilidad vigentes; no se confía en importes enviados por cliente.
4. **Given** dos clientes confirmando simultáneamente un intervalo incompatible del mismo
   profesional, **When** terminan las solicitudes, **Then** como máximo una reserva ocupa el
   intervalo y la otra recibe conflicto recuperable, sin escrituras parciales.
5. **Given** respuesta perdida o doble pulsación, **When** se reintenta la misma solicitud
   identificada, **Then** se recupera el mismo resultado sin duplicar cita ni cambiar su precio.
6. **Given** una cita confirmada, **When** cambia después el catálogo, **Then** su detalle
   mantiene nombres, descripciones, duración, precio y política originales.

### User Story 3 — Consultar agenda según mi responsabilidad (Priority: P1)

Como barbero quiero ver mis citas asignadas y como administrador las de mi barbería,
para organizar la atención sin convertir mis permisos en un rol global.

**Why this priority**: Completa la demostración de cita Android consultada por admin en Web.

**Independent Test**: Una cita del cliente en Android aparece para el administrador de A
en Web y su profesional; otro barbero de A y personal de B no ven su detalle privado.

**Acceptance Scenarios**:

1. **Given** barbero activo de A, **When** consulta agenda por fecha, **Then** recibe solo
   citas asignadas a su perfil profesional y los datos operativos mínimos de sus clientes.
2. **Given** administrador activo de A, **When** filtra agenda por fecha/profesional/estado,
   **Then** consulta únicamente A; cambiar el identificador a B no concede acceso.
3. **Given** usuario administrador de A y barbero de B, **When** cambia de contexto,
   **Then** en B solo dispone del alcance de barbero, sin arrastrar acciones administrativas.
4. **Given** membresía revocada o inactiva, **When** vuelve a consultar u operar, **Then**
   el servidor deniega; una pantalla o permiso recordado no sustituye la comprobación vigente.

### User Story 4 — Cancelar y liberar un horario de forma controlada (Priority: P1)

Como cliente quiero cancelar a tiempo; como personal autorizado quiero resolver una
cancelación con motivo, conservando quién actuó y sin afectar citas de otra barbería.

**Why this priority**: Evita reservas abandonadas y permite gestionar la agenda del MVP.

**Independent Test**: Cliente cancela su cita justo en el límite y no después; el profesional
asignado o administrador activo cancela con motivo. El intervalo se libera una sola vez.

**Acceptance Scenarios**:

1. **Given** reserva propia confirmada con política conservada, **When** el cliente cancela
   en o antes del límite, **Then** queda cancelada y el horario se libera atómicamente.
2. **Given** cliente fuera del límite, **When** solicita cancelación, **Then** se deniega,
   aunque la configuración actual de la barbería se haya hecho más permisiva.
3. **Given** administrador activo del tenant o profesional activo asignado, **When** cancela
   con motivo no vacío, **Then** se registra actor/fecha/motivo; sin motivo se rechaza.
4. **Given** cancelación repetida o concurrente con nueva confirmación, **When** se ejecuta,
   **Then** no duplica eventos ni deja dos reservas incompatibles ocupando el intervalo.

### Edge Cases

- Falta de perfil, cero membresías, invitación ajena/consumida, aceptar/cancelar simultáneamente,
  invitación duplicada pendiente y nueva invitación tras rechazo.
- Servicio ajeno/inactivo, precio o duración cambiados al confirmar, catálogo parcialmente
  válido, servicios repetidos, profesional incapaz de realizar todos y «cualquiera» sin candidato.
- Límites de horario, almuerzo, cierre/bloqueo, medianoche, anticipación/horizonte y límite de
  reservas futuras; presentación America/Lima, importes PEN, intervalos contiguos permitidos
  solo cuando la separación configurada lo permita.
- Mismo profesional físico con perfiles en dos tenants: evitar asignación simultánea sin
  revelar la reserva ni el cliente del otro establecimiento; no constituye permiso global.
- Desactivar/revocar mientras se confirma, cambios de horario/catálogo concurrentes, reintento
  con misma clave y otro contenido, timeout después de commit, cancelación repetida.
- Sesión vencida, red interrumpida, lista vacía y respuesta tardía después de cambiar cuenta
  o tenant; no mostrar información previa como si perteneciera al contexto nuevo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Crear/consultar/actualizar barbería propia mediante las capacidades de002 y
  permisos de administrador activo; no crear administrador global.
- **FR-002**: Gestionar estados borrador, publicada, pausada y retirada; pausa puede seguir
  visible y nunca acepta nuevas reservas. Publicar exige contacto, dirección y oferta operativa.
- **FR-003**: Gestionar servicios por barbería con nombre, descripción, precio PEN no negativo,
  duración positiva y estado activo/inactivo, preservando las reservas históricas.
- **FR-004**: Gestionar profesionales vinculados a membresía activa de ese tenant y los
  servicios que pueden realizar. Un administrador profesional conserva su identidad y rol.
- **FR-005**: Emitir/cancelar invitaciones internas de barbero (sin promoción a administrador) solo como administrador activo; aceptar/
  rechazar solo como destinatario autenticado, sin acceso antes de aceptación.
- **FR-006**: Evitar invitaciones pendientes duplicadas por destinatario/tenant; aceptar una
  sola vez atómicamente; permitir nueva invitación tras rechazo/cancelación sin reutilizar la vieja.
- **FR-007**: Gestionar intervalos generales y profesionales, cierres/bloqueos y políticas:
  anticipación, horizonte, máximo de citas futuras, separación y cancelación válida inicial120min.
- **FR-008**: Rechazar cambios operativos que invaliden reservas comprometidas; no borrar
  ni reasignar citas silenciosamente al modificar catálogo, personal o agenda.
- **FR-009**: Ofrecer catálogo comercial de barberías visibles a clientes autenticados sin
  membresías; no ampliar el acceso a perfiles privados/membresías ni exponer secretos.
- **FR-010**: Elegir uno o varios servicios activos y profesional específico o cualquiera
  compatible, con precio/duración estimados calculados a partir del catálogo autorizado.
- **FR-011**: Calcular disponibilidad usando horarios, cierres, bloqueos, capacidad, duración,
  separación, reservas y políticas. Consultarla no garantiza la confirmación posterior.
- **FR-012**: Confirmar únicamente para la identidad autenticada y verificada, revalidando
  en servidor todos los datos vigentes; rechazar identidad, permisos o precio arbitrarios.
- **FR-013**: Guardar reserva y detalles relacionados en una sola operación o revertir todo.
- **FR-014**: Impedir atómicamente intervalos incompatibles de un mismo profesional físico,
  también entre tenants, sin divulgar detalles de otras barberías.
- **FR-015**: Identificar y reconciliar reintentos de una misma confirmación; misma solicitud
  no duplica reserva y cambiar su contenido no permite reutilizar indebidamente esa identidad.
- **FR-016**: Conservar instantánea de barbería/profesional/servicios, precio/descripción,
  duración y políticas relevantes, independiente de cambios posteriores.
- **FR-017**: Permitir al cliente consultar próximas citas, detalle e historial propios.
- **FR-018**: Permitir al profesional activo consultar solo agenda/detalle asignados; al
  administrador activo consultar y filtrar la agenda del tenant actual.
- **FR-019**: Autorizar todas las operaciones por identidad, recurso, pertenencia y rol
  vigentes; denegar acceso cruzado A/B, incluido administrador-A/barbero-B e inactivos.
- **FR-020**: Permitir cancelar al propietario en o antes del límite conservado e impedirlo
  después; límite inicial120min configurable para reservas nuevas, sin penalización económica.
- **FR-021**: Permitir cancelar al profesional asignado activo o administrador activo de la
  barbería con motivo obligatorio; otro profesional no puede hacerlo.
- **FR-022**: Cancelar y liberar el intervalo atómicamente, registrar actor/fecha/motivo,
  conservar historia y hacer repetición/concurrencia segura sin duplicar eventos.
- **FR-023**: Mostrar carga, vacío, error, conflicto/reconsulta y éxito con controles accesibles;
  no dar por confirmada una operación por timeout ni conservar datos de otra cuenta/tenant.
- **FR-024**: Compartir reglas y backend entre Web y Android, permitiendo adaptación de
  presentación; validar funcionalmente cada flujo entregado en ambas plataformas.
- **FR-025**: Proteger credenciales y entradas; ninguna clave privilegiada ni identidad/rol
  elegible por cliente puede conferir permisos. Reservas críticas se autorizan definitivamente en servidor.
- **FR-026**: Probar acceso permitido/denegado, aislamiento, rollback, idempotencia y
  concurrencia con datos controlados reales además de pruebas unitarias.
- **FR-027**: Completar recuperación de contraseña003 antes de evaluación y revisar la
  configuración Web/Android de aceptación; no simular recuperación ni declarar publicación inexistente.
- **FR-028**: Registrar evidencia reproducible y límites por requisito/plataforma, riesgos npm
  y cambios autorizados; preparar instalación reproducible sin alterar proyectos anteriores.

### Key Entities

Barbería y configuración operativa; servicio; profesional y sus capacidades; horario/
excepción; invitación; reserva y servicios históricos; evento de cancelación. Identidad,
perfil y membresía proceden de002. El cliente no necesita membresía profesional para reservar.

## Success Criteria *(mandatory)*

- **SC-001**: Cliente confirmado en Android crea una cita y su administrador de la misma
  barbería la encuentra en Web con el mismo identificador, profesional, horario y total;
  repetir también la dirección Web→Android sin datos personales reales.
- **SC-002**: Cien por ciento de la matriz de acceso A/B, propio/ajeno, asignado/no asignado,
  administrador-A/barbero-B, inactivo y sin sesión produce el resultado permitido/denegado esperado.
- **SC-003**: En diez pares de confirmaciones simultáneas válidas sobre un intervalo
  inicialmente libre, exactamente una reserva ocupa cada intervalo y la otra obtiene
  conflicto; cero citas/detalles parciales y cero duplicados por reintento.
- **SC-004**: Cancelación en el límite, fuera del límite, personal con/sin motivo, repetición
  y carrera con nueva reserva tienen resultado coherente y un único registro de cancelación.
- **SC-005**: Todos los recorridos de preparación, reserva, agendas y cancelación tienen
  resultados reales Web y Android, controles accesibles y ninguna recuperación de datos ajenos
  tras cambiar usuario/contexto. La recuperación de acceso003 funciona antes de evaluación.
- **SC-006**: Existe trazabilidad completa FR→tarea→evidencia y guía de configuración con
  comandos/resultados comprobados; se distinguen pruebas realizadas, límites y riesgos.
  No exige otra persona ni otro entorno únicamente para acreditar esta documentación.

## Dependencies, assumptions and exclusions

- Dependencias:002 operativo;003 con sesión/contexto verificables para UI y recuperación
  antes de evaluación. Diseñar y probar backend004 aislado no exige reescribir Auth ni esperar
  pantallas que no consume. La aceptación conjunta nunca se sustituye por pruebas con dobles.
- Reglas de ubicación/moneda: America/Lima/PEN. No se fijan por intuición otros umbrales de
  negocio: administrador configura las políticas antes de publicar;120min de cancelación sí aprobado.
- Alcance original004: descubrimiento autenticado, sin organizaciones globales ni borrado
  histórico de tenants. Reprogramación, atención/inasistencia, invitaciones y notificaciones
  se incorporaron en especificaciones posteriores (véase consolidación al final).
  Favoritos, estilos, mapas exactos, reseñas, imágenes/Storage, recordatorios y navegación
  anónima no quedan acreditados por este MVP ni por el cierre manual Web.
- **Pagos fuera de esta etapa por decisión expresa**: ningún cobro/penalización/reembolso ni
  confirmación de efectivo/Yape. Totales de servicios no significan pago. ConstituciónVII y
  RF15/RF25/RF37–38 del producto se conservan como trabajo obligatorio posterior.
- Google obligatorio en el producto (ConstituciónV/RF02), integrado en007; no duplicar
  allí sus verificaciones. La integración no significa cierre total del SaaS/propuesta.
- Auditoría de dependencias y seguridad final pendientes; el conteo npm histórico no
  garantiza el estado actual. Cloud y caché implementados no acreditan publicación Web,
  DNS/CDN, CI remoto/CD ni k6: requieren sus propias evidencias y permisos.

## Consolidación funcional — Sprint 2 (24/11/2026)

- La creación de una barbería y el cambio de nombre de la seleccionada son operaciones
  distintas. Renombrar conserva selección, identidad, membresías y reservas; no abre el
  formulario de creación ni descarta el contexto durante su actualización.
- «Tus barberías» conserva los accesos por establecimiento. La agenda administrativa
  consulta sus reservas, agrupadas por profesional; «Mi agenda» limita al profesional
  activo sus asignaciones. En ambas, las citas se ordenan por inicio descendente,
  con desempate por ID; en Web grupos y detalles pueden plegarse.
- Mis reservas aplica el mismo orden por fecha de cita al historial y próximas citas;
  «Ver mi historial completo» abre el filtro Todas. Estados de reserva, atención y pago
  se distinguen mediante texto, sin depender únicamente del color.
- Las exclusiones originales de esta etapa no significan ausencia actual del producto:
  atención/pagos están en 005, Google en 007, reprogramación en 010, equipo/autoridad
  en 011, notificaciones en 012 y reporte Yape en 017. No duplicar sus requisitos aquí.
- Pendientes de producto: Storage/QR e imágenes persistentes, ubicación exacta/mapas,
  favoritos y reseñas; no acreditados por la aceptación Web. Android y calidad técnica
  siguen abiertos. El cierre de interfaces consta en docs/CODEX-HANDOFF.md, sección 1.
