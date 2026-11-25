# T033 — DNS/CDN/CSP y carga pendientes

No se cuenta con origen Web de aceptación aprobado ni ejecución k6 acreditada en este
bloque. No se instaló k6 ni se enviaron cargas a localhost, Cloud o proyecto anterior.
No se crea un script presentado como validado cuando falta la herramienta/target.

Para ejecutar: aprobar destino/costos/cuentas/datos de prueba y limpieza, comprobar
HTTPS, resolución DNS, CDN y cabeceras CSP efectivas. Después usar la skill k6 y validar
el script mínimo de catálogo/disponibilidad con10VU/1min, p95<=2s y cero errores funcionales
inesperados. No generar reservas masivas implícitamente ni usar credenciales personales.
Separar confirmación concurrente real de las métricas de carga y de los rechazos esperados.

La medición Node de caché [T028](cache.md) es evidencia local útil, pero **no reemplaza k6**
ni demuestra CDN/escalabilidad bajo carga. T033 permanece abierta.
