interface EnvironmentInput {
  development: boolean;
  platform: string;
  environment: string;
  publicKey?: string;
  metroHostUri?: string;
  webOrigin?: string;
  apiUrl?: string;
  publicWebOrigin?: string;
  cloudBackendRevision?: string;
}
// Operational release gate, set only after separately authorized deployment and
// SQL/HTTP verification. It is not an authorization claim or a server health check.
export const cloudBusinessRevision = '20261115230134';
export function assertCloudBusinessBackend(input: {
  baseUrl: string;
  publicKey: string;
  project: string;
  cloudBackendRevision?: string;
}) {
  if (
    input.baseUrl !== 'https://vuoncrtkkkquvddunrxx.supabase.co' ||
    input.project !== 'vuoncrtkkkquvddunrxx' ||
    input.cloudBackendRevision !== cloudBusinessRevision ||
    !/^sb_publishable_[A-Za-z0-9_-]{16,200}$/.test(input.publicKey)
  )
    throw Error('CLOUD_BUSINESS_NOT_RELEASED');
}
export function registrationEnvironment(input: EnvironmentInput) {
  if (!input.publicKey) throw Error('REGISTRATION_CONFIGURATION_MISSING');
  if (input.environment === 'local-team-authority') {
    if (
      !input.development ||
      input.platform !== 'web' ||
      input.webOrigin !== 'http://localhost:8081' ||
      input.apiUrl !== 'http://127.0.0.1:54421'
    )
      throw Error('LOCAL_TEAM_CONFIGURATION_MISSING');
    return {
      baseUrl: input.apiUrl,
      publicKey: input.publicKey,
      environment: 'local-team-authority',
      project: 'app-barberia-002-local',
      callbackUrl: 'http://localhost:8081/auth/callback',
      recoveryUrl: 'http://localhost:8081/auth/reset-password',
      developmentHttpOrigin: undefined,
    };
  }
  if (input.environment === 'cloud-integration') {
    if (
      !input.development ||
      !['web', 'android'].includes(input.platform) ||
      (input.platform === 'web' && input.webOrigin !== 'http://localhost:8081')
    )
      throw Error('REGISTRATION_CONFIGURATION_MISSING');
    const config = {
      baseUrl: input.apiUrl ?? '',
      publicKey: input.publicKey,
      project: 'vuoncrtkkkquvddunrxx',
      cloudBackendRevision: input.cloudBackendRevision,
    };
    assertCloudBusinessBackend(config);
    return {
      ...config,
      environment: 'cloud-integration',
      callbackUrl:
        input.platform === 'web'
          ? 'http://localhost:8081/auth/callback'
          : 'appbarberia://auth/callback',
      recoveryUrl:
        input.platform === 'web'
          ? 'http://localhost:8081/auth/reset-password'
          : 'appbarberia://auth/reset-password',
      developmentHttpOrigin: undefined,
    };
  }
  if (input.development && input.environment === 'local') {
    let baseUrl = 'http://127.0.0.1:54421';
    if (input.platform === 'android') {
      const host = new URL(`http://${input.metroHostUri}`).hostname;
      const parts = host.split('.').map(Number);
      if (
        parts.length !== 4 ||
        !parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) ||
        !(
          parts[0] === 10 ||
          (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
          (parts[0] === 192 && parts[1] === 168)
        )
      )
        throw Error('LOCAL_HOST_UNAVAILABLE');
      baseUrl = `http://${host}:54421`;
    } else if (
      input.platform !== 'web' ||
      input.webOrigin !== 'http://localhost:8081'
    )
      throw Error('UNAPPROVED_WEB_ORIGIN');
    return {
      baseUrl,
      publicKey: input.publicKey,
      environment: 'local',
      project: 'app-barberia-002-local',
      callbackUrl:
        input.platform === 'web'
          ? 'http://localhost:8081/auth/callback'
          : 'appbarberia://auth/callback',
      recoveryUrl:
        input.platform === 'web'
          ? 'http://localhost:8081/auth/reset-password'
          : 'appbarberia://auth/reset-password',
      developmentHttpOrigin: input.platform === 'android' ? baseUrl : undefined,
    };
  }
  // A production build never falls back to a local address/key.
  if (
    input.environment !== 'production' ||
    input.apiUrl !== 'https://vuoncrtkkkquvddunrxx.supabase.co' ||
    !input.publicWebOrigin?.startsWith('https://')
  )
    throw Error('REGISTRATION_CONFIGURATION_MISSING');
  const origin = new URL(input.publicWebOrigin).origin;
  assertCloudBusinessBackend({
    baseUrl: input.apiUrl,
    publicKey: input.publicKey,
    project: 'vuoncrtkkkquvddunrxx',
    cloudBackendRevision: input.cloudBackendRevision,
  });
  return {
    baseUrl: input.apiUrl,
    publicKey: input.publicKey,
    environment: 'production',
    cloudBackendRevision: input.cloudBackendRevision,
    project: 'vuoncrtkkkquvddunrxx',
    callbackUrl:
      input.platform === 'web'
        ? `${origin}/auth/callback`
        : 'appbarberia://auth/callback',
    recoveryUrl:
      input.platform === 'web'
        ? `${origin}/auth/reset-password`
        : 'appbarberia://auth/reset-password',
    developmentHttpOrigin: undefined,
  };
}
