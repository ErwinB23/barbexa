import fs from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { profile, segmentResults, types } from './profiles.mjs';
export const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export function campaignDir(root, id) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw Error('INVALID_CAMPAIGN_ID');
  return path.join(root, '.artifacts/k6/campaigns', id);
}
export function initialize(root) {
  const base = path.join(root, '.artifacts/k6');
  fs.mkdirSync(path.join(base, 'campaigns'), { recursive: true });
  const index = path.join(base, 'campaigns/preliminary-index.json');
  if (!fs.existsSync(index)) {
    const source = path.join(base, 'runs'),
      target = path.join(base, 'campaigns/preliminary');
    const files = [];
    function copy(dir, rel = '') {
      for (const name of fs.readdirSync(dir)) {
        const src = path.join(dir, name),
          r = path.join(rel, name);
        if (fs.lstatSync(src).isSymbolicLink())
          throw Error('NO_SYMLINK_ARCHIVE');
        if (fs.statSync(src).isDirectory()) copy(src, r);
        else {
          const dest = path.join(target, r);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
          const hash = (b) => createHash('sha256').update(b).digest('hex');
          const sha = hash(fs.readFileSync(src));
          if (hash(fs.readFileSync(dest)) !== sha)
            throw Error('ARCHIVE_HASH_MISMATCH');
          files.push({ path: r, sha256: sha });
        }
      }
    }
    if (fs.existsSync(source)) copy(source);
    fs.writeFileSync(
      index,
      JSON.stringify(
        {
          classification: 'preliminary',
          source: 'runs',
          preservedOriginals: true,
          files,
        },
        null,
        2,
      ),
    );
  }
  const pointer = path.join(base, 'active-campaign.json');
  if (fs.existsSync(pointer)) return read(pointer);
  const fixture = read(path.join(base, 'supabase-lab/fixture-manifest.json'));
  const value = {
    id: randomUUID(),
    fixtureRunId: fixture.runId,
    createdAt: new Date().toISOString(),
    status: 'prepared-no-load-executed',
  };
  const dir = campaignDir(root, value.id);
  fs.mkdirSync(dir);
  fs.writeFileSync(
    path.join(dir, 'campaign.json'),
    JSON.stringify(value, null, 2),
  );
  fs.writeFileSync(pointer, JSON.stringify(value, null, 2));
  return value;
}
export function consolidate(root, campaign) {
  const dir = campaignDir(root, campaign.id),
    attempts = [];
  for (const type of types) {
    const base = path.join(dir, type);
    if (!fs.existsSync(base)) continue;
    for (const id of fs.readdirSync(base)) {
      const d = path.join(base, id);
      try {
        const result = read(path.join(d, 'result.json')),
          summary = read(path.join(d, 'summary.json')),
          permit = read(path.join(d, 'permit.json'));
        if (
          result.campaign !== campaign.id ||
          permit.runId !== campaign.fixtureRunId
        )
          continue;
        const p = profile(type, result.peak || 0),
          segments = segmentResults(
            p,
            summary.metrics,
            result.exit === 0 && !result.interrupted,
          );
        const resources = read(path.join(d, 'resources.json'));
        resources.forEach((r, i) => {
          const prev = resources[i - 1];
          if (
            prev &&
            r.at > prev.at &&
            Number.isFinite(r.generator?.CPU) &&
            Number.isFinite(prev.generator?.CPU)
          )
            r.generatorCpuPercentOneCore =
              (100 * (r.generator.CPU - prev.generator.CPU)) /
              ((r.at - prev.at) / 1000);
        });
        const epoch = (
          summary.metrics.scenario_start_epoch?.values ||
          summary.metrics.scenario_start_epoch
        )?.value;
        const toMiB = (text) => {
          const m = /^([\d.]+)(B|KiB|MiB|GiB)/.exec(text || '');
          return m
            ? +m[1] * { B: 1 / 1048576, KiB: 1 / 1024, MiB: 1, GiB: 1024 }[m[2]]
            : null;
        };
        for (const seg of segments) {
          const samples = epoch
            ? resources.filter(
                (r) =>
                  r.at >= epoch + seg.start * 1000 &&
                  r.at < epoch + seg.end * 1000,
              )
            : [];
          const peak = (f) => {
            const v = samples.map(f).filter(Number.isFinite);
            return v.length ? Math.max(...v) : null;
          };
          seg.generatorCpuPeakPercentOneCore = peak(
            (r) => r.generatorCpuPercentOneCore,
          );
          seg.hostCpuPeakPercent = peak((r) => r.cpu);
          seg.hostRamPeakPercent = peak((r) => r.ramPercent);
          seg.generatorPeakMiB = peak(
            (r) => r.generator?.PeakWorkingSet64 / 1048576,
          );
          seg.backendPeakMiB = peak((r) =>
            r.backend?.reduce(
              (sum, c) => sum + (toMiB(c.MemUsage?.split('/')[0]) || 0),
              0,
            ),
          );
          seg.backendCpuPeakPercent = peak((r) =>
            r.backend?.reduce((sum, c) => sum + parseFloat(c.CPUPerc || 0), 0),
          );
          seg.connectionsPeak = peak((r) => r.connections?.active);
          seg.lockWaitsPeak = peak((r) => r.connections?.lockWaits);
        }
        const clean =
          result.after &&
          Object.entries(result.after).every(([k, v]) =>
            k === 'reservations' ? v === result.before.reservations : v === 0,
          );
        const passed =
          result.exit === 0 &&
          !result.interrupted &&
          clean &&
          result.recovered === true;
        let max = 0;
        if (type === 'stress' && clean && result.recovered) {
          for (const s of segments) {
            if (!s.passed) break;
            max = s.level;
          }
        }
        const globalValues = (n) =>
          summary.metrics[n]?.values || summary.metrics[n] || {};
        const latency = globalValues('http_req_duration');
        const totals = {
          level: p.maxVU,
          configuredDurationSeconds: p.durationSeconds,
          generatorWallSeconds: result.generatorWallSeconds ?? null,
          requests: globalValues('http_reqs').count ?? null,
          rps: globalValues('http_reqs').rate ?? null,
          avgMs: latency.avg ?? null,
          p50Ms: latency.med ?? null,
          p95Ms: latency['p(95)'] ?? null,
          p99Ms: latency['p(99)'] ?? null,
          technicalErrorRate:
            globalValues('technical_errors').rate ??
            globalValues('technical_errors').value ??
            null,
          unexpectedRate:
            globalValues('unexpected_results').rate ??
            globalValues('unexpected_results').value ??
            null,
          eofErrors: globalValues('transport_eof_errors').count ?? null,
          responsesWithoutValidation:
            globalValues('responses_without_validation').count ?? null,
          functionalChecks:
            (globalValues('checks').passes ?? 0) +
            (globalValues('checks').fails ?? 0),
        };
        attempts.push({
          type,
          methodology: result.methodology || 'strict-every-request',
          attempt: id,
          finishedAt: result.finishedAt,
          passed,
          exit: result.exit,
          interrupted: result.interrupted,
          recovered: result.recovered,
          maxApprovedVU: max,
          segments,
          totals,
          path: path.relative(root, d),
        });
      } catch {
        /* Partial evidence is preserved but never accredited. */
      }
    }
  }
  const value = {
    campaign: campaign.id,
    attempts,
    stressMaxApprovedVU:
      attempts
        .filter((a) => a.type === 'stress')
        .sort((a, b) => (a.finishedAt || '').localeCompare(b.finishedAt || ''))
        .at(-1)?.maxApprovedVU || 0,
    note: 'Read performance only; no 1000 VU capacity claim without measured passing stages.',
  };
  fs.writeFileSync(
    path.join(dir, 'consolidated.json'),
    JSON.stringify(value, null, 2),
  );
  const rows = attempts.flatMap((a) =>
    a.segments.map((s) => [
      a.type,
      a.attempt,
      s.name,
      s.level,
      s.seconds,
      s.completed,
      s.passed,
      s.requests,
      s.rps,
      s.avgMs,
      s.p50Ms,
      s.p95Ms,
      s.p99Ms,
      s.technicalErrorRate,
      s.unexpectedRate,
      s.generatorCpuPeakPercentOneCore,
      s.hostCpuPeakPercent,
      s.hostRamPeakPercent,
      s.generatorPeakMiB,
      s.backendPeakMiB,
      s.backendCpuPeakPercent,
      s.connectionsPeak,
      s.lockWaitsPeak,
    ]),
  );
  fs.writeFileSync(
    path.join(dir, 'comparison.csv'),
    [
      'type,attempt,segment,vu,steadySeconds,completed,passed,requests,rps,avgMs,p50Ms,p95Ms,p99Ms,technicalErrorRate,unexpectedRate,generatorCpuPeakPercentOneCore,hostCpuPeakPercent,hostRamPeakPercent,generatorPeakMiB,backendPeakMiB,backendCpuPeakPercent,connectionsPeak,lockWaitsPeak',
      ...rows.map((r) => r.map((v) => v ?? '').join(',')),
    ].join('\n') + '\n',
  );
  const totalFields = [
    'eofErrors',
    'responsesWithoutValidation',
    'functionalChecks',
    'level',
    'configuredDurationSeconds',
    'generatorWallSeconds',
    'requests',
    'rps',
    'avgMs',
    'p50Ms',
    'p95Ms',
    'p99Ms',
    'technicalErrorRate',
    'unexpectedRate',
  ];
  fs.writeFileSync(
    path.join(dir, 'comparison-total.csv'),
    [
      'type,attempt,passed,methodology,' + totalFields.join(','),
      ...attempts.map((a) =>
        [
          a.type,
          a.attempt,
          a.passed,
          a.methodology,
          ...totalFields.map((k) => a.totals[k] ?? ''),
        ].join(','),
      ),
    ].join('\n') + '\n',
  );
  return value;
}
