import { useRef } from 'react';
import type { RescheduleContentProps } from './reschedule-control';
import { bookingTime } from './booking-format';
import { limaDate } from './booking-calendar-dates';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';

export function ClientRescheduleForm(p: RescheduleContentProps) {
  const id = p.fieldId ?? 'client-reschedule';
  const locked = p.busy || p.uncertain;
  const dateInput = useRef<HTMLInputElement>(null);
  return (
    <section
      className="bx-own-reschedule-form"
      aria-labelledby={`${id}-title`}
      aria-busy={p.busy}
    >
      <header>
        <WorkspaceIcon name="calendar" />
        <h3 id={`${id}-title`}>Reprogramar cita</h3>
        <button
          type="button"
          onClick={p.onClose}
          disabled={locked}
          className="bx-own-reschedule-close"
          title="Cerrar formulario"
          aria-label="Cerrar formulario de reprogramación"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="m7 7 10 10M17 7 7 17" />
          </svg>
        </button>
      </header>
      <p className="bx-own-muted">
        Elige una nueva fecha y hora. Se conservan tus servicios, profesional,
        precio y pago.
      </p>
      {p.done ? (
        <p role="status" className="bx-own-reschedule-success">
          Tu cita se reprogramó correctamente.
        </p>
      ) : (
        <>
          <label htmlFor={`${id}-calendar`}>Nueva fecha</label>
          <div className="bx-own-reschedule-date">
            <input
              ref={dateInput}
              id={`${id}-calendar`}
              type="date"
              min={limaDate()}
              value={p.date}
              disabled={locked}
              onChange={(event) => p.onDate(event.target.value)}
            />
            <button
              type="button"
              disabled={locked}
              aria-label="Abrir calendario de reprogramación"
              onClick={() => {
                const input = dateInput.current;
                if (!input) return;
                try {
                  input.showPicker();
                } catch {
                  input.focus();
                }
              }}
            >
              <WorkspaceIcon name="calendar" />
            </button>
          </div>
          <button
            type="button"
            className="bx-own-reschedule-search"
            onClick={p.onSearch}
            disabled={locked || !p.date}
          >
            {p.busy ? 'Consultando horarios…' : 'Buscar horarios disponibles'}
          </button>
          <div className="bx-own-reschedule-availability" aria-live="polite">
            <h4>Horarios disponibles</h4>
            {!p.queried && (
              <p className="bx-own-muted">
                Selecciona una fecha y busca los horarios para tu cita.
              </p>
            )}
            {p.queried && !p.slots.length && (
              <p className="bx-own-muted">
                No hay horarios disponibles. Prueba con otra fecha.
              </p>
            )}
            <div className="bx-own-reschedule-slots">
              {p.slots.map((slot) => (
                <button
                  type="button"
                  key={slot.startsAt}
                  aria-pressed={p.selected === slot.startsAt}
                  disabled={locked}
                  onClick={() => p.onSelect(slot.startsAt)}
                >
                  {bookingTime(slot.startsAt)}
                </button>
              ))}
            </div>
          </div>
          {p.error && (
            <p role="alert" className="bx-own-reschedule-error">
              {p.error}
            </p>
          )}
          {p.uncertain && (
            <p role="status" className="bx-own-muted">
              Estamos verificando el resultado. Reintenta el mismo cambio.
            </p>
          )}
          <footer>
            <button type="button" onClick={p.onClose} disabled={locked}>
              Cancelar cambio
            </button>
            <button
              type="button"
              className="bx-own-reschedule-confirm"
              onClick={p.onConfirm}
              disabled={p.busy || !p.selected}
            >
              {p.uncertain
                ? 'Reintentar el mismo cambio'
                : 'Confirmar nuevo horario'}
            </button>
          </footer>
        </>
      )}
    </section>
  );
}
