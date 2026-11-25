// Deliberate allowlist: never upload .env, raw logs, fixtures or V8 profiles.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'ci-artifacts');
if (fs.existsSync(output)) throw Error('CI_ARTIFACT_OUTPUT_ALREADY_EXISTS');
function coverage(name, branchMinimum) {
  const summary = JSON.parse(
    fs.readFileSync(path.join(root, `coverage/${name}/summary.json`), 'utf8'),
  );
  const percentages = {};
  const totals = {};
  for (const [metric, minimum] of [
    ['lines', 100],
    ['functions', 100],
    ['branches', branchMinimum],
  ]) {
    const total = summary.totals[metric];
    if (
      !Number.isSafeInteger(total.hit) ||
      !Number.isSafeInteger(total.total) ||
      total.total < 1 ||
      total.hit < 0 ||
      total.hit > total.total
    )
      throw Error('INVALID_COVERAGE_TOTALS');
    const percentage = (100 * total.hit) / total.total;
    if (percentage < minimum) throw Error('CI_COVERAGE_THRESHOLD_NOT_MET');
    percentages[metric] = percentage;
    totals[metric] = { hit: total.hit, total: total.total };
  }
  // Aggregate counts only; raw summaries/HTML contain absolute workstation paths.
  return {
    scope: `${name}-domain-application`,
    totals,
    percentages,
    files: summary.files.length,
  };
}
const client = coverage('client', 90);
const server = coverage('server', 100);
const web = path.resolve(
  root,
  process.env.BARBEXA_CI_WEB_OUTPUT ?? '.artifacts/ci-web',
);
if (!web.startsWith(path.join(root, '.artifacts') + path.sep))
  throw Error('INVALID_WEB_OUTPUT');
const index = fs.readFileSync(path.join(web, 'index.html'));
const specification = fs.readFileSync(path.join(root, 'docs/api/openapi.json'));
const api = JSON.parse(specification);
fs.mkdirSync(output);
for (const [name, value] of Object.entries({
  'client-coverage': client,
  'server-coverage': server,
  'web-build': {
    platform: 'web',
    mode: 'compile-only-without-credentials',
    indexBytes: index.length,
    indexSha256: createHash('sha256').update(index).digest('hex'),
  },
  'api-validation': {
    openapi: api.openapi,
    paths: Object.keys(api.paths).length,
    specificationSha256: createHash('sha256')
      .update(specification)
      .digest('hex'),
  },
}))
  fs.writeFileSync(
    path.join(output, name + '.json'),
    JSON.stringify(value, null, 2) + '\n',
  );
console.log(
  'CI artifacts prepared: aggregate coverage, Web build and API metadata only.',
);
