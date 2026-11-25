# Modelo — 010

Reutilizar reservations/items, identidad de profesional, care/pago/eventos de004/005.
No crear otra reserva ni filas históricas de pago para citas antiguas.

SQL aplicado LOCAL20261115210802: antelación privada por barbería predeterminada120;
registro idempotente de reprogramación con requestId, reserva, actor, instantes anterior/
nuevo y fecha de servidor. RLS/ACL cerradas, historial solo para actor autorizado.
Dos tablas privadas vacías con RLS;5 auxiliares privadas y5 RPC solo service_role.
No se aplicaron valores financieros históricos. Reserva/pago/ítems mantienen identidad;
la operación de reprogramación cambiará solo intervalo/ocupación derivado
de duración/buffer guardados, junto con el nuevo evento en una sola transacción.
