import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import SwaggerParser from '@apidevtools/swagger-parser';
test('OpenAPI describes the four Edge routes and resolves only internal references', async () => {
  const document = JSON.parse(fs.readFileSync('docs/api/openapi.json', 'utf8'));
  await SwaggerParser.validate(structuredClone(document), {
    resolve: { http: false, file: false },
  });
  for (const name of [
    'ensure-profile',
    'create-barbershop',
    'barbershop-operation',
    'reservation-command',
  ])
    assert.ok(document.paths['/functions/v1/' + name]?.post);
  assert.ok(!Object.keys(document.paths).some((p) => p.includes('/private/')));
  const operations = Object.values(document.paths).flatMap((p) =>
    Object.values(p).filter((x) => x?.operationId),
  );
  assert.equal(
    new Set(operations.map((x) => x.operationId)).size,
    operations.length,
  );
});
test('Swagger UI disables execution, remote validators and persisted credentials', () => {
  const script = fs.readFileSync('docs/api/swagger-init.js', 'utf8');
  assert.match(script, /supportedSubmitMethods:\s*\[\]/);
  assert.match(script, /validatorUrl:\s*null/);
  assert.match(script, /persistAuthorization:\s*false/);
  assert.match(script, /queryConfigEnabled:\s*false/);
});

test('Swagger request interceptor permits only the local specification, including after server selection', () => {
  let configuration;
  const bundle = (value) => {
    configuration = value;
  };
  bundle.presets = { apis: {} };
  vm.runInNewContext(fs.readFileSync('docs/api/swagger-init.js', 'utf8'), {
    window: { location: { origin: 'http://127.0.0.1:8082' } },
    SwaggerUIBundle: bundle,
    URL,
  });
  assert.equal(configuration.supportedSubmitMethods.length, 0);
  const request = { url: '/openapi.json', method: 'GET' };
  assert.equal(configuration.requestInterceptor(request), request);
  for (const denied of [
    {
      url: 'https://example.invalid/functions/v1/create-barbershop',
      method: 'POST',
    },
    { url: 'http://127.0.0.1:54421/rest/v1/profiles', method: 'GET' },
    { url: '/openapi.json', method: 'POST' },
    { url: '/rest/v1/profiles', method: 'PATCH' },
  ])
    assert.throws(() => configuration.requestInterceptor(denied));
});
