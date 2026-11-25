import { BusinessError } from './values.ts';
export function teamId(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)
  )
    throw new BusinessError('INVALID_INPUT');
  return value.toLowerCase();
}
export function teamRecord(
  value: unknown,
  keys: readonly string[],
  optional: readonly string[] = [],
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    keys.some((k) => !Object.hasOwn(value, k)) ||
    Object.keys(value).some((k) => !keys.includes(k) && !optional.includes(k))
  )
    throw new BusinessError('INVALID_INPUT');
  return value as Record<string, unknown>;
}
export function teamActor(value: unknown): { readonly userId: string } {
  try {
    return { userId: teamId(teamRecord(value, ['userId']).userId) };
  } catch {
    throw new BusinessError('UNAUTHENTICATED');
  }
}
export function teamDay(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value + 'T00:00:00.000Z')) ||
    new Date(value + 'T00:00:00.000Z').toISOString().slice(0, 10) !== value
  )
    throw new BusinessError('INVALID_INPUT');
  return value;
}
