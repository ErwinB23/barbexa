import type { ContextType } from 'react';
import type { OperationApplication } from '../features/barbershop-operation/application/operation-application';
import type { OwnProfessionalSummary } from '../features/barbershop-operation/domain/own-summary';
import type { OwnSchedule } from '../features/barbershop-operation/domain/self-schedule';
import type {
  Professional,
  BookingCatalog,
} from '../features/barbershop-operation/domain/types';
import type { BookingContext } from '../features/reservations/presentation/booking-context';
import type { BookingDetail } from '../features/reservations/domain/types';
import { careView, type CareView } from '../features/reservations/domain/care';
import { professionalWeek } from '../features/barbershop-operation/presentation/professional-dashboard-dates';

export type ProfessionalBooking = ContextType<typeof BookingContext>;
export interface DashboardData {
  summary: OwnProfessionalSummary | null;
  professional: Professional | null;
  schedule: OwnSchedule | null;
  catalog: BookingCatalog | null;
  rows: readonly BookingDetail[];
  care: Record<string, CareView>;
  agendaReady: boolean;
  error: boolean;
}

// Compose existing read cases; no administrative management read for barbers.
export async function readProfessionalDashboard({
  app,
  booking,
  shopId,
  day,
  weekly,
  isCurrent,
  includeOverview = true,
}: {
  app: OperationApplication;
  booking: ProfessionalBooking;
  shopId: string;
  day: string;
  weekly: boolean;
  isCurrent: () => boolean;
  includeOverview?: boolean;
}): Promise<DashboardData | null> {
  const result: DashboardData = {
    summary: null,
    professional: null,
    schedule: null,
    catalog: null,
    rows: [],
    care: {},
    agendaReady: false,
    error: false,
  };
  await Promise.all([
    (async () => {
      try {
        if (app.ownSummary) {
          result.summary = await app.ownSummary.read(day);
          result.professional = result.summary.professional;
        } else if (app.canEditOwnProfessional())
          result.professional = await app.getOwnProfessional();
      } catch {
        result.error = true;
      }
    })(),
    (async () => {
      try {
        if (includeOverview && app.selfSchedule)
          result.schedule = await app.selfSchedule.read();
      } catch {
        result.error = true;
      }
    })(),
    (async () => {
      try {
        if (includeOverview && booking?.discovery) {
          await booking.discovery.openShop(shopId);
          const s = booking.discovery.getSnapshot();
          if (s.offerPhase === 'ready' && s.offer?.barbershopId === shopId)
            result.catalog = s.offer;
        }
      } catch {
        result.error = true;
      }
    })(),
  ]);
  if (!isCurrent()) return null;
  const professional =
    result.professional ?? result.schedule?.professional ?? null;
  result.professional = professional;
  if (booking?.agenda && professional?.barbershopId === shopId) {
    const rows: BookingDetail[] = [];
    try {
      // AgendaApplication protects each request with a ticket: load days in sequence.
      for (const date of weekly ? professionalWeek(day) : [day]) {
        if (!isCurrent()) return null;
        booking.agenda.setFilters({
          localDate: date,
          state: null,
          barberId:
            app.getScope()?.role === 'administrator' ? professional.id : null,
        });
        await booking.agenda.load();
        if (!isCurrent()) return null;
        const s = booking.agenda.getSnapshot();
        if (s.phase !== 'ready' || s.filters.localDate !== date)
          throw Error('read');
        rows.push(
          ...s.rows.filter(
            (r) => r.barberId === professional.id && r.barbershopId === shopId,
          ),
        );
      }
      result.rows = [...new Map(rows.map((r) => [r.id, r])).values()].sort(
        (a, b) =>
          Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
          a.id.localeCompare(b.id),
      );
      result.agendaReady = true;
      let index = 0;
      async function worker() {
        while (isCurrent() && booking?.care && index < result.rows.length) {
          const row = result.rows[index++];
          try {
            result.care[row.id] = careView(
              await booking.care({ command: 'read', reservationId: row.id }),
              row.id,
            );
          } catch {
            /* Attendance remains unknown; reservation state is still valid. */
          }
        }
      }
      await Promise.all(
        Array.from({ length: Math.min(4, result.rows.length) }, worker),
      );
    } catch {
      result.error = true;
    }
  }
  return isCurrent() ? result : null;
}
