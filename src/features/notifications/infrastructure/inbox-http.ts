import type { InboxGateway, Notice } from '../application/inbox';
export function createInboxHttp(p: {
  baseUrl: string;
  publicKey: string;
  getAccessToken: () => Promise<string | null>;
  fetcher?: typeof fetch;
}): InboxGateway {
  async function rpc(name: string, data: unknown) {
    const token = await p.getAccessToken();
    if (!token) throw Error('UNAUTHENTICATED');
    const response = await (p.fetcher ?? fetch)(
      `${p.baseUrl}/rest/v1/rpc/${name}`,
      {
        method: 'POST',
        headers: {
          apikey: p.publicKey,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(8000),
      },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 404 && body?.code === 'PGRST202')
        throw Error(
          name === 'delete_my_notification'
            ? 'NOTIFICATION_DELETE_NOT_INSTALLED'
            : 'NOTIFICATIONS_NOT_INSTALLED',
        );
      throw Error(
        [401, 403].includes(response.status)
          ? 'UNAUTHENTICATED'
          : 'DEPENDENCY_UNAVAILABLE',
      );
    }
    return body;
  }
  return {
    async list() {
      const result = await rpc('list_my_notifications', {});
      if (
        !result ||
        !Array.isArray(result.items) ||
        result.items.length > 50 ||
        !Number.isSafeInteger(result.unread) ||
        result.unread < 0
      )
        throw Error('INVALID_RESPONSE');
      const ids = new Set<string>();
      for (const n of result.items) {
        if (
          !n ||
          typeof n.id !== 'string' ||
          !/^[a-f0-9-]{36}$/i.test(n.id) ||
          ids.has(n.id) ||
          typeof n.title !== 'string' ||
          typeof n.message !== 'string' ||
          !['/staff', '/my-reservations', '/agenda'].includes(n.target) ||
          !Number.isFinite(Date.parse(n.createdAt)) ||
          !(
            n.readAt === null ||
            (typeof n.readAt === 'string' &&
              Number.isFinite(Date.parse(n.readAt)))
          )
        )
          throw Error('INVALID_RESPONSE');
        ids.add(n.id);
      }
      return {
        ...(result as { items: readonly Notice[]; unread: number }),
        canRemove: result.canRemove === true,
      };
    },
    async remove(id) {
      if (!/^[a-f0-9-]{36}$/i.test(id)) throw Error('INVALID_INPUT');
      const result = await rpc('delete_my_notification', { p_id: id });
      if (result?.deleted !== true) throw Error('INVALID_RESPONSE');
    },
    async read(id) {
      if (!/^[a-f0-9-]{36}$/i.test(id)) throw Error('INVALID_INPUT');
      await rpc('read_my_notification', { p_id: id });
    },
  };
}
