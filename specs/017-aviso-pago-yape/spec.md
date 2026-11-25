# Aviso de pago Yape del cliente

## Alcance aprobado

El cliente accede desde Mis reservas a Consultar atención y pago. La tarjeta
muestra importe e instrucciones históricas, titular y celular cuando usan el
formato guardado por el editor. El QR permanece pendiente de Storage.
Confirmar pago envía un código de tres dígitos y crea un aviso para revisión
manual. El personal consulta ese código y verifica la transferencia antes de
registrar la recepción del importe completo.

## Criterios de aceptación

- Solo el cliente propietario puede reportar una reserva confirmada con Yape
  y pago pendiente, sin cancelación ni inasistencia.
- Se aceptan exactamente tres dígitos, incluidos ceros iniciales.
- El importe, identidad, permisos y barbería se resuelven en servidor.
- El reporte no cambia payment_status. Solo receive autorizado marca paid.
- Hay un único reporte por reserva. El reintento de la misma solicitud es
  idempotente. Una nueva solicitud o código para un reporte existente da conflicto.
- El reporte, evento y notificaciones se confirman en la misma transacción.
- El cliente y el personal autorizado pueden consultar el código por el acceso
  ya autorizado al detalle. Se conservan pagos e instrucciones de reservas antiguas.
- La ausencia de la nueva capacidad en un backend anterior deshabilita el envío
  y muestra que está pendiente de activación.
- Web y Android comparten validación, comandos y manejo de errores/reintentos.

Los abonos, pagos mixtos, reemplazo del código reportado y QR persistente quedan
fuera de esta entrega. El código identifica la transferencia para contrastarla
manualmente con el receptor. La base no puede verificar un movimiento en Yape.

## Aceptación y límites vigentes — 24/11/2026

Backend activo en Cloud e interfaz Web aceptada manualmente por el usuario. Enviar
tres dígitos registra un aviso para la barbería y deja la recepción pendiente; el
código no autentica una transferencia ni sustituye consultar el Yape del receptor.
El cliente puede pagar después de reservar, desde Mis reservas; no se exige hacerlo
en la confirmación inicial. No se acreditan transferencias monetarias reales,
pagos parciales o mixtos. Persistir/servir el QR mediante Storage y la aceptación
Android final continúan pendientes.
