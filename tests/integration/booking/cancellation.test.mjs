import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { localBookingEnvironment } from './client-environment.mjs';
test('authorized local cancellation fixtures: historical cutoff, auth, replay, rollback and two-session race', async () => {
  if (process.env.BARBERIA_004_CANCEL_FIXTURES !== 'authorized-up-to-eight')
    throw Error('EXPLICIT_FIXTURE_AUTHORIZATION_REQUIRED');
  const file = '.artifacts/004-cancellation-fixtures.json';
  if (fs.existsSync(file)) throw Error('FIXTURES_ALREADY_EXIST_DO_NOT_REPEAT');
  const env = localBookingEnvironment(),
    m = env.read(),
    q = env.quote,
    [a, b, client] = m.accounts,
    shop = m.shops[0].id;
  const originalIds = JSON.parse(
    env.sql(`select coalesce(json_agg(id),'[]') from public.reservations;`),
  );
  const protectedDigest = () =>
    env.sql(
      `select jsonb_build_array((select md5(coalesce(string_agg(row_to_json(r)::text,',' order by id),'')) from public.reservations r where id in(${originalIds.map(q).join(',')})),(select md5(coalesce(string_agg(row_to_json(i)::text,',' order by row_to_json(i)::text),'')) from public.reservation_items i where reservation_id in(${originalIds.map(q).join(',')})),(select md5(coalesce(string_agg(row_to_json(e)::text,',' order by id),'')) from public.reservation_events e where reservation_id in(${originalIds.map(q).join(',')})))`,
    );
  const before = protectedDigest();
  const template = JSON.parse(
    env.sql(
      `select json_build_object('id',r.id,'barberId',r.barber_id,'services',(select json_agg(service_id) from public.reservation_items where reservation_id=r.id)) from public.reservations r where barbershop_id=${q(shop)} and client_user_id=${q(client.id)} and state='confirmed' order by starts_at limit 1;`,
    ),
  );
  const manifest = {
    project: env.projectId,
    originalIds,
    records: [],
    attempts: [],
    manualComplete: false,
    cleanupAuthorized: false,
  };
  const save = () =>
    fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  save();
  const report = {
    project: env.projectId,
    checks: [],
    fixtures: [],
    preservedForManual: true,
  };
  const check = (name, condition) => {
    assert.ok(condition, name);
    report.checks.push(name);
  };
  const tokens = [];
  try {
    for (const account of [a, b, client]) tokens.push(await env.login(account));
    const cancel = (token, id, reason, requestId = randomUUID()) =>
      env.post(
        token,
        '/functions/v1/reservation-command',
        {
          action: 'cancel',
          requestId,
          reservationId: id,
          ...(reason ? { reason } : {}),
        },
        'http://localhost:8081',
      );
    // Test hot-loaded handler before creating any synthetic row. Unknown resource must not mutate data.
    check(
      'local-cancel-handler-active',
      (await cancel(tokens[2], randomUUID())).status === 404,
    );
    const boundary = env.sql(
      "select json_build_array(private.cancellation_before_limit('2026-12-01 15:00Z',120,'2026-12-01 13:00Z'),not private.cancellation_before_limit('2026-12-01 15:00Z',120,'2026-12-01 13:00:00.001Z'),private.cancellation_before_limit('2026-12-01 15:00Z',30,'2026-12-01 14:30Z'));",
    );
    check(
      'inclusive120-outside-and-configured-cutoff',
      JSON.parse(boundary).every(Boolean),
    );
    const late = randomUUID(),
      lateRequest = randomUUID();
    manifest.attempts.push({
      purpose: 'snapshot120',
      id: late,
      requestId: lateRequest,
    });
    save();
    env.sql(`begin;insert into public.reservations(id,barbershop_id,client_user_id,barber_id,barber_user_id,request_id,fingerprint,starts_at,ends_at,occupied_until,duration_min,buffer_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot) select ${q(late)},barbershop_id,client_user_id,barber_id,barber_user_id,${q(lateRequest)},encode(sha256(convert_to(${q(lateRequest)}::text,'UTF8')),'hex'),date_trunc('minute',now())+interval '60 minutes',date_trunc('minute',now())+interval '60 minutes'+make_interval(mins=>duration_min),date_trunc('minute',now())+interval '60 minutes'+make_interval(mins=>duration_min+buffer_min),duration_min,buffer_min,total_amount,shop_name_snapshot||' [PRUEBA CANCELACIÓN LÍMITE]',barber_name_snapshot,client_display_name_snapshot,jsonb_set(policy_snapshot,'{cancellationAdvanceMin}','120') from public.reservations where id=${q(template.id)};
 insert into public.reservation_items select ${q(late)},barbershop_id,service_id,name_snapshot,description_snapshot,price_snapshot,duration_min from public.reservation_items where reservation_id=${q(template.id)};
 insert into public.reservation_events(reservation_id,barbershop_id,actor_user_id,capacity,kind) values(${q(late)},${q(shop)},${q(client.id)},'client','confirmed');commit;`);
    manifest.records.push({ id: late, purpose: 'snapshot120', manual: false });
    save();
    check(
      'historical120-rejects-client-despite-current-policy',
      (await cancel(tokens[2], late)).status === 403,
    );
    check(
      'foreign-staff-cannot-cancel',
      (await cancel(tokens[1], late, 'Foreign attempt')).status === 404,
    );
    check(
      'staff-requires-reason',
      (await cancel(tokens[0], late)).status === 400,
    );
    const done = await cancel(
      tokens[0],
      late,
      'Prueba local de política histórica',
    );
    check(
      'authorized-staff-cancels-with-reason',
      done.status === 200 && done.body.state === 'cancelled',
    );
    const audit = env.sql(
      `select row_to_json(e) from public.reservation_events e where reservation_id=${q(late)} and kind='cancelled';`,
    );
    const repeats = await Promise.all([
      cancel(tokens[0], late, 'Different repeated reason'),
      cancel(tokens[2], late),
    ]);
    check(
      'repetition-safe',
      repeats.every((r) => r.status === 200),
    );
    check(
      'first-audit-preserved',
      env.sql(
        `select row_to_json(e) from public.reservation_events e where reservation_id=${q(late)} and kind='cancelled';`,
      ) === audit,
    );
    const future = new Date(Date.now() + 3 * 86400000)
      .toISOString()
      .slice(0, 10);
    const slots = await env.post(tokens[2], '/rest/v1/rpc/list_booking_slots', {
      p_barbershop_id: shop,
      p_local_date: future,
      p_service_ids: template.services,
      p_barber_id: template.barberId,
    });
    assert.equal(slots.status, 200);
    assert.ok(slots.body.length > 12);
    async function confirm(purpose, index) {
      const input = {
        action: 'confirm',
        requestId: randomUUID(),
        barbershopId: shop,
        serviceIds: template.services,
        barberId: template.barberId,
        startsAt: slots.body[index].startsAt,
      };
      manifest.attempts.push({ purpose, input });
      save();
      const r = await env.post(
        tokens[2],
        '/functions/v1/reservation-command',
        input,
        'http://localhost:8081',
      );
      assert.equal(r.status, 201);
      manifest.records.push({
        id: r.body.id,
        purpose,
        manual: purpose.startsWith('manual'),
      });
      save();
      return { detail: r.body, input };
    }
    const race = await confirm('race-original', 0),
      web = await confirm('manual-Web', 5),
      android = await confirm('manual-Android', 10);
    const rollbackInput = JSON.stringify({
      requestId: randomUUID(),
      reservationId: web.detail.id,
    });
    env.sql(
      `begin;select public.cancel_booking(${q(client.id)},'${rollbackInput}'::jsonb);rollback;`,
    );
    check(
      'rollback-keeps-manual-booking-confirmed',
      env.sql(
        `select state from public.reservations where id=${q(web.detail.id)};`,
      ) === 'confirmed',
    );
    const replacement = { ...race.input, requestId: randomUUID() };
    manifest.attempts.push({ purpose: 'race-replacement', input: replacement });
    save();
    const [c, r] = await Promise.all([
      cancel(tokens[2], race.detail.id),
      env.post(
        tokens[2],
        '/functions/v1/reservation-command',
        replacement,
        'http://localhost:8081',
      ),
    ]);
    assert.equal(c.status, 200);
    assert.ok([201, 409].includes(r.status));
    const final =
      r.status === 201
        ? r
        : await env.post(
            tokens[2],
            '/functions/v1/reservation-command',
            replacement,
            'http://localhost:8081',
          );
    assert.equal(final.status, 201);
    manifest.records.push({
      id: final.body.id,
      purpose: 'race-replacement',
      manual: false,
    });
    save();
    check(
      'two-http-connections-cancel-confirm-safe',
      env.sql(
        `select count(*) from public.reservations where request_id=${q(replacement.requestId)};`,
      ) === '1',
    );
    check(
      'cancelled-no-longer-occupies',
      env.sql(
        `select count(*) from public.reservations where barber_id=${q(template.barberId)} and starts_at=${"'" + race.input.startsAt + "'"}::timestamptz and state='confirmed';`,
      ) === '1',
    );
    check('current-T019-records-identical', protectedDigest() === before);
    check(
      'fixture-limit-and-manual-preservation',
      manifest.records.length <= 8 &&
        [web, android].every(
          (x) =>
            env.sql(
              `select state from public.reservations where id=${q(x.detail.id)};`,
            ) === 'confirmed',
        ),
    );
    for (const record of manifest.records)
      report.fixtures.push({
        ...record,
        state: env.sql(
          `select state from public.reservations where id=${q(record.id)};`,
        ),
      });
    for (const token of tokens)
      await env.post(token, '/auth/v1/logout?scope=local', {});
    fs.writeFileSync(
      'docs/evaluacion/evidencias/004-reservas/t024-t027/http.json',
      JSON.stringify(report, null, 2) + '\n',
    );
    console.log(
      'Controlled cancellation checks passed; fixtures held for manual.',
    );
  } catch (e) {
    report.failed = true;
    report.errorType = e?.code || e?.name || 'LocalFailure';
    fs.writeFileSync(
      'docs/evaluacion/evidencias/004-reservas/t024-t027/http.json',
      JSON.stringify(report, null, 2) + '\n',
    );
    throw Error('CANCELLATION_TEST_FAILED_STOP_NO_CLEANUP');
  }
});
