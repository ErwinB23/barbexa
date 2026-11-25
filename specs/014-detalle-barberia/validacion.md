# Validación 014 — Detalle de barbería

23/11/2026, America/Lima. Implementación Web y activación SQL autorizada completadas;
revisión visual posterior a la activación y aceptación Android físico pendientes.

## Resultado y reutilización

El detalle existente de Explorar barberías ahora presenta banner, servicios,
profesionales, reseñas vacías y columna de horarios, ubicación y contacto.
Se conservan sidebar, rutas, sesión y motor de reservas. Reutiliza Expo Link,
WorkspaceIcon, SiteIcon, Outfit, la imagen ilustrativa local, descubrimiento,
get_booking_catalog, caché y aplicación de reservas existentes.

Reservar desde un profesional valida su pertenencia al catálogo recibido y lo
preselecciona en el mismo flujo. Elegir servicios compatibles conserva la selección;
uno incompatible la reinicia. Se conserva el bloqueo de una confirmación pendiente
o incierta. La disponibilidad y confirmación definitiva siguen en el servidor.

## Archivos de esta solicitud

- `src/features/reservations/presentation/shop-detail.web.tsx`: composición Web.
- `src/features/reservations/presentation/shop-detail-web.styles.ts`: estilos locales.
- `src/features/reservations/presentation/shop-detail-view.ts`: semana, apertura de Lima,
  cierres, contacto, mapa y filtrado del catálogo.
- `src/features/reservations/presentation/private-home-screen.web.tsx`: monta el nuevo detalle.
- `src/composition/private-home-route.web.tsx`: reintento, reloj, protección al cambiar
  barbería y delegación del profesional al flujo existente.
- `src/features/reservations/application/booking-application.ts`: preselección validada
  y conservación del profesional compatible.
- `src/features/reservations/application/booking-offer-gateway.ts` y
  `src/features/barbershop-operation/domain/types.ts`: metadatos opcionales.
- `src/features/barbershop-operation/infrastructure/operation-http-adapter.ts`:
  decodificación y validación de horarios, cierres y descripción pública profesional.
- `src/features/reservations/presentation/booking-content.web.tsx` y `booking-screen.tsx`:
  delegan la compatibilidad del profesional a la aplicación, sin reiniciarlo siempre.
- `tests/presentation/shop-detail.test.mjs` y
  `tests/integration/booking/commercial-details.test.mjs`: nuevas pruebas.
- Pruebas existentes ajustadas: `booking-application.test.mjs`,
  `private-home-route.test.mjs`, `private-home.test.mjs` y
  `tests/presentation/booking/booking.test.mjs`. Esta última fija el reloj del
  escenario de orden de reservas para eliminar su dependencia de la hora real.
- `supabase/migrations/20261123194353_commercial_shop_details.sql` y
  `supabase/tests/commercial-shop-details.test.sql`: ensayados; migración aplicada en Cloud.
- `scripts/commercial-shop-rehearsal.mjs` y `scripts/commercial-shop-cloud.mjs`:
  ensayo aislado y fases prepare/apply/verify con guardas de destino, respaldo,
  hashes y protección contra repetir la aplicación automáticamente.
- `specs/014-detalle-barberia/` y `docs/CODEX-HANDOFF.md`: alcance y continuidad.

## Verificaciones ejecutadas

- `npm run test:client`: 518/518 aprobadas.
- `npm run typecheck` y `npm run lint`: aprobadas.
- `npm run architecture:check`: aprobado, 261 módulos, 55 del núcleo, 861 aristas.
- `npm run architecture:server`: aprobado, 56 módulos, 33 del núcleo, 158 aristas.
- Pruebas dirigidas de presentación, catálogo, aplicación y rutas: aprobadas.
- Formato dirigido, análisis sintáctico CSS y `git diff --check`: aprobados.
- Exportación Expo Web: aprobada; artefacto ignorado
  `.artifacts/shop-detail-web-build-final`.

Pruebas nuevas cubren límites de apertura de Lima, descansos, cierres globales,
siete días, ausencia de horarios, contactos y búsqueda de dirección seguros,
datos ajenos/inactivos, contratos antiguos y profesional incompatible.

Brave local con sesión existente: detalle de Barber Style observado a 1707,
995 y aproximadamente 503 px. Banner adaptado y tarjetas apiladas en ancho móvil;
sin desbordamiento observado del contenido nuevo. La navegación global estrecha
conserva su desplazamiento horizontal anterior, fuera del alcance solicitado.
Se abrió Reservar desde ERWIN IP y se eligió Corte Fade: el resumen conservó
Barber Style, ERWIN IP, 40 minutos y S/ 15.00. No se confirmó ni creó una cita.
Los enlaces reales tel/WhatsApp/mapa se comprobaron en su construcción y árbol
accesible; no se enviaron mensajes, llamadas ni búsquedas externas.

## Activación Cloud autorizada y verificada

La migración reemplaza la proyección de la función existente
`private.booking_catalog`; añade horarios del local, intervalos de cierres globales
vigentes y descripción profesional ya guardada en 013. Mantiene guardas de actor,
publicación, pertenencia y ACL. No añade tablas, políticas, roles, endpoints ni
escrituras de negocio. Omite motivos privados, identidades de usuarios y bloqueos
personales. No requiere desplegar Edge.

El usuario autorizó expresamente «si lo autorizo vamos» para esta migración014.
Se comprobó el proyecto `vuoncrtkkkquvddunrxx`, región sa-east-1, y sus 20
migraciones anteriores contra los archivos locales. No se reutilizó el permiso013.

Ensayo PostgreSQL17 desechable: sin red, puertos ni montajes de datos del host,
21 migraciones y **12/12 aserciones pgTAP aprobadas**. Los primeros intentos
detectaron dos errores del fixture, no de la migración: `NULL` sin tipo UUID en
UNION y aserciones pgTAP ejecutadas bajo un rol sin acceso a la extensión.
Se corrigieron los fixtures, manteniendo la llamada al catálogo como authenticated.
El contenedor propio se eliminó. Evidencia ignorada:
`.artifacts/barbexa-commercial-1795464340509/report.json` y `commercial-tests.log`.

Respaldo lógico nuevo privado, fuera del repositorio:
`C:/Users/PREDATOR/AppData/Local/Barbexa/backups/commercial-shop-1795464410158`.
Incluye esquema, datos, roles, historial y manifiesto SHA256. Su restauración no
se ensayó; no incluye configuración administrada Auth/OAuth ni archivos binarios
de Storage. No se necesitó cambiar ni desplegar Edge.

Se aplicó exclusivamente `20261123194353_commercial_shop_details.sql`, SHA256
`0614d7292427e079966cbeb41d42968531165d68fedc58cea6dd7ee08b64a2d3`.
Historial **20→21**. Comparación antes/después: 27 tablas protegidas conservan
conteo y hash de filas completas; columnas y políticas sin cambios. Las funciones,
ACL, search_path y SECURITY DEFINER se conservaron; solo cambió el cuerpo de
`private.booking_catalog`. Ejecución anónima sigue denegada y authenticated
conserva la lectura. Registro privado: `verified.json` y `after.json`.

Verificación del catálogo real: una barbería comercial y **14 intervalos**;
horarios, cantidad de cierres globales vigentes y descripción profesional coinciden
con las tablas correspondientes. Registro privado: `catalog-verified-*.json`.
La cuenta de solo lectura de la API administrativa no tiene EXECUTE sobre el RPC
restringido: se verificó mediante conexión propietaria dentro de `BEGIN READ ONLY`,
con contexto de un actor real confirmado, sin cambiar permisos ni datos. Esta
consulta no acredita por sí sola el flujo de sesión del navegador.

La revisión posterior en Brave se interrumpió: Computer Use no pudo determinar
la URL actual con confianza suficiente para aplicar su política. No se insistió
con más entradas. El último estado observado aún mostraba el catálogo anterior;
no se afirma que se haya visto el indicador abierto/cerrado tras recargar.
Pendiente abrir de nuevo el detalle y comprobar visualmente sus horarios reales.
La compatibilidad con catálogos antiguos continúa mostrando «Por confirmar»
cuando faltan metadatos, sin deducir un cierre falso.

No hay almacenamiento comercial de descripción, logo/foto, coordenadas, país,
ciudad, redes de la barbería ni sistema de reseñas en el modelo actual. Se presentan
estados vacíos honestos y avatar ilustrativo; no se confunden las redes personales
del profesional con las del local. El mapa busca la dirección disponible, sin
inventar un pin. Crear dichos campos o un sistema de reseñas requiere otro alcance.

La aceptación en Android físico sigue pendiente; no se generó APK. La vista nativa
anterior se conserva y el ajuste compartido de preselección está cubierto por pruebas.
No se instalaron paquetes ni se hicieron staging, commit o push. El log protegido
de T017 y los fixtures Cloud existentes no fueron alterados.
