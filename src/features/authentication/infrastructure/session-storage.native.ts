import * as SecureStore from 'expo-secure-store';

import {
  createSessionStorage,
  type StorageNamespace,
} from './session-storage-core';

interface SecureStorageBackend {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export function createSessionStorageNative(
  options: StorageNamespace & { readonly backend?: SecureStorageBackend },
) {
  const backend = options.backend ?? SecureStore;
  return createSessionStorage(options, {
    getItem: (key) => backend.getItemAsync(key),
    setItem: (key, value) => backend.setItemAsync(key, value),
    removeItem: (key) => backend.deleteItemAsync(key),
  });
}
