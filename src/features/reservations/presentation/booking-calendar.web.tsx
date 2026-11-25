import { useState } from 'react';
import {
  calendarDays,
  limaDate,
  lastBookingDate,
} from './booking-calendar-dates';
export function BookingCalendar({
  value,
  horizon,
  disabled,
  onChange,
}: {
  value: string;
  horizon: number;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const today = limaDate(),
    last = lastBookingDate(today, horizon);
  const [month, setMonth] = useState(
    (value >= today && value <= last ? value : today).slice(0, 7),
  );
  const move = (offset: number) => {
    const date = new Date(`${month}-01T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + offset);
    setMonth(date.toISOString().slice(0, 7));
  };
  return (
    <div className="bx-book-calendar" aria-label="Fecha de la cita">
      <div className="bx-book-month">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={disabled || month <= today.slice(0, 7)}
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <strong aria-live="polite">
          {new Intl.DateTimeFormat('es-PE', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(new Date(`${month}-01T12:00:00Z`))}
        </strong>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={disabled || month >= last.slice(0, 7)}
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>
      <div className="bx-book-days">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <span key={day}>{day}</span>
        ))}
        {calendarDays(month).map((day, i) =>
          day ? (
            <button
              key={day}
              type="button"
              aria-label={day}
              aria-pressed={day === value}
              disabled={disabled || day < today || day > last}
              onClick={() => onChange(day)}
            >
              {Number(day.slice(8))}
            </button>
          ) : (
            <span key={`empty-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
