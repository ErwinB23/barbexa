// Reconcile existing evidence only: no SQL, HTTP, monitoring or cleanup execution.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { protocol, summarizeIntervals } from '../../../../tests/availability/eq05-policy.mjs';
const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../../..');
const read = p => JSON.parse(fs.readFileSync(p));
const lines = p => fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const digest = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const runId = '8dd877ab-4d18-4213-928d-e9217e39f7da';
const partialId = '0bcde763-0e44-41dd-ba75-798c943d0dd3';
const base = path.join(root, '.artifacts/eq05');
const dir = path.join(base, runId), partial = path.join(base, partialId);
assert.equal(read(read(path.join(base, 'current.json')).manifest).id, runId);
const m = read(path.join(dir, 'manifest.json'));
assert.equal(fs.existsSync(path.join(dir, 'monitor.lock')), false);
assert.deepEqual(m.protocol, protocol);
const rows = lines(path.join(dir, 'intervals.jsonl'));
const ledger = lines(path.join(dir, 'write-ledger.jsonl'));
const summary = summarizeIntervals(rows), recorded = read(path.join(dir, 'window-summary.json'));
const manual = read(path.join(dir, 'manual-result.json'));
const audit = read(path.join(dir, 'post-window-audit.json'));
const integrity = read(path.join(dir, 'integridad-sanitizada.json'));
assert.deepEqual(read(path.join(out, 'integridad.json')), integrity);
for (const key of Object.keys(summary)) {
  assert.deepEqual(recorded[key], summary[key], key);
  assert.deepEqual(manual[key], summary[key], key);
  assert.deepEqual(audit.summary[key], summary[key], key);
}
assert.equal(rows.length, 360); assert.equal(summary.available, 360);
assert.equal(summary.unavailable, 0); assert.equal(summary.noData, 0);
assert.equal(recorded.stopReason, null); assert.ok(recorded.elapsedMs >= protocol.durationMs);
assert.equal(manual.approvedWholeHour, true); assert.equal(manual.integrityVerified, true);
assert.ok(Date.parse(recorded.finish) - Date.parse(recorded.start) >= protocol.durationMs);
const expected = ['auth', 'catalog', 'slots', 'reservations', 'confirm', 'verify-persistence', 'cleanup-cancel', 'verify-cleanup'];
const requests = new Set(), reservationIds = new Set();
for (const row of rows) {
  assert.equal(row.status, 'available'); assert.ok(row.lateMs >= 0 && row.lateMs <= protocol.lateToleranceMs);
  assert.ok(row.durationMs <= protocol.flowTimeoutMs); assert.ok(row.created && row.cleanupConfirmed);
  assert.deepEqual(row.steps.map(s => s.step), expected);
  for (const step of row.steps) {
    assert.equal(step.status, step.step === 'confirm' ? 201 : 200);
    assert.ok(!step.error && step.ms > 0 && step.ms <= protocol.requestTimeoutMs);
  }
  assert.ok(!requests.has(row.requestId)); requests.add(row.requestId);
  assert.ok(!reservationIds.has(row.reservationId)); reservationIds.add(row.reservationId);
  const plans = ledger.filter(l => l.index === row.index);
  assert.equal(plans.length, 1); assert.equal(plans[0].requestId, row.requestId);
  assert.equal(plans[0].cancelRequestId, row.cancelRequestId);
  const persisted = audit.reservations.filter(r => r.requestId === row.requestId);
  assert.equal(persisted.length, 1); assert.equal(persisted[0].id, row.reservationId);
}
assert.equal(ledger.length, 361); assert.equal(ledger.filter(l => l.index === -1).length, 1);
assert.equal(audit.reservations.length, 361); assert.equal(integrity.priorReservations, 19110);
assert.equal(integrity.measuredPersisted, 360); assert.equal(integrity.activeOwnReservations, 0);
assert.equal(audit.cleanupLog.length, 0);
for (const r of audit.reservations) {
  assert.equal(r.state, 'cancelled');
  for (const k of ['itemCount', 'confirmEvents', 'cancelEvents', 'careCount']) assert.equal(r[k], 1);
}
assert.equal(audit.tables.length, 18); assert.ok(audit.tables.every(t => t.priorRowsPreserved));
assert.equal(audit.integrity.reservations, 19471);
for (const k of ['overlaps', 'tenantMismatch', 'duplicateRequests', 'partialReservations', 'duplicateReceipts']) assert.equal(audit.integrity[k], 0);
const p = read(path.join(partial, 'window-summary.json'));
assert.equal(p.available, 128); assert.equal(p.unavailable, 0); assert.equal(p.noData, 232);
assert.equal(p.fullCoverage, false); assert.equal(m.predecessor, partialId);
const original = read(path.join(out, 'manual-readiness.json')).originalArtifactsSha256;
for (const [name, sha] of Object.entries(original)) assert.equal(digest(path.join(partial, name)), sha, name);
for (const [relative, sha] of Object.entries(m.protectedFiles)) assert.equal(digest(path.join(root, relative)), sha, relative);
const previous = read(path.join(root, 'docs/evaluacion/evidencias/004-reservas/k6-mixta-final/preservacion-sha256.json'));
for (const [relative, sha] of Object.entries(previous)) assert.equal(digest(path.join(root, relative)), sha, relative);
const sources = read(path.join(dir, 'active-source-hashes.json'));
for (const [relative, sha] of Object.entries(sources.sha256)) assert.equal(digest(path.join(dir, 'monitor-source', path.basename(relative))), sha, relative);
// Snapshot both complete and partial private artifacts without publishing their contents.
const hashes = {};
function inventory(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) inventory(file);
    else hashes[path.relative(root, file).replaceAll('\\', '/')] = digest(file);
  }
}
inventory(dir); inventory(partial);
fs.writeFileSync(path.join(out, 'preservacion-sha256.json'), JSON.stringify(hashes, null, 2) + '\n');
const report = { auditedAt: new Date().toISOString(), runId, originalArtifacts: Object.keys(hashes).length,
  storedAuditVerifiedOffline: true, newSqlOrHttpExecuted: false, partialKeptSeparate: { runId: partialId, available: 128, unavailable: 0, noData: 232, fullCoverage: false },
  summary, measuredHttpRequests: rows.reduce((n, r) => n + r.steps.length, 0),
  actualElapsedMs: recorded.elapsedMs, scheduledIntervalMs: protocol.intervalMs,
  ownReservations: 361, measuredPersisted: 360, preflightPersisted: 1, totalReservations: 19471,
  activeOwnReservations: 0, priorTablesPreserved: 18, protectedFiles: Object.keys(m.protectedFiles).length,
  historicalHashesVerified: Object.keys(previous).length, measuredSourcesArchivedAndVerified: Object.keys(sources.sha256).length,
  originalMonthlyAvailabilityAccredited: false, k6Executed: false, productModified: false };
fs.writeFileSync(path.join(out, 'auditoria-offline.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
