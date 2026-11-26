# EQ-05 — propuesta mínima de observación durante una hora

**Estado: propuesta; no implementada ni iniciada.** No hay medición de una hora
ejecutada en esta etapa ni monitor en segundo plano. Fuente original:
[EQ-05 íntegro](criterio-original-eq05.md).

El criterio original exige **≥99,5 % de disponibilidad mensual del flujo completo
en servicio publicado**, un mes de observación, interrupciones/mantenimientos y
separación de intervalos sin datos. Una hora local solo sería evidencia preliminar
de estabilidad y del procedimiento; no acredita el objetivo mensual ni un servicio
productivo. Tampoco lo hacen health checks aislados, k6 o el E2E de EQ-09.

## Diseño mínimo a aprobar antes de ejecutarlo

- Reutilizar únicamente `barbexa-k6-lab`, datos sintéticos y marcador de propiedad.
  No Cloud, Grafana Cloud, despliegue, servicios de pago ni nuevas migraciones.
- Un proceso Node local, un único sondeo secuencial cada **60 segundos** durante
  **3.600 segundos**, con reloj monotónico. Inicios previstos: t=0…3.540; exactamente
  60 intervalos. No solapar sondeos ni recuperar retrasos con ráfagas.
- Cuenta dedicada y barbería/profesional propios del monitor, sin reutilizar los
  turnos ni las reservas de k6/EQ-09. Aprovisionar y comprobar fuera de la ventana.
- Cada sondeo: autenticación real de la cuenta, consulta autorizada de sus citas,
  disponibilidad y una confirmación sintética controlada; comprobar lectura del
  ID y posteriormente cancelar **solo esa reserva**. La cancelación conserva el
  historial en vez de borrar datos; documentar esta limpieza lógica y limitar el
  monitor a un máximo de 60 reservas nuevas. Requiere autorización explícita para
  esos fixtures/escrituras y para la conservación o limpieza selectiva posterior.
- Conservar un UUID idempotente por sondeo antes de enviar la confirmación. Ante
  timeout, consultar por UUID/identidad y conciliar SQL antes de reintentar o
  cancelar. No confirmar otra reserva a ciegas ni contar una respuesta perdida
  como éxito. No reintentos dentro del tiempo medido que oculten una interrupción.
- Límite de propuesta, definido **antes** de medir: **10 s por petición y 30 s para
  el flujo completo**. Es clasificación operacional preliminar de disponibilidad,
  no una modificación de los 3 s de consultas de EQ-04/EQ-06 ni de la meta mensual.
  Si los límites se aprueban, conservarlos toda la ventana.
- Errores HTTP, contrato, timeout o fallo de un paso clasifican ese intervalo como
  no disponible. Registrar por separado limpieza fallida, reautenticación, salud,
  CPU/RAM y sesiones PostgreSQL, para distinguir monitor/backend/host. Ante
  saturación crítica, detener de forma controlada y marcar el resto **sin datos**;
  no omitir los intervalos ni convertirlos en disponibles.

## Medición y evidencia esperada

Guardar UTC y America/Lima, inicio/fin monotónicos, duración por operación, estado,
causa de fallo, retraso respecto al cronograma, UUID sintético y reconciliación.
No JWT, contraseña, cabeceras o correos en los reportes. Credenciales y ledger
privados bajo `.artifacts/eq05/`; exportar solo agregados sanitizados JSON/CSV/HTML.

| Dato | Cálculo / interpretación |
| --- | --- |
| Tiempo programado | 3.600 s, sin ampliarlo para reemplazar fallos |
| Intervalos clasificados | Cada intervalo de 60 s se asigna al resultado del sondeo previsto; es una aproximación por muestreo, no observación continua |
| Disponibilidad de la hora observada | segundos estimados disponibles / segundos clasificados ×100 |
| Cobertura de observación | segundos clasificados /3.600 ×100; intervalos sin datos aparte |
| Interrupciones | Inicio detectado, siguiente recuperación observada, causa y mantenimientos; no inventar el instante exacto entre sondeos |
| Interpretación de 99,5 % | En una hora equivale a 18 s; resolución de 60 s insuficiente para demostrar esa precisión. No extrapolar 60/60 éxitos a ≥99,5 % mensual |
| Cierre | Conciliar únicamente filas propias, cancelaciones e invariantes; preservar todas las filas/evidencias previas |

## Siguiente paso autorizado necesario

Revisar y aprobar este protocolo (frecuencia, límites, cuenta dedicada y hasta
60 reservas con cancelación lógica). Después preparar un ejecutor local con
preflight, watchdog, cálculo explícito de intervalos y comando manual único.
**No se entrega un comando de ejecución aún porque el monitor no está implementado.**
No iniciar una hora de observación ni instalar herramientas desde este documento.

EQ-05 permanece **no evaluado respecto de la disponibilidad mensual**. La hora
propuesta sería evidencia preliminar independiente; el escenario completo requiere
un mes y entorno publicado con autorización separada.
