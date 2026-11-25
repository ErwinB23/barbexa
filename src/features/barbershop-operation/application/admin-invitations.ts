import {
  parseAdminInvitation,
  type AdminInvitation,
} from '../domain/admin-invitations';
import { BusinessError } from '../domain/values';
import { teamId } from '../domain/team-input';
import type { OperationScope } from './operation-scope';
export interface AdminInvitationGateway {
  createAdmin(input: {
    requestId: string;
    barbershopId: string;
    email: string;
  }): Promise<AdminInvitation>;
  listAdmin(shop: string | null): Promise<readonly AdminInvitation[]>;
  respondAdmin(
    id: string,
    decision: 'accept' | 'reject',
  ): Promise<AdminInvitation>;
  cancelAdmin(id: string): Promise<AdminInvitation>;
  retryAdminMail(id: string): Promise<AdminInvitation>;
}
export function createAdminInvitations(deps: {
  gateway: AdminInvitationGateway;
  scope: () => OperationScope | null;
  requestId: () => string;
  delivery?: 'email' | 'in-app';
  onAccepted?: () => Promise<void>;
}) {
  const key = () => {
    const s = deps.scope();
    return s
      ? `${s.userId}:${s.generation}:${s.barbershopId ?? ''}:${s.role ?? ''}`
      : '';
  };
  let owner = '',
    pending: ReturnType<typeof parseAdminInvitation> | null = null,
    flight: Promise<AdminInvitation> | null = null;
  const safe = (e: unknown) =>
    e instanceof BusinessError
      ? e
      : new BusinessError('DEPENDENCY_UNAVAILABLE');
  function capture(admin = false) {
    const scope = deps.scope(),
      stamp = key();
    if (stamp !== owner) {
      owner = stamp;
      pending = null;
      flight = null;
    }
    if (!scope) throw new BusinessError('UNAUTHENTICATED');
    if (admin && (!scope.barbershopId || scope.role !== 'administrator'))
      throw new BusinessError('FORBIDDEN');
    return { scope, stamp };
  }
  function current(stamp: string) {
    if (!key()) throw new BusinessError('UNAUTHENTICATED');
    if (key() !== stamp) throw new BusinessError('FORBIDDEN');
  }
  async function run<T>(
    admin: boolean,
    work: (s: OperationScope) => Promise<T>,
  ) {
    const { scope, stamp } = capture(admin);
    try {
      const result = await work(scope);
      current(stamp);
      return result;
    } catch (e) {
      current(stamp);
      throw safe(e);
    }
  }
  return {
    delivery: deps.delivery ?? 'email',
    hasPendingInvitation: () => pending !== null && owner === key(),
    getScope: deps.scope,
    scopeKey: key,
    invite(email: string): Promise<AdminInvitation> {
      let stamp: string, input: ReturnType<typeof parseAdminInvitation>;
      try {
        const captured = capture(true);
        stamp = captured.stamp;
        input = parseAdminInvitation({
          action: 'invite-administrator',
          requestId:
            pending && 'requestId' in pending
              ? pending.requestId
              : deps.requestId(),
          barbershopId: captured.scope.barbershopId,
          email,
        });
        if (input.action !== 'invite-administrator')
          throw new BusinessError('INVALID_INPUT');
        if (pending && JSON.stringify(pending) !== JSON.stringify(input))
          throw new BusinessError('CONFLICT');
        if (flight) return flight;
      } catch (e) {
        return Promise.reject(safe(e));
      }
      if (input.action !== 'invite-administrator')
        return Promise.reject(new BusinessError('INVALID_INPUT'));
      const { action: _, ...data } = input;
      void _;
      pending = input;
      const work = Promise.resolve()
        .then(() => deps.gateway.createAdmin(data))
        .then((result) => {
          current(stamp);
          pending = null;
          return result;
        })
        .catch((e) => {
          current(stamp);
          const error = safe(e);
          if (error.code !== 'DEPENDENCY_UNAVAILABLE') pending = null;
          throw error;
        })
        .finally(() => {
          if (flight === work) flight = null;
        });
      flight = work;
      return work;
    },
    loadOwn: () => run(false, () => deps.gateway.listAdmin(null)),
    loadOutgoing: () =>
      run(true, (s) => deps.gateway.listAdmin(s.barbershopId!)),
    async respond(id: string, decision: 'accept' | 'reject') {
      if (decision !== 'accept' && decision !== 'reject')
        throw new BusinessError('INVALID_INPUT');
      const result = await run(false, () =>
        deps.gateway.respondAdmin(teamId(id), decision),
      );
      if (decision === 'accept')
        try {
          await deps.onAccepted?.();
        } catch {
          /* Acceptance committed; context must still be refreshed from the server. */
        }
      return result;
    },
    cancel: (id: string) =>
      run(true, () => deps.gateway.cancelAdmin(teamId(id))),
    retryMail: (id: string) =>
      run(true, () => deps.gateway.retryAdminMail(teamId(id))),
  };
}
export type AdminInvitationsApplication = ReturnType<
  typeof createAdminInvitations
>;
