# Data model — 004 MVP de reservas

Diseño propuesto, **no SQL aplicado**. Reusar002: auth.users, profiles, barbershops y
barbershop_memberships. No otra tabla de contraseñas, clientes globales o roles globales.
Todo instante es timestamptz; presentación America/Lima, importes PEN.

## Entidades nuevas mínimas

| Tabla propuesta | Campos/relaciones principales | Invariantes y propósito |
| --- | --- | --- |
| `barbershop_booking_settings` | barbershop_id PK/FK; publication_state; public_contact/address; minimum_notice_min, booking_horizon_days, max_future_per_client, slot_step_min, buffer_min, cancellation_advance_min; version | draft/published/paused/withdrawn; cancelación default120 aprobado; otros valores requeridos al publicar, no defaults comerciales inventados. contacto/dirección no vacíos. Perfil privado002 no se abre al catálogo. |
| `services` | id UUID; barbershop_id; name/description; price_amount numeric(12,2); duration_min int; active bool | Precio>=0, duración>0; UNIQUE(id,barbershop_id), nombre no vacío. Desactivar, no eliminar referencias históricas. |
| `barber_profiles` | id UUID; barbershop_id/user_id; professional_name; active | FK(user_id,barbershop_id)→membresía002; UNIQUE(user_id,barbershop_id), UNIQUE(id,barbershop_id) y UNIQUE(id,barbershop_id,user_id) para las dos FKs consumidoras. Actividad y membresía barber/administrator active se verifican juntas, no por FK sola. |
| `barber_services` | barbershop_id,barber_id,service_id; active | PK triple y FK compuestas→profesional/servicio del mismo tenant; profesional realiza todos los servicios solicitados. |
| `barbershop_hours` | id,barbershop_id,weekday,opens_min,closes_min | weekday0..6;0<=opens<closes<=1440; varios intervalos permiten almuerzo. Horas locales, no intervalos que crucen medianoche en una fila. |
| `barber_schedules` | id,barbershop_id,barber_id,weekday,opens_min,closes_min | FK profesional/tenant; intervalos no solapados, contenidos en la unión de horario general. |
| `schedule_exceptions` | id,barbershop_id,barber_id nullable,starts_at,ends_at,reason | null profesional=cierre del local; otro=bloqueo del profesional. Rango finito no vacío; FK tenant consistente. Escrituras protegidas y no invalidan citas comprometidas. |
| `staff_invitations` | id,barbershop_id,recipient_user_id,inviter_user_id,role,status,created_at,responded_at | Rol fijo barber en este MVP; no invita administradores. pending/accepted/rejected/cancelled; UNIQUE parcial tenant/destinatario para pending. Cuenta y perfil existentes; nadie adquiere rol antes de aceptar. |
| `reservations` | id,barbershop_id,client_user_id,barber_id,barber_user_id,starts_at,ends_at,occupied_until,occupied,state; request_id,request_fingerprint; shop/barber/client_display_name snapshots,total_amount,duration_min,policy_snapshot; created_at,cancelled_at | confirmed/cancelled en este MVP, sin fingir estados de atención/pago. FK profesional/tenant/persona y cliente→profiles; UNIQUE(id,barbershop_id) para hijos. UNIQUE(actor,tenant,request_id); snapshot/version y total servidor. Nombre cliente operativo se toma del perfil en servidor, no abre SELECT sobre perfiles ajenos. |
| `reservation_items` | reservation_id,barbershop_id,service_id; name_snapshot,description_snapshot,price_snapshot,duration_snapshot | PK reserva/servicio; FKs compuestas reserva/tenant y servicio/tenant;1..N items, no servicios repetidos; total/duración coinciden con cabecera. |
| `reservation_events` | id,reservation_id,barbershop_id,actor_user_id,actor_capacity,kind,occurred_at,reason | Evento confirmado/cancelado del servidor; FK reserva/tenant; evento cancelación único por reserva, motivo obligatorio si capacidad staff. No rol de autorización futuro derivado del evento. |

UUID se genera en servidor para entidades; request_id lo genera el cliente con aleatoriedad
segura y no acredita permisos. Mismo request_id+actor+tenant con otra huella produce conflicto.
Una huella incluye fecha normalizada, servicios ordenados y selección de profesional; nunca
precio del cliente. Repetir tras cambiar catálogo retorna la reserva original, no recalcula su historia.

Los nombres/precios/descripciones/duración/cancelación/anticipación/separación y zona/moneda
se conservan al confirmar. `policy_snapshot` tiene forma cerrada/versionada validada en SQL,
no JSON arbitrario proporcionado por cliente. No fields/status/tablas de pagos en004.
Price numeric se traduce a unidades menores seguras en dominio; no usar float como autoridad.

## Constraints e índices

- RLS en las11 tablas desde su creación, dentro de la misma migración/transacción de ACL.
  FKs restrictivas para historia; no eliminación de tenants/profiles/citas como operación de negocio.
- PK/UNIQUE/FK compuestas impiden mezclar tenant, servicio, profesional o detalle. No se
  concede a cliente UPDATE de IDs, tenant, actor, snapshots, total ni estado libre.
- `occupied` = tstzrange(starts_at,occupied_until,'[)'); ends>starts, occupied_until>=ends
  y relación exacta duración/buffer. EXCLUDE GiST `(barber_user_id WITH =, occupied WITH &&)`
  condicionado a state=confirmed. btree_gist verificada al implementar. No unicidad solo por
  perfil local: misma persona en A/B tampoco puede atender dos reservas activas simultáneas.
- Canceladas no bloquean. Se desconoce la cita ajena al responder: usar mensaje uniforme
  «Profesional no disponible en ese horario», sin SQL/detail de constraint.
- Exclusión de intervalos repetidos de horario por shop/día y por profesional/día. Índices
  por FKs y consultas: reservas(client_user_id,starts_at), (barbershop_id,starts_at),
  (barber_id,starts_at), membresías002 existentes; invitations(recipient_user_id,status),
  eventos(reservation_id,occurred_at). No duplicar índices ya cubiertos por PK/UNIQUE.
- No constraints CHECK que consulten tablas para precios/permisos: RPC/triggers estrechos
  bajo protocolo de locks comprueban invariantes intertabla; exclusión protege concurrencia final.

## Transacciones y estados

**Invitación**: emitir solo por admin activo; destino existente resuelto por correo exacto
en operación servidor, sin buscador público de usuarios. Aceptar verifica destinatario,
pending e invitante aún autorizado, bloquea invitación/membresía y crea o reactiva la
relación con el rol ofrecido. Si hay membresía activa de otro rol, CONFLICT; no degradar
administrador ni promover silenciosamente. Rechazar/cancelar vuelve terminal esa invitación;
nueva usa otro ID, y un índice parcial protege aceptación/emisión concurrente duplicadas.

**Confirmación**: verificar actor/perfil; bloquear configuración y personas en orden estable;
resolver idempotencia; comprobar publicación, límites del cliente, capacidad/horarios,
excepciones, membresía/profesional activos y catálogo vigente. Asignar un profesional
concreto, calcular snapshots/total/rango, insertar cabecera/items/evento; commit o rollback.
Para «cualquiera», candidatos capaces ordenados y locks ordenados; ninguno no es éxito.

**Carreras A/B**: los locks de identidad física y exclusión son globales como recurso de
agenda, nunca como rol/permisos. Lectura interna privilegiada de ocupación devuelve solo
disponibilidad; cliente jamás consulta filas ajenas para armar su agenda. Cambios operativos
toman lock exclusivo de configuración, comprobando citas comprometidas antes de mutar.
No llamadas HTTP, correos ni transacciones largas mientras se sostienen locks.

**Cancelación**: cliente actor=propietario y reloj_servidor<=starts-cancel_advance_snapshot.
Asignado activo o admin activo del tenant puede cancelar con motivo obligatorio. Pasar
confirmed→cancelled y evento único en transacción. Repetida por actor permitido devuelve
estado sin sobrescribir autor/motivo inicial; cancelación/alta concurrente no produce doble
ocupación. No reembolsos, penalizaciones, reprogramación o reasignación automática.

## ACL y RLS

| Superficie | Acceso ordinario | Autoridad definitiva |
| --- | --- | --- |
| Configuración/catálogo profesional interno | Lectura de miembros activos que la necesiten; mutación sin DML libre | Admin activo por operación. Barbero no se vuelve administrador por atender. |
| Catálogo visible/slots | RPC authenticated, proyección comercial acotada | auth.uid no null y shop published/paused; paused sin slots reservables. Sin perfiles globales/emails/membresías. |
| Invitaciones | Destinatario propio; lista de admin activo del tenant | Solo destinatario acepta/rechaza; admin emite/cancela. RLS bloquea lectura/escritura cruzada. |
| Reservas/items/eventos | Cliente propio, profesional asignado activo o admin activo del tenant | RLS correlaciona cabecera/tenant, actor y membresía vigente; no joins amplios a profiles. |
| Confirmar/cancelar/gestionar | Ningún INSERT/UPDATE/DELETE directo de negocio para usuarios | Edge validado→RPC service_only→SQL de autorización/transacción. |

RLS y ACL son complementarias: PUBLIC/anon sin EXECUTE heredado; authenticated solo lecturas
necesarias, nunca mutaciones privilegiadas. Funciones comerciales de lectura pueden ser
definer estrechas para proyección sin abrir tablas privadas002; private no expuesto,
search_path vacío, identificadores calificados y comprobaciones explícitas. Wrappers de
mutación invoker, EXECUTE reservado a servicio; no Bearer privilegiado en cliente.

## Validación pendiente

Este diseño no acredita extensión, owners/search_path/grants efectivos, constraints,
planes EXPLAIN, comportamiento RLS ni ausencia de carreras. Probarlos con PostgreSQL real,
JWT de clientes ordinarios y dos conexiones; no service_role como sustituto de aislamiento.
