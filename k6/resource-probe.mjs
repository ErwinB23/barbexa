import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resourcePolicy } from './lib/resources.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const purpose = process.argv[2] || 'load',
  level = Number(process.argv[3] || 1);
const lab = path.join(root, '.artifacts/k6/supabase-lab');
const read = (name, fallback) =>
  fs.existsSync(path.join(lab, name))
    ? JSON.parse(fs.readFileSync(path.join(lab, name), 'utf8'))
    : fallback;
export function probe(purpose, level) {
  const savedCalibration = read('calibration.json', null);
  const calibration =
    savedCalibration?.level <= level ? savedCalibration : null;
  const baseline = read('backend-baseline.json', { totalMiB: 512 });
  return resourcePolicy({
    totalMiB: os.totalmem() / 1024 ** 2,
    freeMiB: os.freemem() / 1024 ** 2,
    purpose,
    level,
    backendMiB: baseline.totalMiB,
    calibration,
  });
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = probe(purpose, level);
  console.log(JSON.stringify(result, null, 2));
  if (!result.allowed) process.exitCode = 2;
}
