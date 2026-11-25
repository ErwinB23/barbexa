# Implementation Plan: 006 — Perfil personal

## Summary / Technical Context

Expo58/React Native0.88/React19/TypeScript6 ya instalados. Reutilizar `updateOwnProfile`
de `tenant-foundation` y su PATCH PostgREST, RLS/ACL propias002. Sin migración, instalación,
servicio ni nueva ruta. Web y Android comparten Mi cuenta y el formulario accesible.

## Constitution Check

Constitución2.0.0: núcleo sin frameworks, puertos hacia infraestructura y composición
explícita; autorización definitiva RLS002; permisos contextuales intactos; aceptación
obligatoria Web/Android. Sin tecnologías o diseño nuevos. Gates conformes; aceptación
manual Web aceptada el 24/11/2026; Android final pendiente.

## Project Structure / Implementation

- `authentication/application/session-coordinator.ts`: edición con validación,
  deduplicación por generación y rechazo de resultados tardíos/ajenos.
- `authentication/application/auth-gateway.ts`: puerto de acción de aplicación.
- `composition/auth-composition.ts`: conectar al adaptador002 existente.
- `authentication/presentation/personal-profile-editor.tsx`: reutilizar AppTextField,
  AppButton y StatusMessage dentro de AccountScreen, sin lógica Supabase.
- Pruebas unitarias del coordinador, composición con dobles y presentación.

## Dependencies / Risks

003 sesión y002 perfiles técnicamente disponibles. No usar edición personal para cambiar
rol, propiedad o perfil profesional. Un PATCH aceptado por el servidor puede terminar tras
logout; el cliente descarta su respuesta. No se promete cancelar una escritura ya recibida.
Mantener XSS residual Web documentado; texto React sin HTML ni logs con datos personales.

## Validation

RED→GREEN dirigido, tipos, lint, formato, arquitectura y regresiones de sesión/composición.
Sin operadores de fixtures ni HTTP mutante. Aceptación final en quickstart.md.

## Etapa 1 Web autorizada — 19/11/2026

Conservar diseño aprobado y backend. Barra principal personal; avatar/perfil muestran
accesos derivados del contexto verificado. `none` no muestra trabajo; `choosing` ofrece
selector sin atribuir permisos del conjunto al establecimiento actual. `/staff` Web es
invitaciones recibidas; `?view=team` exige administrador seleccionado; `?view=professional`
exige contexto activo y conserva validación de perfil propio en los casos existentes.
`/barbershop-admin?view=create` separa creación para cualquier cuenta sin abrir gestión.
Controles de invitación administrativa recibida/enviada separados, mismos casos de uso.
Corregir Inicio desde vistas query sin cambiar Auth ni su allowlist. Variantes nativas
conservan comportamiento; extensiones opcionales de presentación no activan cambios nativos.

Decisión conceptual aprobada, NO implementada en esta etapa: creador será principal;
solo él podrá nombrar/retirar secundarios, modificar permisos de ese nivel e iniciar
transferencia; máximo2 secundarios activos y sin autopromoción/otorgamiento por secundarios.
Requiere especificación/contratos/migración y autorización separada; no inferir propiedad
histórica ni cambiar las facultades actuales de `administrator` silenciosamente.
