import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import {
  localBookingEnvironment,
  fixtureFile,
} from '../tests/integration/booking/client-environment.mjs';
const ev = 'docs/evaluacion/evidencias/004-reservas/t017-t019/';
async function main() {
  const action = process.argv[2];
  if (
    !['prepare', 'status', 'pause-for-manual', 'cleanup'].includes(action) ||
    process.argv.length !== 3
  )
    throw Error('UNSAFE_FIXTURE_ACTION');
  const env = localBookingEnvironment(),
    q = env.quote;
  if (action === 'prepare') {
    if (fs.existsSync(fixtureFile))
      throw Error('FIXTURE_EXISTS_DO_NOT_RECREATE');
    const run = 'client-' + randomBytes(6).toString('hex'),
      manifest = {
        project: env.projectId,
        run,
        baseline: env.baseline(),
        accounts: [],
        shops: [],
        prepared: false,
        manualCompleted: false,
        manualDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        testDate: new Date(Date.now() + 3 * 86400000)
          .toISOString()
          .slice(0, 10),
      };
    env.save(manifest);
    const tokens = [];
    for (const [index, role] of [
      'administradorA',
      'administradorB',
      'cliente',
    ].entries()) {
      const account = {
        role,
        email: `${run}-${index}@example.invalid`,
        password: randomBytes(24).toString('base64url'),
      };
      const created = await env.request('/auth/v1/admin/users', {
        admin: true,
        method: 'POST',
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          email_confirm: true,
        }),
      });
      if (!created.body?.id || ![200, 201].includes(created.status))
        throw Error('FIXTURE_AUTH_CREATE_FAILED');
      account.id = created.body.id;
      q(account.id);
      manifest.accounts.push(account);
      env.save(manifest);
      const token = await env.login(account);
      tokens.push(token);
      if (
        (
          await env.post(token, '/functions/v1/ensure-profile', {
            displayName: `MVP local ${role}`,
            phone: null,
          })
        ).status !== 200
      )
        throw Error('FIXTURE_PROFILE_FAILED');
    }
    const policy = {
      minimumNoticeMin: 0,
      bookingHorizonDays: 14,
      maxFuturePerClient: 12,
      slotStepMin: 15,
      bufferMin: 0,
      cancellationAdvanceMin: 120,
    };
    async function command(token, data) {
      const r = await env.operation(token, data);
      if (r.status !== 200)
        throw Error(
          'FIXTURE_OFFERING_' +
            data.action.toUpperCase().replaceAll('-', '_') +
            '_FAILED',
        );
      return r.body;
    }
    for (const [i, label] of ['A', 'B'].entries()) {
      const name = `MVP Local ${label} ${run}`,
        shopResponse = await env.post(
          tokens[i],
          '/functions/v1/create-barbershop',
          { name },
        );
      if (shopResponse.status !== 201) throw Error('FIXTURE_SHOP_FAILED');
      const shop = {
        id: shopResponse.body.barbershop.id,
        name,
        services: [],
        professionals: [],
      };
      q(shop.id);
      manifest.shops.push(shop);
      env.save(manifest);
      await command(tokens[i], {
        action: 'configure-shop',
        barbershopId: shop.id,
        publicContact: 'Contacto ficticio local',
        address: 'Dirección de prueba local',
        policies: policy,
      });
      for (const [index, durationMin] of [30, 15].entries()) {
        const service = await command(tokens[i], {
          action: 'upsert-service',
          barbershopId: shop.id,
          name: index ? 'Barba local' : 'Corte local',
          description: 'Servicio ficticio para validación local',
          price: { amountMinor: index ? 1000 : 2500, currency: 'PEN' },
          durationMin,
          active: true,
        });
        shop.services.push(service);
        env.save(manifest);
      }
      const p = await command(tokens[i], {
        action: 'set-professional',
        barbershopId: shop.id,
        userId: manifest.accounts[i].id,
        professionalName: `Profesional local ${label}`,
        active: true,
      });
      shop.professionals.push(p);
      env.save(manifest);
      const hours = Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        opensMin: 540,
        closesMin: 1080,
      }));
      for (const data of [
        { action: 'set-shop-hours', hours },
        { action: 'set-barber-hours', barberId: p.id, hours },
        {
          action: 'set-capabilities',
          barberId: p.id,
          serviceIds: shop.services.map((s) => s.id),
        },
        { action: 'set-publication', state: 'published' },
      ])
        await command(tokens[i], { barbershopId: shop.id, ...data });
    }
    const invitation = await command(tokens[0], {
      action: 'invite-existing-user',
      barbershopId: manifest.shops[0].id,
      email: manifest.accounts[1].email,
    });
    manifest.invitationId = invitation.id;
    manifest.prepared = true;
    env.save(manifest);
    fs.writeFileSync(
      ev + 'fixtures-prepared.json',
      JSON.stringify(
        {
          project: env.projectId,
          usersCreated: 3,
          shopsCreated: 2,
          initialMemberships: 2,
          initialProfessionals: 2,
          services: 4,
          pendingInvitations: 1,
          credentialFileIgnored: true,
          emailsSent: 0,
          manualDate: manifest.manualDate,
          testDate: manifest.testDate,
          heldForManual: true,
        },
        null,
        2,
      ) + '\n',
    );
    console.log(
      'Local fixture prepared: 3 accounts, 2 shops, 4 services; credentials only in ignored file. No emails.',
    );
    return;
  }
  const m = env.read(),
    users = m.accounts.map((a) => q(a.id)).join(','),
    shops = m.shops.map((s) => q(s.id)).join(',');
  if (!users || !shops) throw Error('INCOMPLETE_FIXTURE_MANIFEST');
  if (action === 'pause-for-manual') {
    const token = await env.login(m.accounts[0]);
    const r = await env.operation(token, {
      action: 'set-publication',
      barbershopId: m.shops[0].id,
      state: 'paused',
    });
    if (r.status !== 200) throw Error('PAUSE_FAILED');
    m.pausedForManual = true;
    env.save(m);
    console.log('Only owned A paused for manual publication; B unchanged.');
    return;
  }
  const status = JSON.parse(
    env.sql(
      `select jsonb_build_object('users',(select count(*) from auth.users where id in(${users})),'profiles',(select count(*) from public.profiles where id in(${users})),'shops',(select count(*) from public.barbershops where id in(${shops})),'memberships',(select count(*) from public.barbershop_memberships where barbershop_id in(${shops})),'professionals',(select count(*) from public.barber_profiles where barbershop_id in(${shops})),'services',(select count(*) from public.services where barbershop_id in(${shops})),'invitations',(select count(*) from public.staff_invitations where barbershop_id in(${shops})),'reservations',(select count(*) from public.reservations where barbershop_id in(${shops})))`,
    ),
  );
  if (
    status.users > 3 ||
    status.shops > 2 ||
    status.memberships > 3 ||
    status.professionals > 3 ||
    status.services > 4 ||
    status.invitations > 3 ||
    status.reservations > 12
  )
    throw Error('FIXTURE_LIMIT_EXCEEDED');
  if (action === 'status') {
    fs.writeFileSync(
      ev + 'fixtures-status.json',
      JSON.stringify(
        { project: env.projectId, ...status, heldForManual: true },
        null,
        2,
      ) + '\n',
    );
    console.log(JSON.stringify(status));
    return;
  }
  if (!m.manualCompleted || process.env.BARBERIA_004_MANUAL_COMPLETE !== 'yes')
    throw Error('WAIT_FOR_USER_MANUAL_CONFIRMATION');
  for (const a of m.accounts) {
    const r = await env.request('/auth/v1/admin/users/' + a.id, {
      admin: true,
    });
    if (r.status !== 200 || r.body.email !== a.email)
      throw Error('USER_OWNERSHIP_MISMATCH');
  }
  const unknown = Number(
    env.sql(
      `select (select count(*) from public.barbershop_memberships where (barbershop_id in(${shops})and user_id not in(${users}))or(user_id in(${users})and barbershop_id not in(${shops})))+(select count(*) from public.barber_profiles where(barbershop_id in(${shops})and user_id not in(${users}))or(user_id in(${users})and barbershop_id not in(${shops})))+(select count(*) from public.staff_invitations where(barbershop_id in(${shops})and(recipient_user_id not in(${users})or inviter_user_id not in(${users})))or(barbershop_id not in(${shops})and(recipient_user_id in(${users})or inviter_user_id in(${users}))))+(select count(*) from public.reservations where(barbershop_id in(${shops})and(client_user_id not in(${users})or barber_user_id not in(${users})))or(barbershop_id not in(${shops})and(client_user_id in(${users})or barber_user_id in(${users}))))+(select count(*) from public.reservation_events where barbershop_id in(${shops})and actor_user_id not in(${users}))`,
    ),
  );
  if (unknown || status.shops !== m.shops.length)
    throw Error('FOREIGN_DEPENDENCY_STOP_CLEANUP');
  for (const s of m.shops) {
    if (
      env.sql(`select name from public.barbershops where id=${q(s.id)}`) !==
      s.name
    )
      throw Error('SHOP_OWNERSHIP_MISMATCH');
  }
  env.sql(
    `begin;delete from public.reservation_events where barbershop_id in(${shops});delete from public.reservation_items where barbershop_id in(${shops});delete from public.reservations where barbershop_id in(${shops});delete from public.staff_invitations where barbershop_id in(${shops});delete from public.schedule_exceptions where barbershop_id in(${shops});delete from public.barber_schedules where barbershop_id in(${shops});delete from public.barbershop_hours where barbershop_id in(${shops});delete from public.barber_services where barbershop_id in(${shops});delete from public.barber_profiles where barbershop_id in(${shops});delete from public.services where barbershop_id in(${shops});delete from public.barbershop_booking_settings where barbershop_id in(${shops});delete from public.barbershop_memberships where barbershop_id in(${shops});delete from public.barbershops where id in(${shops});delete from public.profiles where id in(${users}) and display_name like 'MVP local %';commit;`,
  );
  for (const a of m.accounts) {
    const r = await env.request('/auth/v1/admin/users/' + a.id, {
      admin: true,
      method: 'DELETE',
    });
    if (![200, 204].includes(r.status))
      throw Error('OWNED_AUTH_CLEANUP_FAILED');
  }
  if (env.baseline() !== m.baseline) throw Error('BASELINE_NOT_PRESERVED');
  fs.unlinkSync(fixtureFile);
  fs.writeFileSync(
    ev + 'cleanup.json',
    JSON.stringify(
      {
        project: env.projectId,
        baselinePreserved: true,
        remainingOwnedRecords: 0,
        credentialFileRemoved: true,
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Only owned local fixture cleaned after manual confirmation.');
}
main().catch((e) => {
  console.error(
    /^[A-Z_]+$/.test(e.message) ? e.message : 'LOCAL_FIXTURE_OPERATION_FAILED',
  );
  process.exitCode = 1;
});
