import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initialize, consolidate, campaignDir } from './lib/campaign-store.mjs';
test('campaign archives bytes without promoting preliminary approvals', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'k6-campaign-test-'));
  t.after(() => {
    if (
      path.dirname(dir) !== os.tmpdir() ||
      !path.basename(dir).startsWith('k6-campaign-test-')
    )
      throw Error('UNSAFE_TEST_CLEANUP');
    fs.rmSync(dir, { recursive: true });
  });
  fs.mkdirSync(path.join(dir, '.artifacts/k6/supabase-lab'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(dir, '.artifacts/k6/supabase-lab/fixture-manifest.json'),
    JSON.stringify({ runId: 'synthetic-unit-fixture' }),
  );
  const old = path.join(dir, '.artifacts/k6/runs/old');
  fs.mkdirSync(old, { recursive: true });
  fs.writeFileSync(path.join(old, 'summary.json'), 'preliminary bytes\n');
  const campaign = initialize(dir);
  assert.equal(
    fs.readFileSync(path.join(old, 'summary.json'), 'utf8'),
    'preliminary bytes\n',
  );
  assert.equal(
    fs.readFileSync(
      path.join(dir, '.artifacts/k6/campaigns/preliminary/old/summary.json'),
      'utf8',
    ),
    'preliminary bytes\n',
  );
  assert.equal(initialize(dir).id, campaign.id);
  assert.equal(consolidate(dir, campaign).attempts.length, 0);
  assert.equal(consolidate(dir, campaign).stressMaxApprovedVU, 0);
  assert.equal(
    fs
      .readFileSync(
        path.join(campaignDir(dir, campaign.id), 'comparison.csv'),
        'utf8',
      )
      .trim()
      .split('\n').length,
    1,
  );
});
