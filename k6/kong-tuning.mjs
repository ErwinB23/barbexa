import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { labOrigin, projectId } from './lib/safety.mjs';
import {
  tuneNginx,
  tuneEntrypoint,
  assertDescriptorLimit,
} from './lib/kong-config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lab = path.join(root, '.artifacts/k6/supabase-lab');
const files = {
  template: '/home/kong/custom_nginx.template',
  effective: '/usr/local/kong/nginx.conf',
  entrypoint: '/docker-entrypoint.sh',
};
const nginx = '/usr/local/openresty/nginx/sbin/nginx';
const hash = (s) => createHash('sha256').update(s).digest('hex');
function docker(args, input) {
  const r = spawnSync('docker', args, {
    input,
    encoding: 'utf8',
    timeout: 20000,
    maxBuffer: 2 * 1024 ** 2,
  });
  if (r.status !== 0) throw Error('KONG_LAB_DOCKER_OPERATION_FAILED');
  return r.stdout;
}
function scope() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(lab, 'ownership.json'), 'utf8'),
  );
  if (
    manifest.projectId !== projectId ||
    manifest.origin !== labOrigin ||
    fs.lstatSync(lab).isSymbolicLink() ||
    fs.existsSync(path.join(lab, 'supabase/.temp/project-ref'))
  )
    throw Error('ONLY_OWNED_UNLINKED_K6_LAB');
  if (
    spawnSync('git', [
      'check-ignore',
      '--quiet',
      '--',
      path.join(lab, 'ownership.json'),
    ]).status !== 0
  )
    throw Error('PRIVATE_LAB_REQUIRED');
  const [kong, db] = JSON.parse(
    docker([
      'inspect',
      `supabase_kong_${projectId}`,
      `supabase_db_${projectId}`,
    ]),
  );
  if (
    kong.Name !== `/supabase_kong_${projectId}` ||
    db.Name !== `/supabase_db_${projectId}` ||
    !kong.State.Running ||
    !db.State.Running ||
    db.HostConfig.PortBindings['5432/tcp']?.[0]?.HostPort !== '54722' ||
    !db.Mounts.some((m) => m.Name === `supabase_db_${projectId}`) ||
    kong.Mounts.length !== 0 ||
    !kong.Args.join(' ').includes(files.template)
  )
    throw Error('UNEXPECTED_LAB_CONTAINER_OR_TEMPLATE');
  return kong;
}
function readFiles(id) {
  return Object.fromEntries(
    Object.entries(files).map(([name, file]) => [
      name,
      docker(['exec', id, 'cat', file]),
    ]),
  );
}
function validate(id, current) {
  if (!/^worker_processes\s+1;/m.test(current.effective))
    throw Error('UNEXPECTED_WORKER_COUNT');
  if (
    tuneNginx(current.template) !== current.template ||
    tuneNginx(current.effective) !== current.effective ||
    !current.entrypoint.includes('# BARBEXA_K6_CONNECTIONS_4096')
  )
    throw Error('KONG_4096_NOT_EFFECTIVE_OR_PERSISTENT');
  const masterLimit = docker(['exec', id, 'cat', '/proc/1/limits']);
  assertDescriptorLimit(masterLimit);
  const workerLimits = docker([
    'exec',
    id,
    'sh',
    '-c',
    'master=$(cat /usr/local/kong/pids/nginx.pid); for p in $(cat /proc/$master/task/$master/children); do cat /proc/$p/limits; done',
  ]);
  if (!workerLimits) throw Error('NGINX_WORKER_NOT_FOUND');
  const workerDescriptors = [...workerLimits.matchAll(/Max open files[^\n]*/g)];
  if (!workerDescriptors.length) throw Error('WORKER_DESCRIPTORS_UNKNOWN');
  for (const match of workerDescriptors) assertDescriptorLimit(match[0]);
  docker([
    'exec',
    id,
    nginx,
    '-t',
    '-p',
    '/usr/local/kong/',
    '-c',
    'nginx.conf',
  ]);
  return {
    workerConnections: 4096,
    workerProcesses: 1,
    descriptors: {
      master: masterLimit.match(/Max open files[^\n]*/)?.[0],
      workers: [...workerLimits.matchAll(/Max open files[^\n]*/g)].map(
        (m) => m[0],
      ),
    },
    syntaxValid: true,
    persistentEntrypoint: true,
  };
}
export function tuneKong(action = 'verify') {
  if (!['apply', 'verify'].includes(action))
    throw Error('USE_KONG_APPLY_OR_VERIFY');
  const container = scope(),
    id = container.Id;
  const before = readFiles(id);
  let evidence = null;
  if (action === 'apply') {
    if (process.platform === 'win32') {
      const p = spawnSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-Command',
          '(Get-Process k6 -ErrorAction SilentlyContinue | Measure-Object).Count',
        ],
        { encoding: 'utf8', timeout: 10000, windowsHide: true },
      );
      if (p.status !== 0 || p.stdout.trim() !== '0')
        throw Error('K6_ACTIVE_OR_PROCESS_CHECK_UNAVAILABLE');
    }
    const after = {
      template: tuneNginx(before.template),
      effective: tuneNginx(before.effective),
      entrypoint: tuneEntrypoint(before.entrypoint),
    };
    const changes = Object.keys(files).filter((k) => before[k] !== after[k]);
    if (changes.length) {
      assertDescriptorLimit(docker(['exec', id, 'cat', '/proc/1/limits']));
      evidence = path.join(
        lab,
        'kong-tuning',
        new Date().toISOString().replaceAll(':', '-') + '-' + randomUUID(),
      );
      fs.mkdirSync(evidence, { recursive: true });
      for (const key of Object.keys(files)) {
        fs.writeFileSync(path.join(evidence, key + '.before'), before[key], {
          flag: 'wx',
        });
        fs.writeFileSync(path.join(evidence, key + '.after'), after[key], {
          flag: 'wx',
        });
      }
      const write = (key, value) =>
        docker(
          ['exec', '--user', '0', '-i', id, 'sh', '-c', `cat > ${files[key]}`],
          value,
        );
      const written = [];
      try {
        for (const key of changes) {
          write(key, after[key]);
          written.push(key);
        }
        docker(['exec', id, 'bash', '-n', files.entrypoint]);
        validate(id, readFiles(id));
        docker([
          'exec',
          id,
          nginx,
          '-s',
          'reload',
          '-p',
          '/usr/local/kong/',
          '-c',
          'nginx.conf',
        ]);
      } catch (error) {
        for (const key of written) write(key, before[key]);
        docker([
          'exec',
          id,
          nginx,
          '-t',
          '-p',
          '/usr/local/kong/',
          '-c',
          'nginx.conf',
        ]);
        throw error;
      }
      fs.writeFileSync(
        path.join(evidence, 'change.json'),
        JSON.stringify(
          {
            containerId: id,
            changed: changes,
            before: Object.fromEntries(
              Object.entries(before).map(([k, v]) => [k, hash(v)]),
            ),
            after: Object.fromEntries(
              Object.entries(after).map(([k, v]) => [k, hash(v)]),
            ),
            appliedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    }
  }
  return {
    projectId,
    containerId: id,
    evidence: evidence && path.relative(root, evidence),
    ...validate(id, readFiles(id)),
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.length !== 3)
    throw Error('USE_NODE_K6_KONG_TUNING_APPLY_OR_VERIFY');
  console.log(JSON.stringify(tuneKong(process.argv[2]), null, 2));
}
