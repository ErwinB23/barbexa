# Preparación 003 — T001–T004

13/11/2026, America/Lima. Ejecución por Codex, exclusivamente preparatoria. Plan de
36 tareas aprobado por el usuario; ninguna T005+ ejecutada, sin pantallas/Auth funcional.

## Estado individual

| Tarea | Estado y evidencia |
| --- | --- |
| T001 | Completada: integridad.json captura 1158 archivos estables (versionados + documentos 003 sin seguimiento), main/HEAD completo y estado inicial. Cotejo posterior en integridad-cotejo.json; solo tasks.md y estado compartido pueden cambiar deliberadamente. |
| T002 | Completada: consultas audit/view/explain, análisis dev/producción/directas/transitivas y lock en dependencias.md y JSON; ningún fix/paquete instalado. |
| T003 | Pendiente: inventario ejecutado en entornos.md; falta decisión/aprobación de preparación de build Android necesaria para cerrar sus criterios. No afirmar entorno listo por Expo Go histórico. |
| T004 | Pendiente: propuesta parcial en configuracion.md, bloqueada por T003 y decisiones explícitas de entorno/origen/correo/CORS/build/datos. Sin escrituras ni permiso supuesto. |

Total: 2/36. Checklist de requisitos 16/16 es gate documental, no ejecución de producto.

## Línea base y conservación

Inicio: main, HEAD 7ce4e1a09d94d5bc495a7d9016b600675885226c, staging vacío. Cambios previos:
Constitución 2.0.0, ESTADO-DESARROLLO.md, documentos 003 sin seguimiento y log activo de 002.
Se capturó estado de trabajo, no se confundió con HEAD limpio ni se revirtió documentación.
.git, node_modules y artefactos excluidos; únicamente t017-serve.log de 002 se excluye del
cotejo estable por su escritor activo. No se leyó/modificó su contenido ni operó su proceso.
Destinos se contrastaron con documentación 002: nuevo Cloud vuoncrtkkkquvddunrxx/local
app-barberia-002-local; anterior klebvayvsvibwjpkzrff prohibido. Sin conexión Cloud/Docker.

## Comprobaciones ejecutadas y límites

- check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks: 0; documentos detectados.
- Inventario SHA-256 con Node/crypto y Git: 0; sin copiar contenidos sensibles.
- node/npm/java versiones y npm explain: 0; detalle en dependencias/entornos.
- npm audit: 1 por nueve moderados; omit=dev: 1 por tres. Primer intento ENOTFOUND
  conservado, repetición con red autorizada produjo informes válidos, no auditoría aprobada.
- npm view de ambos paquetes: 0, solo metadatos públicos; SRI no es comprobación de descarga.
- Verificación raíz package/lock e instalación actual: coherente, dependencias no cambiadas.

No pruebas completas 001/002, tipos, lint, bundles ni pruebas de autenticación: no hubo
código funcional nuevo. Lectores/navegadores detectados no equivalen a accesibilidad E2E.
El análisis de paquetes no demuestra explotación ni ausencia de exposición en bundle.

## Riesgos y siguiente paso

Nueve moderados, tres sin dev, sin remediación/aceptación formal. No downgrade automático
de Expo/config; nuevas dependencias todavía no auditadas como árbol instalado.
Resolver decisiones pendientes de entornos/configuración; no iniciar T005 mientras falte
base aprobada. Cualquier checkpoint local debe incluir solo documentación revisada y excluir
log activo/secretos; su hash se consulta después de crearlo, nunca se predice aquí.
