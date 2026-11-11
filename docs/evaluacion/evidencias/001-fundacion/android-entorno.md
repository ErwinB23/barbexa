# Entorno Android — T018 completada

Fuente manual: declaración del usuario en esta conversación. El usuario ejecutó la
aplicación en un celular Android mediante Expo Go y reportó interacción satisfactoria.
Codex no operó ni observó ese dispositivo. Fecha/hora exactas de la sesión manual no
proporcionadas; fecha de registro y estado de código en t018-integridad.json.

| Dato requerido | Evidencia disponible |
| --- | --- |
| Medio | Celular físico Android, declarado por el usuario |
| Modelo | Honor 90 Lite, CRT-NX3; declarado por el usuario |
| Versión Android | Android 15; declarado por el usuario |
| Cliente | Expo Go 58.0.5; declarado por el usuario |
| SDK del proyecto | Expo 58.0.23, ya registrado en dependencias |
| Compatibilidad práctica | Usuario declara ejecución satisfactoria con Expo Go 58.0.5 |
| Red y acceso a Metro | LAN con Metro, confirmado por el usuario; Tunnel no probado |
| ADB local | No disponible en PATH durante esta revisión; no se consultó el celular |
| Emulador | No empleado según el reporte; comando emulator no disponible en PATH |
| TalkBack | Usuario reporta lectura y navegación satisfactorias; versión/configuración no identificadas |
| Ampliación | Usuario reporta texto ampliado utilizable; porcentaje exacto no confirmado |

**Estado T018: completada.** El usuario confirmó modelo, Android, versión Expo Go y
conexión LAN/Metro. Estos son datos declarados, no metadatos extraídos del celular.
La falta de ADB no impide usar
Expo Go en teléfono físico; se registra como dato, no como requisito obligatorio nuevo.
No se necesita registrar direcciones privadas ni identificadores personales del equipo.

Código observado por Codex: main, HEAD 16b2a7cc1513ef301b3f8caa4bd162dbabc88766, con
cambios locales T014–T017 y cambio previo de tsconfig.json. No se acredita que esta sea
exactamente la instantánea usada en el teléfono: versión/diff de la sesión manual pendientes.
No se modificaron dependencias ni código de aplicación durante este registro.
