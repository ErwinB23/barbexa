import { BusinessError } from './values';
export const teamAuthorityRevision = '20261120010538';
export interface AuthorityPermissions {
  readonly manageAdministrators: boolean;
  readonly transferOwnership: boolean;
  readonly manageTeam: boolean;
  readonly publish: boolean;
  readonly refund: boolean;
  readonly editServices: boolean;
  readonly editHours: boolean;
  readonly manageReservations: boolean;
  readonly confirmPayment: boolean;
}
export interface TeamAuthority {
  readonly revision: typeof teamAuthorityRevision;
  readonly userId: string;
  readonly barbershopId: string;
  readonly capacity: 'owner' | 'secondary' | 'barber' | 'unregularized';
  readonly version: number;
  readonly secondaryCount: number | null;
  readonly permissions: AuthorityPermissions;
}
export type AuthorityMutation =
  | {
      readonly action: 'remove-secondary';
      readonly requestId: string;
      readonly memberUserId: string;
      readonly disposition: 'barber' | 'inactive';
      readonly reason: string;
    }
  | {
      readonly action: 'initiate-ownership-transfer';
      readonly requestId: string;
      readonly recipientUserId: string;
    }
  | {
      readonly action:
        'cancel-ownership-transfer' | 'reject-ownership-transfer';
      readonly requestId: string;
      readonly transferId: string;
    };
export function decodeTeamAuthority(
  value: unknown,
  user: string,
  shop: string,
): TeamAuthority {
  const fail = (): never => {
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  };
  if (!value || typeof value !== 'object') return fail();
  const v = value as Record<string, unknown>;
  if (
    v.revision !== teamAuthorityRevision ||
    v.userId !== user ||
    v.barbershopId !== shop ||
    !['owner', 'secondary', 'barber', 'unregularized'].includes(
      String(v.capacity),
    ) ||
    !Number.isSafeInteger(v.version) ||
    (v.version as number) < 0
  )
    return fail();
  if (v.capacity !== 'unregularized' && (v.version as number) < 1)
    return fail();
  if (!v.permissions || typeof v.permissions !== 'object') return fail();
  const owner = v.capacity === 'owner',
    operational = owner || v.capacity === 'secondary';
  const expected = {
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
  const permissions = v.permissions as Record<string, unknown>;
  if (
    Object.keys(permissions).length !== Object.keys(expected).length ||
    Object.entries(expected).some(
      ([key, allowed]) => permissions[key] !== allowed,
    )
  )
    return fail();
  if (
    owner
      ? !Number.isInteger(v.secondaryCount) ||
        (v.secondaryCount as number) < 0 ||
        (v.secondaryCount as number) > 2
      : v.secondaryCount !== null
  )
    return fail();
  return Object.freeze({
    ...v,
    permissions: Object.freeze(expected),
  }) as unknown as TeamAuthority;
}
