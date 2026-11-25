import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('professional summary SQL derives own active profile and preserves unrecorded legacy care', () => {
  const sql = fs.readFileSync(
    'specs/011-equipo-resumen-profesional/contracts/professional-summary.sql',
    'utf8',
  );
  assert.match(sql, /private\.self_professional_command/);
  assert.match(sql, /r\.barber_id\s*=\s*professional/);
  assert.match(sql, /r\.barbershop_id\s*=\s*shop/);
  assert.match(sql, /America\/Lima/);
  assert.match(sql, /'unrecorded'/);
  assert.doesNotMatch(
    sql,
    /\b(?:insert into|update|delete from|create table|alter table)\b/i,
  );
  assert.match(sql, /from public,anon,authenticated,service_role/);
  assert.match(sql, /to service_role/);
});
test('administrator SQL reuses invitations, preserves barber semantics and closes expired accept and mail claims', () => {
  const sql = fs.readFileSync(
    'specs/011-equipo-resumen-profesional/contracts/admin-invitations.sql',
    'utf8',
  );
  assert.match(sql, /interval '7 days'/);
  assert.match(sql, /expires_at\s*<=\s*stamp/);
  assert.match(sql, /recipient_user_id\s*<>\s*actor/);
  assert.match(sql, /role\s*=\s*'administrator'/);
  assert.match(sql, /email_confirmed_at is not null/);
  assert.match(sql, /for update/);
  assert.match(sql, /sending','sent','unknown'/);
  assert.match(sql, /claim_actor_id/);
  assert.match(sql, /request_id/);
  assert.match(
    sql,
    /create or replace function public\.respond_booking_invitation/,
  );
  assert.match(sql, /private\.booking_command/);
  assert.match(sql, /set search_path\s*=\s*''/);
  assert.doesNotMatch(sql, /\b(?:delete from|truncate|drop table)\b/i);
  assert.doesNotMatch(
    sql,
    /update public\.staff_invitations[^;]*where[^;]*role\s*=\s*'barber'/i,
  );
});
