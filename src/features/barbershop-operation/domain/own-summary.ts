import { BusinessError } from './values';
import { teamRecord, teamId, teamDay } from './team-input';
import type { Professional } from './types';
export interface OwnProfessionalSummary {
  readonly professional: Professional;
  readonly localDate: string;
  readonly total: number;
  readonly scheduled: number;
  readonly inService: number;
  readonly completed: number;
  readonly cancelled: number;
  readonly noShow: number;
  readonly unrecorded: number;
  readonly upcoming: number;
  readonly nextStartsAt: string | null;
}
export interface OwnSummaryQuery {
  readonly action: 'own-professional-summary';
  readonly barbershopId: string;
  readonly localDate: string;
}
export function ownSummaryQuery(value: unknown): OwnSummaryQuery {
  const v = teamRecord(value, ['action', 'barbershopId', 'localDate']);
  if (v.action !== 'own-professional-summary')
    throw new BusinessError('INVALID_INPUT');
  return {
    action: 'own-professional-summary',
    barbershopId: teamId(v.barbershopId),
    localDate: teamDay(v.localDate),
  };
}
