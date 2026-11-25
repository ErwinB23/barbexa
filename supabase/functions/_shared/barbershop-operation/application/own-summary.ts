import {
  ownSummaryQuery,
  type OwnProfessionalSummary,
  type OwnSummaryQuery,
} from '../domain/own-summary.ts';
import { teamActor } from '../domain/team-input.ts';
import type { VerifiedActor } from '../domain/types.ts';
import { BusinessError } from '../domain/values.ts';
export interface OwnSummaryPersistence {
  getOwnSummary(
    actor: VerifiedActor,
    input: OwnSummaryQuery,
  ): Promise<OwnProfessionalSummary>;
}
export function createOwnSummaryService(gateway: OwnSummaryPersistence) {
  return async (actor: unknown, input: unknown) => {
    const identity = teamActor(actor),
      query = ownSummaryQuery(input);
    try {
      return await gateway.getOwnSummary(identity, query);
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
