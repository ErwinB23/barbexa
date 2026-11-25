# B5.2 — Retirada lógica de cierres administrativos

20/11/2026, America/Lima. Implementación preparada y ensayada en aislamiento; **no activada en LOCAL principal ni aceptada desde Chrome real**. No ejecutar aún el ensayo22.

Contrato definitivo en [booking.md](../../../../specs/004-mvp-reservas/contracts/booking.md). Inventario completo de28 archivos, comandos, resultados, incidencias y límites en [b52-retirada-cierres.json](b52-retirada-cierres.json).

- Conserva cierre original, fechas, motivo y tenant; retirada con motivo obligatorio, una auditoría existente team_authority_events y referencia withdrawal_event_id. No borrado físico ni tabla paralela.
- Replay200 conserva el evento original, sin nueva escritura. Dos conexiones SQL reales: espera de bloqueo observada, primera replayed=false/segunda=true, una transición y un evento. Permisos actuales owner/secundario editHours; cliente/profesional403 y cierre ausente/ajeno al contexto autorizado404.
- Disponibilidad, reserva atómica y reprogramación excluyen solo el cierre retirado; persisten bloqueos personales, otro cierre, reserva y horarios. Prueba adicional de confirmación sintética dentro de la franja liberada terminada en rollback. Historial y paginación100+11 acreditados.
- Panel Web /schedules: historial, selección, motivo, confirmación, carga/error/éxito, doble envío y reconciliación ante incertidumbre. Sin cambios visuales aprobados ni Android. Sin RPC aplicada, muestra error de consulta recuperable, no éxito.

## Pruebas ejecutadas

| Frontera | Evidencia | Resultado |
| --- | --- | --- |
| PostgreSQL17.11 real | Base separada b52_closures_927732ba3dad4ef2, OID124517, cinco actores sintéticos,17migraciones históricas+la nueva |16 grupos y concurrencia aprobados |
| Edge + SQL real | Request/Response reales de handler/adaptador; **Auth y transporte PostgREST con dobles**, sin Edge desplegada |401/403/403/404/200/200; un evento |
| Cliente | Suite local no mutante |440 aprobadas,0fallos |
| Servidor | Suite Deno local no mutante |72 aprobadas,0fallos |
| Calidad | Tipos cliente/servidor,lint cliente/servidor,formato,grafos arquitectura,Deno check |exit0 |
| Principal LOCAL | Lectura repeatable-read/read-only, comparaciones de todas las huellas incluyendo auth.users, esquema/historial/env |41reservas/44detalles intactos;17migraciones,0nuevasRPC/columna |

Base desechable eliminada; cero filas Auth copiadas, sin servicios nuevos/reiniciados. Principal mantiene28care/67care_events/54reservation_events,8shops/14users/13profiles/14memberships/8invitations/5invitationMail. No sesiones/correos/cuentas/reservas nuevas en principal. Cloud no utilizado.

## Activación y aceptación pendientes

Nueva migración:20261121040559_administrative_closure_withdrawal.sql. Revisión/aplicación LOCAL requiere autorización específica; no aplicar a Cloud. Comprobar después ACL/RPC/Edge LOCAL antes de autorizar escrituras del ensayo22. No cambiar migraciones históricas ni reaplicarlas a principal.

Comando futuro16:withdraw-shop-closure con el ID persistido del cierre nuevo, requestId y motivo; conservar la fila withdrawn y exactamente un team_authority_event, nunca borrar la excepción ni sumar care_event. Los22 comandos están preparados en código/contrato; aún no habilitados en principal ni ejecutados. Nueva barbería B5 Cierre Web LOCAL NO creada. Los42/45 finales siguen siendo una previsión condicional, no conteos actuales. Revalidar baseline y obtener autorización de esas escrituras antes del ensayo.

Matriz48:34verificadas/6implementadas sin validación integral/4noaplica/3bloqueadas/1parcial. No cierra B5 ni004 completa. Mantener separados SMTP administrativo, transferencia, Android, Cloud público, aceptación visual y gates académicos.
