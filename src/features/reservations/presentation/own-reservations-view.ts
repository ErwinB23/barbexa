import type { BookingDetail } from '../domain/types';
import type { CareView } from '../domain/care';
export function ownReservationsView(
  rows: readonly BookingDetail[],
  care: Readonly<Record<string, CareView>>,
  now: number,
) {
  const sorted = [...rows].sort(
    (a, b) =>
      Date.parse(b.startsAt) - Date.parse(a.startsAt) ||
      a.id.localeCompare(b.id),
  );
  const future = sorted.filter(
    (r) =>
      r.state === 'confirmed' &&
      Date.parse(r.startsAt) > now &&
      !['completed', 'no-show', 'cancelled'].includes(
        care[r.id]?.attendance ?? '',
      ),
  );
  return {
    next: future[0] ?? null,
    sorted,
    upcoming: future.length,
    attended: rows.filter(
      (r) => r.state !== 'cancelled' && care[r.id]?.attendance === 'completed',
    ).length,
    cancelled: rows.filter((r) => r.state === 'cancelled').length,
  };
}
