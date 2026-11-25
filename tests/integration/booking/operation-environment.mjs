import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { assertBookingEnvironment } from '../../../scripts/run-backend-integration.mjs';
const projectId = 'app-barberia-002-local',
  url = 'http://127.0.0.1:54421';
export async function withOperationEnvironment(consume) {
  if (
    process.env.BARBERIA_002_PROJECT_ID !== projectId ||
    process.env.BARBERIA_002_URL !== url
  )
    throw Error('UNAUTHORIZED_TEST_TARGET');
  const docker = (args, input) => {
    const r = spawnSync('docker', args, {
      input,
      encoding: 'utf8',
      timeout: 20000,
    });
    if (r.status !== 0) throw Error('LOCAL_OPERATOR_FAILED');
    return r.stdout.trim();
  };
  const [db, edge] = JSON.parse(
    docker([
      'inspect',
      'supabase_db_' + projectId,
      'supabase_edge_runtime_' + projectId,
    ]),
  );
  assertBookingEnvironment({ projectId, url }, db);
  const vars = Object.fromEntries(
    edge.Config.Env.map((v) => {
      const i = v.indexOf('=');
      return [v.slice(0, i), v.slice(i + 1)];
    }),
  );
  const anon = vars.SUPABASE_ANON_KEY,
    service = vars.SUPABASE_SERVICE_ROLE_KEY;
  if (!anon || !service) throw Error('LOCAL_KEYS_UNAVAILABLE');
  const sql = (q) =>
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
      q,
    );
  const quote = (id) => {
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw Error('UNOWNED_ID');
    return "'" + id + "'";
  };
  const users = [],
    shops = [],
    run = randomBytes(6).toString('hex');
  const baseline = sql(
    "select jsonb_build_object('users',(select count(*) from auth.users),'profiles',(select md5(coalesce(string_agg(row_to_json(p)::text,',' order by id),'')) from public.profiles p),'members',(select count(*) from public.barbershop_memberships),'shops',(select count(*) from public.barbershops))",
  );
  async function request(path, { token = anon, admin = false, ...init } = {}) {
    const r = await fetch(url + path, {
      ...init,
      headers: {
        apikey: anon,
        Authorization: 'Bearer ' + (admin ? service : token),
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(15000),
    });
    let body = null;
    try {
      body = await r.json();
    } catch {}
    return { status: r.status, body };
  }
  const post = (token, path, data) =>
    request(path, { token, method: 'POST', body: JSON.stringify(data) });
  const command = (user, data) =>
    post(user.token, '/functions/v1/barbershop-operation', data);
  try {
    for (let i = 0; i < 4; i++) {
      const email = `op-${run}-${i}@example.invalid`,
        password = randomBytes(32).toString('base64url');
      const created = await request('/auth/v1/admin/users', {
        admin: true,
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: 'administrator' },
        }),
      });
      if (!created.body?.id || ![200, 201].includes(created.status))
        throw Error('LOCAL_AUTH_CREATE_FAILED');
      const u = { id: created.body.id, email };
      users.push(u);
      quote(u.id);
      const login = await post(anon, '/auth/v1/token?grant_type=password', {
        email,
        password,
      });
      if (login.status !== 200 || !login.body?.access_token)
        throw Error('LOCAL_LOGIN_FAILED');
      u.token = login.body.access_token;
      const profile = await post(u.token, '/functions/v1/ensure-profile', {
        displayName: `004-op-${run}-${i}`,
        phone: null,
      });
      if (profile.status !== 200) throw Error('LOCAL_PROFILE_FAILED');
    }
    for (const [index, label] of [
      [0, 'A'],
      [1, 'B'],
    ]) {
      const name = `004-op-${run}-${label}`;
      const r = await post(
        users[index].token,
        '/functions/v1/create-barbershop',
        { name },
      );
      if (r.status !== 201) throw Error('LOCAL_SHOP_FAILED');
      shops.push({ id: r.body.barbershop.id, name });
    }
    sql(
      `insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values(${quote(users[0].id)},${quote(shops[1].id)},'barber','active'),(${quote(users[3].id)},${quote(shops[0].id)},'barber','inactive');`,
    );
    await consume({
      users,
      shops,
      sql,
      quote,
      request,
      post,
      command,
      anon,
      dbId: db.Id,
      run,
    });
  } finally {
    // New IDs only; never broad cleanup by email or a shared name prefix.
    const ids = users.map((u) => quote(u.id)).join(',');
    const shopIds = shops.map((s) => quote(s.id)).join(',');
    if (users.length) {
      for (const u of users) {
        const found = await request('/auth/v1/admin/users/' + u.id, {
          admin: true,
        });
        if (found.status !== 200 || found.body?.email !== u.email)
          throw Error('CLEANUP_USER_OWNERSHIP_MISMATCH');
      }
      if (shops.length) {
        if (sql("select to_regclass('public.reservations') is null") !== 't')
          throw Error('RESERVATION_SCHEMA_REQUIRES_CLEANUP_REVIEW');
        const limits = JSON.parse(
          sql(
            `select jsonb_build_object('memberships',(select count(*) from public.barbershop_memberships where barbershop_id in(${shopIds})),'professionals',(select count(*) from public.barber_profiles where barbershop_id in(${shopIds})),'services',(select count(*) from public.services where barbershop_id in(${shopIds})),'invitations',(select count(*) from public.staff_invitations where barbershop_id in(${shopIds})))`,
          ),
        );
        if (
          limits.memberships > 6 ||
          limits.professionals > 3 ||
          limits.services > 3 ||
          limits.invitations > 10
        )
          throw Error('FIXTURE_LIMIT_EXCEEDED_STOP_CLEANUP');
        const safe = JSON.parse(
          sql(
            `select jsonb_build_object('shops',(select count(*) from public.barbershops where id in(${shopIds}) and name like '004-op-${run}-%'),'unknownMembers',(select count(*) from public.barbershop_memberships where(barbershop_id in(${shopIds}) and user_id not in(${ids}))or(user_id in(${ids})and barbershop_id not in(${shopIds}))),'unknownProfessionals',(select count(*) from public.barber_profiles where barbershop_id in(${shopIds}) and user_id not in(${ids})),'unknownInvites',(select count(*) from public.staff_invitations where barbershop_id in(${shopIds}) and(recipient_user_id not in(${ids})or inviter_user_id not in(${ids}))))`,
          ),
        );
        if (
          safe.shops !== shops.length ||
          safe.unknownMembers ||
          safe.unknownProfessionals ||
          safe.unknownInvites
        )
          throw Error('UNEXPECTED_DEPENDENCY_STOP_CLEANUP');
        sql(
          `begin;delete from public.staff_invitations where barbershop_id in(${shopIds});delete from public.schedule_exceptions where barbershop_id in(${shopIds});delete from public.barber_schedules where barbershop_id in(${shopIds});delete from public.barbershop_hours where barbershop_id in(${shopIds});delete from public.barber_services where barbershop_id in(${shopIds});delete from public.barber_profiles where barbershop_id in(${shopIds});delete from public.services where barbershop_id in(${shopIds});delete from public.barbershop_booking_settings where barbershop_id in(${shopIds});delete from public.barbershop_memberships where barbershop_id in(${shopIds}) and user_id in(${ids});delete from public.barbershops where id in(${shopIds});commit;`,
        );
      }
      sql(
        `delete from public.profiles where id in(${ids}) and display_name like '004-op-${run}-%';`,
      );
      for (const u of users) {
        const r = await request('/auth/v1/admin/users/' + u.id, {
          admin: true,
          method: 'DELETE',
        });
        if (![200, 204].includes(r.status)) throw Error('AUTH_CLEANUP_FAILED');
        delete u.token;
      }
      const remaining = Number(
        sql(`select count(*) from auth.users where id in(${ids})`),
      );
      const after = sql(
        "select jsonb_build_object('users',(select count(*) from auth.users),'profiles',(select md5(coalesce(string_agg(row_to_json(p)::text,',' order by id),'')) from public.profiles p),'members',(select count(*) from public.barbershop_memberships),'shops',(select count(*) from public.barbershops))",
      );
      if (remaining || baseline !== after)
        throw Error('BASELINE_NOT_PRESERVED');
      fs.writeFileSync(
        'docs/evaluacion/evidencias/004-reservas/t008-t011/cleanup.json',
        JSON.stringify(
          {
            date: '2026-11-14',
            project: projectId,
            usersCreated: users.length,
            shopsCreated: shops.length,
            remainingOwnedUsers: remaining,
            baselinePreserved: true,
            credentialFilesWritten: 0,
            emailsSent: 0,
          },
          null,
          2,
        ) + '\n',
      );
    }
  }
}
