# Seguimiento

- [x] Identificar placeholder y ausencia de infraestructura de notificaciones.
- [x] Definir alcance Web, destinatarios, permisos y cobertura inicial.
- [x] Preparar puerto, adaptador, estado aislado y pruebas con dobles.
- [x] Integrar historial, contador, refresco y lectura explícita en Web.
- [x] Preparar SQL aditivo fuera de migraciones activas.
- [x] Ensayar SQL en PostgreSQL desechable con autorización.
- [x] Probar destinatarios, lectura idempotente, denegaciones, rollback y ocho sesiones concurrentes.
- [x] Regresión SQL RPC de invitación/aceptación/reserva/replay/rollback/reprogramación/pago/cancelación/reembolso y dos barberías.
- [ ] Consolidar evidencia técnica HTTP con sesiones auténticas y eventos autorizados; reutilizar recepción Web aceptada, sin repetir su recorrido.
- [x] Autorizar y aplicar migración Cloud revisada con respaldo (20261122184214, historial19).
- [x] Recepción Web confirmada por usuario; contador rojo y refresco automático5s preparados y probados con dobles.
- [ ] Verificar dos cuentas reales sin escrituras de negocio no autorizadas.
- [ ] S2-ANDROID Resolver la brecha de alcance:012 entrega bandeja Web, mientras Constitución2.0.0 exige aceptación Android del producto. Definir y acreditar su recorrido Android sin darlo por cubierto por Web.
- [x] Aprobar interfaz y recorrido funcional manual Web: declaración del usuario el24/11/2026; no equivale a nueva prueba automatizada.


## Eliminación individual — 24/11/2026
- [x] Puerto/estado/cola/adapter, error y descarte de respuestas de otra cuenta.
- [x] Papelera dentro de tarjeta abierta y confirmación por ID; capacidad servidor.
- [x] Contrato SQL y ensayo con fixtures aislados y rollback preparados.
- [x] Pruebas cliente17/17 de notificaciones, tipos/lint/formato/arquitectura.
- [x] Autorizar ensayo SQL desechable y, si pasa, activación Cloud revisada.
- [x] Ejecutar SQL de denegación/aislamiento/idempotencia/conteo en PostgreSQL17.11 aislado; rollback y contenedor retirado.
- [x] Aplicar migración Cloud20261124154602 autorizada sin eliminar avisos existentes; respaldo y27 tablas protegidas conservadas.
- [x] Verificar disponibilidad de papelera en sesión real sin borrar avisos del usuario; confirmación abierta y cancelada, sin reload.
- [x] Corregir runtime conservado durante Fast Refresh: regenerar composición vigente y liberar cliente anterior; regresión legacy y handler real de confirmación/fallo/reintento.
- [ ] Acreditar específicamente aislamiento de eliminación con dos cuentas reales y aviso desechable autorizado; la aceptación funcional Web no demuestra este caso técnico. No borrar avisos existentes sin permiso.
