# Preparación de herramientas — T007–T009

Base: `b7484843c93902ca7ff8eb9f3d92c48fe510e6dd`, rama `main`, estado inicial limpio.
Entorno: Windows/PowerShell, Node 24.21.0 y TypeScript 6.0.3 ya instalados.
Fecha exacta y hashes: [integridad](herramientas-integridad.json).

## Cambios y alcance

- T007: configuración Expo estricta con alias `@/*`, fuentes limitadas a src y tipos
  generados Expo. Configuración core independiente: ES2022, types vacío, NodeNext,
  noEmit y solo domain/application. Sin archivos ficticios dentro de src.
- T008: ESLint flat con configuración Expo instalada; Prettier separado y allowlist
  de fuentes/configuraciones autorizadas. No se instalaron plugins. Los contenidos
  previos de .agents, .specify, docs, specs, AGENTS, package.json y lockfile se ignoran.
- T009: compilación NodeNext/ES2022 independiente, tipos Node solo para tests,
  emisión a .test-build, pruebas node:test por rutas explícitas sin shell/globs de
  PowerShell. Incluye núcleo y adaptador local previsto; excluye TSX.

El runner enumera archivos ejecutables del núcleo, los precarga para incluir también
los no importados por tests y aplica umbrales 100 % líneas/funciones y 90 % ramas.
Tipos/interfaces sin lógica ejecutable quedan fuera. Solo elimina su salida marcada
tras verificar ubicación y ausencia de enlaces. Propaga errores de compilación/tests;
rechaza ausencia de pruebas o núcleo ejecutable. La cobertura de Node es experimental.

Las restricciones de imports directos/transitivos, capas y ciclos corresponden todavía
a T010–T011/T026. TypeScript sin DOM/Node bloquea globals, pero no reemplaza ese checker:
una importación explícita podría incorporar declaraciones externas. No se declara
verificada la arquitectura de un núcleo que aún no existe.

## Verificaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `node docs/evaluacion/evidencias/001-fundacion/verificar-herramientas.mjs` antes de implementar | Exit 1 esperado: falta runner; [rojo](herramientas-red.log) |
| Mismo comando después | Exit 0: nueve escenarios técnicos; [registro](herramientas-green.log) |
| `node node_modules/eslint/bin/eslint.js scripts/run-unit-tests.mjs eslint.config.js --max-warnings 0` | Exit 0 |
| `node node_modules/prettier/bin/prettier.cjs --check tsconfig.json tsconfig.core.json tsconfig.tests.json eslint.config.js .prettierrc.json scripts/run-unit-tests.mjs` | Exit 0 |
| API Prettier getFileInfo sobre archivos protegidos y permitidos | Exclusión/allowlist comprobadas, exit 0 |
| `node node_modules/typescript/bin/tsc --noEmit --pretty false` | Exit 2, TS18003: aún no hay fuentes de aplicación |
| `node node_modules/typescript/bin/tsc -p tsconfig.core.json --noEmit --pretty false` | Exit 2, TS18003: aún no existe núcleo |
| `node scripts/run-unit-tests.mjs` en este proyecto | Exit 1 esperado: faltan pruebas reales (T020) |

Registros: [lint/formato/ignore](herramientas-config.log),
[comandos sobre el proyecto real](herramientas-proyecto.log).

Los nueve escenarios aislados comprueban: ausencia de tests, éxito con compilación y
cobertura, aserción fallida, error TS, función no cubierta, rama no cubierta, archivo
no importado incluido, ausencia de núcleo y rechazo de fetch/process/document en core.
Los casos negativos deben devolver error; no son fallos de la verificación técnica.
Los fixtures se crean en un temporal externo registrado en el log; nunca en src del proyecto.
La primera ejecución en sandbox encontró EPERM al crear el enlace a node_modules;
se repitió con autorización fuera del sandbox, reutilizando paquetes existentes.

No se añadieron scripts a package.json ni se ejecutó npm test: su integración es T012.
No se ejecutaron T010–T040. Sin instalación, cambios de versiones, commit ni push.
Las pruebas reales de éxito/entrada inválida/fallo del adaptador y cobertura del negocio
quedan pendientes de T020–T026. No se acredita SC-003/SC-004 ni Android.

T007, T008 y T009 quedan completadas como **preparación de herramientas**, con los
límites anteriores. Permanecen las 11 vulnerabilidades moderadas pendientes de análisis
reportadas en el cierre anterior y el aviso de soporte de ESLint 9.

Fuentes: manifiestos/configuración local de Expo 58, `node --help` local y
[configuración flat oficial Expo](https://docs.expo.dev/guides/using-eslint/).
