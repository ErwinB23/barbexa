# T003 — Inventario y preparación de entornos

Estado vigente14/11: T009 completada,9/36; APK/instalación/API/schemes acreditados y
[CORS público local corregido](t009/kong-cierre.md). Reaplicar operador si Supabase recrea
Kong. Sin segunda build, Cloud ni nuevos usuarios. Debajo se conserva el historial.

Actualización T009: [resultado técnico autorizado](t009/resultado.md). Correo SMTP recibido
y transporte/configuración development preparados; falta build instalado, scheme y acceso
API desde React Native. Cuenta/cuota siguen siendo evidencia manual del usuario.

Resultado posterior: [build EAS development terminado](t009/eas-build.md), uno autorizado,
FINISHED; cuota previa reconfirmada por usuario Free0/15 usadas,15 disponibles. CLI
autenticada y proyecto contrastados por Codex. APK aún no instalado/probado por Codex.

## Avance T009 reportado por el usuario — 13/11/2026

El usuario confirmó @erwin23, Free, 0/15 builds Android usados al consultar; proyecto
@erwin23/app-barberia vinculado, ID d428c9e5-0852-43c3-974c-fae3bf286f3e, package
com.erwin23.appbarberia y scheme appbarberia. Es evidencia manual, no consulta autenticada
de Codex ni garantía de cuota futura. Informó expo-dev-client instalado y Expo Check correcto.

Codex contrastó app.json/eas.json y ejecutó solo expo config --type public --json (0):
owner/slug/projectId/package/scheme coinciden; perfil developmentClient=true,
distribution=internal. No build iniciado. Continúa pendiente correo efectivo y pruebas
del build propio/scheme/conectividad desde RN. El inventario inferior es histórico.

## Actualización manual del usuario para preparar T009 — 13/11/2026

El responsable confirmó personalmente cuenta Expo activa, acceso mediante GitHub y plan
Free; EAS development build Android elegido. Origen: comprobación manual reportada por
el usuario, no consulta autenticada de Codex. No se conoce cuota restante, owner/proyecto
EAS vinculado ni firma/configuración de build; no se infieren a partir de login con GitHub.
No confundir ese método de acceso con integrar el repositorio GitHub al servicio de builds.

Lectura local actual: falta expo-dev-client y EAS CLI; no eas.json ni android.package,
owner o extra.eas.projectId en app.json. Scheme appbarberia sí existe. No se instaló ni
ejecutó EAS; las comprobaciones de abajo se conservan como histórico de T003.

13/11/2026, America/Lima. Estado: T003 completada como inventario y decisión de vía;
EAS development build elegido expresamente por el usuario. No instalar ni iniciar builds
en T001–T004; no implica que el entorno Android esté listo para pruebas funcionales.

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

## Vías inicialmente propuestas (histórico)

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
No hay garantía de entorno Android listo. La pregunta inicial ya fue respondida: EAS.

## Decisión y revisión pública de EAS

El responsable eligió EAS Build de desarrollo, con revisión de cuenta, requisitos y costos
antes de ejecutar. No autorizó instalaciones, login, creación/vinculación de proyecto Expo,
compilación ni cargos. No se verificó cuenta/plan/cuota EAS privada: no hay CLI instalada
ni acceso autenticado asumido. Verificarlo posteriormente antes de iniciar una compilación.

Documentación oficial consultada el 13/11/2026: se requiere cuenta Expo, EAS CLI,
expo-dev-client para development build y configuración de proyecto/perfil Android.
Definir identifier Android y firma de la app antes del build; no inventarlos ni generar
credenciales aquí. La compilación Cloud evita instalar JDK/Android Studio para compilar;
adb/platform-tools podría requerirse para transporte/pruebas locales, como decisión separada.

[Precios oficiales](https://expo.dev/pricing) consultados: Free publica 15 builds Android
y 15 iOS, cola de baja prioridad, $0/mes; Starter $19/mes más uso adicional. No equivalen
a cuota disponible de esta cuenta ni garantizan costo cero de toda operación. No contratar
plan, aceptar cargos o consumir recursos sin revisión concreta de cuota y autorización.
La advertencia genérica de la skill sobre builds pagados se interpreta conforme a estos
límites oficiales, no como obligación de contratar un plan para esta preparación.

T003 acredita inventario, requisitos ausentes, vía aprobada y condiciones de autorización;
las instalaciones/configuración/build y su verificación corresponden a T005/T009, aún no
ejecutadas. No se verificaron cuenta privada, build, USB ni lectura funcional con Narrator.
