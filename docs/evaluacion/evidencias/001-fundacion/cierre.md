# Cierre técnico de 001-fundacion-expo-clean — T040

11/11/2026, America/Lima. **T001–T040 completadas** conforme a la especificación
vigente y sus enmiendas autorizadas. Se cierra la fundación técnica, no el SaaS
completo ni una auditoría de seguridad.

## Estado Git y alcance

Rama inicial/final: `main`. HEAD sin cambios:
`66c2f39448274e0ccb8ed47c09bf48d78e9177d4`. Al iniciar había cambios autorizados
en informe.md y tasks.md y archivos nuevos ESTADO-DESARROLLO.md, reproduccion.md,
reproduccion.log y t037.md. Se conservaron. No se hizo commit ni push.
El commit inicial T001 `86ccdd407e55d870a0c31d26ab8bdf1aaf8a651d` sigue siendo
ancestro de HEAD (`git merge-base --is-ancestor`: salida 0); no se perdió historial.

## Cotejo SHA-256 de originales e incorporaciones

Fuente original: inventario de 585 archivos fuera de `.git`, en
`C:\Users\PREDATOR\Desktop\SEMETRE 2026 II\Arquitectura de Software\App-Barberia-evidencia-001-49cecd560ad744bfba8dc433d7ccc155\archivos-antes.json`.
Se leyó el archivo real, normalizando separadores y mayúsculas de los hashes.
No se normalizó contenido para ocultar diferencias.

**Resultado: 581 idénticos, 4 modificados con autorización, 0 eliminados,
0 diferencias inesperadas.** AGENTS.md, Constitución, rúbrica, plan, skills y
demás originales mantienen su contenido. Los cuatro cambios son:

| Original | Justificación / autorización documentada |
| --- | --- |
| specs/001-fundacion-expo-clean/spec.md | Enmienda explícita de US3/SC-005 a máximo de fuente disponible; [decisión T035](android-texto-contraste.md) |
| specs/001-fundacion-expo-clean/quickstart.md | Procedimientos armonizados con ajustes autorizados T033, T034 y T035; [Android](android-final.md), [TalkBack](android-talkback.md), [texto](android-texto-contraste.md) |
| specs/001-fundacion-expo-clean/validation.md | Método de evidencia T034 y SC-005 revisado; mismas decisiones enlazadas |
| specs/001-fundacion-expo-clean/tasks.md | Casillas de ejecución y ajustes explícitos T033–T035; T040 cierra solo tras este cotejo |

Se inspeccionó el diff de los documentos respecto al commit inicial y se
contrastó con esas decisiones. Las incorporaciones (fuentes, herramientas,
configuración, lockfile, capturas y documentación) se enumeran con sus hashes en
[integridad-cierre.json](integridad-cierre.json), junto con cada original y su
clasificación. El registro JSON no calcula su propio hash. No se incorporan
node_modules, `.git`, cachés ni salidas de empaquetado al inventario de entrega.
Los temporales de reproducción siguen fuera del repositorio, identificados en T037.

## Evidencia de los seis criterios de éxito

La [matriz de 11 FR y 6 SC](informe.md) conserva fecha, entorno, comando/código,
resultado, límite y atribución. Se verificaron T001–T039 marcadas de acuerdo con
sus registros y T040 marcada al completar esta auditoría. No hay tareas omitidas
ni identificadores duplicados.

| Criterio | Evidencia aceptada y límite |
| --- | --- |
| SC-001 | Cotejo original anterior más controles de preparación/reproducción; cambios autorizados diferenciados de pérdida de contenido |
| SC-002 | [Recorridos Android finales](android-final.md), tres ciclos, fallback y reinicio sin credenciales; declarados por el usuario, no ejecutados por Codex |
| SC-003 | [Reproducción y arquitectura](t037.md), 21 módulos, núcleo independiente y adaptadores sustituibles |
| SC-004 | [reproduccion.log](reproduccion.log): npm ci/check en 0, 67 unitarias, 38 regresiones arquitectónicas y 11 de presentación; tipos, lint, formato, checker, Doctor 20/20 y Android/Hermes aprobados |
| SC-005 revisado | [TalkBack](android-talkback.md), [enmienda y texto máximo](android-texto-contraste.md), pruebas de componentes y contraste; no medir 200 % ni dimensiones nativas por inferencia |
| SC-006 | Informe consolidado, [guía](reproduccion.md), [estado compartido](../../../../ESTADO-DESARROLLO.md) y este cierre; riesgos y rúbrica parcial explícitos |

Resultados automatizados reutilizados de T037; no nueva instalación, test general,
Doctor o exportación en T040. Android físico: Honor 90 Lite CRT-NX3, Android 15,
Expo Go 58.0.5; evidencia del usuario. El uso precargado sin internet no prueba
arranque offline ni conexión Metro en modo avión. No se probó web/iOS.

## Riesgos y siguientes funcionalidades

- **9 vulnerabilidades moderadas npm pendientes de análisis**, sin aceptación
  formal ni auditoría de seguridad aprobada. Este cierre técnico no las resuelve.
- Sin Supabase real: Auth, Edge Functions, PostgREST, PostgreSQL, Storage, RLS,
  permisos y reservas concurrentes/atómicas deberán especificarse y probarse en
  las siguientes funcionalidades. El adaptador local no acredita esas garantías.
- Caché (aislamiento/invalidation/rendimiento), DNS/CDN, CI/CD, k6 y escalabilidad
  aún pendientes; criterios académicos 1–7 con contribución parcial, 8–16 pendientes.
- El 200 % exacto y mediciones nativas del escalado son validaciones futuras,
  no resultados realizados ni condición vigente de T035 revisada.

## Comprobaciones nuevas de T040

Git status/rama/HEAD, comparación SHA-256 de los 585 originales y del estado al
inicio de T040, inspección del diff autorizado, conteo de casillas e integridad
de enlaces locales. Se actualizaron solo documentos de cierre y la casilla T040;
no código, dependencias, Constitución, rúbrica o repositorios de referencia.
`git diff --check`: salida 0, comprobada después de los cambios. Los detalles
verificables y la lista de incorporaciones están en el JSON enlazado arriba.
