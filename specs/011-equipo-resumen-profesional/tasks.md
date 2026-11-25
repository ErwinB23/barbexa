# Tasks — 011

## Reconciliación Sprint 2 — 24/11/2026

Web de los cuatro perfiles aceptada por el usuario. El ciclo LOCAL de invitación,
aceptación, replay y retirada se acreditó progresivamente en E3-C/F/M; las casillas
de intentos interrumpidos se resuelven por esas evidencias, sin repetir operaciones.
Las descripciones de paradas/contadores originales se conservan como antecedentes,
no como defectos actuales. E3-M06 no cerró aceptación en su fecha; la declaración
posterior del24/11 cierra el componente Web.

Pendientes efectivos: T008/CA-A02 Android; HA-A04 transferencia definitiva de propiedad;
C4-S06 compatibilidad del lector008 bajo transacción READ ONLY, separada de la lectura
normal operativa; E3-R03 entrega Mailpit unknown de aquel intento (sin reenvío automático).
La activación Cloud consta en CA-A01; no acredita Resend ni auditoría de seguridad final.
## Preparación
- [x] T001 Contrastar RF20/RF34/RF35, decisiones y arquitectura en spec/plan/contracts.
## US1 — Invitaciones de administrador
- [x] T002 Añadir RED e implementar dominio/aplicación y adaptadores SMTP Mailpit/Resend, persistencia y SQL revisable en barbershop-operation y contracts/admin-invitations.sql.
- [x] T003 Conectar presentación Web/Android en Personal y composición opt-in, conservando barberos, con pruebas dirigidas.
## US2 — Resumen profesional
- [x] T004 Añadir RED e implementar consulta propia, adaptadores y SQL revisable en contracts/professional-summary.sql, sin métricas financieras.
- [x] T005 Integrar panel compartido Web/Android y pruebas de estados, scope y privacidad.
## Validación
- [x] T006 Ejecutar tipos/lint/formato/arquitectura y pruebas dirigidas; registrar resultados aquí.
- [x] T007 Activar backend/correo LOCAL y acreditar SQL/HTTP/SMTP reales con permiso específico, sin tocar conjuntos protegidos.
- [x] T008-W Recorrido funcional manual Web aceptado por el usuario el24/11/2026; recepción Mailpit LOCAL previa acreditada en T007.
- [ ] T008 Completar aceptación Android física; entrega unknown del intento2E.3 queda en E3-R03, sin suponer correo Cloud.

20/11 B4: resumen propio Web acreditado enpreparación (fecha20nov2citas/1completada/
1cancelada yfecha vacía, HTTP/SQL), guarda cliente real sinloadingperpetuo. Ejecución
posterioracreditaWeb invitación004 debarberoU3→U4/aceptación yperfilnuevo/activación/
servicio mediante6HTTP200, sinadministración niSMTP. No sustituye correo011, no repetir
2E.3 niU6 yaacreditados. Evidencia004/b4-ejecucion.json. T008 conjunta/Android sigue
abierta; SMTPadminunknown ytransferencia definitiva bloqueada permanecenseparados.
Dependencias: T001→T002→T003; T001→T004→T005; ambas→T006→T007→T008.
No cerrar T007/T008 con dobles. Ningún permiso de datos/migración/envío se deduce del código.

## Resultado técnico — 15/11/2026
58 pruebas cliente/presentación y 24 servidor aprobadas: 23 nuevas y 59 regresiones
directamente afectadas. Cubren comandos cerrados, actor/tenant, respuesta tardía/logout,
doble envío, conservación del requestId incierto, aceptación ya confirmada si falla
refrescar contexto, SMTP/Resend con dobles, estados de entrega y controles Web/Android.
Tipos cliente/núcleo servidor, Deno check del entrypoint, lint y formato del bloque,
y ambos checkers de arquitectura: exit0.

Las dos pruebas de SQL son estáticas: NO acreditan ejecución PostgreSQL, caducidad ni
carreras reales. No se aplicaron borradores, cambiaron flags privados, enviaron correos,
operaron servicios ni crearon fixtures. Lectura de metadatos confirmó29 reservas y el
CHECK original que limita staff_invitations.role a barber; no se cambió.
T007/T008 siguen abiertas; las capacidades nuevas permanecen desactivadas por defecto.
00327/36,00428/34,00511/12 y008/0095/7,0105/8 permanecen sin cierres nuevos.

Continuación15/11: corregido el adaptador Resend para rechazar redirecciones del payload
privado y tratar respuestas sin identificador no vacío como resultado incierto. Dos
regresiones RED→GREEN; suite afectada de servidor26/26, tipos cliente/servidor, Deno check,
lint/formato y ambos grafos aprobados. No se repitieron las58 de cliente sin cambios ni
se enviaron mensajes. Ni dobles ni Mailpit prueban entrega real a Gmail.

## Activación real — B, posterior a A
Autorizada y aplicada SOLO LOCAL54422 la migración CLI20261115230134_team_professional_summary:
1 tabla privada vacía con RLS,5 auxiliares cerradas,8 RPC service_role,1 trigger y envoltura
respond_booking_invitation actualizada. Compilación previa con rollback; reversión revisable
con definición original conservada en .artifacts/011-reversal-reviewed.sql, NO ejecutada.
88 verificaciones estructurales/ACL/search_path y16 HTTP reales/JWT aprobadas. Resumen propio,
denegaciones de tenant/cliente/identidad/Origin/sesión/RPC directa, listas vacías y compatibilidad
008/009. Todas las filas/columnas/políticas previas a B iguales;37 reservas intactas.
Composición montada de barbershop-operation conectada solo al par API/DB interno LOCAL con
marcador explícito; Cloud/otro backend no heredan la excepción. Mailpit preparado sin abrir
conexión ni enviar mensaje. Sin variables del contenedor cambiadas ni reinicios en B.
T007 permanece ABIERTA: faltan escrituras de invitación/aceptación/caducidad/carreras y SMTP
real bajo autorización separada. T008 física abierta; flags cliente siguen inactivos.
No acreditar Gmail, Mailpit ni entrega externa por estas lecturas. Estado6/8.
Calidad final del bloque:19 cliente/presentación/guardas y28 servidor, todas aprobadas;
tipos cliente/núcleo servidor, Deno check de ambos entrypoints, lint/formato y grafos0.
Guardas puras RED→GREEN impiden superar límites, colisionar con IDs protegidos o operar
las2 citas manuales; activación LOCAL RED→GREEN no se hereda en Cloud/otro backend.
Diff global2 solo por log activo,0 excluyendo únicamente ese log; staging vacío.

## Pruebas reales de invitaciones — autorización posterior15/11
T007 cerrada:118 comprobaciones reales HTTP/JWT/PostgreSQL/Mailpit aprobadas. Reutilizados
solo los2 administradores nuevos de A; se verificó que no figuraban en credenciales de
conjuntos protegidos ni como cliente/profesional de las2 citas manuales. Una regeneración
de contraseña por cada cuenta mediante Auth oficial, solo en memoria; ningún archivo de
claves/JWT. No se crearon cuentas ni perfiles/servicios/profesionales/horarios/reservas.

ConjuntoC conservado:1 barbería draft,1 booking_settings,2 membresías,5 invitaciones
(4 administrador/1 barbero) y4 metadatos de entrega. Exactamente4 mensajes recibidos en
Mailpit,0 externos. Comprobados destinatario ficticio, texto UTF8, enlaces Web/Android
con UUID sin tokens/credenciales y una sola notificación por invitación pese a reintentos.

Casos: pendiente sin membresía ni privilegios, actor ajeno/no administrador rechazado,
duración exacta604800 segundos, simulación de expiración desplazando solo las2 fechas
nuevas autorizadas8 días (sin cambiar reloj), aceptación caducada rechazada, renovación,
cancelación/rechazo idempotentes y requestId de contenido alterado rechazado. Dos carreras
observadas con2 conexiones PG: creación mismo requestId y aceptación misma invitación;
ambas200/200 idempotentes, una invitación/un correo y una membresía, sin duplicados.
Flujo004 creó/aceptó el nuevo barberoC. Después aceptación011 elevó SOLO esa membresíaC
a administrador; wrapper antiguo conservó el rol y replay de barbero409 no lo degradó.
EmisorC inactivo impidió emitir/aceptar con JWT vigente; su fila nueva restaurada exacta.

Finales administrador: expired/cancelled/rejected/accepted; barbero accepted. Todas las
filas previas public/private iguales por identidad/huella, incluidas invitaciones anteriores,
membresías originales y37 reservas/dependencias. Sin limpieza. Manifest, IDs, checklist y
messageIds locales sin secretos en .artifacts/011-invitations/manifest.json, ignorado.
No repetir el operador, envíos ni aceptaciones por rutina. No prueba recepción en Gmail.
Estado7/8; T008 física Web/Android permanece pendiente para el recorrido integral final.

## Extensión 2B — fuente preparada, sin activación (19/11/2026)

No cerrar ni sumar esta extensión a la aceptación original7/8 acreditada antes de HA.
Preparación no equivale a garantías ejecutadas en PostgreSQL ni a aceptación Web/Android.

- [x] HA-P01 Contrato fijo principal/secundario y reglas HA-001–010, sin editor ni rol global.
- [x] HA-P02 Nueva migración CLI20261120010538 preparada:4 tablas privadas RLS, invariantes,
  creación atómica, guardas de escritores anteriores y regularización operador-only.
- [x] HA-P03 Casos de uso/puertos/adaptadores y comandos cerrados, actor verificado;
  retirada explícita y solicitud/cancelación/rechazo, confirmación final bloqueada.
- [x] HA-P04 Preparar capacidades Web contextuales/versionadas, sin activarlas ni rediseñar;
  secundario sin equipo/publicación, legado/fallos sin controles, respuestas tardías descartadas.
- [x] HA-P05 Preparar integración secuencial/race SQL y matriz de18 casos, diferenciada de
  dobles e inspección estática. Ninguno de esos SQL ejecutado con esta autorización.
- [x] HA-P06 Validación técnica final de tipos, lint, formato, arquitectura y regresiones;
  registrar comandos/resultados de esta extensión sin datos sensibles.
- [x] HA-A01 Autorizar/ejecutar validación SQL LOCAL y verificar migración/RLS/ACL/invariantes.
  Acreditado por2C.3/2C.4/2C.8 y activación principal autorizada2C.9 con nuevas conexiones.
- [x] HA-A02 Alcance LOCAL completado mediante evidencias2C y E3-F/E3-M; mapa, fixtures y concurrencia
  real, revocación simultánea, preservación37 reservas y reglas005/010/011 por SQL/HTTP.
  Mapa, SQL/concurrencia y conservación acreditados; HTTP secuencial de invitación,
  aceptación/replay/retirada acreditado por2E.3. No cerrar por ello toda la cobertura005/010/011.
- [x] HA-A03 Activación LOCAL acreditada en2E; aceptación manual Web del24/11 para principal/secundario/
  profesional/cliente, sin declarar006 ni Android aceptados por pruebas de preparación.
  Integración preparada2D yactivadaLOCAL2E conJWT reales. Usuario aprueba principalMVP-A
  yU6 secundario011/principalPrueba1/cambio decontexto. La aceptación Web pendiente en
  aquel momento queda superada por el24/11; escrituras del ciclo2E.3 acreditadas; vistaU5 delroster011 yconfirmación deguardaCliente
  siguen pendientes. No repetir los recorridos aprobados ni las escrituras para cubrir presentación.
- [ ] HA-A04 Decidir destino del propietario anterior, cupos y confirmación de identidad;
  implementar y verificar aceptación definitiva de transferencia bajo autorización posterior.
- [x] HA-A05 Activación Cloud con autorización independiente acreditada en CA-A01 y evidencias vigentes del handoff; sin copiar fixtures LOCAL. No equivale a auditoría global de seguridad.

Dependencias: P01→P02/P03→P04→P05/P06; A01→A02→A03; A04 independiente del
funcionamiento ordinario pero requisito para declarar transferencia completa. A05 después
de aceptación LOCAL. Plan y riesgos en contracts/team-authority.md.

### Verificación ejecutada de preparación2B

19/11/2026:60 pruebas Node seguras aprobadas (56 con dobles/presentación y4 de inspección
SQL),64 pruebas Deno servidor aprobadas; total124. No acreditan ejecución PostgreSQL,
locks reales ni HTTP real. Tipos cliente/núcleo servidor, Deno check de4 entrypoints,
lint cliente/servidor, formato y ambos grafos de arquitectura:0. Diff check de archivos
adaptados:0, advertencia informativa LF/CRLF de ESTADO-DESARROLLO.md.

Suite Node exacta: `node --test tests/integration/booking/team-authority*.test.mjs tests/integration/booking/team.test.mjs tests/integration/booking/team-http.test.mjs tests/integration/booking/operation-client.test.mjs tests/integration/booking/operation-http.test.mjs tests/integration/booking/care.test.mjs tests/integration/booking/reschedule.test.mjs tests/presentation/workspace-navigation.test.mjs`.
Servidor: `deno task --config supabase/functions/deno.json check` y `test` (no-remote/no-npm,
dobles, sin permisos de red). Calidad: `npm run typecheck`, `typecheck:server-core`, `lint`,
`lint:server`, `format:check`, `architecture:check`, `architecture:server`.

Regresión nueva A→B→A observada RED→GREEN: ticket por solicitud impide que una respuesta
anterior restaure facultades de propietario. Decoder/actor/tenant/revisión, flag ausente,
traspaso final bloqueado, secundarios sin roster/publicación y legado sin controles cubiertos.
Primeras pruebas de núcleo/SQL se observaron RED→GREEN durante preparación. No atribuir
esa secuencia a todos los tests ni confundir mocks con integración SQL.

En una selección inicial entraron2 operadores reales antiguos operation.test/cancellation.test;
sus guardas UNAUTHORIZED_TEST_TARGET/EXPLICIT_FIXTURE_AUTHORIZATION_REQUIRED los detuvieron
ANTES de Docker/SQL/HTTP. No se habilitaron flags ni se repitieron; excluidos de las60 finales.
No se ocultaron fallos ni se debilitaron las guardas. No hubo conexiones, datos nuevos ni
operaciones de servicios. La migración nueva SHA256 es
`56FA060BAA15D169623BC9D953E66AAD5620627F69D84926DD7E2950A6E9AB39`.

## Correcciones 2C.2 — sin aplicación de migración

- [x] C2-P01 Separar care read/settings/payment-options y consultas de invitación de
  INSERT/locks mutadores; autoridad de consulta sin row locks, escritores por defecto bloqueantes.
- [x] C2-P02 Replay accepted histórico para destinatario confirmado actualmente admin activo,
  sin stamp/cupo ni writes; retirado/inactivo/otra cuenta denegados, pending mantiene todas
  las comprobaciones. Releer tras esperas concurrentes. No cambia contrato público/cliente.
- [x] C2-P03 Auditoría histórica más allá de cuerpos:13 cabeceras/ACL/hashes,3 tablas RLS,
  columnas/defaults/22 constraints/8 índices, trigger/políticas/dependencias verificados
  exclusivamente por catálogos READ ONLY. JSON saneado en contracts/. Historial13 conservado.
- [x] C2-P04 Actualizar ensayo con legacy sin stamp, expiración, emisor sin autoridad,
  cancelación, destinatario ajeno y retiro; preparar script de lecturas en READ ONLY.
  Ninguno de esos scripts de negocio se ejecutó; solo audit de catálogos.
- [x] C2-P05 Plan de reconciliación por versión y transición de8 barberías sin inferir dueño,
  exigir mapa confirmado/snapshot; no aplicar guardasSQL confiando solo en flags apagados.
- [x] C2-P06 Verificación final de regresiones/tipos/lint/formato/Deno/arquitectura.

HA-A01–A05 permanecen abiertas. Preparación o catálogo existente no acredita PostgreSQL
compilando/ejecutando el DDL nuevo ni sus carreras. Las pruebas nuevas de flujo SQL son
estáticas; los2 tests Deno añadidos usan dobles y no certifican la política en base de datos.

Resultados2C.2:65 Node aprobadas (56 con dobles/presentación y9 estáticasSQL) y66 Deno
con dobles aprobadas, total131. Las3 regresiones estáticas principales se observaron
RED→GREEN; los2 tests Deno adicionales verifican pass-through histórico/denegación sin
creación, reintentos ni correo; no implementan una simulación de PostgreSQL.
Tipos cliente/núcleo servidor, lint cliente/servidor, formato general+pruebas modificadas,
Deno check de4 entrypoints, ambos grafos y diff check:0. Comandos del bloque anterior
reutilizados; ningún test real de fixtures o negocio SQL ejecutado.

Auditoría real separada: `team-authority-history-audit.sql` ejecutado solo como SELECT
de catálogos en READ ONLY, no es el ensayo de migración.13 contratos/cuerpos coinciden,
3 tablas RLS con22 constraints/8 índices y trigger/políticas/dependencias revisados;
historial13,37 reservas,40 detalles,24care,57care_events y48reservation_events conservados.
Salida saneada: contracts/team-authority-history-audit.result.json. Ninguna entrada del
historial reparada. SHA256 actual del borrador SQL corregido:
`6F581F7C0EA2B6E6DC9C518A6CDF7252AE9816DC7CA7A21F4A0E3CE44B1D1B42`.
La huella56FA anterior corresponde exclusivamente a la preparación2B/inspección2C.1.

## Etapas 2C.3 y 2C.4 — ejecución SQL real, sin activación principal

2C.3: ensayo autorizado en postgres LOCAL54422 del hash6F581F7..., copia temporal sin
COMMIT, READ COMMITTED y ROLLBACK.4 tablas/12 funciones nuevas/12 reemplazos/3 triggers/
3 políticas compilados e inspeccionados; nueva conexión confirmó catálogo/datos/historial
iguales y cero sesiones/locks. No ejecutó ramas de negocio. Artefacto local ignorado:
`.artifacts/team-authority-2c3-result.json`. No equivale a migración instalada.

2C.4: base independiente `barbexa_2c4_20261120_625cac8c`, OID116452, creada desde
template0 en el motor LOCAL existente, sin operar servicios ni copiar filas. Estructura
Auth (sin datos),17 SQL del repositorio para negocio/jerarquía solo allí. La restauración
de defaults de privilegios de Auth ajenos falló42501; se detuvo, inspeccionó y confirmó
que la estructura y ACL explícitas necesarias ya estaban presentes. No se alteraron roles
globales ni se repitió el dump. Defaults de futuros objetos de Auth no replicados; no se
prueba GoTrue/SDK/JWT criptográfico, correo ni Edge. SQL usa claims de usuarios sintéticos,
roles reales anon/authenticated/service_role y revalidación persistida/RLS.

- [x] C4-S01 Guion secuencial preparado pasó en base aislada y revirtió sus fixtures:
  creación/fallo atómico/propietario único/cupos/promoción/retiro/legado y conservación.
- [x] C4-S02 75 casos SQL/controles de datos aprobados bajo roles reales o auditoría,
  de76 ejecutados; no declarar76/76. Incluye servicios/precios/horarios, aislamiento,
  roster/RLS, RPC antigua de confirmación y aceptación, cliente sin membresía, ownerA/
  barberB, autogestión, retiro, cobro/cancelación/reembolso sintéticos y conservación
  de reserva pagada al reprogramar. Ningún movimiento monetario externo.
- [x] C4-S03 Carrera real último cupo con2 conexiones: espera de lock observada,
  ganador COMMIT, perdedor23505 sin membresía/evento parcial;2 secundarios finales,
  replay ganador idempotente, perdedor sigue rechazado.
- [x] C4-S04 Carrera de revocación real con2 conexiones: escritura por secundario espera,
  propietario retira/inactiva, operación posterior42501 sin escritura no autorizada.
  Sin sesiones/locks persistentes ni exceso de cupos/propietarios inválidos.
- [x] C4-S05 care/settings/list/get y replay accepted histórico sin stamp ejecutados
  en READ ONLY. No concesión nueva ni cambio de membresía/propiedad/eventos; retirados,
  otra cuenta, pendiente caducada/cancelada/emisor sin autoridad rechazados.
- [ ] C4-S06 Compatibilidad READ ONLY del lector profesional008: falla25006 por FOR SHARE
  preexistente en self_professional_command. Escenario detenido sin parche. Lectura en
  READ WRITE normal aprobada y perfil sin cambios; decidir por separado si se exige
  consulta008 compatible READ ONLY. No confundir con fallo de las consultas2C.2 corregidas.
- [x] C4-S07 Aceptación definitiva de transferencia bloqueada23505 en SQL real.
- [x] C4-S08 Base de prueba eliminada por nombre+OID verificados, sin FORCE; siete usuarios,
  dos shops, seis membresías y una reserva/care comprometidos sintéticos eliminados con
  ella. Otros siete usuarios/tres shops del guion previo ya habían revertido. Ningún
  recurso preexistente borrado. Baseline principal catálogo/huellas de20 tablas/conteos/
  historial exactos,37 reservas intactas; historial sigue13 y3 versiones faltantes.

Evidencia saneada: `contracts/team-authority-2c4-result.json`. Operador y salidas detalladas
locales ignorados `.artifacts/authority-2c4-*`. No incluye correos personales, contraseñas,
JWT ni sesiones Auth; UUIDs de recursos exclusivamente sintéticos permanecen en manifest local.
No se cambió fuente de migración ni producción para estas pruebas. No es aceptación física
Web/Android ni despliegue de Edge. HA-A01–A05 no se cierran globalmente por este ensayo;
continúan permisos separados de historial, mapa de8 propietarios, activación y aceptación.
No declarar completa Etapa2C ni las especificaciones006/011 por estas pruebas.

## Etapa 2C.5 — reconciliación LOCAL completada tras reintento autorizado

- [x] C5-P01 Confirmar LOCAL `app-barberia-002-local:54422`,13 entradas, tres versiones
  ausentes y jerarquía no aplicada; contrastar efectos completos con auditoría2C.2.
- [x] C5-P02 Conservar historial completo recuperable y baseline de catálogo/ACL/huellas
  agregadas de datos, sin exportar filas personales ni credenciales.
- [x] C5-A01 Reconciliar20261115030159. Primer intento de CLI3.1.0 terminó1 con
  `MigrationInvalidVersionError`: interpretó `II\Arquitectura` de la ruta como versión
  y anunció LOCAL54322 en vez del54422 verificado. Se detuvo sin cambios. Reintento
  autorizado, destino explícito/identidad verificada y CLI directa: exit0, historial13→14.
- [x] C5-A02 Reconciliar20261115033925 tras aprobar controles de la primera: exit0,14→15.
- [x] C5-A03 Reconciliar20261115151745 tras aprobar controles de la segunda: exit0,15→16.
- [x] C5-P03 Auditar después del fallo solo en READ ONLY:13 filas de historial exactas,
  mismas huellas de20 tablas de negocio y Auth users/identities, esquema/ACL intactos,
 14usuarios/13perfiles/8shops/13membresías/37reservas/24care. Cero sesiones y locks de
  reparación; cero esperas. No se reejecutó SQL ni se aplicó jerarquía.
- [x] C5-P04 Reproducir el fallo del envoltorio Windows sin conexión, conservar argv/ruta
  con ejecución directa shell:false y validar rechazo de otros hosts/puertos/versiones:
 5 regresiones aprobadas. CLI3.1.0/help consultados; sin instalaciones ni configuración nueva.
  Identidad TCP54422 y contenedor coincidentes por identificador de sistema, arranque,
  base/OID/versión. `migration list` con la misma URL explícita verificó13 entradas antes
  de escribir; los tres identificadores de versión se pasan individualmente, sin rutas.
- [x] C5-P05 Comprobaciones completas tras cada repair y final: historial16 esperado,
  filas anteriores exactas, esquema/ACL/huellas de22 tablas (20 negocio y2 Auth) idénticos,
  mismos conteos y cero sesiones/locks de reparación o esperas. SQL histórico no ejecutado;
 20261120010538 ausente y sin nuevos objetos administrativos. No cerrar HA-A01–A05 por esto.

Evidencia saneada `contracts/team-authority-2c5-result.json`; historial completo anterior
y operadores ignorados en `.artifacts/authority-2c5/`. El campo `conserved:false` del primer
paso indica verificación de operación interrumpida por exit1, no una diferencia de datos:
la auditoría posterior independiente confirmó conservación completa. No restaurar nada.
El reintento autorizado quedó acreditado en ese mismo resultado, preservando el diagnóstico
inicial; baseline y copias completas antes/después en `.artifacts/authority-2c5-retry/`.
No repetir repairs ya terminados ni sustituir por SQL manual ni habilitar pendientes.008
READ ONLY se conserva y puede corregirse independientemente; su lectura normal ya aprobada
no obliga a bloquear por sí sola la activación administrativa. Mapa humano de los ocho
propietarios y despliegue/aceptación siguen separados y pendientes; no declarar jerarquía activa.

## Etapa 2C.7 — preparación de transición única (no ejecución)

- [x] C7-P01 Revalidar solo READ ONLY identidad LOCAL54422/historial16, ocho UUID,
  candidatos elegibles,13 membresías completas,37 reservas y huellas22 tablas.
- [x] C7-P02 Preparar mapa privado propuesto, U5 principal/U6 secundario en011; ninguna
  asignación efectuada. Settings de sjjss ausente e invitación MVP A/emisor U1 verificados.
- [x] C7-P03 Generador sin conexiones/ejecución/COMMIT, hash de fuente inmutable, única
  transacción READ COMMITTED con ROLLBACK, ocho regularizaciones y registro de historial
  atómico. Guardas de destino/datos/snapshots/ACL/capacidades/constraints preparadas.
- [x] C7-P04 18 pruebas locales aprobadas (9 nuevas,9 estáticasSQL), tipos, lint/formato
  dirigidos y grafos cliente/servidor. Generación con mapa real privado aprobada.
- [x] C7-A01 Aprobar definitivamente ocho pares shop/owner, ventana y alcance de cambios.
  Autorización oficial2C.9 con UUID exactos, fuente y huellas verificadas.
- [x] C7-A02 Ensayar bloque exacto en PostgreSQL independiente con fixtures nuevos
  sintéticos y fallo inducido; autorizar creación/eliminación de BD y límites antes de ejecutar.
  Reutilizar75 casos/2 carreras de2C.4 sin repetirlos rutinariamente.008 READ ONLY pendiente.
  Acreditado por2C.8 con variante de destino/datos sintéticos, ROLLBACK, fallo inducido,
  COMMIT exclusivamente temporal y13 casos SQL de seguridad; no ejecución en principal.
- [x] C7-A03 Autorizar/escribir principal: DDL revisado,8 ownership/8 eventos/1 settings/
  1 historial, asserts y COMMIT único; ejecutado/verificado en2C.9 desde nuevas conexiones.

Fuente y datos de BD intactos. Generador en scripts/prepare-team-authority-transition.mjs;
plan exacto en contrato existente team-authority.md; evidencia saneada2c7 y artefactos con
IDs en `.artifacts/team-authority-2c7/`. No activar Edge/Web ni cerrar HA-A01–A05 o006/011.

## Etapa 2C.8 — ejecución aislada real y limpieza

- [x] C8-S01 Destino TCP/Docker54422 y baseline principal16/37 verificados. BD independiente
  template0 por nombre/OID; ninguna escritura de negocio contra postgres principal.
- [x] C8-S02 Reconstruir16 migraciones y Auth sin filas/ACL/owners copiados. Solo privilegios
  de schema Auth mínimos dentro de BD temporal para roles SQL; sin cambiar roles globales.
  Fixtures9 usuarios/perfiles/8 shops/13 membresías/6 profesionales/6 servicios/37 reservas/
  37care/1 invitación pendiente/7settings. Sin passwords, sesiones, correos o datos reales.
- [x] C8-S03 Ejecutar variante del archivo2C.7 limitada por nombre/OID. ROLLBACK compila
  DDL y asserts, verifica8 propietarios/8 eventos/8settings/historial17 y conservación;
  snapshot posterior catálogo/datos/historial exacto al estado anterior del ensayo.
- [x] C8-S04 Fallo inducido DESPUÉS de8 propiedades y registro17: error esperado
  EXPECTED_2C8_ABORT_AFTER_HISTORY, rollback total sin DDL/propiedad/config/historial parcial.
- [x] C8-S05 COMMIT solamente temporal aprobado y verificado desde otra conexión.24 tablas,
  92 funciones,16 políticas,7 triggers,8 propietarios únicos, U6 secundario011/owner propio.
- [x] C8-S06 13 casos SQL de seguridad aprobados: secundario no retira principal/traspasa,
  principal no se retira, tercero/cliente denegados, RPC/table privadas cerradas, RLS de
  roster por contexto, profesional propio, barber sin administración,2 secundarios admitidos
  y tercero rechazado por invariante. Transferencia definitiva sigue23505. Cada caso revierte.
- [x] C8-S07 Eliminar exclusivamente BD nueva `barbexa_2c8_20261120_f4423fa3`, OID118495,
  con cero conexiones, sin FORCE. Fuente y preparado2C.7 intactos; catálogo/22 huellas/
  conteos/historial principal iguales,37 reservas protegidas.18 regresiones offline aprobadas.

Incidencia de preparación: assert detectó8 cuentas únicas del mapa/invitación en vez de9,
antes de escribir seed. Se añadió cliente sintético independiente y guarda de seed vacío;
sin corregir ni debilitar migración, generador o checks. No es un fallo de negocio.
Evidencia `contracts/team-authority-2c8-result.json`. SQL roles/claims, no Auth/JWT/Edge reales.
C7-A01 yC7-A03 siguen abiertas. No activar principal, Web/Edge ni cerrar006/011 por este ensayo.

## Etapa 2C.9 — activación principal SQL LOCAL autorizada y verificada

- [x] C9-S01 Identidad exacta LOCAL54422/TCP/Docker/postgres OID5, ocho parejas y baseline
  iguales al cierre2C.8:16 migraciones,14usuarios/13perfiles/8shops/13membresías/37reservas/
  40detalles/24care/6invitaciones/4metadata/48eventos reserva/57care_events.
- [x] C9-S02 Respaldo custom local privado, TOC/data requeridos y decodificación completa
  con pg_restore sin ejecutar restauración. SHA256/ACL usuario+SYSTEM/gitignore verificados;
  operador privilegiado de recuperación existente comprobado por lectura. Sin subir backup.
- [x] C9-S03 Variante explícita de una ejecución, sin sustituciones globales: último statement
  ROLLBACK reemplazado por único COMMIT, OIDguard antes de locks y mismo postcheck puro
  repetido antes de confirmar. Migración/preparado original intactos, fuente6F581... aprobada.
- [x] C9-S04 Transacción real aprobada:8 owners/8 eventos reviewed-legacy,1 settings sjjss,
  1 historial. Sin modificar membresías ni registros previos. Historial17 persistido.
- [x] C9-S05 Nuevas conexiones READ ONLY verifican ocho pares/capacidades, bodies/ACL/RLS/
  restricciones, confirmador antiguo cerrado,21 huellas de tablas originales iguales y7
  settings anteriores intactos; nueva fila draft exacta.37 reservas/40 detalles/pagos conservados.
- [x] C9-S06 Cuatro lecturas RLS reales de owner/sec/owner enotroshop/otrotenant aprobadas,
  sin sesiones Auth. Cero sesiones de activación o locks esperando. U6 secondary011 yownerPrueba1.

Resultado `contracts/team-authority-2c9-result.json`. Sin errores de transacción ni reparación;
ACL de respaldo requirió ejecución fuera del sandbox antes de crear archivo o iniciar SQL.
Respaldo y manifiestos privados en `.artifacts/team-authority-2c9/`, no limpiar ni repetir.
HA-A02 (HTTP),HA-A03,HA-A04,HA-A05 siguen abiertas. SQL activado no es aceptación deEdge,
clienteWeb/Android ni006/011. No hubo cambios Cloud, flags, servicios, UI, Android ni Git.

## Etapa 2D — integración preparada, sin activar servicios

- [x] D-S01 Lectura LOCAL: PostgreSQL saludable, historial17/última20261120010538,
  ocho propietarios,14usuarios/13perfiles/8shops/13membresías/37reservas. Edge detenido,
  cuatro verifyJWT=true, CORS localhost8081 y guardas internas LOCAL verificadas.
- [x] D-P01 Perfil Web exclusivo `local-team-authority`, configuración explícita54421,
  namespace propio, transporte fijado de Auth/REST/Edge y sin Google. Preparador de proceso
  sin escrituras ni arranque. `.env.local` conserva SHA2569027B13A...CFFC; clave pública
  comparada en memoria con la anon LOCAL existente, sin mostrarla.
- [x] D-P02 Conexión de autoridad a Web y Edge fuente LOCAL verificado; panel del propietario
  con secundarios reales/cupo2, retirada con destino y motivo explícitos. Secundario solo
  operativo. Estados carga/error/sin equipo/cupo/contexto y controles accesibles reutilizados.
  Revalidación no desmonta el formulario; denegación invalida autoridad; reintento incierto
  conserva requestId, contenido y versión. Diagnóstico Google antiguo no intercepta el perfil.
- [x] D-T01 384 pruebas Node cliente y66 Deno servidor aprobadas, sin HTTP/JWT reales.
  Tipos cliente/núcleo/servidor, lint, formato y grafos de arquitectura aprobados.
  Se completaron dobles desactualizados de navegación privada; no se alteró Inicio aprobado.
- [x] D-A01 Autorizar un inicio del Edge LOCAL existente y Metro8081 con el perfil aislado;
  verificar HTTP/CORS/JWT y después sesiones de cuentas LOCAL identificadas, sin nuevas cuentas.
  Ejecutado en2E para principal MVP-A, profesional005 y cliente sin membresías. No equivale
  a aceptar el secundario011 ni el recorrido integral Web; ver E-A01/E-A02 y resultado2E.
- [x] D-A02 Autorizar fixtures/escrituras concretas de invitación/promoción/retirada y verificar
  autorización real por roles/contextos, idempotencia y conservación. Ciclo real2E.3 completado
  porChrome/JWT/HTTP/PostgreSQL con permisos separados; no equivale a cerrarHA-A03/T008.

Procedimiento y archivos en `contracts/team-authority.md`, sección2D. No se iniciaron servicios,
no se desplegó Edge, no hubo sesiones ni cambios de datos. Cloud/Android nativo intactos.
HA-A02/HA-A03/HA-A04/HA-A05 permanecen abiertos; no cerrar006/011 por estas pruebas con dobles.

## Etapa 2E — Edge y Web LOCAL reales: aceptación parcial

- [x] E-S01 Inicio único del Edge existente y de MetroDevelopment/LAN8081, perfil
  local-team-authority. Auth/PostgreSQL saludables; ninguna otra infraestructura operada.
- [x] E-H01 16 comprobaciones HTTP principales y2 diagnósticas aprobadas. Sesiones reales
  GoTrue mediante formulario Chrome, JWT verificados por Auth/Edge: owner/barber200,
  otrotenant/cliente/listaadminprofesional/RPCprivilegiada403, sin sesión/tokeninválido401,
  preflightpropio204/origenajeno403. No JWT fabricados ni service_role como identidad.
- [x] E-W01 Chrome real:6 aserciones principales y1 seguridad diagnóstica aprobadas.
  Principal MVP-A: propiedad, equipo vacío/cupo0de2/controlinvitar sin enviar. Profesional005:
  espacio propio/sin controles exclusivos/rutaequipo denegada. Cliente:perfil/crearbarbería,
  explorar ymisreservas como rutas, sin confirmar reservas. NamespaceLOCAL ysin llamadasCloud.
- [x] E-S02 Huellas de todas las tablas de negocio/catálogo/historial/.env.local iguales.
  17migraciones/8owners/14usuarios/13perfiles/8shops/13membresías/37reservas/40detalles/
  24care/6invitaciones intactos. Efectos Auth autorizados:5logins/4logoutslocales,
  sesiones48→49,refresh51→52,audit507→516; identidades sin cambios. Primer intento del
  verificador quedó sin token retenido para revocar su sesión; no se revocaron otras sesiones.
- [x] E-A01 Corregir con autorización específica2E-WEB-01: cliente sin membresía en
  /staff?view=team queda en Cargando permisos; rama idle anterior a denegación. Sin controles
  administrativos yEdge403. Reproducido en Chrome2E; corregido soloWeb en2E.1 autorizada.
  Ocho regresiones nuevas y56 pruebas dirigidas aprobadas; confirmación autenticada nueva
  pendiente, sin sesiones reutilizables disponibles ni login adicional enesta etapa.
- [x] E-A02 Vista principal con lista no vacía acreditada por E3-F03 y aceptación Web24/11. ParteU6
  acreditada porconfirmación manual delusuario en2E.2, sinrepetición porCodex:
- [x] E-U6-01 U6 secundario de011, sin controles exclusivos delpropietario: aprobado porusuario.
- [x] E-U6-02 U6 principal dePruebaaislada1, con herramientas correspondientes: aprobado porusuario.
- [x] E-U6-03 Cambio entre ambos contextos correcto: aprobado porusuario. No equivale aejecutar
  invitaciones, aceptaciones, retiradas ni transferencias. AccesoU6 disponible; no repetir recuperación.
  PrincipalMVP-A también aprobado visualmente porusuario; no repetir. Evidencia
  resultado2E.userReportedAcceptance2E2 separada deChrome/HTTP ejecutados antes porCodex.
- [x] E-A03 Aceptación Web del usuario24/11 y escrituras acreditadas E3-M01–M06 con autorización
  independiente; no repetir ese ciclo. No acredita Android ni habilita transferencia definitiva.
  Las restricciones de Cloud de aquel ensayo se superaron solo con CA-A01, no por este cierre Web.

Evidencia saneada `contracts/team-authority-2e-result.json`; operadores ysalidas sin secretos
en `.artifacts/team-authority-2e/`. No modificaciones de código productivo/interfaces/migración,
ni correos/OAuth/Cloud/Android. Edge yMetro quedan activos para revisión del usuario.

### Seguimiento 2E.1 — defecto de carga corregido solo en Web

Guarda anticipada de membresía administrativa seleccionada para equipo: cliente/barbero/
contexto porseleccionar muestran denegación con Inicio/Miperfil/Tusbarberías. Contexto en
resolución conserva carga; error deconsulta muestra alerta recuperable. Autoridad verificada
sigue siendo necesaria para montar administración; secundario sinmanageTeam, otroactor/
tenant yrespuestas tardías no montan controles. Sin cambios decoordinador/contratos/servidor.
56 pruebas dirigidas con dobles, tipos/lint/formato/grafofrontend aprobados. Metro8081 devuelve
bundle actualizado sinreinicio. Chromeaislado anterior cerrado; no se reutilizó la sesión
sin token ni se crearon sesiones nuevas. Aceptación Web real de esta corrección pendiente.
HA-A02/HA-A03/HA-A04/HA-A05 yE-A02/E-A03 siguen abiertas. Evidencia enresultado2E.followUp2E1.

### Siguiente bloque propuesto — escrituras administrativas LOCAL, NO autorizado

Plan encontracts/team-authority.md: inventario ybaseline; unainvitación albarbero ficticio
existente, aceptación quepromueve sumisma membresía, retirada condisposiciónbarber que
restaura surol. Sin nuevascuentas, sin cambiarpropiedad niU6. Fijar actores/UUID/cupos/perfil
antes desolicitar permiso; contar envíoMailpit, auditoría yrestauración esperados. No ejecutar
ahora ni limpiar rastros automáticamente. Límite2 yconcurrenciaSQL ya acreditados no se repiten.
Preparación concreta porlectura aprobada yrealizada:005aislada0 id4950d75f-e43b-459b-acf6-e138f9f051e1,
principal74a05d0a-f21f-44f5-8de2-549ba4dba76f ybarbero8ff39bfd-5242-4058-8875-b2d378500d91,
membresía97435498-a79d-4253-82af-1d5a829da9f2/perfil activo4c1860a5-64fa-441e-9ae1-9c0fb8f9e527.
Cupo0/2,sin invitaciones/transferenciaspendientes,8reservas/sin futuras confirmadas ni enatención.
Credencialesficticias disponibles cotejadas, no autenticadas ahora. Baseline17/13membresías/37reservas
conservado porlectura. Detalle deactores/efectos/auditoría ypermiso exacto encontrato011, última sección.
No invitación/aceptación/retirada ejecutadas: E-A03/HA-A02/HA-A03 permanecenabiertas.

### Etapa 2E.3 — intento autorizado detenido antes de escribir

- [x] E3-P01 Destino LOCAL54422/API54421,17migraciones, propietarioU3/versión1,
  candidato barber/active yperfilactivo,0secundarios/2cupos,8reservas/sin futuras ni enatención,
  sininvitaciones/transferenciaspendientes. Huellas de todas las tablas/catálogo registradas.
- [x] E3-W01 Preparación Web resuelta por E3-R01 y E3-F03. Antecedente: sesión GoTrue obtenida desde formulario;
  verificador terminó conerrorgenérico antes delprimer comando. Sesión propia cerrada204.
  Revisiónestática: espera botónElegir aunque contexto autoselecciona membresíaúnica deU3.
  EstadoDOM exacto no capturado; no atribuir falla aAuth/Edge ni reparar elproducto.
- E3-W02 Antecedente de parada: invitación/avisoMailpit/aceptación/replay/retirada no ejecutados en ese intento. Negocio resuelto por E3-C/F/M; entrega Mailpit desconocida centralizada en E3-R03.
- [x] E3-S01 VerificaciónfinalREADONLY: todas las huellas negocio/identidades/catálogo/
  historial/.env.local iguales; candidato conserva misma membresía barber/active, perfil,
  propietarioU3 y0secundarios.37reservas/40detalles/24care conservados. Sin auditoría nueva.

Evidencia `contracts/team-authority-2e3-result.json`. Se respetó parada: un intento, sin
reintento ni reparación. Necesita permiso para corregir SOLO verificador/diagnósticos y
ejecutar un nuevo intento delmismo alcance. No repetir sin autorización. U5/U6 intactos.
E-A03/HA-A02/HA-A03 permanecen abiertos; no cierre2E/011 ni nuevas escrituras autorizadas.

### Reintento 2E.3 autorizado — detenido en entrega de correo

- [x] E3-R01 Corregido solo verificador: reconoce selección automática, verifica contexto/rol
  y actor/capacidades porEdge antes deescribir. Cuatro regresiones aprobadas. Primerintento intacto.
- [x] E3-R02 Baseline revalidado; U3 ycandidato autentican conGoTrue real desdeChrome.
  Selección correcta ycapacidades owner/barber comprobadas HTTP200, sin service_role comoactor.
- [ ] E3-R03 Una invitación enviada porUI, HTTP200: fila pendiente42acf7f0-15f6-4cff-940d-2fc144e715cc.
  Entrega unknown,0avisos correspondientes enMailpit (HTML ytexto revisados). Paso deentrega NO aprobado.
  Incompatibilidad comprobada: guardadeladaptadorLOCAL exige@example.invalid; correo ficticio
  delcandidato no cumple. Guardia anterioraSMTP arroja error yservicio registraunknown.
  Faltó comprobar este requisito enpreflight. No modificar correo, adaptador ni metadata automáticamente.
- [x] E3-R04 Aceptación/replay/retirada completados en E3-C/F/M; en este intento histórico no ejecutados. Sin reenvío.
- [x] E3-R05 Huellas negocio/identidades/catálogo/historial protegidas conservadas; candidato
  misma membresía barber/active, perfilintacto,0secundarios, propietarioU3versión1.37reservas/
  40detalles/24care intactos, otrasbarberías/U5/U6 sin cambios. Nuevas filas autorizadas:
  1invitación/1metadataMail/1sello; eventos deautoridad siguen8. Ambas sesiones propias cerradas204.

Evidencia `contracts/team-authority-2e3-retry-result.json`. No adaptar aplicación alverificador.
Hace falta autorización independiente para soluciónacotada delcorreoLOCAL ytratamiento explícito
deinvitación ya pendiente; no repetirinvite ni reenviarunknown, aceptar, retirar oborrar poriniciativa.
HA-A02/HA-A03/E-A03 y2E/011 abiertos; aceptaciónmanualU6 conservada.

### Etapa 2E.4 — corrección LOCAL sin escrituras administrativas

- [x] E4-P01 GuarddeladaptadorLOCAL permite soloexample.invalid/example.test exactos;
  sender/development/Mailpit fijos yResend/Cloud/contratos/autorización intactos.
- [x] E4-T01 18 pruebas Deno dirigidas aprobadas;3 nuevasregresiones deSMTP+1 deservicio.
  Tipos/arquitectura/checkDeno/lint/formato aprobados. SinconectarSMTP real ni reiniciar/deploy.
- [x] E4-S01 Lectura de invitaciónexistente: pending/unknown,vigente,selloU3v1 correcto,
  candidato confirmado barber/active. Huellasnegocio/identidades/catálogo/historial intactas.
- [x] E4-P02 Contrato de reenvío revisado: unknown bloquea claim; no reenvío automático.
  Puede aceptarse desdebandejarecibida sin entrega sent, conautorización nueva yvalidaciónSQL.
- [x] E4-A01 Aceptación/replay/retirada autorizadas y completadas en E3-C/F/M.
  La entrega Mailpit unknown no se considera resuelta: permanece en E3-R03.
  No crear otra invitación ni cambiar estados por esta reconciliación.

Detalle enúltimasección decontrato011. La corrección es fuente/test, no prueba deentrega
enworkeractivo. No nuevas sesiones, avisos ocomandos administrativos en2E.4. 2E/011 abiertas.

### Continuación 2E.3 — invitación existente aceptada; error Web posterior

- [x] E3-C01 Revalidación LOCAL de la misma invitación pending/unknown, vigente, destinatario
  correcto/selloU3v1; baseline yhuellas protegidas. Sin nueva invitación ni reenvío.
- [x] E3-C02 Login real del trabajador desdeChrome/GoTrue, identidad/contexto verificados;
  aceptación desdebandeja HTTP200, misma membresía administrator/active, capacidadsecondary
  HTTP200 y1/2cupos. Sin facultades gestionaradministradores/equipo/transferirpropiedad.
- [x] E3-C03 Panel Web corregido y verificado por E3-F01–F03; antecedente: mostró «No se pudieron consultar los
  permisos». Timeout delverificador esperando «Administrador secundario». Causa no demostrada;
  parada sin reparar ni repetir. No dar poraprobada esta transiciónWeb.
- [x] E3-C04 Replay y retirada completados en E3-F04 y E3-M03; no ejecutados en este intento histórico.
  El trabajador permanece administrator/active,1secundario; nueva autorización requerida.
- [x] E3-C05 VerificaciónREADONLY final:37reservas/40detalles/pagos/perfilesprofesionales/
  personales/propietarios intactos porhuellas. Solo membresía objetivo cambió; otrasmembresías
  e invitaciones intactas. Invitaciónaccepted/entregaunknown, auditoría8→9 con unaccepted-administration,
  eventos anteriores intactos. Auth200/DBhealthy; sesiónpropia cerrada204. SinCloud/Android/servicios.

Evidencia `contracts/team-authority-2e3-existing-result.json`. No repetir aceptaciónUI,
crearotra invitación ni reenviarunknown. SMTP no acreditado. 2E/011 yHA-A02/HA-A03 siguen abiertas.

### Continuación 2E.3 — corrección de contexto y replay; parada del verificador

- [x] E3-F01 ErrorWeb reproducido sin escrituras. Auth/membresías/autoridad200 y decoder
  correcto. Excepción capturada en run tras resultado de contexto antiguo; catch borraba
  autoridad actual. No se atribuye a Auth/Edge/SQL.
- [x] E3-F02 Corrección puntual: invalidar solo para el contexto todavía vigente, sin aceptar
  resultados antiguos ni debilitar denegaciones actuales.10regresiones RED→GREEN,52pruebas
  dirigidas/tipos/lint/formato/grafo aprobados. Diseño yservidor intactos.
- [x] E3-F03 Chrome real confirma secundario sin controles exclusivos ydenegación deequipo;
  U3 consulta owner200 y accede a /staff?view=team con1/2cupos yopciones de retirada.
- [x] E3-F04 UN replayHTTP200 de la aceptación existente. Todas las huellas yfilas dehistoria
  iguales antes/después;1secundario, misma membresía y9eventos. NO repetir este replay.
- [x] E3-F05 Retirada inicialmente no ejecutada: auxiliarwaitCapture ausente enverificador adaptado,
  fallo tras pulsar confirmación yantes de emitir remove-secondary (contador0). Parada sin
  reparación/reintento. Resuelto después con nueva autorización: verE3-M01–M06 y evidenciaremoval.
- [x] E3-F06 READONLY final: todas las membresías ytablas de negocio conservadas,37reservas/
  40detalles/pagos/perfiles/propietarios intactos. Candidato administrator/active,1secundario,
  invitaciónaccepted/unknown,9eventos. Auth200/DBhealthy, ambas sesionespropias cerradas204.

Evidencia `contracts/team-authority-2e3-web-replay-result.json`. Sin nueva invitación/reenvío,
Cloud/Android/servicios alterados. SMTP separado. E-A03/HA-A02/HA-A03 y2E/011 siguen abiertos.

### Cierre técnico 2E.3 — única retirada pendiente completada

- [x] E3-M01 Verificador inicializa waitCapture antes de accionar controles y exige respuesta
  HTTP200/cuerpo válido; confirma éxito solo después deSQL.11 regresiones con dobles aprobadas,
  incluidos HTTPfallido/errornavegador/timeout sin reintento. Comprobaciónno-undef detecta el
  fallo delguion anterior y aprueba el nuevo. Tipos/lint/formato/grafo correctos. Sin cambios deApp/servidor.
- [x] E3-M02 PreflightREADONLY: propietarioU3, misma membresíaadministrator/active,1secundario,
  perfil activo, invitaciónaccepted/unknown,1evento deaceptación y0eventos deretirada. Huellas
  coinciden con parada anterior;8reservas delshop,0futuras confirmadas/0enatención.
- [x] E3-M03 UNA retirada desdeChrome/U3/GoTrueLOCAL en /staff?view=team, destino explícito
  «Conservar como barbero» ymotivo de prueba. HTTP200; misma membresía vuelve abarber/active,
  propietario intacto y0de2cupos ocupados. Sin nueva aceptación/replay/invitación/correo.
- [x] E3-M04 HTTP200 del trabajador devuelvebarber; PostgreSQLREADONLY confirma nueve
  capacidades administrativasfalse. Chrome deniega equipo; perfil propio yhorariosHTTP200,
  perfil profesional leído porUI sin guardar. Sesiones propiasU3/trabajador cerradas204.
- [x] E3-M05 Auditoría9→10, exactamente unremove-secondary deU3 al trabajador destinobarber/active,
  eventos previos intactos; invitaciónaccepted ymetadataunknown conservadas. Huellas de todas
  las demás membresías/barberías/perfiles/servicios/37reservas/40detalles/atención/pagos iguales.
  Tabla completa demembresías vuelve a su huella anterior a lapromoción. Auth200/DBhealthy.
- [x] E3-M06 Prueba administrativa2E.3 técnicamente completada con evidencias acumuladas,
  separando ejecución real de11dobles. No cerrar automáticamente2E/011/T008/HA-A03 ni repetir
  operaciones acreditadas. SMTPunknown sigue pendiente aparte; transferenciafinal/Cloud excluidos.

Evidencia `contracts/team-authority-2e3-removal-result.json`; detalle ignorado en
`.artifacts/team-authority-2e3/removal-only/`. No volver a ejecutar el operador: estado ya restaurado.


## Extensión Cloud: administradores con invitación dentro de BARBEXA

- [x] CA-P01 Gate Cloud independiente y vinculado a invitaciones, default cerrado.
- [x] CA-P02 Apartado localizable; permisos verificados; panel compartido Web/Android.
- [x] CA-P03 Canal in-app sin proveedor ni llamadas de mail; aceptación expresa existente.
- [x] CA-P04 Pruebas de gate, canal sin mail, recepción/acciones y regresiones.
- [x] CA-A01 Activación autorizada24nov. Cloud ya tenía funciónv6/fuentes y tres flags correctos; no desplegar de nuevo. Reiniciar solo Metro con ambos flags cliente; .env.local intacto.
- [x] CA-A02-W Sesión Web existente confirma propietario0/2, formulario administrativo y consulta de invitaciones vacía; sin mutaciones de acceso.
- [x] CA-A02-W2 Recorrido funcional manual Web de los cuatro perfiles aceptado por el usuario el24/11/2026.
- [ ] CA-A02 Completar aceptación Android física tras activación; no repetir Web aceptada.

Detalle y límites: cloud-admin-in-app.md. No realizar promoción ni invitación real de prueba.
