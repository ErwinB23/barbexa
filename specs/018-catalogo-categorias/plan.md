# Plan

Extender Service con categoría y archived opcionales para lectores heredados.
Conservar upsert existente y sus controles; aceptar metadatos cerrados adicionales.
En PostgreSQL, columnas tipadas con CHECK; helper privado SECURITY DEFINER
de upsert toma mismo lock de
barbería y autoridad, delega escritura a booking_command, actualiza metadatos en
misma transacción. Constraint impide reactivar archivados desde otras rutas.
RLS y grants existentes sin ampliación. Backfill conserva agrupación por nombre.
Categoría solo requerida por UI nueva, comandos previos conservan categoría.
Consulta administrativa usa columnas existentes+opcionales por select=* y filtra
archived; catálogo de clientes ya excluye active=false. Sin borrado físico.

Entrada pública SECURITY INVOKER delega al helper; solo service_role ejecuta ambas,
sin conceder acceso directo a tablas. Activación autorizada24nov tras rechazo real:
migración aplicada y barbershop-operation v7 JWT activo. Backup de esquema/datos/roles/
historial/Edge previo; pruebas DB aislada y smoke Cloud revertido verificaron rollback,
permisos cruzados, concurrencia, reservas futuras y archivo repetido.
