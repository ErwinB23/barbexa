import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';
import type { Inbox } from '../application/inbox';
import { startInboxRefresh } from './inbox-refresh';
export const InboxContext = createContext<Inbox | null>(null);
const empty = Object.freeze({
  phase: 'unavailable' as const,
  items: [],
  unread: 0,
  canRemove: false,
  unseen: 0,
  busy: false,
});
const subscribe = () => () => {};
export function useInbox() {
  const app = useContext(InboxContext);
  const state = useSyncExternalStore(
    app?.subscribe ?? subscribe,
    app?.getSnapshot ?? (() => empty),
    () => empty,
  );
  return { app, state };
}
export function InboxRefresh({ identity }: { identity: string }) {
  const { app } = useInbox();
  useEffect(() => {
    if (!app || !identity) return;
    return startInboxRefresh({
      load: () => {
        void app.refresh();
      },
      visible: () => document.visibilityState === 'visible',
      interval: (callback, ms) => {
        const timer = window.setInterval(callback, ms);
        return () => window.clearInterval(timer);
      },
      listen: (event, callback) => {
        const target = event === 'visibilitychange' ? document : window;
        target.addEventListener(event, callback);
        return () => target.removeEventListener(event, callback);
      },
    });
  }, [app, identity]);
  return null;
}
