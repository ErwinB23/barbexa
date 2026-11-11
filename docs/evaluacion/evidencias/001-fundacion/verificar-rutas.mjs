// Verifica el cableado real de callbacks; no sustituye un recorrido en Expo/Android.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const nativeRequire = createRequire(path.join(root, 'package.json'));
const calls = [];
let backAvailable = true;
const router = {
  push: (href) => calls.push(['push', href]),
  replace: (href) => calls.push(['replace', href]),
  back: () => calls.push(['back']),
  canGoBack: () => backAvailable,
};
const Stack = Object.assign(() => null, { Screen: 'StackScreen' });
function load(file) {
  if (!path.extname(file)) file = ['.tsx', '.ts'].map((ext) => file + ext).find(fs.existsSync) ?? file;
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const require = (name) => {
    if (name === 'expo-router') return { useRouter: () => router, Stack };
    if (name === 'react-native') return { View: 'View', StyleSheet: { create: (styles) => styles } };
    // No se renderizan primitivas nativas en Node: se inspeccionan props y callbacks.
    if (name.startsWith('@/shared/ui/') && !name.endsWith('/tokens')) {
      return { AppText: 'AppText', AppButton: 'AppButton', Screen: 'Screen' };
    }
    if (name.startsWith('@/')) return load(path.join(root, 'src', name.slice(2)));
    return nativeRequire(name);
  };
  if (!fs.existsSync(file)) throw new Error(`Archivo ausente: ${file}`);
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {}, { filename: file })(require, module, module.exports);
  return module.exports;
}
// Resolver extensiones para módulos TS/TSX sin alterar el proyecto.
const resolve = (relative) => path.join(root, 'src/app', relative);
// Las vistas importadas usan rutas sin extensión.
const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json')));
assert.ok(config.expo.plugins.includes('expo-router'));
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).main, 'expo-router/entry');
for (const [route, callback, expected] of [
  ['index.tsx', 'onOpenTechnical', ['push', '/technical']],
  ['technical.tsx', 'onBack', ['back']],
  ['+not-found.tsx', 'onGoHome', ['replace', '/']],
]) {
  const element = load(resolve(route)).default();
  element.props[callback]();
  assert.deepEqual(calls.pop(), expected);
  const view = element.type(element.props);
  const buttons = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'AppButton') buttons.push(node);
    for (const child of [node.props?.children].flat()) visit(child);
  }
  visit(view);
  assert.equal(buttons.length, 1);
  buttons[0].props.onPress();
  assert.deepEqual(calls.pop(), expected);
  console.log(`${route}: callback de ruta y botón de vista correctos`);
}
backAvailable = false;
load(resolve('technical.tsx')).default().props.onBack();
assert.deepEqual(calls.pop(), ['replace', '/']);
const layout = load(resolve('_layout.tsx'));
assert.equal(layout.unstable_settings.initialRouteName, 'index');
assert.deepEqual(Array.from(layout.default().props.children, (child) => child.props.name), ['index', 'technical', '+not-found']);
console.log('Fallback sin historial, Stack, ruta inicial y configuración Router correctos.');
