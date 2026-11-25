import {
  parseOperation,
  executeOperation,
} from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import { BusinessError } from '../../../supabase/functions/_shared/barbershop-operation/domain/values.ts';
const id = '11111111-1111-4111-8111-111111111111';
const ok = (value: unknown) => {
  if (!value) throw Error('Assertion');
};
Deno.test(
  'closed commands reject actor role tenant impersonation and invalid admin prices',
  () => {
    for (const command of [
      {
        action: 'invite-existing-user',
        barbershopId: id,
        email: 'test@example.invalid',
        role: 'administrator',
      },
      { action: 'accept-invitation', invitationId: id, userId: id },
      { action: 'unknown' },
      {
        action: 'upsert-service',
        barbershopId: id,
        name: 'Cut',
        description: '',
        price: { amountMinor: 1.5, currency: 'PEN' },
        durationMin: 30,
        active: true,
      },
    ]) {
      let denied = false;
      try {
        parseOperation(command);
      } catch (e) {
        denied = e instanceof BusinessError && e.code === 'INVALID_INPUT';
      }
      ok(denied);
    }
  },
);
Deno.test(
  'application passes only separately verified actor and typed command to the matching port',
  async () => {
    const calls: unknown[] = [];
    const gateway = {
      inviteExistingUser: (actor: unknown, shop: unknown, email: unknown) => {
        calls.push([actor, shop, email]);
        return Promise.resolve({
          id,
          barbershopId: id,
          role: 'barber',
          status: 'pending',
        });
      },
    };
    const result = await executeOperation(
      gateway as unknown as Parameters<typeof executeOperation>[0],
      { userId: id },
      {
        action: 'invite-existing-user',
        barbershopId: id,
        email: ' Test@Example.Invalid ',
      },
    );
    ok(
      JSON.stringify(calls) ===
        JSON.stringify([[{ userId: id }, id, 'test@example.invalid']]),
    );
    ok((result as { status: string }).status === 'pending');
  },
);
Deno.test(
  'invitation decisions cannot select their recipient or membership role',
  () => {
    const command = parseOperation({
      action: 'accept-invitation',
      invitationId: id,
    });
    ok(command.action === 'accept-invitation');
  },
);

Deno.test(
  'all approved actions use a concrete port and preserve verified actor independently of request data',
  async () => {
    const policy = {
      minimumNoticeMin: 0,
      bookingHorizonDays: 30,
      maxFuturePerClient: 5,
      slotStepMin: 15,
      bufferMin: 0,
      cancellationAdvanceMin: 120,
    };
    const cases: [Record<string, unknown>, string][] = [
      [
        {
          action: 'configure-shop',
          barbershopId: id,
          publicContact: 'Test',
          address: 'Local',
          policies: policy,
        },
        'configureShop',
      ],
      [
        { action: 'set-publication', barbershopId: id, state: 'paused' },
        'setPublication',
      ],
      [
        {
          action: 'upsert-service',
          id,
          barbershopId: id,
          name: 'Cut',
          description: '',
          price: { amountMinor: 0, currency: 'PEN' },
          durationMin: 30,
          active: true,
        },
        'upsertService',
      ],
      [
        {
          action: 'set-professional',
          id,
          barbershopId: id,
          userId: id,
          professionalName: 'Admin attends',
          active: true,
        },
        'setProfessional',
      ],
      [
        {
          action: 'set-capabilities',
          barbershopId: id,
          barberId: id,
          serviceIds: [id],
        },
        'setCapabilities',
      ],
      [
        {
          action: 'set-shop-hours',
          barbershopId: id,
          hours: [{ weekday: 1, opensMin: 540, closesMin: 1080 }],
        },
        'setShopHours',
      ],
      [
        {
          action: 'set-barber-hours',
          barbershopId: id,
          barberId: id,
          hours: [],
        },
        'setBarberHours',
      ],
      [
        {
          action: 'set-exception',
          barbershopId: id,
          barberId: null,
          startsAt: '2030-01-01T10:00:00.000Z',
          endsAt: '2030-01-01T11:00:00.000Z',
          reason: null,
        },
        'setException',
      ],
      [
        {
          action: 'invite-existing-user',
          barbershopId: id,
          email: 'Test@Example.Invalid',
        },
        'inviteExistingUser',
      ],
      [{ action: 'accept-invitation', invitationId: id }, 'respondInvitation'],
      [{ action: 'reject-invitation', invitationId: id }, 'respondInvitation'],
      [{ action: 'cancel-invitation', invitationId: id }, 'cancelInvitation'],
    ];
    for (const [command, method] of cases) {
      const calls: unknown[][] = [];
      const gateway = {
        [method]: (...args: unknown[]) => {
          calls.push(args);
          return Promise.resolve(method);
        },
      };
      const result = await executeOperation(
        gateway as unknown as Parameters<typeof executeOperation>[0],
        { userId: id },
        command,
      );
      ok(
        result === method &&
          calls.length === 1 &&
          (calls[0][0] as { userId: string }).userId === id,
      );
      ok(Object.isFrozen(parseOperation(command)));
    }
  },
);
Deno.test(
  'invalid values fail before a gateway call and typed conflict is preserved',
  async () => {
    const invalid: [unknown][] = [
      [null],
      [[]],
      [{ action: 'set-publication', barbershopId: id, state: 'unknown' }],
      [
        {
          action: 'set-shop-hours',
          barbershopId: id,
          hours: [{ weekday: 1, opensMin: 600, closesMin: 500 }],
        },
      ],
      [{ action: 'set-shop-hours', barbershopId: id, hours: 'bad' }],
      [
        {
          action: 'set-capabilities',
          barbershopId: id,
          barberId: id,
          serviceIds: [id, id],
        },
      ],
      [
        {
          action: 'set-capabilities',
          barbershopId: id,
          barberId: id,
          serviceIds: null,
        },
      ],
      [
        {
          action: 'invite-existing-user',
          barbershopId: 'bad',
          email: 'test@example.invalid',
        },
      ],
      [{ action: 'invite-existing-user', barbershopId: id, email: 'bad' }],
      [{ action: 'invite-existing-user', barbershopId: id, email: '' }],
      [
        {
          action: 'set-professional',
          barbershopId: id,
          userId: id,
          professionalName: 'Test',
          active: 'true',
        },
      ],
      [
        {
          action: 'upsert-service',
          barbershopId: id,
          name: 'Cut',
          description: 1,
          price: { amountMinor: 1, currency: 'PEN' },
          durationMin: 0,
          active: true,
        },
      ],
    ];
    for (const [input] of invalid) {
      let denied = false;
      try {
        parseOperation(input);
      } catch (e) {
        denied = e instanceof BusinessError;
      }
      ok(denied);
    }
    let conflict = false;
    try {
      await executeOperation(
        {
          setPublication: () => Promise.reject(new BusinessError('CONFLICT')),
        } as unknown as Parameters<typeof executeOperation>[0],
        { userId: id },
        { action: 'set-publication', barbershopId: id, state: 'paused' },
      );
    } catch (e) {
      conflict = e instanceof BusinessError && e.code === 'CONFLICT';
    }
    ok(conflict);
  },
);

Deno.test(
  'numeric limits and exception intervals are validated with immutable normalized values',
  () => {
    for (const durationMin of [0, -1, 1.5, '30', 2147483648]) {
      let denied = false;
      try {
        parseOperation({
          action: 'upsert-service',
          barbershopId: id,
          name: 'Cut',
          description: '',
          price: { amountMinor: 10, currency: 'PEN' },
          durationMin,
          active: true,
        });
      } catch (e) {
        denied = e instanceof BusinessError;
      }
      ok(denied);
    }
    const base = {
      action: 'set-exception',
      barbershopId: id,
      barberId: id,
      startsAt: '2030-01-01T10:00:00.000Z',
      endsAt: '2030-01-01T11:00:00.000Z',
      reason: ' Local closure ',
    };
    const valid = parseOperation(base);
    ok(valid.action === 'set-exception' && valid.reason === 'Local closure');
    for (const changes of [{ reason: 1 }, { endsAt: base.startsAt }]) {
      let denied = false;
      try {
        parseOperation({ ...base, ...changes });
      } catch (e) {
        denied = e instanceof BusinessError;
      }
      ok(denied);
    }
  },
);
