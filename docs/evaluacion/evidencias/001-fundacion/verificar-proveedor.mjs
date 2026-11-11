// Integración real React/contexto/caso de uso. No renderiza Android ni RN.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const nativeRequire = createRequire(path.join(root, 'package.json'));
const cache = new Map();
const Stack = Object.assign(() => null, { Screen: () => null });
function load(file) {
  if (!fs.existsSync(file) && file.endsWith('.js')) file = file.slice(0, -3) + '.ts';
  if (!path.extname(file)) file = ['.tsx', '.ts'].map((ext) => file + ext).find(fs.existsSync) ?? file;
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const require = (name) => {
    if (name === 'expo-router') return { Stack };
    if (name.startsWith('@/')) return load(path.join(root, 'src', name.slice(2)));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return nativeRequire(name);
  };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {}, { filename: file })(require, module, module.exports);
  return module.exports;
}
const { AppProvider } = load(path.join(root, 'src/composition/app-provider.tsx'));
const { InformacionAplicacionContext } = load(path.join(root, 'src/features/foundation/presentation/information-context.ts'));
let consultar;
function Consumer() {
  consultar = React.useContext(InformacionAplicacionContext);
  return React.createElement('span', null, 'consumidor');
}
assert.equal(renderToStaticMarkup(React.createElement(AppProvider, null, React.createElement(Consumer))), '<span>consumidor</span>');
assert.equal(typeof consultar, 'function');
const resultado = await consultar({ idioma: 'es-PE' });
const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'))).expo;
assert.equal(resultado.estado, 'ok');
assert.equal(resultado.informacion.nombre, config.name);
assert.equal(resultado.informacion.version, config.version);
assert.equal(resultado.informacion.descripcion, 'Fundación técnica de App Barbería');
assert.equal((await consultar({ idioma: '' })).estado, 'entrada-invalida');
console.log('Proveedor real entrega solo la función del caso de uso y conserva children; consulta válida/inválida comprobadas.');
const layout = load(path.join(root, 'src/app/_layout.tsx')).default();
assert.equal(layout.type, AppProvider);
assert.equal(layout.props.children.type, Stack);
assert.deepEqual(Array.from(layout.props.children.props.children, (child) => child.props.name), ['index', 'technical', '+not-found']);
console.log('Layout monta proveedor y conserva Stack y sus tres rutas. Router sustituido solo en la frontera.');
