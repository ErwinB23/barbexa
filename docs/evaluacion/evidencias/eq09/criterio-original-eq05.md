## EQ-05. Disponibilidad: acceso a citas

| Elemento | Descripción |
|---|---|
| Atributo | AC05 |
| Fuente del estímulo | Usuario. |
| Estímulo | Intenta autenticarse y consultar o gestionar sus citas. |
| Artefacto | Auth, consultas de citas y Edge Function de reserva. |
| Entorno | Servicio publicado y observación mensual con monitoreo. |
| Respuesta | Atiende el flujo o comunica una interrupción recuperable. |
| Medida | Meta por validar: disponibilidad mensual de al menos 99,5 % del flujo supervisado; registrar también mantenimientos e interrupciones. |
| Herramienta propuesta | Grafana Synthetic Monitoring, con comprobaciones programadas del flujo de acceso y consulta. |
| Procedimiento | 1. Configurar una cuenta y una barbería de prueba para comprobar autenticación, consulta y una operación controlada de reservas, con limpieza de sus datos y límite de respuesta documentado. 2. Ejecutar comprobaciones programadas durante un mes completo. 3. Registrar interrupciones y mantenimientos. 4. Estimar tiempo disponible a partir de los intervalos supervisados y calcular tiempo disponible dividido entre tiempo observado, multiplicado por 100. Informar por separado los intervalos sin datos. |
| Evidencia | Historial de comprobaciones, periodo e intervalos de observación, interrupciones y cálculo mensual. La meta es al menos 99,5 %. Una ejecución aislada o una prueba de pocos minutos no valida el objetivo mensual. |
| Estado | Propuesto; pendiente de definir el conjunto final de pruebas y validar la medida. |

