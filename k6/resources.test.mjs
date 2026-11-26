import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resourcePolicy } from './lib/resources.mjs';
import { profile } from './lib/profiles.mjs';

test('startup also treats the old fixed four GiB estimate as warning only', () => {
  for (const freeMiB of [1024, 2048, 3072]) {
    const p = resourcePolicy({ totalMiB: 15800, freeMiB, purpose: 'startup' });
    assert.equal(p.allowed, true);
    assert.ok(p.warnings.includes('ESTIMATED_MEMORY_HEADROOM_LOW'));
  }
  assert.equal(
    resourcePolicy({ totalMiB: 15800, freeMiB: 300, purpose: 'startup' })
      .allowed,
    false,
  );
});
test('all campaign profiles warn instead of blocking on memory estimates or missing calibration', () => {
  for (const type of ['smoke', 'load', 'load-academico', 'stress', 'spike']) {
    const p = profile(type, type === 'spike' ? 1000 : 0);
    for (const freeMiB of [1024, 2048, 3072]) {
      const result = resourcePolicy({
        totalMiB: 15800,
        freeMiB,
        level: p.maxVU,
        purpose: 'load',
        backendMiB: 704,
        calibration: null,
      });
      assert.equal(result.allowed, true, `${type}: ${freeMiB} MiB`);
      assert.deepEqual(result.blockers, []);
      if (p.maxVU > 10)
        assert.ok(
          result.warnings.includes('GENERATOR_CALIBRATION_UNAVAILABLE'),
        );
    }
    assert.equal(
      resourcePolicy({
        totalMiB: 15800,
        freeMiB: 300,
        level: p.maxVU,
        purpose: 'load',
        backendMiB: 704,
      }).allowed,
      false,
    );
  }
});
test('adaptive policy retains saturation floor and reserves workload growth', () => {
  const input = {
    totalMiB: 15800,
    freeMiB: 1510,
    level: 1,
    purpose: 'load',
    backendMiB: 347,
  };
  assert.equal(resourcePolicy(input).allowed, true);
  assert.ok(resourcePolicy(input).warnings.length);
  const preparation = resourcePolicy({
    ...input,
    freeMiB: 1700,
    purpose: 'fixtures',
  });
  assert.equal(preparation.allowed, true);
  assert.equal(
    resourcePolicy({ ...input, freeMiB: 1400, purpose: 'fixtures' }).allowed,
    true,
  );
  const smoke = resourcePolicy({ ...input, freeMiB: 3300 });
  assert.equal(smoke.allowed, true);
  assert.ok(smoke.requiredMiB >= 15800 * 0.15 + 347 + 256);
  assert.equal(
    resourcePolicy({ ...input, freeMiB: 10000, level: 25 }).allowed,
    true,
  );
  const calibration = { level: 1, generatorPeakMiB: 100, passed: true };
  const large = resourcePolicy({
    ...input,
    freeMiB: 5000,
    level: 100,
    calibration,
  });
  assert.equal(large.allowed, true);
  assert.ok(large.requiredMiB > smoke.requiredMiB);
  assert.equal(
    resourcePolicy({ ...input, freeMiB: 5000, level: 2000, calibration })
      .warnings.length > 0,
    true,
  );
  assert.throws(() => resourcePolicy({ ...input, backendMiB: NaN }));
});
