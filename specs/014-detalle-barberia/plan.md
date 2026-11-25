# Plan014

Detalle comercial con catálogo, profesionales, horarios y contacto del establecimiento.
Presentación adaptable con estados de carga, vacío y error; recursos locales ilustrativos,
sin atribuir fotografías reales ni ubicación exacta a la barbería. Sin dependencias nuevas.

ShopDetailWeb sustituye solo branchshop dePrivateHomeContent (sin hero genérico).
Helperspurospresentación calculan semana/apertura/contacto; estadoactual por minuto.
PrivateHomeRoute delega selección con profesional opcional achooseShop existente;
aplicación valida selección tras await y preserva profesional si servicioscompatibles.
BookingOffer/Catalog amplían metadatospúblicosopcionales para compatibilidad.
Migraciónimperativa extiende private.booking_catalog conservando guardas y ACL.
Pruebas unitarias/presentación/contratos/regresión, ensayo SQL y activación Cloud
acreditados en tasks.md/evidencias. No aplicar otra migración ni operar Cloud por
esta actualización documental; toda operación nueva requiere autorización.

## Estado integrado

La migración de catálogo comercial fue activada el23/11 con autorización específica;
Web aceptada manualmente el24/11. No aplicar otra migración para esta consolidación.
La apertura usa America/Lima aunque el texto de la interfaz no repita esa etiqueta.
No se añaden Storage, coordenadas, favoritos ni reseñas. Android final pendiente.
