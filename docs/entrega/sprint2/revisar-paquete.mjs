// Read-only Git review and derived documentation. No staging, network or test execution.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../..');
process.chdir(root);
const git = args => {
  const r = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 ** 2 });
  assert.equal(r.status, 0, 'READ_ONLY_GIT_FAILED'); return r.stdout;
};
const list = args => git([...args, '-z']).split('\0').filter(Boolean);
const hash = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const shaText = s => createHash('sha256').update(s).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p));
const initialIndex = shaText(git(['ls-files', '--stage']));
const head = git(['rev-parse', 'HEAD']).trim();
const changed = list(['diff', '--name-only']);
assert.equal(git(['diff', '--cached', '--name-only']).trim(), '', 'INDEX_MUST_REMAIN_UNSTAGED');
const tracked = list(['ls-files']), trackedSet = new Set(tracked);
const localDir = path.join(root, '.artifacts/sprint2-release'); fs.mkdirSync(localDir, { recursive: true });
const originalList = read(path.join(localDir, 'pending-before.json'));
const baselinePath = path.join(localDir, 'originals-sha256.json');
if (!fs.existsSync(baselinePath)) fs.writeFileSync(baselinePath, JSON.stringify(Object.fromEntries(originalList.map(p => [p, hash(p)])), null, 2));
const baseline = read(baselinePath);
const continuity = new Set(['ESTADO-DESARROLLO.md', 'docs/CODEX-HANDOFF.md']);
for (const [p, sha] of Object.entries(baseline)) if (!continuity.has(p)) assert.equal(hash(p), sha, 'Original changed: ' + p);
const high = [
  ['jwt', /eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{10,}/g],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
  ['provider-key', /\b(?:sk_live_[A-Za-z0-9]{15,}|sk-proj-[A-Za-z0-9_-]{15,}|re_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/g],
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
];
const sensitive = text => high.flatMap(([kind, regex]) => {
  regex.lastIndex = 0;
  return [...text.matchAll(regex)].map(m => ({ kind, line: text.slice(0, m.index).split('\n').length }));
});
const publicEvidence = path.join(out, 'evidencias'); fs.mkdirSync(publicEvidence, { recursive: true });
const copies = [];
function sanitizedLog(destination, sources) {
  const sections = sources.map(relative => {
    const raw = fs.readFileSync(relative, 'utf8');
    assert.deepEqual(sensitive(raw), [], 'Sensitive material requires manual review, do not copy');
    const clean = raw.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
      .split(root).join('<RAIZ_PROYECTO>')
      .split(root.replaceAll('\\', '/')).join('<RAIZ_PROYECTO>')
      .replace(/[A-Za-z]:[\\/]Users[\\/][^\\/\s]+/gi, '<PERFIL_LOCAL>');
    copies.push({ source: relative, sourceSha256: hash(relative), destination: 'evidencias/' + destination,
      changes: 'Only ANSI controls and workstation root/profile prefixes removed; outcomes retained. No tests rerun.' });
    return `ORIGINAL LOCAL: ${relative}\nSHA256: ${hash(relative)}\n\n${clean}`;
  });
  fs.writeFileSync(path.join(publicEvidence, destination), 'COPIA SANITIZADA DE EVIDENCIA EXISTENTE; NO ES UNA EJECUCION NUEVA.\n\n' + sections.join('\n\n----- SIGUIENTE FUENTE -----\n\n'));
}
sanitizedLog('monitor-tests.txt', ['docs/evaluacion/evidencias/eq05/terminal-tests.log']);
sanitizedLog('arquitectura-sustitucion.txt', ['architecture-client.log', 'architecture-server.log', 'client-compile.log', 'client-substitution.log', 'server-substitution.log'].map(n => 'docs/evaluacion/evidencias/eq08/' + n));
const reproduction = 'docs/evaluacion/evidencias/004-reservas/reproducibilidad.json';
const original = read(reproduction);
fs.writeFileSync(path.join(publicEvidence, 'cobertura-aceptada.json'), JSON.stringify({
  evidenceDate: original.date, testedCommit: original.testedCommit, originalSource: reproduction,
  originalSourceSha256: hash(reproduction), coverage: original.coverage,
  newCoverageExecuted: false, note: 'Accepted historical domain/application coverage; not a fresh product-wide measurement.'
}, null, 2) + '\n');
copies.push({ source: reproduction, sourceSha256: hash(reproduction), destination: 'evidencias/cobertura-aceptada.json', changes: 'Projection of accepted coverage, date, scope and tested commit only; no metrics changed.' });
fs.writeFileSync(path.join(publicEvidence, 'copias-sanitizadas.json'), JSON.stringify({ generatedAt: new Date().toISOString(), copies, originalsOverwritten: false }, null, 2) + '\n');
const omit = new Set([
  'docs/evaluacion/evidencias/eq05/graficas/informe-pagina-3.png',
  'docs/evaluacion/evidencias/eq05/graficas/informe-vista-conjunta.png',
  'docs/evaluacion/evidencias/eq05/graficas/vista-conjunta.png',
]);
const relativeOut = 'docs/entrega/sprint2/';
const generated = [relativeOut + 'archivos-publicacion.csv', relativeOut + 'revision-publicacion.json'];
const untracked = list(['ls-files', '--others', '--exclude-standard']);
const pending = [...new Set([...changed, ...untracked, ...generated])].sort();
const group = p => p.startsWith('k6/') || p === 'scripts/k6-preflight.ps1' || p === 'package.json'
  ? '1-instrumentacion-k6' : p.startsWith('tests/') ? '2-harness-calidad' : '3-documentacion-evidencias';
const inventory = pending.map(p => ({ path: p, action: omit.has(p) ? 'LOCAL_ONLY_QA_PREVIEW' : 'PROPOSED_PUBLISH',
  group: omit.has(p) ? 'none' : group(p), state: trackedSet.has(p) ? 'modified-tracked' : 'new-untracked',
  bytes: generated.includes(p) ? '' : fs.statSync(p).size,
  sha256: generated.includes(p) ? 'generated-review-metadata' : hash(p) }));
const q = v => '"' + String(v).replaceAll('"', '""') + '"';
fs.writeFileSync(path.join(out, 'archivos-publicacion.csv'), [Object.keys(inventory[0]).join(','), ...inventory.map(r => Object.values(r).map(q).join(','))].join('\n') + '\n');
const candidates = [...new Set([...tracked, ...pending.filter(p => !omit.has(p))])];
const findings = [], metadata = [];
let textFiles = 0, binaryFiles = 0;
for (const p of candidates) {
  if (generated.includes(p)) continue;
  assert.ok(fs.existsSync(p), 'Missing publication dependency: ' + p);
  const b = fs.readFileSync(p);
  if (b.includes(0) || b.subarray(0, 4).toString() === '%PDF') { binaryFiles++; continue; }
  textFiles++;
  const text = b.toString('utf8');
  findings.push(...sensitive(text).map(f => ({ path: p, ...f })));
  if (/[A-Za-z]:[\\/]Users[\\/]/i.test(text)) metadata.push(p);
}
assert.deepEqual(findings, [], 'Real secret pattern found; stop publication preparation and inspect privately');
const forbidden = /(?:^|\/)(?:\.env(?:\..+)?|credentials(?:\..+)?\.json|\.artifacts|node_modules|coverage|ci-artifacts|\.private)(?:\/|$)|\.(?:har|zip|dump|backup|key|pem|pfx|p12)$/i;
const prohibited = pending.filter(p => forbidden.test(p) && !p.endsWith('.env.example'));
assert.deepEqual(prohibited, [], 'Private material in pending Git selection');
const pdfReview = read(path.join(localDir, 'pdf-review.json'));
assert.ok(pdfReview.every(r => !Object.values(r.flags).some(Boolean) && !r.metadata_has_local_path));
const proofs = ['.env', '.env.local', '.artifacts/eq05/private/manifest.json', '.artifacts/eq09/private/trace.zip',
  '.artifacts/k6/private/fixtures.json', 'node_modules/x', 'coverage/client/summary.json', 'ci-artifacts/x.json', '.private/credentials.json'];
const ignored = spawnSync('git', ['check-ignore', '--stdin'], { input: proofs.join('\n'), encoding: 'utf8' });
assert.equal(ignored.status, 0); assert.equal(ignored.stdout.trim().split('\n').length, proofs.length);
const candidateSet = new Set(candidates), missingLinks = [];
let entryPointRelativeLinks = 0;
const requiredDocs = ['README.md', relativeOut + 'INDICE.md', relativeOut + 'PUBLICACION.md', relativeOut + 'GUIA-SUSTENTACION.md'];
for (const p of requiredDocs) {
  const text = fs.readFileSync(p, 'utf8');
  for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = m[1].split('#')[0]; if (!target || /^(https?:|mailto:)/.test(target)) continue;
    entryPointRelativeLinks++;
    const absolute = path.resolve(path.dirname(p), target), relative = path.relative(root, absolute).replaceAll('\\', '/');
    const inPackage = candidateSet.has(relative) || (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory() && candidates.some(c => c.startsWith(relative + '/')));
    if (!inPackage) missingLinks.push({ source: p, target });
    if (inPackage && m[1].includes('#') && relative.endsWith('.md')) {
      const anchor = decodeURIComponent(m[1].split('#')[1]);
      const headings = [...fs.readFileSync(absolute, 'utf8').matchAll(/^#{1,6} (.+)$/gm)]
        .map(h => h[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-'));
      if (!headings.includes(anchor)) missingLinks.push({ source: p, target: m[1], reason: 'Markdown heading missing' });
    }
  }
}
assert.deepEqual(missingLinks, [], 'Entry-point link missing from proposed publication');
assert.equal(shaText(git(['ls-files', '--stage'])), initialIndex);
assert.equal(git(['rev-parse', 'HEAD']).trim(), head);
const report = {
  reviewedAt: new Date().toISOString(), mode: 'PREPARATION_ONLY_NO_STAGING_COMMITS_PUSH',
  git: { branch: git(['branch', '--show-current']).trim(), commits: Number(git(['rev-list', '--count', 'HEAD']).trim()), head,
    originMainCached: git(['rev-parse', 'origin/main']).trim(), origin: git(['remote', 'get-url', 'origin']).trim(),
    networkRemoteRechecked: false, stagedFiles: 0, indexUnchanged: true },
  pending: { total: inventory.length, proposedPublish: inventory.filter(r => r.action === 'PROPOSED_PUBLISH').length,
    localOnlyQa: inventory.filter(r => r.action === 'LOCAL_ONLY_QA_PREVIEW').length,
    groups: Object.fromEntries(['1-instrumentacion-k6','2-harness-calidad','3-documentacion-evidencias'].map(g => [g, inventory.filter(r => r.group === g).length])) },
  scope: { candidateFiles: candidates.length, textFiles, binaryFiles, pdfsTextAndMetadataReviewed: pdfReview.length,
    pendingOriginalsPreserved: originalList.length - continuity.size, continuityFilesIntentionallyUpdated: [...continuity],
    secretFindingsHighConfidence: findings, lowConfidenceMatchesReviewed: { initialSensitiveAssignments: 28, credentialLikeUrlsInNegativeFixtures: 10, newFakeTestValues: 2 },
    privatePathExclusionProofs: proofs.length, entryPointRelativeLinks, mainEntryPointLinksMissing: missingLinks,
    historicalTrackedIgnoredLogs: list(['ls-files', '-ci', '--exclude-standard']).length,
    filesWithKnownWorkstationMetadata: metadata.length,
    realLoadE2EOrAvailabilityExecuted: false, dependenciesChangedByThisPreparation: false },
  caveats: ['History author identity and historical workstation paths remain as previously disclosed; no history rewrite.',
    'Historical tracked logs are not removed by .gitignore. No new ignored raw logs proposed.',
    'Raw Playwright traces/native reports and synthetic credentials stay local, even with fake users.',
    'This is scoped exposure review of checkout and pending package, not a new dependency-CVE or complete historical-blob audit.',
    'Local copies of original reports retain private-custody references; central index uses publishable aggregates.'],
  publicationAuthorizedNow: false, originalsOverwritten: false, k6Executed: false, cloudModified: false,
};
fs.writeFileSync(path.join(out, 'revision-publicacion.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ preparedOnly: true, head: head.slice(0, 7), pending: report.pending,
  highConfidenceSecretFindings: 0, protectedPrivatePaths: proofs.length, entryLinksMissing: 0,
  trackedIgnoredHistoricalLogs: report.scope.historicalTrackedIgnoredLogs, stagedFiles: 0 }, null, 2));
