# B5 — evidencia final de cierre Web LOCAL

## B5 — cierre funcional acreditado en Web LOCAL

21/11/2026, 18:06 Lima. B5.2 cerrado y B5.3 se mantiene cerrado funcionalmente Web LOCAL.
B1–B5 terminados en este alcance; se reutilizan sus evidencias anteriores sin repetirlos.
Los 22 comandos de B5.2/B5.3 quedan ejecutados y acreditados íntegramente. La evidencia
pendiente B2 de retirada de oferta queda cerrada (no confundir con repetir el Bloque B2).

Barbería B5 Cierre Web LOCAL validado, UUID f3c7f90f-cb85-4a88-86ce-ec27ec3ba8a6, propietario U3.
Se conservó la retirada anterior HTTP 200, published/v17 → withdrawn/v18, sin repetirla.
Esta continuación ejecutó UNA republicación desde Chrome con sesión GoTrue LOCAL auténtica
de U3: HTTP 200, requestId 9702e255-90f2-4598-a228-ac5c073fbb9c, PostgreSQL published/v19.
Mismo UUID y propietario. Dos transiciones adicionales autorizadas completadas en total.

Solo se corrigió el verificador: el SQL vigente deniega catálogo/slots con P0002/NOT_AVAILABLE,
que PostgREST transporta como HTTP 500. Se exige exactamente esa respuesta, RPC de lectura,
tenant correcto y estado withdrawn; otros 500/códigos/mensajes/payloads se rechazan.
Cuatro regresiones dirigidas aprobadas; sin cambios de producto, SQL, RLS ni Edge.

Chrome cliente en contextos nuevos, sin caché HTTP: retirada ausente en Explorar y Reservar;
catálogo/slots denegados con 500/P0002/NOT_AVAILABLE. Tras republicar reaparece, catálogo y
slots HTTP 200; selección de servicio/profesional y consulta Web de horarios disponibles.
No se eligió ni confirmó una reserva. No se repitió N2 ni ninguna operación anterior.

Lectura independiente final: 42 reservas y 45 detalles, todas sus huellas intactas;
29 atenciones, 71 eventos de atención, 55 eventos de reserva, 14 usuarios, 13 perfiles,
15 membresías y 9 barberías. Pagos, servicios/precios, horarios, cierres, propietarios,
membresías y otras barberías intactos. Cero INSERT/DELETE de negocio. Solo cambió la fila
de settings del tenant objetivo: estado restaurado published y versión 17 → 18 → 19.
Esquema/historial de 18 migraciones/.env.local intactos. Tres sesiones propias cerradas
HTTP 204; cero sesiones nuevas restantes. Sin Cloud, Android, correos, dinero real,
reinicios, instalaciones, migraciones, commit, push ni despliegue.

Trazabilidad de publicación: actor, requestId HTTP y snapshots PostgreSQL/versiones;
el contrato vigente no añade eventos dedicados de publicación. No afirmar dos eventos
SQL nuevos ni crear auditoría paralela. Auditorías existentes, incluida N2, conservadas.

Matriz de 48: **40 VERIFICADA, 0 IMPLEMENTADA SIN VALIDACIÓN INTEGRAL, 4 NO APLICA,
3 BLOQUEADA y 1 PARCIAL**. El cierre funcional Web LOCAL no cierra automáticamente las
tareas académicas conjuntas, Android, aprobación visual pendiente, SMTP administrativo
unknown, transferencia de propiedad, entrega pública/HTTPS/Cloud ni medición inicial/F5.
Evidencia vigente: docs/evaluacion/evidencias/004-reservas/b5-cierre-web-local.md y .json.
El informe b5-retiro-republicacion conserva el intento detenido como antecedente histórico.
Detenerse después del informe; no iniciar otras etapas.


## Comprobaciones reales y regresiones

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Retirada anterior, no repetida | HTTP 200; published/v17 → withdrawn/v18 | requestId 00c32245-6a18-4cbf-bbd8-bb43dbf282d7; informe anterior |
| Ausencia con estado withdrawn | Explorar y Reservar no ofrecen el UUID; listados HTTP 200 sin objetivo | Chrome real con cliente LOCAL, contextos nuevos y caché deshabilitada |
| Denegación de catálogo y horarios retirados | Ambos HTTP 500, cuerpo exacto P0002/NOT_AVAILABLE, details/hint null | Solicitudes directas de lectura a PostgREST; no se interpreta como éxito |
| Republicación única | HTTP 200; withdrawn/v18 → published/v19, mismo UUID y U3 propietario | requestId 9702e255-90f2-4598-a228-ac5c073fbb9c; Chrome + PostgreSQL |
| Reaparición y reserva disponible | Explorar y Reservar ofrecen el UUID; catálogo/slots HTTP 200, horarios visibles en Web | Chrome real, servicio/profesional y fecha seleccionados; ninguna reserva confirmada |
| Integridad posterior independiente | 42 reservas/45 detalles intactos; todas las huellas de negocio protegidas coinciden | Solo SELECT en transacción read-only, 18:06:27 Lima |
| Sesiones propias | Tres logout HTTP 204; cero nuevas restantes | HTTP y PostgreSQL de lectura |
| Regresiones del verificador | 4 aprobadas, 0 fallidas | Dobles y guardas locales; no sustituyen las pruebas reales anteriores |

La longitud/listado de tablas y los resultados HTTP están en [la evidencia estructurada](b5-cierre-web-local.json).
Los operadores y snapshots sin secretos permanecen en .artifacts/b5-republish; las credenciales/tokens
no forman parte de las evidencias. Solo se modificaron verificadores y documentación en esta continuación.
La primera entrada de prevalidación tuvo conflicto de nombre con un guard de un operador antiguo;
se renombró y revalidó sin ejecutar operaciones de negocio ni alterar PostgreSQL.

La expectativa se fundamenta en el SQL existente y el [mapeo oficial de errores PostgREST](https://docs.postgrest.org/en/stable/references/errors.html).
No se modificó el contrato para ocultar un fallo. Una respuesta 500 distinta detiene el verificador.
