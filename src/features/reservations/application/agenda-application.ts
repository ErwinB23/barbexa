import type { BookingDetail } from '../domain/types';
import { BusinessError, type BusinessErrorCode } from '../domain/values';
import { reservationId } from '../domain/reservation-input';
export interface AgendaFilters {
  readonly localDate: string;
  readonly barberId: string | null;
  readonly state: 'confirmed' | 'cancelled' | null;
}
export interface AgendaQuery extends AgendaFilters {
  readonly barbershopId: string;
}
export interface AgendaScope {
  readonly userId: string;
  readonly generation: number;
  readonly barbershopId: string;
  readonly role: 'administrator' | 'barber';
}
export interface AgendaGateway {
  listAgenda(query: AgendaQuery): Promise<readonly BookingDetail[]>;
}
export function agendaFilters(v: AgendaFilters): AgendaFilters {
  if (
    !v ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v.localDate) ||
    !Number.isFinite(Date.parse(v.localDate)) ||
    new Date(v.localDate).toISOString().slice(0, 10) !== v.localDate ||
    !['confirmed', 'cancelled', null].includes(v.state)
  )
    throw new BusinessError('INVALID_INPUT');
  return {
    ...v,
    barberId: v.barberId === null ? null : reservationId(v.barberId),
  };
}
export function createAgendaApplication(deps: {
  gateway: AgendaGateway;
  scope: () => AgendaScope | null;
  today: () => string;
}) {
  const initial = () => ({
    phase: 'idle' as 'idle' | 'loading' | 'ready' | 'error',
    rows: [] as readonly BookingDetail[],
    filters: agendaFilters({
      localDate: deps.today(),
      barberId: null,
      state: null,
    }),
    error: null as BusinessErrorCode | null,
  });
  let state = initial(),
    ticket = 0,
    owner = '',
    disposed = false;
  const listeners = new Set<() => void>();
  const key = () => {
    const s = deps.scope();
    return s ? `${s.userId}:${s.generation}:${s.barbershopId}:${s.role}` : '';
  };
  const publish = (s: typeof state) => {
    state = Object.freeze(s);
    for (const fn of listeners) fn();
  };
  function invalidateScope() {
    const next = key();
    if (next !== owner) {
      owner = next;
      ticket++;
      publish(initial());
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    invalidateScope,
    setFilters(filters: AgendaFilters) {
      invalidateScope();
      const s = deps.scope();
      const f = agendaFilters(filters);
      if (s?.role === 'barber' && f.barberId !== null)
        throw new BusinessError('FORBIDDEN');
      ticket++;
      publish({ ...state, filters: f, rows: [], phase: 'idle', error: null });
    },
    async load() {
      invalidateScope();
      const scope = deps.scope();
      if (!scope || disposed) return;
      const version = ++ticket,
        identity = key();
      publish({ ...state, rows: [], phase: 'loading', error: null });
      try {
        const rows = await deps.gateway.listAgenda({
          ...state.filters,
          barbershopId: reservationId(scope.barbershopId),
        });
        if (disposed || version !== ticket || key() !== identity) return;
        if (rows.some((r) => r.barbershopId !== scope.barbershopId))
          throw new BusinessError('DEPENDENCY_UNAVAILABLE');
        publish({ ...state, rows: [...rows], phase: 'ready' });
      } catch (e) {
        if (!disposed && version === ticket && key() === identity)
          publish({
            ...state,
            rows: [],
            phase: 'error',
            error:
              e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE',
          });
      }
    },
    dispose() {
      disposed = true;
      ticket++;
      state = initial();
      listeners.clear();
    },
  };
}
export type AgendaApplication = ReturnType<typeof createAgendaApplication>;
