# Validation y trazabilidad — 004

Diseño de pruebas, no resultados. **28FR,6SC,4historias**. Ambas plataformas obligatorias,
Web primero y Android inmediatamente. No repetir íntegramente002/003 sin regresión afectada.

## Capas de verificación

- Núcleos cliente/servidor: tipos propios, estados/validación/snapshots, selección y errores;
  node:test/Deno existentes, cobertura por archivo reportada sin atribuirla a UI.
- Adaptadores/handler: respuestas controladas, campos cerrados, JWT validado, CORS y códigos;
  no precio/actor/rol del body, no erroresSQL o secretos públicos.
- PostgreSQL real: esquema/constraints/índices/FK, RLS/ACL y owners/EXECUTE/search_path,
  estado de publicación, revalidación, snapshots, transacciones y dos conexiones concurrentes.
- HTTP real: JWT de usuario autorizado/ajeno/inválido; anon/public key no operan como persona;
  llamadas privilegiadas directas de usuario denegadas. No service_role como prueba de RLS.
- Presentación y E2E: listas/formularios/acciones reales con backend, Web y APK Android.
  Aplicar el recorrido [quickstart](quickstart.md) con fixtures aprobadas y limpieza selectiva.

## Matriz FR → tarea → resultado esperado

| FR | Tareas | Prueba principal |
| --- | --- | --- |
| FR-001 | T008–T013 | Crear mediante002, primer admin solo del tenant, admin ajeno denegado. |
| FR-002 | T005,T008–T013 | Publicación incompleta falla; pausada visible sin reservas nuevas. |
| FR-003 | T005,T008–T013,T014–T016 | Precio/duración válidos, inactivos denegados, histórico intacto. |
| FR-004 | T005,T008–T013 | Membresía y capacidad vigentes; admin profesional explícito, rol preservado. |
| FR-005 | T008–T013 | Pending no acceso, destinatario responde, emisor admin actual. |
| FR-006 | T008–T011 | Duplicada pendiente, aceptación concurrente/repetida y nueva tras rechazo/cancelación. |
| FR-007 | T005,T008–T016 | Horarios/excepciones y política válida; mínimo/horizonte/cupo/separación. |
| FR-008 | T009,T011,T016 | Cambios incompatibles y carrera con confirmación no dañan citas. |
| FR-009 | T005,T009,T011–T013,T018 | Cliente sin membresía ve solo oferta; campos privados denegados. |
| FR-010 | T014–T019 | Múltiples servicios, capacidades completas, profesional concreto. |
| FR-011 | T014–T019 | Slots consideran duración, cierres y otras ocupaciones; caché no autoriza. |
| FR-012 | T014–T019 | Identidad verificada, precio/rol falsificados rechazados. |
| FR-013 | T014–T017 | Error controlado después de cabecera revierte items/eventos/reserva. |
| FR-014 | T014–T017,T023 | Diez pares concurrentes mismo tenant y misma persona A/B, conflicto uniforme. |
| FR-015 | T014–T019 | Doble envío y pérdida de respuesta no duplican; huella distinta rechazada. |
| FR-016 | T014–T019 | Editar catálogo/política no cambia snapshots de cita confirmada. |
| FR-017 | T018–T023 | Solo citas propias y detalle persistido, lista vacía explícita. |
| FR-018 | T020–T023 | Agenda asignada vs administrativa y filtros de tenant autorizados. |
| FR-019 | T004–T007,T011,T016,T021,T023,T027 | Matriz A/B/admin-A-barbero-B/inactivo/ajeno. |
| FR-020 | T024–T027 | Instante límite inclusive, fuera denegado, política histórica120 configurable. |
| FR-021 | T024–T027 | Staff asignado/admin activo con motivo; no asignado y motivo vacío denegados. |
| FR-022 | T024–T027 | Evento único, cancelación repetida y carrera con alta sin doble ocupación. |
| FR-023 | T012,T018–T019,T022–T023,T026–T030 | Error/red/conflicto/vacío, retry y datos descartados por cambio de contexto. |
| FR-024 | T013,T019,T023,T027,T030,T032 | Cada flujo real Web/Android; Android→Web y viceversa. |
| FR-025 | T004–T007,T010–T011,T016–T017,T029–T032 | ACL/EXECUTE, JWT, ausencia de secretos, núcleo sin dependencias externas. |
| FR-026 | T004,T007,T011,T014,T016,T020–T021,T024,T027 | SQL/HTTP reales además de dobles y carreras. |
| FR-027 | T030,T032,T034 | Recuperación003 real en ambas plataformas antes de evaluación. |
| FR-028 | T001–T003,T029–T034 | Migraciones/guía/evidencias/avisos y conservación verificables. |

## SC → aceptación

| Criterio | Tareas | Evidencia necesaria |
| --- | --- | --- |
| SC-001 | T019,T023,T032 | Cliente Android→agenda admin Web con mismos datos y dirección inversa, reales. |
| SC-002 | T007,T011,T016,T021,T023,T027 | Todos los casos permitidos/denegados reales, no solo UI. |
| SC-003 | T016,T019,T032 | Diez pares, dos conexiones reales, mismo actor profesional en A/B; rollback/idempotencia. |
| SC-004 | T024–T027 | Límite/fuera/motivo/repetición/carrera y único evento. |
| SC-005 | T013,T019,T023,T027,T030,T032 | Web/Android reales, accesibilidad/contexto, recuperación003 y sin datos ajenos. |
| SC-006 | T001–T003,T029–T034 | Guía comprobada, FR completos y límites explícitos; sin exigir otra persona/nuevo entorno. |

## Matriz SQL/HTTP mínima

Actores: cliente sin membresías; cliente ajeno; admin A/B; barbero A/B; compartido admin-A/
barbero-B; inactivo; admin-profesional; misma persona profesional en A/B; anon/clave pública.
Recursos: barbería visible/borrador/pausada; servicio propio/ajeno/inactivo; invitación
propia/ajena/terminal; cita propia/asignada/no asignada/otrotenant/cancelada.

Obligatorios: RLS enabled; grants por operación, PUBLIC EXECUTE revocado; FKs mixtas fallan;
usuario directo no muta snapshots/rol/status; queries vacías no dan permiso de escribir.
Ensayar elevación por role/user_id/actorId/precio falsos; ninguna metadata cambia autorización.
Comparar mensaje de conflicto propio y de otra barbería, incluidos admin-profesionales:
siempre «Profesional no disponible en ese horario», sin información ni IDs de otra reserva.

Carreras coordinadas por barreras, no sleeps usados como prueba de simultaneidad: mismo
slot; persona A/B; misma requestId; aceptar/cancelar invitación; cambio de servicio/horario/
membresía frente a alta; cancelar frente a alta. SQL transaccional y comprobación final
de filas/eventos; fallo esperado de negocio separado de indisponibilidad de infraestructura.

## Rúbrica y límites

| Criterios | Evidencia prevista y gate |
| --- | --- |
| 1–4 | Spec/plan/modelo/contratos/tareas, decisiones y diagrama de flujo existente. |
| 5–7 | Unitarias/integración, E2E Web/Android, accesibilidad real y estados. |
| 8–9 | Índices/EXPLAIN y concurrencia; no afirmar escalabilidad por listar una tabla. |
| 10 | Origen real autorizado, DNS/CDN/HTTPS/CSP medidos; dominio no inventado. |
| 11 | Caché solo catálogo, TTL/clave/invalidación/aislamiento/rendimiento medidos. |
| 12 | Pipeline con controles ejecutados, secretos protegidos, despliegue separado aprobado. |
| 13 | k6 escenario autorizado,10VU/1min,p95<=2s como meta, errores funcionales0; resultados pendientes. |
| 14–16 | Fuente/migraciones en GitHub solo tras autorización; informe y demostración sustentable. |

Google, pagos, mapas/reseñas/archivos y otros requisitos globales no se declaran cumplidos
por004. Recuperación003 es requisito de evaluación del MVP. Nueve avisos npm moderados,
XSS residual de SPA y permisos/configuración Cloud pendientes deben figurar en el cierre.
