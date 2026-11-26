// Foreground owner is the user's PowerShell/VS Code, with no Codex service dependency.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { manualAction, createSuccessor } from './eq05-manual-policy.mjs';
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const base = path.join(root, '.artifacts/eq05');
const load = () => {
  const pointer = path.join(base, 'current.json');
  return fs.existsSync(pointer)
    ? JSON.parse(fs.readFileSync(JSON.parse(fs.readFileSync(pointer)).manifest))
    : null;
};
const jsonIf = (file) =>
  fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null;
const plan = () => {
  const m = load();
  return {
    m,
    action: manualAction(
      m,
      Boolean(m && fs.existsSync(path.join(m.dir, 'monitor.lock'))),
      m && jsonIf(path.join(m.dir, 'window-summary.json')),
    ),
  };
};
const args = process.argv.slice(2);
if (args.length && !(args.length === 1 && args[0] === '--plan'))
  throw Error('INVALID_ARGUMENTS');
if (args[0] === '--plan') {
  const { m, action } = plan();
  console.log(
    JSON.stringify({
      action,
      previousRunId: m?.id ?? null,
      durationSeconds: 3600,
      intervalSeconds: 10,
      startsMeasurement: false,
    }),
  );
} else {
  fs.mkdirSync(base, { recursive: true });
  const lock = path.join(base, 'manual.lock');
  const fd = fs.openSync(lock, 'wx');
  fs.writeFileSync(
    fd,
    JSON.stringify({ pid: process.pid, at: new Date().toISOString() }),
  );
  fs.closeSync(fd);
  // Ctrl+C reaches the shared Windows console's monitor too. Do not kill it mid-transaction.
  let interrupted = false;
  const onInterrupt = () => {
    interrupted = true;
  };
  process.on('SIGINT', onInterrupt);
  const run = (file, arg) =>
    new Promise((resolve, reject) => {
      if (interrupted) {
        reject(Error('OPERATOR_INTERRUPTED_BEFORE_NEXT_PHASE'));
        return;
      }
      const child = spawn(
        process.execPath,
        [path.join(root, 'tests/availability', file), arg],
        { cwd: root, stdio: 'inherit', windowsHide: true },
      );
      child.once('error', reject);
      child.once('exit', (code, signal) =>
        code === 0
          ? resolve()
          : reject(Error(`PHASE_FAILED:${file}:${code ?? signal}`)),
      );
    });
  const saveResult = (m) => {
    const summary = jsonIf(path.join(m.dir, 'window-summary.json'));
    const audit = jsonIf(path.join(m.dir, 'post-window-audit.json'));
    const result = {
      runId: m.id,
      ...summary,
      integrityVerified: Boolean(audit),
      approvedWholeHour: Boolean(
        summary?.fullCoverage &&
        summary.objectiveMet &&
        summary.elapsedMs >= 3600000 &&
        !summary.stopReason &&
        audit,
      ),
      academicMonthlyAvailabilityAccredited: false,
      evidenceDirectory: m.dir,
    };
    fs.writeFileSync(
      path.join(m.dir, 'manual-result.json'),
      JSON.stringify(result, null, 2) + '\n',
    );
    const publicIntegrity = path.join(
      root,
      'docs/evaluacion/evidencias/eq05/integridad.json',
    );
    const integrityCopy = path.join(m.dir, 'integridad-sanitizada.json');
    if (
      audit &&
      fs.existsSync(publicIntegrity) &&
      !fs.existsSync(integrityCopy)
    )
      fs.copyFileSync(
        publicIntegrity,
        integrityCopy,
        fs.constants.COPYFILE_EXCL,
      );
    return result;
  };
  try {
    let { m, action } = plan();
    if (action === 'finished') {
      if (!fs.existsSync(path.join(m.dir, 'post-window-audit.json')))
        await run('eq05-audit.mjs', '--execute=local-synthetic-lab');
      const result = saveResult(m);
      console.log(
        `La ventana ${m.id} ya terminó. No se repite. Evidencias: ${m.dir}`,
      );
      if (!result.approvedWholeHour) process.exitCode = 2;
    } else {
      if (action === 'successor') {
        console.log(
          'Conservando el intento parcial y comprobando su limpieza exclusiva.',
        );
        if (!fs.existsSync(path.join(m.dir, 'post-window-audit.json')))
          await run('eq05-audit.mjs', '--execute=local-synthetic-lab');
        saveResult(m);
        const oldProtocol = path.join(
          root,
          'docs/evaluacion/evidencias/eq05/protocolo-previo.json',
        );
        const protocolCopy = path.join(m.dir, 'protocolo-previo.json');
        if (fs.existsSync(oldProtocol) && !fs.existsSync(protocolCopy))
          fs.copyFileSync(
            oldProtocol,
            protocolCopy,
            fs.constants.COPYFILE_EXCL,
          );
        createSuccessor(
          base,
          m,
          jsonIf(path.join(m.dir, 'post-window-audit.json')),
        );
      }
      console.log(
        'Preparando el laboratorio sintético existente; no se reinician servicios.',
      );
      await run('eq05-prepare.mjs', '--execute=local-synthetic-lab');
      await run('eq05-monitor.mjs', '--preflight-local');
      m = load();
      const sourceDir = path.join(m.dir, 'monitor-source');
      fs.mkdirSync(sourceDir, { recursive: true });
      const sourceHashes = {};
      for (const relative of [
        'tests/availability/eq05-monitor.mjs',
        'tests/availability/eq05-policy.mjs',
        'tests/availability/eq05-manual-policy.mjs',
        'tests/availability/eq05-terminal.mjs',
        'k6/lib/cli-policy.mjs',
        'k6/lib/lab-client.mjs',
      ]) {
        const bytes = fs.readFileSync(path.join(root, relative));
        sourceHashes[relative] = createHash('sha256')
          .update(bytes)
          .digest('hex');
        fs.writeFileSync(path.join(sourceDir, path.basename(relative)), bytes);
      }
      fs.writeFileSync(
        path.join(m.dir, 'active-source-hashes.json'),
        JSON.stringify(
          {
            capturedAt: new Date().toISOString(),
            beforeWindow: true,
            sha256: sourceHashes,
          },
          null,
          2,
        ) + '\n',
      );
      console.log(
        'Comienza una ventana NUEVA: 60 minutos, 360 sondeos cada 10 s; petición 10 s / flujo 30 s, sin reintentos.',
      );
      console.log(
        'Puedes cerrar Codex. Mantén PowerShell/VS Code, Docker y el equipo activos y sin suspensión.',
      );
      await run('eq05-monitor.mjs', '--observe-local-1h');
      // Audit may safely reconcile an interrupted window; do not start another measurement.
      interrupted = false;
      await run('eq05-audit.mjs', '--execute=local-synthetic-lab');
      m = load();
      const result = saveResult(m);
      console.log(
        `Finalizado | exitosos=${result.available} | fallidos=${result.unavailable} | sin datos=${result.noData} | cobertura=${result.coveragePercent.toFixed(2)}%`,
      );
      console.log(
        `Hora completa aprobada=${result.approvedWholeHour}. Resultado: ${path.join(m.dir, 'manual-result.json')}`,
      );
      console.log(
        'Informe académico y gráficas pendientes de consolidación; no se acredita disponibilidad mensual.',
      );
      if (!result.approvedWholeHour) process.exitCode = 2;
    }
  } catch (error) {
    console.error(
      `EQ-05 detenido sin reiniciar ni borrar evidencias: ${error.message}`,
    );
    const m = load();
    if (m) console.error(`Evidencias conservadas: ${m.dir}`);
    process.exitCode = 1;
  } finally {
    process.removeListener('SIGINT', onInterrupt);
    fs.unlinkSync(lock);
  }
}
