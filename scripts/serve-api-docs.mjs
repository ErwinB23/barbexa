import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = new Map([
  ['/', [path.join(root, 'docs/api/index.html'), 'text/html; charset=utf-8']],
  [
    '/openapi.json',
    [path.join(root, 'docs/api/openapi.json'), 'application/json'],
  ],
  [
    '/swagger-init.js',
    [path.join(root, 'docs/api/swagger-init.js'), 'text/javascript'],
  ],
  [
    '/swagger-ui-bundle.js',
    [
      require.resolve('swagger-ui-dist/swagger-ui-bundle.js'),
      'text/javascript',
    ],
  ],
  [
    '/swagger-ui.css',
    [require.resolve('swagger-ui-dist/swagger-ui.css'), 'text/css'],
  ],
]);
let port;
try {
  const { values } = parseArgs({
    options: { port: { type: 'string', default: '8082' } },
    allowPositionals: false,
  });
  port = Number(values.port);
  if (
    !/^\d+$/.test(values.port) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  )
    throw new Error('INVALID_PORT');
} catch {
  console.error(
    'Puerto o argumentos no válidos. Usa un puerto entero entre 1 y 65535. Ejemplo: npm run docs:api -- --port 8083',
  );
  process.exit(1);
}
const server = http.createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  );
  if (
    !['127.0.0.1:' + port, 'localhost:' + port].includes(request.headers.host)
  ) {
    response.writeHead(403).end();
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const target = files.get(new URL(request.url, 'http://127.0.0.1').pathname);
  if (!target) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader('Content-Type', target[1]);
  if (request.method === 'HEAD') response.end();
  else
    fs.createReadStream(target[0])
      .on('error', () => response.destroy())
      .pipe(response);
});
server.on('error', (e) => {
  console.error(
    e.code === 'EADDRINUSE'
      ? `El puerto ${port} está ocupado. Usa otro puerto, por ejemplo: npm run docs:api -- --port ${port < 65535 ? port + 1 : 8082}`
      : e.message,
  );
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () =>
  console.log(
    `Swagger UI: http://127.0.0.1:${port} — lectura interactiva, ejecución API deshabilitada.`,
  ),
);
