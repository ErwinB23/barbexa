import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const root = process.cwd();
const nativeRequire = createRequire(path.join(root, 'package.json'));
const { resolve: resolveMetro } = nativeRequire('metro-resolver');
for (const [platform, suffix] of [
  ['android', 'native'],
  ['web', 'web'],
]) {
  test(`Metro ${platform}: shared storage import must not resolve to the adapter itself`, () => {
    const directory = path.join(
      root,
      'src/features/authentication/infrastructure',
    );
    const origin = path.join(directory, `session-storage.${suffix}.ts`);
    const source = ts.createSourceFile(
      origin,
      fs.readFileSync(origin, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const declaration = source.statements.find(
      (statement) =>
        ts.isImportDeclaration(statement) &&
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings) &&
        statement.importClause.namedBindings.elements.some(
          (e) => e.name.text === 'createSessionStorage',
        ),
    );
    assert.ok(declaration && ts.isStringLiteral(declaration.moduleSpecifier));
    const resolution = resolveMetro(
      {
        originModulePath: origin,
        sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
        preferNativePlatform: true,
        mainFields: ['react-native', 'browser', 'main'],
        getPackageForModule: () => null,
        redirectModulePath: (file) => file,
        isAssetFile: () => false,
        resolveAsset: () => null,
        fileSystemLookup: (file) => {
          try {
            const stat = fs.statSync(file);
            return {
              exists: true,
              type: stat.isDirectory() ? 'd' : 'f',
              realPath: fs.realpathSync(file),
            };
          } catch {
            return { exists: false };
          }
        },
      },
      declaration.moduleSpecifier.text,
      platform,
    );
    assert.equal(resolution.type, 'sourceFile');
    assert.notEqual(resolution.filePath, origin, 'adapter imported itself');
    assert.equal(
      resolution.filePath,
      path.join(directory, 'session-storage-core.ts'),
    );
  });
}
const cache = new Map();
function load(file) {
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const require = (name) => {
    if (name === 'expo-secure-store') return {};
    if (name.startsWith('.'))
      return load(path.resolve(path.dirname(file), name));
    return nativeRequire(name);
  };
  vm.runInNewContext(
    `(function(require,module,exports){${code}\n})`,
    {},
    { filename: file },
  )(require, module, module.exports);
  return module.exports;
}
const { createSessionStorageWeb } = load(
  path.join(
    root,
    'src/features/authentication/infrastructure/session-storage.web.ts',
  ),
);
const { createSessionStorageNative } = load(
  path.join(
    root,
    'src/features/authentication/infrastructure/session-storage.native.ts',
  ),
);
function fixture(platform) {
  const values = new Map();
  let fail = false;
  const read = (key) => {
    if (fail) throw Error('sensitive storage detail');
    return values.get(key) ?? null;
  };
  const write = (key, value) => {
    if (fail) throw Error('sensitive quota detail');
    values.set(key, value);
  };
  const remove = (key) => {
    if (fail) throw Error('sensitive delete detail');
    values.delete(key);
  };
  const create = (project = 'new-project', environment = 'test') =>
    platform === 'web'
      ? createSessionStorageWeb({
          project,
          environment,
          backend: { getItem: read, setItem: write, removeItem: remove },
        })
      : createSessionStorageNative({
          project,
          environment,
          backend: {
            getItemAsync: async (k) => read(k),
            setItemAsync: async (k, v) => write(k, v),
            deleteItemAsync: async (k) => remove(k),
          },
        });
  return {
    values,
    create,
    setFailure: (v) => {
      fail = v;
    },
  };
}
for (const platform of ['web', 'native']) {
  test(`${platform}: accepts long SDK PKCE slot key but rejects unbounded keys`, async () => {
    const f = fixture(platform),
      storage = f.create();
    const key = 'auth-'.padEnd(250, 'x') + '-code-verifier';
    await storage.setItem(key, 'technical-verifier');
    assert.equal(await storage.getItem(key), 'technical-verifier');
    await storage.removeItem(key);
    await assert.rejects(
      storage.setItem('x'.repeat(513), 'technical'),
      (e) => e.code === 'invalid-input',
    );
  });
  test(`${platform}: session/verifier and large value roundtrip, absence and scoped cleanup`, async () => {
    const f = fixture(platform),
      storage = f.create();
    assert.equal(await storage.getItem('session'), null);
    await storage.setItem('session', 'technical-value'.repeat(2048));
    await storage.setItem('code-verifier', 'technical-verifier');
    assert.equal(
      await storage.getItem('session'),
      'technical-value'.repeat(2048),
    );
    assert.equal(await storage.getItem('code-verifier'), 'technical-verifier');
    f.values.set('unrelated', 'keep');
    await storage.removeItem('session');
    assert.equal(await storage.getItem('session'), null);
    assert.equal(await storage.getItem('code-verifier'), 'technical-verifier');
    assert.equal(f.values.get('unrelated'), 'keep');
  });
  test(`${platform}: project and environment isolation`, async () => {
    const f = fixture(platform),
      a = f.create(),
      b = f.create('other-project'),
      c = f.create('new-project', 'other-env');
    await a.setItem('session', 'own');
    assert.equal(await b.getItem('session'), null);
    assert.equal(await c.getItem('session'), null);
    await b.removeItem('session');
    assert.equal(await a.getItem('session'), 'own');
  });
  test(`${platform}: corrupt/incomplete envelope never returns an apparent session`, async () => {
    const f = fixture(platform),
      storage = f.create();
    await storage.setItem('session', 'own');
    const key = [...f.values.keys()][0];
    for (const raw of [
      '{',
      '{}',
      '{"version":2,"value":"x"}',
      '{"version":1}',
      '{"version":1,"value":null}',
    ]) {
      f.values.set(key, raw);
      await assert.rejects(
        storage.getItem('session'),
        (e) =>
          e.code === 'persistence-failed' && e.message === 'persistence-failed',
      );
    }
  });
  test(`${platform}: read/write/delete failures are safe; quota does not erase previous data`, async () => {
    const f = fixture(platform),
      storage = f.create();
    await storage.setItem('session', 'before');
    f.setFailure(true);
    for (const operation of [
      () => storage.getItem('session'),
      () => storage.setItem('session', 'new'),
      () => storage.removeItem('session'),
    ])
      await assert.rejects(
        operation(),
        (e) =>
          e.code === 'persistence-failed' && e.message === 'persistence-failed',
      );
    f.setFailure(false);
    assert.equal(await storage.getItem('session'), 'before');
  });
  test(`${platform}: invalid namespace and key rejected before backend`, async () => {
    const f = fixture(platform);
    for (const project of ['', 'with.dot', '../bad'])
      assert.throws(
        () => f.create(project),
        (e) => e.code === 'invalid-input',
      );
    const storage = f.create();
    await assert.rejects(
      storage.setItem('../bad', 'x'),
      (e) => e.code === 'invalid-input',
    );
    assert.equal(f.values.size, 0);
  });
}
