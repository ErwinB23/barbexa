// Load entrypoint is manual-only; --prepare-only never starts k6.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  provisionRequest,
  nextPreparationLevel,
} from './lib/provision-request.mjs';
import { ownedLab, root, lab } from './lib/lab-client.mjs';
import { sqlId as q } from './lib/fixture-values.mjs';
import {
  levels,
  writeCapacity,
  buildWrites,
  validateComplementary,
  ownReservationsPath,
  assertComplementaryProgress,
} from './lib/complementary.mjs';
import { probe } from './resource-probe.mjs';

const read = (f) => JSON.parse(fs.readFileSync(f));
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
const prepareOnly = process.argv[3] === '--prepare-only';
if (
  process.argv[2] !== '--execute=local-synthetic-lab' ||
  process.argv.length !== (prepareOnly ? 4 : 3)
)
  throw Error('EXPLICIT_LOCAL_MANUAL_EXECUTION_REQUIRED');
const env = ownedLab();
const base = read(path.join(lab, 'fixture-manifest.json'));
if (
  env.sql('select run_id from private.k6_lab_marker;') !== base.runId ||
  base.accounts.length < 522
)
  throw Error('LOCAL_SOURCE_FIXTURES_REQUIRED');
const activeFile = path.join(lab, 'complementary-active.json');
const id = fs.existsSync(activeFile) ? read(activeFile).id : randomUUID();
if (!/^[a-f0-9-]{36}$/.test(id)) throw Error('INVALID_SERIES');
const dir = path.join(lab, 'complementary', id);
fs.mkdirSync(dir, { recursive: true });
const lock = path.join(dir, 'operator.lock');
let fd;
try {
  fd = fs.openSync(lock, 'wx');
} catch {
  throw Error('COMPLEMENTARY_OPERATOR_ALREADY_RUNNING_CHECK_LOCK');
}
write(activeFile, { id });
const file = path.join(dir, 'manifest.json');
const m = fs.existsSync(file)
  ? read(file)
  : {
      id,
      runId: base.runId,
      shops: [],
      tenants: [],
      sessions: {},
      seeds: {},
      levels: {},
    };
fs.writeSync(
  fd,
  JSON.stringify({
    pid: process.pid,
    series: id,
    startedAt: new Date().toISOString(),
  }),
);
const save = () => write(file, m);
const preparationLog = path.join(
  dir,
  'provisioning-' +
    new Date().toISOString().replaceAll(':', '-') +
    '-' +
    randomUUID() +
    '.jsonl',
);
let preparingLevel = null;
function verifyLabRequirements() {
  if (m.labRequirements?.edgeRuntimePolicy) {
    const inspection = spawnSync(
      'docker',
      ['inspect', 'supabase_edge_runtime_barbexa-k6-lab'],
      { encoding: 'utf8' },
    );
    if (inspection.status !== 0) throw Error('LAB_RUNTIME_INSPECTION_FAILED');
    const edge = JSON.parse(inspection.stdout)[0];
    if (
      edge.Name !== '/supabase_edge_runtime_barbexa-k6-lab' ||
      !edge.State.Running ||
      !edge.Config.Cmd.join(' ').includes(
        '--policy=' + m.labRequirements.edgeRuntimePolicy,
      )
    )
      throw Error('LAB_RUNTIME_POLICY_NOT_READY');
  }
}
save();
async function request(resource, options) {
  return await provisionRequest(env.request, resource, options, {
    emit: (event) => {
      fs.appendFileSync(
        preparationLog,
        JSON.stringify({
          at: new Date().toISOString(),
          level: preparingLevel,
          ...event,
        }) + '\n',
      );
      if (event.phase === 'retry')
        console.log(
          `Preparación ${preparingLevel}: ${event.action ?? event.endpoint}, ${event.code}; reintento acotado fuera de medición.`,
        );
    },
  });
}
function expect(r, status, name) {
  if (r.status !== status) throw Error(name + ':HTTP_' + r.status);
  return r.body;
}
async function session(index, remaining = 1800) {
  const a = base.accounts[index];
  if (!a?.id || a.email !== `k6-${base.runId}-${index}@example.invalid`)
    throw Error('FOREIGN_ACCOUNT');
  let s = m.sessions[index];
  if (!s || s.expires_at < Date.now() / 1000 + remaining) {
    s = expect(
      await request('/auth/v1/token?grant_type=password', {
        body: { email: a.email, password: a.password },
      }),
      200,
      'AUTH',
    );
    if (s.user.id !== a.id) throw Error('AUTH_IDENTITY_MISMATCH');
    m.sessions[index] = s;
    save();
  }
  return s.access_token;
}
async function prepare(level) {
  preparingLevel = level;
  if (!probe('fixtures', level).allowed)
    throw Error('CRITICAL_RESOURCE_PRESSURE');
  for (let t = 0; t < 2; t++) {
    const token = await session(t);
    if (!m.shops[t]) {
      m.shops[t] = expect(
        await request('/functions/v1/create-barbershop', {
          token,
          body: { name: `K6 complementary ${id} ${t}` },
        }),
        201,
        'SHOP',
      ).barbershop.id;
      save();
    }
    const shop = m.shops[t];
    if (
      env.sql(
        `select owner_user_id from private.barbershop_ownership where barbershop_id=${q(shop)};`,
      ) !== base.accounts[t].id
    )
      throw Error('FOREIGN_SHOP');
    const op = async (body) =>
      expect(
        await request('/functions/v1/barbershop-operation', {
          token,
          body: { barbershopId: shop, ...body },
        }),
        200,
        body.action,
      );
    if (!m.tenants[t]) {
      const existingService = env.sql(
        `select id from public.services where barbershop_id=${q(shop)} and name='Synthetic 15 minute service';`,
      );
      const service =
        existingService ||
        (
          await op({
            action: 'upsert-service',
            name: 'Synthetic 15 minute service',
            category: 'Corte de cabello',
            description: 'Isolated complementary workload',
            price: { amountMinor: 1500, currency: 'PEN' },
            durationMin: 15,
            active: true,
          })
        ).id;
      const barbers = Array.from({ length: 10 }, randomUUID);
      m.tenants[t] = {
        id: shop,
        serviceId: service,
        barberId: barbers[0],
        barberIds: barbers,
        localDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      };
      save();
    }
    const tenant = m.tenants[t];
    if (!m.professionalsReady?.[t]) {
      const setup = tenant.barberIds
        .map((b, i) => {
          const user = base.accounts[502 + t * 10 + i].id;
          return `insert into public.barbershop_memberships(user_id,barbershop_id,role,status) values(${q(user)},${q(shop)},'barber','active') on conflict(user_id,barbershop_id) do nothing;insert into public.barber_profiles(id,barbershop_id,user_id,professional_name,active) values(${q(b)},${q(shop)},${q(user)},'Synthetic professional ${t}-${i}',true) on conflict(id) do nothing;insert into public.barber_services(barbershop_id,barber_id,service_id,active) values(${q(shop)},${q(b)},${q(tenant.serviceId)},true) on conflict do nothing;`;
        })
        .join('');
      // One atomic fixture transaction; ordinary product schema/constraints unchanged.
      env.sql('begin;' + setup + 'commit;');
      m.professionalsReady ||= {};
      m.professionalsReady[t] = true;
      save();
    }
    await op({
      action: 'configure-shop',
      publicContact: 'Synthetic local',
      address: 'Synthetic local',
      policies: {
        minimumNoticeMin: 0,
        bookingHorizonDays: 90,
        maxFuturePerClient: m.fixtureLimits?.maxFuturePerClient ?? 500,
        slotStepMin: 15,
        bufferMin: 0,
        cancellationAdvanceMin: 120,
      },
    });
    const hours = Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      opensMin: 540,
      closesMin: 1080,
    }));
    await op({ action: 'set-shop-hours', hours });
    for (const barberId of tenant.barberIds)
      await op({ action: 'set-barber-hours', barberId, hours });
    await op({ action: 'set-publication', state: 'published' });
  }
  const actors = [];
  for (let vu = 0; vu < 100; vu++) {
    const a = {
      id: base.accounts[vu + 2].id,
      tenant: vu % 2,
      token: await session(vu + 2),
    };
    const tenant = m.tenants[a.tenant];
    if (!m.seeds[vu]) {
      // Initial nonempty own-reservations volume, before measured operations.
      const startsAt = new Date(
        Date.parse(tenant.localDate + 'T14:00:00.000Z') +
          Math.floor(vu / 20) * 900000,
      ).toISOString();
      const requestId = m.seedRequests?.[vu] || randomUUID();
      m.seedRequests ||= {};
      m.seedRequests[vu] = requestId;
      save();
      const r = await request('/functions/v1/reservation-command', {
        token: a.token,
        body: {
          action: 'confirm',
          requestId,
          barbershopId: tenant.id,
          barberId: tenant.barberIds[Math.floor(vu / 2) % 10],
          serviceIds: [tenant.serviceId],
          startsAt,
          paymentMethod: 'cash',
        },
      });
      if (![200, 201].includes(r.status))
        throw Error('SEED_CONFIRM_HTTP_' + r.status);
      m.seeds[vu] = r.body.id;
      save();
    }
    actors.push(a);
  }
  if (
    actors.some(
      (a) =>
        JSON.parse(Buffer.from(a.token.split('.')[1], 'base64url')).exp <
        Date.now() / 1000 + 1300,
    )
  )
    throw Error('AUTH_PREPARATION_TOO_SLOW_RENEW_BEFORE_MEASUREMENT');
  const retry = level === 25 ? m.retry : null;
  if (retry && !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(retry.id))
    throw Error('INVALID_RETRY_ID');
  const fixtureFile = path.join(
    dir,
    retry
      ? `fixtures-${level}-retry-${retry.id}.json`
      : `fixtures-${level}.json`,
  );
  if (!m.work) m.work = {};
  if (!m.work[level]) {
    m.work[level] = buildWrites(level, actors, m.tenants);
    save();
  }
  const f = {
    runId: base.runId,
    publicKey: env.publicKey,
    actors,
    tenants: m.tenants,
    writes: [],
    complementary: {
      level,
      capacity: writeCapacity,
      writes: retry
        ? read(path.join(dir, `retry-${retry.id}`, 'writes.json'))
        : m.work[level],
      ...(retry ? { replacementSlots: retry.replacementSlots } : {}),
      series: id,
    },
  };
  validateComplementary(f, level);
  write(fixtureFile, f);
  return fixtureFile;
}
try {
  verifyLabRequirements();
  if (prepareOnly) {
    const pending = nextPreparationLevel(m);
    if (pending === null) {
      console.log(
        'Todos los niveles mixtos están aprobados; no se prepara ni repite ninguno.',
      );
    } else {
      const f = read(await prepare(pending));
      const a = f.actors[0],
        t = f.tenants[a.tenant];
      const catalog = expect(
        await request('/rest/v1/rpc/get_booking_catalog', {
          token: a.token,
          body: { p_barbershop_id: t.id },
        }),
        200,
        'CATALOG',
      );
      const slots = expect(
        await request('/rest/v1/rpc/list_booking_slots', {
          token: a.token,
          body: {
            p_barbershop_id: t.id,
            p_local_date: t.localDate,
            p_service_ids: [t.serviceId],
            p_barber_id: t.barberId,
          },
        }),
        200,
        'SLOTS',
      );
      const own = expect(
        await request(ownReservationsPath(a, t), {
          token: a.token,
          method: 'GET',
        }),
        200,
        'OWN_RESERVATIONS',
      );
      if (
        catalog.barbershopId !== t.id ||
        !slots.length ||
        !own.length ||
        own.some((b) => b.client_user_id !== a.id || b.barbershop_id !== t.id)
      )
        throw Error('COMPLEMENTARY_CONTRACT_PREFLIGHT_FAILED');
      const integrity = JSON.parse(
        env.sql(fs.readFileSync(path.join(root, 'k6/integrity.sql'), 'utf8')),
      );
      if (
        Object.entries(integrity).some(
          ([k, v]) => k !== 'reservations' && v !== 0,
        )
      )
        throw Error('INITIAL_INTEGRITY_FAILED');
      const summary = {
        series: id,
        preparedLevel: pending,
        at: new Date().toISOString(),
        preparedOnly: true,
        k6Executed: false,
        syntheticShops: 2,
        syntheticProfessionals: 20,
        realSessions: 100,
        seedReservations: Object.keys(m.seeds).length,
        catalogStatus: 200,
        slotsStatus: 200,
        ownReservationsStatus: 200,
        integrity,
      };
      write(
        path.join(
          root,
          `docs/evaluacion/evidencias/004-reservas/sprint2-closure/provisioning-${pending}-verification.json`,
        ),
        summary,
      );
      console.log('Preparación y tres contratos verificados; k6 NO ejecutado.');
    }
  } else {
    if (m.inProgress) throw Error('INTERRUPTED_WRITE_ATTEMPT_REQUIRES_REVIEW');
    for (const level of levels) {
      if (m.levels[level]?.passed) {
        console.log(
          `${level} VU ya aprobados en esta serie mixta; se conserva evidencia.`,
        );
        continue;
      }
      assertComplementaryProgress(m, level);
      console.log(
        `Preparando serie mixta ${id}: ${level} VU, 600 s estables; no repite campaña de lectura.`,
      );
      const f = await prepare(level);
      if (level === 25 && m.retry) m.retry.state = 'running';
      m.inProgress = { level, startedAt: new Date().toISOString() };
      save();
      const result = spawnSync(
        process.execPath,
        [
          path.join(root, 'k6/run-lab.mjs'),
          '--execute=local-synthetic-lab',
          `--series=${id}`,
          `--level=${level}`,
          '--mode=complementary',
          `--fixtures=${path.relative(root, f)}`,
        ],
        { cwd: root, stdio: 'inherit' },
      );
      Object.assign(m, read(file));
      delete m.inProgress;
      if (level === 25 && m.retry) m.retry.state = 'consumed';
      save();
      if (result.status !== 0 || !m.levels[level]?.passed)
        throw Error('COMPLEMENTARY_LEVEL_NOT_APPROVED_STOP');
    }
    console.log(
      'Serie mixta finalizada. Evidencia independiente: .artifacts/k6/complementary/' +
        id,
    );
  }
} finally {
  fs.closeSync(fd);
  fs.unlinkSync(lock);
}
