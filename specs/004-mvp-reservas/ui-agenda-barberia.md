# Agenda de la barbería desde Tus barberías

## Solicitud — 24/11/2026
Dar acceso a la agenda general desde la barbería seleccionada en Tus barberías.
Distinguirla de Mi agenda personal y organizar reservas por profesional.

## Criterios de aceptación
- Una tarjeta con nombre y acceso de la barbería seleccionada; solo administrador.
- Elegir otro establecimiento mantiene el flujo de selección existente. No acceder
  a agendas desde una tarjeta que todavía no sea el contexto seleccionado.
- Nombre actual de barbería visible en agenda; servidor conserva autorización.
- Agrupar por ID del profesional (no fusionar nombres iguales), ordenar por hora,
  mostrar conteo del grupo y permitir plegarlo en Web con summary nativo.
- Conservar estados, filtros, acciones autorizadas y límite de200 filas; los conteos
  corresponden a los resultados visibles de la consulta, no a totales globales.
- Android comparte agrupación en secciones. Mi agenda personal no cambia.

## Plan y tareas
- [x] Conectar callback /context → /agenda sin alterar la selección.
- [x] Tarjeta Web y acceso Android solo para administrador seleccionado.
- [x] Agrupación por barberId y orden cronológico en AgendaContent.
- [x] Pruebas rojas y verdes para acceso contextual y agrupación/orden.
- [x] Verificación cliente554/554, tipos, lint y arquitectura.
- [x] Vista aislada del contexto a1260/800/390 sin desbordamiento.
- [ ] Revisar agenda completa y acciones en sesión real Web y Android físico,
  agrupado al recorrido final; no modificar datos solo para capturar pantalla.

No Cloud, migraciones, instalaciones ni recarga del navegador del usuario.
La captura aislada usa datos ficticios y controles simplificados, no acredita E2E.


## Rediseño premium Web — referencia67da982a
Solo AgendaContent Web administrativa adopta AdminBookingCardWeb. AgendaWeb conserva
variante personal anterior; nuevo CSS acotado bx-aa, ancho completo y layout74/26.
Filtros, agrupación/details y orden conservados. Nuevas tarjetas compactas de reserva,
panel atención/pago reutilizando comandos/confirmaciones/guardas existentes. Historia,
reprogramación y cancelación no se reconstruyen. Nombre/código/snapshots reales.

### Métricas y estados
Totales de resultados filtrados, no del día entero. Confirmadas según reserva.
En atención/pagos pendientes solo se calculan cuando todas las filas visibles tienen
CareView consultado. Mientras faltan datos:— y explicación, ninguna consulta adicional.
Los CareViews se acotan a la referencia de filas y descartan callbacks desmontados.
Carga/error/idle no muestran tarjetas ni actividad antigua. Timeline ordenada y con
alto limitado/desplazamiento; leyenda distingue reserva, atención y pago.
Profesionales del selector siguen derivándose de los resultados disponibles del local,
no se afirma tener directorio completo de trabajadores sin reservas.

### Elementos no existentes de la referencia
Notas rápidas persistentes no implementadas: reemplazadas por Gestión de la agenda,
sin botón ficticio ni backend nuevo. Para indicadores globales de atención/pago antes
de consultar detalles sería necesaria una fuente de lectura autorizada adicional;
este cambio no la crea ni añade solicitudes automáticas por cada reserva.

### Tareas y evidencias
- [x] Variante Web aislada y distribución responsive de filtros/indicadores/reservas.
- [x] Leyenda, resumen real y actividad cronológica; contenido no-ready descartado.
- [x] Reutilizar CareControl/RescheduleControl/CancellationControl sin ampliar permisos.
- [x] Pruebas rojas→verdes sidebar/contadores desconocidos, contratos de filtros,
  agrupación/orden, y regresiones pertinentes. Loader prueba admite.tsx.
- [x] Dirigidas32/32; tipos, lint, formato, arquitectura/diff.
- [x] Capturas aisladas1600/1260/800/390 sin overflow. Usa datos ficticios solo artefactos.
- [ ] Revisión visual integrada del usuario y recorrido final sin mutar reservas para probar.

No Cloud, migraciones, Edge/RPC/RLS/Auth, entorno, despliegues, sidebar, Tus barberías,
Mi agenda profesional, Resumen profesional o Mis reservas del cliente modificados.
No recargar navegador del usuario. No ejecutar batería ajena al cambio.

Ajuste posterior autorizado: quitar Reprogramar cita de la agenda general Web.
RescheduleControl conserva historial y recibe canChange=false en esta tarjeta.
Cliente/barbero en otras pantallas no cambian. Regresión roja→verde; dirigidas9/9.

Ajuste: cada reserva es details cerrado al inicio con summary de tienda, estado,
fecha/hora y chevron circular. Cuerpo y acciones quedan dentro, sin consultas por
expandir. Grupos de profesionales siguen independientes. Tipos/lint, dirigidas9/9
y capturas1600/1260/800/390 sin overflow.
