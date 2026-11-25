# Decisiones — 008

`professionalName` ya pertenece al modelo004; no añadir campos no especificados. El
upsert administrativo incluye userId/active y no se relaja. El comando propio los rechaza
y obtiene el registro con usuario verificado+barbería. No permite crear perfil o permisos.
La autorización exige perfil profesional activo y membresía vigente de esa barbería.

Tablas/índices y helper booking_actor existentes se reutilizan. Fuente: RF21/HU14 y
migraciones004. RLS no se modifica. No se promete integración real de funciones no aplicadas.
