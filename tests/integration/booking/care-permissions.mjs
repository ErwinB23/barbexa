import fs from 'node:fs';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { localBookingEnvironment } from './client-environment.mjs';
process.env.BARBERIA_002_PROJECT_ID = 'app-barberia-002-local';
process.env.BARBERIA_002_URL = 'http://127.0.0.1:54421';
const env = localBookingEnvironment(),
  file = '.artifacts/005-care/manifest.json',
  m = JSON.parse(fs.readFileSync(file)),
  accounts = JSON.parse(
    fs.readFileSync('.artifacts/005-care/credenciales-locales.json'),
  ),
  reportPath = 'specs/005-atencion-pagos-manuales/real-tests.json',
  report = JSON.parse(fs.readFileSync(reportPath));
assert.equal(m.phase, 'automated-complete');
assert.equal(report.completed, true);
assert.ok(!report.additionalCompleted, 'DO_NOT_REPEAT');
const tokens = await Promise.all(accounts.map((a) => env.login(a)));
const q = env.quote;
const care = (token, input) =>
  env.post(
    token,
    '/functions/v1/reservation-command',
    { action: 'care', ...input },
    'http://localhost:8081',
  );
const check = (name, result) => {
  assert.ok(result, name);
  report.checks.push(name);
};
const b = m.bookings[13],
  memberA = m.memberships[1],
  memberB = m.memberships[3];
const originalA = env.sql(
    `select row_to_json(m) from public.barbershop_memberships m where id=${q(memberA)};`,
  ),
  originalB = env.sql(
    `select row_to_json(m) from public.barbershop_memberships m where id=${q(memberB)};`,
  );
const originalDigest = () =>
  JSON.parse(
    env.sql(
      'select jsonb_object_agg(t,hashes) from (' +
        Object.keys(m.baseline)
          .map(
            (t) =>
              `select '${t}' t,coalesce(jsonb_agg(md5(to_jsonb(r)::text)),'[]') hashes from public.${t} r`,
          )
          .join(' union all ') +
        ')x;',
    ),
  );
try {
  for (const [index, kind, token] of [
    [0, 'receive', tokens[1]],
    [5, 'refund', tokens[2]],
  ]) {
    const id = m.bookings[index].id,
      entry = JSON.parse(
        env.sql(
          `select fingerprint from private.care_events where reservation_id=${q(id)} and kind='${kind}';`,
        ),
      ),
      before = env.sql(
        `select jsonb_agg(to_jsonb(e) order by id) from private.care_events e where reservation_id=${q(id)};`,
      );
    check('exact-replay-' + kind, (await care(token, entry)).status === 200);
    check(
      'changed-replay-' + kind,
      (await care(token, { ...entry, attested: false })).status === 400,
    );
    check(
      'audit-preserved-' + kind,
      env.sql(
        `select jsonb_agg(to_jsonb(e) order by id) from private.care_events e where reservation_id=${q(id)};`,
      ) === before,
    );
  }
  check(
    'barber-B-cannot-admin-config',
    (
      await care(tokens[1], {
        command: 'configure',
        barbershopId: m.shops[1],
        requestId: randomUUID(),
        noShowToleranceMin: 10,
        yapeInstructions: null,
      })
    ).status === 403,
  );
  env.sql(
    `update public.barbershop_memberships set role='administrator' where id=${q(memberA)} and user_id=${q(m.accounts[1])};`,
  );
  check(
    'admin-A-cannot-admin-config-B',
    (
      await care(tokens[1], {
        command: 'configure',
        barbershopId: m.shops[1],
        requestId: randomUUID(),
        noShowToleranceMin: 10,
        yapeInstructions: null,
      })
    ).status === 403,
  );
  check(
    'admin-A-remains-barber-B',
    (await care(tokens[1], { command: 'read', reservationId: b.id })).status ===
      200,
  );
  env.sql(
    `update public.barbershop_memberships set status='inactive' where id=${q(memberB)} and user_id=${q(m.accounts[1])};`,
  );
  check(
    'same-JWT-revocation-rejects',
    [403, 404].includes(
      (await care(tokens[1], { command: 'read', reservationId: b.id })).status,
    ),
  );
  check(
    'same-JWT-cannot-charge-inactive',
    [403, 404].includes(
      (
        await care(tokens[1], {
          command: 'receive',
          reservationId: b.id,
          requestId: randomUUID(),
          attested: true,
        })
      ).status,
    ),
  );
  env.sql(
    `update public.barbershop_memberships set role='barber' where id=${q(memberA)};update public.barbershop_memberships set status='active' where id=${q(memberB)};`,
  );
  check(
    'new-memberships-exactly-restored',
    env.sql(
      `select row_to_json(m) from public.barbershop_memberships m where id=${q(memberA)};`,
    ) === originalA &&
      env.sql(
        `select row_to_json(m) from public.barbershop_memberships m where id=${q(memberB)};`,
      ) === originalB,
  );
  check(
    'admin-receive-Yape',
    (
      await care(tokens[2], {
        command: 'receive',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
      })
    ).status === 200,
  );
  check(
    'cannot-refund-before-cancellation',
    (
      await care(tokens[2], {
        command: 'refund',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
        reason: '005 rechazo',
      })
    ).status === 409,
  );
  check(
    'cancel-new-only',
    (
      await env.post(
        tokens[2],
        '/functions/v1/reservation-command',
        {
          action: 'cancel',
          reservationId: b.id,
          requestId: randomUUID(),
          reason: '005 control',
        },
        'http://localhost:8081',
      )
    ).status === 200,
  );
  check(
    'refund-requires-reason',
    (
      await care(tokens[2], {
        command: 'refund',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
        reason: ' ',
      })
    ).status === 400,
  );
  check(
    'barber-cannot-refund',
    (
      await care(tokens[1], {
        command: 'refund',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
        reason: '005 rechazo',
      })
    ).status === 403,
  );
  check(
    'admin-full-refund-audited',
    (
      await care(tokens[2], {
        command: 'refund',
        reservationId: b.id,
        requestId: randomUUID(),
        attested: true,
        reason: '005 devolución total ficticia; no dinero',
      })
    ).status === 200,
  );
  const after = originalDigest();
  report.originalDataIntact = Object.entries(m.baseline).every(([t, rows]) =>
    rows.every(
      (h) =>
        after[t].filter((v) => v === h).length >=
        rows.filter((v) => v === h).length,
    ),
  );
  check('all-original-rows-still-preserved', report.originalDataIntact);
  report.additionalCompleted = true;
} catch (e) {
  report.additionalFailure = e instanceof Error ? e.message : 'FAILED';
  process.exitCode = 1;
} finally {
  // Only the two new membership rows are eligible; restore even on a failed assertion.
  env.sql(
    `update public.barbershop_memberships set role='barber' where id=${q(memberA)} and user_id=${q(m.accounts[1])};update public.barbershop_memberships set status='active' where id=${q(memberB)} and user_id=${q(m.accounts[1])};`,
  );
  report.fixtureRecords = m.bookings.map((v) => ({
    id: v.id,
    purpose: v.purpose,
    state: JSON.parse(
      env.sql(
        `select json_build_object('reservation',r.state,'attendance',c.attendance,'payment',c.payment_status) from public.reservations r join private.booking_care c on c.reservation_id=r.id where r.id=${q(v.id)};`,
      ),
    ),
  }));
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      additionalCompleted: report.additionalCompleted ?? false,
      failure: report.additionalFailure ?? null,
      totalChecks: report.checks.length,
      originalDataIntact: report.originalDataIntact,
      manualFixturesPreserved: report.fixtureRecords
        .filter((v) => v.purpose.startsWith('manual'))
        .every(
          (v) =>
            v.state.reservation === 'confirmed' &&
            v.state.attendance === 'confirmed' &&
            v.state.payment === 'pending',
        ),
    }),
  );
}
