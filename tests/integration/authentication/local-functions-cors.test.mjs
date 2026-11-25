import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from 'js-yaml';
import { patchFunctionsCors } from '../../../scripts/local-functions-cors.mjs';

const input = `_format_version: '1.1'
services:
  - name: auth-v1
    routes:
      - name: auth
        paths: [/auth/v1/]
    plugins:
      - name: cors
  - name: functions-v1
    routes:
      - name: functions-v1-all
        paths: [/functions/v1/]
    plugins:
      - name: cors
      - name: request-transformer
  - name: rest-v1
    routes:
      - name: rest
        paths: [/rest/v1/]
    plugins:
      - name: cors
`;
test('patch affects only Functions CORS, is idempotent, and reverses byte-for-byte', () => {
  const patched = patchFunctionsCors(input, 'apply');
  const parsed = load(patched);
  assert.deepEqual(parsed.services[1].plugins[0].config, {
    origins: ['http://localhost:8081'],
    preflight_continue: true,
  });
  assert.deepEqual(parsed.services[0], load(input).services[0]);
  assert.deepEqual(parsed.services[2], load(input).services[2]);
  assert.equal(patchFunctionsCors(patched, 'apply'), patched);
  assert.equal(patchFunctionsCors(patched, 'revert'), input);
});
test('unexpected routes or existing CORS policy stop before changing anything', () => {
  assert.throws(() =>
    patchFunctionsCors(input.replace('/functions/v1/', '/auth/v1/'), 'apply'),
  );
  assert.throws(() =>
    patchFunctionsCors(
      input.replace(
        '      - name: cors\n      - name: request-transformer',
        '      - name: cors\n        config: { origins: ["https://other.invalid"] }\n      - name: request-transformer',
      ),
      'apply',
    ),
  );
  assert.throws(() => patchFunctionsCors(input, 'unknown'));
});
