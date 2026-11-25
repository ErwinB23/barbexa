import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

test('initial Web document uses Barbexa name and its existing favicon before session hydration', () => {
  const { expo } = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  assert.equal(expo.web.name, 'Barbexa · Tu próximo corte empieza aquí');
  assert.equal(expo.web.favicon, './public/images/barbexa-logo.png');
  assert.ok(fs.existsSync(expo.web.favicon));
  // Identity, OAuth callback scheme and native package are unaffected.
  assert.equal(expo.slug, 'app-barberia');
  assert.equal(expo.scheme, 'appbarberia');
  assert.equal(expo.android.package, 'com.erwin23.appbarberia');
});

test('landing no longer changes or restores global tab branding when routes mount or unmount', () => {
  const source = fs.readFileSync('src/features/foundation/presentation/welcome-screen.web.tsx', 'utf8');
  assert.doesNotMatch(source, /document\.title\s*=/);
  assert.doesNotMatch(source, /icon\.href\s*=|icon\.remove\(/);
});
