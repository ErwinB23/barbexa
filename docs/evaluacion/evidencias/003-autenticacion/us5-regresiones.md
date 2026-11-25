# T032 — regresiones técnicas y gate físico pendiente

15/11/2026. `npm run check` integrado con004 terminó0. Incluye pruebas no mutantes de
registro/confirmación, login/logout, sesión, contexto, propósito PKCE y formularios de
recuperación;157 unitarias y160 integración/presentación. [Log y códigos](../004-reservas/t028-t029/check-final.json).
La fuente de las cuentas/roles de otras historias no se volvió a crear ni se alteró.

[Pruebas nuevas dirigidas](us5-regresiones.log):9/9, canje/propósito/binding, rate limit,
network/storage, session distinta, cancelación, parser y consumidor único Web/native.
[Bundles Metro completos](us5-bundles.json): HTTP200 Web y Android. Sin build/APK, reinicio
ni atribución a Hermes físico. Después se ajustaron solo mensajes de validación; tipos,
lint, formato y pruebas de presentación afectadas volvieron a pasar.

La evidencia de regresión física anterior (registro, sesión/contexto, reservas/agendas,
F5 y retorno de pestaña/app) se conserva. **No equivale a recovery física nueva**. Faltan
correo real, cambio de clave/login y variantes SC-005 en Web/Android; por eso T032 sigue
abierta. El recorrido integral final agrupa esos casos, sin repetir los anteriores.
