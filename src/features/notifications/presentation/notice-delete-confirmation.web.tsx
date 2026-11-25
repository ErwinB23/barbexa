import { useEffect, useId, useRef } from 'react';

/** Local decision layer: no mutation is sent until onConfirm. */
export function NoticeDeleteConfirmation({
  busy,
  onConfirm,
  onCancel,
}: {
  busy: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  const copy = {
    title: '¿Eliminar esta notificación?',
    description:
      'Se quitará de tu bandeja. La reserva o invitación relacionada se conservará.',
    action: 'Eliminar notificación',
    pending: 'Eliminando…',
    icon: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  };
  const layer = useRef<HTMLDivElement>(null);
  const title = useId();
  const description = useId();
  useEffect(() => {
    const host = layer.current;
    if (!host) return;
    host.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const previous = document.activeElement as HTMLElement | null;
    const siblings = Array.from(host.parentElement?.children ?? []).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child !== host,
    );
    const states = siblings.map((child) => child.inert);
    siblings.forEach((child) => {
      child.inert = true;
    });
    host
      .querySelector<HTMLButtonElement>('[data-cancel]')
      ?.focus({ preventScroll: true });
    return () => {
      siblings.forEach((child, index) => {
        child.inert = states[index];
      });
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <div
      ref={layer}
      className="bx-notice-decision-layer"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          if (!busy) onCancel?.();
        }
        if (event.key !== 'Tab') return;
        const buttons = Array.from(
          layer.current?.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled)',
          ) ?? [],
        );
        const first = buttons[0],
          last = buttons.at(-1);
        if (!first) {
          event.preventDefault();
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div
        role="dialog"
        aria-labelledby={title}
        aria-describedby={description}
        aria-busy={busy}
        className="bx-notice-decision"
      >
        <button
          type="button"
          className="bx-notice-decision-close"
          aria-label="Cerrar confirmación"
          disabled={busy}
          onClick={onCancel}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <span className="bx-notice-decision-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          >
            <path d={copy.icon} />
          </svg>
        </span>
        <h4 id={title}>{copy.title}</h4>
        <p id={description}>{copy.description}</p>
        <div className="bx-notice-decision-actions">
          <button type="button" data-cancel disabled={busy} onClick={onCancel}>
            Conservar notificación
          </button>
          <button
            type="button"
            className="bx-notice-delete-action"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? copy.pending : copy.action}
          </button>
        </div>
      </div>
    </div>
  );
}
