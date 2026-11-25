# Contratos iniciales — 004 MVP

Contrato con oferta/invitaciones, SQL y Edge/cliente de confirmación implementados solo en
LOCAL. T019 acreditada en Web/Android por el usuario. Consultas/UI de agenda T020–T022
implementadas localmente; T023 acreditada por el usuario. Cancelación T024–T026 implementada localmente; T027 espera validación física Web/Android.
Tipos propios, errores
externos traducidos en adaptadores. Reutilizar [002](../../002-fundacion-supabase-multitenant/contracts/backend-foundation.md)
y [003](../../003-autenticacion-navegacion/contracts/authentication.md).

## Núcleo y composición

Cliente `Reservas`: `SolicitarReserva` depende de `ReservaRemotaGateway`; infraestructura
`ReservaHttpAdapter`; composición inyecta token actual003, destino y fetch. No SDK ni tokens
en UI/dominio. Servidor: handler→`ConfirmarReserva`→`ReservaAtomicaGateway`→
`PostgresReservaAdapter`→PostgREST RPC. CancelarReserva usa su operación del mismo gateway.
Administración de oferta/personal tiene puertos concretos en barbershop-operation, no una
función genérica ejecutarSQL/persistirTabla. Entradas reciben VerifiedActor desde Auth
VerificationAdapter existente, nunca desde actorId/userId/role del body.

Valores propios: IDs validados, `MoneyPEN{amountMinor,currency:'PEN'}`, instantes ISO UTC,
servicios/capacidades/horarios, BookingSummary/Detail con snapshots y estado confirmed/cancelled.
Detalle no expone barber_user_id ni datos privados de otros clientes/tenants. La reserva
confirmada no significa atención realizada ni pago cobrado.

## Operaciones y superficies

Todas requieren usuario Auth verificado no anónimo. El MVP no abre exploración anónima.
CORS exacto por entorno y JWT activo; OPTIONS no concede autoridad de negocio. HTTPS fuera
del Development local autorizado. Métodos/acciones y campos se validan de forma cerrada.

| Operación cliente | Transporte previsto | Entrada propia / resultado |
| --- | --- | --- |
| Crear/renombrar barbería | create-barbershop/REST existente002 | Solo nombre / barbería y primera membresía; no copiar lógica. |
| Listar barberías visibles | POST /rest/v1/rpc/list_booking_barbershops | cursor/filtro de nombre acotados / proyección comercial publicada o pausada. |
| Obtener catálogo | POST /rest/v1/rpc/get_booking_catalog | barbershopId / contacto/dirección/nombre, políticas públicas, servicios, profesionales y capacidades visibles. |
| Consultar slots | POST /rest/v1/rpc/list_booking_slots | barbershopId, fecha local,1..N serviceIds distintos, barberId nullable / instantes absolutos disponibles y duración/estimación servidor. |
| Configurar oferta/personal | POST /functions/v1/barbershop-operation | Unión cerrada de acciones abajo / recurso propio actualizado o invitación procesada. |
| Confirmar reserva | POST /functions/v1/reservation-command | action=confirm,requestId,barbershopId,serviceIds[],barberId|null,startsAt / 201 BookingDetail; reintento idempotente200 del mismo resultado. |
| Consultar propias | GET /rest/v1/reservations e items/eventos con proyección explícita | filtro propio; RLS aplica alcance. Lista vacía no prueba permiso para operar. |
| Consultar agenda | POST /rest/v1/rpc/list_booking_agenda | p_barbershop_id, p_local_date (Lima), p_barber_id nullable y p_state nullable confirmed/cancelled; administrador activo del tenant o profesional activo asignado, autorizados nuevamente en SQL. Máximo 200 citas ordenadas del día; sin emails ni IDs privados de identidad. |
| Cancelar reserva | POST /functions/v1/reservation-command | action=cancel,requestId,reservationId,reason opcional cliente/obligatorio staff / BookingDetail cancelado; evento único. |
| Invitaciones propias/admin | RPC list_own_staff_invitations / list_shop_staff_invitations | sin identidad alternativa / solo propias o tenant administrado. |

`barbershop-operation` admite acciones tipadas: configure-shop, set-publication,
upsert-service, set-professional, set-capabilities, set-shop-hours, set-barber-hours,
set-exception, invite-existing-user, accept-invitation, reject-invitation, cancel-invitation.
Cada acción llama un caso de uso y una RPC definida; no spread de body a SQL. Operaciones
de admin llevan barbershopId como recurso que se autoriza, nunca como credencial.
Destinatario de invitación se busca por correo exacto únicamente en servidor, sin listado
global ni respuesta con perfil/email ajeno. El destinatario acepta con invitationId, no
elige userId/role de la membresía: la oferta tiene rol barber fijo en este MVP. Conflicto si existe membresía activa de otro rol; no modifica administradores.

Campos rechazados en confirmación: clientId/actorId,role,status,price,total,duration,
snapshots,policySnapshot y profesional físico interno. Los datos de resultado se calculan
en SQL. Body técnico<=8KiB como patrón existente; listas y paginación acotadas contra abuso,
sin inventar límites comerciales de nombre/teléfono.

## Frontera RPC

| RPC pública prevista | Ejecutor | Implementación/autorización |
| --- | --- | --- |
| list_booking_barbershops/get_booking_catalog/list_booking_slots | authenticated | Wrapper invoker a proyección privada definer estrecha, auth.uid() actual, oferta visible; sin filas privadas ajenas. |
| list_own_staff_invitations/list_shop_staff_invitations | authenticated | RLS/actor propio o admin actual; solo datos mínimos de invitación. |
| configure_booking_shop/upsert_booking_service/set_booking_professional/set_booking_capabilities/set_booking_hours/set_booking_exception | service_role | Wrapper invoker→private operación específica, p_actor_id originado en Auth y permiso admin actual, locks/citas protegidas. |
| invite_booking_staff/respond_booking_invitation/cancel_booking_invitation | service_role | Actor validado; admin emite/cancela, destinatario responde; transición/índice pendiente/consumo atómicos. |
| confirm_booking | service_role | Actor/perfil, publicación, políticas/capacidad/precios/agenda actuales, asignación, idempotencia, exclusión, snapshots y rollback. |
| cancel_booking | service_role | Propiedad y límite snapshot o staff autorizado con motivo; evento/estado/ocupación atómicos. |

Wrappers de mutación `SECURITY INVOKER`, EXECUTE solo service_role; implementaciones
private con search_path='', objetos calificados, permisos mínimos y sin exposición del
schema por Data API. Revocar PUBLIC/anon/authenticated en la misma migración. El secreto
existe solo en composición servidor; nunca usarlo para simular una lectura ordinaria.
Configurar/crear nuevas funciones/remoto requiere autorización posterior, no la de este plan.

## Errores y recuperación

### B5.2 — retirada lógica administrativa aprobada (20/11/2026)

Alcance: cierres del establecimiento (schedule_exceptions.barber_id=null). No sustituye
la retirada de bloqueos propios009. Propietario y secundario con autoridad vigente de
horarios011/editHours; cliente y profesional sin esa facultad, denegados por el servidor.

Comandos POST /functions/v1/barbershop-operation, con Bearer verificado por Edge:

- list-shop-closures {barbershopId,cursor:null|UUID}: lectura de hasta100 cierres,
  orden por ID, con activos e históricos, nextCursor para continuar. No provisiona
  settings ni modifica versión/auditoría. Excluye bloqueos personales y otros tenants.
- withdraw-shop-closure {barbershopId,closureId,requestId,reason}: UUID válidos;
  motivo obligatorio con trim ECMAScript, no vacío, máximo2000 unidades UTF-16 antes
  de trim en cliente/Edge. SQL rechaza espacios/tab/NBSP y más de2000 caracteres SQL;
  no confundir la unidad Unicode de SQL con UTF-16. La frontera Edge conserva la cota
  pública más estricta. No acepta actor, rol o capacidades aportados por el formulario.

Primera retirada: HTTP200 {closure,replayed:false}. Conserva la fila original, fechas,
barbería y motivo; añade únicamente withdrawal_event_id. El estado deriva de esa
referencia: active o withdrawn. La proyección withdrawal contiene eventId,actorUserId,
occurredAt,reason. Inserta exactamente un evento append-only existente en
private.team_authority_events, action=shop-closure-withdrawn, con tenant/cierre/actor,
instante/motivo/requestId/huella, before_state/after_state y referencia a la transición.
No crea tablas paralelas ni reutiliza eventos de atención/pagos. Incrementa una vez
la versión de settings. Prohíbe borrar cierres administrativos y alterar los retirados.

Cierre ya retirado: HTTP200 {closure,replayed:true}, aun con otro requestId o actor
actualmente autorizado; conserva la primera auditoría y no escribe ni incrementa versión.
Colisión del requestId con otra operación vigente:409. Serializa por el bloqueo del
establecimiento ya usado por reservas/autoridad y después la fila; revalida permisos y
estado tras el bloqueo. Dos conexiones concurrentes deben obtener una sola transición
con el mismo evento, no dos auditorías. No hay prohibición temporal añadida para cierres
pasados. Perfil personal y autoridad actual continúan siendo precondiciones contractuales.

401 sin identidad verificada;403 sin autoridad operativa en el contexto solicitado;
404 para cierre ausente, personal o ajeno a ese contexto autorizado, sin distinguir
su existencia. No consultar primero un cierre de otro tenant para revelar su existencia.
400 entrada/motivo inválido;409 perfil requerido/conflicto;503 dependencia indisponible.
Mismo envelope seguro del proyecto; sin SQL, tokens ni datos de otro tenant.

RPC fijas list_admin_booking_closures y withdraw_admin_booking_closure, wrappers
SECURITY INVOKER, EXECUTE solo service_role. Núcleo privado SECURITY DEFINER con
search_path vacío; actor procede de Auth verificado en composición, nunca del payload.
No simular identidad real con service_role en futuras pruebas de aceptación Chrome.

Disponibilidad, confirmación atómica, preservación de reservas, agenda propia y
reprogramación ignoran solamente excepciones con withdrawal_event_id no nulo.
Se conservan horarios generales/profesionales, otros cierres activos, bloques personales,
reservas y reglas temporales. La retirada no cambia reservas, pagos ni atención.
El adaptador invalida caché comercial antes y después de mutar; slots se reconsultan
sin caché de autorización. UI Web: /schedules, listado paginado e historial, motivo y
confirmación explícitos, carga/éxito/error, doble envío bloqueado y respuestas tardías
por contexto descartadas. Resultado incierto exige lectura antes de otra mutación;
no reintenta escrituras automáticamente. Componentes existentes, sin rediseño/Android.

Migración20261121040559_administrative_closure_withdrawal.sql ensayada primero en
base desechable y activada después, con autorización específica, en LOCAL principal
mediante CLI oficial: historial18, bytes aprobados intactos, sin cambios de negocio.
Cloud NO la recibió. Edge LOCAL real acreditó listado autorizado200, sin sesión401 y
contexto ajeno403; sin invocar retirada, sin dobles ni recargas. La retirada positiva
Web y el ensayo22 requieren autorización separada; NO se ejecutaron. Evidencia de
activación: E004/b523-activacion-reintento.json y .md. SQL/idempotencia/concurrencia
previos en E004/b52-retirada-cierres.json y .md no sustituyen aceptación Chrome.

### Comportamiento existente

Errores propios: INVALID_INPUT400, UNAUTHENTICATED401, FORBIDDEN403, NOT_AVAILABLE404
(sin distinguir existencia ajena), PROFILE_REQUIRED409, CONFLICT409, DEPENDENCY_UNAVAILABLE503.
En conflicto de ocupación: **«Profesional no disponible en ese horario»**, siempre igual,
sin IDs, nombres, horarios o detalles de otra reserva/tenant ni textoSQL de23P01.
Edge usa envelope seguro {error:{code,message},requestId}; no tokens/headers/SQL/stack.

Timeout de confirmación deja estado desconocido, no éxito/alta automática. Conservar el
requestId y reconciliar/reintentar el mismo contenido; otra huella con misma clave es CONFLICT.
Consulta disponibilidad puede quedar obsoleta y conduce a reconsultar, no a reservar por caché.
Cancelación repetida autorizada retorna estado sin cambiar actor/motivo/evento original.

## Contrato temporal y de cancelación

Slots devueltos en UTC, presentados America/Lima. Términos y precio se muestran antes de
confirmar; servidor los vuelve a leer. Política válida previa a publicar; cancelación
default120min, almacenada en snapshot. Cliente puede cuando now<=startsAt-advanceSnapshot;
staff asignado/admin activo requiere reason.trim no vacío. Sin penalización ni pago/reembolso.

## Pruebas mínimas

Puertos/validación con dobles; HTTP con JWT real de local; ACL/RLS reales y EXECUTE denegado
a usuario ordinario; carrera de confirmaciones mismo tenant y A/B de la misma persona,
mensaje de conflicto indistinguible; idempotencia/rollback, cambios de horario/membresía,
cancelación en límite/fuera/motivo/repetición y cancelación→nueva reserva concurrentes.
Pantallas reales Web y Android con aislamiento de contexto; no credenciales en evidencias.
