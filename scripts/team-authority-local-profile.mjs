// Preparation only: does not start Expo, access Auth or rewrite any environment file.
import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
export function teamAuthorityLocalEnvironment(inherited, publicKey) {
  if (typeof publicKey !== 'string' || !publicKey.trim())
    throw Error('LOCAL_PUBLIC_KEY_REQUIRED');
  // Only an anon/publishable key; a privileged JWT must never enter a Web build.
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publicKey)) {
    try {
      const value = JSON.parse(
        Buffer.from(publicKey.split('.')[1], 'base64url').toString('utf8'),
      );
      if (
        value.role !== 'anon' ||
        value.ref ||
        !['supabase', 'supabase-demo'].includes(value.iss)
      )
        throw Error();
    } catch {
      throw Error('LOCAL_PUBLIC_KEY_REQUIRED');
    }
  }
  const env = { ...inherited };
  for (const name of Object.keys(env))
    if (name.startsWith('EXPO_PUBLIC_CLOUD_')) delete env[name];
  return {
    ...env,
    APP_VARIANT: 'development',
    CI: 'false',
    EXPO_PUBLIC_APP_ENVIRONMENT: 'local-team-authority',
    EXPO_PUBLIC_TEAM_LOCAL_URL: 'http://127.0.0.1:54421',
    EXPO_PUBLIC_TEAM_LOCAL_PUBLISHABLE_KEY: publicKey,
    EXPO_PUBLIC_ENABLE_GOOGLE: 'false',
  };
}
export function readTeamAuthorityLocalEnvironment(inherited = process.env) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const source = parseEnv(
    fs.readFileSync(path.join(root, '.env.local'), 'utf8'),
  );
  const config = fs.readFileSync(
    path.join(root, 'supabase/config.toml'),
    'utf8',
  );
  if (
    !/^project_id = "app-barberia-002-local"/m.test(config) ||
    !/\[api\][\s\S]*?\nport = 54421\b/.test(config) ||
    (source.EXPO_PUBLIC_SUPABASE_URL !== undefined &&
      source.EXPO_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54421')
  )
    throw Error('LOCAL_ENVIRONMENT_SOURCE_NOT_VERIFIED');
  return teamAuthorityLocalEnvironment(
    inherited,
    source.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv[2] !== '--check') throw Error('PREPARATION_ONLY_USE_CHECK');
  readTeamAuthorityLocalEnvironment();
  console.log(
    JSON.stringify({
      prepared: true,
      profile: 'local-team-authority',
      platform: 'web',
      backend: 'http://127.0.0.1:54421',
      project: 'app-barberia-002-local',
      separateSessionNamespace: true,
      google: false,
      servicesStarted: false,
      environmentFilesWritten: false,
    }),
  );
}
