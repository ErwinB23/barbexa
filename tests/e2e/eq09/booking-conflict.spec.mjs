// Flujo Web real: dos identidades independientes, sin respuestas HTTP simuladas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwrightRuntime } from './runtime.mjs';
const { test, expect } = playwrightRuntime().testApi;
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const pointer = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const base = JSON.parse(fs.readFileSync(pointer.manifest));
if (!process.env.BARBEXA_EQ09_ATTEMPT) throw Error('USE_EQ09_GUARDED_RUNNER');
const m = { ...base, dir: process.env.BARBEXA_EQ09_ATTEMPT };
const time = (s) =>
  new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(s));
const starts = (slot) => slot.startsAt ?? slot.starts_at;
const label = (slot) => new RegExp('^' + time(starts(slot)) + '[–-]');

test('EQ-09: conflicto real, servicios conservados y recuperación sin duplicados', async ({
  page: clientB,
  browser,
}, info) => {
  const contextA = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    serviceWorkers: 'block',
  });
  const clientA = await contextA.newPage();
  const confirmations = [],
    blocked = [],
    pageErrors = [],
    checks = {},
    screenshots = [];
  const watch = async (page, actor) => {
    await page.context().route('**/*', async (route) => {
      const u = new URL(route.request().url());
      if ([m.webOrigin, m.apiOrigin].includes(u.origin)) {
        await route.continue();
        return;
      }
      blocked.push({ actor, origin: u.origin, path: u.pathname });
      await route.abort('blockedbyclient');
    });
    page.on('pageerror', (e) => pageErrors.push({ actor, message: e.message }));
    page.on('response', (response) => {
      const req = response.request(),
        u = new URL(req.url());
      if (
        u.origin !== m.apiOrigin ||
        u.pathname !== '/functions/v1/reservation-command' ||
        req.method() !== 'POST'
      )
        return;
      const body = req.postDataJSON();
      if (body.action !== 'confirm') return;
      confirmations.push({
        actor,
        status: response.status(),
        requestId: body.requestId,
        startsAt: body.startsAt,
        serviceIds: body.serviceIds,
        at: new Date().toISOString(),
      });
    });
  };
  const login = async (page, account) => {
    await page.goto(m.webOrigin + '/sign-in');
    page.setDefaultTimeout(20000);
    await page
      .getByLabel('Correo electrónico', { exact: true })
      .fill(account.email);
    await page.getByLabel('Contraseña', { exact: true }).fill(account.password);
    await page
      .getByRole('button', { name: 'Iniciar sesión', exact: true })
      .click();
    await page.waitForURL((url) => url.pathname !== '/sign-in', {
      timeout: 30000,
    });
    await page.goto(m.webOrigin + '/booking');
    await expect(
      page.getByRole('button', { name: m.shopName, exact: true }),
    ).toBeVisible();
  };
  const select = async (page) => {
    await page.getByRole('button', { name: m.shopName, exact: true }).click();
    await page.getByRole('button', { name: /Corte sintético EQ09/ }).click();
    await page
      .getByRole('button', { name: 'Profesional EQ09', exact: true })
      .click();
    const day = page.getByRole('button', { name: m.localDate, exact: true });
    if (!(await day.count()))
      await page
        .getByRole('button', { name: 'Mes siguiente', exact: true })
        .click();
    await day.click();
    await expect(
      page.getByRole('button', { name: label(m.first) }),
    ).toBeVisible();
    await page.getByRole('button', { name: label(m.first) }).click();
    await page.getByRole('button', { name: 'Efectivo', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Confirmar reserva', exact: true }),
    ).toBeEnabled();
  };
  const shot = async (name) => {
    const file = path.join(m.dir, name + '.png');
    await clientB.screenshot({ path: file, fullPage: true });
    screenshots.push(path.basename(file));
    await info.attach(name, { path: file, contentType: 'image/png' });
  };
  let tracing = false,
    completed = false;
  try {
    await watch(clientA, 'A');
    await watch(clientB, 'B');
    await test.step('Dos clientes sintéticos inician sesiones independientes', async () => {
      await login(clientA, m.accounts[2]);
      await login(clientB, m.accounts[3]);
      checks.independentContexts = clientA.context() !== clientB.context();
      expect(checks.independentContexts).toBeTruthy();
    });
    await clientB
      .context()
      .tracing.start({ screenshots: true, snapshots: true, sources: false });
    tracing = true;
    await test.step('Ambos clientes eligen el mismo horario todavía libre', async () => {
      await select(clientA);
      await select(clientB);
      await shot('01-horario-inicial');
    });
    await test.step('El cliente A confirma primero en el backend real', async () => {
      const response = clientA.waitForResponse(
        (r) =>
          r.url().endsWith('/functions/v1/reservation-command') &&
          r.request().postDataJSON()?.action === 'confirm',
      );
      await clientA
        .getByRole('button', { name: 'Confirmar reserva', exact: true })
        .click();
      expect((await response).status()).toBe(201);
      await expect(
        clientA.getByRole('heading', {
          name: '¡Reserva confirmada!',
          exact: true,
        }),
      ).toBeVisible();
      checks.firstClientConfirmed = true;
    });
    await test.step('La selección obsoleta de B recibe 409 y muestra explicación textual', async () => {
      const response = clientB.waitForResponse(
        (r) =>
          r.url().endsWith('/functions/v1/reservation-command') &&
          r.request().postDataJSON()?.action === 'confirm',
      );
      await clientB
        .getByRole('button', { name: 'Confirmar reserva', exact: true })
        .click();
      const r = await response;
      expect(r.status()).toBe(409);
      const body = await r.json();
      expect(body.error.code).toBe('CONFLICT');
      const message = clientB.getByText(
        'Profesional no disponible en ese horario',
        { exact: true },
      );
      await expect(message).toBeVisible();
      await expect(
        clientB.getByRole('button', { name: /Corte sintético EQ09/ }),
      ).toHaveAttribute('aria-pressed', 'true');
      checks.conflictText = await message.textContent();
      checks.servicesPreserved = true;
      checks.errorAccessibility = await message.evaluate((el) => {
        const style = getComputedStyle(el);
        let p = el,
          background = 'rgba(0, 0, 0, 0)';
        while (p) {
          const c = getComputedStyle(p).backgroundColor;
          if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
            background = c;
            break;
          }
          p = p.parentElement;
        }
        return {
          liveRegion:
            el.closest('[aria-live]')?.getAttribute('aria-live') ?? null,
          color: style.color,
          background,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          focusTag: document.activeElement?.tagName,
        };
      });
      await shot('02-conflicto-textual');
      await clientB.waitForTimeout(2000);
      expect(confirmations.filter((x) => x.actor === 'B')).toHaveLength(1);
      checks.noAutomaticResubmitAfterConflict = true;
    });
    await test.step('B consulta y elige otro horario mediante teclado', async () => {
      const refresh = clientB.getByRole('button', {
        name: 'Consultar horarios',
        exact: true,
      });
      await refresh.scrollIntoViewIfNeeded();
      await refresh.focus();
      await expect(refresh).toBeFocused();
      const slots = clientB.waitForResponse((r) =>
        r.url().endsWith('/rest/v1/rpc/list_booking_slots'),
      );
      await clientB.keyboard.press('Enter');
      expect((await slots).status()).toBe(200);
      await expect(
        clientB.getByRole('button', { name: label(m.first) }),
      ).toHaveCount(0);
      const alternative = clientB.getByRole('button', {
        name: label(m.alternative),
      });
      await alternative.focus();
      await clientB.keyboard.press('Enter');
      await expect(alternative).toHaveAttribute('aria-pressed', 'true');
      await expect(
        clientB.getByRole('button', { name: /Corte sintético EQ09/ }),
      ).toHaveAttribute('aria-pressed', 'true');
      checks.keyboardRecovery = true;
      checks.originalSlotRemoved = true;
      checks.controls = await Promise.all(
        [
          clientB.getByRole('button', { name: /Corte sintético EQ09/ }),
          refresh,
          alternative,
          clientB.getByRole('button', {
            name: 'Confirmar reserva',
            exact: true,
          }),
        ].map(async (x) => ({
          name: (await x.getAttribute('aria-label')) ?? (await x.innerText()),
          box: await x.boundingBox(),
        })),
      );
      checks.layout = await clientB.evaluate(() => ({
        viewport: innerWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(confirmations.filter((x) => x.actor === 'B')).toHaveLength(1);
    });
    await test.step('B confirma una sola vez el nuevo turno', async () => {
      const response = clientB.waitForResponse(
        (r) =>
          r.url().endsWith('/functions/v1/reservation-command') &&
          r.request().postDataJSON()?.action === 'confirm',
      );
      const confirm = clientB.getByRole('button', {
        name: 'Confirmar reserva',
        exact: true,
      });
      await confirm.focus();
      await clientB.keyboard.press('Enter');
      expect((await response).status()).toBe(201);
      await expect(
        clientB.getByRole('heading', {
          name: '¡Reserva confirmada!',
          exact: true,
        }),
      ).toBeVisible();
      await shot('03-reserva-recuperada');
      await clientB.reload();
      await clientB.waitForTimeout(2000);
      expect(
        confirmations.filter((x) => x.actor === 'A').map((x) => x.status),
      ).toEqual([201]);
      expect(
        confirmations.filter((x) => x.actor === 'B').map((x) => x.status),
      ).toEqual([409, 201]);
      const b = confirmations.filter((x) => x.actor === 'B');
      expect(b[0].requestId).not.toBe(b[1].requestId);
      expect(b[0].startsAt).not.toBe(b[1].startsAt);
      checks.singleRecoveryConfirmation = true;
      checks.noResubmitAfterReload = true;
    });
    expect(blocked).toEqual([]);
    expect(pageErrors).toEqual([]);
    fs.writeFileSync(
      path.join(m.dir, 'e2e-observed.json'),
      JSON.stringify(
        {
          passed: true,
          checks,
          confirmations,
          blocked,
          pageErrors,
          screenshots,
          viewport: { width: 390, height: 844 },
          browser: browser.version(),
          playwright: playwrightRuntime().version,
        },
        null,
        2,
      ) + '\n',
    );
    completed = true;
  } finally {
    if (tracing)
      await clientB
        .context()
        .tracing.stop({ path: path.join(m.dir, 'trace-client-B-private.zip') })
        .catch(() => {});
    if (!completed) {
      await clientB
        .screenshot({
          path: path.join(m.dir, 'failure-private.png'),
          fullPage: true,
        })
        .catch(() => {});
      fs.writeFileSync(
        path.join(m.dir, 'failure-observed.json'),
        JSON.stringify({ checks, confirmations, blocked, pageErrors }, null, 2),
      );
    }
    await contextA.close();
  }
});
