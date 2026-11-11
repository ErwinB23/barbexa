import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import React, { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const nativeRequire = createRequire(path.join(root, 'package.json'));
const cache = new Map();
let viewState;
const buttons = [];
function load(file) {
  if (!fs.existsSync(file) && file.endsWith('.js'))
    file = file.slice(0, -3) + '.ts';
  if (!path.extname(file))
    file = ['.ts', '.tsx'].map((ext) => file + ext).find(fs.existsSync) ?? file;
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const require = (name) => {
    if (
      file.endsWith('technical-screen.tsx') &&
      name === './use-app-information'
    )
      return { useAppInformation: () => viewState };
    if (name === '@/shared/ui/status-message')
      return load(path.join(root, 'src/shared/ui/status-message.tsx'));
    if (name === 'react-native')
      return {
        View: ({ children }) => React.createElement('div', null, children),
        StyleSheet: { create: (styles) => styles },
      };
    if (
      name.startsWith('@/shared/ui/') ||
      (file.endsWith('status-message.tsx') &&
        ['./app-text', './app-button'].includes(name))
    )
      return {
        AppText: ({ children }) => React.createElement('span', null, children),
        Screen: ({ children }) =>
          React.createElement('section', null, children),
        AppButton: (props) => {
          buttons.push(props);
          return React.createElement(
            'button',
            { disabled: props.disabled },
            props.label,
          );
        },
      };
    if (name.startsWith('@/'))
      return load(path.join(root, 'src', name.slice(2)));
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

// ReactDOM real; el probe no genera nodos hijos. Host inerte, sin navegador ni RN.
const document = {
  nodeType: 9,
  addEventListener() {},
  removeEventListener() {},
  activeElement: null,
};
const window = { document, HTMLIFrameElement: class {}, event: undefined };
const container = () => ({
  nodeType: 1,
  tagName: 'DIV',
  nodeName: 'DIV',
  namespaceURI: 'http://www.w3.org/1999/xhtml',
  ownerDocument: document,
  addEventListener() {},
  removeEventListener() {},
  setAttribute() {},
  removeAttribute() {},
  style: {},
  textContent: '',
});
document.createElement = container;
document.documentElement = container();
document.body = container();
document.defaultView = window;
globalThis.window = window;
globalThis.document = document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = nativeRequire('react-dom/client');
const info = {
  nombre: 'App Barbería',
  version: '0.1.0',
  descripcion: 'Base local',
};
const success = { estado: 'ok', informacion: info };
const tick = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test('hook real: carga, exclusión de duplicados, error y reintento exitoso', async () => {
  const { useAppInformation } = load(
    path.join(
      root,
      'src/features/foundation/presentation/use-app-information.ts',
    ),
  );
  const { InformacionAplicacionContext: Context } = load(
    path.join(
      root,
      'src/features/foundation/presentation/information-context.ts',
    ),
  );
  const first = deferred();
  let calls = 0;
  const { ConsultarInformacionAplicacion } = load(
    path.join(
      root,
      'src/features/foundation/application/get-app-information.ts',
    ),
  );
  const consultar = ConsultarInformacionAplicacion({
    obtener: () => {
      calls += 1;
      return calls === 1
        ? first.promise.then(() => {
            throw new Error('fallo interno');
          })
        : Promise.resolve(info);
    },
  });
  let current;
  function Probe() {
    current = useAppInformation();
    return null;
  }
  const renderer = createRoot(container());
  try {
    await act(async () => {
      renderer.render(
        React.createElement(
          Context.Provider,
          { value: consultar },
          React.createElement(Probe),
        ),
      );
    });
    assert.equal(current.estado.estado, 'cargando');
    assert.equal(calls, 1);
    await act(async () => {
      await current.reintentar();
      await current.reintentar();
    });
    assert.equal(calls, 1);
    await act(async () => {
      first.resolve({ estado: 'no-disponible' });
      await tick();
    });
    assert.equal(current.estado.estado, 'error');
    await act(async () => {
      await current.reintentar();
    });
    assert.equal(current.estado.estado, 'exito');
    assert.equal(current.estado.informacion.nombre, info.nombre);
    assert.equal(calls, 2);
  } finally {
    await act(async () => renderer.unmount());
  }
});

test('composición real llega a éxito a través del contexto', async () => {
  const { useAppInformation } = load(
    path.join(
      root,
      'src/features/foundation/presentation/use-app-information.ts',
    ),
  );
  const { InformacionAplicacionContext: Context } = load(
    path.join(
      root,
      'src/features/foundation/presentation/information-context.ts',
    ),
  );
  const { CrearComposicionAplicacion } = load(
    path.join(root, 'src/composition/app-composition.ts'),
  );
  let current;
  function Probe() {
    current = useAppInformation();
    return null;
  }
  const renderer = createRoot(container());
  try {
    await act(async () => {
      renderer.render(
        React.createElement(
          Context.Provider,
          { value: CrearComposicionAplicacion(info) },
          React.createElement(Probe),
        ),
      );
      await tick();
    });
    assert.equal(current.estado.estado, 'exito');
    assert.equal(current.estado.informacion.version, '0.1.0');
  } finally {
    await act(async () => renderer.unmount());
  }
});

test('respuesta obsoleta no sustituye la consulta nueva ni actualiza tras desmontar', async () => {
  const { useAppInformation } = load(
    path.join(
      root,
      'src/features/foundation/presentation/use-app-information.ts',
    ),
  );
  const { InformacionAplicacionContext: Context } = load(
    path.join(
      root,
      'src/features/foundation/presentation/information-context.ts',
    ),
  );
  const old = deferred();
  const next = deferred();
  let nextCalls = 0;
  let current;
  let renders = 0;
  function Probe() {
    renders += 1;
    current = useAppInformation();
    return null;
  }
  const renderer = createRoot(container());
  await act(async () =>
    renderer.render(
      React.createElement(
        Context.Provider,
        { value: () => old.promise },
        React.createElement(Probe),
      ),
    ),
  );
  await act(async () =>
    renderer.render(
      React.createElement(
        Context.Provider,
        {
          value: () => {
            nextCalls += 1;
            return next.promise;
          },
        },
        React.createElement(Probe),
      ),
    ),
  );
  await act(async () => {
    old.resolve(success);
    await tick();
  });
  assert.equal(current.estado.estado, 'cargando');
  await act(async () => renderer.unmount());
  const before = renders;
  await act(async () => {
    next.resolve(success);
    await tick();
  });
  assert.equal(renders, before);
  assert.equal(current.estado.estado, 'cargando');
  await act(async () => {
    await current.reintentar();
  });
  assert.equal(nextCalls, 1);
});

test('pantalla comunica carga, datos reales y error con acción de recuperación', () => {
  const { TechnicalScreen } = load(
    path.join(
      root,
      'src/features/foundation/presentation/technical-screen.tsx',
    ),
  );
  let retries = 0;
  let backs = 0;
  for (const [estado, expected] of [
    [{ estado: 'cargando' }, 'Cargando información'],
    [{ estado: 'exito', informacion: info }, '0.1.0'],
    [{ estado: 'error' }, 'No pudimos cargar'],
  ]) {
    buttons.length = 0;
    viewState = {
      estado,
      reintentar: async () => {
        retries += 1;
      },
    };
    const html = renderToStaticMarkup(
      React.createElement(TechnicalScreen, {
        onBack: () => {
          backs += 1;
        },
      }),
    );
    assert.ok(html.includes(expected), html);
    for (const label of [
      'Muestras de componentes',
      'Muestra: carga',
      'Muestra: vacío',
      'Muestra: error',
      'Muestra: éxito',
    ]) {
      assert.ok(html.includes(label), `Galería ausente: ${label}`);
    }
    const back = buttons.find((button) => button.label === 'Volver al inicio');
    assert.ok(back);
    back.onPress();
    const retry = buttons.find((button) => button.label === 'Reintentar');
    assert.equal(Boolean(retry), estado.estado === 'error');
    retry?.onPress();
  }
  assert.equal(retries, 1);
  assert.equal(backs, 3);
});

test('galería recupera y restablece solo su muestra sin reconsultar el caso de uso', async () => {
  const { TechnicalScreen } = load(
    path.join(
      root,
      'src/features/foundation/presentation/technical-screen.tsx',
    ),
  );
  let queryRetries = 0;
  viewState = {
    estado: { estado: 'exito', informacion: info },
    reintentar: () => {
      queryRetries++;
    },
  };
  let tree;
  function Probe() {
    tree = TechnicalScreen({ onBack: () => {} });
    return null;
  }
  function nodes(element) {
    if (!element || typeof element !== 'object') return [];
    return [
      element,
      ...React.Children.toArray(element.props?.children).flatMap(nodes),
    ];
  }
  const renderer = createRoot(container());
  try {
    await act(async () => renderer.render(React.createElement(Probe)));
    const sample = nodes(tree).find(
      (n) => n.props.retryLabel === 'Reintentar muestra',
    );
    assert.ok(sample);
    await act(async () => sample.props.onRetry());
    assert.ok(
      nodes(tree).some(
        (n) => n.props.message === 'Muestra recuperada correctamente.',
      ),
    );
    const reset = nodes(tree).find(
      (n) => n.props.label === 'Restablecer muestra de error',
    );
    assert.ok(reset);
    await act(async () => reset.props.onPress());
    assert.ok(
      nodes(tree).some((n) => n.props.retryLabel === 'Reintentar muestra'),
    );
    assert.equal(queryRetries, 0);
  } finally {
    await act(async () => renderer.unmount());
  }
});

for (const [name, consultar] of [
  ['sin proveedor', null],
  [
    'rechazo inesperado',
    async () => {
      throw new Error('detalle interno');
    },
  ],
]) {
  test(`hook convierte ${name} en error visible controlado`, async () => {
    const { useAppInformation } = load(
      path.join(
        root,
        'src/features/foundation/presentation/use-app-information.ts',
      ),
    );
    const { InformacionAplicacionContext: Context } = load(
      path.join(
        root,
        'src/features/foundation/presentation/information-context.ts',
      ),
    );
    let current;
    function Probe() {
      current = useAppInformation();
      return null;
    }
    const renderer = createRoot(container());
    try {
      await act(async () => {
        renderer.render(
          React.createElement(
            Context.Provider,
            { value: consultar },
            React.createElement(Probe),
          ),
        );
        await tick();
      });
      assert.equal(current.estado.estado, 'error');
      assert.deepEqual(Object.keys(current.estado), ['estado']);
    } finally {
      await act(async () => renderer.unmount());
    }
  });
}
