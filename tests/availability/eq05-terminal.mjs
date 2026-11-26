// Presentation only. No files, network, timers, policy decisions or mutation of samples.
import { progressLine } from './eq05-manual-policy.mjs';

const counts = (rows) => ({
  processed: rows.length,
  available: rows.filter((r) => r.status === 'available').length,
  unavailable: rows.filter((r) => r.status === 'unavailable').length,
  noData: rows.filter((r) => r.status === 'no-data').length,
});
const time = (seconds) => {
  const n = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
};

export function terminalFrame({
  rows,
  elapsedSeconds,
  width = 90,
  simulated = false,
}) {
  width = Math.max(40, Math.min(120, width));
  const c = counts(rows),
    observed = c.available + c.unavailable;
  const available = observed
    ? `${((c.available / observed) * 100).toFixed(2)}%`
    : '--';
  const barWidth = Math.max(10, width - 25);
  const done = Math.floor(Math.min(1, rows.length / 360) * barWidth);
  const lines = [
    'BARBEXA | EQ-05 | DISPONIBILIDAD LOCAL',
    simulated
      ? 'DEMO - DATOS SIMULADOS - NO ES EVIDENCIA REAL'
      : 'Monitoreo real | meta local >=99.5% | intervalo 10 s',
    '',
    `[${'#'.repeat(done)}${'-'.repeat(barWidth - done)}] ${rows.length}/360`,
    `Tiempo ${time(elapsedSeconds)} / 60:00`,
    `Disponibilidad ${available} | Cobertura ${((observed / 360) * 100).toFixed(2)}%`,
    `Exitosos ${c.available} | Fallidos ${c.unavailable} | Sin datos ${c.noData}`,
    '',
    'Historial: + exito | x fallo | ? sin datos | . pendiente',
  ];
  const cells = Array.from({ length: 360 }, (_, i) => {
    const r = rows[i];
    return !r
      ? '.'
      : ({ available: '+', unavailable: 'x', 'no-data': '?' }[r.status] ?? '?');
  }).join('');
  const perLine = Math.min(60, width - 8);
  for (let i = 0; i < cells.length; i += perLine)
    lines.push(
      `${String(i + 1).padStart(3, '0')} | ${cells.slice(i, i + perLine)}`,
    );
  lines.push('', 'Muestreo local; no acredita disponibilidad mensual.');
  return lines.map((line) => line.slice(0, width)).join('\n');
}

export function terminalPresenter(output = process.stdout) {
  let previousLines = 0,
    lastCount = -1,
    disabled = false;
  return {
    update(sample) {
      if (disabled) return;
      try {
        if (!output.isTTY) {
          if (sample.rows.length !== lastCount) {
            output.write(
              (sample.simulated ? 'DEMO SIMULADA | ' : '') +
                progressLine({
                  ...counts(sample.rows),
                  elapsedSeconds: sample.elapsedSeconds,
                }) +
                '\n',
            );
            lastCount = sample.rows.length;
          }
          return;
        }
        const frame = terminalFrame({ ...sample, width: output.columns || 90 });
        output.write(
          (previousLines ? `\x1b[${previousLines}A\r\x1b[0J` : '') +
            frame +
            '\n',
        );
        previousLines = frame.split('\n').length;
      } catch {
        disabled = true;
      } // A display failure must never affect evaluation.
    },
    finish() {
      previousLines = 0;
    },
  };
}
