# Feature Specification: 011 — Equipo y resumen profesional

**Created**:2026-11-15 · **Status**: Equipo, propiedad y administración secundaria activos en Cloud; recorrido funcional manual Web aceptado el 24/11/2026. Evidencias SQL/HTTP/Mailpit LOCAL conservadas; Android y transferencia definitiva pendientes.
Fuente: propuesta RF34/RF35–HU22/HU23 y RF20–HU13; decisiones del usuario15/11.

## User Scenarios & Testing
### US1 — Invitar administradores por correo (P1)
Administrador activo invita a una cuenta existente y confirmada. El destinatario acepta
o rechaza dentro de la app; el correo notifica y nunca concede acceso. Caducidad inclusiva
a los7 días por reloj servidor. Invitación caducada no concede permisos y permite una nueva.
Duplicados y aceptación/cancelación concurrentes no generan membresías inconsistentes.
Las invitaciones de barbero conservan sus reglas/registros. Fallo del correo no revierte
la invitación válida; estado de envío explícito y reintento sin duplicación silenciosa.
Prueba independiente: administradorA invita cuenta confirmada, no accede antes de aceptar;
otro usuario/tenant/caducada se rechazan. Mailpit LOCAL y Resend mediante adaptadores.

### US2 — Resumen operativo propio (P1)
Profesional activo consulta por fecha Lima su actividad en la barbería contextual, incluso
si es administrador que atiende. Contar estados registrados, conservar legado sin inventar
atenciones/pagos; no incluir citas de colegas ni agregar otras barberías de la misma persona.
Prueba independiente: resumen de A no incluye B, citas ajenas o permisos globales.

## Requirements
- FR-001 Identidad verificada, administrador vigente para emitir/cancelar y destinatario
  exacto para aceptar/rechazar; revalidar emisor activo al aceptar.
- FR-002 Cuenta confirmada existente, caducidad7 días, sin acceso por correo/enlace/rol cliente.
- FR-003 Mantener invitaciones/membresías existentes; impedir downgrade por la RPC antigua.
- FR-004 Enviar después del commit, conservar estado de entrega, deduplicar carreras,
  no reintentar automáticamente una entrega SMTP de resultado incierto.
- FR-005 Resumen diario propio: total, programadas, en atención, completadas, canceladas,
  inasistencias y sin estado de atención registrado; próximas del día según reloj servidor.
- FR-006 Web/Android comparten aplicación/puertos, carga/vacío/error/reintento accesibles.
- FR-007 Nada de comisiones, ingresos estimados o métricas financieras nuevas.

## Success Criteria
- SC-001 Pruebas de contrato cerrado, scope, envío/multienvío, errores y UI con dobles.
- SC-002 SQL/HTTP real demuestra roles, caducidad, atomicidad y aislamiento con permiso.
- SC-003 Recorrido integral Web/Android y recepción real Mailpit, bajo autorización.

## Límites
La preparación original no aplicó SQL ni creó datos. La activación posterior B fue
autorizada y ejecutada LOCAL: SQL y lecturas/rechazos HTTP, sin invitaciones ni correos.
Un escenario posterior autorizado acreditó118 comprobaciones y4 correos Mailpit, sin
correo externo ni datos protegidos alterados. Nuevas escrituras/envíos siguen requiriendo
permiso específico. No invitar personas sin cuenta, configurar Resend externo o cambiar
reglas de barbero004. La aceptación manual Web vigente consta al inicio; Android permanece pendiente.

## Propietario y administración secundaria — alcance vigente

La opción A del usuario fija las facultades de secundarios; no hay editor de permisos.
El contrato de autoridad sustituye el administrador indiferenciado de US1/FR-001.
Está activo en Cloud; la aceptación definitiva de transferencia sigue excluida (HA-007).
La invitación administrativa Cloud utiliza la bandeja de BARBEXA: no acredita Resend
ni envío externo. Los ensayos de correo anteriores describen únicamente LOCAL.

- HA-001 Una propiedad explícita por barbería, vinculada a membresía administrator activa.
  Creador nuevo: barbería+membresía+propiedad+auditoría atómicas. Roles actuales conservados.
- HA-002 Máximo2 secundarios activos, propietario excluido. Invitaciones pendientes no
  reservan cupo. Bloqueo común y conteo al aceptar, invariantes diferidas y RPC antiguas cerradas.
- HA-003 Solo principal administra equipo, invitaciones de trabajadores/administradores,
  publicación, retirada administrativa, reembolso005 y solicitudes de transferencia.
- HA-004 Secundario gestiona agenda, servicios/precios, horarios y operaciones existentes
  de reservas/cobros; profesional solo sus asignaciones/008/009. Atender exige perfil
  profesional activo y asignación para todos los roles. Aislamiento por barbería.
- HA-005 Promoción por invitación del principal y aceptación del destinatario confirmado;
  revalidar emisor, propiedad/versión, caducidad y cupo. Conservar membresía/perfil existentes.
- HA-006 Retirada explícita a barber activo con perfil vigente, o salida como membresía
  inactiva; bloquear salida con citas futuras/en atención y transferencias pendientes
  involucradas. No cancelar/reasignar/borrar citas ni modificar pagos. Motivo y replay auditados.
- HA-007 Solicitud de transferencia por principal, destinatario secundario confirmado,
  vigencia, versión, rechazo/cancelación auditables. Aceptación definitiva bloqueada hasta
  aprobar destino del propietario anterior y conteo final. No acredita transferencia funcional completa.
- HA-008 Legado sin inferencia de creador/propietario: mapa individual autorizado,
  snapshot exacto, cuenta confirmada, auditoría y validación de cupos. Creador desconocido
  sigue null. Sin degradaciones automáticas; administración cerrada hasta regularizar.
- HA-009 Capacidades propias verificadas por backend y revisión de contrato. Web activo
  con capacidad contextual; no habilitar con rol de URL, contexto ajeno o respuesta tardía.
- HA-010 Cuatro tablas privadas con RLS, auxiliares cerradas, RPC service_role, identidad
  verificada en Edge y reautorización SQL. Sin secretos ni nuevos permisos globales.

Corrección2C.2 de HA-005: devolver una aceptación histórica no es una promoción nueva.
Con destinatario confirmado y membresía administrativa vigente se permite replay accepted
sin stamp antiguo ni asignar cupos; no reactiva retirados/inactivos ni cambia propietario.
Nueva aceptación pending continúa revalidando stamp/emisor/propiedad/caducidad/cupo bajo
locks y audita su mutación. Consultas de care e invitaciones no realizan DML ni row locks.

Cierre HA: integración PostgreSQL/HTTP autorizada (carreras reales incluidas) y aceptación
Web de roles/contextos. Android y006 mantienen su aceptación propia, no acreditada por
este código. Casos/datos/plan de activación en [contrato](contracts/team-authority.md).

## Navegación y administración vigentes

Mi espacio profesional reúne resumen, agenda propia, horarios y perfil profesional;
Administrar barbería concentra configuración, equipo, catálogo, horarios y pagos/reglas.
Un administrador secundario puede seleccionar otras barberías únicamente si tiene
membresías activas en ellas: la invitación no le concede acceso global ni facultades
del propietario. Los cupos se derivan del contrato HA-002, no de cifras ilustrativas.

La gestión muestra administradores y facultades efectivas; el historial de invitaciones
administrativas se puede plegar. No incorpora un editor arbitrario de permisos ni
habilita la aceptación definitiva de transferencia de propiedad.
