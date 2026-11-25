import { careCommand, type CareGateway } from '../domain/care';
import { BusinessError } from '../domain/values';
export function createCareActions(
  gateway: CareGateway,
  scope: () => string | null,
) {
  const pending = new Map<string, Promise<unknown>>();
  return async (raw: unknown) => {
    const user = scope();
    if (!user) throw new BusinessError('UNAUTHENTICATED');
    const input = careCommand(raw),
      key = JSON.stringify([user, input]);
    const previous = pending.get(key);
    if (previous) return previous;
    const work = (async () => {
      const value = await gateway.execute(input);
      if (scope() !== user) throw new BusinessError('UNAUTHENTICATED');
      return value;
    })();
    pending.set(key, work);
    try {
      return await work;
    } finally {
      pending.delete(key);
    }
  };
}
