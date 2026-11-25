import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCore } from './load-core.mjs';
import { id } from './booking-payload-fixture.mjs';
const file =
  'supabase/functions/_shared/barbershop-operation/domain/team-authority.ts';
test('new Edge commands are rejected without explicit extension activation', async () => {
  const { executeOperation } = loadCore(
    'supabase/functions/_shared/barbershop-operation/application/operation.ts',
  );
  await assert.rejects(
    executeOperation(
      {},
      { userId: id(5) },
      { action: 'read-team-authority', barbershopId: id(1) },
    ),
    (e) => e.code === 'FORBIDDEN',
  );
});
test('fixed permissions exclude secondary escalation, refunds, publication and team management', () => {
  const { authorityPermissions } = loadCore(file);
  for (const capacity of [
    'owner',
    'secondary',
    'barber',
    'client',
    'unregularized',
  ]) {
    const p = authorityPermissions(capacity);
    assert.equal(p.manageAdministrators, capacity === 'owner');
    assert.equal(p.transferOwnership, capacity === 'owner');
    assert.equal(p.manageTeam, capacity === 'owner');
    assert.equal(p.refund, capacity === 'owner');
    assert.equal(p.editServices, ['owner', 'secondary'].includes(capacity));
  }
});
test('closed commands reject payload roles, self proclamation and ambiguous retirement', () => {
  const { parseAuthorityCommand } = loadCore(file);
  const base = { action: 'read-team-authority', barbershopId: id(1) };
  assert.equal(parseAuthorityCommand(base).barbershopId, id(1));
  for (const key of ['ownerId', 'role', 'userId', 'permissions'])
    assert.throws(() => parseAuthorityCommand({ ...base, [key]: 'owner' }));
  const remove = {
    action: 'remove-secondary',
    barbershopId: id(1),
    requestId: id(2),
    memberUserId: id(3),
    expectedVersion: 1,
    disposition: 'barber',
    reason: 'Conservar trabajo',
  };
  assert.equal(parseAuthorityCommand(remove).disposition, 'barber');
  assert.throws(() =>
    parseAuthorityCommand({ ...remove, disposition: undefined }),
  );
  assert.throws(() => parseAuthorityCommand({ ...remove, reason: '' }));
  assert.throws(() => parseAuthorityCommand({ ...remove, expectedVersion: 0 }));
});
test('transfer initiation is bounded; final acceptance is explicitly blocked until previous owner rules are approved', async () => {
  const { executeAuthority } = loadCore(
    'supabase/functions/_shared/barbershop-operation/application/team-authority.ts',
  );
  let calls = 0;
  await assert.rejects(
    executeAuthority(
      {
        execute: async () => {
          calls++;
        },
      },
      { userId: id(5) },
      {
        action: 'accept-ownership-transfer',
        barbershopId: id(1),
        requestId: id(2),
        transferId: id(3),
        expectedVersion: 1,
      },
    ),
    (e) => e.code === 'CONFLICT',
  );
  assert.equal(calls, 0);
});
test('server delegates atomic writes to the persistence port with verified actor, not a client identity', async () => {
  const { executeAuthority } = loadCore(
    'supabase/functions/_shared/barbershop-operation/application/team-authority.ts',
  );
  const seen = [];
  const input = {
    action: 'remove-secondary',
    barbershopId: id(1),
    requestId: id(2),
    memberUserId: id(3),
    expectedVersion: 1,
    disposition: 'barber',
    reason: 'Conservar trabajo',
  };
  await executeAuthority(
    {
      execute: async (actor, command) => {
        seen.push({ actor, command });
        return { ok: true };
      },
    },
    { userId: id(5) },
    input,
  );
  assert.equal(seen[0].actor.userId, id(5));
  assert.equal(seen[0].command.memberUserId, id(3));
});
test('persistence adapter sends verified identity to the same backend and sanitizes unexpected errors', async () => {
  const { createTeamAuthorityPersistence } = loadCore(
    'supabase/functions/_shared/barbershop-operation/infrastructure/team-authority-adapter.ts',
  );
  const seen = [];
  const command = { action: 'read-team-authority', barbershopId: id(1) };
  const port = createTeamAuthorityPersistence({
    baseUrl: 'https://same-project.supabase.co',
    serviceKey: 'sb_secret_fixture',
    fetcher: async (url, options) => {
      seen.push({ url, options });
      return { ok: true, json: async () => ({ ok: true }) };
    },
  });
  await port.execute({ userId: id(5) }, command);
  assert.equal(
    seen[0].url,
    'https://same-project.supabase.co/rest/v1/rpc/team_authority_command',
  );
  assert.equal(JSON.parse(seen[0].options.body).p_actor_id, id(5));
  assert.equal(seen[0].options.headers.Authorization, undefined);
  const denied = createTeamAuthorityPersistence({
    baseUrl: 'https://same-project.supabase.co',
    serviceKey: 'sb_secret_fixture',
    fetcher: async () => ({
      ok: false,
      json: async () => ({ message: 'sensitive unexpected database error' }),
    }),
  });
  await assert.rejects(
    denied.execute({ userId: id(5) }, command),
    (e) =>
      e.code === 'DEPENDENCY_UNAVAILABLE' && !String(e).includes('sensitive'),
  );
});
