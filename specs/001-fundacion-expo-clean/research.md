# Investigación y decisiones — 001

Consulta: 2026-11-10, America/Lima. Evidencia documental y comandos de inspección; sin instalación.

## R1. Versiones compatibles

**Decisión:** adoptar SDK 58 estable y conservar Node 24.21.0 instalado.

| Componente | Selección para implementación | Evidencia |
| --- | --- | --- |
| Node.js | 24.21.0 LTS | `node --version`; publicación oficial [N1] |
| npm | 11.19.0 | `npm --version` local |
| Expo | 58.0.23 (SDK 58) | metadata publicada de expo [E1] |
| React Native | 0.88.1 | plantilla oficial SDK 58 [E2] |
| React | 19.3.0 | plantilla y tabla de compatibilidad [E2, E3] |
| Expo Router | 58.0.30, dentro del recomendado ~58.0.30 | documentación versionada y bundledNativeModules [E4, E5] |
| TypeScript | 6.0.3, dentro del recomendado ~6.0.3 | plantilla oficial [E2] |
| safe-area-context / screens | ~5.11.1 / ~4.30.1 | plantilla SDK 58 [E2] |
| eslint-config-expo | ~58.0.4 | manifiesto compatible con SDK [E5, E6] |
| ESLint | ^9.18.0 (serie 9) | dependencia de desarrollo del config oficial [E6] |
| Prettier | ^3.8.3 (serie 3 estable) | dependencia de desarrollo del config oficial [E6] |

Expo 58.0.23 declara engines `^22.13.0 || ^24.3.0 || ^26.0.0 || >=27.0.0` [E1]:
24.21.0 satisface la rama 24. La tabla oficial vincula SDK58 con RN0.88/React19.3 [E3].
Esto acredita compatibilidad declarada; falta instalar, resolver peers y ejecutar los controles.
La plantilla fuente usa `workspace:~` para Expo/Router: no trasladar ese valor al proyecto.

Fijar los cinco componentes principales anteriores en package.json. Resolver parches de las
herramientas dentro de los rangos oficiales, guardar versiones efectivas en package-lock.json y
registrarlas con `npm ls --depth=0`. No usar `latest` para decidir RN, Router o TypeScript.
Si metadata publicada o `expo install --check` contradice esta selección, detener instalación
y actualizar esta decisión con evidencia, sin forzar peers ni ignorar diagnósticos.

**Alternativas:** SDK57 del proyecto anterior no se hereda; RN independiente del SDK y versiones
canary se descartan. TypeScript 7 no se elige: la plantilla recomienda 6 y el checker utiliza
su API documentada. No se necesita actualizar Node ni instalar otro gestor de paquetes.

Fuentes:

- [E1: paquete expo publicado](https://registry.npmjs.org/expo/latest), observado 58.0.23 y engines indicados.
- [E2: plantilla oficial SDK58](https://raw.githubusercontent.com/expo/expo/sdk-58/templates/expo-template-default/package.json), versión de plantilla 58.0.32.
- [E3: compatibilidad SDK58](https://docs.expo.dev/versions/v58.0.0/).
- [E4: Router SDK58](https://docs.expo.dev/versions/v58.0.0/sdk/router/).
- [E5: módulos compatibles SDK58](https://raw.githubusercontent.com/expo/expo/sdk-58/packages/expo/bundledNativeModules.json).
- [E6: config ESLint de SDK58](https://raw.githubusercontent.com/expo/expo/sdk-58/packages/eslint-config-expo/package.json).
- [E7: lanzamiento SDK58](https://expo.dev/changelog/sdk-58).
- [N1: Node24.21.0 LTS](https://nodejs.org/en/blog/release/v24.21.0).

Las URLs de rama y latest son mutables; los valores anteriores son los observados en esta revisión.
No se descargó ni instaló la plantilla. Algunas consultas al registry no fueron accesibles; para
Router/TypeScript y herramientas se usaron documentación y manifiestos oficiales enlazados.

## R2. Inicialización preservando el repositorio

**Decisión:** staging fuera del repositorio, plantilla `default@sdk-58`, sin instalación;
inventario y copia por allowlist según quickstart.md. Comando futuro, no ejecutado:

```powershell
npx create-expo-app@latest "$stagingPath" --template default@sdk-58 --no-install
```

`$stagingPath` será una ruta temporal absoluta nueva. Registrar versión efectiva de create-expo-app
y versión de plantilla; comprobar el package.json generado contra R1 antes de copiar.
La etiqueta SDK evita mezclar generaciones; el lockfile posterior fija el resultado reproducible.
La documentación oficial confirma plantilla default con TypeScript/Router y `--no-install`:
[create-expo-app](https://docs.expo.dev/more/create-expo/),
[TypeScript en Expo](https://docs.expo.dev/guides/typescript/).

**Alternativas:** generar sobre `.` podría colisionar con instrucciones y documentación; copiar
todo el proyecto anterior arrastraría arquitectura incompatible. Ambas descartadas.

## R3. Arquitectura y calidad

**Decisión:** feature foundation, funciones puras, un contrato real de información pública y dos
adaptadores. [Contrato](contracts/foundation.md) y [matriz](validation.md) concretan responsabilidades.
El adaptador real lee valores recibidos, sin llamadas externas; un doble ejercita sustitución y error.
No crear una función de negocio simulada, repositorios genéricos o dependencias entre módulos vacíos.

**Herramientas:** extender `expo/tsconfig.base` y activar strict; compilar también núcleo sin DOM/Node.
ESLint flat config de Expo; Prettier separado, sobre archivos nuevos enumerados, sin plugin que
convierta formato en reglas de negocio. Runner integrado `node:test`/`node:assert` sobre JS emitido
por tsc; evita Babel/Jest y no carga React Native. Tests TS con `@types/node` de serie 24, versión
efectiva registrada al resolver dependencias. Unitarias de UI y Jest Expo se reconsiderarán cuando
existan flujos que lo justifiquen; esta entrega incluye validación manual Android de la presentación.

Checker AST/grafo con TypeScript Compiler API en lugar de instalar dependency-cruiser. Debe fallar
con fixtures negativas y producir conteo de módulos. No usar solo restricciones de imports directos.
Node runner y banderas de cobertura están presentes en `node --help` local; la cobertura experimental
no reemplaza los casos explícitos. Compilar primero evita depender del stripping y aliases de Node.

Fuentes: [ESLint/Prettier en Expo](https://docs.expo.dev/guides/using-eslint/),
[TypeScript strict](https://www.typescriptlang.org/tsconfig/strict.html),
[Compiler API para TS6 y anteriores](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API),
[runner Node24](https://nodejs.org/docs/latest-v24.x/api/test.html).
La última URL sirve actualmente documentación 24.22.2: las banderas usadas se contrastaron con
`node --help` de 24.21.0 local. Ninguna suite fue ejecutada.

## R4. Navegación y diseño mínimo

**Decisión:** Stack estable, raíz `/`, `/technical` y `+not-found`; rutas delgadas y proveedor
de composición. Sin menús, tabs, animaciones ni APIs web. Tokens, cuatro componentes y galería
visual permiten comprobar identidad provisional y accesibilidad sin dominio ficticio.
Se conservan convenciones relevantes de las skills solicitadas; sus ejemplos de API propia
o UI compleja no aplican a la arquitectura/alcance aprobado.

Fuentes: [Router SDK58](https://docs.expo.dev/versions/v58.0.0/sdk/router/),
[rutas desconocidas](https://docs.expo.dev/router/error-handling/).
Alternativa descartada: colocar lógica técnica en rutas o crear un sistema de diseño completo
antes de tener consumidores. Los ratios se medirán al implementar, no se declaran satisfechos.

## R5. Android y entorno Windows

**Observado:** Windows, PowerShell7.6.9, Node24.21.0, npm11.19.0. `adb` y `emulator` no aparecen
en PATH; `%LOCALAPPDATA%/Android/Sdk` no aportó un SDK disponible; ANDROID_HOME y ANDROID_SDK_ROOT
no están definidos. Se detectó java.exe en PATH, pero no se verificó JDK compatible para builds.
Esto no prueba que no exista Android Studio en otra ubicación ni que el usuario no tenga teléfono.

**Decisión:** primera aceptación en dispositivo físico con Expo Go compatible SDK58; alternativa
AVD si se prepara SDK. Registrar cliente exacto: el lanzamiento SDK58 advierte transición de
Expo Go en tiendas [E7]. No asumir que cualquier Expo Go instalado es compatible.
Prerequisitos pendientes: dispositivo/AVD, cliente compatible, TalkBack, escala2.0, acceso local a
Metro y permiso de firewall si corresponde. Se requiere evidencia antes de cerrar SC-002/SC-005.
[Guía oficial de entorno](https://docs.expo.dev/get-started/set-up-your-environment/).

## R6. Integración posterior

Composición servidor independiente de cliente, casos de uso propios, SDK solo en adaptadores.
Sin inicializar Supabase ni seleccionar detalles SQL ahora. Base aprobada: Constitución1.0.1 y
propuesta en commit 1eb8852388480388f39035641eb87d299def9258 ya contrastada en la especificación.
Caché, DNS/CDN, CI/CD y k6 siguen obligatorios a nivel proyecto; no corresponden a implementar
esta fundación. La disponibilidad cacheada nunca autoriza confirmar una reserva.

## Cierre de investigación

Decisiones de diseño resueltas. Pendientes operativos explícitos: resolución e instalación real
de dependencias, disponibilidad de Android y ejecución de todas las pruebas. No equivalen a
ambigüedades de producto ni autorizan declarar completada la implementación.
