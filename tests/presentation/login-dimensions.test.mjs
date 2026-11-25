import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('desktop login dimensions are isolated from signup/recovery without zoom or global scaling', () => {
  const css = fs.readFileSync(
    'src/features/authentication/presentation/sign-in-web.styles.ts',
    'utf8',
  );
  const overrides = css.split('/* Login-only reference dimensions')[1];
  assert.ok(overrides, 'login-only sizing rules exist');
  assert.match(overrides, /max-width: 488px/);
  assert.match(overrides, /1312px/);
  assert.match(overrides, /:not\(\.ab-signup\):not\(\.ab-recovery\)/);
  assert.doesNotMatch(overrides, /\bzoom\s*:|\bscale\s*\(/);
});
