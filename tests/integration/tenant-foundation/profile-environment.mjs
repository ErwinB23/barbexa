// Privileged LOCAL preparation only; never passed to the client composition.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHmac, randomBytes } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { assertLocalTarget, fixtureCredentials } from './fixtures.mjs';
const docker =
  'C:/Users/PREDATOR/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe';
const projectId = 'app-barberia-002-local',
  url = 'http://127.0.0.1:54421';
const inspect = (names) => {
  try {
    return JSON.parse(
      execFileSync(docker, ['inspect', ...names], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    );
  } catch {
    throw Error('LOCAL_INSPECTION_FAILED');
  }
};
export async function withProfileEnvironment(consume) {
  assertLocalTarget({ url, projectId });
  if (
    process.env.BARBERIA_002_URL !== url ||
    process.env.BARBERIA_002_PROJECT_ID !== projectId
  )
    throw Error('REQUESTED_TARGET_MISMATCH');
  const [db, edge] = inspect([
    'supabase_db_' + projectId,
    'supabase_edge_runtime_' + projectId,
  ]);
  const old = JSON.parse(
    fs.readFileSync(
      'docs/evaluacion/evidencias/002-fundacion/t017-docker-reference.json',
      'utf8',
    ),
  );
  const oldVolumes = new Set(
    old.old.flatMap((c) =>
      c.mounts.filter((m) => m.type === 'volume').map((m) => m.name),
    ),
  );
  if (
    db.Name !== '/supabase_db_' + projectId ||
    db.HostConfig.PortBindings['5432/tcp'][0].HostPort !== '54422' ||
    !db.Mounts.some((m) => m.Name === 'supabase_db_' + projectId) ||
    !edge.NetworkSettings.Networks['supabase_network_' + projectId] ||
    [db, edge].some((c) => c.Mounts.some((m) => oldVolumes.has(m.Name)))
  )
    throw Error('UNSAFE_FIXTURE_TARGET');
  const vars = Object.fromEntries(
    edge.Config.Env.map((s) => {
      const i = s.indexOf('=');
      return [s.slice(0, i), s.slice(i + 1)];
    }),
  );
  const publicKey = vars.SUPABASE_ANON_KEY,
    serviceKey = vars.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicKey || !serviceKey) throw Error('LOCAL_CREDENTIALS_UNAVAILABLE');
  const sql = (statement) => {
    try {
      return execFileSync(
        docker,
        [
          'exec',
          db.Id,
          'psql',
          '-U',
          'postgres',
          '-d',
          'postgres',
          '-At',
          '-v',
          'ON_ERROR_STOP=1',
          '-c',
          statement,
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      ).trim();
    } catch {
      throw Error('LOCAL_FIXTURE_SQL_FAILED');
    }
  };
  const admin = async (path, init = {}) => {
    const r = await fetch(url + '/auth/v1/admin/' + path, {
      ...init,
      headers: {
        apikey: publicKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw Error('LOCAL_AUTH_SETUP_FAILED');
    return r.status === 204 ? null : await r.json();
  };
  const users = [];
  try {
    for (let i = 0; i < 3; i++) {
      const credentials = fixtureCredentials();
      const user = await admin('users', {
        method: 'POST',
        body: JSON.stringify({
          ...credentials,
          email_confirm: true,
          user_metadata: { role: 'administrator', userId: 'forged' },
        }),
      });
      if (!/^[0-9a-f-]{36}$/i.test(user.id)) throw Error('INVALID_FIXTURE_ID');
      users.push({ id: user.id });
      const r = await fetch(url + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: publicKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(10000),
      });
      if (!r.ok) throw Error('LOCAL_AUTH_SIGNIN_FAILED');
      users[i].token = (await r.json()).access_token;
    }
    const signedFixture = (kind) => {
      const original = JSON.parse(
        Buffer.from(users[0].token.split('.')[1], 'base64url').toString(),
      );
      const body = {
        ...original,
        exp:
          kind === 'expired'
            ? Math.floor(Date.now() / 1000) - 60
            : Math.floor(Date.now() / 1000) + 60,
        iss:
          kind === 'foreign'
            ? 'https://independent-fixture.invalid/auth/v1'
            : original.iss,
      };
      const header = Buffer.from(
        JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
      ).toString('base64url');
      const payload = Buffer.from(JSON.stringify(body)).toString('base64url');
      const key =
        kind === 'foreign'
          ? randomBytes(32)
          : vars.SUPABASE_INTERNAL_JWT_SECRET;
      if (!key) throw Error('FIXTURE_SIGNING_KEY_UNAVAILABLE');
      return (
        header +
        '.' +
        payload +
        '.' +
        createHmac('sha256', key)
          .update(header + '.' + payload)
          .digest('base64url')
      );
    };
    const ordinary = (token, path, init = {}) =>
      fetch(url + path, {
        ...init,
        headers: {
          apikey: publicKey,
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          ...init.headers,
        },
        signal: AbortSignal.timeout(10000),
      });
    await consume({
      url,
      projectId,
      publicKey,
      users,
      ordinary,
      signedFixture,
      profileCount: (id) => {
        if (!/^[0-9a-f-]{36}$/i.test(id)) throw Error('INVALID_FIXTURE_ID');
        return Number(
          sql("select count(*) from public.profiles where id='" + id + "'"),
        );
      },
    });
  } finally {
    if (users.length) {
      sql(
        'delete from public.profiles where id in (' +
          users.map((u) => "'" + u.id + "'").join(',') +
          ');',
      );
      for (const user of users)
        await admin('users/' + user.id, { method: 'DELETE' });
    }
  }
}
