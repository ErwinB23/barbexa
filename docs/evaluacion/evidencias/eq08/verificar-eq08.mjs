// Evidencia EQ-08: checkers existentes y dos casos seleccionados. Sin backend ni carga.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../../..');
const run = path.join(
  root,
  '.artifacts/eq08',
  new Date().toISOString().replaceAll(':', '-') + '-' + randomUUID(),
);
fs.mkdirSync(run, { recursive: true });
const relative = (p) => path.relative(root, p).replaceAll('\\', '/');
const sha = (p) =>
  createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
function walk(p) {
  if (!fs.existsSync(p)) return [];
  const s = fs.lstatSync(p);
  assert.ok(!s.isSymbolicLink(), 'Unexpected symlink');
  return s.isDirectory()
    ? fs
        .readdirSync(p)
        .sort()
        .flatMap((n) => walk(path.join(p, n)))
    : [p];
}
function inventory() {
  return Object.fromEntries(
    [
      'src',
      'supabase/functions',
      'supabase/migrations',
      'specs',
      'tests',
      'scripts',
      '.github/workflows',
      '.specify/memory/constitution.md',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.tests.json',
      'tsconfig.core.json',
      'tsconfig.server.json',
      'tsconfig.server-core.json',
    ]
      .flatMap((p) => walk(path.join(root, p)))
      .map((p) => [relative(p), sha(p)]),
  );
}
const before = inventory();
fs.writeFileSync(
  path.join(run, 'preservation-before.json'),
  JSON.stringify(before, null, 2) + '\n',
);
const commands = [];
function execute(name, binary, args, extra = {}) {
  const r = spawnSync(binary, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 8 * 1024 ** 2,
    ...extra,
  });
  const log =
    (r.stdout || '') +
    (r.stderr || '') +
    (r.error ? '\n' + r.error.message : '');
  fs.writeFileSync(path.join(run, name + '.log'), log);
  const sanitized = log
    .replaceAll(root, '<repo>')
    .replaceAll(root.replaceAll('\\', '/'), '<repo>');
  fs.writeFileSync(path.join(out, name + '.log'), sanitized);
  commands.push({
    name,
    executable: path.basename(binary),
    args: args.map((x) =>
      String(x).replaceAll(run, '<run>').replaceAll(root, '<repo>'),
    ),
    exit: r.status ?? -1,
    log: name + '.log',
  });
  assert.equal(
    r.status,
    0,
    name + ' failed; inspect ' + relative(path.join(run, name + '.log')),
  );
  return sanitized;
}
const historical = read(
  path.join(
    root,
    'docs/evaluacion/evidencias/004-reservas/reproducibilidad.json',
  ),
);
const commit = historical.testedCommit;
assert.match(commit, /^[a-f0-9]{40}$/);
const tree = spawnSync(
  'git',
  ['ls-tree', '-r', commit, '--', 'src/features', 'supabase/functions/_shared'],
  { cwd: root, encoding: 'utf8' },
);
assert.equal(tree.status, 0);
const historicalCore = new Map(
  tree.stdout
    .trim()
    .split('\n')
    .map((line) => {
      const m = /^\d+ blob ([a-f0-9]{40})\t(.+)$/.exec(line);
      return m ? [m[2], m[1]] : null;
    })
    .filter(Boolean)
    .filter(([p]) => /\/(domain|application)\/.*\.tsx?$/.test(p)),
);
const coreFiles = [
  ...walk(path.join(root, 'src/features')),
  ...walk(path.join(root, 'supabase/functions/_shared')),
].filter((p) => /\/(domain|application)\/.*\.tsx?$/.test(relative(p)));
assert.equal(
  coreFiles.length,
  historicalCore.size,
  'Core inventory differs from historical coverage version',
);
for (const p of coreFiles) {
  const value = Buffer.from(
    fs.readFileSync(p, 'utf8').replaceAll('\r\n', '\n'),
  );
  const blob = createHash('sha1')
    .update('blob ' + value.length + '\0')
    .update(value)
    .digest('hex');
  assert.equal(
    blob,
    historicalCore.get(relative(p)),
    'Core changed since coverage: ' + relative(p),
  );
}
const imports = [];
for (const side of ['client', 'server']) {
  const configPath = path.join(
    root,
    side === 'client' ? 'tsconfig.json' : 'tsconfig.server.json',
  );
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    root,
    undefined,
    configPath,
  );
  const files = coreFiles.filter((p) =>
    relative(p).startsWith(side === 'client' ? 'src/' : 'supabase/'),
  );
  for (const p of files) {
    const source = ts.createSourceFile(
      p,
      fs.readFileSync(p, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const record = (node, specifier, kind, typeOnly = false) => {
      const resolution = ts.resolveModuleName(
        specifier,
        p,
        parsed.options,
        ts.sys,
      ).resolvedModule;
      const resolved = resolution
        ? path.resolve(resolution.resolvedFileName)
        : null;
      const target = resolved ? relative(resolved) : null;
      const allowed =
        !!target &&
        !resolution.isExternalLibraryImport &&
        /\/(domain|application)\//.test(target) &&
        target.startsWith(
          side === 'client' ? 'src/features/' : 'supabase/functions/_shared/',
        );
      imports.push({
        side,
        file: relative(p),
        line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        kind,
        typeOnly,
        specifier,
        resolved: target,
        allowed,
      });
      assert.ok(
        allowed,
        'Forbidden/unresolved core dependency: ' +
          relative(p) +
          ' -> ' +
          specifier,
      );
    };
    const visit = (n) => {
      if (
        (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
        n.moduleSpecifier &&
        ts.isStringLiteral(n.moduleSpecifier)
      )
        record(
          n,
          n.moduleSpecifier.text,
          ts.isImportDeclaration(n) ? 'import' : 'export',
          !!(n.isTypeOnly || n.importClause?.isTypeOnly),
        );
      if (
        ts.isImportTypeNode(n) &&
        ts.isLiteralTypeNode(n.argument) &&
        ts.isStringLiteral(n.argument.literal)
      )
        record(n, n.argument.literal.text, 'import-type', true);
      if (
        ts.isCallExpression(n) &&
        (n.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(n.expression) && n.expression.text === 'require'))
      ) {
        assert.ok(
          n.arguments.length && ts.isStringLiteral(n.arguments[0]),
          'Non-literal dependency',
        );
        record(n, n.arguments[0].text, 'dynamic-or-require');
      }
      if (
        ts.isImportEqualsDeclaration(n) &&
        ts.isExternalModuleReference(n.moduleReference)
      ) {
        assert.ok(ts.isStringLiteral(n.moduleReference.expression));
        record(n, n.moduleReference.expression.text, 'import-equals');
      }
      ts.forEachChild(n, visit);
    };
    visit(source);
  }
}
const clientArchitecture = execute('architecture-client', process.execPath, [
  'scripts/check-architecture.mjs',
]);
const serverArchitecture = execute('architecture-server', process.execPath, [
  'scripts/check-server-architecture.mjs',
]);
const configFile = path.join(run, 'client-tsconfig.json');
fs.writeFileSync(
  configFile,
  JSON.stringify(
    {
      extends: path.join(root, 'tsconfig.tests.json'),
      compilerOptions: {
        outDir: path.join(run, 'client-build'),
        rootDir: root,
        incremental: false,
      },
      include: [
        path.join(root, 'tests/unit/reservations/confirmation.test.ts'),
      ],
      exclude: [],
    },
    null,
    2,
  ) + '\n',
);
execute('client-compile', process.execPath, [
  'node_modules/typescript/bin/tsc',
  '-p',
  configFile,
  '--pretty',
  'false',
]);
const guard = path.join(run, 'deny-network.cjs');
fs.writeFileSync(
  guard,
  `// Runtime instrumentation only, never imported by the product.\nconst fs=require('node:fs');let attempts=0;const deny=()=>{attempts++;throw Error('EQ08_NETWORK_FORBIDDEN');};\nglobalThis.fetch=deny;for(const n of ['http','https']){const m=require('node:'+n);m.request=deny;m.get=deny;}require('node:net').Socket.prototype.connect=deny;require('node:tls').connect=deny;\nprocess.on('exit',()=>{fs.writeFileSync(${JSON.stringify(run.replaceAll('\\', '/'))}+'/network-'+process.pid+'.json',JSON.stringify({attempts}));if(attempts)process.exitCode=1;});\n`,
);
const clientTest = execute('client-substitution', process.execPath, [
  '--require',
  guard,
  '--test',
  '--test-reporter=tap',
  '--test-name-pattern=^request use case forwards only validated values and preserves dependency error safety$',
  path.join(run, 'client-build/tests/unit/reservations/confirmation.test.js'),
]);
assert.match(clientTest, /# pass 1\b/);
assert.match(clientTest, /# fail 0\b/);
const serverEnv = {
  ...process.env,
  DENO_DIR: path.join(run, 'deno-cache'),
  NO_COLOR: '1',
};
// Avoid inheriting a workstation TLS diagnostic sink; never change the user's environment.
delete serverEnv.SSLKEYLOGFILE;
const serverTest = execute(
  'server-substitution',
  'deno',
  [
    'test',
    '--no-config',
    '--no-lock',
    '--no-npm',
    '--no-remote',
    '--no-prompt',
    '--deny-net',
    '--deny-read',
    '--deny-write',
    '--deny-env',
    '--filter=reservation application actor closed values and dependency failure are safe',
    'tests/server/reservations/confirmation.test.ts',
  ],
  { env: serverEnv },
);
assert.match(serverTest, /1 passed/);
assert.match(serverTest, /0 failed/);
const network = walk(run)
  .filter((p) => /network-\d+\.json$/.test(p))
  .map(read);
assert.ok(network.length > 0);
assert.ok(network.every((x) => x.attempts === 0));
assert.deepEqual(
  inventory(),
  before,
  'Product/config/tests changed during verification',
);
const originalPath = path.resolve(
  root,
  '../Laboratorio/Tareas/Semana 2/ENTREGABLE-02 - ANALISIS DE CASO-ARQUITECTURA/docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md',
);
const original = fs.readFileSync(originalPath, 'utf8'),
  start = original.indexOf('## EQ-08.'),
  end = original.indexOf('\n## ', start + 5);
assert.ok(start >= 0 && end > start);
fs.writeFileSync(
  path.join(out, 'criterio-original.md'),
  original.slice(start, end) + '\n',
);
fs.writeFileSync(
  path.join(out, 'importaciones.json'),
  JSON.stringify(
    {
      coreFiles: coreFiles.map(relative),
      dependencies: imports,
      prohibited: 0,
    },
    null,
    2,
  ) + '\n',
);
const csv = (v) => '"' + String(v ?? '').replaceAll('"', '""') + '"';
const columns = [
  'side',
  'file',
  'line',
  'kind',
  'typeOnly',
  'specifier',
  'resolved',
  'allowed',
];
fs.writeFileSync(
  path.join(out, 'importaciones.csv'),
  [
    columns.join(','),
    ...imports.map((i) => columns.map((k) => csv(i[k])).join(',')),
  ].join('\n') + '\n',
);
const counts = (log) => {
  const m = /modules=(\d+) core=(\d+) edges=(\d+)/.exec(log);
  assert.ok(m);
  return { modules: +m[1], core: +m[2], edges: +m[3], exit: 0 };
};
const result = {
  at: new Date().toISOString(),
  status: 'Parcial integral; acreditado en núcleo construido de reservas',
  originalScenario:
    'EQ-08. Mantenibilidad: reglas y adaptadores independientes',
  originalCriteriaSha256: sha(originalPath),
  architecture: {
    client: counts(clientArchitecture),
    server: counts(serverArchitecture),
    listedCoreFiles: coreFiles.length,
    listedDependencies: imports.length,
    prohibited: 0,
  },
  targetedTests: {
    client: { selected: 1, passed: 1, failed: 0, networkAttempts: 0 },
    server: {
      selected: 1,
      passed: 1,
      failed: 0,
      otherTestsFiltered: 5,
      networkPermission: 'denied',
      readWriteEnvPermissions: 'denied',
    },
  },
  fullRegressionReuse: {
    source: '../004-reservas/reproducibilidad.json',
    date: historical.date,
    testedCommit: commit,
    coreFilesMatchHistoricalCommit: true,
    tests: historical.tests,
    coverage: historical.coverage,
    newCoverageRun: false,
  },
  preservation: { files: Object.keys(before).length, unchanged: true },
  pendingOriginalCondition:
    'Sustituir un adaptador de mapas o imágenes y comprobar sus reglas: módulos no completos; no se implementan ni se acredita esa condición.',
  commands,
  privateRunDirectory: relative(run),
  k6Executed: false,
  backendStarted: false,
  cloudAccessed: false,
  productModified: false,
};
fs.writeFileSync(
  path.join(out, 'resultados.json'),
  JSON.stringify(result, null, 2) + '\n',
);
fs.writeFileSync(
  path.join(out, 'preservacion-sha256.json'),
  JSON.stringify(
    { files: Object.keys(before).length, unchanged: true, sha256: before },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    {
      architecture: result.architecture,
      targetedTests: result.targetedTests,
      reusedCoverage: result.fullRegressionReuse.coverage,
      preserved: result.preservation,
      privateRun: relative(run),
    },
    null,
    2,
  ),
);
