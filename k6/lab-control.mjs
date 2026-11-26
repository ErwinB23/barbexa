import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { labOrigin, projectId } from './lib/safety.mjs';
import { tuneKong } from './kong-tuning.mjs';
import { probe } from './resource-probe.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lab = path.join(root, '.artifacts/k6/supabase-lab');
const action = process.argv[2];
if (
  process.argv.length !== 3 ||
  !['start', 'status', 'integrity', 'stop'].includes(action)
)
  throw Error('USE_LAB_CONTROL_START_STATUS_INTEGRITY_OR_STOP');
const manifest = JSON.parse(
  fs.readFileSync(path.join(lab, 'ownership.json'), 'utf8'),
);
if (manifest.projectId !== projectId || manifest.origin !== labOrigin)
  throw Error('NOT_OWNED_LAB');
if (fs.existsSync(path.join(lab, 'supabase/.temp/project-ref')))
  throw Error('LINKED_PROJECT_NOT_ALLOWED');
function docker(args, input) {
  const r = spawnSync('docker', args, {
    input,
    encoding: 'utf8',
    timeout: 20000,
  });
  if (r.status !== 0) throw Error('LAB_DOCKER_OPERATION_FAILED');
  return r.stdout.trim();
}
function containers() {
  const ids = docker(['ps', '-a', '--format', '{{.ID}} {{.Names}}'])
    .split('\n')
    .filter((s) => s.trim().endsWith('_' + projectId))
    .map((s) => s.split(' ')[0]);
  if (!ids.length) return [];
  const entries = JSON.parse(docker(['inspect', ...ids]));
  for (const c of entries) {
    if (
      !c.Name.endsWith('_' + projectId) ||
      c.Mounts.some((m) =>
        m.Type === 'volume'
          ? !m.Name.endsWith('_' + projectId)
          : !(
              m.Source.replaceAll('\\', '/').includes(
                '/.artifacts/k6/supabase-lab/',
              ) || ['/var/run/docker.sock', '/etc/localtime'].includes(m.Source)
            ),
      )
    )
      throw Error('UNSAFE_LAB_MOUNT');
  }
  return entries;
}
const existingForStart = action === 'start' ? containers() : [];
if (
  action === 'start' &&
  ['db', 'auth', 'rest', 'kong', 'edge_runtime', 'inbucket'].every((n) =>
    existingForStart.some(
      (c) => c.Name === `/supabase_${n}_${projectId}` && c.State.Running,
    ),
  )
) {
  tuneKong('apply');
  console.log('Owned lab already running; no restart performed.');
  process.exit(0);
}
if (action === 'start') {
  const startupPolicy = probe('startup', 1);
  if (!startupPolicy.allowed) throw Error(startupPolicy.blockers.join(', '));
  if (startupPolicy.warnings.length)
    console.warn(
      'Aviso de memoria: arranque supervisado; no hay mínimo preventivo fijo.',
    );
  const config = fs.readFileSync(
    path.join(lab, 'supabase/config.toml'),
    'utf8',
  );
  if (
    !config.includes('project_id = "barbexa-k6-lab"') ||
    !config.includes('port = 54721') ||
    !config.includes('port = 54722') ||
    /port = 54[345]/.test(config)
  )
    throw Error('UNSAFE_LAB_CONFIG');
  for (const [name, hash] of Object.entries(manifest.migrations)) {
    for (const base of [
      path.join(root, 'supabase'),
      path.join(lab, 'supabase'),
    ]) {
      if (
        createHash('sha256')
          .update(fs.readFileSync(path.join(base, 'migrations', name)))
          .digest('hex') !== hash
      )
        throw Error('MIGRATION_HASH_MISMATCH');
    }
  }
  containers();
  // No private CLI output (local keys) is printed to the terminal.
  const fd = fs.openSync(path.join(lab, 'startup.log'), 'a');
  try {
    const r = spawnSync(
      process.execPath,
      [
        path.join(root, 'node_modules/supabase/dist/supabase.js'),
        'start',
        '--workdir',
        lab,
        '--exclude',
        'studio,postgres-meta,logflare,vector,supavisor,realtime,storage-api,imgproxy',
      ],
      { cwd: root, stdio: ['ignore', fd, fd], timeout: 240000 },
    );
    if (r.status !== 0) throw Error('LAB_START_FAILED_SEE_IGNORED_STARTUP_LOG');
  } finally {
    fs.closeSync(fd);
  }
  tuneKong('apply');
}
const entries = containers();
if (action === 'stop') {
  const running = entries.filter((c) => c.State.Running);
  for (const group of [
    running.filter((c) => !c.Name.startsWith('/supabase_db_')),
    running.filter((c) => c.Name.startsWith('/supabase_db_')),
  ]) {
    if (group.length)
      docker(['stop', '--timeout', '45', ...group.map((c) => c.Id)]);
  }
  console.log(
    JSON.stringify({ stopped: running.length, removed: 0, projectId }),
  );
} else if (action === 'integrity') {
  const db = entries.find(
    (c) => c.Name === '/supabase_db_' + projectId && c.State.Running,
  );
  if (!db || db.HostConfig.PortBindings['5432/tcp']?.[0]?.HostPort !== '54722')
    throw Error('LAB_DB_NOT_READY');
  const sql = (statement) =>
    docker(
      [
        'exec',
        '-i',
        db.Id,
        'psql',
        '-X',
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
  const fixtures = JSON.parse(
    fs.readFileSync(path.join(lab, 'fixtures.json'), 'utf8'),
  );
  if (sql('select run_id::text from private.k6_lab_marker;') !== fixtures.runId)
    throw Error('LAB_MARKER_MISMATCH');
  const result = JSON.parse(
    sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
  );
  fs.writeFileSync(
    path.join(lab, 'integrity-manual.json'),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
  if (
    [
      'overlaps',
      'duplicateRequests',
      'partialReservations',
      'tenantMismatch',
      'duplicateReceipts',
    ].some((k) => result[k] !== 0)
  )
    process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        projectId,
        containers: entries.map((c) => ({
          name: c.Name,
          state: c.State.Status,
          health: c.State.Health?.Status || 'not-configured',
        })),
        freeGiB: +(os.freemem() / 1024 ** 3).toFixed(2),
      },
      null,
      2,
    ),
  );
  if (!entries.length) process.exitCode = 2;
}
