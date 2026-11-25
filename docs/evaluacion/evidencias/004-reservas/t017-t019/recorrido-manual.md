# Único recorrido pendiente — T013 y T019

Preparado el14/11/2026; **no ejecutado aún por el usuario**. Solo Supabase LOCAL y APK
Development existente. Web ligeramente primero, Android inmediatamente. No registros,
correos, claves incorrectas, builds, cambios Cloud ni pruebas de concurrencia repetidas.

## Datos y acceso

**Entorno recuperado:** el usuario restableció Docker. Auth200 y Edge nuevo operativo;
solo se inició su contenedor existente tras comprobar su aislamiento. API204/401/403
esperados y3 reservas del conjunto conservadas. El recorrido ya puede realizarse.
No ejecutar prepare otra vez, db reset ni eliminar volúmenes; no tocar el proyecto antiguo.

**Decisión vigente posterior a recuperación:** no reemplazar GoTrue ni actualizar sus
URLs ahora. API_EXTERNAL_URL y URL de confirmación conservan192.168.0.33; pendiente antes
de validar nuevos enlaces Android. Este recorrido usa exclusivamente las tres cuentas
locales ya confirmadas: login con contraseña y reserva no necesitan un nuevo enlace.
No registrar, recuperar contraseña, reenviar correo ni limpiar las reservas actuales.

**Conectividad comprobada desde PC:** Auth200 en localhost y192.168.0.16; manifiesto
Android de Metro200 con hostUri/debuggerHost192.168.0.16:8081. La composición deriva
Supabase http://192.168.0.16:54421 del host de Metro en Development local.
**Pendiente del teléfono:** misma Wi-Fi, abrir en Chrome
http://192.168.0.16:54421/auth/v1/health (esperado200/respuesta de salud). En el APK
Development conectar al servidor http://192.168.0.16:8081 si conserva el anterior y
recargar la app, sin reiniciar Metro. El login y la reserva siguientes acreditarán
la conexión del proceso de la app; Chrome o el bundle por sí solos no la prueban.

Abrir **solo localmente** `.artifacts/004-client/credenciales-locales.json` en el IDE.
Contiene las tres cuentas ficticias autorizadas: `administradorA`, `administradorB`,
`cliente`. No compartir el archivo ni copiar sus contraseñas a mensajes/capturas.
Las barberías son **MVP Local A…** y **MVP Local B…**. No usar cuentas o datos anteriores.

- Web: `http://localhost:8081/account`, `/barbershop-admin`, `/staff`, `/services`,
  `/schedules`, `/booking`, `/my-reservations`.
- Android: abrir App Barbería **APK Development**, recargar el Metro actual y usar
  «Mi cuenta → Reservar una cita» / «Oferta, personal e invitaciones».
  No usar localhost de la PC desde el teléfono; la aplicación obtiene la LAN de Metro.
- Fecha sencilla: **2026-11-15**, si sigue siendo futura; si no, otra fecha futura dentro
  de14 días. Profesionales configurados09:00–18:00, hora de Lima.
- Corte local25 soles/30min + Barba local10 soles/15min = **estimado35 soles/45min**.
  El total confirmado y el profesional definitivo siempre los devuelve el servidor.
- Hay **tres citas automáticas** en2026-11-17. Son del conjunto autorizado; no recrearlas.

## Primero la reserva real

1. **Web normal, administradorA**: abrir Mi cuenta→Oferta. La barbería A se selecciona
   automáticamente (una membresía). Confirmar que está publicada; si está pausada,
   pulsar «Publicar barbería». No pulsar «Crear barbería»: las dos ya existen.
2. **Web en ventana privada, cliente**: usar esa cuenta ficticia y abrir `/booking`.
   Elegir **MVP Local A**, Corte y Barba, **Profesional local A**, fecha futura y un horario
   disponible. Pulsar confirmar una vez. Esperado: «Tu reserva está confirmada», profesional
   concreto, hora Lima, total35/duración45 y código de cita. Abrir Mis reservas: el detalle
   está persistido y pertenece al cliente. No hace falta manipular red/doble envío: ya
   fueron comprobados con HTTP real y la misma clave de solicitud.
3. **Inmediatamente Android, cliente**: entrar con la misma cuenta ficticia, abrir
   Reservar una cita y repetir A/dos servicios/profesional A/fecha futura, **otro horario
   que aparezca disponible**. Confirmar y abrir Mis reservas. Esperado: segundo código
   distinto; aparecen ambas citas nuevas, además de las tres automáticas.
   Actualizar Mis reservas en la ventana Web del cliente: aparece la cita Android con
   el mismo código/hora/total. **Esto es lectura del cliente en Web, todavía no agenda admin**.

## Después, completar la evidencia de oferta

4. **Web, administradorA**: guardar la configuración existente sin cambiar los límites;
   elegir Corte local y guardar sus valores existentes. En Personal, Mis invitaciones
   propias está vacío (estado válido); el perfil profesional A está activo explícitamente.
   Intentar desactivarlo: debe aparecer error recuperable por citas comprometidas y el
   perfil debe seguir activo. «Reintentar consulta» recupera la vista. Pausar/publicar A.
   En Horarios, elegir local y profesional A para comprobar/guardar los intervalos existentes,
   sin quitarlos. No crear más servicios o profesionales ni cuentas.
5. **Web privada, administradorB**: cambiar desde cliente a esa cuenta ficticia.
   Antes de aceptar, Tus barberías contiene solo B; A no concede administración por la
   invitación pendiente. En Personal, **rechazar** la invitación pendiente de A.
   Volver a la ventana normal de administradorA e invitar otra vez al correo ficticio
   exacto de administradorB, tomado del archivo local. Es invitación interna: no envía correo.
6. **Inmediatamente Android, administradorB**: abrir Personal y **aceptar la nueva
   invitación pendiente de A**. Actualizar Tus barberías: A=Barbero, B=Administrador.
   Elegir A: no aparecen formularios administrativos habilitados; elegir B sí permite
   su propia administración. La invitación aceptada no crea automáticamente perfil/horario.
7. **Android, administradorA**: revisar A y guardar configuración/servicio/horarios existentes;
   pausar/publicar A. Personal muestra el profesional A explícito. Repetir solamente el
   rechazo de desactivación por citas comprometidas y la recuperación de consulta; comprobar
   el estado vacío de invitaciones propias y que campos/botones pueden usarse sin recortes.
   No repetir registros, correos, batería de login ni mediciones de200%.

## Respuesta necesaria y conservación

Confirmar sin credenciales: **reserva Web (paso2), reserva Android (paso3), oferta Web
(pasos4–5), oferta Android (pasos6–7)**: correcto o incidencia concreta. Indicar también
si **terminaste** el recorrido. No atribuirlo a Codex: será evidencia manual del usuario.

Se conservan los registros, sin limpieza automática. Por la decisión vigente del usuario
no se limpiarán las reservas actuales al recibir el recorrido; se documentarán los resultados
y se mantendrá el conjunto para avanzar hacia la agenda. Cualquier limpieza posterior se
revisará con el usuario y cotejará IDs/dependencias; no crear otro conjunto por costumbre.
