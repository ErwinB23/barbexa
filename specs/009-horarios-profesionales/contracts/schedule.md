# Contrato — 009

Comandos Edge cerrados, actor separado y verificado:
- get-own-schedule {barbershopId} → OwnSchedule.
- set-own-schedule {barbershopId, version, hours} → OwnSchedule.
- upsert-own-block {barbershopId, version, block:{id,startsAt,endsAt,reason}} → OwnSchedule.
- remove-own-block {barbershopId, version, blockId} → OwnSchedule.

Nunca userId/barberId/role/active en payload. Backend revalida propiedad y pertenencia;
un UUID arbitrario de bloqueo no permite modificarlo fuera del profesional/tenant.
Version no es autorización. Retirar bloque ausente puede responder sin cambio;
versión obsoleta en escritura efectiva produce CONFLICT. Respuestas de otra identidad
o tenant y resultados de generación anterior se descartan.

SQL en schedule.sql es BORRADOR NO APLICADO. Reversión futura solo funciones nuevas;
ninguna limpieza de schedules/bloqueos/citas sin permiso. Habilitación cliente y servidor
independientes, ambas false por defecto hasta activación autorizada y validada.
