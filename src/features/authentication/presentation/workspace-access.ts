import type { SessionView } from '../domain/session-state';

// Optional, verified at the composition boundary. Undefined preserves the deployed contract.
export interface WorkspaceAuthority {
  readonly userId: string;
  readonly barbershopId: string;
  readonly capacity:
    'owner' | 'secondary' | 'barber' | 'unregularized' | 'unavailable';
  readonly permissions: {
    readonly editServices: boolean;
    readonly manageTeam: boolean;
  };
}
// Presentation only. The server still validates each operation and active membership.
export function workspaceAccess(
  state: SessionView,
  authority?: WorkspaceAuthority,
) {
  const context = state.kind === 'ready' ? state.context : null;
  const selected = context?.kind === 'selected' ? context.context : null;
  const hasWorkspaces =
    !!selected ||
    (context?.kind === 'choosing' &&
      context.memberships.some(
        (m) =>
          m.userId === (state.kind === 'ready' ? state.identity.userId : '') &&
          m.status === 'active',
      ));
  const verified =
    authority &&
    state.kind === 'ready' &&
    authority.userId === state.identity.userId &&
    authority.barbershopId === selected?.barbershopId;
  const administrator =
    selected?.role === 'administrator' &&
    (!authority || (verified && authority.permissions.editServices));
  return {
    hasWorkspaces,
    administrator: !!administrator,
    manageTeam: authority
      ? !!(verified && authority.permissions.manageTeam)
      : !!administrator,
    capacity: verified ? authority.capacity : undefined,
    professional: selected?.role === 'barber',
    selected: !!selected,
  };
}
