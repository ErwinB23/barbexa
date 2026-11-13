// Stable case IDs and expected results, independent of runtime credentials/UUIDs.
export const actors = Object.freeze([
  'admin-A',
  'admin-B',
  'barber-A',
  'barber-B',
  'client',
  'shared-admin-A-barber-B',
  'inactive-A',
  'anonymous',
  'invalid-JWT',
]);
export const relationships = Object.freeze([
  [0, 0, 'administrator', 'active'],
  [1, 1, 'administrator', 'active'],
  [2, 0, 'barber', 'active'],
  [3, 1, 'barber', 'active'],
  [5, 0, 'administrator', 'active'],
  [5, 1, 'barber', 'active'],
  [6, 0, 'barber', 'inactive'],
]);
const generated = [];
for (let actor = 0; actor < actors.length; actor++)
  for (let tenant = 0; tenant < 2; tenant++) {
    const mine = relationships.find((m) => m[0] === actor && m[1] === tenant),
      active = mine?.[3] === 'active',
      admin = active && mine?.[2] === 'administrator',
      unauth = actor >= 7;
    for (const [operation, status, rows] of [
      ['shop-read', unauth ? 401 : 200, active ? 1 : 0],
      ['shop-rename', unauth ? 401 : 200, admin ? 1 : 0],
      ['member-own', unauth ? 401 : 200, mine ? 1 : 0],
      [
        'member-table',
        unauth ? 401 : 200,
        admin
          ? relationships.filter((m) => m[1] === tenant).length
          : mine
            ? 1
            : 0,
      ],
      [
        'member-RPC',
        unauth ? 401 : admin ? 200 : 403,
        admin ? relationships.filter((m) => m[1] === tenant).length : undefined,
      ],
      ['profile-other', unauth ? 401 : 200, 0],
      ['profile-join', unauth ? 401 : 200, undefined],
      ...[
        'role',
        'status',
        'user_id',
        'barbershop_id',
        'delete',
        'insert',
        'profile-id',
        'shop-id',
        'profile-RPC',
        'shop-RPC',
      ].map((op) => [op, unauth ? 401 : 403, undefined]),
      ['forged-shop-body', unauth ? 401 : 400, undefined],
      ['forged-profile-body', unauth ? 401 : 400, undefined],
    ])
      generated.push(
        Object.freeze({
          id: actors[actor] + '/' + (tenant ? 'B' : 'A') + '/' + operation,
          actor,
          tenant,
          operation,
          status,
          rows,
          denied: status >= 400 || rows === 0,
        }),
      );
  }
export const authorizationCases = Object.freeze(generated);
export const expectedCaseCount = actors.length * 2 * 19;
if (authorizationCases.length !== expectedCaseCount)
  throw Error('CASE_DENOMINATOR_MISMATCH');

// Same identities and expectations through the public application composition.
const contextualClientCases = authorizationCases
  .filter(
    (c) =>
      c.actor < 7 &&
      ['shop-read', 'shop-rename', 'member-own', 'member-RPC'].includes(
        c.operation,
      ),
  )
  .map((c) => Object.freeze({ ...c, id: 'client/' + c.id }));
const identityClientCases = actors.slice(0, 7).flatMap((actor, index) =>
  ['profile-read', 'profile-edit', 'shop-create'].map((operation) =>
    Object.freeze({
      id: 'client/' + actor + '/' + operation,
      actor: index,
      tenant: 0,
      operation,
      status: operation === 'shop-create' ? 201 : 200,
      rows: 1,
      denied: false,
    }),
  ),
);
const invalidClientCases = [7, 8].flatMap((actor) =>
  ['member-own', 'member-RPC'].map((operation) =>
    Object.freeze({
      id: 'client/' + actors[actor] + '/' + operation,
      actor,
      tenant: 0,
      operation,
      status: 401,
      rows: 0,
      denied: true,
    }),
  ),
);
export const clientCases = Object.freeze([
  ...contextualClientCases,
  ...identityClientCases,
  ...invalidClientCases,
]);
export const expectedClientCaseCount = 7 * 2 * 4 + 7 * 3 + 2 * 2;
if (clientCases.length !== expectedClientCaseCount)
  throw Error('CLIENT_CASE_DENOMINATOR_MISMATCH');
