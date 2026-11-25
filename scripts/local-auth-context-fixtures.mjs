// Controlled T027 data only. No schema/config changes; never a production/client dependency.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  assertLocalTarget,
  runChecked,
} from '../tests/integration/tenant-foundation/fixtures.mjs';
const project = 'app-barberia-002-local',
  url = 'http://127.0.0.1:54421';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  directory = path.join(root, '.artifacts', 't027-context');
const stateFile = path.join(directory, 'state.json'),
  credentialsFile = path.join(directory, 'credenciales-locales.txt');
const evidence = path.join(
  root,
  'docs/evaluacion/evidencias/003-autenticacion/t018-t027',
);
const uuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export function validateFixtureState(state) {
  if (
    state?.owner !== 'T027-context-local' ||
    state.project !== project ||
    !/^[0-9a-f]{12}$/.test(state.run) ||
    state.users.length > 3 ||
    state.shops.length > 2 ||
    state.memberships.length > 4
  )
    throw Error('UNSAFE_FIXTURE_STATE');
  if (
    !state.users.every(
      (v) =>
        uuid(v.id) &&
        ['shared', 'single', 'inactive'].includes(v.label) &&
        v.email === `${v.label}-${state.run}@example.invalid`,
    ) ||
    !state.shops.every(
      (v) =>
        uuid(v.id) &&
        ['A', 'B'].includes(v.label) &&
        v.name === `T027-${state.run}-${v.label}`,
    ) ||
    !state.memberships.every(
      (v) =>
        uuid(v.id) &&
        state.users.some((u) => u.id === v.userId) &&
        state.shops.some((s) => s.id === v.shopId),
    )
  )
    throw Error('UNSAFE_FIXTURE_IDENTIFIERS');
  return state;
}
function environment() {
  assertLocalTarget({ url, projectId: project });
  const inspect = (names) =>
    JSON.parse(runChecked('docker', ['inspect', ...names]));
  const [db, edge] = inspect([
    `supabase_db_${project}`,
    `supabase_edge_runtime_${project}`,
  ]);
  if (
    db.Name !== `/supabase_db_${project}` ||
    db.HostConfig.PortBindings['5432/tcp']?.[0]?.HostPort !== '54422' ||
    !db.Mounts.some((m) => m.Name === `supabase_db_${project}`) ||
    !edge.NetworkSettings.Networks[`supabase_network_${project}`]
  )
    throw Error('UNSAFE_LOCAL_DESTINATION');
  const vars = Object.fromEntries(
    edge.Config.Env.map((s) => {
      const i = s.indexOf('=');
      return [s.slice(0, i), s.slice(i + 1)];
    }),
  );
  const anon = vars.SUPABASE_ANON_KEY,
    service = vars.SUPABASE_SERVICE_ROLE_KEY;
  if (!anon || !service) throw Error('LOCAL_KEYS_MISSING');
  const sql = (statement) =>
    runChecked(
      'docker',
      [
        'exec',
        db.Id,
        'psql',
        '-U',
        'postgres',
        '-d',
        'postgres',
        '-Atq',
        '-v',
        'ON_ERROR_STOP=1',
        '-c',
        statement,
      ],
      { timeout: 15000 },
    ).trim();
  async function request(route, { token, admin = false, ...init } = {}) {
    const r = await fetch(url + route, {
      ...init,
      headers: {
        apikey: anon,
        Authorization: `Bearer ${admin ? service : (token ?? anon)}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(12000),
    });
    let body;
    try {
      body = await r.json();
    } catch {
      body = null;
    }
    return { status: r.status, body };
  }
  const quote = (id) => {
    if (!uuid(id)) throw Error('UNSAFE_UUID');
    return `'${id}'`;
  };
  function fingerprint(state) {
    const excluded = (items) =>
      items.length ? items.map((v) => quote(v.id)).join(',') : 'NULL';
    return JSON.parse(
      sql(
        `select jsonb_build_object('users',(select md5(coalesce(string_agg(id::text,',' order by id),'')) from auth.users where id not in (${state.users.length ? excluded(state.users) : "'00000000-0000-0000-0000-000000000000'"})), 'profiles',(select md5(coalesce(string_agg(row_to_json(p)::text,'|' order by id),'')) from public.profiles p where id not in (${state.users.length ? excluded(state.users) : "'00000000-0000-0000-0000-000000000000'"})), 'shops',(select md5(coalesce(string_agg(row_to_json(s)::text,'|' order by id),'')) from public.barbershops s where id not in (${state.shops.length ? excluded(state.shops) : "'00000000-0000-0000-0000-000000000000'"})), 'memberships',(select md5(coalesce(string_agg(row_to_json(m)::text,'|' order by id),'')) from public.barbershop_memberships m where id not in (${state.memberships.length ? excluded(state.memberships) : "'00000000-0000-0000-0000-000000000000'"})))`,
      ),
    );
  }
  async function token(user) {
    const r = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: user.password }),
    });
    if (r.status !== 200 || !r.body?.access_token)
      throw Error('FIXTURE_SIGNIN_FAILED');
    return r.body.access_token;
  }
  return { db, inspect, sql, request, quote, fingerprint, token };
}
function save(state) {
  validateFixtureState(state);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
}
function load() {
  if (
    fs.lstatSync(directory).isSymbolicLink() ||
    fs.lstatSync(stateFile).isSymbolicLink()
  )
    throw Error('FIXTURE_PATH_REDIRECTED');
  return validateFixtureState(JSON.parse(fs.readFileSync(stateFile, 'utf8')));
}
function safeResult(name, result) {
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(
    path.join(evidence, `t027-${name}.json`),
    JSON.stringify(
      {
        date: '2026-11-14',
        executedBy: 'operador local; ver atribución documental',
        project,
        result,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ operation: name, ...result }));
}
async function prepare(env) {
  if (fs.existsSync(stateFile)) throw Error('FIXTURE_SET_ALREADY_EXISTS');
  const state = {
    owner: 'T027-context-local',
    project,
    run: randomBytes(6).toString('hex'),
    dbId: env.db.Id,
    users: [],
    shops: [],
    memberships: [],
  };
  state.baseline = env.fingerprint(state);
  save(state);
  for (const label of ['shared', 'single', 'inactive']) {
    const email = `${label}-${state.run}@example.invalid`,
      password = `Ctx-${randomBytes(7).toString('hex')}`;
    const created = await env.request('/auth/v1/admin/users', {
      admin: true,
      method: 'POST',
      body: JSON.stringify({ email, password, email_confirm: true }),
    });
    if (![200, 201].includes(created.status) || !uuid(created.body?.id))
      throw Error('FIXTURE_CREATE_USER_FAILED');
    const user = { id: created.body.id, label, email, password };
    state.users.push(user);
    save(state);
    const jwt = await env.token(user);
    const profile = await env.request('/functions/v1/ensure-profile', {
      token: jwt,
      method: 'POST',
      body: JSON.stringify({
        displayName: `T027-${state.run}-${label}`,
        phone: null,
      }),
    });
    if (profile.status !== 200) throw Error('FIXTURE_PROFILE_FAILED');
  }
  for (const [label, index] of [
    ['A', 0],
    ['B', 1],
  ]) {
    const jwt = await env.token(state.users[index]);
    const name = `T027-${state.run}-${label}`;
    const created = await env.request('/functions/v1/create-barbershop', {
      token: jwt,
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (created.status !== 201 && created.status !== 200)
      throw Error('FIXTURE_CREATE_SHOP_FAILED');
    const { barbershop, membership } = created.body ?? {};
    if (
      !uuid(barbershop?.id) ||
      !uuid(membership?.id) ||
      membership.userId !== state.users[index].id
    )
      throw Error('FIXTURE_SHOP_RESULT_INVALID');
    state.shops.push({ id: barbershop.id, name, label });
    state.memberships.push({
      id: membership.id,
      userId: membership.userId,
      shopId: barbershop.id,
      label: `admin-${label}`,
    });
    save(state);
  }
  const shared = {
    id: randomUUID(),
    userId: state.users[0].id,
    shopId: state.shops[1].id,
    label: 'shared-barber-B',
  };
  const inactive = {
    id: randomUUID(),
    userId: state.users[2].id,
    shopId: state.shops[0].id,
    label: 'inactive-A',
  };
  state.memberships.push(shared, inactive);
  save(state);
  env.sql(
    `begin; insert into public.barbershop_memberships(id,user_id,barbershop_id,role,status) values(${env.quote(shared.id)},${env.quote(shared.userId)},${env.quote(shared.shopId)},'barber','active'),(${env.quote(inactive.id)},${env.quote(inactive.userId)},${env.quote(inactive.shopId)},'barber','inactive'); commit;`,
  );
  if (JSON.stringify(state.baseline) !== JSON.stringify(env.fingerprint(state)))
    throw Error('EXISTING_DATA_CHANGED');
  fs.writeFileSync(
    credentialsFile,
    [
      'SOLO DATOS FICTICIOS LOCALES T027. NO COPIAR A GIT/CHAT.',
      'Web: http://localhost:8081/sign-in',
      'Android: APK Development / Metro 192.168.0.33:8081',
      ...state.users.flatMap((u) => ['', u.label, u.email, u.password]),
      '',
      `Barbería A: ${state.shops[0].name}`,
      `Barbería B: ${state.shops[1].name}`,
      'shared: administrador A/barbero B; single: administrador B; inactive: cero contexto autorizado.',
    ].join('\n'),
  );
  state.prepared = true;
  save(state);
  safeResult('preparacion', {
    newUsers: 3,
    newProfiles: 3,
    newShops: 2,
    newMemberships: 4,
    existingDataFingerprintPreserved: true,
    credentialsFile: '.artifacts/t027-context/credenciales-locales.txt',
    tokensWritten: false,
    emailsRequested: 0,
  });
}
async function verify(env, state) {
  const tokens = await Promise.all(state.users.map(env.token));
  const results = [];
  const check = (label, ok, status) => {
    results.push({ label, ok, ...(status !== undefined ? { status } : {}) });
    if (!ok) throw Error('FIXTURE_EXPECTATION_FAILED');
  };
  const [a, b] = state.shops;
  const [shared, , inactive] = state.users;
  for (const [index, shop, expected] of [
    [0, a, 200],
    [0, b, 403],
    [1, b, 200],
    [1, a, 403],
    [2, a, 403],
    [2, b, 403],
  ]) {
    const r = await env.request('/rest/v1/rpc/list_barbershop_memberships', {
      token: tokens[index],
      method: 'POST',
      body: JSON.stringify({ p_barbershop_id: shop.id }),
    });
    check(
      `administrative-scope-${index}-${shop.label}`,
      r.status === expected,
      r.status,
    );
  }
  for (const shop of [a, b]) {
    const r = await env.request(
      `/rest/v1/barbershops?select=id,name&id=eq.${shop.id}`,
      { token: tokens[2] },
    );
    check(
      `inactive-no-private-shop-${shop.label}`,
      r.status === 200 && Array.isArray(r.body) && r.body.length === 0,
      r.status,
    );
  }
  const own = await env.request(
    `/rest/v1/barbershop_memberships?select=barbershop_id,role,status&user_id=eq.${shared.id}`,
    { token: tokens[0] },
  );
  check(
    'shared-roles-stay-contextual',
    own.status === 200 &&
      own.body.some(
        (m) => m.barbershop_id === a.id && m.role === 'administrator',
      ) &&
      own.body.some((m) => m.barbershop_id === b.id && m.role === 'barber'),
    own.status,
  );
  const sqlResult = JSON.parse(
    env.sql(
      `begin;set local role authenticated;set local request.jwt.claims='{"sub":"${inactive.id}","role":"authenticated"}';select jsonb_build_object('inactiveA',(select count(*)=0 from public.barbershops where id=${env.quote(a.id)}),'inactiveB',(select count(*)=0 from public.barbershops where id=${env.quote(b.id)}));rollback;`,
    ),
  );
  check(
    'real-sql-rls-inactive-isolated',
    sqlResult.inactiveA && sqlResult.inactiveB,
  );
  check(
    'existing-data-preserved',
    JSON.stringify(state.baseline) === JSON.stringify(env.fingerprint(state)),
  );
  safeResult('verificacion', {
    checks: results,
    passed: results.length,
    failed: 0,
    newUsersRemaining: state.users.length,
    scope: 'real local SQL and HTTP/JWT; UI manual not included',
  });
}
async function revoke(env, state) {
  const row = state.memberships.find((v) => v.label === 'shared-barber-B');
  if (!row) throw Error('FIXTURE_ROW_MISSING');
  env.sql(
    `update public.barbershop_memberships set status='inactive' where id=${env.quote(row.id)} and user_id=${env.quote(row.userId)} and barbershop_id=${env.quote(row.shopId)} and role='barber';`,
  );
  state.revoked = true;
  save(state);
  const jwt = await env.token(state.users[0]);
  const r = await env.request(
    `/rest/v1/barbershops?select=id,name&id=eq.${row.shopId}`,
    { token: jwt },
  );
  if (r.status !== 200 || r.body?.length !== 0)
    throw Error('REVOCATION_NOT_ENFORCED');
  safeResult('revocacion', {
    updatedOnlyOwnedMembership: true,
    serverPrivateShopRows: 0,
    manualRefreshStillRequired: true,
  });
}
async function cleanup(env, state) {
  if (JSON.stringify(state.baseline) !== JSON.stringify(env.fingerprint(state)))
    throw Error('EXISTING_DATA_CHANGED_STOP_CLEANUP');
  const users = state.users.map((v) => env.quote(v.id)).join(','),
    shops = state.shops.map((v) => env.quote(v.id)).join(','),
    members = state.memberships.map((v) => env.quote(v.id)).join(',');
  if (!users || !shops || !members)
    throw Error('PARTIAL_FIXTURE_REQUIRES_REVIEW');
  const userList = await Promise.all(
    state.users.map((u) =>
      env.request('/auth/v1/admin/users/' + u.id, { admin: true }),
    ),
  );
  if (
    userList.some(
      (r, i) => r.status !== 200 || r.body?.email !== state.users[i].email,
    )
  )
    throw Error('USER_OWNERSHIP_NOT_CONFIRMED');
  const extras = Number(
    env.sql(
      `select count(*) from public.barbershop_memberships where(user_id in(${users}) or barbershop_id in(${shops}))and id not in(${members})`,
    ),
  );
  if (extras) throw Error('UNKNOWN_DEPENDENCIES_STOP_CLEANUP');
  const ownedNames = Number(
    env.sql(
      `select count(*) from public.barbershops where id in(${shops}) and name like 'T027-${state.run}-%'`,
    ),
  );
  if (ownedNames !== state.shops.length)
    throw Error('SHOP_OWNERSHIP_NOT_CONFIRMED');
  const revoked = state.memberships.find((m) => m.label === 'shared-barber-B');
  if (!state.revoked || !revoked) throw Error('REVOCATION_NOT_RECORDED');
  const proof = JSON.parse(
    env.sql(`select jsonb_build_object(
    'revokedMembershipInactive',(select count(*)=1 from public.barbershop_memberships where id=${env.quote(revoked.id)} and user_id=${env.quote(revoked.userId)} and barbershop_id=${env.quote(revoked.shopId)} and role='barber' and status='inactive'),
    'ownedProfiles',(select count(*) from public.profiles where id in(${users}) and display_name like 'T027-${state.run}-%'),
    'ownedMemberships',(select count(*) from public.barbershop_memberships where id in(${members}) and user_id in(${users}) and barbershop_id in(${shops})))`),
  );
  if (
    !proof.revokedMembershipInactive ||
    proof.ownedProfiles !== 3 ||
    proof.ownedMemberships !== 4
  )
    throw Error('OWNED_DATA_OR_REVOCATION_MISMATCH');
  safeResult('prelimpieza', {
    ...proof,
    ownedAuthUsersConfirmed: userList.length,
    ownedShopsConfirmed: ownedNames,
    unknownMembershipDependencies: extras,
    existingDataFingerprintPreserved: true,
    destinationPort: 54422,
  });
  env.sql(
    `begin;delete from public.barbershop_memberships where id in(${members}) and user_id in(${users}) and barbershop_id in(${shops});delete from public.barbershops where id in(${shops}) and name like 'T027-${state.run}-%';delete from public.profiles where id in(${users}) and display_name like 'T027-${state.run}-%';commit;`,
  );
  for (const u of state.users) {
    const r = await env.request('/auth/v1/admin/users/' + u.id, {
      admin: true,
      method: 'DELETE',
    });
    if (![200, 204].includes(r.status))
      throw Error('SELECTIVE_AUTH_CLEANUP_FAILED');
  }
  const remaining = JSON.parse(
    env.sql(
      `select jsonb_build_object('users',(select count(*) from auth.users where id in(${users})),'profiles',(select count(*) from public.profiles where id in(${users})),'shops',(select count(*) from public.barbershops where id in(${shops})),'memberships',(select count(*) from public.barbershop_memberships where id in(${members})))`,
    ),
  );
  if (Object.values(remaining).some((n) => n !== 0))
    throw Error('FIXTURE_DATA_REMAINS');
  if (JSON.stringify(state.baseline) !== JSON.stringify(env.fingerprint(state)))
    throw Error('EXISTING_DATA_CHANGED_AFTER_CLEANUP');
  for (const u of state.users) delete u.password;
  state.cleaned = true;
  save(state);
  fs.writeFileSync(
    credentialsFile,
    'Conjunto T027 eliminado selectivamente; credenciales ficticias retiradas.\n',
  );
  safeResult('limpieza', { remaining, existingDataFingerprintPreserved: true });
}
async function main() {
  const [action, ...extra] = process.argv.slice(2);
  if (
    extra.length ||
    !['prepare', 'verify', 'revoke', 'cleanup'].includes(action)
  )
    throw Error('USAGE_PREPARE_VERIFY_REVOKE_CLEANUP');
  const env = environment();
  if (action === 'prepare') return prepare(env);
  const state = load();
  if (state.dbId !== env.db.Id || !state.prepared || state.cleaned)
    throw Error('FIXTURE_TARGET_OR_PHASE_MISMATCH');
  if (action === 'verify') return verify(env, state);
  if (action === 'revoke') return revoke(env, state);
  return cleanup(env, state);
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((e) => {
    console.error(
      /^[A-Z_]+$/.test(e.message) ? e.message : 'LOCAL_CONTEXT_FIXTURE_FAILED',
    );
    process.exitCode = 1;
  });
