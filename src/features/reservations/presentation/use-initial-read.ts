import { useEffect, useRef } from 'react';

// Read once per selected scope. Refreshing the callback must not discard edits.
export function useInitialRead(
  enabled: boolean,
  scopeKey: string,
  onRead: () => void,
) {
  const read = useRef(onRead);
  useEffect(() => {
    read.current = onRead;
  }, [onRead]);
  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => {
      if (mounted && enabled) read.current();
    });
    return () => {
      mounted = false;
    };
  }, [enabled, scopeKey]);
}
