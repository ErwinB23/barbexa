import type { BookingDetail } from '../features/reservations/domain/types';
import type { CareView } from '../features/reservations/domain/care';
import {
  professionalDay,
  professionalWeek,
} from '../features/barbershop-operation/presentation/professional-dashboard-dates';
export type ProfessionalAgendaFilter =
  | 'all'
  | 'confirmed'
  | 'in-service'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'unknown';
const statuses = {
  confirmed: { id: 'confirmed', label: 'Confirmada', tone: 'gold' },
  'in-service': { id: 'in-service', label: 'En atención', tone: 'yellow' },
  completed: { id: 'completed', label: 'Completada', tone: 'green' },
  cancelled: { id: 'cancelled', label: 'Cancelada', tone: 'red' },
  'no-show': { id: 'no-show', label: 'No asistió', tone: 'red' },
  unknown: { id: 'unknown', label: 'Atención por consultar', tone: 'neutral' },
} as const;
export function appointmentStatus(row: BookingDetail, care?: CareView | null) {
  if (row.state === 'cancelled') return statuses.cancelled;
  if (!care) return statuses.unknown;
  return statuses[care.attendance ?? 'confirmed'];
}
export function agendaRows(
  rows: readonly BookingDetail[],
  care: Record<string, CareView>,
  filter: ProfessionalAgendaFilter,
) {
  return rows
    .filter(
      (r) => filter === 'all' || appointmentStatus(r, care[r.id]).id === filter,
    )
    .sort(
      (a, b) =>
        Date.parse(b.startsAt) - Date.parse(a.startsAt) ||
        a.id.localeCompare(b.id),
    );
}
export function agendaGroups(
  rows: readonly BookingDetail[],
  day: string,
  weekly: boolean,
) {
  return (weekly ? professionalWeek(day) : [day]).map((date) => ({
    day: date,
    rows: rows.filter((r) => professionalDay(new Date(r.startsAt)) === date),
  }));
}
export const professionalDateLabel = (day: string) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`));
