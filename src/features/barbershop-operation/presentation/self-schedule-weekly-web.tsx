import type { Hours } from '../domain/types';
import { useState } from 'react';
import type { OwnSchedule } from '../domain/self-schedule';
import {
  personalTimeOptions,
  preparePersonalInterval,
} from './self-schedule-options';
import { AppButton } from '../../../shared/ui/app-button';
import { ScheduleTimeSelect } from './weekly-schedule-web';
import { ShopSettingsIcon } from './shop-settings-web';
import { scheduleClock, weekDays } from './weekly-schedule-draft';
import { selfScheduleWeeklyStyles } from './self-schedule-weekly-web.styles';

export function SelfScheduleWeeklyWeb(p: {
  hours: readonly Hours[];
  view?: OwnSchedule | null;
  weekday: string;
  opens: string;
  closes: string;
  busy: boolean;
  onWeekday: (v: string) => void;
  onOpens: (v: string) => void;
  onCloses: (v: string) => void;
  onAdd: () => void;
  onRemoveHour: (i: number) => void;
  onSaveHours: () => void;
}) {
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const minutes = (value: string) => {
    if (!/^\d{2}:\d{2}$/.test(value)) return null;
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  };
  const start = minutes(p.opens),
    end = minutes(p.closes),
    day = Number(p.weekday);
  const startAllowed = p.view
    ? personalTimeOptions(p.view.shopHours, day, null, false)
    : null;
  const endAllowed = p.view
    ? personalTimeOptions(p.view.shopHours, day, null, true, start)
    : null;
  let valid = !!p.opens && !!p.closes;
  if (valid && p.view) {
    try {
      preparePersonalInterval(p.view, p.hours, p.weekday, p.opens, p.closes);
    } catch {
      valid = false;
    }
  }
  const removingSaved = !p.hours.length && !!p.view?.hours.length;
  return (
    <section className="bx-self-week" aria-labelledby="self-week-title">
      <style>{selfScheduleWeeklyStyles}</style>
      <header className="bx-self-week-heading">
        <span className="bx-self-week-icon">
          <ShopSettingsIcon name="calendar" />
        </span>
        <div>
          <h3 id="self-week-title">Mis intervalos semanales</h3>
          <p>
            Elige cuándo atenderás personalmente, dentro del horario de tu
            barbería.
          </p>
        </div>
        <span className="bx-self-week-zone">Hora de Lima</span>
      </header>
      <div className="bx-self-week-editor">
        <p className="bx-self-week-step">
          1. Elige un día y tus horas de atención
        </p>
        <div className="bx-self-week-fields">
          <label htmlFor="self-day">
            <span>Día de atención</span>
            <select
              id="self-day"
              value={p.weekday}
              disabled={p.busy}
              onChange={(e) => {
                p.onWeekday(e.target.value);
                p.onOpens('');
                p.onCloses('');
                setConfirmEmpty(false);
              }}
            >
              {[...weekDays]
                .sort((a, b) => a.id - b.id)
                .map((day) => (
                  <option key={day.id} value={String(day.id)}>
                    {day.name}
                  </option>
                ))}
            </select>
          </label>
          <ScheduleTimeSelect
            id="self-opens"
            label="Desde"
            value={minutes(p.opens)}
            options={
              startAllowed
                ? personalTimeOptions(p.view!.shopHours, day, start, false)
                : undefined
            }
            isOptionDisabled={
              startAllowed ? (v) => !startAllowed.includes(v) : undefined
            }
            disabled={p.busy || (!!p.view && !startAllowed?.length)}
            onChange={(v) => {
              p.onOpens(v === null ? '' : scheduleClock(v));
              p.onCloses('');
              setConfirmEmpty(false);
            }}
          />
          <ScheduleTimeSelect
            id="self-closes"
            label="Hasta"
            value={minutes(p.closes)}
            end
            options={
              endAllowed
                ? personalTimeOptions(p.view!.shopHours, day, end, true, start)
                : undefined
            }
            isOptionDisabled={
              endAllowed ? (v) => !endAllowed.includes(v) : undefined
            }
            disabled={
              p.busy || (!!p.view && (start === null || !endAllowed?.length))
            }
            onChange={(v) => p.onCloses(v === null ? '' : scheduleClock(v))}
          />
        </div>
        <AppButton
          label="Añadir intervalo a mi lista"
          variant="secondary"
          disabled={p.busy || !valid}
          onPress={() => {
            if (!p.busy && valid) {
              setConfirmEmpty(false);
              p.onAdd();
            }
          }}
        />
        {p.view && !startAllowed?.length && (
          <p className="bx-self-week-hint">
            El local no tiene horario de atención para este día.
          </p>
        )}
        {!!p.opens && !!p.closes && !valid && (
          <p className="bx-self-week-hint" role="status">
            El intervalo debe quedar dentro del horario del local, con inicio
            anterior al fin y sin solaparse con tu lista.
          </p>
        )}
        <p className="bx-self-week-hint">
          ¿Atiendes mañana y tarde? Añade dos intervalos para el mismo día. El
          espacio entre ambos será tu descanso.
        </p>
      </div>
      <div className="bx-self-week-preview">
        <p className="bx-self-week-step">
          2. Revisa tu semana y guarda los horarios
        </p>
        {!p.hours.length ? (
          <p className="bx-self-week-empty">
            Todavía no has añadido intervalos. Si guardas esta lista vacía, se
            retirarán tus horarios actuales cuando las citas lo permitan.
          </p>
        ) : (
          <ul aria-label="Tus intervalos de atención">
            {weekDays.flatMap((day) => {
              const rows = p.hours
                .map((h, index) => ({ ...h, index }))
                .filter((h) => h.weekday === day.id)
                .sort((a, b) => a.opensMin - b.opensMin);
              return rows.length
                ? [
                    <li key={day.id}>
                      <strong>{day.name}</strong>
                      <div className="bx-self-week-intervals">
                        {rows.map((h) => (
                          <div className="bx-self-week-interval" key={h.index}>
                            <span>
                              <ShopSettingsIcon name="clock" />
                              {scheduleClock(h.opensMin)}–
                              {scheduleClock(h.closesMin)}
                            </span>
                            <button
                              type="button"
                              disabled={p.busy}
                              aria-label={`Retirar intervalo ${h.index + 1}`}
                              title={`Retirar ${day.name} ${scheduleClock(h.opensMin)}–${scheduleClock(h.closesMin)}`}
                              onClick={() => {
                                if (!p.busy) {
                                  setConfirmEmpty(false);
                                  p.onRemoveHour(h.index);
                                }
                              }}
                            >
                              <ShopSettingsIcon name="trash" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </li>,
                  ]
                : [];
            })}
          </ul>
        )}
        <div className="bx-self-week-footer">
          <p>
            Añadir o quitar intervalos solo prepara la lista. Los cambios se
            aplican al guardar.
          </p>
          <AppButton
            label="Guardar mis horarios"
            disabled={p.busy}
            onPress={() => {
              if (p.busy) return;
              if (removingSaved) setConfirmEmpty(true);
              else p.onSaveHours();
            }}
          />
          {removingSaved && confirmEmpty && (
            <div
              className="bx-self-week-confirm"
              role="group"
              aria-label="Confirmar retirada de horarios"
            >
              <p role="alert">
                Vas a retirar todos tus horarios personales. El servidor
                comprobará que no afecte a citas comprometidas.
              </p>
              <AppButton
                label="Confirmar retirada de horarios"
                variant="danger"
                disabled={p.busy}
                onPress={() => {
                  if (!p.busy) {
                    setConfirmEmpty(false);
                    p.onSaveHours();
                  }
                }}
              />
              <AppButton
                label="Volver sin retirar horarios"
                variant="secondary"
                disabled={p.busy}
                onPress={() => setConfirmEmpty(false)}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
