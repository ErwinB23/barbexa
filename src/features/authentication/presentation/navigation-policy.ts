import type { SessionView, ReturnIntent } from '../domain/session-state';
// Exact allowlist of mounted private destinations; never accept query roles or actors.
export function safeReturnIntent(input: unknown): ReturnIntent {
  return input === '/context' ? input : '/account';
}
export function canEnterAccount(state: SessionView): boolean {
  return state.kind === 'ready';
}
// Retaining a route is not permission to render it: unresolved routes stay hidden.
export function retainAccountRoute(state: SessionView): boolean {
  return canEnterAccount(state) || isSessionVerificationPending(state);
}
export function isSessionVerificationPending(state: SessionView): boolean {
  return (
    state.kind === 'resolving' ||
    (state.kind === 'retryable-error' &&
      ['network-unavailable', 'provider-unavailable'].includes(state.error))
  );
}
