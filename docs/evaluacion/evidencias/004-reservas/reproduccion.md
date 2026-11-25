# T031 — pipeline preparado y reproducción

15/11/2026. Preparación independiente de los recorridos físicos pendientes de T030.
No se publica el workflow ni se declara una ejecución de GitHub Actions.

## Entorno y comandos

- Node **24.21.0**, npm del entorno; dependencias exactas/resueltas en `package-lock.json`.
- Deno **2.9.8**, Supabase CLI **3.1.0** existente si se ejecutan pruebas de base.
- Windows/PowerShell, Web y APK Development existentes. No instalar ni compilar de nuevo
  para comprobar cambios exclusivamente JavaScript. El pipeline usa `windows-latest`
  para los tests de junctions y herramientas que ya se comprobaron en Windows.

En una futura copia limpia autorizada: `npm ci` y después `npm run check`.
Aquí se comprobó el check sobre la instalación existente; **no se ejecutó otra instalación
limpia** ni se atribuye una reproducción nueva a las evidencias históricas de 001/002.
Para cobertura servidor: `npm run coverage:server`; los tests no requieren servicios reales.
En local con coverage ad hoc, `DENO_DIR` debe coincidir entre recolección e informe.

SQL y HTTP reales se ejecutan separadamente mediante el runner seguro, solo tras
verificar proyecto/puertos y autorización de datos. Las migraciones versionadas están en
`supabase/migrations`; no editar las aplicadas, no resetear bases ni usar un historial
vacío como prueba de ausencia de objetos. No aplicar migraciones por ejecutar este pipeline.
Los conjuntos T019/cancelación permanecen conservados por instrucción del usuario.

## Seguridad del workflow

`.github/workflows/quality.yml`: push main, pull_request y ejecución manual; token
`contents: read`, checkout sin credenciales persistentes. Ninguna interpolación de datos
del PR en scripts, secretos, acciones de despliegue, cachés ni subida de artefactos.
Tres acciones fijadas por SHA completo, contrastadas con GitHub API oficial:

| Acción | Versión | SHA |
| --- | --- | --- |
| actions/checkout | v4.2.2 | 11bd71901bbe5b1630ceea73d27597364c9af683 |
| actions/setup-node | v4.4.0 | 49933ea5288caeca8642d1e84afbd3f7d6820020 |
| denoland/setup-deno | v2.0.3 | e95548e56dfa95d4e1a28d6f422fafe75c4c26fb |

Revisión con `github-actions-hardening`: triggers no privilegiados, permisos mínimos,
sin ejecución de PR no confiable con secretos, sin superficies de inyección en `run`.
YAML parseado con `js-yaml` ya disponible: código 0; pines/triggers/permisos comprobados.
No se instaló parser ni herramienta nueva. El despliegue deberá ser otro proceso
autorizado, separado de PRs; **CD no implementado**. El primer run remoto sigue pendiente
de guardar/publicar el trabajo, acción actualmente prohibida. Cuota/costos de GitHub
Actions deben comprobarse antes de autorizar ejecución remota; aquí no se consumió CI.
