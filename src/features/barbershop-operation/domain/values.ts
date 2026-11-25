export type BusinessErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_AVAILABLE'
  | 'PROFILE_REQUIRED'
  | 'CONFLICT'
  | 'DEPENDENCY_UNAVAILABLE';
export class BusinessError extends Error {
  constructor(readonly code: BusinessErrorCode) {
    super(code);
    this.name = 'BusinessError';
  }
}
export interface MoneyPEN {
  readonly amountMinor: number;
  readonly currency: 'PEN';
}
export type UtcInstant = string & { readonly utcInstant: unique symbol };
export function moneyPEN(input: unknown): MoneyPEN {
  if (typeof input !== 'number' || !Number.isSafeInteger(input) || input < 0)
    throw new BusinessError('INVALID_INPUT');
  return Object.freeze({ amountMinor: input, currency: 'PEN' });
}
export function utcInstant(input: unknown): UtcInstant {
  if (
    typeof input !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input) ||
    !Number.isFinite(Date.parse(input)) ||
    new Date(input).toISOString() !== input
  )
    throw new BusinessError('INVALID_INPUT');
  return input as UtcInstant;
}
