import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Linter } from 'eslint';
import { createCaptureWaiter } from '../../../scripts/team-authority-response-capture.mjs';

function fixture({ response, broken = false, onPause } = {}) {
  let time = 0;
  let pauses = 0;
  const waitCapture = createCaptureWaiter({
    read: () => response,
    hasErrors: () => broken,
    now: () => time,
    timeoutMs: 30,
    intervalMs: 10,
    pause: async (ms) => {
      time += ms;
      pauses++;
      response = onPause?.(pauses) ?? response;
    },
  });
  return { waitCapture, pauses: () => pauses };
}

test('waitCapture is initialized before any action and awaits the actual HTTP response', async () => {
  const body = { ok: true, role: 'barber', status: 'active' };
  const f = fixture({
    onPause: (n) => (n === 2 ? { status: 200, body } : undefined),
  });
  assert.equal(typeof f.waitCapture, 'function');
  assert.equal(f.pauses(), 0);
  assert.equal(await f.waitCapture('remove'), body);
  assert.equal(f.pauses(), 2);
});

for (const status of [400, 401, 403, 409, 500, 503])
  test(`HTTP ${status} cannot be recorded as a completed removal`, async () => {
    const f = fixture({ response: { status, body: { ok: false } } });
    await assert.rejects(f.waitCapture('remove'), {
      message: 'HTTP_RESPONSE_NOT_OK',
    });
  });

test('a browser error prevents a success claim even if an HTTP body is available', async () => {
  const f = fixture({
    broken: true,
    response: { status: 200, body: { ok: true } },
  });
  await assert.rejects(f.waitCapture('remove'), {
    message: 'BROWSER_ERROR_STOP',
  });
});

test('an uncertain response times out without invoking another action', async () => {
  const f = fixture();
  await assert.rejects(f.waitCapture('remove'), {
    message: 'WRITE_RESPONSE_UNCERTAIN_remove',
  });
  assert.equal(f.pauses(), 3);
});

test('HTTP success without a valid response body cannot complete a removal', async () => {
  const f = fixture({ response: { status: 200, body: null } });
  await assert.rejects(f.waitCapture('remove'), {
    message: 'INVALID_CAPTURE_BODY',
  });
});

test('the preflight binding check catches the original omitted waitCapture helper', () => {
  const linter = new Linter();
  const config = {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: { 'no-undef': 'error' },
  };
  const old = linter.verify(
    "const removed = await waitCapture('remove');",
    config,
  );
  assert.equal(old.length, 1);
  assert.equal(old[0].ruleId, 'no-undef');
  const corrected = linter.verify(
    "import { createCaptureWaiter } from './capture.mjs'; const waitCapture = createCaptureWaiter({}); const removed = await waitCapture('remove');",
    config,
  );
  assert.equal(corrected.length, 0);
});
