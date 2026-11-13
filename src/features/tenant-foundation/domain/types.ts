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
  constructor(readonly code: FoundationErrorCode) {
    super(code);
    this.name = 'FoundationError';
  }
}
