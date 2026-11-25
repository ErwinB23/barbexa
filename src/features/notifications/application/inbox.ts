export interface Notice {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly target: '/staff' | '/my-reservations' | '/agenda';
  readonly createdAt: string;
  readonly readAt: string | null;
}
export interface InboxGateway {
  list(): Promise<{
    items: readonly Notice[];
    unread: number;
    canRemove?: boolean;
  }>;
  remove?(id: string): Promise<void>;
  read(id: string): Promise<void>;
}
export interface SeenNotices {
  readonly at: string;
  readonly ids: readonly string[];
}
export function createInbox(deps: {
  scope: () => string;
  viewer?: () => string;
  seen?: {
    get: (viewer: string) => SeenNotices | null;
    set: (viewer: string, value: SeenNotices) => void;
  };
  gateway: InboxGateway;
}) {
  const memory = new Map<string, SeenNotices>();
  const viewer = () => deps.viewer?.() ?? deps.scope();
  const marker = () => memory.get(viewer()) ?? deps.seen?.get(viewer());
  function unseen(items: readonly Notice[], unread: number) {
    const seen = marker();
    if (!seen) return unread;
    return items.filter(
      (n) =>
        !n.readAt &&
        (Date.parse(n.createdAt) > Date.parse(seen.at) ||
          (Date.parse(n.createdAt) === Date.parse(seen.at) &&
            !seen.ids.includes(n.id))),
    ).length;
  }
  const empty = () => ({
    phase: 'idle' as 'idle' | 'loading' | 'ready' | 'error' | 'unavailable',
    items: [] as readonly Notice[],
    unread: 0,
    canRemove: false,
    unseen: 0,
    busy: false,
  });
  let state = empty(),
    owner = deps.scope(),
    ticket = 0,
    pending = false;
  const listeners = new Set<() => void>();
  let active: Promise<void> | undefined;
  const queuedReads = new Map<string, Promise<void>>();
  function markRead(id: string): Promise<void> {
    const scope = deps.scope();
    const key = `${scope}:${id}`;
    const queued = queuedReads.get(key);
    if (queued) return queued;
    const result = (async () => {
      // A toggle must not be lost while the background refresh or another read runs.
      while (active) await active;
      if (scope !== deps.scope() || !scope) return;
      if (state.items.find((n) => n.id === id)?.readAt) return;
      await run(id);
    })();
    queuedReads.set(key, result);
    void result.finally(() => queuedReads.delete(key));
    return result;
  }
  function removeNotice(id: string): Promise<void> {
    const scope = deps.scope();
    const key = `${scope}:remove:${id}`;
    const queued = queuedReads.get(key);
    if (queued) return queued;
    const result = (async () => {
      while (active) await active;
      if (
        !scope ||
        scope !== deps.scope() ||
        !state.canRemove ||
        !deps.gateway.remove ||
        !state.items.some((n) => n.id === id)
      )
        return;
      await run(id, false, true);
    })();
    queuedReads.set(key, result);
    void result.finally(() => queuedReads.delete(key));
    return result;
  }
  const publish = (next: typeof state) => {
    state = Object.freeze(next);
    for (const listener of listeners) listener();
  };
  function invalidate() {
    owner = deps.scope();
    ticket++;
    pending = false;
    publish(empty());
  }
  function invalidateScope() {
    if (owner !== deps.scope()) invalidate();
  }
  function run(
    id?: string,
    background = false,
    removal = false,
  ): Promise<void> {
    if (pending) return Promise.resolve();
    const result = execute(id, background, removal);
    if (!pending) return result;
    active = result;
    void result.finally(() => {
      if (active === result) active = undefined;
    });
    return result;
  }
  async function execute(id?: string, background = false, removal = false) {
    invalidateScope();
    const scope = deps.scope();
    if (!scope || pending) return;
    pending = true;
    const version = ++ticket;
    const silent = background && state.phase === 'ready';
    if (!silent)
      publish({ ...state, phase: id ? state.phase : 'loading', busy: true });
    try {
      if (id) {
        if (removal) await deps.gateway.remove!(id);
        else await deps.gateway.read(id);
      }
      if (scope !== deps.scope() || version !== ticket) return;
      const result = await deps.gateway.list();
      if (scope === deps.scope() && version === ticket) {
        if (
          !silent ||
          result.unread !== state.unread ||
          (result.canRemove === true) !== state.canRemove ||
          JSON.stringify(result.items) !== JSON.stringify(state.items)
        )
          publish({
            ...result,
            canRemove: result.canRemove === true,
            unseen: unseen(result.items, result.unread),
            phase: 'ready',
            busy: false,
          });
      }
    } catch (e) {
      if (scope === deps.scope() && version === ticket) {
        const denied = e instanceof Error && e.message === 'UNAUTHENTICATED';
        if (silent && !denied) return;
        publish({
          ...(denied ? empty() : state),
          phase:
            e instanceof Error && e.message === 'NOTIFICATIONS_NOT_INSTALLED'
              ? 'unavailable'
              : 'error',
          busy: false,
        });
      }
    } finally {
      if (version === ticket) {
        pending = false;
        if (state.busy) publish({ ...state, busy: false });
      }
    }
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    invalidate,
    invalidateScope,
    load: () => run(),
    refresh: () => run(undefined, true),
    markRead,
    removeNotice,
    acknowledge: () => {
      invalidateScope();
      if (state.phase !== 'ready' || !viewer()) return;
      const dates = state.items.filter((n) =>
        Number.isFinite(Date.parse(n.createdAt)),
      );
      if (!dates.length) return;
      const latest = dates.reduce((a, b) =>
        Date.parse(a.createdAt) >= Date.parse(b.createdAt) ? a : b,
      ).createdAt;
      const previous = marker();
      if (previous && Date.parse(previous.at) > Date.parse(latest)) return;
      const value: SeenNotices = {
        at: latest,
        ids: [
          ...new Set([
            ...(previous && Date.parse(previous.at) === Date.parse(latest)
              ? previous.ids
              : []),
            ...dates
              .filter((n) => Date.parse(n.createdAt) === Date.parse(latest))
              .map((n) => n.id),
          ]),
        ],
      };
      memory.set(viewer(), value);
      deps.seen?.set(viewer(), value);
      if (state.unseen) publish({ ...state, unseen: 0 });
    },
  };
}
export type Inbox = ReturnType<typeof createInbox>;
