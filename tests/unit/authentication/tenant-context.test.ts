import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuthError } from '../../../src/features/authentication/domain/auth-error.js';
import type { Identity } from '../../../src/features/authentication/domain/identity.js';
import type {
  ContextState,
  MembershipReference,
} from '../../../src/features/authentication/domain/session-state.js';
import { createSessionCoordinator } from '../../../src/features/authentication/application/session-coordinator.js';
const actor = {
  userId: '11111111-1111-4111-8111-111111111111',
  email: 'fixture@example.invalid',
  emailConfirmed: true,
  isAnonymous: false,
} as const;
const a = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  userId: actor.userId,
  barbershopId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  role: 'administrator',
  status: 'active',
} as const;
const b = {
  ...a,
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  barbershopId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  role: 'barber',
} as const;
interface Context {
  resolve(actor: Identity): Promise<void>;
  revalidate(actor: Identity): Promise<void>;
  select(id: unknown): Promise<void>;
  clear(): void;
  getSnapshot(): ContextState;
  subscribe(listener: () => void): () => void;
  dispose(): void;
}
async function fixture() {
  const received: string[] = [];
  const controls = {
    members: async () => [] as readonly MembershipReference[],
    shop: async (id: string) =>
      ({ id, name: id === a.barbershopId ? 'A' : 'B' }) as {
        id: string;
        name: string;
      } | null,
    preferred: null as string | null,
  };
  const target =
    '../../../src/features/authentication/application/' + 'tenant-context.js';
  const { createTenantContext } = await import(target);
  const context: Context = createTenantContext({
    listOwnMemberships: () => controls.members(),
    getBarbershop: (id: string) => controls.shop(id),
    preference: {
      get: async (user: string) => {
        received.push(user);
        return controls.preferred;
      },
      set: async (user: string, id: string) => {
        received.push(user);
        controls.preferred = id;
      },
      remove: async (user: string) => {
        received.push(user);
        controls.preferred = null;
      },
    },
  });
  return { context, controls, received };
}
test('zero memberships is valid and exactly one active authorized membership is selected automatically', async () => {
  const f = await fixture();
  await f.context.resolve(actor);
  assert.equal(f.context.getSnapshot().kind, 'none');
  f.controls.members = async () => [a];
  await f.context.resolve(actor);
  const state = f.context.getSnapshot();
  assert.equal(state.kind, 'selected');
  if (state.kind !== 'selected') assert.fail();
  assert.equal(state.context.role, 'administrator');
  assert.equal(state.context.barbershopId, a.barbershopId);
  assert.ok(f.received.every((id) => id === actor.userId));
});
test('multiple memberships choose and change context without transferring administrator privileges to barber B', async () => {
  const f = await fixture();
  f.controls.members = async () => [a, b];
  await f.context.resolve(actor);
  assert.equal(f.context.getSnapshot().kind, 'choosing');
  await f.context.select(a.barbershopId);
  const pending = f.context.select(b.barbershopId);
  assert.notEqual(f.context.getSnapshot().kind, 'selected');
  await pending;
  const state = f.context.getSnapshot();
  if (state.kind !== 'selected') assert.fail();
  assert.equal(state.context.role, 'barber');
  assert.equal(state.context.barbershopId, b.barbershopId);
});
test('inactive revoked or inaccessible preference is removed and never grants permission', async () => {
  const f = await fixture();
  f.controls.preferred = a.barbershopId;
  f.controls.members = async () => [{ ...a, status: 'inactive' }, b];
  await f.context.resolve(actor);
  const state = f.context.getSnapshot();
  if (state.kind !== 'selected') assert.fail();
  assert.equal(state.context.barbershopId, b.barbershopId);
  f.controls.members = async () => [{ ...b, status: 'inactive' }];
  await f.context.resolve(actor);
  assert.equal(f.context.getSnapshot().kind, 'none');
  assert.equal(f.controls.preferred, null);
});
test('unknown IDs cross-account memberships and server-denied shops never select a tenant', async () => {
  const f = await fixture();
  f.controls.members = async () => [a];
  f.controls.shop = async () => null;
  await f.context.resolve(actor);
  assert.equal(f.context.getSnapshot().kind, 'none');
  await f.context.select(b.barbershopId);
  assert.equal(f.context.getSnapshot().kind, 'error');
  f.controls.members = async () => [
    { ...a, userId: '22222222-2222-4222-8222-222222222222' },
  ];
  await f.context.resolve(actor);
  assert.equal(f.context.getSnapshot().kind, 'error');
});
test('network failure is retryable instead of granting a cached tenant or claiming zero memberships', async () => {
  const f = await fixture();
  f.controls.members = async () => [a];
  await f.context.resolve(actor);
  f.controls.shop = async () => {
    throw new AuthError('network-unavailable');
  };
  await f.context.resolve(actor);
  assert.deepEqual(f.context.getSnapshot(), {
    kind: 'error',
    error: 'network-unavailable',
  });
});
test('foreground revalidation keeps the selected tenant visible until the membership changes', async () => {
  const f = await fixture();
  await f.context.revalidate(actor);
  f.controls.members = async () => [a, b];
  await f.context.resolve(actor);
  await f.context.select(a.barbershopId);
  const selected = f.context.getSnapshot();
  await f.context.revalidate(actor);
  assert.equal(f.context.getSnapshot(), selected);
  let release!: (value: readonly MembershipReference[]) => void;
  f.controls.members = () => new Promise((resolve) => (release = resolve));
  const pending = f.context.revalidate(actor);
  assert.equal(f.context.getSnapshot(), selected);
  release([{ ...a, status: 'inactive' }, b]);
  await pending;
  const updated = f.context.getSnapshot();
  if (updated.kind !== 'selected') assert.fail();
  assert.equal(updated.context.role, 'barber');
  assert.equal(f.controls.preferred, b.barbershopId);
});
test('clear and account changes discard a previous pending membership response', async () => {
  const f = await fixture();
  let release!: (v: readonly MembershipReference[]) => void;
  f.controls.members = () =>
    new Promise((r) => {
      release = r;
    });
  const old = f.context.resolve(actor);
  await Promise.resolve();
  await Promise.resolve();
  f.context.clear();
  release([a]);
  await old;
  assert.equal(f.context.getSnapshot().kind, 'resolving');
  await assert.rejects(() => f.context.select(a.barbershopId));
});
test('selection revalidates membership, and unknown inputs cannot preserve an old selected context', async () => {
  const f = await fixture();
  f.controls.members = async () => [a, b];
  await f.context.resolve(actor);
  await f.context.select(a.barbershopId);
  f.controls.members = async () => [{ ...a, status: 'inactive' }, b];
  await f.context.select(a.barbershopId);
  assert.equal(f.context.getSnapshot().kind, 'error');
  for (const value of [
    null,
    {},
    '',
    { role: 'administrator', barbershopId: b.barbershopId },
  ]) {
    await f.context.select(value);
    assert.equal(f.context.getSnapshot().kind, 'error');
  }
  f.context.dispose();
  await assert.rejects(() => f.context.resolve(actor));
});
test('coordinator publishes context changes, clears private permissions before invalidation and disposes subscriptions', async () => {
  const f = await fixture();
  f.controls.members = async () => [a, b];
  const auth = {
    subscribe: () => () => {},
    register: async () => ({ kind: 'confirmation-required' }) as const,
    completeCallback: async () =>
      ({ kind: 'authenticated', identity: actor }) as const,
    restoreAndVerify: async () =>
      ({ kind: 'authenticated', identity: actor }) as const,
  };
  const source = createSessionCoordinator({
    auth,
    profiles: {
      getOwnProfile: async () => ({
        userId: actor.userId,
        displayName: 'Own',
        phone: null,
      }),
      ensureOwnProfile: async () => ({
        userId: actor.userId,
        displayName: 'Own',
        phone: null,
      }),
    },
    context:
      f.context as import('../../../src/features/authentication/application/tenant-context.js').TenantContextSource,
  });
  let notifications = 0;
  const off = source.subscribe(() => {
    notifications++;
  });
  await source.restoreAndVerify();
  await source.selectContext(a.barbershopId);
  await source.chooseContext();
  let snapshot = source.getSnapshot();
  if (snapshot.kind !== 'ready') assert.fail();
  assert.equal(snapshot.context.kind, 'choosing');
  await source.selectContext(b.barbershopId);
  await source.refreshContext();
  snapshot = source.getSnapshot();
  if (snapshot.kind !== 'ready' || snapshot.context.kind !== 'selected')
    assert.fail();
  assert.equal(snapshot.context.context.role, 'barber');
  source.invalidateSession();
  assert.equal(source.getSnapshot().kind, 'resolving');
  await assert.rejects(() => source.selectContext(a.barbershopId));
  await assert.rejects(() => source.refreshContext());
  await assert.rejects(() => source.chooseContext());
  assert.ok(notifications > 0);
  off();
  source.dispose();
});
