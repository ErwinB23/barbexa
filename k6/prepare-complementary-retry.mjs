// Explicit preparation only. Never imports/spawns the k6 runner or sends business writes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { ownedLab, root, lab } from './lib/lab-client.mjs';
import { sqlId as q } from './lib/fixture-values.mjs';
import {
  retryWrites,
  buildWrites,
  validateComplementary,
} from './lib/complementary.mjs';

if (process.argv.length !== 3 || process.argv[2] !== '--prepare-reviewed-25')
  throw Error('EXPLICIT_REVIEWED_RETRY_REQUIRED');
const seriesId = '71e00e3c-28eb-4262-80ce-7abe043c49ed';
const attemptId = 'dd8f7bd1-42b8-4b6a-8693-106667fc4eef';
const dir = path.join(lab, 'complementary', seriesId);
const manifestFile = path.join(dir, 'manifest.json');
let fixtureFile = path.join(dir, 'fixtures-25.json');
const sourceDir = path.join(
  root,
  '.artifacts/k6/complementary',
  seriesId,
  '25',
  attemptId,
);
const read = (f) => JSON.parse(fs.readFileSync(f));
const sha = (f) =>
  createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const walk = (d) =>
  fs.existsSync(d)
    ? fs
        .readdirSync(d, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)],
        )
    : [];
const preserved = () =>
  Object.fromEntries(
    [
      ...walk(path.join(root, '.artifacts/k6/campaigns')),
      ...walk(path.join(root, '.artifacts/k6/runs')),
      ...walk(path.join(root, '.artifacts/k6/complementary')),
      ...Object.keys(
        read(
          path.join(
            root,
            'docs/evaluacion/evidencias/004-reservas/k6-final/preservacion-sha256.json',
          ),
        ).sha256,
      ).map((f) => path.join(root, f)),
      path.join(root, 'k6/lib/cli-policy.mjs'),
      path.join(root, 'k6/lib/resources.mjs'),
      path.join(root, 'k6/lib/profiles.mjs'),
      path.join(root, 'k6/scripts/booking-api.js'),
      ...walk(path.join(root, 'supabase')),
      ...walk(path.join(root, 'src')),
      ...walk(path.join(root, 'specs')),
      ...walk(path.join(root, '.github')),
      path.join(root, '.specify/memory/constitution.md'),
      fixtureFile,
    ].map((f) => [path.relative(root, f).replaceAll('\\', '/'), sha(f)]),
  );
const lock = path.join(dir, 'operator.lock');
const fd = fs.openSync(lock, 'wx');
let changed = false;
try {
  const original = fs.readFileSync(manifestFile),
    m = JSON.parse(original);
  if (
    m.retry?.sourceOutput === m.levels[25]?.output &&
    m.retry.state === 'ready'
  ) {
    console.log(
      'Reintento revisado ya preparado; no se modifica ni se ejecuta carga.',
    );
  } else {
    assert.ok(
      m.retry?.state === 'consumed' && !m.inProgress,
      'EXISTING_RETRY_REQUIRES_NEW_REVIEW',
    );
    fixtureFile = path.join(dir, 'fixtures-25-retry-' + m.retry.id + '.json');
    const f = read(fixtureFile);
    assert.equal(m.id, seriesId);
    assert.equal(m.levels[25]?.passed, false);
    assert.equal(m.levels[25]?.recovered, true);
    assert.equal(path.resolve(root, m.levels[25].output), sourceDir);
    assert.ok(!m.levels[50] && !m.levels[100], 'LATER_LEVEL_ALREADY_ATTEMPTED');
    const result = read(path.join(sourceDir, 'result.json'));
    assert.equal(result.exit, 108);
    assert.equal(result.before.reservations, 108);
    assert.equal(result.after.reservations, 1349);
    assert.equal(
      read(path.join(sourceDir, 'write-integrity.json')).acceptedWrites,
      1235,
    );
    const hashes = preserved();
    const env = ownedLab({ recordBaseline: false });
    assert.equal(
      env.sql(
        'begin read only;select run_id from private.k6_lab_marker;rollback;',
      ),
      m.runId,
    );
    assert.equal(f.runId, m.runId);
    validateComplementary(f, 25);
    assert.deepEqual(
      f.complementary.writes,
      read(path.join(dir, 'retry-' + m.retry.id, 'writes.json')),
    );
    const seeds = Object.values(m.seeds).map(q).join(','),
      shops = f.tenants.map((t) => q(t.id)).join(',');
    const rows = JSON.parse(
      env.sql(
        `begin read only;set local statement_timeout='15s';select coalesce(json_agg(json_build_object('id',r.id,'requestId',r.request_id,'actor',r.client_user_id,'shop',r.barbershop_id,'barber',r.barber_id,'start',r.starts_at,'state',r.state,'total',r.total_amount,'items',(select count(*) from public.reservation_items i where i.reservation_id=r.id),'events',(select count(*) from public.reservation_events e where e.reservation_id=r.id and e.kind='confirmed'),'pendingCash',(select count(*) from private.booking_care b where b.reservation_id=r.id and b.method='cash' and b.payment_status='pending'))),'[]') from public.reservations r where r.barbershop_id in (${shops}) and r.id not in (${seeds});rollback;`,
      ),
    );
    assert.equal(rows.length, 1245, 'REVIEWED_RESERVATIONS_CHANGED');
    const index = new Map(
      m.work[25].map((w, i) => [w.body.requestId, { i, w, position: i % 160 }]),
    );
    f.complementary.writes.forEach((w, i) =>
      index.set(w.body.requestId, {
        i,
        w,
        position: f.complementary.replacementSlots?.[i] ?? i % 160,
      }),
    );
    const tailStarts = {},
      occupied = [];
    const consumed = [
      ...new Set(
        rows.map((r) => {
          const match = index.get(r.requestId),
            i = match?.i,
            w = match?.w;
          assert.ok(
            w &&
              r.actor === f.actors[w.actorIndex].id &&
              r.shop === w.body.barbershopId &&
              r.barber === w.body.barberId &&
              Date.parse(r.start) === Date.parse(w.body.startsAt),
          );
          assert.ok(
            r.state === 'confirmed' &&
              Number(r.total) === 15 &&
              r.items === 1 &&
              r.events === 1 &&
              r.pendingCash === 1,
            'EXISTING_RESERVATION_CHANGED',
          );
          occupied.push(w);
          if (match.position >= 480)
            tailStarts[w.actorIndex] = Math.max(
              tailStarts[w.actorIndex] ?? 480,
              match.position + 1,
            );
          return i;
        }),
      ),
    ];
    const plan = retryWrites(
      f.actors,
      f.tenants,
      m.work[25],
      consumed,
      randomUUID,
      tailStarts,
    );
    const all = [
      ...occupied,
      ...plan.writes,
      ...buildWrites(50, f.actors, f.tenants),
      ...buildWrites(100, f.actors, f.tenants),
    ];
    const clients = new Set(),
      professionals = new Set(),
      requests = new Set();
    for (const w of all)
      for (const [set, key] of [
        [clients, f.actors[w.actorIndex].id + w.body.startsAt],
        [professionals, w.body.barberId + w.body.startsAt],
        [requests, w.body.requestId],
      ]) {
        assert.ok(!set.has(key), 'CROSS_LEVEL_OVERLAP');
        set.add(key);
      }
    // Validate all proposed 25-VU slots against real existing reservations without modifying them.
    const planned = plan.writes.map((w) => ({
      actor: f.actors[w.actorIndex].id,
      barber: w.body.barberId,
      start: w.body.startsAt,
    }));
    const payload = JSON.stringify(planned).replaceAll("'", "''");
    const overlaps = Number(
      env.sql(
        `begin read only;set local statement_timeout='15s';select count(*) from jsonb_to_recordset('${payload}'::jsonb) as p(actor uuid,barber uuid,start timestamptz) join public.barber_profiles b on b.id=p.barber join public.reservations r on r.state='confirmed' and r.occupied && tstzrange(p.start,p.start+interval '15 minutes','[)') and (r.client_user_id in(p.actor,b.user_id) or r.barber_user_id in(p.actor,b.user_id));rollback;`,
      ),
    );
    assert.equal(overlaps, 0, 'RETRY_OVERLAPS_EXISTING_RESERVATIONS');
    const integrity = JSON.parse(
      env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
    );
    assert.equal(integrity.reservations, 1349);
    assert.ok(
      Object.entries(integrity).every(
        ([k, v]) => k === 'reservations' || v === 0,
      ),
    );
    const retryId = randomUUID(),
      archive = path.join(dir, 'retry-' + retryId);
    fs.mkdirSync(archive);
    fs.writeFileSync(path.join(archive, 'manifest-before.json'), original, {
      flag: 'wx',
    });
    fs.copyFileSync(
      fixtureFile,
      path.join(archive, 'fixtures-25-before.json'),
      fs.constants.COPYFILE_EXCL,
    );
    fs.writeFileSync(
      path.join(archive, 'writes.json'),
      JSON.stringify(plan.writes),
      { flag: 'wx' },
    );
    fs.writeFileSync(
      path.join(archive, 'preservation.json'),
      JSON.stringify(hashes, null, 2),
      { flag: 'wx' },
    );
    m.history ??= {};
    m.history[25] ??= [];
    m.history[25].push(structuredClone(m.levels[25]));
    m.retryHistory ??= [];
    m.retryHistory.push(structuredClone(m.retry));
    m.fixtureLimits = { maxFuturePerClient: 600 };
    m.labRequirements = { edgeRuntimePolicy: 'oneshot' };
    m.retry = {
      id: retryId,
      level: 25,
      state: 'ready',
      sourceOutput: m.levels[25].output,
      sourceAttemptId: attemptId,
      replacementSlots: plan.replacementSlots,
      preservedReservationIds: rows.map((r) => r.id),
      baselineReservations: 1349,
      createdAt: new Date().toISOString(),
    };
    assert.ok(
      Object.entries(hashes).every(([f, h]) => sha(path.join(root, f)) === h),
      'PRESERVED_CONTENT_CHANGED',
    );
    fs.writeFileSync(manifestFile, JSON.stringify(m, null, 2) + '\n');
    changed = true;
    const report = {
      at: new Date().toISOString(),
      series: seriesId,
      sourceAttempt: attemptId,
      retry: retryId,
      prepared: true,
      k6Executed: false,
      businessWrites: 0,
      preservedReservations: 1245,
      lastAttemptCommitted: 1241,
      lastAttemptAcceptedByK6: 1235,
      committedAfterAbortNotCountedAsSuccess: 6,
      consumedIndices: consumed.sort((a, b) => a - b),
      replacementSlots: plan.replacementSlots,
      remainingOriginal25AssignmentsUnchanged: 4000 - consumed.length,
      level50AssignmentsUnchanged: true,
      level100AssignmentsUnchanged: true,
      realPlannedOverlaps: overlaps,
      integrity,
      preservedFiles: Object.keys(hashes).length,
      allPreservedHashesMatch: Object.entries(hashes).every(
        ([f, h]) => sha(path.join(root, f)) === h,
      ),
      originalFixtureUnchanged:
        sha(fixtureFile) === sha(path.join(archive, 'fixtures-25-before.json')),
      resourcePolicyUnchanged: true,
      stableSecondsPerLevel: 600,
      runtimePolicyRequired: 'oneshot',
      fixturePendingReservationLimit: {
        before: 500,
        prepared: 600,
        appliesOnlyToSyntheticShops: true,
        qualityThresholdsUnchanged: true,
      },
    };
    fs.writeFileSync(
      path.join(
        root,
        'docs/evaluacion/evidencias/004-reservas/sprint2-closure/retry2-preparation.json',
      ),
      JSON.stringify(report, null, 2) + '\n',
    );
    console.log(
      JSON.stringify(
        {
          prepared: report.prepared,
          retry: report.retry,
          preservedReservations: report.preservedReservations,
          reassignedCases: consumed.length,
          realPlannedOverlaps: report.realPlannedOverlaps,
          allPreservedHashesMatch: report.allPreservedHashesMatch,
          k6Executed: false,
        },
        null,
        2,
      ),
    );
  }
} finally {
  fs.closeSync(fd);
  fs.unlinkSync(lock);
  if (!changed) console.log('Sin escrituras de negocio ni ejecución de k6.');
}
