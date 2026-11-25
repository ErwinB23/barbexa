import { useState, type ReactNode } from 'react';
import type { ManagementData } from '../application/operation-application';
import { AppButton } from '../../../shared/ui/app-button';
import { ShopSettingsIcon } from './shop-settings-web';
import {
  copyWeekday,
  joinBreak,
  splitForBreak,
  weekDays,
  scheduleClock,
  timeOptions,
  type WeeklyDraft,
} from './weekly-schedule-draft';
import { weeklyScheduleStyles } from './weekly-schedule-web.styles';
export function ScheduleTimeSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  end = false,
  options,
  isOptionDisabled,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  disabled: boolean;
  end?: boolean;
  options?: readonly number[];
  isOptionDisabled?: (value: number) => boolean;
}) {
  return (
    <label className="bx-week-time" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        aria-label={label}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      >
        <option value="">Elegir hora</option>
        {(options ?? timeOptions(value, end)).map((time) => (
          <option key={time} value={time} disabled={isOptionDisabled?.(time)}>
            {scheduleClock(time)}
          </option>
        ))}
      </select>
    </label>
  );
}
export function WeeklyScheduleWeb(p: {
  title: string;
  data: ManagementData | null;
  barber: string | null;
  disabled: boolean;
  loading: boolean;
  canEdit: boolean;
  navigation: ReactNode;
  feedback: ReactNode;
  extras?: ReactNode;
  onScope: (id: string | null) => void;
  onSave: (rows: readonly WeeklyDraft[]) => void;
  onContext: () => void;
}) {
  const saved =
    p.data?.hours
      .filter((row) => row.barberId === p.barber)
      .map(({ weekday, opensMin, closesMin }) => ({
        weekday,
        opensMin,
        closesMin,
      })) ?? [];
  const source = `${p.barber ?? 'shop'}:${JSON.stringify(saved)}`;
  const [draft, setDraft] = useState<{
      source: string;
      rows: readonly WeeklyDraft[];
    } | null>(null),
    [copyDay, setCopyDay] = useState(1),
    [error, setError] = useState('');
  const [pause, setPause] = useState<{
    scope: string;
    day: number;
    start: number | null;
    end: number | null;
    oldStart?: number;
    oldEnd?: number;
  } | null>(null);
  const rows = draft?.source === source ? draft.rows : saved,
    dirty =
      draft?.source === source &&
      JSON.stringify(rows) !== JSON.stringify(saved);
  const known = !!p.data && !p.loading,
    blocked = p.disabled || !known || !p.canEdit;
  const update = (value: readonly WeeklyDraft[]) => {
    setDraft({ source, rows: value });
    setError('');
  };
  const gaps = (day: number) => {
    const intervals = rows
      .filter(
        (row) =>
          row.weekday === day &&
          row.opensMin !== null &&
          row.closesMin !== null,
      )
      .toSorted((a, b) => a.opensMin! - b.opensMin!);
    return intervals
      .slice(1)
      .flatMap((row, index) =>
        intervals[index].closesMin! < row.opensMin!
          ? [{ start: intervals[index].closesMin!, end: row.opensMin! }]
          : [],
      );
  };
  const openDays = new Set(rows.map((row) => row.weekday)).size;
  const starts = rows.flatMap((row) =>
      row.opensMin !== null ? [row.opensMin] : [],
    ),
    ends = rows.flatMap((row) =>
      row.closesMin !== null ? [row.closesMin] : [],
    );
  function applyPause() {
    if (!pause || pause.start === null || pause.end === null) {
      setError('Selecciona el inicio y el fin del descanso.');
      return;
    }
    try {
      const base =
        pause.oldStart !== undefined && pause.oldEnd !== undefined
          ? joinBreak(rows, pause.day, pause.oldStart, pause.oldEnd)
          : rows;
      update(splitForBreak(base, pause.day, pause.start, pause.end));
      setPause(null);
    } catch {
      setError(
        'El descanso debe quedar dentro de un intervalo abierto, con inicio anterior al fin.',
      );
    }
  }
  return (
    <div className="bx-week-page">
      <style>{weeklyScheduleStyles}</style>
      <header className="bx-week-heading">
        <h1>{p.title}</h1>
        <p>Configura tu negocio y prepara su oferta para recibir reservas.</p>
        <button type="button" onClick={p.onContext}>
          Seleccionar o actualizar mis barberías
        </button>
      </header>
      <nav className="bx-week-tabs" aria-label="Administración de la barbería">
        {p.navigation}
      </nav>
      <div className="bx-week-feedback">{p.feedback}</div>
      <div className="bx-week-scope">
        <label>
          Horario que estás editando
          <select
            value={p.barber ?? ''}
            disabled={p.disabled || !known}
            onChange={(e) => {
              p.onScope(e.target.value || null);
              setDraft(null);
              setPause(null);
              setError('');
            }}
          >
            <option value="">Horario del local</option>
            {p.data?.professionals.map((profile) => (
              <option value={profile.id} key={profile.id}>
                {profile.professionalName}
              </option>
            ))}
          </select>
        </label>
        <p>
          Hora de Lima. Los intervalos del local y de cada profesional se
          guardan por separado.
        </p>
      </div>
      <div className="bx-week-layout">
        <section className="bx-week-card bx-week-editor">
          <div className="bx-week-card-title">
            <span>
              <ShopSettingsIcon name="calendar" />
            </span>
            <div>
              <h2>Disponibilidad semanal</h2>
              <p>
                Define los días, horarios de atención, intervalos y descansos de
                tu barbería.
              </p>
            </div>
          </div>
          <div className="bx-week-copy">
            <label>
              Día de origen
              <select
                value={copyDay}
                disabled={blocked}
                onChange={(e) => setCopyDay(Number(e.target.value))}
              >
                {weekDays.map((day) => (
                  <option key={day.id} value={day.id}>
                    {day.name}
                  </option>
                ))}
              </select>
            </label>
            <AppButton
              label="Aplicar a todos los días"
              variant="secondary"
              disabled={blocked || !rows.some((row) => row.weekday === copyDay)}
              onPress={() => {
                try {
                  update(copyWeekday(rows, copyDay));
                } catch {
                  setError(
                    'Completa los intervalos del día de origen antes de copiarlos.',
                  );
                }
              }}
            />
            <p>
              Copia el horario del día seleccionado al resto de la semana,
              reemplazando su borrador.
            </p>
          </div>
          {error && (
            <p className="bx-week-error" role="alert">
              {error}
            </p>
          )}
          {!known ? (
            <p role="status" className="bx-week-unknown">
              {p.loading
                ? 'Consultando disponibilidad…'
                : 'No se pudieron comprobar los horarios. Utiliza Reintentar antes de editar.'}
            </p>
          ) : (
            weekDays.map((day) => {
              const intervals = rows
                .map((row, index) => ({ row, index }))
                .filter(({ row }) => row.weekday === day.id);
              const open = intervals.length > 0;
              return (
                <section
                  key={day.id}
                  className="bx-week-day"
                  aria-label={day.name}
                >
                  <div className="bx-week-day-heading">
                    <ShopSettingsIcon name="calendar" />
                    <div>
                      <h3>{day.name}</h3>
                      <span
                        className={`bx-week-day-state${open ? ' is-open' : ''}`}
                      >
                        {open ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="bx-week-switch"
                      role="switch"
                      aria-checked={open}
                      aria-label={`${day.name}: ${open ? 'Abierto' : 'Cerrado'}`}
                      disabled={blocked}
                      onClick={() => {
                        update(
                          open
                            ? rows.filter((row) => row.weekday !== day.id)
                            : [
                                ...rows,
                                {
                                  weekday: day.id,
                                  opensMin: null,
                                  closesMin: null,
                                },
                              ],
                        );
                        if (pause?.day === day.id) setPause(null);
                      }}
                    >
                      <i />
                    </button>
                  </div>
                  <div className="bx-week-day-content">
                    {!open ? (
                      <p className="bx-week-closed">Sin horarios de atención</p>
                    ) : (
                      <>
                        {intervals.map(({ row, index }, position) => (
                          <div className="bx-week-interval" key={index}>
                            <ShopSettingsIcon name="clock" />
                            <ScheduleTimeSelect
                              id={`week-${day.id}-${position}-from`}
                              label={`Desde · ${day.name} ${position + 1}`}
                              value={row.opensMin}
                              disabled={blocked}
                              onChange={(value) =>
                                update(
                                  rows.map((item, i) =>
                                    i === index
                                      ? { ...item, opensMin: value }
                                      : item,
                                  ),
                                )
                              }
                            />
                            <ScheduleTimeSelect
                              id={`week-${day.id}-${position}-to`}
                              label={`Hasta · ${day.name} ${position + 1}`}
                              value={row.closesMin}
                              end
                              disabled={blocked}
                              onChange={(value) =>
                                update(
                                  rows.map((item, i) =>
                                    i === index
                                      ? { ...item, closesMin: value }
                                      : item,
                                  ),
                                )
                              }
                            />
                            <button
                              type="button"
                              className="bx-week-remove"
                              aria-label={`Eliminar intervalo ${position + 1} de ${day.name}`}
                              disabled={blocked}
                              onClick={() =>
                                update(rows.filter((_, i) => i !== index))
                              }
                            >
                              <ShopSettingsIcon name="trash" />
                            </button>
                          </div>
                        ))}
                        {gaps(day.id).map((gap) => (
                          <div
                            className="bx-week-break"
                            key={`${gap.start}-${gap.end}`}
                          >
                            <ShopSettingsIcon name="coffee" />
                            <span>
                              Descanso: {scheduleClock(gap.start)}–
                              {scheduleClock(gap.end)}
                            </span>
                            <button
                              type="button"
                              disabled={blocked}
                              aria-label={`Editar descanso de ${day.name} ${scheduleClock(gap.start)}`}
                              onClick={() =>
                                setPause({
                                  scope: source,
                                  day: day.id,
                                  start: gap.start,
                                  end: gap.end,
                                  oldStart: gap.start,
                                  oldEnd: gap.end,
                                })
                              }
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={blocked}
                              aria-label={`Eliminar descanso de ${day.name} ${scheduleClock(gap.start)}`}
                              title="Une los intervalos y habilita esas horas al guardar"
                              onClick={() =>
                                update(
                                  joinBreak(rows, day.id, gap.start, gap.end),
                                )
                              }
                            >
                              Eliminar
                            </button>
                          </div>
                        ))}
                        {pause?.scope === source && pause.day === day.id && (
                          <div className="bx-week-break-editor">
                            <ScheduleTimeSelect
                              id={`pause-${day.id}-from`}
                              label="Inicio del descanso"
                              value={pause.start}
                              disabled={blocked}
                              onChange={(value) =>
                                setPause({ ...pause, start: value })
                              }
                            />
                            <ScheduleTimeSelect
                              id={`pause-${day.id}-to`}
                              label="Fin del descanso"
                              value={pause.end}
                              end
                              disabled={blocked}
                              onChange={(value) =>
                                setPause({ ...pause, end: value })
                              }
                            />
                            <button
                              type="button"
                              disabled={blocked}
                              onClick={applyPause}
                            >
                              Aplicar descanso
                            </button>
                            <button
                              type="button"
                              disabled={blocked}
                              onClick={() => setPause(null)}
                            >
                              Cancelar descanso
                            </button>
                          </div>
                        )}
                        <div className="bx-week-day-actions">
                          <button
                            type="button"
                            disabled={blocked}
                            onClick={() =>
                              update([
                                ...rows,
                                {
                                  weekday: day.id,
                                  opensMin: null,
                                  closesMin: null,
                                },
                              ])
                            }
                          >
                            ＋ Añadir horario
                          </button>
                          <button
                            type="button"
                            disabled={blocked}
                            onClick={() =>
                              setPause({
                                scope: source,
                                day: day.id,
                                start: null,
                                end: null,
                              })
                            }
                          >
                            ＋ Añadir descanso
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              );
            })
          )}
        </section>
        <aside className="bx-week-summary-column">
          <section className="bx-week-card">
            <div className="bx-week-card-title">
              <span>
                <ShopSettingsIcon name="layers" />
              </span>
              <div>
                <h2>Resumen de horarios</h2>
                <p>Vista general de tu disponibilidad semanal.</p>
              </div>
            </div>
            <span
              className={`bx-week-summary-status${dirty ? ' is-draft' : ''}`}
            >
              {!known
                ? 'Por comprobar'
                : dirty
                  ? 'Borrador sin guardar'
                  : saved.length
                    ? 'Horario configurado'
                    : 'Sin horarios configurados'}
            </span>
            <div className="bx-week-stats">
              <div>
                <ShopSettingsIcon name="calendar" />
                <strong>{known ? openDays : '—'}</strong>
                <span>Días abiertos</span>
              </div>
              <div>
                <ShopSettingsIcon name="clock" />
                <strong>
                  {known && starts.length && ends.length
                    ? `${scheduleClock(Math.min(...starts))}–${scheduleClock(Math.max(...ends))}`
                    : '—'}
                </strong>
                <span>Rango semanal</span>
              </div>
              <div>
                <ShopSettingsIcon name="coffee" />
                <strong>
                  {known
                    ? weekDays.reduce(
                        (sum, day) => sum + gaps(day.id).length,
                        0,
                      )
                    : '—'}
                </strong>
                <span>Descansos semanales</span>
              </div>
            </div>
            <h3 className="bx-week-view-title">Vista semanal</h3>
            <div className="bx-week-overview">
              {weekDays.map((day) => (
                <div key={day.id}>
                  <strong>{day.short}</strong>
                  <span>
                    {!known ? (
                      <i>Por comprobar</i>
                    ) : rows.some((row) => row.weekday === day.id) ? (
                      rows
                        .filter((row) => row.weekday === day.id)
                        .toSorted(
                          (a, b) => (a.opensMin ?? 0) - (b.opensMin ?? 0),
                        )
                        .map((row, index) => (
                          <i key={index}>
                            {row.opensMin === null || row.closesMin === null
                              ? 'Completar horas'
                              : `${scheduleClock(row.opensMin)}–${scheduleClock(row.closesMin)}`}
                          </i>
                        ))
                    ) : (
                      <i className="is-closed">Cerrado</i>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="bx-week-card bx-week-advice">
            <h2>ⓘ Consejos de configuración</h2>
            <ul>
              <li>Define al menos un intervalo en cada día abierto.</li>
              <li>Puedes añadir varios intervalos, como mañana y tarde.</li>
              <li>
                Los descansos son huecos entre intervalos abiertos; no crean
                bloqueos adicionales.
              </li>
              <li>
                Eliminar un descanso une los intervalos y habilita esas horas al
                guardar.
              </li>
              <li>Usa «Aplicar a todos los días» para ahorrar tiempo.</li>
            </ul>
          </section>
        </aside>
      </div>
      <div className="bx-week-bottom">
        <AppButton
          label="Cancelar"
          variant="secondary"
          disabled={blocked}
          onPress={() => {
            setDraft(null);
            setPause(null);
            setError('');
          }}
        />
        <AppButton
          label="Guardar cambios"
          disabled={blocked || pause?.scope === source}
          onPress={() => p.onSave(rows)}
        />
      </div>
      {pause?.scope === source && (
        <p className="bx-week-unknown" role="status">
          Aplica o cancela el descanso en edición antes de guardar los cambios.
        </p>
      )}
      {p.extras}
    </div>
  );
}
