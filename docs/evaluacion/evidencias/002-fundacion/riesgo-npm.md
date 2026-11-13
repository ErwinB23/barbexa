# T002 — Análisis npm, bloque 1

Fecha: 2026-11-11. Ejecutado por Codex. Análisis completado, riesgo sin remediar ni aceptar
formalmente; no es una auditoría de seguridad aprobada. Sin cambios de dependencias.

## Consultas y resultados

| Comando | Código | Resultado |
| --- | --- | --- |
| npm.cmd audit --json, intento sandbox | 1 | Error de acceso al endpoint/caché; no auditoría válida |
| npm.cmd audit --omit=dev --json, intento sandbox | 1 | Mismo error de entorno |
| npm.cmd audit --json, repetido con permiso de red | 1 | **9 moderadas**, cero high/critical reportadas |
| npm.cmd audit --omit=dev --json, con permiso de red | 1 | **3 moderadas**, cero high/critical reportadas |
| npm explain minimatch --depth=4, mediante CLI npm existente | 0 | Árbol instalado confirma las cadenas del lock |

Datos originales de ambas consultas válidas: [npm-audit.json](npm-audit.json). Exit 1 en
estas dos consultas significa hallazgos, no fallo del registry. package.json/package-lock.json
mantienen sus hashes T001. No ejecutar fix, force, downgrade ni overrides en este bloque.

## Directas, transitivas y alcanzabilidad

| Rama | Ruta comprobada y clasificación | Impacto y límites |
| --- | --- | --- |
| Producción según npm | expo 58.0.24 (directa) → @expo/fingerprint 0.21.10 (transitiva) → minimatch 10.2.6 (transitiva) | Tres nodos afectados en omit=dev; no demuestra que fingerprint se ejecute dentro del bundle Android |
| Desarrollo | eslint-config-expo 58.0.4 (directa dev) → @typescript-eslint/eslint-plugin/parser y type-utils/typescript-estree/utils → minimatch 10.2.6 | Seis nodos adicionales afectados en el reporte completo; tooling de análisis, no un endpoint PostgreSQL |

El nodo minimatch dev existe en tres ramas instaladas de plugins/parser. La versión 3.1.5
presente en otra rama no aparece afectada por este aviso; no confundir todas las versiones.
Los nueve nodos reportados propagan una causa actual, no nueve exploits independientes.

Lectura estática nueva: @expo/fingerprint/build/utils/Path.js importa Minimatch y construye
matchers de patrones de ignore. En typescript-estree/dist/useProgramFromProjectService.js
se aplica minimatch a allowDefaultProject. Búsqueda rg de minimatch/fingerprint en src:
sin coincidencias (exit 1 normal de rg). No se ejecutó exploit ni se reconstruyó el bundle.
Una ruta inicial rg apuntó a un typescript-estree no hoisted inexistente (diagnóstico de
ruta); se localizaron las copias reales anidadas por lockfile, sin modificar node_modules.

El [aviso GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) describe
amplificación de patrones y consumo excesivo de CPU/memoria, con optimizationLevel >= 2;
afecta >=7 y <11.0.1. No se acreditó que esta condición se active con entradas de usuarios
en la aplicación. El riesgo plausible está en tooling que procese patrones no confiables;
controlar configuración/globs reduce exposición sin eliminar el hallazgo. No afirmar RCE,
fuga de datos o vulnerabilidad demostrada en PostgreSQL/Android.

## Reconciliación 9 → 8 → 9

El antecedente de 001 era nueve; research de 002 registró ocho totales/tres sin dev.
La consulta de este bloque vuelve a nueve/tres e incluye eslint-config-expo como metanodo
afectado, que no estaba en la enumeración anterior de ocho. No se modificaron paquetes ni
lock: la variación de respuesta/clasificación del servicio de audit no acredita remediación.
No se atribuye una causa interna del registry que no se haya comprobado.

## Posibles remediaciones, no ejecutadas

1. Buscar una corrección upstream de fingerprint/Expo compatible con SDK 58 y una de la
   cadena ESLint compatible con eslint-config-expo instalado. Verificar manifiestos y peers
   antes de proponer versiones concretas; después probar en copia aislada con lock nuevo,
   expo install --check, doctor, calidad y exportación Android según el cambio autorizado.
2. El aviso señala minimatch 11.0.1 corregido, pero las ramas observadas piden ^10.2.x:
   imponer major 11 mediante override no es una remediación compatible demostrada.
3. npm propone expo 52.0.49 y eslint-config-expo 6.0.0 como fixes mayores. No aplicarlos:
   desalinean la base SDK 58 aprobada. El campo fixAvailable no prueba compatibilidad.
4. Si no hay parche compatible, documentar exposición residual y obtener aceptación
   explícita o planificar actualización controlada aparte. T002 no acepta el riesgo por
   cuenta del responsable ni instala SDK Supabase. Mantener patrones de tooling controlados.

Fuentes consultadas: [npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/) y
[actualización oficial Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).
No se ejecutaron sus comandos de actualización. La investigación identifica alternativas;
ninguna versión sustituta queda recomendada como compatible sin comprobación posterior.
