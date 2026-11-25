import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('rescheduling SQL draft is additive, keeps financial records and original identity, and closes privileged entry points', () => {
  const sql = fs.readFileSync(
    'specs/010-reprogramacion-reservas/contracts/reschedule.sql',
    'utf8',
  );
  assert.ok(sql.includes('request_id') && sql.includes('expectedStartsAt'));
  assert.match(sql, /reschedule_advance_min[\s\S]*default 120/i);
  assert.match(
    sql,
    /old_starts_at[\s\S]*new_starts_at[\s\S]*actor_user_id[\s\S]*capacity[\s\S]*reason/i,
  );
  assert.match(sql, /r\.id\s*<>\s*original\.id/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /attendance\s*<>\s*'confirmed'/);
  assert.match(sql, /capacity\s*=\s*'client'/);
  assert.match(sql, /reason is null/);
  assert.match(sql, /set search_path\s*=\s*''/);
  assert.doesNotMatch(
    sql,
    /\b(?:drop|truncate)\s+(?:table|function)|alter table public\./i,
  );
  assert.doesNotMatch(
    sql,
    /\b(?:update|insert into|delete from)\s+(?:private\.(?:booking_care|care_events)|public\.reservation_items)/i,
  );
  assert.doesNotMatch(
    sql,
    /update public\.reservations set[^;]*(?:barber_id|total_amount|state\s*=)/i,
  );
  assert.match(sql, /from public,anon,authenticated,service_role/);
  assert.match(sql, /to service_role/);
});
