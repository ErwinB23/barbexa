# Verificación — 007

## Consolidación vigente — 18/11/2026

Inicio y Autenticación Web de Barbexa: diseño y recorridos funcionales principales
aprobados manualmente por el usuario. No requieren repetición rutinaria.
Se preservan Google Auth aislado Web/Android, persistencia, perfil y protección tras
logout ya acreditados, con sus límites por entorno. No hubo nuevas operaciones OAuth
ni consulta de datos en esta consolidación.

**007 5/6, T006 abierta.** SC002 todavía requiere evidencia atribuible del caso de
cuenta existente con el mismo perfil, sin duplicación, y consolidación del logout
integrado Android. La consulta agregada de dos cuentas con perfil único acredita el
estado consultado, sin establecer cuándo o mediante qué flujo se vinculó la identidad.
El aviso linking queda pendiente sin causa demostrada; solo retomarlo si reaparece
con runtime conectado y evidencia nueva. No repetir Google aislado ni el flujo Web
principal por rutina. La [matriz vigente](../../docs/evaluacion/evidencias/003-autenticacion/informe.md#cierre-de-inicio-y-autenticación-web--18112026)
define los criterios futuros, sujetos a autorización para sesiones/operaciones nuevas.
Próximo módulo Web006; sin trabajo APK ni despliegue público en esta etapa.
Los apartados inferiores conservan la historia y sus autorizaciones, no permisos nuevos.

Pruebas automáticas sin usuarios/HTTP externo en oauth unitarias, integración y presentación.
Registro de resultados en tasks.md. Sin nuevas evidencias/logs separados.

## Perfil Development aislado de Auth Cloud — preparado 15/11

Configuración de Google Cloud, proveedor y redirects: reportada manualmente por el usuario.
Inspección de solo lectura de Codex: proyecto exacto app-barberia-arquitectura,
vuoncrtkkkquvddunrxx/sa-east-1, clave publishable del mismo destino y
GET /auth/v1/settings HTTP200 con external.google=true. Esa inspección no inició OAuth
ni creó una identidad. La validación Web posterior del usuario se registra más abajo.

Entrada Web: http://localhost:8081/auth/google-test . En Android Development existente:
Base técnica → Preparar prueba Google Cloud aislada. Introducir solo publishableKey de
`.artifacts/007-cloud-auth/public-config.json` (archivo ignorado, solo configuración pública).
No introducir Client Secret, service_role, contraseñas ni tokens. Verificar configuración
solo consulta Auth settings; no abre Google. No cambiar .env ni la configuración LOCAL.

El gate espera la selección persistida antes de montar el runtime. Cuando se selecciona
Cloud, no se montan los adaptadores de perfiles, membresías, oferta o reservas. El SDK usa
namespace independiente; selección Web por pestaña, Android SecureStore. El transporte
acepta únicamente Auth del proyecto nuevo y rechaza LOCAL/REST/RPC/Edge/redirects HTTP.
El consumidor LOCAL bloquea también retornos tardíos de esta prueba. El perfil no está
disponible en producción. Salir requiere cerrar primero la sesión de prueba; conserva
la sesión y los datos LOCAL. Una nueva acción explícita de acceso/registro/recovery LOCAL
retira la marca residual que protege frente a callbacks Cloud tardíos.

**Autorizado por el usuario para este ensayo:** usar el Gmail de prueba
autorizado en Google, hasta una identidad Auth/Google Cloud y dos sesiones (Web y Android),
con metadatos y registros internos normales de Auth. Sin ensure-profile, perfiles,
membresías ni datos de negocio; tampoco vinculación manual de identidades.
Con esa autorización, primero Web y después Android: Continuar con Google en Cloud →
elegir cuenta de prueba → retorno a callback aprobado → tres booleanos de PKCE/identidad/
sesión true → Cerrar sesión de prueba (cierre remoto true) → Volver a Development LOCAL.
Nunca compartir URL de retorno, códigos, tokens ni capturas con datos de cuenta.

Metro fue iniciado una única vez con autorización en Development/LAN/8081; status200.
El usuario confirmó Web real: login Google, PKCE/identidad/sesión true, persistencia tras
tres F5 y cierre remoto true. Es evidencia manual del usuario, no ejecución de Codex.
El usuario confirmó después Android real con el APK existente: el formulario permanece
abierto; login Google correcto; PKCE/identidad/sesión true; persistencia al salir
temporalmente a otra aplicación y regresar; cierre remoto true. Sin incidencias reportadas.
Ambos recorridos Auth-only están acreditados; no repetirlos ni crear sesiones adicionales.
Antecedente conservado del defecto ya corregido y validado:
Android encontró una salida del formulario antes de iniciar OAuth. Metro disponible sin
errores JS registrados; adb no disponible, sin diagnóstico directo de crash nativo.
Se localizó el desmontaje del navegador raíz al entrar a setup: Expo Router58 procesa
NAVIGATOR_UNMOUNTED reinicializando el estado y el gate vuelve a LOCAL al cambiar la ruta.
Corregido preservando la misma rama de navegación, oculta, durante la entrada de clave;
al activar Cloud se desmonta completamente el runtime LOCAL. Dos regresiones fallaron
antes y pasan tras la corrección; la permanencia física quedó confirmada por el usuario.
No se necesitó otro APK. El aprovisionamiento/consulta de perfil, membresías y cuenta
existente sin duplicación de T006/SC002 siguen pendientes: este perfil comprueba solo Auth.

Pendiente para cerrar0075/6: acreditar perfil propio y cuenta existente sin duplicación,
con autorización específica y Auth/negocio en un mismo entorno. No se probaron reservas,
atención, pagos ni membresías LOCAL con la identidad Google Cloud. El coordinador completo
está conectado por código y probado con dobles; falta la validación integrada real.
La opción de llevar el backend de negocio al Cloud nuevo requiere revisión y permisos de
migración/despliegue/datos; conservar LOCAL con Google exige HTTPS y configuración Auth
LOCAL autorizados. Ninguna opción se ejecuta por registrar estas evidencias. Conservar
acceso por correo, todas las reservas y los datos protegidos; no trasladar tokens ni filas.

## Integración normal — perfil Cloud activo; aceptación física pendiente

Consolidación 17/11/2026: lectura agregada del Cloud nuevo comprobó dos cuentas
confirmadas con identidad Google y un perfil propio por cuenta. Una también cuenta
con identidad de correo y contraseña. El conteo constata el estado actual; falta
cotejar la reutilización de la cuenta del recorrido y consolidar el logout normal
Android. T006 permanece abierta. Se reutiliza la evidencia Google anterior, sin
sesiones nuevas. [Matriz de aceptación](../../docs/evaluacion/evidencias/003-autenticacion/informe.md#aceptación-web-cloud--17112026).

Evidencia manual posterior del usuario16/11:Android login Google normal/perfil y persistencia
al salir/regresar correctos. Tras Cerrar sesión apareció configured linking in multiple
places (Router useLinking.native.js61). Reload recuperó pantalla pública;no volvió a ocurrir.
No atribuir corrección definitiva a Reload ni cerrarT006. Análisis de solo lectura confirma
que el aviso verifica otro registro propietario del hook,no cualquier listener Linking.
3 pruebas locales de esa guarda aprobadas,no E2E. No segundo NavigationContainer declarado
en src;no causa del logout demostrada. Inspector sin runtime durante consultas;sin cambios
funcionales/infra/datos,ni nuevas sesiones. No repetir Google ahora;si reaparece,capturar
estado/raíces en el APK antes de recargar. Perfil sin duplicación y logout final siguen gate.

Actualización manual del usuario16/11:arranque Android normal tras desactivar temporalmente
Auto-launch most recent app,seleccionar192.168.0.16:8081 y reactivar automático. Recientes
incluían8082(no termina) y8081(funciona). Compatible con reconexión antigua;no causa exacta
demostrada. No más cambios Auth/Router/splash/nativo por esta demora. Conservar timeout15s.
Lectura Cloud actual:1 usuario/identidad Google y1 perfil propio,0 membresías/negocio;
sin duplicados actuales. Huella del perfil preparada para cotejar reutilización tras login
normal Android. Este login/persistencia/logout aún no acreditados;007T006 permanece abierta.

**Incidencia posterior16/11 — arranque Android:**corregidos en JS el colapso del viewport
del navegador nativo durante Auth(display:none),la falta de un contenedor/feedback de
pantalla completa y la restauración sin plazo. Ahora conserva montaje/ruta,oculta acceso
privado y muestra carga;tras15s de restauración bloqueada,error recuperable con reintento.
Respuestas tardías no autentican.7 regresiones nuevas,80 integración/presentación y24
unitarias,tipos/lint/formato/arquitectura aprobados. No prueba física del APK por ello.
ADB ausente/inspector sin dispositivo;no se acreditó cierre nativo. Metro terminó durante
diagnóstico(PID original ausente/8081ECONNREFUSED),sin causa registrada. No se reinició;
solicitado permiso para1 inicio con diagnóstico seguro. El bundle actualizado y arranque
en frío/retorno del APK quedan pendientes hasta recuperar Metro. Sin cambios de servicios,
Cloud/LOCAL/datos ni nuevo APK. Mantener007T006 abierta.

Reanudación autorizada posterior16/11:puerto8081 libre/ningún Metro activo;una sola
instancia iniciada con perfil Cloud aislado yenv LOCAL intacto. HTTP200 en loopback,
LAN192.168.0.16:8081,manifiesto y bundle Android;código de viewport/carga/reintento y
deadline presente,0 errores del diagnóstico filtrado. No segundo intento/otros servicios.
Bundle disponible;falta Reload JS del APK y comprobación física en frío/segundo plano.
No cerrar007 ni declarar aceptación Android por disponibilidad del bundle.

16/11/2026:usuario autorizó el perfil aislado cloud-integration,Google existente,hasta2
sesiones (Web/Android) y consulta/alta de un solo perfil propio. No otros datos de negocio.
Baseline read-only:1 usuario y1 identidad Google,0 perfiles,barberías,membresías y reservas;
Auth settings200/google habilitado. No se ejecutó login ni alta por Codex.

Metro estaba detenido;se autorizó e inició una única instancia Development/LAN8081 con
config Cloud solo en el proceso. .env.local conservado por hash;EXPO_NO_DOTENV=1 impide
cargarlo en ese proceso y las variables públicas LOCAL no se heredan. URL/publishable/
revisión Cloud en archivo ignorado cloud-integration-profile.json;operador separado
cloud-integration-runtime.mjs,con guarda de puerto/único intento. HTTP200 para Metro,
/sign-in y manifiesto Android;ambos bundles200 con clave Cloud y sin clave LOCAL.

El gate de diagnóstico Auth-only ahora cede al runtime normal en cloud-integration,
sin leer su selección ni cambiar su almacenamiento.2 regresiones RED→GREEN Web/Android;
51 pruebas dirigidas con dobles/SDK,TypeScript/core,lint,formato y arquitectura aprobados.
Estos resultados no sustituyen el login físico integrado ni prueban roles inexistentes.

Recorrido autorizado pendiente,solo dos inicios Google:
1. Web http://localhost:8081/sign-in:Continuar con Google,usar la cuenta existente.
   Si pide Nombre visible,completar una sola vez (teléfono opcional puede quedar vacío).
   Esperado Perfil confirmado/Mi cuenta y nombre propio,sin membresías activas. F5 debe
   conservar sesión/perfil sin volver a crear. Cerrar sesión y Atrás sin datos privados.
2. Android APK existente conectado a192.168.0.16:8081:recargar JS y usar Iniciar sesión→
   Continuar con Google;esperado mismo perfil sin formulario de alta. Cambiar de app y
   volver conserva sesión;cerrar sesión y Atrás sin datos privados. No /auth/google-test.
3. Tras confirmación del usuario,cotejar conteos Cloud y perfil vinculado al mismo UUID
   mediante lectura autorizada,sin recopilar tokens/URLs.007T006 queda pendiente hasta ello.

No crear barberías,membresías,reservas ni pagos;no tocar LOCAL. Admin-mail externo off.
Conservar la instancia Metro;ningún segundo inicio/reinicio autorizado por este recorrido.

### Ejecución autorizada del primer bloque — completada 15/11

Reanudación autorizada por el usuario: se corrigió únicamente el verificador local para
aceptar el nombre abreviado de un tipo public si coincide su OID,esquema,nombre y posición
del argumento. La comparación exacta restante se mantiene;6 pruebas locales aprueban,
incluidos rechazos por OID/esquema distinto,identidad ausente,nombre/argumentos distintos.
No se alteraron los SQL auditados ni se retiraron controles de RLS,ACL,search_path o cuerpo.

Validación completa de20261114202045 reejecutada y aprobada:513 comprobaciones read-only,
historial7 versiones con las dos primeras ya aplicadas. NO se volvieron a ejecutar.
Después se revisó hash/SQL de20261114220827 y se aplicó una única vez mediante la CLI;
dry-run exacto mostró solo ese archivo,0 seeds/roles,con --skip-vault.
Verificación final aprobada:515 comprobaciones read-only. Historial8 versiones
(5 de002+3 del bloque),btree_gist,11 tablas públicas totales(3 originales+8 nuevas),
13 políticas totales(5+8),2 triggers y31 funciones de aplicación(7+24).
Las8 tablas nuevas permanecen vacías;0 filas creadas. La tercera cambió únicamente el
cuerpo de private.booking_catalog: firma,ACL,search_path,propietario y resto del esquema
sin cambios frente a la segunda. Las3 tablas/objetos originales,identidad Google y
huellas Auth se conservaron;Edge ACTIVEv1/JWT,config y digests secretos idénticos.
Reservas/pagos/reprogramación/equipo Cloud siguen ausentes; no migraciones posteriores,
Edge/config/CORS/cliente,datos de prueba,LOCAL,Metro o log operados.007 continúa5/6.
Resultado final ignorado: .artifacts/007-cloud-auth/stage01-complete.json.

**Antecedente conservado — primera detención y diagnóstico, ya resuelto:**

Autorización posterior del usuario limitada a20261114195018/20261114202045/20261114220827,
secuenciales y con detención ante cualquier verificación fallida. Revalidado destino
vuoncrtkkkquvddunrxx/sa-east-1 ACTIVE_HEALTHY y cinco migraciones002/sentencias intactas;
hashes de los tres SQL idénticos a la auditoría. Preflight sin datos de negocio,1 identidad
Google; snapshots de catálogo/configuración ignorados antes de aplicar.

- 20261114195018_booking_catalog.sql aplicada por CLI oficial. Dry-run mostró solo ese
archivo,0 seeds/roles y --skip-vault.304 comprobaciones de lectura aprobadas:8 tablas
vacías/RLS,8 políticas,2 triggers horarios,PK/FK/exclusiones,columnas/ACL y btree_gist en
extensions. Primer auxiliar privado creado; baseline002/Auth/Edge/config intactos.
- 20261114202045_booking_operations.sql aplicada por CLI oficial, una vez. Dry-run solo
ese archivo,0 seeds/roles y --skip-vault. Historial remoto ahora7 versiones.24 funciones
nuevas acumuladas (31 con las7 originales),8 tablas nuevas vacías,8 políticas/2 triggers.
La verificación se detuvo en FUNCTION_SIGNATURE_private.booking_invitation_json:
comparaba literalmente `i staff_invitations` con `i public.staff_invitations`.
Consulta read-only de diagnóstico confirmó1 argumento,esquema public y OID exacto del
tipo esperado,resultado jsonb. Es una normalización de PostgreSQL y un defecto del
verificador textual; no un error SQL demostrado. No se corrigió el verificador ni se
reanudó tras ese fallo sin permiso; la validación completa posterior se registra arriba.
No reaplicar esta migración.
- 20261114220827_booking_catalog_visibility.sql no se había intentado durante esa detención;
  la aplicación única posterior autorizada y su validación se registran arriba.

Cotejo posterior: tres tablas/columnas/funciones/políticas/restricciones originales
preservadas,conteos anteriores0,identidad/usuario Google y huellas sin cambios. Edge
ensure-profile/create-barbershop siguen ACTIVEv1/JWT; configuración Auth/digests secretos
idénticos. Ninguna cuenta,dato de prueba o reserva creada; no operación LOCAL/Metro/log.
No autorización consumida para otros bloques,Edge/CORS/cliente continúan sin cambios.

La reanudación requirió confirmación del usuario por la condición expresa de detenerse:
corregir únicamente el verificador local para comparar tipos por identidad/OID, completar
la verificación read-only de la segunda y,solo si aprueba,aplicar una vez la tercera
migración ya delimitada,con sus verificaciones. Sin alterar los SQL auditados,rehacer las
dos versiones registradas,repair,DROP o rollback destructivo. Intentos,catálogos y
diagnóstico conservados ignorados en .artifacts/007-cloud-auth/stage01-*;no credenciales.
La confirmación fue recibida y el procedimiento limitado terminó como se indica arriba.
Los apartados de auditoría y etapas siguientes conservan la preparación previa; no
autorizan los siguientes bloques ni habilitan todavía el negocio Cloud.

### Auditoría Cloud de solo lectura — 15/11, ejecutada por Codex

Destino confirmado por CLI autenticada: app-barberia-arquitectura,
vuoncrtkkkquvddunrxx/sa-east-1, ACTIVE_HEALTHY, PostgreSQL17.11. Consultas remotas con
`db query --read-only --remote=vuoncrtkkkquvddunrxx`: transaction_read_only=on.
Historial: exactamente las cinco versiones002, cuyas sentencias normalizadas coinciden
con los archivos locales. Las siete funciones existentes también coinciden en cuerpo;
search_path vacío en7/7, ACL002 correctas,0 triggers de aplicación/Auth añadidos.
Tres tablas públicas fundacionales con RLS,5 políticas y FK/UNIQUE/índices esperados.
Conteos agregados:0 perfiles,0 barberías,0 membresías;1 usuario Auth y1 identidad Google.
No se consultaron emails, contraseñas ni tokens; huellas de identidad conservadas ignoradas.

En el snapshot previo a aplicar el primer bloque no existía ninguna de las17 tablas
ni de las73 funciones nuevas del lote en Cloud.
Comparación secuencial:0 colisiones de nombres,17/17 tablas con RLS explícita,11 políticas
de lectura,4 triggers (2 de contención de horarios, care_cancel_guard y
admin_invitation_accept_guard).73 funciones nuevas y2 reemplazos dentro del lote:
private.booking_catalog y public.respond_booking_invitation. Las75 declaraciones de
función fijan search_path vacío;39 declaraciones SECURITY DEFINER revisadas (incluye
reemplazos). Ninguna función nueva conserva EXECUTE para PUBLIC/anon al terminar el lote.
Las lecturas autorizadas de catálogo/disponibilidad/agenda conservan EXECUTE authenticated
con auth.uid; escrituras, pagos, reprogramación e invitaciones se cierran a service_role.
No hay DML de negocio de nivel superior ni backfill; las escrituras están dentro de RPC.
btree_gist1.7 está disponible y trusted, todavía no instalado. GiST UUID se usará en
extensions, requerido por la exclusión de reservas; instalarlo requiere autorización.
Los defaults Cloud pueden conceder privilegios: cada migración los revoca explícitamente
dentro de su transacción antes de habilitar las proyecciones mínimas.

No se aplicó el lote a Cloud para esta auditoría. Compatibilidad sin colisiones y revisión
de permisos no equivalen a compilar/ejecutar el SQL allí; esa comprobación sigue siendo
parte del despliegue autorizado. Se reutilizan las pruebas reales LOCAL ya acreditadas.

Edge actuales: ensure-profile y create-barbershop ACTIVE/v1/verify_jwt=true. Fuentes
descargadas mediante --use-api a .artifacts ignorado, sin Docker ni despliegue: entrypoints,
handlers, aplicación y adaptadores idénticos al código actual. Única diferencia compartida:
createFoundationActorVerifier añadido localmente para las Edge nuevas; no altera las dos
existentes. No requieren actualización para este alcance. Crear solamente
barbershop-operation y reservation-command con sus dependencias locales actuales.

Google habilitado confirmado por Auth settings200 y config diff de lectura. Redirects
actuales exactos: localhost8081/auth/callback y appbarberia://auth/callback; Site URL
actual localhost3000, preservado. No hay redirects reset-password en la lista actual:
añadir los dos destinos de recuperación requeriría permiso separado antes de probar
registro/recovery Cloud. JWT/secretos OAuth no leídos ni rotados; nombres/digests de los
secretos Edge y huellas de la configuración se conservan para cotejo, no sus valores.
No config push: sobrescribiría diferencias legítimas entre Cloud y LOCAL/Google/MFA.

Bloqueo CORS comprobado sin sesión ni datos de escritura: ambas Edge devuelven403
FORBIDDEN al OPTIONS y POST con Origin http://localhost:8081 y al origen no autorizado;
sin Origin devuelven401 UNAUTHENTICATED. BARBERIA_ALLOWED_ORIGINS no está en los secretos
Cloud listados; la composición usa lista vacía y el handler rechaza el origen antes de
Auth. No es un fallo de contraseña/tenant y no se resuelve desactivando JWT. Para Web
hace falta autorizar únicamente ese origen exacto en esa configuración (preservando
otros valores si aparecen al revalidar). No editar Kong, Data API ni graphql_public.

Revisión crítica:005 revoca el confirmador sin método de service_role; confirmar por
confirm_booking_paid crea reserva/ledger/evento atómicamente. No habilitar reservation-command
antes de005.010 toma locks consistentes por persona/reserva, comprueba la membresía
actual, antelación120/motivo del personal y estados; modifica solo fechas, conserva pago,
snapshots e ID, registra requestId/historial y revierte con error.011 amplía solo el CHECK
de rol y la envoltura; RPC/triggers verifican destinatario, administrador actual,7d,
idempotencia y permisos al aceptar. El correo no concede acceso. No permitir Mailpit
en Cloud ni activar invitaciones sin proveedor externo autorizado.

Cotejo final de solo lectura aprobado: catálogo/historial,conteos de negocio,huellas de
usuarios/identidad Google,metadatos Edge,digests de secretos Edge y huella del config diff
idénticos antes/después. Esto no expone ni prueba el valor secreto OAuth: no se leyó ni
se modificó. Snapshots sanitizados y comparación ignorados en .artifacts/007-cloud-auth/;
no son archivos para Git. La auditoría no operó LOCAL ni probó OAuth otra vez.
Corrección de código independiente: el gate de backend y transporte de origen fijo
también se exigen en producción, evitando eludirlos cambiando solo el nombre del entorno.
Regresión RED→GREEN;51 pruebas dirigidas de código/SQL estático,tipos,lint,formato y
arquitectura aprobados. No activación de variables reales ni reinicio de Metro.

Recomendación: Auth y negocio completos en vuoncrtkkkquvddunrxx/sa-east-1; conservar
LOCAL como entorno separado. Google+perfil002 podría comprobarse sin desplegar004–011,
pero eso no habilitaría reservas/atención/pagos Cloud. Para el objetivo completo se
propone desplegar primero el backend ya acreditado LOCAL, sin exportar datos.

Código: registration-environment.ts admite Development cloud-integration, cerrado si
falta URL exacta, publishable propia o revisión de liberación20261115230134. El runtime
usa variables CLOUD separadas y no recurre a la clave LOCAL. Auth/perfiles/contexto/
operaciones/reservas comparten baseUrl y transporte con origen fijo y redirect:error.
El namespace difiere del diagnóstico Auth-only y de LOCAL; no se copian sus sesiones.
Google desde login/registro limpia primero la marca retirada del diagnóstico. Perfil
faltante exige formulario explícito; cuenta existente se consulta por UUID verificado,
sin crear perfil/membresía ni buscar/vincular por email desde el cliente.

Variables preparadas solo en .env.example: EXPO_PUBLIC_APP_ENVIRONMENT=cloud-integration,
EXPO_PUBLIC_CLOUD_SUPABASE_URL, EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY y
EXPO_PUBLIC_CLOUD_BACKEND_REVISION. La revisión es un gate operativo posterior a verificar
SQL/HTTP, NO una prueba de salud ni un permiso del usuario. RLS y autorización de servidor
siguen siendo definitivas. No se modificó .env real, no se activó el modo y no se reinició
Metro. Esa activación/recarga requiere autorización después del backend verificado.

### Inventario SQL — cuatro bloques aplicados; no SQL pendiente de este lote

Baseline de la auditoría inicial: cinco migraciones002; al comenzar el bloque2 estaban
esas cinco y las tres de catálogo, ocho en total; tras el cierre4 hay dieciséis. Revalidar historial y drift antes de cada
aplicación; no reaplicar versiones registradas ni reparar historial.
Archivos exactos bajo supabase/migrations/:

| Archivo | Efecto de esquema |
| --- | --- |
| 20261114195018_booking_catalog.sql | 8 tablas públicas de oferta/personal/horarios/invitaciones, RLS, 8 políticas de lectura, integridad y btree_gist. |
| 20261114202045_booking_operations.sql | RPC de catálogo/publicación/configuración/servicios/profesionales/horarios e invitaciones; ACL cerradas y controles contextuales. |
| 20261114220827_booking_catalog_visibility.sql | Sustituye solo private.booking_catalog preservando firma/ACL. |
| 20261114224344_booking_atomic.sql | reservations/items/events, RLS y 3 políticas de lectura; exclusión por persona y RPC de disponibilidad/confirmación. |
| 20261115030159_booking_agenda.sql | Funciones de agenda con identidad y alcance contextual. |
| 20261115033925_booking_cancellation.sql | Cancelación atómica, política histórica y motivo del personal. |
| 20261115151745_care_payments.sql | 3 tablas privadas con RLS, atención/pago/auditoría, confirmación con método y guarda; retira EXECUTE del confirmador anterior sin pago. No backfill legacy. |
| 20261115171232_own_professional_profile.sql | 2 RPC propias y auxiliar privada, sin tablas nuevas. |
| 20261115203629_own_professional_schedule.sql | 4 RPC propias y auxiliar privada, sin tablas nuevas. |
| 20261115210802_booking_reschedule.sql | 2 tablas privadas con RLS y RPC/auxiliares de reprogramación, política/historial/idempotencia. |
| 20261115230134_team_professional_summary.sql | 1 tabla privada con RLS, invitaciones/resumen; amplía CHECK de staff_invitations y sustituye la envoltura de aceptación existente. |

Total17 tablas nuevas (11 públicas/6 privadas), RLS en las17 y11 políticas de lectura
nuevas. Los archivos incluyen firmas/RPC, privilegios y search_path exactos para revisar.
No modificar archivos históricos ni políticas002; no exponer private por Data API.
Conservar public/Data API/GraphQL actuales salvo defecto demostrado y permiso separado.
Revisión obligatoria de SECURITY DEFINER, EXECUTE service_role, revocaciones, dependencias,
versiones PostgreSQL/btree_gist y exclusión GiST. No hay traslado de filas ni semillas.
Las modificaciones de ACL/funciones existentes005/011 son cambios explícitos a autorizar;
no describir el lote como exclusivamente CREATE. Si falla un paso, detenerse y diagnosticar;
no revertir mediante borrado de tablas/filas ni continuar con un backend parcial.

### Segundo bloque — completado tras reanudación autorizada

El usuario autorizó corregir solo la extracción del cuerpo SQL, revalidar todo el paso1
y continuar2–4 únicamente si aprobaba. Corrección mínima: extraer del archivo original,
con comentarios, manteniendo todas las guardas. Tres regresiones nuevas RED→GREEN
comprueban comentarios legítimos, código SQL alterado y comentarios ausentes;12 pruebas
locales del verificador aprobadas. El diagnóstico y la primera parada se conservaron
en stage02-diagnosis.json y stage02-first-stop.json, sin borrar evidencia histórica.

| Migración | Ejecución | Verificaciones reales read-only |
| --- | --- | --- |
| 20261114224344_booking_atomic.sql | Ya registrada; NO reaplicada. Validación completa tras la corrección. | 498 aprobadas; historial9. |
| 20261115030159_booking_agenda.sql | Aplicada una vez tras aprobar paso1. | 515 aprobadas; historial10. |
| 20261115033925_booking_cancellation.sql | Aplicada una vez tras aprobar paso2. | 540 aprobadas; historial11. |
| 20261115151745_care_payments.sql | Aplicada una vez tras aprobar paso3. | 734 aprobadas; historial12. |

Cada aplicación tuvo dry-run de un único pendiente,0seeds/roles y skip-vault. Final:
17 tablas (14 públicas/3 privadas), todas con RLS;49 funciones,16 políticas y3 triggers.
El bloque añadió exactamente6 tablas/3 políticas/18 funciones/1 trigger;0 filas nuevas.
PK/FK/CHECK/índices,exclusión global por persona y rango[),columnas/ACL,firmas/cuerpos,
search_path,propietario e historial verificados;datos/objetos anteriores preservados.
Google Auth/identidad/configuración,huellas de secretos y las2 Edge ACTIVEv1/JWT intactas.

Confirmación antigua public.confirm_booking/private.reservation_confirm sin EXECUTE
para PUBLIC,anon,authenticated y service_role. confirm_booking_paid/care/cancel solo
service_role según contrato; motor interno conserva su propietario. No se reabrió la
vía antigua. No se invocaron comandos de negocio para probar escrituras Cloud.
reservation-command sigue sin desplegar,cloud-integration desactivado;noCORS/Auth/secretos
editados. LOCAL/37 reservas,Metro/log intactos;sin fixtures,instalaciones,APK,staging o commits.

No quedan fallos nuevos de este bloque. Siguiente autorización independiente:20261115171232,
20261115203629 y20261115210802 (perfil propio,horarios,reprogramación);después011 y Edge/
configuración/cliente con permisos separados. No ejecutar bloques posteriores por este cierre.
Resultado ignorado stage02-complete.json y snapshots por paso. No confundir validación
estructural Cloud con E2E de negocio/Google integrado todavía pendiente.

### Detención inicial del segundo bloque — histórica, resuelta con autorización

El usuario autorizó únicamente las cuatro migraciones de este bloque, secuenciales y
con parada ante cualquier fallo. Preflight real de solo lectura:219 checks aprobados,
historial8 y catálogo sin deriva, tablas de negocio vacías, Auth/Google/configuración/
secretos/Edge preservados. Verificador local:9 pruebas positivas/negativas aprobadas.
Dry-run exacto de un pendiente,0 seeds/roles y skip-vault; CLI aplicó una sola vez
20261114224344_booking_atomic.sql y la registró oficialmente. NO reaplicarla.

La comprobación posterior se detuvo en FUNCTION_BODY_private.reservation_confirm.
Diagnóstico sobre el snapshot ya obtenido: el cuerpo remoto coincide exactamente con
el SQL aprobado original, incluido un comentario interno. El modelo local eliminó ese
comentario al preparar la referencia, provocando un falso positivo. No hay diferencia
demostrada del SQL desplegado; la validación completa del primer paso sigue pendiente.
No se corrigió el verificador ni se continuó con los pasos2–4, según la condición de parada.

Estado del snapshot:historial9,14 tablas/38 funciones/16 políticas/2 triggers; las tres
tablas nuevas de reservas vacías. Identidad Google/huellas Auth,configuración,secretos y
Edge sin cambios. No datos,Edge,CORS,cliente,LOCAL/37 reservas,Metro o log operados.
Todavía no se aplicó005: la revocación del confirmador antiguo continúa pendiente;
reservation-command no desplegada y cloud-integration siguen desactivados.

Para reanudar se solicitó y obtuvo permiso nuevo: corregir únicamente la extracción del cuerpo
de función en el verificador para conservar comentarios originales, sin quitar controles;
revalidar íntegramente el paso1 y confirmar historial9. Solo si aprueba, aplicar y verificar
20261115030159,20261115033925 y20261115151745, una por una. Conservar diagnóstico/stop
históricos. Archivos ignorados stage02-diagnosis.json,stage02-stopped.json y snapshot
stage02-step-1-catalog.json; no reintentos,repair,borrados ni rollback automático.

### Alcance revisado del segundo bloque

Relectura Cloud previa al bloque2: destino vuoncrtkkkquvddunrxx/sa-east-1
ACTIVE_HEALTHY, PostgreSQL17.11, historial exacto8 y SQL registrado coincidente;
11 tablas/31 funciones/13 políticas/2 triggers. Catálogo completo y huellas de identidad
Google/configuración/secretos/Edge coinciden con el cierre anterior. Solo lectura,
sin nuevos datos ni aplicación del bloque2. Preparación ignorada:
.artifacts/007-cloud-auth/stage-02/manifest.json, con hashes de los cuatro SQL,
baseline y executionAuthorized=false; el preparador no contiene ejecución de SQL/despliegue.

| Orden y archivo en supabase/migrations/ | Alcance exacto | Totales esperados después: historial/tablas/funciones/políticas/triggers |
| --- | --- | --- |
| 1. 20261114224344_booking_atomic.sql | public.reservations, public.reservation_items y public.reservation_events; RLS en las3; reservation_read, reservation_items_read y reservation_events_read; 7 funciones, sin triggers. | 9/14/38/16/2 |
| 2. 20261115030159_booking_agenda.sql | 2 funciones de agenda. Sin tablas, políticas ni triggers nuevos. | 10/14/40/16/2 |
| 3. 20261115033925_booking_cancellation.sql | 3 funciones de cancelación. Sin tablas, políticas ni triggers nuevos. | 11/14/43/16/2 |
| 4. 20261115151745_care_payments.sql | private.care_settings, private.booking_care y private.care_events, RLS sin políticas de acceso directo; 6 funciones y trigger care_cancel_guard BEFORE UPDATE OF state sobre reservations. Revoca EXECUTE del confirmador sin método. | 12/17/49/16/3 |

Dependencias: atomic reutiliza btree_gist en extensions, profiles/barbershops/membresías,
oferta/horarios, booking_actor y booking_keys ya desplegados. Agenda y cancelación
requieren reservations y reservation_json; pagos requiere el motor y se coordina con
cancelación mediante la guarda. Cada paso espera la verificación completa del anterior.
No hay backfill, escrituras de filas al aplicar, ni ALTER de tablas/políticas002 o Auth.
Los seis nuevos objetos de tabla tienen FK restrictivas; no se trasladan datos LOCAL.

Las18 funciones se distribuyen en6 RPC públicas y12 auxiliares privadas. RPC y ACL finales:

- authenticated: list_booking_slots y list_booking_agenda, con identidad auth.uid() y
  autorización actual; sus auxiliares de lectura también tienen EXECUTE autenticado.
  Las3 políticas permiten únicamente SELECT contextual, con columnas restringidas en
  reservations/events. No se concede INSERT/UPDATE/DELETE directo de reservas.
- service_role: cancel_booking, care_booking y confirm_booking_paid, junto con sus
  implementaciones privadas necesarias. La identidad debe provenir del JWT verificado
  por Edge; SQL revalida usuario/membresías/asignación. La clave de servicio no acredita
  por sí sola al actor. PUBLIC/anon/authenticated carecen de EXECUTE en estas escrituras.
- confirm_booking y private.reservation_confirm quedan sin EXECUTE para PUBLIC, anon,
  authenticated y service_role después de005. Solo el propietario conserva el motor
  interno, llamado por confirm_booking_paid SECURITY DEFINER. Los demás auxiliares
  internos quedan cerrados. Todas las18 funciones fijan search_path vacío.

La revisión estática sigue las llamadas al motor: wrapper antiguo y wrapper pagado;
no aparecen otras rutas SQL al confirmador. La ACL se revoca dentro de la misma
transacción que crea la confirmación pagada. Esta exige paymentMethod cash/yape y
crea reserva/detalles/evento y ledger pendiente/evento juntos; Yape sin instrucciones
revierte. No inventa deudas, métodos ni historial para registros anteriores.
Se verificará remotamente has_function_privilege para todos los roles, además de ACL
de tabla y columna; BYPASSRLS no sustituye EXECUTE. No reabrir el confirmador antiguo
para resolver incompatibilidades de Edge.

Coordinación: durante los pasos1–3 existe temporalmente la ACL original de confirmación,
pero reservation-command aún no está desplegada y cloud-integration permanece cerrada.
Tras005, el adaptador existente dirige cash/yape a confirm_booking_paid. Su compatibilidad
antigua sin método recibiría rechazo de permisos, sin reintentar otro RPC. Dos nuevas
regresiones con dobles comprueban ambas rutas, identidad verificada y error seguro.
El despliegue posterior de reservation-command requiere permiso aparte, SQL correspondiente
acreditado y JWT del mismo Cloud; el bundle actual incluye comandos010, por lo que se
mantiene el orden previsto de terminar también sus dependencias antes de publicar Edge.
No se activa el cliente ni se modifican CORS, secretos o proveedor con este lote SQL.

Verificación por archivo: dry-run exacto de un único pendiente, hash/destino/historial;
después, historial oficial y definición/firma por identidad PostgreSQL (OID/esquema),
RLS/ACL/columnas, PK/FK/CHECK/índices/exclusión GiST global por persona y rango [),
políticas y trigger cuando corresponda. Verificar tablas nuevas vacías, objetos anteriores
sin cambios y huellas Google/Auth/secretos/Edge preservadas. En el último paso verificar
también la retirada de EXECUTE antiguo y los permisos del confirmador pagado. No crear
fixtures ni invocar comandos de negocio para validar estructura; las pruebas de escritura
Cloud necesitarán autorización separada. Los resultados LOCAL previos no prueban Cloud.

Parada: hash/historial/destino diferente, colisión de objetos, timeout, fallo SQL,
ACL/RLS inesperados o cambio de huellas. Si el commit es incierto, solo diagnosticar
catálogo e historial, sin repetir. Conservar los pasos ya confirmados y el cliente
desactivado. Recuperación: transacción del archivo fallido y comprobación posterior;
una corrección hacia adelante o retirada de objetos requiere permiso nuevo. No DROP,
CASCADE, repair, reset ni restauración automática de Auth. No se promete rollback del lote.

Verificaciones independientes de esta preparación:130 comprobaciones locales de alcance,
dependencias, ausencia de DML externo, hashes/historial/huellas y ACL modeladas;11 pruebas
de servidor con dobles (incluidas las2 regresiones nuevas), tipos del núcleo servidor,
lint del test y arquitectura aprobados. No son ejecución real de reservas/pagos Cloud.

### Tercer bloque — completado con autorización independiente

El usuario autorizó exclusivamente los tres SQL revisados, aplicación secuencial y parada
ante fallos. Preflight real379 comprobaciones de lectura:destino correcto,historial12,
hashes y catálogo sin deriva;datos vacíos,Google/Auth/config/secretos/Edge preservados.
Verificador local16 pruebas aprobadas (incluidas firmas por OID,comentarios originales,
ACL y detección de cambios de campos financieros). No se retiraron verificaciones.

| Migración aplicada una vez | Verificaciones Cloud read-only | Historial |
| --- | --- | --- |
| 20261115171232_own_professional_profile.sql | 749 aprobadas | 13 |
| 20261115203629_own_professional_schedule.sql | 795 aprobadas | 14 |
| 20261115210802_booking_reschedule.sql | 966 aprobadas | 15 |

Dry-run de un único pendiente antes de cada aplicación,0seeds/roles y skip-vault. Final:
19 tablas (14 públicas/5 privadas),todas RLS;67 funciones,16 políticas,3 triggers.
Exactamente2 nuevas tablas privadas vacías y18 funciones nuevas (11RPC service_role y
7 auxiliares cerrados),sin datos de negocio ni backfill. PK/FK/CHECK/índices,RLS,ACL de
tabla/columna,firmas/cuerpos/tipos de retorno,search_path e historial comprobados;objetos
y datos anteriores intactos. Confirmador antiguo cerrado PUBLIC/anon/authenticated/
service_role;no cambios a sus ACL ni a confirmación pagada/cancelación/atención005.

Compatibilidad de reprogramación acreditada estructuralmente:el cuerpo desplegado
coincide con el aprobado,actualiza solo starts_at/ends_at/occupied_until y registra
historial/idempotencia,conservando ID,profesional,servicios,precio y pago. No escrituras
care;locks/validaciones y exclusión anteriores preservados. No se invocaron operaciones
de reprogramación ni cambios de perfil/horarios con datos Cloud:esa prueba funcional
requiere permiso para datos y Edge, y no queda acreditada por esta lectura.

Google Auth/identidad,JWT/configuración y huellas de secretos intactas;las2 Edge siguen
ACTIVEv1/verify_jwt=true. No Edge/CORS/Auth/cliente activados ni modificados. LOCAL37
reservas y dependencias,Metro/log protegidos. Sin instalaciones,APK,limpieza,staging,
commit o push. Ningún fallo nuevo. Resultado ignorado stage03-complete.json,catálogos y
registros por paso;preservar baseline/manifest preparado como historia,no como permiso.

Siguiente autorización independiente:011/20261115230134_team_professional_summary.sql;
después Edge/configuración/cliente y datos de prueba con permisos separados. No ejecutar
otros bloques por este cierre. El cliente cloud-integration continúa desactivado.

### Alcance e inspección previos del tercer bloque — históricos

Relectura Cloud:vuoncrtkkkquvddunrxx/sa-east-1 ACTIVE_HEALTHY,PG17.11,historial exacto12
y catálogo idéntico al cierre2:17 tablas RLS/49 funciones/16 políticas/3 triggers. Las
sentencias registradas coinciden con los12 SQL locales. Identidad Google y huellas de
configuración Auth/secretos/Edge sin deriva. No se repitieron las734 verificaciones.
Preparación offline120 checks aprobados, hashes y cuerpos originales con comentarios
registrados en .artifacts/007-cloud-auth/stage-03/manifest.json;executionAuthorized=false.
No contiene código de aplicación SQL/despliegue. Baseline ignorado stage03-baseline.json.

| Orden/archivo en supabase/migrations/ | Efecto al aplicar | Totales esperados: historial/tablas/funciones/políticas/triggers |
| --- | --- | --- |
| 1. 20261115171232_own_professional_profile.sql | 2 RPC y1 auxiliar;sin tablas nuevas ni cambios de filas. | 13/17/52/16/3 |
| 2. 20261115203629_own_professional_schedule.sql | 4 RPC y1 auxiliar;sin tablas nuevas ni cambios de filas. Depende del auxiliar008. | 14/17/57/16/3 |
| 3. 20261115210802_booking_reschedule.sql | private.reschedule_settings y private.reschedule_events vacías,con RLS,PK/FK/CHECK/índices;5 RPC y5 auxiliares. Sin backfill. | 15/19/67/16/3 |

RPC nuevas exactas (11), EXECUTE únicamente service_role:
- Perfil: get_own_booking_professional, update_own_booking_professional.
- Horarios: get_own_booking_schedule, set_own_booking_schedule,
  upsert_own_booking_block, remove_own_booking_block.
- Reprogramación: reschedule_booking, list_reschedule_slots,
  get_reschedule_policy, set_reschedule_policy, get_reschedule_history.

Los11 wrappers públicos son SECURITY DEFINER con search_path vacío;las7 auxiliares
privadas son SECURITY INVOKER y carecen de EXECUTE para PUBLIC/anon/authenticated/
service_role. Sus nombres:self_professional_command,self_schedule_command,
reschedule_capacity,reschedule_lock,reschedule_eligible,reschedule_available,
reschedule_command. No permisos directos sobre las2 tablas nuevas ni políticas que
permitan acceso ordinario;private no se expone. No cambiar RLS/ACL de tablas existentes,
crear triggers ni reemplazar funciones ya desplegadas. El actor se origina en JWT
verificado por Edge;SQL comprueba cuenta/membresía/perfil/asignación contextual vigentes.

Compatibilidad revisada:
- 008 edita únicamente el nombre del perfil propio activo;incrementa versión de oferta
  solo ante cambio real. No modifica snapshots de reservas ni atributos administrativos.
- 009 reutiliza008 y tablas004. Cuando se invoque posteriormente, reemplaza solo los
  intervalos propios o edita/retira bloqueos propios con versión;serializa con la
  confirmación existente, conserva contención/exclusión y rechaza cambios que afecten
  citas comprometidas. Un rechazo revierte la operación completa. Aplicar el SQL no
  invoca estas escrituras ni modifica horarios/bloqueos/versiones existentes.
- 010 depende de reservas/items,booking_care y motor004/005. Cambia solo starts_at,
  ends_at y occupied_until de la misma reserva, con locks por persona y exclusión
  global vigente. Conserva ID,profesional,servicios,precio,snapshots,pago e historial005;
  no escribe care. Rechaza canceladas/atención iniciada/completada/inasistencia y pagos
  incompatibles. Antelación120 por defecto sin insertar filas históricas;cliente cumple
  el límite respecto al inicio actual. Admin activo o barbero asignado pueden excederlo
  con motivo obligatorio. Mantiene expectedStartsAt,requestId,rollback e historial propio.
- Ningún archivo concede EXECUTE al confirmador antiguo:debe seguir cerrado para
  PUBLIC/anon/authenticated/service_role antes y después de cada paso.

Ejecución propuesta, solo después de autorización independiente:revalidar destino12/
baseline/hashes;workdir por paso con prefijo exacto,seed=false,sin .env/roles/fixtures;
dry-run de un único pendiente y CLI --remote=vuoncrtkkkquvddunrxx --skip-vault. Una
migración por vez,con historial oficial,catálogo,PK/FK/CHECK/índices,RLS,firmas por OID/
esquema,cuerpos originales,search_path,propietario y EXECUTE efectivos cotejados antes
de avanzar. Verificar tablas nuevas vacías,objetos/datos anteriores y huellas Auth/
Google/config/secretos/Edge preservados. No operaciones de perfil/horarios/reprogramación
con datos para validar estructura;pruebas de escritura Cloud requieren otro permiso.

Parar por deriva,hash/destino/historial distintos,fallo SQL o de cualquier comprobación.
Ante commit incierto,solo diagnosticar catálogo e historial,sin reintentar/reaplicar.
Conservar pasos ya registrados y cliente cerrado. No DROP/CASCADE/reset/repair ni
reversión destructiva automática;corrección hacia adelante o retirada necesita permiso.
Los archivos usan BEGIN/COMMIT;no se promete rollback global de las tres migraciones.

Este alcance no incluye011,Edge,CORS/Auth/secretos,datos ni activación cloud-integration.
Tras él siguen011 y conexión final con permisos separados. No tocar LOCAL37reservas,
Metro/log ni trasladar usuarios/sesiones/datos entre entornos.

### Cuarto bloque — 011 aplicado y verificado con autorización independiente

Revisión final de20261115230134_team_professional_summary.sql:hash
40504c2c62a75472fd32102f127acef9bb7993c6d7848318d74a333d88d28fc4.
Definiciones coincidentes con admin-invitations.sql y professional-summary.sql de011.
El único DROP previsto sustituye staff_invitations_role_check dentro de la misma
transacción por role IN('barber','administrator');no elimina tablas/filas ni cambia RLS.
La envoltura respond_booking_invitation pasa de INVOKER a DEFINER según el contrato,
manteniendo firma/ACL/propietario/search_path y EXECUTE service_role. Despacha admin a
su ruta validada y conserva el cuerpo/ACL de private.booking_command para barberos.
El nuevo trigger actúa solo al aceptar administrador e impide eludir esas condiciones.

Preflight real819 checks:destino nuevo,historial15 y catálogo sin deriva;contratos,
CHECK original,objetos/datos/huellas Google/Auth/secretos/Edge preservados.17 pruebas
locales del verificador aprobadas,incluidas alcance,compatibilidad de aceptación,
caducidad/destinatario/emisor activo y resumen propio sin datos financieros inventados.
CLI aplicó una sola vez la migración tras dry-run de un único pendiente,0seeds/roles
y skip-vault;sin datos,envíos o cambios de configuración.981 comprobaciones finales
read-only aprobadas:historial16,20 tablas RLS(14public/6private),80 funciones,16 políticas,
4 triggers. Exactamente1 tabla privada nueva vacía,13 funciones nuevas y1 reemplazo,
CHECK ampliado y1 trigger;sin filas de negocio creadas/modificadas.

Verificados PK/FK/CHECK/índices,RLS/ACL de tabla/columna,firmas por OID/esquema,cuerpos
originales,tipo de retorno/search_path/propietario y permisos:8 RPC nuevas y la envoltura
compartida solo service_role,5 auxiliares privadas cerradas. La implementación original
de barberos y los demás objetos permanecen intactos. Condición WHEN y evento/columna del
trigger exactos;confirmador antiguo sigue bloqueado. Google Auth/identidad/configuración/
JWT y huellas de secretos intactos;2 Edge ACTIVEv1/verify_jwt=true sin redespliegue.
Sin fallos nuevos. Resultado ignorado stage04-complete.json y snapshots por operación.

No invocaciones de invitación/aceptación/resumen con datos,ni correo externo:la evidencia
LOCAL anterior no sustituye E2E Cloud. No Edge,CORS/Auth o cliente modificados;LOCAL37
reservas/Metro/log protegidos. Sin instalaciones,APK,reinicios,limpieza,staging o commits.

### Despliegue Edge autorizado — completado 16/11/2026

Destino vuoncrtkkkquvddunrxx confirmado;preflight103 checks,16 migraciones/catálogo y
datos iguales al cierre011,31 dependencias RPC disponibles/ACL correctas. Revisión de
28 módulos para barbershop-operation y30 para reservation-command;archivos con hashes
y grafo TypeScript local,sin paquetes externos nuevos. Paquetes aislados con solo la
entrada nombrada y _shared transitivo,deno.json y verify_jwt=true;sin .env/secretos/
datos ni las entradas ensure-profile/create-barbershop. CLI3.1 deploy por API,un nombre
por ejecución,--remote explícito,--jobs1,sin Docker,prune o desactivar JWT.

Ambas funciones nuevas ACTIVE/v1/verify_jwt=true;la primera se verificó antes de la
segunda. Las2 anteriores conservaron nombre/versión/estado/JWT.30 pruebas dirigidas de
servidor con dobles aprobadas,deno check de las2 entradas,lint y arquitectura servidor
aprobados. No repetir suites reales LOCAL previas:este bloque no ejecutó negocio.

| HTTP real por cada nueva Edge | Resultado |
| --- | --- |
| OPTIONS sin Origin | 204;worker disponible. |
| POST sin sesión/sin Origin | 401 UNAUTHENTICATED. |
| POST con JWT ficticio inválido/sin Origin | 401 del gateway JWT. |
| OPTIONS con Origin localhost:8081 | 403 FORBIDDEN;CORS pendiente,sin ACAO. |
| OPTIONS con origen ajeno | 403 FORBIDDEN,sin ACAO. |
| POST sin sesión con Origin localhost:8081 o ajeno | 403 FORBIDDEN,sin ACAO. |

14 solicitudes HTTP/20+21 guardas de verificación aprobadas. La respuesta pública401
del gateway al JWT malformado trae ACAO '*';no contiene negocio y no sustituye la
allowlist del handler. No se modificó el gateway/JWT para cambiar ese error. Los
preflight con Origin y los rechazos del handler no permiten el origen ni '*'.

Huella de catálogo/historial/identidad Google,configuración y digests de secretos
idénticos;20 tablas/80 funciones/16 políticas/4 triggers y0 filas de negocio sin cambio.
No JWT reales,sesiones,usuarios,perfiles,reservas o correo usados/creados. No valores
secretos copiados al paquete. LOCAL37reservas,Metro y log protegidos. No instalaciones,
APK,reinicios,staging,commit o push. Resultado ignorado edge-deploy-complete.json y
snapshots/manifest/HTTP por función. No se activó cloud-integration.

CORS y resumen siguen pendientes:BARBERIA_ALLOWED_ORIGINS y
BARBERIA_ENABLE_PROFESSIONAL_SUMMARY siguen ausentes. El guard LOCAL no se activa en
Cloud y mail()/resumen opcionales no exigen credenciales con flags desactivados. No
activar admin-invitations ni usar Mailpit en Cloud;Resend externo requiere permiso.

### Verificación final de CORS y transición Edge — completada16/11/2026

Con autorización expresa se corrigió únicamente el verificador local para aceptar las4
transiciones conocidas v1→v2. No admite v3,baseline v2,funciones extra/ausentes ni cambios
de código/identidad/JWT/import map/entrypoint/estado. Operador limitado al modo verify;
no puede alcanzar el anterior camino de escritura.7 regresiones RED→GREEN nuevas y7
de huellas aprobadas. Descargas API nuevas cotejan el conjunto exacto de archivos con
la revisión observada y sus contenidos con los originales auditados:11/11/25/27 TS,
0 diferencias. Identidades y todos los metadatos se cotejaron antes y después de HTTP.

Resultado:107 comprobaciones aprobadas,incluidas38 peticiones HTTP a las4 funciones.
- localhost8081:OPTIONS204,ACAO exacto,Vary Origin,métodos/cabeceras esperados.
- Orígenes ajenos y coincidencias parciales:OPTIONS403;POST ajeno403,sin ACAO.
- Sin sesión:401 tanto Web como nativo;JWT inválido:401 del gateway. El error del gateway
  conserva ACAO '*',observado anteriormente;no permite acceso ni cambia CORS del handler.
- Resumen profesional:flag habilitado,comando rechazado401 sin identidad válida. Su
  ejecución autenticada/contextual Cloud no se acreditó con estas pruebas negativas.

Las2 variables autorizadas tienen las huellas SHA-256 esperadas;las7 anteriores idénticas.
Auth/Google/configuración,esquema/RLS/ACL/historial y conteos de datos sin cambio.
No sesiones ni escrituras remotas,secrets set repetido,deploy o reinicios. Cliente
cloud-integration y correo administrativo externo siguen desactivados. LOCAL/37 reservas,
Metro y log intactos. Resultado ignorado cors-config-verified.json y prueba de integridad
cors-config-v2-integrity.json;la parada anterior se conserva en cors-config-version-stop.json.
El siguiente permiso necesario es activar el perfil separado y realizar sesiones Google
Web/Android con creación/consulta del perfil propio de aplicación en este mismo Cloud.
No equivale todavía a integración E2E ni cierre de007.

### Antecedente — huellas y configuración aplicada una vez; parada por revisiones Edge

El usuario autorizó corregir únicamente los2 verificadores,baseline fiable y las2
variables si aprobaban. Verificado el binarioCLI3.1.0 y fuentes oficiales: list.handler.ts
transmite value de listAllSecrets;secrets.format.ts lo presenta como DIGEST. La referencia
oficial Terraform identifica las huellas de API como SHA-256 hex. Fuentes:
https://github.com/supabase/cli/blob/v3.1.0/apps/cli/src/commands/secrets/secrets.format.ts
y https://supabase.com/docs/guides/deployment/terraform/reference.

audit.mjs y configure-cloud-cors.mjs normalizan ahora value→digest,exigen hex64/nombre
válido,no duplicados ni undefined,y ordenan canónicamente sin updated_at. No texto plano
ni silencios ante metadatos inválidos.7 regresiones RED→GREEN prueban serialización,
orden/timestamps,igualdad,cambios reales con mismos nombres,ausentes/máscaras/duplicados
y errores sin filtrar valores. Auditoría marca contrato CLI3.1-value-is-SHA256-v2;no
revalida retroactivamente las huellas históricas que solo cubrían nombres.

Parada y baseline inválidos originales preservados como cors-config-first-stop.json y
cors-config-first-invalid-baseline.json. Nuevo baseline de7 huellas reales aprobado,
11 checks de lectura,ambas variables ausentes. CLI ejecutó secrets set UNA vez con
archivo aislado de exactamente2 entradas,remoto explícito y sin otros secretos/config:
BARBERIA_ALLOWED_ORIGINS=http://localhost:8081
BARBERIA_ENABLE_PROFESSIONAL_SUMMARY=true

La verificación se detuvo ANTES de HTTP con EDGE_VERSIONS_OR_JWT_CHANGED:las4 Edge
pasaron v1→v2,ACTIVE/JWT=true. La CLI oficial set.handler.ts solo envía bulkCreateSecrets;
no ejecutamos functions deploy/reinicios. El cambio es compatible con la propagación
automática de secretos por Supabase,no se asume sin verificar la conservación del código.

Diagnóstico read-only posterior:las2 huellas configuradas coinciden con SHA-256 de los
valores aprobados;las7 huellas preexistentes son idénticas,solo2 nombres nuevos. Correo
administrativo sigue deshabilitado. Se descargaron por API las4 fuentes a directorios
ignorados y se cotejaron con los artefactos previos:11/11/25/27 archivos TS,entradas
presentes y0 diferencias. Esquema/historial/permisos/identidad Google y conteos de negocio
idénticos;config Auth sin cambio. No datos,sesiones,Cloud cliente,LOCAL37reservas,Metro o
log operados. Sin instalaciones,APK,limpieza,staging,commit o push.

En esa ejecución no se corrigió la guarda ni se reintentó/retrocedió configuración.
La autorización posterior y el resultado de lectura se registran en la sección superior.
Toda revisión/código/JWT adicional inesperado debe seguir deteniéndose. La consulta real
autenticada del resumen y las sesiones del perfil cliente requieren permiso separado.

Diagnósticos ignorados cors-config-version-diagnosis.json,cors-config-source-revisions.json,
cors-config-diagnosis-after-set.json y cors-config-diagnosis-database.json;parada vigente
cors-config-version-stop.json. No publicar huellas/valores sensibles ni marcar cierre completo.

### Primera configuración CORS/resumen — parada histórica anterior al cambio, corregida

El usuario autorizó únicamente BARBERIA_ALLOWED_ORIGINS=http://localhost:8081 y
BARBERIA_ENABLE_PROFESSIONAL_SUMMARY=true,sin sesiones/datos/redeploy/cliente. Preflight
de lectura aprobó9 checks:destino nuevo,4 Edge ACTIVEv1/JWT,esquema/Google/datos sin deriva,
ambas variables AUSENTES y permisos de resumen público service_role/auxiliar cerrada.
El estado previo ausente quedó en cors-config-baseline.json.7 pruebas dirigidas de
servidor CORS/resumen aprobaron. No prueba funcional autenticada de resumen Cloud.

La guarda anterior a secrets set se detuvo con OTHER_SECRET_VALUES_CHANGED. NO se
ejecutó secrets set ni se creó directorio/env de aplicación;no hay attempt/applied.
Diagnóstico read-only:CLI3.1 secrets list devuelve name,value,updated_at;no digest.
Los7 value observados tienen formato hexadecimal64,sin imprimirlos/guardarlos. El
comparador usó digest:undefined;JSON omitió esa propiedad en baseline y comparó después
con objetos que la conservaban como undefined. Falso positivo de normalización,no
deriva demostrada. Ambas variables siguen AUSENTES;sin cambios remotos ejecutados.

Limitación detectada también en audit.mjs histórico:secretDigestsFingerprint se formó
con name/digest cuando digest faltaba;por tanto esa huella anterior acreditaba nombres,
no valores de secretos. No atribuirle retroactivamente una comparación válida de
valores. Las operaciones anteriores no ejecutaron secrets set;preservar los registros
y esta limitación. Antes de cualquier cambio debe tomarse baseline nuevo con huellas
reales,validación de formato/campo,comparación del resto y regresiones de serialización.

Conforme a la condición de parada,no se corrigieron verificadores ni se repitió la
operación. Hace falta permiso específico para corregir únicamente lectura/normalización
de huellas en audit.mjs y configure-cloud-cors.mjs,añadir regresiones,conservar la parada
histórica,revalidar y aplicar por primera vez las2 variables solo si todo aprueba. No
Auth/Edge/SQL/cliente/sesiones/datos nuevos por esa corrección. Diagnósticos ignorados
cors-config-diagnosis-*.json y cors-config-stopped.json;sin valores/huellas en reportes.
El resumen continúa deshabilitado y el preflight Web conserva el bloqueo previo.

### Autorizaciones siguientes — CORS verificado; cliente no concedido

1. Edge:despliegue de las2 nuevas COMPLETADO según registro superior. No autoriza nuevos
   redespliegues ni cambios de las2 anteriores;se conservan JWT y variables automáticas
   del mismo proyecto. No trasladar .env,claves,Mailpit o datos LOCAL.
2. Configuración Edge/CORS:COMPLETADA con BARBERIA_ALLOWED_ORIGINS=http://localhost:8081
   y BARBERIA_ENABLE_PROFESSIONAL_SUMMARY=true.38 peticiones HTTP acreditadas arriba;
   no volver a establecer variables ni desplegar por rutina.
   Invitaciones administrativas Cloud permanecen desactivadas:habilitar Resend requiere
   proveedor/remitente/dominio/API key/destinatarios y permiso de envío independientes.
3. Cliente:tras SQL/HTTP acreditados,activar solo el perfil separado cloud-integration
   con URL/publishable/revisión20261115230134 del mismo proyecto,sin tocar el perfil
   LOCAL ni reutilizar sesiones. La recarga/reinicio controlado de Metro8081,si hace
   falta para tomar variables,requiere autorización expresa;sin otro APK por cambios JS.
   Autorizar aparte sesiones Google Web/Android y creación/consulta del perfil propio
   de aplicación para el ensayo;no crear barberías/reservas ni migrar datos LOCAL.

### Referencia de Edge y configuración — despliegue y configuración completados

- Nuevas funciones Cloud: barbershop-operation y reservation-command, desde sus entrypoints
  actuales y _shared/. Sin módulos Node ni versiones de dependencias nuevas.
- ensure-profile y create-barbershop ya desplegadas no necesitan redespliegue según la
  comparación de fuentes de esta auditoría. Cualquier cambio posterior requerirá permiso.
  Las Edge nuevas incluyen su propia copia del auxiliar de verificación compartido.
- Mantener verify_jwt=true en las cuatro. Antes de habilitar el cliente: JWT rechazado401,
  JWT válido aceptado por el verificador del mismo proyecto y RLS/ACL comprobadas. No usar
  --no-verify-jwt para resolver un error. SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY y cualquier
  secreto de servidor deben pertenecer al mismo Cloud; jamás publicar service_role.
- BARBERIA_ALLOWED_ORIGINS: conservar valores autorizados y añadir exactamente
  http://localhost:8081 si falta. Android usa el enlace aprobado y JWT; no autorizar '*'.
  No aplicar el parche Kong LOCAL en Cloud. Redirects Google ya validados: conservarlos.
- Activar BARBERIA_ENABLE_PROFESSIONAL_SUMMARY=true tras SQL validado. Los comandos008–010
  usan sus RPC desplegadas. Invitaciones administrativas Cloud siguen desactivadas hasta
  configurar proveedor real autorizado. Mailpit y opciones localTeam no se trasladan.
  Para habilitarlas: BARBERIA_ENABLE_ADMIN_INVITATIONS, BARBERIA_INVITATION_MAIL_PROVIDER=resend,
  BARBERIA_INVITATION_FROM, BARBERIA_INVITATION_WEB_ORIGIN y RESEND_API_KEY privados, con
  remitente/dominio/origen aprobados; no inventar valores ni acreditar Gmail con Mailpit.
  EXPO_PUBLIC_CLOUD_ENABLE_ADMIN_INVITATIONS permanece false mientras falte ese paso.
- Revisar SMTP Auth Cloud y permisos de destinatarios antes de pruebas nuevas de registro/
  recuperación por correo. No modificar GoTrue LOCAL ni desactivar confirmación.

### Ejecución por etapas — SQL y despliegue completados; configuración/cliente pendientes

Para cada etapa: comprobar destino e historial, hashes de los archivos revisados y ausencia
de drift; generar workdir ignorado con prefijo exacto de migraciones (sin .env/seeds/roles),
usar CLI oficial con --remote=vuoncrtkkkquvddunrxx y --skip-vault. Dry-run debe mostrar
solo el lote autorizado,0 seeds/roles/vault; no usar link/config push/migration repair.
Aplicar mediante db push solo después de autorización. Cada archivo ya contiene BEGIN/
COMMIT; CLI debe registrar el historial de la misma aplicación, sin ediciones manuales.
La preparación histórica stage-01/ y sus ejecuciones individuales conservaron solo las5
migraciones registradas y las3 de catálogo,config mínima seed=false y hashes/destino.
Su aplicación ya terminó según el registro superior; no repetirla. Para bloque2 el
manifest stage-02/ es solo preparación, sin .env/roles/datos/secretos ni aplicación.
Revalidar los hashes y el catálogo antes de preparar cada dry-run autorizado.

| Etapa | Archivos/operación | Verificación antes de continuar |
| --- | --- | --- |
| 1 — catálogo | Primeras3 del listado:20261114195018,20261114202045,20261114220827. | Historial8 versiones,8 tablas nuevas vacías/RLS,8 políticas,2 triggers de horarios,24 funciones nuevas; search_path/ACL exactos,funciones002 intactas,Auth y configuración sin cambios. |
| 2 — motor/pagos |20261114224344,20261115030159,20261115033925,20261115151745. No Edge de reservas todavía. | Historial12 versiones,17 tablas totales de negocio (3 originales+14 nuevas),3 políticas reservas,care guard; confirm_booking y private.reservation_confirm sin EXECUTE service_role; confirm_booking_paid/care cerrados y datos vacíos. |
| 3 — profesional/reprogramación |20261115171232,20261115203629,20261115210802. | Historial15 versiones,19 tablas totales,5 RPC010 solo service_role,privadas cerradas,120 por defecto y0 filas/historial inventados. |
| 4 — equipo/resumen |20261115230134. Correo aún desactivado. | Historial16 versiones,20 tablas totales (3+17),CHECK válido,4 triggers del lote,73 funciones nuevas finalizadas/ACL y11 políticas añadidas; ninguna fila previa reescrita. |
| 5 — publicar backend | Las2 Edge nuevas ACTIVE/v1/JWT. Pendiente autorizar origen Web exacto y flag de resumen,sin Mailpit/invitaciones por correo. | HTTP negativo actual acreditado;tras configurar,debe aprobar OPTIONS204 para localhost8081,403 para ajeno,401 sin sesión. Sin usuarios o escrituras de prueba. |
| 6 — activar cliente y comprobar007 | Configuración integrada solo tras SQL/HTTP acreditados; datos y sesiones expresamente autorizados aparte. | Cuenta nueva/existente,perfil/UUID/no duplicación,contexto,contraseña y Google Web/Android; demostrar permisos reales con datos adicionales solo si autorizados. |

Las etapas no se aprueban juntas por esta auditoría. Las etapas1–4 quedaron autorizadas y
completadas según sus registros superiores:11 migraciones nuevas sobre las5 iniciales,
17 tablas nuevas con RLS,11 políticas nuevas,4 triggers y73 funciones nuevas en total;
verificaciones de lectura y0 filas de prueba. La publicación de las2 Edge de etapa5 también
quedó autorizada y ejecutada por separado;configuración de etapa5 y etapa6 aún pendientes.
Sin cambios de secretos/Auth,cliente o datos. Si drift,
timeout,incompatibilidad o permisos distintos aparecen,detenerse antes de continuar.

Recuperación: antes de cada etapa conservar catálogo/ACL/definiciones e historial en
archivo ignorado y huellas Auth/config; no volcar contraseñas/tokens. Un fallo dentro
de un archivo debe revertir su transacción; revisar catálogo/historial después de cerrar
la conexión. Las migraciones anteriores que ya terminaron quedan registradas: no
reaplicarlas ni hacer repair. Si el commit o registro es incierto,no reintentar hasta
identificar qué quedó aplicado. Mantener cloud-integration desactivado y el correo
apagado; LOCAL sigue independiente. Preparar corrección hacia adelante para revisión
si hace falta; retirar tablas/funciones/extensión o restaurar un backup requerirá una
autorización nueva y revisión de dependencias. No DROP/CASCADE/reset ni restauración
global de Auth para revertir negocio. Nunca prometer rollback automático de once archivos.
No existe una garantía PITR/backup Cloud acreditada en esta auditoría; no asumirla del plan.

### Datos y aceptación real aún pendientes de autorización

Sin ejecutar: dos cuentas controladas para distinguir Google nuevo de cuenta previamente
registrada con email confirmado. Reutilizar la Google Cloud del ensayo si cubre el primer
caso (identidad ya acreditada, perfil de aplicación aún no acreditado). Identificar otra
cuenta Cloud con email verificado y el mismo correo de un Google controlado; si no existe,
su registro y correo requieren autorización aparte. No inventar otra cuenta ni importar
Auth LOCAL. Usuario realiza Google/consentimiento; secretos y credenciales fuera de Git/logs.

Escrituras máximas propuestas para este recorrido007: hasta2 perfiles propios mediante
ensure-profile explícito;0 barberías,0 membresías,0 profesionales,0 servicios y0 reservas.
El contexto sin membresías es válido. Comparar UUID Auth/identidades, perfil y membresías
antes/después: mismo UUID para el caso existente, sin duplicar usuarios/perfiles/membresías.
No hacer linkIdentity ni confiar en roles de user_metadata. Hasta4 sesiones Google nuevas
(2 cuentas × Web/Android) solo con autorización específica; no repetir el ensayo Auth-only.
Si falta la segunda cuenta, detener solo ese caso y solicitar el alcance concreto de alta.

Tras desplegar y verificar: login normal → callback único → perfil existente o completar
perfil → contexto propio → logout, Web y Android. Añadir cuenta existente con fallo de
perfil/backend: no debe promover ready ni permitir acceso de negocio. Las pruebas actuales
son dobles/SDK, NO comprueban linking real de Google o RLS Cloud nuevas. La demostración de
reservas Cloud y cualquier fixture de negocios se autorizarían por separado; las37 citas
LOCAL permanecen intactas. T006 sigue pendiente hasta estas evidencias.

Referencias oficiales revisadas15/11: https://supabase.com/docs/guides/functions/auth
y https://supabase.com/docs/guides/auth/auth-identity-linking . Se conserva el verificador
actual; no se instala @supabase/server ni se reimplementa la vinculación del proveedor.

## Referencia de configuración y límites

Usar el proyecto Cloud NUEVO vuoncrtkkkquvddunrxx solo para la prueba Auth007. Ya dispone
de HTTPS público y de profiles002; evita túnel público hacia el gateway LOCAL y cambios
adicionales de GoTrue. No despliega004/005 ni prueba reservas Cloud. Nunca enviar un token
Cloud a LOCAL ni migrar las37 reservas actuales. Configuración externa realizada por el
usuario; la prueba Auth y cualquier aprovisionamiento de perfil requieren autorización.

Pasos concretos del responsable, solo después de aprobar el destino:
1. Google Cloud Console → seleccionar proyecto propio → Google Auth Platform → Branding:
   nombre de aplicación y contacto controlado. Audience: External/Testing y usuarios de
   prueba autorizados; Data Access limitado a openid, userinfo.email y userinfo.profile.
2. Clients → Create client → Web application (este flujo usa navegador+Supabase, no SDK
   Google nativo). Authorized JavaScript origins: http://localhost:8081 para esta prueba.
   Authorized redirect URI exacta:
   https://vuoncrtkkkquvddunrxx.supabase.co/auth/v1/callback .
   No usar aquí appbarberia:// ni /auth/callback del cliente; son el segundo salto.
3. Copiar Client ID y Client Secret directamente a Supabase Dashboard del proyecto NUEVO
   → Authentication → Sign In / Providers → Google. Nunca al chat, Git ni EXPO_PUBLIC.
   Habilitar proveedor con la configuración documentada; no habilitar linking manual
   o desactivar comprobaciones para resolver errores.
4. Authentication → URL Configuration: conservar valores actuales y añadir únicamente
   http://localhost:8081/auth/callback y appbarberia://auth/callback si faltan. No wildcards
   generales ni cambios de Site URL innecesarios: el código envía redirectTo explícito.
5. Para completar profile002 desde Web, comprobar la allowlist exacta del ensure-profile
   Cloud (BARBERIA_ALLOWED_ORIGINS) y autorizar aparte añadir http://localhost:8081 si
   falta, preservando los orígenes existentes. No relajar JWT, RLS ni Origin.
6. Preparar un perfil de ejecución JS aislado Cloud-Auth con clave pública del proyecto,
   namespace propio y negocio004/005 deshabilitado; el Development actual sigue usando
   LOCAL por defecto. Ya implementado como perfil DEV descrito arriba, sin activar OAuth.
   No basta cambiar una URL de OAuth ni reutilizar la clave local. No requiere otro APK
   por este flujo de navegador.
7. Validar primero Web y después APK Android: cuenta Google autorizada, retorno PKCE,
   perfil/membresías verificadas, cancelación, cuenta existente y logout. No se crearán
   usuarios ni se ejecutará el recorrido sin la autorización correspondiente.

Revisión15/11: documentación oficial reconfirmada. El código actual usa OAuth en navegador
con Supabase/PKCE en ambas plataformas, no un SDK Google nativo: para este recorrido se
crea el clienteWeb descrito, sin añadir credencialAndroid/SHA-1 ni paquetes/APK nuevos.
No desactivar nonce/JWT/linking para resolver errores. La aprobación del destino y cuentas
controladas es previa a guardar cambios en Supabase Cloud. Client ID/Secret se introducen
directamente en Dashboard; nunca al chat ni a una variable EXPO_PUBLIC del cliente.

El runtime Development por defecto continúa LOCAL: no activar EXPO_PUBLIC_ENABLE_GOOGLE
para sustituir el perfil aislado. URL y clave pública DEL MISMO Cloud, namespace propio
y ausencia de adaptadores de negocio son obligatorios. Los callbacks se canjean contra
ese mismo Auth Cloud. No copiar usuarios/membresías por coincidencia de email. Este perfil
solo permite Auth; no crea perfiles ni datos de reservas LOCAL o Cloud.

Alternativa si se exige todo LOCAL: HTTPS estable con proxy/túnel limitado a Auth y
callback /auth/v1/callback, credenciales solo GoTrue y URL pública revisada. Requiere
herramienta/servicio, exposición de red y reconfiguración local autorizados; no se ejecuta.
127.0.0.1 es excepción de desarrollo Google en la PC, pero no sirve como callback al
navegador del teléfono. La IP LAN privada no es un redirect permitido por Google.

Fuentes oficiales verificadas15/11:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation
