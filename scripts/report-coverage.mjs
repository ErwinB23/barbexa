import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
export function reportCoverage(input, output) {
  const files = fs
    .readFileSync(input, 'utf8')
    .split('end_of_record')
    .filter((x) => x.includes('SF:'))
    .map((record) => {
      const lines = record.trim().split(/\r?\n/),
        get = (key) =>
          Number(
            lines.find((x) => x.startsWith(key + ':'))?.slice(key.length + 1) ??
              0,
          );
      return {
        file: lines.find((x) => x.startsWith('SF:')).slice(3),
        lines: { hit: get('LH'), total: get('LF') },
        functions: { hit: get('FNH'), total: get('FNF') },
        branches: { hit: get('BRH'), total: get('BRF') },
        uncovered: lines
          .filter((x) => /^DA:\d+,0(?:,|$)/.test(x))
          .map((x) => Number(x.slice(3).split(',')[0])),
      };
    });
  const totals = Object.fromEntries(
    ['lines', 'functions', 'branches'].map((key) => [
      key,
      files.reduce(
        (a, f) => ({ hit: a.hit + f[key].hit, total: a.total + f[key].total }),
        { hit: 0, total: 0 },
      ),
    ]),
  );
  const percentage = (x) => (x.total ? (100 * x.hit) / x.total : 100);
  const escape = (s) =>
    s.replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, 'summary.json'),
    JSON.stringify(
      {
        input,
        totals,
        percentages: Object.fromEntries(
          Object.entries(totals).map(([k, v]) => [k, percentage(v)]),
        ),
        statements: null,
        files,
      },
      null,
      2,
    ) + '\n',
  );
  fs.writeFileSync(
    path.join(output, 'index.html'),
    '<!doctype html><meta charset="utf-8"><title>BARBEXA — Coverage</title><style>body{font:16px system-ui;margin:32px;color:#202020}table{border-collapse:collapse;width:100%}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}small{color:#555}</style><h1>BARBEXA — Coverage</h1><p>LCOV: ' +
      escape(input) +
      '</p><p>Statements: not supplied by this runner. Client paths refer to tsc-generated JavaScript; server paths refer to TypeScript.</p><table><tr><th>File</th><th>Lines</th><th>Functions</th><th>Branches</th><th>Uncovered lines</th></tr>' +
      files
        .map(
          (f) =>
            '<tr><td>' +
            escape(f.file) +
            '</td>' +
            ['lines', 'functions', 'branches']
              .map(
                (k) =>
                  '<td>' +
                  percentage(f[k]).toFixed(2) +
                  '% (' +
                  f[k].hit +
                  '/' +
                  f[k].total +
                  ')</td>',
              )
              .join('') +
            '<td>' +
            f.uncovered.join(', ') +
            '</td></tr>',
        )
        .join('') +
      '</table>',
  );
  return { files, totals };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
)
  reportCoverage(process.argv[2], process.argv[3]);
