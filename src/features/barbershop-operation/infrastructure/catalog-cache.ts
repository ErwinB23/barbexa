import type { BookingCatalog } from '../domain/types';
import { BusinessError } from '../domain/values';
export const CATALOG_VERSION = 'booking-catalog-v1';
const copy = (value: BookingCatalog): BookingCatalog =>
  JSON.parse(JSON.stringify(value));
// Memory-only commercial DTOs. Never use for permissions, private management or slots.
export function createCatalogCache({
  now = Date.now,
}: { now?: () => number } = {}) {
  const entries = new Map<string, { value: BookingCatalog; created: number }>(),
    pending = new Map<string, Promise<BookingCatalog>>();
  let epoch = 0,
    owner = '',
    scope = '',
    disposed = false;
  const invalidate = () => {
    epoch++;
    entries.clear();
    pending.clear();
  };
  return {
    invalidate,
    setScope(next: string) {
      if (next !== scope) {
        scope = next;
        invalidate();
      }
    },
    async read(
      user: string,
      tenant: string,
      version: string,
      load: () => Promise<BookingCatalog>,
    ): Promise<BookingCatalog> {
      if (disposed) throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      if (owner !== user) {
        owner = user;
        invalidate();
      }
      const key = JSON.stringify([user, tenant, version]),
        cached = entries.get(key),
        stamp = now();
      if (cached && stamp >= cached.created && stamp - cached.created < 30000)
        return copy(cached.value);
      entries.delete(key);
      const current = pending.get(key);
      if (current) return copy(await current);
      const ticket = epoch;
      const task = (async () => {
        const value = await load();
        if (disposed || epoch !== ticket || owner !== user)
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        if (value.barbershopId !== tenant)
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        if (entries.size >= 32) entries.delete(entries.keys().next().value!);
        entries.set(key, { value: copy(value), created: now() });
        return value;
      })();
      pending.set(key, task);
      try {
        return copy(await task);
      } finally {
        if (pending.get(key) === task) pending.delete(key);
      }
    },
    dispose() {
      disposed = true;
      invalidate();
    },
  };
}
export type CatalogCache = ReturnType<typeof createCatalogCache>;
