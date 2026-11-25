import * as Crypto from 'expo-crypto';

import { AuthError } from '../domain/auth-error';

// SDK2.119 utiliza WebCrypto global para PKCE. No es una implementación WebCrypto completa.
// Se completan únicamente RNG seguro y SHA-256 ausentes, sin reemplazar APIs existentes.
export function prepareSdkRuntime(): void {
  try {
    if (typeof TextEncoder !== 'function') throw new Error();
    const current = globalThis.crypto;
    if (
      typeof current?.getRandomValues === 'function' &&
      typeof current?.subtle?.digest === 'function'
    )
      return;
    const next = Object.create(current ?? null);
    Object.defineProperty(next, 'getRandomValues', {
      value:
        typeof current?.getRandomValues === 'function'
          ? current.getRandomValues.bind(current)
          : Crypto.getRandomValues,
    });
    const subtle = Object.create(current?.subtle ?? null);
    if (typeof current?.subtle?.digest === 'function')
      Object.defineProperty(subtle, 'digest', {
        value: current.subtle.digest.bind(current.subtle),
      });
    else
      Object.defineProperty(subtle, 'digest', {
        value: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
          const name =
            typeof algorithm === 'string' ? algorithm : algorithm.name;
          if (name.toUpperCase() !== 'SHA-256')
            return Promise.reject(new AuthError('provider-unavailable'));
          return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
        },
      });
    Object.defineProperty(next, 'subtle', { value: subtle });
    Object.defineProperty(globalThis, 'crypto', {
      value: next,
      configurable: true,
    });
  } catch {
    throw new AuthError('provider-unavailable');
  }
}
