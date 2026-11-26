import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialize, consolidate } from './lib/campaign-store.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv.length !== 3 || !['init', 'report'].includes(process.argv[2]))
  throw Error('USE_CAMPAIGN_INIT_OR_REPORT_NO_LOAD');
const campaign = initialize(root);
const report = consolidate(root, campaign);
console.log(
  `Campaña ${campaign.id}: ${report.attempts.length} intentos completos. Sin ejecutar carga.`,
);
