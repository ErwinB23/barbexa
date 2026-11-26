import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  manualAction,
  createSuccessor,
  progressLine,
} from './eq05-manual-policy.mjs';
import { protocol } from './eq05-policy.mjs';

test('an active or crashed unfinished observation is never restarted or silently continued', () => {
  assert.throws(
    () => manualAction({ windowStartedAt: 'start' }, false),
    /UNFINISHED/,
  );
  assert.throws(() => manualAction({ prepared: true }, true), /ACTIVE/);
  assert.equal(manualAction({ prepared: true }, false), 'prepare');
  assert.equal(manualAction(null, false), 'prepare');
});

test('a completed observation is not repeated; an interrupted window needs an audited new run', () => {
  const finished = { windowStartedAt: 'start', windowFinishedAt: 'end' };
  const complete = { fullCoverage: true, elapsedMs: protocol.durationMs };
  assert.equal(manualAction(finished, false, complete), 'finished');
  assert.equal(
    manualAction(finished, false, { ...complete, fullCoverage: false }),
    'successor',
  );
  assert.throws(() => createSuccessor('unused', finished, null), /AUDIT/);
});

test('a successor preserves every previous artifact, isolates credentials, and updates only the pointer', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'barbexa-eq05-manual-'));
  try {
    const oldDir = path.join(base, 'previous');
    fs.mkdirSync(oldDir);
    const previous = {
      id: 'previous',
      dir: oldDir,
      marker: 'synthetic-marker',
      accounts: [{ password: 'private' }],
      windowFinishedAt: 'end',
    };
    const raw = Buffer.from('original partial evidence\n');
    fs.writeFileSync(path.join(oldDir, 'intervals.jsonl'), raw);
    const next = createSuccessor(base, previous, {
      integrity: {
        overlaps: 0,
        tenantMismatch: 0,
        duplicateRequests: 0,
        partialReservations: 0,
        duplicateReceipts: 0,
      },
      reservations: [{ state: 'cancelled' }],
    });
    assert.notEqual(next.id, previous.id);
    assert.deepEqual(next.accounts, []);
    assert.equal(next.predecessor, previous.id);
    assert.deepEqual(next.protocol, protocol);
    assert.equal(JSON.stringify(next).includes('private'), false);
    assert.deepEqual(
      fs.readFileSync(path.join(oldDir, 'intervals.jsonl')),
      raw,
    );
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(base, 'current.json'))).manifest,
      path.join(next.dir, 'manifest.json'),
    );
    assert.equal(
      fs.existsSync(path.join(oldDir, 'manual-transition.json')),
      true,
    );
    assert.throws(
      () =>
        createSuccessor(base, previous, {
          reservations: [{ state: 'confirmed' }],
        }),
      /AUDIT/,
    );
  } finally {
    fs.rmSync(base, { recursive: true });
  }
});

test('terminal progress includes completed, passed, failed, unknown and elapsed time without exposing a session', () => {
  const text = progressLine({
    processed: 12,
    available: 10,
    unavailable: 1,
    noData: 1,
    elapsedSeconds: 125,
  });
  assert.match(text, /12\/360/);
  assert.match(text, /exitosos=10/);
  assert.match(text, /fallidos=1/);
  assert.match(text, /sin datos=1/);
  assert.match(text, /02:05\/60:00/);
});
