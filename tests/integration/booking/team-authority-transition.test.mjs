import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import {
  prepareTeamAuthorityTransition,
  splitTransitionStatements,
} from '../../../scripts/prepare-team-authority-transition.mjs';

const migration = fs.readFileSync(
  'supabase/migrations/20261120010538_team_authority.sql',
  'utf8',
);
const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
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
function proposal() {
  const proposals = Array.from({ length: 8 }, (_, i) => ({
    shopId: uuid(100 + i),
    name: `Synthetic ${i}`,
    ownerUserId: uuid(i + 1),
    members: [{ userId: uuid(i + 1), role: 'administrator', status: 'active' }],
    secondaryUserIds: [],
    settingsMissing: i === 7,
  }));
  proposals[6].members.push({
    userId: uuid(50),
    role: 'administrator',
    status: 'active',
  });
  proposals[6].secondaryUserIds.push(uuid(50));
  return {
    approval: 'PROPOSED_NOT_AUTHORIZED_FOR_EXECUTION',
    project: 'app-barberia-002-local',
    host: '127.0.0.1',
    port: 54422,
    database: 'postgres',
    systemIdentifier: '7707120127111426080',
    migrationVersion: '20261120010538',
    historyVersions: Array.from(
      { length: 16 },
      (_, i) => `202611${String(i + 1).padStart(8, '0')}`,
    ),
    historySha256: 'b'.repeat(64),
    fingerprints: Object.fromEntries(tables.map((t) => [t, 'a'.repeat(64)])),
    protectedPendingInvitations: [
      {
        id: uuid(900),
        shopId: uuid(100),
        sender: uuid(1),
        recipient: uuid(99),
      },
    ],
    proposals,
  };
}

test('SQL splitter keeps function bodies, quoted semicolons and nested comments intact', () => {
  const source =
    "begin; /* outer /* ; */ */ create function x() returns void as $f$begin perform ';'; end;$f$ language plpgsql; select 'it''s;safe'; commit;\n";
  const parts = splitTransitionStatements(source);
  assert.equal(parts.length, 4);
  assert.equal(parts.join(''), source);
});
test('preparation has one transaction and defaults exclusively to rollback', () => {
  const result = prepareTeamAuthorityTransition({
    proposal: proposal(),
    migration,
  });
  const top = splitTransitionStatements(result.sql).map((s) =>
    s.replace(/^\s*--[^\n]*$/gm, ''),
  );
  assert.match(top[0], /begin isolation level read committed/i);
  assert.match(top.at(-1), /^\s*rollback;\s*$/i);
  assert.equal(top.filter((s) => /^\s*commit;\s*$/i.test(s)).length, 0);
  assert.equal(result.databaseExecuted, false);
  assert.ok(
    result.sql.indexOf('TARGET_CHANGED') < result.sql.indexOf('lock table'),
  );
});
test('regularizes all eight before constraints and history inside the same transaction', () => {
  const { sql } = prepareTeamAuthorityTransition({
    proposal: proposal(),
    migration,
  });
  const calls = [
    ...sql.matchAll(/select private\.regularize_barbershop_ownership\(/g),
  ];
  assert.equal(calls.length, 8);
  assert.ok(sql.indexOf('set constraints all immediate') > calls.at(-1).index);
  assert.ok(
    sql.indexOf('insert into supabase_migrations.schema_migrations') >
      calls.at(-1).index,
  );
  assert.match(sql, /history rows changed/i);
});
test('conserves baseline, validates pending invitation, default settings and contextual capabilities', () => {
  const { sql } = prepareTeamAuthorityTransition({
    proposal: proposal(),
    migration,
  });
  for (const marker of [
    'BASELINE_CHANGED',
    'MEMBERSHIP_SNAPSHOT_CHANGED',
    'INVITATION_CHANGED',
    'UNEXPECTED_SETTINGS',
    'CAPABILITY_MISMATCH',
    'UNEXPECTED_AUTHORITY_EVENTS',
    'LEGACY_CONFIRMATION_OPEN',
  ])
    assert.ok(sql.includes(marker), marker);
});
test('preserves source migration byte hash and stores original statements without executing outer commits', () => {
  const result = prepareTeamAuthorityTransition({
    proposal: proposal(),
    migration,
  });
  assert.equal(
    result.sourceSha256,
    '6F581F7C0EA2B6E6DC9C518A6CDF7252AE9816DC7CA7A21F4A0E3CE44B1D1B42',
  );
  assert.throws(
    () =>
      prepareTeamAuthorityTransition({
        proposal: proposal(),
        migration: migration + '\nselect 1;',
      }),
    /SOURCE_HASH/,
  );
});
test('rejects Cloud, wrong local endpoint, database and any executable commit mode', () => {
  for (const delta of [
    { host: 'db.cloud.invalid' },
    { port: 54322 },
    { project: 'other' },
    { database: 'other' },
  ])
    assert.throws(
      () =>
        prepareTeamAuthorityTransition({
          proposal: { ...proposal(), ...delta },
          migration,
        }),
      /TARGET/,
    );
  assert.throws(
    () =>
      prepareTeamAuthorityTransition({
        proposal: proposal(),
        migration,
        mode: 'commit',
      }),
    /PREPARATION_ONLY/,
  );
});
test('rejects missing/duplicate shops and owners without active administrator membership', () => {
  const missing = proposal();
  missing.proposals.pop();
  assert.throws(
    () => prepareTeamAuthorityTransition({ proposal: missing, migration }),
    /MAP/,
  );
  const duplicate = proposal();
  duplicate.proposals[1].shopId = duplicate.proposals[0].shopId;
  assert.throws(
    () => prepareTeamAuthorityTransition({ proposal: duplicate, migration }),
    /MAP/,
  );
  const inactive = proposal();
  inactive.proposals[0].members[0].status = 'inactive';
  assert.throws(
    () => prepareTeamAuthorityTransition({ proposal: inactive, migration }),
    /OWNER/,
  );
});
test('rejects third secondary, incomplete fingerprints and changed history length', () => {
  const excess = proposal();
  excess.proposals[0].members.push(
    ...[30, 31, 32].map((n) => ({
      userId: uuid(n),
      role: 'administrator',
      status: 'active',
    })),
  );
  assert.throws(
    () => prepareTeamAuthorityTransition({ proposal: excess, migration }),
    /SECONDARY/,
  );
  const partial = proposal();
  delete partial.fingerprints['auth.users'];
  assert.throws(
    () => prepareTeamAuthorityTransition({ proposal: partial, migration }),
    /BASELINE/,
  );
  const history = proposal();
  history.historyVersions.push('20261120010538');
  assert.throws(
    () => prepareTeamAuthorityTransition({ proposal: history, migration }),
    /HISTORY/,
  );
});
test('names containing quotes and semicolons remain data and cannot add a commit', () => {
  const p = proposal();
  p.proposals[0].name = "Name'; COMMIT; --";
  const { sql } = prepareTeamAuthorityTransition({ proposal: p, migration });
  const top = splitTransitionStatements(sql).map((s) =>
    s.replace(/^\s*--[^\n]*$/gm, ''),
  );
  assert.ok(!top.some((s) => /^\s*commit;\s*$/i.test(s)));
  assert.match(top.at(-1), /^\s*rollback;\s*$/i);
});
