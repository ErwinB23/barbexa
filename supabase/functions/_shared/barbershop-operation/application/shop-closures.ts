import {
  decodeClosurePage,
  decodeClosureWithdrawal,
  type ShopClosureCommand,
} from '../domain/shop-closure.ts';
import type { VerifiedActor } from '../domain/types.ts';
export interface ShopClosurePersistence {
  listShopClosures(
    actor: VerifiedActor,
    shop: string,
    cursor: string | null,
  ): Promise<unknown>;
  withdrawShopClosure(
    actor: VerifiedActor,
    input: Extract<ShopClosureCommand, { action: 'withdraw-shop-closure' }>,
  ): Promise<unknown>;
}
export async function executeShopClosure(
  gateway: ShopClosurePersistence,
  actor: VerifiedActor,
  command: ShopClosureCommand,
) {
  if (command.action === 'list-shop-closures')
    return decodeClosurePage(
      await gateway.listShopClosures(
        actor,
        command.barbershopId,
        command.cursor,
      ),
      command.barbershopId,
    );
  return decodeClosureWithdrawal(
    await gateway.withdrawShopClosure(actor, command),
    command.barbershopId,
    command.closureId,
  );
}
