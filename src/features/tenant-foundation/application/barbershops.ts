import { FoundationError } from '../domain/types';
import { dependency } from '../domain/validation';
import {
  barbershopInput,
  shopId,
  isBarbershop,
  createdBarbershop,
} from '../domain/barbershop-validation';
import type { BarbershopGateway } from './tenant-foundation-gateway';
export async function createOwnBarbershop(
  gateway: BarbershopGateway,
  input: unknown,
) {
  const value = barbershopInput(input);
  return createdBarbershop(
    await dependency(() => gateway.createOwnBarbershop(value)),
  );
}
export async function getBarbershop(gateway: BarbershopGateway, id: unknown) {
  const key = shopId(id);
  const value = await dependency(() => gateway.getBarbershop(key));
  if (value !== null && (!isBarbershop(value) || value.id !== key))
    throw new FoundationError('DEPENDENCY_UNAVAILABLE');
  return value;
}
export async function renameBarbershop(
  gateway: BarbershopGateway,
  id: unknown,
  name: unknown,
) {
  const key = shopId(id),
    input = barbershopInput({ name });
  const value = await dependency(() =>
    gateway.renameBarbershop(key, input.name),
  );
  if (value === null) throw new FoundationError('NOT_AVAILABLE');
  if (!isBarbershop(value) || value.id !== key)
    throw new FoundationError('DEPENDENCY_UNAVAILABLE');
  return value;
}
