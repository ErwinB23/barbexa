import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { probe } from './resource-probe.mjs';
import { pressureDecision } from './lib/cli-policy.mjs';
import { profile } from './lib/profiles.mjs';
import { campaignDir, read, consolidate } from './lib/campaign-store.mjs';
import { ownedLab } from './lib/lab-client.mjs';
import { tuneKong } from './kong-tuning.mjs';
import { reserveControlAddress, createShutdown } from './lib/shutdown.mjs';
import {
  validateComplementary,
  levels as complementaryLevels,
  assertComplementaryProgress,
} from './lib/complementary.mjs';
import {
  labOrigin,
  projectId,
  levelPlan,
  validateFixtures,
  assertProgression,
} from './lib/safety.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((s) => {
    const match =
      /^--(level|mode|fixtures|execute|campaign|type|series)=(.+)$/.exec(s);
    if (!match) throw Error('EXPLICIT_RUN_ARGUMENTS_REQUIRED');
    return [match[1], match[2]];
  }),
);
if (args.execute !== 'local-synthetic-lab')
  throw Error('EXPLICIT_EXECUTION_REQUIRED');
if (
  args.series &&
  (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(args.series) ||
    args.campaign ||
    args.type ||
    args.mode !== 'complementary' ||
    !complementaryLevels.includes(Number(args.level)))
)
  throw Error('INVALID_COMPLEMENTARY_SERIES');
if (args.mode === 'complementary' && !args.series)
  throw Error('COMPLEMENTARY_SERIES_REQUIRED');
const campaign = args.campaign
  ? read(path.join(campaignDir(root, args.campaign), 'campaign.json'))
  : null;
if (campaign && (campaign.id !== args.campaign || !args.type))
  throw Error('CAMPAIGN_MISMATCH');
const peak =
  campaign && args.type === 'spike'
    ? consolidate(root, campaign).stressMaxApprovedVU
    : 0;
const selectedProfile = campaign ? profile(args.type, peak) : null;
const level = selectedProfile ? selectedProfile.maxVU : Number(args.level);
const plan = selectedProfile
  ? {
      warmSeconds: 0,
      rampSeconds: 0,
      steadySeconds: selectedProfile.durationSeconds,
      recoverySeconds: selectedProfile.recoverySeconds,
    }
  : levelPlan(level);
if (campaign && args.mode !== 'read') throw Error('CAMPAIGN_READ_ONLY');
if (
  ![
    'read',
    'mixed',
    'conflict',
    'replay',
    'isolation',
    'complementary',
  ].includes(args.mode)
)
  throw Error('INVALID_MODE');
if (level !== 1 && !['read', 'mixed', 'complementary'].includes(args.mode))
  throw Error('BOUNDED_INTEGRITY_MODE');
if (level > 1000) throw Error('IMMEDIATE_MANUAL_TARGET_MAXIMUM_1000');
const initialPolicy = probe('load', level);
if (!initialPolicy.allowed)
  throw Error(
    'ADAPTIVE_RESOURCE_PREFLIGHT_BLOCKED: ' + initialPolicy.blockers.join(', '),
  );
const liveLab = ownedLab();
const kongConfiguration = tuneKong('verify');
const policy = probe('load', level);
if (!policy.allowed)
  throw Error(
    'ADAPTIVE_RESOURCE_PREFLIGHT_BLOCKED: ' + policy.blockers.join(', '),
  );
if (policy.warnings?.length)
  console.warn(
    'Aviso de recursos: estimación de memoria ajustada; vigilancia activa.',
  );
const lab = path.join(root, '.artifacts/k6/supabase-lab');
const owned = JSON.parse(
  fs.readFileSync(path.join(lab, 'ownership.json'), 'utf8'),
);
if (owned.projectId !== projectId || owned.origin !== labOrigin)
  throw Error('NOT_OWNED_LAB');
function docker(argv, input) {
  const r = spawnSync('docker', argv, {
    input,
    encoding: 'utf8',
    timeout: 15000,
    maxBuffer: 8 * 1024 ** 2,
  });
  if (r.status !== 0) throw Error('LAB_DOCKER_OPERATION_FAILED');
  return r.stdout.trim();
}
const container = JSON.parse(
  docker(['inspect', 'supabase_db_' + projectId]),
)[0];
if (
  !container.State.Running ||
  container.Name !== '/supabase_db_' + projectId ||
  container.HostConfig.PortBindings['5432/tcp']?.[0]?.HostPort !== '54722' ||
  !container.Mounts.some(
    (m) => m.Type === 'volume' && m.Name === 'supabase_db_' + projectId,
  ) ||
  container.Mounts.some((m) =>
    /app-barberia|barberia-app/.test(m.Name || m.Source),
  )
)
  throw Error('UNSAFE_LAB_CONTAINER');
const fixturesPath = path.resolve(root, args.fixtures || '');
if (!fixturesPath.startsWith(lab + path.sep))
  throw Error('FIXTURES_MUST_BE_IN_IGNORED_LAB');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
if (campaign && campaign.fixtureRunId !== fixtures.runId)
  throw Error('CAMPAIGN_FIXTURE_MISMATCH');
const progressFile = path.join(lab, `progress-${args.mode}.json`);
const seriesFile = args.series
  ? path.join(lab, 'complementary', args.series, 'manifest.json')
  : null;
const series = seriesFile ? JSON.parse(fs.readFileSync(seriesFile)) : null;
if (
  series &&
  (series.id !== args.series ||
    series.runId !== fixtures.runId ||
    (level !== 25 && !series.levels[level === 50 ? 25 : 50]?.passed))
)
  throw Error('PREVIOUS_COMPLEMENTARY_LEVEL_NOT_APPROVED');
if (series) {
  assertComplementaryProgress(series, level);
  validateComplementary(fixtures, level);
  if (fixtures.complementary.series !== series.id)
    throw Error('SERIES_FIXTURES_MISMATCH');
}
if (!campaign && !series)
  assertProgression(
    level,
    fs.existsSync(progressFile)
      ? JSON.parse(fs.readFileSync(progressFile, 'utf8'))
      : null,
    fixtures.runId,
    args.mode,
  );
const sql = (statement) =>
  docker(
    [
      'exec',
      '-i',
      container.Id,
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-Atq',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    statement,
  );
// Marker is provisioned only in the isolated synthetic fixture setup, never product migrations.
const marker = sql('select run_id::text from private.k6_lab_marker;');
if (marker !== fixtures.runId || !/^[0-9a-f-]{36}$/.test(marker))
  throw Error('LAB_MARKER_MISMATCH');
const permit = {
  origin: labOrigin,
  projectId,
  runId: marker,
  marker,
  containerId: container.Id,
  issuedAt: Date.now(),
  expiresAt: Date.now() + 3600000,
};
validateFixtures(
  fixtures,
  permit,
  args.mode === 'conflict' ? 2 : Math.max(2, level),
);
for (const actor of fixtures.actors) {
  const payload = JSON.parse(
    Buffer.from(actor.token.split('.')[1], 'base64url').toString(),
  );
  if (
    payload.sub !== actor.id ||
    payload.role !== 'authenticated' ||
    payload.exp * 1000 <
      Date.now() +
        Math.max(
          600,
          plan.warmSeconds +
            2 * plan.rampSeconds +
            plan.steadySeconds +
            plan.recoverySeconds +
            300,
        ) *
          1000 ||
    payload.iss !== labOrigin + '/auth/v1'
  )
    throw Error('INVALID_LOCAL_SYNTHETIC_SESSION');
}
if (
  args.mode === 'conflict' &&
  (!fixtures.conflict ||
    fixtures.actors[0].id === fixtures.actors[1].id ||
    fixtures.actors[0].tenant !== fixtures.actors[1].tenant)
)
  throw Error('INVALID_CONFLICT_FIXTURE');
if (!fixtures.publicKey?.startsWith('sb_publishable_')) {
  let payload;
  try {
    payload = JSON.parse(
      Buffer.from(fixtures.publicKey.split('.')[1], 'base64url').toString(),
    );
  } catch {
    throw Error('PUBLIC_KEY_REQUIRED');
  }
  if (payload.role !== 'anon')
    throw Error('PRIVILEGED_KEY_MUST_NOT_ENTER_GENERATOR');
}
const output = campaign
  ? path.join(campaignDir(root, campaign.id), args.type, randomUUID())
  : series
    ? path.join(
        root,
        '.artifacts/k6/complementary',
        series.id,
        String(level),
        randomUUID(),
      )
    : path.join(root, '.artifacts/k6/runs', randomUUID());
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'permit.json'), JSON.stringify(permit));
fs.writeFileSync(path.join(output, 'k6-config.json'), '{}');
function integrity() {
  const value = JSON.parse(
    sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
  );
  if (
    [
      'overlaps',
      'duplicateRequests',
      'partialReservations',
      'tenantMismatch',
      'duplicateReceipts',
    ].some((k) => value[k] !== 0)
  )
    throw Error('INTEGRITY_VIOLATION');
  return value;
}
const before = integrity();
const ownedCount = () =>
  Number(
    sql(
      `select count(*) from public.reservations where barbershop_id in ('${fixtures.tenants[0].id}','${fixtures.tenants[1].id}');`,
    ),
  );
const ownedBefore = series ? ownedCount() : null;
const health = await fetch(labOrigin + '/auth/v1/health', {
  signal: AbortSignal.timeout(5000),
  redirect: 'error',
});
if (health.status !== 200) throw Error('LAB_AUTH_UNHEALTHY');
// Static names and no implicit remote download/extension execution.
const executable =
  process.env.BARBEXA_K6_BINARY || 'C:/Program Files/k6/k6.exe';
const generatorEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) =>
      name !== 'SSLKEYLOGFILE' &&
      !name.startsWith('K6_') &&
      !name.startsWith('BARBEXA_K6_'),
  ),
);
const generatorStartedAt = Date.now();
const controlAddress = await reserveControlAddress();
fs.writeFileSync(
  path.join(output, 'lab-configuration.json'),
  JSON.stringify(kongConfiguration, null, 2),
);
const child = spawn(
  executable,
  [
    'run',
    '--no-usage-report',
    `--address=${controlAddress}`,
    '--summary-mode=full',
    ...(args.type === 'stress' || series
      ? ['--console-output', path.join(output, 'javascript-console.log')]
      : []),
    '--summary-export',
    path.join(output, 'native-summary.json'),
    '--config',
    path.join(output, 'k6-config.json'),
    path.join(root, 'k6/scripts/booking-api.js'),
  ],
  {
    cwd: output,
    env: {
      ...generatorEnv,
      K6_INSPECT_ONLY: '0',
      K6_AUTO_EXTENSION_RESOLUTION: 'false',
      NO_PROXY: '127.0.0.1,localhost',
      BARBEXA_K6_LEVEL: String(level),
      BARBEXA_K6_MODE: args.mode,
      ...(campaign
        ? { BARBEXA_K6_TYPE: args.type, BARBEXA_K6_PEAK: String(peak) }
        : {}),
      BARBEXA_K6_PERMIT: path.join(output, 'permit.json'),
      BARBEXA_K6_FIXTURES: fixturesPath,
      BARBEXA_K6_RUN: marker,
      BARBEXA_K6_PUBLIC_KEY: fixtures.publicKey,
    },
    stdio: 'inherit',
  },
);
let interrupted = null,
  monitoring = false,
  pressureState = {};
let previousCpu = os.cpus();
const resources = [];
const shutdown = createShutdown(child, controlAddress, {
  onChange: (state) =>
    fs.writeFileSync(
      path.join(output, 'shutdown.json'),
      JSON.stringify(state, null, 2),
    ),
});
const stop = (reason, critical = false) => {
  interrupted ||= reason;
  void shutdown.stop(reason, { critical });
  try {
    fs.writeFileSync(
      path.join(output, 'resources.json'),
      JSON.stringify(resources, null, 2),
    );
  } catch {
    console.warn(
      'No se pudo guardar la muestra; la interrupción de seguridad sigue activa.',
    );
  }
};
const onInterrupt = () => stop('OPERATOR_INTERRUPTED');
process.on('SIGINT', onInterrupt);
process.on('SIGTERM', onInterrupt);
const timer = setInterval(async () => {
  if (monitoring) return;
  monitoring = true;
  try {
    if (interrupted) {
      if (
        os.freemem() / 1024 ** 2 < 512 ||
        1 - os.freemem() / os.totalmem() >= 0.97
      )
        stop(interrupted, true);
      return;
    }
    const health = await fetch(labOrigin + '/auth/v1/health', {
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (health.status !== 200) throw Error('LAB_HEALTH_FAILED');
    const cpus = os.cpus();
    let idle = 0,
      total = 0;
    cpus.forEach((cpu, i) => {
      for (const k of Object.keys(cpu.times))
        total += cpu.times[k] - previousCpu[i].times[k];
      idle += cpu.times.idle - previousCpu[i].times.idle;
    });
    previousCpu = cpus;
    const cpu = total ? 100 * (1 - idle / total) : 0;
    const freeGiB = os.freemem() / 1024 ** 3,
      ramPercent = 100 * (1 - os.freemem() / os.totalmem());
    const connections = JSON.parse(
      sql(
        "select json_build_object('active',(select count(*) from pg_stat_activity),'max',current_setting('max_connections')::int,'lockWaits',(select count(*) from pg_stat_activity where wait_event_type='Lock'));",
      ),
    );
    const stats = docker([
      'stats',
      '--no-stream',
      '--format',
      '{{json .}}',
      ...liveLab.containerIds,
    ]);
    const generator = spawnSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `Get-Process -Id ${child.pid} -ErrorAction SilentlyContinue | Select-Object CPU,WorkingSet64,PeakWorkingSet64 | ConvertTo-Json -Compress`,
      ],
      { encoding: 'utf8', timeout: 5000 },
    );
    resources.push({
      at: Date.now(),
      cpu,
      freeGiB,
      ramPercent,
      connections,
      backend: stats.split('\n').map((s) => JSON.parse(s)),
      generator: generator.stdout.trim() ? JSON.parse(generator.stdout) : null,
    });
    const pressure = pressureDecision(
      {
        freeMiB: freeGiB * 1024,
        ramPercent,
        cpu,
        connectionRatio: connections.active / connections.max,
      },
      pressureState,
    );
    pressureState = pressure.state;
    if (pressure.stop)
      stop('RESOURCE_SAFETY_LIMIT', freeGiB * 1024 < 512 || ramPercent >= 97);
  } catch {
    stop('MONITORING_UNAVAILABLE');
  } finally {
    monitoring = false;
  }
}, 2000);
const exit = await new Promise((resolve) => {
  child.on('exit', (code) => resolve(code));
  child.on('error', () => resolve(-1));
});
const generatorWallSeconds = (Date.now() - generatorStartedAt) / 1000;
clearInterval(timer);
while (monitoring) await wait(50);
process.removeListener('SIGINT', onInterrupt);
process.removeListener('SIGTERM', onInterrupt);
// Let outstanding server transactions finish and observe recovery without new load.
console.log(
  `Comprobando recuperación e integridad (${plan.recoverySeconds}s)...`,
);
await wait(plan.recoverySeconds * 1000);
let recovered = true;
if (!probe('load', level).allowed) {
  recovered = false;
  interrupted ||= 'HOST_NOT_RECOVERED';
}
try {
  const health = await fetch(labOrigin + '/auth/v1/health', {
    signal: AbortSignal.timeout(5000),
    redirect: 'error',
  });
  if (health.status !== 200) {
    recovered = false;
    interrupted ||= 'BACKEND_NOT_RECOVERED';
  }
} catch {
  recovered = false;
  interrupted ||= 'BACKEND_NOT_RECOVERED';
}
let after = null;
try {
  after = integrity();
} catch {
  recovered = false;
  interrupted ||= 'POST_RUN_INTEGRITY_FAILURE';
}
if (
  args.mode === 'conflict' &&
  after &&
  after.reservations - before.reservations !== 1
)
  interrupted ||= 'CONFLICT_WINNER_COUNT_INVALID';
if (
  args.mode === 'replay' &&
  after &&
  after.reservations - before.reservations !== 5
)
  interrupted ||= 'REPLAY_COUNT_INVALID';
if (
  ['read', 'isolation'].includes(args.mode) &&
  after &&
  after.reservations !== before.reservations
)
  interrupted ||= 'READ_SCENARIO_WROTE_DATA';
fs.writeFileSync(
  path.join(output, 'integrity.json'),
  JSON.stringify({ before, after, interrupted }, null, 2),
);
fs.writeFileSync(
  path.join(output, 'resources.json'),
  JSON.stringify(resources, null, 2),
);

let summaryExported = false;
try {
  const native = JSON.parse(
    fs.readFileSync(path.join(output, 'native-summary.json'), 'utf8'),
  );
  if (series) {
    const acceptedWrites =
      native.metrics['accepted_responses{operation:confirm}']?.count;
    const ownedAfter = ownedCount();
    const expectedSeconds =
      plan.warmSeconds + 2 * plan.rampSeconds + plan.steadySeconds;
    const verified =
      Number.isInteger(acceptedWrites) &&
      acceptedWrites > 0 &&
      ownedAfter - ownedBefore === acceptedWrites &&
      after?.reservations - before.reservations === acceptedWrites &&
      generatorWallSeconds >= expectedSeconds &&
      native.metrics.vus?.max >= level;
    fs.writeFileSync(
      path.join(output, 'write-integrity.json'),
      JSON.stringify(
        {
          ownedBefore,
          ownedAfter,
          acceptedWrites: acceptedWrites ?? null,
          expectedSeconds,
          generatorWallSeconds,
          maximumActiveVU: native.metrics.vus?.max ?? null,
          verified,
        },
        null,
        2,
      ),
    );
    if (!verified)
      interrupted ||= 'COMPLEMENTARY_WRITES_OR_DURATION_NOT_VERIFIED';
  }
  fs.writeFileSync(
    path.join(output, 'summary.json'),
    JSON.stringify(
      { mode: args.mode, level, plan, metrics: native.metrics },
      null,
      2,
    ),
  );
  summaryExported = true;
} catch {
  interrupted ||= 'SUMMARY_EXPORT_MISSING';
}
console.log(
  `${interrupted || exit !== 0 ? 'No aprobado' : 'Finalizado'}: ${level} VU. Evidencia: ${path.relative(root, output)}.`,
);
fs.writeFileSync(
  path.join(output, 'result.json'),
  JSON.stringify(
    {
      exit,
      campaign: campaign?.id || null,
      complementarySeries: series?.id || null,
      type: args.type || null,
      methodology:
        args.type === 'stress' ? 'stress-eof-v1' : 'strict-every-request',
      peak,
      generatorWallSeconds,
      recovered,
      finishedAt: new Date().toISOString(),
      interrupted,
      shutdown: shutdown.snapshot(),
      summaryExported,
      before,
      after,
      output: path.relative(root, output),
      plan,
    },
    null,
    2,
  ),
);
process.exitCode = exit === 0 && !interrupted ? 0 : 1;
fs.writeFileSync(
  path.join(output, 'resource-policy.json'),
  JSON.stringify(policy, null, 2),
);
const peaks = resources
  .map((s) => s.generator?.PeakWorkingSet64 / 1024 ** 2)
  .filter(Number.isFinite);
if (process.exitCode === 0 && peaks.length && args.mode === 'read')
  fs.writeFileSync(
    path.join(lab, 'calibration.json'),
    JSON.stringify(
      {
        passed: true,
        level,
        generatorPeakMiB: Math.max(...peaks),
        measuredAt: new Date().toISOString(),
        output: path.relative(root, output),
      },
      null,
      2,
    ),
  );
if (!campaign && ['read', 'mixed'].includes(args.mode))
  fs.writeFileSync(
    progressFile,
    JSON.stringify(
      {
        runId: marker,
        mode: args.mode,
        level,
        passed: process.exitCode === 0,
        recovered: !interrupted,
        output: path.relative(root, output),
      },
      null,
      2,
    ),
  );
if (series) {
  series.levels[level] = {
    passed: process.exitCode === 0 && recovered,
    recovered,
    output: path.relative(root, output),
    finishedAt: new Date().toISOString(),
  };
  fs.writeFileSync(seriesFile, JSON.stringify(series, null, 2) + '\n');
}
