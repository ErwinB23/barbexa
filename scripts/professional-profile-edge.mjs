// Deploy only the authorized operation function, preserving all other code/settings.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
const [mode, privateDirectory] = process.argv.slice(2);
const ref = 'vuoncrtkkkquvddunrxx';
const dir = path.resolve(privateDirectory);
assert.ok(
  dir.startsWith(
    path.join(process.env.LOCALAPPDATA, 'Barbexa', 'backups') + path.sep,
  ),
);
const work = path.resolve('.artifacts/profile-edge-deploy');
const binary = path.resolve(
  'node_modules/@supabase/cli-windows-x64/bin/supabase.exe',
);
const hash = (x) => crypto.createHash('sha256').update(x).digest('hex');
function cli(args) {
  const r = spawnSync(binary, args, {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, NODE_USE_SYSTEM_CA: '1' },
  });
  if (r.status !== 0)
    throw Error(
      'EDGE_CLI_FAILED ' +
        JSON.stringify({
          exit: r.status,
          timeout: r.error?.code === 'ETIMEDOUT',
        }),
    );
  return r.stdout;
}
const functions = () => {
  const result = JSON.parse(
    cli(['functions', 'list', '--remote=' + ref, '--output-format', 'json']),
  );
  return result.functions ?? result;
};
const beforeData = JSON.parse(
  fs.readFileSync(path.join(dir, 'functions-before.json')),
);
const before = beforeData.functions ?? beforeData;
const selected = before.find((f) => f.slug === 'barbershop-operation');
assert.equal(selected?.verify_jwt, true);
const normalize = (x) => x.replaceAll('\r\n', '\n').trim();
const relativeRoot = '_shared/barbershop-operation/';
const changed = [
  'composition.ts',
  'application/operation.ts',
  'infrastructure/postgres-operation-adapter.ts',
];
const added = [
  'domain/professional-profile.ts',
  'application/professional-profile.ts',
];
const allowed = [...changed, ...added].map((p) => relativeRoot + p);
function files(root) {
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((x) => x.isFile())
    .map((x) =>
      path
        .relative(root, path.join(x.parentPath, x.name))
        .replaceAll('\\', '/'),
    )
    .sort();
}
if (mode === 'verify-recorded') {
  // Recover verification after a successful deploy whose postflight list hit a
  // transient network failure. This mode never retries the deployment.
  const raw = JSON.parse(
    fs.readFileSync(path.join(dir, 'function-diagnostic-out.log')),
  );
  assert.equal(raw.target?.project_ref, ref);
  const after = raw.functions;
  assert.ok(fs.existsSync(path.join(dir, 'edge-deploy-attempt.json')));
  assert.equal(after.length, before.length);
  for (const f of before.filter((f) => f.slug !== 'barbershop-operation'))
    assert.deepEqual(
      after.find((a) => a.slug === f.slug),
      f,
      'UNRELATED_FUNCTION_CHANGED',
    );
  const result = after.find((f) => f.slug === 'barbershop-operation');
  assert.equal(result.status, 'ACTIVE');
  assert.equal(result.verify_jwt, selected.verify_jwt);
  assert.equal(result.version, selected.version + 1);
  fs.writeFileSync(
    path.join(dir, 'functions-after.json'),
    JSON.stringify(after, null, 2),
    { flag: 'wx' },
  );
  fs.writeFileSync(
    path.join(dir, 'edge-verified.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ref,
        slug: result.slug,
        version: result.version,
        verifyJwt: result.verify_jwt,
        otherFunctionsUnchanged: true,
        source: 'function-diagnostic-out.log',
      },
      null,
      2,
    ),
    { flag: 'wx' },
  );
  console.log(
    JSON.stringify({
      verified: true,
      version: result.version,
      verifyJwt: result.verify_jwt,
      otherFunctionsUnchanged: true,
    }),
  );
} else if (mode === 'complete-types') {
  // Downloaded bundles omit type-only modules. Restore only declarations, never
  // unrelated runtime behavior, so the isolated deployment can pass Deno check.
  const stageRoot = path.join(work, 'supabase', 'functions');
  const restored = [];
  let pending = true;
  while (pending) {
    pending = false;
    for (const file of files(stageRoot).filter((f) => f.endsWith('.ts'))) {
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(path.join(stageRoot, file), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      for (const statement of source.statements) {
        if (
          !ts.isImportDeclaration(statement) ||
          !ts.isStringLiteral(statement.moduleSpecifier) ||
          !statement.moduleSpecifier.text.startsWith('.')
        )
          continue;
        const target = path.resolve(
          stageRoot,
          path.dirname(file),
          statement.moduleSpecifier.text,
        );
        if (fs.existsSync(target)) continue;
        assert.ok(target.startsWith(stageRoot + path.sep));
        assert.equal(
          statement.importClause?.isTypeOnly,
          true,
          'MISSING_RUNTIME_MODULE',
        );
        const relative = path.relative(stageRoot, target),
          local = path.join('supabase/functions', relative);
        const text = fs.readFileSync(local, 'utf8');
        const parsed = ts.createSourceFile(
          relative,
          text,
          ts.ScriptTarget.Latest,
          true,
        );
        assert.ok(
          parsed.statements.every(
            (s) =>
              ts.isInterfaceDeclaration(s) ||
              ts.isTypeAliasDeclaration(s) ||
              (ts.isImportDeclaration(s) && s.importClause?.isTypeOnly),
          ),
          'NOT_DECLARATIONS_ONLY',
        );
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, text);
        restored.push(relative);
        pending = true;
      }
    }
  }
  const manifest = files(stageRoot).map((file) => ({
    file,
    sha256: hash(fs.readFileSync(path.join(stageRoot, file))),
  }));
  fs.writeFileSync(
    path.join(work, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  console.log(
    JSON.stringify({ restoredTypes: restored, files: manifest.length }),
  );
} else if (mode === 'prepare') {
  const original = path.join(dir, 'edge-before', 'supabase', 'functions');
  const remoteFiles = files(original);
  const differences = remoteFiles.filter(
    (file) =>
      normalize(fs.readFileSync(path.join(original, file), 'utf8')) !==
      normalize(fs.readFileSync(path.join('supabase/functions', file), 'utf8')),
  );
  assert.deepEqual(
    differences.sort(),
    changed.map((p) => relativeRoot + p).sort(),
    'UNRELATED_REMOTE_SOURCE_DRIFT',
  );
  assert.ok(!fs.existsSync(work), 'STAGING_ALREADY_EXISTS');
  fs.mkdirSync(path.join(work, 'supabase'), { recursive: true });
  fs.cpSync(original, path.join(work, 'supabase', 'functions'), {
    recursive: true,
  });
  for (const file of allowed) {
    const dest = path.join(work, 'supabase', 'functions', file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync('supabase/functions/' + file, dest);
  }
  fs.writeFileSync(
    path.join(work, 'supabase', 'config.toml'),
    'project_id = "barbexa-profile-edge"\n[functions.barbershop-operation]\nverify_jwt = true\n',
  );
  const manifest = files(path.join(work, 'supabase', 'functions')).map(
    (file) => ({
      file,
      sha256: hash(
        fs.readFileSync(path.join(work, 'supabase', 'functions', file)),
      ),
    }),
  );
  fs.writeFileSync(
    path.join(work, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
  console.log(
    JSON.stringify({
      prepared: true,
      changed,
      added,
      files: manifest.length,
      verifyJwt: true,
      work,
    }),
  );
} else if (mode === 'deploy') {
  assert.ok(
    fs.existsSync(path.join(dir, 'verified.json')),
    'MIGRATION_NOT_VERIFIED',
  );
  const manifest = JSON.parse(
    fs.readFileSync(path.join(work, 'manifest.json')),
  );
  for (const x of manifest)
    assert.equal(
      hash(fs.readFileSync(path.join(work, 'supabase', 'functions', x.file))),
      x.sha256,
    );
  const bySlug = (items) =>
    [...items].sort((a, b) => a.slug.localeCompare(b.slug));
  assert.deepEqual(
    bySlug(functions()),
    bySlug(before),
    'FUNCTIONS_CHANGED_SINCE_BACKUP',
  );
  assert.ok(
    !fs.existsSync(path.join(dir, 'edge-deploy-attempt.json')),
    'NO_AUTOMATIC_RETRY',
  );
  fs.writeFileSync(
    path.join(dir, 'edge-deploy-attempt.json'),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ref,
        previousVersion: selected.version,
        manifest,
      },
      null,
      2,
    ),
    { flag: 'wx' },
  );
  let error;
  try {
    cli([
      'functions',
      'deploy',
      'barbershop-operation',
      '--remote=' + ref,
      '--workdir',
      work,
      '--use-api',
      '--yes',
    ]);
  } catch (e) {
    error = e;
  }
  const after = functions();
  fs.writeFileSync(
    path.join(dir, 'functions-after.json'),
    JSON.stringify(after, null, 2),
    { flag: 'wx' },
  );
  for (const f of before.filter((f) => f.slug !== 'barbershop-operation'))
    assert.deepEqual(
      after.find((a) => a.slug === f.slug),
      f,
      'UNRELATED_FUNCTION_CHANGED',
    );
  if (error) throw error;
  const result = after.find((f) => f.slug === 'barbershop-operation');
  assert.equal(result.status, 'ACTIVE');
  assert.equal(result.verify_jwt, selected.verify_jwt);
  assert.equal(result.version, selected.version + 1);
  console.log(
    JSON.stringify({
      deployed: true,
      ref,
      slug: result.slug,
      version: result.version,
      verifyJwt: result.verify_jwt,
      otherFunctionsUnchanged: true,
    }),
  );
} else throw Error('EXPLICIT_MODE_REQUIRED');
