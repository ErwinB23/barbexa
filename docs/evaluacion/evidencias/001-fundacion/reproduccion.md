# Reproducción de la fundación Expo — T036

Guía redactada el 11/11/2026 (America/Lima), contra `main`, commit
`66c2f39448274e0ccb8ed47c09bf48d78e9177d4`:
`feat: mejorar interfaz y validar accesibilidad Android`. Git estaba limpio.
La redacción está comprobada; **la reproducción desde esta guía aún no se ha
ejecutado**: corresponde a T037. Los comandos siguientes son instrucciones,
no resultados nuevos de esta tarea.

## Prerrequisitos y versiones

Usar el repositorio existente, sin volver a inicializar Expo ni copiar plantillas.
Windows, Git, Node 24.21.0 y npm 11.19.0. Versiones observadas en esta sesión;
PowerShell activo: 5.1.26100.9711. El plan preveía PowerShell 7; los comandos de
esta guía usan argumentos separados y `.cmd`, compatibles con la shell actual.
Acceso a npm/Expo para instalación o consultas remotas; no se requieren Supabase,
credenciales, Android Studio, JDK, Gradle ni EAS para este flujo con Expo Go.

Versiones efectivas leídas de `package-lock.json` (no solo rangos del manifiesto):

| Paquete | Versión |
| --- | --- |
| expo | 58.0.24 |
| expo-router | 58.0.31 |
| expo-constants | 58.0.16 |
| expo-linking | 58.0.17 |
| react / react-dom | 19.3.0 / 19.3.0 |
| react-native / react-native-web | 0.88.1 / 0.21.4 |
| react-native-safe-area-context / react-native-screens | 5.11.1 / 4.30.1 |
| typescript | 6.0.3 |
| @types/react / @types/node | 19.3.0 / 24.19.2 |
| eslint / eslint-config-expo | 9.39.5 / 58.0.4 |
| prettier | 3.9.10 |

Codex verificó en T036 igualdad de dependencies/devDependencies entre package.json
y raíz del lockfile. No se instalaron paquetes ni se repitió una auditoría de seguridad.

## Preparación segura y comandos (ejecución posterior)

Abrir PowerShell en la raíz Git; las rutas con espacios deben ir entre comillas.

```powershell
git rev-parse --show-toplevel
git status --short
git branch --show-current
git rev-parse HEAD
node --version
npm.cmd --version
Get-FileHash -LiteralPath package-lock.json -Algorithm SHA256
```

Antes de instalar, conservar un inventario SHA-256 externo de todos los archivos
previos/protegidos y el estado Git, conforme T001/T037; resolver cualquier cambio
inesperado sin sobrescribirlo. La reproducción autorizada en T037 utilizará:

```powershell
npm.cmd ci
npm.cmd ls --depth=0
npm.cmd run check
npx.cmd --no-install expo install --check
npx.cmd --no-install expo-doctor
```

`npm ci` usa el lockfile y reemplaza node_modules; no ejecutarlo sin la autorización
de esa etapa. Si Doctor no está disponible localmente/en caché, detener y registrar
el requisito; no instalarlo silenciosamente. El ejecutable ya utilizado fue
expo-doctor 1.21.6 en caché npm (véase t032-t034.md). No cambiar versiones,
regenerar el lockfile, ignorar peers ni excluir paquetes para forzar aprobación.

`check` ejecuta tipos app/núcleo, lint, formato, arquitectura y tests en secuencia,
deteniéndose ante fallo. `test` incluye regresiones del checker, unitarias compiladas
y presentación. El runner compila a `.test-build`, exige cobertura del núcleo
100 % líneas/funciones y >=90 % ramas, y limpia solo su salida propia. La cobertura
no se atribuye a UI. Opcionalmente ejecutar los scripts individuales para diagnosticar:
`typecheck`, `lint`, `format:check`, `architecture:check`, `test`.

Guardar salidas, versiones, atribución y códigos `$LASTEXITCODE` inmediatamente
después de cada comando. Comparar inventario, Git y lockfile antes/después; cualquier
discrepancia no autorizada bloquea la reproducción. No formatear docs/skills existentes.

## Empaquetado y ejecución Android

Exportar solo a una ruta nueva o previamente comprobada como salida propia:

```powershell
npx.cmd --no-install expo export --platform android --output-dir "$env:TEMP\app-barberia-reproduccion-android" --clear
npm.cmd start
```

Si esa carpeta temporal existe y no se conoce su contenido, elegir otro nombre,
sin borrarla automáticamente. La exportación genera bundle Hermes y assets,
no una APK; no acredita pruebas en dispositivo. `start` usa Expo Go y LAN.

Entorno físico acreditado por el usuario: Honor 90 Lite CRT-NX3, Android 15,
Expo Go 58.0.5. Teléfono y PC con conexión LAN a Metro; permitir el acceso requerido
por firewall. ADB no fue encontrado en PATH en las revisiones anteriores; no es
necesario para abrir el QR con Expo Go. Tunnel no probado.

Procedimiento derivado de quickstart, ajustado por las decisiones autorizadas:

1. Abrir desde QR/URL real de Metro; Bienvenida debe iniciar sin credenciales de backend.
2. Repetir tres ciclos Bienvenida → Base técnica → Atrás; comprobar sistema y cabecera.
3. Abrir `<URL-real-de-Metro>/--/ruta-inexistente` mediante enlace Android;
   verificar ruta desconocida y Volver al inicio. No inventar IP/puerto.
4. Cerrar completamente y reabrir Expo Go; comprobar información técnica tras reinicio.
5. Recorrer la galería de carga, vacío, error y éxito; recuperar y restablecer la
   muestra sin confundirla con el estado de la consulta real.
6. Con la aplicación ya cargada, desconectar internet (por ejemplo, modo avión)
   y comprobar información/controles locales. No exigir Metro simultáneo ni
   interpretar el resultado como arranque offline de una aplicación instalada.
7. Recorrer controles y estados con TalkBack. Comprobar lectura, navegación y
   recuperación; registrar como evidencia manual a quien hizo la prueba.
8. Usar el máximo de fuente disponible en el Android identificado y comprobar
   legibilidad, botones funcionales, ausencia de recortes/superposiciones y scroll.
   No equiparar máximo con 200 % ni afirmar restauraciones o mediciones inexistentes.

Registrar entorno, commit/diff, resultados y capturas reales. Las pruebas manuales
anteriores son declaradas por el usuario, no ejecutadas por Codex. No se exige
repetirlas para redactar esta guía. Web/iOS no quedan validados por Expo Go Android.

## Errores conocidos y respuesta

- PowerShell bloquea scripts `.ps1`: usar `npm.cmd`/`npx.cmd` para npm; no cambiar
  la política para ejecutar scripts de Spec Kit. Registrar el bloqueo y comprobar
  sus datos manualmente cuando corresponda.
- Metro no resuelve imports `.js` hacia fuentes `.ts`: la corrección vigente deja
  sin extensión solo tres imports ejecutables del flujo. Conservar `.js` de tests
  y tipos; NodeNext actual emite CommonJS. No sustituir extensiones masivamente.
- EACCES/fetch en verificaciones Expo: distinguir restricción de red de conflicto
  real; repetir con acceso autorizado, sin desactivar checks. Matriz remota puede
  cambiar; registrar diferencias antes de modificar decisiones.
- Hermes `permission denied`: revisar permiso de ejecución del compilador/entorno;
  no desactivar Hermes para aparentar que pasó el empaquetado.
- Metro/QR inaccesible: revisar misma LAN, URL y firewall; no atribuir al backend
  un problema de conexión con la herramienta de desarrollo.
- TS18003/EMPTY_CORE fueron fallos históricos previos al núcleo: si reaparecen,
  revisar archivos/configuración. No desactivar el checker ni sus pruebas.
- Conflicto de peers o `npm ci` incompatible con el lockfile: detener y diagnosticar;
  no usar `--force`, `--legacy-peer-deps`, actualizaciones automáticas o audit fix.

## Contraste, evidencias y límites vigentes

[Pruebas y ratios](t029-t031.md), [texto/contraste y enmienda de SC-005](android-texto-contraste.md),
[TalkBack](android-talkback.md), [Android final](android-final.md),
[cierre de dependencias T032](t032-t034.md).
Texto normal >=4.5:1; grande y controles/foco >=3:1. Pares de texto usados:
principal 17.7397/16.1195, secundario 10.3074/9.3659, error 6.4700/5.8791,
éxito 7.1303/6.4791 sobre fondo/superficie. Blanco/acción: 6.7016:1.
Son cálculos de tokens, no mediciones físicas. AppButton configura mínimos 48×48;
T034 admite comprobación técnica y uso manual sin nuevas mediciones nativas.

La enmienda autorizada de US3/SC-005 acepta máximo disponible para esta fundación.
No hubo medición exacta de 200 % ni mediciones nativas de ese escalado; su validación
queda como trabajo futuro. No se reabre T034/T035 por ese límite documentado.

Últimos resultados previos: 67 unitarias, 38 regresiones arquitectónicas y 11 pruebas
de presentación; check en 0, Doctor 20/20 y exportación Android aprobados según
las atribuciones de sus registros. No son una reproducción nueva de T036.
**9 vulnerabilidades moderadas reportadas por npm pendientes de análisis**:
sin auditoría de seguridad aprobada, sin audit fix. No hay integración Supabase,
RLS/transacciones reales ni garantías multitenant demostradas por el adaptador local.
La reproducción de instalación y chequeos desde esta guía queda para T037.
