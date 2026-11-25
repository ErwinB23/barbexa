import type { RescheduleContentProps } from '../features/reservations/presentation/reschedule-control';
import { bookingTime } from '../features/reservations/presentation/booking-format';
import { WorkspaceIcon } from '../shared/ui/workspace-icon.web';
import { professionalRescheduleStyles } from './professional-reschedule-form.styles';

export function ProfessionalRescheduleForm(p: RescheduleContentProps) {
  const id = p.fieldId ?? 'professional-reschedule';
  const locked = p.busy || p.uncertain;
  const slot = p.slots.find((s) => s.startsAt === p.selected);
  return (
    <section
      className="bx-rd-reschedule"
      aria-labelledby={`${id}-title`}
      aria-busy={p.busy}
    >
      <style>{professionalRescheduleStyles}</style>
      <header>
        <span className="bx-rs-icon">
          <WorkspaceIcon name="calendar" />
        </span>
        <div>
          <h4 id={`${id}-title`}>Reprogramar cita</h4>
          <p>Elige una nueva fecha y un horario disponible.</p>
        </div>
        <span className="bx-rs-zone">Hora de Lima</span>
        {p.onClose && (
          <button
            type="button"
            className="bx-rs-close"
            aria-label="Cerrar formulario de reprogramación"
            disabled={locked}
            onClick={p.onClose}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
            Cerrar
          </button>
        )}
      </header>
      <p className="bx-rs-info">
        Se conservan los servicios, el profesional, el precio y el pago. Solo
        cambian la fecha y la hora.
      </p>
      {p.done ? (
        <p className="bx-rs-success" role="status">
          Reserva reprogramada.
        </p>
      ) : (
        <>
          <div
            className={`bx-rs-fields${p.staff ? '' : ' bx-rs-fields--client'}`}
          >
            <div className="bx-rs-date">
              <label htmlFor={`${id}-date`}>Nueva fecha</label>
              <div className="bx-rs-date-search">
                <input
                  id={`${id}-date`}
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  value={p.date}
                  onChange={(e) => p.onDate(e.target.value)}
                  disabled={locked}
                />
                <button type="button" onClick={p.onSearch} disabled={locked}>
                  {p.busy ? 'Consultando…' : 'Consultar nuevos horarios'}
                </button>
              </div>
            </div>
            {p.staff && (
              <div className="bx-rs-reason">
                <label htmlFor={`${id}-reason`}>Motivo del cambio</label>
                <textarea
                  id={`${id}-reason`}
                  rows={2}
                  value={p.reason ?? ''}
                  onChange={(e) => p.onReason?.(e.target.value)}
                  disabled={locked}
                  aria-describedby={`${id}-reason-hint`}
                  placeholder="Describe el motivo de la reprogramación"
                />
                <small id={`${id}-reason-hint`}>
                  Obligatorio para el personal cuando se supera el plazo de
                  reprogramación del cliente.
                </small>
              </div>
            )}
          </div>
          <div className="bx-rs-availability">
            <div className="bx-rs-subtitle">
              <WorkspaceIcon name="calendar" />
              <h5>Horarios disponibles</h5>
              {p.queried && (
                <small>
                  {p.slots.length}{' '}
                  {p.slots.length === 1 ? 'opción' : 'opciones'}
                </small>
              )}
            </div>
            {p.busy ? (
              <p className="bx-rs-empty" role="status">
                Procesando la solicitud…
              </p>
            ) : !p.queried ? (
              <p className="bx-rs-empty">
                Selecciona una fecha y consulta los horarios para continuar.
              </p>
            ) : !p.slots.length ? (
              <p className="bx-rs-empty" role="status">
                No hay horarios disponibles para esta fecha. Prueba con otro
                día.
              </p>
            ) : (
              <div
                className="bx-rs-slots"
                role="group"
                aria-label="Selecciona el nuevo horario"
              >
                {p.slots.map((s) => (
                  <button
                    type="button"
                    key={s.startsAt}
                    aria-pressed={p.selected === s.startsAt}
                    disabled={locked}
                    onClick={() => p.onSelect(s.startsAt)}
                  >
                    {bookingTime(s.startsAt)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {p.error && (
            <p className="bx-rs-error" role="alert">
              {p.error}
            </p>
          )}
          {p.uncertain && (
            <p className="bx-rs-info" role="status">
              El resultado no pudo verificarse. Reintenta el mismo cambio; no se
              generará otra reserva.
            </p>
          )}
          <footer>
            <div>
              <small>Nuevo horario seleccionado</small>
              <strong>
                {slot
                  ? `${new Date(slot.startsAt).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })} · ${bookingTime(slot.startsAt)} (Lima)`
                  : 'Aún no has elegido un horario'}
              </strong>
            </div>
            <button
              type="button"
              className="bx-rs-confirm"
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
