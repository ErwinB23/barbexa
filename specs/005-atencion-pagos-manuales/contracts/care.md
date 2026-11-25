# Contrato005
POST reservation-command conserva CORS/JWT y añade action=care con command cerrado:
read,start,complete,no-show,receive,refund,settings,configure,payment-options.
Campos: reservationId o barbershopId, requestId en mutaciones; receive/refund exigen
attested=true, refund además reason no vacío. configure: noShowToleranceMin entero0..1440
(límite técnico), yapeInstructions null o texto1..2000. No userId/role/precio del cuerpo.
Respuesta de cita: reservationId, attendance(null o confirmed/in-service/completed/no-show/
cancelled), payment(null o {method,status,amountMinor,currency:PEN}), noShowToleranceMin,
yapeInstructions, events(kind,occurredAt,actorUserId,capacity,reason) y permissions
{attend,receive,refund}. Null significa ausencia, no estado financiero inventado.
settings/configure solo admin activo; payment-options solo cash/yape booleanos para shop
comercial visible, sin instrucciones privadas. Errores004 seguros.
Confirmación nueva añade paymentMethod cash|yape; RPC confirm_booking_paid conserva
{detail,replayed}. Ledger y reserva atómicos. Método distinto con requestId previo es conflicto.
La RPC antigua sin pago deja de ser ejecutable por service_role tras activar la migración.
Citas heredadas siguen consultables/cancelables; cambios005 sin registro devuelven
NOT_AVAILABLE. No se les crea ledger ni se altera historia automáticamente.
