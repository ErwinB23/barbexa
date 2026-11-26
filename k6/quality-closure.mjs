// Acotado, nunca genera carga: casos faltantes EQ-01/03/07/10 en el lab poseído.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ownedLab, lab, root } from './lib/lab-client.mjs';
import { sqlId as q, syntheticPassword } from './lib/fixture-values.mjs';
import { careRace } from '../tests/integration/booking/care-race.mjs';

if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const env = ownedLab();
const fixture = JSON.parse(
  fs.readFileSync(path.join(lab, 'fixture-manifest.json')),
);
assert.equal(
  env.sql('select run_id from private.k6_lab_marker;'),
  fixture.runId,
);
const dir = path.join(lab, 'quality-closure');
fs.mkdirSync(dir, { recursive: true });
const privateFile = path.join(dir, 'manifest.json');
assert.equal(
  spawnSync('git', ['check-ignore', '--quiet', '--', privateFile]).status,
  0,
);
const reportFile = path.join(
  root,
  'docs/evaluacion/evidencias/004-reservas/sprint2-closure/results.json',
);
fs.mkdirSync(path.dirname(reportFile), { recursive: true });
const read = (f) => JSON.parse(fs.readFileSync(f));
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
const hash = (f) =>
  createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const walk = (d) =>
  fs.existsSync(d)
    ? fs
        .readdirSync(d, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
        )
    : [];
const protectedFiles = () =>
  Object.fromEntries(
    [
      ...walk(path.join(root, 'supabase')),
      ...walk(path.join(root, 'src')),
      ...walk(path.join(root, '.artifacts/k6/campaigns')),
      ...walk(path.join(root, '.artifacts/k6/runs')),
      ...walk(path.join(root, 'specs')),
      path.join(root, '.specify/memory/constitution.md'),
      ...walk(path.join(root, '.github')),
    ].map((f) => [path.relative(root, f).replaceAll('\\', '/'), hash(f)]),
  );
const tables = [
  'public.profiles',
  'public.barbershops',
  'public.barbershop_memberships',
  'public.barbershop_booking_settings',
  'public.services',
  'public.barber_profiles',
  'public.barber_services',
  'public.barbershop_hours',
  'public.barber_schedules',
  'public.reservations',
  'public.reservation_items',
  'public.reservation_events',
  'public.staff_invitations',
  'private.booking_care',
  'private.care_events',
  'private.care_settings',
  'private.barbershop_ownership',
  'private.admin_invitation_mail',
];
const digest = () =>
  Object.fromEntries(
    tables.map((t) => [
      t,
      JSON.parse(
        env.sql(
          `select coalesce(json_agg(md5(to_jsonb(r)::text) order by md5(to_jsonb(r)::text)),'[]') from ${t} r;`,
        ),
      ),
    ]),
  );
let m = fs.existsSync(privateFile)
  ? read(privateFile)
  : {
      runId: randomUUID(),
      labMarker: fixture.runId,
      accounts: [],
      shops: [],
      bookings: [],
      baseline: digest(),
      files: protectedFiles(),
    };
assert.equal(m.labMarker, fixture.runId);
let report = fs.existsSync(reportFile)
  ? read(reportFile)
  : {
      runId: m.runId,
      startedAt: new Date().toISOString(),
      environment: 'barbexa-k6-lab/127.0.0.1:54721',
      checks: [],
      complete: false,
    };
assert.equal(report.runId, m.runId);
const save = () => {
  write(privateFile, m);
  write(reportFile, report);
};
save();
const ok = (name, value, evidence = {}) => {
  assert.ok(value, name);
  report.checks.push({ name, passed: true, ...evidence });
  save();
  console.log('OK ' + name);
};
const response = (r, status, name) => {
  assert.equal(
    r.status,
    status,
    `${name}: HTTP ${r.status}, code ${r.body?.error?.code ?? r.body?.code ?? 'none'}`,
  );
  return r.body;
};
const command = (token, body) =>
  env.request('/functions/v1/reservation-command', { token, body });
const op = async (body) =>
  response(
    await env.request('/functions/v1/barbershop-operation', {
      token: m.accounts[0].session.access_token,
      body,
    }),
    200,
    body.action,
  );
const care = (token, commandName, reservationId, extra = {}) =>
  command(token, {
    action: 'care',
    command: commandName,
    reservationId,
    ...(commandName === 'read' ? {} : { requestId: randomUUID() }),
    ...extra,
  });
try {
  for (let i = 0; i < 6; i++) {
    let a = m.accounts[i];
    if (!a) {
      a = {
        email: `closure-${m.runId}-${i}@example.invalid`,
        password: syntheticPassword(),
      };
      m.accounts.push(a);
      save();
    }
    if (!a.id) {
      a.id = response(
        await env.request('/auth/v1/admin/users', {
          admin: true,
          body: { email: a.email, password: a.password, email_confirm: true },
        }),
        200,
        'synthetic-auth',
      ).id;
      save();
    }
    if (!a.session || a.session.expires_at < Date.now() / 1000 + 600) {
      a.session = response(
        await env.request('/auth/v1/token?grant_type=password', {
          body: { email: a.email, password: a.password },
        }),
        200,
        'real-auth',
      );
      assert.equal(a.session.user.id, a.id);
      save();
    }
    if (!a.profile) {
      response(
        await env.request('/functions/v1/ensure-profile', {
          token: a.session.access_token,
          body: { displayName: `Sprint2 synthetic ${i}`, phone: null },
        }),
        200,
        'profile',
      );
      a.profile = true;
      save();
    }
  }
  const [admin, foreignAdmin, pro, unassigned, client, other] = m.accounts;
  for (let i = 0; i < 2; i++)
    if (!m.shops[i]) {
      m.shops[i] = response(
        await env.request('/functions/v1/create-barbershop', {
          token: m.accounts[i].session.access_token,
          body: { name: `Sprint2 synthetic ${m.runId} ${i}` },
        }),
        201,
        'shop',
      ).barbershop.id;
      save();
    }
  const shop = m.shops[0];
  const policies = {
    minimumNoticeMin: 0,
    bookingHorizonDays: 30,
    maxFuturePerClient: 30,
    slotStepMin: 15,
    bufferMin: 0,
    cancellationAdvanceMin: 120,
  };
  if (!m.offer) {
    await op({
      action: 'configure-shop',
      barbershopId: shop,
      publicContact: 'Synthetic local',
      address: 'Synthetic local',
      policies,
    });
    if (!m.service) {
      m.service = (
        await op({
          action: 'upsert-service',
          barbershopId: shop,
          name: 'Sprint2 synthetic service',
          category: 'Corte de cabello',
          description: 'No real service',
          price: { amountMinor: 1500, currency: 'PEN' },
          durationMin: 15,
          active: true,
        })
      ).id;
      save();
    }
    // Setup only new owned synthetic memberships; commands under test use real JWTs.
    env.sql(
      `insert into public.barbershop_memberships(id,user_id,barbershop_id,role,status) values(${q(randomUUID())},${q(pro.id)},${q(shop)},'barber','active'),(${q(randomUUID())},${q(unassigned.id)},${q(shop)},'barber','active') on conflict(user_id,barbershop_id) do nothing;`,
    );
    m.barber = (
      await op({
        action: 'set-professional',
        barbershopId: shop,
        userId: pro.id,
        professionalName: 'Sprint2 assigned synthetic',
        active: true,
      })
    ).id;
    save();
    const hours = Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      opensMin: 540,
      closesMin: 1080,
    }));
    for (const data of [
      { action: 'set-shop-hours', hours },
      { action: 'set-barber-hours', barberId: m.barber, hours },
      {
        action: 'set-capabilities',
        barberId: m.barber,
        serviceIds: [m.service],
      },
      { action: 'set-publication', state: 'published' },
    ])
      await op({ barbershopId: shop, ...data });
    response(
      await command(admin.session.access_token, {
        action: 'care',
        command: 'configure',
        barbershopId: shop,
        requestId: randomUUID(),
        noShowToleranceMin: 10,
        yapeInstructions: 'Synthetic only; do not transfer funds',
      }),
      200,
      'care-settings',
    );
    m.offer = true;
    save();
  }
  while (m.bookings.length < 3) {
    const i = m.bookings.length;
    const startsAt = env.sql(
      `select to_char(((now() at time zone 'America/Lima')::date+3+make_interval(mins=>600+${i}*30)) at time zone 'America/Lima' at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');`,
    );
    const b = response(
      await command(client.session.access_token, {
        action: 'confirm',
        requestId: randomUUID(),
        barbershopId: shop,
        serviceIds: [m.service],
        barberId: m.barber,
        startsAt,
        paymentMethod: i === 1 ? 'yape' : 'cash',
      }),
      201,
      'confirm',
    );
    m.bookings.push(b.id);
    save();
  }
  if (!m.eq01) {
    const before = digest();
    for (const [role, token, commands] of [
      ['no-session', env.publicKey, ['read', 'receive']],
      ['other-client', other.session.access_token, ['read']],
      [
        'unassigned-barber',
        unassigned.session.access_token,
        ['read', 'receive'],
      ],
      ['foreign-admin', foreignAdmin.session.access_token, ['receive']],
    ])
      for (const c of commands) {
        const name = `EQ01-${role}-${c}`;
        if (report.checks.some((x) => x.name === name && x.passed)) continue;
        const r = await care(token, c, m.bookings[0], {
          ...(c === 'receive' ? { attested: true } : {}),
        });
        const expectedStatus = role === 'no-session' ? 401 : 404;
        ok(
          name,
          r.status === expectedStatus &&
            (role === 'no-session' || r.body?.error?.code === 'NOT_AVAILABLE'),
          {
            status: r.status,
            expectedStatus,
            code: r.body?.error?.code ?? null,
          },
        );
      }
    ok(
      'EQ01-denials-no-mutation',
      JSON.stringify(before) === JSON.stringify(digest()),
    );
    response(
      await care(admin.session.access_token, 'receive', m.bookings[0], {
        attested: true,
      }),
      200,
      'administrator-cash',
    );
    ok(
      'EQ01-administrator-cash-positive',
      response(
        await care(client.session.access_token, 'read', m.bookings[0]),
        200,
        'owner-read',
      ).payment.status === 'paid',
    );
    m.eq01 = true;
    save();
  }
  if (!report.checks.some((x) => x.name === 'EQ01-other-client-receive')) {
    const before = digest();
    const r = await care(other.session.access_token, 'receive', m.bookings[2], {
      attested: true,
    });
    ok(
      'EQ01-other-client-receive',
      r.status === 404 && r.body?.error?.code === 'NOT_AVAILABLE',
      { status: r.status, code: r.body?.error?.code },
    );
    ok(
      'EQ01-other-client-receive-no-mutation',
      JSON.stringify(before) === JSON.stringify(digest()),
    );
  }
  if (!m.eq03) {
    if (!m.raceBooking) {
      // The old observer only counted advisory locks. Current authority code
      // serializes writers first on the shop row; retain that attempt, use a new payment.
      const startsAt = env.sql(
        `select to_char(((now() at time zone 'America/Lima')::date+3+make_interval(mins=>720)) at time zone 'America/Lima' at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');`,
      );
      m.raceBooking = response(
        await command(client.session.access_token, {
          action: 'confirm',
          requestId: randomUUID(),
          barbershopId: shop,
          serviceIds: [m.service],
          barberId: m.barber,
          startsAt,
          paymentMethod: 'yape',
        }),
        201,
        'race-confirm',
      ).id;
      save();
    }
    const db = JSON.parse(
      spawnSync('docker', ['inspect', 'supabase_db_barbexa-k6-lab'], {
        encoding: 'utf8',
      }).stdout,
    )[0];
    const raced = await careRace(
      { sql: env.sql, db, quote: q },
      pro.id,
      (i) =>
        care([pro, admin][i].session.access_token, 'receive', m.raceBooking, {
          attested: true,
        }),
      { includeRowLocks: true },
    );
    const view = response(
      await care(client.session.access_token, 'read', m.raceBooking),
      200,
      'race-read',
    );
    ok(
      'EQ03-distinct-authorized-actors-overlap',
      pro.id !== admin.id && raced.observedSqlWaiters >= 2,
      {
        observedSqlWaiters: raced.observedSqlWaiters,
        roles: ['assigned-barber', 'administrator'],
      },
    );
    ok(
      'EQ03-one-winner-one-event',
      raced.results
        .map((r) => r.status)
        .sort()
        .join(',') === '200,409' &&
        view.payment.status === 'paid' &&
        view.events.filter((e) => e.kind === 'receive').length === 1,
      { statuses: raced.results.map((r) => r.status), receipts: 1 },
    );
    m.eq03 = true;
    save();
  }
  if (!m.eq10) {
    await op({
      action: 'configure-shop',
      barbershopId: shop,
      publicContact: 'Synthetic local',
      address: 'Synthetic local',
      policies,
    });
    assert.equal(
      Number(
        env.sql(
          `select cancellation_advance_min from public.barbershop_booking_settings where barbershop_id=${q(shop)};`,
        ),
      ),
      120,
    );
    const snapshot = () =>
      env.sql(
        `select jsonb_build_object('reservation',to_jsonb(r),'items',(select jsonb_agg(to_jsonb(i) order by service_id) from public.reservation_items i where i.reservation_id=r.id)) from public.reservations r where id=${q(m.bookings[2])};`,
      );
    const before = snapshot();
    assert.equal(
      JSON.parse(before).reservation.policy_snapshot.cancellationAdvanceMin,
      120,
    );
    await op({
      action: 'configure-shop',
      barbershopId: shop,
      publicContact: 'Synthetic local',
      address: 'Synthetic local',
      policies: { ...policies, cancellationAdvanceMin: 60 },
    });
    const current = Number(
      env.sql(
        `select cancellation_advance_min from public.barbershop_booking_settings where barbershop_id=${q(shop)};`,
      ),
    );
    const authorized = response(
      await env.request(
        '/rest/v1/reservations?select=id,client_user_id,policy_snapshot,reservation_items(name_snapshot,description_snapshot,price_snapshot,duration_min)&client_user_id=eq.' +
          client.id +
          '&id=eq.' +
          m.bookings[2],
        { token: client.session.access_token, method: 'GET' },
      ),
      200,
      'historical-detail',
    );
    assert.equal(authorized.length, 1);
    assert.equal(authorized[0].policy_snapshot.cancellationAdvanceMin, 120);
    ok(
      'EQ10-real-policy-change-historical-unchanged',
      current === 60 && before === snapshot(),
      {
        previousPolicyMin: 120,
        currentPolicyMin: current,
        historicalPolicyMin: 120,
        fullReservationAndItemsUnchanged: true,
        authorizedReadStatus: 200,
      },
    );
    m.eq10 = true;
    save();
  }
  if (!m.eq07) {
    const { createTeamPersistence } =
      await import('../supabase/functions/_shared/barbershop-operation/infrastructure/team-postgres-adapter.ts');
    const { createAdminInvitationService } =
      await import('../supabase/functions/_shared/barbershop-operation/application/admin-invitations.ts');
    // Real production persistence adapter; privileged transport stays sealed inside ownedLab.
    const repository = createTeamPersistence({
      baseUrl: 'http://127.0.0.1:54721',
      serviceKey: 'local-guarded-transport',
      fetcher: async (url, init) => {
        assert.match(
          String(url),
          /^http:\/\/127\.0\.0\.1:54721\/rest\/v1\/rpc\/admin_invitation_[a-z_]+$/,
        );
        const r = await env.request(new URL(url).pathname, {
          admin: true,
          body: JSON.parse(init.body),
        });
        return new Response(JSON.stringify(r.body), { status: r.status });
      },
    });
    const actor = { userId: admin.id };
    let sends = 0;
    const keys = [];
    const app = createAdminInvitationService({
      repository,
      attemptId: randomUUID,
      mail: {
        send: async (_envelope, key) => {
          sends++;
          keys.push(key);
          return sends === 1 ? 'failed' : 'sent';
        },
      },
    });
    const req = {
      action: 'invite-administrator',
      requestId: m.mailRequest ?? randomUUID(),
      barbershopId: shop,
      email: other.email,
    };
    m.mailRequest = req.requestId;
    save();
    const failed = await app(actor, req);
    const persisted = await repository.getAdmin(actor, failed.id);
    ok(
      'EQ07-definite-mail-failure-after-real-commit',
      failed.deliveryStatus === 'failed' &&
        persisted.deliveryStatus === 'failed',
      {
        persisted: true,
        delivery: persisted.deliveryStatus,
        provider: 'controlled-definite-failure-no-external-mail',
      },
    );
    const retried = await app(actor, {
      action: 'retry-admin-invitation-email',
      invitationId: failed.id,
    });
    const replayed = await app(actor, req);
    const listed = await repository.listAdmin(actor, shop);
    ok(
      'EQ07-retry-without-duplicate',
      retried.id === failed.id &&
        replayed.id === failed.id &&
        retried.deliveryStatus === 'sent' &&
        sends === 2 &&
        new Set(keys).size === 1 &&
        listed.filter((i) => i.id === failed.id).length === 1,
      {
        providerCalls: sends,
        stableIdempotencyKey: true,
        invitations: 1,
        finalDelivery: retried.deliveryStatus,
        externalDeliveryTested: false,
      },
    );
    m.eq07 = true;
    save();
  }
  report.complete = true;
  delete report.failure;
} catch (e) {
  report.failure = { name: e.name, message: e.message };
  console.error(e.message);
  process.exitCode = 1;
} finally {
  if (m.eq07) {
    report.mailPersistence = JSON.parse(
      env.sql(
        `select jsonb_build_object('invitationId',min(invitation_id::text),'rows',count(*),'deliveryState',min(delivery_state)) from private.admin_invitation_mail where requesting_actor_id=${q(m.accounts[0].id)} and request_id=${q(m.mailRequest)};`,
      ),
    );
  }
  const after = digest();
  report.existingRowsPreserved = Object.entries(m.baseline).every(([t, rows]) =>
    rows.every(
      (h) =>
        after[t].filter((x) => x === h).length >=
        rows.filter((x) => x === h).length,
    ),
  );
  report.protectedFilesUnchanged = Object.entries(m.files).every(
    ([f, h]) =>
      fs.existsSync(path.join(root, f)) && hash(path.join(root, f)) === h,
  );
  report.integrity = JSON.parse(
    env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
  );
  report.health = (
    await env.request('/auth/v1/health', { method: 'GET' })
  ).status;
  report.finishedAt = new Date().toISOString();
  if (
    !report.existingRowsPreserved ||
    !report.protectedFilesUnchanged ||
    report.health !== 200 ||
    Object.entries(report.integrity).some(
      ([k, v]) => k !== 'reservations' && v !== 0,
    )
  ) {
    report.complete = false;
    process.exitCode = 1;
  }
  save();
  console.log(
    JSON.stringify({
      complete: report.complete,
      checks: report.checks.length,
      existingRowsPreserved: report.existingRowsPreserved,
      protectedFilesUnchanged: report.protectedFilesUnchanged,
      health: report.health,
      integrity: report.integrity,
    }),
  );
}
