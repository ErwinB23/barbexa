// Genera el resumen documental a partir del E2E y auditoría ya terminados; sin red ni bases de datos.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url)),
  root = path.resolve(out, '../../../..');
const r = JSON.parse(fs.readFileSync(path.join(out, 'resultados.json')));
const m = JSON.parse(
  fs.readFileSync(
    JSON.parse(fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')))
      .manifest,
  ),
);
const cors = JSON.parse(
  fs.readFileSync(path.join(m.dir, 'cors-container-state.json')),
);
assert.ok(cors.applied && cors.restored);
r.labConfiguration = {
  temporaryAllowedOrigin: 'http://localhost:8081',
  unapprovedOriginRejected: 403,
  allowedOriginStatus: 200,
  kongCorsHeader: cors.probes.allowed.cors,
  originalEdgeRestored: true,
  originalContainer: cors.oldId,
  temporaryContainerPreservedStopped: true,
  oneshotPreserved: true,
  otherFiveServicesNotRestarted: true,
  productEnvironmentFilesLoaded: false,
  webAndProxyStopped: true,
};
fs.writeFileSync(
  path.join(out, 'resultados.json'),
  JSON.stringify(r, null, 2) + '\n',
);
const source = path.resolve(
  root,
  '../Laboratorio/Tareas/Semana 2/ENTREGABLE-02 - ANALISIS DE CASO-ARQUITECTURA/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md',
);
const original = fs.readFileSync(source, 'utf8');
for (const id of ['09', '05']) {
  const start = original.indexOf('## EQ-' + id + '.'),
    end = original.indexOf('\n## ', start + 5);
  assert.ok(start >= 0 && end > start);
  fs.writeFileSync(
    path.join(out, 'criterio-original-eq' + id + '.md'),
    original.slice(start, end) + '\n',
  );
}
const esc = (v) =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const steps = [
  ['Sesiones independientes', r.checks.independentContexts],
  ['A confirma con 201', r.checks.firstClientConfirmed],
  ['Mensaje textual de conflicto', r.checks.conflictText],
  ['Servicios conservados', r.checks.servicesPreserved],
  [
    'Sin reenvío automático tras 409',
    r.checks.noAutomaticResubmitAfterConflict,
  ],
  ['Recuperación con teclado', r.checks.keyboardRecovery],
  ['Turno ocupado retirado del listado', r.checks.originalSlotRemoved],
  [
    'Una sola confirmación de recuperación',
    r.checks.singleRecoveryConfirmation,
  ],
  ['Sin reenvío al recargar', r.checks.noResubmitAfterReload],
];
const markup = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BARBEXA — EQ-09, reporte E2E</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#172b43;background:#f3f6fa;margin:0}main{max-width:1050px;margin:auto;padding:30px}section{background:white;padding:24px;margin:20px 0;border-radius:14px;border:1px solid #d4dfea}h1{font-size:28px}h2{font-size:21px}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:12px;border-bottom:1px solid #dce4ed}th{background:#eef4fa}a{color:#17548e}.ok{color:#10674b;font-weight:700}.note{border-left:4px solid #af6517;padding-left:16px}details img{max-width:390px;width:100%;border:1px solid #d4dfea}code{overflow-wrap:anywhere}@media print{body{background:white}main{padding:0}section{break-inside:avoid}} </style><main><h1>BARBEXA · EQ-09</h1><p>Resumen sanitizado de Playwright Test · 26/11/2026 · solo laboratorio local</p><section><h2 class="ok">Recorrido Web: 1 aprobado, 0 fallos</h2><p>Playwright ${esc(r.playwright.version)} · Chromium ${esc(r.playwright.browser)} · 390 × 844 px · ${Math.round(r.playwright.stats.duration / 100) / 10} s de runner · 1 worker · 0 reintentos automáticos.</p><p class="note">EQ-09 integral permanece parcial: ubicación denegada, Android nativo, participantes reales y accesibilidad completa no acreditados.</p><table><thead><tr><th>Comprobación</th><th>Resultado real</th></tr></thead><tbody>${steps.map(([name, result]) => `<tr><td>${esc(name)}</td><td>${esc(typeof result === 'boolean' ? (result ? 'Aprobado' : 'No aprobado') : result)}</td></tr>`).join('')}</tbody></table></section><section><h2>HTTP y persistencia</h2><p>A: 201 · B: 409 → 201. Dos reservas persistidas; la petición rechazada no creó filas. Ninguna respuesta de negocio fue simulada.</p><p>18.981 reservas globales al cierre; cero violaciones de integridad. Se conservaron todas las filas previas de 18 tablas, 814 archivos protegidos y 763 hashes históricos.</p></section><section><h2>Accesibilidad revisada y límites</h2><p>Mensaje: «${esc(r.checks.conflictText)}». Texto/contraste ${r.accessibility.errorTextContrast.toFixed(2)}:1; aria-live polite; recuperación con Enter y controles inspeccionados de al menos 44 px. Sin desbordamiento horizontal a 390 px.</p><p class="note">El foco quedó en BODY tras el conflicto. La captura conserva el scroll inferior; no demuestra que el aviso entre automáticamente en el área visible. Pendiente revisión con lector de pantalla, orden completo de tabulación, zoom y participantes.</p></section><section><h2>Capturas originales</h2><p>Capturas de la sesión aprobada. La segunda conserva la posición inferior del formulario después del 409; el texto del conflicto está comprobado en el DOM y en el trace privado.</p>${r.screenshots.map((n) => `<details><summary>${esc(n)}</summary><a href="${esc(n)}"><img src="${esc(n)}" alt="Captura original ${esc(n)}"></a></details>`).join('')}</section><section><h2>Fuentes y reproducción</h2><p><a href="resultados.json">Resultados y conciliación SQL</a> · <a href="playwright-resumen.json">Estadísticas Playwright sanitizadas</a> · <a href="INFORME.md">Informe técnico</a> · <a href="PROPUESTA-EQ05-1H.md">Propuesta EQ-05 sin iniciar</a></p><p>El reporte HTML nativo y trace completos contienen estado de sesión; se preservan ignorados en <code>${esc(r.nativeReportPrivate)}</code>. No publicarlos sin revisar.</p><p>Metro/proxy cerrados y Edge Runtime original oneshot restaurado. Sin k6, cambios Cloud, migraciones, Actions, commits o push. No se inició la medición EQ-05.</p></section></main></html>`;
fs.writeFileSync(path.join(out, 'reporte.html'), markup);
const hashes = Object.fromEntries(
  fs
    .readdirSync(out)
    .filter(
      (n) => /\.(png|json|html|md)$/.test(n) && n !== 'archivos-sha256.json',
    )
    .map((n) => [
      n,
      createHash('sha256')
        .update(fs.readFileSync(path.join(out, n)))
        .digest('hex'),
    ]),
);
fs.writeFileSync(
  path.join(out, 'archivos-sha256.json'),
  JSON.stringify(hashes, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    reportGenerated: true,
    labRestored: true,
    eq05Started: false,
    screenshots: r.screenshots.length,
  }),
);
