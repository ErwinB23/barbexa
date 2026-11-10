# Matriz de verificación — ejecución pendiente

| Requisito | Resultado | Verificación / evidencia futura |
| --- | --- | --- |
| FR-001 | SC-001 | manifiestos SHA-256 completos antes/después, cero colisiones y HEAD intacto |
| FR-002 | SC-002 | versiones/doctor, guía reproducida y arranque Android registrado |
| FR-003 | SC-002 | tres ciclos, cabecera, reinicio y ruta desconocida con retorno |
| FR-004 | SC-003 | árbol y grafo auditado de cada módulo, control arquitectónico |
| FR-005 | SC-003 | checker incluye imports de tipos, aliases, reexports y transitividad |
| FR-006 | SC-003, SC-004 | mismo contrato con adaptador real y doble; casos válidos e inválidos |
| FR-007 | SC-002, SC-006 | arranque sin env de backend, sin llamadas remotas; diseño servidor revisado |
| FR-008 | SC-005 | tokens compartidos y galería con cuatro estados, capturas |
| FR-009 | SC-005 | TalkBack, escala 2.0, medidas 48 dp, reporte de contraste |
| FR-010 | SC-004 | scripts en cero, cobertura y fallos deliberados detectados |
| FR-011 | SC-006 | informe por todos los FR/SC con estado, entorno, versión, comando y limitación |

## Casos unitarios mínimos

- Éxito con adaptador local y con doble: misma estructura propia, una llamada.
- Idioma inválido, cadena vacía y solicitud malformada: entrada-invalida, cero llamadas.
- Gateway rechaza: no-disponible sin propagar excepción. Datos públicos malformados del
  adaptador local también se rechazan de forma controlada.
- Nueva invocación tras fallo puede funcionar; no hay estado global que conserve el error.
- Checker: fixtures positivas y negativas para imports directos, `import type`, reexport,
  alias a infraestructura, cadena transitiva, ciclo, require/import dinámico no literal.
  Los fixtures inválidos viven fuera de src; se espera exit code distinto de cero por caso.
- Cálculo de contraste con pares conocidos y todos los tokens usados; comprobar además
  el uso efectivo en vistas durante la revisión manual.

## Control automático de arquitectura

Herramienta seleccionada: script Node con TypeScript Compiler API ya disponible como dependencia
de desarrollo. Resolver tsconfig/aliases con `resolveModuleName`, analizar AST y construir grafo.
No usar solo grep ni confiar en extensiones de archivo. Contar archivos revisados y fallar si
el núcleo esperado falta, queda sin analizar o una referencia no se resuelve.

Permisos: dominio → dominio del mismo módulo; aplicación → aplicación/dominio del mismo módulo;
infraestructura → contratos de aplicación/dominio y proveedor; presentación → aplicación/dominio,
UI compartida y librerías visuales; composición → capas concretas. Rutas → vistas/composición
y navegación únicamente. Evitar barrels que mezclen capas y dependencias entre internals de features.
No paquetes externos ni Node builtins en núcleo. Prohibir acceso global a fetch, XMLHttpRequest,
WebSocket, process y mecanismos eval/require/import dinámico no resoluble en el núcleo.
Analizar tipos y reexports, recorrer cierre transitivo, prohibir ciclos y dependencias hacia UI,
infraestructura o composición desde núcleo. El compilador de núcleo usa lib ES2022 sin DOM ni
tipos Node; la compilación de tests sí permite tipos Node. Esto refuerza el control sobre globals.

El checker es pequeño y específico de estas reglas; sus fixtures prueban que no pasa vacío.
No demuestra seguridad del backend ni sustituye revisión humana. Futuras necesidades pueden
justificar dependency-cruiser; no se añade un framework arquitectónico ahora.

## Estado real al planificar

Solo se verificaron documentos, entorno Windows/Node y fuentes de versiones. Ninguna prueba
de aplicación, cobertura, exportación, integración o recorrido Android se ejecutó.
La rúbrica 1–4 recibe documentos; 5–7 recibirá evidencia parcial al implementar. Integración
real, escalabilidad, DNS/CDN, caché, CI/CD, k6 y entrega/sustentación siguen pendientes.
