// Reporte de evidencia; las reglas siguen en scripts/check-architecture.mjs sin cambios.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const configPath = path.join(root, 'tsconfig.json');
const read = ts.readConfigFile(configPath, ts.sys.readFile);
if (read.error) throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, '\n'));
const config = ts.parseJsonConfigFileContent(read.config, ts.sys, root, undefined, configPath);
if (config.errors.length) throw new Error(ts.formatDiagnosticsWithColorAndContext(config.errors, {
  getCurrentDirectory: () => root, getCanonicalFileName: (f) => f, getNewLine: () => '\n',
}));
const files = config.fileNames.filter((file) => relative(file).startsWith('src/')).sort();
const edges = [];
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function record(literal, typeOnly) {
    const specifier = literal.text;
    const resolution = ts.resolveModuleName(specifier, file, config.options, ts.sys).resolvedModule;
    if (!resolution) throw new Error(`Referencia sin resolver: ${relative(file)} -> ${specifier}`);
    edges.push({ from: relative(file), specifier, typeOnly, alias: specifier.startsWith('@/'),
      target: relative(resolution.resolvedFileName), external: resolution.isExternalLibraryImport || relative(resolution.resolvedFileName).includes('node_modules/') });
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) record(node.moduleSpecifier, node.importClause?.isTypeOnly ?? false);
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)) record(node.moduleSpecifier, node.isTypeOnly);
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const core = files.map(relative).filter((name) => /\/features\/[^/]+\/(domain|application)\//.test(name));
const closure = core.map((origin) => {
  const seen = new Set();
  const external = new Set();
  function walk(file) {
    if (seen.has(file)) return;
    seen.add(file);
    for (const edge of edges.filter((item) => item.from === file)) {
      if (edge.external) external.add(edge.specifier);
      else walk(edge.target);
    }
  }
  walk(origin);
  return { origin, localClosure: [...seen].sort(), externalDependencies: [...external].sort() };
});
const report = { files: files.map(relative), core, edgeCount: edges.length, aliases: edges.filter((e) => e.alias).length,
  typeOnlyImports: edges.filter((e) => e.typeOnly).length, edges, closure,
  limitation: 'Reporte de imports/reexports estáticos del código actual. El checker existente comprueba otras formas y aplica reglas. No se recorren implementaciones de paquetes externos.' };
fs.writeFileSync(path.join(root, 'docs/evaluacion/evidencias/001-fundacion/t026-dependencias.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Reporte: ${files.length} archivos, ${core.length} de núcleo, ${edges.length} imports/reexports, ${report.aliases} aliases.`);
console.log(`Dependencias externas alcanzables desde núcleo: ${closure.reduce((n, item) => n + item.externalDependencies.length, 0)}`);
