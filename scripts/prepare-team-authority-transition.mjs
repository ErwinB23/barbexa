// Preparation only. No connections, processes, file writes or commit execution.
import { createHash } from 'node:crypto';

const sourceHash =
  '6F581F7C0EA2B6E6DC9C518A6CDF7252AE9816DC7CA7A21F4A0E3CE44B1D1B42';
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const tables = [
  'auth.users',
  'auth.identities',
  'public.profiles',
  'public.services',
  'public.barbershops',
  'private.care_events',
  'public.reservations',
  'private.booking_care',
  'private.care_settings',
  'public.barber_profiles',
  'public.barber_services',
  'public.barber_schedules',
  'public.barbershop_hours',
  'public.reservation_items',
  'public.staff_invitations',
  'private.reschedule_events',
  'public.reservation_events',
  'public.schedule_exceptions',
  'private.reschedule_settings',
  'private.admin_invitation_mail',
  'public.barbershop_memberships',
  'public.barbershop_booking_settings',
];
const requireThat = (value, message) => {
  if (!value) throw new Error(message);
};
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const json = (value) => quote(JSON.stringify(value)) + '::jsonb';
const sha = (value) => createHash('sha256').update(value).digest('hex');
const hashSql = (table, where = '') =>
  `(select encode(sha256(convert_to(coalesce(string_agg(h,'' order by h),''),'UTF8')),'hex') from (select encode(sha256(convert_to(to_jsonb(r)::text,'UTF8')),'hex') h from ${table} r ${where}) digest_rows)`;

// A lexical boundary check, not a PostgreSQL compiler. Dollar bodies stay opaque.
export function splitTransitionStatements(source) {
  const result = [];
  let start = 0,
    state = '',
    depth = 0;
  for (let i = 0; i < source.length; i++) {
    const c = source[i],
      next = source[i + 1];
    if (state === '--') {
      if (c === '\n') state = '';
      continue;
    }
    if (state === '/*') {
      if (c === '/' && next === '*') {
        depth++;
        i++;
      } else if (c === '*' && next === '/') {
        if (--depth === 0) state = '';
        i++;
      }
      continue;
    }
    if (state === "'" || state === '"') {
      if (c === state) {
        if (next === state) i++;
        else state = '';
      }
      continue;
    }
    if (state.startsWith('$')) {
      if (source.startsWith(state, i)) {
        i += state.length - 1;
        state = '';
      }
      continue;
    }
    if (c === '-' && next === '-') {
      state = '--';
      i++;
    } else if (c === '/' && next === '*') {
      state = '/*';
      depth = 1;
      i++;
    } else if (c === "'" || c === '"') state = c;
    else if (c === '$') {
      const tag = source.slice(i).match(/^\$(?:[a-z_]\w*)?\$/i)?.[0];
      if (tag) {
        state = tag;
        i += tag.length - 1;
      }
    } else if (c === ';') {
      result.push(source.slice(start, i + 1));
      start = i + 1;
    }
  }
  requireThat(!state || state === '--', 'UNTERMINATED_SQL');
  const tail = source.slice(start);
  if (tail.trim()) result.push(tail);
  else if (result.length) result[result.length - 1] += tail;
  return result;
}

function validate(p, migration, mode) {
  requireThat(mode === 'rollback', 'PREPARATION_ONLY');
  requireThat(
    p.project === 'app-barberia-002-local' &&
      p.host === '127.0.0.1' &&
      p.port === 54422 &&
      p.database === 'postgres',
    'UNSAFE_TARGET',
  );
  requireThat(/^\d+$/.test(p.systemIdentifier), 'UNSAFE_TARGET_IDENTITY');
  requireThat(
    sha(migration).toUpperCase() === sourceHash,
    'SOURCE_HASH_CHANGED',
  );
  requireThat(
    p.migrationVersion === '20261120010538' &&
      p.historyVersions.length === 16 &&
      new Set(p.historyVersions).size === 16 &&
      p.historyVersions.every(
        (v) => /^\d{14}$/.test(v) && v !== p.migrationVersion,
      ),
    'HISTORY_CHANGED',
  );
  requireThat(
    /^[a-f0-9]{64}$/.test(p.historySha256),
    'HISTORY_BASELINE_MISSING',
  );
  requireThat(
    JSON.stringify(Object.keys(p.fingerprints).sort()) ===
      JSON.stringify([...tables].sort()) &&
      Object.values(p.fingerprints).every((v) => /^[a-f0-9]{64}$/.test(v)),
    'BASELINE_INCOMPLETE',
  );
  requireThat(
    p.proposals.length === 8 &&
      new Set(p.proposals.map((s) => s.shopId)).size === 8,
    'MAP_INCOMPLETE',
  );
  requireThat(
    p.proposals.filter((s) => s.settingsMissing).length === 1,
    'SETTINGS_BASELINE_CHANGED',
  );
  for (const s of p.proposals) {
    requireThat(
      uuidPattern.test(s.shopId) &&
        uuidPattern.test(s.ownerUserId) &&
        typeof s.name === 'string' &&
        s.name.trim(),
      'MAP_INVALID',
    );
    requireThat(
      s.members.every(
        (m) =>
          uuidPattern.test(m.userId) &&
          ['administrator', 'barber'].includes(m.role) &&
          ['active', 'inactive'].includes(m.status),
      ) && new Set(s.members.map((m) => m.userId)).size === s.members.length,
      'MAP_INVALID_MEMBERS',
    );
    requireThat(
      s.members.some(
        (m) =>
          m.userId === s.ownerUserId &&
          m.role === 'administrator' &&
          m.status === 'active',
      ),
      'OWNER_NOT_ACTIVE_ADMIN',
    );
    const secondaries = s.members
      .filter(
        (m) =>
          m.role === 'administrator' &&
          m.status === 'active' &&
          m.userId !== s.ownerUserId,
      )
      .map((m) => m.userId)
      .sort();
    requireThat(secondaries.length <= 2, 'SECONDARY_LIMIT_EXCEEDED');
    requireThat(
      JSON.stringify(secondaries) ===
        JSON.stringify([...s.secondaryUserIds].sort()),
      'SECONDARY_MAP_CHANGED',
    );
  }
  requireThat(
    p.protectedPendingInvitations.length === 1,
    'INVITATION_BASELINE_CHANGED',
  );
  for (const i of p.protectedPendingInvitations)
    requireThat(
      [i.id, i.shopId, i.sender, i.recipient].every((v) =>
        uuidPattern.test(v),
      ) &&
        p.proposals.some(
          (s) => s.shopId === i.shopId && s.ownerUserId === i.sender,
        ),
      'INVITATION_OWNER_MISMATCH',
    );
}

export function prepareTeamAuthorityTransition({
  proposal: p,
  migration,
  mode = 'rollback',
}) {
  validate(p, migration, mode);
  const parts = splitTransitionStatements(migration);
  requireThat(
    /^\s*(?:--[^\n]*\n\s*)*begin;\s*$/i.test(parts[0]) &&
      /^\s*commit;\s*$/i.test(parts.at(-1)),
    'SOURCE_TRANSACTION_CHANGED',
  );
  const body = parts.slice(1, -1).join('');
  requireThat(
    !splitTransitionStatements(body).some((s) =>
      /^\s*(?:begin|commit|rollback);\s*$/i.test(s),
    ),
    'NESTED_TRANSACTION',
  );
  const sourceFunctions = [];
  const re =
    /create\s+(?:or\s+replace\s+)?function\s+((?:public|private)\.\w+)\s*\(([^)]*)\)\s*returns\s+([\s\S]*?)\bas\s+(\$\w*\$)/gi;
  let match;
  while ((match = re.exec(migration))) {
    const end = migration.indexOf(match[4], re.lastIndex);
    requireThat(end >= 0, 'SOURCE_BODY_MISSING');
    const types = match[2].trim()
      ? match[2]
          .split(',')
          .map((a) => a.trim().split(/\s+/)[1])
          .join(',')
      : '';
    sourceFunctions.push({
      signature: `${match[1]}(${types})`,
      definer: /security\s+definer/i.test(match[3]),
      volatility: /\bimmutable\b/i.test(match[3])
        ? 'i'
        : /\bstable\b/i.test(match[3])
          ? 's'
          : 'v',
      defaultArguments: (match[2].match(/\bdefault\b/gi) ?? []).length,
      bodySha256: sha(
        migration.slice(re.lastIndex, end).replaceAll('\r\n', '\n').trim(),
      ),
    });
    re.lastIndex = end + match[4].length;
  }
  requireThat(sourceFunctions.length === 24, 'SOURCE_FUNCTION_COUNT_CHANGED');
  const missing = p.proposals.find((s) => s.settingsMissing);
  const fingerprints = Object.fromEntries(tables.map((t) => [t, hashSql(t)]));
  const fingerprintSql = `jsonb_build_object(${Object.entries(fingerprints)
    .flatMap(([t, q]) => [quote(t), q])
    .join(',')})`;
  const finalFingerprintSql = fingerprintSql.replace(
    hashSql('public.barbershop_booking_settings'),
    hashSql(
      'public.barbershop_booking_settings',
      `where barbershop_id<>${quote(missing.shopId)}::uuid`,
    ),
  );
  const mapJson = json(
    p.proposals.map((s) => ({
      ...s,
      members: [...s.members].sort((a, b) => a.userId.localeCompare(b.userId)),
    })),
  );
  const expectedSettings = {
    barbershop_id: missing.shopId,
    publication_state: 'draft',
    public_contact: null,
    address: null,
    minimum_notice_min: null,
    booking_horizon_days: null,
    max_future_per_client: null,
    slot_step_min: null,
    buffer_min: null,
    cancellation_advance_min: 120,
    version: 1,
  };
  const regularizations = p.proposals
    .map(
      (s) =>
        `select private.regularize_barbershop_ownership(${quote(s.shopId)}::uuid,${quote(s.ownerUserId)}::uuid,${json([...s.members].sort((a, b) => a.userId.localeCompare(b.userId)))},'LOCAL ficticio: mapa propuesto 2C.7; requiere aprobación expresa antes de ejecutar');`,
    )
    .join('\n');
  const sql = `-- PREPARED ONLY. DO NOT EXECUTE without new database authorization.
-- Source SHA256 ${sourceHash}. Terminal action is ROLLBACK; no commit mode exists.
begin isolation level read committed;
set local lock_timeout='5s';
set local statement_timeout='30s';
do $identity$ begin
 if current_database()<>'postgres' or (select system_identifier::text from pg_control_system())<>${quote(p.systemIdentifier)} then raise exception 'TARGET_CHANGED';end if;
end;$identity$;
lock table ${['public.barbershop_booking_settings', ...tables.filter((t) => t !== 'public.barbershop_booking_settings').sort(), 'supabase_migrations.schema_migrations'].join(',')} in share row exclusive mode;
do $precheck$ declare s jsonb; actual jsonb; begin
 if current_database()<>'postgres' or (select system_identifier::text from pg_control_system())<>${quote(p.systemIdentifier)} then raise exception 'TARGET_CHANGED';end if;
 if (select jsonb_agg(version order by version) from supabase_migrations.schema_migrations)<>${json([...p.historyVersions].sort())} or ${hashSql('supabase_migrations.schema_migrations')}<>${quote(p.historySha256)} then raise exception 'HISTORY_CHANGED';end if;
 if to_regclass('private.barbershop_ownership') is not null then raise exception 'ALREADY_APPLIED';end if;
 if ${fingerprintSql}<>${json(p.fingerprints)} then raise exception 'BASELINE_CHANGED';end if;
 for s in select value from jsonb_array_elements(${mapJson}) loop
  if (select name from public.barbershops where id=(s->>'shopId')::uuid) is distinct from s->>'name' then raise exception 'SHOP_CHANGED';end if;
  select jsonb_agg(jsonb_build_object('userId',user_id,'role',role,'status',status) order by user_id) into actual from public.barbershop_memberships where barbershop_id=(s->>'shopId')::uuid;
  if actual is distinct from s->'members' then raise exception 'MEMBERSHIP_SNAPSHOT_CHANGED';end if;
  if not exists(select 1 from auth.users where id=(s->>'ownerUserId')::uuid and email_confirmed_at is not null and not coalesce(is_anonymous,false) and deleted_at is null and (banned_until is null or banned_until<=clock_timestamp())) then raise exception 'OWNER_ACCOUNT_CHANGED';end if;
 end loop;
end;$precheck$;
-- BEGIN EXACT REVIEWED MIGRATION BODY (outer transaction markers excluded)
${body}
-- END EXACT REVIEWED MIGRATION BODY
${regularizations}
set constraints all immediate;
do $verify$ declare s jsonb; f jsonb; fn pg_proc; capability jsonb; role_name text; table_name text; signature text; begin
 if ${finalFingerprintSql}<>${json(p.fingerprints)} then raise exception 'BASELINE_CHANGED';end if;
 if (select to_jsonb(c) from public.barbershop_booking_settings c where barbershop_id=${quote(missing.shopId)}::uuid) is distinct from ${json(expectedSettings)} then raise exception 'UNEXPECTED_SETTINGS';end if;
 if (select count(*) from private.barbershop_ownership)<>8 or (select count(*) from private.team_authority_events)<>8 or exists(select 1 from private.ownership_transfers) or exists(select 1 from private.authority_invitation_stamp) then raise exception 'UNEXPECTED_AUTHORITY_EVENTS';end if;
 for s in select value from jsonb_array_elements(${mapJson}) loop
  if not exists(select 1 from private.barbershop_ownership where barbershop_id=(s->>'shopId')::uuid and owner_user_id=(s->>'ownerUserId')::uuid and created_by is null and source='reviewed-legacy' and version=1) then raise exception 'OWNERSHIP_MISMATCH';end if;
  if (select count(*) from private.team_authority_events where barbershop_id=(s->>'shopId')::uuid and target_user_id=(s->>'ownerUserId')::uuid and action='regularized' and before_state->'members'=s->'members')<>1 then raise exception 'UNEXPECTED_AUTHORITY_EVENTS';end if;
  capability:=private.authority_capabilities((s->>'ownerUserId')::uuid,(s->>'shopId')::uuid);
  if capability->>'capacity'<>'owner' or exists(select 1 from jsonb_each(capability->'permissions') where value<>'true'::jsonb) then raise exception 'CAPABILITY_MISMATCH';end if;
  for f in select value from jsonb_array_elements(s->'members') where value->>'status'='active' and value->>'userId'<>s->>'ownerUserId' loop
   capability:=private.authority_capabilities((f->>'userId')::uuid,(s->>'shopId')::uuid);
   if f->>'role'='administrator' then
    if capability->>'capacity'<>'secondary' or capability->'permissions'<>jsonb_build_object('manageAdministrators',false,'transferOwnership',false,'manageTeam',false,'publish',false,'refund',false,'editServices',true,'editHours',true,'manageReservations',true,'confirmPayment',true) then raise exception 'CAPABILITY_MISMATCH';end if;
   elsif capability->>'capacity'<>'barber' or exists(select 1 from jsonb_each(capability->'permissions') where value<>'false'::jsonb) then raise exception 'CAPABILITY_MISMATCH';end if;
  end loop;
 end loop;
 for f in select value from jsonb_array_elements(${json(p.protectedPendingInvitations)}) loop
  if not exists(select 1 from public.staff_invitations where id=(f->>'id')::uuid and barbershop_id=(f->>'shopId')::uuid and inviter_user_id=(f->>'sender')::uuid and recipient_user_id=(f->>'recipient')::uuid and role='barber' and status='pending') or not private.authority_owner((f->>'sender')::uuid,(f->>'shopId')::uuid) then raise exception 'INVITATION_CHANGED';end if;
 end loop;
 for f in select value from jsonb_array_elements(${json(sourceFunctions)}) loop
  select * into fn from pg_proc where oid=to_regprocedure(f->>'signature');
  if not found or fn.proowner<>(select oid from pg_roles where rolname='postgres') or fn.prosecdef<>(f->>'definer')::boolean or fn.provolatile::text<>f->>'volatility' or fn.pronargdefaults<>(f->>'defaultArguments')::integer or encode(sha256(convert_to(btrim(replace(fn.prosrc,E'\\r\\n',E'\\n'),E' \\n\\r\\t'),'UTF8')),'hex')<>f->>'bodySha256' or not coalesce(fn.proconfig @> array['search_path=""'],false) then raise exception 'FUNCTION_CONTRACT_CHANGED: %',f->>'signature';end if;
 end loop;
 foreach table_name in array array['private.barbershop_ownership','private.team_authority_events','private.ownership_transfers','private.authority_invitation_stamp'] loop
  if not (select relrowsecurity from pg_class where oid=table_name::regclass) then raise exception 'RLS_DISABLED';end if;
  foreach role_name in array array['anon','authenticated','service_role'] loop
   if has_table_privilege(role_name,table_name,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then raise exception 'PRIVATE_TABLE_OPEN';end if;
  end loop;
 end loop;
 foreach signature in array array['private.authority_lock(uuid)','private.authority_owner(uuid,uuid)','private.authority_assert(uuid,uuid,text,boolean)','private.authority_assert_room(uuid,uuid)','private.authority_invariant()','private.authority_no_event_changes()','private.authority_capabilities(uuid,uuid)','private.authority_validate_invitation(uuid)','private.regularize_barbershop_ownership(uuid,uuid,jsonb,text)'] loop
  foreach role_name in array array['anon','authenticated','service_role'] loop
   if has_function_privilege(role_name,signature,'EXECUTE') then raise exception 'PRIVATE_HELPER_OPEN';end if;
  end loop;
 end loop;
 if (select count(*) from pg_trigger where not tgisinternal and tgenabled='O' and tgname in('authority_membership_invariant','authority_ownership_invariant','authority_event_append_only'))<>3 then raise exception 'TRIGGER_CONTRACT_CHANGED';end if;
 if (select count(*) from pg_trigger where tgname in('authority_membership_invariant','authority_ownership_invariant') and tgdeferrable and tginitdeferred)<>2 then raise exception 'DEFERRED_INVARIANT_CHANGED';end if;
 if has_function_privilege('service_role','public.confirm_booking(uuid,jsonb)','EXECUTE') or has_function_privilege('service_role','private.reservation_confirm(uuid,jsonb)','EXECUTE') then raise exception 'LEGACY_CONFIRMATION_OPEN';end if;
 if has_function_privilege('service_role','private.regularize_barbershop_ownership(uuid,uuid,jsonb,text)','EXECUTE') or has_function_privilege('authenticated','public.team_authority_command(uuid,text,jsonb)','EXECUTE') or has_function_privilege('anon','public.team_authority_command(uuid,text,jsonb)','EXECUTE') or not has_function_privilege('service_role','public.team_authority_command(uuid,text,jsonb)','EXECUTE') then raise exception 'AUTHORITY_RPC_PERMISSIONS_CHANGED';end if;
end;$verify$;
-- History is in THIS transaction: do not run CLI repair in a separate connection.
insert into supabase_migrations.schema_migrations(version,statements,name)
values('20261120010538',array(select jsonb_array_elements_text(${json(parts)})),'team_authority');
do $history$ begin
 if ${hashSql('supabase_migrations.schema_migrations', "where version<>'20261120010538'")}<>${quote(p.historySha256)} then raise exception 'history rows changed';end if;
 if (select count(*) from supabase_migrations.schema_migrations)<>17 then raise exception 'HISTORY_COUNT_CHANGED';end if;
end;$history$;
-- Only a later explicitly authorized operator may replace this terminal action.
rollback;
`;
  return {
    sql,
    sourceSha256: sourceHash,
    migrationBodySha256: sha(body),
    databaseExecuted: false,
    terminalAction: 'ROLLBACK',
    proposedOwners: 8,
    newSettings: 1,
    authorityEvents: 8,
    historyRowsAdded: 1,
  };
}
