import assert from 'node:assert/strict';
import { test } from 'node:test';
import { replacement } from '../../../scripts/local-auth-email-origin.mjs';
test('local Auth replacement changes only the three public email URLs and preserves security and identity', () => {
  const network = 'supabase_network_app-barberia-002-local';
  const original = {
    Id: 'fixture-container-id',
    Name: '/supabase_auth_app-barberia-002-local',
    Mounts: [],
    HostConfig: { NetworkMode: network },
    NetworkSettings: {
      Networks: {
        [network]: {
          IPAddress: '172.30.0.8',
          Aliases: ['supabase_auth_app-barberia-002-local'],
        },
      },
    },
    Config: {
      Env: [
        'GOTRUE_MAILER_AUTOCONFIRM=false',
        'API_EXTERNAL_URL=http://127.0.0.1:54421/auth/v1',
        'GOTRUE_MAILER_URLPATHS_CONFIRMATION=http://127.0.0.1:54421/auth/v1/verify',
        'GOTRUE_MAILER_URLPATHS_RECOVERY=http://127.0.0.1:54421/auth/v1/verify',
        'GOTRUE_SITE_URL=http://localhost:8081',
        'GOTRUE_URI_ALLOW_LIST=approved-fixture',
        'GOTRUE_JWT_ISSUER=unchanged-fixture',
      ],
    },
  };
  const next = replacement(original, 'http://192.168.0.33:54421');
  assert.equal(
    next.Env.filter((v, i) => v !== original.Config.Env[i]).length,
    3,
  );
  assert.ok(
    next.Env.includes('GOTRUE_MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify'),
  );
  assert.deepEqual(next.Env.slice(4), original.Config.Env.slice(4));
  for (const origin of [
    'https://remote.invalid',
    'http://8.8.8.8:54421',
    'http://192.168.0.33:80',
    'http://192.168.0.33:54421/other',
  ])
    assert.throws(() => replacement(original, origin));
  assert.throws(() =>
    replacement(
      { ...original, Name: '/supabase_auth_barberia-app' },
      'http://192.168.0.33:54421',
    ),
  );
  assert.throws(() =>
    replacement(
      { ...original, Mounts: [{ Type: 'volume' }] },
      'http://192.168.0.33:54421',
    ),
  );
  assert.throws(() =>
    replacement(
      { ...original, Config: { Env: [] } },
      'http://192.168.0.33:54421',
    ),
  );
});

test('recovery URL uses the same current LAN verify endpoint and preserves PKCE redirects/security', () => {
  const original = {
    Id: 'test-container',
    Name: '/supabase_auth_app-barberia-002-local',
    Mounts: [],
    HostConfig: { NetworkMode: 'supabase_network_app-barberia-002-local' },
    NetworkSettings: {
      Networks: {
        'supabase_network_app-barberia-002-local': {
          IPAddress: '172.19.0.2',
          Aliases: ['auth'],
        },
      },
    },
    Config: {
      Env: [
        'GOTRUE_MAILER_AUTOCONFIRM=false',
        'API_EXTERNAL_URL=http://192.168.0.33:54421/auth/v1',
        'GOTRUE_MAILER_URLPATHS_CONFIRMATION=http://192.168.0.33:54421/auth/v1/verify',
        'GOTRUE_MAILER_URLPATHS_RECOVERY=http://127.0.0.1:54421/auth/v1/verify',
        'GOTRUE_SITE_URL=http://localhost:8081',
        'GOTRUE_URI_ALLOW_LIST=http://localhost:8081/auth/callback,http://localhost:8081/auth/reset-password,appbarberia://auth/callback,appbarberia://auth/reset-password',
        'GOTRUE_JWT_SECRET=synthetic-not-a-secret',
      ],
    },
  };
  const next = replacement(original, 'http://192.168.0.16:54421');
  assert.ok(
    next.Env.includes('GOTRUE_MAILER_URLPATHS_RECOVERY=/auth/v1/verify'),
  );
  assert.equal(
    next.Env.filter((v, i) => v !== original.Config.Env[i]).length,
    3,
  );
  assert.deepEqual(next.Env.slice(4), original.Config.Env.slice(4));
  assert.deepEqual(
    next.NetworkingConfig.EndpointsConfig[
      'supabase_network_app-barberia-002-local'
    ].Aliases,
    ['auth'],
  );
  assert.deepEqual(
    original.Config.Env[3],
    'GOTRUE_MAILER_URLPATHS_RECOVERY=http://127.0.0.1:54421/auth/v1/verify',
  );
});

test('relative mail paths resolve to exactly one auth/v1 prefix for both return platforms', () => {
  for (const base of [
    'http://192.168.0.16:54421/auth/v1',
    'http://192.168.0.16:54421/auth/v1/',
  ]) {
    const url = new URL('/auth/v1/verify', base);
    assert.equal(url.href, 'http://192.168.0.16:54421/auth/v1/verify');
    for (const redirect of [
      'http://localhost:8081/auth/reset-password',
      'appbarberia://auth/reset-password',
    ]) {
      url.searchParams.set('redirect_to', redirect);
      assert.equal(url.pathname, '/auth/v1/verify');
      assert.equal(url.searchParams.get('redirect_to'), redirect);
    }
  }
});
