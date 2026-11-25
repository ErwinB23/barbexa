# Implementation Plan: Autenticación y navegación por contexto

**Branch**: `main` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: Cinco historias, 20 FR y seis SC. Implementación integrada con Auth Cloud;
aceptación manual Web confirmada el 24/11/2026. Las pruebas específicas y Android
pendientes permanecen en tasks.md; no se sustituyen por la aceptación visual.

## Summary

Cliente universal con reglas compartidas y navegación Expo Router; SDK Auth encapsulado,
almacenamiento y enlaces por plataforma. Reutilizar perfiles, membresías, HTTP y Edge de
002, sin nuevo backend, tablas, migraciones ni roles globales. Web ligeramente antes
dentro de cada incremento, Android en el mismo incremento; ambas obligatorias para cerrar.
Google obligatorio en producto pero posterior a 003.

## Technical Context

**Language/Version**: TypeScript 6.0.3, React 19.3.0, RN 0.88.1; Node 24 según engines
existente (^24.3.0), sin afirmar una versión ejecutada hoy.

**Primary Dependencies**: existentes Expo ~58.0.24, Router ~58.0.31, Linking ~58.0.17,
RN Web 0.21.4. Propuestos @supabase/supabase-js 2.119.0 (npm view confirmó Node >=22)
y expo-secure-store ~58.0.3 (documentación y bundledNativeModules SDK58 coinciden).
No instalados hoy; revisar lock/audit/compatibilidad antes de instalarlos. Polyfill URL
solo ante fallo comprobado URL/URLSearchParams en Hermes. PKCE requiere crypto seguro,
nunca fallback aleatorio inseguro; verificar capacidades antes de añadir otro paquete.

**Storage**: Web SPA con almacenamiento del origen encapsulado; Android SecureStore.
Perfil/membresías/contexto en memoria, preferencia opcional no secreta por cuenta/proyecto
y siempre revalidada. Sin nuevas tablas. Persistencia no equivale a autorización.

**Testing**: node:test, compilación previa, harness de presentación y checkers actuales;
pruebas de adaptadores/coordinación más recorridos funcionales reales en ambas plataformas.
Ampliar entradas de compilación del runner cuando existan módulos, sin sustituirlo.

**Target Platform**: Web Chromium Windows (registrar navegador/versión) y Android
Honor 90 Lite Android 15 o emulador documentado; aceptación conjunta. iOS fuera de 003.

**Project Type**: SPA Web y aplicación Android desde Expo; backend Supabase administrado.

**Performance Goals**: sin umbral nuevo inventado; renovación coordinada, sin consultas
duplicadas por render ni destellos ajenos; medir solicitudes y tiempos por recorrido.

**Constraints**: no secretos privilegiados cliente, autorización servidor, sin negocio
offline ni garantía de revocación inmediata JWT. Almacenamiento Web accesible a JS implica
riesgo XSS, no protección HttpOnly; HTTPS/origen dedicado/renderizado seguro obligatorios.

**Scale/Scope**: cinco historias; siete vistas funcionales nuevas y callback. Perfil se
aprovisiona/consulta, no editor completo; cero membresías no crea rol cliente almacenado.

## Constitution Check

Gate previo: enmienda autorizada 2.0.0, IV/IX, prioridad Web/Android conjunta. Gate posterior:
conforme documentalmente al diseño siguiente, sin acreditar runtime.

| Principios | Decisión y gate |
| --- | --- |
| I–III | Tres capas lógicas conservadas; dominio/aplicación sin SDK, RN, DOM, HTTP ni tipos externos; composición cliente separada del Edge existente. |
| IV, IX | Web y Android simultáneos, aceptación funcional de ambas; prioridades no son exenciones de pruebas. |
| V–VII | Auth/Edge/PostgreSQL de 002, RLS y ACL definitivos; sin Node/BFF, negocio ni rol global. Google diferido, no eliminado. |
| VIII, X | Spec aprobada, FR/SC trazables y accesibilidad; no tareas/implementación en plan. |
| XI | Evidencia por versión/entorno; nueve moderados abiertos; no auditoría aprobada. DNS/CDN, CI/CD, caché y k6 no se declaran cumplidos aquí. |
| XII | Contexto compartido actualizado con alcance documental; historial 001/002 conservado. |

AGENTS.md conserva prioridad anterior; subordinada a enmienda explícita, no autoriza
omitir una plataforma. Sin violación arquitectónica pendiente de justificación.

## Project Structure

### Documentation (this feature)

[research.md](research.md), [data-model.md](data-model.md),
[contracts/authentication.md](contracts/authentication.md), [quickstart.md](quickstart.md)
y [validation.md](validation.md). No generar tasks.md en esta fase.

### Source Code (repository root)

Estructura prevista, no crear estos archivos de aplicación ahora:

```text
src/features/authentication/
  domain/identity.ts, session-state.ts, auth-error.ts
  application/auth-gateway.ts, session-coordinator.ts, auth-actions.ts, tenant-context.ts
  infrastructure/supabase-auth-adapter.ts
  infrastructure/session-storage.web.ts, session-storage.native.ts
  infrastructure/auth-links.web.ts, auth-links.native.ts
  presentation/auth-context.tsx, use-auth.ts
  presentation/sign-in-screen.tsx, sign-up-screen.tsx, confirm-email-screen.tsx
  presentation/forgot-password-screen.tsx, reset-password-screen.tsx
  presentation/account-screen.tsx, context-screen.tsx
src/composition/auth-composition.ts, auth-provider.tsx
src/features/tenant-foundation/       # reutilizar, sin duplicar
src/shared/ui/                       # extender solo controles consumidos
src/app/
  _layout.tsx, index.tsx, technical.tsx, +not-found.tsx  # conservar 001
  (auth)/_layout.tsx, sign-in.tsx, sign-up.tsx, confirm-email.tsx, forgot-password.tsx
  auth/callback.tsx, auth/reset-password.tsx
  (account)/_layout.tsx, account.tsx, context.tsx
tests/unit/authentication/
tests/integration/authentication/
tests/presentation/
docs/evaluacion/evidencias/003-autenticacion/  # crear en implementación
```

Comas enumeran archivos separados. Rutas solo navegación/composición y adaptación de
parámetros. Presentación consume interfaz de aplicación, nunca infraestructura. Composición
instancia SDK, almacenes y createTenantFoundation con getAccessToken inyectado. No crear
carpetas genéricas sin consumidores. Las tres capas lógicas de despliegue son presentación
cliente; aplicación/negocio cliente y Edge; datos/archivos Supabase. No confundirlas con
las responsabilidades Clean de dominio/aplicación/infraestructura/presentación.

## Diseño y ejecución posterior

1. Pruebas de estados/puertos; SDK/almacenes; coordinador de sesión compartido. Un cliente
   SDK por ejecución, no por render. Tokens permanecen en infraestructura, no en React,
   dominio, estado serializable ni rutas. Inyectar acceso al transporte existente de 002.
2. Registro/login: getOwnProfile primero; si falta, ensureOwnProfile con datos propios
   validados. Nombre inicial puede conservarse en metadata como dato de perfil, nunca
   permiso; si falta tras confirmación, solicitar completarlo. Reintento no vuelve a registrar
   ni sobrescribe perfil. Perfil pendiente no habilita ready.
3. Coordinador usa generation por cuenta/logout: toda respuesta compara generation y
   actor antes de publicar. Invalidar antes de esperar red, cancelar si es posible y
   descartar respuestas tardías siempre. Fallo al borrar storage es cierre incompleto,
   no éxito; informar y bloquear aceptación. No limpiar todo el storage del navegador.
4. Contexto: listar propias, filtrar active y consultar acceso a barbería; exactamente
   una autorizada se selecciona, varias permiten elegir/cambiar, cero conserva cuenta.
   Preferencia revalidada puede restaurarse. Retirar datos previos antes de cambiar;
   denegación de tenant no implica logout Auth. Revalidar al cambio, foco y denegación.
5. Recuperación restringida: procesador único de callback valida destino/canje, no
   concede permisos por query o SIGNED_IN aislado. Actualizar contraseña, salir localmente
   y regresar al login. Sin verifier, ofrecer nuevo envío; no fallback implicit.
6. Web ligeramente primero y Android dentro del mismo alcance; no posponer aceptación
   Android al final. Nunca capturar tokens, contraseñas ni URLs sensibles en evidencias.

Stack.Protected de Expo Router limita área ready y recuperación; resolución pública no
monta vistas privadas. No autorización solo visual. Web renderiza shell público sin
datos de sesión en HTML; no SSR autenticado ni +api. Hosting debe resolver deep links.

Reutilizar Screen, AppText, AppButton, StatusMessage y tokens; añadir entrada accesible
solo al consumirla formularios. Web responsive de ancho legible, teclado/foco/labels;
Android teclado/scroll/zonas seguras/TalkBack/48dp. Sin rediseño definitivo ni librería UI.

## Gates operativos antes de implementar/verificar partes afectadas

- Aprobar URL/origen Web estable, entorno Auth de pruebas y autorización de redirects,
  correo y BARBERIA_ALLOWED_ORIGINS si cambia Cloud. No modificar configuración aquí.
- Android: build reproducible con scheme appbarberia para callbacks. Expo Go no acredita
  esos enlaces. Build local o EAS requiere preparación autorizada, sin publicar en tiendas.
- Analizar nuevas dependencias y diferencia audit antes de instalar. No force ni ocultar
  nueve avisos previos. Resolver versión efectiva/lock sin asumir compatibilidad runtime.
- Revisar riesgo SPA/storage JS antes de entrega pública; exigir HttpOnly requeriría otra
  decisión de arquitectura, no introducir servidor silenciosamente.

## Complexity Tracking

Sin excepciones nuevas: descartados BFF/SSR/Node, SDK en núcleo, duplicar perfiles/RPC y
paquetes de estado/formularios/caché sin consumidor. Adaptadores de plataforma y coordinador
son los mínimos necesarios para sesión real.
