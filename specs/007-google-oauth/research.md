# Decisiones verificadas — 007

SDK instalado2.119: signInWithOAuth genera/verifica PKCE y devuelve URL/flowId; usar
skipBrowserRedirect para apertura por adaptador y callback único existente. No setSession
con tokens del enlace. No linkIdentity ni creación manual de Auth/perfiles duplicados.

Fuentes: código instalado `@supabase/auth-js/src/GoTrueClient.ts` y documentación oficial:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation

No expo-web-browser nuevo: Linking del build ya instalado permite navegador externo;
sin callback de cierre nativo, la app ofrece cancelación explícita al regresar. Prueba
real de UX y retorno Android sigue pendiente. No afirmar custom tabs nativas.
