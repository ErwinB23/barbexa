export type AuthFailure =
  | 'invalid-input'
  | 'weak-password'
  | 'password-mismatch'
  | 'credentials-rejected'
  | 'confirmation-required'
  | 'link-invalid'
  | 'oauth-cancelled'
  | 'rate-limited'
  | 'network-unavailable'
  | 'persistence-failed'
  | 'provider-unavailable';

export class AuthError extends Error {
  constructor(readonly code: AuthFailure) {
    super(code);
    this.name = 'AuthError';
  }
}
