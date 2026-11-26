// Supervisor integration fixture only: no k6, VUs or application requests.
import fs from 'node:fs';
import http from 'node:http';
const output = process.argv[2];
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (b) => (body += b));
  req.on('end', () => {
    if (
      req.method !== 'PATCH' ||
      req.url !== '/v1/status' ||
      JSON.parse(body).data?.attributes?.stopped !== true
    ) {
      res.writeHead(400).end();
      return;
    }
    res.end('{}');
    server.close(() => {
      fs.writeFileSync(
        output,
        JSON.stringify({
          supervisorFixture: true,
          performanceEvidence: false,
          exportedBeforeExit: true,
        }),
      );
      process.exit(0);
    });
  });
});
server.listen(0, '127.0.0.1', () =>
  process.send(`127.0.0.1:${server.address().port}`),
);
