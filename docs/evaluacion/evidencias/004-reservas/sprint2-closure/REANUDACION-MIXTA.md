# Reanudación puntual de la serie mixta — 26/11/2026

Único comando desde la raíz, ejecutado manualmente por el responsable:

```powershell
npm run test:carga:mixta
```

Serie `71e00e3c-28eb-4262-80ce-7abe043c49ed`. Reintento preparado
`648620bd-10f3-4ba6-b5c3-711b024126f4`, sin iniciar k6 ni escribir datos de negocio.

El intento original `912980a8` conserva su resultado **no aprobado**: 24 peticiones,
cuatro confirmaciones, cero errores técnicos/funcionales, 1VU máximo y parada REST
ordenada por el supervisor. Memoria host95,996–96,444% y562–633MiB disponibles
durante16,198s: actuó la protección sostenida90%/<768MiB/15s. No fue un mínimo
preventivo ni se alcanzó la guarda inmediata97%/<512MiB. El Stress de lectura
aprobado usó la misma política, con RAM77,69–86,24% y2.175–3.526MiB disponibles.
CPU y conexiones en esta interrupción: máximo13,11% y12/100, sin esperas de locks.
No es evidencia de fallo funcional, agotamiento de PostgreSQL ni capacidad de25VU.

## Cambio del preparador

- Las cuatro reservas existentes se cotejaron con su asignación original: índices
  320–323, actor sintético índice2, posiciones0–3. Conservan estado confirmado,
  un item, un evento y pago efectivo pendiente. La BD mantiene108 reservas en total.
- Solo esos cuatro casos reciben nuevos UUID de petición y turnos480–483 de ese
  actor, posteriores a los480 turnos lógicos previstos para sus tres niveles.
  No se vuelven a emitir las peticiones consumidas ni se contabilizan replays200
  como nuevas confirmaciones. El contrato de confirmación sigue exigiendo201.
- Las otras3.996 asignaciones del nivel25 permanecen idénticas.50/100 usan su
  asignación original sin desplazamientos. Pruebas puras comprueban ausencia de
  solapamientos entre clientes/profesionales en los tres niveles, incluidas las
  cuatro reservas anteriores. Una consulta real cotejó el nuevo plan completo
  de25 contra las reservas existentes: **cero conflictos**.
- Se conserva el manifiesto previo, el fixture original, sus hashes y la historia
  del intento fallido. Plan nuevo privado en
  `.artifacts/k6/supabase-lab/complementary/<serie>/retry-<reintento>/`.
  Las sesiones renovadas se exportarán a un fixture distinto del original.
- El permiso está ligado a este intento de25 y se consume al ejecutarlo. Un nuevo
  fallo no genera otro reintento automático. Si aprueba, el mismo comando continúa
  con50 y100; los niveles aprobados de esta serie se omiten en futuras invocaciones.
- Se conservan600s estables por nivel, calentamiento/rampas/recuperación, thresholds,
  política estricta de respuestas e invariantes. No se cambiaron las protecciones
  críticas/sostenidas ni se añadió un mínimo preventivo de RAM. Pueden volver a
  detener la corrida si el equipo permanece bajo presión.

[Preparación real y preservación](retry-preparation.json).
Los archivos originales de la campaña de lectura y el intento mixto siguen intactos;
el operador comprobó716 hashes de evidencias, código protegido y configuración.
El nuevo plan tiene baseline108; las cuatro reservas anteriores no se cuentan como
escrituras aceptadas del siguiente intento.

## Verificación sin carga

Las siete pruebas del plan/reintento pasan, incluida su preparación idempotente.
Validación Node de sintaxis y formato, sin ejecutar el binario k6.
[Pruebas específicas](retry-plan-tests.log).

La suite ampliada produjo33/34 aprobadas: [registro completo](retry-static-tests.log).
El único fallo fue el test preexistente del cierre con proceso Node real en Windows:
la comprobación de dueño del puerto tiene timeout2000ms. Una consulta equivalente
de solo lectura tardó2638ms y sí identificó al dueño correcto. El reintento aislado
también falló; no se ocultó, deshabilitó ni se modificó ese test o el supervisor.
El cierre ordenado del intento original sí está registrado en shutdown.json.
No se declara toda la suite aprobada; esta limitación auxiliar queda separada de
las pruebas del preparador y sus verificaciones de integridad.

[Verificación final de preparación](retry-verification.json). Sin modificaciones de
producto, Cloud, migraciones, GitHub Actions, commits o push. No se ejecutó carga.
