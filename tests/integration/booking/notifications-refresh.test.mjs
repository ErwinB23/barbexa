import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadCore } from './load-core.mjs';
test('automatic refresh runs every five seconds, on focus and visibility, recovers unavailable state and cleans up', () => {
  const { startInboxRefresh } = loadCore(
    'src/features/notifications/presentation/inbox-refresh.ts',
  );
  let reads = 0,
    visible = true,
    interval,
    cleared = false;
  const listeners = new Map();
  const stop = startInboxRefresh({
    load: () => {
      reads++;
    },
    visible: () => visible,
    interval: (callback, ms) => {
      assert.equal(ms, 5000);
      interval = callback;
      return () => {
        cleared = true;
      };
    },
    listen: (event, callback) => {
      listeners.set(event, callback);
      return () => listeners.delete(event);
    },
  });
  assert.equal(reads, 1);
  interval();
  assert.equal(reads, 2);
  visible = false;
  interval();
  assert.equal(reads, 2);
  visible = true;
  listeners.get('visibilitychange')();
  listeners.get('focus')();
  assert.equal(reads, 4);
  stop();
  interval();
  assert.equal(reads, 4);
  assert.equal(cleared, true);
  assert.equal(listeners.size, 0);
});
