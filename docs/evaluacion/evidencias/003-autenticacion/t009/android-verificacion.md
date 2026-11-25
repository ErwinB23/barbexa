# T009 — Instalación manual y sonda retirada

## Actualización vigente tras prueba del usuario

El usuario ejecutó la sonda en el teléfono Android HONOR con el APK Development real y
reportó desde Metro: health200=true, hostAvailable=true, callbackOpened=true,
callbackReceived=true, resetOpened=true, resetReceived=true. **Evidencia manual del usuario**,
no ejecución automática de Codex. Acredita GET desde React Native y apertura/recepción nativa
de ambos enlaces; no acredita registro, canje PKCE ni recuperación Auth todavía inexistentes.

Se observaron eventos callback repetidos, sin trazas de tiempos o número de pulsaciones
que permitan distinguir aperturas múltiples de entrega duplicada. La sonda registraba
cada evento entrante y cada pulsación; no ejecutaba operaciones Auth. Su listener se
retiraba al desmontar. No hay evidencia suficiente para atribuir una falla ni para afirmar
una causa concreta; no se implementó una deduplicación ficticia para ocultar el reporte.
La idempotencia del canje real pertenece a T010–T011 y continúa sin implementar.

Codex retiró completamente los dos módulos temporales de composición, su prueba asociada
y el import/render de AppProvider. Búsqueda en src/tests sin referencias a la sonda ni
`[T009 Android]`. Se conserva el transporte development, el plugin nativo y los schemes.
Las secciones inferiores describen la preparación histórica, no instrumentación vigente.

### Advertencia corregida, sin nuevas rutas

Se sustituyó únicamente unstable_settings.initialRouteName por anchor:'index' en
src/app/_layout.tsx. El Expo Router58.0.31 instalado, layoutAnchor.js, resuelve
settings.anchor ?? settings.initialRouteName y advierte al usar el nombre anterior.
Una regresión ejecuta el layout actual con el resolvedor real: RED1 por una advertencia,
GREEN1/1 conservando index y cero advertencias. No se afirma una nueva prueba manual
Android/Web después de este cambio. No se modificaron Stack/screens ni parámetros Auth.
Fuente: [configuración oficial de Expo Router](https://docs.expo.dev/router/advanced/router-settings/).

### Único bloqueo restante de T009: Origin del handler local

Para precisar la evidencia genérica previa, Codex ejecutó solo lecturas OPTIONS:

- API local54421, /functions/v1/ensure-profile, Origin http://localhost:8081, método
  solicitado POST y headers authorization,apikey,content-type: HTTP200; Allow-Origin *,
  Allow-Methods genérico. Corresponde a la respuesta automática del gateway, sin acreditar
  la allowlist del handler.
- Entorno nuevo verificado por nombre: supabase_edge_runtime_app-barberia-002-local,
  activo. printenv del único nombre público BARBERIA_ALLOWED_ORIGINS no devolvió valor;
  esto no determina por sí solo las variables que recibe cada worker de functions serve.
- OPTIONS al handler /ensure-profile dentro de la red del proyecto nuevo, mediante curl
  ya disponible en supabase_db_app-barberia-002-local: HTTP403, Vary incluye Origin, sin
  Access-Control-Allow-Origin. El código existente rechaza Origin ajeno antes de OPTIONS
  y de verificar JWT. **No queda acreditado el Origin Web aprobado en el handler actual.**

No JWT, claves, cuerpo, usuarios ni escrituras. La consulta interna distingue gateway y
handler; no cambia ni desactiva JWT, puertos, configuración o políticas. No se leyó ni
editó el log activo y no se reinició ningún proceso/contenedor. El proyecto anterior no
se operó. No se repiten las pruebas Android ya aprobadas.

T009 permanece **[ ]**,8/36. Antes de cerrarla hace falta revisar el mecanismo local
efectivo de BARBERIA_ALLOWED_ORIGINS, habilitar exclusivamente http://localhost:8081 en
el worker nuevo mediante un procedimiento autorizado que preserve el log, y comprobar
preflight/Origin sin debilitar JWT. No se autoriza aquí reiniciar el servicio activo ni
editar su configuración. No hace falta otro APK para ese pendiente local.

### Verificación después de retirar la sonda

`node node_modules/typescript/bin/tsc --noEmit`:0;
`node node_modules/eslint/bin/eslint.js` sobre layout, AppProvider y regresión anchor:0;
Prettier0; arquitectura0 (47 módulos,15 núcleo,89 aristas);
integración de autenticación30/30, incluida regresión anchor y pruebas development sin
excepción en producción. Se reutilizan las pruebas anteriores de tipos del núcleo; no
se repiten baterías generales de 001/002 ni build. Sin dependencias, Cloud o T010+.

Las invocaciones iniciales vía npx de tipos/lint no devolvieron resultado durante la
comprobación; se ejecutaron directamente los binarios locales ya instalados, sin descarga,
para obtener los códigos0 anteriores. Git diff --check global2 por whitespace del log
activo; excluyendo únicamente ese log0. AppProvider coincide de nuevo con su contenido
anterior a la sonda; el único cambio persistente de navegación es anchor. Sin staging,
commit ni push; se conservó intent-to-add previo de eas.json.

Agrupación propuesta, **sin ejecutar** y condicionada al cierre de T009: T010 (RED de
registro) y T012 (campo accesible) en paralelo por archivos distintos; T011 tras T010;
T013 tras T011+T012; T014 al final, con fixtures/correo y limpieza concretamente autorizados,
primero Web y enseguida Android para cada recorrido, no Android relegado al cierre.

13/11/2026, America/Lima. T009 sigue abierta,8/36. No segunda compilación, instalaciones,
Cloud, usuarios ni correo nuevo.

## Confirmado manualmente por el usuario

Primer APK EAS development instalado en su teléfono HONOR; App Barbería abre, conecta
a Metro y carga las pantallas técnicas existentes. El usuario reporta Metro192.168.0.33:8082
y API accesible desde PC/Chrome Android en192.168.0.33:54421. Codex no ejecutó esas pruebas.
Faltan acceso desde el proceso React Native y apertura nativa de ambos enlaces appbarberia.
La IP es circunstancial de LAN, no configuración de producción.

## Instrumentación temporal preparada por Codex

AppProvider añade T009DevelopmentProbe, visible únicamente con __DEV__, Android y marca
localHttpDevelopment. Tres controles compartidos accesibles, sin rutas Auth nuevas:

1. Comprobar API: deriva host privado RFC1918 desde Constants.expoConfig.hostUri (independiente
   del puerto de Metro), valida política development y realiza GET /auth/v1/health en54421.
   Sin API key, sesión, cookies ni cuerpo; timeout8s. Consola `[T009 Android]` solo booleanos
   hostAvailable/health200. No lee ni publica el contenido de la respuesta.
2. Abrir callback: Linking.openURL('appbarberia://auth/callback').
3. Abrir recuperación: Linking.openURL('appbarberia://auth/reset-password').

Linking pasa por el sistema operativo; un listener de eventos entrantes comprueba la URL
exacta recibida y registra callbackReceived/resetReceived. openURL resuelto por sí solo
no prueba recepción ni flujo Auth. No se usa router.push como sustituto. No se registran
URLs entrantes arbitrarias ni parámetros. Resultado esperado: callbackOpened/Received=true
y resetOpened/Received=true. Puede aparecer la ruta desconocida existente: no hay callbacks
Auth implementados todavía y no se deben interpretar como login/recuperación completados.
Si el listener no confirma recepción, registrar el resultado y mantener pendiente.

La sonda se entrega por Metro al APK ya instalado; no cambia configuración nativa ni
requiere otro build. No se ejecuta automáticamente la petición: la inicia el usuario.
Tras recibir la evidencia, retirar ambos archivos temporales t009-* de composición,
el import y render en AppProvider, y la prueba temporal asociada; conservar este registro.

## Puertos: contraste y propuesta estable

La consulta local de solo lectura detectó8081 escuchando, PID51456, node.exe; su línea
de comando coincide con App-Barberia/Expo (sin publicar el comando completo), /status
respondió HTTP200. No se detectó listener8082 en esa instantánea; se conserva el reporte
anterior del usuario sin atribuirle otra fecha/estado. No se detuvo ni inició servidor.

Mantener Web en http://localhost:8081, ya aprobado en site_url/redirects y allowlist CORS.
No cambiar redirects a8082 por un puerto circunstancial de Metro Android. Un Metro de este
proyecto en8081 puede servir Web y Android: reutilizarlo si es la instancia del usuario,
abriendo Web con W. Para fijarlo al reiniciar exclusivamente su propio Metro:

```powershell
$env:APP_VARIANT = 'development'
npx.cmd --no-install expo start --dev-client --lan --port 8081
```

No aceptar automáticamente8082 para Web si8081 está ocupado por otro proyecto: identificar
y coordinar primero; nunca detener un proceso ajeno. Si se mantiene Android temporalmente
en8082, eso no cambia el origen Web de aceptación8081. Los endpoints/API siguen en54421.
La presencia de un servidor en8081 no acredita todavía el recorrido Web del navegador.

## Comprobaciones técnicas acotadas

Prueba temporal t009-device-probe: RED inicial1 por archivo inexistente; después3/3,
salida0. Cubre derivación sin IP fija, rechazo de destinos ajenos, GET sin credenciales,
fallos seguros y las dos URLs exactas en el límite nativo sustituido por un doble.
No es evidencia de Android. tsc --noEmit0; ESLint de4 archivos afectados0; Prettier0;
arquitectura0 (49 módulos,15 núcleo,95 aristas). No se repiten suites previas ni build.
Los resultados reales del dispositivo se añadirán después de la confirmación del usuario.

El preflight Web200 reportado previamente se conserva. Si no acredita específicamente
OPTIONS/Origin del Edge existente, esa precisión seguirá pendiente antes del cierre de
T009: estas sondas Android no prueban CORS del navegador ni sustituyen controles JWT.
