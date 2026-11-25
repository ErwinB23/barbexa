# Barbexa — Fase 0: matriz funcional y finalización Web

## Versionado y reproducibilidad cerrados — 25/11/2026

Este bloque establece el estado vigente; los bloques inferiores conservan evidencias
históricas. Se preservaron íntegros los17 commits originales y los21 aceptados antes
de este cierre. Agrupación elegida por dependencias reales, sin inventar etapas:

| Commit | Contenido |
| --- | --- |
| 57177d1 | Exclusiones y protección de archivos locales; retirada solo del índice |
| cd3b8d6 | Implementación integrada, pruebas, cobertura y contratos REST compartidos |
| ce8d828 | CI de calidad, cobertura, OpenAPI y exportación Web |
| 03c5c67 | Política LF explícita; logs y binarios preservados |
| 9192d1a | Temporales aislados/autolimpiables y Docker por PATH en helper local |
| Commit documental final | Contexto, SDD ya aprobados y evidencias pendientes |

Total final:23 commits en main, sin remotos ni publicación. La separación artificial
de funcionalidades con contratos/configuraciones compartidos se descartó para
mantener el checkout completo y reproducible. No se reescribió ningún commit.

Desde checkout independiente de9192d1a: npm ci y npm run check exit0; cliente493/493
y presentación652/652 (solapan),96 Deno, arquitectura y entorno aprobados. Cobertura
cliente100/100/93,1425%, servidor100/100/100%; OpenAPI y export Web exit0. El commit
documental no cambia el árbol ejecutable probado. Detalle: evidencia004/reproducibilidad.json.
No se crearon carpetas manualmente para superar gates ni se bajaron umbrales.

Se retiraron553 entradas del índice conservando sus físicos:552 herramientas .agents
y el log activo; se retuvieron300 logs académicos y skills-lock.json. Persisten
autores/correos y rutas locales en historia,104 logs actuales con rutas. No hay
secretos privados reales confirmados; la decisión de privacidad y la publicación
son independientes. Sin push, Cloud, migraciones, datos reales, despliegue o k6.

### Historial original conservado

Fechas registradas por Git, America/Lima. Se conservan los autores/fechas reales.

| Commit | Fecha/hora real | Funcionalidad registrada | SDD |
| --- | --- | --- | --- |
| 7dfbe36 | 10nov14:00 | Fundamentos y Spec Kit | Base |
| 5b6b5d3 | 10nov14:05 | Skills de desarrollo | Herramientas |
| 86ccdd4 | 10nov14:42 | Especificación y plan inicial | 001 |
| b748484 | 10nov21:46 | Expo58 | 001 |
| 16b2a7c | 10nov22:15 | Calidad/componentes base | 001 |
| 904ff3d | 11nov00:09 | Navegación y Android | 001 |
| d585e78 | 11nov15:11 | Núcleo Clean e integración UI | 001 |
| 66c2f39 | 11nov17:21 | Accesibilidad/interfaz Android | 001 |
| c110559 | 11nov17:55 | Cierre y evidencias | 001 |
| e0141cb | 11nov18:23 | Análisis backend anterior | Referencia |
| 9938bb8 | 11nov20:29 | Especificación/plan multitenant | 002 |
| eb2d605 | 12nov22:32 | Infraestructura y seguridad;1 migración | 002 |
| 2f37266 | 12nov23:42 | Identidad/perfiles;1 migración | 002 |
| 477b360 | 13nov03:52 | Barberías/RLS;3 migraciones | 002 |
| 42a695c | 13nov05:28 | Checkpoint T034–T038 | 002 |
| 7ce4e1a | 13nov11:49 | Cierre de fundación | 002 |
| 0ccd33c | 13nov16:50 | Preparación de autenticación | 003 |

Fecha: 21/11/2026. Referencia maestra para trabajar por bloques; actualizar solo las filas
afectadas. No constituye autorización de implementación ni de operaciones sobre datos.

## B5 — cierre funcional acreditado en Web LOCAL

21/11/2026, 18:06 Lima. B5.2 cerrado y B5.3 se mantiene cerrado funcionalmente Web LOCAL.
B1–B5 terminados en este alcance; se reutilizan sus evidencias anteriores sin repetirlos.
Los 22 comandos de B5.2/B5.3 quedan ejecutados y acreditados íntegramente. La evidencia
pendiente B2 de retirada de oferta queda cerrada (no confundir con repetir el Bloque B2).

Barbería B5 Cierre Web LOCAL validado, UUID f3c7f90f-cb85-4a88-86ce-ec27ec3ba8a6, propietario U3.
Se conservó la retirada anterior HTTP 200, published/v17 → withdrawn/v18, sin repetirla.
Esta continuación ejecutó UNA republicación desde Chrome con sesión GoTrue LOCAL auténtica
de U3: HTTP 200, requestId 9702e255-90f2-4598-a228-ac5c073fbb9c, PostgreSQL published/v19.
Mismo UUID y propietario. Dos transiciones adicionales autorizadas completadas en total.

Solo se corrigió el verificador: el SQL vigente deniega catálogo/slots con P0002/NOT_AVAILABLE,
que PostgREST transporta como HTTP 500. Se exige exactamente esa respuesta, RPC de lectura,
tenant correcto y estado withdrawn; otros 500/códigos/mensajes/payloads se rechazan.
Cuatro regresiones dirigidas aprobadas; sin cambios de producto, SQL, RLS ni Edge.

Chrome cliente en contextos nuevos, sin caché HTTP: retirada ausente en Explorar y Reservar;
catálogo/slots denegados con 500/P0002/NOT_AVAILABLE. Tras republicar reaparece, catálogo y
slots HTTP 200; selección de servicio/profesional y consulta Web de horarios disponibles.
No se eligió ni confirmó una reserva. No se repitió N2 ni ninguna operación anterior.

Lectura independiente final: 42 reservas y 45 detalles, todas sus huellas intactas;
29 atenciones, 71 eventos de atención, 55 eventos de reserva, 14 usuarios, 13 perfiles,
15 membresías y 9 barberías. Pagos, servicios/precios, horarios, cierres, propietarios,
membresías y otras barberías intactos. Cero INSERT/DELETE de negocio. Solo cambió la fila
de settings del tenant objetivo: estado restaurado published y versión 17 → 18 → 19.
Esquema/historial de 18 migraciones/.env.local intactos. Tres sesiones propias cerradas
HTTP 204; cero sesiones nuevas restantes. Sin Cloud, Android, correos, dinero real,
reinicios, instalaciones, migraciones, commit, push ni despliegue.

Trazabilidad de publicación: actor, requestId HTTP y snapshots PostgreSQL/versiones;
el contrato vigente no añade eventos dedicados de publicación. No afirmar dos eventos
SQL nuevos ni crear auditoría paralela. Auditorías existentes, incluida N2, conservadas.

Matriz de 48: **40 VERIFICADA, 0 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL, 4 NO APLICA,
3 BLOQUEADA y 1 PARCIAL**. El cierre funcional Web LOCAL no cierra automáticamente las
tareas académicas conjuntas, Android, aprobación visual pendiente, SMTP administrativo
unknown, transferencia de propiedad, entrega pública/HTTPS/Cloud ni medición inicial/F5.
Evidencia vigente: docs/evaluacion/evidencias/004-reservas/b5-cierre-web-local.md y .json.
El informe b5-retiro-republicacion conserva el intento detenido como antecedente histórico.
Detenerse después del informe; no iniciar otras etapas.

## B5.2 — implementación y ensayo aislado (antecedente previo a activación)

**B5.2 — retirada de cierres implementada y ensayada en aislamiento (20/11/2026, Lima).**
Contrato aprobado: anulación lógica, motivo obligatorio, un evento append-only en
team_authority_events y replay200 sin nuevas escrituras, incluso bajo concurrencia.
Owner/secundario con editHours; sin poderes nuevos para cliente/profesional. Original
conservado; no altera reservas y mantiene las demás restricciones de disponibilidad.

Casos/puertos, adaptadores cliente/servidor, Edge y panel Web /schedules conectados,
con listado paginado, historial, confirmación y reconciliación por lectura ante fallo.
Migración nueva 20261121040559_administrative_closure_withdrawal.sql: NO aplicada a
LOCAL principal ni Cloud. El panel necesita esa activación antes del recorrido real;
una RPC ausente se muestra como error recuperable, nunca como éxito/listado vacío.
Renombrado Web previo conservado, no reimplementado. Sin cambios Auth ni UI Android.

SQL real PostgreSQL17.11 en base desechable separada (OID distinto, cero datos Auth
copiados, fixtures sintéticos):16 grupos aprobados, incluidos permisos/ACL,404, motivo,
historial, idempotencia, disponibilidad, paginación y dos conexiones concurrentes con
espera de bloqueo observada: una transición/un evento. Base desechable eliminada.
Edge Request/Response + SQL real:401/403/403/404/200/200, Auth y transporte PostgREST
con dobles; NO Edge desplegada/GoTrue/Chrome. Cliente y servidor automatizados aprobados;
comandos/resultados exactos e inventario en004/b52-retirada-cierres.json y .md.

LOCAL principal conserva41 reservas/44detalles/28care/67care_events/54reservation_events,
usuarios/perfiles/membresías/configuración, huellas de negocio, catálogo e historial17 y
env intactos. Cero comandos del ensayo22 ejecutados; sin crear «B5 Cierre Web LOCAL»,
cuentas, sesiones, correos o reservas en la principal. Sin Cloud/servicios/Git writes.

Los22 comandos están preparados a nivel de código/contrato, NO habilitados ni ejecutados
en principal: primero autorización/activación de la migración y comprobación Edge LOCAL,
después permiso específico de negocio y Chrome. Retirada futura=withdraw-shop-closure,
conservar cierre withdrawn +un evento team_authority, no borrar fila ni añadir care_event.
Conteos finales previstos42reservas/45detalles permanecen condicionales al ensayo futuro.
Matriz48:34VERIFICADA/6SIN VALIDACIÓN INTEGRAL/4NO APLICA/3BLOQUEADA/1PARCIAL;
ninguna nueva aceptación Web de escritura. B5/004 y gates conjuntos siguen abiertos.
SMTP administrativo/transferencia/Android/aceptación visual separados. Detenerse al informe.

## B5.2 y B5.3 — preparación dirigida de las seis ramas (histórico)

20/11/2026, America/Lima. **Solo preparación; ninguna escritura de negocio autorizada ni ejecutada en esta etapa.** Lectura PostgreSQL LOCAL con transacciones repeatable read/read only y una sesión auténtica U3 en Chrome para inspeccionar cinco formularios sin guardar. Final: **41 reservas/44 detalles**,28 care/67 care_events/54 reservation_events,8 barberías/14 usuarios/13 perfiles/14 membresías/8 invitaciones; mismas huellas de negocio que B5.1 antes/después, esquema/migraciones/env intactos. Sesión de lectura cerrada204, cero nuevas restantes; sin operaciones de servicios. Evidencia:004/b52-b53-preparacion.json. No repetir B1–B4, login ni recepción Yape.

### Brechas demostradas y correcciones propuestas, todavía NO autorizadas

1. **Renombrar desde Web falta.** El campo shop-name de /barbershop-admin crea OTRA barbería, no edita la seleccionada. El caso renameBarbershop, adaptador PATCH y RLS ya existen en002/011; faltan control específico y composición con OperationApplication. Crear/configurar contacto/dirección/políticas sí existe. Propuesta: conectar el caso existente mediante un control separado, con contexto/permisos verificados y recarga; sin nueva SQL ni cambios Auth. No declarar renombrado acreditado por guardar configuración.
2. **Retirar cierres administrativos falta en Web y backend.** /schedules solo crea set-exception; la unión cerrada de comandos y el esquema LOCAL no ofrecen eliminarlo. Introspección encontró set_booking_exception y remove_own_booking_block, este último limitado al profesional propio009. No usarlo para simular retirada administrativa. Propuesta pendiente de aprobar: listar cierres del tenant y una operación administrativa cerrada por ID/tenant (nombre propuesto remove-exception, NO API existente), autorización editHours del servidor, locks/versión, conservación de reservas y wrapper privilegiado estrecho. Requiere contrato, nueva migración LOCAL, Edge/cliente y regresiones; no tocar migraciones históricas ni ampliar DELETE directo al navegador. Definir en ese cambio la evidencia de retirada; no inventar una tabla de auditoría que hoy no existe.
3. **Corrección documental de ruta:** CareSettings está realmente en **/agenda** para administración; ahí se inspeccionaron instrucciones Yape y tolerancia10 mediante care/settings200. /barbershop-admin no contiene ese formulario. No es un defecto de producto.

Estas dos brechas impiden prometer el cierre de las seis ramas solo con pruebas de funciones existentes. Nada se corrigió en producto en esta preparación. SMTP administrativo y transferencia de propiedad siguen pendientes separados.

### Escenario único propuesto e identidades

- Administrador **U3 74a05d0a-f21f-44f5-8de2-549ba4dba76f** y cliente **aecfc300-c0ca-4005-bbda-d59c7ac2df69**: cuentas ficticias confirmadas/perfil existente y credenciales de prueba disponibles. Una sesión por actor durante la ejecución, sin recuperación ni nuevas cuentas. U3 administraría y atendería solo con un NUEVO perfil profesional explícito en el tenant nuevo; no recibe atención por ser administrador automáticamente.
- Crear una sola barbería **B5 Cierre Web LOCAL**, renombrar una vez a **B5 Cierre Web LOCAL validado** y conservarla. Nombre de prueba disponible ahora; el contrato de creación exige solo name no vacío, no correo, unicidad comercial ni otro dato no definido. Usar el UUID real de la respuesta201. Creación inserta shop+membresía administrator/active+ownership+evento created atómicamente; settings nace al primer configure por booking_admin, no en la creación.
- Contacto **Contacto ficticio B5 LOCAL**, dirección **Dirección ficticia B5 LOCAL**, políticas notice0/horizon30/maxFuture30/step15/buffer0/cancel120. Son textos sintéticos aceptados por el contrato, no teléfono/domicilio reales.
- Servicio nuevo **B5 Servicio sintético**: crear S/25/15min y editar a **S/30/30min**, conservar activo. Perfil profesional nuevo **Profesional B5 LOCAL** para la propia membresía nueva de U3, una capacidad al servicio nuevo. Crear estos prerequisitos es setup del nuevo tenant, no repetir B4 para volver a acreditarlo.
- Horarios nuevos: local siete intervalos07:00–24:00; profesional siete08:00–23:45. Para edición administrativa ampliar local06:00–24:00 y restaurar07:00. La disponibilidad temprana NO se amplía porque limita el profesional: resultado esperado correcto. Un cierre nuevo del local mañana11:00–12:00 sí debe retirar slots solapados y su retirada restaurarlos. Reconsultar fecha/slots/clock al ejecutar; no hay horario reservado por este plan.
- Evitar cambiar horarios de0050: local y profesional original están24/7, por lo que reducir solo el local viola contención. Sus12reservas (incluida Yape) quedan protegidas. Hay otras barberías vacías draft, pero no se necesita alterar sus propietarios/membresías ni recuperar otras credenciales.
- Única edición temporal propuesta en un tenant previo: instrucciones Yape de **0050 4950d75f-e43b-459b-acf6-e138f9f051e1**, con U3 y restauración exacta. Tolerancia10 permanece; texto original solo en memoria, comparación SHA256 al terminar. Texto temporal: **B5 LOCAL: instrucciones ficticias temporales, sin transferencias.** No modificar sus ledgers/snapshots.

### Seis ramas: recorrido, efectos y acreditación requerida

| Rama | Existente / evidencia reutilizada | Recorrido Web que falta | Comandos y efectos propuestos | Restauración / evidencia final |
| --- | --- | --- | --- | --- |
| A Crear/editar | Formulario createOnly/configuración;002/011 creación/propiedad SQL, panel2E. Rename backend002 existe; falta Web | U3 crea tenant, configura campos y renombra el MISMO ID tras integrar el control | create-barbershop201 (4INSERT indicados); configure-shop200 (settings nueva y versión); PATCH rename200 sobre shop nuevo | No originales editados. Conservar nuevo shop/membresía/owner/audit/settings y nombre final; verificar owner U3,0secundarios y aislamiento. No transferencias |
| B Retirada | Estado withdrawn soportado; pausa/republicación B1 ya aprobadas | Publicar nuevo tenant solo como setup, retirar, cliente recarga/reconsulta descubrimiento/catálogo/slots sin datos de caché anteriores, republicar | 3set-publication200; solo settings/publication/version nuevas. Withdrawn desaparece de list_booking_barbershops y catálogo/slots por ID responde NOT_AVAILABLE; no emitir confirm para probar rechazo | Volver published sin restaurar contador. Las41reservas/44detalles siguen idénticos. No otra pausa/cancelación |
| C Servicios | /services crear/editar/toggle; descripciónB1 y snapshots/backend004 reutilizados | Nuevo servicio25/15→30/30, desactivar+guardar, reactivar+guardar; observar catálogo y slot estimado nuevo | 4upsert-service200:1INSERT service+3UPDATE de ese ID, más versión settings. Setup2comandos set-professional/set-capabilities200 crea solo perfil y vínculo nuevos | Conservar servicio activo30/30. No volver25/15: son valores iniciales de fixture nuevo, ningún histórico. Inactivo desaparece del catálogo; al reactivar reaparecen oferta/slots correctos |
| D Horarios/cierres admin | /schedules guarda local/profesional y crea excepción; backend004 y propioB4 ya acreditados | Inicializar horarios nuevos; ampliar/restaurar local; crear/retirar cierre del local tras implementar retirada | 2setup set-shop-hours/set-barber-hours200+2set-shop-hours200 temporal/restauración+1set-exception200+1retirada propuesta200. Cada reemplazo local borra/inserta7filas solo NUEVAS | Conservar7+7intervalos finales; IDs pueden cambiar y versiones suben. Cierre temporal final ausente, evidencia conID/huellas/HTTP; todos41previos intactos. NO ejecutar creación de cierre sin retirada segura disponible |
| Y Configurar Yape | CareSettings **/agenda**, settings200 en esta preparación;005roles/settings yB5.1 recepción reutilizados | Consultar, guardar texto temporal, recargar, restaurar exacto y recargar | 2care/configure200:2UPDATE a care_settings0050+2INSERT configured. Mantener noShowToleranceMin10 en ambos | Valor/hash original exacto, instrucciones de las41citas intactas. Conservar2eventos configured; no pago, correo ni cambios aYape externo |
| N Inasistencia | CareControl+SQL005;91checks reales previos de roles/límites;B2 atención no repetir | Cliente crea1cita NUEVA en tenant nuevo cash/pending30/30, U3 profesional asignado espera startsAt+tolerancia snapshot10min y pulsa Registrar inasistencia→Confirmar operación una vez | confirm201 inserta reserva+detalle+care+confirmed+created (5INSERT); no-show200 actualiza solo attendance del ledger nuevo y añade1care_event | Final reserva confirmed/atención no-show/pago pending/cash/S30. Conservar cita+historia, sin receive/start/complete/refund/cancel. No usarB5.1 ni otras41citas |

No-show no cancela ni devuelve dinero y no libera anticipadamente el rango ocupado: la reserva sigue confirmed y participa en la exclusión/disponibilidad durante su intervalo. Consultar un slot pasado no acredita liberación, porque tampoco se devuelve por regla temporal. Reutilizar evidencia SQL de este comportamiento; no crear una segunda reserva para probarlo. La hora del nuevo caso se elige al ejecutar entre slots futuros reales que quepan en horario; si no hay uno cercano, esperar apertura real o dejar este comando pendiente, nunca alterar reloj/tolerancia ni reservar retroactivamente.

### Orden mínimo y autorización futura

**22 comandos de negocio propuestos, cero ejecutados aquí.** Veinte tienen transporte actual; uno necesita conectar renombrado Web y uno requiere implementar retirada administrativa. Secuencia exacta en evidence.proposedCommands: create, configure, rename; create/edit service; set-professional+capabilities; horarios local+profesional; publicar; desactivar/reactivar servicio; editar/restaurar local; crear/retirar cierre; retirar/republicar oferta;2configure Yape0050;1confirm cash como setup de inasistencia;1no-show. No incluyen Auth, navegación ni lecturas. No atribuir a una única petición las operaciones preparatorias adicionales.

Autorizaciones separadas necesarias antes de ejecución completa:
1. Integración Web de renombrado reutilizando002, sin nuevo SQL; y contrato/implementación/pruebas de retirada administrativa incluyendo una migración LOCAL aditiva y actualización Edge LOCAL controlada. Revisar sus efectos exactos antes de aplicar; no están autorizados por este documento.
2. Los22comandos descritos y sus datos sintéticos:1barbería/1membresíaowner/1ownership/1evento de creación/1settings/1servicio/1perfilprofesional/1capacidad/7+7intervalos; reemplazos/eliminación solo de intervalos y cierre temporales NUEVOS;2ediciones/restauración Yape0050;1reserva/1inasistencia nuevas. Mantener todos los registros finales, sin limpieza automática. El contrato de retirada todavía debe fijar si añade auditoría propia; no inventar número total de filas de esa función inexistente.

Conteos finales condicionales: **42 reservas/45detalles**,9shops/14users/13personalprofiles/15membresías/9owners,29care/71care_events/55reservation_events, si retirada no añade eventos care/reservation. Incrementos de care:2configured+1created+1no-show; reserva:1confirmed. Conservar originales41/44 porhash y datosB4. No cambios a propietarios/membresías previos; la membresía nueva deriva de crear el tenant aprobado. Restaurar valores, no timestamps/versiones/UUID de intervalos. Capturar baseline fresco,IDs reales,respuestas y huellas poracción. Creación/upsert sin requestId no se deben repetir ante incertidumbre: leer estado persistido y detenerse, no reintentar a ciegas.

Para cerrar cada rama: comandos Web reales con actor/tenant correctos, HTTP esperado y SQL coherente, recarga Web de valores/estados, restauraciones exactas requeridas, efectos limitados y41reservas protegidas intactas; sesión propia cerrada. Para D además retirada administrativa real disponible y acreditada; para A renombrado real de mismoID. No cambiar casillas a verificadas por esta preparación. Matriz actualizada:34 VERIFICADA,4 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL,4 NO APLICA,3 BLOQUEADA y3 PARCIAL. Creación/edición y horarios/cierres pasan a PARCIAL por las dos brechas demostradas; ninguna nueva función acreditada. B5 global,005T012 y011 conjuntos siguen abiertos. Detenerse tras el informe; no ejecutar ni solicitar permisos implícitos para otras ramas.

## B5.1 — selección y recepción Yape Web acreditadas

**B5.1 acreditado funcionalmente en Web (20/11/2026, Lima).** Se ejecutaron exactamente dos comandos desde Chrome con sesiones auténticas de GoTrue LOCAL: confirmación de reserva Yape HTTP 201 por el cliente y recepción ficticia HTTP 200 por el profesional asignado. Cita 11ccc730-9194-4f8e-9007-1b2bd419718e, en «005 aislada 0», el 21/11/2026 de 11:00 a 11:15 Lima; servicio S/25 y 15 minutos.

Estado final: reserva confirmed, atención confirmed (sin iniciar), pago paid, método yape, importe 2500 céntimos PEN. Mis reservas mostró Pendiente y después Recibido; el cliente no obtuvo permiso de recepción. Agenda mostró el mismo importe y la confirmación explícita del profesional; después desapareció el control de segunda recepción. Auditoría: un evento confirmed, uno created y un único receive del trabajador, con capacidad barber, método yape e importe 2500. Efectos: seis INSERT, un UPDATE del ledger nuevo y cero DELETE.

Verificación final: 41 reservas, 44 detalles, 28 registros care, 67 eventos care y 54 eventos de reserva; 14 usuarios, 13 perfiles, 14 membresías y ocho invitaciones. Las 40 reservas y 43 detalles anteriores, pagos, atenciones, B2, A/B de B3, propietarios, membresías, profesionales, servicios, horarios, ajustes v17, otros tenants, esquema, migraciones y .env.local permanecen intactos por huellas. Las dos sesiones propias cerraron con HTTP 204; cero sesiones nuevas restantes, Auth HTTP 200 y PostgreSQL saludable. No hubo cuentas, correos, dinero real, cambios de configuración ni comandos de atención.

El usuario abrió Docker y autorizó operar servicios; Codex inició únicamente el Edge Runtime LOCAL existente y una instancia Metro LOCAL en 8081. No se iniciaron respaldos ni se operaron otros contenedores. La huella completa de auth.users ya difería del histórico antes del ensayo, sin causa atribuida; sus credenciales y campos estables actuales se conservaron durante las sesiones autorizadas. Se corrigió solo la entrada del verificador para evitar activar el guard de CLI de un lector histórico. Dos pruebas con dobles de la guarda y sintaxis del verificador aprobadas; ningún cambio de producto, Cloud, Android, SQL, RLS o Edge.

Evidencia:004/b51-ejecucion.json. Conservar la cita y su auditoría; no repetir los dos comandos ni .artifacts/b51-run/run.mjs. Matriz de 48: **34 VERIFICADA, 6 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL, 4 NO APLICA, 3 BLOQUEADA y 1 PARCIAL**. B5 global sigue abierto por seis ramas: crear/configurar barbería, retirar oferta, servicios CRUD/activo, horarios/cierres administrados, guardar/restaurar instrucciones Yape e inasistencia Web. Requieren preparación y permisos separados. 005 T012 conjunta sigue abierta; SMTP unknown, transferencia, aprobación visual, Android, Cloud público, rendimiento F5 y sesión U3 histórica conservan sus límites separados. Detenerse después del informe.

### Evidencia y límites

El ensayo real usó sesiones auténticas del cliente y del profesional, sin sustituir
autorización por service_role. Se reconsultaron reloj/slots y se verificó SQL después
de cada comando; una segunda lectura final confirmó conservación y una única recepción.
No defectos nuevos de producto. Solo ajustes del verificador y documentación.
El bloqueo inicial de servicios está resuelto por autorización posterior; se conserva
a continuación como antecedente, no como estado vigente.

## B5.1 — intento inicial bloqueado (histórico, resuelto)

20/11/2026. El usuario autorizó exclusivamente una reserva ficticia Yape desde Chrome y
una recepción manual ficticia por el profesional asignado, con sesiones LOCAL y lecturas
necesarias. **Ninguno de los dos comandos se ejecutó.** La prevalidación se detuvo al
conectar con Docker: no existe el pipe `dockerDesktopLinuxEngine`; contexto seleccionado
`desktop-linux`. Comprobación adicional de solo lectura: sin listeners en API54421,
PostgreSQL54422 y Metro8081; sin procesos Docker Desktop/backend ni servicio Docker encontrado.
No iniciar ni reiniciar servicios con esta autorización. No hay evidencia de un defecto
de Barbexa: el entorno requerido no está disponible.

Resultado real: 0 sesiones nuevas, 0 solicitudes de negocio, 0 reservas/recepciones/correos
nuevos. HTTP201/200, estados finales y conservación actual mediante PostgreSQL **no
comprobados**. Las40 reservas/43detalles son el último baseline histórico B5/B4, no un
conteo revalidado en este intento. No atribuir41/44 ni seis INSERT/una UPDATE al resultado.

Preparado únicamente el verificador local: guarda de dos comandos con actor/payload/ID
protegidos, prevalidación read-only y conservación por huellas. Dos pruebas con dobles y
comprobaciones de sintaxis Node aprobadas; no equivalen al recorrido Chrome/HTTP/SQL.
No código de producto ni interfaces modificados. Evidencia:
`docs/evaluacion/evidencias/004-reservas/b51-ejecucion.json`.

Continuación mínima: disponer de Docker Desktop, la pila Supabase LOCAL habitual y Metro;
si Codex debe iniciarlos, hace falta autorización específica de servicios. Después repetir
solo la prevalidación fallida (no se emitió ningún comando), revalidar reloj/slots/40/43 y
huellas, y ejecutar los mismos dos comandos autorizados una vez. La autorización de Yape
ya consta; no pedirla otra vez si se conservan actores, alcance y precondiciones. No ejecutar
las otras seis ramas. B5/Yape permanecen abiertos y la matriz conserva sus48 estados.

## B5 — preparación anterior del cierre Web y ensayo Yape (histórico)

20/11/2026. Lectura dirigida y consolidación; **B5 sigue abierto**. No nuevos usuarios,
sesiones, reservas, pagos, atenciones, correos ni cambios de configuración. No corregir
App por hipótesis. Evidencia `docs/evaluacion/evidencias/004-reservas/b5-preparacion.json`.
No volver a ejecutar operadores B1–B4: sus estados finales están acreditados y protegidos.

### Flujo Yape real del contrato005 y estado actual

1. Cliente autenticado selecciona servicio/profesional/horario en `/booking`; el selector
   `payment-choice.tsx` consulta `care/payment-options` y solo ofrece Yape si hay
   instrucciones del tenant. Envía `paymentMethod=yape` al confirmar. No aporta precio,
   identidad/rol, cuenta bancaria, credencial Yape, comprobante, foto ni código de operación.
2. Confirmación atómica crea reserva, detalle y ledger `pending`, importe del servidor
   e instrucciones históricas. Seleccionar Yape o decir que se pagó no marca recepción.
3. Cliente consulta `/my-reservations`→«Consultar atención y pago»: método Yape,
   instrucciones del tenant y estado Pendiente. Instrucciones son snapshot de esa cita;
   no se publican como configuración privada global ni cambian al editar oferta posterior.
4. Personal asignado con perfil/membresía activos o administrador operativo vigente del
   tenant puede confirmar.011: principal/secundario pueden recepción operativa; solo
   propietario puede reembolso, que no se necesita en este ensayo. Cliente no confirma.
   Desde `/agenda`, consultar atención/pago→«Registrar pago recibido»→confirmación
   explícita «recibí el importe completo fuera de la app»→`care/receive` con `attested=true`
   y requestId. SQL revalida permiso, pago pendiente, importe/método históricos y actor.
5. Queda `paid`, un evento receive con actor/hora/método/importe y la atención igual.
   El bloqueo de ledger, estado y requestId evitan doble confirmación; reutilizar00591
   comprobaciones/10 pares, no repetir carreras ni replay como parte de esta preparación.
6. Estados financieros únicos: `pending/paid/refunded`. **No existe estado rejected ni
   comando para rechazar comprobantes**. Pago no recibido/no comprobado sigue pending;
   error de autorización/estado no confirma nada; resultado incierto exige leer antes de
   reintentar el mismo contrato, nunca emitir una segunda recepción a ciegas. No inventar
   cancelación automática por impago, retención, pasarela o validación bancaria.

Recepción es registro manual, no cobro ni conexión Yape. La atestación del futuro ensayo
será explícitamente ficticia autorizada, no prueba de una transferencia monetaria real.
No hay adjuntos/comprobantes almacenados por005: evidencia es el registro auditado de
la confirmación externa autorizada. Precio S/25 viene del servicio, no deun formulario.
Pagar no inicia/completa atención; cancelar no reembolsa; no repetirB2/B3.

### Precondiciones LOCAL comprobadas por lectura

PostgreSQL verificado `app-barberia-002-local:54422`, transacciones repeatable read/read
only;40 reservas/43 detalles/27 care/65 care_events/53 reservation_events,14 usuarios,
13 perfiles personales,14 membresías/8 invitaciones. Huellas iguales al finalB4 antes
y después de las lecturas, catálogo/historial intactos. Propietario U3 y todos datos
B1–B4 conservados, incluidas nuevas relacionesU4. Ninguna llamada de negocio/Auth ahora.

0050 sigue published,booking_settings **v17**,notice0/horizon30/step15. Profesional
original activo/barber activo, servicio y vínculo activos, S/25/15min. Care settings:
tolerancia10, instrucciones configuradas y marcadas como prueba, sin secuencias numéricas
largas ni URL de pago. Solo se guardó evaluación booleana/hash, no el texto de cobro.
Esto permite preparar sin cambiar configuración; revalidar que sean sintéticas antes
de mostrarlas en una prueba posterior. No usar credenciales/número real ni QR externo.

Existen9 ledgers Yape históricos:1 pending confirmed/confirmed,3 paid confirmed/confirmed,
1 paid confirmed/completed y4 refunded cancelled/cancelled. **Todos están dentro de las40
citas protegidas**; no son desechables autorizados. Pueden aportar evidencia de backend,
pero mutarlos no está permitido y no acreditaría elección Yape de una reserva nueva Web.

### Escenario mínimo Yape propuesto — dos comandos, requiere nueva autorización

| Recurso | Identidad/condición |
| --- | --- |
| Barbería |005 aislada0 `4950d75f-e43b-459b-acf6-e138f9f051e1`,publicada |
| Cliente ficticio existente |`aecfc300-c0ca-4005-bbda-d59c7ac2df69` |
| Profesional original |usuario `8ff39bfd-5242-4058-8875-b2d378500d91`,perfil `4c1860a5-64fa-441e-9ae1-9c0fb8f9e527` |
| Servicio |`0805ab4a-c879-4054-a2d9-1de5af150407`,S/25,15min |
| Principal para lecturas de filtro si hiciera falta |U3 `74a05d0a-f21f-44f5-8de2-549ba4dba76f`,sin mutaciones administrativas en este escenario |
| Horario candidato, NO reservado |21/11/2026 11:00–11:15 Lima (16:00–16:15UTC). Lectura: horarios local/profesional compatibles, sin excepción ni ocupación física/cliente; reconsultar slots reales después de autorizar y antes de confirmar |

1. Sesiones legítimas LOCAL del cliente/profesional solo para este ensayo, sin volver
   a evaluar login/Google/recuperación. Cliente llega al punto de selección ya acreditado;
   elegir Yape y confirmar **una** cita nueva Y. `confirm` esperado201:1 reserva,
   1detalle,1booking_care,1evento confirmed y1evento created, todos del nuevoID.
2. En Mis reservas comprobar Yape/Pendiente/instrucciones sintéticas y ausencia de control
   receive del cliente; preservar ID/importe. No hay envío de comprobante ni dinero real.
3. Profesional asignado consulta misma cita en Agenda y verifica permisos; pulsa recepción
   ficticia con atestación y confirma una vez. `care/receive` esperado200:1 UPDATE al
   ledger nuevo pending→paid y1 INSERT care_event receive. Ninguna transición de atención.
4. Cliente relee misma cita Yape/Recibido, profesional ve mismo importe y una recepción;
   filtros recibidos/pendientes se pueden consultar sin repetir escrituras. U3 solo si
   es necesario para filtroadministrativo; no exigir un segundo receive.
5. Resultado **confirmed/confirmed/paid/yape/S25**, no completed/no-show/cancelled/refunded.
   Protección porhash de40citas/43detalles previos y dependencias; mismas membresías,
   propietarios y ajustesv17; sesiones propias cerradas y registros nuevos conservados.

**Permiso mínimo exacto:**1confirm Yape+1receive ficticio,1 cita nueva/1 detalle nuevos,
6 INSERT totales y1 UPDATE sobre el ledger nuevo; final **41 reservas/44 detalles/28 care/
67 care_events/54 reservation_events**.0 cuentas/correos/configuraciones nuevas,0 dinero
real. Sin start/complete/no-show/refund/cancel/reschedule/limpieza ni replay. Si un resultado
es incierto, consultarSQL y detener dependientes, sin repetir automáticamente. Si no hay
slot o falta configuración ficticia, detenerse sin inventar datos ni cambiar el servidor.

Ese alcance cierra **elección y recepción Yape Web**, no por sí solo toda la configuración
de pagos005 o todas las48funcionalidades. No existen escrituras autorizadas todavía.

### Consolidación de48 filas — sin volver a auditar ni recorrer bloques

Se verificó consistencia de los4 JSONfinales: B1passed,B2continuaciónpassed,B3functional-
web-complete,B4functional-web-complete-agreed-scope. Archivos de regresión pertinentes
presentes: botónConfirmar sin métodoB2, elegibilidad de atenciónB3 y correcciones de
verificadoresB2/B3/B4. No se ejecutaron nuevamente sus suites ni operaciones.

Estado actual de la matriz: **33VERIFICADA,7IMPLEMENTADA SIN VALIDACIÓN INTEGRAL,
4NO APLICA,3BLOQUEADA,1PARCIAL =48**. VERIFICADA puede acreditar backend si así lo dice
la fila; no convertirla automáticamente en aceptación física de todos los botones.
Scopes aprobados B1–B4 y autenticación se conservan; no repetirlos para completar filas
residuales que quedaron fuera del permiso acordado.

Pendientes funcionales Web concretos, además de los2 comandosYape:

| Pendiente de evidencia | Contrato/ruta | Qué falta y permiso posterior |
| --- | --- | --- |
| Crear/editar configuración de barbería desdeWeb |004FR001/007,002; `/barbershop-admin` |Alta/configuración siguen implementadas sin recorrido actual integral. Preferir futuro fixture independiente; alta crea shop+settings+membresía/propiedad/auditoría. No autorizarlo implícitamente conYape ni repetir garantías atómicasSQL |
| Retirar oferta |004FR002; `/barbershop-admin` |Pausa/republicación B1 ya aprobadas; withdrawn y su efecto Web no se ejecutaron. Requiere permiso explícito de retirada/restitución de fixture, sin citas alteradas |
| Servicios completos |004FR003; `/services` |Descripción B1 acreditada. Alta/edición precio-duración/activar-desactivar no acreditadas porWeb. Preparar servicio sintético independiente o modificación/restauración autorizada; snapshots protegidos. No confundir activación de perfilB4 con activación de servicio |
| Horarios/cierres administrados |004FR007–008; `/schedules` como admin |009B4 acredita solo horario/bloqueo PROPIO. Guardar horario del local/deotro profesional y excepciónadministrada siguen sinWeb; requieren permiso/registros exactos yrestauración. No repetirpropio009 |
| Guardar instrucciones Yape |005FR006/US4; CareSettings `/barbershop-admin` |Configuración yHTTP históricos sí; guardar/restaurar desdeWeb no. Podría prepararse2configure sobre instrucciones ficticias, conservar tolerancia e historial deconfiguración; requerir permiso separado y restauración. Los2comandos de recepción propuestos NO incluyen configure |
| Inasistencia desdeWeb |005FR001/003/016; `/agenda` |Backend/reloj/límites ya probados. No se encontró operación Chrome no-show enB2–B4; falta esa rama Web si el cierre promete todos los flujos005. Requiere cita sintética nueva autorizada elegible tras inicio+tolerancia, sin atención iniciada. No mutar las40 ni agregar no-show aYape sin permiso; se puede planificar después sobreY si aún cumple estados/tiempo y se autoriza explícitamente |

Son brechas de **verificación de funciones implementadas**, no defectos probados ni
módulos que rehacer. No se demostró una nueva corrección necesaria. Ramas error/conflicto/
reintento/dobleenvío/aislamiento con evidencia suficiente se reutilizan; no provocar
carreras o cortes de red persistentes para obtener capturas nuevas.

### Decisiones, límites y criterios de cierre B5

- **SMTPadministrativo011FR004:** correosMailpit históricos4 y118checks acreditan el
  adaptador original; no prueban entrega de la invitación2E.3 deliveryunknown bajo el
  perfilactual. No reenviar automáticamente. No bloquea aceptación interna/membresías
  porque elcorreo no concede permisos ni sufallo revierte invitación, pero **sí impide
  afirmar completo el alcance «invitación por correo»011 sin esa evidencia o decisión
  expresa de diferir el aviso actual**. Gmail/SMTPexterno y despliegue son otra fase.
- **Transferenciadepropiedad HA007:** aceptar está bloqueado expresamente porcontrato.
  No bloquea la jerarquía vigente ni operación diaria aprobada, pero nunca declararla
  implementada completa. Decidir destino propietario anterior/cupos/confirmación identidad
  antes de nuevo alcance. Cierre del núcleo Web puede excluirla explícitamente; no cerrar
  toda011HA como si hubiera transferenciafinal probada.
- **Aceptación visual/Android/Cloud/hosting/entrega pública/rúbrica** conservan seguimiento
  separado. PruebasChromeCodex no son aprobación visual delusuario ni cierre conjunto
  de004/005/006/008/009/010/011. Sin despliegue ni cambios deinfraestructura.
- Apertura/F5 sigue pendiente de mediciónreal y optimizaciónAuth no autorizada. SesiónU3
  inicial del capturadorB3 queda incidenteoperativo separado sin token; no signoutglobal.
- Para cerrarB5 plenamente en el alcance funcional Web especificado: acreditarYape,
  resolver las6brechas Web listadas con permisos mínimos, o aceptar una reducción/diferido
  explícito del alcance. Registrar porquéSMTP/transferencia se difieren, conservar sus
  requisitos abiertos, y completar solo los checks transversales todavía sin evidencia
  necesaria (enlaces/foco/estados) reutilizando lo vigente. No cambiar una fila aVERIFICADA
  por mera presencia de código o por salvar un pagoYape.
- TrasYape y losresiduales podrá considerarse verificado el núcleoWeb LOCAL de acceso,
  oferta/exploración/reserva, atención/inasistencia, pagosmanuales, cancelación/reprogramación/
  reembolso, cuenta/autogestión/equipo dentro del alcance explicitado; no garantiza entrega
  pública/Android/notificacionesSMTP/transferencia ni funcionalidades fuera deMVP actual.

Recomendación inmediata única: autorizar primero los **2comandosYape** descritos. Luego
preparar un permiso concreto de losresiduales deoferta/configuración e inasistencia, sin
repetir B1–B4. Porahora solo preparación: detenerse después del informe.

## B4 — cierre funcional Web del alcance autorizado

20/11/2026. Ejecutados **15/15 comandos desde Chrome con sesiones auténticas LOCAL**,
todosHTTP200 y verificados en PostgreSQL después de cada escritura. B4 queda cerrado
funcionalmente en Web para P1–P4/E1–E2 acordados. No iniciar B5 automáticamente.
Evidencia `docs/evaluacion/evidencias/004-reservas/b4-ejecucion.json`.

| Comando real | HTTP | Resultado comprobado |
| --- | --- | --- |
|1 personal-change |200|Nombre/teléfono ficticios propios guardados y visibles tras navegación |
|2 personal-restore |200|Nombre original exacto y teléfono null restaurados; nueva lectura Web correcta |
|3 professional-change |200|Nombre profesional propio temporal persistido, servicios/permisos intactos |
|4 professional-restore |200|Fila profesional original restaurada, visible tras navegación |
|5 hours-change |200|7 intervalos propios; inicio de un día futuro reducido00:00→00:15 sin citas afectadas |
|6 hours-restore |200|Los7 intervalos originales por valores restaurados; IDs internos legítimamente renovados |
|7 block-create |200|Un bloqueo nuevo15min; slot11:00 excluido de disponibilidad |
|8 block-edit |200|Mismo bloqueo pasa11:30–11:45;11:00 vuelve y11:30 deja de ofrecerse |
|9 block-remove |200|Solo bloqueo nuevo retirado;11:30 disponible otra vez,0 bloqueos finales |
|10 barber-invite |200|Una invitación interna pending aU4, sin membresía ni privilegios antes de aceptar |
|11 barber-accept |200|U4 acepta desde Mis invitaciones; una membresía barber/active, contexto0050 seleccionado |
|12 new-professional-create |200|Un perfil profesional nuevo activo deU4 en0050 |
|13 new-professional-deactivate |200|Ese mismo perfil nuevo queda inactivo |
|14 new-professional-reactivate |200|Ese mismo perfil vuelve a activo |
|15 new-professional-capability |200|Un vínculo activo al servicio autorizado, visible al propietario y perfil propio legible porU4 |

Los comandos2/4/6 son restauraciones por el flujo Web, no reparaciones administrativas.
No repetirlos ni repetir los comandos de creación. Horario/bloqueo se ejecutaron en el
día futuro21/11/2026; al preflight no había citas futuras confirmed de ese profesional.
Consultas de disponibilidad fueron solo lectura, sin reservas nuevas.

Registros conservados expresamente en0050:

- Invitación barber accepted `906dac8e-f13f-4904-b764-a3ff21fe0fe8`.
- Membresía U4 barber/active `4c898fa4-4b1a-4270-ad8d-12a5ad87ad1e`.
- Perfil profesional nuevo activo `4c3f0c8e-e449-4a10-9da1-418091aa99ae`.
- Capacidad activa al servicio `0805ab4a-c879-4054-a2d9-1de5af150407`.

U4 conserva propiedad/administración de su otra barbería y no obtiene administración
en0050. U3 y todos los propietarios previos intactos. El perfil nuevo no recibió horarios
ni reservas: no afirmar que ya tiene oferta reservable. Emisión004 interna, sin SMTP
ni admin_invitation_mail nuevo; delivery=unknown histórico no se reconcilió ni reenvió.

Verificación final independiente22:43:46UTC: **40 reservas/43 detalles**,27 care,
65 care_events,53 reservation_events,8 barberías,14 usuarios,13 perfiles personales;
membresías13→14 e invitaciones7→8. Todas las reservas/detalles/pagos/atenciones, B2,
A/B deB3, propietarios, membresías previas, otros perfiles profesionales/capacidades,
otros tenants y servicios sin cambios por huellas. Nombre/teléfono originales restaurados,
fila profesional propia original restaurada y7 intervalos funcionalmente iguales.
Booking settings0050 conserva todos sus campos salvo versión legítima **5→17**:
2 cambios de nombre profesional,2 reemplazos horarios,3 operaciones bloqueo,1 invitación
y4 operaciones del perfil nuevo. Aceptar barbero no incrementó esa versión. No resetear
versiones, timestamps o IDs para simular ausencia del ensayo.

No defectos detectados ni correcciones del producto. Verificador limitado por actor,
path y payload exacto, contador15, sin reenvíos;3 pruebas dirigidas del nuevo límite
aprobadas y sintaxis Node correcta. Se reutilizaron backend/seguridad/dobles previamente
acreditados; no repetidas carreras, suitesAuth ni ocho lecturas de preparación.
No TypeScript/lint masivos porque no se cambió App/servidor. EvidenciaJSON formato correcto.
4 sesiones propias cerradasHTTP204 y0 sesiones nuevas restantes del intento.
Authhealth200/PostgreSQL saludable; esquema/17 migraciones/.env.local intactos.

Se conservan pendientes independientes: SMTP administrativo unknown; transferencia de
propiedad bloqueada; recepción manualYape Web paraB5; aceptación visual del usuario y
Android/gates conjuntos006T006/008T007/009T007/011T008. Las filas residuales de oferta004
mantienen su estado para consolidación; no declararlas ejecutadas por este B4.
SesiónU3 histórica del primer fallo B3 sin token sigue sin revocación selectiva, no se
intentó cerrar otras sesiones. No Cloud, migraciones, correos, dinero real, despliegue,
commit/push ni B5. Los apartados inferiores son históricos, no autorizaciones para repetir.

## B4 — inspección y plan mínimo anteriores (histórico)

20/11/2026. B4 abierto. Autorización actual: documentación, lectura LOCAL y Chrome
con sesiones ficticias necesarias; **ninguna edición, invitación o cambio de negocio**.
Evidencia `docs/evaluacion/evidencias/004-reservas/b4-preparacion.json`.
No iniciar B5. No repetir autenticación como prueba, B1/B2/B3,2E.3 ni recorridos U6.

### Estado comprobado y evidencia reutilizada

- Baseline PostgreSQL LOCAL inequívoco, transacciones read-only,40 reservas/43 detalles,
  27 care/65 care_events/53 reservation_events,8 barberías,14 usuarios,13 perfiles y13
  membresías. Huellas previas coincidieron con cierre B3; lectura final22:27:08UTC confirma
  todas las filas de negocio, propietarios/perfiles/membresías/profesionales/esquema/
  historial/env intactos. B2 y A/B de B3 protegidos.0 escrituras de negocio,0 correos.
- Chrome real, dos sesiones existentes (cliente y profesional),8 comprobaciones nuevas:
  editor personal muestra nombre/teléfono y cierra sin guardar; cliente sin membresías
  recibe denegación de Equipo con salida a Inicio y sin carga perpetua/controles admin;
  invitaciones recibidas sin editor saliente; editor profesional conectado; resumen
  propio20/11 muestra2 citas,1 completada/1 cancelada, coherente conSQL y sin importes;
  fecha2099-01-01 muestra vacío; disponibilidad propia lee7 intervalos/0 bloqueos/v5 y
  ofrece controles de edición. Ningún botón Guardar/Invitar/Aceptar/Retirar fue enviado.
  Las2 sesiones propias cerraronHTTP204. Auth solo registra inicios legítimos, no se
  probaron de nuevo login, Google, registro o recovery.
-006T002–005: validación/identidad/PATCH/RLS y formulario ya acreditados con dobles;
  ahora apertura/cierre Web en cuenta ficticia también comprobados. **Guardar y restaurar
  por Web todavía no acreditados**. Únicos campos editables: displayName y phone nullable;
  no correo, contraseña, rol, avatar, biografía ni datos administrativos.
-008T006 y009T006: reutilizar155 comprobaciones conjuntas008–010 con JWT, aislamiento,
  revocación, carreras/rollback y restauración. No volver a ejecutarlas. Perfiles propios
  editan solo nombre profesional, nunca activación o servicios. Horarios propios gestionan
  intervalos/bloqueos con versión vigente, contención y protección de citas en servidor.
  Lecturas/controles Web comprobados; faltan sus escrituras Web y persistencia/restauración.
-011 resumen diario: componente Web de lectura, fecha y vacío **acreditado ahora**;
  no métricas financieras ni estados inventados. Datos propios de0050 en20/11:2/1/1.
  Acredita lectura Web, no la aceptación conjunta011T008/Android.
-011/2E: reutilizar aceptación manual del propietario MVP A y de U6 secundario011/
  principalPrueba1/cambio de contexto. La evidencia2E.3-removal incluye Chrome real de
  U3 en `/staff?view=team`, secundario existente, retirada y sincronización de cupos;
  sirve para la función de roster con miembros y no requiere crear otra administración
  ni recuperar la clave U5. No equivale a una aprobación visual específica de U5: ese
  recorrido del usuario queda separado si desea revisarlo. Denegación cliente2E.1 ahora
  verificada realmente porChrome; no se aplicó otro parche.
- Invitaciones de barbero: backend/aceptación HTTP ya probados en118 comprobaciones011;
  el aviso Mailpit histórico corresponde al escenario administrativo documentado.
  Falta **emitir y aceptar barbero desde Web**. No confundirlo con2E.3 administrativa.
  `invite-existing-user`004 usa RPC persistente; su flujo actual no invoca adaptador SMTP:
  el destinatario recibe la invitación interna en `/staff`. No atribuirle envío de correo.
- Equipo: formularios existentes permiten al principal crear/activar/desactivar perfil
  profesional y asignar servicios. Falta acreditar esos cambios en Web, no reconstruirlos.
  Principal gestiona equipo; secundario NO invita ni modifica equipo; profesional solo
  su nombre/horario/resumen y atención asignada; cliente perfil/invitaciones propias.
  Mostrar un botón nunca sustituye la comprobación definitiva del servidor.

### Diagnóstico de integración y archivos

No se demostró un defecto nuevo de App en esta inspección. No se modificó código de
producto, contratos, fuentes tipográficas o diseño. No hay bloqueo de implementación
conocido para las escrituras descritas abajo; quedan recorridos Web sin acreditar.
La transferencia definitiva de propiedad sí está incompleta/bloqueada por decisión
aprobada, fuera del cierre operativo B4. No presentarla como una función terminada.

Fuentes relevantes:
`src/features/authentication/presentation/{personal-profile-editor.tsx,web-profile-access.web.tsx}`;
`src/features/authentication/application/session-coordinator.ts`;
`src/features/barbershop-operation/presentation/{operation-screen.tsx,self-professional.tsx,self-schedule.tsx,own-summary.tsx,admin-invitations.tsx,team-authority-panel.web.tsx}`;
`src/features/barbershop-operation/{application/operation-application.ts,infrastructure/operation-http-adapter.ts}`;
`src/composition/operation-route.web.tsx`; contratos006/008/009/011 y004.
Son archivos a seguir durante la prueba, **no una lista de archivos que deban corregirse**.
Si aparece un defecto nuevo, demostrarlo antes de proponer un cambio; no adaptar App
para solventar errores del verificador. Se reutilizó el capturador B3 corregido, con
puerta que rechaza TODA escritura de negocio; sin instalaciones ni servicios operados.

### Recorridos mínimos pendientes y permisos posteriores

Identidades ficticias existentes, mismas contraseñas de prueba autorizables, sin correo
personal expuesto ni recovery innecesario:

| Recurso | LOCAL |
| --- | --- |
| Barbería |005 aislada0, `4950d75f-e43b-459b-acf6-e138f9f051e1` |
| Principal |U3 `74a05d0a-f21f-44f5-8de2-549ba4dba76f` |
| Cliente |`aecfc300-c0ca-4005-bbda-d59c7ac2df69`,perfil existente,teléfono null |
| Profesional propio |usuario `8ff39bfd-5242-4058-8875-b2d378500d91`,perfil `4c1860a5-64fa-441e-9ae1-9c0fb8f9e527` |
| Servicio existente para capacidad |`0805ab4a-c879-4054-a2d9-1de5af150407`,activo,S25/15min; no editar |
| Candidato barbero nuevo en0050 |U4 `1727ac35-2672-42dc-b5b1-6b0482fdc72f`;cuenta/perfil confirmados,credencial existente,0 membresías/0 invitaciones pendientes en0050 |

U4 conserva administración de su otra barbería; agregar relación barber/active SOLO en0050
no altera aquel rol. Ninguna cuenta nueva ni ascenso a administrador. El profesional
existente tiene7 intervalos00:00–24:00,1 capacidad activa,0 bloqueos y0 reservas futuras
confirmed al inspeccionar. Revalidar antes de cualquier escritura; no asumir inmutabilidad.

| Caso | Actor/ruta/precondición | Operación mínima y resultado | Escrituras concretas propuestas | Evidencia reutilizable |
| --- | --- | --- | --- | --- |
| P1 perfil personal |Cliente, `/account?view=profile`, perfil propio cargado |Nombre sintético temporal y teléfono ficticio→guardar→recargar→restaurar ambos valores originales (phone null)→recargar; conservar identidad/contexto |2 PATCH a la MISMA fila public.profiles; sin cambios Auth/correo/rol. Conservar updated_at/auditorías legítimas, no resetearlas |006 dobles/contrato; apertura y cancelar sin guardar acreditadas ahora |
| P2 nombre profesional |Profesional, `/staff?view=professional`,0050/perfilactivo |Nombre temporal→guardar→persistencia Web/HTTP→restaurar original; el otro perfil de la misma persona intacto |2 update-own-professional; misma fila barber_profiles y2 incrementos legítimos de booking_settings.version |008T006/JWT/aislamiento; controles Web acreditados |
| P3 intervalos propios |Profesional, `/schedules`, lectura v vigente y7 intervalos |Retirar15min al extremo00:00 de un día futuro sin citas→guardar→recargar→restaurar7 intervalos originales |2 set-own-schedule. Cada comando reemplaza SOLO sus7 barber_schedules mediante DELETE/INSERT transaccionales y sube versión; IDs internos pueden cambiar al restaurar. No tocar horarios del local ni otro profesional |009T006 carr/conservación; lectura Web acreditada |
| P4 bloqueo propio |Mismo profesional/pantalla,0 bloqueos |Un bloqueo nuevo de15min en futuro libre→editarlo a otro slot libre→retirar exclusivamente ESE bloqueo; comprobar oferta con lecturas y no crear reservas |2 upsert-own-block+1 remove-own-block:1 INSERT,1 UPDATE y1 DELETE solo del bloqueo nuevo;3 incrementos de versión. Motivo sintético, sin reescribir bloqueos viejos |009 SQL/HTTP/rollback/concurrencia, no repetirlos |
| E1 invitación interna de barbero |U3 `/staff?view=team`;U4 sinmembresía0050,cuenta confirmada |Invitar una vez→pendiente sin permisos→U4 `/staff` acepta una vez con su sesión→barber/active en0050,visible al propietario |1 invite-existing-user+1 accept-invitation:1 staff_invitation nueva,actualización de su estado y1 membresía nueva. Conservar registro accepted; sin mail ni admin_invitation_mail, sin tocar invitaciones actuales |004/011118checks de invitación barbero,2E.3 administrativa solo se conserva |
| E2 perfil/activación/capacidad de equipo |U3,mismo equipo,U4 ya barber/active sinperfil0050 |Crear perfil profesional nuevo sintético activo→desactivar→reactivar→asignar el servicio existente; verificar UI y persistencia |3 set-professional (crear y2 cambios SOLO perfil nuevo)+1 set-capabilities (1 vínculo nuevo). Sin modificar perfiles/capacidades anteriores ni servicio/horarios. Conservar fixture nuevo activo y auditado, sin crearle citas/horarios |004 backend y permisos011; no repetir promoción/retirada admin |

**Alcance mínimo recomendado:9 comandos de autogestión (P1–P4) y6 de equipo (E1–E2),15
en total**, con respuestas HTTP y SQL después de cada uno; no incluye lecturas ni sesiones.
Restaurar solo datos editados P1/P2/P3 mediante UI. P4 borra exclusivamente el bloqueo
nuevo como parte explícita del caso; no una limpieza general. Preservar aumentos de
versión, timestamps e historia. Serializar las acciones de0050 y leer versión después
de cada operación; no restaurar v5 artificialmente ni enviar una versión estimada.

Efecto permanente E1/E2 propuesto:0 cuentas,1 invitación accepted,1 membresía barber,
1 perfil profesional y1 capacidad nuevos; **no cambia el número de reservas:40 ni
detalles:43**. No crear/cancelar/reprogramar citas, registrar pagos o atenciones.
Antes de autorizar, aceptar expresamente que esos cuatro registros sintéticos nuevos
quedarán conservados y que los7 intervalos propios pueden recibir IDs nuevos al restaurar.
El resto de perfiles/membresías/propietarios y otros tenants queda intacto.

Errores/validaciones/doble envío/revocación ya tienen dobles y HTTP; repetir solo regresiones
directamente afectadas si se demuestra un defecto. No provocar fallos de red durante
una escritura persistente ni reintentar resultados inciertos. Detener y consultar el
estado ante discrepancia. Recorrido visual del usuario posterior, no atribuirle estas
pruebas automatizadas ni marcar006T006/008T007/009T007/011T008 conjuntas como completas.

### Pendientes separados y límites del cierre

- SMTP administrativo: delivery=unknown de2E.3 sigue sin envío probado. No reenviar,
  reconciliar ni crear otra invitación administrativa para completar B4. La invitación
  de barbero E1 es interna; no reemplaza esa evidencia SMTP ni la requiere.
- Transferencia de propiedad: confirmación final bloqueada hasta aprobar destino del
  propietario anterior, cupos, confirmación de identidad y protocolo. Sin escrituras.
- Aprobaciones visuales del usuario y Android conservan su alcance; navegación cliente,
  propietarioMVP A y rolesU6 ya aprobados no se vuelven a solicitar rutinariamente.
- Roster específico de U5: no se da por recorrido visualmente; prueba funcional de roster
  con secundario se reutiliza deU3/2E.3. Si se exige U5 exacto, preparar acceso legítimo
  con nueva autorización, sin recovery automático ni crear otro secundario.
- CRUD genérico de oferta/horarios administrados004 tiene filas residuales en la matriz
  (alta de servicios, edición de precios, horarios del local, retirada de publicación),
  fuera del B1 acotado acreditado. No declararlo completo por estos casos propios009;
  conservar su estado para consolidación B5, sin probar ni ampliar B4 silenciosamente.
- Recepción manual **Yape Web** permanece pendiente expreso deB5. No probarla ahora.
  Sesión U3 del primer capturador fallido sigue pendiente selectiva por falta de token;
  no usar signout global ni alterar otras sesiones para limpiar ese registro.

Recomendación: autorizar P1–P4 y E1–E2 con los límites anteriores, sesiones de las cuatro
cuentas ficticias y restauraciones previstas; no hacen falta migraciones, cambios de
servidor, SMTP ni nuevas cuentas. Por ahora **preparado solamente**. No iniciar B5.

## B3 — cierre funcional Web comprobado

20/11/2026. Última autorización limitada a la cancelación administrativa B; ejecutada
una sola vez desde Chrome mediante sesión auténtica LOCAL de U3. **B3 queda cerrado
funcionalmente en Web para el alcance acordado.** No iniciar B4 automáticamente.
Evidencia consolidada: `docs/evaluacion/evidencias/004-reservas/b3-ejecucion.json`.

- Causa del TypeError reproducida con la función real del verificador: mientras Agenda
  refresca sus filas, `card(B)` puede ser null; el selector anterior invocaba directamente
  `querySelectorAll` y producía «Cannot read properties of null». Regresión RED antes
  del cambio y GREEN después. Solo verificador corregido: selección nula significa
  espera; selección y clic son atómicos; si desaparece antes del clic, se detiene sin
  solicitud.8 pruebas dirigidas del verificador aprobadas, sin repetir suites de negocio.
  No modificación adicional de App, Auth, SQL, RLS, Edge ni permisos.
- Se revalidaron las40 reservas/43 detalles y la identidad de B por ID, requestId de
  creación B3, barbería0050, profesional, reprogramación única de U3/motivo, estado
  confirmed/confirmed/pending cash2500 y ausencia de cancelación. Propietario U3 vigente.
- Historial Web de reprogramación B ahora consultado correctamente, incluida razón
  administrativa; lectura HTTP200 y un evento persistido. No reprogramación repetida.
- **cancel-B HTTP200**, único comando de negocio en esta ejecución. Motivo:
  «B3 LOCAL: cancelación administrativa final de la reserva B de prueba, sin atención
  iniciada ni reembolso». Evento cancelled único, actor U3, capacity administrator.
  B=`c47c8ee2-d7df-4ffe-8b6d-055355a3459e` termina
  **cancelled/cancelled/pending**, cashS25. No receive/refund de B ni eventos de devolución.
- Web muestra reserva/atención canceladas y pago pendiente; historial de reprogramación
  conservado. El motivo de cancelación se acredita por SQL/auditoría (no se inventa una
  vista de eventos de cancelación que la UI no contiene). Slot18:15Lima vuelve a aparecer
  en disponibilidad; horario anterior18:00 también libre por consulta de ocupación.
  Filtros administrativos Cancelada+Pendiente incluyen B; Reembolsado la excluye;
  Todos/Todas la restauran. No escrituras sobre A ni ninguna cita anterior.
- Lectura final independiente22:17:01UTC: **40 reservas/43 detalles/27 care/65 care_events/
  53 reservation_events**,2 eventos nuevos de reprogramación en el B3 acumulado.
  Huellas preservan las otras39 reservas/ledgers, todos43 detalles, A reembolsada,
  las38 anteriores a B3 incluida B2completed/paid, perfiles, membresías, servicios,
  profesionales y otros tenants. B solo cambió state/cancelled_at y care.attendance;
  ningún otro campo, precio, método, importe o historial de reprogramación cambió.
  Catálogo/17 migraciones/.env.local intactos. Auth200/PostgreSQL saludable.
- Efectos de esta ejecución:1 INSERT de auditoría+2 UPDATE lógicos de B,0 DELETE.
  Acumulado autorizado B3:8 comandos,16 INSERT,8 UPDATE lógicos,0 DELETE. Sin replays,
  nuevas reservas, limpieza, correos ni dinero real. Datos sintéticos e historia conservados.
- Nueva sesión propia U3 cerradaHTTP204; consulta Auth confirma0 sesiones nuevas restantes
  de este intento. La sesión U3 del primer fallo de captura sigue registrada1: su token
  no se conservó y no puede revocarse selectivamente por esta sesión sin ampliar el
  procedimiento. No ejecutar cierre global/de otras sesiones; pendiente externo documentado.

Fuera del cierre B3: recepción manual **Yape Web** todavía no acreditada; Android y
aceptación conjunta004T027/010T008/005T012 siguen sus gates; no cerrar especificaciones
completas por esta ejecución Web. No Cloud/infraestructura ni despliegue. Apartados
inferiores documentan estados históricos, no operaciones para repetir.

## B3 — continuación parcial anterior: A completada; B reprogramada, sin cancelar

20/11/2026. Usuario pidió continuar. **B3 sigue abierto** por una única cancelación
administrativa pendiente y sus lecturas finales; NO repetir los7 comandos acreditados.
Evidencia `docs/evaluacion/evidencias/004-reservas/b3-ejecucion.json`.

Se corrigió solo el capturador del verificador: clasificaba cualquier respuesta del
endpoint token como JSON Auth, incluyendo OPTIONS sin cuerpo. Una regresión que ejecuta
la línea real falló para OPTIONS antes del cambio y pasa al limitar a POST. Nuevos
diagnósticos registran método/status/operación sin cuerpos sensibles.4 pruebas del
verificador (1 captura+3 límites) aprobadas. El intento previo se conserva con0 comandos;
continuación separada en `.artifacts/b3-run/resume-1/`. No cambios adicionales en la App.

Chrome real comprobó primero la corrección Web sobre B2: atención completada sin botones
Cancelar/Reprogramar, historial disponible. Ninguna escritura sobre B2. Después:

| Operación Web real | HTTP | Persistencia verificada inmediatamente |
| --- | --- | --- |
| Crear A |201|Una nueva confirmed/confirmed/pending cashS25 |
| Recepción ficticia A por U3 |200|paid, atención aún confirmed |
| Reprogramar A como cliente |201|Mismo ID/servicios/profesional/precio/pago; historial Web visible |
| Cancelar A como cliente |200|cancelled/cancelled/paid; no devolución automática |
| Reembolso ficticio A por U3 |200|cancelled/cancelled/refunded, motivo y actor auditados |
| Crear B |201|Una nueva confirmed/confirmed/pending cashS25 |
| Reprogramar B como U3, con motivo fuera del plazo del cliente |201|Mismo ID; horario y motivo auditados, pago pending conservado |
| Cancelación administrativa B |NO EMITIDA|B sigue confirmed/confirmed/pending |

A=`12d4287b-7478-4d10-9708-4280bd7fc837`,21/11 09:00→10:00 Lima.
B=`c47c8ee2-d7df-4ffe-8b6d-055355a3459e`,20/11 18:00→18:15 Lima.
Cliente sin botón cancelar B; consulta Web de nuevos horarios de B devolvió403 por
restricción temporal, sin mutación. Propietario pudo reprogramar con motivo explícito.
Cliente y profesional asignado sin permiso refund ni control de reembolso en A; no se
enviaron intentos de refund prohibidos. Solo registro ficticio, ningún dinero real.
Horarios de A liberados tras reprogramación y cancelación, comprobados mediante consulta
autorizada de disponibilidad. Identidad/items/ledger financiero conservados al reprogramar.

Parada después del201 de reprogramación B y su verificación SQL/huellas: el verificador
produjo `WEB_EVALUATION_FAILED`, excepción de evaluación **TypeError** al preparar
«Consultar historial de reprogramación» de B en Agenda. La mutación ya está acreditada;
el historial B desde navegador todavía no. No se capturó mensaje/stack para probar la
causa exacta del TypeError; posible ausencia temporal de tarjeta durante recarga requiere
diagnóstico, no parche especulativo de App. No se reparó ni repitió tras esta parada.
NO existe petición cancel-B, evento de cancelación B ni segunda reprogramación B.

Verificación independiente final22:06:49UTC: **40 reservas/43 detalles/27 care/65 care_events/
52 reservation_events**;2 nuevos reschedule_events. Todos los hashes por fila de las38
citas/41 detalles previos y dependencias, perfiles, membresías, profesionales y otros
tenants conservados. Esquema/17 migraciones/.env.local iguales. B2confirmed/completed/paid
cash2500 intacta. Salud Auth200 y PostgreSQL saludable.
Efectos reales: **7 comandos,15 INSERT,6 UPDATE lógicos,0 DELETE**. Falta1 INSERT de
auditoría y2 UPDATE de la cancelación B para alcanzar la estimación16/8; no inventarlos.
A conserva created/receive/refund y confirmed/cancelled; B solo created/confirmed y
un reschedule administrativo. Cada cita tiene una única reprogramación, sin duplicados.

Las3 sesiones propias de esta continuación cerraron con204. La sesión inicial de U3
del capturador fallido sigue registrada (1); no se revocó por otra vía ni se imprimieron
tokens. Navegadores de prueba cerrados. Cloud/Android/SQL/RLS/Edge/servicios sin cambios.

Próximo permiso mínimo: diagnosticar/corregir solo lectura del historial del verificador;
usar las citas A/B EXISTENTES; releer historial B/liberación anterior, ejecutar **una sola
cancelación administrativa B con motivo** mediante U3, luego estado/auditoría/liberación
y filtros restantes. Antes, revalidar que B sigue confirmed con atención confirmed y
sin cancelación previa; si cambió, detenerse. No crear otra reserva, no repetir recepción,
refund, reprogramaciones, aceptación o pruebas anteriores. No cambiar fechas/reloj ni
reglas para completar la prueba. Recepción **Yape Web sigue pendiente por separado**.
No B4 ni cierre automático de004T027/010T008/005T012 o sus gates Android/manuales.

## B3 — primer intento detenido antes de las reservas A/B (histórico)

20/11/2026, autorización específica posterior a la preparación. **B3 sigue abierto**;
no repetir este operador ni crear A/B automáticamente. Evidencia:
`docs/evaluacion/evidencias/004-reservas/b3-ejecucion.json`.

- Corrección puntual Web implementada: BookingCard utiliza la consulta existente de
  CareControl para habilitar las acciones de cliente/personal solo tras una lectura
  verificada de atención elegible. Mientras se consulta/no hay resultado, no muestra las
  mutaciones. Atención completed/in-service/no-show/cancelled no permite esos controles;
  conserva el historial. El ledger legítimamente ausente sigue siendo elegible tras
  lectura autorizada. El servidor conserva todas sus reglas y permisos.
- Cinco archivos de presentación afectados: `booking-screen.tsx`, `care-control.tsx`,
  `my-reservations-screen.tsx`, `agenda-screen.tsx`, `reschedule-control.tsx` bajo
  `src/features/reservations/presentation/`. Sin rediseño, contratos, SQL, Edge ni Auth.
  La condición nueva se aplica solo en Web; Android conserva la composición anterior.
- Nueva regresión `tests/presentation/booking/management-eligibility.test.mjs`: RED real
  de4 casos del defecto después de corregir únicamente el cargador de pruebas, luego
  GREEN8/8 (estados, consulta pendiente, legado, permisos refund y comportamiento Android).
  Suite de componentes directamente afectados38/38, TypeScript cliente/core, ESLint,
  Prettier y arquitectura cliente aprobados.3 pruebas del límite de escrituras del
  verificador aprobadas. No repetidas suites reales de concurrencia/replay ni las27
  anteriores completas; solo regresiones de componentes directamente afectados.
- Preflight LOCAL correcto:38 reservas/41 detalles,17 migraciones, oferta0050 v5,
  U3 propietario, trabajador barber/active, servicio15min/S25, plazos120min.
  Metro ya activo y Auth200; no se iniciaron/reiniciaron servicios.
- Chrome real abrió el acceso inicial de U3. Se detuvo en fase
  `owner-readonly-completed-controls` por `HTTP_CAPTURE_UNAVAILABLE`, seguido de parada
  deliberada `BROWSER_ERROR_STOP`. No se alcanzó la comprobación visual de B2.
  **0 comandos de negocio emitidos,0 verificados,0 reservas nuevas.** No hay respuestas
  HTTP de confirmación/receive/reschedule/cancel/refund que acreditar. No repetir.
- El fallo pertenece al capturador de respuestas del verificador, no demuestra un error
  de permisos de la aplicación. No se conservó metadata suficiente para determinar qué
  respuesta/cuerpo falló. Antes de otro intento hace falta discriminar respuestas vacías
  y preflight de Auth y registrar método/status/tipo sin datos sensibles; es diagnóstico
  pendiente, no causa de transporte confirmada. No se reparó ni reintentó tras la parada.
- Verificación final21:23:36UTC:38 reservas/41 detalles/25 care/61 care_events/
  49 reservation_events, filas de negocio protegidas idénticas, esquema/historial y
  `.env.local` iguales. B2 mantiene confirmed/completed/paid/cash2500 y sus dependencias.
  Perfiles, membresías, profesionales, otras barberías e identidades Auth intactos.
  `auth.users` registra el inicio legítimo de U3; una sesión nueva LOCAL aparece desde
  el intento. No hubo token capturado en memoria y no se pudo cerrar remotamente esa
  sesión. Navegador de prueba cerrado, sin nuevas autenticaciones ni revocación administrativa.
- Pendiente concreto: corregir/probar solo el capturador y resolver la sesión propia si
  procede con autorización; después un nuevo intento expresamente autorizado de A/B.
  Las dos citas y los ocho comandos siguen completamente sin ejecutar, sin consumir el
  cupo de negocio; la parada no autoriza reintentos. No revalidar B1/B2/2E.3.
  Recepción manual **Yape Web continúa pendiente por separado**. No B4 ni cierre de B3,
 004T027/010T008/005T012 por estos dobles.

## B3 — preparación de cancelación, reprogramación y reembolso (histórica)

20/11/2026. Solo lectura LOCAL y diagnóstico; B3 continúa abierto. No repetir B1/B2.
Evidencia de esta preparación: `docs/evaluacion/evidencias/004-reservas/b3-preparacion.json`.

### Estado comprobado y alcance pendiente

- PostgreSQL LOCAL identificado por contenedor/proyecto/puerto54422, saludable,
  transacciones `repeatable read read only`;17 migraciones.38 reservas,41 detalles,
  25 registros de atención/pago,61 eventos de atención/pago y49 eventos de reserva.
  Huellas de tablas y catálogo idénticas al cierre B2 y después de las lecturas.
  B2 `c4e9b153-9275-4a9d-9f32-f009bdb087d9` permanece
  `confirmed/completed/paid`, efectivo ficticio S/25. Las38 citas actuales son protegidas.
- Cancelación: backend/HTTP/atomicidad/límite inclusivo/repetición/liberación ya
  acreditados en E004 `cancellation.md`. Web está integrado en Mis reservas y Agenda;
  faltan cancelación real del cliente y excepción de personal desde Chrome (004T027).
  Cliente: hasta inicio menos120min, según snapshot de la cita; personal administrativo
  vigente o profesional asignado: motivo obligatorio, sin omitir restricciones de atención.
  El trigger rechaza atención iniciada/completada/inasistencia. Cancelar no devuelve dinero.
- Reprogramación: backend acreditado por010T006 y155 comprobaciones conjuntas008–010,
  incluidos10 pares concurrentes,201/409, replay, rollback y conservación financiera.
  Mis reservas y Agenda componen `RescheduleControl`, esta última con `staff` y motivo;
  `local-team-authority` activa su composición. Las notas antiguas de flags desactivados
  en010 son históricas. Falta Chrome de ambas capacidades, historial y estados010T008.
  Solo fecha/hora, misma reserva/profesional/servicios/precios/pago. Antelación LOCAL120min
  sobre el inicio vigente; personal fuera del plazo requiere motivo. No aplica a canceladas,
  iniciadas/completadas/inasistencia. Horario esperado obsoleto o colisión se rechaza sin cambios.
- Reembolso:005 tiene91 comprobaciones reales y10 pares;011 restringe actualmente
  `refund` al propietario principal, excluyendo secundarios y profesionales. Web ofrece
  «Registrar reembolso total externo» después de consultar una cita cancelada y pagada.
  Requiere motivo y atestación; no acepta parcial, pago pendiente o devolución duplicada.
  Mismas reglas para cash/Yape: solo registra devolución externa, nunca mueve dinero.
  Falta el recorrido Chrome con autoridad011 vigente;005T012 permanece abierto.
- Recepción manual **Yape Web sigue NO acreditada**. El cashB2 y un eventual reembolso
  cashB3 no la sustituyen. Verificarla por separado con autorización antes del cierre
  completo de pagos Web; Android conserva sus criterios propios. No probar Yape ahora.

### Defecto de presentación y archivos concretos

Diagnóstico con componentes reales renderizados mediante dobles, sin navegador ni red:
`RescheduleControl` ofrece «Reprogramar cita» para una reserva `confirmed` cuya atención
ya es `completed`; `CancellationControl staff` ofrece «Cancelar cita» en ese mismo caso.
Ambos dependen del estado de reserva, sin recibir el estado verificado de atención.
No se enviaron comandos contra B2. La protección SQL continúa presente; no se demostró
una vulneración ni se ejecutó ahora un rechazo real del servidor.

Corrección futura mínima: conectar elegibilidad de atención verificada a
`presentation/{booking-screen.tsx,care-control.tsx,cancellation-control.tsx,reschedule-control.tsx}`
y, si hace falta, `my-reservations-screen.tsx`/`agenda-screen.tsx`, dentro de
`src/features/reservations/`; agregar regresiones en `tests/presentation/booking/`.
Mientras no se conozca esa elegibilidad, evitar ofrecer acciones incompatibles sin
bloquear las citas heredadas por ausencia legítima de ledger. Conservar historial y
validación definitiva del servidor. No cambiar SQL, autenticación ni diseño. **No corregido
en esta preparación**; necesita autorización de código. CareControl es de consulta explícita:
tras cancelar, pulsar «Consultar atención y pago» antes de buscar el reembolso.

Pruebas ejecutadas ahora:27/27 de cinco archivos existentes, solo dobles/contratos locales:
`tests/presentation/booking/{cancellation,reschedule,care-control}.test.mjs` y
`tests/integration/booking/{reschedule,care}.test.mjs`. No repetir suites SQL/HTTP con escrituras.
Estas27 no incluyen una regresión de elegibilidad por atención; el diagnóstico la identifica
como brecha adicional. No recorrido B3 real de Chrome ni nuevas sesiones Auth en esta fase.

### Escenario mínimo propuesto (requiere autorización posterior)

Solo identidades ficticias existentes, sin cuentas nuevas ni cambios de membresías:

| Recurso | Identificador LOCAL |
| --- | --- |
| Barbería005 aislada0 | `4950d75f-e43b-459b-acf6-e138f9f051e1` |
| Cliente sin membresías | `aecfc300-c0ca-4005-bbda-d59c7ac2df69` |
| U3 propietario principal | `74a05d0a-f21f-44f5-8de2-549ba4dba76f` |
| Profesional asignado | usuario `8ff39bfd-5242-4058-8875-b2d378500d91`; perfil `4c1860a5-64fa-441e-9ae1-9c0fb8f9e527` |
| Servicio activo | `0805ab4a-c879-4054-a2d9-1de5af150407`,15min,S/25 |

Oferta publicada v5, profesional/asignación activos, horarios existentes y perfiles
verificados por lectura. Credenciales ficticias existentes, sin imprimirlas ni restablecerlas;
la autenticación de las sesiones futuras deberá usar GoTrue LOCAL normal.

**Dos reservas nuevas A/B son el mínimo para comprobar las cancelaciones cliente y
administrativa sin mutar citas acreditadas.** Solo sirven como fixtures de B3: no iniciar
ni completar atención ni repetir el recorrido B2. Elegir horarios desde disponibilidad
real después de autorizar; no fijarlos desde este documento como si estuvieran reservados.

- A: inicio >120min desde reloj servidor con margen amplio. Candidatos leídos sin
  ocupación:21/11/2026 09:00–09:15 Lima y nuevo horario10:00–10:15. Son ejemplos,
  no disponibilidad garantizada ni reserva. Confirmar efectivo ficticio pendiente.
- B: inicio próximo, entre30 y90min desde reloj servidor y dentro de horario; paso15min.
  Otro slot contiguo libre para la excepción de reprogramación administrativa. Revalidar
  al ejecutar para no usar fechas pasadas, colisionar ni alterar políticas.

| Caso y actor | Precondición/acción Web | Resultado esperado | Escrituras de negocio autorizables |
| --- | --- | --- | --- |
| Preparar A/B, cliente | Crear únicamente estas dos citas cash pendientes | Dos IDs nuevos aislados; sin tocar las38 previas |2 confirmaciones:10 INSERT en total (2 reservas,2 detalles,2 care,2 eventos confirmed,2 eventos created) |
| A pagada, U3 | Agenda→consultar atención/pago→registrar recepción ficticia completa | `paid`,S/25; atención sigue confirmed |1 receive:1 UPDATE care+1 INSERT evento |
| Reprogramación inválida, cliente | En A, consultar fecha inválida y fecha de B; comprobar que el horario ocupado por B no aparece | Error recuperable/slot excluido; A/B intactas |0; no enviar una mutación manipulada. Reutilizar409/rollback históricos para rechazo del servidor |
| Reprogramación válida, cliente | Mis reservas→A→Reprogramar→consultar/elegir nuevo horario→confirmar |201, mismo ID/items/precio/pago; historial y agenda reflejan el cambio; anterior slot libre si no existe otro impedimento |1 reschedule:1 UPDATE reserva+1 INSERT reschedule_events |
| Cancelación válida, cliente | Mis reservas→A, todavía fuera de120min→confirmar cancelación |200, reserva/atención canceladas, pago todavía paid; slot liberado bajo reglas vigentes |1 cancel:1 UPDATE reserva+1 UPDATE care por trigger+1 INSERT reservation_events |
| Cancelación y reprogramación prohibidas, cliente | En B dentro de120min, comprobar mensaje sin cancelación; solicitar nuevos horarios de B desde UI | Sin cancelar; consulta de reprogramación denegada por política, sin cambios |0; no intentar cancelar B por HTTP para repetir evidencia suficiente |
| Excepción de reprogramación, U3 | Agenda→B→nuevo horario libre→motivo explícito→confirmar fuera del plazo del cliente |201; mismo ID y pago pending; historial capacity administrator/motivo |1 reschedule:1 UPDATE reserva+1 INSERT reschedule_events |
| Cancelación administrativa, U3 | Agenda→B aún sin atención iniciada→motivo→confirmar |200, cancelada/pending, sin recepción ni reembolso inventados |1 cancel:1 UPDATE reserva+1 UPDATE care+1 INSERT reservation_events |
| Reembolso total, U3 | En A cancelada/paid, consultar atención/pago→reembolso total externo→motivo ficticio y confirmación |200; refunded cashS/25, actor propietario/evento único; cliente/profesional no reciben facultad refund |1 refund:1 UPDATE care+1 INSERT evento; ningún dinero real |

Precondiciones/negativos de atención completada y conflicto concurrente: reutilizar
evidencia real004/005/010 y agregar regresión local de presentación. **No pulsar acciones
mutantes sobre B2 ni las37 anteriores para demostrar un rechazo.** Consultar permisos del
profesional es lectura; no promoverlo ni usarlo para intentar un reembolso.

### Autorización y comprobaciones exactas para la ejecución futura

1. Autorizar corrección limitada de elegibilidad Web y regresiones; preparar un verificador
   que limite mutaciones a los DOS IDs nuevos, registre respuesta HTTP antes de afirmar éxito
   y no reintente escrituras de resultado incierto. Verificar primero el estado persistido.
2. Autorizar sesiones auténticas LOCAL de cliente/U3/profesional y **8 comandos de negocio**:
   2 confirm,1 receive cash ficticio,2 reschedule (cliente/personal),2 cancel,1 refund cash
   ficticio. Sin configurar políticas, Yape, atención, cuentas ni datos anteriores.
3. Huellas antes/después de las38 reservas/41 detalles actuales y dependencias; resto de
   tenants, profesionales, servicios, permisos y catálogo sin cambios. Mantener nuevos datos
   y auditoría, sin limpieza ni borrar historia. Sesiones propias se cierran al finalizar.
4. Efecto previsto:16 INSERT y8 UPDATE de negocio, solo A/B; final40 reservas/43 detalles,
   27 care,65 care_events,53 reservation_events y2 reschedule_events adicionales.
   A=`cancelled/cancelled/refunded`;B=`cancelled/cancelled/pending`. Los UPDATE afectan
   exclusivamente las2 reservas nuevas y sus2 ledgers. Sin DELETE, correos o dinero real.
   Auth puede registrar sesiones/inicios legítimos; no confundirlos con cambios de perfiles.
5. No repetir carreras ni replays acreditados; no iniciar B4. Cerrar componente Web B3 solo
   con Chrome+HTTP+SQL y conservación aprobados.004T027/010T008/005T012 conservan también
   sus condiciones Android y manuales; no marcar especificaciones completas automáticamente.

Incidencia del lector: una consulta de oferta usó `price`, columna inexistente; falló
antes de producir datos y terminó sin escrituras. Corregido solo el SELECT a `price_amount`
tras consultar el esquema, sin alterar código/SQL de aplicación ni servicios.

## B2 — continuación completada: efectivo, atención y filtros Web

20/11/2026: cerrada técnicamente la continuación autorizada sobre la MISMA reserva
c4e9b153-9275-4a9d-9f32-f009bdb087d9. No segunda reserva, confirmación repetida niB3.

- Causa demostrada deWEB_EVALUATION_FAILED: SyntaxError en la expresión que elverificador
  enviaba aChrome para leer contexto; split tenía salto delínea literal dentro de comillas.
  Página/context ya estaban cargados, body presente. No fallo deApp/Auth/Edge/PostgreSQL.
  Solo corregido elescape delverificador yla espera delestado seleccionado. Dos regresiones
  ejecutan laexpresión real extraída deloperador: fallan antes porSyntaxError y pasan después;
  cuatro regresiones existentes decontexto también aprobadas. No repetir28pruebas previas.
- PreflightREADONLY confirmó38reservas/41detalles, mismacita confirmed/confirmed/pending,
  soloeventocreated,barbero activo/asignado,baseline sin cambios. AgendaWeb profesional
  muestra cita ypermisosattend/receive. Los filtrosadministrativos no se exponen albarbero.
- Receive200:20:27:36UTC,pagopaid,atenciónconfirmed. Se esperó alservidor sin relojalterado:
  starts_at20:30UTC, lectura antes deiniciar20:30:00.240UTC; start200 confirmado20:30:00.726UTC.
  Complete200 confirmado20:30:01.116UTC. Elcontrato solo exige iniciar antes decompletar,
  no esperar los15min completos; es ensayo sintético, no atención física acreditada.
- U3 consultó agenda/filtros solo porlectura: Completada+Recibido incluye esta cita;
  Pendiente depago laexcluye; Todos/Todas larestaura. Cliente relee mismareserva enMisreservas
  conCompletada/Recibido. Tres comandos exactamente:receive/start/complete, todosHTTP200.
- EstadoSQL final:reservaconfirmed/atencióncompleted/pagopaid/cash/S25, mismoprofesional/
  servicio/fechas. CuatrocareEvents únicos:created/receive/start/complete, actorescliente y
  barbero correctos; un únicoevento dereservaconfirmed. Las tres sesiones propias cerradas204.
- Lectura final20:30:44UTC acredita38reservas/41detalles/25care/61careEvents/49reservationEvents.
  Se conservan porhash cadafila delas37reservas/40detalles anteriores ytodos sus pagos/
  atenciones/perfiles/membresías/otros tenants/servicios/horarios/ofertav5. Ochofilas nuevas
  acumuladas y3updates delnuevoledger corresponden alplan, sin limpieza. Auth200/DBhealthy.

Evidencia `docs/evaluacion/evidencias/004-reservas/b2-continuacion.json`, enlazada con la
confirmación201 anterior yla evidencia005 reutilizada. B2 queda completado enelrecorrido
Web deefectivo yfiltros acordado, sin pendientes obligatorios deeste ensayo. No cerrar
por ello toda005/T012 conjuntaWebAndroid ni afirmar nueva recepciónYape porWeb; no se
repetirá elflujo cash para cubrirlos. App/servidor/SQL/RLS/Edge/Cloud/Android/servicios intactos
enesta continuación. B3 requiere autorización independiente. Apartados siguientes históricos.

## B2 — ejecución parcial detenida después de confirmar

20/11/2026, nueva autorización acotada. Corregido únicamente disabled deConfirmar reserva
en booking-screen.tsx cuando careEnabled ysinmétodo, conservando busy/retryincierto/legacy.
Seis regresiones nuevas; caso sinmétodo falla antes y pasa después.28pruebas dirigidas,
tipos/lint/formato/grafo aprobados, incluida deduplicación del caso deuso. No servidor cambiado.

Chrome/sesiónreal delcliente confirma UNA reserva HTTP201:
`c4e9b153-9275-4a9d-9f32-f009bdb087d9`,005aislada0, servicio0805ab4a,perfil4c1860a5,
clienteaecfc300,trabajador8ff39bfd,efectivoficticio,S/25/15min. Inicio20/11/2026
15:30Lima(20:30UTC),fin15:45(20:45UTC); reloj alseleccionar15:17:11Lima y margen>=5min
revalidado antes deconfirmar. Nuevareserva visible enMisreservas yCareControl consultado;
permisos delcliente no permiten atender/cobrar. No se repitió B1como recorrido completo.

El verificador terminó conWEB_EVALUATION_FAILED preparando accesoWeb delprofesional
(faseworker-sign-in). Hubo sesiónGoTrue capturada ylogoutpropio204; no se demuestra fallo
decontraseña/Auth/Edge. Detalles completos deexcepción delRuntime no fueron retenidos por
elverificador; causa exacta pendiente de diagnóstico. No parche especulativo, reintento de
negocio ni reparación automática. Ambas sesiones propias cerradas204.

Lectura final20:18:31UTC: reservaconfirmed,atenciónconfirmed,pagopending/cash,2500minor.
UN evento public.reservation_events confirmed yUN care_eventcreated. Solo cincoINSERT:
reserva,detalle,ledger,eventoreserva,eventocare. Receive/start/complete NO emitidos; sus
trescareEvents y3updates previstos no ocurrieron. Agenda profesional/filtros/estadosfinales
completados-pagados NO acreditados. No declararB2 terminado.

Totales actuales38reservas/41detalles/25care/58careEvents/49reservationEvents. Todas las
37reservas originales/40detalles, registros deatención/pagos,perfiles,membresías,otros
tenants yschema/historial conservados porcomparación dehuellas porfila; únicamenteAuthusers
cambia poraccesos autorizados. Auth200/DBhealthy. NoCloud/SQL/RLS/Edge/servicios/horarios/
precios/propiedad/B1/Auth niB3 modificados. Conservar nuevareserva ysu auditoría.

Evidencia `docs/evaluacion/evidencias/004-reservas/b2-ejecucion.json`. Nueva autorización
para diagnóstico deentradaWeb ycontinuación SOLO de receive/start/complete sobre esteID,
además de agenda/filtros/lecturas; no crearsegunda reserva ni repetirconfirmación. No
cambiarhora/cancelar/limpiar esta cita poriniciativa. La preparación inferior es histórica.

## B2 — preparación dirigida, sin ejecución ni cierre

Lectura LOCAL20/11/2026: esquema/datos íntegros,37reservas/40detalles/24care/57careEvents/
48reservationEvents. Servicio005 sigue S/25,15min,activo; shop publicado,v5,notice0/step15/
horizonte30d/buffer0. Profesionalactivo con7intervalospropios/7delshop yvínculo alservicio.
Cliente confirmado conperfil/contraseña disponible,sinmembresías/sinreservasfuturas;
profesionalbarber/active en0050/0051. No se iniciaron sesiones ni se escribieron datos.

### Implementación y evidencia reutilizada

- Selección de slot→revisión→PaymentChoice→confirmación: booking-screen.tsx y
  booking-application.ts→reservation-http-adapter→reservation-command→SQL atómico.
  Se revalidan publicación,servicios/capacidades/horarios/buffer,identidad,precio/plazo/límites,
  exclusión de persona entre barberías yrequestId. Método es obligatorio para reservas nuevas.
- Misreservas yagenda renderizan BookingCard, que incluyeCareControl; sí existe conexión
  deconsulta/transiciones en ambas superficies. Composiciónreservations habilita care en
  local-team-authority. No reconstruir módulos ni exigir cambios debackend sin fallo demostrado.
- T019/T023 yB1 quedan acreditados; E005 real-tests.json/T011 conserva91comprobaciones
  SQL/HTTP y10pares concurrentes. No se relanzaron esos ensayos. Falta recorridoWeb005/T012
  yfiltrosFR014 conmisma cita nueva ycapacidades actuales; no afirmar aceptación por código.
- Efectivo/Yape son registro de recepción externa manual. Estados pending/paid/refunded.
  Cliente elige método, no confirma cobro. Recibe principal/secundario operativo oprofesional
  asignado activo; solo profesional asignado atiende, aunque otro actor sea propietario.
  Yapeconfigurado en0050, pero no hay cobro/verificación bancaria automática.
- Atenciónconfirmed→in-service→completed; iniciar requiere relojservidor>=starts_at,
  completar requiere iniciada yno exige esperar duración completa. Pagar noatiende ni
  atendercobra. Reserva final sigueconfirmed, atencióncompleted,pagopaid. No crear estado
  completed enpublic.reservations. No-show/cancel/refund quedan fuera deeste escenario.

### Defecto puntual demostrado sin modificar código

Con dobleWeb del BookingContent actual, careEnabled=true,sinpaymentMethod ysinbusy:
«Confirmar reserva» tiene disabled=false, peroonPress noinvoca confirm. Es una acción
habilitada sin efecto, no unbypass de seguridad. Fuente:
`src/features/reservations/presentation/booking-screen.tsx`, botón deconfirmación.
Prueba local aislada sinHTTP guardada en `.artifacts/b2-preparation/presentation-result.json`.
Solicitar corrección mínima: deshabilitar cuando careEnabled yno haymétodo, conservando
reconciliación pending ycomportamiento legacy; regresiones en
`tests/presentation/booking/booking.test.mjs` ypruebas005 afectadas. No se corrigió aquí.
No se demostraron otros defectos de integración deB2 enesta preparación.

### Escenario único propuesto y permisos necesarios

- Barbería005aislada0:4950d75f-e43b-459b-acf6-e138f9f051e1.
- Cliente:aecfc300-c0ca-4005-bbda-d59c7ac2df69, perfil confirmado,sinmembresías.
- Barbero:8ff39bfd-5242-4058-8875-b2d378500d91; perfil4c1860a5-64fa-441e-9ae1-9c0fb8f9e527.
- Servicio:0805ab4a-c879-4054-a2d9-1de5af150407; efectivo ficticio,S/25,15min.
- Candidato leído:20/11/2026 15:15–15:30 Lima (20:15–20:30UTC), sincruces porpersona
  entrebarberías enlalectura de15:04:20. **No está reservado ni garantizado al ejecutar.**
  Tras autorización, revalidar conAPI elpróximo slot15min queempiece almenos5min después
  delrelojservidor. Si elcandidato ya pasó, no intentar reservarlopasado ni cambiar relojes.
  El usuario debe autorizar esta regla de elección dinámica, no una hora obsoleta.

RecorridoWeb: acceder conclienteexistente→seleccionarslot/métodoefectivo→Confirmarreserva
una vez→ver mismonuevoID enMisreservas/agenda delbarbero→barberoConsultar atenciónypago→
Registrar pagorecibido/Confirmar operación (solo simulación autorizada)→esperar inicio real
delservidor→Iniciar atención/Confirmar→Completar atención/Confirmar→cliente/agenda releer
estados e historial. U3 puede consultar agenda/filtrosadministrativos, sin escrituras.
No repetir login como módulo ni descubrimiento completo; preparar selección mínima necesaria.

Cuatro comandos mutadores:confirm(201),care/receive(200),care/start(200),care/complete(200).
Confirmación inserta1reserva,1detalle,1booking_care,1reservation_event y1care_eventcreated.
Cada transición actualiza solo ese nuevo booking_care e inserta1care_event. Total8filas
nuevas y3updates de lamisma filanueva:careEvents4 (created/receive/start/complete).
Esperado final38reservas/41detalles/25care/61careEvents/49reservationEvents;14usuarios,
13perfiles,13membresías,servicios/horarios/propiedad/ofertav5 intactos.

UsarLOCALprincipal conaislamiento porIDs nuevos yallowlist: no se necesita modificar
ningunade37citas anteriores. Comparar hashes porfilapreexistente, no exigir huella global
igual entablas donde se autorizan INSERT. Guardar nuevos IDs/requestIds sinJWT/credenciales,
conteos y eventosexactos; conservar nueva cita sintética comoevidencia, sin limpieza implícita.
Base desechable exigiría clonarAuth/configurarAPI/Edge yotroentorno para navegador; no se
justifica operarla aquí para uncaso aditivo, ni está autorizada su creación enesta fase.

Autorizar concretamente: corrección puntual delbotón ysusregresiones; sesionesnormales de
las cuentas identificadas;1reserva nueva conledger y4eventoscare;3transiciones exclusivas
sobreesa nuevacita; selección dinámica dentro delas reglas; lecturasdecliente/barbero/U3.
No precios/horarios/configuración,cancelaciones/reembolsos,otrascitas,correos o nuevascuentas.
Si resultadoincierto, reconciliar primero porrequestId/SQL, sin repetirconfirmación opago
automáticamente. Si conflicto antes de confirmar, no crearotra reserva poriniciativa.

Éxito: igualID/importe/método/profesional enWeb/SQL, tresestados finales correctos, eventos
únicos, permisosservidor correctos, filtrosFR014 verificados,37originales íntegros ysesiones
propias cerradas. Yapebackend se reutiliza deE005; este escenariocash no acredita nueva
recepciónYape desdeWeb. Android/flujoB3 no se cierran con este caso.

Evidencia depreparación: `docs/evaluacion/evidencias/004-reservas/b2-preparacion.json`.
B2 pendiente deautorización/ejecución; ningún comando mutador,sesión o corrección ejecutados.

## Actualización B1 — cierre del alcance Web acordado

20/11/2026: B1 funcionalmente completado para exploración/preparación de reserva,
edición descriptiva reversible y pausa/republicación solicitadas. No cierra toda004/T013
ni implica haber probado alta de servicios, cambios financieros, retirada de oferta,
invitación de barberos o Android. No repetir este recorrido ni iniciar B2 automáticamente.

- Inspección B1 anterior:6barberías publicadas visibles y2borradores correctamente excluidos;
  Chrome real de Inicio→Explorar/búsqueda/vacío→detalle→booking→servicio/profesional/fecha/
  disponibilidad, sin confirmar. Evidencia privada `.artifacts/b1-readonly/final-verification.json`.
- Ensayo autorizado actual: propietarioU3 en005aislada0, servicio0805ab4a-c879-4054-a2d9-1de5af150407.
  Se cambió únicamente descripción desde /services yse restauró suvalor exacto original
  (cadena vacía); nombre/precio/duración/active sin cambios. Ambas solicitudesHTTP200 ySQL
  confirman persistencia; el detalle decliente refleja descripción temporal yrestaurada.
- /barbershop-admin: published→paused→published, dosHTTP200. Pausada sigue enlistado/catalogo,
  botónreservar deshabilitado yslotsvacíos. Republicada, botónhabilitado yslots disponibles.
- Cuatro escrituras totales, versiones1→2→3→4→5 conservadas. El contrato registra versión,
  no nuevos eventos dedicados deauditoría deoferta; todos los eventos existentes intactos.
-37reservas/40detalles/atención/pagos/perfiles/profesionales/membresías/horarios/servicios y
  otrasbarberías idénticos porhuellas. Servicios completos restaurados; settings solo difiere
  enversión. Sesión propia cerrada204. Sin App/Cloud/SQL/RLS/Edge/Android/servicios modificados.
- No hizo falta corregir frontend.11regresiones del capturador ycontrol estático deloperador
  aprobados; no se repitieron suites funcionales ya acreditadas. Las vistas comerciales se
  consultaron con la misma identidad legítimaU3; no se acredita push entre pestañas abiertas.

Evidencia pública: `docs/evaluacion/evidencias/004-reservas/b1-oferta-web.json`.
Las filas amplias de lamatriz conservan pendientes fuera deeste ensayo; no convertir su
estado enuna exigencia de repetir elB1 pactado. Próxima autorización independiente: B2.

## Alcance y método

Inspección de especificaciones001–011, tareas, contratos, composición, rutas, aplicaciones,
adaptadores, entradas Edge, migraciones y evidencias indicadas abajo. Autenticación003/007
se considera cerrada para el flujo Web por instrucción del usuario: no reauditar ni reabrir.
Sus gates académicos/Android no se convierten por ello en funcionalidades Web faltantes.
Google deshabilitado en local-team-authority es intencional.

No se ejecutaron pruebas de negocio, nuevas sesiones, SQL ni solicitudes Cloud en esta fase.
No se inspeccionaron credenciales. Baseline reutilizado: verificación LOCAL de2E.3 del
20/11/2026 19:01UTC, 17migraciones,14usuarios,13perfiles,8barberías,13membresías,
37reservas/40detalles/24registros deatención,57eventos deatención/48eventos dereserva,
7invitaciones y10eventos deautoridad. Es evidencia reciente, no un nuevo sondeo de servicios.

**Conclusión:** el núcleo de negocio está ampliamente implementado y probado por SQL/HTTP.
No hay evidencia de que falte escribir desde cero reservas, cobros manuales o atención.
Falta acreditar el recorrido Web integrado actual, especialmente operación de oferta,
filtros de atención/pago, cambios propios y reprogramación desde la interfaz. Si falla,
corregir el defecto demostrado dentro del bloque autorizado. No tratar pruebas históricas
con roles anteriores a la jerarquía como certificación automática de sus nuevas facultades.

VERIFICADA significa evidencia suficiente **para la funcionalidad y capa expresadas en la fila**;
una fila de backend verificada no cierra su fila de recorrido Web. Los datos de prueba antiguos
no deben operar como si fueran citas nuevas: algunas reservas tienen ledger005 y otras no.

## Referencias de implementación y evidencia

Las abreviaturas de las tablas resuelven rutas reales relativas al repositorio.

- **O:** `src/features/barbershop-operation/{application/operation-application.ts,infrastructure/operation-http-adapter.ts,presentation/operation-screen.tsx}`; composición `src/composition/{barbershop-operation-composition.ts,operation-route.web.tsx}`.
- **P:** `src/features/barbershop-operation/presentation/{self-professional.tsx,self-schedule.tsx,own-summary.tsx}` y aplicaciones homónimas (`self-professional` usa operation-application).
- **H:** `src/features/reservations/{application/private-home.ts,presentation/private-home-screen.web.tsx}`; `src/composition/private-home-route.web.tsx`.
- **R:** `src/features/reservations/{application/booking-application.ts,application/request-reservation.ts,infrastructure/reservation-http-adapter.ts,presentation/booking-screen.tsx,presentation/my-reservations-screen.tsx}`; `src/composition/{booking-route.tsx,reservations-composition.ts}`.
- **G:** `src/features/reservations/{application/agenda-application.ts,presentation/agenda-screen.tsx}`; `src/composition/agenda-route.tsx`.
- **C:** `src/features/reservations/{application/care.ts,domain/care.ts,presentation/care-control.tsx,presentation/payment-choice.tsx}`.
- **X:** `src/features/reservations/{application/reschedule.ts,presentation/reschedule-control.tsx,presentation/cancellation-control.tsx}`.
- **A:** `src/features/barbershop-operation/{application/team-authority.ts,application/admin-invitations.ts,presentation/team-authority-panel.web.tsx,presentation/admin-invitations.tsx}`; `src/composition/use-team-authority.ts`.
- **F:** `src/features/authentication/presentation/{personal-profile-editor.tsx,account-screen.tsx}`; `src/features/tenant-foundation/{application/profiles.ts,application/barbershops.ts,infrastructure/tenant-foundation-http-adapter.ts}`.
- **Servidor:** `supabase/functions/{barbershop-operation,reservation-command}/index.ts`, aplicaciones/adaptadores en `supabase/functions/_shared/{barbershop-operation,reservations,tenant-foundation}/`; tablas/RLS/RPC en las17migraciones de `supabase/migrations/`.
- **E004:** `docs/evaluacion/evidencias/004-reservas/`: `atomic.md`, `agenda.md`, `demo-android-web.md`, `cancellation.md`, `cache.md`, `booking-web.md`, `operation-web.md`, `verificaciones.json`, subcarpetas `t008-t011`, `t012-t016`, `t017-t019`, `t020-t023`, `t024-t027`, `t028-t029`.
- **E005:** `specs/005-atencion-pagos-manuales/{real-tests.json,tasks.md,quickstart.md}`:91 comprobaciones reales y10pares concurrentes. No son91pruebas E2E de navegador.
- **E810:** últimas actualizaciones de `specs/{008-autogestion-profesional,009-horarios-profesionales,010-reprogramacion-reservas}/{tasks.md,quickstart.md}`:155comprobaciones conjuntas, incluyendo10pares reales de reprogramación; no155por módulo. Manifiesto privado referenciado, no copiado.
- **E011:** `specs/011-equipo-resumen-profesional/tasks.md`, `contracts/team-authority-2c4-result.json`, `team-authority-2c8-result.json`, `team-authority-2c9-result.json`, `team-authority-2e-result.json`, `team-authority-2e3-{retry,existing,web-replay,removal}-result.json`. En esos mismos contratos: `team.md`, `team-authority.md`, `admin-invitations.sql`, `professional-summary.sql`.
- **Pruebas existentes:** `tests/integration/booking/`, `tests/presentation/booking/`, `tests/server/{barbershop-operation,reservations}/`; no se relanzaron suites ni operadores de fixtures en Fase0.

Los encabezados antiguos de algunas specs dicen «pendiente» aunque sus tareas posteriores
acreditan activación/escrituras. Esta matriz usa la última evidencia fechada, no suma casillas
cronológicas como si fueran criterios nuevos. No modifica esas fuentes aprobadas.

## Matriz funcional maestra

Prioridad P1: camino crítico; P2: cierre funcional complementario; P3: fase independiente.
«Ninguna nueva» en pendientes significa conservar evidencia, no volver a probar por rutina.

| Módulo | Funcionalidad | Spec/contrato | Archivos/ruta | Estado actual | Evidencia existente | Qué falta exactamente | Dependencias | Prioridad |
|---|---|---|---|---|---|---|---|---|
| Acceso | Flujo autenticación Web aprobado |003/007|Rutas auth existentes|VERIFICADA|Aceptación usuario, seguimiento|Ninguna nueva; fuera de auditoría|Configuración habitual conservada|Conservar|
| Barberías | Creación atómica, dueño y membresía |002 FR008–009;011 HA001|F; O; /barbershop-admin?view=create; SQL foundation/team_authority|VERIFICADA|E011 ensayos SQL/activación;002|No repetir garantías atómicas|Identidad/perfil confirmado|P1|
| Barberías | Crear y editar configuración desde Web actual |004 FR001,007;011|O; /barbershop-admin y?view=create|VERIFICADA|A1–A3 Chrome201/200/200+SQL; mismoID, propietarioU3, nombre y configuración nuevos; sin duplicación|Conservarfixture; no repetir|41reservas previas intactas,42actuales|P1|
| Barberías | Publicar, pausar y retirar oferta |004 FR002;011 HA003|O; set-publication|VERIFICADA|B5 cierre: retirada previa Chrome200; ausencia real Explorar/Reservar y catálogo/slots500 P0002 NOT_AVAILABLE; republicación Chrome200, published/v19 y reaparición/slots200; b5-cierre-web-local.json|Ninguna repetición; conservar fixture publicado y evidencia|42 reservas/45 detalles y todas las huellas protegidas intactas; mismo UUID/owner|Conservar|
| Barberías | Interruptor genérico activo/inactivo |004 FR002|O|NO APLICA|Estados definidos draft/published/paused/withdrawn|Usar estados pactados; no inventar booleano nuevo|Publicación|—|
| Seguridad | RLS/aislamiento por barbería y contexto |002/004 FR019/011 HA010|Servidor; SQL; workspace-access|VERIFICADA|E004 roles/ACL; E011 SQL yHTTP|Reutilizar negativos y carreras; aplicar regresiones solo si cambia código|Membresías activas|P1|
| Servicios | Alta, edición, descripción, precio PEN y duración |004 FR003|O; /services|VERIFICADA|C1C2 Chrome200/SQL:unservicio25/15→30/30, catálogo correcto; originales intactos|Conservar servicio nuevo y snapshots; no repetir|IDs y HTTP enb523-funcional.json|P1|
| Servicios | Activar/desactivar sin borrar historial |004 FR003,008,016|O; upsert-service|VERIFICADA|C3C4 Chrome200/SQL; activo false/true y proyección comercial excluye/incluye servicio|No repetir toggles|Ningún servicio previo alterado|P1|
| Profesionales | Alta administrativa, activación y vínculos a servicios |004 FR004;011 HA003|O; /staff?view=team|VERIFICADA|B4 Chrome/U3: perfil nuevo deU4, desactivar/reactivar/asignar servicio,4HTTP200/SQL; U4 conserva rolbarber|Conservar fixture; no repetir; no implica horarios/citas nuevos deese profesional|Aceptación Android y otros criterios004 separados|Conservar|
| Profesionales | Leer perfil propio y horario después de retirada |008/009|P; /staff?view=professional|VERIFICADA|E011 removal: HTTP200 yperfil leído en Chrome|Ninguna nueva para esta lectura|Membresía barber/active|Conservar|
| Profesionales | Editar nombre profesional propio |008 FR001–003|P; update-own-professional|VERIFICADA|B4 Chrome2HTTP200/SQL, nombre temporal y restauración exacta visibles tras navegación; seguridadE810 reutilizada|No repetir;008T007 conjunta/Android conserva gate|Sin nuevas escrituras necesarias Web|Conservar|
| Profesionales | Intervalos generales, por profesional y cierres administrados |004 FR007–008|O; /schedules|VERIFICADA|D1–D6 Chrome200/SQL;7+7intervalos,local restaurado,cierre lógico con motivo yuna auditoría;slots recuperados200|Conservar cierre withdrawn yeventos;no replay adicional|42reservas/45detalles;41previas intactas|P1|
| Profesionales | Autogestión intervalos/bloqueos y versiones |009 FR001–006|P; self-schedule; /schedules|VERIFICADA|B4 Chrome5HTTP200/SQL:7intervalos modificados/restaurados, bloqueo creado/editado/retirado, slots coherentes; versiones legítimas conservadas|No repetir;009T007 conjunta/Android conserva gate|IDsintervalos pueden cambiar; no restaurar versiones|Conservar|
| Profesionales | Garantía de no invalidar citas al cambiar horarios |004 FR008/009 FR004–005|SQL; P/O|VERIFICADA|E810 rechazos yrollback reales|Ninguna repetición de carreras por rutina|Exclusión/versión|P1|
| Exploración | Listado visible sin membresía, paginación |004 FR009|H; /account?view=explore; list_booking_barbershops|VERIFICADA|B1: catálogoHTTP yrecorridoChrome LOCAL; paginación conserva evidencia previa|Ninguna repetición delrecorrido acreditado|Oferta/catálogo existentes|Conservar|
| Exploración | Buscar por nombre de barbería |004 catálogo; H|H; parámetro q|VERIFICADA|B1: catálogoHTTP yrecorridoChrome LOCAL; paginación conserva evidencia previa|Ninguna repetición delrecorrido acreditado|Oferta/catálogo existentes|Conservar|
| Exploración | Filtros por geolocalización, estrellas o precio |Sin contrato vigente001–011|H|NO APLICA|No API/campos de esas funciones en catálogo actual|Requieren ampliación aprobada si se solicitan|Nueva especificación|P3|
| Exploración | Detalle, servicios y profesionales visibles |004 FR009–010|H; /account?view=shop&shop=…; get_booking_catalog|VERIFICADA|B1: catálogoHTTP yrecorridoChrome LOCAL; paginación conserva evidencia previa|Ninguna repetición delrecorrido acreditado|Oferta/catálogo existentes|Conservar|
| Reservas | Seleccionar barbería, varios servicios, profesional específico/cualquiera |004 FR010|R; /booking|VERIFICADA|E004 booking-web: reserva/citas propias aprobadas por usuario|Conservar aceptación; solo puente nuevo desde H se prueba enB1/B2|Oferta compatible|P1|
| Reservas | Fecha/hora y disponibilidad vigente, precio/instantáneas |004 FR011–016|R; SQL booking_atomic|VERIFICADA|E004 atomic/HTTP/carreras/snapshots|Ninguna repetición exhaustiva|Horarios/capacidades|P1|
| Reservas | Confirmación atómica, conflicto y deduplicación |004 FR012–016|R; reservation-command; SQL|VERIFICADA|E004 atomic ybooking-web; E005 bloqueo confirmador antiguo|No usar RPC antigua sin método; conservar controles|JWT/SQL/método005|P1|
| Reservas | Mis reservas, detalle e historial propios |004 FR017|R; /my-reservations|VERIFICADA|E004 booking-web: citas propias/F5/protección aprobados|No repetir; campos005/010 nuevos sevalidan en sus bloques|Identidad propia|P1|
| Reservas | Agenda profesional y administrativa base |004 FR018/T023|G; /agenda|VERIFICADA|E004 demo-android-web: aprobación posterior delusuario; SQL/HTTP roles|No repetir T023. Validar solo incorporaciones005 ydelta depermisos011 en sus filas|Citas autorizadas/contexto|Conservar|
| Reservas | Cancelación atómica, plazo, motivo, liberación |004 FR020–022|X; cancel-reservation; SQL|VERIFICADA|E004 cancellation yHTTP/rollback/idempotencia|Reutilizar backend; UI se trata en siguiente fila|Reserva cancelable|P1|
| Reservas | Cancelar desde Web y consultar resultado |004 T027|X; /my-reservations y /agenda|VERIFICADA|B3 cliente A y U3 B Chrome200/SQL/auditoría/liberación; bloqueo cliente B sin mutación; elegibilidad comprobada en B2|Conservar evidencia; no repetir A/B ni atribuir recorrido Codex al usuario|004T027 conjunta/Android conserva gate propio|Conservar|
| Reservas | Reprogramación atómica conservando misma reserva/pago |010 FR001–005,007|X; SQL booking_reschedule|VERIFICADA|E810 155 conjuntas/10pares/201–409/replay/rollback|No repetir carreras ni replay acreditados|Estado/política/slots|P1|
| Reservas | Reprogramar desde Web, excepción con motivo ypolítica |010 T008|X; /my-reservations y /agenda; O/C política|VERIFICADA|B3 cliente A y U3 B Chrome201/SQL, historial Web con motivo y liberación, pago/items conservados; cliente B slots403; política intacta|Conservar evidencia; no repetir cambios, carreras ni replays|010T008 conjunta/Android conserva gate propio|Conservar|
| Pagos | Selección efectivo/Yape para nueva reserva |005 FR005–007|R/C; payment-choice|VERIFICADA|CashB2 y B5.1 Chrome real: Yape confirm201, recepción ficticia200 por profesional; SQL/auditoría e integridad40previas acreditadas; b51-ejecucion.json|Conservar evidencia y cita11ccc730-9194-4f8e-9007-1b2bd419718e confirmed/confirmed/paid/yape/S25; no repetir|41reservas/44detalles; sin dinero real/configuración/atención; guardarYape yAndroid separados|Conservar|
| Pagos | Configuración de instrucciones Yape del tenant |005 FR006,011;011|C; CareSettings /agenda|VERIFICADA|Y1Y2 Chrome200/SQL; SHA256 original restaurado exacto0050,tolerancia10,2configured|Conservar auditoría;no repetir configuraciones|Sin recepción ni dinero real|P1|
| Pagos | Recibir pago manual único, atestación eimporte servidor |005 FR008–010|C; /agenda; reservation-command|VERIFICADA|E005 91comprobaciones/10pares y auditoría|No repetir carreras; cerrarUI en bloqueB2|Personal autorizado/cita|P1|
| Pagos | Operar cobro desde Web yconsultar pendientes/historia |005 FR014,016;T012|C/G; CareAgendaFilter|VERIFICADA|B2 cashWeb200/filtrosadmin y B5.1 YapeWeb200 por profesional, cliente vePendiente→Recibido; eventosúnicos SQL|Cash/Yape recepción acreditada enWeb; no repetir cobros ni atribuir Android|B2 yYape conservadas; instrucciones/configuración005 separadas|Conservar|
| Pagos | Reembolso total externo auditado |005 FR011–012;011 HA003|C; refund; SQL care_payments/team_authority|VERIFICADA|B3 U3 Chrome200+SQL, A cancelada/paid→refunded cashS25 conmotivo; cliente/profesional sinpermiso ni botón; filtrosB3final acreditados|Conservar evidencia; ningún dinero real ni nuevo reembolso|Recepción manual Yape Web sigue pendiente por separado; no cierre total005/Android|Conservar|
| Pagos | Pasarela o confirmación automática de Yape |005 FR007|No integración de cobro automático|NO APLICA|Contrato prohíbe atribuir verificación automática|Ninguna; no es desarrollo pendiente delMVP|Cambio de alcance|—|
| Atención | Inicio/completar/no asistió yrestricciones temporales |005 FR001–004|C; CareControl/SQL|VERIFICADA|N2ChromeHTTP200+SQL21nov17:39,confirmed/no-show/pending;una auditoríaU3profesional; B2histórico start/complete reutilizado|Conservar cita cda64f3c-b27f-4501-84ee-5f1a8e5f5740; no repetir N2 ni crearotra|42/45;41previas y todoslos pagos/historia intactos;005/Android conjuntos separados|P1|
| Atención | Recorrido Web desde agenda hasta finalización |005 T012|G/C; /agenda|VERIFICADA|B2 misma cita:agenda profesional, start/complete200 tras hora real,SQLcompleted ylecturacliente|No repetir; aceptaciónAndroid conserva sugate separado|CitaB2 conservada|Conservar|
| Atención | Independencia de atención, pago yreserva |005 FR013,018|C; SQL; historial|VERIFICADA|E005 completed-with-pending, no-bypass-old-rpc, rollback|Conservar ledgerausente dellegado; no rellenar citasviejas|Reserva creada conmétodo|P1|
| Administración | Propietario único/8legados regularizados |011 HA001,008|A; SQL team_authority|VERIFICADA|E011 2C.9 y2E.3|No reasignar ni regularizar de nuevo|Propiedad explícita|Conservar|
| Administración | Invitación/aceptación/cupos/replay/retirada barber |011 HA002,005–006|A; /staff|VERIFICADA|E011 2E.3 acumulada yremoval-result|No repetir operaciones|Actores/tenant exactos|Conservar|
| Administración | Facultades principales/secundarias yswitch U6 |011 HA003–004,009|A; workspace-access; /context|VERIFICADA|U6 aprobado porusuario; Chrome/HTTP2E y2E.3|No repetir U6; otrasoperaciones ordinarias sevalidan en sus bloques|Contexto verificado|Conservar|
| Administración | Roster principal011 yguarda delcliente corregida |011 HA-A03;2E E-A01–02|A; /staff?view=team|VERIFICADA|U3 roster con secundario/retirada Chrome2E.3 reutilizado; B4 cliente denegado sin carga perpetua y con salida segura|No repetir operaciones; U5 exacto no recorrido visualmente, separado de equivalencia funcional U3|Aceptación visual específica si usuario la solicita; no recuperar claves por rutina|Conservar|
| Administración | Invitaciones internas de barbero |004 FR005–006|O; /staff?view=team; SQL booking_operations|VERIFICADA|B4 U3invita/U4acepta Chrome2HTTP200/SQL; una membresíabarber/active ycontexto seleccionado, sinadmin niSMTP|Conservar invitaciónaccepted y membresía; no repetirni confundir conadmin2E.3|004T013 conjunta/Android ySMTPadmin separados|Conservar|
| Administración | Aviso SMTP real de la pruebaadministrativa actual |011 FR004|AdaptadorcorreoLOCAL; Mailpit|BLOQUEADA|Entregaunknown2E.3; correcciónfuenteLOCAL;118pruebas originales no prueban nuevoaviso|Autorización yprocedimiento específico; no reenviarunknown automáticamente|Decisión sobre aviso/fixture nuevo|P3 separada|
| Administración | Iniciar/cancelar/rechazar transferencia |011 HA007|A; SQL ycontrato; sin flujoWeb completo deconfirmación|PARCIAL|Comandos/SQL ypruebas preparadas; UI noofrece aceptaciónfinal|Resolver reglas antes de completar recorrido ycontroles necesarios|Decisión depropiedad|P3 separada|
| Administración | Aceptación definitiva de transferencia |011 HA007/HA-A04|Servidor larechaza explícitamente|BLOQUEADA|Contrato ySQL TRANSFER_CONFIRMATION_NOT_APPROVED|Destino delprincipal anterior/cupos/confirmación identidad; después especificar eimplementar|Aprobación de negocio|P3 separada|
| Cuenta | Editar nombre visible/teléfono, cancelar/restaurar |006 T006;002 perfiles|F; /account?view=profile|VERIFICADA|B4 Chrome2PATCH200/SQL, nombre/teléfono temporal yoriginal/null restaurados, persistencia tras navegación; cancelar sin guardar enpreparación|Conservar evidencia; no implica aceptación visualusuario ni006T006 conjunta/Android|Sin nuevas escrituras Web necesarias|Conservar|
| Profesional | Resumen diario propio nofinanciero |011 FR005–007|P; own-summary; /staff?view=professional|VERIFICADA|B4 Chrome/HTTP/SQL:20nov total2/completed1/cancelled1; fecha vacía, perfil contextual y sin campos financieros;011 previas reutilizadas|Conservar lectura Web; no cerrar011T008 conjunta/Android ni atribuir aceptación visual del usuario|Perfilactivo/fechaLima; sin escrituras|Conservar|
| Descubrimiento | Favoritos, reseñas, mapas, notificaciones reales ygestión de fotos |Sin especificación funcional vigente001–011 para implementarlos|H muestra aviso explícito; no API correspondiente|NO APLICA|No inventar datos delas referencias visuales|Separar ampliación futura; no son bloqueo delcamino principal pactado|Nueva especificación siusuario loaprueba|P3|
| Rendimiento | Medir apertura/F5 Web |Pendiente seguimiento, no nueva regla de negocio|Composiciónactual|BLOQUEADA|Optimización pendiente de medición real; foco sinparpadeo aprobado|Mediciones fiables antes decambiar; Auth excluido enFase0|Autorización específica si afectaraAuth|P3 separada|

## Brechas vigentes tras B1–B4

1. Recorrido principalWeb oferta→reserva→cash→atención/finalización acreditado B1/B2;
   cancelación/reprogramación/reembolso B3 yautogestión/equipo B4 también. No repetirlos.
2. Elección/recepciónYapeWeb acreditada en B5.1: dos comandos201/200, nueva cita conservada,
   41reservas/44detalles y40previas intactas. No repetir este ensayo.
3. ResidualesWebcontractuales:crear/configurarbarbería,retiraroferta,servicioscompletos,
   horarios/cierresadministrados,guardarYape yno-showWeb. Implementados, evidenciaWeb
   incompleta;detalles/permisos enB5,no inferir cierreporlosscopesacotadosB1–B4.
4. SMTPactualunknown ytransferenciafinal necesitan decisión/permiso separados. No bloquean
   operacióninterna diaria, sí limitanunaclaim de011completa incluyendocorreo/transferencia.
5. Filtroscash/B3 yresumenprofesionalWeb yaacreditados; tareasconjuntasAndroid/aceptación
   visualno secerranporChromeCodex. Mantenerlasabiertas, sinrepetirpruebassuficientes.
6. No defectonuevodemostrado ni módulo que reconstruir para elnúcleoactual. B5 no puede
   declarartodoWebcompleto soloconYape hastaresolverresiduales oaprobar diferidoexplícito.

## Plan por bloques y autorizaciones específicas

| Bloque | Objetivo yfuncionalidades | Conservar | Desarrollo pendiente | Pruebas deCodex | Criterio decierre | Riesgos/autorización |
|---|---|---|---|---|---|---|
| B1 Oferta operativa yexploración Web |Barbería/servicios/profesional/horarios/publicación→feed/detalle→borrador|RLS/propiedad/accionesO yHome aprobados|No nueva API prevista; corregir solo defectos demostrados, sinrediseño|Lectura inicial de oferta/contextos; luego flujoChrome de configuración/servicios/horarios/publicación, búsqueda/detalle ypaso correcto areserva|Oferta apta parareserva con tenant/servicios/profesional/precio correctos; cliente descubre sinmembresía; roles noautorizados sincontroles|Primero lectura sin escrituras; permiso posterior deconfiguración/publicación/fixture reversible específico. No afectar citas existentes|
| B2 Recorrido principal reservas/pago/atención |Cliente reserva conefectivo oYape manual→agenda→recepción/atención→completar|T019usuario, backend005/atomicidad/carreras yaacreditados|Solo brechas demostradas; comprobar filtrosFR014 yconexiones existentes|Una cita expresamente autorizada yhorario apto; UI real, HTTP/SQL, importe servidor, pago/atención independientes, historialcliente y filtrosadministrativos|Misma cita aparece en cliente/profesional/admin; finalización yestado depago coherentes, unúnico evento poracción, resto de37intacto|Autorizar reserva ytransiciones/pago ficticio; nunca dinero real. No usar citas protegidas comofixture mutable|
| B3 Gestión posterior de citas |Cancelación/reprogramación, motivo, plazo,historia,reembolso externo|CERRADO FUNCIONALMENTE WEB: B3 Chrome/HTTP/SQL complementa E004/E005/E810|Elegibilidad Web corregida; verificador null-safe probado; no cambios de servidor|A/B existentes conservadas,8 comandos acreditados,16 INSERT/8 UPDATE; no repetir|Historia/roles/estados/filtros/liberación e integridad40/43 acreditados; sin dinero real|Yape Web/Android/sesión inicial U3 son pendientes separados. No iniciar B4 sin solicitud|
| B4 Autogestión y cierre deequipo |Edición006/008, horarios009, resumen011, invitaciónbarbero/equipo|CERRADO FUNCIONALMENTE WEB:8 lecturas previas+15 comandosChromeHTTP200/SQL, sin repetir2E.3/U6|0defectos/0cambiosdeproducto; guardados/restauraciones ypermisos acreditados|Datos propios restaurados, bloqueo retirado,4nuevosregistros deequipo conservados; versiones5→17legítimas|40reservas/43detalles/pagos/atención/propietarios/otras membresías intactos;4sesiones204|SMTPadmin/transferencia/YapeWeb/visuales/Android separados; residualesoferta004 explícitos; no iniciar B5 automáticamente|
| B5 Consolidación funcionalWeb |YapeWeb ytrazabilidadfinalB1–B4, residualesWebcontractuales|B5.1 YAPE CERRADO en alcance:2comandosChrome201/200+SQL; B5GLOBALABIERTO|Sin cambios producto; soloverificador/evidencias|41/44,40previas intactas,6INSERT+1UPDATE,nuevaYapeconservada,2sesiones204|Faltan6ramasWeb o diferidoexplícito;SMTP/transferencia/Android/visuales separados|No repetirYape;otros permisos específicos aúnno concedidos|

### Primer bloque recomendado: B1

Comenzar por **lectura del estado de la oferta LOCAL y preparación de su recorrido Web**:
qué barberías son publicables, qué servicios/perfiles/vínculos/intervalos están disponibles
y qué actores existentes tienen acceso legítimo. No crear nuevos datos por defecto.
Contrastar esa oferta con el flujo `/account?view=explore`→detalle→`/booking` sin confirmar.
Si hacen falta cambios, presentar los UUID y la lista exacta de escrituras para autorización.

B1 precede aB2 porque permite reservar con datos realmente operativos, no con supuestos
de maquetas ni con citas históricas cuya atención/pago no exista. No exige reabrir login.
El usuario aprueba interfaces; Codex ejecuta verificaciones automatizables. No convertir
la aceptación integral antigua en obligación de repetir manualmente cada escritura.

## Pendientes separados y permisos

- **Obligatorio Web:** integración yvalidación B1–B5; cualquier implementación faltante se
  concreta por defecto reproducible antes de corregir. No iniciar bloques masivamente.
- **Visual:** pantallas ya aprobadas congeladas. Interfaces restantes se perfeccionan después
  de funcionalidad; no introducir cambios estéticos para superar verificaciones.
- **SMTP:** original011 tiene118comprobaciones/4correosMailpit; eso no acredita entrega de
  lainvitación2E.3 desconocida. Conservarunknown yno reenviar sin permiso específico.
- **Negocio:** transferenciafinal bloqueada; decidir destino delpropietario anterior ycupos.
  No bloquea reservas/cobro/atención con propiedad actual.
- **Android:** T008011/T007008–009/T008010/T012005 ycriterios físicos correspondientes se
  conservan para faseposterior; no cerrar porWeb ni trabajar nativo enesta fase.
- **Entrega:** Cloud nuevo/antiguo fuera; hosting, HTTPS/DNS/CDN/CSP, k6, CI/CD publicado,
  auditoría de dependencias y entregables académicos en su fase. No confundir eldominio
  comprado con despliegue terminado ni aprobaciónWeb con cierre académico003/007.
- **Permiso siguiente:** B1 de lectura con sesiones LOCAL necesarias identificadas; aprobación
  separada antes de cualquier edición, nueva reserva, cambio demembresía, perfil, correo,
  configuración, migración, servicio o despliegue. Mantener las37reservas yel log protegido.

En Fase0 se guardó únicamente este inventario/plan y su referencia en seguimiento.
No se autorizan ni ejecutan automáticamente los bloques siguientes.
