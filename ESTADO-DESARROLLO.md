# Estado vigente — App Barbería

13/11/2026, America/Lima. Fundación 001 cerrada; fundación 002 cerrada técnicamente conforme a sus 40 tareas y límites de evidencia. No es el SaaS terminado ni el inicio de 003. Rama main; checkpoint anterior 42a695c. El hash de cierre se consulta en Git, no se predice en este archivo.

[Constitución](.specify/memory/constitution.md), [rúbrica](docs/evaluacion/RUBRICA.md), [spec 002](specs/002-fundacion-supabase-multitenant/spec.md), [tareas](specs/002-fundacion-supabase-multitenant/tasks.md), [informe y trazabilidad](docs/evaluacion/evidencias/002-fundacion/informe.md), [guía](specs/002-fundacion-supabase-multitenant/quickstart.md), [cierre/integridad](docs/evaluacion/evidencias/002-fundacion/cierre.md).

Modelo profiles/barbershops/barbershop_memberships, membresías activas/contextuales y RLS; Clean Architecture y composición cliente/Edge. Cinco migraciones en Cloud nuevo vuoncrtkkkquvddunrxx/sa-east-1; ensure-profile/create-barbershop ACTIVE v1, verify_jwt=true. PostgreSQL 17.11, Auth v2.197.0; runtime Edge numérico no observado. GraphQL opcional, extensión no instalada; sin cambio de configuración exigido.

Local: SQL 336/336, HTTP 440/440, calidad y reproducción con evidencia; Cloud: estructura 83/83, negativas 10/10, aislamiento/roles/revocación y edición propia 7/7. Resultados y atribuciones separadas en informe. Primeros fallos de expectativas/callback y sus correcciones conservados. Fixtures limpiadas; no invalidez inmediata garantizada de JWT. Sin nuevas pruebas Android/Google/UI 002.

Riesgos: nueve avisos npm moderados sin remediación/aceptación formal. No auditoría global aprobada. Caché, DNS/CDN, CI/CD, k6 y escalabilidad completa siguen pendientes; también negocio, Google/pantallas Auth, invitaciones, Storage/imágenes, mapas/reseñas y notificaciones. No administrador global, API Node propia o microservicios.

No operar el Supabase antiguo ni sus contenedores. Log activo t017-serve.log preservado y excluido del commit. Cierre local autorizado; sin push. Para la próxima funcionalidad: primero especificación/decisiones y autorización de su alcance; no se inicia 003 aquí.

## Registro histórico heredado de 001 (no estado actual)

# Estado de desarrollo — App Barbería

Actualizado: 11/11/2026, America/Lima. Feature activa:
`001-fundacion-expo-clean`. Rama `main`, HEAD
`66c2f39448274e0ccb8ed47c09bf48d78e9177d4`.
**T001–T040 completadas: fundación 001 cerrada técnicamente**, conforme al alcance
revisado y límites documentados; no es el cierre del producto SaaS. Hay documentación T036–T040 sin
commit; no se ha hecho commit/push por el agente.

Contexto obligatorio: [AGENTS.md](AGENTS.md),
[Constitución v1.0.1](.specify/memory/constitution.md),
[especificación vigente](specs/001-fundacion-expo-clean/spec.md),
[tareas](specs/001-fundacion-expo-clean/tasks.md).
El [informe consolidado](docs/evaluacion/evidencias/001-fundacion/informe.md)
vincula los 11 FR y 6 SC, resultados, atribuciones y límites; la
[rúbrica](docs/evaluacion/RUBRICA.md) conserva los 16 criterios académicos.

## Avances demostrados

- Expo integrado al Git existente con inventarios y copia controlada. Expo
  58.0.24, Router 58.0.31, Constants 58.0.16, Linking 58.0.17; React 19.3.0,
  React Native 0.88.1, TypeScript 6.0.3. Versiones efectivas y comandos en la
  [guía de reproducción](docs/evaluacion/evidencias/001-fundacion/reproduccion.md).
- Cliente modular por funcionalidad con dominio/aplicación independientes,
  puerto propio, caso de uso, adaptador local sustituible y composición explícita.
  El contexto de presentación expone el caso de uso; las vistas no importan
  infraestructura. Sin Supabase ni entidades de negocio ficticias.
- Expo Router: Bienvenida, Base técnica y ruta desconocida, con retorno y
  recuperación. Consulta real de metadatos locales, carga/error/reintento y
  galería de cuatro estados diferenciada de la consulta.
- UI compartida con tokens, texto escalable, controles con mínimos configurados
  48×48, roles/etiquetas/disabled, scroll y zonas seguras; contraste calculado.
- [Reproducción limpia T037](docs/evaluacion/evidencias/001-fundacion/t037.md):
  npm ci en copia externa, sin tocar node_modules principal. Check en 0:
  67 unitarias, 38 regresiones arquitectónicas y 11 de presentación. Checker:
  21 módulos, 4 del núcleo y 37 aristas. Tipos, lint, formato y compatibilidad
  aprobados, Doctor 20/20 y bundle Android/Hermes de producción generado.
  Los 799 hashes previos coincidieron en ambas carpetas. Primer EACCES y
  reintento autorizado conservados en
  [reproduccion.log](docs/evaluacion/evidencias/001-fundacion/reproduccion.log).
  Cobertura 100 % solo del núcleo ejecutable, no de UI o de toda la aplicación.

Estos resultados se reutilizan de las evidencias; no se repitieron en T039.

## Android y decisiones autorizadas

Las pruebas físicas son **declaradas por el usuario**, no ejecutadas por Codex:
Honor 90 Lite CRT-NX3, Android 15, Expo Go 58.0.5, LAN. Recorridos, cabecera/Atrás,
fallback, reinicio sin credenciales, información y galería/recuperación acreditados.
[Registro Android](docs/evaluacion/evidencias/001-fundacion/android-final.md).

- T033: se acepta funcionamiento local de la aplicación previamente cargada sin
  internet; no se exige Metro simultáneo. No se probó arranque offline instalado.
- T034: cierre con uso TalkBack y ausencia de obstrucciones reportados, comprobación
  técnica y pruebas automatizadas; sin nuevas mediciones instrumentales nativas.
  [Decisión y límites](docs/evaluacion/evidencias/001-fundacion/android-talkback.md).
- T035/US3/SC-005: enmienda explícita acepta máximo de texto disponible en el
  Android identificado, legible y funcional sin recortes/superposiciones, junto
  con componentes/contraste. **No se midió 200 % exacto ni dimensiones nativas de
  ese escalado**; esa validación es futura, no condición vigente de esta fundación.
  [Enmienda y evidencia](docs/evaluacion/evidencias/001-fundacion/android-texto-contraste.md).

## Arquitectura y composiciones posteriores

Mantener cliente-servidor y tres capas lógicas; sin API Node propia ni
microservicios de negocio. El cliente conectará casos de uso con adaptadores
SDK/HTTP mediante sus contratos y raíz de composición. Auth, Edge Functions,
PostgREST, PostgreSQL y Storage aún no están integrados.

El servidor tendrá entrada/composición independiente en Edge Functions, con
dominio/aplicación propios y adaptadores de persistencia. La entrada verificará
sesión; PostgreSQL resolverá permisos contextuales, membresías activas, RLS,
barbería, precios y disponibilidad con transacciones y restricciones concurrentes.
El flujo aprobado conserva ReservaRemotaGateway y ReservaAtomicaGateway. Storage
requiere políticas y recuperación ante fallos parciales al asociar referencias;
no comparte transacción con PostgreSQL. Diseño, no funcionalidad ya implementada:
[límites de backend](docs/evaluacion/evidencias/001-fundacion/limites-backend.md).

## Pendientes reales y siguiente paso

- **T040 completada**: cotejo final de los 585 originales: 581 idénticos y cuatro
  documentos con diferencias autorizadas; sin eliminaciones ni cambios inesperados.
  [Cierre técnico y registro de integridad](docs/evaluacion/evidencias/001-fundacion/cierre.md).
- **9 vulnerabilidades moderadas npm** reportadas en T037: análisis pendiente,
  sin aceptación formal ni auditoría de seguridad aprobada. Falta clasificar
  producción/desarrollo, directas/transitivas, exposición y acciones. No se usó
  audit fix, force ni actualización automática.
- Backend multitenant, permisos, reservas atómicas y concurrencia, imágenes,
  identidad, pagos manuales y demás negocio: futuras funcionalidades especificadas
  antes de implementar. La operación local no acredita garantías de servidor.
- Caché: implementar según la rúbrica y medir invalidación, aislamiento y
  rendimiento; caché de disponibilidad nunca autoriza confirmar una reserva.
- DNS/CDN, dominio/subdominio, CI/CD y k6: obligaciones futuras sin implementación
  ni pruebas acreditadas. Faltan también escalabilidad frontend/backend/BD,
  entrega/sustentación y validaciones web/iOS. No confundir check local con CI/CD
  ni bundle con prueba Android. Contribución parcial a rúbrica 1–7; 8–16 pendientes.
- Validación futura exacta al 200 %, mediciones nativas y arranque offline: no
  acreditados; no se reabren silenciosamente los criterios revisados.

T039 creó este contexto y marcó su casilla; T040 actualizó solo su estado de cierre.
Se actualizaron el informe y el estado para reflejar el cierre. AGENTS.md,
Constitución, especificación, plan, código, dependencias y registros históricos
se conservaron. Sin instalaciones o verificaciones costosas nuevas, commit o push.
