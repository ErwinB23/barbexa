import { useState } from 'react';
import { Link } from 'expo-router';
import type { OperationApplication } from '../features/barbershop-operation/application/operation-application';
import type { BookingDetail } from '../features/reservations/domain/types';
import type { CareView } from '../features/reservations/domain/care';
import { ProfessionalReservationDetail } from './professional-reservation-detail.web';
import { ProfessionalRescheduleForm } from './professional-reschedule-form.web';
import type { CareLayoutParts } from '../features/reservations/presentation/care-control';
import { CareControl } from '../features/reservations/presentation/care-control';
import { CancellationControl } from '../features/reservations/presentation/cancellation-control';
import { RescheduleControl } from '../features/reservations/presentation/reschedule-control';
import { bookingTime } from '../features/reservations/presentation/booking-format';
import { WorkspaceIcon } from '../shared/ui/workspace-icon.web';
import { SiteIcon } from '../shared/ui/site-icon.web';
import {
  professionalWeek,
  shiftProfessionalDay,
} from '../features/barbershop-operation/presentation/professional-dashboard-dates';
import { professionalAgendaStyles } from '../features/barbershop-operation/presentation/professional-agenda.web.styles';
import type { ProfessionalBooking } from './professional-dashboard-data';
import { useProfessionalAgenda } from './use-professional-agenda';
import {
  agendaRows,
  agendaGroups,
  appointmentStatus,
  professionalDateLabel,
  type ProfessionalAgendaFilter,
} from './professional-agenda-view';

type IconName =
  'refresh' | 'clock' | 'check' | 'cancel' | 'chart' | 'info' | 'more' | 'list';
function AgendaIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    refresh:
      'M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6m-4 9a9 9 0 0 0 15 2l3-3m0 6v-6h-6',
    clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 3v6l4 3',
    check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m-5 9 3 3 7-7',
    cancel: 'm8 8 8 8m0-8-8 8',
    chart: 'M3 21h18M5 17v-6h3v6m3 0V6h3v11m3 0V3h3v14',
    info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 7v7m0-10h.01',
    more: 'M12 4h.01M12 12h.01M12 20h.01',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'more' ? '3.5' : '1.8'}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
const dest = (section: string) => `/staff?view=professional&section=${section}`;
const shortDate = (day: string) =>
  `${day.slice(8)}/${day.slice(5, 7)}/${day.slice(0, 4)}`;

function ProfessionalAppointment({
  row,
  initialView,
  paused,
  careEnabled,
  onChanged,
}: {
  row: BookingDetail;
  initialView: CareView | null;
  paused: boolean;
  careEnabled: boolean;
  onChanged: () => void;
}) {
  const layout = (parts: CareLayoutParts) => {
    const status = appointmentStatus(row, parts.view);
    const tone =
      status.id === 'completed'
        ? ' bx-pro-badge--blue'
        : status.id === 'cancelled'
          ? ' bx-pro-badge--neutral'
          : status.id === 'no-show'
            ? ' bx-pro-badge--red'
            : status.id === 'in-service'
              ? ' bx-pro-badge--yellow'
              : status.id === 'confirmed'
                ? ' bx-pro-badge--green'
                : '';
    return (
      <div className="bx-pro-dashboard bx-pa-unified-card">
        <details className="bx-pro-appointment">
          <summary>
            <time dateTime={row.startsAt}>{bookingTime(row.startsAt)}</time>
            <span className="bx-pro-client-icon">
              <WorkspaceIcon name="user" />
            </span>
            <span className="bx-pro-appointment-name">
              <strong>{row.clientDisplayNameSnapshot}</strong>
              <small>
                {row.items.map((i) => i.nameSnapshot).join(' + ')} ·{' '}
                {row.durationMin} min
              </small>
            </span>
            <span className={`bx-pro-badge${tone}`}>
              <AgendaIcon
                name={
                  status.id === 'completed'
                    ? 'check'
                    : status.id === 'in-service'
                      ? 'clock'
                      : ['cancelled', 'no-show'].includes(status.id)
                        ? 'cancel'
                        : 'info'
                }
              />
              {status.label}
            </span>
            <span className="bx-pro-appointment-toggle" aria-hidden="true">
              <WorkspaceIcon name="chevron" />
            </span>
          </summary>
          <div
            className="bx-pro-appointment-detail"
            inert={paused}
            aria-busy={paused || parts.busy}
          >
            <ProfessionalReservationDetail
              detail={row}
              parts={{ ...parts, busy: paused || parts.busy }}
            />
          </div>
        </details>
      </div>
    );
  };
  if (!careEnabled)
    return layout({
      trigger: (
        <button type="button" disabled>
          Atención no disponible
        </button>
      ),
      content: null,
      actions: null,
      feedback: (
        <p>La consulta de atención no está disponible en este entorno.</p>
      ),
      view: null,
      busy: false,
      operations: [],
    });
  return (
    <CareControl
      confirmOperationsInCard
      reservationId={row.id}
      startsAt={row.startsAt}
      initialView={initialView}
      onUpdated={(_, mutated) => {
        if (mutated) onChanged();
      }}
      renderLayout={layout}
      renderActions={(view) => {
        const canChange =
          !paused &&
          row.state === 'confirmed' &&
          view !== null &&
          (view.attendance === null || view.attendance === 'confirmed');
        return (
          <>
            <RescheduleControl
              detail={row}
              staff
              canChange={canChange}
              renderContent={ProfessionalRescheduleForm}
            />
            {canChange && <CancellationControl detail={row} staff />}
          </>
        );
      }}
    />
  );
}

export function ProfessionalAgenda({
  application: app,
  booking,
  shopId,
}: {
  application: OperationApplication;
  booking: ProfessionalBooking;
  shopId: string;
}) {
  const {
    day,
    setDay,
    weekly,
    setWeekly,
    data,
    busy,
    error,
    refresh,
    revision,
  } = useProfessionalAgenda(app, booking, shopId);
  const [filter, setFilter] = useState<ProfessionalAgendaFilter>('all');
  const rows = agendaRows(data?.rows ?? [], data?.care ?? {}, filter);
  const groups = agendaGroups(rows, day, weekly);
  const unknown =
    data?.rows.filter(
      (r) => appointmentStatus(r, data.care[r.id]).id === 'unknown',
    ).length ?? 0;
  const week = professionalWeek(day);
  const move = (offset: number) => {
    const next = shiftProfessionalDay(day, offset);
    if (/^\d{4}-\d{2}-\d{2}$/.test(next)) setDay(next);
  };
  return (
    <div className="bx-pa-layout">
      <style>{professionalAgendaStyles}</style>
      <section
        className="bx-pa-main bx-pa-card"
        aria-labelledby="professional-agenda-title"
      >
        <header className="bx-pa-heading">
          <div className="bx-pa-section-title">
            <span className="bx-pa-title-icon">
              <WorkspaceIcon name="calendar" />
            </span>
            <div>
              <h2 id="professional-agenda-title">Mi agenda</h2>
              <p>Consulta y gestiona tus citas por día o por semana.</p>
            </div>
          </div>
          <button
            type="button"
            className="bx-pa-refresh"
            onClick={refresh}
            disabled={busy}
          >
            <AgendaIcon name="refresh" />
            {busy
              ? data
                ? 'Actualizando agenda…'
                : 'Consultando agenda…'
              : 'Actualizar agenda'}
          </button>
        </header>
        <div className="bx-pa-filters">
          <label htmlFor="professional-agenda-date">
            Fecha de las citas
            <div className="bx-pa-date-picker">
              <span>{shortDate(day)}</span>
              <WorkspaceIcon name="calendar" />
              <input
                id="professional-agenda-date"
                type="date"
                lang="es-PE"
                min="0001-01-01"
                max="9999-12-31"
                aria-label="Fecha de las citas"
                value={day}
                onChange={(e) => {
                  if (
                    /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) &&
                    e.target.validity.valid
                  )
                    setDay(e.target.value);
                }}
              />
            </div>
          </label>
          <label htmlFor="professional-agenda-state">
            Estado de la reserva
            <select
              id="professional-agenda-state"
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as ProfessionalAgendaFilter)
              }
            >
              {[
                ['all', 'Todos los estados'],
                ['confirmed', 'Confirmada'],
                ['in-service', 'En atención'],
                ['completed', 'Completada'],
                ['cancelled', 'Cancelada'],
                ['no-show', 'No asistió'],
                ['unknown', 'Atención por consultar'],
              ].map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="bx-pa-date-navigation">
          <div className="bx-pa-day-navigation">
            <button
              type="button"
              aria-label={weekly ? 'Semana anterior' : 'Día anterior'}
              onClick={() => move(weekly ? -7 : -1)}
            >
              ‹
            </button>
            <strong>
              <WorkspaceIcon name="calendar" />
              {weekly
                ? `${shortDate(week[0])} – ${shortDate(week[6])}`
                : professionalDateLabel(day)}
            </strong>
            <button
              type="button"
              aria-label={weekly ? 'Semana siguiente' : 'Día siguiente'}
              onClick={() => move(weekly ? 7 : 1)}
            >
              ›
            </button>
          </div>
          <div className="bx-pa-view-toggle" aria-label="Vista de la agenda">
            <button
              type="button"
              aria-pressed={!weekly}
              onClick={() => setWeekly(false)}
            >
              <AgendaIcon name="list" />
              Vista diaria
            </button>
            <button
              type="button"
              aria-pressed={weekly}
              onClick={() => setWeekly(true)}
            >
              <WorkspaceIcon name="calendar" />
              Vista semanal
            </button>
          </div>
        </div>
        <div className="bx-pa-results-title">
          <h3>
            {weekly ? 'Citas de la semana' : 'Citas del día'}
            {data?.agendaReady ? ` (${rows.length})` : ''}
          </h3>
          <p>
            Horarios de Lima. Consulta atención y pago; en «Más acciones»
            encontrarás las opciones permitidas.
          </p>
        </div>
        <div role="status" className="bx-pa-live">
          {busy
            ? data
              ? 'Actualizando tu agenda. Se conserva el último resultado mientras consultamos.'
              : 'Cargando tu agenda…'
            : ''}
        </div>
        {error && (
          <div className="bx-pa-error" role="alert">
            <AgendaIcon name="info" />
            <div>
              <strong>No se pudo consultar toda la información</strong>
              <p>
                Vuelve a actualizar la agenda. Los datos que no se pudieron
                verificar se indican como pendientes de consulta.
              </p>
            </div>
            <button type="button" disabled={busy} onClick={refresh}>
              Reintentar
            </button>
          </div>
        )}
        {unknown > 0 && !busy && (
          <p className="bx-pa-notice">
            No se pudo verificar la atención de {unknown}{' '}
            {unknown === 1 ? 'cita' : 'citas'}. Puedes consultarla
            individualmente; no se incluyen en filtros de estados de atención.
          </p>
        )}
        {busy && !data ? (
          <div className="bx-pa-skeletons" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div className="bx-pa-skeleton" key={i}>
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : !data?.agendaReady ? (
          <div className="bx-pa-empty">
            <WorkspaceIcon name="calendar" />
            <h3>Tu agenda está por consultar</h3>
            <p>
              Comprueba que tienes un perfil profesional activo en esta barbería
              y vuelve a actualizar.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bx-pa-empty">
            <WorkspaceIcon name="calendar" />
            <h3>
              {filter === 'all'
                ? weekly
                  ? 'No hay citas para esta semana'
                  : 'No hay citas para este día'
                : 'No hay citas con este estado'}
            </h3>
            <p>
              {filter === 'all'
                ? 'No se encontraron citas programadas. Puedes cambiar la fecha o actualizar la agenda.'
                : 'Prueba con todos los estados o elige otra fecha.'}
            </p>
            {filter !== 'all' && (
              <button type="button" onClick={() => setFilter('all')}>
                Ver todos los estados
              </button>
            )}
          </div>
        ) : (
          <div className="bx-pa-appointments" inert={busy}>
            {groups.map((g) => (
              <section key={g.day} aria-label={professionalDateLabel(g.day)}>
                {weekly && (
                  <h4 className="bx-pa-group-day">
                    {professionalDateLabel(g.day)}{' '}
                    <span>{g.rows.length} citas</span>
                  </h4>
                )}
                {g.rows.length ? (
                  g.rows.map((r) => (
                    <ProfessionalAppointment
                      key={`${r.id}:${revision}`}
                      row={r}
                      initialView={data.care[r.id] ?? null}
                      paused={busy}
                      onChanged={refresh}
                      careEnabled={!!booking?.care}
                    />
                  ))
                ) : (
                  <p className="bx-pa-group-empty">Sin citas para este día.</p>
                )}
              </section>
            ))}
          </div>
        )}
        {data &&
          agendaGroups(data.rows, day, weekly).some(
            (g) => g.rows.length === 200,
          ) && (
            <p className="bx-pa-notice">
              El servidor devuelve hasta 200 citas por día. El resumen del día
              conserva los totales del servidor.
            </p>
          )}
      </section>
      <aside className="bx-pa-sidebar">
        <section className="bx-pa-card bx-pa-summary">
          <header>
            <AgendaIcon name="chart" />
            <div>
              <h2>Resumen del día</h2>
              <p>{professionalDateLabel(day)}</p>
            </div>
          </header>
          <div className="bx-pa-metrics">
            {[
              ['Citas del día', data?.summary?.total, 'calendar'],
              ['Completadas', data?.summary?.completed, 'check'],
              ['En atención', data?.summary?.inService, 'clock'],
              ['Confirmadas', data?.summary?.scheduled, 'calendar'],
            ].map(([label, value, icon]) => (
              <div key={label}>
                <span>
                  {icon === 'calendar' ? (
                    <WorkspaceIcon name="calendar" />
                  ) : (
                    <AgendaIcon name={icon as IconName} />
                  )}
                </span>
                <div>
                  <strong>{value ?? '—'}</strong>
                  <p>{label}</p>
                </div>
              </div>
            ))}
          </div>
          {!busy && !data?.summary && (
            <p className="bx-pa-summary-note">
              El resumen de este día no está disponible.
            </p>
          )}
        </section>
        <section className="bx-pa-card bx-pa-legend">
          <h2>
            <span className="bx-pa-small-icon">
              <AgendaIcon name="info" />
            </span>
            Estados de las citas
          </h2>
          {[
            [
              'completed',
              'Completada',
              'La atención fue registrada y finalizada.',
              'blue',
            ],
            ['in-service', 'En atención', 'La cita está en curso.', 'yellow'],
            [
              'confirmed',
              'Confirmada',
              'La cita está reservada y está por atender.',
              'green',
            ],
            [
              'no-show',
              'No asistió',
              'El cliente no asistió a su cita.',
              'red',
            ],
            ['cancelled', 'Cancelada', 'La cita fue anulada.', 'neutral'],
          ].map(([id, label, text, tone]) => (
            <div key={id}>
              <span className={`bx-pa-legend-icon bx-pa-status--${tone}`}>
                <AgendaIcon
                  name={
                    id === 'completed'
                      ? 'check'
                      : id === 'in-service'
                        ? 'clock'
                        : id === 'cancelled' || id === 'no-show'
                          ? 'cancel'
                          : 'info'
                  }
                />
              </span>
              <strong>{label}</strong>
              <p>{text}</p>
            </div>
          ))}
        </section>
        <section className="bx-pa-card bx-pa-shortcuts">
          <h2>
            <span className="bx-pa-small-icon">
              <WorkspaceIcon name="bolt" />
            </span>
            Accesos rápidos
          </h2>
          <Link href={dest('schedules')}>
            <WorkspaceIcon name="calendar" />
            <span>
              <strong>Gestionar mis horarios</strong>
              <small>Define tus días y horas de atención.</small>
            </span>
            <WorkspaceIcon name="chevron" />
          </Link>
          <Link
            href={
              app.getScope()?.role === 'administrator'
                ? '/services'
                : `/account?view=shop&shop=${encodeURIComponent(shopId)}`
            }
          >
            <SiteIcon name="scissors" />
            <span>
              <strong>
                {app.getScope()?.role === 'administrator'
                  ? 'Gestionar mis servicios'
                  : 'Consultar mis servicios'}
              </strong>
              <small>
                {app.getScope()?.role === 'administrator'
                  ? 'Revisa servicios, precios y duración.'
                  : 'Consulta el catálogo de esta barbería.'}
              </small>
            </span>
            <WorkspaceIcon name="chevron" />
          </Link>
        </section>
      </aside>
    </div>
  );
}
