import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { randomInt } from 'node:crypto';
import { withOperationEnvironment } from './operation-environment.mjs';
import { waitForBookingBarrier } from './fixtures.mjs';
async function race(env, statements) {
  const key = randomInt(100000, 2000000000),
    tag = 'B004_' + env.run + '_' + key;
  const children = [];
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
  const pause = () => new Promise((r) => setTimeout(r, 40));
  try {
    for (let i = 0; !locker.output().includes('READY'); i++) {
      if (i > 100) throw Error('LOCKER_NOT_READY');
      await pause();
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
      async () => {
        locker.child.stdin.end(`select pg_advisory_unlock(${key});`);
      },
    );
    const timer = setTimeout(() => {
      for (const c of children) c.kill();
    }, 15000);
    const results = await Promise.all(workers.map((w) => w.done));
    clearTimeout(timer);
    assert.deepEqual(results.map((r) => r.code).sort(), [0, 3]);
    assert.ok(results.find((r) => r.code === 3).err.includes('23505'));
    return {
      connections: 2,
      observedBarrierWaiters: 2,
      committed: 1,
      rejected: 1,
      sqlstate: '23505',
    };
  } finally {
    locker.child.stdin.end();
    env.sql(
      `select pg_terminate_backend(pid) from pg_stat_activity where application_name in('${tag}_l','${tag}_w') and pid<>pg_backend_pid()`,
    );
    for (const c of children) if (c.exitCode === null) c.kill();
  }
}
const literal = (value) =>
  "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
test('local offering invitations real JWT isolation and concurrent transitions', async (t) => {
  await withOperationEnvironment(async (env) => {
    const [shared, adminB, recipient, inactive] = env.users,
      [A, B] = env.shops;
    const records = [];
    const check = async (label, fn) => {
      await t.test(label, fn);
    };
    const policy = {
      minimumNoticeMin: 0,
      bookingHorizonDays: 30,
      maxFuturePerClient: 5,
      slotStepMin: 15,
      bufferMin: 0,
      cancellationAdvanceMin: 120,
    };
    await check(
      'real verified actor and contextual admin role are enforced',
      async () => {
        for (const user of [shared, inactive]) {
          const r = await env.command(user, {
            action: 'configure-shop',
            barbershopId: B.id,
            publicContact: 'Test',
            address: 'Local',
            policies: policy,
          });
          assert.equal(r.status, 403);
        }
        const forged = await env.command(shared, {
          action: 'configure-shop',
          barbershopId: A.id,
          publicContact: 'Test',
          address: 'Local',
          policies: policy,
          actorId: adminB.id,
        });
        assert.equal(forged.status, 400);
        const ordinary = await env.post(
          inactive.token,
          '/rest/v1/rpc/configure_booking_shop',
          { p_actor_id: shared.id, p_data: { barbershopId: A.id } },
        );
        assert.equal(ordinary.status, 403);
        const anon = await env.post(
          env.anon,
          '/functions/v1/barbershop-operation',
          { action: 'set-publication', barbershopId: A.id, state: 'published' },
        );
        assert.equal(anon.status, 401);
      },
    );
    for (const [user, shop] of [
      [shared, A],
      [adminB, B],
    ]) {
      const config = await env.command(user, {
        action: 'configure-shop',
        barbershopId: shop.id,
        publicContact: 'Test only',
        address: 'Local fixture',
        policies: policy,
      });
      assert.equal(config.status, 200);
      const premature = await env.command(user, {
        action: 'set-publication',
        barbershopId: shop.id,
        state: 'published',
      });
      assert.equal(premature.status, 409);
      const service = await env.command(user, {
        action: 'upsert-service',
        barbershopId: shop.id,
        name: 'Fixture service',
        description: 'Local test',
        price: { amountMinor: 2550, currency: 'PEN' },
        durationMin: 30,
        active: true,
      });
      assert.equal(service.status, 200);
      const professional = await env.command(user, {
        action: 'set-professional',
        barbershopId: shop.id,
        userId: user.id,
        professionalName: 'Admin professional',
        active: true,
      });
      assert.equal(professional.status, 200);
      const hours = [{ weekday: 1, opensMin: 540, closesMin: 1080 }];
      for (const command of [
        { action: 'set-shop-hours', barbershopId: shop.id, hours },
        {
          action: 'set-barber-hours',
          barbershopId: shop.id,
          barberId: professional.body.id,
          hours,
        },
        {
          action: 'set-capabilities',
          barbershopId: shop.id,
          barberId: professional.body.id,
          serviceIds: [service.body.id],
        },
        {
          action: 'set-publication',
          barbershopId: shop.id,
          state: 'published',
        },
      ])
        assert.equal((await env.command(user, command)).status, 200);
      records.push({ service: service.body, professional: professional.body });
    }
    await check(
      'commercial projection does not open private profiles or Auth identities',
      async () => {
        const r = await env.post(
          recipient.token,
          '/rest/v1/rpc/get_booking_catalog',
          { p_barbershop_id: A.id },
        );
        assert.equal(r.status, 200);
        assert.equal(r.body.professionals.length, 1);
        assert.ok(!('userId' in r.body.professionals[0]));
        const privateRows = await env.request(
          '/rest/v1/services?select=id&barbershop_id=eq.' + A.id,
          { token: recipient.token },
        );
        assert.equal(privateRows.status, 200);
        assert.equal(privateRows.body.length, 0);
        const profile = await env.request(
          '/rest/v1/profiles?select=id&id=eq.' + shared.id,
          { token: recipient.token },
        );
        assert.equal(profile.body.length, 0);
      },
    );
    const inviteSql = `select public.invite_booking_staff(${env.quote(shared.id)},${literal({ barbershopId: A.id, email: recipient.email })})`;
    const duplicate = await race(env, [inviteSql, inviteSql]);
    const own = await env.post(
      recipient.token,
      '/rest/v1/rpc/list_own_staff_invitations',
      {},
    );
    assert.equal(own.status, 200);
    assert.equal(own.body.length, 1);
    const invitationId = own.body[0].id;
    await check(
      'pending invitation grants no membership and only recipient can respond',
      async () => {
        assert.equal(
          Number(
            env.sql(
              `select count(*) from public.barbershop_memberships where user_id=${env.quote(recipient.id)}`,
            ),
          ),
          0,
        );
        const wrong = await env.command(adminB, {
          action: 'accept-invitation',
          invitationId,
        });
        assert.equal(wrong.status, 404);
        const list = await env.post(
          shared.token,
          '/rest/v1/rpc/list_shop_staff_invitations',
          { p_barbershop_id: B.id },
        );
        assert.equal(list.status, 403);
      },
    );
    const acceptSql = `select public.respond_booking_invitation(${env.quote(recipient.id)},${literal({ invitationId, decision: 'accept' })})`;
    const acceptance = await race(env, [acceptSql, acceptSql]);
    await check(
      'acceptance is unique and immediately grants the intended barber role',
      async () => {
        const rows = await env.request(
          '/rest/v1/barbershop_memberships?select=role,status&barbershop_id=eq.' +
            A.id,
          { token: recipient.token },
        );
        assert.equal(rows.body.length, 1);
        assert.equal(rows.body[0].role, 'barber');
        assert.equal(rows.body[0].status, 'active');
        const repeat = await env.command(recipient, {
          action: 'accept-invitation',
          invitationId,
        });
        assert.equal(repeat.status, 409);
      },
    );
    const rejected = await env.command(shared, {
      action: 'invite-existing-user',
      barbershopId: A.id,
      email: inactive.email,
    });
    assert.equal(rejected.status, 200);
    await check(
      'rejection reinvitation cancellation and non recipient denial are real HTTP outcomes',
      async () => {
        assert.equal(
          (
            await env.command(inactive, {
              action: 'reject-invitation',
              invitationId: rejected.body.id,
            })
          ).status,
          200,
        );
        const next = await env.command(shared, {
          action: 'invite-existing-user',
          barbershopId: A.id,
          email: inactive.email,
        });
        assert.equal(next.status, 200);
        assert.notEqual(next.body.id, rejected.body.id);
        assert.equal(
          (
            await env.command(inactive, {
              action: 'cancel-invitation',
              invitationId: next.body.id,
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await env.command(shared, {
              action: 'cancel-invitation',
              invitationId: next.body.id,
            })
          ).status,
          200,
        );
        const rows = await env.request(
          '/rest/v1/services?select=id&barbershop_id=eq.' + A.id,
          { token: inactive.token },
        );
        assert.equal(rows.body.length, 0);
      },
    );
    await check(
      'existing administrator is never silently downgraded by invitation',
      async () => {
        const self = await env.command(shared, {
          action: 'invite-existing-user',
          barbershopId: A.id,
          email: shared.email,
        });
        assert.equal(self.status, 200);
        assert.equal(
          (
            await env.command(shared, {
              action: 'accept-invitation',
              invitationId: self.body.id,
            })
          ).status,
          409,
        );
        const row = env.sql(
          `select role from public.barbershop_memberships where user_id=${env.quote(shared.id)} and barbershop_id=${env.quote(A.id)}`,
        );
        assert.equal(row, 'administrator');
      },
    );
    await check(
      'revoked inviter cannot grant access using a stale pending invitation',
      async () => {
        const pending = await env.command(shared, {
          action: 'invite-existing-user',
          barbershopId: A.id,
          email: recipient.email,
        });
        assert.equal(pending.status, 200);
        env.sql(
          `update public.barbershop_memberships set status='inactive' where user_id=${env.quote(shared.id)} and barbershop_id=${env.quote(A.id)}`,
        );
        try {
          assert.equal(
            (
              await env.command(recipient, {
                action: 'accept-invitation',
                invitationId: pending.body.id,
              })
            ).status,
            403,
          );
        } finally {
          env.sql(
            `update public.barbershop_memberships set status='active' where user_id=${env.quote(shared.id)} and barbershop_id=${env.quote(A.id)}`,
          );
        }
      },
    );
    const competitive = await env.command(adminB, {
      action: 'invite-existing-user',
      barbershopId: B.id,
      email: recipient.email,
    });
    assert.equal(competitive.status, 200);
    const competing = await race(env, [
      `select public.respond_booking_invitation(${env.quote(recipient.id)},${literal({ invitationId: competitive.body.id, decision: 'accept' })})`,
      `select public.cancel_booking_invitation(${env.quote(adminB.id)},${literal({ invitationId: competitive.body.id })})`,
    ]);
    await check(
      'accept versus cancel commits one terminal transition without a partial membership',
      async () => {
        const state = env.sql(
          `select status from public.staff_invitations where id=${env.quote(competitive.body.id)}`,
        );
        const members = Number(
          env.sql(
            `select count(*) from public.barbershop_memberships where user_id=${env.quote(recipient.id)} and barbershop_id=${env.quote(B.id)}`,
          ),
        );
        assert.equal(members, state === 'accepted' ? 1 : 0);
      },
    );
    fs.writeFileSync(
      'docs/evaluacion/evidencias/004-reservas/t008-t011/concurrency.json',
      JSON.stringify(
        {
          project: 'app-barberia-002-local',
          duplicate,
          acceptance,
          acceptVersusCancel: competing,
        },
        null,
        2,
      ) + '\n',
    );
  });
});
