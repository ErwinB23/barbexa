import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ts from 'typescript';
import {
  assertLocalTarget,
  createOwnedDirectory,
  removeOwnedDirectory,
  runChecked,
} from '../tests/integration/tenant-foundation/fixtures.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function withCompiledClient(consume, projectRoot = root) {
  const entry = path.join(
    projectRoot,
    'src/composition/tenant-foundation-composition.ts',
  );
  if (!fs.existsSync(entry)) throw Error('NOT_READY_CLIENT_COMPOSITION');
  const output = createOwnedDirectory();
  try {
    const configPath = path.join(projectRoot, 'tsconfig.tests.json');
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    if (config.error) throw Error('BUILD_CONFIG_FAILED');
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      projectRoot,
    );
    if (parsed.errors.some((d) => d.code !== 18003))
      throw Error('BUILD_CONFIG_FAILED');
    const program = ts.createProgram([entry], {
      ...parsed.options,
      rootDir: projectRoot,
      outDir: output,
      noEmit: false,
      noEmitOnError: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.some((d) => d.category === ts.DiagnosticCategory.Error))
      throw Error('CLIENT_TYPECHECK_FAILED');
    if (program.emit().emitSkipped) throw Error('CLIENT_EMIT_FAILED');
    const module = await import(
      pathToFileURL(
        path.join(output, 'src/composition/tenant-foundation-composition.js'),
      ).href
    );
    return await consume(module);
  } finally {
    removeOwnedDirectory(output);
  }
}

function main() {
  // No request, fixture mutation or database connection is made by this preparation.
  assertLocalTarget({
    url: process.env.BARBERIA_002_URL,
    projectId: process.env.BARBERIA_002_PROJECT_ID,
  });
  const selected = process.argv.slice(2);
  if (
    selected.length > 1 ||
    selected.some((arg) => !['--profiles', '--barbershops'].includes(arg))
  )
    throw Error('NOT_READY_BACKEND_SCENARIOS');
  const scenarios = (
    selected.includes('--profiles')
      ? ['profiles.test.mjs']
      : selected.includes('--barbershops')
        ? ['barbershops.test.mjs']
        : [
            'profiles.test.mjs',
            'barbershops.test.mjs',
            'authorization.test.mjs',
          ]
  ).map((f) => path.join(root, 'tests/integration/tenant-foundation', f));
  if (scenarios.some((f) => !fs.existsSync(f)))
    throw Error('NOT_READY_BACKEND_SCENARIOS');
  // These future suites must verify the actual stack identity before administrative setup.
  const report = runChecked(
    process.execPath,
    ['--test', '--test-concurrency=1', '--test-reporter=tap', ...scenarios],
    {
      cwd: root,
      timeout: 180000,
    },
  );
  // Re-emit only successful fixed test labels/counters, never provider output or credentials.
  for (const line of report.split('\n')) {
    if (
      /^\s*(ok \d+ - [A-Za-z0-9 /:,.()_-]+|# (tests|pass|fail|skipped) \d+)\s*$/.test(
        line,
      )
    )
      console.log(line.trim());
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (e) {
    const safeCodes = new Set([
      'UNIDENTIFIED_PROJECT',
      'UNSAFE_PORT',
      'UNSAFE_LOCAL_TARGET',
      'NOT_READY_BACKEND_SCENARIOS',
      'SUBPROCESS_FAILED',
      'SUBPROCESS_TIMEOUT',
    ]);
    console.error(
      safeCodes.has(e.message) ? e.message : 'INTEGRATION_NOT_READY',
    );
    process.exitCode = 1;
  }
}
