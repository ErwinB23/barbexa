# Fundación de oferta y puertos — 004, T001–T007

## Estado vigente — 15/11/2026

Actualización funcional posterior: **28/34**, sin nuevas casillas cerradas. Se corrigió
el manejo de un fallo al generar el identificador seguro de cancelación antes de enviar:
el control ya no queda ocupado ni anuncia un resultado incierto sin solicitud enviada.
Regresión con doble de generación fallida; no se canceló ni modificó ninguna cita real.
No se atribuye este defecto a la discrepancia previa de T027. T013/T027 y el resto de
gates permanecen abiertos para el recorrido integral. Rediseño detenido por el usuario.

La propuesta aprobada sí exige atención, cobros manuales y reembolsos;004 los excluye.
Se preparó [005](../../../../specs/005-atencion-pagos-manuales/spec.md), solo borrador
funcional aclarado; no pagos/atenciones implementados ni esquema financiero aplicado.
Las tres reglas nuevas fueron respondidas por el usuario, sin autorizar aplicación SQL.

**28/34**. T028 caché comercial, T029 calidad y T031 preparación CI/guía completadas.
[Caché](cache.md), [calidad y discrepancias](calidad.md), [pipeline](reproduccion.md).
T013/T027 quedan pendientes pese a declaración manual positiva: la lectura posterior
mostró invitación pendiente y citas manuales confirmadas/cero eventos. No se mutaron.
Revisión reservada al único recorrido final, sin repetir ahora registros/citas/cancelaciones.
T030 espera recuperación real003/accesibilidad; T032/T033 publicación/carga autorizadas;
T034 cierre final. El pipeline no fue publicado/ejecutado remotamente.
Check general0,157 unitarias,160 cliente,36 Deno; núcleos cliente100% líneas/funciones y
servidor100% líneas/funciones/ramas. No atribuir pruebas con dobles/bundles a UI física.
00327/36 tras implementar recuperación; correo real/retorno aún no acreditados. Sin
Cloud, migraciones, datos de negocio nuevos/borrados, servicios reiniciados, paquetes/APK ni Git writes.
Se preservan siete sintéticas y T019;9 avisos npm no remediados. Historial inferior conservado.

## Estado vigente — cancelación local preparada

**25/34**. T023 cerrada por validación manual del usuario Web/Android, sin repetir reservas.
T024–T026 verificadas: RPC/Edge/casos de uso/UI de cancelación, política snapshot y motivo
staff; T027 espera las dos cancelaciones manuales. T013 espera publicación/invitación.
SQL12/12,48 pruebas dirigidas+8 adaptador,3 unitarias,9 Deno,13 comprobaciones de integración
inicial+1 política histórica+8 Barbero. Rol A restaurado exactamente;7 sintéticas conservadas
(2 manuales aún confirmadas), citas T019 intactas. [Evidencia](cancellation.md),
[único recorrido](t024-t027/recorrido-manual.md). No T028+, Cloud, servicios reiniciados,
paquetes/APK, git add/commit/push. Riesgos npm/recuperación003/URL Auth antigua pendientes.
Los apartados siguientes conservan la cronología previa.

## Estado vigente T020–T023

**21/34**. T019 cerrada con evidencia manual del usuario Web/Android; T020–T022
verificadas técnicamente. T013 espera oferta/invitaciones y T023 la demo UI de agendas.
Migración local nueva de dos funciones de consulta, sin cambios RLS/ACL históricos/datos.
SQL4/4, HTTP12 comprobaciones, roles9 con JWT reales y restauración exacta/residuos0;
44 tests dirigidos y calidad0, grafos Web/Android200. Conjunto T019 conservado.
[Resultados y límites](agenda.md), [único recorrido de agenda](t020-t023/recorrido-manual.md).
Nueve avisos npm y recuperación003 pendientes. No se ejecutó T024+.
Los apartados siguientes conservan los estados anteriores y sus incidencias.

**Corrección posterior de hidratación:** conservar el Stack oculto todavía montaba
consumidores antes de crear BookingContext. Los wrappers de reserva/oferta esperan ahora
runtime y sesión ready antes de montarlos.6 RED→GREEN;47 pruebas dirigidas y calidad0.
Pendiente F5/entrada directa real Web y regreso Android: [causa y único recorrido](t017-t019/route-hydration.md).
T013/T019 siguen abiertas,17/34; no se repitieron reservas ni se cambiaron servicios/datos.

**Actualización de navegación:** el usuario acreditó reservas reales Web y Android.
Se corrigió la retirada de rutas privadas durante verificación al reanudar, sin cambiar
autorización ni servicios.31 pruebas dirigidas y21 unitarias afectadas aprobadas; pendiente
validación manual del arreglo. T013/T019 continúan abiertas,17/34. [Causa y recorrido único](t017-t019/navigation-resume.md).

## Estado vigente T017–T019 — 14/11/2026

**17/34**: T017/T018 cerradas técnicamente; T013/T019 esperan recorrido real Web/Android.
Reserva cliente conectada a Edge nueva→RPC atómica existente, sin SQL adicional. Ocho RED
T014→GREEN,147 unitarias,53 dirigidas,7 servidor y9 TAP HTTP real; tipos/lint/formato/grafos0.
Paquetes/APK/Cloud/RLS/JWT/Kong intactos. Credenciales únicamente en archivo local ignorado;
3 cuentas y3 citas ficticias conservadas, sin cleanup antes de confirmación del usuario.

**Incidencia recuperada:** Docker dejó de responder; el usuario restableció el motor.
Auth200 y Edge nuevo operativo tras iniciar solo su contenedor existente, verificado y aislado.
API204/401/403 esperados;3 citas conservadas. Otros contenedores y Metro no se operaron.
[Resultados, límites y ruta crítica](t017-t019/resultado.md),
[único recorrido](t017-t019/recorrido-manual.md). Próximo T020–T022; demo T023 espera T019.
003 permanece24/36; recuperación y nueve avisos npm siguen pendientes. Historial abajo.

## Estado vigente T012–T016 — 14/11/2026

**15/34**. T012 y T014–T016 cerradas; T013 abierta por evidencia funcional Web/Android.
Cliente de oferta conectado a Auth/contexto y backend existentes; SQL atómico nuevo solo
en local: reservas/items/eventos, RLS/ACL, slots y confirmación transaccional por persona
física global. Diez pares reales sin doble ocupación; idempotencia, rollback y privacidad.
137 unitarias y23 integración/UI afectadas,18 SQL estructurales; tipos/lint/formato/grafos0.
La ejecución integral T016 terminó1 por expectativa HTTP404 equivocada; comprobación
complementaria sobre los mismos datos confirmó500/P0002 y0 parciales, exit0. Historial
conservado, no se declara una repetición integral verde. Ocho RED de aplicación esperan
T017. [Resultados](t012-t016/resultado.md), [motor/limpieza/límites](atomic.md).

Único conjunto nuevo autorizado5 cuentas/2 barberías/17 citas retirado selectivamente;
dos cuentas anteriores y perfiles conservados, sin residuos ficticios de ese conjunto.
Sin Cloud, paquetes, APK, correos, commit/push o cambios del log activo. Nueve avisos npm
siguen pendientes. Próximo: T017→T018; agenda T020–T023 para demo Android→Web.003 sigue24/36,
con recuperación requerida antes de evaluación. Los estados siguientes son históricos.

## Estado vigente T008–T011 — 14/11/2026

**11/34**. Bloque completado: operaciones/RPC de oferta e invitaciones con autorización
contextual, aceptación explícita y carreras reales. SQL23/23, HTTP9/9 TAP,27 servidor
(10 nuevas), núcleo nuevo100% líneas/funciones/ramas, tipos/lint/formato/grafos0.
Único conjunto autorizado:4 cuentas y2 barberías retiradas selectivamente; cero datos
de negocio nuevos residuales y datos anteriores conservados. Dos migraciones aditivas
aplicadas solo en local; la segunda corrige una regresión de visibilidad sin alterar historia.
[Resultados y límites](t008-t011/resultado.md). Ninguna pantalla o reserva nueva todavía;
T012+ no ejecutadas. Nueve avisos npm siguen pendientes, sin Cloud/paquetes/APK/commit/push.
Los apartados siguientes conservan el estado anterior7/34 y sus evidencias.


**Estado:7/34 completadas**,14/11/2026. Revisión inicial satisfactoria con la autorización
condicional del responsable. Cancelación120min configurable, invitación interna consentida,
administrador profesional explícito y exclusión física global/privacidad coherentes.
No se amplía el alcance a T008+ ni se presenta el MVP como implementado.

| Tarea | Evidencia y resultado |
| --- | --- |
| T001 | Git main/0ccd33c,1393 archivos inventariados, estado local previo preservado; [integridad](integridad.json). |
| T002 | Destino/herramientas/DDL existentes revisados, PostgreSQL17.11, CLI3.1.0, Deno2.9.8 y extensión disponible; [preparación](preparacion.md). |
| T003 | Runner extendido sin romper modos002, RED→GREEN23/23 con regresiones; guardas de destino/JWT/rollback y barrera; [runner](runner-green.log). |
| T004 | RED real del esquema:22 fallos esperados de63 por objetos ausentes, no un fallo de infraestructura; [RED](schema-red.log). |
| T005 | Migración CLI20261114195018_booking_catalog.sql, DDL primero validada con rollback, preview solo local y aplicación0; [ejecución](migracion-aplicacion.log). |
| T006 | Tipos/puertos propios de oferta/reservas en cliente/servidor, dinero entero/PEN, UTC y snapshots;134 unitarias y5 servidor, tipos/grafos0. |
| T007 |108/108 SQL nuevas y336/336 regresiones002, catálogo/ACL, cero fixtures residuales, datos anteriores conservados; [ACL](acl.md). |

## Componentes y verificaciones

Ocho tablas: barbershop_booking_settings,services,barber_profiles,barber_services,
barbershop_hours,barber_schedules,schedule_exceptions,staff_invitations. Solo local;
ninguna migración histórica modificada. Cero tablas/RPC de reservas y cero UI de negocio.

Núcleos nuevos en src/features y supabase/functions/_shared, módulos barbershop-operation
y reservations: valores, tipos, puertos específicos. No SDK/HTTP/SQL/framework en el núcleo.
Los checkers detectaron imports cruzados de dominio; se corrigieron con tipos propios
por módulo y actor propio en la frontera. La futura composición adaptará el actor validado
por Auth002; no se duplicó autenticación ni se cambió una regla del checker.

Cliente:134/134 unitarias del runner existente,100% líneas/funciones y93,93% ramas del
núcleo cubierto. Incluye129 regresiones rápidas existentes y5 nuevas; no E2E repetidas.
Servidor:5/5 pruebas Deno nuevas y contratos comprobados sin npm/remoto. Cobertura del
núcleo no se atribuye a UI/SDK/Hermes ni al SQL. Tipos, lint, formato y ambos grafos0.
Grafo cliente78 módulos/24 core/185 aristas; servidor19/12/33. [Comandos/códigos](verificaciones.json).

## Fallos iniciales y correcciones

1. CLI/symlink de pruebas restringidos por sandbox: repetición autorizada, sin instalar nada.
2. Primer SQL sin pgTAP en la transacción: no_plan ausente; se incorporó setup de prueba
   que también termina en rollback. Después se obtuvo RED por esquema ausente.
3. Primer GREEN de acceso falló por literal de fecha de la fixture UNION resuelto como
   texto. Cast timestamptz explícito; conservado [primer intento](schema-primer-intento.log).
4. Nuevos tests de transacción detectaron variantes COMMIT WORK/END y metacomandos;
   guardas corregidas sin relajar tests. Solo archivos fijos revisados, no SQL arbitrario.
5. Primer núcleo dio TS2307 por tipos aún ausentes; luego GREEN. Los grafos detectaron
   dependencias cruzadas prohibidas y lint detectó orden/duplicación de imports; corregidos.
   Historial en core-red.log, architecture-*-inicial.log y lint-inicial.log.

## Estado conservado y siguiente bloque

No Cloud, proyecto anterior, cuentas persistentes, correo, dependencias, APK, servicios
reiniciados, log activo editado, staging, commit o push. Se conserva el trabajo00324/36;
T014/T019/T023 y recuperaciónT028–T032 siguen pendientes, sin nuevas afirmaciones.
Nueve avisos npm moderados no remediados; no auditoría de dependencias aprobada.

Siguiente bloque ejecutable propuesto: **T008–T011**, RPC/servidor de oferta e invitación
con aceptación y pruebas SQL/HTTP. Después UI T012–T013 y confirmación atómica T014–T017,
sin esperar decoración visual. La demo cliente Android→agenda administrador Web requiere
además T018–T023; la recuperación003 debe estar lista antes de evaluación. Ninguna de
estas tareas futuras se ejecutó aquí.

[Revisión final de integridad, secretos y enlaces](revision-final.json): sin diferencias
inesperadas frente a1393 archivos de línea base; solo runner y estado compartido cambian
entre los archivos preexistentes. El trabajo003 queda intacto. Sin hallazgos de patrones
sensibles en el alcance revisado; esto no certifica seguridad. Diff global2 por el log
activo conocido, excluyendo únicamente ese archivo0. Staging sin contenido, main/0ccd33c;
sin commit ni push. El checklist de especificación16/16 es histórico de calidad documental,
no una afirmación de que las34 tareas estén implementadas.
