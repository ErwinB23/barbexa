# Feature Specification: Fundación técnica de Expo, React Native y Clean Architecture

**Feature Branch**: Sin rama nueva; especificación independiente de la rama Git.

**Created**: 2026-11-10

**Status**: Fundación implementada y verificada; 40/40 tareas acreditadas. Antecedente técnico de las funcionalidades siguientes.

**Input**: Definir una base técnica verificable de App Barbería, SaaS multitenant con prioridad
Android, preservando el proyecto local y Clean Architecture desde el inicio.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar una base local sin perder el trabajo existente (Priority: P1)

Como desarrollador quiero preparar y ejecutar la base en Android conservando las reglas,
especificaciones y documentación del proyecto para continuar el desarrollo con seguridad.

**Why this priority**: Sin una base ejecutable y sin preservar el contexto no se puede avanzar.

**Independent Test**: Comparar los archivos protegidos antes y después de la inicialización
futura y ejecutar el recorrido mínimo en un dispositivo o emulador Android documentado.

**Acceptance Scenarios**:

1. **Given** el Git local existente, **When** se inicialice la aplicación, **Then** se conserva
   el repositorio y el contenido previo de `.agents`, `.specify`, `docs`, `AGENTS.md` y demás
   archivos versionados; cualquier colisión se informa antes de sobrescribir (FR-001).
2. **Given** los prerrequisitos documentados, **When** se siga el procedimiento de inicio,
   **Then** la aplicación abre en Android y muestra una bienvenida identificada como App
   Barbería sin requerir cuenta ni credenciales de backend (FR-002, FR-003).
3. **Given** la bienvenida, **When** se abra la vista técnica secundaria y se pulse Atrás,
   **Then** se regresa a la bienvenida; al reiniciar se abre la ruta inicial (FR-003).

### User Story 2 - Extender funcionalidades con límites comprobables (Priority: P1)

Como desarrollador quiero distinguir reglas, casos de uso, presentación e integraciones para
incorporar funcionalidades sin acoplar el negocio a pantallas o proveedores.

**Why this priority**: La independencia del núcleo es obligatoria desde la primera entrega.

**Independent Test**: Revisar dependencias y probar una operación técnica local del núcleo
con un adaptador sustituible, sin interfaz, red ni base de datos.

**Acceptance Scenarios**:

1. **Given** la base modular, **When** se revise su dependencia de código, **Then** dominio y
   aplicación no importan frameworks, HTTP, SQL, SDK ni tipos generados (FR-004, FR-005).
2. **Given** una operación técnica local que obtiene información pública de la aplicación,
   **When** se sustituya su adaptador por uno de prueba, **Then** el caso de uso funciona sin
   modificar el núcleo ni cargar la interfaz (FR-006, FR-010).
3. **Given** la preparación para backend, **When** se revise el límite cliente-servidor,
   **Then** la composición cliente está identificada y se documenta el futuro punto de
   composición servidor, sin servidores propios ni falsas integraciones activas (FR-007).

### User Story 3 - Revisar presentación accesible y calidad repetible (Priority: P2)

Como responsable de calidad quiero una muestra visual coherente y verificaciones repetibles
para detectar fallos antes de desarrollar pantallas completas de negocio.

**Why this priority**: Establece una base reusable y evidencia inicial de calidad.

**Independent Test**: Inspeccionar la muestra con lector de pantalla y texto ampliado en
Android; ejecutar todos los controles locales y revisar su resultado.

**Acceptance Scenarios**:

1. **Given** las dos vistas técnicas, **When** se revise su presentación, **Then** comparten
   colores, tipografía y espaciados semánticos; el control de navegación y los mensajes
   de estado son reutilizables y no dependen solo del color (FR-008).
2. **Given** TalkBack activo y texto al máximo disponible en el dispositivo Android identificado, **When** se recorra la muestra, **Then** los
   controles tienen nombre y rol, se alcanza todo el contenido sin recortes impeditivos
   y las áreas táctiles son de al menos 48 × 48 unidades lógicas (FR-009).
3. **Given** la base y su entorno documentado, **When** se ejecuten tipos, lint, formato y
   pruebas, **Then** todos pasan; una entrada inválida y un fallo del adaptador tienen
   resultados controlados y cubiertos por pruebas (FR-010, FR-011).

### Edge Cases

- Colisión entre archivos de la plantilla y archivos previos: informar y detener la parte
  afectada sin sobrescritura; comparar inventario y contenido anterior (FR-001).
- Herramientas o dispositivo Android ausentes: identificar prerrequisito y declarar pendiente
  la validación; no sustituir evidencia Android por ejecución web (FR-002, FR-011).
- Credenciales Supabase ausentes o red desconectada tras preparar el entorno: las vistas y
  operación técnica locales siguen disponibles; no hay solicitudes de negocio (FR-007).
- Ruta desconocida: mostrar explicación y acción para volver al inicio, sin pantalla en blanco
  ni cierre inesperado (FR-003).
- Error controlado o texto ampliado: ofrecer texto comprensible y recuperación; respetar zonas
  del sistema y permitir desplazamiento cuando sea necesario (FR-008, FR-009).
- Importación externa que alcanza el núcleo directa o indirectamente: se rechaza en la revisión
  de límites; no basta con que compile (FR-005).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La futura inicialización DEBE integrar Expo en la raíz del Git local existente,
  conservar su historial y archivos previos, e inventariar y comprobar los contenidos protegidos
  antes y después. No se reinicializa Git ni se altera documentación para acomodar una plantilla.
- **FR-002**: La base DEBE usar Expo, React Native y TypeScript estricto, con versiones compatibles
  registradas y procedimiento reproducible de preparación, ejecución y diagnóstico en Android.
- **FR-003**: La navegación DEBE usar Expo Router con bienvenida, vista técnica secundaria,
  retorno Android y recuperación de ruta desconocida. Las rutas solo componen navegación y
  presentación; no contienen reglas ni acceso remoto.
- **FR-004**: La organización DEBE ser modular por funcionalidad con responsabilidades explícitas
  de presentación, aplicación, dominio e infraestructura y dependencias hacia el núcleo.
  Debe respetar las tres capas lógicas aprobadas, sin exigir un despliegue por capa.
- **FR-005**: Dominio y aplicación DEBEN usar tipos propios y permanecer libres de dependencias
  directas o transitivas de React Native, Supabase, HTTP, SQL y tipos generados de persistencia.
  La revisión de límites debe producir evidencia identificando los módulos inspeccionados.
- **FR-006**: La base DEBE demostrar composición explícita de un caso de uso técnico local y un
  adaptador mediante contrato propio sustituible. La operación obtiene información pública
  de la aplicación, sin inventar reglas de reservas ni interfaces sin consumidor concreto.
- **FR-007**: La base DEBE arrancar sin Supabase configurado. Debe documentar la futura separación
  de cliente y servidor, sus composiciones independientes y adaptadores para Auth, Edge Functions,
  PostgREST, PostgreSQL y Storage; no crea API Node.js, rutas API propias ni microservicios.
  No incluye secretos ni atribuye permisos o garantías multitenant a una simulación local.
- **FR-008**: La base DEBE ofrecer tokens semánticos de color, tipografía, espacio y radios,
  y componentes mínimos de texto, acción y mensaje de estado. La muestra técnica debe permitir
  inspeccionar carga, vacío, error con recuperación y éxito, sin simular una operación de negocio.
- **FR-009**: Las vistas DEBEN respetar zonas seguras, ampliación de texto y navegación asistida.
  El texto normal tendrá contraste mínimo 4.5:1, texto grande 3:1 y controles visibles 3:1
  respecto al fondo; los estados deben comunicarse con texto además de color.
- **FR-010**: La base DEBE proporcionar controles repetibles de tipos estrictos, lint, formato
  y pruebas unitarias. Debe cubrir la operación local exitosa, entrada inválida y fallo de
  adaptador, sin cargar interfaz, SDK remoto ni base de datos en pruebas del núcleo.
- **FR-011**: La entrega DEBE registrar fecha, versión del código, entorno, comandos, resultados
  y capturas o grabación del recorrido Android. Debe vincular FR y SC con evidencia y documentar
  límites o verificaciones no aplicables. Las instrucciones de reproducción y el estado compartido
  deben actualizarse durante la implementación autorizada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los archivos previos protegidos conserva su contenido después de preparar
  la base, sin pérdida de historial ni sobrescrituras no autorizadas (US1).
- **SC-002**: Un desarrollador reproduce el inicio desde las instrucciones documentadas en un
  entorno Android identificado y completa tres veces seguidas bienvenida → vista secundaria →
  regreso, además de recuperar una ruta desconocida, sin cierre inesperado (US1).
- **SC-003**: El 100 % de los módulos del núcleo revisados satisface la independencia exigida y
  la operación técnica puede verificarse con dos adaptadores sustituibles, sin cambios al núcleo (US2).
- **SC-004**: Todos los controles de calidad definidos finalizan correctamente y las tres situaciones
  de la operación técnica (éxito, entrada inválida, fallo externo) quedan verificadas (US2, US3).
- **SC-005**: El 100 % de los controles interactivos de la muestra cumple tamaño, identificación y
  contraste exigidos; el recorrido completo es utilizable con lectura asistida y texto al máximo disponible en el dispositivo Android identificado (US3). Para esta fundación se acepta evidencia manual declarada y comprobaciones técnicas/automatizadas; no se exige medición nativa del porcentaje ni se equipara ese máximo al 200 %.
- **SC-006**: Cada requisito y resultado tiene evidencia o estado pendiente explícito; ningún criterio
  de la rúbrica se declara validado por el solo hecho de existir esta especificación (US1–US3).

## Assumptions

Enmienda autorizada por el responsable del proyecto — 11/11/2026: el escenario 2
de US3 y SC-005 sustituyen el umbral exacto 200 % por el máximo disponible en el
Android identificado. Motivo: alcance inicial de la fundación y evidencia de uso
real complementada por pruebas de componentes/contraste. No cambian FR-009,
48×48, contraste, lectura asistida ni arquitectura. El 200 % exacto pasa a validación
futura, no ejecutada. Evidencia y límites: `docs/evaluacion/evidencias/001-fundacion/android-texto-contraste.md`.

- Esta tarea crea solo especificación, checklist y localizador de feature. La inicialización y
  todos los criterios anteriores son obligaciones para una implementación posterior.
- No hay ambigüedades de alcance que impidan planificar. SDK, gestor de paquetes, ejecutor de
  pruebas, mecanismo de control de importaciones y disposición concreta de carpetas se justificarán
  en el plan con compatibilidad verificada; no se fijan por copiar el proyecto anterior.
- La validación mínima requiere un dispositivo o emulador Android identificado; el plan inspeccionará
  su disponibilidad y elegirá el medio de ejecución local. No exige publicar una aplicación.
- La identidad visual inicial es provisional y accesible; no incluye logotipo nuevo, diseño final,
  biblioteca extensa de componentes ni pantallas completas de negocio.
- No se crean entidades persistentes, membresías, autenticación, tablas, RLS, reservas, pagos,
  correo ni almacenamiento. La preparación no demuestra seguridad real del futuro backend.
- Caché, DNS/CDN, CI/CD, integración real, E2E automatizado y carga k6 siguen siendo obligaciones
  del proyecto para entregas posteriores; esta fundación exige un recorrido Android registrado,
  sin imponer aún una herramienta E2E ni infraestructura remota.
- Fuentes locales: [AGENTS.md](../../AGENTS.md), [Constitución v1.0.1](../../.specify/memory/constitution.md)
  y [rúbrica](../../docs/evaluacion/RUBRICA.md). La contribución inicial corresponde a criterios
  1–5 y 7, y al recorrido de aceptación del 6; no valida la integración futura del criterio 5.
  Los criterios 8–16 permanecen pendientes de sus entregas y evidencias correspondientes.
- Propuesta contrastada en copia local en commit `1eb8852388480388f39035641eb87d299def9258`:
  [enfoque](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/02-arquitectura-software/enfoque-arquitectonico.md)
  y [estilo](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/02-arquitectura-software/estilo-arquitectonico.md).
  El repositorio anterior es solo referencia. La demostración `tecnologia/` no es Supabase real.
