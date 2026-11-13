# Sistema multitenant de barberías · App Barbería Constitution

## Core Principles

### I. Cliente-servidor y módulos funcionales

El sistema DEBE conservar tres capas lógicas: presentación, aplicación y negocio, y datos
 y archivos. El código DEBE organizarse por funcionalidad con límites explícitos.
Las capas lógicas no exigen tres despliegues independientes.

### II. Clean Architecture desde el inicio

Cada funcionalidad DEBE aplicar Clean Architecture desde su primera implementación en
cliente y servidor. Presentación e infraestructura DEBEN depender del núcleo. Cada lado
DEBE tener su propio punto de composición para conectar casos de uso y adaptadores.

### III. Núcleo independiente y contratos propios

Dominio y aplicación DEBEN usar tipos y contratos propios sin importar React Native,
Supabase, HTTP, SQL ni tipos generados de persistencia. Los adaptadores DEBEN traducir
formatos y errores externos. PostgreSQL conserva las garantías definitivas que dependen
del estado vigente y la concurrencia; su SQL DEBE verificarse por integración.

### IV. Cliente Web y Android con aceptación conjunta

El cliente DEBE usar Expo, React Native, Expo Router y TypeScript con comprobación estricta.
Las rutas DEBEN limitarse a navegación y composición de presentación. Desde la funcionalidad
003, Web y Android DEBEN desarrollarse simultáneamente, con ligera prioridad de ejecución Web.
Ambas DEBEN superar sus flujos funcionales reales para aceptar cada funcionalidad y su cierre;
un fallo Android NO puede darse por aceptado por funcionar en Web, ni a la inversa.
La lógica de autenticación y autorización DEBE compartirse cuando corresponda; navegación
y presentación pueden adaptarse. iOS solo se declarará soportado tras probar sus flujos.

### V. Backend administrado

El backend DEBE usar Supabase Auth, Edge Functions, PostgREST, PostgreSQL y Storage.
Las operaciones críticas DEBEN pasar por casos de uso de servidor y adaptadores.
NO se crearán una API Node.js propia ni microservicios de negocio. Google para identidad
y Resend para invitaciones DEBEN integrarse mediante adaptadores.

### VI. Aislamiento y autorización contextual

La base y el esquema DEBEN ser compartidos. Los datos de establecimiento DEBEN vincularse
por `barbershop_id` directa o relacionalmente, con RLS y controles de integridad.
Los permisos DEBEN comprobar identidad, propiedad, recurso, asignación y membresía activa
según la operación. Los roles son cliente, barbero y administrador de una barbería;
NO existe un administrador global definido. La entrada de servidor DEBE verificar la sesión;
un identificador recibido en el cuerpo no acredita identidad. SQL privilegiado DEBE verificar
autorización explícita, limitar ejecución y fijar un `search_path` seguro. Los secretos DEBEN
permanecer fuera del cliente, código y reportes.

### VII. Reservas y pagos consistentes

La confirmación DEBE seguir: pantalla → `SolicitarReserva` → `ReservaHttpAdapter` →
Edge Function → `ConfirmarReserva` → `PostgresReservaAdapter` → PostgREST RPC → PostgreSQL.
El cliente DEBE usar `ReservaRemotaGateway`; el servidor, `ReservaAtomicaGateway`.
PostgreSQL DEBE revalidar permisos, políticas, precios y disponibilidad, confirmar o revertir
juntas las escrituras relacionadas y proteger intervalos incompatibles ante concurrencia.
«Cualquier barbero» DEBE terminar en asignación concreta. Las reservas DEBEN conservar
precios, descripciones, duración y políticas históricas relevantes. Efectivo y Yape DEBEN
quedar pendientes hasta confirmación manual única por el barbero asignado con membresía
activa o un administrador autorizado del establecimiento. NO habrá pasarela ni verificación
automática de Yape.

### VIII. Especificaciones y trazabilidad

Cada funcionalidad DEBE partir de requisitos y criterios de aceptación verificables en
Spec Kit, seguidos de plan y tareas. Tareas, implementación y verificaciones DEBEN vincularse
a esos requisitos. Las ambigüedades que cambien permisos, arquitectura o alcance DEBEN
resolverse y documentarse antes de implementar la parte afectada.

### IX. Pruebas según el riesgo y mediciones reales

Los cambios DEBEN incluir pruebas unitarias de reglas y casos de uso e integración de
adaptadores y persistencia según lo afectado. Reservas y permisos DEBEN cubrir aislamiento,
concurrencia, atomicidad e intentos no autorizados. Los flujos críticos entregados DEBEN
tener verificación E2E en Web y Android desde 003, con ligera prioridad de ejecución Web
y aceptación obligatoria de ambas. Las pruebas de escalabilidad y carga con k6
DEBEN definir entorno, volumen y umbrales antes de ejecutarse. La caché DEBE implementarse
para cumplir la rúbrica, seleccionando datos adecuados y verificando invalidación, vigencia,
aislamiento entre barberías y rendimiento. La disponibilidad almacenada en caché nunca
autoriza confirmar reservas: PostgreSQL DEBE revalidarla al confirmar.
Cada tarea DEBE justificar las verificaciones no aplicables; una meta no cuenta como resultado.

### X. Mantenibilidad, accesibilidad y cierre verificable

El código DEBE usar funciones o clases según la responsabilidad y evitar abstracciones sin
necesidad concreta. La interfaz DEBE ofrecer estados de carga, vacío, error y recuperación,
controles accesibles y mensajes independientes del color. Antes de declarar una tarea
terminada se DEBEN ejecutar los controles disponibles de tipos, lint, formato y pruebas
pertinentes, revisar el diff e informar resultados y límites.

### XI. Decisiones y evidencia de evaluación

Las decisiones arquitectónicas DEBEN registrar contexto, justificación y consecuencias.
Cada criterio de la rúbrica DEBE vincularse a requisitos, decisiones y evidencia reproducible con
fecha, versión, entorno, comando y resultado, sin secretos ni datos personales sensibles.
La fuente local de los 16 criterios del ingeniero es `docs/evaluacion/RUBRICA.md`:
13 técnicos y 3 de entrega y sustentación. Las evidencias técnicas previstas DEBEN incluir
configuración de dominio o subdominio, DNS/CDN, implementación de caché, CI/CD y pruebas
de carga con k6. Ningún criterio se declarará validado sin evidencia.

### XII. Contexto compartido vigente

`AGENTS.md` DEBE conservar reglas estables y breves; `ESTADO-DESARROLLO.md` DEBE reflejar
avances verificados, decisiones y pendientes. Ambos DEBEN crearse o actualizarse cuando
la tarea autorice esos archivos y la evolución lo requiera. No sustituyen especificaciones,
ADR ni evidencia de pruebas.

## Fuentes y restricciones

Fuente principal: [propuesta aprobada](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin),
inspeccionada en su copia local limpia en el commit
`1eb8852388480388f39035641eb87d299def9258`. Se contrastaron enfoque Clean Architecture,
restricciones y escenarios de calidad, además de las decisiones revisadas en el reconocimiento.
El repositorio anterior `ErwinB23/barberia-app` es solo referencia: código y skills requieren
evaluación antes de reutilizarse. Ambos repositorios DEBEN preservarse. La carpeta
`tecnologia/` de la propuesta es una simulación educativa.

Reseñas, mapas, proximidad e imágenes forman parte del alcance. Una reseña DEBE exigir
una atención propia completada. El proveedor de mapas sigue pendiente. Storage DEBE guardar
archivos; PostgreSQL, referencias y metadatos. El cliente DEBE transferir archivos mediante
adaptadores y políticas de Storage; el servidor DEBE autorizar asociar, reemplazar y retirar
referencias del negocio. Se DEBE prever recuperación ante fallos parciales: Storage y
PostgreSQL no comparten transacción. Recordatorios y notificaciones son internos; push queda
fuera del alcance inicial. Horarios y precios DEBEN respetar America/Lima y PEN.

## Desarrollo y evidencia

Cada especificación, plan y revisión DEBE comprobar conformidad con esta Constitución y
registrar discrepancias antes de continuar con la parte afectada. Las entregas pueden ser
por etapas sin aplazar arquitectura ni seguridad. Las verificaciones DEBEN distinguir
simulación, integración real y validación de plataforma. Los cambios de esquema y permisos
DEBEN quedar en migraciones versionadas. Commit y push requieren solicitud explícita.

## Governance

Esta Constitución gobierna especificaciones, planes, tareas e implementación del nuevo
proyecto. Las instrucciones explícitas del usuario prevalecen; si alteran una decisión
aprobada, se DEBE registrar el cambio y su impacto antes de implementar la parte afectada.
Una enmienda DEBE explicar motivo, principios afectados, compatibilidad y migración necesaria,
obtener aprobación del usuario y actualizar fecha y versión. El versionado es semántico:
MAJOR para redefiniciones incompatibles o eliminaciones; MINOR para principios o secciones
nuevos o ampliaciones sustanciales; PATCH para aclaraciones sin cambio de obligación.
Cada cierre de tarea DEBE revisar cumplimiento y comunicar excepciones pendientes;
no se aprobarán silenciosamente desviaciones arquitectónicas o de seguridad.

### Enmienda autorizada — 2026-11-13

1.0.1 → 2.0.0: el responsable aprobó sustituir Android primero por desarrollo simultáneo
Web/Android con ligera prioridad Web y cierre condicionado a ambas plataformas. Afecta solo
IV y IX; es MAJOR por redefinir la obligación de orden y aceptación. Conserva los doce
principios, arquitectura, seguridad y alcance de producto. Aplica desde 003, sin invalidar
evidencia histórica de 001/002. No requiere migración de datos ni código; los planes futuros
DEBEN incluir ambas plataformas. Reglas locales anteriores de prioridad Android se interpretan
conforme a esta enmienda hasta su sincronización documental; no autorizan omitir Android.

**Version**: 2.0.0 | **Ratified**: 2026-11-10 | **Last Amended**: 2026-11-13
