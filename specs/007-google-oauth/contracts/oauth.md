# Contrato — 007

Aplicación: signInWithGoogle(), cancelGoogle(); sin correo, rol, tenant ni redirect arbitrario.
Adaptador: signInWithGoogle abre únicamente baseUrl/auth/v1/authorize del proyecto
configurado con provider=google, PKCE S256 y callback exacto. La apertura no autentica.
Callback usa `ValidatedCallback`003 y exchangeCodeForSession; getUser verifica identidad.
El método existente signOutCurrent cancela el intento y borra verificadores, con bloqueo
de resultados tardíos. El navegador de Google puede conservar su propia sesión; logout
de App Barbería no promete cerrar Google.

Errores de proveedor no se registran ni se muestran literalmente; error=access_denied
se reduce a oauth-cancelled. Tokens en fragmentos no se aceptan. El usuario sin perfil
completa nombre/teléfono mediante ensure-profile existente.
