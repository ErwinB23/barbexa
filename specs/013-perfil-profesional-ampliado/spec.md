# 013 — Perfil profesional ampliado

**Creado:** 23/11/2026. **Estado:** código y Cloud activados; aceptación manual Web confirmada por el usuario el 24/11/2026. Android final pendiente.
**Rama:** checkout vigente conservado, sin crear rama ni commit.

## Escenarios de usuario y aceptación

### US1 — Editar mi perfil contextual (P1)

Un profesional activo consulta y guarda su nombre, descripción y redes propias.
Prueba independiente: guardar un perfil en A, recargarlo y consultar B; B conserva
sus valores originales y el servidor no permite enviar una identidad ajena.

1. Dada membresía y perfil propios activos, al consultar se cargan datos reales.
2. Dado borrador válido, al guardar se persisten todos los campos juntos.
3. Dado texto de251 caracteres o enlace de plataforma incorrecta, se rechaza sin
   cambiar parcialmente el perfil.
4. Dada membresía inactiva o administrador sin perfil propio, se deniega la operación.

### US2 — Consultar el perfil guardado y recuperarme de errores (P1)

Prueba independiente: editar sin guardar, consultar y simular fallo de guardado.
La vista previa conserva datos guardados y el formulario retiene el borrador.

1. Ante fallo de red, no se anuncia éxito y se puede reintentar.
2. Al cambiar de usuario/barbería, no se muestran respuestas del contexto anterior.
3. Ante backend anterior, nombre sigue disponible y los campos nuevos se muestran
   deshabilitados con explicación; no se simula persistencia.

### US3 — Presentación coherente Web y controles Android (P2)

Prueba independiente: consultar la pestaña Perfil profesional en escritorio y
ventana estrecha; controlar nombre, descripción y redes con el mismo caso de uso.
La tarjeta usa datos guardados y un icono; no inventa fecha ni fotografía.

## Casos límite

Descripción vacía; límite250 con emoji; redes vacías normalizadas aNULL; URL maliciosa;
cuenta sin perfil; autorización revocada; refresco con cambios sin guardar; respuesta
tardía; backend sin nueva capacidad; membresía histórica sin fecha.

## Requisitos funcionales

Solicitud aprobada por el usuario: 23/11/2026. Amplía008; no cambia roles,
reservas, notificaciones ni las otras pestañas profesionales.

Como profesional activo quiero editar mi nombre, descripción (máximo250 caracteres)
y redes opcionales en la barbería seleccionada, y consultar una vista previa del
perfil realmente guardado. Los clientes no recibirán identidades privadas del editor.

- FR01: reutilizar permisos/actor verificado de008; rechazar userId/barberId/role/active
  en comandos. No editar a otro profesional aunque el actor sea administrador.
- FR02: nombre no vacío; descripción≤250 caracteres; redes opcionales≤250,
  usuario sin protocolos o enlace HTTPS de la plataforma correspondiente.
- FR03: guardar nombre y todos los campos nuevos en una sola operación atómica.
  Los comandos antiguos de solo nombre siguen funcionando y no borran detalles.
- FR04: tarjeta contextual real con nombre guardado, barbería, estado y zona Lima.
  La fecha histórica de incorporación no existe actualmente: mostrar sin registro;
  registrar la fecha únicamente para nuevas membresías, sin inventar fechas antiguas.
- FR05: Web responsive a dos columnas y formulario Android funcional compartido;
  lectura, carga, error/recuperación, éxito y borrador conservado ante fallos.
- FR06: vista previa de datos guardados, nunca presentar el borrador como publicado.
  Avatar será icono existente; carga/edición de fotos no está dentro de esta solicitud.
- FR07: soporte real cliente→caso de uso→adaptador→Edge→RPC; sin localStorage ni simulación.
  Backend antiguo conserva edición de nombre; los nuevos campos no deben fingir guardado.

Aplicación de SQL, ensayo real y actualización Edge/Cloud requieren autorización
específica de AGENTS.md. Preparar código/migración y pruebas antes de pedirla.

## Entidades

ProfessionalProfile: proyección propia de profesional más descripción, redes,
nombre de barbería y fecha nullable de membresía. ProfileDraft: solo campos editables.
No sustituye Professional ni añade identidad/permisos editables.

## Criterios de éxito

- SC01: guardar/recargar conserva exactamente nombre, descripción y redes autorizadas.
- SC02: ninguna prueba de identidad o barbería ajena permite cambiar otro perfil.
- SC03: cero pérdida de borrador en fallo recuperable y cero falso éxito.
- SC04: interfaz sin desbordamiento horizontal a ancho móvil y dos columnas amplias.
- SC05: tipos, lint, grafos, pruebas y bundle Web pasan; aceptación final exige SQL
  real y flujos reales Web/Android, pendientes hasta autorización y dispositivo.

## Confirmación de edición

El perfil profesional pertenece a la barbería seleccionada y no reemplaza el nombre
de la cuenta personal. Guardar correctamente muestra en Web un aviso temporal de
éxito; no debe confundirse la vista previa del borrador con datos persistidos.
