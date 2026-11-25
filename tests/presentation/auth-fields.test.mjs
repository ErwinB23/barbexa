import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function fixture(platform) {
  const observed = [];
  const cache = new Map();
  const primitive = (kind) =>
    function Primitive(props) {
      observed.push({ kind, props });
      return React.createElement(
        kind === 'TextInput' ? 'input' : 'div',
        kind === 'TextInput'
          ? {
              'aria-label': props.accessibilityLabel,
              value: props.value,
              readOnly: true,
            }
          : {},
        kind === 'TextInput' ? undefined : props.children,
      );
    };
  const native = {
    Platform: { OS: 'android' },
    View: primitive('View'),
    Text: primitive('Text'),
    TextInput: primitive('TextInput'),
    StyleSheet: { create: (s) => s },
  };
  function load(file) {
    if (!path.extname(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync) ?? file;
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const resolve = (name) =>
      name === 'react-native'
        ? platform === 'web'
          ? require('react-native-web')
          : native
        : name.startsWith('.')
          ? load(path.resolve(path.dirname(file), name))
          : require(name);
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      resolve,
      module,
      module.exports,
    );
    return module.exports;
  }
  const { AppTextField } = load(
    path.resolve('src/shared/ui/app-text-field.tsx'),
  );
  return {
    observed,
    render: (props) =>
      renderToStaticMarkup(React.createElement(AppTextField, props)),
  };
}
test('Web: actual RN Web output associates the label, hint and readable error without raw HTML', () => {
  const f = fixture('web');
  const html = f.render({
    id: 'email',
    label: 'Correo de prueba',
    value: '',
    onChangeText() {},
    hint: 'Solo prueba local',
    error: '<script>example</script>',
    keyboardType: 'email-address',
  });
  assert.match(html, /aria-label="Correo de prueba"/);
  assert.match(html, /aria-describedby="email-hint email-error"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /&lt;script&gt;example&lt;\/script&gt;/);
  assert.equal(html.includes('<script>'), false);
  assert.match(html, /id="email-error"/);
});
test('Web: password and disabled semantics remain input semantics, not simulated controls', () => {
  const f = fixture('web');
  const html = f.render({
    id: 'password',
    label: 'Clave ficticia',
    value: '',
    onChangeText() {},
    secureTextEntry: true,
    disabled: true,
  });
  assert.match(html, /type="password"/);
  assert.match(html, /(?:readOnly|readonly|disabled)/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /\sdisabled=""/);
});
test('Android boundary: controlled value, keyboard/focus callbacks, scaling and minimum 48dp are preserved', () => {
  const f = fixture('android');
  let value,
    focused = 0,
    submitted = 0;
  f.render({
    id: 'email',
    label: 'Correo',
    value: 'test@example.invalid',
    onChangeText: (v) => {
      value = v;
    },
    keyboardType: 'email-address',
    onFocus: () => focused++,
    onSubmitEditing: () => submitted++,
  });
  const input = f.observed.find((x) => x.kind === 'TextInput').props;
  assert.equal(input.value, 'test@example.invalid');
  assert.equal(input.keyboardType, 'email-address');
  assert.equal(input.accessibilityLabel, 'Correo');
  assert.equal(input.accessibilityLabelledBy, 'email-label');
  assert.equal(input.allowFontScaling, true);
  assert.equal(input.maxFontSizeMultiplier, 0);
  const style = Object.assign({}, ...input.style.flat().filter(Boolean));
  assert.ok(style.minHeight >= 48 && style.minWidth >= 48);
  input.onChangeText('new@example.invalid');
  input.onFocus({});
  input.onSubmitEditing({});
  assert.equal(value, 'new@example.invalid');
  assert.equal(focused, 1);
  assert.equal(submitted, 1);
});
test('Android boundary: error text is accessible, disabled prevents edits, and passwords are obscured', () => {
  const f = fixture('android');
  f.render({
    id: 'password',
    label: 'Clave',
    value: '',
    onChangeText() {},
    secureTextEntry: true,
    disabled: true,
    error: 'Revisa este campo',
  });
  const input = f.observed.find((x) => x.kind === 'TextInput').props;
  assert.equal(input.editable, false);
  assert.equal(input.secureTextEntry, true);
  assert.equal(input.accessibilityState.disabled, true);
  assert.ok(input.accessibilityHint.includes('Revisa este campo'));
  const error = f.observed.find(
    (x) => x.kind === 'Text' && x.props.nativeID === 'password-error',
  );
  assert.equal(error.props.accessibilityLiveRegion, 'polite');
});
