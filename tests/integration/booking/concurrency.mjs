import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { randomInt, randomUUID } from 'node:crypto';
import { withAtomicEnvironment, evidence } from './atomic-environment.mjs';
import { waitForBookingBarrier } from './fixtures.mjs';
import readline from 'node:readline/promises';

async function race(env, statements) {
  const key = randomInt(100000, 2000000000),
    tag = 'A004_' + env.run + '_' + key,
    children = [];
  const launch = (suffix) => {
    const child = spawn(
      'docker',
      [
        'exec',
        '-i',
        '-e',
        'PGAPPNAME=' + tag + suffix,
        env.dbId,
        'psql',
        '-X',
        '-U',
        'postgres',
        '-d',
        'postgres',
        '-Atq',
        '-v',
        'ON_ERROR_STOP=1',
        '-v',
        'VERBOSITY=verbose',
      ],
      { stdio: ['pipe', 'pipe', 'pipe'] },
    );
    children.push(child);
    let out = '',
      err = '';
    child.stdout.on('data', (v) => (out += v));
    child.stderr.on('data', (v) => (err += v));
    const done = new Promise((resolve) =>
      child.on('close', (code) => resolve({ code, out, err })),
    );
    return { child, done, output: () => out };
  };
  const locker = launch('_l');
  locker.child.stdin.write(`select pg_advisory_lock(${key});select 'READY';\n`);
  try {
    for (let i = 0; !locker.output().includes('READY'); i++) {
      if (i > 150) throw Error('LOCKER_NOT_READY');
      await new Promise((r) => setTimeout(r, 30));
    }
    const workers = statements.map((sql) => {
      const w = launch('_w');
      w.child.stdin.end(
        `begin;set local role service_role;select pg_advisory_xact_lock_shared(${key});${sql};commit;`,
      );
      return w;
    });
    await waitForBookingBarrier(
      async () =>
        Number(
          env.sql(
            `select count(*) from pg_stat_activity where application_name='${tag}_w' and wait_event='advisory'`,
          ),
        ),
      async () => locker.child.stdin.end(`select pg_advisory_unlock(${key});`),
    );
    const timer = setTimeout(() => {
      for (const c of children) c.kill();
    }, 20000);
    const results = await Promise.all(workers.map((w) => w.done));
    clearTimeout(timer);
    return results;
  } finally {
    locker.child.stdin.end();
    env.sql(
      `select pg_terminate_backend(pid) from pg_stat_activity where application_name in('${tag}_l','${tag}_w') and pid<>pg_backend_pid()`,
    );
    for (const c of children) if (c.exitCode === null) c.kill();
  }
}

async function main() {
  const results = [],
    races = [];
  const terminal =
    process.env.BOOKING_ATOMIC_INTERACTIVE === '1'
      ? readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        })
      : null;
  try {
    await withAtomicEnvironment(async (env) => {
      const { users, shops, sql, quote: q, literal: j } = env,
        [professional, adminB, client, other, inactive] = users,
        [A, B] = shops;
      const records = [];
      const policy = {
        minimumNoticeMin: 0,
        bookingHorizonDays: 30,
        maxFuturePerClient: 60,
        slotStepMin: 15,
        bufferMin: 0,
        cancellationAdvanceMin: 120,
      };
      const day = new Date(Date.now() + 3 * 86400000)
        .toISOString()
        .slice(0, 10);
      const at = (minute, days = 0) =>
        new Date(
          Date.parse(day + 'T13:00:00.000Z') + minute * 60000 + days * 86400000,
        ).toISOString(); // 08:00 Lima
      const okCommand = async (user, data) => {
        const r = await env.command(user, data);
        assert.equal(r.status, 200, 'offering command ' + data.action);
        return r.body;
      };
      for (const [i, shop] of shops.entries()) {
        const admin = users[i];
        await okCommand(admin, {
          action: 'configure-shop',
          barbershopId: shop.id,
          publicContact: 'Synthetic local',
          address: 'Local fixture',
          policies: policy,
        });
        const services = [];
        for (const [n, durationMin] of [20, 10].entries())
          services.push(
            await okCommand(admin, {
              action: 'upsert-service',
              barbershopId: shop.id,
              name: 'Atomic service ' + n,
              description: 'Snapshot original',
              price: { amountMinor: n ? 1000 : 2500, currency: 'PEN' },
              durationMin,
              active: true,
            }),
          );
        const barber = await okCommand(admin, {
          action: 'set-professional',
          barbershopId: shop.id,
          userId: professional.id,
          professionalName: 'Shared physical professional',
          active: true,
        });
        const hours = Array.from({ length: 7 }, (_, weekday) => ({
          weekday,
          opensMin: 480,
          closesMin: 1200,
        }));
        for (const data of [
          { action: 'set-shop-hours', hours },
          { action: 'set-barber-hours', barberId: barber.id, hours },
          {
            action: 'set-capabilities',
            barberId: barber.id,
            serviceIds: services.map((s) => s.id),
          },
          { action: 'set-publication', state: 'published' },
        ])
          await okCommand(admin, { barbershopId: shop.id, ...data });
        records.push({ shop, barber, services, admin });
      }
      const input = (i, minute, overrides = {}) => ({
        requestId: randomUUID(),
        barbershopId: shops[i].id,
        serviceIds: records[i].services.map((s) => s.id),
        barberId: records[i].barber.id,
        startsAt: at(minute),
        ...overrides,
      });
      const statement = (user, data) =>
        `select public.confirm_booking(${q(user.id)},${j(data)})`;
      const checked = async (label, fn) => {
        for (;;) {
          try {
            await fn();
            results.push({ label, passed: true });
            console.log('ok - ' + label);
            break;
          } catch (e) {
            console.log(
              'not ok - ' +
                label +
                ' [' +
                (e.code === 'ERR_ASSERTION'
                  ? 'ASSERTION'
                  : String(e.message)
                      .replace(/[^A-Z_]/g, '')
                      .slice(0, 60)) +
                ']',
            );
            if (!terminal) throw Error('ATOMIC_SCENARIO_FAILED');
            const response = await terminal.question(
              'Fixtures remain only in RAM. retry or abort: ',
            );
            if (response.trim() !== 'retry')
              throw Error('ATOMIC_SCENARIO_ABORTED');
          }
        }
      };
      let first, firstInput;
      await checked(
        'server computes multiple service snapshots and any assigns a concrete professional',
        async () => {
          firstInput = input(0, 0, { barberId: null });
          const r = await env.confirm(client, firstInput);
          assert.equal(r.status, 200);
          first = r.body;
          assert.equal(first.replayed, false);
          assert.equal(first.detail.durationMin, 30);
          assert.equal(first.detail.total.amountMinor, 3500);
          assert.equal(first.detail.items.length, 2);
          assert.equal(first.detail.barberId, records[0].barber.id);
          assert.equal(first.detail.policySnapshot.cancellationAdvanceMin, 120);
          assert.equal(first.detail.endsAt, at(30));
          assert.equal(Object.hasOwn(first.detail, 'barber_user_id'), false);
        },
      );
      await checked(
        'same request reordered services replays original snapshots while changed fingerprint rejects',
        async () => {
          const repeat = await env.confirm(client, {
            ...firstInput,
            serviceIds: [...firstInput.serviceIds].reverse(),
          });
          assert.equal(repeat.status, 200);
          assert.equal(repeat.body.replayed, true);
          assert.deepEqual(repeat.body.detail, first.detail);
          const changed = await env.confirm(client, {
            ...firstInput,
            startsAt: at(45),
          });
          assert.equal(changed.status, 409);
          assert.equal(changed.body.message, 'CONFLICT');
        },
      );
      await checked(
        'forged price actor and cross tenant service are rejected without writes',
        async () => {
          for (const field of [
            'actorId',
            'clientId',
            'role',
            'price',
            'total',
            'duration',
            'policySnapshot',
          ]) {
            const r = await env.confirm(client, {
              ...input(0, 45),
              [field]: field === 'price' ? 1 : professional.id,
            });
            assert.equal(r.status, 400);
            assert.equal(r.body.message, 'INVALID_INPUT');
          }
          for (const serviceIds of [
            [records[1].services[0].id],
            [records[0].services[0].id, records[0].services[0].id],
          ])
            assert.equal(
              (await env.confirm(client, input(0, 45, { serviceIds }))).status,
              400,
            );
        },
      );
      await checked(
        'real JWT ordinary callers cannot invoke service RPC or direct insert',
        async () => {
          const direct = await env.post(
            client.token,
            '/rest/v1/rpc/confirm_booking',
            { p_actor_id: professional.id, p_data: input(0, 45) },
          );
          assert.equal(direct.status, 403);
          const insert = await env.post(client.token, '/rest/v1/reservations', {
            barbershop_id: A.id,
          });
          assert.equal(insert.status, 403);
        },
      );
      await checked(
        'real JWT RLS owner assigned professional contextual admin and inactive member',
        async () => {
          for (const [user, count] of [
            [client, 1],
            [other, 0],
            [inactive, 0],
            [adminB, 0],
            [professional, 1],
          ]) {
            const r = await env.request(
              '/rest/v1/reservations?select=id,barbershop_id&id=eq.' +
                first.detail.id,
              { token: user.token },
            );
            assert.equal(r.status, 200);
            assert.equal(r.body.length, count);
            const items = await env.request(
              '/rest/v1/reservation_items?select=reservation_id&reservation_id=eq.' +
                first.detail.id,
              { token: user.token },
            );
            assert.equal(items.status, 200);
            assert.equal(items.body.length, count ? 2 : 0);
          }
        },
      );
      await checked(
        'slots hide global conflicts and disclose no foreign shop or client identifiers',
        async () => {
          const slots = await env.post(
            other.token,
            '/rest/v1/rpc/list_booking_slots',
            {
              p_barbershop_id: B.id,
              p_local_date: day,
              p_service_ids: records[1].services.map((s) => s.id),
              p_barber_id: records[1].barber.id,
            },
          );
          assert.equal(slots.status, 200);
          assert.ok(Array.isArray(slots.body));
          assert.ok(!slots.body.some((s) => s.startsAt === at(0)));
          assert.ok(slots.body.some((s) => s.startsAt === at(30)));
          const text = JSON.stringify(slots.body);
          for (const forbidden of [A.id, client.id, first.detail.id])
            assert.ok(!text.includes(forbidden));
          const conflicts = await Promise.all([
            env.confirm(other, input(0, 0)),
            env.confirm(other, input(1, 0)),
          ]);
          for (const r of conflicts) {
            assert.equal(r.status, 409);
            assert.equal(
              r.body.message,
              'Profesional no disponible en ese horario',
            );
          }
        },
      );
      await checked(
        'half open adjacent appointments succeed with zero buffer',
        async () => {
          const r = await env.confirm(other, input(1, 30));
          assert.equal(r.status, 200);
          assert.equal(r.body.detail.startsAt, first.detail.endsAt);
        },
      );
      await checked(
        'ten actual two connection pairs prevent same shop and cross shop physical overlaps',
        async () => {
          // Authenticate identities with real JWT immediately before workers; no forged client identity.
          for (const user of [client, other]) {
            const r = await env.request('/auth/v1/user', { token: user.token });
            assert.equal(r.status, 200);
            assert.equal(r.body.id, user.id);
          }
          for (let i = 0; i < 10; i++) {
            const minute = 90 + i * 45,
              a = input(0, minute),
              b = input(i < 5 ? 0 : 1, minute);
            const pair = await race(env, [
              statement(client, a),
              statement(other, b),
            ]);
            assert.deepEqual(pair.map((r) => r.code).sort(), [0, 3]);
            const failure = pair.find((r) => r.code === 3);
            assert.ok(failure.err.includes('23505'));
            assert.ok(
              failure.err.includes('Profesional no disponible en ese horario'),
            );
            const count = Number(
              sql(
                `select count(*) from public.reservations where request_id in(${q(a.requestId)},${q(b.requestId)})`,
              ),
            );
            assert.equal(count, 1);
            races.push({
              pair: i + 1,
              scope: i < 5 ? 'same-tenant' : 'same-person-cross-tenant',
              connections: 2,
              observedBarrierWaiters: 2,
              committed: 1,
              rejected: 1,
              sqlstate: '23505',
            });
          }
        },
      );
      await checked(
        'two identical concurrent requests commit one header items and event then replay',
        async () => {
          const d = input(0, 570),
            pair = await race(env, [
              statement(client, d),
              statement(client, d),
            ]);
          assert.deepEqual(
            pair.map((r) => r.code),
            [0, 0],
          );
          const counts = JSON.parse(
            sql(
              `select jsonb_build_object('headers',count(*),'items',(select count(*) from public.reservation_items where reservation_id in(select id from public.reservations where request_id=${q(d.requestId)})),'events',(select count(*) from public.reservation_events where reservation_id in(select id from public.reservations where request_id=${q(d.requestId)}))) from public.reservations where request_id=${q(d.requestId)}`,
            ),
          );
          assert.deepEqual(counts, { headers: 1, items: 2, events: 1 });
        },
      );
      await checked(
        'injected detail failure rolls back header all items and event',
        async () => {
          const d = input(0, 615),
            trigger = 'atomic_fault_' + env.run;
          // Fault is transaction-local and restricted to the owned request. ROLLBACK removes it.
          sql(
            `begin;create function pg_temp.fail_owned_item() returns trigger language plpgsql as $$begin if exists(select 1 from public.reservations where id=new.reservation_id and request_id=${q(d.requestId)}) then raise exception 'CONTROLLED_TEST_FAILURE';end if;return new;end;$$;create trigger ${trigger} before insert on public.reservation_items for each row execute function pg_temp.fail_owned_item();do $$begin perform public.confirm_booking(${q(client.id)},${j(d)});raise exception 'EXPECTED_FAILURE_MISSING';exception when raise_exception then if sqlerrm<>'CONTROLLED_TEST_FAILURE' then raise;end if;end;$$;do $$begin if exists(select 1 from public.reservations where request_id=${q(d.requestId)})then raise exception 'PARTIAL_HEADER';end if;end;$$;rollback;`,
          );
          assert.equal(
            Number(
              sql(
                `select count(*) from public.reservations where request_id=${q(d.requestId)}`,
              ),
            ),
            0,
          );
        },
      );
      await checked(
        'catalog edits preserve historical snapshots and idempotent replay',
        async () => {
          const s = records[0].services[0];
          await okCommand(professional, {
            action: 'upsert-service',
            barbershopId: A.id,
            id: s.id,
            name: 'Changed name',
            description: 'Changed description',
            price: { amountMinor: 4000, currency: 'PEN' },
            durationMin: 20,
            active: true,
          });
          const repeat = await env.confirm(client, firstInput);
          assert.equal(repeat.status, 200);
          assert.deepEqual(repeat.body.detail, first.detail);
          const next = await env.confirm(client, input(0, 660));
          assert.equal(next.status, 200);
          assert.equal(next.body.detail.total.amountMinor, 5000);
        },
      );
      await checked(
        'committed reservations prevent destructive schedule capability or professional edits',
        async () => {
          for (const d of [
            {
              action: 'set-barber-hours',
              barberId: records[0].barber.id,
              hours: [],
            },
            {
              action: 'set-capabilities',
              barberId: records[0].barber.id,
              serviceIds: [],
            },
            {
              action: 'set-professional',
              userId: professional.id,
              professionalName: 'Shared',
              active: false,
            },
          ])
            assert.equal(
              (await env.command(professional, { barbershopId: A.id, ...d }))
                .status,
              409,
            );
          assert.equal(
            sql(
              `select active from public.barber_profiles where id=${q(records[0].barber.id)}`,
            ),
            't',
          );
        },
      );
      await checked(
        'live revoked membership denies professional confirmation with no tenant privilege bleed',
        async () => {
          sql(
            `update public.barbershop_memberships set status='inactive' where user_id=${q(professional.id)} and barbershop_id=${q(B.id)}`,
          );
          try {
            const r = await env.confirm(other, input(1, 690));
            assert.equal(r.status, 409);
            assert.equal(
              r.body.message,
              'Profesional no disponible en ese horario',
            );
            assert.equal((await env.confirm(other, input(0, 690))).status, 200);
          } finally {
            sql(
              `update public.barbershop_memberships set status='active' where user_id=${q(professional.id)} and barbershop_id=${q(B.id)}`,
            );
          }
        },
      );
      await checked(
        'cancelled synthetic fixture frees occupancy without claiming cancellation feature',
        async () => {
          const d = input(1, 45, { startsAt: at(0, 1) }),
            r = await env.confirm(client, d);
          assert.equal(r.status, 200);
          const id = r.body.detail.id;
          sql(
            `begin;update public.reservations set state='cancelled',cancelled_at=now() where id=${q(id)} and client_user_id=${q(client.id)};insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values(${q(id)},${q(B.id)},${q(client.id)},'client','cancelled');commit;`,
          );
          const replacement = await env.confirm(other, {
            ...d,
            requestId: randomUUID(),
          });
          assert.equal(replacement.status, 200);
        },
      );
      await checked(
        'configuration serialization makes new bookings observe pause and fresh catalogue',
        async () => {
          // Real two-connection race: publication versus confirmation. Either commit order is valid.
          const d = input(0, 45, { startsAt: at(60, 1) }),
            pair = await race(env, [
              statement(client, d),
              `select public.set_booking_publication(${q(professional.id)},${j({ barbershopId: A.id, state: 'paused' })})`,
            ]);
          assert.equal(pair[1].code, 0);
          assert.ok([0, 3].includes(pair[0].code));
          if (pair[0].code === 3)
            assert.ok(pair[0].err.includes('NOT_AVAILABLE'));
          const paused = await env.confirm(
            client,
            input(0, 45, { startsAt: at(105, 1) }),
          );
          // Direct PostgREST maps P0* to 500. T017 maps NOT_AVAILABLE to the Edge 404 contract.
          assert.equal(paused.status, 500);
          assert.equal(paused.body.code, 'P0002');
          assert.equal(paused.body.message, 'NOT_AVAILABLE');
          await okCommand(professional, {
            action: 'set-publication',
            barbershopId: A.id,
            state: 'published',
          });
        },
      );
      await checked(
        'no orphan partial item or duplicate event remains and reservation limit respected',
        async () => {
          const rows = JSON.parse(
            sql(
              `select jsonb_build_object('headers',count(*),'badItems',count(*) filter(where(select count(*) from public.reservation_items i where i.reservation_id=r.id)<>2),'badEvents',count(*) filter(where(select count(*) from public.reservation_events e where e.reservation_id=r.id and kind='confirmed')<>1)) from public.reservations r where r.barbershop_id in(${q(A.id)},${q(B.id)})`,
            ),
          );
          assert.ok(rows.headers <= 60);
          assert.equal(rows.badItems, 0);
          assert.equal(rows.badEvents, 0);
        },
      );
      const plans = sql(
        `explain(costs off) select id from public.reservations where client_user_id=${q(client.id)} and starts_at>=now();`,
      );
      fs.writeFileSync(evidence + 'plans.txt', plans + '\n');
      fs.writeFileSync(
        evidence + 'concurrency.json',
        JSON.stringify(
          {
            project: 'app-barberia-002-local',
            date: '2026-11-14',
            results,
            races,
            bookingEdgeEndToEnd: false,
          },
          null,
          2,
        ) + '\n',
      );
    });
  } finally {
    terminal?.close();
  }
}
main().catch(() => {
  console.error('ATOMIC_INTEGRATION_FAILED');
  process.exitCode = 1;
});
