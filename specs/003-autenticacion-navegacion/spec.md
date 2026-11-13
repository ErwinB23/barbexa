# Feature Specification: Autenticación y navegación por contexto

**Feature Branch**: `main` (sin crear rama; identificador independiente `003-autenticacion-navegacion`)

**Created**: 2026-11-13

**Status**: Aprobada para planificación por el responsable el 2026-11-13. Sin tareas ni implementación.

**Input**: Preparar acceso de usuarios reales a App Barbería, sesión segura y navegación
pública/autenticada con contexto de barbería, reutilizando 001 y 002. Decisiones del
responsable: Google en otra funcionalidad; recuperación de contraseña incluida en 003.

**Decisión de plataformas — 2026-11-13**: Web y Android se desarrollan simultáneamente,
con ligera prioridad Web para ordenar el trabajo, sin reducir la aceptación Android.
Todos los escenarios siguientes se exigen en ambas plataformas salvo las interacciones
específicas indicadas. Ninguna funcionalidad de 003 se cierra si falla en cualquiera de ellas.
Las reglas de autenticación/autorización se comparten cuando corresponda; navegación,
presentación y mecanismos de sesión/enlaces pueden adaptarse por plataforma.

La Constitución 2.0.0 formaliza esta decisión en IV/IX mediante enmienda autorizada el
2026-11-13. Impacto: validación funcional obligatoria en ambas plataformas y trabajo
simultáneo; no cambia arquitectura ni seguridad ni modifica retroactivamente 001/002.
La prioridad Android anterior de AGENTS.md queda subordinada a esa enmienda.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear cuenta y completar el perfil inicial (Priority: P1)

Como persona sin cuenta, quiero registrarme con correo/contraseña, confirmar mi correo
y disponer de mi perfil, sin tener que pertenecer a una barbería.

**Why this priority**: Permite acceso autónomo sin cuentas creadas por un administrador.

**Independent Test**: En navegador y Android, registro y confirmación con identidad sintética autorizada; verificar
perfil propio y estado sin membresías, sin necesitar servicios, reservas o personal.

**Acceptance Scenarios**:

1. **Given** una persona sin sesión, **When** registra correo, contraseña y nombre visible
   válidos, **Then** recibe el resultado de registro y las instrucciones de confirmación;
   no se presume sesión activa antes de que Auth la acredite (FR-001–FR-003).
2. **Given** un correo confirmado y una identidad autenticada, **When** completa el acceso,
   **Then** se aprovisiona el perfil de ese actor mediante el backend existente; una
   repetición no crea otra identidad/perfil ni sobrescribe un perfil previo (FR-004).
3. **Given** Auth válido pero aprovisionamiento fallido por red, **When** pulsa reintentar,
   **Then** se reintenta el perfil para la misma cuenta; no se repite el registro y no
   se presenta una aplicación lista cuando el perfil requerido sigue pendiente.
4. **Given** confirmación pendiente, **When** abre el enlace en el navegador o en Android,
   incluso tras cerrar la vista original, **Then** se valida el retorno correspondiente,
   se resuelve la sesión y se obtiene únicamente su perfil; un enlace inválido ofrece recuperación.

### User Story 2 - Entrar, salir y proteger la navegación (Priority: P1)

Como titular de una cuenta, quiero entrar y salir de forma predecible y acceder solo a
las vistas correspondientes a mi estado de sesión.

**Why this priority**: Es la frontera visible entre visitante y cuenta autenticada.

**Independent Test**: Con una cuenta confirmada existente, probar acceso y cierre sin
necesitar registro nuevo o membresías, en navegador y Android; recorrer enlaces directos,
recarga y Atrás/Adelante del navegador, además de Atrás Android.

**Acceptance Scenarios**:

1. **Given** credenciales correctas, **When** inicia sesión, **Then** obtiene su sesión y
   perfil y entra al área autenticada; un error de credenciales ofrece recuperación
   sin mostrar secretos o revelar innecesariamente la existencia de cuentas (FR-005).
2. **Given** un visitante, **When** abre una ruta protegida directamente, **Then** se
   solicita acceso sin renderizar datos privados. Tras autenticarse, solo se recupera
   un destino interno permitido por sus permisos actuales (FR-010).
3. **Given** una sesión abierta, **When** cierra sesión, **Then** se retiran credenciales
   locales, perfil/contexto y navegación privada; Atrás, reapertura o una respuesta tardía
   no recuperan la sesión cerrada. Sin red, se informa el alcance local del cierre y no
   se promete revocación remota inmediata (FR-008, FR-009).
4. **Given** salida completada, **When** recarga o usa Atrás/Adelante en el navegador,
   o Atrás/reapertura en Android, **Then** no aparecen perfil ni vistas privadas de la
   sesión cerrada; salir de este navegador o instalación no exige cerrar otros dispositivos.

### User Story 3 - Reabrir la aplicación y recuperar la sesión (Priority: P1)

Como usuario, quiero continuar mi sesión al reabrir la aplicación cuando aún sea válida
y recibir una salida clara si expiró, fue revocada o no puede comprobarse por conectividad.

**Why this priority**: Evita accesos incoherentes, pérdida arbitraria de sesión y exposición
durante el arranque o al cambiar de cuenta.

**Independent Test**: Con sesión existente, recargar/cerrar y reabrir el navegador y
volver a la pestaña; en Android, reiniciar y volver del segundo plano. En ambas plataformas
probar estados vigente, renovable, definitivamente inválido y red interrumpida.

**Acceptance Scenarios**:

1. **Given** una sesión previamente guardada, **When** reinicia, **Then** muestra un estado
   explícito de resolución, verifica/restaura la identidad y carga el perfil antes de
   presentar el área lista; no muestra fugazmente datos de otra cuenta (FR-006).
2. **Given** acceso vencido pero sesión renovable, **When** vuelve al primer plano o hace
   una operación protegida, **Then** recupera acceso conforme al proveedor sin duplicar
   cuentas, perfiles o peticiones de acceso concurrentes (FR-007).
3. **Given** fallo temporal de red o rechazo definitivo de sesión, **When** intenta recuperar,
   **Then** distingue reintento por conectividad de nuevo inicio de sesión. Un estado
   local recordado nunca autoriza operaciones ni sustituye la decisión del servidor.
4. **Given** sesión recordada en el navegador, **When** recarga o reabre y recupera foco,
   **Then** aplica la misma resolución segura que Android, adaptada al ciclo del navegador;
   si no puede persistirla, informa el fallo y no declara restauración exitosa.

### User Story 4 - Elegir barbería y navegar según mi membresía (Priority: P1)

Como persona vinculada a varias barberías, quiero identificar en cuál trabajo y ver la
navegación habilitada por mi relación actual, sin asumir un rol global.

**Why this priority**: Lleva el aislamiento de 002 a una experiencia utilizable sin añadir negocio.

**Independent Test**: En navegador y Android, fixtures autorizadas con cero, una y varias membresías;
una identidad administradora en A/barbera en B y una relación inactiva. No crear una UI
de gestión de personal ni probar nuevamente todos los contratos de 002.

**Acceptance Scenarios**:

1. **Given** una cuenta sin membresías activas, **When** accede, **Then** dispone de su
   estado de cuenta y cierre de sesión, con mensaje sin contexto profesional; no crea
   automáticamente una barbería, una membresía o un rol (FR-011).
2. **Given** una membresía activa, **When** se resuelve el contexto, **Then** se selecciona
   esa barbería tras validar su acceso. Con varias activas, se permite elegir y cambiar;
   la barbería activa y su rol se identifican siempre explícitamente (FR-012).
3. **Given** administrador en A y barbero en B, **When** cambia de A a B, **Then** se
   retiran datos/navegación específicos de A y no conserva privilegios de administrador
   en B. Una relación inactiva no se activa, aunque sea propia (FR-013).
4. **Given** contexto guardado cuya membresía fue revocada, **When** se revalida o el
   servidor deniega una operación, **Then** se retira ese contexto, se actualizan las
   opciones y se conserva la cuenta autenticada si su sesión sigue válida (FR-014).

### User Story 5 - Recuperar una contraseña olvidada (Priority: P2)

Como usuario que perdió su contraseña, quiero solicitar recuperación y completar una
nueva contraseña mediante el mecanismo autorizado, sin intervención administrativa.

**Why this priority**: Completa la capacidad de recuperar el acceso por correo/contraseña;
el responsable confirmó su inclusión en 003.

**Independent Test**: Cuenta confirmada existente, solicitud de recuperación y apertura
del enlace tanto en navegador como Android, con enlace válido, vencido, repetido y cancelación.

**Acceptance Scenarios**:

1. **Given** la pantalla pública de recuperación, **When** solicita ayuda con un correo,
   **Then** muestra una respuesta prudente que no confirme cuentas ajenas y ofrece
   reintento controlado ante límites o fallo de entrega (FR-015).
2. **Given** un enlace válido del proveedor, **When** abre la aplicación y guarda una
   contraseña válida, **Then** completa el cambio y vuelve al inicio de sesión; el
   enlace no se usa como atajo a navegación de negocio no autorizada (FR-016).
3. **Given** enlace vencido, inválido, repetido o flujo cancelado, **When** vuelve a la
   aplicación, **Then** recibe una salida segura y puede solicitar otro; no se mantiene
   un estado de recuperación como sesión normal por mera presencia de parámetros.
4. **Given** recuperación iniciada, **When** abre el retorno web por URL o el enlace de
   Android, **Then** completa el flujo correspondiente, incluso si se cerró la vista de
   solicitud; recargar, volver atrás o repetir el enlace no elude su validación ni reutiliza
   una recuperación consumida.

### Edge Cases

- Registro duplicado, correo no confirmado o confirmación abierta tras reiniciar: seguir
  el resultado del proveedor, sin reintentos de alta a ciegas ni cuentas/perfiles duplicados.
- Cambio de cuenta después de cerrar sesión; callbacks o respuestas anteriores tardías:
  no rehidratar identidad, perfil, contexto o historial de la cuenta anterior.
- Sin Internet al arrancar, renovar, cerrar sesión o recuperar contraseña: no borrar por
  error temporal una sesión como si estuviera revocada; no presentar acceso verificado
  ni operaciones pendientes como éxitos. No se promete arranque offline autenticado.
- Contexto inexistente/inactivo; listado vacío; acceso denegado por tenant con sesión válida:
  recuperar selección o estado sin membresía, no convertir todo 403 en cierre de cuenta.
- Enlaces manipulados, externos o repetidos; callback tras salir de la cuenta: no confiar
  en IDs/roles/tokens recibidos como parámetros sin validación de Auth y del destino.
- Varias operaciones y renovación simultánea, bloqueo de almacenamiento local y límites
  de solicitudes del proveedor: error recuperable, sin registros duplicados ni secretos en logs.
- Recarga, cierre/reapertura y Atrás/Adelante del navegador; enlace abierto sin la pestaña
  original; retorno Android con aplicación cerrada o activa: resolver cada ciclo sin fuga
  de datos. Si varias pestañas comparten sesión, una sesión cerrada no puede restaurarse
  desde estado obsoleto de otra pestaña; esto no implica cierre en otros dispositivos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ofrecer registro público por correo/contraseña y nombre visible; el teléfono
  es opcional. Validar datos y mostrar el cumplimiento de la política vigente del proveedor,
  sin inventar límites o roles comerciales nuevos.
- **FR-002**: Mostrar y completar el estado de confirmación de correo requerido para acceso
  normal; no desactivar la confirmación en producción para facilitar registro/pruebas.
- **FR-003**: Separar registro aceptado, confirmación pendiente, sesión válida y perfil listo.
  Evitar múltiples envíos por pulsaciones repetidas y manejar resultados inciertos sin altas ciegas.
- **FR-004**: Aprovisionar el perfil de la identidad verificada reutilizando 002. Reintentar
  solo esa operación ante fallo, conservar el perfil previo y no permitir actor/rol alternativo.
- **FR-005**: Iniciar sesión de cuenta confirmada y dar errores comprensibles sin secretos,
  sin declarar autenticación exitosa por una respuesta incompleta o una clave pública sola.
- **FR-006**: Persistir y restaurar la sesión con protección adecuada a cada plataforma;
  no guardar contraseña y mantener secretos fuera de código, URLs de navegación ordinaria,
  logs/evidencias y almacenamiento público. Cubrir recarga/reapertura del navegador y
  reinicio/reapertura Android. Durante resolución no exponer vistas privadas; informar
  imposibilidad de persistir en vez de simular éxito.
- **FR-007**: Renovar la sesión cuando corresponda y reaccionar a expiración/revocación.
  Distinguir fallos transitorios de rechazo definitivo; coordinar operaciones simultáneas
  sin rehidratar una sesión cerrada o una cuenta anterior.
- **FR-008**: Cerrar la sesión del dispositivo actual retirando credenciales/estado local y
  navegación privada incluso sin Internet. Informar si la revocación remota no fue confirmada;
  no garantizar invalidación inmediata de JWT ni cierre en todos los dispositivos. En Web
  se aplica a la sesión del navegador actual, incluidas pestañas que la compartan; en
  Android, a la instalación actual, sin cerrar obligatoriamente otros navegadores/dispositivos.
- **FR-009**: Aislar perfil, selección de barbería, respuestas en curso y datos recordados
  entre cuentas y entre contextos; descartarlos al salir o cambiar, evitando destellos ajenos.
- **FR-010**: Diferenciar navegación pública, resolución de sesión y área autenticada.
  Proteger enlaces directos, recarga y Atrás/Adelante Web, y Atrás Android; rechazar destinos externos/manipulados y
  recuperar rutas desconocidas. Las guardas de interfaz no sustituyen al servidor.
- **FR-011**: Permitir cuenta autenticada sin pertenencia a barberías, sin crear membresías
  de cliente, roles globales o negocios automáticamente. Ofrecer estado vacío y salida útil.
- **FR-012**: Consultar membresías propias y barberías permitidas con los contratos de 002.
  Una activa se selecciona tras validación; varias permiten elección/cambio explícito.
  Una preferencia recordada se revalida para la misma cuenta, nunca concede permisos.
- **FR-013**: Resolver navegación profesional/administrativa exclusivamente por membresía
  activa y recurso del establecimiento seleccionado. Mostrar rol/contexto actual y no
  mantener permisos profesionales de otro tenant al cambiar.
- **FR-014**: Retirar contextos revocados/inactivos al revalidar y ante denegación definitiva
  del servidor, ofreciendo nueva selección sin eliminar una sesión Auth que siga válida.
  Mostrar carga/error de conectividad hasta poder resolver acceso; no autorizar por caché.
- **FR-015**: Permitir solicitar recuperación de contraseña con respuesta no enumerativa,
  estados de envío/error y reintentos que respeten límites del proveedor.
- **FR-016**: Completar recuperación solo con el mecanismo validado de Auth, soportar
  reinicio/cancelación/enlace inválido y regresar a inicio de sesión tras el cambio. Validar
  retornos Web y Android, incluidos apertura sin vista original, recarga y enlace consumido.
- **FR-017**: Proporcionar carga, vacío, error, éxito y recuperación accesibles en Web y Android:
  controles de al menos 48 × 48 dp en Android y objetivo equivalente en Web, etiquetas/roles,
  texto escalable, scroll y zonas seguras; en Web, teclado, foco visible y orden comprensible.
  Conservar sistema visual y rutas públicas útiles de 001; no atribuir a 003 pruebas manuales antiguas.
- **FR-018**: Mantener dominio/aplicación con tipos propios, adaptadores y composición
  independientes; reutilizar casos/puertos de 002 y encapsular Auth, sesión y navegación.
  Compartir reglas de autenticación/autorización cuando corresponda; adaptar navegación y
  presentación por plataforma con Expo Router, sin duplicar decisiones de permisos.
  No duplicar RPC, aprovisionamiento, membresías o backend; no API Node propia.
- **FR-019**: Definir pruebas reproducibles de usuario final y seguridad que cubran las
  cinco historias y sus fallos, con credenciales públicas y JWT reales para negocio;
  separar fixtures autorizadas, dobles, pruebas de dispositivo y pruebas web. Exigir recorridos
  funcionales reales en navegador y dispositivo o emulador Android contra el backend autorizado:
  registro/confirmación, login/logout, recuperación, restauración/renovación, perfil y navegación
  protegida/contextual. Compilar o aprobar tipos/unitarias no sustituye esas verificaciones.
- **FR-020**: Registrar evidencia y riesgos sin secretos ni aprobaciones ficticias. Desarrollar
  Web y Android simultáneamente con ligera prioridad Web; cualquier fallo de aceptación en
  cualquiera de ellas impide cerrar la funcionalidad afectada y 003. Registrar navegador/versión,
  entorno Android, versión probada y resultados por plataforma. Nueve avisos npm siguen pendientes.

### Key Entities

- **Identidad autenticada**: usuario verificado por Auth, con cuenta/confirmación y método
  de acceso; no incluye un rol global profesional.
- **Sesión de aplicación**: estado en resolución/activa/recuperación/no autenticada o no
  verificable por conectividad; incluye su ciclo de vigencia, sin exponer formatos SDK al núcleo.
- **Perfil propio**: identidad, nombre visible y teléfono opcional; es el perfil ya definido en 002.
- **Membresía y contexto activo**: relación usuario/barbería, rol/estado de 002 y selección
  local revalidada. Seleccionar no crea relación ni representa autorización definitiva.
- **Destino de retorno/recuperación**: intención interna validada; no acepta como autoridad
  una URL arbitraria, un ID o un rol procedentes de parámetros externos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En cada plataforma, tres recorridos consecutivos del registro/confirmación/acceso con identidades
  sintéticas autorizadas, cada cuenta obtiene un solo perfil propio; el reintento de perfil
  no vuelve a registrar la cuenta ni sobrescribe datos existentes (US1; FR-001–FR-005).
- **SC-002**: En ambas plataformas, el 100 % de los casos definidos de acceso directo, Atrás, salida, cambio de
  cuenta y respuesta tardía mantiene cero datos privados de otra identidad y cero entradas
  no autorizadas al área protegida, incluyendo recarga y Atrás/Adelante Web y reapertura
  Android tras logout (US2; FR-008–FR-010).
- **SC-003**: La matriz vigente/renovable/inválida/sin red se ejecuta al arranque y al volver
  del segundo plano Android y al recargar/reabrir/recuperar foco del navegador; cada caso
  llega a su estado esperado sin duplicar cuentas/perfiles
  ni confundir fallo temporal con revocación (US3; FR-006–FR-009).
- **SC-004**: En navegador y Android, con cero/una/varias membresías, roles admin-A/barbero-B e inactiva, todos los
  recorridos de selección/cambio/revalidación preservan el rol por tenant y ninguna
  preferencia guardada concede acceso tras revocación (US4; FR-011–FR-014).
- **SC-005**: Recuperación válida, inválida, vencida, repetida y cancelada se verifican en
  navegador y Android mediante sus enlaces reales: la válida permite nuevo acceso con la nueva clave; las restantes no producen
  acceso normal a partir de parámetros no validados (US5; FR-015–FR-016).
- **SC-006**: El 100 % de los recorridos funcionales de FR-019 queda acreditado en navegador
  y Android con resultados por plataforma. Se verifica teclado/foco y lector de pantalla en
  Web, y Atrás, lector de pantalla y máximo texto en Android, sin recortes que impidan
  completar los flujos. Los pendientes se documentan pero no sustituyen criterios de cierre;
  ningún fallo funcional en una plataforma permite declarar 003 completa (FR-017–FR-020).

## Assumptions

- 001 y 002 son dependencias cerradas con límites documentados; esta especificación no
  cambia sus contratos, RLS/ACL, modelo o arquitectura ni convierte las fixtures en pantallas.
- Correo/contraseña es el método de 003. El responsable confirmó Google para una entrega
  posterior y recuperación dentro de 003. Esto no elimina Google del alcance del SaaS.
- Confirmación de correo se conserva como requisito de producción de la preparación 002;
  no se copian cuentas confirmadas administrativamente del runner a un flujo de registro real.
- La acción Salir corresponde a la instalación Android o sesión del navegador actual.
  Revocación global entre dispositivos,
  MFA, vincular múltiples proveedores, cambiar correo y eliminar cuenta quedan posteriores.
- Decisiones aprobadas: exactamente una membresía activa y autorizada se selecciona
  automáticamente; varias permiten selección/cambio; cero es un estado válido sin permisos
  inventados ni rol global. No implican creación/gestión de barberías.
- No hay acceso offline protegido garantizado: puede existir una preferencia local, pero
  permisos y operaciones se revalidan en servidor. Caché de negocio no se implementa aquí.

### Alcance incluido y excluido

Incluidos: alta/confirmación/acceso/salida, sesión persistida/renovable, recuperación,
bootstrap/reintento de perfil existente, navegación pública/autenticada, estado de cuenta
sin membresías, selección de contexto y entrada mínima identificada por membresía.
Se conservan bienvenida, información técnica y recuperación de rutas desconocidas de 001.

Excluidos: Google en 003, gestión de barberías/personal, invitaciones, catálogo/servicios,
horarios/disponibilidad, reservas, pagos, exploración pública, notificaciones y otros
módulos del SaaS. No crear dashboards de negocio ficticios; las entradas de contexto no
declaran implementadas funciones futuras. El soporte Web y Android de los flujos de 003
es obligatorio; no implica soporte de funcionalidades futuras ni publicación en tiendas.
Ninguna configuración o instalación pertenece a esta fase specify.

### Dependencias y decisiones de preparación, no implementación

Requiere para la etapa posterior un entorno Auth de prueba autorizado y capacidades
de entrega de correo/retorno a la aplicación para confirmación y recuperación. Las
pruebas administrativas de 002 no demostraron entrega real de correo. Proveedor de envío,
redirects, custodia por plataforma, librerías y mecanismos de renovación se investigarán
en plan; no se solicitan credenciales ni se eligen dependencias aquí. Cualquier cambio
Cloud, configuración de correo, datos sintéticos o proveedor requiere su autorización.

Google posterior: hará falta revisar consentimiento/proyecto OAuth, clientes por plataforma,
IDs de aplicación, firma Android, redirects y tratamiento de identidad/cancelación.
Según el flujo elegido, un SDK nativo requiere un build compatible y no se puede suponer
Expo Go. No se elige SDK ni se configura un proveedor en esta especificación.
Fuentes primarias consultadas: [Supabase Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google),
[Expo Google](https://docs.expo.dev/guides/google-authentication/). Decisiones técnicas
concretas y su compatibilidad con SDK 58 se verificarán en la futura planificación.

### Base inspeccionada y límites del reconocimiento

No existe un roadmap numerado 003 aprobado encontrado en docs; la secuencia propuesta
coincide con pendientes de plan 002 y ESTADO-DESARROLLO, no equivale a aprobarla.
Inspección local: src/app/_layout.tsx y sus tres rutas, presentación foundation/UI,
composición tenant-foundation, casos/contratos y adaptador con getAccessToken inyectado,
spec 001 y spec/plan/contratos/validation/cierre de 002. No hay pantalla de acceso,
gestor de sesión persistente, renovación/callback de recuperación o selección de tenant
en esos módulos. Auth usado por fixtures/servidor no constituye UI ni ciclo de sesión cliente.
No se conectó Cloud, no se verificó configuración actual de correo/Google y no se
ejecutaron pruebas funcionales en esta preparación.
