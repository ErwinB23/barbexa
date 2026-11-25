import { AuthError } from '../domain/auth-error';
import { verifiedIdentity, type Identity } from '../domain/identity';
import {
  selectedContext,
  type ContextState,
  type MembershipReference,
  type BarbershopReference,
} from '../domain/session-state';
export interface ContextPreference {
  get(userId: string): Promise<string | null>;
  set(userId: string, barbershopId: string): Promise<void>;
  remove(userId: string): Promise<void>;
}
export interface TenantContextSource {
  getSnapshot(): ContextState;
  subscribe(listener: () => void): () => void;
  resolve(identity: Identity): Promise<void>;
  revalidate(identity: Identity): Promise<void>;
  select(id: unknown): Promise<void>;
  choose(): Promise<void>;
  clear(): void;
  dispose(): void;
}
export function createTenantContext({
  listOwnMemberships,
  getBarbershop,
  preference,
}: {
  listOwnMemberships: () => Promise<readonly MembershipReference[]>;
  getBarbershop: (id: string) => Promise<BarbershopReference | null>;
  preference: ContextPreference;
}): TenantContextSource {
  let state: ContextState = Object.freeze({ kind: 'resolving' }),
    actor: Identity | undefined,
    generation = 0,
    disposed = false;
  const listeners = new Set<() => void>();
  const valid = (v: number) => !disposed && v === generation;
  const publish = (next: ContextState) => {
    state = Object.freeze(next);
    for (const listener of listeners) listener();
  };
  const clear = () => {
    generation++;
    actor = undefined;
    publish({ kind: 'resolving' });
  };
  async function resolve(
    identity: Identity,
    requested?: unknown,
    choosing = false,
    background = false,
  ): Promise<void> {
    if (disposed) throw new AuthError('provider-unavailable');
    const version = ++generation;
    actor = verifiedIdentity(identity);
    const user = actor;
    if (!background) publish({ kind: 'resolving' });
    try {
      if (
        requested !== undefined &&
        (typeof requested !== 'string' || !requested.trim())
      )
        throw new AuthError('invalid-input');
      const members = await listOwnMemberships();
      if (!valid(version)) return;
      if (
        members.some(
          (m) =>
            m.userId !== user.userId ||
            !['barber', 'administrator'].includes(m.role) ||
            !['active', 'inactive'].includes(m.status),
        )
      )
        throw new AuthError('provider-unavailable');
      const allowed: {
        membership: MembershipReference;
        shop: BarbershopReference;
      }[] = [];
      for (const membership of members.filter((m) => m.status === 'active')) {
        const shop = await getBarbershop(membership.barbershopId);
        if (!valid(version)) return;
        if (shop) {
          if (shop.id !== membership.barbershopId || !shop.name.trim())
            throw new AuthError('provider-unavailable');
          allowed.push({ membership: { ...membership }, shop: { ...shop } });
        }
      }
      const preferred = await preference.get(user.userId);
      if (!valid(version)) return;
      const preferredCandidate = allowed.find((v) => v.shop.id === preferred);
      if (preferred && !preferredCandidate)
        await preference.remove(user.userId);
      if (!valid(version)) return;
      const chosen =
        requested === undefined
          ? allowed.length === 1
            ? allowed[0]
            : choosing
              ? undefined
              : preferredCandidate
          : allowed.find((v) => v.shop.id === requested);
      if (requested !== undefined && !chosen)
        throw new AuthError('provider-unavailable');
      if (chosen) {
        if (preferred !== chosen.shop.id || !background) {
          await preference.set(user.userId, chosen.shop.id);
          if (!valid(version)) return;
        }
        if (
          background &&
          state.kind === 'selected' &&
          state.context.membershipId === chosen.membership.id &&
          state.context.barbershopId === chosen.shop.id &&
          state.context.role === chosen.membership.role &&
          state.barbershop?.name === chosen.shop.name
        )
          return;
        publish({
          kind: 'selected',
          context: selectedContext(user, chosen.membership, chosen.shop),
          barbershop: Object.freeze(chosen.shop),
        });
      } else if (!allowed.length) {
        if (state.kind !== 'none') publish({ kind: 'none' });
      } else
        publish({
          kind: 'choosing',
          memberships: Object.freeze(
            allowed.map((v) => Object.freeze(v.membership)),
          ),
          barbershops: Object.freeze(allowed.map((v) => Object.freeze(v.shop))),
        });
    } catch (error) {
      if (valid(version))
        publish({
          kind: 'error',
          error:
            error instanceof AuthError ? error.code : 'provider-unavailable',
        });
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    resolve,
    async revalidate(identity) {
      if (state.kind === 'resolving' || actor?.userId !== identity.userId)
        return;
      await resolve(identity, undefined, state.kind === 'choosing', true);
    },
    async select(id) {
      if (!actor || disposed) throw new AuthError('credentials-rejected');
      await resolve(actor, id);
    },
    async choose() {
      if (!actor || disposed) throw new AuthError('credentials-rejected');
      await resolve(actor, undefined, true);
    },
    clear,
    dispose() {
      disposed = true;
      clear();
      listeners.clear();
    },
  };
}
