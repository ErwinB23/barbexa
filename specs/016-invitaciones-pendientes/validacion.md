# Validación 016 — Pendientes y reenvío en BARBEXA

23/11/2026, America/Lima. Migración016 ensayada y aplicada con autorización específica.

## Resultado

Pendientes e Historial de invitaciones en desplegables independientes. Nombre de
cuenta, correo y fecha de envío (Lima) de pendientes; orden descendente y separación
por barbería. Conserva cancelar; Reenviar genera un recordatorio en la bandeja
existente, según la elección explícita del usuario «Aviso dentro de BARBEXA».
No duplica/acepta la invitación ni modifica su fecha de envío. No envío por correo.
Estados de carga, vacío, error y éxito específico; un aviso reciente tiene un
mensaje distinto de un recordatorio creado. Botones bloqueados durante operación.

Contrato recipientEmail opcional. Email actual desde Auth solo en la proyección
administrativa de invitaciones profesionales pendientes; destinatarios e historial
no reciben este campo con valor. La cuenta del usuario sigue siendo la fuente del
nombre; no se crean datos ficticios. Android comparte datos y acción de reenvío.

## Archivos

- domain/types.ts y application/operation-gateway.ts en barbershop-operation:
  correo opcional y puerto opcional del recordatorio.
- application/operation-application.ts: autorización de administrador y barbería
  seleccionada, protección de operaciones concurrentes y cambios de contexto.
- infrastructure/operation-http-adapter.ts: contrato y RPC, verificación Auth previa.
- presentation/team-management-web.tsx y team-management-web.styles.ts:
  desplegables, tarjetas y acciones con los tokens existentes.
- presentation/operation-screen.tsx: conexión de acciones Web/Android y mensajes
  específicos, conservando el comportamiento anterior de otras operaciones.
- tests/presentation/booking/team-management-web.test.mjs,
  tests/integration/booking/operation-client.test.mjs e invitation-history.test.mjs:
  render/acciones, pertenencia, autorización y transporte del recordatorio.
- supabase/migrations/20261123221939_pending_professional_invitations.sql:
  amplía booking_invitations para correo administrativo y añade RPC
  remind_professional_invitation. Reutiliza authority_assert(team), solo propietario
  administrador activo con permiso de equipo, barbería exacta, rol barber y
  estado pending. Bloquea la fila de invitación para serializar reenvíos/cancelación;
  suprime recordatorios repetidos durante60s. Inserta únicamente web_notifications.
  No tablas nuevas ni permisos de lectura general de Auth; sin despliegue Edge.
- supabase/tests/pending-professional-invitations.test.sql: ejecutado en ensayo aislado;
  creación/deduplicación, pendiente conservada, correo contextual, no administrador,
  invitación resuelta, privacidad y visibilidad en bandeja. La concurrencia real
  en conexiones separadas también se ejecutó en el ensayo autorizado.
- scripts/pending-invitations-rehearsal.mjs y pending-invitations-cloud.mjs:
  ensayo desechable, concurrencia y fases de respaldo/aplicación/lectura/advisors.

## Verificación y pendientes

Pruebas nuevas de UI/aplicación fallaron antes de implementar y pasan después.
Tipos, lint, arquitectura (262 módulos,55 núcleo,864 aristas) y exportación Expo Web
aprobados. Artefacto ignorado `.artifacts/pending-invitations-web-build`.
12 pruebas dirigidas iniciales aprobadas, luego14 de OAuth/adaptador aprobadas.
La primera suite completa tuvo un ENOENT transitorio al abrir un módulo existente
sin extensión en el loader de Google; el archivo existe y el caso pasó aislado.
No se cambió ese loader ni el código de autenticación. Repetición completa registrada
con **524/524 aprobadas** en `.artifacts/pending-invitations-client-final.log`.
Formato dirigido y `git diff --check` aprobados.

## Activación016 autorizada

Usuario autorizó «si porfavor autorizo» y luego pidió continuar. Destino exclusivo
vuoncrtkkkquvddunrxx, región sa-east-1, 22 migraciones previas comprobadas.
No se reutilizó la autorización015. La migración final reutiliza el permiso de
equipo existente mediante authority_assert(team), conservando la denegación a
administradores secundarios sin esa capacidad; no concede permisos nuevos de equipo.

Ensayo PostgreSQL17 desechable sin red/puertos/montajes de datos del host: 23
migraciones, **13/13 pgTAP aprobadas**. Incluye correo contextual, destinatario,
resuelta/no administrador/secundario denegados y bandeja existente. Dos conexiones
simultáneas reales: **1 recordatorio creado, 1 suprimido, 1 notificación persistida**.
El primer montaje del fixture concurrente omitía su propietario requerido por el
invariante existente; se corrigió el fixture y se repitió sin desactivar controles.
Contenedor propio eliminado. Evidencia ignorada:
`.artifacts/barbexa-pending-invitations-1795472849420/report.json` y logs SQL/concurrencia.

Respaldo lógico privado nuevo en
`C:/Users/PREDATOR/AppData/Local/Barbexa/backups/pending-invitations-1795472919072`:
esquema, datos, roles, historial y manifiesto SHA256. Restauración no ensayada;
configuración administrada Auth/OAuth y binarios Storage no incluidos.

Aplicada únicamente `20261123221939_pending_professional_invitations.sql`, SHA256
`0e90d5b676a4a6e575df8ee450cffce53465fa0105859b17111ab4b4d4ed7601`.
Historial **22→23**. Comparación antes/después de conteos/hashes completos de27
tablas, columnas, políticas y funciones/ACL: conservados salvo cuerpo aprobado
de booking_invitations y nuevo RPC. El RPC permite authenticated y deniega anon
y service_role; exige identity y permiso de equipo dentro. No despliegue Edge.
Registros privados: before.json/after.json/verified.json/apply-attempt.json.

Lectura real en transacción explícita READ ONLY con contexto de administrador
activo confirmado:1 invitación histórica,0 pendientes. Nombre/fechas/actividad,
contexto, orden y regla de correo coinciden con base. Esto NO prueba mostrar un
correo de pendiente real: actualmente no existe ninguna en ese contexto.
Tampoco se invocó el RPC de reenvío contra usuarios reales. No se creó una
invitación para probarlo ni se alteraron invitaciones, reservas o fixtures Cloud.
Registro privado history-verified-*.json. Reenvío solo acreditado en ensayo aislado.

Advisors de seguridad antes/después guardados privadamente. La única advertencia
nueva corresponde al RPC SECURITY DEFINER ejecutable por authenticated: es la
entrada intencional, protegida por auth.uid, authority_assert(team), barbería,
estado pendiente y ACL explícita; search_path vacío. No se declara cero advertencias.
Las advertencias previas de notificaciones y Auth se conservaron fuera del alcance.

Formato, lint de scripts y diferencias dirigidas aprobados. Sin dependencias/APK,
staging/commit/push; log T017 intacto. Autorización016 agotada al completar activación;
no repetir ni usarla para nuevas operaciones Cloud. Pendientes: recorrido visual
Web/Android físico y reenvío con una invitación real que el usuario quiera recordar.
