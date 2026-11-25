import { parseOperation } from '../../../supabase/functions/_shared/barbershop-operation/application/operation.ts';
import { executeProfessionalProfile } from '../../../supabase/functions/_shared/barbershop-operation/application/professional-profile.ts';
import { createPostgresOperationAdapter } from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/postgres-operation-adapter.ts';
const user = '11111111-1111-4111-8111-111111111111';
const shop = '22222222-2222-4222-8222-222222222222';
const draft = {
  professionalName: 'Real',
  description: 'Experiencia',
  instagram: '@real',
  tiktok: null,
  facebook: null,
};
const result = {
  id: user,
  userId: user,
  barbershopId: shop,
  active: true,
  ...draft,
  barbershopName: 'Local real',
  memberSince: null,
};
const check = (v: unknown) => {
  if (!v) throw Error('Assertion failed');
};
async function rejects(action: () => unknown) {
  let rejected = false;
  try {
    await action();
  } catch {
    rejected = true;
  }
  check(rejected);
}
Deno.test(
  'expanded own profile rejects forged identity, invalid social hosts and oversized description',
  async () => {
    const command = {
      action: 'update-own-professional-profile',
      barbershopId: shop,
      profile: draft,
    };
    check(parseOperation(command).action === command.action);
    for (const extra of [
      { userId: user },
      { barberId: user },
      { active: true },
      { role: 'administrator' },
    ])
      await rejects(() => parseOperation({ ...command, ...extra }));
    for (const profile of [
      { ...draft, description: 'x'.repeat(251) },
      { ...draft, instagram: 'https://instagram.com.evil.invalid/x' },
      { ...draft, tiktok: 'javascript:alert(1)' },
    ])
      await rejects(() => parseOperation({ ...command, profile }));
  },
);
Deno.test(
  'expanded profile dispatches exact RPC with independently verified actor and validates returned tenant',
  async () => {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    let stored = result;
    const gateway = createPostgresOperationAdapter({
      baseUrl: 'https://fixture.invalid',
      serviceKey: 'sb_secret_fixture',
      fetcher: async (url, init) => {
        const body = JSON.parse(String(init?.body));
        calls.push({ url: String(url), body });
        if (body.p_data.profile) stored = { ...stored, ...body.p_data.profile };
        return new Response(JSON.stringify(stored), { status: 200 });
      },
    });
    const updated = await executeProfessionalProfile(
      gateway,
      { userId: user },
      {
        action: 'update-own-professional-profile',
        barbershopId: shop,
        profile: { ...draft, description: 'Guardada' },
      },
    );
    check(updated.description === 'Guardada');
    check(
      calls[0].url.endsWith('/rpc/update_own_professional_profile_details'),
    );
    check(calls[0].body.p_actor_id === user);
    check(
      Object.keys(calls[0].body.p_data as object)
        .sort()
        .join(',') === 'barbershopId,profile',
    );
    const read = await executeProfessionalProfile(
      gateway,
      { userId: user },
      { action: 'get-own-professional-profile', barbershopId: shop },
    );
    check(read.description === 'Guardada');
    check(calls[1].url.endsWith('/rpc/get_own_professional_profile_details'));
    check(
      Object.keys(calls[1].body.p_data as object).join(',') === 'barbershopId',
    );
    for (const foreign of [
      { ...result, userId: shop },
      { ...result, barbershopId: user },
      { ...result, active: false },
    ])
      await rejects(() =>
        executeProfessionalProfile(
          { executeProfessionalProfile: async () => foreign },
          { userId: user },
          { action: 'get-own-professional-profile', barbershopId: shop },
        ),
      );
  },
);
