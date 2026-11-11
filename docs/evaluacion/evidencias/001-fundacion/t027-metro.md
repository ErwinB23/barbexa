# Corrección de empaquetado Android posterior a T027 — 11/11/2026

Alcance: corregir la resolución de imports del flujo existente. No se ejecutaron
T028–T040. Rama `main`, HEAD `904ff3de1a612ddb849a3f9a3a957df2e5d0b3c3`.
Windows/PowerShell, Node 24.21.0, npm 11.19.0, Expo 58.0.23; sin instalaciones.

## Error reproducido y causa

El usuario reportó `Unable to resolve
"../features/foundation/application/get-app-information.js" from
"src/composition/app-composition.ts"`. Codex reprodujo el mismo error mediante
exportación Android real: [registro inicial, salida 1](t027-metro-android-rojo.log).

Los archivos reales son `get-app-information.ts`,
`local-app-information-adapter.ts` y `validate-information-request.ts`; no existen
sus homólogos `.js` en `src`. Metro intentaba resolver los nombres explícitos
con `.js` sin sustituir esa extensión por `.ts`. TypeScript y los loaders de las
pruebas resolvían esos nombres de otro modo, por lo que sus resultados anteriores
no acreditaban la compatibilidad con Metro.

Grafo ejecutable afectado: `_layout.tsx` → `app-provider.tsx` →
`app-composition.ts` → caso de uso/adaptador local; el caso de uso importa el
validador de dominio. Se revisaron los imports del resto de `src`: las restantes
referencias `.js` son solo de tipos y se eliminan al transformar el código.

## Corrección mínima

- `src/composition/app-composition.ts`: imports ejecutables del caso de uso y
  del adaptador local sin extensión.
- `src/features/foundation/application/get-app-information.ts`: import ejecutable
  del validador sin extensión.

Solo tres imports modificados. Se conservaron las extensiones `.js` de los tests
y de los imports de tipos. No cambiaron contratos, reglas, configuración,
dependencias, checker, rutas ni UI.

La configuración actual `NodeNext`, sin `type: module` en `package.json`, emite
CommonJS para estos archivos. Node resuelve los `require` sin extensión a los
`.js` compilados; las 53 pruebas unitarias ejecutaron esa salida real.
[Diagnóstico de archivos, formato y emisión](t027-metro-diagnostico.log).
Una futura migración a ESM requeriría volver a evaluar esta compatibilidad.

## Verificaciones ejecutadas por Codex

Exportación antes y después, desde la raíz, con `CI=1` y `EXPO_OFFLINE=1`:

```powershell
node node_modules/expo/bin/cli export --platform android --output-dir <temporal-externo> --clear --max-workers 2
npm.cmd run check
node docs/evaluacion/evidencias/001-fundacion/verificar-rutas.mjs
node docs/evaluacion/evidencias/001-fundacion/verificar-proveedor.mjs
git diff --check
```

Cada exportación utilizó un subdirectorio distinto (`android-rojo`,
`android-verde`, `android-final`) del temporal externo registrado en los logs.

| Control | Resultado real |
| --- | --- |
| Exportación inicial sin corrección | Salida 1; reproduce el import no resuelto |
| Primer intento corregido en aislamiento | Imports resueltos; salida 1 por `hermesc.exe: permission denied` |
| Reintento autorizado fuera del aislamiento | Salida 0; 1161 módulos, bundle Hermes `.hbc` de 2 499 002 bytes y 26 assets |
| TypeScript app y núcleo | Salida 0 |
| ESLint y Prettier | Salida 0 |
| Auditoría arquitectónica real | Salida 0; 20 módulos, 4 de núcleo, 33 aristas; sin infracciones |
| Regresiones arquitectónicas | 38/38 aprobadas |
| Unitarias compiladas con `node:test` | 53/53 aprobadas |
| Presentación | 6/6 aprobadas, incluido error seguido de reintento exitoso |
| Navegación y proveedor | Salida 0 en ambos scripts |
| Diferencias y preservación | `git diff --check` en 0; ver inventario de integridad |

Registros: [permiso Hermes](t027-metro-hermes-permisos.log),
[exportación final](t027-metro-android-final.log),
[controles completos](t027-metro-check.log), [rutas](t027-metro-rutas.log),
[proveedor](t027-metro-proveedor.log), [integridad](t027-metro-integridad.json).
Se conservaron las advertencias de reconstrucción de caché y `NO_COLOR`/`FORCE_COLOR`;
no impidieron la exportación final. Git advirtió sobre normalización futura LF/CRLF.

Cobertura del núcleo ejecutable: 100 % de líneas, funciones y ramas, solo del
caso de uso y validador. No se atribuye ese porcentaje a UI, adaptador o composición.
No se modificaron pruebas para conseguir estos resultados.

## Artefactos y límites

Las salidas de empaquetado permanecen fuera del repositorio, bajo el temporal
`app-barberia-metro-fc93271a412b426696f8d62594436729` del sistema.
[Tamaños y SHA-256 del bundle y metadata](t027-metro-artefactos.json).
La compilación de pruebas limpió su propia `.test-build`.

El bundle Android está generado; no es una APK ni una prueba en dispositivo.
El usuario debe volver a abrir la aplicación en Expo Go y comprobar Bienvenida,
Base técnica, información cargada y regreso. Codex no ejecutó Android ni TalkBack.
La acreditación del escalado exacto al 200 % sigue pendiente. Sin commit ni push;
se preservaron los cambios locales anteriores y las evidencias históricas.
