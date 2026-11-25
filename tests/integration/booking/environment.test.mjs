import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as runner from '../../../scripts/run-backend-integration.mjs';
import { waitForBookingBarrier } from './fixtures.mjs';

const settings = {
  url: 'http://127.0.0.1:54421',
  projectId: 'app-barberia-002-local',
};
const database = {
  Name: '/supabase_db_app-barberia-002-local',
  State: { Running: true },
  HostConfig: { PortBindings: { '5432/tcp': [{ HostPort: '54422' }] } },
  Mounts: [{ Name: 'supabase_db_app-barberia-002-local' }],
  NetworkSettings: {
    Networks: { 'supabase_network_app-barberia-002-local': {} },
  },
};
test('booking modes cannot become shell paths or accidentally select the existing HTTP suites', () => {
  assert.equal(typeof runner.bookingMode, 'function');
  assert.equal(runner.bookingMode(['--booking-schema']), 'schema');
  assert.equal(runner.bookingMode(['--booking-concurrency']), 'concurrency');
  assert.equal(runner.bookingMode(['--profiles']), null);
  for (const a of [
    ['--booking-schema', '--profiles'],
    ['--booking-schema=../../private'],
    ['--booking'],
  ])
    assert.throws(() => runner.bookingMode(a));
});
test('booking refuses old or remote stacks and mismatched ports volumes networks before SQL', () => {
  assert.equal(typeof runner.assertBookingEnvironment, 'function');
  runner.assertBookingEnvironment(settings, database);
  for (const bad of [
    { ...settings, projectId: 'barberia-app' },
    { ...settings, url: 'https://vuoncrtkkkquvddunrxx.supabase.co' },
  ])
    assert.throws(() => runner.assertBookingEnvironment(bad, database));
  for (const bad of [
    { ...database, Name: '/supabase_db_barberia-app' },
    { ...database, Mounts: [] },
    { ...database, NetworkSettings: { Networks: {} } },
    { ...database, State: { Running: false } },
    {
      ...database,
      HostConfig: { PortBindings: { '5432/tcp': [{ HostPort: '54322' }] } },
    },
  ])
    assert.throws(() => runner.assertBookingEnvironment(settings, bad));
});
test('SQL fixture mode requires rollback and rejects commits or external connections', () => {
  assert.equal(typeof runner.assertBookingSql, 'function');
  assert.doesNotThrow(() =>
    runner.assertBookingSql("begin; select 'commit'; rollback;"),
  );
  for (const sql of [
    'select 1;',
    'begin;select 1;commit;',
    'begin;commit;begin;rollback;',
    'begin;select 1; -- rollback;',
    'begin;\\connect postgres\nrollback;',
    'begin;commit work;begin;rollback;',
    'begin;end transaction;begin;rollback;',
    'begin;rollback;select 1;begin;rollback;',
    'begin;\\! echo unsafe\nrollback;',
    'begin;\\copy t from program unsafe\nrollback;',
  ])
    assert.throws(() => runner.assertBookingSql(sql));
});
test('booking user settings refuse service credentials and preserve ordinary user mode', () => {
  assert.equal(typeof runner.bookingUserSettings, 'function');
  assert.doesNotThrow(() =>
    runner.bookingUserSettings({
      ...settings,
      publicKey: 'sb_publishable_fixture',
      accessToken: 'ordinary-fictitious-token',
    }),
  );
  assert.throws(() =>
    runner.bookingUserSettings({
      ...settings,
      publicKey: 'sb_publishable_fixture',
      accessToken: 'sb_secret_fixture',
    }),
  );
});
test('concurrency barrier releases only after observing two waiting database workers', async () => {
  let released = 0,
    position = 0;
  const observed = [0, 1, 2];
  await waitForBookingBarrier(
    async () => observed[position++],
    async () => {
      released++;
    },
    { poll: async () => {} },
  );
  assert.equal(released, 1);
  assert.equal(position, 3);
  await assert.rejects(() =>
    waitForBookingBarrier(
      async () => 1,
      async () => {
        released++;
      },
      { attempts: 2, poll: async () => {} },
    ),
  );
  await assert.rejects(() =>
    waitForBookingBarrier(
      async () => 3,
      async () => {
        released++;
      },
    ),
  );
  assert.equal(released, 1);
});
