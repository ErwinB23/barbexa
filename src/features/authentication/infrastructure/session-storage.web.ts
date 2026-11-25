import {
  createSessionStorage,
  type StorageNamespace,
} from './session-storage-core';
import { readAuthSessionBinding } from './auth-session-binding';

function storedBinding(raw: string | null) {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw);
    if (stored?.version !== 1 || typeof stored.value !== 'string') return null;
    return readAuthSessionBinding(JSON.parse(stored.value)?.access_token);
  } catch {
    return null;
  }
}

interface WebStorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export function watchWebSession(
  options: StorageNamespace & {
    events?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  },
  onChange: (change: 'renewed' | 'invalidated') => void,
): () => void {
  const events = options.events ?? window;
  const key = `barberia.${options.environment}.${options.project}.auth-${options.environment.length}-${options.environment}-${options.project.length}-${options.project}`;
  const handler = (event: Event) => {
    const change = event as StorageEvent;
    if (change.key === null || change.key === `${key}-purpose`) {
      onChange('invalidated');
    } else if (change.key === key) {
      const before = storedBinding(change.oldValue);
      const after = storedBinding(change.newValue);
      onChange(
        before &&
          after &&
          before.userId === after.userId &&
          before.sessionId === after.sessionId
          ? 'renewed'
          : 'invalidated',
      );
    }
  };
  events.addEventListener('storage', handler);
  return () => events.removeEventListener('storage', handler);
}

// Accesible a JS del origen: no protege frente a XSS ni equivale a HttpOnly.
export function createSessionStorageWeb(
  options: StorageNamespace & { readonly backend?: WebStorageBackend },
) {
  const backend = () => options.backend ?? globalThis.localStorage;
  return createSessionStorage(options, {
    getItem: async (key) => backend().getItem(key),
    setItem: async (key, value) => backend().setItem(key, value),
    removeItem: async (key) => backend().removeItem(key),
  });
}
