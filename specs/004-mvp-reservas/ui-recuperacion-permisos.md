# Recuperación de comprobación de permisos — 24/11/2026

## Problema
La ruta administrativa podía permanecer en Cargando permisos, sin reintento habilitado,
si la consulta inicial no finalizaba. Usuario solicita evitar salida obligatoria a Inicio.

## Alcance y aceptación
- Watchdog12s para lectura inicial del administrador; pasa a error seguro.
- Invalidate existente elimina permiso, libera consulta lógica y descarta respuesta tardía.
- Retry dentro de ruta inicia nueva consulta. No permiso ficticio ni bypass de servidor.
- Mantener nombre/pestañas de administración y skeleton sin datos privados en Web.
- Resolver automáticamente en la ruta actual al recibir permisos válidos.
- Limpiar timers y comprobar snapshot/scope para no afectar nuevas solicitudes.
- Sin modificar revalidación ready, backend, Auth, RLS, roles o datos Cloud.

## Plan y tareas
- [x] Prueba roja de lectura indefinida, timeout y reintento.
- [x] Añadir deadline en composición useTeamAuthority utilizando invalidate existente.
- [x] Recuperación contextual y navegación sin montar consumidor protegido.
- [x] Respuesta tardía con permisos válidos no restaura autoridad expirada.
- [x] Cliente561/561, tipos/lint/formato/arquitectura/diff.
- [ ] Recorrido integrado Web/Android final; no cortar red ni cambiar permisos reales para probar.

Los tests usan timers controlados y gateway ficticio exclusivamente en pruebas.
No se afirma haber reproducido una interrupción real de red ni un fallo concreto de Cloud.
