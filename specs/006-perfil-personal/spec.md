# Feature Specification: Edición del perfil personal

**Identificador**: `006-perfil-personal` · **Fecha**: 2026-11-15
**Estado**: implementada; aceptación manual Web de todos los perfiles confirmada por el usuario el 24/11/2026. SC-003 conserva su componente Android pendiente.
**Fuente**: RF05/HU04 de la propuesta aprobada, revisión `1eb8852388480388f39035641eb87d299def9258`.
**Input**: completar funcionalidades comprometidas sin nuevos permisos de servicios o datos.

## User Scenarios & Testing

### US1 — Editar mis datos (P1)

Como usuario autenticado quiero consultar y modificar mi nombre y teléfono desde Mi cuenta.
Esta entrega completa la interfaz pendiente del contrato de perfiles de002; no es el editor
del perfil profesional RF21/HU14, ni modifica correo, contraseña, membresías o permisos.

**Independent Test**: editar nombre/teléfono y eliminar el teléfono; comprobar que la cuenta
refleja la respuesta persistida, conservando sesión, barbería y rol contextual.

**Acceptance Scenarios**:

1. Dada una sesión verificada, al guardar datos válidos se muestra la respuesta del servidor
   y el mismo perfil al consultarlo de nuevo. Cancelar no envía cambios.
2. Dado un nombre vacío o campos de identidad/permisos añadidos, se rechaza antes del envío.
3. Dado un envío pendiente, pulsar de nuevo no duplica la actualización; los campos y guardar
   quedan desactivados. Un error de red permite reintentar sin perder la edición.
4. Si ocurre logout, revocación o cambio de cuenta durante el envío, la respuesta tardía no
   restaura la sesión anterior ni muestra sus datos. La edición no concede permisos.
5. El mismo flujo es accesible en Web y Android con los controles existentes, sin rediseño.

### Edge Cases

Teléfono vacío se representa como null; no se inventa formato nacional ni campos nuevos.
La respuesta debe pertenecer a la identidad verificada actual. No se permite editar durante
recuperación de contraseña o hidratación de sesión. Conectividad perdida conserva el formulario;
una denegación de identidad definitiva retira el acceso privado.

## Requirements

- **FR-001**: consultar/editar nombre y teléfono propios reutilizando el backend002.
- **FR-002**: validar exclusivamente los campos del contrato; no admitir user_id, rol o tenant.
- **FR-003**: reflejar exclusivamente la respuesta propia válida, sin alterar contexto ni rutas.
- **FR-004**: impedir doble envío y contaminación por respuestas de sesiones anteriores.
- **FR-005**: manejar carga, error seguro, reintento, éxito y cancelación accesibles en ambas plataformas.
- **FR-006**: no modificar el esquema, servicios, datos de prueba ni secretos en esta implementación.

**Key Entity**: perfil propio002: userId (solo lectura), displayName, phone nullable.

## Success Criteria

- **SC-001**: pruebas dirigidas cubren validación, actualización, null, concurrencia, logout,
  revocación y respuesta ajena/tardía sin debilitar autenticación.
- **SC-002**: composición Web/Android usa el PATCH002 existente con identidad verificada;
  no crea SDK, endpoints ni privilegios adicionales.
- **SC-003**: recorrido físico final Web/Android acredita guardar, cancelar y restaurar datos
  autorizados; queda pendiente hasta ejecutarlo realmente. Dobles no lo sustituyen.

## Alcance posterior conservado

Son obligatorios Google, perfil profesional, reprogramación, favoritos, estilos/imágenes,
notificaciones internas, reseñas y mapas. Esta entrega no los declara implementados ni
opcionales. RF05 puede completarse de forma independiente con infraestructura ya acreditada.

## Comportamiento Web vigente

Mi cuenta administra datos personales, separados del perfil y espacio profesional.
No duplica las opciones operativas de la barbería. Muestra el número exacto de
barberías vinculadas. Guardar nombre/teléfono confirma con aviso temporal accesible
en la esquina superior derecha, sin desplazar el formulario. Se aplica a todas las
cuentas; sus roles contextuales no cambian por editar el perfil.
