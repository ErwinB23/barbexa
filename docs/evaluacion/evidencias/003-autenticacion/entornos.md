# T003 — Inventario y preparación de entornos

13/11/2026, America/Lima. Estado: inventario ejecutado; cierre pendiente de elección y
aprobación de preparación Android. No instalar ni iniciar builds en T001–T004.

Codex ejecutó Get-Command, Test-Path/Get-Item de ubicaciones estándar, node --version,
npm --version y java -version (todos los comandos de versiones ejecutados con código 0).
herramientas-inventario.json registra detección; ausencia en PATH/ubicación estándar no
prueba ausencia en todos los discos.

| Herramienta | Resultado |
| --- | --- |
| Node / npm | 24.21.0 / 11.19.0 |
| Chrome / Edge instalados | 157.0.8103.52 / 157.0.4341.46, versiones de archivos; no flujos probados |
| Lector Web | Narrator.exe 10.0.26100.8972 existe; no sesión de lectura ejecutada. NVDA no encontrado en dos rutas estándar. |
| Java | Java 1.8.0_291, no acreditar JDK moderno compatible con build Android actual |
| javac, adb, emulator, sdkmanager, eas | No disponibles en PATH |
| Android SDK | No existe ubicación estándar LOCALAPPDATA/Android/Sdk; ANDROID_HOME/ANDROID_SDK_ROOT no configuradas |
| Deno | Ejecutable detectado, no se requiere correr pruebas de servidor en este bloque |
| Android físico | Honor 90 Lite CRT-NX3, Android15/ExpoGo58.0.5: antecedente declarado por usuario en 001/002, no conexión ni versión actual comprobadas hoy |

## Vías propuestas, decisión pendiente

1. Build local: preparar JDK/Android Studio/SDK y adb compatibles con SDK58, configurar
   dispositivo autorizado. Expo run:android generaría código nativo y compilaría después;
   no ejecutado. Deben revisarse versiones oficiales/herramientas antes de instalar.
2. EAS development build: requiere cuenta Expo, configuración, CLI y posible uso/costo
   de servicios. Reduce toolchain local para compilar, no equivale a autorización de cobro
   ni demuestra instalación en teléfono. Requiere expo-dev-client si se adopta ese flujo.

Scheme appbarberia ya está en app.json; no identifier Android definitivo acreditado ni
build propio existente. Probar callback en build propio, frío/caliente y tras reinicio;
Expo Go no sustituye esa aceptación. Ningún servicio, contenedor o emulador iniciado.

Fuentes: [build local](https://docs.expo.dev/guides/local-app-development/),
[development builds](https://docs.expo.dev/develop/development-builds/introduction/).
No hay garantía de entorno Android listo. Pregunta de vía/build presentada al responsable;
hasta respuesta, no marcar T003 completa ni habilitar T004/T005 dependientes.
