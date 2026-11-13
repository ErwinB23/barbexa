# Modelo de estado — 003

Diseño, no migración SQL. Auth users, Profile, Membership y Barbershop siguen siendo
los de 002; no nuevos roles ni tablas. No copiar User/Session del SDK al núcleo.

## Valores propios

- Identity: userId validado, correo verificado/confirmación y condición no anónima.
  No role global ni autorizaciones derivadas de user_metadata.
- AccountData: Profile existente {userId, displayName, phone nullable}; displayName de
  entrada conforme a validación 002. No sobreescribir perfil con metadata de registro.
- ActiveContext: {userId, barbershopId, membershipId, role barber/administrator}; obtenido
  de membresía activa y barbería permitida. No cambiar los literales de 002 a etiquetas UI.
- SessionView: unión discriminada de estados siguientes, solo datos mínimos para UI.
- AuthFailure: invalid-input, credentials-rejected, confirmation-required, link-invalid,
  rate-limited, network-unavailable, persistence-failed, provider-unavailable. Mensaje propio,
  nunca error crudo del proveedor. Ausencia/denegación de tenant no implica sesión inválida.
- ReturnIntent: destino interno permitido; no URL externa, roles ni identidad seleccionables.

## Máquina de sesión compartida

| Estado | Datos visibles / transiciones |
| --- | --- |
| resolving | Sin datos privados; restore/verify → signed-out, profile-required, ready, recovery o retryable-error. |
| signed-out | Registro/login/solicitud de recuperación públicos; signUp puede producir confirmation-required sin sesión. |
| confirmation-required | Instrucciones sin presumir login; canje confirmado o login posterior → verificación de identidad. |
| profile-required | Actor verificado, pero perfil pendiente; completar datos/reintentar ensure, nunca nuevo signUp; no área ready. |
| ready | Identidad y perfil propios verificados; ContextState se resuelve por separado. |
| recovery | Sesión de recuperación restringida a nueva contraseña/cancelar; no bootstrap de tenant ni uso de área normal. |
| retryable-error | Fallo temporal identificado; sin afirmar acceso validado; reintento dirigido a operación interrumpida. |

Logout incrementa generation e invalida memoria antes de red. Borrar persistencia y frenar
refresh/listeners según contrato; si falla, mostrar persistence-failed sin afirmar cierre
completo. Reintentar limpieza no inicia sesión. Eventos de cuenta anterior no cambian estado.
No guardar contraseñas; tokens/verifier solo dentro de infraestructura y almacenamiento
específico. Recovery reiniciada se restaura como restringida; estado ambiguo no se promueve
a ready. Cancelar/consumir recovery elimina estado y sesión local correspondiente.

## ContextState (solo con ready)

resolving → none (cero autorizadas), choosing (varias sin elección), selected o error.
Exactamente una activa/autorizada se elige automáticamente. Varias ofrecen selección/cambio;
preferencia propia solo se restaura tras consultar membresía y barbería actuales.
Inactivas no candidatas; active no basta si getBarbershop deniega. Una denegación transitoria
de conectividad no se convierte en none ni concede acceso recordado.

Al cambiar: retirar selected y datos dependientes, validar candidato con cuenta/generation
actuales, publicar nuevo contexto completo o error. Nunca conservar privilegio admin-A
durante cambio a barber-B. Ante revocación volver a resolver contexto sin borrar Auth válido.

## Persistencia y aislamiento

Namespace por entorno/proyecto para SDK; selección opcional por userId además de proyecto.
No persistir permisos como autoridad ni datos de otras barberías. Limpieza solo de claves
propias al salir; pestañas Web comparten invalidación local, no sesiones de otros dispositivos.
Verifier/código no aparecen en enlaces internos normales, telemetría o evidencias.
Preferencia de retorno es allowlist validada y sin datos sensibles.

## Invariantes verificables

1. ready implica perfil de la misma identidad verificada y generation actual.
2. selected implica membresía activa propia y consulta de barbería permitida vigentes al resolver.
3. recovery nunca concede entrada normal por un query param/evento aislado.
4. Red fallida no equivale a revocación, ni a autenticación/operación exitosa.
5. Logout/cambio de cuenta impiden publicar respuestas previas aunque lleguen después.
6. Ninguna operación de 003 crea barbería, membresía, rol global o perfil de otro actor.
