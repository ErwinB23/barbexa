import { FoundationError, type ProfileInput, type ProfilePatch } from './types';
export function validId(input: unknown): input is string {
  return (
    typeof input === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      input,
    )
  );
}
function record(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input))
    throw new FoundationError('INVALID_INPUT');
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some((k) => !['displayName', 'phone'].includes(k)))
    throw new FoundationError('INVALID_INPUT');
  return value;
}
function name(input: unknown): string {
  if (typeof input !== 'string' || !input.trim())
    throw new FoundationError('INVALID_INPUT');
  return input.trim();
}
function phone(input: unknown): string | null {
  if (input === null) return null;
  if (typeof input !== 'string') throw new FoundationError('INVALID_INPUT');
  return input.trim() || null;
}
export function profileInput(input: unknown): ProfileInput {
  const r = record(input);
  return {
    displayName: name(r.displayName),
    phone: r.phone === undefined ? null : phone(r.phone),
  };
}
export function profilePatch(input: unknown): ProfilePatch {
  const r = record(input);
  const result: { displayName?: string; phone?: string | null } = {};
  if (Object.hasOwn(r, 'displayName')) result.displayName = name(r.displayName);
  if (Object.hasOwn(r, 'phone')) result.phone = phone(r.phone);
  if (!Object.keys(result).length) throw new FoundationError('INVALID_INPUT');
  return result;
}
export async function dependency<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (e) {
    if (e instanceof FoundationError) throw e;
    throw new FoundationError('DEPENDENCY_UNAVAILABLE');
  }
}
