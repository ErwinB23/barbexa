import { BusinessError } from '../domain/values';
import {
  profileCommand,
  professionalProfile,
  type ProfileCommand,
} from '../domain/professional-profile';
import type { OperationScope } from './operation-scope';
export interface ProfessionalProfileGateway {
  executeProfessionalProfile(command: ProfileCommand): Promise<unknown>;
}
export function createProfessionalProfile(deps: {
  gateway: ProfessionalProfileGateway;
  scope: () => OperationScope | null;
}) {
  const scopeKey = () => {
    const s = deps.scope();
    return s ? `${s.userId}:${s.generation}:${s.barbershopId}:${s.role}` : '';
  };
  let writing = false;
  async function execute(raw?: unknown) {
    const s = deps.scope(),
      stamp = scopeKey(),
      write = raw !== undefined;
    if (!s) throw new BusinessError('UNAUTHENTICATED');
    if (!s.barbershopId || !['barber', 'administrator'].includes(s.role ?? ''))
      throw new BusinessError('FORBIDDEN');
    if (write && writing) throw new BusinessError('CONFLICT');
    if (write) writing = true;
    try {
      const command = profileCommand({
        action: write
          ? 'update-own-professional-profile'
          : 'get-own-professional-profile',
        barbershopId: s.barbershopId,
        ...(write ? { profile: raw } : {}),
      });
      const result = professionalProfile(
        await deps.gateway.executeProfessionalProfile(command),
      );
      if (
        scopeKey() !== stamp ||
        result.userId !== s.userId ||
        result.barbershopId !== s.barbershopId
      )
        throw new BusinessError('FORBIDDEN');
      return result;
    } finally {
      if (write) writing = false;
    }
  }
  return {
    scopeKey,
    read: () => execute(),
    save: (draft: unknown) => execute(draft),
  };
}
export type ProfessionalProfileApplication = ReturnType<
  typeof createProfessionalProfile
>;
