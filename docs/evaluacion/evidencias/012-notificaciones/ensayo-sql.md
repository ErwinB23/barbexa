# 012 — Ensayo SQL independiente

Fecha: 22/11/2026, America/Lima. Autorización: ensayo desechable, sin Cloud ni
LOCAL principal. Resultado: aprobado en el alcance SQL descrito.

Imagen local public.ecr.aws/supabase/postgres:17.11.0.018, PostgreSQL17.11.
Contenedor barbexa-notifications-1795372239579, red none, sin puertos ni volúmenes
de otras bases, sistema raíz de solo lectura y datos en tmpfs. Recreadas las18
migraciones originales con hashes conservados, sin descargar datos ni conectarse
a ningún proyecto Supabase. Auth es un contrato SQL mínimo, no un servicio GoTrue.

SQL ensayado: specs/012-notificaciones-web/contracts/notifications.sql.
SHA256: adfe5bede6f48554ebef1b52cbe7666379f1343295fa95db375b9dfb2572a30b.
Compilación y COMMIT aprobados. Cuatro triggers, dos RPC y tabla privada con RLS.

Pruebas reales PostgreSQL con cuatro cuentas ficticias:

- Reserva confirmada/cancelada/reprogramada; inicio/final de atención,
  inasistencia, recepción de pago y reembolso: tres destinatarios por evento.
- Invitación recibida y aceptada; repetir UPDATE del mismo estado no duplica.
- Total26avisos antes de concurrencia; cliente8avisos, destinatario externo1.
- Authenticated solo consulta su bandeja; anon no ejecuta la RPC; authenticated
  no consulta tabla privada. Marcar dos veces un aviso disminuye el contador una vez.
- Marcar un UUID ajeno/inexistente denegado; revocar membresía elimina visibilidad
  de avisos operativos de ese profesional. Conservación de avisos personales.
- Transacción revertida no deja notificaciones.
- Ocho procesos/sesiones psql simultáneos emiten el mismo source_key: exactamente
  tres registros, sin duplicados; todos los procesos terminaron con exit0.

Los eventos de auditoría se insertaron como fixtures SQL sintéticos, sin ejecutar
el ciclo completo de negocio. No afirmar que una combinación de eventos sintéticos
representa transiciones permitidas en una atención real. Pendiente regresión
integral de RPC de negocio y aislamiento con otra barbería antes de activar Cloud.
No prueba de HTTP/PostgREST, navegador ni JWT auténtico en este ensayo.

Primer intento: falló el fixture de invitación porque now() era anterior al
created_at basado en statement_timestamp(). Se corrigió solo responded_at del
fixture; el SQL de notificaciones permaneció intacto. Segundo ensayo independiente
aprobó. Ambos contenedores desechables fueron eliminados tras verificar sus
identificadores y etiqueta notifications-rehearsal. Informes/logs conservados:
.artifacts/barbexa-notifications-1795372197737 (fallo) y
.artifacts/barbexa-notifications-1795372239579 (aprobado).

Verificador reproducible: node scripts/notifications-rehearsal.mjs.
Requiere autorización para crear/eliminar su contenedor desechable. No usa URLs,
credenciales ni datos de Cloud o LOCAL. No activa una migración en esos entornos.

## Ampliación integral SQL RPC

Ensayo barbexa-notifications-1795372575711 aprobado, informe en
.artifacts/barbexa-notifications-1795372575711/report.json y business-rpc.log.
Misma imagen, aislamiento,18migraciones originales y SQL de notificaciones sin
cambios. Contenedor propio eliminado después de aprobar; datos sintéticos no
copiados a LOCAL ni Cloud.

Se ejecutaron los RPC públicos de negocio, en vez de insertar auditorías manuales:

- Crear dos barberías con propietarios distintos; configurar oferta, invitar al
  profesional, aceptar y comprobar membresía, perfil, servicio, capacidad,
  horarios de local/profesional y publicación. No aviso para configuración.
- Invitación genera un aviso al destinatario, aceptación uno al emisor.
- Confirmación de reserva en efectivo:3avisos (cliente, profesional y propietario).
  Replay reconoce respuesta previa sin crear nuevos avisos.
- Confirmación Yape sin configuración falla después de invocar el motor de
  reservas; subtransacción revierte reserva y avisos. Permanece una única reserva.
- Reprogramación, recepción de efectivo ficticio, cancelación y reembolso ficticio:
  cada RPC más su replay. Tres avisos por evento; total15avisos por esa reserva.
  Estado persistido de pago refunded; no dinero real ni correos.
- Bandeja del propietario devuelve6avisos propios (aceptación+5eventos), otro
  propietario0; intento de marcar un UUID real de aviso del segundo tenant denegado.

Límite: RPC SQL ejecutados como postgres en la base aislada para reproducir los
puertos de los adaptadores. Las validaciones internas de actor sí se ejecutan,
pero no demuestra autenticación GoTrue, Edge o navegador. Consultas de bandeja
se probaron con SET ROLE authenticated y claims SQL sintéticos. Inicio/final de
atención e inasistencia tienen cobertura de trigger sintético previa; no se
esperó el reloj para repetir estos comandos temporales en un flujo real.
No declarar «todo funcionando en Cloud» a partir de este resultado.
