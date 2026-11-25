# Contrato revisable — 010

POST reservation-command, JWT verificado y Origin existente:
- action=reschedule-slots, reservationId, localDate AAAA-MM-DD → slots derivados del
  servidor (startsAt/endsAt UTC, estimatedTotal). No aceptar serviceIds/profesional ajenos.
- action=reschedule, requestId UUID, reservationId, expectedStartsAt UTC, startsAt UTC.
  reason opcional normalizado; obligatorio para personal fuera de antelación del cliente.
  Primer resultado201, repetición200, BookingDetail con igual identidad/condiciones.
  SQL reschedule_booking(actor verificado,data) devuelve {detail,replayed}; consulta
  list_reschedule_slots(actor verificado,data). RPC solo service_role; interna cerrada.
- action=reschedule-policy, barbershopId: lectura de política; añadir advanceMin para editar.
  Solo administrador activo del tenant. RPC get_reschedule_policy/set_reschedule_policy.
- action=reschedule-history, reservationId: últimos200 eventos autorizados, RPC
  get_reschedule_history. Auditoría completa permanece en tabla privada, sin límite de
  cantidad de reprogramaciones. No exponer datos de otros tenants.

400 entrada inválida,401 sesión inválida,403 permiso,404 recurso no disponible,409
conflicto/estado/política,503 dependencia. Conflicto de ocupación solo informa profesional
no disponible. Nunca retornar horarios/datos de la barbería que causa un conflicto.

expectedStartsAt no sustituye autorización; es precondición optimista contra dos cambios
incompatibles. SQL compara actor, política real y estado bajo locks/exclusión. RequestId
igual con otro payload no es una operación nueva. Pago confirmado se conserva tal cual.
Backend LOCAL aplicado/lecturas probadas; escrituras y E2E pendientes. Flag público no
concede autorización y permanece deshabilitado en el entorno real.
