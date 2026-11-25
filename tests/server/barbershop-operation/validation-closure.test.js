/* global Deno */
import assert from 'node:assert/strict';
import { parseAdminInvitation } from '../../../supabase/functions/_shared/barbershop-operation/domain/admin-invitations.ts';
import {
  teamActor,
  teamDay,
  teamRecord,
} from '../../../supabase/functions/_shared/barbershop-operation/domain/team-input.ts';
import { ownSummaryQuery } from '../../../supabase/functions/_shared/barbershop-operation/domain/own-summary.ts';
import { createOwnSummaryService } from '../../../supabase/functions/_shared/barbershop-operation/application/own-summary.ts';
import {
  profileDraft,
  profileCommand,
  professionalProfile,
} from '../../../supabase/functions/_shared/barbershop-operation/domain/professional-profile.ts';
import {
  parseShopClosure,
  decodeShopClosure,
  decodeClosurePage,
  decodeClosureWithdrawal,
} from '../../../supabase/functions/_shared/barbershop-operation/domain/shop-closure.ts';
import { BusinessError } from '../../../supabase/functions/_shared/barbershop-operation/domain/values.ts';
const id = (n) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
Deno.test(
  'administrative command variants reject injected roles, malformed email and unknown actions',
  () => {
    for (const raw of [null, [], {}, { action: 'unknown' }])
      assert.throws(() => parseAdminInvitation(raw));
    const base = {
      action: 'invite-administrator',
      barbershopId: id(1),
      requestId: id(2),
      email: ' Fixture@Example.Invalid ',
    };
    assert.equal(parseAdminInvitation(base).email, 'fixture@example.invalid');
    for (const email of [1, 'x'.repeat(255), 'bad', 'a@b.invalid\n'])
      assert.throws(() => parseAdminInvitation({ ...base, email }));
    for (const barbershopId of [null, id(1)])
      assert.equal(
        parseAdminInvitation({ action: 'list-admin-invitations', barbershopId })
          .barbershopId,
        barbershopId,
      );
    for (const decision of ['accept', 'reject'])
      assert.equal(
        parseAdminInvitation({
          action: 'respond-admin-invitation',
          invitationId: id(1),
          decision,
        }).decision,
        decision,
      );
    assert.throws(() =>
      parseAdminInvitation({
        action: 'respond-admin-invitation',
        invitationId: id(1),
        decision: 'promote',
      }),
    );
    for (const action of [
      'cancel-admin-invitation',
      'retry-admin-invitation-email',
    ])
      assert.equal(
        parseAdminInvitation({ action, invitationId: id(1) }).action,
        action,
      );
  },
);
Deno.test(
  'actor and calendar contracts deny malformed records and normalized impossible dates',
  async () => {
    assert.equal(teamActor({ userId: id(1) }).userId, id(1));
    for (const value of [
      null,
      [],
      {},
      { userId: 1 },
      { userId: id(1), role: 'owner' },
    ])
      assert.throws(() => teamActor(value), { code: 'UNAUTHENTICATED' });
    for (const value of [null, 3, 'x', '2026-02-30', '9999-99-99'])
      assert.throws(() => teamDay(value));
    assert.equal(teamDay('2024-02-29'), '2024-02-29');
    assert.deepEqual(teamRecord({ x: 1, y: 2 }, ['x'], ['y']), { x: 1, y: 2 });
    assert.throws(() =>
      ownSummaryQuery({
        action: 'wrong',
        barbershopId: id(1),
        localDate: '2026-11-24',
      }),
    );
    const input = {
      action: 'own-professional-summary',
      barbershopId: id(1),
      localDate: '2026-11-24',
    };
    for (const failure of [new BusinessError('FORBIDDEN'), Error('private')]) {
      const read = createOwnSummaryService({
        getOwnSummary: async () => {
          throw failure;
        },
      });
      await assert.rejects(read({ userId: id(1) }, input), {
        code:
          failure instanceof BusinessError
            ? 'FORBIDDEN'
            : 'DEPENDENCY_UNAVAILABLE',
      });
    }
  },
);
Deno.test(
  'professional projection and social contracts reject wrong types, hostile hosts and invalid membership dates',
  () => {
    const draft = {
      professionalName: ' Real ',
      description: ' ',
      instagram: null,
      tiktok: null,
      facebook: null,
    };
    const row = {
      ...draft,
      id: id(1),
      userId: id(2),
      barbershopId: id(3),
      active: true,
      barbershopName: 'Local',
      memberSince: null,
    };
    assert.equal(
      professionalProfile({ ...row, memberSince: '2026-11-24T00:00:00.000Z' })
        .active,
      true,
    );
    for (const patch of [
      { active: false },
      { barbershopName: 1 },
      { barbershopName: '' },
      { memberSince: 'wrong' },
    ])
      assert.throws(() => professionalProfile({ ...row, ...patch }));
    for (const key of ['instagram', 'tiktok', 'facebook']) {
      for (const value of [
        null,
        '',
        ' ',
        '@real',
        key === 'instagram'
          ? 'https://instagram.com/real'
          : key === 'facebook'
            ? 'https://m.facebook.com/real'
            : 'https://vt.tiktok.com/real',
      ])
        profileDraft({ ...draft, [key]: value });
      for (const value of [
        3,
        'x'.repeat(251),
        'javascript:alert(1)',
        '<script>',
        'https://evil.invalid/x',
      ])
        assert.throws(() => profileDraft({ ...draft, [key]: value }));
    }
    for (const patch of [
      { professionalName: 1 },
      { professionalName: '' },
      { description: 3 },
      { description: 'x'.repeat(251) },
      { injected: true },
    ])
      assert.throws(() => profileDraft({ ...draft, ...patch }));
    assert.equal(
      profileCommand({
        action: 'get-own-professional-profile',
        barbershopId: id(3),
      }).barbershopId,
      id(3),
    );
    assert.equal(
      profileCommand({
        action: 'update-own-professional-profile',
        barbershopId: id(3),
        profile: draft,
      }).profile.professionalName,
      'Real',
    );
    assert.throws(() =>
      profileCommand({ action: 'wrong', barbershopId: id(3), profile: draft }),
    );
  },
);
Deno.test(
  'closure projections enforce interval, withdrawal audit and page cursor consistency',
  () => {
    const base = {
      id: id(1),
      barbershopId: id(2),
      startsAt: '2026-11-24T10:00:00.000Z',
      endsAt: '2026-11-24T11:00:00.000Z',
      reason: null,
      status: 'active',
      withdrawal: null,
    };
    const withdrawal = {
      eventId: id(3),
      actorUserId: id(4),
      occurredAt: base.endsAt,
      reason: 'Reason',
    };
    const withdrawn = {
      ...base,
      status: 'withdrawn',
      reason: 'Closure',
      withdrawal,
    };
    assert.equal(decodeShopClosure(base, id(2)).status, 'active');
    assert.equal(
      decodeClosureWithdrawal(
        { closure: withdrawn, replayed: false },
        id(2),
        id(1),
      ).replayed,
      false,
    );
    for (const patch of [
      { id: 1 },
      { barbershopId: id(9) },
      { startsAt: 'bad' },
      { endsAt: 3 },
      { endsAt: base.startsAt },
      { reason: 1 },
      { status: 'unknown' },
      { status: 'withdrawn', withdrawal: null },
    ])
      assert.throws(() => decodeShopClosure({ ...base, ...patch }, id(2)));
    for (const patch of [
      { eventId: 3 },
      { actorUserId: 'bad' },
      { occurredAt: 'bad' },
      { reason: 3 },
      { reason: '' },
      { reason: 'x'.repeat(2001) },
    ])
      assert.throws(() =>
        decodeShopClosure(
          { ...withdrawn, withdrawal: { ...withdrawal, ...patch } },
          id(2),
        ),
      );
    for (const raw of [
      null,
      { closure: withdrawn, replayed: 1 },
      { closure: base, replayed: true },
      { closure: withdrawn, replayed: true },
    ]) {
      if (raw?.closure === withdrawn && raw.replayed === true)
        assert.throws(() => decodeClosureWithdrawal(raw, id(2), id(9)));
      else assert.throws(() => decodeClosureWithdrawal(raw, id(2), id(1)));
    }
    const page = { barbershopId: id(2), closures: [base], nextCursor: null };
    assert.equal(decodeClosurePage(page, id(2)).closures.length, 1);
    for (const patch of [
      { barbershopId: id(9) },
      { closures: {} },
      { closures: Array(101).fill(base) },
      { nextCursor: 'bad' },
      { closures: [base, base] },
      { nextCursor: id(1) },
    ])
      assert.throws(() => decodeClosurePage({ ...page, ...patch }, id(2)));
    const rows = Array.from({ length: 100 }, (_, i) => ({
      ...base,
      id: id(i + 10),
    }));
    assert.equal(
      decodeClosurePage(
        { ...page, closures: rows, nextCursor: rows.at(-1).id },
        id(2),
      ).closures.length,
      100,
    );
    assert.throws(() =>
      decodeClosurePage(
        { ...page, closures: rows, nextCursor: id(999) },
        id(2),
      ),
    );
    const list = {
      action: 'list-shop-closures',
      barbershopId: id(2),
      cursor: null,
    };
    for (const cursor of [null, id(1)])
      assert.equal(parseShopClosure({ ...list, cursor }).cursor, cursor);
    for (const raw of [
      null,
      [],
      { ...list, barbershopId: 3 },
      { ...list, x: 1 },
      { ...list, cursor: 3 },
    ])
      assert.throws(() => parseShopClosure(raw));
    const input = {
      action: 'withdraw-shop-closure',
      barbershopId: id(2),
      closureId: id(1),
      requestId: id(3),
      reason: 'Reason',
    };
    assert.equal(parseShopClosure(input).closureId, id(1));
    for (const patch of [
      { action: 'bad' },
      { closureId: 3 },
      { requestId: 'bad' },
      { reason: 3 },
      { reason: '' },
      { reason: 'x'.repeat(2001) },
    ])
      assert.throws(() => parseShopClosure({ ...input, ...patch }));
  },
);
