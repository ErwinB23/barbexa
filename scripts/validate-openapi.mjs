import fs from 'node:fs';
import assert from 'node:assert/strict';
import SwaggerParser from '@apidevtools/swagger-parser';
import { loadCore } from '../tests/integration/booking/load-core.mjs';
const spec = JSON.parse(fs.readFileSync('docs/api/openapi.json', 'utf8'));
await SwaggerParser.validate(structuredClone(spec), {
  resolve: { http: false, file: false },
});
const operation = loadCore(
  'supabase/functions/_shared/barbershop-operation/application/operation.ts',
);
const reservation = loadCore(
  'supabase/functions/_shared/reservations/domain/reservation-input.ts',
);
const care = loadCore('supabase/functions/_shared/reservations/domain/care.ts');
const cancel = loadCore(
  'supabase/functions/_shared/reservations/domain/cancellation.ts',
);
const reschedule = loadCore(
  'supabase/functions/_shared/reservations/domain/reschedule.ts',
);
const foundation = loadCore(
  'supabase/functions/_shared/tenant-foundation/domain/validation.ts',
);
const shops = loadCore(
  'supabase/functions/_shared/tenant-foundation/domain/barbershop-validation.ts',
);
const payload = loadCore(
  'supabase/functions/_shared/reservations/infrastructure/booking-payload.ts',
);
let checked = 0;
for (const [route, item] of Object.entries(spec.paths)) {
  if (!item.post) continue;
  const media = item.post.requestBody.content['application/json'];
  for (const { value } of Object.values(
    media.examples ??
      (media.example ? { default: { value: media.example } } : {}),
  )) {
    let validated = false;
    if (route.endsWith('ensure-profile')) {
      foundation.profileInput(value);
      validated = true;
    }
    if (route.endsWith('create-barbershop')) {
      shops.barbershopInput(value);
      validated = true;
    }
    if (route.endsWith('barbershop-operation')) operation.parseOperation(value);
    if (route.endsWith('barbershop-operation')) validated = true;
    if (route.endsWith('reservation-command')) {
      const { action, ...body } = value;
      if (action === 'confirm') reservation.reservationInput(body);
      else if (action === 'cancel') cancel.cancellationInput(body);
      else if (action === 'reschedule') reschedule.rescheduleInput(body);
      else if (action === 'care') care.careCommand(body);
      validated = true;
    }
    if (validated) checked++;
  }
}
let responsesChecked = 0;
for (const [route, item] of Object.entries(spec.paths)) {
  for (const [status, response] of Object.entries(item.post?.responses ?? {})) {
    if (Number(status) >= 400) continue;
    for (const { value } of Object.values(
      response.content?.['application/json']?.examples ?? {},
    )) {
      if (route.endsWith('create-barbershop')) {
        shops.createdBarbershop(value);
        responsesChecked++;
      }
      if (route.endsWith('reservation-command') && value.id) {
        payload.bookingDetail(value);
        responsesChecked++;
      }
      if (route.endsWith('reservation-command') && value.reservationId) {
        care.careView(value, value.reservationId);
        responsesChecked++;
      }
    }
  }
}
const names = spec.components.schemas.OperationCommand.oneOf.map((r) =>
  r.$ref.split('/').at(-1),
);
const documented = new Set(
  names.map((n) => spec.components.schemas[n].properties.action.enum[0]),
);
const source = fs.readFileSync(
  'supabase/functions/_shared/barbershop-operation/application/operation.ts',
  'utf8',
);
const actual = new Set(
  [...source.matchAll(/case '([^']+)'/g)].map((m) => m[1]),
);
actual.delete('accept-ownership-transfer');
assert.deepEqual([...documented].sort(), [...actual].sort());
const rpcSources = [
  'src/features/barbershop-operation/infrastructure/operation-http-adapter.ts',
  'src/features/reservations/infrastructure/reservation-http-adapter.ts',
  'src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts',
  'src/features/notifications/infrastructure/inbox-http.ts',
]
  .map((p) => fs.readFileSync(p, 'utf8'))
  .join('\n');
for (const match of rpcSources.matchAll(
  /(?:rpc\(\s*['"]|\/rest\/v1\/rpc\/)([a-z_]+)/g,
))
  assert.ok(spec.paths['/rest/v1/rpc/' + match[1]], match[1]);
console.log(
  'OpenAPI3.0.3 válido; referencias internas resueltas; ' +
    documented.size +
    ' comandos de operación; ' +
    checked +
    ' solicitudes y ' +
    responsesChecked +
    ' respuestas contrastadas con validadores reales; RPC consumidos inventariados.',
);
