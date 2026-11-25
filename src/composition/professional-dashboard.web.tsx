import { useEffect, useRef, useState } from 'react';
import { Link } from 'expo-router';
import type { OperationApplication } from '../features/barbershop-operation/application/operation-application';
import {
  readProfessionalDashboard,
  type DashboardData,
  type ProfessionalBooking,
} from './professional-dashboard-data';
import { ProfessionalRescheduleForm } from './professional-reschedule-form.web';
import { ProfessionalReservationDetail } from './professional-reservation-detail.web';
import { CareControl } from '../features/reservations/presentation/care-control';
import { CancellationControl } from '../features/reservations/presentation/cancellation-control';
import { RescheduleControl } from '../features/reservations/presentation/reschedule-control';
import { bookingTime } from '../features/reservations/presentation/booking-format';
import { WorkspaceIcon } from '../shared/ui/workspace-icon.web';
import { SiteIcon } from '../shared/ui/site-icon.web';
import {
  professionalDay,
  professionalWeek,
  shiftProfessionalDay,
} from '../features/barbershop-operation/presentation/professional-dashboard-dates';
const destination = (section: string) =>
  `/staff?view=professional&section=${section}`;
const dayLabel = (day: string) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`));
const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
function MetricIcon({ index }: { index: number }) {
  if (index === 0 || index === 3)
    return <WorkspaceIcon name={index === 0 ? 'reservations' : 'calendar'} />;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d={index === 1 ? 'm7 12 3 3 7-7' : 'M12 6v6l4 3'} />
    </svg>
  );
}
export function ProfessionalDashboard({
  application: app,
  booking,
  shopId,
  shopName,
}: {
  application: OperationApplication;
  booking: ProfessionalBooking;
  shopId: string;
  shopName: string;
}) {
  const [day, setDay] = useState(professionalDay),
    [weekly, setWeekly] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    data: DashboardData;
  } | null>(null);
  const scope = app.scopeKey(),
    key = `${scope}:${day}:${weekly}:${attempt}`;
  const data = loaded?.key === key ? loaded.data : null;
  const readQueue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let current = true;
    const valid = () => current && app.scopeKey() === scope;
    async function read() {
      if (!valid()) return;
      const result = await readProfessionalDashboard({
        app,
        booking,
        shopId,
        day,
        weekly,
        isCurrent: valid,
      });
      if (result && valid()) setLoaded({ key, data: result });
    }
    // Own-schedule reads are exclusive: discard obsolete dates before starting
    // the next read instead of producing conflicts when the user clicks quickly.
    readQueue.current = readQueue.current.then(read, read);
    void readQueue.current.catch(() => {});
    return () => {
      current = false;
    };
  }, [app, booking, day, weekly, attempt, shopId, scope, key]);
  const week = professionalWeek(day);
  const p = data?.professional;
  const services =
    data?.catalog?.services.filter((s) =>
      data.catalog!.capabilities.some(
        (c) => c.barberId === p?.id && c.serviceId === s.id,
      ),
    ) ?? [];
  return (
    <div className="bx-pro-dashboard">
      <div className="bx-pro-main">
        <section className="bx-pro-card bx-pro-summary">
          <header>
            <WorkspaceIcon name="calendar" />
            <div>
              <h2>Resumen de la jornada</h2>
              <p>{dayLabel(day)}</p>
            </div>
          </header>
          <div className="bx-pro-metrics">
            {[
              ['Citas del día', data?.summary?.total],
              ['Completadas', data?.summary?.completed],
              ['En atención', data?.summary?.inService],
              ['Confirmadas', data?.summary?.scheduled],
            ].map(([label, value], index) => (
              <div key={label}>
                <MetricIcon index={index} />
                <div>
                  <strong>{value ?? '—'}</strong>
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
          {data?.summary ? (
            <details className="bx-pro-summary-more">
              <summary>Más información de la jornada</summary>
              <p>
                Canceladas: {data.summary.cancelled} · Inasistencias:{' '}
                {data.summary.noShow} · Sin atención registrada:{' '}
                {data.summary.unrecorded} · Próximas del día:{' '}
                {data.summary.upcoming}
                {data.summary.nextStartsAt && (
                  <>
                    {' '}
                    · Siguiente: {bookingTime(data.summary.nextStartsAt)} (Lima)
                  </>
                )}
              </p>
            </details>
          ) : (
            <p className="bx-pro-summary-more" role="status">
              {data
                ? 'No se pudo consultar el resumen de esta fecha.'
                : 'Consultando el resumen…'}
            </p>
          )}
        </section>
        <section className="bx-pro-card bx-pro-agenda">
          <div className="bx-pro-section-heading">
            <div>
              <h2>
                <WorkspaceIcon name="calendar" />
                Mi agenda
              </h2>
              <p>
                Consulta y gestiona tus citas por día o por semana · hora de
                Lima.
              </p>
            </div>
            <button
              type="button"
              disabled={!data}
              onClick={() => setAttempt((n) => n + 1)}
            >
              Actualizar agenda
            </button>
          </div>
          <div className="bx-pro-calendar">
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => setDay(shiftProfessionalDay(day, -7))}
            >
              ‹
            </button>
            <div className="bx-pro-week">
              {week.map((d) => (
                <button
                  type="button"
                  key={d}
                  aria-pressed={day === d}
                  onClick={() => setDay(d)}
                >
                  <strong>
                    {new Intl.DateTimeFormat('es-PE', {
                      weekday: 'short',
                      timeZone: 'UTC',
                    }).format(new Date(`${d}T12:00:00Z`))}
                  </strong>
                  <small>
                    {d.slice(8)} / {d.slice(5, 7)}
                  </small>
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Semana siguiente"
              onClick={() => setDay(shiftProfessionalDay(day, 7))}
            >
              ›
            </button>
          </div>
          <div className="bx-pro-view">
            <button
              type="button"
              aria-pressed={!weekly}
              onClick={() => setWeekly(false)}
            >
              Vista diaria
            </button>
            <button
              type="button"
              aria-pressed={weekly}
              onClick={() => setWeekly(true)}
            >
              Vista semanal
            </button>
            <label className="bx-pro-date-field">
              <span className="bx-pro-sr-only">
                Fecha de la agenda profesional
              </span>
              <input
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                aria-label="Fecha de la agenda profesional"
                value={day}
                onChange={(e) => {
                  if (
                    /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) &&
                    e.target.validity.valid
                  )
                    setDay(e.target.value);
                }}
              />
            </label>
          </div>
          {!data ? (
            <p role="status">Consultando tu actividad…</p>
          ) : (
            <>
              {data.error && (
                <p className="bx-pro-feedback" role="alert">
                  No se pudo consultar toda la información. Actualiza la agenda
                  para reintentarlo.
                </p>
              )}
              {!data.agendaReady && (
                <p className="bx-pro-empty">
                  No se pudo consultar tu agenda. Comprueba que tienes un perfil
                  profesional activo y vuelve a actualizar.
                </p>
              )}
              {data.agendaReady && !data.rows.length && (
                <p className="bx-pro-empty">
                  No hay citas disponibles para este periodo.
                </p>
              )}
              {data.rows.map((r) => {
                const v = data.care[r.id],
                  attendance = v?.attendance;
                const status =
                  r.state === 'cancelled' || attendance === 'cancelled'
                    ? 'Cancelada'
                    : attendance === 'completed'
                      ? 'Completada'
                      : attendance === 'in-service'
                        ? 'En atención'
                        : attendance === 'no-show'
                          ? 'No asistió'
                          : 'Confirmada';
                return (
                  <details className="bx-pro-appointment" key={r.id}>
                    <summary>
                      <time>
                        {weekly && (
                          <small>{professionalDay(new Date(r.startsAt))}</small>
                        )}
                        {bookingTime(r.startsAt)}
                      </time>
                      <span className="bx-pro-client-icon">
                        <WorkspaceIcon name="user" />
                      </span>
                      <span className="bx-pro-appointment-name">
                        <strong>{r.clientDisplayNameSnapshot}</strong>
                        <small>
                          {r.items.map((i) => i.nameSnapshot).join(' + ')} ·{' '}
                          {r.durationMin} min
                        </small>
                      </span>
                      <span
                        className={`bx-pro-badge${status === 'Completada' ? ' bx-pro-badge--blue' : status === 'Cancelada' ? ' bx-pro-badge--neutral' : status === 'No asistió' ? ' bx-pro-badge--red' : status === 'En atención' ? ' bx-pro-badge--yellow' : status === 'Confirmada' ? ' bx-pro-badge--green' : ''}`}
                      >
                        {status}
                      </span>
                      <span
                        className="bx-pro-appointment-toggle"
                        aria-hidden="true"
                      >
                        <WorkspaceIcon name="chevron" />
                      </span>
                    </summary>
                    <div className="bx-pro-appointment-detail">
                      {!v && (
                        <p>
                          Atención aún no consultada. El estado mostrado
                          corresponde a la reserva.
                        </p>
                      )}
                      <CareControl
                        confirmOperationsInCard
                        reservationId={r.id}
                        startsAt={r.startsAt}
                        initialView={v}
                        onUpdated={(next, mutated) => {
                          const valid = () => app.scopeKey() === scope;
                          setLoaded((previous) =>
                            previous?.key === key && valid()
                              ? {
                                  ...previous,
                                  data: {
                                    ...previous.data,
                                    care: {
                                      ...previous.data.care,
                                      [r.id]: next,
                                    },
                                  },
                                }
                              : previous,
                          );
                          if (mutated && app.ownSummary) {
                            void app.ownSummary
                              .read(day)
                              .then((summary) => {
                                setLoaded((previous) =>
                                  previous?.key === key && valid()
                                    ? {
                                        ...previous,
                                        data: { ...previous.data, summary },
                                      }
                                    : previous,
                                );
                              })
                              .catch(() => {
                                setLoaded((previous) =>
                                  previous?.key === key && valid()
                                    ? {
                                        ...previous,
                                        data: {
                                          ...previous.data,
                                          summary: null,
                                        },
                                      }
                                    : previous,
                                );
                              });
                          }
                        }}
                        renderLayout={(parts) => (
                          <ProfessionalReservationDetail
                            detail={r}
                            parts={parts}
                          />
                        )}
                        renderActions={(view) => {
                          const canChange =
                            r.state === 'confirmed' &&
                            view !== null &&
                            (view.attendance === null ||
                              view.attendance === 'confirmed');
                          return (
                            <>
                              <RescheduleControl
                                detail={r}
                                renderContent={ProfessionalRescheduleForm}
                                staff
                                canChange={canChange}
                              />
                              {canChange && (
                                <CancellationControl detail={r} staff />
                              )}
                            </>
                          );
                        }}
                      />
                    </div>
                  </details>
                );
              })}
            </>
          )}
        </section>
      </div>
      <aside className="bx-pro-aside">
        <section className="bx-pro-card">
          <header>
            <WorkspaceIcon name="user" />
            <h2>Mi perfil profesional</h2>
          </header>
          <div className="bx-pro-card-body">
            <div className="bx-pro-profile">
              <span className="bx-pro-avatar">
                <WorkspaceIcon name="user" />
              </span>
              <div>
                <h3>{p?.professionalName ?? 'Perfil por consultar'}</h3>
                <p>
                  {p
                    ? 'Profesional de esta barbería'
                    : data
                      ? 'El perfil no está disponible.'
                      : 'Consultando información…'}
                </p>
                {p && (
                  <span
                    className={`bx-pro-badge${p.active ? ' bx-pro-badge--green' : ''}`}
                  >
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                )}
              </div>
              <Link href={destination('profile')}>Ver perfil</Link>
            </div>
            <div className="bx-pro-contact">
              <div>
                <small>Barbería</small>
                <strong>{shopName}</strong>
              </div>
              <div>
                <small>Contacto público</small>
                <strong>
                  {data?.catalog?.publicContact || 'No disponible'}
                </strong>
              </div>
            </div>
          </div>
        </section>
        <section className="bx-pro-card">
          <header>
            <SiteIcon name="scissors" />
            <h2>
              Mis servicios{data?.catalog && p ? ` (${services.length})` : ''}
            </h2>
          </header>
          <div className="bx-pro-card-body">
            {data?.catalog && p ? (
              services.length ? (
                services.map((s) => (
                  <div className="bx-pro-service" key={s.id}>
                    <SiteIcon name="scissors" />
                    <strong>{s.name}</strong>
                    <small>{s.durationMin} min</small>
                    <span>S/ {(s.price.amountMinor / 100).toFixed(2)}</span>
                    <span className="bx-pro-badge">
                      {s.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                ))
              ) : (
                <p>No hay servicios asignados en el catálogo disponible.</p>
              )
            ) : (
              <p>
                {data
                  ? p
                    ? 'El catálogo público de servicios no está disponible para consulta.'
                    : 'Consulta tu perfil profesional para ver sus servicios asignados.'
                  : 'Consultando tus servicios…'}
              </p>
            )}
            <Link
              className="bx-pro-panel-link"
              href={
                app.getScope()?.role === 'administrator'
                  ? '/services'
                  : `/account?view=shop&shop=${encodeURIComponent(shopId)}`
              }
            >
              {app.getScope()?.role === 'administrator'
                ? 'Gestionar mis servicios'
                : 'Ver catálogo de servicios'}
            </Link>
          </div>
        </section>
        <section className="bx-pro-card">
          <header>
            <WorkspaceIcon name="calendar" />
            <h2>Mi disponibilidad</h2>
          </header>
          <div className="bx-pro-card-body">
            {[1, 2, 3, 4, 5, 6, 0].map((d, index) => {
              const intervals = data?.schedule?.hours
                .filter((h) => h.weekday === d)
                .sort((a, b) => a.opensMin - b.opensMin);
              return (
                <div className="bx-pro-hours" key={d}>
                  <strong>
                    {
                      [
                        'Lunes',
                        'Martes',
                        'Miércoles',
                        'Jueves',
                        'Viernes',
                        'Sábado',
                        'Domingo',
                      ][index]
                    }
                  </strong>
                  <span>
                    {intervals?.length
                      ? intervals
                          .map(
                            (h) => `${clock(h.opensMin)}–${clock(h.closesMin)}`,
                          )
                          .join(' / ')
                      : intervals
                        ? 'Sin intervalos'
                        : 'Por consultar'}
                  </span>
                  <span
                    className={`bx-pro-badge${intervals?.length ? ' bx-pro-badge--green' : ''}`}
                  >
                    {intervals
                      ? intervals.length
                        ? 'Configurado'
                        : 'No disponible'
                      : '—'}
                  </span>
                </div>
              );
            })}
            <p className="bx-pro-note">
              Horario semanal personal. Se aplican también los horarios del
              local, bloqueos y excepciones.
            </p>
            <Link className="bx-pro-panel-link" href={destination('schedules')}>
              Editar mis horarios
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
