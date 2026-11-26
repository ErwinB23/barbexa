import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { labOrigin, projectId } from './safety.mjs';
export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
export const lab = path.join(root, '.artifacts/k6/supabase-lab');
export function ownedLab({ recordBaseline = true } = {}) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(lab, 'ownership.json'), 'utf8'),
  );
  if (
    manifest.projectId !== projectId ||
    manifest.origin !== labOrigin ||
    fs.existsSync(path.join(lab, 'supabase/.temp/project-ref'))
  )
    throw Error('NOT_OWNED_LOCAL_LAB');
  const ignored = spawnSync('git', [
    'check-ignore',
    '--quiet',
    '--',
    path.join(lab, 'fixtures.json'),
  ]);
  if (ignored.status !== 0 || fs.lstatSync(lab).isSymbolicLink())
    throw Error('PRIVATE_LAB_REQUIRED');
  const docker = (args, input) => {
    const r = spawnSync('docker', args, {
      input,
      encoding: 'utf8',
      timeout: 20000,
      maxBuffer: 8 * 1024 ** 2,
    });
    if (r.status !== 0) throw Error('LAB_DOCKER_OPERATION_FAILED');
    return r.stdout.trim();
  };
  const all = JSON.parse(
    docker([
      'inspect',
      ...['db', 'auth', 'rest', 'kong', 'edge_runtime', 'inbucket'].map(
        (n) => `supabase_${n}_${projectId}`,
      ),
    ]),
  );
  for (const c of all) {
    if (
      !c.State.Running ||
      !c.Name.endsWith('_' + projectId) ||
      c.Mounts.some((m) =>
        m.Type === 'volume'
          ? !m.Name.endsWith('_' + projectId)
          : !m.Source.replaceAll('\\', '/').includes(
              '/.artifacts/k6/supabase-lab/',
            ),
      )
    )
      throw Error('LAB_NOT_READY_OR_FOREIGN_MOUNT');
  }
  const db = all.find((c) => c.Name === '/supabase_db_' + projectId);
  if (
    db.HostConfig.PortBindings['5432/tcp']?.[0]?.HostPort !== '54722' ||
    !db.Mounts.some((m) => m.Name === 'supabase_db_' + projectId)
  )
    throw Error('UNSAFE_DB_BINDING');
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
  const versions = sql(
    'select version from supabase_migrations.schema_migrations order by version;',
  ).split('\n');
  const names = Object.keys(manifest.migrations).sort();
  if (versions.join(',') !== names.map((n) => n.split('_')[0]).join(','))
    throw Error('MIGRATIONS_NOT_EXACT');
  for (const name of names) {
    for (const base of [
      path.join(root, 'supabase'),
      path.join(lab, 'supabase'),
    ])
      if (
        createHash('sha256')
          .update(fs.readFileSync(path.join(base, 'migrations', name)))
          .digest('hex') !== manifest.migrations[name]
      )
        throw Error('MIGRATION_HASH_MISMATCH');
  }
  const edge = all.find(
    (c) => c.Name === '/supabase_edge_runtime_' + projectId,
  );
  const vars = Object.fromEntries(
    edge.Config.Env.map((s) => {
      const i = s.indexOf('=');
      return [s.slice(0, i), s.slice(i + 1)];
    }),
  );
  const publicKey = vars.SUPABASE_ANON_KEY,
    serviceKey = vars.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicKey || !serviceKey) throw Error('LOCAL_KEYS_NOT_AVAILABLE');
  const request = async (
    resource,
    {
      token = publicKey,
      admin = false,
      method = 'POST',
      body,
      connectionClose = false,
    } = {},
  ) => {
    if (!resource.startsWith('/') || resource.includes('://'))
      throw Error('ONLY_LOCAL_PATHS');
    const r = await fetch(labOrigin + resource, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: {
        apikey: publicKey,
        Authorization: 'Bearer ' + (admin ? serviceKey : token),
        'Content-Type': 'application/json',
        ...(connectionClose ? { Connection: 'close' } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    let payload = null;
    try {
      payload = await r.json();
    } catch {}
    if (r.status === 429)
      throw Error('AUTH_OR_API_RATE_LIMIT_WAIT_AND_RESUME_NO_LIMIT_BYPASS');
    return { status: r.status, body: payload };
  };
  const stats = docker([
    'stats',
    '--no-stream',
    '--format',
    '{{json .}}',
    ...all.map((c) => c.Id),
  ])
    .split('\n')
    .map((s) => JSON.parse(s));
  const bytesMiB = (s) => {
    const m = /^([\d.]+)(KiB|MiB|GiB|B)$/.exec(s.trim());
    if (!m) throw Error('UNKNOWN_DOCKER_MEMORY_UNIT');
    return +m[1] * { B: 1 / 1024 ** 2, KiB: 1 / 1024, MiB: 1, GiB: 1024 }[m[2]];
  };
  const baseline = {
    observedAt: new Date().toISOString(),
    containerCount: all.length,
    totalMiB: stats.reduce(
      (sum, s) => sum + bytesMiB(s.MemUsage.split('/')[0]),
      0,
    ),
  };
  if (recordBaseline)
    fs.writeFileSync(
      path.join(lab, 'backend-baseline.json'),
      JSON.stringify(baseline, null, 2),
    );
  return {
    sql,
    request,
    publicKey,
    baseline,
    containerIds: all.map((c) => c.Id),
  };
}
