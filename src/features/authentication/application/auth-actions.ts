import type { RegistrationInput } from './auth-gateway';
import { AuthError } from '../domain/auth-error';

export function recoveryEmail(input: unknown): string {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AuthError('invalid-input');
  const value = input as Record<string, unknown>;
  if (
    Object.keys(value).some((k) => k !== 'email') ||
    typeof value.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())
  )
    throw new AuthError('invalid-input');
  return value.email.trim();
}
export function recoveredPassword(input: unknown): string {
  if (typeof input !== 'string' || !input.length)
    throw new AuthError('invalid-input');
  // The configured Auth policy remains authoritative; never trim a password.
  return input;
}

export function signInInput(input: unknown): {
  readonly email: string;
  readonly password: string;
} {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AuthError('invalid-input');
  const value = input as Record<string, unknown>;
  if (
    Object.keys(value).some((k) => !['email', 'password'].includes(k)) ||
    typeof value.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
    typeof value.password !== 'string' ||
    !value.password.length
  )
    throw new AuthError('invalid-input');
  return { email: value.email.trim(), password: value.password };
}

export interface ProfileDetails {
  readonly displayName: string;
  readonly phone: string | null;
}
export function profileDetails(input: unknown): ProfileDetails {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new AuthError('invalid-input');
  const value = input as Record<string, unknown>;
  if (
    typeof value.displayName !== 'string' ||
    !value.displayName.trim() ||
    !(
      value.phone === undefined ||
      value.phone === null ||
      typeof value.phone === 'string'
    )
  )
    throw new AuthError('invalid-input');
  return {
    displayName: value.displayName.trim(),
    phone: typeof value.phone === 'string' ? value.phone.trim() || null : null,
  };
}
export function registrationInput(input: unknown): RegistrationInput {
  const profile = profileDetails(input);
  const value = input as Record<string, unknown>;
  if (
    Object.keys(value).some(
      (key) => !['displayName', 'phone', 'email', 'password'].includes(key),
    ) ||
    typeof value.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) ||
    typeof value.password !== 'string' ||
    value.password.length === 0
  )
    throw new AuthError('invalid-input');
  return { ...profile, email: value.email.trim(), password: value.password };
}
export function authFailure(error: unknown): AuthError {
  return error instanceof AuthError
    ? error
    : new AuthError('provider-unavailable');
}
