import { BusinessError, utcInstant } from '../domain/values';
import { teamId } from '../domain/team-input';
import type {
  AdminInvitation,
  InvitationDelivery,
} from '../domain/admin-invitations';
import type { OwnProfessionalSummary } from '../domain/own-summary';
const fail = (): never => {
  throw new BusinessError('DEPENDENCY_UNAVAILABLE');
};
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return fail();
  return v as Record<string, unknown>;
}
const string = (v: unknown) => (typeof v === 'string' ? v : fail());
const number = (v: unknown) =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 ? v : fail();
export function adminInvitationPayload(
  value: unknown,
  shop?: string,
): AdminInvitation {
  try {
    const r = record(value),
      createdAt = utcInstant(r.createdAt),
      expiresAt = utcInstant(r.expiresAt);
    if (
      r.role !== 'administrator' ||
      !['pending', 'accepted', 'rejected', 'cancelled', 'expired'].includes(
        string(r.status),
      ) ||
      !['pending', 'sending', 'sent', 'failed', 'unknown'].includes(
        string(r.deliveryStatus),
      ) ||
      Date.parse(expiresAt) - Date.parse(createdAt) !== 7 * 86400000 ||
      (shop !== undefined && r.barbershopId !== shop)
    )
      return fail();
    return {
      id: teamId(r.id),
      barbershopId: teamId(r.barbershopId),
      barbershopName: string(r.barbershopName),
      recipientName: string(r.recipientName),
      role: 'administrator',
      status: r.status as AdminInvitation['status'],
      createdAt,
      expiresAt,
      deliveryStatus: r.deliveryStatus as InvitationDelivery,
    };
  } catch {
    return fail();
  }
}
export function ownSummaryPayload(
  value: unknown,
  user: string,
  shop: string,
  day: string,
): OwnProfessionalSummary {
  try {
    const r = record(value),
      p = record(r.professional);
    if (
      p.userId !== user ||
      p.barbershopId !== shop ||
      p.active !== true ||
      r.localDate !== day
    )
      return fail();
    const result = {
      professional: {
        id: teamId(p.id),
        userId: teamId(p.userId),
        barbershopId: teamId(p.barbershopId),
        professionalName: string(p.professionalName),
        active: true,
      },
      localDate: day,
      total: number(r.total),
      scheduled: number(r.scheduled),
      inService: number(r.inService),
      completed: number(r.completed),
      cancelled: number(r.cancelled),
      noShow: number(r.noShow),
      unrecorded: number(r.unrecorded),
      upcoming: number(r.upcoming),
      nextStartsAt: r.nextStartsAt === null ? null : utcInstant(r.nextStartsAt),
    };
    if (
      result.total !==
        result.scheduled +
          result.inService +
          result.completed +
          result.cancelled +
          result.noShow +
          result.unrecorded ||
      result.upcoming > result.scheduled + result.unrecorded ||
      (result.nextStartsAt === null) !== (result.upcoming === 0) ||
      (result.nextStartsAt !== null &&
        new Date(Date.parse(result.nextStartsAt) - 5 * 3600000)
          .toISOString()
          .slice(0, 10) !== day)
    )
      return fail();
    return result;
  } catch {
    return fail();
  }
}
