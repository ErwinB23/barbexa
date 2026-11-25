import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { reportCoverage } from '../../../scripts/report-coverage.mjs';
test('coverage presentation preserves LCOV hit counts and reports uncovered lines without inventing statements', () => {
  const out = fs.mkdtempSync(path.resolve('.artifacts/coverage-report-test-'));
  const input = path.join(out, 'sample.info');
  fs.writeFileSync(
    input,
    'SF:core<x>.js\nFNF:2\nFNH:1\nBRF:4\nBRH:3\nDA:1,1\nDA:2,0\nLF:2\nLH:1\nend_of_record\n',
  );
  reportCoverage(input, out);
  const result = JSON.parse(
    fs.readFileSync(path.join(out, 'summary.json'), 'utf8'),
  );
  assert.equal(result.percentages.lines, 50);
  assert.equal(result.percentages.functions, 50);
  assert.equal(result.percentages.branches, 75);
  assert.equal(result.statements, null);
  assert.deepEqual(result.files[0].uncovered, [2]);
  assert.match(
    fs.readFileSync(path.join(out, 'index.html'), 'utf8'),
    /core&lt;x&gt;/,
  );
});
