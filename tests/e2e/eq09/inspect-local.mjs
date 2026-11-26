// Diagnóstico de lectura de la Web local; no inicia sesión ni confirma reservas.
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../../../k6/lib/lab-client.mjs';
import { playwrightRuntime, browserExecutable } from './runtime.mjs';
const m = JSON.parse(
  fs.readFileSync(
    JSON.parse(fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')))
      .manifest,
  ),
);
const { playwright } = playwrightRuntime();
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: browserExecutable(playwright),
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  serviceWorkers: 'block',
});
await context.route('**/*', (r) =>
  [m.webOrigin, m.apiOrigin].includes(new URL(r.request().url()).origin)
    ? r.continue()
    : r.abort(),
);
const p = await context.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(m.webOrigin + '/sign-in', {
  waitUntil: 'domcontentloaded',
  timeout: 15000,
});
await p
  .getByLabel('Correo electrónico', { exact: true })
  .waitFor({ state: 'visible', timeout: 90000 })
  .catch((e) => errors.push(e.message.slice(0, 400)));
await p.screenshot({
  path: path.join(m.dir, 'inspection-local.png'),
  fullPage: true,
});
console.log(
  JSON.stringify(
    {
      url: p.url(),
      text: (await p.locator('body').innerText()).slice(0, 2800),
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
