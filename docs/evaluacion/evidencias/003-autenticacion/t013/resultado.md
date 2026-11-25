# T013 — Registro, confirmación y perfil: integración de presentación

## Cierre documental — 14/11/2026

**T011 y T013 [x]; progreso 13/36.** El usuario acreditó ambos recorridos reales de
registro→Mailpit→confirmación→perfil propio, Web y Android Development, sin observaciones
funcionales. [Evidencia manual y criterios](cierre-manual.md). No es una prueba automática
de Codex. Se reutilizan las verificaciones previas; no se repitieron ni se crearon datos.
Cuentas conservadas. Tipografía manuscrita Android/espaciado irregular registrados como
mejora futura, sin rediseño. T014 y sus escenarios ampliados permanecen pendientes.

## Registro de implementación anterior (histórico)

14/11/2026. Codex, entorno local. **T011 y T013 pendientes; progreso 11/36.**
No se declara ejecutada T014 ni un recorrido funcional real Web/Android de registro.

## Criterio literal y dependencia

T013 integra sign-up-screen.tsx, confirm-email-screen.tsx, rutas públicas del grupo
(auth), su layout y proveedor raíz; carga/error/éxito, perfil pendiente y reintento sin
repetir alta; pruebas de presentación y conservación de rutas públicas 001.
T012 está acreditada. La implementación técnica T011 y sus 17 pruebas originales están
GREEN; su casilla continúa pendiente por la condición expresa de evidencia funcional.
El usuario autorizó integrar T013 para permitir esa comprobación, sin falsear el gate.

## Implementación

- `/sign-up`, `/confirm-email`, `/auth/callback`; acceso desde Bienvenida sin retirar
  `/`, `/technical` ni recuperación de ruta desconocida. No login/cuenta/recovery de tareas futuras.
- Provider de composición raíz: SDK único por montaje, fuera de render/SSR, ciclo de
  vida con dispose y listener removible. Fuente externa observada con useSyncExternalStore.
  Presentación consume únicamente acciones/tipos propios y reutiliza campo/textos/botones/Screen.
- Callback central Web/Android y validadores T011 reutilizados. Web captura y retira
  query/hash; Android recibe URL inicial/eventos. Dedupe del coordinador evita dos canjes.
  Un enlace inválido no muestra un perfil anterior. No se guarda el enlace completo.
- Cuatro campos accesibles, contraseña oculta y vaciada al enviar, bloqueo de doble envío,
  estados comprensibles. Cerrar la vista no borra el verifier ni provoca navegación tardía.
- Perfil existente consultado; ausente sin borrador pide nombre/teléfono propio. Reintento
  conserva los datos pendientes en memoria, consulta/ensure de 002, nunca repite signUp.
  El formulario sigue editable tras error de validación. No roles ni SDK en el núcleo/UI.
- Configuración local derivada de plataforma: Web exige localhost:8081; Android toma
  host LAN de Metro para API54421 y conserva appbarberia://auth/callback. No IP de producción.
  Clave **pública anon** solo en `.env.local` ignorado por Git/EAS, plantilla `.env.example`.
  Producción no tiene fallback local y exige destino HTTPS/configuración propia.

## Verificación ejecutada

[Comandos y códigos](verification.json), logs en esta carpeta:

| Control | Resultado |
| --- | --- |
| RED inicial de archivos ausentes | Salida1 esperada; [registro](red-inicial.log). |
| Regresión formulario tras validación | RED 0 campos/2 esperados, corregida; GREEN con formulario visible. |
| Tipos aplicación y núcleo | 0 ambos. |
| ESLint y formato del alcance | 0 ambos; sin desactivar reglas. |
| Unitarias | 108/108; núcleo100% líneas/funciones,97,23% ramas. No cobertura UI. |
| Integración Auth y presentación afectada/regresiones públicas | 65/65. Dobles/SSR no sustituyen dispositivos/correo real. |
| Arquitectura cliente real | 0;63 módulos,17 núcleo,141 aristas. |
| Metro Development Web y Android, routerRoot=src/app | HTTP200 ambos; módulos y clave pública presentes, comprobados solo como booleanos. No APK. |

[Resultados de Metro](metro-bundles.json), [servicios conservados](services-preserved.json)
y [revisión final](review.json). El HTML Web200 es el contenedor cliente, no una ejecución
del registro en navegador. Tampoco un bundle Android demuestra ejecución en Hermes.

Fallos intermedios conservados como diagnóstico: lint señaló actualización React directa
en effect, Buffer sin import y duplicado de imports; corregidos usando store externo e
imports explícitos. Tipos detectaron inferencia literal `configured:false`, corregida con
tipo explícito. Un loader de prueba no añadía `.ts` a `.native`; se corrigió solo el loader.
Las primeras solicitudes de bundle omitían routerRoot y no representaban estas rutas;
se repitieron con la raíz efectiva. No se confundió HTTP200 con presencia de módulos.

La clave pública nueva no entró en el Metro ya iniciado. Se solicitó autorización concreta
y, tras confirmación inequívoca del usuario, se reinició **solo Metro**: PID46488→58408,
8081, Development/LAN. Los bundles posteriores sí incluyen esa configuración. El manifiesto
no contiene un campo extra de clave: se usa EXPO_PUBLIC, no un duplicado en app.config.js.

## Ajuste Auth local autorizado

GoTrue generaba la confirmación absoluta con127.0.0.1, inaccesible desde Android.
IP Wi-Fi comprobada192.168.0.33. Se cambiaron **solo**:

- API_EXTERNAL_URL → http://192.168.0.33:54421/auth/v1
- GOTRUE_MAILER_URLPATHS_CONFIRMATION → http://192.168.0.33:54421/auth/v1/verify

Operación: `node scripts/local-auth-email-origin.mjs apply http://192.168.0.33:54421`.
La CLI3.1.0 no ofrece recarga local por servicio. El operador recrea exclusivamente Auth
nuevo con misma imagen v2.197.0/dirección interna, sin mounts; conserva las demás variables
por comparación exacta en memoria. El original queda **detenido y desconectado** como
`supabase_auth_app-barberia-002-local_t013_backup` para reversión, no se borró.
No se volcaron Env/credenciales a disco ni a argumentos/logs.

Reversión: `node scripts/local-auth-email-origin.mjs revert`. Solo elimina el reemplazo Auth
sin datos montados y restaura el original; no ejecutar por rutina mientras se valida el flujo.
Si cambia la IP: verificar la IP nueva, revertir y aplicar con el nuevo origen privado54421.
Si el CLI recrea Auth, revisar/reaplicar este ajuste local; no es configuración automática
de producción ni modificación de site_url/redirects en config.toml.

Health200 por loopback/LAN; confirmación obligatoria, site_url localhost8081, allowlist de
redirects, JWT, SMTP y todas las demás variables preservadas. [Inspección final](auth-local.json).
Sin sesión, Auth/user401 y profiles401. REST raíz200 es **OpenAPI**, no acceso a filas:
se conserva la [consulta inicial](auth-local-inicial.json) cuyo supuesto401 para raíz era
incorrecto; se comprobó luego la ruta privada sin debilitar ACL. Functions preflight204
para localhost8081,403 sin ACAO para origen ajeno. Mailpit LAN200.
No se modificó Kong/RLS/Cloud. Los12 contenedores antiguos conservan sus IDs; también
los demás servicios local/reproducción conservan inicio/ID (vector antiguo ya reiniciaba).
SHA-256 del log activo idéntico antes/después. No se crearon cuentas ni enviaron correos aquí.

La URL **configurada** es alcanzable desde la PC. La generación de un correo nuevo,
su apertura desde el teléfono y el retorno funcional siguen pendientes: no se atribuyen a Codex.
La recuperación de contraseña y otras URL de correo se revisarán en su tarea, no se alteraron aquí.

## Pendientes y alcance

Seguir [único recorrido manual preparado](manual.md), Web y enseguida APK Android existente.
No cerrar T011/T013 hasta recibir evidencia real de registro→correo→confirmación→perfil,
con los estados/recuperaciones aplicables. Las tres repeticiones y batería formal de T014
no se ejecutaron. No usuarios remotos, nueva build, instalación, migraciones ni commits.
Riesgos npm históricos (nueve moderados, conteos posteriores variables sin remediación)
y riesgo XSS residual Web siguen documentados; no auditoría de seguridad declarada superada.

Prerrequisitos Spec Kit0, checklist16/16 leído sin cambios. Git main/0ccd33c, sin staging,
commit ni push. diff --check global2 por el log activo heredado; excluyendo únicamente
ese archivo0. Escaneo de patrones sobre fuentes/evidencias del alcance sin hallazgos de
JWT material, secretos, claves privadas o parámetros firmados; no equivale a auditoría integral.

Fuentes consultadas: [Auth API_EXTERNAL_URL y correo](https://github.com/supabase/auth/blob/master/README.md),
[plantillas locales](https://supabase.com/docs/guides/local-development/customizing-email-templates),
[changelog](https://supabase.com/changelog.md); CLI instalada inspeccionada con --help.
Código Expo58 instalado confirma lectura de EXPO_PUBLIC y configuración de manifiesto.
