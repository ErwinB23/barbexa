import {
  parseAdminInvitation,
  type AdminInvitation,
  type InvitationDelivery,
} from '../domain/admin-invitations.ts';
import { teamActor } from '../domain/team-input.ts';
import type { VerifiedActor } from '../domain/types.ts';
import { BusinessError } from '../domain/values.ts';
export interface InvitationEnvelope {
  readonly invitationId: string;
  readonly recipientEmail: string;
  readonly barbershopName: string;
  readonly expiresAt: string;
}
export interface InvitationMailGateway {
  send(
    envelope: InvitationEnvelope,
    idempotencyKey: string,
  ): Promise<'sent' | 'failed' | 'unknown'>;
}
export interface AdminInvitationPersistence {
  createAdmin(
    actor: VerifiedActor,
    input: { requestId: string; barbershopId: string; email: string },
  ): Promise<AdminInvitation>;
  getAdmin(actor: VerifiedActor, id: string): Promise<AdminInvitation>;
  listAdmin(
    actor: VerifiedActor,
    shop: string | null,
  ): Promise<readonly AdminInvitation[]>;
  respondAdmin(
    actor: VerifiedActor,
    id: string,
    decision: 'accept' | 'reject',
  ): Promise<AdminInvitation>;
  cancelAdmin(actor: VerifiedActor, id: string): Promise<AdminInvitation>;
  claimMail(
    actor: VerifiedActor,
    id: string,
    attemptId: string,
  ): Promise<
    | { readonly claimed: false; readonly status: InvitationDelivery }
    | { readonly claimed: true; readonly envelope: InvitationEnvelope }
  >;
  finishMail(
    actor: VerifiedActor,
    id: string,
    attemptId: string,
    status: 'sent' | 'failed' | 'unknown',
  ): Promise<void>;
}
export function createAdminInvitationService(
  deps: {
    repository: AdminInvitationPersistence;
    attemptId: () => string;
  } & (
    { delivery: 'in-app' } | { delivery?: 'email'; mail: InvitationMailGateway }
  ),
) {
  async function notify(
    actor: VerifiedActor,
    invitation: AdminInvitation,
  ): Promise<AdminInvitation> {
    if (deps.delivery === 'in-app') return invitation;
    const attempt = deps.attemptId();
    let claim: Awaited<ReturnType<AdminInvitationPersistence['claimMail']>>;
    try {
      claim = await deps.repository.claimMail(actor, invitation.id, attempt);
    } catch {
      return { ...invitation, deliveryStatus: 'unknown' };
    }
    if (!claim.claimed) return { ...invitation, deliveryStatus: claim.status };
    let status: 'sent' | 'failed' | 'unknown';
    try {
      status = await deps.mail.send(
        claim.envelope,
        'admin-invitation/' + invitation.id,
      );
    } catch {
      status = 'unknown';
    }
    try {
      await deps.repository.finishMail(actor, invitation.id, attempt, status);
    } catch {
      status = 'unknown';
    }
    return { ...invitation, deliveryStatus: status };
  }
  return async (
    actor: unknown,
    input: unknown,
  ): Promise<AdminInvitation | readonly AdminInvitation[]> => {
    const identity = teamActor(actor),
      c = parseAdminInvitation(input);
    try {
      switch (c.action) {
        case 'invite-administrator': {
          const { action: _, ...data } = c;
          void _;
          const invitation = await deps.repository.createAdmin(identity, data);
          return await notify(identity, invitation);
        }
        case 'list-admin-invitations':
          return await deps.repository.listAdmin(identity, c.barbershopId);
        case 'respond-admin-invitation':
          return await deps.repository.respondAdmin(
            identity,
            c.invitationId,
            c.decision,
          );
        case 'cancel-admin-invitation':
          return await deps.repository.cancelAdmin(identity, c.invitationId);
        case 'retry-admin-invitation-email':
          if (deps.delivery === 'in-app')
            throw new BusinessError('NOT_AVAILABLE');
          return await notify(
            identity,
            await deps.repository.getAdmin(identity, c.invitationId),
          );
      }
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  };
}
