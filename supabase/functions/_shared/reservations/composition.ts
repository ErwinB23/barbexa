import { createCareOperation } from './application/care.ts';
import { createCareAdapter } from './infrastructure/care-adapter.ts';
import { createRescheduleOperation } from './application/reschedule.ts';
import { createRescheduleAdapter } from './infrastructure/reschedule-adapter.ts';
import { BusinessError } from './domain/values.ts';
import { createConfirmReservation } from './application/confirm-reservation.ts';
import { createCancelReservation } from './application/cancel-reservation.ts';
import { createPostgresReservationAdapter } from './infrastructure/postgres-reservation-adapter.ts';
import { createReservationHandler } from './presentation/reservation-handler.ts';
export function createReservationService(
  verify: (token: string) => Promise<{ readonly userId: string }>,
) {
  const required = (name: string) => {
    const v = Deno.env.get(name);
    if (!v) throw Error('SERVER_CONFIGURATION_MISSING');
    return v;
  };
  const gateway = createPostgresReservationAdapter({
    baseUrl: required('SUPABASE_URL'),
    serviceKey:
      Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
      required('SUPABASE_SERVICE_ROLE_KEY'),
  });
  const confirm = createConfirmReservation(gateway),
    cancel = createCancelReservation(gateway);
  const rescheduleGateway = createRescheduleAdapter({
    baseUrl: required('SUPABASE_URL'),
    serviceKey:
      Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
      required('SUPABASE_SERVICE_ROLE_KEY'),
  });
  const reschedule = createRescheduleOperation(
    rescheduleGateway,
    rescheduleGateway,
  );
  return createReservationHandler({
    confirm,
    cancel,
    reschedule: reschedule?.reschedule,
    rescheduleSlots: reschedule?.slots,
    reschedulePolicy: reschedule?.policy,
    rescheduleHistory: reschedule?.history,
    care: createCareOperation(
      createCareAdapter(
        required('SUPABASE_URL'),
        Deno.env.get('BARBERIA_SERVICE_SECRET_KEY') ??
          required('SUPABASE_SERVICE_ROLE_KEY'),
      ),
    ),
    verifyActor: async (token) => {
      try {
        return await verify(token);
      } catch (e) {
        throw new BusinessError(
          e &&
            typeof e === 'object' &&
            'code' in e &&
            e.code === 'UNAUTHENTICATED'
            ? 'UNAUTHENTICATED'
            : 'DEPENDENCY_UNAVAILABLE',
        );
      }
    },
    allowedOrigins: (Deno.env.get('BARBERIA_ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    log: (event) => console.info(JSON.stringify(event)),
  });
}
