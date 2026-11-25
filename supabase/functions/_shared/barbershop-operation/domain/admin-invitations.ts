import { BusinessError } from './values.ts';
import { teamId, teamRecord } from './team-input.ts';
import type { UtcInstant } from './values.ts';
export type InvitationDelivery =
  'pending' | 'sending' | 'sent' | 'failed' | 'unknown';
export interface AdminInvitation {
  readonly id: string;
  readonly barbershopId: string;
  readonly barbershopName: string;
  readonly recipientName: string;
  readonly role: 'administrator';
  readonly status:
    'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  readonly createdAt: UtcInstant;
  readonly expiresAt: UtcInstant;
  readonly deliveryStatus: InvitationDelivery;
}
export type AdminInvitationCommand =
  | {
      readonly action: 'invite-administrator';
      readonly requestId: string;
      readonly barbershopId: string;
      readonly email: string;
    }
  | {
      readonly action: 'list-admin-invitations';
      readonly barbershopId: string | null;
    }
  | {
      readonly action: 'respond-admin-invitation';
      readonly invitationId: string;
      readonly decision: 'accept' | 'reject';
    }
  | {
      readonly action:
        'cancel-admin-invitation' | 'retry-admin-invitation-email';
      readonly invitationId: string;
    };
export function parseAdminInvitation(input: unknown): AdminInvitationCommand {
  const action = teamRecord(
    input,
    ['action'],
    ['requestId', 'barbershopId', 'email', 'invitationId', 'decision'],
  ).action;
  if (action === 'invite-administrator') {
    const v = teamRecord(input, [
      'action',
      'requestId',
      'barbershopId',
      'email',
    ]);
    if (
      typeof v.email !== 'string' ||
      v.email.trim().length > 254 ||
      !/^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(v.email.trim()) ||
      /[\r\n]/.test(v.email)
    )
      throw new BusinessError('INVALID_INPUT');
    return Object.freeze({
      action,
      requestId: teamId(v.requestId),
      barbershopId: teamId(v.barbershopId),
      email: v.email.trim().toLowerCase(),
    });
  }
  if (action === 'list-admin-invitations') {
    const v = teamRecord(input, ['action', 'barbershopId']);
    return {
      action,
      barbershopId: v.barbershopId === null ? null : teamId(v.barbershopId),
    };
  }
  if (action === 'respond-admin-invitation') {
    const v = teamRecord(input, ['action', 'invitationId', 'decision']);
    if (v.decision !== 'accept' && v.decision !== 'reject')
      throw new BusinessError('INVALID_INPUT');
    return {
      action,
      invitationId: teamId(v.invitationId),
      decision: v.decision,
    };
  }
  if (
    action === 'cancel-admin-invitation' ||
    action === 'retry-admin-invitation-email'
  ) {
    const v = teamRecord(input, ['action', 'invitationId']);
    return { action, invitationId: teamId(v.invitationId) };
  }
  throw new BusinessError('INVALID_INPUT');
}
