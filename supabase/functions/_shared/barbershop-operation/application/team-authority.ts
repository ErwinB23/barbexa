import {
  parseAuthorityCommand,
  type AuthorityCommand,
} from '../domain/team-authority.ts';
import { BusinessError } from '../domain/values.ts';
import type { VerifiedActor } from '../domain/types.ts';
export interface TeamAuthorityPersistence {
  execute(actor: VerifiedActor, command: AuthorityCommand): Promise<unknown>;
}
export async function executeAuthority(
  repository: TeamAuthorityPersistence,
  actor: VerifiedActor,
  input: unknown,
) {
  if (
    !actor ||
    typeof actor.userId !== 'string' ||
    !/^[a-f0-9-]{36}$/i.test(actor.userId)
  )
    throw new BusinessError('UNAUTHENTICATED');
  const command = parseAuthorityCommand(input);
  // Deliberately cannot confirm until the previous owner's disposition is approved.
  if (command.action === 'accept-ownership-transfer')
    throw new BusinessError('CONFLICT');
  return await repository.execute({ userId: actor.userId }, command);
}
