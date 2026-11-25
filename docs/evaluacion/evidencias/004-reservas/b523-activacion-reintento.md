# B5 — reintento controlado de activación LOCAL

## B5 — activación LOCAL completada; ensayo Web pendiente

20/11/2026, fecha de sesión (Lima). Corregido el verificador: se retiró su generación
manual del historial con String.replace y se deshabilitó el antiguo bloque de aplicación.
El nuevo preparador scripts/local-closure-migration.mjs es puro: valida bytes SHA256,
LOCAL explícito 127.0.0.1:54422/postgres, 17 versiones anteriores, una sola pendiente y
entorno sin destinos Cloud implícitos. CLI oficial v3.1.0, db push --skip-vault: dry-run
solo anunció 20261121040559_administrative_closure_withdrawal.sql; un único intento
real terminó exit0. El CLI registró el historial; no se insertó/reparó manualmente.

Lectura independiente confirmó 18 migraciones, las 17 filas anteriores intactas y las
22 sentencias de la nueva iguales al archivo aprobado tras normalizar únicamente
terminadores y finales de línea del CLI. SHA256 de la migración sin cambios. Nuevas
RPC list_admin_booking_closures y withdraw_admin_booking_closure disponibles; EXECUTE
solo service_role, sin acceso anon/authenticated. Cero transacciones de activación
abiertas. Cambio de catálogo esperado: 0 tablas, +6 funciones y 4 reemplazos previstos,
+1 trigger, +3 restricciones y +3 índices; políticas RLS sin cambios.

Edge LOCAL real, sin dobles: sesión auténtica de U3 usada solo para verificar lectura;
listado autorizado200, sin sesión401, contexto ajeno403 y RPC privilegiada directa403.
Datos del listado contrastados con PostgreSQL. No se invocó retirada. Sin recarga de
Edge ni reinicios de Auth/PostgreSQL/Metro. Sesión propia cerrada204, cero nuevas
restantes; sesiones previas y credenciales/campos estables Auth intactos. Solo marcas
normales de último acceso Auth pudieron cambiar; no confundirlas con datos de negocio.

Principal conserva 41 reservas/44 detalles, 28care/67care_events/54reservation_events,
14usuarios/13perfiles/14membresías/8barberías/8invitaciones y todas las huellas de negocio,
incluidos cierres anteriores. El respaldo previo está disponible, con SHA256/TOC,
decodificación y ACL revalidados; no sobrescrito ni restaurado. Cloud/Android intactos.
Cinco regresiones RED→GREEN aprobadas; tipos, lint/formato dirigidos y arquitectura exit0.

Los 22 comandos B5.2/B5.3 NO se ejecutaron. Activación técnica lista para preparar su
recorrido con permiso separado y baseline/reloj/disponibilidad frescos. No implica
aceptación Web de retirada ni Chrome: su ejecución positiva sigue pendiente, incluida
inasistencia solo tras condición temporal válida. B5.2/B5.3/B5 permanecen abiertos.
Matriz48: 34 VERIFICADA / 6 SIN VALIDACIÓN INTEGRAL / 4 NO APLICA / 3 BLOQUEADA / 1 PARCIAL.
Evidencia: E004/b523-activacion-reintento.json y .md. Conservar el intento fallido anterior
como antecedente en E004/b523-activacion.json, no repetirlo. No hay permiso de ejecutar
negocio en esta sesión. SMTP administrativo, transferencia, visuales, Android y Cloud
público siguen separados. Detenerse al informe.

[Inventario de archivos, comandos, HTTP y pruebas](b523-activacion-reintento.json).
