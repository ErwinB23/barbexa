# Análisis de referencia del backend anterior

Registro: 11/11/2026, America/Lima. Alcance: lectura de fuentes y recomendaciones
para preparar la futura funcionalidad 002; no implementación ni especificación nueva.

## Fuentes, versiones y límites de la inspección

- Proyecto actual: `App-Barberia`, `main`, HEAD
  `c110559dd6179c6896e0745898c9ece1fcbb9a8c`; estado Git inicial limpio.
- Repositorio anterior consultado mediante GitHub en modo lectura, fijado al
  commit [c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3][oldcommit]. Se obtuvo su árbol
  completo de rutas (respuesta no truncada), sin descargar un checkout ni datos.
- Propuesta aprobada: copia local limpia, commit
  `1eb8852388480388f39035641eb87d299def9258`. Se consultaron
  [enfoque Clean Architecture][proposal-clean], [componentes][proposal-components]
  y requisitos funcionales RF11–RF42 pertinentes a reservas, membresías e imágenes.
- Reglas actuales: [AGENTS.md](../../AGENTS.md),
  [Constitución v1.0.1](../../.specify/memory/constitution.md) y
  [contratos/límites de la fundación](../../specs/001-fundacion-expo-clean/contracts/foundation.md).
  La demostración educativa `tecnologia/` no se trató como integración real.
- Inventario completo de **9 migraciones y 9 archivos SQL de pruebas**. Lectura
  focal de la migración inicial por tablas, restricciones, ACL/RLS, helpers,
  creación/reprogramación/cancelación/pagos y triggers; lectura de los cambios
  posteriores y estructura/aserciones de las pruebas. No es una auditoría
  exhaustiva línea a línea de todas las operaciones posibles.
- También se leyeron config.toml, la única Edge Function, su módulo de correo,
  import map y archivo de pruebas, y los archivos cliente citados más abajo.
  No se leyó ni copió un archivo de credenciales. No se conectó Supabase,
  ejecutó SQL, envió correo ni ejecutaron pruebas del repositorio anterior.

**Todo resultado es estático.** No se conoce si esas migraciones corresponden al
estado desplegado, si existen cambios manuales en producción o cuáles son sus
owners, grants, extensiones, jobs y políticas efectivos en una instancia real.

## Inventario de migraciones y pruebas

Las migraciones son acumulativas: no basta reutilizar la inicial. En especial,
invitaciones se redefinen posteriormente y las políticas/índices de notificaciones
cambian. Los enlaces se fijan al commit inspeccionado.

| Migración original | Contenido observado |
| --- | --- |
| [20260808014945_initial_schema_v1.sql][base] | Esquema inicial monolítico: enums, 19 tablas public, FK/checks/índices, RLS/grants, helpers, RPC operativas y reservas/pagos |
| [20260811025916_barber_profile_permissions.sql][m2] | UPDATE de campos públicos del barbero; get_own_barber_profile |
| [20260813012445_add_reschedule_availability_rpc.sql][m3] | get_reschedule_available_slots usa duración/buffer históricos y autoriza cliente/admin |
| [20260813024921_reservation_operational_access.sql][m4] | Contacto mínimo del cliente para personal autorizado e instrucciones Yape de una reserva propia |
| [20260813174953_add_invitation_notifications.sql][m5] | Registro privado de entregas, helper y trigger de notificación; redefine envío de invitación |
| [20260813175007_add_reservation_reminders.sql][m6] | pg_cron, índice parcial, registro privado y procesador de recordatorios |
| [20260815144908_allow_active_barber_admin_promotion.sql][m7] | Redefine envío/aceptación para promoción barbero→admin conservando perfil y relaciones |
| [20260815153712_add_reservation_description_snapshots.sql][m8] | Nombres históricos, backfill, checks y dos triggers de snapshots |
| [20260817174331_add_notification_dismissal.sql][m9] | dismissed_at, RPC estrecha, política SELECT e índices parciales revisados |

Las pruebas usan pgTAP, transacciones con rollback y contextos de roles/claims de
prueba. Declaran **158 aserciones planificadas** en total: no son 158 resultados
aprobados. No se trasladaron sus fixtures de Auth al proyecto nuevo.

| Prueba SQL revisada | Plan | Qué comprueba su código |
| --- | ---: | --- |
| [initial_schema_v1.test.sql][t1] | 31 | Aislamiento A/B, cliente/personal, escritura directa, exclusión de solapamientos, límites y pagos/cancelación/reprogramación |
| [barber_profile_permissions.test.sql][t2] | 20 | UPDATE por columnas, identidad/tenant/estado protegidos y perfil propio por RPC |
| [reschedule_availability.test.sql][t3] | 9 | Duración histórica, catálogo inactivo, exclusión de la propia reserva y autorización |
| [reservation_operational_access.test.sql][t4] | 10 | Contacto para asignado/admin, aislamiento e instrucciones Yape privadas |
| [invitation_notifications.test.sql][t5] | 14 | Destinatarios, no duplicación y falta de INSERT directo en notifications |
| [reservation_reminders.test.sql][t6] | 16 | ACL privada, job cada 5 minutos, ventana próxima, idempotencia y reprogramación |
| [barber_admin_promotion.test.sql][t7] | 18 | Promoción conserva relaciones, no degradación, destinatario y vencimiento |
| [reservation_description_snapshots.test.sql][t8] | 26 | Nombres conservados, cambio de barbero y rechazo de snapshots enviados por cliente |
| [notification_dismissal.test.sql][t9] | 14 | Descarte propio sin borrado físico, referencias preservadas y privilegios limitados |

No se encontraron escenarios de sesiones paralelas con dblink, pgbench o un
runner de concurrencia en estos nueve archivos. Una inserción secuencial que
debe violar la exclusión no sustituye un ensayo concurrente completo.

## Tablas, relaciones y aislamiento

La migración inicial declara 19 tablas public; dos migraciones agregan otras
dos en private. No se encontró tabla de reseñas ni estructura geoespacial en
las nueve migraciones.

| Tablas / responsabilidad | Relación y protección observadas |
| --- | --- |
| profiles | PK/FK id→auth.users, borrado en cascada; identidad global, sin rol global ni barbershop_id |
| barbershops | Tenant raíz, UUID; created_by→profiles, estados unpublished/published/paused; el creador no sustituye la membresía como autorización |
| barbershop_memberships | FK tenant y usuario; UNIQUE(barbershop_id,user_id); role barber/administrator y status active/inactive |
| barbers | FK compuesta (barbershop_id,user_id)→membresía; UNIQUE por tenant/usuario e id/tenant; is_active independiente del estado de membresía |
| barbershop_invitations | Tenant, invitador, destinatario/aceptante; estado/expiración/canal; UNIQUE parcial de invitaciones pendientes por tenant, correo normalizado y rol |
| services / styles | Servicio pertenece al tenant; estilo al servicio. Precio numeric(10,2), duración y nombres con checks; unicidad de nombre normalizado por padre |
| barber_services | FK compuestas (barber_id,barbershop_id) y (service_id,barbershop_id); impide asignar servicio de otro establecimiento |
| barbershop_hours / barber_schedules | Horas semanales; schedule con FK barbero/tenant. Checks día/intervalo y exclusiones GiST de intervalos incompatibles |
| barber_blocks / barbershop_closures | Intervalos timestamptz, creador→profiles, FK tenant/barbero; triggers protegen reservas activas |
| barbershop_settings | PK tenant; anticipación, horizonte, slots, separación y cancelación; valores acotados por checks |
| barbershop_payment_settings | PK tenant; datos Yape separados de la ficha pública (la inicial agrega y luego retira esas columnas de barbershops) |
| reservations | Cliente→profiles; FK compuesta barbero/tenant, y anterior barbero/tenant; tiempos, duración, total, buffer y estado; UNIQUE(id,barbershop_id) |
| reservation_services | FK reserva/tenant y servicio/tenant; estilo/servicio compuesto; precio/duración/nombres históricos; UNIQUE(reservation_id,service_id) |
| payments | FK reserva/tenant, UNIQUE por reserva y por id/tenant; método cash/yape, estado inicial pending, confirmador/reembolsador y checks de coherencia |
| favorite_barbershops | Usuario y tenant; UNIQUE por pareja y un único favorito primario por usuario mediante índice parcial |
| notifications | Destinatario→profiles; tenant nullable, FK compuestas a reserva/pago/invitación; checks exigen tenant cuando hay esas referencias; estado de lectura y dismissed_at |
| private.invitation_notification_deliveries | PK(user_id,invitation_id,type), FK a perfil/invitación; deduplicación interna |
| private.reservation_reminder_deliveries | PK(reservation_id,reservation_starts_at), FK a reserva; deduplicación por cita y horario |

`barbershop_id` se usa de forma directa o derivada: styles lo hereda del servicio,
profiles no es un tenant y las tablas privadas heredan el contexto de la referencia.
La FK compuesta protege coherencia entre recursos; **no sustituye autorización**.
Cliente es una capacidad del usuario autenticado y propietario de la reserva,
no un valor de membership_role. No se encontró administrador global. Una única
membresía tiene un rol; un administrador puede conservar perfil de barbero tras
promoción, lo que evita necesitar dos memberships para la misma pareja.

### RLS y privilegios

La inicial habilita RLS en las 19 tablas public, con 40 declaraciones de política;
m2 agrega la de edición de barbero y m9 reemplaza SELECT de notifications.
Se combinan permisos de columnas/operación y predicados propios:

- Profiles: SELECT/UPDATE propios con auth.uid(), UPDATE restringido a campos
  de presentación/contacto. Contacto operativo ajeno solo por RPC estrecha.
- Catálogo: lectura a authenticated de locales published/paused; miembros ven
  su tenant no publicado. No confundir visible para clientes con datos privados
  del negocio ni con catálogo accesible sin sesión: anon no recibe esa lectura.
- Membresías: usuario ve la propia; admin activo ve las de su tenant. No se otorga
  escritura directa de membresías al cliente. Barbers oculta user_id por grants.
- Reservas/servicios/pagos: lectura propia, barbero asignado activo o admin activo
  de la barbería. Escrituras operativas se concentran en RPC, no UPDATE libre.
- Favoritos/notificaciones: propietario. Descarte por RPC, sin DELETE físico libre.
- Servicios/estilos/horarios/bloqueos: DML limitado por columnas, RLS de admin o
  barbero propio según recurso; UPDATE incluye USING y WITH CHECK.
- Helpers private.is_barbershop_admin/member/is_own_barber consultan membresías
  vigentes y auth.uid(); is_invitation_recipient usa auth.users.email, no un rol
  editable en user_metadata. El trigger Auth usa metadata para nombre/avatar,
  no para otorgar permisos.
- Esquema private fuera de los schemas de API declarados; tablas de entregas con
  REVOKE a public/anon/authenticated. No se les declara RLS en estas migraciones:
  su barrera prevista es esquema/ACL y las funciones autorizadas.

Esto evidencia intención de aislamiento contextual, no una certificación de RLS
desplegada. Verificar todos los caminos de escritura y sesiones reales sigue pendiente.

### Índices, triggers y funciones

La inicial contiene 37 CREATE INDEX explícitos (además de índices de PK/UNIQUE y
exclusiones); recordatorios añade uno y descarte reemplaza dos. Destacan lookup
de membresía (user,status,tenant), horarios, agenda por cliente/barbero/tenant,
pagos por tenant/estado y notificaciones por usuario con predicados parciales.
Su utilidad y coste requieren EXPLAIN y volumen representativo; no se midió rendimiento.

En la cadena se declaran 24 triggers: updated_at en 15 tablas, alta de perfil al
insertar Auth, validación de horarios/schedules/bloqueos/cierres, protección de
servicios con reservas futuras, notificación de cambios de invitación y dos
triggers de snapshots. Los de bloqueo/cierre toman locks de barberos antes de
comprobar intervalos; no son simples validaciones del cliente.

Se identifican 69 nombres de funciones public/private tras considerar redefiniciones:
31 public (incluyen set_updated_at/handle_new_user de trigger, no RPC de negocio)
y 38 private. Inventario de operaciones públicas pertinentes:

- Establecimiento: create_barbershop, update_barbershop, update_barbershop_settings,
  update_yape_settings, publish_barbershop, pause_barbershop, unpublish_barbershop.
- Equipo: send/accept/reject/cancel_barbershop_invitation,
  enable_own_barber_profile, deactivate_barber, get_own_barber_profile.
- Reservas: get_available_slots, get_reschedule_available_slots,
  create_reservation, reschedule_reservation, cancel_reservation,
  start_reservation, complete_reservation, mark_no_show.
- Pagos/datos operativos: change_payment_method, confirm_cash_payment,
  confirm_yape_payment, refund_payment, get_reservation_client_contact,
  get_reservation_yape_settings. Notificaciones: dismiss_notification.

Wrappers públicos delegan en private.*_impl. Se observa SECURITY DEFINER,
search_path vacío, nombres calificados, auth.uid() y comprobaciones de recurso;
REVOKE/GRANT de EXECUTE, con revocación final de todas las funciones private a
public/anon/authenticated y reapertura solo de cuatro helpers necesarios para RLS.
Los agregados posteriores repiten revocaciones explícitas. Las funciones nuevas
no deben asumir que estas revocaciones cubren automáticamente futuros objetos.
Los triggers de snapshots no declaran SECURITY DEFINER y operan en el contexto
del llamador; validar su ejecución bajo el contexto real de las RPC.

## Reserva atómica: candidato fuerte con adaptaciones obligatorias

[Inicial, create_reservation_impl y exclusión][base] muestra:

1. Identidad desde auth.uid(), no client_id del body; valida JSON limitado a
   service_id/style_id, tamaño/cantidad y duplicados.
2. Lock del perfil para el límite de dos reservas futuras; lock del barbero,
   membresía activa y asignación de servicios en la misma barbería.
3. Precios/duración se leen de BD; disponibilidad considera estado published,
   horarios, cierres/bloqueos, anticipación, horizonte, reservas activas y buffer,
   usando America/Lima para el calendario.
4. Una función escribe reserva, servicios históricos, pago pending y avisos.
   La exclusión reservations_no_active_overlap usa GiST sobre barber_id y
   tstzrange(starts_at,occupied_until,'[)'), para confirmed/in_progress. La base
   protege el intervalo y buffer, no solo el resultado previo de disponibilidad.
5. Reprogramación bloquea ambos barberos en orden estable; pagos bloquean reserva
   y pago y rechazan confirmar si dejó de estar pending. Cierres/bloqueos también
   coordinan con locks de barberos. Es material útil para diseñar la nueva transacción.

No se ejecutaron rollback ni solicitudes simultáneas. Deben probarse en la nueva
base real, incluyendo cambios concurrentes de horarios, membresías, catálogo y
políticas. La exclusión es un mecanismo apropiado para no solapamiento, no una
demostración de que todos los otros invariantes sobreviven a cualquier carrera.

**Desajustes comprobados con la propuesta actual:**

- [booking/actions.ts][booking] llama supabase.rpc('create_reservation') desde
  el cliente, importando incluso Json generado. Falta en ese camino la Edge
  Function, ConfirmarReserva, sus puertos y composiciones independientes.
- La RPC exige un barber_id concreto. No implementa asignación atómica para
  «cualquier barbero». La selección del cliente no debe convertirse en autoridad
  de disponibilidad; el servidor nuevo deberá terminar con asignación concreta.
- confirm_yape_payment_impl exige admin, mientras cash permite barbero asignado
  o admin; la nueva Constitución permite **ambos medios** a asignado activo o admin
  autorizado. La prueba inicial espera que el barbero NO confirme Yape: cambiar
  esa expectativa al adaptar, no copiarla como requisito nuevo.
- Hay snapshots de precio/duración/buffer y nombres (m8); la política financiera
  refund_policy_at_late_action se fija en la acción tardía, leyendo settings en
  cancelación/reprogramación, no como conjunto de políticas al confirmar.
  Completar los históricos relevantes de la reserva según reglas aprobadas.
- Límite global de dos futuras, una sola reprogramación y política de reembolso
  están codificados. Revisar sus valores contra requisitos aprobados antes de
  conservarlos; no heredarlos como decisiones de 002 por conveniencia.

## Auth, Edge Function, configuración y cliente

[client.ts][client] crea el SDK con URL/clave publicable de entorno, persistencia
y auto-refresh; AsyncStorage solo nativo y detectSessionInUrl=false. Es candidato
de infraestructura, no núcleo. [auth-service.ts][auth] mezcla Expo Linking/
WebBrowser con SDK; [auth-provider.tsx][authprovider] expone Session/User del SDK.
Requiere adaptadores, tipos propios, casos de uso y composición; no copiar como
API pública del núcleo. [auth-callback.ts][callback] trata code/tokens y deduplica
callbacks; [google-oauth.ts][google] inyecta operaciones de OAuth/navegador:
reutilizar ideas y pruebas con revisión de redirects/PKCE, no credenciales ni estado.
[profile-service.ts][profile] y [booking/queries.ts][queries] mapean filas a tipos,
pero sus accesos SDK deben quedar detrás de contratos en la arquitectura nueva.
[reservations/actions.ts][resactions] también invoca RPC directamente.

Solo existe una función Edge de negocio en el árbol: [send-invitation-email/index.ts][edge].
Usa withSupabase({auth:'user'}), identidad de contexto, request mínimo con
invitation_id, consulta la invitación y verifica membresía active/administrator
en su barbería; no acepta destinatario/rol confiables desde el body. Comprueba
estado/canal/expiración y devuelve errores limitados. Es un ejemplo de frontera
autenticada, pero concentra HTTP, SDK y coordinación sin los casos de uso/puertos
independientes exigidos ahora. La validez del middleware y del contexto debe
probarse en el runtime nuevo; el código no acredita verificación JWT desplegada.

[email.ts][email] contiene funciones puras de validación/escape HTML junto a
fetch/Resend y errores de transporte: separarlas al reutilizar. Usa clave de
idempotencia por invitación; el cliente guarda la invitación por RPC y solicita
correo separadamente ([invitations/actions.ts][inviteactions]). No hay transacción
atómica PostgreSQL/correo: preservar estado, reintento e idempotencia. Se revisó
[email.test.mjs][emailtest] (5 casos declarados), sin ejecutarlo. [deno.json][deno]
fija dependencias; no asumir compatibilidad con el nuevo proyecto sin verificarlas.

[config.toml][config] declara Postgres 17, API schemas public/graphql_public,
Storage habilitado, Deno 2 y verify_jwt=true para la función. Auth email tiene
confirmaciones desactivadas; Google se usa en cliente, pero no hay bloque Google
habilitado en este archivo. Son datos de configuración local, **no evidencia de
configuración de producción ni una vulnerabilidad por sí solos**.
Seed está habilitado apuntando a ./seed.sql, archivo no presente en el árbol:
corregir la configuración de reproducción nueva sin copiar seeds/datos antiguos.

No se observaron migraciones de buckets ni políticas storage.objects, metadatos
de imágenes completos, compensación de operaciones Storage/BD, reseñas ni
índices/consultas por proximidad. Los campos *_url no satisfacen por sí solos
esos requisitos actuales. No se inspeccionó toda la UI de imágenes.

## Clasificación de reutilización

Las categorías se refieren al diseño; ninguna autoriza copiar o ejecutar SQL.

| Parte importante | Clasificación | Decisión para el nuevo proyecto |
| --- | --- | --- |
| Tenant, profiles y membresías activas | Reutilizable conceptualmente | Separar identidad global y autorización contextual; mantener propiedad/establecimiento y capacidad de admin-barbero |
| FK compuestas, UNIQUE/CHECK y exclusiones | Reutilizable conceptualmente | Mantener consistencia entre tenant y recursos; validar las restricciones en PostgreSQL real |
| Helpers RLS y grants mínimos | Reutilizable conceptualmente | Reconstruir explícitamente por operación, owner y rol; ensayar rutas autorizadas y denegadas |
| Monolito de migración inicial y cadena completa | No recomendable reutilizar literalmente | Arrastra todo el negocio y redefine objetos; 002 debe tener migraciones pequeñas, ordenadas y alcance propio |
| RPC de reservas, locks y transacción | Requiere adaptación | Conservar las garantías SQL y añadir servidor Clean Architecture, contexto confiable y asignación «cualquiera» |
| Históricos y reprogramación | Requiere adaptación | Preservar nombres/precio/duración; completar políticas al confirmar y validar cambios de catálogo concurrentes |
| Pagos manuales | Requiere adaptación | Pending inicial y confirmación única útiles; cambiar la exclusividad admin de Yape según Constitución |
| Invitaciones/promoción y ACL de contacto | Reutilizable conceptualmente | Recipiente verificado, mínima exposición y promoción sin destruir relaciones; pruebas con nuevos contratos |
| Notificaciones, descarte y deduplicación | Reutilizable conceptualmente | Útiles para avisos internos; no añadir push ni cron de negocio completo en 002 por anticipado |
| pg_cron/recordatorios | Requiere adaptación | Validar extensión, job/owner y privilegios/idempotencia; configurar por entorno |
| 9 suites pgTAP | Requiere adaptación | Reutilizar escenarios y anti-casos; adaptar nombres/roles y expectativas, agregar concurrencia real |
| SDK/Auth/OAuth/callback | Requiere adaptación | Integración detrás de adaptadores, contratos propios y composición; no filtrar Session/Database a aplicación/dominio |
| RPC directa desde acciones cliente | No recomendable reutilizar como flujo de confirmación | Sustituir por el recorrido Edge aprobado; mantener autorización definitiva en SQL |
| Edge de correo y helpers | Requiere adaptación | Separar HTTP/aplicación/dominio/Resend; conservar validación mínima, escape, permisos e idempotencia |
| config.toml y URLs/identificadores antiguos | No recomendable reutilizar literalmente | Nuevo entorno, redirects/proveedores/grants/seed/extensiones revisados; nunca vincular proyecto antiguo |
| URLs de imágenes como solución completa | No recomendable reutilizar como diseño final | Storage con políticas, metadatos, autorización de referencias y recuperación de fallos pendientes |

## Riesgos y verificaciones que faltan

No se afirma un exploit probado ni una auditoría de seguridad superada.

| Observación en código | Riesgo o límite a validar |
| --- | --- |
| RPC SECURITY DEFINER pública con EXECUTE authenticated y autorización interna | El llamador puede ir directo a RPC; añadir Edge no basta para obligar a pasar por sus casos de uso. Diseñar permisos de ejecución/contexto para que no se eluda el flujo aprobado, sin conceder identidad arbitraria por body. |
| Funciones actuales derivan identidad de auth.uid() | Un adaptador servidor con privilegio de servicio no debe perder al actor ni confiar sin más en un p_user_id. Definir propagación de sesión o entrada privilegiada segura; probar suplantación y revocación de membresía. |
| ACL/search_path y checks están presentes | Defensa positiva, no ausencia automática de fallos. Inspeccionar catálogo efectivo, owners y EXECUTE de objetos futuros; service role no debe aparecer en cliente. |
| Locks, exclusión y validaciones están presentes | Probar dos solicitudes simultáneas, dos reservas del mismo cliente, reprogramación cruzada, bloqueo/cierre concurrente y deadlocks/reintentos. Los tests leídos no dan ese resultado. |
| Total y snapshots se obtienen mediante lecturas separadas del catálogo/settings | Probar coherencia de precio/total/duración/políticas ante cambios concurrentes. Es hipótesis de carrera a ensayar, no corrupción reproducida. |
| Cliente consulta catálogos con barbershop_id | El filtro cliente no acredita aislamiento. Las pruebas nuevas deben intentar sustituir todos los identificadores y escribir relaciones cruzadas, además de leer A/B. |
| Correo fuera de la transacción SQL | Probar reenvíos, fallo de proveedor, cambio de estado entre lecturas/envío y recuperación; idempotencia existente ayuda pero no acredita entrega exactamente una vez. |
| Config local permite email sin confirmación | Definir política nueva y coherencia con invitaciones por correo/Google. No extrapolar a producción sin verificar su configuración real. |
| No buckets/políticas Storage observados | No se puede afirmar aislamiento de archivos ni recuperación Storage/BD a partir de RLS de tablas. |

Criterios técnicos contrastados con fuentes oficiales: [RLS de Supabase][docsrls],
[funciones, privilegios y search_path][docsfn] y [restricciones sobre rangos en
PostgreSQL 17][docsranges]. RLS y ACL deben verificarse juntas; SECURITY DEFINER
requiere autorización explícita, no solo search_path. Las exclusiones protegen
rangos incompatibles y deben acompañarse de ensayos reales de la operación completa.

## Recomendación para preparar 002 (sin crearla todavía)

1. Definir en la futura especificación el alcance de infraestructura: entorno
   nuevo reproducible, esquema base de identidad/tenants/membresías, ACL/RLS y
   estrategia de migraciones/pruebas. No trasladar todo el negocio antiguo.
2. Fijar modelo y matriz de permisos antes de escribir SQL; incluir admin de A
   frente a B, barbero asignado/no asignado/inactivo, cliente propio/ajeno y anon.
3. Diseñar punto de composición cliente y servidor independientes. Para reservas:
   pantalla → SolicitarReserva → ReservaHttpAdapter → Edge verificada →
   ConfirmarReserva → PostgresReservaAdapter → PostgREST RPC → PostgreSQL,
   mediante ReservaRemotaGateway y ReservaAtomicaGateway. SQL es infraestructura
   con pruebas de integración, no dominio independiente del proveedor.
4. Preparar pruebas contra una base local/nueva descartable: aplicar migraciones
   desde cero, inspeccionar restricciones/ACL/RLS y ejecutar pgTAP; ensayar fallo
   intermedio y rollback de reserva/servicios/pago/avisos, y concurrencia multisesión.
5. Definir defaults seguros por entorno para Auth, proveedores, secretos de
   servidor y Storage. Mantener futuras imágenes/reseñas/mapas en el backlog de
   negocio y no declararlos existentes por tener columnas de URL/dirección.

Pendiente decidir en la planificación: alcance exacto de 002, entornos/local CLI
y versiones verificadas, fronteras de operaciones expuestas y contexto de actor,
contratos mínimos y política de membresía/perfil profesional. Los valores de
negocio antiguos requieren contraste, no adopción automática. Las dependencias
del cliente actual conservan además sus 9 vulnerabilidades moderadas pendientes;
esta lectura no las analizó ni aprobó la seguridad del nuevo sistema.

## Verificación y conservación

Comprobaciones nuevas: Git actual limpio al iniciar, rama/HEAD; Git de propuesta
local limpio y versión 1eb8852; consultas de archivos GitHub fijadas a c9206e6;
inventario de migraciones/tests/función y lectura estática descrita. No se
ejecutaron migraciones, pruebas SQL/Edge, instalaciones o conexiones Supabase.
Único archivo creado en el proyecto actual: este documento. Se verificó
`git diff --check` y preservación SHA-256 de los archivos previos al terminar.
No se escribieron repositorios de referencia ni specs/002, commit o push.

[oldcommit]: https://github.com/ErwinB23/barberia-app/commit/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3
[proposal-clean]: https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/02-arquitectura-software/enfoque-arquitectonico.md
[proposal-components]: https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/02-arquitectura-software/componentes-arquitectonicos.md
[base]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260808014945_initial_schema_v1.sql
[m2]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260811025916_barber_profile_permissions.sql
[m3]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260813012445_add_reschedule_availability_rpc.sql
[m4]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260813024921_reservation_operational_access.sql
[m5]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260813174953_add_invitation_notifications.sql
[m6]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260813175007_add_reservation_reminders.sql
[m7]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260815144908_allow_active_barber_admin_promotion.sql
[m8]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260815153712_add_reservation_description_snapshots.sql
[m9]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/migrations/20260817174331_add_notification_dismissal.sql
[t1]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/initial_schema_v1.test.sql
[t2]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/barber_profile_permissions.test.sql
[t3]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/reschedule_availability.test.sql
[t4]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/reservation_operational_access.test.sql
[t5]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/invitation_notifications.test.sql
[t6]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/reservation_reminders.test.sql
[t7]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/barber_admin_promotion.test.sql
[t8]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/reservation_description_snapshots.test.sql
[t9]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/tests/notification_dismissal.test.sql
[client]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/infrastructure/supabase/client.ts
[auth]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/auth/services/auth-service.ts
[authprovider]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/auth/context/auth-provider.tsx
[callback]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/auth/auth-callback.ts
[google]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/auth/google-oauth.ts
[profile]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/profile/services/profile-service.ts
[booking]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/booking/actions.ts
[queries]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/booking/queries.ts
[resactions]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/reservations/actions.ts
[inviteactions]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/src/features/invitations/actions.ts
[edge]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/functions/send-invitation-email/index.ts
[email]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/functions/send-invitation-email/email.ts
[emailtest]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/functions/send-invitation-email/email.test.mjs
[deno]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/functions/send-invitation-email/deno.json
[config]: https://github.com/ErwinB23/barberia-app/blob/c9206e67ac7b2b946cfc90f6e0fc3b2910d60fe3/supabase/config.toml
[docsrls]: https://supabase.com/docs/guides/database/postgres/row-level-security
[docsfn]: https://supabase.com/docs/guides/database/functions
[docsranges]: https://www.postgresql.org/docs/17/rangetypes.html#RANGETYPES-CONSTRAINT
