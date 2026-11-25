import { AuthError, type AuthFailure } from './auth-error';
import { verifiedIdentity, type Identity } from './identity';

// Proyecciones propias; composición conectará las operaciones existentes de 002.
export interface OwnProfile {
  readonly userId: string;
  readonly displayName: string;
  readonly phone: string | null;
}
export interface MembershipReference {
  readonly id: string;
  readonly userId: string;
  readonly barbershopId: string;
  readonly role: 'barber' | 'administrator';
  readonly status: 'active' | 'inactive';
}
export interface BarbershopReference {
  readonly id: string;
  readonly name: string;
}

export interface ActiveContext {
  readonly userId: string;
  readonly barbershopId: string;
  readonly membershipId: string;
  readonly role: 'barber' | 'administrator';
}
export type ContextState =
  | { readonly kind: 'resolving' }
  | { readonly kind: 'none' }
  | {
      readonly kind: 'choosing';
      readonly memberships: readonly MembershipReference[];
      readonly barbershops?: readonly BarbershopReference[];
    }
  | {
      readonly kind: 'selected';
      readonly context: ActiveContext;
      readonly barbershop?: BarbershopReference;
    }
  | { readonly kind: 'error'; readonly error: AuthFailure };

export interface ReadySession {
  readonly kind: 'ready';
  readonly identity: Identity;
  readonly profile: OwnProfile;
  readonly generation: number;
  readonly context: ContextState;
}
export type SessionView =
  | { readonly kind: 'resolving' }
  | {
      readonly kind: 'signed-out';
      readonly logout?: 'confirmed' | 'local-only';
    }
  | { readonly kind: 'confirmation-required' }
  | { readonly kind: 'oauth-pending' }
  | { readonly kind: 'recovery-sent' }
  | { readonly kind: 'profile-required'; readonly identity: Identity }
  | ReadySession
  | { readonly kind: 'recovery' }
  | { readonly kind: 'retryable-error'; readonly error: AuthFailure };

export type ReturnIntent = '/account' | '/context';

export function readySession(
  identity: Identity,
  profile: OwnProfile,
  generation: number,
): ReadySession {
  const actor = verifiedIdentity(identity);
  if (
    profile.userId !== actor.userId ||
    !profile.displayName.trim() ||
    !(profile.phone === null || typeof profile.phone === 'string') ||
    !Number.isSafeInteger(generation) ||
    generation < 0
  )
    throw new AuthError('invalid-input');
  return Object.freeze({
    kind: 'ready',
    identity: actor,
    profile: Object.freeze({ ...profile }),
    generation,
    context: Object.freeze({ kind: 'resolving' }),
  });
}

// Comprueba coherencia de datos ya obtenidos por los puertos; no reemplaza RLS.
export function selectedContext(
  identity: Identity,
  membership: MembershipReference,
  barbershop: BarbershopReference,
): ActiveContext {
  if (
    membership.userId !== identity.userId ||
    membership.barbershopId !== barbershop.id ||
    membership.status !== 'active' ||
    !['barber', 'administrator'].includes(membership.role)
  )
    throw new AuthError('invalid-input');
  return Object.freeze({
    userId: identity.userId,
    membershipId: membership.id,
    barbershopId: barbershop.id,
    role: membership.role,
  });
}
