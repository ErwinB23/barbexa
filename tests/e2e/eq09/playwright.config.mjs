import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwrightRuntime, browserExecutable } from './runtime.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  root = path.resolve(here, '../../..');
const m = JSON.parse(
  fs.readFileSync(
    JSON.parse(fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')))
      .manifest,
  ),
);
if (!process.env.BARBEXA_EQ09_ATTEMPT) throw Error('USE_EQ09_GUARDED_RUNNER');
const attempt = path.resolve(process.env.BARBEXA_EQ09_ATTEMPT);
if (!attempt.startsWith(path.join(m.dir, 'attempts') + path.sep))
  throw Error('UNSAFE_ATTEMPT_DIRECTORY');
const { testApi, playwright } = playwrightRuntime();
export default testApi.defineConfig({
  testDir: here,
  testMatch: 'booking-conflict.spec.mjs',
  workers: 1,
  retries: 0,
  timeout: 180000,
  expect: { timeout: 15000 },
  outputDir: path.join(attempt, 'test-output'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(attempt, 'playwright-results.json') }],
    [
      'html',
      { outputFolder: path.join(attempt, 'playwright-report'), open: 'never' },
    ],
  ],
  use: {
    browserName: 'chromium',
    headless: true,
    launchOptions: { executablePath: browserExecutable(playwright) },
    baseURL: m.webOrigin,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    serviceWorkers: 'block',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
});
