## EQ-08. Mantenibilidad: reglas y adaptadores independientes

| Elemento | Descripción |
|---|---|
| Atributo | AC08 |
| Fuente del estímulo | Desarrollador. |
| Estímulo | Sustituye el adaptador HTTP de reservas del cliente o el de persistencia del servidor por implementaciones de prueba; también cambia una regla de reseñas o un proveedor de mapas. |
| Artefacto | Dominio, casos de uso, contratos y adaptadores de funcionalidades del cliente y del servidor. |
| Entorno | Funcionalidades construidas con contratos y pruebas de regresión disponibles. |
| Respuesta | Las reglas y casos de uso funcionan sin importar SDK, interfaz, base de datos ni proveedor concreto; el cambio se concentra en la funcionalidad y el adaptador correspondientes. |
| Medida | Cero importaciones de presentación, SDK o infraestructura en dominio y aplicación de las funcionalidades revisadas; todas sus pruebas y las de regresión acordadas aprobadas. |
| Herramienta propuesta | node:test para pruebas unitarias de reglas y casos de uso, y revisión automatizada de importaciones de cliente y servidor. |
| Procedimiento | 1. Probar `SolicitarReserva` con una implementación de prueba de `ReservaRemotaGateway`, sin HTTP ni Supabase. 2. Probar `ConfirmarReserva` con una implementación de prueba de `ReservaAtomicaGateway`, sin PostgreSQL. 3. Sustituir un adaptador de mapas o imágenes y comprobar que las reglas correspondientes no cambian. 4. Revisar las importaciones de las funcionalidades construidas y ejecutar sus pruebas de regresión. |
| Evidencia | Reportes separados de pruebas del cliente y del servidor, adaptadores de prueba y listado de importaciones revisadas. La demo de `tecnologia/` prueba los casos de uso y contratos de ejemplo, pero no sustituye las pruebas de los componentes reales ni demuestra permisos o transacciones en Supabase. |
| Estado | Propuesto; pendiente de definir el conjunto final de pruebas y validar la medida. |

