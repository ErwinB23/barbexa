import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const file = path.join(dir, e.name);
  if (e.isSymbolicLink()) throw new Error('Enlace no verificable');
  return e.isDirectory() ? walk(file) : [file];
});
const relative = (file) => path.relative(root, file).replaceAll(path.sep, '/');
const sources = walk(path.join(root, 'src')).filter((f) => /\.tsx?$/.test(f));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const findings = [];
const imports = [];
for (const file of sources) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const dependency = node.moduleSpecifier.text;
      imports.push({ file: relative(file), dependency, typeOnly: node.importClause?.isTypeOnly === true });
      if (/supabase|resend|^(node:)?(http|https|net|express|fastify|koa)$/.test(dependency)) findings.push({file:relative(file), rule:'backend-import'});
    }
    if (ts.isCallExpression(node) && /^(fetch|XMLHttpRequest|WebSocket|createServer|createClient)$/.test(node.expression.getText(source))) findings.push({file:relative(file),rule:'remote-or-server-call'});
    ts.forEachChild(node, visit);
  };
  visit(source);
}
const dependencies = Object.keys({...manifest.dependencies, ...manifest.devDependencies});
const sdkInstalled = Object.keys(lock.packages ?? {}).filter((p) => /node_modules\/@supabase\//.test(p));
if (dependencies.some((d) => /supabase|resend|^(express|fastify|koa)$/.test(d)) || sdkInstalled.length) findings.push({rule:'backend-package'});
const apiRoutes = sources.filter((f) => /\+api\.[^/]+$/.test(f)).map(relative);
const supabaseFolders = ['supabase', 'src/supabase'].filter((p) => fs.existsSync(path.join(root,p)));
if (apiRoutes.length || supabaseFolders.length) findings.push({rule:'backend-path'});
// Búsqueda acotada: nunca imprimir valores que pudieran ser secretos.
const inspected = [...sources, ...['app.json','package.json'].map((p) => path.join(root,p))];
const signatures = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /\bsb_secret_[A-Za-z0-9_-]+/, /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, /(?:service_role|SUPABASE_SERVICE_ROLE_KEY)\s*[:=]\s*['"][^'"]+['"]/];
for (const file of inspected) if (signatures.some((p) => p.test(fs.readFileSync(file,'utf8')))) findings.push({file:relative(file),rule:'possible-secret'});
console.log(JSON.stringify({sourceModules:sources.length, imports, dependencies, sdkInstalled, apiRoutes, supabaseFolders, secretFilesInspected:inspected.length, findings, limitation:'Inspección acotada a código cliente, manifiestos y firmas conocidas; no auditoría integral de secretos ni seguridad.'}, null, 2));
process.exitCode = findings.length ? 1 : 0;
