# B5.2/B5.3 — resultado de activación LOCAL

## B5.2/B5.3 — activación LOCAL detenida sin cambios persistidos

20/11/2026, Lima. Se verificaron PostgreSQL LOCAL127.0.0.1:54422/proyecto
app-barberia-002-local por TCP y contenedor,17migraciones,dependencias,41reservas/44detalles
y baseline protegido. Respaldo nuevo custom622370bytes verificado por TOC/decodificación
completa y SHA256,ACL solo usuario actual/SYSTEM,conservado sin restaurar ni sobrescribir.
Ubicación privada:.artifacts/b523-execution/before-20261121040559.local.dump.

Un único intento de activación falló en psql(exit3,invalid command\n),sin COMMIT.
Causa demostrada en el generador del verificador:String.replace con reemplazo textual
interpretó las secuencias dólar-apóstrofo de las regex SQL y corrompió el INSERT del
historial. La migración aprobada permanece intacta. No es evidencia de fallo de Auth,
Edge,RLS o del SQL aprobado. Reproducción estática identifica6secuencias; corrección
por callback solo evaluada en memoria,NO aplicada ni reintentada contra PostgreSQL.

Nueva lectura independiente confirmó reversión completa:17migraciones,0columna/0RPC
nuevas,0transacciones abiertas; todas las huellas de datos/esquema/historial/env iguales
al baseline,incluidoAuth.41reservas/44detalles/28care/67careEvents/54reservationEvents;
usuarios/perfiles/propietarios/membresías/pagos/horarios/cierres previos intactos.

**Fase B NO iniciada:0/22 comandos ejecutados.** No se creó B5 Cierre Web LOCAL,servicio,
profesional,cierre,reserva ni inasistencia;Yape no editado,sin restauración necesaria.
Chrome no iniciado,nuevas sesiones0/correos0. Metro yAuth salud200 al preflight; Edge
contenedor en ejecución,sin recarga ni validación auténtica de las nuevasRPC. Cloud,
Android,código deproducto,migración,servicios yGit writes intactos.

Evidencia:E004/b523-activacion.json y .md,con los22comandos identificados como NO EJECUTADO.
B5.2/B5.3/B5 abiertos;matriz48 conserva34VERIFICADA/6SIN VALIDACIÓN INTEGRAL/4NO APLICA/
3BLOQUEADA/1PARCIAL. Próximo paso requiere autorización específica para corregir solo el
verificador/agregar regresión y realizar un único nuevo intento de activación después
de revalidar baseline/respaldo. La Fase B seguirá condicionada a SQL,Edge e integridad
aprobados. No interpretar esta documentación como permiso de reintento.

[Detalle de los22 comandos y comprobaciones](b523-activacion.json).
