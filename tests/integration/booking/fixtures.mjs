// Reuse the checked SQL/JWT/directory helpers of 002; no credentials or new service.
export {
  fixtureCredentials,
  createOwnedDirectory,
  removeOwnedDirectory,
} from '../tenant-foundation/fixtures.mjs';

export async function waitForBookingBarrier(
  observe,
  release,
  { attempts = 100, poll = () => new Promise((r) => setTimeout(r, 50)) } = {},
) {
  // observe must query pg_stat_activity for the owned advisory-lock tag, not a timer.
  for (let i = 0; i < attempts; i++) {
    const waiting = await observe();
    if (waiting === 2) {
      await release();
      return;
    }
    if (!Number.isInteger(waiting) || waiting < 0 || waiting > 2)
      throw Error('UNEXPECTED_BARRIER_PARTICIPANTS');
    await poll();
  }
  throw Error('BOOKING_BARRIER_TIMEOUT');
}
