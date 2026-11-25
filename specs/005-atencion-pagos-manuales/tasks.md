# Tasks: Atención y pagos manuales

**B5.3 Web LOCAL, cierre vigente 21/11:** Y1/Y2 restauración exacta de instrucciones Yape y tolerancia10 acreditadas; N1 y N2 acreditados en la cita cda64f3c-b27f-4501-84ee-5f1a8e5f5740: confirmed/no-show/pending, una auditoría. No repetir N2 ni crear otra cita. B5.3 se mantiene cerrado; B5.2 y B5 funcionalmente terminados Web LOCAL tras republicación final, 42 reservas/45 detalles intactos. Ver E004/b5-ultimas-comprobaciones.md y b5-cierre-web-local.md. T012/gates académicos y conjuntos permanecen abiertos según sus criterios.

## Phase1 — Preparación
- [x] T001 Consolidar plan/contratos/modelo y trazabilidad FR001–018 en specs/005-atencion-pagos-manuales/plan.md y tasks.md.
## Phase2 — Base compartida
- [x] T002 Preparar RED y núcleo cerrado en tests/integration/booking/care.test.mjs y src/features/reservations/domain/care.ts; identidad/entradas/errores sin framework.
- [x] T003 Preparar SQL aditivo con RLS/ACL/locks/auditoría en specs/005-atencion-pagos-manuales/contracts/care.sql; revisar compatibilidad antes de pedir aplicación local.
## Phase3 — US1 atención
- [x] T004 [US1] Implementar caso/puerto/adapter y dispatch de atención en supabase/functions/_shared/reservations/{application/care.ts,infrastructure/care-adapter.ts,presentation/reservation-handler.ts}; JWT y tiempos servidor.
- [x] T005 [US1] Integrar consulta/transiciones en src/features/reservations/presentation/care-control.tsx y src/composition/reservations-composition.ts con pruebas sin DB.
## Phase4 — US2 selección y consulta
- [x] T006 [US2] Integrar método en confirmación atómica existente y UI de reserva en src/features/reservations/{domain/types.ts,application/booking-application.ts,presentation/booking-screen.tsx}; no rellenar historia.
- [x] T007 [US2] Integrar settings/opciones/lecturas y estados sin registro en src/features/reservations/infrastructure/reservation-http-adapter.ts y presentation/care-control.tsx.
## Phase5 — US3 recepción
- [x] T008 [US3] Validar receive/atestación y reintento reconciliable, pruebas tests/server/reservations/care.test.ts y controles de agenda en src/features/reservations/presentation/care-control.tsx.
## Phase6 — US4 reembolso y configuración
- [x] T009 [US4] Integrar configure/refund con motivo/atestación y controles simples en src/features/reservations/presentation/care-control.tsx y application/care.ts.
## Phase7 — Verificación y gates
- [x] T010 Verificar tipos/lint/formato/checkers y suites afectadas; registrar límites en docs/CODEX-HANDOFF.md sin cerrar pruebas físicas.
- [x] T011 Solo tras autorización: crear migración CLI desde contracts/care.sql, aplicar a LOCAL54422 y actualizar Edge local; probar ACL/JWT/rollback/10pares con fixtures expresamente autorizados, sin T019.
- [x] T012-W Recorrido funcional manual Web de atención y pagos aceptado por el usuario el24/11/2026; no acredita transferencia real de dinero.
- [ ] T012 Completar Android y cotejo de evidencia específica FR/SC de quickstart.md; no repetir Web aceptada ni inferir DB/HTTP por aprobación de interfaz.

Componente Web T012 ampliado20/11 con B5.1: selección Yape desdeChrome201 y recepción
manual ficticia porprofesionalasignado200, cita 11ccc730-9194-4f8e-9007-1b2bd419718e. Cliente ve
Pendiente→Recibido; atenciónconfirmed sin iniciar;2500PENminor/yape; evento receiveúnico
barber;41reservas/44detalles,40previas/pagos/atención/perfiles intactos porhash.6INSERT+
1UPDATE/0DELETE,2sesionescerradas204. Evidencia004/b51-ejecucion.json. No dinero real,
configuraciónYape ni Android acreditados poreste ensayo. T012 sigueABIERTA: completar
ramasWeb pendientes guardarYape/no-show y criteriosAndroid/transversales aplicables;
no repetir cash/Yape/atención/refund ya acreditados. B5globalabierto.

Componente Web deT012 actualizado20/11: B2cash real desdeChrome yJWTGoTrue acreditado,
misma reserva c4e9b153-9275-4a9d-9f32-f009bdb087d9. Confirmación201 previa,receive/start/
complete200 posteriores,hora servidor respetada, estadosfinalesconfirmed/completed/paid.
Misreservas/agenda profesional/filtrosFR014 administrativos comprobados (incluye/excluye/
restaura).37reservas originales/40detalles/pagos/perfiles intactos, total38/41detalles y
care25/events61;evento reserva49. Efectivo ficticio, no dinero real. Evidencia
`docs/evaluacion/evidencias/004-reservas/b2-continuacion.json` enlaza ejecución parcial yfinal.
No repetir esteciclo; T012 conjunta sigue abierta porAndroid ycriterios físicos restantes.
No atribuir nueva recepciónYapeWeb a estecaso cash;91HTTP anteriores se reutilizan.

Dependencias: T001→T002→T003; T004–T009 implementación código tras contratos, pruebas reales
T011 espera autorización y todo el código. T005/T007/T008/T009 comparten control, secuenciales.
Sin paralelismo de mutaciones. SQL research independiente del código cliente. MVP inicial:
atención US1, después US2→US3→US4. Historias no cerradas por código sin backend aplicado.
Cobertura: US1 FR001–004;US2 FR005–007;US3 FR008–010;US4 FR011–012;
transversales FR013–018 T002–T012. SC001/002/004/005 T011/T012;SC003 T011;SC006 T010/T012.

Estado: casillas T001–T010 acreditan preparación/código y pruebas dobles, no operación005 completa. T011 completado con91 comprobaciones reales y10 pares concurrentes, todos aprobados; T012 abierto por E2E y validación real de FR014; filtros administrativos integrados sobre consultas autorizadas, sin caché de permisos. Ver quickstart.md para resultados y limitaciones.

15/11/2026: conjunto005 autorizado creado una sola vez y conservado:4 cuentas,2 barberías,4 membresías,2 profesionales de una persona,2 servicios,16 citas.13 reservas anteriores y sus dependencias sin cambios. Dos citas manuales sin atención/cobro/cancelación. Ver real-tests.json; T012 permanece abierta.
