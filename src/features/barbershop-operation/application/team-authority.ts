import {
  decodeTeamAuthority,
  type TeamAuthority,
  type AuthorityMutation,
} from '../domain/team-authority';
import { BusinessError } from '../domain/values';
import type { OperationScope } from './operation-scope';
export interface TeamAuthorityGateway {
  getAuthority(shop: string): Promise<unknown>;
  commandAuthority?(
    input: AuthorityMutation & {
      barbershopId: string;
      expectedVersion: number;
    },
  ): Promise<unknown>;
}
export function createTeamAuthority(deps: {
  gateway: TeamAuthorityGateway;
  scope: () => OperationScope | null;
}) {
  type Snapshot = {
    phase: 'idle' | 'loading' | 'ready' | 'error';
    value: TeamAuthority | null;
    scopeKey: string;
  };
  let snapshot: Snapshot = { phase: 'idle', value: null, scopeKey: '' };
  const listeners = new Set<() => void>();
  let sequence = 0;
  let flight: { key: string; promise: Promise<void> } | null = null;
  type Command = AuthorityMutation & {
    barbershopId: string;
    expectedVersion: number;
  };
  const pending = new Map<string, { signature: string; input: Command }>();
  let pendingScope = '';
  const scopeKey = () => {
    const s = deps.scope();
    return s?.barbershopId
      ? `${s.userId}:${s.generation}:${s.barbershopId}:${s.role}`
      : '';
  };
  const publish = (value: Snapshot) => {
    snapshot = Object.freeze(value);
    for (const l of listeners) l();
  };
  const invalidate = () => {
    sequence++;
    flight = null;
    publish({ phase: 'error', value: null, scopeKey: scopeKey() });
  };
  return {
    invalidate,
    scopeKey,
    getSnapshot: () => snapshot,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    read(refresh = false): Promise<void> {
      const key = scopeKey(),
        s = deps.scope();
      if (!key || !s?.barbershopId) {
        sequence++;
        flight = null;
        publish({ phase: 'idle', value: null, scopeKey: '' });
        return Promise.resolve();
      }
      if (flight?.key === key) return flight.promise;
      if (!refresh && snapshot.scopeKey === key && snapshot.phase === 'ready')
        return Promise.resolve();
      // Keep already verified controls mounted during same-context revalidation.
      // Writers still await this request; failure/context change removes authority.
      const previous =
        snapshot.scopeKey === key && snapshot.phase === 'ready'
          ? snapshot.value
          : null;
      publish({
        phase: previous ? 'ready' : 'loading',
        value: previous,
        scopeKey: key,
      });
      const ticket = ++sequence;
      const task = Promise.resolve()
        .then(() => deps.gateway.getAuthority(s.barbershopId!))
        .then((value) => {
          if (scopeKey() !== key || ticket !== sequence) return;
          publish({
            phase: 'ready',
            value: decodeTeamAuthority(value, s.userId, s.barbershopId!),
            scopeKey: key,
          });
        })
        .catch(() => {
          if (scopeKey() === key && ticket === sequence)
            publish({ phase: 'error', value: null, scopeKey: key });
        })
        .finally(() => {
          if (ticket === sequence) flight = null;
        });
      flight = { key, promise: task };
      return task;
    },
    async execute(command: AuthorityMutation): Promise<unknown> {
      const key = scopeKey();
      await this.read(true);
      const value =
        snapshot.scopeKey === key && snapshot.phase === 'ready'
          ? snapshot.value
          : null;
      if (
        !key ||
        scopeKey() !== key ||
        !value ||
        value.capacity === 'unregularized' ||
        !deps.gateway.commandAuthority
      )
        throw new BusinessError('FORBIDDEN');
      if (
        command.action !== 'reject-ownership-transfer' &&
        !value.permissions.manageAdministrators
      )
        throw new BusinessError('FORBIDDEN');
      if (pendingScope !== key) {
        pending.clear();
        pendingScope = key;
      }
      const signature = JSON.stringify(command);
      const old = pending.get(command.requestId);
      if (old && old.signature !== signature)
        throw new BusinessError('CONFLICT');
      const input = old?.input ?? {
        ...command,
        barbershopId: value.barbershopId,
        expectedVersion: value.version,
      };
      pending.set(command.requestId, { signature, input });
      let result: unknown;
      try {
        result = await deps.gateway.commandAuthority(input);
        pending.delete(command.requestId);
      } catch (error) {
        if (
          error instanceof BusinessError &&
          error.code !== 'DEPENDENCY_UNAVAILABLE'
        )
          pending.delete(command.requestId);
        if (
          error instanceof BusinessError &&
          ['FORBIDDEN', 'UNAUTHENTICATED'].includes(error.code)
        )
          invalidate();
        throw error;
      }
      if (scopeKey() !== key) throw new BusinessError('FORBIDDEN');
      await this.read(true);
      return result;
    },
  };
}
export type TeamAuthorityApplication = ReturnType<typeof createTeamAuthority>;
