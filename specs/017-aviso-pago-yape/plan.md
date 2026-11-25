# Plan

1. Extender el comando cerrado care con report-yape y securityCode.
2. Agregar una tabla privada con RLS sin acceso directo, vinculada a la reserva
   y su barbería. Validar propietario y estado con los bloqueos del motor actual.
3. Extender care_json conservando la compatibilidad con reservas anteriores.
4. Registrar care_events y reutilizar el trigger de notificaciones, sin códigos
   en las notificaciones. Mantener inalterada la confirmación manual receive.
5. Componer la tarjeta Web en Mis reservas y el formulario compartido Android.
   Mostrar el código también en los detalles profesionales y administrativos.
6. Verificar dominio, controlador, adaptador/servidor, presentación y arquitectura.

## Activación y persistencia vigentes

Migración 20261124193549_client_yape_payment_report.sql aplicada en Cloud el24/11,
tras integración SQL y carreras receive/report/cancel en copia local aislada.
reservation-command actualizado (v4 en la activación acreditada). canReportYape
expresa la capacidad de la base; la Edge acepta report-yape. No vuelve a activar
ni aplicar nada este documento. Web aceptada manualmente; Android final pendiente.

Nunca ejecutar los scripts de pruebas contra Cloud o datos de pago reales.
El almacenamiento del QR requiere una ampliación independiente ya documentada
en specs/011-equipo-resumen-profesional/ui-yape-web.md.

Prueba SQL ejecutada en tests/integration/booking/yape-report.local.sql con fixtures
autorizados en copia local aislada y rollback; incluye aislamiento y concurrencia.
Resultados en .artifacts/yape-report-* y docs/CODEX-HANDOFF.md. No acredita pagos reales.
