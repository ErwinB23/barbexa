import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createCoreLoader } from '../integration/booking/load-core.mjs';
function load(file) {
  if (!fs.existsSync(file)) file += '.ts';
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) => load(path.resolve(path.dirname(file), n)),
    module,
    module.exports,
  );
  return module.exports;
}
const root = path.resolve('src/features/barbershop-operation');
const user = '11111111-1111-4111-8111-111111111111',
  shop = '22222222-2222-4222-8222-222222222222';
const draft = {
  professionalName: ' Nombre real ',
  description: 'Experiencia real',
  instagram: '@barbero',
  tiktok: null,
  facebook: 'https://www.facebook.com/barbero',
};
const profile = {
  id: user,
  userId: user,
  barbershopId: shop,
  active: true,
  ...draft,
  professionalName: 'Nombre real',
  barbershopName: 'Barbería real',
  memberSince: null,
};
test('expanded client profile uses verified HTTP transport and reloads full saved response', async () => {
  const core = createCoreLoader();
  const { createOperationHttpAdapter } = core(
    'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  );
  const { createProfessionalProfile } = core(
    'src/features/barbershop-operation/application/professional-profile.ts',
  );
  let stored = profile;
  const sent = [];
  const gateway = createOperationHttpAdapter({
    baseUrl: 'https://fixture.invalid',
    publicKey: 'sb_publishable_fixture',
    expectedUser: () => user,
    getAccessToken: async () => 'synthetic',
    fetcher: async (url, init) => {
      if (url.endsWith('/auth/v1/user'))
        return new Response(
          JSON.stringify({
            id: user,
            is_anonymous: false,
            email_confirmed_at: '2026-11-23T12:00:00Z',
          }),
        );
      const command = JSON.parse(init.body);
      sent.push(command);
      if (command.profile) stored = { ...stored, ...command.profile };
      return new Response(JSON.stringify(stored));
    },
  });
  const app = createProfessionalProfile({
    gateway,
    scope: () => ({
      userId: user,
      generation: 1,
      barbershopId: shop,
      role: 'barber',
    }),
  });
  await app.save({ ...draft, description: 'Guardada desde formulario' });
  assert.equal((await app.read()).description, 'Guardada desde formulario');
  assert.equal(
    Object.keys(sent[0]).sort().join(','),
    'action,barbershopId,profile',
  );
  assert.equal(Object.keys(sent[1]).sort().join(','), 'action,barbershopId');
});
test('expanded profile validates closed payloads, exact description limit and safe optional social values', () => {
  const { profileDraft, profileCommand } = load(
    path.join(root, 'domain/professional-profile.ts'),
  );
  assert.equal(profileDraft(draft).professionalName, 'Nombre real');
  assert.equal(profileDraft({ ...draft, instagram: ' ' }).instagram, null);
  assert.equal(
    profileDraft({ ...draft, description: '🙂'.repeat(250) }).description
      .length,
    500,
  );
  for (const invalid of [
    { ...draft, description: 'x'.repeat(251) },
    { ...draft, tiktok: 'javascript:alert(1)' },
    { ...draft, instagram: 'https://evil.invalid/user' },
    { ...draft, facebook: 'https://facebook.com.evil.invalid/user' },
    { ...draft, active: true },
  ])
    assert.throws(() => profileDraft(invalid));
  assert.throws(() =>
    profileCommand({
      action: 'update-own-professional-profile',
      barbershopId: shop,
      profile: draft,
      userId: user,
    }),
  );
});
test('profile application keeps tenant and actor isolation, atomic draft payload and ignores late context results', async () => {
  const { createProfessionalProfile } = load(
    path.join(root, 'application/professional-profile.ts'),
  );
  let scope = {
      userId: user,
      generation: 1,
      barbershopId: shop,
      role: 'barber',
    },
    command,
    complete;
  const app = createProfessionalProfile({
    scope: () => scope,
    gateway: {
      executeProfessionalProfile: async (c) => {
        command = c;
        return profile;
      },
    },
  });
  assert.equal((await app.read()).professionalName, 'Nombre real');
  await app.save(draft);
  assert.equal(command.profile.description, 'Experiencia real');
  assert.equal(
    Object.keys(command).sort().join(','),
    'action,barbershopId,profile',
  );
  const delayed = createProfessionalProfile({
    scope: () => scope,
    gateway: {
      executeProfessionalProfile: () => new Promise((r) => (complete = r)),
    },
  });
  const pending = delayed.read();
  scope = { ...scope, generation: 2 };
  complete(profile);
  await assert.rejects(pending);
  const foreign = createProfessionalProfile({
    scope: () => scope,
    gateway: {
      executeProfessionalProfile: async () => ({ ...profile, userId: shop }),
    },
  });
  await assert.rejects(() => foreign.read());
});
