import { AuthError } from '../domain/auth-error';

// Nombre distinto a los adaptadores para evitar autorresolución de Metro por plataforma.

export interface StorageNamespace {
  readonly environment: string;
  readonly project: string;
}
export interface SessionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export interface StorageDriver {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createSessionStorage(
  namespace: StorageNamespace,
  driver: StorageDriver,
): SessionStorage {
  if (
    !/^[a-z0-9-]{1,64}$/.test(namespace.environment) ||
    !/^[a-z0-9-]{1,64}$/.test(namespace.project)
  )
    throw new AuthError('invalid-input');
  const prefix = `barberia.${namespace.environment}.${namespace.project}.`;
  const storageKey = (key: string) => {
    // Incluye sufijos PKCE del SDK y el namespace de su canal por proyecto/entorno.
    if (!/^[a-zA-Z0-9._-]{1,512}$/.test(key))
      throw new AuthError('invalid-input');
    return prefix + key;
  };
  async function persist<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch {
      throw new AuthError('persistence-failed');
    }
  }
  return {
    async getItem(key) {
      const name = storageKey(key);
      return persist(async () => {
        const raw = await driver.getItem(name);
        if (raw === null) return null;
        const value: unknown = JSON.parse(raw);
        if (
          !value ||
          typeof value !== 'object' ||
          !('version' in value) ||
          value.version !== 1 ||
          !('value' in value) ||
          typeof value.value !== 'string' ||
          Object.keys(value).length !== 2
        )
          throw new AuthError('persistence-failed');
        return value.value;
      });
    },
    async setItem(key, value) {
      const name = storageKey(key);
      if (typeof value !== 'string') throw new AuthError('invalid-input');
      await persist(() =>
        driver.setItem(name, JSON.stringify({ version: 1, value })),
      );
    },
    async removeItem(key) {
      const name = storageKey(key);
      await persist(() => driver.removeItem(name));
    },
  };
}
