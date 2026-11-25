# Única comprobación pendiente de agendas — sin nuevas reservas

Usar solo las3 cuentas locales confirmadas del archivo ignorado
.artifacts/004-client/credenciales-locales.json. No compartir credenciales. No prepare,
limpieza, registros, correos ni nuevas citas. Recargar interfaces para recibir el JS nuevo,
sin reiniciar Metro ni generar APK. Usar las reservas Web/Android ya confirmadas.

1. Android cliente: abrir Mis reservas y tomar el código/fecha Lima/profesional/total de
   la cita que ya creaste desde Android. No crear otra. Web normal administradorA:
   Mi cuenta→seleccionar A si procede→Consultar agenda (http://localhost:8081/agenda).
   Introducir exactamente esa fecha y pulsar Consultar/actualizar. Esperado: misma cita,
   código/hora/profesional/total; filtros confirmadas y Solo profesional A la conservan.
2. Inmediatamente Android: entrar con administradorA, contexto A, Consultar agenda,
   misma fecha. Debe aparecer también la cita ya creada desde Web con el mismo código,
   hora y total. El administrador A es además profesional activo: Solo profesional A
   muestra sus citas sin hacerlo administrador de B. No cambiar membresías desde SQL.
3. En ambas plataformas: comprobar filtro canceladas/vacío, volver a confirmadas y
   actualizar; campos/botones legibles y utilizables, sin recortes. Cambiar pestaña/app
   y volver, y F5 en Web: conservar ruta y consultar sin excepción. Atrás funciona.
   AdministradorB tiene solo B: agenda B válida/vacía, no agenda A ni datos privados A.

Confirmar resultados Web/Android y coincidencia de las dos citas existentes, sin datos
personales ni credenciales. Codex ya acreditó por HTTP real los escenarios barbero puro,
no asignado, adminA/barberoB y revocación con restauración exacta; no repetirlos modificando
datos para este recorrido. Esas pruebas no se presentarán como uso físico de la interfaz.
T023 continúa pendiente hasta revisar la evidencia real contra su criterio completo.
T013 mantiene separado su recorrido de oferta/invitaciones todavía no acreditado.
