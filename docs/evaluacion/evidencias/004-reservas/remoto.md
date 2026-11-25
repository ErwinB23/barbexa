# T032 — preparación pendiente de autorización remota

15/11/2026. No se ejecutó ninguna operación Cloud en este bloque. El proyecto002 conocido
es `vuoncrtkkkquvddunrxx`; no inferir que contiene el negocio004. Proyecto anterior prohibido.

Se conservan cinco migraciones002 y seis migraciones004 nuevas en el repositorio:

1. `20261114195018_booking_catalog.sql`
2. `20261114202045_booking_operations.sql`
3. `20261114220827_booking_catalog_visibility.sql`
4. `20261114224344_booking_atomic.sql`
5. `20261115030159_booking_agenda.sql`
6. `20261115033925_booking_cancellation.sql`

Antes de autorizar aplicación: verificar identidad/objetos/historial remotos, contraste
de las seis versiones y preview de CLI3.1.0, revisar RLS/ACL/EXECUTE/search_path y exposición
de cada objeto. No suponer base vacía; no reparar historial/resetear. Autorizar SQL exacto
y después las funciones Edge004 exactas, por separado. Nada de esto se ejecutó aquí.

Además faltan origen Web/hosting/redirects/CORS/HTTPS/CSP y variables públicas por plataforma,
cuota/costos y prueba de la versión realmente publicada. No fijar LAN como producción ni
incluir service keys en EXPO_PUBLIC. JWT y auth de los handlers deben seguir activos.
La recuperación003 real tiene su gate independiente; no reconfigurar Auth por este documento.

Validación posterior propuesta: inspección estructural, contratos con identidades/datos
sintéticos específicamente autorizados, aislamiento/roles y recorrido final Web/Android.
Ante fallo: detener, inventariar versiones aplicadas/estado Edge y preparar corrección
aditiva revisada; nunca borrar/restaurar toda la base automáticamente. T032 sigue abierta.
