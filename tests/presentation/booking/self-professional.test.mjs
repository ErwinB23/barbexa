import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture(platform) {
  const controls = [],
    cache = new Map();
  const primitive = (kind) =>
    function Control(props) {
      controls.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (n) =>
        n === 'react-native'
          ? {
              View: primitive('View'),
              Text: primitive('Text'),
              TextInput: primitive('TextInput'),
              Pressable: primitive('Pressable'),
              Platform: { OS: platform },
              StyleSheet: { create: (s) => s },
            }
          : n.startsWith('.')
            ? load(path.resolve(path.dirname(file), n))
            : require(n),
      m,
      m.exports,
    );
    return m.exports;
  }
  const { SelfProfessionalContent } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/self-professional.tsx',
    ),
  );
  return {
    controls,
    render(props) {
      controls.length = 0;
      return renderToStaticMarkup(
        React.createElement(SelfProfessionalContent, props),
      );
    },
  };
}
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' own professional exposes only name, accessible busy controls and safe empty/error states',
    () => {
      const f = fixture(platform);
      let saves = 0;
      const props = {
        available: true,
        name: 'Own',
        busy: false,
        error: null,
        saved: false,
        checked: true,
        onName() {},
        onRead() {},
        onSave() {
          saves++;
        },
      };
      f.render(props);
      const inputs = f.controls.filter((c) => c.kind === 'TextInput');
      assert.equal(inputs.length, 1);
      assert.equal(inputs[0].props.accessibilityLabel, 'Mi nombre profesional');
      f.controls
        .find(
          (c) => c.props.accessibilityLabel === 'Guardar mi perfil profesional',
        )
        .props.onPress();
      assert.equal(saves, 1);
      f.render({ ...props, busy: true });
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
      f.controls
        .find(
          (c) => c.props.accessibilityLabel === 'Guardar mi perfil profesional',
        )
        .props.onPress?.();
      assert.equal(saves, 1);
      assert.ok(
        f
          .render({ ...props, available: false, error: 'No disponible' })
          .includes('No disponible'),
      );
      assert.equal(f.controls.filter((c) => c.kind === 'TextInput').length, 0);
      assert.ok(
        f
          .render({ ...props, available: false })
          .includes('No hay un perfil profesional activo'),
      );
    },
  );
}
