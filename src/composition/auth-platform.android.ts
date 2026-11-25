export { createSessionStorageNative as createPlatformStorage } from '../features/authentication/infrastructure/session-storage.native';
export { prepareSdkRuntime } from '../features/authentication/infrastructure/sdk-runtime.native';
export function watchPlatformSession(
  _options: unknown,
  _listener: (change: 'renewed' | 'invalidated') => void,
): () => void {
  return () => {};
}
