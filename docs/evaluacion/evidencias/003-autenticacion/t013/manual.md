# Único bloque manual pendiente — T011/T013

## Actualización de cierre — 14/11/2026

El usuario confirmó los recorridos satisfactorios Web/Android de registro, recepción en
Mailpit, confirmación y perfil propio. T011/T013 cerradas,13/36. [Evidencia](cierre-manual.md).
No se atribuyen resultados manuales a los casos ampliados no declarados: pertenecen a T014,
que sigue pendiente. No repetir registros ahora ni eliminar las cuentas locales.

## Procedimiento preparado anteriormente (histórico)

Preparado por Codex el14/11/2026, **no ejecutado**. Web primero, inmediatamente Android.
No repetir la muestra/accesibilidad T012. No ejecutar todavía la batería de T014.

1. **Web, Chrome de la PC**: abre http://localhost:8081/sign-up. Prueba envío vacío:
   debe haber error comprensible. Completa nombre ficticio, teléfono vacío, correo único
   como `t013-web-20261114@example.invalid` y una contraseña ficticia válida para Auth.
   Pulsa Crear cuenta dos veces seguidas: un solo envío, controles bloqueados durante
   carga y pantalla de confirmación pendiente. No deben aparecer datos privados todavía.
2. Abre http://127.0.0.1:54424 en **el mismo navegador**, encuentra ese único correo y
   abre Confirmar. El enlace nuevo debe empezar por http://192.168.0.33:54421/auth/v1/verify
   y regresar a http://localhost:8081/auth/callback. No copies el enlace al chat ni tomes
   capturas con su query. Espera: la URL Web debe quedar sin código/fragmentos.
   Si pide completar perfil, indica solo nombre ficticio/teléfono opcional y confirma.
   Resultado esperado: «Perfil confirmado» y nombre propio, sin rol ni barbería inventada.
3. **Android, APK Development ya instalado**: recarga el proyecto desde Metro
   http://192.168.0.33:8081 (ahora8081; no usar la dirección8082 anterior). En Bienvenida
   toca Crear mi cuenta. Repite con **otra** dirección ficticia local, por ejemplo
   `t013-android-20261114@example.invalid`. No reinstales ni generes otro APK.
   Desde Chrome del teléfono abre http://192.168.0.33:54424, selecciona ese correo y pulsa
   Confirmar: debe abrir el enlace LAN, volver al APK mediante appbarberia://auth/callback
   y mostrar/completar el perfil propio. Mantén PC/teléfono en la misma Wi-Fi confiable.
4. **En ambas, sobre esas mismas cuentas**: cerrar solo la vista de registro no debe
   borrar el verifier de la instalación/navegador; para comprobarlo, una vez recibido el
   correo vuelve al inicio antes de abrirlo. Un enlace inválido o consumido tras reiniciar
   la vista debe fallar de forma comprensible, sin mostrar un perfil anterior ni volver
   a registrar. Dos eventos del mismo enlace dentro de la misma ejecución pueden deduplicarse
   y conservar el resultado: eso no equivale a dos canjes. En Web puedes verificar el caso
   inválido abriendo http://localhost:8081/auth/callback?code=invalid-t013-check.
   En Android, vuelve a pulsar el enlace de Mailpit; no borres SecureStore para esta comprobación.
5. **Solo si aparece un fallo real de perfil**: conserva la pantalla y pulsa Reintentar
   perfil al recuperar conexión. Debe completar el mismo perfil sin nuevo registro/correo.
   Si no ocurre ese fallo, indícalo como **no observado**; no inventar el resultado.
   Sus casos automáticos están cubiertos, la validación funcional completa pertenece al
   siguiente bloque autorizado. No desconectar servicios ni cambiar políticas para forzarlo.
6. Reporta únicamente resultado Web/Android, confirmación/perfil, errores y si el enlace
   volvió correctamente; no contraseñas, códigos, JWT ni URL completa del correo. Máximo
   estas2 cuentas/perfiles locales, sin barberías/membresías. Conservarlos identificados
   para limpieza selectiva de sesiones, perfiles, usuarios y mensajes **solo de este recorrido**;
   no borrar toda la base ni Mailpit. No usar correos personales ni Cloud. La limpieza y
   ausencia de duplicados se comprobarán con destino/identificadores controlados, sin publicar secretos.

Estos pasos no acreditan login/logout/restauración/recovery futuros ni tres recorridos
consecutivos por plataforma de T014. T011/T013 siguen pendientes de los resultados reales.
