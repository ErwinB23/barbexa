# Implementation Plan: MVP de operación y reservas multitenant

**Branch actual**: `main` · **Date**: 2026-11-14 · **Spec**: [spec.md](spec.md)

Revisión técnica satisfactoria y bloque T001–T007 autorizado por el responsable el14/11/2026.
Su estado ejecutado consta en tasks.md/evidencias; los apartados de diseño describen también
trabajo futuro, no funciones ya entregadas. No aprobación Cloud ni cierre anticipado de003.

## B5.2 — ampliación aprobada de FR007

Retirada lógica de cierres con motivo/auditoría única/idempotencia concurrente según
contracts/booking.md. Nuevo puerto/caso contextual, RPC privada y panel Web existente.
Migración20261121040559 ensayada en DB desechable y activada en LOCAL por CLI oficial;
historial18, Edge real de lectura y conservación41/44 aprobados. Ver E004/b523-activacion-reintento.md.
Sin cambios de negocio ni UI Android/Auth. Ensayo22 y retirada positiva Chrome requieren
autorización separada; no ejecutados.

## Summary

Una oferta operativa mínima por barbería permite reservar varios servicios, asignar un
profesional concreto y consultar/cancelar la cita con identidad y permisos vigentes.
Cliente Expo compartido, casos de uso cliente/servidor y PostgreSQL definitivo. El primer
backend ejecutable es catálogo/horarios/RLS y, después, RPC atómica con concurrencia real.
La demostración final usa cliente Android y administrador Web, con comprobación inversa.

## Technical Context

**Language/Version**: TypeScript6.0.3; Node24.21.0 herramientas; Deno2.9.8 servidor existente.
**Primary Dependencies**: Expo58.0.25, RN0.88.1, Router58.0.31, React19.3.0,
Supabase SDK2.119.0, CLI3.1.0, Crypto58.0.8/SecureStore58.0.3 ya disponibles.
**Storage**: PostgreSQL17 del proyecto nuevo; migraciones aditivas. Sin Storage/imágenes aún.
**Testing**: node:test, runner unitario y checkers existentes; Deno; pgTAP/SQL y runner
HTTP seguro002 ampliados, dos conexiones para carreras. Sin herramientas nuevas por defecto.
**Target Platform**: Web y Android reales; APK Development existente mientras no cambie código nativo.
**Project Type**: Cliente Expo + backend administrado, dos módulos de negocio por responsabilidad.
**Performance Goals**: demostrar SC sin duplicados; consulta de catálogo/disponibilidad con
presupuesto p95<=2s en escenario local definido de10VU/1min, meta pendiente de medir.
**Constraints**: America/Lima/PEN; HTTP LAN solo Development aprobado; prod HTTPS y orígenes
exactos requieren autorización. No Cloud/migraciones de negocio en este bloque.
**Scale/Scope**: cuatro historias,28FR,6SC; once tablas nuevas mínimas, sin copiar21 tablas antiguas.

## Constitution Check

| Principio | Decisión/gate |
| --- | --- |
| I–III | Tres capas lógicas; núcleo de cliente/servidor sin SDK/SQL/RN/HTTP; puertos propios. |
| IV | Web y Android obligatorios, Web se comprueba primero y Android inmediatamente. |
| V | Supabase existente; sin API Node ni microservicios. Google obligatorio de producto, diferido por decisión del usuario. |
| VI | Tenant en relaciones/FK, RLS/ACL, actor verificado y membresía actual, ninguna autoridad de metadata. |
| VII | SolicitarReserva→ReservaHttpAdapter→Edge→ConfirmarReserva→PostgresReservaAdapter→RPC transaccional; snapshots/exclusión. Pagos diferidos expresamente, no obligación eliminada. |
| VIII | Spec→plan→tasks antes de código; reglas aprobadas en Clarifications; revisión inicial satisfactoria; bloque T001–T007 autorizado. |
| IX–X | SQL/HTTP/JWT reales, concurrencia/rollback, E2E/accesibilidad, sin confundir mocks/bundles con dispositivos. |
| XI | [validation.md](validation.md) traza rúbrica; DNS/CDN, caché, CI/CD y k6 mantienen puertas reales y permisos. |
| XII | Actualizar estado/evidencias solo con resultados comprobados; no secretos ni commit/push implícito. |

Reevaluación posterior al diseño: no excepción arquitectónica. Excepciones **de entrega
por etapa autorizadas**: Google y pagos no están en004; imágenes/mapas/reseñas/etc. siguen
en producto posterior. No declarar la propuesta académica completa por cerrar este MVP.

## Project Structure

### Documentation (this feature)

```text
specs/004-mvp-reservas/
  spec.md, plan.md, research.md, data-model.md, quickstart.md, validation.md
  contracts/booking.md, tasks.md, checklists/requirements.md
```

### Source Code (previsto, no creado)

```text
src/features/barbershop-operation/{domain,application,infrastructure,presentation}/
src/features/reservations/{domain,application,infrastructure,presentation}/
src/composition/barbershop-operation-composition.ts, reservations-composition.ts
src/app/(account)/{barbershop-admin,staff,services,schedules,booking,my-reservations,agenda}.tsx
supabase/functions/_shared/barbershop-operation/{domain,application,infrastructure,presentation}/
supabase/functions/_shared/reservations/{domain,application,infrastructure,presentation}/
supabase/functions/{barbershop-operation,reservation-command}/index.ts
supabase/migrations/*_booking_catalog.sql, *_booking_atomic.sql
supabase/migrations/*_booking_operations.sql, *_booking_cancellation.sql
supabase/migrations/*_booking_agenda.sql
supabase/tests/{booking-schema,booking-access,booking-atomic,booking-cancellation}.test.sql
tests/unit/{barbershop-operation,reservations}/
tests/server/{barbershop-operation,reservations}/
tests/integration/booking/; tests/presentation/booking/
docs/evaluacion/evidencias/004-reservas/
```

Rutas solo adaptan navegación/parámetros. `barbershop-operation` agrupa preparación real
de oferta/personal; `reservations` posee consulta/confirmación/agenda/cancelación. No crear
clases/repositorios por tabla sin caso de uso. Reutilizar fuentes003, transporte/auth002,
componentes y composición; no introducir un segundo SDK o autorización global.

## Diseño mínimo

1. **Reuso**: crear/renombrar barbería y primer administrador existentes. Añadir configuración
   operativa separada sin ensanchar SELECT privado002. Perfil global no se hace público.
2. **Personal**: invitaciones internas a cuenta existente, destinatario resuelto en servidor
   por correo exacto sin endpoint de búsqueda de usuarios. Respuesta no enumerativa; aceptación
   consume invitación pendiente y actualiza membresía en una transacción. Conflicto ante una
   membresía activa de otro rol; no degradación/promoción silenciosa. Nueva invitación tras
   rechazo/cancelación; único pendiente por tenant/destinatario. Admin-profesional es capacidad
   de perfil profesional, no segundo usuario ni segundo rol global.
3. **Oferta**: catálogo/horarios/capacidades y excepciones. Publicar exige datos/políticas
   válidas, servicio y profesional activos con horario. Pausada visible, sin altas de citas.
   Cambios que dañen citas futuras se rechazan; resolverlas por cancelación autorizada primero.
4. **Lecturas**: PostgREST con JWT y RLS para reserva propia/agenda permitida. Catálogo y slots
   mediante RPC de proyección estrecha, authenticated y auth.uid() verificado por la plataforma;
   cliente sin membresía puede ver oferta visible, nunca tablas privadas globales ni emails.
5. **Escrituras críticas**: dos entradas Edge con métodos/acciones cerrados documentados en
   contrato, verify_jwt=true y verificación Auth dentro del handler. No dispatch de SQL libre.
   Casos de uso reciben VerifiedActor y gateway; adaptador RPC servidor con secreto en entorno.
   Funciones privadas SECURITY DEFINER estrechas, search_path vacío y nombres calificados,
   wrappers públicos invoker EXECUTE solo service_role para mutaciones. auth.uid() de servicio
   no representa al cliente: actor procede de Auth validado y SQL repite autorización vigente.
6. **Atomicidad**: precio/duración/snapshots y asignación se calculan en SQL. EXCLUDE GiST
   por identidad física del profesional + rango [inicio,fin+separación), solo reservas activas;
   canceladas no bloquean. `btree_gist` es extensión de PostgreSQL, verificar disponible antes
   de migrar, no dependencia npm. Reserva+items+evento/idempotencia se confirman o revierten juntas.
7. **Bloqueos/cambios concurrentes**: orden único: configuración de barbería → conjunto
   ordenado de personas involucradas → reserva → detalles. Configuración se bloquea compartida
   al reservar y exclusiva al cambiar catálogo/horarios/personal; límites por cliente y ocupación
   por profesional se serializan con locks transaccionales ordenados. «Cualquiera» considera
   candidatos capaces y los bloquea con orden estable; exclusión es la defensa definitiva.
   Probar cruces A/B de la misma persona, cancelación/alta y cambio de agenda/membresía.
8. **Privacidad del conflicto global**: SQL consulta ocupación interna global solo para
   booleano/rangos disponibles; no devuelve reserva, cliente, tenant ni ID ajeno. Todo conflicto
   público usa exactamente «Profesional no disponible en ese horario» sin detalles de constraint.
9. **Reintento**: requestId aleatorio seguro Crypto existente, UNIQUE(actor,tenant,requestId)
   y huella normalizada en servidor. Mismo contenido devuelve resultado original; distinto,
   conflicto. Reconciliar timeout antes de nuevo intento; no usar Math.random ni cuerpo como precio.
10. **Cancelación**: comparar reloj servidor con start-snapshot.advance (default aprobado120).
    Staff asignado/admin activo requiere motivo. Lock, cambio de estado, liberación y evento
    atómicos; repetición no cambia autor/motivo inicial ni duplica eventos. No pagos/penalizaciones.

## Pruebas, operación y entrega

Datos locales nuevos/revocaciones y limpieza requieren autorización concreta, runner seguro
con identidad/puertos/nombres comprobados. Preferir stack nuevo actual; nunca db reset ni
stack adicional por costumbre. Casos que necesitan DB real no se sustituyen por fixtures.
Backend SQL puede implementarse antes del cierre003; pantallas esperan sesión/contexto real.
003T028–T032 recuperación y comprobación de ambas plataformas son puerta antes de evaluación.

La caché de catálogo comercial ya está implementada (detalle al final), con invalidación
por sesión/contexto y mutación; no conserva permisos ni slots como autoridad.
CI de calidad configurada en .github/workflows/quality.yml; ejecución remota y CD público
sin acreditación. No confundir configuración del workflow con un despliegue exitoso. Hosting/origen/DNS/CDN/HTTPS y k6 se validan al
autorizar destino; no inventar dominio. No pagos de plataforma/EAS ni instalaciones implícitas.

Riesgos: cierre Android y controles específicos003, cobertura global insuficiente,
seguridad/dependencias finales pendientes, XSS SPA residual y publicación sin acreditar. No habrá
estimación garantizada ni cierre de 16 criterios por la sola existencia de estos documentos.

## Complexity Tracking

No tecnologías nuevas. Once tablas se justifican en [data-model.md](data-model.md); sin
pasarela, pagos, invitación por email, notificaciones, mapas o tablas de estilo innecesarias.
Se descarta copiar backend anterior o implementar API propia. Dos módulos y dos entradas
Edge reducen boilerplate manteniendo casos de uso y contratos específicos por operación.

## Ampliación visual Web autorizada — Inicio privado Barbexa (18/11/2026)

Reutilizar FR-009 y FR-017: `/account` muestra Inicio solo en Web; parámetros `view`
seleccionan explorar, detalle, perfil existente o aviso de función aún no disponible.
Conservar rutas/retornos Auth y las variantes nativas. Catálogo y reservas propias se leen
mediante puertos existentes, con estado independiente del borrador de reserva y descarte
de respuestas ajenas/tardías al cambiar identidad/contexto. Búsqueda únicamente por nombre.
El botón explícito Reservar entrega la selección al motor existente sin eludir sus locks.

Maqueta y dos imágenes proporcionadas por el usuario; Outfit y marca existentes. Sin datos
inventados en producto: fotografías genéricas identificadas como ilustrativas, sin reseñas,
favoritos, recomendaciones personalizadas ni contador/avisos simulados. Menú personal con
perfil, reservas, invitaciones, contextos y logout existente; permisos operativos conservados.
Validar estados carga/vacío/error, responsive, teclado, búsqueda, detalle y aislamiento con
dobles locales. Aceptación visual y recorrido funcional Web del usuario cerrados el24/11;
no equivalen a E2E automatizado ni aceptación Android.

## Cierre técnico vigente — Sprint 2

Las activaciones Cloud posteriores y el cierre manual Web del 24/11/2026 sustituyen
los pendientes de activación y aceptación Web del diseño inicial; no cierran Android,
seguridad publicada ni pruebas específicas. Reutilizar las evidencias existentes;
no repetir una auditoría general ni recorridos manuales aceptados.

- Caché implementada en catalog-cache.ts: catálogo comercial en memoria, máximo
  32 entradas y TTL30s; clave usuario/barbería/versión y aislamiento de entorno.
  Invalida al cambiar sesión/contexto y tras mutaciones, incluso si fallan.
  No almacena permisos ni autoriza confirmar con slots antiguos. Medición local
  histórica no equivale a rendimiento del destino publicado.
- Renombrar usa el puerto propio de nombres y renameSelectedShop; refrescar el
  contexto conserva la selección mientras carga. Crear sigue siendo otra operación.
  Agendas y cuenta utilizan casos de uso existentes; ver 005/010/011/012/017/018.
- Clean Architecture, SOLID y puertos/adaptadores se mantienen en cliente y servidor;
  composición explícita, dominio sin SDK/framework y autoridad transaccional PostgreSQL.
  Referencias comunes: Constitución, ADR existentes y docs/CODEX-HANDOFF.md.

### Calidad pendiente y métricas conservadas

EQ-01–EQ-10 de la propuesta mantienen sus objetivos originales; no se convierten en
resultados por esta consolidación. Conservar el escenario original de carga
25/50/100 VU, 10min por nivel, p95≤3s y errores técnicos<1% en 100VU/10min;
disponibilidad mensual99,5% sigue siendo objetivo, no medición de esta etapa.
El smoke MVP T033 (10VU/1min, p95≤2s, errores funcionales0) es un escenario distinto.

El laboratorio añade pruebas progresivas con k6 hasta **2.000 usuarios virtuales
concurrentes**. Pendiente de definir y autorizar entorno, datos, etapas, duración,
umbrales y límites de carga antes de ejecutar; no hay evidencia de esa capacidad.
No sustituye ni rebaja EQ originales o Constitución. La cobertura global mínima
sigue siendo 100% líneas, 100% funciones y 90% ramas: último control191/191 pruebas
aprobadas, pero líneas63,39% y funciones84,82% incumplen el gate. Hosting público,
HTTPS/DNS/CDN, CI remoto/CD, E2E y aceptación Android requieren evidencia propia.
