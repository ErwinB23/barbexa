# Agenda local — T020–T022 y preparación T023

14/11/2026, fecha local Lima.00421/34: T019 cerrada con evidencia manual del usuario;
T020/T021/T022 verificadas técnicamente. T013 y T023 siguen abiertas por recorridos UI.
No se ejecutó T024+. [Recorrido único de agenda](t020-t023/recorrido-manual.md).

## Cambio y seguridad

Migración nueva20261115030159_booking_agenda.sql, creada por CLI oficial y aplicada por
psql únicamente al contenedor PostgreSQL verificado app-barberia-002-local:54422. No dbpush,
reset ni reparación del historial CLI. La aplicación directa se registra en
[migration.json](t020-t023/migration.json); no se alteró el historial CLI durante este bloque.
Dos funciones nuevas, sin modificar tablas, políticas, grants históricos, datos ni Auth.
Reversión separadamente autorizable: quitar primero el wrapper público y luego la función
privada, sin CASCADE. No se ejecutó reversión ni se modificaron migraciones históricas.

public.list_booking_agenda es SECURITY INVOKER, wrapper de private.booking_agenda SECURITY
DEFINER. Ambas search_path vacío, referencias calificadas; EXECUTE revocado PUBLIC/anon/
service_role y concedido authenticated. La función privilegiada revalida auth.uid(),
cuenta confirmada/no anónima/no bloqueada, membresía activa y rol actual del tenant.
Administrador solo tenant solicitado; barbero solo su perfil activo asignado, sin poder
elegir otro profesional. No usa claims de rol del cliente ni abre profiles002.
El definer requiere esas condiciones explícitas porque su propietario puede omitir RLS;
no se presenta RLS sola como control suficiente de esa función.

Proyección por snapshots: cliente/profesional/nombre/servicios/fecha/total/política y códigos
de cita, sin email, IDs Auth ni detalles ajenos. Filtros Lima por día, profesional y estado,
200 filas máximas ordenadas; mensaje de límite y filtros, no paginación ilimitada prometida.
Reutiliza el parser, verificación Auth y transporte existente; no SDK nuevo ni Edge nueva.

Caso de uso/puerto agenda independiente de frameworks; aplicación descarta respuestas
tardías al cambiar cuenta, generación, tenant o rol. Al verificar/logout se borran filas.
Composición explícita reutiliza BookingContext, con la guarda de hidratación anterior.
Ruta /agenda y botón Consultar agenda en Mi cuenta con contexto seleccionado. Sin contexto,
estado válido y selección explícita. UI compartida accesible, carga/vacío/error/reintento,
fecha Lima, filtros y detalle. No implementa cancelación ni funciones de negocio adicionales.

## Pruebas ejecutadas

- RED inicial de aplicación2 y SQL4; GREEN después. Primer intento del arnés SQL no produjo
  TAP (salida3); se adaptó el arnés para no requerir instalar pgTAP. Luego4 RED previstos
  y4 GREEN, sin modificar la expectativa de existencia/ACL de las funciones.
- [SQL GREEN](t020-t023/sql-check.log):4/4 estructurales/ACL,0.
- [HTTP](t020-t023/http.json):12 comprobaciones nuevas con JWT reales de las3 cuentas
  existentes: admin propio/ajeno, cliente rechazado de agenda pero conserva sus citas,
  RLS ajena vacía, filtro profesional/estado, vacío autorizado, anon, campos/estado falsos,
  proyección y cantidad de reservas preservada.1 test node aprobado,0.
- [Roles](t020-t023/roles.json):9 comprobaciones adicionales. Con mismo JWT, adminA
  no administra B cuando su rol B es barbero, solo asignadas; A temporalmente barbero
  conserva sus asignadas, otro profesional se rechaza, inactiva se rechaza inmediatamente.
  Valores originales exactos de la membresía A cotejados tras restaurar. Solo1 membresía
  y1 perfil temporales B retirados tras verificar dependencias; residuos0. Ninguna cuenta,
  reserva, servicio u horario creado/cambiado/eliminado. Datos protegidos y baseline iguales.
  No se atribuye esa ejecución al usuario ni a pruebas físicas de UI.
-44 tests dirigidos,0: aplicación/UI de agenda, hidratación y navegación privadas, UI reserva
  y composición Auth afectadas. UI usa dobles Web/Android; no sustituye las pruebas físicas.
- Tipos0, ESLint afectado0, formato0, arquitectura0:107 módulos/30 núcleo/284 aristas.
- [Metro](t020-t023/bundles.json): grafos Web/Android HTTP200; sin nuevo APK ni validación
  automática de la interfaz del teléfono. No se repitieron baterías históricas ni reservas.

El resultado HTTP inicial conserva sus limitaciones originales: la comprobación posterior
roles.json cubre los casos que allí figuraban pendientes, sin borrar el primer registro.
El operador reproducible tests/integration/booking/agenda-roles.mjs exige flag explícito
BARBERIA_004_AGENDA_ROLES=authorized-temporary-local y los guards de destino local;
no ejecutarlo por costumbre. Snapshot original solo en .artifacts ignorado, sin credenciales.

## Pendientes

T023: demo UI real de las citas ya existentes Android→admin Web e inversa, agenda profesional,
actualización, accesibilidad/contexto; no nuevas reservas. T013: publicación/invitación/
admin-profesional/tenant ajeno y vacíos/error reales en ambas plataformas, aún no confirmados.
No confundir la reserva exitosa y la corrección F5 confirmadas por el usuario con ese recorrido.
Nueve avisos npm moderados sin remediación/aceptación; no auditoría de seguridad aprobada.
URL pública Auth.33 pendiente por decisión del usuario, sin afectar este uso de cuentas
confirmadas.003 sigue24/36, recuperación de contraseña antes de evaluación.
Sin Cloud/proyecto antiguo, servicios reiniciados, log activo modificado, paquetes/APK,
commit o push. Conjunto T019 conservado para la demostración.
