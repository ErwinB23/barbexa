// Approved integration profile. Public configuration only; server authorization remains definitive.
export function cloudIntegrationEnvironment(parent, config) {
  if (
    config?.url !== 'https://vuoncrtkkkquvddunrxx.supabase.co' ||
    !/^sb_publishable_[A-Za-z0-9_-]{16,200}$/.test(config?.publishableKey ?? '')
  )
    throw Error('CLOUD_PROFILE_CONFIGURATION_INVALID');
  const env = { ...parent };
  for (const name of Object.keys(env))
    if (
      name.startsWith('EXPO_PUBLIC_') ||
      [
        'SUPABASE_ACCESS_TOKEN',
        'SUPABASE_DB_PASSWORD',
        'PGPASSWORD',
        'PGSSLPASSWORD',
      ].includes(name)
    )
      delete env[name];
  return {
    ...env,
    APP_VARIANT: 'development',
    CI: '1',
    EXPO_NO_DOTENV: '1',
    EXPO_PUBLIC_APP_ENVIRONMENT: 'cloud-integration',
    EXPO_PUBLIC_CLOUD_SUPABASE_URL: config.url,
    EXPO_PUBLIC_CLOUD_SUPABASE_PUBLISHABLE_KEY: config.publishableKey,
    EXPO_PUBLIC_CLOUD_BACKEND_REVISION: '20261115230134',
    EXPO_PUBLIC_CLOUD_ENABLE_TEAM_AUTHORITY: 'true',
    EXPO_PUBLIC_CLOUD_ENABLE_ADMIN_INVITATIONS: 'true',
  };
}
