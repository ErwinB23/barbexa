# Administración secundaria dentro de BARBEXA

Solicitud 23/11/2026: usuario pide habilitar nombramiento de otro barbero y elige
explícitamente recepción/aceptación dentro de BARBEXA. Extiende 011 sin cambiar sus
reglas: propietario único, máximo dos secundarios, aceptación expresa y conservación
del perfil profesional. La autoridad definitiva permanece en servidor.

## Estado vigente — 24/11/2026

Usuario autoriza habilitación de servidor/aplicación, sin invitaciones ni cambios de
roles. La revisión actual encuentra servidor ya habilitado: barbershop-operationv6
ACTIVE, verify_jwt=true, fuentes descargadas idénticas y los tres flags esperados
por digest. Se respalda la fuente/configuración y se conservan todas las funciones,
secretos y25tablas public/private por comparación posterior. No fue necesario
desplegar, cambiar secretos ni ejecutar SQL de escritura.

El Metro vigente omitía ambos flags públicos de administración. Se detiene únicamente
su proceso confirmado en8081 y se inicia el perfilCloud con ambos en true. .env.local
ylog protegido permanecen intactos. La pestaña original se conserva: en una nueva
pestaña /staff?view=team se verifica sesión existente de propietario,0/2secundarios,
formulario y consulta real de invitaciones vacía. No invitación/aceptación/retirada.
Pruebas cliente22/22 y servidor9/9; Android real y secundario real pendientes.

Estado de arranque: `.artifacts/admin-authority-metro-enabled.json`; conservar ambos
flags al relanzar el perfilCloud. Evidencia: `docs/evaluacion/evidencias/004-reservas/admin-in-app-activation.md`.

## Preparado

- Runtime Web/Android: nueva opción pública EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY.
  Las invitaciones Cloud requieren también esa opción, además de su flag propio.
  Default cerrado; no activar sin verificar el servidor. .env.local no modificado.
- Pantalla de equipo: apartado administrativo siempre localizable, con estado honesto
  si está deshabilitado. Tras activación usa panel de propietario y formulario por
  correo registrado existente; canManage exige facultades verificadas en Web/Android.
- Panel de autoridad compartido universal; .web reexporta, Android lo conecta con
  consulta de autoridad y feedback antes de habilitar acciones.
- Canal in-app en aplicación/servidor. La creación conserva RPC, idempotencia,
  cupo, auditoría y trigger de notificaciones existentes. No reclama ni envía correo;
  reintentar correo devuelve NOT_AVAILABLE. No necesita proveedor ni claves SMTP.
  Modalidad email anterior se conserva para LOCAL y no se modifica silenciosamente.
- Recepción/aceptación explícita, cancelación del propietario y retirada con destino
  obligatorio reutilizan flujo probado. No nueva migración ni cambio de propietarios.

## Verificación

- Pruebas nuevas observadas fallar antes del cambio: gate Cloud y canal in-app sin
  mail. Ambas pasan tras implementación. Cliente529/529; servidor operación39/39.
- Tipos, lint cliente y servidor, grafo, deno check del Edge y export Web aprobados.
- Export Android de JavaScript/recursos y formato final aprobados. Últimas25 pruebas
  dirigidas pasan tras ajuste de copy. No APK ni instalación.
- Solo lectura Cloud autorizada por herramienta: destino vuoncrtkkkquvddunrxx,
  una barbería, un registro de propiedad, cero barberías sin propietario. Flags de
  autoridad/invitaciones y proveedor email ausentes. No se publican correos/IDs.
  Fallo de transporte inicial resuelto con certificados del sistema, sin omitir TLS.
- No prueba real de invitación, aceptación, retirada, login, notificación ni email.
  Recorrido real Web/Android y validación HTTP positiva quedan para activación.

## Plan de activación revisado (autorizado24nov)

1. Confirmar destino y revisión de SQL/Edge antes de activar. Sin DDL ni DML.
2. Desplegar únicamente barbershop-operation desde el árbol validado, conservando
   verify_jwt y configuración/orígenes/otros secretos existentes.
3. Habilitar solo BARBERIA_ENABLE_TEAM_AUTHORITY=true,
   BARBERIA_ENABLE_ADMIN_INVITATIONS=true y
   BARBERIA_ADMIN_INVITATION_DELIVERY=in-app.
4. Habilitar en el proceso cliente Cloud los dos flags públicos correspondientes
   y recargar/reiniciar únicamente el Metro de este recorrido si hace falta.
   Mantener .env.local y log protegido t017-serve.log intactos.
5. Comprobar lectura autenticada de propietario y denegaciones. No invitar, aceptar
   ni retirar acceso a usuarios reales como prueba. Esas acciones las hará el usuario.

Los pasos2y3 no se repitieron: el estado remoto ya coincide con lo aprobado.
No ejecutar nuevas operaciones por este antecedente: requieren alcance vigente
según AGENTS.md. Rollback previsto de activación:
restaurar valores ausentes/previos y versión Edge respaldada, sin alterar roles.

Artefactos ignorados admin-in-app-{client,server-full,server,export,architecture}.log;
compilaciones locales .artifacts/admin-in-app-web y admin-in-app-android.

## Corrección de activación persistente — 25/11/2026

Tras nueva incidencia autorizada, el arranque ya no depende de repetir flags true:
administración e invitaciones in-app están activas por defecto en Cloud integrado
y producción que superen la validación existente de backend/origen/revisión.
Un false explícito mantiene desactivación operativa; LOCAL continúa opt-in.
No se conceden permisos por este valor: propietario, cupos, aceptación y membresías
siguen revalidados en servidor/SQL. Regresiones de nuevos runtimes Web/Android,
configuración inválida y producción incluidas en registration-runtime.test.mjs.
No se modifica servidor, Cloud, datos o preferencias de cuenta.
