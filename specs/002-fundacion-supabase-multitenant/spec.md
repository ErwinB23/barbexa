# Feature Specification: Fundación Supabase y aislamiento multitenant

**Feature Branch**: `main` (rama real; identificador independiente: `002-fundacion-supabase-multitenant`)

**Created**: 2026-11-11

**Status**: Draft — solo especificación; backend y pruebas aún no implementados

**Input**: Preparación reproducible de un backend nuevo con identidad, perfiles,
barberías, membresías y aislamiento verificable. Decisión del responsable: primer
administrador y membresías controladas de prueba; gestión real de personal posterior.

## User Scenarios & Testing *(mandatory)*

Las cuatro historias son P1: identidad y aislamiento son condiciones mínimas de
esta fundación, no mejoras opcionales. Su orden expresa las dependencias. El
«responsable técnico» prepara entornos; no es un administrador global de la aplicación.

### User Story 1 - Preparar un backend independiente y reproducible (Priority: P1)

Como responsable técnico, quiero preparar un entorno nuevo y repetir su preparación
sin utilizar el backend o los datos anteriores, para obtener resultados verificables.

**Why this priority**: Sin entorno independiente no puede acreditarse el aislamiento.

**Independent Test**: Repetir la preparación en un segundo entorno descartable y
obtener el mismo modelo, permisos y resultados con datos sintéticos.

**Acceptance Scenarios**:

1. **Given** el repositorio existente y la referencia antigua, **When** se prepare el
   nuevo backend, **Then** el destino queda identificado y no se conecta ni escribe
   en el anterior; los archivos previos e historial permanecen preservados (FR-001–FR-003).
2. **Given** migraciones versionadas y configuración documentada, **When** se contrasten
   las comprobaciones SQL/HTTP y de calidad ejecutadas con la guía, **Then** las capacidades,
   resultados y pasos necesarios quedan verificables sin secretos ni revisión externa
   obligatoria (FR-002, FR-016–FR-018).

### User Story 2 - Gestionar únicamente mi perfil personal (Priority: P1)

Como usuario autenticado, quiero consultar y actualizar mi perfil sin que otra
persona lo utilice para leer mis datos, cambiar mi identidad u otorgarse permisos.

**Why this priority**: Identidad confiable y propiedad preceden a los permisos profesionales.

**Independent Test**: Con dos identidades controladas, aprovisionar sus perfiles y
probar lectura/edición propias y rechazo de las ajenas, sin necesitar barberías.

**Acceptance Scenarios**:

1. **Given** una identidad verificada sin perfil, **When** el sistema lo aprovisione,
   **Then** existe un único perfil asociado; repetir el aprovisionamiento no duplica
   ni reasigna la identidad (FR-004–FR-005).
2. **Given** dos usuarios, **When** uno consulte o cambie sus datos básicos, **Then**
   solo accede a su perfil; cambiar el identificador no permite consultar o editar
   el del otro, aunque administre su misma barbería (FR-006–FR-007).
3. **Given** un anónimo, sesión inválida o identidad/rol manipulados en datos enviados,
   **When** intente operar, **Then** no obtiene datos personales ni nuevas capacidades
   por esos valores (FR-007, FR-014–FR-016).

### User Story 3 - Crear una barbería con su primer administrador (Priority: P1)

Como usuario autenticado, quiero registrar mi establecimiento y administrar sus
datos básicos sin recibir autoridad sobre otras barberías.

**Why this priority**: Resuelve la primera membresía sin introducir administración global.

**Independent Test**: Crear una barbería con una identidad controlada y verificar
su primera membresía, lectura/edición propias y denegación desde una identidad ajena.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** registre una barbería con nombre válido,
   **Then** se crean el establecimiento y su primera membresía de administrador activo,
   atribuida al actor verificado, no a una identidad elegida en el cuerpo (FR-008–FR-010).
2. **Given** un fallo al crear esa primera membresía, **When** termine el intento,
   **Then** no queda barbería huérfana ni relación parcial (FR-009).
3. **Given** un administrador activo de A, un barbero de A y un administrador de B,
   **When** intenten modificar A, **Then** solo el administrador activo de A puede;
   administrar B no concede autoridad en A (FR-010–FR-014).

### User Story 4 - Mantener mis permisos separados entre barberías (Priority: P1)

Como participante en varias barberías, quiero que cada acceso dependa de mi
membresía activa y del recurso solicitado, sin mezclar capacidades entre establecimientos.

**Why this priority**: El aislamiento no puede descansar en filtros de una pantalla.

**Independent Test**: Con A/B, identidades y membresías sintéticas, ejecutar la
matriz de permisos y todos los casos negativos definidos en esta especificación.

**Acceptance Scenarios**:

1. **Given** una persona administradora en A y barbera en B, **When** consulte ambos
   establecimientos y modifique su nombre, **Then** puede leer ambos y modificar solo A;
   seleccionar B no transporta su autoridad de A (FR-011–FR-014).
2. **Given** una sesión ordinaria, **When** intente crear o cambiar otras membresías,
   incluido su propio rol, **Then** se deniega incluso si es administradora: la gestión
   real de personal no está incluida en 002 (FR-012–FR-015).
3. **Given** una membresía activa que el responsable de pruebas cambia a inactiva de
   manera controlada, **When** llegue la siguiente operación protegida, **Then** se
   deniega en ese establecimiento sin alterar las capacidades en otro (FR-013–FR-014).
4. **Given** acceso directo a datos o una operación privilegiada, **When** se manipule
   actor, recurso o tenant, **Then** la protección real del servidor impide acceso
   no autorizado; un doble o filtro cliente no acredita ese resultado (FR-014–FR-018).

### Edge Cases

- Identidad válida sin perfil: aprovisionamiento recuperable, sin recursos con propietario inexistente.
- Repetición/concurrencia de una misma asociación: sin duplicados ni referencias incoherentes.
- Nombre de barbería vacío o perfil inválido: rechazo sin mutaciones parciales.
- Usuario compartido con roles distintos en A/B; una única identidad y perfil personal.
- Membresía inactiva con sesión aún válida: sin facultades del tenant; su titular
  puede consultar su propia relación, sin obtener por ello datos privados de la barbería.
- Cliente sin membresía profesional: gestiona su perfil y puede registrar su propia
  barbería, pero no administra otras.
- Identificador, rol o metadata manipulados por el cliente: no sustituyen identidad
  verificada ni membresías vigentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Preparar un proyecto Supabase nuevo e identificado, separado del anterior;
  las operaciones de preparación/prueba no deben conectarse al backend de referencia.
- **FR-002**: Documentar y verificar preparación desde un entorno vacío, con configuración
  y cambios de base versionados, datos sintéticos y pasos repetibles sin depender de
  modificaciones manuales no registradas.
- **FR-003**: Preservar historial, archivos previos y evidencias de 001, y ambos repositorios
  de referencia; registrar incorporaciones y cambios autorizados. No copiar el esquema antiguo entero.
- **FR-004**: Reconocer al actor mediante identidad verificada de Supabase Auth; una identidad
  recibida como dato de una operación no acredita por sí misma al llamador.
- **FR-005**: Proveer un único perfil por identidad existente, aprovisionado por el sistema;
  impedir duplicación, reasignación y creación arbitraria de perfiles ajenos desde el cliente.
- **FR-006**: Permitir al titular autenticado consultar su perfil y modificar nombre visible
  y teléfono opcional. Ser administrador de barbería no permite consultar perfiles personales ajenos.
- **FR-007**: Denegar acceso a perfiles ajenos y cambios de identidad/permisos mediante datos
  personales; no incluir directorio global de usuarios en esta fundación.
- **FR-008**: Permitir registrar una barbería con nombre válido a cualquier usuario autenticado;
  el actor verificado será su primer administrador activo, sin recibir identidad alternativa.
- **FR-009**: Confirmar o revertir conjuntamente barbería y primera membresía, sin registros
  huérfanos ni asociaciones duplicadas ante fallo o aprovisionamiento concurrente de la misma
  relación. No se exige deduplicar negocios por nombre ni limitar a uno los establecimientos por usuario.
- **FR-010**: Permitir consultar los datos básicos de barbería a sus miembros activos y modificar
  su nombre solo a administradores activos de ella. No tratar su identificador como dato editable.
- **FR-011**: Representar membresías por pareja usuario/barbería, rol barbero/administrador y
  estado activo/inactivo, sin duplicar esa pareja. Una persona puede tener relaciones distintas
  con varios establecimientos. Cliente es capacidad del usuario, no rol global ni membresía obligatoria.
- **FR-012**: Permitir al titular consultar sus membresías y al administrador activo listar las
  de su barbería, limitadas a identidad de asociación, usuario, barbería, rol y estado; no exponer
  por esta vía los perfiles personales de otros integrantes.
- **FR-013**: No ofrecer incorporación, promoción o retiro real de personal. La única creación
  ordinaria de membresía es la inicial de FR-008/FR-009. Denegar crear/modificar/borrar otras
  membresías desde sesiones ordinarias, también administradoras. Las variaciones de rol/estado
  se aprovisionan solo como datos controlados de prueba, no mediante una API genérica de negocio.
- **FR-014**: Autorizar por actor verificado, membresía activa, recurso y establecimiento en
  cada operación protegida; sin administrador global. Una membresía inactiva o rol en otro
  establecimiento no otorga acceso privado. El cambio a inactiva en pruebas debe reflejarse
  en la siguiente operación sin depender de refrescar roles de la interfaz.
- **FR-015**: Proteger base/esquema compartidos mediante PostgreSQL y RLS, vinculando recursos
  por barbershop_id directa o relacionalmente cuando corresponda. Rechazar relaciones cruzadas
  inválidas y accesos anónimos a los recursos de esta fundación, incluidos accesos directos
  que eviten filtros de presentación.
- **FR-016**: Encapsular credenciales y operaciones privilegiadas, con autorización explícita,
  ejecución limitada y search_path seguro cuando corresponda. No incluir secretos en cliente,
  código, fixtures publicados, logs o documentos; no trasladar usuarios, contraseñas o tokens antiguos.
- **FR-017**: Aplicar Clean Architecture en cliente y casos de uso de servidor que esta entrega
  necesite: tipos/contratos propios, adaptadores y composición independiente por lado. Entradas
  servidor verifican sesión; PostgreSQL mantiene validación definitiva. Sin API Node ni microservicios.
- **FR-018**: Ejecutar pruebas reales de PostgreSQL/RLS y de las entradas protegidas que existan,
  cubriendo matriz/casos obligatorios; registrar entorno, versión, comandos, resultados y límites.
  Mocks, lectura estática o ejecución que eluda RLS no sustituyen esas comprobaciones.
- **FR-019**: Demostrar los flujos mínimos mediante operaciones y procedimiento reproducible,
  sin exigir pantallas completas de autenticación o negocio; mantener funcionamiento y límites de 001.
- **FR-020**: Mantener trazabilidad de requisitos/resultados/riesgos; no declarar seguridad o
  aislamiento existentes antes de ejecutar sus pruebas ni dar por resueltas las 9 vulnerabilidades
  moderadas npm pendientes del cliente.

### Matriz mínima de autorización observable

Esta tabla limita **002**, no define todavía publicación/descubrimiento de negocios.
Preparar fixtures con privilegios operativos no crea un rol global de la aplicación.

| Operación | Permitido | Denegado |
| --- | --- | --- |
| Aprovisionar perfil | Sistema para identidad existente verificada | Sesión que elija identidad ajena/arbitraria |
| Consultar/editar perfil básico | Titular autenticado | Anónimo y terceros, incluido admin del mismo tenant |
| Registrar barbería/primera membresía | Usuario autenticado para sí mismo | Anónimo, sesión inválida o atribución a tercero |
| Consultar datos de barbería | Miembro activo de ella | No miembro o inactivo, aunque administre otra |
| Modificar nombre de barbería | Administrador activo de ella | Barbero, no autorizado, inactivo o admin ajeno |
| Consultar membresías propias | Titular autenticado, incluidas inactivas | Tercero sin autorización contextual |
| Listar membresías de barbería | Administrador activo de ella | Barbero, no miembro, inactivo o admin ajeno |
| Crear/cambiar/borrar otras membresías | Preparación controlada de fixtures fuera de operaciones ordinarias | Cualquier sesión ordinaria de usuario en 002, incluida admin |

Casos obligatorios: A/B; admin A frente a B; barbero A frente a B; cliente sin
membresía frente a A/B; usuario compartido admin A/barbero B; inactivo; anónimo;
sesión inválida; suplantación por body/metadata; perfil ajeno entre compañeros;
escritura directa de rol/estado; relación de tenant manipulada; fallo parcial de
creación y duplicación concurrente de asociación. Cada caso permitido prueba éxito;
cada denegado prueba ausencia de datos no autorizados y de cambios persistidos.
Claims/identidades controlados del runner no pueden convertirse en una vía de
suplantación para solicitudes ordinarias.

### Key Entities *(include if feature involves data)*

- **Identidad autenticada**: identificador estable verificado; no es un rol global de negocio.
- **Perfil personal**: identidad asociada, nombre visible no vacío tras quitar espacios y teléfono opcional; único por
  persona, sin atributos que concedan permisos.
- **Barbería**: identificador y nombre no vacío tras quitar espacios; unidad independiente de autorización.
- **Membresía**: asociación usuario/barbería, rol y estado; primera administradora creada
  con el establecimiento. No incluye todavía perfil profesional, catálogo o agenda.
- **Datos de prueba**: identidades/relaciones sintéticas; no usuarios migrados ni altas reales de personal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dos preparaciones desde entornos vacíos, una reproduciendo la guía, obtienen
  las mismas capacidades y resultados sin acceder al backend antiguo, perder archivos previos
  ni producir diferencias no autorizadas (US1; FR-001–FR-003).
- **SC-002**: En el 100 % de casos de perfil obligatorios, cada identidad obtiene exactamente
  un perfil propio, modifica solo datos permitidos y no accede a perfiles ajenos (US2; FR-004–FR-007).
- **SC-003**: Cada creación exitosa produce una barbería y su primera membresía activa correcta;
  el 100 % de fallos inducidos deja cero resultados parciales y no altera pertenencias a otros
  establecimientos (US3; FR-008–FR-011).
- **SC-004**: El 100 % de combinaciones de la matriz/casos obligatorios produce el resultado
  esperado en pruebas ejecutadas; cero lecturas no autorizadas, mutaciones ajenas o asociaciones
  incoherentes (US4; FR-012–FR-015, FR-018).
- **SC-005**: Todas las operaciones verificadas conservan al actor real; el 100 % de intentos
  de elevar permisos mediante datos enviados o sesiones no válidas se rechaza sin exponer
  credenciales de servidor (US2–US4; FR-004, FR-014–FR-018).
- **SC-006**: Cada requisito tiene aceptación y evidencia o pendiente explícito. Las migraciones
  versionadas, pruebas SQL/HTTP ejecutadas, controles de calidad y guía de configuración
  permiten verificar los flujos mínimos sin datos del sistema anterior ni pantallas de negocio.
  No requiere reproducción por terceros ni crear un entorno adicional solo para este criterio
  (US1–US4; FR-018–FR-020).

Son metas, **no resultados obtenidos**, ni prueba de seguridad absoluta. Solo
abarcan las capacidades y combinaciones verificadas de esta fundación.

## Assumptions

- **Decisión confirmada del responsable**: primer administrador y membresías controladas
  de prueba; incorporación/promoción/retiro de personal real posterior, sin invitaciones en 002.
- Cualquier usuario autenticado registra su propia barbería y se convierte en primer
  administrador. No se introduce aprobación comercial de altas ni administrador global no
  definidos; revisar este supuesto antes de planificar si aparece una política de aprobación.
- La barbería todavía no tiene publicación o catálogo público. Se verifica acceso privado
  de miembros; la funcionalidad posterior de descubrimiento definirá lectura pública conforme
  a RF06/RF07, sin suponer que esta restricción de 002 sea la política final de producto.
- Se usan identidades sintéticas de Auth para sesiones/perfiles. Registro, Google,
  recuperación y pantallas completas siguen como obligaciones futuras del producto.
- El responsable de entornos tendrá autorización sobre un proyecto nuevo; sus accesos
  operativos se gestionan fuera del cliente. Identificadores reales/secretos se configuran al implementar.

### Dependencies and risks

- Depende de 001 completada y Constitución 1.0.1. Mantiene Expo/React Native/Router/TypeScript
  y Supabase aprobados; no selecciona versiones, estructura SQL, tipos de columna, índices,
  firmas RPC ni políticas SQL ahora. Eso pertenece a planificar y verificar.
- Proyecto nuevo, credenciales y entorno de pruebas 002 aún no existen. Las futuras entradas
  Edge Functions verifican sesión cuando correspondan casos de uso de servidor; no se decide
  aquí un endpoint por entidad ni se presupone que agregar HTTP sustituya RLS.
- ACL/RLS/operaciones privilegiadas mal combinadas podrían permitir acceso alternativo:
  probar directamente el servidor, no solo filtros de interfaz. La referencia anterior no
  es plantilla de arquitectura ni evidencia ejecutada de la nueva base.
- Contribución prevista a rúbrica 1–6: requisitos, diseño posterior e integración/aislamiento.
  Ningún criterio académico queda aprobado por documentos. Caché, DNS/CDN, CI/CD y k6
  permanecen para etapas pertinentes. Las 9 vulnerabilidades moderadas npm siguen pendientes.

### Explicit exclusions

Reservas, concurrencia de agenda, pagos/Yape, servicios/estilos, disponibilidad,
horarios/bloqueos, invitaciones por cualquier canal, correo, notificaciones,
recordatorios/push, gestión real de personal, publicación/descubrimiento, reseñas,
mapas/proximidad, Storage/imágenes, pantallas completas de autenticación/negocio,
administrador global, migración de usuarios/datos antiguos, API Node y microservicios.
La prueba de concurrencia de aprovisionamiento no implementa reservas. Estas
exclusiones no eliminan obligaciones de las funcionalidades posteriores.

### References

- [Constitución](../../.specify/memory/constitution.md), [rúbrica](../../docs/evaluacion/RUBRICA.md).
- [Análisis de referencia](../../docs/arquitectura/analisis-supabase-anterior.md): las 21
  tablas antiguas no son alcance automático; revisar restricciones, ACL/RLS y contexto del actor.
- Propuesta aprobada, commit `1eb8852388480388f39035641eb87d299def9258`:
  [actores y roles contextuales](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/01-analisis-de-sistema/01-actores.md),
  [requisitos RF01–RF05, RF26 y RF41–RF42](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/1eb8852388480388f39035641eb87d299def9258/docs/01-analisis-de-sistema/03-requisitos-funcionales.md).
  Esta entrega aporta fundamentos, no cumplimiento íntegro de esos flujos de negocio.

### Enmienda autorizada de evidencia ? 13/11/2026

El responsable elimina la revisi?n externa obligatoria de SC-006 y US1 escenario 2.
Constituci?n IX?XI y r?brica 4?6/14?16 exigen evidencia y documentaci?n, no ejecuci?n por
terceros. La aceptaci?n usa resultados reales y pendientes expl?citos, sin cambiar permisos,
arquitectura ni pruebas de seguridad. No se crean m?s entornos para SC-006/T035. SC-001
permanece: las dos preparaciones locales ya ejecutadas se documentan con su alcance; no
acreditan Supabase Cloud. La evidencia adicional existente no se borra ni se inventa revisi?n humana.
