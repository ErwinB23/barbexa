import { AuthError } from '../domain/auth-error';

// Ruta Web explícita: no permitir fallback .native del resolver.

export function prepareSdkRuntime(): void {
  if (
    typeof globalThis.crypto?.getRandomValues !== 'function' ||
    typeof globalThis.crypto?.subtle?.digest !== 'function' ||
    typeof TextEncoder !== 'function'
  )
    throw new AuthError('provider-unavailable');
}
