# Matriz de los 16 criterios — evidencia real y brechas

**Actualización24/11/2026:** interfaces y recorrido manual Web actual aceptados
explícitamente por el usuario para cliente, barbero, administrador secundario y
propietario que también atiende. Esto acredita aceptación funcional manual Web para
criterios6/7; no equivale a E2E automatizado, accesibilidad instrumental ni Android.
Backend Cloud y catálogo018 activos. La matriz del15nov siguiente es histórica y
requiere reconciliación técnica final; sus pendientes de Google/pagos/Cloud/UI no
deben interpretarse como estado vigente. Usar docs/CODEX-HANDOFF.md, sección1.
Persisten cierre de calidad/cobertura, publicación Web/infraestructura, CI/CD remoto,
k6, alcance de propuesta no acreditado e informe/sustentación. No asignar porcentaje
global ni cerrar los16criterios por la aceptación manual.

15/11/2026. Fuente: [rúbrica aprobada](RUBRICA.md), sin modificarla. Estado por alcance;
no es una nota ni certificación. 001/002 cerradas, 003/004 aún tienen gates pendientes.

| # | Criterio | Estado y evidencia disponible | Falta / acción concreta |
| --- | --- | --- | --- |
| 1 | Problema y requerimientos | Documentado: specs001–004, historias, FR/SC y decisiones aprobadas; propuesta referenciada por AGENTS. | Consolidar trazabilidad de entrega y distinguir SaaS final de MVP. |
| 2 | Análisis y diseño | Documentado: planes, modelos de datos y contratos003/004; análisis histórico de Supabase solo lectura. | Diagramas finales alineados con implementación y reporte académico. |
| 3 | Arquitectura de alto/bajo nivel | Implementada: composición explícita, puertos/adaptadores, núcleos independientes; checkers ejecutados. | Presentar vistas de despliegue/componentes/secuencia y sus límites reales. |
| 4 | SDD | Evidencia: spec→plan→tasks, casillas individuales y evidencias001–004. | Reconciliar gates abiertos sin convertir documentación en aceptación. |
| 5 | Unitarias e integración | Ejecutadas: calidad local, núcleos cliente/servidor, SQL/HTTP/JWT, carreras y rollback004. [Calidad](evidencias/004-reservas/calidad.md). | Mantener reporte de la versión final; mocks no son DB ni pruebas físicas. |
| 6 | E2E | Parcial: usuario acreditó Web/Android registro, sesión, reservas y agendas; operadores HTTP reales locales. | Recuperación, invitación y cancelación discrepantes, matrices y recorrido final. No hay suite E2E automatizada completa acreditada. |
| 7 | UI/UX | Funcional y accesible en recorridos previos; componentes comunes, tipografía/espaciado/contraste revisados. | Validar acabado final y controles nuevos con teclado/lector/TalkBack en ambas plataformas; no declarar rediseño completo. |
| 8 | Escalabilidad cliente/backend | Diseño modular/Edge sin estado de negocio local, proyecciones y caché comercial acotada. | Mediciones en destino real, límites de consultas/paginación/carga; no inferir escalabilidad probada de un check. |
| 9 | Escalabilidad BD | Migraciones, índices/FK, RLS y exclusión global transaccional; diez pares concurrentes locales sin doble ocupación. | Planes y capacidad bajo carga real; concurrencia correcta no equivale a capacidad ilimitada. |
| 10 | Dominio/subdominio, DNS/CDN | Pendiente: no origen Web de aceptación configurado/aprobado en este bloque. | Elegir origen/servicio, costos, DNS/CDN/HTTPS/CSP y autorizar operaciones; T032/T033004. |
| 11 | Caché | Implementada y medida localmente: [T028](evidencias/004-reservas/cache.md), TTL30s, cuenta/tenant/proyecto, invalidación. | Benchmark Web/Android y k6 real de destino; no cachear permisos ni usar slots como autoridad. |
| 12 | CI/CD | Preparado: workflow de calidad fijado, mínimos permisos y guía [T031](evidencias/004-reservas/reproduccion.md). | Publicar y ejecutar CI con autorización; CD sigue separado/no implementado. Check local no es CI remoto. |
| 13 | k6 | Pendiente, no se ejecutó k6 ni se acreditó instalación/target. | Destino/cuentas/datos y herramienta autorizados; 10VU/1min, p95<=2s, errores funcionales0 según T033, con resultados reales. |
| 14 | Código y BD en GitHub | Git local/migraciones versionadas; checkpoints anteriores reportados. | Trabajo003/004 actual sin commit/push por instrucción. Migraciones son fuente, no un volcado de datos privados. Comprobar GitHub al autorizar publicación. |
| 15 | Informe final | Informes por funcionalidad/evidencias y esta matriz. | Unificar documento académico, diagramas, resultados, límites, referencias y riesgos. |
| 16 | Presentación y dominio | Recorrido demostrable Android→agenda Web acreditado por el usuario. | Preparar diapositivas/guion/ensayo y justificar arquitectura, concurrencia, RLS y deuda; no declarar sustentación realizada. |

## Riesgos y restricciones

- Nueve avisos npm moderados siguen sin remediación/aceptación formal; no se ejecutó audit fix.
- Recovery003 requiere prueba real y URL Auth local correcta. Cloud002 no contiene por ello
  automáticamente el negocio004 ni el nuevo cliente Web: despliegue004 no autorizado.
- Invitación aún pendiente y las dos citas manuales aún confirmadas en la inspección de
  solo lectura, pese al reporte del usuario. Se conserva la discrepancia y la evidencia;
  no se aceptó/canceló nada para acomodar el resultado. Validación final programada.
- Google, pagos manuales, imágenes y otras prestaciones de propuesta siguen obligatorios
  para el producto completo, diferidos del alcance004. MVP de reservas no equivale al SaaS final.
- Sin nuevos APK, instalaciones, servicios reiniciados, datos borrados, staging o publicación.
