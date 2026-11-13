import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const helpers = () => import('./fixtures.mjs');
const good = {
  url: 'http://127.0.0.1:54421',
  projectId: 'app-barberia-002-local',
};
test('local loopback and separate project accepted', async () => {
  const { assertLocalTarget } = await helpers();
  assert.equal(assertLocalTarget(good).origin, good.url);
});
for (const url of [
  'https://example.com',
  'http://localhost.evil:54421',
  'http://127.0.0.1:54321',
  'http://user:pass@127.0.0.1:54421',
  'http://127.0.0.1:54421/path',
  'http://127.0.0.1:54421/?key=x',
]) {
  test('reject unsafe target ' + url, async () => {
    const { assertLocalTarget } = await helpers();
    assert.throws(() => assertLocalTarget({ ...good, url }));
  });
}
test('reject old or missing identity', async () => {
  const { assertLocalTarget } = await helpers();
  for (const projectId of ['barberia-app', '', undefined])
    assert.throws(() => assertLocalTarget({ ...good, projectId }));
});
test('secret never enters public composition settings', async () => {
  const { publicSettings } = await helpers();
  assert.throws(() =>
    publicSettings({
      ...good,
      publicKey: 'sb_secret_private',
      accessToken: 'user',
    }),
  );
  assert.throws(() =>
    publicSettings({
      ...good,
      publicKey: 'sb_publishable_test',
      accessToken: 'user',
      serviceKey: 'private',
    }),
  );
  const settings = publicSettings({
    ...good,
    publicKey: 'sb_publishable_test',
    accessToken: 'user',
  });
  assert.equal(settings.accessToken, 'user');
});
test('legacy service key rejected', async () => {
  const { publicSettings } = await helpers();
  const key =
    'a.' +
    Buffer.from(JSON.stringify({ role: 'service_role' })).toString(
      'base64url',
    ) +
    '.b';
  assert.throws(() =>
    publicSettings({ ...good, publicKey: key, accessToken: 'user' }),
  );
});
test('service credential cannot be used as user token', async () => {
  const { publicSettings } = await helpers();
  const token =
    'a.' +
    Buffer.from(JSON.stringify({ role: 'service_role' })).toString(
      'base64url',
    ) +
    '.b';
  for (const accessToken of [token, 'sb_secret_private'])
    assert.throws(() =>
      publicSettings({
        ...good,
        publicKey: 'sb_publishable_test',
        accessToken,
      }),
    );
});
test('fixture credentials random and never logged', async () => {
  const { fixtureCredentials } = await helpers();
  const a = fixtureCredentials(),
    b = fixtureCredentials();
  assert.notEqual(a.password, b.password);
  assert.ok(a.password.length >= 32);
  assert.match(a.email, /@example\.invalid$/);
});
test('owned cleanup and refusal of foreign directory', async () => {
  const { createOwnedDirectory, removeOwnedDirectory } = await helpers();
  assert.throws(() => removeOwnedDirectory(process.cwd()));
  const d = createOwnedDirectory();
  fs.writeFileSync(path.join(d, 'output'), 'fixture');
  removeOwnedDirectory(d);
  assert.equal(fs.existsSync(d), false);
});
test('cleanup refuses altered ownership marker', async () => {
  const { createOwnedDirectory, removeOwnedDirectory } = await helpers();
  const d = createOwnedDirectory(),
    marker = path.join(d, '.barberia-owner'),
    original = fs.readFileSync(marker);
  fs.writeFileSync(marker, 'foreign');
  assert.throws(() => removeOwnedDirectory(d));
  fs.writeFileSync(marker, original);
  removeOwnedDirectory(d);
});
test('cleanup refuses nested junction without following it', async () => {
  const { createOwnedDirectory, removeOwnedDirectory } = await helpers();
  const d = createOwnedDirectory(),
    target = createOwnedDirectory(),
    link = path.join(d, 'link');
  try {
    fs.symlinkSync(target, link, 'junction');
    assert.throws(() => removeOwnedDirectory(d), /LINK/);
    assert.ok(fs.existsSync(target));
  } finally {
    if (fs.existsSync(link)) fs.unlinkSync(link);
    removeOwnedDirectory(d);
    removeOwnedDirectory(target);
  }
});
test('subprocess failure and timeout stop without exposing stdout', async () => {
  const { runChecked } = await helpers();
  assert.throws(
    () =>
      runChecked(process.execPath, [
        '-e',
        "console.log('PRIVATE_TOKEN');process.exit(3)",
      ]),
    (e) => !e.message.includes('PRIVATE_TOKEN'),
  );
  assert.throws(
    () =>
      runChecked(process.execPath, ['-e', 'setTimeout(()=>{},10000)'], {
        timeout: 25,
      }),
    /TIMEOUT/,
  );
});
test('runner fails closed when backend does not exist', async () => {
  const { createOwnedDirectory, removeOwnedDirectory } = await helpers();
  const isolated = createOwnedDirectory();
  try {
    fs.mkdirSync(path.join(isolated, 'scripts'));
    // The real project now has all scenario files. Keep testing the missing-file
    // branch in an empty owned tree, without executing real backend scenarios.
    const source = fs
      .readFileSync('scripts/run-backend-integration.mjs', 'utf8')
      .replace(
        "'typescript'",
        JSON.stringify(
          pathToFileURL(
            path.resolve('node_modules/typescript/lib/typescript.js'),
          ).href,
        ),
      )
      .replace(
        "'../tests/integration/tenant-foundation/fixtures.mjs'",
        JSON.stringify(
          pathToFileURL(
            path.resolve('tests/integration/tenant-foundation/fixtures.mjs'),
          ).href,
        ),
      );
    const entry = path.join(isolated, 'scripts/run-backend-integration.mjs');
    fs.writeFileSync(entry, source);
    const r = spawnSync(process.execPath, [entry], {
      encoding: 'utf8',
      env: {
        ...process.env,
        BARBERIA_002_URL: good.url,
        BARBERIA_002_PROJECT_ID: good.projectId,
      },
    });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /NOT_READY/);
  } finally {
    removeOwnedDirectory(isolated);
  }
});
test('isolated TypeScript compilation works after unit build cleanup', async () => {
  const { createOwnedDirectory, removeOwnedDirectory } = await helpers();
  const { withCompiledClient } =
    await import('../../../scripts/run-backend-integration.mjs');
  const root = createOwnedDirectory();
  try {
    fs.mkdirSync(path.join(root, 'src/composition'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'src/composition/tenant-foundation-composition.ts'),
      'export const technicalValue = 7;',
    );
    fs.writeFileSync(
      path.join(root, 'tsconfig.tests.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          types: [],
          noEmitOnError: true,
        },
      }),
    );
    await withCompiledClient((m) => assert.equal(m.technicalValue, 7), root);
  } finally {
    removeOwnedDirectory(root);
  }
});
