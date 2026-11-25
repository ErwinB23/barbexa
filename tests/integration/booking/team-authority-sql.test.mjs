import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
const sql = () =>
  fs.readFileSync(
    'supabase/migrations/20261120010538_team_authority.sql',
    'utf8',
  );
const body = (name) => {
  const source = sql();
  const start = source.indexOf(`function private.${name}(`);
  assert.notEqual(start, -1);
  const tail = source.slice(start),
    tag = tail.match(/as (\$\w+\$)/i)[1];
  const from = tail.indexOf(tag) + tag.length;
  return tail.slice(from, tail.indexOf(tag, from));
};

test('care projection returns before the first mutation lock and performs no row locks or writes', () => {
  const care = body('care_command'),
    returned = care.indexOf('return private.care_json(r,actor);');
  assert.ok(
    returned >= 0 &&
      returned <
        care.indexOf('perform private.authority_lock(r.barbershop_id)'),
  );
  const branch = care.slice(
    care.lastIndexOf("if action='read' then", returned),
    returned,
  );
  assert.match(branch, /actor<>r.client_user_id/);
  assert.doesNotMatch(
    branch,
    /\b(insert|update|delete)\b|for\s+(share|update)|authority_lock|pg_advisory_xact_lock/i,
  );
});
test('owner invitation read authorization is pure; shared locks remain available only for mutations', () => {
  const query = body('admin_invitation_admin');
  assert.match(query, /authority_assert\(actor,shop,'administrators',false\)/);
  assert.doesNotMatch(
    query,
    /authority_lock|pg_advisory_xact_lock|for\s+(share|update)|\b(insert|update|delete)\b/i,
  );
  const guard = body('authority_assert');
  assert.match(guard, /if writing then[\s\S]*for share;[\s\S]*else/);
  assert.match(
    sql(),
    /revoke all on function private\.authority_assert\(uuid,uuid,text,boolean\)/,
  );
});
test('accepted historical replay validates current recipient membership before stamps, quota or mutation locks', () => {
  const command = body('admin_invitation_command');
  const start = command.indexOf('-- HISTORICAL RESPONSE ONLY'),
    end = command.indexOf('-- MUTATING INVITATION PATH');
  assert.ok(start >= 0 && end > start);
  const history = command.slice(start, end);
  assert.match(history, /i.recipient_user_id<>actor/);
  assert.match(history, /i.status='accepted'/);
  assert.match(
    history,
    /user_id=actor and barbershop_id=shop and role='administrator' and status='active'/,
  );
  assert.match(history, /m.expired or m.expires_at<=/);
  assert.doesNotMatch(
    history,
    /authority_lock|authority_assert_room|authority_validate_invitation|for\s+(update|share)|\b(insert|update|delete)\b/i,
  );
  assert.ok(command.indexOf('authority_validate_invitation(i.id)') > end);
  assert.ok(
    command.indexOf('authority_assert_room(shop,actor)') >
      command.indexOf("if i.status<>'pending'", end),
  );
});
test('prepared ownership migration is additive, closes grants, and never infers legacy owners', () => {
  const source = sql();
  for (const name of [
    'barbershop_ownership',
    'team_authority_events',
    'ownership_transfers',
    'authority_invitation_stamp',
  ]) {
    assert.match(source, new RegExp('create table private\\.' + name));
    assert.match(
      source,
      new RegExp(
        'alter table private\\.' + name + ' enable row level security',
      ),
    );
  }
  assert.match(source, /foreign key\(owner_user_id,barbershop_id\)/);
  assert.match(source, /regularize_barbershop_ownership/);
  assert.doesNotMatch(
    source,
    /insert into private\.barbershop_ownership[^;]*select[^;]*from public\.barbershops/i,
  );
  assert.doesNotMatch(
    source,
    /grant[^;]*on function public\.confirm_booking\(/i,
  );
});
test('SQL source includes common lock, deferred invariants and guards in compatibility replacements', () => {
  const source = sql();
  assert.match(
    source,
    /create constraint trigger authority_membership_invariant/,
  );
  assert.match(source, /deferrable initially deferred/);
  assert.match(source, /secondary_count>2/);
  assert.match(source, /function private\.authority_lock/);
  assert.match(
    source,
    /current_setting\('transaction_isolation'\)<>'read committed'/,
  );
  assert.match(source, /function private\.booking_command/);
  assert.match(source, /function private\.admin_invitation_command/);
  assert.match(source, /function private\.care_command/);
  assert.match(source, /authority_assert\(actor,shop,'refund'\)/);
  assert.match(source, /authority_assert\(actor,shop,'publish'\)/);
  assert.match(source, /authority_assert\(actor,shop,'team'\)/);
});
test('SQL source includes owner-version invitation stamps and quota guards (not a runtime race test)', () => {
  const source = sql();
  assert.match(source, /authority_validate_invitation/);
  assert.match(source, /owner_version/);
  assert.match(source, /authority_assert_room/);
  assert.match(source, /TRANSFER_CONFIRMATION_NOT_APPROVED/);
  assert.match(source, /FORBIDDEN/);
  assert.match(source, /values\(shop,chosen_owner,null,'reviewed-legacy'\)/);
});
test('invoker bridges retain required grants while new helpers and regularization remain private', () => {
  const source = sql();
  for (const name of [
    'authority_lock',
    'authority_assert',
    'authority_owner',
    'regularize_barbershop_ownership',
  ]) {
    assert.match(
      source,
      new RegExp(
        'revoke all on function private\\.' +
          name +
          '\\([^;]*from public,anon,authenticated,service_role;',
      ),
    );
    assert.doesNotMatch(
      source,
      new RegExp('grant execute on function private\\.' + name),
    );
  }
  assert.match(
    source,
    /grant execute on function private\.care_command\(uuid,jsonb\) to service_role/,
  );
  assert.match(
    source,
    /grant execute on function private\.create_own_barbershop\(uuid,text\) to service_role/,
  );
  assert.match(
    source,
    /grant execute on function public\.team_authority_command\(uuid,text,jsonb\) to service_role/,
  );
});
test('history reconciliation audit is read-only and inspects objects beyond function bodies', () => {
  const audit = fs.readFileSync(
    'specs/011-equipo-resumen-profesional/contracts/team-authority-history-audit.sql',
    'utf8',
  );
  const commands = audit.replace(/--[^\n]*/g, '');
  assert.match(commands, /begin isolation level repeatable read read only/i);
  assert.doesNotMatch(
    commands,
    /(?:^|;)\s*(?:create|alter|drop|insert|update|delete|truncate|grant|revoke|call|do)\b/i,
  );
  for (const required of [
    'pg_attribute',
    'pg_constraint',
    'pg_index',
    'pg_policy',
    'pg_trigger',
    'pg_depend',
    'has_function_privilege',
    'has_table_privilege',
    'has_column_privilege',
    'pronargdefaults',
    'confirm_booking(uuid,jsonb)',
    'reservation_confirm(uuid,jsonb)',
  ])
    assert.ok(commands.includes(required), required);
  assert.doesNotMatch(
    commands,
    /select\s+(?:public|private)\.(?:care_booking|cancel_booking|confirm_booking_paid)\s*\(/i,
  );
});
test('prepared read-only acceptance script covers projections and historic response without executing fixtures', () => {
  const source = fs.readFileSync(
    'supabase/tests/team-authority-reads.prepared.sql',
    'utf8',
  );
  assert.match(source, /begin isolation level read committed read only/);
  assert.match(source, /authority_read_test_authorized/);
  assert.match(source, /admin_invitation_list/);
  assert.match(source, /respond_booking_invitation/);
  assert.doesNotMatch(
    source.replace(/--[^\n]*/g, ''),
    /(?:^|;)\s*(?:create|alter|drop|insert|update|delete)\b/i,
  );
});
