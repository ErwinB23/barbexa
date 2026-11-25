import { createCancelReservation } from '../../../supabase/functions/_shared/reservations/application/cancel-reservation.ts';
import { cancellationInput } from '../../../supabase/functions/_shared/reservations/domain/cancellation.ts';
import { BusinessError } from '../../../supabase/functions/_shared/reservations/domain/values.ts';
import type { BookingDetail } from '../../../supabase/functions/_shared/reservations/domain/types.ts';
const id = '11111111-1111-4111-8111-111111111111';
Deno.test(
  'cancel domain closes actor and policy fields; optional reason is normalized',
  () => {
    for (const value of [
      null,
      [],
      {},
      1,
      { requestId: id, reservationId: id, role: 'administrator' },
      { requestId: id, reservationId: id, reason: 1 },
      { requestId: 'bad', reservationId: id },
    ]) {
      let rejected = false;
      try {
        cancellationInput(value);
      } catch {
        rejected = true;
      }
      if (!rejected) throw Error('invalid cancellation accepted');
    }
    if (
      cancellationInput({
        requestId: id,
        reservationId: id,
        reason: '  reason  ',
      }).reason !== 'reason'
    )
      throw Error('reason not normalized');
    if (
      cancellationInput({ requestId: id, reservationId: id, reason: '  ' })
        .reason !== undefined
    )
      throw Error('empty reason not omitted');
  },
);
Deno.test(
  'cancel server requires verified actor and safely propagates port errors',
  async () => {
    const value = { requestId: id, reservationId: id },
      detail = {} as BookingDetail;
    const app = createCancelReservation({
      cancel: async (actor) => {
        if (actor.userId !== id) throw Error('actor');
        return detail;
      },
    });
    if ((await app({ userId: id }, value)) !== detail) throw Error('result');
    let rejected = false;
    try {
      await app(null, value);
    } catch {
      rejected = true;
    }
    if (!rejected) throw Error('missing actor');
    for (const error of [
      new BusinessError('FORBIDDEN'),
      Error('private provider detail'),
    ]) {
      const failing = createCancelReservation({
        cancel: async () => {
          throw error;
        },
      });
      try {
        await failing({ userId: id }, value);
        throw Error('missing rejection');
      } catch (e) {
        if (
          !(e instanceof BusinessError) ||
          e.code !==
            (error instanceof BusinessError
              ? 'FORBIDDEN'
              : 'DEPENDENCY_UNAVAILABLE')
        )
          throw Error('unsafe translation');
      }
    }
  },
);
