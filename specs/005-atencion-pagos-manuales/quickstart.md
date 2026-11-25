# Quickstart / validación
1. Ejecutar pruebas dirigidas Node/Deno, tipos/lint/checkers sin DB.
2. Revisar contracts/care.sql; pedir permiso específico antes de crear/aplicar migración
local app-barberia-002-local:54422 o actualizar Edge local. No ejecutar borrador por rutina.
3. Tras autorización, probar JWT real/ACL, límites inicio/no-show, cobro/reembolso,
rollback y10 pares concurrentes; fixtures nuevos requieren permiso concreto y límites.
4. Único recorrido final Web→Android: reserva con método, atención y pago independientes,
consulta/recepción/reembolso autorizado. No usar T019/sintéticas sin autorización.
Dobles/bundles no acreditan persistencia, permisos efectivos SQL ni funcionamiento físico.

## Implementación y ejecución15/11/2026
T001–T010: preparación/código y pruebas automatizadas completadas (no E2E).
T011 parcial: migración CLI20261115151745_care_payments.sql validada en rollback y aplicada
por psql al contenedor verificado54422; Edge existente iniciado una sola vez con permiso.
Código servidor en montaje local, sin despliegue Cloud ni reinicio. OPTIONS204/CORS exacto,
POST sin sesión401. SQL11 comprobaciones estructurales y lectura heredada correctas;
13 reservas misma huella,0 filas financieras y0 eventos nuevos.
T011 sigue pendiente: JWT reales positivos, transacciones de pago y10pares concurrentes
requieren fixtures específicamente autorizados. T012 pendiente: recorrido físico y validación de filtros
administrativos por atención/pago (código integrado mediante lecturas autorizadas).
Local Development habilita código005; producción requiere habilitación explícita solo tras
backend correspondiente. No cambios Cloud ni variables secretas. El check general pasó0
con161 unitarias/177cliente/39Deno; suite cliente posterior con dos casosUI Web/Android179/179.
Bundles completos Web/Android200 no sustituyen prueba física. Tipos/lint/formato/grafos0.
Cobertura núcleo cliente100% líneas/funciones,95,44% ramas. No se movió dinero.

Observación final de infraestructura: después de la verificación SQL exitosa y huella
intacta, una nueva consulta Docker no pudo inspeccionar el destino (DOCKER_UNAVAILABLE).
No se repitió inicio/reinicio ni aplicación. Esto no se contabiliza como prueba funcional
fallida o denegación aprobada. Reconfirmar estado antes de cualquier próximo SQL/HTTP.
Bundles Web/Android posteriores a los filtros siguen HTTP200, sin APK ni prueba física.

## Validación real posterior — 15/11/2026
Docker Engine29.9.3 disponible. Únicamente Edge nuevo estaba exited255; se revisaron logs
sin OOM/pánico/error de módulos, causa exacta no acreditada. Un solo inicio autorizado
lo recuperó. Estado final PostgreSQL/Auth/Kong/REST/Mailpit/Edge activos; Auth/REST200 y
Edge OPTIONS204/CORS exacto. Sin otras operaciones de servicios.

Conjunto aislado aprobado:4 cuentas confirmadas sin correo,2 barberías,4 membresías,2
perfiles de la misma persona,2 servicios/vínculos,2 configuraciones por tipo,14 intervalos
por tipo y16 reservas. Se conservan los16 registros; dos manuales siguen confirmed,
atención confirmed y pago pending, con solo evento created. Ninguna limpieza autorizada.

[Resultados reales](real-tests.json):91 comprobaciones HTTP/JWT/SQL aprobadas,10 pares
concurrentes con dos conexiones observadas esperando locks PostgreSQL: un200/un409 por
par y un evento único. Cash/Yape, completar con pending, no-show antes/en10min, rollback,
reembolso total/motivo, idempotencia y roles A/B/inactivo con mismo JWT. Solo membresías
nuevas se cambiaron durante pruebas y restauraron exactamente;13 citas anteriores y
filas originales relacionadas conservadas por huellas. No se movió dinero.

Defecto de código nuevo: deduplicación de peticiones005 no distinguía scope al cambiar
cuenta/contexto; ahora incluye identidad/generación/contexto en la clave. RED1→GREEN,
6 pruebas dirigidas aprobadas; tipos/lint/arquitectura0. No se repitió la batería histórica.
T011 cerrada, T012 pendiente del único recorrido físico/filtros finales Web/Android.
Credenciales/manifest solo en .artifacts/005-care ignorado, no en evidencias. Operadores
care-real.mjs/care-permissions.mjs no forman parte del check automático y rechazan repetir
prepare o permisos sobre un conjunto ya completado. No ejecutarlos por rutina.
