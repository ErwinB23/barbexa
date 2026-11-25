# Conjunto aislado008–010 — autorizado y ejecutado en LOCAL

Solo app-barberia-002-local:54422. Ninguno de los4 perfiles actuales es prescindible.
No reutilizar los conjuntosT019/005 ni sus29 citas. Solicitar autorización antes de crear.

La propuesta inferior fue autorizada y ejecutada15/11. Se conserva como alcance histórico;
NO volver a preparar ni crear otro conjunto. Resultado final al pie de este documento.

| Entidad | Cantidad exacta propuesta |
| --- | --- |
| Cuentas Auth confirmadas sin correo / perfiles personales | 4 / 4: administradorA, administradorB, profesional compartido, cliente |
| Barberías | 2 nuevas, A y B |
| Membresías | 4: adminA→A, adminB→B, profesional→A y→B |
| Perfiles profesionales | 2, la misma persona en A/B |
| Servicios / vínculos profesional-servicio | 2 / 2, uno por barbería |
| Configuraciones booking / care / reprogramación | 2 / 2 / 2, solo los establecimientos nuevos |
| Intervalos generales semanales | 14 (7 por barbería) |
| Intervalos profesionales semanales | 14 iniciales/finales; máximo15 simultáneos al probar división/retirada de un intervalo |
| Bloqueos | 2, máximo simultáneo; creación/edición/retirada propias de009 |
| Reservas / detalles / ledger care | 8 / 8 / 8; un servicio por reserva |
| Nuevas invitaciones | 0; no se incluye011 en esta autorización |

Las dos filas de política de reprogramación se materializarían mediante la configuración
de las barberías nuevas durante estas pruebas; hoy el backend usa120 por defecto sin
crear filas. Todas las cantidades son una propuesta pendiente de autorización.

Valores exclusivamente sintéticos: ambas barberías y ambos profesionales tendrán un
intervalo08:00–20:00 America/Lima por cada día0–6 (480–1200 minutos). La edición de009
dividirá temporalmente un día en08:00–12:00 y12:00–20:00, de ahí el máximo15 intervalos
profesionales simultáneos; al terminar volverán los14 intervalos iniciales. Reemplazar
horarios puede generar IDs nuevos e incrementar versiones solo de estas barberías.
Hasta2 bloqueos propios, de60 minutos, en huecos sin citas: crear, mover y retirar.

Configuraciones por barbería nueva: publicación published tras preparar oferta, aviso
mínimo0 minutos, horizonte30 días, máximo20 citas futuras por cliente, paso15 minutos,
buffer0 y cancelación120 minutos. Servicio único de30 minutos y20 PEN; edición temporal
del precio únicamente en estos servicios para comprobar snapshots de reservas previas.
Care: tolerancia10 minutos e instrucciones Yape «SIMULACIÓN LOCAL; no transferir dinero».
Reprogramación:120 minutos iniciales, prueba temporal de60 y restauración a120.
Contacto/dirección/nombres serán ficticios sin teléfonos ni datos personales reales.
Estas configuraciones NO son nuevos valores predeterminados del producto.

Fechas base: D es la fecha Lima de ejecución+2 días. Horarios iniciales deR1/R2:
A D10:00/B D11:00; R3 A D+1 12:00; R4 A D+2 10:00; R5 B D+2 11:00;
R6 A D+3 10:00; R7 A D+4 15:00 yR8 B D+5 15:00. Duración30 minutos y sin buffer.
Las seis primeras se reutilizan para casos/carreras en huecos libres del horizonte.
Solo ellas pueden recibir ajustes controlados de timestamps para límites/estados.
No se toca el reloj del sistema. Antes de cada cambio se verifica que sus IDs son propios.

Reservas1–2: efectivo/Yape confirmados, conservación de precio/pago y diez pares de carreras
entre barberías, reutilizando solo esos dos IDs con targets nuevos; idempotencia/conflicto.
Reserva3: antelación120/60, límite inclusivo, motivo del personal y permisos actuales.
Reserva4: pago pendiente, atención iniciada/completada y rechazo de reprogramación.
Reserva5: inasistencia y rechazo. Reserva6: cancelada y rechazo. Reservas7–8: intactas para
recorrido final, sin cobrarlas, reprogramarlas, completarlas ni cancelarlas automáticamente.
La hora controlada afecta únicamente a las seis reservas de automatización, nunca al reloj.

008 usará exclusivamente el profesionalA nuevo: guardar/restaurar nombre, comprobar B
intacto y versiones técnicas solo de este conjunto.009 editará/retirará sus propios
intervalos/bloqueos, restaurará intervalos iniciales y probará conflictos con citas nuevas.
Permisos/revocación cambiarán temporalmente solo membresías nuevas, con restauración exacta.
Configurar políticas y variar precio/oferta únicamente en estas barberías nuevas; las citas
conservan snapshots. Los eventos/detalles derivados se identificarán por los ocho IDs.
Tope previsto:16 eventos nuevos de reprogramación,9 de reserva y15 de care, sin repetir005.
Si una prueba exige exceder los límites, detenerse y solicitar ampliación antes de actuar.

Antes/después: cotejar huellas de29 reservas y todas sus dependencias, identificar IDs del
conjunto y no ejecutar prepare existente ni limpieza. Conservar conjunto al terminar.
Credenciales solo en memoria para automatización; archivo local ignorado en.artifacts
únicamente si se autoriza expresamente para el recorrido final. Nunca imprimir claves/JWT.

## Resultado real — A
155 comprobaciones conjuntas aprobadas;10 pares concurrentes por HTTP/JWT observados en
dos conexiones PostgreSQL por par. Cada par produjo201/409; replay200 sin otro evento,
rollback exacto del perdedor y sin doble ocupación entre barberías para la misma persona.
Precio/servicios/profesional/identificador y pagos cash/Yape confirmados se conservaron
incluso al editar el precio de oferta nueva. Política120→60→120 aislada; cliente fuera
de plazo rechazado, excepción administrativa y profesional asignado con motivo, límite
inclusivo por reloj servidor y rechazo del siguiente milisegundo; historial contextual.
Citas iniciadas/completadas, con inasistencia y canceladas rechazadas. Pago pendiente
con atención completada conservado; fecha esperada obsoleta no alteró la reserva.

Primer intento se detuvo después de114 comprobaciones por un error del ejecutor: fecha
sintética con microsegundos no representable en el contrato de milisegundos, resultando
un conflicto previo al rechazo esperado de política. Diagnóstico SQL revertido confirmó
la política correcta. Corregido solo el ejecutor con date_trunc('milliseconds',...);
se retomó el mismo conjunto, sin repetir preparación ni los10 pares. Para retomar, se
regeneraron únicamente las credenciales de las4 cuentas nuevas por Auth oficial y solo
en memoria; no se guardaron claves/JWT ni se alteraron cuentas protegidas.

Final:4 cuentas/perfiles,2 barberías,4 membresías,2 profesionales,2 servicios/vínculos,
2 settings de cada tipo,14 intervalos generales y14 profesionales,0 bloqueos remanentes,
8 reservas/detalles/care;13 eventos de reprogramación,9 de reserva y15 de care. Todo dentro
de los topes. Las2 citas manuales sin operaciones posteriores y las29 anteriores con sus
dependencias idénticas.37 reservas totales. Conjunto conservado, sin limpieza.
Manifest/IDs/checklist local ignorado: .artifacts/008-010/manifest.json; no ejecutar el
operador run de nuevo. El recorrido físico y el acceso futuro a credenciales requieren
preparación autorizada: no se creó un archivo de contraseñas para facilitarlo.
