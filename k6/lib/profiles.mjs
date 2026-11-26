export const types = ['smoke', 'load', 'stress', 'spike', 'load-academico'];
export function profile(type, cap = 0) {
  if (!types.includes(type)) throw Error('UNKNOWN_TEST_TYPE');
  if (type === 'smoke')
    return {
      type,
      maxVU: 1,
      durationSeconds: 30,
      recoverySeconds: 60,
      windows: [],
      scenario: {
        executor: 'per-vu-iterations',
        vus: 1,
        iterations: 5,
        maxDuration: '30s',
        gracefulStop: '0s',
      },
    };
  const stages = [],
    windows = [];
  let time = 0;
  const add = (seconds, target, name = null) => {
    stages.push({ duration: `${seconds}s`, target });
    if (name)
      windows.push({
        name,
        level: target,
        start: time,
        end: time + seconds,
        seconds,
      });
    time += seconds;
  };
  let startVUs;
  if (type === 'load' || type === 'load-academico') {
    startVUs = 1;
    for (const [level, seconds] of type === 'load'
      ? [
          [10, 60],
          [25, 60],
          [50, 60],
          [100, 600],
        ]
      : [
          [25, 600],
          [50, 600],
        ]) {
      add(10, level);
      add(seconds, level, `${type}-${level}`);
    }
    add(10, 0);
  } else if (type === 'stress') {
    startVUs = 100;
    for (let level = 100; level <= 1000; level += 100) {
      if (level > 100) add(10, level);
      add(60, level, `stress-${level}`);
    }
    add(10, 0);
  } else {
    if (!Number.isInteger(cap) || cap < 100 || cap > 1000 || cap % 100)
      throw Error('ACCREDITED_STRESS_CAP_REQUIRED');
    startVUs = 10;
    add(30, 10, 'spike-baseline');
    add(5, cap);
    add(30, cap, 'spike-peak');
    add(5, 10);
    add(60, 10, 'spike-recovery');
  }
  return {
    type,
    maxVU: Math.max(...stages.map((s) => s.target)),
    durationSeconds: time,
    recoverySeconds: 120,
    windows,
    scenario: {
      executor: 'ramping-vus',
      startVUs,
      stages,
      gracefulRampDown: '5s',
      gracefulStop: '5s',
    },
  };
}
export function windowAt(p, seconds) {
  return p.windows.find((w) => seconds >= w.start && seconds < w.end) || null;
}
export function metricValues(metrics, name, segment, operation) {
  const entry = Object.entries(metrics).find(([key]) => {
    if (!key.startsWith(name + '{')) return false;
    const tags = Object.fromEntries(
      key
        .slice(key.indexOf('{') + 1, -1)
        .split(',')
        .map((s) => s.trim().split(':')),
    );
    return (
      tags.segment === segment && (!operation || tags.operation === operation)
    );
  });
  return entry ? entry[1].values || entry[1] : null;
}
export function segmentResults(p, metrics, finished = false) {
  return p.windows.map((w) => {
    const http = metricValues(metrics, 'segment_http_ms', w.name);
    const requests = metricValues(metrics, 'segment_requests', w.name)?.count;
    const technical = metricValues(metrics, 'technical_errors', w.name);
    const unexpected = metricValues(metrics, 'unexpected_results', w.name);
    const complete =
      finished ||
      (metricValues(metrics, 'segment_completed', w.name)?.count || 0) > 0;
    const rate = (v) => v?.rate ?? v?.value;
    const passed =
      complete &&
      requests > 0 &&
      rate(technical) < 0.01 &&
      rate(unexpected) === 0 &&
      ['catalog', 'slots'].every((op) => {
        const t = metricValues(metrics, 'operation_wall_ms', w.name, op);
        return (
          t &&
          t['p(95)'] <= (w.level === 10 ? 2000 : 3000) &&
          metricValues(metrics, 'accepted_responses', w.name, op)?.count > 0
        );
      });
    return {
      ...w,
      completed: complete,
      passed,
      requests: requests ?? null,
      rps: requests === undefined ? null : requests / w.seconds,
      avgMs: http?.avg ?? null,
      p50Ms: http?.med ?? null,
      p95Ms: http?.['p(95)'] ?? null,
      p99Ms: http?.['p(99)'] ?? null,
      technicalErrorRate: rate(technical) ?? null,
      unexpectedRate: rate(unexpected) ?? null,
    };
  });
}
