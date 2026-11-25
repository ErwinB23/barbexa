# Catálogo de servicios: categorías persistidas y edición compacta

Solicitud: selector de categoría al añadir/editar, formulario Web compacto y menú
con iconos de editar/eliminar. Categorías cerradas: Corte de cabello, Barba,
Tratamientos y Otros. Categoría persistida tiene prioridad sobre inferencia por nombre.

Eliminar significa retirar del catálogo de forma irreversible desde esta UI,
con confirmación; conserva servicios e ítems históricos, precios y reservas.
No permite eliminar si invariantes vigentes de reservas futuras lo impiden.
Solo administrador activo con facultad services del tenant, verificado en servidor.
No cambia autorización ni publicación. Reintentar archivo es idempotente.

Aceptación: categoría persiste en recarga, filtros/conteos la usan, campos compactos
adaptables, iconos con aria-label/title, cancelar borrado no escribe; error no declara
éxito. Android conserva equivalencia funcional de categorías y retiro.

## Aceptación vigente — 24/11/2026

Categorías, edición y retiro activos en Cloud y aceptados en el recorrido manual Web.
El formulario recoge nombre, categoría, descripción, precio y duración, valida los
datos antes de enviar y conserva el borrador ante error. El menú ofrece editar y
retirar con nombres accesibles aunque visualmente use iconos. «Nueva categoría»
no permite crear categorías arbitrarias: el conjunto sigue cerrado. Android final
pendiente; las evidencias de aislamiento y concurrencia son independientes de Web.
