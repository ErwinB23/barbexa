import { createTeamPersistence } from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/team-postgres-adapter.ts';
const actor = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222',
  id = '33333333-3333-4333-8333-333333333333';
Deno.test(
  'team persistence closes RPC destination, derives actor separately and keeps envelope off public projection',
  async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const row = {
      id,
      barbershopId: shop,
      barbershopName: 'Local',
      recipientName: 'Ficticio',
      role: 'administrator',
      status: 'pending',
      createdAt: '2026-11-15T12:00:00.000Z',
      expiresAt: '2026-11-22T12:00:00.000Z',
      deliveryStatus: 'pending',
    };
    const gateway = createTeamPersistence({
      baseUrl: 'http://local',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url, init) => {
        const body = JSON.parse(String(init?.body));
        calls.push({ url: String(url), body });
        return Response.json(
          String(url).endsWith('admin_invitation_claim_mail')
            ? {
                claimed: true,
                envelope: {
                  invitationId: id,
                  recipientEmail: 'test@example.invalid',
                  barbershopName: 'Local',
                  expiresAt: row.expiresAt,
                },
              }
            : row,
        );
      },
    });
    const value = await gateway.createAdmin(
      { userId: actor },
      { requestId: id, barbershopId: shop, email: 'test@example.invalid' },
    );
    if (
      value.role !== 'administrator' ||
      calls[0].body.p_actor_id !== actor ||
      !calls[0].url.endsWith('/rpc/admin_invitation_create')
    )
      throw Error('RPC');
    const claim = await gateway.claimMail({ userId: actor }, id, id);
    if (!claim.claimed || claim.envelope.invitationId !== id)
      throw Error('claim');
  },
);
