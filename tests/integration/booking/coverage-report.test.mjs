import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { reportCoverage } from '../../../scripts/report-coverage.mjs';
test('coverage presentation preserves LCOV hit counts and reports uncovered lines without inventing statements', (t) => {
  const temporaryRoot = fs.realpathSync(tmpdir());
  const out = fs.mkdtempSync(
    path.join(temporaryRoot, 'barbexa-coverage-report-'),
  );
  t.after(() => {
    const owned = fs.realpathSync(out);
    assert.equal(path.dirname(owned), temporaryRoot);
    assert.ok(path.basename(owned).startsWith('barbexa-coverage-report-'));
    fs.rmSync(owned, { recursive: true, force: true });
  });
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
