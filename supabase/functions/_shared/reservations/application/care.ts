import { careCommand } from '../domain/care.ts';
import { reservationActor } from '../domain/reservation-input.ts';
export interface CareAtomicGateway {
  execute(actorId: string, input: Record<string, unknown>): Promise<unknown>;
}
export function createCareOperation(gateway: CareAtomicGateway) {
  return (actor: unknown, raw: unknown) =>
    gateway.execute(reservationActor(actor).userId, careCommand(raw));
}
