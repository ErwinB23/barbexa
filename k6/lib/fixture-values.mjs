import { projectId } from './safety.mjs';
import { randomBytes } from 'node:crypto';
export function syntheticPassword() {
  return 'aA7!' + randomBytes(24).toString('base64url');
}
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function sqlId(id) {
  if (!uuid.test(id)) throw Error('INVALID_OWNED_UUID');
  return "'" + id + "'";
}
export function fixtureManifest(value) {
  if (
    !value ||
    value.projectId !== projectId ||
    !uuid.test(value.runId) ||
    !Array.isArray(value.accounts) ||
    !Array.isArray(value.tenants)
  )
    throw Error('FOREIGN_FIXTURE_MANIFEST');
  return value;
}
export function sessionFresh(
  account,
  remainingSeconds,
  now = Date.now() / 1000,
) {
  return (
    !!account.session?.access_token &&
    account.session.expires_at > now + remainingSeconds
  );
}
