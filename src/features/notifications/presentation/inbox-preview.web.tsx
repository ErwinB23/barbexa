import { noticeMessage } from './notice-message';
import { Link } from 'expo-router';
import type { Inbox } from '../application/inbox';
import { useInbox } from './inbox-context';

export function InboxPreviewContent({
  state,
}: {
  state: ReturnType<Inbox['getSnapshot']>;
}) {
  const items = [...state.items]
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
        b.id.localeCompare(a.id),
    )
    .slice(0, 1);
  return (
    <div className="bx-home-notices">
      <style>{`
      .bx-home-notices{display:flex;flex-direction:column;gap:12px;min-width:0}
      .bx-home-notices ul{padding:0;margin:0;list-style:none}
      .bx-home-notices li+li{border-top:1px solid #e3d7c7;margin-top:10px;padding-top:10px}
      .bx-home-notices .bx-notice-preview{display:block;color:inherit;text-decoration:none;border-radius:6px;padding:4px;overflow-wrap:anywhere}
      .bx-home-notices .bx-notice-preview:hover{background:#f6eddf}
      .bx-home-notices a:focus-visible{outline:2px solid #a8762c;outline-offset:3px}
      .bx-home-notices strong{font-size:14px;line-height:1.4;display:block}
      .bx-home-notices .bx-preview-unread:before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#b27d26;margin-right:7px}
      .bx-home-notices p{margin:5px 0 0;font-size:13px;line-height:1.5;color:#716352}
      .bx-home-notices .bx-preview-message{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .bx-home-notices time{display:block;margin-top:5px;font-size:11px;color:#89775f}
      .bx-home-notices .bx-preview-all{font-size:13px;font-weight:600;color:#885a21;text-underline-offset:4px}
    `}</style>
      {items.length ? (
        <ul>
          {items.map((n) => (
            <li key={n.id}>
              <Link href="/account?view=notices" className="bx-notice-preview">
                <strong className={!n.readAt ? 'bx-preview-unread' : undefined}>
                  {n.title}
                </strong>
                <p className="bx-preview-message">{noticeMessage(n.message)}</p>
                <time dateTime={n.createdAt}>
                  {new Intl.DateTimeFormat('es-PE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    timeZone: 'America/Lima',
                  }).format(new Date(n.createdAt))}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      ) : state.phase === 'ready' ? (
        <p>No tienes notificaciones por ahora.</p>
      ) : state.phase === 'error' || state.phase === 'unavailable' ? (
        <p role="status">
          No se pudieron consultar tus avisos. Puedes reintentarlo en
          Notificaciones.
        </p>
      ) : (
        <p role="status">Consultando tus avisos…</p>
      )}
      {!!items.length &&
        (state.phase === 'error' || state.phase === 'unavailable') && (
          <p role="status">No se pudieron actualizar los avisos.</p>
        )}
      <Link href="/account?view=notices" className="bx-preview-all">
        Ver todas las notificaciones
      </Link>
    </div>
  );
}
export function InboxPreview() {
  const { state } = useInbox();
  return <InboxPreviewContent state={state} />;
}
