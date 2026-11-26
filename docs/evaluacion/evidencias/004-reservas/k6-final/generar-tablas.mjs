import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(dir, 'auditoria.json')));
const n = (v, digits = 2) => {
  if (v === null || v === undefined) return 'N/D';
  const [whole, fraction] = Number(v).toFixed(digits).split('.');
  return (
    whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.') +
    (fraction ? ',' + fraction : '')
  );
};
const integer = (v) => n(v, 0);
const table = (headers, rows) =>
  '| ' +
  headers.join(' | ') +
  ' |\n| ' +
  headers.map(() => '---').join(' | ') +
  ' |\n' +
  rows.map((row) => '| ' + row.join(' | ') + ' |').join('\n') +
  '\n';
const approved = Object.keys(data.selected)
  .map((type) => data.attempts.find((a) => a.id === data.selected[type]))
  .filter(Boolean);
let md = `# Resultados consolidados de la campaña k6\n\nCampaña: \`${data.campaign}\`. Auditoría offline; ninguna carga nueva.\n\nN/D significa ausencia de evidencia. No se sustituyen datos faltantes con cero.\n\n## Totales de las corridas aprobadas\n\nLatencias HTTP en ms; RPS global de k6 incluye rampas. No equivale al RPS de cada tramo estable.\n\n`;
md += table(
  [
    'Prueba',
    'Intento',
    'VU máximo',
    'HTTP',
    'RPS global',
    'Media ms',
    'p50 ms',
    'p95 ms',
    'p99 ms',
  ],
  approved.map((a) => [
    a.type,
    a.id.slice(0, 8),
    integer(a.total.maxObservedVU),
    integer(a.total.requests),
    n(a.total.rps),
    n(a.total.avgMs),
    n(a.total.p50Ms),
    n(a.total.p95Ms),
    n(a.total.p99Ms),
  ]),
);
md +=
  '\nLas cinco corridas registran cero errores técnicos, cero resultados funcionales inesperados, checks al 100 %, integridad válida y recuperación true. Total de solicitudes de estas corridas: ' +
  integer(approved.reduce((s, a) => s + a.total.requests, 0)) +
  '.\n\n';
md += table(
  [
    'Prueba',
    'Escenario programado s',
    'Tiempo medido HTTP s¹',
    'Proceso completo s',
    'Recuperación programada s',
    'Thresholds aprobados',
  ],
  approved.map((a) => [
    a.type,
    a.type === 'smoke' ? 'Máximo 30' : integer(a.configuredSeconds),
    n(a.total.inferredMetricDurationSeconds, 3),
    n(a.generatorWallSeconds, 3),
    integer(a.recoveryConfiguredSeconds),
    a.thresholds.length + '/' + a.thresholds.length,
  ]),
);
md +=
  '\n¹ Duración del denominador que k6 usa para `http_reqs.rate`, obtenida de count/rate. No es la suma de latencias ni una traza de VU. Las duraciones estables proceden del perfil y su completitud acreditada; no existen muestras de inicio/fin de cada petición. Smoke completa cinco iteraciones, no treinta segundos obligatorios.\n\n## Intentos fallidos conservados\n\n';
md += table(
  [
    'Intento Stress',
    'Estado',
    'VU observado / acreditado',
    'HTTP',
    'EOF',
    'Causa',
    'Recuperación',
  ],
  data.attempts
    .filter((a) => !a.passed)
    .map((a) => [
      a.id.slice(0, 8),
      a.status,
      integer(a.total.maxObservedVU) + ' / ' + integer(a.total.maxAccreditedVU),
      integer(a.total.requests),
      a.id.startsWith('28edec30')
        ? '1; error técnico y funcional según política original'
        : integer(a.total.eofLoggedCount) + ' eventos; tasa N/D',
      a.interrupted || 'exit ' + a.exit + '; aborto por resultado inesperado',
      String(a.recovered),
    ]),
);
md +=
  '\nEl segundo intento llegó a 500 VU según la observación del responsable, pero carece de resumen final: no se convierte ese dato en una métrica auditada ni se acreditan sus tramos. El consolidado original omite ese intento al no encontrar summary.json; esta auditoría sí lo incluye como **interrumpido sin resumen**, conservando sus recursos, logs e integridad.\n\n## Tramos estables aprobados\n\n';
for (const a of approved.filter((a) => a.segments.length)) {
  md += `### ${a.type} — ${a.id.slice(0, 8)}\n\n`;
  md += table(
    [
      'Tramo',
      'VU',
      'Duración s',
      'HTTP',
      'RPS tramo',
      'Media ms',
      'p50 ms',
      'p95 ms',
      'p99 ms',
    ],
    a.segments.map((s) => [
      s.name,
      integer(s.level),
      integer(s.seconds),
      integer(s.requests),
      n(s.rps),
      n(s.avgMs),
      n(s.p50Ms),
      n(s.p95Ms),
      n(s.p99Ms),
    ]),
  );
  md +=
    '\np95 de tiempo completo observado por operación, incluido establecimiento de conexión y recepción; todos los tramos tienen respuestas aceptadas de ambas operaciones.\n\n';
  md += table(
    [
      'VU / tramo',
      'p95 catálogo ms',
      'p99 catálogo ms',
      'p95 slots ms',
      'p99 slots ms',
      'Errores técnicos',
      'Errores funcionales',
      'Completado',
    ],
    a.segments.map((s) => [
      integer(s.level) + ' / ' + s.name,
      n(s.operations.catalog?.['p(95)']),
      n(s.operations.catalog?.['p(99)']),
      n(s.operations.slots?.['p(95)']),
      n(s.operations.slots?.['p(99)']),
      integer(s.errorsTechnicalCount),
      integer(s.errorsFunctionalCount),
      String(s.completed),
    ]),
  );
  md += '\n';
}
md +=
  '## Recursos de todas las corridas\n\nMáximos muestreados: CPU/RAM del host compartido, no consumo exclusivo de BARBEXA. Memoria k6 = pico acumulado del working set observado; backend = mayor suma simultánea de los seis contenedores.\n\n';
md += table(
  [
    'Tipo / intento',
    'CPU host %',
    'RAM host %',
    'Libre mínima GiB',
    'k6 MiB',
    'Backend MiB',
    'Sesiones PG máx.',
    'Locks máx.',
  ],
  data.attempts.map((a) => [
    a.type + ' / ' + a.id.slice(0, 8),
    n(a.resources.cpuHostPeakPercent),
    n(a.resources.ramHostPeakPercent),
    n(a.resources.minimumFreeHostGiB, 3),
    n(a.resources.generatorPeakMiB),
    n(a.resources.backendMemoryPeakMiB),
    integer(a.resources.pgSessionsPeak),
    integer(a.resources.pgLockWaitsPeak),
  ]),
);
md +=
  '\nEl límite PostgreSQL era 100. El contador incluye sesiones inactivas y conexiones del monitor, no solo consultas activas. En Smoke solo hay dos muestras: sus picos de recursos son especialmente limitados.\n\n';
for (const a of approved.filter((a) => ['stress', 'spike'].includes(a.type))) {
  md += `### CPU y memoria por componente — ${a.type}\n\n`;
  md += table(
    ['Componente', 'CPU máxima, % de un núcleo', 'RAM máxima MiB'],
    Object.entries(a.resources.backend)
      .map(([name, r]) => [
        name,
        n(r.cpuPeakOneCorePercent),
        n(r.memoryPeakMiB),
      ])
      .concat([
        [
          'k6',
          n(a.resources.generatorCpuPeakOneCorePercent),
          n(a.resources.generatorPeakMiB),
        ],
      ]),
  );
  md +=
    '\nUn 1.280 % de CPU Docker equivale aproximadamente a 12,8 núcleos, no al 1.280 % del host. CPU de k6 se deriva de diferencias de tiempo acumulado entre muestras: no mide un pico instantáneo.\n\n';
}
md +=
  '## Archivos de datos y trazabilidad\n\n- [auditoria.json](auditoria.json): todas las métricas, segmentos, recursos y verificaciones.\n- [intentos.csv](intentos.csv): aprobados, fallidos e incompletos.\n- [tramos.csv](tramos.csv): percentiles y métricas por nivel.\n- [umbrales.csv](umbrales.csv): expresiones originales, valores, resultado exportado y recálculo independiente.\n- [recursos-serie.csv](recursos-serie.csv): serie temporal muestreada.\n- [preservacion-sha256.json](preservacion-sha256.json): inventario de ' +
  Object.keys(
    JSON.parse(fs.readFileSync(path.join(dir, 'preservacion-sha256.json')))
      .sha256,
  ).length +
  ' archivos crudos preservados, incluidos preliminares.\n\n[Informe técnico](INFORME.md) · [Requisitos de calidad](REQUISITOS-CALIDAD.md) · [Gráficas PDF](graficas/graficas-k6.pdf).\n';
fs.writeFileSync(path.join(dir, 'RESULTADOS.md'), md);
