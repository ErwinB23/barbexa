// Cierra solo los procesos propios de Web/proxy; Docker sigue activo.
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { root } from '../../../k6/lib/lab-client.mjs';
if (process.argv[2] !== '--execute=local-synthetic-lab')
  throw Error('EXPLICIT_LOCAL_AUTHORIZATION_REQUIRED');
const m = JSON.parse(
  fs.readFileSync(
    JSON.parse(fs.readFileSync(path.join(root, '.artifacts/eq09/current.json')))
      .manifest,
  ),
);
for (const f of ['metro-process.json', 'web-process.json']) {
  const p = path.join(m.dir, f);
  if (!fs.existsSync(p)) continue;
  const s = JSON.parse(fs.readFileSync(p));
  if (!s.stopFile.startsWith(m.dir + path.sep))
    throw Error('STOP_FILE_OUTSIDE_OWN_FIXTURE');
  fs.writeFileSync(
    s.stopFile,
    'EQ09 completed; stop own temporary service only\n',
  );
}
await wait(1500);
console.log(
  'Cierre solicitado solo a Metro y proxy de EQ09; laboratorio y datos conservados.',
);
