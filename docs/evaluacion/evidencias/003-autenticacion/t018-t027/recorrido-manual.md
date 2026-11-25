# Único recorrido pendiente — sesión y contexto

14/11/2026. Instrucciones, **no resultados ejecutados**. Web primero e inmediatamente
Android Development, con Metro existente en 192.168.0.33:8081. No nuevos registros,
correos, APK, cambios de seguridad ni pruebas repetidas de contraseña incorrecta.

Credenciales exclusivamente ficticias en el archivo local ignorado:
`.artifacts/t027-context/credenciales-locales.txt`. Abrirlo localmente; no copiarlo al
chat, capturas ni Git. El conjunto autorizado tiene tres cuentas: `single` (administrador
solo de B), `inactive` (sin membresías activas), `shared` (administrador A/barbero B).
No son usuarios personales. A/B se identifican por los nombres del mismo archivo.

## Recorrido conjunto

1. Web: abrir `http://localhost:8081/sign-in`. Android: recargar el APK desde Metro
   y usar Iniciar sesión. Una sesión anterior sin marcador de propósito puede exigir
   autenticarse una vez; no se infiere autorización de tokens guardados sin verificar.
2. En Web y después Android, entrar con `single` y abrir **Ver mis barberías**:
   B debe quedar seleccionada automáticamente como Administrador. Cerrar sesión
   solo para pasar a `inactive`: debe mostrar cero membresías activas, manteniendo
   Mi cuenta válida. Esto comprueba nuevos estados de contexto, no repite registro.
3. En Web y después Android, entrar con `shared`, abrir Ver mis barberías y elegir
   A: Administrador. Cambiar de barbería y elegir B: Barbero. Nunca mostrar
   Administrador en B. No hay acciones de negocio implementadas todavía.
4. Con `shared`/B: Web recargar, cambiar de pestaña y volver; cerrar/reabrir la
   pestaña y abrir `http://localhost:8081/account`. Android pasar a segundo plano,
   regresar y cerrar/reabrir el APK conectado al Metro existente. Tras verificar
   la sesión/perfil debe recuperarse el contexto B/Barbero; durante resolución no
   mostrar datos anteriores. No compartir tokens o inspeccionar valores guardados.
5. Web: activar Offline en Network de DevTools y recargar. Debe aparecer un estado
   público recuperable, sin presentar el contexto como autorización. Volver Online
   y usar Reintentar sesión. Android: desactivar brevemente Wi-Fi y volver a la
   app, después restablecer Wi-Fi y reintentar; si Metro necesita conexión para
   cargar, documentar ese límite y no confundirlo con un fallo de Auth.
6. Cuando ambas plataformas hayan mostrado B/Barbero, ejecutar **una sola vez** en
   PowerShell, desde el repositorio: `node scripts/local-auth-context-fixtures.mjs revoke`.
   Cambia únicamente la membresía ficticia identificada shared→B a inactiva. En
   ambas plataformas pulsar Actualizar barberías: B debe desaparecer y A quedar
   seleccionada automáticamente; la cuenta sigue autenticada. El servidor no
   permite leer B, incluso si existía preferencia guardada.
7. Web únicamente: abrir Mi cuenta en dos pestañas del mismo origen. Cerrar sesión
   en una; la otra no debe conservar información privada al recibir la invalidación,
   recargar ni usar Atrás/Adelante. Es la comprobación nueva multipestaña; no repetir
   los recorridos anteriores de clave incorrecta/confirmación por correo.

Comunicar por plataforma los pasos aprobados y cualquier error, sin enviar contraseñas,
correos, tokens, enlaces Auth ni el archivo local. Codex registrará la atribución y
ejecutará después la limpieza selectiva autorizada, cotejando IDs y dependencias.
**No limpiar antes de confirmar/documentar ambos recorridos.**

## Límites de esta verificación corta

No demuestra por sí sola tres recorridos completos SC-001/T019 ni toda la matriz de
sesión renovable/definitivamente inválida de SC-003/T023. Las pruebas controladas del
adaptador verifican estos estados, pero no sustituyen evidencia real en ambas plataformas.
No cambiar TTL/JWT/usuarios existentes para forzar esos casos. T019/T023 permanecen
pendientes hasta completar sus criterios exactos; T027 requiere además ambos recorridos
de contexto y limpieza selectiva acreditada. No se declaran pruebas manuales nuevas aún.
