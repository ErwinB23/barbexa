import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fixtureManifest,
  sessionFresh,
  sqlId,
  syntheticPassword,
} from './lib/fixture-values.mjs';
const id = '11111111-1111-4111-8111-111111111111';
test('synthetic passwords satisfy the real Auth complexity policy', () => {
  for (let i = 0; i < 100; i++) {
    const password = syntheticPassword();
    assert.ok(password.length >= 32);
    for (const pattern of [/[a-z]/, /[A-Z]/, /[0-9]/, /[!@#$%^&*]/])
      assert.match(password, pattern);
  }
});
test('fixture ownership and SQL identifiers reject foreign or injected state', () => {
  const good = {
    projectId: 'barbexa-k6-lab',
    runId: id,
    accounts: [],
    tenants: [],
  };
  assert.equal(fixtureManifest(good), good);
  for (const patch of [{ projectId: 'other' }, { runId: "'; drop table t;--" }])
    assert.throws(() => fixtureManifest({ ...good, ...patch }));
  assert.equal(sqlId(id), "'" + id + "'");
  assert.throws(() => sqlId("' OR true--"));
});
test('only server-issued sessions with sufficient remaining lifetime can be exported', () => {
  const account = {
    id,
    session: { access_token: 'real-server-response', expires_at: 10000 },
  };
  assert.equal(sessionFresh(account, 600, 9000), true);
  assert.equal(sessionFresh(account, 1200, 9000), false);
  assert.equal(sessionFresh({ id }, 600, 9000), false);
});
