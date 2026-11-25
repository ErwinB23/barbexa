import { useEffect, useId, useRef } from 'react';

/** Local decision layer: no mutation is sent until onConfirm. */
export function CareOperationConfirmation({
  command = 'start',
  busy,
  onConfirm,
  onCancel,
}: {
  command?: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const copy =
    command === 'complete'
      ? {
          title: '¿Completar atención?',
          description:
            'La atención quedará marcada como completada. El estado del pago se conserva.',
          action: 'Completar atención',
          pending: 'Completando…',
          icon: 'm4 12 5 5L20 6',
        }
      : command === 'receive'
        ? {
            title: '¿Registrar pago recibido?',
            description:
              'Confirma que recibiste el importe completo en efectivo o Yape. El pago quedará marcado como recibido.',
            action: 'Registrar pago',
            pending: 'Registrando…',
            icon: 'M3 5h18v14H3ZM3 9h18m-14 6h4',
          }
        : command === 'no-show'
          ? {
              title: '¿Registrar inasistencia?',
              description:
                'Confirma que el cliente no asistió. Se conservará el historial de la reserva.',
              action: 'Registrar inasistencia',
              pending: 'Registrando…',
              icon: 'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M2 21v-2a7 7 0 0 1 11-6m3 2 6 6m0-6-6 6',
            }
          : {
              title: '¿Iniciar atención?',
              description:
                'La cita pasará a «En atención». Confirma cuando estés listo para atender al cliente.',
              action: 'Iniciar atención',
              pending: 'Iniciando…',
              icon: 'm9 5 10 7-10 7Z',
            };
  const layer = useRef<HTMLDivElement>(null);
  const title = useId();
  const description = useId();
  useEffect(() => {
    const host = layer.current;
    if (!host) return;
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
      className="bx-care-decision-layer"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          if (!busy) onCancel();
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
        className="bx-care-decision"
      >
        <button
          type="button"
          className="bx-care-decision-close"
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
        <span className="bx-care-decision-icon" aria-hidden="true">
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
        <div className="bx-care-decision-actions">
          <button type="button" data-cancel disabled={busy} onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="bx-rd-primary"
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
