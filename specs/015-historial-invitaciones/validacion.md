# Validación 015 — Historial de invitaciones profesionales

23/11/2026, America/Lima. Código y activación Cloud autorizada completados;
recorrido visual de la interfaz Web y Android físico pendiente.

## Implementación

Tarjetas dentro del desplegable existente de Gestión de equipo y personal.
Avatar de icono, nombre de cuenta, barbería, fecha de envío, fecha de respuesta
(«Aceptada el» cuando procede), estado de invitación y actividad profesional
actual independientes. Estética y tokens existentes, cuadrícula adaptable,
contraste mediante etiquetas y foco de teclado. Sin nuevas acciones ni librerías.

Orden por createdAt descendente, ID descendente para desempates y fechas ausentes
al final; no se muta el arreglo de origen. Filtrado por barbería en Web y Android.
El historial se oculta durante carga para no presentar contenido anterior como vigente.

Nombre desde profiles.display_name: cuenta actual registrada con Google o correo,
sin consultar ni exponer metadatos Auth. No es una copia histórica del nombre.
Actividad actual exige perfil activo y membresía activa de la misma barbería.
Fechas desde staff_invitations.created_at/responded_at, formateadas en Lima.
Campos opcionales para compatibilidad con el servidor anterior; no se inventan datos.

## Archivos y piezas reutilizadas

- `src/features/barbershop-operation/domain/types.ts`: metadatos opcionales.
- `src/features/barbershop-operation/infrastructure/operation-http-adapter.ts`:
  decodificación estricta y rechazo de invitaciones de otra barbería.
- `src/features/barbershop-operation/presentation/invitation-history.ts`: orden,
  formato horario y etiqueta de actividad compartidos.
- `team-management-web.tsx` y `team-management-web.styles.ts` en esa carpeta:
  tarjetas dentro del details; reutiliza TeamManagementIcon, avatar y badges.
- `operation-screen.tsx`: prop de barbería seleccionada y datos/orden en Android,
  conservando acciones y controles existentes.
- `tests/presentation/booking/team-management-web.test.mjs`: orden, nombres,
  fechas, actividad independiente, compatibilidad y exclusión de otra barbería.
- `tests/integration/booking/invitation-history.test.mjs`: contrato, fechas,
  actividad, compatibilidad y rechazo de valores/contexto incorrectos.
- `scripts/run-client-checks.mjs`: incorpora la nueva prueba con dobles a la lista
  de integración sin efectos externos.
- `supabase/migrations/20261123215834_professional_invitation_history.sql`:
  reemplaza solamente private.booking_invitations, conservando actor, administrador
  activo y barbería exacta. Proyección del destinatario conservada. No añade tablas,
  permisos, roles ni datos; no requiere despliegue Edge.
- `supabase/tests/professional-invitation-history.test.sql`: ejecutado en ensayo aislado;
  comprueba orden, nombre de cuenta, fechas, actividad y aislamiento/autorización.
- `scripts/invitation-history-rehearsal.mjs` y `scripts/invitation-history-cloud.mjs`:
  ensayo aislado y fases de respaldo/aplicación/verificación con guardas de destino,
  hashes y protección contra repetir automáticamente una aplicación.

## Evidencia y límites

Prueba de presentación nueva observada fallar antes de implementar y pasar después.
Seis pruebas dirigidas de presentación/adaptador aprobadas. Tipos y exportación
Expo Web aprobados. Artefacto ignorado `.artifacts/invitation-history-web-build`.
`npm run test:client`: 521/521 aprobadas, incluyendo las dos nuevas pruebas de
adaptador. `npm run lint` aprobado. `npm run architecture:check`: aprobado,
262 módulos, 55 del núcleo, 864 aristas. Formato dirigido y `git diff --check`
aprobados durante la implementación de la interfaz.

## Activación 015 autorizada

El usuario autorizó expresamente «si la autorizo vamos» para esta migración015.
Se comprobó el destino exclusivo `vuoncrtkkkquvddunrxx`, región sa-east-1, y las
21 versiones anteriores contra los archivos locales. No se reutilizó el permiso014.

Ensayo sobre PostgreSQL17 desechable sin red, puertos o montajes de datos del host:
22 migraciones y **13/13 aserciones pgTAP aprobadas**, incluyendo ejecución como
authenticated, rechazo de otra barbería/no administrador, nombre desde la cuenta,
fechas, orden con dos invitaciones, actividad del perfil/membresía y proyección
del destinatario conservada. Contenedor propio eliminado. Evidencia ignorada:
`.artifacts/barbexa-invitation-history-1795471540632/report.json` e
`invitation-history-tests.log`.

Respaldo lógico nuevo privado:
`C:/Users/PREDATOR/AppData/Local/Barbexa/backups/invitation-history-1795471665691`.
Incluye esquema, datos, roles, historial y manifiesto SHA256. No se ensayó su
restauración; no incluye configuración administrada Auth/OAuth ni binarios Storage.

Se aplicó solo `20261123215834_professional_invitation_history.sql`, SHA256
`27e77136d62d2a5b3d0288d98d9fe20c8bab672ad87719d9173b455574758e66`.
Historial **21→22**. Comparación antes/después: conteos y hashes completos de
27 tablas, columnas, políticas y funciones/ACL conservados, salvo el cuerpo aprobado
de `private.booking_invitations`. Anon sigue sin EXECUTE; authenticated conserva
su acceso al RPC, con autorización contextual dentro de la función. No despliegue Edge.
Registro privado `verified.json`, `after.json` y `apply-attempt.json`.

Verificación con datos existentes: una invitación real leída bajo contexto de un
administrador activo confirmado. Nombre de cuenta, fechas, pertenencia a barbería,
actividad y secuencia por fecha coinciden con las tablas. Consulta administrativa
propietaria dentro de `BEGIN READ ONLY`, sin cambiar permisos ni escribir datos;
no sustituye el E2E de sesión real. Resultado privado `history-verified-*.json`.
Formato y lint de los dos scripts aprobados.

No se crearon/invitaron/desactivaron usuarios ni se alteraron invitaciones, reservas
o fixtures existentes. No APK, staging, commit o push. El permiso015 queda agotado
al completar esta activación: no repetirla ni usarla para nuevas operaciones.

Pendiente abrir/actualizar Gestión de equipo y personal y revisar visualmente el
desplegable Web con la sesión real, además de Android físico. No se afirma haber
visto las tarjetas con datos nuevos en el navegador. La lectura backend real sí
quedó verificada; las pruebas con dobles anteriores no acreditan por sí solas E2E.
