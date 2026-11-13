import {
  FoundationError,
  type Barbershop,
  type Membership,
  type CreatedBarbershop,
} from './types';
import { validId } from './validation';
export function barbershopInput(input: unknown): { name: string } {
  if (
    typeof input !== 'object' ||
    input === null ||
    Array.isArray(input) ||
    Object.keys(input).some((k) => k !== 'name') ||
    !('name' in input) ||
    typeof input.name !== 'string' ||
    !input.name.trim()
  )
    throw new FoundationError('INVALID_INPUT');
  return { name: input.name.trim() };
}
export function shopId(input: unknown): string {
  if (!validId(input)) throw new FoundationError('INVALID_INPUT');
  return input;
}
export function isBarbershop(input: unknown): input is Barbershop {
  if (typeof input !== 'object' || input === null) return false;
  const r = input as Record<string, unknown>;
  return validId(r.id) && typeof r.name === 'string' && !!r.name.trim();
}
export function isMembership(input: unknown): input is Membership {
  if (typeof input !== 'object' || input === null) return false;
  const r = input as Record<string, unknown>;
  return (
    validId(r.id) &&
    validId(r.userId) &&
    validId(r.barbershopId) &&
    (r.role === 'barber' || r.role === 'administrator') &&
    (r.status === 'active' || r.status === 'inactive')
  );
}
export function createdBarbershop(input: CreatedBarbershop): CreatedBarbershop {
  if (
    !isBarbershop(input.barbershop) ||
    !isMembership(input.membership) ||
    input.membership.barbershopId !== input.barbershop.id ||
    input.membership.role !== 'administrator' ||
    input.membership.status !== 'active'
  )
    throw new FoundationError('DEPENDENCY_UNAVAILABLE');
  return input;
}
