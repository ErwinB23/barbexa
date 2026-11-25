# 014 — Detalle comercial de barbería

Creado23/11/2026 por solicitud del usuario y referencia adjunta. Conserva rutas,
sidebar, autenticación y motor de reservas. RediseñoWeb del detalle existente.

## Escenarios y aceptación

- US1(P1): explorar→abrir barbería muestra solo su catálogo comercial real,
  serviciosactivos y profesionalesactivos habilitados, precio/duración y especialidades
  derivadas de capacidades reales. Cambio de barbería o sesión descarta respuestasviejas.
- US2(P1): Reservar utiliza el motor existente; el botón de un profesional lo
  preselecciona tras validar contra el catálogo vigente, sin perderlo al elegir
  un servicio compatible. Confirmación incierta/en curso no se reemplaza.
- US3(P1): siete días y todos los intervalos, apertura deLima y pausas intermedias;
  cierres totales delestablecimiento prevalecen. Backendantiguo = horario desconocido,
  nunca asumir cerrado/abierto. Actualización por minuto y al volver a la pestaña.
- US4(P2): bannerdecorativo con imagen marcada ilustrativa, icono si no hay logo,
  columnas de contenido/información y apilado móvil sin overflow.
- US5(P2): contacto real saneado, teléfono/WhatsApp solo si número válido; enlace
  a búsqueda en mapa por dirección sin pin/coordenadas inventadas. Reseñas, descripción
  y redes comerciales no existen hoy: estadosvacíos honestos, sin enlaces ficticios.

## Requisitos y límites

FR01: reutilizar get_booking_catalog y descubrimiento; ampliación aditiva read-only
delmismo RPC para horarios/cierres y descripciónprofesional ya registrada en013.
No exponer userId, membresías, motivos privados o datos de reservas.
FR02: no crear nuevos servicios/endpoints ni tablas ni permisos/roles.
FR03: no mostrar ratings/reseñas/fotos/ubicaciones ficticias. No confundir lasredes
de un barbero con lasdelestablecimiento.
FR04: carga, vacío, error/reintento, reservaspausadas y bloqueodraft visibles.
FR05: fecha/hora y disponibilidad definitiva se siguen validando enservidor.

## Éxito verificable

SC01: pruebas de aislamientocontextual y payloads pasan.
SC02: aperturaenLima correcta en límites, descanso y cierres; siete díascompletos.
SC03: seleccionarbarbero desde detalle conserva la elección válida hasta slots.
SC04: pruebas/tipos/lint/grafos/Webbuild pasan; UIescritorio/móvil revisada.
SC05: SQL y activación Cloud cuentan con evidencia de autorización específica; nuevas
operaciones requieren su propia autorización de AGENTS.md. Android real pendiente.

## Estado vigente — 24/11/2026

Catálogo comercial y horarios activados en Cloud; interfaces y recorrido funcional
manual Web aceptados por el usuario. Android final sigue pendiente. El enlace externo
por dirección no equivale a mapa con coordenadas, geolocalización ni búsqueda por
cercanía. Imágenes reales persistentes, favoritos y reseñas no están implementados;
los recursos ilustrativos y estados vacíos actuales no los acreditan.
