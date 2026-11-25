import { BusinessError } from '../domain/values';
import {
  ownSchedule,
  ownBlock,
  scheduleHours,
  scheduleId,
  scheduleVersion,
  type OwnSchedule,
  type OwnScheduleBlock,
} from '../domain/self-schedule';
import type { Hours } from '../domain/types';
import type { OperationScope } from './operation-scope';
export interface SelfScheduleGateway {
  getOwnSchedule(shop: string): Promise<OwnSchedule>;
  setOwnSchedule(
    shop: string,
    version: number,
    hours: readonly Hours[],
  ): Promise<OwnSchedule>;
  upsertOwnBlock(
    shop: string,
    version: number,
    block: OwnScheduleBlock,
  ): Promise<OwnSchedule>;
  removeOwnBlock(
    shop: string,
    version: number,
    blockId: string,
  ): Promise<OwnSchedule>;
}
export function createSelfScheduleApplication(deps: {
  gateway: SelfScheduleGateway;
  scope: () => OperationScope | null;
  enabled: boolean;
  newId: () => string;
}) {
  const pending = new Set<string>();
  const key = () => {
    const s = deps.scope();
    return s
      ? `${s.userId}:${s.generation}:${s.barbershopId ?? ''}:${s.role ?? ''}`
      : '';
  };
  async function run(
    write: boolean,
    work: (shop: string) => Promise<OwnSchedule>,
  ) {
    const scope = deps.scope();
    if (
      !deps.enabled ||
      !scope?.barbershopId ||
      !['barber', 'administrator'].includes(scope.role ?? '')
    )
      throw new BusinessError('FORBIDDEN');
    const stamp = key(),
      lock = `${stamp}:${write ? 'write' : 'read'}`;
    if (pending.has(lock)) throw new BusinessError('CONFLICT');
    pending.add(lock);
    try {
      const result = await work(scope.barbershopId);
      if (key() !== stamp) throw new BusinessError('FORBIDDEN');
      return ownSchedule(result, scope.userId, scope.barbershopId);
    } finally {
      pending.delete(lock);
    }
  }
  return {
    scopeKey: key,
    newBlockId: () => scheduleId(deps.newId()),
    read: () => run(false, (shop) => deps.gateway.getOwnSchedule(shop)),
    setHours: (version: unknown, input: unknown) =>
      run(true, (shop) =>
        deps.gateway.setOwnSchedule(
          shop,
          scheduleVersion(version),
          scheduleHours(input),
        ),
      ),
    saveBlock: (version: unknown, input: unknown) =>
      run(true, (shop) =>
        deps.gateway.upsertOwnBlock(
          shop,
          scheduleVersion(version),
          ownBlock(input),
        ),
      ),
    removeBlock: (version: unknown, id: unknown) =>
      run(true, (shop) =>
        deps.gateway.removeOwnBlock(
          shop,
          scheduleVersion(version),
          scheduleId(id),
        ),
      ),
  };
}
export type SelfScheduleApplication = ReturnType<
  typeof createSelfScheduleApplication
>;
