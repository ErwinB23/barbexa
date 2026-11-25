# Decisiones — 010

Usuario15/11: fecha/hora únicamente; misma reserva, barbería, profesional, servicios y
precio. Antelación inicial120min configurable por administrador contextual, sobre inicio
actual y reloj servidor, sin límite de cantidad. Conservar pago pendiente/confirmado y su
historial, sin cobros/reembolsos nuevos. Bloquear canceladas/iniciadas/completadas/no-show.
Cambio atómico y auditable; fallo conserva horario/finanzas. No cambiar29 reservas.

RF18/HU11/RF27 de propuesta aprobada; ADR de transacciones y snapshots. Usuario aprobó
excepción de antelación para administrador activo y barbero asignado activo, con motivo
obligatorio fuera del plazo y opcional dentro; no omitir estados/disponibilidad.
No reutilizar confirmar+cancelar: crearía otra identidad y podría alterar pagos.
La consulta nueva debe usar snapshots y excluir solo su propio id, sin mostrar conflictos
de otras barberías. RPC aplicadas LOCAL con permiso; lecturas/rechazos HTTP acreditados,
sin invocar operaciones de escritura ni configurar políticas.
