# T009 — Preparación operativa, sin ejecución

## Actualización vigente — operaciones locales autorizadas

Ver [resultado de transporte development y correo SMTP](t009/resultado.md): plugin local
y restricción de origen implementados con regresiones; único correo técnico recibido
en Mailpit, sin usuario Auth. Los bloqueos inferiores de transporte/correo quedan superados
en ese alcance técnico, preservándose su historia. T009 continúa abierta: falta build
autorizado/instalado, scheme real y conectividad desde React Native, no solo Chrome.

## Estado actualizado — avance manual del usuario

13/11/2026. Se conservan pasos históricos inferiores; esta sección sustituye sus pendientes
ya resueltos. Usuario confirmó personalmente:

- Cuenta @erwin23, Free, 0/15 compilaciones Android utilizadas al consultar.
- EAS @erwin23/app-barberia, project ID d428c9e5-0852-43c3-974c-fae3bf286f3e; package
  com.erwin23.appbarberia y scheme appbarberia. Perfil developmentClient/internal creado.
- expo-dev-client instalado y expo install --check correcto.
- Supabase nuevo local reiniciado y API127.0.0.1:54421 accesible; Chrome Android pudo abrir
  http://192.168.0.16:54421/auth/v1/health. LAN actual192.168.0.16, no dirección de producción.
- Redirects Web/Android aprobados presentes en variables efectivas de GoTrue.
- Preflight Origin http://localhost:8081 respondió200 con cabeceras permitidas.
- Mailpit127.0.0.1:54424 accesible y SMTP Auth dirigido a
  supabase_inbucket_app-barberia-002-local:1025; sin envío efectivo acreditado.

Origen de todo lo anterior: comprobación manual proporcionada por usuario; Codex no lo
ejecutó ni consultó dashboards/GoTrue autenticados. No repetirlo como prueba nueva.

### Contraste local ejecutado por Codex

Lectura app.json/eas.json y package/lock: owner/slug/ID/package/scheme coinciden con reporte;
development tiene developmentClient=true, distribution=internal, sin env con IP LAN ni
secretos. `expo config --type public --json` (0) confirma identidad efectiva SDK58. Perfil
ya produce configuración apropiada para APK interno; no necesita añadir buildType redundante,
preview/production no se ejecutarán. CLI declarada >=27.10.0; no EAS global en PATH acreditado
en esta sesión, no eas-cli instalado como dependencia del proyecto. Conservar mecanismo
CLI ya usado por usuario; no instalar global ni descargar herramientas en esta ejecución.

eas.json aparece como agregado con contenido sin staging (intent-to-add); no alterar ese
estado ni hacer commit. Solo se cambian documentos. No archivos de entorno privados leídos
o publicados; resultado completo de Expo config queda en .artifacts ignorado y aquí solo
se registran campos públicos. No .easignore: revisar archivo que subiría EAS conforme
a .gitignore antes de compilar, especialmente logs y configuración local sensible.

### Bloqueo real de conectividad de la aplicación

127.0.0.1 en teléfono es el propio teléfono, no esta PC. El health de Chrome acredita
alcance LAN desde ese navegador, no desde la app ni aceptación por sus adaptadores.
validateAuthTarget y createTenantFoundationHttpAdapter aceptan HTTPS o HTTP solo loopback;
ambos rechazan http://192.168.0.16:54421. No modificar esas validaciones silenciosamente.
Además, permisos/política HTTP de un build Android pueden diferir de Chrome/Expo Go y
deben verificarse, no inferirse del health.

Opción mínima que mantiene validación actual: adb reverse de API54421 con USB y endpoint
http://127.0.0.1:54421 en Android; requiere autorizar platform-tools si falta. Alternativa:
HTTPS local controlado, requiere autorizar túnel/certificado/exposición y configurar su
URL exacta. Aceptar LAN HTTP explícita solo en desarrollo sería otro cambio de seguridad
en ambos adaptadores, con autorización y regresiones, no aprobado ni aplicado aquí.
Primero elegir transporte y revisar posibles ajustes nativos; luego una única compilación.

No fijar IP LAN en app.json, perfil EAS ni URL de producción. Configuración local por
plataforma/entorno ignorada: Web API de esta PC por loopback; Android según transporte
elegido. No montar todavía flujos/callbacks de T010+ para probarlos anticipadamente.

### Lo mínimo que falta para cerrar T009

1. Aprobar transporte y cualquier herramienta/cambio necesario; dejar endpoint de app
   definido y validar su acceso desde build, sin confundirlo con Origin Web8081.
2. Autorizar y ejecutar un único envío técnico a Mailpit, sin cuenta Auth si basta para
   la prueba SMTP; comprobar mensaje recibido. Mailpit UI/SMTP configurados no prueban
   entrega. Flujos de correo Auth completos se validan al implementar sus historias.
3. Revisar antes de upload: proyecto/owner CLI y cuota vigentes, archive sin secretos,
   compatibilidad native del paquete ya instalado y firma/keystore. Ninguno se verifica
   por asumir que el dashboard está iniciado con GitHub. Si se requiere crear/subir
   credencial de firma, explicarlo y autorizarlo antes; no publicar secretos.
4. Con configuración nativa final y autorización explícita para una build, ejecutar en
   PowerShell con CLI previamente disponible/autenticada:

   ```powershell
   eas whoami
   eas project:info
   eas build --platform android --profile development
   ```

   Los dos primeros deben coincidir con owner/ID anteriores antes del tercero; no ejecutados
   aquí. Si falta CLI, concretar versión/mecanismo temporal autorizado antes de descargarla.
   No --auto-submit, perfil production ni comandos globales. Cuenta reportó 15 Android
   disponibles; una build consume recursos/cuota. Reconsultar antes y no cambiar plan ni
   aceptar cargos para continuar si no queda cuota. No hay autorización de gasto.
5. Instalar APK interno, abrirlo con Metro del proyecto (`expo start --dev-client --lan`,
   CLI local existente), y comprobar arranque y apertura de appbarberia:// con app fría
   y caliente. Callback/reset aún sin handlers pueden terminar en no encontrada: eso no
   acredita Auth, solo apertura del scheme. Usar enlace sin tokens; no crear datos.

No se necesita una build por cada cambio JS futuro; agrupar ahora cambios nativos para
evitar recompilar. El cierre requiere correo efectivo, build/scheme y acceso desde app,
no solo JSON válido. T009 permanece [ ]; total8/36, T010+ no ejecutadas.

### Fuentes públicas revisadas

[Perfil EAS](https://docs.expo.dev/build/eas-json/),
[APK interno](https://docs.expo.dev/build-reference/apk/),
[scheme en build propio](https://docs.expo.dev/linking/into-your-app/).
No nueva consulta de cuenta ni prueba de red del proyecto. Sin instalación, build,
correo/usuario, Cloud, contenedores, edición del log activo, commit o push por Codex.

## Registro histórico previo al avance manual

13/11/2026, America/Lima. T001–T008 completadas; T009 abierta. Inicio main/0ccd33c,
cambios locales anteriores y log activo conservados. Solo lecturas y documentación.

## Criterio literal y límites

T009 exige, tras T004/T005–T008, aplicar configuración aprobada de redirects/correo/CORS
y build Android; documentar valores públicos, ignorar configuración secreta; comprobar
destino nuevo, preflight/Origin real, recepción de correo de prueba autorizado y build
que reconoce scheme. No requiere implementar formularios o callbacks de T010+.
La autorización actual cubre preparación, no esas operaciones de escritura/instalación.

## Evidencia confirmada y pendientes

Usuario: cuenta Expo activa, login con GitHub, plan Free, elección EAS Android. Evidencia
manual declarada; Codex no inició sesión ni consultó la cuenta. Cuota/owner/proyecto aún
no comprobados. Login con GitHub no acredita una integración de repositorio para builds.

| Área | Disponible / pendiente real | Dashboard o herramienta/código |
| --- | --- | --- |
| Expo | Cuenta Free confirmada; verificar owner, cuota restante y si existe proyecto correcto | Usuario puede revisar dashboard sin compilar ni vincular GitHub |
| Build | No expo-dev-client, EAS CLI, eas.json ni android.package/extra.eas.projectId locales; scheme appbarberia existe | Requiere instalación/configuración autorizadas; EAS CLI puede usarse temporalmente vía npx con versión fijada, sin instalación global |
| Web desarrollo | http://localhost:8081 aprobado, no URL de producción ni hosting elegido | Verificar puerto/Metro real posteriormente; no cambiar a 127.0.0.1 sin revisar Origin/allowlist, son orígenes distintos |
| Redirects locales | config.toml aún site_url http://127.0.0.1:3000 y additional_redirect_urls https://127.0.0.1:3000 | Ajustar config versionada tras permiso; los valores activos del stack no se consultaron ni reiniciaron hoy |
| Redirects Cloud | Aprobados como diseño localhost:8081/auth/callback, /auth/reset-password y appbarberia://auth/callback, /auth/reset-password; no aplicación acreditada | Usuario puede revisar Auth URL Configuration del proyecto nuevo; añadir valores/Site URL requiere autorización precisa, sin wildcards generales |
| Correo local | Mailpit previsto en configuración 002, puerto 54424; recepción real pendiente | Bandeja puede revisarse manualmente; envío técnico posterior autorizado y verificación sin crear cuenta Auth. No arrancar/reconfigurar contenedores ahora |
| Correo Cloud | Solo buzones de prueba controlados, sin recepción actual acreditada | Revisar ajustes email/SMTP/límites y destinatarios permitidos en dashboard; no configurar proveedor ni pedir contraseñas en chat |
| CORS Edge | Código lee BARBERIA_ALLOWED_ORIGINS y rechaza Origin ajeno | Origin localhost:8081 debe verificarse con OPTIONS real; variable se establece por mecanismo seguro después, sin redesplegar código ni debilitar JWT |
| Android→backend local | EAS no proporciona conectividad al PostgreSQL/API de esta PC | Resolver transporte: opción adb reverse para API54421 con loopback; requiere platform-tools/USB autorizados, no JDK completo. Alternativa HTTPS/túnel tiene exposición/permisos propios; no adoptada |
| Android→Metro/Mailpit | Metro, API y correo son servicios distintos | Verificar red/puertos del build instalado; no asumir que LAN Metro habilita API ni correo. Local primero en ambas plataformas; Cloud posterior en ambas |

Los retornos Auth reales de usuario final se verificarán al implementar las historias.
Para T009 basta acreditar configuración, correo técnico y que build abre el scheme:
no crear callbacks funcionales ni cuentas para simular cumplimiento anticipado.

## Camino mínimo propuesto y permisos separados

1. Usuario revisa manualmente Expo dashboard: owner, proyecto existente o ausencia,
   cuota Android disponible en Free. Sin pulsar Build ni activar integración GitHub.
   Revisar en Supabase nuevo el destino vuoncrtkkkquvddunrxx, URL Configuration y ajustes
   de correo, solo lectura. No modificar antiguo klebvayvsvibwjpkzrff.
2. Autorizar un bloque local de configuración: expo-dev-client compatible SDK58, EAS CLI
   temporal fijada y login local seguro, identificador Android aprobado, vinculación al
   proyecto EAS confirmado, perfil development/internal Android y configuración pública.
   Ninguna clave de servicio en bundle o archivos públicos. Sin lanzar build todavía.
3. Autorizar configuración local Supabase de Site URL/redirects/Origin y mecanismo de
   recarga mínimo del stack nuevo si lo exigiera; evaluar impacto sobre log/proceso Edge
   activo antes de tocarlo. No reinicio genérico ni cambios en contenedores antiguos.
   Aprobar transporte local Android y luego comprobar Web/Android, preflight y correo
   técnico Mailpit; no crear usuarios. Separar cambios Cloud para su autorización propia.
4. Antes de consumir una compilación, revisar conjuntamente SDK, paquetes nativos,
   scheme/identifier/perfil y proyecto. Autorizar una build EAS Android de desarrollo
   concreta solo dentro de cuota disponible, sin upgrades/cargos automáticos. Instalarla
   y verificar arranque/scheme/conectividad, no flujos Auth inexistentes.
5. Validar Cloud posteriormente en proyecto nuevo con autorización de redirects/CORS/
   correo y pruebas concretas; configuración base no equivale a ejecutar registros o
   recuperaciones. No cuentas de prueba sin permiso separado de ejecución/limpieza.

Cambios exclusivamente JS de futuras historias normalmente se prueban con Metro en el
mismo development build; no compilar por cada pantalla. Rebuild solo si cambia contenido
nativo/configuración que lo requiera. Así se evita gastar cuota antes de fijar configuración.

## Riesgos y fuentes

Free no garantiza cuota restante ni ausencia de cobros si se cambia plan/configuración;
ningún costo autorizado hoy. No hace falta publicar en Google Play para esta prueba.
No se afirma soporte de retorno de producción por pruebas anteriores Expo Go.
No se instala SDK Android completo para compilar en EAS por costumbre; transporte puede
necesitar adb. Riesgo XSS de SPA aceptado condicionado a controles, sin protección HttpOnly.
Último audit reutilizado ocho moderados/tres sin dev, frente a referencia nueve/tres;
sin remediación ni auditoría global aprobada. No pruebas de paquetes repetidas aquí.

Documentación oficial consultada: [EAS setup](https://docs.expo.dev/build/setup/),
[precios](https://expo.dev/pricing), [redirects Auth](https://supabase.com/docs/guides/auth/redirect-urls).
No se accedió a dashboards autenticados. Ningún código, configuración, dependencia,
Supabase/contendor o dato remoto modificado; no T010+, commit ni push.
