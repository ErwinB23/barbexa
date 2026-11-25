# Tasks — 010

## Base
- [x] T001 Contrastar RF18/HU11/RF27 y documentar decisiones aprobadas en spec.md, plan.md y contracts/reschedule.md, incluida la excepción de personal con motivo.
## US1 — Reprogramación propia
- [x] T002 Añadir RED del dominio, doble envío, incertidumbre, scope, contrato HTTP y handler en tests/integration/booking/reschedule*.test.mjs y tests/server/reservations/reschedule.test.ts.
- [x] T003 Implementar tipos/puertos, aplicación y adaptadores cliente/servidor en src/features/reservations/ y supabase/functions/_shared/reservations/, sin activar backend.
- [x] T004 Integrar RescheduleControl en Mis reservas y composición opt-in, con pruebas de presentación Web/Android en tests/presentation/booking/reschedule.test.mjs.
## US2 — Política y backend definitivo
- [x] T005 Precisar alcance de personal; implementar política/editor administrativo, SQL transaccional e historial en contracts/, con pruebas RED de conservación financiera, conflictos y permisos. No aplicar sin autorización.
- [x] T006 Activar backend LOCAL y acreditar SQL/HTTP reales, carreras por persona entre barberías, idempotencia/rollback y conservación de condiciones, solo con autorizaciones de migración/Edge/datos.
## Verificación
- [x] T007 Verificar código actual con pruebas dirigidas y controles de tipos/lint/formato/arquitectura; registrar aquí sin afirmar cumplimiento de SQL pendiente.
- [x] T008-W Recorrido funcional manual Web aceptado por el usuario el24/11/2026.
- [ ] T008 Completar Android físico y cotejo de evidencia específica FR-001–007/SC-001–003; no repetir Web aceptada.

Dependencias T001→T002→T003→T004; T005 depende de decisiones y precede T006; T008
requiere T006/T007. T007 acredita únicamente el código implementado, no cierra T005/006.

Histórico del primer GREEN15/11: RED7 módulos ausentes,1 método HTTP ausente,2 UI ausentes y tipos de servidor
ausentes; GREEN14 pruebas nuevas con dobles (8 núcleo/HTTP,2 UI y4 servidor). Regresiones
dirigidas:51 cliente/presentación y13 servidor, código0; tipos cliente/core/servidor,
Deno check, lint y ambos grafos0. Formato aplicado únicamente a archivos afectados.
Backend SQL010 sin preparar/aplicar; ninguna reprogramación real ni dato nuevo creado.
Flags EXPO_PUBLIC_ENABLE_RESCHEDULE y BARBERIA_ENABLE_RESCHEDULE false/ausentes reales.

Avance posterior del mismo bloque: motivo normalizado, editor administrativo y consulta
de historial incorporados a aplicación/adaptadores/handler/UI, con nuevas RED→GREEN.
SQL010 revisado y autorizado: migración CLI20261115210802_booking_reschedule aplicada
SOLO LOCAL54422.2 tablas privadas vacías,5 auxiliares INVOKER cerradas y5 wrappers DEFINER
service_role/search_path vacío. Compilación inicial en transacción revertida0; aplicación0;
68 comprobaciones estructurales/ACL/RLS0. Todas las filas previas public/private, columnas y
RLS iguales;29 reservas intactas. Historial anterior incompleto no reparado ni db push usado.

Edge reservation-command conectado sin variables/reinicio.13/13 HTTP reales con JWT:
política propia/historial/slots200, ajena404, política ajena/cliente no administrador403,
identidad manipulada400, care read anterior200, sin/inválida sesión401, Origin ajeno403,
OPTIONS204 exacto y RPC directa authenticated403/42501. Primer selector de lectura usó
alias SQL reservado day y se corrigió en el operador, sin cambiar la migración. Worker
devolvió400 inicialmente y después recogió el código actualizado, sin reinicio adicional.

T005 conserva pendiente acreditar exhaustivamente ramas de escritura/política/historial;
T006 solo parcialmente acreditada por activación/lectura: faltan reprogramaciones, carreras,
rollback, límite/motivo, estados de atención/pagos e idempotencia reales con datos autorizados.
No se invocó set-policy/reschedule ni se crearon fixtures. UI real permanece opt-in desactivada.

Verificación final del bloque ampliado:56 cliente/presentación y17 servidor dirigidas,
todas código0 (incluye regresiones009/004/005, no repite suites reales19/91).20 pruebas
nuevas010:11 núcleo/HTTP/SQL estático,4 UI Web/Android con dobles,5 servidor. Tipos cliente/
core/servidor, Deno check ambos Edge, ESLint y formato0. Ambos grafos arquitectónicos0.
No atribuir las verificaciones estructurales/lecturas a pruebas de reprogramación real.

## Actualización final15/11 — A real autorizada
T005/T006 acreditadas.155 comprobaciones conjuntas008–010 y10 pares de reprogramaciones
entre dos barberías de la misma persona, observados en2 conexiones PostgreSQL por par;
201/409, replay200 sin duplicación, rollback del perdedor y conservación financiera.
Antelación120/60, límite inclusivo, motivos/excepciones administrador/barbero asignado,
aislamiento, historial, fecha esperada obsoleta y estados incompatibles acreditados con
datos nuevos autorizados. Detalle y fallo/corrección del ejecutor en quickstart.md;
manifest local ignorado .artifacts/008-010/manifest.json.13 eventos de reprogramación,
9 de reserva y15 care; ninguna cita protegida alterada.2 citas nuevas manuales intactas.
Estado7/8: solo T008 física abierta; flags cliente no se activaron ni se probó Android físico.
