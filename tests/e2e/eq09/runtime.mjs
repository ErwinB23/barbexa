import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export function playwrightRuntime() {
  const privateBrowsers = path.resolve('.artifacts/eq09/tools/browsers');
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(privateBrowsers))
    process.env.PLAYWRIGHT_BROWSERS_PATH = privateBrowsers;
  const explicit = process.env.BARBEXA_PLAYWRIGHT_MODULE;
  const entry = explicit
    ? createRequire(path.resolve(explicit, 'package.json'))
    : require;
  const playwright = entry('playwright');
  return {
    playwright,
    testApi: entry('playwright/test'),
    cli: path.join(
      path.dirname(entry.resolve('playwright/package.json')),
      'cli.js',
    ),
    version: entry('playwright/package.json').version,
  };
}
export function browserExecutable(playwright) {
  if (process.env.BARBEXA_CHROMIUM_EXECUTABLE)
    return process.env.BARBEXA_CHROMIUM_EXECUTABLE;
  const expected = playwright.chromium.executablePath();
  if (fs.existsSync(expected)) return expected;
  const cache = path.join(os.homedir(), 'AppData/Local/ms-playwright');
  for (const dir of fs.existsSync(cache)
    ? fs
        .readdirSync(cache)
        .filter((n) => /^chromium-\d+$/.test(n))
        .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    : []) {
    const p = path.join(cache, dir, 'chrome-win64/chrome.exe');
    if (fs.existsSync(p)) return p;
  }
  throw Error('PLAYWRIGHT_CHROMIUM_NOT_INSTALLED');
}
