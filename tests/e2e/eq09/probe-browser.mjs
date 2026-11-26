import { playwrightRuntime, browserExecutable } from './runtime.mjs';
const { playwright, version } = playwrightRuntime();
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: browserExecutable(playwright),
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  locale: 'es-PE',
  timezoneId: 'America/Lima',
});
const page = await context.newPage();
await page.goto('about:blank');
await page.setContent('<button>Comprobar herramienta</button>');
await page.getByRole('button', { name: 'Comprobar herramienta' }).click();
console.log(
  JSON.stringify({
    playwright: version,
    browser: browser.version(),
    mobileViewport: page.viewportSize(),
    toolProbePassed: true,
  }),
);
await browser.close();
