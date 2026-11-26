# Sprint 2 — guía breve de sustentación

Duración orientativa: 10–12 minutos. Abrir previamente el [índice central](INDICE.md),
Swagger y los PDF/capturas; no ejecutar carga, Playwright ni otra hora en directo.
No mostrar `.env`, manifiestos, sesiones, consola con tokens o traces nativos.

| Minutos | Mostrar | Explicación breve |
| --- | --- | --- |
| 0–1 | README y [cinco entregables](INDICE.md) | SaaS multitenant: cliente, barbero y administración contextual; pagos recibidos manualmente |
| 1–3 | [Caso de uso cliente](../../../src/features/reservations/application/request-reservation.ts), [puerto](../../../src/features/reservations/application/reservation-remote-gateway.ts), [caso servidor](../../../supabase/functions/_shared/reservations/application/confirm-reservation.ts), [trazabilidad](../../evaluacion/evidencias/eq08/trazabilidad.json) | Pantalla → caso de uso → adaptador HTTP → Edge → caso de uso → adaptador RPC → transacción. Servidor valida identidad/precio/disponibilidad; UI no concede permisos |
| 3–4 | [spec](../../../specs/004-mvp-reservas/spec.md), [plan](../../../specs/004-mvp-reservas/plan.md), [tareas](../../../specs/004-mvp-reservas/tasks.md) | Mostrar una función trazada desde SDD hasta código y evidencia; hay 18 especificaciones |
| 4–5 | Primera versión Web o [capturas E2E](../../evaluacion/evidencias/eq09/INFORME.md) | Reserva, conflicto textual, servicios conservados y recuperación; no simular aprobación Android |
| 5–6 | Swagger, [OpenAPI JSON](../../api/openapi.json) | Contratos reales y visor de consulta. No pulsar una operación mutante ni mostrar credenciales |
| 6–7 | [Cobertura](evidencias/cobertura-aceptada.json), [EQ-08](../../evaluacion/evidencias/eq08/resultados.json) | Cliente 100/100/93,14 % y servidor 100/100/100 %, limitado al núcleo. Pruebas sin red demuestran sustitución de adaptadores |
| 7–9 | [Lecturas PDF](../../evaluacion/evidencias/004-reservas/k6-final/graficas/graficas-k6.pdf), [mixta PDF](../../evaluacion/evidencias/004-reservas/k6-mixta-final/graficas/graficas-mixtas.pdf) | Kong 512→4096 resolvió el límite observado; lectura hasta 1.000 VU. Mezcla 25/50/100 ×600 s, 17.630 aceptadas = persistidas. Explicar p95 HTTP global3,66 s frente a consultas4/8/7 ms, sin atribuir 1.000 escrituras |
| 9–10 | [EQ-05 PDF](../../evaluacion/evidencias/eq05/INFORME.pdf) | 360 sondeos, 100 % disponibilidad/cobertura, cero faltantes, 361 propias canceladas. Es una hora local; no demuestra un mes publicado |
| 10–12 | [Matriz EQ](../../evaluacion/evidencias/004-reservas/k6-final/REQUISITOS-CALIDAD.md) y Actions | Seis cumplidos en su alcance, cuatro parciales. Señalar adaptación docente, módulos/Android/participantes pendientes y 2.000 VU adicionales pospuestos |

## Preparación segura

Si las dependencias ya están instaladas, el responsable puede abrir el visor con
`npm run docs:api` (127.0.0.1:8082); alternativo
`npm run docs:api -- --port 8083`. Este documento no autoriza reiniciar servicios,
recrear fixtures de campañas concluidas ni operar datos reales durante la preparación.
La Web en vivo requiere un entorno de demostración previamente autorizado; como
respaldo usar las capturas sintéticas existentes, sin fingir una ejecución nueva.

Para enseñar únicamente el nuevo panel de terminal:

```powershell
node tests/availability/eq05-terminal-demo.mjs
```

Se identifica como **DEMO SIMULADA**, dura menos de un segundo y no consulta
Auth/HTTP/SQL. No usar sus fallos ficticios como resultados reales de EQ-05.

## Respuestas que deben quedar claras

- **¿Los diez EQ están completos?** Seis tienen evidencia suficiente para su alcance;
  cuatro son parciales, con condiciones originales explícitas. No se cambiaron los requisitos.
- **¿100 % disponible significa todo el mes?** No. Fue una hora local muestreada
  cada10 s, con cobertura100 %. La adaptación debe ser aceptada por la docente.
- **¿1.000 VU acredita 1.000 reservas simultáneas?** No: esa serie es de lectura;
  la mezcla con confirmaciones se acreditó hasta100 VU. 2.000 VU no se acreditaron.
- **¿Cómo se confirma Yape?** Un actor autorizado verifica y registra manualmente
  la recepción; el código remitido por el cliente no acredita dinero recibido automáticamente.
- **¿CI despliega el producto?** No: verifica calidad y compila Web sin credenciales.
  CD, servicio público y DNS/CDN no se declaran completados.

Cerrar solicitando registrar la aceptación de la adaptación y las limitaciones
de EQ-02/08/09; no prometer nuevas pruebas o funcionalidades para aparentar cierre.
