import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = fs.realpathSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
);
const output = path.resolve(root, '.test-build');
const marker = path.join(output, '.unit-tests-output');
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Enlace no permitido: ${file}`);
    return entry.isDirectory() ? files(file) : [file];
  });
}

function cleanOutput() {
  // Never remove an arbitrary directory or a redirected output tree.
  if (
    path.dirname(output) !== root ||
    path.basename(output) !== '.test-build'
  ) {
    throw new Error('Salida fuera del proyecto');
  }
  if (!fs.existsSync(output)) return;
  if (fs.lstatSync(output).isSymbolicLink() || !fs.existsSync(marker)) {
    throw new Error('Salida existente sin propiedad acreditada');
  }
  files(output); // Reject nested symlinks/junctions before recursive removal.
  fs.rmSync(output, { recursive: true });
}

function execute(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function main() {
  const tests = files(path.join(root, 'tests/unit')).filter((f) =>
    f.endsWith('.test.ts'),
  );
  if (tests.length === 0)
    throw new Error('Pendiente T020: no existen pruebas unitarias reales.');
  const core = files(path.join(root, 'src/features')).filter((file) => {
    if (
      !/\/(domain|application)\/.+\.ts$/.test(relative(file)) ||
      file.endsWith('.d.ts') ||
      file.endsWith('.test.ts')
    )
      return false;
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    // Interfaces and type aliases produce no executable business logic.
    return source.statements.some(
      (statement) =>
        !(
          ts.isInterfaceDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement) ||
          ts.isImportDeclaration(statement) ||
          ts.isExportDeclaration(statement) ||
          ts.isEmptyStatement(statement)
        ),
    );
  });
  if (core.length === 0)
    throw new Error(
      'Pendiente: no existe núcleo ejecutable para medir cobertura.',
    );
  cleanOutput();
  fs.mkdirSync(output);
  fs.writeFileSync(marker, 'run-unit-tests.mjs\n');
  try {
    const compilation = execute([
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '-p',
      'tsconfig.tests.json',
      '--pretty',
      'false',
    ]);
    if (compilation !== 0) return compilation;
    const emitted = (file) =>
      path.join(output, relative(file).replace(/\.ts$/, '.js'));
    for (const file of [...tests, ...core]) {
      if (!fs.existsSync(emitted(file)))
        throw new Error(`Archivo sin emitir: ${relative(file)}`);
    }
    const preload = path.join(output, 'coverage-entry.mjs');
    fs.writeFileSync(
      preload,
      core
        .map(
          (file) =>
            `import ${JSON.stringify(pathToFileURL(emitted(file)).href)};`,
        )
        .join('\n'),
    );
    console.log(
      'Núcleo incluido en cobertura:',
      JSON.stringify(core.map(relative)),
    );
    return execute([
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-lines=100',
      '--test-coverage-functions=100',
      '--test-coverage-branches=90',
      '--test-coverage-include=.test-build/src/features/**/domain/**/*.js',
      '--test-coverage-include=.test-build/src/features/**/application/**/*.js',
      '--test-coverage-exclude=**/*.test.js',
      '--test-coverage-exclude=**/doubles/**',
      '--import',
      pathToFileURL(preload).href,
      ...tests.map(emitted),
    ]);
  } finally {
    cleanOutput();
  }
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
