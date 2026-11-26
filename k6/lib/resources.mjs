import { levelPlan } from './safety.mjs';
export function resourcePolicy({
  totalMiB,
  freeMiB,
  level = 1,
  purpose = 'load',
  backendMiB = 512,
  calibration = null,
}) {
  levelPlan(level);
  if (
    ![totalMiB, freeMiB, backendMiB].every(Number.isFinite) ||
    totalMiB <= 0 ||
    freeMiB < 0 ||
    backendMiB <= 0 ||
    !['load', 'fixtures', 'startup'].includes(purpose)
  )
    throw Error('INVALID_RESOURCE_OBSERVATION');
  // Planning estimates warn; sustained runtime pressure is handled by cli-policy.
  // Fixture preparation is serial administrative traffic, no k6 process/VUs.
  // Its working-memory budget is estimated separately from the k6 generator.
  const saturationReserveMiB =
    purpose === 'fixtures' ? 1024 : Math.max(2048, totalMiB * 0.15);
  // Allow the idle backend to double without consuming the saturation reserve.
  const backendGrowthMiB = Math.max(256, backendMiB);
  const measured =
    calibration?.passed === true &&
    Number.isFinite(calibration.generatorPeakMiB) &&
    calibration.generatorPeakMiB > 0 &&
    Number.isInteger(calibration.level) &&
    calibration.level >= 1;
  // 256 MiB baseline and 8 MiB/VU are conservative planning assumptions, not results.
  // Retain a larger model whenever an actual observed peak exceeds it.
  const generatorMiB =
    purpose === 'fixtures'
      ? 128
      : purpose === 'startup'
        ? 256
        : measured
          ? Math.max(
              256 + level * 2,
              2 * calibration.generatorPeakMiB +
                Math.max(0, level - calibration.level) * 8,
            )
          : 256 + level * 8;
  const requiredMiB = Math.max(
    purpose === 'startup' ? 4096 : 0,
    Math.ceil(saturationReserveMiB + backendGrowthMiB + generatorMiB),
  );
  const blockers = [];
  const warnings = [];
  if (freeMiB < requiredMiB) warnings.push('ESTIMATED_MEMORY_HEADROOM_LOW');
  if (freeMiB < 512 || freeMiB / totalMiB <= 0.03)
    blockers.push('CRITICAL_MEMORY_EXHAUSTION_RISK');
  if (purpose === 'load' && level > 10 && !measured)
    warnings.push('GENERATOR_CALIBRATION_UNAVAILABLE');
  return {
    version: 1,
    purpose,
    level,
    freeMiB: Math.round(freeMiB),
    requiredMiB,
    saturationReserveMiB: Math.ceil(saturationReserveMiB),
    backendGrowthMiB,
    generatorMiB: Math.ceil(generatorMiB),
    calibrationAvailable: measured,
    allowed: !blockers.length,
    blockers,
    warnings,
    note: 'Planning envelope, not a capacity claim. Runtime RAM/CPU/connection/health aborts remain mandatory.',
  };
}
