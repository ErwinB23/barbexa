import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { protocol } from './eq05-policy.mjs';

export function manualAction(manifest, locked, summary) {
  if (locked) throw Error('ACTIVE_MONITOR_DO_NOT_START_ANOTHER');
  if (manifest?.windowStartedAt && !manifest.windowFinishedAt)
    throw Error('UNFINISHED_OBSERVATION_REQUIRES_CONTROLLED_RECONCILIATION');
  if (!manifest?.windowFinishedAt) return 'prepare';
  if (!summary) throw Error('FINISHED_WINDOW_SUMMARY_MISSING');
  return summary.fullCoverage && summary.elapsedMs >= protocol.durationMs
    ? 'finished'
    : 'successor';
}

export function createSuccessor(base, previous, audit) {
  if (
    !previous.windowFinishedAt ||
    !audit?.integrity ||
    !Array.isArray(audit.reservations) ||
    audit.reservations.some((r) => r.state !== 'cancelled')
  )
    throw Error('AUDIT_AND_EXCLUSIVE_CLEANUP_REQUIRED');
  for (const key of [
    'overlaps',
    'tenantMismatch',
    'duplicateRequests',
    'partialReservations',
    'duplicateReceipts',
  ])
    if (audit.integrity[key] !== 0) throw Error('AUDIT_INTEGRITY_FAILED');
  const id = randomUUID(),
    dir = path.join(base, id);
  fs.mkdirSync(dir, { recursive: false });
  const next = {
    id,
    dir,
    marker: previous.marker,
    accounts: [],
    protocol,
    predecessor: previous.id,
  };
  const manifest = path.join(dir, 'manifest.json');
  fs.writeFileSync(manifest, JSON.stringify(next, null, 2) + '\n', {
    flag: 'wx',
  });
  fs.writeFileSync(
    path.join(previous.dir, 'manual-transition.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        successor: id,
        reason:
          'User requested a new uninterrupted manual one-hour window; previous evidence preserved.',
      },
      null,
      2,
    ) + '\n',
    { flag: 'wx' },
  );
  const temporary = path.join(base, 'current.' + id + '.tmp');
  fs.writeFileSync(temporary, JSON.stringify({ manifest }, null, 2) + '\n', {
    flag: 'wx',
  });
  fs.renameSync(temporary, path.join(base, 'current.json'));
  return next;
}

export function progressLine(p) {
  const seconds = Math.max(0, Math.floor(p.elapsedSeconds || 0));
  const elapsed = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return `EQ-05 | sondeos=${p.processed}/360 | exitosos=${p.available} | fallidos=${p.unavailable} | sin datos=${p.noData} | tiempo=${elapsed}/60:00`;
}
