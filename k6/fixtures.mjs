import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { setTimeout as wait } from 'node:timers/promises';
import { ownedLab, lab, root } from './lib/lab-client.mjs';
import { projectId, validateFixtures, levelPlan } from './lib/safety.mjs';
import {
  fixtureManifest,
  sessionFresh,
  sqlId,
  syntheticPassword,
} from './lib/fixture-values.mjs';
import { probe } from './resource-probe.mjs';

const action = process.argv[2];
const params = Object.fromEntries(
  process.argv.slice(3).map((arg) => {
    const m = /^--(actors|level|duration)=(\d+)$/.exec(arg);
    if (!m) throw Error('INVALID_FIXTURE_ARGUMENT');
    return [m[1], Number(m[2])];
  }),
);
if (!['prepare', 'verify'].includes(action))
  throw Error('USE_FIXTURES_PREPARE_OR_VERIFY');
const count = params.actors || 2,
  level = params.level || 1;
levelPlan(level);
if (!Number.isInteger(count) || count < 2 || count > 1000 || level > 1000)
  throw Error('MANUAL_TARGET_MAXIMUM_1000');
const env = ownedLab();
const file = path.join(lab, 'fixture-manifest.json');
const output = path.join(lab, 'fixtures.json');
const assertResources = () => {
  const p = probe('fixtures', 1);
  if (!p.allowed)
    throw Error(
      'FIXTURE_PREPARATION_MEMORY_BLOCKED_REQUIRED_MIB_' + p.requiredMiB,
    );
};
const save = (value) =>
  fs.writeFileSync(file, JSON.stringify(value, null, 2), { mode: 0o600 });
const check = (r, statuses, name) => {
  if (!statuses.includes(r.status)) throw Error(name + '_HTTP_' + r.status);
  return r.body;
};
const verify = async (fixtures) => {
  validateFixtures(fixtures, { runId: fixtures.runId }, Math.max(2, level));
  if (
    env.sql('select run_id::text from private.k6_lab_marker;') !==
    fixtures.runId
  )
    throw Error('LAB_MARKER_MISMATCH');
  for (const actor of fixtures.actors) {
    const who = check(
      await env.request('/auth/v1/user', { method: 'GET', token: actor.token }),
      [200],
      'AUTH_VERIFY',
    );
    if (who.id !== actor.id) throw Error('SESSION_IDENTITY_MISMATCH');
  }
  for (const t of fixtures.tenants) {
    const token = fixtures.actors[0].token;
    const catalog = check(
      await env.request('/rest/v1/rpc/get_booking_catalog', {
        token,
        body: { p_barbershop_id: t.id },
      }),
      [200],
      'CATALOG',
    );
    if (
      catalog.barbershopId !== t.id ||
      !catalog.services.some((s) => s.id === t.serviceId) ||
      !catalog.professionals.some((p) => p.id === t.barberId)
    )
      throw Error('CATALOG_CONTRACT_MISMATCH');
    const slots = check(
      await env.request('/rest/v1/rpc/list_booking_slots', {
        token,
        body: {
          p_barbershop_id: t.id,
          p_local_date: t.localDate,
          p_service_ids: [t.serviceId],
          p_barber_id: t.barberId,
        },
      }),
      [200],
      'SLOTS',
    );
    if (!Array.isArray(slots) || slots.length < 8)
      throw Error('INSUFFICIENT_REAL_AVAILABLE_SLOTS');
  }
  const token = fixtures.actors[0].token,
    other = fixtures.tenants[1 - fixtures.actors[0].tenant];
  const invalid = check(
    await env.request('/functions/v1/reservation-command', {
      token,
      body: { action: 'invalid-k6-probe' },
    }),
    [400],
    'EDGE_VALIDATION',
  );
  if (invalid?.error?.code !== 'INVALID_INPUT')
    throw Error('EDGE_VALIDATION_CONTRACT_MISMATCH');
  check(
    await env.request('/rest/v1/rpc/list_booking_agenda', {
      token,
      body: {
        p_barbershop_id: other.id,
        p_local_date: other.localDate,
        p_barber_id: null,
        p_state: null,
      },
    }),
    [403],
    'TENANT_AGENDA_ISOLATION',
  );
  const rows = check(
    await env.request(
      '/rest/v1/reservations?select=id,barbershop_id&barbershop_id=eq.' +
        other.id,
      { token, method: 'GET' },
    ),
    [200],
    'TENANT_RLS',
  );
  if (!Array.isArray(rows) || rows.length) throw Error('TENANT_ROWS_VISIBLE');
  const integrity = JSON.parse(
    env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
  );
  if (
    Object.entries(integrity).some(([k, v]) => k !== 'reservations' && v !== 0)
  )
    throw Error('INITIAL_INTEGRITY_FAILED');
  const evidence = {
    verifiedAt: new Date().toISOString(),
    actors: fixtures.actors.length,
    tenants: 2,
    realAuthSessions: true,
    edgeValidationAndReadIsolation: true,
    catalogAndSlots: true,
    integrity,
    backend: env.baseline,
    policy: probe('load', level),
  };
  fs.writeFileSync(
    path.join(lab, 'fixture-verification.json'),
    JSON.stringify(evidence, null, 2),
  );
  console.log(
    `Laboratorio verificado: ${fixtures.actors.length} clientes, 2 barberías, Auth e integridad correctos. Evidencia guardada.`,
  );
};
if (action === 'verify') {
  await verify(JSON.parse(fs.readFileSync(output, 'utf8')));
} else {
  assertResources();
  const lock = path.join(lab, 'fixture-preparation.lock');
  const fd = fs.openSync(lock, 'wx');
  fs.writeSync(
    fd,
    JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }),
  );
  let ownLock = true;
  const releaseOnExit = () => {
    if (ownLock) {
      try {
        fs.unlinkSync(lock);
      } catch {}
    }
  };
  process.once('exit', releaseOnExit);
  process.once('SIGINT', () => process.exit(130));
  process.once('SIGTERM', () => process.exit(143));
  try {
    let m;
    if (fs.existsSync(file)) {
      m = fixtureManifest(JSON.parse(fs.readFileSync(file, 'utf8')));
    } else {
      const empty = env.sql(
        'select (select count(*) from auth.users)+(select count(*) from public.barbershops)+(select count(*) from public.reservations);',
      );
      if (
        empty !== '0' ||
        env.sql("select to_regclass('private.k6_lab_marker') is null;") !== 't'
      )
        throw Error('LAB_HAS_EXISTING_DATA_NO_INITIALIZATION');
      m = fixtureManifest({
        projectId,
        runId: randomUUID(),
        accounts: [],
        tenants: [],
      });
      save(m);
    }
    if (
      env.sql("select to_regclass('private.k6_lab_marker') is null;") === 't'
    ) {
      if (
        m.accounts.length ||
        env.sql('select count(*) from auth.users;') !== '0'
      )
        throw Error('FOREIGN_LAB_WITHOUT_MARKER');
      env.sql(
        `begin; create table private.k6_lab_marker(run_id uuid primary key); revoke all on private.k6_lab_marker from public,anon,authenticated; insert into private.k6_lab_marker values (${sqlId(m.runId)}); commit;`,
      );
    }
    if (env.sql('select run_id::text from private.k6_lab_marker;') !== m.runId)
      throw Error('FOREIGN_LAB_MARKER');
    // Wait for Auth's real rate limits without changing server settings or measured traffic.
    const request = async (url, init) => {
      for (let attempt = 0; attempt < 30; attempt++) {
        assertResources();
        try {
          return await env.request(url, init);
        } catch (e) {
          if (!e.message.startsWith('AUTH_OR_API_RATE_LIMIT')) throw e;
          console.log(
            'Auth limit: waiting 310 seconds. Progress saved; no rate-limit bypass.',
          );
          for (let i = 0; i < 31; i++) {
            await wait(10000);
            assertResources();
          }
        }
      }
      throw Error('AUTH_RATE_LIMIT_RESUME_PREPARATION_LATER');
    };
    const account = async (index, role) => {
      let a = m.accounts.find((a) => a.index === index);
      if (!a) {
        a = {
          index,
          role,
          email: `k6-${m.runId}-${index}@example.invalid`,
          password: syntheticPassword(),
        };
        m.accounts.push(a);
        save(m);
      }
      if (!a.id) {
        if (a.email !== `k6-${m.runId}-${index}@example.invalid`)
          throw Error('FOREIGN_ACCOUNT_EMAIL');
        const existing = env.sql(
          `select id from auth.users where email='${a.email.replaceAll("'", "''")}';`,
        );
        if (!existing) {
          a.password = syntheticPassword();
          save(m);
        }
        a.id =
          existing ||
          check(
            await request('/auth/v1/admin/users', {
              admin: true,
              body: {
                email: a.email,
                password: a.password,
                email_confirm: true,
              },
            }),
            [200, 201],
            'CREATE_SYNTHETIC_USER',
          ).id;
        sqlId(a.id);
        save(m);
      }
      return a;
    };
    const session = async (a, remainingSeconds) => {
      if (sessionFresh(a, remainingSeconds)) return a.session.access_token;
      let fresh = a.session?.refresh_token
        ? await request('/auth/v1/token?grant_type=refresh_token', {
            body: { refresh_token: a.session.refresh_token },
          })
        : await request('/auth/v1/token?grant_type=password', {
            body: { email: a.email, password: a.password },
          });
      if (a.session?.refresh_token && [400, 401].includes(fresh.status))
        fresh = await request('/auth/v1/token?grant_type=password', {
          body: { email: a.email, password: a.password },
        });
      a.session = check(fresh, [200], 'REAL_AUTH_SESSION');
      save(m);
      if (a.session.user?.id !== a.id || !sessionFresh(a, remainingSeconds))
        throw Error('INVALID_REAL_AUTH_SESSION');
      return a.session.access_token;
    };
    const op = async (token, body) =>
      check(
        await request('/functions/v1/barbershop-operation', { token, body }),
        [200],
        'OFFERING_' + body.action,
      );
    const owners = [await account(0, 'owner'), await account(1, 'owner')];
    for (const [i, a] of owners.entries()) {
      const token = await session(a, 600);
      check(
        await request('/functions/v1/ensure-profile', {
          token,
          body: { displayName: `K6 owner ${i}`, phone: null },
        }),
        [200],
        'PROFILE',
      );
      let t = m.tenants[i];
      if (!t) {
        const shopName = `K6 synthetic ${i} ${m.runId}`;
        const existing = env.sql(
          `select b.id from public.barbershops b join private.barbershop_ownership o on o.barbershop_id=b.id where b.name='${shopName}' and o.owner_user_id=${sqlId(a.id)};`,
        );
        const created = existing
          ? { barbershop: { id: existing } }
          : check(
              await request('/functions/v1/create-barbershop', {
                token,
                body: { name: shopName },
              }),
              [201],
              'SHOP',
            );
        t = { id: created.barbershop.id };
        m.tenants[i] = t;
        save(m);
      }
      // Configure only fixtures owned by this manifest; never discover/edit unrelated shops.
      if (
        env.sql(
          `select owner_user_id from private.barbershop_ownership where barbershop_id=${sqlId(t.id)};`,
        ) !== a.id
      )
        throw Error('NOT_OWNED_FIXTURE_SHOP');
      await op(token, {
        action: 'configure-shop',
        barbershopId: t.id,
        publicContact: 'Synthetic local fixture',
        address: 'Synthetic laboratory',
        policies: {
          minimumNoticeMin: 0,
          bookingHorizonDays: 14,
          maxFuturePerClient: 12,
          slotStepMin: 15,
          bufferMin: 0,
          cancellationAdvanceMin: 120,
        },
      });
      if (!t.serviceId) {
        const existing = env.sql(
          `select id from public.services where barbershop_id=${sqlId(t.id)} and name='K6 synthetic service';`,
        );
        const s = existing
          ? { id: existing }
          : await op(token, {
              action: 'upsert-service',
              barbershopId: t.id,
              name: 'K6 synthetic service',
              category: 'Corte de cabello',
              description: 'Synthetic local load fixture',
              price: { amountMinor: 1500, currency: 'PEN' },
              durationMin: 15,
              active: true,
            });
        t.serviceId = s.id;
        save(m);
      }
      if (!t.barberId) {
        const existing = env.sql(
          `select id from public.barber_profiles where barbershop_id=${sqlId(t.id)} and user_id=${sqlId(a.id)};`,
        );
        const p = existing
          ? { id: existing }
          : await op(token, {
              action: 'set-professional',
              barbershopId: t.id,
              userId: a.id,
              professionalName: `K6 professional ${i}`,
              active: true,
            });
        t.barberId = p.id;
        save(m);
      }
      const hours = Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        opensMin: 540,
        closesMin: 1080,
      }));
      for (const data of [
        { action: 'set-shop-hours', hours },
        { action: 'set-barber-hours', barberId: t.barberId, hours },
        {
          action: 'set-capabilities',
          barberId: t.barberId,
          serviceIds: [t.serviceId],
        },
        { action: 'set-publication', state: 'published' },
      ])
        await op(token, { barbershopId: t.id, ...data });
      t.localDate = new Date(Date.now() + 3 * 86400000)
        .toISOString()
        .slice(0, 10);
      save(m);
    }
    const clients = [];
    for (let i = 0; i < count; i++) {
      const a = await account(i + 2, 'client');
      const token = await session(a, 600);
      if (!a.profileReady) {
        check(
          await request('/functions/v1/ensure-profile', {
            token,
            body: { displayName: `K6 client ${i}`, phone: null },
          }),
          [200],
          'CLIENT_PROFILE',
        );
        a.profileReady = true;
        save(m);
      }
      clients.push(a);
      if ((i + 1) % 10 === 0)
        console.log(
          `Prepared ${i + 1}/${count} synthetic accounts; credentials remain private.`,
        );
    }
    const plan = levelPlan(level);
    const remaining = Math.max(
      600,
      params.duration ? params.duration + 420 : 0,
      plan.warmSeconds +
        2 * plan.rampSeconds +
        plan.steadySeconds +
        plan.recoverySeconds +
        300,
    );
    const actors = [];
    for (const [i, a] of clients.entries())
      actors.push({
        id: a.id,
        tenant: i < 2 ? 0 : i % 2,
        token: await session(a, remaining),
      });
    // Renewing a large set may outlive the earliest token: reject instead of exporting stale sessions.
    if (clients.some((a) => !sessionFresh(a, remaining)))
      throw Error('SESSION_PREPARATION_TOO_SLOW_RETRY_REFRESH_BEFORE_RUN');
    const tenants = m.tenants.map(({ id, serviceId, barberId, localDate }) => ({
      id,
      serviceId,
      barberId,
      localDate,
    }));
    const slots = check(
      await request('/rest/v1/rpc/list_booking_slots', {
        token: actors[0].token,
        body: {
          p_barbershop_id: tenants[0].id,
          p_local_date: tenants[0].localDate,
          p_service_ids: [tenants[0].serviceId],
          p_barber_id: tenants[0].barberId,
        },
      }),
      [200],
      'SLOTS_FOR_WRITES',
    );
    if (!Array.isArray(slots) || slots.length < 8)
      throw Error('WRITE_FIXTURE_SLOTS_UNAVAILABLE');
    const base = {
      barbershopId: tenants[0].id,
      serviceIds: [tenants[0].serviceId],
      barberId: tenants[0].barberId,
    };
    const fixtures = {
      runId: m.runId,
      publicKey: env.publicKey,
      tenants,
      actors,
      writes: slots.slice(0, 5).map((s) => ({
        actorIndex: 0,
        body: { ...base, requestId: randomUUID(), startsAt: s.startsAt },
      })),
      conflict: {
        body: { ...base, startsAt: slots[6].startsAt },
        requestIds: [randomUUID(), randomUUID()],
      },
    };
    validateFixtures(fixtures, { runId: m.runId }, count);
    fs.writeFileSync(output, JSON.stringify(fixtures, null, 2), {
      mode: 0o600,
    });
    await verify(fixtures);
  } finally {
    ownLock = false;
    process.removeListener('exit', releaseOnExit);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
