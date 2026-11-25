import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture(editing = false) {
  const actions = [],
    cache = new Map();
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((x) => file + x).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(
      (name) => {
        if (name === 'react' && editing)
          return {
            ...React,
            useState: (initial) => [
              initial === false ? true : initial,
              () => {},
            ],
          };
        if (name.endsWith('/app-text-field'))
          return {
            AppTextField: ({ label, value, disabled }) =>
              React.createElement(
                'label',
                null,
                label,
                React.createElement('input', {
                  value,
                  disabled,
                  readOnly: true,
                }),
              ),
          };
        if (name.endsWith('/app-button'))
          return {
            AppButton: ({ label, onPress, disabled }) => {
              actions.push({ label, onPress, disabled });
              return React.createElement('button', null, label);
            },
          };
        if (name.startsWith('.'))
          return load(path.resolve(path.dirname(file), name));
        return require(name);
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  return {
    actions,
    load,
    Component: load(
      path.resolve(
        'src/features/barbershop-operation/presentation/services-catalog-web.tsx',
      ),
    ).ServicesCatalogWeb,
  };
}
const services = [
  {
    id: 's',
    name: 'Corte <clásico>',
    description: 'Descripción real',
    durationMin: 30,
    active: true,
    price: { currency: 'PEN', amountMinor: 2500 },
  },
];
const base = {
  title: 'Local real',
  data: { services, professionals: [], capabilities: [], members: [] },
  loading: false,
  disabled: false,
  navigation: null,
  feedback: null,
  serviceName: '',
  description: '',
  price: '',
  duration: '',
  active: true,
  onName() {},
  onDescription() {},
  onPrice() {},
  onDuration() {},
  onActive() {},
  onSave() {},
  onNew() {},
  onEdit() {},
};
test('catalog uses real services, correct PEN prices and explicit preview/category limitations', () => {
  const f = fixture();
  const html = renderToStaticMarkup(React.createElement(f.Component, base));
  assert.match(html, /Corte &lt;clásico&gt;/);
  assert.match(html, /25\.00/);
  assert.match(html, /Visible/);
  assert.match(html, /Selecciona la categoría/);
  assert.match(html, /Vista previa/);
  assert.doesNotMatch(html, /Perfilado de barba|12 servicios|3 profesionales/);
  assert.equal(
    f.actions.find((a) => a.label === 'Reservar este servicio').disabled,
    true,
  );
});
test('catalog distinguishes no data from empty services and never invents examples', () => {
  const f = fixture();
  const loading = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      data: null,
      loading: true,
      disabled: true,
    }),
  );
  assert.match(loading, /Consultando servicios/);
  assert.doesNotMatch(loading, /Todavía no hay servicios/);
  const empty = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      data: { ...base.data, services: [] },
    }),
  );
  assert.match(empty, /Todavía no hay servicios/);
});
test('visual filters handle accents, derived categories and active/hidden services without mutating data', () => {
  const f = fixture();
  const { filterCatalog, serviceVisualCategory } = f.load(
    path.resolve(
      'src/features/barbershop-operation/presentation/services-catalog-web.tsx',
    ),
  );
  const list = [
    ...services,
    { ...services[0], id: 'b', name: 'Perfilado de barba', active: false },
  ];
  assert.equal(serviceVisualCategory('Corte + Barba'), 'Corte de cabello');
  assert.equal(serviceVisualCategory('Hidratación capilar'), 'Tratamientos');
  assert.equal(
    filterCatalog(list, 'clasico', 'Todos los servicios', 'all').length,
    1,
  );
  assert.equal(filterCatalog(list, '', 'Barba', 'inactive')[0].id, 'b');
  assert.equal(filterCatalog(list, '', 'Barba', 'active').length, 0);
  assert.equal(list[1].active, false);
});

test('catalog editor groups actual fields and menu exposes accessible icon-only edit/delete controls', () => {
  const f = fixture(true);
  const html = renderToStaticMarkup(
    React.createElement(f.Component, {
      ...base,
      category: 'Barba',
      onCategory() {},
      onDelete() {},
    }),
  );
  assert.match(html, /bx-services-editor-grid/);
  assert.match(
    html,
    /<option value="Barba" selected="">Barba<\/option>|<option selected="">Barba<\/option>/,
  );
  assert.match(html, /aria-label="Editar Corte &lt;clásico&gt;"/);
  assert.match(html, /aria-label="Eliminar Corte &lt;clásico&gt;"/);
  assert.doesNotMatch(html, />Editar servicio<\/button>/);
});
test('persisted category wins over name inference', () => {
  const f = fixture();
  const { filterCatalog } = f.load(
    path.resolve(
      'src/features/barbershop-operation/presentation/services-catalog-web.tsx',
    ),
  );
  assert.equal(
    filterCatalog([{ ...services[0], category: 'Barba' }], '', 'Barba', 'all')
      .length,
    1,
  );
  assert.equal(
    filterCatalog(
      [{ ...services[0], category: 'Barba' }],
      '',
      'Corte de cabello',
      'all',
    ).length,
    0,
  );
});
