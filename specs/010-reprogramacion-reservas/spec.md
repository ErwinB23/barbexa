# Feature Specification: 010 — Reprogramación de reservas

**Created**: 2026-11-15 · **Status**: Implementada e integrada con Cloud; recorrido funcional manual Web aceptado el 24/11/2026. Android y acreditación integral de SC-001–003 según tasks.md.
**Fuente**: propuesta aprobada RF18/RF27, HU11 y decisiones del usuario15/11.

## User Scenarios & Testing

### US1 — Cambiar fecha y hora (P1)
Como cliente quiero reprogramar mi cita conservando sus condiciones económicas.
Prueba independiente: consultar alternativas y confirmar una, con igual id/profesional/
servicios/precio; un conflicto conserva exactamente el horario anterior.

1. Dada una cita confirmada con atención no iniciada, al cambiar fecha/hora disponible,
   se conserva identidad, barbería, profesional, servicios, snapshots y pago.
2. Dado el inicio actual, el cliente cumple una antelación inclusiva configurable por
   barbería, predeterminada120min, calculada por reloj del servidor; sin límite de cantidad.
3. Dada cita cancelada, iniciada, completada o inasistencia, se rechaza sin escrituras.
4. Dado pago pendiente o confirmado, se conserva método/importe/historial; no se cobra,
   cancela ni reembolsa por reprogramar.
5. Dadas solicitudes concurrentes incompatibles incluso entre barberías, no hay doble
   ocupación; el conflicto comunica solo «Profesional no disponible en ese horario».

### US2 — Control contextual y política (P1)
Administrador activo configura únicamente la antelación de su barbería. Administrador
activo y barbero asignado con membresía activa pueden reprogramar fuera del plazo con
motivo obligatorio; dentro del plazo el motivo es opcional. No se omiten estado ni
disponibilidad. Se registra actor, rol contextual, horario anterior/nuevo y motivo.

## Requirements
- FR-001 Permitir solo fecha/hora, nunca identidad, rol, profesional o precio manipulables.
- FR-002 Revalidar identidad, propiedad/membresía, estado, política y disponibilidad en SQL.
- FR-003 Cambio atómico con exclusión por persona, buffer histórico, idempotencia y control
  de versión del horario original; conservar cita/pago ante error.
- FR-004 Auditar horario anterior/nuevo, actor, rol contextual, motivo y fecha; no inventar eventos históricos.
- FR-005 Configurar antelación propia por administrador activo; valor inicial120min.
- FR-006 UI accesible compartida Web/Android: carga, vacío, error recuperable y resultado.
- FR-007 No reprogramar citas incompatibles ni alterar pagos/reembolsos.

## Success Criteria
- SC-001 Dobles verifican contrato cerrado, doble envío, reintento incierto y cambio de sesión.
- SC-002 SQL/HTTP reales acreditan aislamiento, carreras, auditoría y rollback, con permiso.
- SC-003 Recorrido físico Web/Android conjunto; no sustituible por compilación o dobles.

## Límites y casos extremos
UTC en contratos; Lima en UI. Intervalos consecutivos permitidos; disponibilidad debe
excluir únicamente la propia reserva, conservando todos los conflictos ajenos. Reintento
incierto mantiene requestId/objetivo. No usar cancelar+crear. Migración LOCAL autorizada;
no escrituras de negocio ni fixtures en este bloque.

## Interacción vigente

En Web el cliente elige la nueva fecha mediante calendario y luego un horario
disponible; no necesita escribir una fecha con formato técnico. El historial se
consulta y se pliega independientemente del formulario. Vencida la antelación,
se explica el límite de reprogramación, sin atribuirlo a una sesión inválida.
El personal autorizado conserva la excepción con motivo de US2. La agenda general
administrativa permite consultar el historial sin ofrecer allí la acción de reprogramar.
