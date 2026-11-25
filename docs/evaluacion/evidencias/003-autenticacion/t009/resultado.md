# T009 — Transporte development y correo técnico local

13/11/2026, America/Lima. Rama main, HEAD inicial 0ccd33c. T009 **pendiente**,
avance 8/36. Se conservan evidencias previas y log activo de 002. Las dos operaciones
locales y el plugin/configuración nativa fueron autorizados expresamente por el usuario.

## Transporte implementado y límites

`app.config.js` conserva la configuración recibida de app.json y añade el plugin local
`plugins/with-development-http.js`. Solo APP_VARIANT=development y perfil EAS development
(o ejecución local sin perfil EAS) producen extra.localHttpDevelopment=true. El perfil
development de eas.json fija esa marca; preview/production no la fijan. El plugin establece
usesCleartextTraffic=true solo en development y false en las demás variantes.

Ambos adaptadores, Auth y HTTP de tenant-foundation, conservan HTTPS/loopback existentes.
La excepción LAN exige __DEV__, dirección IPv4 RFC1918, puerto API54421, coincidencia exacta
con developmentHttpOrigin, URL sin credenciales/ruta/query/hash y clave pública. La composición
solo entrega ese origen en Android DEV cuando la configuración del build tiene la marca.
Producción rechaza LAN incluso si recibe el origen por parámetro. No se modificó dominio,
aplicación, autorización del servidor ni validación JWT.

La dirección se inyecta como opción pública `developmentHttpOrigin` a createAuthFoundation,
igual a su baseUrl local, por configuración local ignorada del entorno. No se fija una IP
en app.json/eas.json ni una dirección de producción. Al iniciar Metro para este build usar
`$env:APP_VARIANT='development'` para resolver la misma variante. El montaje de los flujos
Auth sigue siendo posterior: esta tarea prepara transporte/composición, no implementa pantallas.

El permiso nativo de cleartext abarca el build development; el límite de origen lo aplican
los adaptadores de la aplicación. No constituye cifrado ni protección frente a un atacante
en la LAN: usar exclusivamente red confiable y cuentas ficticias cuando se autoricen. No
añadir fetch arbitrario que eluda estos adaptadores. HTTPS sigue siendo necesario fuera del
entorno local. No se añadieron dependencias, polyfills ni credenciales administrativas.

## Verificaciones ejecutadas por Codex

| Comprobación | Resultado real |
| --- | --- |
| `node --test tests/integration/authentication/development-transport.test.mjs` antes de implementar | RED: 3 fallos por funcionalidad/archivos inexistentes; registro transporte-red.log |
| `node --test tests/integration/authentication/*.test.mjs` final | 0, 29/29; transporte-green.log. SDK/storage controlados, no HTTP de negocio real |
| `npx.cmd --no-install tsc --noEmit` | 0 |
| `npx.cmd --no-install tsc -p tsconfig.core.json --noEmit` | 0 |
| ESLint sobre ambos adaptadores, composición/política, app.config.js, plugin y las dos pruebas modificadas | 0, --max-warnings 0 |
| `node scripts/check-architecture.mjs` | 0; 47 módulos, 15 núcleo, 89 aristas |
| Prettier --check de los nueve archivos de configuración/código/pruebas tocados, con ignore vacío local | 0, todos conformes |
| `npx.cmd --no-install expo config --type introspect --json`, variantes development y production | 0 ambas; manifiesto efectivo true/false respectivamente, identidad/scheme conservados |

La primera ejecución GREEN tuvo un fallo del doble de expo-constants por interop default;
se corrigió el doble (__esModule), sin cambiar la política productiva para satisfacerlo.
Las pruebas verifican por separado ambos adaptadores: origen distinto, puerto incorrecto,
host público, ruta/query, DEV falso, plataforma Web y marca ausente; HTTPS permanece permitido.
También prueban el cableado Auth→tenant y preview/production/default sin excepción.
Introspección evalúa mods nativos en memoria; **no** genera ni instala un APK, ni acredita
tráfico real desde Android. No se repitieron baterías de 001/002 ni auditorías npm.

## Único correo autorizado

Identidad verificada por inspección de nombre, imagen y red del nuevo Mailpit v1.31.3:
supabase_inbucket_app-barberia-002-local, red supabase_network_app-barberia-002-local.
Se usó curl ya disponible en supabase_db_app-barberia-002-local mediante docker exec -i,
SMTP interno1025, sin exponer puertos nuevos ni cambiar configuración de contenedores.
From/To: technical-sender@example.invalid y technical-recipient@example.invalid. Un solo
envío, protegido contra repetición mediante estado local ignorado; no se llamó Auth.

SMTP terminó0; búsqueda de asunto técnico único en `/api/v1/search` de Mailpit54424:
HTTP200, exactamente un mensaje recibido. [Metadatos](smtp.json), sin cuerpo ni credenciales.
Marca de tiempo JSON UTC corresponde al13/11 en Lima. No acredita entrega de los flujos
registro/recuperación aún no implementados. No usuarios Auth ni datos de negocio creados.
Se conservó el mensaje técnico en Mailpit como evidencia; no se borró otra correspondencia.
Los12 contenedores antiguos mantienen los mismos IDs/nombres antes/después; no hubo
operaciones sobre ellos ni sobre el entorno temporal de reproducción.

## Preparación EAS y pendientes

Se añadió .easignore conservando exclusiones base y excluyendo docs (incluido log activo),
skills, especificaciones, .env privados, .artifacts, credenciales y keystores. Revisión local
de131 candidatos según esas reglas: siete exclusiones sensibles verificadas, siete archivos
necesarios incluidos, sin coincidencias de claves privadas, JWT completos, claves secretas
Supabase ni URLs firmadas. Es revisión preventiva, no archivo real generado por EAS ni
garantía universal de ausencia de secretos. [Resumen](configuracion-verificada.json).

Identidad local efectiva: @erwin23/app-barberia, d428c9e5-0852-43c3-974c-fae3bf286f3e,
com.erwin23.appbarberia, scheme appbarberia; developmentClient/internal preservados.
Cuenta Free y0/15 son declaraciones previas del usuario, no consulta autenticada actual.
Antes del único build faltan autorización expresa, reconfirmar cuenta/cuota, revisar el
archive efectivo con CLI disponible y decidir/autorizar generación de keystore administrado
por EAS o uso de firma existente. No se consultaron ni generaron claves de firma, no se
instaló EAS CLI, ni se ejecutó build/submit. El build consumirá cuota vigente; no se garantiza
gratuidad futura ni se autorizan cargos/actualización de plan.

Después del build autorizado: instalarlo, comprobar apertura mediante scheme propio y
acceso API desde React Native por LAN, además de Origin/CORS real del Edge requerido por
T009 si la evidencia previa no lo cubre. La prueba Chrome no reemplaza esa verificación.
No cerrar T009 hasta acreditar esos criterios. No T010+, Cloud, migraciones, nuevos usuarios,
commits ni push. Avisos npm pendientes: antecedente nueve moderados; última evidencia ocho
totales/tres sin dev, sin remediación acreditada; no se ejecutó una nueva auditoría aquí.

Fuentes oficiales consultadas: [config plugins Expo](https://docs.expo.dev/config-plugins/plugins/),
[variantes Expo](https://docs.expo.dev/build-reference/variants/) y
[API Mailpit](https://mailpit.axllent.org/docs/api-v1/). Se contrastó la API del plugin con
el Expo58 instalado y su introspección efectiva.

Revisión Git final: global `git diff --check`=2 por whitespace del log activo; excluyendo
únicamente docs/evaluacion/evidencias/002-fundacion/t017-serve.log=0. Staging sin contenido;
se conserva intent-to-add previo de eas.json. Sin commit/push; main/0ccd33c y cambios previos
conservados. No se editó el log ni se operó su proceso.
