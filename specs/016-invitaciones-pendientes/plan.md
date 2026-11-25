# Plan 016

Reutilizar tarjetas, details, tokens, helper de orden y bandeja web_notifications.
Campo recipientEmail opcional solo en proyección administrativa de pendientes
profesionales. Fuente Auth email vía SQL privado, sin exponer otros datos Auth.
Puerto opcional remindInvitation y caso de aplicación autorizado; adaptador RPC.
RPC reutiliza authority_assert(team), cierra actor/shop/recurso/rol/estado con bloqueo
de invitación y cooldown. No amplía las capacidades de administradores secundarios.
Sin dependencias, Edge nuevo ni segundos sistemas de invitaciones/notificaciones.
Pruebas de presentación, aplicación, adaptador y SQL preparadas antes de activación.
