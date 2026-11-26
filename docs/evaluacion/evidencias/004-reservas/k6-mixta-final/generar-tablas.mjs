// Presentación offline de auditoria.json; no inicia pruebas o servicios.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  fs.readFileSync(path.join(out, 'auditoria.json'), 'utf8'),
);
const ok = data.attempts.filter((a) => a.approved);
const num = (v, d = 2) =>
  v === null || v === undefined
    ? 'No disponible'
    : new Intl.NumberFormat('es-ES', {
        useGrouping: 'always',
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }).format(v);
const table = (head, rows) =>
  '| ' +
  head.join(' | ') +
  ' |\n| ' +
  head.map(() => '---').join(' | ') +
  ' |\n' +
  rows.map((r) => '| ' + r.join(' | ') + ' |').join('\n') +
  '\n';
let s =
  '# Tablas auditadas de la serie mixta\n\n26/11/2026. Serie `' +
  data.series +
  '`. Fuentes: resúmenes nativos, resultados, recursos y SQL guardados; sin nueva carga.\n\n';
s +=
  '## Niveles aprobados\n\nLos HTTP, percentiles globales y RPS globales abarcan calentamiento, rampas y carga estable. Los RPS estables se recalculan como solicitudes etiquetadas `steady` / 600 s.\n\n';
s += table(
  [
    'VU',
    'HTTP',
    'RPS global',
    'RPS estable',
    'HTTP media ms',
    'p50 ms',
    'p95 ms',
    'p99 ms',
    'Checks',
    'Confirmaciones aceptadas',
    'Persistidas',
  ],
  ok.map((a) => [
    a.level,
    num(a.httpCount, 0),
    num(a.rps),
    num(a.steadyRps),
    num(a.httpMs.avg),
    num(a.httpMs.med),
    num(a.httpMs['p(95)']),
    num(a.httpMs['p(99)']),
    '100 %',
    num(a.acceptedConfirmations, 0),
    num(a.persistedReservations, 0),
  ]),
);
s +=
  '\n## Consultas durante los 600 segundos estables\n\nTiempo completo desde antes de HTTP hasta la respuesta, incluye conexión y recepción; excluye pausa humana y renderizado.\n\n';
s += table(
  [
    'VU',
    'Operación',
    'Muestras',
    'RPS estable',
    'Media ms',
    'p50 ms',
    'p95 ms',
    'p99 ms',
    'Máximo ms',
  ],
  ok.flatMap((a) =>
    Object.entries(a.operations).map(([op, v]) => [
      a.level,
      op,
      num(v.steadyAccepted, 0),
      num(v.steadyRps),
      ...['avg', 'med', 'p(95)', 'p(99)', 'max'].map((k) => num(v.wallMs?.[k])),
    ]),
  ),
);
s +=
  '\nLos tiempos de `confirm` son **no disponibles**, no cero: el contador sí existe, pero su distribución etiquetada no se exportó. No se calcula un p95 de confirmación restando percentiles.\n\n## Duración y recuperación\n\n';
s += table(
  [
    'VU',
    'Calentamiento s',
    'Rampa s',
    'Estable s',
    'Descenso s',
    'Generador real s',
    'Segundos implícitos del resumen',
    'Recuperación prevista s',
    'Recuperación registrada',
  ],
  ok.map((a) => [
    a.level,
    a.warmSeconds,
    a.rampSeconds,
    a.steadySeconds,
    a.downSeconds,
    num(a.generatorWallSeconds, 3),
    num(a.metricSeconds, 3),
    a.recoverySeconds,
    a.recovered ? 'Sí' : 'No',
  ]),
);
s +=
  '\nDuración acreditada por plan, terminación normal, duración medida superior a 780 s, muestras positivas y VU máximos. No existe una serie temporal de VU por segundo para reconstruir independientemente cada instante del plateau.\n\n## Recursos muestreados\n\n';
s += table(
  [
    'VU',
    'CPU host pico %',
    'RAM host pico %',
    'Libre mínimo GiB',
    'Backend pico MiB',
    'Generador pico MiB',
    'CPU Edge pico % de 1 núcleo',
    'Sesiones PG / límite',
    'Locks máximos',
  ],
  ok.map((a) => {
    const r = a.resources;
    return [
      a.level,
      num(r.cpuHostPeakPercent),
      num(r.ramHostPeakPercent),
      num(r.minimumFreeHostGiB),
      num(r.backendMemoryPeakMiB),
      num(r.generatorPeakMiB),
      num(r.backend.edge_runtime.cpuPeakOneCorePercent),
      r.pgSessionsPeak + ' / ' + r.pgMaxConnections,
      r.pgLockWaitsPeak,
    ];
  }),
);
s +=
  '\nCPU de contenedores y generador usa un núcleo como denominador; CPU del host usa todos sus procesadores. La RAM host incluye otros procesos. Son picos de muestras (~2 s), no máximos continuos; los picos de distintos componentes no necesariamente coinciden.\n\n## Libro de reservas: todos los intentos\n\n';
s += table(
  [
    'Intento',
    'VU objetivo / máximo',
    'Aprobado',
    'HTTP',
    'Errores técnicos',
    'Aceptadas por k6',
    'Persistidas SQL',
    'Persistidas sin acuse k6',
    'BD antes -> después',
    'Recuperación / integridad',
  ],
  data.attempts.map((a) => [
    '[' + a.id.slice(0, 8) + '](../../../../../' + a.source + '/result.json)',
    a.level + ' / ' + a.maximumActiveVU,
    a.approved ? 'Sí' : 'No',
    num(a.httpCount, 0),
    a.technicalErrorCount,
    num(a.acceptedConfirmations, 0),
    num(a.persistedReservations, 0),
    a.unacknowledgedPersisted,
    a.globalBefore + ' -> ' + a.globalAfter,
    (a.recovered ? 'Sí' : 'No') + ' / ' + (a.integrityValid ? 'Sí' : 'No'),
  ]),
);
s +=
  '\nLas 6 transacciones sin acuse del segundo intento se conservan en SQL y **no** se agregan a sus éxitos ni se inventan latencias. Los intentos fallidos no acreditan 25 VU. Los aprobados tienen cero conflictos: cada confirmación exigía HTTP 201 y los checks aprobaron al 100 %. El contador crudo de conflictos ausente se mantiene null en JSON; el cero es una conclusión contractual, no una métrica inventada. Las carreras con 409 esperado pertenecen a pruebas independientes.\n\n';
s +=
  '## Totales separados\n\n- Aprobados: **88.472 HTTP**, **17.630 confirmaciones aceptadas = 17.630 reservas persistidas**.\n- No aprobados: 6.263 HTTP, 1.239 confirmaciones aceptadas y 1.245 reservas persistidas; diferencia de seis durante aborto.\n- Inventario final guardado: **18.979 reservas** = 4 del cierre acotado + 100 semillas + 1.245 de intentos fallidos + 17.630 de niveles aprobados.\n- Cero solapamientos, reservas parciales, tenants incongruentes, requests duplicados y recibos duplicados en los controles SQL antes/después.\n\n[Informe](INFORME.md) · [Auditoría JSON](auditoria.json) · [CSV por operación](operaciones.csv) · [Gráficas PDF](graficas/graficas-mixtas.pdf).\n';
fs.writeFileSync(path.join(out, 'RESULTADOS.md'), s);
console.log(
  'RESULTADOS.md generado con tablas de los cinco intentos y tres niveles aprobados.',
);
