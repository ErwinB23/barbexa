import { BusinessError } from './domain/values.ts';
import { executeProfessionalProfile } from './application/professional-profile.ts';
import { executeOperation } from './application/operation.ts';
import { executeShopClosure } from './application/shop-closures.ts';
import { createPostgresOperationAdapter } from './infrastructure/postgres-operation-adapter.ts';
import { createOperationHandler } from './presentation/operation-handler.ts';
import { createAdminInvitationService } from './application/admin-invitations.ts';
import { createOwnSummaryService } from './application/own-summary.ts';
import { createTeamPersistence } from './infrastructure/team-postgres-adapter.ts';
import { createTeamAuthorityPersistence } from './infrastructure/team-authority-adapter.ts';
import { executeAuthority } from './application/team-authority.ts';
import {
  createLocalInvitationMail,
  createResendInvitationMail,
} from './infrastructure/invitation-mail-adapter.ts';
// Explicit source-level activation for the authorized LOCAL worker only. Cloud
// and other backends keep their independent feature flags and mail configuration.
export function localTeamConfiguration(
  project: string | undefined,
  apiUrl: string,
  databaseUrl: string | undefined,
  deploymentId: string | undefined,
) {
  if (
    project !== 'app-barberia-002-local' ||
    apiUrl !== 'http://kong:8000' ||
    deploymentId
  )
    return undefined;
  try {
    const db = new URL(databaseUrl ?? '');
    if (
      !['postgres:', 'postgresql:'].includes(db.protocol) ||
      db.hostname !== 'db' ||
      db.port !== '5432' ||
      db.pathname !== '/postgres'
    )
      return undefined;
  } catch {
    return undefined;
  }
  return {
    from: 'no-reply@example.invalid',
    webOrigin: 'http://localhost:8081',
    teamAuthorityEnabled: true as const,
  };
}
export function createBarbershopOperationService(
  verify: (token: string) => Promise<{ readonly userId: string }>,
  options: { readonly localProject?: 'app-barberia-002-local' } = {},
) {
  const required = (name: string) => {
    const v = Deno.env.get(name);
    if (!v) throw Error('SERVER_CONFIGURATION_MISSING');
    return v;
  };
  const baseUrl = required('SUPABASE_URL');
  const localTeam = localTeamConfiguration(
    options.localProject,
    baseUrl,
    Deno.env.get('SUPABASE_DB_URL'),
    Deno.env.get('DENO_DEPLOYMENT_ID'),
  );
  const gateway = createPostgresOperationAdapter({
    baseUrl,
    serviceKey:
      Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
      required('SUPABASE_SERVICE_ROLE_KEY'),
  });
  const teamGateway = createTeamPersistence({
    baseUrl,
    serviceKey:
      Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
      required('SUPABASE_SERVICE_ROLE_KEY'),
  });
  const mail = () => {
    if (localTeam)
      return createLocalInvitationMail({ ...localTeam, development: true });
    const options = {
      from: required('BARBERIA_INVITATION_FROM'),
      webOrigin: required('BARBERIA_INVITATION_WEB_ORIGIN'),
    };
    if (Deno.env.get('BARBERIA_INVITATION_MAIL_PROVIDER') === 'mailpit')
      return createLocalInvitationMail({
        ...options,
        development:
          Deno.env.get('BARBERIA_LOCAL_PROJECT') === 'app-barberia-002-local',
      });
    if (Deno.env.get('BARBERIA_INVITATION_MAIL_PROVIDER') === 'resend')
      return createResendInvitationMail({
        ...options,
        apiKey: required('RESEND_API_KEY'),
      });
    throw Error('SERVER_CONFIGURATION_MISSING');
  };
  const extensions = {
    professionalProfile: (actor: { userId: string }, command: unknown) =>
      executeProfessionalProfile(gateway, actor, command),
    shopClosures: (
      actor: { userId: string },
      command: Parameters<typeof executeShopClosure>[2],
    ) => executeShopClosure(gateway, actor, command),
    teamAuthority:
      localTeam?.teamAuthorityEnabled ||
      Deno.env.get('BARBERIA_ENABLE_TEAM_AUTHORITY') === 'true'
        ? (actor: { userId: string }, command: unknown) =>
            executeAuthority(
              createTeamAuthorityPersistence({
                baseUrl,
                serviceKey:
                  Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
                  required('SUPABASE_SERVICE_ROLE_KEY'),
              }),
              actor,
              command,
            )
        : undefined,
    adminInvitations:
      localTeam || Deno.env.get('BARBERIA_ENABLE_ADMIN_INVITATIONS') === 'true'
        ? createAdminInvitationService({
            repository: teamGateway,
            ...(Deno.env.get('BARBERIA_ADMIN_INVITATION_DELIVERY') === 'in-app'
              ? { delivery: 'in-app' as const }
              : { mail: mail() }),
            attemptId: () => crypto.randomUUID(),
          })
        : undefined,
    ownSummary:
      localTeam ||
      Deno.env.get('BARBERIA_ENABLE_PROFESSIONAL_SUMMARY') === 'true'
        ? createOwnSummaryService(teamGateway)
        : undefined,
  };
  return createOperationHandler({
    verifyActor: async (token) => {
      try {
        return await verify(token);
      } catch (e) {
        throw new BusinessError(
          e &&
            typeof e === 'object' &&
            'code' in e &&
            e.code === 'UNAUTHENTICATED'
            ? 'UNAUTHENTICATED'
            : 'DEPENDENCY_UNAVAILABLE',
        );
      }
    },
    execute: (actor, command) =>
      executeOperation(gateway, actor, command, gateway, extensions),
    allowedOrigins: (Deno.env.get('BARBERIA_ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    log: (event) => console.info(JSON.stringify(event)),
  });
}
