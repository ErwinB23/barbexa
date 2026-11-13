# Contratos de sesión, contexto y navegación — 003

Diseño previo a código. Tipos propios; errores externos y tokens no cruzan a UI/núcleo.
Reutiliza [contratos 002](../../002-fundacion-supabase-multitenant/contracts/backend-foundation.md).

## Puertos y composición

AuthGateway vive en application. Datos de registro incluyen correo/contraseña y nombre/
teléfono de perfil validados; contraseña solo existe durante envío, no estado persistido.

| Operación propia | Semántica |
| --- | --- |
| register(input) | Alta por Auth; resultado confirmation-required o identidad verificada; no asumir sesión por user devuelto. |
| signIn(email,password) | Validar resultado/actor no anónimo; sesión material queda en adaptador; nunca confiar en metadata para roles. |
| restoreAndVerify() | Cargar/renovar con SDK y verificar getUser; ausencia, inválida y red son resultados distintos. |
| subscribe(listener) → unsubscribe | Eventos propios; coordinador los procesa fuera del callback SDK y descarta generaciones viejas. |
| signOutCurrent() | scope local explícito; limpieza local y resultado de revocación confirmada/no confirmada; fallo persistencia explícito. |
| requestRecovery(email,returnTarget) | Respuesta no enumerativa; returnTarget de configuración, no URL arbitraria del formulario. |
| completeCallback(validatedInput) | Canje PKCE único, propósito confirmado por flujo del proveedor; invalidar URL después de captura; error si falta verifier. |
| setRecoveredPassword(password) | Solo recovery validada; actualizar en Auth y cerrar localmente para volver a login. |

Coordinador consume AuthGateway y operaciones existentes getOwnProfile/ensureOwnProfile,
listOwnMemberships/getBarbershop. Contrato de aplicación expuesto al proveedor: snapshot
readonly, acciones register/signIn/signOut/retryProfile/requestRecovery/completeRecovery/
retrySession/selectContext/clearContext y suscripción. No SDK/fetch/window/Request/SecureStore
en domain/application. No exponer acciones de administración existentes en 002 por accidente.

SessionStorage del SDK queda en infraestructura: getItem/setItem/removeItem async, errores
traducidos; versiones Web/native por resolución de plataforma. getAccessToken es enlace
exclusivamente infra/composición para transporte 002, nunca propiedad del snapshot React.
Si recuperación está activa, no entregar token para operaciones ordinarias del cliente.
Esto restringe navegación cliente, no cambia las capacidades de Auth/RLS servidor.

## Superficies remotas reutilizadas

SDK Auth: signUp, signInWithPassword, getSession/getUser, refresh soportado por SDK,
signOut(scope local), resetPasswordForEmail, exchangeCodeForSession, updateUser(password).
Sin llamadas admin en cliente, sin service key. Configuración pública: URL del proyecto
nuevo y clave publicable/anon de compatibilidad; validar destino y no mezclar entornos.
EXPO_PUBLIC nunca contiene contraseña, PAT ni clave de servicio.

Perfil: lectura propia y ensure-profile existente idempotente. Contexto: membresías propias
y barbería con RLS. No usar create-barbershop, rename, editor de personal ni nuevos RPC en 003.
La verificación JWT de Edge y RLS/ACL de 002 permanecen sin modificación.

## Navegación

| URL | Acceso / comportamiento |
| --- | --- |
| / y /technical; desconocida | Conservar rutas públicas 001 y recuperación al inicio. |
| /sign-in, /sign-up, /confirm-email, /forgot-password | Área pública de formularios; ready redirige a cuenta salvo solicitud explícita de salida. |
| /auth/callback | Consumidor único de confirmación PKCE; estado de resolución, sin render privado hasta verificar. |
| /auth/reset-password | Retorno recovery; canje y formulario restringido; inválido permite nuevo envío. |
| /account | Solo ready; perfil propio, contexto actual/ausente, acciones mínimas de contexto y salir. |
| /context | Solo ready; selección/cambio por membresía validada, no panel de gestión. |

Guardas Stack.Protected y providers montados desde composición; no SDK en rutas.
Resolving/profile-required/error y recovery tienen vistas limitadas sin montar cuenta lista.
Tras logout reemplazar destino público; Atrás/Adelante o recarga no restituyen datos.
ReturnIntent solo permite account/context según estado actual, sin origen externo ni
parámetros de rol/usuario. Guardas no sustituyen autorización del servidor.

## Enlaces y almacenamiento por plataforma

Web: origen exacto aprobado + /auth/callback o /auth/reset-password. Desarrollo candidato
http://localhost:8081, confirmar puerto y allowlist antes de configurar; no es origen
Cloud aprobado ni dirección final de publicación. HTTPS obligatorio fuera de loopback.
Android: appbarberia://auth/callback y appbarberia://auth/reset-password con build propio;
parser distingue host/path del custom scheme, no compara ingenuamente con URL Web.
Ambos retornos requieren allowlist Auth y PKCE conservado en el mismo navegador/instalación.
El propósito de la solicitud y el estado restringido posterior al canje se conservan por
sesión/entorno para reinicio seguro; nunca habilitan ready por sí solos. Sin estado
coherente y validación del proveedor, rechazar/reiniciar el flujo.

Validar códigos/errores y propósito antes de consumir. Código repetido, vencido o storage
sin verifier da error recuperable, no login normal. No aceptar fragmentos de tokens ni
guardar URL completa. Dedupe de URL inicial/evento para un solo canje; limpieza y cancelación
eliminan estado transitorio. Cerrar vista original no elimina verifier persistido.

## Traducción y recuperaciones

- Auth inválido 401/403 confirmado por verificador: sesión inválida; network/timeout: reintento.
- FORBIDDEN/NOT_AVAILABLE de tenant: retirar contexto/revalidar; no logout ciego por código HTTP.
- Cero filas de perfil es ausencia, no perfil completo; ensure idempotente solo del actor actual.
- Error CORS no es credencial incorrecta; informar fallo de conexión y registrar diagnóstico sanitizado.
- Registro/recovery: mensajes no enumerativos, límites y reenvío controlado; no crear altas por timeout.
- SDK error a código propio, sin stack, headers, email sensible o body de respuestas en logs.

## Pruebas de contrato

Dobles verifican número de llamadas, eventos/races y denegaciones; no sustituyen JWT,
correo, CORS, storage y enlaces reales. Probar local logout offline/multipestaña, fallo
de storage, recarga/callback duplicado, perfil reintentado, cero/una/varias/inactiva,
admin-A/barber-B y contexto revocado en ambas plataformas. Matriz en validation.md.
