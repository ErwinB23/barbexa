import type { ShopNameGateway } from '../features/barbershop-operation/application/operation-application';
import { BusinessError } from '../features/barbershop-operation/domain/values';
import { FoundationError } from '../features/tenant-foundation/domain/types';
import type { createTenantFoundation } from './tenant-foundation-composition';

export function createShopNameGateway(
  tenant: Pick<
    ReturnType<typeof createTenantFoundation>,
    'getBarbershop' | 'renameBarbershop'
  >,
  invalidateCatalog: () => void,
): ShopNameGateway {
  async function translated<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      throw new BusinessError(
        error instanceof FoundationError && error.code !== 'INTERNAL_ERROR'
          ? error.code
          : 'DEPENDENCY_UNAVAILABLE',
      );
    }
  }
  return {
    get: (id) => translated(() => tenant.getBarbershop(id)),
    async rename(id, name) {
      const result = await translated(() => tenant.renameBarbershop(id, name));
      invalidateCatalog();
      return result;
    },
  };
}
