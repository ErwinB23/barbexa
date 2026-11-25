import { careCommand } from '../domain/care';
import {
  rescheduleInput,
  rescheduleQuery,
  reschedulePolicyCommand,
} from '../domain/reschedule';
import { reservationId } from '../domain/reservation-input';
import type {
  RescheduleGateway,
  RescheduleManagementGateway,
} from '../application/reschedule';
import {
  reschedulePolicyPayload,
  rescheduleHistoryPayload,
} from './reschedule-payload';
import type { ReservaRemotaGateway } from '../application/reservation-remote-gateway';
import type { BookingDetail } from '../domain/types';
import { cancellationInput } from '../domain/cancellation';
import {
  agendaFilters,
  type AgendaGateway,
} from '../application/agenda-application';
import { BusinessError } from '../domain/values';
import {
  bookingDetail,
  availableSlots,
  providerError,
  record,
  unavailable,
  instant,
} from './booking-payload';
export interface ReservationHttpOptions {
  readonly baseUrl: string;
  readonly publicKey: string;
  readonly getAccessToken: () => Promise<string | null>;
  readonly expectedUser: () => string | null;
  readonly developmentHttpOrigin?: string;
  readonly fetcher?: typeof fetch;
  readonly timeoutMs?: number;
}
export function createReservationHttpAdapter(
  options: ReservationHttpOptions,
): Pick<
  ReservaRemotaGateway,
  'confirm' | 'cancel' | 'listSlots' | 'listOwnReservations'
> &
  AgendaGateway &
  RescheduleGateway &
  RescheduleManagementGateway & { care: (input: unknown) => Promise<unknown> } {
  const base = new URL(options.baseUrl),
    parts = base.hostname.split('.').map(Number);
  const lan =
    parts.length === 4 &&
    parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) &&
    (parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168));
  const development =
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    lan &&
    base.port === '54421' &&
    base.origin === options.developmentHttpOrigin;
  let publicKey = false;
  try {
    publicKey =
      options.publicKey.startsWith('sb_publishable_') ||
      JSON.parse(
        atob(
          options.publicKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'),
        ),
      ).role === 'anon';
  } catch {}
  if (
    !publicKey ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== '/' ||
    !(
      base.protocol === 'https:' ||
      (base.protocol === 'http:' &&
        (['127.0.0.1', '[::1]'].includes(base.hostname) || development))
    )
  )
    throw new BusinessError('INVALID_INPUT');
  const fetcher = options.fetcher ?? fetch;
  async function request(
    make: (actor: string) => { path: string; body?: unknown },
  ) {
    const expected = options.expectedUser(),
      token = await options.getAccessToken();
    if (!expected || !token) throw new BusinessError('UNAUTHENTICATED');
    const send = async (path: string, body?: unknown) => {
      const response = await fetcher(options.baseUrl + path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          apikey: options.publicKey,
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
      });
      const value: unknown = await response.json();
      if (!response.ok) throw providerError(value, response.status);
      return { status: response.status, value };
    };
    try {
      const identity = record((await send('/auth/v1/user')).value);
      if (
        identity.id !== expected ||
        identity.is_anonymous !== false ||
        !identity.email_confirmed_at ||
        options.expectedUser() !== expected
      )
        throw new BusinessError('UNAUTHENTICATED');
      const target = make(expected),
        result = await send(target.path, target.body);
      if (options.expectedUser() !== expected)
        throw new BusinessError('UNAUTHENTICATED');
      return { ...result, actor: expected };
    } catch (e) {
      if (e instanceof BusinessError) throw e;
      throw new BusinessError('DEPENDENCY_UNAVAILABLE');
    }
  }
  return {
    async getReschedulePolicy(shop) {
      const barbershopId = reservationId(shop);
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: { action: 'reschedule-policy', barbershopId },
      }));
      return reschedulePolicyPayload(r.value, barbershopId);
    },
    async setReschedulePolicy(input) {
      const value = reschedulePolicyCommand(input);
      if (value.advanceMin === undefined)
        throw new BusinessError('INVALID_INPUT');
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: { action: 'reschedule-policy', ...value },
      }));
      return reschedulePolicyPayload(r.value, value.barbershopId);
    },
    async listRescheduleHistory(id) {
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: {
          action: 'reschedule-history',
          reservationId: reservationId(id),
        },
      }));
      return rescheduleHistoryPayload(r.value);
    },
    async reschedule(input) {
      const value = rescheduleInput(input);
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: { action: 'reschedule', ...value },
      }));
      const detail = bookingDetail(r.value);
      if (
        ![200, 201].includes(r.status) ||
        detail.id !== value.reservationId ||
        detail.startsAt !== value.startsAt ||
        detail.state !== 'confirmed'
      )
        return unavailable();
      return { detail, replayed: r.status === 200 };
    },
    async listRescheduleSlots(input) {
      const value = rescheduleQuery(input);
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: { action: 'reschedule-slots', ...value },
      }));
      if (r.status !== 200) return unavailable();
      return availableSlots(r.value);
    },
    async care(input) {
      const command = careCommand(input);
      return (
        await request(() => ({
          path: '/functions/v1/reservation-command',
          body: { action: 'care', ...command },
        }))
      ).value;
    },
    async cancel(input) {
      const value = cancellationInput(input);
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: { action: 'cancel', ...value },
      }));
      const detail = bookingDetail(r.value);
      if (
        r.status !== 200 ||
        detail.id !== value.reservationId ||
        detail.state !== 'cancelled'
      )
        return unavailable();
      return detail;
    },
    async listAgenda(query) {
      const filters = agendaFilters(query);
      const r = await request(() => ({
        path: '/rest/v1/rpc/list_booking_agenda',
        body: {
          p_barbershop_id: query.barbershopId,
          p_local_date: filters.localDate,
          p_barber_id: filters.barberId,
          p_state: filters.state,
        },
      }));
      if (!Array.isArray(r.value) || r.value.length > 200) return unavailable();
      return r.value.map((value) => {
        const detail = bookingDetail(value);
        if (detail.barbershopId !== query.barbershopId) return unavailable();
        return detail;
      });
    },
    async confirm(input) {
      const r = await request(() => ({
        path: '/functions/v1/reservation-command',
        body: {
          action: 'confirm',
          ...(input.paymentMethod
            ? { paymentMethod: input.paymentMethod }
            : {}),
          requestId: input.requestId,
          barbershopId: input.barbershopId,
          serviceIds: input.serviceIds,
          barberId: input.barberId,
          startsAt: input.startsAt,
        },
      }));
      if (![200, 201].includes(r.status)) return unavailable();
      const detail = bookingDetail(r.value);
      if (detail.barbershopId !== input.barbershopId) return unavailable();
      return { detail, replayed: r.status === 200 };
    },
    async listSlots(query) {
      const r = await request(() => ({
        path: '/rest/v1/rpc/list_booking_slots',
        body: {
          p_barbershop_id: query.barbershopId,
          p_local_date: query.localDate,
          p_service_ids: query.serviceIds,
          p_barber_id: query.barberId,
        },
      }));
      return availableSlots(r.value);
    },
    async listOwnReservations(id?: string) {
      if (id !== undefined) id = reservationId(id);
      const r = await request((actor) => ({
        path:
          '/rest/v1/reservations?select=id,barbershop_id,client_user_id,barber_id,state,starts_at,ends_at,duration_min,total_amount,shop_name_snapshot,barber_name_snapshot,client_display_name_snapshot,policy_snapshot,reservation_items(service_id,name_snapshot,description_snapshot,price_snapshot,duration_min)&client_user_id=eq.' +
          actor +
          (id
            ? '&id=eq.' + id + '&limit=1'
            : '&order=starts_at.desc,id.desc&limit=50'),
      }));
      if (!Array.isArray(r.value)) return unavailable();
      return r.value.map((value) => {
        const v = record(value);
        if (v.client_user_id !== r.actor || !Array.isArray(v.reservation_items))
          return unavailable();
        const detail: BookingDetail = bookingDetail({
          id: v.id,
          barbershopId: v.barbershop_id,
          barberId: v.barber_id,
          state: v.state,
          startsAt: instant(v.starts_at),
          endsAt: instant(v.ends_at),
          durationMin: v.duration_min,
          total: {
            amountMinor: Math.round(Number(v.total_amount) * 100),
            currency: 'PEN',
          },
          shopNameSnapshot: v.shop_name_snapshot,
          barberNameSnapshot: v.barber_name_snapshot,
          clientDisplayNameSnapshot: v.client_display_name_snapshot,
          policySnapshot: v.policy_snapshot,
          items: v.reservation_items.map((item) => {
            const i = record(item);
            return {
              serviceId: i.service_id,
              nameSnapshot: i.name_snapshot,
              descriptionSnapshot: i.description_snapshot,
              priceSnapshot: {
                amountMinor: Math.round(Number(i.price_snapshot) * 100),
                currency: 'PEN',
              },
              durationMin: i.duration_min,
            };
          }),
        });
        if (id && detail.id !== id) return unavailable();
        return detail;
      });
    },
  };
}
