import type { SeenNotices } from '../application/inbox';

// Only a cursor and IDs, never message content or credentials. Failure is non-blocking.
export function createInboxSeenStorage(
  storage: () => Pick<Storage, 'getItem' | 'setItem'> | null,
) {
  const key = (viewer: string) => `barbexa:notifications-seen:v1:${viewer}`;
  return {
    get(viewer: string): SeenNotices | null {
      try {
        const value = JSON.parse(storage()?.getItem(key(viewer)) ?? 'null');
        return value &&
          typeof value.at === 'string' &&
          Number.isFinite(Date.parse(value.at)) &&
          Array.isArray(value.ids) &&
          value.ids.every((id: unknown) => typeof id === 'string')
          ? value
          : null;
      } catch {
        return null;
      }
    },
    set(viewer: string, value: SeenNotices) {
      try {
        storage()?.setItem(key(viewer), JSON.stringify(value));
      } catch {
        /* Memory fallback. */
      }
    },
  };
}
