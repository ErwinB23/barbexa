# Recuperación — T028–T030, implementación local

## Recuperación real por HTTP/Mailpit — 15/11/2026

Una sola cuenta ficticia nueva confirmada mediante Auth admin local, sin correo de alta ni
perfil/membresía/reserva; contraseña robusta generada con crypto. Credenciales iniciales
solo .artifacts/recovery-local/account.json ignorado. Login previo correcto.
El ejecutor falló inicialmente por queueMicrotask ausente en su VM; lectura posterior:
0 mensajes Mailpit y recovery_sent_at ausente. Se corrigió el ejecutor, se reutilizó
la misma cuenta y se hizo un único envío efectivo; no se creó otra ni se repitió un correo.

[Resultado real](recovery-local-real.json):19 comprobaciones con adaptador de la app y SDK
real. Correo recibido solo en Mailpit, enlace LAN.16/auth/v1/verify con redirect nativo;
GET verify devuelve302/303 al scheme appbarberia://auth/reset-password; parser nativo,
canje PKCE y binding real correctos. Recovery no entrega token al transporte de negocio.
Cambio de clave mediante updateUser/Auth y salida local; login nuevo200/identidad propia,
clave anterior rechazada. Archivo local actualizado únicamente tras verificar login nuevo.
29 reservas misma huella; ningún perfil, membresía o evento de negocio adicional. Solo
se creó/modificó la cuenta dedicada autorizada, sin SQL de contraseña ni proveedores externos.

Esto es ejecución Node por HTTP real con retorno nativo, **no teléfono/Hermes/SecureStore**.
No se abrió el APK ni se ejecutó UI Web. T031/T032 permanecen abiertas para el recorrido
físico final y casos negativos correspondientes. No enviar otro correo por rutina.
La cuenta dedicada se conserva; no limpieza autorizada. Los apartados inferiores son históricos.


## GoTrue local corregido — 15/11/2026

Un único reemplazo reversible autorizado de supabase_auth_app-barberia-002-local,
sin operar PostgreSQL/Edge/Kong/Metro ni datos de negocio. Operador ajustado y probado:
3/3 Node, lint/formato0. API_EXTERNAL_URL=http://192.168.0.16:54421/auth/v1;
CONFIRMATION y RECOVERY=/auth/v1/verify. GoTruev2.197.0 misma imagen/digest, IP172.19.0.2
revalidada primero como propiedad del original y libre después de desconectarlo. Alias
auth preservado. Comparación en memoria/efectiva: resto de configuración y variables
idénticas, incluidos issuer explícito, JWT, SMTP, DB, site_url y redirects.
Auth público HTTP200 por127.0.0.1 y192.168.0.16. Original detenido conservado como
supabase_auth_app-barberia-002-local_recovery_backup; _t013_backup intacto. Sin reversión
necesaria ni segundo intento. Sin correos o cambios de contraseña. T031/T032 siguen
pendientes del recorrido real Web/Android; salud/configuración no equivalen a E2E.
La corrección persiste en el contenedor sustituto; si CLI recrea el stack o cambia la IP,
revisar de nuevo antes de operar, no reaplicar automáticamente.

## Actualización funcional anterior — 15/11/2026

Se detectó en navegador que `history.replaceState` saneaba la dirección, pero Expo Router
podía reponer los parámetros desde su estado inicial. El consumidor PKCE conserva ahora
el estado del historial y publica únicamente la ruta canónica después de capturar el
enlace. Las rutas sincronizan después el estado del router, sin otro canje ni una
redirección decidida por datos externos. Regresiones RED→GREEN de captura y montaje.

Comprobación directa de Codex en navegador local: entrada a `/auth/reset-password` con
parámetro inválido de recuperación, dirección final sin query y mensaje de enlace inválido,
sin campos de contraseña ni acceso privado. No se usó un enlace real ni se cambió una clave.
Bundles completos Web/Android HTTP200; no constituyen validación física Android.

Solo se inició Metro Development/LAN/8081 tras autorización expresa; no se reinició
Supabase. Inspección de GoTrue: la URL pública/confirmación conserva `.33` y la ruta de
correo de recuperación apunta a `127.0.0.1`, inaccesible desde el teléfono. La LAN vigente
es `.16`. Su corrección persistente y el envío/cambio de clave siguen pendientes de
autorización específica, sin recrear servicios en este bloque. T031/T032 siguen abiertas.

La sección inferior conserva la evidencia anterior; su indicación de no operación Metro
corresponde a aquella ejecución, anterior al inicio autorizado registrado arriba.

15/11/2026. Solo código, pruebas con dobles y verificaciones técnicas. **Sin envío de
correo, cambios de clave reales, usuarios nuevos ni operación Cloud/Auth/Docker/Metro.**

T028: pruebas preparadas antes del comportamiento, RED real de integración por métodos
ausentes/parser incompatible; luego GREEN. Unitarias propias verifican validación,
deduplicación, error/reintento, cancelación y respuestas tardías sin bootstrap de perfil.
T029: puertos existentes, coordinador, adaptador SDK y consumidor único de enlaces.
T030: `/forgot-password`, `/auth/reset-password` y acceso desde login; formulario común
Web/Android, labels, foco de contraseña, carga/error/reenvío/cancelación y vuelta a login.
La prueba con primitivas RN dobles no equivale a dispositivo físico.

## Garantías y límites

- Solicitud no enumera cuentas; destino exacto procede de composición, nunca del formulario.
  SDK `resetPasswordForEmail` conserva PKCE. Rate limit/red son errores seguros.
- Canje exige coincidencia entre ruta y `redirectType` del verifier PKCE del SDK. Un
  `type=recovery`, fragmento/token o evento SIGNED_IN aislado nunca habilita negocio.
- SDK2.119 soporta `sb_flow_id`: parser permite exactamente uno validado y lo pasa
  explícitamente al canje. Se limpia la query Web antes de publicar estado; no hay segundo
  consumidor. Un código repetido se deduplica sin conservar URL en React.
- Recovery persiste restringida y ligada a usuario/sesión; el marcador solo no basta.
  `getUser` verifica con Auth; el identificador leído del JWT sirve únicamente como binding
  después de esa verificación, nunca para conceder roles o sustituir al servidor.
- Sin token para operaciones ordinarias en recovery. Solo `updateUser(password)` tras
  revalidación; éxito cierra sesión local y elimina claves propias/verifiers/binding.
  Cancelar limpia también, incluso con revocación remota no confirmada. Error de storage
  es explícito; no se declara salida segura si la limpieza falló.
- La protección cliente no reduce las capacidades del token ante Auth/RLS del servidor.
  No se cambió JWT, políticas ni membresías. Sin garantías frente a XSS; riesgo Web residual
  y nueve avisos npm permanecen.

Dos expectativas antiguas se hicieron más estrictas: una ruta de confirmación con verifier
de recovery se rechaza, y un marcador recovery sin binding verificado falla seguro.
Las nuevas pruebas cubren el caso válido tras reinicio; no se relajaron controles.
También se corrigió el mapeo callback `invalid_grant` a `link-invalid`.

Fuentes consultadas: código instalado `@supabase/auth-js` (`resetPasswordForEmail`,
`_exchangeCodeForSession`, verifier con sufijo recovery y flow-id),
[documentación oficial](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
y [canje PKCE](https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession).
Sin upgrade. Changelog oficial consultado, sin cambio pertinente que requiera instalar.

T031/T032 no se cierran: correo/retorno, enlace vencido/reutilizado/cancelado y nuevo login
deben comprobarse realmente Web→Android. El usuario reservó estas comprobaciones para un
único recorrido final. La URL pública local GoTrue `.33` sigue pendiente de actualización
persistente autorizada a `.16`; no se recreó ni reinició el contenedor. No se envió un enlace
que pudiera fallar en el teléfono. Ver [recorrido final](../../recorrido-integral-final.md).
