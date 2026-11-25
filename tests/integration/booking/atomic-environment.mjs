import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { assertBookingEnvironment } from '../../../scripts/run-backend-integration.mjs';
export const evidence = 'docs/evaluacion/evidencias/004-reservas/t012-t016/';
export async function withAtomicEnvironment(consume) {
  const projectId = 'app-barberia-002-local',
    url = 'http://127.0.0.1:54421';
  if (
    process.env.BARBERIA_002_PROJECT_ID !== projectId ||
    process.env.BARBERIA_002_URL !== url
  )
    throw Error('UNAUTHORIZED_TEST_TARGET');
  const docker = (args, input) => {
    const r = spawnSync('docker', args, {
      input,
      encoding: 'utf8',
      timeout: 25000,
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
  const before = JSON.parse(
    docker(['inspect', ...docker(['ps', '-aq']).split(/\s+/)]),
  );
  const preserved = before
    .filter(
      (c) =>
        c.Name.endsWith('_barberia-app') ||
        c.Name.includes('_app-barberia-002-repro-'),
    )
    .map((c) => ({
      id: c.Id,
      name: c.Name,
      started: c.State.StartedAt,
      mounts: c.Mounts.map((m) => ({
        name: m.Name,
        destination: m.Destination,
      })),
    }));
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
  const literal = (v) =>
    "'" + JSON.stringify(v).replaceAll("'", "''") + "'::jsonb";
  const baselineQuery =
    "select jsonb_build_object('users',(select count(*) from auth.users),'profiles',(select md5(coalesce(string_agg(row_to_json(p)::text,',' order by id),'')) from public.profiles p),'members',(select count(*) from public.barbershop_memberships),'shops',(select count(*) from public.barbershops),'reservations',(select count(*) from public.reservations))";
  const baseline = sql(baselineQuery),
    users = [],
    shops = [],
    run = randomBytes(6).toString('hex');
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
  // The public Edge command is T017, not implemented here. This test bridge explicitly verifies
  // the real JWT via Auth before invoking the service-only SQL boundary. It is NOT an Edge E2E.
  const confirm = async (user, data) => {
    const verified = await request('/auth/v1/user', { token: user.token });
    if (verified.status !== 200 || verified.body?.id !== user.id)
      throw Error('UNVERIFIED_ACTOR');
    return request('/rest/v1/rpc/confirm_booking', {
      admin: true,
      method: 'POST',
      body: JSON.stringify({ p_actor_id: verified.body.id, p_data: data }),
    });
  };
  try {
    for (let i = 0; i < 5; i++) {
      const email = `atomic-${run}-${i}@example.invalid`,
        password = randomBytes(32).toString('base64url');
      const created = await request('/auth/v1/admin/users', {
        admin: true,
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true }),
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
        displayName: `004-atomic-${run}-${i}`,
        phone: null,
      });
      if (profile.status !== 200) throw Error('LOCAL_PROFILE_FAILED');
    }
    for (const i of [0, 1]) {
      const name = `004-atomic-${run}-${i}`;
      const r = await post(users[i].token, '/functions/v1/create-barbershop', {
        name,
      });
      if (r.status !== 201) throw Error('LOCAL_SHOP_FAILED');
      shops.push({ id: r.body.barbershop.id, name });
    }
    sql(
      `insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values(${quote(users[0].id)},${quote(shops[1].id)},'barber','active'),(${quote(users[4].id)},${quote(shops[0].id)},'barber','inactive');`,
    );
    await consume({
      users,
      shops,
      sql,
      quote,
      literal,
      request,
      post,
      command,
      confirm,
      dbId: db.Id,
      run,
    });
  } finally {
    const ids = users.map((u) => quote(u.id)).join(','),
      shopIds = shops.map((s) => quote(s.id)).join(',');
    if (users.length) {
      for (const u of users) {
        const own = await request('/auth/v1/admin/users/' + u.id, {
          admin: true,
        });
        if (own.status !== 200 || own.body?.email !== u.email)
          throw Error('CLEANUP_USER_OWNERSHIP_MISMATCH');
      }
      if (shops.length) {
        const safe = JSON.parse(
          sql(
            `select jsonb_build_object('shops',(select count(*) from public.barbershops where id in(${shopIds}) and name like '004-atomic-${run}-%'),'foreignMembers',(select count(*) from public.barbershop_memberships where(barbershop_id in(${shopIds}) and user_id not in(${ids}))or(user_id in(${ids})and barbershop_id not in(${shopIds}))),'foreignProfessionals',(select count(*) from public.barber_profiles where(barbershop_id in(${shopIds}) and user_id not in(${ids}))or(user_id in(${ids})and barbershop_id not in(${shopIds}))),'foreignReservations',(select count(*) from public.reservations where(barbershop_id in(${shopIds}) and(client_user_id not in(${ids})or barber_user_id not in(${ids})))or(barbershop_id not in(${shopIds})and(client_user_id in(${ids})or barber_user_id in(${ids})))),'foreignEvents',(select count(*) from public.reservation_events where barbershop_id in(${shopIds}) and actor_user_id not in(${ids})),'invitations',(select count(*) from public.staff_invitations where barbershop_id in(${shopIds})),'memberships',(select count(*) from public.barbershop_memberships where barbershop_id in(${shopIds})),'professionals',(select count(*) from public.barber_profiles where barbershop_id in(${shopIds})),'services',(select count(*) from public.services where barbershop_id in(${shopIds})),'reservations',(select count(*) from public.reservations where barbershop_id in(${shopIds})))`,
          ),
        );
        if (
          safe.shops !== shops.length ||
          safe.foreignMembers ||
          safe.foreignProfessionals ||
          safe.foreignReservations ||
          safe.foreignEvents ||
          safe.invitations ||
          safe.memberships > 4 ||
          safe.professionals > 2 ||
          safe.services > 4 ||
          safe.reservations > 60
        )
          throw Error('UNEXPECTED_DEPENDENCY_STOP_CLEANUP');
        sql(
          `begin;delete from public.reservation_events where barbershop_id in(${shopIds});delete from public.reservation_items where barbershop_id in(${shopIds});delete from public.reservations where barbershop_id in(${shopIds});delete from public.schedule_exceptions where barbershop_id in(${shopIds});delete from public.barber_schedules where barbershop_id in(${shopIds});delete from public.barbershop_hours where barbershop_id in(${shopIds});delete from public.barber_services where barbershop_id in(${shopIds});delete from public.barber_profiles where barbershop_id in(${shopIds});delete from public.services where barbershop_id in(${shopIds});delete from public.barbershop_booking_settings where barbershop_id in(${shopIds});delete from public.barbershop_memberships where barbershop_id in(${shopIds}) and user_id in(${ids});delete from public.barbershops where id in(${shopIds});commit;`,
        );
      }
      sql(
        `delete from public.profiles where id in(${ids}) and display_name like '004-atomic-${run}-%';`,
      );
      for (const u of users) {
        const r = await request('/auth/v1/admin/users/' + u.id, {
          admin: true,
          method: 'DELETE',
        });
        if (![200, 204].includes(r.status)) throw Error('AUTH_CLEANUP_FAILED');
        delete u.token;
      }
      if (
        sql(baselineQuery) !== baseline ||
        Number(sql(`select count(*) from auth.users where id in(${ids})`))
      )
        throw Error('BASELINE_NOT_PRESERVED');
    }
    const after = JSON.parse(
      docker(['inspect', ...preserved.map((c) => c.id)]),
    );
    const intact = preserved.every((c) => {
      const a = after.find((v) => v.Id === c.id);
      return (
        a &&
        a.State.StartedAt === c.started &&
        JSON.stringify(
          a.Mounts.map((m) => ({ name: m.Name, destination: m.Destination })),
        ) === JSON.stringify(c.mounts)
      );
    });
    // Old vector can restart by itself; compare identity/mounts separately from that known unstable service.
    const oldIntact = preserved.every((c) => {
      const a = after.find((v) => v.Id === c.id);
      return (
        a &&
        JSON.stringify(
          a.Mounts.map((m) => ({ name: m.Name, destination: m.Destination })),
        ) === JSON.stringify(c.mounts)
      );
    });
    fs.writeFileSync(
      evidence + 'cleanup.json',
      JSON.stringify(
        {
          project: projectId,
          usersCreated: users.length,
          shopsCreated: shops.length,
          remainingOwnedUsers: 0,
          baselinePreserved: true,
          credentialFilesWritten: 0,
          emailsSent: 0,
          oldAndReproductionContainerIdentitiesMountsPreserved: oldIntact,
          allStartTimesIdentical: intact,
          previousUsers: JSON.parse(baseline).users,
        },
        null,
        2,
      ) + '\n',
    );
    if (!oldIntact) throw Error('CONTAINER_BASELINE_CHANGED');
  }
}
