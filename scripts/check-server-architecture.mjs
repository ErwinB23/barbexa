// Adaptado del verificador cliente: mismo analisis AST, raiz y reglas de servidor propias.
import * as fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const slash = (value) => value.split(path.sep).join('/');
const coreLayer = (layer) => ['domain', 'application'].includes(layer);

function audit(configPath) {
  configPath = path.resolve(configPath);
  const root = fs.realpathSync(path.dirname(configPath));
  const src = path.join(root, 'supabase', 'functions');
  const relative = (file) => slash(path.relative(root, file));
  const errors = new Set();
  const fail = (rule, file, dependency, detail) =>
    errors.add(`[${rule}] ${relative(file)} -> ${dependency}: ${detail}`);
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, '\n'),
    );
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    root,
    undefined,
    configPath,
  );
  for (const error of parsed.errors.filter((d) => d.code !== 18003)) {
    fail(
      'CONFIG',
      configPath,
      'tsconfig',
      ts.flattenDiagnosticMessageText(error.messageText, '\n'),
    );
  }
  function inventory(dir) {
    if (!fs.existsSync(dir)) return [];
    if (fs.lstatSync(dir).isSymbolicLink())
      throw new Error(`Enlace no verificable: ${dir}`);
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink())
        throw new Error(`Enlace no verificable: ${file}`);
      return entry.isDirectory()
        ? inventory(file)
        : /\.(?:[cm]?[jt]sx?)$/.test(file)
          ? [fs.realpathSync(file)]
          : [];
    });
  }
  const files = inventory(src);
  const included = new Set(parsed.fileNames.map((f) => path.resolve(f)));
  for (const file of files) {
    if (!included.has(file))
      fail(
        'INCOMPLETE',
        file,
        'tsconfig',
        'Módulo fuente excluido de la configuración',
      );
  }
  const program = ts.createProgram(
    [...new Set([...parsed.fileNames, ...files])],
    parsed.options,
  );
  const checker = program.getTypeChecker();
  function role(file) {
    const name = relative(file);
    const feature =
      /^supabase\/functions\/_shared\/([^/]+)\/(domain|application|infrastructure|presentation)\//.exec(
        name,
      );
    if (feature) return { module: feature[1], layer: feature[2] };
    const composition =
      /^supabase\/functions\/_shared\/([^/]+)\/composition\.ts$/.exec(name);
    if (composition) return { module: composition[1], layer: 'composition' };
    const entry = /^supabase\/functions\/([^/]+)\/index\.ts$/.exec(name);
    if (entry) return { module: entry[1], layer: 'entry' };
    return { layer: 'unknown' };
  }
  function permitted(from, to) {
    if (from.layer === 'entry')
      return ['composition', 'presentation'].includes(to.layer);
    if (from.module !== to.module) return false;
    if (from.layer === 'composition')
      return [
        'domain',
        'application',
        'infrastructure',
        'presentation',
      ].includes(to.layer);
    const layers = {
      domain: ['domain'],
      application: ['application', 'domain'],
      infrastructure: ['infrastructure', 'application', 'domain'],
      presentation: ['presentation', 'application', 'domain'],
    };
    return layers[from.layer]?.includes(to.layer) ?? false;
  }
  const graph = new Map(files.map((file) => [file, new Set()]));
  const externals = new Map(files.map((file) => [file, new Set()]));
  const core = files.filter((f) => coreLayer(role(f).layer));
  if (core.length === 0)
    fail(
      'EMPTY_CORE',
      src,
      'núcleo',
      'No hay módulos reales de dominio/aplicación para auditar',
    );

  function dependency(file, specifier) {
    const from = role(file);
    const resolution = ts.resolveModuleName(
      specifier,
      file,
      parsed.options,
      ts.sys,
    ).resolvedModule;
    const resolved = resolution && fs.realpathSync(resolution.resolvedFileName);
    const external =
      specifier.startsWith('node:') ||
      !resolved ||
      resolution.isExternalLibraryImport ||
      slash(resolved).includes('/node_modules/');
    if (external) {
      const bare =
        !specifier.startsWith('.') &&
        !specifier.startsWith('@/') &&
        !path.isAbsolute(specifier);
      if (resolved || bare) {
        externals.get(file).add(specifier);
        if (
          from.layer === 'entry' &&
          ![].some(
            (name) => specifier === name || specifier.startsWith(`${name}/`),
          )
        ) {
          fail(
            'ENTRY_EXTERNAL',
            file,
            specifier,
            'Las rutas solo usan navegación y composición de presentación',
          );
        }
        if (coreLayer(from.layer))
          fail(
            'CORE_EXTERNAL',
            file,
            specifier,
            'El núcleo no puede depender de paquetes externos ni Node',
          );
      }
      if (!resolved)
        fail(
          'UNRESOLVED',
          file,
          specifier,
          'TypeScript no puede resolver la referencia',
        );
      return;
    }
    if (!graph.has(resolved)) {
      fail(
        'INCOMPLETE',
        file,
        specifier,
        `Dependencia local fuera del conjunto auditado: ${relative(resolved)}`,
      );
      return;
    }
    graph.get(file).add(resolved);
    if (!permitted(from, role(resolved))) {
      fail(
        'LAYER',
        file,
        specifier,
        `${from.layer} no puede depender de ${role(resolved).layer} (${relative(resolved)})`,
      );
    }
  }

  const forbiddenGlobals = new Set([
    'Deno',
    'Request',
    'Response',
    'Headers',
    'URL',
    'AbortController',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'process',
    'eval',
    'globalThis',
    'global',
    'window',
    'document',
  ]);
  for (const file of files) {
    const source = program.getSourceFile(file);
    if (!source) {
      fail('INCOMPLETE', file, 'AST', 'Módulo sin analizar');
      continue;
    }
    for (const reference of source.referencedFiles)
      dependency(
        file,
        reference.fileName.startsWith('.')
          ? reference.fileName
          : `./${reference.fileName}`,
      );
    if (coreLayer(role(file).layer)) {
      for (const reference of source.typeReferenceDirectives) {
        externals.get(file).add(reference.fileName);
        fail(
          'CORE_EXTERNAL',
          file,
          reference.fileName,
          'Referencia de tipos externa prohibida en núcleo',
        );
      }
      for (const reference of source.libReferenceDirectives) {
        if (!reference.fileName.startsWith('es'))
          fail(
            'CORE_LIB',
            file,
            reference.fileName,
            'Biblioteca de plataforma prohibida en núcleo',
          );
      }
    }
    for (const error of source.parseDiagnostics) {
      fail(
        'PARSE',
        file,
        'AST',
        ts.flattenDiagnosticMessageText(error.messageText, '\n'),
      );
    }
    if (role(file).layer === 'unknown')
      fail(
        'LAYER',
        file,
        'ubicación',
        'Responsabilidad no identificada; evitar barrels que mezclan capas',
      );
    function literal(node) {
      if (node && ts.isStringLiteralLike(node)) dependency(file, node.text);
      else
        fail(
          'UNVERIFIABLE',
          file,
          node?.getText(source) ?? '(sin argumento)',
          'Import/require no literal: dependencia no verificable',
        );
    }
    function visit(node) {
      if (
        ts.isIdentifier(node) &&
        node.text === 'require' &&
        !(ts.isCallExpression(node.parent) && node.parent.expression === node)
      ) {
        const symbol = checker.getSymbolAtLocation(node);
        if (
          !symbol?.declarations?.some((declaration) =>
            graph.has(path.resolve(declaration.getSourceFile().fileName)),
          )
        ) {
          fail(
            'UNVERIFIABLE',
            file,
            'require',
            'Alias o acceso indirecto a require no verificable',
          );
        }
      }
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier
      )
        literal(node.moduleSpecifier);
      if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference)
      )
        literal(node.moduleReference.expression);
      if (ts.isImportTypeNode(node)) {
        if (ts.isLiteralTypeNode(node.argument)) literal(node.argument.literal);
        else
          fail(
            'UNVERIFIABLE',
            file,
            'import type',
            'Referencia de tipo no literal',
          );
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) &&
            node.expression.text === 'require'))
      )
        literal(node.arguments[0]);
      if (
        coreLayer(role(file).layer) &&
        ts.isIdentifier(node) &&
        forbiddenGlobals.has(node.text)
      ) {
        const propertyName =
          (ts.isPropertyAccessExpression(node.parent) &&
            node.parent.name === node) ||
          ((ts.isPropertyAssignment(node.parent) ||
            ts.isMethodDeclaration(node.parent)) &&
            node.parent.name === node);
        const symbol = checker.getSymbolAtLocation(node);
        const local = symbol?.declarations?.some((declaration) =>
          graph.has(path.resolve(declaration.getSourceFile().fileName)),
        );
        if (!propertyName && !local)
          fail(
            'CORE_GLOBAL',
            file,
            node.text,
            'Global de plataforma o ejecución dinámica prohibido en núcleo',
          );
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  // Check the complete reachable closure, including reexports and type-only edges.
  for (const origin of core) {
    const seen = new Set();
    function walk(file, chain) {
      if (seen.has(file)) return;
      seen.add(file);
      for (const specifier of externals.get(file)) {
        fail(
          'CORE_TRANSITIVE',
          origin,
          [...chain.map(relative), specifier].join(' -> '),
          'Dependencia externa alcanzable desde el núcleo',
        );
      }
      for (const next of graph.get(file)) walk(next, [...chain, next]);
    }
    walk(origin, [origin]);
  }
  const done = new Set();
  const active = new Set();
  function cycles(file, chain) {
    if (active.has(file)) {
      fail(
        'CYCLE',
        file,
        [...chain, file].map(relative).join(' -> '),
        'Ciclo de dependencias',
      );
      return;
    }
    if (done.has(file)) return;
    active.add(file);
    for (const next of graph.get(file)) cycles(next, [...chain, file]);
    active.delete(file);
    done.add(file);
  }
  for (const file of files) cycles(file, []);
  console.log(
    `Arquitectura: modules=${files.length} core=${core.length} edges=${[...graph.values()].reduce((n, edges) => n + edges.size, 0)}`,
  );
  for (const file of files)
    console.log(`  ${relative(file)} [${role(file).layer}]`);
  for (const error of errors) console.error(error);
  return errors.size ? 1 : 0;
}

try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--project'))
    throw new Error(
      'Uso: node scripts/check-server-architecture.mjs [--project ruta/tsconfig.json]',
    );
  process.exitCode = audit(
    args[1] ?? path.join(process.cwd(), 'tsconfig.server.json'),
  );
} catch (error) {
  console.error(`[INCOMPLETE] ${error.message}`);
  process.exitCode = 1;
}
