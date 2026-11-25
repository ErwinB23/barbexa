/* global Deno */
import assert from 'node:assert/strict';
import { createAdminInvitationService } from '../../../supabase/functions/_shared/barbershop-operation/application/admin-invitations.ts';
import {
  parseOperation,
  executeOperation,
} from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import { parseSelfSchedule } from '../../../supabase/functions/_shared/barbershop-operation/application/self-schedule.ts';
import { parseAuthorityCommand } from '../../../supabase/functions/_shared/barbershop-operation/domain/team-authority.ts';
import { createRescheduleOperation } from '../../../supabase/functions/_shared/reservations/application/reschedule.ts';
import {
  rescheduleInput,
  rescheduleQuery,
} from '../../../supabase/functions/_shared/reservations/domain/reschedule.ts';
import { BusinessError as ReservationError } from '../../../supabase/functions/_shared/reservations/domain/values.ts';
import { reservationInput } from '../../../supabase/functions/_shared/reservations/domain/reservation-input.ts';
import { BusinessError } from '../../../supabase/functions/_shared/barbershop-operation/domain/values.ts';
const id = '11111111-1111-4111-8111-111111111111',
  actor = { userId: id };
Deno.test(
  'mail claim and finish failures remain unknown while a retry never repeats an unclaimed delivery',
  async () => {
    const command = {
      action: 'invite-administrator',
      barbershopId: id,
      requestId: id,
      email: 'fixture@example.invalid',
    };
    for (const mode of [
      'claim-error',
      'finish-error',
      'send-error',
      'unclaimed',
    ]) {
      const repository = {
        createAdmin: async () => ({ id }),
        getAdmin: async () => ({ id }),
        claimMail: async () => {
          if (mode === 'claim-error') throw Error();
          return mode === 'unclaimed'
            ? { claimed: false, status: 'sent' }
            : { claimed: true, envelope: {} };
        },
        finishMail: async () => {
          if (mode === 'finish-error') throw Error();
        },
      };
      const service = createAdminInvitationService({
        repository,
        attemptId: () => id,
        mail: {
          send: async () => {
            if (mode === 'send-error') throw Error();
            return 'sent';
          },
        },
      });
      assert.equal(
        (await service(actor, command)).deliveryStatus,
        mode === 'unclaimed' ? 'sent' : 'unknown',
      );
    }
    const inApp = createAdminInvitationService({
      repository: {},
      attemptId: () => id,
      delivery: 'in-app',
    });
    await assert.rejects(
      inApp(actor, {
        action: 'retry-admin-invitation-email',
        invitationId: id,
      }),
      { code: 'NOT_AVAILABLE' },
    );
    const service = createAdminInvitationService({
      repository: {
        cancelAdmin: async () => {
          throw Error('private');
        },
      },
      attemptId: () => id,
      delivery: 'in-app',
    });
    await assert.rejects(
      service(actor, { action: 'cancel-admin-invitation', invitationId: id }),
      { code: 'DEPENDENCY_UNAVAILABLE' },
    );
  },
);
Deno.test(
  'operation extensions are explicitly activated and receive verified actor and closed commands',
  async () => {
    const cases = [
      [
        'shopClosures',
        { action: 'list-shop-closures', barbershopId: id, cursor: null },
      ],
      [
        'adminInvitations',
        { action: 'list-admin-invitations', barbershopId: null },
      ],
      [
        'ownSummary',
        {
          action: 'own-professional-summary',
          barbershopId: id,
          localDate: '2026-11-24',
        },
      ],
      [
        'professionalProfile',
        { action: 'get-own-professional-profile', barbershopId: id },
      ],
      ['teamAuthority', { action: 'read-team-authority', barbershopId: id }],
    ];
    for (const [key, input] of cases) {
      assert.equal(parseOperation(input).action, input.action);
      await assert.rejects(executeOperation({}, actor, input), {
        code: ['shopClosures', 'professionalProfile'].includes(key)
          ? 'NOT_AVAILABLE'
          : 'FORBIDDEN',
      });
      assert.equal(
        await executeOperation({}, actor, input, undefined, {
          [key]: async (a, c) => {
            assert.equal(a.userId, id);
            assert.equal(c.action, input.action);
            return key;
          },
        }),
        key,
      );
    }
    const get = { action: 'get-own-schedule', barbershopId: id };
    await assert.rejects(executeOperation({}, actor, get), {
      code: 'FORBIDDEN',
    });
    assert.equal(
      await executeOperation({}, actor, get, {
        getOwnSchedule: async () => true,
      }),
      true,
    );
    assert.equal(
      await executeOperation({ getOwnProfessional: async () => true }, actor, {
        action: 'get-own-professional',
        barbershopId: id,
      }),
      true,
    );
    assert.equal(
      await executeOperation(
        { updateOwnProfessional: async () => true },
        actor,
        {
          action: 'update-own-professional',
          barbershopId: id,
          professionalName: 'Fixture',
        },
      ),
      true,
    );
    const archive = {
      action: 'upsert-service',
      barbershopId: id,
      id,
      name: 'Cut',
      description: '',
      price: { amountMinor: 100, currency: 'PEN' },
      durationMin: 30,
      active: false,
      category: 'Barba',
      archived: true,
    };
    assert.equal(parseOperation(archive).archived, true);
    for (const patch of [
      { category: 'arbitrary' },
      { archived: false },
      { active: true },
      { id: undefined },
    ])
      assert.throws(() => parseOperation({ ...archive, ...patch }));
  },
);
Deno.test(
  'self schedule accepts sorted intervals across weekdays and rejects malformed versions or overlapping hours',
  () => {
    const base = {
      action: 'set-own-schedule',
      barbershopId: id,
      version: 1,
      hours: [],
    };
    assert.deepEqual(parseSelfSchedule(base).hours, []);
    const hours = [
      { weekday: 2, opensMin: 60, closesMin: 120 },
      { weekday: 1, opensMin: 60, closesMin: 120 },
      { weekday: 1, opensMin: 0, closesMin: 60 },
    ];
    assert.equal(parseSelfSchedule({ ...base, hours }).hours[0].opensMin, 0);
    for (const version of [null, 0, 0.5])
      assert.throws(() => parseSelfSchedule({ ...base, version }));
    for (const hours of [
      null,
      [null],
      [{ weekday: 0, opensMin: 0.5, closesMin: 1 }],
      [{ weekday: -1, opensMin: 0, closesMin: 1 }],
      [{ weekday: 7, opensMin: 0, closesMin: 1 }],
      [{ weekday: 0, opensMin: -1, closesMin: 1 }],
      [{ weekday: 0, opensMin: 1, closesMin: 1 }],
      [{ weekday: 0, opensMin: 0, closesMin: 1441 }],
      [
        { weekday: 0, opensMin: 0, closesMin: 60 },
        { weekday: 0, opensMin: 30, closesMin: 90 },
      ],
    ])
      assert.throws(() => parseSelfSchedule({ ...base, hours }));
    const block = {
      action: 'upsert-own-block',
      barbershopId: id,
      version: 1,
      block: {
        id,
        startsAt: '2026-11-24T00:00:00.000Z',
        endsAt: '2026-11-25T00:00:00.000Z',
        reason: '',
      },
    };
    assert.equal(parseSelfSchedule(block).block.reason, null);
    for (const patch of [{ endsAt: block.block.startsAt }, { reason: 1 }])
      assert.throws(() =>
        parseSelfSchedule({ ...block, block: { ...block.block, ...patch } }),
      );
    assert.throws(() => parseAuthorityCommand(null));
    assert.throws(() =>
      parseAuthorityCommand({
        action: 'bad',
        barbershopId: id,
        requestId: id,
        expectedVersion: 1,
      }),
    );
    const remove = {
      action: 'remove-secondary',
      barbershopId: id,
      requestId: id,
      expectedVersion: 1,
      memberUserId: id,
      disposition: 'inactive',
      reason: 'Reason',
    };
    assert.equal(parseAuthorityCommand(remove).disposition, 'inactive');
    for (const patch of [
      { barbershopId: 1 },
      { expectedVersion: 0 },
      { reason: 1 },
    ])
      assert.throws(() => parseAuthorityCommand({ ...remove, ...patch }));
  },
);
Deno.test(
  'reschedule management propagates safe errors, rejects missing extensions and preserves payment method input',
  async () => {
    const query = { barbershopId: id },
      history = { reservationId: id };
    const input = {
      requestId: id,
      reservationId: id,
      expectedStartsAt: '2026-11-24T00:00:00.000Z',
      startsAt: '2026-11-25T00:00:00.000Z',
    };
    const errors = [
      new ReservationError('FORBIDDEN'),
      new BusinessError('FORBIDDEN'),
      Error('private'),
    ];
    for (const failure of errors) {
      const reject = async () => {
        throw failure;
      };
      const app = createRescheduleOperation(
        { reschedule: reject, listRescheduleSlots: reject },
        {
          getReschedulePolicy: reject,
          setReschedulePolicy: reject,
          listRescheduleHistory: reject,
        },
      );
      for (const call of [
        () => app.policy(actor, query),
        () => app.policy(actor, { ...query, advanceMin: 0 }),
        () => app.history(actor, history),
        () => app.slots(actor, { reservationId: id, localDate: '2026-11-24' }),
        () => app.reschedule(actor, input),
      ])
        await assert.rejects(call(), {
          code:
            failure instanceof ReservationError
              ? 'FORBIDDEN'
              : 'DEPENDENCY_UNAVAILABLE',
        });
    }
    const noManagement = createRescheduleOperation({});
    await assert.rejects(noManagement.policy(actor, query));
    await assert.rejects(noManagement.history(actor, history));
    for (const reason of [1, 'x'.repeat(2001)])
      assert.throws(() => rescheduleInput({ ...input, reason }));
    for (const localDate of [1, 'bad', '2026-02-30', '9999-99-99'])
      assert.throws(() => rescheduleQuery({ reservationId: id, localDate }));
    const booking = {
      requestId: id,
      barbershopId: id,
      serviceIds: [id],
      barberId: null,
      startsAt: input.startsAt,
    };
    for (const paymentMethod of ['cash', 'yape'])
      assert.equal(
        reservationInput({ ...booking, paymentMethod }).paymentMethod,
        paymentMethod,
      );
    assert.throws(() =>
      reservationInput({ ...booking, paymentMethod: 'card' }),
    );
  },
);

Deno.test(
  'remaining dispatch and policy boundaries include owner transfer initiation and unchanged start rejection',
  async () => {
    const invite = {
      action: 'invite-administrator',
      barbershopId: id,
      requestId: id,
      email: 'fixture@example.invalid',
    };
    assert.equal(parseOperation(invite).action, invite.action);
    await assert.rejects(executeOperation({}, actor, invite), {
      code: 'FORBIDDEN',
    });
    assert.equal(
      await executeOperation({}, actor, invite, undefined, {
        adminInvitations: async () => true,
      }),
      true,
    );
    for (const input of [null, 3, { action: 'unknown' }])
      assert.throws(() => parseSelfSchedule(input));
    const initiate = {
      action: 'initiate-ownership-transfer',
      barbershopId: id,
      requestId: id,
      expectedVersion: 1,
      recipientUserId: id,
    };
    assert.equal(parseAuthorityCommand(initiate).recipientUserId, id);
    const base = {
      requestId: id,
      reservationId: id,
      expectedStartsAt: '2026-11-24T00:00:00.000Z',
      startsAt: '2026-11-25T00:00:00.000Z',
    };
    assert.throws(() =>
      rescheduleInput({ ...base, startsAt: base.expectedStartsAt }),
    );
    assert.equal(
      rescheduleInput({ ...base, reason: ' Reason ' }).reason,
      'Reason',
    );
    assert.equal('reason' in rescheduleInput({ ...base, reason: ' ' }), false);
  },
);
