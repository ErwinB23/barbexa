import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Buffer } from 'node:buffer';
import { loadCore, createCoreLoader } from './load-core.mjs';
import { id } from './booking-payload-fixture.mjs';
import { teamAuthorityLocalEnvironment } from '../../../scripts/team-authority-local-profile.mjs';
const scope = () => ({
  userId: id(1),
  barbershopId: id(2),
  generation: 1,
  role: 'administrator',
});
const owner = (version = 1) => ({
  revision: '20261120010538',
  userId: id(1),
  barbershopId: id(2),
  capacity: 'owner',
  version,
  secondaryCount: 1,
  permissions: Object.fromEntries(
    [
      'manageAdministrators',
      'transferOwnership',
      'manageTeam',
      'publish',
      'refund',
      'editServices',
      'editHours',
      'manageReservations',
      'confirmPayment',
    ].map((k) => [k, true]),
  ),
});
test('2D process preparation leaves inherited Cloud config intact and rejects privileged keys', () => {
  const inherited = {
    EXPO_PUBLIC_APP_ENVIRONMENT: 'cloud-integration',
    EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY: 'cloud',
    OTHER: 'preserved',
  };
  const result = teamAuthorityLocalEnvironment(
    inherited,
    'sb_publishable_fixture',
  );
  assert.equal(inherited.EXPO_PUBLIC_APP_ENVIRONMENT, 'cloud-integration');
  assert.equal(result.EXPO_PUBLIC_APP_ENVIRONMENT, 'local-team-authority');
  assert.equal(result.OTHER, 'preserved');
  assert.equal(result.EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY, undefined);
  const jwt = (role) =>
    `header.${Buffer.from(JSON.stringify({ iss: 'supabase-demo', role })).toString('base64url')}.signature`;
  assert.throws(() =>
    teamAuthorityLocalEnvironment(inherited, jwt('service_role')),
  );
  assert.throws(() =>
    teamAuthorityLocalEnvironment(inherited, 'sb_secret_fixture'),
  );
  assert.equal(
    teamAuthorityLocalEnvironment(inherited, jwt('anon'))
      .EXPO_PUBLIC_ENABLE_GOOGLE,
    'false',
  );
});
test('2D isolated profile is Web-only, explicit loopback, distinct session namespace and rejects Cloud targets', () => {
  const { registrationEnvironment: resolve } = loadCore(
    'src/composition/registration-environment.ts',
  );
  const input = {
    development: true,
    platform: 'web',
    environment: 'local-team-authority',
    publicKey: 'sb_publishable_fixture',
    webOrigin: 'http://localhost:8081',
    apiUrl: 'http://127.0.0.1:54421',
  };
  const value = resolve(input);
  assert.equal(value.project, 'app-barberia-002-local');
  assert.equal(value.environment, 'local-team-authority');
  for (const change of [
    { development: false },
    { platform: 'android' },
    { apiUrl: undefined },
    { apiUrl: 'https://vuoncrtkkkquvddunrxx.supabase.co' },
    { apiUrl: 'http://127.0.0.1:54321' },
    { webOrigin: 'http://localhost:8082' },
  ])
    assert.throws(() => resolve({ ...input, ...change }));
});
test('2D pinned LOCAL transport never forwards a token to Cloud, another LOCAL port or redirects', async () => {
  const { createPinnedProjectFetch } = loadCore(
    'src/features/authentication/infrastructure/project-transport.ts',
  );
  const seen = [];
  const send = createPinnedProjectFetch(
    'http://127.0.0.1:54421',
    async (...args) => {
      seen.push(args);
      return new Response('{}');
    },
    true,
  );
  await send('http://127.0.0.1:54421/functions/v1/barbershop-operation', {
    headers: { Authorization: 'fixture' },
  });
  assert.equal(seen[0][1].redirect, 'error');
  for (const url of [
    'https://vuoncrtkkkquvddunrxx.supabase.co/rest/v1/profiles',
    'http://127.0.0.1:54321/auth/v1/user',
    'http://localhost:54421/auth/v1/user',
    'http://127.0.0.1:54421/storage/v1/object',
  ])
    await assert.rejects(send(url));
  assert.equal(seen.length, 1);
});
test('2D refreshing verified capabilities does not unmount the active administrative screen; failed revalidation closes it', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  let next = async () => owner();
  const app = createTeamAuthority({
    scope,
    gateway: { getAuthority: () => next() },
  });
  await app.read();
  let reject;
  next = () =>
    new Promise((_, r) => {
      reject = r;
    });
  const pending = app.read(true);
  assert.equal(app.getSnapshot().phase, 'ready');
  assert.equal(app.getSnapshot().value.capacity, 'owner');
  await Promise.resolve();
  reject(Error('offline'));
  await pending;
  assert.equal(app.getSnapshot().phase, 'error');
  assert.equal(app.getSnapshot().value, null);
});
test('2D initial management reuses the verified capability request and omits roster for secondaries', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  const { createOperationApplication } = loadCore(
    'src/features/barbershop-operation/application/operation-application.ts',
  );
  let reads = 0,
    includeTeam,
    secondary = false;
  const authority = createTeamAuthority({
    scope,
    gateway: {
      getAuthority: async () => {
        reads++;
        if (!secondary) return owner();
        const value = owner();
        return {
          ...value,
          capacity: 'secondary',
          secondaryCount: null,
          permissions: {
            ...value.permissions,
            manageTeam: false,
            manageAdministrators: false,
            transferOwnership: false,
            refund: false,
            publish: false,
          },
        };
      },
    },
  });
  await authority.read();
  const app = createOperationApplication({
    authority,
    scope,
    createShop: async () => {},
    gateway: {
      getManagement: async (_, team) => {
        includeTeam = team;
        return {};
      },
    },
  });
  await app.load();
  assert.equal(reads, 1);
  assert.equal(includeTeam, true);
  secondary = true;
  await authority.read(true);
  await app.load();
  assert.equal(includeTeam, false);
  assert.equal(reads, 2);
});
test('2D server denial immediately invalidates displayed authority and late data cannot re-enable it', async () => {
  const load = createCoreLoader();
  const { createTeamAuthority } = load(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  const { createOperationApplication } = load(
    'src/features/barbershop-operation/application/operation-application.ts',
  );
  const { BusinessError } = load(
    'src/features/barbershop-operation/domain/values.ts',
  );
  const authority = createTeamAuthority({
    scope,
    gateway: { getAuthority: async () => owner() },
  });
  await authority.read();
  const app = createOperationApplication({
    authority,
    scope,
    createShop: async () => {},
    gateway: {
      getManagement: async () => {
        throw new BusinessError('FORBIDDEN');
      },
    },
  });
  await assert.rejects(app.load(), (e) => e.code === 'FORBIDDEN');
  assert.equal(authority.getSnapshot().value, null);
  assert.equal(authority.getSnapshot().phase, 'error');
});
test('2D uncertain command cannot change its recipient and revoked ownership cannot dispatch its retry', async () => {
  const load = createCoreLoader();
  const { createTeamAuthority } = load(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  const { BusinessError } = load(
    'src/features/barbershop-operation/domain/values.ts',
  );
  let allowed = true,
    calls = 0;
  const authority = createTeamAuthority({
    scope,
    gateway: {
      getAuthority: async () => {
        if (!allowed) throw new BusinessError('FORBIDDEN');
        return owner();
      },
      commandAuthority: async () => {
        calls++;
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      },
    },
  });
  const command = {
    action: 'remove-secondary',
    requestId: id(7),
    memberUserId: id(3),
    disposition: 'barber',
    reason: 'Conservar trabajo',
  };
  await assert.rejects(authority.execute(command));
  await assert.rejects(
    authority.execute({ ...command, memberUserId: id(4) }),
    (e) => e.code === 'CONFLICT',
  );
  assert.equal(calls, 1);
  allowed = false;
  await assert.rejects(
    authority.execute(command),
    (e) => e.code === 'FORBIDDEN',
  );
  assert.equal(calls, 1);
  assert.equal(authority.getSnapshot().value, null);
});
test('2D uncertain removal retries the identical version/request, rechecking current authority first', async () => {
  const { createTeamAuthority } = loadCore(
    'src/features/barbershop-operation/application/team-authority.ts',
  );
  const { BusinessError } = loadCore(
    'src/features/barbershop-operation/domain/values.ts',
  );
  let version = 1;
  const sent = [];
  const app = createTeamAuthority({
    scope,
    gateway: {
      getAuthority: async () => owner(version),
      commandAuthority: async (input) => {
        sent.push(input);
        if (sent.length === 1) {
          version++;
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        }
        return { ok: true };
      },
    },
  });
  const input = {
    action: 'remove-secondary',
    requestId: id(7),
    memberUserId: id(3),
    disposition: 'barber',
    reason: 'Conservar perfil profesional',
  };
  await assert.rejects(app.execute(input));
  await app.execute(input);
  assert.equal(sent.length, 2);
  assert.deepEqual(sent[1], sent[0]);
});

for (const transition of [
  'selection',
  'generation',
  'tenant',
  'actor',
  'professional',
])
  for (const outcome of ['success', 'denial'])
    test(`2E.3 stale ${outcome} after ${transition} cannot invalidate current verified authority`, async () => {
      const load = createCoreLoader();
      const { createTeamAuthority } = load(
        'src/features/barbershop-operation/application/team-authority.ts',
      );
      const { createOperationApplication } = load(
        'src/features/barbershop-operation/application/operation-application.ts',
      );
      const { BusinessError } = load(
        'src/features/barbershop-operation/domain/values.ts',
      );
      let current =
        transition === 'selection' ? { userId: id(1), generation: 1 } : scope();
      let settle;
      const authority = createTeamAuthority({
        scope: () => current,
        gateway: {
          getAuthority: async () => ({
            ...owner(),
            userId: current.userId,
            barbershopId: current.barbershopId,
            ...(current.role === 'barber'
              ? {
                  capacity: 'barber',
                  secondaryCount: null,
                  permissions: Object.fromEntries(
                    Object.keys(owner().permissions).map((k) => [k, false]),
                  ),
                }
              : {}),
          }),
        },
      });
      const app = createOperationApplication({
        authority,
        scope: () => current,
        createShop: async () => {},
        gateway: {
          listOwnInvitations: () =>
            new Promise((resolve, reject) => {
              settle =
                outcome === 'success'
                  ? () => resolve([])
                  : () => reject(new BusinessError('FORBIDDEN'));
            }),
        },
      });
      const old = assert.rejects(
        app.listOwnInvitations(),
        (e) => e.code === 'FORBIDDEN',
      );
      current = {
        ...scope(),
        ...(transition === 'generation' ? { generation: 2 } : {}),
        ...(transition === 'tenant' ? { barbershopId: id(3) } : {}),
        ...(transition === 'actor' ? { userId: id(4) } : {}),
        ...(transition === 'professional' ? { role: 'barber' } : {}),
      };
      await authority.read();
      const verified = authority.getSnapshot();
      assert.equal(verified.phase, 'ready');
      settle();
      await old;
      assert.equal(authority.getSnapshot(), verified);
      assert.equal(authority.getSnapshot().scopeKey, authority.scopeKey());
    });
