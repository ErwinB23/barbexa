# Incidencia Auth local — 14/11/2026, posterior a la recuperación

Diagnóstico de solo lectura. No se repitieron pruebas de reservas ni se modificaron
servicios, datos, permisos, Cloud, Metro o el log activo.

- Wi-Fi actual: `192.168.0.16`; la dirección anterior `192.168.0.33` ya no corresponde
  a la interfaz. La petición a la anterior agotó el tiempo de espera.
- API pública `127.0.0.1:54421/auth/v1/health` y
  `192.168.0.16:54421/auth/v1/health`: HTTP503, `name resolution failed`.
- Kong y PostgreSQL del entorno `app-barberia-002-local`: running, misma red nueva.
- GoTrue del mismo entorno: exited255, sin IP activa, no OOM. Logs con rechazo de
  conexión a PostgreSQL y errores fatales de inicialización/migración. No se ejecutaron
  migraciones en este diagnóstico; esos mensajes proceden de los logs de arranque.
- DNS desde Kong: el nombre exacto de GoTrue devuelve NXDOMAIN; acceso directo por
  nombre falla. El contenedor Auth detenido explica esta ausencia de resolución;
  no hay evidencia suficiente para atribuirlo a una avería independiente del DNS de Kong.
- Edge Runtime nuevo también exited255, sin IP. No se inició automáticamente.
- URL pública local efectiva de Auth conserva la IP anterior. Esto requiere revisión
  posterior para los enlaces del teléfono, separada de la recuperación del proceso Auth.
- Configuración actual de Kong legible y ruta functions/v1 presente; búsqueda de
  origins wildcard negativa. No se reaplicó ni modificó el ajuste CORS existente.

Corrección mínima propuesta, pendiente de autorización: iniciar exclusivamente los
contenedores existentes GoTrue y Edge del proyecto nuevo, tras cotejar identidad/red.
No recrear contenedores ni reiniciar Kong inicialmente. Verificar Auth directo y a
través de API pública; solo si persiste DNS obsoleto, proponer recarga aislada de Kong.
Revisar por separado el cambio de URL pública local de Auth a la LAN actual sin cambiar
site_url, redirects, JWT ni Cloud; no se ha autorizado ni ejecutado aquí.

Conjunto T019 conservado, sin limpieza, prepare, reset ni eliminación de volúmenes.
No se consultaron ni modificaron sus filas en ese diagnóstico inicial. En ese momento,
la conexión pública seguía503. T013/T019 permanecen pendientes de sus recorridos UI.

## Reparación posterior autorizada

PostgreSQL disponible mediante pg_isready. El único intento previo de iniciar GoTrue
falló por `Address already in use`: su configuración de conexión solicitaba la IP fija
172.19.0.4, ya ocupada por Studio. No se reiteró ese inicio fallido.

Con autorización específica, se desconectó y reconectó exclusivamente GoTrue a la misma
red `supabase_network_app-barberia-002-local`, conservando alias `auth`, nombre y contenedor.
Se retiró la solicitud de IP fija: Docker asignó dinámicamente 172.19.0.9. Después se hizo
un único intento controlado de inicio, exitoso. Kong resuelve el nombre interno y accede
directamente a /health; Auth público HTTP200 por localhost y 192.168.0.16.

Edge ya estaba running en esta ejecución y no se inició ni reinició; mismo contenedor,
endpoint público sin sesión HTTP401 esperado. Los endpoints/IP de los demás contenedores
de la red permanecieron iguales. No se cambió Kong ni su ajuste CORS, ni se recrearon
contenedores, redes o volúmenes. No hubo SQL ni operaciones de negocio.
[Metadatos](auth-network-repair.json). No equivale a nueva prueba funcional de reservas.

La consulta posterior de conservación verificó3 usuarios/perfiles,2 barberías,2 membresías,
2 profesionales,4 servicios,1 invitación y3 reservas. No se prepararon ni limpiaron datos.
Un primer intento de consulta fue rechazado antes de conectar por faltar las variables
de destino del guard; se repitió solo status con projectId/URL locales explícitos y terminó0.
[Conteos](fixtures-status.json). La consulta de conteos es de solo lectura; no se ejecutó
SQL de modificación ni se repitieron pruebas funcionales.

### Persistencia, prevención y reversión

La conexión actual queda registrada en Docker para el contenedor existente, con IP dinámica
y alias `auth`; los consumidores deben usar DNS, no fijar 172.19.0.9. Esto elimina la
colisión concreta, sin garantizar que Docker nunca pueda sufrir otro fallo tras recuperarse.
Después de una recuperación de Docker, comprobar PG, estado Auth, DNS y /health antes
de repetir recorridos. No restablecer la IP antigua172.19.0.4 mientras siga ocupada por Studio.

La modificación es únicamente de endpoint. Ante necesidad de reversión, requiere una nueva
ventana/autorización: capturar red/alias/asignaciones vigentes, desconectar solo Auth y
reconectarlo a la misma red conservando `--alias auth`, con asignación dinámica o una IP
explícita previamente comprobada libre. Restaurar literalmente la IP original ocupada
reproduciría el fallo y no es una reversión segura. No mover Studio ni recrear la pila.

Pendiente separado: API_EXTERNAL_URL continúa en
`http://192.168.0.33:54421/auth/v1`; la LAN vigente es192.168.0.16.
Los enlaces nuevos para Android necesitan ajustar esa URL local con autorización específica.
No se modificó esa configuración ni site_url/redirects/JWT. T013/T019 siguen pendientes
de validación manual, no bloqueadas ya por la salud pública de Auth.

## Revisión autorizada de URL pública — bloqueada por restricción de recreación

Se confirmó Wi-Fi192.168.0.16 y Auth HTTP200 por localhost y LAN desde la computadora.
El contenedor existente obtiene las URLs del entorno Docker, no tiene montajes de
configuración y arranca mediante `auth`. Su ayuda admite archivos config/config-dir,
pero no está configurado con ellos; no se introdujeron mecanismos alternativos de proceso.
El operador local-auth-email-origin existente sustituye el contenedor y conserva un backup;
no se ejecutó porque esta autorización prohíbe recrear. Docker update no ofrece modificación
de variables de entorno; reiniciar el mismo contenedor conservaría los valores antiguos.

Pendientes exactos: API_EXTERNAL_URL=http://192.168.0.33:54421/auth/v1 y
GOTRUE_MAILER_URLPATHS_CONFIRMATION=http://192.168.0.33:54421/auth/v1/verify.
Cambiar solo ambos hosts a192.168.0.16 requiere revisar y autorizar un reemplazo aislado
de GoTrue; mantener conexión dinámica/alias auth, site_url localhost8081 y allowlist
Web/Android. No se ejecutó reemplazo, recarga ni edición de URLs en esta revisión.
No reutilizar sin revisión el operador antiguo: fija una IP y tiene un backup preexistente.

Metro responde status running en8081. El manifiesto solicitado por localhost anuncia
127.0.0.1:8081; esto depende de la dirección solicitada y no acredita por sí solo qué
conexión tiene abierta el teléfono. No se detuvo ni reconfiguró Metro. No se han realizado
en esta revisión pruebas desde el teléfono, registros, correos ni pruebas de reservas.
La consulta posterior por http://192.168.0.16:8081 devolvió manifiesto200 con
hostUri/debuggerHost192.168.0.16:8081, sin anunciar .33 en esos campos. El teléfono debe
conectarse a esa dirección actual; no hace falta reiniciar Metro por este resultado.

## Decisión vigente del responsable: continuar con cuentas confirmadas

No se autoriza reemplazar GoTrue. Se difiere expresamente el cambio persistente de las
dos URLs de .33 a .16 hasta antes de validar nuevos enlaces Android. Continúa T013/T019
con las tres cuentas existentes confirmadas y las reservas actuales, sin registros,
correos, prepare o limpieza. La revisión del adaptador confirma login por contraseña;
reservas usa token/Edge/RPC y no consume el enlace de confirmación.

Nueva comprobación de solo lectura: Auth200 por127.0.0.1 y192.168.0.16; manifiesto Metro
Android200 anuncia192.168.0.16:8081. No acredita por sí misma ejecución en el teléfono.
Próxima evidencia manual: health desde teléfono y reserva desde el APK conectado a esa
LAN, seguida de lectura del mismo código por el cliente Web. Sin cambios de servicios,
código o configuración. T013/T019 siguen pendientes de evidencia UI real.
