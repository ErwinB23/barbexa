# Tasks — 008

## Base
- [x] T001 Delimitar RF21/HU14, modelo y contrato en spec.md, plan.md y contracts/profile.md.
## US1 — Perfil profesional propio
- [x] T002 [US1] Añadir RED de puerto/comandos/actor/scope en tests/integration/booking/self-professional.test.mjs y tests/server/barbershop-operation/self-professional.test.ts.
- [x] T003 [US1] Implementar núcleo/adaptadores cliente y servidor en src/features/barbershop-operation/ y supabase/functions/_shared/barbershop-operation/; preparar contracts/profile.sql sin aplicarlo.
- [x] T004 [US1] Integrar panel Web/Android en src/features/barbershop-operation/presentation/self-professional.tsx y operation-screen.tsx; probar controles.
## Validación
- [x] T005 Ejecutar pruebas dirigidas, tipos/lint/formato/arquitectura y revisión SQL estática.
- [x] T006 Aplicar backend LOCAL con autorización y comprobar SQL/HTTP de propiedad/revocación/tenants.
- [x] T007-W Recorrido funcional manual Web aceptado por el usuario el24/11/2026.
- [ ] T007 Completar aceptación Android física de quickstart.md; no repetir Web aceptada.

Componente Web deT007 acreditado20/11 enB4: profesional0050, Chrome real, nombre propio
temporal/restauración exacta mediante2HTTP200 ySQL; persistencia tras navegación, otro
perfil/permisos/servicios/citas intactos. Versioneslegítimas deoferta conservadas. Evidencia
`docs/evaluacion/evidencias/004-reservas/b4-ejecucion.json`. No repetir. T007 conjunta/
Android sigue abierta; no atribuir estas pruebas automatizadas alusuario.

Dependencias T001→T002→T003→T004→T005→T006→T007. T006 acreditada en el conjunto
aislado autorizado; T007 física sigue pendiente. Sin avance ficticio de003–005.

Resultados15/11: RED4 cliente/SQL ausente,2 UI ausente y contrato Deno sin métodos;
GREEN4 cliente/SQL estático,2 UI y2 servidor nuevas (código0). Cliente/servidor usan
dobles: no demuestran RLS o locks ejecutados.10 pruebas Deno dirigidas con regresiones
de comandos/handler aprobadas. SQL revisado con locks de settings→membresía→perfil,
wrappers DEFINER solo service_role y privada INVOKER no invocable directamente por ese
rol; no SQL ejecutado. Panel consulta por acción explícita y diferencia no consultado
de ausencia verificada. EXPO_PUBLIC_ENABLE_SELF_PROFESSIONAL false por defecto.
Sin modificación de perfiles/29 reservas, migración aplicada o actualización Edge.

Verificación conjunta007/008:53 unitarias,78 integración/presentación y10 servidor
dirigidas aprobadas (código0). Tipos cliente/core/servidor, Deno check, lint, formato y
arquitectura0. El panel no hace setState sincrónico desde un efecto: consulta explícita,
sin afirmar ausencia antes de consultar. SQL solo inspección estática; T006/T007 abiertas.
Diff global2 exclusivamente por log protegido; excluyéndolo,0. Sin operaciones Git de escritura.

Activación LOCAL autorizada15/11: migración CLI20261115171232_own_professional_profile
aplicada en transacción a app-barberia-002-local:54422, registro solo de esta versión.
15 comprobaciones estructurales/ACL/search_path (5 por función), lectura RPC200 con actor
de servidor; no es una sesión JWT del usuario. Edge activo con fuente montada/per_worker,
sin reinicios; HTTP sin sesión/inválida401 y OPTIONS204 con Origin exacto. Huellas antes/
después iguales para29 reservas y7 conjuntos relacionados. No nombres editados ni fixtures.
T006 sigue abierta: faltan escritura y autorización con JWT real/A-B/revocación bajo permiso
específico de datos; T007 física pendiente. No habilitado el flag cliente real de008.

Anomalía previa: historial CLI no registra agenda/cancelación/care ya presentes; se evitó
db push para no repetirlas. No repair ni registros históricos añadidos. Ver quickstart.md.

Inspección de dependencias15/11: solo4 perfiles profesionales, todos de conjuntos protegidos
con reservas(8,11,2,8;29 total). No existe perfil acreditado como prescindible. Usuario
decidió mantener pendiente la escritura: no editar nombres ni incrementar versiones de
oferta. Ningún perfil modificado; T006/T007 siguen abiertas. El backend/lectura acreditados
se conservan; futuro perfil aislado requerirá autorización específica, no se creó ninguno.

## Actualización final15/11 — A autorizada y ejecutada
T006 cerrada: conjunto nuevo008–010 de4 cuentas/perfiles,2 barberías,4 membresías,
2 profesionales,2 servicios/vínculos y8 reservas.155 comprobaciones conjuntas aprobadas,
no155 casos exclusivos de008. Lectura/edición propia y duplicado del mismo nombre por
HTTP/JWT reales; rechazo de otro tenant y payload con identidad manipulada; revocación
de membresía detectada con el JWT vigente y restauración exacta de la fila nueva.
Nombre original del profesional nuevoA restaurado, profesionalB intacto y versiones
modificadas solo de la oferta nueva. Los4 perfiles protegidos y las29 reservas/dependencias
anteriores permanecen idénticos. Sin limpieza ni credenciales persistidas.
Fuente detallada local ignorada: .artifacts/008-010/manifest.json. Los2 registros de reserva
manuales nuevos se conservaron sin operaciones posteriores. No se ejecutó recorrido físico.
Estado6/7; T007 abierta. Las anotaciones anteriores son históricas, no permisos para repetir.
