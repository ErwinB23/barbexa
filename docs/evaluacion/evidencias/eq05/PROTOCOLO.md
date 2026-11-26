# EQ-05 — protocolo previo de una hora local

26/11/2026. Autorización: responsable del proyecto; adaptación académica pendiente
de aceptación docente. El escenario mensual original se conserva íntegro en EQ-09.

- 3.600 segundos monotónicos, 360 intervalos de 10 s, inicios t=0…3.590 s.
- Un sondeo secuencial por intervalo: autenticación real, catálogo, disponibilidad,
  reservas propias, confirmación sintética, lectura persistida, cancelación propia
  y lectura que verifica esa limpieza lógica. Sin respuestas simuladas ni reintentos.
- Límite por petición: **10 s**; límite del flujo completo: **30 s**. Definidos
  antes del inicio. Redirecciones prohibidas; solo 127.0.0.1:54721 del lab verificado.
- Los ocho pasos deben cumplir contrato y estado esperado. Un error o timeout
  clasifica el intervalo de inicio como **no disponible**. La cancelación y su
  verificación están incluidas, por lo que no se ocultan fallos de limpieza.
- Si el sondeo anterior sigue ocupado o el monitor llega más de 1 s tarde, no se
  ejecuta una ráfaga: se registra ese intervalo como **sin datos**. No es éxito ni
  se elimina del denominador de cobertura. Su causa y agrupación se informan aparte.
- Disponibilidad estimada: intervalos disponibles /(disponibles+no disponibles).
  Cobertura: intervalos con resultado /360. Límite inferior del periodo programado:
  disponibles /360. Multiplicar por 100; sin observaciones, disponibilidad=null.
- Objetivo de esta adaptación: **≥99,5 % sobre el tiempo observado**, acompañado
  siempre por cobertura, intervalos sin datos y límite inferior del periodo total.
  No presentar un porcentaje observado con baja cobertura como éxito de toda la hora.
- Presión crítica/sostenida de RAM, CPU o conexiones conserva las protecciones del
  laboratorio. No mínimos preventivos fijos de RAM. Interrupción del monitor:
  futuros intervalos sin datos, sin reiniciar el cronómetro ni reemplazar fallos.
- Un flujo completo de preflight ya aprobado fuera de medición, con su reserva
  cancelada; no se suma a los 360 resultados. Datos nuevos de esta evaluación
  identificados por manifiesto y ledger, sin limpieza de reservas anteriores.
- No se programan mantenimientos ni se inyectan caídas: registrar los eventos
  observados y cualquier mantenimiento declarado por separado, sin deducir
  ausencia de mantenimiento solo por no recibir una anotación del operador.

Una hora local no acredita el **≥99,5 % mensual del servicio publicado**. La
reducción se justifica como validación preliminar reproducible del flujo construido
ante el plazo académico, no como sustitución técnica de un mes. La aceptación de
esa adaptación corresponde al docente. EQ-05 original permanece sin acreditación
mensual incluso si los 360 sondeos locales aprueban.
