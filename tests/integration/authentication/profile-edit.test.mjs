import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './fixtures/composition.mjs';
const actor = '11111111-1111-4111-8111-111111111111';
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' profile editor uses verified 002 PATCH, null and reread without another SDK',
    async () => {
      const f = fixture(platform);
      f.auth.signInWithPassword = async () => ({
        data: { session: {} },
        error: null,
      });
      f.auth.getUser = async () => ({
        data: {
          user: {
            id: actor,
            email: 'test@example.invalid',
            email_confirmed_at: '2026-11-14',
            is_anonymous: false,
          },
        },
        error: null,
      });
      const app = f.foundation.createRegistrationApplication();
      await app.signIn({
        email: 'test@example.invalid',
        password: 'fictitious-unit-only',
      });
      assert.equal(app.getSnapshot().kind, 'ready');
      const before = f.calls.length;
      await assert.rejects(() =>
        app.updateOwnProfile({ displayName: 'X', role: 'administrator' }),
      );
      assert.equal(f.calls.length, before);
      await app.updateOwnProfile({ displayName: ' Updated ', phone: ' 123 ' });
      await app.updateOwnProfile({ displayName: 'Updated', phone: null });
      const writes = f.calls.filter((c) => c.method === 'PATCH');
      assert.equal(writes.length, 2);
      assert.ok(writes.every((c) => c.url.endsWith('id=eq.' + actor)));
      assert.deepEqual(
        writes.map((c) => JSON.parse(c.body)),
        [
          { display_name: 'Updated', phone: '123' },
          { display_name: 'Updated', phone: null },
        ],
      );
      await app.restoreAndVerify();
      assert.equal(app.getSnapshot().profile.displayName, 'Updated');
      assert.equal(app.getSnapshot().profile.phone, null);
      assert.equal(f.counts().factories, 1);
      f.foundation.dispose();
    },
  );
}
