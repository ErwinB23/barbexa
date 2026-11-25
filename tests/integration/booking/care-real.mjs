import { careRace } from './care-race.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { localBookingEnvironment } from './client-environment.mjs';
process.env.BARBERIA_002_PROJECT_ID = 'app-barberia-002-local';
process.env.BARBERIA_002_URL = 'http://127.0.0.1:54421';
const env = localBookingEnvironment(),
  dir = path.resolve('.artifacts/005-care'),
  file = path.join(dir, 'manifest.json'),
  creds = path.join(dir, 'credenciales-locales.json'),
  reportPath = path.resolve(
    'specs/005-atencion-pagos-manuales/real-tests.json',
  );
const mode = process.argv[2];
if (!['prepare', 'run'].includes(mode)) throw Error('EXPLICIT_MODE_REQUIRED');
assert.equal(
  spawnSync('git', ['check-ignore', '--quiet', '--', creds]).status,
  0,
  'CREDENTIALS_MUST_BE_IGNORED',
);
const text = (v) => "'" + String(v).replaceAll("'", "''") + "'",
  j = (v) => text(JSON.stringify(v)) + '::jsonb',
  q = env.quote;
const digest = () =>
  JSON.parse(
    env.sql(
      "select coalesce(jsonb_object_agg(t,hashes),'{}') from (" +
        [
          'profiles',
          'barbershops',
          'barbershop_memberships',
          'barbershop_booking_settings',
          'services',
          'barber_profiles',
          'barber_services',
          'barbershop_hours',
          'barber_schedules',
          'reservations',
          'reservation_items',
          'reservation_events',
          'staff_invitations',
        ]
          .map(
            (t) =>
              `select '${t}' t,coalesce(jsonb_agg(md5(to_jsonb(r)::text) order by md5(to_jsonb(r)::text)),'[]') hashes from public.${t} r`,
          )
          .join(' union all ') +
        ')x;',
    ),
  );
const conserved = (before, after) =>
  Object.entries(before).every(([t, rows]) =>
    rows.every(
      (v) =>
        after[t].filter((x) => x === v).length >=
        rows.filter((x) => x === v).length,
    ),
  );
async function health() {
  assert.equal((await env.request('/auth/v1/health')).status, 200);
  assert.equal(env.sql('select 1;'), '1');
  assert.equal(
    (
      await env.request('/functions/v1/reservation-command', {
        method: 'OPTIONS',
        origin: 'http://localhost:8081',
      })
    ).status,
    204,
  );
}
await health();
const command = (token, body) =>
  env.post(
    token,
    '/functions/v1/reservation-command',
    body,
    'http://localhost:8081',
  );
const care = (token, commandName, reservationId, extra = {}) =>
  command(token, {
    action: 'care',
    command: commandName,
    reservationId,
    ...(!['read'].includes(commandName) ? { requestId: randomUUID() } : {}),
    ...extra,
  });
if (mode === 'prepare') {
  assert.ok(!fs.existsSync(file), 'PREPARE_ALREADY_STARTED_STOP');
  fs.mkdirSync(dir, { recursive: true });
  const m = {
    project: env.projectId,
    run: randomUUID(),
    baseline: digest(),
    accounts: [],
    shops: [randomUUID(), randomUUID()],
    professionals: [randomUUID(), randomUUID()],
    services: [randomUUID(), randomUUID()],
    memberships: Array.from({ length: 4 }, () => randomUUID()),
    bookings: [],
    phase: 'preparing',
  };
  assert.equal(m.baseline.reservations.length, 13);
  const accounts = [];
  const save = () => fs.writeFileSync(file, JSON.stringify(m, null, 2));
  save();
  try {
    for (let i = 0; i < 4; i++) {
      const a = {
        email: `care005-${m.run}-${i}@example.test`,
        password: randomBytes(24).toString('base64url'),
      };
      const r = await env.request('/auth/v1/admin/users', {
        admin: true,
        method: 'POST',
        body: JSON.stringify({
          ...a,
          email_confirm: true,
          user_metadata: { display_name: `005 ficticio ${i}` },
        }),
      });
      assert.ok([200, 201].includes(r.status), 'AUTH_CREATE_FAILED');
      a.id = r.body.id;
      accounts.push(a);
      m.accounts.push(a.id);
      save();
      fs.writeFileSync(creds, JSON.stringify(accounts, null, 2));
    }
    const [admin, pro, adminB] = accounts.map((a) => a.id),
      [A, B] = m.shops;
    env.sql(
      'begin;' +
        accounts
          .map(
            (a, i) =>
              `insert into public.profiles(id,display_name) values(${q(a.id)},'005 ficticio ${i}');`,
          )
          .join('') +
        m.shops
          .map(
            (s, i) =>
              `insert into public.barbershops values(${q(s)},'005 aislada ${i}');`,
          )
          .join('') +
        [
          [admin, A, 'administrator'],
          [pro, A, 'barber'],
          [adminB, B, 'administrator'],
          [pro, B, 'barber'],
        ]
          .map(
            ([user, shop, role], i) =>
              `insert into public.barbershop_memberships values(${q(m.memberships[i])},${q(user)},${q(shop)},'${role}','active');`,
          )
          .join('') +
        m.shops
          .map(
            (shop, i) =>
              `insert into public.barbershop_booking_settings(barbershop_id,publication_state,public_contact,address,minimum_notice_min,booking_horizon_days,max_future_per_client,slot_step_min,buffer_min,cancellation_advance_min)values(${q(shop)},'published','Ficticio','Local ficticio',0,30,30,15,0,120);insert into public.services(id,barbershop_id,name,price_amount,duration_min,active)values(${q(m.services[i])},${q(shop)},'005 servicio',25,15,true);insert into public.barber_profiles values(${q(m.professionals[i])},${q(shop)},${q(pro)},'005 profesional',true);insert into public.barber_services values(${q(shop)},${q(m.professionals[i])},${q(m.services[i])},true);` +
              Array.from(
                { length: 7 },
                (_, d) =>
                  `insert into public.barbershop_hours(barbershop_id,weekday,opens_min,closes_min)values(${q(shop)},${d},0,1440);insert into public.barber_schedules(barbershop_id,barber_id,weekday,opens_min,closes_min)values(${q(shop)},${q(m.professionals[i])},${d},0,1440);`,
              ).join(''),
          )
          .join('') +
        'commit;',
    );
    const tokens = await Promise.all(accounts.map((a) => env.login(a)));
    for (let i = 0; i < 2; i++) {
      const r = await command(tokens[i === 0 ? 0 : 2], {
        action: 'care',
        command: 'configure',
        barbershopId: m.shops[i],
        requestId: randomUUID(),
        noShowToleranceMin: 10,
        yapeInstructions: 'Ficticio005: no transferir dinero',
      });
      assert.equal(r.status, 200, 'CONFIGURE_FAILED');
    }
    for (let i = 0; i < 16; i++) {
      const shop = i % 2,
        start = env.sql(
          `select to_char(((now() at time zone 'America/Lima')::date+2+make_interval(mins=>480+${i}*30)) at time zone 'America/Lima' at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');`,
        );
      const body = {
        action: 'confirm',
        requestId: randomUUID(),
        barbershopId: m.shops[shop],
        serviceIds: [m.services[shop]],
        barberId: m.professionals[shop],
        startsAt: start,
        paymentMethod: i % 2 ? 'yape' : 'cash',
      };
      const r = await command(tokens[3], body);
      assert.equal(r.status, 201, `BOOKING_${i}_FAILED_${r.status}`);
      m.bookings.push({
        id: r.body.id,
        index: i,
        shop,
        method: body.paymentMethod,
        request: body,
        purpose:
          i < 5
            ? 'race-receive'
            : i < 10
              ? 'race-refund'
              : i === 10
                ? 'cycle-cash'
                : i === 11
                  ? 'cycle-yape'
                  : i === 12
                    ? 'no-show-limit'
                    : i === 13
                      ? 'denied-rollback'
                      : i === 14
                        ? 'manual-Web'
                        : 'manual-Android',
      });
      save();
    }
    assert.ok(conserved(m.baseline, digest()), 'ORIGINAL_DATA_CHANGED');
    m.phase = 'prepared';
    save();
    console.log(
      JSON.stringify({
        phase: m.phase,
        accounts: 4,
        shops: 2,
        reservations: m.bookings.length,
        originalDataIntact: true,
        credentialsIgnored: true,
      }),
    );
  } catch (e) {
    m.phase = 'prepare-failed';
    save();
    console.log(
      JSON.stringify({
        phase: m.phase,
        accountsCreated: m.accounts.length,
        bookingsCreated: m.bookings.length,
        originalDataIntact: conserved(m.baseline, digest()),
        failure: e instanceof Error ? e.message : 'FAILED',
      }),
    );
    process.exitCode = 1;
  }
} else {
  const m = JSON.parse(fs.readFileSync(file));
  assert.equal(m.project, env.projectId);
  assert.equal(m.phase, 'prepared', 'REQUIRES_PREPARED_FRESH_RUN');
  assert.equal(m.bookings.length, 16);
  const accounts = JSON.parse(fs.readFileSync(creds));
  const tokens = await Promise.all(accounts.map((a) => env.login(a)));
  const [admin, pro, adminB, client] = tokens;
  const report = {
    project: env.projectId,
    checks: [],
    races: [],
    originalDataIntact: false,
    manualUntouched: false,
    completed: false,
  };
  const check = (name, value) => {
    assert.ok(value, name);
    report.checks.push(name);
  };
  const save = () =>
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  try {
    const read = async (b) => {
      const r = await care(client, 'read', b.id);
      check('read-' + b.index, r.status === 200);
      return r.body;
    };
    for (const b of m.bookings.slice(0, 5)) {
      const req = {
        action: 'care',
        command: 'receive',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
      };
      const { results: result, observedSqlWaiters } = await careRace(
        env,
        m.accounts[1],
        (index) =>
          command(pro, index ? { ...req, requestId: randomUUID() } : req),
      );
      check(
        'race-receive-' + b.index,
        result
          .map((r) => r.status)
          .sort()
          .join(',') === '200,409',
      );
      const again = await command(pro, req);
      check('receive-idempotent-' + b.index, [200, 409].includes(again.status));
      const view = await read(b);
      check(
        'unique-receive-' + b.index,
        view.events.filter((e) => e.kind === 'receive').length === 1 &&
          view.payment.status === 'paid',
      );
      report.races.push({
        kind: 'receive',
        index: b.index,
        observedSqlWaiters,
        concurrentRequests: 2,
        statuses: result.map((r) => r.status),
      });
      save();
    }
    for (const b of m.bookings.slice(5, 10)) {
      check(
        'prepare-paid-' + b.index,
        (await care(pro, 'receive', b.id, { attested: true })).status === 200,
      );
      const staff = b.shop === 0 ? admin : adminB;
      check(
        'prepare-cancelled-' + b.index,
        (
          await command(staff, {
            action: 'cancel',
            reservationId: b.id,
            requestId: randomUUID(),
            reason: '005 prueba sintética',
          })
        ).status === 200,
      );
      const req = {
        action: 'care',
        command: 'refund',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
        reason: '005 devolución externa ficticia; no dinero',
      };
      const { results: r, observedSqlWaiters } = await careRace(
        env,
        m.accounts[1],
        (index) =>
          command(staff, index ? { ...req, requestId: randomUUID() } : req),
      );
      check(
        'race-refund-' + b.index,
        r
          .map((v) => v.status)
          .sort()
          .join(',') === '200,409',
      );
      const view = await read(b);
      check(
        'unique-refund-' + b.index,
        view.events.filter((e) => e.kind === 'refund').length === 1 &&
          view.payment.status === 'refunded',
      );
      report.races.push({
        kind: 'refund',
        index: b.index,
        observedSqlWaiters,
        concurrentRequests: 2,
        statuses: r.map((v) => v.status),
      });
      save();
    }
    for (const b of m.bookings.slice(10, 12)) {
      env.sql(
        `update public.reservations set starts_at=statement_timestamp()-make_interval(mins=>180-(${b.index}-10)*30),ends_at=statement_timestamp()-make_interval(mins=>180-(${b.index}-10)*30)+make_interval(mins=>duration_min),occupied_until=statement_timestamp()-make_interval(mins=>180-(${b.index}-10)*30)+make_interval(mins=>duration_min+buffer_min) where id=${q(b.id)};`,
      );
      check(
        'cannot-complete-before-start-' + b.index,
        (await care(pro, 'complete', b.id)).status === 409,
      );
      check(
        'start-' + b.index,
        (await care(pro, 'start', b.id)).status === 200,
      );
      check(
        'complete-' + b.index,
        (await care(pro, 'complete', b.id)).status === 200,
      );
      const pending = await read(b);
      check(
        'completed-with-pending-' + b.index,
        pending.attendance === 'completed' &&
          pending.payment.status === 'pending',
      );
      check(
        'receive-' + b.method,
        (await care(pro, 'receive', b.id, { attested: true })).status === 200,
      );
    }
    const ns = m.bookings[12];
    env.sql(
      `update public.reservations set starts_at=statement_timestamp()-interval '9 minutes',ends_at=statement_timestamp()-interval '9 minutes'+make_interval(mins=>duration_min),occupied_until=statement_timestamp()-interval '9 minutes'+make_interval(mins=>duration_min+buffer_min) where id=${q(ns.id)};`,
    );
    check(
      'no-show-before-10min',
      (await care(pro, 'no-show', ns.id)).status === 409,
    );
    env.sql(
      `update public.reservations set starts_at=statement_timestamp()-interval '10 minutes',ends_at=statement_timestamp()-interval '10 minutes'+make_interval(mins=>duration_min),occupied_until=statement_timestamp()-interval '10 minutes'+make_interval(mins=>duration_min+buffer_min) where id=${q(ns.id)};`,
    );
    check(
      'no-show-at-10min',
      (await care(pro, 'no-show', ns.id)).status === 200,
    );
    const other = m.bookings[13];
    check(
      'client-cannot-receive',
      (await care(client, 'receive', other.id, { attested: true })).status ===
        403,
    );
    check(
      'admin-A-cannot-read-B',
      [403, 404].includes((await care(admin, 'read', other.id)).status),
    );
    check(
      'admin-A-cannot-configure-B',
      (
        await command(admin, {
          action: 'care',
          command: 'configure',
          barbershopId: m.shops[1],
          requestId: randomUUID(),
          noShowToleranceMin: 10,
          yapeInstructions: 'forbidden',
        })
      ).status === 403,
    );
    check(
      'unassigned-admin-cannot-start',
      (await care(adminB, 'start', other.id)).status === 403,
    );
    check(
      'start-before-time',
      (await care(pro, 'start', other.id)).status === 409,
    );
    check(
      'missing-attestation',
      (await care(pro, 'receive', other.id, { attested: false })).status ===
        400,
    );
    check(
      'refund-without-paid-cancelled',
      (
        await care(adminB, 'refund', other.id, {
          attested: true,
          reason: 'invalid',
        })
      ).status === 409,
    );
    const beforeRollback = env.sql(
      `select row_to_json(c) from private.booking_care c where reservation_id=${q(other.id)};`,
    );
    env.sql(
      `begin;set local role service_role;select public.care_booking(${q(m.accounts[2])},${j({ command: 'receive', reservationId: other.id, requestId: randomUUID(), attested: true })});rollback;`,
    );
    check(
      'rollback-no-payment-or-event',
      env.sql(
        `select row_to_json(c) from private.booking_care c where reservation_id=${q(other.id)};`,
      ) === beforeRollback &&
        env.sql(
          `select count(*) from private.care_events where reservation_id=${q(other.id)} and kind='receive';`,
        ) === '0',
    );
    const replay = await command(client, other.request);
    check(
      'booking-idempotent',
      replay.status === 200 && replay.body.id === other.id,
    );
    const wrong = await command(client, {
      ...other.request,
      paymentMethod: 'cash',
    });
    check('changed-method-conflicts', wrong.status === 409);
    check(
      'no-bypass-old-rpc',
      (
        await env.post(client, '/rest/v1/rpc/confirm_booking', {
          p_actor_id: accounts[3].id,
          p_data: {},
        })
      ).status >= 400,
    );
    const untouched = JSON.parse(
      env.sql(
        `select json_agg(json_build_object('state',r.state,'attendance',c.attendance,'payment',c.payment_status,'events',(select count(*) from private.care_events e where e.reservation_id=r.id))) from public.reservations r join private.booking_care c on c.reservation_id=r.id where r.id in(${m.bookings
          .slice(14)
          .map((b) => q(b.id))
          .join(',')});`,
      ),
    );
    report.manualUntouched =
      untouched.length === 2 &&
      untouched.every(
        (r) =>
          r.state === 'confirmed' &&
          r.attendance === 'confirmed' &&
          r.payment === 'pending' &&
          r.events === 1,
      );
    check('manual-two-untouched', report.manualUntouched);
    report.originalDataIntact = conserved(m.baseline, digest());
    check('original-data-intact', report.originalDataIntact);
    report.completed = true;
    m.phase = 'automated-complete';
    fs.writeFileSync(file, JSON.stringify(m, null, 2));
  } catch (e) {
    report.failure = e instanceof Error ? e.message : 'FAILED';
    report.originalDataIntact = conserved(m.baseline, digest());
    process.exitCode = 1;
  } finally {
    save();
    console.log(JSON.stringify(report));
  }
}
