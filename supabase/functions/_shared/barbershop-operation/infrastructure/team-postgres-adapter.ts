import type {
  AdminInvitationPersistence,
  InvitationEnvelope,
} from '../application/admin-invitations.ts';
import type { OwnSummaryPersistence } from '../application/own-summary.ts';
import type { InvitationDelivery } from '../domain/admin-invitations.ts';
import {
  BusinessError,
  utcInstant,
  type BusinessErrorCode,
} from '../domain/values.ts';
import { adminInvitationPayload, ownSummaryPayload } from './team-payload.ts';
const delivery = (v: unknown): InvitationDelivery => {
  if (!['pending', 'sending', 'sent', 'failed', 'unknown'].includes(String(v)))
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return v as InvitationDelivery;
};
export function createTeamPersistence(options: {
  baseUrl: string;
  serviceKey: string;
  fetcher?: typeof fetch;
}): AdminInvitationPersistence & OwnSummaryPersistence {
  async function rpc(
    name:
      | 'admin_invitation_create'
      | 'admin_invitation_list'
      | 'admin_invitation_respond'
      | 'admin_invitation_cancel'
      | 'admin_invitation_claim_mail'
      | 'admin_invitation_finish_mail'
      | 'admin_invitation_get'
      | 'own_professional_summary',
    actor: string,
    data: object,
  ) {
    try {
      const headers: Record<string, string> = {
        apikey: options.serviceKey,
        'Content-Type': 'application/json',
      };
      if (!options.serviceKey.startsWith('sb_secret_'))
        headers.Authorization = 'Bearer ' + options.serviceKey;
      const r = await (options.fetcher ?? fetch)(
        options.baseUrl + '/rest/v1/rpc/' + name,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ p_actor_id: actor, p_data: data }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const value = await r.json();
      if (!r.ok) {
        const known: BusinessErrorCode[] = [
          'INVALID_INPUT',
          'UNAUTHENTICATED',
          'FORBIDDEN',
          'NOT_AVAILABLE',
          'PROFILE_REQUIRED',
          'CONFLICT',
          'DEPENDENCY_UNAVAILABLE',
        ];
        const code =
          known.find((c) => c === value?.message) ??
          (r.status === 401
            ? 'UNAUTHENTICATED'
            : r.status === 403
              ? 'FORBIDDEN'
              : r.status === 404
                ? 'NOT_AVAILABLE'
                : ['23505', '23P01'].includes(value?.code)
                  ? 'CONFLICT'
                  : String(value?.code).startsWith('22')
                    ? 'INVALID_INPUT'
                    : 'DEPENDENCY_UNAVAILABLE');
        throw new BusinessError(code);
      }
      return value as unknown;
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  }
  const one = async (
    name: Parameters<typeof rpc>[0],
    actor: string,
    data: object,
    id?: string,
    shop?: string,
  ) => {
    const value = adminInvitationPayload(await rpc(name, actor, data), shop);
    if (id && value.id !== id)
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    return value;
  };
  return {
    createAdmin: (a, d) =>
      one(
        'admin_invitation_create',
        a.userId,
        {
          requestId: d.requestId,
          barbershopId: d.barbershopId,
          email: d.email,
        },
        undefined,
        d.barbershopId,
      ),
    getAdmin: (a, id) =>
      one('admin_invitation_get', a.userId, { invitationId: id }, id),
    async listAdmin(a, shop) {
      const rows = await rpc('admin_invitation_list', a.userId, {
        barbershopId: shop,
      });
      if (!Array.isArray(rows) || rows.length > 200)
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      return rows.map((r) => adminInvitationPayload(r, shop ?? undefined));
    },
    respondAdmin: (a, id, decision) =>
      one(
        'admin_invitation_respond',
        a.userId,
        { invitationId: id, decision },
        id,
      ),
    cancelAdmin: (a, id) =>
      one('admin_invitation_cancel', a.userId, { invitationId: id }, id),
    async claimMail(a, id, claimId) {
      const raw = await rpc('admin_invitation_claim_mail', a.userId, {
        invitationId: id,
        claimId,
      });
      if (!raw || typeof raw !== 'object' || !('claimed' in raw))
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      if (raw.claimed === false && 'status' in raw)
        return { claimed: false, status: delivery(raw.status) };
      if (
        raw.claimed !== true ||
        !('envelope' in raw) ||
        !raw.envelope ||
        typeof raw.envelope !== 'object'
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      const v = raw.envelope as Record<string, unknown>;
      if (
        v.invitationId !== id ||
        typeof v.recipientEmail !== 'string' ||
        typeof v.barbershopName !== 'string'
      )
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
      const envelope: InvitationEnvelope = {
        invitationId: id,
        recipientEmail: v.recipientEmail,
        barbershopName: v.barbershopName,
        expiresAt: utcInstant(v.expiresAt),
      };
      return { claimed: true, envelope };
    },
    async finishMail(a, id, claimId, status) {
      const raw = await rpc('admin_invitation_finish_mail', a.userId, {
        invitationId: id,
        claimId,
        status,
      });
      if (!raw || typeof raw !== 'object' || !('ok' in raw) || raw.ok !== true)
        throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    },
    async getOwnSummary(a, q) {
      return ownSummaryPayload(
        await rpc('own_professional_summary', a.userId, {
          barbershopId: q.barbershopId,
          localDate: q.localDate,
        }),
        a.userId,
        q.barbershopId,
        q.localDate,
      );
    },
  };
}
