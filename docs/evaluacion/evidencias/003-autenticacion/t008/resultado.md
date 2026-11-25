# T008 — Adaptador y composición mínimos verificados

13/11/2026. Codex implementó T008 después de recibir evidencia manual Android de T007
y retirar la sonda. Sin T009, Cloud, usuarios, contenedores, builds ni instalaciones.

## Alcance implementado

- SupabaseAuthAdapter construye un cliente y observador SDK por composición; PKCE,
  persistSession=true, detectSessionInUrl=false, debug=false, almacén de plataforma y
  clave SDK por entorno/proyecto. La clave aísla también su canal de eventos Web, no
  solo localStorage. Adaptadores T007 mantienen namespace físico propio.
- AuthApplicationSource expone solo snapshot propio y suscripción. Composición traduce
  eventos a resolving/signed-out/recovery, sin promover ready ni fabricar identidad.
  Callback SDK solo invalida estado interno y encola notificación por microtask, sin
  llamar métodos Auth de forma reentrante. Dispose desuscribe y detiene refresh.
- getAccessToken permanece en infraestructura/composición e inyectado al transporte
  createTenantFoundation existente de 002. Snapshot/React no reciben tokens/SDK ni claves
  administrativas. Se exponen solo get/ensureOwnProfile, membresías propias y barbería
  permitida para futuros casos, sin creación/edición de negocio ni administración.
- Recuperación/salida bloquean entrega de token ordinario inmediatamente y descartan
  lecturas en curso por generación. Token local no acredita permisos: el transporte 002
  sigue verificando actor en Auth y servidor/RLS siguen definitivos.
- AuthProvider recibe interfaz ya compuesta y no crea clientes durante render.
  useAuth usa source externo; snapshot servidor siempre público resolving. No montado
  en rutas existentes: la integración de historias es posterior, no pantalla Auth entregada.
- Fachada auth-platform.ts Web y auth-platform.android.ts Android selecciona persistencia
  y runtime explícitos; sin reexportaciones al propio basename del helper. La corrección
  session-storage-core.ts permanece. Se amplía solo límite técnico de clave a 512 para
  sufijos PKCE largos del SDK; namespaces/protección/permisos no cambian.

No se implementaron registro/login/restore/logout funcionales ni canjes/recovery de las
historias; el puerto completo de T006 sigue como contrato para esas tareas. No stubs de
éxito ni mensajes que finjan que el usuario está autenticado. Lifecycle/AppState y refresh
de US3 no se atribuyen a esta base.

## Criptografía: necesidad comprobada, no suposición

Lectura del SDK instalado @supabase/auth-js/src/lib/helpers.ts: generatePKCEVerifier y
generatePKCEFlowId usan global crypto o fallback Math.random; generatePKCEChallenge usa
subtle.digest o desafío plain. Evidencia previa del usuario: expo-crypto genera valores
seguros en Hermes pero globalThis.crypto.getRandomValues no estaba disponible.

Por ello sdk-runtime.native.ts prepara antes de construir SDK un puente limitado con
expo-crypto para getRandomValues y digest SHA-256 si faltan; conserva APIs existentes y
sus receivers, rechaza otros algoritmos, no implementa WebCrypto completo ni usa RNG
inseguro. Si falta TextEncoder o no puede preparar runtime, falla cerrado. Web conserva
WebCrypto y rechaza ausencia de capacidades. Sin paquetes añadidos ni globales de prueba.

Prueba aislada ejecuta los helpers reales instalados del SDK con Math.random que lanza
si se usa: genera verifier y challenge S256 distintos (43 caracteres URL-safe). En esa
prueba el backend expo-crypto es doble con WebCrypto de Node; no se atribuye digest SHA-256
nativo a ejecución Android. Integración PKCE/retornos reales sigue como aceptación de
historias futuras y T009; disponer del puente no acredita login ni recuperación en teléfono.

## Pruebas y códigos ejecutados

RED inicial: siete pruebas fallan por composición ausente, t008-red.log (1). Primer intento
posterior falla por loader de pruebas que interpretaba sufijos .web/.native como extensión
final, t008-first-green.log (1); se corrigió resolver del harness, sin debilitar expectativas.

| Control | Resultado |
| --- | --- |
| TSC cliente --noEmit | 0 |
| TSC tsconfig.core.json --noEmit | 0 |
| Compilación tsconfig.tests.json | 0, sin cambios de configuración |
| node:test solo session-state compilado | 4/4, 0 |
| node:test composition.test.mjs + session-storage.test.mjs | 25/25, 0: 11 composición/SDK/provider + 14 almacenamiento/Metro |
| ESLint archivos nuevos/afectados --max-warnings 0 | 0 |
| Prettier --check archivos nuevos/afectados | 0 |
| Checker real arquitectura | 0, 46 módulos/15 core/88 aristas; sin cambios de reglas |

Cobertura funcional de pruebas: opciones PKCE/persistencia, cliente/observador únicos,
eventos diferidos, cancelación de notificación y token viejo, bloqueo recovery, uso real
del adaptador 002 con HTTP controlado, rechazo de secretos/destinos inseguros, keys de
canales distintas, SSR público, puente cripto y provider sin segundo cliente.
Una prueba usa constructor SDK real con almacenamiento vacío y fetch interceptor: cero
solicitudes, cuentas o datos remotos. Los otros casos usan fixtures locales/dobles, no JWT
de usuarios reales. No cobertura porcentual de UI ni E2E declarada, no batería completa 001/002.

T008 completada dentro de esos criterios. Total 8/36; T009 pendiente y no autorizada.
Última auditoría reutilizada ocho moderados/tres sin dev, sin remediación; no nueva audit.
Evidencias históricas preservadas, sin tokens/credenciales/URLs firmadas en las nuevas.
