import {
  ownSummaryQuery,
  type OwnProfessionalSummary,
} from '../domain/own-summary';
import { BusinessError } from '../domain/values';
import type { OperationScope } from './operation-scope';
export interface OwnSummaryGateway {
  getOwnSummary(shop: string, day: string): Promise<OwnProfessionalSummary>;
}
export function createOwnSummaryApplication(deps: {
  gateway: OwnSummaryGateway;
  scope: () => OperationScope | null;
}) {
  const key = () => {
    const s = deps.scope();
    return s
      ? `${s.userId}:${s.generation}:${s.barbershopId ?? ''}:${s.role ?? ''}`
      : '';
  };
  return {
    scopeKey: key,
    async read(localDate: string) {
      const s = deps.scope(),
        stamp = key();
      if (!s) throw new BusinessError('UNAUTHENTICATED');
      if (
        !s.barbershopId ||
        !['administrator', 'barber'].includes(s.role ?? '')
      )
        throw new BusinessError('FORBIDDEN');
      const query = ownSummaryQuery({
        action: 'own-professional-summary',
        barbershopId: s.barbershopId,
        localDate,
      });
      try {
        const result = await deps.gateway.getOwnSummary(
          query.barbershopId,
          query.localDate,
        );
        if (!key()) throw new BusinessError('UNAUTHENTICATED');
        if (
          key() !== stamp ||
          result.professional.userId !== s.userId ||
          result.professional.barbershopId !== s.barbershopId ||
          !result.professional.active
        )
          throw new BusinessError('FORBIDDEN');
        if (result.localDate !== query.localDate)
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        return result;
      } catch (e) {
        if (e instanceof BusinessError) throw e;
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      }
    },
  };
}
export type OwnSummaryApplication = ReturnType<
  typeof createOwnSummaryApplication
>;
