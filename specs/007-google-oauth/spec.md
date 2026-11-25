# 007 — Google OAuth

Fecha: 2026-11-15. Fuente: RF02/HU02 de propuesta aprobada. Estado: Google integrado
con Auth y negocio Cloud; recorrido funcional manual Web aceptado el 24/11/2026.
La prueba aislada Web/Android anterior no sustituye T006/SC002 de perfil y ausencia
de duplicados en el entorno integrado; Android final permanece pendiente.
No modifica las evidencias históricas de 003–006.

## Historias y aceptación

### US1 (P1): Continuar con Google

Como usuario quiero registrarme o ingresar mediante Google desde Web o Android.
El proveedor decide la identidad; no se crean usuarios paralelos ni se vinculan por correo
desde el cliente. El perfil existente se conserva; si no existe se completa explícitamente
con el backend002, sin conceder roles por metadatos Google.

1. Desde registro/login, iniciar una sola operación PKCE y abrir el navegador.
2. Volver al callback ya aprobado, canjear el código una vez y verificar usuario por Auth.
3. Solo después de obtener el perfil propio se habilita negocio y se resuelven membresías.
4. Cancelación, proveedor no habilitado, enlace ajeno/expirado y red fallida muestran error
   seguro y permiten volver a correo/contraseña. No se publican URLs, códigos ni tokens.
5. Logout invalida el intento pendiente y elimina sus verificadores mediante limpieza
   existente; una respuesta tardía no restaura la sesión anterior.

## Requisitos

- FR001: botón funcional en registro/login Web/Android sin reemplazar correo/contraseña.
- FR002: un SDK, PKCE S256 y almacenamiento seguro específico de plataforma ya existente.
- FR003: apertura solo de authorize del Supabase configurado, con retorno exacto aprobado.
- FR004: conservar espera OAuth al pasar al navegador, sin conceder acceso privado.
- FR005: perfil, sesión y roles se verifican mediante backend; sin linkIdentity ni privilegios globales.
- FR006: ninguna credencial Google en cliente; configuración externa requiere permiso separado.

## Éxito

- SC001: pruebas dirigidas de SDK, composición, coordinación, cancelación, retorno y UI
  pasan para Web/Android con dobles y regresiones de acceso por contraseña.
- SC002: prueba Google real Web y Android con proveedor autorizado, perfil, logout y
  cuenta existente sin duplicación. Pendiente: no se sustituye por pruebas con dobles.

Casos límite: navegador cancelado sin callback (cancelar desde app), callback duplicado,
retorno con error/fragmento inesperado, app suspendida, sesión ya autenticada, recuperación
restringida, cambio de cuenta y almacenamiento fallido. No vinculación manual de cuentas.
