// Operator for the approved local stack only. Never targets Cloud or other stacks.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { load } from 'js-yaml';

const container = 'supabase_kong_app-barberia-002-local';
const file = '/home/kong/kong.yml';
const policy = { origins: ['http://localhost:8081'], preflight_continue: true };

export function patchFunctionsCors(source, mode) {
  assert.ok(['apply', 'revert'].includes(mode), 'Unknown mode');
  const parsed = load(source);
  const services = parsed.services.filter((s) => s.name === 'functions-v1');
  assert.equal(services.length, 1, 'Unexpected Functions service');
  const service = services[0];
  assert.deepEqual(
    service.routes.map((r) => r.paths),
    [['/functions/v1/']],
    'Unexpected scope',
  );
  assert.equal(
    service.routes.some((r) => r.plugins?.some((p) => p.name === 'cors')),
    false,
  );
  const cors = service.plugins.filter((p) => p.name === 'cors');
  assert.equal(cors.length, 1);
  const configured = cors[0].config !== undefined;
  if (configured)
    assert.deepEqual(cors[0].config, policy, 'Existing policy differs; stop');
  if ((mode === 'apply') === configured) return source;
  const start = /^([ \t]*)- name: functions-v1\r?$/m.exec(source);
  assert.ok(start, 'Unsupported YAML layout');
  const tail = source.slice(start.index + start[0].length);
  const next = new RegExp(`^${start[1]}- name:`, 'm').exec(tail);
  const end = next ? start.index + start[0].length + next.index : source.length;
  const block = source.slice(start.index, end);
  const plugin = /^([ \t]*)- name: cors\r?\n/m.exec(block);
  assert.ok(plugin, 'Unsupported plugin layout');
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const indent = plugin[1] + '  ';
  const addition = [
    `${indent}# T009 local Functions CORS`,
    `${indent}config:`,
    `${indent}  origins: ["http://localhost:8081"]`,
    `${indent}  preflight_continue: true`,
    '',
  ].join(newline);
  const offset = start.index + plugin.index + plugin[0].length;
  const result =
    mode === 'apply'
      ? source.slice(0, offset) + addition + source.slice(offset)
      : (assert.equal(
          source.slice(offset, offset + addition.length),
          addition,
          'Patch marker differs',
        ),
        source.slice(0, offset) + source.slice(offset + addition.length));
  const updated = load(result);
  const updatedCors = updated.services
    .find((s) => s.name === 'functions-v1')
    .plugins.find((p) => p.name === 'cors');
  if (configured) updatedCors.config = cors[0].config;
  else delete updatedCors.config;
  assert.deepEqual(updated, parsed, 'Change outside Functions CORS');
  return result;
}

function docker(args, input) {
  // Capture output in memory: declarative YAML can contain local credentials.
  return execFileSync('docker', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}
function run(mode) {
  const config = fs.readFileSync('supabase/config.toml', 'utf8');
  assert.match(config, /^project_id = "app-barberia-002-local"$/m);
  const identity = JSON.parse(docker(['inspect', container]))[0];
  assert.equal(identity.Name, '/' + container);
  assert.ok(
    identity.NetworkSettings.Networks[
      'supabase_network_app-barberia-002-local'
    ],
  );
  const original = docker(['exec', container, 'cat', file]);
  const next = patchFunctionsCors(original, mode);
  if (next === original) {
    console.log('Requested policy already present; no reload');
    return;
  }
  // Prove byte-for-byte rollback before writing. No raw backup is written to the host.
  assert.equal(
    patchFunctionsCors(next, mode === 'apply' ? 'revert' : 'apply'),
    original,
  );
  docker(
    ['exec', '-i', container, 'sh', '-c', 'cat > /home/kong/kong.t009.yml'],
    next,
  );
  docker([
    'exec',
    container,
    'kong',
    'config',
    'parse',
    '/home/kong/kong.t009.yml',
  ]);
  try {
    docker(['exec', container, 'mv', '/home/kong/kong.t009.yml', file]);
    docker(['exec', container, 'kong', 'reload']);
    assert.equal(docker(['exec', container, 'cat', file]), next);
  } catch {
    docker(
      ['exec', '-i', container, 'sh', '-c', 'cat > /home/kong/kong.yml'],
      original,
    );
    docker(['exec', container, 'kong', 'reload']);
    throw new Error('Reload failed; original restored');
  }
  console.log(
    JSON.stringify({
      mode,
      target: container,
      onlyFunctionsCorsChanged: true,
      rollbackChecked: true,
      reloaded: true,
    }),
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    run(process.argv[2]);
  } catch {
    console.error(
      'Local CORS operation stopped; raw config/error suppressed to protect credentials',
    );
    process.exitCode = 1;
  }
}
