import { FoundationError, type Profile } from '../domain/types';
import { validId } from '../domain/validation';
import type { TenantFoundationGateway } from '../application/tenant-foundation-gateway';
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
}: TenantFoundationHttpOptions): TenantFoundationGateway {
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
  return {
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
