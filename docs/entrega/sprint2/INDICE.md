# Sprint 2 — índice central de entrega

26/11/2026, America/Lima. Entrada para evaluación del proyecto funcional privado
BARBEXA. Código y primera versión Web disponibles; la validación integral de los
diez EQ conserva limitaciones explícitas. No se modificaron criterios para aprobar.

## 1. Código fuente organizado según arquitectura

| Recurso | Evidencia |
| --- | --- |
| Cliente y módulos | [src](../../../src/), [composición](../../../src/composition/), [features](../../../src/features/) |
| Servidor y transacciones | [Edge Functions](../../../supabase/functions/), [migraciones SQL](../../../supabase/migrations/) |
| Flujo y principios SOLID | [Análisis del código real](../../evaluacion/evidencias/004-reservas/calidad.md), [puertos y casos de uso](../../evaluacion/evidencias/eq08/trazabilidad.json) |
| Independencia de capas | [Informe EQ-08](../../evaluacion/evidencias/eq08/INFORME.md), [importaciones](../../evaluacion/evidencias/eq08/importaciones.csv), [resultados](../../evaluacion/evidencias/eq08/resultados.json), [logs sanitizados](evidencias/arquitectura-sustitucion.txt) |
| Spec-Driven Development | [18 especificaciones](../../../specs/), ejemplo [spec de reservas](../../../specs/004-mvp-reservas/spec.md), [plan](../../../specs/004-mvp-reservas/plan.md), [tareas](../../../specs/004-mvp-reservas/tasks.md), [Constitución](../../../.specify/memory/constitution.md) |

La organización es modular, con dominio/aplicación propios por cada lado y
dependencias hacia el núcleo. Los documentos `plan.md`/`research.md` contienen
decisiones; no se atribuye un catálogo de ADR independiente inexistente.

## 2. Primera versión funcional

Web recorrida manualmente por los cuatro perfiles operativos aceptados por el
responsable: cliente, barbero, barbero invitado como administrador y propietario
que también trabaja como barbero. Pagos de recepción manual, sin pasarela ni
verificación automática de Yape.

- [Alcance implementado y límites](../../evaluacion/evidencias/eq05/SITUACION-SPRINT2.md).
- [E2E de conflicto real y recuperación](../../evaluacion/evidencias/eq09/INFORME.md).
- [Estadísticas Playwright](../../evaluacion/evidencias/eq09/playwright-resumen.json)
  y [captura de recuperación](../../evaluacion/evidencias/eq09/03-reserva-recuperada.png).

Una emulación móvil Web no sustituye Android nativo ni pruebas con participantes.
Mapas, imágenes y reseñas no se declaran completos; no se implementan para esta entrega.

## 3. OpenAPI y Swagger

- [OpenAPI 3.0.3](../../api/openapi.json): contrato REST real de la implementación.
- [HTML del visor](../../api/index.html), [configuración segura](../../api/swagger-init.js).
- [Script del visor](../../../scripts/serve-api-docs.mjs).
- [Validación aceptada](../../evaluacion/evidencias/004-reservas/reproducibilidad.json).

Ejecutar manualmente `npm run docs:api` en la raíz; puerto predeterminado 8082,
alternativo `npm run docs:api -- --port 8083`, enlace exacto mostrado en terminal.
Solo 127.0.0.1 y sin operaciones interactivas. Abrir el archivo HTML directamente
en GitHub no inicia Swagger ni un servidor.

## 4. Pruebas automatizadas y cobertura

| Evidencia | Alcance |
| --- | --- |
| [Pruebas del cliente](../../../tests/unit/), [presentación/integración](../../../tests/integration/), [servidor](../../../tests/server/) | Casos de uso, reglas, adaptadores y controles reales existentes |
| [Reproducción en checkout limpio](../../evaluacion/evidencias/004-reservas/reproducibilidad.json) | Commit probado 9192d1a; `npm ci`, `npm run check`, OpenAPI y Web aprobados históricamente |
| [Cobertura agregada aceptada](evidencias/cobertura-aceptada.json) | Núcleo cliente: 100 % líneas, 100 % funciones, 93,1425 % ramas; servidor 100/100/100 % |
| [15 comprobaciones locales de EQ-01/03/07/10](../../evaluacion/evidencias/004-reservas/sprint2-closure/results.json) | Autorización, carrera de pago, fallo/reintento de correo y política histórica |
| [EQ-08 sin red](../../evaluacion/evidencias/eq08/resultados.json) | Casos de uso cliente/servidor con sustitución de puertos; no necesita HTTP ni PostgreSQL |
| [EQ-09 con Playwright](../../evaluacion/evidencias/eq09/resultados.json) | Un recorrido Web aprobado; conflicto 409 y recuperación 201, servicios conservados |
| [Monitor: doce tests acotados](evidencias/monitor-tests.txt) | Política, protección frente a duplicación y presentación; no se atribuye cobertura nueva del producto |

La cobertura tiene alcance de dominio/aplicación, no del 100 % de toda la UI. Los
conjuntos de pruebas que se superponen no se suman como si fueran casos distintos.
Playwright y Chromium fueron herramientas externas explícitas del laboratorio:
`npm ci` del proyecto no instala automáticamente ese entorno E2E. Véase su
[procedimiento específico](../../evaluacion/evidencias/eq09/INFORME.md).

## 5. Validación de atributos de calidad

Fuente de estado: [matriz EQ-01–EQ-10](../../evaluacion/evidencias/004-reservas/k6-final/REQUISITOS-CALIDAD.md).

| EQ | Estado actual |
| --- | --- |
| 01 Seguridad | Cumplido en el conjunto definido |
| 02 Aislamiento | Parcial: imágenes/reseñas del escenario original pendientes |
| 03 Integridad concurrente | Cumplido en los casos acordados |
| 04 Rendimiento | Cumplido en laboratorio y alcance de consultas definido |
| 05 Disponibilidad | Parcial integral: hora local acreditada; mes publicado no evaluado |
| 06 Escalabilidad | Cumplido en laboratorio y mezcla definida |
| 07 Confiabilidad del correo | Cumplido para fallo controlado y reintento sin duplicación |
| 08 Mantenibilidad | Parcial integral; núcleo construido acreditado, proveedores de mapas/imágenes pendientes |
| 09 Usabilidad | Parcial integral; conflicto/recuperación Web acreditados, ubicación/Android/participantes pendientes |
| 10 Historial | Cumplido en campos/casos definidos |

| Informe | Datos y gráficas para presentar |
| --- | --- |
| [Lecturas k6](../../evaluacion/evidencias/004-reservas/k6-final/INFORME.md) | [CSV por tramo](../../evaluacion/evidencias/004-reservas/k6-final/tramos.csv), [seis gráficas PDF](../../evaluacion/evidencias/004-reservas/k6-final/graficas/graficas-k6.pdf), [p95/p99 PNG](../../evaluacion/evidencias/004-reservas/k6-final/graficas/01-latencias.png) |
| [Carga mixta](../../evaluacion/evidencias/004-reservas/k6-mixta-final/INFORME.md) | [Niveles CSV](../../evaluacion/evidencias/004-reservas/k6-mixta-final/niveles.csv), [cuatro gráficas PDF](../../evaluacion/evidencias/004-reservas/k6-mixta-final/graficas/graficas-mixtas.pdf), [latencias SVG](../../evaluacion/evidencias/004-reservas/k6-mixta-final/graficas/01-latencias.svg) |
| [Disponibilidad EQ-05](../../evaluacion/evidencias/eq05/INFORME.md) | [Informe PDF](../../evaluacion/evidencias/eq05/INFORME.pdf), [resumen JSON](../../evaluacion/evidencias/eq05/resumen.json), [sondeos CSV](../../evaluacion/evidencias/eq05/sondeos.csv), [tres gráficas PDF](../../evaluacion/evidencias/eq05/graficas/eq05-disponibilidad.pdf), [estado SVG](../../evaluacion/evidencias/eq05/graficas/01-estado.svg) |
| [Integridad y casos acotados](../../evaluacion/evidencias/004-reservas/sprint2-closure/CIERRE-SPRINT2.md) | [Resultados](../../evaluacion/evidencias/004-reservas/sprint2-closure/results.json); persistencia/aislamiento no se sustituyen por una gráfica de HTTP |

Lecturas hasta 1.000 VU y mezcla hasta 100 VU son series independientes. El p95
HTTP global de la mezcla a 100 VU fue 3,66 s; los p95 de consultas fueron 4/8/7 ms.
No se oculta esa diferencia ni se inventan percentiles de confirmación ausentes.
Los **2.000 VU** siguen como meta adicional pospuesta, ajena al cierre de EQ-04/EQ-06.

EQ-05: 360 éxitos, cero fallos/sin datos, disponibilidad y cobertura 100 % en una
hora local. El intento parcial anterior permanece separado. Adaptación frente
al mes publicado original pendiente de aceptación docente, sin extrapolación.

## Entrega, revisión y sustentación

- [Plan de publicación y commits propuestos](PUBLICACION.md).
- [Guía de sustentación](GUIA-SUSTENTACION.md).
- [Inventario de archivos pendientes y selección](archivos-publicacion.csv).
- [Resultado de revisión del paquete](revision-publicacion.json).
- [Trazabilidad de copias sanitizadas](evidencias/copias-sanitizadas.json).
- [Situación actual y pendientes estrictos](../../evaluacion/evidencias/eq05/SITUACION-SPRINT2.md).

Las rutas `.artifacts/`, traces, reportes nativos y logs privados mencionados por
informes históricos son referencias de custodia local, no archivos para GitHub.
El índice enlaza resultados agregados publicables y copias sanitizadas. Los
originales se preservan sin sobrescrituras. No se ha publicado esta actualización.
