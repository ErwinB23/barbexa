# Etapa 2B — Contrato preparado de autoridad contextual

19/11/2026. Opción A aprobada por el usuario: permisos fijos. **Sin activación** en
LOCAL ni Cloud. Sustituye las recomendaciones pendientes de la propuesta anterior
solo en las materias expresamente aprobadas. No acredita SQL ejecutado ni aceptación física.

## Persistencia e invariantes

Migración nueva `20261120010538_team_authority.sql`, nombre UTC creado mediante CLI
durante19/11 en Lima. No se modifican las16 migraciones históricas.

- `private.barbershop_ownership`: una fila/PK por barbería; propietario FK de membresía
  del mismo establecimiento, versión positiva, origen nuevo/revisado y creador nullable.
  Triggers diferidos requieren propietario administrador activo y máximo2 secundarios.
- `private.team_authority_events`: auditoría append-only, actor, destinatario, motivo,
  requestId, fingerprint, antes/después y respuesta; sin secretos ni contraseñas.
- `private.ownership_transfers`: máximo un pendiente por barbería, destinatario secundario
  activo, versión, caducidad técnica de7 días, rechazo/cancelación. No estado accepted.
- `private.authority_invitation_stamp`: nuevas invitaciones administrativas vinculadas
  al propietario y versión vigentes; ninguna pendiente histórica se acredita automáticamente.
- Las4 tablas tienen RLS, sin acceso directo de anon/authenticated/service_role. Auxiliares
  cerradas con search_path vacío. La RPC pública nueva es exclusiva de service_role.

La creación002 conserva contrato y registra barbería+membresía+propiedad+evento en la
misma transacción. Las filas históricas no reciben propietario por inferencia. La migración
solo cambia definiciones/ACL/RLS, sin DML sobre datos preexistentes. La propiedad nueva
se escribe únicamente al ejecutar posteriormente creación o regularización autorizada.
Alcance de DDL:4 tablas,2 índices explícitos (además de PK/UNIQUE),12 funciones nuevas,12 reemplazos de funciones,
3 triggers nuevos y3 políticas existentes ajustadas. Resto de permisos anteriores conservado.

## Capacidades

| Facultad | Propietario | Secundario | Profesional |
| --- | --- | --- | --- |
| Agenda, reservas, cancelación/reprogramación | Reglas004/010 | Reglas004/010 | Solo autorizado/asignado |
| Servicios/precios, horarios/configuración operativa | Sí | Sí | Solo autogestión008/009 |
| Efectivo/Yape | Sí | Sí | Solo asignado005 |
| Reembolso manual005 | Sí | No | No |
| Publicación | Sí | No | No |
| Equipo/invitaciones de trabajadores | Sí | No | No |
| Administración/retirada/transferencia | Sí | No | No |
| Atender | Solo con perfil activo/asignación | Igual | Perfil activo/asignación |

No editor de permisos. Cliente conserva reservas/perfil/invitaciones propias/creación.
Ser propietario enA y barbero enB no combina facultades. El backend revalida membresía
persistida, no rol de URL ni claims de autoridad. La lectura de capacidades solo informa;
no autoriza por sí misma una escritura posterior.

## API y compatibilidad

Edge existente `barbershop-operation`, no desplegada en esta preparación. Verificación
de JWT/actor original conservada. Extensión nueva apagada salvo variable privada
`BARBERIA_ENABLE_TEAM_AUTHORITY=true` **que no se ha establecido**.

Comandos con claves cerradas, sin actor/rol/permisos aportados por el cliente:

- `read-team-authority`: barbershopId. Respuesta revision `20261120010538`, userId,
  barbershopId, capacity owner/secondary/barber/unregularized, version y nueve permisos.
  secondaryCount solo para propietario; demás null. Sin membresía activa: rechazo.
- `remove-secondary`: barbershopId, requestId, expectedVersion, memberUserId,
  disposition barber/inactive, reason. Principal actual exclusivamente; no se retira a
  sí mismo. barber requiere perfil activo; inactive bloquea citas futuras/en atención
  y transferencia pendiente como destinatario. No elimina perfil ni modifica citas/pagos.
- `initiate-ownership-transfer`: barbershopId, requestId, expectedVersion, recipientUserId.
  Solicitud pendiente con confirmationBlocked=true; no cambia propietario.
- `cancel-ownership-transfer` / `reject-ownership-transfer`: barbershopId, requestId,
  expectedVersion, transferId. Cancelación por principal, rechazo por destinatario exacto.
- `accept-ownership-transfer`: **bloqueada** tanto en aplicación como SQL con CONFLICT.
  Falta aprobar destino del propietario anterior y ajuste de cupos. No prometer
  reautenticación reforzada ni una transferencia completa; caducidad/UX final revisables
  antes de habilitar el flujo definitivo.

Retirada e inicio/cancelación/rechazo tienen auditoría e idempotencia por actor+requestId;
misma clave/otro contenido produce conflicto, con autorización vigente antes del replay.
Invitación administrativa conserva idempotencia011; aceptación audita promoción en la
membresía existente, revalida emisor propietario y cupo bajo lock. Pendientes no reservan
cupo; pueden emitirse estando lleno y fallan al aceptar si sigue lleno. Expiración7 días
existente, autorización del emisor y protección de destinatario conservadas.

Corrección2C.2: esto describe una **nueva aceptación pendiente**. Un replay de una fila
accepted es una lectura histórica: destinatario exacto y confirmado, metadata existente
no marcada expired y membresía administrator activa actual en esa barbería. No exige
stamp antiguo, propietario/emisor actual ni cupo libre; no toca membresías, propiedad,
auditoría ni stamp. La fecha de caducidad ya transcurrida no invalida el hecho aceptado.
Retirado/inactivo: FORBIDDEN; otra cuenta: NOT_AVAILABLE. Cancelada, caducada pendiente
o decisión incompatible: CONFLICT. Rechazo repetido conserva su respuesta histórica.
Para pasar pending→accepted siguen siendo obligatorios stamp, propietario/emisor
vigente, destinatario, caducidad y cupo bajo lock. No convertir este replay en reactivación.
Después de esperar locks se relee el estado para distinguir otra aceptación concurrente.

Consultas2C.2: care read/settings/payment-options, lista administrativa y get no usan
INSERT/UPDATE/DELETE, advisory locks ni SELECT FOR UPDATE/SHARE. Se preservan los filtros
de identidad/tenant/membresía existentes. El auxiliar nuevo authority_assert tiene firma
(uuid,uuid,text,boolean DEFAULT true): solo el lector interno usa false. Los escritores
conservan lock común y validación bloqueante (tres argumentos usan true por defecto).
No cambia ninguna firma pública existente ni el contrato TypeScript. RLS y RPC service_role
permanecen cerradas. La lectura histórica no prueba autorización para una operación futura.

Se reemplazan en la nueva migración los cuerpos existentes de booking_command,
admin_invitation_admin/command, guard_admin_invitation_accept, booking_invitations,
care_command/json, reschedule_capacity/command y reservation_cancel. Se cierran rutas
antiguas de aceptación y de autoridad administrativa. El confirmador sin método de pago
permanece revocado. No se altera el motor atómico de confirmación ni las instantáneas.
El lock común inicial es la fila booking_settings, antes de personas, reservas y membresías;
los triggers diferidos complementan las RPC. Validación real de locks todavía pendiente.
El protocolo exige READ COMMITTED (el nivel esperado de PostgREST); authority_lock rechaza
otro aislamiento con25001/DEPENDENCY_UNAVAILABLE para no contar desde un snapshot antiguo
después de esperar el lock. Comprobar ese nivel en la validación SQL/HTTP antes de activar.

RLS: equipo solo propietario (cada uno sigue leyendo su membresía); invitaciones
propias o propietario. Cambio de nombre del negocio requiere operador contextual con
propiedad regularizada. Descubrimiento y perfiles personales mantienen sus políticas.
El directorio profesional/horarios operativo existente se conserva para agenda y horarios;
no equivale al roster de membresías ni concede acceso al módulo de gestión de equipo.

## Legado y despliegue seguro

`private.regularize_barbershop_ownership(shop,chosen_owner,expected_members,reason)` es
operador-only, sin EXECUTE de service_role ni comando HTTP. Exige mapa individual
autorizado, cuenta confirmada, snapshot exacto de membresías y máximo2 adicionales.
`created_by` queda null: asignar propietario no acredita quién creó históricamente el negocio.
Si excede cupos requiere decisión separada; no se degradan ni desactivan miembros.
`team-authority-inventory.sql` prepara el inventario de lectura; **no se ejecutó**.

Hasta regularizar se conservan filas, lecturas permitidas, cliente y autogestión profesional;
se bloquea administración del establecimiento. Activar la migración implica esa
indisponibilidad para legados no resueltos: requiere aprobar el mapa y la ventana antes
de aplicar. Invitaciones antiguas sin stamp no otorgan administración automáticamente;
resolver cancelación/renovación individualmente, no reescribirlas en masa.

Web: opción explícita `teamAuthorityEnabled` en composición, no propagada desde ningún
perfil de ejecución actual; ausente por defecto. Decoder exige revisión/usuario/barbería
y matriz exacta. Respuestas tardías de otro contexto no habilitan accesos. Menú y perfil
usan esas capacidades solamente cuando la opción se habilite; fallo o legado impide
controles administrativos. Servicios/horarios para secundarios omiten la lectura de equipo.
No se agregan todavía pantallas de retiro/transferencia ni se habilitan controles nuevos.
Los comandos quedan disponibles en la aplicación preparada para incorporarlos después.
Android nativo no cambiado; aceptación futura conjunta sigue abierta.

## Verificación preparada (no equivale a SQL ejecutado)

| Casos del pedido | Evidencia local / integración pendiente |
| --- | --- |
| 1 creación atómica,2 propietario único | SQL preparado con fallo inducido y PK |
| 3/4 dos secundarios/tercero | SQL preparado acepta2 y rechaza3 por RPC actual/antigua |
| 5 carrera último cupo | Dos conexiones, script race preparado; NO acreditada |
| 6 emisor secundario,7 caducidad/revocación | Parser/guardas estáticas; SQL preparado parcial; emisor revocado/versión requiere integración |
| 8 promoción,9 retirada,10 conservación | SQL preparado promoción en fila existente/retiro barber/perfil/citas/pagos intactos; bloqueo de salida por cita futura. Caso en atención pendiente |
| 11 tenant,12 ownerA/barberB,13 autoelevación | Dobles/contratos y SQL preparado; RLS real/HTTP pendientes |
| 14 RPC antiguas | Revisión de todos escritores encontrados, SQL estático; SQL preparado con wrapper viejo y helper |
| 15 revocación simultánea | Script race describe variante; fixture y ejecución pendientes |
| 16 transferencia | Dobles bloquean final; SQL preparado inicia/rechaza y prueba bloqueo; cancelación/expiración/replays reales pendientes |
| 17 legado | SQL preparado no infiere y regulariza solo snapshot sintético |
| 18 reservas/pagos | Dobles y SQL preparado cobro/cancelación/reembolso/reserva preservada; reprogramación con huellas pendiente |

No cerrar estos casos por inspección de texto. Los tests .test.mjs no contactan red real;
el SQL preparado requiere autorización independiente de migración/fixtures. Los scripts
prepared tienen flag explícito y no se incluyen en la ejecución habitual.

### Secuencia futura LOCAL (no ejecutada)

1. Autorizar lectura del destino54422, historial16/hashes, salud y baseline completo:
   usuarios/perfiles/membresías/invitaciones/reservas/detalles/care/pagos/eventos. Preservar
   exactamente37 reservas,2 manuales y fixtures vigentes. Confirmar versión/procedimientos.
2. Revisar inventario sin mutar. Aprobar mapa individual de propiedad y tratamiento de
   excedentes/invitaciones; no sustituir esas decisiones por el orden de las filas.
3. Autorizar validación SQL en transacción revertida (sin redeploy ni datos reales) y
   ejecución de esta única migración si aprueba. Comprobar columnas/FK/RLS/ACL/funciones/
   triggers/search_path/dependencias e historial. No `db reset` ni ejecución automática
   del resto de migraciones. Ante fallo parar y conservar diagnóstico.
   El SQL ya contiene BEGIN/COMMIT: **no** validarlo anidando otro BEGIN alrededor.
   Preparar una copia de ensayo con el único COMMIT final sustituido por ROLLBACK,
   comparar cuerpo/hashes y mantener verificaciones dentro de esa transacción. No
   ejecutar el archivo original durante el ensayo. Ese procedimiento tampoco se ejecutó aquí.
4. Solo con permiso de datos separado, ejecutar regularizaciones aprobadas; comparar
   snapshots y auditoría. Ninguna asignación implícita en el DDL.
5. Autorizar fixtures nuevos aislados: siete usuarios/perfiles confirmados, tres shops y
   membresías/invitaciones/profesional, un servicio y dos reservas con sus detalles/care
   del SQL secuencial en rollback; cobro/cancelación/reembolso solo sintéticos, sin dinero.
   No correos ni sesiones.
   Para carrera se requieren fixtures comprometidos distintos y aprobación de sus límites,
   dos conexiones y comprobación posterior, sin limpieza no autorizada. Preparar además
   un caso en atención y reprogramación sobre reservas sintéticas separadas.
6. Autorizar carga de Edge LOCAL/flag privado y cliente únicamente tras SQL verificado;
   nunca reiniciar toda la pila. Revisar necesidad de operación de servicio por separado.
   No habilitar envío externo. Probar HTTP JWT/ACL y Web owner/sec/cliente/profesional,
   contextos/roles revocados y backend antiguo; aprobación manual separada.
7. Si falla antes del COMMIT PostgreSQL revierte su transacción. Si hay COMMIT confirmado,
   no repetir ni revertir destructivamente: mantener flujos nuevos apagados, diagnosticar
   y preparar corrección hacia adelante autorizada. No restaurar escritores antiguos que
   eludan propietario/cupo. Guardar backup solo bajo autorización específica.
8. Cloud requiere auditoría y permiso independientes, SU mapa de legado, migración y
   despliegue posteriores; jamás copiar IDs, usuarios o37 reservas LOCAL.

## Archivos de esta preparación

Rutas desde la raíz del repositorio; no incluye modificaciones previas del usuario.

Nuevos:

- `supabase/migrations/20261120010538_team_authority.sql`.
- `supabase/functions/_shared/barbershop-operation/domain/team-authority.ts`,
  `application/team-authority.ts`, `infrastructure/team-authority-adapter.ts`.
- `src/features/barbershop-operation/domain/team-authority.ts`, `application/team-authority.ts`.
- `src/composition/use-team-authority.ts`.
- `tests/integration/booking/team-authority.test.mjs`, `team-authority-client.test.mjs`,
  `team-authority-sql.test.mjs`.
- `supabase/tests/team-authority.prepared.sql`, `team-authority-race.prepared.sql`.
- `specs/011-equipo-resumen-profesional/contracts/team-authority.md`, `team-authority-inventory.sql`.

Adaptados:

- `supabase/functions/_shared/barbershop-operation/application/operation.ts`, `composition.ts`.
- `src/features/barbershop-operation/application/operation-application.ts`,
  `infrastructure/operation-http-adapter.ts`, `presentation/operation-screen.tsx`.
- `src/composition/auth-composition.ts`, `barbershop-operation-composition.ts`,
  `operation-route.web.tsx`, `private-home-route.web.tsx`.
- `src/app/(account)/_layout.web.tsx`.
- `src/features/authentication/presentation/workspace-access.ts`, `account-shell.web.tsx`,
  `user-menu.web.tsx`, `web-profile-access.web.tsx` (capacidad opcional, comportamiento actual preservado).
- `scripts/run-client-checks.mjs` (allowlist de nuevos tests sin DB),
  `tests/integration/booking/operation-http.test.mjs`, `tests/presentation/workspace-navigation.test.mjs`.
- `specs/011-equipo-resumen-profesional/spec.md`, `plan.md`, `tasks.md`,
  `docs/CODEX-HANDOFF.md`, `ESTADO-DESARROLLO.md`.

Auxiliar local ignorado `.artifacts/prepare-authority-wrappers.mjs`: genera reemplazos
a partir del SQL histórico en2B; ahora rechaza la revisión2C.2 ANTES de escribir para no
reintroducir guardas viejas. El SQL revisado es autónomo y fuente de verdad. No contiene
credenciales ni hace conexiones. No se necesita este auxiliar para aplicar la migración.

Resultados ejecutados:60 pruebas Node (incluyen4 estáticas SQL) y64 Deno, sin conexión real;
tipos, lint, formato, Deno check, arquitectura y diff check correctos. Comandos, límites
y los2 operadores reales que se detuvieron por guardas en [tasks.md](../tasks.md).
SQL aún pendiente de compilación/ejecución PostgreSQL y prueba de dos conexiones.

## Etapa 2C.2 — reconciliación y activación LOCAL futuras

Fuente inicial de baseline: lectura2C.1; auditoría de catálogos READ ONLY ampliada en2C.2: PostgreSQL17.11,
20 tablas RLS,80 funciones,16 políticas,4 triggers;13 migraciones registradas;14 usuarios,
13 perfiles,8 barberías,13 membresías,37 reservas/40 detalles/24 care. Siete shops con1
administrador y una con2;9 membresías administrativas elegibles, sin excedentes observados.
Los80 cuerpos coincidían con los SQL históricos, pero eso NO acredita todo el DDL/ACL.
Edge estaba detenido; no se inició ni se requiere para el ensayo estructural SQL.

### Efectos que deben acreditarse antes de reparar historial

| SQL ausente | Objetos y efectos que se deben comparar, además del cuerpo |
| --- | --- |
| 20261115030159 booking_agenda | Dos funciones: helper SECURITY DEFINER estable y wrapper invoker estable, ambos con search_path vacío y EXECUTE solo authenticated; defaults null de los2 filtros. Consulta por fecha Lima, pertenencia/actividad, asignaciones propias y máximo200. Sin tablas, políticas, datos o triggers nuevos. Dependencias de Auth/perfiles/membresías/reservas/barber_profiles/reservation_json. |
| 20261115033925 booking_cancellation | Tres funciones: comparador immutable cerrado, cancelador definer y wrapper invoker service_role. Firma/retorno/search_path/ACL, límite inclusivo, bloqueo cfg→personas→reserva→membresía, snapshots, motivo y evento único de cancelación. No modifica DDL ni RLS de reservas; depende de sus columnas, FK, estados, eventos y políticas previas. |
| 20261115151745 care_payments | Tres tablas privadas RLS sin políticas/grants ordinarios; columnas, defaults, nullabilidad, PK/FK/UNIQUE/CHECK y cuatro índices explícitos. Seis funciones, ACL/search_path/definer/volatilidad/retornos. Un trigger care_cancel_guard BEFORE UPDATE OF state, habilitado y enlazado al helper correcto. Revocaciones de public.confirm_booking y private.reservation_confirm a service_role; confirm_booking_paid invoca el motor cerrado como propietario. Ledger/eventos atómicos; no backfill. |

Care: validar las restricciones de attendance/method/payment_status/tolerancia/importes,
reembolso con motivo, unicidad actor+requestId y transición por reserva; FK compuestas
a reservations(id,barbershop_id), FK a shop/actor con ON DELETE RESTRICT. Índice parcial
care_events_once_per_transition debe conservar unique y predicado reservation_id IS NOT NULL.
Comprobar políticas heredadas de reservations/items/events y ausencia de escrituras directas.
No aceptar conteos de constraints/índices en sustitución de sus definiciones exactas.

El archivo [team-authority-history-audit.sql](team-authority-history-audit.sql) prepara
SELECT de catálogos READ ONLY:13 firmas (11 creadas+2 confirmadores antiguos), cabeceras,
ACL incluso por columna, hashes,3 tablas/columnas/defaults/constraints/índices, trigger,
políticas de reservas, dependencias y conteos. **Se ejecutó solo como introspección READ ONLY en2C.2**. pg_depend no
recoge todas las referencias en cuerpos dollar-quoted; revisar también el grafo de llamadas.
Comparar ese inventario con los3 SQL exactos, sin ejecutarlos. Cualquier diferencia o
resultado null/missing/false detiene la reparación; no eliminar controles para aceptar.

SHA256 de los históricos leídos (no modificados):

- Agenda: `AD976787836D8C4B46D4B7A357D82D4C221777235935D38AE26F13B719291C9F`.
- Cancelación: `7915F5FFF637AB9DE226242123B1B8C71855C28950AB94AFD3CD5C8CA1561204`.
- Care: `2053C2A84B153C535AF7CF55B1AB23904AEA2A4E3DA4BAA2789EE4FB244B1B7E`.

### Procedimiento de reconciliación (NO ejecutado)

1. Con permiso de lectura, reidentificar motor Docker local, label/proyecto/puerto54422
   y carpeta exacta. Confirmar historial13 y ausencia de20261120010538. No usar Cloud.
2. Ejecutar únicamente el audit READ ONLY y comparar todos los efectos anteriores.
   Conservar salida saneada de metadatos/conteos y hashes de fuente; sin datos personales,
   contraseñas o tokens. Verificar estado vigente, no reutilizar2C.1 como aprobación eterna.
3. Preparar acta de correspondencia por cada versión: objeto, esperado, observado y
   diferencia. Solo si TODO corresponde solicitar autorización para insertar exclusivamente
   esas3 entradas en supabase_migrations.schema_migrations. No volver a correr sus SQL.
4. CLI instalada3.1.0, ayuda verificada con --help (sin repair): destino LOCAL por defecto;
   --remote selecciona Cloud y queda prohibido. --local no figura en su ayuda actual.
   Comando propuesto, **no ejecutarlo sin permiso**; carpeta explícita y una versión cada vez:

```powershell
npx.cmd --no-install supabase migration repair 20261115030159 --status applied --workdir "C:\Users\PREDATOR\Desktop\SEMETRE 2026 II\Arquitectura de Software\App-Barberia"
```

   Tras verificar esa entrada y conservación de datos, repetir para20261115033925 y
   20261115151745 con autorización vigente. No --remote, --yes, db push, up, reset, pull,
   squash ni SQL de negocio. No instalar/actualizar CLI. `repair --status applied` registra
   historial, no sustituye la auditoría de correspondencia; ver [referencia oficial](https://supabase.com/docs/reference/cli/supabase-migration-repair).
5. Leer historial después de cada paso:13→14→15→16. La nueva jerarquía sigue ausente.
   Comparar todos los metadatos/ACL/huellas/conteos y snapshots protegidos autorizados;
   solo deben cambiar las entradas de historial aprobadas. Si hay fallo/salida incierta,
   parar y consultar estado; no repetir ni borrar/revertir entradas automáticamente.
   Un fallo de correspondencia requiere diagnóstico y autorización distinta, no reparación
   automática de esquema ni marcar aplicada una versión parcialmente existente.

Evidencia2C.2 en [team-authority-history-audit.result.json](team-authority-history-audit.result.json),
sin personas ni credenciales:13 firmas/cabeceras/ACL correctas y13 cuerpos coincidentes;
3 tablas privadas RLS con permisos cerrados incluso por columna y sin políticas;22
restricciones validadas,8 índices válidos/listos (4 explícitos), trigger correcto/habilitado,
3 políticas heredadas de reservas, sin escrituras directas. Tipos/defaults/nullabilidad,
PK/FK/UNIQUE/CHECK, índices y grafo de llamadas comparados con las fuentes históricas.
No se detectaron diferencias en ese alcance. Historial13 intacto,14 usuarios/13 perfiles,
8 shops/13 membresías,37 reservas/40 detalles/24 care/57 eventos care/48 eventos reserva.
Esto permite proponer la reparación de historial, no autoriza ejecutarla ni valida el DDL2B.
Los80 cuerpos ya coincidían en2C.1; en2C.2 se revalidaron los13 de este bloque concreto.

### Ocho barberías: evitar una interrupción inesperada

El inventario preparado muestra IDs de shop y candidatos administrativos activos/elegibles,
sin correos, teléfonos o nombres; orden de filas NO decide propiedad. La revisión humana
privada vincula identidad real/cuenta con cada candidato, evidencia y confirmación explícita
del usuario. El mapa debe incluir shopId, ownerUserId aprobado, snapshot exacto de TODAS
las membresías, secundarios resultantes, motivo y evidencia; no fabricar aquí IDs ni nombres.
Ninguno de los8 establecimientos fue asignado en2C.2. Un administrador único no acredita
propiedad. Revalidar cupos/estado vigente; excedentes se detienen, nunca se degradan solos.

**Los flags Edge/Web apagados NO evitan los efectos de las guardas SQL al hacer COMMIT.**
Por eso no aplicar la migración a las8 tiendas hasta aprobar SU mapa y el procedimiento
de transición. Opción recomendada, con autorización posterior de DDL Y datos explícitos:
una transacción supervisada con el mismo cuerpo DDL revisado, las8 regularizaciones
operador-only y sus verificaciones ANTES del único COMMIT; fallo de un snapshot revierte
el conjunto. El ensayo DDL previo no incluye esas llamadas. Inventariar primero cuántos
booking_settings faltan: la regularización puede provisionarlos; autorizar esos registros,
propiedad/auditoría y registro de historial de forma concreta antes de la activación.
No editar migraciones históricas ni insertar IDs reales en el SQL versionado de jerarquía.

Si no hay mapa completo, posponer la activación. Alternativa: ventana de indisponibilidad
administrativa explícitamente aprobada; no habilitar un bypass de privilegios antiguos.
Pendientes previas se revisan individualmente para cancelación/renovación; nunca agregar
stamps masivamente. Replay de aceptadas es lectura, no regularización ni concesión.

### Próximo ensayo DDL transaccional (aún no autorizado)

Tras revisar la auditoría y aprobar el SQL corregido/hash, solicitar autorización
solo para DDL temporal LOCAL en READ WRITE/READ COMMITTED, con lock_timeout5s y
statement_timeout30s. Copia de ensayo: conservar cuerpo revisado y sustituir el único
COMMIT final por verificaciones estructurales y ROLLBACK; sin BEGIN externo anidado,
sin registrar historial, fixtures, usuarios, funciones de negocio ni regularizaciones.
ON_ERROR_STOP y cierre de conexión/ROLLBACK ante fallo. Verificar tablas/firmas/RLS/
grants/triggers/search_path/dependencias dentro del ensayo y desaparición de objetos/
conservación de baseline después. NO ejecutar aún los scripts de fixtures o carreras.
El ensayo manual con ROLLBACK puede hacerse sin reparar antes el historial: debe
preservar sus13 entradas y no utilizar un migrador que aplique archivos pendientes.
Reparar historial y activar permanentemente el esquema son autorizaciones independientes.

Ensayo posterior con datos nuevos: actualizar/aprobar sus límites antes de ejecutar
team-authority.prepared.sql. Read-only de negocio en team-authority-reads.prepared.sql
requiere fixtures sintéticos comprometidos separados y autorización; no usar37 reservas
protegidas. Estas pruebas reales siguen pendientes, igual que concurrencia y HTTP/Edge.

### Archivos afectados específicamente en2C.2

- `supabase/migrations/20261120010538_team_authority.sql` (solo borrador nuevo).
- `tests/integration/booking/team-authority-sql.test.mjs`, `tests/server/barbershop-operation/team.test.ts`.
- `supabase/tests/team-authority.prepared.sql`; nuevo `team-authority-reads.prepared.sql`.
- `contracts/team-authority-inventory.sql`; nuevos `team-authority-history-audit.sql`
  y `team-authority-history-audit.result.json` bajo esta especificación.
- Este contrato, `spec.md`, `plan.md`, `tasks.md`, `docs/CODEX-HANDOFF.md` y `ESTADO-DESARROLLO.md`.
- Auxiliar ignorado `.artifacts/prepare-authority-wrappers.mjs` bloqueado ante2C.2.

No se modificaron migraciones históricas, producción TypeScript, estilos, pantallas,
flags, contenedores, Auth ni datos. Solo la CLI --help intentó/escribió su telemetría local
tras permiso del sandbox; no se ejecutó repair ni se actualizó/instaló la CLI.

## Etapa 2C.7 — transición conjunta preparada, no ejecutada (20/11/2026)

Este apartado actualiza la preparación histórica anterior. El historial LOCAL ya tiene
16 entradas por 2C.5; la migración administrativa sigue ausente. El usuario confirmó que
las ocho barberías son ficticias. Mapa propuesto revalidado por READ ONLY, pendiente de
aprobación definitiva: MVP A→U1, MVP B→U2, 005 aislada0→U3, 005 aislada1→U4,
Prueba aislada0→U5, Prueba aislada1→U6, 011→U5 con U6 secundario, sjjss→U1.
UUID completos y snapshot de TODAS las membresías se guardan únicamente en el archivo
privado `.artifacts/team-authority-2c7/proposal.json`, sin correos ni credenciales.
La propuesta no acredita creación histórica: `created_by` permanecería null.

### Artefacto y límites

`scripts/prepare-team-authority-transition.mjs` es un generador puro: no conecta,
no ejecuta procesos, no escribe archivos ni ofrece modo COMMIT. Verifica hash exacto
6F581F7C0EA2B6E6DC9C518A6CDF7252AE9816DC7CA7A21F4A0E3CE44B1D1B42, separa sentencias
sin romper cuerpos dollar-quoted/comentarios/cadenas y conserva intacto el SQL histórico.
La copia privada `transition.ROLLBACK.prepared.sql` termina exclusivamente en ROLLBACK.
NO ejecutarla en esta etapa, ni siquiera para ensayar DDL en la base principal.
El mapa y los fingerprints se invalidan si cambia cualquier dato protegido; se revisa
el cambio y se regenera con autorización, nunca se omite una comprobación.

### Ejecución futura exacta — requiere nueva autorización

1. Confirmar mapa definitivo y huellas de propuesta, fuente y copia. Revalidar contenedor,
   binding54422, identidad del cluster/base, historial16 completo y catálogo/ACL. Conexión
   directa a loopback con argv separados; nunca conexión Cloud vinculada. No usar el
   reparador de 2C.5 ni un comando que ejecute todas las migraciones pendientes.
2. Con operador postgres y psql `-X -v ON_ERROR_STOP=1`, una sola conexión y una sola
   transacción READ COMMITTED. Verificar identidad antes de los locks. lock_timeout5s,
   statement_timeout30s. Bloqueos SHARE ROW EXCLUSIVE sobre las22 tablas protegidas
   y el historial estabilizan snapshots; no se adquieren durante la preparación.
   La comprobación de privilegios del operador fue exclusivamente de catálogo.
3. Exigir las16 versiones esperadas y la huella completa de sus filas. Comparar huellas
   de20 tablas de negocio + auth.users/auth.identities, nombres/UUID, elegibilidad de
   candidatos y snapshots completos de membresías. Rechazar cualquier deriva.
4. Ejecutar el cuerpo exacto revisado de20261120010538, quitando solo sus marcadores
   externos BEGIN/COMMIT para componer la transacción, sin modificar el archivo fuente.
   Las cuatro tablas nuevas, doce funciones nuevas, doce reemplazos, tres triggers y
   tres políticas cambiadas permanecen invisibles fuera de la transacción hasta confirmar.
5. Ejecutar ocho llamadas operador-only a `private.regularize_barbershop_ownership`,
   con UUID y snapshot exactos. Resultado permitido:8 ownership,8 eventos regularized,
   y1 booking_settings por defecto para sjjss. U6 sigue administrator en011, con capacidad
   secundaria derivada; no cambiar ninguna de las13 membresías ni perfiles existentes.
6. Forzar `SET CONSTRAINTS ALL IMMEDIATE`. Verificar propietario y evento por shop,
   capacidades completas de principal, facultades fijas de secundario, ausencia de
   administración para barber,24 cuerpos/firmas/owner/definer/volatilidad/defaults/search_path,
   RLS/ACL de tablas nuevas, auxiliares cerradas, RPC service_role y tres triggers.
   Mantener cerrado el confirmador antiguo sin método de pago. La transferencia final
   permanece bloqueada por el mismo SQL revisado y su evidencia2C.4, sin habilitarla.
7. Comparar otra vez las22 huellas. Única excepción: fila NUEVA de settings para sjjss,
   exactamente draft, version1, cancellation_advance_min120 y demás campos opcionales null.
   Sus siete filas preexistentes deben coincidir exactamente. Verificar la invitación
   pendiente a barbero de MVP A intacta y emisor U1 propietario; no aceptar/cancelar/renovar.
8. Registrar solo20261120010538 en `supabase_migrations.schema_migrations` DENTRO de
   esta misma transacción: version, name=team_authority y statements originales separados
   lexicalmente, incluyendo sus marcadores originales como metadatos, nunca ejecutados
   por ese INSERT. No usar CLI repair en otra conexión. Exigir historial17, las16 filas
   anteriores intactas y ninguna versión ajena. Este INSERT requiere permiso explícito.
9. Solo después de ensayo exacto y aprobación posterior, revisar la sustitución del
   ROLLBACK terminal por un único COMMIT. No existe activación automática en el generador.
   Cualquier fallo aborta; el operador debe cerrar/ROLLBACK y verificar con nueva conexión.
   Ante desconexión durante COMMIT, resultado incierto: inspeccionar antes de repetir.
10. Comprobar desde otra conexión los cambios permitidos, catálogo y ausencia de sesiones
    o bloqueos de la operación. Edge/cliente/HTTP y aceptación de roles requieren otro
    bloque autorizado. No declarar todo el módulo aceptado por esta transición SQL.

La transacción evita un estado publicado sin propietarios, pero puede causar esperas
breves de consultas o escrituras mientras se aplican locks/DDL, incluidas escrituras Auth.
Requiere ventana corta aprobada sin uso concurrente. No prometer cero latencia ni detener
servicios. Si faltan mapa/permiso/ensayo, posponer; no habilitar un bypass administrativo.

### Validación ejecutada y ensayo pendiente

Revalidación actual READ ONLY aprobada:8shops/13membresías,14usuarios/13perfiles,
37reservas/40detalles/24care/57eventos care/48eventos reserva,6invitaciones/4metadata.
Todos los candidatos confirmados/elegibles. Solo sjjss sin settings. Emisor de la invitación
pendiente a barber en MVP A coincide con U1. No se efectuó DDL/DML ni regularización.

18 pruebas locales aprobadas:9 del nuevo generador y9 de regresión estática SQL. Las
primeras8 del generador observaron RED→GREEN; la novena cubre inyección mediante nombre.
TypeScript, lint dirigido, formato y grafos cliente/servidor aprobados. No son compilación
PostgreSQL ni prueba física. No ejecutar `npm test` indiscriminado con operadores ajenos.

Reutilizar 2C.4:75 casos/controles SQL y2 carreras reales, con la incidencia008 READ ONLY
todavía abierta. Su BD temporal fue eliminada. No se creó otra en esta etapa preparatoria;
el bloque conjunto EXACTO (incluido INSERT de historial y los nuevos asserts) aún requiere
ensayo PostgreSQL en una nueva BD independiente con fixtures sintéticos autorizados.
No copiar usuarios/reservas personales desde LOCAL; usar UUID nuevos y nombres ficticios.

| Prueba preparada | Evidencia reutilizable / verificación exacta pendiente |
| --- | --- |
| Principal y secundario actual | 2C.4 permisos reales; nuevo bloque consulta capacidades de los9 administradores |
| Dos secundarios y rechazo del tercero | 2C.4 cupos + carrera del último cupo; repetir solo si cambia SQL o el ensayo nuevo lo exige |
| Profesional y tenant ajeno | 2C.4 SQL real; nuevo bloque conserva perfiles/membresías y no les concede administración |
| Conservación de37 reservas/pagos | Huellas actuales iguales a2C.5; ensayo nuevo debe conservar sus fixtures antes/después |
| Ocho legados y settings faltante | Generación/guardas locales aprobadas; ejecución exacta nueva pendiente |
| Fallo antes de confirmar | Ensayo debe inducir snapshot incorrecto y demostrar rollback de DDL, propiedad, settings e historial |
| Transferencia final | Bloqueada en SQL revisado y2C.4; no habilitar ni decidir reglas por esta etapa |

Autorización posterior debe distinguir ensayo aislado de escritura principal y aprobar
expresamente DDL,8 propiedades,8 eventos,1 configuración y1 fila de historial, los locks
temporales, el mapa definitivo y el único COMMIT condicionado al éxito. No incluye Edge,
flags Web, Cloud, datos adicionales ni nuevas sesiones. Evidencia saneada en
`team-authority-2c7-result.json`; manifiestos y SQL con IDs únicamente en `.artifacts/`.

## Etapa 2C.8 — ensayo PostgreSQL aprobado exclusivamente en BD temporal

La autorización2C.8 permitió una nueva BD `barbexa_2c8_20261120_f4423fa3`, OID118495,
template0, en el servidor LOCAL54422 ya identificado por TCP y Docker. La base principal
postgres quedó excluida por el operador de toda escritura de negocio. createdb/dropdb
usaron template1 como mantenimiento y un único nombre permitido; ninguna operación de servicio.

Se reconstruyeron16 fuentes históricas y estructura Auth sin filas/owners/ACL; se otorgó
USAGE de ese schema solo dentro de la BD temporal para pruebas SQL. No cambiaron roles
globales. UUID del mapa se usaron como identificadores de prueba, sin copiar filas Auth,
hashes de contraseñas ni información personal. Contenido sintético:9 usuarios/perfiles,
8 shops,13 membresías,6 profesionales/servicios,37 reservas/care,1 invitación pendiente y
7settings. No se pretende replicar cuentas personales ni igualar los24care de la principal.

La variante se derivó con el mismo generador/hash y el mismo cuerpo de migración que la
copia2C.7. Cambios limitados al destino por nombre+OID antes de locks, nombres/baselines
sintéticos, consulta de resultado y acción terminal de la variante COMMIT solo temporal.
La fuente6F581... y copia original6a29443c... se conservaron. No se creó variante COMMIT
para principal, ni se habilitó modo COMMIT en el generador.

| Ensayo real | Resultado |
| --- | --- |
| ROLLBACK conjunto | Aprobado: DDL/aserciones,8 propietarios/8 eventos/8settings/historial17 dentro; nueva conexión vuelve a catálogo/huellas/historial16 originales |
| Fallo tras registrar historial | Aprobado: EXPECTED_2C8_ABORT_AFTER_HISTORY revierte DDL, propiedad, auditoría, settings y fila17 sin cambios parciales |
| COMMIT temporal | Aprobado:8 propietarios únicos, secundario U6 en011 y owner en su otra barbería;24 tablas/92 funciones/16 políticas/7 triggers |
| Conservación | 37 reservas sintéticas,13 membresías,6 perfiles profesionales y sus huellas intactos; invitación pendiente no decidida/modificada |
| Seguridad | 13 casos SQL aprobados, todas sus escrituras revertidas y estado comprometido temporal conservado |

Los13 casos cubren denegación de retiro del principal por secundario, auto-retiro del
principal, inicio de transferencia por secundario, aceptación final bloqueada23505,
administrador de otro tenant/cliente sin facultad, RPC restringida y tablas privadas,
RLS roster owner/secondary/otro tenant, lectura profesional propia en READ WRITE normal,
barber sin administración, segundo secundario permitido y tercero rechazado23514 por
trigger de integridad mediante inserciones de operador en una transacción revertida.
No confundir esa última prueba con una nueva carrera HTTP o aceptación por invitación;
las carreras y caminos RPC2C.4 se conservan como evidencia previa del mismo hash.

Única corrección necesaria: el armado del fixture esperaba9 personas únicas pero el
destinatario ya era otra cuenta administrativa del mapa. El assert detuvo antes de seed;
se añadió un cliente ficticio independiente y se exigieron tablas de seed vacías antes
de continuar. Ninguna corrección a migración, generador o controles de seguridad.

La BD temporal se eliminó tras verificar nombre/OID/cero conexiones, sin FORCE.
Catálogo, huellas22 tablas, conteos y filas del historial principal permanecen iguales:
14 usuarios/13 perfiles/8 shops/13 membresías/37 reservas/40 detalles/24 care,
historial16 y ausencia de jerarquía. No hubo Cloud, nuevas sesiones, correo, Edge,
flags Web, Android, reinicios ni cambios al log protegido.18 regresiones locales aprobadas.

Resultado saneado en `team-authority-2c8-result.json`, detalle/operador privados bajo
`.artifacts/team-authority-2c8/`. No recrear la BD ni repetir limpieza por continuidad.
Esto acredita el procedimiento SQL y permite solicitar autorización de transición real
LOCAL con mapa definitivo, ventana y prechecks frescos. No concede ese permiso ni cierra
aceptación Web/Android, HTTP/Edge/JWT,006/011, la incidencia008 READ ONLY o transferenciafinal.

## Etapa 2C.9 — activación SQL persistida exclusivamente en LOCAL

Permiso oficial por ocho parejas UUID exactas. Se revalidaron contra el manifiesto2C.7,
historial16 y cierre2C.8 completo; ninguna diferencia de esquema/datos. Destino explícito
127.0.0.1:54422 contrastado por TCP y Docker, contenedor de proyecto app-barberia-002-local,
base postgres/OID5 y mismo system_identifier. No se usó target implícito de CLI ni Cloud.

Respaldo previo completo PostgreSQL custom,558680B, SHA256
404a53ad1a9e21b03209793bf0ee6fe85b6a1b026225e95e57c79d74f9a81fad.
Archivo privado ignorado por Git bajo `.artifacts/team-authority-2c9/backup.local.dump`;
ACL restringida a usuario/SYSTEM. TOC con Auth/negocio/historial y decodificación de todas
las secciones verificados mediante pg_restore SIN conectar/restaurar. Operador privilegiado
existente de recuperación comprobado por lectura. No se hizo prueba de restauración ni se
subió el archivo. Recovery plan privado requiere permiso futuro, primero verificación en
destino LOCAL independiente autorizado; jamás restauración destructiva automática.
La protección NTFS inicial dentro del sandbox no persistió; se realizó y verificó fuera
de él antes del backup y antes de la transacción. No se redujeron los controles de seguridad.

La variante temporal conserva el generador y preparado original: separa léxicamente las
sentencias y reemplaza SOLO el último ROLLBACK, añade OIDguard antes de locks, repite el
mismo DO de verificación puro inmediatamente antes de confirmar y contiene un único COMMIT.
Las16 migraciones anteriores y sus filas se preservan; el INSERT de versión17 comparte
transacción con DDL/regularizaciones. No se ejecutó migration repair aparte. Un intento,
exit0 y persistencia confirmada desde nuevas conexiones. Sin errores SQL/reintentos/reparaciones.

Resultado real:17 migraciones,24 tablas,92 funciones,16 políticas y7 triggers. Ocho filas
ownership source reviewed-legacy/created_by null y ocho eventos regularized, conforme al
mapa U1–U6 aprobado. U5 owner de011; U6 conserva administrator activo y capacidad secondary
en011, owner enPrueba1. Solo se creó el settings faltante de sjjss, draft/version1/límite120
y demás campos opcionales null; las siete configuraciones anteriores no cambiaron.

Verificación posterior READ ONLY ejecutó otra vez las aserciones de capabilities, cuerpos,
firmas/owner/definer/volatilidad/defaults/search_path, RLS/ACL, triggers y ayudas privadas.
Ocho parejas exactas, cero exceso de secundarios. Confirmador antiguo sin pago cerrado.
La aceptación final de transferencia mantiene el mismo cuerpo bloqueado validado en2C.8.
Cuatro lecturas RLS con rol authenticated y claims SQL temporales demostraron: owner011
ve2 miembros, secondary011 ve1, ese usuario como ownerPrueba1 ve2 y otro tenant devuelve0.
Son comprobaciones SQL; no se crearon sesiones Auth ni se acreditó firma JWT o HTTP.

Conteos y contenido previo conservados:14 usuarios,13 perfiles,8 shops,13 membresías,
37 reservas,40 detalles,24care,6 invitaciones,4metadatos,48eventos reserva y57care_events.
Veintiuna tablas originales tienen SHA256 idéntico; settings conserva sus7 filas y añade
solo la aprobada. Historial conserva exactamente sus16 filas originales y suma una con
statements de la fuente original. Invitación pendiente de MVP A intacta. Sin sesiones de
activación ni locks esperando. No repetir operadores antiguos con baseline16 ni esta aplicación.

Evidencia saneada `team-authority-2c9-result.json`; archivos privados requieren permisos
adecuados fuera del sandbox, sin ampliar ACL ni publicar su contenido. No se cambió Cloud,
Edge/despliegues/flags, Web/Android/diseño, Auth/SMTP/secretos, servicios ni log protegido.
No se hizo staging/commit/push. HA-A01 yC7-A01/A03 acreditadas; HTTP/Edge/cliente/manual,
transferencia definitiva yCloud siguen pendientes. Próximo permiso: revisar/cargar Edge LOCAL
y activar flag privado/composición Web LOCAL aislada, luego sesiones/HTTP/contextos y
aceptación manual. Este cierre SQL no cierra006/011 ni autoriza la etapa siguiente.

## Etapa 2D — conexión preparada de Edge y Web LOCAL (20/11/2026)

**Código integrado, servicios NO activados.** Inspección LOCAL: PostgreSQL saludable,
17 migraciones/última20261120010538 y8 propiedades;14usuarios/13perfiles/8shops/
13membresías/37reservas coinciden con2C.9. Primera consulta de conteos usó por error
`public.memberships`, inexistente: transacción READ ONLY abortada sin cambios; corregido
solo el nombre a `public.barbershop_memberships`. No se ejecutó ninguna función escritora.

Edge existente `supabase_edge_runtime_app-barberia-002-local` detenido, imagen1.78.1,
red exclusivaLOCAL y bind de fuentes actuales verificados. Cuatro funciones configuradas
con verifyJWT=true. SUPABASE_URL/DB/deployment satisfacen la guarda interna LOCAL;
BARBERIA_ALLOWED_ORIGINS conserva exactamente localhost8081. Metro8081 no está escuchando.
No se inició/reinició/desplegó nada. Referencia oficial consultada:
[verificación JWT de Edge](https://supabase.com/docs/guides/functions/auth).

### Código y comportamiento

- `src/composition/registration-environment.ts`, `registration-runtime-provider.tsx`,
  `auth-composition.ts`: perfil **local-team-authority**, solo Web Development en
  localhost8081, endpoint explícito127.0.0.1:54421 y proyecto app-barberia-002-local.
  Namespace nuevo independiente de local/cloud-integration. Activa autoridad y módulos
  existentes necesarios para el recorrido; Google deshabilitado. Android y Cloud conservan
  sus opciones anteriores. No habilita ese contrato en Cloud, que sigue con16 migraciones.
- `src/features/authentication/infrastructure/project-transport.ts`: Auth, REST y Edge
  usan un único origen fijado; rechaza otro puerto/proyecto/servicio y redirects HTTP.
  `google-auth-check-gate.tsx` impide que una selección diagnóstica Cloud antigua intercepte
  el perfil LOCAL; no borra esa selección ni sus sesiones.
- `scripts/team-authority-local-profile.mjs`: prepara variables exclusivamente en memoria,
  conserva el entorno heredado y lee la clave pública LOCAL existente sin imprimirla.
  Valida proyecto/API en config.toml, rechaza claves privilegiadas y elimina variables
  públicas Cloud de la copia del proceso. `--check` no arranca Metro ni consulta Auth.
- `operation-route.web.tsx`, `use-team-authority.ts` y `operation-screen.tsx`: mantienen
  avatar/navegación existentes, conectan las facultades verificadas y muestran carga o
  denegación recuperable. Slot visual opcional Web: las variantes nativas no lo reciben.
- `team-authority-panel.web.tsx`: etiqueta principal/ secundario, secundarios provenientes
  del roster real y cupo2. No inventa nombres: usa nombre profesional disponible o una
  etiqueta ordinal de la fila. Retirada exige seleccionar otro administrador activo,
  destino barber/inactive y motivo. Confirmación explícita; no cambia cuenta/perfil/historial.
  No ofrece transferencia. Invitaciones y estados caducada/inválida reutilizan011.
- `application/team-authority.ts` y `operation-application.ts`: resuelven la recarga de
  permisos que desmontaba al consumidor y el reintento que reconstruía la versión.
  Una revalidación del mismo contexto conserva la pantalla previamente verificada;
  toda escritura espera la comprobación nueva y SQL decide finalmente. Error, cambio
  de contexto o denegación cierran facultades. Un reintento incierto conserva el comando
  original; cambiar destinatario con el mismo requestId produce CONFLICT.
- Edge `supabase/functions/_shared/barbershop-operation/composition.ts`: la extensión
  usa la guarda LOCAL ya existente (proyecto explícito, kong8000, DB db5432/postgres,
  sin deploymentId). Otros destinos siguen dependiendo del flag privado anterior.
  JWT/actor/RPC/transacciones no se sustituyeron; correo LOCAL sigue Mailpit.

### Verificación ejecutada y límites

`node scripts/run-client-checks.mjs`: **384/384**; `npm run test:server`: **66/66**.
Dobles locales/contratos/renderizado estático, no sesiones reales ni aceptación del navegador.
Regresiones2D cubren perfil Web-only, aislamiento, guardas antiguas de Google, principal/
secundario/profesional/cliente, cupo/vacío, retirada explícita, reintento estable, denegación
y respuestas tardías/contextos (reutilizando2B). Se actualizaron los dobles faltantes de
useTeamAuthority en pruebas de Inicio y expo-crypto en las de navegación; no son parches
del producto. Tipos, lint, formato y arquitectura cliente/servidor aprobados.
No acreditar por ello JWT auténticos, HTTP sobre el Edge detenido ni clics/teclado reales.

### Activación siguiente: autorización NUEVA necesaria

1. Revalidar identidad/conteos LOCAL, estado del Edge y puerto8081. Si otro proceso ocupa
   el puerto, identificarlo y detenerse; no sustituirlo. Conservar `.env.local` y Cloud.
2. Autorizar **iniciar únicamente** el contenedor existente:
   `docker start supabase_edge_runtime_app-barberia-002-local`.
   El bind carga las fuentes preparadas; no hace falta establecer secretos ni usar deploy
   o --no-verify-jwt. Verificar carga real antes de afirmarlo. Si falla, detener el procedimiento
   sin recrear contenedores, reiniciar la pila ni reparar automáticamente.
3. Autorizar Metro Development/LAN8081 con `readTeamAuthorityLocalEnvironment()` como
   entorno de **ese proceso**. Comando futuro (NO ejecutado), después de comprobar el puerto:

   ```powershell
   node --input-type=module -e "import {spawn} from 'node:child_process'; import {readTeamAuthorityLocalEnvironment} from './scripts/team-authority-local-profile.mjs'; const child=spawn(process.execPath,['node_modules/expo/bin/cli','start','--dev-client','--lan','--port','8081'],{env:readTeamAuthorityLocalEnvironment(),stdio:'inherit'}); child.on('exit',code=>process.exitCode=code??1);"
   ```

   Revisar en un navegador/perfil de pruebas separado, solo `http://localhost:8081`.
   El perfil es Web-only: no conectar el APK ni navegador del celular a este proceso.
4. Primero comprobar disponibilidad/preflight/origen ajeno/sin JWT/JWT inválido, sin datos.
   Después autorizar sesiones LOCAL de cuentas ya identificadas (U5/U6 y cliente/profesional
   según mapa), sin cambios de contraseña ni creación de perfiles implícita. No usar Google
   Cloud. Si falta contraseña/perfil/contexto, detener ese recorrido y pedir el permiso concreto.
5. Recorrido de lectura: seleccionar011 con U5→principal/equipo/cupo; U6→secundario sin
   controles exclusivos; U6 enPrueba1→principal allí, sin combinar facultades. Revisar cliente,
   profesional, cambios de contexto, navegación por teclado y pérdida de permisos con alcance
   de fixtures aprobado. No aceptar Web solo por HTTP200 o por estas pruebas automatizadas.
6. Invitación/promoción/retirada requieren **otra autorización** que identifique destinatarios,
   barbería, operaciones y recuperación. No ejecutar botones escritores durante el recorrido
   de lectura. Transferencia definitiva y despliegue Cloud continúan bloqueados.

Conservación: sin escrituras SQL, cuentas/sesiones/correos, cambios Cloud/LOCAL efectivos,
Android nativo, migraciones, datos de negocio ni log protegido. `.env.local` permanece igual.
HA-A02(HTTP)/HA-A03(manual)/HA-A04/HA-A05 abiertos; no cerrar006/011 todavía.

## Etapa 2E — validación real LOCAL, parcial (20/11/2026)

Autorización nueva ejecutada: inicio único del contenedor Edge existente y MetroDevelopment/
LAN8081 con local-team-authority. JWT/configuración conservados; sin deploy ni reiniciar la
pila. Salud GoTrue200 yMetro packager-status:running enlocalhost y127.0.0.1. Quedan activos.

Tres cuentas ficticias existentes con credenciales legítimas cotejadas mediante lectura,
confirmación yperfil previos:principalMVP-A,profesional005 ycliente sin membresía. Formularios
reales en Chrome instalado, contextos privados, sin mocks,Google niCloud. Tokens/contraseñas
solo en memoria; evidencia sin correos,credenciales ni enlaces Auth. HTTP principal16/16 y
diagnóstico2/2: capacidadowner/barber200, identidadesAuth200,tenantajeno/cliente/listaadmin
profesional/RPCprivilegiada403, sinJWT/tokeninválido401,preflightpropio204/ajeno403.

Web real:6 aserciones principales y1 diagnóstica aprobadas; panel propietario con0de2,
controles exclusivos sin enviar, espacio profesional ydenegación deequipo, perfilcliente/
crearbarbería/explorar/misreservas como rutas. No acreditar búsqueda,reserva integral,
secundarios ni aceptación manual del usuario por esos resultados. Namespaceaislado y
peticionesLOCAL comprobados. Sin escrituras comerciales. No repetir384/66offline ya acreditadas.

**Defecto2E-WEB-01:** cliente autenticado sin membresías que abre `/staff?view=team` ve
«Cargando permisos…» persistente. La espera de60s del recorrido falló; diagnóstico nuevo
observó el mismo estado al entrar y6s después, sin controles privilegiados. Fuente:
`src/composition/operation-route.web.tsx` comprueba missingauthority antes de denied ytrata
idle como loading; sin contextoseleccionado no habrá autoridad que resuelva esa rama.
Propuesta mínima: resolver primero falta de membresía/contexto ymostrar denegación/selector,
con regresión Web para el perfil habilitado. No aplicado durante2E; aplicado posteriormente
en2E.1 conautorización específica, según seguimiento siguiente.
No es una fuga de autorización; Edge devuelve403 para ese cliente.

Faltan credenciales verificadas del principalU5/secundarioU6 de011. Los siete registros
disponibles cotejados pertenecen a otros fixtures; no proporcionan esos actores. No probar
contraseñas por reutilización, reset, usuarios nuevos ni JWT sintéticos. El usuario puede
introducir personalmente las credenciales LOCAL existentes en el navegador, sin enviarlas
al chat. U6 debe probarse como secundario011 yprincipalPrueba1; principal011 debe consultar
la lista secundaria real no vacía. Esos recorridos siguen pendientes.

Preservación mediante lecturas READ ONLY antes/después:historial17/8owners ytodos los conteos,
huellas de negocio ycatálogo iguales;37reservas/40detalles/24care/invitaciones/pagos intactos.
Auth:5accesos de prueba,4cierres exclusivos scope=local,sesiones48→49,refresh51→52 y
audit507→516; usuarios14/identidades intactas, auth.users cambia poraccesos autorizados.
Primera ejecución del verificador terminó antes de disponer de cleanup: una sesión quedó
registrada, navegador cerrado ytoken no retenido. No se alteraron sesiones preexistentes
mediante logoutglobal ni se eliminaron filasAuth. .env.local sin cambios.

Evidencia versionada `team-authority-2e-result.json`; operadores/salidas saneadas en
`.artifacts/team-authority-2e/`. Primer fallo de selector correspondió al verificador sin
espera yse corrigió solo allí; el timeout cliente corresponde al defecto descrito. No cambiar
interfaces niRLS para ocultar el fallo. HA-A02/HA-A03/HA-A04/HA-A05 permanecen abiertos.
Invitaciones/promociones/retiradas/transferencias requieren autorización independiente.

### Seguimiento 2E.1 — corrección Web autorizada, sin nuevas sesiones

`operation-route.web.tsx` comprueba primero si una vista deequipo carece de membresía
administrativa seleccionada. none/choosing/barber→denegación inmediata, conenlaces aInicio,
Miperfil yselector. resolving→carga; error→alerta recuperable conreintento/selector. Unadmin
seleccionado aún necesita autoridad consultada/verificada; secundario sinmanageTeam y
respuestas deotroactor/barbería nunca montan administración. No cambios alservidor ni
alcoordinadorAuth/autoridad, roles, estilos deInicio oAndroid.

TDD: ocho regresiones nuevas en `tests/presentation/workspace-navigation.test.mjs`;
seis fallaron primero reproduciendo estadosincorrectos ylas ocho aprueban traslacorrección.
56 pruebas dirigidas finales aprobadas (navegación/permisos/respuestas tardías/red/protección/
sesión), TypeScript/lint/formato/arquitecturafrontend correctos. No se repitió lasuite masiva.
Metroactivo HTTP200 sirve elbundle conlacorrección, sinreiniciar servicios. No equivaler
estacomprobación debundle aaceptación delrecorridoautenticado.

No existía Chromeaislado reutilizable ni tokens retenidos; inventariodeUI tampocomostró
unruntimeLOCAL autenticado accesible. No se inicióloginni se consultóSupabase: cero sesiones,
operacionesAuth/negocio y cambiosdatos en2E.1. Confirmación manual pendiente: conclienteLOCAL
yaautenticado, abrir `/staff?view=team`, comprobar denegación sin «Cargando permisos…» y
enlacesInicio/Miperfil; principal mantiene sugestion ysecundario/profesional susrestricciones.
E-A01 acreditada encódigo/regresiones; HA-A03/E-A02/E-A03/011 permanecenabiertas.

### Aceptación manual U6 — confirmada por el usuario

El usuario completó y aprobó Web LOCAL: U6 secundario de «011 Equipo aislado», sin controles
exclusivos del propietario; U6 principal de «Prueba aislada 1», con sus herramientas; cambio
entre ambas barberías correcto. No atribuir estas pruebas a Codex ni repetirlas. Se conserva
la aprobación visual previa del principal de MVP Local A. No acredita escrituras, vista U5
del equipo011, corrección de la ruta cliente, Android ni cierre integral de011/2E.
Evidencia en `team-authority-2e-result.json`, `userReportedAcceptance2E2`.

### Plan mínimo posterior de invitación, aceptación y retirada — sin ejecutar

1. Lectura LOCAL ybaseline nuevo: identificar UUID exactos de un propietario y un barbero
   ficticio activo con perfil profesional enla misma barbería ycredenciales legítimas. Propuesta
   a revalidar: «005 aislada 0», principal ybarbero de fixtures existentes. No modificar U6
   ni las propiedades aprobadas. Comprobar cupo libre, ausencia de invitación duplicada y
   preservar miembros/perfiles/reservas/detalles/care/pagos porhuellas. Reutilizar evidencia
   SQL de límite2/concurrencia; no ampliarla creando más actores enesta prueba mínima.
2. Tras autorización específica: principal emite UNA invitación administrativa albarbero;
   verificar pendiente sinpromoción anticipada ynotificación soloMailpit, nuncaResend/Cloud.
3. Destinatario acepta conJWT propio: sumisma membresía pasa aadministrador secundario,
   sin duplicados, conpermisos fijos/cupo actualizado. Comprobar idempotencia mediante replay
   controlado delmismo intento, autorización contextual yrechazo deaccesos exclusivos mediante
   lecturas seguras. No afirmar rechazos de comandos escritores solo por ocultar botones.
4. Principal retira esa administración con disposición explícita `barber` y motivo deprueba:
   conserva elperfil activo yrestaura elrol previo; no usar inactive ni tocar citas. Verificar
   pérdida de facultades administrativas ycontinuidad profesional, mismafila demembresía,
   propietario ydatos protegidos idénticos. Invitación aceptada yauditoría se conservan:
   recuperación delrol no implica borrar toda evidencia ni regresar todos los conteos.

Autorizar antes elestablecimiento, ambas cuentas/UUID, invitación+unavisoMailpit+aceptación/
replay+retirada con destino `barber`, sesiones necesarias yefectos deauditoría previstos.
Si falta acceso aalguna cuenta, detener ese recorrido; no recuperar contraseñas sin permiso.
Ante resultado inesperado, parar ydiagnosticar; no limpiar, revertir roles automáticamente
ni tocar propietarios. No ocultar efectos conDELETE. Ninguna operación deeste plan ejecutada.

### Preparación concreta por lectura — «005 aislada 0»

Destino verificado: app-barberia-002-local, PostgreSQL54422 saludable. Solo SELECT en
transacción READ ONLY; sin login, correo, cambio de contraseña ni ejecución de comandos.

| Recurso ficticio | Identificador | Estado leído |
| --- | --- | --- |
| Barbería005 aislada0 | 4950d75f-e43b-459b-acf6-e138f9f051e1 | Propiedad versión1 |
| Principal (U3; fixture005 índice0) | 74a05d0a-f21f-44f5-8de2-549ba4dba76f | Confirmado, no bloqueado, administrador activo y propietario |
| Membresía delprincipal | 9596e999-5936-47c2-a327-a17295105780 | Se conserva sin cambios |
| Trabajador candidato (fixture005 índice1; F5 en2E) | 8ff39bfd-5242-4058-8875-b2d378500d91 | Confirmado, no bloqueado, barbero activo |
| Membresía candidata | 97435498-a79d-4253-82af-1d5a829da9f2 | Misma fila durante promoción y retirada |
| Perfil profesional candidato | 4c1860a5-64fa-441e-9ae1-9c0fb8f9e527 | Activo; no modificar |

Cupo actual0/2; sin invitaciones (ni pendientes) enla barbería ysin transferencias pendientes.
Ocho reservas locales, cero futuras confirmadas y cero enatención. Baseline agregado leído:
17migraciones/14usuarios/13perfiles/8propietarios/13membresías/37reservas/40detalles/24care,
6invitaciones/4admin_invitation_mail/0authority_invitation_stamp/8team_authority_events.
No se adquirieron locks mutadores ni se ejecutaron funciones de negocio.

Credenciales ficticias legítimas disponibles para ambos en `.artifacts/005-care/credenciales-locales.json`,
índices0 y1. Coincidencia deUUID/correo cotejada enmemoria, sin imprimir contraseñas/hashes.
Ambos tienen contraseña configurada. El candidato autenticó correctamente en2E; esta lectura
NO comprueba nuevamente que las contraseñas sigan siendo aceptadas. Autorizar login posterior;
si falla, detener la cuenta afectada, sin probar contraseñas ajenas ni iniciar recuperación.

Procedimiento final propuesto, pendiente de permiso:

1. Revalidar estos UUID/cupo/estados y capturar huellas completas antes de escribir. Autenticar
   ambas cuentas mediante GoTrue LOCAL, nunca JWT fabricado ni service_role como actor.
2. El principal indicado emite `invite-administrator` únicamente alcorreo ficticio correspondiente
   alUUID candidato, enla barbería indicada, con requestId único. Unaviso soloMailpit con enlace
   LOCAL `/staff?invitationId=…`; la invitación no concede facultades antes delaaceptación.
3. El candidato acepta ESA invitación con suJWT: pasa debarber/active aadministrator/active
   sobre lamisma membresía; cupo0→1. Un replay controlado delaaceptación comprueba que no
   duplica membresías/eventos. Verificar facultades secundarias ydenegación de lecturas exclusivas.
4. El principal ejecuta `remove-secondary` sobre elUUID candidato, versión depropiedad
   revalidada (actualmente1), requestId único, disposición `barber` y motivo
   «Prueba LOCAL autorizada: restaurar función profesional tras aceptación administrativa».
   Resultado esperado: misma membresía barber/active y cupo1→0, perfil activo conservado.
5. Verificar por lectura las facultades tras refrescar contexto y todas las huellas protegidas:
   propietario ysu membresía, usuario/perfil/profesional/servicios/horarios/capacidades, otras
   membresías ybarberías delcandidato,37reservas/detalles/atención/pagos sin cambios. LosSQL
   revisados conservan atención para perfil activo con membresía barber oadministrator;
   no actualizan reservas/perfil alpromover/retirar. Esto es compatibilidad estática, no una
   prueba ejecutada dela conservación después de escribir.

Evidencia persistente esperada tras ciclo positivo ysin otras operaciones concurrentes:
UNA fila staff_invitations aceptada (total6→7),UNA metadata admin_invitation_mail (4→5),
UN sello authority_invitation_stamp (0→1),DOS eventos team_authority_events (8→10):
accepted-administration poraceptación yremove-secondary porretirada. Replay sin nuevos
efectos. El correo permanece enMailpit. Usuarios/perfiles/membresías/propietarios sin nuevas
filas; propietario/versión no cambian. No eliminar invitación, sellos, auditoría ni correo
para forzar igualdad deconteos. Metadatos de sesiones Auth ordinarios se registrarán aparte.

Autorización requerida: este par de cuentas ybarbería exactos, sesiones LOCAL, UNA invitación
yUN avisoMailpit, UNA aceptación ysu replay, UNA retirada explícita con destino barber y
comprobaciones deconservación. No incluye bajas, nuevascuentas, transferencias, limpieza,
reparaciones automáticas, otros destinatarios, Cloud ni Android. Ante desvío, parar; una
recuperación de estado inesperado requiere autorización específica. Plan todavía no ejecutado.

### Resultado del primer intento autorizado 2E.3 — detenido

Baseline yprecondiciones anteriores revalidados. U3 obtuvo sesiónrealGoTrue mediante
formularioChrome; no se completó preparación delcontexto depropietario. El verificador
registró UNEXPECTED_ERROR sinconservar elestadoDOM exacto. Cero solicitudes de invitación,
aceptación oretirada yningún avisoMailpit. Candidato no autenticado en esteintento.
Sesión de prueba deU3 cerrada exclusivamente scope=local conHTTP204; sin afectarotras.

Inspecciónestática posterior encontró un supuesto incorrecto delverificador: trasCambiar
debarbería siempre espera unbotónElegir, pero tenant-context autoselecciona membresíaúnica
incluso alchoose; U3 tieneuna sola. Esto acredita unproblema delverificador, no unfallo
demostrado deAuth/Edge. Alno registrar DOM final no afirmar elpuntoexacto como causareal.
No corregido nireintentado traslaparada. Propuesta: autorizar corrección solo delverificador
para aceptar selección yaexistente yregistrar diagnóstico seguro, másunnuevo intento con
idénticos actores/alcance, sinrecrear servicios nimodificar aplicación/SQL/datos fuera delciclo.

Comparación final READONLY: negocio/identidades/catálogo/historial/.env.local conhuellas
idénticas. Membresíacandidata misma barber/active, perfilactivo conservado, propietarioU3
intacto,0secundarios,37reservas/40detalles/24care. Invitaciones6/mail4/sellos0/eventos8,
sin nuevosregistros deaceptación oretirada. Auth.users cambia porlogin autorizado, sin cambios
decontraseñas/cuentas. Evidencia `team-authority-2e3-result.json`; operadores/baseline/diagnóstico
ignorados en `.artifacts/team-authority-2e3/`. No repetir eloperador: guardadeintentoexistente.

### Reintento posterior autorizado — invitación pendiente, correo no validado

Verificador corregido únicamente enartifacts, con4regresiones: contexto único automático,
selección múltiple yrechazos decontexto/rol/permisos. Diagnósticos seguros de fase/estado.
Nuevo intento único ensubcarpetaretry, sin sobrescribir evidenciaoriginal. Baseline coincide;
U3/candidato autentican porformularioChrome yEdge valida actor/contexto/capacidadowner/barber200.
UI deU3 emite UNA invitación,HTTP200. Se crea42acf7f0-15f6-4cff-940d-2fc144e715cc pendiente,
conselloU3versión1 ymetadatacorreo unknown. No concedeprivilegios; candidato aúnbarber/active,
0secundarios. Elcriterio deliveryStatus=sent falla yse respeta parada antes deaceptación.

Diagnóstico de sololectura:0avisos correspondientes enMailpit, revisando texto yHTML.
EladaptadorLOCAL soloacepta destinatarios@example.invalid; direcciónficticia delcandidato
no cumple. Eseguard arroja antesdeSMTP yservicio notify registraunknown. No suponer entregado
porHTTP200. Faltó comprobar compatibilidad deldominio alprevalidar losfixtures. No alterar
cuenta, protección decortes ni código productivo como reparaciónautomática.

Aceptación/replay/retirada NO ejecutados. Se conservan invitación, metadataunknown ystamp;
totales6→7/4→5/0→1. Eventosdeautoridad permanecen8. Huellas protegidas negocio/identidades/
catálogo/historial idénticas; miembro/perfil/propietario, otrasbarberías,37reservas/40detalles/
24care sin cambios. Dos sesiones deesta prueba cerradas exclusivamente scope=local,204.
No reinicios niCloud/Android/U5/U6 tocados. Resultado `team-authority-2e3-retry-result.json`.
Continuar exige autorización independiente para correcciónacotada decompatibilidad correoLOCAL
yprocedimiento de invitaciónexistente (unknown impide reenvío automático). No crear otra,
aceptar, cancelar, reconciliar ni reenviar hasta aprobación específica. Conservar evidencia.

### Etapa 2E.4 — compatibilidad SMTP LOCAL corregida solo en código

Cambio mínimo en `infrastructure/invitation-mail-adapter.ts`: el destinatario LOCAL debe
coincidir íntegramente con `^[^@\s<>]+@example\.(invalid|test)$` (sin distinguir mayúsculas).
No subdominios, sufijos parciales, dominios arbitrarios ni direcciones ambiguas. Se mantienen
development requerido, remitente example.invalid yconexión fija aMailpit1025. Resend,
composición/guardasCloud, contratos, autorización, configuraciónSMTP ySQL sin cambios.
No reinicio/deploy ni invocación deenvío real; no acreditar carga efectiva delcódigo enel
workeractivo oentregaSMTP porpruebas condobles.

18 pruebas Deno dirigidas aprobadas,3regresiones nuevas deladaptador y1 delservicio:
ambosdominiosficticios/case, externos/parciales/inyección sinconectar, desarrollo requerido,
Cloud/Resend, SMTP previo/postDATA, unknown sinreenvío ybandeja recibida disponible.
La prueba positiva nueva falló antes delcambio. check:server (tipos/grafo/Deno/lint), lint
posterior yformato correctos. Tests sinpermisos denetwork; no correos reales generados.

Lecturaactual de42acf7f0-15f6-4cff-940d-2fc144e715cc: pending/unknown, vigente hasta
2026-11-27T16:41:53.576972Z. EmisorU3/candidato/barbería autorizados coinciden; selloU3v1
coincide conpropietariovigente/activo. Candidato confirmado barber/active,0secundarios.
Huellas de todas las tablas denegocio/identidades/catálogo/historial iguales alcierre2E.3retry:
37reservas/40detalles/24care/13membresías/7invitaciones/5metadata. No modificación defila.

Enelintento anterior elguarddelreceptor arrojaba antes de `Deno.connect`; no alcanzó SMTP.
Elservicio notify transforma esaexcepción enunknown. No confundir ununknown general con
garantía denoentrega: aquí seconoce elrechazo previo porfuente+destinatario yMailpit sinaviso.
No se cambió suclasificación persistida. ElSQLclaim rechaza sending/sent/unknown; botón/API
retry sobre esta invitación conservaría unknown sinenviar. No existe unreset seguro automático
enelcontratoactual. Cualquier reconciliación selectiva deunknown aestado reintentable yUN
aviso deesta misma invitación exige revisión ypermiso independiente, nunca crearotra invitación.

Camino más simple sinreconciliar metadata: conautorización nueva, elcandidato abre sus
invitaciones recibidas yacepta esta fila vigente; SQLrespond no exige entrega sent. Sí exige
destinatario confirmado, propietario/sello/cupo vigentes, ypromueve soloalaceptar. Después
unreplay yretirada porU3 destinobarber, todo sobre losmismos IDs. Sinaceptaciónreal en2E.4;
solo contrato revisado/servicio condobles. Elaviso real seguiría pendiente devalidación separada.
No se enviaron avisos, autenticaron cuentas ni aceptaron/rechazaron/cancelaron/retiraron filas.
Cloud/Android/interfaces/servicios/datos protegidos intactos. 2E/011 abiertas.

### Continuación autorizada 2E.3 — aceptación real y parada en permisos Web

Se reutilizó exclusivamente42acf7f0-15f6-4cff-940d-2fc144e715cc. Revalidaciónpending/
unknown, vigente ycon selloU3v1 correcto; loginChrome real del destinatario porGoTrueLOCAL.
Desde bandejarecibida se pulsó «Aceptar administración» una vez: HTTP200 ymisma membresía
administrator/active. LecturaEdge conJWT auténtico devuelve secondary200, sin gestionar
administradores/equipo/transferencia ycon editServices;1/2cupos, perfilprofesional intacto.

La navegación posterior a /barbershop-admin mostró «No se pudieron consultar los permisos»;
shell privado montado/alerta presente, sin estado «Cargando permisos». Elverificador agotó
su espera de «Administrador secundario». Esto demuestra elfallo deeste recorridoWeb,
no sucausa raíz: la lecturaEdge directa sí devolvió secondary. No parche especulativo,
reintento delbotón ni nueva sesión. Replay/idempotencia, loginU3 yretirada NO ejecutados.
El trabajador permanece secundario activo. Sesión propia deprueba cerradaHTTP204.

DiagnósticoREADONLY posterior: invitaciónaccepted/entregaunknown; auditoría8→9 con unúnico
accepted-administration deldestinatario yeventos anteriores intactos. Otrasmembresías
verificadas sin cambios mediante huella reconstruida sustituyendo solo la filaobjetivo
por su baseline en una expresiónSELECT, sin escrituras. Otrasinvitaciones intactas.
37reservas/40detalles/pagos/24care/perfilesprofesionales ypersonales/propiedad/metadataMail/
sello conservan huellas; catálogo y17migraciones intactos. Auth200/DBhealthy/.env.local igual.
Sin otra invitación ni reenvío; SMTP sigue sin comprobar. SinCloud/Android/infraestructura.

Evidencia `team-authority-2e3-existing-result.json`; diagnóstico privado ignorado en
`.artifacts/team-authority-2e3/continue-existing/`. Nueva autorización para investigar
errorWeb ycontinuar replayúnico/retirada «Conservar como barbero»; no restaurar ni escribir
automáticamente. 2E/011 siguen abiertas ylas aprobaciones manualesU6 se conservan.

### Error Web resuelto y replay real aprobado; retirada todavía no emitida

La nueva autorización permitió diagnóstico Chrome sin escrituras administrativas.
Auth/membresías/read-team-authority responden200, yel decoder acepta elpayload realsecondary.
Debugger capturó throw/catch en run de operation-application.ts: una lectura de contexto
anterior termina cuando el scopeKey ya cambió; se rechaza FORBIDDEN, pero elcatch invalidaba
la autoridad del contexto vigente. Esta invalidación obsoleta produce la pantalla deerror.
No es una denegación demostrada del servidor ni unfallo delJWT.

Se agregó únicamente una guarda de scopeKey===stamp antes deinvalidar. Las respuestas
antiguas siguen rechazadas; denegaciones actuales siguen retirando autoridad. Diez pruebas
de éxito/denegación tardíos alseleccionar/cambiar generación/tenant/actor/rol profesional:
fallan antes, aprueban después.52dirigidas ytipos/lint/formato/grafo aprobados. Sin rediseño,
SQL/RLS/Edge/infraestructura/identidades/configuración modificados.

Chrome posterior comprueba /barbershop-admin conpanel secundario ysin controles exclusivos;
la ruta /staff?view=team deniega alsecundario. Esta última es la ruta oficial de retirada
paraU3; /barbershop-admin no es unprerrequisito de esa operación. Con JWT auténtico del
destinatario se envió UN replay respond-admin-invitation accept:HTTP200/accepted, todas las
huellas yfilas dehistoria iguales, misma membresía/1cupo/9eventos. No repetir este replay.
U3 inicia sesión yconsulta owner200; Web carga equipo1de2 yopciones reales de retirada.

El ejecutor adaptado cometió unerror: se eliminó la declaración dewaitCapture al retirar
el bloque de aceptación inicial, pero quedó suuso tras «Confirmar retirada de administración».
Análisis delAST confirma1llamada/0declaraciones. Capturó UNEXPECTED_ERROR ydetuvo/cerró sus
sesiones propias204; contador de remove-secondary0. No se emitió elcomando deretirada.
No inferir rechazo delservidor ni afirmar que eltrabajador regresó abarbero. No se corrigió
ni reintentó automáticamente elverificador tras estefallo.

READONLY final: negocio/membresías/propiedad/invitaciones/mail/sello/auditoría sin cambios
respecto aliniciodeesta continuación; solo auth.users porlogins autorizados.37reservas,
40detalles,24care,pagos ytodos losperfiles profesionales/personales idénticos porhuellas.
Trabajador sigueadministrator/active,1/2secundarios;U3 propietario v1,perfil activo,
invitaciónaccepted/entregaunknown,9eventos. Auth200/DBhealthy/.env.local igual.

Evidencia `team-authority-2e3-web-replay-result.json`; detalleprivado ignorado en2e3/
diagnose-web,diagnose-exceptions ycomplete-existing. No ejecutarcomplete-existing.mjs denuevo.
Hace falta permiso para corregir SOLO verificador yUNA retirada destinobarber conmotivo,
verificando revocación/perfil/auditoría; sin repetir aceptación ni replay. SMTP separado,
2E/011 abiertas, U5/U6 no recorridos y aprobaciones manuales conservadas.

### Cierre técnico 2E.3 — retirada única autorizada completada

No se reutilizó el guion fallido ni se repitió aceptación/replay. El nuevo operador de retirada
inicializa waitCapture mediante `scripts/team-authority-response-capture.mjs` antes de pulsar
controles. Exige HTTP200 y cuerpo válido; un timeout o error de navegador detiene sin otro
clic. Los contadores distinguen solicitudes de confirmaciones HTTP+SQL. Diagnósticos guardan
solo clases/códigos/ubicaciones seguros, sin contraseñas ni tokens. Comprobaciónno-undef del
guion anterior detecta waitCapture ausente y la del nuevo pasa. Once regresiones con dobles,
lint/formato/tipos/grafo aprobados. No se modificó código de aplicación ni servidor.

Preflight exclusivamente LOCAL54421/54422: mismo U3propietario/versión1, candidatoadminactive,
1secundario, perfilactivo, invitaciónaccepted/unknown yhuellas iguales al cierre anterior.
Auditoría:0remove-secondary previos para este trabajador/establecimiento y1aceptación existente.
No transición de vuelta a barbero registrada antes;8reservas delshop sin futuras confirmadas
ni atención en curso. El operador queda bloqueado si estas condiciones cambian.

U3 se autenticó mediante formulario realChrome/GoTrueLOCAL; identidad/contexto ycapacidadowner
verificados. En `/staff?view=team` seleccionó trabajador, «Conservar como barbero» y motivo
explícito. UNA solicitudremove-secondary, HTTP200 yresultado barber/active. PostgreSQL confirma
misma fila97435498-a79d-4253-82af-1d5a829da9f2, propietario intacto y0secundarios. Chrome muestra
0de2cupos. No service_role sustituyendo identidad delactor ni llamadas aCloud.

Verificación posterior del trabajador con sesión auténtica propia para lecturas: capacidad
barberHTTP200, equipoWebdenegado, get-own-professional/get-own-scheduleHTTP200 ylecturaUI del
perfil. No se guardó perfil ni horario. PostgreSQLREADONLY confirma las9capacidades
administrativasfalse. Esto conserva funciones profesionales propias; no acredita nuevas
operaciones de atención/cobro por no estar autorizadas aquí. Ambas sesiones propias cerradas204.

Auditoría:9→10 con exactamente unremove-secondary deU3 altrabajador, destino barber/active;
eventos anteriores intactos. Invitación históricaaccepted/metadataunknown/sello conservados.
Todas las demás huellas de negocio intactas:37reservas,40detalles,24care,57eventosatención,
48eventosreserva, pagos,13perfilespersonales ytodos losprofesionales/servicios/barberías.
Solo cambian membresíaobjetivo, nuevoeventoaudit ymetadatosAuth porlogins. La tabla completa
demembresías vuelve a su huella anterior alaaceptación; usuarios14/membresías13/invitaciones7
se conservan. Schema/historial17/.env.local sin cambios,Auth200/DBhealthy. Sin servicios
reiniciados, otras escrituras de negocio, correo, Cloud, Android, SQL/RLS/Edge o despliegue.

Evidencia `team-authority-2e3-removal-result.json`, detalle privado ignorado en
`.artifacts/team-authority-2e3/removal-only/`. Prueba administrativa2E.3 técnicamente completada
por evidencias acumuladas de invitación/aceptación/replay/retirada, sin repetir las previas.
No equiparar con recepciónSMTP (unknown), aceptaciónmanualintegral/T008/HA-A03 ni cierre
global2E/011. Transferenciafinal yCloud mantienen gates independientes. No volver a ejecutar
el operador ni continuar otros módulos bajo este permiso.
