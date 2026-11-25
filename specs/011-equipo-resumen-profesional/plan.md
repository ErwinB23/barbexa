# Plan — 011
## Technical Context
Expo58/TypeScript y Supabase existentes, sin nuevas dependencias. Reutilizar
staff_invitations/membresías, barbershop-operation,008 y datos004/005.
## Constitution Check
Núcleo independiente, puertos/adaptadores, autorización contextual SQL y Web/Android
obligatorios. Resend para producto, SMTP Mailpit solo LOCAL mediante adaptadores.
## US1
Ampliación SQL revisable del rol de staff_invitations y metadata privada de expiración/
entrega/idempotencia. No alterar filas/reglas de barberos. Encauzar aceptación antigua
para impedir asignar barber a invitaciones administrator. Crear/aceptar/cancelar
atómicamente; emisor vigente y destinatario confirmado. Correo posterior al commit,
claim único y resultado sent/failed/unknown; incertidumbre no autoriza reenvío automático.
Comandos cerrados y UI de equipo; capacidad contextual activa en Cloud. En Cloud,
las invitaciones administrativas se notifican dentro de BARBEXA mediante el adaptador
habilitado; Mailpit acredita solo los ensayos LOCAL. Resend externo no acreditado.
## US2
RPC propia diaria, fecha Lima y profesional derivado de008. Contar estados existentes
sin inventar care histórico ni métricas financieras. Panel compartido en Personal.
## Verificación y riesgos
RED→GREEN de scope, protocolos SMTP/Resend con dobles, adaptadores/UI y ACL SQL estático.
No SQL/HTTP mutador ni correo real sin permiso. Activación requiere migración nueva y
conexión/configuración local de Edge; no ejecutar en este bloque. Validación física final.

## Propuesta de Etapa 2 — jerarquía administrativa (19/11/2026)

**Actualización Etapa2B:** usuario aprobó opción A/permisos fijos y preparación de fuente,
contratos, migración y pruebas. Implementación preparada en repositorio, sin aplicar SQL,
datos, despliegues ni flags. El [contrato vigente preparado](contracts/team-authority.md)
y HA-001–HA-010 de spec.md sustituyen los pendientes de matriz/retirada/cupos descritos
abajo. Aceptación final de transferencia y mapa real de legado continúan pendientes.
Las secciones siguientes conservan la propuesta y razonamiento anteriores como antecedente;
no deben interpretarse como facultades configurables autorizadas ni como backend activado.

Etapa2C.2: SQL preparado corregido para consultas puras y replay histórico sin concesión.
Mutaciones conservan bloqueo común y revalidación de pending tras esperas. Sin cambios de
firmas públicas/TypeScript ni activación. Auditoría ampliada READ ONLY de los3 SQL ausentes
del historial:13 contratos/cuerpos,3 tablas privadas con22 restricciones/8 índices, trigger,
ACL/RLS/políticas y dependencias verificados; historial aún13 y37 reservas. Ver evidencia
JSON/guion y procedimiento en contracts/team-authority.md. Solo se consultó --help de
repair; no se ejecutó reparación. Mapa explícito de8 propietarios y ensayoDDL siguen
pendientes. Flags apagados no evitan guardas SQL tras COMMIT: no activar sin transición
aprobada ni insertar datos de propietarios en la migración versionada.

Estado original de propuesta: preparación documental, NO autorización de SQL/Edge/datos.
Base: auditoría de roles ya realizada y decisión conceptual aprobada por el usuario.
La Etapa1 Web de cliente está aprobada; no rediseñar sus interfaces.006T006 y recorridos
profesional/administrador permanecen abiertos. No trasladar usuarios ni datos entre entornos.

### Decisiones aprobadas y pendientes

Aprobado: creador nuevo será propietario/principal; un propietario vigente por barbería;
solo él nombra/retira secundarios, autoriza sus permisos e inicia transferencia; máximo2
secundarios activos excluyendo propietario. Ni barberos ni secundarios pueden autoelevarse
o designar administradores. Cliente conserva capacidades personales y creación de negocio.
Estos hechos todavía NO existen como invariantes ni facultades nuevas en el backend.

Pendiente: matriz ordinaria de secundarios, permisos fijos o subconjunto configurable,
destino de la membresía al retirar administración, elegibilidad y efecto de transferencia,
plazo/confirmación reforzada, cupos de invitaciones pendientes y resolución del legado.
Las recomendaciones siguientes no se consideran decisiones aprobadas.

### Modelo recomendado (nombres propuestos, no objetos existentes)

Conservar `barbershop_memberships.role` barber/administrator para evitar añadir un tercer
rol a todos los contratos. Registrar propiedad explícita en una relación privada por
barbería, por ejemplo `private.barbershop_ownership`: PK barbershop_id, owner_user_id,
versión, fecha y procedencia verificable. FK compuesta propietario/barbería a la membresía
existente. El principal es el propietario con membresía administrator activa; un secundario
es otro administrator activo de ESA barbería. Nadie obtiene facultades por un texto de UI.

Separar creador histórico de propietario vigente. Registrar created_by al crear nuevos
negocios; en legado dejar creador desconocido cuando no exista evidencia, sin inventarlo
al adjudicar propietario actual. No inferir propiedad por UUID, orden o único administrador.

Integridad transaccional: propiedad única por PK, propietario obligatoriamente administrador
activo al commit, y prohibición de borrarlo/desactivarlo/degradarlo sin transferencia.
Una FK no comprueba rol/estado ni el conteo: requieren validaciones/constraint triggers
coordinados. Para toda barbería habilitada en la nueva jerarquía debe existir una propiedad;
una ausencia en legado significa pendiente de resolución, no un propietario implícito.

Proponer registro append-only `private.team_authority_events` con barbería, actor verificado,
acción, destinatario, antes/después de rol/estado/permisos/propietario, motivo, fecha servidor,
request_id y versión; sin correos, JWT, contraseñas o secretos. Escritura solo desde las
operaciones autorizadas, lectura limitada por capacidad. Invitaciones existentes no bastan
como historial de degradaciones, revocaciones o transferencias.

Si se aprueban permisos configurables: persistir concesiones con claves cerradas por
membresía y versión, nunca un JSON arbitrario aceptado como autoridad ni permisos en JWT.
Para reducir alcance se recomienda inicialmente un conjunto fijo explícito; el soporte de
modificaciones individuales debe aprobarse antes de fijar el esquema/contrato definitivo.

### Matriz recomendada de facultades (pendiente de aprobación)

| Operación | Principal | Secundario | Profesional |
| --- | --- | --- | --- |
| Perfil, reservas e invitaciones personales | Propios | Propios | Propios |
| Agenda del establecimiento | Sí | Sí | Solo asignaciones propias |
| Servicios/precios e información operativa | Sí | Sí | No |
| Horarios del local/profesionales | Sí | Sí, conservando validaciones de conflictos | Propios mediante009 |
| Cancelar/reprogramar como personal | Sí, reglas vigentes | Sí, mismas reglas | Solo asignado, reglas vigentes |
| Registrar efectivo/Yape confirmado | Sí | Sí | Solo asignado activo |
| Registrar reembolso manual | Sí, reglas005 | No inicialmente | No |
| Publicación/retiro de barbería | Sí | No inicialmente | No |
| Listar equipo y emitir invitaciones de trabajadores | Sí | No inicialmente | No |
| Crear/activar/desactivar perfiles profesionales ajenos | Sí | No inicialmente | No |
| Designar/retirar secundarios y modificar sus permisos | Exclusivo | No | No |
| Iniciar transferencia de propiedad | Exclusivo | No | No |
| Atender/completar/no-show | Solo si es profesional asignado activo | Igual | Solo asignado activo |

Máxima autoridad del principal no elimina límites de identidad, tenant, atención, pagos,
historial o consistencia de reservas. Ningún rol administra perfiles personales ajenos.

### Creación atómica y legado

Ampliar en una migración NUEVA `create_own_barbershop`: barbería + membresía administrativa
inicial + propiedad + evento se confirman/revierten juntos. Actor derivado de Auth; no aceptar
propietario o rol elegidos en el formulario. Conservar nombre y respuesta básica actuales;
obtener capacidades por lectura propia versionada, evitando romper clientes existentes.

Antes de activar en cada entorno, inventario de solo lectura autorizado por separado:
barberías, membresías administrativas y anomalías de conteo. Revisión humana por ID local
a ese entorno: propietario propuesto, evidencia, administradores que permanecen secundarios
y resolución explícita de excedentes. Solo después, asignación mediante operación limitada,
auditable y autorizada. No adjudicar ni degradar/desactivar a nadie automáticamente.

Barberías sin resolver: conservar datos y capacidades de cliente/lecturas permitidas;
bloquear operaciones nuevas de propiedad, promociones y aceptaciones administrativas.
El mantenimiento temporal de operaciones administrativas ordinarias anteriores requiere
aprobación explícita de la transición; no aplicar silenciosamente una nueva matriz ni
considerar validado el límite en negocios todavía no resueltos. No habilitar jerarquía
definitiva hasta resolver propietario y excedentes de cada negocio incluido en el bloque.

### Cupos, promoción, retirada y revocación

Todas las vías que escriban propiedad/administración deben bloquear primero la misma fila
de barbería, con orden de locks documentado y compatible con004/005/009/010/011; después
revalidar identidad, propietario activo, versión y destinatario. Contar administradores
activos diferentes del propietario; el estado resultante no puede superar2. No utilizar
un CHECK con conteo ni validación solo cliente. Complementar RPC con integridad en DB y
mantener cerradas las escrituras directas de sesiones ordinarias.

Con un cupo y dos aceptaciones simultáneas: una confirma; la otra revalida bajo el mismo
lock y devuelve conflicto sin membresía/evento parcial. Mismo request_id y contenido
reproduce resultado autorizado; otro contenido con la misma clave se rechaza. La respuesta
idempotente también exige identidad/autorización vigente para no filtrar información.

Recomendación: invitaciones pendientes no reservan cupo; comprobar disponibilidad al
emitir y siempre al aceptar. Caducidad7 días existente se conserva. Promover un barbero
requiere invitación del principal y aceptación; conserva identidad/perfil profesional,
cambia la membresía existente y no duplica filas. Solo el principal puede reactivar
administración o modificar concesiones; no basta con ser administrator.

Retirar administración debe ser una operación distinta de revocar toda membresía.
Recomendación pendiente: volver a barber activo solo si existe perfil profesional activo
y se elige explícitamente conservar trabajo; en otro caso, membresía inactiva. No resolver
automáticamente el destino ni modificar reservas. Una revocación total con citas futuras
debe bloquearse o seguir un procedimiento separado aprobado, sin cancelar/reasignar citas
silenciosamente. Motivo, versión y auditoría obligatorios. El propietario no puede retirarse
como administrador ni perder su membresía mediante estos comandos.

### Invitaciones actuales y rutas de escalada

Revisar emisión/cancelación/reintento/aceptación administrativa y la envoltura compartida
`respond_booking_invitation`; ninguna ruta antigua debe conservar promoción ilimitada.
Al aceptar, comprobar que el emisor SIGUE siendo principal, la propiedad/versión vigentes,
destinatario exacto confirmado, vigencia, estado y cupos. Pendientes previas no equivalen a
una designación del nuevo principal: revisar/cancelar o renovar bajo autorización explícita,
sin aceptación automática. Cambio de propietario invalida facultades del emisor anterior.
Correo sigue siendo notificación posterior al commit; fallo de envío no concede permisos.
No cambiar SMTP ni añadir avisos externos para esta jerarquía sin aprobación separada.

Inventariar también creación inicial, concesiones directas, reactivación, actualización de
roles, trigger de aceptación y RPC privadas invocadas por service_role. Revisar `booking_admin`,
`is_active_admin` y cada guardia de pagos/horarios/reprogramación: un cambio global en un helper
no expresa permisos distintos por operación. Mantener compatibilidad de invitaciones barber
con sus reglas, incorporando únicamente las restricciones de facultad que se aprueben.

### Transferencia segura propuesta (reglas pendientes)

Flujo dentro de la app: solicitud del principal, destinatario autenticado distinto,
aceptación expresa, vencimiento, cancelación y request_id. Proponer tabla privada de
transferencias pendientes con versión de propiedad al emitir y un pendiente por barbería.
Recomendar inicialmente destinatario secundario activo y cuenta confirmada; ampliar a
otros destinatarios sería una decisión adicional. Exigir verificación reciente de identidad
en servidor para operaciones sensibles; definir mecanismo compatible con contraseña/Google
antes de prometer reautenticación fuerte, sin confiar en una marca temporal del cliente.

La aceptación bloquea barbería, comprueba principal original aún vigente, destinatario,
cuentas/membresías activas, plazo y versión. Cambia propietario y estado acordado del anterior
en una transacción, con auditoría y validación del conteo final. Si el anterior permanece
secundario, cuenta para el máximo2; no retirar otro administrador para hacer sitio. Ante
conflicto/fallo no cambia la propiedad. Una aceptación duplicada no crea otra transferencia.
No implementar recuperación de propiedad por soporte, fallecimiento o cuenta bloqueada sin
reglas/autorización nuevas; nunca elegir automáticamente otro administrador.

### RLS, API y presentación

Núcleos de aplicación independientes del SDK; nuevos puertos/casos en tenant-foundation
y barbershop-operation, adaptadores PostgreSQL y composición de Edge existentes. No API
Node adicional. RPC mutadoras solo service_role, auxiliares cerradas, search_path seguro,
identidad verificada por Edge y autorización contextual nuevamente en SQL. RLS en nuevas
tablas privadas, sin UPDATE directo desde clientes; FK e índices por barbería.

Conservar lectura propia de membresías e invitaciones y descubrimiento004. Revisar RLS
de listado de equipo según matriz aprobada, sin ampliar acceso a perfiles personales.
Exponer una lectura de capacidades propias para barbería seleccionada, con versión de
autoridad; principal/secondary solo se presentan cuando el servidor pueda acreditarlos.
Revocar permisos bloquea la siguiente operación en servidor aunque la UI esté desactualizada;
revalidación cliente actualiza accesos, invalida caché y descarta respuestas anteriores.
No convertir todas las cuentas ni mezclar rol deA conB. Conservar namespace Cloud/LOCAL,
Auth/PKCE/logout y navegación aprobada; solo futuros controles autorizados se adaptarían.

### Archivos y etapas de implementación futuras

1. Aprobar matriz, retirada, transferencia, pendientes y mapa de legado. Después ampliar
   spec/contratos/tasks de011 y referencias002/003/006/008–010; si requiere feature separada,
   crearla con Spec Kit tras aprobación, sin inventar numeración en esta propuesta.
2. Preparar núcleo/puertos y pruebas con dobles. Afecta `src/features/tenant-foundation/`,
   `src/features/barbershop-operation/`, `_shared/tenant-foundation/`,
   `_shared/barbershop-operation/`, composiciones y pruebas correspondientes.
3. Preparar SQL NUEVO y contratos revisables, sin editar las16 migraciones aplicadas.
   Revisar funciones de creación002, equipo004/011, permisos005/009/010 y sus RLS/ACL;
   no se conoce aún la cantidad definitiva de objetos hasta fijar las decisiones.
4. Con autorización separada LOCAL: inventario, activación por etapas y asignaciones
   explícitas; fixtures nuevos solo con autorización detallada. Preservar37 reservas y
   conjuntos vigentes. Verificar estructura/permisos antes de cada escritura autorizada.
5. Adaptar lectura de capacidades y controles Web sin rediseño. Afecta composición,
   `workspace-access.ts`, `user-menu.web.tsx`, `web-profile-access.web.tsx`, rutas Web y
   paneles de equipo. Android fuera de este trabajo; su aceptación futura debe planificarse
   antes del cierre funcional conjunto, sin generar APK implícitamente.
6. Solo tras aceptación LOCAL y permiso Cloud independiente: reauditar Cloud nuevo,
   mapear SU legado sin copiar IDs/usuarios/datos LOCAL, aplicar esquema compatible,
   desplegar Edge autorizado y habilitar cliente únicamente tras verificar compatibilidad.

### Pruebas y criterios de aceptación propuestos

- Nueva creación: exactamente una propiedad y membresía inicial, auditadas; fallo en
  cualquier inserción revierte todo. Mismo nombre no demuestra que sean el mismo negocio.
- 0/1/2 secundarios; tercero rechazado. Carreras por último cupo, reactivación/aceptación
  simultáneas y transferencia/promoción concurrentes no exceden el límite ni producen dos
  propietarios. Probar locks reales en conexiones distintas, no solo promesas JS.
- Secundario/barbero/cliente no nombran, retiran, transfieren ni modifican concesiones de
  administración; ni payload ni URL ni JWT obsoleto cambian identidad o facultades.
- PrincipalA no operaB; combinaciones adminA/barberB, membresías inactivas y roles revocados
  se rechazan en RPC/REST/Edge. Invocación de firma antigua no permite escaladas.
- Promoción conserva perfil/servicios propios; retirada usa destino aprobado y no altera
  citas/pagos. Reembolso, atención asignada, reprogramación, historial e idempotencia previos
  mantienen reglas. Auditar sin secretos y sin filas parciales al fallar.
- Invitación previa/caducada/emisor que perdió propiedad/duplicada y carreras aceptar-cancelar:
  nunca conceden un privilegio no autorizado. Aceptaciones y retiros tienen auditoría completa.
- Transferencia: aceptación válida, destinatario ajeno, rechazo, cancelación, expiración,
  replay y fallo antes del commit; propiedad original intacta en todos los fallos.
- Legado sin evidencia no recibe propietario; mapa humano de cada entorno acreditado antes
  de habilitarlo. Casos con excedentes requieren resolución explícita, nunca limpieza automática.
- Web refleja capacidad vigente y preserva experiencia cliente, edición006 y cambio de
  contexto seguro. Dobles/SQL/HTTP y pruebas manuales se documentan separadamente.

### Despliegue, recuperación y riesgos

Esquema primero de forma aditiva; Edge compatible después; cliente al final. Antes de tocar
cada entorno: historial/hashes, baseline de datos/permisos, respaldo autorizado y revisión de
dependencias/locks. Evitar ventana donde una RPC antigua siga otorgando administración sin
principal/cupo; bloquear temporalmente esas mutaciones o actualizar envolturas en el mismo
bloque transaccional, con autorización explícita para la indisponibilidad acotada.

Si falla migración/verificación: parar, determinar por historial si hubo commit y no repetir
operaciones inciertas. PostgreSQL revierte la transacción fallida; no `reset`, borrado ni
reversión destructiva. Tras datos nuevos, conservar esquema/auditoría y deshabilitar el flujo
afectado; corrección hacia adelante autorizada. No volver a desplegar un escritor antiguo
que eluda propietario/cupo. Un cliente previo puede mantenerse solo si es compatible y falla
cerrado ante capacidades desconocidas. Restauración de backup no es un rollback rutinario:
requiere autorización y evaluación de escrituras posteriores.

Riesgos principales: atribución indebida de propiedad histórica, facultades heredadas de
administrator demasiado amplias, locks con orden incompatible con reservas, cupos al pasar
el propietario anterior a secundario y clientes con capacidades obsoletas. Las decisiones
pendientes bloquean diseño definitivo de contratos/migración y activación, no la preparación
documental. Esta propuesta no cambia001–011 ni declara cerrada su aceptación pendiente.

Actualización20/11/2026, Etapa2C.9: tras ensayos2C.3/4/8, la migración20261120010538 y el
mapa de8 propietarios se activaron SOLO en SQL LOCAL mediante un único COMMIT, con backup
privado y comprobaciones posteriores. Historial17,8 eventos y1 settings añadido; datos
previos intactos. No repetir el despliegue. Edge/composición Web/HTTP/manual siguen sin
activar y requieren permiso propio; Cloud y transferencia definitiva permanecen separados.
Evidencia y recuperación en contracts/team-authority.md y team-authority-2c9-result.json.
