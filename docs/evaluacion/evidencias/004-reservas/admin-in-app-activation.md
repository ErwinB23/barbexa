# Gestión de administradores — habilitación del cliente Cloud

Fecha:24/11/2026, America/Lima. Usuario autoriza habilitar servidor y aplicación;
excluye enviar invitaciones y modificar roles de usuarios.

## Resultado

El aviso de función deshabilitada procedía del cliente. Cloud ya estaba configurado:
barbershop-operationv6 ACTIVE con verify_jwt=true; fuente descargada sin diferencias
respecto del árbol local. Los indicadores BARBERIA_ENABLE_TEAM_AUTHORITY=true,
BARBERIA_ENABLE_ADMIN_INVITATIONS=true y BARBERIA_ADMIN_INVITATION_DELIVERY=in-app
coinciden por SHA256. No se publican valores de otros secretos ni datos de usuario.

Se respalda función/configuración en el directorio privado
LocalAppData/Barbexa/backups/admin-authority-1795536617068. Postflight de solo lectura:
4funciones y secretos iguales;25tablas public/private mantienen conteos y huellas.
No despliegue, modificación de secretos, migración ni escritura de negocio en esta ejecución.

## Cliente

Se verifica PID36388, comando Expo de este workspace y puerto8081 antes de detenerlo.
Primer intento de arranque aborta porque el puerto aún seguía ocupado; tras liberar,
inicia Metro pid24448 con perfilcloud-integration y ambos flags públicos en true:
EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY y EXPO_PUBLIC_CLOUD_ENABLE_ADMIN_INVITATIONS.
No se modifica .env.local (hash conservado) ni el log protegido t017-serve.log.
Estado `.artifacts/admin-authority-metro-enabled.json`, logs separados del Metro.

Se abre pestaña nueva, conservando la anterior sin recargar. CUA verifica con sesión
existente: Administrador principal · Propietario,0de2secundarios,2cupos, campo de
correo editable y botón de invitación correctamente desactivado mientras está vacío.
Consulta explícita de invitaciones: estado vacío confirmado, sin errores.
No se completó ni envió formulario, no se aceptó invitación ni se retiró administración.

## Verificación y límites

- Cliente22/22: registration-runtime, team-authority y team-authority-client.
  Log `.artifacts/admin-authority-enable-client.log`.
- Servidor9/9: team.test.ts con canalin-app, sinmail, guardasJWT/Origin y gate cerrado.
  Log `.artifacts/admin-authority-enable-server.log`.
- Fuentes de producción sin cambios; solo configuración del proceso y documentación.
- Operadores ignorados `.artifacts/admin-authority-activation.mjs` y
  `.artifacts/admin-authority-metro-start.mjs`; el primero hizo solo inspección/respaldo.
- Postflight normaliza por slug/nombre porque la API puede devolver listas en orden
  diferente; comparación previa detectó únicamente esa permutación, no modificación.
- Pendientes: recorrido auténtico de secundario y Android físico. El envío/aceptación
  real queda para una acción explícita del usuario; las pruebas con dobles no lo acreditan.
- Sin staging, commit ni push. Mantener ambos flags al reiniciar el perfilCloud.

Documentación operativa consultada: [despliegue de funciones](https://supabase.com/docs/guides/functions/deploy)
y [variables de entorno](https://supabase.com/docs/guides/functions/secrets).
