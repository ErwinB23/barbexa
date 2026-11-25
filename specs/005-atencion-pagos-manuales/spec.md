# Feature Specification: Atención y pagos manuales

**Feature Branch**: `main` (sin rama nueva)

**Created**: 2026-11-15

**Status**: Implementada y activa en Cloud; interfaces y recorrido funcional manual Web aceptados el 24/11/2026. Android y verificaciones específicas se conservan en tasks.md.

**Input**: Completar el ciclo de una barbería: atención de citas, inasistencia, selección
de efectivo/Yape, recepción confirmada manualmente e historial de reembolsos externos.
No confundir reserva confirmada con atención realizada ni con dinero recibido.

## Clarifications

### Session 2026-11-15

- El usuario aprobó iniciar desde la hora programada y completar solo una atención iniciada.
- Inasistencia: tolerancia configurable por barbería, inicialmente **10 minutos**.
- Atención y pago son independientes: una atención puede completarse con pago pendiente,
  que debe permanecer visible; completar no confirma un cobro.
- Reembolso mínimo aprobado: total, realizado fuera de la app, únicamente sobre un pago
  confirmado de una cita cancelada, por administrador activo y con motivo/auditoría.
- Estas decisiones no autorizan migraciones, datos nuevos, cobros reales ni cambios Cloud.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Atender una cita asignada (Priority: P1)

Como profesional con membresía activa, quiero iniciar y completar mis atenciones o registrar
una inasistencia, para que el cliente y la barbería conozcan el resultado real de la cita.

**Why this priority**: Cierra el servicio reservado sin simular atención ni perder su historial.

**Independent Test**: Con una cita controlada autorizada, el profesional asignado registra
el ciclo; cliente y administrador consultan el mismo resultado desde Web y Android.

**Acceptance Scenarios**:

1. **Given** una cita confirmada y asignada al actor activo, **When** llega su inicio y
   registra atención, **Then** pasa a en atención; antes de esa hora se rechaza.
2. **Given** una atención iniciada, **When** el profesional asignado la completa,
   **Then** se conserva quién/cuándo y el pago mantiene su estado previo, incluido pendiente.
3. **Given** una cita aún no iniciada, **When** el reloj alcanza inicio más tolerancia
   conservada, **Then** el profesional puede registrar no asistió; antes se rechaza.
4. **Given** una cita cancelada, completada o no asistida, **When** se intenta iniciar
   o repetir una transición incompatible, **Then** se rechaza sin alterar el historial.
5. **Given** un actor administrador en A y barbero en B, **When** intenta atender una
   cita de B no asignada a su perfil profesional, **Then** se rechaza sin concederle
   permisos administrativos ni revelar datos privados de otra barbería.

### User Story 2 — Elegir medio de pago y consultar el estado (Priority: P1)

Como cliente, quiero elegir efectivo o Yape y consultar las instrucciones y el estado,
para saber cómo pagar sin que la app afirme haber verificado una transferencia.

**Why this priority**: El precio de una reserva no constituye un pago ni acredita recepción.

**Independent Test**: Una nueva reserva autorizada conserva método e importe histórico y
un pago pendiente; el cliente ve su propio estado e instrucciones pertinentes.

**Acceptance Scenarios**:

1. **Given** una oferta vigente, **When** confirma seleccionando efectivo o Yape,
   **Then** reserva y registro pendiente se confirman juntos o no se crea ninguno.
2. **Given** Yape seleccionado, **When** el cliente consulta su reserva,
   **Then** recibe los datos configurados de esa barbería, sin acceso a configuración
   privada de otras; no se ofrece un método cuyas instrucciones necesarias estén ausentes.
3. **Given** un pago pendiente, **When** el cliente manifiesta haber pagado,
   **Then** no obtiene facultad para marcarlo como recibido ni alterar importe/actor.
4. **Given** una reserva anterior sin registro financiero, **When** se consulta,
   **Then** se informa ausencia de registro; no se inventa efectivo, deuda o pago confirmado.

### User Story 3 — Confirmar recepción de efectivo o Yape (Priority: P1)

Como barbero asignado activo o administrador activo de la barbería, quiero confirmar
manualmente la recepción del pago, para registrar el cobro real sin duplicarlo.

**Why this priority**: Es una operación financiera de autorización contextual y evidencia única.

**Independent Test**: Dos operadores autorizados intentan confirmar el mismo pago pendiente;
solo una confirmación queda registrada, con importe y autor confiables.

**Acceptance Scenarios**:

1. **Given** un pago pendiente y recepción comprobada fuera de la app,
   **When** personal autorizado confirma, **Then** queda pagado con actor, fecha, medio
   e importe histórico; la atención no cambia automáticamente.
2. **Given** un barbero no asignado, cliente, membresía inactiva o administrador de otro
   tenant, **When** confirma, **Then** se rechaza incluso si conserva un token vigente.
3. **Given** dos solicitudes concurrentes o reintento después de timeout,
   **When** se procesan, **Then** existe una sola confirmación; no se sobrescribe al primer
   actor ni se acepta otra operación incompatible como si fuera la misma solicitud.

### User Story 4 — Configurar Yape y registrar un reembolso externo (Priority: P2)

Como administrador activo, quiero gestionar las instrucciones de Yape de mi barbería y
registrar un reembolso total ya efectuado, para conservar un historial financiero verificable.

**Why this priority**: Completa RF37/RF38; es obligatorio en 005, aunque posterior al cobro.

**Independent Test**: Un administrador registra el reembolso total de un pago confirmado
de una cita cancelada, con motivo; un reintento no duplica el registro y otro tenant no accede.

**Acceptance Scenarios**:

1. **Given** un administrador de A, **When** configura instrucciones Yape,
   **Then** solo cambian las de A; no se incorporan automáticamente al catálogo público.
2. **Given** una cita cancelada con pago confirmado y devolución externa total realizada,
   **When** el administrador registra motivo y confirmación, **Then** pasa a reembolsado
   con auditoría, sin transferencia ni verificación bancaria de la app.
3. **Given** pago pendiente, reembolso previo, cita no cancelada, importe parcial o actor
   sin permiso administrativo contextual, **When** intenta registrar devolución,
   **Then** se rechaza sin cambios parciales.

### Edge Cases

- Inicio antes de hora, límite inclusivo de tolerancia, hora del dispositivo manipulada.
- Cancelar e iniciar simultáneamente: solo una transición compatible puede persistir.
- Pago pendiente al completar; pago confirmado no cambia por completar o cancelar.
- Repetición/carrera de cobro o reembolso, pérdida de red y resultado incierto.
- Permisos revocados después de abrir el formulario, mismo JWT y administrador-A/barbero-B.
- Admin que atiende: necesita perfil profesional activo y asignación; no se vuelve barbero por su rol.
- Atención que supera la hora prevista: no se reprograman otras citas automáticamente
  ni se revelan datos de otra barbería. La prevención de reservas solapadas sigue vigente.
- Datos Yape modificados después: preservar método/importe y evidencia de la operación,
  sin convertir instrucciones actuales en prueba de una transferencia anterior.
- Reservas heredadas sin atención/pago/tolerancia: ausencia explícita, sin rellenos
  históricos ficticios. La compatibilidad se revisará antes de autorizar una migración.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Registrar estados de atención confirmada, en atención, completada,
  cancelada y no asistió, permitiendo únicamente transiciones compatibles y auditables.
  El flujo mínimo añade iniciar, completar y no asistió a la cancelación existente;
  no incluye reapertura ni corrección retroactiva de estados terminales.
- **FR-002**: Autorizar iniciar/completar/no asistió únicamente al profesional asignado
  con perfil y membresía activos. Un administrador que atiende cumple las mismas condiciones.
- **FR-003**: Iniciar solo desde el inicio programado; completar solo tras iniciar;
  no asistió solo antes de iniciar y desde inicio más tolerancia. Configuración de
  tolerancia por barbería, inicialmente 10 minutos, conservada para las citas nuevas.
- **FR-004**: Impedir atómicamente transiciones incompatibles, sin debilitar la prevención
  existente de reservas solapadas de una misma persona entre barberías.
- **FR-005**: Permitir seleccionar efectivo o Yape al confirmar nuevas reservas;
  registrar el pendiente junto con la reserva, todo o nada, con importe histórico confiable.
- **FR-006**: Mostrar instrucciones Yape completas exclusivamente del tenant de la reserva
  al cliente propietario y personal autorizado; solo administrador activo las configura.
- **FR-007**: No procesar dinero ni verificar transferencias automáticamente; la elección
  de método o declaración del cliente no confirma recepción.
- **FR-008**: Confirmar manualmente pago solo por administrador activo de ese tenant o
  profesional asignado con membresía activa, para efectivo y Yape por igual.
- **FR-009**: Aplicar confirmación única y reintentos reconciliables, con exclusión
  concurrente y sin sobrescritura de la primera auditoría ni estados parciales.
- **FR-010**: Conservar autor verificado, fecha del servidor, método e importe de cada
  operación financiera y transición de atención; no aceptar identidades o precios arbitrarios.
- **FR-011**: Permitir registrar reembolso total externo solo de un pago confirmado de
  cita cancelada, por administrador activo, con motivo y atestación de operación realizada.
- **FR-012**: Impedir reembolso duplicado, parcial o de pago pendiente; preservar el
  importe histórico total y la auditoría, sin ejecutar ninguna transferencia.
- **FR-013**: Mantener atención y pago independientes: completar no cobra, pagar no
  completa y cancelar no reembolsa automáticamente. Mostrar cada estado sin ambigüedad.
- **FR-014**: Consultas propias y agendas muestran estados e historial mínimo autorizado;
  filtros administrativos incluyen atención y pago sin abrir perfiles o datos de otros tenants.
- **FR-015**: Revalidar identidad, propiedad, asignación y membresía actual en cada
  operación y lectura; ningún rol administrativo global ni permiso concedido solo por UI.
- **FR-016**: Permitir los mismos flujos en Web y Android, con carga, vacío, error,
  confirmación explícita, conflicto y reconciliación de resultado incierto; sin rediseño visual.
- **FR-017**: Verificar permisos, límites temporales, idempotencia, concurrencia y rollback
  con pruebas reales controladas además de unitarias; no declarar simulaciones como dinero real.
- **FR-018**: Conservar reservas y datos anteriores, distinguir ausencia histórica de
  registro y documentar compatibilidad/migraciones antes de aplicarlas. No modificar los
  conjuntos T019 o cancelación para demostrar 005 sin una autorización específica.

### Key Entities

- **Atención**: resultado/ciclo de una cita asignada, con actor y tiempos reales.
- **Política de inasistencia**: tolerancia contextual e histórica pertinente a la cita.
- **Registro de pago**: cita, método, importe histórico y estado pendiente/pagado/reembolsado.
- **Instrucciones Yape**: información comercial de cobro del establecimiento, con lectura restringida.
- **Evento auditable**: transición o confirmación financiera única; motivo requerido para reembolso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En Web y Android se demuestra reserva→inicio→completada y pago pendiente→
  confirmado con las tres responsabilidades; se conserva el mismo identificador/importe.
- **SC-002**: La matriz antes/en/después del límite de inicio e inasistencia produce el 100 %
  de resultados esperados; ningún dispositivo altera la decisión del reloj confiable.
- **SC-003**: En diez pares concurrentes autorizados sobre un mismo pago/reembolso,
  exactamente una operación modifica el registro y crea su evento; cero duplicados/parciales.
- **SC-004**: Todos los casos cliente ajeno, barbero no asignado, inactivo y roles A/B
  producen el resultado autorizado/denegado esperado, sin datos privados cruzados.
- **SC-005**: Reembolso válido, repetido y rechazado deja total/historial coherentes;
  ninguna prueba realiza o atribuye a la app un movimiento monetario real.
- **SC-006**: Los 18 FR se vinculan a casos de aceptación y evidencia Web/Android; no se
  declara 005 implementada por este borrador ni se cierra con fallos/gates físicos pendientes.

## Assumptions

- Dependencias: identidad/perfiles/membresías002, sesión/contexto003 y reservas/agendas/
  cancelación004. No duplicar usuarios ni introducir un rol global o backend de negocio distinto.
- Se reutilizan moneda PEN, instantes confiables y presentación America/Lima.
- Cancelación existente conserva política histórica predeterminada de 120 minutos;
  la tolerancia de inasistencia de 10 minutos es otra regla y no reemplaza ese plazo
  ni agrega penalización.
- No se cambiarán estados históricos ni se supondrán pagos al incorporar esta funcionalidad.
- Aplicación de cualquier nuevo esquema, pruebas con datos, cambios de servicios o Cloud
  requieren revisión del SQL/destino y autorización específica. Esta fase no aplica SQL.
- Fuera de 005: pasarelas, conciliación bancaria, QR/imagen de comprobante, transferencias,
  reembolsos parciales, documentos fiscales, descuentos/deudas automáticas y rediseño visual.
- Google, favoritos, estilos, reprogramación, perfil profesional propio, imágenes,
  notificaciones, reseñas y mapas siguen perteneciendo al producto aprobado; no se
  consideran opcionales ni satisfechos por 005 y necesitan sus etapas correspondientes.

### Fuentes y estado real

Propuesta aprobada, commit `1eb8852388480388f39035641eb87d299def9258`, consultada en solo lectura:
[RF15–RF25/RF27/RF36–RF38/RF41–42](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/01-analisis-de-sistema/03-requisitos-funcionales.md),
[HU09/HU10/HU15/HU16/HU24/HU25/HU27](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/01-analisis-de-sistema/02-historias-de-usuario.md).
La Constitución VII exige confirmación manual por asignado activo o administrador contextual.
[004](../004-mvp-reservas/spec.md) excluye atención/pagos/reembolsos expresamente.

Inspección actual: `BookingDetail.state` y las persistencias004 solo contemplan
confirmed/cancelled; no hay ciclo de atención ni registros de pago en el esquema vigente.
El backend002 permite actualizar perfil propio, pero003 no ofrece todavía un editor personal
completo. No confundir APIs previas, botones o prototipos de referencia con flujos implementados.
Siguiente paso de 005: revisión del alcance, plan de compatibilidad/contratos y SQL aditivo
revisable; después tareas y aprobación concreta de aplicación local. No se generaron tareas
de implementación ni se aplicó una migración en esta preparación.

## Flujo operativo vigente — Sprint 2

Pagos, reglas de atención y reglas de reservas se configuran en «Pagos y reglas»,
junto a Horarios en Administrar barbería. El editor Yape recoge titular y número;
la vista previa no acredita persistencia del QR. Las instrucciones se conservan
en la reserva; el reporte del código de tres dígitos se especifica en 017.

Elegir Yape no exige pagar antes de confirmar la reserva. El cliente puede consultar
su pago desde el detalle de Mis reservas. Efectivo se entrega presencialmente.
«Confirmar pago» del cliente comunica un reporte; solo personal autorizado puede
registrar recepción. No hay cobro automático, abonos ni combinación de medios.

Las acciones iniciar/completar atención, recibir pago e inasistencia solicitan
confirmación antes de enviar la mutación. En Web se presenta un diálogo localizado
en la tarjeta, con cancelar/cerrar y bloqueo de doble envío. Un inicio anticipado
informa mediante aviso temporal de advertencia; nunca aparenta una transición
exitosa. El servidor conserva la validación definitiva de hora, estado y permisos.
