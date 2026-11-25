# Plan — 007

Expo58/ReactNative0.88/SupabaseJS2.119 existentes. Sin paquetes nuevos, SQL ni build.
Reutilizar signInWithOAuth con skipBrowserRedirect, PKCE del SDK y callback003.
Puerto de apertura en adaptador; composición Web usa location.assign y Android Linking.
Aplicación coordina intento/deduplicación/cancelación, sin importar navegador o SDK.
Pantallas reutilizan AppButton; perfil faltante usa formulario002/003 explícito.

Constitución2.0.0: núcleo independiente, servidor verifica identidad y membresías;
Web/Android obligatorios, sin rediseño o cambios de proveedores. Gates conformes.
Pruebas RED→GREEN, tipos/lint/formato/arquitectura. No repetir19 recovery ni91 care.

Configuración externa realizada manualmente por el usuario: cliente OAuth Web Google,
proveedor Cloud nuevo, callbacks y cuenta de prueba. Auth Cloud aislado validado por el
usuario en Web/Android; secreto solo en servidor. Auth y negocio ya comparten el
entorno Cloud integrado; recorrido manual Web aceptado el 24/11/2026. T006 conserva
la acreditación específica de duplicados/perfil y Android integrado pendiente.
El negocio Development sigue LOCAL; el perfil Cloud de prueba no lo consume. No configurar
automáticamente, mezclar tokens entre proyectos ni inventar dominio.
El retorno de Supabase a la app conserva localhost8081/auth/callback o
appbarberia://auth/callback. Distinguir ambos saltos del flujo.

Riesgos: linking automático de identidades lo resuelve Supabase con su política; no se
reimplementa por coincidencia de email. Verificar configuración y caso existente en prueba
real. No pedir Drive/calendar ni acceso offline. XSS residual Web sigue documentado.

Integración normal preparada15/11: perfil Development cloud-integration opt-in y cerrado
por revisión de liberación, clave pública separada y URL fija del proyecto nuevo. Un SDK
y transporte de origen fijo para Auth/002/004–011; no se importan sesiones o filas LOCAL.
Login Google limpia el fence diagnóstico retirado. Registro/login por contraseña conservados.
El inventario exacto de11 migraciones,17 tablas/RLS,4 Edge y configuración está en quickstart;
es propuesta revisable, no despliegue. El gate operativo no acredita salud/ACL por sí solo:
no activarlo antes de verificar el backend Cloud con autorización específica.
