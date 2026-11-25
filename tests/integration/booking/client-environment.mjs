import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { assertBookingEnvironment } from '../../../scripts/run-backend-integration.mjs';
export const fixtureFile = path.resolve(
  '.artifacts/004-client/credenciales-locales.json',
);
export function localBookingEnvironment() {
  const projectId = 'app-barberia-002-local',
    url = 'http://127.0.0.1:54421';
  if (
    process.env.BARBERIA_002_PROJECT_ID !== projectId ||
    process.env.BARBERIA_002_URL !== url
  )
    throw Error('UNAUTHORIZED_LOCAL_TARGET');
  const command = (args, input) => {
    const r = spawnSync('docker', args, {
      input,
      encoding: 'utf8',
      timeout: 20000,
    });
    if (r.status !== 0) throw Error('LOCAL_OPERATOR_FAILED');
    return r.stdout.trim();
  };
  const [db, edge] = JSON.parse(
    command([
      'inspect',
      'supabase_db_' + projectId,
      'supabase_edge_runtime_' + projectId,
    ]),
  );
  assertBookingEnvironment({ projectId, url }, db);
  if (
    !edge.State.Running ||
    edge.Name !== '/supabase_edge_runtime_' + projectId
  )
    throw Error('WRONG_EDGE_TARGET');
  const vars = Object.fromEntries(
    edge.Config.Env.map((s) => {
      const i = s.indexOf('=');
      return [s.slice(0, i), s.slice(i + 1)];
    }),
  );
  const anon = vars.SUPABASE_ANON_KEY,
    service = vars.SUPABASE_SERVICE_ROLE_KEY;
  if (!anon || !service) throw Error('LOCAL_KEYS_UNAVAILABLE');
  const sql = (q) =>
    command(
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
      q,
    );
  const quote = (id) => {
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
      throw Error('UNOWNED_ID');
    return "'" + id + "'";
  };
  async function request(
    resource,
    { token = anon, admin = false, origin, ...init } = {},
  ) {
    const r = await fetch(url + resource, {
      ...init,
      headers: {
        apikey: anon,
        Authorization: 'Bearer ' + (admin ? service : token),
        'Content-Type': 'application/json',
        ...(origin ? { Origin: origin } : {}),
      },
      signal: AbortSignal.timeout(15000),
    });
    let body = null;
    try {
      body = await r.json();
    } catch {}
    return { status: r.status, body };
  }
  const post = (token, resource, body, origin) =>
    request(resource, {
      token,
      method: 'POST',
      body: JSON.stringify(body),
      origin,
    });
  const login = async (account) => {
    const r = await post(anon, '/auth/v1/token?grant_type=password', {
      email: account.email,
      password: account.password,
    });
    if (r.status !== 200 || !r.body?.access_token)
      throw Error('FIXTURE_LOGIN_FAILED');
    const who = await request('/auth/v1/user', { token: r.body.access_token });
    if (who.status !== 200 || who.body.id !== account.id)
      throw Error('FIXTURE_IDENTITY_MISMATCH');
    return r.body.access_token;
  };
  const operation = (token, body) =>
    post(
      token,
      '/functions/v1/barbershop-operation',
      body,
      'http://localhost:8081',
    );
  const read = () => {
    if (!fs.existsSync(fixtureFile)) throw Error('FIXTURE_NOT_PREPARED');
    const value = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
    if (value.project !== projectId || !/^client-[a-f0-9]{12}$/.test(value.run))
      throw Error('WRONG_FIXTURE_MANIFEST');
    return value;
  };
  const save = (value) => {
    if (value.project !== projectId) throw Error('WRONG_FIXTURE_MANIFEST');
    const ignore = spawnSync(
      'git',
      ['check-ignore', '--quiet', '--', fixtureFile],
      { encoding: 'utf8' },
    );
    if (ignore.status !== 0) throw Error('CREDENTIAL_FILE_NOT_IGNORED');
    fs.mkdirSync(path.dirname(fixtureFile), { recursive: true });
    if (fs.lstatSync(path.dirname(fixtureFile)).isSymbolicLink())
      throw Error('UNSAFE_FIXTURE_DIRECTORY');
    fs.writeFileSync(fixtureFile, JSON.stringify(value, null, 2) + '\n');
  };
  const baseline = () =>
    sql(
      "select jsonb_build_object('users',(select count(*) from auth.users),'profiles',(select md5(coalesce(string_agg(row_to_json(p)::text,',' order by id),'')) from public.profiles p),'members',(select count(*) from public.barbershop_memberships),'shops',(select count(*) from public.barbershops),'reservations',(select count(*) from public.reservations))",
    );
  return {
    projectId,
    url,
    sql,
    quote,
    request,
    post,
    login,
    operation,
    read,
    save,
    baseline,
    command,
    db,
  };
}
