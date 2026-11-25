# Tasks — 009

## Preparación
- [x] T001 Contrastar RF22/HU14, horarios004 y locks en spec.md, plan.md y contracts/schedule.md.
## US1 — Disponibilidad propia
- [x] T002 [US1] Añadir RED de dominio/aplicación en tests/unit/barbershop-operation/self-schedule.test.ts y servidor en tests/server/barbershop-operation/self-schedule.test.ts.
- [x] T003 [US1] Implementar dominio, puertos, aplicación/adaptadores y SQL revisable en src/features/barbershop-operation/, supabase/functions/_shared/barbershop-operation/ y contracts/schedule.sql.
- [x] T004 [US1] Integrar panel Web/Android en src/features/barbershop-operation/presentation/self-schedule.tsx y operation-screen.tsx, con pruebas de controles.
## Validación
- [x] T005 Ejecutar pruebas afectadas, tipos/lint/formato/arquitectura y diff; registrar aquí.
- [x] T006 Aplicar backend LOCAL solo con permiso y acreditar SQL/HTTP, carreras, rollback y revocación.
- [x] T007-W Recorrido manual Web de horarios/bloqueos aceptado por el usuario el24/11/2026.
- [ ] T007 Completar aceptación Android final con datos autorizados; Web ya aceptada.

Componente Web deT007 acreditado20/11 enB4:5comandosChromeHTTP200/SQL;7intervalos propios
modificados/restaurados porvalores, bloqueo nuevo creado/editado/retirado yoferta de
slots coherente encadapaso.40reservas/43detalles/pagos/atención/otros tenants intactos.
IDsdeintervalos renovados legítimamente; noresetearversión. Evidencia004/b4-ejecucion.json.
No repetir estas operaciones. T007 conjunta/Android conserva gate; no prueba manualusuario.

Dependencias T001→T002→T003→T004→T005→T006→T007. T006/T007 no se cierran con dobles.

15/11: RED de módulos/puertos inexistentes y4 pruebas UI ausente (código1). GREEN8
unitarias nuevas,2 integración cliente/SQL estático,4 UI y3 servidor nuevas; ejecución
dirigida con regresiones:11 unitarias,41 integración/presentación,13 Deno, todas código0.
No se ejecutaron nuevas reservas ni pruebas reales009. Tipos cliente/core/servidor,
Deno check de Edge afectado, ESLint y Prettier0. El checker detectó un ciclo de tipos
entre coordinadores; corregido extrayendo OperationScope a operation-scope.ts sin cambiar
comportamiento. Ambos grafos finales0. SQL009 sin aplicar y flag servidor009 false/ausente,
RPC009 ausente comprobada en lectura al verificar008. Sin tocar Metro o datos protegidos.
Diff global2 por log activo;0 excluyendo solo ese log. Archivos nuevos comprobados
directamente por formato y scan local, sin valores secretos detectados. T006/T007 abiertas.

Activación LOCAL autorizada15/11: migración CLI20261115203629_own_professional_schedule
aplicada únicamente en54422,5 funciones nuevas,25 comprobaciones ACL/search_path/presencia
aprobadas y lectura RPC propia correcta. Huellas de todas las filas public/private,
definiciones de columnas y políticas iguales;29 reservas conservadas. Historial previo
anómalo no reparado: se aplicó solo el archivo nuevo y su registro en una transacción.
Primer intento revertido: el operador expandía los anclajes SQL $' al construir una cadena
de reemplazo JS. Verificado rollback sin funciones/historial; compilación SQL con rollback0;
corregido usando callback, aplicación final0. No se cambió el SQL de negocio para ocultarlo.
La primera lectura del operador falló por SELECT FOR SHARE dentro de READ ONLY; corregida
a transacción normal con ROLLBACK para permitir el lock, sin escrituras de negocio.

Edge estaba detenido(exit255,sin OOM). Único inicio autorizado del contenedor existente,
correcto; sin recreación ni otros servicios operados. Conexión009 por composición directa
del gateway, sin cambiar variables del contenedor. Fuente montada finalmente actualizada
sin un segundo inicio. HTTP11/11 con JWT reales existentes: propia200, otro tenant403,
sin membresía profesional403, identidad/profesional manipulados400, sin/inválida sesión401,
Origin ajeno403/aprobado200, OPTIONS204 exacto y RPC directa authenticated403/42501.
El primer test Origin usaba un helper que fijaba localhost; corregido para enviar el
Origin real, sin tocar CORS. Ningún horario/bloqueo/perfil cambiado. T006 conserva pendientes
escrituras/carreras/rollback/revocación bajo permiso separado; T007 física pendiente.

## Actualización final15/11 — A autorizada y ejecutada
T006 cerrada dentro de155 comprobaciones conjuntas008–010, sin repetir suites previas.
JWT reales: lectura propia/A-B, rechazo de otro tenant y membresía revocada; dos solicitudes
de horarios con la misma versión produjeron200/409. División/retirada y restauración de
intervalos propios, creación/edición/retirada de bloqueo propio, rechazo de retirada desde
otro perfil y de horarios/bloqueos que afectarían una cita confirmada. Lecturas antes/después
demostraron rollback de los conflictos.14 intervalos profesionales finales y0 bloqueos nuevos
restantes; los IDs de intervalos reemplazados pueden variar, valores originales restaurados.
Los4 profesionales protegidos/29 reservas y sus dependencias iguales;2 nuevas citas manuales
intactas. Solo conjunto autorizado, sin limpieza. Detalle .artifacts/008-010/manifest.json
ignorado; sin contraseñas/JWT guardados. Estado6/7, T007 física permanece abierta.
