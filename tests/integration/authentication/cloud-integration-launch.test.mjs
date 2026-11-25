import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cloudIntegrationEnvironment } from '../../../scripts/cloud-integration-environment.mjs';
test('approved Cloud launch keeps authority and administrative invitations enabled after restart', () => {
  const env = cloudIntegrationEnvironment(
    {},
    {
      url: 'https://vuoncrtkkkquvddunrxx.supabase.co',
      publishableKey: 'sb_publishable_integrated_runtime_fixture',
    },
  );
  assert.equal(env.EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY, 'true');
  assert.equal(env.EXPO_PUBLIC_CLOUD_ENABLE_ADMIN_INVITATIONS, 'true');
});

test('Cloud launch strips secrets and local overrides without mutating the parent', () => {
  const parent = {
    PATH: 'fixture',
    SUPABASE_ACCESS_TOKEN: 'private-fixture',
    EXPO_PUBLIC_ENABLE_ADMIN_INVITATIONS: 'true',
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'local-fixture',
  };
  const before = structuredClone(parent);
  const env = cloudIntegrationEnvironment(parent, {
    url: 'https://vuoncrtkkkquvddunrxx.supabase.co',
    publishableKey: 'sb_publishable_integrated_runtime_fixture',
  });
  assert.deepEqual(parent, before);
  assert.equal(env.SUPABASE_ACCESS_TOKEN, undefined);
  assert.equal(env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, undefined);
  assert.equal(env.EXPO_PUBLIC_ENABLE_ADMIN_INVITATIONS, undefined);
  assert.equal(env.PATH, 'fixture');
  assert.throws(() =>
    cloudIntegrationEnvironment({}, { url: 'https://other.supabase.co' }),
  );
});
