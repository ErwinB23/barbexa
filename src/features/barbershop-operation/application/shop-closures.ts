import { BusinessError } from '../domain/values';
import {
  parseShopClosure,
  decodeClosurePage,
  decodeClosureWithdrawal,
  type ShopClosureCommand,
} from '../domain/shop-closure';
import type { OperationScope } from './operation-scope';
export interface ShopClosureGateway {
  executeShopClosure(input: ShopClosureCommand): Promise<unknown>;
}
export function createShopClosures(deps: {
  scope: () => OperationScope | null;
  gateway: ShopClosureGateway;
}) {
  const pending = new Set<string>();
  const key = () => {
    const s = deps.scope();
    return s
      ? `${s.userId}:${s.generation}:${s.barbershopId ?? ''}:${s.role ?? ''}`
      : '';
  };
  async function run(action: ShopClosureCommand['action'], input: object) {
    const s = deps.scope();
    if (!s) throw new BusinessError('UNAUTHENTICATED');
    if (s.role !== 'administrator' || !s.barbershopId)
      throw new BusinessError('FORBIDDEN');
    const stamp = key(),
      lock = stamp + ':' + action;
    if (pending.has(lock)) throw new BusinessError('CONFLICT');
    const command = parseShopClosure({
      action,
      ...input,
      barbershopId: s.barbershopId,
    });
    pending.add(lock);
    try {
      const result = await deps.gateway.executeShopClosure(command);
      if (key() !== stamp) throw new BusinessError('FORBIDDEN');
      return { result, command };
    } finally {
      pending.delete(lock);
    }
  }
  return {
    scopeKey: key,
    async list(cursor: string | null = null) {
      const { result, command } = await run('list-shop-closures', { cursor });
      return decodeClosurePage(result, command.barbershopId);
    },
    async withdraw(input: {
      closureId: string;
      requestId: string;
      reason: string;
    }) {
      const { result, command } = await run('withdraw-shop-closure', input);
      if (command.action !== 'withdraw-shop-closure')
        throw new BusinessError('INVALID_INPUT');
      return decodeClosureWithdrawal(
        result,
        command.barbershopId,
        command.closureId,
      );
    },
  };
}
export type ShopClosuresApplication = ReturnType<typeof createShopClosures>;
