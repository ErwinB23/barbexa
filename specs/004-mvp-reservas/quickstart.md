# Quickstart — 004 MVP de reservas

Guía prevista, **no ejecutada**. No usarla como autorización para migraciones, datos,
despliegues o pruebas de carga. Los comandos de negocio nuevos no existen todavía.

## Antes del primer bloque

1. Revisar/aprobar spec/plan/tasks004. Mantener003 activa para su implementación; para
   resolver004 sin cambiar selector global en PowerShell:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY = 'specs/004-mvp-reservas'
$env:SPECIFY_FEATURE_NO_PERSIST = '1'
& .specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

2. Git rama/HEAD/diff, conservar cambios y log activo002. No git add/commit/push implícitos.
3. Comprobar herramientas existentes sin instalar: Node24, npm, CLI3.1.0, Deno2.9.8,
   Docker Linux y PostgreSQL17. Revisar btree_gist disponible, permisos y migraciones002.
4. Destino de desarrollo futuro: `app-barberia-002-local`, PostgreSQL54422/API54421,
   identidad/nombres/redes/volúmenes verificados por runner. Proyectos anteriores y entorno
   de reproducción no se modifican. No nuevo stack ni db reset por rutina.
5. Aprobar cada aplicación local/fixture/limpieza. Crear nombres de migración únicamente
   mediante `supabase migration new <nombre>` al implementar; no timestamps adivinados.
6. Permitir solo la configuración pública existente. Secretos en entorno servidor/archivos
   ignorados; nunca claves privilegiadas/JWT/reply URLs firmadas en reportes.

## Primer bloque ejecutable tras aprobación — T001–T007

Capturar línea base y autorizaciones; extender el runner seguro con modo booking; escribir
RED de esquema/RLS; crear/aplicar **solo al destino aprobado** la migración de las8 tablas
de oferta/personal y ACL; tipos/puertos núcleo; repetir pruebas de catálogo hasta GREEN.
No exige repetir registro003 ni desplegar Cloud. Las3 tablas de reservas/RPC atómica se
añaden después, T014–T017, con pruebas de concurrencia reales T016.

Reutilizar estas verificaciones existentes según archivos afectados:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run architecture:check
npm.cmd run check:server
node scripts/run-unit-tests.mjs
```

En T003 se documentarán los argumentos efectivos del runner extendido para SQL/HTTP/
concurrencia; hoy admite solamente sus escenarios002. No presentar `--booking` como
opción ya implementada. En Deno se añadirán los entrypoints/tests reales al task existente,
sin flags que omitan fallos ni descargas no autorizadas.

## Recorrido de aceptación previsto

Con cuentas ficticias **expresamente autorizadas**: administrador A, profesional A,
administrador B, cliente sin membresías y usuario admin-A/barbero-B. Reutilizar cuentas
003 cuando sirvan; no recrearlas ni repetir correo/login ya acreditados sin cambio afectado.
Determinar cantidades/IDs y plan selectivo de limpieza antes de escribir datos.

1. Web: crear barbería mediante002, configurar contacto/dirección/políticas (cancelación120
   inicial), dos servicios, horarios/capacidades; emitir invitación interna a cuenta existente.
   Pendiente no permite acceso; aceptar habilita su membresía. Administrador profesional
   requiere perfil/horario explícitos. Intentar publicar incompleta debe fallar.
2. Android inmediatamente: comprobar misma oferta y aceptación del rol/contexto. No nuevo
   APK si solo cambió JavaScript. Verificar que administrar A no habilita administrar B.
3. Cliente Android: elegir ambos servicios y profesional/cualquiera, consultar slots,
   confirmar; guardar solo ID de control y resultado sanitizado. Administrador Web ve la
   cita con mismo ID, hora Lima, profesional y total PEN. Probar también Web→Android.
4. Backend real: dos conexiones/identidades confirman a la vez el mismo intervalo; repetir
   diez pares incluyendo perfiles A/B de una persona, canceladas no bloquean y conflicto
   devuelve únicamente «Profesional no disponible en ese horario». Fallo inducido controlado
   revierte todos los detalles; retry con mismo requestId no duplica.
5. Agendas: asignado/admin ven alcance permitido; profesional no asignado y tenant B no
   ven cliente/cita privados. Revocación controlada invalida acceso actual sin confiar en UI.
6. Cancelar cliente justo en límite y rechazar después; staff asignado/admin exige motivo,
   actor ajeno denegado. Repetir/correr con nueva confirmación no duplica evento ni ocupación.
7. Completar recuperación003 antes de evaluación, accesibilidad final Web/Android y sesión/
   contexto de usuario actual. No asumir esos resultados por un bundle o unit test.

Todos los pasos son metas pendientes. Registrar fecha, versión, entorno, pasos/comando,
expected/observed/exit y origen manual/automático en `docs/evaluacion/evidencias/004-reservas/`.

## Cloud y entrega

No autorizado en esta fase. Antes de migraciones/Edge Cloud, aprobar operaciones concretas,
destino nuevo `vuoncrtkkkquvddunrxx`, orígenes Web/redirects y credenciales locales seguras;
preview de migraciones, checkpoint local autorizado y recuperación compatible con datos.
No migration repair/reset ni tocar `klebvayvsvibwjpkzrff`. Validar RLS/ACL/EXECUTE y
JWT/HTTP de la versión realmente desplegada. Publicar origen Web y medir HTTPS/DNS/CDN/CSP
con configuración real autorizada. No inventar dominio, costo o cuota EAS disponible.

## Recuperación ante fallos

Detener el bloque ante incompatibilidad, migración parcial o destino no identificado.
Registrar historial/estado; no modificar migración ya aplicada para ocultar error. Preparar
corrección aditiva revisada, nunca drop/reset de bases con datos. Eliminar únicamente
fixtures de esta ejecución, en orden FK, tras comprobar sus identificadores y autorización;
no limpiar Auth/Mailpit enteros. Conservar evidencias RED y límites de seguridad npm/XSS.
