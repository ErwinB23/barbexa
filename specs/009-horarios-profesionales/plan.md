# Plan — 009

Expo58 y backend004/008 reutilizados. Módulo compartido en barbershop-operation:
domain/self-schedule.ts, application/self-schedule.ts, puerto propio y adaptación HTTP
existente. Composición entrega acciones opcionales solo con capacidad pública explícita.
Panel en /schedules, controles existentes; no nuevo paquete ni APK.

Servidor: núcleo self-schedule separado y adaptador RPC existente. Tras autorización009,
barbershop-operation conecta directamente el gateway de los cuatro comandos. No requiere
variables nuevas ni reiniciar el contenedor; el flag público cliente sigue opt-in.
SQL revisable: una privada y cuatro wrappers service_role, sin tablas/políticas nuevas.
Reutilizar barber_schedules/schedule_exceptions y contención004. Derivar actor/profesional,
bloquear settings→membresía→perfil; settings FOR UPDATE excluye confirmaciones compartidas.
Proteger citas confirmed ocupadas con occupied_until>now(), considerando care si existe.
No modificar helper histórico004 ni ampliar permisos administrativos.

Constitución2.0.0 conforme: dominio sin SDK, separación cliente/servidor, autorización
servidor y RLS conservadas, Web/Android obligatorios. Validar con TDD dirigido y gates.
Migración20261115203629 aplicada LOCAL;25 comprobaciones estructurales y11 HTTP de lectura/
rechazo aprobadas. Las escrituras/locks/rollback funcionales aún requieren prueba autorizada.

## Estado integrado

Los comandos de horarios/bloqueos propios están conectados en Cloud. Mi espacio
profesional reutiliza los puertos y casos de uso existentes; Web emite avisos
temporales solo tras resultado confirmado. Recorrido manual Web aceptado el24/11;
Android final pendiente. Las notas de preparación anteriores no piden reactivar servicios.
