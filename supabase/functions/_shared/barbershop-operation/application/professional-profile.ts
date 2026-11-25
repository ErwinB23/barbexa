import { BusinessError } from '../domain/values.ts';
import {
  profileCommand,
  professionalProfile,
  type ProfileCommand,
} from '../domain/professional-profile.ts';
import type { VerifiedActor } from '../domain/types.ts';
export interface ProfessionalProfileGateway {
  executeProfessionalProfile(
    actor: VerifiedActor,
    command: ProfileCommand,
  ): Promise<unknown>;
}
export async function executeProfessionalProfile(
  gateway: ProfessionalProfileGateway,
  actor: VerifiedActor,
  raw: unknown,
) {
  const command = profileCommand(raw);
  const result = professionalProfile(
    await gateway.executeProfessionalProfile(actor, command),
  );
  if (
    result.userId !== actor.userId ||
    result.barbershopId !== command.barbershopId
  )
    throw new BusinessError('FORBIDDEN');
  return result;
}
