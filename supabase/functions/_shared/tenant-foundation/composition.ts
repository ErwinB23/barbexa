import { createOwnBarbershop } from './application/create-own-barbershop.ts';
import { createBarbershopHandler } from './presentation/create-barbershop-handler.ts';
import { ensureOwnProfile } from './application/ensure-own-profile.ts';
import { createAuthVerificationAdapter } from './infrastructure/auth-verification-adapter.ts';
import { createPostgresFoundationAdapter } from './infrastructure/postgres-foundation-adapter.ts';
import { createEnsureProfileHandler } from './presentation/ensure-profile-handler.ts';
export function createEnsureProfileService(
  operation: 'profile' | 'barbershop' = 'profile',
) {
  const required = (name: string) => {
    const value = Deno.env.get(name);
    if (!value) throw Error('SERVER_CONFIGURATION_MISSING');
    return value;
  };
  const baseUrl = required('SUPABASE_URL');
  const verifyActor = createAuthVerificationAdapter({
    baseUrl,
    publicKey: required('SUPABASE_ANON_KEY'),
  });
  const gateway = createPostgresFoundationAdapter({
    baseUrl,
    serviceKey:
      Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
      required('SUPABASE_SERVICE_ROLE_KEY'),
  });
  const allowedOrigins = (Deno.env.get('BARBERIA_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (operation === 'barbershop')
    return createBarbershopHandler({
      verifyActor,
      createOwnBarbershop: (actor, input) =>
        createOwnBarbershop(gateway, actor, input),
      allowedOrigins,
      log: (event) => console.info(JSON.stringify(event)),
    });
  return createEnsureProfileHandler({
    verifyActor,
    ensureOwnProfile: (actor, input) => ensureOwnProfile(gateway, actor, input),
    allowedOrigins,
    log: (event) => console.info(JSON.stringify(event)),
  });
}
