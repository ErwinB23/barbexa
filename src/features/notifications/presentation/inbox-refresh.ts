export function startInboxRefresh(p: {
  load: () => void;
  visible: () => boolean;
  interval: (callback: () => void, ms: number) => () => void;
  listen: (
    event: 'focus' | 'visibilitychange',
    callback: () => void,
  ) => () => void;
}) {
  let active = true;
  const refresh = () => {
    if (active && p.visible()) p.load();
  };
  refresh();
  const stopTimer = p.interval(refresh, 5000);
  const stopFocus = p.listen('focus', refresh);
  const stopVisibility = p.listen('visibilitychange', refresh);
  return () => {
    active = false;
    stopTimer();
    stopFocus();
    stopVisibility();
  };
}
