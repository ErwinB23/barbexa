# Research
Decisión: atención y pago en registros asociados, sin backfill; alternativa de convertir
confirmed en pagado descartada por falsificar historia. Settings por shop,10min iniciales.
Decisión: reusar reservation-command y su Auth/CORS; no otra autenticación ni backend.
Decisión: confirmación con método en una RPC que envuelve motor004, ledger y snapshot en
misma transacción. Nunca crear reserva y luego pago mediante dos llamadas.
Decisión: identidad del Edge, permisos actuales SQL; service_role solo transporte.
Fuentes: código/migraciones004 y documentación oficial RLS consultada15/11/2026:
https://supabase.com/docs/guides/database/postgres/row-level-security
Changelog https://supabase.com/changelog.md consultado; no dependencia nueva/upgrade.
Riesgos: coexistencia con cancelación, locks ordenados, reintento incierto; SQL real debe
validarlos. Nueve avisos npm siguen pendientes. No proveedor financiero ni dinero movido.
