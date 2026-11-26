import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initialize, consolidate, campaignDir } from './lib/campaign-store.mjs';
import { profile, types } from './lib/profiles.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function run(file, args, quiet = false) {
  if (!quiet) {
    const r = spawnSync(process.execPath, [path.join(root, file), ...args], {
      cwd: root,
      stdio: 'inherit',
    });
    if (r.status !== 0)
      throw Error(
        'Corrida detenida. Revisa las evidencias antes de continuar.',
      );
    return;
  }
  const logDir = path.join(
    root,
    '.artifacts/k6/preparation',
    new Date().toISOString().replaceAll(':', '-'),
  );
  fs.mkdirSync(logDir, { recursive: true });
  const out = fs.openSync(path.join(logDir, 'preparation.log'), 'wx');
  try {
    const r = spawnSync(process.execPath, [path.join(root, file), ...args], {
      cwd: root,
      stdio: ['ignore', out, out],
    });
    if (r.status !== 0)
      throw Error(
        'Preparación detenida. Detalle: ' + path.relative(root, logDir),
      );
  } finally {
    fs.closeSync(out);
  }
}

let campaign;
try {
  if (
    process.argv.length !== 3 ||
    ![...types, 'completo'].includes(process.argv[2])
  )
    throw Error('Uso: npm run test:carga -- smoke|load|stress|spike|completo');
  campaign = initialize(root);
  const selected =
    process.argv[2] === 'completo'
      ? ['smoke', 'load', 'stress', 'spike']
      : [process.argv[2]];
  for (const type of selected) {
    let report = consolidate(root, campaign);
    const latest = (t) =>
      report.attempts
        .filter((a) => a.type === t)
        .sort((a, b) => (a.finishedAt || '').localeCompare(b.finishedAt || ''))
        .at(-1);
    if (latest(type)?.passed) {
      console.log(
        `${type}: aprobado en esta campa�a; se conserva la evidencia.`,
      );
      continue;
    }
    if (type === 'load' && !latest('smoke')?.passed)
      throw Error('Ejecuta smoke en esta campa�a antes de load.');
    if (['stress', 'load-academico'].includes(type) && !latest('load')?.passed)
      throw Error('Ejecuta load en esta campa�a primero.');
    const p = profile(type, type === 'spike' ? report.stressMaxApprovedVU : 0);
    console.log(
      `${type.toUpperCase()} | lectura catalogo/disponibilidad | hasta ${p.maxVU} VU | perfil ${p.durationSeconds}s + recuperacion ${p.recoverySeconds}s | campa�a ${campaign.id}`,
    );
    run(
      'k6/fixtures.mjs',
      [
        'prepare',
        `--actors=${Math.max(2, p.maxVU)}`,
        `--level=${p.maxVU}`,
        `--duration=${p.durationSeconds}`,
      ],
      true,
    );
    try {
      run('k6/run-lab.mjs', [
        '--execute=local-synthetic-lab',
        `--campaign=${campaign.id}`,
        `--type=${type}`,
        '--mode=read',
        '--fixtures=.artifacts/k6/supabase-lab/fixtures.json',
      ]);
    } finally {
      report = consolidate(root, campaign);
    }
    if (!latest(type)?.passed)
      throw Error(
        'Tipo no aprobado; secuencia detenida. Consulta consolidated.json.',
      );
  }
  console.log(
    `Campa�a: evidencias en ${path.relative(root, campaignDir(root, campaign.id))}.`,
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  if (campaign) consolidate(root, campaign);
}
