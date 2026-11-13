# Investigación y decisiones — 003

2026-11-13. Documentación primaria y metadatos, sin pruebas runtime ni consultas Cloud.

## R1 — SDK administrado

**Decisión**: @supabase/supabase-js 2.119.0 encapsulado, solo Auth. npm view confirmó
Node >=22 y cinco módulos transitivos Supabase 2.119.0. Primera consulta interrumpida por
espera de red; segunda con timeout, código 0, sin instalación. Guía RN oficial usa SDK.
**Alternativas**: REST artesanal requiere implementar rotación/eventos; auth-js directo
reduce módulos pero se prefiere integración oficial documentada. No reemplazar el HTTP de 002.
**Gate**: diff de lock/engines/audit al instalar; metadatos no acreditan ejecución. Nueve
moderados existentes siguen sin remediación. No añadir paquetes de formularios/estado/caché.

## R2 — Persistencia

**Web**: SPA con almacenamiento de origen, clave por proyecto/entorno, sin contraseñas.
Es accesible a JS y vulnerable bajo XSS; no equivalente HttpOnly. HTTPS salvo loopback,
origen dedicado, renderizado seguro, evitar scripts ajenos y verificar CSP en hosting.
Bloqueo/cuota del storage es error explícito. Memoria/sessionStorage no cubren reabrir
navegador; HttpOnly real exigiría backend de sesión fuera de arquitectura actual.

**Android**: SecureStore ~58.0.3, documentación y bundledNativeModules SDK58 coinciden.
Guardar sesión/verifier sin biometría obligatoria ni fallback a AsyncStorage plano.
Payload grande puede fallar nativamente; no asumir límite universal de Expo. Probar
roundtrip real. Si exige fragmentación: fragmentos pequeños solo en SecureStore,
manifiesto versionado publicado al final, límites, lectura completa y limpieza de versiones
anteriores; probar interrupción/fragmento faltante y borrado. Nunca criptografía casera.

## R3 — PKCE y retorno

**Decisión**: flowType pkce, persistSession true, detectSessionInUrl false. Un procesador
consume URL inicial/eventos, valida scheme/origin/path configurados, deduplica y canjea
una vez; limpia parámetros Web con replaceState sin logs. Destino interno permitido
separado del callback, sin open redirect. Cerrar vista original funciona si se conserva
verifier; otro navegador sin él falla seguro y ofrece reiniciar solicitud. No fallback
implicit ni aceptar access_token arbitrario. Canje real es gate de aceptación.
**Alternativas**: detección SDK y parser Router simultáneos arriesgan doble consumo;
servidor de canje nuevo no es necesario.

Recovery: resetPasswordForEmail → canje validado/PASSWORD_RECOVERY → estado restringido
→ updateUser(password) → salida local y login. No creer `type=recovery` suministrado por
URL ni activar perfil/tenant por SIGNED_IN mientras se resuelve el flujo. Flujo desconocido
falla seguro. Coordinar fuera del callback Auth para evitar llamadas reentrantes.
Conservar propósito de la solicitud junto al estado PKCE propio del entorno; tras canje
mantener indicador de recuperación ligado a la sesión actual en el mismo almacenamiento
protegido, para restaurar solo formulario restringido tras recarga. Ese indicador limita
acceso de UI, no otorga identidad ni autoridad; si se pierde o es inconsistente, descartar
el flujo y solicitar recuperación nueva. Probar reinicio antes y después del canje.

## R4 — Ciclo, cierre y carreras

Un SDK por ejecución y locks/renovación soportados por él; Android AppState controla
auto-refresh y limpia listeners; Web coordina pestañas y revalida al foco. getSession
recupera material local; getUser verifica actor antes de ready. Metadata nunca otorga rol.
Callback de eventos traduce/encola, sin esperar nuevas llamadas Auth dentro de él.
Generation descarta respuestas viejas aunque transporte no pueda cancelarse.

signOut explícito scope local, pues default documentado es global. Retirar estado local
primero; verificar comportamiento offline de versión fijada y limpiar solo claves propias
si SDK no completa limpieza. Pestañas compartidas reciben invalidación sin transportar
tokens en mensajes. JWT anterior puede seguir vigente. Fallo de eliminación persistente
es cierre incompleto, no éxito. Nunca repetir registro tras timeout a ciegas.

## R5 — Reutilización e incompatibilidades operativas

createTenantFoundation inyecta getAccessToken y expone get/ensureOwnProfile,
listOwnMemberships y getBarbershop. Mapear FoundationError sin duplicar REST/RPC/Edge.
Su adaptador acepta HTTP solo loopback: Android debe usar HTTPS Cloud autorizado o una
solución local aprobada posteriormente, no relajar validación LAN silenciosamente.
Metro accesible por LAN no acredita acceso al backend.

Handlers Edge rechazan Origin fuera de BARBERIA_ALLOWED_ORIGINS, leída en composición.
Cloud no consultado: CORS/redirects/SMTP son gates Web; ACTIVE no acredita preflight.
Configurar orígenes precisos posteriormente, sin wildcard para simular seguridad.

## R6 — Navegación y plataformas

Stack.Protected para ready/recovery; cuenta sin tenant sigue válida. Reemplazar ruta al
salir y validar destino interno al volver. Hosting debe resolver rutas profundas; Android
scheme appbarberia ya existe pero exige build propio reproducible para probar callbacks.
Expo Go no sustituye esa aceptación. No Google ni expo-auth-session necesarios en 003.

## Fuentes primarias consultadas (2026-11-13)

- [Guía RN](https://supabase.com/docs/guides/auth/quickstarts/react-native): SDK y lifecycle; storage del ejemplo no equivale a garantía de seguridad.
- [Password Auth](https://supabase.com/docs/guides/auth/passwords): confirmación y recuperación.
- [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow): verifier/canje.
- [Redirects](https://supabase.com/docs/guides/auth/redirect-urls) y [enlaces móviles](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
- [signOut](https://supabase.com/docs/reference/javascript/auth-signout) y [eventos](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).
- [Guía avanzada](https://supabase.com/docs/guides/auth/server-side/advanced-guide): límites de persistencia, sin adoptar SSR.
- [SecureStore SDK58](https://docs.expo.dev/versions/latest/sdk/securestore/): cifrado nativo, sin Web y fallos de payload.
- [Protected routes](https://docs.expo.dev/router/advanced/protected/): guardas cliente, no permisos servidor.
- [Changelog](https://supabase.com/changelog.md): revisado; Flutter no aplica y CLI3 ya fijada; sin operación CLI remota prevista.

No ambigüedad funcional pendiente. Gates operativos del plan requieren autorización antes
de cambiar servicios/instalar, no acreditan configuración o pruebas que no se ejecutaron.
