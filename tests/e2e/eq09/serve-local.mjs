// Solo HTTP estático de prueba y proxy transparente a un backend loopback fijo.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { root } from '../../../k6/lib/lab-client.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('LOCAL_SERVER_AUTHORIZATION_REQUIRED');
const p = JSON.parse(
  fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')),
);
const m = JSON.parse(fs.readFileSync(p.manifest));
assert.ok(m.prepared && fs.existsSync(path.join(m.webDirectory, 'index.html')));
assert.equal(m.apiOrigin, 'http://127.0.0.1:54421');
assert.equal(m.backendOrigin, 'http://127.0.0.1:54721');
const mime = {
  '.js': 'application/javascript',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};
const web = http.createServer((req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) throw Error('METHOD');
    const pathname = decodeURIComponent(new URL(req.url, m.webOrigin).pathname);
    const candidate = path.resolve(m.webDirectory, '.' + pathname);
    if (
      candidate !== m.webDirectory &&
      !candidate.startsWith(m.webDirectory + path.sep)
    )
      throw Error('PATH');
    let f = candidate;
    if (!fs.existsSync(f) || !fs.statSync(f).isFile())
      f = path.join(m.webDirectory, 'index.html');
    res.setHeader(
      'Content-Type',
      mime[path.extname(f)] || 'application/octet-stream',
    );
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(f).pipe(res);
  } catch {
    res.writeHead(400);
    res.end();
  }
});
const api = http.createServer((req, res) => {
  if (
    !/^\/(auth|rest|functions)\/v1\//.test(req.url) ||
    req.url.includes('://')
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  const upstream = http.request(
    {
      hostname: '127.0.0.1',
      port: 54721,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: '127.0.0.1:54721' },
    },
    (r) => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });
  req.pipe(upstream);
});
const listen = (server, port) =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
try {
  if (process.argv[3] !== '--proxy-only') await listen(web, 8081);
  await listen(api, 54421);
  console.log(
    process.argv[3] === '--proxy-only'
      ? 'EQ09_PROXY_READY'
      : 'EQ09_LOCAL_SERVERS_READY',
  );
} catch (error) {
  web.close();
  api.close();
  throw error;
}
const stopFile = path.join(m.dir, 'stop-web-' + process.pid + '.request');
fs.writeFileSync(
  path.join(m.dir, 'web-process.json'),
  JSON.stringify({ pid: process.pid, stopFile }),
);
const timer = setInterval(() => {
  if (fs.existsSync(stopFile)) {
    clearInterval(timer);
    web.close();
    api.close();
  }
}, 500);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    clearInterval(timer);
    web.close();
    api.close();
  });
