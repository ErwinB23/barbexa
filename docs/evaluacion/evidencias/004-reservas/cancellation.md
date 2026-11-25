# Cancelación local — T024–T026 y preparación T027

14/11/2026 Lima. T023 se cierra por confirmación manual del usuario y matriz de permisos
previa; T013 sigue pendiente de oferta/invitaciones reales en ambas plataformas.
T024/T025/T026 verificadas técnicamente; T027 espera cancelación manual Web/Android.
00425/34. Ninguna tarea posterior a T027 ejecutada.

## Implementación y permisos

Nueva migración20261115033925_booking_cancellation.sql aplicada por psql al contenedor
verificado app-barberia-002-local:54422. Solo funciones nuevas: helper privado de límite
inclusive, private.reservation_cancel y wrapper public.cancel_booking. Sin cambio de tablas,
políticas RLS, ACL históricas, Auth ni datos existentes por la migración. No dbpush/repair
del historial CLI. Reversión requiere nueva autorización: retirar wrapper, cancel privado
y helper, sin CASCADE ni borrar datos. [Aplicación](t024-t027/migration.json).

Wrapper invoker y privado SECURITY DEFINER con search_path vacío, referencias calificadas;
EXECUTE revocado PUBLIC/anon/authenticated; solo service_role invoca la mutación. El secreto
no es autorización por sí mismo: Edge verifica JWT con Auth002 y pasa la identidad verificada;
SQL vuelve a comprobar cuenta/perfil, propiedad o membresía activa/rol/profesional asignado.
Body cerrado requestId/reservationId/reason, nunca userId/rol/política del cliente.

Cancelación del cliente: clock_timestamp()<=starts_at-minutos del snapshot. Default de
configuración sigue120; no se reescribió ninguna configuración. Personal asignado activo
o admin contextual requiere motivo. Repetición autorizada devuelve el resultado sin
reescribir actor/fecha/motivo. Estado/evento/liberación se confirman en la misma transacción.
Locks: configuración del tenant, claves globales de personas ordenadas como confirmación,
luego reserva/membresía. La exclusión física existente deja de incluir la fila cancelada
cuando se confirma la transacción; no se modificó la restricción.

Cliente/servidor tienen CancelarReserva y puertos propios. Adaptadores HTTP/PostgreSQL,
composición explícita, rama cancel de reservation-command local existente; JWT/CORS sin
cambios, sin reiniciar servicios. Peticiones reales comprobaron el código actualizado.
UI en Mis reservas y Agenda: confirmación explícita, motivo staff, política visible,
error/reintento y actualización. Ref solo para coordinación de evento; estado para render;
doble activación no crea solicitudes paralelas y timeout conserva la misma identidad.
Un motivo que excede el límite técnico8KiB se trata como entrada editable (413), no como
resultado desconocido que bloquee la edición. No hay penalizaciones, pagos ni reembolsos.

## Verificaciones realizadas sin repetir las reservas T019

-2 RED iniciales de aplicación servidor y5 RED SQL estructurales. Expectativas mantenidas,
  luego GREEN. SQL ampliado con ACL privada y límites exactos: [12/12](t024-t027/sql-check.log),0.
- Cliente:3 unitarias de límite120 inclusive/configurado, validación cerrada y errores,0.
- Servidor Deno:9/9 de reservations afectado,0; node contratos de cancelación2/2.
-48 pruebas dirigidas de presentación/composición/regresiones afectadas,0, incluidas2
  nuevas de confirmación/motivo/doble activación.8 del adaptador,0, incluida regresión
  RED→GREEN de 413. No sustituye aceptación física Web/Android.
- [Integración inicial](t024-t027/http.json):13 comprobaciones con JWT real, snapshot120,
  propietario fuera del plazo, ajeno, motivo staff, repetición/auditoría original, rollback,
  dos peticiones/conexiones independientes cancelación→alta y una única ocupación nueva.
- [Política histórica](t024-t027/historical-policy.json): configuración actual120 intacta,
  fixture histórico0 permite al propietario cancelar. Prueba que no se lee la política
  actual para cambiar una cita antigua; no se simuló una edición real de configuración.
- [Barbero](t024-t027/barber-role.json):8 comprobaciones, mismo JWT al cambiar temporalmente
  membresía A a Barbero y a Inactiva; motivo requerido, inactiva rechazada sin cancelar,
  barbero activo asignado cancela/evento capacity=barber. Fila original completa guardada
  localmente y cotejada tras restaurarla exactamente; permiso admin recuperado.
- Tipos, lint afectado, formato, arquitectura cliente y check servidor aprobados. Incidencias:
  primera orden de copia del núcleo falló por comillas antes de escribir; corregida sin tocar
  datos. Lint detectó Date.now/ref durante render: corregido con inicialización perezosa y
  estado, sin bajar reglas. Mapeo413 era error de dependencia: corregido tras RED específico.

## Datos conservados

[Ledger](t024-t027/fixtures-final.json):7 reservas sintéticas del máximo8, cuatro canceladas
y tres confirmadas; dos son exclusivamente manuales. Todas conservadas, ninguna retirada.
No nuevas cuentas/tenants/profesionales/servicios/invitaciones; ninguna cita T019 modificada.
El operador cotejó las filas previas; los snapshots de recuperación y credenciales están
solo en .artifacts ignorado, sin JWT/contraseñas en evidencias. No usar prepare/cleanup T019:
las sintéticas tienen un manifiesto separado y requieren autorización de retirada posterior.
T019 y las dos sintéticas manuales permanecieron intactas después de la prueba de rol.

Las citas de borde creadas administrativamente son fixtures artificiales, no evidencia de
que la UI permita reservar fuera de horario. La carrera sí usó slots reales y confirmación
normal, sin modificar horarios/configuración ni competir con citas T019.
Operadores reproducibles en tests/integration/booking/cancellation{,-snapshot,-barber}.mjs
exigen autorización explícita/guards/IDs y no deben repetirse sobre este conjunto.

## Pendiente manual y límites

[Único recorrido](t024-t027/recorrido-manual.md): oferta/invitación T013 y las dos cancelaciones
sintéticas identificadas. No repetir citas/registros/correos ni cancelar otra reserva.
No atribuir las pruebas físicas aún pendientes a Codex o al usuario. No T028+, Cloud,
proyecto antiguo, servicios reiniciados, log activo editado, APK/paquetes, git add/commit/push.
Nueve avisos npm y recuperación003 pendientes; URL pública Auth antigua sigue diferida.
