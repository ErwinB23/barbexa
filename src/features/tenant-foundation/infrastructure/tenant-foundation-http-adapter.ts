import {
  isBarbershop,
  isMembership,
  createdBarbershop,
} from '../domain/barbershop-validation';
import type {
  BarbershopGateway,
  TenantFoundationGateway,
  MembershipGateway,
} from '../application/tenant-foundation-gateway';
import {
  FoundationError,
  type Profile,
  type Membership,
} from '../domain/types';
import { validId } from '../domain/validation';
export interface TenantFoundationHttpOptions {
  baseUrl: string;
  publicKey: string;
  getAccessToken: () => Promise<string | null>;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}
function publicCredential(key: string) {
  if (key.startsWith('sb_publishable_')) return true;
  try {
    return (
      JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        .role === 'anon'
    );
  } catch {
    return false;
  }
}
export function createTenantFoundationHttpAdapter({
  baseUrl,
  publicKey,
  getAccessToken,
  fetcher = fetch,
  timeoutMs = 5000,
}: TenantFoundationHttpOptions): TenantFoundationGateway &
  BarbershopGateway &
  MembershipGateway {
  const target = new URL(baseUrl);
  if (
    !publicCredential(publicKey) ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    target.pathname !== '/' ||
    !(
      target.protocol === 'https:' ||
      (target.protocol === 'http:' &&
        ['127.0.0.1', '[::1]'].includes(target.hostname))
    )
  )
    throw new FoundationError('INVALID_INPUT');
  async function request(path: string, token: string, init: RequestInit = {}) {
    try {
      const r = await fetcher(baseUrl + path, {
        ...init,
        headers: {
          apikey: publicKey,
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          ...init.headers,
        },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!r.ok) {
        // Auth uses 403 for an invalid JWT; it is not a tenant permission denial.
        if (path === '/auth/v1/user' && (r.status === 401 || r.status === 403))
          throw new FoundationError('UNAUTHENTICATED');
        if (r.status === 409) {
          const payload = (await r.json().catch(() => null)) as {
            error?: { code?: unknown };
          } | null;
          if (payload?.error?.code === 'PROFILE_REQUIRED')
            throw new FoundationError('PROFILE_REQUIRED');
        }
        const codes: Record<
          number,
          'UNAUTHENTICATED' | 'FORBIDDEN' | 'CONFLICT' | 'INVALID_INPUT'
        > = {
          401: 'UNAUTHENTICATED',
          403: 'FORBIDDEN',
          409: 'CONFLICT',
          400: 'INVALID_INPUT',
        };
        throw new FoundationError(codes[r.status] ?? 'DEPENDENCY_UNAVAILABLE');
      }
      return (await r.json()) as unknown;
    } catch (e) {
      if (e instanceof FoundationError) throw e;
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    }
  }
  async function session() {
    const token = await getAccessToken();
    if (!token || token.startsWith('sb_secret_'))
      throw new FoundationError('UNAUTHENTICATED');
    const user = await request('/auth/v1/user', token);
    if (
      typeof user !== 'object' ||
      user === null ||
      !('id' in user) ||
      !validId(user.id) ||
      !('is_anonymous' in user) ||
      user.is_anonymous !== false
    )
      throw new FoundationError('UNAUTHENTICATED');
    return { token, id: user.id };
  }
  function profile(value: unknown, id: string, camel = false): Profile {
    if (typeof value !== 'object' || value === null)
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    const r = value as Record<string, unknown>;
    const userId = camel ? r.userId : r.id,
      name = camel ? r.displayName : r.display_name;
    if (
      userId !== id ||
      typeof name !== 'string' ||
      !name.trim() ||
      (r.phone !== null && typeof r.phone !== 'string')
    )
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    return { userId: id, displayName: name, phone: r.phone };
  }
  function row(value: unknown, id: string) {
    if (!Array.isArray(value) || value.length > 1)
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    return value.length ? profile(value[0], id) : null;
  }
  function membershipRows(value: unknown): Membership[] {
    if (!Array.isArray(value))
      throw new FoundationError('DEPENDENCY_UNAVAILABLE');
    return value.map((row: unknown) => {
      if (typeof row !== 'object' || row === null)
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      const r = row as Record<string, unknown>;
      const membership = {
        id: r.id,
        userId: r.user_id,
        barbershopId: r.barbershop_id,
        role: r.role,
        status: r.status,
      };
      if (!isMembership(membership))
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      return membership;
    });
  }
  return {
    async listOwnMemberships() {
      const s = await session();
      const rows = membershipRows(
        await request(
          '/rest/v1/barbershop_memberships?select=id,user_id,barbershop_id,role,status&user_id=eq.' +
            encodeURIComponent(s.id),
          s.token,
        ),
      );
      if (rows.some((m) => m.userId !== s.id))
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      return rows;
    },
    async listBarbershopMemberships(id) {
      const s = await session();
      const rows = membershipRows(
        await request('/rest/v1/rpc/list_barbershop_memberships', s.token, {
          method: 'POST',
          body: JSON.stringify({ p_barbershop_id: id }),
        }),
      );
      if (rows.some((m) => m.barbershopId !== id))
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      return rows;
    },
    async createOwnBarbershop(input) {
      const s = await session();
      try {
        return createdBarbershop(
          (await request('/functions/v1/create-barbershop', s.token, {
            method: 'POST',
            body: JSON.stringify(input),
          })) as import('../domain/types').CreatedBarbershop,
        );
      } catch (e) {
        if (
          e instanceof FoundationError &&
          e.code === 'DEPENDENCY_UNAVAILABLE'
        ) {
          try {
            const rows = await request(
              '/rest/v1/barbershop_memberships?select=id,user_id,barbershop_id,role,status&user_id=eq.' +
                s.id,
              s.token,
            );
            if (!Array.isArray(rows)) throw Error();
            const memberships = rows.map((r) => ({
              id: r.id,
              userId: r.user_id,
              barbershopId: r.barbershop_id,
              role: r.role,
              status: r.status,
            }));
            if (!memberships.every((m) => isMembership(m) && m.userId === s.id))
              throw Error();
            throw new FoundationError('DEPENDENCY_UNAVAILABLE', memberships);
          } catch (reconciled) {
            if (
              reconciled instanceof FoundationError &&
              reconciled.reconciliation
            )
              throw reconciled;
          }
        }
        throw e;
      }
    },
    async getBarbershop(id) {
      const s = await session();
      const rows = await request(
        '/rest/v1/barbershops?select=id,name&id=eq.' + encodeURIComponent(id),
        s.token,
      );
      if (!Array.isArray(rows) || rows.length > 1)
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      if (!rows.length) return null;
      if (!isBarbershop(rows[0]) || rows[0].id !== id)
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      return rows[0];
    },
    async renameBarbershop(id, name) {
      const s = await session();
      const rows = await request(
        '/rest/v1/barbershops?select=id,name&id=eq.' + encodeURIComponent(id),
        s.token,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ name }),
        },
      );
      if (!Array.isArray(rows) || rows.length > 1)
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      if (!rows.length) return null;
      if (!isBarbershop(rows[0]) || rows[0].id !== id)
        throw new FoundationError('DEPENDENCY_UNAVAILABLE');
      return rows[0];
    },
    async ensureOwnProfile(input) {
      const s = await session();
      return profile(
        await request('/functions/v1/ensure-profile', s.token, {
          method: 'POST',
          body: JSON.stringify(input),
        }),
        s.id,
        true,
      );
    },
    async getOwnProfile() {
      const s = await session();
      return row(
        await request(
          '/rest/v1/profiles?select=id,display_name,phone&id=eq.' +
            encodeURIComponent(s.id),
          s.token,
        ),
        s.id,
      );
    },
    async updateOwnProfile(input) {
      const s = await session();
      const payload: Record<string, unknown> = {};
      if (Object.hasOwn(input, 'displayName'))
        payload.display_name = input.displayName;
      if (Object.hasOwn(input, 'phone')) payload.phone = input.phone;
      return row(
        await request(
          '/rest/v1/profiles?select=id,display_name,phone&id=eq.' +
            encodeURIComponent(s.id),
          s.token,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify(payload),
          },
        ),
        s.id,
      );
    },
  };
}
