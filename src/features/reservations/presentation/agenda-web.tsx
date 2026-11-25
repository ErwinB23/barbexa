import type { CareView } from '../domain/care';
import {
  AdminAgendaIcon as Icon,
  localTime,
  localDay,
} from './admin-agenda-icons.web';
import { adminAgendaStyles } from './admin-agenda.styles';
import type { ReactNode } from 'react';
import type {
  AgendaApplication,
  AgendaFilters,
} from '../application/agenda-application';
import { AppButton } from '../../../shared/ui/app-button';
import { agendaWebStyles } from './agenda-web.styles';

export function AgendaWeb(p: {
  state: ReturnType<AgendaApplication['getSnapshot']>;
  administrator: boolean;
  careViews?: Readonly<Record<string, CareView>>;
  shopName?: string;
  date: string;
  professionals: readonly (readonly [string, string])[];
  onDate: (value: string) => void;
  onFilter: (value: Partial<AgendaFilters>) => void;
  onRefresh: () => void;
  onContext: () => void;
  extraFilters?: ReactNode;
  settings?: ReactNode;
  children: ReactNode;
}) {
  const busy = p.state.phase === 'loading';
  const ready = p.state.phase === 'ready';
  const rows = ready ? p.state.rows : [];
  const views = p.careViews ?? {};
  const completeCare = ready && rows.every((row) => views[row.id]);
  const currentDate = p.state.filters.localDate ?? p.date;
  const currentProfessional = p.state.filters.barberId
    ? (p.professionals.find(([id]) => id === p.state.filters.barberId)?.[1] ??
      'Profesional seleccionado')
    : 'Todos los profesionales';
  const timeline = rows
    .slice()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return (
    <div className={`bx-agenda-page${p.administrator ? ' bx-aa' : ''}`}>
      <style>
        {agendaWebStyles + (p.administrator ? adminAgendaStyles : '')}
      </style>
      <header className="bx-agenda-heading">
        <div>
          <h1>{p.administrator ? 'Agenda de tu barbería' : 'Mi agenda'}</h1>
          <p>
            {p.administrator
              ? `Citas de ${p.shopName ?? 'la barbería seleccionada'}`
              : 'Solo tus citas asignadas · hora de Lima.'}
          </p>
        </div>
        {!p.administrator && (
          <AppButton
            label="Cambiar barbería"
            variant="secondary"
            onPress={p.onContext}
          />
        )}
      </header>
      <div className={p.administrator ? 'bx-aa-layout' : undefined}>
        <main className={p.administrator ? 'bx-aa-main' : undefined}>
          <section
            className="bx-agenda-card"
            aria-labelledby="agenda-query-title"
          >
            <div className="bx-aa-filter-heading">
              {p.administrator && (
                <span className="bx-aa-heading-icon">
                  <Icon name="calendar" />
                </span>
              )}
              <div>
                <h2 id="agenda-query-title">¿Qué día quieres consultar?</h2>
                {p.administrator && (
                  <p>Filtra y visualiza las citas de tu barbería.</p>
                )}
              </div>
            </div>
            <div className="bx-aa-filter-fields">
              <div className="bx-agenda-query">
                <label htmlFor="agenda-date">
                  Fecha de las citas
                  <input
                    type="date"
                    id="agenda-date"
                    value={p.date}
                    disabled={busy}
                    onChange={(e) => p.onDate(e.target.value)}
                  />
                </label>
                <AppButton
                  label={
                    busy
                      ? 'Consultando agenda…'
                      : 'Consultar / actualizar agenda'
                  }
                  disabled={busy}
                  onPress={p.onRefresh}
                />
              </div>
              <div className="bx-agenda-filters">
                <label htmlFor="agenda-state">
                  Estado de la reserva
                  <select
                    id="agenda-state"
                    disabled={busy}
                    value={p.state.filters.state ?? 'all'}
                    onChange={(e) =>
                      p.onFilter({
                        state:
                          e.target.value === 'all'
                            ? null
                            : (e.target.value as 'confirmed' | 'cancelled'),
                      })
                    }
                  >
                    <option value="all">Todos los estados</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </label>
                {p.administrator && (
                  <label htmlFor="agenda-professional">
                    Profesional
                    <select
                      id="agenda-professional"
                      disabled={busy}
                      value={p.state.filters.barberId ?? 'all'}
                      onChange={(e) =>
                        p.onFilter({
                          barberId:
                            e.target.value === 'all' ? null : e.target.value,
                        })
                      }
                    >
                      <option value="all">Todos los profesionales</option>
                      {p.professionals.map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </div>
            {p.extraFilters && (
              <details className="bx-agenda-details">
                <summary>Más filtros: atención y pago</summary>
                <div className="bx-agenda-details-body">{p.extraFilters}</div>
              </details>
            )}
          </section>
          {p.administrator && (
            <section
              className="bx-aa-metrics"
              aria-label="Resultados de la consulta"
            >
              {[
                {
                  label: 'Citas del día',
                  key: 'total',
                  icon: 'calendar',
                  value: ready ? rows.length : '—',
                },
                {
                  label: 'Confirmadas',
                  key: 'confirmed',
                  icon: 'check',
                  value: ready
                    ? rows.filter((row) => row.state === 'confirmed').length
                    : '—',
                },
                {
                  label: 'En atención',
                  key: 'in-service',
                  icon: 'scissors',
                  value: completeCare
                    ? rows.filter(
                        (row) => views[row.id]?.attendance === 'in-service',
                      ).length
                    : '—',
                },
                {
                  label: 'Pendientes de pago',
                  key: 'pending',
                  icon: 'card',
                  value: completeCare
                    ? rows.filter(
                        (row) => views[row.id]?.payment?.status === 'pending',
                      ).length
                    : '—',
                },
              ].map((metric) => (
                <div
                  className={`bx-aa-metric is-${metric.key}`}
                  key={metric.key}
                >
                  <Icon
                    name={
                      metric.icon as 'calendar' | 'check' | 'scissors' | 'card'
                    }
                  />
                  <div>
                    <span>{metric.label}</span>
                    <strong data-metric={metric.key}>{metric.value}</strong>
                  </div>
                </div>
              ))}
              <p>
                Resultados de la consulta y filtros actuales.
                {!completeCare &&
                  ready &&
                  ' Consulta atención y pago de las citas para completar esos indicadores.'}
              </p>
            </section>
          )}
          <section
            className="bx-agenda-appointments"
            aria-labelledby="agenda-results-title"
            aria-busy={busy}
          >
            <div className="bx-agenda-results-heading">
              <h2 id="agenda-results-title">Citas del día</h2>
              {p.state.phase === 'ready' && (
                <span>
                  {p.state.rows.length}{' '}
                  {p.state.rows.length === 1
                    ? 'cita en la lista'
                    : 'citas en la lista'}
                </span>
              )}
            </div>
            <p className="bx-agenda-help">
              {p.administrator
                ? 'Reservas agrupadas por profesional, de la hora más reciente a la más antigua. Puedes plegar cada grupo. '
                : ''}
              En cada cita, pulsa «Consultar atención y pago» para ver su estado
              y las acciones disponibles según tus permisos.
            </p>
            {busy && (
              <p className="bx-agenda-message" role="status">
                Consultando agenda autorizada…
              </p>
            )}
            {p.state.phase === 'error' && (
              <div className="bx-agenda-message bx-agenda-error" role="alert">
                <p>
                  {p.state.error === 'INVALID_INPUT'
                    ? 'Elige una fecha válida.'
                    : p.state.error === 'FORBIDDEN'
                      ? 'No tienes permiso para consultar esta agenda. Revisa la barbería seleccionada.'
                      : 'No pudimos consultar las citas. Vuelve a intentarlo.'}
                </p>
                <AppButton
                  label="Reintentar consulta"
                  variant="secondary"
                  onPress={p.onRefresh}
                />
              </div>
            )}
            {p.state.phase === 'ready' && !p.state.rows.length && (
              <div className="bx-agenda-empty" role="status">
                <h3>No hay citas para estos filtros</h3>
                <p>
                  Comprueba la fecha de tu reserva y los filtros seleccionados.
                  Después actualiza la agenda.
                </p>
              </div>
            )}
            <div className="bx-agenda-list">
              {p.administrator && !ready ? null : p.children}
            </div>
            {p.state.rows.length === 200 && (
              <p className="bx-agenda-help">
                Se muestran las primeras 200 citas del día. Filtra por
                profesional o estado.
              </p>
            )}
          </section>
        </main>
        {p.administrator && (
          <aside className="bx-aa-sidebar">
            <section className="bx-aa-side-card">
              <h2>
                <Icon name="info" />
                Leyenda de estados
              </h2>
              <ul className="bx-aa-legend">
                {(
                  [
                    [
                      'check',
                      'Cita confirmada',
                      'Reserva válida; no implica pago ni atención completados.',
                    ],
                    ['scissors', 'En atención', 'La atención está en curso.'],
                    [
                      'check',
                      'Atención completada',
                      'El servicio ha finalizado.',
                    ],
                    [
                      'clock',
                      'Pendiente de pago',
                      'El pago aún no se ha confirmado; la atención puede seguir pendiente.',
                    ],
                    ['cancel', 'Cancelada', 'La reserva fue anulada.'],
                    [
                      'user',
                      'Inasistencia',
                      'Se registró que el cliente no asistió.',
                    ],
                  ] as const
                ).map(([icon, title, description]) => (
                  <li key={title}>
                    <span>
                      <Icon name={icon} />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="bx-aa-side-card">
              <h2>
                <Icon name="calendar" />
                Resumen rápido del día
              </h2>
              <dl>
                <div>
                  <dt>Fecha consultada</dt>
                  <dd>
                    {ready ? localDay(currentDate) : 'Sin consulta completada'}
                  </dd>
                </div>
                <div>
                  <dt>Barbería</dt>
                  <dd>{p.shopName ?? 'Barbería seleccionada'}</dd>
                </div>
                <div>
                  <dt>Profesional(es)</dt>
                  <dd>{currentProfessional}</dd>
                </div>
              </dl>
            </section>
            <section className="bx-aa-side-card">
              <h2>
                <Icon name="clock" />
                Actividad del día
              </h2>
              {!ready ? (
                <p className="bx-agenda-help">
                  Completa la consulta para ver la actividad.
                </p>
              ) : !rows.length ? (
                <p className="bx-agenda-help">No hay citas en esta consulta.</p>
              ) : (
                <ol className="bx-aa-timeline">
                  {timeline.map((row) => (
                    <li key={row.id}>
                      <time dateTime={row.startsAt}>
                        {localTime(row.startsAt)}
                      </time>
                      <div>
                        <span
                          className={`bx-aa-badge ${row.state === 'cancelled' ? 'is-cancelled' : ''}`}
                        >
                          {row.state === 'confirmed'
                            ? 'Cita confirmada'
                            : 'Cancelada'}
                        </span>
                        <p>
                          {row.clientDisplayNameSnapshot} ·{' '}
                          {row.barberNameSnapshot}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
            <section className="bx-aa-side-card">
              <h2>
                <Icon name="info" />
                Gestión de la agenda
              </h2>
              <ul className="bx-aa-tips">
                <li>Consulta las citas por profesional.</li>
                <li>Verifica el estado de atención.</li>
                <li>Registra los pagos cuando los hayas recibido.</li>
                <li>Usa los filtros para encontrar reservas específicas.</li>
              </ul>
            </section>
          </aside>
        )}
      </div>
      {p.settings && (
        <details className="bx-agenda-card bx-agenda-settings">
          <summary>
            <strong>Configuración de la barbería</strong>
            <span>
              Yape, tolerancia de inasistencia y reglas de reprogramación
            </span>
          </summary>
          <div className="bx-agenda-settings-body">{p.settings}</div>
        </details>
      )}
    </div>
  );
}

export function CareFilterSelects(p: {
  attendance: string;
  payment: string;
  busy: boolean;
  onAttendance: (value: string) => void;
  onPayment: (value: string) => void;
  onApply: () => void;
  error: string;
}) {
  return (
    <div className="bx-agenda-care-filters">
      <div className="bx-agenda-filters">
        <label htmlFor="agenda-attendance">
          Atención
          <select
            id="agenda-attendance"
            value={p.attendance}
            disabled={p.busy}
            onChange={(e) => p.onAttendance(e.target.value)}
          >
            {[
              ['all', 'Todas'],
              ['confirmed', 'Pendiente'],
              ['in-service', 'En atención'],
              ['completed', 'Completada'],
              ['no-show', 'No asistió'],
              ['cancelled', 'Cancelada'],
              ['absent', 'Sin registro'],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="agenda-payment">
          Pago
          <select
            id="agenda-payment"
            value={p.payment}
            disabled={p.busy}
            onChange={(e) => p.onPayment(e.target.value)}
          >
            {[
              ['all', 'Todos'],
              ['pending', 'Pendiente de pago'],
              ['paid', 'Recibido'],
              ['refunded', 'Reembolsado'],
              ['absent', 'Sin registro financiero'],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <AppButton
        label={
          p.busy
            ? 'Verificando estados…'
            : 'Consultar y aplicar filtros de atención y pago'
        }
        disabled={p.busy}
        variant="secondary"
        onPress={p.onApply}
      />
      <p className="bx-agenda-help">
        Después de actualizar la agenda, vuelve a aplicar estos filtros para
        consultar los estados vigentes.
      </p>
      {p.error && <p role="alert">{p.error}</p>}
    </div>
  );
}
