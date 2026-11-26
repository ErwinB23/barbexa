# Sprint 2 — situación consolidada después de EQ-05

26/11/2026, America/Lima. Revisión documental de evidencias existentes: no se
repitió k6, Playwright, cobertura del producto ni la hora de disponibilidad.

## Los cinco entregables solicitados

| Entregable | Estado sustentable | Evidencia y límite |
| --- | --- | --- |
| 1. Código organizado según arquitectura | Disponible y verificado en el alcance construido | Clean Architecture en cliente/servidor, puertos/adaptadores y 18 especificaciones SDD. [EQ-08](../eq08/INFORME.md): 88 archivos de núcleo, 199 dependencias, cero prohibidas; checkers y sustitución de adaptadores de reservas acreditados. Los cambios recientes de evidencias/harness siguen locales, sin autorización de publicación |
| 2. Primera versión funcional | Disponible en Web | Recorrido manual de cuatro perfiles aceptado por el responsable; reservas, atención, pagos manuales, equipo y administración. [E2E móvil Web](../eq09/INFORME.md): conflicto 409 y recuperación 201 sin duplicados. No declara Android nativo, mapas, imágenes, reseñas o despliegue público completos |
| 3. OpenAPI y Swagger | Disponible | [Contrato REST](../../../api/openapi.json), visor local seguro en 127.0.0.1:8082, puerto alternativo configurable y operaciones interactivas deshabilitadas. [Verificación histórica](../004-reservas/calidad.md) reutilizada; API y workflow intactos |
| 4. Pruebas automatizadas y cobertura | Disponible | Node/Deno, arquitectura, integración y E2E existentes. Cobertura aceptada reutilizada: cliente líneas/funciones 100 % y ramas 93,1425 %; servidor 100/100/100 %. [Consolidación EQ-08](../eq08/INFORME.md). Las pruebas visuales del monitor no se atribuyen a cobertura nueva del producto ni a una instalación de Jest |
| 5. Evidencias de atributos de calidad | Paquete disponible; cierre integral de diez EQ aún condicionado | Seis EQ cumplidos en su alcance definido y cuatro parciales. [Matriz de los diez EQ](../004-reservas/k6-final/REQUISITOS-CALIDAD.md). EQ-05 local: 360 éxitos/0 fallos/0 sin datos, 100 % de cobertura y disponibilidad; el mes publicado no se acredita. La aceptación de las limitaciones corresponde al docente |

## Estado integral de EQ-01 a EQ-10

| EQ | Estado | Alcance y condición restante |
| --- | --- | --- |
| EQ-01 Seguridad | Cumplido en el conjunto definido | Autorización positiva/negativa por actor, tenant y pagos; no garantía universal. [Casos acotados](../004-reservas/sprint2-closure/CIERRE-SPRINT2.md) |
| EQ-02 Aislamiento | Parcial | Núcleo y reservas acreditados; condiciones originales sobre imágenes/reseñas pendientes, fuera de la implementación actual |
| EQ-03 Integridad concurrente | Cumplido en casos acordados | Atomicidad, rollback, idempotencia y carrera de pago entre barbero/admin distintos; sin confundirlos con carga de lectura |
| EQ-04 Rendimiento | Cumplido en laboratorio | Mixta 100 VU/600 s; p95 completo de catálogo/horarios/reservas 4/8/7 ms, cero errores. [Informe mixto](../004-reservas/k6-mixta-final/INFORME.md) |
| EQ-05 Disponibilidad | Parcial integral; adaptación local de una hora aprobada técnicamente | 360 sondeos, 2.880 HTTP y 361 reservas sintéticas canceladas. Mes y servicio publicado no evaluados. Aceptación docente de la adaptación pendiente. [Informe](INFORME.md) |
| EQ-06 Escalabilidad | Cumplido en laboratorio y mezcla definida | 25/50/100 VU ×600 s; 17.630 aceptadas = persistidas, sin pérdidas. Lecturas hasta 1.000 VU separadas; no 1.000 escrituras |
| EQ-07 Confiabilidad del correo | Cumplido para fallo controlado | Persistencia y reintento sin duplicación; no declara entrega externa probada en esa evaluación |
| EQ-08 Mantenibilidad | Parcial integral; núcleo construido acreditado | Clean Architecture y sustitución de adaptadores de reservas sin red acreditadas. Sustitución original de proveedores mapas/imágenes sigue pendiente |
| EQ-09 Usabilidad | Parcial integral; conflicto y recuperación Web acreditados | Playwright móvil emulado; ubicación denegada, Android nativo y participantes pendientes. Hallazgos de foco, encuadre del aviso y texto tenue documentados sin modificar el producto |
| EQ-10 Historial | Cumplido en campos/casos definidos | Snapshots conservados y cambio real de política vigente con mantenimiento de la histórica |

## Pendientes mínimos para la sustentación

1. Presentar al docente la adaptación de EQ-05 (hora local frente a mes publicado)
   y registrar su aceptación o la limitación. Mostrar cobertura, fórmula, horarios,
   integridad y la separación del intento parcial; no extrapolar disponibilidad.
2. Presentar explícitamente las condiciones originales no completadas de
   EQ-02/EQ-08/EQ-09. No declarar cerrados los diez EQ ni desarrollar mapas,
   imágenes o reseñas para cambiar artificialmente este cierre. La aceptación
   académica del alcance construido debe quedar explícita.
3. Preparar la exposición con los cinco entregables y enlaces a las evidencias.
   Distinguir lectura, escritura y concurrencia; explicar la optimización de Kong
   y la limitación p95 global de escritura a 100 VU sin ocultarla.
4. Si se requiere que estas nuevas evidencias estén disponibles en GitHub para
   la entrega, solicitar autorización independiente para revisar y publicar los
   cambios locales. No se hicieron commits ni push en esta actividad.

No falta otra carga ni repetir la hora para los escenarios ya acreditados. Los
2.000 VU son una meta académica adicional pospuesta, independiente de EQ-04/EQ-06.
Android nativo y las condiciones de aceptación conjunta de la Constitución siguen
pendientes: la emulación Web no las sustituye. Despliegue público, CD, DNS/CDN y
el informe final conservan seguimiento propio en la [rúbrica](../../RUBRICA.md);
no se declaran completados por disponer de estos cinco paquetes del Sprint 2.

## Evidencia de EQ-05 para presentar

- [Informe académico](INFORME.md), [informe PDF](INFORME.pdf), [vista HTML](reporte.html), [resumen JSON](resumen.json).
- [Gráficas PDF](graficas/eq05-disponibilidad.pdf), [tabla de operaciones CSV](operaciones.csv).
- [Auditoría offline](auditoria-offline.json), [integridad](integridad.json).
- [Parcial anterior separado](parcial-anterior.json), [ventanas comparadas](ventanas.csv).
- [Terminal: demostración simulada](terminal-demo.svg), distinta de los resultados reales.
