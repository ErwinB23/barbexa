# Preparación 003 — T001–T004

## Cierre de Inicio y Autenticación Web — 18/11/2026

**Inicio y Autenticación Web de Barbexa: diseño y recorridos funcionales principales
aprobados manualmente por el usuario. No requieren repetición rutinaria.**

Fuente: declaración expresa del usuario «BARBEXA — Cierre de Inicio y Autenticación
Web y actualización de tareas», en esta conversación. La fecha corresponde a esta
consolidación documental; no asigna fechas, dispositivos ni repeticiones no indicados
a los recorridos. Barbexa es la marca comercial; App Barbería es el identificador
académico y técnico.

### Evidencia aceptada y reutilizable

| Área | Evidencia y atribución | Alcance acreditado |
| --- | --- | --- |
| Inicio y navegación pública | Aprobación manual expresa del usuario. | Bienvenida, logo, enlaces Inicio/¿Cómo funciona?/Beneficios, tarjetas interactivas y accesos de login/registro. |
| Interfaces de autenticación | Aprobación visual y funcional expresa del usuario. | Login, registro, confirmación/revisión de correo, recuperación y nueva contraseña. Diseños aprobados conservados. |
| Registro y confirmación | Recorrido del usuario en [Web Cloud](#aceptación-web-cloud--17112026). | Registro, correo Resend, retorno, confirmación, perfil completado y Mi cuenta. |
| Acceso, sesión y logout | Recorrido manual del usuario y confirmación actual. | Claves correcta/incorrecta, F5 con sesión y ruta, logout y /account protegida. Cambiar de pestaña/aplicación conserva pantalla sin «Verificando sesión…». |
| Recuperación | Recorrido del usuario, reutilizado del registro de 17/11. | Solicitud/correo, pantalla de revisión, enlace, claves distintas rechazadas, cambio correcto, clave anterior rechazada y nueva aceptada. |
| Contraseñas seguras | [Ensayo real LOCAL de Codex](#política-de-contraseñas--verificación-real-local-17112026), configuración y cliente ya acreditados. | GoTrue LOCAL rechazó casos A/B; integridad y limpieza autorizada verificadas. No atribuir rechazos reales a Cloud. Cliente cuenta puntos de código Unicode; GoTrue mide bytes UTF-8. |
| Google | [Quickstart 007](../../../../specs/007-google-oauth/quickstart.md), con atribución por entorno. | Auth Cloud aislado Web/Android aprobado manualmente; login normal Android, perfil y persistencia reportados. Lecturas agregadas previas compatibles con perfil único; SC002 no está completo. |
| Calidad visual y regresiones | Ejecuciones anteriores de Codex registradas en la conversación. | 314 pruebas de cliente y tipos/lint/formato/arquitectura aprobados tras Beneficios; Edge con componentes locales y datos ficticios a 390 px y escritorio. No equivalen a E2E Cloud ni Android físico. |

Los recorridos LOCAL Web/Android mantienen su atribución histórica en t013,
t014–t017 y t018–t027. Las 19 comprobaciones LOCAL HTTP/Mailpit de recuperación
acreditan integración, sin sustituir aceptación física Android.

### Decisión por tarea abierta

| Tarea | Evidencia reutilizada | Criterio que mantiene la casilla abierta |
| --- | --- | --- |
| 003 T014 | Registro/confirmación/perfil Web Cloud y recorridos LOCAL. | Tres recorridos completos consecutivos por plataforma sin cantidad acreditada; cierre de vista, enlaces inválidos/consumidos y reintento de perfil reales. |
| 003 T019 | Login/logout/perfil/ruta protegida Web y recorrido Android previo. | Tres recorridos completos por plataforma y casos restantes SC-002 de cambio de cuenta/carreras/navegación. |
| 003 T023 | F5 y retorno de pestaña/aplicación aprobados; persistencia Android histórica. | Matriz vigente/renovable/inválida/red Web/Android y medición de tiempos/solicitudes. Optimización de carga inicial/F5 pendiente de medición real. |
| 003 T031 | Recovery válido Web y 19 comprobaciones HTTP/Mailpit LOCAL. | Android cerrado/activo; enlaces expirados/reutilizados/inválidos/sin verifier/cancelados y cierre de vista original según SC-005. |
| 003 T032 | Flujo principal Web y regresiones automáticas existentes. | Restricción de recovery, reinicio, cancelación y ausencia de rehidratación antigua comprobados realmente en ambas plataformas. |
| 003 T033 | [Revisión acotada de seguridad](seguridad-web.md). | Validaciones dinámicas finales, HTTPS/CSP en origen de aceptación cuando se autorice y riesgos de dependencias pendientes. Sin despliegue público en esta fase. |
| 003 T034 | Aprobación visual y pruebas estructurales. | Teclado/foco/lector Web y TalkBack/texto máximo/Atrás/zonas seguras Android finales. Sin atribuir Safari iPhone o pruebas físicas no documentadas. |
| 003 T035 | Controles de calidad y arquitectura anteriores. | Check general y reconciliación FR/SC. Última ejecución unitaria: 189 casos aprobados, pero gate global fallido por cobertura (79,40 % líneas; 92,06 % funciones). Umbral conservado. |
| 003 T036 | Conservación y controles previos. | Inventario/cotejo final, secretos, fixtures y diferencias finales. Esta aprobación no autoriza limpiezas. |
| 007 T006 | Google aislado Web/Android e integración documentados en quickstart. | Cotejo atribuible de cuenta existente/perfil reutilizado sin duplicación y consolidación del logout integrado Android. Aviso linking sin causa demostrada: retomar solo si reaparece con evidencia nueva. |

**Conteos confirmados contra casillas: 003 27/36 y 007 5/6.** No se cierra ninguna
tarea adicional. Las tareas de Inicio/navegación de 001 ya estaban marcadas; su
aceptación histórica no acredita accesibilidad final de 003 ni produce cierres nuevos.

Se aplicó `verification-before-completion` al cotejo de criterios y casillas. Esta
consolidación no ejecutó recorridos, sesiones, consultas Cloud/LOCAL ni servicios.
El siguiente módulo es **006 — Mi cuenta / Perfil personal**. Su aceptación de edición
continúa pendiente; acceder a Mi cuenta durante el login no acredita editar el perfil.
Los pendientes académicos se retoman solo para su criterio específico y con autorización
para operaciones sensibles. No bloquean avanzar al diseño/validación de los demás módulos
Web. Esta decisión prevalece sobre planes históricos inferiores de repetición completa.

## Política de contraseñas — verificación real LOCAL, 17/11/2026

Codex verificó GoTrue v2.197.0 en `app-barberia-002-local`, mínimo de 8 bytes UTF-8
y cuatro grupos exigidos. La cuenta ficticia desechable se creó confirmada desde
`POST /auth/v1/admin/users`, sin perfil ni proveedor externo. Se autenticó por
contraseña y se ejercitó `PUT /auth/v1/user` sin pasar por el cliente:

| Caso | Resultado |
| --- | --- |
| A: 7 caracteres ASCII, con los cuatro grupos | HTTP 422, `weak_password`, motivo `length`. |
| B: al menos 8 ASCII, con mayúscula, minúscula y número, sin símbolo | HTTP 422, `weak_password`, motivo `characters`. |
| C: autenticación con la clave inicial | Correcta en la misma cuenta. La huella del hash de la clave coincidió tras ambos rechazos. |

La limpieza se pausó al detectar dos registros de método de autenticación y se
reanudó tras comprobar que correspondían exclusivamente a las dos sesiones de la
cuenta ficticia y se eliminaban en cascada. Se eliminó la cuenta mediante la API
administrativa. Cero identidades, perfiles, sesiones, tokens de renovación y otras
dependencias operativas asociadas. GoTrue conserva cuatro eventos de auditoría.
Mailpit mostró cero mensajes para el destinatario ficticio. Los conteos antes y
después fueron 14 usuarios, 13 perfiles y 37 reservas, con huellas iguales para las
filas preexistentes de las tres tablas. GoTrue y PostgreSQL saludables, Auth HTTP 200.
Las 39 regresiones dirigidas de autenticación con dobles aprobaron. Cloud quedó
fuera del ensayo. Sin identificadores ni credenciales en esta evidencia.

## Aceptación Web Cloud — 17/11/2026

**Estado: 003 27/36 y 007 5/6.** El usuario ejecutó el recorrido en el navegador Web
de escritorio, `localhost:8081`, con Supabase Cloud `vuoncrtkkkquvddunrxx`.

| Evidencia del usuario | Resultado acreditado | Tareas relacionadas |
| --- | --- | --- |
| Registro y confirmación | Registro por correo y contraseña, entrega por Resend, retorno a localhost, confirmación, perfil completado y acceso a Mi cuenta. | T014, T019 (SC-001 parcial). |
| Login, sesión y rutas | F5 conservó la sesión. Logout correcto y `/account` bloqueada sin sesión. La clave incorrecta fue rechazada y la correcta aceptada. El usuario encontró su perfil conservado. | T019 y T023 (SC-001 a SC-003 parciales). |
| Recuperación | Solicitud, «Revisa tu correo», entrega, retorno a «Establece una nueva contraseña», rechazo de claves distintas y guardado correcto. La clave anterior fue rechazada y la nueva aceptada. | T031 y T032 (tramo válido Web de SC-005). |

**Comprobación de Codex, Cloud de solo lectura.** Los conteos muestran dos cuentas
confirmadas, cada una con un perfil. Una sola tiene contraseña y una identidad de
correo. Esa cuenta tiene también una identidad Google. La otra tiene solo identidad
Google. El estado actual es compatible con el perfil único observado por el usuario.
La lectura no establece cuándo se vinculó Google ni permite atribuir esa vinculación a
un recorrido concreto. No se registraron identificadores, correos ni credenciales.

**Evidencia reutilizable.** LOCAL Web y APK ya tienen registro, confirmación, perfil,
login y logout manuales. La persistencia y contexto manuales están en el bloque
T018–T027. Las 19 comprobaciones reales LOCAL de recuperación por HTTP/Mailpit cubren
el intercambio y el cambio de clave, y se conservan como evidencia de integración.
Google Cloud aislado está acreditado por el usuario en Web y Android. El perfil
integrado, su persistencia y el aviso de linking al cerrar en Android se detallan
en el [quickstart 007](../../../../specs/007-google-oauth/quickstart.md).

### Matriz de cierre sin nuevos correos

| Tareas | Pendiente concreto | Siguiente verificación |
| --- | --- | --- |
| T014/T019 | Tres recorridos consecutivos completos por plataforma, cierre de la vista, enlaces inválidos/consumidos, reintento de perfil y escenarios restantes SC-002. | Inventariar los recorridos completos que ya consten. Con cuentas existentes, completar historial, acceso directo, cambio de cuenta y respuesta tardía, tras autorizar sesiones adicionales si son necesarias. Los recorridos completos que falten quedan bloqueados por la restricción de registros y correos. |
| T023 | Sesión renovable, inválida y sin red al iniciar y volver o reabrir, con tiempos y solicitudes en Web y Android. | Aprovechar sesiones existentes según disponibilidad. Separar un fallo de red de una revocación real. Autorizar antes cualquier invalidación controlada. |
| T031/T032 | Retorno Web con pestaña cerrada y recarga, retorno en APK cerrado/activo y negativos SC-005: inválido, vencido, consumido, falta de verificador y cancelación. Verificar restricción del acceso a negocio y regresiones de sesión. | Usar acceso directo y enlaces de prueba inválidos para rechazo seguro sin envío. Reutilizar enlaces previos solo si su procedencia y estado están documentados y la operación está autorizada. Los casos que requieren un enlace vigente quedan abiertos si no existe uno utilizable. |
| T033–T036 | Seguridad del cliente, accesibilidad física, verificación final y consolidación. | Revisar bundle, saneado de URL, almacenamiento y riesgo XSS; teclado/foco/lector Web y TalkBack/texto máximo/Atrás en Android. Reutilizar verificaciones aplicables y ejecutar las afectadas en la versión de cierre. HTTPS/CSP del origen público y Web móvil real quedan para cuando exista un origen autorizado; no se requiere desplegar para el tramo de escritorio. |
| 007 T006 | Atribuir el perfil único a la cuenta Google del recorrido, confirmar reutilización y consolidar el logout normal en Android tras el aviso de linking. | Cotejar la evidencia previa primero. Autorizar solo una comprobación puntual si el cotejo no resuelve el caso. |

Se conservaron las casillas existentes. En esta consolidación no se ejecutaron
recorridos manuales nuevos, envíos, cambios de clave ni operaciones de escritura Cloud.

### Regresión automatizada local — 17/11/2026

Codex ejecutó **53 pruebas dirigidas con Node, 53 aprobadas y 0 fallidas**, en diez
archivos. Presentación: `login-web`, `password-recovery`, `protected-navigation`,
`navigation-resume` y `ui-refresh`. Integración de autenticación: `browser-session`,
`session-lifecycle`, `recovery-links`, `router-anchor` y `sign-in-out`. Se usaron
adaptadores controlados y dobles de SDK, red y almacenamiento. La comprobación cubre
semántica de formularios y controles, guardas de rutas, recarga y retorno simulados,
restauración e invalidación, aislamiento de almacenamiento, rechazo de enlaces y
limpieza de sesión. No sustituye pruebas en navegador, lector de pantalla o APK reales.

El usuario ya acreditó las cinco interfaces y el flujo principal Web de escritorio.
Se puede avanzar al siguiente módulo manteniendo abiertas las tareas académicas.
Próximo recorrido del usuario, con el servidor ya disponible y sin enviar correos:

1. Desde `/sign-in`, recorrer con Tab y Mayús+Tab; abrir «Crear cuenta» y «Recuperar
   contraseña» con Enter y regresar. Verificar foco visible, orden, etiquetas, botón
   de visibilidad anunciado y controles utilizables con zoom 200 %. Usar lector de
   pantalla si está disponible. Aporta evidencia Web para T034.
2. En una ventana privada sin sesión, abrir `/account` directamente y comprobar
   Atrás/Adelante. Debe mantenerse fuera del área privada en todo momento. Aporta
   evidencia de historial real para T019. El F5 y logout ya acreditados se reutilizan.
3. En esa ventana, abrir `/auth/reset-password` sin parámetros. Debe ofrecer pedir
   un enlace nuevo, sin mostrar campos de contraseña. No accionar el envío. Aporta
   evidencia del acceso directo sin recuperación válida para T031/T032.
4. Solo si hay una sesión de prueba vigente, poner el navegador sin red, recargar
   `/account` y luego restaurar la conexión. La UI debe ocultar datos mientras no
   pueda verificar la sesión y permitir recuperarla al reconectar. Registrar tiempos
   y conteos de solicitudes sin URLs sensibles. Aporta una celda de T023 y no
   reproduce la prueba F5 en línea.

Android conserva pendiente recuperación física con enlace válido y app cerrada/activa,
negativos de recuperación, matriz de sesión y revisión TalkBack/texto máximo/Atrás.
Para 007 se reutiliza el registro del [quickstart](../../../../specs/007-google-oauth/quickstart.md):
T006 espera cotejo de reutilización y cierre integrado Android; el aviso de linking
permanece registrado. No hubo otra operación OAuth. Las repeticiones que requieran
correos/cuentas, las sesiones nuevas o revocadas y el origen público HTTPS/CSP quedan
sujetos a las autorizaciones correspondientes. No cambian los conteos 27/36 y 5/6.

## Estado vigente — 15/11/2026

Actualización funcional posterior del mismo día: se conserva **27/36**, con gates finales
abiertos. El retorno Web ahora sincroniza los parámetros de Expo Router tras captura
PKCE; una navegación real de Codex con enlace inválido terminó en URL canónica y error
seguro, sin formulario de contraseña. Bundles completos Web/Android200, no ejecución Android.
Ver [detalle actualizado](us5-implementacion.md). Solo Metro se inició con autorización;
GoTrue no se modificó. Sus URLs de correo antiguas bloquean la recuperación Android real.
No nuevos usuarios, correos, claves cambiadas ni datos limpiados. Rediseño detenido.

**27/36**. T028–T030 implementadas, pruebas RED→GREEN, recuperación restringida/PKCE,
actualización de clave y salida local; formularios compartidos Web/Android.
[Implementación, evidencia y límites](us5-implementacion.md). Check general0:157 unitarias
y160 cliente en la versión integrada con004; bundles completos Web/Android200.
No se enviaron correos ni se cambiaron claves reales; T031/T032 permanecen abiertas,
junto con T014/T019/T023 y T033–T036. URL pública GoTrue local antigua pendiente de
intervención autorizada; prueba física agrupada en el recorrido integral final.
Nueve avisos npm permanecen, sin instalación/Cloud/servicios/datos/commit/push nuevos.
Los apartados inferiores son históricos y se conservan íntegros.

## Actualización T018–T027 — 14/11/2026

**24/36**: T018,T020–T022,T024–T027 cerradas. Sesión/contexto implementados y recorrido
Web/Android confirmado manualmente por el usuario, sin atribuirlo a Codex. Conjunto local
autorizado retirado selectivamente;0 residuos y datos anteriores preservados.129 unitarias,
73 integración/UI,11 verificaciones SQL/HTTP locales y calidad afectada0.
[Detalle y comandos](t018-t027/resultado.md), [evidencia manual](t018-t027/manual-confirmado.md),
[limpieza](t018-t027/t027-limpieza.json).
T014,T019,T023 pendientes de criterios específicos; no se ejecutó T028+.004 preparada
solo como borrador spec/plan/34 tareas, pendiente de aprobación, sin código/SQL nuevos.
Nueve avisos npm, riesgo XSS y necesidad de recuperación de contraseña antes de evaluación
se conservan. Sin Cloud, cambios de políticas/dependencias/APK, commit/push ni edición del
log activo. Los apartados inferiores corresponden a estados históricos, no al vigente.

## Estado vigente T014–T017 — 14/11/2026

**16/36**, T015–T017 cerradas. El usuario acreditó Web y Android: error con clave
incorrecta, Mi cuenta/nombre con clave correcta, salida y Atrás sin recuperar acceso
protegido; sin observaciones. Evidencia manual del usuario, no ejecución de Codex.
[Criterios, cambios y resultados](t014-t017/resultado.md).116/116 unitarias,76/76 integración/
presentación, tipos/lint/formato/arquitectura0; núcleo100% líneas/funciones,96% ramas
globales (coordinador89,81%), sin atribuir cobertura a UI. Bundles Development de ambas.
T014 parcial:15 dirigidas GREEN; no se repitió registro/correo acreditado. Tres recorridos
y casos reales ampliados, duplicados/limpieza siguen pendientes, [Web](us1-web.md)/[Android](us1-android.md).
No T018+, datos eliminados, nueva build/dependencia ni cambios de seguridad/Cloud/servicios.
Nueve avisos npm y riesgo XSS conservados. Los estados inferiores son históricos.

## Cierre vigente T011/T013 — 14/11/2026

**13/36**. El usuario confirmó registro ficticio local, correo recibido en Mailpit,
confirmación y perfil propio con nombre correcto tanto en Web como en el APK Android
Development. Ejecución manual del usuario, no de Codex; sin observaciones funcionales.
[Evidencia y cotejo de criterios](t013/cierre-manual.md). T011 y T013 [x]; T014 pendiente.
Se reutilizan las pruebas previas108/108 y65/65 y calidad0, sin repetirlas. No se atribuyen
al recorrido manual casos negativos ni tres repeticiones todavía no confirmadas.
Cuentas locales conservadas sin consultar/alterar datos. Tipografía manuscrita Android
y espaciado irregular registrados para mejora futura; no rediseño. Cuatro capturas
referidas por el usuario, sin rutas locales acreditadas ni inspección visual atribuida a Codex.
Solo revisión documental/Git; riesgos npm/XSS y todos los cambios anteriores conservados.
Los estados inferiores son históricos.

## Estado vigente T013 — 14/11/2026

**11/36**. Presentación de registro/confirmación/perfil conectada a T011/002 y al provider
raíz, rutas públicas anteriores conservadas. T011 y T013 continúan pendientes de prueba
funcional real Web/Android, no se ejecutó T014. [Resultados y límites](t013/resultado.md)
y [único bloque manual](t013/manual.md).108 unitarias y65 integración/presentación,
tipos/lint/formato/arquitectura0; cobertura solo núcleo100% líneas/funciones,97,23% ramas.
Metro Development empaquetó ambas plataformas con configuración pública local.
Auth local ajustado únicamente en sus2 URLs públicas autorizadas; site_url, redirects,
JWT/SMTP preservados. Solo Auth recreado, respaldo detenido disponible; Metro reiniciado
con autorización posterior explícita, puerto8081/Development/LAN. No cambios Cloud,
Kong/RLS, APK, dependencias, cuentas/correos ficticios ni log activo. Riesgos npm/XSS vigentes.
Los estados inferiores se conservan como históricos.

## Estado vigente T012/T011 — 14/11/2026

**11/36**: T012 cerrada con confirmación manual del usuario Web/Android/TalkBack sin
observaciones; muestra temporal retirada. T011 implementada técnicamente:17 pruebas
originales GREEN,106 unitarias/43 integración/8 UI, tipos/lint/formato/arquitectura0;
cobertura núcleo100% líneas/funciones y97,17% ramas. T011 sigue [ ] por evidencia funcional
real pendiente: requiere las vistas T013 aún no autorizadas en este bloque. [Detalle y
único bloque manual futuro](t011/resultado.md). Sin usuarios/correo/operaciones Supabase.
Los estados inferiores son históricos; no atribuir a UI la cobertura de núcleo.

## Avance vigente T010/T012 — 14/11/2026

T010 completada como RED:11 unitarias+6 integración fallan anticipadamente por T011 ausente.
T012 implementada,8/8 presentación/regresiones, tipos/lint/formato/arquitectura0; pendiente
de comprobación funcional Web y Android en la muestra temporal Development. **10/36**.
[Resultados e instrucciones juntas](t010-t012/resultado.md). No registro implementado ni
operaciones de backend; se mantienen CORS/redirects/log y todos los cambios previos.
Las secciones inferiores conservan el historial.

## Estado vigente — 14/11/2026

T001–T009 completas, **9/36**. [Cierre CORS local](t009/kong-cierre.md):22/22 API pública,
2/2 operador, Origin exacto y denegaciones conservadas; recarga solo Kong. Auth/REST,
JWT, contenedores ajenos, Metro y log anterior preservados. Evidencia Android manual del
usuario conservada. No se implementan T010+ ni se declara completa la funcionalidad003.
La persistencia tras recreación requiere reaplicar el operador documentado. Riesgos npm/XSS
siguen pendientes. Se conserva debajo el historial de estados anteriores, no estado vigente.

13/11/2026, America/Lima. Plan de 36 tareas aprobado; T005 cerrada con evidencia
[Hermes manual del usuario](t005/hermes-probe.md) y sonda retirada. T006 implementada,
T007 cerrada con prueba manual Android, sonda retirada y [T008 verificada](t008/resultado.md).
T009 en preparación autorizada, sin T010+ ni pantallas Auth. [Histórico del bloque](t006-t008/resultado.md).
Expo58.0.25, Check0/Doctor20 de20 y capacidades Chrome localhost se reutilizan de evidencia
anterior; resultados históricos iniciales conservados en t005/resultado.md.

## Estado individual

| Tarea | Estado y evidencia |
| --- | --- |
| T001 | Completada: integridad.json captura 1158 archivos estables (versionados + documentos 003 sin seguimiento), main/HEAD completo y estado inicial. Cotejo posterior en integridad-cotejo.json; solo tasks.md y estado compartido pueden cambiar deliberadamente. |
| T002 | Completada: consultas audit/view/explain, análisis dev/producción/directas/transitivas y lock en dependencias.md y JSON; ningún fix/paquete instalado. |
| T003 | Completada como inventario y decisión de preparación: usuario eligió EAS; revisión de requisitos y precios públicos en entornos.md. Cuenta/cuota privada, instalaciones y build no acreditados ni autorizados; verificar antes de ejecución. |
| T004 | Completada documentalmente: usuario aprobó URLs, local/Mailpit primero, luego Cloud para ambas plataformas, riesgo XSS condicionado y plan de datos/limpieza con límites. configuracion.md distingue decisiones de permisos específicos de ejecución aún no concedidos. |

Total actual: 8/36. T005 y T007 con evidencia Android manual del usuario; sondas retiradas;
T006 núcleo y T008 adaptador/composición mínimos verificados. Checklist 16/16 no
equivale a implementación. Último audit ocho/tres frente a nueve/tres iniciales, sin remediación.

Preparación T009: usuario confirmó cuenta Expo/login GitHub y Free; atribución manual,
sin consulta autenticada de Codex. [Pendientes y permisos](t009-preparacion.md); tarea
abierta, sin instalaciones, configuración o build ni nuevos usuarios.
Actualización: usuario reportó proyecto EAS vinculado, perfil/dev-client, GoTrue redirects,
CORS200, Chrome Android→API LAN y Mailpit/SMTP configurados. Codex contrastó archivos y
Expo config público (0). Faltan correo efectivo, build/scheme y transporte válido para
la app: adaptadores rechazan HTTP LAN aunque Chrome lo abra. Sin cambios de configuración
por Codex; no se repiten comprobaciones manuales ni se cierra T009 por ellas.

Actualización posterior autorizada: [transporte development, correo y preparación EAS](t009/resultado.md).
Codex implementó plugin local sin dependencias, excepción de origen LAN exacto en DEV,
regresiones y exclusiones de upload; introspección nativa diferencia development/production.
Único correo ficticio SMTP recibido en Mailpit (0/HTTP200/una coincidencia), sin usuario Auth.
29/29 pruebas de integración afectadas, tipos/lint/arquitectura aprobados. T009 sigue abierta,
8/36: no se ejecutó build, firma ni prueba nativa de scheme/conectividad; no Cloud.

Continuación autorizada: [único build EAS development](t009/eas-build.md), con revisión
oficial del archivo de subida y firma administrada por EAS. Este registro posterior
sustituye el pendiente de autorización previo; T009 no se cierra sin instalación/scheme
y conectividad nativas reales. No T010+.

Resultado posterior: build27c95d3f-bfaf-49c0-9746-cc2e0e69522f **FINISHED**, APK publicado
y metadatos en [eas-build.json](t009/eas-build.json). Solo una compilación; cuota previa
Free0/15 usadas,15 disponibles confirmada manualmente de nuevo por el usuario. T009
continúa abierta,8/36, por instalación/scheme y conectividad nativas pendientes. La salida1
del CLI fue la interrupción de su pregunta opcional de emulador tras el build, no un fallo
de la compilación Cloud. No se generó una segunda compilación ni se instaló en emulador.

Actualización manual posterior: el usuario instaló el APK en HONOR y confirmó apertura,
conexión a Metro y pantallas técnicas. [Verificación Android](t009/android-verificacion.md):
sonda temporal DEV preparada para API sin credenciales y los dos schemes; aún sin resultados
del teléfono. Tipos/lint/formato y3 pruebas específicas aprobados, arquitectura sin infracciones.
T009 sigue pendiente,8/36. No segundo APK ni flujos Auth de T010+.

Confirmación posterior: usuario reportó health200/hostAvailable y callback/reset
Opened/Received=true en el APK real. Sonda retirada completamente; advertencia Router
corregida mínimamente a anchor:'index' con regresión del resolvedor real. Tipos/lint/formato
y arquitectura aprobados,30/30 integración. **T009 aún abierta,8/36**, por un hallazgo
independiente: OPTIONS externo200 es genérico del gateway; el handler local rechaza403
el Origin aprobado localhost:8081. [Detalle y operación pendiente](t009/android-verificacion.md).
No se modificó configuración del servidor ni se reinició el log/proceso activo.

14/11, corrección local autorizada: BARBERIA_ALLOWED_ORIGINS faltaba en el runtime.
Configurado solo localhost:8081 con .env ignorado y plantilla; recarga exclusiva Edge,
log/PIDs Metro y contenedores ajenos preservados. Handlers10/10 correctos; consulta de API
pública0/4 por wildcard añadido por el gateway pese a estados401/403 correctos. T009 sigue
abierta,8/36: se detuvo antes de modificar Kong. [Detalle](t009/cors-local.md).

## Línea base y conservación

Inicio: main, HEAD 7ce4e1a09d94d5bc495a7d9016b600675885226c, staging vacío. Cambios previos:
Constitución 2.0.0, ESTADO-DESARROLLO.md, documentos 003 sin seguimiento y log activo de 002.
Se capturó estado de trabajo, no se confundió con HEAD limpio ni se revirtió documentación.
.git, node_modules y artefactos excluidos; únicamente t017-serve.log de 002 se excluye del
cotejo estable por su escritor activo. No se leyó/modificó su contenido ni operó su proceso.
Destinos se contrastaron con documentación 002: nuevo Cloud vuoncrtkkkquvddunrxx/local
app-barberia-002-local; anterior klebvayvsvibwjpkzrff prohibido. Sin conexión Cloud/Docker.

## Comprobaciones ejecutadas y límites

- check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks: 0; documentos detectados.
- Inventario SHA-256 con Node/crypto y Git: 0; sin copiar contenidos sensibles.
- node/npm/java versiones y npm explain: 0; detalle en dependencias/entornos.
- npm audit: 1 por nueve moderados; omit=dev: 1 por tres. Primer intento ENOTFOUND
  conservado, repetición con red autorizada produjo informes válidos, no auditoría aprobada.
- npm view de ambos paquetes: 0, solo metadatos públicos; SRI no es comprobación de descarga.
- Verificación raíz package/lock e instalación actual: coherente, dependencias no cambiadas.

No pruebas completas 001/002, tipos, lint, bundles ni pruebas de autenticación: no hubo
código funcional nuevo. Lectores/navegadores detectados no equivalen a accesibilidad E2E.
El análisis de paquetes no demuestra explotación ni ausencia de exposición en bundle.

## Riesgos y siguiente paso

Referencia inicial nueve moderados/tres sin dev; última consulta ocho/tres, sin remediación
ni aceptación formal. No downgrade automático
de Expo/config; nuevas dependencias todavía no auditadas como árbol instalado.
Decisiones preparatorias resueltas; no iniciar T005 sin autorización específica de ese
bloque/instalación. Cuenta/cuota EAS, configuración/correo/CORS reales y acceso Android
al backend local siguen requisitos de ejecución de T009, no resultados ya probados.
Checkpoint anterior 0ccd33c conserva preparación inicial 2/36; esta continuación solo
actualiza decisiones/estado documental, sin nuevo commit/push.

## Continuación tras respuestas explícitas del responsable

Estado inicial main/0ccd33c, solo log activo modificado. Se reutilizan inventario/hashes y
consultas T001/T002 sin repetir audit, pruebas o instalaciones. Solo lectura de documentación
pública de Expo para requisitos/precios; no login ni consulta privada de cuenta. Se conservan
el informe original y la matriz inicial como contexto histórico, con actualización de estado.
No Cloud, Docker, fixtures, credenciales, instalación ni build. Cambios actuales esperados:
entornos.md, configuracion.md, informe.md, tasks.md y ESTADO-DESARROLLO.md.
