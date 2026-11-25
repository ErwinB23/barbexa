import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const root = 'supabase/migrations/';
const migration = fs.readFileSync(
  root + '20261121040559_administrative_closure_withdrawal.sql',
  'utf8',
);
const body = (source, name) => {
  const start = source.search(
    new RegExp(`create(?: or replace)? function private\\.${name}\\(`, 'i'),
  );
  assert.ok(start >= 0, name);
  const tail = source.slice(start);
  const tag = /as (\$\w*\$)/i.exec(tail);
  assert.ok(tag, name);
  const from = tag.index + tag[0].length;
  return tail
    .slice(from, tail.indexOf(tag[1], from))
    .replace(/\s+/g, ' ')
    .trim();
};
test('withdrawal migration preserves every existing availability algorithm except inactive-closure exclusion', () => {
  for (const [name, file] of [
    ['booking_preserve_reservations', '20261114202045_booking_operations.sql'],
    ['reservation_available', '20261114224344_booking_atomic.sql'],
    ['self_schedule_command', '20261115203629_own_professional_schedule.sql'],
    ['reschedule_available', '20261115210802_booking_reschedule.sql'],
  ]) {
    assert.equal(
      body(migration, name).replaceAll(
        'e.withdrawal_event_id is null and ',
        '',
      ),
      body(fs.readFileSync(root + file, 'utf8'), name),
    );
  }
});
test('client and Edge closure validators stay identical across the framework boundary', () => {
  const client = fs.readFileSync(
    'src/features/barbershop-operation/domain/shop-closure.ts',
    'utf8',
  );
  const server = fs.readFileSync(
    'supabase/functions/_shared/barbershop-operation/domain/shop-closure.ts',
    'utf8',
  );
  assert.equal(server.replace("'./values.ts'", "'./values'"), client);
});
