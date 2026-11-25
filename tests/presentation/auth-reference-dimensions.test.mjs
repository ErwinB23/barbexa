import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Auth reference sizing is opt-in for signup/recovery and leaves the approved login alone', () => {
  const css = fs.readFileSync(
    'src/features/authentication/presentation/auth-reference.styles.ts',
    'utf8',
  );
  const shell = fs.readFileSync(
    'src/features/authentication/presentation/auth-web-shell.tsx',
    'utf8',
  );
  assert.match(css, /\.ab-login:is\(\.ab-signup,\.ab-recovery\)/);
  assert.match(shell, /variant && <style>\{authReferenceStyles\}<\/style>/);
  assert.doesNotMatch(css, /\bzoom\s*:|\bscale\s*\(/);
});
