// Verification tooling only: waiting never triggers or retries a business action.
export function createCaptureWaiter({
  read,
  hasErrors,
  timeoutMs = 25000,
  intervalMs = 100,
  now = Date.now,
  pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  return async function waitCapture(kind) {
    const end = now() + timeoutMs;
    while (now() < end) {
      if (hasErrors()) throw new Error('BROWSER_ERROR_STOP');
      const response = read(kind);
      if (response) {
        if (response.status !== 200) throw new Error('HTTP_RESPONSE_NOT_OK');
        if (!response.body || typeof response.body !== 'object')
          throw new Error('INVALID_CAPTURE_BODY');
        return response.body;
      }
      await pause(intervalMs);
    }
    throw new Error('WRITE_RESPONSE_UNCERTAIN_' + kind);
  };
}
