# T009 — Única compilación EAS autorizada

13/11/2026, America/Lima. T009 abierta, 8/36. Se conserva el historial de preparación
en resultado.md. Usuario autorizó un único build Android development y generación de
firma administrada por EAS, sin pagos ni cambio de plan.

## Revisión previa ejecutada

- Git main/0ccd33c, cambios previos y log activo preservados; sin staging nuevo ni commit.
- EAS CLI27.10.0 ejecutada temporalmente por npx; no paquete global/proyecto añadido.
- `whoami` y `project:info --json`: identidad @erwin23 y proyecto
  @erwin23/app-barberia, ID d428c9e5-0852-43c3-974c-fae3bf286f3e, contrastados directamente.
  CLI mostró project:info como texto, no JSON; no se guardaron datos personales de cuenta.
- Cuota actual: el usuario volvió a consultar dashboard y confirmó Free, 0/15 compilaciones
  Android usadas y15 disponibles en el período. Evidencia manual del usuario, no consulta
  privada de facturación por Codex. No hubo pagos ni cambio de plan.
- `build:inspect --help` confirmó stage archive como copia local, sin Gradle/build remoto.
  Dos inspecciones oficiales, ambas0: la primera conservaba .git. Se reforzó .easignore
  con .git, supabase, tests, documentación de trabajo y *.log, y se inspeccionó de nuevo
  en .artifacts/t009/eas-archive-reviewed-20261113, excluido de su propio contenido y Git.
- Revisión del archivo efectivo:68 archivos, configuración requerida idéntica, sin archivos
  privados/logs ni coincidencias de JWT, claves secretas/privadas o URLs firmadas.
  Se aceptan directorios vacíos de exclusiones creados por el mecanismo de copia; no
  contienen datos. [Resumen de inspección](eas-archive.json). No garantiza una auditoría
  universal de secretos; no se imprimieron valores sensibles.
- Regresiones de configuración/transporte:3/3, código0. Preview/production/default sin
  excepción HTTP y producción explícita rechaza marca development. Se reutiliza también
  introspección nativa development/production de resultado.md y29/29 de integración.
- La única variable necesaria de build es APP_VARIANT=development (pública, eas.json).
  EAS informó cero variables Plain text/Sensitive en environment development. No URL LAN
  incrustada como producción, secretos ni configuración Supabase Cloud modificados.

El primer intento de consulta npm en sandbox falló por DNS ENOTFOUND, sin iniciar builds.
Se utilizó la ejecución con acceso de red autorizado. Una consulta de estado local esperaba
por error `project.id`; el fragmento oficial CLI usa `app.id`. Se corrigió solo el lector
ignorado y se verificó el destino. No fue un fallo de compilación ni un segundo build.

## Única ejecución remota

Comando ejecutado exactamente una vez:

`npx.cmd --yes eas-cli@latest build --platform android --profile development`

EAS inicializó versionCode1, seleccionó credenciales remotas y solicitó generar keystore.
Se respondió sí dentro de la autorización; ante ausencia de keytool local, EAS generó
la clave en la nube. No se descargó, imprimió ni versionó la clave privada. Subida886KB.

Build:27c95d3f-bfaf-49c0-9746-cc2e0e69522f.
Proyecto:d428c9e5-0852-43c3-974c-fae3bf286f3e; Android development/internal,
com.erwin23.appbarberia, app0.1.0/versionCode1.
[Página del build](https://expo.dev/accounts/erwin23/projects/app-barberia/builds/27c95d3f-bfaf-49c0-9746-cc2e0e69522f).

Estado al registrar esta sección: IN_PROGRESS, fase Gradle. Seguimiento de solo lectura;
no se autoriza ni inicia una segunda compilación. La finalización se registrará debajo.

### Resultado final acreditado

La consulta autenticada posterior devolvió **FINISHED**, código0, para el mismo ID y
proyecto. EAS creó el build el13/11/2026 a19:20:16 y lo terminó a19:37:54 (America/Lima);
los tiempos originales UTC se conservan en [metadatos filtrados](eas-build.json).
Una sola compilación iniciada. No se repitió tras la reanudación de la conversación.

[APK development publicado por EAS](https://expo.dev/artifacts/eas/TzdjtNXauGxZ5b56OkqVSq1C485GE0BcZ0v3ad3TUKg.apk).
El enlace no contiene parámetros firmados ni credenciales. No se descargó el APK en Git.
La publicación de un artefacto no demuestra instalación ni funcionamiento en el teléfono.

El proceso local de CLI quedó en la pregunta opcional de instalar/ejecutar en un emulador.
Se interrumpió esa pregunta con Ctrl+C, obteniendo salida local1; no se realizó la instalación
opcional ni se inició otra compilación. Esa salida corresponde al paso interactivo posterior,
no a un fallo del build Cloud, cuyo resultado FINISHED está acreditado por consulta separada.

Para instalar: abrir el enlace del APK o la página del build desde el teléfono, descargarlo
y permitir la instalación desde ese navegador si Android lo solicita. Es un cliente de
desarrollo propio, no Expo Go. Para conectar Metro desde PowerShell en este repositorio:

```powershell
$env:APP_VARIANT = 'development'
npx.cmd --no-install expo start --dev-client --lan
```

Si ya existe Metro, utilizar la instancia apropiada sin detener otros procesos por defecto.
Teléfono/PC en la misma red confiable, Supabase local disponible; abrir App Barbería y
conectarla mediante el QR de Metro. No se inicia Metro automáticamente en esta ejecución.
Confirmar apertura, scheme appbarberia y salud API desde el runtime React Native antes del
cierre; no usar el acceso previo desde Chrome como sustituto.

Archivos de esta continuación: .easignore y evidencias eas-archive.json, eas-build.md,
eas-build.json, informe.md, entornos.md y configuracion.md. Sin cambios de código funcional,
dependencias ni destinos Supabase. Cambios previos preservados; log activo excluido.

## Pendientes para aceptación T009

Instalación real del development build en Android, apertura de la aplicación/scheme
appbarberia y acceso API desde React Native en LAN confiable. Chrome/Expo config no los
reemplazan. Iniciar Metro con APP_VARIANT=development y --dev-client --lan, no --go.
Los recorridos de Auth de T010+ no están implementados ni probados por este build.
Permanece la comprobación de Origin real de Edge si el registro CORS previo no la cubre.
No se crearon usuarios ni datos; no Cloud, contenedores, migraciones ni T010+.
Riesgo npm previo nueve moderados, última evidencia ocho/tres sin dev: sin remediación
ni nueva auditoría en esta ejecución. Conservar también las limitaciones XSS documentadas.
