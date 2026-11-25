import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
export function createCoreLoader() {
  const cache = new Map();
  const load = (p) => {
    p = path.resolve(p.replace(/\.js$/, '.ts'));
    if (!path.extname(p)) p += '.ts';
    // Coverage uses the same tsc output as unit tests, with a real V8 filename.
    // Production modules remain unchanged; uncompiled adapters keep the VM loader.
    const emitted = path
      .resolve('.test-build', path.relative(process.cwd(), p))
      .replace(/\.ts$/, '.js');
    if (process.env.BARBEXA_CORE_COVERAGE === '1' && fs.existsSync(emitted)) {
      return createRequire(import.meta.url)(emitted);
    }
    if (cache.has(p)) return cache.get(p).exports;
    const module = { exports: {} };
    cache.set(p, module);
    const code = ts.transpileModule(fs.readFileSync(p, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
      URL,
      AbortController,
      AbortSignal,
      atob,
      fetch,
      setTimeout,
      clearTimeout,
      Date,
      Object,
      Promise,
    })(
      (n) => {
        if (!n.startsWith('.')) throw Error('CORE_EXTERNAL_IMPORT');
        return load(path.resolve(path.dirname(p), n));
      },
      module,
      module.exports,
    );
    return module.exports;
  };
  return load;
}
export function loadCore(file) {
  return createCoreLoader()(file);
}
