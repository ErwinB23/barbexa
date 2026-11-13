export interface Profile {
  readonly userId: string;
  readonly displayName: string;
  readonly phone: string | null;
}
export interface ProfileInput {
  readonly displayName: string;
  readonly phone: string | null;
}
export interface ProfilePatch {
  readonly displayName?: string;
  readonly phone?: string | null;
}
export type FoundationErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'PROFILE_REQUIRED'
  | 'CONFLICT'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'INTERNAL_ERROR'
  | 'NOT_AVAILABLE';
export class FoundationError extends Error {
  constructor(
    readonly code: FoundationErrorCode,
    readonly reconciliation?: readonly Membership[],
  ) {
    super(code);
    this.name = 'FoundationError';
  }
}

export interface Barbershop {
  readonly id: string;
  readonly name: string;
}
export interface Membership {
  readonly id: string;
  readonly userId: string;
  readonly barbershopId: string;
  readonly role: 'barber' | 'administrator';
  readonly status: 'active' | 'inactive';
}
export interface CreatedBarbershop {
  readonly barbershop: Barbershop;
  readonly membership: Membership;
}
