# B5 — últimas comprobaciones LOCAL

## B5 — inasistencia acreditada; B2 sigue pendiente por estado republicado

21/11/2026, Lima. N2 ejecutado UNA vez desde Chrome con sesión auténtica LOCAL de U3,
profesional explícito asignado. Antes de confirmar: reloj17:38:59, elegible desde17:25,
reserva confirmed/atención confirmed/pago pending, tolerancia10, autoridad vigente y
cero no-show previos. HTTP200; después reserva confirmed/atención no-show/pago pending,
efectivo S/30. Web mostró No asistió y Pendiente. Único evento8dc94a00-fd81-4872-aa74-72a220e79cdd,
actor U3, capacidad barber,21nov17:39Lima. No se creó otra reserva ni cambió su horario.
Cita conservada: cda64f3c-b27f-4501-84ee-5f1a8e5f5740,17:15–17:45Lima.

B2 se verificó SOLO por lectura: f3c7f90f-cb85-4a88-86ce-ec27ec3ba8a6 permanece published,
como dejó B3 aprobado. No hay barberías withdrawn en LOCAL. Cliente auténtico: listado
HTTP200 incluye la barbería; catálogo200/publicationState published, visible en Explorar
y ofrecida en Reservar. Es coherente con su publicación actual, NO un defecto de filtrado.
La ausencia durante el estado withdrawn anterior no puede acreditarse retrospectivamente
con estas lecturas. No se repitió retirada/republicación ni se cambió ninguna barbería.
No marcar B2 integral ni B5 cerrado. Para esa evidencia hace falta una traza histórica
válida o una autorización posterior específica para un ensayo reversible; no ejecutarlo.

Lectura final independiente17:39:37:42reservas/45detalles/29care/71care_events/
55reservation_events,9barberías/14usuarios/13perfiles/15membresías. Las42 filas de reserva
intactas por hash, incluidas las41 originales; pagos/atenciones históricas, propietarios,
membresías, servicios, horarios, cierres y todas las demás filas de negocio intactas.
Único delta de negocio de esta ejecución: UPDATE de attendance del ledger de esa cita
+INSERT de su evento no-show. Sin duplicación. Esquema/historial18/.env.local intactos.
Dos sesiones propias cerradas204; cero nuevas restantes. Cloud/Android/migraciones/
producto/diseños/servicios/correos/pagos reales/Git writes no modificados ni ejecutados.

Estado22:22 comandos ejecutados,21 aprobados íntegros yB2 con transición correcta pero
subverificación negativa aún pendiente. Ninguno pendiente de ejecución: NO repetir N2
ni las21 escrituras anteriores. B5.3 cerrado FUNCIONALMENTE WEB en alcance Y1/Y2/N1/N2,
reutilizando evidencias previas sin repetirlas. B5.2 permanece abierto por B2; B5 ABIERTO.
Matriz48:39VERIFICADA/1SIN VALIDACIÓN INTEGRAL/4NO APLICA/3BLOQUEADA/1PARCIAL.
No cerrar005/004 académicas ni Android por este alcance. SMTP administrativo,
transferencia de propiedad, aceptación visual y entrega pública permanecen separados.
Evidencia E004/b5-ultimas-comprobaciones.json y .md. Detenerse al informe.

## Resultado de esta ejecución

| Comprobación | HTTP | Resultado |
| --- | --- | --- |
| B2, solo lectura cliente |200 listado y catálogo |No acreditada ausencia histórica: estado actual published, visible en Explorar/Reservar |
| N2, única inasistencia |200 |Aprobada: confirmed / no-show / pending; una auditoría |
| Cierre sesiones propias |204,204 |Cero sesiones nuevas restantes |

[Detalle de los22 comandos y evidencias](b5-ultimas-comprobaciones.json).
