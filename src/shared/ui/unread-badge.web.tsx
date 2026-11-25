export function UnreadBadge({ count }: { count: number }) {
  if (!Number.isSafeInteger(count) || count <= 0) return null;
  return (
    <span
      className="bx-unread-badge"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${count} notificaciones sin leer`}
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 22,
        height: 22,
        padding: '0 5px',
        borderRadius: 999,
        backgroundColor: '#c92b36',
        color: '#fff',
        fontSize: 12,
        lineHeight: '22px',
        fontWeight: 700,
        marginLeft: 'auto',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
