import { AuthError } from './auth-error';

export interface Identity {
  readonly userId: string;
  readonly email: string;
  readonly emailConfirmed: true;
  readonly isAnonymous: false;
  // Optional display data, never a source of permissions or membership.
  readonly suggestedDisplayName?: string;
}

// Valida forma; solo el adaptador Auth puede acreditar su procedencia verificada.
export function verifiedIdentity(input: unknown): Identity {
  if (!input || typeof input !== 'object') throw new AuthError('invalid-input');
  const value = input as Record<string, unknown>;
  if (
    typeof value.userId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value.userId,
    ) ||
    typeof value.email !== 'string' ||
    !value.email.trim() ||
    value.emailConfirmed !== true ||
    value.isAnonymous !== false
  )
    throw new AuthError('invalid-input');
  return Object.freeze({
    userId: value.userId,
    email: value.email,
    emailConfirmed: true,
    isAnonymous: false,
    ...(typeof value.suggestedDisplayName === 'string' &&
    value.suggestedDisplayName.trim()
      ? { suggestedDisplayName: value.suggestedDisplayName.trim() }
      : {}),
  });
}
