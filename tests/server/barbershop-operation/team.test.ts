import { createAdminInvitationService } from '../../../supabase/functions/_shared/barbershop-operation/application/admin-invitations.ts';
import { createOwnSummaryService } from '../../../supabase/functions/_shared/barbershop-operation/application/own-summary.ts';
import {
  BusinessError,
  utcInstant,
} from '../../../supabase/functions/_shared/barbershop-operation/domain/values.ts';
import {
  parseOperation,
  executeOperation,
} from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import type { OperationGateway } from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import { createOperationHandler } from '../../../supabase/functions/_shared/barbershop-operation/presentation/operation-handler.ts';
const id = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222';
const invitation = {
  id,
  barbershopId: shop,
  barbershopName: 'Local',
  recipientName: 'Ficticio',
  role: 'administrator' as const,
  status: 'pending' as const,
  createdAt: utcInstant('2026-11-15T12:00:00.000Z'),
  expiresAt: utcInstant('2026-11-22T12:00:00.000Z'),
  deliveryStatus: 'pending' as const,
};
const unused = {
  getAdmin: async () => invitation,
  listAdmin: async () => [],
  respondAdmin: async () => invitation,
  cancelAdmin: async () => invitation,
};
const envelope = {
  invitationId: id,
  recipientEmail: 'test@example.invalid',
  barbershopName: 'Local',
  expiresAt: invitation.expiresAt,
};
Deno.test(
  'unknown notification cannot resend or create another invitation; incoming pending item remains available',
  async () => {
    const pending = { ...invitation, deliveryStatus: 'unknown' as const };
    let claims = 0;
    const forbidden = () => {
      throw Error('unexpected write or notification');
    };
    const app = createAdminInvitationService({
      attemptId: () => id,
      mail: { send: forbidden },
      repository: {
        ...unused,
        getAdmin: async () => pending,
        listAdmin: async () => [pending],
        createAdmin: forbidden,
        finishMail: forbidden,
        claimMail: async () => {
          claims++;
          return { claimed: false, status: 'unknown' };
        },
      },
    });
    const retry = await app(
      { userId: id },
      { action: 'retry-admin-invitation-email', invitationId: id },
    );
    if (
      Array.isArray(retry) ||
      !('deliveryStatus' in retry) ||
      retry.deliveryStatus !== 'unknown' ||
      claims !== 1
    )
      throw Error('unknown retry protection');
    const received = await app(
      { userId: id },
      { action: 'list-admin-invitations', barbershopId: null },
    );
    if (
      !Array.isArray(received) ||
      received.length !== 1 ||
      received[0].status !== 'pending' ||
      received[0].deliveryStatus !== 'unknown'
    )
      throw Error('pending inbox item unavailable');
  },
);
Deno.test(
  'historical accepted response passes through without creating, reactivating or notifying',
  async () => {
    let calls = 0;
    const forbidden = () => {
      throw Error('unexpected mutation or mail');
    };
    const app = createAdminInvitationService({
      attemptId: forbidden,
      mail: { send: forbidden },
      repository: {
        ...unused,
        createAdmin: forbidden,
        claimMail: forbidden,
        finishMail: forbidden,
        respondAdmin: async (actor, target, decision) => {
          if (actor.userId !== id || target !== id || decision !== 'accept')
            throw Error('actor');
          calls++;
          return { ...invitation, status: 'accepted' };
        },
      },
    });
    const result = await app(
      { userId: id },
      {
        action: 'respond-admin-invitation',
        invitationId: id,
        decision: 'accept',
      },
    );
    if (
      Array.isArray(result) ||
      !('status' in result) ||
      result.status !== 'accepted' ||
      calls !== 1
    )
      throw Error('historical response');
  },
);
Deno.test(
  'denied historical or pending response never retries acceptance or sends a notification',
  async () => {
    for (const code of ['FORBIDDEN', 'NOT_AVAILABLE', 'CONFLICT'] as const) {
      let calls = 0;
      const forbidden = () => {
        throw Error('unexpected mutation or mail');
      };
      const app = createAdminInvitationService({
        attemptId: forbidden,
        mail: { send: forbidden },
        repository: {
          ...unused,
          createAdmin: forbidden,
          claimMail: forbidden,
          finishMail: forbidden,
          respondAdmin: async () => {
            calls++;
            throw new BusinessError(code);
          },
        },
      });
      try {
        await app(
          { userId: id },
          {
            action: 'respond-admin-invitation',
            invitationId: id,
            decision: 'accept',
          },
        );
        throw Error('unexpected success');
      } catch (e) {
        if (!(e instanceof BusinessError) || e.code !== code || calls !== 1)
          throw e;
      }
    }
  },
);
Deno.test(
  'private team handler keeps JWT and Origin boundaries and forbids response caching',
  async () => {
    let calls = 0;
    const handler = createOperationHandler({
      verifyActor: async (token) => {
        if (token !== 'fixture') throw new BusinessError('UNAUTHENTICATED');
        return { userId: id };
      },
      execute: async (actor) => {
        if (actor.userId !== id) throw Error('actor');
        calls++;
        return [];
      },
      allowedOrigins: ['http://localhost:8081'],
    });
    const request = (headers: Record<string, string>) =>
      new Request('http://local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          action: 'list-admin-invitations',
          barbershopId: null,
        }),
      });
    if (
      (await handler(request({}))).status !== 401 ||
      (await handler(request({ Authorization: 'Bearer invalid-fixture' })))
        .status !== 401
    )
      throw Error('JWT boundary');
    if (
      (
        await handler(
          request({
            Authorization: 'Bearer fixture',
            Origin: 'http://untrusted.local',
          }),
        )
      ).status !== 403
    )
      throw Error('Origin');
    const response = await handler(
      request({ Authorization: 'Bearer fixture' }),
    );
    if (
      response.status !== 200 ||
      response.headers.get('Cache-Control') !== 'no-store' ||
      calls !== 1
    )
      throw Error('private cache');
  },
);
Deno.test(
  'team extensions remain closed until explicitly configured and route the verified actor separately',
  async () => {
    const command = parseOperation({
      action: 'list-admin-invitations',
      barbershopId: null,
    });
    let denied = false;
    try {
      await executeOperation({} as OperationGateway, { userId: id }, command);
    } catch (e) {
      denied = e instanceof BusinessError && e.code === 'FORBIDDEN';
    }
    if (!denied) throw Error('unconfigured extension');
    let calls = 0;
    await executeOperation(
      {} as OperationGateway,
      { userId: id },
      command,
      undefined,
      {
        adminInvitations: async (actor) => {
          if (actor.userId !== id) throw Error('actor');
          calls++;
          return [];
        },
      },
    );
    if (calls !== 1) throw Error('dispatch');
  },
);
Deno.test(
  'administrator service commits first, claims one delivery and never returns recipient email',
  async () => {
    const order: string[] = [];
    let claimed = false,
      sends = 0;
    const app = createAdminInvitationService({
      attemptId: () => id,
      repository: {
        ...unused,
        createAdmin: async (actor) => {
          if (actor.userId !== id) throw Error('actor');
          order.push('commit');
          return invitation;
        },
        claimMail: async () => {
          if (claimed) return { claimed: false, status: 'sent' };
          claimed = true;
          order.push('claim');
          return { claimed: true, envelope };
        },
        finishMail: async () => {
          order.push('record');
        },
      },
      mail: {
        send: async () => {
          order.push('send');
          sends++;
          return 'sent';
        },
      },
    });
    const command = {
      action: 'invite-administrator',
      requestId: id,
      barbershopId: shop,
      email: 'test@example.invalid',
    };
    const result = await app({ userId: id }, command);
    await app({ userId: id }, command);
    if (
      sends !== 1 ||
      order.join(',') !== 'commit,claim,send,record,commit' ||
      JSON.stringify(result).includes('recipientEmail')
    )
      throw Error('delivery boundary');
  },
);
Deno.test(
  'mail failure preserves committed invitation and records uncertainty without leaking transport diagnostics',
  async () => {
    let result = '';
    const app = createAdminInvitationService({
      attemptId: () => id,
      repository: {
        ...unused,
        createAdmin: async () => invitation,
        claimMail: async () => ({ claimed: true, envelope }),
        finishMail: async (_a, _i, _c, status) => {
          result = status;
        },
      },
      mail: {
        send: async () => {
          throw Error('private SMTP secret');
        },
      },
    });
    const value = await app(
      { userId: id },
      {
        action: 'invite-administrator',
        requestId: id,
        barbershopId: shop,
        email: 'test@example.invalid',
      },
    );
    if (
      result !== 'unknown' ||
      !('deliveryStatus' in value) ||
      value.deliveryStatus !== 'unknown'
    )
      throw Error('uncertain outcome');
  },
);
Deno.test(
  'summary service accepts verified identity only and never accepts caller professional or role',
  async () => {
    let count = 0;
    const service = createOwnSummaryService({
      getOwnSummary: async (actor, q) => {
        if (actor.userId !== id || q.barbershopId !== shop)
          throw Error('actor');
        count++;
        return {} as never;
      },
    });
    await service(
      { userId: id },
      {
        action: 'own-professional-summary',
        barbershopId: shop,
        localDate: '2026-11-16',
      },
    );
    for (const [actor, input] of [
      [
        null,
        {
          action: 'own-professional-summary',
          barbershopId: shop,
          localDate: '2026-11-16',
        },
      ],
      [
        { userId: id },
        {
          action: 'own-professional-summary',
          barbershopId: shop,
          localDate: '2026-11-16',
          userId: shop,
        },
      ],
    ]) {
      let denied = false;
      try {
        await service(actor, input);
      } catch (e) {
        denied = e instanceof BusinessError;
      }
      if (!denied) throw Error('forgery accepted');
    }
    if (count !== 1) throw Error('unexpected invocation');
  },
);

Deno.test(
  'in-app administration creates the invitation without claiming mail and rejects mail retries',
  async () => {
    let creates = 0;
    const unexpected = async () => {
      throw Error('mail must not be touched');
    };
    const app = createAdminInvitationService({
      delivery: 'in-app',
      attemptId: () => id,
      repository: {
        ...unused,
        createAdmin: async () => {
          creates++;
          return invitation;
        },
        claimMail: unexpected,
        finishMail: unexpected,
      },
    });
    const result = await app(
      { userId: id },
      {
        action: 'invite-administrator',
        requestId: id,
        barbershopId: shop,
        email: 'test@example.invalid',
      },
    );
    if (
      Array.isArray(result) ||
      !('id' in result) ||
      result.id !== id ||
      creates !== 1
    )
      throw Error('invitation missing');
    let denied = false;
    try {
      await app(
        { userId: id },
        { action: 'retry-admin-invitation-email', invitationId: id },
      );
    } catch (e) {
      denied = e instanceof BusinessError && e.code === 'NOT_AVAILABLE';
    }
    if (!denied) throw Error('mail retry allowed');
  },
);
