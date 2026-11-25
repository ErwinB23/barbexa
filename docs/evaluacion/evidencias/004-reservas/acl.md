# T007 — esquema, ACL y límites verificados

14/11/2026. Exclusivamente app-barberia-002-local, PostgreSQL17.11/54422, API54421.
[Catálogo e historial reales](catalogo-final.json). Seis versiones: las cinco originales
más20261114195018; ningún archivo de migración histórico alterado.

| Objetos nuevos | Lectura authenticated | Mutación directa |
| --- | --- | --- |
| settings, services, barber_profiles, barber_services, barbershop_hours, barber_schedules, schedule_exceptions | Solo miembros activos de la barbería | Sin INSERT/UPDATE/DELETE |
| staff_invitations | Destinatario propio o administrador activo del tenant; sin columna inviter_user_id en el grant | Sin INSERT/UPDATE/DELETE |

Las ocho tablas tienen RLS habilitada, propietario postgres, sin permisos ordinarios de
anon/PUBLIC ni acceso directo service_role. Las mutaciones de negocio futuras pasarán
por RPC autorizadas, no por grants amplios. Se reutilizan helpers privados002 intactos;
no se abrieron profiles ni membresías globales ni se modificaron JWT/RLS existentes.

`private.check_booking_hours()` es SECURITY DEFINER como trigger de integridad,
search_path vacío, objetos calificados, PUBLIC/anon/authenticated/service_role sin EXECUTE.
Serializa por barbería los cambios de horario que comprueba; verifica contención en la
unión de intervalos del local. No es una operación RPC accesible ni concede autorización.
Los triggers son diferibles para poder editar conjuntamente intervalos dentro de una
transacción futura. No se ha acreditado aún su interacción con reservas concurrentes.

btree_gist instalada en extensions. Dos exclusiones GiST impiden horarios repetidos
por local/día y profesional/día. FKs compuestas impiden capacidades/profesionales de otro
tenant; índices cubren esas relaciones. Una persona puede tener perfil en varias
barberías; ser administrador no crea automáticamente un perfil profesional.

**No confundir** las exclusiones de horarios actuales con la futura exclusión global de
reservas `(barber_user_id, occupied)` de T014–T016: aún no existen reservations/items/events,
confirmación atómica, precios históricos, rollback de citas ni carrera de reservas probada.
Su diseño se conserva en el modelo/contratos: mismo profesional físico A/B, error uniforme
sin datos ajenos y canceladas sin bloquear. Tampoco hay aún RPC de publicación/invitación;
publicar exige completar políticas ahora y oferta vigente en T009.

## Resultados reales

- [schema-green.log](schema-green.log):63 comprobaciones de estructura/ACL más45 de
  constraints/acceso SQL =108/108. Nuevos datos solo dentro de BEGIN/ROLLBACK.
- [regresiones-sql.json](regresiones-sql.json):336/336 de002, incluidas políticas/grants
  originales, perfiles, tenants y aprovisionamiento. No se repitieron recorridos003.
- Matriz nueva: admin A no lee B en las ocho tablas; inactivo no lee A; destinatario ve
  su invitación pero no obtiene acceso al catálogo interno; compartido conserva barbero-A/
  administrador-B; perfiles ajenos siguen privados. Escrituras privilegiadas directas,
  promoción de invitación, FK mixta, duplicado pendiente y horas inválidas rechazadas.
- Se admite nueva invitación tras rechazo en almacenamiento; su aceptación y concurrencia
  por un usuario real pertenecen a T008–T011, no se declaran implementadas.

Estas pruebas usan PostgreSQL real con roles y claims SQL controlados; **no** son pruebas
HTTP con JWT validados ni E2E Web/Android de negocio. El runner rechaza otro destino,
credenciales administrativas como usuario y archivos SQL fuera de sus modos previstos.
Su prueba de barrera no acredita todavía simultaneidad de reservas en dos conexiones.

Cotejo final: dos usuarios/perfiles anteriores intactos, cero filas nuevas persistentes,
huella de datos002 coincidente. Sin cuentas Auth API, contraseñas, correo o DELETE de
datos anteriores. Doce contenedores antiguos conservan IDs/redes/volúmenes; se observó
cambio de ejecución/reinicio en vector antiguo, sin ejecutar operaciones sobre él.
