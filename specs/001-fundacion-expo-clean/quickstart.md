# Guía de implementación y validación futura — 001

**Estado:** comandos previstos, no ejecutados en esta planificación salvo consultas de entorno
documentadas en research.md. Ejecutar desde la raíz del proyecto con PowerShell 7.

## Incorporación segura (FR-001 / SC-001)

1. Registrar `git rev-parse --show-toplevel`, `git rev-parse HEAD`, `git branch --show-current`
   y `git status --porcelain=v1`. No exigir un commit nuevo para continuar; preservar cambios locales.
2. Antes de generar, crear manifiesto externo al repo en una carpeta temporal exclusiva con
   ruta relativa, longitud y SHA-256 (`Get-FileHash`) de **todos los archivos existentes** fuera
   de `.git`. Enumerar con `Get-ChildItem -LiteralPath ... -Force -Recurse -File`, sin seguir
   junctions/symlinks; detectar reparse points y detener el inventario hasta resolverlos.
   Incluir expresamente `.agents`, `.specify`, `docs`, `AGENTS.md`, `skills-lock.json`, `specs`
   y todo `git ls-files`. Mantener el manifiesto fuera de su propio conjunto de entradas.
3. Generar la plantilla fijada en research.md en una ruta temporal nueva, nunca en `.`;
   usar `--no-install`. Inspeccionar el contenido y excluir `.git`, dependencias y ejemplos
   no necesarios. No copiar recursivamente toda la plantilla sobre el repositorio.
4. Construir una lista explícita de destino para package.json, app.json, tsconfig.json,
   eslint.config.js y los recursos necesarios. Para **cada** entrada normalizar ruta absoluta,
   comprobar que permanece bajo la raíz y comparar con `Test-Path -LiteralPath`, ignorando
   mayúsculas como Windows. Detectar también colisiones archivo/directorio en ancestros.
   Si existe un destino: listar colisión y detener toda la copia. Si son idénticos, conservar
   el existente; cualquier diferencia requiere una resolución explícita, nunca `-Force`.
5. Copiar solo archivos nuevos aprobados. Volver a enumerar y comparar hashes de cada entrada
   original; comprobar también archivos desaparecidos, HEAD y rama. Cualquier discrepancia
   impide aceptar FR-001. Conservar manifiestos antes/después y lista de incorporaciones.
6. Solo después instalar y ejecutar controles. Repetir comparación de contenidos protegidos
   tras generación, instalación y verificación. No formatear masivamente documentos o skills.
   El plan de tareas podrá añadir ESTADO-DESARROLLO.md nuevo; AGENTS.md y documentos previos
   permanecen intactos en esta feature por FR-001. No borrar automáticamente temporales.

## Preparación y comandos de aceptación

Fijar dependencias y lockfile según research.md. Primera instalación autorizada: `npm install`;
reproducción posterior: `npm ci`. Nunca ejecutar instalación como parte de esta planificación.

Scripts que deberá proporcionar la implementación:

| Comando | Acción exacta prevista | Aprobación |
| --- | --- | --- |
| `npm run typecheck` | `tsc --noEmit` y después `tsc -p tsconfig.core.json --noEmit` | 0 errores; strict activo |
| `npm run lint` | `eslint src scripts --max-warnings 0` | 0 errores y warnings |
| `npm run format:check` | Prettier check sobre src, scripts y configs nuevas enumeradas | 0 diferencias; excluye archivos protegidos |
| `npm run architecture:check` | `node scripts/check-architecture.mjs` | 0 importaciones prohibidas, ciclos o rutas sin resolver |
| `npm test` | `node scripts/run-unit-tests.mjs` | compilación + todas las pruebas + cobertura objetivo |
| `npm run check` | ejecutar los cinco anteriores en orden y parar al primer fallo | todos pasan |
| `npx expo install --check` | validar versiones instaladas contra el SDK | sin incompatibilidades |
| `npx expo-doctor` | diagnóstico de proyecto | sin problemas sin resolver |
| `npx expo export --platform android --output-dir .artifacts/android-bundle` | empaquetado estático | salida correcta; NO equivale a probar Android |
| `npm start` | `expo start --go --lan` | QR/URL local disponible |

El runner compila con `tsc -p tsconfig.tests.json` a `.test-build` y ejecuta Node `--test`
con rutas explícitas de pruebas emitidas. Usar spawn con argumentos (sin glob dependiente del shell).
Configuración de pruebas independiente: NodeNext, target ES2022, rootDir `.`, outDir `.test-build`,
strict, noEmit false; incluye núcleo, adaptador local y pruebas, excluye TSX/UI. Imports relativos
con extensión `.js` se resuelven a TS al compilar; no aliases en núcleo. No heredar `noEmit` de Expo.
El script elimina únicamente su salida generada tras comprobar la ruta resuelta dentro del repo.

Cobertura Node: `--experimental-test-coverage`, umbrales de líneas/funciones 100 y ramas 90
sobre archivos emitidos de dominio/aplicación, excluyendo tests/dobles. Enumerar/importar todos
los archivos ejecutables del núcleo para que no desaparezcan del denominador. Tipos sin JS no
cuentan. Guardar reporte y lista incluida; bandera experimental se registra como limitación.

## Android real: prerrequisito pendiente

Ruta preferida: dispositivo físico Android con Expo Go compatible con el SDK elegido, misma red
que Windows y acceso a Metro. Alternativa: Android Studio, SDK/platform-tools, virtualización y
AVD Android con servicios de accesibilidad. No hay evidencia de disponibilidad de ninguno aún.
Identificar modelo, versión Android, Expo Go y escala; si se usa ADB, `adb devices -l` debe
mostrar estado `device` (no unauthorized/offline). En emulador registrar `emulator -list-avds`.
Una build de desarrollo se considera más adelante si Expo Go no soporta requisitos nativos;
no introducir EAS ni JDK/Gradle como requisito del recorrido mínimo en dispositivo con Expo Go.

1. Abrir URL raíz desde Expo Go, confirmar bienvenida sin credenciales Supabase. Guardar captura.
2. Repetir **tres** recorridos consecutivos `/` → `/technical` → Atrás del sistema → `/`.
   Comprobar también Atrás de cabecera y reinicio desde raíz; registrar cada resultado.
3. Abrir la URL Metro mostrada por CLI añadiendo `/--/ruta-inexistente` mediante enlace Android
   (con ADB disponible: `adb shell am start -a android.intent.action.VIEW -d "<URL>"`).
   Verificar mensaje y «Volver al inicio». Usar URL real; no asumir puerto o IP.
4. Activar TalkBack en Ajustes/Accesibilidad. Recorrer todos los controles, verificar lectura,
   orden, roles, estado deshabilitado, carga/error/éxito y acción de recuperación.
5. Para esta fundación, comprobar la interfaz al tamaño máximo de texto disponible
   en el Android identificado: legibilidad, controles funcionales y ausencia de
   recortes/superposiciones. Registrar el origen manual y complementar con pruebas
   de componentes/contraste. No equiparar máximo a 200 % ni inventar mediciones.
   La validación instrumental exacta al 200 % queda para una etapa futura,
   conforme a la enmienda autorizada de SC-005; no bloquea T035 revisada.
6. Verificar zonas seguras, scroll, controles >=48 dp y contraste de todos los pares utilizados.
   Registrar medidas y ratios; la captura por sí sola no demuestra contraste ni accesibilidad.
   Para T034, por decisión documentada del responsable, se acepta comprobación técnica
   de mínimos configurados y zonas seguras junto con uso manual TalkBack sin obstrucciones;
   no se exige nueva medición instrumental nativa. Registrar esa limitación sin presentar
   configuración como dimensiones medidas. Esto no modifica la validación de T035.
7. Con la aplicación previamente cargada, desconectar acceso a internet y comprobar
   información y controles locales. No exigir acceso simultáneo a Metro ni arranque offline.
   Ajuste de T033 autorizado por el responsable del proyecto; justificación y evidencia
   en `docs/evaluacion/evidencias/001-fundacion/android-final.md`.

Guardar resultados por FR/SC, fecha America/Lima, HEAD + diff local, comandos/exit codes,
versiones, logs sanitizados, capturas y límites. Véase [matriz](validation.md).
