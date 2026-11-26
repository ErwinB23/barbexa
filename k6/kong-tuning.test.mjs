import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tuneNginx,
  tuneEntrypoint,
  assertDescriptorLimit,
} from './lib/kong-config.mjs';

test('Kong events get exactly 4096 connections without changing other configuration', () => {
  const source =
    'worker_processes 1;\nevents {\n    multi_accept on;\n}\nhttp { include nginx-kong.conf; }\n';
  const tuned = tuneNginx(source);
  assert.equal(tuned.replace('    worker_connections 4096;\n', ''), source);
  assert.equal(tuneNginx(tuned), tuned);
  assert.equal(
    tuneNginx(
      source.replace(
        '    multi_accept',
        '    worker_connections 512;\n    multi_accept',
      ),
    ),
    tuned,
  );
  assert.throws(() => tuneNginx('http {}'), /UNSUPPORTED/);
  assert.throws(() => tuneNginx(source + 'events {}'), /UNSUPPORTED/);
});
test('persistent entrypoint repairs the regenerated template and is idempotent', () => {
  const source = '#!/usr/bin/env bash\nset -Eeo pipefail\nexec "$@"\n';
  const tuned = tuneEntrypoint(source);
  assert.match(tuned, /BARBEXA_K6_CONNECTIONS_4096/);
  assert.match(tuned, /custom_nginx\.template/);
  assert.match(tuned, /docker-start/);
  assert.equal(tuneEntrypoint(tuned), tuned);
  assert.throws(() => tuneEntrypoint('unknown entrypoint'), /UNSUPPORTED/);
});
test('file descriptor limits must support both the requested connections and margin', () => {
  assertDescriptorLimit(
    'Max open files            1048576              1048576              files',
  );
  assert.throws(
    () => assertDescriptorLimit('Max open files 1024 1024 files'),
    /DESCRIPTOR/,
  );
  assert.throws(() => assertDescriptorLimit('unknown'), /DESCRIPTOR/);
});
