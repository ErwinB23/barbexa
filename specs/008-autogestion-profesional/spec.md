# 008 — Perfil profesional propio

Fuente: RF21/HU14, propuesta aprobada. Fecha15/11/2026. Implementada e integrada
con Cloud. Perfil propio contextual aceptado manualmente en Web el 24/11/2026;
aceptación Android final pendiente. La ampliación de datos corresponde a 013.

## US1 (P1): Consultar y editar mi perfil profesional contextual

Como profesional con membresía activa quiero consultar y editar mi nombre profesional
en la barbería seleccionada, sin poder modificar otro profesional ni conceder permisos.
Se reutiliza el campo `professionalName` existente004. No se inventan biografía, tarifa,
especialidades o fotografía; imágenes tienen requisito separado. No se declara un
editor ampliado completo si más adelante se aprueban otros campos.

Aceptación independiente: un barbero y un administrador con perfil profesional activo
consultan/editan únicamente su nombre en el tenant seleccionado. Sin membresía/perfil
habilitado, se rechaza. El admin mantiene su rol; un barbero no obtiene acceso al upsert
administrativo, ni activa su propio perfil o servicios. Repetir mismo nombre es idempotente.
Cambiar de cuenta/contexto o revocar membresía durante la operación descarta resultados.

## Requisitos
- FR001: consultar/editar el nombre del profesional propio existente, validado no vacío.
- FR002: servidor deriva usuario desde JWT verificado y revalida pertenencia activa/tenant;
  no aceptar userId, barberId, role, active o servicios en el comando de edición.
- FR003: conservar reservas y sus snapshots, permisos y gestión administrativa004.
- FR004: controles compartidos Web/Android con carga, vacío, error y reintento sin rediseño.
- FR005: no aplicar SQL ni activar UI operativa antes de autorizar y validar backend.

## Éxito y límites
SC001: pruebas dirigidas de payload cerrado, actor verificado, scope, dobles HTTP y UI.
SC002: tras autorización, RPC/HTTP reales prueban A/B, revocación y no modificación ajena.
SC003: Web/Android físicos acreditados en recorrido integral. SC002/003 no se simulan.
Autogestión de intervalos/bloqueos RF22 será el siguiente bloque y permanece pendiente.
