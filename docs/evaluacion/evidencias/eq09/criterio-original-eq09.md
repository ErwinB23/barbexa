## EQ-09. Usabilidad: horario ocupado y consulta de ubicación

| Elemento | Descripción |
|---|---|
| Atributo | AC09 |
| Fuente del estímulo | Cliente desde un teléfono. |
| Estímulo | Confirma un horario que acaba de ocuparse o consulta barberías cercanas sin autorizar la ubicación del dispositivo. |
| Artefacto | Pantallas de reserva y exploración por ubicación. |
| Entorno | Pantalla móvil pequeña, respuesta de conflicto del servidor o ubicación no autorizada. |
| Respuesta | Explica el conflicto y permite elegir otro horario conservando los servicios; en el mapa, ofrece consultar ubicaciones o introducir una referencia sin exigir acceso a la ubicación del dispositivo. |
| Medida | Todos los casos definidos muestran información textual y una acción para continuar, sin depender solo del color, duplicar la reserva ni exigir un permiso de ubicación. |
| Herramienta propuesta | Maestro para Android; Playwright para la versión web cuando corresponda; observación con usuarios y revisión manual de accesibilidad. |
| Procedimiento | 1. Forzar una respuesta de horario ocupado y comprobar mensaje, conservación de servicios y opción de elegir otro horario sin reenvío automático. 2. Denegar el permiso de ubicación y comprobar que se pueden consultar las barberías con información textual y una ubicación proporcionada por el cliente. 3. Automatizar ambos recorridos y pedir a participantes definidos que continúen sin ayuda. 4. Revisar controles táctiles, lectura con ayudas de accesibilidad y significado independiente del color. |
| Evidencia | Reportes y capturas o grabaciones de ambos flujos, comprobación de solicitudes y ficha de observación. Registrar cuántos participantes comprenden los mensajes y completan las tareas, con sus dificultades. La muestra y el umbral de esa evaluación se definirán antes de ejecutarla; la automatización por sí sola no demuestra facilidad de uso. |
| Estado | Propuesto; pendiente de definir el conjunto final de pruebas y validar la medida. |

