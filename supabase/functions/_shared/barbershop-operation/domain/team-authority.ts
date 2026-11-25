import { BusinessError } from './values.ts';
export const authorityRevision = '20261120010538';
export type AuthorityCapacity =
  'owner' | 'secondary' | 'barber' | 'client' | 'unregularized';
export function authorityPermissions(capacity: AuthorityCapacity) {
  const owner = capacity === 'owner',
    operational = owner || capacity === 'secondary';
  return {
    manageAdministrators: owner,
    transferOwnership: owner,
    manageTeam: owner,
    publish: owner,
    refund: owner,
    editServices: operational,
    editHours: operational,
    manageReservations: operational,
    confirmPayment: operational,
  };
}
type Base = { readonly barbershopId: string };
type Mutation = Base & {
  readonly requestId: string;
  readonly expectedVersion: number;
};
export type AuthorityCommand =
  | (Base & { readonly action: 'read-team-authority' })
  | (Mutation & {
      readonly action: 'remove-secondary';
      readonly memberUserId: string;
      readonly disposition: 'barber' | 'inactive';
      readonly reason: string;
    })
  | (Mutation & {
      readonly action: 'initiate-ownership-transfer';
      readonly recipientUserId: string;
    })
  | (Mutation & {
      readonly action:
        | 'cancel-ownership-transfer'
        | 'reject-ownership-transfer'
        | 'accept-ownership-transfer';
      readonly transferId: string;
    });
const invalid = (): never => {
  throw new BusinessError('INVALID_INPUT');
};
export function parseAuthorityCommand(input: unknown): AuthorityCommand {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return invalid();
  const v = input as Record<string, unknown>;
  const uuid = (value: unknown) =>
    typeof value === 'string' &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value,
    )
      ? value
      : invalid();
  const action = v.action;
  const required = ['action', 'barbershopId'];
  if (action !== 'read-team-authority')
    required.push('requestId', 'expectedVersion');
  if (action === 'remove-secondary')
    required.push('memberUserId', 'disposition', 'reason');
  else if (action === 'initiate-ownership-transfer')
    required.push('recipientUserId');
  else if (
    [
      'cancel-ownership-transfer',
      'reject-ownership-transfer',
      'accept-ownership-transfer',
    ].includes(String(action))
  )
    required.push('transferId');
  else if (action !== 'read-team-authority') return invalid();
  if (
    Object.keys(v).length !== required.length ||
    required.some((k) => !(k in v))
  )
    return invalid();
  const base = { barbershopId: uuid(v.barbershopId) };
  if (action === 'read-team-authority') return { action, ...base };
  if (
    !Number.isSafeInteger(v.expectedVersion) ||
    (v.expectedVersion as number) < 1
  )
    return invalid();
  const mutation = {
    ...base,
    requestId: uuid(v.requestId),
    expectedVersion: v.expectedVersion as number,
  };
  if (action === 'remove-secondary') {
    if (
      !['barber', 'inactive'].includes(String(v.disposition)) ||
      typeof v.reason !== 'string' ||
      !v.reason.trim() ||
      v.reason.length > 1000
    )
      return invalid();
    return {
      action,
      ...mutation,
      memberUserId: uuid(v.memberUserId),
      disposition: v.disposition as 'barber' | 'inactive',
      reason: v.reason.trim(),
    };
  }
  if (action === 'initiate-ownership-transfer')
    return { action, ...mutation, recipientUserId: uuid(v.recipientUserId) };
  return {
    action: action as
      | 'cancel-ownership-transfer'
      | 'reject-ownership-transfer'
      | 'accept-ownership-transfer',
    ...mutation,
    transferId: uuid(v.transferId),
  };
}
